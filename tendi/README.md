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
  scout/            Tendi Scout, the daily tender watcher (see section 7)
    sources/        one reader per source: TED, UNDP, ReliefWeb, Enabel
    http.ts         the polite HTTP layer every request goes through
    filter.ts       the cheap keyword filter that runs before any model call
    fit-rubric.md   what a good tender looks like for Peak Nine (edit freely)
    scorer.ts       fit scoring with Claude, structured output
    run.ts          one run: fetch, dedupe, filter, score, remember
    digest.ts       the Slack digest
    service.ts      schedule, admin routes, reactions, the "Start a proposal" button
    store.ts        what Scout remembers, on the same disk as the threads
    cli.ts          npm run tendi:scout
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

Tendi talks to Canva through Canva's own hosted MCP server (`https://mcp.canva.com/mcp`), the same server Claude.ai uses. Canva's login only redirects back to known apps or to `localhost`; a redirect to a Render host is refused with "Invalid redirect URI" (verified 2026-10-07). So the login happens once on a laptop, and the result is handed to the hosted service, the same pattern pidgi uses for its Google and Teamleader tokens.

1. On a computer with the repo: `npm install && npm run tendi:canva-login`. A browser window opens on Canva (log in to the Peak Nine account that owns the templates) and asks you to approve "Tendi (Peak Nine proposal assistant)". The script receives the redirect on `http://localhost:8765/canva/callback`, exchanges the code, lists Canva's tools as a check, and prints a one-line `CANVA_OAUTH_JSON` value.
   If the browser ends on a "can't connect to localhost" page (the script runs on another machine), copy the full URL from the address bar and run `npm run tendi:canva-login -- finish "<that URL>"`.
2. In Render → Tendi → Environment, add `CANVA_OAUTH_JSON` with that value and save. Render redeploys; `GET /healthz` then shows `canva.connected: true`, and `GET /canva/status?key=...` lists the Canva tools Tendi sees. In Slack, Tendi's `canva_status` tool reports the same.
3. From then on the hosted instance only refreshes tokens, which needs no redirect. The refreshed tokens live on the persistent disk (`/var/data/tendi-canva-oauth.json`); the env value is only read when the disk holds no login. If Canva ever revokes the login, run the script again and replace the env value.

What to expect, honestly:

- Verified on 2026-10-07 from a sandbox against the live server: OAuth metadata and scopes, dynamic client registration (Canva issues a client id to an unlisted client), the redirect policy above, and the authorization URL with a localhost redirect leading to Canva's real consent screen.
- The token exchange and the tool listing are verified by the script itself when it completes (it lists the tools before printing the value).
- Whiteboards (the Philea methodology poster) are not editable through the API. Tendi gives you the ordered find-and-replace map; the replacing stays manual, as in the skill.
- Per-user login: the tokens belong to whoever logged in. Use the account that owns the templates.
- Tool names come from Canva at runtime (prefixed `canva_`), so a change on Canva's side does not need a code change here.

`tendi/.canva-oauth.json` (the script's output) is git-ignored. Treat it and the env value as passwords: they carry a Canva refresh token. `GET /canva/export?key=...` (only when `TENDI_ALLOW_TOKEN_EXPORT=1`) returns the hosted instance's current JSON if you ever need to move it.

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

## 7. Tendi Scout: the daily tender watcher

Scout runs inside this same service. Every Monday and Thursday morning it reads new tenders from four places, drops the obvious misfits with a keyword filter, asks Claude to score the rest against `tendi/scout/fit-rubric.md`, and posts a digest in your tenders channel: one header message, then one message per tender worth a look, best first, in the header's thread. Strong fits are also shown in the channel itself.

Each item shows the buyer, country, deadline, source, a fit score out of 100, two lines on why, and any red flags taken from the notice (deadline under 10 days, consortium required, language). Two things you can do on an item:

- React 👍 or 👎. Scout keeps the last reactions and shows them to the scorer as examples, so it learns what you want to see more and less of.
- Press **Start a proposal**. Tendi opens a new thread in the channel, reads the notice and starts the normal proposal flow from there. You can also @mention Tendi in a digest thread and name the tender.

### Sources and how Scout stays off their blocklists

| Source | How Scout reads it | Status |
| --- | --- | --- |
| TED (EU tenders) | Official search API, anonymous, consultancy, research, evaluation and training CPV codes | works, verified 7 Oct 2026 |
| UNDP procurement notices | Public RSS feed (all regions) | works, verified 7 Oct 2026 |
| Enabel public procurement | The public "open tenders" list (first 3 pages), then for each shortlisted tender the pages of the tender PDF that decide a bid: cover, award criteria, terms of reference, selection file | works, verified 8 Oct 2026 |
| ReliefWeb jobs (consultancies) | Official API, needs an approved appname | waiting: request one, see below |

Every request goes through `scout/http.ts`: a User-Agent that names Peak Nine and gives a contact address, at least 1.5 seconds between requests to the same host, a small request budget per host per run, conditional requests so unchanged pages cost nothing, backoff on 429 and 5xx that respects `Retry-After`, and a guard that refuses private addresses. On a normal day that adds up to about a dozen requests across all sources. The model side is capped too: at most 60 tenders scored per run (`SCOUT_MAX_SCORE_PER_RUN`), in batches of 10, with the rubric cached. Tenders past the cap are not marked as seen, so they come back the next day while they are still inside the 3-day window.

**ReliefWeb.** Since 1 November 2025 the ReliefWeb API only answers callers with an approved appname; without one it returns 403 (checked live on 7 Oct 2026). Request one, free, at https://apidoc.reliefweb.int/parameters#appname, then set `RELIEFWEB_APPNAME` on Render. Until then Scout notes "waiting for appname" in every digest and skips the source. It does not try the public website instead.

### Switching it on

1. In the Slack app settings (api.slack.com/apps → Tendi):
   - **OAuth & Permissions**: add the bot scope `reactions:read`, then **Reinstall to Workspace**. Check afterwards that the Bot User OAuth Token is unchanged; if Slack shows a new one, update `SLACK_BOT_TOKEN` on Render.
   - **Event Subscriptions → Subscribe to bot events**: add `reaction_added` and `reaction_removed`. Save.
   - **Interactivity & Shortcuts**: switch on, Request URL `https://<your-tendi-host>/slack/events` (the same URL as events). Save.
   The updated `tendi/slack-manifest.json` has all of this if you prefer to paste the manifest.
2. Create the tenders channel in Slack (any name), invite Tendi (`/invite @Tendi`), and copy the channel ID (channel name → About → bottom of the panel, starts with C).
3. On Render, Tendi service → Environment: set `SCOUT_CHANNEL` to that ID. Optional: `SCOUT_TIME` (default `07:30`, Brussels time), `SCOUT_DAYS` (default `1,4`, Monday and Thursday; each run looks back far enough to cover the gap), `SCOUT_MODEL` (default `claude-sonnet-4-6`). Save; Render redeploys.
4. Try it without waiting for the morning: `https://<your-tendi-host>/scout/run?key=<TENDI_ADMIN_KEY>&dry=1` fetches and filters only (no model, nothing stored, nothing posted). Then `/scout/run?key=...` for a real run with a digest. `/scout/status?key=...` shows the config, the last runs, the feedback counts and the best items of the last 7 days.

Scout keeps its memory (which tenders it has seen, the reactions, the run history) in `tendi-scout/state.json` on the same persistent disk as the threads. That is also why it runs inside the web service and not as a separate Render Cron Job: a Render disk attaches to one service only. If you ever want an outside scheduler, any cron that calls `/scout/run?key=...` works.

### From a laptop

```bash
npm run tendi:scout                          # dry run: fetch + keyword filter, prints what it found
npm run tendi:scout -- --sources enabel      # one source
npm run tendi:scout -- --score               # also score with Claude (needs ANTHROPIC_API_KEY in tendi/.env)
npm run tendi:scout -- --score --post        # and post a digest (needs SLACK_BOT_TOKEN and SCOUT_CHANNEL)
```

A laptop run stores its memory in your temp folder unless `TENDI_DATA_DIR` says otherwise, so it never touches what the Render service has seen.

### Tuning

- What counts as a good fit: `tendi/scout/fit-rubric.md`. Lines marked [assumption] are defaults to confirm, such as the 10-day deadline flag and the missing value range.
- The keyword lists: `POSITIVE` and `NEGATIVE` in `tendi/scout/filter.ts`. The filter is meant to be generous; its only job is to keep furniture, works and vehicles away from the model.
- "National consultant" roles (open only to nationals of the country, mostly UNDP) are dropped by default. Set `SCOUT_KEEP_NATIONAL=1` to keep them.
- TED CPV codes: `SCOUT_TED_CPV` (space separated). UNDP regions: `SCOUT_UNDP_FEEDS` (for example `RAF,RER`).
- Enabel tender PDFs are read by a separate helper process (`tendi/scout/pdf-pages.mjs`), one at a time, about 150 MB each, killed after 60 seconds. It reads the table of contents and then only the decisive pages (on the tenders tested, the first six pages were cover, contents and legal boilerplate; turnover and team requirements sat on pages 31 to 35). Before each PDF Scout checks the instance's free memory and skips the PDF when less than 200 MB is free; `/scout/status` shows the memory it sees. Background: on 8 Oct 2026 reading PDFs inside Tendi itself pushed it past Render's 512 MB and both scheduled runs crashed.
- If a scheduled run crashes the service, Scout retries once that day (two attempts in total), never starts after `SCOUT_LATEST` (default 20:00), and counts the day as done only when a run finished.

### Costs, roughly

I'm estimating here, go verify against the Anthropic console after the first week. A first run scores up to 60 tenders; a normal day 20 to 40. With `claude-sonnet-4-6` at the prices in `tendi/usage.ts` (3 USD per million input tokens, 15 per million output, not checked live) that is in the order of 0.10 to 0.30 USD per day. Scout's calls are logged with `thread: "scout"` in the same usage log, so `/usage?key=...` shows them.

## Known limits

- Images, spreadsheets, PowerPoint and old `.doc` attachments are not read. Tendi says so and asks for a PDF, Word or text version.
- Scanned PDFs without a text layer come back nearly empty; there is no OCR here.
- Slack messages are capped at about 3,000 characters, so a long draft arrives as several messages in the thread. The Word file is the clean version.
- Thread memory is bounded (last 40 messages, about 180k characters). The workspace (facts, decisions, open items, links) is what carries a proposal across days, so Tendi is told to keep it current.
- Scout reads the first pages of Enabel PDFs only for the shortlist, and TED and UNDP notices only through their summaries. A good-looking title with thin text gets a cautious score; open the notice before you decide.
- Most TED notices are in the buyer's own language (TED translates only the country and category). Scout's keyword filter knows English, French, Dutch and a little German, so a Lithuanian or Polish notice usually does not reach the scorer. That matches where Peak Nine bids, but it is a filter, not a judgement.
- Budgets and rates are confidential to Niels and Jonas. Tendi is instructed to keep them out of shared channel messages, but a DM thread with Niels is the safer place for the financial part.
