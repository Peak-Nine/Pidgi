/**
 * ReliefWeb Jobs (consultancies posted by NGOs, UN agencies and foundations).
 *
 * The wall, verified live on 2026-10-07: the API answers 403 "You are not using an
 * approved appname" unless the appname was approved by ReliefWeb. Request one
 * (free) via https://apidoc.reliefweb.int/parameters#appname and set
 * RELIEFWEB_APPNAME. Until then this adapter reports "waiting for appname" and
 * fetches nothing; we do not try the public site, which blocks automated reads.
 *
 * Limits (from the API docs): 1,000 calls/day, 1,000 entries/call. We use one or
 * two calls per day.
 */
import { politeFetch } from "../http.js";
import type { FetchContext, Opportunity, SourceAdapter, SourceResult } from "../types.js";

export const RELIEFWEB_API = process.env.SCOUT_RELIEFWEB_API || "https://api.reliefweb.int/v2/jobs";

// Jobs on ReliefWeb carry a "type" (e.g. Consultancy) and "career_categories".
// We ask for consultancies posted since `since`, newest first.
export function reliefwebBody(sinceIso: string, limit = 200) {
  return {
    limit,
    sort: ["date.created:desc"],
    filter: {
      operator: "AND",
      conditions: [
        { field: "date.created", value: { from: `${sinceIso}T00:00:00+00:00` } },
        { field: "type.name", value: ["Consultancy"] },
      ],
    },
    fields: {
      include: ["title", "url", "date.created", "date.closing", "source.name", "country.name", "type.name", "career_categories.name", "theme.name", "body"],
    },
  };
}

export function mapReliefwebJob(j: any): Opportunity {
  const f = j.fields || {};
  const body = String(f.body || "").replace(/\s+/g, " ").slice(0, 4000);
  return {
    id: `reliefweb:${j.id}`,
    source: "reliefweb",
    title: String(f.title || ""),
    buyer: (f.source || []).map((s: any) => s.name).join(", "),
    country: (f.country || []).map((c: any) => c.name).join(", "),
    deadline: String(f.date?.closing || "").slice(0, 10),
    published: String(f.date?.created || "").slice(0, 10),
    url: String(f.url || `https://reliefweb.int/node/${j.id}`),
    summary: body,
    meta: {
      type: (f.type || []).map((t: any) => t.name).join(", "),
      categories: (f.career_categories || []).map((c: any) => c.name).join(", "),
      themes: (f.theme || []).map((t: any) => t.name).join(", "),
    },
  };
}

export const reliefwebAdapter: SourceAdapter = {
  id: "reliefweb",
  async fetch(ctx: FetchContext): Promise<SourceResult> {
    const appname = (process.env.RELIEFWEB_APPNAME || "").trim();
    if (!appname) {
      return {
        source: "reliefweb",
        items: [],
        ok: true,
        notes: ["skipped: waiting for an approved appname (set RELIEFWEB_APPNAME; request one at https://apidoc.reliefweb.int/parameters#appname)"],
      };
    }
    const notes: string[] = [];
    const items: Opportunity[] = [];
    try {
      const url = `${RELIEFWEB_API}?appname=${encodeURIComponent(appname)}`;
      const r = await politeFetch(url, {
        method: "POST",
        body: JSON.stringify(reliefwebBody(ctx.since)),
        headers: { "content-type": "application/json" },
        accept: "application/json",
        budget: 3,
        conditional: false,
      });
      if (!r.ok) {
        notes.push(`ReliefWeb HTTP ${r.status}: ${r.text.slice(0, 200)}`);
        return { source: "reliefweb", items, notes, ok: false };
      }
      const j = JSON.parse(r.text);
      for (const job of j?.data || []) items.push(mapReliefwebJob(job));
      ctx.log(`reliefweb: ${items.length} consultancies since ${ctx.since} (total ${j?.totalCount ?? "?"})`);
      notes.push(`${items.length} consultancies since ${ctx.since}`);
      return { source: "reliefweb", items, notes, ok: true };
    } catch (e: any) {
      notes.push(`ReliefWeb failed: ${e?.message || e}`);
      return { source: "reliefweb", items, notes, ok: false };
    }
  },
};
