/**
 * End-to-end run of task capture with fake Slack, Notion and Claude:
 * tag in a thread → draft card → pickers changed → "Add to board" → Notion row.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { runTaskCapture, registerTaskActions } from "../slackbot/tasks.js";
import { PRIVATE_REPLY } from "../slackbot/taskboards.js";

const notionCalls: any[] = [];
const schemaReads: string[] = []; // not cleared: the schema is cached across tests
vi.mock("../slackbot/notion.js", () => ({
  notionDataSourceClient: () => ({
    request: async ({ path }: any) => {
      schemaReads.push(path);
      return { properties: { Project: { multi_select: { options: [{ name: "P9 - Sales" }, { name: "Personal" }] } } } };
    },
    pages: {
      create: async (args: any) => {
        notionCalls.push({ ...args, viaDataSource: true });
        return { id: "page2", url: "https://www.notion.so/page2" };
      },
    },
  }),
  notionClient: () => ({
    databases: {
      retrieve: async ({ database_id }: any) =>
        database_id === "3f9c675ff95880aeb5fdff8f398a60b4"
          ? { properties: { Project: { select: { options: [{ name: "KBS" }, { name: "INTERNAL" }] } } } }
          : { properties: { Project: { select: { options: [{ name: "Takeda" }, { name: "KBS Allez Circulez" }, { name: "Marketing" }] } } } },
    },
    pages: {
      create: async (args: any) => {
        notionCalls.push(args);
        return { id: "page1", url: "https://www.notion.so/page1" };
      },
    },
  }),
}));
vi.mock("../slackbot/usage.js", () => ({ recordUsage: () => {} }));


const USERS: Record<string, any> = {
  UNIELS: { real_name: "Niels Van Espen", profile: { email: "niels@peaknine.studio" } },
  ULAURA: { real_name: "Laura Lang", profile: { email: "laura@peaknine.studio" } },
  UJONAS: { real_name: "Jonas Burm", profile: { email: "jonas@peaknine.studio" } },
  UBERT: { real_name: "Bertille Masse", profile: { email: "bertille@peaknine.studio" } },
  UBOT: { real_name: "Pidgi", profile: {} },
};

function fakeSlack(threadMessages: any[]) {
  const calls: Record<string, any[]> = {};
  const log = (k: string, a: any) => ((calls[k] ||= []).push(a), a);
  let n = 0;
  return {
    calls,
    users: { info: async ({ user }: any) => ({ user: USERS[user] }) },
    conversations: {
      replies: async (a: any) => (log("replies", a), { messages: threadMessages }),
      history: async (a: any) => (log("history", a), { messages: [] }),
      info: async () => ({ channel: { name: "allez-circulez" } }),
    },
    chat: {
      postMessage: async (a: any) => (log("postMessage", a), { ts: `9.${++n}`, channel: a.channel }),
      update: async (a: any) => (log("update", a), { ok: true }),
      getPermalink: async () => ({ permalink: "https://peak-nine.slack.com/archives/C1/p1789000000000100" }),
      postEphemeral: async (a: any) => (log("ephemeral", a), { ok: true }),
    },
    views: { open: async (a: any) => (log("viewsOpen", a), { ok: true }) },
  };
}

function fakeClaude(input: any) {
  const seen: any[] = [];
  return {
    seen,
    messages: {
      create: async (req: any) => {
        seen.push(req);
        return { content: [{ type: "tool_use", name: "submit_tasks", input }], usage: {} };
      },
    },
  };
}

const THREAD = [
  { ts: "1789000000.000100", user: "UNIELS", text: "Kickoff poster for Allez Circulez: <@ULAURA> can you do a first version by Friday? Brief: <https://docs.google.com/document/d/abc|brief>" },
  { ts: "1789000060.000200", user: "ULAURA", text: "Sure, A3 or A2?" },
  { ts: "1789000120.000300", user: "UNIELS", text: "A2, two colour options" },
  { ts: "1789000180.000400", user: "UNIELS", text: "<@UBOT> turn this into a task for Laura" },
];

describe("task capture flow", () => {
  beforeEach(() => {
    notionCalls.length = 0;
  });

  it("drafts a card from the thread and writes the row on ✅", async () => {
    const slack = fakeSlack(THREAD);
    const claude = fakeClaude({
      is_task_request: true,
      problem: "",
      tasks: [
        {
          board: "laura",
          responsible: "",
          title: "Design the Allez Circulez kickoff poster",
          context: "First version of the kickoff poster, A2 — two colour options.",
          deadline: "2026-10-23",
          deadline_quote: "by Friday",
          project: "KBS Allez Circulez",
          urls: ["https://docs.google.com/document/d/abc", "https://invented.example.com"],
        },
      ],
    });
    const deps = { anthropic: claude as any, model: "test-model", botUserId: "UBOT", canConfirm: (u: string, r: string) => u === r || u === "UJONAS" };

    const r = await runTaskCapture(
      slack,
      deps,
      { channel: "C1", ts: "1789000180.000400", thread_ts: "1789000000.000100", user: "UNIELS", text: "<@UBOT> turn this into a task for Laura" },
      "1789000000.000100"
    );
    expect(r.kind).toBe("handled");

    // The model saw the thread, with names, and not the tagging message itself.
    const prompt = claude.seen[0].messages[0].content as string;
    expect(prompt).toContain("Niels: Kickoff poster for Allez Circulez: @Laura can you do a first version by Friday?");
    expect(prompt).toContain("Laura: Sure, A3 or A2?");
    expect(prompt).toContain('Request: "@Pidgi turn this into a task for Laura"');
    expect(prompt).toContain("#allez-circulez");
    expect(prompt).toContain("(today)");
    expect(claude.seen[0].tool_choice).toEqual({ type: "tool", name: "submit_tasks" });

    // The placeholder became the draft card.
    const card = slack.calls.update[0];
    const blocks = JSON.stringify(card.blocks);
    expect(blocks).toContain("Draft task for Laura");
    expect(blocks).toContain("A2, two colour options"); // em dash replaced by house style
    expect(blocks).not.toContain("—");
    expect(blocks).not.toContain("invented.example.com"); // link not in the thread is dropped
    expect(blocks).toContain("Deadline taken from “by Friday”");

    // Nothing written yet.
    expect(notionCalls).toHaveLength(0);

    // Capture the button handlers.
    const actions: Record<string, any> = {};
    const app = {
      action: (id: any, fn: any) => (actions[String(id)] = fn),
      view: (id: any, fn: any) => (actions[`view:${id}`] = fn),
    };
    registerTaskActions(app, deps);
    const createBtn = card.blocks.find((b: any) => b.block_id === "p9task_buttons").elements[0];
    const body = (user: string) => ({
      user: { id: user },
      channel: { id: "C1" },
      message: { ts: "9.1", thread_ts: "1789000000.000100", blocks: card.blocks },
      state: { values: { p9task_fields: { p9task_deadline: { type: "datepicker", selected_date: "2026-10-26" } } } },
    });
    const ack = vi.fn(async () => {});

    // Someone else can't confirm.
    await actions["p9task_create"]({ ack, body: body("ULAURA"), action: createBtn, client: slack });
    expect(notionCalls).toHaveLength(0);
    expect(slack.calls.ephemeral?.[0]?.text).toMatch(/Only <@UNIELS>/);

    // Moving the deadline in the picker redraws the card with the new date in the draft.
    await actions[String(/^(p9task_owner|p9task_deadline|p9task_project|p9task_resp)$/)]({
      ack,
      body: { ...body("UNIELS"), state: undefined },
      action: { action_id: "p9task_deadline", type: "datepicker", selected_date: "2026-10-26" },
      client: slack,
    });
    const redrawn = slack.calls.update[slack.calls.update.length - 1];
    const redrawnFields = redrawn.blocks.find((b: any) => b.block_id === "p9task_fields");
    expect(redrawnFields.elements[1].initial_date).toBe("2026-10-26");
    expect(JSON.stringify(redrawn.blocks)).toContain("Deadline set to Mon 26 Oct 2026.");
    const redrawnCreate = redrawn.blocks.find((b: any) => b.block_id === "p9task_buttons").elements[0];
    expect(JSON.parse(redrawnCreate.value).d).toBe("2026-10-26");

    // The requester confirms (state also carries the picked date, as Slack sends it).
    await actions["p9task_create"]({ ack, body: body("UNIELS"), action: createBtn, client: slack });
    expect(notionCalls).toHaveLength(1);
    const row = notionCalls[0];
    expect(row.parent).toEqual({ database_id: "c4f4ed2a82bf467eb290fa670606a2e7" });
    expect(row.properties.Title.title[0].text.content).toBe("Design the Allez Circulez kickoff poster");
    expect(row.properties.Deadline).toEqual({ date: { start: "2026-10-26" } });
    expect(row.properties.Project).toEqual({ select: { name: "KBS Allez Circulez" } });
    expect(row.properties.Owner).toEqual({ people: [{ id: "2d1d872b-594c-8145-ac7e-00025e996fbe" }] }); // Niels asked
    expect(row.properties.Status).toEqual({ select: { name: "To Start" } });
    expect(JSON.stringify(row.properties.Resources)).toContain("https://docs.google.com/document/d/abc");
    expect(JSON.stringify(row.children)).toContain("Open the Slack thread");

    const done = slack.calls.update[slack.calls.update.length - 1];
    expect(JSON.stringify(done.blocks)).toContain("Added to <https://www.notion.so/3f8c675ff95881048402cd087d98edda|Laura's board>");
    expect(JSON.stringify(done.blocks)).toContain("Mon 26 Oct 2026");
  });

  it("hands questions about tasks back to the normal brain", async () => {
    const slack = fakeSlack(THREAD);
    const claude = fakeClaude({ is_task_request: false, problem: "", tasks: [] });
    const r = await runTaskCapture(
      slack,
      { anthropic: claude as any, model: "m", botUserId: "UBOT", canConfirm: () => true },
      { channel: "C1", ts: "1789000180.000400", thread_ts: "1789000000.000100", user: "UNIELS", text: "<@UBOT> what tasks does Laura have?" },
      "1789000000.000100"
    );
    expect(r).toEqual({ kind: "not_task", ack: { channel: "C1", ts: "9.1" } });
    expect(slack.calls.update).toBeUndefined();
  });

  it("says who has a board when the person has none", async () => {
    const slack = fakeSlack(THREAD);
    const claude = fakeClaude({ is_task_request: true, problem: "", tasks: [{ board: "unknown", title: "x", context: "", deadline: "", deadline_quote: "", project: "", responsible: "", urls: [] }] });
    const r = await runTaskCapture(
      slack,
      { anthropic: claude as any, model: "m", botUserId: "UBOT", canConfirm: () => true },
      { channel: "C1", ts: "1789000180.000400", thread_ts: "1789000000.000100", user: "UNIELS", text: "<@UBOT> task for Jonas" },
      "1789000000.000100"
    );
    expect(r.kind).toBe("handled");
    // In a channel, colleagues read along: Niels's private boards aren't listed.
    expect(slack.calls.update[0].text).toBe(
      "I can add things to Laura's board, Sankhya's board and the Team sync talking points so far. Which one should this go to?"
    );
    // In his DM with Pidgi they are.
    const dm = fakeSlack(THREAD);
    await runTaskCapture(
      dm,
      { anthropic: claude as any, model: "m", botUserId: "UBOT", canConfirm: () => true },
      { channel: "D1", ts: "1789000180.000400", user: "UNIELS", text: "<@UBOT> task for Jonas", channel_type: "im" },
      undefined
    );
    expect(dm.calls.update[0].text).toBe(
      "I can add things to Laura's board, Sankhya's board, the Touchdown agenda, Mothership and the Team sync talking points so far. Which one should this go to?"
    );
  });

  it("explains a missing Slack scope instead of failing silently", async () => {
    const slack = fakeSlack(THREAD);
    slack.conversations.replies = async () => {
      throw Object.assign(new Error("An API error occurred: missing_scope"), { data: { error: "missing_scope", needed: "channels:history" } });
    };
    const r = await runTaskCapture(
      slack,
      { anthropic: fakeClaude({}) as any, model: "m", botUserId: "UBOT", canConfirm: () => true },
      { channel: "C1", ts: "1789000180.000400", thread_ts: "1789000000.000100", user: "UNIELS", text: "<@UBOT> task for Laura" },
      "1789000000.000100"
    );
    expect(r.kind).toBe("handled");
    expect(slack.calls.update[0].text).toContain("`channels:history`");
  });

  it("puts a topic on the Touchdown agenda for Niels, with Jonas picking it up", async () => {
    notionCalls.length = 0;
    const slack = fakeSlack(THREAD);
    const claude = fakeClaude({
      is_task_request: true,
      problem: "",
      tasks: [
        {
          board: "touchdown",
          title: "Poster budget for Allez Circulez",
          context: "Decide whether we print A2 in two colour options.",
          deadline: "",
          deadline_quote: "",
          project: "KBS Allez Circulez",
          responsible: "Jonas",
          urls: [],
        },
      ],
    });
    const deps = { anthropic: claude as any, model: "m", botUserId: "UBOT", canConfirm: (u: string, r: string) => u === r || u === "UBERT" };
    await runTaskCapture(
      slack,
      deps,
      { channel: "C1", ts: "1789000180.000400", thread_ts: "1789000000.000100", user: "UNIELS", text: "<@UBOT> zet dit op de touchdown" },
      "1789000000.000100"
    );
    expect(claude.seen[0].messages[0].content).toContain("touchdown: Touchdown agenda");
    const card = slack.calls.update[0];
    const fields = card.blocks.find((b: any) => b.block_id === "p9task_fields");
    expect(fields.elements.map((e: any) => e.action_id)).toEqual(["p9task_owner", "p9task_deadline", "p9task_resp"]);
    expect(fields.elements[2].initial_option.value).toBe("jonas@peaknine.studio");

    const actions: Record<string, any> = {};
    registerTaskActions({ action: (id: any, fn: any) => (actions[String(id)] = fn), view: () => {} }, deps);
    const createBtn = card.blocks.find((b: any) => b.block_id === "p9task_buttons").elements[0];
    expect(JSON.parse(createBtn.value).p).toBeNull(); // Touchdown has no project column
    const body = (user: string) => ({ user: { id: user }, channel: { id: "C1" }, message: { ts: "9.1", blocks: card.blocks }, state: { values: {} } });
    const ack = async () => {};

    // Bertille is on the write list, but Touchdown is Niels and Jonas only.
    await actions["p9task_create"]({ ack, body: body("UBERT"), action: createBtn, client: slack });
    expect(notionCalls).toHaveLength(0);
    expect(slack.calls.ephemeral.pop().text).toBe(PRIVATE_REPLY);

    await actions["p9task_create"]({ ack, body: body("UNIELS"), action: createBtn, client: slack });
    expect(notionCalls).toHaveLength(1);
    const row = notionCalls[0];
    expect(row.parent).toEqual({ database_id: "2d5c675ff9588011ac09cd22663b3c68" });
    expect(Object.keys(row.properties).sort()).toEqual(["Assignee", "Description", "Status", "Task name"]);
    expect(row.properties.Status).toEqual({ status: { name: "Not started" } });
    expect(row.properties.Assignee).toEqual({ people: [{ id: "274d872b-594c-81ae-9cba-0002e52cea03" }] });
    const done = JSON.stringify(slack.calls.update[slack.calls.update.length - 1].blocks);
    expect(done).toContain("Added to the <https://www.notion.so/2d5c675ff958800f919aea617356cc23|Touchdown agenda>");
    expect(done).toContain("Assignee: Jonas");
  });

  it("never shows the private boards to the rest of the team", async () => {
    const slack = fakeSlack(THREAD);
    const claude = fakeClaude({ is_task_request: true, problem: "", tasks: [{ board: "unknown", title: "x", context: "", deadline: "", deadline_quote: "", project: "", responsible: "", urls: [] }] });
    await runTaskCapture(
      slack,
      { anthropic: claude as any, model: "m", botUserId: "UBOT", canConfirm: () => true },
      { channel: "C1", ts: "1789000180.000400", thread_ts: "1789000000.000100", user: "ULAURA", text: "<@UBOT> turn this into a task for Jonas" },
      "1789000000.000100"
    );
    const prompt = claude.seen[0].messages[0].content as string;
    expect(prompt).not.toContain("touchdown:");
    expect(prompt).not.toContain("mothership:");
    expect(prompt).not.toContain("Niels and Jonas");
    expect(claude.seen[0].tools[0].input_schema.properties.tasks.items.properties.board.enum).toEqual(["laura", "sankhya", "team", "unknown"]);
    expect(slack.calls.update[0].text).toBe("I can add things to Laura's board, Sankhya's board and the Team sync talking points so far. Which one should this go to?");
  });

  it("answers anyone who names a private board they're not part of with one neutral line", async () => {
    for (const [user, text] of [
      ["ULAURA", "<@UBOT> put this on the touchdown"],
      ["ULAURA", "<@UBOT> add this to Niels's mothership"],
      ["UJONAS", "<@UBOT> zet dit op de mothership"],
      ["UJONAS", "<@UBOT> add a task to the Must Win Battle board"],
    ]) {
      const slack = fakeSlack(THREAD);
      const claude = fakeClaude({});
      const r = await runTaskCapture(
        slack,
        { anthropic: claude as any, model: "m", botUserId: "UBOT", canConfirm: () => true },
        { channel: "C1", ts: "1789000180.000400", thread_ts: "1789000000.000100", user, text },
        "1789000000.000100"
      );
      expect(r, text).toEqual({ kind: "handled", summary: PRIVATE_REPLY, private: true });
      expect(slack.calls.postMessage.map((m: any) => m.text)).toEqual([PRIVATE_REPLY]);
      expect(claude.seen).toHaveLength(0); // the request never reaches the model
      expect(slack.calls.replies).toBeUndefined(); // nor is the thread read
    }
  });

  it("puts a task on Niels's Mothership through its data source, and only Niels can add it", async () => {
    notionCalls.length = 0;
    const slack = fakeSlack(THREAD);
    const claude = fakeClaude({
      is_task_request: true,
      problem: "",
      tasks: [{ board: "mothership", title: "Call the accountant", context: "About the Q4 invoices.", deadline: "", deadline_quote: "", project: "P9 - Sales", responsible: "", urls: [] }],
    });
    const deps = { anthropic: claude as any, model: "m", botUserId: "UBOT", canConfirm: () => true };
    const r = await runTaskCapture(
      slack,
      deps,
      { channel: "D1", ts: "1789000180.000400", user: "UNIELS", text: "<@UBOT> put this on my mothership", channel_type: "im" },
      undefined
    );
    expect(r).toMatchObject({ kind: "handled", private: true });
    expect(claude.seen[0].messages[0].content).toContain("mothership: Mothership");
    const card = slack.calls.update[0];

    const actions: Record<string, any> = {};
    registerTaskActions({ action: (id: any, fn: any) => (actions[String(id)] = fn), view: () => {} }, deps);
    const createBtn = card.blocks.find((b: any) => b.block_id === "p9task_buttons").elements[0];
    const body = (user: string) => ({ user: { id: user }, channel: { id: "D1" }, message: { ts: "9.1", blocks: card.blocks }, state: { values: {} } });
    const ack = async () => {};

    await actions["p9task_create"]({ ack, body: body("UJONAS"), action: createBtn, client: slack });
    expect(notionCalls.filter((c) => c.parent)).toHaveLength(0);
    expect(slack.calls.ephemeral.pop().text).toBe(PRIVATE_REPLY);

    await actions["p9task_create"]({ ack, body: body("UNIELS"), action: createBtn, client: slack });
    const row = notionCalls.find((c) => c.parent);
    expect(row.viaDataSource).toBe(true);
    expect(row.parent).toEqual({ type: "data_source_id", data_source_id: "2d3c675ff9588031805c000b7f320c36" });
    expect(row.properties.Task).toEqual({ title: [expect.objectContaining({ text: expect.objectContaining({ content: "Call the accountant" }) })] });
    expect(row.properties.Project).toEqual({ multi_select: [{ name: "P9 - Sales" }] });
    expect(row.properties.Tags).toEqual({ multi_select: [{ name: "Tasks" }] });
    expect(schemaReads).toContain("data_sources/2d3c675ff9588031805c000b7f320c36");
  });

  it("keeps Mothership out of the picker on Niels's cards in a channel", async () => {
    const slack = fakeSlack(THREAD);
    const claude = fakeClaude({
      is_task_request: true,
      problem: "",
      tasks: [{ board: "laura", title: "Poster", context: "", deadline: "", deadline_quote: "", project: "", responsible: "", urls: [] }],
    });
    await runTaskCapture(
      slack,
      { anthropic: claude as any, model: "m", botUserId: "UBOT", canConfirm: () => true },
      { channel: "C1", ts: "1789000180.000400", thread_ts: "1789000000.000100", user: "UNIELS", text: "<@UBOT> turn this into a task for Laura" },
      "1789000000.000100"
    );
    const cardText = JSON.stringify(slack.calls.update[0].blocks);
    expect(cardText).not.toMatch(/mothership|touchdown/i);
  });

  it("puts a talking point on the team sync with the asker as Creator", async () => {
    notionCalls.length = 0;
    const slack = fakeSlack(THREAD);
    const claude = fakeClaude({
      is_task_request: true,
      problem: "",
      tasks: [{ board: "team", title: "Poster sizes for all programmes", context: "A2 or A3 as the default?", deadline: "", deadline_quote: "", project: "INTERNAL", responsible: "", urls: [] }],
    });
    const deps = { anthropic: claude as any, model: "m", botUserId: "UBOT", canConfirm: (u: string, r: string) => u === r };
    await runTaskCapture(
      slack,
      deps,
      { channel: "C1", ts: "1789000180.000400", thread_ts: "1789000000.000100", user: "ULAURA", text: "<@UBOT> talking point for the team sync" },
      "1789000000.000100"
    );
    const card = slack.calls.update[0];
    const actions: Record<string, any> = {};
    registerTaskActions({ action: (id: any, fn: any) => (actions[String(id)] = fn), view: () => {} }, deps);
    const createBtn = card.blocks.find((b: any) => b.block_id === "p9task_buttons").elements[0];
    await actions["p9task_create"]({
      ack: async () => {},
      body: { user: { id: "ULAURA" }, channel: { id: "C1" }, message: { ts: "9.1", blocks: card.blocks }, state: { values: {} } },
      action: createBtn,
      client: slack,
    });
    expect(notionCalls).toHaveLength(1);
    const row = notionCalls[0];
    expect(row.parent).toEqual({ database_id: "3f9c675ff95880aeb5fdff8f398a60b4" });
    expect(row.properties).toMatchObject({
      Task: { title: [{ text: { content: "Poster sizes for all programmes" } }] },
      ".": { status: { name: "Not started" } },
      Project: { select: { name: "INTERNAL" } },
      Creator: { people: [{ id: "380d872b-594c-81ad-9c03-000226cbb638" }] },
    });
    expect(JSON.stringify(row.children)).toContain("A2 or A3 as the default?");
  });
});
