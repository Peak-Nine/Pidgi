/**
 * Canva for Tendi, through Canva's hosted MCP server (https://mcp.canva.com/mcp).
 *
 * How it works:
 *   - Tendi is an MCP *client* of Canva's server, the same way Claude.ai is.
 *   - Canva's server advertises OAuth 2.1 with dynamic client registration (RFC 7591)
 *     and PKCE at https://mcp.canva.com/.well-known/oauth-authorization-server.
 *     The MCP SDK's auth helpers drive that flow; this file only stores the
 *     registration, the tokens and the PKCE verifier on disk.
 *   - A one-time, admin-only login: GET /canva/connect?key=<TENDI_ADMIN_KEY> sends
 *     Niels to Canva, Canva sends him back to /canva/callback, tokens are saved,
 *     and from then on the Canva tools appear in Tendi's tool list (prefixed canva_).
 *   - Tokens live in <dataDir>/tendi-canva-oauth.json. Without a persistent disk on
 *     Render they are lost on redeploy and the login has to be repeated (or the
 *     JSON is seeded through the CANVA_OAUTH_JSON env var).
 *
 * Honest status (2026-10-07): verified from a sandbox against the live server:
 * metadata discovery, dynamic client registration (Canva returned a client_id) and
 * the PKCE authorization URL. Not yet verified: the user login, the token exchange
 * and the tool listing; those need a real Canva login by Niels. Canva's help pages
 * describe the connector as built for "supported AI assistants", so if the token
 * exchange is refused, Tendi keeps working without Canva and says so.
 */
import { randomBytes } from "crypto";
import { existsSync, readFileSync, writeFileSync, unlinkSync } from "fs";
import path from "path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { auth, UnauthorizedError, type OAuthClientProvider } from "@modelcontextprotocol/sdk/client/auth.js";
import type { OAuthClientInformationMixed, OAuthClientMetadata, OAuthTokens } from "@modelcontextprotocol/sdk/shared/auth.js";
import { dataDir } from "./state.js";
import type { AnthropicToolDef } from "./teamleader.js";

export const CANVA_MCP_URL = process.env.CANVA_MCP_URL || "https://mcp.canva.com/mcp";

// Scopes as listed by https://mcp.canva.com/.well-known/oauth-protected-resource (2026-10-07).
export const CANVA_SCOPES = [
  "profile:read",
  "design:meta:read",
  "design:content:read",
  "design:content:write",
  "folder:read",
  "folder:write",
  "brandtemplate:meta:read",
  "brandtemplate:content:read",
  "asset:read",
  "asset:write",
  "brandkit:read",
  "comment:read",
  "comment:write",
].join(" ");

interface Stored {
  client?: OAuthClientInformationMixed;
  tokens?: OAuthTokens;
  verifier?: string;
  state?: string;
  savedAt?: number;
}

export function canvaConfigured(): boolean {
  return !!process.env.PUBLIC_BASE_URL && process.env.TENDI_CANVA !== "0";
}

function storeFile(): string {
  return process.env.TENDI_CANVA_TOKEN_FILE || path.join(dataDir(), "tendi-canva-oauth.json");
}

export class FileOAuthProvider implements OAuthClientProvider {
  pendingAuthUrl: string | null = null;
  constructor(private readonly redirect: string) {}

  private read(): Stored {
    try {
      if (existsSync(storeFile())) return JSON.parse(readFileSync(storeFile(), "utf8"));
    } catch {
      /* fall through */
    }
    // Seed from env once (useful on hosts without a persistent disk).
    const seed = process.env.CANVA_OAUTH_JSON;
    if (seed) {
      try {
        const j = JSON.parse(seed.trim().startsWith("{") ? seed : Buffer.from(seed, "base64").toString("utf8"));
        if (j && typeof j === "object") {
          this.write(j);
          return j;
        }
      } catch {
        /* ignore bad seed */
      }
    }
    return {};
  }
  private write(s: Stored): void {
    s.savedAt = Date.now();
    writeFileSync(storeFile(), JSON.stringify(s), { mode: 0o600 });
  }

  get redirectUrl(): string {
    return this.redirect;
  }
  get clientMetadata(): OAuthClientMetadata {
    return {
      client_name: "Tendi (Peak Nine proposal assistant)",
      client_uri: process.env.PUBLIC_BASE_URL,
      redirect_uris: [this.redirect],
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      token_endpoint_auth_method: "none",
      scope: CANVA_SCOPES,
    };
  }
  state(): string {
    const s = randomBytes(16).toString("hex");
    this.write({ ...this.read(), state: s });
    return s;
  }
  checkState(s: string | undefined): boolean {
    const stored = this.read().state;
    return !!s && !!stored && s === stored;
  }
  clientInformation(): OAuthClientInformationMixed | undefined {
    return this.read().client;
  }
  saveClientInformation(info: OAuthClientInformationMixed): void {
    this.write({ ...this.read(), client: info });
  }
  tokens(): OAuthTokens | undefined {
    return this.read().tokens;
  }
  saveTokens(tokens: OAuthTokens): void {
    const cur = this.read();
    // Keep an older refresh token if the server did not rotate it.
    if (!tokens.refresh_token && cur.tokens?.refresh_token) tokens = { ...tokens, refresh_token: cur.tokens.refresh_token };
    this.write({ ...cur, tokens, verifier: undefined, state: undefined });
  }
  redirectToAuthorization(url: URL): void {
    this.pendingAuthUrl = url.toString();
  }
  saveCodeVerifier(v: string): void {
    this.write({ ...this.read(), verifier: v });
  }
  codeVerifier(): string {
    const v = this.read().verifier;
    if (!v) throw new Error("No PKCE code verifier stored; start the Canva login again from /canva/connect.");
    return v;
  }
  invalidateCredentials(scope: "all" | "client" | "tokens" | "verifier"): void {
    const cur = this.read();
    if (scope === "all") {
      try {
        unlinkSync(storeFile());
      } catch {
        /* ignore */
      }
      return;
    }
    if (scope === "client") delete cur.client;
    if (scope === "tokens") delete cur.tokens;
    if (scope === "verifier") delete cur.verifier;
    this.write(cur);
  }
  hasTokens(): boolean {
    return !!this.read().tokens?.access_token;
  }
  exportJson(): string {
    return JSON.stringify(this.read());
  }
}

const CANVA_WRITE_PATTERN = /(copy|edit|commit|create|generate|import|upload|resize|autofill|comment|reply|move|delete|update|start[-_]editing|perform)/i;

export function isCanvaWriteTool(name: string): boolean {
  const raw = name.replace(/^canva_/, "");
  if (/^(list|get|search|read|view|find)/i.test(raw)) return false; // reads such as list-comments, get-design-content
  return CANVA_WRITE_PATTERN.test(raw);
}

function toolName(raw: string): string {
  return ("canva_" + raw).replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 64);
}

function cleanSchema(s: any): any {
  if (!s || typeof s !== "object") return { type: "object", properties: {} };
  const { $schema, ...rest } = s;
  if (!rest.type) rest.type = "object";
  if (rest.type === "object" && !rest.properties) rest.properties = {};
  return rest;
}

export class CanvaBridge {
  readonly provider: FileOAuthProvider;
  private client: Client | null = null;
  private connecting: Promise<void> | null = null;
  tools: AnthropicToolDef[] = [];
  private rawNames = new Map<string, string>();
  lastError: string | null = null;

  constructor(publicBaseUrl: string) {
    this.provider = new FileOAuthProvider(publicBaseUrl.replace(/\/$/, "") + "/canva/callback");
  }

  connected(): boolean {
    return !!this.client;
  }

  /** Start (or silently complete, if a refresh token still works) the OAuth flow. */
  async beginAuth(): Promise<{ redirect?: string; connected: boolean }> {
    this.provider.pendingAuthUrl = null;
    const result = await auth(this.provider, { serverUrl: CANVA_MCP_URL });
    if (result === "REDIRECT") return { redirect: this.provider.pendingAuthUrl || undefined, connected: false };
    await this.connect();
    return { connected: true };
  }

  async finishAuth(code: string, state: string | undefined): Promise<void> {
    if (!this.provider.checkState(state)) throw new Error("OAuth state mismatch; start again from /canva/connect.");
    const result = await auth(this.provider, { serverUrl: CANVA_MCP_URL, authorizationCode: code });
    if (result !== "AUTHORIZED") throw new UnauthorizedError("Canva did not authorize the client.");
    await this.connect();
  }

  async connect(): Promise<void> {
    if (this.client) return;
    if (this.connecting) return this.connecting;
    this.connecting = (async () => {
      if (!this.provider.hasTokens()) throw new UnauthorizedError("Canva is not connected yet.");
      const transport = new StreamableHTTPClientTransport(new URL(CANVA_MCP_URL), { authProvider: this.provider });
      const client = new Client({ name: "tendi", version: "1.0.0" }, { capabilities: {} });
      await client.connect(transport);
      const listed = await client.listTools();
      this.rawNames.clear();
      this.tools = listed.tools.map((t) => {
        const name = toolName(t.name);
        this.rawNames.set(name, t.name);
        return { name, description: t.description ?? "", input_schema: cleanSchema(t.inputSchema) };
      });
      this.client = client;
      this.lastError = null;
      client.onclose = () => {
        this.client = null;
      };
    })();
    try {
      await this.connecting;
    } catch (e: any) {
      this.lastError = e?.message || String(e);
      throw e;
    } finally {
      this.connecting = null;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client?.close();
    } catch {
      /* ignore */
    }
    this.client = null;
  }

  has(name: string): boolean {
    return this.rawNames.has(name);
  }

  async call(name: string, input: any): Promise<{ text: string; isError: boolean }> {
    const raw = this.rawNames.get(name);
    if (!raw) return { isError: true, text: `Unknown Canva tool ${name}.` };
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        if (!this.client) await this.connect();
        const res: any = await this.client!.callTool({ name: raw, arguments: input || {} }, undefined, { timeout: 120_000 });
        const text = Array.isArray(res?.content)
          ? res.content.map((c: any) => (typeof c?.text === "string" ? c.text : JSON.stringify(c))).join("\n")
          : JSON.stringify(res);
        return { text: text || "(no content)", isError: !!res?.isError };
      } catch (e: any) {
        if (e instanceof UnauthorizedError || /unauthori[sz]ed|401/i.test(String(e?.message))) {
          await this.disconnect();
          return {
            isError: true,
            text: "Canva rejected the stored login (token expired or revoked). Ask Niels to reconnect Canva via the /canva/connect link, then try again.",
          };
        }
        // Session dropped or transport hiccup: reconnect once, then give up honestly.
        await this.disconnect();
        if (attempt === 1) return { isError: true, text: `Canva tool ${raw} failed: ${e?.message || e}` };
      }
    }
    return { isError: true, text: `Canva tool ${raw} failed.` };
  }

  status(): { configured: boolean; connected: boolean; has_tokens: boolean; tool_count: number; last_error: string | null } {
    return {
      configured: canvaConfigured(),
      connected: this.connected(),
      has_tokens: this.provider.hasTokens(),
      tool_count: this.tools.length,
      last_error: this.lastError,
    };
  }
}
