/**
 * Shared types for Tendi Scout, the daily tender watcher.
 */

export type SourceId = "ted" | "undp" | "reliefweb" | "enabel";

export interface Opportunity {
  /** Stable id, prefixed with the source: "ted:681497-2026", "enabel:TZA22003-10792", ... */
  id: string;
  source: SourceId;
  title: string;
  buyer: string;
  country: string;
  /** ISO date (YYYY-MM-DD) or empty when the source gives none. Never guessed. */
  deadline: string;
  /** ISO date the notice was published, when the source gives it. */
  published: string;
  url: string;
  /** Description or extracted text, trimmed to a few thousand characters. */
  summary: string;
  cpv?: string[];
  attachments?: string[];
  /** Extra source facts worth showing (notice type, procedure, estimated value). */
  meta?: Record<string, string>;
}

export interface Score {
  id: string;
  score: number; // 0..100
  verdict: "strong" | "possible" | "weak";
  why: string; // two lines max, in Peak Nine voice, English
  flags: string[]; // red flags: deadline too close, consortium required, out of scope...
  playbook?: "proof-of-change" | "new-proposal" | "rfp-philea" | "none";
}

export interface ScoredOpportunity extends Opportunity {
  scored: Score;
}

export interface SourceResult {
  source: SourceId;
  items: Opportunity[];
  /** Human-readable notes: "skipped: no RELIEFWEB_APPNAME", "3 pages fetched", errors. */
  notes: string[];
  ok: boolean;
}

export interface SourceAdapter {
  id: SourceId;
  /** Fetch recent opportunities. Must be polite: capped requests, descriptive UA, backoff. */
  fetch(ctx: FetchContext): Promise<SourceResult>;
}

export interface FetchContext {
  /** Only items published on/after this date are wanted (YYYY-MM-DD). */
  since: string;
  log: (line: string) => void;
}

export interface Feedback {
  itemId: string;
  title: string;
  buyer: string;
  verdict: "up" | "down";
  by: string;
  at: number;
}

export interface RunSummary {
  startedAt: number;
  finishedAt: number;
  trigger: "schedule" | "manual" | "cli";
  fetched: Record<string, number>;
  notes: string[];
  newItems: number;
  prefiltered: number;
  scored: number;
  posted: number;
  errors: string[];
}
