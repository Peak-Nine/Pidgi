/**
 * Teamleader Order Tools (read-only)
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { TeamleaderClient } from "../api/client.js";

function respond(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

export function registerOrderTools(
  server: McpServer,
  client: TeamleaderClient
): void {
  // ── List Orders ─────────────────────────────────────────────────────────
  server.tool(
    "teamleader_list_orders",
    "List orders (purchase orders) from Teamleader Focus. Returns array of orders with id, name, order_date, order_number, delivery_date, total, supplier, department, deal, project, assignee. Orders are read-only. Use filter.ids to fetch specific orders. Use includes=custom_fields for custom field data. Next steps: teamleader_get_order for full details with line items.",
    {
      ids: z.array(z.string()).optional().describe("Filter by specific order IDs"),
      includes: z.string().optional().describe("Comma-separated includes (e.g. 'custom_fields')"),
    },
    async (params) => {
      const body: Record<string, unknown> = {};

      const filter: Record<string, unknown> = {};
      if (params.ids) filter.ids = params.ids;
      if (Object.keys(filter).length > 0) body.filter = filter;

      if (params.includes) body.includes = params.includes;

      const result = await client.request<{ data: unknown[] }>({
        endpoint: "orders.list",
        body,
      });

      return respond(JSON.stringify(result, null, 2));
    }
  );

  // ── Get Order ───────────────────────────────────────────────────────────
  server.tool(
    "teamleader_get_order",
    "Get full details of a single order including grouped line items with products, quantities, unit prices, tax, discounts, totals, purchase prices. Also includes supplier, department, deal, project, assignee, payment terms, web URL. Use includes=custom_fields for custom field data.",
    {
      id: z.string().describe("The order ID"),
      includes: z.string().optional().describe("Comma-separated includes (e.g. 'custom_fields')"),
    },
    async (params) => {
      const body: Record<string, unknown> = { id: params.id };
      if (params.includes) body.includes = params.includes;

      const result = await client.request<{ data: unknown }>({
        endpoint: "orders.info",
        body,
      });

      return respond(JSON.stringify(result, null, 2));
    }
  );
}
