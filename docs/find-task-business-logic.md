# Smart Resolution — Business Logic

Covers: `teamleader_find_task`, `teamleader_log_time`, `teamleader_load_tasks`, `teamleader_task_action`.

---

## `teamleader_find_task` — Step-by-Step Flow

Navigate the **Company > Project > Group > Task** hierarchy to resolve a task for time tracking.
Cache-first. Numbered selection when multiple options.

---

### Step 1 — Company

**Input:** `company_name` (partial match)

1. Cache check (`getCompany`)
2. Miss → `companies.list?filter.term=company_name`
3. 1 result → auto-pick, cache
4. Multiple → ask for exact name
5. 0 results → error

**Output:** `companyId`, `companyName`

---

### Step 2 — Project (optional)

**Input:** `companyId`

Project can be omitted — the group determines which project to use.

1. Cache check (`getProjectsForCompany`)
2. Miss → `projects-v2/projects.list` with `filter.customers=[{type:"company", id:companyId}]` + `filter.status=active`
3. Cache results
4. If `project_selection` given → filter to that 1 project

**Output:** `projects[]` (filtered list of active projects)

---

### Step 3 — Group

**Input:** `group_name` (partial match), `projects[]`

1. Per project → cache check (`getGroupsForProject`)
2. Miss → `projects-v2/projectGroups.list` with `filter.project_id=projectId`
3. Partial match on `group_name` across ALL projects
4. **1 match** → auto-pick → `groupId`, `groupTitle`, `projectId`
5. **Multiple projects** with matching group → ask `project_selection=N`
6. **0 matches** → show projects, ask `confirm_create_group=true + project_selection=N`

> Groups are NEVER auto-created without confirmation.

**Output:** `groupId`, `groupTitle`, `projectId`, `projectTitle`

---

### Step 4 — Task

**Input:** `projectId`, `groupId`, `task_name`

#### 4a. Fetch tasks in group (2-step)

```
projects-v2/projectLines.list
  body: { project_id: projectId (TOP-LEVEL), filter: { types: ["nextgenTask"] } }
  returns: [{ line: { type, id }, group: { id } }]

Client-side filter: l.group?.id === groupId
→ taskLineIds[]

projects-v2/tasks.list
  body: { filter: { ids: taskLineIds } }  (batch: 100 at a time)
  returns: [{ id, title, status }]

Client-side filter: only_open → keep status in ["to_do", "in_progress", "on_hold"]
```

> **Why 2 steps?** `projectLines.list` returns IDs correctly filtered by group.
> `tasks.list` with `project_group_id` filter is broken in the Teamleader API — it returns tasks from other companies.
> `project_group_id` is NOT a server-side filter in `projectLines.list` — must filter client-side on `l.group?.id`.
> `project_id` must be TOP-LEVEL in the request body, NOT inside `filter`.

#### 4b. Selection

1. **1 exact match** on `task_name` → auto-pick
2. **Multiple matches** → show numbered list, ask `task_selection=N`
3. **0 matches** but tasks exist → show all tasks in group, ask `task_selection=N`
4. **No tasks in group** → auto-create via `projects-v2/tasks.create`

> Tasks are auto-created if they don't exist (and no tasks are present in the group).
> Projects and groups are NEVER auto-created.

**Task creation body:**
```json
{
  "title": "task_name",
  "project_id": "...",
  "group_id": "...",
  "work_type_id": "...",
  "assignees": [{ "type": "user", "id": "userId" }]
}
```

**Output:** `taskId`, `taskTitle` → stored in flat task cache

---

### Step 5 — Tasks without group (special case)

When `group_name` is empty or not provided:

- Skip Step 3
- Run Step 4 with only `project_id` (no group filter)
- Tasks directly on the project are included

---

### Parameters

| Param | Required | Description |
|-------|----------|-------------|
| `company_name` | Yes | Partial match on company name |
| `group_name` | Yes* | Partial match on group name (*optional for ungrouped tasks) |
| `task_name` | Yes | Partial match on task name |
| `project_selection` | Auto | Selected project number from list |
| `task_selection` | Auto | Selected task number from list |
| `confirm_create_group` | Auto | Confirm creation of new group |
| `confirm_create_project` | Auto | Confirm creation of new project |
| `confirm_create_task` | Auto | Confirm creation of new task (when tasks exist but no match) |
| `only_open` | Optional | Only show open tasks (default: true) |
| `_company_id` | Internal | Resolved company ID — pass between steps to avoid re-resolving |
| `_project_id` | Internal | Resolved project ID |
| `_group_id` | Internal | Resolved group ID |
| `_group_title` | Internal | Resolved group title |

---

### Decision Tree

```
company_name
  └─ 1 company found
       └─ search group across all active projects
            ├─ 1 project has the group → auto
            ├─ multiple projects → select project
            └─ group not found → select project + confirm create group
                    └─ tasks in group
                         ├─ 1 exact match → auto
                         ├─ multiple matches → select task
                         └─ not found → auto-create task
```

---

## `teamleader_load_tasks` — Full Tree Loading

Loads the complete Project > Group > Task tree for a company in a single call.
Recommended for sessions with many time entries, or when you need to browse available tasks.

### Flow

```
1. Resolve company from company_name (cache-first)
2. Check task tree cache (TTL: 30 min)
   └─ Hit → return cached tree
   └─ Miss or force_refresh=true → fetch from API:
       a. projects-v2/projects.list (filter: active, company)
       b. Per project: projects-v2/projectLines.list (all tasks + groups)
       c. Batch: projects-v2/tasks.list (fetch task details by IDs)
       d. Build tree: Project > Group > Task
3. Apply filters (project_filter, group_filter, only_open)
4. Cache tree (setTaskTree)
5. Write YAML to ~/.teamleader-tasks-{slug}.yaml
6. Return:
   └─ visual=false (default) → summary: N projects, M tasks
   └─ visual=true → numbered ASCII tree
   └─ task_selection=N → cache selected task for log_time
```

### Output: YAML File

Written to `~/.teamleader-tasks-{slug}.yaml` after every load (even from cache).
Contains full IDs for all projects, groups, and tasks. Use this file to get IDs for direct calls.

### Output: ASCII Tree (visual=true)

```
Company: Acme Corp
=== Project Alpha ===
  [Sprint 12]
    1. Bug fix login (to_do)
    2. Add unit tests (in_progress)
  [Sprint 13]
    3. Refactor auth (on_hold)
=== Project Beta ===
  (no groups)
    4. Setup CI (to_do)
```

### task_selection

After `visual=true`, use `task_selection=N` to cache task N for use in `log_time`:

```
teamleader_load_tasks(company_name="Acme", task_selection=1)
→ Cached: "Bug fix login" (Project Alpha > Sprint 12)
   Use: teamleader_log_time(company_name="Acme", task_name="Bug fix login", ...)
```

### Cache Structure (`task_trees` in cache.json)

```typescript
interface TaskTree {
  company_id: string;
  company_name: string;
  loaded_at: string;     // ISO timestamp for TTL check
  projects: TaskTreeProject[];
}

interface TaskTreeProject {
  id: string;
  title: string;
  groups: TaskTreeGroup[];
  ungrouped: TaskTreeTask[];  // tasks directly on project, no group
}

interface TaskTreeGroup {
  id: string;
  title: string;
  tasks: TaskTreeTask[];
}

interface TaskTreeTask {
  id: string;
  title: string;
  status: "to_do" | "in_progress" | "on_hold" | "done" | string;
  work_type_id?: string;
}
```

---

## `teamleader_log_time` — Time Registration

### Resolution Priority

1. `task_id` given → skip cache lookup entirely, use ID directly
2. `task_name` given → flat cache lookup via `findTask(company, task_name)`
3. Cache miss → tree-based fallback via `scoreTasksInTree`
4. Still no match → error with hint to run `teamleader_find_task` or `teamleader_load_tasks`

### Tree-Based Fallback (scoreTasksInTree)

When the flat task cache has no match, the task tree is searched using a scoring algorithm:

| Match type | Score per word |
|------------|---------------|
| Task title word match | 3 points |
| Group name word match | 1 point |
| Project name word match | 0.5 points |

Words shorter than 3 characters are ignored.
Top matches are proposed with `confirm_task_match=N` for the user to confirm.

### `task_id` Shortcut

When a task ID is known (e.g., from `teamleader_load_tasks` YAML output or `visual=true` list):

```
teamleader_log_time(
  company_name="Acme",
  task_id="abc-123-def",
  started_on="09:00",
  ended_on="11:30"
)
```

This skips all cache lookup and goes directly to dedup + registration.

---

## Deduplication Rules (`teamleader_log_time`)

Dedup is applied before registering a new time entry.

### Rule 1 — Exact Duplicate (blocked)

A time entry is an **exact duplicate** if ALL match:
- Same company ID
- Same task ID (nextgenTask ID in cache)
- Same start time (to second precision)
- Same end time (to second precision)

> Note: `timeTracking.list` returns `subject.type: "todo"` with a different ID than the `nextgenTask` ID.
> Dedup therefore matches on **start time** (to second), not on subject ID.

Action: block with error message showing existing entry details.

### Rule 2 — Overlap (warning)

A time entry **overlaps** if it shares any time range with an existing entry for the same user,
regardless of company or task.

Action: warn and ask `confirm_overlap=true` to proceed.

### Rule 3 — Force Override

Set `force=true` to skip both dedup and overlap checks entirely.

---

## `teamleader_task_action` — Task Maintenance

### Actions

| Action | Required params | Description |
|--------|----------------|-------------|
| `close` | `company_name`, `task_number` or `task_id` | Close a task (set status to done) |
| `create` | `company_name`, `project_id`, `task_title` (`group_id` optional) | Create a new task in a project or group |
| `move_time` | `company_name`, `time_entry_id`, `new_task_number` or `new_task_id` | Move a time entry to a different task |
| `delete_group` | `company_name`, `group_id` | Delete a project group/phase (tasks are ungrouped, not deleted) |

### task_number vs task_id

`task_number` refers to the numbered position in the most recent `teamleader_load_tasks(visual=true)` output.
`task_id` is the direct Teamleader API ID (from YAML file or previous calls).

When using `task_number`, ensure `teamleader_load_tasks(visual=true)` was called in the same session and the tree is still valid (30 min TTL).

---

## API Quirks Reference

| Endpoint | Quirk |
|----------|-------|
| `projects-v2/projectLines.list` | `project_id` must be top-level in body, NOT inside `filter`. `project_group_id` is not a server-side filter — filter client-side on `l.group?.id`. |
| `projects-v2/projectLines.create` | **Does not exist.** Use `projectGroups.create` for groups and `tasks.create` for tasks. |
| `projects-v2/projectGroups.create` | Correct endpoint for creating groups. Fields: `project_id`, `title`, `start_date`, `end_date`. |
| `projects-v2/projectGroups.delete` | Requires `delete_strategy` param: `"ungroup_tasks_and_materials"` (safe) or `"delete_tasks_and_materials"`. |
| `projects-v2/tasks.list` | Filter by `ids` works server-side. Status is NOT a server-side filter. |
| `projects-v2/tasks.create` | Use `group_id` (not `project_group_id`). Use `assignees: [{type, id}]` (not `assignee_id`). |
| `timeTracking.list` | Returns `subject.type: "todo"` — ID differs from `nextgenTask` ID. Dedup on start time, not subject ID. |
| `timeTracking.add` | Times must be formatted without milliseconds for accurate dedup matching. Use `toFilterDate()`. |
