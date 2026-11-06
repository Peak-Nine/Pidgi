/**
 * GTD: a meeting recording → every concrete to-do, in one overview message with checkboxes.
 *
 * "GTD" in Niels's DM (or "GTD GIZ", "GTD <notion link>", "GTD today"):
 *   1. read the recording: Notion's summary and notes, and the full transcript
 *   2. first pass: Claude lists every action for Peak Nine, each with the exact words it comes from
 *   3. second pass: Claude reviews that list against the recording and the open tasks already on
 *      the boards: adds what was missed, drops what isn't a Peak Nine action or appears twice,
 *      and marks what is already on a board
 *   4. the code checks every item: its quote must really be in the recording (word for word,
 *      punctuation aside), deadlines need their own quote, projects must exist on the board,
 *      and the board must be one the requester may add to
 *   5. one overview message per recording, grouped per board, everything ticked except likely
 *      duplicates; "Add selected" writes the ticked ones, "Edit a task" opens an editor
 * The overview lives in Pidgi's file store (formstore), so it survives a restart when Render has
 * a persistent disk. The model (GTD_MODEL, default claude-opus-5-5) thinks at GTD_EFFORT
 * (default high); every run shows an approximate cost.
 */
import crypto from "crypto";
import Anthropic from "@anthropic-ai/sdk";
import { notionClient, notionDataSourceClient } from "./notion.js";
import { recordUsage } from "./usage.js";
import { loadFormValue, saveFormValue } from "./formstore.js";
import { GtdRequest, RecordingContent, RecordingRow, markDone, pickProblem, pickRecording, pickTodaysRecordings } from "./recordings.js";
import {
  DraftPayload,
  TaskBoard,
  TeamMember,
  boardOf,
  boardRef,
  boardsFor,
  calendarLines,
  canAddTo,
  esc,
  houseStyle,
  isIsoDate,
  prettyDate,
  squash,
  todayBrussels,
} from "./taskboards.js";
import { BOARDS, TEAM, TaskDeps, TaskEvent, CaptureResult, person, projectOptionsByBoard, slackError, writeDraft } from "./tasks.js";

/** The boards GTD proposes for: Niels's own (Mothership), Jonas's, Touchdown, Sankhya's and Laura's. */
export const GTD_BOARDS = ["mothership", "jonas", "touchdown", "sankhya", "laura"];
export const MAX_TASKS = 40;
const FALLBACK_MODELS = new Set(["claude-fable-5-1", "claude-opus-5-5", "claude-opus-5", "claude-sonnet-5-5"]);

// Approximate list prices per million tokens (input, output), for the cost line only.
const PRICES: Record<string, [number, number]> = {
  "claude-opus-5-5": [4, 20],
  "claude-opus-5": [5, 25],
  "claude-sonnet-5-5": [2, 10],
  "claude-haiku-5-5": [0.1, 0.5],
  "claude-sonnet-4-6": [3, 15],
};

export interface GtdTask {
  id: string;
  board: string;
  title: string;
  context: string;
  evidence: string;
  deadline: string | null;
  deadlineQuote: string | null;
  project: string | null;
  /** Email of who picks it up (Touchdown). */
  responsible: string | null;
  /** The title of an open task already on the board that this looks like. */
  duplicateOf: string | null;
}

export interface GtdBatch {
  v: 1;
  id: string;
  /** Slack user id of who ran GTD. */
  q: string;
  recording: { title: string; url: string; date: string; rowId: string };
  tasks: GtdTask[];
  selected: string[];
  added: { title: string; board: string; url: string }[];
  failed: { title: string; error: string }[];
  status: "open" | "done" | "discarded";
  stats: { firstPass: number; addedInReview: number; removedInReview: number; droppedNoQuote: number; duplicates: number };
  cost: { inputTokens: number; outputTokens: number; usd: number | null; model: string };
  at: { channel: string; ts: string } | null;
}

// ── Checking what the model returned ──────────────────────────────────────

/** Letters and digits only: punctuation, quotes, capitals and spacing don't count, every word does. */
export function loose(s: string): string {
  return String(s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Is this quote really in the recording? At least five words, found word for word. */
export function quoteFound(quote: string, source: string): boolean {
  const q = loose(quote);
  return q.split(" ").length >= 5 && ` ${loose(source)} `.includes(` ${q} `);
}

export interface ValidateOpts {
  boards: TaskBoard[];
  projects: Record<string, string[]>;
  team: TeamMember[];
  source: string;
  today: string;
  existing: Record<string, string[]>;
}

/** Turn the model's final list into tasks we trust; everything unproven is dropped and counted. */
export function validateGtd(raw: any, o: ValidateOpts): { tasks: GtdTask[]; droppedNoQuote: number; droppedOther: number } {
  const out: GtdTask[] = [];
  let droppedNoQuote = 0;
  let droppedOther = 0;
  const seen = new Set<string>();
  const sourceSquashed = squash(o.source);
  for (const t of Array.isArray(raw?.tasks) ? raw.tasks : []) {
    const board = o.boards.find((b) => b.key === String(t?.board || "").toLowerCase());
    const title = houseStyle(String(t?.title || "")).slice(0, 150);
    if (!board || !title) {
      droppedOther++;
      continue;
    }
    const evidence = String(t?.evidence || "").trim().slice(0, 600);
    if (!quoteFound(evidence, o.source)) {
      droppedNoQuote++;
      continue;
    }
    const key = `${board.key}|${loose(title)}`;
    if (seen.has(key)) {
      droppedOther++;
      continue;
    }
    seen.add(key);

    let deadline: string | null = board.fields.deadline && isIsoDate(t?.deadline) ? t.deadline : null;
    let deadlineQuote: string | null = t?.deadline_quote ? String(t.deadline_quote).trim().slice(0, 80) : null;
    if (deadline && (!deadlineQuote || !sourceSquashed.includes(squash(deadlineQuote)))) deadline = null;
    if (!deadline) deadlineQuote = null;

    let project: string | null = board.fields.project && t?.project ? String(t.project) : null;
    if (project && !(o.projects[board.key] || []).includes(project)) project = null;

    let responsible: string | null = null;
    if (board.kind === "meeting" && board.fields.assignee && t?.responsible) {
      const who = String(t.responsible).toLowerCase().trim();
      responsible = o.team.find((m) => m.name.toLowerCase() === who || m.email === who)?.email || null;
    }

    const dup = String(t?.duplicate_of || "").trim();
    const duplicateOf = dup ? (o.existing[board.key] || []).find((x) => loose(x) === loose(dup)) || null : null;

    out.push({
      id: "t" + (out.length + 1),
      board: board.key,
      title,
      context: houseStyle(String(t?.context || "")).slice(0, 900),
      evidence,
      deadline,
      deadlineQuote,
      project,
      responsible,
      duplicateOf,
    });
    if (out.length >= MAX_TASKS) break;
  }
  return { tasks: out, droppedNoQuote, droppedOther };
}

// ── Asking Claude ─────────────────────────────────────────────────────────

function taskSchema(boardKeys: string[], projects: string[], team: string[], review: boolean): any {
  const props: Record<string, any> = {
    board: { type: "string", enum: boardKeys },
    title: { type: "string" },
    context: { type: "string" },
    evidence: { type: "string" },
    deadline: { type: "string" },
    deadline_quote: { type: "string" },
    project: projects.length ? { type: "string", enum: [...projects, ""] } : { type: "string" },
    responsible: { type: "string", enum: [...team, ""] },
  };
  if (review) props.duplicate_of = { type: "string" };
  const item = { type: "object", properties: props, required: Object.keys(props), additionalProperties: false };
  const top: Record<string, any> = { tasks: { type: "array", items: item } };
  if (review) {
    top.added = { type: "integer" };
    top.removed = { type: "integer" };
  }
  return { type: "object", properties: top, required: Object.keys(top), additionalProperties: false };
}

const SYSTEM = `You turn a meeting recording at Peak Nine (a small impact innovation studio in Belgium) into concrete to-dos on the team's Notion boards.

Be thorough: catch every concrete action a Peak Nine person has to do, decide or follow up on, the small ones too ("send the deck", "ask Marie for the numbers"). Never invent: every item must rest on words that were actually said or written in the recording.

For each item:
- board: who does it. Niels's own actions go on mothership. Jonas's own actions go on jonas. Topics Niels and Jonas need to discuss or decide together go on touchdown. Sankhya's actions go on sankhya. Laura's actions (design, visuals, layout, content production) go on laura. Only use the boards in the list.
- Only Peak Nine people (Niels, Jonas, Sankhya, Laura). Leave out what people outside Peak Nine promised, unless a Peak Nine person has to chase it; then the item is that follow-up.
- title: a short concrete action that starts with a verb, at most 80 characters, in the language of the recording.
- context: one to four plain sentences: what exactly, for whom or why, any constraint mentioned. Warm and direct, no jargon, no em dashes.
- evidence: the exact words from the summary, notes or transcript that show this action, copied character for character, one contiguous passage of 8 to 40 words. Do not paraphrase, do not stitch pieces together.
- deadline: only when a date or day is said for this item. Relative words ("Friday", "next week", "vrijdag") are relative to the recording date, not today. A period without a day means its last working day. YYYY-MM-DD; deadline_quote = the exact words that state it. Otherwise empty strings for both.
- project: one of that board's projects only when the recording makes it clear, else empty.
- responsible: only on touchdown: the first name of who picks it up, else empty.

Reply with the JSON the schema asks for, nothing else.`;

export function priceOf(model: string, usage: any): number | null {
  const p = PRICES[model];
  if (!p || !usage) return null;
  const inTok = (usage.input_tokens || 0) + (usage.cache_creation_input_tokens || 0) * 1.25 + (usage.cache_read_input_tokens || 0) * 0.1;
  return (inTok * p[0] + (usage.output_tokens || 0) * p[1]) / 1e6;
}

async function askJson(deps: TaskDeps, content: any[], schema: any): Promise<{ json: any; usage: any; model: string }> {
  const model = process.env.GTD_MODEL || "claude-opus-5-5";
  const req: any = {
    model,
    max_tokens: 64000,
    system: SYSTEM,
    messages: [{ role: "user", content }],
    output_config: { effort: process.env.GTD_EFFORT || "high", format: { type: "json_schema", schema } },
  };
  const anthropic: any = deps.anthropic as Anthropic;
  // Streaming: a long transcript at high effort can take minutes.
  const stream = FALLBACK_MODELS.has(model)
    ? anthropic.beta.messages.stream({ ...req, betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" })
    : anthropic.messages.stream(req);
  const msg = await stream.finalMessage();
  try {
    recordUsage(msg.model || model, msg.usage);
  } catch {
    /* usage logging is best-effort */
  }
  if (msg.stop_reason === "refusal") throw new Error("Claude declined to process this recording");
  if (msg.stop_reason === "max_tokens") throw new Error("the answer was cut off before the end");
  const text = (msg.content || [])
    .filter((b: any) => b.type === "text")
    .map((b: any) => b.text)
    .join("");
  try {
    return { json: JSON.parse(text), usage: msg.usage, model: msg.model || model };
  } catch {
    throw new Error("the answer was not valid JSON");
  }
}

/** Open tasks on a board (newest 100), for spotting duplicates. Done or archived rows are skipped. */
export async function openTitles(board: TaskBoard): Promise<string[]> {
  try {
    const query = { page_size: 100, sorts: [{ timestamp: "created_time", direction: "descending" }] };
    const r: any = board.dataSourceId
      ? await notionDataSourceClient().request({ path: `data_sources/${board.dataSourceId}/query`, method: "post", body: query } as any)
      : await notionClient().databases.query({ database_id: board.databaseId, ...query } as any);
    return (r?.results || [])
      .filter((row: any) => !isClosed(row))
      .map((row: any) => plainTitle(row.properties?.[board.fields.title]))
      .filter(Boolean)
      .slice(0, 100);
  } catch (e: any) {
    console.warn(`[gtd] could not read open tasks on ${board.label}: ${e?.message || e}`);
    return [];
  }
}

const CLOSED = /^(done|klaar|afgewerkt|completed|complete|archived|gearchiveerd)$/i;
export function isClosed(row: any): boolean {
  for (const p of Object.values<any>(row?.properties || {})) {
    const names = [p?.status?.name, p?.select?.name, ...((p?.multi_select || []) as any[]).map((o) => o?.name)].filter(Boolean);
    if (names.some((n) => CLOSED.test(String(n)))) return true;
  }
  return false;
}
const plainTitle = (p: any) => (Array.isArray(p?.title) ? p.title.map((t: any) => t.plain_text || t.text?.content || "").join("").trim() : "");

function boardsBlock(boards: TaskBoard[], projects: Record<string, string[]>): string {
  return boards
    .map((b) => {
      const extra = [b.fields.project ? `projects: ${(projects[b.key] || []).join(" | ") || "(none)"}` : "no project column", b.fields.deadline ? "" : "no deadline column"].filter(Boolean);
      return `- ${b.key}: ${b.label}. ${b.description} (${extra.join("; ")})`;
    })
    .join("\n");
}

/** Run both passes for one recording; returns the checked tasks and what happened along the way. */
export async function distilRecording(
  deps: TaskDeps,
  args: { row: RecordingRow; content: RecordingContent; requesterName: string; boards: TaskBoard[]; projects: Record<string, string[]>; existing: Record<string, string[]>; onPhase?: (t: string) => Promise<void> }
): Promise<{ tasks: GtdTask[]; stats: GtdBatch["stats"]; cost: GtdBatch["cost"]; recordedOn: string }> {
  const { row, content, boards, projects, existing } = args;
  const recordedOn = row.created ? todayBrussels(new Date(row.created)) : todayBrussels();
  const source = `${content.text}\n${content.transcript}`;
  const keys = boards.map((b) => b.key);
  const allProjects = Array.from(new Set(Object.values(projects).flat()));
  const team = TEAM.map((m) => m.name);

  // The recording itself goes first and is cached, so the second pass reads it at a tenth of the price.
  const shared = {
    type: "text",
    text: [
      `Recording: "${content.title}", recorded on ${recordedOn} (Europe/Brussels). GTD asked by ${args.requesterName}.`,
      "",
      "Boards (keys):",
      boardsBlock(boards, projects),
      "",
      `Peak Nine team: ${TEAM.map((m) => m.name).join(", ")}`,
      "",
      "Calendar (Europe/Brussels, ISO weeks):",
      calendarLines(recordedOn),
      "",
      "SUMMARY AND NOTES:",
      content.text || "(none)",
      "",
      "TRANSCRIPT:",
      content.transcript || "(no transcript)",
    ].join("\n"),
    cache_control: { type: "ephemeral" },
  };

  const usages: { usage: any; model: string }[] = [];
  if (args.onPhase) await args.onPhase("first pass: listing every action");
  const first = await askJson(deps, [shared, { type: "text", text: "List every concrete action for Peak Nine in this recording." }], taskSchema(keys, allProjects, team, false));
  usages.push(first);
  const candidates = Array.isArray(first.json?.tasks) ? first.json.tasks : [];

  if (args.onPhase) await args.onPhase(`second pass: checking ${candidates.length} item${candidates.length === 1 ? "" : "s"} for what was missed`);
  const openList = boards
    .map((b) => `${b.key}:\n${(existing[b.key] || []).map((t) => `  - ${t}`).join("\n") || "  (none)"}`)
    .join("\n");
  const reviewText = [
    "A first pass found these items:",
    JSON.stringify(candidates, null, 1),
    "",
    "Open tasks already on the boards:",
    openList,
    "",
    "Review that list critically against the recording and return the complete final list:",
    "1. Add every concrete Peak Nine action the first pass missed, with its evidence.",
    "2. Remove items that are not concrete actions, that belong to people outside Peak Nine, or that repeat another item (merge them).",
    "3. When an item is already on its board as an open task, keep it and set duplicate_of to that task's exact title; otherwise duplicate_of is empty.",
    "4. Fix the board, title, deadline or project where they are wrong. Keep every evidence quote exact.",
    "Also say how many items you added and how many you removed.",
  ].join("\n");
  const second = await askJson(deps, [shared, { type: "text", text: reviewText }], taskSchema(keys, allProjects, team, true));
  usages.push(second);

  const checked = validateGtd(second.json, { boards, projects, team: TEAM, source, today: todayBrussels(), existing });
  const inputTokens = usages.reduce((a, u) => a + (u.usage?.input_tokens || 0) + (u.usage?.cache_creation_input_tokens || 0) + (u.usage?.cache_read_input_tokens || 0), 0);
  const outputTokens = usages.reduce((a, u) => a + (u.usage?.output_tokens || 0), 0);
  const prices = usages.map((u) => priceOf(u.model, u.usage));
  return {
    tasks: checked.tasks,
    recordedOn,
    stats: {
      firstPass: candidates.length,
      addedInReview: Math.max(0, Number(second.json?.added) || 0),
      removedInReview: Math.max(0, Number(second.json?.removed) || 0),
      droppedNoQuote: checked.droppedNoQuote,
      duplicates: checked.tasks.filter((t) => t.duplicateOf).length,
    },
    cost: { inputTokens, outputTokens, usd: prices.some((p) => p === null) ? null : prices.reduce((a: number, p) => a + (p as number), 0), model: usages[0].model },
  };
}

// ── The overview message ──────────────────────────────────────────────────

export const G = { pick: "gtd_pick", add: "gtd_add", edit: "gtd_edit", discard: "gtd_discard", editSubmit: "gtd_edit_submit" };

const cut = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);

function optionFor(t: GtdTask): any {
  const bits = [t.deadline ? `📅 ${prettyDate(t.deadline)}` : "", t.duplicateOf ? `already on the board?` : `“${t.evidence}”`].filter(Boolean);
  return { text: { type: "mrkdwn", text: cut(`*${esc(t.title)}*`, 75) }, description: { type: "plain_text", text: cut(bits.join("  ·  "), 75) }, value: t.id };
}

export function overviewBlocks(b: GtdBatch, boards: TaskBoard[]): any[] {
  const blocks: any[] = [];
  const n = b.tasks.length;
  const head =
    b.status === "discarded"
      ? `🗑️ *GTD: <${b.recording.url}|${esc(b.recording.title)}>* · discarded, nothing more was added.`
      : n
        ? `🎙️ *GTD: <${b.recording.url}|${esc(b.recording.title)}>* (${prettyDate(b.recording.date)}) · ${n} suggestion${n === 1 ? "" : "s"}. Untick what you don't want, then *Add selected*.`
        : `🎙️ *GTD: <${b.recording.url}|${esc(b.recording.title)}>* (${prettyDate(b.recording.date)}) · ${b.added.length ? "all done." : "nothing concrete for your boards."}`;
  blocks.push({ type: "section", text: { type: "mrkdwn", text: head } });
  const s = b.stats;
  const facts = [
    `First pass ${s.firstPass}, review added ${s.addedInReview} and removed ${s.removedInReview}`,
    s.droppedNoQuote ? `${s.droppedNoQuote} dropped because their quote wasn't in the recording` : "every suggestion quotes the recording",
    s.duplicates ? `${s.duplicates} may already be on a board (left unticked)` : "",
    b.cost.usd !== null ? `≈ $${b.cost.usd.toFixed(2)} (${Math.round(b.cost.inputTokens / 1000)}k in, ${Math.round(b.cost.outputTokens / 1000)}k out, ${b.cost.model}, approximate)` : "",
  ].filter(Boolean);
  blocks.push({ type: "context", elements: [{ type: "mrkdwn", text: facts.join("  ·  ") }] });

  if (b.status === "open") {
    for (const board of boards) {
      const mine = b.tasks.filter((t) => t.board === board.key);
      if (!mine.length) continue;
      blocks.push({ type: "section", text: { type: "mrkdwn", text: `*${esc(boardRef(board).replace(/^the /, ""))}* (${mine.length})` } });
      for (let i = 0; i < mine.length; i += 10) {
        const chunk = mine.slice(i, i + 10);
        const options = chunk.map(optionFor);
        const initial = options.filter((o) => b.selected.includes(o.value));
        blocks.push({
          type: "actions",
          block_id: `gtd_b_${board.key}_${i / 10}`,
          elements: [{ type: "checkboxes", action_id: `${G.pick}_${board.key}_${i / 10}`, options, ...(initial.length ? { initial_options: initial } : {}) }],
        });
      }
    }
    if (n) {
      const picked = b.tasks.filter((t) => b.selected.includes(t.id)).length;
      blocks.push({
        type: "actions",
        block_id: "gtd_actions",
        elements: [
          { type: "button", style: "primary", action_id: G.add, text: { type: "plain_text", text: `✅ Add selected (${picked})`, emoji: true }, value: b.id },
          {
            type: "static_select",
            action_id: G.edit,
            placeholder: { type: "plain_text", text: "✏️ Edit a task", emoji: true },
            options: b.tasks.slice(0, 100).map((t) => ({ text: { type: "plain_text", text: cut(t.title, 75) }, value: `${b.id}|${t.id}` })),
          },
          {
            type: "button",
            style: "danger",
            action_id: G.discard,
            text: { type: "plain_text", text: "Discard the rest" },
            value: b.id,
            confirm: {
              title: { type: "plain_text", text: "Discard?" },
              text: { type: "plain_text", text: "The suggestions still in this overview won't be added. Tasks already added stay on their boards." },
              confirm: { type: "plain_text", text: "Discard" },
              deny: { type: "plain_text", text: "Keep" },
            },
          },
        ],
      });
    }
  }

  if (b.added.length) {
    const lines = b.added.map((a) => `✅ <${a.url}|${esc(a.title)}> → ${esc(a.board)}`);
    for (let i = 0; i < lines.length; i += 10) blocks.push({ type: "context", elements: [{ type: "mrkdwn", text: cut(lines.slice(i, i + 10).join("\n"), 2990) }] });
  }
  if (b.failed.length) {
    blocks.push({ type: "context", elements: [{ type: "mrkdwn", text: cut(b.failed.map((f) => `⚠️ ${esc(f.title)}: ${esc(f.error)}`).join("\n"), 2990) }] });
  }
  return blocks.slice(0, 50);
}

/** The ticked task ids, read from every checkbox group in the message's state. */
export function selectedFromState(values: any): string[] {
  const out: string[] = [];
  for (const block of Object.values<any>(values || {})) {
    for (const [actionId, el] of Object.entries<any>(block || {})) {
      if (actionId.startsWith(G.pick) && Array.isArray(el?.selected_options)) out.push(...el.selected_options.map((o: any) => String(o.value)));
    }
  }
  return out;
}

/** A GTD task as a regular draft, so writeDraft puts it on the board like any other card. */
export function draftFor(t: GtdTask, b: GtdBatch): DraftPayload {
  return {
    v: 1,
    t: t.title,
    c: [t.context, `Said in the meeting: “${t.evidence}”`].filter(Boolean).join("\n\n"),
    u: [],
    s: b.recording.url,
    q: b.q,
    a: t.board,
    d: t.deadline,
    dq: t.deadlineQuote,
    p: t.project,
    r: t.responsible,
  };
}

// ── Storage ───────────────────────────────────────────────────────────────

const store = {
  load(id: string): GtdBatch | null {
    const r = loadFormValue(`gtd-${id}`);
    try {
      return r.value ? (JSON.parse(r.value) as GtdBatch) : null;
    } catch {
      return null;
    }
  },
  save(b: GtdBatch) {
    saveFormValue(`gtd-${b.id}`, JSON.stringify(b));
  },
};

// ── Running GTD ───────────────────────────────────────────────────────────

/**
 * "GTD" in Niels's DM: find the recording(s), run both passes, post one overview per recording
 * in the thread the request came from, and tick the recording's GTD box once its overview is up.
 */
export async function runGtd(client: any, deps: TaskDeps, ev: TaskEvent, req: GtdRequest, replyThreadTs?: string): Promise<CaptureResult> {
  const thread = replyThreadTs || ev.thread_ts;
  const post = (text: string, blocks?: any[]) => client.chat.postMessage({ channel: ev.channel, thread_ts: thread, text, ...(blocks ? { blocks } : {}) });
  const requester = await person(client, ev.user);

  let items: { row: RecordingRow; content: RecordingContent }[];
  try {
    if (req.today) {
      const r = await pickTodaysRecordings();
      if (!r.ok) {
        const msg = r.reason === "none_left" ? "No recordings from today without GTD yet." : pickProblem(r);
        await post(msg);
        return { kind: "handled", summary: msg, private: true };
      }
      items = r.items;
    } else {
      const r = await pickRecording(req);
      if (!r.ok) {
        const msg = pickProblem(r);
        await post(msg);
        return { kind: "handled", summary: msg, private: true };
      }
      items = [{ row: r.row, content: r.content }];
    }
  } catch (e: any) {
    const msg = `I couldn't read your recordings just now (${e?.code || e?.message || e}). Try again in a minute.`;
    await post(msg);
    return { kind: "handled", summary: msg, private: true };
  }

  const boards = boardsFor(requester.email, BOARDS).filter((b) => GTD_BOARDS.includes(b.key));
  const projects = await projectOptionsByBoard(boards);
  // Duplicates are only checked on boards this person may read.
  const existing: Record<string, string[]> = {};
  await Promise.all(boards.map(async (b) => (existing[b.key] = await openTitles(b))));

  const summaries: string[] = [];
  if (items.length > 1) await post(`🎙️ GTD on ${items.length} recordings from today. One overview each, below.`);
  for (const { row, content } of items) {
    const placeholder: any = await post(`🎙️ Reading *${content.title}*: summary, notes${content.transcript ? " and the full transcript" : ""}…`);
    const at = { channel: placeholder?.channel || ev.channel, ts: placeholder?.ts };
    const update = (text: string, blocks?: any[]) => client.chat.update({ ...at, text, ...(blocks ? { blocks } : {}) }).catch(() => post(text, blocks));
    try {
      const r = await distilRecording(deps, {
        row,
        content,
        requesterName: requester.name,
        boards,
        projects,
        existing,
        onPhase: (p) => update(`🎙️ *${content.title}*: ${p}…`).then(() => undefined),
      });
      const batch: GtdBatch = {
        v: 1,
        id: crypto.randomBytes(9).toString("base64url"),
        q: ev.user,
        recording: { title: content.title, url: row.url, date: r.recordedOn, rowId: row.id },
        tasks: r.tasks,
        selected: r.tasks.filter((t) => !t.duplicateOf).map((t) => t.id),
        added: [],
        failed: [],
        status: "open",
        stats: r.stats,
        cost: r.cost,
        at,
      };
      store.save(batch);
      await update(`GTD on ${content.title}: ${r.tasks.length} suggestions`, overviewBlocks(batch, boards));
      const ticked = await markDone(row);
      if (!ticked) await post("I couldn't tick this recording's GTD box in Notion: add a checkbox column called GTD to 🎙️ Recordings.");
      summaries.push(`"${content.title}": ${r.tasks.length} suggestions`);
    } catch (e: any) {
      console.error("[gtd] failed:", e?.message || e);
      await update(`I couldn't finish GTD on *${content.title}* (${e?.message || e}). Try again in a minute; the recording is not ticked.`);
      summaries.push(`"${content.title}": failed`);
    }
  }
  return { kind: "handled", summary: `GTD: ${summaries.join("; ")}.`, private: true };
}

// ── Buttons and the editor ─────────────────────────────────────────────────

const busy = new Set<string>();

async function ephemeral(client: any, body: any, text: string) {
  try {
    await client.chat.postEphemeral({ channel: body?.channel?.id || body?.container?.channel_id, user: body?.user?.id, thread_ts: body?.message?.thread_ts, text });
  } catch {
    /* nothing else to do */
  }
}

const boardsForBatch = async (client: any, b: GtdBatch) => boardsFor((await person(client, b.q)).email, BOARDS).filter((x) => GTD_BOARDS.includes(x.key));

async function redraw(client: any, b: GtdBatch, at?: { channel: string; ts: string }) {
  const where = at || b.at;
  if (!where) return;
  const n = b.tasks.length;
  await client.chat.update({ ...where, text: `GTD on ${b.recording.title}: ${n} suggestion${n === 1 ? "" : "s"} left`, blocks: overviewBlocks(b, await boardsForBatch(client, b)) });
}

function editModal(t: GtdTask, boards: TaskBoard[], meta: string): any {
  const opt = (bd: TaskBoard) => ({ text: { type: "plain_text", text: cut(bd.label, 75) }, value: bd.key });
  const current = boardOf(boards, t.board);
  return {
    type: "modal",
    callback_id: G.editSubmit,
    private_metadata: meta,
    title: { type: "plain_text", text: "Edit the suggestion" },
    submit: { type: "plain_text", text: "Save" },
    close: { type: "plain_text", text: "Cancel" },
    blocks: [
      { type: "input", block_id: "title", label: { type: "plain_text", text: "Title" }, element: { type: "plain_text_input", action_id: "v", initial_value: t.title, max_length: 150 } },
      { type: "input", block_id: "context", optional: true, label: { type: "plain_text", text: "Details" }, element: { type: "plain_text_input", action_id: "v", multiline: true, initial_value: t.context, max_length: 900 } },
      { type: "input", block_id: "board", label: { type: "plain_text", text: "Board" }, element: { type: "static_select", action_id: "v", options: boards.map(opt), ...(current ? { initial_option: opt(current) } : {}) } },
      { type: "input", block_id: "deadline", optional: true, label: { type: "plain_text", text: "Deadline" }, element: { type: "datepicker", action_id: "v", ...(t.deadline ? { initial_date: t.deadline } : {}) } },
      { type: "context", elements: [{ type: "mrkdwn", text: cut(`Said in the meeting: “${esc(t.evidence)}”`, 2990) }] },
    ],
  };
}

export function registerGtdActions(app: any, deps: TaskDeps): void {
  // A tick changed: remember the selection, so it survives a redraw or a restart.
  app.action(new RegExp(`^${G.pick}_`), async ({ ack, body }: any) => {
    await ack();
    const id = (body?.message?.blocks || []).find((x: any) => x.block_id === "gtd_actions")?.elements?.find((e: any) => e.action_id === G.add)?.value;
    const b = id && store.load(id);
    if (!b || !deps.canConfirm(body?.user?.id, b.q)) return;
    b.selected = selectedFromState(body?.state?.values);
    store.save(b);
  });

  app.action(G.add, async ({ ack, body, action, client }: any) => {
    await ack();
    const b = store.load(String(action?.value || ""));
    if (!b) return ephemeral(client, body, "This overview has expired. Say GTD again with the recording's name.");
    if (!deps.canConfirm(body?.user?.id, b.q)) return ephemeral(client, body, `Only <@${b.q}>, who ran GTD, can add these.`);
    if (busy.has(b.id)) return;
    busy.add(b.id);
    try {
      b.at = { channel: body?.channel?.id || body?.container?.channel_id, ts: body?.message?.ts || body?.container?.message_ts };
      b.selected = selectedFromState(body?.state?.values);
      const clicker = await person(client, body?.user?.id);
      const picked = b.tasks.filter((t) => b.selected.includes(t.id));
      if (!picked.length) return ephemeral(client, body, "Nothing is ticked yet.");
      b.failed = [];
      for (const t of picked) {
        const board = boardOf(BOARDS, t.board);
        if (!board || !canAddTo(board, clicker.email)) {
          b.failed.push({ title: t.title, error: "you can't add to that board" });
          continue;
        }
        try {
          const r = await writeDraft(client, board, draftFor(t, b));
          b.added.push({ title: t.title, board: boardRef(board), url: r.page?.url || board.boardUrl });
          b.tasks = b.tasks.filter((x) => x.id !== t.id);
        } catch (e: any) {
          const err = e?.body ? `${e.code || ""} ${e.message || ""}`.trim() : slackError(e);
          b.failed.push({ title: t.title, error: cut(err, 200) });
        }
      }
      b.selected = b.selected.filter((id) => b.tasks.some((t) => t.id === id));
      if (!b.tasks.length) b.status = "done";
      store.save(b);
      await redraw(client, b);
    } catch (e: any) {
      console.error("[gtd] add failed:", e?.message || e);
      await ephemeral(client, body, `Adding didn't finish (${slackError(e)}). The overview is still here, so you can try again.`);
    } finally {
      busy.delete(b.id);
    }
  });

  app.action(G.edit, async ({ ack, body, action, client }: any) => {
    await ack();
    const [id, taskId] = String(action?.selected_option?.value || "").split("|");
    const b = store.load(id);
    const t = b?.tasks.find((x) => x.id === taskId);
    if (!b || !t) return ephemeral(client, body, "That suggestion isn't in the overview anymore.");
    if (!deps.canConfirm(body?.user?.id, b.q)) return ephemeral(client, body, `Only <@${b.q}>, who ran GTD, can edit these.`);
    // Keep the current ticks before the editor opens.
    b.selected = selectedFromState(body?.state?.values);
    b.at = { channel: body?.channel?.id || body?.container?.channel_id, ts: body?.message?.ts || body?.container?.message_ts };
    store.save(b);
    try {
      await client.views.open({ trigger_id: body.trigger_id, view: editModal(t, await boardsForBatch(client, b), JSON.stringify({ id, taskId })) });
    } catch (e: any) {
      await ephemeral(client, body, `I couldn't open the editor (${slackError(e)}).`);
    }
  });

  app.view(G.editSubmit, async ({ ack, body, view, client }: any) => {
    await ack();
    let meta: any = {};
    try {
      meta = JSON.parse(view?.private_metadata || "{}");
    } catch {
      return;
    }
    const b = store.load(String(meta.id || ""));
    const t = b?.tasks.find((x) => x.id === meta.taskId);
    if (!b || !t || !deps.canConfirm(body?.user?.id, b.q)) return;
    const v = view?.state?.values || {};
    const title = houseStyle(String(v.title?.v?.value || "")).slice(0, 150);
    if (title) t.title = title;
    t.context = houseStyle(String(v.context?.v?.value || "")).slice(0, 900);
    const boards = await boardsForBatch(client, b);
    const newBoard = boardOf(boards, String(v.board?.v?.selected_option?.value || t.board));
    if (newBoard && newBoard.key !== t.board) {
      t.board = newBoard.key;
      const projects = await projectOptionsByBoard([newBoard]);
      if (t.project && !(projects[newBoard.key] || []).includes(t.project)) t.project = null;
      if (newBoard.kind !== "meeting") t.responsible = null;
    }
    const date = v.deadline?.v?.selected_date;
    if (isIsoDate(date)) {
      if (date !== t.deadline) t.deadlineQuote = null;
      t.deadline = date;
    } else {
      t.deadline = null;
      t.deadlineQuote = null;
    }
    store.save(b);
    try {
      await redraw(client, b);
    } catch (e: any) {
      console.warn("[gtd] redraw after edit failed:", slackError(e));
    }
  });

  app.action(G.discard, async ({ ack, body, action, client }: any) => {
    await ack();
    const b = store.load(String(action?.value || ""));
    if (!b) return;
    if (!deps.canConfirm(body?.user?.id, b.q)) return ephemeral(client, body, `Only <@${b.q}>, who ran GTD, can discard these.`);
    b.status = "discarded";
    b.tasks = [];
    b.selected = [];
    b.at = { channel: body?.channel?.id || body?.container?.channel_id, ts: body?.message?.ts || body?.container?.message_ts };
    store.save(b);
    await redraw(client, b);
  });
}
