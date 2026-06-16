# Teamleader Focus MCP

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that wraps the **Teamleader Focus CRM API**. Gives AI assistants (Claude Code, Claude Desktop, Cursor, etc.) the ability to manage contacts, companies, deals, tasks, events, invoices, time tracking, and projects — including a smart task resolution workflow for automated time logging.

Inspired by [globodai-group/mcp-teamleader](https://github.com/globodai-group/mcp-teamleader). Rewritten and extended with full API coverage, time tracking, projects v2, and smart cache-first task resolution.

---

## Features

- **112 tools** covering the full Teamleader Focus API
- **Contacts** — Full CRUD + tag/untag + company link management
- **Companies** — Full CRUD + tag/untag
- **Deals** — Full CRUD + win/lose/move + pipelines/phases/sources management
- **Tasks** — Standalone tasks: full CRUD + complete/reopen/schedule
- **Events** — List, get, create, update, cancel
- **Meetings** — Full CRUD + complete + reports
- **Invoices** — Full lifecycle: draft → book → send → payment → credit
- **Tickets** — Full CRUD + messages + reply/internal
- **Time Tracking** — List, add, update, delete + start/stop/resume timers + timesheet
- **Projects v2** — Full CRUD + groups + tasks + relationships + lifecycle
- **Subscriptions** — Full CRUD + deactivate
- **Quotations** — Full CRUD + accept/send/download
- **Materials** — Full CRUD + assign/unassign/duplicate
- **Files** — List, get, download, delete, upload
- **Notes** — List, create, update
- **Calls** — List, get, add, update, complete
- **Smart Resolution** — Cache-first Company > Project > Group > Task navigation + time logging
- **OAuth2** — Browser-based login flow + automatic token refresh with rotation

---

## Prerequisites

A **Teamleader Focus** account with API access:

1. Go to [Developer Portal](https://developer.focus.teamleader.eu/)
2. Register an integration to get your **Client ID** and **Client Secret**
3. Complete the OAuth2 flow to obtain a **Refresh Token** (see [QUICKSTART.md](QUICKSTART.md))

---

## Quick Start

### Option A — npx (recommended, no install needed)

Add to `%APPDATA%\Claude\claude_desktop_config.json` (Windows) or `~/.claude.json`:

```json
{
  "mcpServers": {
    "teamleader": {
      "command": "npx",
      "args": ["-y", "@tailormade/teamleader-focus-mcp"],
      "env": {
        "TEAMLEADER_CLIENT_ID": "your_client_id",
        "TEAMLEADER_CLIENT_SECRET": "your_client_secret",
        "TEAMLEADER_REFRESH_TOKEN": "your_refresh_token"
      }
    }
  }
}
```

### Option B — Build from source

```bash
git clone https://github.com/tailormade-eu/Tailormade.TeamleaderFocusMcp.git
cd Tailormade.TeamleaderFocusMcp
npm install
npm run build
```

Add to your Claude config:

```json
{
  "mcpServers": {
    "teamleader": {
      "command": "node",
      "args": ["C:\\ABSOLUTE\\PATH\\TO\\dist\\index.js"],
      "env": {
        "TEAMLEADER_CLIENT_ID": "your_client_id",
        "TEAMLEADER_CLIENT_SECRET": "your_client_secret",
        "TEAMLEADER_REFRESH_TOKEN": "your_refresh_token"
      }
    }
  }
}
```

---

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TEAMLEADER_CLIENT_ID` | Yes | OAuth2 Client ID |
| `TEAMLEADER_CLIENT_SECRET` | Yes | OAuth2 Client Secret |
| `TEAMLEADER_REFRESH_TOKEN` | No | OAuth2 Refresh Token (auto-rotated, persisted to `~/.teamleader-tokens.json`). If omitted, only `teamleader_login` is available — use it to obtain tokens via browser. |

### Cache Files

| File | Purpose |
|------|---------|
| `~/.teamleader-cache.json` | Entity cache (companies, projects, groups, tasks, task trees) |
| `~/.teamleader-tasks-{slug}.yaml` | Full task tree written by `teamleader_load_tasks` (contains all IDs) |
| `~/.teamleader-tokens.json` | Persisted OAuth2 tokens (auto-managed) |

---

## Available Tools

### Contacts

| Tool | Description |
|------|-------------|
| `teamleader_list_contacts` | List contacts with optional filtering by term, tags, or updated_since |
| `teamleader_get_contact` | Get full details of a specific contact by ID |
| `teamleader_create_contact` | Create a new contact (first name, last name, email, phone, tags, language) |
| `teamleader_update_contact` | Update an existing contact |
| `teamleader_delete_contact` | Delete a contact |
| `teamleader_link_contact_to_company` | Link a contact to a company (with optional position/decision_maker) |
| `teamleader_unlink_contact_from_company` | Unlink a contact from a company |
| `teamleader_update_contact_company_link` | Update position or decision_maker on an existing link |
| `teamleader_tag_contact` | Add tags to a contact |
| `teamleader_untag_contact` | Remove tags from a contact |

### Companies

| Tool | Description |
|------|-------------|
| `teamleader_list_companies` | List companies with filtering by term, tags, or VAT number |
| `teamleader_get_company` | Get full details of a specific company by ID |
| `teamleader_create_company` | Create a new company (name, email, phone, VAT, website, tags) |
| `teamleader_update_company` | Update an existing company |
| `teamleader_delete_company` | Delete a company |
| `teamleader_tag_company` | Add tags to a company |
| `teamleader_untag_company` | Remove tags from a company |

### Deals

| Tool | Description |
|------|-------------|
| `teamleader_list_deals` | List deals with filtering by term, phase, or responsible user |
| `teamleader_get_deal` | Get full details of a specific deal by ID |
| `teamleader_create_deal` | Create a new deal (title, customer, phase, value, probability) |
| `teamleader_update_deal` | Update an existing deal (title, value, dates, responsible user) |
| `teamleader_delete_deal` | Delete a deal |
| `teamleader_lose_deal` | Mark a deal as lost (optional reason_id + extra_info) |
| `teamleader_win_deal` | Mark a deal as won |
| `teamleader_move_deal` | Move a deal to a different phase |
| `teamleader_list_lost_reasons` | List available lost reasons (for deals.lose) |
| `teamleader_list_deal_phases` | List deal phases (for deals.move/create) |
| `teamleader_list_deal_sources` | List deal sources (for deals.create) |
| `teamleader_list_deal_pipelines` | List deal pipelines |
| `teamleader_create_deal_pipeline` | Create a deal pipeline |
| `teamleader_update_deal_pipeline` | Update a deal pipeline |
| `teamleader_delete_deal_pipeline` | Delete a deal pipeline |
| `teamleader_duplicate_deal_pipeline` | Duplicate a deal pipeline |
| `teamleader_mark_deal_pipeline_default` | Mark a pipeline as default |
| `teamleader_create_deal_phase` | Create a deal phase |
| `teamleader_update_deal_phase` | Update a deal phase |
| `teamleader_delete_deal_phase` | Delete a deal phase |
| `teamleader_duplicate_deal_phase` | Duplicate a deal phase |
| `teamleader_move_deal_phase` | Reorder a deal phase |

### Tasks (standalone)

| Tool | Description |
|------|-------------|
| `teamleader_list_tasks` | List tasks with optional filtering and pagination |
| `teamleader_create_task` | Create a new task |
| `teamleader_get_task` | Get full details of a specific task by ID |
| `teamleader_update_task` | Update task title, description, due date, or assignee |
| `teamleader_delete_task` | Delete a task |
| `teamleader_complete_task` | Mark a task as completed |
| `teamleader_reopen_task` | Reopen a completed task |
| `teamleader_schedule_task` | Schedule a task as a calendar event |

### Events

| Tool | Description |
|------|-------------|
| `teamleader_list_events` | List calendar events with optional date range filter |
| `teamleader_get_event` | Get full details of a specific event by ID |
| `teamleader_create_event` | Create a new calendar event (title, activity type, start/end, attendees) |
| `teamleader_update_event` | Update an existing event |
| `teamleader_cancel_event` | Cancel a calendar event |

### Meetings

| Tool | Description |
|------|-------------|
| `teamleader_list_meetings` | List meetings with filter by employee, date range, or term |
| `teamleader_get_meeting` | Get full details of a specific meeting |
| `teamleader_schedule_meeting` | Schedule a new meeting with attendees and optional customer/deal |
| `teamleader_update_meeting` | Update meeting details |
| `teamleader_complete_meeting` | Mark a meeting as done |
| `teamleader_delete_meeting` | Delete a meeting |
| `teamleader_create_meeting_report` | Create a report attached to a contact, company, or deal |

### Invoices

| Tool | Description |
|------|-------------|
| `teamleader_list_invoices` | List invoices with filtering by status, date range, or department |
| `teamleader_get_invoice` | Get full details of a specific invoice by ID |
| `teamleader_create_invoice` | Create a new draft invoice with line items |
| `teamleader_book_invoice` | Book a draft invoice (→ outstanding) |
| `teamleader_send_invoice` | Send invoice via email |
| `teamleader_send_invoice_peppol` | Send invoice via Peppol e-invoicing |
| `teamleader_delete_invoice` | Delete a draft invoice |
| `teamleader_update_invoice` | Update a draft invoice |
| `teamleader_update_booked_invoice` | Update limited fields on a booked invoice |
| `teamleader_register_payment` | Register a payment on an invoice |
| `teamleader_remove_payments` | Remove all payments from an invoice |
| `teamleader_copy_invoice` | Copy an invoice to a new draft |
| `teamleader_credit_invoice` | Create a full credit note |
| `teamleader_credit_invoice_partially` | Create a partial credit note |
| `teamleader_download_invoice` | Get a temporary download URL (PDF/UBL) |
| `teamleader_list_mail_templates` | List mail templates (for invoice sending) |
| `teamleader_list_payment_methods` | List payment methods (for registering payments) |

### Tickets

| Tool | Description |
|------|-------------|
| `teamleader_list_tickets` | List tickets with filter by customer, project, or status |
| `teamleader_get_ticket` | Get full details of a specific ticket |
| `teamleader_create_ticket` | Create a new ticket (subject, customer, team, assignee) |
| `teamleader_update_ticket` | Update ticket subject, description, status, or assignee |
| `teamleader_list_ticket_messages` | List messages on a ticket (filter by type or date) |
| `teamleader_get_ticket_message` | Get a single message by ID |
| `teamleader_reply_ticket` | Add a customer-visible reply to a ticket |
| `teamleader_internal_message_ticket` | Add an internal/private message to a ticket |
| `teamleader_import_ticket_message` | Import a raw message into a ticket |

### Subscriptions

| Tool | Description |
|------|-------------|
| `teamleader_list_subscriptions` | List recurring invoices with filtering |
| `teamleader_get_subscription` | Get subscription details |
| `teamleader_create_subscription` | Create a new recurring invoice |
| `teamleader_update_subscription` | Update subscription settings |
| `teamleader_deactivate_subscription` | Deactivate a subscription |

### Quotations

| Tool | Description |
|------|-------------|
| `teamleader_list_quotations` | List quotations with filtering |
| `teamleader_get_quotation` | Get quotation details |
| `teamleader_create_quotation` | Create a new quotation |
| `teamleader_update_quotation` | Update an existing quotation |
| `teamleader_delete_quotation` | Delete a quotation |
| `teamleader_accept_quotation` | Accept a quotation |
| `teamleader_send_quotation` | Send quotation via email |
| `teamleader_download_quotation` | Get a temporary download URL |

### Credit Notes

| Tool | Description |
|------|-------------|
| `teamleader_list_credit_notes` | List credit notes with filtering |
| `teamleader_get_credit_note` | Get credit note details |
| `teamleader_download_credit_note` | Get a temporary download URL |
| `teamleader_send_credit_note_peppol` | Send credit note via Peppol |

### Materials

| Tool | Description |
|------|-------------|
| `teamleader_list_materials` | List materials with filtering |
| `teamleader_get_material` | Get material details |
| `teamleader_create_material` | Create a new material |
| `teamleader_update_material` | Update a material |
| `teamleader_delete_material` | Delete a material |
| `teamleader_assign_material` | Assign material to a project task |
| `teamleader_unassign_material` | Unassign material from a task |
| `teamleader_duplicate_material` | Duplicate a material |

### Calls

| Tool | Description |
|------|-------------|
| `teamleader_list_calls` | List calls with filtering |
| `teamleader_get_call` | Get call details |
| `teamleader_add_call` | Add a new call |
| `teamleader_update_call` | Update a call |
| `teamleader_complete_call` | Mark a call as complete |

### Orders

| Tool | Description |
|------|-------------|
| `teamleader_list_orders` | List orders with filtering |
| `teamleader_get_order` | Get order details |

### Time Tracking

| Tool | Description |
|------|-------------|
| `teamleader_list_timetracking` | List time entries filtered by user, date range, or subject |
| `teamleader_get_timetracking` | Get details of a specific time entry by ID |
| `teamleader_add_timetracking` | Add a new time entry (user, work type, start/end, subject) |
| `teamleader_update_timetracking` | Update an existing time entry |
| `teamleader_delete_timetracking` | Delete a time entry |
| `teamleader_start_timer` | Start a running timer (one active timer per user) |
| `teamleader_stop_timer` | Stop the current running timer |
| `teamleader_get_current_timer` | Get the currently running timer |
| `teamleader_update_timer` | Update a running timer (work type, subject, description) |
| `teamleader_resume_timetracking` | Start a new timer from an existing time entry |
| `teamleader_timesheet` | Daily timesheet — all entries for a date, grouped by project/task. Formats: md, beauty, manictime |

### Projects v2

| Tool | Description |
|------|-------------|
| `teamleader_list_projects_v2` | List projects with filtering by status, company, or search term |
| `teamleader_get_project_v2` | Get full details of a specific project by ID |
| `teamleader_create_project_v2` | Create a new project with customer, dates, and responsible user |
| `teamleader_update_project_v2` | Update an existing project |
| `teamleader_close_project_v2` | Close a project |
| `teamleader_reopen_project_v2` | Reopen a closed project |
| `teamleader_delete_project_v2` | Delete a project |
| `teamleader_duplicate_project_v2` | Duplicate a project to a new draft |
| `teamleader_add_project_customer` | Add a customer (company/contact) to a project |
| `teamleader_remove_project_customer` | Remove a customer from a project |
| `teamleader_add_project_deal` | Link a deal to a project |
| `teamleader_remove_project_deal` | Unlink a deal from a project |
| `teamleader_add_project_owner` | Add an owner/member to a project |
| `teamleader_remove_project_owner` | Remove an owner/member from a project |
| `teamleader_assign_project` | Assign a user or team to a project |
| `teamleader_unassign_project` | Unassign a user or team from a project |
| `teamleader_list_project_groups` | List project groups (phases/milestones) for a project |
| `teamleader_create_project_group` | Create a new group (phase) within a project |
| `teamleader_update_project_group` | Update a project group title, description, or dates |
| `teamleader_list_project_tasks_v2` | List tasks by project or project group |
| `teamleader_create_project_task_v2` | Create a task within a project or group |
| `teamleader_complete_project_task` | Mark a project task as complete |
| `teamleader_reopen_project_task` | Reopen a completed project task |
| `teamleader_delete_project_task` | Delete a project task |
| `teamleader_remove_task_from_group` | Remove a task from its group |
| `teamleader_add_project_line_to_group` | Add/move a task or material to a group |
| `teamleader_list_project_lines` | List all lines (tasks + materials) in a project |
| `teamleader_get_project_group` | Get project group details |
| `teamleader_duplicate_project_group` | Duplicate a project group |
| `teamleader_assign_project_group` | Assign a user/team to a project group |
| `teamleader_unassign_project_group` | Unassign from a project group |
| `teamleader_update_project_task` | Update a project task |
| `teamleader_get_project_task` | Get project task details |
| `teamleader_assign_project_task` | Assign a user to a project task |
| `teamleader_unassign_project_task` | Unassign from a project task |
| `teamleader_duplicate_project_task` | Duplicate a project task |
| `teamleader_add_project_quotation` | Link a quotation to a project |
| `teamleader_remove_project_quotation` | Unlink a quotation from a project |

### Users

| Tool | Description |
|------|-------------|
| `teamleader_list_users` | List all users in the account |
| `teamleader_get_user` | Get full details of a specific user by ID |

### Departments

| Tool | Description |
|------|-------------|
| `teamleader_list_departments` | List all departments |
| `teamleader_get_department` | Get full details of a specific department |

### Files

| Tool | Description |
|------|-------------|
| `teamleader_list_files` | List files attached to a contact, company, deal, invoice, project, or ticket |
| `teamleader_get_file` | Get file metadata (name, size, mime type, uploader) |
| `teamleader_download_file` | Get a temporary download URL for a file |
| `teamleader_delete_file` | Delete a file |
| `teamleader_upload_file` | Upload a file to an entity (two-step: get URL, then upload) |

### Notes

| Tool | Description |
|------|-------------|
| `teamleader_list_notes` | List notes for a contact, company, deal, or project |
| `teamleader_create_note` | Create a note on a contact, company, deal, or project |
| `teamleader_update_note` | Update an existing note by ID |

### Lookup Lists

| Tool | Description |
|------|-------------|
| `teamleader_list_activity_types` | List activity types (needed for events.create) |
| `teamleader_list_tax_rates` | List tax rates (needed for invoice line items) |
| `teamleader_list_payment_terms` | List payment terms (needed for invoices) |
| `teamleader_list_ticket_statuses` | List ticket statuses (needed for tickets.update) |
| `teamleader_list_products` | List products (for invoice line items) |
| `teamleader_list_product_categories` | List product categories |
| `teamleader_list_work_types` | List work types (for time tracking) |
| `teamleader_list_teams` | List teams (needed for tickets) |
| `teamleader_list_tags` | List all tags used in the account |
| `teamleader_list_expenses` | List expense entries with optional filters |
| `teamleader_list_business_types` | List business types |
| `teamleader_list_call_outcomes` | List call outcomes |
| `teamleader_list_currencies` | List currencies and exchange rates |
| `teamleader_list_document_templates` | List document templates |
| `teamleader_list_commercial_discounts` | List commercial discounts |
| `teamleader_list_lost_reasons` | List lost reasons |
| `teamleader_list_price_lists` | List price lists |
| `teamleader_list_units_of_measure` | List units of measure |
| `teamleader_list_withholding_tax_rates` | List withholding tax rates |
| `teamleader_list_bookkeeping_submissions` | List bookkeeping submissions |
| `teamleader_add_product` | Add a product |
| `teamleader_get_product` | Get product details |
| `teamleader_update_product` | Update a product |
| `teamleader_delete_product` | Delete a product |

### Smart Resolution (Cache-first)

These tools implement the recommended workflow for time logging. They maintain a local cache to avoid repeated API calls.

| Tool | Description |
|------|-------------|
| `teamleader_find_task` | Navigate Company > Project > Group > Task hierarchy interactively. Numbered selection when multiple options. Tasks auto-created if not found. |
| `teamleader_log_time` | Register time for a task. Resolves from cache. Supports deduplication and overlap detection. |
| `teamleader_load_tasks` | Load and display the full Project > Group > Task tree for a company. Cache-first (30 min TTL). Writes YAML with all IDs. |
| `teamleader_task_action` | Maintenance actions on tasks: close, create, move a time entry, or delete a project group. |
| `teamleader_cache_stats` | Show cache statistics and all cached tasks. |
| `teamleader_clear_cache` | Clear the entire local cache (forces fresh API lookups on next call). |

### Authentication

| Tool | Description |
|------|-------------|
| `teamleader_login` | Start OAuth login flow — opens browser for Teamleader authorization, captures callback on localhost:19836, exchanges code for tokens, persists to `~/.teamleader-tokens.json`. Use for initial setup or expired refresh token recovery. |

---

## Recommended Workflow: Time Logging

### Option A — Interactive (first use or unknown task)

```
1. teamleader_find_task(company_name="Acme", group_name="Sprint 12", task_name="Bug fix login")
   → resolves company > project > group > task, caches result

2. teamleader_log_time(company_name="Acme", task_name="Bug fix login", started_on="09:00", ended_on="11:30")
   → reads from cache, logs time entry, checks for duplicates
```

### Option B — Load tree first (recommended for sessions with many log entries)

```
1. teamleader_load_tasks(company_name="Acme")
   → fetches full tree, writes ~/.teamleader-tasks-acme.yaml, shows summary

2. teamleader_load_tasks(company_name="Acme", visual=true)
   → shows numbered ASCII tree

   Company: Acme Corp
   === Project Alpha ===
     [Sprint 12]
       1. Bug fix login (to_do)
       2. Add unit tests (in_progress)

3. teamleader_load_tasks(company_name="Acme", task_selection=1)
   → caches task #1 for direct use

4. teamleader_log_time(company_name="Acme", task_name="Bug fix login", started_on="09:00", ended_on="11:30")
   → resolves from cache, logs time
```

### Option C — Direct task_id (fastest, when ID is already known)

```
teamleader_log_time(company_name="Acme", task_id="abc-123", started_on="09:00", ended_on="11:30")
```

---

## Smart Resolution: `teamleader_find_task` Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `company_name` | Yes | Partial match on company name |
| `group_name` | Yes | Partial match on group/phase name (searched across all projects) |
| `task_name` | Yes | Partial match on task name (auto-created if not found) |
| `project_selection` | Auto | Select project by number when multiple found |
| `task_selection` | Auto | Select task by number from listed options |
| `confirm_create_group` | Auto | Confirm creation of new group (requires project_selection) |
| `confirm_create_project` | Auto | Confirm creation of new project |
| `only_open` | Optional | Only show open tasks — to_do, in_progress, on_hold (default: true) |
| `_company_id` | Internal | Resolved company ID, pass between calls to avoid re-resolving |
| `_project_id` | Internal | Resolved project ID |
| `_group_id` | Internal | Resolved group ID |
| `_group_title` | Internal | Resolved group title |

---

## Smart Resolution: `teamleader_log_time` Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `company_name` | Yes | Partial match on company name |
| `task_name` | Conditional | Task name (partial match, must be in cache). Required if task_id not given. |
| `task_id` | Conditional | Direct task ID — skips cache lookup. Use when ID is known from load_tasks. |
| `started_on` | Yes | Start time: ISO 8601, `YYYY-MM-DD HH:MM`, or `HH:MM` (uses today) |
| `ended_on` | Yes | End time: same formats as started_on |
| `description` | Optional | Description of work done |
| `work_type_id` | Optional | Override the default work type |
| `date` | Optional | Date for HH:MM format (YYYY-MM-DD, default: today) |
| `force` | Optional | Skip deduplication and overlap checks entirely |
| `confirm_overlap` | Optional | Confirm registration when overlap with another task is detected |

---

## Deduplication Rules (`teamleader_log_time`)

| Rule | Condition | Action |
|------|-----------|--------|
| Exact duplicate | Same task ID, same start time (to second) | Block with error |
| Overlap | Any time range overlap with existing entry | Warn, ask `confirm_overlap=true` |
| Force | `force=true` | Skip all checks |

---

## `teamleader_load_tasks` Parameters

| Parameter | Description |
|-----------|-------------|
| `company_name` | Company to load (partial match) |
| `project_filter` | Filter projects by name (partial match) |
| `group_filter` | Filter groups by name (partial match) |
| `only_open` | Only include open tasks (default: true) |
| `visual` | Show ASCII tree with numbered tasks instead of summary |
| `task_selection` | Cache a specific task by number (from visual output) |
| `force_refresh` | Force reload from API, bypass 30 min cache |
| `_company_id` | Internal: resolved company ID |

---

## Cache TTL

| Entity | TTL |
|--------|-----|
| active_user | No expiry (manual clear only) |
| work_types | 7 days |
| companies | 24 hours |
| projects | 2 hours |
| groups | 1 hour |
| tasks | 1 hour |
| task_trees | 30 minutes |

Auto-prune: expired entries are removed on every cache write.

---

## Teamleader API Quirks

These are critical for any future development or debugging.

### `projects-v2/projectLines.list`

- `project_id` must be **top-level** in the request body — NOT inside `filter`
- `project_group_id` is **NOT** a server-side filter — must filter client-side on `l.group?.id`

### `projects-v2/tasks.list`

- Filter by `ids` array works server-side
- Status is **NOT** a server-side filter — filter client-side on status field

### `projects-v2/tasks.create`

- Use `group_id` (NOT `project_group_id`)
- Use `tasks.create` endpoint (NOT `projectLines.create`)

### `timeTracking.list`

- Returns `subject.type: "todo"` — the ID differs from the `nextgenTask` ID
- Deduplication must match on **start time** (to second precision), not on subject ID

### `invoices.registerPayment`

- Uses `paid_at` (NOT `payment_date`)
- Payment is a nested object: `{ payment: { amount: { amount, currency }, paid_at, payment_method_id } }`

### `invoices.creditPartially`

- Line item tax uses `unit_price.tax: "excluding"` (NOT a currency field)

### `tickets.list`

- Customer filter uses `relates_to: { type, id }` (NOT `customer_id`)
- Status filter uses `exclude.status_ids` array (no direct status filter)

### `projects.close`

- Requires `closing_strategy`: `"mark_tasks_and_materials_as_done"` or `"none"`

### `projects.delete`

- Requires `delete_strategy`: `"unlink_tasks_and_time_trackings"` or `"delete_tasks_and_time_trackings"`

### `projects.assign` / `projects.addCustomer`

- `assign` uses `assignee: { type, id }` object
- `addCustomer` / `removeCustomer` use `customer: { type, id }` object

### `projectGroups.update`

- Uses `start_date` / `end_date` (NOT `starts_on` / `due_on`)

### `files.upload`

- Two-step process: call `files.upload` to get a pre-signed URL, then POST binary directly to that URL (no auth needed for step 2)

### General

- All API calls use **POST** with JSON body
- Base URL: `https://api.focus.teamleader.eu`
- Pagination uses `page.number` and `page.size`

---

## File Structure

```
src/
  api/
    auth.ts           — OAuth2 token management (auto-rotate, persist to ~/.teamleader-tokens.json)
    client.ts         — HTTP client (all POST requests)
    cache.ts          — Cache types, TTL constants, CRUD functions, task tree operations
  tools/
    resolve.ts        — Smart tools: find_task, log_time, load_tasks, task_action, cache_stats, clear_cache
    contacts.ts       — Contact CRUD + tag/link
    companies.ts      — Company CRUD + tag
    deals.ts          — Deal CRUD + pipelines/phases/sources
    tasks.ts          — Standalone tasks
    events.ts         — Events
    meetings.ts       — Meetings + reports
    invoices.ts       — Invoices + payment + credit
    timetracking.ts   — Time tracking + timers + timesheet
    projects.ts       — Projects v2 + groups + lines + project tasks
    tickets.ts        — Tickets + messages
    subscriptions.ts  — Subscriptions
    quotations.ts     — Quotations
    creditnotes.ts    — Credit notes
    materials.ts      — Materials
    calls.ts          — CRM calls
    orders.ts         — Orders
    files.ts          — Files
    notes.ts          — Notes
    users.ts          — Users
    departments.ts    — Departments
    lookups.ts        — All reference data lists
    login.ts          — OAuth login flow
  index.ts            — MCP server entry point, tool registration
docs/
  api/                — Full Teamleader Focus API docs (360 pages, scraped 2026-03-05)
  BusinessLogica/     — Business logic docs per domain
```

---

## Development

```bash
# Install
npm install

# Build (TypeScript → dist/)
npm run build

# Type check only
npm run typecheck

# Dev mode (watch)
npm run dev

# Test with MCP inspector
npx @modelcontextprotocol/inspector node dist/index.js
```

---

## References

- [Teamleader Focus API](https://developer.focus.teamleader.eu/) — OAuth2 REST API (all POST, JSON body)
- [Model Context Protocol](https://modelcontextprotocol.io/) — MCP specification
- [globodai-group/mcp-teamleader](https://github.com/globodai-group/mcp-teamleader) — Original inspiration
- Local scraped API docs: `docs/api/` (360 pages, updated 2026-03-05)

## API Reference

- Base URL: `https://api.focus.teamleader.eu`
- All endpoints use POST with JSON body
- Authentication: OAuth2 with automatic token refresh

---

## License

[MIT](LICENSE)
