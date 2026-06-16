# Audit: Deals + Quotations Tools vs API Docs

> Generated: 2026-04-01
> API docs source: `docs/api/` (scraped 2026-03-05)
> Tools source: `src/tools/deals.ts`, `src/tools/quotations.ts`

---

## deals.list (`teamleader_list_deals`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| filter.ids | YES | |
| filter.term | YES | |
| filter.customer (object: type+id) | YES | Mapped via customer_type + customer_id flat params |
| filter.phase_id | YES | |
| filter.estimated_closing_date (nullable, exact) | NO | **GAP** — API supports exact date filter separate from range |
| filter.estimated_closing_date_from | YES | |
| filter.estimated_closing_date_until | YES | |
| filter.responsible_user_id (string or string[]) | PARTIAL | Tool accepts string only, API also supports array |
| filter.updated_since | YES | |
| filter.created_before | NO | **GAP** — API supports filtering by creation date |
| filter.status | YES | |
| filter.pipeline_ids | YES | |
| page.size | YES | |
| page.number | YES | |
| sort[].field | YES | |
| sort[].order | YES | |
| includes | NO | **GAP** — API supports `includes=custom_fields` |

**Gaps: 4** (estimated_closing_date exact, created_before, responsible_user_id array, includes)

---

## deals.info (`teamleader_get_deal`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | |

**Gaps: 0**

---

## deals.create (`teamleader_create_deal`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| lead.customer.type | YES | Mapped via customer_type |
| lead.customer.id | YES | Mapped via customer_id |
| lead.contact_person_id | YES | |
| title | YES | |
| summary | YES | |
| source_id | YES | |
| department_id | YES | |
| responsible_user_id | YES | |
| phase_id | YES | Required in tool, optional in API |
| estimated_value.amount | YES | Mapped via estimated_value_amount |
| estimated_value.currency | YES | Mapped via estimated_value_currency |
| estimated_probability | YES | |
| estimated_closing_date | YES | |
| custom_fields | NO | **GAP** — API supports custom field values on create |
| currency (object: code, exchange_rate) | NO | **GAP** — API supports deal currency override |

**Gaps: 2** (custom_fields, currency)

---

## deals.update (`teamleader_update_deal`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | |
| lead.customer (object: type+id) | NO | **GAP** — Cannot change deal customer via tool |
| lead.contact_person_id | BUG | Tool sends `contact_person_id` at body root, API expects it inside `lead` object |
| title | YES | |
| summary (nullable) | YES | |
| source_id (nullable) | YES | |
| department_id (nullable) | YES | |
| responsible_user_id (nullable) | PARTIAL | Tool does not support passing null to clear |
| estimated_value (nullable, object) | YES | Mapped via flat params |
| estimated_probability (nullable) | YES | |
| estimated_closing_date (nullable) | YES | |
| custom_fields | NO | **GAP** — API supports custom field values on update |
| currency (object: code, exchange_rate) | NO | **GAP** — API supports deal currency override |

**Gaps: 4** (lead.customer, custom_fields, currency, responsible_user_id nullable)
**Bugs: 1** (contact_person_id wrong nesting — sent at root instead of inside `lead`)

---

## deals.delete (`teamleader_delete_deal`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | |

**Gaps: 0**

---

## deals.lose (`teamleader_lose_deal`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | |
| reason_id | YES | |
| extra_info | YES | |

**Gaps: 0**

---

## deals.win (`teamleader_win_deal`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | |

**Gaps: 0**

---

## deals.move (`teamleader_move_deal`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | |
| phase_id | YES | |

**Gaps: 0**

---

## dealPhases.list (`teamleader_list_deal_phases`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| filter.ids | YES | |
| filter.deal_pipeline_id | YES | Mapped from `pipeline_id` param |
| page.size | YES | Hardcoded 100 |
| page.number | YES | Hardcoded 1 |

**Gaps: 0**

---

## dealPhases.create (`teamleader_create_deal_phase`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| name | YES | |
| deal_pipeline_id | YES | |
| requires_attention_after.amount | YES | |
| requires_attention_after.unit | YES | |
| estimated_probability | YES | |
| follow_up_actions | YES | |

**Gaps: 0**

---

## dealPhases.update (`teamleader_update_deal_phase`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | |
| name | YES | |
| requires_attention_after.amount | YES | Required |
| requires_attention_after.unit | YES | Required |
| estimated_probability | YES | |
| follow_up_actions | YES | |

**Gaps: 0**

---

## dealPhases.delete (`teamleader_delete_deal_phase`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | |
| new_phase_id | YES | |

**Gaps: 0**

---

## dealPhases.duplicate (`teamleader_duplicate_deal_phase`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | |

**Gaps: 0**

---

## dealPhases.move (`teamleader_move_deal_phase`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | |
| after_phase_id | YES | |

**Gaps: 0**

---

## dealPipelines.list (`teamleader_list_deal_pipelines`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| filter.ids | YES | |
| filter.status | YES | |
| page.size | YES | Hardcoded 100 |
| page.number | YES | Hardcoded 1 |

**Gaps: 0**

---

## dealPipelines.create (`teamleader_create_deal_pipeline`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| name | YES | |

**Gaps: 0**

---

## dealPipelines.update (`teamleader_update_deal_pipeline`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | |
| name | YES | |

**Gaps: 0**

---

## dealPipelines.delete (`teamleader_delete_deal_pipeline`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | |
| migrate_phases | YES | |

**Gaps: 0**

---

## dealPipelines.duplicate (`teamleader_duplicate_deal_pipeline`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | |

**Gaps: 0**

---

## dealPipelines.markAsDefault (`teamleader_mark_deal_pipeline_default`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | |

**Gaps: 0**

---

## dealSources.list (`teamleader_list_deal_sources`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| filter.ids | NO | **GAP** — Minor: lookup tool hardcodes page |
| page.size | NO | Hardcoded 100 |
| page.number | NO | Hardcoded 1 |
| sort[].field | NO | Hardcoded name/asc (API default) |
| sort[].order | NO | Hardcoded |

**Gaps: 1** (filter.ids — the rest are acceptable hardcodes for a lookup tool)

---

## quotations.list (`teamleader_list_quotations`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| filter.ids | YES | |
| page.size | YES | |
| page.number | YES | |

**Gaps: 0**

---

## quotations.info (`teamleader_get_quotation`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | |

**Gaps: 0**

---

## quotations.create (`teamleader_create_quotation`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| deal_id | YES | |
| currency.code | YES | Mapped via currency_code |
| currency.exchange_rate | YES | Mapped via currency_exchange_rate |
| grouped_lines[].section.title | YES | Mapped via section_title |
| grouped_lines[].line_items[].quantity | YES | |
| grouped_lines[].line_items[].description | YES | |
| grouped_lines[].line_items[].extended_description | YES | |
| grouped_lines[].line_items[].unit_of_measure_id | YES | |
| grouped_lines[].line_items[].unit_price.amount | YES | Mapped via unit_price_amount |
| grouped_lines[].line_items[].unit_price.tax | YES | Hardcoded "excluding" |
| grouped_lines[].line_items[].tax_rate_id | YES | |
| grouped_lines[].line_items[].discount.value | YES | Mapped via discount_value |
| grouped_lines[].line_items[].discount.type | YES | Mapped via discount_type |
| grouped_lines[].line_items[].product_id | YES | |
| grouped_lines[].line_items[].purchase_price.amount | YES | Mapped via purchase_price_amount |
| grouped_lines[].line_items[].purchase_price.currency | YES | Mapped via purchase_price_currency |
| grouped_lines[].line_items[].periodicity.unit | YES | Mapped via periodicity_unit |
| grouped_lines[].line_items[].periodicity.period | YES | Mapped via periodicity_period |
| discounts[].type | YES | |
| discounts[].value | YES | |
| discounts[].description | YES | |
| text | YES | |
| document_template_id | YES | |
| expiry.expires_after | YES | Mapped via expiry_expires_after |
| expiry.action_after_expiry | YES | Mapped via expiry_action_after_expiry |

**Gaps: 0**

---

## quotations.update (`teamleader_update_quotation`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | |
| currency.code | YES | |
| currency.exchange_rate | YES | |
| grouped_lines (same nested structure as create) | YES | |
| discounts | YES | |
| text (nullable) | YES | |
| document_template_id | YES | |
| expiry.expires_after (nullable) | YES | |
| expiry.action_after_expiry | YES | |

**Gaps: 0**

---

## quotations.delete (`teamleader_delete_quotation`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | |

**Gaps: 0**

---

## quotations.accept (`teamleader_accept_quotation`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | |

**Gaps: 0**

---

## quotations.send (`teamleader_send_quotation`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| quotations (string[]) | YES | Mapped via quotation_ids |
| from.sender.type | YES | Mapped via from_sender_type |
| from.sender.id | YES | Mapped via from_sender_id |
| from.email_address | YES | Mapped via from_email_address |
| recipients.to[].customer (nullable object) | YES | |
| recipients.to[].email_address | YES | |
| recipients.cc | YES | |
| recipients.bcc | YES | |
| subject | YES | |
| content | YES | |
| attachments (string[]) | YES | |
| language | YES | |

**Gaps: 0**

---

## quotations.download (`teamleader_download_quotation`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | |
| format | YES | Required in API, optional in tool (defaults to "pdf") |

**Gaps: 0**

---

## Summary

### Deals domain

| Tool | Gaps | Bugs |
|------|------|------|
| teamleader_list_deals | 4 | 0 |
| teamleader_get_deal | 0 | 0 |
| teamleader_create_deal | 2 | 0 |
| teamleader_update_deal | 4 | 1 |
| teamleader_delete_deal | 0 | 0 |
| teamleader_lose_deal | 0 | 0 |
| teamleader_win_deal | 0 | 0 |
| teamleader_move_deal | 0 | 0 |
| teamleader_list_deal_phases | 0 | 0 |
| teamleader_create_deal_phase | 0 | 0 |
| teamleader_update_deal_phase | 0 | 0 |
| teamleader_delete_deal_phase | 0 | 0 |
| teamleader_duplicate_deal_phase | 0 | 0 |
| teamleader_move_deal_phase | 0 | 0 |
| teamleader_list_deal_pipelines | 0 | 0 |
| teamleader_create_deal_pipeline | 0 | 0 |
| teamleader_update_deal_pipeline | 0 | 0 |
| teamleader_delete_deal_pipeline | 0 | 0 |
| teamleader_duplicate_deal_pipeline | 0 | 0 |
| teamleader_mark_deal_pipeline_default | 0 | 0 |
| teamleader_list_deal_sources | 1 | 0 |
| **TOTAL** | **11** | **1** |

### Quotations domain

| Tool | Gaps | Bugs |
|------|------|------|
| teamleader_list_quotations | 0 | 0 |
| teamleader_get_quotation | 0 | 0 |
| teamleader_create_quotation | 0 | 0 |
| teamleader_update_quotation | 0 | 0 |
| teamleader_delete_quotation | 0 | 0 |
| teamleader_accept_quotation | 0 | 0 |
| teamleader_send_quotation | 0 | 0 |
| teamleader_download_quotation | 0 | 0 |
| **TOTAL** | **0** | **0** |

### Critical issues

1. **BUG — `teamleader_update_deal` sends `contact_person_id` at body root** instead of inside `lead` object. API expects `{ lead: { customer: {...}, contact_person_id: "..." } }` but tool sends `{ id: "...", contact_person_id: "..." }`. This will silently be ignored by the API.

2. **GAP — `custom_fields` missing from deals.create and deals.update.** These are commonly used in Teamleader for extended CRM data.

3. **GAP — `currency` object missing from deals.create and deals.update.** Needed for multi-currency deals.

4. **GAP — `deals.list` missing `includes` param** — cannot request custom_fields in list response.

5. **GAP — `deals.update` cannot change lead.customer** — no way to reassign a deal to a different customer.
