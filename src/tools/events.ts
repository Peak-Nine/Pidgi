/**
 * Teamleader Events Tools
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { TeamleaderClient } from "../api/client.js";
import type {
  Event,
  TeamleaderListResponse,
  TeamleaderInfoResponse,
} from "../types/index.js";

export function registerEventTools(
  server: McpServer,
  client: TeamleaderClient
): void {
  // ── List Events ──────────────────────────────────────────────────────────
  server.tool(
    "teamleader_list_events",
    "List calendar events from Teamleader Focus. Returns array with id, title, activity_type, starts_at, ends_at, attendees, links. Use date range filters (ends_after + starts_before) to find events in a period. Filter by user, activity type, attendee, linked entity, or search term. Next step: teamleader_get_event for full details.",
    {
      page: z.number().optional().describe("Page number (default: 1)"),
      page_size: z.number().optional().describe("Page size (default: 20, max: 100)"),
      ids: z
        .array(z.string())
        .optional()
        .describe("Filter by specific event IDs"),
      user_id: z
        .string()
        .optional()
        .describe("Filter by user ID"),
      activity_type_id: z
        .string()
        .optional()
        .describe("Filter by activity type ID (use teamleader_list_activity_types)"),
      ends_after: z
        .string()
        .optional()
        .describe("ISO 8601 datetime - start of the period (events ending after this date)"),
      starts_before: z
        .string()
        .optional()
        .describe("ISO 8601 datetime - end of the period (events starting before this date)"),
      term: z
        .string()
        .optional()
        .describe("Search term in title or description"),
      attendee_type: z
        .string()
        .optional()
        .describe("Attendee type filter (e.g. 'contact'). Requires attendee_id."),
      attendee_id: z
        .string()
        .optional()
        .describe("Attendee ID filter. Requires attendee_type."),
      link_type: z
        .string()
        .optional()
        .describe("Linked entity type filter ('contact', 'company', 'deal'). Requires link_id."),
      link_id: z
        .string()
        .optional()
        .describe("Linked entity ID filter. Requires link_type."),
      task_id: z
        .string()
        .optional()
        .describe("Filter by linked task ID"),
      done: z
        .boolean()
        .optional()
        .describe("Filter by done status"),
      sort_field: z
        .string()
        .optional()
        .describe("Sort field (only 'starts_at' supported)"),
      sort_order: z
        .enum(["asc", "desc"])
        .optional()
        .describe("Sort order: 'asc' or 'desc' (default: asc)"),
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
      if (params.user_id) filter.user_id = params.user_id;
      if (params.activity_type_id) filter.activity_type_id = params.activity_type_id;
      if (params.ends_after) filter.ends_after = params.ends_after;
      if (params.starts_before) filter.starts_before = params.starts_before;
      if (params.term) filter.term = params.term;
      if (params.attendee_type && params.attendee_id) {
        filter.attendee = { type: params.attendee_type, id: params.attendee_id };
      }
      if (params.link_type && params.link_id) {
        filter.link = { type: params.link_type, id: params.link_id };
      }
      if (params.task_id) filter.task_id = params.task_id;
      if (params.done !== undefined) filter.done = params.done;
      if (Object.keys(filter).length > 0) body.filter = filter;

      if (params.sort_field || params.sort_order) {
        body.sort = [
          {
            field: params.sort_field ?? "starts_at",
            order: params.sort_order ?? "asc",
          },
        ];
      }

      const result = await client.request<TeamleaderListResponse<Event>>({
        endpoint: "events.list",
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

  // ── Get Event ────────────────────────────────────────────────────────────
  server.tool(
    "teamleader_get_event",
    "Get full event details including title, description, activity_type, times, location, attendees, and linked entities.",
    {
      id: z.string().describe("The event ID"),
    },
    async (params) => {
      const result = await client.request<TeamleaderInfoResponse<Event>>({
        endpoint: "events.info",
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

  // ── Create Event ─────────────────────────────────────────────────────────
  server.tool(
    "teamleader_create_event",
    "Create a new calendar event. Returns {id, type}. Lookup: teamleader_list_activity_types (activity_type_id), teamleader_list_work_types (work_type_id). For meetings with reports and completion tracking, use teamleader_schedule_meeting instead.",
    {
      title: z.string().describe("Event title"),
      description: z.string().optional().describe("Event description"),
      activity_type_id: z.string().describe("Activity type ID (use teamleader_list_activity_types to find)"),
      starts_at: z.string().describe("Start datetime (ISO 8601)"),
      ends_at: z.string().describe("End datetime (ISO 8601)"),
      location: z.string().optional().describe("Event location"),
      work_type_id: z.string().optional().describe("Work type ID (use teamleader_list_work_types to find)"),
      attendees: z
        .array(
          z.object({
            type: z.enum(["user", "contact"]).describe("Attendee type"),
            id: z.string().describe("Attendee ID"),
          })
        )
        .optional()
        .describe("List of attendees"),
      links: z
        .array(
          z.object({
            type: z.enum(["contact", "company", "deal"]).describe("Linked entity type"),
            id: z.string().describe("Linked entity ID"),
          })
        )
        .optional()
        .describe("Linked entities (contacts, companies, deals)"),
    },
    async (params) => {
      const body: Record<string, unknown> = {
        title: params.title,
        activity_type_id: params.activity_type_id,
        starts_at: params.starts_at,
        ends_at: params.ends_at,
      };

      if (params.description) body.description = params.description;
      if (params.location) body.location = params.location;
      if (params.work_type_id) body.work_type_id = params.work_type_id;
      if (params.attendees) body.attendees = params.attendees;
      if (params.links) body.links = params.links;

      const result = await client.request<{ data: { id: string; type: string } }>({
        endpoint: "events.create",
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

  // ── Update Event ─────────────────────────────────────────────────────────
  server.tool(
    "teamleader_update_event",
    "Update an existing calendar event. All fields except id are optional — only provided fields are updated. Attendees and links arrays replace the full list when provided.",
    {
      id: z.string().describe("The event ID to update"),
      title: z.string().optional().describe("New event title"),
      description: z.string().nullable().optional().describe("New event description (null to clear)"),
      starts_at: z.string().optional().describe("New start datetime (ISO 8601)"),
      ends_at: z.string().optional().describe("New end datetime (ISO 8601)"),
      location: z.string().optional().describe("New event location"),
      work_type_id: z.string().optional().describe("Work type ID (use teamleader_list_work_types to find)"),
      attendees: z
        .array(
          z.object({
            type: z.enum(["user", "contact"]).describe("Attendee type"),
            id: z.string().describe("Attendee ID"),
          })
        )
        .optional()
        .describe("Replace attendees list"),
      links: z
        .array(
          z.object({
            type: z.enum(["contact", "company", "deal"]).describe("Linked entity type"),
            id: z.string().describe("Linked entity ID"),
          })
        )
        .optional()
        .describe("Replace linked entities list"),
    },
    async (params) => {
      const body: Record<string, unknown> = { id: params.id };

      if (params.title !== undefined) body.title = params.title;
      if (params.description !== undefined) body.description = params.description;
      if (params.starts_at !== undefined) body.starts_at = params.starts_at;
      if (params.ends_at !== undefined) body.ends_at = params.ends_at;
      if (params.location !== undefined) body.location = params.location;
      if (params.work_type_id !== undefined) body.work_type_id = params.work_type_id;
      if (params.attendees !== undefined) body.attendees = params.attendees;
      if (params.links !== undefined) body.links = params.links;

      await client.request<void>({
        endpoint: "events.update",
        body,
      });

      return {
        content: [
          {
            type: "text" as const,
            text: `Event ${params.id} updated successfully.`,
          },
        ],
      };
    }
  );

  // ── Cancel Event ─────────────────────────────────────────────────────────
  server.tool(
    "teamleader_cancel_event",
    "Cancel a calendar event for all attendees. This action cannot be undone.",
    {
      id: z.string().describe("The event ID to cancel"),
    },
    async (params) => {
      await client.request<void>({
        endpoint: "events.cancel",
        body: { id: params.id },
      });

      return {
        content: [
          {
            type: "text" as const,
            text: `Event ${params.id} cancelled successfully.`,
          },
        ],
      };
    }
  );
}
