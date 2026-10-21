/**
 * Task capture for Pidgi: configuration and pure helpers.
 *
 * Nothing in this file talks to Slack, Notion or Anthropic, so it can be unit-tested
 * without booting the bot. The network side lives in tasks.ts.
 *
 * The flow: someone tags Pidgi with "turn this into a task for Laura (by Friday)".
 * Pidgi reads the thread (or the messages above), distils one or more concrete tasks,
 * and posts each as a draft card with an owner picker, a deadline picker and a project
 * picker. Only when someone clicks "Add to board" is the row written to that person's
 * Notion board.
 */

// ── Boards ──────────────────────────────────────────────────────────────────

export interface BoardProps {
  title: string;
  owner: string;
  deadline: string;
  status: string;
  project: string;
  text: string;
  resources: string;
}

export interface TaskBoard {
  /** Stable key used in Slack payloads, e.g. "laura". */
  key: string;
  /** Display name, e.g. "Laura". */
  name: string;
  /** Names the requester may use for this person (lowercase). */
  aliases: string[];
  /** The board person's email (used when ownerMeans is "assignee"). */
  email: string;
  /** Notion DATABASE id (not the data source id). The Pidgi integration must be connected to it. */
  databaseId: string;
  /** Link to the board page, shown in Slack. */
  boardUrl: string;
  /** Property names on that database. */
  props: BoardProps;
  /** Status given to a new row. */
  newStatus: string;
  /**
   * What the "Owner" column means on this board. On Laura's board the one filled-in Owner is
   * Niels (the person who asked for the work), so the default is "requester": Owner = whoever
   * tagged Pidgi. Switch to "assignee" to put the board person in Owner instead.
   */
  ownerMeans: "requester" | "assignee";
}

export const DEFAULT_PROPS: BoardProps = {
  title: "Title",
  owner: "Owner",
  deadline: "Deadline",
  status: "Status",
  project: "Project",
  text: "Text",
  resources: "Resources",
};

export const DEFAULT_BOARDS: TaskBoard[] = [
  {
    key: "laura",
    name: "Laura",
    aliases: ["laura", "laura lang"],
    email: "laura@peaknine.studio",
    // 🐝 Laura's Magic Work 🪄 → Backlog
    databaseId: "c4f4ed2a82bf467eb290fa670606a2e7",
    boardUrl: "https://www.notion.so/3f8c675ff95881048402cd087d98edda",
    props: DEFAULT_PROPS,
    newStatus: "To Start",
    ownerMeans: "requester",
  },
  {
    key: "sankhya",
    name: "Sankhya",
    aliases: ["sankhya", "sankhya gembali"],
    email: "sankhya@peaknine.studio",
    // 🧭 Sankhya's Work Board → Backlog (same columns as Laura's)
    databaseId: "8b8f90869c124b19a093f4f7aa9c53e5",
    boardUrl: "https://www.notion.so/400c675ff95881d7ad53c0d485818fa3",
    props: DEFAULT_PROPS,
    newStatus: "To Start",
    ownerMeans: "requester",
  },
];

/** Peak Nine email → Notion user id, for the Owner column. Override with TASK_NOTION_PEOPLE (JSON). */
export const DEFAULT_NOTION_PEOPLE: Record<string, string> = {
  "niels@peaknine.studio": "2d1d872b-594c-8145-ac7e-00025e996fbe",
  "jonas@peaknine.studio": "274d872b-594c-81ae-9cba-0002e52cea03",
  "laura@peaknine.studio": "380d872b-594c-81ad-9c03-000226cbb638",
  "sankhya@peaknine.studio": "380d872b-594c-8109-a350-000220c26f19",
  "bertille@peaknine.studio": "277d872b-594c-8168-9159-00022f49c82c",
  "diego@peaknine.studio": "3d3d872b-594c-81a9-8a00-00028b39f9e9",
};

/**
 * Boards from TASK_BOARDS (a JSON array) when set, else the defaults. Each entry needs at
 * least key, name and databaseId; everything else falls back to the defaults, so adding a
 * third person is one line of JSON in Render.
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
      out.push({
        key,
        name: String(b.name || key),
        aliases: Array.isArray(b.aliases) ? b.aliases.map((a: any) => String(a).toLowerCase()) : [key],
        email: String(b.email || ""),
        databaseId: normId(String(b.databaseId)),
        boardUrl: String(b.boardUrl || `https://www.notion.so/${normId(String(b.databaseId))}`),
        props: { ...DEFAULT_PROPS, ...(b.props || {}) },
        newStatus: String(b.newStatus || "To Start"),
        ownerMeans: b.ownerMeans === "assignee" ? "assignee" : "requester",
      });
    }
    return out.length ? out : DEFAULT_BOARDS;
  } catch {
    return DEFAULT_BOARDS;
  }
}

export function loadNotionPeople(env: Record<string, string | undefined> = process.env): Record<string, string> {
  const out: Record<string, string> = { ...DEFAULT_NOTION_PEOPLE };
  if (env.TASK_NOTION_PEOPLE) {
    try {
      const extra = JSON.parse(env.TASK_NOTION_PEOPLE);
      for (const [k, v] of Object.entries(extra || {})) out[String(k).toLowerCase()] = String(v);
    } catch {
      /* keep defaults */
    }
  }
  return out;
}

/** Notion ids with or without dashes compare equal. */
export function normId(id: string): string {
  return String(id || "").replace(/-/g, "").toLowerCase().trim();
}

/** True when a Notion database id is one of the task boards (used to keep the main loop off them). */
export function isTaskBoardDatabase(id: string, boards: TaskBoard[] = loadBoards()): boolean {
  const n = normId(id);
  return !!n && boards.some((b) => normId(b.databaseId) === n);
}

// ── Trigger ─────────────────────────────────────────────────────────────────

/**
 * Cheap pre-filter: does the message talk about tasks at all? A hit is NOT a decision;
 * the distil step decides whether this is a request to create a task or a question
 * about tasks (which goes to Pidgi's normal planning brain).
 */
export function looksLikeTaskRequest(text: string): boolean {
  return /(^|[^a-z])(tasks?|to-?dos?|todo's|taak|taken|action items?|actiepunt(en)?|backlog)([^a-z]|$)/i.test(String(text || ""));
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
  assignee: string;
  title: string;
  context: string;
  deadline: string | null;
  deadlineQuote: string | null;
  project: string | null;
  urls: string[];
}

export interface Distilled {
  isTaskRequest: boolean;
  tasks: DraftTask[];
  problem: string | null;
  /** Things the code changed or dropped, shown to the person on the card. */
  notes: string[][];
  /** Names the requester used that have no board. */
  unknownAssignee: boolean;
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
 * a link must really appear in the conversation, a project must be an existing option.
 */
export function validateDistilled(
  raw: any,
  opts: { boards: TaskBoard[]; projectOptions: string[]; sourceText: string; today: string }
): Distilled {
  const source = squash(opts.sourceText);
  const sourceUrls = new Set(extractUrls(opts.sourceText));
  const keys = new Set(opts.boards.map((b) => b.key));
  const out: Distilled = {
    isTaskRequest: !!raw?.is_task_request,
    tasks: [],
    problem: raw?.problem ? houseStyle(String(raw.problem)).slice(0, 500) || null : null,
    notes: [],
    unknownAssignee: false,
  };
  const list = Array.isArray(raw?.tasks) ? raw.tasks.slice(0, 5) : [];
  for (const t of list) {
    const notes: string[] = [];
    const assignee = String(t?.assignee || "").toLowerCase();
    if (!keys.has(assignee)) {
      out.unknownAssignee = true;
      continue;
    }
    const title = houseStyle(String(t?.title || "")).slice(0, 150);
    if (!title) continue;
    const context = houseStyle(String(t?.context || "")).slice(0, 900);

    let deadline: string | null = isIsoDate(t?.deadline) ? t.deadline : null;
    let deadlineQuote: string | null = t?.deadline_quote ? String(t.deadline_quote).trim().slice(0, 80) : null;
    if (deadline && (!deadlineQuote || !source.includes(squash(deadlineQuote)))) {
      notes.push("I left the deadline empty because I couldn't point to where it was said.");
      deadline = null;
      deadlineQuote = null;
    }
    if (!deadline) deadlineQuote = null;
    if (deadline && deadline < opts.today) notes.push(`The deadline I found (${prettyDate(deadline)}) is already in the past.`);

    let project: string | null = t?.project ? String(t.project) : null;
    if (project && !opts.projectOptions.includes(project)) project = null;

    const urls = (Array.isArray(t?.urls) ? t.urls : [])
      .map((u: any) => String(u).replace(/[.,;:!?]+$/, ""))
      .filter((u: string) => sourceUrls.has(u))
      .slice(0, 4);

    out.tasks.push({ assignee, title, context, deadline, deadlineQuote, project, urls });
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
  /** assignee board key */
  a: string;
  /** deadline YYYY-MM-DD */
  d: string | null;
  /** words the deadline came from */
  dq: string | null;
  /** project option */
  p: string | null;
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
  create: "p9task_create",
  edit: "p9task_edit",
  discard: "p9task_discard",
  editSubmit: "p9task_edit_submit",
} as const;

const NO_PROJECT = "__none__";

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

/** The draft card: what Pidgi understood, three pickers, and the buttons. */
export function draftBlocks(
  d: DraftPayload,
  opts: { boards: TaskBoard[]; projectOptions: string[]; notes?: string[] }
): any[] {
  const board = boardOf(opts.boards, d.a);
  const who = board?.name || d.a;
  const value = encodeDraft(d);
  const blocks: any[] = [
    {
      type: "section",
      text: { type: "mrkdwn", text: `📝 *Draft task for ${esc(who)}*  ·  _not on the board yet_` },
    },
    {
      type: "section",
      text: { type: "mrkdwn", text: `*${esc(d.t)}*${d.c ? `\n${esc(d.c)}` : ""}`.slice(0, 2990) },
    },
  ];
  const links = [...d.u.map((u) => `<${u}|${esc(linkLabel(u))}>`), ...(d.s ? [`<${d.s}|Slack thread>`] : [])];
  if (links.length) {
    blocks.push({ type: "context", elements: [{ type: "mrkdwn", text: `🔗 ${links.join("  ·  ")}`.slice(0, 2990) }] });
  }

  const fields: any[] = [
    {
      type: "static_select",
      action_id: A.owner,
      placeholder: { type: "plain_text", text: "Whose board?" },
      options: opts.boards.map((b) => opt(`${b.name}'s board`, b.key)),
      ...(board ? { initial_option: opt(`${board.name}'s board`, board.key) } : {}),
    },
    {
      type: "datepicker",
      action_id: A.deadline,
      placeholder: { type: "plain_text", text: "Deadline" },
      ...(d.d ? { initial_date: d.d } : {}),
    },
  ];
  if (opts.projectOptions.length) {
    const projOpts = [opt("No project", NO_PROJECT), ...opts.projectOptions.slice(0, 99).map((p) => opt(p, p))];
    fields.push({
      type: "static_select",
      action_id: A.project,
      placeholder: { type: "plain_text", text: "Project" },
      options: projOpts,
      ...(d.p && opts.projectOptions.includes(d.p) ? { initial_option: opt(d.p, d.p) } : {}),
    });
  }
  blocks.push({ type: "actions", block_id: "p9task_fields", elements: fields });

  const hints: string[] = [];
  if (d.d && d.dq) hints.push(`Deadline taken from “${esc(d.dq)}”.`);
  else if (d.d) hints.push(`Deadline set to ${prettyDate(d.d)}.`);
  else hints.push("⚠️ No deadline in the conversation. Pick one above, or leave it empty.");
  for (const n of opts.notes || []) hints.push(esc(n));
  blocks.push({ type: "context", elements: [{ type: "mrkdwn", text: hints.join("  ").slice(0, 2990) }] });

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
  return `Draft task for ${boardOf(boards, d.a)?.name || d.a}: ${d.t}`;
}

/** Card after the row was written. */
export function doneBlocks(args: {
  boardName: string;
  boardUrl: string;
  title: string;
  pageUrl: string;
  byUserId: string;
  deadline: string | null;
  project: string | null;
  owner: string | null;
  notes?: string[];
}): any[] {
  const meta = [
    args.deadline ? `📅 ${prettyDate(args.deadline)}` : "📅 no deadline",
    args.project ? `🗂️ ${esc(args.project)}` : null,
    args.owner ? `👤 Owner: ${esc(args.owner)}` : null,
  ].filter(Boolean);
  const blocks: any[] = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `✅ *Added to <${args.boardUrl}|${esc(args.boardName)}'s board>* by <@${args.byUserId}>\n<${args.pageUrl}|${esc(args.title)}>`,
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
    title: { type: "plain_text", text: "Edit task" },
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

/** Current picker values in a block_actions payload. A key is absent when that picker isn't in the state. */
export function readFieldState(stateValues: any): { owner?: string; deadline?: string | null; project?: string | null } {
  const out: { owner?: string; deadline?: string | null; project?: string | null } = {};
  for (const block of Object.values(stateValues || {}) as any[]) {
    for (const [actionId, el] of Object.entries(block || {}) as [string, any][]) {
      if (actionId === A.owner && el?.selected_option?.value) out.owner = el.selected_option.value;
      if (actionId === A.deadline && "selected_date" in (el || {})) out.deadline = isIsoDate(el.selected_date) ? el.selected_date : null;
      if (actionId === A.project && el?.selected_option?.value) {
        out.project = el.selected_option.value === NO_PROJECT ? null : el.selected_option.value;
      }
    }
  }
  return out;
}

/** Merge the pickers into the draft. */
export function applyFieldState(d: DraftPayload, f: ReturnType<typeof readFieldState>): DraftPayload {
  const next: DraftPayload = { ...d, u: [...d.u] };
  if (f.owner !== undefined) next.a = f.owner;
  if (f.deadline !== undefined && f.deadline !== d.d) {
    next.d = f.deadline;
    next.dq = null; // picked by hand now
  }
  if (f.project !== undefined) next.p = f.project;
  return next;
}

// ── Notion ──────────────────────────────────────────────────────────────────

function rt(content: string, link?: string): any {
  return { type: "text", text: { content: content.slice(0, 2000), ...(link ? { link: { url: link } } : {}) } };
}

/** The properties object for a new row (Notion API 2022-06-28). */
export function notionProperties(
  board: TaskBoard,
  f: { title: string; context: string; deadline: string | null; project: string | null; urls: string[]; source: string | null; ownerNotionId: string | null }
): any {
  const p = board.props;
  const props: any = {
    [p.title]: { title: [rt(f.title)] },
    [p.status]: { select: { name: board.newStatus } },
  };
  if (f.context) props[p.text] = { rich_text: [rt(f.context)] };
  const res: any[] = [];
  f.urls.forEach((u, i) => {
    if (i > 0) res.push(rt("\n"));
    res.push(rt(u, u));
  });
  if (f.source) {
    if (res.length) res.push(rt("\n"));
    res.push(rt("Slack thread", f.source));
  }
  if (res.length) props[p.resources] = { rich_text: res };
  if (f.deadline) props[p.deadline] = { date: { start: f.deadline } };
  if (f.project) props[p.project] = { select: { name: f.project } };
  if (f.ownerNotionId) props[p.owner] = { people: [{ id: f.ownerNotionId }] };
  return props;
}

/** Body of the new page: where it came from, so the person can always go back to the source. */
export function notionChildren(f: { requesterName: string; today: string; source: string | null; deadlineQuote: string | null }): any[] {
  const line: any[] = [rt(`Captured from Slack by Pidgi on ${prettyDate(f.today)}, asked by ${f.requesterName}.`)];
  if (f.source) line.push(rt(" "), rt("Open the Slack thread", f.source));
  const blocks: any[] = [{ object: "block", type: "paragraph", paragraph: { rich_text: line } }];
  if (f.deadlineQuote) {
    blocks.push({ object: "block", type: "paragraph", paragraph: { rich_text: [rt(`Deadline as said in Slack: “${f.deadlineQuote}”`)] } });
  }
  return blocks;
}
