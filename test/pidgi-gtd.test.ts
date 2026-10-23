/**
 * GTD: "GTD" in Niels's DM → the last recording without GTD on yet (or the one named) →
 * draft cards for Mothership, Touchdown and Sankhya, with fake Notion, Slack and Claude.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

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
    databases: { retrieve: async () => ({ properties: { Project: { select: { options: [{ name: "Takeda" }] } } } }) },
    pages: { create: async (args: any) => (created.push(args), { id: "new", url: "https://www.notion.so/new" }) },
  }),
}));
vi.mock("../slackbot/usage.js", () => ({ recordUsage: () => {} }));

import { parseGtd, matchesQuery, readRecording, pickRecording, pickProblem } from "../slackbot/recordings.js";
import { runGtd, registerTaskActions } from "../slackbot/tasks.js";
import { hiddenNotionIds } from "../slackbot/taskboards.js";

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
function fakeClaude(input: any) {
  const seen: any[] = [];
  return { seen, messages: { create: async (req: any) => (seen.push(req), { content: [{ type: "tool_use", name: "submit_tasks", input }], usage: {} }) } };
}

beforeEach(() => {
  ROWS.length = 0;
  for (const k of Object.keys(CHILDREN)) delete CHILDREN[k];
  updates.length = 0;
  created.length = 0;
  schemaPatched = false;
  listError = null;
  // Newest first, like the real query.
  ROWS.push(row("aaaa0000000000000000000000000003", "Meeting ‣", "2026-10-23T14:00:00Z")); // empty
  ROWS.push(row("aaaa0000000000000000000000000002", "Meeting ‣", "2026-10-23T09:18:00Z"));
  ROWS.push(row("aaaa0000000000000000000000000001", "Meeting ‣", "2026-10-22T08:00:00Z", true)); // GTD done
  CHILDREN["aaaa0000000000000000000000000003"] = [];
  meeting(
    "aaaa0000000000000000000000000002",
    "Introductory Networking Call: Peak Nine & GIZ Namibia",
    ["### Action Items", "- [ ] Marie to introduce Peak Nine to the GIZ project manager", "- [ ] Niels to share the Peak Nine website URL via LinkedIn by Friday"],
    ["Marie: hello", "Niels: hi"]
  );
  meeting("aaaa0000000000000000000000000001", "Bourguignon Strategy Review", ["### Action Items", "- [ ] Jonas to send the budget"], []);
});

describe("parseGtd", () => {
  it("reads the trigger, words and links", () => {
    expect(parseGtd("GTD")).toEqual({ query: null, pageId: null });
    expect(parseGtd("gtd GIZ namibia")).toEqual({ query: "GIZ namibia", pageId: null });
    expect(parseGtd("<@UBOT> GTD: Bourguignon")).toEqual({ query: "Bourguignon", pageId: null });
    expect(parseGtd("GTD <https://app.notion.com/p/402c675ff95880689421c2a0e902ad57?pvs=4|link>")).toEqual({
      query: null,
      pageId: "402c675ff95880689421c2a0e902ad57",
    });
    expect(parseGtd("GTD https://www.notion.so/Meeting-402c675f-f958-8068-9421-c2a0e902ad57")?.pageId).toBe("402c675ff95880689421c2a0e902ad57");
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
  it("follows the meeting-notes pointers: summary in, transcript out", async () => {
    const c = await readRecording("aaaa0000000000000000000000000002");
    expect(c.title).toBe("Introductory Networking Call: Peak Nine & GIZ Namibia");
    expect(c.text).toContain("### Action Items");
    expect(c.text).toContain("- [ ] Niels to share the Peak Nine website URL via LinkedIn by Friday");
    expect(c.text).not.toContain("Marie: hello");
  });
  it("uses the transcript when there is no summary", async () => {
    meeting("aaaa0000000000000000000000000002", "Quick call", [], ["Niels: I'll send the deck to Sankhya tomorrow, she reviews it by Monday so we can finalise it."]);
    const c = await readRecording("aaaa0000000000000000000000000002");
    expect(c.text).toContain("Transcript:");
    expect(c.text).toContain("send the deck");
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

describe("GTD run", () => {
  it("drafts cards for Niels's boards in the DM and ticks the recording", async () => {
    const slack = fakeSlack();
    const claude = fakeClaude({
      is_task_request: true,
      problem: "",
      tasks: [
        { board: "mothership", title: "Share the Peak Nine website with Marie on LinkedIn", context: "Marie reviews it for links with GIZ.", deadline: "2026-10-23", deadline_quote: "by Friday", project: "P9 - Sales", responsible: "", urls: [] },
        { board: "laura", title: "Design a one-pager on Proof of Change for GIZ", context: "Marie will review the website for links with GIZ.", deadline: "", deadline_quote: "", project: "", responsible: "", urls: [] },
        { board: "team", title: "Not a GTD board", context: "", deadline: "", deadline_quote: "", project: "", responsible: "", urls: [] },
      ],
    });
    const deps = { anthropic: claude as any, model: "m", botUserId: "UBOT", canConfirm: (u: string, r: string) => u === r };
    const r = await runGtd(slack, deps, { channel: "D1", ts: "1.1", user: "UNIELS", text: "GTD", channel_type: "im" }, { query: null, pageId: null });

    expect(r).toMatchObject({ kind: "handled", private: true });
    const prompt = claude.seen[0].messages[0].content as string;
    expect(prompt).toContain("Introductory Networking Call: Peak Nine & GIZ Namibia");
    expect(prompt).toContain("Niels to share the Peak Nine website URL via LinkedIn by Friday");
    expect(prompt).toContain("Only what Niels, Jonas, Sankhya or Laura must do");
    expect(claude.seen[0].tools[0].input_schema.properties.tasks.items.properties.board.enum).toEqual(["laura", "sankhya", "touchdown", "mothership", "unknown"]);

    // Header + two cards (the team sync item isn't a GTD board), all in the DM.
    expect(slack.calls.update[0].text).toContain("2 suggestions");
    const laura = slack.calls.postMessage.filter((m: any) => m.blocks)[1];
    expect(JSON.stringify(laura.blocks)).toContain("Design a one-pager on Proof of Change for GIZ");
    expect(slack.calls.update[0].text).toContain("GIZ Namibia");
    const card = slack.calls.postMessage.find((m: any) => m.blocks);
    expect(card.channel).toBe("D1");
    expect(JSON.stringify(card.blocks)).toContain("Share the Peak Nine website with Marie on LinkedIn");
    expect(updates).toEqual([{ page_id: "aaaa0000000000000000000000000002", properties: { GTD: { checkbox: true } } }]);

    // ✅ writes the row with a link back to the recording.
    const actions: Record<string, any> = {};
    registerTaskActions({ action: (id: any, fn: any) => (actions[String(id)] = fn), view: () => {} }, deps);
    const createBtn = card.blocks.find((b: any) => b.block_id === "p9task_buttons").elements[0];
    await actions["p9task_create"]({
      ack: async () => {},
      body: { user: { id: "UNIELS" }, channel: { id: "D1" }, message: { ts: "9.2", blocks: card.blocks }, state: { values: {} } },
      action: createBtn,
      client: slack,
    });
    const page = created[0];
    expect(page.parent).toEqual({ type: "data_source_id", data_source_id: "2d3c675ff9588031805c000b7f320c36" });
    const body = JSON.stringify(page.children);
    expect(body).toContain("Captured from a meeting recording by Pidgi");
    expect(body).toContain("Open the recording");
    expect(body).toContain("Deadline as said in the meeting");
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
    const slack = fakeSlack();
    const claude = fakeClaude({ is_task_request: true, problem: "", tasks: [] });
    await runGtd(slack, { anthropic: claude as any, model: "m", canConfirm: () => true }, { channel: "D1", ts: "1.1", user: "UNIELS", text: "GTD" }, { query: null, pageId: "aaaa0000000000000000000000000002" });
    fakeNotion.pages.update = orig;
    expect(schemaPatched).toBe(true);
    expect(updates).toHaveLength(1);
    expect(slack.calls.update[0].text).toBe("Nothing concrete for your boards in *Introductory Networking Call: Peak Nine & GIZ Namibia*.");
  });

  it("keeps Recordings hidden from everyone but Niels", () => {
    for (const who of ["jonas@peaknine.studio", "laura@peaknine.studio"]) {
      expect(hiddenNotionIds(who)).toEqual(expect.arrayContaining(["402c675ff958800990a0d32640656e2a", RDS]));
    }
    expect(hiddenNotionIds("niels@peaknine.studio")).toEqual([]);
  });
});
