/**
 * Enabel's public procurement list, https://www.enabel.be/public-procurement/
 *
 * No feed or API, so a gentle page reader: the "Open" filter (is_status=0),
 * ten notices per page, newest first, at most SCOUT_ENABEL_MAX_PAGES pages
 * (default 3) per run with 1.5 s between requests and a descriptive User-Agent.
 * Markup verified on 2026-10-07:
 *   <div class="card--news card--tenders ...">
 *     <p class="h5"><span>TZA22003-10792 – Public service contract for “...”</span></p>
 *     <p><strong>Country : </strong> Tanzania</p>
 *     <p><strong>Closing date : </strong> 23 October 2026 13:00</p>
 *     <div class="hidden__card hidden"> Status / Applicable legislation / Attachments (PDF links) </div>
 *   </div>
 * If the markup changes, the parser returns nothing and the run notes say so;
 * nothing breaks. Above-threshold Enabel contracts also appear on TED.
 */
import * as cheerio from "cheerio";
import { politeFetch, politeFetchBytes } from "../http.js";
import type { FetchContext, Opportunity, SourceAdapter, SourceResult } from "../types.js";

export const ENABEL_LIST = "https://www.enabel.be/public-procurement/";

const MONTHS: Record<string, string> = {
  january: "01", february: "02", march: "03", april: "04", may: "05", june: "06", july: "07", august: "08",
  september: "09", october: "10", november: "11", december: "12",
  januari: "01", februari: "02", maart: "03", mei: "05", juni: "06", juli: "07", augustus: "08", oktober: "10",
  janvier: "01", février: "02", fevrier: "02", mars: "03", avril: "04", mai: "05", juin: "06", juillet: "07", août: "08", aout: "08", septembre: "09", octobre: "10", novembre: "11", décembre: "12", decembre: "12",
};

/** "23 October 2026 13:00" -> "2026-10-23" (returns "" when it cannot read the date). */
export function parseEnabelDate(s: string): string {
  const m = String(s || "").trim().match(/(\d{1,2})\s+([A-Za-zéû]+)\s+(\d{4})/);
  if (!m) return "";
  const mm = MONTHS[m[2].toLowerCase()];
  if (!mm) return "";
  return `${m[3]}-${mm}-${m[1].padStart(2, "0")}`;
}

export function parseEnabelList(html: string): Opportunity[] {
  const $ = cheerio.load(html);
  const out: Opportunity[] = [];
  $(".card--tenders").each((_, el) => {
    const card = $(el);
    const title = card.find("p.h5").first().text().replace(/\s+/g, " ").trim();
    if (!title) return;
    const field = (label: string) => {
      let v = "";
      card.find("p").each((_, p) => {
        const strong = $(p).find("strong").first().text().replace(/\s+/g, " ").trim().toLowerCase();
        if (strong.startsWith(label)) v = $(p).text().replace(/\s+/g, " ").replace(/^[^:]*:\s*/, "").trim();
      });
      return v;
    };
    const country = field("country");
    const closing = field("closing date");
    const status = field("status");
    const legislation = field("applicable legislation");
    const attachments: string[] = [];
    card.find("a[href]").each((_, a) => {
      const href = String($(a).attr("href") || "");
      if (/\.(pdf|docx?|xlsx?|zip)(\?|$)/i.test(href)) attachments.push(href);
    });
    const ref = (title.match(/^([A-Z]{3}\d{5}-\d{4,6})/) || [])[1];
    const id = ref || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 80);
    out.push({
      id: `enabel:${id}`,
      source: "enabel",
      title,
      buyer: "Enabel",
      country,
      deadline: parseEnabelDate(closing),
      published: "",
      url: attachments[0] || ENABEL_LIST,
      summary: "",
      attachments,
      meta: { status, legislation, closing_raw: closing },
    });
  });
  return out;
}

export const enabelAdapter: SourceAdapter = {
  id: "enabel",
  async fetch(ctx: FetchContext): Promise<SourceResult> {
    const notes: string[] = [];
    const items: Opportunity[] = [];
    const maxPages = Number(process.env.SCOUT_ENABEL_MAX_PAGES) || 3;
    let ok = true;
    for (let page = 1; page <= maxPages; page++) {
      const url = page === 1 ? `${ENABEL_LIST}?is_status=0` : `${ENABEL_LIST}page/${page}?is_status=0`;
      try {
        const r = await politeFetch(url, { accept: "text/html", budget: maxPages + 6 });
        if (!r.ok) {
          notes.push(`Enabel page ${page}: HTTP ${r.status}`);
          ok = false;
          break;
        }
        const parsed = parseEnabelList(r.text);
        if (!parsed.length) {
          notes.push(page === 1 ? "Enabel: no tender cards found, the page markup may have changed" : `Enabel: page ${page} empty`);
          break;
        }
        items.push(...parsed);
        ctx.log(`enabel: page ${page} -> ${parsed.length} open notices`);
        if (parsed.length < 10) break;
      } catch (e: any) {
        notes.push(`Enabel page ${page} failed: ${e?.message || e}`);
        ok = false;
        break;
      }
    }
    notes.push(`${items.length} open notices (first ${maxPages} pages)`);
    return { source: "enabel", items, notes, ok };
  },
};

/**
 * Pull the first pages of a tender PDF so the scorer has more than a title.
 * Only called for shortlisted Enabel items, capped per run by the caller.
 */
export async function enrichFromPdf(item: Opportunity, maxChars = 6000): Promise<string> {
  const pdf = (item.attachments || []).find((a) => /\.pdf(\?|$)/i.test(a));
  if (!pdf) return "";
  const { PDFParse } = await import("pdf-parse");
  const r = await politeFetchBytes(pdf, { budget: 12 });
  if (!r.ok) return "";
  const parser = new PDFParse({ data: new Uint8Array(r.bytes) });
  try {
    const t = await parser.getText({ first: 6 } as any);
    return String(t.text || "").replace(/\s+/g, " ").slice(0, maxChars);
  } catch {
    return "";
  } finally {
    await parser.destroy().catch(() => undefined);
  }
}
