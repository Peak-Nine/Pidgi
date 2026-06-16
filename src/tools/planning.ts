/**
 * Teamleader Planning Tools
 *
 * Covers the Teamleader Focus Planning module (API v2):
 *   - Plannable items   (plannableItems.list / .info)
 *   - Reservations      (reservations.list / .create / .update / .delete)
 *   - User availability (userAvailability.daily / .total)
 *
 * A "plannable item" wraps a source object (usually a project task) and tracks
 * how much of it is planned vs unplanned. A "reservation" is a planned block of
 * time for a user/team against a plannable item on a given date. "User
 * availability" reports per-user capacity (gross/net available, planned,
 * unplanned) per day or as a total over a period.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { TeamleaderClient } from "../api/client.js";

const assigneeFilterSchema = z
  .array(
    z.object({
      type: z.enum(["team", "user"]).describe("Assignee type"),
      id: z.string().describe("User or team ID"),
    })
  )
  .optional()
  .describe("Filter by assignees (users/teams)");

export function registerPlanningTools(
  server: McpServer,
  client: TeamleaderClient
): void {
  // ── List Plannable Items ───────────────────────────────────────────────
  server.tool(
    "teamleader_list_plannable_items",
    "List plannable items (Planning module). A plannable item wraps a source (usually a project task) and reports total_duration, planned_duration and unplanned_duration (in minutes). Use this to map a project task to its plannable_item_id (response data[].source = {type:'task', id}) before creating a reservation, and to see how much of a task is still unplanned. Filter by project, assignee, work type, completion or planned-time status. Next step: teamleader_create_reservation to plan time against an item.",
    {
      ids: z.array(z.string()).optional().describe("Filter by plannable item IDs"),
      status: z
        .array(z.enum(["active", "deactivated"]))
        .optional()
        .describe("Filter by status"),
      term: z.string().optional().describe("Search term"),
      start_date: z.string().optional().describe("Period start (YYYY-MM-DD)"),
      end_date: z.string().optional().describe("Period end (YYYY-MM-DD)"),
      project_ids: z
        .array(z.string())
        .optional()
        .describe("Filter by project IDs"),
      assignees: assigneeFilterSchema,
      work_type_ids: z
        .array(z.string())
        .optional()
        .describe("Filter by work type IDs"),
      completion_statuses: z
        .array(z.enum(["to_do", "done"]))
        .optional()
        .describe("Filter by completion status"),
      planned_time_statuses: z
        .array(
          z.enum([
            "unplanned",
            "partially_planned",
            "fully_planned",
            "overbooked",
          ])
        )
        .optional()
        .describe("Filter by planned-time status"),
      page: z.number().optional().describe("Page number (default: 1)"),
      page_size: z.number().optional().describe("Page size (default: 20)"),
      sort_field: z
        .enum(["id", "end_date", "total_duration"])
        .optional()
        .describe("Sort field (default: id)"),
      sort_order: z
        .enum(["asc", "desc"])
        .optional()
        .describe("Sort order (default: asc)"),
    },
    async (params) => {
      const body: Record<string, unknown> = {};
      const filter: Record<string, unknown> = {};
      if (params.ids) filter.ids = params.ids;
      if (params.status) filter.status = params.status;
      if (params.term) filter.term = params.term;
      if (params.start_date) filter.start_date = params.start_date;
      if (params.end_date) filter.end_date = params.end_date;
      if (params.project_ids) filter.project_ids = params.project_ids;
      if (params.assignees) filter.assignees = params.assignees;
      if (params.work_type_ids) filter.work_type_ids = params.work_type_ids;
      if (params.completion_statuses)
        filter.completion_statuses = params.completion_statuses;
      if (params.planned_time_statuses)
        filter.planned_time_statuses = params.planned_time_statuses;
      if (Object.keys(filter).length > 0) body.filter = filter;

      if (params.page || params.page_size) {
        body.page = { number: params.page ?? 1, size: params.page_size ?? 20 };
      }
      if (params.sort_field || params.sort_order) {
        body.sort = [
          {
            field: params.sort_field ?? "id",
            order: params.sort_order ?? "asc",
          },
        ];
      }

      const result = await client.request({
        endpoint: "plannableItems.list",
        body,
      });

      return {
        content: [
          { type: "text" as const, text: JSON.stringify(result, null, 2) },
        ],
      };
    }
  );

  // ── Get Plannable Item ─────────────────────────────────────────────────
  server.tool(
    "teamleader_get_plannable_item",
    "Get a single plannable item by its ID, or by source if the plannable item ID is unknown (e.g. source_type='task' + source_id=<project task id>). Returns total/planned/unplanned duration in minutes.",
    {
      id: z.string().optional().describe("Plannable item ID"),
      source_type: z
        .string()
        .optional()
        .describe("Source type (e.g. 'task') — use with source_id when id is unknown"),
      source_id: z
        .string()
        .optional()
        .describe("Source ID (e.g. a project task ID) — use with source_type"),
    },
    async (params) => {
      const body: Record<string, unknown> = {};
      if (params.id) body.id = params.id;
      if (params.source_type && params.source_id) {
        body.source = { type: params.source_type, id: params.source_id };
      }

      const result = await client.request({
        endpoint: "plannableItems.info",
        body,
      });

      return {
        content: [
          { type: "text" as const, text: JSON.stringify(result, null, 2) },
        ],
      };
    }
  );

  // ── List Reservations ──────────────────────────────────────────────────
  server.tool(
    "teamleader_list_reservations",
    "List reservations (planned time blocks) in the Planning module. A reservation = a user/team booked for a duration on a date against a plannable item (which maps to a task). Filter by plannable item, date range, assignee or source type. Set unassigned=true to also include unassigned reservations. Returns id, plannable_item, date, duration (minutes), assignee and source.",
    {
      plannable_item_ids: z
        .array(z.string())
        .optional()
        .describe("Filter by plannable item IDs"),
      start_date: z.string().optional().describe("Period start (YYYY-MM-DD)"),
      end_date: z.string().optional().describe("Period end (YYYY-MM-DD)"),
      assignees: assigneeFilterSchema,
      unassigned: z
        .boolean()
        .optional()
        .describe("Include unassigned reservations (adds a null assignee entry to the filter)"),
      source_types: z
        .array(
          z.enum([
            "call",
            "closingDay",
            "dayOffType",
            "externalEvent",
            "meeting",
            "task",
          ])
        )
        .optional()
        .describe("Filter by source types"),
      page: z.number().optional().describe("Page number (default: 1)"),
      page_size: z.number().optional().describe("Page size (default: 20)"),
    },
    async (params) => {
      const body: Record<string, unknown> = {};
      const filter: Record<string, unknown> = {};
      if (params.plannable_item_ids)
        filter.plannable_item_ids = params.plannable_item_ids;
      if (params.start_date) filter.start_date = params.start_date;
      if (params.end_date) filter.end_date = params.end_date;

      const assignees: unknown[] = params.assignees ? [...params.assignees] : [];
      if (params.unassigned) assignees.push(null);
      if (assignees.length > 0) filter.assignees = assignees;

      if (params.source_types) filter.source_types = params.source_types;
      if (Object.keys(filter).length > 0) body.filter = filter;

      if (params.page || params.page_size) {
        body.page = { number: params.page ?? 1, size: params.page_size ?? 20 };
      }

      const result = await client.request({
        endpoint: "reservations.list",
        body,
      });

      return {
        content: [
          { type: "text" as const, text: JSON.stringify(result, null, 2) },
        ],
      };
    }
  );

  // ── Create Reservation ─────────────────────────────────────────────────
  server.tool(
    "teamleader_create_reservation",
    "Create a reservation: plan a block of time for a user (or team) against a plannable item on a specific date. This is how you schedule a project task into the Planning/capacity view, tied to the task line. Get plannable_item_id from teamleader_list_plannable_items (its source maps to the task). duration_minutes is in minutes (e.g. 480 = a full 8h day). Returns {id, type}.",
    {
      plannable_item_id: z
        .string()
        .describe("Plannable item ID (from teamleader_list_plannable_items)"),
      date: z.string().describe("Date of the reservation (YYYY-MM-DD)"),
      duration_minutes: z
        .number()
        .describe("Duration in minutes (e.g. 480 = 8h, 240 = half day)"),
      assignee_type: z.enum(["team", "user"]).describe("Assignee type"),
      assignee_id: z.string().describe("User or team ID"),
    },
    async (params) => {
      const body: Record<string, unknown> = {
        plannable_item_id: params.plannable_item_id,
        date: params.date,
        duration: { unit: "minutes", value: params.duration_minutes },
        assignee: { type: params.assignee_type, id: params.assignee_id },
      };

      const result = await client.request<{
        data: { id: string; type: string };
      }>({
        endpoint: "reservations.create",
        body,
      });

      return {
        content: [
          { type: "text" as const, text: JSON.stringify(result, null, 2) },
        ],
      };
    }
  );

  // ── Update Reservation ─────────────────────────────────────────────────
  server.tool(
    "teamleader_update_reservation",
    "Update an existing reservation. Only provided fields change. Provide assignee_type AND assignee_id together to reassign.",
    {
      id: z.string().describe("Reservation ID"),
      date: z.string().optional().describe("New date (YYYY-MM-DD)"),
      duration_minutes: z
        .number()
        .optional()
        .describe("New duration in minutes"),
      assignee_type: z
        .enum(["team", "user"])
        .optional()
        .describe("New assignee type (use with assignee_id)"),
      assignee_id: z
        .string()
        .optional()
        .describe("New assignee ID (use with assignee_type)"),
    },
    async (params) => {
      const body: Record<string, unknown> = { id: params.id };
      if (params.date !== undefined) body.date = params.date;
      if (params.duration_minutes !== undefined) {
        body.duration = { unit: "minutes", value: params.duration_minutes };
      }
      if (params.assignee_type && params.assignee_id) {
        body.assignee = { type: params.assignee_type, id: params.assignee_id };
      }

      await client.request<void>({ endpoint: "reservations.update", body });

      return {
        content: [
          {
            type: "text" as const,
            text: `Reservation ${params.id} updated successfully.`,
          },
        ],
      };
    }
  );

  // ── Delete Reservation ─────────────────────────────────────────────────
  server.tool(
    "teamleader_delete_reservation",
    "Delete a reservation (planned time block). This action cannot be undone.",
    {
      id: z.string().describe("Reservation ID"),
    },
    async (params) => {
      await client.request<void>({
        endpoint: "reservations.delete",
        body: { id: params.id },
      });

      return {
        content: [
          {
            type: "text" as const,
            text: `Reservation ${params.id} deleted successfully.`,
          },
        ],
      };
    }
  );

  // ── User Availability — Daily ──────────────────────────────────────────
  server.tool(
    "teamleader_get_user_availability_daily",
    "Returns per-user, per-day availability over a period (max 100 days). For each user/date it gives gross_time_available (working hours), net_time_available (minus days off), planned_time and unplanned_time, all in minutes. This is the capacity view — use it to see how much free time each person has before placing reservations. Filter to specific users/teams via assignees.",
    {
      start_date: z.string().describe("Period start (YYYY-MM-DD)"),
      end_date: z
        .string()
        .describe("Period end (YYYY-MM-DD) — max 100 days from start"),
      assignees: assigneeFilterSchema,
      page: z.number().optional().describe("Page number (default: 1)"),
      page_size: z.number().optional().describe("Page size (default: 20)"),
    },
    async (params) => {
      const body: Record<string, unknown> = {
        period: { start_date: params.start_date, end_date: params.end_date },
      };
      if (params.assignees) body.filter = { assignees: params.assignees };
      if (params.page || params.page_size) {
        body.page = { number: params.page ?? 1, size: params.page_size ?? 20 };
      }

      const result = await client.request({
        endpoint: "userAvailability.daily",
        body,
      });

      return {
        content: [
          { type: "text" as const, text: JSON.stringify(result, null, 2) },
        ],
      };
    }
  );

  // ── User Availability — Total ──────────────────────────────────────────
  server.tool(
    "teamleader_get_user_availability_total",
    "Returns total availability per user over a period (gross/net available, planned, unplanned — all in minutes), aggregated across the whole period rather than day by day (max 20.000 days). Filter to specific users/teams via assignees.",
    {
      start_date: z.string().describe("Period start (YYYY-MM-DD)"),
      end_date: z.string().describe("Period end (YYYY-MM-DD)"),
      assignees: assigneeFilterSchema,
      page: z.number().optional().describe("Page number (default: 1)"),
      page_size: z.number().optional().describe("Page size (default: 20)"),
    },
    async (params) => {
      const body: Record<string, unknown> = {
        period: { start_date: params.start_date, end_date: params.end_date },
      };
      if (params.assignees) body.filter = { assignees: params.assignees };
      if (params.page || params.page_size) {
        body.page = { number: params.page ?? 1, size: params.page_size ?? 20 };
      }

      const result = await client.request({
        endpoint: "userAvailability.total",
        body,
      });

      return {
        content: [
          { type: "text" as const, text: JSON.stringify(result, null, 2) },
        ],
      };
    }
  );
}
