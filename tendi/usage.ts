/**
 * Tendi API usage log: one compact JSON line per Anthropic call, plus a summary
 * for the admin-only /usage endpoint. Mirrors slackbot/usage.ts but writes its
 * own file (TENDI_USAGE_LOG, else <dataDir>/tendi-usage.jsonl).
 *
 * Prices are per million tokens in USD and were copied from pidgi's table on
 * 2026-10-07. They are NOT fetched live: verify against Anthropic's pricing page
 * before trusting the cost figures, and edit here when prices change.
 */
import { appendFileSync, readFileSync } from "fs";
import path from "path";
import { dataDir } from "./state.js";

const PRICING: Record<string, { in: number; write5m: number; read: number; out: number }> = {
  "claude-sonnet-4-6": { in: 3, write5m: 3.75, read: 0.3, out: 15 },
  "claude-opus-4-8": { in: 5, write5m: 6.25, read: 0.5, out: 25 },
  "claude-haiku-4-5": { in: 1, write5m: 1.25, read: 0.1, out: 5 },
};

function priceFor(model: string) {
  return PRICING[model] || PRICING["claude-opus-4-8"];
}

function file(): string {
  return process.env.TENDI_USAGE_LOG || path.join(dataDir(), "tendi-usage.jsonl");
}

export function recordUsage(model: string, usage: any, extra: Record<string, unknown> = {}): void {
  try {
    if (!usage) return;
    const rec = {
      t: Date.now(),
      m: model,
      i: usage.input_tokens ?? 0,
      r: usage.cache_read_input_tokens ?? 0,
      w: usage.cache_creation_input_tokens ?? 0,
      o: usage.output_tokens ?? 0,
      s: usage.server_tool_use?.web_search_requests ?? 0,
      ...extra,
    };
    appendFileSync(file(), JSON.stringify(rec) + "\n");
  } catch {
    /* never let usage logging break the bot */
  }
}

export function summarizeUsage(): any {
  let lines: string[] = [];
  try {
    lines = readFileSync(file(), "utf8").split("\n").filter(Boolean);
  } catch {
    lines = [];
  }
  let calls = 0;
  let cost = 0;
  let without = 0;
  let searches = 0;
  const byModel: Record<string, { calls: number; cost: number }> = {};
  const byDay: Record<string, { calls: number; cost: number }> = {};
  for (const ln of lines) {
    let rec: any;
    try {
      rec = JSON.parse(ln);
    } catch {
      continue;
    }
    if (!rec || typeof rec.t !== "number") continue;
    const p = priceFor(rec.m);
    const c = (rec.i * p.in + rec.r * p.read + rec.w * p.write5m + rec.o * p.out) / 1e6;
    const wo = ((rec.i + rec.r + rec.w) * p.in + rec.o * p.out) / 1e6;
    calls++;
    cost += c;
    without += wo;
    searches += rec.s || 0;
    (byModel[rec.m] ||= { calls: 0, cost: 0 });
    byModel[rec.m].calls++;
    byModel[rec.m].cost += c;
    const day = new Date(rec.t).toISOString().slice(0, 10);
    (byDay[day] ||= { calls: 0, cost: 0 });
    byDay[day].calls++;
    byDay[day].cost += c;
  }
  const r = (n: number) => Math.round(n * 1e4) / 1e4;
  return {
    file: file(),
    note: "Token prices are a static table copied on 2026-10-07; verify against Anthropic's current pricing. Web search requests are billed separately and are counted, not priced, here.",
    totals: { calls, costUSD: r(cost), withoutCacheUSD: r(without), savedUSD: r(Math.max(0, without - cost)), webSearchRequests: searches },
    byModel: Object.fromEntries(Object.entries(byModel).map(([k, v]) => [k, { calls: v.calls, costUSD: r(v.cost) }])),
    byDay: Object.fromEntries(
      Object.entries(byDay)
        .sort()
        .slice(-30)
        .map(([k, v]) => [k, { calls: v.calls, costUSD: r(v.cost) }])
    ),
  };
}
