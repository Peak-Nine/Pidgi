/**
 * Smart task resolution + time logging tools.
 *
 * Flow (cache-first, numbered selection when multiple options):
 *   1. teamleader_find_task → guides: company → project → group → task
 *   2. teamleader_log_time  → resolves from cache → logs time
 *
 * At each step:
 *   - 1 result  → auto-proceed
 *   - N results → numbered list, user picks by number
 *   - 0 results → clear error
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { writeFileSync, readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import type { TeamleaderClient } from "../api/client.js";
import type { ProjectLineEntry } from "../types/index.js";
import {
  getActiveUser, setActiveUser,
  getDefaultWorkTypeId, setDefaultWorkTypeId,
  getWorkTypes, setWorkTypes,
  getCompany, upsertCompany,
  getProjectsForCompany, upsertProjects,
  getGroupsForProject, upsertGroups,
  findTask, searchTasks, upsertTask, listTasks,
  getTaskTree, setTaskTree, invalidateTaskTree,
  scoreTasksInTree,
  clearCache, getCacheStats,
  type TaskTreeProject, type TaskTreeGroup, type TaskTreeTask,
} from "../api/cache.js";

function respond(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

export type YamlTaskEntry = { id: string; title: string; task_type: string; project_id: string; project_title: string; group_id?: string; group_title?: string };

/** Parse task entries from YAML content string. Returns map of n → task info. */
export function parseTasksYaml(content: string): Map<number, YamlTaskEntry> {
  const result = new Map<number, YamlTaskEntry>();
  let currentProjectId = "";
  let currentProjectTitle = "";
  let currentGroupId: string | undefined;
  let currentGroupTitle: string | undefined;
  let inGroups = false;
  let inUngrouped = false;
  let inTasks = false;
  let currentEntry: Record<string, string> = {};

  function flushEntry() {
    const n = parseInt(currentEntry.n, 10);
    if (!isNaN(n) && currentEntry.id) {
      result.set(n, {
        id: currentEntry.id,
        title: currentEntry.title ?? "",
        task_type: currentEntry.task_type ?? "project_task",
        project_id: currentProjectId,
        project_title: currentProjectTitle,
        group_id: currentGroupId,
        group_title: currentGroupTitle,
      });
    }
    currentEntry = {};
  }

  for (const line of content.split("\n")) {
    const trimmed = line.trimStart();
    const indent = line.length - trimmed.length;

    // Project level: "  - id: ..." (indent 2)
    if (indent === 2 && trimmed.startsWith("- id: ")) {
      if (currentEntry.n) flushEntry();
      currentProjectId = trimmed.slice(6).trim();
      currentGroupId = undefined;
      currentGroupTitle = undefined;
      inGroups = false;
      inUngrouped = false;
      inTasks = false;
    } else if (indent === 4 && trimmed.startsWith("title: ") && !inGroups && !inUngrouped) {
      currentProjectTitle = trimmed.slice(7).trim().replace(/^"|"$/g, "");
    } else if (indent === 4 && trimmed === "groups:") {
      if (currentEntry.n) flushEntry();
      inGroups = true;
      inUngrouped = false;
      inTasks = false;
    } else if (indent === 4 && trimmed === "ungrouped:") {
      if (currentEntry.n) flushEntry();
      inGroups = false;
      inUngrouped = true;
      inTasks = false;
      currentGroupId = undefined;
      currentGroupTitle = undefined;
    }
    // Group level: "      - id: ..." (indent 6)
    else if (inGroups && indent === 6 && trimmed.startsWith("- id: ")) {
      if (currentEntry.n) flushEntry();
      currentGroupId = trimmed.slice(6).trim();
      inTasks = false;
    } else if (inGroups && indent === 8 && trimmed.startsWith("title: ")) {
      currentGroupTitle = trimmed.slice(7).trim().replace(/^"|"$/g, "");
    } else if (inGroups && indent === 8 && trimmed === "tasks:") {
      inTasks = true;
    }
    // Task in group: "          - n: ..." (indent 10), props at indent 12
    else if (inGroups && inTasks && indent === 10 && trimmed.startsWith("- n: ")) {
      if (currentEntry.n) flushEntry();
      currentEntry = { n: trimmed.slice(5).trim() };
    } else if (inGroups && inTasks && indent === 12) {
      const [key, ...rest] = trimmed.split(": ");
      if (key && rest.length) currentEntry[key] = rest.join(": ").replace(/^"|"$/g, "");
    }
    // Ungrouped task: "      - n: ..." (indent 6), props at indent 8
    else if (inUngrouped && indent === 6 && trimmed.startsWith("- n: ")) {
      if (currentEntry.n) flushEntry();
      currentEntry = { n: trimmed.slice(5).trim() };
    } else if (inUngrouped && indent === 8) {
      const [key, ...rest] = trimmed.split(": ");
      if (key && rest.length) currentEntry[key] = rest.join(": ").replace(/^"|"$/g, "");
    }
  }
  if (currentEntry.n) flushEntry();

  return result;
}

/** Read task entries from YAML file on disk. Wrapper around parseTasksYaml. */
function readTasksFromYaml(companyName: string): Map<number, YamlTaskEntry> {
  const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const filePath = join(homedir(), `.teamleader-tasks-${slug}.yaml`);
  try {
    return parseTasksYaml(readFileSync(filePath, "utf-8"));
  } catch {
    return new Map();
  }
}

function getLocalOffset(): string {
  const offset = -new Date().getTimezoneOffset();
  const sign = offset >= 0 ? "+" : "-";
  const h = String(Math.floor(Math.abs(offset) / 60)).padStart(2, "0");
  const m = String(Math.abs(offset) % 60).padStart(2, "0");
  return `${sign}${h}:${m}`;
}

function toDatetime(s: string): string {
  const tz = getLocalOffset();
  // "YYYY-MM-DD HH:MM" → ISO
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(s)) return `${s.replace(" ", "T")}:00${tz}`;
  // "YYYY-MM-DD" → ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return `${s}T00:00:00${tz}`;
  return s;
}

function numbered<T>(items: T[], label: (item: T) => string): string {
  return items.map((item, i) => `${i + 1}. ${label(item)}`).join("\n");
}

// ── Startup Init ──────────────────────────────────────────────────────────────

export async function initializeCache(client: TeamleaderClient): Promise<void> {
  // Active user
  if (!getActiveUser()) {
    try {
      const result = await client.request<{ data: { id: string; first_name: string; last_name: string } }>({
        endpoint: "users.me",
        body: {},
      });
      const u = result.data;
      setActiveUser({ id: u.id, name: `${u.first_name} ${u.last_name}` });
    } catch (e) {
      console.warn("Warning: could not load active user", e);
    }
  }

  // Work types
  if (!getWorkTypes()) {
    try {
      const result = await client.request<{ data: { id: string; name: string }[] }>({
        endpoint: "workTypes.list",
        body: {},
      });
      setWorkTypes(result.data.map((wt) => ({ id: wt.id, name: wt.name })));
    } catch (e) {
      console.warn("Warning: could not load work types", e);
    }
  }

  // Default work type — detect from user's recent time entries
  if (!getDefaultWorkTypeId()) {
    try {
      const user = getActiveUser();
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const result = await client.request<{ data: { work_type?: { id: string } }[] }>({
        endpoint: "timeTracking.list",
        body: {
          filter: {
            user_id: user?.id,
            started_after: `${sevenDaysAgo}T00:00:00+00:00`,
          },
          page: { size: 50, number: 1 },
        },
      });
      const entries = result.data ?? [];
      // Count work type occurrences
      const counts: Record<string, number> = {};
      for (const e of entries) {
        if (e.work_type?.id) counts[e.work_type.id] = (counts[e.work_type.id] ?? 0) + 1;
      }
      const topId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
      if (topId) setDefaultWorkTypeId(topId);
      else if (getWorkTypes()?.[0]) setDefaultWorkTypeId(getWorkTypes()![0].id);
    } catch (e) {
      console.warn("Warning: could not detect default work type", e);
      if (getWorkTypes()?.[0]) setDefaultWorkTypeId(getWorkTypes()![0].id);
    }
  }
}

// ── Register Tools ─────────────────────────────────────────────────────────────

export function registerResolveTools(server: McpServer, client: TeamleaderClient): void {

  // ── Find Task ──────────────────────────────────────────────────────────────
  server.tool(
    "teamleader_find_task",
    [
      "Find a task via company → group → task hierarchy and cache it for log_time.",
      "PREFER teamleader_load_tasks + task_id shortcut in log_time when possible — faster, fewer steps.",
      "Use find_task only when: task needs to be created, or load_tasks tree is not available.",
      "Cache-first. Numbered selection when multiple options.",
      "RULES:",
      "  - Company: never created. Error if not found.",
      "  - Project/Group: not auto-created. Ask confirmation (confirm_create_project / confirm_create_group).",
      "  - Task: if tasks exist in group → ask confirm_create_task=true. If group is empty → auto-create.",
      "Steps:",
      "  1. Call with company_name + group_name + task_name",
      "  2. Group searched across ALL projects of the company",
      "  3. If group found in multiple projects → project_selection=N",
      "  4. If group not found → lists projects, ask confirm_create_group=true + project_selection=N",
      "  5. If no projects exist → ask confirm_create_project=true + project_name",
      "  6. If multiple tasks match → task_selection=N",
      "  7. If task not found but other tasks exist → ask confirm_create_task=true",
    ].join("\n"),
    {
      company_name: z.string().describe("Company name (partial match)"),
      group_name: z.string().describe("Group/phase name (partial match, searched across all projects)"),
      task_name: z.string().describe("Task name (partial match, created if not found)"),
      project_selection: z.number().optional().describe("Select project by number from list"),
      task_selection: z.number().optional().describe("Select task by number from previous list"),
      confirm_create_group: z.boolean().optional().describe("Confirm creation of new group (requires project_selection)"),
      confirm_create_project: z.boolean().optional().describe("Confirm creation of new project (requires project_name)"),
      confirm_create_task: z.boolean().optional().describe("Confirm creation of new task when no exact match found"),
      only_open: z.boolean().optional().default(true).describe("Only show open tasks (to_do, in_progress, on_hold). Default: true"),
      project_name: z.string().optional().describe("Name for new project (only used with confirm_create_project=true)"),
      description: z.string().optional().describe("Task description (set on new task when creating)"),
      // Internal state
      _company_id: z.string().optional().describe("Internal: resolved company ID"),
      _project_id: z.string().optional().describe("Internal: resolved project ID"),
      _group_id: z.string().optional().describe("Internal: resolved group ID"),
      _group_title: z.string().optional().describe("Internal: resolved group title"),
    },
    async (params) => {
      // ── Cache check ────────────────────────────────────────────────────────
      if (!params.project_selection && !params.task_selection && !params._group_id) {
        const cached = findTask(params.company_name, params.task_name);
        if (cached && cached.path.toLowerCase().includes(params.group_name.toLowerCase())) {
          return respond(`✅ Cache hit:\n${cached.path}\nID: ${cached.task_id}`);
        }
      }

      // ── Resolve company ────────────────────────────────────────────────────
      let companyId = params._company_id;
      let companyName = params.company_name;

      if (!companyId) {
        const cachedCo = getCompany(params.company_name);
        if (cachedCo) {
          companyId = cachedCo.id;
          companyName = cachedCo.name;
        } else {
          const result = await client.request<{ data: { id: string; name: string }[] }>({
            endpoint: "companies.list",
            body: { filter: { term: params.company_name }, page: { size: 10, number: 1 } },
          });
          const companies = result.data ?? [];
          if (!companies.length) return respond(`No companies found for "${params.company_name}".`);
          if (companies.length === 1) {
            companyId = companies[0].id;
            companyName = companies[0].name;
            upsertCompany({ id: companyId, name: companyName });
          } else {
            return respond(
              `Multiple companies found:\n${numbered(companies, c => c.name)}\n\nUse exact name.`
            );
          }
        }
      }

      // ── Resolve group (search across all projects) ─────────────────────────
      let groupId = params._group_id;
      let groupTitle = params._group_title;
      let projectId = params._project_id;
      let projectTitle = "";

      if (!groupId) {
        // Get all projects for company (cache-first)
        let projects: { id: string; title: string }[];
        const cachedProjects = getProjectsForCompany(companyId);
        if (cachedProjects) {
          projects = cachedProjects;
        } else {
          const result = await client.request<{ data: { id: string; title: string; status: string }[] }>({
            endpoint: "projects-v2/projects.list",
            body: {
              filter: { customers: [{ type: "company", id: companyId }] },
              page: { size: 50, number: 1 },
            },
          });
          const fetched = (result.data ?? []).map(p => ({ id: p.id, title: p.title, company_id: companyId!, status: p.status }));
          upsertProjects(fetched);
          projects = fetched;
        }
        if (!projects.length) {
          if (params.confirm_create_project && params.project_name) {
            const created = await client.request<{ data: { id: string } }>({
              endpoint: "projects-v2/projects.create",
              body: {
                title: params.project_name,
                customers: [{ type: "company", id: companyId }],
                status: "active",
              },
            });
            const newProject = { id: created.data.id, title: params.project_name, company_id: companyId!, status: "active" };
            upsertProjects([newProject]);
            projects = [newProject];
          } else {
            return respond(
              `No projects found for ${companyName}.\n\nCreate project? Retry with:\nproject_name="[name]" confirm_create_project=true _company_id="${companyId}"`
            );
          }
        }

        // If project_selection given, filter to that project
        if (params.project_selection) {
          const sel = projects[params.project_selection - 1];
          if (!sel) return respond(`Invalid selection. Choose between 1 and ${projects.length}.`);
          projectId = sel.id;
          projectTitle = sel.title;
          projects = [sel];
        }

        // Search groups across (filtered) projects
        type GroupMatch = { groupId: string; groupTitle: string; projectId: string; projectTitle: string };
        const matches: GroupMatch[] = [];
        const gl = params.group_name.toLowerCase();

        for (const proj of projects) {
          let groups: { id: string; title: string }[];
          const cachedGroups = getGroupsForProject(proj.id);
          if (cachedGroups) {
            groups = cachedGroups;
          } else {
            const r = await client.request<{ data: { id: string; title: string }[] }>({
              endpoint: "projects-v2/projectGroups.list",
              body: { filter: { project_id: proj.id }, page: { size: 100, number: 1 } },
            });
            const fetched = (r.data ?? []).map(g => ({ id: g.id, title: g.title, project_id: proj.id }));
            if (fetched.length) upsertGroups(fetched);
            groups = fetched;
          }
          for (const g of groups) {
            if (g.title.toLowerCase().includes(gl)) {
              matches.push({ groupId: g.id, groupTitle: g.title, projectId: proj.id, projectTitle: proj.title });
            }
          }
        }

        if (!matches.length) {
          if (params.confirm_create_group && params.project_selection) {
            const targetProject = projects[params.project_selection - 1];
            if (!targetProject) return respond(`Invalid project selection. Choose between 1 and ${projects.length}.`);
            const created = await client.request<{ data: { id: string } }>({
              endpoint: "projects-v2/projectGroups.create",
              body: {
                project_id: targetProject.id,
                title: params.group_name,
              },
            });
            upsertGroups([{ id: created.data.id, title: params.group_name, project_id: targetProject.id }]);
            groupId = created.data.id;
            groupTitle = params.group_name;
            projectId = targetProject.id;
            projectTitle = targetProject.title;
          } else {
            const projList = numbered(projects, p => p.title);
            return respond(
              `Group "${params.group_name}" not found for ${companyName}.\n\nCreate? Select project:\n${projList}\n\nRetry with:\nproject_selection=N confirm_create_group=true _company_id="${companyId}"`
            );
          }
        }

        if (matches.length) {
          // Multiple matches in different projects → ask for project selection
          const uniqueProjects = [...new Set(matches.map(m => m.projectId))];
          if (uniqueProjects.length > 1) {
            const projList = uniqueProjects.map((pid, i) => {
              const match = matches.find(m => m.projectId === pid)!;
              return `${i + 1}. ${match.projectTitle} (group: ${match.groupTitle})`;
            }).join("\n");
            return respond(
              `Group "${params.group_name}" found in multiple projects:\n${projList}\n\nSelect project via project_selection=N\n\nRetry with:\n_company_id="${companyId}"`
            );
          }

          // Single match (possibly multiple groups with same name in same project → take first)
          groupId = matches[0].groupId;
          groupTitle = matches[0].groupTitle;
          projectId = matches[0].projectId;
          projectTitle = matches[0].projectTitle;
        }
      } else {
        // group already resolved, get project title from cache
        const cachedProjects = getProjectsForCompany(companyId);
        const proj = cachedProjects?.find(p => p.id === projectId);
        projectTitle = proj?.title ?? projectId ?? "";
      }

      // ── Resolve task: projectLines.list → IDs → tasks.list → titles ──────
      if (!projectId) {
        return respond(`Internal: projectId not resolved for group "${groupTitle}". Retry or provide _project_id.`);
      }

      // Step 1: get line IDs for this group
      // NOTE: project_id is top-level, project_group_id must be filtered client-side
      const linesResult = await client.request<{ data: ProjectLineEntry[] }>({
        endpoint: "projects-v2/projectLines.list",
        body: { project_id: projectId, filter: { types: ["nextgenTask"] }, page: { size: 500, number: 1 } },
      });
      const taskLineIds = (linesResult.data ?? [])
        .filter(l => l.line?.type === "nextgenTask")
        .filter(l => !groupId || l.group?.id === groupId)
        .map(l => l.line?.id)
        .filter(Boolean) as string[];

      const openStatuses = new Set(["to_do", "in_progress", "on_hold"]);
      let allProjectTasks: { id: string; title: string; work_type_id?: string }[] = [];
      if (taskLineIds.length > 0) {
        // Step 2: get task titles by IDs — batch 100 at a time, only open tasks
        for (let i = 0; i < taskLineIds.length; i += 100) {
          const batch = taskLineIds.slice(i, i + 100);
          const tasksResult = await client.request<{ data: { id: string; title: string; status?: string; work_type?: { id: string } }[] }>({
            endpoint: "projects-v2/tasks.list",
            body: { filter: { ids: batch }, page: { size: 100, number: 1 } },
          });
          const onlyOpen = params.only_open !== false;
          const open = (tasksResult.data ?? [])
            .filter(t => !onlyOpen || !t.status || openStatuses.has(t.status))
            .map(t => ({ id: t.id, title: t.title, work_type_id: t.work_type?.id }));
          allProjectTasks = allProjectTasks.concat(open);
        }
      }

      const tl = params.task_name.toLowerCase();
      // Partial match; if no match → show all tasks in group so user can pick
      const filtered = allProjectTasks.filter(t => t.title?.toLowerCase().includes(tl));
      const displayList = filtered.length > 0 ? filtered : allProjectTasks;

      let selectedTask: { id: string; title: string; work_type_id?: string; isNew?: boolean };

      if (params.task_selection) {
        const s = displayList[params.task_selection - 1];
        if (!s) return respond(`Invalid selection. Choose between 1 and ${displayList.length}.`);
        selectedTask = s;
      } else if (filtered.length === 1) {
        selectedTask = filtered[0];
      } else if (filtered.length === 0 && displayList.length > 0 && !params.confirm_create_task) {
        return respond(
          `Task "${params.task_name}" not found in ${groupTitle}.\n\nCreate? Retry with confirm_create_task=true\n\nOr select existing task:\n${numbered(displayList, t => t.title)}\n\nSelect via task_selection=N\n\nRetry with:\n_company_id="${companyId}" _project_id="${projectId}" _group_id="${groupId}" _group_title="${groupTitle}"`
        );
      } else if (filtered.length > 1) {
        return respond(
          `Multiple tasks found:\n${numbered(filtered, t => t.title)}\n\nSelect via task_selection=N\n\nRetry with:\n_company_id="${companyId}" _project_id="${projectId}" _group_id="${groupId}" _group_title="${groupTitle}"`
        );
      } else {
        // ── Create task (not found) ──────────────────────────────────────────
        const user = getActiveUser();
        const workTypeId = getDefaultWorkTypeId() ?? getWorkTypes()?.[0]?.id;
        const createBody: Record<string, unknown> = {
          title: params.task_name,
        };
        if (projectId) createBody.project_id = projectId;
        if (groupId) createBody.group_id = groupId;
        if (workTypeId) createBody.work_type_id = workTypeId;
        if (user?.id) createBody.assignees = [{ type: "user", id: user.id }];
        if (params.description) createBody.description = params.description;

        const created = await client.request<{ data: { id: string } }>({
          endpoint: "projects-v2/tasks.create",
          body: createBody,
        });
        selectedTask = { id: created.data.id, title: params.task_name, isNew: true };
      }

      // ── Save to cache ──────────────────────────────────────────────────────
      upsertTask({
        task_id: selectedTask.id,
        task_title: selectedTask.title,
        subject_type: "nextgenTask",
        project_id: projectId!,
        project_title: projectTitle,
        group_id: groupId,
        group_title: groupTitle,
        company_id: companyId!,
        company_name: companyName,
        work_type_id: selectedTask.work_type_id ?? getDefaultWorkTypeId() ?? getWorkTypes()?.[0]?.id,
        last_used: new Date().toISOString(),
      });

      const path = [companyName, projectTitle, groupTitle, selectedTask.title].filter(Boolean).join(" > ");
      const newTag = selectedTask.isNew ? " (newly created)" : "";
      return respond(
        `✅ Task${newTag} saved to cache:\n${path}\nID: ${selectedTask.id}\n\nUse:\nteamleader_log_time(company_name="${companyName}", task_name="${selectedTask.title}", started_on="...", ended_on="...")`
      );
    }
  );

  // ── Log Time ───────────────────────────────────────────────────────────────
  server.tool(
    "teamleader_log_time",
    [
      "Register time for a task. Resolves task from cache.",
      "If not in cache: run teamleader_find_task first.",
      "Formats: ISO 8601, 'YYYY-MM-DD HH:MM', or 'HH:MM' (uses today's date).",
      "Deduplication: checks existing entries before adding. Use force=true to override.",
      "CRITICAL: Never guess or invent a task_id. An invalid task_id returns '400 Invalid subject' — not a 'not found' error, making it hard to diagnose. Always get task_id from load_tasks + task_selection=N first.",
      "CRITICAL: If task_id comes from teamleader_list_timetracking subject.id — do NOT use it directly. That ID is a todo/standalone reference, not a nextgenTask ID. Run teamleader_load_tasks first to get the correct project task ID.",
      "PAST DATES: Always use started_on='HH:MM' + date='YYYY-MM-DD' for historical entries. Do NOT pass ISO datetime string (e.g. '2026-03-17T16:00:00') — TL API rejects ISO without timezone offset for past dates.",
    ].join("\n"),
    {
      company_name: z.string().describe("Company name (partial match)"),
      task_name: z.string().optional().describe("Task name (partial match, must be in cache)"),
      task_id: z.string().optional().describe("Direct task ID — skips cache lookup (use when ID is known from load_tasks)"),
      started_on: z.string().describe("Start: ISO 8601, 'YYYY-MM-DD HH:MM', or 'HH:MM'"),
      ended_on: z.string().describe("End: ISO 8601, 'YYYY-MM-DD HH:MM', or 'HH:MM'"),
      description: z.string().optional().describe("Description of work done"),
      work_type_id: z.string().optional().describe("Override work type ID. Use teamleader_list_work_types to find valid IDs."),
      date: z.string().optional().describe("Date for HH:MM times (YYYY-MM-DD, default today)"),
      force: z.boolean().optional().describe("Skip deduplication check and register anyway"),
      confirm_overlap: z.boolean().optional().describe("Confirm registration despite overlap with other task"),
      confirm_task_match: z.number().optional().describe("Confirm tree match by number (from proposed list)"),
    },
    async (params) => {
      // ── task_id shortcut: skip cache, build minimal cached object from tree ─
      let cached = params.task_id ? null : findTask(params.company_name, params.task_name ?? "");

      if (params.task_id && !cached) {
        const co = getCompany(params.company_name);
        const tree = co ? getTaskTree(co.id) : undefined;
        // Try to find full metadata in tree
        let found: { project: TaskTreeProject; group?: TaskTreeGroup; task: TaskTreeTask } | undefined;
        if (tree) {
          for (const proj of tree.projects) {
            for (const group of proj.groups) {
              const task = group.tasks.find(t => t.id === params.task_id);
              if (task) { found = { project: proj, group, task }; break; }
            }
            if (!found) {
              const task = proj.ungrouped.find(t => t.id === params.task_id);
              if (task) { found = { project: proj, task }; break; }
            }
            if (found) break;
          }
        }
        const workTypeId = params.work_type_id ?? found?.task.work_type_id ?? getDefaultWorkTypeId() ?? getWorkTypes()?.[0]?.id;
        cached = {
          task_id: params.task_id,
          task_title: found?.task.title ?? params.task_id,
          subject_type: found?.task.task_type === "standalone_task" ? "todo" : "nextgenTask",
          project_id: found?.project.id ?? "",
          project_title: found?.project.title ?? "",
          group_id: found?.group?.id,
          group_title: found?.group?.title,
          company_id: co?.id ?? "",
          company_name: co?.name ?? params.company_name,
          work_type_id: workTypeId,
          path: [co?.name ?? params.company_name, found?.project.title, found?.group?.title, found?.task.title ?? params.task_id].filter(Boolean).join(" > "),
          last_used: new Date().toISOString(),
          cached_at: new Date().toISOString(),
        };
        upsertTask(cached);
      }

      // ── Tree match fallback ────────────────────────────────────────────────
      if (!cached) {
        const co = getCompany(params.company_name);
        if (co) {
          const matches = scoreTasksInTree(co.id, params.task_name ?? "");
          if (matches.length > 0) {
            if (params.confirm_task_match) {
              const sel = matches[params.confirm_task_match - 1];
              if (!sel) return respond(`Invalid selection. Choose between 1 and ${matches.length}.`);
              upsertTask({
                task_id: sel.task.id,
                task_title: sel.task.title,
                subject_type: sel.task.task_type === "standalone_task" ? "todo" : "nextgenTask",
                project_id: sel.project.id,
                project_title: sel.project.title,
                group_id: sel.group?.id,
                group_title: sel.group?.title,
                company_id: co.id,
                company_name: co.name,
                work_type_id: sel.task.work_type_id ?? getDefaultWorkTypeId() ?? getWorkTypes()?.[0]?.id,
                last_used: new Date().toISOString(),
              });
              cached = findTask(params.company_name, sel.task.title)!;
            } else {
              const list = matches.slice(0, 5).map((m, i) => {
                const path = [m.project.title, m.group?.title, m.task.title].filter(Boolean).join(" > ");
                return `${i + 1}. (${m.score}pt) ${path}`;
              }).join("\n");
              return respond(
                `Task not in cache. Best matches:\n${list}\n\nConfirm via confirm_task_match=N\nOr load first: teamleader_load_tasks(company_name="${params.company_name}")`
              );
            }
          }
        }
      }

      if (!cached) {
        const suggestions = searchTasks(params.task_name ?? "");
        const hint = suggestions.length
          ? `\nAvailable tasks:\n${numbered(suggestions, t => t.path)}`
          : "";
        return respond(
          `Task "${params.task_name}" for "${params.company_name}" not in cache.${hint}\n\nRun first: teamleader_find_task(company_name="${params.company_name}", task_name="${params.task_name}")`
        );
      }

      // Parse time (support HH:MM with date)
      const baseDate = params.date ?? new Date().toISOString().slice(0, 10);
      const parseTime = (s: string) => {
        if (/^\d{2}:\d{2}$/.test(s)) return toDatetime(`${baseDate} ${s}`);
        return toDatetime(s);
      };

      const startedAt = parseTime(params.started_on);
      const endedAt = parseTime(params.ended_on);
      const newStart = new Date(startedAt).getTime();
      const newEnd = new Date(endedAt).getTime();

      const user = getActiveUser();
      if (!user) return respond("Error: active user not loaded. Run teamleader_load_tasks first.");
      const userId = user.id;
      const workTypeId = params.work_type_id ?? cached.work_type_id ?? getDefaultWorkTypeId() ?? getWorkTypes()?.[0]?.id;
      if (!workTypeId) return respond("Error: no work type available. Run teamleader_load_tasks first to populate work types.");

      // ── Deduplication check ────────────────────────────────────────────────
      // UTC intentional: dedup window uses ±24h range — timezone offset is irrelevant at this granularity
      const toFilterDate = (ms: number) => new Date(ms).toISOString().replace(/\.\d+Z$/, "+00:00");

      if (!params.force) {
        try {
          const existing = await client.request<{
            data: { id: string; started_at: string; ended_at: string; subject?: { id: string } }[]
          }>({
            endpoint: "timeTracking.list",
            body: {
              filter: {
                user_id: userId,
                started_after: toFilterDate(newStart - 24 * 60 * 60 * 1000),
                started_before: toFilterDate(newEnd + 24 * 60 * 60 * 1000),
              },
              page: { size: 50, number: 1 },
            },
          });

          const allEntries = existing.data ?? [];
          const fmt = (iso: string) => new Date(iso).toISOString().replace("T", " ").slice(0, 19);

          function overlaps(exStart: number, exEnd: number): boolean {
            return newStart < exEnd && newEnd > exStart;
          }

          // ── Exact duplicate: same start time (to second precision) ──────
          // NOTE: subject.id in timeTracking uses 'todo' ID ≠ nextgenTask ID
          // So we match on start time, not task ID (same as C# importer approach)
          for (const e of allEntries) {
            const exStartSec = Math.floor(new Date(e.started_at).getTime() / 1000);
            const newStartSec = Math.floor(newStart / 1000);
            if (exStartSec === newStartSec) {
              return respond(
                `⛔ Duplicate — same start time already registered:\nExisting: ${fmt(e.started_at)} → ${fmt(e.ended_at)} (ID: ${e.id})\n\nUse force=true to register anyway.`
              );
            }
          }

          // ── Overlap with other entry ──────────────────────────────────────
          if (!params.confirm_overlap) {
            const conflicts = allEntries.filter(e =>
              overlaps(new Date(e.started_at).getTime(), new Date(e.ended_at).getTime())
            );
            if (conflicts.length) {
              const list = conflicts.map(e =>
                `- ${fmt(e.started_at)} → ${fmt(e.ended_at)} (ID: ${e.id})`
              ).join("\n");
              return respond(
                `⚠️ Overlap with other task(s) for the same client:\n${list}\n\nOptions:\nA. Confirm with confirm_overlap=true (2 tasks simultaneously)\nB. Adjust existing block via teamleader_update_timetracking\nC. Use force=true to ignore`
              );
            }
          }
        } catch (e) {
          console.warn("Dedup check failed:", e);
          // Proceed anyway
        }

        // ── Active timer overlap check ──────────────────────────────────────
        try {
          const timerRes = await client.request<{
            data?: { started_at?: string }
          }>({ endpoint: "timers.current", body: {} });

          const timerStartIso = timerRes.data?.started_at;
          if (timerStartIso) {
            const timerStart = new Date(timerStartIso).getTime();
            if (timerStart < newEnd) {
              const fmtHHMM = (d: Date) => d.toISOString().slice(11, 16);
              const timerHHMM = fmtHHMM(new Date(timerStartIso));
              const startHHMM = fmtHHMM(new Date(newStart));
              const endHHMM = fmtHHMM(new Date(newEnd));
              return respond(
                `⚠️ Active timer running since ${timerHHMM} overlaps with log period ${startHHMM} → ${endHHMM}.\n` +
                `Logging now may cause a duplicate when the timer is stopped later.\n\n` +
                `Options:\nA. Stop the timer first: teamleader_stop_timer\nB. Log anyway: force=true`
              );
            }
          }
        } catch (e) {
          console.warn("Timer overlap check failed:", e);
          // Proceed anyway
        }
      }

      const body: Record<string, unknown> = {
        user_id: userId,
        work_type_id: workTypeId,
        started_at: startedAt,
        ended_at: endedAt,
        subject: { type: cached.subject_type ?? "nextgenTask", id: cached.task_id },
      };
      if (params.description) body.description = params.description;

      let result;
      try {
        result = await client.request<{ data: { id: string } }>({
          endpoint: "timeTracking.add",
          body,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("Invalid subject")) {
          return respond(
            "Error: Invalid task ID — the subject could not be found in Teamleader.\n" +
            `Task ID used: ${cached.task_id}\n` +
            "Use teamleader_load_tasks to get the correct task_id from the project tree.\n" +
            "Never guess or reuse a task_id from a previous session — IDs may differ per company."
          );
        }
        throw err;
      }

      const entryId = result.data?.id;
      if (!entryId) {
        return respond(`❌ Time registration failed: API returned no entry ID.\nBody sent: ${JSON.stringify(body)}`);
      }

      // Verify entry exists (guard against silent failures)
      try {
        await client.request({ endpoint: "timeTracking.info", body: { id: entryId } });
      } catch (e) {
        console.warn("Time entry verification failed:", e);
        return respond(
          `❌ Time registration returned ID ${entryId} but entry not found.\n` +
          `Possible cause: invalid subject type/ID or work_type_id for this account.\n` +
          `Body sent: ${JSON.stringify(body)}\n\n` +
          `Try: teamleader_load_tasks(company_name="${params.company_name}", force_refresh=true) then retry.`
        );
      }

      // Update last_used
      upsertTask({ ...cached, last_used: new Date().toISOString() });

      return respond(
        [
          `✅ Time registered:`,
          `- Path   : ${cached.path}`,
          `- Start  : ${startedAt}`,
          `- End    : ${endedAt}`,
          `- User   : ${user?.name ?? userId}`,
          `- Entry  : ${entryId}`,
        ].join("\n")
      );
    }
  );

  // ── Load Tasks (full tree) ─────────────────────────────────────────────────
  server.tool(
    "teamleader_load_tasks",
    [
      "Load and display the full Project > Group > Task tree for a company. Returns nextgenTask IDs (projects-v2). IMPORTANT: v1 todo IDs (from get_task/list_tasks) are NOT the same as v2 nextgenTask IDs — they are incompatible. Always use IDs from this tool for projects-v2 operations (add_project_line_to_group, log_time, task_action, etc.).",
      "Cache-first (30 min TTL). Writes YAML with task IDs to ~/.teamleader-tasks-{slug}.yaml. NOTE: Group IDs are NOT in the YAML cache — use teamleader_list_project_groups + teamleader_get_project_group to find a group ID by name.",
      "Returns a summary by default (small context footprint). Use visual=true for ASCII tree.",
      "WHEN TO USE:",
      "  - First time working with a company in a session",
      "  - When you need project_id/group_id/task_id for log_time or task_action",
      "  - When the user asks to see tasks or wants to pick a task",
      "AFTER LOADING:",
      "  - Use task_id from YAML directly in log_time(task_id=...) — no extra find_task needed",
      "  - Use task_selection=N to cache a specific task",
      "  - Use task_action(action=close, task_number=N) to close a task (handles both project and standalone tasks)",
      "  - Use task_action(action=delete_group, group_id=N) to delete a group (ID from YAML)",
      "PARAMETERS:",
      "  only_open=false  → include done/cancelled tasks too",
      "  visual=true      → show ASCII tree instead of summary",
      "  force_refresh    → bypass 30min cache, reload from API",
    ].join("\n"),
    {
      company_name: z.string().describe("Company name (partial match)"),
      project_filter: z.string().optional().describe("Filter projects by name (partial match)"),
      group_filter: z.string().optional().describe("Filter groups by name (partial match)"),
      only_open: z.boolean().optional().default(true).describe("Only include open tasks (to_do, in_progress, on_hold). Default: true. Pass false to include done/cancelled."),
      visual: z.boolean().optional().describe("Show ASCII tree instead of summary. Use for human-readable overview."),
      task_selection: z.number().optional().describe("Cache task by number for use in log_time. Only valid after visual=true showed the numbered list."),
      force_refresh: z.boolean().optional().describe("Force reload from API, ignore 30min cache. Use when tasks may have changed."),
      _company_id: z.string().optional().describe("Internal: resolved company ID, pass between calls to avoid re-resolving"),
    },
    async (params) => {
      // ── Helpers ───────────────────────────────────────────────────────────
      function yamlStr(v: string): string {
        if (/[:"{}\[\],&#*?|<>=!%@`]/.test(v) || v.startsWith("-") || v.startsWith(" ")) {
          return `"${v.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
        }
        return v;
      }

      // ── Resolve company ───────────────────────────────────────────────────
      let companyId = params._company_id;
      let companyName = params.company_name;

      if (!companyId) {
        const cachedCo = getCompany(params.company_name);
        if (cachedCo) {
          companyId = cachedCo.id;
          companyName = cachedCo.name;
        } else {
          const result = await client.request<{ data: { id: string; name: string }[] }>({
            endpoint: "companies.list",
            body: { filter: { term: params.company_name }, page: { size: 10, number: 1 } },
          });
          const companies = result.data ?? [];
          if (!companies.length) return respond(`No companies found for "${params.company_name}".`);
          if (companies.length === 1) {
            companyId = companies[0].id;
            companyName = companies[0].name;
            upsertCompany({ id: companyId, name: companyName });
          } else {
            return respond(`Multiple companies found:\n${numbered(companies, c => c.name)}\n\nUse exact name.`);
          }
        }
      }

      const onlyOpen = params.only_open !== false;
      const openStatuses = new Set(["to_do", "in_progress", "on_hold"]);

      // ── Cache check ───────────────────────────────────────────────────────
      let tree = !params.force_refresh ? getTaskTree(companyId) : undefined;

      if (!tree) {
        // Load projects
        let projects: { id: string; title: string; status: string; company_id: string }[];
        const cachedProjects = getProjectsForCompany(companyId);
        if (cachedProjects && !params.force_refresh) {
          projects = cachedProjects;
        } else {
          const result = await client.request<{ data: { id: string; title: string; status: string }[] }>({
            endpoint: "projects-v2/projects.list",
            body: { filter: { customers: [{ type: "company", id: companyId }] }, page: { size: 50, number: 1 } },
          });
          projects = (result.data ?? []).map(p => ({ ...p, company_id: companyId! }));
          upsertProjects(projects);
        }
        const relevantProjects = projects.filter(p => p.status !== "cancelled");

        const treeProjects: TaskTreeProject[] = [];
        const allProjectTaskIds = new Set<string>();

        for (const proj of relevantProjects) {
          let groups: { id: string; title: string }[];
          const cachedGroups = getGroupsForProject(proj.id);
          if (cachedGroups && !params.force_refresh) {
            groups = cachedGroups;
          } else {
            const r = await client.request<{ data: { id: string; title: string }[] }>({
              endpoint: "projects-v2/projectGroups.list",
              body: { filter: { project_id: proj.id }, page: { size: 100, number: 1 } },
            });
            groups = r.data ?? [];
            if (groups.length) upsertGroups(groups.map(g => ({ ...g, project_id: proj.id })));
          }

          const linesResult = await client.request<{ data: ProjectLineEntry[] }>({
            endpoint: "projects-v2/projectLines.list",
            body: { project_id: proj.id, filter: { types: ["nextgenTask"] }, page: { size: 500, number: 1 } },
          });
          const allLineIds = (linesResult.data ?? [])
            .filter(l => l.line?.type === "nextgenTask")
            .map(l => ({ lineId: l.line?.id as string, groupId: l.group?.id as string | undefined }))
            .filter(l => l.lineId);

          const tasksById = new Map<string, { id: string; title: string; status: string; work_type_id?: string }>();
          for (let i = 0; i < allLineIds.length; i += 100) {
            const batch = allLineIds.slice(i, i + 100).map(l => l.lineId);
            const tasksResult = await client.request<{ data: { id: string; title: string; status?: string; work_type?: { id: string } }[] }>({
              endpoint: "projects-v2/tasks.list",
              body: { filter: { ids: batch }, page: { size: 100, number: 1 } },
            });
            for (const t of tasksResult.data ?? []) {
              tasksById.set(t.id, { id: t.id, title: t.title, status: t.status ?? "to_do", work_type_id: t.work_type?.id });
              allProjectTaskIds.add(t.id);
            }
          }

          const groupTasksMap = new Map<string, TaskTreeTask[]>();
          const ungrouped: TaskTreeTask[] = [];

          for (const { lineId, groupId } of allLineIds) {
            const task = tasksById.get(lineId);
            if (!task) continue;
            const treeTask: TaskTreeTask = { id: task.id, title: task.title, status: task.status, task_type: "project_task", ...(task.work_type_id ? { work_type_id: task.work_type_id } : {}) };
            if (groupId) {
              if (!groupTasksMap.has(groupId)) groupTasksMap.set(groupId, []);
              groupTasksMap.get(groupId)!.push(treeTask);
            } else {
              ungrouped.push(treeTask);
            }
          }

          const treeGroups: TaskTreeGroup[] = groups
            .filter(g => groupTasksMap.has(g.id))
            .map(g => ({ id: g.id, title: g.title, tasks: groupTasksMap.get(g.id)! }));

          if (treeGroups.length || ungrouped.length) {
            treeProjects.push({ id: proj.id, title: proj.title, groups: treeGroups, ungrouped });
          }
        }

        // ── Fetch standalone tasks linked to these projects ──────────────
        try {
          const projectIdSet = new Set(treeProjects.map(p => p.id));
          const standaloneResult = await client.request<{ data: { id: string; title: string; completed: boolean; project?: { id: string }; work_type?: { id: string } }[] }>({
            endpoint: "tasks.list",
            body: {
              filter: { customer: { type: "company", id: companyId }, completed: false },
              page: { size: 100, number: 1 },
            },
          });
          const standaloneTasks = (standaloneResult.data ?? []).filter(t => t.project && projectIdSet.has(t.project.id));
          for (const st of standaloneTasks) {
            // Skip if this task is already in the project task tree (avoid duplicates)
            if (allProjectTaskIds.has(st.id)) continue;
            const proj = treeProjects.find(p => p.id === st.project!.id);
            if (!proj) continue;
            proj.ungrouped.push({
              id: st.id,
              title: st.title,
              status: st.completed ? "done" : "to_do",
              task_type: "standalone_task",
              ...(st.work_type?.id ? { work_type_id: st.work_type.id } : {}),
            });
          }
        } catch (e) {
          console.warn("Warning: could not fetch standalone tasks for project linking:", e);
        }

        tree = { company_id: companyId, company_name: companyName, loaded_at: new Date().toISOString(), projects: treeProjects };
        setTaskTree(tree);
      }

      // ── Apply filters ─────────────────────────────────────────────────────
      const filterTask = (t: TaskTreeTask) => onlyOpen ? openStatuses.has(t.status) : true;

      let filteredProjects = tree.projects.map(p => ({
        ...p,
        groups: p.groups.map(g => ({ ...g, tasks: g.tasks.filter(filterTask) })).filter(g => g.tasks.length),
        ungrouped: p.ungrouped.filter(filterTask),
      })).filter(p => p.groups.length || p.ungrouped.length);

      if (params.project_filter) {
        const pf = params.project_filter.toLowerCase();
        filteredProjects = filteredProjects.filter(p => p.title.toLowerCase().includes(pf));
      }
      if (params.group_filter) {
        const gf = params.group_filter.toLowerCase();
        filteredProjects = filteredProjects
          .map(p => ({ ...p, groups: p.groups.filter(g => g.title.toLowerCase().includes(gf)) }))
          .filter(p => p.groups.length || p.ungrouped.length);
      }

      if (!filteredProjects.length) return respond(`No tasks found for ${companyName}.`);

      // ── task_selection: read from YAML file (matches numbering from last visual/write) ──
      if (params.task_selection) {
        const yamlTasks = readTasksFromYaml(companyName);
        const sel = yamlTasks.get(params.task_selection);
        if (!sel) {
          // Fallback: build flat list from current filtered projects
          const flat: Array<{ task: TaskTreeTask; project: TaskTreeProject; group?: TaskTreeGroup }> = [];
          for (const proj of filteredProjects) {
            for (const group of proj.groups)
              for (const task of group.tasks) flat.push({ project: proj, group, task });
            for (const task of proj.ungrouped) flat.push({ project: proj, task });
          }
          const fallback = flat[params.task_selection - 1];
          if (!fallback) return respond(`Invalid selection ${params.task_selection}. YAML file has ${yamlTasks.size} tasks. Re-run load_tasks with visual=true first.`);
          // Use fallback
          upsertTask({
            task_id: fallback.task.id,
            task_title: fallback.task.title,
            subject_type: fallback.task.task_type === "standalone_task" ? "todo" : "nextgenTask",
            project_id: fallback.project.id,
            project_title: fallback.project.title,
            group_id: fallback.group?.id,
            group_title: fallback.group?.title,
            company_id: companyId!,
            company_name: companyName,
            work_type_id: fallback.task.work_type_id ?? getDefaultWorkTypeId() ?? getWorkTypes()?.[0]?.id,
            last_used: new Date().toISOString(),
          });
          const path = [companyName, fallback.project.title, fallback.group?.title, fallback.task.title].filter(Boolean).join(" > ");
          return respond(`Task cached (fallback):\n${path}\nID: ${fallback.task.id}`);
        }
        upsertTask({
          task_id: sel.id,
          task_title: sel.title,
          subject_type: sel.task_type === "standalone_task" ? "todo" : "nextgenTask",
          project_id: sel.project_id,
          project_title: sel.project_title,
          group_id: sel.group_id,
          group_title: sel.group_title,
          company_id: companyId!,
          company_name: companyName,
          work_type_id: getDefaultWorkTypeId() ?? getWorkTypes()?.[0]?.id,
          last_used: new Date().toISOString(),
        });
        const path = [companyName, sel.project_title, sel.group_title, sel.title].filter(Boolean).join(" > ");
        return respond(`Task cached:\n${path}\nID: ${sel.id}`);
      }

      // ── Write YAML to file ────────────────────────────────────────────────
      const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const filePath = join(homedir(), `.teamleader-tasks-${slug}.yaml`);

      const yamlLines: string[] = [
        `company: ${yamlStr(companyName)}`,
        `company_id: ${companyId}`,
        `loaded_at: ${tree.loaded_at}`,
        `only_open: ${onlyOpen}`,
        `projects:`,
      ];
      let totalTasks = 0;
      let n = 0;
      for (const proj of filteredProjects) {
        yamlLines.push(`  - id: ${proj.id}`);
        yamlLines.push(`    title: ${yamlStr(proj.title)}`);
        if (proj.groups.length) {
          yamlLines.push(`    groups:`);
          for (const group of proj.groups) {
            yamlLines.push(`      - id: ${group.id}`);
            yamlLines.push(`        title: ${yamlStr(group.title)}`);
            if (group.tasks.length) {
              yamlLines.push(`        tasks:`);
              for (const task of group.tasks) {
                n++;
                totalTasks++;
                yamlLines.push(`          - n: ${n}`);
                yamlLines.push(`            id: ${task.id}`);
                yamlLines.push(`            title: ${yamlStr(task.title)}`);
                yamlLines.push(`            status: ${task.status}`);
                yamlLines.push(`            task_type: ${task.task_type ?? "project_task"}`);
              }
            }
          }
        }
        if (proj.ungrouped.length) {
          yamlLines.push(`    ungrouped:`);
          for (const task of proj.ungrouped) {
            n++;
            totalTasks++;
            yamlLines.push(`      - n: ${n}`);
            yamlLines.push(`        id: ${task.id}`);
            yamlLines.push(`        title: ${yamlStr(task.title)}`);
            yamlLines.push(`        status: ${task.status}`);
            yamlLines.push(`        task_type: ${task.task_type ?? "project_task"}`);
          }
        }
      }

      try {
        writeFileSync(filePath, yamlLines.join("\n") + "\n");
      } catch (e) {
        console.warn("Warning: could not write task file", e);
      }

      // ── visual=true: ASCII tree ───────────────────────────────────────────
      if (params.visual) {
        const treeLines: string[] = [`${companyName}\n`];
        let idx = 0;
        for (const proj of filteredProjects) {
          treeLines.push(`└── ${proj.title}`);
          const allGroups = proj.groups;
          for (let gi = 0; gi < allGroups.length; gi++) {
            const group = allGroups[gi];
            const isLastGroup = gi === allGroups.length - 1 && !proj.ungrouped.length;
            treeLines.push(`    ${isLastGroup ? "└" : "├"}── ${group.title}`);
            for (let ti = 0; ti < group.tasks.length; ti++) {
              const task = group.tasks[ti];
              idx++;
              const icon = task.status === "in_progress" ? ">" : task.status === "on_hold" ? "||" : task.status === "done" ? "x" : task.status === "cancelled" ? "-" : "o";
              const standalone = task.task_type === "standalone_task" ? " [S]" : "";
              treeLines.push(`    │    ${idx}. [${icon}] ${task.title}${standalone}`);
            }
          }
          if (proj.ungrouped.length) {
            treeLines.push(`    └── [no group]`);
            for (const task of proj.ungrouped) {
              idx++;
              const icon = task.status === "in_progress" ? ">" : task.status === "on_hold" ? "||" : task.status === "done" ? "x" : task.status === "cancelled" ? "-" : "o";
              const standalone = task.task_type === "standalone_task" ? " [S]" : "";
              treeLines.push(`         ${idx}. [${icon}] ${task.title}${standalone}`);
            }
          }
        }
        treeLines.push(`\nLegend: > in_progress  || on_hold  o to_do  x done  - cancelled  [S] standalone task`);
        treeLines.push(`Select: task_selection=N  (_company_id="${companyId}")`);
        return respond(treeLines.join("\n"));
      }

      // ── Default: summary ──────────────────────────────────────────────────
      const groupCount = filteredProjects.reduce((s, p) => s + p.groups.length, 0);
      return respond([
        `Task tree loaded: ${companyName}`,
        `- ${filteredProjects.length} project(s) | ${groupCount} group(s) | ${totalTasks} task(s)`,
        `- only_open: ${onlyOpen}`,
        `- File: ${filePath}`,
        ``,
        `Use:`,
        `- log_time(task_id="...", ...)        → ID from YAML, register directly`,
        `- visual=true                          → show ASCII tree`,
        `- task_selection=N (+ visual=true)     → cache task for log_time`,
        `- task_action(action=close, ...)       → close task`,
        `- task_action(action=delete_group, group_id="...") → delete group (ID from YAML)`,
        `- force_refresh=true                   → reload from API`,
      ].join("\n"));
    }
  );

  // ── Task Action (close / create / move_time / delete_group / move_to_group) ──
  server.tool(
    "teamleader_task_action",
    [
      "Maintenance actions on tasks. Requires teamleader_load_tasks to have been called first (for task_number resolution).",
      "Actions and required params:",
      "  close         : mark task as done (handles both project tasks and standalone tasks). Requires: task_id or task_number.",
      "  create        : create new task. Requires: project_id, group_id, task_title. Optional: description.",
      "  update        : update task title/description/status. Requires: task_id or task_number. Optional: task_title, description.",
      "  move_time     : move time entry to different task. Requires: time_entry_id + (new_task_id or new_task_number).",
      "  delete_group  : delete a project group/phase. Requires: group_id (get from load_tasks YAML). CRITICAL: API requires delete_strategy. ERROR: 400 on projectGroups.delete → CAUSE: Missing delete_strategy → FIX: Use task_action(delete_group) — it always provides the strategy automatically.",
      "  move_to_group : move task to different group. Requires: task_id or task_number + group_id.",
      "Returns confirmation message. All IDs should come from the YAML file written by teamleader_load_tasks.",
    ].join("\n"),
    {
      action: z.enum(["close", "create", "update", "move_time", "delete_group", "move_to_group"]).describe("Action to perform (see tool description for required params per action)"),
      // Shared
      company_name: z.string().describe("Company name (partial match, used to resolve cached task tree)"),
      task_number: z.number().optional().describe("Task number from the numbered list in teamleader_load_tasks output (1-based)"),
      task_id: z.string().optional().describe("Direct task ID (alternative to task_number — get from load_tasks YAML file)"),
      // create
      project_id: z.string().optional().describe("Project ID for new task (required for 'create' action — get from load_tasks YAML)"),
      group_id: z.string().optional().describe("Group ID: for 'create' = parent group; for 'delete_group' = group to delete; for 'move_to_group' = target group. Get from load_tasks YAML."),
      task_title: z.string().optional().describe("Title for new or updated task (required for 'create', optional for 'update')"),
      description: z.string().optional().describe("Task description (for 'create' or 'update' actions)"),
      // move_time
      time_entry_id: z.string().optional().describe("Time entry ID to move (required for 'move_time' action)"),
      new_task_number: z.number().optional().describe("Target task number for move_time (from load_tasks numbered list)"),
      new_task_id: z.string().optional().describe("Target task ID for move_time (alternative to new_task_number)"),
      // internal
      _company_id: z.string().optional().describe("Internal: pre-resolved company ID (skip company lookup)"),
    },
    async (params) => {
      // Resolve company
      let companyId = params._company_id;
      let companyName = params.company_name;
      if (!companyId) {
        const co = getCompany(params.company_name);
        if (co) { companyId = co.id; companyName = co.name; }
        else {
          const result = await client.request<{ data: { id: string; name: string }[] }>({
            endpoint: "companies.list",
            body: { filter: { term: params.company_name }, page: { size: 10, number: 1 } },
          });
          const companies = result.data ?? [];
          if (!companies.length) return respond(`Company "${params.company_name}" not found.`);
          if (companies.length > 1) return respond(`Multiple companies found:\n${numbered(companies, c => c.name)}`);
          companyId = companies[0].id;
          companyName = companies[0].name;
          upsertCompany({ id: companyId, name: companyName });
        }
      }

      // Helper: resolve task from YAML file by number (matches numbering from last load_tasks output)
      const resolveTaskByNumber = (n: number) => {
        const yamlTasks = readTasksFromYaml(companyName);
        const sel = yamlTasks.get(n);
        if (sel) {
          return {
            project: { id: sel.project_id, title: sel.project_title } as TaskTreeProject,
            group: sel.group_id ? { id: sel.group_id, title: sel.group_title ?? "" } as TaskTreeGroup : undefined,
            task: { id: sel.id, title: sel.title, status: "to_do", task_type: sel.task_type } as TaskTreeTask,
          };
        }
        // Fallback: read from tree cache (backwards compat if no YAML file)
        const tree = getTaskTree(companyId!);
        if (!tree) return null;
        const open = new Set(["to_do", "in_progress", "on_hold"]);
        const flat: Array<{ project: TaskTreeProject; group?: TaskTreeGroup; task: TaskTreeTask }> = [];
        for (const proj of tree.projects) {
          for (const group of proj.groups)
            for (const task of group.tasks)
              if (open.has(task.status)) flat.push({ project: proj, group, task });
          for (const task of proj.ungrouped)
            if (open.has(task.status)) flat.push({ project: proj, task });
        }
        return flat[n - 1] ?? null;
      };

      // ── close ─────────────────────────────────────────────────────────────
      if (params.action === "close") {
        const resolved = params.task_number ? resolveTaskByNumber(params.task_number) : undefined;
        const taskId = params.task_id ?? resolved?.task.id;
        if (!taskId) return respond(`Provide task_id or task_number.`);

        // Determine task type: from tree resolution, or look up in tree by ID
        let taskType = resolved?.task.task_type;
        if (!taskType && params.task_id) {
          const tree = getTaskTree(companyId);
          if (tree) {
            for (const proj of tree.projects) {
              const found = [...proj.ungrouped, ...proj.groups.flatMap(g => g.tasks)].find(t => t.id === params.task_id);
              if (found) { taskType = found.task_type; break; }
            }
          }
        }

        if (taskType === "standalone_task") {
          await client.request({ endpoint: "tasks.complete", body: { id: taskId } });
        } else {
          await client.request({ endpoint: "projects-v2/tasks.update", body: { id: taskId, status: "done" } });
        }

        // Remove from tree cache
        const tree = getTaskTree(companyId);
        if (tree) {
          for (const proj of tree.projects) {
            for (const group of proj.groups) group.tasks = group.tasks.filter(t => t.id !== taskId);
            proj.ungrouped = proj.ungrouped.filter(t => t.id !== taskId);
          }
          setTaskTree(tree);
        }
        return respond(`✅ Task ${taskId} closed (${taskType === "standalone_task" ? "standalone" : "project"} task, status: done).`);
      }

      // ── update ────────────────────────────────────────────────────────────
      if (params.action === "update") {
        const taskId = params.task_id ?? (params.task_number ? resolveTaskByNumber(params.task_number)?.task.id : undefined);
        if (!taskId) return respond(`Provide task_id or task_number for update.`);
        const body: Record<string, unknown> = { id: taskId };
        if (params.task_title) body.title = params.task_title;
        if (params.description !== undefined) body.description = params.description;
        await client.request({ endpoint: "projects-v2/tasks.update", body });
        return respond(`✅ Task ${taskId} updated.`);
      }

      // ── create ────────────────────────────────────────────────────────────
      if (params.action === "create") {
        if (!params.task_title) return respond(`task_title required for create.`);
        if (!params.project_id) return respond(`project_id required for create. Use teamleader_load_tasks to see IDs.`);
        const user = getActiveUser();
        const workTypeId = getDefaultWorkTypeId() ?? getWorkTypes()?.[0]?.id;
        const body: Record<string, unknown> = {
          title: params.task_title,
          project_id: params.project_id,
        };
        if (params.group_id) body.group_id = params.group_id;
        if (workTypeId) body.work_type_id = workTypeId;
        if (user?.id) body.assignees = [{ type: "user", id: user.id }];
        if (params.description) body.description = params.description;

        const created = await client.request<{ data: { id: string } }>({
          endpoint: "projects-v2/tasks.create",
          body,
        });
        // Invalidate tree cache so next load_tasks refreshes
        invalidateTaskTree(companyId!);

        return respond(`✅ Task created:\nTitle : ${params.task_title}\nID    : ${created.data.id}\n\nReload tree: teamleader_load_tasks(company_name="${companyName}", force_refresh=true)`);
      }

      // ── move_time ─────────────────────────────────────────────────────────
      if (params.action === "move_time") {
        if (!params.time_entry_id) return respond(`time_entry_id required for move_time.`);
        const newTaskId = params.new_task_id ?? (params.new_task_number ? resolveTaskByNumber(params.new_task_number)?.task.id : undefined);
        if (!newTaskId) return respond(`Provide new_task_id or new_task_number.`);

        // Fetch existing entry
        const existing = await client.request<{ data: { started_at: string; ended_at: string; work_type?: { id: string }; description?: string; user?: { id: string } } }>({
          endpoint: "timeTracking.info",
          body: { id: params.time_entry_id },
        });
        const entry = existing.data;
        const userId = entry.user?.id ?? getActiveUser()?.id;
        const workTypeId = entry.work_type?.id ?? getDefaultWorkTypeId() ?? getWorkTypes()?.[0]?.id;

        // Delete old entry
        await client.request({ endpoint: "timeTracking.delete", body: { id: params.time_entry_id } });

        // Create new entry on new task
        let newEntry;
        try {
          newEntry = await client.request<{ data: { id: string } }>({
            endpoint: "timeTracking.add",
            body: {
              user_id: userId,
              work_type_id: workTypeId,
              started_at: entry.started_at,
              ended_at: entry.ended_at,
              subject: { type: "nextgenTask", id: newTaskId },
              ...(entry.description ? { description: entry.description } : {}),
            },
          });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          if (msg.includes("Invalid subject")) {
            return respond(
              "Error: Invalid task ID — the subject could not be found in Teamleader.\n" +
              `Task ID used: ${newTaskId}\n` +
              "WARNING: The original entry was already deleted. Re-create it manually.\n" +
              "Use teamleader_load_tasks to get the correct task_id."
            );
          }
          throw err;
        }

        return respond(
          `✅ Time moved:\nFrom entry : ${params.time_entry_id}\nTo task    : ${newTaskId}\nNew entry  : ${newEntry.data.id}`
        );
      }

      // ── delete_group ──────────────────────────────────────────────────────
      if (params.action === "delete_group") {
        if (!params.group_id) return respond(`group_id required for delete_group.`);
        await client.request({ endpoint: "projects-v2/projectGroups.delete", body: { id: params.group_id, delete_strategy: "ungroup_tasks_and_materials" } });
        invalidateTaskTree(companyId!);
        return respond(`✅ Group ${params.group_id} deleted.\n\nReload tree: teamleader_load_tasks(company_name="${companyName}", force_refresh=true)`);
      }

      // ── move_to_group ────────────────────────────────────────────────────
      if (params.action === "move_to_group") {
        const taskId = params.task_id ?? (params.task_number ? resolveTaskByNumber(params.task_number)?.task.id : undefined);
        if (!taskId) return respond(`Provide task_id or task_number for move_to_group.`);
        if (!params.group_id) return respond(`group_id required for move_to_group.`);
        // Step 1: remove from current group (no-op if ungrouped)
        try {
          await client.request({ endpoint: "projects-v2/projectLines.removeFromGroup", body: { line_id: taskId } });
        } catch { /* task may not be in a group yet — ignore */ }
        // Step 2: add to target group
        await client.request({ endpoint: "projects-v2/projectLines.addToGroup", body: { line_id: taskId, group_id: params.group_id } });
        invalidateTaskTree(companyId!);
        return respond(`✅ Task ${taskId} moved to group ${params.group_id}.\n\nReload tree: teamleader_load_tasks(company_name="${companyName}", force_refresh=true)`);
      }

      return respond(`Unknown action: ${params.action}`);
    }
  );

  // ── Cache Management ───────────────────────────────────────────────────────
  server.tool(
    "teamleader_cache_stats",
    "Show cache statistics including entry counts, TTL status, and cached tasks. Use to debug cache issues or verify what data is cached. Returns text summary with counts and optional task list.",
    {
      company_filter: z.string().optional().describe("Filter cached tasks by company name (partial match)"),
    },
    async (params) => {
      const stats = getCacheStats();
      const tasks = listTasks(params.company_filter);
      const taskList = tasks.length
        ? `\nCached tasks:\n${tasks.map(t => `- ${t.path}`).join("\n")}`
        : "\nNo tasks in cache.";
      return respond(`Cache status:\n${stats}${taskList}`);
    }
  );

  server.tool(
    "teamleader_clear_cache",
    "Clear the entire local cache (~/.teamleader-cache.json). Forces fresh API lookups on next call. Use when data seems stale or after bulk changes. Does NOT delete YAML task files.",
    {},
    async () => {
      clearCache();
      return respond("✅ Cache cleared.");
    }
  );
}
