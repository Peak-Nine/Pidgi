/**
 * Teamleader Users Tools
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { TeamleaderClient } from "../api/client.js";
import type {
  TeamleaderListResponse,
  TeamleaderInfoResponse,
} from "../types/index.js";

// User type based on Teamleader API response
interface User {
  id: string;
  account: { type: string; id: string };
  first_name: string;
  last_name: string;
  email: string;
  language?: string;
  telephones?: { type: string; number: string }[];
  function?: string;
  time_zone?: string;
  status?: string;
}

export function registerUserTools(
  server: McpServer,
  client: TeamleaderClient
): void {
  // ── List Users ───────────────────────────────────────────────────────────
  server.tool(
    "teamleader_list_users",
    "List all users (co-workers) in the Teamleader Focus account. Returns user ID, name, email, and status. Use this to find user IDs for assigning tasks or filtering. NOTE: For the current authenticated user, the system uses users.me internally. Most accounts have <50 users so pagination is rarely needed. Use `term` to search by name/email.",
    {
      page: z.number().optional().describe("Page number (default: 1)"),
      page_size: z.number().optional().describe("Page size (default: 20, max: 100)"),
      term: z.string().optional().describe("Search on first_name, last_name, email, function"),
      status: z.enum(["active", "deactivated"]).optional().describe("Filter by user status"),
      ids: z.array(z.string()).optional().describe("Filter by specific user IDs"),
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
      if (params.status) filter.status = params.status;
      if (params.ids) filter.ids = params.ids;
      if (Object.keys(filter).length > 0) body.filter = filter;

      const result = await client.request<TeamleaderListResponse<User>>({
        endpoint: "users.list",
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

  // ── Get User ─────────────────────────────────────────────────────────────
  server.tool(
    "teamleader_get_user",
    "Get detailed information about a specific user by ID. Returns name, email, language, function, time zone, and status.",
    {
      id: z.string().describe("The user ID"),
      includes: z.literal("external_rate").optional().describe("Pass 'external_rate' to include hourly rate in response"),
    },
    async (params) => {
      const body: Record<string, unknown> = { id: params.id };
      if (params.includes) body.includes = params.includes;

      const result = await client.request<TeamleaderInfoResponse<User>>({
        endpoint: "users.info",
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
}
