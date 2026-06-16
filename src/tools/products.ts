/**
 * Teamleader Product Tools — full CRUD for products
 *
 * Endpoints: products.list, products.info, products.add, products.update, products.delete
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { TeamleaderClient } from "../api/client.js";
import type { TeamleaderListResponse } from "../types/index.js";

function respond(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

export function registerProductTools(
  server: McpServer,
  client: TeamleaderClient
): void {
  // ── List Products ─────────────────────────────────────────────────────────
  server.tool(
    "teamleader_list_products",
    "List products from the product catalog. Returns IDs for use in invoice line items (product_id). Supports filtering by name/code, IDs, or updated_since.",
    {
      ids: z.array(z.string()).optional().describe("Filter by specific product IDs"),
      term: z.string().optional().describe("Search term to filter products by name or code"),
      updated_since: z.string().optional().describe("Only return products updated since this datetime (ISO 8601)"),
      page: z.number().optional().describe("Page number (default: 1)"),
      page_size: z.number().optional().describe("Page size (default: 20)"),
    },
    async (params) => {
      const body: Record<string, unknown> = {};
      const filter: Record<string, unknown> = {};

      if (params.ids) filter.ids = params.ids;
      if (params.term) filter.term = params.term;
      if (params.updated_since) filter.updated_since = params.updated_since;
      if (Object.keys(filter).length > 0) body.filter = filter;

      if (params.page || params.page_size) {
        body.page = { number: params.page ?? 1, size: params.page_size ?? 20 };
      }

      const result = await client.request<TeamleaderListResponse<{
        id: string;
        name: string | null;
        description?: string | null;
        code?: string | null;
        unit?: { type: string; id: string } | null;
        added_at?: string;
        updated_at?: string;
      }>>({
        endpoint: "products.list",
        body,
      });

      const lines = (result.data ?? []).map((p, i) => {
        let line = `${i + 1}. ${p.name ?? "(no name)"}`;
        if (p.code) line += ` [${p.code}]`;
        line += ` (${p.id})`;
        return line;
      });
      return respond(lines.length ? lines.join("\n") : "No products found.");
    }
  );

  // ── Get Product ───────────────────────────────────────────────────────────
  server.tool(
    "teamleader_get_product",
    "Get details for a single product by ID. Returns name, code, description, prices, unit, tax, category, stock info, custom fields, and optionally suppliers.",
    {
      id: z.string().describe("Product ID"),
      includes: z.string().optional().describe("Comma-separated list of optional includes (e.g. 'suppliers')"),
    },
    async (params) => {
      const body: Record<string, unknown> = { id: params.id };
      if (params.includes) body.includes = params.includes;

      const result = await client.request<{ data: Record<string, unknown> }>({
        endpoint: "products.info",
        body,
      });

      const p = result.data;
      const lines: string[] = [];
      lines.push(`Product: ${p.name ?? "(no name)"}`);
      if (p.code) lines.push(`Code: ${p.code}`);
      if (p.description) lines.push(`Description: ${p.description}`);

      const pp = p.purchase_price as { amount: number; currency: string } | null;
      if (pp) lines.push(`Purchase price: ${pp.amount} ${pp.currency}`);

      const sp = p.selling_price as { amount: number; currency: string } | null;
      if (sp) lines.push(`Selling price: ${sp.amount} ${sp.currency}`);

      const unit = p.unit as { type: string; id: string } | null;
      if (unit) lines.push(`Unit: ${unit.id} (${unit.type})`);

      const tax = p.tax as { type: string; id: string } | null;
      if (tax) lines.push(`Tax: ${tax.id} (${tax.type})`);

      const cat = p.product_category as { type: string; id: string } | null;
      if (cat) lines.push(`Category: ${cat.id} (${cat.type})`);

      const stock = p.stock as { amount: number | null } | undefined;
      if (stock) lines.push(`Stock: ${stock.amount ?? "not set"}`);

      if (p.added_at) lines.push(`Added: ${p.added_at}`);
      if (p.updated_at) lines.push(`Updated: ${p.updated_at}`);

      lines.push(`ID: ${p.id}`);

      return respond(lines.join("\n"));
    }
  );

  // ── Add Product ───────────────────────────────────────────────────────────
  server.tool(
    "teamleader_add_product",
    "Add a new product to the catalog. Requires either name or code (or both). Returns the new product ID.",
    {
      name: z.string().optional().describe("Product name (required if no code)"),
      code: z.string().optional().describe("Product code (required if no name)"),
      description: z.string().optional().describe("Product description (Markdown)"),
      purchase_price_amount: z.number().optional().describe("Purchase price amount"),
      purchase_price_currency: z.string().optional().describe("Purchase price currency (e.g. EUR)"),
      selling_price_amount: z.number().optional().describe("Selling price amount"),
      selling_price_currency: z.string().optional().describe("Selling price currency (e.g. EUR)"),
      unit_of_measure_id: z.string().optional().describe("Unit of measure ID. Use teamleader_list_units_of_measure to find valid IDs."),
      department_id: z.string().optional().describe("Department ID. Use teamleader_list_departments to find valid IDs."),
      product_category_id: z.string().optional().describe("Product category ID"),
      tax_rate_id: z.string().optional().describe("Tax rate ID. Use teamleader_list_tax_rates to find valid IDs."),
      stock_amount: z.number().optional().describe("Stock amount (requires stock management feature)"),
      configuration: z.object({
        stock_threshold: z.object({
          minimum: z.number().describe("Minimum stock threshold (cannot be negative)"),
          action: z.enum(["notify"]).describe("Action when threshold is reached"),
        }).nullable().describe("Stock threshold configuration"),
      }).optional().describe("Stock configuration (requires stock management feature)"),
      price_list_prices: z.array(z.object({
        price_list_id: z.string().describe("Price list ID. Use teamleader_list_price_lists to find valid IDs."),
        price: z.object({
          amount: z.number().describe("Price amount"),
          currency: z.string().describe("Currency code (e.g. EUR)"),
        }).describe("Price for this price list"),
      })).optional().describe("Price list prices"),
      custom_fields: z.array(z.object({
        id: z.string().describe("Custom field definition ID"),
        value: z.unknown().describe("Custom field value"),
      })).optional().describe("Custom field values"),
    },
    async (params) => {
      const body: Record<string, unknown> = {};

      if (params.name) body.name = params.name;
      if (params.code) body.code = params.code;
      if (params.description) body.description = params.description;

      if (params.purchase_price_amount != null && params.purchase_price_currency) {
        body.purchase_price = { amount: params.purchase_price_amount, currency: params.purchase_price_currency };
      }
      if (params.selling_price_amount != null && params.selling_price_currency) {
        body.selling_price = { amount: params.selling_price_amount, currency: params.selling_price_currency };
      }

      if (params.unit_of_measure_id) body.unit_of_measure_id = params.unit_of_measure_id;
      if (params.department_id) body.department_id = params.department_id;
      if (params.product_category_id) body.product_category_id = params.product_category_id;
      if (params.tax_rate_id) body.tax_rate_id = params.tax_rate_id;
      if (params.stock_amount != null) body.stock = { amount: params.stock_amount };
      if (params.configuration) body.configuration = params.configuration;
      if (params.price_list_prices) body.price_list_prices = params.price_list_prices;
      if (params.custom_fields) body.custom_fields = params.custom_fields;

      const result = await client.request<{ data: { type: string; id: string } }>({
        endpoint: "products.add",
        body,
      });

      return respond(`Product created: ${result.data.id}`);
    }
  );

  // ── Update Product ────────────────────────────────────────────────────────
  server.tool(
    "teamleader_update_product",
    "Update an existing product. Only provided fields are updated.",
    {
      id: z.string().describe("Product ID to update"),
      name: z.string().nullable().optional().describe("Product name (null to clear)"),
      code: z.string().nullable().optional().describe("Product code (null to clear)"),
      description: z.string().nullable().optional().describe("Product description in Markdown (null to clear)"),
      purchase_price_amount: z.number().optional().describe("Purchase price amount"),
      purchase_price_currency: z.string().optional().describe("Purchase price currency (e.g. EUR)"),
      selling_price_amount: z.number().optional().describe("Selling price amount"),
      selling_price_currency: z.string().optional().describe("Selling price currency (e.g. EUR)"),
      unit_of_measure_id: z.string().nullable().optional().describe("Unit of measure ID (null to clear). Use teamleader_list_units_of_measure to find valid IDs."),
      department_id: z.string().optional().describe("Department ID. Use teamleader_list_departments to find valid IDs."),
      product_category_id: z.string().optional().describe("Product category ID"),
      tax_rate_id: z.string().optional().describe("Tax rate ID. Use teamleader_list_tax_rates to find valid IDs."),
      stock_amount: z.number().optional().describe("Stock amount (requires stock management feature)"),
      configuration: z.object({
        stock_threshold: z.object({
          minimum: z.number().describe("Minimum stock threshold (cannot be negative)"),
          action: z.enum(["notify"]).describe("Action when threshold is reached"),
        }).nullable().describe("Stock threshold configuration"),
      }).optional().describe("Stock configuration (requires stock management feature)"),
      price_list_prices: z.array(z.object({
        price_list_id: z.string().describe("Price list ID. Use teamleader_list_price_lists to find valid IDs."),
        price: z.object({
          amount: z.number().describe("Price amount"),
          currency: z.string().describe("Currency code (e.g. EUR)"),
        }).describe("Price for this price list"),
      })).optional().describe("Price list prices"),
      custom_fields: z.array(z.object({
        id: z.string().describe("Custom field definition ID"),
        value: z.unknown().describe("Custom field value"),
      })).optional().describe("Custom field values"),
    },
    async (params) => {
      const body: Record<string, unknown> = { id: params.id };

      if (params.name !== undefined) body.name = params.name;
      if (params.code !== undefined) body.code = params.code;
      if (params.description !== undefined) body.description = params.description;

      if (params.purchase_price_amount != null && params.purchase_price_currency) {
        body.purchase_price = { amount: params.purchase_price_amount, currency: params.purchase_price_currency };
      }
      if (params.selling_price_amount != null && params.selling_price_currency) {
        body.selling_price = { amount: params.selling_price_amount, currency: params.selling_price_currency };
      }

      if (params.unit_of_measure_id !== undefined) body.unit_of_measure_id = params.unit_of_measure_id;
      if (params.department_id) body.department_id = params.department_id;
      if (params.product_category_id) body.product_category_id = params.product_category_id;
      if (params.tax_rate_id) body.tax_rate_id = params.tax_rate_id;
      if (params.stock_amount != null) body.stock = { amount: params.stock_amount };
      if (params.configuration) body.configuration = params.configuration;
      if (params.price_list_prices) body.price_list_prices = params.price_list_prices;
      if (params.custom_fields) body.custom_fields = params.custom_fields;

      await client.request({ endpoint: "products.update", body });
      return respond(`Product ${params.id} updated.`);
    }
  );

  // ── Delete Product ────────────────────────────────────────────────────────
  server.tool(
    "teamleader_delete_product",
    "Delete a product from the catalog.",
    {
      id: z.string().describe("Product ID to delete"),
    },
    async (params) => {
      await client.request({ endpoint: "products.delete", body: { id: params.id } });
      return respond(`Product ${params.id} deleted.`);
    }
  );
}
