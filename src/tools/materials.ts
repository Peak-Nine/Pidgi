/**
 * Teamleader Materials Tools
 * Materials are non-human items used in projects (projects-v2).
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { TeamleaderClient } from "../api/client.js";

function respond(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

const moneySchema = z
  .object({
    amount: z.number().describe("Monetary amount"),
    currency: z.string().describe("Currency code (e.g. EUR)"),
  })
  .describe("Money object with amount and currency");

const assigneeSchema = z.object({
  type: z.enum(["team", "user"]).describe("Assignee type"),
  id: z.string().describe("Assignee ID"),
});

export function registerMaterialTools(
  server: McpServer,
  client: TeamleaderClient
): void {
  // ── List Materials ────────────────────────────────────────────────────
  server.tool(
    "teamleader_list_materials",
    "List materials in Teamleader Focus projects. Optionally filter by IDs. Returns title, status, billing info, quantities, and assignees.",
    {
      ids: z
        .array(z.string())
        .optional()
        .describe("Optional: filter by material IDs"),
    },
    async (params) => {
      const body: Record<string, unknown> = {};
      if (params.ids && params.ids.length > 0) {
        body.filter = { ids: params.ids };
      }

      const result = await client.request<{
        data: Array<{
          id: string;
          project: { type: string; id: string };
          group: { type: string; id: string } | null;
          title: string;
          status: string;
          billing_method: string;
          billing_status: string;
          quantity: number | null;
          quantity_estimated: number | null;
          unit_price: { amount: number; currency: string } | null;
          unit_cost: { amount: number; currency: string } | null;
          assignees: Array<{
            assignee: { type: string; id: string };
            assign_type: string;
          }>;
          start_date: string | null;
          end_date: string | null;
          product: { type: string; id: string } | null;
        }>;
      }>({
        endpoint: "projects-v2/materials.list",
        body,
      });

      if (!result.data || result.data.length === 0) {
        return respond("No materials found.");
      }

      const lines = result.data.map((m, i) => {
        const parts = [
          `${i + 1}. ${m.title} [${m.status}]`,
          `   ID: ${m.id}`,
          `   Project: ${m.project.id}`,
        ];
        if (m.group) parts.push(`   Group: ${m.group.id}`);
        parts.push(`   Billing: ${m.billing_method} (${m.billing_status})`);
        if (m.quantity != null) parts.push(`   Qty: ${m.quantity}`);
        if (m.quantity_estimated != null)
          parts.push(`   Qty estimated: ${m.quantity_estimated}`);
        if (m.unit_price)
          parts.push(
            `   Unit price: ${m.unit_price.amount} ${m.unit_price.currency}`
          );
        if (m.assignees.length > 0)
          parts.push(
            `   Assignees: ${m.assignees.map((a) => `${a.assignee.type}:${a.assignee.id}`).join(", ")}`
          );
        if (m.start_date) parts.push(`   Dates: ${m.start_date} → ${m.end_date ?? "?"}`);
        if (m.product) parts.push(`   Product: ${m.product.id}`);
        return parts.join("\n");
      });

      return respond(
        `${result.data.length} material(s):\n\n${lines.join("\n\n")}`
      );
    }
  );

  // ── Get Material ──────────────────────────────────────────────────────
  server.tool(
    "teamleader_get_material",
    "Get detailed information about a single material in Teamleader Focus. Returns all fields including pricing, budgets, margins, assignees, and dates.",
    {
      id: z.string().describe("The material ID"),
    },
    async (params) => {
      const result = await client.request<{
        data: {
          id: string;
          project: { type: string; id: string };
          group: { type: string; id: string } | null;
          title: string;
          description: string | null;
          status: string;
          billing_method: string;
          billing_status: string;
          quantity: number | null;
          quantity_estimated: number | null;
          unit_price: { amount: number; currency: string } | null;
          unit_cost: { amount: number; currency: string } | null;
          unit: { type: string; id: string } | null;
          amount_billed: { amount: number; currency: string } | null;
          external_budget: { amount: number; currency: string } | null;
          external_budget_spent: { amount: number; currency: string } | null;
          internal_budget: { amount: number; currency: string } | null;
          price: { amount: number; currency: string } | null;
          fixed_price: { amount: number; currency: string } | null;
          cost: { amount: number; currency: string } | null;
          margin: { amount: number; currency: string } | null;
          margin_percentage: number | null;
          assignees: Array<{
            assignee: { type: string; id: string };
            assign_type: string;
          }>;
          start_date: string | null;
          end_date: string | null;
          product: { type: string; id: string } | null;
        };
      }>({
        endpoint: "projects-v2/materials.info",
        body: { id: params.id },
      });

      const m = result.data;
      const fmt = (
        label: string,
        obj: { amount: number; currency: string } | null | undefined
      ) => (obj ? `${label}: ${obj.amount} ${obj.currency}` : null);

      const parts = [
        `Material: ${m.title}`,
        `ID: ${m.id}`,
        `Status: ${m.status}`,
        `Project: ${m.project.id}`,
        m.group ? `Group: ${m.group.id}` : null,
        m.description ? `Description: ${m.description}` : null,
        `Billing: ${m.billing_method} (${m.billing_status})`,
        m.quantity != null ? `Quantity: ${m.quantity}` : null,
        m.quantity_estimated != null
          ? `Quantity estimated: ${m.quantity_estimated}`
          : null,
        fmt("Unit price", m.unit_price),
        fmt("Unit cost", m.unit_cost),
        m.unit ? `Unit: ${m.unit.id}` : null,
        fmt("Amount billed", m.amount_billed),
        fmt("Fixed price", m.fixed_price),
        fmt("Price", m.price),
        fmt("Cost", m.cost),
        fmt("Margin", m.margin),
        m.margin_percentage != null
          ? `Margin %: ${m.margin_percentage}`
          : null,
        fmt("External budget", m.external_budget),
        fmt("External budget spent", m.external_budget_spent),
        fmt("Internal budget", m.internal_budget),
        m.start_date ? `Start: ${m.start_date}` : null,
        m.end_date ? `End: ${m.end_date}` : null,
        m.product ? `Product: ${m.product.id}` : null,
        m.assignees.length > 0
          ? `Assignees: ${m.assignees.map((a) => `${a.assignee.type}:${a.assignee.id}`).join(", ")}`
          : null,
      ];

      return respond(parts.filter(Boolean).join("\n"));
    }
  );

  // ── Create Material ───────────────────────────────────────────────────
  server.tool(
    "teamleader_create_material",
    "Create a new material in a Teamleader Focus project. Only project_id and title are required. Supports pricing, budgets, dates, assignees, and product linking.",
    {
      project_id: z.string().describe("Project ID to add the material to"),
      title: z.string().describe("Material title"),
      group_id: z
        .string()
        .optional()
        .describe("Optional: project group ID to place material in"),
      after_id: z
        .string()
        .nullable()
        .optional()
        .describe(
          "Optional: place after this material ID. null = top, omitted = bottom"
        ),
      description: z
        .string()
        .optional()
        .describe("Optional: material description"),
      billing_method: z
        .enum(["fixed_price", "unit_price", "non_billable"])
        .optional()
        .describe("Optional: billing method"),
      quantity: z.number().optional().describe("Optional: quantity"),
      quantity_estimated: z
        .number()
        .optional()
        .describe("Optional: estimated quantity"),
      unit_price: moneySchema
        .optional()
        .describe("Optional: unit price {amount, currency}"),
      unit_cost: moneySchema
        .optional()
        .describe("Optional: unit cost {amount, currency}"),
      unit_id: z.string().optional().describe("Optional: price unit ID"),
      fixed_price: moneySchema
        .optional()
        .describe("Optional: fixed price {amount, currency}"),
      external_budget: moneySchema
        .optional()
        .describe("Optional: external budget {amount, currency}"),
      internal_budget: moneySchema
        .optional()
        .describe("Optional: internal budget {amount, currency}"),
      start_date: z
        .string()
        .optional()
        .describe("Optional: start date (YYYY-MM-DD)"),
      end_date: z
        .string()
        .optional()
        .describe("Optional: end date (YYYY-MM-DD)"),
      product_id: z
        .string()
        .optional()
        .describe("Optional: link to a product ID"),
      assignees: z
        .array(assigneeSchema)
        .optional()
        .describe("Optional: assignees [{type, id}]"),
    },
    async (params) => {
      const body: Record<string, unknown> = {
        project_id: params.project_id,
        title: params.title,
      };

      if (params.group_id !== undefined) body.group_id = params.group_id;
      if (params.after_id !== undefined) body.after_id = params.after_id;
      if (params.description !== undefined)
        body.description = params.description;
      if (params.billing_method !== undefined)
        body.billing_method = params.billing_method;
      if (params.quantity !== undefined) body.quantity = params.quantity;
      if (params.quantity_estimated !== undefined)
        body.quantity_estimated = params.quantity_estimated;
      if (params.unit_price !== undefined) body.unit_price = params.unit_price;
      if (params.unit_cost !== undefined) body.unit_cost = params.unit_cost;
      if (params.unit_id !== undefined) body.unit_id = params.unit_id;
      if (params.fixed_price !== undefined)
        body.fixed_price = params.fixed_price;
      if (params.external_budget !== undefined)
        body.external_budget = params.external_budget;
      if (params.internal_budget !== undefined)
        body.internal_budget = params.internal_budget;
      if (params.start_date !== undefined) body.start_date = params.start_date;
      if (params.end_date !== undefined) body.end_date = params.end_date;
      if (params.product_id !== undefined) body.product_id = params.product_id;
      if (params.assignees !== undefined) body.assignees = params.assignees;

      const result = await client.request<{
        data: { id: string; type: string };
      }>({
        endpoint: "projects-v2/materials.create",
        body,
      });

      return respond(
        `Material "${params.title}" created (ID: ${result.data.id}).`
      );
    }
  );

  // ── Update Material ───────────────────────────────────────────────────
  server.tool(
    "teamleader_update_material",
    "Update an existing material in Teamleader Focus. Only id is required. All other fields are optional. Pass null to clear nullable fields.",
    {
      id: z.string().describe("The material ID to update"),
      title: z.string().optional().describe("Optional: new title"),
      description: z
        .string()
        .nullable()
        .optional()
        .describe("Optional: new description (null to clear)"),
      status: z
        .enum(["to_do", "in_progress", "on_hold", "done"])
        .optional()
        .describe("Optional: new status"),
      billing_method: z
        .enum(["fixed_price", "unit_price", "non_billable"])
        .optional()
        .describe("Optional: billing method"),
      quantity: z
        .number()
        .nullable()
        .optional()
        .describe("Optional: quantity (null to clear)"),
      quantity_estimated: z
        .number()
        .nullable()
        .optional()
        .describe("Optional: estimated quantity (null to clear)"),
      unit_price: moneySchema
        .nullable()
        .optional()
        .describe("Optional: unit price (null to clear)"),
      unit_cost: moneySchema
        .nullable()
        .optional()
        .describe("Optional: unit cost (null to clear)"),
      unit_id: z
        .string()
        .nullable()
        .optional()
        .describe("Optional: price unit ID (null to clear)"),
      fixed_price: moneySchema
        .nullable()
        .optional()
        .describe("Optional: fixed price (null to clear)"),
      external_budget: moneySchema
        .nullable()
        .optional()
        .describe("Optional: external budget (null to clear)"),
      internal_budget: moneySchema
        .nullable()
        .optional()
        .describe("Optional: internal budget (null to clear)"),
      start_date: z
        .string()
        .nullable()
        .optional()
        .describe("Optional: start date YYYY-MM-DD (null to clear)"),
      end_date: z
        .string()
        .nullable()
        .optional()
        .describe("Optional: end date YYYY-MM-DD (null to clear)"),
      product_id: z
        .string()
        .nullable()
        .optional()
        .describe("Optional: product ID (null to clear)"),
    },
    async (params) => {
      const body: Record<string, unknown> = { id: params.id };

      if (params.title !== undefined) body.title = params.title;
      if (params.description !== undefined)
        body.description = params.description;
      if (params.status !== undefined) body.status = params.status;
      if (params.billing_method !== undefined)
        body.billing_method = params.billing_method;
      if (params.quantity !== undefined) body.quantity = params.quantity;
      if (params.quantity_estimated !== undefined)
        body.quantity_estimated = params.quantity_estimated;
      if (params.unit_price !== undefined) body.unit_price = params.unit_price;
      if (params.unit_cost !== undefined) body.unit_cost = params.unit_cost;
      if (params.unit_id !== undefined) body.unit_id = params.unit_id;
      if (params.fixed_price !== undefined)
        body.fixed_price = params.fixed_price;
      if (params.external_budget !== undefined)
        body.external_budget = params.external_budget;
      if (params.internal_budget !== undefined)
        body.internal_budget = params.internal_budget;
      if (params.start_date !== undefined) body.start_date = params.start_date;
      if (params.end_date !== undefined) body.end_date = params.end_date;
      if (params.product_id !== undefined) body.product_id = params.product_id;

      await client.request({
        endpoint: "projects-v2/materials.update",
        body,
      });

      return respond(`Material ${params.id} updated.`);
    }
  );

  // ── Delete Material ───────────────────────────────────────────────────
  server.tool(
    "teamleader_delete_material",
    "Delete a material from a Teamleader Focus project.",
    {
      id: z.string().describe("The material ID to delete"),
    },
    async (params) => {
      await client.request({
        endpoint: "projects-v2/materials.delete",
        body: { id: params.id },
      });

      return respond(`Material ${params.id} deleted.`);
    }
  );

  // ── Assign Material ───────────────────────────────────────────────────
  server.tool(
    "teamleader_assign_material",
    "Assign a user or team to a material in Teamleader Focus.",
    {
      id: z.string().describe("The material ID"),
      assignee_type: z
        .enum(["team", "user"])
        .describe("Type of assignee"),
      assignee_id: z.string().describe("ID of the user or team to assign"),
    },
    async (params) => {
      await client.request({
        endpoint: "projects-v2/materials.assign",
        body: {
          id: params.id,
          assignee: {
            type: params.assignee_type,
            id: params.assignee_id,
          },
        },
      });

      return respond(
        `Assigned ${params.assignee_type} ${params.assignee_id} to material ${params.id}.`
      );
    }
  );

  // ── Unassign Material ─────────────────────────────────────────────────
  server.tool(
    "teamleader_unassign_material",
    "Unassign a user or team from a material in Teamleader Focus.",
    {
      id: z.string().describe("The material ID"),
      assignee_type: z
        .enum(["team", "user"])
        .describe("Type of assignee to remove"),
      assignee_id: z
        .string()
        .describe("ID of the user or team to unassign"),
    },
    async (params) => {
      await client.request({
        endpoint: "projects-v2/materials.unassign",
        body: {
          id: params.id,
          assignee: {
            type: params.assignee_type,
            id: params.assignee_id,
          },
        },
      });

      return respond(
        `Unassigned ${params.assignee_type} ${params.assignee_id} from material ${params.id}.`
      );
    }
  );

  // ── Duplicate Material ────────────────────────────────────────────────
  server.tool(
    "teamleader_duplicate_material",
    "Duplicate an existing material in Teamleader Focus. Creates a copy of the material with the same properties.",
    {
      origin_id: z
        .string()
        .describe("ID of the material to duplicate"),
    },
    async (params) => {
      const result = await client.request<{
        data: { id: string; type: string };
      }>({
        endpoint: "projects-v2/materials.duplicate",
        body: { origin_id: params.origin_id },
      });

      return respond(
        `Material duplicated. New material ID: ${result.data.id}.`
      );
    }
  );
}
