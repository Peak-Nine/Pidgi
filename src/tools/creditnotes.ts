/**
 * Teamleader Credit Notes Tools
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { TeamleaderClient } from "../api/client.js";

function respond(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

export function registerCreditNoteTools(
  server: McpServer,
  client: TeamleaderClient
): void {
  // ── List Credit Notes ───────────────────────────────────────────────────
  server.tool(
    "teamleader_list_credit_notes",
    "List credit notes from Teamleader Focus. Returns array of credit notes with id, number, date, status, invoicee, total, paid status. Supports filtering by customer, department, invoice, project, date range. Next steps: teamleader_get_credit_note for full details, teamleader_download_credit_note for PDF/UBL.",
    {
      page: z.number().optional().describe("Page number (default: 1)"),
      page_size: z.number().optional().describe("Page size (default: 20)"),
      ids: z.array(z.string()).optional().describe("Filter by specific credit note IDs"),
      department_id: z.string().optional().describe("Filter by department ID. Use teamleader_list_departments to find valid IDs."),
      updated_since: z.string().optional().describe("ISO 8601 datetime - only credit notes updated after this"),
      invoice_id: z.string().optional().describe("Filter by related invoice ID"),
      project_id: z.string().optional().describe("Filter by project ID"),
      customer_type: z.enum(["contact", "company"]).optional().describe("Customer type (use with customer_id)"),
      customer_id: z.string().optional().describe("Customer ID (use with customer_type)"),
      credit_note_date_after: z.string().optional().describe("Filter credit notes dated after (YYYY-MM-DD, inclusive)"),
      credit_note_date_before: z.string().optional().describe("Filter credit notes dated before (YYYY-MM-DD, exclusive)"),
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
      if (params.department_id) filter.department_id = params.department_id;
      if (params.updated_since) filter.updated_since = params.updated_since;
      if (params.invoice_id) filter.invoice_id = params.invoice_id;
      if (params.project_id) filter.project_id = params.project_id;
      if (params.customer_type && params.customer_id) {
        filter.customer = { type: params.customer_type, id: params.customer_id };
      }
      if (params.credit_note_date_after) filter.credit_note_date_after = params.credit_note_date_after;
      if (params.credit_note_date_before) filter.credit_note_date_before = params.credit_note_date_before;
      if (Object.keys(filter).length > 0) body.filter = filter;

      const result = await client.request<{ data: unknown[] }>({
        endpoint: "creditNotes.list",
        body,
      });

      return respond(JSON.stringify(result, null, 2));
    }
  );

  // ── Get Credit Note ─────────────────────────────────────────────────────
  server.tool(
    "teamleader_get_credit_note",
    "Get full details of a credit note including line items, invoicee, totals, taxes, discounts, payment status, currency exchange rate, document template, and peppol status. Next steps: teamleader_download_credit_note for PDF/UBL, teamleader_send_credit_note_peppol to send via Peppol.",
    {
      id: z.string().describe("The credit note ID"),
    },
    async (params) => {
      const result = await client.request<{ data: unknown }>({
        endpoint: "creditNotes.info",
        body: { id: params.id },
      });

      return respond(JSON.stringify(result, null, 2));
    }
  );

  // ── Download Credit Note ────────────────────────────────────────────────
  server.tool(
    "teamleader_download_credit_note",
    "Get a temporary download URL for a credit note in PDF or UBL/e-FFF format. Returns a URL that expires after a short time.",
    {
      id: z.string().describe("The credit note ID to download"),
      format: z.enum(["pdf", "ubl/e-fff"]).describe("Download format: pdf or ubl/e-fff"),
    },
    async (params) => {
      const result = await client.request<{
        data: { location: string; expires: string };
      }>({
        endpoint: "creditNotes.download",
        body: { id: params.id, format: params.format },
      });

      return respond(
        `Download URL: ${result.data.location}\nExpires: ${result.data.expires}`
      );
    }
  );

  // ── Send Credit Note via Peppol ─────────────────────────────────────────
  server.tool(
    "teamleader_send_credit_note_peppol",
    "Send a credit note via the Peppol e-invoicing network. The credit note must be booked and the customer must have a valid Peppol identifier configured.",
    {
      id: z.string().describe("The credit note ID to send via Peppol"),
    },
    async (params) => {
      await client.request<void>({
        endpoint: "creditNotes.sendViaPeppol",
        body: { id: params.id },
      });

      return respond(`Credit note ${params.id} sent via Peppol.`);
    }
  );
}
