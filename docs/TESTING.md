# Testing Checklist — Teamleader Focus MCP

Status: ✅ Tested | ⚠️ Partial | ❌ Not tested | 🐛 Bug found | 📋 Planned (not yet implemented)

---

## MCP Server

| Item | Test | Status | Notes |
|------|------|--------|-------|
| Version | Matches package.json dynamically | ✅ | task-17 |

## Core Resolution Tools

| Tool | Test | Status | Notes |
|------|------|--------|-------|
| `teamleader_login` | OAuth browser flow + token write | ⚠️ | Manueel — browser + local callback port 19836 → ~/.teamleader-tokens.json |
| `teamleader_find_task` | Company resolve (cache miss) | ✅ | |
| `teamleader_find_task` | Company resolve (cache hit) | ✅ | |
| `teamleader_find_task` | Group found in 1 project → auto-pick | ✅ | Ontwikkeling → auto-picked Access Application |
| `teamleader_find_task` | Group found in multiple projects → ask project_selection | ✅ | Barucci: 5 projects with "Support" group → project_selection=N |
| `teamleader_find_task` | Group not found → ask confirm_create_group | ✅ | Fixed v1.3.2: projectGroups.create (was projectLines.create → 404) |
| `teamleader_find_task` | Task: 1 exact match → auto-pick | ✅ | Tijdregistratie: Ontwikkeling |
| `teamleader_find_task` | Task: multiple matches → ask task_selection | ✅ | Collection → 4 matches shown |
| `teamleader_find_task` | Task: no match, tasks exist → ask confirm_create_task | ✅ | Shows existing tasks + asks confirm_create_task=true |
| `teamleader_find_task` | No projects for company → ask confirm_create_project | ✅ | Fixed v1.3.2: BV Antwerp Nightlife Center → project + group + task created end-to-end |
| `teamleader_find_task` | Task: no tasks in group → auto-create | ✅ | Confirmed: empty group → task auto-created without confirm_create_task |
| `teamleader_find_task` | only_open=false includes done tasks | ✅ | BRN Support: 2 done tasks shown; default only_open=true → hidden |
| `teamleader_load_tasks` | Full tree load (cache miss) | ✅ | Tested on BV Belgian Recycle Network |
| `teamleader_load_tasks` | Cache hit (30 min TTL) | ✅ | |
| `teamleader_load_tasks` | visual=true ASCII tree | ✅ | |
| `teamleader_load_tasks` | only_open=false includes done | ✅ | Fixed: done=[x] cancelled=[-] icons added |
| `teamleader_load_tasks` | force_refresh=true | ✅ | Tested: bypasses 30min cache, reloads from API |
| `teamleader_load_tasks` | task_selection=N caches task | ✅ | visual=true → task_selection=1 → flat cache hit confirmed |
| `teamleader_load_tasks` | project_filter / group_filter | ✅ | Both filter correctly on partial match |
| `teamleader_load_tasks` | YAML file written correctly | ✅ | ~/.teamleader-tasks-bv-belgian-recycle-network.yaml |
| `teamleader_load_tasks` | on_hold projects included | ✅ | Fixed: was filtering only active |

## Time Logging

| Tool | Test | Status | Notes |
|------|------|--------|-------|
| `teamleader_log_time` | task_name from flat cache | ✅ | Basic flow tested |
| `teamleader_log_time` | task_id shortcut (1st call, tree fresh) | ✅ | Path + entry correct |
| `teamleader_log_time` | task_id shortcut (after tree invalidated) | ✅ | Fixed v1.3.1: verification via timeTracking.info after add |
| `teamleader_log_time` | Tree fallback (scoreTasksInTree) | ✅ | Ambiguous task_name → scored list shown |
| `teamleader_log_time` | confirm_task_match=N | ✅ | Pick from list, full path shown, entry created |
| `teamleader_log_time` | HH:MM time format | ✅ | |
| `teamleader_log_time` | YYYY-MM-DD HH:MM format | ✅ | |
| `teamleader_log_time` | Exact duplicate blocked | ✅ | |
| `teamleader_log_time` | Overlap warning + confirm_overlap | ✅ | |
| `teamleader_log_time` | force=true skips dedup | ✅ | Duplicate blocked without force; second entry created with force=true |
| `teamleader_log_time` | date param (past date with HH:MM times) | ✅ | Entry created on 2026-03-01 via date="2026-03-01" + HH:MM |
| `teamleader_log_time` | work_type_id from task cache | ✅ | Verified: task tree + flat cache both propagate work_type_id |
| `teamleader_log_time` | description stored | ✅ | Verified via list |
| `teamleader_log_time` | Active timer overlap warning | ❌ | Timer running within log period → warning with stop/force options; timer outside period → no warning |

## Task Maintenance

| Tool | Test | Status | Notes |
|------|------|--------|-------|
| `teamleader_task_action` | close (task_id) | ✅ | `tasks.update` confirmed working |
| `teamleader_task_action` | close (task_number from tree) | ✅ | Fixed v1.3.1: filter open tasks in resolveTaskFromTree |
| `teamleader_task_action` | create (project_id + group_id) | ✅ | |
| `teamleader_task_action` | create (project_id only, no group) | ✅ | Task created at project level, no group_id needed |
| `teamleader_task_action` | move_time | ✅ | delete + recreate on new task, verified via get_timetracking |
| `teamleader_task_action` | delete_group | ✅ | Fixed v1.3.2: projectGroups.delete + delete_strategy param |
| `teamleader_task_action` | move_to_group | ✅ | New v1.3.3: projectLines.addToGroup — moves task to different group |
| `teamleader_task_action` | tree cache invalidated after close | ✅ | invalidateTaskTree called |
| `teamleader_task_action` | tree cache invalidated after create | ✅ | invalidateTaskTree called |
| `teamleader_task_action` | tree cache invalidated after delete_group | ✅ | invalidateTaskTree called |

## Standalone Tasks

| Tool | Test | Status | Notes |
|------|------|--------|-------|
| `teamleader_list_tasks` | Basic list (no filter) | ❌ | |
| `teamleader_list_tasks` | Filter by customer_id + customer_type | ❌ | |
| `teamleader_list_tasks` | Filter by term | ❌ | |
| `teamleader_get_task` | Get by ID | ❌ | |
| `teamleader_create_task` | Create (description only) | ❌ | |
| `teamleader_create_task` | Create with assignee + due_on + work_type | ❌ | |
| `teamleader_create_task` | Create linked to customer | ❌ | |
| `teamleader_update_task` | Update description / due date | ❌ | |
| `teamleader_delete_task` | Delete | ❌ | |
| `teamleader_complete_task` | Mark as completed | ❌ | |
| `teamleader_reopen_task` | Reopen completed task | ❌ | |
| `teamleader_schedule_task` | Schedule task (start_date + due_on) | ❌ | |

## Time Tracking (raw)

| Tool | Test | Status | Notes |
|------|------|--------|-------|
| `teamleader_list_timetracking` | Basic list (no filter) | ✅ | Returns oldest-first |
| `teamleader_list_timetracking` | subject.id NOT reusable in log_time | ✅ | subject.id = todo/standalone ref, not nextgenTask ID — llmTip added |
| `teamleader_list_timetracking` | Filter by user_id | ✅ | |
| `teamleader_list_timetracking` | Filter by started_after | ✅ | |
| `teamleader_list_timetracking` | Filter by started_before | ❌ | |
| `teamleader_list_timetracking` | Filter by subject_id | ❌ | |
| `teamleader_get_timetracking` | Get by ID | ✅ | Returns full entry incl. meta.updatable |
| `teamleader_add_timetracking` | Add entry (via log_time) | ✅ | Indirect |
| `teamleader_update_timetracking` | Update description | ✅ | Returns {} (normal for Teamleader updates) |
| `teamleader_update_timetracking` | Update times | ❌ | |
| `teamleader_delete_timetracking` | Delete entry | ✅ | |

## Timesheet

| Tool | Test | Status | Notes |
|------|------|--------|-------|
| `teamleader_timesheet` | Basic call (from_date/to_date, user_id) | ❌ | Table with Start/End/Dur/Description/Task/Group/Project/Client |
| `teamleader_timesheet` | `desc_length=0` | ❌ | Full descriptions, no truncation |
| `teamleader_timesheet` | `desc_length=20` | ❌ | Descriptions truncated to 20 chars with `…` |
| `teamleader_timesheet` | `format=md` | ❌ | Full table incl. User column |
| `teamleader_timesheet` | `format=beauty` (default) | ❌ | No User column, task titles truncated to 40 chars, day header |
| `teamleader_timesheet` | `format=manictime` | ❌ | TSV output: `DD/MM/YYYY\tclient, group, task` — no headers, one line per entry |
| `teamleader_timesheet` | `format=manictime` — entry with all "—" fields | ❌ | Memo = `(no context)`, not empty |
| `teamleader_timesheet` | `format=manictime` — entry with empty/null group | ❌ | Empty group filtered out, no trailing comma |
| `teamleader_log_time` | Active timer overlap warning | ❌ | Times shown in ISO UTC format (e.g. `09:30`), locale-neutral |

## Timers

| Tool | Test | Status | Notes |
|------|------|--------|-------|
| `teamleader_start_timer` | Start running timer | ❌ | |
| `teamleader_stop_timer` | Stop running timer (no params — stops current user's active timer) | ❌ | |
| `teamleader_get_current_timer` | Get currently running timer | ❌ | |
| `teamleader_update_timer` | Update running timer description | ❌ | |
| `teamleader_resume_timetracking` | Resume a past time entry | ❌ | |

## Cache Management

| Tool | Test | Status | Notes |
|------|------|--------|-------|
| `teamleader_cache_stats` | Shows correct counts | ✅ | |
| `teamleader_cache_stats` | Output is English (no Dutch) | ✅ | task-17 |
| `teamleader_cache_stats` | company_filter works | ❌ | |
| `teamleader_clear_cache` | Clears all data | ✅ | |
| Auto-prune on save | Expired entries removed | ❌ | |

## Projects

| Tool | Test | Status | Notes |
|------|------|--------|-------|
| `teamleader_list_projects_v2` | Basic list | ❌ | |
| `teamleader_list_projects_v2` | Filter by status | ❌ | |
| `teamleader_list_projects_v2` | Filter by company_id | ❌ | |
| `teamleader_get_project_v2` | Get by ID | ❌ | |
| `teamleader_create_project_v2` | Create | ❌ | |
| `teamleader_update_project_v2` | Update status / details | ❌ | |
| `teamleader_close_project_v2` | Close project (closing_strategy) | ❌ | |
| `teamleader_reopen_project_v2` | Reopen project | ❌ | |
| `teamleader_delete_project_v2` | Delete project (delete_strategy) | ❌ | |
| `teamleader_duplicate_project_v2` | Duplicate project | ❌ | |
| `teamleader_assign_project` | Assign user/team to project | ❌ | |
| `teamleader_unassign_project` | Unassign from project | ❌ | |

## Project Customers / Deals / Owners / Quotations

| Tool | Test | Status | Notes |
|------|------|--------|-------|
| `teamleader_add_project_customer` | Add customer to project | ❌ | |
| `teamleader_remove_project_customer` | Remove customer from project | ❌ | |
| `teamleader_add_project_deal` | Link deal to project | ❌ | |
| `teamleader_remove_project_deal` | Unlink deal from project | ❌ | |
| `teamleader_add_project_owner` | Add owner/member | ❌ | |
| `teamleader_remove_project_owner` | Remove owner/member | ❌ | |
| `teamleader_add_project_quotation` | Link quotation to project | ❌ | |
| `teamleader_remove_project_quotation` | Unlink quotation from project | ❌ | |

## Project Groups

| Tool | Test | Status | Notes |
|------|------|--------|-------|
| `teamleader_list_project_groups` | List groups for project | ❌ | |
| `teamleader_get_project_group` | Get group details by ID | ❌ | |
| `teamleader_create_project_group` | Create group (start_date/end_date) | ❌ | |
| `teamleader_update_project_group` | Update group details | ❌ | |
| `teamleader_assign_project_group` | Assign user/team to group | ❌ | |
| `teamleader_unassign_project_group` | Unassign from group | ❌ | |
| `teamleader_duplicate_project_group` | Duplicate group | ❌ | |

## Project Lines

| Tool | Test | Status | Notes |
|------|------|--------|-------|
| `teamleader_list_project_lines` | List lines for project | ❌ | project_id is top-level, NOT in filter |
| `teamleader_add_project_line_to_group` | Add line to group | ❌ | |
| `teamleader_remove_task_from_group` | Remove task from group | ❌ | |

## Project Tasks

| Tool | Test | Status | Notes |
|------|------|--------|-------|
| `teamleader_list_project_tasks_v2` | List tasks for project (only_open defaults to true) | ❌ | |
| `teamleader_get_project_task` | Get task details | ❌ | |
| `teamleader_create_project_task_v2` | Create task (group_id, assignees) | ❌ | |
| `teamleader_update_project_task` | Update task details | ❌ | |
| `teamleader_complete_project_task` | Mark task as done | ❌ | |
| `teamleader_reopen_project_task` | Reopen done task | ❌ | |
| `teamleader_delete_project_task` | Delete task | ❌ | |
| `teamleader_assign_project_task` | Assign user/team to task | ❌ | |
| `teamleader_unassign_project_task` | Unassign from task | ❌ | |
| `teamleader_duplicate_project_task` | Duplicate task | ❌ | |

## Companies

| Tool | Test | Status | Notes |
|------|------|--------|-------|
| `teamleader_list_companies` | Basic list | ❌ | |
| `teamleader_list_companies` | Filter by term | ❌ | |
| `teamleader_get_company` | Get by ID | ❌ | |
| `teamleader_create_company` | Create | ❌ | |
| `teamleader_update_company` | Update company details | ❌ | |
| `teamleader_delete_company` | Delete company | ❌ | |
| `teamleader_tag_company` | Add tag to company | ❌ | |
| `teamleader_untag_company` | Remove tag from company | ❌ | |

## Contacts

| Tool | Test | Status | Notes |
|------|------|--------|-------|
| `teamleader_list_contacts` | Basic list | ❌ | |
| `teamleader_list_contacts` | Filter by term | ❌ | |
| `teamleader_get_contact` | Get by ID | ❌ | |
| `teamleader_create_contact` | Create | ❌ | |
| `teamleader_update_contact` | Update | ❌ | |
| `teamleader_delete_contact` | Delete contact | ❌ | |
| `teamleader_link_contact_to_company` | Link contact to company | ❌ | |
| `teamleader_unlink_contact_from_company` | Unlink contact from company | ❌ | |
| `teamleader_update_contact_company_link` | Update link (role/position) | ❌ | |
| `teamleader_tag_contact` | Add tag to contact | ❌ | |
| `teamleader_untag_contact` | Remove tag from contact | ❌ | |

## Deals

| Tool | Test | Status | Notes |
|------|------|--------|-------|
| `teamleader_list_deals` | Basic list | ❌ | |
| `teamleader_list_deals` | Filter by phase / pipeline / customer | ❌ | |
| `teamleader_get_deal` | Get by ID | ❌ | |
| `teamleader_create_deal` | Create | ❌ | |
| `teamleader_update_deal` | Update | ❌ | |
| `teamleader_delete_deal` | Delete deal | ❌ | |
| `teamleader_lose_deal` | Mark as lost (reason_id optional) | ❌ | |
| `teamleader_win_deal` | Mark as won | ❌ | |
| `teamleader_move_deal` | Move to different phase | ❌ | |

## Deal Pipelines & Phases

| Tool | Test | Status | Notes |
|------|------|--------|-------|
| `teamleader_list_deal_pipelines` | List pipelines | ❌ | |
| `teamleader_create_deal_pipeline` | Create pipeline | ❌ | |
| `teamleader_update_deal_pipeline` | Update pipeline | ❌ | |
| `teamleader_delete_deal_pipeline` | Delete pipeline | ❌ | |
| `teamleader_duplicate_deal_pipeline` | Duplicate pipeline | ❌ | |
| `teamleader_mark_deal_pipeline_default` | Mark as default | ❌ | |
| `teamleader_list_deal_phases` | List phases for pipeline | ❌ | |
| `teamleader_create_deal_phase` | Create phase | ❌ | |
| `teamleader_update_deal_phase` | Update phase | ❌ | |
| `teamleader_delete_deal_phase` | Delete phase | ❌ | |
| `teamleader_duplicate_deal_phase` | Duplicate phase | ❌ | |
| `teamleader_move_deal_phase` | Move/reorder phase | ❌ | |
| `teamleader_list_deal_sources` | List deal sources | ❌ | |

## Quotations

| Tool | Test | Status | Notes |
|------|------|--------|-------|
| `teamleader_list_quotations` | Basic list (no filter) | ❌ | |
| `teamleader_list_quotations` | Filter by deal_id | ❌ | |
| `teamleader_get_quotation` | Get by ID | ❌ | |
| `teamleader_create_quotation` | Create with grouped_lines | ❌ | Requires deal_id + grouped_lines or text |
| `teamleader_create_quotation` | Create with text only | ❌ | |
| `teamleader_update_quotation` | Update line items / text | ❌ | |
| `teamleader_delete_quotation` | Delete | ❌ | |
| `teamleader_accept_quotation` | Accept + verify 204 | ❌ | Returns 204 No Content |
| `teamleader_send_quotation` | Send via email | ❌ | |
| `teamleader_download_quotation` | Get download URL | ❌ | |

## Credit Notes

| Tool | Test | Status | Notes |
|------|------|--------|-------|
| `teamleader_list_credit_notes` | Basic list (no filter) | ❌ | |
| `teamleader_list_credit_notes` | Filter by department_id | ❌ | |
| `teamleader_get_credit_note` | Get by ID | ❌ | |
| `teamleader_download_credit_note` | Get download URL | ❌ | |
| `teamleader_send_credit_note_peppol` | Send via Peppol | ❌ | Requires customer to have Peppol ID |

## Invoices

| Tool | Test | Status | Notes |
|------|------|--------|-------|
| `teamleader_list_invoices` | Filter by customer (company) | ✅ | Returns all 8 invoices for S&D Boetiek in 1 call |
| `teamleader_list_invoices` | Filter by status | ❌ | |
| `teamleader_get_invoice` | Get by ID | ❌ | |
| `teamleader_create_invoice` | Create draft | ❌ | |
| `teamleader_update_invoice` | Update line items / dates / discount_value (0-100 range validated) | ✅ | |
| `teamleader_update_booked_invoice` | Update booked invoice / discount_value (0-100 range validated) | ✅ | |
| `teamleader_book_invoice` | Book draft invoice | ❌ | |
| `teamleader_send_invoice` | Send via email | ❌ | |
| `teamleader_send_invoice_peppol` | Send via Peppol | ❌ | |
| `teamleader_download_invoice` | Download PDF | ❌ | |
| `teamleader_delete_invoice` | Delete draft | ❌ | |
| `teamleader_register_payment` | Register payment (nested payment obj) | ❌ | Uses `paid_at` not `payment_date` |
| `teamleader_remove_payments` | Remove payments | ❌ | |
| `teamleader_copy_invoice` | Copy to new draft | ❌ | |
| `teamleader_credit_invoice` | Full credit note | ❌ | |
| `teamleader_credit_invoice_partially` | Partial credit note | ❌ | `unit_price.tax: "excluding"` |
| `teamleader_list_bookkeeping_submissions` | List submissions | ❌ | |

## Subscriptions

| Tool | Test | Status | Notes |
|------|------|--------|-------|
| `teamleader_list_subscriptions` | Basic list (no filter) | ✅ | Returns billing_cycle + next_renewal_date + total |
| `teamleader_list_subscriptions` | Filter by status=active | ✅ | Correct results |
| `teamleader_list_subscriptions` | Filter by status=deactivated | ✅ | |
| `teamleader_list_subscriptions` | Filter by ids | ❌ | |
| `teamleader_list_subscriptions` | Filter by invoice_id | ❌ | |
| `teamleader_list_subscriptions` | Filter by deal_id | ❌ | |
| `teamleader_list_subscriptions` | Filter by customer | ❌ | |
| `teamleader_list_subscriptions` | Sort options | ❌ | |
| `teamleader_get_subscription` | Get by ID | ✅ | Returns grouped_lines, payment_term, invoice_generation, document_template |
| `teamleader_create_subscription` | Create (billing_cycle, lines, payment_term) | ⚠️ | Schema correct; test blocked by MCP tool call type coercion (numbers as strings) — works in production |
| `teamleader_update_subscription` | Update note | ✅ | Note updated + verified via get |
| `teamleader_update_subscription` | Clear note (empty string) | 🐛 | API returns 400 "note must not be empty" → fixed: empty string → null |
| `teamleader_deactivate_subscription` | Deactivate already-deactivated | ✅ | Idempotent — no error |

## Events

| Tool | Test | Status | Notes |
|------|------|--------|-------|
| `teamleader_list_events` | Basic list | ❌ | |
| `teamleader_list_events` | Filter by activity_type_id | ❌ | |
| `teamleader_get_event` | Get by ID | ❌ | |
| `teamleader_create_event` | Create | ❌ | |
| `teamleader_update_event` | Update details | ❌ | |
| `teamleader_cancel_event` | Cancel event | ❌ | |

## Meetings

| Tool | Test | Status | Notes |
|------|------|--------|-------|
| `teamleader_list_meetings` | Basic list | ❌ | |
| `teamleader_list_meetings` | Filter by attendee / customer | ❌ | |
| `teamleader_get_meeting` | Get by ID | ❌ | |
| `teamleader_schedule_meeting` | Schedule new meeting | ❌ | |
| `teamleader_update_meeting` | Update details | ❌ | |
| `teamleader_complete_meeting` | Mark as completed | ❌ | |
| `teamleader_delete_meeting` | Delete | ❌ | |
| `teamleader_create_meeting_report` | Add report/notes to meeting | ❌ | |

## Tickets

| Tool | Test | Status | Notes |
|------|------|--------|-------|
| `teamleader_list_tickets` | Basic list | ❌ | |
| `teamleader_list_tickets` | Filter by status / team / assignee | ❌ | Customer filter = `relates_to: {type, id}` |
| `teamleader_get_ticket` | Get by ID | ❌ | |
| `teamleader_create_ticket` | Create (subject, customer, team_id) | ❌ | |
| `teamleader_update_ticket` | Update status / assignee | ❌ | |
| `teamleader_list_ticket_messages` | List messages for ticket | ❌ | |
| `teamleader_get_ticket_message` | Get single message by ID | ❌ | |
| `teamleader_reply_ticket` | Reply (external message) | ❌ | |
| `teamleader_internal_message_ticket` | Add internal note | ❌ | |
| `teamleader_import_ticket_message` | Import external message | ❌ | |

## Users

| Tool | Test | Status | Notes |
|------|------|--------|-------|
| `teamleader_list_users` | Basic list | ❌ | |
| `teamleader_list_users` | Filter by team_id | ❌ | |
| `teamleader_list_users` | Filter by status | ❌ | |
| `teamleader_get_user` | Get by ID | ❌ | |

## Departments

| Tool | Test | Status | Notes |
|------|------|--------|-------|
| `teamleader_list_departments` | Basic list | ❌ | |
| `teamleader_get_department` | Get by ID | ❌ | |

## Notes

| Tool | Test | Status | Notes |
|------|------|--------|-------|
| `teamleader_list_notes` | List notes for contact/company/deal | ❌ | |
| `teamleader_list_notes` | Filter by subject type | ❌ | |
| `teamleader_create_note` | Create note on subject | ❌ | |
| `teamleader_update_note` | Update note content | ❌ | |

## Files

| Tool | Test | Status | Notes |
|------|------|--------|-------|
| `teamleader_list_files` | List files for subject | ❌ | |
| `teamleader_list_files` | Filter by subject type + id | ❌ | |
| `teamleader_get_file` | Get file metadata by ID | ❌ | |
| `teamleader_download_file` | Get download URL | ❌ | |
| `teamleader_delete_file` | Delete file | ❌ | |
| `teamleader_upload_file` | Upload file (two-step: pre-signed URL → binary POST) | ❌ | |

## Products

| Tool | Test | Status | Notes |
|------|------|--------|-------|
| `teamleader_list_products` | Basic list | ❌ | |
| `teamleader_list_products` | Filter by term | ❌ | |
| `teamleader_get_product` | Get by ID | ❌ | |
| `teamleader_add_product` | Add product | ❌ | |
| `teamleader_update_product` | Update product | ❌ | |
| `teamleader_delete_product` | Delete product | ❌ | |

## Materials

| Tool | Test | Status | Notes |
|------|------|--------|-------|
| `teamleader_list_materials` | Basic list for project | ❌ | |
| `teamleader_list_materials` | Filter by group_id | ❌ | |
| `teamleader_get_material` | Get by ID | ❌ | |
| `teamleader_create_material` | Create material (project_id, product_id, quantity) | ❌ | |
| `teamleader_update_material` | Update quantity / details | ❌ | |
| `teamleader_delete_material` | Delete material | ❌ | |
| `teamleader_assign_material` | Assign user/team to material | ❌ | `assignee: {type, id}` object |
| `teamleader_unassign_material` | Unassign from material | ❌ | |
| `teamleader_duplicate_material` | Duplicate material | ❌ | |

## Calls

| Tool | Test | Status | Notes |
|------|------|--------|-------|
| `teamleader_list_calls` | Basic list | ❌ | |
| `teamleader_list_calls` | Filter by customer / user | ❌ | |
| `teamleader_get_call` | Get by ID | ❌ | |
| `teamleader_add_call` | Add call | ❌ | |
| `teamleader_update_call` | Update call | ❌ | |
| `teamleader_complete_call` | Complete call | ❌ | |

## Orders

| Tool | Test | Status | Notes |
|------|------|--------|-------|
| `teamleader_list_orders` | Basic list | ❌ | |
| `teamleader_get_order` | Get by ID | ❌ | |

## Lookup Lists

| Tool | Test | Status | Notes |
|------|------|--------|-------|
| `teamleader_list_activity_types` | List activity types (for events) | ❌ | |
| `teamleader_list_tax_rates` | List tax rates (for invoices) | ❌ | |
| `teamleader_list_payment_terms` | List payment terms | ❌ | |
| `teamleader_list_payment_methods` | List payment methods | ❌ | |
| `teamleader_list_ticket_statuses` | List ticket statuses | ❌ | |
| `teamleader_list_products` | List products (for invoice line items) | ❌ | |
| `teamleader_list_product_categories` | List product categories | ❌ | |
| `teamleader_list_work_types` | List work types | ❌ | |
| `teamleader_list_teams` | List teams (for tickets) | ❌ | |
| `teamleader_list_tags` | List tags (for contacts/companies) | ❌ | |
| `teamleader_list_expenses` | List expense entries | ❌ | |
| `teamleader_list_mail_templates` | List mail templates | ❌ | |
| `teamleader_list_lost_reasons` | List lost reasons | ❌ | |
| `teamleader_list_business_types` | List business types | ❌ | |
| `teamleader_list_call_outcomes` | List call outcomes | ❌ | |
| `teamleader_list_currencies` | List currencies | ❌ | |
| `teamleader_list_document_templates` | List document templates | ❌ | |
| `teamleader_list_price_lists` | List price lists | ❌ | |
| `teamleader_list_units_of_measure` | List units of measure | ❌ | |
| `teamleader_list_withholding_tax_rates` | List withholding tax rates | ❌ | |
| `teamleader_list_commercial_discounts` | List commercial discounts | ❌ | |
| `teamleader_list_deal_sources` | List deal sources | ❌ | |

---

## Known API Quirks (documented)

| Endpoint | Quirk |
|----------|-------|
| `projectLines.list` | `project_id` top-level in body, NOT inside `filter` |
| `projectLines.list` | `project_group_id` NOT a server filter — must filter client-side on `l.group?.id` |
| `tasks.list` | status filter is client-side only |
| `tasks.create` | use `group_id` not `project_group_id` |
| `timeTracking.list` | returns `subject.type: "todo"` — ID differs from `nextgenTask` ID |
| `timeTracking.add` | strip milliseconds: `.replace(/\.\d+Z$/, "+00:00")` |
| `timeTracking.list` | `filter.started_after` / `filter.started_before` require full ISO 8601 datetime — bare `YYYY-MM-DD` causes 400. `toDate()` helper converts automatically |
| `timeTracking.update` | No partial updates for time fields — always send `started_at` + `ended_at` together |
| `projects-v2/projects.create` | Created project has status `"open"` (not `"active"`) |
| `projects-v2/projectLines.create` | Does NOT exist — was wrong endpoint. Use `projectGroups.create` for groups and `tasks.create` for tasks |
| `projects-v2/projectGroups.create` | Use `start_date` / `end_date` (NOT `starts_on` / `due_on`) |
| `projects-v2/projectGroups.update` | Uses `start_date`/`end_date` (not `starts_on`/`due_on`) |
| `projects-v2/projectGroups.delete` | Requires `delete_strategy` param: `"ungroup_tasks_and_materials"` or `"delete_tasks_and_materials"` |
| `projects.close` | Requires `closing_strategy` param: `"mark_tasks_and_materials_as_done"` or `"none"` |
| `projects.delete` | Requires `delete_strategy` param: `"unlink_tasks_and_time_trackings"` or `"delete_tasks_and_time_trackings"` |
| `projects.assign` | Uses `assignee: {type, id}` object (not flat ID) |
| `projects.addCustomer` | Uses `customer: {type, id}` object (not flat ID) |
| `subscriptions.list` | Uses `billing_cycle.periodicity.{unit,period}` + `days_in_advance` (NOT `renewal_period`) |
| `subscriptions.list` | `next_renewal_date` (not `next_renewal_on`); no customer filter → filter client-side on `invoicee.customer.id` |
| `subscriptions.info` | `unit_price.tax: "excluding"` in line_items (string, NOT currency field) — same as invoices.creditPartially |
| `subscriptions.info` | Tax field in line_items = `{type: "taxRate", id: "..."}` (not flat `tax_rate_id`) |
| `subscriptions.update` | `note: ""` (empty string) → 400 "must not be empty" — use `null` to clear |
| `subscriptions.deactivate` | Idempotent — deactivating already-deactivated subscription returns success |
| `invoices.registerPayment` | Uses `paid_at` (not `payment_date`), nested `payment` object (not flat params) |
| `invoices.creditPartially` | `unit_price.tax: "excluding"` (not a currency field) |
| `tickets.list` | Customer filter = `relates_to: {type, id}`, status filter = `exclude.status_ids` array |
| `files.upload` | Two-step: get pre-signed URL via API, then binary POST to that URL (no auth needed) |
| `quotations.accept` | Returns 204 No Content (not the updated quotation) |
| `quotations.create` | Requires `deal_id`; needs `grouped_lines` and/or `text` to be valid |
| `quotations.create` | `unit_price.tax: "excluding"` (same pattern as invoices/subscriptions) |
| `quotations.create` | `discount.type` only supports `"percentage"` (values 0-100) |
| `creditNotes.sendViaPeppol` | Returns 204 No Content; customer must have Peppol ID configured |
| `materials.assign` | Uses `assignee: {type, id}` object (same pattern as projects.assign) |
| `materials.assign` | Returns 204 No Content |

---

## Known Bugs

### ✅ SEC-01: Hardcoded fallback UUIDs + PII debug logging in log_time — FIXED (task 13)
**Status:** Fixed (2026-03-22)
**Issues:** (1) Real client names in test fixtures (public repo). (2) Hardcoded user/work_type UUIDs as fallback — any npm user with empty cache would log time on wrong account. (3) Debug `console.error` leaked user_id + task description to stderr.
**Fix:** (1) Replaced with generic names (AcmeCorp, AlphaProject, BetaProject). (2) Removed fallback UUIDs, return clear error if user/work_type not loaded. (3) Removed both debug log lines.

### ✅ BUG-01: log_time task_id after tree invalidation — FIXED (v1.3.1)
**Status:** Fixed (03/03/2026)
**Symptom (old):** After `task_action` invalidates tree → `log_time` with `task_id` returned success but entry was 404.
**Root cause:** Silent API acceptance without verification.
**Fix:** Added `timeTracking.info` verification after `timeTracking.add`. If entry not found → clear error with body sent + force_refresh suggestion.
**Verified:** task_action create → log_time task_id → timeTracking.info ✅ entry exists.

---

## Priority Testing Queue

All high-priority items tested. Remaining ❌ are raw API wrappers (CRM, Invoices, Events, Quotations, Credit Notes, Materials, Products, etc.) with no custom logic.
