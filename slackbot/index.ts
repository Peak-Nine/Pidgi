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
import { renderDashboard, dashboardLink } from "./dashboard.js";

dotenv.config({ path: path.join(__dirname, ".env") });

function need(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required environment variable: ${name}`);
  return v;
}

const MODEL = process.env.BOT_MODEL || "claude-sonnet-4-6";
const PORT = Number(process.env.PORT) || 3000;
const WRITE_ALLOWLIST = (process.env.SLACK_WRITE_ALLOWLIST || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const WRITE_PATTERN =
  /(create|update|delete|add_|_add|append|assign|unassign|complete|reopen|close|win|lose|move|book|register|send|schedule|duplicate|credit|tag|untag|link|unlink|log_time|timer|upload|deactivate|remove|cancel|accept|import|reply|resume|stop)/i;

function isWriteTool(name: string): boolean {
  return WRITE_PATTERN.test(name);
}
function writeAllowed(slackUserId: string): boolean {
  if (WRITE_ALLOWLIST.length === 0) return true;
  return WRITE_ALLOWLIST.includes(slackUserId);
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
- Before creating or changing reservations, briefly confirm what you are about to do.
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

  // Per-thread conversation memory: a clean text-only history per Slack thread,
  // so follow-ups ("continue", "now do the same for Jonas") keep context.
  // In-memory only, so it resets if the service restarts (fine for normal use).
  const threadHistory = new Map<string, Anthropic.MessageParam[]>();
  const HISTORY_MAX = 20; // keep the last ~10 exchanges per thread

  async function ask(userText: string, slackUserId: string, threadTs: string): Promise<string> {
    const history = threadHistory.get(threadTs) ?? [];
    const messages: Anthropic.MessageParam[] = [...history, { role: "user", content: userText }];

    let finalText = "";
    for (let step = 0; step < 16; step++) {
      const resp = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 8000,
        system: SYSTEM_PROMPT,
        tools: anthropicTools as any,
        messages,
      });

      if (resp.stop_reason === "tool_use") {
        messages.push({ role: "assistant", content: resp.content });
        const toolResults: Anthropic.ToolResultBlockParam[] = [];
        for (const block of resp.content) {
          if (block.type === "tool_use") {
            const out = await callTool(block.name, block.input, slackUserId);
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
    threadHistory.set(threadTs, updated.slice(-HISTORY_MAX));

    return finalText;
  }

  // Post a (possibly long) answer as one or more Slack messages in the thread,
  // splitting on paragraph boundaries to stay under Slack's ~3000-char limit.
  async function postChunks(say: any, text: string, threadTs: string): Promise<void> {
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
    for (const c of chunks) {
      await say({ text: c, thread_ts: threadTs });
    }
  }

  // ── Slack wiring (Events API / HTTP) ──────────────────────────────────────
  const receiver = new ExpressReceiver({ signingSecret: slackSigningSecret });
  const app = new App({ token: slackBotToken, receiver });

  // Read-only live dashboard at /dashboard?key=DASHBOARD_KEY
  receiver.router.get("/dashboard", async (req: any, res: any) => {
    const key = process.env.DASHBOARD_KEY;
    if (!key) { res.status(404).send("Dashboard disabled (set DASHBOARD_KEY)."); return; }
    if (req.query.key !== key) { res.status(401).send("Unauthorized"); return; }
    try {
      const html = await renderDashboard(mcp);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(html);
    } catch (e: any) {
      res.status(500).send("Dashboard error: " + (e?.message || e));
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

  async function handle(text: string, slackUserId: string, say: any, threadTs: string) {
    const cleaned = text.replace(/<@[A-Z0-9]+>/g, "").trim();
    if (!cleaned) {
      await say({ text: "Ask me about the team's planning, capacity, projects or reservations.", thread_ts: threadTs });
      return;
    }
    try {
      let answer = await ask(cleaned, slackUserId, threadTs);
      // Defensive: strip any stray legacy token that may linger in thread memory.
      answer = answer.split("<<DETAIL_FOLLOWUP>>").join("").trim();
      await postChunks(say, answer, threadTs);
    } catch (e: any) {
      await say({ text: `Something went wrong: ${e?.message || e}`, thread_ts: threadTs });
    }
  }

  app.event("app_mention", async ({ event, say, body }) => {
    const e: any = event;
    if (!firstTime((body as any)?.event_id)) return;
    await handle(e.text || "", e.user, say, e.thread_ts || e.ts);
  });

  app.event("message", async ({ event, say, body }) => {
    const e: any = event;
    if (e.bot_id || e.subtype) return;
    if (e.channel_type !== "im") return;
    if (!firstTime((body as any)?.event_id)) return;
    await handle(e.text || "", e.user, say, e.thread_ts || e.ts);
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
