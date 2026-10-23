# Peak Nine — Teamleader Slack bot (Events API / webhook)

Chat with the Teamleader planning connector from Slack. The bot reuses this repo's
MCP server (`dist/index.js`) as its tool source, so every connector tool, including the
planning tools (capacity, reservations, plannable items), is available to it.

Connection: Slack Events API. The bot runs as an HTTP web service; Slack sends events to
`POST /slack/events`, verified with your Signing Secret. Runs on any always-on web host, so
it does not depend on your Mac.

Brain: Claude on the Anthropic API, running a tool-use loop over the Teamleader tools.

## 1. Slack app credentials

1. https://api.slack.com/apps → open your app.
2. **OAuth & Permissions** → **Bot Token Scopes** add: `app_mentions:read`, `chat:write`,
   `im:history`, `im:read`, `im:write`. Then **Install to Workspace** and copy the
   **Bot User OAuth Token** (`xoxb-...`) → `SLACK_BOT_TOKEN`.
3. **Basic Information → App Credentials → Signing Secret**. Regenerate it (it was exposed in
   a screenshot), then copy the fresh value → `SLACK_SIGNING_SECRET`.
   (You do NOT need the App-Level Token, Client ID/Secret, or Verification Token for this.)

## 2. Anthropic key

https://console.anthropic.com → API Keys → Create Key → `ANTHROPIC_API_KEY`.
Requires billing/credits on the account; bills per use, separate from Cowork.

## 3. Dependencies (already handled)

The bot's dependencies (`@anthropic-ai/sdk`, `@slack/bolt`, `dotenv`) are already pinned in
`package.json`, so the host installs them automatically during the build. No local npm step needed.

## 4. Deploy to an always-on web host

Use a persistent web service (Render, Railway, Fly.io, or your own VPS). Do NOT use
serverless functions: the bot keeps a child process running and does multi-step tool loops,
which don't fit a function timeout.

Example with Render:
1. Push this repo to GitHub, then in Render: **New → Web Service** → connect the repo.
2. **Build command:** `npm install && npm run build`
3. **Start command:** `npm run slackbot`
4. **Environment:** add every variable from `.env.example` (bot token, signing secret,
   Anthropic key, the three Teamleader values, and `SLACK_WRITE_ALLOWLIST`). Do not commit `.env`.
5. Pick an **always-on instance**, not a free tier that sleeps. A sleeping service drops
   Slack's webhook, so the bot would miss messages.
6. Deploy. Render gives you an HTTPS URL like `https://peaknine-bot.onrender.com`.

## 5. Point Slack at the host

1. **Event Subscriptions** → toggle on → **Request URL:** `https://<your-host>/slack/events`.
   Wait for Slack to show **Verified** (Bolt answers the verification automatically).
2. Under **Subscribe to bot events** add `app_mention` and `message.im`. Save.
3. If prompted, reinstall the app.
4. In Slack, invite the bot to a channel (`/invite @your-bot`) or DM it.

Try it:
- "How much free capacity does Jonas have over the next two weeks?"
- "What's the Enabel field mission planned vs its budget?"
- "Plan 2 days for Jonas on the Ethias project next week." (write — allowlisted users only)

## Run locally for testing (optional)

Webhook mode needs a public URL even locally, so use a tunnel (e.g. ngrok):
```bash
cp slackbot/.env.example slackbot/.env   # fill it in
npm run build && npm run slackbot         # starts on PORT (default 3000)
# in another terminal: ngrok http 3000  -> use the https URL + /slack/events as the Request URL
```

## Notes & limits
- Capacity reflects Teamleader planning only and excludes Google Calendar load, so "free"
  can overstate real availability.
- Cost in revenue-vs-cost needs hourly rates you provide; Teamleader has no internal cost
  rate, so the bot won't invent one.
- Write actions are gated by `SLACK_WRITE_ALLOWLIST`. Strongly recommended to set it.
- Don't paste tokens/secrets into chats or screenshots. Store them only as host env vars.

## Task capture: Slack thread → item on a Notion board

Tag Pidgi in a thread (or right under the messages you mean) and say where it should go:

> @Pidgi turn this into a task for Laura by Friday
> @Pidgi maak hier een taak van voor Sankhya
> @Pidgi zet dit op de touchdown
> @Pidgi talking point for the team sync
> @Pidgi task for Laura https://peak-nine.slack.com/archives/C.../p... (a pasted message link is read instead)

The boards (all in `slackbot/taskboards.ts`):

| Key | Board in Notion | What goes there | Who can use it |
| --- | --- | --- | --- |
| `laura` | 🐝 Laura's Magic Work → Backlog | Laura's tasks | everyone |
| `sankhya` | 🧭 Sankhya's Work Board → Backlog | Sankhya's tasks | everyone |
| `touchdown` | 🏈 Touchdown → ✨ Agenda | topics for the Niels and Jonas one-on-one | Niels and Jonas only |
| `team` | 🚂 Peak Nine Syncs (Internal) → ✏️ Talking Points | topics for the team meeting | everyone |

What happens:
1. Pidgi reads the thread it was tagged in. Tagged at the top level, it reads the last 15 messages
   above and opens the threads under the three most recent ones that have replies.
2. One Claude call distils the item: board, title, a few lines of context, deadline, project, links,
   and on meeting boards who picks it up. The code then checks it against the conversation: a deadline
   is only kept when the words that state it really appear in the thread, links must appear in the
   thread, the project must be an option on that board, the person must be on the team, and the board
   must be one the requester may use. Weekdays come from a calendar table in the prompt, never from the
   model's own arithmetic.
3. Each item is posted as a draft card with pickers (board, deadline, project, and on meeting boards
   who picks it up) and three buttons: ✅ Add to board, ✏️ Edit text, Discard. Nothing is written to
   Notion before ✅.
4. ✅ writes one row with that board's own columns. Context and links go in a column when the board has
   one, otherwise in the page body. The page body always says where it came from, with a link back to
   the Slack thread. The card turns into a link to the new row.

Who fills which person column:
- Laura's and Sankhya's boards: **Owner** = the person who asked (on Laura's board the one filled-in
  Owner was the person who requested the work).
- Touchdown agenda: **Assignee** = whoever the conversation names as picking it up (editable on the card).
- Team sync talking points: **Creator** = the person who asked, **Assignee** = whoever picks it up.

Who can click: the person who asked, plus anyone on `SLACK_WRITE_ALLOWLIST` (everyone if that list is empty).

**Private boards.** The Touchdown agenda (and the rest of the Touchdown page) can only be read by Niels
and Jonas, but anyone on the team may put a topic on it ("put this on the touchdown"). They get the
normal draft card and ✅ Add to board, just no link to the agenda, and a question about it ("what's on
the touchdown?") gets the neutral line below.
👾 Mothership (Niels's Pending Tasks) and the ♟️ Must Win Battle Board are Niels only. Say "put this on my
mothership" to add a task there; it lands in Pending Tasks with Tags = Tasks.

For anyone outside a board's circle, all of this is enforced in code, not left to the model:
- Naming the board ("touchdown", "mothership", "must win battle", "mwb") gets one line,
  "I'm afraid my settings can't help you with that, please discuss with Niels.", before the model or
  the thread is touched. Any answer that still names such a board is replaced by that same line.
- The board isn't offered to the model, isn't in the picker, and ✅ Add to board refuses it
  (Touchdown excepted, since anyone may add to it).
- Pidgi's general Notion tools hide the board and everything under it, at any depth: search leaves it
  out, child pages and databases are left out of page content, and opening, querying or editing is
  refused with the same line. When Notion can't say where a page lives (network error, rate limit),
  Pidgi treats it as private.
- A turn that touched a private board is not kept in a channel's memory (that memory is shared by
  everyone who talks to Pidgi in the channel). In a DM it is.
- Outside a DM, private boards are left out of the board picker and the "I can add things to…" line,
  unless the card is for that board.

What the code can't cover: a draft card or answer posted in a channel is visible to everyone in that
channel, so use a DM with Pidgi for anything sensitive. And people who can open these pages in Notion
itself can still see them there; Pidgi only controls what goes through Pidgi.

A question about tasks ("what tasks does Laura have this week?", "what's on the Touchdown agenda?") is
recognised as a question and goes to Pidgi's normal brain. Pidgi's general Notion tools are blocked from
adding rows to any of these boards, so every new item passes through a draft card.

**GTD (Niels only, DM only).** Niels's Notion AI meeting notes land in 🎙️ Recordings. In a DM with Pidgi:
- `GTD` takes the newest recording that has content and no GTD yet,
- `GTD GIZ` takes the newest recording whose title or meeting title has those words,
- `GTD <notion link>` takes that recording (only if it is in Recordings).
Pidgi reads the summary (the transcript only when there is no summary), proposes at most 5 key follow-ups
for Mothership (Niels), Touchdown (Jonas, or Niels and Jonas together), Sankhya's and Laura's boards, posts them as
draft cards in the DM, and ticks the recording's GTD checkbox (it adds that column if it is missing).
Recordings is on Niels's private list, so nobody else can read it through Pidgi. In a channel, GTD
answers that it only works in a DM.

### One-time setup

Slack app (api.slack.com/apps → Pidgi):
1. **OAuth & Permissions → Bot Token Scopes**: add `channels:history`, `groups:history` and `mpim:history`
   (to read channel, private channel and group DM threads). `users:read` and `users:read.email` should already
   be there. Then **Reinstall to Workspace**.
2. **Interactivity & Shortcuts**: switch on, Request URL = the same as Event Subscriptions:
   `https://<pidgi-host>/slack/events`. Save.
3. Pidgi must be a member of the channel it reads (Slack offers to invite it when you tag it).

Notion: add the Pidgi integration (••• → Connections) to 🐝 Laura's Magic Work, 🧭 Sankhya's Work Board,
the ✏️ Talking Points database on Peak Nine Syncs (Internal), the ✨ Agenda database on Touchdown, and
👾 Mothership. Mothership has several data sources, so Pidgi writes to its Pending Tasks data source with
the newer Notion API version (2025-09-03); everything else still uses 2022-06-28.
If `TASK_BOARDS` is set on Render, it replaces the built-in boards, Mothership included.
Without that, ✅ answers with a "no access" message and the draft stays.

Render: nothing new is required. Optional: `TASK_MODEL`, `TASK_BOARDS`, `TASK_TEAM` (see `.env.example`).

Code: `slackbot/taskboards.ts` (boards, team and pure helpers, unit-tested in `test/pidgi-taskboards.test.ts`),
`slackbot/tasks.ts` (Slack, Notion and Claude calls; flow tests in `test/pidgi-tasks-flow.test.ts`) and the
private-board guard in `slackbot/notion.ts` (`test/pidgi-notion-guard.test.ts`). Typecheck with
`npm run slackbot:check`.
