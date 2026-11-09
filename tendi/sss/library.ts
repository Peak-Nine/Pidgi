/**
 * Read cases from the live Beyond the Grant Case Library (library.peaknine.studio).
 * The page embeds its data as `const D = {...};`.
 */
import { SSS } from "./config.js";

export interface LibraryCase {
  id: string;
  org: string;
  status?: string;
  evidence?: string;
  conf?: string;
  country?: string;
  countryFull?: string;
  region?: string;
  theme?: string;
  routes?: string[];
  routes2?: string[];
  summary?: string;
  evolution?: { label: string; text: string }[];
  evoNote?: string;
  links?: { card: string; role: string; why: string }[];
  lessons?: string;
  failed?: string;
  notes?: string;
  sources?: { title: string; url: string }[];
  [k: string]: any;
}

export interface Library {
  cases: LibraryCase[];
  cards: Record<string, any>;
}

export interface ReadableCase {
  id: string;
  organisation: string;
  where: string;
  region?: string;
  theme?: string;
  outcome: string;
  evidence?: string;
  who_pays_now: string[];
  also_pays: string[];
  summary?: string;
  timeline: { index: number; label: string; relative_year: string | null; text: string }[];
  timeline_note: string | null;
  models_at_work: { model: string; role: string; why: string }[];
  lessons: string | null;
  what_went_wrong: string | null;
  evidence_note: string | null;
  sources: { title: string; url: string }[];
  library_link: string;
  routes: string[];
}

const ROUTES: Record<string, string> = {
  U: "users pay",
  G: "government pays",
  B: "business pays",
  O: "outcome funders pay",
  M: "members and community pay",
  K: "investors pay",
  C: "costs fall",
  D: "donors pay differently",
};

export function parseLibraryHtml(html: string): Library {
  const m = html.match(/const D\s*=\s*(\{[\s\S]*?\});\s*\n/);
  if (!m) throw new Error("Library data (const D) not found in the page.");
  const D = JSON.parse(m[1]);
  const cards = Object.fromEntries((D.cards || []).map((c: any) => [c.id, c]));
  return { cases: D.cases || [], cards };
}

export async function loadLibrary(url = SSS.libraryUrl): Promise<Library> {
  const res = await fetch(url, { headers: { "User-Agent": "PeakNine-Tendi/1.0 (+https://peaknine.studio)" }, signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`Library fetch failed: ${res.status}`);
  return parseLibraryHtml(await res.text());
}

const yearsIn = (label: string) => (String(label || "").match(/(19|20)\d{2}/g) || []).map(Number);

/** Timeline steps that carry a year: page 4 shows relative years worked out from them. */
export function datedSteps(c: LibraryCase) {
  return (c.evolution || []).filter((e) => yearsIn(e.label).length > 0);
}

export function isEligible(c: LibraryCase): boolean {
  const evidence = c.evidence || c.conf;
  const steps = c.evolution || [];
  return c.status === "success" && evidence === "high" && steps.length >= 4 && datedSteps(c).length === steps.length;
}

/** "year 1" for the first step's year, "years 2-4" for a span, and so on. */
export function relativeYear(label: string, firstYear: number): string | null {
  const ys = yearsIn(label);
  if (!ys.length) return null;
  const a = ys[0] - firstYear + 1;
  const b = ys[ys.length - 1] - firstYear + 1;
  return a === b ? `year ${a}` : `years ${a}-${b}`;
}

export function firstYear(c: LibraryCase): number | null {
  const ys = (c.evolution || []).flatMap((e) => yearsIn(e.label));
  return ys.length ? Math.min(...ys) : null;
}

/** Plain, readable version of a case for the copywriter prompt and the Slack message. */
export function readableCase(c: LibraryCase, cards: Record<string, any>): ReadableCase {
  const fy = firstYear(c);
  return {
    id: c.id,
    organisation: c.org,
    where: c.countryFull || c.country || "",
    region: c.region,
    theme: c.theme,
    outcome: c.status === "success" ? "lasted" : c.status === "failure" ? "stalled" : "in progress",
    evidence: c.evidence || c.conf,
    who_pays_now: (c.routes || []).map((r) => ROUTES[r] || r),
    also_pays: (c.routes2 || []).map((r) => ROUTES[r] || r),
    summary: c.summary,
    timeline: (c.evolution || []).map((e, i) => ({
      index: i,
      label: e.label,
      relative_year: fy ? relativeYear(e.label, fy) : null,
      text: e.text,
    })),
    timeline_note: c.evoNote || null,
    models_at_work: (c.links || []).map((l) => ({
      model: cards[l.card]?.plain || l.card,
      role: l.role === "C" ? "core" : "supporting",
      why: l.why,
    })),
    lessons: c.lessons || null,
    what_went_wrong: c.failed || null,
    evidence_note: c.notes || null,
    sources: (c.sources || []).map((s) => ({ title: s.title, url: s.url })),
    library_link: SSS.caseLink(c.id),
    routes: c.routes || [],
  };
}

/**
 * Best guess at the organisation's own website, from the case's sources.
 * Null when no source looks like the organisation's own site.
 */
export function guessOrgWebsite(c: LibraryCase): string | null {
  const tokens = String(c.org || "")
    .toLowerCase()
    .replace(/\(.*?\)/g, " ")
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2 && !["the", "and", "for", "foundation", "international"].includes(t));
  let best: { hits: number; origin: string } | null = null;
  for (const s of c.sources || []) {
    let host: string;
    try {
      host = new URL(s.url).hostname.replace(/^www\./, "");
    } catch {
      continue;
    }
    const hostCore = host.split(".").slice(0, -1).join(".");
    const hits = tokens.filter((t) => hostCore.includes(t)).length;
    if (hits && (!best || hits > best.hits)) best = { hits, origin: `https://${host}` };
  }
  return best ? best.origin : null;
}

const BROWSER_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";

/**
 * Check that a suggested homepage really belongs to the organisation: it must load
 * and its title or site name must mention the organisation. A site behind a bot check
 * can't be verified; it is still returned so the logo finder reports "blocked" and
 * Tendi asks for the file in Slack.
 */
export async function verifyWebsite(url: string, orgName: string): Promise<string | null> {
  if (!/^https?:\/\//.test(url || "")) return null;
  const tokens = String(orgName)
    .toLowerCase()
    .replace(/\(.*?\)/g, " ")
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2);
  try {
    const res = await fetch(url, { headers: { "User-Agent": BROWSER_UA }, redirect: "follow", signal: AbortSignal.timeout(20_000) });
    const html = await res.text();
    if (!res.ok || res.status === 202) return new URL(res.url).origin;
    const title =
      ((html.match(/<title[^>]*>([^<]*)/i) || [])[1] || "") + " " + ((html.match(/property=["']og:site_name["'][^>]*content=["']([^"']*)/i) || [])[1] || "");
    const hits = tokens.filter((t) => title.toLowerCase().includes(t)).length;
    return hits >= Math.min(2, tokens.length) ? new URL(res.url).origin : null;
  } catch {
    return null;
  }
}
