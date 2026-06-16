# Audit: events.ts + tasks.ts vs API docs

**Date:** 2026-03-05
**Files:** `src/tools/events.ts`, `src/tools/tasks.ts`

---

## 1. Endpoint coverage

### Events

| API endpoint | MCP tool | Status |
|-------------|----------|--------|
| events.list | teamleader_list_events | Covered |
| events.info | teamleader_get_event | Covered |
| events.create | teamleader_create_event | Covered |
| events.update | — | MISSING |
| events.cancel | — | MISSING |

### Tasks

| API endpoint | MCP tool | Status |
|-------------|----------|--------|
| tasks.list | teamleader_list_tasks | Covered |
| tasks.info | teamleader_get_task | Covered |
| tasks.create | teamleader_create_task | Covered |
| tasks.update | teamleader_update_task | Covered |
| tasks.delete | teamleader_delete_task | Covered |
| tasks.complete | teamleader_complete_task | Covered |
| tasks.reopen | teamleader_reopen_task | Covered |
| tasks.schedule | teamleader_schedule_task | Covered |

**Summary:** Events 3/5 covered (missing update + cancel). Tasks 8/8 covered.

---

## 2. Param coverage

### teamleader_list_events (events.list)

| API param | In tool? | Notes |
|-----------|----------|-------|
| filter.ids | NO | Missing |
| filter.user_id | NO | Missing |
| filter.activity_type_id | NO | Missing |
| filter.ends_after | YES | |
| filter.starts_before | YES | |
| filter.term | NO | Missing — searches title/description |
| filter.attendee | NO | Missing — object {type, id} |
| filter.link | NO | Missing — object {type, id} for contact/company/deal |
| filter.task_id | NO | Missing |
| filter.done | NO | Missing |
| sort | NO | Missing — sortable by starts_at |
| — | starts_after | **BUG**: param exists in tool but NOT in API |
| — | ends_before | **BUG**: param exists in tool but NOT in API |

**CRITICAL:** Tool exposes `starts_after` and `ends_before` params that do not exist in the API. The API only has `ends_after` and `starts_before`. These extra params will either be silently ignored or cause errors.

### teamleader_get_event (events.info)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | |

All params covered.

### teamleader_create_event (events.create)

| API param | In tool? | Notes |
|-----------|----------|-------|
| title | YES | |
| description | YES | |
| activity_type_id | YES | |
| starts_at | YES | |
| ends_at | YES | |
| location | YES | |
| work_type_id | NO | Missing |
| attendees | YES | (as attendee_ids) |
| links | NO | Missing — link to contact/company/deal |

### events.update — NO TOOL

API params that would need implementing:
- id, title, description, starts_at, ends_at, location, work_type_id, attendees, links

### events.cancel — NO TOOL

API params that would need implementing:
- id

### teamleader_list_tasks (tasks.list)

| API param | In tool? | Notes |
|-----------|----------|-------|
| filter.ids | NO | Missing |
| filter.user_id | NO | Missing — filter by assigned user/team |
| filter.milestone_id | NO | Legacy (old projects), OK to skip |
| filter.completed | NO | Missing — filter by completion status |
| filter.scheduled | NO | Missing — filter by scheduled status |
| filter.due_by | NO | Missing — tasks due before date |
| filter.due_from | NO | Missing — tasks due after date |
| filter.term | YES | |
| filter.customer | YES | (as customer_type + customer_id) |
| sort | NO | Missing — sortable by name |

### teamleader_create_task (tasks.create)

| API param | In tool? | Notes |
|-----------|----------|-------|
| title | YES | |
| description | YES | |
| due_on | YES | |
| work_type_id | YES | |
| milestone_id | NO | Legacy (old projects), OK to skip |
| project_id | NO | Missing — link to new projects module |
| deal_id | YES | |
| ticket_id | YES | |
| estimated_duration | YES | |
| assignee | YES | (as assignee_type + assignee_id) |
| customer | YES | (as customer_type + customer_id) |
| custom_fields | NO | Missing |

### teamleader_get_task (tasks.info)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | |

All params covered.

### teamleader_update_task (tasks.update)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | |
| title | YES | |
| description | YES | |
| due_on | YES | |
| work_type_id | YES | |
| milestone_id | NO | Legacy (old projects), OK to skip |
| project_id | NO | Missing — link to new projects module |
| deal_id | YES | |
| ticket_id | YES | |
| estimated_duration | YES | |
| assignee | YES | (as assignee_type + assignee_id) |
| customer | NO | Missing — update customer link |
| custom_fields | NO | Missing |

### teamleader_delete_task (tasks.delete)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | |

### teamleader_complete_task (tasks.complete)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | |

### teamleader_reopen_task (tasks.reopen)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | |

### teamleader_schedule_task (tasks.schedule)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | |
| starts_at | YES | |
| ends_at | YES | |

All params covered.

---

## 3. describe() coverage

### Events

| Tool | Param | Has describe()? |
|------|-------|-----------------|
| list_events | page | YES |
| list_events | page_size | YES |
| list_events | starts_after | YES |
| list_events | starts_before | YES |
| list_events | ends_after | YES |
| list_events | ends_before | YES |
| get_event | id | YES |
| create_event | title | YES |
| create_event | description | YES |
| create_event | activity_type_id | YES |
| create_event | starts_at | YES |
| create_event | ends_at | YES |
| create_event | location | YES |
| create_event | attendee_ids | YES |
| create_event | attendee_ids[].type | YES |
| create_event | attendee_ids[].id | YES |

All existing params have describe(). No gaps.

### Tasks

| Tool | Param | Has describe()? |
|------|-------|-----------------|
| list_tasks | page | YES |
| list_tasks | page_size | YES |
| list_tasks | term | YES |
| list_tasks | customer_type | YES |
| list_tasks | customer_id | YES |
| create_task | title | YES |
| create_task | due_on | YES |
| create_task | work_type_id | YES |
| create_task | description | YES |
| create_task | assignee_type | YES |
| create_task | assignee_id | YES |
| create_task | customer_type | YES |
| create_task | customer_id | YES |
| create_task | estimated_duration | YES |
| create_task | deal_id | YES |
| create_task | ticket_id | YES |
| get_task | id | YES |
| update_task | id | YES |
| update_task | title | YES |
| update_task | description | YES |
| update_task | due_on | YES |
| update_task | work_type_id | YES |
| update_task | assignee_type | YES |
| update_task | assignee_id | YES |
| update_task | estimated_duration | YES |
| update_task | deal_id | YES |
| update_task | ticket_id | YES |
| delete_task | id | YES |
| complete_task | id | YES |
| reopen_task | id | YES |
| schedule_task | id | YES |
| schedule_task | starts_at | YES |
| schedule_task | ends_at | YES |

All existing params have describe(). No gaps.

---

## 4. llmTip coverage

### Events

| Tool | Known quirk | llmTip present? |
|------|-------------|-----------------|
| list_events | API only has `ends_after` + `starts_before` (not starts_after/ends_before) | NO — tool has bogus params |
| list_events | API supports sort by starts_at | NO |
| create_event | work_type_id is available | NO |
| create_event | links array to attach contact/company/deal | NO |
| create_event | For meetings with reports use teamleader_schedule_meeting | YES (in description) |
| — | events.update exists but no tool | NO |
| — | events.cancel exists but no tool | NO |

### Tasks

| Tool | Known quirk | llmTip present? |
|------|-------------|-----------------|
| list_tasks | Standalone tasks vs project tasks distinction | YES (in description) |
| list_tasks | Many useful filters exist (completed, scheduled, due_by, due_from, user_id) | NO |
| create_task | project_id available for new projects module | NO |
| create_task | Standalone tasks vs project tasks distinction | YES (in description) |
| update_task | customer param available but missing from tool | NO |
| update_task | project_id available for new projects module | NO |
| schedule_task | Creates a calendar event, task status unchanged | YES (in description) |

---

## Summary of findings

### Critical bugs
1. **events.list `starts_after` and `ends_before`** — These 2 params in the tool schema do NOT exist in the API. The API only supports `filter.ends_after` and `filter.starts_before`. Sending non-existent filter params may be silently ignored or cause unexpected behavior.

### Missing endpoints
- `events.update` — no tool at all
- `events.cancel` — no tool at all

### Missing params (non-legacy)
- **events.list**: 8 missing filter params (ids, user_id, activity_type_id, term, attendee, link, task_id, done) + sort
- **events.create**: 2 missing (work_type_id, links)
- **tasks.list**: 6 missing filter params (ids, user_id, completed, scheduled, due_by, due_from) + sort
- **tasks.create**: 2 missing (project_id, custom_fields)
- **tasks.update**: 3 missing (project_id, customer, custom_fields)

### describe() quality
All existing params have describe(). No missing describe() calls.

### llmTip quality
No dedicated llmTip patterns. Some quirks documented in tool descriptions but most gaps have no warning.
