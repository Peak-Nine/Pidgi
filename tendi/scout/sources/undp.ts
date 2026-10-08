/**
 * UNDP Procurement Notices via the public RSS feeds (RSS 1.0 / RDF), updated hourly:
 *   https://procurement-notices.undp.org/rss_feeds/rss.xml   all notices
 *   https://procurement-notices.undp.org/rss_feeds/RAF.xml   Africa
 *   https://procurement-notices.undp.org/rss_feeds/RAB.xml   Arab States
 *   https://procurement-notices.undp.org/rss_feeds/RAS.xml   Asia-Pacific
 *   https://procurement-notices.undp.org/rss_feeds/RER.xml   Europe & CIS
 *   https://procurement-notices.undp.org/rss_feeds/RLA.xml   Latin America
 *   https://procurement-notices.undp.org/rss_feeds/HQ.xml    Headquarters
 * (feed list verified on the feeds page, 2026-10-07). One or two GETs per day.
 */
import { politeFetch } from "../http.js";
import { parseFeed } from "../rss.js";
import type { FetchContext, Opportunity, SourceAdapter, SourceResult } from "../types.js";

export const UNDP_FEEDS: Record<string, string> = {
  all: "https://procurement-notices.undp.org/rss_feeds/rss.xml",
  RAF: "https://procurement-notices.undp.org/rss_feeds/RAF.xml",
  RAB: "https://procurement-notices.undp.org/rss_feeds/RAB.xml",
  RAS: "https://procurement-notices.undp.org/rss_feeds/RAS.xml",
  RER: "https://procurement-notices.undp.org/rss_feeds/RER.xml",
  RLA: "https://procurement-notices.undp.org/rss_feeds/RLA.xml",
  HQ: "https://procurement-notices.undp.org/rss_feeds/HQ.xml",
};

// UNDP titles often look like "RFP/UNDP/2026/123 - Consultancy for ... (Country)".
// We don't try to be clever: title and description go to the scorer as they are.
function titleCase(s: string): string {
  return s.toLowerCase().replace(/(^|[\s(\-'])([a-z])/g, (_, p, c) => p + c.toUpperCase());
}

/** "... - UNDP - PAPUA NEW GUINEA" -> "Papua New Guinea" ("" when the title has no such tail). */
export function undpCountryFromTitle(title: string): string {
  const m = title.match(/-\s*UNDP[^-]*-\s*([A-Z][A-Za-z .,'()&-]{1,60}?)\s*$/);
  if (!m) return "";
  const c = m[1].trim();
  return c.length <= 3 ? c : titleCase(c);
}

export function mapUndpItem(it: { title: string; link: string; description: string; date: string; id: string }): Opportunity {
  const nego = (it.link.match(/nego_id=(\d+)/i) || [])[1];
  const notice = (it.link.match(/notice_id=(\d+)/i) || [])[1];
  const id = nego ? `nego-${nego}` : notice || it.id || it.link;
  const deadline = (it.description.match(/deadline[^0-9]{0,30}(\d{1,2}[-/ ][A-Za-z]{3,9}[-/ ]\d{2,4}|\d{4}-\d{2}-\d{2})/i) || [])[1] || "";
  const country = (it.description.match(/country\s*[:\-]\s*([A-Za-z ,'()-]{2,60})/i) || [])[1]?.trim() || undpCountryFromTitle(it.title);
  return {
    id: `undp:${id}`,
    source: "undp",
    title: it.title,
    buyer: "UNDP",
    country,
    deadline: toIso(deadline),
    published: it.date,
    url: it.link,
    summary: it.description.slice(0, 4000),
  };
}

function toIso(s: string): string {
  if (!s) return "";
  const d = new Date(s);
  return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

export const undpAdapter: SourceAdapter = {
  id: "undp",
  async fetch(ctx: FetchContext): Promise<SourceResult> {
    const notes: string[] = [];
    const items: Opportunity[] = [];
    const feeds = (process.env.SCOUT_UNDP_FEEDS || "all").split(",").map((s) => s.trim()).filter(Boolean);
    let ok = true;
    for (const key of feeds) {
      const url = UNDP_FEEDS[key] || key;
      try {
        const r = await politeFetch(url, { accept: "application/rss+xml, application/xml, text/xml", budget: 10 });
        if (!r.ok) {
          notes.push(`UNDP ${key}: HTTP ${r.status}`);
          ok = false;
          continue;
        }
        const parsed = parseFeed(r.text);
        const fresh = parsed.filter((p) => !p.date || p.date >= ctx.since);
        for (const p of fresh) items.push(mapUndpItem(p));
        ctx.log(`undp ${key}: ${parsed.length} in feed, ${fresh.length} since ${ctx.since}${r.notModified ? " (not modified)" : ""}`);
      } catch (e: any) {
        notes.push(`UNDP ${key} failed: ${e?.message || e}`);
        ok = false;
      }
    }
    notes.push(`${items.length} notices since ${ctx.since}`);
    return { source: "undp", items, notes, ok };
  },
};
