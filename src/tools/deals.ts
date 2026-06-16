/**
 * Teamleader Deals Tools
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { TeamleaderClient } from "../api/client.js";
import type {
  Deal,
  TeamleaderListResponse,
  TeamleaderInfoResponse,
} from "../types/index.js";

function respond(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

export function registerDealTools(
  server: McpServer,
  client: TeamleaderClient
): void {
  // ── List Deals ───────────────────────────────────────────────────────────
  server.tool(
    "teamleader_list_deals",
    "List deals/opportunities from Teamleader Focus. Returns array with id, title, phase, estimated_value, customer. Use to find deal IDs. Next steps: teamleader_get_deal for details, teamleader_move_deal to change phase, teamleader_win_deal / teamleader_lose_deal to close. NOTE: `customer` filter is object {type, id}, not flat customer_id — this tool maps customer_type+customer_id automatically. `responsible_user_id` also supports string array for multi-user filter. Valid status values: 'open', 'won', 'lost'.",
    {
      page: z.number().optional().describe("Page number (default: 1)"),
      page_size: z.number().optional().describe("Page size (default: 20, max: 100)"),
      term: z.string().optional().describe("Search term to filter deals"),
      ids: z.array(z.string()).optional().describe("Filter by specific deal IDs"),
      phase_id: z.string().optional().describe("Filter by deal phase ID (use teamleader_list_deal_phases to find)"),
      customer_type: z.enum(["contact", "company"]).optional().describe("Customer type for customer filter (requires customer_id)"),
      customer_id: z.string().optional().describe("Customer ID for customer filter (requires customer_type)"),
      status: z.array(z.enum(["open", "won", "lost"])).optional().describe("Filter by deal status(es)"),
      pipeline_ids: z.array(z.string()).optional().describe("Filter by pipeline IDs"),
      estimated_closing_date_from: z.string().optional().describe("Estimated closing date range start (YYYY-MM-DD)"),
      estimated_closing_date_until: z.string().optional().describe("Estimated closing date range end (YYYY-MM-DD)"),
      responsible_user_id: z.string().optional().describe("Filter by responsible user ID"),
      updated_since: z
        .string()
        .optional()
        .describe("ISO 8601 date - only deals updated after this date"),
      sort_field: z.enum(["created_at", "weighted_value"]).optional().describe("Field to sort by"),
      sort_order: z.enum(["asc", "desc"]).optional().describe("Sort order (default: asc)"),
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
      if (params.phase_id) filter.phase_id = params.phase_id;
      if (params.customer_type && params.customer_id) {
        filter.customer = { type: params.customer_type, id: params.customer_id };
      }
      if (params.status) filter.status = params.status;
      if (params.pipeline_ids) filter.pipeline_ids = params.pipeline_ids;
      if (params.estimated_closing_date_from || params.estimated_closing_date_until) {
        const ecDate: Record<string, string> = {};
        if (params.estimated_closing_date_from) ecDate.from = params.estimated_closing_date_from;
        if (params.estimated_closing_date_until) ecDate.until = params.estimated_closing_date_until;
        filter.estimated_closing_date = ecDate;
      }
      if (params.responsible_user_id)
        filter.responsible_user_id = params.responsible_user_id;
      if (params.updated_since) filter.updated_since = params.updated_since;
      if (Object.keys(filter).length > 0) body.filter = filter;

      if (params.sort_field) {
        body.sort = [{ field: params.sort_field, order: params.sort_order ?? "asc" }];
      }

      const result = await client.request<TeamleaderListResponse<Deal>>({
        endpoint: "deals.list",
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

  // ── Get Deal ─────────────────────────────────────────────────────────────
  server.tool(
    "teamleader_get_deal",
    "Get full deal details including title, phase, customer, estimated value, probability, responsible user, and custom fields. Next steps: teamleader_move_deal to change phase, teamleader_update_deal to edit.",
    {
      id: z.string().describe("The deal ID"),
    },
    async (params) => {
      const result = await client.request<TeamleaderInfoResponse<Deal>>({
        endpoint: "deals.info",
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

  // ── Create Deal ──────────────────────────────────────────────────────────
  server.tool(
    "teamleader_create_deal",
    "Create a new deal/opportunity. Returns {id, type}. Lookup IDs first: teamleader_list_deal_phases (phase_id), teamleader_list_deal_sources (source_id), teamleader_list_departments (department_id). Next steps: teamleader_move_deal to advance through pipeline. NOTE: phase_id is required in this tool but optional in the API (defaults to first phase).",
    {
      title: z.string().describe("Deal title"),
      customer_type: z.enum(["contact", "company"]).describe("Customer type"),
      customer_id: z.string().describe("Customer ID (contact or company)"),
      phase_id: z.string().describe("Deal phase ID (use teamleader_list_deal_phases to find)"),
      summary: z.string().optional().describe("Free text summary of the deal"),
      contact_person_id: z.string().optional().describe("Contact person ID on a company customer"),
      estimated_value_amount: z.number().optional().describe("Estimated value amount"),
      estimated_value_currency: z
        .string()
        .optional()
        .describe("Currency code (e.g. 'EUR', 'USD')"),
      estimated_closing_date: z
        .string()
        .optional()
        .describe("Estimated closing date (YYYY-MM-DD)"),
      estimated_probability: z
        .number()
        .optional()
        .describe("Estimated probability (0-1)"),
      responsible_user_id: z
        .string()
        .optional()
        .describe("Responsible user ID"),
      department_id: z.string().optional().describe("Department ID (use teamleader_list_departments to find)"),
      source_id: z.string().optional().describe("Source ID (use teamleader_list_deal_sources to find)"),
    },
    async (params) => {
      const body: Record<string, unknown> = {
        title: params.title,
        lead: {
          customer: {
            type: params.customer_type,
            id: params.customer_id,
          },
          ...(params.contact_person_id ? { contact_person_id: params.contact_person_id } : {}),
        },
        phase_id: params.phase_id,
      };

      if (params.summary) body.summary = params.summary;

      if (
        params.estimated_value_amount !== undefined &&
        params.estimated_value_currency
      ) {
        body.estimated_value = {
          amount: params.estimated_value_amount,
          currency: params.estimated_value_currency,
        };
      }

      if (params.estimated_closing_date)
        body.estimated_closing_date = params.estimated_closing_date;
      if (params.estimated_probability !== undefined)
        body.estimated_probability = params.estimated_probability;
      if (params.responsible_user_id)
        body.responsible_user_id = params.responsible_user_id;
      if (params.department_id) body.department_id = params.department_id;
      if (params.source_id) body.source_id = params.source_id;

      const result = await client.request<
        TeamleaderInfoResponse<{ id: string; type: string }>
      >({
        endpoint: "deals.create",
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

  // ── Update Deal ──────────────────────────────────────────────────────────
  server.tool(
    "teamleader_update_deal",
    "Update an existing deal. Only provided fields are changed. NOTE: To change the deal's phase, use teamleader_move_deal instead. source_id and department_id are nullable — pass null to clear.",
    {
      id: z.string().describe("The deal ID to update"),
      title: z.string().optional().describe("Deal title"),
      summary: z.string().nullable().optional().describe("Free text summary (pass null to clear)"),
      estimated_value_amount: z.number().optional().describe("Estimated value amount"),
      estimated_value_currency: z
        .string()
        .optional()
        .describe("Currency code (e.g. 'EUR', 'USD')"),
      estimated_closing_date: z
        .string()
        .optional()
        .describe("Estimated closing date (YYYY-MM-DD)"),
      estimated_probability: z
        .number()
        .optional()
        .describe("Estimated probability (0-1)"),
      responsible_user_id: z
        .string()
        .optional()
        .describe("Responsible user ID"),
      source_id: z.string().nullable().optional().describe("Source ID (pass null to clear). Use teamleader_list_deal_sources to find valid IDs."),
      department_id: z.string().nullable().optional().describe("Department ID (pass null to clear). Use teamleader_list_departments to find valid IDs."),
      contact_person_id: z.string().nullable().optional().describe("Contact person ID (pass null to clear)"),
    },
    async (params) => {
      const body: Record<string, unknown> = { id: params.id };

      if (params.title) body.title = params.title;
      if (params.summary !== undefined) body.summary = params.summary;
      if (
        params.estimated_value_amount !== undefined &&
        params.estimated_value_currency
      ) {
        body.estimated_value = {
          amount: params.estimated_value_amount,
          currency: params.estimated_value_currency,
        };
      }
      if (params.estimated_closing_date)
        body.estimated_closing_date = params.estimated_closing_date;
      if (params.estimated_probability !== undefined)
        body.estimated_probability = params.estimated_probability;
      if (params.responsible_user_id)
        body.responsible_user_id = params.responsible_user_id;
      if (params.source_id !== undefined) body.source_id = params.source_id;
      if (params.department_id !== undefined) body.department_id = params.department_id;
      if (params.contact_person_id !== undefined) body.contact_person_id = params.contact_person_id;

      await client.request({
        endpoint: "deals.update",
        body,
      });

      return respond(`Deal ${params.id} updated.`);
    }
  );

  // ── Delete Deal ─────────────────────────────────────────────────────────
  server.tool(
    "teamleader_delete_deal",
    "Delete a deal from Teamleader Focus. This action is irreversible.",
    {
      id: z.string().describe("The deal ID to delete"),
    },
    async (params) => {
      await client.request<void>({
        endpoint: "deals.delete",
        body: { id: params.id },
      });
      return respond(`Deal ${params.id} deleted.`);
    }
  );

  // ── Lose Deal ───────────────────────────────────────────────────────────
  server.tool(
    "teamleader_lose_deal",
    "Mark a deal as lost. Use teamleader_list_lost_reasons to get available reason IDs.",
    {
      id: z.string().describe("The deal ID to mark as lost"),
      reason_id: z.string().optional().describe("Lost reason ID (use teamleader_list_lost_reasons to find IDs)"),
      extra_info: z.string().optional().describe("Additional info about why the deal was lost"),
    },
    async (params) => {
      const body: Record<string, unknown> = { id: params.id };
      if (params.reason_id) body.reason_id = params.reason_id;
      if (params.extra_info) body.extra_info = params.extra_info;

      await client.request<void>({
        endpoint: "deals.lose",
        body,
      });
      return respond(`Deal ${params.id} marked as lost.`);
    }
  );

  // ── Win Deal ────────────────────────────────────────────────────────────
  server.tool(
    "teamleader_win_deal",
    "Mark a deal as won. This is irreversible — the deal moves to the 'won' state.",
    {
      id: z.string().describe("The deal ID to mark as won"),
    },
    async (params) => {
      await client.request<void>({
        endpoint: "deals.win",
        body: { id: params.id },
      });
      return respond(`Deal ${params.id} marked as won.`);
    }
  );

  // ── Move Deal ───────────────────────────────────────────────────────────
  server.tool(
    "teamleader_move_deal",
    "Move a deal to a different phase in its pipeline. Use teamleader_list_deal_phases to get available phase IDs.",
    {
      id: z.string().describe("The deal ID to move"),
      phase_id: z.string().describe("Target phase ID (use teamleader_list_deal_phases to find IDs)"),
    },
    async (params) => {
      await client.request<void>({
        endpoint: "deals.move",
        body: { id: params.id, phase_id: params.phase_id },
      });
      return respond(`Deal ${params.id} moved to phase ${params.phase_id}.`);
    }
  );

  // ── List Lost Reasons ──────────────────────────────────────────────────
  server.tool(
    "teamleader_list_lost_reasons",
    "List available lost reasons for deals. Use the returned IDs with teamleader_lose_deal.",
    {},
    async () => {
      const result = await client.request<TeamleaderListResponse<{ id: string; name: string }>>({
        endpoint: "lostReasons.list",
        body: { page: { size: 100, number: 1 } },
      });

      const reasons = result.data ?? [];
      if (reasons.length === 0) return respond("No lost reasons found.");

      const lines = reasons.map((r, i) => `${i + 1}. ${r.name} (${r.id})`);
      return respond(`Lost reasons:\n${lines.join("\n")}`);
    }
  );

  // ── List Deal Phases ───────────────────────────────────────────────────
  server.tool(
    "teamleader_list_deal_phases",
    "List deal phases for a pipeline. Use the returned IDs with teamleader_move_deal or teamleader_create_deal.",
    {
      pipeline_id: z.string().optional().describe("Pipeline ID to filter phases (omit for all pipelines)"),
      ids: z.array(z.string()).optional().describe("Filter by specific phase IDs"),
    },
    async (params) => {
      const body: Record<string, unknown> = { page: { size: 100, number: 1 } };
      const filter: Record<string, unknown> = {};
      if (params.pipeline_id) filter.deal_pipeline_id = params.pipeline_id;
      if (params.ids) filter.ids = params.ids;
      if (Object.keys(filter).length > 0) body.filter = filter;

      const result = await client.request<TeamleaderListResponse<{ id: string; name: string; pipeline: { type: string; id: string } }>>({
        endpoint: "dealPhases.list",
        body,
      });

      const phases = result.data ?? [];
      if (phases.length === 0) return respond("No deal phases found.");

      const lines = phases.map((p, i) => `${i + 1}. ${p.name} — pipeline: ${p.pipeline?.id ?? "?"} (${p.id})`);
      return respond(`Deal phases:\n${lines.join("\n")}`);
    }
  );

  // ── List Deal Sources ──────────────────────────────────────────────────
  server.tool(
    "teamleader_list_deal_sources",
    "List available deal sources. Use the returned IDs when creating deals.",
    {},
    async () => {
      const result = await client.request<TeamleaderListResponse<{ id: string; name: string }>>({
        endpoint: "dealSources.list",
        body: { page: { size: 100, number: 1 } },
      });

      const sources = result.data ?? [];
      if (sources.length === 0) return respond("No deal sources found.");

      const lines = sources.map((s, i) => `${i + 1}. ${s.name} (${s.id})`);
      return respond(`Deal sources:\n${lines.join("\n")}`);
    }
  );

  // ── List Deal Pipelines ────────────────────────────────────────────────
  server.tool(
    "teamleader_list_deal_pipelines",
    "List all deal pipelines. Use the returned IDs with teamleader_list_deal_phases to see phases within a pipeline.",
    {
      ids: z.array(z.string()).optional().describe("Filter by specific pipeline IDs"),
      status: z.array(z.enum(["open", "pending_deletion"])).optional().describe("Filter by pipeline status"),
    },
    async (params) => {
      const body: Record<string, unknown> = { page: { size: 100, number: 1 } };
      const filter: Record<string, unknown> = {};
      if (params.ids) filter.ids = params.ids;
      if (params.status) filter.status = params.status;
      if (Object.keys(filter).length > 0) body.filter = filter;

      const result = await client.request<TeamleaderListResponse<{ id: string; name: string }>>({
        endpoint: "dealPipelines.list",
        body,
      });

      const pipelines = result.data ?? [];
      if (pipelines.length === 0) return respond("No deal pipelines found.");

      const lines = pipelines.map((p, i) => `${i + 1}. ${p.name} (${p.id})`);
      return respond(`Deal pipelines:\n${lines.join("\n")}`);
    }
  );

  // ── Create Deal Phase ──────────────────────────────────────────────────
  server.tool(
    "teamleader_create_deal_phase",
    "Create a new deal phase in a pipeline. Returns the new phase ID. Use teamleader_list_deal_pipelines to find the pipeline ID.",
    {
      name: z.string().describe("Phase name"),
      deal_pipeline_id: z.string().describe("Pipeline ID to add the phase to"),
      requires_attention_after_amount: z.number().describe("Amount of time after which a deal requires attention"),
      requires_attention_after_unit: z.enum(["days", "weeks"]).describe("Unit for requires_attention_after (days or weeks)"),
      estimated_probability: z.number().optional().describe("Estimated probability (0-1)"),
      follow_up_actions: z.array(z.enum(["create_event", "create_call", "create_task"])).optional().describe("Follow-up actions for this phase"),
    },
    async (params) => {
      const body: Record<string, unknown> = {
        name: params.name,
        deal_pipeline_id: params.deal_pipeline_id,
        requires_attention_after: {
          amount: params.requires_attention_after_amount,
          unit: params.requires_attention_after_unit,
        },
      };
      if (params.estimated_probability !== undefined) body.estimated_probability = params.estimated_probability;
      if (params.follow_up_actions) body.follow_up_actions = params.follow_up_actions;

      const result = await client.request<{ data: { id: string; type: string } }>({
        endpoint: "dealPhases.create",
        body,
      });

      return respond(`Deal phase created: ${result.data.id}`);
    }
  );

  // ── Update Deal Phase ──────────────────────────────────────────────────
  server.tool(
    "teamleader_update_deal_phase",
    "Update an existing deal phase. requires_attention_after is always required by the API.",
    {
      id: z.string().describe("The deal phase ID to update"),
      name: z.string().optional().describe("New phase name"),
      requires_attention_after_amount: z.number().describe("Amount of time after which a deal requires attention"),
      requires_attention_after_unit: z.enum(["days", "weeks"]).describe("Unit for requires_attention_after (days or weeks)"),
      estimated_probability: z.number().optional().describe("Estimated probability (0-1)"),
      follow_up_actions: z.array(z.enum(["create_event", "create_call", "create_task"])).optional().describe("Follow-up actions for this phase"),
    },
    async (params) => {
      const body: Record<string, unknown> = {
        id: params.id,
        requires_attention_after: {
          amount: params.requires_attention_after_amount,
          unit: params.requires_attention_after_unit,
        },
      };
      if (params.name) body.name = params.name;
      if (params.estimated_probability !== undefined) body.estimated_probability = params.estimated_probability;
      if (params.follow_up_actions) body.follow_up_actions = params.follow_up_actions;

      await client.request({ endpoint: "dealPhases.update", body });
      return respond(`Deal phase ${params.id} updated.`);
    }
  );

  // ── Delete Deal Phase ──────────────────────────────────────────────────
  server.tool(
    "teamleader_delete_deal_phase",
    "Delete a deal phase. Optionally migrate existing deals to another phase.",
    {
      id: z.string().describe("The deal phase ID to delete"),
      new_phase_id: z.string().optional().describe("Phase ID to migrate existing deals to (optional)"),
    },
    async (params) => {
      const body: Record<string, unknown> = { id: params.id };
      if (params.new_phase_id) body.new_phase_id = params.new_phase_id;

      await client.request({ endpoint: "dealPhases.delete", body });
      return respond(`Deal phase ${params.id} deleted.`);
    }
  );

  // ── Duplicate Deal Phase ───────────────────────────────────────────────
  server.tool(
    "teamleader_duplicate_deal_phase",
    "Create a new deal phase by duplicating an existing one. Returns the new phase ID.",
    {
      id: z.string().describe("Source deal phase ID to duplicate"),
    },
    async (params) => {
      const result = await client.request<{ data: { id: string; type: string } }>({
        endpoint: "dealPhases.duplicate",
        body: { id: params.id },
      });

      return respond(`Deal phase duplicated. New phase ID: ${result.data.id}`);
    }
  );

  // ── Move Deal Phase ────────────────────────────────────────────────────
  server.tool(
    "teamleader_move_deal_phase",
    "Move a deal phase to a new position in the pipeline (reorder). The phase is placed after the specified phase.",
    {
      id: z.string().describe("The deal phase ID to move"),
      after_phase_id: z.string().describe("The phase ID after which to place this phase"),
    },
    async (params) => {
      await client.request({
        endpoint: "dealPhases.move",
        body: { id: params.id, after_phase_id: params.after_phase_id },
      });
      return respond(`Deal phase ${params.id} moved after phase ${params.after_phase_id}.`);
    }
  );

  // ── Create Deal Pipeline ───────────────────────────────────────────────
  server.tool(
    "teamleader_create_deal_pipeline",
    "Create a new deal pipeline. Returns the new pipeline ID.",
    {
      name: z.string().describe("Pipeline name"),
    },
    async (params) => {
      const result = await client.request<{ data: { id: string; type: string } }>({
        endpoint: "dealPipelines.create",
        body: { name: params.name },
      });

      return respond(`Deal pipeline created: ${result.data.id}`);
    }
  );

  // ── Update Deal Pipeline ───────────────────────────────────────────────
  server.tool(
    "teamleader_update_deal_pipeline",
    "Update a deal pipeline name.",
    {
      id: z.string().describe("The deal pipeline ID to update"),
      name: z.string().describe("New pipeline name"),
    },
    async (params) => {
      await client.request({
        endpoint: "dealPipelines.update",
        body: { id: params.id, name: params.name },
      });
      return respond(`Deal pipeline ${params.id} updated.`);
    }
  );

  // ── Delete Deal Pipeline ───────────────────────────────────────────────
  server.tool(
    "teamleader_delete_deal_pipeline",
    "Delete a deal pipeline. Optionally migrate deals from old phases to new phases in another pipeline via migrate_phases array.",
    {
      id: z.string().describe("The deal pipeline ID to delete"),
      migrate_phases: z.array(z.object({
        old_phase_id: z.string().describe("Phase ID in the pipeline being deleted"),
        new_phase_id: z.string().describe("Phase ID in another pipeline to migrate deals to"),
      })).optional().describe("Array of phase migration mappings (old_phase_id -> new_phase_id)"),
    },
    async (params) => {
      const body: Record<string, unknown> = { id: params.id };
      if (params.migrate_phases) body.migrate_phases = params.migrate_phases;

      await client.request({ endpoint: "dealPipelines.delete", body });
      return respond(`Deal pipeline ${params.id} deleted.`);
    }
  );

  // ── Duplicate Deal Pipeline ────────────────────────────────────────────
  server.tool(
    "teamleader_duplicate_deal_pipeline",
    "Create a new deal pipeline by duplicating an existing one (including its phases). Returns the new pipeline ID.",
    {
      id: z.string().describe("Source deal pipeline ID to duplicate"),
    },
    async (params) => {
      const result = await client.request<{ data: { id: string; type: string } }>({
        endpoint: "dealPipelines.duplicate",
        body: { id: params.id },
      });

      return respond(`Deal pipeline duplicated. New pipeline ID: ${result.data.id}`);
    }
  );

  // ── Mark Deal Pipeline as Default ──────────────────────────────────────
  server.tool(
    "teamleader_mark_deal_pipeline_default",
    "Mark a deal pipeline as the default pipeline.",
    {
      id: z.string().describe("The deal pipeline ID to mark as default"),
    },
    async (params) => {
      await client.request({
        endpoint: "dealPipelines.markAsDefault",
        body: { id: params.id },
      });
      return respond(`Deal pipeline ${params.id} marked as default.`);
    }
  );
}
