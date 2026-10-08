/**
 * Scout's memory on disk (same data dir as the thread workspaces):
 *   - seen items with their scores, so nothing is scored or posted twice
 *   - Slack message ts -> item id, so a 👍/👎 reaction can be attributed
 *   - feedback (thumbs) used as calibration examples for the scorer
 *   - the last run summaries, shown on /scout/status
 * Everything is wrapped so a disk hiccup never breaks a run.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { dataDir } from "../state.js";
import type { Feedback, RunSummary, Score, ScoredOpportunity } from "./types.js";

interface SeenRecord {
  id: string;
  source?: string;
  title: string;
  buyer: string;
  country?: string;
  deadline: string;
  url: string;
  /** First 1,500 characters of the notice text Scout had, for the handoff to Tendi. */
  summary?: string;
  firstSeen: number;
  score?: Score;
  posted?: boolean;
}

type SeenInput = { id: string; source?: string; title: string; buyer: string; country?: string; deadline: string; url: string; summary?: string };

function toRecord(it: SeenInput, now: number): SeenRecord {
  return { id: it.id, source: it.source, title: it.title, buyer: it.buyer, country: it.country || "", deadline: it.deadline, url: it.url, summary: (it.summary || "").slice(0, 1500), firstSeen: now };
}

export interface ScoutState {
  seen: Record<string, SeenRecord>;
  messages: Record<string, string>; // "channel:ts" -> item id (one message per shortlisted item)
  digests: Record<string, string[]>; // "channel:ts" of a digest header -> item ids posted in its thread
  feedback: Feedback[];
  runs: RunSummary[];
  /** YYYY-MM-DD (local) of the last scheduled run that finished. Shown on /scout/status. */
  lastScheduledDay?: string;
  /** Scheduled attempts today, so a run that crashes the process is retried at most a couple of times. */
  attempts?: { day: string; count: number };
}

export type { SeenRecord };

function file(): string {
  const d = path.join(dataDir(), "tendi-scout");
  try {
    mkdirSync(d, { recursive: true });
  } catch {
    /* ignore */
  }
  return path.join(d, "state.json");
}

let cached: ScoutState | null = null;

export function loadState(): ScoutState {
  if (cached) return cached;
  try {
    if (existsSync(file())) {
      const j = JSON.parse(readFileSync(file(), "utf8"));
      cached = { seen: j.seen || {}, messages: j.messages || {}, digests: j.digests || {}, feedback: j.feedback || [], runs: j.runs || [], lastScheduledDay: j.lastScheduledDay, attempts: j.attempts };
      return cached;
    }
  } catch {
    /* fall through */
  }
  cached = { seen: {}, messages: {}, digests: {}, feedback: [], runs: [] };
  return cached;
}

/** Tests only: forget the in-memory copy so the next load reads the disk again. */
export function resetStateCache(): void {
  cached = null;
}

export function saveState(): boolean {
  if (!cached) return true;
  try {
    // Keep the file bounded: drop seen items older than ~120 days, keep 60 runs.
    const cutoff = Date.now() - 120 * 86400000;
    for (const [id, rec] of Object.entries(cached.seen)) if (rec.firstSeen < cutoff) delete cached.seen[id];
    cached.runs = cached.runs.slice(-60);
    cached.feedback = cached.feedback.slice(-400);
    const dk = Object.keys(cached.digests);
    if (dk.length > 120) for (const k of dk.slice(0, dk.length - 120)) delete cached.digests[k];
    writeFileSync(file(), JSON.stringify(cached));
    return true;
  } catch {
    return false;
  }
}

export function isSeen(id: string): boolean {
  return !!loadState().seen[id];
}

export function markSeen(items: SeenInput[]): void {
  const s = loadState();
  const now = Date.now();
  for (const it of items) if (!s.seen[it.id]) s.seen[it.id] = toRecord(it, now);
}

export function recordScores(items: ScoredOpportunity[]): void {
  const s = loadState();
  for (const it of items) {
    const rec = s.seen[it.id] || toRecord(it, Date.now());
    if (!rec.summary && it.summary) rec.summary = it.summary.slice(0, 1500);
    rec.score = it.scored;
    s.seen[it.id] = rec;
  }
}

export function recordPosted(channel: string, ts: string, itemId: string): void {
  const s = loadState();
  s.messages[`${channel}:${ts}`] = itemId;
  if (s.seen[itemId]) s.seen[itemId].posted = true;
  // bound the map
  const keys = Object.keys(s.messages);
  if (keys.length > 2000) for (const k of keys.slice(0, keys.length - 2000)) delete s.messages[k];
}

export function itemForMessage(channel: string, ts: string): SeenRecord | null {
  const s = loadState();
  const id = s.messages[`${channel}:${ts}`];
  return id ? s.seen[id] || null : null;
}

export function itemById(id: string): SeenRecord | null {
  return loadState().seen[id] || null;
}

export function recordDigest(channel: string, ts: string, itemIds: string[]): void {
  loadState().digests[`${channel}:${ts}`] = itemIds;
}

/** Items posted in the thread of a digest header, or null when the thread is not a Scout digest. */
export function itemsForDigest(channel: string, ts: string): SeenRecord[] | null {
  const s = loadState();
  const ids = s.digests[`${channel}:${ts}`];
  if (!ids) return null;
  return ids.map((id) => s.seen[id]).filter((r): r is SeenRecord => !!r);
}

/** Remove a person's verdict on an item; with `verdict`, only when it is that verdict. */
export function removeFeedback(itemId: string, by: string, verdict?: "up" | "down"): void {
  const s = loadState();
  s.feedback = s.feedback.filter((x) => !(x.itemId === itemId && x.by === by && (!verdict || x.verdict === verdict)));
}

export function feedbackCounts(): { up: number; down: number } {
  const s = loadState();
  return { up: s.feedback.filter((f) => f.verdict === "up").length, down: s.feedback.filter((f) => f.verdict === "down").length };
}

export function getAttempts(day: string): number {
  const a = loadState().attempts;
  return a && a.day === day ? a.count : 0;
}

export function setAttempts(day: string, count: number): void {
  loadState().attempts = { day, count };
}

export function getLastScheduledDay(): string | undefined {
  return loadState().lastScheduledDay;
}

export function setLastScheduledDay(day: string): void {
  loadState().lastScheduledDay = day;
}

export function addFeedback(f: Feedback): void {
  const s = loadState();
  // one verdict per item per person; the latest wins
  s.feedback = s.feedback.filter((x) => !(x.itemId === f.itemId && x.by === f.by));
  s.feedback.push(f);
}

export function recentFeedback(limit = 15): { up: Feedback[]; down: Feedback[] } {
  const s = loadState();
  const sorted = [...s.feedback].sort((a, b) => b.at - a.at);
  return { up: sorted.filter((f) => f.verdict === "up").slice(0, limit), down: sorted.filter((f) => f.verdict === "down").slice(0, limit) };
}

export function recordRun(r: RunSummary): void {
  loadState().runs.push(r);
}

export function lastRuns(n = 5): RunSummary[] {
  return loadState().runs.slice(-n);
}

export function topRecent(days = 7, limit = 20): SeenRecord[] {
  const s = loadState();
  const cutoff = Date.now() - days * 86400000;
  return Object.values(s.seen)
    .filter((r) => r.firstSeen >= cutoff && r.score)
    .sort((a, b) => (b.score?.score || 0) - (a.score?.score || 0))
    .slice(0, limit);
}
