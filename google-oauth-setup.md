# Pidgi Google Calendar — OAuth-as-you setup

This makes Pidgi act as you (niels@peaknine.studio) for calendar, so it can create events AND send invitations to attendees, without any Workspace admin / domain-wide delegation. No more "forward the invite manually".

You'll create an OAuth client, mint a refresh token once, and set three env vars on Render.

---

## 1. Create an OAuth client (Google Cloud Console)

Same Google Cloud project where the Pidgi service account lives.

1. APIs & Services → make sure **Google Calendar API** is enabled (it already is, since the service account used it).
2. APIs & Services → **OAuth consent screen**:
   - User type: **Internal** (only peaknine.studio users — no Google verification needed).
   - App name: e.g. "Pidgi", support email: yours. Save.
3. APIs & Services → **Credentials** → Create credentials → **OAuth client ID**:
   - Application type: **Desktop app** (this allows the localhost redirect the helper uses).
   - Name: "Pidgi calendar OAuth". Create.
   - Copy the **Client ID** and **Client secret**.

---

## 2. Mint a refresh token (run once, locally — not on Render)

From the repo root, with dependencies installed (`npm install` once if needed):

```
GOOGLE_OAUTH_CLIENT_ID=your-client-id GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret node slackbot/get-google-token.mjs
```

It opens a Google consent screen. **Sign in as niels@peaknine.studio** and approve calendar access. The terminal then prints a `GOOGLE_OAUTH_REFRESH_TOKEN`. Copy it.

(If it says "no refresh_token returned", revoke prior access at https://myaccount.google.com/permissions and run it again.)

---

## 3. Set the env vars on Render

Render → the Pidgi service → Environment → add:

- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `GOOGLE_OAUTH_REFRESH_TOKEN`

Save (Render redeploys). You can leave `GOOGLE_SERVICE_ACCOUNT_JSON` in place — the code uses OAuth whenever these three are set, and falls back to the service account otherwise. Don't paste these values to me; set them directly in Render and blur them in any screenshot.

---

## 4. Push the code and test

Push the current batch (it includes the OAuth calendar change and the new Slack invite/bookmark tools). Once deployed with the env vars set, ask Pidgi to book a meeting with attendees — the invitations should actually arrive in their inboxes now.

---

## Honest notes

- Pidgi acts as you for calendar, so events it creates show you as the organiser. That's expected.
- Reading colleagues' availability works as far as your account can see their calendars (Workspace usually exposes at least free/busy). Where it can't see details, it flags rather than guesses.
- The refresh token is long-lived but can be revoked; if calendar stops working later, re-run step 2 and update the env var.
