/**
 * Task capture for Pidgi: configuration and pure helpers.
 *
 * Nothing in this file talks to Slack, Notion or Anthropic, so it can be unit-tested
 * without booting the bot. The network side lives in tasks.ts.
 *
 * The flow: someone tags Pidgi with "turn this into a task for Laura (by Friday)" or
 * "put this on the Touchdown agenda". Pidgi reads the thread (or the messages above),
 * distils one or more items, and posts each as a draft card with pickers. Only when
 * someone clicks "Add to board" is the row written to the Notion board.
 *
 * Two kinds of board:
 *   - person boards (Laura's, Sankhya's): that person's own work backlog
 *   - meeting boards (Touchdown, the team sync): topics for a recurring meeting
 */

// ── Team ────────────────────────────────────────────────────────────────────

export interface TeamMember {
  name: string;
  email: string;
  notionId: string;
}

/** Peak Nine people Pidgi can name as Owner / Creator / Assignee in Notion. */
export const DEFAULT_TEAM: TeamMember[] = [
  { name: "Niels", email: "niels@peaknine.studio", notionId: "2d1d872b-594c-8145-ac7e-00025e996fbe" },
  { name: "Jonas", email: "jonas@peaknine.studio", notionId: "274d872b-594c-81ae-9cba-0002e52cea03" },
  { name: "Laura", email: "laura@peaknine.studio", notionId: "380d872b-594c-81ad-9c03-000226cbb638" },
  { name: "Sankhya", email: "sankhya@peaknine.studio", notionId: "380d872b-594c-8109-a350-000220c26f19" },
  { name: "Bertille", email: "bertille@peaknine.studio", notionId: "277d872b-594c-8168-9159-00022f49c82c" },
  { name: "Diego", email: "diego@peaknine.studio", notionId: "3d3d872b-594c-81a9-8a00-00028b39f9e9" },
];

/** The team, plus extra people from TASK_TEAM (JSON array of {name, email, notionId}). */
export function loadTeam(env: Record<string, string | undefined> = process.env): TeamMember[] {
  const team = [...DEFAULT_TEAM];
  if (env.TASK_TEAM) {
    try {
      for (const p of JSON.parse(env.TASK_TEAM) || []) {
        if (!p?.email || !p?.notionId) continue;
        const email = String(p.email).toLowerCase();
        const i = team.findIndex((t) => t.email === email);
        const member = { name: String(p.name || email.split("@")[0]), email, notionId: String(p.notionId) };
        if (i >= 0) team[i] = member;
        else team.push(member);
      }
    } catch {
      /* keep the defaults */
    }
  }
  return team;
}

export function notionIdFor(team: TeamMember[], email: string | null | undefined): string | null {
  if (!email) return null;
  return team.find((t) => t.email === String(email).toLowerCase())?.notionId || null;
}

// ── Boards ──────────────────────────────────────────────────────────────────

/** Which Notion property holds what. Leave a field out when the board has no such column. */
export interface BoardFields {
  title: string;
  /** rich_text: the context. Without it, the context goes in the page body. */
  text?: string;
  deadline?: string;
  status?: { prop: string; type: "select" | "status"; value: string };
  /** What the date picker is called on the card ("Deadline" when absent, "Start date" for events). */
  deadlineLabel?: string;
  /** date: the last day of something that spans several days (events). */
  endDate?: string;
  /** url: the first link from the conversation (events). */
  url?: string;
  /** select (or multi_select, see projectType): options are read live from Notion. */
  project?: string;
  /** What the project picker is called on the card ("Project" when absent). */
  projectLabel?: string;
  projectType?: "select" | "multi_select";
  /** multi_select set on every new row, e.g. Tags = Tasks. */
  tag?: { prop: string; value: string };
  /** people: the person who asked Pidgi. */
  requester?: string;
  /** people: who does it. On a person board that is the board's person; on a meeting board, whoever is named. */
  assignee?: string;
  /** rich_text: links. Without it, links go in the page body. */
  resources?: string;
}

export interface TaskBoard {
  /** Stable key used in Slack payloads, e.g. "laura", "touchdown". */
  key: string;
  /** person: someone's backlog; meeting: an agenda; list: a shared list of things (events). */
  kind: "person" | "meeting" | "list";
  /** Short name: "Laura", "Touchdown". */
  name: string;
  /** How the board is called in Slack: "Laura's board", "Touchdown agenda". */
  label: string;
  /** One line for the model: what goes on this board. */
  description: string;
  /** Words the requester may use for this board (lowercase). */
  aliases: string[];
  /** Person boards: that person's email. */
  email?: string;
  /** Notion DATABASE id (not the data source id). The Pidgi integration must be connected to it. */
  databaseId: string;
  /** Data source id, for a database with several data sources: rows are then written there. */
  dataSourceId?: string;
  /** Link to the board, shown in Slack. */
  boardUrl: string;
  fields: BoardFields;
  /** Emails allowed to see and use this board. Absent = the whole team. */
  restrictedTo?: string[];
  /** Other Notion pages/databases that only `restrictedTo` may read through Pidgi (the rest of a private meeting page). */
  privateIds?: string[];
  /** Anyone may put items on it through a draft card; reading it stays limited to `restrictedTo`. */
  openForAdding?: boolean;
  /** Words that name this private board. Anyone else who uses them gets PRIVATE_REPLY, and they are kept out of answers to them. */
  secretWords?: string[];
}

/** What Pidgi says to anyone outside a private board's circle. It never confirms what is behind it. */
export const PRIVATE_REPLY = "I'm afraid my settings can't help you with that, please discuss with Niels.";

/** Laura's and Sankhya's backlogs share these columns. */
export const PERSON_FIELDS: BoardFields = {
  title: "Title",
  text: "Text",
  deadline: "Deadline",
  status: { prop: "Status", type: "select", value: "To Start" },
  project: "Project",
  // On Laura's board the one filled-in Owner is Niels, the person who asked for the work.
  requester: "Owner",
  resources: "Resources",
};

export const DEFAULT_BOARDS: TaskBoard[] = [
  {
    key: "laura",
    kind: "person",
    name: "Laura",
    label: "Laura's board",
    description: "Laura's own work backlog (she is Peak Nine's designer).",
    aliases: ["laura", "laura lang"],
    email: "laura@peaknine.studio",
    // 🐝 Laura's Magic Work 🪄 → Backlog
    databaseId: "c4f4ed2a82bf467eb290fa670606a2e7",
    boardUrl: "https://www.notion.so/3f8c675ff95881048402cd087d98edda",
    fields: PERSON_FIELDS,
  },
  {
    key: "sankhya",
    kind: "person",
    name: "Sankhya",
    label: "Sankhya's board",
    description: "Sankhya's own work backlog.",
    aliases: ["sankhya", "sankhya gembali"],
    email: "sankhya@peaknine.studio",
    // 🧭 Sankhya's Work Board → Backlog (same columns as Laura's)
    databaseId: "8b8f90869c124b19a093f4f7aa9c53e5",
    boardUrl: "https://www.notion.so/400c675ff95881d7ad53c0d485818fa3",
    fields: PERSON_FIELDS,
  },
  {
    key: "touchdown",
    kind: "meeting",
    name: "Touchdown",
    label: "Touchdown agenda",
    description: "Agenda of the weekly Touchdown, the one-on-one between Niels and Jonas (the two founders). Topics for the two of them to discuss.",
    aliases: [
      "touchdown",
      "touchdown agenda",
      "one-on-one",
      "1:1",
      "1-on-1",
      "een-op-een",
      "jonas and niels' 1:1",
      "niels and jonas' 1:1",
      "jonas x niels",
      "the 1:1 of jonas and niels",
      "founders meeting",
      "founders' meeting",
    ],
    // 🏈 Touchdown → ✨ Agenda
    databaseId: "2d5c675ff9588011ac09cd22663b3c68",
    boardUrl: "https://www.notion.so/2d5c675ff958800f919aea617356cc23",
    fields: {
      title: "Task name",
      text: "Description",
      deadline: "Due date",
      status: { prop: "Status", type: "status", value: "Not started" },
      assignee: "Assignee",
    },
    // The team may add topics; only Niels and Jonas can read the agenda.
    restrictedTo: ["niels@peaknine.studio", "jonas@peaknine.studio"],
    openForAdding: true,
    privateIds: [
      "2d5c675ff958800f919aea617356cc23", // the Touchdown page
      "2d5c675ff95880ea8b24000b16fcf8e5", // ⚡ Agenda data source
      "2d5c675ff95880d9a06fe8671241f612", // mental check-in
      "3bfc675ff9588002817fc58860e39af1", // 🕊️ Projects
      "356c675ff95880a383acdd35ca853362", // 💤 OLD / Archive
    ],
    secretWords: ["touchdown"],
  },
  {
    key: "mothership",
    kind: "person",
    name: "Mothership",
    label: "Mothership",
    description: "Niels's own private to-do list (Pending Tasks). Only Niels uses it.",
    aliases: ["mothership", "my mothership", "niels", "my board", "my todos", "my to-dos", "my list"],
    email: "niels@peaknine.studio",
    // 👾 Mothership → Pending Tasks. The database also shows the Touchdown agenda and the
    // Must Win Battle Board, so rows are written to the Pending Tasks data source itself.
    databaseId: "2d3c675ff95880428289ccdb7612c52d",
    dataSourceId: "2d3c675ff9588031805c000b7f320c36",
    boardUrl: "https://www.notion.so/2d3c675ff95880428289ccdb7612c52d",
    fields: {
      title: "Task",
      deadline: "Due Date",
      project: "Project",
      projectType: "multi_select",
      tag: { prop: "Tags", value: "Tasks" },
    },
    restrictedTo: ["niels@peaknine.studio"],
    privateIds: [
      "2d3c675ff9588031805c000b7f320c36", // Pending Tasks data source
      "2d5c675ff95880c1ba91cb520bc70bde", // ♟️ Must Win Battle Board (on Strategy)
      "2d5c675ff9588051bdae000b4dd1d23e", // its data source
      "402c675ff958800990a0d32640656e2a", // 🎙️ Recordings (Niels's meeting notes, read by GTD)
      "402c675ff958802b865a000b1f175a8c", // its data source
    ],
    secretWords: ["mothership", "must win battle", "mwb"],
  },
  {
    key: "events",
    kind: "list",
    name: "Events",
    label: "events list",
    description:
      "Events worth attending: conferences, summits, webinars, meetups the team thinks Peak Nine could go to. title = the event's own name; deadline = its start date; end_date = its last day when it lasts more than one day; urls = the event's own page; project = its theme.",
    aliases: ["events", "event", "events list", "events board", "event board", "events worth attending", "evenement", "evenementen"],
    // Events worth attending → Events. Whoever asks Pidgi becomes the Owner.
    databaseId: "69cb02e89b0a44d987d9aaad4dd9c723",
    boardUrl: "https://www.notion.so/400c675ff9588184b591ce1f9373ff96",
    fields: {
      title: "Event name",
      deadline: "Start date",
      deadlineLabel: "Start date",
      endDate: "End date",
      url: "Link",
      requester: "Owner",
      project: "Theme",
      projectType: "multi_select",
      projectLabel: "Theme",
    },
  },
  {
    key: "team",
    kind: "meeting",
    name: "Team sync",
    label: "Team sync talking points",
    description: "Talking points for the internal Peak Nine team meeting (Peak Nine Syncs). Topics for the whole team.",
    aliases: ["team meeting", "team sync", "internal sync", "sync", "talking points", "teammeeting", "teamoverleg"],
    // 🚂 Peak Nine Syncs (Internal) → ✏️ Talking Points
    databaseId: "3f9c675ff95880aeb5fdff8f398a60b4",
    boardUrl: "https://www.notion.so/31ec675ff958806289ebc0024e2eb2a9",
    fields: {
      title: "Task",
      deadline: "Deadline",
      status: { prop: ".", type: "status", value: "Not started" },
      project: "Project",
      requester: "Creator",
      assignee: "Assignee",
    },
  },
];

/**
 * Boards from TASK_BOARDS (a JSON array) when set, else the defaults. A minimal entry
 * ({key, name, email, databaseId}) becomes a person board with Laura's columns.
 */
export function loadBoards(env: Record<string, string | undefined> = process.env): TaskBoard[] {
  const raw = env.TASK_BOARDS;
  if (!raw) return DEFAULT_BOARDS;
  try {
    const list = JSON.parse(raw);
    if (!Array.isArray(list) || !list.length) return DEFAULT_BOARDS;
    const out: TaskBoard[] = [];
    for (const b of list) {
      if (!b?.key || !b?.databaseId) continue;
      const key = String(b.key).toLowerCase();
      const kind = b.kind === "meeting" || b.kind === "list" ? b.kind : "person";
      const name = String(b.name || key);
      out.push({
        key,
        kind,
        name,
        label: String(b.label || (kind === "person" ? `${name}'s board` : name)),
        description: String(b.description || (kind === "person" ? `${name}'s own work backlog.` : `Topics for ${name}.`)),
        aliases: Array.isArray(b.aliases) ? b.aliases.map((a: any) => String(a).toLowerCase()) : [key],
        email: b.email ? String(b.email).toLowerCase() : undefined,
        databaseId: normId(String(b.databaseId)),
        dataSourceId: b.dataSourceId ? normId(String(b.dataSourceId)) : undefined,
        boardUrl: String(b.boardUrl || `https://www.notion.so/${normId(String(b.databaseId))}`),
        fields: b.fields && b.fields.title ? b.fields : PERSON_FIELDS,
        restrictedTo: Array.isArray(b.restrictedTo) ? b.restrictedTo.map((e: any) => String(e).toLowerCase()) : undefined,
        privateIds: Array.isArray(b.privateIds) ? b.privateIds.map((i: any) => normId(String(i))) : undefined,
        openForAdding: b.openForAdding === true || undefined,
        secretWords: Array.isArray(b.secretWords) ? b.secretWords.map((w: any) => String(w).toLowerCase()) : undefined,
      });
    }
    return out.length ? out : DEFAULT_BOARDS;
  } catch {
    return DEFAULT_BOARDS;
  }
}

/** Notion ids with or without dashes compare equal. */
export function normId(id: string): string {
  return String(id || "").replace(/-/g, "").toLowerCase().trim();
}

/** True when a Notion database id is one of the boards (used to keep the main loop off them). */
export function isTaskBoardDatabase(id: string, boards: TaskBoard[] = loadBoards()): boolean {
  const n = normId(id);
  return !!n && boards.some((b) => normId(b.databaseId) === n);
}

/** May this person see and use the board? */
export function canUseBoard(board: TaskBoard, email: string | null | undefined): boolean {
  if (!board.restrictedTo || !board.restrictedTo.length) return true;
  return !!email && board.restrictedTo.includes(String(email).toLowerCase());
}

/** The boards this person may use (read and add to). */
export function boardsFor(email: string | null | undefined, boards: TaskBoard[] = loadBoards()): TaskBoard[] {
  return boards.filter((b) => canUseBoard(b, email));
}

/** May this person put an item on the board? Also true for an open-for-adding board they can't read. */
export function canAddTo(board: TaskBoard, email: string | null | undefined): boolean {
  return canUseBoard(board, email) || !!board.openForAdding;
}

/** The boards this person may add items to. */
export function addableBoardsFor(email: string | null | undefined, boards: TaskBoard[] = loadBoards()): TaskBoard[] {
  return boards.filter((b) => canAddTo(b, email));
}

/** Notion ids this person must not read or change through Pidgi's general Notion tools. */
export function hiddenNotionIds(email: string | null | undefined, boards: TaskBoard[] = loadBoards()): string[] {
  const out: string[] = [];
  for (const b of boards) {
    if (canUseBoard(b, email)) continue;
    out.push(normId(b.databaseId), ...(b.privateIds || []).map(normId));
  }
  return out;
}

/** Every Notion id behind a restricted board, whoever asks (to keep private turns out of shared memory). */
export function restrictedNotionIds(boards: TaskBoard[] = loadBoards()): string[] {
  return boards.filter((b) => b.restrictedTo?.length).flatMap((b) => [b.databaseId, b.dataSourceId || "", ...(b.privateIds || [])].filter(Boolean).map(normId));
}

/** True when a board is restricted (only some people may use it). */
export function isRestrictedBoard(board: TaskBoard | undefined): boolean {
  return !!board?.restrictedTo?.length;
}

/** exceptAddable: leave out boards this person may still add to (naming those is fine when adding). */
interface HiddenOpts {
  exceptAddable?: boolean;
}

function secretWordsFor(email: string | null | undefined, boards: TaskBoard[], opts: HiddenOpts = {}): string[] {
  return boards
    .filter((b) => !canUseBoard(b, email) && !(opts.exceptAddable && canAddTo(b, email)))
    .flatMap((b) => b.secretWords || []);
}

/** Does this text name a private board this person may not read? */
export function mentionsHiddenBoard(text: string, email: string | null | undefined, boards: TaskBoard[] = loadBoards(), opts: HiddenOpts = {}): boolean {
  const t = String(text || "").toLowerCase();
  return secretWordsFor(email, boards, opts).some((w) => new RegExp(`(^|[^a-z])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z]|$)`, "i").test(t));
}

/** Last line of defence on anything Pidgi says: an answer that names a hidden board becomes PRIVATE_REPLY. */
export function scrubPrivate(text: string, email: string | null | undefined, boards: TaskBoard[] = loadBoards(), opts: HiddenOpts = {}): string {
  return mentionsHiddenBoard(text, email, boards, opts) ? PRIVATE_REPLY : text;
}

// ── Trigger ─────────────────────────────────────────────────────────────────

/**
 * Cheap pre-filter: does the message talk about tasks, a board or a meeting at all? A hit is
 * NOT a decision; the distil step decides whether this is a request to add something or a
 * question (which goes to Pidgi's normal planning brain). "agenda" only counts in phrases
 * like "on the agenda" / "op de agenda", so "what's on my agenda today" stays with the
 * calendar side of Pidgi.
 */
export function looksLikeTaskRequest(text: string): boolean {
  const t = String(text || "");
  if (/(^|[^a-z])(tasks?|to-?dos?|todo's|taak|taken|action items?|actiepunt(en)?|backlog|boards?|bord|events?|evenement(en)?|touchdown|mothership|(?<![0-9])1[:-]1(?![0-9])|1-on-1|one[- ]on[- ]one|(een|één)[- ]op[- ](een|één)|founders'? ?(meeting|overleg)|talking points?|bespreekpunt(en)?|team ?meeting|team ?sync|teamoverleg)([^a-z]|$)/i.test(t)) return true;
  return /(^|[^a-z])(on|onto|to|op|for|voor|naar)\s+(the\s+|de\s+|het\s+|our\s+|onze\s+)?(?!my\s|mijn\s)([a-z-]+\s+)?agenda([^a-z]|$)/i.test(t);
}

// ── Dates (Europe/Brussels) ─────────────────────────────────────────────────

const TZ = "Europe/Brussels";
const WD_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Today's date in Brussels as YYYY-MM-DD. */
export function todayBrussels(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

/** A Slack ts ("1789464794.876149") as "Mon 19 Oct 14:02" in Brussels time. */
export function slackTsLabel(ts: string): string {
  const d = new Date(Number(String(ts).split(".")[0]) * 1000);
  if (isNaN(d.getTime())) return "?";
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value || "";
  return `${get("weekday")} ${get("day")} ${get("month")} ${get("hour")}:${get("minute")}`;
}

function isoToUtcNoon(iso: string): Date {
  return new Date(String(iso).slice(0, 10) + "T12:00:00Z");
}

export function isIsoDate(s: unknown): s is string {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = isoToUtcNoon(s);
  return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

/** "2026-10-23" → "Fri 23 Oct 2026". */
export function prettyDate(iso: string): string {
  if (!isIsoDate(iso)) return String(iso || "");
  const d = isoToUtcNoon(iso);
  return `${WD_SHORT[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** ISO week number of a YYYY-MM-DD date. */
export function isoWeek(iso: string): number {
  const d = isoToUtcNoon(iso);
  const day = (d.getUTCDay() + 6) % 7; // Mon=0
  d.setUTCDate(d.getUTCDate() - day + 3); // Thursday of this week
  const firstThu = new Date(Date.UTC(d.getUTCFullYear(), 0, 4, 12));
  const fday = (firstThu.getUTCDay() + 6) % 7;
  firstThu.setUTCDate(firstThu.getUTCDate() - fday + 3);
  return 1 + Math.round((d.getTime() - firstThu.getTime()) / (7 * 86400000));
}

/**
 * A week-by-week calendar so the model never computes weekdays itself (it gets them wrong).
 * One line per ISO week, from the week of (today - backDays) to the week of (today + aheadDays).
 */
export function calendarLines(todayIso: string, backDays = 14, aheadDays = 84): string {
  const t = isoToUtcNoon(todayIso);
  const start = new Date(t.getTime() - backDays * 86400000);
  start.setUTCDate(start.getUTCDate() - ((start.getUTCDay() + 6) % 7)); // back to Monday
  const end = new Date(t.getTime() + aheadDays * 86400000);
  const lines: string[] = [];
  for (let wk = new Date(start); wk <= end; wk = new Date(wk.getTime() + 7 * 86400000)) {
    const days: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(wk.getTime() + i * 86400000);
      const iso = d.toISOString().slice(0, 10);
      days.push(`${WD_SHORT[d.getUTCDay()]} ${iso}${iso === todayIso ? " (today)" : ""}`);
    }
    lines.push(`W${isoWeek(wk.toISOString().slice(0, 10))}: ${days.join(", ")}`);
  }
  return lines.join("\n");
}

// ── Slack text ──────────────────────────────────────────────────────────────

/** Slack mrkdwn → plain text, with user mentions turned into names. */
export function slackToPlain(text: string, names: Record<string, string> = {}): string {
  let t = String(text || "");
  t = t.replace(/<@([A-Z0-9]+)(?:\|[^>]*)?>/g, (_m, id) => `@${names[id] || "someone"}`);
  t = t.replace(/<#[A-Z0-9]+\|([^>]*)>/g, "#$1");
  t = t.replace(/<!(here|channel|everyone)[^>]*>/g, "@$1");
  t = t.replace(/<(https?:\/\/[^|>]+)\|([^>]+)>/g, "$2 ($1)").replace(/<(https?:\/\/[^>]+)>/g, "$1");
  t = t.replace(/<mailto:([^|>]+)\|([^>]+)>/g, "$2");
  t = t.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
  return t.replace(/[ \t]+\n/g, "\n").replace(/[ \t]{2,}/g, " ").trim();
}

/** User ids mentioned in Slack text. */
export function mentionedUserIds(text: string): string[] {
  const out = new Set<string>();
  for (const m of String(text || "").matchAll(/<@([A-Z0-9]+)(?:\|[^>]*)?>/g)) out.add(m[1]);
  return Array.from(out);
}

/** Every http(s) URL in a piece of text, trailing punctuation trimmed. */
export function extractUrls(text: string): string[] {
  const out = new Set<string>();
  for (const m of String(text || "").matchAll(/https?:\/\/[^\s<>|"')\]]+/g)) {
    out.add(m[0].replace(/[.,;:!?]+$/, ""));
  }
  return Array.from(out);
}

export interface SlackPermalink {
  channel: string;
  ts: string;
  threadTs?: string;
}

/** Slack message links in a message ("…slack.com/archives/C123/p1789464794876149?thread_ts=…"). */
export function parseSlackPermalinks(text: string): SlackPermalink[] {
  const out: SlackPermalink[] = [];
  const re = /https:\/\/[a-z0-9-]+\.slack\.com\/archives\/([A-Z0-9]+)\/p(\d{10})(\d{6})([^\s>|]*)/g;
  for (const m of String(text || "").matchAll(re)) {
    const thread = /[?&]thread_ts=(\d+\.\d+)/.exec(m[4] || "");
    out.push({ channel: m[1], ts: `${m[2]}.${m[3]}`, ...(thread ? { threadTs: thread[1] } : {}) });
  }
  return out;
}

export interface TranscriptLine {
  ts: string;
  author: string;
  text: string;
  /** 0 = top level, 1 = a reply inside a thread. */
  depth: number;
}

/**
 * Lines → one readable transcript. If it is too long, keep the first line (the thread
 * root, which usually states the ask) and the most recent lines.
 */
export function formatTranscript(lines: TranscriptLine[], maxChars = 14000): string {
  const rendered = lines.map((l) => `${l.depth ? "    ↳ " : ""}[${slackTsLabel(l.ts)}] ${l.author}: ${l.text}`);
  const total = rendered.join("\n");
  if (total.length <= maxChars || rendered.length < 3) return total.slice(-maxChars);
  const head = rendered[0];
  const tail: string[] = [];
  let used = head.length + 60;
  for (let i = rendered.length - 1; i > 0; i--) {
    if (used + rendered[i].length + 1 > maxChars) break;
    tail.unshift(rendered[i]);
    used += rendered[i].length + 1;
  }
  const skipped = rendered.length - 1 - tail.length;
  return [head, `… (${skipped} earlier message${skipped === 1 ? "" : "s"} left out) …`, ...tail].join("\n");
}

// ── House style ─────────────────────────────────────────────────────────────

/** Peak Nine house style: no em or en dashes in anything Pidgi writes. */
export function houseStyle(s: string): string {
  return String(s || "")
    .replace(/(\d)\s*[–—]\s*(\d)/g, "$1-$2")
    .replace(/\s*[—–]\s*/g, ", ")
    .replace(/,\s*,/g, ",")
    .trim();
}

// ── Model output → checked drafts ───────────────────────────────────────────

export interface DraftTask {
  board: string;
  title: string;
  context: string;
  deadline: string | null;
  deadlineQuote: string | null;
  /** Last day, for boards with an end date (events). */
  endDate?: string | null;
  project: string | null;
  urls: string[];
  /** Email of the person named as responsible (meeting boards). */
  responsible: string | null;
}

export interface Distilled {
  isTaskRequest: boolean;
  tasks: DraftTask[];
  problem: string | null;
  /** Things the code changed or dropped, per task, shown on the card. */
  notes: string[][];
  /** The requester named a board or person this requester has no board for. */
  unknownBoard: boolean;
}

function squash(s: string): string {
  return String(s || "")
    .toLowerCase()
    .replace(/[“”"'‘’]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Check what the model returned against the source. Nothing the model says is trusted
 * on its own: a deadline must come with words that really appear in the conversation,
 * a link must really appear in the conversation, a project must be an option on that
 * board, a responsible person must be on the team, and the board must be one the
 * requester may use.
 */
export function validateDistilled(
  raw: any,
  opts: { boards: TaskBoard[]; projectOptions: Record<string, string[]>; team: TeamMember[]; sourceText: string; today: string }
): Distilled {
  const source = squash(opts.sourceText);
  const sourceUrls = new Set(extractUrls(opts.sourceText));
  const out: Distilled = {
    isTaskRequest: !!raw?.is_task_request,
    tasks: [],
    problem: raw?.problem ? houseStyle(String(raw.problem)).slice(0, 500) || null : null,
    notes: [],
    unknownBoard: false,
  };
  const list = Array.isArray(raw?.tasks) ? raw.tasks.slice(0, 5) : [];
  for (const t of list) {
    const notes: string[] = [];
    const board = opts.boards.find((b) => b.key === String(t?.board || "").toLowerCase());
    if (!board) {
      out.unknownBoard = true;
      continue;
    }
    const title = houseStyle(String(t?.title || "")).slice(0, 150);
    if (!title) continue;
    const context = houseStyle(String(t?.context || "")).slice(0, 900);

    let deadline: string | null = board.fields.deadline && isIsoDate(t?.deadline) ? t.deadline : null;
    let deadlineQuote: string | null = t?.deadline_quote ? String(t.deadline_quote).trim().slice(0, 80) : null;
    if (deadline && (!deadlineQuote || !source.includes(squash(deadlineQuote)))) {
      notes.push("I left the deadline empty because I couldn't point to where it was said.");
      deadline = null;
    }
    if (!deadline) deadlineQuote = null;
    const dateWord = board.fields.deadlineLabel ? board.fields.deadlineLabel.toLowerCase() : "deadline";
    if (deadline && deadline < opts.today) notes.push(`The ${dateWord} I found (${prettyDate(deadline)}) is already in the past.`);

    // An end date follows the same rule: it must come with words that are really in the conversation.
    let endDate: string | null = board.fields.endDate && deadline && isIsoDate(t?.end_date) ? t.end_date : null;
    const endQuote = t?.end_date_quote ? String(t.end_date_quote).trim() : "";
    if (endDate && (!endQuote || !source.includes(squash(endQuote)) || endDate < (deadline as string))) endDate = null;

    let project: string | null = board.fields.project && t?.project ? String(t.project) : null;
    if (project && !(opts.projectOptions[board.key] || []).includes(project)) project = null;

    const urls = (Array.isArray(t?.urls) ? t.urls : [])
      .map((u: any) => String(u).replace(/[.,;:!?]+$/, ""))
      .filter((u: string) => sourceUrls.has(u))
      .slice(0, 4);

    let responsible: string | null = null;
    if (board.kind === "meeting" && board.fields.assignee && t?.responsible) {
      const who = String(t.responsible).toLowerCase().trim();
      responsible = opts.team.find((m) => m.name.toLowerCase() === who || m.email === who)?.email || null;
    }

    out.tasks.push({ board: board.key, title, context, deadline, deadlineQuote, endDate, project, urls, responsible });
    out.notes.push(notes);
  }
  return out;
}

// ── Draft payload (travels inside the Slack buttons, so drafts survive a redeploy) ──

export interface DraftPayload {
  v: 1;
  /** title */
  t: string;
  /** context */
  c: string;
  /** urls */
  u: string[];
  /** source permalink */
  s: string | null;
  /** requester Slack user id */
  q: string;
  /** board key */
  a: string;
  /** deadline YYYY-MM-DD */
  d: string | null;
  /** words the deadline came from */
  dq: string | null;
  /** project option */
  p: string | null;
  /** responsible person's email (meeting boards) */
  r?: string | null;
  /** end date YYYY-MM-DD (events) */
  e?: string | null;
}

/** Slack caps a button value at 2000 characters; trim the context, then the links, to fit. */
export function encodeDraft(d: DraftPayload, max = 1990): string {
  const copy: DraftPayload = { ...d, u: [...d.u] };
  let s = JSON.stringify(copy);
  while (s.length > max && copy.c.length > 0) {
    copy.c = copy.c.slice(0, Math.max(0, copy.c.length - (s.length - max) - 1));
    s = JSON.stringify(copy);
  }
  while (s.length > max && copy.u.length > 0) {
    copy.u.pop();
    s = JSON.stringify(copy);
  }
  if (s.length > max && copy.s) {
    copy.s = null;
    s = JSON.stringify(copy);
  }
  return s;
}

export function decodeDraft(value: string | undefined): DraftPayload | null {
  try {
    const d = JSON.parse(String(value || ""));
    if (!d || d.v !== 1 || typeof d.t !== "string" || typeof d.a !== "string" || typeof d.q !== "string") return null;
    return {
      v: 1,
      t: d.t,
      c: typeof d.c === "string" ? d.c : "",
      u: Array.isArray(d.u) ? d.u.map(String) : [],
      s: typeof d.s === "string" ? d.s : null,
      q: d.q,
      a: d.a,
      d: isIsoDate(d.d) ? d.d : null,
      dq: typeof d.dq === "string" ? d.dq : null,
      p: typeof d.p === "string" && d.p ? d.p : null,
      r: typeof d.r === "string" && d.r ? d.r : null,
      ...(isIsoDate(d.e) ? { e: d.e } : {}),
    };
  } catch {
    return null;
  }
}

// ── Block Kit ───────────────────────────────────────────────────────────────

export const A = {
  owner: "p9task_owner",
  deadline: "p9task_deadline",
  project: "p9task_project",
  responsible: "p9task_resp",
  create: "p9task_create",
  edit: "p9task_edit",
  discard: "p9task_discard",
  editSubmit: "p9task_edit_submit",
} as const;

const NONE = "__none__";

function opt(text: string, value: string) {
  return { text: { type: "plain_text", text: text.slice(0, 75), emoji: true }, value: value.slice(0, 150) };
}

function linkLabel(url: string): string {
  try {
    const u = new URL(url);
    const tail = u.pathname.length > 1 ? u.pathname.split("/").filter(Boolean).pop() || "" : "";
    return (u.hostname.replace(/^www\./, "") + (tail ? `/…/${tail}` : "")).slice(0, 60);
  } catch {
    return url.slice(0, 60);
  }
}

function esc(s: string): string {
  return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function boardOf(boards: TaskBoard[], key: string): TaskBoard | undefined {
  return boards.find((b) => b.key === key);
}

/** How to name a board in a sentence: "Laura's board", "the Touchdown agenda". */
export function boardRef(b: TaskBoard): string {
  return b.kind === "person" ? b.label : `the ${b.label}`;
}

function cardHeader(board: TaskBoard | undefined, key: string): string {
  if (!board) return `📝 *Draft for ${esc(key)}*`;
  if (board.kind === "list") return `📝 *Draft for the ${esc(board.label)}*`;
  return board.kind === "person" ? `📝 *Draft task for ${esc(board.name)}*` : `📝 *Draft for the ${esc(board.label)}*`;
}

/**
 * The draft card: what Pidgi understood, the pickers, and the buttons.
 * `boards` are the boards the requester may use; only those show up in the picker.
 */
export function draftBlocks(
  d: DraftPayload,
  opts: { boards: TaskBoard[]; projectOptions: string[]; team?: TeamMember[]; notes?: string[] }
): any[] {
  const board = boardOf(opts.boards, d.a);
  const value = encodeDraft(d);
  const blocks: any[] = [
    { type: "section", text: { type: "mrkdwn", text: `${cardHeader(board, d.a)}  ·  _not on the board yet_` } },
    { type: "section", text: { type: "mrkdwn", text: `*${esc(d.t)}*${d.c ? `\n${esc(d.c)}` : ""}`.slice(0, 2990) } },
  ];
  const links = [...d.u.map((u) => `<${u}|${esc(linkLabel(u))}>`), ...(d.s ? [`<${d.s}|Slack thread>`] : [])];
  if (links.length) {
    blocks.push({ type: "context", elements: [{ type: "mrkdwn", text: `🔗 ${links.join("  ·  ")}`.slice(0, 2990) }] });
  }

  const fields: any[] = [
    {
      type: "static_select",
      action_id: A.owner,
      placeholder: { type: "plain_text", text: "Which board?" },
      options: opts.boards.map((b) => opt(b.label, b.key)),
      ...(board ? { initial_option: opt(board.label, board.key) } : {}),
    },
  ];
  if (!board || board.fields.deadline) {
    fields.push({
      type: "datepicker",
      action_id: A.deadline,
      placeholder: { type: "plain_text", text: board?.fields.deadlineLabel || "Deadline" },
      ...(d.d ? { initial_date: d.d } : {}),
    });
  }
  if (board?.fields.project && opts.projectOptions.length) {
    const projWord = board.fields.projectLabel || "Project";
    const projOpts = [opt(`No ${projWord.toLowerCase()}`, NONE), ...opts.projectOptions.slice(0, 99).map((p) => opt(p, p))];
    fields.push({
      type: "static_select",
      action_id: A.project,
      placeholder: { type: "plain_text", text: projWord },
      options: projOpts,
      ...(d.p && opts.projectOptions.includes(d.p) ? { initial_option: opt(d.p, d.p) } : {}),
    });
  }
  const team = opts.team || [];
  if (board?.kind === "meeting" && board.fields.assignee && team.length) {
    const who = team.find((m) => m.email === d.r);
    fields.push({
      type: "static_select",
      action_id: A.responsible,
      placeholder: { type: "plain_text", text: "Who picks it up?" },
      options: [opt("Nobody yet", NONE), ...team.slice(0, 99).map((m) => opt(m.name, m.email))],
      ...(who ? { initial_option: opt(who.name, who.email) } : {}),
    });
  }
  blocks.push({ type: "actions", block_id: "p9task_fields", elements: fields });

  const hints: string[] = [];
  if (board?.kind === "list" && board.fields.deadlineLabel) {
    const word = board.fields.deadlineLabel;
    if (d.d && d.dq) hints.push(`${word} taken from “${esc(d.dq)}”.`);
    else if (d.d) hints.push(`${word} set to ${prettyDate(d.d)}.`);
    else hints.push(`⚠️ No date in the conversation. Pick the ${word.toLowerCase()} above.`);
    if (d.d && d.e && d.e !== d.d) hints.push(`Ends ${prettyDate(d.e)}.`);
  } else if (!board || board.fields.deadline) {
    if (d.d && d.dq) hints.push(`Deadline taken from “${esc(d.dq)}”.`);
    else if (d.d) hints.push(`Deadline set to ${prettyDate(d.d)}.`);
    else if (board?.kind === "meeting") hints.push("No deadline. Pick one above if it needs one.");
    else hints.push("⚠️ No deadline in the conversation. Pick one above, or leave it empty.");
  }
  for (const n of opts.notes || []) hints.push(esc(n));
  if (hints.length) blocks.push({ type: "context", elements: [{ type: "mrkdwn", text: hints.join("  ").slice(0, 2990) }] });

  blocks.push({
    type: "actions",
    block_id: "p9task_buttons",
    elements: [
      { type: "button", style: "primary", action_id: A.create, text: { type: "plain_text", text: "✅ Add to board", emoji: true }, value },
      { type: "button", action_id: A.edit, text: { type: "plain_text", text: "✏️ Edit text", emoji: true }, value },
      { type: "button", style: "danger", action_id: A.discard, text: { type: "plain_text", text: "Discard", emoji: true }, value: JSON.stringify({ v: 1, q: d.q }) },
    ],
  });
  return blocks;
}

export function draftFallbackText(d: DraftPayload, boards: TaskBoard[]): string {
  const b = boardOf(boards, d.a);
  return `Draft for ${b?.label || d.a}: ${d.t}`;
}

/** Card after the row was written. */
export function doneBlocks(args: {
  /** As used in a sentence, see boardRef. */
  boardLabel: string;
  boardUrl: string;
  title: string;
  pageUrl: string;
  byUserId: string;
  deadline: string | null;
  project: string | null;
  people: string[];
  notes?: string[];
}): any[] {
  const meta = [
    args.deadline ? `📅 ${prettyDate(args.deadline)}` : "📅 no deadline",
    args.project ? `🗂️ ${esc(args.project)}` : null,
    ...args.people.map((p) => `👤 ${esc(p)}`),
  ].filter(Boolean);
  const blocks: any[] = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        // No links when the person can't open the board anyway (an open-for-adding board).
        text: args.boardUrl
          ? `✅ *Added to ${esc(args.boardLabel).replace(/^(the )?(.*)$/, (_m, the, rest) => `${the || ""}<${args.boardUrl}|${rest}>`)}* by <@${args.byUserId}>\n<${args.pageUrl}|${esc(args.title)}>`
          : `✅ *Added to ${esc(args.boardLabel)}* by <@${args.byUserId}>\n${esc(args.title)}`,
      },
    },
    { type: "context", elements: [{ type: "mrkdwn", text: meta.join("  ·  ") }] },
  ];
  if (args.notes?.length) blocks.push({ type: "context", elements: [{ type: "mrkdwn", text: args.notes.map(esc).join("  ") }] });
  return blocks;
}

export function discardedBlocks(title: string, byUserId: string): any[] {
  return [{ type: "context", elements: [{ type: "mrkdwn", text: `🗑️ Draft discarded by <@${byUserId}>: ~${esc(title)}~` }] }];
}

/** Modal to fix the title or the context before it goes to Notion. */
export function editModal(d: DraftPayload, privateMetadata: string): any {
  return {
    type: "modal",
    callback_id: A.editSubmit,
    private_metadata: privateMetadata,
    title: { type: "plain_text", text: "Edit" },
    submit: { type: "plain_text", text: "Save" },
    close: { type: "plain_text", text: "Cancel" },
    blocks: [
      {
        type: "input",
        block_id: "p9t_title",
        label: { type: "plain_text", text: "Title" },
        element: { type: "plain_text_input", action_id: "v", initial_value: d.t, max_length: 150 },
      },
      {
        type: "input",
        block_id: "p9t_ctx",
        optional: true,
        label: { type: "plain_text", text: "What it is about" },
        element: { type: "plain_text_input", action_id: "v", multiline: true, initial_value: d.c, max_length: 900 },
      },
    ],
  };
}

export interface FieldState {
  owner?: string;
  deadline?: string | null;
  project?: string | null;
  responsible?: string | null;
}

/** Current picker values in a block_actions payload. A key is absent when that picker isn't in the state. */
export function readFieldState(stateValues: any): FieldState {
  const out: FieldState = {};
  for (const block of Object.values(stateValues || {}) as any[]) {
    for (const [actionId, el] of Object.entries(block || {}) as [string, any][]) {
      if (actionId === A.owner && el?.selected_option?.value) out.owner = el.selected_option.value;
      if (actionId === A.deadline && "selected_date" in (el || {})) out.deadline = isIsoDate(el.selected_date) ? el.selected_date : null;
      if (actionId === A.project && el?.selected_option?.value) {
        out.project = el.selected_option.value === NONE ? null : el.selected_option.value;
      }
      if (actionId === A.responsible && el?.selected_option?.value) {
        out.responsible = el.selected_option.value === NONE ? null : el.selected_option.value;
      }
    }
  }
  return out;
}

/** Merge the pickers into the draft. */
export function applyFieldState(d: DraftPayload, f: FieldState): DraftPayload {
  const next: DraftPayload = { ...d, u: [...d.u] };
  if (f.owner !== undefined) next.a = f.owner;
  if (f.deadline !== undefined && f.deadline !== d.d) {
    next.d = f.deadline;
    next.dq = null; // picked by hand now
  }
  if (f.project !== undefined) next.p = f.project;
  if (f.responsible !== undefined) next.r = f.responsible;
  return next;
}

// ── Notion ──────────────────────────────────────────────────────────────────

function rt(content: string, link?: string): any {
  return { type: "text", text: { content: content.slice(0, 2000), ...(link ? { link: { url: link } } : {}) } };
}

/** The properties object for a new row (Notion API 2022-06-28). Columns the board doesn't have are skipped. */
export function notionProperties(
  board: TaskBoard,
  f: {
    title: string;
    context: string;
    deadline: string | null;
    endDate?: string | null;
    project: string | null;
    urls: string[];
    source: string | null;
    requesterNotionId: string | null;
    assigneeNotionId: string | null;
  }
): any {
  const p = board.fields;
  const props: any = { [p.title]: { title: [rt(f.title)] } };
  if (p.status) props[p.status.prop] = p.status.type === "status" ? { status: { name: p.status.value } } : { select: { name: p.status.value } };
  if (p.text && f.context) props[p.text] = { rich_text: [rt(f.context)] };
  if (p.resources) {
    const res: any[] = [];
    f.urls.forEach((u, i) => {
      if (i > 0) res.push(rt("\n"));
      res.push(rt(u, u));
    });
    if (f.source) {
      if (res.length) res.push(rt("\n"));
      res.push(rt(isNotionUrl(f.source) ? "Recording" : "Slack thread", f.source));
    }
    if (res.length) props[p.resources] = { rich_text: res };
  }
  if (p.deadline && f.deadline) props[p.deadline] = { date: { start: f.deadline } };
  if (p.endDate && f.deadline && f.endDate && f.endDate >= f.deadline) props[p.endDate] = { date: { start: f.endDate } };
  if (p.url && f.urls[0]) props[p.url] = { url: f.urls[0] };
  if (p.project && f.project) props[p.project] = p.projectType === "multi_select" ? { multi_select: [{ name: f.project }] } : { select: { name: f.project } };
  if (p.tag) props[p.tag.prop] = { multi_select: [{ name: p.tag.value }] };
  if (p.requester && f.requesterNotionId) props[p.requester] = { people: [{ id: f.requesterNotionId }] };
  if (p.assignee && f.assigneeNotionId) props[p.assignee] = { people: [{ id: f.assigneeNotionId }] };
  return props;
}

/** A source link that points to Notion (a meeting recording) rather than Slack. */
export function isNotionUrl(url: string): boolean {
  return /^https?:\/\/([a-z0-9-]+\.)?notion\.(so|com|site)\//i.test(String(url || ""));
}

/**
 * Body of the new page: the context and links when the board has no column for them,
 * and always where it came from, so the person can go back to the source.
 */
export function notionChildren(
  board: TaskBoard,
  f: { context: string; urls: string[]; requesterName: string; today: string; source: string | null; deadlineQuote: string | null }
): any[] {
  const blocks: any[] = [];
  if (!board.fields.text && f.context) blocks.push({ object: "block", type: "paragraph", paragraph: { rich_text: [rt(f.context)] } });
  if (!board.fields.resources) {
    for (const u of f.urls) blocks.push({ object: "block", type: "bulleted_list_item", bulleted_list_item: { rich_text: [rt(u, u)] } });
  }
  const fromNotion = !!f.source && isNotionUrl(f.source);
  const line: any[] = [rt(`Captured from ${fromNotion ? "a meeting recording" : "Slack"} by Pidgi on ${prettyDate(f.today)}, asked by ${f.requesterName}.`)];
  if (f.source) line.push(rt(" "), rt(fromNotion ? "Open the recording" : "Open the Slack thread", f.source));
  blocks.push({ object: "block", type: "paragraph", paragraph: { rich_text: line } });
  if (f.deadlineQuote) {
    blocks.push({ object: "block", type: "paragraph", paragraph: { rich_text: [rt(`Deadline as said in ${fromNotion ? "the meeting" : "Slack"}: “${f.deadlineQuote}”`)] } });
  }
  return blocks;
}
