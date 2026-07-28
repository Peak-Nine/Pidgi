/**
 * Pidgi API usage + prompt-caching savings tracker.
 *
 * recordUsage() appends one compact JSON line per Anthropic call to a log file.
 * summarizeUsage() reads that file and returns cost and caching-savings aggregates
 * (lifetime / today / this week, plus per-day and per-week buckets) for the dashboard.
 *
 * Persistence: writes to PIDGI_USAGE_LOG if set, else /var/data (Render persistent disk)
 * if that directory exists, else the OS temp dir. Only the first two survive a restart.
 * All file I/O is wrapped so usage logging can never break the bot.
 */
import { appendFileSync, readFileSync, existsSync } from "fs";
import path from "path";
import os from "os";

// Published per-million-token USD prices. Edit here if Anthropic's pricing changes.
const PRICING: Record<string, { in: number; write5m: number; read: number; out: number }> = {
  "claude-sonnet-4-6": { in: 3, write5m: 3.75, read: 0.3, out: 15 },
  "claude-opus-4-8": { in: 5, write5m: 6.25, read: 0.5, out: 25 },
  "claude-haiku-4-5": { in: 1, write5m: 1.25, read: 0.1, out: 5 },
};
const DEFAULT_MODEL = "claude-sonnet-4-6";

function priceFor(model: string) {
  return PRICING[model] || PRICING[DEFAULT_MODEL];
}

let cachedPath: string | null = null;
function file(): string {
  if (cachedPath) return cachedPath;
  if (process.env.PIDGI_USAGE_LOG) cachedPath = process.env.PIDGI_USAGE_LOG;
  else {
    let p = path.join(os.tmpdir(), "pidgi-usage.jsonl");
    try { if (existsSync("/var/data")) p = "/var/data/pidgi-usage.jsonl"; } catch { /* ignore */ }
    cachedPath = p;
  }
  return cachedPath;
}

export function usageIsPersistent(): boolean {
  return !!process.env.PIDGI_USAGE_LOG || file().startsWith("/var/data");
}

export function recordUsage(model: string, usage: any): void {
  try {
    if (!usage) return;
    const rec = {
      t: Date.now(),
      m: model || DEFAULT_MODEL,
      i: usage.input_tokens ?? 0,
      r: usage.cache_read_input_tokens ?? 0,
      w: usage.cache_creation_input_tokens ?? 0,
      o: usage.output_tokens ?? 0,
    };
    appendFileSync(file(), JSON.stringify(rec) + "\n");
  } catch { /* never let usage logging break the bot */ }
}

function costOf(rec: any): { cost: number; without: number } {
  const p = priceFor(rec.m);
  const cost = (rec.i * p.in + rec.r * p.read + rec.w * p.write5m + rec.o * p.out) / 1e6;
  // Counterfactual: without caching, the read+write tokens would have been normal input.
  const without = ((rec.i + rec.r + rec.w) * p.in + rec.o * p.out) / 1e6;
  return { cost, without };
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}
function weekStartKey(d: Date): string {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const mondayOffset = (x.getUTCDay() + 6) % 7; // Monday = 0
  x.setUTCDate(x.getUTCDate() - mondayOffset);
  return dayKey(x);
}
function round(n: number): number {
  return Math.round(n * 1e4) / 1e4;
}

export function summarizeUsage(): any {
  let lines: string[] = [];
  try {
    lines = readFileSync(file(), "utf8").split("\n").filter(Boolean);
  } catch {
    lines = [];
  }

  const now = new Date();
  const todayKey = dayKey(now);
  const thisWeekKey = weekStartKey(now);

  let calls = 0, cost = 0, saved = 0, without = 0;
  let tCalls = 0, tCost = 0, tSaved = 0;
  let wCalls = 0, wCost = 0, wSaved = 0;
  let firstTs: number | null = null;
  const byDay: Record<string, { calls: number; cost: number; saved: number }> = {};
  const byWeek: Record<string, { calls: number; cost: number; saved: number }> = {};

  for (const ln of lines) {
    let rec: any;
    try { rec = JSON.parse(ln); } catch { continue; }
    if (!rec || typeof rec.t !== "number") continue;
    const { cost: c, without: wd } = costOf(rec);
    const sv = Math.max(0, wd - c);
    calls++; cost += c; saved += sv; without += wd;
    if (firstTs === null || rec.t < firstTs) firstTs = rec.t;
    const d = new Date(rec.t);
    const dk = dayKey(d);
    const wk = weekStartKey(d);
    (byDay[dk] ||= { calls: 0, cost: 0, saved: 0 });
    byDay[dk].calls++; byDay[dk].cost += c; byDay[dk].saved += sv;
    (byWeek[wk] ||= { calls: 0, cost: 0, saved: 0 });
    byWeek[wk].calls++; byWeek[wk].cost += c; byWeek[wk].saved += sv;
    if (dk === todayKey) { tCalls++; tCost += c; tSaved += sv; }
    if (wk === thisWeekKey) { wCalls++; wCost += c; wSaved += sv; }
  }

  const days: any[] = [];
  for (let n = 13; n >= 0; n--) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - n);
    const k = dayKey(d);
    const e = byDay[k] || { calls: 0, cost: 0, saved: 0 };
    days.push({ date: k, calls: e.calls, cost: round(e.cost), saved: round(e.saved) });
  }

  const weeks: any[] = [];
  const ws0 = new Date(now);
  ws0.setUTCDate(ws0.getUTCDate() - ((ws0.getUTCDay() + 6) % 7));
  for (let n = 7; n >= 0; n--) {
    const d = new Date(ws0);
    d.setUTCDate(d.getUTCDate() - n * 7);
    const k = dayKey(d);
    const e = byWeek[k] || { calls: 0, cost: 0, saved: 0 };
    weeks.push({ week: k, calls: e.calls, cost: round(e.cost), saved: round(e.saved) });
  }

  return {
    persistent: usageIsPersistent(),
    since: firstTs ? dayKey(new Date(firstTs)) : null,
    totals: { calls, costUSD: round(cost), savedUSD: round(saved), withoutCacheUSD: round(without) },
    today: { calls: tCalls, costUSD: round(tCost), savedUSD: round(tSaved) },
    thisWeek: { calls: wCalls, costUSD: round(wCost), savedUSD: round(wSaved) },
    byDay: days,
    byWeek: weeks,
  };
}
