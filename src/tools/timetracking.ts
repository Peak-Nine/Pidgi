/**
 * Teamleader Time Tracking Tools
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { TeamleaderClient } from "../api/client.js";
import type {
  TimeTracking,
  TeamleaderListResponse,
} from "../types/index.js";
import {
  getResolvedGroup, setResolvedGroup,
  getResolvedProject, setResolvedProject,
  getResolvedCustomer, setResolvedCustomer,
  getResolvedUser, setResolvedUser,
} from "../api/cache.js";

function respond(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

// ── Helpers (exported for testing) ────────────────────────────────────────────

export function dateToDDMMYYYY(iso: string): string {
  if (!iso || !iso.includes("-")) return iso || "?";
  const [y, m, d] = iso.substring(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

export function buildManicTimeMemo(entry: { client_name: string; group: string; task: string; project: string }): string {
  const parts: string[] = [];
  const client = entry.client_name && entry.client_name !== "—"
    ? entry.client_name
    : (entry.project && entry.project !== "—" ? entry.project : undefined);
  if (client) parts.push(client);
  if (entry.group && entry.group !== "—") parts.push(entry.group);
  if (entry.task && entry.task !== "—") parts.push(entry.task);
  return parts.length ? parts.join(", ") : "(no context)";
}

export function formatDesc(raw: string, maxLen: number): string {
  const flat = raw.replace(/\r\n|\r|\n/g, " ").trim();
  return maxLen > 0 && flat.length > maxLen ? flat.slice(0, maxLen) + "…" : flat;
}

// ── Body Builders (exported for testing) ─────────────────────────────────────

export interface ListTimetrackingParams {
  page?: number;
  page_size?: number;
  user_id?: string;
  started_after?: string;
  started_before?: string;
  ended_after?: string;
  ended_before?: string;
  subject_type?: "company" | "contact" | "event" | "todo" | "milestone" | "ticket";
  subject_id?: string;
}

export function buildListTimetrackingBody(params: ListTimetrackingParams): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  if (params.page || params.page_size) {
    body.page = {
      number: params.page ?? 1,
      size: params.page_size ?? 20,
    };
  }

  const toDate = (s: string, endOfDay = false) => {
    const date = s.substring(0, 10);
    return endOfDay ? `${date}T23:59:59+00:00` : `${date}T00:00:00+00:00`;
  };

  const filter: Record<string, unknown> = {};
  if (params.user_id) filter.user_id = params.user_id;
  if (params.started_after) filter.started_after = toDate(params.started_after);
  if (params.started_before) filter.started_before = toDate(params.started_before, true);
  if (params.ended_after) filter.ended_after = toDate(params.ended_after);
  if (params.ended_before) filter.ended_before = toDate(params.ended_before, true);
  if (params.subject_type && params.subject_id) {
    filter.subject = {
      type: params.subject_type,
      id: params.subject_id,
    };
  }
  if (Object.keys(filter).length > 0) body.filter = filter;

  return body;
}

export interface AddTimetrackingParams {
  started_on: string;
  ended_on?: string;
  duration?: number;
  user_id?: string;
  work_type_id?: string;
  subject_type?: "company" | "contact" | "event" | "milestone" | "nextgenTask" | "ticket" | "todo";
  subject_id?: string;
  description?: string;
  invoiceable?: boolean;
}

export function buildAddTimetrackingBody(params: AddTimetrackingParams): Record<string, unknown> {
  const body: Record<string, unknown> = {
    started_at: params.started_on,
  };

  if (params.user_id) body.user_id = params.user_id;
  if (params.work_type_id) body.work_type_id = params.work_type_id;
  if (params.subject_type && params.subject_id) {
    body.subject = {
      type: params.subject_type,
      id: params.subject_id,
    };
  }
  if (params.ended_on) body.ended_at = params.ended_on;
  if (params.duration !== undefined) body.duration = params.duration;
  if (params.description) body.description = params.description;
  if (params.invoiceable !== undefined) body.invoiceable = params.invoiceable;

  return body;
}

export function registerTimeTrackingTools(
  server: McpServer,
  client: TeamleaderClient
): void {
  // ── List Time Tracking ───────────────────────────────────────────────────
  server.tool(
    "teamleader_list_timetracking",
    [
      "List time tracking entries from Teamleader Focus. Use to review logged hours, verify entries, or audit time spent.",
      "Returns array of entries with id, subject, user, started_on, ended_on, duration, description, work_type.",
      "Next steps: use teamleader_get_timetracking for full details, teamleader_update_timetracking to edit, or teamleader_delete_timetracking to remove.",
      "NOTE: Pass date filters as YYYY-MM-DD — they are automatically converted to ISO 8601 datetime (T00:00:00+00:00 for after/start, T23:59:59+00:00 for before/end).",
      "CRITICAL: subject.id from this response is NOT directly usable in teamleader_log_time — it references a todo/standalone task, not a nextgenTask ID. Always use teamleader_load_tasks to get the correct project task ID before logging time.",
      "NOTE: Dedup must match on start time (to second precision), NOT on subject ID — two entries on different subjects can share the same subject ID format.",
      "ERROR: 400 Bad Request on timeTracking.list → CAUSE: Full ISO datetime sent instead of YYYY-MM-DD → FIX: Pass YYYY-MM-DD only — this tool converts to ISO 8601 automatically.",
    ].join("\n"),
    {
      page: z.number().optional().describe("Page number (default: 1)"),
      page_size: z.number().optional().describe("Page size (default: 20, max: 100)"),
      user_id: z.string().optional().describe("Filter by user ID"),
      started_after: z
        .string()
        .optional()
        .describe("Filter entries started after this date (YYYY-MM-DD). Time is stripped automatically."),
      started_before: z
        .string()
        .optional()
        .describe("Filter entries started before this date (YYYY-MM-DD). Time is stripped automatically."),
      ended_after: z
        .string()
        .optional()
        .describe("Filter entries ended after this date (YYYY-MM-DD). Time is stripped automatically."),
      ended_before: z
        .string()
        .optional()
        .describe("Filter entries ended before this date (YYYY-MM-DD). Time is stripped automatically."),
      subject_type: z
        .enum(["company", "contact", "event", "todo", "milestone", "ticket"])
        .optional()
        .describe("Filter by subject type"),
      subject_id: z
        .string()
        .optional()
        .describe("Filter by subject ID"),
    },
    async (params) => {
      const body = buildListTimetrackingBody(params);

      const result = await client.request<TeamleaderListResponse<TimeTracking>>({
        endpoint: "timeTracking.list",
        body,
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // ── Get Time Tracking ────────────────────────────────────────────────────
  server.tool(
    "teamleader_get_timetracking",
    "Get full details of a specific time tracking entry. Returns id, subject (type + id), user, started_on, ended_on, duration, description, work_type, invoiceable. Use when you need exact start/end times or to verify an entry before updating.",
    {
      id: z.string().describe("Time tracking entry ID"),
    },
    async (params) => {
      const result = await client.request<{ data: TimeTracking }>({
        endpoint: "timeTracking.info",
        body: { id: params.id },
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // ── Add Time Tracking ────────────────────────────────────────────────────
  server.tool(
    "teamleader_add_timetracking",
    [
      "Add a new time tracking entry. Use teamleader_log_time instead for smart resolution (cache, dedup). Use this low-level tool only when you already have all IDs. Returns {id, type}.",
      "NOTE: prefer teamleader_log_time for daily time logging — it handles dedup and caching automatically.",
      "NOTE: You can provide either ended_on (datetime) OR duration (seconds), not both. subject_type enum differs between endpoints — check describe().",
      "NOTE: Milliseconds in started_on (e.g. 2024-01-15T09:00:00.000+00:00) → CAUSE: dedup logic treats ms-precision as unique → FIX: always use second-precision (2024-01-15T09:00:00+00:00).",
      "ERROR: Invalid subject 400 → CAUSE: subject.id does not match subject.type (e.g. passing a v1 todo ID as a nextgenTask) → FIX: verify subject.type matches the ID source — use load_tasks to get correct IDs.",
    ].join("\n"),
    {
      started_on: z
        .string()
        .describe("Start datetime in ISO 8601 format with timezone (e.g., 2024-01-15T09:00:00+00:00). Use second-precision, no milliseconds."),
      ended_on: z
        .string()
        .optional()
        .describe("End datetime in ISO 8601 format (e.g., 2024-01-15T10:00:00+00:00). Alternative to duration."),
      duration: z
        .number()
        .optional()
        .describe("Duration in seconds. Alternative to ended_on — do not provide both."),
      user_id: z.string().optional().describe("ID of user who performed the work (defaults to authenticated user)"),
      work_type_id: z
        .string()
        .optional()
        .describe("Work type ID (use teamleader_list_work_types to find valid IDs)"),
      subject_type: z
        .enum(["company", "contact", "event", "milestone", "nextgenTask", "ticket", "todo"])
        .optional()
        .describe("What the time was tracked against (use nextgenTask for project tasks)"),
      subject_id: z
        .string()
        .optional()
        .describe("ID of the subject being tracked against"),
      description: z
        .string()
        .optional()
        .describe("Description of work performed"),
      invoiceable: z
        .boolean()
        .optional()
        .describe("Whether the tracked time is invoiceable"),
    },
    async (params) => {
      const body = buildAddTimetrackingBody(params);

      let result;
      try {
        result = await client.request<{ data: { id: string; type: string } }>({
          endpoint: "timeTracking.add",
          body,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("Invalid subject")) {
          return respond(
            "Error: Invalid task ID — the subject could not be found in Teamleader.\n" +
            "Use teamleader_load_tasks to get the correct task_id from the project tree.\n" +
            "Never guess or reuse a task_id from a previous session — IDs may differ per company."
          );
        }
        throw err;
      }

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // ── Update Time Tracking ─────────────────────────────────────────────────
  server.tool(
    "teamleader_update_timetracking",
    "Update an existing time tracking entry. CRITICAL: When updating duration, always send started_on together with duration — sending duration alone returns 400. The API body uses started_at + duration (seconds). Returns 204 on success. Use teamleader_get_timetracking first to retrieve the current started_on value if needed. WARNING: Changing subject type (e.g. todo → nextgenTask) silently fails — returns {} but subject is unchanged. To move a time entry to a different task type: delete + re-log on the correct task. ERROR: 400 'started_at must be present' → CAUSE: Sending only duration without started_on → FIX: Always send both started_on + duration together.",
    {
      id: z.string().describe("Time tracking entry ID"),
      work_type_id: z
        .string()
        .optional()
        .describe("Work type ID (use teamleader_list_work_types to find valid IDs)"),
      started_on: z
        .string()
        .optional()
        .describe("Required when updating duration. ISO 8601 with timezone (e.g. 2026-03-06T10:30:00+00:00). Use teamleader_get_timetracking to retrieve the current value."),
      duration: z
        .number()
        .optional()
        .describe("Duration in seconds. Must be sent together with started_on — sending duration alone returns 400."),
      description: z
        .string()
        .optional()
        .describe("Description of work performed"),
      subject_type: z
        .enum(["company", "contact", "event", "milestone", "nextgenTask", "ticket", "todo"])
        .optional()
        .describe("Change subject type"),
      subject_id: z
        .string()
        .optional()
        .describe("Change subject ID (must provide subject_type too)"),
      invoiceable: z
        .boolean()
        .optional()
        .describe("Whether the tracked time is invoiceable"),
    },
    async (params) => {
      if (params.duration !== undefined && !params.started_on) {
        return respond("Error: started_on is required when updating duration. Use teamleader_get_timetracking to retrieve the current start time, then pass it as started_on together with the new duration.");
      }

      const body: Record<string, unknown> = {
        id: params.id,
      };

      if (params.work_type_id) body.work_type_id = params.work_type_id;
      if (params.description !== undefined) body.description = params.description;
      if (params.started_on) body.started_at = params.started_on;
      if (params.duration !== undefined) body.duration = params.duration;
      if (params.invoiceable !== undefined) body.invoiceable = params.invoiceable;
      if (params.subject_type && params.subject_id) {
        body.subject = {
          type: params.subject_type,
          id: params.subject_id,
        };
      }

      const result = await client.request<{ data: { id: string; type: string } }>({
        endpoint: "timeTracking.update",
        body,
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // ── Delete Time Tracking ─────────────────────────────────────────────────
  server.tool(
    "teamleader_delete_timetracking",
    "Delete a time tracking entry. This action is irreversible. Returns {success: true}.",
    {
      id: z.string().describe("Time tracking entry ID to delete"),
    },
    async (params) => {
      await client.request({
        endpoint: "timeTracking.delete",
        body: { id: params.id },
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ success: true, id: params.id }, null, 2),
          },
        ],
      };
    }
  );

  // ── Start Timer ──────────────────────────────────────────────────────────
  server.tool(
    "teamleader_start_timer",
    "Start a running timer for time tracking. Only one timer can run per user — starting a new timer does NOT stop the previous one (use teamleader_stop_timer first). Returns {id, type}. Next step: use teamleader_stop_timer to stop it, or teamleader_get_current_timer to check status. NOTE: No user_id parameter — always starts timer for the authenticated user.",
    {
      work_type_id: z
        .string()
        .optional()
        .describe("Work type ID (use teamleader_list_work_types to find valid IDs)"),
      subject_type: z
        .enum(["company", "contact", "event", "todo", "milestone", "ticket"])
        .optional()
        .describe("What the time will be tracked against"),
      subject_id: z
        .string()
        .optional()
        .describe("ID of the subject being tracked against"),
      description: z
        .string()
        .optional()
        .describe("Description of work to be performed"),
      started_at: z
        .string()
        .optional()
        .describe("Start datetime in ISO 8601 format. Defaults to current time if not provided."),
      invoiceable: z
        .boolean()
        .optional()
        .describe("Whether the tracked time is invoiceable"),
    },
    async (params) => {
      const body: Record<string, unknown> = {};

      if (params.work_type_id) body.work_type_id = params.work_type_id;
      if (params.subject_type && params.subject_id) {
        body.subject = {
          type: params.subject_type,
          id: params.subject_id,
        };
      }
      if (params.description) body.description = params.description;
      if (params.started_at) body.started_at = params.started_at;
      if (params.invoiceable !== undefined) body.invoiceable = params.invoiceable;

      const result = await client.request<{ data: { id: string; type: string } }>({
        endpoint: "timers.start",
        body,
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // ── Stop Timer ───────────────────────────────────────────────────────────
  server.tool(
    "teamleader_stop_timer",
    "Stops the current user's active timer. NOTE: takes NO parameters — always stops the currently running timer. Converts the running timer into a completed time tracking entry. Returns {id, type} of the created entry.",
    {},
    async () => {
      const result = await client.request<{ data: { id: string; type: string } }>({
        endpoint: "timers.stop",
        body: {},
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // ── Get Current Timer ──────────────────────────────────────────────────
  server.tool(
    "teamleader_get_current_timer",
    "Get the currently running timer for the authenticated user. Returns timer details (subject, work_type, started_at, description) if running, or empty/null if no timer is active. Only one timer can run per user. Next steps: teamleader_stop_timer to stop, teamleader_update_timer to modify.",
    {},
    async () => {
      const result = await client.request({
        endpoint: "timers.current",
        body: {},
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // ── Update Timer ───────────────────────────────────────────────────────
  server.tool(
    "teamleader_update_timer",
    "Update the currently running timer. Only possible if a timer is running. Use this to change the subject, work type, description, or start time of the active timer.",
    {
      work_type_id: z.string().optional().describe("New work type ID (use teamleader_list_work_types to find valid IDs)"),
      started_at: z
        .string()
        .optional()
        .describe("New start datetime in ISO 8601 format (e.g., 2024-01-15T09:00:00+00:00)"),
      description: z.string().optional().describe("New description for the timer"),
      subject_type: z
        .enum(["company", "contact", "event", "todo", "milestone", "ticket"])
        .optional()
        .describe("Subject type to track time against"),
      subject_id: z.string().optional().describe("Subject ID to track time against"),
      invoiceable: z.boolean().optional().describe("Whether the tracked time is invoiceable"),
    },
    async (params) => {
      const body: Record<string, unknown> = {};

      if (params.work_type_id) body.work_type_id = params.work_type_id;
      if (params.started_at) body.started_at = params.started_at;
      if (params.description !== undefined) body.description = params.description;
      if (params.invoiceable !== undefined) body.invoiceable = params.invoiceable;
      if (params.subject_type && params.subject_id) {
        body.subject = {
          type: params.subject_type,
          id: params.subject_id,
        };
      }

      await client.request({
        endpoint: "timers.update",
        body,
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ success: true, message: "Timer updated" }, null, 2),
          },
        ],
      };
    }
  );

  // ── Timesheet ──────────────────────────────────────────────────────────
  server.tool(
    "teamleader_timesheet",
    "Day-by-day overview of time tracking entries with resolved task/group/project/client/user info. Use for daily or period reports. Resolves todo->group->project->client chain via API calls (cached per request). Parameters from_date/to_date are inclusive (YYYY-MM-DD). Use desc_length=0 for full descriptions, default truncates to 50 chars. format=beauty (default): compact display optimized for reading — no User column, task titles truncated to 40 chars, emoji day headers. format=md: full markdown table with all columns for file export. NOTE: Resolve chain makes multiple API calls per entry. Recommend max 2 weeks per call.",
    {
      from_date: z.string().describe("Start date inclusive (YYYY-MM-DD). Converted to T00:00:00+00:00."),
      to_date: z.string().describe("End date inclusive (YYYY-MM-DD). Converted to T23:59:59+00:00."),
      user_id: z.string().optional().describe("Filter by user ID. Omit for all users."),
      desc_length: z.number().optional().default(50).describe("Max description length (chars). 0 = full. Default: 50. Newlines replaced with spaces."),
      format: z.enum(["md", "beauty", "manictime"]).optional().default("beauty").describe("Output format: 'beauty' = compact display (no User col, truncated task titles), 'md' = full markdown table for file export, 'manictime' = TSV for ManicTime memos (DD/MM/YYYY\\tclient, group, task)."),
    },
    async (params) => {
      const toDate = (s: string, endOfDay = false) => {
        const date = s.substring(0, 10);
        return endOfDay ? `${date}T23:59:59+00:00` : `${date}T00:00:00+00:00`;
      };

      // Raw API entry type (looser than TimeTracking — API returns todo/event/meeting etc.)
      interface RawEntry {
        id: string;
        user?: { id: string; type?: string };
        started_on?: string;
        started_at?: string;
        ended_at?: string;
        duration?: number;
        description?: string;
        subject?: { type: string; id: string };
        relates_to?: Array<{ type: string; id: string }>;
      }

      // Fetch all pages
      const allEntries: RawEntry[] = [];
      let page = 1;
      const pageSize = 100;
      while (true) {
        const filter: Record<string, unknown> = {
          started_after: toDate(params.from_date),
          started_before: toDate(params.to_date, true),
        };
        if (params.user_id) filter.user_id = params.user_id;

        const result = await client.request<{ data: RawEntry[] }>({
          endpoint: "timeTracking.list",
          body: {
            filter,
            sort: [{ field: "starts_on", order: "asc" }],
            page: { size: pageSize, number: page },
            includes: "relates_to",
          },
        });
        const data = result.data ?? [];
        allEntries.push(...data);
        if (data.length < pageSize) break;
        page++;
      }

      if (allEntries.length === 0) {
        return respond(`No time tracking entries found for ${params.from_date} to ${params.to_date}.`);
      }

      // In-request caches for resolve
      interface TodoInfo {
        title: string;
        customer?: { type: string; id: string };
        project?: { type: string; id: string };
      }
      const todoCache = new Map<string, TodoInfo>(); // todo ID → info
      const groupCache = new Map<string, string>(); // group ID → title
      const projectCache = new Map<string, { title: string; customers?: Array<{ type: string; id: string }> }>();
      const customerCache = new Map<string, string>();
      const userCache = new Map<string, string>();

      async function resolveTodo(id: string): Promise<TodoInfo> {
        if (todoCache.has(id)) return todoCache.get(id)!;
        try {
          const r = await client.request<{ data: { title?: string; customer?: { type: string; id: string }; project?: { type: string; id: string } } }>({
            endpoint: "tasks.info",
            body: { id },
          });
          const val: TodoInfo = {
            title: r.data.title ?? "?",
            customer: r.data.customer ?? undefined,
            project: r.data.project ?? undefined,
          };
          todoCache.set(id, val);
          return val;
        } catch {
          const val: TodoInfo = { title: "?" };
          todoCache.set(id, val);
          return val;
        }
      }

      async function resolveGroupTitle(id: string): Promise<string> {
        if (groupCache.has(id)) return groupCache.get(id)!;
        const cached = getResolvedGroup(id);
        if (cached) { groupCache.set(id, cached.title); return cached.title; }
        try {
          const r = await client.request<{ data: { title?: string } }>({
            endpoint: "projects-v2/projectGroups.info",
            body: { id },
          });
          const title = r.data.title ?? "?";
          groupCache.set(id, title);
          setResolvedGroup(id, title);
          return title;
        } catch {
          groupCache.set(id, "?");
          return "?";
        }
      }

      async function resolveProject(id: string): Promise<{ title: string; customers?: Array<{ type: string; id: string }> }> {
        if (projectCache.has(id)) return projectCache.get(id)!;
        const cached = getResolvedProject(id);
        if (cached) { const val = { title: cached.title, customers: cached.customers }; projectCache.set(id, val); return val; }
        try {
          const r = await client.request<{ data: { title?: string; customers?: Array<{ type: string; id: string }> } }>({
            endpoint: "projects-v2/projects.info",
            body: { id },
          });
          const val = { title: r.data.title ?? "?", customers: r.data.customers };
          projectCache.set(id, val);
          setResolvedProject(id, val.title, val.customers ?? []);
          return val;
        } catch {
          const val = { title: "?" };
          projectCache.set(id, val);
          return val;
        }
      }

      async function resolveCustomer(type: string, id: string): Promise<string> {
        const key = `${type}:${id}`;
        if (customerCache.has(key)) return customerCache.get(key)!;
        const cached = getResolvedCustomer(type, id);
        if (cached) { customerCache.set(key, cached.name); return cached.name; }
        try {
          const endpoint = type === "contact" ? "contacts.info" : "companies.info";
          const r = await client.request<{ data: { first_name?: string; last_name?: string; name?: string } }>({
            endpoint,
            body: { id },
          });
          const d = r.data;
          const name = d.name ?? (`${d.first_name ?? ""} ${d.last_name ?? ""}`.trim() || "?");
          customerCache.set(key, name);
          setResolvedCustomer(type, id, name);
          return name;
        } catch {
          customerCache.set(key, "?");
          return "?";
        }
      }

      async function resolveUser(id: string): Promise<string> {
        if (userCache.has(id)) return userCache.get(id)!;
        const cached = getResolvedUser(id);
        if (cached) { userCache.set(id, cached.name); return cached.name; }
        try {
          const r = await client.request<{ data: { first_name?: string; last_name?: string } }>({
            endpoint: "users.info",
            body: { id },
          });
          const name = `${r.data.first_name ?? ""} ${r.data.last_name ?? ""}`.trim() || "?";
          userCache.set(id, name);
          setResolvedUser(id, name);
          return name;
        } catch {
          userCache.set(id, "?");
          return "?";
        }
      }

      // Resolve all entries in parallel using relates_to from includes
      interface ResolvedEntry {
        started_at: string;
        ended_at: string;
        duration: number;
        description: string;
        task: string;
        group: string;
        project: string;
        client_name: string;
        user: string;
      }

      const resolved: ResolvedEntry[] = await Promise.all(
        allEntries.map(async (entry) => {
          let task = "—";
          let group = "—";
          let project = "—";
          let client_name = "—";

          const subject = entry.subject;
          const relates = entry.relates_to ?? [];

          // Helper to find a relation by type
          const findRelation = (type: string) => relates.find((r) => r.type === type);

          // Resolve task title from subject + get standalone task info for fallback
          let todoInfo: TodoInfo | undefined;
          if (subject?.type === "todo" && subject.id) {
            todoInfo = await resolveTodo(subject.id);
            task = todoInfo.title;
          } else if (subject?.type === "milestone" && subject.id) {
            task = `milestone:${subject.id.substring(0, 8)}`;
          } else if (subject?.type === "meeting" || subject?.type === "event") {
            task = `${subject.type}:${subject.id?.substring(0, 8) ?? "?"}`;
          } else if (subject?.type && subject?.id) {
            task = `${subject.type}:${subject.id.substring(0, 8)}`;
          }

          // Resolve group/project/customer from relates_to (nextgen projects)
          const groupRef = findRelation("nextgenProjectGroup");
          if (groupRef) {
            group = await resolveGroupTitle(groupRef.id);
          }

          const projectRef = findRelation("nextgenProject");
          if (projectRef) {
            const proj = await resolveProject(projectRef.id);
            project = proj.title;
            const cust = proj.customers?.[0];
            if (cust) {
              client_name = await resolveCustomer(cust.type, cust.id);
            }
          }

          // Fallback: check direct company/contact in relates_to
          if (client_name === "—") {
            const companyRef = findRelation("company");
            const contactRef = findRelation("contact");
            const custRef = companyRef ?? contactRef;
            if (custRef) {
              client_name = await resolveCustomer(custRef.type, custRef.id);
            }
          }

          // Fallback: standalone task has direct customer/project fields
          if (todoInfo) {
            if (project === "—" && todoInfo.project) {
              const proj = await resolveProject(todoInfo.project.id);
              project = proj.title;
              if (client_name === "—") {
                const cust = proj.customers?.[0];
                if (cust) {
                  client_name = await resolveCustomer(cust.type, cust.id);
                }
              }
            }
            if (client_name === "—" && todoInfo.customer) {
              client_name = await resolveCustomer(todoInfo.customer.type, todoInfo.customer.id);
            }
          }

          const userName = entry.user?.id ? await resolveUser(entry.user.id) : "?";

          return {
            started_at: entry.started_at ?? entry.started_on ?? "?",
            ended_at: entry.ended_at ?? "",
            duration: entry.duration ?? 0,
            description: entry.description ?? "",
            task,
            group,
            project,
            client_name,
            user: userName,
          };
        })
      );

      // Sort by started_at
      resolved.sort((a, b) => a.started_at.localeCompare(b.started_at));

      // Group by day
      const byDay = new Map<string, ResolvedEntry[]>();
      for (const r of resolved) {
        const day = r.started_at.substring(0, 10);
        if (!byDay.has(day)) byDay.set(day, []);
        byDay.get(day)!.push(r);
      }

      function formatTime(iso: string): string {
        if (!iso || iso === "?") return "?";
        const m = iso.match(/T(\d{2}):(\d{2})/);
        return m ? `${m[1]}:${m[2]}` : "?";
      }

      function formatDuration(seconds: number): string {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}:${m.toString().padStart(2, "0")}`;
      }

      // ManicTime format: early return with TSV output
      if (params.format === "manictime") {
        const lines = resolved.map((e) =>
          `${dateToDDMMYYYY(e.started_at)}\t${buildManicTimeMemo(e)}`
        );
        return respond(lines.join("\n"));
      }

      const isBeauty = params.format !== "md";
      let totalSeconds = 0;
      const sections: string[] = [];

      for (const [day, entries] of byDay) {
        let daySeconds = 0;
        const rows = entries.map((e) => {
          daySeconds += e.duration;
          const start = formatTime(e.started_at);
          const end = formatTime(e.ended_at);
          const dur = formatDuration(e.duration);
          const desc = formatDesc(e.description, params.desc_length) || "—";
          const taskTitle = isBeauty ? formatDesc(e.task, 40) : e.task;
          if (isBeauty) {
            return `| ${start} | ${end} | ${dur} | ${desc} | ${taskTitle} | ${e.group} | ${e.project} | ${e.client_name} |`;
          }
          return `| ${start} | ${end} | ${dur} | ${desc} | ${e.task} | ${e.group} | ${e.project} | ${e.client_name} | ${e.user} |`;
        });
        totalSeconds += daySeconds;

        if (isBeauty) {
          sections.push(
            `### \u{1F4C5} ${day}\n\n` +
            `| Start | End | Dur | Description | Task | Group | Project | Client |\n` +
            `|-------|-----|-----|-------------|------|-------|---------|--------|\n` +
            rows.join("\n") + "\n\n" +
            `**Total: ${formatDuration(daySeconds)}**`
          );
        } else {
          sections.push(
            `## ${day}\n\n` +
            `| Start | End | Dur | Description | Task | Group | Project | Client | User |\n` +
            `|-------|-----|-----|-------------|------|-------|---------|--------|------|\n` +
            rows.join("\n") + "\n\n" +
            `**Total: ${formatDuration(daySeconds)}**`
          );
        }
      }

      const output = sections.join("\n\n---\n\n") + `\n\n---\n\n**Total period: ${formatDuration(totalSeconds)}**`;

      return respond(output);
    }
  );

  // ── Resume Time Tracking ───────────────────────────────────────────────
  server.tool(
    "teamleader_resume_timetracking",
    "Start a new timer based on a previously tracked time entry. Copies the subject and work type from the existing entry. Only one timer can run per user — any running timer will be stopped first.",
    {
      id: z.string().describe("ID of the existing time tracking entry to resume from"),
      started_at: z
        .string()
        .optional()
        .describe("Start datetime in ISO 8601 format. If not provided, current time is used."),
    },
    async (params) => {
      const body: Record<string, unknown> = { id: params.id };
      if (params.started_at) body.started_at = params.started_at;

      const result = await client.request<{ data: { id: string; type: string } }>({
        endpoint: "timeTracking.resume",
        body,
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );
}
