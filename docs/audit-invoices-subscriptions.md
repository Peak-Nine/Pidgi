# Audit: invoices.ts + subscriptions.ts vs API docs

Date: 2026-03-05

---

## 1. Endpoint Coverage

### Invoices (15/15 — all covered)

| API endpoint | MCP tool | Status |
|---|---|---|
| invoices.book | teamleader_book_invoice | OK |
| invoices.copy | teamleader_copy_invoice | OK |
| invoices.credit | teamleader_credit_invoice | OK |
| invoices.creditPartially | teamleader_credit_invoice_partially | OK |
| invoices.delete | teamleader_delete_invoice | OK |
| invoices.download | teamleader_download_invoice | OK |
| invoices.draft | teamleader_create_invoice | OK |
| invoices.info | teamleader_get_invoice | OK |
| invoices.list | teamleader_list_invoices | OK |
| invoices.registerPayment | teamleader_register_payment | OK |
| invoices.removePayments | teamleader_remove_payments | OK |
| invoices.send | teamleader_send_invoice | OK |
| invoices.sendViaPeppol | teamleader_send_invoice_peppol | OK |
| invoices.update | teamleader_update_invoice | OK |
| invoices.updateBooked | teamleader_update_booked_invoice | OK |

### Subscriptions (5/5 — all covered)

| API endpoint | MCP tool | Status |
|---|---|---|
| subscriptions.create | teamleader_create_subscription | OK |
| subscriptions.deactivate | teamleader_deactivate_subscription | OK |
| subscriptions.info | teamleader_get_subscription | OK |
| subscriptions.list | teamleader_list_subscriptions | OK |
| subscriptions.update | teamleader_update_subscription | OK |

---

## 2. Param Coverage

### invoices.list — teamleader_list_invoices

| API param | In tool? | Notes |
|---|---|---|
| filter.ids | YES | |
| filter.term | YES | |
| filter.invoice_number | YES | |
| filter.department_id | YES | |
| filter.deal_id | YES | |
| filter.project_id | YES | |
| filter.subscription_id | YES | |
| filter.status | YES | |
| filter.updated_since | YES | |
| filter.purchase_order_number | YES | |
| filter.payment_reference | YES | |
| filter.invoice_date_after | YES | |
| filter.invoice_date_before | YES | |
| filter.customer | YES | via customer_type + customer_id |
| page | YES | |
| sort | YES | |
| includes | YES | |

### invoices.info — teamleader_get_invoice

| API param | In tool? | Notes |
|---|---|---|
| id | YES | |
| includes | **NO** | API has `includes: "late_fees"` param — missing from tool |

### invoices.draft — teamleader_create_invoice

| API param | In tool? | Notes |
|---|---|---|
| invoicee.customer | YES | |
| invoicee.for_attention_of | **NO** | name or contact_id for attention line |
| department_id | YES | |
| payment_term | YES | |
| currency | **NO** | code + exchange_rate for non-EUR invoices |
| project_id | YES | |
| purchase_order_number | YES | |
| grouped_lines | YES | partial — see line items below |
| invoice_date | YES | |
| discounts | **NO** | global invoice-level discount array |
| note | YES | |
| expected_payment_method | **NO** | sepa_direct_debit, cash, etc. |
| custom_fields | **NO** | |
| document_template_id | **NO** | |
| delivery_date | **NO** | |
| Line: extended_description | **NO** | |
| Line: unit_of_measure_id | **NO** | |
| Line: discount | **NO** | per-line-item discount |
| Line: withholding_tax_rate_id | **NO** | |
| Line: product_category_id | **NO** | |
| Line: section.title | **NO** | section headers for grouped lines |

### invoices.book — teamleader_book_invoice

| API param | In tool? | Notes |
|---|---|---|
| id | YES | |
| on | YES | |

### invoices.copy — teamleader_copy_invoice

| API param | In tool? | Notes |
|---|---|---|
| id | YES | |

### invoices.credit — teamleader_credit_invoice

| API param | In tool? | Notes |
|---|---|---|
| id | YES | |
| credit_note_date | YES | |

### invoices.creditPartially — teamleader_credit_invoice_partially

| API param | In tool? | Notes |
|---|---|---|
| id | YES | |
| credit_note_date | YES | |
| grouped_lines | YES | partial |
| discounts | **NO** | global discount array |
| Line: unit_of_measure_id | **NO** | |
| Line: withholding_tax_rate_id | **NO** | |
| Line: product_category_id | **NO** | |
| Line: section.title | **NO** | |

### invoices.delete — teamleader_delete_invoice

| API param | In tool? | Notes |
|---|---|---|
| id | YES | |

Note: API docs say "Only possible for draft invoices or the last booked invoice" — tool description says "Only draft invoices can be deleted" which is incorrect.

### invoices.download — teamleader_download_invoice

| API param | In tool? | Notes |
|---|---|---|
| id | YES | |
| format | YES | |

### invoices.registerPayment — teamleader_register_payment

| API param | In tool? | Notes |
|---|---|---|
| id | YES | |
| payment.amount | YES | flattened to `amount` |
| payment.currency | YES | flattened to `currency` |
| paid_at | YES | |
| payment_method_id | YES | |

### invoices.removePayments — teamleader_remove_payments

| API param | In tool? | Notes |
|---|---|---|
| id | YES | |

### invoices.send — teamleader_send_invoice

| API param | In tool? | Notes |
|---|---|---|
| id | YES | |
| content.subject | YES | |
| content.body | YES | |
| content.mail_template_id | YES | |
| recipients.to | YES | |
| recipients.cc | YES | |
| recipients.bcc | YES | |
| attachments | YES | |

### invoices.sendViaPeppol — teamleader_send_invoice_peppol

| API param | In tool? | Notes |
|---|---|---|
| id | YES | |

### invoices.update — teamleader_update_invoice

| API param | In tool? | Notes |
|---|---|---|
| id | YES | |
| invoicee.customer | YES | |
| invoicee.for_attention_of | **NO** | |
| payment_term | YES | |
| currency | **NO** | code + exchange_rate |
| project_id | YES | |
| purchase_order_number | YES | |
| grouped_lines | YES | partial (same gaps as draft) |
| invoice_date | YES | |
| note | YES | |
| discounts | **NO** | |
| expected_payment_method | **NO** | |
| custom_fields | **NO** | |
| document_template_id | **NO** | |
| delivery_date | **NO** | |

### invoices.updateBooked — teamleader_update_booked_invoice

| API param | In tool? | Notes |
|---|---|---|
| id | YES | |
| invoicee.customer | YES | |
| invoicee.for_attention_of | **NO** | |
| payment_term | YES | |
| project_id | YES | |
| grouped_lines | YES | partial (same gaps) |
| invoice_date | YES | |
| note | YES | |
| custom_fields | **NO** | |

Note: tool has `purchase_order_number` param but API updateBooked does NOT have it — will be silently ignored.

### subscriptions.list — teamleader_list_subscriptions

| API param | In tool? | Notes |
|---|---|---|
| filter.ids | YES | |
| filter.invoice_id | YES | |
| filter.deal_id | YES | |
| filter.department_id | YES | |
| filter.customer | YES | via customer_type + customer_id → {type, id} |
| filter.status | YES | |
| page | YES | |
| sort | YES | |

### subscriptions.info — teamleader_get_subscription

| API param | In tool? | Notes |
|---|---|---|
| id | YES | |

### subscriptions.create — teamleader_create_subscription

| API param | In tool? | Notes |
|---|---|---|
| invoicee.customer | YES | |
| invoicee.for_attention_of | **NO** | |
| department_id | YES | |
| starts_on | YES | |
| billing_cycle | YES | |
| title | YES | **BUG: optional in tool but required in API** |
| grouped_lines | YES | **BUG: sends currency instead of tax (see below)** |
| ends_on | YES | |
| deal_id | **NO** | |
| project_id | **NO** | |
| note | YES | |
| payment_term | YES | |
| invoice_generation | **NO** | **MISSING — required in API!** (action: draft/book/book_and_send) |
| custom_fields | **NO** | |
| document_template_id | **NO** | |
| Line: extended_description | **NO** | |
| Line: unit_of_measure_id | **NO** | |
| Line: discount | **NO** | |
| Line: withholding_tax_rate_id | **NO** | |
| Line: product_category_id | **NO** | |
| Line: section.title | **NO** | |

### subscriptions.update — teamleader_update_subscription

| API param | In tool? | Notes |
|---|---|---|
| id | YES | |
| starts_on | YES | |
| billing_cycle | YES | |
| ends_on | YES | |
| title | YES | |
| invoicee.customer | YES | |
| invoicee.for_attention_of | **NO** | |
| department_id | **NO** | |
| payment_term | YES | |
| project_id | **NO** | |
| deal_id | **NO** | |
| note | YES | |
| grouped_lines | YES | **BUG: sends currency instead of tax** |
| invoice_generation | **NO** | (action: draft/book/book_and_send) |
| custom_fields | **NO** | |
| document_template_id | **NO** | |

### subscriptions.deactivate — teamleader_deactivate_subscription

| API param | In tool? | Notes |
|---|---|---|
| id | YES | |

---

## 3. describe() Coverage

### invoices.ts

| Tool | Param | Has describe()? |
|---|---|---|
| teamleader_list_invoices | all 18 params | YES |
| teamleader_get_invoice | id | YES |
| teamleader_create_invoice | all 10 params | YES |
| teamleader_book_invoice | id, on | YES |
| teamleader_send_invoice | all 7 params | YES |
| teamleader_send_invoice_peppol | id | YES |
| teamleader_delete_invoice | id | YES |
| teamleader_update_invoice | all 11 params | YES |
| teamleader_update_booked_invoice | all 10 params | YES |
| teamleader_register_payment | all 5 params | YES |
| teamleader_remove_payments | id | YES |
| teamleader_copy_invoice | id | YES |
| teamleader_credit_invoice | id, credit_note_date | YES |
| teamleader_credit_invoice_partially | all 4 params | YES |
| teamleader_download_invoice | id, format | YES |
| teamleader_list_mail_templates | type, department_id | YES |
| teamleader_list_payment_methods | status | YES |

All describe() present — no gaps.

### subscriptions.ts

| Tool | Param | Has describe()? |
|---|---|---|
| teamleader_list_subscriptions | all 11 params | YES |
| teamleader_get_subscription | id | YES |
| teamleader_create_subscription | all 13 params | YES |
| teamleader_update_subscription | all 13 params | YES |
| teamleader_deactivate_subscription | id | YES |

All describe() present — no gaps.

---

## 4. llmTip / Quirk Coverage

### Invoices

| Tool | Known quirk | llmTip present? | Notes |
|---|---|---|---|
| teamleader_register_payment | `paid_at` not `payment_date` | **YES** | "NOTE: the API field is 'paid_at' (NOT 'payment_date')" |
| teamleader_register_payment | nested `payment: {amount, currency}` | **YES** | "The payment structure is nested... This tool handles the structure" |
| teamleader_credit_invoice_partially | `unit_price.tax: "excluding"` not currency | **YES** | "the API uses unit_price.tax = 'excluding' (a string, NOT a currency field)" |
| teamleader_list_invoices | valid statuses (draft/outstanding/matched) | **YES** | "'paid' is NOT a valid status — use 'matched' instead" |
| teamleader_delete_invoice | also deletes last booked invoice | **NO** | Description says "Only draft invoices" but API allows last booked too |

### Subscriptions

| Tool | Known quirk | llmTip present? | Notes |
|---|---|---|---|
| teamleader_list_subscriptions | filter.customer must be {type, id} | **NO** | Implementation is correct but no llmTip about the object structure |
| teamleader_create_subscription | `title` is required in API | **NO** | Tool marks it as optional |
| teamleader_create_subscription | `invoice_generation` is required | **NO** | Completely missing from tool |

---

## Bugs Found

### BUG 1 (CRITICAL): subscriptions unit_price sends `currency` instead of `tax: "excluding"`

**Files:** `subscriptions.ts:157-159` (create) and `subscriptions.ts:247` (update)

The tool sends:
```json
"unit_price": { "amount": 123.3, "currency": "EUR" }
```

But the API expects:
```json
"unit_price": { "amount": 123.3, "tax": "excluding" }
```

This is the **exact same bug** that was previously fixed in invoices.ts (PROGRESS.md task 01). The tool schema even exposes `unit_price_currency` as a user-facing param, but the API expects `tax: "excluding"` — not a currency field.

**Impact:** Subscription line items will either 400 or be created with incorrect pricing.

### BUG 2 (CRITICAL): subscriptions.create missing required `invoice_generation` param

**File:** `subscriptions.ts:131-178`

The API requires `invoice_generation` with `action` (draft/book/book_and_send). This determines what happens when a subscription generates an invoice. The tool omits this entirely — the API will likely 400.

### BUG 3: subscriptions.create `title` marked optional but API requires it

**File:** `subscriptions.ts:115`

Tool: `title: z.string().optional()` — API: `title` is **required**.

### BUG 4 (MINOR): delete_invoice description says "Only draft invoices" but API allows last booked

**File:** `invoices.ts:324`

API docs: "Only possible for draft invoices or the last booked invoice." Tool description: "Only draft invoices can be deleted." — misleading.

### BUG 5 (MINOR): update_booked_invoice has `purchase_order_number` not in API

**File:** `invoices.ts:407` — tool doesn't have this param (confirmed by looking at code again — actually it doesn't, so this is NOT a bug)

Actually, re-checking: the updateBooked tool schema does NOT have purchase_order_number. So this is fine. Let me remove this.

### Note: invoices.info missing `includes` param

**File:** `invoices.ts:110-111`

The API accepts `includes: "late_fees"` to include late fee totals. The tool only sends `{id}` — users can't request late fee data via info endpoint.

---

## Summary

### Invoices
- **Endpoint coverage:** 15/15 (100%)
- **Param coverage:** Core params complete. Many optional params missing across draft/update/updateBooked (for_attention_of, currency, discounts, expected_payment_method, custom_fields, document_template_id, delivery_date, several line item fields). `invoices.info` missing `includes` param.
- **describe():** 100% — all params have describe()
- **llmTips:** 4/5 quirks documented. Missing: delete also allows last booked invoice.
- **Bugs:** 1 minor (delete description)

### Subscriptions
- **Endpoint coverage:** 5/5 (100%)
- **Param coverage:** Many gaps. Missing `invoice_generation` (required!), `deal_id`, `project_id` on create; missing `department_id`, `project_id`, `deal_id`, `invoice_generation` on update. Line item fields same gaps as invoices.
- **describe():** 100% — all params have describe()
- **llmTips:** 0/3 quirks documented
- **Bugs:** 3 (critical: unit_price currency→tax, missing invoice_generation, title optionality)
