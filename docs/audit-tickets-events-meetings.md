# Audit: Tickets + Events + Meetings tools vs API docs

> Generated: 2026-04-01
> API docs source: `docs/api/` (scraped 2026-03-05)

---

## Tickets

### tickets.list (tool: `teamleader_list_tickets`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| filter.ids | Yes | |
| filter.relates_to (type, id) | Yes | Mapped from customer_type/customer_id |
| filter.project_ids | Yes | |
| filter.exclude.status_ids | Yes | |
| page.size | Yes | |
| page.number | Yes | |

**Gaps: 0**

### tickets.info (tool: `teamleader_get_ticket`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | Yes | |

**Gaps: 0**

### tickets.create (tool: `teamleader_create_ticket`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| subject | Yes | Required |
| customer (type, id) | Yes | Required, mapped from customer_type/customer_id |
| ticket_status_id | Yes | Required |
| assignee (type, id) | Yes | Mapped from assignee_id |
| custom_fields | **No** | Array of {id, value} objects |
| description | Yes | |
| participant (customer: {type, id}) | Yes | Only company type via participant_company_id |
| initial_reply | Yes | |
| milestone_id | **No** | String, links ticket to milestone |

**Gaps: 2** (custom_fields, milestone_id)

### tickets.update (tool: `teamleader_update_ticket`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | Yes | Required |
| subject | Yes | |
| description | Yes | |
| ticket_status_id | Yes | |
| customer (type, id) | Yes | Mapped from customer_type/customer_id |
| assignee (nullable, type: user) | Yes | Mapped from assignee_id, supports null |
| participant (nullable) | **No** | Nullable object with customer {type, id} |
| custom_fields | **No** | Array of {id, value} objects |
| milestone_id (nullable) | **No** | Nullable string |

**Gaps: 3** (participant, custom_fields, milestone_id)

### tickets.listMessages (tool: `teamleader_list_ticket_messages`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | Yes | |
| filter.type | Yes | |
| filter.created_before | Yes | |
| filter.created_after | Yes | |
| page.size | Yes | |
| page.number | Yes | |

**Gaps: 0**

### tickets.getMessage (tool: `teamleader_get_ticket_message`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| message_id | Yes | |

**Gaps: 0**

### tickets.addReply (tool: `teamleader_reply_ticket`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | Yes | |
| body | Yes | |
| ticket_status_id | Yes | |
| attachments | Yes | |

**Gaps: 0**

### tickets.addInternalMessage (tool: `teamleader_internal_message_ticket`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | Yes | |
| body | Yes | |
| ticket_status_id | Yes | |
| attachments | Yes | |

**Gaps: 0**

### tickets.importMessage (tool: `teamleader_import_ticket_message`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | Yes | |
| body | Yes | |
| sent_by (type, id) | Yes | Mapped from sent_by_type/sent_by_id |
| sent_at | Yes | |
| attachments | Yes | |

**Gaps: 0**

---

## Events

### events.cancel (tool: `teamleader_cancel_event`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | Yes | |

**Gaps: 0**

### events.create (tool: `teamleader_create_event`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| title | Yes | Required |
| description | Yes | |
| activity_type_id | Yes | Required |
| starts_at | Yes | Required |
| ends_at | Yes | Required |
| location | Yes | |
| work_type_id | Yes | |
| attendees [{type, id}] | Yes | |
| links [{type, id}] | Yes | |

**Gaps: 0**

### events.info (tool: `teamleader_get_event`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | Yes | |

**Gaps: 0**

### events.list (tool: `teamleader_list_events`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| filter.ids | Yes | |
| filter.user_id | Yes | |
| filter.activity_type_id | Yes | |
| filter.ends_after | Yes | |
| filter.starts_before | Yes | |
| filter.term | Yes | |
| filter.attendee (type, id) | Yes | Mapped from attendee_type/attendee_id |
| filter.link (type, id) | Yes | Mapped from link_type/link_id |
| filter.task_id | Yes | |
| filter.done | Yes | |
| page.size | Yes | |
| page.number | Yes | |
| sort [{field, order}] | Yes | |

**Gaps: 0**

### events.update (tool: `teamleader_update_event`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | Yes | Required |
| title | Yes | |
| description (nullable) | Yes | |
| starts_at | Yes | |
| ends_at | Yes | |
| location | Yes | |
| work_type_id | Yes | |
| attendees [{type, id}] | Yes | |
| links [{type, id}] | Yes | |

**Gaps: 0**

---

## Meetings

### meetings.complete (tool: `teamleader_complete_meeting`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | Yes | |

**Gaps: 0**

### meetings.delete (tool: `teamleader_delete_meeting`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | Yes | |

**Gaps: 0**

### meetings.info (tool: `teamleader_get_meeting`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | Yes | |
| includes | Yes | Supports "tracked_time" |

**Gaps: 0**

### meetings.list (tool: `teamleader_list_meetings`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| filter.ids | Yes | |
| filter.employee_id | Yes | |
| filter.start_date | Yes | |
| filter.end_date | Yes | |
| filter.milestone_id | **No** | Filter by milestone |
| filter.term | Yes | |
| filter.recurrence_id | **No** | Filter by recurrence |
| page.size | Yes | |
| page.number | Yes | |
| sort [{field, order}] | Yes | |
| includes | **No** | Top-level param for "tracked_time" |

**Gaps: 3** (milestone_id, recurrence_id, includes)

### meetings.schedule (tool: `teamleader_schedule_meeting`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| title | Yes | Required |
| starts_at | Yes | Required |
| ends_at | Yes | Required |
| description | Yes | |
| attendees [{type, id}] | Yes | Required |
| customer (type, id) | Yes | Mapped from customer_type/customer_id |
| location | Partial | Only virtual/customLocation supported; missing contact/company/calendarResource location variants |
| milestone_id | Yes | |
| deal_id | Yes | |
| work_order_id | **No** | Link to work order |
| custom_fields | **No** | Array of {id, value} objects |

**Gaps: 2** (work_order_id, custom_fields) + location partially incomplete

### meetings.update (tool: `teamleader_update_meeting`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | Yes | Required |
| title | Yes | |
| starts_at | Yes | |
| ends_at | Yes | |
| description (nullable) | Yes | |
| attendees [{type, id}] | Yes | |
| customer (nullable) | Yes | Mapped from customer_type/customer_id |
| location | **No** | Complex oneOf with virtual/contact/company/customLocation/calendarResource |
| milestone_id (nullable) | Yes | |
| deal_id (nullable) | Yes | |
| custom_fields | **No** | Array of {id, value} objects |

**Gaps: 2** (location, custom_fields)

### meetings.createReport (tool: `teamleader_create_meeting_report`)

| API param | In tool? | Notes |
|-----------|----------|-------|
| id | Yes | Required |
| attach_to (type, id) | Yes | Mapped from attach_to_type/attach_to_id |
| summary | Yes | |
| custom_fields | **No** | Array of {id, value} objects |

**Gaps: 1** (custom_fields)

---

## Summary

| Domain | Tool | Gaps |
|--------|------|------|
| Tickets | tickets.list | 0 |
| Tickets | tickets.info | 0 |
| Tickets | tickets.create | 2 (custom_fields, milestone_id) |
| Tickets | tickets.update | 3 (participant, custom_fields, milestone_id) |
| Tickets | tickets.listMessages | 0 |
| Tickets | tickets.getMessage | 0 |
| Tickets | tickets.addReply | 0 |
| Tickets | tickets.addInternalMessage | 0 |
| Tickets | tickets.importMessage | 0 |
| Events | events.cancel | 0 |
| Events | events.create | 0 |
| Events | events.info | 0 |
| Events | events.list | 0 |
| Events | events.update | 0 |
| Meetings | meetings.complete | 0 |
| Meetings | meetings.delete | 0 |
| Meetings | meetings.info | 0 |
| Meetings | meetings.list | 3 (milestone_id, recurrence_id, includes) |
| Meetings | meetings.schedule | 2+ (work_order_id, custom_fields, location partial) |
| Meetings | meetings.update | 2 (location, custom_fields) |
| Meetings | meetings.createReport | 1 (custom_fields) |
| **Total** | | **13 gaps** |

### Pattern: Recurring missing params
- **custom_fields**: Missing in tickets.create, tickets.update, meetings.schedule, meetings.update, meetings.createReport (5 tools)
- **milestone_id**: Missing in tickets.create, tickets.update, meetings.list (3 tools)
- **location** (meetings): Incomplete in schedule, missing in update
