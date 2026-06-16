# Audit: Remaining Tools vs API Docs

> Generated: 2026-04-01
> Method: API doc → tool implementation comparison
> Scope: subscriptions, materials, calls, notes, files, orders, users, departments, lookups, products, creditnotes

---

## 1. subscriptions.ts

### teamleader_list_subscriptions (subscriptions.list — doc 299)

| API param | In tool? | Notes |
|-----------|----------|-------|
| filter.ids | YES | |
| filter.invoice_id | YES | |
| filter.deal_id | YES | |
| filter.department_id | YES | |
| filter.customer | YES | Built from customer_type + customer_id |
| filter.status | YES | |
| page.size | YES | as page_size |
| page.number | YES | as page |
| sort[].field | YES | as sort_field |
| sort[].order | YES | as sort_order |

**Missing: 0 params** ✅

---

### teamleader_get_subscription (subscriptions.info — doc 298)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | |

**Missing: 0 params** ✅

---

### teamleader_create_subscription (subscriptions.create — doc 296)

| API param | In tool? | Notes |
|-----------|----------|-------|
| invoicee.customer.type | YES | as customer_type |
| invoicee.customer.id | YES | as customer_id |
| invoicee.for_attention_of | **NO** | Object: {name} or {contact_id} |
| department_id | YES | |
| starts_on | YES | |
| billing_cycle.periodicity.unit | YES | as billing_unit |
| billing_cycle.periodicity.period | YES | as billing_period |
| billing_cycle.days_in_advance | YES | |
| title | YES | |
| grouped_lines[].section.title | **NO** | Section title for grouped lines |
| grouped_lines[].line_items[].quantity | YES | |
| grouped_lines[].line_items[].description | YES | |
| grouped_lines[].line_items[].extended_description | **NO** | Markdown extended description |
| grouped_lines[].line_items[].unit_of_measure_id | **NO** | Unit of measure for line item |
| grouped_lines[].line_items[].unit_price.amount | YES | as unit_price_amount |
| grouped_lines[].line_items[].unit_price.tax | YES | Hardcoded "excluding" |
| grouped_lines[].line_items[].tax_rate_id | YES | |
| grouped_lines[].line_items[].discount | **NO** | Object: {value, type:"percentage"} |
| grouped_lines[].line_items[].product_id | YES | |
| grouped_lines[].line_items[].withholding_tax_rate_id | **NO** | |
| grouped_lines[].line_items[].product_category_id | **NO** | |
| ends_on | YES | |
| deal_id | YES | |
| project_id | YES | |
| note | YES | |
| payment_term.type | YES | as payment_term_type |
| payment_term.days | YES | as payment_term_days |
| invoice_generation.action | YES | as invoice_generation_action |
| invoice_generation.sending_methods | **NO** | Array of {method} for book_and_send — tool only has mail_template_id |
| invoice_generation.payment_method | **NO** | "direct_debit" option |
| custom_fields[] | **NO** | Array of {id, value} |

**Missing: 9 params** (for_attention_of, section.title, extended_description, unit_of_measure_id, discount, withholding_tax_rate_id, product_category_id, sending_methods, payment_method, custom_fields)

---

### teamleader_update_subscription (subscriptions.update — doc 300)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | |
| starts_on | YES | |
| billing_cycle.periodicity | YES | as billing_unit + billing_period |
| billing_cycle.days_in_advance | YES | |
| ends_on | YES | |
| title | YES | |
| invoicee.customer | YES | as customer_type + customer_id |
| invoicee.for_attention_of | **NO** | Object: {name} or {contact_id} |
| department_id | YES | |
| payment_term | YES | as payment_term_type + payment_term_days |
| project_id | YES | |
| deal_id | YES | |
| note | YES | |
| grouped_lines[] | YES | as line_items |
| grouped_lines[].section.title | **NO** | Section title |
| grouped_lines[].line_items[].extended_description | **NO** | |
| grouped_lines[].line_items[].unit_of_measure_id | **NO** | |
| grouped_lines[].line_items[].discount | **NO** | |
| grouped_lines[].line_items[].withholding_tax_rate_id | **NO** | |
| grouped_lines[].line_items[].product_category_id | **NO** | |
| invoice_generation | YES | as invoice_generation_action |
| invoice_generation.sending_methods | **NO** | |
| invoice_generation.payment_method | **NO** | |
| custom_fields[] | **NO** | |

**Missing: 9 params** (same pattern as create)

---

### teamleader_deactivate_subscription (subscriptions.deactivate — doc 297)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | |

**Missing: 0 params** ✅

---

## 2. materials.ts

### teamleader_list_materials (materials.list — doc 212)

| API param | In tool? | Notes |
|-----------|----------|-------|
| filter.ids | YES | |

**Missing: 0 params** ✅ (API only has filter.ids)

---

### teamleader_get_material (materials.info — doc 211)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | |

**Missing: 0 params** ✅

---

### teamleader_create_material (materials.create — doc 208)

| API param | In tool? | Notes |
|-----------|----------|-------|
| project_id | YES | |
| title | YES | |
| group_id | YES | |
| after_id | YES | |
| description | YES | |
| billing_method | YES | |
| quantity | YES | |
| quantity_estimated | YES | |
| unit_price | YES | |
| unit_cost | YES | |
| unit_id | YES | |
| fixed_price | YES | |
| external_budget | YES | |
| internal_budget | YES | |
| start_date | YES | |
| end_date | YES | |
| product_id | YES | |
| assignees[] | YES | |

**Missing: 0 params** ✅

---

### teamleader_update_material (materials.update — doc 214)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | |
| title | YES | |
| description | YES | nullable |
| status | YES | |
| billing_method | YES | |
| quantity | YES | nullable |
| quantity_estimated | YES | nullable |
| unit_price | YES | nullable |
| unit_cost | YES | nullable |
| unit_id | YES | nullable |
| fixed_price | YES | nullable |
| external_budget | YES | nullable |
| internal_budget | YES | nullable |
| start_date | YES | nullable |
| end_date | YES | nullable |
| product_id | YES | nullable |

**Missing: 0 params** ✅

---

### teamleader_delete_material (materials.delete — doc 209)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | |

**Missing: 0 params** ✅

---

### teamleader_assign_material (materials.assign — doc 207)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | |
| assignee.type | YES | as assignee_type |
| assignee.id | YES | as assignee_id |

**Missing: 0 params** ✅

---

### teamleader_unassign_material (materials.unassign — doc 213)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | |
| assignee.type | YES | as assignee_type |
| assignee.id | YES | as assignee_id |

**Missing: 0 params** ✅

---

### teamleader_duplicate_material (materials.duplicate — doc 210)

| API param | In tool? | Notes |
|-----------|----------|-------|
| origin_id | YES | |

**Missing: 0 params** ✅

---

## 3. calls.ts

### teamleader_list_calls (calls.list — doc 018)

| API param | In tool? | Notes |
|-----------|----------|-------|
| filter.scheduled_after | YES | |
| filter.scheduled_before | YES | |
| filter.relates_to | YES | Built from relates_to_type + relates_to_id |
| filter.call_outcome_id | YES | |
| page.size | YES | as page_size |
| page.number | YES | as page |

**Missing: 0 params** ✅

---

### teamleader_get_call (calls.info — doc 017)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | |

**Missing: 0 params** ✅

---

### teamleader_add_call (calls.add — doc 015)

| API param | In tool? | Notes |
|-----------|----------|-------|
| description | YES | |
| participant.customer.type | YES | as customer_type |
| participant.customer.id | YES | as customer_id |
| due_at | YES | |
| assignee.type | YES | Hardcoded "user" |
| assignee.id | YES | as assignee_id |
| deal_id | YES | |
| custom_fields[] | YES | |

**Missing: 0 params** ✅

---

### teamleader_update_call (calls.update — doc 019)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | |
| description | YES | |
| participant.customer | YES | Built from customer_type + customer_id |
| due_at | YES | |
| assignee | YES | Built from assignee_id |
| deal_id | YES | nullable |
| custom_fields[] | YES | |

**Missing: 0 params** ✅

---

### teamleader_complete_call (calls.complete — doc 016)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | |
| call_outcome_id | YES | |
| outcome_summary | YES | |

**Missing: 0 params** ✅

---

## 4. notes.ts

### teamleader_list_notes (notes.list — doc 232)

| API param | In tool? | Notes |
|-----------|----------|-------|
| filter.subject.type | YES | as subject_type |
| filter.subject.id | YES | as subject_id |
| page.size | YES | as page_size |
| page.number | YES | as page |

**Missing: 0 params** ✅

Note: Tool includes "project" in SUBJECT_TYPES. API doc shows: company, contact, creditNote, deal, invoice, nextgenProject, product, project, quotation, subscription. Tool matches.

---

### teamleader_create_note (notes.create — doc 231)

| API param | In tool? | Notes |
|-----------|----------|-------|
| subject.type | YES | as subject_type |
| subject.id | YES | as subject_id |
| content | YES | |
| notify[] | **NO** | Array of {type:"user", id} — notify users about the note |

**Missing: 1 param** (notify)

---

### teamleader_update_note (notes.update — doc 233)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | |
| content | YES | |

**Missing: 0 params** ✅

---

## 5. files.ts

### teamleader_list_files (files.list — doc 113)

| API param | In tool? | Notes |
|-----------|----------|-------|
| filter.subject.type | YES | as subject_type |
| filter.subject.id | YES | as subject_id |
| page.size | YES | as page_size |
| page.number | YES | as page |
| sort[].field | **NO** | Only "updated_at" |
| sort[].order | **NO** | Only "desc" |

**Missing: 2 params** (sort.field, sort.order)

---

### teamleader_get_file (files.info — doc 112)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | |

**Missing: 0 params** ✅

---

### teamleader_download_file (files.download — doc 111)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | |

**Missing: 0 params** ✅

---

### teamleader_delete_file (files.delete — doc 110)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | |

**Missing: 0 params** ✅

---

### teamleader_upload_file (files.upload — doc 114)

| API param | In tool? | Notes |
|-----------|----------|-------|
| name | YES | |
| subject.type | YES | as subject_type |
| subject.id | YES | as subject_id (optional for temporary) |
| folder | YES | |

**Missing: 0 params** ✅

Note: Tool adds content_base64 for convenience (binary upload step 2). API only defines step 1 (get upload URL). Subject types in tool include "product" which is not in the API upload doc. API upload types: company, contact, deal, invoice, creditNote, nextgenProject, ticket, temporary. Tool lists additional types. **Discrepancy**: tool allows "product" and "project" in UPLOAD_SUBJECT_TYPES, but API only allows a subset for upload.

---

## 6. orders.ts

### teamleader_list_orders (orders.list — doc 236)

| API param | In tool? | Notes |
|-----------|----------|-------|
| filter.ids | YES | |
| includes | YES | |

**Missing: 0 params** ✅

Note: API has no page params documented for orders.list — tool doesn't include them either. Correct.

---

### teamleader_get_order (orders.info — doc 235)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | |
| includes | YES | |

**Missing: 0 params** ✅

---

## 7. users.ts

### teamleader_list_users (users.list — doc 349)

| API param | In tool? | Notes |
|-----------|----------|-------|
| filter.ids | YES | |
| filter.term | YES | |
| filter.status | PARTIAL | Tool accepts single string, API accepts string[] array |
| page.size | YES | as page_size |
| page.number | YES | as page |
| sort[].field | **NO** | Fields: first_name, last_name, email, function |
| sort[].order | **NO** | asc/desc |

**Missing: 2 params** (sort.field, sort.order)
**Issue: 1 param** (status should be array, not single enum)

---

### teamleader_get_user (users.info — doc 348)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | |
| includes | YES | "external_rate" |

**Missing: 0 params** ✅

---

## 8. departments.ts

### teamleader_list_departments (departments.list — doc 095)

| API param | In tool? | Notes |
|-----------|----------|-------|
| filter.ids | YES | |
| filter.status | YES | |
| sort[].field | YES | as sort_field |
| sort[].order | YES | as sort_order |

**Missing: 0 params** ✅

Note: API has no page param — tool doesn't include it. Correct.

---

### teamleader_get_department (departments.info — doc 094)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | |

**Missing: 0 params** ✅

---

## 9. products.ts

### teamleader_list_products (products.list — doc 252)

| API param | In tool? | Notes |
|-----------|----------|-------|
| filter.ids | YES | |
| filter.term | YES | |
| filter.updated_since | YES | |
| page.size | YES | as page_size |
| page.number | YES | as page |

**Missing: 0 params** ✅

---

### teamleader_get_product (products.info — doc 251)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | |
| includes | YES | |

**Missing: 0 params** ✅

---

### teamleader_add_product (products.add — doc 249)

| API param | In tool? | Notes |
|-----------|----------|-------|
| name | YES | |
| code | YES | |
| description | YES | |
| purchase_price | YES | as purchase_price_amount + purchase_price_currency |
| selling_price | YES | as selling_price_amount + selling_price_currency |
| unit_of_measure_id | YES | |
| price_list_prices[] | YES | |
| stock.amount | YES | as stock_amount |
| configuration.stock_threshold | YES | |
| department_id | YES | |
| product_category_id | YES | |
| tax_rate_id | YES | |
| custom_fields[] | YES | |

**Missing: 0 params** ✅

---

### teamleader_update_product (products.update — doc 253)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | |
| name | YES | nullable |
| code | YES | nullable |
| description | YES | nullable |
| purchase_price | YES | as purchase_price_amount + purchase_price_currency |
| selling_price | YES | as selling_price_amount + selling_price_currency |
| unit_of_measure_id | YES | nullable |
| price_list_prices[] | YES | |
| stock.amount | YES | as stock_amount |
| configuration.stock_threshold | YES | |
| department_id | YES | |
| product_category_id | YES | |
| tax_rate_id | YES | |
| custom_fields[] | YES | |

**Missing: 0 params** ✅

---

### teamleader_delete_product (products.delete — doc 250)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | |

**Missing: 0 params** ✅

---

## 10. creditnotes.ts

### teamleader_list_credit_notes (creditNotes.list — doc 052)

| API param | In tool? | Notes |
|-----------|----------|-------|
| filter.ids | YES | |
| filter.department_id | YES | |
| filter.updated_since | YES | |
| filter.invoice_id | YES | |
| filter.project_id | YES | |
| filter.customer.type | YES | as customer_type |
| filter.customer.id | YES | as customer_id |
| filter.credit_note_date_after | YES | |
| filter.credit_note_date_before | YES | |
| page.size | YES | as page_size |
| page.number | YES | as page |

**Missing: 0 params** ✅

---

### teamleader_get_credit_note (creditNotes.info — doc 051)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | |

**Missing: 0 params** ✅

---

### teamleader_download_credit_note (creditNotes.download — doc 050)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | |
| format | YES | "pdf" or "ubl/e-fff" |

**Missing: 0 params** ✅

---

### teamleader_send_credit_note_peppol (creditNotes.sendViaPeppol — doc 053)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | |

**Missing: 0 params** ✅

---

## 11. lookups.ts

### teamleader_list_activity_types (activityTypes.list — doc 005)

| API param | In tool? | Notes |
|-----------|----------|-------|
| filter.ids | **NO** | API supports filtering by IDs |
| page.size | YES | as page_size |
| page.number | YES | as page |

**Missing: 1 param** (filter.ids)

---

### teamleader_list_tax_rates (taxRates.list — doc 313)

| API param | In tool? | Notes |
|-----------|----------|-------|
| filter.department_id | YES | |
| page.size | YES | as page_size |
| page.number | YES | as page |
| sort[].field | **NO** | Sort support |
| sort[].order | **NO** | Sort support |

**Missing: 2 params** (sort.field, sort.order)

---

### teamleader_list_payment_terms (paymentTerms.list — doc 240)

| API param | In tool? | Notes |
|-----------|----------|-------|
| (no params) | — | API has no params — tool matches |

**Missing: 0 params** ✅

---

### teamleader_list_ticket_statuses (ticketStatus.list)

| API param | In tool? | Notes |
|-----------|----------|-------|
| (no params) | — | Simple list endpoint |

**Missing: 0 params** ✅

---

### teamleader_list_product_categories (productCategories.list — doc 247)

| API param | In tool? | Notes |
|-----------|----------|-------|
| filter.department_id | YES | |

**Missing: 0 params** ✅

---

### teamleader_list_teams (teams.list)

| API param | In tool? | Notes |
|-----------|----------|-------|
| (no params) | — | Simple list endpoint |

**Missing: 0 params** ✅

---

### teamleader_list_tags (tags.list)

| API param | In tool? | Notes |
|-----------|----------|-------|
| (no params) | — | Simple list endpoint |

**Missing: 0 params** ✅

---

### teamleader_list_work_types (workTypes.list)

| API param | In tool? | Notes |
|-----------|----------|-------|
| (no params) | — | Simple list endpoint, uses cache |

**Missing: 0 params** ✅

---

### teamleader_list_business_types (businessTypes.list)

| API param | In tool? | Notes |
|-----------|----------|-------|
| country | YES | |

**Missing: 0 params** ✅

---

### teamleader_list_call_outcomes (callOutcomes.list)

| API param | In tool? | Notes |
|-----------|----------|-------|
| page.size | YES | as page_size |
| page.number | YES | as page |

**Missing: 0 params** ✅

---

### teamleader_list_commercial_discounts (commercialDiscounts.list)

| API param | In tool? | Notes |
|-----------|----------|-------|
| filter.department_id | YES | |

**Missing: 0 params** ✅

---

### teamleader_list_document_templates (documentTemplates.list)

| API param | In tool? | Notes |
|-----------|----------|-------|
| filter.department_id | YES | |
| filter.document_type | YES | |
| filter.status | YES | |

**Missing: 0 params** ✅

---

### teamleader_list_price_lists (priceLists.list)

| API param | In tool? | Notes |
|-----------|----------|-------|
| filter.ids | YES | |

**Missing: 0 params** ✅

---

### teamleader_list_units_of_measure (unitsOfMeasure.list)

| API param | In tool? | Notes |
|-----------|----------|-------|
| (no params) | — | Simple list endpoint |

**Missing: 0 params** ✅

---

### teamleader_list_withholding_tax_rates (withholdingTaxRates.list)

| API param | In tool? | Notes |
|-----------|----------|-------|
| filter.department_id | YES | |

**Missing: 0 params** ✅

---

### teamleader_list_currencies (currencies.exchangeRates)

| API param | In tool? | Notes |
|-----------|----------|-------|
| base | YES | |

**Missing: 0 params** ✅

---

### teamleader_list_expenses (expenses.list)

| API param | In tool? | Notes |
|-----------|----------|-------|
| filter.term | YES | |
| filter.source_types | YES | |
| filter.review_statuses | YES | |
| filter.payment_statuses | YES | |
| page.size | YES | as page_size |
| page.number | YES | as page |

**Note**: expenses.list is not in the scraped docs (may be a newer endpoint). Tool implements based on working knowledge. Cannot verify exhaustively.

---

### teamleader_list_bookkeeping_submissions (bookkeepingSubmissions.list)

| API param | In tool? | Notes |
|-----------|----------|-------|
| filter.subject.id | YES | as subject_id |
| filter.subject.type | YES | as subject_type |

**Note**: bookkeepingSubmissions.list is marked out-of-scope in CLAUDE.md (Bookkeeping), but tool exists. Not an API gap — scope decision.

---

### teamleader_list_payment_methods (paymentMethods.list — doc 238)

**Not in lookups.ts** — no tool for this endpoint.

**Status**: Missing tool. However, paymentMethods.list is a simple list with no params and its output is referenced by other tools (invoices). May be needed.

---

### teamleader_list_mail_templates (mailTemplates.list)

**Not found as a separate tool in lookups.ts.** — However, listed in CLAUDE.md architecture. Need to verify.

---

### teamleader_list_lost_reasons (lostReasons.list)

**Not found as a separate tool in lookups.ts.** — However, listed in CLAUDE.md architecture.

---

### teamleader_list_deal_sources (dealSources.list)

**Handled in deals.ts** — not in lookups.ts scope. OK.

---

## Summary: Total Gaps per Tool

| Tool file | Gaps | Severity |
|-----------|------|----------|
| subscriptions.ts | create: 9, update: 9 | Medium — mostly line-item detail params (extended_description, discount, withholding_tax_rate_id, product_category_id, unit_of_measure_id, custom_fields, for_attention_of, sending_methods, payment_method) |
| materials.ts | 0 | ✅ Complete |
| calls.ts | 0 | ✅ Complete |
| notes.ts | create: 1 (notify) | Low — notify is optional |
| files.ts | list: 2 (sort) | Low — sort only supports updated_at/desc |
| orders.ts | 0 | ✅ Complete |
| users.ts | list: 2 (sort) + 1 issue (status type) | Low — sort is convenience, status type mismatch |
| departments.ts | 0 | ✅ Complete |
| products.ts | 0 | ✅ Complete |
| creditnotes.ts | 0 | ✅ Complete |
| lookups.ts | activity_types: 1 (filter.ids), tax_rates: 2 (sort) | Low — minor filter/sort gaps |

### Additional Observations

1. **files.ts UPLOAD_SUBJECT_TYPES**: Includes "product" and "project" which are not in the API upload doc. API upload only allows: company, contact, deal, invoice, creditNote, nextgenProject, ticket, temporary. The extra types in SUBJECT_TYPES (for list/info) are fine, but UPLOAD_SUBJECT_TYPES should match the upload endpoint.

2. **users.ts status filter**: Tool accepts single `z.enum(["active", "deactivated"])` but API accepts `string[]` array. Should be `z.array()` to match.

3. **lookups.ts "missing" tools**: paymentMethods.list is in invoices.ts, mailTemplates.list is in invoices.ts, lostReasons.list is in deals.ts. These are in different tool files by design — no gap.

4. **lookups.ts expenses/bookkeepingSubmissions**: These are implemented but fall under out-of-scope categories per CLAUDE.md. Not a gap per se, but a scope decision inconsistency.
