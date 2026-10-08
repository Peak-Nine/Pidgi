/**
 * One-time Canva login for Tendi, done on a laptop (or anywhere with a browser).
 *
 *   npm run tendi:canva-login            interactive: opens the browser, waits for the callback
 *   npm run tendi:canva-login -- start   print the login URL only (no listener)
 *   npm run tendi:canva-login -- finish "<the full http://localhost:... URL the browser landed on>"
 *   npm run tendi:canva-login -- show    print the CANVA_OAUTH_JSON value again
 *
 * Why this exists: Canva's MCP login only redirects back to known apps or to
 * localhost, so the hosted Tendi on Render cannot receive the browser redirect.
 * This script registers a client with a localhost redirect, completes the OAuth
 * flow here, verifies the result by listing Canva's tools, and prints the value
 * to paste into the hosted service's CANVA_OAUTH_JSON environment variable. From
 * then on the hosted instance only refreshes tokens, which needs no redirect.
 *
 * If the browser ends on "can't connect to localhost" (the listener runs on
 * another machine, or the port is blocked), copy the full URL from the address
 * bar and run `finish` with it: the authorization code is in that URL.
 *
 * The result is written to tendi/.canva-oauth.json (git-ignored). Treat it like a
 * password: it carries a refresh token for the Canva account that logged in.
 */
import path from "path";
import http from "http";
import { readFileSync, existsSync } from "fs";
import dotenv from "dotenv";
import { auth } from "@modelcontextprotocol/sdk/client/auth.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { CANVA_MCP_URL, CANVA_SCOPES, FileOAuthProvider } from "./canva.js";

dotenv.config({ path: path.join(__dirname, ".env") });

const PORT = Number(process.env.TENDI_LOGIN_PORT) || 8765;
const REDIRECT = `http://localhost:${PORT}/canva/callback`;
const STORE = process.env.TENDI_CANVA_TOKEN_FILE || path.join(__dirname, ".canva-oauth.json");

function provider(): FileOAuthProvider {
  return new FileOAuthProvider(REDIRECT, STORE);
}

async function start(): Promise<string> {
  const p = provider();
  p.pendingAuthUrl = null;
  const result = await auth(p, { serverUrl: CANVA_MCP_URL, scope: CANVA_SCOPES });
  if (result === "AUTHORIZED") return ""; // a stored refresh token still worked
  if (!p.pendingAuthUrl) throw new Error("Canva did not return an authorization URL.");
  return p.pendingAuthUrl;
}

function codeFrom(input: string): { code: string; state?: string } {
  const s = input.trim();
  try {
    const u = new URL(s);
    const code = u.searchParams.get("code");
    if (code) return { code, state: u.searchParams.get("state") || undefined };
    const err = u.searchParams.get("error");
    if (err) throw new Error(`Canva returned error "${err}": ${u.searchParams.get("error_description") || ""}`);
  } catch (e: any) {
    if (e?.message?.startsWith("Canva returned")) throw e;
  }
  if (/^[A-Za-z0-9._~-]{8,}$/.test(s)) return { code: s };
  throw new Error("Could not find an authorization code in that input. Paste the full URL from the browser's address bar.");
}

async function finish(code: string, state: string | undefined): Promise<void> {
  const p = provider();
  if (state !== undefined && !p.checkState(state)) {
    throw new Error("The state in the URL does not match this login attempt. Run `start` again and use the new URL.");
  }
  const result = await auth(p, { serverUrl: CANVA_MCP_URL, authorizationCode: code, scope: CANVA_SCOPES });
  if (result !== "AUTHORIZED") throw new Error("Canva did not authorize the client.");
}

async function verify(): Promise<string[]> {
  const p = provider();
  const transport = new StreamableHTTPClientTransport(new URL(CANVA_MCP_URL), { authProvider: p });
  const client = new Client({ name: "tendi-login-check", version: "1.0.0" }, { capabilities: {} });
  await client.connect(transport);
  const listed = await client.listTools();
  await client.close();
  return listed.tools.map((t) => t.name);
}

function show(): void {
  if (!existsSync(STORE)) {
    console.log(`No login stored yet at ${STORE}. Run the login first.`);
    return;
  }
  const raw = readFileSync(STORE, "utf8");
  const j = JSON.parse(raw);
  if (!j?.tokens?.access_token) {
    console.log(`The file at ${STORE} has no tokens yet. Finish the login first.`);
    return;
  }
  const b64 = Buffer.from(JSON.stringify(j)).toString("base64");
  console.log("");
  console.log("Paste this as the value of CANVA_OAUTH_JSON on the hosted Tendi service (one line, base64):");
  console.log("");
  console.log(b64);
  console.log("");
  console.log(`(The same data sits in ${STORE}. Keep both private: they carry a Canva refresh token.)`);
}

async function interactive(): Promise<void> {
  const url = await start();
  if (!url) {
    console.log("A stored Canva login still works; nothing to do.");
    const tools = await verify();
    console.log(`Canva tools available: ${tools.length}`);
    show();
    return;
  }
  console.log("");
  console.log("1. Open this URL in the browser that is logged in to the Peak Nine Canva account:");
  console.log("");
  console.log(url);
  console.log("");
  console.log(`2. Approve Tendi. The browser comes back to ${REDIRECT} and this script finishes.`);
  console.log(`   If the browser shows a connection error instead, copy its full address bar URL and run:`);
  console.log(`   npm run tendi:canva-login -- finish "<that URL>"`);
  try {
    const open = (await import("open")).default;
    await open(url);
  } catch {
    /* no browser to open here; the URL is printed above */
  }

  await new Promise<void>((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        const u = new URL(req.url || "/", `http://localhost:${PORT}`);
        if (u.pathname !== "/canva/callback") {
          res.statusCode = 404;
          res.end("Not the callback path.");
          return;
        }
        const { code, state } = codeFrom(u.toString());
        await finish(code, state);
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.end("Canva connected for Tendi. You can close this tab and return to the terminal.");
        server.close();
        resolve();
      } catch (e: any) {
        res.statusCode = 400;
        res.end(`Login failed: ${e?.message || e}`);
        server.close();
        reject(e);
      }
    });
    server.on("error", reject);
    server.listen(PORT, "127.0.0.1", () => console.log(`\nWaiting for Canva to redirect to ${REDIRECT} ...`));
  });

  const tools = await verify();
  console.log(`\nCanva connected. ${tools.length} tools available: ${tools.join(", ")}`);
  show();
}

async function main(): Promise<void> {
  const [cmd, arg] = process.argv.slice(2);
  if (cmd === "start") {
    const url = await start();
    console.log(url || "A stored Canva login still works; run `show` to print the value.");
    return;
  }
  if (cmd === "finish") {
    if (!arg) throw new Error('Usage: npm run tendi:canva-login -- finish "<redirect URL or code>"');
    const { code, state } = codeFrom(arg);
    await finish(code, state);
    const tools = await verify();
    console.log(`Canva connected. ${tools.length} tools available: ${tools.join(", ")}`);
    show();
    return;
  }
  if (cmd === "show") {
    show();
    return;
  }
  if (cmd === "verify") {
    const tools = await verify();
    console.log(`Canva tools available: ${tools.length}: ${tools.join(", ")}`);
    return;
  }
  await interactive();
}

main().catch((err) => {
  console.error(`Canva login failed: ${err?.message || err}`);
  process.exit(1);
});
