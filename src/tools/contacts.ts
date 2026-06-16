/**
 * Teamleader Contacts Tools
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { TeamleaderClient } from "../api/client.js";
import type {
  Contact,
  TeamleaderListResponse,
  TeamleaderInfoResponse,
} from "../types/index.js";

// ── Body Builders (exported for testing) ─────────────────────────────────────

export interface ListContactsParams {
  page?: number;
  page_size?: number;
  term?: string;
  tags?: string[];
  ids?: string[];
  company_id?: string;
  status?: "active" | "deactivated";
  updated_since?: string;
}

export function buildListContactsBody(params: ListContactsParams): Record<string, unknown> {
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
  if (params.company_id) filter.company_id = params.company_id;
  if (params.status) filter.status = params.status;
  if (params.updated_since) filter.updated_since = params.updated_since;
  if (Object.keys(filter).length > 0) body.filter = filter;

  return body;
}

export interface CreateContactParams {
  first_name?: string;
  last_name: string;
  email?: string;
  phone?: string;
  mobile?: string;
  language?: string;
  gender?: string;
  salutation?: string;
  website?: string;
  remarks?: string;
  tags?: string[];
}

export function buildCreateContactBody(params: CreateContactParams): Record<string, unknown> {
  const body: Record<string, unknown> = {
    last_name: params.last_name,
  };

  if (params.first_name) body.first_name = params.first_name;
  if (params.email) {
    body.emails = [{ type: "primary", email: params.email }];
  }

  const telephones: { type: string; number: string }[] = [];
  if (params.phone) telephones.push({ type: "phone", number: params.phone });
  if (params.mobile) telephones.push({ type: "mobile", number: params.mobile });
  if (telephones.length > 0) body.telephones = telephones;

  if (params.language) body.language = params.language;
  if (params.gender) body.gender = params.gender;
  if (params.salutation) body.salutation = params.salutation;
  if (params.website) body.website = params.website;
  if (params.remarks) body.remarks = params.remarks;
  if (params.tags) body.tags = params.tags;

  return body;
}

export function registerContactTools(
  server: McpServer,
  client: TeamleaderClient
): void {
  // ── List Contacts ────────────────────────────────────────────────────────
  server.tool(
    "teamleader_list_contacts",
    "List contacts (people) from Teamleader Focus. Returns array with id, first_name, last_name, emails, tags. Use to find contact IDs. Next steps: teamleader_get_contact for full details, teamleader_link_contact_to_company to associate with a company. NOTE: `tags` filter uses AND logic — contacts must have ALL specified tags. List returns primary_address (flat), NOT full addresses[]. Use teamleader_get_contact for full details.",
    {
      page: z.number().optional().describe("Page number (default: 1)"),
      page_size: z.number().optional().describe("Page size (default: 20, max: 100)"),
      term: z.string().optional().describe("Search term to filter contacts"),
      tags: z.array(z.string()).optional().describe("Filter by tags"),
      ids: z.array(z.string()).optional().describe("Filter by specific contact IDs"),
      company_id: z.string().optional().describe("Filter by linked company ID"),
      status: z.enum(["active", "deactivated"]).optional().describe("Filter by status: 'active' or 'deactivated'"),
      updated_since: z
        .string()
        .optional()
        .describe("ISO 8601 date - only contacts updated after this date"),
    },
    async (params) => {
      const body = buildListContactsBody(params);

      const result = await client.request<TeamleaderListResponse<Contact>>({
        endpoint: "contacts.list",
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

  // ── Get Contact ──────────────────────────────────────────────────────────
  server.tool(
    "teamleader_get_contact",
    "Get full contact details including name, emails, phones, addresses, tags, linked companies, and custom fields. Next steps: teamleader_update_contact to edit, teamleader_link_contact_to_company to associate.",
    {
      id: z.string().describe("The contact ID"),
    },
    async (params) => {
      const result = await client.request<TeamleaderInfoResponse<Contact>>({
        endpoint: "contacts.info",
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

  // ── Create Contact ───────────────────────────────────────────────────────
  server.tool(
    "teamleader_create_contact",
    "Create a new contact (person). Returns {id, type}. Next step: teamleader_link_contact_to_company to associate with a company. NOTE: only `last_name` is required by the API — first_name is optional.",
    {
      first_name: z.string().optional().describe("First name"),
      last_name: z.string().describe("Last name"),
      email: z.string().optional().describe("Primary email address"),
      phone: z.string().optional().describe("Phone number"),
      mobile: z.string().optional().describe("Mobile number"),
      language: z.string().optional().describe("Language code (e.g. 'en', 'fr', 'nl')"),
      gender: z.enum(["male", "female", "non_binary", "prefers_not_to_say", "unknown"]).optional().describe("Gender"),
      salutation: z.string().optional().describe("Salutation (e.g. 'Mr', 'Mrs', 'Dr')"),
      website: z.string().optional().describe("Website URL"),
      remarks: z.string().optional().describe("Remarks (markdown supported)"),
      tags: z.array(z.string()).optional().describe("Tags to assign"),
    },
    async (params) => {
      const body = buildCreateContactBody(params);

      const result = await client.request<TeamleaderInfoResponse<{ id: string; type: string }>>({
        endpoint: "contacts.add",
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

  // ── Update Contact ───────────────────────────────────────────────────────
  server.tool(
    "teamleader_update_contact",
    "Update an existing contact. Only provided fields are changed. WARNING: the `tags` param OVERWRITES all existing tags — it is not additive. Use teamleader_tag_contact / teamleader_untag_contact for incremental changes.",
    {
      id: z.string().describe("The contact ID to update"),
      first_name: z.string().nullable().optional().describe("First name"),
      last_name: z.string().optional().describe("Last name"),
      email: z.string().optional().describe("Primary email address"),
      phone: z.string().optional().describe("Phone number"),
      mobile: z.string().optional().describe("Mobile number"),
      language: z.string().optional().describe("Language code"),
      gender: z.enum(["male", "female", "non_binary", "prefers_not_to_say", "unknown"]).optional().describe("Gender"),
      salutation: z.string().nullable().optional().describe("Salutation (e.g. 'Mr', 'Mrs', 'Dr')"),
      website: z.string().nullable().optional().describe("Website URL"),
      remarks: z.string().nullable().optional().describe("Remarks (markdown supported)"),
      tags: z.array(z.string()).optional().describe("Tags to assign"),
    },
    async (params) => {
      const body: Record<string, unknown> = { id: params.id };

      if (params.first_name) body.first_name = params.first_name;
      if (params.last_name) body.last_name = params.last_name;
      if (params.email) {
        body.emails = [{ type: "primary", email: params.email }];
      }

      const telephones: { type: string; number: string }[] = [];
      if (params.phone) telephones.push({ type: "phone", number: params.phone });
      if (params.mobile) telephones.push({ type: "mobile", number: params.mobile });
      if (telephones.length > 0) body.telephones = telephones;

      if (params.language) body.language = params.language;
      if (params.gender) body.gender = params.gender;
      if (params.salutation !== undefined) body.salutation = params.salutation;
      if (params.website !== undefined) body.website = params.website;
      if (params.remarks !== undefined) body.remarks = params.remarks;
      if (params.tags) body.tags = params.tags;

      await client.request({
        endpoint: "contacts.update",
        body,
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ success: true, message: `Contact ${params.id} updated` }),
          },
        ],
      };
    }
  );

  // ── Delete Contact ──────────────────────────────────────────────────────
  server.tool(
    "teamleader_delete_contact",
    "Delete a contact. This action is irreversible and removes all linked data.",
    {
      id: z.string().describe("The contact ID to delete"),
    },
    async (params) => {
      await client.request({
        endpoint: "contacts.delete",
        body: { id: params.id },
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ success: true, message: `Contact ${params.id} deleted` }),
          },
        ],
      };
    }
  );

  // ── Link Contact to Company ─────────────────────────────────────────────
  server.tool(
    "teamleader_link_contact_to_company",
    "Link a contact to a company. Optionally set their position and decision maker flag. A contact can be linked to multiple companies.",
    {
      id: z.string().describe("The contact ID"),
      company_id: z.string().describe("The company ID to link to"),
      position: z.string().optional().describe("Position/role at the company (e.g. 'CEO')"),
      decision_maker: z.boolean().optional().describe("Whether this contact is a decision maker"),
    },
    async (params) => {
      const body: Record<string, unknown> = {
        id: params.id,
        company_id: params.company_id,
      };
      if (params.position) body.position = params.position;
      if (params.decision_maker !== undefined) body.decision_maker = params.decision_maker;

      await client.request({
        endpoint: "contacts.linkToCompany",
        body,
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ success: true, message: `Contact ${params.id} linked to company ${params.company_id}` }),
          },
        ],
      };
    }
  );

  // ── Unlink Contact from Company ─────────────────────────────────────────
  server.tool(
    "teamleader_unlink_contact_from_company",
    "Remove the link between a contact and a company. Does not delete either entity.",
    {
      id: z.string().describe("The contact ID"),
      company_id: z.string().describe("The company ID to unlink from"),
    },
    async (params) => {
      await client.request({
        endpoint: "contacts.unlinkFromCompany",
        body: { id: params.id, company_id: params.company_id },
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ success: true, message: `Contact ${params.id} unlinked from company ${params.company_id}` }),
          },
        ],
      };
    }
  );

  // ── Update Contact-Company Link ─────────────────────────────────────────
  server.tool(
    "teamleader_update_contact_company_link",
    "Update the link between a contact and a company (position, decision maker)",
    {
      id: z.string().describe("The contact ID"),
      company_id: z.string().describe("The company ID"),
      position: z.string().optional().describe("Position/role at the company (e.g. 'CEO')"),
      decision_maker: z.boolean().optional().describe("Whether this contact is a decision maker"),
    },
    async (params) => {
      const body: Record<string, unknown> = {
        id: params.id,
        company_id: params.company_id,
      };
      if (params.position) body.position = params.position;
      if (params.decision_maker !== undefined) body.decision_maker = params.decision_maker;

      await client.request({
        endpoint: "contacts.updateCompanyLink",
        body,
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ success: true, message: `Contact-company link updated for ${params.id} ↔ ${params.company_id}` }),
          },
        ],
      };
    }
  );

  // ── Tag Contact ─────────────────────────────────────────────────────────
  server.tool(
    "teamleader_tag_contact",
    "Add one or more tags to a contact. Use teamleader_list_tags to see existing tags.",
    {
      id: z.string().describe("The contact ID"),
      tags: z.array(z.string()).describe("Tags to add (e.g. ['prospect', 'expo'])"),
    },
    async (params) => {
      await client.request({
        endpoint: "contacts.tag",
        body: { id: params.id, tags: params.tags },
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ success: true, message: `Tags added to contact ${params.id}: ${params.tags.join(", ")}` }),
          },
        ],
      };
    }
  );

  // ── Untag Contact ───────────────────────────────────────────────────────
  server.tool(
    "teamleader_untag_contact",
    "Remove one or more tags from a contact.",
    {
      id: z.string().describe("The contact ID"),
      tags: z.array(z.string()).describe("Tags to remove (e.g. ['prospect', 'expo'])"),
    },
    async (params) => {
      await client.request({
        endpoint: "contacts.untag",
        body: { id: params.id, tags: params.tags },
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ success: true, message: `Tags removed from contact ${params.id}: ${params.tags.join(", ")}` }),
          },
        ],
      };
    }
  );
}
