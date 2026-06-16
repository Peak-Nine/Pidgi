/**
 * Teamleader Ticket Tools
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { TeamleaderClient } from "../api/client.js";
import type {
  Ticket,
  TicketMessage,
  TeamleaderListResponse,
  TeamleaderInfoResponse,
} from "../types/index.js";

export function registerTicketTools(
  server: McpServer,
  client: TeamleaderClient
): void {
  // ── List Tickets ─────────────────────────────────────────────────────────
  server.tool(
    "teamleader_list_tickets",
    "List tickets from Teamleader Focus. Returns array with id, subject, status, customer, assignee. CRITICAL: customer filter uses 'relates_to: {type, id}' internally (NOT 'customer_id') — this tool handles that automatically. WARNING: Status filtering is exclusion-based only (exclude_status_ids) — there is no direct status include filter. Use teamleader_list_ticket_statuses to find status IDs. Next steps: teamleader_get_ticket for details, teamleader_reply_ticket to respond. ERROR: Empty/wrong results on tickets.list → CAUSE: Using customer_id directly instead of relates_to → FIX: Use customer_type + customer_id params — this tool maps to relates_to automatically.",
    {
      page: z.number().optional().describe("Page number (default: 1)"),
      page_size: z.number().optional().describe("Page size (default: 20)"),
      customer_type: z
        .enum(["contact", "company"])
        .optional()
        .describe("Customer type to filter by (use with customer_id). Mapped to 'relates_to' filter internally."),
      customer_id: z
        .string()
        .optional()
        .describe("Customer ID to filter by (use with customer_type). Mapped to 'relates_to' filter internally."),
      ids: z
        .array(z.string())
        .optional()
        .describe("Filter by specific ticket IDs"),
      project_ids: z
        .array(z.string())
        .optional()
        .describe("Filter by project IDs"),
      exclude_status_ids: z
        .array(z.string())
        .optional()
        .describe("Ticket status IDs to exclude (use teamleader_list_ticket_statuses to find IDs). NOTE: this is the only way to filter by status — there is no direct status include filter."),
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
      if (params.customer_type && params.customer_id) {
        filter.relates_to = {
          type: params.customer_type,
          id: params.customer_id,
        };
      }
      if (params.ids) filter.ids = params.ids;
      if (params.project_ids) filter.project_ids = params.project_ids;
      if (params.exclude_status_ids) {
        filter.exclude = { status_ids: params.exclude_status_ids };
      }
      if (Object.keys(filter).length > 0) body.filter = filter;

      const result = await client.request<TeamleaderListResponse<Ticket>>({
        endpoint: "tickets.list",
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

  // ── Get Ticket ───────────────────────────────────────────────────────────
  server.tool(
    "teamleader_get_ticket",
    "Get full ticket details including subject, status, assignee, customer, description, custom fields, and timestamps. Next steps: teamleader_list_ticket_messages for conversation, teamleader_reply_ticket to respond, teamleader_update_ticket to change status/assignee.",
    {
      id: z.string().describe("The ticket ID"),
    },
    async (params) => {
      const result = await client.request<TeamleaderInfoResponse<Ticket>>({
        endpoint: "tickets.info",
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

  // ── Create Ticket ────────────────────────────────────────────────────────
  server.tool(
    "teamleader_create_ticket",
    "Create a new ticket. Requires subject, customer, and ticket_status_id. Returns {id, type}. Lookup IDs: teamleader_list_ticket_statuses (ticket_status_id), teamleader_list_users (assignee_id). Next step: teamleader_reply_ticket to add the first reply.",
    {
      subject: z.string().describe("Ticket subject/title"),
      customer_type: z
        .enum(["contact", "company"])
        .describe("Customer type"),
      customer_id: z.string().describe("Customer ID"),
      ticket_status_id: z.string().describe("Ticket status ID (use teamleader_list_ticket_statuses to find)"),
      description: z
        .string()
        .optional()
        .describe("Ticket description (markdown formatted)"),
      assignee_id: z
        .string()
        .optional()
        .describe("User ID to assign the ticket to"),
      participant_company_id: z
        .string()
        .optional()
        .describe("Participant company ID"),
      initial_reply: z
        .enum(["automatic", "disabled"])
        .optional()
        .describe("Initial reply behavior: 'automatic' or 'disabled'"),
    },
    async (params) => {
      const body: Record<string, unknown> = {
        subject: params.subject,
        customer: {
          type: params.customer_type,
          id: params.customer_id,
        },
        ticket_status_id: params.ticket_status_id,
      };

      if (params.description) body.description = params.description;
      if (params.assignee_id) {
        body.assignee = { type: "user", id: params.assignee_id };
      }
      if (params.participant_company_id) {
        body.participant = {
          customer: { type: "company", id: params.participant_company_id },
        };
      }
      if (params.initial_reply) body.initial_reply = params.initial_reply;

      const result = await client.request<
        TeamleaderInfoResponse<{ id: string; type: string }>
      >({
        endpoint: "tickets.create",
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

  // ── Update Ticket ────────────────────────────────────────────────────────
  server.tool(
    "teamleader_update_ticket",
    "Update an existing ticket. Only provided fields are changed. Can change subject, description, status, assignee, and customer.",
    {
      id: z.string().describe("The ticket ID to update"),
      subject: z.string().optional().describe("New ticket subject"),
      description: z
        .string()
        .optional()
        .describe("New description (markdown formatted)"),
      ticket_status_id: z
        .string()
        .optional()
        .describe("New ticket status ID (use teamleader_list_ticket_statuses to find)"),
      assignee_id: z
        .string()
        .optional()
        .nullable()
        .describe("User ID to assign (null to unassign)"),
      customer_type: z
        .enum(["contact", "company"])
        .optional()
        .describe("New customer type (use with customer_id)"),
      customer_id: z
        .string()
        .optional()
        .describe("New customer ID (use with customer_type)"),
    },
    async (params) => {
      const body: Record<string, unknown> = { id: params.id };

      if (params.subject) body.subject = params.subject;
      if (params.description) body.description = params.description;
      if (params.ticket_status_id)
        body.ticket_status_id = params.ticket_status_id;
      if (params.assignee_id !== undefined) {
        body.assignee =
          params.assignee_id === null
            ? null
            : { type: "user", id: params.assignee_id };
      }
      if (params.customer_type && params.customer_id) {
        body.customer = {
          type: params.customer_type,
          id: params.customer_id,
        };
      }

      await client.request({
        endpoint: "tickets.update",
        body,
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              success: true,
              message: `Ticket ${params.id} updated`,
            }),
          },
        ],
      };
    }
  );

  // ── List Ticket Messages ─────────────────────────────────────────────────
  server.tool(
    "teamleader_list_ticket_messages",
    "List messages in a ticket. Can filter by message type (customer, internal, thirdParty) and date range.",
    {
      id: z.string().describe("The ticket ID"),
      type: z
        .enum(["customer", "internal", "thirdParty"])
        .optional()
        .describe("Filter by message type"),
      created_before: z
        .string()
        .optional()
        .describe("ISO 8601 datetime - messages created before this date"),
      created_after: z
        .string()
        .optional()
        .describe("ISO 8601 datetime - messages created after this date"),
      page: z.number().optional().describe("Page number (default: 1)"),
      page_size: z.number().optional().describe("Page size (default: 20)"),
    },
    async (params) => {
      const body: Record<string, unknown> = { id: params.id };

      if (params.page || params.page_size) {
        body.page = {
          number: params.page ?? 1,
          size: params.page_size ?? 20,
        };
      }

      const filter: Record<string, unknown> = {};
      if (params.type) filter.type = params.type;
      if (params.created_before) filter.created_before = params.created_before;
      if (params.created_after) filter.created_after = params.created_after;
      if (Object.keys(filter).length > 0) body.filter = filter;

      const result = await client.request<
        TeamleaderListResponse<TicketMessage>
      >({
        endpoint: "tickets.listMessages",
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

  // ── Get Ticket Message ───────────────────────────────────────────────────
  server.tool(
    "teamleader_get_ticket_message",
    "Get full details of a specific ticket message including body (HTML), sender, attachments, and timestamps.",
    {
      message_id: z.string().describe("The ticket message ID"),
    },
    async (params) => {
      const result = await client.request<TeamleaderInfoResponse<TicketMessage>>(
        {
          endpoint: "tickets.getMessage",
          body: { message_id: params.message_id },
        }
      );

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

  // ── Reply to Ticket ──────────────────────────────────────────────────────
  server.tool(
    "teamleader_reply_ticket",
    "Add a customer-visible reply to a ticket. The message body should be HTML formatted. Optionally change ticket status in the same call. For internal notes not visible to customer, use teamleader_internal_message_ticket instead.",
    {
      id: z.string().describe("The ticket ID"),
      body: z.string().describe("Reply message body (HTML formatted)"),
      ticket_status_id: z
        .string()
        .optional()
        .describe("Optionally set ticket status after replying (use teamleader_list_ticket_statuses to find IDs)"),
      attachments: z
        .array(z.string())
        .optional()
        .describe("Array of file IDs to attach (use teamleader_upload_file to create)"),
    },
    async (params) => {
      const reqBody: Record<string, unknown> = {
        id: params.id,
        body: params.body,
      };

      if (params.ticket_status_id)
        reqBody.ticket_status_id = params.ticket_status_id;
      if (params.attachments) reqBody.attachments = params.attachments;

      const result = await client.request<
        TeamleaderInfoResponse<{ id: string; type: string }>
      >({
        endpoint: "tickets.addReply",
        body: reqBody,
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

  // ── Internal Message on Ticket ───────────────────────────────────────────
  server.tool(
    "teamleader_internal_message_ticket",
    "Add an internal (private) message to a ticket. NOT visible to the customer. Use for internal notes between team members. For customer-visible replies, use teamleader_reply_ticket instead.",
    {
      id: z.string().describe("The ticket ID"),
      body: z.string().describe("Internal message body (HTML formatted)"),
      ticket_status_id: z
        .string()
        .optional()
        .describe("Optionally set ticket status (use teamleader_list_ticket_statuses to find IDs)"),
      attachments: z
        .array(z.string())
        .optional()
        .describe("Array of file IDs to attach (use teamleader_upload_file to create)"),
    },
    async (params) => {
      const reqBody: Record<string, unknown> = {
        id: params.id,
        body: params.body,
      };

      if (params.ticket_status_id)
        reqBody.ticket_status_id = params.ticket_status_id;
      if (params.attachments) reqBody.attachments = params.attachments;

      const result = await client.request<
        TeamleaderInfoResponse<{ id: string; type: string }>
      >({
        endpoint: "tickets.addInternalMessage",
        body: reqBody,
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

  // ── Import Ticket Message ────────────────────────────────────────────────
  server.tool(
    "teamleader_import_ticket_message",
    "Import an external message into a ticket (e.g. for migration). Unlike addReply, this allows setting the sender and timestamp. The body should be HTML formatted.",
    {
      id: z.string().describe("The ticket ID"),
      body: z.string().describe("Message body (HTML formatted)"),
      sent_by_type: z.enum(["company", "contact", "user"]).describe("Sender entity type"),
      sent_by_id: z.string().describe("Sender entity ID"),
      sent_at: z.string().describe("When the message was sent (ISO 8601 datetime)"),
      attachments: z.array(z.string()).optional().describe("Array of file IDs to attach"),
    },
    async (params) => {
      const body: Record<string, unknown> = {
        id: params.id,
        body: params.body,
        sent_by: { type: params.sent_by_type, id: params.sent_by_id },
        sent_at: params.sent_at,
      };
      if (params.attachments) body.attachments = params.attachments;

      const result = await client.request<{ data: { id: string; type: string } }>({
        endpoint: "tickets.importMessage",
        body,
      });

      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    }
  );
}
