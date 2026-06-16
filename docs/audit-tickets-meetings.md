# Audit: tickets.ts + meetings.ts vs API docs

> Generated: 2026-03-05

---

## 1. Endpoint Coverage

### Tickets

| API endpoint | MCP tool | Status |
|---|---|---|
| `tickets.list` | `teamleader_list_tickets` | OK |
| `tickets.info` | `teamleader_get_ticket` | OK |
| `tickets.create` | `teamleader_create_ticket` | OK |
| `tickets.update` | `teamleader_update_ticket` | OK |
| `tickets.listMessages` | `teamleader_list_ticket_messages` | OK |
| `tickets.getMessage` | `teamleader_get_ticket_message` | OK |
| `tickets.addReply` | `teamleader_reply_ticket` | OK |
| `tickets.addInternalMessage` | `teamleader_internal_message_ticket` | OK |
| `tickets.importMessage` | — | MISSING |

### Meetings

| API endpoint | MCP tool | Status |
|---|---|---|
| `meetings.list` | `teamleader_list_meetings` | OK |
| `meetings.info` | `teamleader_get_meeting` | OK |
| `meetings.schedule` | `teamleader_schedule_meeting` | OK |
| `meetings.update` | `teamleader_update_meeting` | OK |
| `meetings.complete` | `teamleader_complete_meeting` | OK |
| `meetings.delete` | `teamleader_delete_meeting` | OK |
| `meetings.createReport` | `teamleader_create_meeting_report` | OK |

**Summary:** Tickets 8/9 (1 missing), Meetings 7/7 (complete)

---

## 2. Param Coverage

### tickets.list

| API param | In tool? | Notes |
|---|---|---|
| `filter.ids` | NO | Missing — array of ticket IDs |
| `filter.relates_to` | YES | Via `customer_type` + `customer_id` params |
| `filter.project_ids` | YES | |
| `filter.exclude.status_ids` | YES | Via `exclude_status_ids` |
| `page` | YES | |

### tickets.info

| API param | In tool? | Notes |
|---|---|---|
| `id` | YES | |

### tickets.create

| API param | In tool? | Notes |
|---|---|---|
| `subject` | YES | |
| `customer` | YES | Via `customer_type` + `customer_id` |
| `ticket_status_id` | YES | |
| `assignee` | YES | Via `assignee_id` |
| `custom_fields` | NO | Missing |
| `description` | YES | |
| `participant` | YES | Via `participant_company_id` (only company type) |
| `initial_reply` | YES | |
| `milestone_id` | NO | Missing |

### tickets.update

| API param | In tool? | Notes |
|---|---|---|
| `id` | YES | |
| `subject` | YES | |
| `description` | YES | |
| `ticket_status_id` | YES | |
| `customer` | YES | Via `customer_type` + `customer_id` |
| `assignee` | YES | Via `assignee_id`, nullable |
| `participant` | NO | Missing — nullable object with customer.type + customer.id |
| `custom_fields` | NO | Missing |
| `milestone_id` | NO | Missing — nullable string |

### tickets.listMessages

| API param | In tool? | Notes |
|---|---|---|
| `id` | YES | |
| `filter.type` | YES | |
| `filter.created_before` | YES | |
| `filter.created_after` | YES | |
| `page` | YES | |

### tickets.getMessage

| API param | In tool? | Notes |
|---|---|---|
| `message_id` | YES | |

### tickets.addReply

| API param | In tool? | Notes |
|---|---|---|
| `id` | YES | |
| `body` | YES | |
| `ticket_status_id` | YES | |
| `attachments` | NO | Missing — array of file IDs |

### tickets.addInternalMessage

| API param | In tool? | Notes |
|---|---|---|
| `id` | YES | |
| `body` | YES | |
| `ticket_status_id` | YES | |
| `attachments` | NO | Missing — array of file IDs |

### tickets.importMessage (ENTIRE TOOL MISSING)

| API param | In tool? | Notes |
|---|---|---|
| `id` | NO | Ticket ID |
| `body` | NO | HTML formatted |
| `sent_by` | NO | Required object: {type: company/contact/user, id} |
| `sent_at` | NO | Required datetime |
| `attachments` | NO | Optional file IDs |

### meetings.list

| API param | In tool? | Notes |
|---|---|---|
| `filter.ids` | NO | Missing — array of meeting IDs |
| `filter.employee_id` | YES | |
| `filter.start_date` | YES | |
| `filter.end_date` | YES | |
| `filter.milestone_id` | NO | Missing |
| `filter.term` | YES | |
| `filter.recurrence_id` | NO | Missing |
| `page` | YES | |
| `sort` | YES | Via `sort_order` |
| `includes` | NO | Missing — `tracked_time` include support |

### meetings.info

| API param | In tool? | Notes |
|---|---|---|
| `id` | YES | |
| `includes` | YES | Via `include_tracked_time` boolean |

### meetings.schedule

| API param | In tool? | Notes |
|---|---|---|
| `title` | YES | |
| `starts_at` | YES | |
| `ends_at` | YES | |
| `description` | YES | |
| `attendees` | YES | |
| `customer` | YES | Via `customer_type` + `customer_id` |
| `location` | PARTIAL | Only virtual + customLocation with address string. API supports contact/company/calendarResource with full address objects. |
| `milestone_id` | YES | |
| `deal_id` | YES | |
| `work_order_id` | NO | Missing |
| `custom_fields` | NO | Missing |

### meetings.update

| API param | In tool? | Notes |
|---|---|---|
| `id` | YES | |
| `title` | YES | |
| `starts_at` | YES | |
| `ends_at` | YES | |
| `description` | YES | Nullable |
| `attendees` | YES | |
| `customer` | YES | Via `customer_type` + `customer_id`, nullable |
| `location` | NO | Missing — API supports same location types as schedule |
| `milestone_id` | YES | Nullable |
| `deal_id` | YES | Nullable |
| `custom_fields` | NO | Missing |

### meetings.complete

| API param | In tool? | Notes |
|---|---|---|
| `id` | YES | |

### meetings.delete

| API param | In tool? | Notes |
|---|---|---|
| `id` | YES | |

### meetings.createReport

| API param | In tool? | Notes |
|---|---|---|
| `id` | YES | |
| `attach_to` | YES | Via `attach_to_type` + `attach_to_id` |
| `summary` | YES | |
| `custom_fields` | NO | Missing |

---

## 3. describe() Coverage

### Tickets

| Tool | Param | Has describe()? |
|---|---|---|
| `list_tickets` | page | YES |
| `list_tickets` | page_size | YES |
| `list_tickets` | customer_type | YES |
| `list_tickets` | customer_id | YES |
| `list_tickets` | project_ids | YES |
| `list_tickets` | exclude_status_ids | YES |
| `get_ticket` | id | YES |
| `create_ticket` | subject | YES |
| `create_ticket` | customer_type | YES |
| `create_ticket` | customer_id | YES |
| `create_ticket` | ticket_status_id | YES |
| `create_ticket` | description | YES |
| `create_ticket` | assignee_id | YES |
| `create_ticket` | participant_company_id | YES |
| `create_ticket` | initial_reply | YES |
| `update_ticket` | id | YES |
| `update_ticket` | subject | YES |
| `update_ticket` | description | YES |
| `update_ticket` | ticket_status_id | YES |
| `update_ticket` | assignee_id | YES |
| `update_ticket` | customer_type | YES |
| `update_ticket` | customer_id | YES |
| `list_ticket_messages` | id | YES |
| `list_ticket_messages` | type | YES |
| `list_ticket_messages` | created_before | YES |
| `list_ticket_messages` | created_after | YES |
| `list_ticket_messages` | page | YES |
| `list_ticket_messages` | page_size | YES |
| `get_ticket_message` | message_id | YES |
| `reply_ticket` | id | YES |
| `reply_ticket` | body | YES |
| `reply_ticket` | ticket_status_id | YES |
| `internal_message_ticket` | id | YES |
| `internal_message_ticket` | body | YES |
| `internal_message_ticket` | ticket_status_id | YES |

### Meetings

| Tool | Param | Has describe()? |
|---|---|---|
| `list_meetings` | page | YES |
| `list_meetings` | page_size | YES |
| `list_meetings` | employee_id | YES |
| `list_meetings` | start_date | YES |
| `list_meetings` | end_date | YES |
| `list_meetings` | term | YES |
| `list_meetings` | sort_order | YES |
| `get_meeting` | id | YES |
| `get_meeting` | include_tracked_time | YES |
| `schedule_meeting` | title | YES |
| `schedule_meeting` | starts_at | YES |
| `schedule_meeting` | ends_at | YES |
| `schedule_meeting` | attendees | YES |
| `schedule_meeting` | description | YES |
| `schedule_meeting` | customer_type | YES |
| `schedule_meeting` | customer_id | YES |
| `schedule_meeting` | location_type | YES |
| `schedule_meeting` | location_address | YES |
| `schedule_meeting` | milestone_id | YES |
| `schedule_meeting` | deal_id | YES |
| `update_meeting` | id | YES |
| `update_meeting` | title | YES |
| `update_meeting` | starts_at | YES |
| `update_meeting` | ends_at | YES |
| `update_meeting` | description | YES |
| `update_meeting` | attendees | YES |
| `update_meeting` | customer_type | YES |
| `update_meeting` | customer_id | YES |
| `update_meeting` | milestone_id | YES |
| `update_meeting` | deal_id | YES |
| `complete_meeting` | id | YES |
| `delete_meeting` | id | YES |
| `create_meeting_report` | id | YES |
| `create_meeting_report` | attach_to_type | YES |
| `create_meeting_report` | attach_to_id | YES |
| `create_meeting_report` | summary | YES |

**Summary:** All existing params have describe() — no gaps.

---

## 4. llmTip / Known Quirk Coverage

| Tool | Known quirk | In description? | Notes |
|---|---|---|---|
| `list_tickets` | Customer filter = `relates_to: {type, id}` (NOT `customer_id`) | YES | "WARNING: customer filter uses 'relates_to: {type, id}' internally (NOT 'customer_id') — this tool handles that automatically." |
| `list_tickets` | Status filter = `exclude.status_ids` (no direct status filter) | YES | "Status filtering is exclusion-based only (exclude_status_ids) — there is no direct status filter." |
| `reply_ticket` | body is HTML formatted | YES | "The message body should be HTML formatted." |
| `internal_message_ticket` | NOT visible to customer | YES | "NOT visible to the customer." |
| `schedule_meeting` | At least one user attendee required | YES | "at least one attendee (user)" |
| `update_meeting` | Attendees = full list replacement (not additive) | YES | "the full list must be provided (at least one user)" |

No llmTips are missing for the known CLAUDE.md quirks related to these tools.

---

## Summary of Issues

### Critical (bugs / missing endpoints)

| # | Issue | Tool | Severity |
|---|---|---|---|
| 1 | `tickets.importMessage` — entire endpoint missing, no tool exists | — | MISSING ENDPOINT |

### Missing params (by priority)

| # | Tool | Missing param | Priority |
|---|---|---|---|
| 1 | `list_tickets` | `filter.ids` | Medium |
| 2 | `create_ticket` | `custom_fields` | Medium |
| 3 | `create_ticket` | `milestone_id` | Low |
| 4 | `update_ticket` | `participant` | Low |
| 5 | `update_ticket` | `custom_fields` | Medium |
| 6 | `update_ticket` | `milestone_id` | Low |
| 7 | `reply_ticket` | `attachments` | Medium |
| 8 | `internal_message_ticket` | `attachments` | Medium |
| 9 | `list_meetings` | `filter.ids` | Low |
| 10 | `list_meetings` | `filter.milestone_id` | Low |
| 11 | `list_meetings` | `filter.recurrence_id` | Low |
| 12 | `list_meetings` | `includes` (tracked_time) | Low |
| 13 | `schedule_meeting` | `work_order_id` | Low |
| 14 | `schedule_meeting` | `custom_fields` | Low |
| 15 | `schedule_meeting` | `location` (partial — missing contact/company/calendarResource types) | Low |
| 16 | `update_meeting` | `location` | Low |
| 17 | `update_meeting` | `custom_fields` | Low |
| 18 | `create_meeting_report` | `custom_fields` | Low |
