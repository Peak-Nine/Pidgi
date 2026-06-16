/**
 * Teamleader Quotations Tools
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { TeamleaderClient } from "../api/client.js";

function respond(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

// Shared Zod schemas for grouped_lines (used in create + update)
const lineItemSchema = z.object({
  quantity: z.number().describe("Quantity"),
  description: z.string().describe("Line item description"),
  extended_description: z.string().optional().describe("Extended description (Markdown)"),
  unit_of_measure_id: z.string().nullable().optional().describe("Unit of measure ID. Use teamleader_list_units_of_measure to find valid IDs."),
  unit_price_amount: z.number().describe("Unit price amount (tax exclusive)"),
  tax_rate_id: z.string().describe("Tax rate ID. Use teamleader_list_tax_rates to find valid IDs."),
  discount_value: z.number().optional().describe("Discount value (0-100)"),
  discount_type: z.enum(["percentage"]).optional().describe("Discount type: 'percentage'"),
  product_id: z.string().optional().describe("Product ID (informational reference)"),
  purchase_price_amount: z.number().optional().describe("Purchase price amount"),
  purchase_price_currency: z.string().optional().describe("Purchase price currency code"),
  periodicity_unit: z.enum(["week", "month", "year"]).optional().describe("Periodicity unit"),
  periodicity_period: z.number().optional().describe("Periodicity period"),
});

const groupedLineSchema = z.object({
  section_title: z.string().optional().describe("Section title"),
  line_items: z.array(lineItemSchema).describe("Line items in this section"),
});

const discountSchema = z.object({
  type: z.enum(["percentage"]).describe("Discount type: 'percentage'"),
  value: z.number().describe("Discount value (0-100)"),
  description: z.string().optional().describe("Discount description"),
});

function buildGroupedLines(groups: z.infer<typeof groupedLineSchema>[]) {
  return groups.map((g) => ({
    ...(g.section_title !== undefined && { section: { title: g.section_title } }),
    line_items: g.line_items.map((item) => ({
      quantity: item.quantity,
      description: item.description,
      ...(item.extended_description && { extended_description: item.extended_description }),
      ...(item.unit_of_measure_id !== undefined && { unit_of_measure_id: item.unit_of_measure_id }),
      unit_price: {
        amount: item.unit_price_amount,
        tax: "excluding" as const,
      },
      tax_rate_id: item.tax_rate_id,
      ...(item.discount_value !== undefined &&
        item.discount_type && {
          discount: { value: item.discount_value, type: item.discount_type },
        }),
      ...(item.product_id && { product_id: item.product_id }),
      ...(item.purchase_price_amount !== undefined &&
        item.purchase_price_currency && {
          purchase_price: {
            amount: item.purchase_price_amount,
            currency: item.purchase_price_currency,
          },
        }),
      ...(item.periodicity_unit &&
        item.periodicity_period !== undefined && {
          periodicity: { unit: item.periodicity_unit, period: item.periodicity_period },
        }),
    })),
  }));
}

const recipientSchema = z.object({
  customer_type: z.enum(["contact", "company"]).optional().describe("Customer type"),
  customer_id: z.string().optional().describe("Customer ID"),
  email_address: z.string().describe("Email address"),
});

function buildRecipient(r: z.infer<typeof recipientSchema>) {
  return {
    ...(r.customer_type && r.customer_id
      ? { customer: { type: r.customer_type, id: r.customer_id } }
      : { customer: null }),
    email_address: r.email_address,
  };
}

export function registerQuotationTools(
  server: McpServer,
  client: TeamleaderClient
): void {
  // ── List Quotations ─────────────────────────────────────────────────────
  server.tool(
    "teamleader_list_quotations",
    "List quotations from Teamleader Focus. Returns array with id, deal, status (open/accepted/expired/rejected/closed), name, total, created_at, updated_at. Filter by IDs. Next steps: teamleader_get_quotation for full details with line items.",
    {
      ids: z.array(z.string()).optional().describe("Filter by specific quotation IDs"),
      page: z.number().optional().describe("Page number (default: 1)"),
      page_size: z.number().optional().describe("Page size (default: 20)"),
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
      if (Object.keys(filter).length > 0) body.filter = filter;

      const result = await client.request<{ data: unknown[] }>({
        endpoint: "quotations.list",
        body,
      });

      return respond(JSON.stringify(result, null, 2));
    }
  );

  // ── Get Quotation ───────────────────────────────────────────────────────
  server.tool(
    "teamleader_get_quotation",
    "Get full details of a quotation including deal, grouped line items, totals, discounts, status, currency, text, document_template. Next steps: teamleader_update_quotation, teamleader_accept_quotation, teamleader_send_quotation, teamleader_download_quotation.",
    {
      id: z.string().describe("The quotation ID"),
    },
    async (params) => {
      const result = await client.request<{ data: unknown }>({
        endpoint: "quotations.info",
        body: { id: params.id },
      });

      return respond(JSON.stringify(result, null, 2));
    }
  );

  // ── Create Quotation ────────────────────────────────────────────────────
  server.tool(
    "teamleader_create_quotation",
    "Create a new quotation for a deal in Teamleader Focus. Returns {id, type}. A quotation needs grouped_lines and/or text to be valid. Lookup IDs first: teamleader_list_tax_rates (tax_rate_id), teamleader_list_products (product_id). unit_price.tax is always 'excluding'.",
    {
      deal_id: z.string().describe("The deal ID this quotation belongs to"),
      grouped_lines: z.array(groupedLineSchema).optional().describe("Grouped line items with optional section titles"),
      text: z.string().optional().describe("Quotation text (Markdown). Needs grouped_lines and/or text to be valid"),
      currency_code: z.string().optional().describe("Currency code (e.g. 'EUR', 'USD')"),
      currency_exchange_rate: z.number().optional().describe("Exchange rate"),
      discounts: z.array(discountSchema).optional().describe("Quotation-level discounts"),
      document_template_id: z.string().optional().describe("Document template ID"),
      expiry_expires_after: z.string().optional().describe("Expiry date (YYYY-MM-DD). Only if user has access to quotation expiry"),
      expiry_action_after_expiry: z.enum(["lock", "none"]).optional().describe("Action after expiry: 'lock' or 'none'. Required when expiry_expires_after is set"),
    },
    async (params) => {
      const body: Record<string, unknown> = {
        deal_id: params.deal_id,
      };

      if (params.grouped_lines) {
        body.grouped_lines = buildGroupedLines(params.grouped_lines);
      }
      if (params.text !== undefined) body.text = params.text;

      if (params.currency_code) {
        body.currency = {
          code: params.currency_code,
          ...(params.currency_exchange_rate !== undefined && {
            exchange_rate: params.currency_exchange_rate,
          }),
        };
      }

      if (params.discounts) body.discounts = params.discounts;
      if (params.document_template_id) body.document_template_id = params.document_template_id;

      if (params.expiry_action_after_expiry) {
        body.expiry = {
          expires_after: params.expiry_expires_after ?? null,
          action_after_expiry: params.expiry_action_after_expiry,
        };
      }

      const result = await client.request<{ data: { id: string; type: string } }>({
        endpoint: "quotations.create",
        body,
      });

      return respond(JSON.stringify(result, null, 2));
    }
  );

  // ── Update Quotation ────────────────────────────────────────────────────
  server.tool(
    "teamleader_update_quotation",
    "Update an existing quotation. Only provided fields are updated. A quotation needs grouped_lines and/or text to be valid. Lookup IDs: teamleader_list_tax_rates (tax_rate_id), teamleader_list_products (product_id).",
    {
      id: z.string().describe("The quotation ID to update"),
      grouped_lines: z.array(groupedLineSchema).optional().describe("Replace all grouped line items"),
      text: z.string().nullable().optional().describe("Quotation text (Markdown). Set null to clear"),
      currency_code: z.string().optional().describe("Currency code (e.g. 'EUR', 'USD')"),
      currency_exchange_rate: z.number().optional().describe("Exchange rate"),
      discounts: z.array(discountSchema).optional().describe("Quotation-level discounts (replaces all)"),
      document_template_id: z.string().optional().describe("Document template ID"),
      expiry_expires_after: z.string().nullable().optional().describe("Expiry date (YYYY-MM-DD) or null to clear"),
      expiry_action_after_expiry: z.enum(["lock", "none"]).optional().describe("Action after expiry: 'lock' or 'none'. Required when setting expiry"),
    },
    async (params) => {
      const body: Record<string, unknown> = { id: params.id };

      if (params.grouped_lines) {
        body.grouped_lines = buildGroupedLines(params.grouped_lines);
      }
      if (params.text !== undefined) body.text = params.text;

      if (params.currency_code) {
        body.currency = {
          code: params.currency_code,
          ...(params.currency_exchange_rate !== undefined && {
            exchange_rate: params.currency_exchange_rate,
          }),
        };
      }

      if (params.discounts) body.discounts = params.discounts;
      if (params.document_template_id) body.document_template_id = params.document_template_id;

      if (params.expiry_action_after_expiry) {
        body.expiry = {
          expires_after: params.expiry_expires_after ?? null,
          action_after_expiry: params.expiry_action_after_expiry,
        };
      }

      await client.request<void>({ endpoint: "quotations.update", body });
      return respond(`Quotation ${params.id} updated.`);
    }
  );

  // ── Delete Quotation ────────────────────────────────────────────────────
  server.tool(
    "teamleader_delete_quotation",
    "Delete a quotation from Teamleader Focus. This action cannot be undone.",
    {
      id: z.string().describe("The quotation ID to delete"),
    },
    async (params) => {
      await client.request<void>({
        endpoint: "quotations.delete",
        body: { id: params.id },
      });
      return respond(`Quotation ${params.id} deleted.`);
    }
  );

  // ── Accept Quotation ────────────────────────────────────────────────────
  server.tool(
    "teamleader_accept_quotation",
    "Mark a quotation as accepted in Teamleader Focus.",
    {
      id: z.string().describe("The quotation ID to accept"),
    },
    async (params) => {
      await client.request<void>({
        endpoint: "quotations.accept",
        body: { id: params.id },
      });
      return respond(`Quotation ${params.id} accepted.`);
    }
  );

  // ── Send Quotation ──────────────────────────────────────────────────────
  server.tool(
    "teamleader_send_quotation",
    "Send one or more quotations via email. All quotations must belong to the same deal. Use #LINK in content to insert the CloudSign URL. Lookup IDs: teamleader_list_users (sender user ID), teamleader_list_departments (sender department ID).",
    {
      quotation_ids: z.array(z.string()).describe("Quotation IDs to send (must be from the same deal)"),
      from_sender_type: z.enum(["user", "department"]).describe("Sender type: 'user' or 'department'"),
      from_sender_id: z.string().describe("Sender ID (user or department)"),
      from_email_address: z.string().describe("Sender email address"),
      to: z.array(recipientSchema).describe("To recipients (email_address required, customer optional)"),
      cc: z.array(recipientSchema).optional().describe("CC recipients"),
      bcc: z.array(recipientSchema).optional().describe("BCC recipients"),
      subject: z.string().describe("Email subject"),
      content: z.string().describe("Email body. Use #LINK for CloudSign URL"),
      attachments: z.array(z.string()).optional().describe("Array of file IDs to attach"),
      language: z.string().describe("Language code (e.g. 'en', 'nl', 'fr', 'de')"),
    },
    async (params) => {
      const body: Record<string, unknown> = {
        quotations: params.quotation_ids,
        from: {
          sender: { type: params.from_sender_type, id: params.from_sender_id },
          email_address: params.from_email_address,
        },
        recipients: {
          to: params.to.map(buildRecipient),
          ...(params.cc && { cc: params.cc.map(buildRecipient) }),
          ...(params.bcc && { bcc: params.bcc.map(buildRecipient) }),
        },
        subject: params.subject,
        content: params.content,
        language: params.language,
      };

      if (params.attachments) body.attachments = params.attachments;

      await client.request<void>({ endpoint: "quotations.send", body });
      return respond(`Quotation(s) sent successfully.`);
    }
  );

  // ── Download Quotation ──────────────────────────────────────────────────
  server.tool(
    "teamleader_download_quotation",
    "Download a quotation as PDF. Returns a temporary download URL with expiration time.",
    {
      id: z.string().describe("The quotation ID to download"),
      format: z.enum(["pdf"]).optional().describe("Download format (default: 'pdf')"),
    },
    async (params) => {
      const result = await client.request<{
        data: { location: string; expires: string };
      }>({
        endpoint: "quotations.download",
        body: { id: params.id, format: params.format ?? "pdf" },
      });

      return respond(JSON.stringify(result, null, 2));
    }
  );
}
