/**
 * Teamleader Subscriptions Tools
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { TeamleaderClient } from "../api/client.js";
import type {
  Subscription,
  TeamleaderListResponse,
  TeamleaderInfoResponse,
} from "../types/index.js";

function respond(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

// ── Body Builders (exported for testing) ─────────────────────────────────────

export interface ListSubscriptionsParams {
  page?: number;
  page_size?: number;
  ids?: string[];
  invoice_id?: string;
  deal_id?: string;
  department_id?: string;
  customer_type?: "contact" | "company";
  customer_id?: string;
  status?: Array<"active" | "deactivated">;
  sort_field?: "title" | "created_at" | "status";
  sort_order?: "asc" | "desc";
}

export function buildListSubscriptionsBody(params: ListSubscriptionsParams): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  if (params.page || params.page_size) {
    body.page = {
      number: params.page ?? 1,
      size: params.page_size ?? 20,
    };
  }

  const filter: Record<string, unknown> = {};
  if (params.ids) filter.ids = params.ids;
  if (params.invoice_id) filter.invoice_id = params.invoice_id;
  if (params.deal_id) filter.deal_id = params.deal_id;
  if (params.department_id) filter.department_id = params.department_id;
  if (params.customer_type && params.customer_id) {
    filter.customer = { type: params.customer_type, id: params.customer_id };
  }
  if (params.status) filter.status = params.status;
  if (Object.keys(filter).length > 0) body.filter = filter;

  if (params.sort_field) {
    body.sort = [{ field: params.sort_field, order: params.sort_order ?? "asc" }];
  }

  return body;
}

export function registerSubscriptionTools(
  server: McpServer,
  client: TeamleaderClient
): void {
  // ── List Subscriptions ───────────────────────────────────────────────────
  server.tool(
    "teamleader_list_subscriptions",
    "List subscriptions (recurring invoices) from Teamleader Focus. Returns array with id, title, status, invoicee, billing_cycle, next_renewal_date, total. billing_cycle = {periodicity: {unit: 'week'|'month'|'year', period: N}, days_in_advance: N}. Valid statuses: 'active', 'deactivated'. Sort by: title, created_at, status. Next steps: teamleader_get_subscription for full details.",
    {
      page: z.number().optional().describe("Page number (default: 1)"),
      page_size: z.number().optional().describe("Page size (default: 20)"),
      ids: z.array(z.string()).optional().describe("Filter by specific subscription IDs"),
      invoice_id: z.string().optional().describe("Find subscriptions that generated the given invoice ID"),
      deal_id: z.string().optional().describe("Filter on subscriptions created from a deal ID"),
      department_id: z.string().optional().describe("Filter by department ID. Use teamleader_list_departments to find valid IDs."),
      customer_type: z.enum(["contact", "company"]).optional().describe("Customer type for customer filter (must provide with customer_id)"),
      customer_id: z.string().optional().describe("Customer ID for customer filter (must provide with customer_type)"),
      status: z
        .array(z.enum(["active", "deactivated"]))
        .optional()
        .describe("Filter by status: 'active' or 'deactivated'"),
      sort_field: z.enum(["title", "created_at", "status"]).optional().describe("Sort field"),
      sort_order: z.enum(["asc", "desc"]).optional().describe("Sort order (default: asc)"),
    },
    async (params) => {
      const body = buildListSubscriptionsBody(params);

      const result = await client.request<TeamleaderListResponse<Subscription>>({
        endpoint: "subscriptions.list",
        body,
      });

      return respond(JSON.stringify(result, null, 2));
    }
  );

  // ── Get Subscription ─────────────────────────────────────────────────────
  server.tool(
    "teamleader_get_subscription",
    "Get full details of a subscription including invoicee, renewal period, line items, and next renewal date. Next steps: teamleader_update_subscription to modify, teamleader_deactivate_subscription to stop.",
    {
      id: z.string().describe("The subscription ID"),
    },
    async (params) => {
      const result = await client.request<TeamleaderInfoResponse<Subscription>>({
        endpoint: "subscriptions.info",
        body: { id: params.id },
      });

      return respond(JSON.stringify(result, null, 2));
    }
  );

  // ── Create Subscription ──────────────────────────────────────────────────
  server.tool(
    "teamleader_create_subscription",
    "Create a new subscription (recurring invoice) in Teamleader Focus. Returns {id, type}. billing_cycle uses unit ('week','month','year') + period (e.g. period=3,unit=month = quarterly). days_in_advance = how many days before renewal the invoice is created. Lookup IDs first: teamleader_list_departments (department_id), teamleader_list_tax_rates (tax_rate_id), teamleader_list_payment_terms (payment_term types). CRITICAL: `invoice_generation` is required — it controls what happens when a subscription generates an invoice (draft/book/book_and_send). `title` is also required. Line items use unit_price.tax = 'excluding' (NOT a currency field).",
    {
      customer_type: z.enum(["contact", "company"]).describe("Customer type"),
      customer_id: z.string().describe("Customer ID"),
      department_id: z.string().describe("Department ID (use teamleader_list_departments to find)"),
      starts_on: z.string().describe("Start date (YYYY-MM-DD)"),
      billing_unit: z
        .enum(["week", "month", "year"])
        .describe("Billing period unit: 'week', 'month', or 'year'"),
      billing_period: z
        .number()
        .describe("Number of units per billing cycle (e.g. 1 for monthly, 3 for quarterly, 1 for yearly)"),
      days_in_advance: z
        .number()
        .describe("Days before renewal date that the invoice is created (e.g. 28)"),
      payment_term_type: z
        .string()
        .describe("Payment term type (use teamleader_list_payment_terms to find valid types)"),
      payment_term_days: z.number().optional().describe("Days for payment term"),
      title: z.string().describe("Subscription title (required)"),
      invoice_generation_action: z
        .enum(["draft", "book", "book_and_send"])
        .describe("What happens when subscription generates an invoice: 'draft', 'book', or 'book_and_send'"),
      invoice_generation_send_mail_template_id: z
        .string()
        .optional()
        .describe("Mail template ID for sending — only used when invoice_generation_action = 'book_and_send'"),
      ends_on: z.string().optional().describe("End date (YYYY-MM-DD) — omit for indefinite"),
      note: z.string().optional().describe("Note on the subscription"),
      deal_id: z.string().optional().describe("Link to a deal ID"),
      project_id: z.string().optional().describe("Link to a project ID"),
      line_items: z
        .array(
          z.object({
            quantity: z.number().describe("Quantity"),
            description: z.string().describe("Line item description"),
            unit_price_amount: z.number().describe("Unit price (tax exclusive)"),
            tax_rate_id: z.string().describe("Tax rate ID (use teamleader_list_tax_rates to find)"),
            product_id: z.string().optional().describe("Product ID (optional)"),
          })
        )
        .describe("Line items for the subscription invoice"),
    },
    async (params) => {
      const invoiceGeneration: Record<string, unknown> = {
        action: params.invoice_generation_action,
      };
      if (params.invoice_generation_send_mail_template_id) {
        invoiceGeneration.send = { mail_template_id: params.invoice_generation_send_mail_template_id };
      }

      const body: Record<string, unknown> = {
        title: params.title,
        invoicee: {
          customer: {
            type: params.customer_type,
            id: params.customer_id,
          },
        },
        department_id: params.department_id,
        starts_on: params.starts_on,
        billing_cycle: {
          periodicity: {
            unit: params.billing_unit,
            period: params.billing_period,
          },
          days_in_advance: params.days_in_advance,
        },
        payment_term: {
          type: params.payment_term_type,
          ...(params.payment_term_days !== undefined && { days: params.payment_term_days }),
        },
        invoice_generation: invoiceGeneration,
        grouped_lines: [
          {
            line_items: params.line_items.map((item) => ({
              quantity: item.quantity,
              description: item.description,
              unit_price: {
                amount: item.unit_price_amount,
                tax: "excluding",
              },
              tax_rate_id: item.tax_rate_id,
              ...(item.product_id && { product_id: item.product_id }),
            })),
          },
        ],
      };

      if (params.ends_on) body.ends_on = params.ends_on;
      if (params.note) body.note = params.note;
      if (params.deal_id) body.deal_id = params.deal_id;
      if (params.project_id) body.project_id = params.project_id;

      const result = await client.request<{ data: { id: string; type: string } }>({
        endpoint: "subscriptions.create",
        body,
      });

      return respond(JSON.stringify(result, null, 2));
    }
  );

  // ── Update Subscription ──────────────────────────────────────────────────
  server.tool(
    "teamleader_update_subscription",
    "Update an existing subscription. Only provided fields are updated. Lookup IDs: teamleader_list_tax_rates (tax_rate_id), teamleader_list_payment_terms (payment_term types).",
    {
      id: z.string().describe("The subscription ID to update"),
      title: z.string().optional().describe("Subscription title"),
      customer_type: z.enum(["contact", "company"]).optional().describe("Customer type"),
      customer_id: z.string().optional().describe("Customer ID"),
      department_id: z.string().optional().describe("Department ID. Use teamleader_list_departments to find valid IDs."),
      starts_on: z.string().optional().describe("Start date (YYYY-MM-DD)"),
      ends_on: z.string().optional().describe("End date (YYYY-MM-DD)"),
      billing_unit: z
        .enum(["week", "month", "year"])
        .optional()
        .describe("Billing period unit: 'week', 'month', or 'year'"),
      billing_period: z.number().optional().describe("Number of units per billing cycle"),
      days_in_advance: z.number().optional().describe("Days in advance to create the invoice"),
      payment_term_type: z.string().optional().describe("Payment term type"),
      payment_term_days: z.number().optional().describe("Payment term days"),
      invoice_generation_action: z
        .enum(["draft", "book", "book_and_send"])
        .optional()
        .describe("What happens when subscription generates an invoice: 'draft', 'book', or 'book_and_send'"),
      note: z.string().optional().describe("Note on the subscription"),
      deal_id: z.string().optional().describe("Link to a deal ID"),
      project_id: z.string().optional().describe("Link to a project ID"),
      line_items: z
        .array(
          z.object({
            quantity: z.number().describe("Quantity"),
            description: z.string().describe("Line item description"),
            unit_price_amount: z.number().describe("Unit price (tax exclusive)"),
            tax_rate_id: z.string().describe("Tax rate ID. Use teamleader_list_tax_rates to find valid IDs."),
            product_id: z.string().optional().describe("Product ID"),
          })
        )
        .optional()
        .describe("Replace all line items"),
    },
    async (params) => {
      const body: Record<string, unknown> = { id: params.id };

      if (params.title) body.title = params.title;
      if (params.customer_type && params.customer_id) {
        body.invoicee = {
          customer: { type: params.customer_type, id: params.customer_id },
        };
      }
      if (params.starts_on) body.starts_on = params.starts_on;
      if (params.ends_on !== undefined) body.ends_on = params.ends_on;
      if (params.billing_unit || params.billing_period !== undefined || params.days_in_advance !== undefined) {
        body.billing_cycle = {
          ...(params.billing_unit && params.billing_period !== undefined && {
            periodicity: { unit: params.billing_unit, period: params.billing_period },
          }),
          ...(params.days_in_advance !== undefined && { days_in_advance: params.days_in_advance }),
        };
      }
      if (params.payment_term_type) {
        body.payment_term = {
          type: params.payment_term_type,
          ...(params.payment_term_days !== undefined && { days: params.payment_term_days }),
        };
      }
      if (params.department_id) body.department_id = params.department_id;
      if (params.invoice_generation_action) {
        body.invoice_generation = { action: params.invoice_generation_action };
      }
      if (params.note !== undefined) body.note = params.note || null;
      if (params.deal_id) body.deal_id = params.deal_id;
      if (params.project_id) body.project_id = params.project_id;
      if (params.line_items) {
        body.grouped_lines = [
          {
            line_items: params.line_items.map((item) => ({
              quantity: item.quantity,
              description: item.description,
              unit_price: { amount: item.unit_price_amount, tax: "excluding" },
              tax_rate_id: item.tax_rate_id,
              ...(item.product_id && { product_id: item.product_id }),
            })),
          },
        ];
      }

      await client.request<void>({ endpoint: "subscriptions.update", body });
      return respond(`Subscription ${params.id} updated.`);
    }
  );

  // ── Deactivate Subscription ──────────────────────────────────────────────
  server.tool(
    "teamleader_deactivate_subscription",
    "Deactivate an active subscription. This stops future invoice generation. The subscription remains visible with status 'deactivated'.",
    {
      id: z.string().describe("The subscription ID to deactivate"),
    },
    async (params) => {
      await client.request<void>({
        endpoint: "subscriptions.deactivate",
        body: { id: params.id },
      });
      return respond(`Subscription ${params.id} deactivated.`);
    }
  );
}
