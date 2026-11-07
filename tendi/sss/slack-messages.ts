/**
 * The texts Tendi posts in #peak-nine-marketing for Scale & Sustain Stories.
 * Plain Slack mrkdwn, Peak Nine team voice (warm, plain, no em dashes).
 */
import { SSS } from "./config.js";
import type { ReadableCase } from "./library.js";

export const INTRO_TEXT = `Hi everyone 👋 I’m taking on a new job: *Scale & Sustain Stories*, our weekly LinkedIn case post from the *Beyond the Grant* Case Library.

Here’s how it will work:
• Every Monday at 8:30 I post a finished carousel here: one case from the library, built in our Canva template, with the PDF for LinkedIn and the caption ready to paste.
• I log each post in the Content Calendar in Notion with the status “Feedback needed”, so you can move it on to Ready and Published.
• I pick cases that lasted, with strong evidence and a clear timeline, and I never feature the same one twice. I also vary who pays, the theme and the region from week to week.
• Every fact comes straight from the library. On the timeline page I show relative years (year 1, year 3 and so on), so nobody has to count.
• I look up the organisation’s logo on their own website. If their site blocks me, I’ll ask for the file in the thread.
• Not the right case this week? Reply 🔁 under the post, or react with it, and I’ll build a new one with another case. Niels and Jonas can do this, up to three builds a week.

Two things stay with you:
• Swapping the photo on page 2, once the organisation has given permission.
• Posting on LinkedIn and tagging the organisation. I’ll list who to tag each time.

To get us started, here’s the first one.`;

export interface PostTextInput {
  issueNo: number;
  org: string;
  isRebuild?: boolean;
  why: string;
  canvaUrl: string;
  notionUrl: string;
  caseLink: string;
  tags: string[];
  hasLogo: boolean;
  notesForTeam?: string;
  exportNote?: string;
}

export function postText(p: PostTextInput): string {
  const lines = [
    `*${SSS.designTitle(p.issueNo, p.org)}* is ready${p.isRebuild ? ", as a new option for this week" : " for this week"}.`,
    p.why,
    "",
    `<${p.canvaUrl}|Open in Canva>  ·  <${p.notionUrl}|Content Calendar>  ·  <${p.caseLink}|Case in the library>`,
    `Tag on LinkedIn: ${p.tags.join(", ")}`,
    `Before posting: swap the photo on page 2 once ${p.org} has given permission.`,
  ];
  if (!p.hasLogo) lines.push(`I couldn’t get ${p.org}’s logo from their website, so the logo spots are empty for now. Reply here with the logo file or a link and I’ll add it.`);
  if (p.notesForTeam) lines.push(`Worth checking: ${p.notesForTeam}`);
  if (p.exportNote) lines.push(`I couldn’t export everything from Canva (${p.exportNote}). Download the PDF from Canva by hand, pages 1 to 10.`);
  lines.push("", "PDF, cover and caption are in the thread. Reply 🔁 for a different case.");
  return lines.join("\n");
}

/** One line on why this case, from the case data only. */
export function whyLine(readable: ReadableCase): string {
  const pays = readable.who_pays_now.join(" and ");
  return `${readable.organisation}, ${readable.where}. Who pays now: ${pays}. Theme: ${readable.theme}.`;
}

export const captionText = (caption: string) => `Caption, ready to paste:\n\`\`\`${caption}\`\`\``;

export const replacedText = (who: string, org: string) => `${who} asked for another case with 🔁. I’ve set ${org} to “Review if still relevant” in the Content Calendar and I’m building a new one now.`;

export const limitText = () => `This week already has ${SSS.maxBuildsPerWeek} builds, so I’ll stop here. Pick one of them, or I’ll suggest a new case next Monday.`;

export const notAllowedText = () => "Only Niels and Jonas can ask me for a different case.";

export const failText = (what: string) => `I couldn’t finish this week’s post: ${what}. I’ll leave it here so someone can take a look.`;

export const logoAskText = (org: string) => `Reply in this thread with ${org}’s logo (a PNG, JPG or SVG file, or a link to one) and I’ll add it to pages 1 to 8 and post the new PDF.`;

/** Post the message, then the cover and PDF and the caption in its thread. `slack` is Bolt's app.client. */
export async function postWithFiles(
  slack: any,
  { channel, text, threadTs, broadcast, pdf, cover, pdfName, caption }: { channel: string; text: string; threadTs?: string | null; broadcast?: boolean; pdf?: Buffer | null; cover?: Buffer | null; pdfName: string; caption?: string },
): Promise<{ ts: string; permalink: string | null }> {
  const msg = await slack.chat.postMessage({
    channel,
    text,
    ...(threadTs ? { thread_ts: threadTs, reply_broadcast: Boolean(broadcast) } : {}),
    unfurl_links: false,
    unfurl_media: false,
  });
  const ts: string = msg.ts;
  const files: any[] = [];
  if (cover) files.push({ file: cover, filename: "cover.png", title: "Cover" });
  if (pdf) files.push({ file: pdf, filename: pdfName, title: pdfName.replace(/\.pdf$/i, "") });
  if (files.length) await slack.files.uploadV2({ channel_id: channel, thread_ts: threadTs || ts, file_uploads: files });
  if (caption) await slack.chat.postMessage({ channel, thread_ts: threadTs || ts, text: captionText(caption), unfurl_links: false });
  let permalink: string | null = null;
  try {
    permalink = (await slack.chat.getPermalink({ channel, message_ts: ts }))?.permalink || null;
  } catch {
    /* only used for the Notion page */
  }
  return { ts, permalink };
}
