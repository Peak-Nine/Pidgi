# Audit: Timetracking Tools vs API Docs

Audit date: 2026-04-01 (re-audit — replaces 2026-03-05 version)
Source docs: `docs/api/330-335` (timeTracking.*), `docs/api/337-340` (timers.*)
Tool source: `src/tools/timetracking.ts`

---

## 1. teamleader_list_timetracking -> timeTracking.list

| API param | In tool? | Notes |
|-----------|----------|-------|
| filter.ids | NO | Array of IDs filter — missing |
| filter.user_id | YES | |
| filter.started_after | YES | Auto-converted from YYYY-MM-DD via `toDate()` |
| filter.started_before | YES | Auto-converted from YYYY-MM-DD via `toDate()` |
| filter.ended_after | YES | Added since last audit |
| filter.ended_before | YES | Added since last audit |
| filter.subject (id + type) | YES | Exposed as `subject_type` + `subject_id` params |
| filter.subject_types | NO | Array of types to include (incl. `null`) — missing |
| filter.relates_to (id + type) | NO | Find time linked to project/milestone — missing |
| sort | NO | Array of {field, order}, only field is `starts_on` — missing |
| page.size | YES | |
| page.number | YES | |
| includes | NO | `"materials,relates_to"` — not exposed (hardcoded in timesheet only) |

**Gaps: 5** (ids, subject_types, relates_to, sort, includes)

---

## 2. teamleader_get_timetracking -> timeTracking.info

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | Required |
| includes | NO | `"materials,relates_to"` — not exposed |

**Gaps: 1** (includes)

---

## 3. teamleader_add_timetracking -> timeTracking.add

API supports 3 body variants (oneOf): `started_at + duration`, `started_at + ended_at`, `started_on + duration`.

| API param | In tool? | Notes |
|-----------|----------|-------|
| started_at | YES | Tool param `started_on` maps to body `started_at` |
| ended_at | YES | Tool param `ended_on` maps to body `ended_at` |
| duration | YES | Alternative to ended_at |
| started_on (date-only) | NO | Duration-mode date-only variant. Low impact — datetime always works |
| work_type_id | YES | Optional (correct) |
| description | YES | |
| subject.id | YES | Optional (correct) |
| subject.type | YES | Enum: company, contact, event, milestone, nextgenTask, ticket, todo — matches API |
| invoiceable | YES | |
| user_id | YES | Optional, defaults to authenticated user |

**Gaps: 1** (started_on date-only variant — minor)

---

## 4. teamleader_update_timetracking -> timeTracking.update

API requires `started_at` or `started_on` (oneOf) + `duration` together.

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | Required |
| started_at (oneOf) | YES | Tool param `started_on` maps to body `started_at` |
| started_on (oneOf, date-only) | NO | Duration-mode variant. Low impact |
| work_type_id | YES | Nullable in API |
| duration | YES | API says required, tool makes optional with client-side guard (returns error if duration without started_on) |
| description | YES | Nullable in API |
| subject (id + type) | YES | Nullable in API |
| invoiceable | YES | |

**Gaps: 1** (started_on date-only variant — minor)

---

## 5. teamleader_delete_timetracking -> timeTracking.delete

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | Required |

**Gaps: 0**

---

## 6. teamleader_resume_timetracking -> timeTracking.resume

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | Required |
| started_at | YES | Optional, defaults to current time |

**Gaps: 0**

---

## 7. teamleader_start_timer -> timers.start

| API param | In tool? | Notes |
|-----------|----------|-------|
| work_type_id | YES | Optional (correct) |
| started_at | YES | Optional, defaults to current time |
| description | YES | |
| subject.id | YES | |
| subject.type | YES | Enum matches API: company, contact, event, todo, milestone, ticket |
| invoiceable | YES | |

**Gaps: 0**

---

## 8. teamleader_stop_timer -> timers.stop

| API param | In tool? | Notes |
|-----------|----------|-------|
| (none) | YES | API takes no params. Tool has dummy optional `id` param (documented as IGNORED) |

**Gaps: 0**

Note: Dummy `id` param is cosmetic noise — could be removed in future cleanup.

---

## 9. teamleader_get_current_timer -> timers.current

| API param | In tool? | Notes |
|-----------|----------|-------|
| (none) | YES | No request params |

**Gaps: 0**

---

## 10. teamleader_update_timer -> timers.update

| API param | In tool? | Notes |
|-----------|----------|-------|
| work_type_id | YES | Nullable in API |
| started_at | YES | |
| description | YES | Nullable in API |
| subject.id | YES | |
| subject.type | YES | Nullable in API. Enum matches API |
| invoiceable | YES | |

**Gaps: 0**

---

## 11. teamleader_timesheet (composite tool — not a direct API endpoint)

Uses `timeTracking.list` internally with `includes: "relates_to"`.
Resolves todo -> group -> project -> client chain via multiple `.info` API calls.
No param gap audit applicable — this is a higher-level reporting tool.

---

## Summary

| Tool | API endpoint | Gaps |
|------|-------------|------|
| teamleader_list_timetracking | timeTracking.list | 5 (ids, subject_types, relates_to, sort, includes) |
| teamleader_get_timetracking | timeTracking.info | 1 (includes) |
| teamleader_add_timetracking | timeTracking.add | 1 (started_on date-only — minor) |
| teamleader_update_timetracking | timeTracking.update | 1 (started_on date-only — minor) |
| teamleader_delete_timetracking | timeTracking.delete | 0 |
| teamleader_resume_timetracking | timeTracking.resume | 0 |
| teamleader_start_timer | timers.start | 0 |
| teamleader_stop_timer | timers.stop | 0 |
| teamleader_get_current_timer | timers.current | 0 |
| teamleader_update_timer | timers.update | 0 |
| teamleader_timesheet | (composite) | N/A |
| **Total** | | **8 gaps** |

### Priority gaps

1. **list: `includes`** — without this, materials and relates_to data not available in list output
2. **list: `relates_to`** — useful for filtering time by project/milestone
3. **list: `ids`** — batch lookup by ID
4. **list: `subject_types`** — filter by multiple subject types at once
5. **list: `sort`** — no sort control (only field is `starts_on`)
6. **info: `includes`** — materials and relates_to not requestable
7. **add/update: `started_on`** — date-only variant for duration-mode accounts (low priority)

### Changes since previous audit (2026-03-05)

All critical bugs from the 2026-03-05 audit have been fixed:
- `update_timetracking` now uses `started_at` + `duration` (was sending `ended_at`)
- `start_timer` no longer sends `user_id` (API has no such field)
- All subject type enums match the API
- `invoiceable` added to add/update/start_timer
- `ended_after`/`ended_before` filters added to list
- `started_at` added to start_timer
