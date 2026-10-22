/**
 * GIZ's public tender list, https://ausschreibungen.giz.de/Satellite/company/welcome.do
 *
 * No feed or API. The list is a plain HTML table, newest first, 20 rows a page, and
 * the page parameter works without a session:
 *   welcome.do?method=showTable&fromSearch=1&selectedTablePagePROJECT_RESULT=N
 * Scout reads at most SCOUT_GIZ_MAX_PAGES pages (default 3) per run and stops early
 * once a page is older than the lookback window.
 *
 * What the list gives: publication date, deadline (or "nv" = none), the title with
 * the GIZ reference in front ("10032371 - Strengthening ..."), the procedure
 * (VgV or UVgO, and Ausschreibung / TNW / Vergebener Auftrag / ...), and the project
 * room link (pid). Scope, budget and the tender documents sit behind a free
 * registration, so the scorer judges GIZ items on the title and procedure alone;
 * the digest says so. Only open procedures are kept: awarded contracts, contract
 * changes and planned tenders are skipped.
 *
 * Markup verified on 2026-10-14. The page is served in a Windows-1252 flavour;
 * politeFetch decodes it from the Content-Type header.
 */
import * as cheerio from "cheerio";
import { politeFetch } from "../http.js";
import type { FetchContext, Opportunity, SourceAdapter, SourceResult } from "../types.js";

export const GIZ_BASE = "https://ausschreibungen.giz.de";
export const GIZ_LIST = `${GIZ_BASE}/Satellite/company/welcome.do`;

export function gizPageUrl(page: number): string {
  return page <= 1 ? GIZ_LIST : `${GIZ_LIST}?method=showTable&fromSearch=1&selectedTablePagePROJECT_RESULT=${page}`;
}

/** "13.10.2026" -> "2026-10-13"; "" for "nv" or anything else. */
export function parseGizDate(s: string): string {
  const m = String(s || "").match(/(\d{2})\.(\d{2})\.(\d{4})/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : "";
}

/** "13.10.2026 um 05:54 Uhr" (abbr title) -> "2026-10-13T05:54"; falls back to the date. */
function parseGizDateTime(s: string): string {
  const m = String(s || "").match(/(\d{2})\.(\d{2})\.(\d{4})(?:\s+um\s+(\d{2}):(\d{2}))?/);
  if (!m) return "";
  return m[4] ? `${m[3]}-${m[2]}-${m[1]}T${m[4]}:${m[5]}` : `${m[3]}-${m[2]}-${m[1]}`;
}

/** Procedures that are still open to bids. */
const OPEN = /ausschreibung|teilnahmewettbewerb|\btnw\b|interessenbekundung|verhandlungsverfahren/i;
const CLOSED = /vergebener auftrag|auftrags(?:ä|a|)nderung|beabsichtigte|vorinformation|aufhebung/i;

export function splitGizTitle(raw: string): { reference: string; title: string } {
  const t = raw.replace(/\s+/g, " ").trim();
  const m = t.match(/^(\d{6,9}[A-Za-z]?)\s*[-–_:]\s*(.+)$/);
  if (m) return { reference: m[1], title: m[2].trim() };
  return { reference: "", title: t };
}

export interface GizRow {
  published: string; // YYYY-MM-DD
  deadline: string; // YYYY-MM-DD or ""
  deadlineTime: string; // "12:00" or ""
  rawTitle: string;
  reference: string;
  title: string;
  procedure: string; // "VgV · Ausschreibung"
  open: boolean;
  pid: string;
}

export function parseGizList(html: string): { rows: GizRow[]; page: number; pages: number; total: number } {
  const $ = cheerio.load(html);
  const rows: GizRow[] = [];
  $("table tbody tr").each((_, tr) => {
    const tds = $(tr).find("td");
    if (tds.length < 4) return;
    const pid = ($(tr).find("a[href*='projectForwarding.do?pid=']").attr("href") || "").match(/pid=(\d+)/)?.[1] || "";
    if (!pid) return;
    const cellText = (i: number) => $(tds[i]).text().replace(/\s+/g, " ").trim();
    const abbrTitle = (i: number) => ($(tds[i]).find("abbr").attr("title") || "").trim();
    const published = parseGizDate(abbrTitle(0) || cellText(0));
    // Deadline cell: an <abbr> with the date, or the text "nv" (no deadline for this procedure).
    const dl = abbrTitle(1) || cellText(1);
    const deadline = parseGizDate(dl);
    const dlTime = (parseGizDateTime(dl).match(/T(\d{2}:\d{2})/) || [])[1] || "";
    const titleCell = $(tr).find("td.word-break").first();
    const rawTitle = (titleCell.length ? titleCell.text() : cellText(2)).replace(/\s+/g, " ").trim();
    if (!rawTitle) return;
    let procedure = "";
    tds.each((_, td) => {
      // "VgV<br />Ausschreibung" has no whitespace between the two words once rendered as text.
      const t = ($(td).html() || "").replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
      const m = t.match(/^(VgV|UVgO|VOB|SektVO)\s*(.*)$/i);
      if (m) procedure = m[2] ? `${m[1]} · ${m[2]}` : m[1];
    });
    const { reference, title } = splitGizTitle(rawTitle);
    const open = OPEN.test(procedure) && !CLOSED.test(procedure);
    rows.push({ published, deadline, deadlineTime: dlTime, rawTitle, reference, title, procedure, open, pid });
  });
  const pg = $(".browsePagesText").text().match(/Seite:\s*(\d+)\s*von\s*(\d+)\s*-\s*Gesamteintr[^:]*:\s*(\d+)/i);
  return { rows, page: pg ? Number(pg[1]) : 1, pages: pg ? Number(pg[2]) : 1, total: pg ? Number(pg[3]) : rows.length };
}

export function mapGizRow(r: GizRow): Opportunity {
  const lines = [
    `GIZ tender ${r.reference || "(no reference shown)"}: ${r.title}`,
    `Procedure: ${r.procedure || "not shown"}.`,
    r.deadline ? `Deadline: ${r.deadline}${r.deadlineTime ? ` ${r.deadlineTime} (Germany)` : ""}.` : "Deadline: none shown.",
    "Scope, budget, duration and selection criteria are only visible after a free registration on the GIZ portal; score on the title and procedure. VgV = above the EU threshold (large, often consortium-sized); UVgO = below it (smaller contracts). TNW = participation competition first.",
  ];
  return {
    id: `giz:${r.pid}`,
    source: "giz",
    title: r.reference ? `${r.reference} - ${r.title}` : r.title,
    buyer: "GIZ",
    country: "",
    deadline: r.deadline,
    published: r.published,
    url: `${GIZ_BASE}/Satellite/public/company/projectForwarding.do?pid=${r.pid}`,
    summary: lines.join("\n"),
    meta: { procedure: r.procedure, reference: r.reference },
  };
}

export const gizAdapter: SourceAdapter = {
  id: "giz",
  async fetch(ctx: FetchContext): Promise<SourceResult> {
    const notes: string[] = [];
    const items: Opportunity[] = [];
    const maxPages = Math.max(1, Math.min(12, Number(process.env.SCOUT_GIZ_MAX_PAGES) || 3));
    let ok = true;
    let skippedClosed = 0;
    let skippedOld = 0;
    for (let page = 1; page <= maxPages; page++) {
      let html = "";
      try {
        const r = await politeFetch(gizPageUrl(page), { accept: "text/html", budget: 12 });
        if (!r.ok) {
          notes.push(`GIZ page ${page}: HTTP ${r.status}`);
          ok = false;
          break;
        }
        html = r.text;
      } catch (e: any) {
        notes.push(`GIZ page ${page} failed: ${e?.message || e}`);
        ok = false;
        break;
      }
      const parsed = parseGizList(html);
      if (!parsed.rows.length) {
        notes.push(`GIZ page ${page}: no rows parsed (markup changed?)`);
        ok = false;
        break;
      }
      let olderSeen = false;
      for (const row of parsed.rows) {
        if (row.published && row.published < ctx.since) {
          skippedOld++;
          olderSeen = true;
          continue;
        }
        if (!row.open) {
          skippedClosed++;
          continue;
        }
        items.push(mapGizRow(row));
      }
      ctx.log(`giz page ${page}/${parsed.pages}: ${parsed.rows.length} rows, ${items.length} open so far`);
      if (olderSeen || page >= parsed.pages) break;
    }
    notes.push(`${items.length} open notices since ${ctx.since}; skipped ${skippedClosed} awarded/changed/planned, ${skippedOld} older`);
    return { source: "giz", items, notes, ok };
  },
};
