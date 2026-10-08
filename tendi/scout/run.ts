/**
 * One Scout run, start to finish:
 *   fetch every source (each adapter is polite on its own) -> drop what we have
 *   seen -> cheap keyword prefilter -> read a few Enabel PDFs for the shortlist
 *   -> score with Claude -> remember everything -> hand back a digest.
 *
 * Posting to Slack lives in digest.ts so the CLI can dry-run without a token.
 * Budgets per run (env, defaults in brackets): SCOUT_LOOKBACK_DAYS [3],
 * SCOUT_MAX_SCORE_PER_RUN [40 per day of lookback], SCOUT_ENABEL_PDF_MAX [30].
 *
 * Enabel tender PDFs: on 8 Oct 2026 reading six of them inside this process took
 * it from about 180 MB to 650 MB, past Render's 512 MB, and both scheduled runs
 * died. They are now read one at a time by a separate helper process
 * (scout/pdf-pages.mjs, about 150 MB peak, killed after 60 s), and only the pages
 * that decide a bid: cover, award criteria, terms of reference, selection file.
 */
import type Anthropic from "@anthropic-ai/sdk";
import { envInt } from "./env.js";
import { prefilter } from "./filter.js";
import { memoryHeadroomMb } from "./memory.js";
import { resetBudgets } from "./http.js";
import { scoreOpportunities } from "./scorer.js";
import { enabelAdapter, readTenderPdf } from "./sources/enabel.js";
import { reliefwebAdapter } from "./sources/reliefweb.js";
import { tedAdapter } from "./sources/ted.js";
import { undpAdapter } from "./sources/undp.js";
import { worldbankAdapter } from "./sources/worldbank.js";
import { isSeen, markSeen, recentFeedback, recordRun, recordScores, saveState } from "./store.js";
import type { Opportunity, RunSummary, ScoredOpportunity, SourceAdapter, SourceResult } from "./types.js";

export const ADAPTERS: SourceAdapter[] = [tedAdapter, undpAdapter, worldbankAdapter, reliefwebAdapter, enabelAdapter];

export interface RunOptions {
  anthropic: Anthropic;
  trigger: RunSummary["trigger"];
  /** YYYY-MM-DD; default today minus SCOUT_LOOKBACK_DAYS. */
  since?: string;
  /** Skip the model and the store writes: fetch, filter, report. */
  dryRun?: boolean;
  /** Only these sources (ids). Default all. */
  sources?: string[];
  log?: (line: string) => void;
  now?: Date;
  /** Days to look back when SCOUT_LOOKBACK_DAYS is not set (the schedule passes the gap between runs). */
  lookbackDays?: number;
  /** Tests only: use these adapters instead of the real sources. */
  adapters?: SourceAdapter[];
}

export interface RunResult {
  summary: RunSummary;
  scored: ScoredOpportunity[];
  /** Items the prefilter dropped (for the dry-run report). */
  dropped: Opportunity[];
  model: string;
}

export function isoDaysAgo(days: number, now = new Date()): string {
  return new Date(now.getTime() - days * 86400000).toISOString().slice(0, 10);
}

// Small boost for sources that are closest to Peak Nine's work (Enabel is a client;
// ReliefWeb consultancies are individual assignments). [assumption, tune freely]
const SOURCE_BOOST: Record<string, number> = { enabel: 2, reliefweb: 1, worldbank: 0, undp: 0, ted: 0 };

/**
 * Priority when the per-run scoring cap bites: more keyword hits first, a small
 * source boost, then the soonest deadline. Items past the cap are not marked as
 * seen, so they come back tomorrow while they are still inside the lookback window.
 */
export function priority(o: Opportunity, hits: number): number {
  return hits + (SOURCE_BOOST[o.source] || 0);
}

export function scoringOrder(a: { o: Opportunity; p: number }, b: { o: Opportunity; p: number }): number {
  if (b.p !== a.p) return b.p - a.p;
  const da = a.o.deadline || "9999";
  const db = b.o.deadline || "9999";
  return da < db ? -1 : da > db ? 1 : 0;
}

export async function runScout(opts: RunOptions): Promise<RunResult> {
  const now = opts.now || new Date();
  const log = opts.log || ((l: string) => console.log(`[scout] ${l}`));
  const lookback = envInt("SCOUT_LOOKBACK_DAYS", opts.lookbackDays || 3) || 3;
  const since = opts.since || isoDaysAgo(lookback, now);
  const maxScore = envInt("SCOUT_MAX_SCORE_PER_RUN", Math.min(250, 40 * lookback)) || 60;
  const pdfMax = Math.max(0, envInt("SCOUT_ENABEL_PDF_MAX", 30));
  const startedAt = Date.now();
  const notes: string[] = [];
  const errors: string[] = [];
  const fetched: Record<string, number> = {};

  resetBudgets();
  const adapters = (opts.adapters || ADAPTERS).filter((a) => !opts.sources || opts.sources.includes(a.id));
  log(`run (${opts.trigger}) since ${since}, sources: ${adapters.map((a) => a.id).join(", ")}`);

  // Different hosts, so adapters run side by side; each one spaces its own requests.
  const settled = await Promise.allSettled(adapters.map((a) => a.fetch({ since, log })));
  const all: Opportunity[] = [];
  settled.forEach((r, i) => {
    const id = adapters[i].id;
    if (r.status === "fulfilled") {
      const res: SourceResult = r.value;
      fetched[id] = res.items.length;
      for (const n of res.notes) notes.push(`${id}: ${n}`);
      if (!res.ok) errors.push(`${id}: ${res.notes.filter((n) => /fail|HTTP/i.test(n)).join("; ") || "reported a problem"}`);
      all.push(...res.items);
    } else {
      fetched[id] = 0;
      errors.push(`${id}: ${String(r.reason?.message || r.reason).slice(0, 200)}`);
    }
  });

  // Dedupe within the run (the same notice can sit in two UNDP feeds) and against the store.
  const byId = new Map<string, Opportunity>();
  for (const o of all) if (!byId.has(o.id)) byId.set(o.id, o);
  const fresh = [...byId.values()].filter((o) => !isSeen(o.id));
  log(`${all.length} fetched, ${byId.size} unique, ${fresh.length} new`);

  const ranked: { o: Opportunity; p: number }[] = [];
  const dropped: Opportunity[] = [];
  for (const o of fresh) {
    const pf = prefilter(o);
    if (pf.keep) ranked.push({ o, p: priority(o, pf.hits.length) });
    else dropped.push(o);
  }
  log(`prefilter kept ${ranked.length}, dropped ${dropped.length}`);

  ranked.sort(scoringOrder);
  const kept = ranked.map((r) => r.o);
  const toScore = kept.slice(0, maxScore);
  const overflow = kept.slice(maxScore);
  if (overflow.length) notes.push(`${overflow.length} items left for the next run (SCOUT_MAX_SCORE_PER_RUN=${maxScore})`);

  // Enabel: read the decisive pages of each shortlisted tender PDF (separate process, see top).
  let pdfs = 0;
  let pdfFails = 0;
  // The helper needs about 150 MB; skip it when the container is close to its limit.
  const needMb = envInt("SCOUT_PDF_HELPER_MB", 200);
  let pdfSkippedForMemory = 0;
  for (const o of pdfMax > 0 ? toScore : []) {
    if (o.source !== "enabel" || pdfs >= pdfMax || o.details) continue;
    const mem = memoryHeadroomMb();
    if (mem && mem.freeMb < needMb) {
      pdfSkippedForMemory++;
      if (pdfSkippedForMemory === 1) log(`enabel pdf: skipped, only ${mem.freeMb} MB free of ${mem.limitMb} MB`);
      continue;
    }
    try {
      const doc = await readTenderPdf(o);
      if (doc) {
        o.details = doc.text;
        pdfs++;
        log(`enabel pdf ${o.id}: pages ${doc.pages.join(",")} (${doc.text.length} chars)`);
      }
    } catch (e: any) {
      pdfFails++;
      log(`enabel pdf for ${o.id} skipped: ${String(e?.message || e).slice(0, 120)}`);
    }
  }
  if (pdfs || pdfFails || pdfSkippedForMemory)
    notes.push(
      `enabel: read the tender document of ${pdfs} tender${pdfs === 1 ? "" : "s"}${pdfFails ? `, ${pdfFails} could not be read` : ""}${pdfSkippedForMemory ? `, ${pdfSkippedForMemory} skipped (not enough free memory on the instance)` : ""}`
    );

  let scored: ScoredOpportunity[] = [];
  let model = "(dry run)";
  if (opts.dryRun) {
    scored = toScore.map((o) => ({ ...o, scored: { id: o.id, score: 0, verdict: "weak", why: "(dry run, not scored)", flags: [], playbook: "none" } }));
  } else if (toScore.length) {
    const res = await scoreOpportunities(opts.anthropic, toScore, { feedback: recentFeedback(), log, today: now });
    scored = res.scored;
    model = res.model;
    errors.push(...res.errors);
  }

  const summary: RunSummary = {
    startedAt,
    finishedAt: Date.now(),
    trigger: opts.trigger,
    fetched,
    notes,
    newItems: fresh.length,
    prefiltered: kept.length,
    scored: scored.filter((s) => s.scored.score > 0).length,
    posted: 0,
    errors,
  };

  if (!opts.dryRun) {
    // Everything we judged (or dropped) is remembered; the overflow is not, so it returns tomorrow.
    markSeen([...toScore, ...dropped]);
    recordScores(scored);
    recordRun(summary);
    if (!saveState()) errors.push("could not write scout state to disk");
  }

  scored.sort((a, b) => b.scored.score - a.scored.score);
  log(`done in ${Math.round((Date.now() - startedAt) / 1000)} s: ${summary.scored} scored, ${errors.length} error(s)`);
  return { summary, scored, dropped, model };
}
