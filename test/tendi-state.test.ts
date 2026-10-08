import { describe, it, expect, beforeAll } from "vitest";
import { mkdtempSync } from "fs";
import os from "os";
import path from "path";

beforeAll(() => {
  process.env.TENDI_DATA_DIR = mkdtempSync(path.join(os.tmpdir(), "tendi-test-"));
});

describe("tendi/state", () => {
  it("round-trips a thread through disk", async () => {
    const { newThread, saveThread, loadThread, threadExists, applyWorkspaceUpdate } = await import("../tendi/state.js");
    const t = newThread("C1", "1700000000.000100");
    applyWorkspaceUpdate(t.workspace, {
      proposal_type: "rfp-philea",
      client: "Philea",
      facts: { deadline: "25 Sept 2026, 18:00 CET", currency: "EUR" },
      open_items: ["Jonas bio", "tax line"],
      draft_status: "questions out",
      links: { canva: "https://www.canva.com/design/x/edit" },
    });
    t.history.push({ role: "user", content: "hello" }, { role: "assistant", content: "hi" });
    t.sources.push({ name: "rfp.pdf", chars: 5, text: "abcde", added: Date.now() });
    expect(saveThread(t)).toBe(true);
    expect(threadExists("C1", "1700000000.000100")).toBe(true);
    const back = loadThread("C1", "1700000000.000100");
    expect(back?.workspace.client).toBe("Philea");
    expect(back?.workspace.facts.currency).toBe("EUR");
    expect(back?.workspace.open_items).toEqual(["Jonas bio", "tax line"]);
    expect(back?.history.length).toBe(2);
    expect(back?.sources[0].text).toBe("abcde");
    expect(loadThread("C1", "nope")).toBeNull();
  });

  it("merges maps, deletes with empty strings, ignores bad types", async () => {
    const { emptyWorkspace, applyWorkspaceUpdate } = await import("../tendi/state.js");
    const ws = emptyWorkspace();
    applyWorkspaceUpdate(ws, { facts: { a: "1", b: "2" }, proposal_type: "bogus" });
    applyWorkspaceUpdate(ws, { facts: { a: "" }, decisions: { rate: "EUR 950/day" } });
    expect(ws.facts).toEqual({ b: "2" });
    expect(ws.decisions.rate).toBe("EUR 950/day");
    expect(ws.proposal_type).toBe("unknown");
  });

  it("trims history to a valid, bounded alternation", async () => {
    const { trimHistory, HISTORY_MAX } = await import("../tendi/state.js");
    const h: any[] = [];
    for (let i = 0; i < HISTORY_MAX + 7; i++) h.push({ role: i % 2 ? "assistant" : "user", content: `m${i}` });
    const out = trimHistory(h);
    expect(out.length).toBeLessThanOrEqual(HISTORY_MAX);
    expect(out[0].role).toBe("user");
    const big = [
      { role: "user", content: "x".repeat(150_000) },
      { role: "assistant", content: "y".repeat(100_000) },
      { role: "user", content: "last question" },
      { role: "assistant", content: "last answer" },
    ] as any[];
    const trimmed = trimHistory(big);
    expect(trimmed[0].role).toBe("user");
    expect(JSON.stringify(trimmed).length).toBeLessThan(180_000 + 1000);
  });

  it("describes the workspace for the prompt", async () => {
    const { newThread, describeWorkspace } = await import("../tendi/state.js");
    const t = newThread("C2", "1");
    t.workspace.client = "Acme";
    t.sources.push({ name: "brief.docx", chars: 1234, text: "", added: 0 });
    const d = describeWorkspace(t);
    expect(d).toContain("client: Acme");
    expect(d).toContain("brief.docx (1234 chars)");
  });
});
