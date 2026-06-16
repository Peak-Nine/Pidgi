# Audit: projects.ts vs API docs (projects-v2)

Date: 2026-03-05

---

## 1. Endpoint coverage

### Projects v2

| API endpoint | MCP tool | Status |
|-------------|----------|--------|
| projects.list | teamleader_list_projects_v2 | OK |
| projects.info | teamleader_get_project_v2 | OK |
| projects.create | teamleader_create_project_v2 | OK (bugs — see params) |
| projects.update | teamleader_update_project_v2 | OK (bugs — see params) |
| projects.close | teamleader_close_project_v2 | OK |
| projects.reopen | teamleader_reopen_project_v2 | OK |
| projects.delete | teamleader_delete_project_v2 | OK |
| projects.duplicate | teamleader_duplicate_project_v2 | OK |
| projects.addCustomer | teamleader_add_project_customer | OK |
| projects.removeCustomer | teamleader_remove_project_customer | OK |
| projects.addDeal | teamleader_add_project_deal | OK |
| projects.removeDeal | teamleader_remove_project_deal | OK |
| projects.addOwner | teamleader_add_project_owner | OK |
| projects.removeOwner | teamleader_remove_project_owner | OK |
| projects.addQuotation | — | MISSING |
| projects.removeQuotation | — | MISSING |
| projects.assign | teamleader_assign_project | OK |
| projects.unassign | teamleader_unassign_project | OK |

### Project Groups

| API endpoint | MCP tool | Status |
|-------------|----------|--------|
| projectGroups.list | teamleader_list_project_groups (via projectLines.list) | OK (indirect) |
| projectGroups.info | — | MISSING |
| projectGroups.create | teamleader_create_project_group | OK |
| projectGroups.update | teamleader_update_project_group | OK |
| projectGroups.delete | — | MISSING |
| projectGroups.duplicate | — | MISSING |
| projectGroups.assign | — | MISSING |
| projectGroups.unassign | — | MISSING |

### Project Lines

| API endpoint | MCP tool | Status |
|-------------|----------|--------|
| projectLines.list | teamleader_list_project_groups + teamleader_list_project_tasks_v2 | OK |
| projectLines.addToGroup | — | MISSING |
| projectLines.removeFromGroup | teamleader_remove_task_from_group | OK |

### Project Tasks (v2)

| API endpoint | MCP tool | Status |
|-------------|----------|--------|
| tasks.list | teamleader_list_project_tasks_v2 (via projectLines.list) | OK (indirect) |
| tasks.info | — | MISSING |
| tasks.create | teamleader_create_project_task_v2 | OK (bugs — see params) |
| tasks.update | — | MISSING |
| tasks.delete | teamleader_delete_project_task | BUG (missing delete_strategy) |
| tasks.duplicate | — | MISSING |
| tasks.assign | — | MISSING |
| tasks.unassign | — | MISSING |
| tasks.complete | teamleader_complete_project_task | OK (no doc provided) |
| tasks.reopen | teamleader_reopen_project_task | OK (no doc provided) |

**Summary: 21/37 endpoints covered, 2 with bugs, 16 missing (incl. 2 quotation, 4 group, 1 addToGroup, 5 task, 4 group lifecycle)**

---

## 2. Param coverage

### BUG: projects.create sends wrong field names

| Tool param | Sent as | API expects | Status |
|-----------|---------|-------------|--------|
| starts_on | `starts_on` | `start_date` | **BUG** — field ignored by API |
| due_on | `due_on` | `end_date` | **BUG** — field ignored by API |
| status | `status` | (does not exist) | **BUG** — no status field on create |
| responsible_user_id | `responsible_user_id` | (does not exist) | **BUG** — API has `owner_ids[]` and `assignees[{type,id}]` |

### BUG: projects.update sends wrong field names

| Tool param | Sent as | API expects | Status |
|-----------|---------|-------------|--------|
| starts_on | `starts_on` | `start_date` | **BUG** — field ignored by API |
| due_on | `due_on` | `end_date` | **BUG** — field ignored by API |
| status | `status` | (does not exist) | **BUG** — no status field on update |
| responsible_user_id | `responsible_user_id` | (does not exist) | **BUG** — same as create |

### BUG: tasks.create sends wrong field names

| Tool param | Sent as | API expects | Status |
|-----------|---------|-------------|--------|
| due_on | `due_on` | `end_date` | **BUG** — field ignored by API |
| estimated_duration | `estimated_duration` (number) | `time_estimated: { value, unit }` | **BUG** — wrong structure |

### BUG: tasks.delete missing required param

| API param | In tool? | Status |
|-----------|----------|--------|
| delete_strategy (required) | NO | **BUG** — API requires `unlink_time_tracking` or `delete_time_tracking`, tool sends nothing |

### projects.list — missing params

| API param | In tool? | Notes |
|-----------|----------|-------|
| filter.ids | NO | |
| filter.status | YES | **WRONG VALUES**: tool has `active/on_hold/done/cancelled`, API has `open/planned/running/overdue/over_budget/closed` |
| filter.quotation_ids | NO | |
| filter.deal_ids | NO | |
| filter.term | YES | OK |
| filter.customers | YES (partial) | Only supports company_id, not contact. API allows array of {type,id} |
| page | YES | OK |
| sort | NO | |
| includes | NO | |

### projects.info — missing params

| API param | In tool? |
|-----------|----------|
| id | YES |
| includes | NO |

### projects.create — missing optional params

| API param | In tool? |
|-----------|----------|
| title | YES |
| description | YES |
| owner_ids | NO |
| time_budget | NO |
| billing_method | NO |
| external_budget | NO |
| internal_budget | NO |
| fixed_price | NO |
| start_date | YES (wrong name — see BUG) |
| end_date | YES (wrong name — see BUG) |
| purchase_order_number | NO |
| company_entity_id | NO |
| color | NO |
| customers | YES |
| assignees | NO (has `responsible_user_id` instead — not a valid API field) |
| deal_ids | NO |
| quotation_ids | NO |
| initial_time_tracked | NO |
| initial_price | NO |
| initial_cost | NO |
| initial_amount_billed | NO |
| initial_amount_paid | NO |
| custom_fields | NO |

### projects.update — missing optional params

| API param | In tool? |
|-----------|----------|
| id | YES |
| title | YES |
| description | YES |
| time_budget | NO |
| billing_method | NO |
| external_budget | NO |
| internal_budget | NO |
| fixed_price | NO |
| start_date | YES (wrong name — see BUG) |
| end_date | YES (wrong name — see BUG) |
| purchase_order_number | NO |
| company_entity_id | NO |
| color | NO |
| custom_fields | NO |

### projectGroups.create — missing optional params

| API param | In tool? |
|-----------|----------|
| project_id | YES |
| title | YES |
| description | YES |
| color | NO |
| billing_method | NO |
| fixed_price | NO |
| external_budget | NO |
| internal_budget | NO |
| start_date | YES (mapped correctly from `starts_on`) |
| end_date | YES (mapped correctly from `due_on`) |
| assignees | NO |

### projectGroups.update — missing optional params

| API param | In tool? |
|-----------|----------|
| id | YES |
| title | YES |
| description | YES |
| color | NO |
| billing_method | NO |
| fixed_price | NO |
| external_budget | NO |
| internal_budget | NO |
| start_date | YES |
| end_date | YES |

### tasks.create (project) — missing optional params

| API param | In tool? |
|-----------|----------|
| project_id | YES |
| title | YES |
| group_id | YES (mapped from project_group_id) |
| work_type_id | YES |
| description | YES |
| billing_method | NO |
| fixed_price | NO |
| external_budget | NO |
| internal_budget | NO |
| custom_rate | NO |
| start_date | NO |
| end_date | NO (tool has `due_on` which doesn't exist) |
| time_estimated | YES (wrong structure — see BUG) |
| assignees | YES (mapped from assignee_id) |

---

## 3. describe() coverage

All params that exist in the tool schemas have proper `.describe()` strings.

| Tool | Param | Has describe()? |
|------|-------|-----------------|
| list_projects_v2 | page | YES |
| list_projects_v2 | page_size | YES |
| list_projects_v2 | term | YES |
| list_projects_v2 | status | YES |
| list_projects_v2 | company_id | YES |
| get_project_v2 | id | YES |
| create_project_v2 | title | YES |
| create_project_v2 | description | YES |
| create_project_v2 | status | YES |
| create_project_v2 | customer_type | YES |
| create_project_v2 | customer_id | YES |
| create_project_v2 | responsible_user_id | YES |
| create_project_v2 | starts_on | YES |
| create_project_v2 | due_on | YES |
| update_project_v2 | all 7 params | YES |
| list_project_groups | all 3 params | YES |
| list_project_tasks_v2 | all 5 params | YES |
| create_project_group | all 5 params | YES |
| close_project_v2 | all 2 params | YES |
| reopen_project_v2 | id | YES |
| delete_project_v2 | all 2 params | YES |
| duplicate_project_v2 | all 2 params | YES |
| add_project_customer | all 3 params | YES |
| remove_project_customer | all 3 params | YES |
| add_project_deal | all 2 params | YES |
| remove_project_deal | all 2 params | YES |
| add_project_owner | all 2 params | YES |
| remove_project_owner | all 2 params | YES |
| assign_project | all 3 params | YES |
| unassign_project | all 3 params | YES |
| update_project_group | all 5 params | YES |
| complete_project_task | id | YES |
| reopen_project_task | id | YES |
| delete_project_task | id | YES |
| remove_task_from_group | line_id | YES |
| create_project_task_v2 | all 8 params | YES |

**All params have describe() — no gaps.**

---

## 4. llmTip / known quirk coverage

| Tool | Known quirk | llmTip present? | Notes |
|------|-------------|-----------------|-------|
| list_project_groups | `projectLines.list`: `project_id` must be top-level | YES | In tool description |
| create_project_group | `projectGroups.create`: use `start_date`/`end_date` | YES | In tool description |
| (missing tool) | `projectGroups.delete`: requires `delete_strategy` | N/A | Endpoint not implemented |
| create_project_task_v2 | `tasks.create`: use `group_id` not `project_group_id` | YES | In tool description |
| create_project_task_v2 | `tasks.create`: use `assignees: [{type,id}]` array | YES | In tool description |
| close_project_v2 | `projects.close`: requires `closing_strategy` | YES | In tool description |
| delete_project_v2 | `projects.delete`: requires `delete_strategy` | YES | In tool description |
| assign_project | `projects.assign`: `assignee: {type, id}` object | YES | In tool description |
| add_project_customer | `projects.addCustomer`: `customer: {type, id}` object | YES | In tool description |
| create_project_v2 | API uses `start_date`/`end_date` (NOT `starts_on`/`due_on`) | NO | **Code sends wrong field names** |
| update_project_v2 | API uses `start_date`/`end_date` (NOT `starts_on`/`due_on`) | NO | **Code sends wrong field names** |
| update_project_group | API uses `start_date`/`end_date` | YES | Params correctly named |

---

## Summary of findings

### Critical bugs (5)

1. **`create_project_v2` sends `starts_on`/`due_on`** — API expects `start_date`/`end_date`. Dates silently ignored.
2. **`update_project_v2` sends `starts_on`/`due_on`** — same bug as create.
3. **`create_project_v2` sends `responsible_user_id`** — field does not exist in API. API has `owner_ids[]` and `assignees[{type,id}]`.
4. **`create_project_task_v2` sends `due_on`** — API expects `end_date`. Also sends `estimated_duration` as flat number, API expects `time_estimated: {value, unit}`.
5. **`delete_project_task` missing required `delete_strategy`** — API requires `unlink_time_tracking` or `delete_time_tracking`.

### Wrong enum values (2)

1. **`list_projects_v2` status enum** — tool: `active/on_hold/done/cancelled`. API: `open/planned/running/overdue/over_budget/closed`.
2. **`create_project_v2` status param** — field does not exist in projects.create API at all.

### Non-existent params sent (3)

1. `create_project_v2`: `status` — not in API
2. `create_project_v2`: `responsible_user_id` — not in API
3. `update_project_v2`: `status` — not in API
4. `update_project_v2`: `responsible_user_id` — not in API

### Missing endpoints (16)

- projects.addQuotation, projects.removeQuotation
- projectGroups.info, projectGroups.delete, projectGroups.duplicate, projectGroups.assign, projectGroups.unassign
- projectLines.addToGroup
- tasks.info, tasks.update, tasks.list (direct), tasks.duplicate, tasks.assign, tasks.unassign
- (tasks.complete/tasks.reopen not in provided docs but used in code)

### Missing optional params (many)

Most tools only expose basic params. Significant gaps include:
- billing_method, time_budget, budgets, fixed_price (across all create/update tools)
- sort, includes, filter.ids (on list tools)
- color, company_entity_id, custom_fields
- assignees on projectGroups.create
