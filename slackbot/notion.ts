/**
 * Notion tools for Pidgi (internal integration token).
 *
 * The bot authenticates as a Notion internal integration using a single secret
 * token (NOTION_TOKEN). The integration can only see and change pages or
 * databases that a human has explicitly shared with it ("connections") in
 * Notion. The bot then reads and writes those, addressed by their Notion IDs.
 *
 * Enabled only when NOTION_TOKEN is set.
 *
 * Capabilities (project pages, read + write):
 *   - notion_search                 find pages / databases by text
 *   - notion_get_page               read a page's properties + content blocks
 *   - notion_query_database         list rows of a database
 *   - notion_create_page            create a page (standalone or as a DB row)
 *   - notion_append_blocks          add content to the bottom of a page
 *   - notion_update_page_properties update a page's / DB-row's properties
 *   - notion_update_block           replace the text of one existing block
 *
 * Notes / honest limits:
 *   - The API edits content block-by-block. "Append" and "create" are clean;
 *     rewriting existing prose is one block at a time via notion_update_block.
 *   - Notion property values must match each property's type exactly. Read the
 *     page or database first (get_page / query_database) to learn the schema,
 *     then pass a matching `properties` object.
 */
import { Client } from "@notionhq/client";

// Pinned, stable Notion API version. If a newer database feature misbehaves,
// this is the first thing to revisit.
const NOTION_VERSION = "2022-06-28";

// Block types that carry editable rich text (used by notion_update_block).
const TEXT_BLOCK_TYPES = new Set([
  "paragraph",
  "heading_1",
  "heading_2",
  "heading_3",
  "bulleted_list_item",
  "numbered_list_item",
  "to_do",
  "toggle",
  "quote",
  "callout",
  "code",
]);

export function notionEnabled(): boolean {
  return !!process.env.NOTION_TOKEN;
}

function notionClient(): Client {
  const auth = process.env.NOTION_TOKEN;
  if (!auth) throw new Error("NOTION_TOKEN is not set");
  return new Client({ auth, notionVersion: NOTION_VERSION });
}

// Pull a human-readable title from a page, database, or DB-row object.
function titleOf(obj: any): string {
  const props = obj?.properties || {};
  for (const key of Object.keys(props)) {
    const p = props[key];
    if (p?.type === "title") {
      const t = (p.title || []).map((r: any) => r.plain_text).join("");
      return t || "(untitled)";
    }
  }
  if (Array.isArray(obj?.title)) {
    const t = obj.title.map((r: any) => r.plain_text).join("");
    return t || "(untitled)";
  }
  return "(untitled)";
}

// Flatten one block to a short, readable line for the model.
function blockToLine(b: any): string {
  const t = b?.type;
  const rich = b?.[t]?.rich_text;
  const txt = Array.isArray(rich) ? rich.map((r: any) => r.plain_text).join("") : "";
  const checked = t === "to_do" ? (b[t]?.checked ? "[x] " : "[ ] ") : "";
  return `${b.id} <${t}> ${checked}${txt}`.trim();
}

// Convert a simple [{type, text, checked?}] spec into Notion block objects.
function toBlocks(blocks: any[]): any[] {
  return (blocks || []).map((b) => {
    const type = b?.type || "paragraph";
    if (type === "divider") return { object: "block", type: "divider", divider: {} };
    const payload: any = { object: "block", type };
    const rich = [{ type: "text", text: { content: String(b?.text ?? "") } }];
    payload[type] = { rich_text: rich };
    if (type === "to_do") payload[type].checked = !!b?.checked;
    if (type === "code") payload[type].language = b?.language || "plain text";
    return payload;
  });
}

// Convert a simple [{name, type, options?}] column spec into Notion DB properties.
// Notion's API cannot create a true "status" property, so "status" -> "select".
function buildDbProperties(columns: any[]): any {
  const props: any = {};
  let hasTitle = false;
  for (const c of columns || []) {
    const name = c?.name;
    if (!name) continue;
    const type = String(c?.type || "text").toLowerCase();
    if (type === "title") { props[name] = { title: {} }; hasTitle = true; }
    else if (type === "text" || type === "rich_text") props[name] = { rich_text: {} };
    else if (type === "person" || type === "people") props[name] = { people: {} };
    else if (type === "date") props[name] = { date: {} };
    else if (type === "number") props[name] = { number: {} };
    else if (type === "checkbox") props[name] = { checkbox: {} };
    else if (type === "url") props[name] = { url: {} };
    else if (type === "select" || type === "status" || type === "multi_select") {
      const opts = (c.options || []).map((o: any) => (typeof o === "string" ? { name: o } : { name: o.name, color: o.color }));
      props[name] = type === "multi_select" ? { multi_select: { options: opts } } : { select: { options: opts } };
    } else props[name] = { rich_text: {} };
  }
  if (!hasTitle) {
    const first = (columns || [])[0]?.name;
    props[first || "Name"] = { title: {} };
  }
  return props;
}

export const notionToolDefs = [
  {
    name: "notion_search",
    description:
      "Search Notion for pages and databases by text. Only returns items shared with the bot's integration. Use this first to find the ID of a project page or database before reading or editing it.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Text to search for (page/database titles)" },
        object_type: { type: "string", enum: ["page", "database"], description: "Optional: restrict to pages or databases" },
        page_size: { type: "number", description: "Max results (default 25)" },
      },
      required: ["query"],
    },
  },
  {
    name: "notion_get_page",
    description:
      "Read a Notion page: its properties (the schema/values) and its content blocks (each with its block ID). Read this before updating properties or editing a block, so you know the exact property names and block IDs.",
    input_schema: {
      type: "object",
      properties: {
        page_id: { type: "string", description: "Notion page ID" },
      },
      required: ["page_id"],
    },
  },
  {
    name: "notion_query_database",
    description:
      "List rows of a Notion database. Optionally pass Notion `filter` and `sorts` objects (same shape as the Notion API). Returns each row's id, title and properties. Use this to find a specific project row to update.",
    input_schema: {
      type: "object",
      properties: {
        database_id: { type: "string", description: "Notion database ID" },
        filter: { type: "object", description: "Optional Notion filter object" },
        sorts: { type: "array", items: { type: "object" }, description: "Optional Notion sorts array" },
        page_size: { type: "number", description: "Max rows (default 25)" },
      },
      required: ["database_id"],
    },
  },
  {
    name: "notion_create_page",
    description:
      "Create a new Notion page. Provide EITHER parent_database_id (to add a row to a database) OR parent_page_id (to add a sub-page). For a database row you MUST pass a `properties` object that matches that database's schema (read it first with notion_query_database); the title goes in the database's title property. For a sub-page, just pass `title`. Optionally pass `content` blocks to fill the page body.",
    input_schema: {
      type: "object",
      properties: {
        parent_database_id: { type: "string", description: "Add the page as a row in this database" },
        parent_page_id: { type: "string", description: "Add the page as a child of this page" },
        title: { type: "string", description: "Title (used for a sub-page parent)" },
        properties: { type: "object", description: "Notion properties object (required for a database parent)" },
        content: {
          type: "array",
          description: "Optional body blocks: [{type, text, checked?, language?}]. type one of paragraph, heading_1..3, bulleted_list_item, numbered_list_item, to_do, quote, callout, code, divider.",
          items: { type: "object" },
        },
      },
      required: [],
    },
  },
  {
    name: "notion_append_blocks",
    description:
      "Append content blocks to the bottom of an existing Notion page (the clean way to add a plan summary, notes, or a section). Does not touch existing content.",
    input_schema: {
      type: "object",
      properties: {
        page_id: { type: "string", description: "Page (or block) ID to append under" },
        content: {
          type: "array",
          description: "Blocks to add: [{type, text, checked?, language?}]. type one of paragraph, heading_1..3, bulleted_list_item, numbered_list_item, to_do, quote, callout, code, divider.",
          items: { type: "object" },
        },
      },
      required: ["page_id", "content"],
    },
  },
  {
    name: "notion_update_page_properties",
    description:
      "Update a page's / database-row's properties (e.g. set Status, a date, an owner). Pass a `properties` object matching the schema (read the page or database first). Set archived:true to archive (soft-delete) a page.",
    input_schema: {
      type: "object",
      properties: {
        page_id: { type: "string", description: "Page ID" },
        properties: { type: "object", description: "Notion properties object to set" },
        archived: { type: "boolean", description: "Optional: true to archive the page" },
      },
      required: ["page_id"],
    },
  },
  {
    name: "notion_update_block",
    description:
      "Replace the text of ONE existing content block, keeping its type. Get the block ID from notion_get_page first. Works only on text-bearing blocks (paragraph, headings, list items, to_do, quote, callout, code).",
    input_schema: {
      type: "object",
      properties: {
        block_id: { type: "string", description: "Block ID to edit" },
        text: { type: "string", description: "New plain text for the block" },
      },
      required: ["block_id", "text"],
    },
  },
  {
    name: "notion_create_database",
    description:
      "Create a new Notion database (e.g. a project Agenda) under a page. Provide parent_page_id, a title, and columns. Each column is {name, type, options?}. type is one of: title, text, person, date, number, checkbox, url, select, status, multi_select. Exactly one column must be type 'title'. IMPORTANT: Notion's API cannot create a true 'status' property, so 'status' is created as a 'select' with the same options. By default the database is created inline on the page. Add rows afterwards with notion_create_page using parent_database_id.",
    input_schema: {
      type: "object",
      properties: {
        parent_page_id: { type: "string", description: "Page the database lives under" },
        title: { type: "string", description: "Database title" },
        inline: { type: "boolean", description: "Show inline on the page (default true)" },
        columns: {
          type: "array",
          description: "[{name, type, options?}]; options is a list of strings or {name,color} for select/status/multi_select.",
          items: { type: "object" },
        },
      },
      required: ["parent_page_id", "title", "columns"],
    },
  },
];

export async function handleNotionTool(name: string, input: any): Promise<{ text: string; isError: boolean }> {
  try {
    const c = notionClient();

    if (name === "notion_search") {
      const res: any = await c.search({
        query: input.query,
        filter: input.object_type ? { property: "object", value: input.object_type } : undefined,
        page_size: input.page_size || 25,
      });
      const items = (res.results || []).map((r: any) => ({
        id: r.id,
        object: r.object,
        title: titleOf(r),
        url: r.url,
      }));
      return { text: JSON.stringify({ data: items }, null, 2), isError: false };
    }

    if (name === "notion_get_page") {
      const page: any = await c.pages.retrieve({ page_id: input.page_id });
      const blocks: any = await c.blocks.children.list({ block_id: input.page_id, page_size: 100 });
      const out = {
        id: page.id,
        title: titleOf(page),
        url: page.url,
        properties: page.properties,
        content: (blocks.results || []).map(blockToLine),
        has_more_blocks: !!blocks.has_more,
      };
      return { text: JSON.stringify(out, null, 2), isError: false };
    }

    if (name === "notion_query_database") {
      const res: any = await c.databases.query({
        database_id: input.database_id,
        filter: input.filter,
        sorts: input.sorts,
        page_size: input.page_size || 25,
      });
      const rows = (res.results || []).map((r: any) => ({
        id: r.id,
        title: titleOf(r),
        url: r.url,
        properties: r.properties,
      }));
      return { text: JSON.stringify({ data: rows, has_more: !!res.has_more }, null, 2), isError: false };
    }

    if (name === "notion_create_page") {
      let parent: any;
      let properties: any = input.properties || {};
      if (input.parent_database_id) {
        parent = { database_id: input.parent_database_id };
        if (!input.properties) {
          return {
            text: "notion_create_page needs a `properties` object for a database parent (at least the title property). Read the database schema with notion_query_database first.",
            isError: true,
          };
        }
      } else if (input.parent_page_id) {
        parent = { page_id: input.parent_page_id };
        properties = { title: { title: [{ text: { content: input.title || "Untitled" } }] } };
      } else {
        return { text: "notion_create_page needs either parent_database_id or parent_page_id.", isError: true };
      }
      const res: any = await c.pages.create({
        parent,
        properties,
        children: toBlocks(input.content),
      });
      return { text: JSON.stringify({ id: res.id, url: res.url }, null, 2), isError: false };
    }

    if (name === "notion_append_blocks") {
      const res: any = await c.blocks.children.append({
        block_id: input.page_id,
        children: toBlocks(input.content),
      });
      return { text: JSON.stringify({ appended: (res.results || []).length }, null, 2), isError: false };
    }

    if (name === "notion_update_page_properties") {
      const body: any = { page_id: input.page_id };
      if (input.properties) body.properties = input.properties;
      if (input.archived !== undefined) body.archived = input.archived;
      const res: any = await c.pages.update(body);
      return { text: JSON.stringify({ id: res.id, updated: true }, null, 2), isError: false };
    }

    if (name === "notion_update_block") {
      const blk: any = await c.blocks.retrieve({ block_id: input.block_id });
      const type = blk?.type;
      if (!TEXT_BLOCK_TYPES.has(type)) {
        return { text: `Block ${input.block_id} is a "${type}" block, which has no editable text. Only text blocks can be updated.`, isError: true };
      }
      const body: any = { block_id: input.block_id };
      body[type] = { rich_text: [{ type: "text", text: { content: input.text } }] };
      const res: any = await c.blocks.update(body);
      return { text: JSON.stringify({ id: res.id, updated: true }, null, 2), isError: false };
    }

    if (name === "notion_create_database") {
      if (!input.parent_page_id) return { text: "notion_create_database needs parent_page_id.", isError: true };
      const params: any = {
        parent: { type: "page_id", page_id: input.parent_page_id },
        title: [{ type: "text", text: { content: input.title || "Database" } }],
        is_inline: input.inline !== false,
        properties: buildDbProperties(input.columns || []),
      };
      const res: any = await c.databases.create(params);
      return { text: JSON.stringify({ id: res.id, url: res.url }, null, 2), isError: false };
    }

    return { text: `Unknown Notion tool: ${name}`, isError: true };
  } catch (e: any) {
    return { text: `Notion error in ${name}: ${e?.message || e}`, isError: true };
  }
}
