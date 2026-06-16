# Invoice Tools Gap Audit — draft, info, updateBooked, update

Audit date: 2026-04-01
Source docs: `docs/api/149-invoicesdraft.md`, `docs/api/150-invoicesinfo.md`, `docs/api/156-invoicesupdate.md`, `docs/api/157-invoicesupdatebooked.md`
Source code: `src/tools/invoices.ts`

---

## 1. teamleader_create_invoice (invoices.draft)

| API param | In tool? | Notes |
|-----------|----------|-------|
| invoicee.customer.type | ✅ | `customer_type` |
| invoicee.customer.id | ✅ | `customer_id` |
| invoicee.for_attention_of | ❌ | missing — oneOf: {name} or {contact_id} |
| department_id | ✅ | |
| payment_term.type | ✅ | `payment_term_type` |
| payment_term.days | ✅ | `payment_term_days` |
| currency.code | ❌ | missing — non-EUR invoices impossible |
| currency.exchange_rate | ❌ | missing |
| project_id | ✅ | |
| purchase_order_number | ✅ | |
| grouped_lines[].section.title | ❌ | missing — no section grouping support |
| grouped_lines[].line_items[].quantity | ✅ | |
| grouped_lines[].line_items[].description | ✅ | |
| grouped_lines[].line_items[].extended_description | ❌ | missing |
| grouped_lines[].line_items[].unit_of_measure_id | ❌ | missing |
| grouped_lines[].line_items[].unit_price.amount | ✅ | `unit_price_amount` |
| grouped_lines[].line_items[].unit_price.tax | ✅ | hardcoded "excluding" |
| grouped_lines[].line_items[].tax_rate_id | ✅ | |
| grouped_lines[].line_items[].discount.value | ❌ | missing — no line-level discount |
| grouped_lines[].line_items[].discount.type | ❌ | missing |
| grouped_lines[].line_items[].product_id | ✅ | |
| grouped_lines[].line_items[].withholding_tax_rate_id | ❌ | missing |
| grouped_lines[].line_items[].product_category_id | ❌ | missing |
| invoice_date | ✅ | |
| discounts[] | ❌ | missing — invoice-level discounts |
| note | ✅ | |
| expected_payment_method | ❌ | missing — sepa_direct_debit, cash, etc. |
| custom_fields[] | ❌ | missing |
| document_template_id | ❌ | missing |
| delivery_date | ❌ | missing |

**Gaps: 14 missing params**

---

## 2. teamleader_get_invoice (invoices.info)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | ✅ | |
| includes | ✅ | late_fees |

**Gaps: 0** — request schema is complete. Response is returned as raw JSON.

---

## 3. teamleader_update_invoice (invoices.update) — carried forward from B2

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | ✅ | |
| invoicee.customer.type | ✅ | `customer_type` |
| invoicee.customer.id | ✅ | `customer_id` |
| invoicee.for_attention_of | ❌ | missing — oneOf: {name} or {contact_id} |
| payment_term.type | ✅ | `payment_term_type` |
| payment_term.days | ✅ | `payment_term_days` |
| currency.code | ❌ | missing |
| currency.exchange_rate | ❌ | missing |
| project_id | ✅ | |
| purchase_order_number | ✅ | |
| grouped_lines[].section.title | ❌ | missing |
| grouped_lines[].line_items[].quantity | ✅ | |
| grouped_lines[].line_items[].description | ✅ | |
| grouped_lines[].line_items[].extended_description | ❌ | missing |
| grouped_lines[].line_items[].unit_of_measure_id | ❌ | missing |
| grouped_lines[].line_items[].unit_price.amount | ✅ | `unit_price_amount` |
| grouped_lines[].line_items[].unit_price.tax | ✅ | hardcoded "excluding" |
| grouped_lines[].line_items[].tax_rate_id | ✅ | |
| grouped_lines[].line_items[].discount.value | ✅ | `discount_value` |
| grouped_lines[].line_items[].discount.type | ✅ | hardcoded "percentage" |
| grouped_lines[].line_items[].product_id | ✅ | |
| grouped_lines[].line_items[].withholding_tax_rate_id | ❌ | missing |
| grouped_lines[].line_items[].product_category_id | ❌ | missing |
| invoice_date | ✅ | |
| note | ✅ | |
| discounts[] | ❌ | missing — invoice-level discounts |
| expected_payment_method | ❌ | missing |
| custom_fields[] | ❌ | missing |
| document_template_id | ❌ | missing |
| delivery_date | ❌ | missing |

**Gaps: 11 missing params**

---

## 4. teamleader_update_booked_invoice (invoices.updateBooked)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | ✅ | |
| invoicee.customer.type | ✅ | `customer_type` |
| invoicee.customer.id | ✅ | `customer_id` |
| invoicee.for_attention_of | ❌ | missing — oneOf: {name} or {contact_id} |
| payment_term.type | ✅ | `payment_term_type` |
| payment_term.days | ✅ | `payment_term_days` |
| project_id | ✅ | |
| grouped_lines[].section.title | ❌ | missing |
| grouped_lines[].line_items[].quantity | ✅ | |
| grouped_lines[].line_items[].description | ✅ | |
| grouped_lines[].line_items[].extended_description | ❌ | missing |
| grouped_lines[].line_items[].unit_of_measure_id | ❌ | missing |
| grouped_lines[].line_items[].unit_price.amount | ✅ | `unit_price_amount` |
| grouped_lines[].line_items[].unit_price.tax | ✅ | hardcoded "excluding" |
| grouped_lines[].line_items[].tax_rate_id | ✅ | |
| grouped_lines[].line_items[].discount.value | ✅ | `discount_value` |
| grouped_lines[].line_items[].discount.type | ✅ | hardcoded "percentage" |
| grouped_lines[].line_items[].product_id | ✅ | |
| grouped_lines[].line_items[].withholding_tax_rate_id | ❌ | missing |
| grouped_lines[].line_items[].product_category_id | ❌ | missing |
| invoice_date | ✅ | |
| note | ✅ | |
| custom_fields[] | ❌ | missing |

**Gaps: 7 missing params**

Note: `invoices.updateBooked` has fewer params than `invoices.update` — no currency, purchase_order_number, discounts[], expected_payment_method, document_template_id, or delivery_date in the API.

---

## Summary

| Tool | Total API params | In tool | Missing | Gap % |
|------|-----------------|---------|---------|-------|
| teamleader_create_invoice | 24 | 10 | 14 | 58% |
| teamleader_get_invoice | 2 | 2 | 0 | 0% |
| teamleader_update_invoice | 24 | 13 | 11 | 46% |
| teamleader_update_booked_invoice | 18 | 11 | 7 | 39% |
| **Total** | **68** | **36** | **32** | **47%** |

### Common missing params across draft/update/updateBooked

| Param | draft | update | updateBooked |
|-------|-------|--------|--------------|
| for_attention_of | ❌ | ❌ | ❌ |
| section.title | ❌ | ❌ | ❌ |
| extended_description | ❌ | ❌ | ❌ |
| unit_of_measure_id | ❌ | ❌ | ❌ |
| withholding_tax_rate_id | ❌ | ❌ | ❌ |
| product_category_id | ❌ | ❌ | ❌ |
| custom_fields[] | ❌ | ❌ | ❌ |
| currency | ❌ | ❌ | n/a |
| discounts[] | ❌ | ❌ | n/a |
| expected_payment_method | ❌ | ❌ | n/a |
| document_template_id | ❌ | ❌ | n/a |
| delivery_date | ❌ | ❌ | n/a |
| line discount | ❌ | ✅ | ✅ |
