/**
 * Pidgi's general Notion tools must not open or change the private boards (Touchdown for
 * Niels and Jonas, Mothership for Niels) for anyone else, at any depth, and must not add rows
 * to any team board directly. Refusals use one neutral sentence that never names the board.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

const TOUCHDOWN_PAGE = "2d5c675f-f958-800f-919a-ea617356cc23";
const TOUCHDOWN_AGENDA = "2d5c675f-f958-8011-ac09-cd22663b3c68";
const AGENDA_ROW = "aaaa0000-0000-0000-0000-000000000001";
const OPEN_PAGE = "bbbb0000-0000-0000-0000-000000000002";
const MOTHERSHIP = "2d3c675f-f958-8042-8289-ccdb7612c52d";
const MS_ROW = "dddd0000-0000-0000-0000-000000000003";
const MS_SUBPAGE = "eeee0000-0000-0000-0000-000000000004"; // a page inside a Mothership row
const MS_DEEP_BLOCK = "ffff0000-0000-0000-0000-000000000005"; // a block on that sub-page
const STRATEGY = "11110000-0000-0000-0000-000000000006";
const FLAKY = "99990000-0000-0000-0000-000000000009";

const n = (id: string) => String(id).replace(/-/g, "").toLowerCase();
const notFound = () => Object.assign(new Error("Could not find object"), { code: "object_not_found" });

// Pages Notion knows, by dashless id: their parent.
const PAGES: Record<string, any> = {
  [n(AGENDA_ROW)]: { database_id: TOUCHDOWN_AGENDA },
  [n(TOUCHDOWN_PAGE)]: { page_id: STRATEGY },
  [n(STRATEGY)]: { workspace: true },
  [n(OPEN_PAGE)]: { workspace: true },
  [n(MS_ROW)]: { database_id: MOTHERSHIP },
  [n(MS_SUBPAGE)]: { page_id: MS_ROW },
};
const DATABASES: Record<string, any> = {
  [n(TOUCHDOWN_AGENDA)]: { page_id: TOUCHDOWN_PAGE },
  [n(MOTHERSHIP)]: { workspace: true },
};
const BLOCKS: Record<string, any> = {
  cccc: { page_id: AGENDA_ROW },
  [n(MS_DEEP_BLOCK)]: { page_id: MS_SUBPAGE },
};

const calls: string[] = [];
vi.mock("@notionhq/client", () => ({
  Client: class {
    search = async () => {
      calls.push("search");
      const page = (id: string, title: string) => ({ id, object: "page", parent: PAGES[n(id)], properties: { t: { type: "title", title: [{ plain_text: title }] } } });
      return {
        results: [
          page(TOUCHDOWN_PAGE, "Touchdown"),
          page(AGENDA_ROW, "Salary talk"),
          page(OPEN_PAGE, "Allez Circulez"),
          page(MS_ROW, "Call the accountant"),
          page(MS_SUBPAGE, "Accountant notes"),
        ],
      };
    };
    pages = {
      retrieve: async ({ page_id }: any) => {
        if (n(page_id) === n(FLAKY)) throw Object.assign(new Error("socket hang up"), { code: "ECONNRESET" });
        const parent = PAGES[n(page_id)];
        if (!parent) throw notFound();
        return { id: page_id, parent, properties: {} };
      },
      update: async () => (calls.push("update"), { id: "x" }),
      create: async () => (calls.push("create"), { id: "x", url: "u" }),
    };
    databases = {
      retrieve: async ({ database_id }: any) => {
        const parent = DATABASES[n(database_id)];
        if (!parent) throw notFound();
        return { id: database_id, parent };
      },
      query: async () => (calls.push("query"), { results: [] }),
      create: async () => ({ id: "x" }),
    };
    blocks = {
      retrieve: async ({ block_id }: any) => {
        const parent = BLOCKS[n(block_id)];
        if (!parent) throw notFound();
        return { type: "paragraph", parent };
      },
      update: async () => (calls.push("blockUpdate"), { id: "x" }),
      children: {
        list: async () => (
          calls.push("children"),
          {
            results: [
              { id: MOTHERSHIP, type: "child_database", child_database: { title: "👾 Mothership" } },
              { id: "1234", type: "paragraph", paragraph: { rich_text: [{ plain_text: "Welcome" }] } },
            ],
          }
        ),
        append: async () => (calls.push("append"), { results: [] }),
      },
    };
  },
}));

process.env.NOTION_TOKEN = "test";
import { handleNotionTool } from "../slackbot/notion.js";
import { hiddenNotionIds, restrictedNotionIds, PRIVATE_REPLY } from "../slackbot/taskboards.js";

const laura = { hiddenIds: hiddenNotionIds("laura@peaknine.studio") };
const jonas = { hiddenIds: hiddenNotionIds("jonas@peaknine.studio") };
const niels = { hiddenIds: hiddenNotionIds("niels@peaknine.studio") };
const titles = (r: { text: string }) => JSON.parse(r.text).data.map((d: any) => d.title);

describe("Notion guard", () => {
  beforeEach(() => {
    calls.length = 0;
  });

  it("leaves private pages and everything under them out of search", async () => {
    expect(titles(await handleNotionTool("notion_search", { query: "x" }, laura))).toEqual(["Allez Circulez"]);
    expect(titles(await handleNotionTool("notion_search", { query: "x" }, jonas))).toEqual(["Touchdown", "Salary talk", "Allez Circulez"]);
    expect(titles(await handleNotionTool("notion_search", { query: "x" }, niels))).toHaveLength(5);
  });

  it("refuses Touchdown items for others with the neutral sentence", async () => {
    for (const [name, input] of [
      ["notion_get_page", { page_id: TOUCHDOWN_PAGE }],
      ["notion_get_page", { page_id: AGENDA_ROW }],
      ["notion_query_database", { database_id: TOUCHDOWN_AGENDA }],
      ["notion_update_page_properties", { page_id: AGENDA_ROW, properties: {} }],
      ["notion_append_blocks", { page_id: AGENDA_ROW, content: [{ type: "paragraph", text: "x" }] }],
      ["notion_update_block", { block_id: "cccc", text: "x" }],
    ] as const) {
      const r = await handleNotionTool(name, input, laura);
      expect(r.isError, name).toBe(true);
      expect(r.text).toBe(PRIVATE_REPLY);
      expect(r.text).not.toMatch(/touchdown|private/i);
    }
    expect(calls.filter((c) => c !== "search")).toEqual([]);
  });

  it("hides Mothership from Jonas too, at any depth", async () => {
    for (const [name, input] of [
      ["notion_query_database", { database_id: MOTHERSHIP }],
      ["notion_get_page", { page_id: MS_ROW }],
      ["notion_get_page", { page_id: MS_SUBPAGE }],
      ["notion_update_block", { block_id: MS_DEEP_BLOCK, text: "x" }],
      ["notion_create_page", { parent_page_id: MS_SUBPAGE, title: "x" }],
    ] as const) {
      const r = await handleNotionTool(name, input, jonas);
      expect(r.text, name).toBe(PRIVATE_REPLY);
    }
    expect(calls).toEqual([]);
    const own = await handleNotionTool("notion_get_page", { page_id: MS_SUBPAGE }, niels);
    expect(own.isError).toBe(false);
  });

  it("leaves private child databases out of a page's content", async () => {
    const r = await handleNotionTool("notion_get_page", { page_id: OPEN_PAGE }, laura);
    expect(r.isError).toBe(false);
    expect(r.text).not.toContain(n(MOTHERSHIP).slice(0, 8));
    expect(r.text).toContain("Welcome");
    const own = await handleNotionTool("notion_get_page", { page_id: OPEN_PAGE }, niels);
    expect(own.text).toContain(MOTHERSHIP);
  });

  it("fails closed when Notion can't say where a page lives", async () => {
    const r = await handleNotionTool("notion_get_page", { page_id: FLAKY }, laura);
    expect(r.text).toBe(PRIVATE_REPLY);
  });

  it("flags a turn that touched a private board, even for Niels", async () => {
    let flagged = false;
    const onPrivate = () => (flagged = true);
    await handleNotionTool("notion_get_page", { page_id: OPEN_PAGE }, { ...niels, restrictedIds: restrictedNotionIds(), onPrivate });
    expect(flagged).toBe(false);
    await handleNotionTool("notion_get_page", { page_id: MS_SUBPAGE }, { ...niels, restrictedIds: restrictedNotionIds(), onPrivate });
    expect(flagged).toBe(true);
    flagged = false;
    await handleNotionTool("notion_search", { query: "x" }, { ...niels, restrictedIds: restrictedNotionIds(), onPrivate });
    expect(flagged).toBe(true);
  });

  it("lets Niels and Jonas read their own agenda", async () => {
    const r = await handleNotionTool("notion_query_database", { database_id: TOUCHDOWN_AGENDA }, jonas);
    expect(r.isError).toBe(false);
    expect(calls).toContain("query");
  });

  it("still opens ordinary pages for everyone", async () => {
    const r = await handleNotionTool("notion_get_page", { page_id: OPEN_PAGE }, laura);
    expect(r.isError).toBe(false);
  });

  it("blocks new rows on any team board, even for the founders, without naming them", async () => {
    for (const db of ["c4f4ed2a82bf467eb290fa670606a2e7", TOUCHDOWN_AGENDA, "3f9c675ff95880aeb5fdff8f398a60b4", MOTHERSHIP]) {
      const r = await handleNotionTool("notion_create_page", { parent_database_id: db, properties: {} }, niels);
      expect(r.isError).toBe(true);
      expect(r.text).toMatch(/draft card/);
      expect(r.text).not.toMatch(/touchdown|mothership/i);
    }
    expect(calls).not.toContain("create");
  });
});
