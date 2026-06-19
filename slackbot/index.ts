/**
 * Peak Nine — Teamleader Slack bot (Events API / webhook mode)
 * -------------------------------------------------------------
 * Chat with the Teamleader planning connector from Slack.
 *
 * How it works:
 *   - Runs as an HTTP web service. Slack sends events to POST /slack/events.
 *     Requests are verified with your Slack Signing Secret (handled by Bolt).
 *   - Spawns the existing Teamleader MCP server (dist/index.js) as a child
 *     process and exposes ALL its tools (including the planning tools) to
 *     Claude. Nothing is duplicated: rebuild the connector and the bot picks
 *     up the changes on next restart.
 *   - Runs a Claude (Anthropic API) tool-use loop: user asks -> Claude picks
 *     Teamleader tools -> bot runs them -> Claude answers in the Slack thread.
 *
 * Safety:
 *   - Read tools are open to everyone in the workspace.
 *   - Write tools (create/update/delete reservations, etc.) are gated by an
 *     optional allowlist of Slack user IDs (SLACK_WRITE_ALLOWLIST). Empty
 *     allowlist = everyone can write (not recommended).
 *
 * Required env (see slackbot/.env.example):
 *   SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET, ANTHROPIC_API_KEY,
 *   TEAMLEADER_CLIENT_ID, TEAMLEADER_CLIENT_SECRET, TEAMLEADER_REFRESH_TOKEN
 * Optional:
 *   PORT                     (default: 3000)
 *   BOT_MODEL                (default: claude-sonnet-4-6)
 *   SLACK_WRITE_ALLOWLIST    (comma-separated Slack user IDs allowed to write)
 *
 * Slack Event Subscriptions Request URL:  https://<your-host>/slack/events
 */

import path from "path";
import dotenv from "dotenv";
import { App, ExpressReceiver } from "@slack/bolt";
import Anthropic from "@anthropic-ai/sdk";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { gcalEnabled, gcalToolDefs, handleGcalTool } from "./gcal.js";
import { notionEnabled, notionToolDefs, handleNotionTool } from "./notion.js";
import { renderShell, gatherDashboardData, dashboardLink } from "./dashboard.js";

dotenv.config({ path: path.join(__dirname, ".env") });

function need(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required environment variable: ${name}`);
  return v;
}

// Race a promise against a timeout so a single stalled call can never hang a whole turn.
function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)),
  ]);
}

const MODEL = process.env.BOT_MODEL || "claude-sonnet-4-6";
const PORT = Number(process.env.PORT) || 3000;
const WRITE_ALLOWLIST = (process.env.SLACK_WRITE_ALLOWLIST || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const WRITE_PATTERN =
  /(create|update|delete|add_|_add|append|assign|unassign|complete|reopen|close|win|lose|move|book|register|send|schedule|duplicate|credit|tag|untag|link|unlink|log_time|timer|upload|deactivate|remove|cancel|accept|import|reply|resume|stop|invite)/i;

function isWriteTool(name: string): boolean {
  return WRITE_PATTERN.test(name);
}
function writeAllowed(slackUserId: string): boolean {
  if (WRITE_ALLOWLIST.length === 0) return true;
  return WRITE_ALLOWLIST.includes(slackUserId);
}

// Easter egg: a lone dove emoji 🕊️ (or :dove:) summons Pidgi's pigeon alter-ego.
const DOVE_GIF =
  "https://media1.giphy.com/media/9hAgbFY0BZnf1YYdaM/giphy-downsized.gif?cid=6104955e9k26e2274pbxjbv0qgbuyw38tnojqne8dsapenmz&ep=v1_gifs_translate&rid=giphy-downsized.gif&ct=g";
const PIGEON_LINES = [
  "Coo. You rang? 🕊️",
  "A dove? Bold. I'm a pigeon with a deadline, but I'll take the promotion. 🕊️",
  "Peace be upon this planning. 🕊️",
  "You summoned the bird. Deploying maximum coo. 🕊️",
  "Rats with wings? We prefer 'urban doves'. 🕊️",
  "One coo to rule the schedule. 🕊️",
];

// True only when the message is essentially just dove emoji (or the :dove: shortcode),
// so it never hijacks a real question that happens to contain a 🕊️.
function doveTrigger(text: string): boolean {
  const t = text.trim();
  if (/^:dove(?:_of_peace)?:$/.test(t)) return true;
  const doves = t.replace(/[️‍\s]/g, ""); // strip variation selectors, ZWJ, spaces
  return doves.length > 0 && Array.from(doves).every((ch) => ch === "\u{1F54A}");
}

const SYSTEM_PROMPT = `You are the Peak Nine planning assistant, answering in Slack.
You can use Teamleader tools to read and change the team's planning: projects, tasks,
capacity (userAvailability), reservations (planned time blocks), budgets, deals and more.
You can also read and write Google Calendars via the gcal_* tools, but only for calendars
shared with the bot. Google Calendar holds people's REAL meetings and commitments that
Teamleader planning misses, so use gcal_list_events to judge true availability, and
gcal_create_event / gcal_update_event to book or move actual meetings.
If notion_* tools are available, you can also read and update Notion project pages and
databases (only those shared with the bot): search to find the page or database, read it to
learn its exact property names and block IDs, then create pages, append content, update
properties (e.g. a status), or edit a block. Always read a page or database before changing
it, and confirm what you're about to write before doing it.

Formatting for Slack (important):
- Slack does NOT render Markdown. Use Slack mrkdwn: *single asterisks* for bold (never **double**),
  _underscores_ for italics, and "•" or "-" for bullet lists.
- NEVER use Markdown tables (lines with | pipes). Slack shows them as raw text. Present tabular
  info as short bullet lines instead, e.g. "• Jul 3: 8h free".
- Keep replies tight: lead with the answer in a sentence or two, then a few supporting bullets.
  Don't dump long lists or your step-by-step reasoning.

Showing names, not IDs:
- Always show human-readable names, never raw IDs. A plannable item only gives a task ID
  (its source.id). Look the task up with teamleader_get_project_task to get its title, the
  project with teamleader_get_project_v2, and people with teamleader_get_user, and show those
  names. Only show a raw ID if the user explicitly asks for one.

Multi-project / multi-person planning discipline (do this automatically, unprompted):
- When a request spans more than one project or person, do NOT trust the brief alone. Read each
  person's real assignments from Teamleader (task assignees via teamleader_get_project_task and
  plannable items) and reconcile them with what the user told you.
- Hard rule: never plan one person on the SAME project for all five working days of a week. Cap any
  single project at four days per person per week and leave at least one day for other projects,
  internal work or buffer. This is per project, so a person may still reach five working days in
  total across different projects, up to capacity. Apply this whenever you propose or book
  reservations, without being asked. If the user explicitly asks for five days on one project, say
  it breaks this rule and ask them to confirm before you book it. When a week would otherwise hit
  five days on one project, move the fifth day to another project the person holds, or leave it open
  and flag it in the coverage check.
- Before presenting any plan, build a person x project x role matrix and verify that every
  assignment a person has is actually reflected in their week-by-week plan. If someone has a
  role (e.g. "Laura: design support on Enabel WP2") that you did not allocate time for, that is
  a flag — surface it explicitly, never drop it silently.
- Always finish a multi-project plan with a short "coverage check": list anyone or any role in
  the data/brief that is not yet allocated, and any week where a person is over capacity.
- If you cannot reconcile something, say so plainly rather than quietly leaving it out.
- Simple questions get a tight answer (a sentence or two plus a few bullets). A full plan is the
  exception: when a request spans more than one project or person, present it in ONE message using
  this default structure, in this exact order. The system auto-continues your message if it gets
  long, so never cut a plan short and never move detail into a separate "follow-up" message.
    1. One opening line, then state "for your review, nothing committed yet" when nothing is booked.
    2. One clarification before we start — only if something genuinely needs confirming; skip otherwise.
    3. Constraints locked in — holidays/OOO, capacity caps, roles, anything to disregard.
    4. Week-by-week plan — open with a Wn week reference (dates per week), then one block per project
       with its own week-by-week allocation and that project's milestones.
    5. Role x project matrix — every person listed against every project and role they hold.
    6. Capacity flags — the coverage check: anyone over capacity, plus any person or role in the
       brief/data not yet allocated. A dropped assignment (Laura-style gap) MUST surface here,
       never be left out silently.
    7. Master milestone list — every milestone across all projects, in date order.
  Lead each section with a section emoji and a *single-asterisk bold header* (e.g. 📋 *Constraints
  locked in*), use "-" bullets, and a thin separator line between sections. Show the matrix and the
  milestones once only — never repeat them.
- For any visual view (Gantt, timeline, who-works-on-what, capacity heatmap), Slack cannot draw
  it: call get_dashboard_link and share the dashboard URL.

Setting up a NEW project (when asked to "set up", "spin up", "launch" or "create the workspace for" a project):
Do these in order. First present the WHOLE plan (channel name, page location, meeting times and attendees, welcome draft) and get an explicit, formal go. A plan is not a go — wait for a clear yes before you create, change, invite, post or book anything.
1. Load it: teamleader_get_project_v2 (title, customer, start/end, external_budget) and teamleader_get_company (client name). Get the crew from the project assignees and confirm with the user who counts as "the whole team" for onboarding. Always ASK who holds which role (lead, support, design, etc.) and wait for the user to confirm before you state roles anywhere — the Teamleader assignees tell you who is involved, not what their role is. Never assume or invent a person's role.
2. Slack channel: FIRST call find_slack_channels with the client/program name. If a matching channel already exists, propose reusing it. Either way, make sure the WHOLE crew ends up as members: resolve their Slack IDs with lookup_slack_users (from their emails), then for a NEW channel pass those IDs to create_slack_channel, and for an EXISTING channel invite them with invite_to_slack_channel. Don't assume people are already in the channel — invite them. If a call fails with a permissions error, tell the user the bot still needs the matching scope (channels:manage to invite).
3. Notion project page. The rich project page (about the client, the proposal context, stakeholders, the deep narrative) is authored by the Cowork skills, NOT by you — do not try to write that content. Your job is to find that page and add your operational pieces to it.
   - FIND it robustly: notion_search the client/program name, then for the likely candidates notion_get_page and check whether the page links to THIS project's Teamleader URL or project id. The matching page is the real one even if it is titled differently (e.g. "old"). Match on the Teamleader link, not just the title.
   - If you find it, REUSE it: add only the pieces below that are missing. Never create a second project page for a project that already has one.
   - If you cannot confidently identify the page, ASK the user for the link instead of creating a new one.
   - Only if the user confirms none exists, create a light project page under the "Projects" area with notion_create_page and note that the skills will enrich it later.
   On the project page, make sure these exist (create only the ones that are missing). Do NOT create a "Crew onboarding" page — the rich project page already covers onboarding.
   - An Agenda database via notion_create_database, columns EXACTLY: Task (title), Creator (person), Assignee (person), Priority (select: High, Medium, Low), Status (select: Not started, In progress, Wait P9 feedback, Done), Deadline (date). Note once that Status is a select because the API can't create a true status field. KEEP the Agenda database's own page URL — you link to that (not the whole project page) in the channel bookmarks and the standup invite.
   - A "🔍 Kickoff — 30 Clarifying Questions" sub-page organised into 7 themes: Field reality on the ground; The payer and sustainability question; Client organisation's internal dynamics; The evidence base; Field mission / country context; The key decision moment and architecture; Collaboration setup. Write project-specific questions where you can; otherwise leave the theme prompts. (The kickoff-deck skill writes the deep version, so keep this light if that will run later.)
4. Meetings via gcal_create_event. Before creating any meeting, check the crew's calendars with gcal_list_events and do NOT duplicate a meeting that already exists (e.g. a kickoff already booked); reuse or adjust it instead. Never schedule any meeting overlapping the lunch window 11:45–12:30 Europe/Brussels; choose a slot fully before 11:45 or after 12:30.
   Always add every person who should be in the meeting as a real attendee (their email) on gcal_create_event — never create a team meeting with an empty attendee list. Put the Agenda database page link in the event description.
   - Crew onboarding: once, in the project's first week, with the WHOLE team as attendees, 45 minutes, at the earliest slot that is free for everyone (check each person with gcal_list_events first).
   - Weekly sync: ONLY if the project external_budget is €10,000 or more. 30 min, the project crew only (not the whole studio) as attendees, as ONE weekly recurring event for the project's duration (use the recurrence field, e.g. ["RRULE:FREQ=WEEKLY;COUNT=N"]). Pick a fixed weekday/time that is free for the crew and outside the lunch window, and link the Agenda page in the description. If under €10k, skip the weekly sync and say why.
5. Channel bookmarks: once the channel exists and the Notion page and Agenda are in place, FIRST call list_slack_bookmarks and only add_slack_bookmarks for links that are not already there (never create a duplicate bookmark). The three bookmarks are: Teamleader (URL format https://focus.teamleader.eu/projects/[project_id]/work-breakdown), the Notion project page (its real URL), and the Team Agenda (the Agenda database's own page URL). If duplicates already exist on the channel, remove the extras with remove_slack_bookmark. Skip any whose link you don't actually have rather than guessing.
6. Welcome message: draft a short message for the new channel (what the project is, crew and roles, onboarding time and any weekly-sync time, links to the Notion page and the Teamleader project), show it for approval, then post with send_slack_message.

Accuracy:
- Never invent numbers, IDs, dates or names. If unsure, say so. If a tool returns nothing,
  say so rather than guessing.
- Capacity from Teamleader (userAvailability / reservations) reflects Teamleader planning ONLY
  and excludes Google Calendar. When availability actually matters (e.g. before promising
  someone is free or booking a meeting), cross-check the person's Google Calendar with
  gcal_list_events rather than trusting Teamleader's "free" alone.
- Durations from the planning tools are in minutes; convert to hours when you present them.
- For revenue vs cost: revenue is the project external budget. Cost depends on internal hourly
  rates that are NOT in Teamleader, so do not compute cost unless the user gives you the rates.
- Budgets, prices, fixed prices, revenue and internal cost are CONFIDENTIAL to Niels and Jonas.
  NEVER write any such figure into a Slack message, a Notion page, or any other shared artifact.
  You may READ a budget to make an internal decision (e.g. the €10k weekly-sync rule), and you may
  state a figure only when Niels or Jonas asks for it directly in chat. Keep Slack and Notion
  budget-free (mention a threshold like "above the weekly-sync line" instead of the amount).
- Formal go before any change: NEVER create, change, delete, send, post, invite or book anything
  (Teamleader records or reservations, Notion pages or databases, Google Calendar events or invites,
  Slack channels, messages or bookmarks) until the user gives an explicit, formal go for that
  specific action. Presenting a plan or a draft is NOT a go. Show what you intend to do and wait
  for a clear yes. Read-only answers need no confirmation.
- When you create a Google Calendar meeting, always add the people who should attend as real
  attendees (their email addresses). Never create a team meeting with an empty attendee list.
- When booking ANY Google Calendar meeting, never choose a time overlapping the lunch window
  11:45–12:30 Europe/Brussels; pick a slot fully before 11:45 or after 12:30.
- Today's date is ${new Date().toISOString().slice(0, 10)}.`;

async function main(): Promise<void> {
  const slackBotToken = need("SLACK_BOT_TOKEN");
  const slackSigningSecret = need("SLACK_SIGNING_SECRET");
  const anthropicKey = need("ANTHROPIC_API_KEY");
  need("TEAMLEADER_CLIENT_ID");
  need("TEAMLEADER_CLIENT_SECRET");
  need("TEAMLEADER_REFRESH_TOKEN");

  const anthropic = new Anthropic({ apiKey: anthropicKey });

  // ── Spawn the Teamleader MCP server and connect as an MCP client ──────────
  const serverEntry = path.join(__dirname, "..", "dist", "index.js");
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [serverEntry],
    env: { ...process.env } as Record<string, string>,
  });
  const mcp = new Client({ name: "peaknine-slackbot", version: "1.0.0" }, { capabilities: {} });
  await mcp.connect(transport);

  const listed = await mcp.listTools();
  const anthropicTools = listed.tools.map((t) => ({
    name: t.name,
    description: t.description ?? "",
    input_schema: (t.inputSchema as any) ?? { type: "object", properties: {} },
  }));
  console.log(`Connected to Teamleader MCP. ${anthropicTools.length} tools available.`);

  if (gcalEnabled()) {
    anthropicTools.push(...(gcalToolDefs as any[]));
    console.log(`Google Calendar tools enabled (${gcalToolDefs.length}).`);
  } else {
    console.log("Google Calendar tools disabled (set GOOGLE_SERVICE_ACCOUNT_JSON to enable).");
  }

  if (notionEnabled()) {
    anthropicTools.push(...(notionToolDefs as any[]));
    console.log(`Notion tools enabled (${notionToolDefs.length}).`);
  } else {
    console.log("Notion tools disabled (set NOTION_TOKEN to enable).");
  }

  if (process.env.DASHBOARD_KEY && process.env.PUBLIC_BASE_URL) {
    anthropicTools.push({
      name: "get_dashboard_link",
      description:
        "Return the URL of the live visual planning dashboard (team capacity heatmap + open projects). Share this link whenever the user wants a visual, chart, timeline or heatmap that Slack cannot render.",
      input_schema: { type: "object", properties: {} },
    } as any);
    console.log("Dashboard link tool enabled.");
  }

  // Slack admin tools (need the bot to have channel-management + chat:write scopes).
  anthropicTools.push(
    {
      name: "find_slack_channels",
      description:
        "Search existing Slack channels by a name substring, to avoid creating duplicates. Returns matching channels with id and name. Requires the bot to have channels:read (and groups:read for private channels).",
      input_schema: {
        type: "object",
        properties: { query: { type: "string", description: "Name substring to match" } },
        required: ["query"],
      },
    } as any,
    {
      name: "create_slack_channel",
      description:
        "Create a Slack channel (e.g. for a new project) and optionally invite people by Slack user ID and set a topic. The name is auto-sanitised to Slack's rules (lowercase, hyphens). Returns the channel id. Requires the bot to have channel-management permission.",
      input_schema: {
        type: "object",
        properties: {
          name: { type: "string", description: "Desired channel name" },
          is_private: { type: "boolean", description: "Private channel (default false)" },
          invite_user_ids: { type: "array", items: { type: "string" }, description: "Slack user IDs to invite" },
          topic: { type: "string", description: "Optional channel topic" },
        },
        required: ["name"],
      },
    } as any,
    {
      name: "send_slack_message",
      description:
        "Post a message to a Slack channel by its channel ID (e.g. the channel you just created). Uses Slack mrkdwn. Show the draft to the user and get approval before sending.",
      input_schema: {
        type: "object",
        properties: {
          channel: { type: "string", description: "Channel ID" },
          text: { type: "string", description: "Message text (Slack mrkdwn)" },
          unfurl: { type: "boolean", description: "Unfurl links/media (default true)" },
        },
        required: ["channel", "text"],
      },
    } as any,
    {
      name: "add_slack_bookmarks",
      description:
        "Add one or more link bookmarks to a Slack channel (e.g. after creating a project channel, pin the Teamleader project, the Notion page and the Team Agenda). Provide the channel ID and a list of {title, link, emoji?}. Requires the bot to have bookmarks:write.",
      input_schema: {
        type: "object",
        properties: {
          channel: { type: "string", description: "Channel ID" },
          bookmarks: { type: "array", description: "[{title, link, emoji?}]", items: { type: "object" } },
        },
        required: ["channel", "bookmarks"],
      },
    } as any,
    {
      name: "lookup_slack_users",
      description:
        "Resolve people to Slack user IDs so they can be invited or mentioned. Pass emails (preferred) and/or a name query. Returns matching Slack user IDs. Requires users:read and users:read.email.",
      input_schema: {
        type: "object",
        properties: {
          emails: { type: "array", items: { type: "string" }, description: "Emails to resolve to Slack IDs" },
          query: { type: "string", description: "Optional name substring to match" },
        },
      },
    } as any,
    {
      name: "invite_to_slack_channel",
      description:
        "Invite one or more users (by Slack user ID) to an EXISTING channel. Get the IDs from lookup_slack_users first. Requires channel-management permission.",
      input_schema: {
        type: "object",
        properties: {
          channel: { type: "string", description: "Channel ID" },
          user_ids: { type: "array", items: { type: "string" }, description: "Slack user IDs to invite" },
        },
        required: ["channel", "user_ids"],
      },
    } as any,
    {
      name: "list_slack_bookmarks",
      description:
        "List the bookmarks already on a channel (id, title, link). Always call this before adding bookmarks, to avoid duplicates. Requires bookmarks:read.",
      input_schema: {
        type: "object",
        properties: { channel: { type: "string", description: "Channel ID" } },
        required: ["channel"],
      },
    } as any,
    {
      name: "remove_slack_bookmark",
      description: "Remove one channel bookmark by its bookmark_id (from list_slack_bookmarks). Requires bookmarks:write.",
      input_schema: {
        type: "object",
        properties: {
          channel: { type: "string", description: "Channel ID" },
          bookmark_id: { type: "string", description: "Bookmark ID to remove" },
        },
        required: ["channel", "bookmark_id"],
      },
    } as any
  );
  console.log("Slack admin tools enabled (find/create/invite channel, send message, bookmarks list/add/remove, user lookup).");

  // Assigned once the Bolt app is built (see below); used by the Slack admin tools.
  let slackWeb: any = null;

  async function callTool(name: string, input: any, slackUserId: string): Promise<{ text: string; isError: boolean }> {
    if (isWriteTool(name) && !writeAllowed(slackUserId)) {
      return {
        isError: true,
        text: `Blocked: "${name}" changes the plan, and you are not on the write allowlist. Ask Niels to add your Slack ID, or use a read-only request.`,
      };
    }
    if (name === "get_dashboard_link") {
      return { text: dashboardLink(), isError: false };
    }
    if (name.startsWith("gcal_")) {
      return handleGcalTool(name, input);
    }
    if (name.startsWith("notion_")) {
      return handleNotionTool(name, input);
    }
    if (name === "find_slack_channels") {
      try {
        const q = String(input.query || "").toLowerCase();
        const r: any = await slackWeb.conversations.list({ types: "public_channel,private_channel", limit: 1000, exclude_archived: true });
        const matches = (r?.channels || [])
          .filter((c: any) => !q || String(c.name || "").toLowerCase().includes(q))
          .map((c: any) => ({ id: c.id, name: c.name, is_private: !!c.is_private }));
        return { isError: false, text: JSON.stringify({ matches }) };
      } catch (e: any) {
        return { isError: true, text: `find_slack_channels failed: ${e?.data?.error || e?.message || e}` };
      }
    }
    if (name === "create_slack_channel") {
      try {
        const clean = String(input.name || "")
          .toLowerCase()
          .replace(/[^a-z0-9-_]/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 80);
        if (!clean) return { isError: true, text: "create_slack_channel needs a usable name." };
        const r: any = await slackWeb.conversations.create({ name: clean, is_private: !!input.is_private });
        const cid = r?.channel?.id;
        const out: any = { id: cid, name: clean };
        if (cid && Array.isArray(input.invite_user_ids) && input.invite_user_ids.length) {
          try {
            await slackWeb.conversations.invite({ channel: cid, users: input.invite_user_ids.join(",") });
          } catch (e: any) {
            out.invite_warning = e?.data?.error || String(e);
          }
        }
        if (cid && input.topic) {
          try { await slackWeb.conversations.setTopic({ channel: cid, topic: String(input.topic) }); } catch { /* non-fatal */ }
        }
        return { isError: false, text: JSON.stringify(out) };
      } catch (e: any) {
        return { isError: true, text: `create_slack_channel failed: ${e?.data?.error || e?.message || e}` };
      }
    }
    if (name === "send_slack_message") {
      try {
        const r: any = await slackWeb.chat.postMessage({
          channel: String(input.channel),
          text: String(input.text || ""),
          unfurl_links: input.unfurl !== false,
          unfurl_media: input.unfurl !== false,
        });
        return { isError: false, text: JSON.stringify({ ok: r?.ok, ts: r?.ts, channel: r?.channel }) };
      } catch (e: any) {
        return { isError: true, text: `send_slack_message failed: ${e?.data?.error || e?.message || e}` };
      }
    }
    if (name === "add_slack_bookmarks") {
      try {
        const channel = String(input.channel);
        const list = Array.isArray(input.bookmarks) ? input.bookmarks : [];
        const added: any[] = [];
        for (const b of list) {
          if (!b?.link) continue;
          try {
            const r: any = await slackWeb.bookmarks.add({
              channel_id: channel,
              title: String(b.title || b.link),
              type: "link",
              link: String(b.link),
              ...(b.emoji ? { emoji: String(b.emoji) } : {}),
            });
            added.push({ title: b.title, ok: r?.ok !== false });
          } catch (e: any) {
            added.push({ title: b.title, error: e?.data?.error || String(e) });
          }
        }
        return { isError: false, text: JSON.stringify({ added }) };
      } catch (e: any) {
        return { isError: true, text: `add_slack_bookmarks failed: ${e?.data?.error || e?.message || e}` };
      }
    }
    if (name === "lookup_slack_users") {
      try {
        const users: any[] = [];
        for (const email of Array.isArray(input.emails) ? input.emails : []) {
          try {
            const r: any = await slackWeb.users.lookupByEmail({ email: String(email) });
            users.push({ email, id: r?.user?.id, name: r?.user?.real_name || r?.user?.profile?.real_name });
          } catch (e: any) {
            users.push({ email, error: e?.data?.error || String(e) });
          }
        }
        if (input.query) {
          const q = String(input.query).toLowerCase();
          const r: any = await slackWeb.users.list({ limit: 1000 });
          for (const m of r?.members || []) {
            const nm = `${m?.real_name || ""} ${m?.profile?.display_name || ""}`.toLowerCase();
            if (!m?.deleted && !m?.is_bot && nm.includes(q)) users.push({ id: m.id, name: m.real_name, email: m?.profile?.email });
          }
        }
        return { isError: false, text: JSON.stringify({ users }) };
      } catch (e: any) {
        return { isError: true, text: `lookup_slack_users failed: ${e?.data?.error || e?.message || e}` };
      }
    }
    if (name === "invite_to_slack_channel") {
      try {
        const ids = Array.isArray(input.user_ids) ? input.user_ids : [];
        if (!input.channel || !ids.length) return { isError: true, text: "invite_to_slack_channel needs channel and user_ids." };
        const r: any = await slackWeb.conversations.invite({ channel: String(input.channel), users: ids.join(",") });
        return { isError: false, text: JSON.stringify({ ok: r?.ok, channel: r?.channel?.id || input.channel }) };
      } catch (e: any) {
        const err = e?.data?.error || e?.message || String(e);
        // "already_in_channel" is a success for our purposes.
        return { isError: !/already_in_channel/i.test(String(err)), text: `invite_to_slack_channel: ${err}` };
      }
    }
    if (name === "list_slack_bookmarks") {
      try {
        const r: any = await slackWeb.bookmarks.list({ channel_id: String(input.channel) });
        const items = (r?.bookmarks || []).map((b: any) => ({ id: b.id, title: b.title, link: b.link }));
        return { isError: false, text: JSON.stringify({ bookmarks: items }) };
      } catch (e: any) {
        return { isError: true, text: `list_slack_bookmarks failed: ${e?.data?.error || e?.message || e}` };
      }
    }
    if (name === "remove_slack_bookmark") {
      try {
        await slackWeb.bookmarks.remove({ channel_id: String(input.channel), bookmark_id: String(input.bookmark_id) });
        return { isError: false, text: JSON.stringify({ removed: input.bookmark_id }) };
      } catch (e: any) {
        return { isError: true, text: `remove_slack_bookmark failed: ${e?.data?.error || e?.message || e}` };
      }
    }
    try {
      const res: any = await mcp.callTool({ name, arguments: input || {} });
      const text = Array.isArray(res?.content)
        ? res.content.map((c: any) => (typeof c?.text === "string" ? c.text : JSON.stringify(c))).join("\n")
        : JSON.stringify(res);
      return { text: text || "(no content)", isError: !!res?.isError };
    } catch (e: any) {
      return { isError: true, text: `Tool ${name} failed: ${e?.message || e}` };
    }
  }

  // Per-conversation memory: a clean text-only history keyed by the channel
  // (the DM itself), NOT by individual message or thread. Every message in the
  // conversation therefore shares one continuous memory, whether you type at the
  // top level or inside a thread, so context never resets mid-conversation.
  // In-memory only, so it resets if the service restarts/redeploys.
  const threadHistory = new Map<string, Anthropic.MessageParam[]>();
  const HISTORY_MAX = 20; // keep the last ~10 exchanges per conversation

  // Map the asking Slack user to their name + email so "my agenda/calendar" resolves
  // without Pidgi asking who they are. Needs the bot to have users:read + users:read.email.
  const identityCache = new Map<string, { name: string; email: string }>();
  async function resolveIdentity(userId: string): Promise<{ name: string; email: string } | null> {
    if (!userId || !slackWeb) return null;
    if (identityCache.has(userId)) return identityCache.get(userId)!;
    try {
      const r: any = await slackWeb.users.info({ user: userId });
      const p = r?.user?.profile || {};
      const id = { name: r?.user?.real_name || p.real_name || p.display_name || "", email: p.email || "" };
      identityCache.set(userId, id);
      return id;
    } catch {
      return null;
    }
  }

  async function ask(
    userText: string,
    slackUserId: string,
    convoKey: string,
    identity?: { name: string; email: string } | null
  ): Promise<string> {
    const history = threadHistory.get(convoKey) ?? [];
    const messages: Anthropic.MessageParam[] = [...history, { role: "user", content: userText }];
    const system =
      identity && (identity.email || identity.name)
        ? `${SYSTEM_PROMPT}\n\nWho you are talking to right now: ${identity.name || "a Peak Nine teammate"}${identity.email ? ` (${identity.email})` : ""}. When they say "me", "my", "my agenda" or "my calendar", that means THIS person and THIS email — use their email directly as calendar_email for the gcal_* tools (and as the person for "my" tasks) without asking which calendar, unless they explicitly name someone else.`
        : SYSTEM_PROMPT;

    let finalText = "";
    for (let step = 0; step < 16; step++) {
      const resp = await anthropic.messages.create(
        {
          model: MODEL,
          max_tokens: 8000,
          system,
          tools: anthropicTools as any,
          messages,
        },
        { timeout: 150000 }
      );

      if (resp.stop_reason === "tool_use") {
        messages.push({ role: "assistant", content: resp.content });
        const toolResults: Anthropic.ToolResultBlockParam[] = [];
        for (const block of resp.content) {
          if (block.type === "tool_use") {
            let out: { text: string; isError: boolean };
            try {
              out = await withTimeout(callTool(block.name, block.input, slackUserId), 90000, `Tool ${block.name}`);
            } catch (e: any) {
              out = { isError: true, text: `Tool ${block.name} did not finish: ${e?.message || e}` };
            }
            toolResults.push({
              type: "tool_result",
              tool_use_id: block.id,
              content: out.text.slice(0, 60000),
              is_error: out.isError,
            });
          }
        }
        messages.push({ role: "user", content: toolResults });
        continue;
      }

      // Accumulate this response's text.
      finalText += resp.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("");

      // If the model ran out of output room mid-answer, continue where it left off.
      if (resp.stop_reason === "max_tokens") {
        messages.push({ role: "assistant", content: resp.content });
        continue;
      }
      break;
    }

    finalText = finalText.trim();
    if (!finalText) finalText = "I took too many steps without finishing. Try a more specific question.";

    // Persist clean text-only history (drop the intra-turn tool calls).
    const updated: Anthropic.MessageParam[] = [
      ...history,
      { role: "user", content: userText },
      { role: "assistant", content: finalText },
    ];
    threadHistory.set(convoKey, updated.slice(-HISTORY_MAX));

    return finalText;
  }

  // Split a (possibly long) answer into Slack-sized pieces (~3000-char limit),
  // breaking on paragraph boundaries.
  function chunkText(text: string): string[] {
    const MAX = 2900;
    const chunks: string[] = [];
    let buf = "";
    for (const para of text.split(/\n{2,}/)) {
      const candidate = buf ? buf + "\n\n" + para : para;
      if (candidate.length <= MAX) {
        buf = candidate;
      } else {
        if (buf) { chunks.push(buf); buf = ""; }
        if (para.length > MAX) {
          for (let i = 0; i < para.length; i += MAX) chunks.push(para.slice(i, i + MAX));
        } else {
          buf = para;
        }
      }
    }
    if (buf) chunks.push(buf);
    return chunks;
  }

  // Deliver the answer by editing the "on it" placeholder into the first piece, then
  // posting any overflow as follow-up messages. Falls back to plain posting if there is
  // no placeholder or the edit fails.
  async function deliver(say: any, ack: any, text: string, threadTs?: string): Promise<void> {
    const chunks = chunkText(text);
    if (!chunks.length) chunks.push("Done.");
    let start = 0;
    if (ack?.ts && ack?.channel) {
      try {
        await slackWeb.chat.update({ channel: ack.channel, ts: ack.ts, text: chunks[0] });
        start = 1;
      } catch {
        /* placeholder edit failed — post everything below as new messages */
      }
    }
    for (let i = start; i < chunks.length; i++) {
      await say({ text: chunks[i], thread_ts: threadTs });
    }
  }

  // ── Slack wiring (Events API / HTTP) ──────────────────────────────────────
  const receiver = new ExpressReceiver({ signingSecret: slackSigningSecret });
  const app = new App({ token: slackBotToken, receiver });
  slackWeb = app.client; // used by create_slack_channel / send_slack_message

  // Dashbird 🐦 — interactive live dashboard.
  function dashKeyOk(req: any, res: any): boolean {
    const key = process.env.DASHBOARD_KEY;
    if (!key) { res.status(404).send("Dashboard disabled (set DASHBOARD_KEY)."); return false; }
    if (req.query.key !== key) { res.status(401).send("Unauthorized"); return false; }
    return true;
  }

  // The HTML shell (client fetches /dashboard/data for the live numbers).
  receiver.router.get("/dashboard", (req: any, res: any) => {
    if (!dashKeyOk(req, res)) return;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(renderShell());
  });

  // Live JSON for the selected window.
  receiver.router.get("/dashboard/data", async (req: any, res: any) => {
    if (!dashKeyOk(req, res)) return;
    try {
      const weeks = Number(req.query.weeks) || 6;
      const start = typeof req.query.start === "string" ? req.query.start : undefined;
      const data = await gatherDashboardData(mcp, start, weeks);
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ error: e?.message || String(e) });
    }
  });

  // Dedupe Slack retries (Slack resends an event if it doesn't get a fast 200).
  const seen = new Set<string>();
  function firstTime(id: string | undefined): boolean {
    if (!id) return true;
    if (seen.has(id)) return false;
    seen.add(id);
    if (seen.size > 1000) seen.clear();
    return true;
  }

  // convoKey      = where memory is filed (the channel/DM; one continuous memory).
  // replyThreadTs = where the reply is posted: undefined posts at the top level,
  //                 a thread ts posts inside that thread. Callers decide the rule:
  //                 @mentions reply in a thread, plain DMs reply top-level.
  async function handle(text: string, slackUserId: string, say: any, convoKey: string, replyThreadTs?: string) {
    const cleaned = text.replace(/<@[A-Z0-9]+>/g, "").trim();
    if (!cleaned) {
      await say({ text: "Ask me about the team's planning, capacity, projects or reservations.", thread_ts: replyThreadTs });
      return;
    }
    if (doveTrigger(cleaned)) {
      const line = PIGEON_LINES[Math.floor(Math.random() * PIGEON_LINES.length)];
      // Whole sentence IS the link, so the raw URL is never shown. No unfurl.
      await say({
        text: `<${DOVE_GIF}|${line}>`,
        thread_ts: replyThreadTs,
        unfurl_links: false,
        unfurl_media: false,
      });
      return;
    }
    // Immediate acknowledgement so the team knows Pidgi is working. This same message
    // is then edited into the final answer, so it never leaves clutter behind.
    let ack: any = null;
    try {
      ack = await say({ text: "🕊️ On it — give me a minute…", thread_ts: replyThreadTs });
    } catch {
      /* if the ack can't be posted, we just deliver normally below */
    }
    try {
      const identity = await resolveIdentity(slackUserId);
      let answer = await ask(cleaned, slackUserId, convoKey, identity);
      // Defensive: strip any stray legacy token that may linger in memory.
      answer = answer.split("<<DETAIL_FOLLOWUP>>").join("").trim();
      await deliver(say, ack, answer, replyThreadTs);
    } catch (e: any) {
      const msg = `Something went wrong: ${e?.message || e}`;
      if (ack?.ts && ack?.channel) {
        try {
          await slackWeb.chat.update({ channel: ack.channel, ts: ack.ts, text: msg });
          return;
        } catch {
          /* fall through to posting a new message */
        }
      }
      await say({ text: msg, thread_ts: replyThreadTs });
    }
  }

  app.event("app_mention", async ({ event, say }) => {
    const e: any = event;
    if (!firstTime(`${e.channel}:${e.ts}`)) return;
    // @mention: reply in a thread (under the mention, or the existing thread).
    await handle(e.text || "", e.user, say, e.channel, e.thread_ts || e.ts);
  });

  app.event("message", async ({ event, say }) => {
    const e: any = event;
    if (e.bot_id || e.subtype) return;
    if (!firstTime(`${e.channel}:${e.ts}`)) return;
    if (e.channel_type === "im") {
      // Plain DM: full assistant, reply top-level (stay in a thread only if in one).
      await handle(e.text || "", e.user, say, e.channel, e.thread_ts);
      return;
    }
    // In channels/groups Pidgi stays silent EXCEPT for a solo 🕊️ summon, so it
    // never runs the assistant on normal channel chatter, only the easter egg.
    const channelText = (e.text || "").replace(/<@[A-Z0-9]+>/g, "").trim();
    if (doveTrigger(channelText)) {
      await handle(e.text || "", e.user, say, e.channel, e.thread_ts);
    }
  });

  await app.start(PORT);
  console.log(`⚡ Peak Nine Teamleader Slack bot running on port ${PORT} (Events API).`);
  console.log(`   Slack Event Subscriptions Request URL: https://<your-host>/slack/events`);
  if (WRITE_ALLOWLIST.length === 0) {
    console.log("WARNING: SLACK_WRITE_ALLOWLIST is empty — every user can run write actions. Set it to lock writes down.");
  } else {
    console.log(`Write actions limited to ${WRITE_ALLOWLIST.length} allowlisted user(s).`);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
