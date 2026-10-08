/**
 * Fit scoring with Claude. One call per batch of up to SCOUT_BATCH items, forced
 * through a tool call so the answer is structured JSON, never prose to parse.
 *
 * Rules the prompt enforces (and the code re-checks):
 *   - deadlines, buyers, countries come from the notice; the model never adds any
 *   - every item in the batch gets a score, missing ones become 0 "unscored"
 *   - the rubric is tendi/scout/fit-rubric.md, editable without a code change
 *   - recent 👍/👎 from Slack are shown as calibration examples
 *
 * Model: SCOUT_MODEL, default claude-sonnet-4-6 (in pidgi's pricing table). If the
 * API rejects the model id we retry once with TENDI_MODEL, which Tendi runs on.
 */
import { readFileSync } from "fs";
import path from "path";
import type Anthropic from "@anthropic-ai/sdk";
import { recordUsage } from "../usage.js";
import { daysUntil } from "./filter.js";
import type { Feedback, Opportunity, Score, ScoredOpportunity } from "./types.js";

export const SCOUT_MODEL = process.env.SCOUT_MODEL || "claude-sonnet-4-6";
const FALLBACK_MODEL = process.env.TENDI_MODEL || "claude-opus-4-8";
const BATCH = Math.max(1, Math.min(20, Number(process.env.SCOUT_BATCH) || 10));
// Items with a tender document excerpt are long (about 8,000 tokens each): score them two at a time.
const BATCH_DETAILED = Math.max(1, Math.min(5, Number(process.env.SCOUT_BATCH_DETAILED) || 2));

/** Split items into scoring batches: short items in tens, items with a document excerpt in twos. */
export function makeBatches<T extends { details?: string }>(items: T[], short = BATCH, detailed = BATCH_DETAILED): T[][] {
  const out: T[][] = [];
  const plain = items.filter((o) => !o.details);
  const rich = items.filter((o) => o.details);
  for (let i = 0; i < rich.length; i += detailed) out.push(rich.slice(i, i + detailed));
  for (let i = 0; i < plain.length; i += short) out.push(plain.slice(i, i + short));
  return out;
}

export function loadRubric(file = path.join(__dirname, "fit-rubric.md")): string {
  try {
    return readFileSync(file, "utf8");
  } catch {
    return "Rubric file missing: score consultancy, strategy, evaluation and innovation assignments for a small impact studio; everything else low.";
  }
}

export const SCORE_TOOL: Anthropic.Tool = {
  name: "record_scores",
  description: "Record the fit score for every opportunity in the batch. One entry per id, no id left out, no id invented.",
  input_schema: {
    type: "object",
    properties: {
      scores: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            score: { type: "integer", minimum: 0, maximum: 100 },
            why: { type: "string", description: "Two short lines max, plain English, naming the specific match or mismatch." },
            flags: { type: "array", items: { type: "string" }, description: "Only facts from the notice: deadline, eligibility, consortium, language, location, value." },
            playbook: { type: "string", enum: ["proof-of-change", "new-proposal", "rfp-philea", "none"] },
          },
          required: ["id", "score", "why", "flags", "playbook"],
        },
      },
    },
    required: ["scores"],
  },
};

export function verdictFor(score: number): Score["verdict"] {
  return score >= 70 ? "strong" : score >= 40 ? "possible" : "weak";
}

function clip(s: string, n: number): string {
  return s.length > n ? s.slice(0, n) + " …" : s;
}

export function describeForScoring(o: Opportunity, today = new Date()): string {
  const d = daysUntil(o.deadline, today);
  const lines = [
    `id: ${o.id}`,
    `source: ${o.source}`,
    `title: ${o.title}`,
    `buyer: ${o.buyer || "(not given)"}`,
    `country: ${o.country || "(not given)"}`,
    `deadline: ${o.deadline ? `${o.deadline} (${d} days)` : "(not given)"}`,
    o.published ? `published: ${o.published}` : "",
    o.cpv?.length ? `cpv: ${o.cpv.slice(0, 6).join(", ")}` : "",
    o.meta ? Object.entries(o.meta).filter(([, v]) => v).map(([k, v]) => `${k}: ${clip(String(v), 200)}`).join("\n") : "",
    `text: ${o.summary ? clip(o.summary.replace(/\s+/g, " "), 2500) : o.details ? "(see the tender document excerpt below)" : "(title only, no text available)"}`,
    o.details ? `tender document excerpt (cover, award criteria, terms of reference, selection criteria; page numbers in brackets):\n${clip(o.details, 30_000)}` : "",
  ].filter(Boolean);
  return lines.join("\n");
}

export function calibrationBlock(fb: { up: Feedback[]; down: Feedback[] }): string {
  if (!fb.up.length && !fb.down.length) return "";
  const fmt = (f: Feedback) => `- ${f.title}${f.buyer ? ` (${f.buyer})` : ""}`;
  const parts = ["# Calibration from the team's reactions"];
  if (fb.up.length) parts.push("", "Items the team marked 👍 (show more like these):", ...fb.up.map(fmt));
  if (fb.down.length) parts.push("", "Items the team marked 👎 (show fewer like these):", ...fb.down.map(fmt));
  return parts.join("\n");
}

export function buildSystem(rubric: string, fb: { up: Feedback[]; down: Feedback[] }, today: string): string {
  return [
    "You are Tendi Scout, the tender screener of Peak Nine, a five-person systemic innovation and impact studio in Antwerp. You read procurement notices and judge how well each one fits the studio, following the rubric below.",
    "",
    `Today is ${today}.`,
    "",
    "Hard rules:",
    "- Use only what the notice text says. Do not infer a deadline, budget, eligibility or consortium requirement that is not in the text; when the text is thin, say so in `why` and score conservatively (usually 30 to 55).",
    "- `flags` hold facts, not opinions: a deadline under 10 days, a required local registration, a consortium requirement, a working language other than English, Dutch or French, a value far outside a small studio's range.",
    "- `why` is two short lines in plain English, no filler, no restating the title. Name the specific theme, client type or method that fits or does not. Do not use the words 'leverage', 'robust', 'holistic' or 'synergy'. Do not write 'not X but Y' constructions and do not use dashes as punctuation.",
    "- Score every id given, exactly once. Never invent an id.",
    "",
    rubric.trim(),
    calibrationBlock(fb),
  ]
    .filter((s) => s !== undefined)
    .join("\n");
}

/** Peak Nine house style: no em or en dashes as punctuation, whatever the model wrote. */
export function houseStyle(t: string): string {
  return t
    .replace(/(\d)\s*[\u2013\u2014]\s*(\d)/g, "$1 to $2")
    .replace(/\s*[\u2014\u2013]\s*/g, ", ")
    .replace(/\s+--\s+/g, ", ")
    .replace(/,\s*,/g, ",");
}

/** Turn whatever the model returned into one valid Score per input item. */
export function normalizeScores(items: Opportunity[], raw: any, today = new Date()): Score[] {
  const byId = new Map<string, any>();
  for (const s of (raw?.scores as any[]) || []) if (s && typeof s.id === "string") byId.set(s.id, s);
  return items.map((o) => {
    const s = byId.get(o.id);
    const flags = new Set<string>();
    const d = daysUntil(o.deadline, today);
    if (d !== null && d < 0) flags.add("deadline has passed");
    else if (d !== null && d < 10) flags.add(`deadline in ${d} day${d === 1 ? "" : "s"}`);
    if (!s) {
      return { id: o.id, score: 0, verdict: "weak", why: "Unscored: the scorer returned nothing for this item. Open the notice to judge it.", flags: [...flags], playbook: "none" };
    }
    const n = Math.max(0, Math.min(100, Math.round(Number(s.score) || 0)));
    for (const f of Array.isArray(s.flags) ? s.flags : []) if (typeof f === "string" && f.trim()) flags.add(clip(houseStyle(f.trim()), 160));
    const pb = ["proof-of-change", "new-proposal", "rfp-philea", "none"].includes(s.playbook) ? s.playbook : "none";
    return { id: o.id, score: n, verdict: verdictFor(n), why: clip(houseStyle(String(s.why || "").trim()), 400) || "(no reason given)", flags: [...flags].slice(0, o.details ? 9 : 6), playbook: pb };
  });
}

export interface ScoreOptions {
  feedback: { up: Feedback[]; down: Feedback[] };
  log?: (line: string) => void;
  today?: Date;
  rubric?: string;
}

async function callOnce(anthropic: Anthropic, model: string, system: string, userText: string): Promise<{ raw: any; model: string }> {
  const resp = await anthropic.messages.create(
    {
      model,
      max_tokens: 4000,
      system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
      tools: [SCORE_TOOL],
      tool_choice: { type: "tool", name: "record_scores" },
      messages: [{ role: "user", content: userText }],
    },
    { timeout: 180_000 }
  );
  recordUsage(model, resp.usage, { thread: "scout" });
  const block = resp.content.find((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
  return { raw: block?.input || {}, model };
}

/** Score items in batches. Never throws for a single bad batch: those items come back as unscored. */
export async function scoreOpportunities(anthropic: Anthropic, items: Opportunity[], opts: ScoreOptions): Promise<{ scored: ScoredOpportunity[]; errors: string[]; model: string }> {
  const today = opts.today || new Date();
  const todayIso = today.toISOString().slice(0, 10);
  const rubric = opts.rubric ?? loadRubric();
  const system = buildSystem(rubric, opts.feedback, todayIso);
  const log = opts.log || (() => undefined);
  const scored: ScoredOpportunity[] = [];
  const errors: string[] = [];
  let model = SCOUT_MODEL;

  const batches = makeBatches(items);
  for (let b = 0; b < batches.length; b++) {
    const batch = batches[b];
    const userText = [`Score these ${batch.length} opportunities. Return one entry per id.`, "", ...batch.map((o, k) => `## Item ${k + 1}\n${describeForScoring(o, today)}`)].join("\n");
    let raw: any = null;
    try {
      ({ raw } = await callOnce(anthropic, model, system, userText));
    } catch (e: any) {
      const msg = String(e?.message || e);
      const notFound = /not_found|model.*(not|un)(exist|supported|available)|does not exist/i.test(msg) || e?.status === 404;
      if (notFound && model !== FALLBACK_MODEL) {
        log(`scorer: model ${model} rejected (${msg.slice(0, 120)}), falling back to ${FALLBACK_MODEL}`);
        errors.push(`model ${model} rejected, used ${FALLBACK_MODEL}`);
        model = FALLBACK_MODEL;
        try {
          ({ raw } = await callOnce(anthropic, model, system, userText));
        } catch (e2: any) {
          errors.push(`batch ${b + 1}: ${String(e2?.message || e2).slice(0, 200)}`);
        }
      } else {
        errors.push(`batch ${b + 1}: ${msg.slice(0, 200)}`);
      }
    }
    const scores = normalizeScores(batch, raw, today);
    for (let k = 0; k < batch.length; k++) scored.push({ ...batch[k], scored: scores[k] });
    log(`scorer: batch ${b + 1}/${batches.length} -> ${scores.filter((s) => s.score > 0).length}/${batch.length} scored`);
  }
  return { scored, errors, model };
}
