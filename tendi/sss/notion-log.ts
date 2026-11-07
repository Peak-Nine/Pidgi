/**
 * Log each post in Marketing › Content Calendar, with Pidgi's Notion key and the
 * same client as the Tender Board (notion-board.ts, Notion API 2022-06-28, so the
 * database id is queried directly; the data source id in config is only needed
 * if that client ever moves to 2025-09-03 or later).
 */
import { SSS } from "./config.js";

/** The one method the job needs, so tests can pass a mock. */
export interface NotionLike {
  request(method: "GET" | "POST" | "PATCH", path: string, body?: any): Promise<any>;
}

/** Adapter over @notionhq/client's generic request. */
export function notionFromClient(client: { request: (args: { path: string; method: any; body?: any }) => Promise<any> }): NotionLike {
  return { request: (method, path, body) => client.request({ path, method: method.toLowerCase(), ...(body ? { body } : {}) }) };
}

const N = SSS.notion;
const rt = (s: string) => [{ type: "text", text: { content: String(s).slice(0, 2000) } }];
const plain = (prop: any) => (prop?.rich_text || prop?.title || []).map((t: any) => t.plain_text).join("");

export interface NotesInput {
  caseId: string;
  designId?: string;
  slackTs?: string;
  threadTs?: string;
  routes?: string[];
  theme?: string;
}

/** Machine-readable notes on each entry, so Tendi can find the case and the Slack post later. */
export const encodeNotes = ({ caseId, designId = "", slackTs, threadTs, routes = [], theme = "" }: NotesInput) =>
  `case:${caseId}; design:${designId}; slack:${slackTs || ""}; thread:${threadTs || slackTs || ""}; routes:${routes.join(",")}; theme:${theme}; built by Tendi`;

export function decodeNotes(s = "") {
  const get = (k: string) => (s.match(new RegExp(`${k}:([^;]*)`)) || [])[1]?.trim() || "";
  return {
    caseId: get("case"),
    designId: get("design"),
    slackTs: get("slack"),
    threadTs: get("thread") || get("slack"),
    routes: get("routes").split(",").filter(Boolean),
    theme: get("theme"),
  };
}

export interface SeriesEntry {
  pageId: string;
  url: string;
  title: string;
  issueNo: number;
  status?: string;
  created: string;
  caseId: string;
  designId: string;
  slackTs: string;
  threadTs: string;
  routes: string[];
  theme: string;
}

export async function listSeriesEntries(notion: NotionLike): Promise<SeriesEntry[]> {
  const out: SeriesEntry[] = [];
  let cursor: string | undefined;
  do {
    const res = await notion.request("POST", `databases/${N.databaseId}/query`, {
      filter: { property: "Post title", title: { starts_with: N.titlePrefix } },
      sorts: [{ timestamp: "created_time", direction: "descending" }],
      ...(cursor ? { start_cursor: cursor } : {}),
      page_size: 100,
    });
    for (const p of res.results || []) {
      const title = plain(p.properties?.["Post title"]);
      const notes = decodeNotes(plain(p.properties?.["Manual notes"]));
      out.push({
        pageId: p.id,
        url: p.url,
        title,
        issueNo: Number((title.match(/#(\d+)/) || [])[1] || 0),
        status: p.properties?.Status?.status?.name,
        created: p.created_time || "",
        ...notes,
      });
    }
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return out;
}

export interface EntryInput extends NotesInput {
  issueNo: number;
  org: string;
  canvaUrl: string;
  caseLink: string;
  publishDate: string;
  caption: string;
  tags: string[];
  notesForTeam?: string;
}

const link = (content: string, url: string) => ({ object: "block", type: "bulleted_list_item", bulleted_list_item: { rich_text: [{ type: "text", text: { content, link: { url } } }] } });

export async function createEntry(notion: NotionLike, e: EntryInput): Promise<{ id: string; url: string }> {
  const paragraphs = e.caption.split(/\n{2,}/).map((para) => ({ object: "block", type: "paragraph", paragraph: { rich_text: rt(para) } }));
  const children: any[] = [
    { object: "block", type: "heading_3", heading_3: { rich_text: rt("Caption") } },
    ...paragraphs,
    { object: "block", type: "heading_3", heading_3: { rich_text: rt("Links") } },
    link("Case in the library", e.caseLink),
    link("Canva design", e.canvaUrl),
    { object: "block", type: "heading_3", heading_3: { rich_text: rt("Before posting") } },
    { object: "block", type: "to_do", to_do: { rich_text: rt("Swap the photo on page 2 once the organisation has given permission"), checked: false } },
    { object: "block", type: "to_do", to_do: { rich_text: rt(`Tag on LinkedIn: ${(e.tags || []).join(", ")}`), checked: false } },
  ];
  if (e.notesForTeam) children.push({ object: "block", type: "callout", callout: { rich_text: rt(e.notesForTeam), icon: { emoji: "🔎" } } });

  return notion.request("POST", "pages", {
    parent: { database_id: N.databaseId },
    icon: { emoji: "🌱" },
    properties: {
      "Post title": { title: rt(SSS.designTitle(e.issueNo, e.org)) },
      Status: { status: { name: N.statusNew } },
      Content: { select: { name: N.content } },
      "Post Type": { select: { name: N.postType } },
      "Canva link": { url: e.canvaUrl },
      CTA: { rich_text: rt(N.cta) },
      "Post Description": { status: { name: "done" } },
      "Estimated Publish date": { date: { start: e.publishDate } },
      "Manual notes": { rich_text: rt(encodeNotes(e)) },
    },
    children,
  });
}

export async function updateNotes(notion: NotionLike, pageId: string, notes: NotesInput, slackPermalink?: string) {
  const r = await notion.request("PATCH", `pages/${pageId}`, { properties: { "Manual notes": { rich_text: rt(encodeNotes(notes)) } } });
  if (slackPermalink) {
    try {
      await notion.request("PATCH", `blocks/${pageId}/children`, { children: [link("Slack post with the PDF", slackPermalink)] });
    } catch {
      /* the link in the page body is a courtesy */
    }
  }
  return r;
}

export async function markReplaced(notion: NotionLike, pageId: string, notes: NotesInput, byName: string) {
  return notion.request("PATCH", `pages/${pageId}`, {
    properties: {
      Status: { status: { name: N.statusReplaced } },
      "Manual notes": { rich_text: rt(`${encodeNotes(notes)}; replaced with 🔁 by ${byName}`) },
    },
  });
}

/** Monday of the week of `now`, in Brussels, as a Date at 00:00 UTC (only the date matters). */
export function weekStartBrussels(now = new Date()): Date {
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: SSS.timeZone, year: "numeric", month: "2-digit", day: "2-digit", weekday: "short" });
  const parts = Object.fromEntries(fmt.formatToParts(now).map((p) => [p.type, p.value]));
  const dow = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(parts.weekday);
  const local = new Date(`${parts.year}-${parts.month}-${parts.day}T00:00:00Z`);
  local.setUTCDate(local.getUTCDate() - dow);
  return local;
}

export const isoDate = (d: Date) => d.toISOString().slice(0, 10);

/** Brussels calendar date of an ISO timestamp (Notion's created_time is UTC). */
export function brusselsDay(iso: string): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-CA", { timeZone: SSS.timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));
}

export function buildsThisWeek(entries: SeriesEntry[], now = new Date()): number {
  const monday = isoDate(weekStartBrussels(now));
  return entries.filter((e) => brusselsDay(e.created) >= monday).length;
}
