import { describe, it, expect } from "vitest";
import { chunkText, cleanSlackText, dateInfo, weekdayOf } from "../tendi/text.js";

describe("tendi/text cleanSlackText", () => {
  it("strips the bot mention and other mentions", () => {
    expect(cleanSlackText("<@U0TENDI> new proposal for <@U123> please", "U0TENDI")).toBe("new proposal for please");
  });
  it("unwraps Slack links and unescapes entities", () => {
    expect(cleanSlackText("see <https://example.org/rfp|the RFP> &amp; <https://peaknine.studio>")).toBe(
      "see the RFP (https://example.org/rfp) & https://peaknine.studio"
    );
  });
  it("keeps channel names readable", () => {
    expect(cleanSlackText("posted in <#C123|enabel>")).toBe("posted in #enabel");
  });
});

describe("tendi/text chunkText", () => {
  it("returns one chunk for short text", () => {
    expect(chunkText("hello\n\nworld")).toEqual(["hello\n\nworld"]);
  });
  it("splits on paragraph boundaries under the cap", () => {
    const paras = Array.from({ length: 12 }, (_, i) => `Paragraph ${i} ` + "x".repeat(600));
    const chunks = chunkText(paras.join("\n\n"), 2900);
    expect(chunks.length).toBeGreaterThan(1);
    for (const c of chunks) expect(c.length).toBeLessThanOrEqual(2900);
    expect(chunks.join("\n\n")).toBe(paras.join("\n\n"));
  });
  it("breaks an oversize paragraph on line ends", () => {
    const lines = Array.from({ length: 80 }, (_, i) => `line ${i} ` + "y".repeat(70));
    const chunks = chunkText(lines.join("\n"), 1000);
    for (const c of chunks) expect(c.length).toBeLessThanOrEqual(1000);
    expect(chunks.join("\n").replace(/\n+/g, "\n")).toBe(lines.join("\n"));
  });
});

describe("tendi/text dates", () => {
  it("knows weekdays without timezone drift", () => {
    expect(weekdayOf("2026-10-07")).toBe("Wednesday");
    expect(weekdayOf("2026-10-10")).toBe("Saturday");
    expect(weekdayOf("not-a-date")).toBe("?");
  });
  it("lists working days in a range", () => {
    const out = dateInfo({ start: "2026-10-05", end: "2026-10-11" });
    expect(out.working_day_count).toBe(5);
    expect(out.working_days[0]).toEqual({ date: "2026-10-05", weekday: "Monday" });
    expect(out.working_days[4]).toEqual({ date: "2026-10-09", weekday: "Friday" });
  });
  it("rejects a bad range", () => {
    expect(dateInfo({ start: "2026-10-11", end: "2026-10-05" }).range_error).toBeTruthy();
  });
});

describe("tendi/canva write gating", () => {
  it("treats reads as reads and mutations as writes", async () => {
    const { isCanvaWriteTool } = await import("../tendi/canva.js");
    expect(isCanvaWriteTool("canva_list-comments")).toBe(false);
    expect(isCanvaWriteTool("canva_get-design-content")).toBe(false);
    expect(isCanvaWriteTool("canva_search-designs")).toBe(false);
    expect(isCanvaWriteTool("canva_copy-design")).toBe(true);
    expect(isCanvaWriteTool("canva_perform-editing-operations")).toBe(true);
    expect(isCanvaWriteTool("canva_commit-editing-transaction")).toBe(true);
    expect(isCanvaWriteTool("canva_export-design")).toBe(false);
  });
});
