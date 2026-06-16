/**
 * Teamleader OAuth Login Tool
 *
 * Starts OAuth Authorization Code flow:
 * 1. Opens browser with Teamleader auth URL
 * 2. Spins up local HTTP server to catch the redirect with ?code=
 * 3. Exchanges code for tokens and persists to ~/.teamleader-tokens.json
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createServer, type Server } from "http";
import { writeFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import type { TokenResponse } from "../types/index.js";

const AUTH_URL = "https://focus.teamleader.eu/oauth2/authorize";
const TOKEN_URL = "https://focus.teamleader.eu/oauth2/access_token";
const TOKEN_FILE = join(homedir(), ".teamleader-tokens.json");
const CALLBACK_TIMEOUT_MS = 120_000; // 2 minutes

function respond(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

/**
 * Wait for the OAuth callback on a local HTTP server.
 * Returns the authorization code from the ?code= query param.
 */
function waitForCallback(port: number, redirectUri: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let server: Server;

    const timeout = setTimeout(() => {
      server?.close();
      reject(new Error("OAuth callback timeout — no response within 2 minutes"));
    }, CALLBACK_TIMEOUT_MS);

    server = createServer((req, res) => {
      const url = new URL(req.url || "/", redirectUri);
      const code = url.searchParams.get("code");
      const error = url.searchParams.get("error");

      if (error) {
        res.writeHead(400, { "Content-Type": "text/html" });
        res.end(`<h1>Login failed</h1><p>${error}</p><p>You can close this tab.</p>`);
        clearTimeout(timeout);
        server.close();
        reject(new Error(`OAuth error: ${error}`));
        return;
      }

      if (code) {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end("<h1>Login successful!</h1><p>You can close this tab and return to your MCP client.</p>");
        clearTimeout(timeout);
        server.close();
        resolve(code);
        return;
      }

      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("Missing code parameter");
    });

    server.listen(port, () => {
      // Server is ready
    });

    server.on("error", (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

/**
 * Exchange authorization code for tokens.
 */
async function exchangeCodeForTokens(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<TokenResponse> {
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
  });

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Token exchange failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return (await response.json()) as TokenResponse;
}

export function registerLoginTools(server: McpServer): void {
  const clientId = process.env.TEAMLEADER_CLIENT_ID;
  const clientSecret = process.env.TEAMLEADER_CLIENT_SECRET;

  server.tool(
    "teamleader_login",
    "Start OAuth login flow for Teamleader Focus. Opens browser for authorization, then captures the callback to obtain and store tokens. Use this for initial setup or when the refresh token has expired.",
    {},
    async () => {
      if (!clientId || !clientSecret) {
        return respond(
          "Missing TEAMLEADER_CLIENT_ID or TEAMLEADER_CLIENT_SECRET environment variables. " +
            "Set these in your MCP configuration before using login."
        );
      }

      const port = 19836;
      const redirectUri = `http://localhost:${port}/callback`;

      // Build auth URL
      const params = new URLSearchParams({
        client_id: clientId,
        response_type: "code",
        redirect_uri: redirectUri,
      });
      const authUrl = `${AUTH_URL}?${params.toString()}`;

      // Open browser
      let openModule: { default: (url: string) => Promise<unknown> };
      try {
        openModule = await import("open");
      } catch {
        return respond(
          `Could not open browser automatically. Please visit this URL manually:\n\n${authUrl}`
        );
      }

      // Start callback server BEFORE opening browser
      const codePromise = waitForCallback(port, redirectUri);

      try {
        await openModule.default(authUrl);
      } catch {
        return respond(
          `Could not open browser automatically. Please visit this URL manually:\n\n${authUrl}\n\n` +
            `The callback server is listening on http://localhost:${port}/callback`
        );
      }

      // Wait for OAuth callback
      let code: string;
      try {
        code = await codePromise;
      } catch (err) {
        return respond(`OAuth flow failed: ${err instanceof Error ? err.message : String(err)}`);
      }

      // Exchange code for tokens
      let tokens: TokenResponse;
      try {
        tokens = await exchangeCodeForTokens(code, clientId, clientSecret, redirectUri);
      } catch (err) {
        return respond(`Token exchange failed: ${err instanceof Error ? err.message : String(err)}`);
      }

      // Persist tokens
      try {
        writeFileSync(
          TOKEN_FILE,
          JSON.stringify({ refresh_token: tokens.refresh_token }, null, 2)
        );
      } catch (err) {
        return respond(
          `Login succeeded but could not save tokens to ${TOKEN_FILE}: ${err instanceof Error ? err.message : String(err)}\n` +
            `Refresh token: ${tokens.refresh_token}`
        );
      }

      return respond(
        `Login successful! Tokens saved to ${TOKEN_FILE}.\n` +
          `The MCP server will use the refresh token automatically. You may need to restart the server.`
      );
    }
  );
}
