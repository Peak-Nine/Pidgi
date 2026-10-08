/**
 * World Bank procurement notices (the list behind
 * https://projects.worldbank.org/en/projects-operations/procurement).
 *
 * Access: the public search API, anonymous, JSON. Verified live on 8 Oct 2026:
 *   GET https://search.worldbank.org/api/v2/procnotices?format=json&rows=100&os=0
 *       &srt=submission_date&order=desc&procurement_group=CS
 *       &notice_type=Request for Expression of Interest
 * "CS" is consulting services; a Request for Expression of Interest is the open
 * call where consultancies and individual consultants put themselves forward.
 * About 20 to 45 of those per weekday. Each notice carries its full text, so the
 * scorer reads the actual terms (often the short terms of reference), not a title.
 *
 * These are notices from World Bank financed projects (the borrower buys). The
 * World Bank's own corporate procurement runs on a separate portal, not covered.
 */
import { envInt } from "../env.js";
import { politeFetch } from "../http.js";
import { stripHtml } from "../rss.js";
import type { FetchContext, Opportunity, SourceAdapter, SourceResult } from "../types.js";

export const WORLDBANK_API = process.env.SCOUT_WORLDBANK_API || "https://search.worldbank.org/api/v2/procnotices";

const FIELDS = [
  "id",
  "notice_type",
  "notice_lang_name",
  "submission_date",
  "submission_deadline_date",
  "submission_deadline_time",
  "project_ctry_name",
  "project_id",
  "project_name",
  "bid_reference_no",
  "bid_description",
  "procurement_group",
  "procurement_method_name",
  "contact_organization",
  "notice_text",
];

export function worldbankUrl(offset: number, rows = 100): string {
  const q = new URLSearchParams({
    format: "json",
    rows: String(rows),
    os: String(offset),
    srt: "submission_date",
    order: "desc",
    procurement_group: process.env.SCOUT_WORLDBANK_GROUP || "CS",
    notice_type: process.env.SCOUT_WORLDBANK_NOTICE_TYPE || "Request for Expression of Interest",
    fl: FIELDS.join(","),
  });
  return `${WORLDBANK_API}?${q.toString()}`;
}

export function mapWorldbankNotice(n: any): Opportunity {
  const text = stripHtml(String(n.notice_text || "")).replace(/\s+/g, " ").trim();
  const title = String(n.bid_description || n.project_name || "").trim();
  return {
    id: `worldbank:${n.id}`,
    source: "worldbank",
    title,
    buyer: String(n.contact_organization || "").trim() || "World Bank financed project",
    country: String(n.project_ctry_name || ""),
    deadline: String(n.submission_deadline_date || "").slice(0, 10),
    published: String(n.submission_date || "").slice(0, 10),
    url: `https://projects.worldbank.org/en/projects-operations/procurement-detail/${encodeURIComponent(String(n.id || ""))}`,
    summary: text.slice(0, 6000),
    meta: {
      project: String(n.project_name || ""),
      method: String(n.procurement_method_name || ""),
      language: String(n.notice_lang_name || ""),
      reference: String(n.bid_reference_no || ""),
    },
  };
}

export const worldbankAdapter: SourceAdapter = {
  id: "worldbank",
  async fetch(ctx: FetchContext): Promise<SourceResult> {
    const notes: string[] = [];
    const items: Opportunity[] = [];
    const rows = 100;
    const maxPages = envInt("SCOUT_WORLDBANK_MAX_PAGES", 4);
    const keepIndividual = process.env.SCOUT_WORLDBANK_INDIVIDUAL === "1";
    let individuals = 0;
    try {
      for (let page = 0; page < maxPages; page++) {
        const r = await politeFetch(worldbankUrl(page * rows, rows), { accept: "application/json", budget: maxPages + 2, conditional: false });
        if (!r.ok) {
          notes.push(`World Bank HTTP ${r.status}: ${r.text.slice(0, 160)}`);
          return { source: "worldbank", items, notes, ok: false };
        }
        const j = JSON.parse(r.text);
        const batch: any[] = j?.procnotices || [];
        let older = false;
        for (const n of batch) {
          const pub = String(n.submission_date || "").slice(0, 10);
          if (pub && pub < ctx.since) {
            older = true;
            continue;
          }
          // Individual Consultant Selection is mostly staff posts in a project unit (coordinator,
          // procurement officer) in the country. Skipped unless SCOUT_WORLDBANK_INDIVIDUAL=1. [assumption]
          if (!keepIndividual && /individual/i.test(String(n.procurement_method_name || ""))) {
            individuals++;
            continue;
          }
          items.push(mapWorldbankNotice(n));
        }
        ctx.log(`worldbank: page ${page + 1} -> ${batch.length} notices`);
        // Sorted newest first: once we pass the window, stop asking.
        if (older || batch.length < rows) break;
      }
      notes.push(`${items.length} expressions of interest from firms since ${ctx.since}${individuals ? ` (${individuals} individual-consultant posts left out)` : ""}`);
      return { source: "worldbank", items, notes, ok: true };
    } catch (e: any) {
      notes.push(`World Bank failed: ${e?.message || e}`);
      return { source: "worldbank", items, notes, ok: false };
    }
  },
};
