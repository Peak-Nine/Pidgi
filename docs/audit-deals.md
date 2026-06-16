# Audit: deals.ts vs API docs (2026-03-05)

## 1. Endpoint Coverage

| API endpoint | MCP tool | Status |
|-------------|----------|--------|
| `deals.list` | `teamleader_list_deals` | OK |
| `deals.info` | `teamleader_get_deal` | OK |
| `deals.create` | `teamleader_create_deal` | OK |
| `deals.update` | `teamleader_update_deal` | OK |
| `deals.delete` | `teamleader_delete_deal` | OK |
| `deals.lose` | `teamleader_lose_deal` | OK |
| `deals.win` | `teamleader_win_deal` | OK |
| `deals.move` | `teamleader_move_deal` | OK |
| `dealPhases.list` | `teamleader_list_deal_phases` | OK |
| `dealPhases.create` | — | MISSING |
| `dealPhases.update` | — | MISSING |
| `dealPhases.delete` | — | MISSING |
| `dealPhases.duplicate` | — | MISSING |
| `dealPhases.move` | — | MISSING |
| `dealPipelines.list` | `teamleader_list_deal_pipelines` | OK |
| `dealPipelines.create` | — | MISSING |
| `dealPipelines.update` | — | MISSING |
| `dealPipelines.delete` | — | MISSING |
| `dealPipelines.duplicate` | — | MISSING |
| `dealPipelines.markAsDefault` | — | MISSING |
| `lostReasons.list` | `teamleader_list_lost_reasons` | OK |
| `dealSources.list` | `teamleader_list_deal_sources` | OK |

**Summary:** 12/22 endpoints covered. 10 missing (5 dealPhases CRUD, 5 dealPipelines CRUD).

---

## 2. Param Coverage

### `teamleader_list_deals` (deals.list)

| API param | In tool? | Notes |
|-----------|----------|-------|
| `filter.ids` | NO | Array of deal IDs |
| `filter.term` | YES | |
| `filter.customer` | NO | Object `{type, id}` — not flat customer_id |
| `filter.phase_id` | YES | |
| `filter.estimated_closing_date` | NO | Exact date filter (nullable) |
| `filter.estimated_closing_date_from` | NO | Inclusive date range start |
| `filter.estimated_closing_date_until` | NO | Inclusive date range end |
| `filter.responsible_user_id` | YES | API accepts string OR string[] — tool only supports string |
| `filter.updated_since` | YES | |
| `filter.created_before` | NO | Inclusive datetime filter |
| `filter.status` | NO | Array: `["open","won","lost"]` |
| `filter.pipeline_ids` | NO | Array of pipeline IDs |
| `sort` | NO | Fields: `created_at`, `weighted_value`; order: `asc`, `desc` |
| `includes` | NO | `custom_fields` |
| `page` | YES | |

**Missing: 8 filter params + sort + includes**

### `teamleader_get_deal` (deals.info)

| API param | In tool? | Notes |
|-----------|----------|-------|
| `id` | YES | Only param — correct |

### `teamleader_create_deal` (deals.create)

| API param | In tool? | Notes |
|-----------|----------|-------|
| `lead.customer.type` | YES | As `customer_type` |
| `lead.customer.id` | YES | As `customer_id` |
| `lead.contact_person_id` | NO | Contact person on company customer |
| `title` | YES | |
| `summary` | NO | Free text summary |
| `source_id` | YES | |
| `department_id` | YES | |
| `responsible_user_id` | YES | |
| `phase_id` | YES | API has it optional, tool makes it required |
| `estimated_value` | YES | |
| `estimated_probability` | YES | |
| `estimated_closing_date` | YES | |
| `custom_fields` | NO | Array of `{id, value}` |

**Missing: 3 params (contact_person_id, summary, custom_fields)**

### `teamleader_update_deal` (deals.update)

| API param | In tool? | Notes |
|-----------|----------|-------|
| `id` | YES | |
| `lead.customer` | NO | Can change customer type+id |
| `lead.contact_person_id` | NO | |
| `title` | YES | |
| `summary` | NO | Nullable — can be cleared |
| `source_id` | NO | Nullable |
| `department_id` | NO | Nullable |
| `responsible_user_id` | YES | |
| `estimated_value` | YES | |
| `estimated_probability` | YES | |
| `estimated_closing_date` | YES | |
| `custom_fields` | NO | |
| `currency` | NO | Object `{code, exchange_rate}` |

**Missing: 6 params (lead, contact_person_id, summary, source_id, department_id, custom_fields, currency)**

### `teamleader_delete_deal` (deals.delete)

| API param | In tool? | Notes |
|-----------|----------|-------|
| `id` | YES | Only param — correct |

### `teamleader_lose_deal` (deals.lose)

| API param | In tool? | Notes |
|-----------|----------|-------|
| `id` | YES | |
| `reason_id` | YES | |
| `extra_info` | YES | |

**Complete — all params covered**

### `teamleader_win_deal` (deals.win)

| API param | In tool? | Notes |
|-----------|----------|-------|
| `id` | YES | Only param — correct |

### `teamleader_move_deal` (deals.move)

| API param | In tool? | Notes |
|-----------|----------|-------|
| `id` | YES | |
| `phase_id` | YES | |

**Complete — all params covered**

### `teamleader_list_deal_phases` (dealPhases.list)

| API param | In tool? | Notes |
|-----------|----------|-------|
| `filter.ids` | NO | Array of phase IDs |
| `filter.deal_pipeline_id` | BUG | Tool sends `pipeline_id` but API expects `deal_pipeline_id` |
| `page` | YES | Hardcoded size=100 |

**BUG: filter field name is wrong — sends `pipeline_id` instead of `deal_pipeline_id`**

### `teamleader_list_lost_reasons` (lostReasons.list)

| API param | In tool? | Notes |
|-----------|----------|-------|
| `filter.ids` | NO | |
| `sort` | NO | Field: `name`, order: `asc` |
| `page` | YES | Hardcoded size=100 |

### `teamleader_list_deal_sources` (dealSources.list)

| API param | In tool? | Notes |
|-----------|----------|-------|
| `filter.ids` | NO | |
| `sort` | NO | Field: `name`, order: `asc` |
| `page` | YES | Hardcoded size=100 |

### `teamleader_list_deal_pipelines` (dealPipelines.list)

| API param | In tool? | Notes |
|-----------|----------|-------|
| `filter.ids` | NO | |
| `filter.status` | NO | `["open", "pending_deletion"]` |
| `page` | YES | Hardcoded size=100 |

---

## 3. describe() Coverage

### `teamleader_list_deals`

| Param | Has describe()? |
|-------|-----------------|
| `page` | YES |
| `page_size` | YES |
| `term` | YES |
| `phase_id` | YES — has cross-ref |
| `responsible_user_id` | YES |
| `updated_since` | YES |

### `teamleader_get_deal`

| Param | Has describe()? |
|-------|-----------------|
| `id` | YES |

### `teamleader_create_deal`

| Param | Has describe()? |
|-------|-----------------|
| `title` | YES |
| `customer_type` | YES |
| `customer_id` | YES |
| `phase_id` | YES — has cross-ref |
| `estimated_value_amount` | YES |
| `estimated_value_currency` | YES |
| `estimated_closing_date` | YES |
| `estimated_probability` | YES |
| `responsible_user_id` | YES |
| `department_id` | YES — has cross-ref |
| `source_id` | YES — has cross-ref |

### `teamleader_update_deal`

| Param | Has describe()? |
|-------|-----------------|
| `id` | YES |
| `title` | YES |
| `estimated_value_amount` | YES |
| `estimated_value_currency` | YES |
| `estimated_closing_date` | YES |
| `estimated_probability` | YES |
| `responsible_user_id` | YES |

### `teamleader_delete_deal`

| Param | Has describe()? |
|-------|-----------------|
| `id` | YES |

### `teamleader_lose_deal`

| Param | Has describe()? |
|-------|-----------------|
| `id` | YES |
| `reason_id` | YES — has cross-ref |
| `extra_info` | YES |

### `teamleader_win_deal`

| Param | Has describe()? |
|-------|-----------------|
| `id` | YES |

### `teamleader_move_deal`

| Param | Has describe()? |
|-------|-----------------|
| `id` | YES |
| `phase_id` | YES — has cross-ref |

### `teamleader_list_deal_phases`

| Param | Has describe()? |
|-------|-----------------|
| `pipeline_id` | YES |

### Lookup tools (lost_reasons, deal_sources, deal_pipelines)

No params (or no user-facing params) — N/A.

**Summary: All existing params have describe(). All cross-references present.**

---

## 4. llmTip Coverage

| Tool | Known quirk | llmTip present? |
|------|-------------|-----------------|
| `teamleader_list_deals` | `customer` filter is object `{type, id}`, not flat `customer_id` | NO |
| `teamleader_list_deals` | `responsible_user_id` supports string OR array | NO |
| `teamleader_list_deals` | `status` filter is array `["open","won","lost"]` | NO — filter not exposed |
| `teamleader_create_deal` | `phase_id` is optional in API but required in tool | NO |
| `teamleader_update_deal` | Can change customer via `lead` object | NO — param not exposed |
| `teamleader_update_deal` | Missing `source_id`, `department_id` that are on create | NO |
| `teamleader_list_deal_phases` | Filter field is `deal_pipeline_id` not `pipeline_id` | NO — this is a **BUG** |
| `teamleader_win_deal` | Description says irreversible — good | Partially (in description) |

---

## Critical Findings

### BUG: `teamleader_list_deal_phases` sends wrong filter field name
Line 327: `body.filter = { pipeline_id: params.pipeline_id }` — API expects `deal_pipeline_id`.

### Missing endpoints (10)
- `dealPhases.create/update/delete/duplicate/move` (5)
- `dealPipelines.create/update/delete/duplicate/markAsDefault` (5)

### Missing params (priority)
- `deals.list`: `status`, `customer`, `pipeline_ids`, `created_before`, `estimated_closing_date_from/until`, `sort`, `includes`
- `deals.create`: `summary`, `contact_person_id`, `custom_fields`
- `deals.update`: `lead`, `summary`, `source_id`, `department_id`, `custom_fields`, `currency`
