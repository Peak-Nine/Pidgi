# Audit Report — GUIDELINES-MCP.md Self-Containment Checklist

**Date:** 2026-03-04
**Audited against:** `GUIDELINES-MCP.md` from Tailormade.CodingMachine
**Total tools audited:** 119 across 16 files

---

## Summary Table

| File | Tools | Desc Quality | Param describe() | Silent Catches | API Quirks Documented | Error Patterns |
|------|------:|:------------:|:----------------:|:--------------:|:--------------------:|:--------------:|
| resolve.ts | 6 | ★★★★ | ★★★★ | 1 issue | Partial | 0 |
| contacts.ts | 9 | ★★ | ★★★ | 0 | N/A | 0 |
| companies.ts | 4 | ★★ | ★★★ | 0 | N/A | 0 |
| deals.ts | 11 | ★★★ | ★★★ | 0 | N/A | 0 |
| tasks.ts | 7 | ★★ | ★★★ | 0 | N/A | 0 |
| events.ts | 3 | ★★ | ★★★ | 0 | N/A | 0 |
| invoices.ts | 14 | ★★★ | ★★★ | 0 | Missing | 0 |
| timetracking.ts | 9 | ★★★ | ★★★ | 0 | Partial | 0 |
| projects.ts | 20 | ★★ | ★★★ | 0 | Missing | 0 |
| tickets.ts | 7 | ★★★ | ★★★ | 0 | Missing | 0 |
| meetings.ts | 7 | ★★★ | ★★★ | 0 | N/A | 0 |
| departments.ts | 2 | ★★★ | ★★★ | 0 | N/A | 0 |
| lookups.ts | 10 | ★★★ | ★★★ | 0 | N/A | 0 |
| files.ts | 5 | ★★★ | ★★★ | 0 | N/A | 0 |
| notes.ts | 3 | ★★★ | ★★★ | 0 | N/A | 0 |
| users.ts | 2 | ★★★ | ★★★ | 0 | N/A | 0 |

**Rating:** ★ = poor, ★★ = basic, ★★★ = adequate, ★★★★ = good, ★★★★★ = excellent

---

## Gap Analysis by Category

### 1. Tool Description Quality

**Guideline requirement:** Every tool must answer: What / When to use / Parameters / Output format / Next steps.

**Findings:**

| Rating | Count | Example |
|--------|------:|---------|
| Excellent (5/5 criteria) | 3 | `find_task`, `load_tasks`, `log_time` |
| Good (3-4/5) | ~25 | `task_action`, `upload_file`, `schedule_meeting` |
| Basic (1-2/5) | ~91 | Most CRUD tools across all files |

**Common gaps across 91 "basic" tools:**
- **Missing "when to use"** — e.g. `teamleader_list_contacts` says "List contacts from Teamleader Focus" but not *when* an LLM should choose this over `find_task` or other search mechanisms.
- **Missing output format** — No tool describes what the response JSON looks like. LLM must trial-and-error to understand response shape.
- **Missing next steps** — e.g. `teamleader_get_company` doesn't mention "use the returned ID with `teamleader_list_projects_v2(company_id=...)` to see projects."
- **Missing cross-references** — e.g. `teamleader_create_task` doesn't mention `teamleader_list_work_types` for work_type_id.

**Notable exceptions (good descriptions):**
- `resolve.ts` tools: `find_task`, `log_time`, `load_tasks` have multi-line descriptions covering all 5 criteria.
- `deals.ts` lookup tools: `lose_deal`, `move_deal`, `list_deal_phases` cross-reference each other.
- `invoices.ts`: `book_invoice`, `update_invoice`, `register_payment` mention prerequisites.
- `files.ts`: `upload_file` explains the two-step process.

---

### 2. llmTip / API Quirks in Descriptions

**Guideline requirement:** Known API quirks should be documented via `llmTip` or in the description with CRITICAL/WARNING/NOTE prefixes.

**Finding: No `llmTip` mechanism exists in this MCP.** All quirk documentation (if any) is in the description string.

#### Quirks documented in tool descriptions

| Quirk | Documented? | Where |
|-------|:-----------:|-------|
| `timeTracking.list` date-only filter | ✅ Partial | `started_after` param describe in timetracking.ts |
| `timeTracking.update` requires both started_at + ended_at | ✅ | Code handles it (auto-fetch), but NOT in description |
| `files.upload` two-step process | ✅ | upload_file description |
| `projects.close` requires closing_strategy | ✅ | close_project_v2 description |
| `projects.delete` requires delete_strategy | ✅ | delete_project_v2 description |

#### Quirks NOT documented in any tool description

| Quirk (from CLAUDE.md) | Impact | Affected Tools |
|-------------------------|--------|----------------|
| `projectLines.list`: project_id must be top-level, NOT in filter | LLM could construct wrong API call | `list_project_groups`, `list_project_tasks_v2` |
| `projectLines.list`: project_group_id is NOT server-side filter | LLM might expect server filtering | `list_project_tasks_v2` |
| `tasks.create` (v2): use `group_id` (NOT `project_group_id`) | Wrong field name → error | `create_project_task_v2` |
| `tasks.create` (v2): use `assignees: [{type,id}]` (NOT `assignee_id`) | Wrong field → silently ignored | `create_project_task_v2` |
| `projectGroups.create`: use `start_date`/`end_date` (NOT `starts_on`/`due_on`) | Wrong field → silently ignored | `create_project_group` |
| `projectGroups.update`: use `start_date`/`end_date` | Same | `update_project_group` |
| `invoices.registerPayment`: use `paid_at` (NOT `payment_date`) | Wrong field → error | `register_payment` |
| `invoices.registerPayment`: nested `payment: {amount: {amount, currency}}` | Wrong structure → error | `register_payment` |
| `invoices.creditPartially`: `unit_price.tax: "excluding"` (NOT currency) | Wrong field → error | `credit_invoice_partially` |
| `tickets.list`: customer filter uses `relates_to` (NOT `customer_id`) | Wrong filter → no results | `list_tickets` |
| `tickets.list`: status filter uses `exclude.status_ids` (no direct status) | LLM might try direct status filter | `list_tickets` |
| `timeTracking.list`: dedup by start time, NOT by subject ID | Dedup mismatches | `log_time` (internal) |
| `timeTracking.add`: use `toFilterDate()` (strip milliseconds) | Dedup mismatches | `log_time` (internal) |
| `timers.stop`: takes NO parameters | LLM might pass task_id | `stop_timer` |

**Note:** While code *implements* these quirks correctly, the descriptions don't warn the LLM. This matters because the LLM reads descriptions to understand the tool, and quirk-free descriptions could lead to confusion if the LLM tries to understand or debug API behavior.

---

### 3. Silent Catches

| Location | Code | Severity | Issue |
|----------|------|:--------:|-------|
| `resolve.ts:597-600` | `catch (e) { console.error("Dedup check failed:", e); }` | ⚠️ Medium | Dedup failure is swallowed — user gets no warning that duplicates were not checked. Could result in duplicate time entries. |
| `resolve.ts:629` | `catch { return respond(…) }` | ✅ OK | Catches verification failure and returns descriptive error. |
| `resolve.ts:907-909` | `catch (e) { console.error(…) }` | ⚠️ Low | YAML file write failure is swallowed. User won't know the file wasn't written. |
| `resolve.ts:62-64, 75-77, 104-107` | `catch (e) { console.error(…) }` | ✅ OK | Startup init failures — logged, non-critical. |
| `api/cache.ts:130` | `catch { return {}; }` | ✅ OK | Cache file missing — expected on first run. |
| `api/auth.ts:22` | `catch { }` | ⚠️ Low | Token file missing — expected, but truly silent (no log). |

**Total silent catches: 2 medium-severity issues in resolve.ts**

---

### 4. Parameter describe() Quality

**Guideline requirement:** Every parameter must have `.describe()` with format + constraints + gotchas.

**Findings:**

| Quality Level | Count | Example |
|---------------|------:|---------|
| Good (format + constraints) | ~40% | `started_after: "Filter entries started after this date (YYYY-MM-DD). Time is stripped automatically."` |
| Adequate (what it does) | ~50% | `id: z.string().describe("The contact ID")` |
| Weak (just a label) | ~10% | `work_type_id: z.string().describe("Type of work performed")` |

**Specific issues:**
- `work_type_id` parameters across multiple files say "Type of work performed" or "Work type ID" without mentioning `teamleader_list_work_types` to find IDs.
- `activity_type_id` in events.ts says "Activity type ID" without referencing `teamleader_list_activity_types`.
- `tax_rate_id` in invoices.ts line items don't reference `teamleader_list_tax_rates`.
- `department_id` across files doesn't reference `teamleader_list_departments`.
- `ticket_status_id` doesn't reference `teamleader_list_ticket_statuses`.

---

### 5. Error Patterns (ERROR → CAUSE → FIX)

**Guideline requirement:** Known API errors should be documented with ERROR → CAUSE → FIX.

**Finding: Zero error patterns documented in any tool description.**

Known errors that should be documented:

| Error | Cause | Fix | Affected Tool |
|-------|-------|-----|---------------|
| 400 Bad Request on `timeTracking.list` | ISO datetime without timezone sent directly to API | Pass `YYYY-MM-DD` to MCP filter params — `toDate()` converts to ISO 8601 (`T00:00:00+00:00`) automatically | `list_timetracking` |
| 400 `started_at must be present` | Sending only `ended_at` in `timeTracking.update` | Always send both `started_at` + `ended_at` | `update_timetracking` |
| Empty/wrong results on `tickets.list` | Using `customer_id` instead of `relates_to: {type, id}` | Use `relates_to` structure | `list_tickets` |
| Silent ignore on `tasks.create` | Using `assignee_id` instead of `assignees: [{type,id}]` | Use array format | `create_project_task_v2` |
| 400 on `projectGroups.delete` | Missing `delete_strategy` | Include `delete_strategy` param | `task_action(delete_group)` |

---

## Per-File Findings

### resolve.ts (6 tools) — Best coverage

| Tool | Description | Params | Issues |
|------|:-----------:|:------:|--------|
| `find_task` | ★★★★ | ★★★★ | None |
| `log_time` | ★★★★ | ★★★★ | Dedup catch swallows errors (line 597) |
| `load_tasks` | ★★★★ | ★★★★ | YAML write failure silent (line 907) |
| `task_action` | ★★★ | ★★★ | Missing: which actions require which params |
| `cache_stats` | ★★ | ★★★ | Missing: when to use, output format |
| `clear_cache` | ★★ | — | Missing: when to use, consequences |

### contacts.ts (9 tools)

All tools have basic "does X in Teamleader Focus" descriptions. Missing: output format, next steps, cross-references.

### companies.ts (4 tools)

Same pattern as contacts. No cross-references to projects/deals.

### deals.ts (11 tools)

Better than contacts — lookup tools cross-reference each other. But CRUD tools still generic.

- `lose_deal` ✅ references `list_lost_reasons`
- `move_deal` ✅ references `list_deal_phases`
- `create_deal` ❌ doesn't reference `list_deal_phases` or `list_deal_sources`

### tasks.ts (7 tools)

Generic descriptions. `create_task` mentions required params but doesn't cross-reference `list_work_types`.

### events.ts (3 tools)

Generic. `create_event` doesn't reference `list_activity_types` for `activity_type_id`.

### invoices.ts (14 tools)

Mixed quality. Some good (`book_invoice`, `send_invoice`), most basic.

- `register_payment` — missing API quirk about `paid_at` field name and nested structure.
- `credit_invoice_partially` — missing quirk about `unit_price.tax: "excluding"`.
- `create_invoice` / `update_invoice` — don't reference `list_tax_rates`, `list_payment_terms`.

### timetracking.ts (9 tools)

- `list_timetracking` — param describe documents date-only format ✅
- `update_timetracking` — code handles started_at+ended_at requirement ✅ but description doesn't mention it
- **BUG: `stop_timer` has an unused `id` parameter** — `timers.stop` takes no params per API, but tool accepts `id` and ignores it. Misleading.
- `start_timer` — description should mention only one timer per user

### projects.ts (20 tools)

Most have generic descriptions. Code correctly implements quirks but descriptions don't document them.

- `list_project_tasks_v2` — `only_open` defaults to `false`, but CLAUDE.md says default should be `true`
- `create_project_group` — correctly maps `starts_on`→`start_date` in code, but description uses `starts_on`/`due_on` param names (could confuse LLM into thinking API uses those names)

### tickets.ts (7 tools)

- `list_tickets` — description mentions filtering capabilities but not the `relates_to` quirk.
- `create_ticket` — good, lists requirements.

### meetings.ts (7 tools)

Decent descriptions, especially `schedule_meeting` and `update_meeting`. Missing: activity type reference.

### departments.ts, lookups.ts, files.ts, notes.ts, users.ts

Adequate for their complexity. Lookups generally explain what returned IDs are for.

---

## Top 10 Highest-Priority Improvements

| # | Priority | File | Issue | Impact |
|---|:--------:|------|-------|--------|
| 1 | 🔴 Critical | timetracking.ts | `stop_timer` has unused `id` param — `timers.stop` takes no params | LLM passes ID thinking it matters; misleading |
| 2 | ✅ Fixed | resolve.ts | `initializeCache` date filter — `toDate()` converts to ISO 8601 (`T00:00:00+00:00`). API requires ISO 8601 datetime, not date-only. | Fixed — old audit was wrong about date-only |
| 3 | 🔴 Critical | resolve.ts:556 | `log_time` dedup sends datetime to `started_after`/`started_before` (should be date-only) | Dedup check fails silently → duplicate entries |
| 4 | 🟠 High | ALL files | No `llmTip` mechanism — 14 known API quirks undocumented in tool descriptions | LLM has no way to know quirks without CLAUDE.md |
| 5 | 🟠 High | ALL CRUD files | ~91 tools missing output format + next steps in description | LLM must trial-and-error to understand responses |
| 6 | 🟠 High | ALL files | Zero ERROR → CAUSE → FIX patterns documented | LLM can't self-diagnose API errors |
| 7 | 🟡 Medium | invoices.ts | `register_payment` doesn't document `paid_at` field name or nested payment structure | Error-prone if LLM reconstructs the call |
| 8 | 🟡 Medium | ~15 tools | ID params (work_type_id, activity_type_id, tax_rate_id, etc.) don't reference lookup tools | LLM doesn't know where to get IDs |
| 9 | 🟡 Medium | projects.ts | `list_project_tasks_v2` defaults `only_open=false` (CLAUDE.md says default `true`) | Returns too many tasks by default |
| 10 | 🟡 Medium | resolve.ts:597 | Dedup catch swallows error — user gets no warning | Potential duplicate time entries |

---

## Known API Quirks Not Yet Documented in Tool Descriptions

Complete list from CLAUDE.md that are **implemented in code but NOT mentioned in tool descriptions**:

1. `projectLines.list` — `project_id` must be top-level (NOT inside `filter`)
2. `projectLines.list` — `project_group_id` is NOT server-side filter (client-side only)
3. `projects-v2/tasks.create` — use `group_id` (NOT `project_group_id`)
4. `projects-v2/tasks.create` — use `assignees: [{type:"user",id}]` (NOT `assignee_id`)
5. `projectGroups.create` — use `start_date`/`end_date` (NOT `starts_on`/`due_on`)
6. `projectGroups.update` — use `start_date`/`end_date` (NOT `starts_on`/`due_on`)
7. `timeTracking.list` — `started_after`/`started_before` accept date-only (`YYYY-MM-DD`)
8. `timeTracking.update` — no partial time updates (always send both `started_at` + `ended_at`)
9. `timeTracking.add` — strip milliseconds from datetime (use `toFilterDate()`)
10. `timeTracking.list` — dedup by start time (to second precision), NOT by subject ID
11. `invoices.registerPayment` — use `paid_at` (NOT `payment_date`)
12. `invoices.registerPayment` — nested: `{payment: {amount, currency}, paid_at}`
13. `invoices.creditPartially` — `unit_price.tax: "excluding"` (NOT a currency field)
14. `tickets.list` — customer filter: `relates_to: {type, id}` (NOT `customer_id`)
15. `tickets.list` — status filter: `exclude.status_ids` (no direct status filter)
16. `timers.stop` — takes NO parameters (stops current user's timer)
17. `projects.assign`/`addCustomer` — always use `{type, id}` objects (never flat IDs)

---

## CLAUDE.md Compliance

| Requirement | Status |
|-------------|:------:|
| Architecture documented | ✅ Comprehensive |
| Tool registration pattern documented | ✅ |
| Adding new tools guide | ✅ With template |
| Known API quirks listed | ✅ Comprehensive (17 items) |
| Build/test commands | ✅ |
| Cache strategy documented | ✅ |
| Task tree documented | ✅ |

**CLAUDE.md is excellent** — all the knowledge is there. The gap is that this knowledge doesn't flow into the tool descriptions that the LLM actually reads at runtime.

---

## Recommendations

### Phase 1: Critical Fixes (code bugs)
1. Fix `stop_timer` — remove unused `id` param
2. Fix `initializeCache` — use date-only for `started_after`
3. Fix `log_time` dedup — use date-only for filter dates
4. Fix `list_project_tasks_v2` — default `only_open=true`

### Phase 2: Tool Descriptions (llmTip equivalent)
5. Add API quirk warnings to affected tool descriptions (prefix with `CRITICAL:` / `WARNING:`)
6. Add output format hints to all tools (e.g. "Returns JSON with data array of {id, name, ...}")
7. Add next-step cross-references to all tools
8. Add ERROR → CAUSE → FIX for known error scenarios

### Phase 3: Parameter Descriptions
9. Cross-reference lookup tools in all ID parameters
10. Add format examples to date/time parameters
