import { describe, it, expect } from "vitest";
import {
  DEFAULT_BOARDS,
  applyFieldState,
  calendarLines,
  decodeDraft,
  draftBlocks,
  encodeDraft,
  formatTranscript,
  houseStyle,
  isTaskBoardDatabase,
  isoWeek,
  loadBoards,
  looksLikeTaskRequest,
  notionProperties,
  parseSlackPermalinks,
  readFieldState,
  slackToPlain,
  validateDistilled,
  type DraftPayload,
} from "../slackbot/taskboards.js";

const PROJECTS = ["Takeda", "KBS Allez Circulez", "Marketing"];

describe("looksLikeTaskRequest", () => {
  it("fires on task words in English and Dutch", () => {
    for (const t of [
      "turn this into a new task for Laura",
      "make a todo for Sankhya by Friday",
      "maak hier een taak van voor Laura",
      "add these as to-dos for sankhya",
      "Task for Laura: poster",
    ]) {
      expect(looksLikeTaskRequest(t), t).toBe(true);
    }
  });
  it("stays quiet on ordinary planning questions", () => {
    for (const t of ["how much capacity does Jonas have next week?", "plan 2 days for Laura on Ethias", "multitasking is hard"]) {
      expect(looksLikeTaskRequest(t), t).toBe(false);
    }
  });
});

describe("dates", () => {
  it("computes ISO weeks", () => {
    expect(isoWeek("2026-10-21")).toBe(43);
    expect(isoWeek("2027-01-01")).toBe(53);
    expect(isoWeek("2026-01-01")).toBe(1);
  });
  it("lists weeks with weekdays and marks today", () => {
    const cal = calendarLines("2026-10-21", 7, 21);
    expect(cal).toContain("Wed 2026-10-21 (today)");
    expect(cal).toContain("Fri 2026-10-23");
    expect(cal).toMatch(/^W42: Mon 2026-10-12/m);
    expect(cal.split("\n").every((l) => l.split(", ").length === 7)).toBe(true);
  });
});

describe("Slack text", () => {
  it("turns mentions and links into readable text", () => {
    const names = { U1: "Laura", UBOT: "Pidgi" };
    expect(slackToPlain("<@UBOT> task for <@U1>, see <https://canva.com/x|the deck> &amp; <#C9|enabel>", names)).toBe(
      "@Pidgi task for @Laura, see the deck (https://canva.com/x) & #enabel"
    );
  });
  it("parses Slack message links, with and without a thread", () => {
    const links = parseSlackPermalinks(
      "<https://peak-nine.slack.com/archives/C09GXSH1N0Z/p1789464794876149> and https://peak-nine.slack.com/archives/C1/p1789464794000001?thread_ts=1789464000.000100&cid=C1"
    );
    expect(links).toEqual([
      { channel: "C09GXSH1N0Z", ts: "1789464794.876149" },
      { channel: "C1", ts: "1789464794.000001", threadTs: "1789464000.000100" },
    ]);
  });
  it("keeps the thread root when the transcript is too long", () => {
    const lines = Array.from({ length: 50 }, (_, i) => ({ ts: String(1789464794 + i * 60), author: "Niels", text: `message ${i} ` + "x".repeat(200), depth: i ? 1 : 0 }));
    const out = formatTranscript(lines, 3000);
    expect(out.length).toBeLessThanOrEqual(3100);
    expect(out).toContain("message 0 ");
    expect(out).toContain("message 49 ");
    expect(out).toMatch(/earlier messages left out/);
  });
});

describe("houseStyle", () => {
  it("removes em and en dashes but keeps number ranges", () => {
    expect(houseStyle("Poster draft — two versions")).toBe("Poster draft, two versions");
    expect(houseStyle("pages 10–12")).toBe("pages 10-12");
  });
});

describe("validateDistilled", () => {
  const source = "[Mon 19 Oct 10:00] Niels: Laura, can you make the poster by Friday? Brief: https://docs.google.com/doc/abc\n@Pidgi task for Laura";
  const base = { boards: DEFAULT_BOARDS, projectOptions: PROJECTS, sourceText: source, today: "2026-10-21" };

  it("keeps a deadline only when its words are in the conversation", () => {
    const r = validateDistilled(
      {
        is_task_request: true,
        problem: "",
        tasks: [
          { assignee: "laura", title: "Design the poster", context: "For the kickoff.", deadline: "2026-10-23", deadline_quote: "by Friday", project: "Marketing", urls: ["https://docs.google.com/doc/abc"] },
          { assignee: "laura", title: "Print it", context: "", deadline: "2026-10-30", deadline_quote: "end of next week", project: "", urls: ["https://made-up.example.com"] },
        ],
      },
      base
    );
    expect(r.isTaskRequest).toBe(true);
    expect(r.tasks[0]).toMatchObject({ deadline: "2026-10-23", deadlineQuote: "by Friday", project: "Marketing", urls: ["https://docs.google.com/doc/abc"] });
    expect(r.tasks[1]).toMatchObject({ deadline: null, deadlineQuote: null, project: null, urls: [] });
    expect(r.notes[1].join(" ")).toMatch(/left the deadline empty/);
  });
  it("drops projects that are not options and flags unknown people", () => {
    const r = validateDistilled(
      { is_task_request: true, problem: "", tasks: [{ assignee: "unknown", title: "x", context: "", deadline: "", deadline_quote: "", project: "", urls: [] }, { assignee: "sankhya", title: "Research VHSGs", context: "", deadline: "", deadline_quote: "", project: "Invented project", urls: [] }] },
      base
    );
    expect(r.unknownAssignee).toBe(true);
    expect(r.tasks).toHaveLength(1);
    expect(r.tasks[0]).toMatchObject({ assignee: "sankhya", project: null });
  });
  it("passes questions through", () => {
    expect(validateDistilled({ is_task_request: false, problem: "", tasks: [] }, base).isTaskRequest).toBe(false);
  });
});

function draft(over: Partial<DraftPayload> = {}): DraftPayload {
  return { v: 1, t: "Design the poster", c: "For the kickoff.", u: ["https://docs.google.com/doc/abc"], s: "https://peak-nine.slack.com/archives/C1/p1789464794876149", q: "UNIELS", a: "laura", d: "2026-10-23", dq: "by Friday", p: "Marketing", ...over };
}

describe("draft payload", () => {
  it("round-trips", () => {
    expect(decodeDraft(encodeDraft(draft()))).toEqual(draft());
  });
  it("stays under Slack's 2000-character button limit", () => {
    const big = draft({ c: "z".repeat(5000), u: Array.from({ length: 4 }, (_, i) => `https://example.org/${"p".repeat(300)}${i}`) });
    const s = encodeDraft(big);
    expect(s.length).toBeLessThanOrEqual(1990);
    expect(decodeDraft(s)?.t).toBe("Design the poster");
  });
  it("rejects junk", () => {
    expect(decodeDraft("not json")).toBeNull();
    expect(decodeDraft(JSON.stringify({ v: 2 }))).toBeNull();
  });
});

describe("draft card", () => {
  it("has the pickers, the buttons and a value Slack accepts", () => {
    const blocks = draftBlocks(draft(), { boards: DEFAULT_BOARDS, projectOptions: PROJECTS });
    const fields = blocks.find((b) => b.block_id === "p9task_fields");
    expect(fields.elements.map((e: any) => e.action_id)).toEqual(["p9task_owner", "p9task_deadline", "p9task_project"]);
    expect(fields.elements[0].initial_option.value).toBe("laura");
    expect(fields.elements[1].initial_date).toBe("2026-10-23");
    expect(fields.elements[2].initial_option.value).toBe("Marketing");
    const buttons = blocks.find((b) => b.block_id === "p9task_buttons");
    expect(buttons.elements.map((e: any) => e.action_id)).toEqual(["p9task_create", "p9task_edit", "p9task_discard"]);
    for (const b of buttons.elements) expect(b.value.length).toBeLessThanOrEqual(2000);
    expect(JSON.stringify(blocks)).toContain("Deadline taken from “by Friday”");
  });
  it("asks for a deadline when none was said", () => {
    const blocks = draftBlocks(draft({ d: null, dq: null, p: null }), { boards: DEFAULT_BOARDS, projectOptions: PROJECTS });
    const fields = blocks.find((b) => b.block_id === "p9task_fields");
    expect(fields.elements[1].initial_date).toBeUndefined();
    expect(fields.elements[2].initial_option).toBeUndefined();
    expect(JSON.stringify(blocks)).toContain("No deadline in the conversation");
  });
});

describe("picker state", () => {
  it("reads the pickers and applies them to the draft", () => {
    const state = {
      p9task_fields: {
        p9task_owner: { type: "static_select", selected_option: { value: "sankhya" } },
        p9task_deadline: { type: "datepicker", selected_date: "2026-10-30" },
        p9task_project: { type: "static_select", selected_option: { value: "__none__" } },
      },
    };
    const f = readFieldState(state);
    expect(f).toEqual({ owner: "sankhya", deadline: "2026-10-30", project: null });
    expect(applyFieldState(draft(), f)).toMatchObject({ a: "sankhya", d: "2026-10-30", dq: null, p: null });
  });
  it("leaves the draft alone when the pickers were not touched", () => {
    expect(applyFieldState(draft(), readFieldState({}))).toEqual(draft());
  });
});

describe("Notion row", () => {
  it("matches the board's columns", () => {
    const props = notionProperties(DEFAULT_BOARDS[0], {
      title: "Design the poster",
      context: "For the kickoff.",
      deadline: "2026-10-23",
      project: "Marketing",
      urls: ["https://docs.google.com/doc/abc"],
      source: "https://peak-nine.slack.com/archives/C1/p1",
      ownerNotionId: "2d1d872b-594c-8145-ac7e-00025e996fbe",
    });
    expect(Object.keys(props).sort()).toEqual(["Deadline", "Owner", "Project", "Resources", "Status", "Text", "Title"]);
    expect(props.Status).toEqual({ select: { name: "To Start" } });
    expect(props.Deadline).toEqual({ date: { start: "2026-10-23" } });
    expect(props.Owner).toEqual({ people: [{ id: "2d1d872b-594c-8145-ac7e-00025e996fbe" }] });
    expect(props.Resources.rich_text.map((r: any) => r.text.link?.url).filter(Boolean)).toEqual([
      "https://docs.google.com/doc/abc",
      "https://peak-nine.slack.com/archives/C1/p1",
    ]);
  });
  it("leaves empty fields out", () => {
    const props = notionProperties(DEFAULT_BOARDS[1], { title: "x", context: "", deadline: null, project: null, urls: [], source: null, ownerNotionId: null });
    expect(Object.keys(props).sort()).toEqual(["Status", "Title"]);
  });
});

describe("board config", () => {
  it("recognises the boards with or without dashes", () => {
    expect(isTaskBoardDatabase("c4f4ed2a-82bf-467e-b290-fa670606a2e7")).toBe(true);
    expect(isTaskBoardDatabase("8b8f90869c124b19a093f4f7aa9c53e5")).toBe(true);
    expect(isTaskBoardDatabase("4f4662ba-9475-4e85-80a2-23d2572073e3")).toBe(false);
  });
  it("can add a board from TASK_BOARDS", () => {
    const boards = loadBoards({ TASK_BOARDS: JSON.stringify([{ key: "Diego", name: "Diego", databaseId: "aaaa-bbbb" }]) });
    expect(boards).toHaveLength(1);
    expect(boards[0]).toMatchObject({ key: "diego", databaseId: "aaaabbbb", newStatus: "To Start", ownerMeans: "requester" });
  });
  it("falls back to the defaults on bad JSON", () => {
    expect(loadBoards({ TASK_BOARDS: "{oops" })).toBe(DEFAULT_BOARDS);
  });
});
