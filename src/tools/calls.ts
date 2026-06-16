/**
 * Teamleader CRM Calls Tools
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { TeamleaderClient } from "../api/client.js";

function respond(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

interface CallData {
  id: string;
  added_at: string | null;
  completed_at: string | null;
  participant: {
    customer: { type: string; id: string } | null;
    contact: { type: string; id: string } | null;
  } | null;
  description: string | null;
  outcome: { type: string; id: string } | null;
  outcome_summary: string | null;
  assignee: { type: string; id: string } | null;
  scheduled_at: string;
  status: string;
  deal: { type: string; id: string } | null;
  custom_fields?: Array<{
    definition: { type: string; id: string };
    value: unknown;
  }>;
}

function formatCall(c: CallData, index?: number): string {
  const prefix = index !== undefined ? `${index}. ` : "";
  const date = c.scheduled_at?.substring(0, 16) ?? "no date";
  const status = c.status ?? "unknown";
  const desc = c.description
    ? c.description.length > 80
      ? c.description.substring(0, 80) + "…"
      : c.description
    : "no description";
  const customer = c.participant?.customer
    ? `${c.participant.customer.type}:${c.participant.customer.id}`
    : "none";
  const assignee = c.assignee ? c.assignee.id : "unassigned";
  return `${prefix}[${status}] ${date} — ${desc}\n   Customer: ${customer} | Assignee: ${assignee}\n   ID: ${c.id}`;
}

export function registerCallTools(
  server: McpServer,
  client: TeamleaderClient
): void {
  // ── List Calls ──────────────────────────────────────────────────────────
  server.tool(
    "teamleader_list_calls",
    "List CRM calls in Teamleader Focus. Filter by date range, related company, or call outcome. Returns scheduled date, status, description, customer and assignee.",
    {
      scheduled_after: z
        .string()
        .optional()
        .describe("Filter calls on or after this date (YYYY-MM-DD)"),
      scheduled_before: z
        .string()
        .optional()
        .describe("Filter calls on or before this date (YYYY-MM-DD)"),
      relates_to_type: z
        .string()
        .optional()
        .describe("Type of related entity to filter on (currently only 'company')"),
      relates_to_id: z
        .string()
        .optional()
        .describe("ID of the related entity to filter on"),
      call_outcome_id: z
        .string()
        .optional()
        .describe("Filter completed calls by outcome ID"),
      page: z.number().optional().describe("Page number (default: 1)"),
      page_size: z.number().optional().describe("Page size, max 100 (default: 20)"),
    },
    async (params) => {
      const filter: Record<string, unknown> = {};
      if (params.scheduled_after) filter.scheduled_after = params.scheduled_after;
      if (params.scheduled_before) filter.scheduled_before = params.scheduled_before;
      if (params.relates_to_type && params.relates_to_id) {
        filter.relates_to = {
          type: params.relates_to_type,
          id: params.relates_to_id,
        };
      }
      if (params.call_outcome_id) filter.call_outcome_id = params.call_outcome_id;

      const body: Record<string, unknown> = {};
      if (Object.keys(filter).length > 0) body.filter = filter;
      body.page = {
        number: params.page ?? 1,
        size: params.page_size ?? 20,
      };

      const result = await client.request<{ data: CallData[] }>({
        endpoint: "calls.list",
        body,
      });

      if (!result.data || result.data.length === 0) {
        return respond("No calls found matching the given filters.");
      }

      const lines = result.data.map((c, i) => formatCall(c, i + 1));
      return respond(`${result.data.length} call(s):\n\n${lines.join("\n\n")}`);
    }
  );

  // ── Get Call ────────────────────────────────────────────────────────────
  server.tool(
    "teamleader_get_call",
    "Get detailed information about a specific CRM call in Teamleader Focus by its ID. Returns all fields including participant, outcome, custom fields, and deal link.",
    {
      id: z.string().describe("The call ID"),
    },
    async (params) => {
      const result = await client.request<{ data: CallData }>({
        endpoint: "calls.info",
        body: { id: params.id },
      });

      const c = result.data;
      const parts: string[] = [
        `Call: ${c.id}`,
        `Status: ${c.status}`,
        `Scheduled: ${c.scheduled_at}`,
        `Added: ${c.added_at ?? "n/a"}`,
        `Completed: ${c.completed_at ?? "n/a"}`,
        `Description: ${c.description ?? "none"}`,
      ];

      if (c.participant?.customer) {
        parts.push(
          `Customer: ${c.participant.customer.type} ${c.participant.customer.id}`
        );
      }
      if (c.participant?.contact) {
        parts.push(
          `Contact: ${c.participant.contact.type} ${c.participant.contact.id}`
        );
      }
      if (c.assignee) {
        parts.push(`Assignee: ${c.assignee.type} ${c.assignee.id}`);
      }
      if (c.outcome) {
        parts.push(`Outcome: ${c.outcome.type} ${c.outcome.id}`);
      }
      if (c.outcome_summary) {
        parts.push(`Outcome summary: ${c.outcome_summary}`);
      }
      if (c.deal) {
        parts.push(`Deal: ${c.deal.type} ${c.deal.id}`);
      }
      if (c.custom_fields && c.custom_fields.length > 0) {
        parts.push(
          `Custom fields: ${c.custom_fields.map((cf) => `${cf.definition.id}=${JSON.stringify(cf.value)}`).join(", ")}`
        );
      }

      return respond(parts.join("\n"));
    }
  );

  // ── Add Call ────────────────────────────────────────────────────────────
  server.tool(
    "teamleader_add_call",
    "Add a new CRM call in Teamleader Focus. Requires a customer (contact or company), due date, and assignee. Optionally link to a deal.",
    {
      customer_type: z
        .enum(["contact", "company"])
        .describe("Type of the customer for the call"),
      customer_id: z.string().describe("ID of the customer (contact or company)"),
      due_at: z
        .string()
        .describe("When the call is due (ISO 8601 datetime, e.g. 2026-03-05T14:00:00+00:00)"),
      assignee_id: z.string().describe("User ID of the assignee"),
      description: z
        .string()
        .optional()
        .describe("Description of the call"),
      deal_id: z
        .string()
        .optional()
        .describe("Optional deal ID to link the call to"),
      custom_fields: z
        .array(
          z.object({
            id: z.string().describe("Custom field definition ID"),
            value: z.unknown().describe("Custom field value"),
          })
        )
        .optional()
        .describe("Custom field values to set"),
    },
    async (params) => {
      const body: Record<string, unknown> = {
        participant: {
          customer: {
            type: params.customer_type,
            id: params.customer_id,
          },
        },
        due_at: params.due_at,
        assignee: {
          type: "user",
          id: params.assignee_id,
        },
      };

      if (params.description) body.description = params.description;
      if (params.deal_id) body.deal_id = params.deal_id;
      if (params.custom_fields) body.custom_fields = params.custom_fields;

      const result = await client.request<{
        data: { id: string; type: string };
      }>({
        endpoint: "calls.add",
        body,
      });

      return respond(`Call created (ID: ${result.data.id}).`);
    }
  );

  // ── Update Call ─────────────────────────────────────────────────────────
  server.tool(
    "teamleader_update_call",
    "Update an existing CRM call in Teamleader Focus. All fields except ID are optional — only provided fields are updated.",
    {
      id: z.string().describe("The call ID to update"),
      description: z.string().optional().describe("New description"),
      customer_type: z
        .enum(["contact", "company"])
        .optional()
        .describe("Type of the customer (must be provided together with customer_id)"),
      customer_id: z
        .string()
        .optional()
        .describe("ID of the customer (must be provided together with customer_type)"),
      due_at: z
        .string()
        .optional()
        .describe("New due date (ISO 8601 datetime)"),
      assignee_id: z
        .string()
        .optional()
        .describe("New assignee user ID"),
      deal_id: z
        .string()
        .nullable()
        .optional()
        .describe("Deal ID to link (null to unlink)"),
      custom_fields: z
        .array(
          z.object({
            id: z.string().describe("Custom field definition ID"),
            value: z.unknown().describe("Custom field value"),
          })
        )
        .optional()
        .describe("Custom field values to update"),
    },
    async (params) => {
      const body: Record<string, unknown> = { id: params.id };

      if (params.description !== undefined) body.description = params.description;
      if (params.customer_type && params.customer_id) {
        body.participant = {
          customer: {
            type: params.customer_type,
            id: params.customer_id,
          },
        };
      }
      if (params.due_at) body.due_at = params.due_at;
      if (params.assignee_id) {
        body.assignee = { type: "user", id: params.assignee_id };
      }
      if (params.deal_id !== undefined) body.deal_id = params.deal_id;
      if (params.custom_fields) body.custom_fields = params.custom_fields;

      await client.request({
        endpoint: "calls.update",
        body,
      });

      return respond(`Call ${params.id} updated.`);
    }
  );

  // ── Complete Call ───────────────────────────────────────────────────────
  server.tool(
    "teamleader_complete_call",
    "Mark a CRM call as complete in Teamleader Focus. Optionally provide a call outcome and summary.",
    {
      id: z.string().describe("The call ID to complete"),
      call_outcome_id: z
        .string()
        .optional()
        .describe("Call outcome ID (use teamleader_list_call_outcomes to find valid IDs)"),
      outcome_summary: z
        .string()
        .optional()
        .describe("Free-text summary of the call outcome"),
    },
    async (params) => {
      const body: Record<string, unknown> = { id: params.id };
      if (params.call_outcome_id) body.call_outcome_id = params.call_outcome_id;
      if (params.outcome_summary) body.outcome_summary = params.outcome_summary;

      await client.request({
        endpoint: "calls.complete",
        body,
      });

      return respond(`Call ${params.id} marked as completed.`);
    }
  );
}
