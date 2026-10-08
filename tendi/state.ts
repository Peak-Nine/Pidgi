/**
 * Tendi thread state: one proposal = one Slack thread = one JSON file on disk.
 *
 * Each thread keeps a clean, text-only conversation history plus a structured
 * "workspace" (proposal type, client, facts, decisions, open items, draft status,
 * links) and the text of every attachment that was dropped into the thread.
 *
 * Persistence: TENDI_DATA_DIR if set, else /var/data (Render persistent disk) if
 * present, else the OS temp dir. Only the first two survive a restart/redeploy.
 * All file I/O is wrapped so a disk hiccup can never take the bot down.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from "fs";
import path from "path";
import os from "os";
import type Anthropic from "@anthropic-ai/sdk";

export type ProposalType = "proof-of-change" | "new-proposal" | "rfp-philea" | "unknown";

export interface Workspace {
  proposal_type: ProposalType;
  client: string;
  facts: Record<string, string>;
  decisions: Record<string, string>;
  open_items: string[];
  draft_status: string;
  links: Record<string, string>;
  notes: string;
}

export interface SourceDoc {
  name: string;
  chars: number;
  text: string;
  added: number;
}

export interface ThreadState {
  key: string;
  channel: string;
  rootTs: string;
  createdAt: number;
  updatedAt: number;
  history: Anthropic.MessageParam[];
  workspace: Workspace;
  sources: SourceDoc[];
}

export const HISTORY_MAX = Number(process.env.TENDI_HISTORY_MAX) || 40;
// Keep the stored history bounded in characters too, so a long proposal thread
// never pushes the prompt past the context window.
export const HISTORY_MAX_CHARS = Number(process.env.TENDI_HISTORY_MAX_CHARS) || 180_000;

export function dataDir(): string {
  if (process.env.TENDI_DATA_DIR) return process.env.TENDI_DATA_DIR;
  try {
    if (existsSync("/var/data")) return "/var/data";
  } catch {
    /* ignore */
  }
  return path.join(os.tmpdir(), "tendi");
}

export function statePersistent(): boolean {
  return !!process.env.TENDI_DATA_DIR || dataDir() === "/var/data";
}

function threadsDir(): string {
  const d = path.join(dataDir(), "tendi-threads");
  try {
    mkdirSync(d, { recursive: true });
  } catch {
    /* ignore */
  }
  return d;
}

export function threadKey(channel: string, rootTs: string): string {
  return `${channel}:${rootTs}`;
}

function fileFor(key: string): string {
  return path.join(threadsDir(), key.replace(/[^A-Za-z0-9_.:-]/g, "_").replace(/:/g, "__") + ".json");
}

export function emptyWorkspace(): Workspace {
  return {
    proposal_type: "unknown",
    client: "",
    facts: {},
    decisions: {},
    open_items: [],
    draft_status: "new",
    links: {},
    notes: "",
  };
}

export function newThread(channel: string, rootTs: string): ThreadState {
  const now = Date.now();
  return {
    key: threadKey(channel, rootTs),
    channel,
    rootTs,
    createdAt: now,
    updatedAt: now,
    history: [],
    workspace: emptyWorkspace(),
    sources: [],
  };
}

export function loadThread(channel: string, rootTs: string): ThreadState | null {
  try {
    const raw = readFileSync(fileFor(threadKey(channel, rootTs)), "utf8");
    const j = JSON.parse(raw);
    if (!j || typeof j !== "object") return null;
    return {
      ...newThread(channel, rootTs),
      ...j,
      workspace: { ...emptyWorkspace(), ...(j.workspace || {}) },
      history: Array.isArray(j.history) ? j.history : [],
      sources: Array.isArray(j.sources) ? j.sources : [],
    };
  } catch {
    return null;
  }
}

export function threadExists(channel: string, rootTs: string): boolean {
  try {
    return existsSync(fileFor(threadKey(channel, rootTs)));
  } catch {
    return false;
  }
}

export function saveThread(state: ThreadState): boolean {
  try {
    state.updatedAt = Date.now();
    state.history = trimHistory(state.history);
    writeFileSync(fileFor(state.key), JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function listThreadKeys(): string[] {
  try {
    return readdirSync(threadsDir())
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.slice(0, -5).replace(/__/g, ":"));
  } catch {
    return [];
  }
}

// Keep the last HISTORY_MAX messages and at most HISTORY_MAX_CHARS characters,
// always starting on a user turn so the alternation stays valid.
export function trimHistory(history: Anthropic.MessageParam[]): Anthropic.MessageParam[] {
  let h = history.slice(-HISTORY_MAX);
  const size = (m: Anthropic.MessageParam) =>
    typeof m.content === "string" ? m.content.length : JSON.stringify(m.content).length;
  let total = h.reduce((n, m) => n + size(m), 0);
  while (h.length > 2 && total > HISTORY_MAX_CHARS) {
    const dropped = h.shift()!;
    total -= size(dropped);
  }
  while (h.length && h[0].role !== "user") h.shift();
  return h;
}

/**
 * Apply a partial update coming from the model's `workspace_update` tool.
 * Maps are merged key by key (an empty string value deletes the key); open_items
 * replaces the whole list when given; scalars overwrite when given.
 */
export function applyWorkspaceUpdate(ws: Workspace, input: any): { changed: string[] } {
  const changed: string[] = [];
  if (!input || typeof input !== "object") return { changed };
  const types: ProposalType[] = ["proof-of-change", "new-proposal", "rfp-philea", "unknown"];
  if (typeof input.proposal_type === "string" && types.includes(input.proposal_type)) {
    ws.proposal_type = input.proposal_type;
    changed.push("proposal_type");
  }
  if (typeof input.client === "string") {
    ws.client = input.client.trim();
    changed.push("client");
  }
  for (const mapKey of ["facts", "decisions", "links"] as const) {
    const m = input[mapKey];
    if (m && typeof m === "object" && !Array.isArray(m)) {
      for (const [k, v] of Object.entries(m)) {
        const key = String(k).trim().slice(0, 120);
        if (!key) continue;
        if (v === null || v === "" || v === undefined) delete ws[mapKey][key];
        else ws[mapKey][key] = String(v).slice(0, 4000);
      }
      changed.push(mapKey);
    }
  }
  if (Array.isArray(input.open_items)) {
    ws.open_items = input.open_items.map((x: any) => String(x).slice(0, 500)).filter(Boolean).slice(0, 100);
    changed.push("open_items");
  }
  if (typeof input.draft_status === "string") {
    ws.draft_status = input.draft_status.slice(0, 200);
    changed.push("draft_status");
  }
  if (typeof input.notes === "string") {
    ws.notes = input.notes.slice(0, 20000);
    changed.push("notes");
  }
  return { changed };
}

/** Compact, model-facing summary of the workspace (goes into the dynamic system block). */
export function describeWorkspace(state: ThreadState): string {
  const ws = state.workspace;
  const lines: string[] = [];
  lines.push(`proposal_type: ${ws.proposal_type}`);
  lines.push(`client: ${ws.client || "(not set)"}`);
  lines.push(`draft_status: ${ws.draft_status}`);
  const kv = (title: string, m: Record<string, string>) => {
    const keys = Object.keys(m);
    if (!keys.length) return `${title}: (none)`;
    return `${title}:\n` + keys.map((k) => `  - ${k}: ${m[k]}`).join("\n");
  };
  lines.push(kv("facts", ws.facts));
  lines.push(kv("decisions", ws.decisions));
  lines.push(ws.open_items.length ? "open_items:\n" + ws.open_items.map((x) => `  - ${x}`).join("\n") : "open_items: (none)");
  lines.push(kv("links", ws.links));
  if (ws.notes) lines.push(`notes: ${ws.notes}`);
  if (state.sources.length) {
    lines.push(
      "attached sources (read in full with read_source):\n" +
        state.sources.map((s, i) => `  ${i + 1}. ${s.name} (${s.chars} chars)`).join("\n")
    );
  } else {
    lines.push("attached sources: (none)");
  }
  return lines.join("\n");
}
