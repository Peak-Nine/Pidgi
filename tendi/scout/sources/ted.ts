/**
 * TED (Tenders Electronic Daily), the EU's notice database.
 *
 * Access: the official Search API, anonymous, documented at
 * https://ted.europa.eu/api/documentation/index.html (developers corner:
 * https://ted.europa.eu/en/simap/developers-corner-for-reusers). We make two or
 * three requests per day (one per page of 100 results, at most SCOUT_TED_MAX_PAGES).
 * Query shape verified live on 2026-10-07.
 *
 * Scope: contract notices and prior information notices with a call for
 * competition, in CPV groups that cover consultancy, evaluation, research,
 * development services and training. The keyword prefilter does the rest.
 */
import { politeFetch } from "../http.js";
import { decodeEntities } from "../rss.js";
import type { FetchContext, Opportunity, SourceAdapter, SourceResult } from "../types.js";

export const TED_API = process.env.SCOUT_TED_API || "https://api.ted.europa.eu/v3/notices/search";

// CPV divisions/groups we watch. Hierarchical match on TED's side (79410000 also
// catches 79411000, 79419000 ...). Edit via SCOUT_TED_CPV (space separated).
export const DEFAULT_CPV = [
  "79410000", // business and management consultancy services
  "79400000", // business and management consultancy and related services
  "73220000", // development consultancy services
  "73200000", // research and development consultancy services
  "79311000", // survey services
  "79315000", // social research services
  "80500000", // training services
  "85312300", // guidance and counselling services (social)
  "98133000", // services furnished by social membership organisations
  "75211200", // foreign economic-aid-related services
];

export const TED_NOTICE_TYPES = ["cn-standard", "cn-social", "pin-cfc-standard", "pin-cfc-social", "cn-desg"];

const FIELDS = [
  "publication-number",
  "notice-title",
  "description-proc",
  "description-lot",
  "buyer-name",
  "buyer-country",
  "publication-date",
  "deadline-receipt-tender-date-lot",
  "classification-cpv",
  "notice-type",
  "contract-nature",
  "estimated-value-glo",
  "estimated-value-cur-glo",
  "place-of-performance",
  "links",
];

const LANG_PREF = ["eng", "fra", "nld", "deu", "spa", "ita", "por"];

export function pickLang(v: any): string {
  if (!v) return "";
  if (typeof v === "string") return decodeEntities(v);
  if (Array.isArray(v)) return v.map(pickLang).filter(Boolean).join(" | ");
  if (typeof v === "object") {
    for (const l of LANG_PREF) if (v[l]) return pickLang(v[l]);
    const first = Object.values(v)[0];
    return pickLang(first);
  }
  return String(v);
}

function uniq(a: any[]): string[] {
  return Array.from(new Set((a || []).map((x) => decodeEntities(String(x))).filter(Boolean)));
}

export function tedDate(s: any): string {
  const m = String(s || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : "";
}

export function tedQuery(sinceYmd: string, cpv: string[] = DEFAULT_CPV): string {
  const since = sinceYmd.replace(/-/g, "");
  return `classification-cpv IN (${cpv.join(" ")}) AND publication-date >= ${since} AND notice-type IN (${TED_NOTICE_TYPES.join(" ")})`;
}

export function mapNotice(n: any): Opportunity {
  const pub = String(n["publication-number"] || "");
  // English titles read "Belgium – Research and development consultancy services – <original title>":
  // TED translates the country and CPV label, the title itself stays in the buyer's language.
  const fullTitle = pickLang(n["notice-title"]);
  const prefix = (fullTitle.match(/^([^–]{0,60})–\s*([^–]{0,120})–\s*/) || []) as string[];
  const title = (prefix[0] ? fullTitle.slice(prefix[0].length) : fullTitle).trim() || fullTitle;
  const desc = [pickLang(n["description-proc"]), pickLang(n["description-lot"])].filter(Boolean).join("\n").slice(0, 4000);
  const buyer = uniq(Object.values(n["buyer-name"] || {}).flat()).join(", ") || pickLang(n["buyer-name"]);
  const country = uniq(n["buyer-country"]).join(", ");
  const links = n.links || {};
  const url = links?.html?.ENG || links?.html?.MUL || (pub ? `https://ted.europa.eu/en/notice/${pub}/html` : "https://ted.europa.eu");
  const value = n["estimated-value-glo"] ? `${uniq(n["estimated-value-glo"]).join("/")} ${uniq(n["estimated-value-cur-glo"]).join("/")}`.trim() : "";
  const deadlines = uniq(n["deadline-receipt-tender-date-lot"]).map(tedDate).filter(Boolean).sort();
  return {
    id: `ted:${pub}`,
    source: "ted",
    title,
    buyer,
    country,
    deadline: deadlines[0] || "",
    published: tedDate(n["publication-date"]),
    url,
    summary: desc,
    cpv: uniq(n["classification-cpv"]),
    meta: {
      notice_type: String(n["notice-type"] || ""),
      ...(prefix[2] ? { ted_category: prefix[2].trim() } : {}),
      contract_nature: uniq(n["contract-nature"]).join(", "),
      ...(value ? { estimated_value: value } : {}),
      place: uniq(n["place-of-performance"]).join(", "),
    },
  };
}

export const tedAdapter: SourceAdapter = {
  id: "ted",
  async fetch(ctx: FetchContext): Promise<SourceResult> {
    const notes: string[] = [];
    const items: Opportunity[] = [];
    const cpv = (process.env.SCOUT_TED_CPV || "").split(/\s+/).filter(Boolean);
    const maxPages = Number(process.env.SCOUT_TED_MAX_PAGES) || 2;
    const limit = 100;
    try {
      for (let page = 1; page <= maxPages; page++) {
        const body = { query: tedQuery(ctx.since, cpv.length ? cpv : DEFAULT_CPV), fields: FIELDS, page, limit, scope: "ACTIVE" };
        const r = await politeFetch(TED_API, {
          method: "POST",
          body: JSON.stringify(body),
          headers: { "content-type": "application/json" },
          accept: "application/json",
          budget: 6,
          conditional: false,
        });
        if (!r.ok) {
          notes.push(`TED HTTP ${r.status}: ${r.text.slice(0, 200)}`);
          break;
        }
        const j = JSON.parse(r.text);
        const batch: any[] = j?.notices || [];
        for (const n of batch) items.push(mapNotice(n));
        ctx.log(`ted: page ${page} -> ${batch.length} notices (total ${j?.totalNoticeCount ?? "?"})`);
        if (batch.length < limit) break;
      }
      notes.push(`${items.length} notices since ${ctx.since}`);
      return { source: "ted", items, notes, ok: true };
    } catch (e: any) {
      notes.push(`TED failed: ${e?.message || e}`);
      return { source: "ted", items, notes, ok: false };
    }
  },
};
