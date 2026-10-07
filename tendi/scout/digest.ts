/**
 * The Slack digest: one header per run in the tenders channel, one message per
 * shortlisted tender in the header's thread (best first). Strong fits are also
 * broadcast to the channel. Each item carries a "Start a proposal" button and a
 * reminder that 👍 / 👎 on the item teaches Scout.
 *
 * Formatting is Slack mrkdwn. No Markdown tables, no headings, no dashes as
 * punctuation (house style).
 */
import { daysUntil } from "./filter.js";
import { recordDigest, recordPosted, saveState } from "./store.js";
import type { RunResult } from "./run.js";
import type { RunSummary, ScoredOpportunity } from "./types.js";

export const TZ = process.env.SCOUT_TZ || "Europe/Brussels";
export const START_ACTION_ID = "scout_start_proposal";

const SOURCE_LABEL: Record<string, string> = { ted: "TED", undp: "UNDP", reliefweb: "ReliefWeb", enabel: "Enabel" };
const PLAYBOOK_LABEL: Record<string, string> = { "proof-of-change": "Proof of Change", "new-proposal": "Peak Nine proposal", "rfp-philea": "RFP (Philea template)", none: "" };

export function longDate(d = new Date(), tz = TZ): string {
  return new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: tz }).format(d);
}

export function shortDate(iso: string, tz = TZ): string {
  if (!iso) return "";
  const d = new Date(iso + "T12:00:00Z");
  if (isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: tz }).format(d);
}

function esc(s: string): string {
  return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function deadlineText(iso: string, now = new Date()): string {
  if (!iso) return "deadline not given";
  const d = daysUntil(iso, now);
  if (d === null) return `deadline ${iso}`;
  if (d < 0) return `deadline passed (${shortDate(iso)})`;
  if (d === 0) return `deadline today (${shortDate(iso)})`;
  return `deadline ${shortDate(iso)} (in ${d} day${d === 1 ? "" : "s"})`;
}

export function itemText(it: ScoredOpportunity, now = new Date()): string {
  const s = it.scored;
  const facts = [it.buyer, it.country, deadlineText(it.deadline, now), SOURCE_LABEL[it.source] || it.source].filter(Boolean).map(esc).join(" · ");
  const value = it.meta?.estimated_value ? ` · est. ${esc(it.meta.estimated_value)}` : "";
  const pb = s.playbook && PLAYBOOK_LABEL[s.playbook] ? ` · ${PLAYBOOK_LABEL[s.playbook]}` : "";
  const lines = [`*<${it.url}|${esc(it.title)}>*`, `${facts}${value}`, `Fit ${s.score}/100 (${s.verdict})${pb}`, `_${esc(s.why)}_`];
  if (s.flags.length) lines.push(`⚑ ${s.flags.map(esc).join(" · ")}`);
  return lines.join("\n");
}

export function itemBlocks(it: ScoredOpportunity, now = new Date()): any[] {
  return [
    { type: "section", text: { type: "mrkdwn", text: itemText(it, now) } },
    {
      type: "actions",
      elements: [{ type: "button", text: { type: "plain_text", text: "Start a proposal" }, action_id: START_ACTION_ID, value: it.id }],
    },
  ];
}

export function sourcesLine(summary: RunSummary): string {
  const parts: string[] = [];
  for (const [src, n] of Object.entries(summary.fetched)) {
    const skipped = summary.notes.find((x) => x.startsWith(`${src}: skipped`));
    parts.push(skipped ? `${SOURCE_LABEL[src] || src} skipped (${skipped.replace(/^.*skipped:\s*/, "").split(" (")[0]})` : `${SOURCE_LABEL[src] || src} ${n}`);
  }
  return parts.join(", ");
}

export function headerText(run: RunResult, now = new Date()): string {
  const strong = run.scored.filter((s) => s.scored.verdict === "strong").length;
  const possible = run.scored.filter((s) => s.scored.verdict === "possible").length;
  const weak = run.scored.length - strong - possible;
  const s = run.summary;
  const lines = [`🔭 *Scout, ${longDate(now)}*`];
  if (run.model === "(dry run)") {
    lines.push(`Dry run: ${s.newItems} new notices screened, ${s.prefiltered} passed the keyword filter, ${run.scored.length} would go to the scorer. Nothing was sent to Claude and nothing was stored.`);
  } else if (!run.scored.length || strong + possible === 0) {
    lines.push(`Nothing new worth a look today. ${s.newItems} new notice${s.newItems === 1 ? "" : "s"} screened, ${s.prefiltered} passed the keyword filter, ${run.scored.length} scored, none above the weak line.`);
  } else {
    const shown = Math.min(strong + possible, Number(process.env.SCOUT_MAX_POSTS) || 15);
    lines.push(`${strong} strong fit${strong === 1 ? "" : "s"}, ${possible} possible, ${weak} weak out of ${s.newItems} new notices. ${shown ? `The best ${shown} are in this thread.` : "Nothing above the weak line today."}`);
    lines.push(`React 👍 or 👎 on an item to teach Scout. Press *Start a proposal* on an item, or mention @Tendi in this thread and name the tender.`);
  }
  lines.push(`Sources: ${sourcesLine(s)}.`);
  if (s.errors.length) lines.push(`⚠️ ${s.errors.length} problem${s.errors.length === 1 ? "" : "s"}: ${s.errors.map(esc).join("; ").slice(0, 600)}`);
  return lines.join("\n");
}

export interface SlackPoster {
  chat: { postMessage(args: any): Promise<any> };
}

/**
 * Post the digest. Returns the header ts and the number of item messages posted.
 * Weak items are not posted (they stay on /scout/status).
 */
export async function postDigest(slack: SlackPoster, channel: string, run: RunResult, now = new Date()): Promise<{ headerTs: string; posted: number }> {
  const postEmpty = process.env.SCOUT_POST_EMPTY !== "0";
  const maxPosts = Number(process.env.SCOUT_MAX_POSTS) || 15;
  // Slack allows about one message per second per channel; stay under it.
  const gapMs = Number(process.env.SCOUT_POST_GAP_MS) || 1200;
  const items = run.scored.filter((s) => s.scored.verdict !== "weak").slice(0, maxPosts);
  if (!items.length && !postEmpty) return { headerTs: "", posted: 0 };

  const head = await slack.chat.postMessage({ channel, text: headerText(run, now), unfurl_links: false, unfurl_media: false });
  const headerTs: string = head?.ts || "";
  let posted = 0;
  const ids: string[] = [];
  for (const it of items) {
    await new Promise((r) => setTimeout(r, gapMs));
    try {
      const r = await slack.chat.postMessage({
        channel,
        thread_ts: headerTs,
        reply_broadcast: it.scored.verdict === "strong",
        text: `${it.title} (${it.buyer}) fit ${it.scored.score}/100`,
        blocks: itemBlocks(it, now),
        unfurl_links: false,
        unfurl_media: false,
      });
      if (r?.ts) {
        recordPosted(channel, r.ts, it.id);
        ids.push(it.id);
        posted++;
      }
    } catch (e: any) {
      run.summary.errors.push(`post ${it.id}: ${String(e?.message || e).slice(0, 160)}`);
    }
  }
  if (headerTs) recordDigest(channel, headerTs, ids);
  run.summary.posted = posted;
  saveState();
  return { headerTs, posted };
}

/** Plain-text rendering for the CLI. */
export function renderPlain(run: RunResult, now = new Date()): string {
  const out: string[] = [headerText(run, now).replace(/\*/g, ""), ""];
  const dry = run.model === "(dry run)";
  for (const it of run.scored) {
    out.push(dry ? `[kept] ${it.title}` : `[${it.scored.score.toString().padStart(3)}] ${it.scored.verdict.padEnd(8)} ${it.title}`);
    out.push(`      ${[it.buyer, it.country, deadlineText(it.deadline, now), it.source].filter(Boolean).join(" · ")}`);
    out.push(`      ${it.url}`);
    if (it.scored.why && !/dry run/.test(it.scored.why)) out.push(`      ${it.scored.why}`);
    if (it.scored.flags.length) out.push(`      flags: ${it.scored.flags.join("; ")}`);
    out.push("");
  }
  if (run.dropped.length) {
    out.push(`Dropped by the keyword prefilter (${run.dropped.length}):`);
    for (const d of run.dropped.slice(0, 40)) out.push(`  - ${d.title} (${d.source}${d.buyer ? `, ${d.buyer}` : ""})`);
    if (run.dropped.length > 40) out.push(`  ... and ${run.dropped.length - 40} more`);
  }
  return out.join("\n");
}
