/**
 * GTD: turn a Notion meeting recording into draft task cards.
 *
 * Niels's Notion AI meeting notes land in the 🎙️ Recordings database (Pidgi is connected to
 * it, and it is on Niels's private list). In a DM he says "GTD" (the last recording without GTD
 * on yet), "GTD GIZ" (the most recent recording matching those words) or "GTD <notion link>".
 * This file finds and reads the recording; tasks.ts turns it into cards.
 *
 * Reading uses the 2025-09-03 API (data sources). A meeting-notes block may hold its summary,
 * notes and transcript as separate blocks; any `*_block_id` pointer is followed, summary and
 * notes first, the transcript only when the summary is empty. When Notion gives back nothing
 * readable, the reply says which block types it saw, so we know what the API returns.
 */
import { notionDataSourceClient } from "./notion.js";
import { normId } from "./taskboards.js";

export const RECORDINGS = {
  databaseId: "402c675ff958800990a0d32640656e2a",
  dataSourceId: "402c675ff958802b865a000b1f175a8c",
  /** Checkbox ticked once GTD ran on a recording (added by Pidgi if missing). */
  doneProp: "GTD",
};

export interface GtdRequest {
  /** Words to find a recording by, e.g. "GIZ". */
  query: string | null;
  /** A recording named by its Notion link. */
  pageId: string | null;
}

/**
 * "GTD", "gtd GIZ namibia", "GTD <https://app.notion.com/p/...|link>", also after "@Pidgi - "
 * or "@Pidgi: " and in *bold*. Anything else: null.
 */
export function parseGtd(text: string): GtdRequest | null {
  const t = String(text || "").replace(/<@[A-Z0-9]+>/g, "").trim();
  const m = /^[\s\-–—:,.!*_~>]*gtd\b[\s:,.!*_~-]*([\s\S]*)$/i.exec(t);
  if (!m) return null;
  let rest = m[1].trim();
  let pageId: string | null = null;
  const link = /<?(https?:\/\/[^\s|>]*notion\.(?:so|com|site)[^\s|>]*)(?:\|[^>]*)?>?/i.exec(rest);
  if (link) {
    const path = link[1].split(/[?#]/)[0].replace(/-/g, "");
    const ids = path.match(/[0-9a-f]{32}/gi);
    if (ids?.length) pageId = ids[ids.length - 1].toLowerCase();
    rest = rest.replace(link[0], "").trim();
  }
  return { query: rest || null, pageId };
}

/** Do all words of the query appear in the text (case and accents ignored)? */
export function matchesQuery(text: string, query: string): boolean {
  const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const hay = fold(text);
  const words = fold(query).split(/[^a-z0-9]+/).filter((w) => w.length > 1);
  return words.length > 0 && words.every((w) => hay.includes(w));
}

export interface RecordingRow {
  id: string;
  url: string;
  title: string;
  created: string;
  done: boolean;
}

export interface RecordingContent {
  /** The meeting's own title (from the meeting-notes block), else the row title. */
  title: string;
  text: string;
  blockTypes: string[];
}

const plain = (rich: any): string => (Array.isArray(rich) ? rich.map((r: any) => r?.plain_text ?? r?.text?.content ?? "").join("") : "");

function rowFrom(page: any): RecordingRow {
  const props = page?.properties || {};
  const titleProp: any = Object.values(props).find((p: any) => p?.type === "title");
  return {
    id: normId(page.id),
    url: page.url || `https://www.notion.so/${normId(page.id)}`,
    title: plain(titleProp?.title) || "Untitled recording",
    created: page.created_time || "",
    done: props[RECORDINGS.doneProp]?.checkbox === true,
  };
}

/** Recordings handled since the last restart, for when the GTD column can't be written. */
const doneHere = new Set<string>();

export async function listRecordings(limit = 25): Promise<RecordingRow[]> {
  const res: any = await notionDataSourceClient().request({
    path: `data_sources/${RECORDINGS.dataSourceId}/query`,
    method: "post",
    body: { page_size: limit, sorts: [{ timestamp: "created_time", direction: "descending" }] },
  } as any);
  return (res?.results || []).map(rowFrom);
}

function inRecordings(page: any): boolean {
  const p = page?.parent || {};
  return [p.data_source_id, p.database_id].filter(Boolean).some((x: string) => [RECORDINGS.dataSourceId, RECORDINGS.databaseId].includes(normId(x)));
}

const LINE_PREFIX: Record<string, string> = {
  heading_1: "# ",
  heading_2: "## ",
  heading_3: "### ",
  bulleted_list_item: "- ",
  numbered_list_item: "- ",
  to_do: "- [ ] ",
  quote: "> ",
};

/** Read a recording page: every text block, following meeting-notes pointers. */
export async function readRecording(pageId: string, fallbackTitle = ""): Promise<RecordingContent> {
  const c = notionDataSourceClient();
  const types = new Set<string>();
  const main: string[] = [];
  const transcript: string[] = [];
  let title = "";
  let calls = 0;

  async function walk(blockId: string, depth: number, into: string[]): Promise<void> {
    let cursor: string | undefined;
    do {
      if (depth > 6 || calls++ >= 60) return;
      const r: any = await c.blocks.children.list({ block_id: blockId, page_size: 100, start_cursor: cursor });
      for (const b of r?.results || []) await visit(b, depth, into);
      cursor = r?.has_more ? r.next_cursor : undefined;
    } while (cursor);
  }

  async function visit(b: any, depth: number, into: string[]): Promise<void> {
    types.add(String(b?.type));
    const body = b?.[b?.type] || {};
    if (!title && Array.isArray(body.title)) title = plain(body.title).trim();
    const line = plain(body.rich_text).trim();
    if (line) into.push(`${LINE_PREFIX[b.type] || ""}${b.type === "to_do" && body.checked ? "[x] " : ""}${line}`);
    // Meeting notes keep summary / notes / transcript as separate blocks, named by id.
    const holders = [body, body.children].filter((x) => x && typeof x === "object");
    for (const h of holders) {
      for (const [k, v] of Object.entries(h)) {
        if (/_block_id$/.test(k) && typeof v === "string") await walk(v, depth + 1, /transcript/i.test(k) ? transcript : into);
      }
    }
    if (b?.has_children && b.type !== "child_page" && b.type !== "child_database") {
      await walk(b.id, depth + 1, /transcript/i.test(String(b.type)) ? transcript : into);
    }
  }

  await walk(pageId, 0, main);
  let text = main.join("\n");
  // The transcript only when there is no summary to work from (it is long and noisy).
  if (!text.trim() && transcript.length) text = `Transcript:\n${transcript.join("\n")}`;
  return { title: title || fallbackTitle, text: text.slice(0, 40000), blockTypes: Array.from(types) };
}

/** Tick the GTD box; add the column first if it isn't there. False when Notion refuses both. */
export async function markDone(row: RecordingRow): Promise<boolean> {
  doneHere.add(row.id);
  const c = notionDataSourceClient();
  const tick = () => c.pages.update({ page_id: row.id, properties: { [RECORDINGS.doneProp]: { checkbox: true } } } as any);
  try {
    await tick();
    return true;
  } catch {
    try {
      await c.request({
        path: `data_sources/${RECORDINGS.dataSourceId}`,
        method: "patch",
        body: { properties: { [RECORDINGS.doneProp]: { checkbox: {} } } },
      } as any);
      await tick();
      return true;
    } catch (e: any) {
      console.warn("[gtd] could not tick the GTD box:", e?.message || e);
      return false;
    }
  }
}

export type Pick =
  | { ok: true; row: RecordingRow; content: RecordingContent }
  | { ok: false; reason: "no_access" | "none_left" | "no_match" | "not_in_recordings" | "unreadable"; detail?: string };

function isAccessError(e: any): boolean {
  return /object_not_found|restricted_resource|unauthorized/i.test(String(e?.code || e?.message || ""));
}

/** Which recording GTD should work on, read and ready. */
export async function pickRecording(req: GtdRequest): Promise<Pick> {
  try {
    if (req.pageId) {
      const page: any = await notionDataSourceClient().pages.retrieve({ page_id: req.pageId });
      if (!inRecordings(page)) return { ok: false, reason: "not_in_recordings" };
      const row = rowFrom(page);
      const content = await readRecording(row.id, row.title);
      if (!content.text.trim()) return { ok: false, reason: "unreadable", detail: content.blockTypes.join(", ") || "nothing" };
      return { ok: true, row, content };
    }

    const rows = await listRecordings(25);
    let lastEmpty: RecordingContent | null = null;
    let reads = 0;
    for (const row of rows) {
      if (!req.query && (row.done || doneHere.has(row.id))) continue;
      if (reads++ >= (req.query ? 15 : 10)) break;
      const content = await readRecording(row.id, row.title);
      if (!content.text.trim()) {
        lastEmpty = content;
        continue;
      }
      if (req.query && !matchesQuery(`${row.title}\n${content.title}`, req.query)) continue;
      return { ok: true, row, content };
    }
    if (req.query) return { ok: false, reason: "no_match" };
    // Nothing readable: either all done, or Notion doesn't give the contents.
    if (lastEmpty && lastEmpty.blockTypes.some((t) => t !== "paragraph")) {
      return { ok: false, reason: "unreadable", detail: lastEmpty.blockTypes.join(", ") };
    }
    return { ok: false, reason: "none_left" };
  } catch (e: any) {
    if (isAccessError(e)) return { ok: false, reason: "no_access", detail: String(e?.code || e?.message || e) };
    throw e;
  }
}

/** What Pidgi says when GTD can't go ahead. */
export function pickProblem(p: Extract<Pick, { ok: false }>): string {
  switch (p.reason) {
    case "no_access":
      return "I can't open 🎙️ Recordings. In Notion, open it → ••• → Connections → add Pidgi, then say GTD again.";
    case "none_left":
      return "Every recent recording already had GTD. Name one (`GTD GIZ`) or paste its Notion link.";
    case "no_match":
      return "I couldn't find a recent recording matching that. Try other words, or paste its Notion link after GTD.";
    case "not_in_recordings":
      return "That link isn't in your 🎙️ Recordings, so I left it alone.";
    case "unreadable":
      return `I found the recording, but Notion doesn't give me its contents (I only see these block types: ${p.detail}). Send this message to Claude so we can pick another route.`;
  }
}
