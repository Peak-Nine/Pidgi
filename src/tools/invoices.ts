/**
 * Teamleader Invoices Tools
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { TeamleaderClient } from "../api/client.js";
import type {
  Invoice,
  TeamleaderListResponse,
  TeamleaderInfoResponse,
} from "../types/index.js";

function respond(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

// ── Body Builders (exported for testing) ─────────────────────────────────────

export interface ListInvoicesParams {
  page?: number;
  page_size?: number;
  ids?: string[];
  term?: string;
  invoice_number?: string;
  customer_type?: "contact" | "company";
  customer_id?: string;
  department_id?: string;
  status?: string[];
  updated_since?: string;
  purchase_order_number?: string;
  payment_reference?: string;
  invoice_date_after?: string;
  invoice_date_before?: string;
  subscription_id?: string;
  deal_id?: string;
  project_id?: string;
  sort_field?: "invoice_number" | "invoice_date";
  sort_order?: "asc" | "desc";
  includes?: "late_fees";
}

export function buildListInvoicesBody(params: ListInvoicesParams): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  if (params.page || params.page_size) {
    body.page = {
      number: params.page ?? 1,
      size: params.page_size ?? 20,
    };
  }

  const filter: Record<string, unknown> = {};
  if (params.ids) filter.ids = params.ids;
  if (params.term) filter.term = params.term;
  if (params.invoice_number) filter.invoice_number = params.invoice_number;
  if (params.customer_type && params.customer_id) {
    filter.customer = { type: params.customer_type, id: params.customer_id };
  }
  if (params.department_id) filter.department_id = params.department_id;
  if (params.status) filter.status = params.status;
  if (params.updated_since) filter.updated_since = params.updated_since;
  if (params.purchase_order_number) filter.purchase_order_number = params.purchase_order_number;
  if (params.payment_reference) filter.payment_reference = params.payment_reference;
  if (params.invoice_date_after) filter.invoice_date_after = params.invoice_date_after;
  if (params.invoice_date_before) filter.invoice_date_before = params.invoice_date_before;
  if (params.subscription_id) filter.subscription_id = params.subscription_id;
  if (params.deal_id) filter.deal_id = params.deal_id;
  if (params.project_id) filter.project_id = params.project_id;
  if (Object.keys(filter).length > 0) body.filter = filter;

  if (params.sort_field || params.sort_order) {
    body.sort = [{ field: params.sort_field ?? "invoice_number", order: params.sort_order ?? "desc" }];
  }
  if (params.includes) body.includes = params.includes;

  return body;
}

export interface RegisterPaymentParams {
  id: string;
  amount: number;
  currency: string;
  paid_at: string;
  payment_method_id?: string;
}

export function buildRegisterPaymentBody(params: RegisterPaymentParams): Record<string, unknown> {
  const body: Record<string, unknown> = {
    id: params.id,
    payment: { amount: params.amount, currency: params.currency },
    paid_at: params.paid_at,
  };
  if (params.payment_method_id) body.payment_method_id = params.payment_method_id;
  return body;
}

export interface CreditPartiallyParams {
  id: string;
  credit_note_date?: string;
  line_items: Array<{
    quantity: number;
    description: string;
    unit_price_amount: number;
    tax_rate_id: string;
    extended_description?: string;
    product_id?: string;
    discount_value?: number;
  }>;
}

export interface UpdateInvoiceLineItem {
  quantity: number;
  description: string;
  unit_price_amount: number;
  tax_rate_id: string;
  product_id?: string;
  discount_value?: number;
}

export interface UpdateInvoiceParams {
  id: string;
  customer_type?: "contact" | "company";
  customer_id?: string;
  payment_term_type?: string;
  payment_term_days?: number;
  invoice_date?: string;
  note?: string;
  purchase_order_number?: string;
  project_id?: string;
  line_items?: UpdateInvoiceLineItem[];
}

export function buildUpdateInvoiceBody(params: UpdateInvoiceParams): Record<string, unknown> {
  const body: Record<string, unknown> = { id: params.id };

  if (params.customer_type && params.customer_id) {
    body.invoicee = {
      customer: { type: params.customer_type, id: params.customer_id },
    };
  }
  if (params.payment_term_type) {
    body.payment_term = {
      type: params.payment_term_type,
      ...(params.payment_term_days !== undefined && { days: params.payment_term_days }),
    };
  }
  if (params.invoice_date) body.invoice_date = params.invoice_date;
  if (params.note !== undefined) body.note = params.note;
  if (params.purchase_order_number) body.purchase_order_number = params.purchase_order_number;
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
          ...(item.discount_value !== undefined && {
            discount: { value: item.discount_value, type: "percentage" },
          }),
        })),
      },
    ];
  }
  return body;
}

export function buildCreditPartiallyBody(params: CreditPartiallyParams): Record<string, unknown> {
  const body: Record<string, unknown> = {
    id: params.id,
    grouped_lines: [
      {
        line_items: params.line_items.map((item) => ({
          quantity: item.quantity,
          description: item.description,
          unit_price: { amount: item.unit_price_amount, tax: "excluding" },
          tax_rate_id: item.tax_rate_id,
          ...(item.extended_description && { extended_description: item.extended_description }),
          ...(item.product_id && { product_id: item.product_id }),
          ...(item.discount_value !== undefined && {
            discount: { value: item.discount_value, type: "percentage" },
          }),
        })),
      },
    ],
  };
  if (params.credit_note_date) body.credit_note_date = params.credit_note_date;
  return body;
}

export function registerInvoiceTools(
  server: McpServer,
  client: TeamleaderClient
): void {
  // ── List Invoices ────────────────────────────────────────────────────────
  server.tool(
    "teamleader_list_invoices",
    "List invoices from Teamleader Focus. Returns array of invoices with id, number, status, invoicee, total, invoice_date. Supports filtering by customer, department, status, date range. Next steps: teamleader_get_invoice for details, teamleader_book_invoice to book drafts, teamleader_send_invoice to email. Valid statuses: 'draft' (not yet booked), 'outstanding' (booked/sent, unpaid), 'matched' (fully paid). 'paid' is NOT a valid status — use 'matched' instead.",
    {
      page: z.number().optional().describe("Page number (default: 1)"),
      page_size: z.number().optional().describe("Page size (default: 20, max: 100)"),
      ids: z.array(z.string()).optional().describe("Filter by specific invoice IDs"),
      term: z.string().optional().describe("Search term — filters on invoice number, purchase order number, payment reference, and invoicee name"),
      invoice_number: z.string().optional().describe("Filter by exact invoice number (e.g. '2017 / 5')"),
      customer_type: z.enum(["contact", "company"]).optional().describe("Filter by customer type (use with customer_id)"),
      customer_id: z.string().optional().describe("Filter by customer ID (company or contact ID)"),
      department_id: z.string().optional().describe("Filter by department ID (use teamleader_list_departments to find)"),
      status: z
        .array(z.string())
        .optional()
        .describe("Filter by status. Valid values: 'draft', 'outstanding', 'matched'. Do NOT use 'paid' or 'booked' — these are invalid and return 400."),
      updated_since: z
        .string()
        .optional()
        .describe("ISO 8601 date - only invoices updated after this date"),
      purchase_order_number: z.string().optional().describe("Filter by purchase order number (exact match)"),
      payment_reference: z.string().optional().describe("Filter by payment reference (exact match, e.g. '+++084/2613/66074+++')"),
      invoice_date_after: z
        .string()
        .optional()
        .describe("Filter invoices dated after (YYYY-MM-DD, inclusive)"),
      invoice_date_before: z
        .string()
        .optional()
        .describe("Filter invoices dated before (YYYY-MM-DD, inclusive)"),
      subscription_id: z.string().optional().describe("Filter by subscription ID"),
      deal_id: z.string().optional().describe("Filter by deal ID"),
      project_id: z.string().optional().describe("Filter by project ID"),
      sort_field: z.enum(["invoice_number", "invoice_date"]).optional().describe("Sort field (default: invoice_number)"),
      sort_order: z.enum(["asc", "desc"]).optional().describe("Sort order (default: desc)"),
      includes: z.literal("late_fees").optional().describe("Pass 'late_fees' to include totals.due_incasso_inclusive, totals.fixed_late_fee, and totals.interest in response"),
    },
    async (params) => {
      const body = buildListInvoicesBody(params);

      const result = await client.request<TeamleaderListResponse<Invoice>>({
        endpoint: "invoices.list",
        body,
      });

      return respond(JSON.stringify(result, null, 2));
    }
  );

  // ── Get Invoice ──────────────────────────────────────────────────────────
  server.tool(
    "teamleader_get_invoice",
    "Get full details of an invoice including line items, payment status, customer, totals, and payment term. Next steps: teamleader_book_invoice (if draft), teamleader_register_payment (if outstanding), teamleader_credit_invoice (to credit).",
    {
      id: z.string().describe("The invoice ID"),
      includes: z.literal("late_fees").optional().describe("Pass 'late_fees' to include late fee totals in response"),
    },
    async (params) => {
      const body: Record<string, unknown> = { id: params.id };
      if (params.includes) body.includes = params.includes;

      const result = await client.request<TeamleaderInfoResponse<Invoice>>({
        endpoint: "invoices.info",
        body,
      });

      return respond(JSON.stringify(result, null, 2));
    }
  );

  // ── Create Invoice (Draft) ───────────────────────────────────────────────
  server.tool(
    "teamleader_create_invoice",
    "Create a new draft invoice. Returns {id, type}. The invoice is created as draft — use teamleader_book_invoice to finalize and assign an invoice number. Lookup IDs first: teamleader_list_departments (department_id), teamleader_list_tax_rates (tax_rate_id), teamleader_list_payment_terms (payment_term types), teamleader_list_products (product_id).",
    {
      customer_type: z.enum(["contact", "company"]).describe("Customer type"),
      customer_id: z.string().describe("Customer ID"),
      department_id: z.string().describe("Department ID (use teamleader_list_departments to find)"),
      payment_term_type: z
        .string()
        .describe("Payment term type (use teamleader_list_payment_terms to find valid types: cash, end_of_month, after_invoice_date, etc.)"),
      payment_term_days: z
        .number()
        .optional()
        .describe("Number of days for payment term"),
      invoice_date: z
        .string()
        .optional()
        .describe("Invoice date (YYYY-MM-DD, defaults to today)"),
      purchase_order_number: z.string().optional().describe("Purchase order number"),
      project_id: z.string().optional().describe("Link to a project ID"),
      note: z.string().optional().describe("Note to include on the invoice"),
      line_items: z
        .array(
          z.object({
            quantity: z.number().describe("Quantity"),
            description: z.string().describe("Line item description"),
            unit_price_amount: z.number().describe("Unit price amount (tax exclusive)"),
            tax_rate_id: z.string().describe("Tax rate ID (use teamleader_list_tax_rates to find)"),
            product_id: z
              .string()
              .optional()
              .describe("Product ID (use teamleader_list_products to find)"),
          })
        )
        .describe("Line items for the invoice"),
    },
    async (params) => {
      const body: Record<string, unknown> = {
        invoicee: {
          customer: {
            type: params.customer_type,
            id: params.customer_id,
          },
        },
        department_id: params.department_id,
        payment_term: {
          type: params.payment_term_type,
          ...(params.payment_term_days !== undefined && {
            days: params.payment_term_days,
          }),
        },
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

      if (params.invoice_date) body.invoice_date = params.invoice_date;
      if (params.purchase_order_number) body.purchase_order_number = params.purchase_order_number;
      if (params.project_id) body.project_id = params.project_id;
      if (params.note) body.note = params.note;

      const result = await client.request<{ data: { id: string; type: string } }>({
        endpoint: "invoices.draft",
        body,
      });

      return respond(JSON.stringify(result, null, 2));
    }
  );

  // ── Book Invoice ─────────────────────────────────────────────────────────
  server.tool(
    "teamleader_book_invoice",
    "Book a draft invoice. Changes status from draft to outstanding and assigns an invoice number. Prerequisites: invoice must be in draft status. Next steps: teamleader_send_invoice to email it, or teamleader_register_payment when paid.",
    {
      id: z.string().describe("The invoice ID to book"),
      on: z.string().describe("Booking date (YYYY-MM-DD)"),
    },
    async (params) => {
      await client.request<void>({
        endpoint: "invoices.book",
        body: { id: params.id, on: params.on },
      });
      return respond(`Invoice ${params.id} booked on ${params.on}.`);
    }
  );

  // ── Send Invoice ─────────────────────────────────────────────────────────
  server.tool(
    "teamleader_send_invoice",
    "Send an invoice by email. Requires at least one recipient email address.",
    {
      id: z.string().describe("The invoice ID to send"),
      to: z
        .array(
          z.object({
            email: z.string().describe("Recipient email address"),
            customer_type: z
              .enum(["contact", "company"])
              .optional()
              .describe("Optional: link to contact or company"),
            customer_id: z
              .string()
              .optional()
              .describe("Optional: customer ID to link"),
          })
        )
        .describe("To recipients (at least one)"),
      subject: z.string().describe("Email subject"),
      body: z.string().describe("Email body (HTML supported)"),
      mail_template_id: z
        .string()
        .optional()
        .describe("Optional mail template ID (use teamleader_list_mail_templates to find)"),
      cc: z
        .array(
          z.object({
            email: z.string().describe("CC email address"),
            customer_type: z.enum(["contact", "company"]).optional().describe("Optional: customer type"),
            customer_id: z.string().optional().describe("Optional: customer ID"),
          })
        )
        .optional()
        .describe("Optional CC recipients"),
      bcc: z
        .array(
          z.object({
            email: z.string().describe("BCC email address"),
            customer_type: z.enum(["contact", "company"]).optional().describe("Optional: customer type"),
            customer_id: z.string().optional().describe("Optional: customer ID"),
          })
        )
        .optional()
        .describe("Optional BCC recipients"),
      attachments: z
        .array(z.string())
        .optional()
        .describe("Array of file IDs to attach (use teamleader_list_files to find)"),
    },
    async (params) => {
      const mapRecipients = (
        list: Array<{ email: string; customer_type?: string; customer_id?: string }>
      ) =>
        list.map((r) => ({
          email: r.email,
          ...(r.customer_type &&
            r.customer_id && {
              customer: { type: r.customer_type, id: r.customer_id },
            }),
        }));

      const body: Record<string, unknown> = {
        id: params.id,
        content: {
          subject: params.subject,
          body: params.body,
          ...(params.mail_template_id && { mail_template_id: params.mail_template_id }),
        },
        recipients: {
          to: mapRecipients(params.to),
          ...(params.cc && { cc: mapRecipients(params.cc) }),
          ...(params.bcc && { bcc: mapRecipients(params.bcc) }),
        },
        ...(params.attachments && { attachments: params.attachments }),
      };

      await client.request<void>({ endpoint: "invoices.send", body });
      return respond(`Invoice ${params.id} sent to ${params.to.map((r) => r.email).join(", ")}.`);
    }
  );

  // ── Send Invoice via Peppol ──────────────────────────────────────────────
  server.tool(
    "teamleader_send_invoice_peppol",
    "Send an invoice via the Peppol e-invoicing network. Prerequisites: invoice must be booked first (use teamleader_book_invoice). The customer must have a valid Peppol identifier configured.",
    {
      id: z.string().describe("The invoice ID to send via Peppol"),
    },
    async (params) => {
      await client.request<void>({
        endpoint: "invoices.sendViaPeppol",
        body: { id: params.id },
      });
      return respond(`Invoice ${params.id} sent via Peppol.`);
    }
  );

  // ── Delete Invoice ───────────────────────────────────────────────────────
  server.tool(
    "teamleader_delete_invoice",
    "Delete an invoice. Only draft invoices or the last booked invoice can be deleted.",
    {
      id: z.string().describe("The invoice ID to delete"),
    },
    async (params) => {
      await client.request<void>({
        endpoint: "invoices.delete",
        body: { id: params.id },
      });
      return respond(`Invoice ${params.id} deleted.`);
    }
  );

  // ── Shared line item schema for update tools ─────────────────────────────
  const updateLineItemSchema = z.object({
    quantity: z.number().describe("Quantity"),
    description: z.string().describe("Line item description"),
    unit_price_amount: z.number().describe("Unit price (tax exclusive)"),
    tax_rate_id: z.string().describe("Tax rate ID. Use teamleader_list_tax_rates to find valid IDs."),
    product_id: z.string().optional().describe("Product ID"),
    discount_value: z.number().min(0).max(100).optional().describe("Discount percentage (0-100)"),
  });

  // ── Update Invoice (Draft) ──────────────────────────────────────────────
  server.tool(
    "teamleader_update_invoice",
    "Update a draft invoice. All fields are optional — only provided fields are updated. For booked invoices use teamleader_update_booked_invoice instead. Lookup IDs: teamleader_list_tax_rates (tax_rate_id), teamleader_list_payment_terms (payment_term types), teamleader_list_products (product_id). Line items support optional discount_value (percentage, 0-100) — the full unit_price_amount is shown on the invoice with the discount applied separately.",
    {
      id: z.string().describe("The invoice ID to update"),
      customer_type: z.enum(["contact", "company"]).optional().describe("Customer type"),
      customer_id: z.string().optional().describe("Customer ID"),
      payment_term_type: z
        .string()
        .optional()
        .describe("Payment term type (cash, end_of_month, after_invoice_date)"),
      payment_term_days: z.number().optional().describe("Payment term days"),
      invoice_date: z.string().optional().describe("Invoice date (YYYY-MM-DD)"),
      note: z.string().optional().describe("Note on the invoice"),
      purchase_order_number: z.string().optional().describe("Purchase order number"),
      project_id: z.string().optional().describe("Link to a project ID"),
      line_items: z.array(updateLineItemSchema).optional().describe("Replace all line items (grouped_lines)"),
    },
    async (params) => {
      const body = buildUpdateInvoiceBody(params);
      await client.request<void>({ endpoint: "invoices.update", body });
      return respond(`Invoice ${params.id} updated.`);
    }
  );

  // ── Update Booked Invoice ───────────────────────────────────────────────
  server.tool(
    "teamleader_update_booked_invoice",
    "Update a booked invoice. Only limited fields can be changed on booked invoices (invoicee, payment term, invoice date, note, grouped lines, project).",
    {
      id: z.string().describe("The booked invoice ID to update"),
      customer_type: z.enum(["contact", "company"]).optional().describe("Customer type"),
      customer_id: z.string().optional().describe("Customer ID"),
      payment_term_type: z
        .string()
        .optional()
        .describe("Payment term type (cash, end_of_month, after_invoice_date)"),
      payment_term_days: z.number().optional().describe("Payment term days"),
      invoice_date: z.string().optional().describe("Invoice date (YYYY-MM-DD)"),
      note: z.string().optional().describe("Note on the invoice"),
      project_id: z.string().optional().describe("Link to a project ID"),
      line_items: z.array(updateLineItemSchema).optional().describe("Replace all line items (grouped_lines)"),
    },
    async (params) => {
      const body = buildUpdateInvoiceBody(params);
      await client.request<void>({ endpoint: "invoices.updateBooked", body });
      return respond(`Booked invoice ${params.id} updated.`);
    }
  );

  // ── Register Payment ─────────────────────────────────────────────────────
  server.tool(
    "teamleader_register_payment",
    "Register a payment for an invoice. Use teamleader_list_payment_methods to find valid payment method IDs. NOTE: the API field is 'paid_at' (NOT 'payment_date'). The payment structure is nested: {payment: {amount, currency}, paid_at}. This tool handles the structure — just pass flat params. ERROR: 422 on invoices.registerPayment → CAUSE: Using wrong field name 'payment_date' → FIX: Use 'paid_at' param — this tool maps it correctly.",
    {
      id: z.string().describe("The invoice ID"),
      amount: z.number().describe("Payment amount"),
      currency: z.string().describe("Currency code (e.g. 'EUR')"),
      paid_at: z.string().describe("Payment timestamp (ISO 8601, e.g. '2026-03-03T10:00:00+01:00')"),
      payment_method_id: z
        .string()
        .optional()
        .describe("Optional payment method ID (use teamleader_list_payment_methods to find)"),
    },
    async (params) => {
      const body = buildRegisterPaymentBody(params);

      await client.request<void>({ endpoint: "invoices.registerPayment", body });
      return respond(
        `Payment of ${params.amount} ${params.currency} registered for invoice ${params.id}.`
      );
    }
  );

  // ── Remove Payments ──────────────────────────────────────────────────────
  server.tool(
    "teamleader_remove_payments",
    "Remove all registered payments from an invoice. This reverts the invoice payment status. Use when a payment was registered incorrectly.",
    {
      id: z.string().describe("The invoice ID to remove payments from"),
    },
    async (params) => {
      await client.request<void>({
        endpoint: "invoices.removePayments",
        body: { id: params.id },
      });
      return respond(`All payments removed from invoice ${params.id}.`);
    }
  );

  // ── Copy Invoice ─────────────────────────────────────────────────────────
  server.tool(
    "teamleader_copy_invoice",
    "Copy an existing invoice to create a new draft invoice with the same details. Returns the new draft invoice ID. Next step: teamleader_update_invoice to modify, then teamleader_book_invoice to finalize.",
    {
      id: z.string().describe("The invoice ID to copy"),
    },
    async (params) => {
      const result = await client.request<{ data: { id: string; type: string } }>({
        endpoint: "invoices.copy",
        body: { id: params.id },
      });
      return respond(
        `Invoice copied. New draft invoice ID: ${result.data.id}`
      );
    }
  );

  // ── Credit Invoice (Full) ───────────────────────────────────────────────
  server.tool(
    "teamleader_credit_invoice",
    "Create a full credit note for a booked invoice. Credits all line items. Returns {id, type} of the credit note. For partial credits, use teamleader_credit_invoice_partially instead.",
    {
      id: z.string().describe("The invoice ID to credit"),
      credit_note_date: z
        .string()
        .optional()
        .describe("Credit note date (YYYY-MM-DD, defaults to today)"),
    },
    async (params) => {
      const body: Record<string, unknown> = { id: params.id };
      if (params.credit_note_date) body.credit_note_date = params.credit_note_date;

      const result = await client.request<{ data: { id: string; type: string } }>({
        endpoint: "invoices.credit",
        body,
      });
      return respond(
        `Credit note created. ID: ${result.data.id}`
      );
    }
  );

  // ── Credit Invoice Partially ────────────────────────────────────────────
  server.tool(
    "teamleader_credit_invoice_partially",
    "Create a partial credit note for a booked invoice. Specify which line items to credit. NOTE: the API uses unit_price.tax = 'excluding' (a string, NOT a currency field) — this tool handles that automatically. Returns {id, type} of the created credit note. ERROR: 400 on invoices.creditPartially → CAUSE: Wrong unit_price.tax value (e.g. currency instead of 'excluding') → FIX: This tool sets tax:'excluding' automatically — just provide unit_price_amount.",
    {
      id: z.string().describe("The invoice ID to partially credit"),
      credit_note_date: z
        .string()
        .optional()
        .describe("Credit note date (YYYY-MM-DD, defaults to today)"),
      line_items: z
        .array(
          z.object({
            quantity: z.number().describe("Quantity to credit"),
            description: z.string().describe("Line item description"),
            unit_price_amount: z.number().describe("Unit price amount (tax exclusive)"),
            tax_rate_id: z.string().describe("Tax rate ID (use teamleader_list_tax_rates to find)"),
            extended_description: z.string().optional().describe("Extended description"),
            product_id: z.string().optional().describe("Product ID"),
            discount_value: z.number().optional().describe("Discount percentage (0-100)"),
          })
        )
        .describe("Line items to include on the credit note"),
    },
    async (params) => {
      const body = buildCreditPartiallyBody(params);

      const result = await client.request<{ data: { id: string; type: string } }>({
        endpoint: "invoices.creditPartially",
        body,
      });
      return respond(
        `Partial credit note created. ID: ${result.data.id}`
      );
    }
  );

  // ── Download Invoice ─────────────────────────────────────────────────────
  server.tool(
    "teamleader_download_invoice",
    "Get a temporary download URL for an invoice in PDF or UBL format.",
    {
      id: z.string().describe("The invoice ID to download"),
      format: z
        .enum(["pdf", "ubl/e-fff", "ubl/peppol_bis_3"])
        .describe("Download format: pdf, ubl/e-fff, or ubl/peppol_bis_3"),
    },
    async (params) => {
      const result = await client.request<{
        data: { location: string; expires: string };
      }>({
        endpoint: "invoices.download",
        body: { id: params.id, format: params.format },
      });
      return respond(
        `Download URL: ${result.data.location}\nExpires: ${result.data.expires}`
      );
    }
  );

  // ── List Mail Templates ──────────────────────────────────────────────────
  server.tool(
    "teamleader_list_mail_templates",
    "List mail templates for invoices, quotations, work orders, or credit notes. Use to find template IDs for sending invoices.",
    {
      type: z
        .enum(["invoice", "quotation", "work_order", "credit_note"])
        .describe("Template type to list"),
      department_id: z
        .string()
        .optional()
        .describe("Optional: filter by department ID"),
    },
    async (params) => {
      const filter: Record<string, unknown> = { type: params.type };
      if (params.department_id) filter.department_id = params.department_id;

      const result = await client.request<{
        data: Array<{
          id: string;
          name: string;
          language: string;
          type: string;
          department: { id: string; type: string };
          content: { subject: string; body: string };
        }>;
      }>({
        endpoint: "mailTemplates.list",
        body: { filter },
      });

      const lines = result.data.map(
        (t, i) => `${i + 1}. ${t.name} (${t.language}) — ID: ${t.id}`
      );
      return respond(
        `Mail templates (${params.type}):\n${lines.join("\n")}`
      );
    }
  );

  // ── List Payment Methods ─────────────────────────────────────────────────
  server.tool(
    "teamleader_list_payment_methods",
    "List available payment methods. Use to find payment method IDs for registering invoice payments.",
    {
      status: z
        .array(z.enum(["active", "archived"]))
        .optional()
        .describe("Filter by status (default: all)"),
    },
    async (params) => {
      const body: Record<string, unknown> = {};
      if (params.status) body.filter = { status: params.status };

      const result = await client.request<{
        data: Array<{ id: string; name: string; status: string }>;
      }>({
        endpoint: "paymentMethods.list",
        body,
      });

      const lines = result.data.map(
        (m, i) => `${i + 1}. ${m.name} [${m.status}] — ID: ${m.id}`
      );
      return respond(
        `Payment methods:\n${lines.join("\n")}`
      );
    }
  );
}
