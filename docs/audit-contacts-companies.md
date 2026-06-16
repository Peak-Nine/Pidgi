# Audit: Contacts + Companies Tools vs API Docs

> Generated: 2026-04-01
> Method: API doc → tool implementation comparison

---

## Contacts

### teamleader_create_contact (contacts.add — doc 038)

| API param | In tool? | Notes |
|-----------|----------|-------|
| first_name | YES | |
| last_name | YES | required |
| emails[] | PARTIAL | Tool exposes single `email` string, auto-wraps as `[{type:"primary", email}]`. API supports array with type. |
| salutation | YES | |
| telephones[] | PARTIAL | Tool exposes `phone` + `mobile` as separate strings. API supports full array with type (phone/mobile/fax). No fax support. |
| website | YES | |
| addresses[] | **NO** | Complex nested object: type (primary/invoicing/delivery/visiting) + address (line_1, postal_code, city, country, area_level_two_id, addressee) |
| language | YES | |
| gender | YES | |
| birthdate | **NO** | string, e.g. "1989-08-19" |
| iban | **NO** | string |
| bic | **NO** | string |
| national_identification_number | **NO** | string |
| remarks | YES | |
| tags | YES | |
| custom_fields[] | **NO** | Array of {id, value} objects |
| marketing_mails_consent | **NO** | boolean |

**Missing: 7 params** (addresses, birthdate, iban, bic, national_identification_number, custom_fields, marketing_mails_consent)

---

### teamleader_list_contacts (contacts.list — doc 042)

| API param | In tool? | Notes |
|-----------|----------|-------|
| filter.email | **NO** | Object filter: {type, email} — different from `term` search |
| filter.ids | YES | |
| filter.company_id | YES | |
| filter.term | YES | |
| filter.updated_since | YES | |
| filter.tags | YES | |
| filter.status | YES | |
| filter.marketing_mails_consent | **NO** | boolean filter |
| page.size | YES | as `page_size` |
| page.number | YES | as `page` |
| sort[] | **NO** | Array of {field, order}. Fields: added_at, name, updated_at |
| includes | **NO** | Comma-separated: "custom_fields,price_list" |

**Missing: 4 params** (filter.email, filter.marketing_mails_consent, sort, includes)

---

### teamleader_get_contact (contacts.info — doc 040)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | required |

**Missing: 0 params** — complete

---

### teamleader_update_contact (contacts.update — doc 046)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | required |
| first_name | YES | nullable |
| last_name | YES | |
| salutation | YES | nullable |
| emails[] | PARTIAL | Single `email` string, same limitation as create |
| telephones[] | PARTIAL | `phone` + `mobile` strings, no fax |
| website | YES | nullable |
| addresses[] | **NO** | Same complex structure as create |
| language | YES | |
| gender | YES | |
| birthdate | **NO** | nullable string |
| iban | **NO** | nullable string |
| bic | **NO** | nullable string |
| national_identification_number | **NO** | string |
| remarks | YES | nullable |
| tags | YES | |
| custom_fields[] | **NO** | Array of {id, value} |
| marketing_mails_consent | **NO** | boolean |

**Missing: 7 params** (addresses, birthdate, iban, bic, national_identification_number, custom_fields, marketing_mails_consent)

---

### teamleader_delete_contact (contacts.delete — doc 039)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | required |

**Missing: 0 params** — complete

---

### teamleader_link_contact_to_company (contacts.linkToCompany — doc 041)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | required |
| company_id | YES | required |
| position | YES | |
| decision_maker | YES | |

**Missing: 0 params** — complete

---

### teamleader_unlink_contact_from_company (contacts.unlinkFromCompany — doc 044)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | required |
| company_id | YES | required |

**Missing: 0 params** — complete

---

### teamleader_update_contact_company_link (contacts.updateCompanyLink — doc 047)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | required |
| company_id | YES | required |
| position | YES | |
| decision_maker | YES | |

**Missing: 0 params** — complete

---

### teamleader_tag_contact (contacts.tag — doc 043)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | required |
| tags | YES | required |

**Missing: 0 params** — complete

---

### teamleader_untag_contact (contacts.untag — doc 045)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | required |
| tags | YES | required |

**Missing: 0 params** — complete

---

## Companies

### teamleader_create_company (companies.add — doc 029)

| API param | In tool? | Notes |
|-----------|----------|-------|
| name | YES | required |
| business_type_id | **NO** | string UUID |
| vat_number | YES | |
| national_identification_number | **NO** | string |
| emails[] | PARTIAL | Single `email` string. API supports array with type (primary/invoicing). |
| telephones[] | PARTIAL | Single `phone` string. API supports array with type (phone/fax). |
| website | YES | |
| addresses[] | **NO** | Same complex nested structure as contacts |
| iban | **NO** | string |
| bic | **NO** | string |
| language | YES | |
| responsible_user_id | YES | |
| remarks | YES | |
| tags | YES | |
| custom_fields[] | **NO** | Array of {id, value} |
| marketing_mails_consent | **NO** | boolean |
| preferred_currency | **NO** | CurrencyCode enum (EUR, USD, GBP, etc.) |

**Missing: 8 params** (business_type_id, national_identification_number, addresses, iban, bic, custom_fields, marketing_mails_consent, preferred_currency)

---

### teamleader_list_companies (companies.list — doc 032)

| API param | In tool? | Notes |
|-----------|----------|-------|
| filter.email | **NO** | Object filter: {type, email} |
| filter.ids | YES | |
| filter.term | YES | |
| filter.updated_since | YES | |
| filter.tags | YES | |
| filter.vat_number | YES | |
| filter.national_identification_number | **NO** | string filter |
| filter.status | YES | |
| filter.marketing_mails_consent | **NO** | boolean filter |
| page.size | YES | as `page_size` |
| page.number | YES | as `page` |
| sort[] | **NO** | Array of {field, order}. Fields: name, added_at, updated_at |
| includes | **NO** | Comma-separated: "custom_fields,price_list" |

**Missing: 5 params** (filter.email, filter.national_identification_number, filter.marketing_mails_consent, sort, includes)

---

### teamleader_get_company (companies.info — doc 031)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | required |
| includes | **NO** | "related_companies,related_contacts" |

**Missing: 1 param** (includes)

---

### teamleader_update_company (companies.update — doc 035)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | required |
| name | YES | |
| business_type_id | **NO** | nullable string UUID |
| vat_number | YES | |
| national_identification_number | **NO** | nullable string |
| emails[] | PARTIAL | Single `email` string. API supports array with type (primary/invoicing). |
| telephones[] | PARTIAL | Single `phone` string. API supports array with type (phone/fax). |
| website | YES | |
| addresses[] | **NO** | Same complex nested structure |
| iban | **NO** | nullable string |
| bic | **NO** | nullable string |
| language | YES | |
| responsible_user_id | YES | nullable |
| remarks | YES | nullable |
| tags | YES | |
| custom_fields[] | **NO** | Array of {id, value} |
| marketing_mails_consent | **NO** | boolean |
| preferred_currency | **NO** | nullable CurrencyCode enum |

**Missing: 8 params** (business_type_id, national_identification_number, addresses, iban, bic, custom_fields, marketing_mails_consent, preferred_currency)

---

### teamleader_delete_company (companies.delete — doc 030)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | required |

**Missing: 0 params** — complete

---

### teamleader_tag_company (companies.tag — doc 033)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | required |
| tags | YES | required |

**Missing: 0 params** — complete

---

### teamleader_untag_company (companies.untag — doc 034)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | YES | required |
| tags | YES | required |

**Missing: 0 params** — complete

---

## Summary

| Tool | Total API params | In tool | Missing | Coverage |
|------|-----------------|---------|---------|----------|
| **create_contact** | 17 | 10 | 7 | 59% |
| **list_contacts** | 12 | 8 | 4 | 67% |
| **get_contact** | 1 | 1 | 0 | 100% |
| **update_contact** | 18 | 11 | 7 | 61% |
| **delete_contact** | 1 | 1 | 0 | 100% |
| **link_contact_to_company** | 4 | 4 | 0 | 100% |
| **unlink_contact_from_company** | 2 | 2 | 0 | 100% |
| **update_contact_company_link** | 4 | 4 | 0 | 100% |
| **tag_contact** | 2 | 2 | 0 | 100% |
| **untag_contact** | 2 | 2 | 0 | 100% |
| **create_company** | 17 | 9 | 8 | 53% |
| **list_companies** | 13 | 8 | 5 | 62% |
| **get_company** | 2 | 1 | 1 | 50% |
| **update_company** | 18 | 10 | 8 | 56% |
| **delete_company** | 1 | 1 | 0 | 100% |
| **tag_company** | 2 | 2 | 0 | 100% |
| **untag_company** | 2 | 2 | 0 | 100% |

### Most impactful gaps (shared across multiple tools)

| Gap | Affects | Priority |
|-----|---------|----------|
| addresses[] | create/update contact + company (4 tools) | HIGH — needed for invoicing |
| custom_fields[] | create/update contact + company (4 tools) | HIGH — common CRM need |
| iban / bic | create/update contact + company (4 tools) | MEDIUM — financial data |
| marketing_mails_consent | create/update/list contact + company (6 tools) | MEDIUM — GDPR compliance |
| sort[] | list contacts + companies (2 tools) | LOW — nice to have |
| includes | list + get contacts + companies (3 tools) | MEDIUM — custom_fields/price_list visibility |
| birthdate | create/update contact (2 tools) | LOW |
| national_identification_number | create/update contact + company (4 tools) | LOW |
| business_type_id | create/update company (2 tools) | LOW |
| preferred_currency | create/update company (2 tools) | LOW |
