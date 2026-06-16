# Audit: lookups.ts + files.ts + notes.ts vs API docs

**Date:** 2026-03-05
**Files audited:** `src/tools/lookups.ts`, `src/tools/files.ts`, `src/tools/notes.ts`

---

## 1. Endpoint Coverage

### Lookups (lookups.ts)

| API endpoint | MCP tool | Status |
|-------------|----------|--------|
| `activityTypes.list` | `teamleader_list_activity_types` | COVERED |
| `taxRates.list` | `teamleader_list_tax_rates` | COVERED |
| `paymentTerms.list` | `teamleader_list_payment_terms` | COVERED |
| `ticketStatus.list` | `teamleader_list_ticket_statuses` | COVERED |
| `products.list` | `teamleader_list_products` | COVERED |
| `productCategories.list` | `teamleader_list_product_categories` | COVERED |
| `teams.list` | `teamleader_list_teams` | COVERED |
| `tags.list` | `teamleader_list_tags` | COVERED |
| `expenses.list` | `teamleader_list_expenses` | COVERED |
| `workTypes.list` | `teamleader_list_work_types` | COVERED |
| `businessTypes.list` | — | MISSING |
| `callOutcomes.list` | — | MISSING |
| `commercialDiscounts.list` | — | MISSING |
| `documentTemplates.list` | — | MISSING |
| `lostReasons.list` | `teamleader_list_lost_reasons` (deals.ts) | IN deals.ts |
| `mailTemplates.list` | `teamleader_list_mail_templates` (invoices.ts) | IN invoices.ts |
| `paymentMethods.list` | `teamleader_list_payment_methods` (invoices.ts) | IN invoices.ts |
| `priceLists.list` | — | MISSING |
| `unitsOfMeasure.list` | — | MISSING |
| `withholdingTaxRates.list` | — | MISSING |
| `currencies.list` | — | MISSING (referenced in CLAUDE.md architecture) |
| `products.add` | — | MISSING |
| `products.info` | — | MISSING |
| `products.update` | — | MISSING |
| `products.delete` | — | MISSING |

**Summary:** 10 tools in lookups.ts. 7 lookup endpoints MISSING (businessTypes, callOutcomes, commercialDiscounts, documentTemplates, priceLists, unitsOfMeasure, withholdingTaxRates). 4 product CRUD endpoints MISSING (add, info, update, delete). 3 lookup endpoints live in other files (deals.ts, invoices.ts).

### Files (files.ts)

| API endpoint | MCP tool | Status |
|-------------|----------|--------|
| `files.list` | `teamleader_list_files` | COVERED |
| `files.info` | `teamleader_get_file` | COVERED |
| `files.download` | `teamleader_download_file` | COVERED |
| `files.delete` | `teamleader_delete_file` | COVERED |
| `files.upload` | `teamleader_upload_file` | COVERED |

**Summary:** 5/5 endpoints covered.

### Notes (notes.ts)

| API endpoint | MCP tool | Status |
|-------------|----------|--------|
| `notes.list` | `teamleader_list_notes` | COVERED |
| `notes.create` | `teamleader_create_note` | COVERED |
| `notes.update` | `teamleader_update_note` | COVERED |

**Summary:** 3/3 endpoints covered.

---

## 2. Param Coverage

### Lookups — activityTypes.list

| Tool | API param | In tool? | Notes |
|------|-----------|----------|-------|
| `list_activity_types` | `filter.ids` | NO | Missing — filter by specific IDs |
| `list_activity_types` | `page.number` | YES | |
| `list_activity_types` | `page.size` | YES | |

### Lookups — taxRates.list

| Tool | API param | In tool? | Notes |
|------|-----------|----------|-------|
| `list_tax_rates` | `filter.department_id` | NO | Missing |
| `list_tax_rates` | `page.number` | YES | |
| `list_tax_rates` | `page.size` | YES | |
| `list_tax_rates` | `sort[].field` | NO | Missing (department_id/rate/description) |
| `list_tax_rates` | `sort[].order` | NO | Missing (asc/desc) |

### Lookups — paymentTerms.list

| Tool | API param | In tool? | Notes |
|------|-----------|----------|-------|
| `list_payment_terms` | (none) | YES | No params — correct |

### Lookups — ticketStatus.list

| Tool | API param | In tool? | Notes |
|------|-----------|----------|-------|
| `list_ticket_statuses` | (none) | YES | No params — correct |

### Lookups — products.list

| Tool | API param | In tool? | Notes |
|------|-----------|----------|-------|
| `list_products` | `filter.term` | YES | |
| `list_products` | `filter.ids` | NO | Missing |
| `list_products` | `filter.updated_since` | NO | Missing |
| `list_products` | `filter.category_id` | YES | But API has no `category_id` filter! Only `ids`, `term`, `updated_since` exist. **BUG**: sending non-existent filter param |
| `list_products` | `page.number` | YES | |
| `list_products` | `page.size` | YES | |

### Lookups — productCategories.list

| Tool | API param | In tool? | Notes |
|------|-----------|----------|-------|
| `list_product_categories` | `filter.department_id` | YES | |

### Lookups — teams.list

| Tool | API param | In tool? | Notes |
|------|-----------|----------|-------|
| `list_teams` | `filter.ids` | NO | Missing |
| `list_teams` | `filter.term` | NO | Missing |
| `list_teams` | `filter.team_lead_id` | NO | Missing |
| `list_teams` | `sort[].field` | NO | Missing (name) |
| `list_teams` | `sort[].order` | NO | Missing (asc/desc) |

### Lookups — tags.list

| Tool | API param | In tool? | Notes |
|------|-----------|----------|-------|
| `list_tags` | `page.number` | NO | Missing |
| `list_tags` | `page.size` | NO | Missing |
| `list_tags` | `sort[].field` | NO | Missing (tag) |
| `list_tags` | `sort[].order` | NO | Missing (asc) |

### Lookups — expenses.list

| Tool | API param | In tool? | Notes |
|------|-----------|----------|-------|
| `list_expenses` | `filter.term` | YES | |
| `list_expenses` | `filter.source_types` | YES | |
| `list_expenses` | `filter.review_statuses` | YES | |
| `list_expenses` | `filter.payment_statuses` | YES | |
| `list_expenses` | `filter.bookkeeping_statuses` | NO | Missing |
| `list_expenses` | `filter.department_ids` | NO | Missing |
| `list_expenses` | `filter.supplier` | NO | Missing (object: {type, id}) |
| `list_expenses` | `filter.document_date` | NO | Missing (operator-based date filter) |
| `list_expenses` | `filter.paid_at` | NO | Missing (operator-based date filter) |
| `list_expenses` | `sort` | NO | Missing |
| `list_expenses` | `page.number` | YES | |
| `list_expenses` | `page.size` | YES | |

### Lookups — workTypes.list

| Tool | API param | In tool? | Notes |
|------|-----------|----------|-------|
| `list_work_types` | `filter.ids` | NO | Missing |
| `list_work_types` | `filter.term` | NO | Missing |
| `list_work_types` | `page.number` | NO | Missing |
| `list_work_types` | `page.size` | NO | Missing |
| `list_work_types` | `sort.field` | NO | Missing |
| `list_work_types` | `sort.order` | NO | Missing |

### Files — files.list

| Tool | API param | In tool? | Notes |
|------|-----------|----------|-------|
| `list_files` | `filter.subject.type` | YES | |
| `list_files` | `filter.subject.id` | YES | |
| `list_files` | `page.number` | YES | |
| `list_files` | `page.size` | YES | |
| `list_files` | `sort` | NO | Missing (field: updated_at, order: desc) |

**Subject type enum gap:** Tool has `company, contact, deal, invoice, creditNote, nextgenProject, ticket`. API also has `product` and `project` — **2 subject types missing**.

### Files — files.info

| Tool | API param | In tool? | Notes |
|------|-----------|----------|-------|
| `get_file` | `id` | YES | |

### Files — files.download

| Tool | API param | In tool? | Notes |
|------|-----------|----------|-------|
| `download_file` | `id` | YES | |

### Files — files.delete

| Tool | API param | In tool? | Notes |
|------|-----------|----------|-------|
| `delete_file` | `id` | YES | |

### Files — files.upload

| Tool | API param | In tool? | Notes |
|------|-----------|----------|-------|
| `upload_file` | `name` | YES | |
| `upload_file` | `subject.type` | YES | |
| `upload_file` | `subject.id` | YES | (optional when type=temporary) |
| `upload_file` | `folder` | YES | |

**Upload subject type enum gap:** Tool has same SUBJECT_TYPES + `temporary`. API has `company, contact, deal, invoice, creditNote, nextgenProject, ticket, temporary` — matches. But list SUBJECT_TYPES is missing `product` and `project`.

### Notes — notes.list

| Tool | API param | In tool? | Notes |
|------|-----------|----------|-------|
| `list_notes` | `filter.subject.type` | YES | |
| `list_notes` | `filter.subject.id` | YES | |
| `list_notes` | `page.number` | YES | |
| `list_notes` | `page.size` | YES | |

**Subject type enum gap:** Tool has `contact, company, deal, project`. API has `company, contact, creditNote, deal, invoice, nextgenProject, product, project, quotation, subscription` — **6 subject types missing** (creditNote, invoice, nextgenProject, product, quotation, subscription). Note: `project` in tool likely refers to old projects; API also supports `nextgenProject`.

### Notes — notes.create

| Tool | API param | In tool? | Notes |
|------|-----------|----------|-------|
| `create_note` | `subject.type` | YES | |
| `create_note` | `subject.id` | YES | |
| `create_note` | `content` | YES | |
| `create_note` | `notify` | NO | Missing — array of {type: "user", id} to notify |

**Subject type enum gap:** Same as list_notes — uses `contact, company, deal, project`. API create supports `company, contact, creditNote, deal, invoice, nextgenProject, product, quotation, subscription` (no `project` on create!). **BUG**: `project` type accepted in create tool but NOT in API create endpoint.

### Notes — notes.update

| Tool | API param | In tool? | Notes |
|------|-----------|----------|-------|
| `update_note` | `id` | YES | |
| `update_note` | `content` | YES | |

---

## 3. describe() Coverage

### Lookups

| Tool | Param | Has describe()? |
|------|-------|-----------------|
| `list_activity_types` | page | YES |
| `list_activity_types` | page_size | YES |
| `list_tax_rates` | page | YES |
| `list_tax_rates` | page_size | YES |
| `list_products` | term | YES |
| `list_products` | category_id | YES |
| `list_products` | page | YES |
| `list_products` | page_size | YES |
| `list_product_categories` | department_id | YES |
| `list_expenses` | term | YES |
| `list_expenses` | source_types | YES |
| `list_expenses` | review_statuses | YES |
| `list_expenses` | payment_statuses | YES |
| `list_expenses` | page | YES |
| `list_expenses` | page_size | YES |

**Summary:** All existing params have describe(). No gaps.

### Files

| Tool | Param | Has describe()? |
|------|-------|-----------------|
| `list_files` | subject_type | YES |
| `list_files` | subject_id | YES |
| `list_files` | page | YES |
| `list_files` | page_size | YES |
| `get_file` | id | YES |
| `download_file` | id | YES |
| `delete_file` | id | YES |
| `upload_file` | name | YES |
| `upload_file` | subject_type | YES |
| `upload_file` | subject_id | YES |
| `upload_file` | folder | YES |
| `upload_file` | content_base64 | YES |

**Summary:** All existing params have describe(). No gaps.

### Notes

| Tool | Param | Has describe()? |
|------|-------|-----------------|
| `list_notes` | subject_type | YES |
| `list_notes` | subject_id | YES |
| `list_notes` | page | YES |
| `list_notes` | page_size | YES |
| `create_note` | subject_type | YES |
| `create_note` | subject_id | YES |
| `create_note` | content | YES |
| `update_note` | id | YES |
| `update_note` | content | YES |

**Summary:** All existing params have describe(). No gaps.

---

## 4. llmTip / Known Quirk Coverage

| Tool | Known quirk | llmTip present? | Notes |
|------|-------------|-----------------|-------|
| `upload_file` | Two-step: files.upload returns pre-signed URL → binary POST (no auth headers) | PARTIAL | Description mentions "Two-step process" but doesn't explicitly say "no auth headers on step 2" |
| `list_products` | `category_id` filter does NOT exist in API | NO | **BUG** — sending non-existent filter param, silently ignored by API |
| `create_note` | `project` type NOT valid for notes.create (only for notes.list) | NO | **BUG** — tool accepts `project` but API will reject or silently fail |
| `list_notes` | Subject types incomplete — missing creditNote, invoice, nextgenProject, product, quotation, subscription | NO | No warning about limited scope |
| `list_work_types` | Has cache (7-day TTL) | YES | Mentioned in description |
| `list_expenses` | Complex date filters (operator-based: between, before, after, equals, is_empty) | NO | Not mentioned |

---

## Summary of Issues Found

### Bugs (3)

1. **`list_products` — `category_id` filter does NOT exist in API.** API only supports `ids`, `term`, `updated_since`. The `category_id` param is silently ignored.
2. **`create_note` — accepts `project` subject type but API create does NOT support it.** API create supports: company, contact, creditNote, deal, invoice, nextgenProject, product, quotation, subscription. Will likely 400 or be ignored.
3. **`list_files` / `upload_file` — missing `product` and `project` subject types** in SUBJECT_TYPES enum vs what the API accepts.

### Missing Endpoints (11)

- `businessTypes.list` — requires `country` param
- `callOutcomes.list` — simple paginated list
- `commercialDiscounts.list` — optional department_id filter
- `documentTemplates.list` — requires department_id + document_type
- `priceLists.list` — optional ids filter
- `unitsOfMeasure.list` — no params
- `withholdingTaxRates.list` — optional department_id filter
- `products.add` — create product (name or code required + many optional fields)
- `products.info` — get product details
- `products.update` — update product fields
- `products.delete` — delete product

### Missing Params (significant)

- `list_work_types`: no filter/pagination/sort params at all (always fetches all, cached)
- `list_teams`: no filter params (ids, term, team_lead_id) or sort
- `list_tags`: no pagination or sort
- `list_expenses`: missing 5 filter params (bookkeeping_statuses, department_ids, supplier, document_date, paid_at) + sort
- `list_tax_rates`: missing department_id filter + sort
- `list_notes` subject types: missing 6 of 10 API-supported types
- `create_note`: missing `notify` param

### llmTip Gaps

- `upload_file`: should explicitly mention "no auth headers on binary POST"
- `list_products`: should warn that category_id doesn't work (or remove param)
- `create_note`: should document valid subject types
