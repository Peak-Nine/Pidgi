/**
 * The Tender Board in Notion: one card per tender, moved across
 * Relevant → Considered → Work in progress → Submitted → Won / Lost / Dropped.
 *
 * Tendi writes to it in two ways:
 *   - the `tender_board` tool (a person asks in Slack: "add the Oxfam tender", "mark Ipas as lost, lesson: price")
 *   - Scout: a 👍 on a digest item creates the card in Relevant; "Start a proposal" moves it to Work in progress.
 *
 * Needs NOTION_TOKEN (an internal integration secret; the board must be shared with
 * that integration in Notion) and NOTION_TENDER_DB (the board's database id: the 32
 * characters at the end of its Notion link; dashes optional).
 * Nothing here runs when either is missing; the tool then says so.
 *
 * Property names are the board's exact names. If someone renames a property in
 * Notion, Notion's API answers "property does not exist" and the tool passes that
 * error back verbatim, so nobody has to guess.
 */
import { Client } from "@notionhq/client";

const NOTION_VERSION = "2022-06-28";

export const STAGES = ["Relevant", "Considered", "Work in progress", "Submitted", "Won", "Lost", "Dropped"] as const;
export type Stage = (typeof STAGES)[number];
export const SOURCES = ["GIZ", "UNDP", "Enabel", "World Bank", "ReliefWeb", "TED", "Bonfire", "Direct", "Other"] as const;
export const FITS = ["Strong", "Possible", "Weak"] as const;
export const PLAYBOOKS = ["rfp-philea", "new-proposal", "proof-of-change", "none"] as const;
export const OUTCOMES = ["Won", "Lost", "No decision yet", "Withdrawn"] as const;
export const ADDED_BY = ["Scout", "Niels", "Jonas", "Bertille", "Other"] as const;

export interface CardInput {
  name: string;
  stage?: Stage;
  deadline?: string; // YYYY-MM-DD or ISO datetime
  questions_deadline?: string;
  owner_emails?: string[]; // mapped to Notion people by email
  buyer?: string;
  source?: (typeof SOURCES)[number];
  reference?: string;
  link?: string;
  fit?: (typeof FITS)[number];
  why?: string;
  playbook?: (typeof PLAYBOOKS)[number];
  estimated_value?: string;
  procedure?: string;
  submitted_on?: string;
  outcome?: (typeof OUTCOMES)[number];
  lessons?: string;
  debrief_received?: boolean;
  added_by?: (typeof ADDED_BY)[number];
  /** Page body (Notion markdown-ish plain paragraphs), only on create. */
  notes?: string;
}

export interface CardSummary {
  id: string;
  url: string;
  name: string;
  stage: string;
  deadline: string;
  owner: string[];
  buyer: string;
  source: string;
  reference: string;
  link: string;
  fit: string;
  outcome: string;
}

export function boardEnabled(): boolean {
  return !!(process.env.NOTION_TOKEN && process.env.NOTION_TENDER_DB);
}

export function boardConfigNote(): string {
  if (boardEnabled()) return "";
  const missing = [!process.env.NOTION_TOKEN && "NOTION_TOKEN", !process.env.NOTION_TENDER_DB && "NOTION_TENDER_DB"].filter(Boolean);
  return `The Tender Board is not connected on this Tendi instance (missing ${missing.join(" and ")}). Niels sets them on Render (the Notion integration secret, and the board's data source id), shares the board page with that integration in Notion, and Tendi can write cards.`;
}

function dbId(): string {
  return String(process.env.NOTION_TENDER_DB || "").replace(/^collection:\/\//, "").trim();
}

let _client: Client | null = null;
function client(): Client {
  if (_client) return _client;
  const auth = process.env.NOTION_TOKEN;
  if (!auth) throw new Error("NOTION_TOKEN is not set");
  _client = new Client({
    auth,
    notionVersion: NOTION_VERSION,
    // Platform fetch instead of the SDK's bundled node-fetch (dead keep-alive sockets on Render).
    fetch: (url: any, init: any) => (globalThis as any).fetch(url, init),
  });
  return _client;
}

// ── helpers ──────────────────────────────────────────────────────────────────

const rt = (s: string) => ({ rich_text: [{ type: "text", text: { content: String(s).slice(0, 1900) } }] });
const title = (s: string) => ({ title: [{ type: "text", text: { content: String(s).slice(0, 200) } }] });
const sel = (s: string) => ({ select: { name: s } });
const status = (s: string) => ({ status: { name: s } });
const date = (s: string) => ({ date: { start: s } });

function plain(prop: any): string {
  if (!prop) return "";
  switch (prop.type) {
    case "title":
      return (prop.title || []).map((t: any) => t.plain_text).join("");
    case "rich_text":
      return (prop.rich_text || []).map((t: any) => t.plain_text).join("");
    case "select":
      return prop.select?.name || "";
    case "status":
      return prop.status?.name || "";
    case "date":
      return prop.date?.start || "";
    case "url":
      return prop.url || "";
    case "people":
      return (prop.people || []).map((p: any) => p.name || p.id).join(", ");
    case "checkbox":
      return prop.checkbox ? "yes" : "no";
    default:
      return "";
  }
}

export function summarize(page: any): CardSummary {
  const p = page?.properties || {};
  return {
    id: page.id,
    url: page.url,
    name: plain(p["Name"]),
    stage: plain(p["Stage"]),
    deadline: plain(p["Deadline"]),
    owner: (p["Owner"]?.people || []).map((x: any) => x.name || x.id),
    buyer: plain(p["Buyer"]),
    source: plain(p["Source"]),
    reference: plain(p["Reference"]),
    link: plain(p["Link"]),
    fit: plain(p["Fit"]),
    outcome: plain(p["Outcome"]),
  };
}

/** Notion user ids by email, cached per process (the workspace is small). */
let usersByEmail: Map<string, string> | null = null;
export async function notionUserIdsForEmails(emails: string[]): Promise<{ ids: string[]; unknown: string[] }> {
  if (!usersByEmail) {
    usersByEmail = new Map();
    let cursor: string | undefined;
    do {
      const r: any = await client().users.list({ start_cursor: cursor, page_size: 100 });
      for (const u of r.results || []) {
        const email = String(u?.person?.email || "").toLowerCase();
        if (email) usersByEmail.set(email, u.id);
      }
      cursor = r.has_more ? r.next_cursor : undefined;
    } while (cursor);
  }
  const ids: string[] = [];
  const unknown: string[] = [];
  for (const e of emails) {
    const id = usersByEmail.get(String(e).toLowerCase());
    if (id) ids.push(id);
    else unknown.push(e);
  }
  return { ids, unknown };
}

/** Build Notion properties from a CardInput; only the fields given are touched. */
export async function toProperties(c: CardInput): Promise<{ properties: Record<string, any>; notes: string[] }> {
  const props: Record<string, any> = {};
  const notes: string[] = [];
  if (c.name) props["Name"] = title(c.name);
  if (c.stage) props["Stage"] = status(c.stage);
  if (c.deadline) props["Deadline"] = date(c.deadline);
  if (c.questions_deadline) props["Questions deadline"] = date(c.questions_deadline);
  if (c.buyer !== undefined) props["Buyer"] = rt(c.buyer);
  if (c.source) props["Source"] = sel(c.source);
  if (c.reference !== undefined) props["Reference"] = rt(c.reference);
  if (c.link) props["Link"] = { url: c.link };
  if (c.fit) props["Fit"] = sel(c.fit);
  if (c.why !== undefined) props["Why it fits"] = rt(c.why);
  if (c.playbook) props["Playbook"] = sel(c.playbook);
  if (c.estimated_value !== undefined) props["Estimated value"] = rt(c.estimated_value);
  if (c.procedure !== undefined) props["Procedure"] = rt(c.procedure);
  if (c.submitted_on) props["Submitted on"] = date(c.submitted_on);
  if (c.outcome) props["Outcome"] = sel(c.outcome);
  if (c.lessons !== undefined) props["Lessons learnt"] = rt(c.lessons);
  if (c.debrief_received !== undefined) props["Debrief received"] = { checkbox: !!c.debrief_received };
  if (c.added_by) props["Added by"] = sel(c.added_by);
  if (c.owner_emails && c.owner_emails.length) {
    const { ids, unknown } = await notionUserIdsForEmails(c.owner_emails);
    if (ids.length) props["Owner"] = { people: ids.map((id) => ({ object: "user", id })) };
    if (unknown.length) notes.push(`no Notion user for ${unknown.join(", ")}; owner left as is`);
  }
  return { properties: props, notes };
}

// ── queries ──────────────────────────────────────────────────────────────────

export async function findCards(query: { reference?: string; link?: string; name?: string }, limit = 5): Promise<CardSummary[]> {
  const or: any[] = [];
  if (query.reference) or.push({ property: "Reference", rich_text: { contains: query.reference } });
  if (query.link) or.push({ property: "Link", url: { contains: query.link.replace(/^https?:\/\//, "").split("?")[0].slice(0, 80) } });
  if (query.name) or.push({ property: "Name", title: { contains: query.name } });
  const r: any = await (client() as any).databases.query({
    database_id: dbId(),
    page_size: Math.min(20, Math.max(1, limit)),
    ...(or.length ? { filter: or.length === 1 ? or[0] : { or } } : {}),
    sorts: [{ timestamp: "last_edited_time", direction: "descending" }],
  });
  return (r.results || []).map(summarize);
}

export async function listCards(stage?: Stage, limit = 25): Promise<CardSummary[]> {
  const r: any = await (client() as any).databases.query({
    database_id: dbId(),
    page_size: Math.min(50, Math.max(1, limit)),
    ...(stage ? { filter: { property: "Stage", status: { equals: stage } } } : {}),
    sorts: [{ property: "Deadline", direction: "ascending" }],
  });
  return (r.results || []).map(summarize);
}

export async function createCard(c: CardInput): Promise<{ card: CardSummary; notes: string[] }> {
  if (!c.name) throw new Error("A card needs a name");
  const { properties, notes } = await toProperties({ stage: "Relevant", ...c });
  const children = c.notes
    ? c.notes
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean)
        .slice(0, 20)
        .map((p) => ({ object: "block", type: "paragraph", paragraph: { rich_text: [{ type: "text", text: { content: p.slice(0, 1900) } }] } }))
    : [];
  const page: any = await client().pages.create({ parent: { database_id: dbId() }, properties, ...(children.length ? { children } : {}) } as any);
  return { card: summarize(page), notes };
}

export async function updateCard(pageId: string, c: CardInput): Promise<{ card: CardSummary; notes: string[] }> {
  const { properties, notes } = await toProperties(c);
  if (!Object.keys(properties).length) throw new Error("Nothing to update");
  const page: any = await client().pages.update({ page_id: pageId, properties } as any);
  if (c.notes) {
    await client().blocks.children.append({
      block_id: pageId,
      children: [{ object: "block", type: "paragraph", paragraph: { rich_text: [{ type: "text", text: { content: c.notes.slice(0, 1900) } }] } }],
    } as any);
  }
  return { card: summarize(page), notes };
}

/**
 * Create or update by identity: a card with the same Reference, or the same Link,
 * is the same tender. Returns what happened so the caller can say it plainly.
 */
export async function upsertCard(c: CardInput): Promise<{ action: "created" | "updated"; card: CardSummary; notes: string[] }> {
  let existing: CardSummary | undefined;
  if (c.reference) existing = (await findCards({ reference: c.reference }, 1))[0];
  if (!existing && c.link) existing = (await findCards({ link: c.link }, 1))[0];
  if (existing) {
    const r = await updateCard(existing.id, c);
    return { action: "updated", ...r };
  }
  const r = await createCard(c);
  return { action: "created", ...r };
}

// ── Scout hooks ──────────────────────────────────────────────────────────────

const SOURCE_LABEL: Record<string, (typeof SOURCES)[number]> = {
  giz: "GIZ",
  undp: "UNDP",
  enabel: "Enabel",
  worldbank: "World Bank",
  reliefweb: "ReliefWeb",
  ted: "TED",
};

function fitFromVerdict(v?: string): (typeof FITS)[number] | undefined {
  if (v === "strong") return "Strong";
  if (v === "possible") return "Possible";
  if (v === "weak") return "Weak";
  return undefined;
}

export interface ScoutRecordLike {
  id: string;
  source?: string;
  title: string;
  buyer: string;
  country?: string;
  deadline: string;
  url: string;
  score?: { score: number; verdict: string; why: string; flags?: string[]; playbook?: string };
}

export function cardFromScout(r: ScoutRecordLike, stage: Stage): CardInput {
  const src = SOURCE_LABEL[String(r.source || "")] || "Other";
  const ref = r.id.includes(":") ? r.id.split(":").slice(1).join(":") : r.id;
  const buyer = r.buyer || src;
  const why = r.score ? `${r.score.why}${r.score.flags?.length ? ` Flags: ${r.score.flags.join("; ")}.` : ""} (Scout ${r.score.score}/100)` : "";
  const pb = r.score?.playbook && (PLAYBOOKS as readonly string[]).includes(r.score.playbook) ? (r.score.playbook as (typeof PLAYBOOKS)[number]) : undefined;
  return {
    name: `${buyer} · ${r.title}`.slice(0, 200),
    stage,
    deadline: /^\d{4}-\d{2}-\d{2}/.test(r.deadline || "") ? r.deadline : undefined,
    buyer: r.country ? `${buyer} (${r.country})` : buyer,
    source: src,
    reference: ref,
    link: r.url,
    fit: fitFromVerdict(r.score?.verdict),
    why,
    playbook: pb,
    added_by: "Scout",
  };
}

/** 👍 on a digest item: the card appears in Relevant (or is refreshed if it exists). Never moves a card backwards. */
export async function scoutThumbsUp(r: ScoutRecordLike): Promise<{ action: string; url: string }> {
  const c = cardFromScout(r, "Relevant");
  const existing = (await findCards({ reference: c.reference }, 1))[0] || (await findCards({ link: c.link }, 1))[0];
  if (existing) {
    const { stage: _s, ...rest } = c;
    const r2 = await updateCard(existing.id, rest);
    return { action: `updated (stays in ${existing.stage || "its column"})`, url: r2.card.url };
  }
  const r2 = await createCard(c);
  return { action: "created in Relevant", url: r2.card.url };
}

const ORDER: Stage[] = ["Relevant", "Considered", "Work in progress", "Submitted", "Won", "Lost", "Dropped"];

/** "Start a proposal": the card moves to Work in progress unless it is already further along. */
export async function scoutStartProposal(r: ScoutRecordLike, ownerEmail?: string): Promise<{ action: string; url: string }> {
  const c = cardFromScout(r, "Work in progress");
  if (ownerEmail) c.owner_emails = [ownerEmail];
  const existing = (await findCards({ reference: c.reference }, 1))[0] || (await findCards({ link: c.link }, 1))[0];
  if (existing) {
    const further = ORDER.indexOf(existing.stage as Stage) > ORDER.indexOf("Work in progress");
    const { stage, ...rest } = c;
    const r2 = await updateCard(existing.id, further ? rest : { ...rest, stage });
    return { action: further ? `updated (already ${existing.stage})` : "moved to Work in progress", url: r2.card.url };
  }
  const r2 = await createCard(c);
  return { action: "created in Work in progress", url: r2.card.url };
}
