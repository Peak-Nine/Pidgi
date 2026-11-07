/**
 * Scale & Sustain Stories, offline. The case below is a SYNTHETIC stand-in shaped like
 * the library's Village Enterprise case (WEB-2026-001): the step labels 2017,
 * 2018-2020, 2021, 2022 come from tendi/sss/prompts/copy-system.md; the texts are
 * placeholders. The live library is checked by `npm run tendi:sss-smoke`.
 */
import { mkdtempSync } from "fs";
import os from "os";
import path from "path";
import { describe, expect, it, beforeEach } from "vitest";

process.env.TENDI_DATA_DIR = mkdtempSync(path.join(os.tmpdir(), "sss-test-"));

import { isEligible, relativeYear, readableCase, parseLibraryHtml, guessOrgWebsite, type LibraryCase } from "../tendi/sss/library";
import { pickCase } from "../tendi/sss/pick-case";
import { validateCopy } from "../tendi/sss/validate-copy";
import { textOps, logoOps, assetIdFrom, exportUrl, type LogoSlot } from "../tendi/sss/canva-build";
import { encodeNotes, decodeNotes, weekStartBrussels, isoDate, buildsThisWeek, brusselsDay } from "../tendi/sss/notion-log";
import { createScaleSustain, loadSssState, saveSssState } from "../tendi/sss/job";
import { weeklyDue } from "../tendi/sss/service";
import { INTRO_TEXT, postText } from "../tendi/sss/slack-messages";
import { sssAllowedUsers } from "../tendi/sss/config";
import { masterTemplateGuard } from "../tendi/canva";
import ve from "../tendi/sss/examples/village-enterprise.json";
import map from "../tendi/sss/template-map.json";

const veCase: LibraryCase = {
  id: "WEB-2026-001",
  org: "Village Enterprise",
  status: "success",
  evidence: "high",
  countryFull: "Kenya and Uganda",
  region: "East Africa",
  theme: "Livelihoods and jobs",
  routes: ["O"],
  summary: "placeholder with a number 241",
  evolution: [
    { label: "2017", text: "step 1" },
    { label: "2018-2020", text: "step 2" },
    { label: "2021", text: "step 3" },
    { label: "2022", text: "step 4" },
  ],
  sources: [{ title: "Village Enterprise", url: "https://villageenterprise.org/our-impact" }],
};
const other = (id: string, extra: Partial<LibraryCase> = {}): LibraryCase => ({ ...veCase, id, org: `Org ${id}`, routes: ["U"], theme: "Health", region: "South Asia", ...extra });

const reply = (o: any) => ({ text: JSON.stringify(o), isError: false });

function mocks() {
  const calls = { canva: [] as { name: string; args: any }[], notion: [] as { method: string; path: string; body: any }[], posts: [] as any[], uploads: 0 };
  const rows: any[] = [];
  const canva = {
    has: () => true,
    async call(name: string, args: any) {
      calls.canva.push({ name, args });
      if (name === "copy-design") return reply({ design: { id: "DAMOCK00001", urls: { edit_url: "https://www.canva.com/d/mock" } } });
      if (name === "read-design") return reply({ transaction: { transaction_id: "tx1" } });
      if (name === "create-upload-url") return reply({ upload_url: "mock://upload" });
      if (name === "edit-design") return reply({ edit_operation_results: [] });
      if (name === "export-design") return reply({ job: { status: "failed" } });
      throw new Error("unexpected " + name);
    },
  };
  const notion = {
    async request(method: string, p: string, body: any) {
      calls.notion.push({ method, path: p, body });
      if (p.endsWith("/query")) return { results: rows, has_more: false };
      if (method === "POST" && p === "pages") return { id: `page${calls.notion.length}`, url: "https://notion.so/x" };
      return {};
    },
  };
  let ts = 100;
  const slack = {
    chat: {
      async postMessage(m: any) {
        calls.posts.push(m);
        return { ts: `${ts++}.0` };
      },
      async getPermalink() {
        return { permalink: "https://slack/p" };
      },
    },
    files: {
      async uploadV2() {
        calls.uploads++;
        return {};
      },
    },
  };
  const anthropic: any = { messages: { create: async () => ({ content: [{ type: "text", text: JSON.stringify(ve.deck) }] }) } };
  return { calls, rows, canva, notion, slack, anthropic };
}

const row = (o: { title: string; notes: string; status?: string; created: string }) => ({
  id: "p-" + o.title,
  url: "https://notion.so/" + encodeURIComponent(o.title),
  created_time: o.created,
  properties: {
    "Post title": { title: [{ plain_text: o.title }] },
    "Manual notes": { rich_text: [{ plain_text: o.notes }] },
    Status: { status: { name: o.status || "Feedback needed" } },
  },
});

describe("Scale & Sustain Stories: library and picking", () => {
  it("relative years and eligibility", () => {
    expect(relativeYear("2018-2020", 2017)).toBe("years 2-4");
    expect(relativeYear("2006-2007", 2006)).toBe("years 1-2");
    expect(isEligible(veCase)).toBe(true);
    expect(isEligible({ ...veCase, evolution: veCase.evolution!.slice(0, 3) })).toBe(false);
    expect(isEligible({ ...veCase, evolution: [...veCase.evolution!.slice(0, 3), { label: "later", text: "x" }] })).toBe(false);
    expect(guessOrgWebsite(veCase)).toBe("https://villageenterprise.org");
  });

  it("parses the library page data", () => {
    const html = `<html><script>const D = ${JSON.stringify({ cases: [veCase], cards: [{ id: "c1", plain: "Outcome payments" }] })};\n</script></html>`;
    const lib = parseLibraryHtml(html);
    expect(lib.cases[0].id).toBe("WEB-2026-001");
    expect(readableCase(lib.cases[0], lib.cards).timeline.map((t) => t.relative_year)).toEqual(["year 1", "years 2-4", "year 5", "year 6"]);
  });

  it("never picks a featured case and prefers a different payer route", () => {
    const cases = [veCase, other("A", { routes: ["O"] }), other("B", { routes: ["G"] })];
    const p = pickCase(cases, { featuredIds: new Set(["WEB-2026-001"]), recent: [{ routes: ["O"], theme: "Livelihoods and jobs" }] });
    expect(p?.id).toBe("B");
    expect(pickCase([veCase], { featuredIds: new Set(["WEB-2026-001"]) })).toBeNull();
  });
});

describe("Scale & Sustain Stories: copy checks and Canva operations", () => {
  it("the approved Village Enterprise copy passes with the right pills", () => {
    const v = validateCopy(ve.deck, veCase);
    expect(v.problems).toEqual([]);
    expect(v.deck.timeline.map((t) => t.pill)).toEqual(["year 1", "years 2-4", "year 5", "year 6"]);
  });

  it("broken copy is caught", () => {
    const bad = JSON.parse(JSON.stringify(ve.deck));
    bad.cover.headline = "A very long headline that goes on and on beyond the fifty-five character limit";
    bad.timeline[0].text = "Launched in autumn 2017 \u2014 with outcome payers";
    bad.takeaways.pop();
    const b = validateCopy(bad, veCase);
    expect(b.problems.some((p) => p.includes("cover.headline"))).toBe(true);
    expect(b.problems.some((p) => p.includes("calendar year"))).toBe(true);
    expect(b.problems.some((p) => p.includes("long dash"))).toBe(true);
    expect(b.problems.some((p) => p.includes("takeaways has 3"))).toBe(true);
  });

  it("text and logo operations, and the page 2 photo is never touched", () => {
    const v = validateCopy(ve.deck, veCase);
    const ops = textOps(v.deck, { title: "t" });
    expect(ops[4]).toHaveLength(12);
    expect(ops[4][0].replace_text).toBe("year 1");
    expect(JSON.stringify(ops)).not.toContain(map.heroImage.id);
    const lo = logoOps(map.logos[1] as LogoSlot, "MEDIA", 3.36);
    expect(lo[0].type).toBe("delete_element");
    expect(Math.abs(lo[1].width - 129.39)).toBeLessThan(0.1);
    expect(logoOps(map.logos[1] as LogoSlot, "MEDIA", 12)[1].width).toBe(330);
    expect(logoOps(map.logos[1] as LogoSlot, null, 1)).toHaveLength(1); // no logo: old one removed, nothing inserted
  });

  it("reads Canva's answers", () => {
    expect(assetIdFrom('{"asset":{"id":"MAF1"}}')).toBe("MAF1");
    expect(assetIdFrom('{"mediaId":"M2"}')).toBe("M2");
    expect(exportUrl({ job: { status: "success", urls: ["https://export-download.canva.com/a.pdf"] } })).toBe("https://export-download.canva.com/a.pdf");
  });

  it("the master design is protected", () => {
    expect(masterTemplateGuard("canva_read-design", { design_id: "DAHZT4MaY2s", open_transaction: true })).toMatch(/master template/);
    expect(masterTemplateGuard("canva_copy-design", { design_id: "DAHZT4MaY2s" })).toBeNull();
  });
});

describe("Scale & Sustain Stories: Notion notes, weeks and schedule", () => {
  it("notes round-trip and Brussels weeks", () => {
    const n = decodeNotes(encodeNotes({ caseId: "X-1", designId: "DABC", slackTs: "1.2", threadTs: "1.0", routes: ["O", "C"], theme: "Health" }));
    expect([n.caseId, n.designId, n.slackTs, n.threadTs, n.routes.join(","), n.theme]).toEqual(["X-1", "DABC", "1.2", "1.0", "O,C", "Health"]);
    expect(isoDate(weekStartBrussels(new Date("2026-11-09T07:30:00Z")))).toBe("2026-11-09");
    expect(isoDate(weekStartBrussels(new Date("2026-11-15T22:30:00Z")))).toBe("2026-11-09");
    // Sunday 23:30 UTC is already Monday in Brussels
    expect(brusselsDay("2026-11-08T23:30:00Z")).toBe("2026-11-09");
  });

  it("Monday 08:30 Brussels in winter and in summer time", () => {
    expect(weeklyDue(new Date("2026-11-09T07:30:00Z"), undefined)).toBe(true); // 08:30 CET
    expect(weeklyDue(new Date("2026-11-09T07:25:00Z"), undefined)).toBe(false); // 08:25
    expect(weeklyDue(new Date("2027-04-05T06:30:00Z"), undefined)).toBe(true); // 08:30 CEST
    expect(weeklyDue(new Date("2027-04-05T06:25:00Z"), undefined)).toBe(false);
    expect(weeklyDue(new Date("2026-11-10T07:30:00Z"), undefined)).toBe(false); // Tuesday
    expect(weeklyDue(new Date("2026-11-09T09:00:00Z"), { monday: "2026-11-09", attempts: 1, done: true })).toBe(false);
    expect(weeklyDue(new Date("2026-11-09T09:00:00Z"), { monday: "2026-11-09", attempts: 2, done: false })).toBe(false);
    expect(weeklyDue(new Date("2026-11-09T09:00:00Z"), { monday: "2026-11-02", attempts: 2, done: true })).toBe(true);
  });

  it("counts builds per week", () => {
    const e = (created: string) => ({ created }) as any;
    expect(buildsThisWeek([e("2026-11-09T08:00:00Z"), e("2026-11-10T08:00:00Z"), e("2026-11-07T08:00:00Z")], new Date("2026-11-11T10:00:00Z"))).toBe(2);
  });

  it("🔁 allowlist falls back to Tendi's writer allowlist, and is empty (nobody) when neither is set", () => {
    expect(sssAllowedUsers({ TENDI_WRITE_ALLOWLIST: "U1, U2" } as any)).toEqual(["U1", "U2"]);
    expect(sssAllowedUsers({ SSS_ALLOWED_SLACK_USER_IDS: "U9", TENDI_WRITE_ALLOWLIST: "U1" } as any)).toEqual(["U9"]);
    expect(sssAllowedUsers({} as any)).toEqual([]);
  });
});

describe("Scale & Sustain Stories: the job with mocks", () => {
  beforeEach(() => saveSssState({ awaitingLogo: {} }));
  const lib = async () => ({ cases: [veCase, other("B", { routes: ["G"] })], cards: {} });

  it("weekly run: builds, logs, posts, and asks for the logo when there is none", async () => {
    const m = mocks();
    const sss = createScaleSustain({ ...m, model: "x", slackToken: "x", channel: "CTEST", allowedUserIds: ["UN"], library: lib, logoLookup: async () => { throw new Error("blocked"); }, log: { info() {}, warn() {}, error() {} } });
    const r: any = await sss.runWeekly(new Date("2026-11-09T07:30:00Z"));
    expect(r.issueNo).toBe(1);
    expect(m.calls.canva[0]).toMatchObject({ name: "copy-design", args: { design_id: "DAHZT4MaY2s" } });
    expect(m.calls.canva.some((c) => c.name === "edit-design" && c.args.finalize === "commit")).toBe(true);
    const created = m.calls.notion.find((c) => c.method === "POST" && c.path === "pages")!;
    expect(created.body.properties.Status.status.name).toBe("Feedback needed");
    expect(created.body.properties["Post title"].title[0].text.content).toMatch(/^Scale & Sustain Stories #01: /);
    expect(m.calls.posts[0].channel).toBe("CTEST");
    expect(m.calls.posts.some((p) => /logo/.test(p.text) && p.thread_ts)).toBe(true);
    expect(Object.keys(loadSssState().awaitingLogo)).toEqual(["DAMOCK00001"]);
  });

  it("skips a week that already has a live post", async () => {
    const m = mocks();
    m.rows.push(row({ title: "Scale & Sustain Stories #01: Village Enterprise", notes: encodeNotes({ caseId: "WEB-2026-001", slackTs: "1.0" }), created: "2026-11-09T07:31:00Z" }));
    const sss = createScaleSustain({ ...m, model: "x", slackToken: "x", channel: "CTEST", allowedUserIds: ["UN"], library: lib, log: { info() {}, warn() {}, error() {} } });
    expect(await sss.runWeekly(new Date("2026-11-09T10:00:00Z"))).toEqual({ skipped: true });
  });

  it("🔁: refuses others, rebuilds for Niels, stops at three builds", async () => {
    const m = mocks();
    m.rows.push(row({ title: "Scale & Sustain Stories #01: Village Enterprise", notes: encodeNotes({ caseId: "WEB-2026-001", slackTs: "5.0" }), created: new Date().toISOString() }));
    const sss = createScaleSustain({ ...m, model: "x", slackToken: "x", channel: "CTEST", allowedUserIds: ["UN"], library: lib, logoLookup: async () => { throw new Error("no"); }, log: { info() {}, warn() {}, error() {} } });
    expect(await sss.handleRepeat({ userId: "USOMEONE", messageTs: "5.0" })).toEqual({ refused: true });
    expect(m.calls.posts.at(-1).text).toMatch(/Only Niels and Jonas/);
    const r: any = await sss.handleRepeat({ userId: "UN", userName: "Niels", messageTs: "5.0" });
    expect(r.issueNo).toBe(2);
    expect(m.calls.notion.some((c) => c.method === "PATCH" && c.body?.properties?.Status?.status?.name === "Review if still relevant")).toBe(true);
    expect(m.calls.posts.find((p) => p.reply_broadcast)?.thread_ts).toBe("5.0");
    m.rows.push(row({ title: "Scale & Sustain Stories #02: B", notes: encodeNotes({ caseId: "B", slackTs: "6.0", threadTs: "5.0" }), created: new Date().toISOString() }));
    m.rows.push(row({ title: "Scale & Sustain Stories #03: C", notes: encodeNotes({ caseId: "C", slackTs: "7.0", threadTs: "5.0" }), created: new Date().toISOString() }));
    expect(await sss.handleRepeat({ userId: "UN", messageTs: "7.0" })).toEqual({ limited: true });
  });

  it("ignores reactions on messages that are not posts", async () => {
    const m = mocks();
    const sss = createScaleSustain({ ...m, model: "x", slackToken: "x", channel: "CTEST", allowedUserIds: ["UN"], library: lib, log: { info() {}, warn() {}, error() {} } });
    expect(await sss.handleRepeat({ userId: "UN", messageTs: "999.0" })).toEqual({ ignored: true });
    expect(sss.isRepeatSignal({ type: "reaction_added", reaction: "repeat" })).toBe(true);
    expect(sss.isRepeatSignal({ type: "message", text: "another one :repeat:" })).toBe(true);
    expect(sss.isRepeatSignal({ type: "reaction_added", reaction: "thumbsup" })).toBe(false);
  });

  it("a logo reply only acts on a thread that waits for a logo", async () => {
    const m = mocks();
    const sss = createScaleSustain({ ...m, model: "x", slackToken: "x", channel: "CTEST", library: lib, log: { info() {}, warn() {}, error() {} } });
    expect(await sss.handleLogoReply({ threadTs: "1.0", files: [], text: "https://x.org/logo.png" })).toEqual({ ignored: true });
  });

  it("intro: posts the intro and #01, finds the existing entry, runs once per channel", async () => {
    const m = mocks();
    m.rows.push(row({ title: "Scale & Sustain Stories #01: Village Enterprise", notes: encodeNotes({ caseId: "WEB-2026-001", designId: "DAHaON1C8Z4" }), created: "2026-11-07T10:00:00Z" }));
    const sss = createScaleSustain({ ...m, model: "x", slackToken: "x", channel: "CTEST", library: lib, log: { info() {}, warn() {}, error() {} } });
    const r: any = await sss.postIntro();
    expect(r.posted).toBe(true);
    expect(m.calls.posts[0].text).toBe(INTRO_TEXT);
    expect(m.calls.posts[1].text).toMatch(/Scale & Sustain Stories #01: Village Enterprise/);
    expect(m.calls.notion.some((c) => c.method === "POST" && c.path === "pages")).toBe(false);
    const patch = m.calls.notion.find((c) => c.method === "PATCH" && c.path === "pages/p-Scale & Sustain Stories #01: Village Enterprise")!;
    expect(patch.body.properties["Manual notes"].rich_text[0].text.content).toContain("slack:101.0");
    expect(m.calls.canva.every((c) => c.name === "export-design" && c.args.design_id === "DAHaON1C8Z4")).toBe(true);
    expect((await sss.postIntro()).skipped).toBe(true);
  });

  it("house style: no long dashes in what Tendi posts", () => {
    const t = postText({ issueNo: 1, org: "X", why: "w", canvaUrl: "u", notionUrl: "n", caseLink: "l", tags: ["X"], hasLogo: false, notesForTeam: "n", exportNote: "e" });
    expect(/[—–]/.test(INTRO_TEXT + t)).toBe(false);
  });
});
