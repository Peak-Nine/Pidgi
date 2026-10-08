/**
 * Pure text helpers for Tendi (no Slack, no network), kept apart so they can be
 * unit-tested without booting the bot.
 */

/** Slack message text -> plain text the model can read. */
export function cleanSlackText(text: string, botUserId?: string): string {
  let t = String(text || "");
  if (botUserId) t = t.split(`<@${botUserId}>`).join(" ");
  t = t.replace(/<@[A-Z0-9]+>/g, " ");
  t = t.replace(/<(https?:\/\/[^|>]+)\|([^>]+)>/g, "$2 ($1)").replace(/<(https?:\/\/[^>]+)>/g, "$1");
  t = t.replace(/<#[A-Z0-9]+\|([^>]+)>/g, "#$1");
  t = t.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
  return t
    .replace(/[ \t]+\n/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

/** Split a long answer into Slack-sized pieces on paragraph boundaries. */
export function chunkText(text: string, max = 2900): string[] {
  const chunks: string[] = [];
  let buf = "";
  for (const para of text.split(/\n{2,}/)) {
    const candidate = buf ? buf + "\n\n" + para : para;
    if (candidate.length <= max) {
      buf = candidate;
    } else {
      if (buf) {
        chunks.push(buf);
        buf = "";
      }
      if (para.length > max) {
        let rest = para;
        while (rest.length > max) {
          let cut = rest.lastIndexOf("\n", max);
          if (cut < max * 0.5) cut = max;
          chunks.push(rest.slice(0, cut));
          rest = rest.slice(cut).replace(/^\n/, "");
        }
        buf = rest;
      } else {
        buf = para;
      }
    }
  }
  if (buf) chunks.push(buf);
  return chunks;
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Reliable weekday lookup (parsed at UTC noon to avoid timezone off-by-one). */
export function weekdayOf(iso: string): string {
  const d = new Date(String(iso).slice(0, 10) + "T12:00:00Z");
  return isNaN(d.getTime()) ? "?" : WEEKDAYS[d.getUTCDay()];
}

/** The date_info tool, as pure data. */
export function dateInfo(input: { dates?: string[]; start?: string; end?: string } | undefined): any {
  const out: any = {};
  const dates = Array.isArray(input?.dates) ? input!.dates! : [];
  out.dates = dates.map((x: string) => {
    const wd = weekdayOf(x);
    return { date: String(x).slice(0, 10), weekday: wd, is_weekend: wd === "Saturday" || wd === "Sunday" };
  });
  if (input?.start && input?.end) {
    const start = new Date(String(input.start).slice(0, 10) + "T12:00:00Z");
    const end = new Date(String(input.end).slice(0, 10) + "T12:00:00Z");
    const working: any[] = [];
    if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start && (end.getTime() - start.getTime()) / 86400000 <= 400) {
      for (let t = start.getTime(); t <= end.getTime(); t += 86400000) {
        const d = new Date(t);
        const wd = WEEKDAYS[d.getUTCDay()];
        if (wd !== "Saturday" && wd !== "Sunday") working.push({ date: d.toISOString().slice(0, 10), weekday: wd });
      }
      out.working_days = working;
      out.working_day_count = working.length;
    } else {
      out.range_error = "Provide a valid start/end within ~400 days.";
    }
  }
  return out;
}
