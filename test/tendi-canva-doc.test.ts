import { mkdtempSync } from "fs";
import os from "os";
import path from "path";
import { beforeAll, describe, expect, it } from "vitest";

process.env.TENDI_DATA_DIR = mkdtempSync(path.join(os.tmpdir(), "tendi-canva-"));

// A page shaped like the Philea doc's "Understanding" page (structure copied from a real read on 8 Oct 2026, text shortened).
const fmt = (o: any = {}) => ({ fontSize: 12.8, fontWeight: "normal", fontStyle: "normal", color: "#0e0e0c", link: "", listMarker: "none", ...o });
const PAGE = {
  type: "fixed",
  id: "PBpage4",
  dimensions: { width: 794, height: 1123 },
  isEditable: true,
  elements: [
    { id: "LBbg", locator_id: "PBpage4-LBbg", type: "rect", top: 0, left: 0, width: 794, height: 1123, fill: { media: { type: "image", mediaId: "M1" } } },
    { id: "LBlogo", locator_id: "PBpage4-LBlogo", type: "shape", top: 38, left: 657, width: 76, height: 45, paths: [{ fill: { media: { type: "image", mediaId: "M2" } } }] },
    { id: "LBhead", locator_id: "PBpage4-LBhead", type: "text", top: 44, left: 60, width: 288, height: 13, textRegions: [{ characters: "1 · UNDERSTANDING OF THE ASSIGNMENT", formatting: fmt({ fontSize: 11.46, fontWeight: "bold", color: "#2a2a28" }) }] },
    {
      id: "LBbrief",
      locator_id: "PBpage4-LBbrief",
      type: "text",
      top: 240,
      left: 60,
      width: 327,
      height: 300,
      textRegions: [
        { characters: "WHAT WE READ IN YOUR BRIEF\n", formatting: fmt({ fontSize: 10.93, fontWeight: "bold", color: "#6b6b66" }) },
        { characters: "Philea came out of a merger.", formatting: fmt() },
        { characters: " fewer stand-alone activities.", formatting: fmt({ fontWeight: "bold" }) },
        { characters: "\n", formatting: fmt() },
      ],
    },
    {
      id: "LBaround",
      locator_id: "PBpage4-LBaround",
      type: "text",
      top: 560,
      left: 60,
      width: 327,
      height: 200,
      textRegions: [
        { characters: "WHAT WE READ AROUND IT\n", formatting: fmt({ fontSize: 10.93, fontWeight: "bold", color: "#6b6b66" }) },
        { characters: "three memberships to date", formatting: fmt({ link: "https://philea.eu/membership", decoration: "underline" }) },
      ],
    },
    { id: "LBfoot", locator_id: "PBpage4-LBfoot", type: "text", top: 1080, left: 60, width: 289, height: 12, textRegions: [{ characters: "Peak Nine for Philea · 1 · Understanding of the assignment", formatting: fmt({ fontSize: 10.66 }) }] },
  ],
};

let doc: typeof import("../tendi/canva-doc.js");
beforeAll(async () => {
  doc = await import("../tendi/canva-doc.js");
});

function mapOf() {
  return { designId: "DAHtestcopy1", transactionId: "txn1", pages: [doc.parsePage(PAGE, 1)], at: 0 };
}

describe("canva-doc: mapping a fixed page", () => {
  it("keys text boxes in reading order and lists images apart from the background", () => {
    const p = doc.parsePage(PAGE, 4);
    expect(p.elements.map((e) => e.key)).toEqual(["p4.bg1", "p4.i2", "p4.t1", "p4.t2", "p4.t3", "p4.t4"]);
    const brief = p.elements.find((e) => e.key === "p4.t2")!;
    expect(brief.runs!.map((r) => r.style)).toEqual(["10.9pt bold #6b6b66", "12.8pt", "12.8pt bold", "12.8pt"]);
    const text = doc.renderMap({ designId: "D", transactionId: "t", pages: [p], at: 0 });
    expect(text).toContain('p4.t3 [top 560');
    expect(text).toContain("link https://philea.eu/membership");
    expect(text).not.toContain('r3 '); // whitespace-only runs are not listed
  });
});

describe("canva-doc: planning edits", () => {
  it("rewrites run by run so each run keeps its style", () => {
    const { pages, problems } = doc.planFill(mapOf(), [{ key: "p1.t2", runs: { "0": "WHAT WE READ IN YOUR TERMS OF REFERENCE", "1": "Oxfam asks for two leadership meetings.\nA second paragraph.", "2": "" } }]);
    expect(problems).toEqual([]);
    const ops = pages[0].operations;
    expect(ops.every((o) => o.type === "find_and_replace_text" && o.locator_id === "PBpage4-LBbrief")).toBe(true);
    // the label's trailing line break is not part of the find, so the paragraph break stays
    expect(ops.map((o) => o.find_text)).toContain("WHAT WE READ IN YOUR BRIEF");
    expect(ops.find((o) => o.find_text === " fewer stand-alone activities.")!.replace_text).toBe("");
  });

  it("refuses whole-box text on a box with several styles", () => {
    const { pages, problems } = doc.planFill(mapOf(), [{ key: "p1.t2", text: "flat" }, { key: "p1.t1", text: "1 · UNDERSTANDING" }]);
    expect(problems.join(" ")).toMatch(/p1\.t2: has 3 different styles/);
    expect(pages[0].operations).toEqual([{ type: "replace_text", locator_id: "PBpage4-LBhead", text: "1 · UNDERSTANDING" }]);
  });

  it("clears old client links, deletes images, and puts page-wide swaps last", () => {
    const { pages } = doc.planFill(mapOf(), [{ key: "p1.t3", clear_links: true }, { key: "p1.i2", delete: true }], [{ find: "Peak Nine for Philea", replace: "Peak Nine for Oxfam" }]);
    const ops = pages[0].operations;
    expect(ops[0]).toEqual({ type: "format_text", locator_id: "PBpage4-LBaround", formatting: { link: "", decoration: "none" } });
    expect(ops[1]).toEqual({ type: "delete_element", locator_id: "PBpage4-LBlogo" });
    expect(ops[2]).toEqual({ type: "find_and_replace_text", locator_id: "PBpage4", find_text: "Peak Nine for Philea", replace_text: "Peak Nine for Oxfam" });
  });

  it("flags unknown keys and empty runs", () => {
    const { problems } = doc.planFill(mapOf(), [{ key: "p9.t1", text: "x" }, { key: "p1.t2", runs: { "3": "x" } }]);
    expect(problems).toHaveLength(2);
  });
});

describe("canva-doc: checking the result", () => {
  it("warns when a box grows into the box below it or past the page", () => {
    const before = doc.parsePage(PAGE, 1);
    const after = JSON.parse(JSON.stringify(PAGE));
    after.elements[3].height = 420; // brief box now ends at 660, the box below starts at 560
    after.elements[4].height = 600; // around box now ends at 1160
    const w = doc.fitWarnings(before, after, ["p1.t2", "p1.t3"]);
    expect(w.join("\n")).toMatch(/p1\.t2 grew 120 px and now overlaps p1\.t3/);
    expect(w.join("\n")).toMatch(/p1\.t3 grew 400 px and now runs past the bottom/);
  });

  it("keeps keys stable after a delete", () => {
    const before = doc.parsePage(PAGE, 1);
    const after = JSON.parse(JSON.stringify(PAGE));
    after.elements.splice(2, 1); // header deleted
    const re = doc.rekey(doc.parsePage(after, 1), before);
    expect(re.elements.find((e) => e.locator === "PBpage4-LBbrief")!.key).toBe("p1.t2");
  });

  it("finds leftovers per page", () => {
    const left = doc.findTerms([{ page: 2, text: "Peak Nine for Oxfam" }, { page: 5, text: "the General Assembly in Turin" }], ["Philea", "Turin"]);
    expect(left).toEqual([expect.stringMatching(/"Turin" still on page 5/)]);
  });
});

describe("canva-doc: the fill tool against a fake Canva", () => {
  it("applies, reports thumbnails, saves only on commit, and scans for leftovers", async () => {
    const calls: any[] = [];
    const fake: any = async (tool: string, input: any) => {
      calls.push({ tool, input });
      if (tool === "read-design" && input.open_transaction) return { isError: false, text: JSON.stringify({ page_metadata: [{ index: 1 }], transaction: { transaction_id: "txnA" } }) };
      if (tool === "read-design" && input.transaction_id) return { isError: false, text: JSON.stringify({ design_content: { pages: [PAGE] } }) };
      if (tool === "read-design") return { isError: false, text: JSON.stringify({ design_content: "Peak Nine for Oxfam · Understanding" }) };
      if (tool === "edit-design" && input.operations) {
        const page = JSON.parse(JSON.stringify(PAGE));
        page.elements[3].height = 330;
        return { isError: false, text: JSON.stringify({ edit_operation_results: input.operations.map(() => ({ status: "applied_unverified" })), document: { page } }), images: [{ data: "aGk=", mimeType: "image/png" }] };
      }
      return { isError: false, text: JSON.stringify({ status: input.finalize }) };
    };
    const m = await doc.canvaDocMap(fake, { design_id: "DAHfakecopy1" });
    expect(m.isError).toBe(false);
    expect(m.text).toContain("p1.t2");
    const f = await doc.canvaDocFill(fake, { design_id: "DAHfakecopy1", edits: [{ key: "p1.t2", runs: { "1": "Oxfam asks for two meetings." } }] });
    expect(f.text).toMatch(/Page 1: 1 change/);
    expect(f.text).toMatch(/Not saved yet/);
    expect(f.images).toHaveLength(1);
    expect(calls.some((c) => c.input.finalize === "commit")).toBe(false);
    const c = await doc.canvaDocFill(fake, { design_id: "DAHfakecopy1", finalize: "commit", check_terms: ["Philea"] });
    expect(c.text).toMatch(/Saved in Canva/);
    expect(c.text).toMatch(/No leftovers found for: Philea/);
    expect(calls.filter((x) => x.input.finalize === "commit")).toHaveLength(1);
  });

  it("says how to recover when the editing session expired", async () => {
    doc._setMap({ designId: "DAHfakecopy2", transactionId: "old", pages: [doc.parsePage(PAGE, 1)], at: 0 });
    const fake: any = async () => ({ isError: true, text: "Transaction not found or expired" });
    const r = await doc.canvaDocFill(fake, { design_id: "DAHfakecopy2", edits: [{ key: "p1.t1", text: "X" }] });
    expect(r.isError).toBe(true);
    expect(r.text).toMatch(/reapply: true/);
  });
});

describe("canva-doc: failing loudly instead of mapping nothing", () => {
  it("retries once Canva's per-minute limit clears", async () => {
    let n = 0;
    const flaky: any = async () => (++n < 2 ? { isError: true, text: "429 Too Many Requests" } : { isError: false, text: "{}" });
    const r = await doc.withRetry(flaky, 1)("read-design", {});
    expect(r.isError).toBe(false);
    expect(n).toBe(2);
  });

  it("returns Canva's answer when it holds no page structure", async () => {
    const fake: any = async (_t: string, input: any) =>
      input.open_transaction ? { isError: false, text: JSON.stringify({ page_metadata: [{ index: 1 }], transaction: { transaction_id: "t" } }) } : { isError: false, text: "Something unexpected" };
    const r = await doc.canvaDocMap(fake, { design_id: "DAHfakecopy3" });
    expect(r.isError).toBe(true);
    expect(r.text).toMatch(/no page structure.*Something unexpected/);
  });

  it("reads design_content that arrives as a JSON string", async () => {
    const fake: any = async (_t: string, input: any) =>
      input.open_transaction
        ? { isError: false, text: JSON.stringify({ page_metadata: [{ index: 1 }], transaction: { transaction_id: "t" } }) }
        : { isError: false, text: JSON.stringify({ design_content: JSON.stringify({ pages: [PAGE] }) }) };
    const r = await doc.canvaDocMap(fake, { design_id: "DAHfakecopy4" });
    expect(r.isError).toBe(false);
    expect(r.text).toContain("p1.t2");
  });
});

describe("canva bridge: thumbnails stay images", () => {
  it("falls back to structured content when there is no text", async () => {
    const { splitContent } = await import("../tendi/canva.js");
    expect(splitContent({ content: [], structuredContent: { design_content: { pages: [] } } }).text).toBe('{"design_content":{"pages":[]}}');
  });

  it("splits text and image blocks", async () => {
    const { splitContent } = await import("../tendi/canva.js");
    const r = splitContent({ content: [{ type: "text", text: "{\"ok\":1}" }, { type: "image", data: "aGk=", mimeType: "image/png" }] });
    expect(r.text).toBe('{"ok":1}');
    expect(r.images).toEqual([{ data: "aGk=", mimeType: "image/png" }]);
  });
});

// The older Canva tool set (Tendi's connection on 8 Oct 2026). Answer shapes follow canva.dev/docs/mcp/tools.
const V1_OPEN = {
  transaction: { status: "open", transaction_id: "TXN1" },
  edit_design_url: "https://www.canva.com/design/DAHv1copy01/edit",
  richtexts: [
    { element_id: "E_FOOT", page_index: 1, regions: [{ type: "text", text: "Peak Nine for Philea · 1 · Understanding" }], containerElement: { type: "text", position: { top: 1080, left: 60 }, dimension: { width: 289, height: 12 } } },
    { element_id: "E_BRIEF", page_index: 1, regions: [{ type: "text", text: "WHAT WE READ IN YOUR BRIEF\n" }, { type: "text", text: "Philea came out of a merger." }], containerElement: { type: "text", position: { top: 240, left: 60 }, dimension: { width: 327, height: 300 } } },
    { element_id: "E_BELOW", page_index: 1, regions: [{ type: "text", text: "WHAT WE READ AROUND IT" }], containerElement: { type: "text", position: { top: 560, left: 60 }, dimension: { width: 327, height: 200 } } },
  ],
  fills: [{ type: "image", asset_id: "A1", page_index: 1, editable: true, element_id: "E_LOGO" }],
  thumbnails: [{ width: 424, height: 600, url: "https://export-download.canva.com/thumb1.png" }],
  pages: [{ page_id: "PG1", page_number: 1, dimension: { width: 794, height: 1123 }, is_responsive: false, is_empty: false, is_editable: true }],
};

describe("canva-doc: the older Canva tool set", () => {
  function fakeV1() {
    const calls: any[] = [];
    const conn: any = {
      has: (t: string) => ["start-editing-transaction", "perform-editing-operations", "commit-editing-transaction", "cancel-editing-transaction", "get-design-content"].includes(t),
      fetchImage: async (url: string) => ({ data: "aGk=", mimeType: "image/png", url }),
      call: async (tool: string, input: any) => {
        calls.push({ tool, input });
        if (tool === "start-editing-transaction") return { isError: false, text: JSON.stringify(V1_OPEN) };
        if (tool === "perform-editing-operations") {
          const after = JSON.parse(JSON.stringify(V1_OPEN));
          after.richtexts[1].containerElement.dimension.height = 420; // the brief box grew into the box below
          return { isError: false, text: JSON.stringify({ ...after, edit_operation_results: input.operations.map((o: any) => ({ status: "success", operation_info: { type: o.type, element_id: o.element_id } })) }) };
        }
        if (tool === "get-design-content") return { isError: false, text: JSON.stringify({ richtexts: [{ regions: [{ text: "Peak Nine for Oxfam" }] }] }) };
        return { isError: false, text: JSON.stringify({ status: "committed" }) };
      },
    };
    return { conn, calls };
  }

  it("maps richtexts and fills into keys", async () => {
    const pages = doc.parseV1(V1_OPEN);
    expect(pages[0].elements.map((e) => e.key)).toEqual(["p1.t1", "p1.t2", "p1.t3", "p1.i1"]);
    expect(pages[0].locator).toBe("PG1");
    const { conn } = fakeV1();
    const m = await doc.canvaDocMap(conn, { design_id: "DAHv1copy01" });
    expect(m.isError).toBe(false);
    expect(m.text).toContain("p1.t1 [top 240");
    expect(m.text).toMatch(/no styling or image positions/);
  });

  it("edits with element_id, expands page-wide swaps, fetches the thumbnail and commits with the old tools", async () => {
    const { conn, calls } = fakeV1();
    await doc.canvaDocMap(conn, { design_id: "DAHv1copy02" });
    const f = await doc.canvaDocFill(conn, {
      design_id: "DAHv1copy02",
      edits: [{ key: "p1.t1", runs: { "1": "Oxfam asks for a facilitator and rapporteur for two leadership meetings in Bangkok." } }],
      page_replace: [{ find: "Peak Nine for Philea", replace: "Peak Nine for Oxfam" }],
    });
    const edit = calls.find((c) => c.tool === "perform-editing-operations")!;
    expect(edit.input.page_index).toBe(1);
    expect(edit.input.operations).toEqual([
      { type: "find_and_replace_text", element_id: "E_BRIEF", find_text: "Philea came out of a merger.", replace_text: "Oxfam asks for a facilitator and rapporteur for two leadership meetings in Bangkok." },
      { type: "find_and_replace_text", element_id: "E_FOOT", find_text: "Peak Nine for Philea", replace_text: "Peak Nine for Oxfam" },
    ]);
    expect(f.text).toMatch(/Page 1: 2 changes/);
    expect(f.text).not.toMatch(/problem/); // "success" is fine
    expect(f.text).toMatch(/p1\.t1 grew 120 px and now overlaps p1\.t2/);
    expect(f.images).toHaveLength(1);
    const c = await doc.canvaDocFill(conn, { design_id: "DAHv1copy02", finalize: "commit", check_terms: ["Philea"] });
    expect(calls.some((x) => x.tool === "commit-editing-transaction" && x.input.transaction_id === "TXN1")).toBe(true);
    expect(c.text).toMatch(/No leftovers found for: Philea/);
  });

  it("never replaces a whole multi-run box on the old tools (no styling to check)", async () => {
    const map = { designId: "D", transactionId: "t", pages: doc.parseV1(V1_OPEN), at: 0 };
    const { problems } = doc.planFill(map, [{ key: "p1.t1", text: "flat" }]);
    expect(problems.join(" ")).toMatch(/different styles/);
  });

  it("says which tools are missing when neither set is there", async () => {
    const r = await doc.canvaDocMap({ has: () => false, call: async () => ({ isError: true, text: "" }) } as any, { design_id: "DAHnothing01" });
    expect(r.isError).toBe(true);
    expect(r.text).toMatch(/neither read-design/);
  });
});

describe("canva export: arguments follow the tool's schema", () => {
  it("object format for the newer tool, string format for an older one", async () => {
    const { exportArgs } = await import("../tendi/canva-export.js");
    expect(exportArgs({ properties: { format: { type: "object" } } }, "DAH1", [1, 2], "a4")).toEqual({ design_id: "DAH1", format: { type: "pdf", pages: [1, 2], size: "a4" } });
    expect(exportArgs({ properties: { format: { type: "string" }, pages: { type: "array" } } }, "DAH1", [1, 2], "a4")).toEqual({ design_id: "DAH1", format: "pdf", pages: [1, 2] });
    expect(exportArgs(undefined, "DAH1", null, null)).toEqual({ design_id: "DAH1", format: { type: "pdf" } });
  });
});
