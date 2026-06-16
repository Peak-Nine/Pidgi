# Three-way Audit: Tasks vs BL Docs vs Code

Generated: 2026-03-05

---

## Task Inventory

### Implementation Tasks

| # | File | Title | Domain |
|---|------|-------|--------|
| 01 | 01_users-tools.md | Users — list + info tools | users |
| 02 | 02_tickets-tools.md | Tickets — full CRUD tools | tickets |
| 03 | 03_invoices-complete.md | Invoices — complete workflow tools | invoices |
| 04 | 04_meetings-tools.md | Meetings — full CRUD tools | meetings |
| 05 | 05_tasks-complete.md | Standalone Tasks — complete CRUD | tasks |
| 06 | 06_deals-complete.md | Deals — complete workflow (delete/lose/win/move) | deals |
| 07 | 07_departments-tools.md | Departments — list + info tools | departments |
| 08 | 08_companies-contacts-crud.md | Companies + Contacts — missing CRUD operations | companies, contacts |
| 09 | 09_lookup-lists.md | Lookup lists — activity types, tax rates, statuses, products | lookups |
| 10 | 10_projects-lifecycle.md | Projects v2 — lifecycle + relationships + task lifecycle | projects |
| 11 | 11_timers-complete.md | Timers + timeTracking — complete timer support | timetracking |
| 12 | 12_files-tools.md | Files — full file management tools | files |
| 13 | 13_misc-lookups.md | Misc — teams, tags, expenses | lookups |
| 14 | 14_notes.md | Notes — add/list notes on contacts, companies, deals | notes |
| 24 | 24_impl-companies-missing.md | Implement companies.delete + tag + untag | companies |
| 25 | 25_impl-events-missing.md | Implement events.update + events.cancel | events |
| 26 | 26_impl-quotations.md | Implement quotations tools (new file) | quotations |
| 27 | 27_impl-creditnotes.md | Implement creditNotes tools (new file) | creditnotes |
| 28 | 28_impl-products-crud.md | Implement products CRUD (add, info, update, delete) | products |
| 29 | 29_impl-projectlines-groups.md | Implement projectLines + missing projectGroups actions | projects |
| 30 | 30_impl-materials.md | Implement materials tools (new file) | materials |
| 31 | 31_impl-lookup-additions.md | Add missing lookup tools | lookups |
| 36 | 36_impl-dealpipelines-phases-crud.md | Implement dealPipelines CRUD + dealPhases CRUD | deals |
| 37 | 37_impl-orders.md | Implement orders tools | orders |
| 38 | 38_impl-calls.md | Implement calls tools (CRM calls) | calls |
| 40 | 40_impl-timesheet-tool.md | Implement teamleader_timesheet tool | timetracking |

### Audit Tasks

| # | File | Title | Domain |
|---|------|-------|--------|
| 01 | 01_audit-guidelines.md | Audit against GUIDELINES-MCP.md | all |
| 15 | 15_audit-invoices.md | Audit + fix invoices.ts coverage gaps | invoices |
| 16 | 16_audit-contacts-companies.md | Audit contacts.ts + companies.ts vs API docs | contacts, companies |
| 17 | 17_audit-deals.md | Audit deals.ts vs API docs | deals |
| 18 | 18_audit-events-tasks.md | Audit events.ts + tasks.ts vs API docs | events, tasks |
| 19 | 19_audit-timetracking.md | Audit timetracking.ts vs API docs | timetracking |
| 20 | 20_audit-projects.md | Audit projects.ts vs API docs | projects |
| 21 | 21_audit-tickets-meetings.md | Audit tickets.ts + meetings.ts vs API docs | tickets, meetings |
| 22 | 22_audit-invoices-subscriptions.md | Audit invoices.ts + subscriptions.ts vs API docs | invoices, subscriptions |
| 23 | 23_audit-lookups-files-notes.md | Audit lookups.ts + files.ts + notes.ts vs API docs | lookups, files, notes |
| 33 | 33_audit-users-departments.md | Audit users.ts + departments.ts vs API docs | users, departments |
| 41 | 41_audit-tasks-bl.md | Three-way audit — tasks vs BL docs vs code | all |

### Infra / Fix Tasks

| # | File | Title |
|---|------|-------|
| 02 | 02_fix-gitignore.md | Fix .gitignore for CodingMachine runtime files |
| 03 | 03_improve-describes.md | Improve tool describes() based on audit |
| 04 | 04_fix-silent-catches.md | Fix silent catch blocks |
| 32 | 32_fix-audit-gaps.md | Fix all gaps found in audit tasks 16-23 |
| 39 | 39_coverage-script.md | Build API coverage check script |

### Doc / Test Tasks

| # | File | Title |
|---|------|-------|
| 34 | 34_update-testing-md.md | Update TESTING.md with all tools (complete coverage) |
| 35 | 35_unit-tests.md | Add unit tests for request body construction |

---

## Registered Tools by Domain

### resolve.ts (6 tools)
- teamleader_find_task, teamleader_log_time, teamleader_load_tasks, teamleader_task_action, teamleader_cache_stats, teamleader_clear_cache

### contacts.ts (10 tools)
- teamleader_list_contacts, teamleader_get_contact, teamleader_create_contact, teamleader_update_contact, teamleader_delete_contact, teamleader_link_contact_to_company, teamleader_unlink_contact_from_company, teamleader_update_contact_company_link, teamleader_tag_contact, teamleader_untag_contact

### companies.ts (7 tools)
- teamleader_list_companies, teamleader_get_company, teamleader_create_company, teamleader_update_company, teamleader_delete_company, teamleader_tag_company, teamleader_untag_company

### deals.ts (22 tools)
- teamleader_list_deals, teamleader_get_deal, teamleader_create_deal, teamleader_update_deal, teamleader_delete_deal, teamleader_lose_deal, teamleader_win_deal, teamleader_move_deal, teamleader_list_lost_reasons, teamleader_list_deal_phases, teamleader_list_deal_sources, teamleader_list_deal_pipelines, teamleader_create_deal_phase, teamleader_update_deal_phase, teamleader_delete_deal_phase, teamleader_duplicate_deal_phase, teamleader_move_deal_phase, teamleader_create_deal_pipeline, teamleader_update_deal_pipeline, teamleader_delete_deal_pipeline, teamleader_duplicate_deal_pipeline, teamleader_mark_deal_pipeline_default

### tasks.ts (8 tools)
- teamleader_list_tasks, teamleader_create_task, teamleader_get_task, teamleader_update_task, teamleader_delete_task, teamleader_complete_task, teamleader_reopen_task, teamleader_schedule_task

### events.ts (5 tools)
- teamleader_list_events, teamleader_get_event, teamleader_create_event, teamleader_update_event, teamleader_cancel_event

### invoices.ts (17 tools)
- teamleader_list_invoices, teamleader_get_invoice, teamleader_create_invoice, teamleader_book_invoice, teamleader_send_invoice, teamleader_send_invoice_peppol, teamleader_delete_invoice, teamleader_update_invoice, teamleader_update_booked_invoice, teamleader_register_payment, teamleader_remove_payments, teamleader_copy_invoice, teamleader_credit_invoice, teamleader_credit_invoice_partially, teamleader_download_invoice, teamleader_list_mail_templates, teamleader_list_payment_methods

### timetracking.ts (11 tools)
- teamleader_list_timetracking, teamleader_get_timetracking, teamleader_add_timetracking, teamleader_update_timetracking, teamleader_delete_timetracking, teamleader_start_timer, teamleader_stop_timer, teamleader_get_current_timer, teamleader_update_timer, teamleader_timesheet, teamleader_resume_timetracking

### projects.ts (38 tools)
- teamleader_list_projects_v2, teamleader_get_project_v2, teamleader_create_project_v2, teamleader_update_project_v2, teamleader_list_project_groups, teamleader_list_project_tasks_v2, teamleader_create_project_group, teamleader_close_project_v2, teamleader_reopen_project_v2, teamleader_delete_project_v2, teamleader_duplicate_project_v2, teamleader_add_project_customer, teamleader_remove_project_customer, teamleader_add_project_deal, teamleader_remove_project_deal, teamleader_add_project_owner, teamleader_remove_project_owner, teamleader_assign_project, teamleader_unassign_project, teamleader_update_project_group, teamleader_complete_project_task, teamleader_reopen_project_task, teamleader_delete_project_task, teamleader_remove_task_from_group, teamleader_create_project_task_v2, teamleader_list_project_lines, teamleader_add_project_line_to_group, teamleader_get_project_group, teamleader_assign_project_group, teamleader_unassign_project_group, teamleader_duplicate_project_group, teamleader_get_project_task, teamleader_update_project_task, teamleader_duplicate_project_task, teamleader_assign_project_task, teamleader_unassign_project_task, teamleader_add_project_quotation, teamleader_remove_project_quotation

### tickets.ts (9 tools)
- teamleader_list_tickets, teamleader_get_ticket, teamleader_create_ticket, teamleader_update_ticket, teamleader_list_ticket_messages, teamleader_get_ticket_message, teamleader_reply_ticket, teamleader_internal_message_ticket, teamleader_import_ticket_message

### meetings.ts (7 tools)
- teamleader_list_meetings, teamleader_get_meeting, teamleader_schedule_meeting, teamleader_update_meeting, teamleader_complete_meeting, teamleader_delete_meeting, teamleader_create_meeting_report

### departments.ts (2 tools)
- teamleader_list_departments, teamleader_get_department

### users.ts (2 tools)
- teamleader_list_users, teamleader_get_user

### lookups.ts (18 tools)
- teamleader_list_activity_types, teamleader_list_tax_rates, teamleader_list_payment_terms, teamleader_list_ticket_statuses, teamleader_list_product_categories, teamleader_list_teams, teamleader_list_tags, teamleader_list_expenses, teamleader_list_work_types, teamleader_list_bookkeeping_submissions, teamleader_list_business_types, teamleader_list_call_outcomes, teamleader_list_commercial_discounts, teamleader_list_document_templates, teamleader_list_price_lists, teamleader_list_units_of_measure, teamleader_list_withholding_tax_rates, teamleader_list_currencies

### files.ts (5 tools)
- teamleader_list_files, teamleader_get_file, teamleader_download_file, teamleader_delete_file, teamleader_upload_file

### notes.ts (3 tools)
- teamleader_list_notes, teamleader_create_note, teamleader_update_note

### subscriptions.ts (5 tools)
- teamleader_list_subscriptions, teamleader_get_subscription, teamleader_create_subscription, teamleader_update_subscription, teamleader_deactivate_subscription

### quotations.ts (8 tools)
- teamleader_list_quotations, teamleader_get_quotation, teamleader_create_quotation, teamleader_update_quotation, teamleader_delete_quotation, teamleader_accept_quotation, teamleader_send_quotation, teamleader_download_quotation

### creditnotes.ts (4 tools)
- teamleader_list_credit_notes, teamleader_get_credit_note, teamleader_download_credit_note, teamleader_send_credit_note_peppol

### products.ts (5 tools)
- teamleader_list_products, teamleader_get_product, teamleader_add_product, teamleader_update_product, teamleader_delete_product

### materials.ts (8 tools)
- teamleader_list_materials, teamleader_get_material, teamleader_create_material, teamleader_update_material, teamleader_delete_material, teamleader_assign_material, teamleader_unassign_material, teamleader_duplicate_material

### orders.ts (2 tools)
- teamleader_list_orders, teamleader_get_order

### calls.ts (5 tools)
- teamleader_list_calls, teamleader_get_call, teamleader_add_call, teamleader_update_call, teamleader_complete_call

**Total: 207 tools across 23 files**

---

## A. Missing Tasks

Tools/features that exist in code but have no task that created them.

| Tool(s) | Domain | Notes |
|---------|--------|-------|
| teamleader_find_task, teamleader_log_time, teamleader_load_tasks, teamleader_task_action, teamleader_cache_stats, teamleader_clear_cache | resolve.ts | Pre-existing "smart tools" — no task file; part of original codebase |
| teamleader_list_contacts, teamleader_get_contact, teamleader_create_contact, teamleader_update_contact, teamleader_delete_contact, teamleader_link_contact_to_company, teamleader_unlink_contact_from_company, teamleader_update_contact_company_link, teamleader_tag_contact, teamleader_untag_contact | contacts.ts | Pre-existing; task 08 only added missing CRUD, original list/get had no task |
| teamleader_list_companies, teamleader_get_company | companies.ts | Pre-existing; task 08/24 added CRUD/tag/untag but original list/get had no task |
| teamleader_list_deals, teamleader_get_deal, teamleader_create_deal, teamleader_update_deal | deals.ts | Pre-existing; task 06 added delete/lose/win/move, originals had no task |
| teamleader_list_events, teamleader_get_event, teamleader_create_event | events.ts | Pre-existing; task 25 added update/cancel but originals had no task |
| teamleader_list_invoices, teamleader_get_invoice, teamleader_create_invoice | invoices.ts | Pre-existing; task 03 added workflow tools, originals had no task |
| teamleader_list_timetracking, teamleader_get_timetracking, teamleader_add_timetracking, teamleader_update_timetracking, teamleader_delete_timetracking | timetracking.ts | Pre-existing; task 11 added timers, originals had no task |
| teamleader_list_projects_v2, teamleader_get_project_v2, teamleader_create_project_v2, teamleader_update_project_v2 | projects.ts | Pre-existing; task 10/29 added lifecycle/groups/lines, originals had no task |
| teamleader_list_subscriptions, teamleader_get_subscription, teamleader_create_subscription, teamleader_update_subscription, teamleader_deactivate_subscription | subscriptions.ts | No task file — code exists but no implementation task was created |
| teamleader_resume_timetracking | timetracking.ts | Added without a dedicated task (likely part of audit fix task 32) |
| teamleader_add_project_quotation, teamleader_remove_project_quotation | projects.ts | No task — likely added as part of quotations task 26 or projects task 29 |
| teamleader_list_bookkeeping_submissions, teamleader_list_commercial_discounts, teamleader_list_price_lists | lookups.ts | No dedicated task — may have been added alongside task 31 extras |

---

## B. Outdated Tasks

Tasks whose description no longer matches the current code.

| Task file | What changed | Notes |
|-----------|-------------|-------|
| 01_users-tools.md | Says "add to src/tools/contacts.ts (or new users.ts)" | Code uses separate users.ts — task text slightly outdated |
| 08_companies-contacts-crud.md | Task describes adding create/update/delete to companies + contacts | Code now also includes tag/untag (added by task 24) — task scope was superseded |
| 09_lookup-lists.md | Lists "activity types, tax rates, statuses, products" | lookups.ts now has 18 tools (many more than 4); task 13+31 expanded scope |
| 06_deals-complete.md | Describes adding delete/lose/win/move | deals.ts now has 22 tools (pipelines CRUD added by task 36) — task scope expanded significantly |
| 10_projects-lifecycle.md | Describes lifecycle + relationships + task lifecycle | projects.ts now has 38 tools (projectLines, group actions added by task 29) — much larger |

---

## C. Missing BL Docs

`docs/BusinessLogica/` directory does not exist. **No business logic documentation exists for any domain.**

| Domain | Missing doc | Notes |
|--------|------------|-------|
| timetracking | docs/BusinessLogica/timetracking.md | Complex logic: dedup by start time, date-only filters, toFilterDate() helper, timer vs timeTracking distinction |
| invoices | docs/BusinessLogica/invoices.md | Complex workflow: draft→book→send→pay→credit; partial credit line tax quirk; registerPayment nesting |
| deals | docs/BusinessLogica/deals.md | Pipeline/phase management, move semantics, lose/win lifecycle, source lookups |
| contacts | docs/BusinessLogica/contacts.md | Company linking, position/decision-maker fields, tag semantics |
| projects | docs/BusinessLogica/projects.md | v2 API only, group vs line vs task hierarchy, close/delete strategies, assign semantics |
| subscriptions | docs/BusinessLogica/subscriptions.md | Recurring invoicing, deactivation logic |
| quotations | docs/BusinessLogica/quotations.md | Accept/send workflow, grouped line items |
| products | docs/BusinessLogica/products.md | Product CRUD, category relationships, pricing model |
| materials | docs/BusinessLogica/materials.md | Project materials, assign/unassign, duplicate semantics |
| timesheet | docs/BusinessLogica/timesheet.md | Aggregation logic: group by project/task, duration calculation, date range handling |
| resolve (smart tools) | docs/BusinessLogica/resolve.md | Cache-first lookup, task tree scoring algorithm, YAML file generation |

---

## D. Missing Code

No BL docs exist, so there are no documented features that lack code.

Since `docs/BusinessLogica/` does not exist at all, this section is **not applicable**. All features are driven by tasks and API docs, not by BL documentation.

---

## Summary

| Metric | Count |
|--------|-------|
| Task files | 45 |
| Implementation tasks | 26 |
| Audit tasks | 12 |
| Infra/fix tasks | 5 |
| Doc/test tasks | 2 |
| Registered tools | 207 |
| Tool source files | 23 |
| BL doc files | 0 (directory missing) |
| Tools without originating task | ~30 (pre-existing codebase) |
| Tasks with outdated descriptions | 5 |
| Domains needing BL docs | 11 |
