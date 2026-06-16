/**
 * Teamleader Meeting Tools
 *
 * Meetings are separate from Events (events.*). Meetings support scheduling,
 * completion, reports, and attendee management via the meetings.* endpoints.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { TeamleaderClient } from "../api/client.js";
import type {
  Meeting,
  TeamleaderListResponse,
  TeamleaderInfoResponse,
} from "../types/index.js";

export function registerMeetingTools(
  server: McpServer,
  client: TeamleaderClient
): void {
  // ── List Meetings ────────────────────────────────────────────────────────
  server.tool(
    "teamleader_list_meetings",
    "List meetings from Teamleader Focus. Returns array with id, title, scheduled_at, attendees, status. Separate from events (events.*) — meetings support completion, reports, and richer attendee management. Next steps: teamleader_get_meeting for details, teamleader_complete_meeting when done.",
    {
      page: z.number().optional().describe("Page number (default: 1)"),
      page_size: z.number().optional().describe("Page size (default: 20)"),
      employee_id: z.string().optional().describe("Filter by user/employee ID"),
      start_date: z
        .string()
        .optional()
        .describe("Filter meetings starting from this date (ISO 8601)"),
      end_date: z
        .string()
        .optional()
        .describe("Filter meetings ending before this date (ISO 8601)"),
      ids: z
        .array(z.string())
        .optional()
        .describe("Filter by specific meeting IDs"),
      term: z.string().optional().describe("Search term to filter meetings"),
      sort_order: z
        .enum(["asc", "desc"])
        .optional()
        .describe("Sort order by scheduled_at (default: asc)"),
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
      if (params.ids) filter.ids = params.ids;
      if (params.employee_id) filter.employee_id = params.employee_id;
      if (params.start_date) filter.start_date = params.start_date;
      if (params.end_date) filter.end_date = params.end_date;
      if (params.term) filter.term = params.term;
      if (Object.keys(filter).length > 0) body.filter = filter;

      if (params.sort_order) {
        body.sort = [{ field: "scheduled_at", order: params.sort_order }];
      }

      const result = await client.request<TeamleaderListResponse<Meeting>>({
        endpoint: "meetings.list",
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

  // ── Get Meeting ──────────────────────────────────────────────────────────
  server.tool(
    "teamleader_get_meeting",
    "Get detailed information about a specific meeting, including location, attendees, custom fields, and optionally tracked time.",
    {
      id: z.string().describe("The meeting ID"),
      include_tracked_time: z
        .boolean()
        .optional()
        .describe("Include tracked time in response (default: false)"),
    },
    async (params) => {
      const body: Record<string, unknown> = { id: params.id };
      if (params.include_tracked_time) {
        body.includes = "tracked_time";
      }

      const result = await client.request<TeamleaderInfoResponse<Meeting>>({
        endpoint: "meetings.info",
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

  // ── Schedule Meeting ─────────────────────────────────────────────────────
  server.tool(
    "teamleader_schedule_meeting",
    "Schedule a new meeting. Returns {id, type}. Requires title, start/end times, and at least one attendee (user). Optionally link to a customer, deal, or milestone. For simple calendar events without meeting features, use teamleader_create_event instead.",
    {
      title: z.string().describe("Meeting title"),
      starts_at: z.string().describe("Start datetime (ISO 8601)"),
      ends_at: z.string().describe("End datetime (ISO 8601)"),
      attendees: z
        .array(
          z.object({
            type: z.string().describe("Attendee type (e.g. 'user', 'contact')"),
            id: z.string().describe("Attendee ID"),
          })
        )
        .describe("List of attendees (at least one user required)"),
      description: z.string().optional().describe("Meeting description"),
      customer_type: z
        .enum(["contact", "company"])
        .optional()
        .describe("Customer type to link meeting to (use with customer_id)"),
      customer_id: z
        .string()
        .optional()
        .describe("Customer ID to link meeting to (use with customer_type)"),
      location_type: z
        .enum(["virtual", "customLocation"])
        .optional()
        .describe("Location type: 'virtual' or 'customLocation'"),
      location_address: z
        .string()
        .optional()
        .describe("Location address (only for customLocation type)"),
      milestone_id: z
        .string()
        .optional()
        .describe("Link meeting to a milestone ID"),
      deal_id: z.string().optional().describe("Link meeting to a deal ID"),
    },
    async (params) => {
      const body: Record<string, unknown> = {
        title: params.title,
        starts_at: params.starts_at,
        ends_at: params.ends_at,
        attendees: params.attendees,
      };

      if (params.description) body.description = params.description;
      if (params.customer_type && params.customer_id) {
        body.customer = { type: params.customer_type, id: params.customer_id };
      }
      if (params.location_type) {
        const location: Record<string, unknown> = { type: params.location_type };
        if (params.location_type === "customLocation" && params.location_address) {
          location.address = params.location_address;
        }
        body.location = location;
      }
      if (params.milestone_id) body.milestone_id = params.milestone_id;
      if (params.deal_id) body.deal_id = params.deal_id;

      const result = await client.request<{ data: { id: string; type: string } }>({
        endpoint: "meetings.schedule",
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

  // ── Update Meeting ───────────────────────────────────────────────────────
  server.tool(
    "teamleader_update_meeting",
    "Update an existing meeting. Only provided fields are changed. When updating attendees, the full list must be provided (at least one user).",
    {
      id: z.string().describe("The meeting ID to update"),
      title: z.string().optional().describe("New meeting title"),
      starts_at: z.string().optional().describe("New start datetime (ISO 8601)"),
      ends_at: z.string().optional().describe("New end datetime (ISO 8601)"),
      description: z
        .string()
        .nullable()
        .optional()
        .describe("New description (null to clear)"),
      attendees: z
        .array(
          z.object({
            type: z.string().describe("Attendee type (e.g. 'user', 'contact')"),
            id: z.string().describe("Attendee ID"),
          })
        )
        .optional()
        .describe("Full attendee list (at least one user if provided)"),
      customer_type: z
        .enum(["contact", "company"])
        .optional()
        .describe("Customer type (use with customer_id)"),
      customer_id: z
        .string()
        .nullable()
        .optional()
        .describe("Customer ID (null to unlink)"),
      milestone_id: z
        .string()
        .nullable()
        .optional()
        .describe("Milestone ID (null to unlink)"),
      deal_id: z
        .string()
        .nullable()
        .optional()
        .describe("Deal ID (null to unlink)"),
    },
    async (params) => {
      const body: Record<string, unknown> = { id: params.id };

      if (params.title !== undefined) body.title = params.title;
      if (params.starts_at !== undefined) body.starts_at = params.starts_at;
      if (params.ends_at !== undefined) body.ends_at = params.ends_at;
      if (params.description !== undefined) body.description = params.description;
      if (params.attendees !== undefined) body.attendees = params.attendees;
      if (params.customer_id !== undefined) {
        body.customer =
          params.customer_id === null
            ? null
            : { type: params.customer_type ?? "company", id: params.customer_id };
      }
      if (params.milestone_id !== undefined) body.milestone_id = params.milestone_id;
      if (params.deal_id !== undefined) body.deal_id = params.deal_id;

      await client.request<void>({
        endpoint: "meetings.update",
        body,
      });

      return {
        content: [
          {
            type: "text" as const,
            text: `Meeting ${params.id} updated successfully.`,
          },
        ],
      };
    }
  );

  // ── Complete Meeting ─────────────────────────────────────────────────────
  server.tool(
    "teamleader_complete_meeting",
    "Mark a meeting as completed. Next step: teamleader_create_meeting_report to attach a summary to a contact, company, or deal.",
    {
      id: z.string().describe("The meeting ID to complete"),
    },
    async (params) => {
      await client.request<void>({
        endpoint: "meetings.complete",
        body: { id: params.id },
      });

      return {
        content: [
          {
            type: "text" as const,
            text: `Meeting ${params.id} marked as completed.`,
          },
        ],
      };
    }
  );

  // ── Delete Meeting ───────────────────────────────────────────────────────
  server.tool(
    "teamleader_delete_meeting",
    "Delete a meeting from Teamleader Focus. This action cannot be undone.",
    {
      id: z.string().describe("The meeting ID to delete"),
    },
    async (params) => {
      await client.request<void>({
        endpoint: "meetings.delete",
        body: { id: params.id },
      });

      return {
        content: [
          {
            type: "text" as const,
            text: `Meeting ${params.id} deleted.`,
          },
        ],
      };
    }
  );

  // ── Create Meeting Report ────────────────────────────────────────────────
  server.tool(
    "teamleader_create_meeting_report",
    "Create a report for a meeting and attach it to a contact, company, or deal. The summary is stored as a note on the linked entity.",
    {
      id: z.string().describe("The meeting ID to create a report for"),
      attach_to_type: z
        .enum(["contact", "company", "deal"])
        .describe("Type of entity to attach the report to"),
      attach_to_id: z
        .string()
        .describe("ID of the entity to attach the report to"),
      summary: z.string().describe("Report summary text"),
    },
    async (params) => {
      const result = await client.request<{
        data: { id: string; type: string };
      }>({
        endpoint: "meetings.createReport",
        body: {
          id: params.id,
          attach_to: { type: params.attach_to_type, id: params.attach_to_id },
          summary: params.summary,
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
