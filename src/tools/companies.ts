/**
 * Teamleader Companies Tools
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { TeamleaderClient } from "../api/client.js";
import type {
  Company,
  TeamleaderListResponse,
  TeamleaderInfoResponse,
} from "../types/index.js";

export function registerCompanyTools(
  server: McpServer,
  client: TeamleaderClient
): void {
  // ── List Companies ───────────────────────────────────────────────────────
  server.tool(
    "teamleader_list_companies",
    "List companies from Teamleader Focus. Returns array with id, name, emails, vat_number, tags. Use to find company IDs. Next steps: teamleader_get_company for full details, teamleader_list_projects_v2(company_id=...) to see projects, teamleader_list_deals to see deals.",
    {
      page: z.number().optional().describe("Page number (default: 1)"),
      page_size: z.number().optional().describe("Page size (default: 20, max: 100)"),
      term: z.string().optional().describe("Search term to filter companies"),
      tags: z.array(z.string()).optional().describe("Filter by tags"),
      ids: z.array(z.string()).optional().describe("Filter by specific company IDs"),
      status: z.enum(["active", "deactivated"]).optional().describe("Filter by status: 'active' or 'deactivated'"),
      vat_number: z.string().optional().describe("Filter by VAT number"),
      updated_since: z
        .string()
        .optional()
        .describe("ISO 8601 date - only companies updated after this date"),
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
      if (params.tags) filter.tags = params.tags;
      if (params.ids) filter.ids = params.ids;
      if (params.status) filter.status = params.status;
      if (params.vat_number) filter.vat_number = params.vat_number;
      if (params.updated_since) filter.updated_since = params.updated_since;
      if (Object.keys(filter).length > 0) body.filter = filter;

      const result = await client.request<TeamleaderListResponse<Company>>({
        endpoint: "companies.list",
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

  // ── Get Company ──────────────────────────────────────────────────────────
  server.tool(
    "teamleader_get_company",
    "Get full company details including name, emails, phones, addresses, VAT number, tags, and custom fields. Next steps: teamleader_list_projects_v2(company_id=...) for projects, teamleader_list_contacts to find linked people.",
    {
      id: z.string().describe("The company ID"),
    },
    async (params) => {
      const result = await client.request<TeamleaderInfoResponse<Company>>({
        endpoint: "companies.info",
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

  // ── Create Company ───────────────────────────────────────────────────────
  server.tool(
    "teamleader_create_company",
    "Create a new company. Returns {id, type}. Next steps: teamleader_link_contact_to_company to associate people, teamleader_create_project_v2 to create a project for this company. NOTE: Company telephones only support 'phone' and 'fax' types (no 'mobile').",
    {
      name: z.string().describe("Company name"),
      email: z.string().optional().describe("Primary email address"),
      phone: z.string().optional().describe("Phone number"),
      vat_number: z.string().optional().describe("VAT number"),
      website: z.string().optional().describe("Website URL"),
      language: z.string().optional().describe("Language code (e.g. 'en', 'fr', 'nl')"),
      remarks: z.string().optional().describe("Remarks (markdown supported)"),
      responsible_user_id: z.string().optional().describe("Responsible user ID"),
      tags: z.array(z.string()).optional().describe("Tags to assign"),
    },
    async (params) => {
      const body: Record<string, unknown> = {
        name: params.name,
      };

      if (params.email) {
        body.emails = [{ type: "primary", email: params.email }];
      }

      if (params.phone) {
        body.telephones = [{ type: "phone", number: params.phone }];
      }

      if (params.vat_number) body.vat_number = params.vat_number;
      if (params.website) body.website = params.website;
      if (params.language) body.language = params.language;
      if (params.remarks) body.remarks = params.remarks;
      if (params.responsible_user_id) body.responsible_user_id = params.responsible_user_id;
      if (params.tags) body.tags = params.tags;

      const result = await client.request<TeamleaderInfoResponse<{ id: string; type: string }>>({
        endpoint: "companies.add",
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

  // ── Update Company ──────────────────────────────────────────────────────
  server.tool(
    "teamleader_update_company",
    "Update an existing company. Only provided fields are changed. WARNING: the `tags` param OVERWRITES all existing tags — it is not additive. Use teamleader_tag_company / teamleader_untag_company for incremental changes.",
    {
      id: z.string().describe("The company ID to update"),
      name: z.string().optional().describe("Company name"),
      email: z.string().optional().describe("Primary email address"),
      phone: z.string().optional().describe("Phone number"),
      vat_number: z.string().optional().describe("VAT number"),
      website: z.string().optional().describe("Website URL"),
      language: z.string().optional().describe("Language code (e.g. 'en', 'fr', 'nl')"),
      remarks: z.string().nullable().optional().describe("Remarks (markdown supported)"),
      responsible_user_id: z.string().nullable().optional().describe("Responsible user ID"),
      tags: z.array(z.string()).optional().describe("Tags to assign"),
    },
    async (params) => {
      const body: Record<string, unknown> = { id: params.id };

      if (params.name) body.name = params.name;
      if (params.email) {
        body.emails = [{ type: "primary", email: params.email }];
      }
      if (params.phone) {
        body.telephones = [{ type: "phone", number: params.phone }];
      }
      if (params.vat_number) body.vat_number = params.vat_number;
      if (params.website) body.website = params.website;
      if (params.language) body.language = params.language;
      if (params.remarks !== undefined) body.remarks = params.remarks;
      if (params.responsible_user_id !== undefined) body.responsible_user_id = params.responsible_user_id;
      if (params.tags) body.tags = params.tags;

      await client.request({
        endpoint: "companies.update",
        body,
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ success: true, message: `Company ${params.id} updated` }),
          },
        ],
      };
    }
  );

  // ── Delete Company ──────────────────────────────────────────────────────
  server.tool(
    "teamleader_delete_company",
    "Delete a company from Teamleader Focus. This is irreversible.",
    {
      id: z.string().describe("The company ID to delete"),
    },
    async (params) => {
      await client.request({
        endpoint: "companies.delete",
        body: { id: params.id },
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ success: true, message: `Company ${params.id} deleted` }),
          },
        ],
      };
    }
  );

  // ── Tag Company ─────────────────────────────────────────────────────────
  server.tool(
    "teamleader_tag_company",
    "Add one or more tags to a company. Tags that don't exist yet will be created automatically.",
    {
      id: z.string().describe("The company ID to tag"),
      tags: z.array(z.string()).describe("Tags to add to the company"),
    },
    async (params) => {
      await client.request({
        endpoint: "companies.tag",
        body: { id: params.id, tags: params.tags },
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ success: true, message: `Tags added to company ${params.id}` }),
          },
        ],
      };
    }
  );

  // ── Untag Company ───────────────────────────────────────────────────────
  server.tool(
    "teamleader_untag_company",
    "Remove one or more tags from a company.",
    {
      id: z.string().describe("The company ID to untag"),
      tags: z.array(z.string()).describe("Tags to remove from the company"),
    },
    async (params) => {
      await client.request({
        endpoint: "companies.untag",
        body: { id: params.id, tags: params.tags },
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ success: true, message: `Tags removed from company ${params.id}` }),
          },
        ],
      };
    }
  );
}
