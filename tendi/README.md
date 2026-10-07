# Tendi: Peak Nine's proposal assistant for Slack

Tendi is Pidgi's sister bot. Same repo, same plumbing (Slack Events API, Anthropic tool loop, the Teamleader MCP server in `dist/`), different job: it helps Niels and Jonas turn a briefing, a tender or meeting notes into a Peak Nine proposal, inside one Slack thread per proposal.

It carries three playbooks, ported from the Peak Nine Claude skills:

- `proof-of-change-proposal` → `tendi/playbooks/02-proof-of-change.md` (Canva deck `DAHRT8eVhhA`)
- `new-proposal` → `tendi/playbooks/03-new-proposal.md` (Canva deck `DAHKhE6U2vk`, Word pre-read, Teamleader deal and quotation)
- `rfp-from-philea-template` → `tendi/playbooks/04-rfp-philea.md` (Philea doc `DAHWFiZkv6w`, master Word file, portal splits)

plus the voice rules (`00-voice.md`), the routing rules (`01-routing.md`), the credentials it may cite (`05-credentials.md`), the Teamleader constants (`06-teamleader.md`) and the Canva working rules (`07-canva.md`). Edit those Markdown files to change how Tendi works; no code change needed. Drop the full brand voice guidelines in as `08-voice-guidelines.md` and it is loaded on the next restart.

## What a proposal thread looks like

1. DM Tendi, or @mention it in a channel, with the briefing: pasted text and/or a PDF or Word file attached in Slack.
2. Tendi reads everything, names the playbook it will follow (and asks if it is unsure between Proof of Change and the modular proposal), pulls the hard facts out and saves them to the thread's workspace.
3. It asks only the open questions from that playbook's fixed question set, numbered, in one message. You answer in the thread.
4. It researches the client (Anthropic web search), drafts every section or slide in Peak Nine voice and posts the full draft in the thread. Unknowns are `[TO CONFIRM: ...]`. You mark it up; it iterates.
5. On your go it builds the Word file (posted in the thread), creates the Teamleader deal and quotation, and copies and fills the Canva template. Nothing is created without an explicit yes, and Teamleader/Canva writes are limited to the Slack IDs in `TENDI_WRITE_ALLOWLIST`.

In a channel, every reply in that thread continues the same proposal, without a new @mention; a new @mention outside the thread starts a new proposal. In a DM, Tendi keeps one running proposal (like Pidgi keeps one conversation); say "new proposal for X" and it resets its workspace for the next one.

## Where things live

```
tendi/
  index.ts          Slack wiring, tool loop, HTTP routes
  prompt.ts         persona + loads playbooks/*.md into the system prompt
  playbooks/        the knowledge: voice, routing, the three proposal playbooks, credentials, Teamleader, Canva
  state.ts          per-thread workspace + history + attachments, persisted as JSON
  files.ts          Slack attachment download and text extraction (PDF, Word, text)
  docx.ts           Word builder in the Peak Nine document design
  teamleader.ts     child-process bridge to this repo's Teamleader MCP server (curated tool subset)
  canva.ts          MCP client for Canva's hosted MCP server, with OAuth (dynamic registration + PKCE)
  usage.ts          per-call token log and cost summary (/usage)
  text.ts           pure helpers (Slack text cleaning, chunking, dates)
  slack-manifest.json  app manifest for the Tendi Slack app
  .env.example      every environment variable, explained
test/tendi-*.test.ts   unit tests (npm test)
```

## 1. Create the Tendi Slack app

1. https://api.slack.com/apps → **Create New App → From a manifest** → pick the Peak Nine workspace → paste `tendi/slack-manifest.json` (replace the request URL host later).
2. **Install to Workspace**. Copy the **Bot User OAuth Token** (`xoxb-...`) → `SLACK_BOT_TOKEN`.
3. **Basic Information → App Credentials → Signing Secret** → `SLACK_SIGNING_SECRET`.
4. Scopes the manifest asks for and why: `app_mentions:read`, `chat:write`, `im:*` (talk to Tendi), `channels:history` and `groups:history` (follow-ups in a thread without re-mentioning), `files:read` (read PDFs and Word files dropped in Slack), `files:write` (post the Word file), `users:read` and `users:read.email` (know who is asking).

Do not reuse Pidgi's tokens. Two apps, two token sets.

## 2. Deploy a second Render web service from the same repo

In Render: **New → Web Service** → connect `peak-nine/pidgi` (the same repo Pidgi runs from).

- Build command: `npm install && npm run build` (the build produces `dist/index.js`, the Teamleader MCP server Tendi reuses)
- Start command: `npm run tendi`
- Instance: always-on, not a free tier that sleeps (a sleeping service drops Slack's webhook)
- Environment: every variable from `tendi/.env.example` that applies. Minimum: `SLACK_BOT_TOKEN`, `SLACK_SIGNING_SECRET`, `ANTHROPIC_API_KEY`. Add the three `TEAMLEADER_*` values (same ones Pidgi uses) for the deal and quotation step, `PUBLIC_BASE_URL` (this service's URL) and `TENDI_ADMIN_KEY` for Canva and the admin endpoints, and `TENDI_WRITE_ALLOWLIST=U09GX9K063T,U09GX95SV7B` (Niels and Jonas).
- Persistent disk (recommended): add a disk mounted at `/var/data`. Thread workspaces, attachments and the Canva login live there and survive redeploys. Without it, everything resets on each deploy and Canva has to be reconnected. Render charges for disks; check their current price.

Then point the Slack app at it: **Event Subscriptions → Request URL** `https://<your-tendi-host>/slack/events` (Slack must show Verified), bot events `app_mention`, `message.im`, `message.channels`, `message.groups`. Reinstall if prompted. Invite Tendi to the channels where proposals are discussed, or just DM it.

Health check: `GET https://<host>/healthz` returns the model, whether Teamleader is connected, Canva status and whether storage is persistent.

## 3. Connect Canva (optional, once)

Tendi talks to Canva through Canva's own hosted MCP server (`https://mcp.canva.com/mcp`), the same server Claude.ai uses. That server advertises OAuth 2.1 with dynamic client registration and PKCE, which is what `tendi/canva.ts` implements through the MCP SDK.

1. Make sure `PUBLIC_BASE_URL` and `TENDI_ADMIN_KEY` are set and the service is deployed.
2. Open `https://<your-tendi-host>/canva/connect?key=<TENDI_ADMIN_KEY>` in a browser while logged in to the Peak Nine Canva account. Canva asks you to approve Tendi; you land back on `/canva/callback` with "Canva connected".
3. `GET /canva/status?key=...` lists the Canva tools Tendi now sees. In Slack, Tendi's `canva_status` tool reports the same.

What to expect, honestly:

- Verified on 2026-10-07 from a sandbox against the live server: the OAuth metadata and scopes at `mcp.canva.com/.well-known/...`, dynamic client registration (Canva issued a client id to an unlisted client) and the PKCE authorization URL.
- Not yet verified: the login itself, the token exchange and the tool listing, which need a real Canva login. Canva's help centre describes the connector as built for "supported AI assistants" (ChatGPT, Claude, Gemini, Copilot). If the login fails, Tendi logs the error, keeps working without Canva, and hands Niels a manual Canva checklist instead.
- Whiteboards (the Philea methodology poster) are not editable through the API. Tendi gives you the ordered find-and-replace map; the replacing stays manual, as in the skill.
- Per-user login: the tokens belong to whoever logged in. Use the account that owns the templates.
- Tool names come from Canva at runtime (prefixed `canva_`), so a change on Canva's side does not need a code change here.

If the service has no persistent disk, `GET /canva/export?key=...` (only when `TENDI_ALLOW_TOKEN_EXPORT=1`) returns the stored OAuth JSON so you can paste it into `CANVA_OAUTH_JSON` and survive a redeploy. Treat that JSON as a password.

## 4. Teamleader

Same OAuth integration Pidgi uses (`TEAMLEADER_CLIENT_ID`, `TEAMLEADER_CLIENT_SECRET`, `TEAMLEADER_REFRESH_TOKEN`). Tendi exposes only the tools a proposal needs: company lookup and creation, deal creation and lookup, quotation creation and lookup, and the id lookups (phases, pipelines, users, tax rates). The constants (pipeline, "Offerte verzonden" phase, Niels as responsible user, €122 hourly rate, 21% VAT id) sit in `tendi/playbooks/06-teamleader.md`, copied from the `new-proposal` skill. Tendi shows the exact sections, lines, hours and totals in the thread and waits for a yes before creating anything.

## 5. Costs and model

`TENDI_MODEL` defaults to `claude-opus-4-8` (Niels's choice for long-form writing quality). `claude-sonnet-4-6` is roughly a third of the token price per the static table in `tendi/usage.ts`; that table was copied from Pidgi on 2026-10-07 and is not fetched live, so verify it against Anthropic's pricing page. `GET /usage?key=...` shows calls, estimated cost and cache savings per day and per model. Web searches are billed separately by Anthropic and are counted there, not priced.

The system prompt (persona + playbooks, roughly 15k tokens) is marked for prompt caching, so repeated turns in a thread cost a fraction of the first.

## 6. Run locally

```bash
cp tendi/.env.example tendi/.env   # fill it in
npm install && npm run build       # builds the Teamleader MCP server Tendi reuses
npm run tendi                      # starts on PORT (default 3000)
# in another terminal: ngrok http 3000  -> use the https URL + /slack/events as the Request URL
```

Checks: `npm run tendi:check` (typecheck) and `npm test` (unit tests, including a .docx round trip and a house-style guard that fails if a playbook contains an em dash).

## Known limits

- Images, spreadsheets, PowerPoint and old `.doc` attachments are not read. Tendi says so and asks for a PDF, Word or text version.
- Scanned PDFs without a text layer come back nearly empty; there is no OCR here.
- Slack messages are capped at about 3,000 characters, so a long draft arrives as several messages in the thread. The Word file is the clean version.
- Thread memory is bounded (last 40 messages, about 180k characters). The workspace (facts, decisions, open items, links) is what carries a proposal across days, so Tendi is told to keep it current.
- Budgets and rates are confidential to Niels and Jonas. Tendi is instructed to keep them out of shared channel messages, but a DM thread with Niels is the safer place for the financial part.
