/**
 * Pidgi's general Notion tools must not open or change the private Touchdown page for
 * people outside Niels and Jonas, and must not add rows to any team board directly.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

const TOUCHDOWN_PAGE = "2d5c675f-f958-800f-919a-ea617356cc23";
const TOUCHDOWN_AGENDA = "2d5c675f-f958-8011-ac09-cd22663b3c68";
const AGENDA_ROW = "aaaa0000-0000-0000-0000-000000000001";
const OPEN_PAGE = "bbbb0000-0000-0000-0000-000000000002";

const calls: string[] = [];
vi.mock("@notionhq/client", () => ({
  Client: class {
    search = async () => {
      calls.push("search");
      return {
        results: [
          { id: TOUCHDOWN_PAGE, object: "page", parent: { page_id: "strategy" }, properties: { title: { type: "title", title: [{ plain_text: "Touchdown" }] } } },
          { id: AGENDA_ROW, object: "page", parent: { database_id: TOUCHDOWN_AGENDA }, properties: { n: { type: "title", title: [{ plain_text: "Salary talk" }] } } },
          { id: OPEN_PAGE, object: "page", parent: { page_id: "projects" }, properties: { n: { type: "title", title: [{ plain_text: "Allez Circulez" }] } } },
        ],
      };
    };
    pages = {
      retrieve: async ({ page_id }: any) => {
        if (page_id === AGENDA_ROW) return { id: AGENDA_ROW, parent: { database_id: TOUCHDOWN_AGENDA }, properties: {} };
        if (page_id === TOUCHDOWN_PAGE) return { id: TOUCHDOWN_PAGE, parent: { page_id: "strategy" }, properties: {} };
        if (page_id === "cccc") throw new Error("Could not find page with ID: cccc"); // a block, not a page
        return { id: page_id, parent: { page_id: "projects" }, properties: {} };
      },
      update: async () => (calls.push("update"), { id: "x" }),
      create: async () => (calls.push("create"), { id: "x", url: "u" }),
    };
    blocks = {
      retrieve: async () => ({ type: "paragraph", parent: { page_id: AGENDA_ROW } }),
      update: async () => (calls.push("blockUpdate"), { id: "x" }),
      children: { list: async () => (calls.push("children"), { results: [] }), append: async () => (calls.push("append"), { results: [] }) },
    };
    databases = { query: async () => (calls.push("query"), { results: [] }), create: async () => ({ id: "x" }) };
  },
}));

process.env.NOTION_TOKEN = "test";
import { handleNotionTool } from "../slackbot/notion.js";
import { hiddenNotionIds } from "../slackbot/taskboards.js";

const outsider = { hiddenIds: hiddenNotionIds("laura@peaknine.studio") };
const founder = { hiddenIds: hiddenNotionIds("jonas@peaknine.studio") };

describe("Notion guard", () => {
  beforeEach(() => {
    calls.length = 0;
  });

  it("leaves the Touchdown page and its rows out of search for others", async () => {
    const r = await handleNotionTool("notion_search", { query: "touchdown" }, outsider);
    const titles = JSON.parse(r.text).data.map((d: any) => d.title);
    expect(titles).toEqual(["Allez Circulez"]);
    const all = await handleNotionTool("notion_search", { query: "touchdown" }, founder);
    expect(JSON.parse(all.text).data).toHaveLength(3);
  });

  it("refuses to open, query or change Touchdown items for others", async () => {
    for (const [name, input] of [
      ["notion_get_page", { page_id: TOUCHDOWN_PAGE }],
      ["notion_get_page", { page_id: AGENDA_ROW }],
      ["notion_query_database", { database_id: TOUCHDOWN_AGENDA }],
      ["notion_update_page_properties", { page_id: AGENDA_ROW, properties: {} }],
      ["notion_append_blocks", { page_id: AGENDA_ROW, content: [{ type: "paragraph", text: "x" }] }],
      ["notion_update_block", { block_id: "cccc", text: "x" }],
    ] as const) {
      const r = await handleNotionTool(name, input, outsider);
      expect(r.isError, name).toBe(true);
      expect(r.text).toMatch(/private/);
    }
    expect(calls.filter((c) => c !== "search")).toEqual([]);
  });

  it("lets Niels and Jonas read their own agenda", async () => {
    const r = await handleNotionTool("notion_query_database", { database_id: TOUCHDOWN_AGENDA }, founder);
    expect(r.isError).toBe(false);
    expect(calls).toContain("query");
  });

  it("still opens ordinary pages for everyone", async () => {
    const r = await handleNotionTool("notion_get_page", { page_id: OPEN_PAGE }, outsider);
    expect(r.isError).toBe(false);
  });

  it("blocks new rows on any team board, even for the founders", async () => {
    for (const db of ["c4f4ed2a82bf467eb290fa670606a2e7", TOUCHDOWN_AGENDA, "3f9c675ff95880aeb5fdff8f398a60b4"]) {
      const r = await handleNotionTool("notion_create_page", { parent_database_id: db, properties: {} }, founder);
      expect(r.isError).toBe(true);
      expect(r.text).toMatch(/draft card/);
    }
    expect(calls).not.toContain("create");
  });
});
