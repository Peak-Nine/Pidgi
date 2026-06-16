# Audit: users.ts + departments.ts vs API docs

**Date:** 2026-03-05
**Files:** `src/tools/users.ts`, `src/tools/departments.ts`
**API docs:** 348-usersinfo, 349-userslist, 351-usersme, 094-departmentsinfo, 095-departmentslist

---

## 1. Endpoint coverage

| API endpoint | MCP tool | Status | Notes |
|-------------|----------|--------|-------|
| users.info | teamleader_get_user | ✅ | |
| users.list | teamleader_list_users | ✅ | |
| users.me | — | ❌ | Not in users.ts. Used internally in resolve.ts for cache initialization. No dedicated MCP tool exposed. |
| departments.info | teamleader_get_department | ✅ | |
| departments.list | teamleader_list_departments | ✅ | |

**Summary:** 4/5 endpoints covered. `users.me` has no dedicated tool (used internally only).

---

## 2. Param coverage

### teamleader_list_users (users.list)

| API param | In tool? | Notes |
|-----------|----------|-------|
| filter.ids | ❌ | Missing — filter by specific user IDs |
| filter.term | ❌ | Missing — search on first_name, last_name, email, function |
| filter.status | ❌ | Missing — filter active/deactivated |
| sort[].field | ❌ | Missing — first_name, last_name, email, function |
| sort[].order | ❌ | Missing — asc/desc |
| page.number | ✅ | As `page` param |
| page.size | ✅ | As `page_size` param |

### teamleader_get_user (users.info)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | ✅ | |
| includes | ❌ | Missing — `"external_rate"` to include hourly rate in response |

### teamleader_list_departments (departments.list)

| API param | In tool? | Notes |
|-----------|----------|-------|
| filter.ids | ❌ | Missing — filter by specific department IDs |
| filter.status | ✅ | |
| sort[].field | ✅ | |
| sort[].order | ✅ | |

### teamleader_get_department (departments.info)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | ✅ | |

**Summary:** 6 params present, 6 missing. Most critical missing: `filter.term` and `filter.status` on users.list (forces fetching all users to find one by name).

---

## 3. describe() coverage

### teamleader_list_users

| Param | Has describe()? |
|-------|-----------------|
| page | ✅ "Page number (default: 1)" |
| page_size | ✅ "Page size (default: 20, max: 100)" |

### teamleader_get_user

| Param | Has describe()? |
|-------|-----------------|
| id | ✅ "The user ID" |

### teamleader_list_departments

| Param | Has describe()? |
|-------|-----------------|
| status | ✅ "Filter by status (e.g. ['active'])" |
| sort_field | ✅ "Sort field" |
| sort_order | ✅ "Sort order (default: asc)" |

### teamleader_get_department

| Param | Has describe()? |
|-------|-----------------|
| id | ✅ "The department ID" |

**Summary:** All existing params have describe(). No gaps. Descriptions are minimal but functional.

---

## 4. llmTip coverage

| Tool | Known quirk / useful tip | llmTip present? | Notes |
|------|--------------------------|-----------------|-------|
| teamleader_list_users | No pagination needed for small teams — most accounts have <50 users | ❌ | |
| teamleader_list_users | users.me exists for current user — don't search by name | ❌ | |
| teamleader_get_user | `includes: "external_rate"` returns hourly rate (useful for billing) | ❌ | Param not even exposed |
| teamleader_list_departments | departments.list has NO pagination (returns all) | ❌ | Not documented in description |
| teamleader_get_department | Department IDs needed for invoices.draft (department_id param) | ❌ | Cross-reference missing |

**Summary:** No llmTips present in either file. Both files use basic descriptions without cross-references, next-step hints, or API quirk documentation.

---

## Summary of issues

### Bugs
None — the existing code is correct for the params it implements.

### Missing endpoints
- `users.me` — no dedicated tool (used internally in resolve.ts cache init)

### Missing params (by priority)
1. **users.list filter.term** — most impactful, forces full list fetch to find user by name
2. **users.list filter.status** — can't filter out deactivated users
3. **users.list filter.ids** — can't batch-fetch specific users
4. **users.list sort** — no sorting control
5. **users.info includes** — can't get external_rate
6. **departments.list filter.ids** — minor, departments are few

### Missing llmTips
- No cross-references (e.g. department_id → teamleader_list_departments)
- No next-step hints
- No API quirk documentation
- No "when to use" guidance
