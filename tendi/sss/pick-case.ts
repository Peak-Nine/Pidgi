/**
 * Choose this week's case: lasted, high evidence, four or more dated timeline steps,
 * never featured before (any case already in the Content Calendar, including ones
 * replaced with 🔁), and different from recent weeks in payer route, theme and (more lightly) region.
 */
import { isEligible, type LibraryCase } from "./library.js";

export interface RecentPost {
  caseId?: string;
  routes?: string[];
  theme?: string;
  region?: string;
}

/** recent: the most recent logged posts first. */
export function pickCase(cases: LibraryCase[], { featuredIds = new Set<string>(), recent = [] as RecentPost[], seed = 0 } = {}): LibraryCase | null {
  const lastRoutes = new Set(recent.slice(0, 2).flatMap((r) => r.routes || []));
  const lastTheme = recent[0]?.theme;
  const lastRegion = recent[0]?.region;

  const scored = cases
    .filter((c) => isEligible(c) && !featuredIds.has(c.id))
    .map((c) => {
      let score = 0;
      if (!(c.routes || []).some((r) => lastRoutes.has(r))) score += 2; // a different payer route
      if (c.theme && c.theme !== lastTheme) score += 1; // a different theme
      if (c.region && lastRegion && c.region !== lastRegion) score += 0.5; // a different region (a lighter nudge)
      if (/\d/.test(c.summary || "")) score += 1; // has numbers to show the shift
      // Stable tie-break that changes week to week
      const h = [...c.id].reduce((a, ch) => (a * 31 + ch.charCodeAt(0) + seed) % 9973, 7);
      return { c, score, h };
    })
    .sort((a, b) => b.score - a.score || a.h - b.h);

  return scored.length ? scored[0].c : null;
}

/** ISO week number (plus year), used as the weekly seed. */
export function weekSeed(date = new Date()): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7) + d.getUTCFullYear() * 100;
}
