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

## Task capture: Slack thread → task on Laura's or Sankhya's Notion board

Tag Pidgi in a thread (or right under the messages you mean) and say who it is for:

> @Pidgi turn this into a task for Laura by Friday
> @Pidgi maak hier een taak van voor Sankhya
> @Pidgi task for Laura https://peak-nine.slack.com/archives/C.../p... (a pasted message link is read instead)

What happens:
1. Pidgi reads the thread it was tagged in. Tagged at the top level, it reads the last 15 messages
   above and opens the threads under the three most recent ones that have replies.
2. One Claude call distils the task: title, a few lines of context, the deadline, the project and
   the links that matter. The code then checks it against the conversation: a deadline is only kept
   when the words that state it really appear in the thread, links must appear in the thread, and
   the project must be an existing option on the board. Weekdays come from a calendar table in the
   prompt, never from the model's own arithmetic.
3. Each task is posted as a draft card with three pickers (whose board, deadline, project) and three
   buttons: ✅ Add to board, ✏️ Edit text, Discard. Nothing is written to Notion before ✅.
4. ✅ writes one row to that person's board: Title, Text (context), Deadline, Project, Status "To Start",
   Resources (the links plus a link back to the Slack thread) and Owner. The page body says where it
   came from. The card turns into a link to the new row.

Who can click: the person who asked, plus anyone on `SLACK_WRITE_ALLOWLIST` (everyone if that list is empty).

A question about tasks ("what tasks does Laura have this week?") is recognised as a question and goes to
Pidgi's normal planning brain. Pidgi's general Notion tools are blocked from adding rows to these boards,
so every new task passes through a draft card.

The **Owner** column is set to the person who asked (on Laura's board the one filled-in Owner was the
person who requested the work). Set `"ownerMeans": "assignee"` per board in `TASK_BOARDS` to flip that.

### One-time setup

Slack app (api.slack.com/apps → Pidgi):
1. **OAuth & Permissions → Bot Token Scopes**: add `channels:history`, `groups:history` and `mpim:history`
   (to read channel, private channel and group DM threads). `users:read` and `users:read.email` should already
   be there. Then **Reinstall to Workspace**.
2. **Interactivity & Shortcuts**: switch on, Request URL = the same as Event Subscriptions:
   `https://<pidgi-host>/slack/events`. Save.
3. Pidgi must be a member of the channel it reads (Slack offers to invite it when you tag it).

Notion: open each board page (🐝 Laura's Magic Work, 🧭 Sankhya's Work Board) → ••• → Connections → add the
Pidgi integration. Without that, ✅ answers with a "no access" message and the draft stays.

Render: nothing new is required. Optional: `TASK_MODEL`, `TASK_BOARDS`, `TASK_NOTION_PEOPLE` (see `.env.example`).

Code: `slackbot/taskboards.ts` (config + pure helpers, unit-tested in `test/pidgi-taskboards.test.ts`) and
`slackbot/tasks.ts` (Slack, Notion and Claude calls; flow test in `test/pidgi-tasks-flow.test.ts`).
Typecheck with `npm run slackbot:check`.
