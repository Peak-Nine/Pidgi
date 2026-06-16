/**
 * Teamleader Department Tools
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { TeamleaderClient } from "../api/client.js";
import type { TeamleaderListResponse, TeamleaderInfoResponse } from "../types/index.js";

interface Department {
  id: string;
  name: string;
  vat_number?: string;
  currency?: string;
  emails?: { type: string; email: string }[];
  status: string;
  address?: {
    line_1?: string | null;
    postal_code?: string | null;
    city?: string | null;
    country?: string;
    area_level_two?: { id: string; type: string } | null;
  };
  telephones?: { type: string; number: string }[];
  website?: string;
  iban?: string;
  bic?: string;
  fiscal_regime?: string | null;
}

export function registerDepartmentTools(
  server: McpServer,
  client: TeamleaderClient
): void {
  // ── List Departments ─────────────────────────────────────────────────────
  server.tool(
    "teamleader_list_departments",
    "List departments (legal entities / billing divisions). Returns id, name, status, VAT number, currency. Use the IDs when creating invoices (teamleader_create_invoice department_id) or filtering data. NOTE: Department IDs are needed for invoices (teamleader_create_invoice department_id param). Most accounts have very few departments.",
    {
      ids: z.array(z.string()).optional().describe("Filter by specific department IDs"),
      status: z
        .array(z.enum(["active", "archived"]))
        .optional()
        .describe("Filter by status (e.g. ['active'])"),
      sort_field: z
        .enum(["default_department", "name", "created_at"])
        .optional()
        .describe("Sort field"),
      sort_order: z
        .enum(["asc", "desc"])
        .optional()
        .describe("Sort order (default: asc)"),
    },
    async (params) => {
      const body: Record<string, unknown> = {};

      const filter: Record<string, unknown> = {};
      if (params.ids) filter.ids = params.ids;
      if (params.status) filter.status = params.status;
      if (Object.keys(filter).length > 0) body.filter = filter;

      if (params.sort_field) {
        body.sort = [
          {
            field: params.sort_field,
            order: params.sort_order ?? "asc",
          },
        ];
      }

      const result = await client.request<TeamleaderListResponse<Department>>({
        endpoint: "departments.list",
        body,
      });

      const departments = result.data ?? [];
      if (departments.length === 0) {
        return {
          content: [{ type: "text" as const, text: "No departments found." }],
        };
      }

      const lines = departments.map(
        (d, i) =>
          `${i + 1}. **${d.name}** (${d.status}) — VAT: ${d.vat_number ?? "n/a"}, Currency: ${d.currency ?? "n/a"}, ID: ${d.id}`
      );

      return {
        content: [
          {
            type: "text" as const,
            text: `Found ${departments.length} department(s):\n\n${lines.join("\n")}`,
          },
        ],
      };
    }
  );

  // ── Get Department ───────────────────────────────────────────────────────
  server.tool(
    "teamleader_get_department",
    "Get detailed information about a specific department, including address, emails, telephones, banking details, and fiscal regime.",
    {
      id: z.string().describe("The department ID"),
    },
    async (params) => {
      const result = await client.request<TeamleaderInfoResponse<Department>>({
        endpoint: "departments.info",
        body: { id: params.id },
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result.data, null, 2),
          },
        ],
      };
    }
  );
}
