/**
 * Teamleader MCP Cache
 *
 * Stores resolved entity hierarchies to avoid repeated API lookups.
 * Paths are first-class so LLMs can search without knowing IDs.
 *
 * File: ~/.teamleader-cache.json
 *
 * TTL strategy:
 *   active_user  : no expiry  (manual clear only)
 *   work_types   : 7 days
 *   companies    : 24 hours
 *   projects     : 2 hours
 *   groups       : 1 hour
 *   tasks        : 1 hour
 */

import { readFileSync, writeFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";

const CACHE_FILE = join(homedir(), ".teamleader-cache.json");

const TTL = {
  work_types: 7 * 24 * 60 * 60 * 1000,
  companies:      24 * 60 * 60 * 1000,
  projects:        2 * 60 * 60 * 1000,
  groups:          1 * 60 * 60 * 1000,
  tasks:           1 * 60 * 60 * 1000,
  task_trees:     30 * 60 * 1000,
  resolve:        24 * 60 * 60 * 1000,
};

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CachedUser {
  id: string;
  name: string;
}

export interface CachedWorkType {
  id: string;
  name: string;
  cached_at: string;
}

export interface CachedCompany {
  id: string;
  name: string;
  cached_at: string;
}

export interface CachedProject {
  id: string;
  title: string;
  company_id: string;
  status: string;
  cached_at: string;
}

export interface CachedGroup {
  id: string;
  title: string;
  project_id: string;
  cached_at: string;
}

// ── Task Tree ─────────────────────────────────────────────────────────────────

export interface TaskTreeTask {
  id: string;
  title: string;
  status: "to_do" | "in_progress" | "on_hold" | "done" | string;
  work_type_id?: string;
  /** "project_task" = projects-v2 task, "standalone_task" = tasks.* linked to project */
  task_type?: "project_task" | "standalone_task";
}

export interface TaskTreeGroup {
  id: string;
  title: string;
  tasks: TaskTreeTask[];
}

export interface TaskTreeProject {
  id: string;
  title: string;
  groups: TaskTreeGroup[];
  /** Tasks directly on project, no group */
  ungrouped: TaskTreeTask[];
}

export interface TaskTree {
  company_id: string;
  company_name: string;
  loaded_at: string;
  projects: TaskTreeProject[];
}

export interface CachedTask {
  task_id: string;
  task_title: string;
  subject_type: "nextgenTask" | "todo";
  project_id: string;
  project_title: string;
  group_id?: string;
  group_title?: string;
  company_id: string;
  company_name: string;
  work_type_id?: string;
  /** Human-readable path: "Company > Project > Group > Task" */
  path: string;
  last_used: string;
  cached_at: string;
}

// ── Resolve Cache Types ──────────────────────────────────────────────────────

export interface ResolvedGroupEntry { title: string; cachedAt: number; }
export interface ResolvedProjectEntry { title: string; customers: Array<{ type: string; id: string }>; cachedAt: number; }
export interface ResolvedCustomerEntry { name: string; cachedAt: number; }
export interface ResolvedUserEntry { name: string; cachedAt: number; }

interface Cache {
  active_user?: CachedUser;
  default_work_type_id?: string;
  work_types?: CachedWorkType[];
  companies?: CachedCompany[];
  projects?: CachedProject[];
  groups?: CachedGroup[];
  tasks?: CachedTask[];
  task_trees?: TaskTree[];
  resolvedGroups?: Record<string, ResolvedGroupEntry>;
  resolvedProjects?: Record<string, ResolvedProjectEntry>;
  resolvedCustomers?: Record<string, ResolvedCustomerEntry>;
  resolvedUsers?: Record<string, ResolvedUserEntry>;
}

// ── Internal ──────────────────────────────────────────────────────────────────

function load(): Cache {
  try {
    return JSON.parse(readFileSync(CACHE_FILE, "utf-8"));
  } catch (e) {
    console.warn("Cache file not found or invalid, starting fresh:", e);
    return {};
  }
}

function save(cache: Cache): void {
  try {
    // Prune expired entries before writing
    if (cache.tasks) cache.tasks = cache.tasks.filter(t => !isExpired(t.cached_at, TTL.tasks));
    if (cache.groups) cache.groups = cache.groups.filter(g => !isExpired(g.cached_at, TTL.groups));
    if (cache.projects) cache.projects = cache.projects.filter(p => !isExpired(p.cached_at, TTL.projects));
    if (cache.companies) cache.companies = cache.companies.filter(c => !isExpired(c.cached_at, TTL.companies));
    if (cache.task_trees) cache.task_trees = cache.task_trees.filter(t => !isExpired(t.loaded_at, TTL.task_trees));
    // Prune resolve caches
    const pruneResolveMap = <T extends { cachedAt: number }>(map: Record<string, T> | undefined): Record<string, T> | undefined => {
      if (!map) return undefined;
      const pruned: Record<string, T> = {};
      for (const [k, v] of Object.entries(map)) {
        if (Date.now() - v.cachedAt <= TTL.resolve) pruned[k] = v;
      }
      return Object.keys(pruned).length ? pruned : undefined;
    };
    cache.resolvedGroups = pruneResolveMap(cache.resolvedGroups);
    cache.resolvedProjects = pruneResolveMap(cache.resolvedProjects);
    cache.resolvedCustomers = pruneResolveMap(cache.resolvedCustomers);
    cache.resolvedUsers = pruneResolveMap(cache.resolvedUsers);
    writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
  } catch (e) {
    console.warn("Warning: could not save cache", e);
  }
}

function isExpired(cached_at: string, ttlMs: number): boolean {
  return Date.now() - new Date(cached_at).getTime() > ttlMs;
}

function now(): string {
  return new Date().toISOString();
}

// ── Active User ───────────────────────────────────────────────────────────────

export function getActiveUser(): CachedUser | undefined {
  return load().active_user;
}

export function setActiveUser(user: CachedUser): void {
  const cache = load();
  cache.active_user = user;
  save(cache);
}

// ── Default Work Type ─────────────────────────────────────────────────────────

export function getDefaultWorkTypeId(): string | undefined {
  return load().default_work_type_id;
}

export function setDefaultWorkTypeId(id: string): void {
  const cache = load();
  cache.default_work_type_id = id;
  save(cache);
}

// ── Work Types ────────────────────────────────────────────────────────────────

export function getWorkTypes(): CachedWorkType[] | undefined {
  const cache = load();
  if (!cache.work_types?.length) return undefined;
  if (isExpired(cache.work_types[0].cached_at, TTL.work_types)) return undefined;
  return cache.work_types;
}

export function setWorkTypes(types: Omit<CachedWorkType, "cached_at">[]): void {
  const cache = load();
  cache.work_types = types.map((t) => ({ ...t, cached_at: now() }));
  save(cache);
}

// ── Companies ─────────────────────────────────────────────────────────────────

export function getCompany(term: string): CachedCompany | undefined {
  const cache = load();
  const lower = term.toLowerCase();
  return cache.companies?.find(
    (c) => c.name.toLowerCase().includes(lower) && !isExpired(c.cached_at, TTL.companies)
  );
}

export function upsertCompany(company: Omit<CachedCompany, "cached_at">): void {
  const cache = load();
  cache.companies = cache.companies ?? [];
  const idx = cache.companies.findIndex((c) => c.id === company.id);
  const entry = { ...company, cached_at: now() };
  if (idx >= 0) cache.companies[idx] = entry;
  else cache.companies.push(entry);
  save(cache);
}

// ── Projects ──────────────────────────────────────────────────────────────────

export function getProjectsForCompany(company_id: string): CachedProject[] | undefined {
  const cache = load();
  const projects = cache.projects?.filter(
    (p) => p.company_id === company_id && !isExpired(p.cached_at, TTL.projects)
  );
  return projects?.length ? projects : undefined;
}

export function upsertProjects(projects: Omit<CachedProject, "cached_at">[]): void {
  const cache = load();
  cache.projects = cache.projects ?? [];
  for (const p of projects) {
    const idx = cache.projects.findIndex((x) => x.id === p.id);
    const entry = { ...p, cached_at: now() };
    if (idx >= 0) cache.projects[idx] = entry;
    else cache.projects.push(entry);
  }
  save(cache);
}

// ── Groups ────────────────────────────────────────────────────────────────────

export function getGroupsForProject(project_id: string): CachedGroup[] | undefined {
  const cache = load();
  const groups = cache.groups?.filter(
    (g) => g.project_id === project_id && !isExpired(g.cached_at, TTL.groups)
  );
  return groups?.length ? groups : undefined;
}

export function upsertGroups(groups: Omit<CachedGroup, "cached_at">[]): void {
  const cache = load();
  cache.groups = cache.groups ?? [];
  for (const g of groups) {
    const idx = cache.groups.findIndex((x) => x.id === g.id);
    const entry = { ...g, cached_at: now() };
    if (idx >= 0) cache.groups[idx] = entry;
    else cache.groups.push(entry);
  }
  save(cache);
}

// ── Tasks ─────────────────────────────────────────────────────────────────────

export function findTask(company: string, task: string): CachedTask | undefined {
  const cache = load();
  const cl = company.toLowerCase();
  const tl = task.toLowerCase();
  const matches = (cache.tasks ?? []).filter(
    (t) =>
      t.path.toLowerCase().includes(cl) &&
      t.path.toLowerCase().includes(tl) &&
      !isExpired(t.cached_at, TTL.tasks)
  );
  // Most recently used wins
  return matches.sort((a, b) => new Date(b.last_used).getTime() - new Date(a.last_used).getTime())[0];
}

export function searchTasks(term: string): CachedTask[] {
  const cache = load();
  const lower = term.toLowerCase();
  return (cache.tasks ?? []).filter(
    (t) => t.path.toLowerCase().includes(lower) && !isExpired(t.cached_at, TTL.tasks)
  );
}

export function upsertTask(task: Omit<CachedTask, "cached_at" | "path"> & { path?: string }): void {
  const cache = load();
  cache.tasks = cache.tasks ?? [];
  const path =
    task.path ??
    [task.company_name, task.project_title, task.group_title, task.task_title]
      .filter(Boolean)
      .join(" > ");
  const entry: CachedTask = { ...task, path, cached_at: now() };
  const idx = cache.tasks.findIndex((t) => t.task_id === task.task_id);
  if (idx >= 0) cache.tasks[idx] = entry;
  else cache.tasks.push(entry);
  save(cache);
}

export function listTasks(companyFilter?: string): CachedTask[] {
  const cache = load();
  const tasks = cache.tasks ?? [];
  if (!companyFilter) return tasks;
  const lower = companyFilter.toLowerCase();
  return tasks.filter((t) => t.company_name.toLowerCase().includes(lower));
}

// ── Task Trees ────────────────────────────────────────────────────────────────

export function getTaskTree(company_id: string): TaskTree | undefined {
  const cache = load();
  const tree = cache.task_trees?.find((t) => t.company_id === company_id);
  if (!tree) return undefined;
  if (isExpired(tree.loaded_at, TTL.task_trees)) return undefined;
  return tree;
}

export function invalidateTaskTree(company_id: string): void {
  const cache = load();
  if (cache.task_trees) cache.task_trees = cache.task_trees.filter((t) => t.company_id !== company_id);
  save(cache);
}

export function setTaskTree(tree: Omit<TaskTree, "loaded_at">): void {
  const cache = load();
  cache.task_trees = cache.task_trees ?? [];
  const idx = cache.task_trees.findIndex((t) => t.company_id === tree.company_id);
  const entry: TaskTree = { ...tree, loaded_at: now() };
  if (idx >= 0) cache.task_trees[idx] = entry;
  else cache.task_trees.push(entry);
  save(cache);
}

/** Find task in tree by partial name match. Returns [project, group|undefined, task]. */
export function findInTree(
  company_id: string,
  task_name: string,
  group_name?: string
): Array<{ project: TaskTreeProject; group?: TaskTreeGroup; task: TaskTreeTask }> {
  const cache = load();
  const tree = cache.task_trees?.find((t) => t.company_id === company_id);
  if (!tree || isExpired(tree.loaded_at, TTL.task_trees)) return [];

  const tl = task_name.toLowerCase();
  const gl = group_name?.toLowerCase();
  const results: Array<{ project: TaskTreeProject; group?: TaskTreeGroup; task: TaskTreeTask }> = [];

  for (const project of tree.projects) {
    for (const group of project.groups) {
      if (gl && !group.title.toLowerCase().includes(gl)) continue;
      for (const task of group.tasks) {
        if (task.title.toLowerCase().includes(tl)) results.push({ project, group, task });
      }
    }
    if (!gl) {
      for (const task of project.ungrouped) {
        if (task.title.toLowerCase().includes(tl)) results.push({ project, task });
      }
    }
  }

  return results;
}

export interface ScoredTaskMatch {
  project: TaskTreeProject;
  group?: TaskTreeGroup;
  task: TaskTreeTask;
  score: number;
}

/**
 * Score all tasks in tree against a natural language description.
 * Scoring: task title word match = 3pts, group = 1pt, project = 0.5pt.
 * Words shorter than 3 chars are ignored.
 */
export function scoreTasksInTree(company_id: string, description: string): ScoredTaskMatch[] {
  const cache = load();
  const tree = cache.task_trees?.find((t) => t.company_id === company_id);
  if (!tree || isExpired(tree.loaded_at, TTL.task_trees)) return [];

  const words = description.toLowerCase().split(/[\s\-_,.:;/]+/).filter((w) => w.length >= 3);
  if (!words.length) return [];

  const results: ScoredTaskMatch[] = [];

  for (const project of tree.projects) {
    const projLower = project.title.toLowerCase();
    for (const group of project.groups) {
      const groupLower = group.title.toLowerCase();
      for (const task of group.tasks) {
        const taskLower = task.title.toLowerCase();
        let score = 0;
        for (const w of words) {
          if (taskLower.includes(w)) score += 3;
          if (groupLower.includes(w)) score += 1;
          if (projLower.includes(w)) score += 0.5;
        }
        if (score > 0) results.push({ project, group, task, score });
      }
    }
    for (const task of project.ungrouped) {
      const taskLower = task.title.toLowerCase();
      const projLower = project.title.toLowerCase();
      let score = 0;
      for (const w of words) {
        if (taskLower.includes(w)) score += 3;
        if (projLower.includes(w)) score += 0.5;
      }
      if (score > 0) results.push({ project, task, score });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

// ── Resolve Cache CRUD ───────────────────────────────────────────────────────

export function getResolvedGroup(id: string): ResolvedGroupEntry | undefined {
  const cache = load();
  const entry = cache.resolvedGroups?.[id];
  if (!entry || Date.now() - entry.cachedAt > TTL.resolve) return undefined;
  return entry;
}

export function setResolvedGroup(id: string, title: string): void {
  const cache = load();
  cache.resolvedGroups = cache.resolvedGroups ?? {};
  cache.resolvedGroups[id] = { title, cachedAt: Date.now() };
  save(cache);
}

export function getResolvedProject(id: string): ResolvedProjectEntry | undefined {
  const cache = load();
  const entry = cache.resolvedProjects?.[id];
  if (!entry || Date.now() - entry.cachedAt > TTL.resolve) return undefined;
  return entry;
}

export function setResolvedProject(id: string, title: string, customers: Array<{ type: string; id: string }>): void {
  const cache = load();
  cache.resolvedProjects = cache.resolvedProjects ?? {};
  cache.resolvedProjects[id] = { title, customers, cachedAt: Date.now() };
  save(cache);
}

export function getResolvedCustomer(type: string, id: string): ResolvedCustomerEntry | undefined {
  const cache = load();
  const key = `${type}:${id}`;
  const entry = cache.resolvedCustomers?.[key];
  if (!entry || Date.now() - entry.cachedAt > TTL.resolve) return undefined;
  return entry;
}

export function setResolvedCustomer(type: string, id: string, name: string): void {
  const cache = load();
  cache.resolvedCustomers = cache.resolvedCustomers ?? {};
  cache.resolvedCustomers[`${type}:${id}`] = { name, cachedAt: Date.now() };
  save(cache);
}

export function getResolvedUser(id: string): ResolvedUserEntry | undefined {
  const cache = load();
  const entry = cache.resolvedUsers?.[id];
  if (!entry || Date.now() - entry.cachedAt > TTL.resolve) return undefined;
  return entry;
}

export function setResolvedUser(id: string, name: string): void {
  const cache = load();
  cache.resolvedUsers = cache.resolvedUsers ?? {};
  cache.resolvedUsers[id] = { name, cachedAt: Date.now() };
  save(cache);
}

export function clearCache(): void {
  save({});
}

export function getCacheStats(): string {
  const cache = load();
  const defaultWt = cache.work_types?.find(w => w.id === cache.default_work_type_id);
  return [
    `active_user       : ${cache.active_user?.name ?? "not configured"}`,
    `default_work_type : ${defaultWt?.name ?? cache.default_work_type_id ?? "not configured"}`,
    `work_types        : ${cache.work_types?.length ?? 0}`,
    `companies         : ${cache.companies?.length ?? 0}`,
    `projects          : ${cache.projects?.length ?? 0}`,
    `groups            : ${cache.groups?.length ?? 0}`,
    `tasks             : ${cache.tasks?.length ?? 0}`,
    `resolved_groups   : ${Object.keys(cache.resolvedGroups ?? {}).length}`,
    `resolved_projects : ${Object.keys(cache.resolvedProjects ?? {}).length}`,
    `resolved_customers: ${Object.keys(cache.resolvedCustomers ?? {}).length}`,
    `resolved_users    : ${Object.keys(cache.resolvedUsers ?? {}).length}`,
  ].join("\n");
}
