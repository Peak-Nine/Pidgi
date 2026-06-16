/**
 * Teamleader Projects-v2 Tools
 * 
 * Based on tailormade-eu/teamleader-focus-csv-importer C# implementation
 * Supports: Projects, ProjectGroups (Phases), and integration with Tasks
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { TeamleaderClient } from "../api/client.js";
import type {
  Project,
  ProjectGroup,
  ProjectLine,
  ProjectLineEntry,
  TeamleaderListResponse,
} from "../types/index.js";

export function registerProjectTools(
  server: McpServer,
  client: TeamleaderClient
): void {
  // ── List Projects (v2) ──────────────────────────────────────────────────
  server.tool(
    "teamleader_list_projects_v2",
    "List projects using projects-v2 API. Returns array of projects with id, title, status, customers, starts_on, due_on. Use to find project IDs for further operations. Next steps: teamleader_get_project_v2 for details, teamleader_list_project_groups for phases, teamleader_list_project_tasks_v2 for tasks.",
    {
      page: z.number().optional().describe("Page number (default: 1)"),
      page_size: z.number().optional().describe("Page size (default: 20, max: 100)"),
      term: z.string().optional().describe("Search term to filter projects"),
      status: z
        .enum(["open", "planned", "running", "overdue", "over_budget", "closed"])
        .optional()
        .describe("Filter by project status"),
      company_id: z
        .string()
        .optional()
        .describe("Filter by company (customer) ID"),
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
      if (params.company_id) {
        filter.customers = [
          { type: "company", id: params.company_id }
        ];
      }
      if (Object.keys(filter).length > 0) body.filter = filter;

      const result = await client.request<TeamleaderListResponse<Project>>({
        endpoint: "projects-v2/projects.list",
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

  // ── Get Project (v2) ─────────────────────────────────────────────────────
  server.tool(
    "teamleader_get_project_v2",
    "Get full details of a project including title, status, customers, owners, starts_on, due_on, description. Next steps: teamleader_list_project_groups for phases, teamleader_list_project_tasks_v2 for tasks, teamleader_add_project_customer to add customers.",
    {
      id: z.string().describe("Project ID"),
    },
    async (params) => {
      const result = await client.request<{ data: Project }>({
        endpoint: "projects-v2/projects.info",
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

  // ── Create Project (v2) ──────────────────────────────────────────────────
  server.tool(
    "teamleader_create_project_v2",
    "Create a new project. Returns {id, type}. NOTE: API uses 'start_date'/'end_date' (NOT 'starts_on'/'due_on'). To assign users, use teamleader_assign_project after creation. To add owners, use teamleader_add_project_owner. Next steps: teamleader_create_project_group to add phases, teamleader_create_project_task_v2 to add tasks, teamleader_assign_project to assign users/teams.",
    {
      title: z.string().describe("Project title"),
      description: z.string().optional().describe("Project description"),
      customer_type: z
        .enum(["company", "contact"])
        .describe("Customer type (company or contact)"),
      customer_id: z
        .string()
        .describe("Customer ID (company or contact)"),
      start_date: z
        .string()
        .optional()
        .describe("Project start date (YYYY-MM-DD)"),
      end_date: z
        .string()
        .optional()
        .describe("Project end date (YYYY-MM-DD)"),
    },
    async (params) => {
      const body: Record<string, unknown> = {
        title: params.title,
        customers: [
          {
            type: params.customer_type,
            id: params.customer_id,
          },
        ],
      };

      if (params.description) body.description = params.description;
      if (params.start_date) body.start_date = params.start_date;
      if (params.end_date) body.end_date = params.end_date;

      const result = await client.request<{ data: { id: string; type: string } }>({
        endpoint: "projects-v2/projects.create",
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

  // ── Update Project (v2) ──────────────────────────────────────────────────
  server.tool(
    "teamleader_update_project_v2",
    "Update an existing project. Only provided fields are changed. Returns {id, type}. NOTE: To change status, use teamleader_close_project_v2 or teamleader_reopen_project_v2.",
    {
      id: z.string().describe("Project ID"),
      title: z.string().optional().describe("New project title"),
      description: z.string().optional().describe("New description"),
      start_date: z.string().optional().describe("New start date (YYYY-MM-DD)"),
      end_date: z.string().optional().describe("New end date (YYYY-MM-DD)"),
    },
    async (params) => {
      const body: Record<string, unknown> = {
        id: params.id,
      };

      if (params.title) body.title = params.title;
      if (params.description) body.description = params.description;
      if (params.start_date) body.start_date = params.start_date;
      if (params.end_date) body.end_date = params.end_date;

      const result = await client.request<{ data: { id: string; type: string } }>({
        endpoint: "projects-v2/projects.update",
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

  // ── List Project Groups (Phases) ─────────────────────────────────────────
  server.tool(
    "teamleader_list_project_groups",
    "List project groups (phases) for a specific project. Returns IDs only — titles are NOT included. Internally uses projectLines.list with project_id at top level (NOT inside filter — API quirk). ERROR→CAUSE→FIX: If you need group titles, call teamleader_get_project_group per ID. For a full project tree with names and IDs, prefer teamleader_load_tasks. Next steps: teamleader_list_project_tasks_v2 with project_group_id to see tasks in a phase.",
    {
      project_id: z.string().describe("Project ID to list groups for"),
      page: z.number().optional().describe("Page number (default: 1)"),
      page_size: z.number().optional().describe("Page size (default: 20, max: 100)"),
    },
    async (params) => {
      const body: Record<string, unknown> = {
        project_id: params.project_id,
        filter: {
          types: ["nextgenProjectGroup"], // Only project groups (phases)
        },
      };

      if (params.page || params.page_size) {
        body.page = {
          number: params.page ?? 1,
          size: params.page_size ?? 20,
        };
      }

      const result = await client.request<TeamleaderListResponse<ProjectLineEntry>>({
        endpoint: "projects-v2/projectLines.list",
        body,
      });

      // Extract just the group IDs for a cleaner response
      const groups = result.data.map((entry) => ({
        id: entry.line.id,
        type: entry.line.type,
      }));

      const text =
        `Found ${groups.length} project group(s) (IDs only — call teamleader_get_project_group per ID for titles):\n` +
        groups.map((g, i) => `${i + 1}. ${g.id}`).join("\n");

      return {
        content: [{ type: "text" as const, text }],
      };
    }
  );

  // ── List Project Tasks (v2) ──────────────────────────────────────────────
  server.tool(
    "teamleader_list_project_tasks_v2",
    "List tasks for a project or project group (phase). Returns array with id, title, status, assignees, group, estimated_duration. NOTE: project_group_id and only_open are filtered client-side (API does not support these as server-side filters). For a full project tree with IDs, prefer teamleader_load_tasks.",
    {
      project_id: z.string().describe("Project ID to list tasks for"),
      project_group_id: z
        .string()
        .optional()
        .describe("Optional: filter tasks by group (phase) ID"),
      only_open: z
        .boolean()
        .default(true)
        .describe("Only return open tasks (to_do, in_progress, on_hold). Default: true"),
      page: z.number().optional().describe("Page number (default: 1)"),
      page_size: z.number().optional().describe("Page size (default: 20, max: 100)"),
    },
    async (params) => {
      const body: Record<string, unknown> = {
        project_id: params.project_id,
        filter: {
          types: ["nextgenTask"], // Only tasks, not groups/milestones
        },
      };

      if (params.page || params.page_size) {
        body.page = {
          number: params.page ?? 1,
          size: params.page_size ?? 20,
        };
      }

      const result = await client.request<TeamleaderListResponse<ProjectLine>>({
        endpoint: "projects-v2/projectLines.list",
        body,
      });

      // Client-side filtering for project_group_id and only_open
      // (API doesn't support these as server-side filters in projectLines.list)
      let filtered = result.data || [];

      if (params.project_group_id) {
        filtered = filtered.filter(
          (item) => item.project_group?.id === params.project_group_id
        );
      }

      if (params.only_open) {
        const openStatuses = new Set(["to_do", "in_progress", "on_hold"]);
        filtered = filtered.filter(
          (item) => item.status && openStatuses.has(item.status)
        );
      }

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ data: filtered, meta: result.meta }, null, 2),
          },
        ],
      };
    }
  );

  // ── Create Project Group (Phase) ─────────────────────────────────────────
  server.tool(
    "teamleader_create_project_group",
    "Create a new project group (phase) within a project. Returns {id, type}. Next step: teamleader_create_project_task_v2 to add tasks to this group. CRITICAL: the API uses 'start_date'/'end_date' (NOT 'starts_on'/'due_on') — this tool uses the correct field names.",
    {
      project_id: z.string().describe("Parent project ID"),
      title: z.string().describe("Group/phase title"),
      description: z.string().optional().describe("Group/phase description"),
      color: z.enum(["#00B2B2", "#008A8C", "#992600", "#ED9E00", "#D157D3", "#A400B2", "#0071F2", "#004DA6", "#64788F", "#C0C0C4", "#82828C", "#1A1C20"]).optional().describe("Group color"),
      billing_method: z.enum(["time_and_materials", "fixed_price", "parent_fixed_price", "non_billable"]).optional().describe("Billing method"),
      fixed_price_amount: z.number().optional().describe("Fixed price amount (requires billing_method=fixed_price)"),
      fixed_price_currency: z.string().optional().describe("Fixed price currency (e.g. EUR)"),
      external_budget_amount: z.number().optional().describe("External budget amount (requires billing_method=time_and_materials)"),
      external_budget_currency: z.string().optional().describe("External budget currency (e.g. EUR)"),
      internal_budget_amount: z.number().optional().describe("Internal/cost budget amount"),
      internal_budget_currency: z.string().optional().describe("Internal/cost budget currency (e.g. EUR)"),
      start_date: z.string().optional().describe("Start date (YYYY-MM-DD)"),
      end_date: z.string().optional().describe("End date (YYYY-MM-DD)"),
      assignee_id: z.string().optional().describe("Assignee user ID"),
      assignee_type: z.enum(["user", "team"]).default("user").optional().describe("Assignee type"),
    },
    async (params) => {
      const body: Record<string, unknown> = {
        project_id: params.project_id,
        title: params.title,
      };

      if (params.description) body.description = params.description;
      if (params.color) body.color = params.color;
      if (params.billing_method) body.billing_method = params.billing_method;
      if (params.fixed_price_amount != null) body.fixed_price = { amount: params.fixed_price_amount, currency: params.fixed_price_currency ?? "EUR" };
      if (params.external_budget_amount != null) body.external_budget = { amount: params.external_budget_amount, currency: params.external_budget_currency ?? "EUR" };
      if (params.internal_budget_amount != null) body.internal_budget = { amount: params.internal_budget_amount, currency: params.internal_budget_currency ?? "EUR" };
      if (params.start_date) body.start_date = params.start_date;
      if (params.end_date) body.end_date = params.end_date;
      if (params.assignee_id) body.assignees = [{ type: params.assignee_type ?? "user", id: params.assignee_id }];

      const result = await client.request<{ data: { id: string; type: string } }>({
        endpoint: "projects-v2/projectGroups.create",
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

  // ── Close Project (v2) ──────────────────────────────────────────────────
  server.tool(
    "teamleader_close_project_v2",
    "Close a project. CRITICAL: requires closing_strategy parameter — without it the API returns an error. Options: 'mark_tasks_and_materials_as_done' (marks all open tasks done) or 'none' (leaves tasks as-is). To reopen later: use teamleader_reopen_project_v2.",
    {
      id: z.string().describe("Project ID"),
      closing_strategy: z
        .enum(["mark_tasks_and_materials_as_done", "none"])
        .default("mark_tasks_and_materials_as_done")
        .describe("Strategy for open tasks: mark_tasks_and_materials_as_done or none"),
    },
    async (params) => {
      await client.request({
        endpoint: "projects-v2/projects.close",
        body: { id: params.id, closing_strategy: params.closing_strategy },
      });
      return {
        content: [{ type: "text" as const, text: `Project ${params.id} closed (strategy: ${params.closing_strategy}).` }],
      };
    }
  );

  // ── Reopen Project (v2) ────────────────────────────────────────────────
  server.tool(
    "teamleader_reopen_project_v2",
    "Reopen a previously closed project. Sets status back to active.",
    {
      id: z.string().describe("Project ID"),
    },
    async (params) => {
      await client.request({
        endpoint: "projects-v2/projects.reopen",
        body: { id: params.id },
      });
      return {
        content: [{ type: "text" as const, text: `Project ${params.id} reopened.` }],
      };
    }
  );

  // ── Delete Project (v2) ────────────────────────────────────────────────
  server.tool(
    "teamleader_delete_project_v2",
    "Delete a project. This action is irreversible. CRITICAL: requires delete_strategy — without it the API returns an error. Options: 'unlink_tasks_and_time_trackings' (keeps tasks/time), 'delete_tasks_and_time_trackings' (deletes all), 'delete_tasks_unlink_time_trackings'.",
    {
      id: z.string().describe("Project ID"),
      delete_strategy: z
        .enum(["unlink_tasks_and_time_trackings", "delete_tasks_and_time_trackings", "delete_tasks_unlink_time_trackings"])
        .default("unlink_tasks_and_time_trackings")
        .describe("Strategy: unlink_tasks_and_time_trackings, delete_tasks_and_time_trackings, or delete_tasks_unlink_time_trackings"),
    },
    async (params) => {
      await client.request({
        endpoint: "projects-v2/projects.delete",
        body: { id: params.id, delete_strategy: params.delete_strategy },
      });
      return {
        content: [{ type: "text" as const, text: `Project ${params.id} deleted (strategy: ${params.delete_strategy}).` }],
      };
    }
  );

  // ── Duplicate Project (v2) ─────────────────────────────────────────────
  server.tool(
    "teamleader_duplicate_project_v2",
    "Duplicate a project with a new title. Copies all groups, tasks, and structure. Returns {id, type} of the new project.",
    {
      id: z.string().describe("Source project ID to duplicate"),
      title: z.string().describe("Title for the duplicated project"),
    },
    async (params) => {
      const result = await client.request<{ data: { id: string; type: string } }>({
        endpoint: "projects-v2/projects.duplicate",
        body: { id: params.id, title: params.title },
      });
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // ── Add Customer to Project ────────────────────────────────────────────
  server.tool(
    "teamleader_add_project_customer",
    "Add a customer (company or contact) to a project. NOTE: the API uses a nested {type, id} object for the customer — this tool handles that automatically.",
    {
      id: z.string().describe("Project ID"),
      customer_type: z.enum(["company", "contact"]).describe("Customer type"),
      customer_id: z.string().describe("Customer ID"),
    },
    async (params) => {
      await client.request({
        endpoint: "projects-v2/projects.addCustomer",
        body: { id: params.id, customer: { type: params.customer_type, id: params.customer_id } },
      });
      return {
        content: [{ type: "text" as const, text: `Customer ${params.customer_id} added to project ${params.id}.` }],
      };
    }
  );

  // ── Remove Customer from Project ───────────────────────────────────────
  server.tool(
    "teamleader_remove_project_customer",
    "Remove a customer (company or contact) from a project.",
    {
      id: z.string().describe("Project ID"),
      customer_type: z.enum(["company", "contact"]).describe("Customer type"),
      customer_id: z.string().describe("Customer ID"),
    },
    async (params) => {
      await client.request({
        endpoint: "projects-v2/projects.removeCustomer",
        body: { id: params.id, customer: { type: params.customer_type, id: params.customer_id } },
      });
      return {
        content: [{ type: "text" as const, text: `Customer ${params.customer_id} removed from project ${params.id}.` }],
      };
    }
  );

  // ── Add Deal to Project ────────────────────────────────────────────────
  server.tool(
    "teamleader_add_project_deal",
    "Link a deal to a project. Use when a deal should be associated with project work. Returns success confirmation. Next steps: teamleader_get_project_v2 to verify, teamleader_remove_project_deal to unlink.",
    {
      id: z.string().describe("Project ID"),
      deal_id: z.string().describe("Deal ID to link"),
    },
    async (params) => {
      await client.request({
        endpoint: "projects-v2/projects.addDeal",
        body: { id: params.id, deal_id: params.deal_id },
      });
      return {
        content: [{ type: "text" as const, text: `Deal ${params.deal_id} linked to project ${params.id}.` }],
      };
    }
  );

  // ── Remove Deal from Project ───────────────────────────────────────────
  server.tool(
    "teamleader_remove_project_deal",
    "Remove a deal link from a project.",
    {
      id: z.string().describe("Project ID"),
      deal_id: z.string().describe("Deal ID to unlink"),
    },
    async (params) => {
      await client.request({
        endpoint: "projects-v2/projects.removeDeal",
        body: { id: params.id, deal_id: params.deal_id },
      });
      return {
        content: [{ type: "text" as const, text: `Deal ${params.deal_id} removed from project ${params.id}.` }],
      };
    }
  );

  // ── Add Owner to Project ───────────────────────────────────────────────
  server.tool(
    "teamleader_add_project_owner",
    "Add an owner (user) to a project. Use to grant ownership responsibility. Returns success confirmation. Next steps: teamleader_get_project_v2 to verify owners, teamleader_remove_project_owner to remove.",
    {
      id: z.string().describe("Project ID"),
      user_id: z.string().describe("User ID to add as owner"),
    },
    async (params) => {
      await client.request({
        endpoint: "projects-v2/projects.addOwner",
        body: { id: params.id, user_id: params.user_id },
      });
      return {
        content: [{ type: "text" as const, text: `User ${params.user_id} added as owner of project ${params.id}.` }],
      };
    }
  );

  // ── Remove Owner from Project ──────────────────────────────────────────
  server.tool(
    "teamleader_remove_project_owner",
    "Remove an owner (user) from a project.",
    {
      id: z.string().describe("Project ID"),
      user_id: z.string().describe("User ID to remove as owner"),
    },
    async (params) => {
      await client.request({
        endpoint: "projects-v2/projects.removeOwner",
        body: { id: params.id, user_id: params.user_id },
      });
      return {
        content: [{ type: "text" as const, text: `User ${params.user_id} removed as owner of project ${params.id}.` }],
      };
    }
  );

  // ── Assign User/Team to Project ────────────────────────────────────────
  server.tool(
    "teamleader_assign_project",
    "Assign a user or team to a project. NOTE: the API uses a nested {type, id} object for the assignee — this tool handles that automatically. Use teamleader_list_users or teamleader_list_teams to find IDs.",
    {
      id: z.string().describe("Project ID"),
      assignee_type: z.enum(["user", "team"]).default("user").describe("Assignee type: user or team"),
      assignee_id: z.string().describe("User or team ID to assign"),
    },
    async (params) => {
      await client.request({
        endpoint: "projects-v2/projects.assign",
        body: { id: params.id, assignee: { type: params.assignee_type, id: params.assignee_id } },
      });
      return {
        content: [{ type: "text" as const, text: `${params.assignee_type} ${params.assignee_id} assigned to project ${params.id}.` }],
      };
    }
  );

  // ── Unassign User/Team from Project ────────────────────────────────────
  server.tool(
    "teamleader_unassign_project",
    "Unassign a user or team from a project.",
    {
      id: z.string().describe("Project ID"),
      assignee_type: z.enum(["user", "team"]).default("user").describe("Assignee type: user or team"),
      assignee_id: z.string().describe("User or team ID to unassign"),
    },
    async (params) => {
      await client.request({
        endpoint: "projects-v2/projects.unassign",
        body: { id: params.id, assignee: { type: params.assignee_type, id: params.assignee_id } },
      });
      return {
        content: [{ type: "text" as const, text: `${params.assignee_type} ${params.assignee_id} unassigned from project ${params.id}.` }],
      };
    }
  );

  // ── Update Project Group (Phase) ───────────────────────────────────────
  server.tool(
    "teamleader_update_project_group",
    "Update a project group (phase). All fields except id are optional — providing null clears nullable fields. Returns success confirmation. Next steps: teamleader_get_project_group to verify changes, teamleader_list_project_groups to see all phases. CRITICAL: the API uses 'start_date'/'end_date' (NOT 'starts_on'/'due_on') — this tool uses the correct field names.",
    {
      id: z.string().describe("Project group ID"),
      title: z.string().optional().describe("New group title"),
      description: z.string().nullable().optional().describe("New description (null to clear)"),
      color: z.enum(["#00B2B2", "#008A8C", "#992600", "#ED9E00", "#D157D3", "#A400B2", "#0071F2", "#004DA6", "#64788F", "#C0C0C4", "#82828C", "#1A1C20"]).optional().describe("Group color"),
      billing_method_value: z.enum(["time_and_materials", "fixed_price", "parent_fixed_price", "non_billable"]).optional().describe("Billing method value"),
      billing_method_update_strategy: z.enum(["none", "cascade"]).default("none").optional().describe("Billing method update strategy: none or cascade to child items"),
      fixed_price_amount: z.number().optional().describe("Fixed price amount"),
      fixed_price_currency: z.string().optional().describe("Fixed price currency (e.g. EUR)"),
      external_budget_amount: z.number().optional().describe("External budget amount"),
      external_budget_currency: z.string().optional().describe("External budget currency (e.g. EUR)"),
      internal_budget_amount: z.number().optional().describe("Internal/cost budget amount"),
      internal_budget_currency: z.string().optional().describe("Internal/cost budget currency (e.g. EUR)"),
      start_date: z.string().nullable().optional().describe("Start date (YYYY-MM-DD) or null to clear"),
      end_date: z.string().nullable().optional().describe("End date (YYYY-MM-DD) or null to clear"),
    },
    async (params) => {
      const body: Record<string, unknown> = { id: params.id };
      if (params.title) body.title = params.title;
      if (params.description !== undefined) body.description = params.description;
      if (params.color) body.color = params.color;
      if (params.billing_method_value) body.billing_method = { value: params.billing_method_value, update_strategy: params.billing_method_update_strategy ?? "none" };
      if (params.fixed_price_amount != null) body.fixed_price = { amount: params.fixed_price_amount, currency: params.fixed_price_currency ?? "EUR" };
      if (params.external_budget_amount != null) body.external_budget = { amount: params.external_budget_amount, currency: params.external_budget_currency ?? "EUR" };
      if (params.internal_budget_amount != null) body.internal_budget = { amount: params.internal_budget_amount, currency: params.internal_budget_currency ?? "EUR" };
      if (params.start_date !== undefined) body.start_date = params.start_date;
      if (params.end_date !== undefined) body.end_date = params.end_date;

      await client.request({
        endpoint: "projects-v2/projectGroups.update",
        body,
      });
      return {
        content: [{ type: "text" as const, text: `Project group ${params.id} updated.` }],
      };
    }
  );

  // ── Complete Project Task (v2) ─────────────────────────────────────────
  server.tool(
    "teamleader_complete_project_task",
    "Mark a project task as complete (sets status to 'done'). Use teamleader_reopen_project_task to undo.",
    {
      id: z.string().describe("Project task ID"),
    },
    async (params) => {
      await client.request({
        endpoint: "projects-v2/tasks.complete",
        body: { id: params.id },
      });
      return {
        content: [{ type: "text" as const, text: `Project task ${params.id} completed.` }],
      };
    }
  );

  // ── Reopen Project Task (v2) ───────────────────────────────────────────
  server.tool(
    "teamleader_reopen_project_task",
    "Reopen a completed project task.",
    {
      id: z.string().describe("Project task ID"),
    },
    async (params) => {
      await client.request({
        endpoint: "projects-v2/tasks.reopen",
        body: { id: params.id },
      });
      return {
        content: [{ type: "text" as const, text: `Project task ${params.id} reopened.` }],
      };
    }
  );

  // ── Delete Project Task (v2) ───────────────────────────────────────────
  server.tool(
    "teamleader_delete_project_task",
    "Delete a project task. This action is irreversible. CRITICAL: requires delete_strategy — 'unlink_time_tracking' keeps time entries, 'delete_time_tracking' removes them.",
    {
      id: z.string().describe("Project task ID"),
      delete_strategy: z
        .enum(["unlink_time_tracking", "delete_time_tracking"])
        .default("unlink_time_tracking")
        .describe("What to do with linked time tracking entries: 'unlink_time_tracking' (default, keeps entries) or 'delete_time_tracking' (removes them)"),
    },
    async (params) => {
      await client.request({
        endpoint: "projects-v2/tasks.delete",
        body: { id: params.id, delete_strategy: params.delete_strategy },
      });
      return {
        content: [{ type: "text" as const, text: `Project task ${params.id} deleted.` }],
      };
    }
  );

  // ── Remove Task from Group ─────────────────────────────────────────────
  server.tool(
    "teamleader_remove_task_from_group",
    "Remove a task or material from the group it is currently in.",
    {
      line_id: z.string().describe("Task or material ID to remove from its group"),
    },
    async (params) => {
      await client.request({
        endpoint: "projects-v2/projectLines.removeFromGroup",
        body: { line_id: params.line_id },
      });
      return {
        content: [{ type: "text" as const, text: `Task/material ${params.line_id} removed from its group.` }],
      };
    }
  );

  // ── Create Project Task (v2) ─────────────────────────────────────────────
  server.tool(
    "teamleader_create_project_task_v2",
    "Create a new task within a project or project group (phase). Returns {id, type}. CRITICAL: API uses 'group_id' (NOT 'project_group_id') and 'assignees: [{type,id}]' array (NOT 'assignee_id') — this tool maps the params automatically. Lookup IDs: teamleader_list_work_types (work_type_id), teamleader_list_users (assignee_id). ERROR: Silent ignore on tasks.create → CAUSE: Using assignee_id directly instead of assignees array → FIX: Use assignee_id param — this tool maps to assignees:[{type,id}] automatically.",
    {
      project_id: z.string().describe("Parent project ID"),
      project_group_id: z.string().optional().describe("Optional: parent group (phase) ID. Mapped to API field 'group_id' automatically."),
      title: z.string().describe("Task title"),
      description: z.string().optional().describe("Task description"),
      assignee_id: z.string().optional().describe("Assignee user ID"),
      assignee_type: z.enum(["user", "team"]).default("user").optional().describe("Assignee type"),
      work_type_id: z.string().optional().describe("Work type ID (use teamleader_list_work_types to find)"),
      billing_method: z.enum(["user_rate", "work_type_rate", "custom_rate", "fixed_price", "parent_fixed_price", "non_billable"]).optional().describe("Billing method"),
      fixed_price_amount: z.number().optional().describe("Fixed price amount"),
      fixed_price_currency: z.string().optional().describe("Fixed price currency (e.g. EUR)"),
      external_budget_amount: z.number().optional().describe("External budget amount"),
      external_budget_currency: z.string().optional().describe("External budget currency (e.g. EUR)"),
      internal_budget_amount: z.number().optional().describe("Internal/cost budget amount"),
      internal_budget_currency: z.string().optional().describe("Internal/cost budget currency (e.g. EUR)"),
      custom_rate_amount: z.number().optional().describe("Custom rate amount (requires billing_method=custom_rate)"),
      custom_rate_currency: z.string().optional().describe("Custom rate currency (e.g. EUR)"),
      start_date: z.string().optional().describe("Start date (YYYY-MM-DD)"),
      end_date: z.string().optional().describe("End/due date (YYYY-MM-DD)"),
      time_estimated_value: z.number().optional().describe("Estimated time value (e.g. 480)"),
      time_estimated_unit: z.enum(["hours", "minutes", "seconds"]).default("minutes").optional().describe("Estimated time unit"),
    },
    async (params) => {
      const body: Record<string, unknown> = {
        project_id: params.project_id,
        title: params.title,
      };

      if (params.project_group_id) body.group_id = params.project_group_id;
      if (params.description) body.description = params.description;
      if (params.assignee_id) body.assignees = [{ type: params.assignee_type ?? "user", id: params.assignee_id }];
      if (params.work_type_id) body.work_type_id = params.work_type_id;
      if (params.billing_method) body.billing_method = params.billing_method;
      if (params.fixed_price_amount != null) body.fixed_price = { amount: params.fixed_price_amount, currency: params.fixed_price_currency ?? "EUR" };
      if (params.external_budget_amount != null) body.external_budget = { amount: params.external_budget_amount, currency: params.external_budget_currency ?? "EUR" };
      if (params.internal_budget_amount != null) body.internal_budget = { amount: params.internal_budget_amount, currency: params.internal_budget_currency ?? "EUR" };
      if (params.custom_rate_amount != null) body.custom_rate = { amount: params.custom_rate_amount, currency: params.custom_rate_currency ?? "EUR" };
      if (params.start_date) body.start_date = params.start_date;
      if (params.end_date) body.end_date = params.end_date;
      if (params.time_estimated_value != null) body.time_estimated = { value: params.time_estimated_value, unit: params.time_estimated_unit ?? "minutes" };

      const result = await client.request<{ data: { id: string; type: string } }>({
        endpoint: "projects-v2/tasks.create",
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

  // ── List Project Lines ──────────────────────────────────────────────────
  server.tool(
    "teamleader_list_project_lines",
    "List all project lines (tasks, materials, groups) for a project. Returns array of {line: {type, id}, group: {type, id} | null}. Use filter.types to restrict to specific line types. Use this to see which lines belong to which groups. WARNING: project_id must be top-level in the API body, NOT inside filter — this tool handles that automatically. NOTE: project_group_id is NOT a server-side filter — client-side filtering on group.id is applied after fetch.",
    {
      project_id: z.string().describe("Project ID"),
      types: z.array(z.enum(["nextgenTask", "nextgenMaterial", "nextgenProjectGroup"])).optional().describe("Filter by line types"),
      assignee_id: z.string().optional().describe("Filter by assignee ID"),
      assignee_type: z.enum(["user", "team"]).optional().describe("Assignee type (required if assignee_id is set)"),
    },
    async (params) => {
      const body: Record<string, unknown> = {
        project_id: params.project_id,
      };
      const filter: Record<string, unknown> = {};
      if (params.types) filter.types = params.types;
      if (params.assignee_id) filter.assignees = [{ type: params.assignee_type ?? "user", id: params.assignee_id }];
      if (Object.keys(filter).length > 0) body.filter = filter;

      const result = await client.request<TeamleaderListResponse<ProjectLine>>({
        endpoint: "projects-v2/projectLines.list",
        body,
      });
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // ── Add Project Line to Group ───────────────────────────────────────────
  server.tool(
    "teamleader_add_project_line_to_group",
    "Move a task or material to a different project group. CRITICAL: line_id MUST be a nextgenTask ID from teamleader_load_tasks (task_selection=N). Do NOT use IDs from get_task — those are todo IDs and will return 404. Group IDs not in YAML cache — use teamleader_list_project_groups + teamleader_get_project_group to find group ID by name.",
    {
      line_id: z.string().describe("Task or material ID to add to the group"),
      group_id: z.string().describe("Target group ID"),
    },
    async (params) => {
      await client.request({
        endpoint: "projects-v2/projectLines.addToGroup",
        body: { line_id: params.line_id, group_id: params.group_id },
      });
      return {
        content: [{ type: "text" as const, text: `Line ${params.line_id} added to group ${params.group_id}.` }],
      };
    }
  );

  // ── Get Project Group (Info) ────────────────────────────────────────────
  server.tool(
    "teamleader_get_project_group",
    "Get full details of a project group (phase) including title, description, color, billing, assignees, start/end dates, time estimated/tracked, budgets, margins.",
    {
      id: z.string().describe("Project group ID"),
    },
    async (params) => {
      const result = await client.request<{ data: ProjectGroup }>({
        endpoint: "projects-v2/projectGroups.info",
        body: { id: params.id },
      });
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // ── Assign User/Team to Project Group ───────────────────────────────────
  server.tool(
    "teamleader_assign_project_group",
    "Assign a user or team to a project group (phase). Use to set responsibility for a phase. Returns success confirmation. Next steps: teamleader_get_project_group to verify assignees, teamleader_unassign_project_group to remove.",
    {
      id: z.string().describe("Project group ID"),
      assignee_type: z.enum(["user", "team"]).default("user").describe("Assignee type"),
      assignee_id: z.string().describe("User or team ID to assign"),
    },
    async (params) => {
      await client.request({
        endpoint: "projects-v2/projectGroups.assign",
        body: { id: params.id, assignee: { type: params.assignee_type, id: params.assignee_id } },
      });
      return {
        content: [{ type: "text" as const, text: `${params.assignee_type} ${params.assignee_id} assigned to group ${params.id}.` }],
      };
    }
  );

  // ── Unassign User/Team from Project Group ───────────────────────────────
  server.tool(
    "teamleader_unassign_project_group",
    "Unassign a user or team from a project group (phase).",
    {
      id: z.string().describe("Project group ID"),
      assignee_type: z.enum(["user", "team"]).default("user").describe("Assignee type"),
      assignee_id: z.string().describe("User or team ID to unassign"),
    },
    async (params) => {
      await client.request({
        endpoint: "projects-v2/projectGroups.unassign",
        body: { id: params.id, assignee: { type: params.assignee_type, id: params.assignee_id } },
      });
      return {
        content: [{ type: "text" as const, text: `${params.assignee_type} ${params.assignee_id} unassigned from group ${params.id}.` }],
      };
    }
  );

  // ── Duplicate Project Group ─────────────────────────────────────────────
  server.tool(
    "teamleader_duplicate_project_group",
    "Duplicate a project group and its entities (without time trackings). Returns {id, type} of the new group.",
    {
      origin_id: z.string().describe("ID of the group to duplicate"),
    },
    async (params) => {
      const result = await client.request<{ data: { id: string; type: string } }>({
        endpoint: "projects-v2/projectGroups.duplicate",
        body: { origin_id: params.origin_id },
      });
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // ── Get Project Task (Info) ─────────────────────────────────────────────
  server.tool(
    "teamleader_get_project_task",
    "Get full details of a project task including title, status, description, billing, assignees, dates, time estimated/tracked, budgets, custom fields.",
    {
      id: z.string().describe("Project task ID"),
    },
    async (params) => {
      const result = await client.request<{ data: unknown }>({
        endpoint: "projects-v2/tasks.info",
        body: { id: params.id },
      });
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // ── Update Project Task ─────────────────────────────────────────────────
  server.tool(
    "teamleader_update_project_task",
    "Update a project task. All fields except id are optional. Providing null clears nullable fields.",
    {
      id: z.string().describe("Project task ID"),
      title: z.string().optional().describe("New task title"),
      description: z.string().nullable().optional().describe("New description (null to clear)"),
      status: z.enum(["to_do", "in_progress", "on_hold", "done"]).optional().describe("Task status"),
      work_type_id: z.string().nullable().optional().describe("Work type ID (null to clear, cannot be null if billing_method is work_type_rate). Use teamleader_list_work_types to find valid IDs."),
      billing_method: z.enum(["user_rate", "work_type_rate", "custom_rate", "fixed_price", "parent_fixed_price", "non_billable"]).optional().describe("Billing method"),
      fixed_price_amount: z.number().optional().describe("Fixed price amount"),
      fixed_price_currency: z.string().optional().describe("Fixed price currency (e.g. EUR)"),
      external_budget_amount: z.number().optional().describe("External budget amount"),
      external_budget_currency: z.string().optional().describe("External budget currency (e.g. EUR)"),
      internal_budget_amount: z.number().optional().describe("Internal/cost budget amount"),
      internal_budget_currency: z.string().optional().describe("Internal/cost budget currency (e.g. EUR)"),
      custom_rate_amount: z.number().optional().describe("Custom rate amount"),
      custom_rate_currency: z.string().optional().describe("Custom rate currency (e.g. EUR)"),
      start_date: z.string().nullable().optional().describe("Start date (YYYY-MM-DD) or null to clear"),
      end_date: z.string().nullable().optional().describe("End date (YYYY-MM-DD) or null to clear"),
      time_estimated_value: z.number().optional().describe("Estimated time value (e.g. 480)"),
      time_estimated_unit: z.enum(["hours", "minutes", "seconds"]).default("minutes").optional().describe("Estimated time unit"),
    },
    async (params) => {
      const body: Record<string, unknown> = { id: params.id };
      if (params.title) body.title = params.title;
      if (params.description !== undefined) body.description = params.description;
      if (params.status) body.status = params.status;
      if (params.work_type_id !== undefined) body.work_type_id = params.work_type_id;
      if (params.billing_method) body.billing_method = params.billing_method;
      if (params.fixed_price_amount != null) body.fixed_price = { amount: params.fixed_price_amount, currency: params.fixed_price_currency ?? "EUR" };
      if (params.external_budget_amount != null) body.external_budget = { amount: params.external_budget_amount, currency: params.external_budget_currency ?? "EUR" };
      if (params.internal_budget_amount != null) body.internal_budget = { amount: params.internal_budget_amount, currency: params.internal_budget_currency ?? "EUR" };
      if (params.custom_rate_amount != null) body.custom_rate = { amount: params.custom_rate_amount, currency: params.custom_rate_currency ?? "EUR" };
      if (params.start_date !== undefined) body.start_date = params.start_date;
      if (params.end_date !== undefined) body.end_date = params.end_date;
      if (params.time_estimated_value != null) body.time_estimated = { value: params.time_estimated_value, unit: params.time_estimated_unit ?? "minutes" };

      await client.request({
        endpoint: "projects-v2/tasks.update",
        body,
      });
      return {
        content: [{ type: "text" as const, text: `Project task ${params.id} updated.` }],
      };
    }
  );

  // ── Duplicate Project Task ──────────────────────────────────────────────
  server.tool(
    "teamleader_duplicate_project_task",
    "Duplicate a project task (without time trackings). Returns {id, type} of the new task.",
    {
      origin_id: z.string().describe("ID of the task to duplicate"),
    },
    async (params) => {
      const result = await client.request<{ data: { id: string; type: string } }>({
        endpoint: "projects-v2/tasks.duplicate",
        body: { origin_id: params.origin_id },
      });
      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // ── Assign User/Team to Project Task ────────────────────────────────────
  server.tool(
    "teamleader_assign_project_task",
    "Assign a user or team to a project task.",
    {
      id: z.string().describe("Project task ID"),
      assignee_type: z.enum(["user", "team"]).default("user").describe("Assignee type"),
      assignee_id: z.string().describe("User or team ID to assign"),
    },
    async (params) => {
      await client.request({
        endpoint: "projects-v2/tasks.assign",
        body: { id: params.id, assignee: { type: params.assignee_type, id: params.assignee_id } },
      });
      return {
        content: [{ type: "text" as const, text: `${params.assignee_type} ${params.assignee_id} assigned to task ${params.id}.` }],
      };
    }
  );

  // ── Unassign User/Team from Project Task ────────────────────────────────
  server.tool(
    "teamleader_unassign_project_task",
    "Unassign a user or team from a project task.",
    {
      id: z.string().describe("Project task ID"),
      assignee_type: z.enum(["user", "team"]).default("user").describe("Assignee type"),
      assignee_id: z.string().describe("User or team ID to unassign"),
    },
    async (params) => {
      await client.request({
        endpoint: "projects-v2/tasks.unassign",
        body: { id: params.id, assignee: { type: params.assignee_type, id: params.assignee_id } },
      });
      return {
        content: [{ type: "text" as const, text: `${params.assignee_type} ${params.assignee_id} unassigned from task ${params.id}.` }],
      };
    }
  );

  // ── Add Quotation to Project ────────────────────────────────────────────
  server.tool(
    "teamleader_add_project_quotation",
    "Add a quotation to a project. Idempotent: does not fail if the quotation was already added.",
    {
      id: z.string().describe("Project ID"),
      quotation_id: z.string().describe("Quotation ID to link"),
    },
    async (params) => {
      await client.request({
        endpoint: "projects-v2/projects.addQuotation",
        body: { id: params.id, quotation_id: params.quotation_id },
      });
      return {
        content: [{ type: "text" as const, text: `Quotation ${params.quotation_id} added to project ${params.id}.` }],
      };
    }
  );

  // ── Remove Quotation from Project ───────────────────────────────────────
  server.tool(
    "teamleader_remove_project_quotation",
    "Remove a quotation from a project. Idempotent: does not fail if the quotation was already removed.",
    {
      id: z.string().describe("Project ID"),
      quotation_id: z.string().describe("Quotation ID to unlink"),
    },
    async (params) => {
      await client.request({
        endpoint: "projects-v2/projects.removeQuotation",
        body: { id: params.id, quotation_id: params.quotation_id },
      });
      return {
        content: [{ type: "text" as const, text: `Quotation ${params.quotation_id} removed from project ${params.id}.` }],
      };
    }
  );
}
