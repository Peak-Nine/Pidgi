/**
 * Deal won → Teamleader project, from Slack.
 *
 * Same flow as the Cowork "deal-won" skill:
 *   1. mark the quotation accepted and the deal won
 *   2. create the project (customer from the deal), link deal + quotation, assign the owner
 *   3. one group per gate: fixed price = gate revenue, internal budget = 60% of it
 *   4. deliverable tasks with hour estimates inside each group (parent_fixed_price)
 *
 * The model only PROPOSES (tool `propose_project_launch`). Code checks the proposal against
 * Teamleader, does the budget maths and posts a card. Nothing is written to Teamleader until
 * someone on the write allowlist clicks the card's button, because winning a deal can't be undone.
 *
 * Every step's result is saved as it happens. If a step fails, the run stops, the card says what
 * was done and what failed, and "Retry the rest" picks up where it stopped (no duplicate project).
 *
 * Plans live in Pidgi's data folder (PIDGI_DATA_DIR, or /var/data on a Render disk).
 */
import { writeFileSync, readFileSync, existsSync, readdirSync, mkdirSync } from "fs";
import path from "path";
import os from "os";
import { randomBytes } from "crypto";

/** Internal cost budget as a share of gate revenue (protects margin). */
export const INTERNAL_BUDGET_SHARE = 0.6;
/** Niels, the default project assignee in the deal-won skill. */
export const DEFAULT_OWNER_ID = process.env.PIDGI_PROJECT_OWNER_ID || "1dc0408f-6a00-0039-a953-c67fcb7767f8";
export const PLACEHOLDER_TASK = "Scope to be defined after the go/no-go of the previous gate";

export interface LaunchTask {
  title: string;
  /** null = the offer gives no hours for this deliverable; the task is created without an estimate. */
  hours: number | null;
}
export interface LaunchGroup {
  title: string;
  /** What the client pays for this gate, excl. VAT. 0 for a placeholder gate. */
  revenue: number;
  start_date: string | null;
  end_date: string | null;
  placeholder: boolean;
  tasks: LaunchTask[];
}
export interface LaunchProgress {
  accepted?: boolean;
  won?: boolean;
  project_id?: string;
  deal_linked?: boolean;
  quotation_linked?: boolean;
  assigned?: boolean;
  groups: { id?: string; tasks_done: number }[];
  error?: string;
}
export interface LaunchPlan {
  id: string;
  requester: string;
  channel: string;
  thread_ts?: string;
  card_ts?: string;
  created: number;
  status: "draft" | "running" | "done" | "partial" | "discarded";
  by?: string;
  deal_id: string;
  deal_title: string;
  quotation_id: string;
  customer_type: "company" | "contact";
  customer_id: string;
  customer_name: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string | null;
  owner_id: string;
  groups: LaunchGroup[];
  /** Things the person clicking should know (totals that don't match, missing hours, ...). */
  warnings: string[];
  progress: LaunchProgress;
}

/** Calls one Teamleader MCP tool (without the "teamleader_" prefix) and returns its parsed JSON. */
export type TlCall = (tool: string, args: any) => Promise<any>;

// ── Maths ────────────────────────────────────────────────────────────────────

export function euros(n: number): number {
  return Math.round(Number(n) || 0);
}
export function internalBudget(revenue: number): number {
  return Math.round((Number(revenue) || 0) * INTERNAL_BUDGET_SHARE);
}
export function totals(groups: LaunchGroup[]) {
  const real = groups.filter((g) => !g.placeholder);
  const revenue = real.reduce((s, g) => s + euros(g.revenue), 0);
  const budget = real.reduce((s, g) => s + internalBudget(euros(g.revenue)), 0);
  return { revenue, budget };
}
function groupHours(g: LaunchGroup): number {
  return g.tasks.reduce((s, t) => s + (t.hours ?? 0), 0);
}
export function fmtEur(n: number): string {
  const s = Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `€${s}`;
}

// ── Checking the model's proposal ────────────────────────────────────────────

const ISO = /^\d{4}-\d{2}-\d{2}$/;
function isoDate(v: any): string | null {
  const s = String(v ?? "").trim().slice(0, 10);
  if (!ISO.test(s)) return null;
  const d = new Date(s + "T12:00:00Z");
  return isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== s ? null : s;
}
const clean = (v: any, max = 200) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);

/**
 * Turn the model's tool input into groups, or say exactly what's wrong so the model can fix it.
 * Amounts are rounded to whole euros; nothing is estimated here.
 */
export function normaliseGroups(input: any): { groups: LaunchGroup[]; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const raw = Array.isArray(input?.groups) ? input.groups : [];
  if (!raw.length) errors.push("groups is empty: give one group per gate or phase from the offer.");
  if (raw.length > 12) errors.push("More than 12 groups; that doesn't look like a gate structure.");
  const groups: LaunchGroup[] = raw.slice(0, 12).map((g: any, i: number) => {
    const n = i + 1;
    const title = clean(g?.title, 150);
    if (!title) errors.push(`Group ${n} has no title.`);
    const placeholder = g?.placeholder === true;
    let revenue = Number(g?.revenue);
    if (placeholder) revenue = 0;
    else if (!Number.isFinite(revenue) || revenue < 0) {
      errors.push(`Group ${n} ("${title}") needs its revenue in euros excl. VAT, as written in the offer or quotation.`);
      revenue = 0;
    } else if (revenue === 0) {
      warnings.push(`"${title}" has €0 revenue but isn't marked as a placeholder.`);
    }
    const start = g?.start_date ? isoDate(g.start_date) : null;
    const end = g?.end_date ? isoDate(g.end_date) : null;
    if (g?.start_date && !start) errors.push(`Group ${n} start_date "${g.start_date}" is not a YYYY-MM-DD date.`);
    if (g?.end_date && !end) errors.push(`Group ${n} end_date "${g.end_date}" is not a YYYY-MM-DD date.`);
    if (start && end && end < start) errors.push(`Group ${n} ends before it starts.`);
    const rawTasks = Array.isArray(g?.tasks) ? g.tasks : [];
    if (rawTasks.length > 60) errors.push(`Group ${n} has more than 60 tasks.`);
    const tasks: LaunchTask[] = rawTasks.slice(0, 60).map((t: any, j: number) => {
      const tt = clean(t?.title, 200);
      if (!tt) errors.push(`Group ${n}, task ${j + 1} has no title.`);
      let hours: number | null = t?.hours === null || t?.hours === undefined || t?.hours === "" ? null : Number(t.hours);
      if (hours !== null && (!Number.isFinite(hours) || hours < 0)) {
        errors.push(`Group ${n}, task "${tt}": hours must be a number (or null when the offer gives none).`);
        hours = null;
      }
      if (hours !== null) hours = Math.round(hours * 100) / 100;
      return { title: tt, hours };
    });
    if (placeholder && !tasks.length) tasks.push({ title: PLACEHOLDER_TASK, hours: 0 });
    if (!placeholder && !tasks.length) warnings.push(`"${title}" has no deliverable tasks.`);
    const noHours = tasks.filter((t) => t.hours === null).length;
    if (noHours) warnings.push(`${noHours} task(s) in "${title}" have no hours in the offer; they'll be created without an estimate.`);
    return { title, revenue: euros(revenue), start_date: start, end_date: end, placeholder, tasks };
  });
  return { groups, errors, warnings };
}

function dataOf(x: any): any {
  return x && typeof x === "object" && "data" in x ? x.data : x;
}
function amountOf(v: any): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return v;
  if (typeof v === "object" && v.amount !== undefined) return Number(v.amount);
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** What Teamleader says about the deal and quotation, folded into checks and warnings. */
export function checkAgainstTeamleader(
  groups: LaunchGroup[],
  dealRaw: any,
  quotationRaw: any,
  dealId: string
): { errors: string[]; warnings: string[]; deal: any; quotation: any } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const deal = dataOf(dealRaw) || {};
  const quotation = dataOf(quotationRaw) || {};
  const qDeal = quotation?.deal?.id;
  if (qDeal && qDeal !== dealId) errors.push(`Quotation belongs to another deal (${qDeal}), not ${dealId}.`);
  if (!deal?.customer?.id) errors.push("The deal has no customer in Teamleader, so the project has nobody to belong to.");
  const qTotal = amountOf(quotation?.total?.tax_exclusive);
  const { revenue } = totals(groups);
  if (qTotal === null) {
    warnings.push("I couldn't read the quotation total, so the gate amounts are not checked against it.");
  } else if (Math.abs(euros(qTotal) - revenue) > 1) {
    warnings.push(`Gate revenues add up to ${fmtEur(revenue)}, the quotation total is ${fmtEur(qTotal)} excl. VAT. Check which one is right before you click.`);
  }
  return { errors, warnings, deal, quotation };
}

// ── Storage ──────────────────────────────────────────────────────────────────

function baseDir(): string {
  if (process.env.PIDGI_DATA_DIR) return process.env.PIDGI_DATA_DIR;
  try {
    if (existsSync("/var/data")) return "/var/data";
  } catch {
    /* ignore */
  }
  return os.tmpdir();
}
function dir(): string {
  const d = path.join(baseDir(), "launches");
  try {
    mkdirSync(d, { recursive: true });
  } catch {
    /* ignore */
  }
  return d;
}
const safe = (id: string) => String(id).replace(/[^a-z0-9]/gi, "").slice(0, 40);
export function savePlan(p: LaunchPlan): void {
  writeFileSync(path.join(dir(), `${safe(p.id)}.json`), JSON.stringify(p));
}
export function loadPlan(id: string): LaunchPlan | null {
  try {
    return JSON.parse(readFileSync(path.join(dir(), `${safe(id)}.json`), "utf8"));
  } catch {
    return null;
  }
}
/** Another card for the same deal that already created (or is creating) a project. */
export function otherLaunchForDeal(dealId: string, exceptId: string): LaunchPlan | null {
  try {
    for (const f of readdirSync(dir())) {
      if (!f.endsWith(".json")) continue;
      const p = loadPlan(f.replace(/\.json$/, ""));
      if (p && p.id !== exceptId && p.deal_id === dealId && (p.progress?.project_id || p.status === "running")) return p;
    }
  } catch {
    /* no folder yet */
  }
  return null;
}

// ── Building a plan (called from the model's tool) ───────────────────────────

export interface ProposeContext {
  requester: string;
  channel: string;
  thread_ts?: string;
}

export async function buildPlan(input: any, ctx: ProposeContext, tl: TlCall): Promise<{ plan?: LaunchPlan; errors: string[] }> {
  const errors: string[] = [];
  const dealId = clean(input?.deal_id, 60);
  const quotationId = clean(input?.quotation_id, 60);
  const start = isoDate(input?.start_date);
  if (!dealId) errors.push("deal_id is missing: find the deal with teamleader_list_deals first.");
  if (!quotationId) errors.push("quotation_id is missing: find it with teamleader_list_quotations or teamleader_get_deal.");
  if (!start) errors.push("start_date is missing or not YYYY-MM-DD: ask when Gate 1 starts.");
  const end = input?.end_date ? isoDate(input.end_date) : null;
  const g = normaliseGroups(input);
  errors.push(...g.errors);
  if (errors.length) return { errors };

  let dealRaw: any, quotationRaw: any;
  try {
    dealRaw = await tl("get_deal", { id: dealId });
  } catch (e: any) {
    return { errors: [`Teamleader couldn't find deal ${dealId}: ${e?.message || e}`] };
  }
  try {
    quotationRaw = await tl("get_quotation", { id: quotationId });
  } catch (e: any) {
    return { errors: [`Teamleader couldn't find quotation ${quotationId}: ${e?.message || e}`] };
  }
  const chk = checkAgainstTeamleader(g.groups, dealRaw, quotationRaw, dealId);
  if (chk.errors.length) return { errors: chk.errors };

  const customerType = chk.deal.customer.type === "contact" ? "contact" : "company";
  let customerName = "";
  try {
    const c = dataOf(await tl(customerType === "company" ? "get_company" : "get_contact", { id: chk.deal.customer.id }));
    customerName = c?.name || [c?.first_name, c?.last_name].filter(Boolean).join(" ");
  } catch {
    /* only used on the card */
  }

  const warnings = [...g.warnings, ...chk.warnings];
  const already = { accepted: chk.quotation?.status === "accepted", won: chk.deal?.status === "won" };
  if (already.won) warnings.push("The deal is already marked won in Teamleader; that step will be skipped.");
  if (already.accepted) warnings.push("The quotation is already accepted; that step will be skipped.");
  const earlier = otherLaunchForDeal(dealId, "");
  if (earlier?.progress?.project_id) {
    warnings.push(`A project was already created for this deal from an earlier card (${projectUrl(earlier.progress.project_id)}). Clicking would make a second one.`);
  }

  const dealTitle = clean(chk.deal?.title, 200);
  const plan: LaunchPlan = {
    id: randomBytes(8).toString("hex"),
    requester: ctx.requester,
    channel: ctx.channel,
    thread_ts: ctx.thread_ts,
    created: Date.now(),
    status: "draft",
    deal_id: dealId,
    deal_title: dealTitle,
    quotation_id: quotationId,
    customer_type: customerType,
    customer_id: chk.deal.customer.id,
    customer_name: customerName,
    title: clean(input?.title, 200) || dealTitle,
    description: clean(input?.description, 500),
    start_date: start!,
    end_date: end,
    owner_id: clean(input?.owner_id, 60) || DEFAULT_OWNER_ID,
    groups: g.groups,
    warnings,
    progress: {
      accepted: already.accepted || undefined,
      won: already.won || undefined,
      groups: g.groups.map(() => ({ tasks_done: 0 })),
    },
  };
  if (!plan.title) return { errors: ["The project needs a title (the deal has none)."] };
  return { plan, errors: [] };
}

// ── Running it (after the click) ─────────────────────────────────────────────

export function projectUrl(id: string): string {
  return `https://focus.teamleader.eu/projects/${id}/work-breakdown`;
}
function idOf(raw: any): string {
  const d = dataOf(raw);
  return String(d?.id || "");
}

/**
 * Do every step that isn't done yet, saving after each one. Stops at the first failure
 * and leaves the plan "partial", so the next run continues from there.
 */
export async function executePlan(p: LaunchPlan, tl: TlCall, save: (p: LaunchPlan) => void = savePlan): Promise<LaunchPlan> {
  const pr = p.progress;
  pr.error = undefined;
  p.status = "running";
  save(p);
  const step = async (label: string, fn: () => Promise<void>) => {
    try {
      await fn();
      save(p);
    } catch (e: any) {
      pr.error = `${label}: ${e?.message || e}`;
      throw e;
    }
  };
  try {
    if (!pr.accepted) await step("Accept the quotation", async () => { await tl("accept_quotation", { id: p.quotation_id }); pr.accepted = true; });
    if (!pr.won) await step("Mark the deal won", async () => { await tl("win_deal", { id: p.deal_id }); pr.won = true; });
    if (!pr.project_id) {
      await step("Create the project", async () => {
        const args: any = { title: p.title, customer_type: p.customer_type, customer_id: p.customer_id, start_date: p.start_date };
        if (p.description) args.description = p.description;
        if (p.end_date) args.end_date = p.end_date;
        const id = idOf(await tl("create_project_v2", args));
        if (!id) throw new Error("Teamleader returned no project id");
        pr.project_id = id;
      });
    }
    const projectId = pr.project_id!;
    if (!pr.deal_linked) await step("Link the deal", async () => { await tl("add_project_deal", { id: projectId, deal_id: p.deal_id }); pr.deal_linked = true; });
    if (!pr.quotation_linked) await step("Link the quotation", async () => { await tl("add_project_quotation", { id: projectId, quotation_id: p.quotation_id }); pr.quotation_linked = true; });
    if (!pr.assigned) await step("Assign the project owner", async () => { await tl("assign_project", { id: projectId, assignee_type: "user", assignee_id: p.owner_id }); pr.assigned = true; });

    for (let i = 0; i < p.groups.length; i++) {
      const g = p.groups[i];
      const gp = pr.groups[i] || (pr.groups[i] = { tasks_done: 0 });
      if (!gp.id) {
        await step(`Create group "${g.title}"`, async () => {
          const args: any = {
            project_id: projectId,
            title: g.title,
            billing_method: "fixed_price",
            fixed_price_amount: euros(g.revenue),
            fixed_price_currency: "EUR",
            internal_budget_amount: g.placeholder ? 0 : internalBudget(g.revenue),
            internal_budget_currency: "EUR",
          };
          if (g.start_date) args.start_date = g.start_date;
          if (g.end_date) args.end_date = g.end_date;
          const id = idOf(await tl("create_project_group", args));
          if (!id) throw new Error("Teamleader returned no group id");
          gp.id = id;
        });
      }
      for (let j = gp.tasks_done; j < g.tasks.length; j++) {
        const t = g.tasks[j];
        await step(`Create task "${t.title}" in "${g.title}"`, async () => {
          const args: any = { project_id: projectId, project_group_id: gp.id, title: t.title, billing_method: "parent_fixed_price" };
          if (t.hours !== null) {
            args.time_estimated_value = t.hours;
            args.time_estimated_unit = "hours";
          }
          await tl("create_project_task_v2", args);
          gp.tasks_done = j + 1;
        });
      }
    }
    p.status = "done";
  } catch {
    p.status = "partial";
  }
  save(p);
  return p;
}

// ── Slack card ───────────────────────────────────────────────────────────────

export const L = {
  go: "p9launch_go",
  discard: "p9launch_discard",
};

function groupLine(g: LaunchGroup): string {
  const dates = g.start_date ? ` · ${g.start_date}${g.end_date ? ` → ${g.end_date}` : " → open"}` : "";
  if (g.placeholder) return `*${g.title}*${dates}\nPlaceholder: €0 fixed price, €0 internal budget`;
  const hrs = groupHours(g);
  const head = `*${g.title}*${dates}\nFixed price ${fmtEur(g.revenue)} · internal budget ${fmtEur(internalBudget(g.revenue))} (60%) · ${g.tasks.length} task(s), ${hrs}h`;
  const tasks = g.tasks.map((t) => `• ${t.title} (${t.hours === null ? "no hours in offer" : `${t.hours}h`})`).join("\n");
  return tasks ? `${head}\n${tasks}` : head;
}

const NIELS_ID = "1dc0408f-6a00-0039-a953-c67fcb7767f8";
function ownerLabel(id: string): string {
  return id === NIELS_ID ? "Niels" : `Teamleader user ${id}`;
}

const sectionText = (text: string) => ({ type: "section", text: { type: "mrkdwn", text: text.slice(0, 2990) } });

export function planBlocks(p: LaunchPlan): any[] {
  const t = totals(p.groups);
  const blocks: any[] = [
    { type: "header", text: { type: "plain_text", text: "Launch project from the won deal", emoji: true } },
    sectionText(
      `*${p.title}*\n` +
        `Client: ${p.customer_name || p.customer_id} · start ${p.start_date}\n` +
        `Deal: ${p.deal_title || p.deal_id}${p.progress.won ? " (already won)" : ""}\n` +
        `Quotation: ${p.quotation_id}${p.progress.accepted ? " (already accepted)" : ""}\n` +
        `Assigned to: ${ownerLabel(p.owner_id)} · asked by <@${p.requester}>`
    ),
    { type: "divider" },
  ];
  for (const g of p.groups) blocks.push(sectionText(groupLine(g)));
  blocks.push({ type: "divider" });
  blocks.push(sectionText(`*Total (paid gates):* fixed price ${fmtEur(t.revenue)} · internal budget ${fmtEur(t.budget)}`));
  if (p.warnings.length) blocks.push(sectionText(`:warning: *Check before you click*\n${p.warnings.map((w) => `• ${w}`).join("\n")}`));
  blocks.push({
    type: "context",
    elements: [{ type: "mrkdwn", text: "Clicking marks the quotation accepted and the deal *won* (this can't be undone), then creates the project, groups and tasks. Want changes? Reply in the thread and I'll make a new card." }],
  });
  blocks.push({
    type: "actions",
    block_id: "p9launch_buttons",
    elements: [
      {
        type: "button",
        action_id: L.go,
        style: "primary",
        text: { type: "plain_text", text: "✅ Mark won + create project", emoji: true },
        value: p.id,
        confirm: {
          title: { type: "plain_text", text: "Mark the deal won?" },
          text: { type: "mrkdwn", text: `This accepts the quotation and marks *${(p.deal_title || "the deal").slice(0, 200)}* as won in Teamleader. That can't be undone. Then the project is created.` },
          confirm: { type: "plain_text", text: "Yes, go" },
          deny: { type: "plain_text", text: "Not yet" },
        },
      },
      { type: "button", action_id: L.discard, text: { type: "plain_text", text: "Discard" }, value: p.id },
    ],
  });
  return blocks;
}

export function fallbackText(p: LaunchPlan): string {
  return `Launch project "${p.title}" from the won deal: ${p.groups.length} group(s), check the card.`;
}

/** What the card turns into once the run finished (or stopped). */
export function resultBlocks(p: LaunchPlan): any[] {
  const pr = p.progress;
  const t = totals(p.groups);
  const tick = (ok: any) => (ok ? "✅" : "▫️");
  const lines = [
    `${tick(pr.accepted)} Quotation accepted`,
    `${tick(pr.won)} Deal marked won`,
    `${tick(pr.project_id)} Project created${pr.project_id ? `: <${projectUrl(pr.project_id)}|${p.title}>` : ""}`,
    `${tick(pr.deal_linked && pr.quotation_linked)} Deal and quotation linked`,
    `${tick(pr.assigned)} Project assigned`,
  ];
  p.groups.forEach((g, i) => {
    const gp = pr.groups[i] || { tasks_done: 0 };
    const done = !!gp.id && gp.tasks_done >= g.tasks.length;
    const money = g.placeholder ? "placeholder, €0" : `${fmtEur(g.revenue)} fixed, ${fmtEur(internalBudget(g.revenue))} internal budget`;
    lines.push(`${tick(done)} ${g.title}: ${money}, ${gp.tasks_done}/${g.tasks.length} tasks, ${groupHours(g)}h estimated`);
  });
  const blocks: any[] = [];
  if (p.status === "done") {
    blocks.push(sectionText(`*${p.title}* is live in Teamleader.${p.by ? ` (by <@${p.by}>)` : ""}\n\n${lines.join("\n")}\n\n*Total (paid gates):* ${fmtEur(t.revenue)} fixed price, ${fmtEur(t.budget)} internal budget.`));
    blocks.push(sectionText("Next: do you want to plan the team's time across the gates? Ask me in this thread."));
    return blocks;
  }
  blocks.push(sectionText(`:warning: *Stopped part way.* ${pr.error || "Unknown error."}\n\n${lines.join("\n")}\n\nNothing is undone. *Retry the rest* continues from the step that failed, without creating a second project.`));
  blocks.push({
    type: "actions",
    block_id: "p9launch_buttons",
    elements: [
      { type: "button", action_id: L.go, style: "primary", text: { type: "plain_text", text: "Retry the rest" }, value: p.id },
    ],
  });
  return blocks;
}

// ── Slack actions ────────────────────────────────────────────────────────────

export interface LaunchDeps {
  /** May this Slack user write to Teamleader? (the write allowlist) */
  mayWrite: (userId: string) => boolean;
  tl: TlCall;
}

async function ephemeral(client: any, body: any, text: string) {
  try {
    await client.chat.postEphemeral({ channel: body?.channel?.id || body?.container?.channel_id, user: body?.user?.id, thread_ts: body?.message?.thread_ts, text });
  } catch {
    /* nothing else to do */
  }
}

const running = new Set<string>();

export function registerLaunchActions(app: any, deps: LaunchDeps): void {
  app.action(L.go, async ({ ack, body, action, client }: any) => {
    await ack();
    const userId = body?.user?.id;
    const p = loadPlan(String(action?.value || ""));
    if (!p) return ephemeral(client, body, "This card has expired (Pidgi lost it in a redeploy). Ask me again in the thread to make a new one.");
    if (!deps.mayWrite(userId)) return ephemeral(client, body, "Only people on Pidgi's write list can launch a project. Ask Niels.");
    if (p.status === "done") return ephemeral(client, body, "This project was already created.");
    if (p.status === "discarded") return ephemeral(client, body, "This card was discarded. Ask me again for a new one.");
    if (running.has(p.id)) return;
    const other = otherLaunchForDeal(p.deal_id, p.id);
    if (other && !p.progress.project_id) {
      const where = other.progress.project_id ? `: ${projectUrl(other.progress.project_id)}` : " (it is running right now)";
      return ephemeral(client, body, `A project for this deal was already started from another card${where}. I won't make a second one.`);
    }
    running.add(p.id);
    const at = { channel: body?.channel?.id || body?.container?.channel_id || p.channel, ts: body?.message?.ts || p.card_ts };
    try {
      try {
        await client.chat.update({ ...at, text: "Launching the project…", blocks: [sectionText(`:hourglass_flowing_sand: <@${userId}> is launching *${p.title}*…`)] });
      } catch {
        /* the result below replaces it anyway */
      }
      p.by = userId;
      const out = await executePlan(p, deps.tl);
      await client.chat.update({ ...at, text: out.status === "done" ? `${out.title} is live in Teamleader` : "Project launch stopped part way", blocks: resultBlocks(out) });
    } catch (e: any) {
      console.error("[launch] failed:", e?.message || e);
      await ephemeral(client, body, `Something went wrong: ${e?.message || e}`);
    } finally {
      running.delete(p.id);
    }
  });

  app.action(L.discard, async ({ ack, body, action, client }: any) => {
    await ack();
    const userId = body?.user?.id;
    const p = loadPlan(String(action?.value || ""));
    if (p && userId !== p.requester && !deps.mayWrite(userId)) {
      return ephemeral(client, body, `Only <@${p.requester}>, who asked for this, can discard it (or someone on Pidgi's write list).`);
    }
    if (p) {
      if (p.status !== "draft") return ephemeral(client, body, "This one already started, so it can't be discarded.");
      p.status = "discarded";
      savePlan(p);
    }
    try {
      await client.chat.update({
        channel: body?.channel?.id || body?.container?.channel_id,
        ts: body?.message?.ts,
        text: "Project launch discarded",
        blocks: [{ type: "context", elements: [{ type: "mrkdwn", text: `Project launch${p ? ` for *${p.title}*` : ""} discarded by <@${userId}>. Nothing was written to Teamleader.` }] }],
      });
    } catch (e: any) {
      await ephemeral(client, body, `I couldn't discard it (${e?.message || e}).`);
    }
  });
}

/** The tool the model calls. Posting the card is done by the caller (it owns the Slack client). */
export const proposeToolDef = {
  name: "propose_project_launch",
  description:
    "Deal won → Teamleader project. Checks your proposal against Teamleader (deal, quotation, customer), computes each group's internal budget (60% of its revenue) in code, and posts a card in the Slack thread with a button. NOTHING is written to Teamleader by this call: only the button marks the quotation accepted, the deal won (irreversible) and creates the project, groups and tasks. Pass revenue and hours exactly as the offer or quotation states them; never estimate. Returns either a list of problems to fix, or confirmation that the card is posted.",
  input_schema: {
    type: "object",
    properties: {
      deal_id: { type: "string", description: "Teamleader deal id" },
      quotation_id: { type: "string", description: "Teamleader quotation id of the accepted offer" },
      title: { type: "string", description: "Project title. Default: the deal title." },
      description: { type: "string", description: "One sentence describing the program, drawn from the offer." },
      start_date: { type: "string", description: "Project start = Gate 1 start (YYYY-MM-DD). Ask if not stated." },
      end_date: { type: "string", description: "Optional project end (YYYY-MM-DD)." },
      groups: {
        type: "array",
        description: "One group per gate or phase, in order.",
        items: {
          type: "object",
          properties: {
            title: { type: "string", description: 'Gate name, e.g. "Gate 1: Discovery (3 months)"' },
            revenue: { type: "number", description: "What the client pays for this gate, EUR excl. VAT, as written in the offer. 0 for a placeholder." },
            start_date: { type: "string", description: "YYYY-MM-DD" },
            end_date: { type: "string", description: "YYYY-MM-DD; leave out when unknown (e.g. a TBD gate)" },
            placeholder: { type: "boolean", description: "true for a gate whose scope and price are not set yet (e.g. defined after a go/no-go). Gets €0 / €0." },
            tasks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string", description: "Deliverable name as in the offer" },
                  hours: { type: ["number", "null"], description: "Hours from the offer, or null when the offer gives none" },
                },
                required: ["title"],
              },
            },
          },
          required: ["title", "revenue"],
        },
      },
    },
    required: ["deal_id", "quotation_id", "start_date", "groups"],
  },
};
