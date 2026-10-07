/**
 * Text blocks that hand a Scout item (or a whole digest thread) to Tendi, so a
 * proposal can start from what Scout found. Only facts Scout stored are passed on;
 * the model is told where the gaps are.
 */
import type { SeenRecord } from "./store.js";

function line(label: string, v: string | undefined | null): string {
  return `${label}: ${v && String(v).trim() ? String(v).trim() : "(not given by the source)"}`;
}

export function scoutItemBlock(r: SeenRecord): string {
  const s = r.score;
  const parts = [
    "<scout_item>",
    line("title", r.title),
    line("buyer", r.buyer),
    line("country", r.country),
    line("deadline", r.deadline),
    line("link", r.url),
    line("source", r.source),
  ];
  if (s) {
    parts.push(`scout_score: ${s.score}/100 (${s.verdict})${s.playbook && s.playbook !== "none" ? `, suggested playbook: ${s.playbook}` : ""}`);
    parts.push(line("scout_why", s.why));
    if (s.flags?.length) parts.push(`scout_flags: ${s.flags.join("; ")}`);
  }
  parts.push(r.summary ? `notice_text (first part of what Scout read; read the link for the full terms):\n${r.summary}` : "notice_text: (Scout had only the title; read the link for the terms of reference)");
  parts.push("</scout_item>");
  return parts.join("\n");
}

export function scoutDigestBlock(items: SeenRecord[]): string {
  const parts = ["<scout_digest>", "This thread is a Scout digest. These tenders were posted in it:"];
  items.forEach((r, i) => {
    const s = r.score;
    parts.push(`${i + 1}. ${r.title} | ${r.buyer || "buyer not given"} | deadline ${r.deadline || "not given"} | ${r.url}${s ? ` | Scout fit ${s.score}/100` : ""}`);
  });
  parts.push("</scout_digest>");
  return parts.join("\n");
}
