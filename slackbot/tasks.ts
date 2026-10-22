/**
 * Task capture for Pidgi: the Slack, Notion and Anthropic side.
 *
 * Tag Pidgi with something like "turn this into a task for Laura by Friday" or
 * "put this on the Touchdown agenda":
 *   1. Pidgi reads the thread it was tagged in. Tagged at the top level of a channel or a DM,
 *      it reads the messages just above (and opens the threads under the most recent ones).
 *      A pasted Slack message link is read instead, wherever it lives.
 *   2. One Claude call distils the items (title, context, board, deadline, project, links,
 *      who picks it up). The code then checks every claim against the conversation.
 *   3. Each item is posted as a draft card with pickers.
 *   4. "✅ Add to board" writes the row to the Notion board. Nothing is written before that.
 *
 * Boards can be restricted to a few people (the Touchdown agenda is Niels and Jonas only):
 * for anyone else such a board is not offered to the model, not shown in the picker, and
 * refused on "Add to board".
 *
 * If the message only talks ABOUT tasks ("what tasks does Laura have this week?"), the
 * distil step says so and the message goes to Pidgi's normal planning brain instead.
 */
import Anthropic from "@anthropic-ai/sdk";
import { notionClient, notionDataSourceClient } from "./notion.js";
import { recordUsage } from "./usage.js";
import {
  A,
  DraftPayload,
  TaskBoard,
  TeamMember,
  TranscriptLine,
  applyFieldState,
  boardOf,
  boardRef,
  boardsFor,
  calendarLines,
  canUseBoard,
  decodeDraft,
  discardedBlocks,
  doneBlocks,
  draftBlocks,
  draftFallbackText,
  editModal,
  formatTranscript,
  houseStyle,
  isRestrictedBoard,
  loadBoards,
  loadTeam,
  mentionsHiddenBoard,
  PRIVATE_REPLY,
  scrubPrivate,
  mentionedUserIds,
  notionChildren,
  notionIdFor,
  notionProperties,
  parseSlackPermalinks,
  readFieldState,
  slackToPlain,
  todayBrussels,
  validateDistilled,
} from "./taskboards.js";

export interface TaskDeps {
  anthropic: Anthropic;
  model: string;
  /** May this Slack user confirm or discard a draft that `requesterId` asked for? */
  canConfirm: (userId: string, requesterId: string) => boolean;
  /** Pidgi's own Slack user id, so its own messages are left out of the transcript. */
  botUserId?: string;
}

export interface TaskEvent {
  channel: string;
  ts: string;
  thread_ts?: string;
  user: string;
  text: string;
  channel_type?: string;
}

/** `private`: the turn involved a restricted board, so it must stay out of a channel's shared memory. */
export type CaptureResult =
  | { kind: "handled"; summary: string; private?: boolean }
  | { kind: "not_task"; ack: { channel: string; ts: string } | null };

const BOARDS: TaskBoard[] = loadBoards();
const TEAM: TeamMember[] = loadTeam();

// ── Small caches ────────────────────────────────────────────────────────────

const nameCache = new Map<string, { name: string; email: string }>();
async function person(client: any, userId: string): Promise<{ name: string; email: string }> {
  if (!userId) return { name: "someone", email: "" };
  const hit = nameCache.get(userId);
  if (hit) return hit;
  try {
    const r: any = await client.users.info({ user: userId });
    const p = r?.user?.profile || {};
    const v = {
      name: String(r?.user?.real_name || p.real_name || p.display_name || r?.user?.name || "someone").split(" ")[0] || "someone",
      email: String(p.email || "").toLowerCase(),
    };
    nameCache.set(userId, v);
    if (nameCache.size > 500) nameCache.clear();
    return v;
  } catch {
    return { name: "someone", email: "" };
  }
}

const schemaCache = new Map<string, { at: number; projects: string[] }>();
/** Project options straight from the board's Notion schema (cached 10 minutes). */
async function projectOptions(board: TaskBoard | undefined): Promise<string[]> {
  if (!board?.fields.project) return [];
  const hit = schemaCache.get(board.databaseId);
  if (hit && Date.now() - hit.at < 10 * 60 * 1000) return hit.projects;
  try {
    const db: any = board.dataSourceId
      ? await notionDataSourceClient().request({ path: `data_sources/${board.dataSourceId}`, method: "get" })
      : await notionClient().databases.retrieve({ database_id: board.databaseId });
    const prop = db?.properties?.[board.fields.project];
    const projects: string[] = (prop?.select?.options || prop?.multi_select?.options || []).map((o: any) => String(o.name));
    schemaCache.set(board.databaseId, { at: Date.now(), projects });
    return projects;
  } catch (e: any) {
    console.warn(`[tasks] could not read the schema of ${board.label}: ${e?.message || e}`);
    return hit?.projects || [];
  }
}

async function projectOptionsByBoard(boards: TaskBoard[]): Promise<Record<string, string[]>> {
  const out: Record<string, string[]> = {};
  await Promise.all(boards.map(async (b) => (out[b.key] = await projectOptions(b))));
  return out;
}

/**
 * Boards to show on a card or in a reply. Outside a DM, colleagues can read along, so private
 * boards stay out of pickers and lists unless the card is for that board.
 */
function shownBoards(boards: TaskBoard[], channel: string, currentKey?: string): TaskBoard[] {
  if (/^D/.test(String(channel || ""))) return boards;
  return boards.filter((b) => !isRestrictedBoard(b) || b.key === currentKey);
}

function slackError(e: any): string {
  return String(e?.data?.error || e?.message || e);
}

function listNames(names: string[]): string {
  if (names.length <= 1) return names[0] || "nobody";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

// ── 1. Read the conversation ────────────────────────────────────────────────

interface Gathered {
  transcript: string;
  mode: "thread" | "messages above" | "linked message";
  sourceLink: string | null;
  channelName: string;
  /** The tagging message as plain text, with mentions turned into names. */
  request: string;
  /** Transcript + request, used to check the model's quotes and links. */
  sourceText: string;
}

async function gatherContext(client: any, ev: TaskEvent, botUserId?: string): Promise<Gathered> {
  let msgs: any[] = [];
  let sourceChannel = ev.channel;
  let sourceTs = ev.thread_ts || ev.ts;
  let mode: Gathered["mode"];

  const linked = parseSlackPermalinks(ev.text);
  if (linked.length) {
    const L = linked[0];
    const root = L.threadTs || L.ts;
    const r: any = await client.conversations.replies({ channel: L.channel, ts: root, limit: 200 });
    msgs = r?.messages || [];
    sourceChannel = L.channel;
    sourceTs = L.ts;
    mode = "linked message";
  } else if (ev.thread_ts) {
    const r: any = await client.conversations.replies({ channel: ev.channel, ts: ev.thread_ts, limit: 200 });
    msgs = (r?.messages || []).filter((m: any) => Number(m.ts) < Number(ev.ts));
    sourceTs = ev.thread_ts;
    mode = "thread";
  } else {
    const r: any = await client.conversations.history({ channel: ev.channel, latest: ev.ts, inclusive: false, limit: 15 });
    msgs = (r?.messages || []).slice().reverse();
    // Open the threads under the three most recent messages that have replies.
    const threaded = msgs.filter((m: any) => (m.reply_count || 0) > 0).slice(-3);
    for (const m of threaded) {
      try {
        const rr: any = await client.conversations.replies({ channel: ev.channel, ts: m.ts, limit: 60 });
        m.__replies = (rr?.messages || []).slice(1);
      } catch {
        /* the parent alone is still useful */
      }
    }
    const last = msgs.filter((m: any) => m.user !== botUserId).pop();
    if (last) sourceTs = last.ts;
    mode = "messages above";
  }

  const keep = (m: any) =>
    m && m.ts !== ev.ts && (!botUserId || m.user !== botUserId) && (!m.subtype || m.subtype === "bot_message" || m.subtype === "thread_broadcast" || m.subtype === "file_share");

  // Resolve every author and every @mention to a first name.
  const ids = new Set<string>();
  const visit = (m: any) => {
    if (m.user) ids.add(m.user);
    mentionedUserIds(m.text || "").forEach((id) => ids.add(id));
    (m.__replies || []).forEach(visit);
  };
  msgs.forEach(visit);
  mentionedUserIds(ev.text).forEach((id) => ids.add(id));
  const names: Record<string, string> = {};
  await Promise.all(Array.from(ids).map(async (id) => (names[id] = (await person(client, id)).name)));
  if (botUserId) names[botUserId] = "Pidgi";

  const lines: TranscriptLine[] = [];
  const push = (m: any, depth: number) => {
    if (!keep(m)) return;
    let text = slackToPlain(m.text || "", names);
    for (const f of m.files || []) {
      text += `${text ? " " : ""}[file: ${f.title || f.name || "attachment"}${f.permalink ? ` ${f.permalink}` : ""}]`;
    }
    if (!text.trim()) return;
    const author = m.user ? names[m.user] || "someone" : m.username || m.bot_profile?.name || "a bot";
    lines.push({ ts: m.ts, author, text, depth });
    for (const r of m.__replies || []) push(r, 1);
  };
  for (const m of msgs) push(m, mode === "thread" || mode === "linked message" ? (m.ts === msgs[0]?.ts ? 0 : 1) : 0);

  let sourceLink: string | null = null;
  try {
    const r: any = await client.chat.getPermalink({ channel: sourceChannel, message_ts: sourceTs });
    sourceLink = r?.permalink || null;
  } catch {
    sourceLink = null;
  }

  let channelName = "this conversation";
  if (ev.channel_type === "im") channelName = "a direct message";
  else {
    try {
      const r: any = await client.conversations.info({ channel: ev.channel });
      if (r?.channel?.name) channelName = `#${r.channel.name}`;
    } catch {
      /* name is a nice-to-have */
    }
  }

  const transcript = formatTranscript(lines);
  const request = slackToPlain(ev.text, names);
  return { transcript, mode, sourceLink, channelName, request, sourceText: `${transcript}\n${request}` };
}

// ── 2. Distil ───────────────────────────────────────────────────────────────

const DISTIL_SYSTEM = `You turn Slack conversations at Peak Nine (a small impact innovation studio in Belgium) into items on a Notion board: a task on a team member's own board, or a topic on a meeting agenda.

You receive the request (the message that tagged the bot), who asked, the boards they can use, and the conversation it refers to. Decide first:
- is_task_request = true when the person asks to create, add, log, capture or put something on a board or agenda (in English, Dutch or French): "turn this into a task for Laura", "zet dit op de touchdown", "add to the team meeting".
- is_task_request = false when they ask a QUESTION about tasks, agendas or planning ("what tasks does Laura have?", "what's on the Touchdown agenda?", "is Sankhya free?"). Then return no tasks.

When it is a task request, write items with these rules:
- Only use what is in the request and the conversation. Never invent scope, people, dates, numbers, links or reasons. If something is unclear, leave it out rather than guess.
- board: the key of the board the requester points to. "for Laura" means Laura's board; "touchdown", "our one-on-one" means the Touchdown board; "team meeting", "sync", "talking point" means the team board. "for me"/"voor mij" means the requester's own board if they have one. If the requester names a person or meeting that has no board in the list, use "unknown". Never pick a board that isn't in the list.
- Usually one item. Split into several only when the requester asks for several or the conversation holds clearly separate items. At most 5.
- title: in the language the requester wrote in, at most 80 characters. On a person's board: a short concrete action that starts with a verb. On a meeting board: the topic to discuss, phrased so it is clear in the meeting a week later.
- context: one to four plain sentences. For a task: what to deliver, for whom or why, any constraint or reference mentioned. For a meeting topic: what needs discussing or deciding and why it came up. Same language as the title. Warm and direct, no jargon, no buzzwords, no em dashes, no "it's not X, it's Y" phrasing.
- deadline: only when a date or day is actually said for this item, in the request or the conversation. Resolve relative words ("Friday", "tomorrow", "next week", "vrijdag", "eind deze maand") using the calendar and the date of the message where they were said, not today's date. A period without a day ("next week", "eind deze maand") means the last working day (Mon-Fri) of that period. Return YYYY-MM-DD. deadline_quote = the exact words that state it, copied character for character. If no deadline is said, return empty strings for both. "asap" or "soon" is not a date.
- project: one of that board's project options, only when the channel name or the conversation makes it clear; otherwise empty string.
- responsible: only for meeting boards, the first name of the team member the conversation names as picking this up; otherwise empty string.
- urls: links that literally appear in the conversation and that matter for this item. Copy them exactly. Otherwise an empty list.
- problem: empty string, unless it is a task request you cannot turn into an item (for example nothing concrete to put on a board). Then one short plain sentence saying what is missing.`;

function distilTool(boards: TaskBoard[], projects: Record<string, string[]>): any {
  const allProjects = Array.from(new Set(Object.values(projects).flat()));
  return {
    name: "submit_tasks",
    description: "Return the items distilled from the conversation.",
    input_schema: {
      type: "object",
      properties: {
        is_task_request: { type: "boolean" },
        problem: { type: "string" },
        tasks: {
          type: "array",
          maxItems: 5,
          items: {
            type: "object",
            properties: {
              board: { type: "string", enum: [...boards.map((b) => b.key), "unknown"] },
              title: { type: "string" },
              context: { type: "string" },
              deadline: { type: "string", description: "YYYY-MM-DD, or empty" },
              deadline_quote: { type: "string", description: "Exact words that state the deadline, or empty" },
              project: allProjects.length ? { type: "string", enum: [...allProjects, ""] } : { type: "string" },
              responsible: { type: "string", enum: [...TEAM.map((m) => m.name), ""] },
              urls: { type: "array", items: { type: "string" } },
            },
            required: ["board", "title", "context", "deadline", "deadline_quote", "project", "responsible", "urls"],
          },
        },
      },
      required: ["is_task_request", "problem", "tasks"],
    },
  };
}

async function distil(
  deps: TaskDeps,
  args: { g: Gathered; requesterName: string; today: string; boards: TaskBoard[]; projects: Record<string, string[]> }
): Promise<any> {
  const boardsList = args.boards
    .map((b) => {
      const extra = [
        b.aliases.length ? `also called: ${b.aliases.join(", ")}` : "",
        b.fields.project ? `projects: ${(args.projects[b.key] || []).join(" | ") || "(none)"}` : "no project column",
        b.fields.deadline ? "" : "no deadline column",
      ].filter(Boolean);
      return `- ${b.key}: ${b.label}. ${b.description} (${extra.join("; ")})`;
    })
    .join("\n");
  const user = [
    `Requested by: ${args.requesterName}, in ${args.g.channelName}, today ${args.today} (Europe/Brussels).`,
    `Request: "${args.g.request}"`,
    "",
    "Boards this person can use (board keys):",
    boardsList,
    "",
    `Team (for "responsible"): ${TEAM.map((m) => m.name).join(", ")}`,
    "",
    "Calendar (Europe/Brussels, ISO weeks):",
    calendarLines(args.today),
    "",
    `Conversation (${args.g.mode}; message times are Brussels time):`,
    args.g.transcript || "(no earlier messages; the request itself is all there is)",
  ].join("\n");

  const resp = await deps.anthropic.messages.create(
    {
      model: deps.model,
      max_tokens: 2500,
      system: DISTIL_SYSTEM,
      tools: [distilTool(args.boards, args.projects)],
      tool_choice: { type: "tool", name: "submit_tasks" },
      messages: [{ role: "user", content: user }],
    } as any,
    { timeout: 90000 }
  );
  try {
    recordUsage(deps.model, resp.usage);
  } catch {
    /* usage logging is best-effort */
  }
  const tu: any = (resp.content || []).find((b: any) => b.type === "tool_use");
  return tu?.input || null;
}

// ── 3. Post the drafts ──────────────────────────────────────────────────────

export function taskCaptureEnabled(): boolean {
  return !!process.env.NOTION_TOKEN && BOARDS.length > 0;
}

/**
 * Run task capture for one Slack message. Returns "not_task" (with the placeholder message,
 * so the normal flow can reuse it) when the message is a question about tasks instead.
 */
export async function runTaskCapture(client: any, deps: TaskDeps, ev: TaskEvent, replyThreadTs?: string): Promise<CaptureResult> {
  const requester = await person(client, ev.user);
  // Naming a private board you're not part of gets the same neutral line, before anything else runs.
  if (mentionsHiddenBoard(ev.text, requester.email, BOARDS)) {
    await client.chat.postMessage({ channel: ev.channel, thread_ts: replyThreadTs, text: PRIVATE_REPLY });
    return { kind: "handled", summary: PRIVATE_REPLY, private: true };
  }
  let ack: { channel: string; ts: string } | null = null;
  try {
    const r: any = await client.chat.postMessage({ channel: ev.channel, thread_ts: replyThreadTs, text: "📝 Reading the conversation…" });
    if (r?.ts) ack = { channel: r.channel || ev.channel, ts: r.ts };
  } catch {
    /* carry on without a placeholder */
  }
  const say = async (raw: string, blocks?: any[]) => {
    const text = scrubPrivate(raw, requester.email, BOARDS);
    if (text !== raw) blocks = undefined;
    if (ack) {
      try {
        await client.chat.update({ channel: ack.channel, ts: ack.ts, text, ...(blocks ? { blocks } : {}) });
        const first = ack;
        ack = null; // the next message is a new one
        return first;
      } catch {
        /* fall through to a new message */
      }
    }
    const r: any = await client.chat.postMessage({ channel: ev.channel, thread_ts: replyThreadTs, text, ...(blocks ? { blocks } : {}) });
    return { channel: r?.channel || ev.channel, ts: r?.ts };
  };

  let g: Gathered;
  try {
    g = await gatherContext(client, ev, deps.botUserId);
  } catch (e: any) {
    const err = slackError(e);
    let msg = `I couldn't read the conversation (${err}).`;
    if (/not_in_channel|channel_not_found/.test(err)) msg = "I can't read that channel yet. Invite me with `/invite @Pidgi` and tag me again.";
    if (/missing_scope/.test(err)) {
      msg = `I'm not allowed to read messages here yet (Slack scope \`${e?.data?.needed || "channels:history"}\` is missing). Niels can add it in the Slack app settings and reinstall the app.`;
    }
    await say(msg);
    return { kind: "handled", summary: msg };
  }

  const today = todayBrussels();
  const boards = boardsFor(requester.email, BOARDS);
  const projects = await projectOptionsByBoard(boards);

  let raw: any;
  try {
    raw = await distil(deps, { g, requesterName: requester.name, today, boards, projects });
  } catch (e: any) {
    const msg = `I couldn't distil this just now (${e?.message || e}). Try again in a minute.`;
    await say(msg);
    return { kind: "handled", summary: msg };
  }
  if (!raw) {
    await say("I couldn't distil anything from this. Try again with a little more detail.");
    return { kind: "handled", summary: "Nothing distilled." };
  }

  const result = validateDistilled(raw, { boards, projectOptions: projects, team: TEAM, sourceText: g.sourceText, today });
  if (!result.isTaskRequest) {
    // A question about tasks: hand the placeholder back to Pidgi's normal brain.
    return { kind: "not_task", ack };
  }

  const available = listNames(shownBoards(boards, ev.channel).map(boardRef));
  if (!result.tasks.length) {
    const msg = result.unknownBoard
      ? `I can add things to ${available} so far. Which one should this go to?`
      : result.problem || "I couldn't find a concrete item in this conversation. Tell me what needs doing or discussing, and where it should go.";
    await say(msg);
    return { kind: "handled", summary: msg };
  }

  const titles: string[] = [];
  const touchedPrivate = result.tasks.some((t) => isRestrictedBoard(boardOf(boards, t.board)));
  for (let i = 0; i < result.tasks.length; i++) {
    const t = result.tasks[i];
    const d: DraftPayload = {
      v: 1,
      t: t.title,
      c: t.context,
      u: t.urls,
      s: g.sourceLink,
      q: ev.user,
      a: t.board,
      d: t.deadline,
      dq: t.deadlineQuote,
      p: t.project,
      r: t.responsible,
    };
    const notes = [...(result.notes[i] || [])];
    if (i === result.tasks.length - 1 && result.unknownBoard) notes.push(`I skipped an item for a board I don't have (I can use ${available}).`);
    const blocks = draftBlocks(d, { boards: shownBoards(boards, ev.channel, d.a), projectOptions: projects[d.a] || [], team: TEAM, notes });
    await say(draftFallbackText(d, boards), blocks);
    const b = boardOf(boards, t.board);
    titles.push(`"${t.title}" for ${b ? boardRef(b) : t.board}`);
  }
  return {
    kind: "handled",
    summary: `I drafted ${titles.length === 1 ? "one item" : `${titles.length} items`}: ${titles.join("; ")}. Nothing is on a board until someone clicks ✅ Add to board.`,
    private: touchedPrivate,
  };
}

// ── 4. Buttons, pickers and the edit modal ──────────────────────────────────

const inFlight = new Set<string>();

async function ephemeral(client: any, body: any, text: string) {
  try {
    await client.chat.postEphemeral({
      channel: body?.channel?.id || body?.container?.channel_id,
      user: body?.user?.id,
      thread_ts: body?.message?.thread_ts,
      text,
    });
  } catch {
    /* nothing else to do */
  }
}

function where(body: any): { channel: string; ts: string } {
  return {
    channel: body?.channel?.id || body?.container?.channel_id,
    ts: body?.message?.ts || body?.container?.message_ts,
  };
}

/** Redraw a card for a draft, with the boards its requester may use. */
async function redraw(client: any, at: { channel: string; ts: string }, d: DraftPayload): Promise<void> {
  const requester = await person(client, d.q);
  const boards = boardsFor(requester.email, BOARDS);
  if (!boardOf(boards, d.a) && boards.length) d.a = boards[0].key;
  const board = boardOf(boards, d.a);
  const options = await projectOptions(board);
  if (d.p && !options.includes(d.p)) d.p = null;
  if (board?.kind !== "meeting") d.r = null;
  await client.chat.update({
    channel: at.channel,
    ts: at.ts,
    text: draftFallbackText(d, boards),
    blocks: draftBlocks(d, { boards: shownBoards(boards, at.channel, d.a), projectOptions: options, team: TEAM }),
  });
}

export function registerTaskActions(app: any, deps: TaskDeps): void {
  // A picker changed: fold the new value into the draft that travels in the buttons and
  // redraw the card (the header, the project list and the person picker follow the board).
  // This way "Add to board" never depends on Slack sending the picker state along.
  app.action(new RegExp(`^(${A.owner}|${A.deadline}|${A.project}|${A.responsible})$`), async ({ ack, body, action, client }: any) => {
    await ack();
    try {
      const buttons = (body?.message?.blocks || []).find((b: any) => b.block_id === "p9task_buttons");
      const draft = decodeDraft(buttons?.elements?.find((e: any) => e.action_id === A.create)?.value);
      if (!draft) return;
      const picked: Record<string, any> = {
        [action.action_id]: action.type === "datepicker" ? { selected_date: action.selected_date } : { selected_option: action.selected_option },
      };
      const d = applyFieldState(draft, { ...readFieldState(body?.state?.values), ...readFieldState({ picked }) });
      await redraw(client, where(body), d);
    } catch (e: any) {
      console.warn("[tasks] could not redraw the card after a picker change:", slackError(e));
    }
  });

  app.action(A.create, async ({ ack, body, action, client }: any) => {
    await ack();
    const { channel, ts } = where(body);
    const userId = body?.user?.id;
    const draft = decodeDraft(action?.value);
    if (!draft) return ephemeral(client, body, "This draft is damaged. Tag me again to make a new one.");
    if (!deps.canConfirm(userId, draft.q)) {
      return ephemeral(client, body, `Only <@${draft.q}>, who asked for this, can add it (or someone on Pidgi's write list).`);
    }
    const key = `${channel}:${ts}`;
    if (inFlight.has(key)) return;
    inFlight.add(key);
    try {
      const d = applyFieldState(draft, readFieldState(body?.state?.values));
      const board = boardOf(BOARDS, d.a);
      if (!board) return ephemeral(client, body, "Pick which board this goes to first.");
      const clicker = await person(client, userId);
      if (!canUseBoard(board, clicker.email)) return ephemeral(client, body, PRIVATE_REPLY);

      const notes: string[] = [];
      let project = board.fields.project ? d.p : null;
      if (project) {
        const options = await projectOptions(board);
        if (options.length && !options.includes(project)) {
          notes.push(`“${project}” isn't a project on ${boardRef(board)}, so I left Project empty.`);
          project = null;
        }
      }

      const requester = await person(client, d.q);
      const people: string[] = [];
      let requesterNotionId: string | null = null;
      if (board.fields.requester) {
        requesterNotionId = notionIdFor(TEAM, requester.email);
        if (requesterNotionId) people.push(`${board.fields.requester}: ${requester.name}`);
        else notes.push(`I couldn't match ${requester.name} to a Notion user, so ${board.fields.requester} is empty.`);
      }
      let assigneeNotionId: string | null = null;
      if (board.fields.assignee) {
        const email = board.kind === "person" ? board.email || null : d.r || null;
        assigneeNotionId = notionIdFor(TEAM, email);
        const who = TEAM.find((m) => m.email === email);
        if (assigneeNotionId && who) people.push(`${board.fields.assignee}: ${who.name}`);
      }

      // A board with several data sources (Mothership) is written through its data source.
      const page: any = await (board.dataSourceId ? notionDataSourceClient() : notionClient()).pages.create({
        parent: board.dataSourceId ? { type: "data_source_id", data_source_id: board.dataSourceId } : { database_id: board.databaseId },
        properties: notionProperties(board, {
          title: d.t,
          context: d.c,
          deadline: board.fields.deadline ? d.d : null,
          project,
          urls: d.u,
          source: d.s,
          requesterNotionId,
          assigneeNotionId,
        }),
        children: notionChildren(board, { context: d.c, urls: d.u, requesterName: requester.name, today: todayBrussels(), source: d.s, deadlineQuote: d.dq }),
      } as any);

      await client.chat.update({
        channel,
        ts,
        text: `Added to ${boardRef(board)}: ${d.t}`,
        blocks: doneBlocks({
          boardLabel: boardRef(board),
          boardUrl: board.boardUrl,
          title: d.t,
          pageUrl: page?.url || board.boardUrl,
          byUserId: userId,
          deadline: board.fields.deadline ? d.d : null,
          project,
          people,
          notes,
        }),
      });
    } catch (e: any) {
      const err = e?.body ? `${e.code || ""} ${e.message || ""}`.trim() : slackError(e);
      const hint = /object_not_found|Could not find database|restricted_resource/i.test(err)
        ? " Pidgi's Notion connection probably doesn't have access to that board yet: open the board in Notion, ••• → Connections → add Pidgi."
        : "";
      console.error("[tasks] add to board failed:", err);
      await ephemeral(client, body, `I couldn't add it to the board: ${err}.${hint} The draft is still here, so you can try again.`);
    } finally {
      inFlight.delete(key);
    }
  });

  app.action(A.edit, async ({ ack, body, action, client }: any) => {
    await ack();
    const draft = decodeDraft(action?.value);
    if (!draft) return ephemeral(client, body, "This draft is damaged. Tag me again to make a new one.");
    if (!deps.canConfirm(body?.user?.id, draft.q)) {
      return ephemeral(client, body, `Only <@${draft.q}>, who asked for this, can edit it (or someone on Pidgi's write list).`);
    }
    // Keep whatever was picked so far, so saving the text doesn't reset the pickers.
    const d = applyFieldState(draft, readFieldState(body?.state?.values));
    const meta = JSON.stringify({ ...where(body), d });
    try {
      await client.views.open({ trigger_id: body.trigger_id, view: editModal(d, meta.slice(0, 3000)) });
    } catch (e: any) {
      await ephemeral(client, body, `I couldn't open the editor (${slackError(e)}).`);
    }
  });

  app.view(A.editSubmit, async ({ ack, view, client }: any) => {
    const title = houseStyle(String(view?.state?.values?.p9t_title?.v?.value || "")).slice(0, 150);
    if (!title) {
      await ack({ response_action: "errors", errors: { p9t_title: "It needs a title." } });
      return;
    }
    await ack();
    try {
      const meta = JSON.parse(view.private_metadata || "{}");
      const d: DraftPayload | null = decodeDraft(JSON.stringify(meta.d));
      if (!d || !meta.channel || !meta.ts) return;
      d.t = title;
      d.c = houseStyle(String(view?.state?.values?.p9t_ctx?.v?.value || "")).slice(0, 900);
      await redraw(client, { channel: meta.channel, ts: meta.ts }, d);
    } catch (e: any) {
      console.error("[tasks] saving the edit failed:", slackError(e));
    }
  });

  app.action(A.discard, async ({ ack, body, action, client }: any) => {
    await ack();
    let requester = "";
    try {
      requester = String(JSON.parse(action?.value || "{}").q || "");
    } catch {
      /* fall through */
    }
    const userId = body?.user?.id;
    if (requester && !deps.canConfirm(userId, requester)) {
      return ephemeral(client, body, `Only <@${requester}>, who asked for this, can discard it (or someone on Pidgi's write list).`);
    }
    const title = String(body?.message?.blocks?.[1]?.text?.text || "the draft").split("\n")[0].replace(/^\*|\*$/g, "");
    try {
      await client.chat.update({ ...where(body), text: "Draft discarded", blocks: discardedBlocks(title, userId) });
    } catch (e: any) {
      await ephemeral(client, body, `I couldn't discard it (${slackError(e)}).`);
    }
  });
}
