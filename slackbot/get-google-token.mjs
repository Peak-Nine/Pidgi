#!/usr/bin/env node
/**
 * One-time helper to mint a Google OAuth refresh token for Pidgi's calendar.
 *
 * Run it locally (NOT on Render). It opens a Google consent screen; sign in as the
 * user Pidgi should act as (e.g. niels@peaknine.studio) and approve calendar access.
 * It prints a refresh token — set that as GOOGLE_OAUTH_REFRESH_TOKEN on Render,
 * alongside GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET.
 *
 * Usage:
 *   GOOGLE_OAUTH_CLIENT_ID=xxx GOOGLE_OAUTH_CLIENT_SECRET=yyy node slackbot/get-google-token.mjs
 *   (or pass them as the first two arguments)
 *
 * The OAuth client must be a "Desktop app" client (it allows the localhost redirect).
 */
import { google } from "googleapis";
import http from "http";
import { exec } from "child_process";

const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID || process.argv[2];
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET || process.argv[3];
const PORT = 5555;
const REDIRECT = `http://localhost:${PORT}`;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Missing client id/secret.\nUsage: GOOGLE_OAUTH_CLIENT_ID=... GOOGLE_OAUTH_CLIENT_SECRET=... node slackbot/get-google-token.mjs");
  process.exit(1);
}

const oauth2 = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT);
const url = oauth2.generateAuthUrl({
  access_type: "offline",
  prompt: "consent", // forces a refresh_token to be returned
  scope: ["https://www.googleapis.com/auth/calendar"],
});

console.log("\nOpen this URL, sign in as the user Pidgi should act as, and approve:\n\n" + url + "\n");

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, REDIRECT);
  const code = u.searchParams.get("code");
  if (!code) {
    res.writeHead(400);
    res.end("No code in callback.");
    return;
  }
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Done — you can close this tab and return to the terminal.");
  server.close();
  try {
    const { tokens } = await oauth2.getToken(code);
    if (tokens.refresh_token) {
      console.log("\n=== GOOGLE_OAUTH_REFRESH_TOKEN ===\n" + tokens.refresh_token + "\n");
      console.log("Set that on Render as GOOGLE_OAUTH_REFRESH_TOKEN (with GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET).");
    } else {
      console.log("\nNo refresh_token returned. Revoke prior access at https://myaccount.google.com/permissions and run again.");
    }
  } catch (e) {
    console.error("Token exchange failed:", e?.message || e);
  }
  process.exit(0);
});

server.listen(PORT, () => {
  try { exec(`open "${url}"`); } catch { /* user can open the URL manually */ }
});
