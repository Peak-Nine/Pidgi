/**
 * End-to-end run of task capture with fake Slack, Notion and Claude:
 * tag in a thread → draft card → pickers changed → "Add to board" → Notion row.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { runTaskCapture, registerTaskActions } from "../slackbot/tasks.js";

const notionCalls: any[] = [];
vi.mock("../slackbot/notion.js", () => ({
  notionClient: () => ({
    databases: {
      retrieve: async () => ({
        properties: { Project: { select: { options: [{ name: "Takeda" }, { name: "KBS Allez Circulez" }, { name: "Marketing" }] } } },
      }),
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
          assignee: "laura",
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
    await actions[String(/^(p9task_owner|p9task_deadline|p9task_project)$/)]({
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
    const claude = fakeClaude({ is_task_request: true, problem: "", tasks: [{ assignee: "unknown", title: "x", context: "", deadline: "", deadline_quote: "", project: "", urls: [] }] });
    const r = await runTaskCapture(
      slack,
      { anthropic: claude as any, model: "m", botUserId: "UBOT", canConfirm: () => true },
      { channel: "C1", ts: "1789000180.000400", thread_ts: "1789000000.000100", user: "UNIELS", text: "<@UBOT> task for Jonas" },
      "1789000000.000100"
    );
    expect(r.kind).toBe("handled");
    expect(slack.calls.update[0].text).toBe("I have boards for Laura and Sankhya so far. Who should this go to?");
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
});
