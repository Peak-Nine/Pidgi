import { describe, it, expect } from "vitest";
import {
  DEFAULT_BOARDS,
  DEFAULT_TEAM,
  applyFieldState,
  boardsFor,
  hiddenNotionIds,
  notionChildren,
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
  mentionsHiddenBoard,
  addableBoardsFor,
  notionProperties,
  PRIVATE_REPLY,
  restrictedNotionIds,
  scrubPrivate,
  parseSlackPermalinks,
  readFieldState,
  slackToPlain,
  validateDistilled,
  type DraftPayload,
} from "../slackbot/taskboards.js";

const PROJECTS = ["Takeda", "KBS Allez Circulez", "Marketing"];
const PROJECTS_BY_BOARD = { laura: PROJECTS, sankhya: PROJECTS, team: ["KBS", "INTERNAL", "BE YOUTH"] };
const LAURA = DEFAULT_BOARDS[0];
const SANKHYA = DEFAULT_BOARDS[1];
const TOUCHDOWN = DEFAULT_BOARDS.find((b) => b.key === "touchdown")!;
const TEAMSYNC = DEFAULT_BOARDS.find((b) => b.key === "team")!;

describe("looksLikeTaskRequest", () => {
  it("fires on task words in English and Dutch", () => {
    for (const t of [
      "turn this into a new task for Laura",
      "make a todo for Sankhya by Friday",
      "maak hier een taak van voor Laura",
      "add these as to-dos for sankhya",
      "Task for Laura: poster",
      "put this on the touchdown agenda",
      "zet dit op de agenda van de teammeeting",
      "add it to the team sync",
      "talking point for the sync please",
      "zet dit op de agenda",
      "add to Laura's board that she could polish our Linkedin Services pages - deadline 30/10",
      "zet dit op het bord van Sankhya",
      "put this on Sankhya's board",
      "zet dit op mijn mothership",
      "put this on Jonas and Niels' 1:1",
      "can you add this to the 1-on-1 of Niels and Jonas",
      "add it to their one on one",
      "zet dit op de één-op-één van Jonas en Niels",
      "for the founders' meeting please",
    ]) {
      expect(looksLikeTaskRequest(t), t).toBe(true);
    }
  });
  it("stays quiet on ordinary planning questions", () => {
    for (const t of [
      "how much capacity does Jonas have next week?",
      "plan 2 days for Laura on Ethias",
      "multitasking is hard",
      "what's on my agenda today?",
      "wat staat er op mijn agenda morgen",
      "check my agenda for Friday",
      "show me the finance dashboard",
      "onboarding for the new intern",
      "schedule a meeting at 11:15",
      "the ratio is 1:10",
    ]) {
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
  const base = { boards: DEFAULT_BOARDS, projectOptions: PROJECTS_BY_BOARD, team: DEFAULT_TEAM, sourceText: source, today: "2026-10-21" };

  it("keeps a deadline only when its words are in the conversation", () => {
    const r = validateDistilled(
      {
        is_task_request: true,
        problem: "",
        tasks: [
          { board: "laura", title: "Design the poster", context: "For the kickoff.", deadline: "2026-10-23", deadline_quote: "by Friday", project: "Marketing", urls: ["https://docs.google.com/doc/abc"] },
          { board: "laura", title: "Print it", context: "", deadline: "2026-10-30", deadline_quote: "end of next week", project: "", urls: ["https://made-up.example.com"] },
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
      { is_task_request: true, problem: "", tasks: [{ board: "unknown", title: "x", context: "", deadline: "", deadline_quote: "", project: "", urls: [] }, { board: "sankhya", title: "Research VHSGs", context: "", deadline: "", deadline_quote: "", project: "Invented project", urls: [] }] },
      base
    );
    expect(r.unknownBoard).toBe(true);
    expect(r.tasks).toHaveLength(1);
    expect(r.tasks[0]).toMatchObject({ board: "sankhya", project: null });
  });
  it("checks projects per board and keeps a named person only on meeting boards", () => {
    const r = validateDistilled(
      {
        is_task_request: true,
        problem: "",
        tasks: [
          { board: "team", title: "Marketing plan for 2027", context: "", deadline: "", deadline_quote: "", project: "INTERNAL", responsible: "Sankhya", urls: [] },
          { board: "team", title: "Same, wrong project", context: "", deadline: "", deadline_quote: "", project: "Marketing", responsible: "Mystery", urls: [] },
          { board: "laura", title: "Poster", context: "", deadline: "", deadline_quote: "", project: "", responsible: "Jonas", urls: [] },
        ],
      },
      base
    );
    expect(r.tasks[0]).toMatchObject({ project: "INTERNAL", responsible: "sankhya@peaknine.studio" });
    expect(r.tasks[1]).toMatchObject({ project: null, responsible: null });
    expect(r.tasks[2]).toMatchObject({ responsible: null });
  });
  it("refuses a board the requester may not use", () => {
    const r = validateDistilled(
      { is_task_request: true, problem: "", tasks: [{ board: "touchdown", title: "Talk about pay", context: "", deadline: "", deadline_quote: "", project: "", responsible: "", urls: [] }] },
      { ...base, boards: boardsFor("laura@peaknine.studio") }
    );
    expect(r.tasks).toHaveLength(0);
    expect(r.unknownBoard).toBe(true);
  });
  it("passes questions through", () => {
    expect(validateDistilled({ is_task_request: false, problem: "", tasks: [] }, base).isTaskRequest).toBe(false);
  });
});

function draft(over: Partial<DraftPayload> = {}): DraftPayload {
  return { v: 1, t: "Design the poster", c: "For the kickoff.", u: ["https://docs.google.com/doc/abc"], s: "https://peak-nine.slack.com/archives/C1/p1789464794876149", q: "UNIELS", a: "laura", d: "2026-10-23", dq: "by Friday", p: "Marketing", r: null, ...over };
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
    expect(fields.elements[0].options.map((o: any) => o.value)).toEqual(["laura", "sankhya", "jonas", "niels", "touchdown", "mothership", "events", "team"]);
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

describe("meeting board cards", () => {
  it("offers a person picker and no project on the Touchdown agenda", () => {
    const blocks = draftBlocks(draft({ a: "touchdown", p: null, r: "jonas@peaknine.studio", d: null, dq: null }), {
      boards: DEFAULT_BOARDS,
      projectOptions: [],
      team: DEFAULT_TEAM,
    });
    const fields = blocks.find((b) => b.block_id === "p9task_fields");
    expect(fields.elements.map((e: any) => e.action_id)).toEqual(["p9task_owner", "p9task_deadline", "p9task_resp"]);
    expect(fields.elements[2].initial_option.value).toBe("jonas@peaknine.studio");
    expect(JSON.stringify(blocks)).toContain("Draft for the Touchdown agenda");
    expect(JSON.stringify(blocks)).toContain("No deadline. Pick one above if it needs one.");
  });
  it("hides private boards from people outside the circle", () => {
    const blocks = draftBlocks(draft(), { boards: boardsFor("sankhya@peaknine.studio"), projectOptions: PROJECTS, team: DEFAULT_TEAM });
    const fields = blocks.find((b) => b.block_id === "p9task_fields");
    expect(fields.elements[0].options.map((o: any) => o.value)).toEqual(["laura", "sankhya", "jonas", "niels", "events", "team"]);
  });
});

describe("access to private boards", () => {
  it("only Niels and Jonas can use the Touchdown agenda", () => {
    expect(boardsFor("niels@peaknine.studio").map((b) => b.key)).toContain("touchdown");
    expect(boardsFor("JONAS@peaknine.studio").map((b) => b.key)).toContain("touchdown");
    expect(boardsFor("laura@peaknine.studio").map((b) => b.key)).not.toContain("touchdown");
    expect(boardsFor("").map((b) => b.key)).not.toContain("touchdown");
  });
  it("hides the whole Touchdown page from everyone else", () => {
    expect(hiddenNotionIds("niels@peaknine.studio")).toEqual([]);
    const hidden = hiddenNotionIds("bertille@peaknine.studio");
    expect(hidden).toContain("2d5c675ff9588011ac09cd22663b3c68"); // ✨ Agenda
    expect(hidden).toContain("2d5c675ff958800f919aea617356cc23"); // the page
    expect(hidden).toContain("2d5c675ff95880d9a06fe8671241f612"); // mental check-in
    expect(hidden).not.toContain("3f9c675ff95880aeb5fdff8f398a60b4"); // team talking points stay open
  });
  it("Mothership and the Must Win Battle Board are Niels only, Jonas included", () => {
    expect(boardsFor("niels@peaknine.studio").map((b) => b.key)).toContain("mothership");
    expect(boardsFor("jonas@peaknine.studio").map((b) => b.key)).not.toContain("mothership");
    const jonas = hiddenNotionIds("jonas@peaknine.studio");
    expect(jonas).toContain("2d3c675ff95880428289ccdb7612c52d"); // 👾 Mothership
    expect(jonas).toContain("2d3c675ff9588031805c000b7f320c36"); // its Pending Tasks data source
    expect(jonas).toContain("2d5c675ff95880c1ba91cb520bc70bde"); // ♟️ Must Win Battle Board
    expect(jonas).not.toContain("2d5c675ff9588011ac09cd22663b3c68"); // Touchdown stays shared with Jonas
    expect(restrictedNotionIds()).toEqual(expect.arrayContaining(["2d3c675ff95880428289ccdb7612c52d", "2d5c675ff9588011ac09cd22663b3c68"]));
  });
  it("spots a private board named by someone outside it, and only then", () => {
    expect(mentionsHiddenBoard("what's on the Touchdown agenda?", "laura@peaknine.studio")).toBe(true);
    expect(mentionsHiddenBoard("what's on the Touchdown agenda?", "jonas@peaknine.studio")).toBe(false);
    expect(mentionsHiddenBoard("show me Niels's MOTHERSHIP", "jonas@peaknine.studio")).toBe(true);
    expect(mentionsHiddenBoard("the must win battle board", "sankhya@peaknine.studio")).toBe(true);
    expect(mentionsHiddenBoard("show me Niels's mothership", "niels@peaknine.studio")).toBe(false);
    expect(mentionsHiddenBoard("plan the poster with Laura", "")).toBe(false);
    expect(mentionsHiddenBoard("mothershipping", "")).toBe(false);
  });
  it("lets the whole team add to Touchdown, but not read it", () => {
    expect(addableBoardsFor("laura@peaknine.studio").map((b) => b.key)).toEqual(["laura", "sankhya", "jonas", "niels", "touchdown", "events", "team"]);
    expect(boardsFor("laura@peaknine.studio").map((b) => b.key)).not.toContain("touchdown");
    expect(hiddenNotionIds("laura@peaknine.studio")).toContain("2d5c675ff9588011ac09cd22663b3c68");
    expect(mentionsHiddenBoard("put this on the touchdown", "laura@peaknine.studio", undefined, { exceptAddable: true })).toBe(false);
    expect(mentionsHiddenBoard("put this on the mothership", "laura@peaknine.studio", undefined, { exceptAddable: true })).toBe(true);
    expect(mentionsHiddenBoard("what's on the touchdown?", "laura@peaknine.studio")).toBe(true);
  });
  it("turns an answer that names a hidden board into the neutral line", () => {
    expect(scrubPrivate("Your Touchdown agenda has 3 items.", "laura@peaknine.studio")).toBe(PRIVATE_REPLY);
    expect(scrubPrivate("Your Touchdown agenda has 3 items.", "jonas@peaknine.studio")).toBe("Your Touchdown agenda has 3 items.");
    expect(PRIVATE_REPLY).not.toMatch(/private|touchdown|mothership/i);
  });
});

describe("picker state", () => {
  it("reads the pickers and applies them to the draft", () => {
    const state = {
      p9task_fields: {
        p9task_owner: { type: "static_select", selected_option: { value: "sankhya" } },
        p9task_deadline: { type: "datepicker", selected_date: "2026-10-30" },
        p9task_project: { type: "static_select", selected_option: { value: "__none__" } },
        p9task_resp: { type: "static_select", selected_option: { value: "diego@peaknine.studio" } },
      },
    };
    const f = readFieldState(state);
    expect(f).toEqual({ owner: "sankhya", deadline: "2026-10-30", project: null, responsible: "diego@peaknine.studio" });
    expect(applyFieldState(draft(), f)).toMatchObject({ a: "sankhya", d: "2026-10-30", dq: null, p: null, r: "diego@peaknine.studio" });
  });
  it("leaves the draft alone when the pickers were not touched", () => {
    expect(applyFieldState(draft(), readFieldState({}))).toEqual(draft());
  });
});

describe("Jonas's and Niels's Magic Boards", () => {
  it("are open to the whole team and never hidden", () => {
    for (const who of ["laura@peaknine.studio", "sankhya@peaknine.studio", ""]) {
      const keys = boardsFor(who).map((b) => b.key);
      expect(keys).toEqual(expect.arrayContaining(["jonas", "niels"]));
      expect(hiddenNotionIds(who)).not.toEqual(expect.arrayContaining(["8813eb7c68df44b8a402e2d8f1c6e3e1"]));
      expect(hiddenNotionIds(who)).not.toEqual(expect.arrayContaining(["f74c675ff9588294980d0175bfabc929"]));
    }
  });
  it("write to their own Backlog with Laura's columns", () => {
    const jonas = DEFAULT_BOARDS.find((b) => b.key === "jonas")!;
    const niels = DEFAULT_BOARDS.find((b) => b.key === "niels")!;
    expect(jonas.databaseId).toBe("8813eb7c68df44b8a402e2d8f1c6e3e1");
    expect(niels.databaseId).toBe("f74c675ff9588294980d0175bfabc929");
    expect(jonas.fields).toBe(LAURA.fields);
    expect(niels.fields).toBe(LAURA.fields);
  });
  it("keep 'niels' for Niels's board and 'my board' for his Mothership", () => {
    const ms = DEFAULT_BOARDS.find((b) => b.key === "mothership")!;
    expect(ms.aliases).not.toContain("niels");
    expect(ms.aliases).toContain("my board");
    expect(DEFAULT_BOARDS.find((b) => b.key === "niels")!.aliases).toContain("niels");
  });
});

describe("events list", () => {
  const EVENTS = DEFAULT_BOARDS.find((b) => b.key === "events")!;
  it("is open to the whole team and triggered by event words", () => {
    expect(boardsFor("laura@peaknine.studio").map((b) => b.key)).toContain("events");
    expect(looksLikeTaskRequest("put this on the events list")).toBe(true);
    expect(looksLikeTaskRequest("zet dit evenement op de lijst")).toBe(true);
  });
  it("keeps an end date only when its words are in the conversation and it isn't before the start", () => {
    const base = { boards: DEFAULT_BOARDS, projectOptions: { events: ["Aid", "Systems"] }, team: DEFAULT_TEAM, sourceText: "Summit on 12-13 November", today: "2026-10-24" };
    const ev = (end: string, quote: string) =>
      validateDistilled(
        { is_task_request: true, tasks: [{ board: "events", title: "Summit", context: "", deadline: "2026-11-12", deadline_quote: "12-13 November", end_date: end, end_date_quote: quote, project: "Systems", responsible: "", urls: [] }] },
        base
      ).tasks[0];
    expect(ev("2026-11-13", "12-13 November")).toMatchObject({ deadline: "2026-11-12", endDate: "2026-11-13", project: "Systems" });
    expect(ev("2026-11-13", "14 November").endDate).toBeNull();
    expect(ev("2026-11-10", "12-13 November").endDate).toBeNull();
  });
  it("labels the card's pickers Start date and Theme", () => {
    const blocks = draftBlocks({ v: 1, t: "Summit", c: "", u: [], s: null, q: "U1", a: "events", d: "2026-11-12", dq: "12-13 November", p: null, e: "2026-11-13" }, {
      boards: DEFAULT_BOARDS,
      projectOptions: ["Aid", "Systems"],
    });
    const fields = blocks.find((b) => b.block_id === "p9task_fields");
    expect(fields.elements.map((e: any) => e.placeholder?.text)).toEqual(["Which board?", "Start date", "Theme"]);
    expect(JSON.stringify(blocks)).toContain("Ends ");
  });
  it("fills the Events columns", () => {
    const props = notionProperties(EVENTS, {
      title: "Summit",
      context: "x",
      deadline: "2026-11-12",
      endDate: "2026-11-13",
      project: "Systems",
      urls: ["https://a.example/x", "https://b.example"],
      source: null,
      requesterNotionId: "n1",
      assigneeNotionId: null,
    });
    expect(Object.keys(props).sort()).toEqual(["End date", "Event name", "Link", "Owner", "Start date", "Theme"]);
    expect(props.Theme).toEqual({ multi_select: [{ name: "Systems" }] });
    expect(props.Link).toEqual({ url: "https://a.example/x" });
  });
});

describe("Notion row", () => {
  it("fills Mothership's columns: multi-select project and the Tasks tag", () => {
    const ms = DEFAULT_BOARDS.find((b) => b.key === "mothership")!;
    const props = notionProperties(ms, {
      title: "Call the accountant",
      context: "Q4 invoices",
      deadline: "2026-10-30",
      project: "P9 - Sales",
      urls: [],
      source: null,
      requesterNotionId: null,
      assigneeNotionId: null,
    });
    expect(Object.keys(props).sort()).toEqual(["Due Date", "Project", "Tags", "Task"]);
    expect(props.Project).toEqual({ multi_select: [{ name: "P9 - Sales" }] });
    expect(props.Tags).toEqual({ multi_select: [{ name: "Tasks" }] });
    expect(props["Due Date"]).toEqual({ date: { start: "2026-10-30" } });
  });
  it("matches the board's columns", () => {
    const props = notionProperties(LAURA, {
      title: "Design the poster",
      context: "For the kickoff.",
      deadline: "2026-10-23",
      project: "Marketing",
      urls: ["https://docs.google.com/doc/abc"],
      source: "https://peak-nine.slack.com/archives/C1/p1",
      requesterNotionId: "2d1d872b-594c-8145-ac7e-00025e996fbe",
      assigneeNotionId: "380d872b-594c-81ad-9c03-000226cbb638",
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
    const props = notionProperties(SANKHYA, { title: "x", context: "", deadline: null, project: null, urls: [], source: null, requesterNotionId: null, assigneeNotionId: null });
    expect(Object.keys(props).sort()).toEqual(["Status", "Title"]);
  });
  it("fills the Touchdown agenda's own columns, with a real status", () => {
    const props = notionProperties(TOUCHDOWN, {
      title: "Pricing for Allez Circulez 2027",
      context: "Decide the price per team.",
      deadline: "2026-10-26",
      project: "Marketing",
      urls: ["https://docs.google.com/doc/abc"],
      source: "https://peak-nine.slack.com/archives/C1/p1",
      requesterNotionId: "2d1d872b-594c-8145-ac7e-00025e996fbe",
      assigneeNotionId: "274d872b-594c-81ae-9cba-0002e52cea03",
    });
    expect(Object.keys(props).sort()).toEqual(["Assignee", "Description", "Due date", "Status", "Task name"]);
    expect(props.Status).toEqual({ status: { name: "Not started" } });
    const body = JSON.stringify(notionChildren(TOUCHDOWN, { context: "Decide the price per team.", urls: ["https://docs.google.com/doc/abc"], requesterName: "Niels", today: "2026-10-21", source: null, deadlineQuote: null }));
    expect(body).toContain("https://docs.google.com/doc/abc"); // no Resources column, so links go in the body
    expect(body).not.toContain("Decide the price per team."); // context already in Description
  });
  it("fills the team talking points' columns", () => {
    const props = notionProperties(TEAMSYNC, {
      title: "Marketing plan for 2027",
      context: "Where do we start?",
      deadline: null,
      project: "INTERNAL",
      urls: [],
      source: null,
      requesterNotionId: "380d872b-594c-8109-a350-000220c26f19",
      assigneeNotionId: null,
    });
    expect(props).toEqual({
      Task: { title: [{ type: "text", text: { content: "Marketing plan for 2027" } }] },
      ".": { status: { name: "Not started" } },
      Project: { select: { name: "INTERNAL" } },
      Creator: { people: [{ id: "380d872b-594c-8109-a350-000220c26f19" }] },
    });
    const body = JSON.stringify(notionChildren(TEAMSYNC, { context: "Where do we start?", urls: [], requesterName: "Sankhya", today: "2026-10-21", source: null, deadlineQuote: null }));
    expect(body).toContain("Where do we start?"); // no text column, so the context goes in the body
  });
});

describe("board config", () => {
  it("recognises the boards with or without dashes", () => {
    expect(isTaskBoardDatabase("c4f4ed2a-82bf-467e-b290-fa670606a2e7")).toBe(true);
    expect(isTaskBoardDatabase("8b8f90869c124b19a093f4f7aa9c53e5")).toBe(true);
    expect(isTaskBoardDatabase("2d5c675f-f958-8011-ac09-cd22663b3c68")).toBe(true);
    expect(isTaskBoardDatabase("3f9c675ff95880aeb5fdff8f398a60b4")).toBe(true);
    expect(isTaskBoardDatabase("4f4662ba-9475-4e85-80a2-23d2572073e3")).toBe(false);
  });
  it("can add a board from TASK_BOARDS", () => {
    const boards = loadBoards({ TASK_BOARDS: JSON.stringify([{ key: "Diego", name: "Diego", databaseId: "aaaa-bbbb" }]) });
    expect(boards).toHaveLength(1);
    expect(boards[0]).toMatchObject({ key: "diego", kind: "person", label: "Diego's board", databaseId: "aaaabbbb" });
    expect(boards[0].fields.requester).toBe("Owner");
  });
  it("falls back to the defaults on bad JSON", () => {
    expect(loadBoards({ TASK_BOARDS: "{oops" })).toBe(DEFAULT_BOARDS);
  });
});
