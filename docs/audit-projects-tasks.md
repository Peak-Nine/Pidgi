# Audit: Projects-v2 + Standalone Tasks — Tools vs API Docs

**Date:** 2026-04-01
**Scope:** `src/tools/projects.ts`, `src/tools/tasks.ts` vs `docs/api/` (193-265, 304-311)
**Method:** Every API request param checked against tool Zod schema + body construction

---

## Legend

- **Yes** = param exists in tool and is correctly mapped
- **No** = param missing from tool
- **Partial** = param exists but mapping differs from API spec
- _(response-only)_ = field only in API response, not a request param

---

## 1. Projects-v2: Projects

### 1.1 projects.create (`teamleader_create_project_v2`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| title | Yes | |
| description | Yes | |
| customers | Partial | Tool accepts single customer_type+customer_id, API accepts array of multiple customers |
| start_date | Yes | |
| end_date | Yes | |
| owner_ids | **No** | Missing — array of user IDs |
| time_budget | **No** | Missing — {value, unit} object |
| billing_method | **No** | Missing — string enum |
| external_budget | **No** | Missing — {amount, currency} |
| internal_budget | **No** | Missing — {amount, currency} |
| fixed_price | **No** | Missing — {amount, currency} |
| purchase_order_number | **No** | Missing — string |
| company_entity_id | **No** | Missing — string |
| color | **No** | Missing — color enum |
| assignees | **No** | Missing — array of {type, id} |
| deal_ids | **No** | Missing — string array |
| quotation_ids | **No** | Missing — string array |
| initial_time_tracked | **No** | Missing — {value, unit} |
| initial_price | **No** | Missing — {amount, currency} |
| initial_cost | **No** | Missing — {amount, currency} |
| initial_amount_billed | **No** | Missing — {amount, currency} |
| initial_amount_paid | **No** | Missing — {amount, currency} |
| custom_fields | **No** | Missing — array of {id, value} |

**Gaps: 16** (customers partial = 1 partial + 15 missing)

### 1.2 projects.update (`teamleader_update_project_v2`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | Yes | |
| title | Yes | |
| description | Yes | |
| start_date | Yes | |
| end_date | Yes | |
| time_budget | **No** | Missing — nullable {value, unit} |
| billing_method | **No** | Missing — API uses object {value, update_strategy} (NOT string) |
| external_budget | **No** | Missing — nullable {amount, currency} |
| internal_budget | **No** | Missing — nullable {amount, currency} |
| fixed_price | **No** | Missing — nullable {amount, currency} |
| purchase_order_number | **No** | Missing — nullable string |
| company_entity_id | **No** | Missing — nullable string |
| color | **No** | Missing — color enum |
| custom_fields | **No** | Missing — array of {id, value} |

**Gaps: 8**

### 1.3 projects.list (`teamleader_list_projects_v2`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| filter.term | Yes | |
| filter.status | Yes | |
| filter.customers | Partial | Tool only accepts single company_id, API accepts array of {type,id} (incl. contacts) |
| filter.ids | **No** | Missing — string array |
| filter.quotation_ids | **No** | Missing — string array |
| filter.deal_ids | **No** | Missing — string array |
| page.size | Yes | |
| page.number | Yes | |
| sort | **No** | Missing — array of {field, order} with many sort fields |
| includes | **No** | Missing — comma-separated string (legacy_project, custom_fields) |

**Gaps: 5** (customers partial)

### 1.4 projects.info (`teamleader_get_project_v2`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | Yes | |
| includes | **No** | Missing — comma-separated string |

**Gaps: 1**

### 1.5 projects.delete (`teamleader_delete_project_v2`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | Yes | |
| delete_strategy | Yes | All 3 enum values match |

**Gaps: 0** — Complete

### 1.6 projects.duplicate (`teamleader_duplicate_project_v2`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | Yes | |
| title | Yes | |

**Gaps: 0** — Complete

### 1.7 projects.close (`teamleader_close_project_v2`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | Yes | |
| closing_strategy | Yes | Both enum values match |

**Gaps: 0** — Complete

### 1.8 projects.reopen (`teamleader_reopen_project_v2`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | Yes | |

**Gaps: 0** — Complete

### 1.9 projects.addCustomer (`teamleader_add_project_customer`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | Yes | |
| customer.type | Yes | |
| customer.id | Yes | |

**Gaps: 0** — Complete

### 1.10 projects.removeCustomer (`teamleader_remove_project_customer`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | Yes | |
| customer.type | Yes | |
| customer.id | Yes | |

**Gaps: 0** — Complete

### 1.11 projects.addDeal (`teamleader_add_project_deal`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | Yes | |
| deal_id | Yes | |

**Gaps: 0** — Complete

### 1.12 projects.removeDeal (`teamleader_remove_project_deal`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | Yes | |
| deal_id | Yes | |

**Gaps: 0** — Complete

### 1.13 projects.addOwner (`teamleader_add_project_owner`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | Yes | |
| user_id | Yes | |

**Gaps: 0** — Complete

### 1.14 projects.removeOwner (`teamleader_remove_project_owner`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | Yes | |
| user_id | Yes | |

**Gaps: 0** — Complete

### 1.15 projects.addQuotation (`teamleader_add_project_quotation`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | Yes | |
| quotation_id | Yes | |

**Gaps: 0** — Complete

### 1.16 projects.removeQuotation (`teamleader_remove_project_quotation`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | Yes | |
| quotation_id | Yes | |

**Gaps: 0** — Complete

### 1.17 projects.assign (`teamleader_assign_project`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | Yes | |
| assignee.type | Yes | |
| assignee.id | Yes | |

**Gaps: 0** — Complete

### 1.18 projects.unassign (`teamleader_unassign_project`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | Yes | |
| assignee.type | Yes | |
| assignee.id | Yes | |

**Gaps: 0** — Complete

---

## 2. Projects-v2: Project Groups

### 2.1 projectGroups.create (`teamleader_create_project_group`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| project_id | Yes | |
| title | Yes | |
| description | Yes | |
| color | Yes | |
| billing_method | Yes | String enum |
| fixed_price | Yes | Mapped from fixed_price_amount/currency |
| external_budget | Yes | Mapped from external_budget_amount/currency |
| internal_budget | Yes | Mapped from internal_budget_amount/currency |
| start_date | Yes | |
| end_date | Yes | |
| assignees | Partial | Tool accepts single assignee_id, API accepts array of multiple assignees |

**Gaps: 1 partial** (single assignee vs array)

### 2.2 projectGroups.update (`teamleader_update_project_group`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | Yes | |
| title | Yes | |
| description | Yes | Nullable supported |
| color | Yes | |
| billing_method | Yes | Correctly maps to {value, update_strategy} object |
| fixed_price | Yes | |
| external_budget | Yes | |
| internal_budget | Yes | |
| start_date | Yes | Nullable supported |
| end_date | Yes | Nullable supported |

**Gaps: 0** — Complete

### 2.3 projectGroups.delete — **NOT IMPLEMENTED**

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | **No** | No tool exists |
| delete_strategy | **No** | ungroup_tasks_and_materials / delete_tasks_and_materials / delete_tasks_materials_and_unbilled_timetrackings |

**Gaps: Tool missing entirely**

### 2.4 projectGroups.list — **NOT IMPLEMENTED** (as dedicated tool)

| API param | In tool? | Notes |
|-----------|----------|-------|
| filter.ids | **No** | No dedicated list tool — existing `teamleader_list_project_groups` uses projectLines.list instead |
| filter.project_id | **No** | Same — routed through projectLines.list |

**Note:** The API has a dedicated `projectGroups.list` endpoint with filter.ids and filter.project_id. The tool uses `projectLines.list` with types filter instead. Functionally similar but misses the dedicated endpoint's filter options.

### 2.5 projectGroups.info (`teamleader_get_project_group`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | Yes | |

**Gaps: 0** — Complete

### 2.6 projectGroups.duplicate (`teamleader_duplicate_project_group`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| origin_id | Yes | |

**Gaps: 0** — Complete

### 2.7 projectGroups.assign (`teamleader_assign_project_group`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | Yes | |
| assignee.type | Yes | |
| assignee.id | Yes | |

**Gaps: 0** — Complete

### 2.8 projectGroups.unassign (`teamleader_unassign_project_group`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | Yes | |
| assignee.type | Yes | |
| assignee.id | Yes | |

**Gaps: 0** — Complete

---

## 3. Projects-v2: Project Lines

### 3.1 projectLines.list (`teamleader_list_project_lines` + `teamleader_list_project_groups` + `teamleader_list_project_tasks_v2`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| project_id | Yes | Top-level (correct, not inside filter) |
| filter.types | Yes | In list_project_lines, hardcoded in list_project_groups/tasks |
| filter.assignees | Yes | In list_project_lines |
| page.size | Yes | In list_project_groups/tasks (not in list_project_lines) |
| page.number | Yes | In list_project_groups/tasks (not in list_project_lines) |

**Note:** `teamleader_list_project_lines` is missing page params. The other two tools have them.

**Gaps: 1** (page params missing from list_project_lines)

### 3.2 projectLines.addToGroup (`teamleader_add_project_line_to_group`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| line_id | Yes | |
| group_id | Yes | |

**Gaps: 0** — Complete

### 3.3 projectLines.removeFromGroup (`teamleader_remove_task_from_group`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| line_id | Yes | |

**Gaps: 0** — Complete

---

## 4. Projects-v2: Tasks

### 4.1 tasks.create (`teamleader_create_project_task_v2`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| project_id | Yes | |
| title | Yes | |
| group_id | Yes | Mapped from project_group_id |
| description | Yes | |
| work_type_id | Yes | |
| billing_method | Yes | String enum |
| fixed_price | Yes | |
| external_budget | Yes | |
| internal_budget | Yes | |
| custom_rate | Yes | |
| start_date | Yes | |
| end_date | Yes | |
| time_estimated | Yes | Mapped from time_estimated_value/unit |
| assignees | Partial | Tool accepts single assignee_id, API accepts array |
| task_type_id | **No** | Deprecated — intentionally skipped (OK) |

**Gaps: 1 partial** (single assignee vs array)

### 4.2 tasks.update (`teamleader_update_project_task`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | Yes | |
| title | Yes | |
| description | Yes | Nullable |
| status | Yes | |
| work_type_id | Yes | Nullable |
| billing_method | Yes | String enum (correct — tasks.update uses string, not object) |
| fixed_price | Yes | |
| external_budget | Yes | |
| internal_budget | Yes | |
| custom_rate | Yes | |
| start_date | Yes | Nullable |
| end_date | Yes | Nullable |
| time_estimated | Yes | |
| task_type_id | **No** | Deprecated — intentionally skipped (OK) |

**Gaps: 0** — Complete (deprecated param excluded intentionally)

### 4.3 tasks.delete (`teamleader_delete_project_task`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | Yes | |
| delete_strategy | Yes | Both enum values match |

**Gaps: 0** — Complete

### 4.4 tasks.info (`teamleader_get_project_task`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | Yes | |

**Gaps: 0** — Complete

### 4.5 tasks.list — uses `projectLines.list` (no dedicated tool)

The API has a dedicated `projects-v2/tasks.list` with `filter.ids` and pagination. The tool routes through `projectLines.list` instead (which works but loses the ids filter).

| API param | In tool? | Notes |
|-----------|----------|-------|
| filter.ids | **No** | Not available via projectLines.list approach |
| page.size | Yes | Via projectLines.list |
| page.number | Yes | Via projectLines.list |

**Gaps: 1** (filter.ids not usable)

### 4.6 tasks.duplicate (`teamleader_duplicate_project_task`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| origin_id | Yes | |

**Gaps: 0** — Complete

### 4.7 tasks.assign (`teamleader_assign_project_task`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | Yes | |
| assignee.type | Yes | |
| assignee.id | Yes | |

**Gaps: 0** — Complete

### 4.8 tasks.unassign (`teamleader_unassign_project_task`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | Yes | |
| assignee.type | Yes | |
| assignee.id | Yes | |

**Gaps: 0** — Complete

### 4.9 tasks.complete (`teamleader_complete_project_task`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | Yes | |

**Gaps: 0** — Complete

### 4.10 tasks.reopen (`teamleader_reopen_project_task`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | Yes | |

**Gaps: 0** — Complete

---

## 5. Standalone Tasks (v1 API)

### 5.1 tasks.list (`teamleader_list_tasks`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| filter.ids | Yes | |
| filter.user_id | Yes | |
| filter.completed | Yes | |
| filter.scheduled | Yes | |
| filter.due_by | Yes | |
| filter.due_from | Yes | |
| filter.term | Yes | |
| filter.customer | Yes | Mapped from customer_type + customer_id |
| filter.milestone_id | **No** | Missing — legacy projects only, low priority |
| page.size | Yes | |
| page.number | Yes | |
| sort | **No** | Missing — [{field: "name", order: "asc/desc"}] |

**Gaps: 2** (milestone_id, sort)

### 5.2 tasks.create (`teamleader_create_task`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| title | Yes | |
| due_on | Yes | |
| work_type_id | Yes | |
| description | Yes | |
| assignee | Yes | Mapped from assignee_type + assignee_id |
| customer | Yes | Mapped from customer_type + customer_id |
| estimated_duration | Yes | Mapped from estimated_duration (minutes, hardcoded unit: min) |
| deal_id | Yes | |
| ticket_id | Yes | |
| project_id | Yes | |
| milestone_id | **No** | Missing — legacy projects only, low priority |
| custom_fields | **No** | Missing — array of {id, value} |

**Gaps: 2** (milestone_id, custom_fields)

### 5.3 tasks.info (`teamleader_get_task`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | Yes | |

**Gaps: 0** — Complete

### 5.4 tasks.update (`teamleader_update_task`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | Yes | |
| title | Yes | |
| description | Yes | |
| due_on | Yes | |
| work_type_id | Yes | |
| assignee | Yes | Mapped from assignee_type + assignee_id |
| customer | Yes | Mapped from customer_type + customer_id |
| estimated_duration | Yes | |
| deal_id | Yes | Nullable |
| ticket_id | Yes | Nullable |
| project_id | Yes | Nullable |
| milestone_id | **No** | Missing — nullable, legacy only |
| custom_fields | **No** | Missing — array of {id, value} |

**Gaps: 2** (milestone_id, custom_fields)

### 5.5 tasks.delete (`teamleader_delete_task`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | Yes | |

**Gaps: 0** — Complete

### 5.6 tasks.complete (`teamleader_complete_task`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | Yes | |

**Gaps: 0** — Complete

### 5.7 tasks.reopen (`teamleader_reopen_task`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | Yes | |

**Gaps: 0** — Complete

### 5.8 tasks.schedule (`teamleader_schedule_task`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | Yes | |
| starts_at | Yes | |
| ends_at | Yes | |

**Gaps: 0** — Complete

---

## 6. Summary

### Gap counts per tool

| Tool | Gaps | Severity |
|------|------|----------|
| `teamleader_create_project_v2` | 16 missing (1 partial) | **High** — missing billing, budgets, color, custom_fields, multi-customer, assignees, deals, quotations, initials |
| `teamleader_update_project_v2` | 8 missing | **High** — missing billing_method (object!), budgets, custom_fields, color, PO number |
| `teamleader_list_projects_v2` | 5 missing (1 partial) | **Medium** — missing sort, includes, filter.ids/deals/quotations, single-customer only |
| `teamleader_get_project_v2` | 1 missing | **Low** — missing includes |
| projectGroups.delete | **Tool missing** | **High** — entire endpoint not implemented |
| projectGroups.list | **Not dedicated** | **Medium** — uses projectLines.list instead of dedicated endpoint |
| `teamleader_list_project_lines` | 1 missing | **Low** — missing page params |
| `teamleader_create_project_group` | 1 partial | **Low** — single assignee vs array |
| `teamleader_create_project_task_v2` | 1 partial | **Low** — single assignee vs array |
| projects-v2 tasks.list | 1 missing | **Low** — filter.ids not available via projectLines approach |
| `teamleader_list_tasks` | 2 missing | **Low** — sort, milestone_id |
| `teamleader_create_task` | 2 missing | **Low** — custom_fields, milestone_id |
| `teamleader_update_task` | 2 missing | **Low** — custom_fields, milestone_id |

### Missing tools

| API endpoint | Status |
|--------------|--------|
| projectGroups.delete | **Not implemented** |
| projectGroups.list (dedicated) | Uses projectLines.list workaround |

### Critical patterns found

1. **projects.create**: Only sends single customer — API supports multiple customers, assignees, deals, quotations at creation time
2. **projects.update**: `billing_method` in API is an **object** `{value, update_strategy}` — tool doesn't support this at all
3. **custom_fields**: Missing from projects.create, projects.update, tasks.create, tasks.update (standalone)
4. **projectGroups.delete**: No tool exists — users cannot delete project groups
5. **Single-assignee pattern**: create_project_group and create_project_task_v2 both accept single assignee but API accepts array — minor since assign/unassign tools exist as workaround

### Total: 40 param gaps + 1 missing tool + 1 non-dedicated endpoint
