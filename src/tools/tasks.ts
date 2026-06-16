/**
 * Teamleader Tasks Tools
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { TeamleaderClient } from "../api/client.js";
import type {
  Task,
  TeamleaderListResponse,
} from "../types/index.js";

export function registerTaskTools(
  server: McpServer,
  client: TeamleaderClient
): void {
  // ── List Tasks ───────────────────────────────────────────────────────────
  server.tool(
    "teamleader_list_tasks",
    "List standalone tasks — v1 API (type: todo). NOT for project tasks — use teamleader_list_project_tasks_v2 or teamleader_load_tasks for those. IDs returned here are todo IDs and cannot be used in projects-v2 endpoints. Returns array with id, title, due_on, status, assignee, customer.",
    {
      page: z.number().optional().describe("Page number (default: 1)"),
      page_size: z.number().optional().describe("Page size (default: 20, max: 100)"),
      term: z.string().optional().describe("Search term to filter tasks"),
      ids: z.array(z.string()).optional().describe("Filter by specific task IDs"),
      user_id: z.string().optional().describe("Filter by assigned user ID"),
      completed: z.boolean().optional().describe("Filter by completion status (true=completed, false=open)"),
      scheduled: z.boolean().optional().describe("Filter by scheduled status"),
      due_by: z.string().optional().describe("Tasks due before this date (YYYY-MM-DD)"),
      due_from: z.string().optional().describe("Tasks due after this date (YYYY-MM-DD)"),
      customer_type: z
        .enum(["contact", "company"])
        .optional()
        .describe("Customer type to filter by"),
      customer_id: z
        .string()
        .optional()
        .describe("Customer ID to filter by"),
    },
    async (params) => {
      const body: Record<string, unknown> = {};

      if (params.page || params.page_size) {
        body.page = {
          number: params.page ?? 1,
          size: params.page_size ?? 20,
        };
      }

      const filter: Record<string, unknown> = {};
      if (params.term) filter.term = params.term;
      if (params.ids) filter.ids = params.ids;
      if (params.user_id) filter.user_id = params.user_id;
      if (params.completed !== undefined) filter.completed = params.completed;
      if (params.scheduled !== undefined) filter.scheduled = params.scheduled;
      if (params.due_by) filter.due_by = params.due_by;
      if (params.due_from) filter.due_from = params.due_from;
      if (params.customer_type && params.customer_id) {
        filter.customer = {
          type: params.customer_type,
          id: params.customer_id,
        };
      }
      if (Object.keys(filter).length > 0) body.filter = filter;

      const result = await client.request<TeamleaderListResponse<Task>>({
        endpoint: "tasks.list",
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

  // ── Create Task ──────────────────────────────────────────────────────────
  server.tool(
    "teamleader_create_task",
    "Create a new standalone task (NOT a project task — use teamleader_create_project_task_v2 for those). Requires title, due_on, and work_type_id. Returns {id, type}. Lookup: teamleader_list_work_types (work_type_id).",
    {
      title: z.string().describe("Task title"),
      due_on: z.string().describe("Due date (YYYY-MM-DD)"),
      work_type_id: z.string().describe("Work type ID (use teamleader_list_work_types to find)"),
      description: z.string().optional().describe("Task description"),
      assignee_type: z
        .enum(["user", "team"])
        .optional()
        .describe("Assignee type"),
      assignee_id: z
        .string()
        .optional()
        .describe("Assignee ID"),
      customer_type: z
        .enum(["contact", "company"])
        .optional()
        .describe("Link task to a customer type"),
      customer_id: z
        .string()
        .optional()
        .describe("Link task to a customer ID"),
      estimated_duration: z
        .number()
        .optional()
        .describe("Estimated duration in minutes"),
      deal_id: z.string().optional().describe("Deal ID to link to"),
      ticket_id: z.string().optional().describe("Ticket ID to link to"),
      project_id: z.string().optional().describe("Link task to a project ID"),
    },
    async (params) => {
      const body: Record<string, unknown> = {
        title: params.title,
        due_on: params.due_on,
        work_type_id: params.work_type_id,
      };

      if (params.description) body.description = params.description;
      if (params.customer_type && params.customer_id) {
        body.customer = {
          type: params.customer_type,
          id: params.customer_id,
        };
      }
      if (params.assignee_type && params.assignee_id) {
        body.assignee = {
          type: params.assignee_type,
          id: params.assignee_id,
        };
      }
      if (params.estimated_duration) {
        body.estimated_duration = { unit: "min", value: params.estimated_duration };
      }
      if (params.deal_id) body.deal_id = params.deal_id;
      if (params.ticket_id) body.ticket_id = params.ticket_id;
      if (params.project_id) body.project_id = params.project_id;

      const result = await client.request<{ data: { id: string; type: string } }>({
        endpoint: "tasks.create",
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

  // ── Get Task ───────────────────────────────────────────────────────────
  server.tool(
    "teamleader_get_task",
    "Get full details of a standalone task (v1 API — type: todo). IMPORTANT: Returns a todo ID — this is NOT the same as a nextgenTask ID from projects-v2. Todo IDs cannot be used in projects-v2 endpoints (add_project_line_to_group, etc.) — use teamleader_load_tasks to get the correct nextgenTask ID instead.",
    {
      id: z.string().describe("Task ID"),
    },
    async (params) => {
      const result = await client.request<{ data: Task }>({
        endpoint: "tasks.info",
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

  // ── Update Task ────────────────────────────────────────────────────────
  server.tool(
    "teamleader_update_task",
    "Update a standalone task in Teamleader Focus. Only provided fields are updated.",
    {
      id: z.string().describe("Task ID"),
      title: z.string().optional().describe("New task title"),
      description: z.string().optional().describe("New task description"),
      due_on: z.string().optional().describe("New due date (YYYY-MM-DD)"),
      work_type_id: z.string().optional().describe("New work type ID (use teamleader_list_work_types to find)"),
      assignee_type: z
        .enum(["user", "team"])
        .optional()
        .describe("Assignee type"),
      assignee_id: z
        .string()
        .optional()
        .describe("Assignee ID (both assignee_type and assignee_id required together)"),
      customer_type: z
        .enum(["contact", "company"])
        .optional()
        .describe("Customer type to link"),
      customer_id: z
        .string()
        .optional()
        .describe("Customer ID to link (both customer_type and customer_id required together)"),
      estimated_duration: z
        .number()
        .optional()
        .describe("Estimated duration in minutes"),
      deal_id: z.string().nullable().optional().describe("Deal ID to link (null to unlink)"),
      ticket_id: z.string().nullable().optional().describe("Ticket ID to link (null to unlink)"),
      project_id: z.string().nullable().optional().describe("Project ID to link (null to unlink)"),
    },
    async (params) => {
      const body: Record<string, unknown> = { id: params.id };

      if (params.title !== undefined) body.title = params.title;
      if (params.description !== undefined) body.description = params.description;
      if (params.due_on !== undefined) body.due_on = params.due_on;
      if (params.work_type_id !== undefined) body.work_type_id = params.work_type_id;
      if (params.assignee_type && params.assignee_id) {
        body.assignee = { type: params.assignee_type, id: params.assignee_id };
      }
      if (params.customer_type && params.customer_id) {
        body.customer = { type: params.customer_type, id: params.customer_id };
      }
      if (params.estimated_duration !== undefined) {
        body.estimated_duration = { unit: "min", value: params.estimated_duration };
      }
      if (params.deal_id !== undefined) body.deal_id = params.deal_id;
      if (params.ticket_id !== undefined) body.ticket_id = params.ticket_id;
      if (params.project_id !== undefined) body.project_id = params.project_id;

      await client.request<void>({
        endpoint: "tasks.update",
        body,
      });

      return {
        content: [
          {
            type: "text" as const,
            text: `Task ${params.id} updated successfully.`,
          },
        ],
      };
    }
  );

  // ── Delete Task ────────────────────────────────────────────────────────
  server.tool(
    "teamleader_delete_task",
    "Delete a standalone task from Teamleader Focus. This action is irreversible.",
    {
      id: z.string().describe("Task ID to delete"),
    },
    async (params) => {
      await client.request<void>({
        endpoint: "tasks.delete",
        body: { id: params.id },
      });

      return {
        content: [
          {
            type: "text" as const,
            text: `Task ${params.id} deleted successfully.`,
          },
        ],
      };
    }
  );

  // ── Complete Task ──────────────────────────────────────────────────────
  server.tool(
    "teamleader_complete_task",
    "Mark a standalone task as completed in Teamleader Focus.",
    {
      id: z.string().describe("Task ID to complete"),
    },
    async (params) => {
      await client.request<void>({
        endpoint: "tasks.complete",
        body: { id: params.id },
      });

      return {
        content: [
          {
            type: "text" as const,
            text: `Task ${params.id} marked as completed.`,
          },
        ],
      };
    }
  );

  // ── Reopen Task ────────────────────────────────────────────────────────
  server.tool(
    "teamleader_reopen_task",
    "Reopen a previously completed standalone task in Teamleader Focus.",
    {
      id: z.string().describe("Task ID to reopen"),
    },
    async (params) => {
      await client.request<void>({
        endpoint: "tasks.reopen",
        body: { id: params.id },
      });

      return {
        content: [
          {
            type: "text" as const,
            text: `Task ${params.id} reopened successfully.`,
          },
        ],
      };
    }
  );

  // ── Schedule Task ──────────────────────────────────────────────────────
  server.tool(
    "teamleader_schedule_task",
    "Schedule a standalone task by creating a calendar event for it. Returns the created event {id, type}. The task remains in its current status — this only creates a time block.",
    {
      id: z.string().describe("Task ID to schedule"),
      starts_at: z.string().describe("Start datetime (ISO 8601, e.g. 2026-03-04T09:00:00+01:00)"),
      ends_at: z.string().describe("End datetime (ISO 8601, e.g. 2026-03-04T10:00:00+01:00)"),
    },
    async (params) => {
      const result = await client.request<{ data: { id: string; type: string } }>({
        endpoint: "tasks.schedule",
        body: {
          id: params.id,
          starts_at: params.starts_at,
          ends_at: params.ends_at,
        },
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
