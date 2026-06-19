# project-planning skill — edits to paste in

These bring the `project-planning` skill in line with the Pidgi changes: link the Agenda page in invites, always invite attendees, no onboarding-page duplication, keep budgets out of shared artifacts, and switch the task tracker to the Agenda database.

**How to apply:** open the `project-planning` skill in Settings → Capabilities, edit its `SKILL.md`, and apply the changes below. (I can't edit your saved skills from a Cowork session, so this has to be done there.)

---

## My recommendation on the decision

**Yes, switch from the block-table "standup board" to the Agenda database.** Reason: you now track tasks in the Agenda database (Takeda-style), and Pidgi creates that same database. If the skill keeps its own "This week / Person / Focus / Hours / Status" block table, you end up with two competing task trackers on one page. Keep the skill's rich narrative (Snapshot, About, What, Why, Goal, Challenges, Stakeholders, Timeline, Links) — that's its strength — and replace only the task-tracking block with the Agenda database. One tracker, everywhere.

---

## Edit 1 — Step 9b: use the Agenda database, not a block table; keep budgets off the page

In **Step 9b — Notion standup board**, replace the "This week" section instruction:

> - A "This week" section with columns: Person | Focus | Hours | Status

with:

> - An **Agenda database** (inline) created with `notion-create-database`, columns exactly: **Task** (title), **Creator** (person), **Assignee** (person), **Priority** (select: High, Medium, Low), **Status** (status type if the connector supports it, otherwise a select: Not started, In progress, Wait P9 feedback, Done), **Deadline** (date). This is the single task tracker for the project — do not also add a block-table standup.

Add this line at the end of Step 9b:

> Do NOT create a separate "Crew onboarding" page — the rich project page already covers onboarding.
> Keep the Agenda database's own page URL: it is what gets linked in the Slack channel bookmarks and the weekly standup invite (link the Agenda page, not the whole project page).

And in the **Project Snapshot / Project Description**, remove any money figure:

> Never put budget, deal value, fixed price, revenue or internal cost on the Notion page. These are confidential to Niels and Jonas. (Remove the "Deal value" row from the snapshot.)

---

## Edit 2 — Step 9a: always invite attendees, link the Agenda, protect lunch

At the top of **Step 9a — Milestone meetings**, add:

> For every meeting created with `create_event`, always populate `attendeeEmails` with every person who should be in it — never create a meeting with an empty attendee list. Never schedule a meeting overlapping the lunch window **11:45–12:30 Europe/Brussels**; pick a slot fully before 11:45 or after 12:30.

In the **recurring weekly standup** block, change:

> - Attendees: all team members on the project

to:

> - Attendees: all team members on the project (pass their emails in `attendeeEmails`)
> - In the event `description`, include the link to the project's **Agenda database page**.

---

## Edit 3 — Step 9c: link the Agenda, keep the no-budget rule

The skill already forbids budget figures in Slack — keep that. In the welcome **draft template**, change the links block:

> *Standup board:* [Notion]([Notion page URL])

to:

> *Project page:* [Notion]([Notion page URL])
> *Team Agenda:* [Agenda]([Agenda database page URL])

So the Agenda page is linked directly, consistent with the channel bookmarks.

---

## Edit 4 — "What this skill produces" wording

Change list item 6:

> 6. A Notion standup board for the project (from the Peak Nine template)

to:

> 6. The project's rich Notion page, with an **Agenda database** as the task tracker (no separate standup block table, no "Crew onboarding" page)

---

## Note on a true Status property

Notion's public API cannot create a real "status" property — it falls back to a "select". If your Cowork Notion connector also falls back to select, the cleanest way to get a real status field is to keep one **template** Agenda database and duplicate it per project, rather than creating it fresh each time. Flag if you want me to set that template up.
