/**
 * Settings for Scale & Sustain Stories, the weekly LinkedIn case post Tendi builds
 * from the Beyond the Grant Case Library. Every value can be overridden by an env
 * variable where it makes sense to test without touching the real channel.
 */

export const SSS = {
  seriesName: "Scale & Sustain Stories",

  // Slack. #peak-nine-marketing is a private channel; SSS_SLACK_CHANNEL_ID points
  // the job at a test channel instead.
  channelName: "peak-nine-marketing",
  get channelId(): string {
    return (process.env.SSS_SLACK_CHANNEL_ID || "C0CCRQ1T1GE").trim();
  },
  repeatEmoji: "repeat", // Slack's name for 🔁
  maxBuildsPerWeek: 3, // the Monday build plus at most two 🔁 rebuilds

  // Schedule: every Monday at 08:30 Brussels time (follows the clock changes).
  cron: "30 8 * * 1",
  weekday: 1,
  time: "08:30",
  latest: "20:00", // no scheduled start after this; a late deploy waits for next Monday
  timeZone: "Europe/Brussels",

  // Library
  libraryUrl: "https://library.peaknine.studio",
  caseLink: (id: string) => `https://library.peaknine.studio/#view=cases&case=${encodeURIComponent(id)}`,

  // Canva
  masterDesignId: "DAHZT4MaY2s",
  designTitle: (n: number, org: string) => `Scale & Sustain Stories #${String(n).padStart(2, "0")}: ${org}`,

  // Notion: Marketing › Content Calendar, written with Pidgi's Notion key (NOTION_TOKEN),
  // the same integration the Tender Board uses. The integration must be added to the
  // Content Calendar page in Notion (••• → Connections).
  notion: {
    databaseId: "2d0c675f-f958-80ff-9bee-c72e2bc56879",
    dataSourceId: "2d0c675f-f958-804b-9537-000b919d834d", // only for Notion API 2025-09-03 and later
    titlePrefix: "Scale & Sustain Stories #",
    statusNew: "Feedback needed",
    statusReplaced: "Review if still relevant",
    content: "Case",
    postType: "Carousel",
    cta: "Explore the Beyond the Grant Case Library: https://library.peaknine.studio",
  },

  // Fixed end of every LinkedIn caption (agreed with Niels on 9 Nov 2026). The code adds it after
  // the part Claude writes (hook to closing question), so it is the same every week.
  captionOutro:
    "About this series: at Peak Nine │ Impact Innovation Studio, we help development interventions grow into financial sustainability and local ownership. Scale & Sustain Stories is where we share what we learn on the way. Each week, one real programme from our Beyond the Grant Library: what worked, and what is still open.",
  captionLinkLine: (org: string) => `Read the full ${org} case:`,
  captionBodyLimit: 850,

  // Fixed line for page 9 (the call to action)
  ctaParagraph: "Our Proof of Change programme helps development interventions build a path to financial sustainability and local ownership.",
};

/** Who may ask for a different case with 🔁: SSS_ALLOWED_SLACK_USER_IDS, else Tendi's writer allowlist. */
export function sssAllowedUsers(env = process.env): string[] {
  const raw = env.SSS_ALLOWED_SLACK_USER_IDS || env.TENDI_WRITE_ALLOWLIST || "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function sssEnabled(env = process.env): boolean {
  return env.SSS_ENABLED !== "0";
}
