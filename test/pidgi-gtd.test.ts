/**
 * GTD: "GTD" in Niels's DM → the recording (summary, notes and full transcript) → two Claude
 * passes → one overview message with checkboxes per board → "Add selected" writes the ticked
 * ones. With fake Notion, Slack and Claude.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import os from "os";
import fs from "fs";
import path from "path";

process.env.PIDGI_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "pidgi-gtd-"));
const MS_DS = "2d3c675ff9588031805c000b7f320c36"; // Mothership's Pending Tasks

const RDS = "402c675ff958802b865a000b1f175a8c"; // 🎙️ Recordings data source
const n = (id: string) => String(id).replace(/-/g, "").toLowerCase();
const notFound = () => Object.assign(new Error("Could not find object"), { code: "object_not_found" });

// Recording rows, newest first, and their blocks (a meeting-notes block pointing to summary + transcript).
const ROWS: any[] = [];
const CHILDREN: Record<string, any[]> = {};
const updates: any[] = [];
const created: any[] = [];
let schemaPatched = false;
let listError: any = null;
// Rows already on the boards, by database id (Mothership by key), for the duplicate check.
const titled = (prop: string, title: string, extra: any = {}) => ({ properties: { [prop]: { type: "title", title: [{ plain_text: title }] }, ...extra } });
const OPEN: Record<string, any[]> = {};

function row(id: string, title: string, created_time: string, done = false) {
  return {
    id,
    url: `https://www.notion.so/${id}`,
    created_time,
    parent: { type: "data_source_id", data_source_id: RDS },
    properties: { Name: { type: "title", title: [{ plain_text: title }] }, ...(done ? { GTD: { type: "checkbox", checkbox: true } } : {}) },
  };
}
const p = (text: string, type = "paragraph") => ({ id: Math.random().toString(16).slice(2), type, has_children: false, [type]: { rich_text: [{ plain_text: text }] } });
function meeting(rowId: string, title: string, summary: string[], transcript: string[]) {
  const sum = `${rowId}s`;
  const tr = `${rowId}t`;
  CHILDREN[n(rowId)] = [
    { id: `${rowId}m`, type: "transcription", has_children: false, transcription: { title: [{ plain_text: title }], children: { summary_block_id: sum, transcript_block_id: tr } } },
  ];
  CHILDREN[sum] = summary.map((t) => (t.startsWith("### ") ? p(t.slice(4), "heading_3") : t.startsWith("- [ ] ") ? p(t.slice(6), "to_do") : p(t)));
  CHILDREN[tr] = transcript.map((t) => p(t));
}

const fakeNotion = {
  request: async ({ path, method, body }: any) => {
    if (path === `data_sources/${RDS}/query`) {
      if (listError) throw listError;
      return { results: ROWS.slice(0, body.page_size) };
    }
    if (path === `data_sources/${RDS}` && method === "patch") return (schemaPatched = true), {};
    if (path === `data_sources/${MS_DS}/query`) return { results: OPEN.mothership };
    if (path.startsWith("data_sources/")) return { properties: { Project: { multi_select: { options: [{ name: "P9 - Sales" }, { name: "Enabel" }] } } } };
    throw new Error(`unexpected ${method} ${path}`);
  },
  blocks: { children: { list: async ({ block_id }: any) => ({ results: CHILDREN[n(block_id)] || [], has_more: false }) } },
  pages: {
    retrieve: async ({ page_id }: any) => {
      const r = ROWS.find((x) => n(x.id) === n(page_id));
      if (r) return r;
      throw notFound();
    },
    update: async (args: any) => {
      updates.push(args);
      return { id: args.page_id };
    },
    create: async (args: any) => (created.push(args), { id: "new", url: "https://www.notion.so/new" }),
  },
};
vi.mock("../slackbot/notion.js", () => ({
  notionDataSourceClient: () => fakeNotion,
  notionClient: () => ({
    databases: {
      retrieve: async () => ({ properties: { Project: { select: { options: [{ name: "Takeda" }] } } } }),
      query: async ({ database_id }: any) => ({ results: OPEN[database_id] || [] }),
    },
    pages: { create: async (args: any) => (created.push(args), { id: "new", url: "https://www.notion.so/new" }) },
  }),
}));
vi.mock("../slackbot/usage.js", () => ({ recordUsage: () => {} }));

import { parseGtd, matchesQuery, readRecording, pickRecording, pickProblem, bareNotionLink, isRecordingPage, hasContent } from "../slackbot/recordings.js";
import { runGtd, registerGtdActions, validateGtd, quoteFound, isClosed, selectedFromState, priceOf, G } from "../slackbot/gtd.js";
import { hiddenNotionIds, DEFAULT_BOARDS, DEFAULT_TEAM } from "../slackbot/taskboards.js";

const USERS: Record<string, any> = {
  UNIELS: { real_name: "Niels Van Espen", profile: { email: "niels@peaknine.studio" } },
};
function fakeSlack() {
  const calls: Record<string, any[]> = {};
  const log = (k: string, a: any) => ((calls[k] ||= []).push(a), a);
  let i = 0;
  return {
    calls,
    users: { info: async ({ user }: any) => ({ user: USERS[user] }) },
    chat: {
      postMessage: async (a: any) => (log("postMessage", a), { ts: `9.${++i}`, channel: a.channel }),
      update: async (a: any) => (log("update", a), { ok: true }),
      postEphemeral: async (a: any) => (log("ephemeral", a), { ok: true }),
    },
  };
}
/** Fake Claude for GTD: answers each streamed request with the next JSON in `replies`. */
function fakeClaude(replies: any[]) {
  const seen: any[] = [];
  const stream = (req: any) => {
    seen.push(req);
    const r = replies.shift();
    return {
      finalMessage: async () => {
        if (r instanceof Error) throw r;
        return { model: req.model, stop_reason: "end_turn", content: [{ type: "text", text: JSON.stringify(r) }], usage: { input_tokens: 20000, output_tokens: 1500, cache_read_input_tokens: 0 } };
      },
    };
  };
  return { seen, messages: { stream }, beta: { messages: { stream } } };
}
const deps = (claude: any) => ({ anthropic: claude as any, model: "m", botUserId: "UBOT", canConfirm: (u: string, r: string) => u === r });
const task = (o: any) => ({ board: "mothership", title: "x", context: "", evidence: "", deadline: "", deadline_quote: "", project: "", responsible: "", ...o });

beforeEach(() => {
  ROWS.length = 0;
  for (const k of Object.keys(CHILDREN)) delete CHILDREN[k];
  updates.length = 0;
  created.length = 0;
  schemaPatched = false;
  listError = null;
  for (const k of Object.keys(OPEN)) delete OPEN[k];
  // Newest first, like the real query.
  ROWS.push(row("aaaa0000000000000000000000000003", "Meeting ‣", "2026-10-23T14:00:00Z")); // empty
  ROWS.push(row("aaaa0000000000000000000000000002", "Meeting ‣", "2026-10-23T09:18:00Z"));
  ROWS.push(row("aaaa0000000000000000000000000001", "Meeting ‣", "2026-10-22T08:00:00Z", true)); // GTD done
  CHILDREN["aaaa0000000000000000000000000003"] = [];
  meeting(
    "aaaa0000000000000000000000000002",
    "Introductory Networking Call: Peak Nine & GIZ Namibia",
    ["### Action Items", "- [ ] Marie to introduce Peak Nine to the GIZ project manager", "- [ ] Niels to share the Peak Nine website URL via LinkedIn by Friday"],
    [
      "Marie: hello, thanks for making time today.",
      "Niels: I will share the Peak Nine website link with you on LinkedIn by Friday.",
      "Niels: And Laura could make a one-pager on Proof of Change that you can pass on to the project manager.",
      "Marie: Great, I will introduce you to the SME project manager next week.",
    ]
  );
  meeting("aaaa0000000000000000000000000001", "Bourguignon Strategy Review", ["### Action Items", "- [ ] Jonas to send the budget"], []);
});

describe("parseGtd", () => {
  it("reads the trigger, words and links", () => {
    expect(parseGtd("GTD")).toEqual({ query: null, pageId: null });
    expect(parseGtd("gtd GIZ namibia")).toEqual({ query: "GIZ namibia", pageId: null });
    expect(parseGtd("<@UBOT> GTD: Bourguignon")).toEqual({ query: "Bourguignon", pageId: null });
    for (const t of ["<@UBOT> - GTD", "- GTD", "— gtd", "<@UBOT>: GTD!", "*GTD*", "  GTD  "]) expect(parseGtd(t), t).toEqual({ query: null, pageId: null });
    expect(parseGtd("<@UBOT> - GTD GIZ")).toEqual({ query: "GIZ", pageId: null });
    expect(parseGtd("GTD <https://app.notion.com/p/402c675ff95880689421c2a0e902ad57?pvs=4|link>")).toEqual({
      query: null,
      pageId: "402c675ff95880689421c2a0e902ad57",
    });
    expect(parseGtd("GTD https://www.notion.so/Meeting-402c675f-f958-8068-9421-c2a0e902ad57")?.pageId).toBe("402c675ff95880689421c2a0e902ad57");
  });
  it("reads the right id from links whose title looks like hex, and bare links", () => {
    expect(parseGtd("GTD https://app.notion.com/p/Cafe-Deed-402c675ff95880689421c2a0e902ad57?v=402c675ff95880be8d88000c741fc97f")?.pageId).toBe(
      "402c675ff95880689421c2a0e902ad57"
    );
    expect(bareNotionLink("<https://app.notion.com/p/Thermo-Fisher-402c675ff95880689421c2a0e902ad57?v=1&source=copy_link>")).toBe("402c675ff95880689421c2a0e902ad57");
    expect(bareNotionLink("<@UBOT> <https://app.notion.com/p/402c675ff95880689421c2a0e902ad57|Thermo Fisher>")).toBe("402c675ff95880689421c2a0e902ad57");
    expect(bareNotionLink("look at <https://app.notion.com/p/402c675ff95880689421c2a0e902ad57>")).toBeNull();
    expect(bareNotionLink("https://example.com/x")).toBeNull();
  });
  it("ignores filler words like 'recording' when matching", () => {
    expect(matchesQuery("Thermo Fisher 2026-10-23T14:09", "Thermo Fisher recording")).toBe(true);
    expect(matchesQuery("Thermo Fisher", "the thermo fisher meeting of today")).toBe(true);
    expect(parseGtd("GTD recording")).toEqual({ query: null, pageId: null }); // just "the latest"
    expect(parseGtd("GTD laatste opname")).toEqual({ query: null, pageId: null });
  });
  it("understands GTD today", () => {
    expect(parseGtd("GTD today")).toEqual({ query: null, pageId: null, today: true });
    expect(parseGtd("<@UBOT> - gtd vandaag")).toEqual({ query: null, pageId: null, today: true });
    expect(parseGtd("GTD today's GIZ call")?.today).toBeUndefined();
  });
  it("ignores anything that doesn't start with GTD", () => {
    expect(parseGtd("let's go")).toBeNull();
    expect(parseGtd("what is gtd?")).toBeNull();
    expect(parseGtd("gtdx")).toBeNull();
  });
  it("matches words regardless of case and accents", () => {
    expect(matchesQuery("Réunion GIZ Namibia", "giz reunion")).toBe(true);
    expect(matchesQuery("Bourguignon review", "giz")).toBe(false);
  });
});

describe("reading a recording", () => {
  it("reads the summary and notes, and the full transcript separately", async () => {
    const c = await readRecording("aaaa0000000000000000000000000002");
    expect(c.title).toBe("Introductory Networking Call: Peak Nine & GIZ Namibia");
    expect(c.text).toContain("### Action Items");
    expect(c.text).toContain("- [ ] Niels to share the Peak Nine website URL via LinkedIn by Friday");
    expect(c.text).not.toContain("Marie: hello");
    expect(c.transcript).toContain("Niels: I will share the Peak Nine website link with you on LinkedIn by Friday.");
  });
  it("works from the transcript alone when there is no summary", async () => {
    meeting("aaaa0000000000000000000000000002", "Quick call", [], ["Niels: I'll send the deck to Sankhya tomorrow, she reviews it by Monday so we can finalise it."]);
    const c = await readRecording("aaaa0000000000000000000000000002");
    expect(c.text).toBe("");
    expect(c.transcript).toContain("send the deck");
    expect(hasContent(c)).toBe(true);
  });
});

describe("picking the recording", () => {
  it("takes the newest one with content that has no GTD yet", async () => {
    const r = await pickRecording({ query: null, pageId: null });
    expect(r.ok && r.row.id).toBe("aaaa0000000000000000000000000002");
  });
  it("finds a named one by its meeting title, even when GTD already ran", async () => {
    const r = await pickRecording({ query: "bourguignon", pageId: null });
    expect(r.ok && r.content.title).toBe("Bourguignon Strategy Review");
    expect((await pickRecording({ query: "takeda", pageId: null })).ok).toBe(false);
  });
  it("says a named recording is unreadable instead of 'no match'", async () => {
    ROWS.unshift(row("aaaa0000000000000000000000000004", "Thermo Fisher 2026-10-23T14:09", "2026-10-23T12:09:00Z"));
    CHILDREN["aaaa0000000000000000000000000004"] = [{ id: "x", type: "unsupported", has_children: false, unsupported: {} }];
    const r = await pickRecording({ query: "Thermo Fisher recording", pageId: null });
    expect(r).toEqual({ ok: false, reason: "unreadable", detail: "unsupported" });
    expect(pickProblem(r as any)).toContain("unsupported");
  });
  it("knows whether a pasted link is a recording", async () => {
    expect(await isRecordingPage("aaaa0000000000000000000000000002")).toBe(true);
    expect(await isRecordingPage("ffff0000000000000000000000000009")).toBe(false);
  });
  it("opens a linked one only when it is in Recordings", async () => {
    const r = await pickRecording({ query: null, pageId: "aaaa0000000000000000000000000002" });
    expect(r.ok).toBe(true);
    const away = await pickRecording({ query: null, pageId: "ffff0000000000000000000000000009" });
    expect(away).toMatchObject({ ok: false, reason: "no_access" });
  });
  it("says what to do when Pidgi can't open Recordings or everything is done", async () => {
    listError = Object.assign(new Error("no"), { code: "object_not_found" });
    const r = await pickRecording({ query: null, pageId: null });
    expect(r).toMatchObject({ ok: false, reason: "no_access" });
    expect(pickProblem(r as any)).toContain("Connections → add Pidgi");
    listError = null;
    ROWS[1].properties.GTD = { type: "checkbox", checkbox: true };
    expect(await pickRecording({ query: null, pageId: null })).toMatchObject({ ok: false, reason: "none_left" });
  });
});

const BOARDS5 = DEFAULT_BOARDS.filter((b) => ["mothership", "jonas", "touchdown", "sankhya", "laura"].includes(b.key));
const SOURCE = "Niels: I will share the Peak Nine website link with you on LinkedIn by Friday. Laura could make a one-pager on Proof of Change for the project manager.";

describe("checking what the model returned", () => {
  const opts = { boards: BOARDS5, projects: { mothership: ["P9 - Sales"] }, team: DEFAULT_TEAM, source: SOURCE, today: "2026-11-06", existing: { laura: ["Make a one-pager on Proof of Change"] } };
  it("keeps an item only when its quote is really in the recording", () => {
    expect(quoteFound("I will share the Peak Nine website link", SOURCE)).toBe(true);
    expect(quoteFound("i will SHARE the peak-nine website, link", SOURCE)).toBe(true); // punctuation and case don't count
    expect(quoteFound("I will share the website link", SOURCE)).toBe(false); // a word missing
    expect(quoteFound("by Friday", SOURCE)).toBe(false); // too short to prove anything
    const r = validateGtd(
      {
        tasks: [
          task({ title: "Share the website with Marie", evidence: "I will share the Peak Nine website link with you on LinkedIn", deadline: "2026-11-07", deadline_quote: "by Friday", project: "P9 - Sales" }),
          task({ title: "Invented task", evidence: "Niels promised to rebuild the whole website in a week" }),
          task({ board: "team", title: "Not a GTD board", evidence: "I will share the Peak Nine website link" }),
        ],
      },
      opts
    );
    expect(r.tasks.map((t) => t.title)).toEqual(["Share the website with Marie"]);
    expect(r.tasks[0]).toMatchObject({ deadline: "2026-11-07", deadlineQuote: "by Friday", project: "P9 - Sales", duplicateOf: null });
    expect(r.droppedNoQuote).toBe(1);
    expect(r.droppedOther).toBe(1);
  });
  it("needs a quote for a deadline, a real project, and matches duplicates to open tasks", () => {
    const r = validateGtd(
      {
        tasks: [
          task({ board: "laura", title: "Make a one-pager on Proof of Change", evidence: "Laura could make a one-pager on Proof of Change", duplicate_of: "make a one-pager on proof of change", deadline: "2026-11-10", deadline_quote: "next Monday" }),
          task({ board: "laura", title: "Make a one pager on Proof of Change!", evidence: "Laura could make a one-pager on Proof of Change", project: "Invented" }),
          task({ title: "Share the website", evidence: "I will share the Peak Nine website link", duplicate_of: "something not on the board" }),
        ],
      },
      opts
    );
    expect(r.tasks).toHaveLength(2); // the second laura item repeats the first
    expect(r.tasks[0]).toMatchObject({ duplicateOf: "Make a one-pager on Proof of Change", deadline: null, project: null });
    expect(r.tasks[1].duplicateOf).toBeNull();
  });
  it("treats done and archived rows as closed", () => {
    expect(isClosed({ properties: { Status: { select: { name: "Done" } } } })).toBe(true);
    expect(isClosed({ properties: { Tags: { multi_select: [{ name: "Tasks" }, { name: "Done" }] } } })).toBe(true);
    expect(isClosed({ properties: { Status: { status: { name: "In progress" } } } })).toBe(false);
  });
  it("prices a run from the token counts", () => {
    expect(priceOf("claude-opus-5-5", { input_tokens: 1_000_000, output_tokens: 100_000 })).toBeCloseTo(6);
    expect(priceOf("unknown-model", { input_tokens: 1 })).toBeNull();
  });
});

const EVIDENCE_WEB = "I will share the Peak Nine website link with you on LinkedIn by Friday";
const EVIDENCE_LAURA = "Laura could make a one-pager on Proof of Change that you can pass on to the project manager";
const FIRST = { tasks: [task({ title: "Share the website with Marie on LinkedIn", evidence: EVIDENCE_WEB })] };
const REVIEW = {
  added: 2,
  removed: 0,
  tasks: [
    task({ title: "Share the website with Marie on LinkedIn", context: "Marie looks for links with GIZ.", evidence: EVIDENCE_WEB, deadline: "2026-10-23", deadline_quote: "by Friday", project: "P9 - Sales", duplicate_of: "" }),
    task({ board: "laura", title: "Make a one-pager on Proof of Change for GIZ", evidence: EVIDENCE_LAURA, duplicate_of: "Make a one-pager on Proof of Change" }),
    task({ board: "jonas", title: "Follow up on the made-up budget", evidence: "Jonas will send the budget to Marie tomorrow morning", duplicate_of: "" }),
  ],
};

// The first run takes the newest recording without GTD; later runs name it by link, because a
// recording handled once is remembered as done until a restart.
let firstRun = true;
async function runOnce(slack: any, claude: any) {
  const req = firstRun ? { query: null, pageId: null } : { query: null, pageId: "aaaa0000000000000000000000000002" };
  firstRun = false;
  return runGtd(slack, deps(claude), { channel: "D1", ts: "1.1", thread_ts: "1.0", user: "UNIELS", text: "GTD", channel_type: "im" }, req, "1.0");
}
const overviewOf = (slack: any) => [...(slack.calls.update || [])].reverse().find((u: any) => u.blocks);
const actionsOf = () => {
  const actions: Record<string, any> = {};
  registerGtdActions({ action: (id: any, fn: any) => (actions[id instanceof RegExp ? "pick" : String(id)] = fn), view: (id: any, fn: any) => (actions["view:" + id] = fn) }, deps({}));
  return actions;
};
const ticks = (blocks: any[], ids: string[]) => {
  const values: any = {};
  for (const b of blocks.filter((x: any) => String(x.block_id || "").startsWith("gtd_b_"))) {
    const el = b.elements[0];
    values[b.block_id] = { [el.action_id]: { selected_options: el.options.filter((o: any) => ids.includes(o.value)) } };
  }
  return values;
};

describe("GTD run", () => {
  it("reads everything, runs two passes on a strong model, and posts one overview with checkboxes", async () => {
    OPEN["c4f4ed2a82bf467eb290fa670606a2e7"] = [titled("Title", "Make a one-pager on Proof of Change"), titled("Title", "Old finished thing", { Status: { select: { name: "Done" } } })];
    OPEN.mothership = [titled("Task", "Call the accountant")];
    const slack = fakeSlack();
    const claude = fakeClaude([FIRST, REVIEW]);
    const r = await runOnce(slack, claude);
    expect(r).toMatchObject({ kind: "handled", private: true });
    for (const m of slack.calls.postMessage) expect(m.thread_ts).toBe("1.0");

    // Two passes, on Opus 5.5 at high effort, structured JSON, the recording cached for the second pass.
    expect(claude.seen).toHaveLength(2);
    const [p1, p2] = claude.seen;
    expect(p1.model).toBe("claude-opus-5-5");
    expect(p1.output_config.effort).toBe("high");
    expect(p1.output_config.format.type).toBe("json_schema");
    expect(p1.betas).toEqual(["server-side-fallback-2026-07-01"]);
    expect(p1.fallbacks).toBe("default");
    expect(p1.tool_choice).toBeUndefined();
    const shared = p1.messages[0].content[0];
    expect(shared.cache_control).toEqual({ type: "ephemeral" });
    expect(shared.text).toContain("SUMMARY AND NOTES:");
    expect(shared.text).toContain("Niels: And Laura could make a one-pager"); // the full transcript
    expect(p2.messages[0].content[0]).toEqual(shared);
    const review = p2.messages[0].content[1].text;
    expect(review).toContain("Share the website with Marie on LinkedIn"); // first-pass candidates
    expect(review).toContain("  - Make a one-pager on Proof of Change"); // open tasks on Laura's board
    expect(review).toContain("  - Call the accountant");
    expect(review).not.toContain("Old finished thing");
    expect(p2.output_config.format.schema.properties.tasks.items.properties.duplicate_of).toBeDefined();

    // One overview: the invented Jonas item is dropped, the likely duplicate is unticked.
    const ov = overviewOf(slack);
    const text = JSON.stringify(ov.blocks);
    expect(ov.text).toContain("2 suggestions");
    expect(text).toContain("First pass 1, review added 2 and removed 0");
    expect(text).toContain("1 dropped because their quote wasn't in the recording");
    expect(text).toContain("1 may already be on a board");
    expect(text).toMatch(/≈ \$0\.\d\d/);
    expect(text).not.toContain("made-up budget");
    const groups = ov.blocks.filter((b: any) => String(b.block_id || "").startsWith("gtd_b_"));
    expect(groups.map((b: any) => b.block_id)).toEqual(["gtd_b_laura_0", "gtd_b_mothership_0"]);
    const laura = groups[0].elements[0];
    expect(laura.type).toBe("checkboxes");
    expect(laura.initial_options).toBeUndefined(); // the duplicate starts unticked
    expect(groups[1].elements[0].initial_options).toHaveLength(1);
    for (const g of groups) for (const o of g.elements[0].options) expect(o.text.text.length).toBeLessThanOrEqual(75), expect(o.description.text.length).toBeLessThanOrEqual(75);
    const buttons = ov.blocks.find((b: any) => b.block_id === "gtd_actions").elements;
    expect(buttons.map((e: any) => e.action_id)).toEqual([G.add, G.edit, G.discard]);
    expect(buttons[0].text.text).toBe("✅ Add selected (1)");

    // The recording is ticked once the overview is up.
    expect(updates).toEqual([{ page_id: "aaaa0000000000000000000000000002", properties: { GTD: { checkbox: true } } }]);
  });

  it("Add selected writes the ticked tasks, with the quote and a link to the recording", async () => {
    const slack = fakeSlack();
    await runOnce(slack, fakeClaude([FIRST, REVIEW]));
    const ov = overviewOf(slack);
    const add = ov.blocks.find((b: any) => b.block_id === "gtd_actions").elements[0];
    const actions = actionsOf();
    // Niels ticks both, including the possible duplicate.
    const state = ticks(ov.blocks, ["t1", "t2"]);
    expect(selectedFromState(state).sort()).toEqual(["t1", "t2"]);
    await actions[G.add]({ ack: async () => {}, action: add, client: slack, body: { user: { id: "UNIELS" }, channel: { id: "D1" }, message: { ts: "9.2", blocks: ov.blocks }, state: { values: state } } });

    expect(created).toHaveLength(2);
    const ms = created.find((c) => c.parent.data_source_id === MS_DS);
    expect(ms.properties.Task.title[0].text.content).toBe("Share the website with Marie on LinkedIn");
    expect(ms.properties["Due Date"]).toEqual({ date: { start: "2026-10-23" } });
    expect(ms.properties.Project).toEqual({ multi_select: [{ name: "P9 - Sales" }] });
    const body = JSON.stringify(ms.children);
    expect(body).toContain(`Said in the meeting: “${EVIDENCE_WEB}”`);
    expect(body).toContain("Open the recording");
    expect(created.find((c) => c.parent.database_id === "c4f4ed2a82bf467eb290fa670606a2e7")).toBeDefined();

    const after = overviewOf(slack);
    expect(after.ts).toBe("9.2");
    const t = JSON.stringify(after.blocks);
    expect(t).toContain("all done");
    expect(t).toContain("✅ <https://www.notion.so/new|Share the website with Marie on LinkedIn> → Mothership");
    expect(after.blocks.find((b: any) => b.block_id === "gtd_actions")).toBeUndefined();
  });

  it("only who ran GTD can add, and unticked suggestions stay for later", async () => {
    const slack = fakeSlack();
    await runOnce(slack, fakeClaude([FIRST, REVIEW]));
    const ov = overviewOf(slack);
    const add = ov.blocks.find((b: any) => b.block_id === "gtd_actions").elements[0];
    const actions = actionsOf();
    await actions[G.add]({ ack: async () => {}, action: add, client: slack, body: { user: { id: "USOMEONE" }, channel: { id: "D1" }, message: { ts: "9.2", blocks: ov.blocks }, state: { values: ticks(ov.blocks, ["t1"]) } } });
    expect(created).toHaveLength(0);
    expect(slack.calls.ephemeral.pop().text).toContain("Only <@UNIELS>");

    await actions[G.add]({ ack: async () => {}, action: add, client: slack, body: { user: { id: "UNIELS" }, channel: { id: "D1" }, message: { ts: "9.2", blocks: ov.blocks }, state: { values: ticks(ov.blocks, ["t1"]) } } });
    expect(created).toHaveLength(1);
    const after = overviewOf(slack);
    expect(after.text).toContain("1 suggestion left");
    expect(JSON.stringify(after.blocks)).toContain("Make a one-pager on Proof of Change for GIZ");
  });

  it("Edit a task: change the title, board and deadline, and the overview follows", async () => {
    const slack: any = fakeSlack();
    slack.views = { open: async (a: any) => ((slack.calls.views ||= []).push(a), { ok: true }) };
    await runOnce(slack, fakeClaude([FIRST, REVIEW]));
    const ov = overviewOf(slack);
    const edit = ov.blocks.find((b: any) => b.block_id === "gtd_actions").elements[1];
    const opt = edit.options.find((o: any) => o.value.endsWith("|t2"));
    const actions = actionsOf();
    await actions[G.edit]({ ack: async () => {}, action: { selected_option: opt }, client: slack, body: { trigger_id: "tr", user: { id: "UNIELS" }, channel: { id: "D1" }, message: { ts: "9.2", blocks: ov.blocks }, state: { values: ticks(ov.blocks, ["t1"]) } } });
    const modal = slack.calls.views[0].view;
    expect(modal.callback_id).toBe(G.editSubmit);
    expect(JSON.stringify(modal.blocks)).toContain(EVIDENCE_LAURA);

    await actions["view:" + G.editSubmit]({
      ack: async () => {},
      client: slack,
      body: { user: { id: "UNIELS" } },
      view: {
        private_metadata: modal.private_metadata,
        state: { values: { title: { v: { value: "Ask Laura for a GIZ one-pager" } }, context: { v: { value: "Short, visual." } }, board: { v: { selected_option: { value: "mothership" } } }, deadline: { v: { selected_date: "2026-11-14" } } } },
      },
    });
    const after = overviewOf(slack);
    const groups = after.blocks.filter((b: any) => String(b.block_id || "").startsWith("gtd_b_"));
    expect(groups.map((b: any) => b.block_id)).toEqual(["gtd_b_mothership_0"]);
    expect(JSON.stringify(groups)).toContain("Ask Laura for a GIZ one-pager");
    expect(JSON.stringify(groups)).toContain("📅 Sat 14 Nov 2026");
  });

  it("Discard the rest leaves what was added and says nothing more was added", async () => {
    const slack = fakeSlack();
    await runOnce(slack, fakeClaude([FIRST, REVIEW]));
    const ov = overviewOf(slack);
    const discard = ov.blocks.find((b: any) => b.block_id === "gtd_actions").elements[2];
    await actionsOf()[G.discard]({ ack: async () => {}, action: discard, client: slack, body: { user: { id: "UNIELS" }, channel: { id: "D1" }, message: { ts: "9.2" } } });
    expect(JSON.stringify(overviewOf(slack).blocks)).toContain("discarded, nothing more was added");
    expect(created).toHaveLength(0);
  });

  it("doesn't tick the recording when a pass fails", async () => {
    const slack = fakeSlack();
    await runOnce(slack, fakeClaude([FIRST, new Error("overloaded")]));
    expect(slack.calls.update.pop().text).toContain("I couldn't finish GTD");
    expect(updates).toHaveLength(0);
  });

  it("adds the GTD column when it is missing", async () => {
    let first = true;
    const orig = fakeNotion.pages.update;
    fakeNotion.pages.update = async (args: any) => {
      if (first) {
        first = false;
        throw Object.assign(new Error("GTD is not a property that exists."), { code: "validation_error" });
      }
      return orig(args);
    };
    await runOnce(fakeSlack(), fakeClaude([{ tasks: [] }, { tasks: [], added: 0, removed: 0 }]));
    fakeNotion.pages.update = orig;
    expect(schemaPatched).toBe(true);
    expect(updates).toHaveLength(1);
  });

  it("GTD today runs every recording of today without GTD, one overview each", async () => {
    const now = new Date().toISOString();
    ROWS.unshift(row("bbbb0000000000000000000000000002", "Meeting ‣", now), row("bbbb0000000000000000000000000001", "Meeting ‣", now));
    meeting("bbbb0000000000000000000000000001", "Morning sync", [], ["Niels: I will share the Peak Nine website link with you on LinkedIn by Friday."]);
    meeting("bbbb0000000000000000000000000002", "Afternoon call", ["### Action Items", "- [ ] Jonas to send the budget"], []);
    const slack = fakeSlack();
    const claude = fakeClaude([FIRST, { ...REVIEW }, { tasks: [] }, { tasks: [], added: 0, removed: 0 }]);
    await runGtd(slack, deps(claude), { channel: "D1", ts: "1.1", user: "UNIELS", text: "GTD today" }, { query: null, pageId: null, today: true });
    expect(slack.calls.postMessage[0].text).toContain("GTD on 2 recordings from today");
    expect(claude.seen).toHaveLength(4);
    expect(claude.seen[0].messages[0].content[0].text).toContain('Recording: "Morning sync"'); // oldest first
    expect(updates.map((u) => u.page_id)).toEqual(["bbbb0000000000000000000000000001", "bbbb0000000000000000000000000002"]);
  });

  it("keeps Recordings hidden from everyone but Niels", () => {
    for (const who of ["jonas@peaknine.studio", "laura@peaknine.studio"]) {
      expect(hiddenNotionIds(who)).toEqual(expect.arrayContaining(["402c675ff958800990a0d32640656e2a", RDS]));
    }
    expect(hiddenNotionIds("niels@peaknine.studio")).toEqual([]);
  });
});
