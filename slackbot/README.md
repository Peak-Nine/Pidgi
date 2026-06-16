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
