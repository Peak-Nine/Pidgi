/**
 * Tendi: Peak Nine proposal assistant for Slack (Events API / webhook mode)
 * -------------------------------------------------------------------------
 * Sister bot of Pidgi (slackbot/). Same plumbing, different job: turn a briefing,
 * tender or set of meeting notes into a Peak Nine proposal, in Slack.
 *
 * How it works:
 *   - Runs as an HTTP web service. Slack sends events to POST /slack/events,
 *     verified with the Slack Signing Secret (handled by Bolt).
 *   - One Slack thread = one proposal. Each thread keeps a workspace (facts,
 *     decisions, drafts, open items, links) and its attachments on disk.
 *   - Runs a Claude (Anthropic API) tool-use loop with Tendi's playbooks as the
 *     system prompt: Proof of Change deck, modular proposal, RFP from the Philea
 *     template (tendi/playbooks/*.md).
 *   - Tools: thread workspace, attachment reading, dates, Anthropic web search,
 *     Word (.docx) builder, a curated subset of this repo's Teamleader MCP tools,
 *     and Canva through Canva's hosted MCP server (optional, one-time login).
 *
 * Safety:
 *   - Drafting is open to everyone in the workspace.
 *   - Writes (Teamleader deal/quotation, Canva copy/edit) are gated by
 *     TENDI_WRITE_ALLOWLIST (Slack user IDs) and, in the prompt, by an explicit go.
 *
 * Required env (see tendi/.env.example):
 *   SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET, ANTHROPIC_API_KEY
 * Optional:
 *   TEAMLEADER_CLIENT_ID / TEAMLEADER_CLIENT_SECRET / TEAMLEADER_REFRESH_TOKEN
 *   PUBLIC_BASE_URL + TENDI_ADMIN_KEY   (Canva login, status and usage endpoints)
 *   TENDI_MODEL (default claude-opus-4-8), TENDI_WRITE_ALLOWLIST, TENDI_WEB_SEARCH,
 *   TENDI_DATA_DIR, TENDI_MAX_TOKENS, PORT
 *
 * Slack Event Subscriptions Request URL:  https://<your-host>/slack/events
 */

import path from "path";
import dotenv from "dotenv";
import { App, ExpressReceiver } from "@slack/bolt";
import Anthropic from "@anthropic-ai/sdk";
import { buildStaticSystemPrompt } from "./prompt.js";
import {
  applyWorkspaceUpdate,
  describeWorkspace,
  emptyWorkspace,
  loadThread,
  newThread,
  saveThread,
  statePersistent,
  threadExists,
  trimHistory,
  type ThreadState,
} from "./state.js";
import { downloadSlackFile, extractText, inlineBlock, type ExtractedFile, type SlackFileRef } from "./files.js";
import { buildDocx, DOC_SPEC_SCHEMA, safeFilename } from "./docx.js";
import { TeamleaderBridge, teamleaderEnabled, type AnthropicToolDef } from "./teamleader.js";
import { CanvaBridge, canvaConfigured, isCanvaWriteTool, MASTER_TEMPLATE_IDS, masterTemplateGuard } from "./canva.js";
import { recordUsage, summarizeUsage } from "./usage.js";
import { downloadPdf, pickDownloadUrl } from "./canva-export.js";
import { chunkText, cleanSlackText, dateInfo } from "./text.js";
import { startScoutService, scoutConfig } from "./scout/service.js";
import { scoutDigestBlock, scoutItemBlock } from "./scout/handoff.js";
import { itemsForDigest, type SeenRecord } from "./scout/store.js";

dotenv.config({ path: path.join(__dirname, ".env") });

function need(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required environment variable: ${name}`);
  return v;
}

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)),
  ]);
}

const MODEL = process.env.TENDI_MODEL || "claude-opus-4-8";
const MAX_TOKENS = Number(process.env.TENDI_MAX_TOKENS) || 16000;
const MAX_STEPS = Number(process.env.TENDI_MAX_STEPS) || 30;
const PORT = Number(process.env.PORT) || 3000;
const WEB_SEARCH = process.env.TENDI_WEB_SEARCH !== "0";
const WRITE_ALLOWLIST = (process.env.TENDI_WRITE_ALLOWLIST || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const TL_WRITE_PATTERN = /(create|update|delete|win|lose|move|accept|send|duplicate|tag|untag|link|unlink)/i;
function isWriteTool(name: string): boolean {
  if (name.startsWith("teamleader_")) return TL_WRITE_PATTERN.test(name);
  if (name.startsWith("canva_")) return isCanvaWriteTool(name);
  return false;
}
function writeAllowed(slackUserId: string): boolean {
  if (WRITE_ALLOWLIST.length === 0) return true;
  return WRITE_ALLOWLIST.includes(slackUserId);
}

// Canva master templates: never exported or edited directly (see playbooks/07-canva.md).
const TEMPLATE_IDS = new Set(MASTER_TEMPLATE_IDS);

async function main(): Promise<void> {
  const slackBotToken = need("SLACK_BOT_TOKEN");
  const slackSigningSecret = need("SLACK_SIGNING_SECRET");
  const anthropicKey = need("ANTHROPIC_API_KEY");
  const adminKey = process.env.TENDI_ADMIN_KEY || "";
  const publicBaseUrl = (process.env.PUBLIC_BASE_URL || "").replace(/\/$/, "");

  const anthropic = new Anthropic({ apiKey: anthropicKey });
  const STATIC_SYSTEM = buildStaticSystemPrompt();
  console.log(`System prompt loaded (${STATIC_SYSTEM.length} chars). Model: ${MODEL}. Data persistent: ${statePersistent()}.`);

  // ── Teamleader (optional) ────────────────────────────────────────────────
  let teamleader: TeamleaderBridge | null = null;
  if (teamleaderEnabled()) {
    try {
      const tl = new TeamleaderBridge();
      await tl.connect(path.join(__dirname, ".."));
      teamleader = tl;
      console.log(`Teamleader connected. Exposing ${tl.tools.length} tools: ${tl.tools.map((t) => t.name).join(", ")}`);
    } catch (e: any) {
      console.error(`Teamleader disabled: ${e?.message || e}`);
    }
  } else {
    console.log("Teamleader disabled (set TEAMLEADER_CLIENT_ID/SECRET/REFRESH_TOKEN to enable).");
  }

  // ── Canva (optional, via Canva's hosted MCP server) ──────────────────────
  let canva: CanvaBridge | null = null;
  if (canvaConfigured()) {
    canva = new CanvaBridge(publicBaseUrl);
    if (canva.provider.hasTokens()) {
      try {
        await canva.connect();
        console.log(`Canva connected. ${canva.tools.length} tools: ${canva.tools.map((t) => t.name).join(", ")}`);
      } catch (e: any) {
        console.error(`Canva not connected yet (${e?.message || e}). Reconnect via ${publicBaseUrl}/canva/connect?key=...`);
      }
    } else {
      console.log(`Canva configured but not connected. Connect once via ${publicBaseUrl}/canva/connect?key=<TENDI_ADMIN_KEY>`);
    }
  } else {
    console.log("Canva disabled (set PUBLIC_BASE_URL, and TENDI_ADMIN_KEY for the login link, to enable).");
  }

  // ── Base tools ───────────────────────────────────────────────────────────
  const baseTools: AnthropicToolDef[] = [
    {
      name: "workspace_update",
      description:
        "Save structured state for THIS proposal thread so it survives the conversation: proposal_type (proof-of-change | new-proposal | rfp-philea | unknown), client, facts (hard facts from the briefing, key -> value), decisions (Niels's or Jonas's answers, key -> value), open_items (full replacement list of what is still open), draft_status (short free text such as 'questions out', 'draft 1 posted', 'approved', 'files built'), links (key -> URL: canva edit url, teamleader deal, docx), notes (your running notes, including research sources with URLs). Maps merge key by key; pass an empty string to delete a key. Call it whenever you learn something that matters.",
      input_schema: {
        type: "object",
        properties: {
          proposal_type: { type: "string", enum: ["proof-of-change", "new-proposal", "rfp-philea", "unknown"] },
          client: { type: "string" },
          facts: { type: "object", additionalProperties: { type: "string" } },
          decisions: { type: "object", additionalProperties: { type: "string" } },
          open_items: { type: "array", items: { type: "string" } },
          draft_status: { type: "string" },
          links: { type: "object", additionalProperties: { type: "string" } },
          notes: { type: "string" },
        },
      },
    },
    {
      name: "workspace_reset",
      description:
        "Start a NEW proposal in this conversation: clears the workspace (type, client, facts, decisions, open items, links, notes) and the attached sources. Use it when Niels or Jonas clearly start a different proposal in a conversation that already holds one (for example a new client name after a finished proposal). Ask first if it is not obvious; never reset mid-proposal.",
      input_schema: {
        type: "object",
        properties: { reason: { type: "string", description: "One line on why you are resetting" } },
      },
    },
    {
      name: "read_source",
      description:
        "Read the extracted text of an attachment in this thread (PDF, Word, text). Pass name (as listed under 'attached sources') or index (1-based), plus offset and length (characters, default 20000) to page through long documents. Use it to read a tender in full before writing: the inline excerpt in the message is only the first part.",
      input_schema: {
        type: "object",
        properties: {
          name: { type: "string" },
          index: { type: "number" },
          offset: { type: "number" },
          length: { type: "number" },
        },
      },
    },
    {
      name: "date_info",
      description:
        "Resolve dates to weekdays so you NEVER guess. Pass `dates` (ISO YYYY-MM-DD) to get each one's weekday, and/or `start`+`end` to get every working day (Mon-Fri) in the range. Always call this before you state a weekday, build a timeline or a month grid, or count working days.",
      input_schema: {
        type: "object",
        properties: {
          dates: { type: "array", items: { type: "string" } },
          start: { type: "string" },
          end: { type: "string" },
        },
      },
    },
    {
      name: "build_docx",
      description:
        "Build a Word (.docx) file in the Peak Nine document design from a structured spec and post it into this Slack thread. Use it for the modular proposal pre-read (4 to 6 pages), the RFP master document and its per-slot splits, or a Proof of Change narrative when Niels asks for one. Write client-facing prose in Peak Nine voice; mark unknowns [TO CONFIRM: ...]. Returns the Slack file link. Only build after the text was reviewed in the thread, or when Niels asks for the file directly.",
      input_schema: DOC_SPEC_SCHEMA as any,
    },
    {
      name: "deliver_canva_pdf",
      description:
        "Export a Canva design (a filled copy, never a master template) as an on-brand PDF and post the file into this Slack thread. Use it for the proposal doc and the decks. For the poster, hand over the Canva link of the filled copy instead, and export a PDF only when Niels asks. Only call it once the copy has no leftover template text, and say which design you exported. Returns the Slack file link.",
      input_schema: {
        type: "object",
        properties: {
          design_id: { type: "string", description: "Canva design id of the filled copy (starts with D)." },
          filename: { type: "string", description: "File name, e.g. 'Peak Nine for Philea - Technical Proposal.pdf'." },
          pages: { type: "array", items: { type: "integer" }, description: "Optional 1-based pages to export; omit for all." },
          size: { type: "string", enum: ["a4", "a3", "letter", "legal"], description: "Optional paper size for documents. Omit for posters and decks." },
        },
        required: ["design_id"],
      },
    },
    {
      name: "canva_status",
      description:
        "Check whether Canva is connected to Tendi and how many Canva tools are available. Call this before planning any Canva step. If not connected, tell Niels that an admin opens the /canva/connect link once (see the README); meanwhile deliver the drafts, the Word file and a manual Canva checklist.",
      input_schema: { type: "object", properties: {} },
    },
  ];

  function currentTools(): any[] {
    const tools: any[] = [...baseTools];
    if (teamleader) tools.push(...teamleader.tools);
    if (canva && canva.connected()) tools.push(...canva.tools);
    if (WEB_SEARCH) tools.push({ type: "web_search_20260209", name: "web_search", max_uses: Number(process.env.TENDI_WEB_SEARCH_MAX_USES) || 8 });
    return tools;
  }

  // Assigned once the Bolt app is built; used by file upload and identity lookups.
  let slackWeb: any = null;
  let botUserId = "";

  async function uploadToThread(channel: string, threadTs: string | undefined, filename: string, buffer: Buffer, comment: string): Promise<any> {
    const r: any = await slackWeb.files.uploadV2({
      channel_id: channel,
      ...(threadTs ? { thread_ts: threadTs } : {}),
      file: buffer,
      filename,
      title: filename.replace(/\.(docx|pdf)$/i, ""),
      initial_comment: comment,
    });
    const nested = Array.isArray(r?.files) ? r.files.flatMap((x: any) => (Array.isArray(x?.files) ? x.files : [x])) : [];
    const f = nested[0] || {};
    return { ok: r?.ok !== false, id: f.id, name: f.name || filename, permalink: f.permalink || null };
  }

  // Where this turn's replies and files go (a channel thread, or the DM itself).
  interface TurnCtx {
    channel: string;
    threadTs?: string;
  }

  async function callTool(name: string, input: any, slackUserId: string, state: ThreadState, ctx: TurnCtx): Promise<{ text: string; isError: boolean }> {
    if (isWriteTool(name) && !writeAllowed(slackUserId)) {
      return {
        isError: true,
        text: `Blocked: "${name}" creates or changes something outside this thread, and this user is not on Tendi's write allowlist. Niels or Jonas can run it, or ask Niels to add this Slack ID to TENDI_WRITE_ALLOWLIST.`,
      };
    }
    if (name === "workspace_update") {
      const { changed } = applyWorkspaceUpdate(state.workspace, input);
      const saved = saveThread(state);
      return { isError: false, text: JSON.stringify({ updated: changed, persisted: saved && statePersistent(), workspace: state.workspace }) };
    }
    if (name === "workspace_reset") {
      const previous = state.workspace.client || "(no client set)";
      state.workspace = emptyWorkspace();
      state.sources = [];
      state.workspace.notes = `Reset on ${new Date().toISOString().slice(0, 10)}; previous proposal: ${previous}. Reason: ${String(input?.reason || "not given").slice(0, 300)}`;
      saveThread(state);
      return { isError: false, text: JSON.stringify({ reset: true, previous_client: previous }) };
    }
    if (name === "read_source") {
      const srcs = state.sources;
      if (!srcs.length) return { isError: true, text: "This thread has no attached sources." };
      let s = undefined as (typeof srcs)[number] | undefined;
      if (input?.name) {
        const q = String(input.name).toLowerCase();
        s = srcs.find((x) => x.name.toLowerCase() === q) || srcs.find((x) => x.name.toLowerCase().includes(q));
      }
      if (!s && input?.index) s = srcs[Number(input.index) - 1];
      if (!s && srcs.length === 1) s = srcs[0];
      if (!s) return { isError: true, text: `No source matched. Available: ${srcs.map((x, i) => `${i + 1}. ${x.name}`).join("; ")}` };
      const offset = Math.max(0, Number(input?.offset) || 0);
      const length = Math.min(60000, Math.max(500, Number(input?.length) || 20000));
      const slice = s.text.slice(offset, offset + length);
      return {
        isError: false,
        text: JSON.stringify({ name: s.name, total_chars: s.chars, offset, returned_chars: slice.length, has_more: offset + slice.length < s.chars, text: slice }),
      };
    }
    if (name === "date_info") {
      return { isError: false, text: JSON.stringify(dateInfo(input)) };
    }
    if (name === "build_docx") {
      try {
        const filename = safeFilename(String(input?.filename || ""), `${state.workspace.client || "Peak Nine"} - Proposal.docx`);
        const buffer = await buildDocx(input?.spec);
        const up = await uploadToThread(ctx.channel, ctx.threadTs, filename, buffer, `📄 ${filename}`);
        if (up.permalink) {
          state.workspace.links[`docx:${filename}`] = up.permalink;
          saveThread(state);
        }
        return { isError: false, text: JSON.stringify({ uploaded: up.ok, filename, bytes: buffer.length, permalink: up.permalink, note: "The file is in the thread. Mention it by name; do not paste the whole document again." }) };
      } catch (e: any) {
        return { isError: true, text: `build_docx failed: ${e?.message || e}` };
      }
    }
    if (name === "deliver_canva_pdf") {
      if (!canva || !canva.connected()) return { isError: true, text: "Canva is not connected, so Tendi cannot export. Export the PDF from Canva by hand, or connect Canva first (canva_status)." };
      const designId = String(input?.design_id || "").trim();
      if (!/^D[A-Za-z0-9_-]{10}$/.test(designId)) return { isError: true, text: `"${designId}" is not a Canva design id (11 characters, starts with D).` };
      if (TEMPLATE_IDS.has(designId)) return { isError: true, text: "That is a master template. Export the filled copy instead." };
      const tool = ["canva_export-design", "canva_export_design"].find((t) => canva!.has(t));
      if (!tool) return { isError: true, text: "Canva's export tool is not available on this connection. Export from Canva by hand." };
      const format: any = { type: "pdf" };
      if (Array.isArray(input?.pages) && input.pages.length) format.pages = input.pages.map(Number).filter((n: number) => n >= 1);
      if (input?.size) format.size = String(input.size);
      const res = await canva.call(tool, { design_id: designId, format, user_intent: "Export the filled proposal design as a PDF for the Slack thread" });
      if (res.isError) return { isError: true, text: `Canva export failed: ${res.text.slice(0, 500)}` };
      const url = pickDownloadUrl(res.text);
      if (!url) return { isError: true, text: `Canva did not return a download link. Its answer: ${res.text.slice(0, 500)}` };
      try {
        const pdf = await downloadPdf(url);
        const base = String(input?.filename || `${state.workspace.client || "Peak Nine"} - Proposal`).replace(/\.(pdf|docx)$/i, "");
        const name2 = safeFilename(`${base}.docx`).replace(/\.docx$/i, ".pdf");
        const up = await uploadToThread(ctx.channel, ctx.threadTs, name2, pdf, `📕 ${name2}`);
        if (up.permalink) {
          state.workspace.links[`pdf:${name2}`] = up.permalink;
          saveThread(state);
        }
        return { isError: false, text: JSON.stringify({ uploaded: up.ok, filename: name2, bytes: pdf.length, permalink: up.permalink, design_id: designId, note: "The PDF is in the thread. Mention it by name." }) };
      } catch (e: any) {
        return { isError: true, text: `Exported, but the download or upload failed: ${e?.message || e}. The export link (valid for a limited time): ${url}` };
      }
    }
    if (name === "canva_status") {
      if (!canva) {
        return { isError: false, text: JSON.stringify({ configured: false, connected: false, how_to_enable: "Set PUBLIC_BASE_URL and TENDI_ADMIN_KEY on the Tendi service, redeploy, then open /canva/connect?key=... once." }) };
      }
      const st = canva.status();
      return {
        isError: false,
        text: JSON.stringify({
          ...st,
          tools: canva.tools.map((t) => t.name),
          how_to_connect: st.connected ? undefined : `An admin opens ${publicBaseUrl}/canva/connect?key=<TENDI_ADMIN_KEY> in a browser and logs in to Canva once.`,
        }),
      };
    }
    if (name.startsWith("teamleader_")) {
      if (!teamleader) return { isError: true, text: "Teamleader is not configured on this Tendi instance." };
      return teamleader.call(name, input);
    }
    if (name.startsWith("canva_")) {
      if (!canva) return { isError: true, text: "Canva is not configured on this Tendi instance." };
      const blocked = masterTemplateGuard(name, input);
      if (blocked) return { isError: true, text: blocked };
      return canva.call(name, input);
    }
    return { isError: true, text: `Unknown tool ${name}.` };
  }

  // Map the asking Slack user to a name + email.
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

  async function ask(userText: string, slackUserId: string, state: ThreadState, ctx: TurnCtx, identity?: { name: string; email: string } | null): Promise<string> {
    const messages: Anthropic.MessageParam[] = [...trimHistory(state.history), { role: "user", content: userText }];

    const system: Anthropic.TextBlockParam[] = [{ type: "text", text: STATIC_SYSTEM, cache_control: { type: "ephemeral" } }];
    const dyn: string[] = [];
    dyn.push(`Today's date (UTC): ${new Date().toISOString().slice(0, 10)}.`);
    if (identity && (identity.email || identity.name)) {
      dyn.push(`You are talking to: ${identity.name || "a Peak Nine teammate"}${identity.email ? ` (${identity.email})` : ""}. Slack user id ${slackUserId}.`);
    } else {
      dyn.push(`You are talking to Slack user ${slackUserId}.`);
    }
    dyn.push(`Writes allowed for this user: ${writeAllowed(slackUserId) ? "yes" : "no (drafting only)"}.`);
    dyn.push(`Teamleader: ${teamleader ? "available" : "not configured"}. Canva: ${canva ? (canva.connected() ? "connected" : "configured, not connected") : "not configured"}. Web search: ${WEB_SEARCH ? "on" : "off"}.`);
    dyn.push(`Thread persistence to disk: ${statePersistent() ? "on" : "OFF (state is lost on redeploy; say so if it matters)"}.`);
    dyn.push(ctx.threadTs ? "This conversation is a channel thread: one proposal per thread." : "This conversation is a direct message: one running proposal at a time; use workspace_reset when a clearly new proposal starts.");
    dyn.push("", "Workspace (what you already know about THIS proposal):", describeWorkspace(state));
    system.push({ type: "text", text: dyn.join("\n") });

    let finalText = "";
    for (let step = 0; step < MAX_STEPS; step++) {
      const resp = await anthropic.messages.create(
        {
          model: MODEL,
          max_tokens: MAX_TOKENS,
          system,
          tools: currentTools(),
          messages,
        },
        { timeout: 600_000 }
      );

      const cu = resp.usage as any;
      if (cu) {
        console.log(`[cache] read=${cu.cache_read_input_tokens ?? 0} write=${cu.cache_creation_input_tokens ?? 0} fresh_input=${cu.input_tokens ?? 0} output=${cu.output_tokens ?? 0} search=${cu.server_tool_use?.web_search_requests ?? 0}`);
      }
      recordUsage(MODEL, resp.usage, { thread: state.key });

      if (resp.stop_reason === "tool_use") {
        messages.push({ role: "assistant", content: resp.content });
        const toolResults: Anthropic.ToolResultBlockParam[] = [];
        for (const block of resp.content) {
          if (block.type === "tool_use") {
            let out: { text: string; isError: boolean };
            try {
              out = await withTimeout(callTool(block.name, block.input, slackUserId, state, ctx), 180_000, `Tool ${block.name}`);
            } catch (e: any) {
              out = { isError: true, text: `Tool ${block.name} did not finish: ${e?.message || e}` };
            }
            toolResults.push({ type: "tool_result", tool_use_id: block.id, content: out.text.slice(0, 80_000), is_error: out.isError });
          }
        }
        messages.push({ role: "user", content: toolResults });
        continue;
      }

      finalText += resp.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("");

      if (resp.stop_reason === "max_tokens") {
        messages.push({ role: "assistant", content: resp.content });
        continue;
      }
      break;
    }

    finalText = finalText.trim();
    if (!finalText) finalText = "I took too many steps without finishing. Tell me which part to continue with.";

    state.history = trimHistory([...state.history, { role: "user", content: userText }, { role: "assistant", content: finalText }]);
    saveThread(state);
    return finalText;
  }

  async function deliver(say: any, ack: any, text: string, threadTs: string | undefined): Promise<void> {
    const chunks = chunkText(text);
    if (!chunks.length) chunks.push("Done.");
    let start = 0;
    if (ack?.ts && ack?.channel) {
      try {
        await slackWeb.chat.update({ channel: ack.channel, ts: ack.ts, text: chunks[0] });
        start = 1;
      } catch {
        /* post everything below as new messages */
      }
    }
    for (let i = start; i < chunks.length; i++) {
      await say({ text: chunks[i], ...(threadTs ? { thread_ts: threadTs } : {}) });
    }
  }

  // ── Slack wiring ─────────────────────────────────────────────────────────
  const receiver = new ExpressReceiver({ signingSecret: slackSigningSecret });
  const app = new App({ token: slackBotToken, receiver });
  slackWeb = app.client;

  function adminOk(req: any, res: any): boolean {
    if (!adminKey) {
      res.status(404).send("Disabled (set TENDI_ADMIN_KEY).");
      return false;
    }
    if (req.query.key !== adminKey) {
      res.status(401).send("Unauthorized");
      return false;
    }
    return true;
  }

  receiver.router.get("/healthz", (_req: any, res: any) => {
    const sc = scoutConfig();
    res.json({
      ok: true,
      model: MODEL,
      teamleader: !!teamleader,
      canva: canva ? canva.status() : { configured: false },
      persistent: statePersistent(),
      scout: { enabled: sc.enabled, channel_set: !!sc.channel, time: sc.time, tz: sc.tz },
    });
  });

  receiver.router.get("/usage", (req: any, res: any) => {
    if (!adminOk(req, res)) return;
    res.json(summarizeUsage());
  });

  receiver.router.get("/canva/status", (req: any, res: any) => {
    if (!adminOk(req, res)) return;
    res.json(canva ? { ...canva.status(), tools: canva.tools.map((t) => t.name) } : { configured: false });
  });

  receiver.router.get("/canva/connect", async (req: any, res: any) => {
    if (!adminOk(req, res)) return;
    if (!canva) {
      res.status(400).send("Canva is not configured: set PUBLIC_BASE_URL on this service.");
      return;
    }
    // Canva's MCP login only redirects back to known apps or to localhost, so on a hosted
    // instance the browser flow ends in "Invalid redirect URI". Explain the working route
    // unless the caller insists (?force=1), e.g. when running Tendi locally on localhost.
    const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/i.test(publicBaseUrl);
    if (!isLocal && req.query.force !== "1" && !canva.provider.hasTokens()) {
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.send(
        [
          "Canva login for a hosted Tendi works through a laptop, not through this page.",
          "",
          "Canva's MCP login only redirects back to known apps or to localhost, so a redirect to this host is refused",
          '("Invalid redirect URI"). Do this once instead:',
          "",
          "  1. On a computer with the repo: npm install && npm run tendi:canva-login",
          "  2. Approve Tendi in the browser window that opens (log in to the Peak Nine Canva account).",
          "  3. Copy the printed CANVA_OAUTH_JSON value into this service's environment on Render and save.",
          "  4. After the redeploy, /healthz shows canva.connected: true.",
          "",
          "Add ?force=1 to this URL to attempt the browser redirect anyway.",
        ].join("\n")
      );
      return;
    }
    try {
      const r = await canva.beginAuth();
      if (r.connected) {
        res.send(`Canva is connected. ${canva.tools.length} tools available. You can close this tab.`);
        return;
      }
      if (!r.redirect) {
        res.status(500).send("Canva did not return an authorization URL.");
        return;
      }
      res.redirect(r.redirect);
    } catch (e: any) {
      console.error("Canva connect failed:", e);
      res.status(500).send(`Canva login could not start: ${e?.message || e}`);
    }
  });

  receiver.router.get("/canva/callback", async (req: any, res: any) => {
    if (!canva) {
      res.status(400).send("Canva is not configured.");
      return;
    }
    const code = typeof req.query.code === "string" ? req.query.code : "";
    const state = typeof req.query.state === "string" ? req.query.state : undefined;
    if (req.query.error) {
      res.status(400).send(`Canva returned an error: ${req.query.error} ${req.query.error_description || ""}`);
      return;
    }
    if (!code) {
      res.status(400).send("Missing authorization code.");
      return;
    }
    try {
      await canva.finishAuth(code, state);
      console.log(`Canva connected. ${canva.tools.length} tools available.`);
      res.send(`Canva connected. ${canva.tools.length} tools are now available to Tendi. You can close this tab.`);
    } catch (e: any) {
      console.error("Canva callback failed:", e);
      res.status(500).send(`Canva login failed: ${e?.message || e}`);
    }
  });

  receiver.router.get("/canva/export", (req: any, res: any) => {
    if (!adminOk(req, res)) return;
    if (process.env.TENDI_ALLOW_TOKEN_EXPORT !== "1") {
      res.status(404).send("Disabled (set TENDI_ALLOW_TOKEN_EXPORT=1 to allow exporting the Canva tokens for seeding CANVA_OAUTH_JSON).");
      return;
    }
    if (!canva) {
      res.status(400).send("Canva is not configured.");
      return;
    }
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.send(canva.provider.exportJson());
  });

  // Dedupe Slack retries (Slack resends an event if it doesn't get a fast 200).
  const seen = new Set<string>();
  function firstTime(id: string): boolean {
    if (seen.has(id)) return false;
    seen.add(id);
    if (seen.size > 2000) seen.clear();
    return true;
  }

  async function fetchMessageFiles(channel: string, ts: string): Promise<SlackFileRef[]> {
    try {
      const r: any = await slackWeb.conversations.replies({ channel, ts, limit: 1, inclusive: true });
      const msg = (r?.messages || []).find((m: any) => m?.ts === ts) || r?.messages?.[0];
      return Array.isArray(msg?.files) ? msg.files : [];
    } catch {
      return [];
    }
  }

  async function ingestFiles(files: SlackFileRef[], state: ThreadState): Promise<ExtractedFile[]> {
    const out: ExtractedFile[] = [];
    for (const f of files.slice(0, 10)) {
      let x: ExtractedFile;
      try {
        const buf = await downloadSlackFile(f, slackBotToken);
        x = await extractText(f, buf);
      } catch (e: any) {
        x = { name: f.name || f.title || "attachment", ok: false, text: "", chars: 0, note: `download failed: ${e?.message || e}` };
      }
      if (x.ok) {
        // Replace an earlier version with the same name.
        state.sources = state.sources.filter((s) => s.name !== x.name);
        state.sources.push({ name: x.name, chars: x.chars, text: x.text, added: Date.now() });
      }
      out.push(x);
    }
    if (out.some((x) => x.ok)) saveThread(state);
    return out;
  }

  // Conversation model:
  //   - In a DM, Tendi behaves like Pidgi: ONE running conversation per DM (state keyed on the
  //     DM channel), replies where you wrote (top level, or inside a thread if you are in one).
  //     A clearly new proposal in the same DM is handled by the model with workspace_reset.
  //   - In a channel, an @mention starts (or continues) a thread, and that thread IS the proposal:
  //     state keyed on channel:thread root, replies always inside the thread, follow-ups continue
  //     without a fresh @mention.
  async function handle(e: any, say: any, files: SlackFileRef[], isDm: boolean): Promise<void> {
    const channel: string = e.channel;
    const user: string = e.user;
    const rootTs: string = isDm ? "dm" : e.thread_ts || e.ts;
    const replyThreadTs: string | undefined = isDm ? e.thread_ts : rootTs;
    let state = loadThread(channel, rootTs);
    const isNew = !state;
    if (!state) {
      state = newThread(channel, rootTs);
      saveThread(state); // so a quick follow-up in the thread is recognised while this turn runs
    }
    const ctx: TurnCtx = { channel, threadTs: replyThreadTs };

    const cleaned = cleanSlackText(e.text || "", botUserId);
    if (!cleaned && !files.length) {
      await say({ text: "Send me a briefing, a tender or meeting notes (text or a PDF/Word attachment) and I'll start the proposal here.", thread_ts: replyThreadTs });
      return;
    }

    let ack: any = null;
    try {
      ack = await say({ text: isNew && !isDm ? "📝 On it. I'm reading this and will run the proposal in this thread." : "📝 On it…", thread_ts: replyThreadTs });
    } catch {
      /* deliver below */
    }

    try {
      const extracted = files.length ? await ingestFiles(files, state) : [];
      const parts: string[] = [];
      // First message to Tendi in a Scout digest thread: pass the tenders posted there.
      if (isNew && !isDm) {
        const digest = itemsForDigest(channel, rootTs);
        if (digest && digest.length) parts.push(scoutDigestBlock(digest));
      }
      if (cleaned) parts.push(cleaned);
      for (const x of extracted) parts.push(inlineBlock(x));
      const userText = parts.join("\n\n");

      const identity = await resolveIdentity(user);
      const answer = await ask(userText, user, state, ctx, identity);
      await deliver(say, ack, answer, replyThreadTs);
    } catch (err: any) {
      const msg = `Something went wrong: ${err?.message || err}`;
      console.error(msg);
      if (ack?.ts && ack?.channel) {
        try {
          await slackWeb.chat.update({ channel: ack.channel, ts: ack.ts, text: msg });
          return;
        } catch {
          /* fall through */
        }
      }
      await say({ text: msg, thread_ts: replyThreadTs });
    }
  }

  // ── Scout: daily tender digest, feedback, and the "Start a proposal" handoff ──
  async function startFromScout({ channel, userId, record }: { channel: string; userId: string; record: SeenRecord }): Promise<void> {
    const intro: any = await slackWeb.chat.postMessage({
      channel,
      text: `📝 <@${userId}> asked me to start a proposal for *${record.title}*${record.buyer ? ` (${record.buyer})` : ""}. I'll work on it in this thread.`,
      unfurl_links: false,
      unfurl_media: false,
    });
    const rootTs: string = intro?.ts;
    if (!rootTs) return;
    const state = newThread(channel, rootTs);
    saveThread(state);
    const say = (args: any) => slackWeb.chat.postMessage({ channel, unfurl_links: false, ...args });
    let ack: any = null;
    try {
      ack = await say({ text: "📝 Reading the notice…", thread_ts: rootTs });
    } catch {
      /* deliver below */
    }
    try {
      const identity = await resolveIdentity(userId);
      const text = `${scoutItemBlock(record)}\n\nStart a proposal for this tender. Read the notice first, then tell me which proposal type fits and what you still need from us.`;
      const answer = await ask(text, userId, state, { channel, threadTs: rootTs }, identity);
      await deliver(say, ack, answer, rootTs);
    } catch (err: any) {
      const msg = `Something went wrong: ${err?.message || err}`;
      console.error(msg);
      await say({ text: msg, thread_ts: rootTs });
    }
  }

  startScoutService({ app, router: receiver.router, anthropic, adminOk, startProposal: startFromScout });

  app.event("app_mention", async ({ event, say }) => {
    const e: any = event;
    if (!firstTime(`${e.channel}:${e.ts}`)) return;
    const files = Array.isArray(e.files) && e.files.length ? e.files : await fetchMessageFiles(e.channel, e.ts);
    await handle(e, say, files, false);
  });

  app.event("message", async ({ event, say }) => {
    const e: any = event;
    if (e.bot_id || (botUserId && e.user === botUserId)) return;
    if (e.subtype && e.subtype !== "file_share") return;
    const mentionsBot = !!botUserId && typeof e.text === "string" && e.text.includes(`<@${botUserId}>`);
    const isDm = e.channel_type === "im";
    // Channel messages that mention Tendi arrive as app_mention too; let that handler own them.
    if (!isDm && mentionsBot) return;
    if (!firstTime(`${e.channel}:${e.ts}`)) return;
    const files: SlackFileRef[] = Array.isArray(e.files) ? e.files : [];
    if (isDm) {
      await handle(e, say, files, true);
      return;
    }
    // In a channel, only continue threads Tendi already works in.
    if (e.thread_ts && threadExists(e.channel, e.thread_ts)) {
      await handle(e, say, files, false);
    }
  });

  try {
    const who: any = await slackWeb.auth.test();
    botUserId = who?.user_id || "";
    console.log(`Slack bot user: ${who?.user || "?"} (${botUserId})`);
  } catch (e: any) {
    console.error(`auth.test failed (mention detection degraded): ${e?.message || e}`);
  }

  await app.start(PORT);
  console.log(`⚡ Tendi running on port ${PORT} (Events API). Request URL: https://<your-host>/slack/events`);
  if (WRITE_ALLOWLIST.length === 0) {
    console.log("WARNING: TENDI_WRITE_ALLOWLIST is empty: every user can trigger Teamleader and Canva writes.");
  } else {
    console.log(`Writes limited to ${WRITE_ALLOWLIST.length} allowlisted user(s).`);
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  });
}
