#!/usr/bin/env node
/**
 * One-time helper: mint a Teamleader refresh token for the Slack bot.
 *
 * It prints the refresh token to the terminal and does NOT write
 * ~/.teamleader-tokens.json, so your existing Claude connector is left
 * completely untouched.
 *
 * Run it on your Mac from the repo root:
 *   node slackbot/get-refresh-token.mjs
 *
 * It will ask for the bot integration's Client ID and Client Secret,
 * open an authorize URL for you to approve in the browser, then print
 * the refresh token to paste into Render.
 *
 * The integration you register MUST have this exact Redirect URI:
 *   http://localhost:19836/callback
 */
import { createServer } from "node:http";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const PORT = 19836;
const REDIRECT_URI = `http://localhost:${PORT}/callback`;
const AUTH_URL = "https://focus.teamleader.eu/oauth2/authorize";
const TOKEN_URL = "https://focus.teamleader.eu/oauth2/access_token";

const rl = readline.createInterface({ input, output });
const clientId = (await rl.question("Bot integration Client ID: ")).trim();
const clientSecret = (await rl.question("Bot integration Client Secret: ")).trim();
rl.close();

if (!clientId || !clientSecret) {
  console.error("\nClient ID and Client Secret are both required. Aborting.");
  process.exit(1);
}

const authUrl =
  `${AUTH_URL}?client_id=${encodeURIComponent(clientId)}` +
  `&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

console.log("\n1) Open this URL in your browser, sign in, and click Authorize:\n");
console.log("   " + authUrl + "\n");
console.log("2) After you approve, the browser comes back here automatically. Waiting (up to 3 min)...\n");

const code = await new Promise((resolve, reject) => {
  const server = createServer((req, res) => {
    const url = new URL(req.url || "/", REDIRECT_URI);
    const c = url.searchParams.get("code");
    const err = url.searchParams.get("error");
    if (err) {
      res.writeHead(400, { "Content-Type": "text/html" });
      res.end(`<h1>Login failed: ${err}</h1><p>You can close this tab.</p>`);
      server.close();
      reject(new Error(err));
      return;
    }
    if (c) {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end("<h1>Done.</h1><p>You can close this tab and return to the terminal.</p>");
      server.close();
      resolve(c);
      return;
    }
    res.writeHead(400);
    res.end("Missing code parameter");
  });
  server.listen(PORT);
  server.on("error", reject);
  setTimeout(() => {
    server.close();
    reject(new Error("Timed out after 3 minutes with no callback."));
  }, 180000);
});

const body = new URLSearchParams({
  client_id: clientId,
  client_secret: clientSecret,
  code,
  grant_type: "authorization_code",
  redirect_uri: REDIRECT_URI,
});

const resp = await fetch(TOKEN_URL, {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: body.toString(),
});

if (!resp.ok) {
  console.error("\nToken exchange failed:", resp.status, await resp.text());
  process.exit(1);
}

const tokens = await resp.json();
console.log("\n=================================================================");
console.log("SUCCESS — your bot's TEAMLEADER_REFRESH_TOKEN is:\n");
console.log("   " + tokens.refresh_token);
console.log("\nPaste it into Render as TEAMLEADER_REFRESH_TOKEN, together with the");
console.log("Client ID and Client Secret you just entered.");
console.log("Your Claude connector's token file was NOT changed.");
console.log("=================================================================\n");
process.exit(0);
