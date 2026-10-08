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
 * Redirect policy, verified against the live server on 2026-10-07: Canva's /authorize
 * accepts the redirect URIs of known clients (claude.ai, cursor://) and loopback
 * addresses (http://localhost:<port>/..., http://127.0.0.1:<port>/...), and answers
 * "Invalid redirect URI." (HTTP 400) for any other https host, onrender.com included.
 * So a hosted Tendi cannot complete the browser redirect itself. The supported route is
 * `npm run tendi:canva-login` on a laptop (tendi/canva-login.ts): it registers a client
 * with a localhost redirect, completes the login, and prints a CANVA_OAUTH_JSON value
 * to paste into the hosted service's environment. The hosted instance then only ever
 * uses the refresh token, which needs no redirect. The /canva/connect route stays for
 * the day Canva relaxes the policy (and for local runs, where the redirect IS localhost).
 */
import { randomBytes } from "crypto";
import { existsSync, readFileSync, writeFileSync, unlinkSync } from "fs";
import path from "path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { auth, UnauthorizedError, type OAuthClientProvider } from "@modelcontextprotocol/sdk/client/auth.js";
import { CallToolResultSchema } from "@modelcontextprotocol/sdk/types.js";
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

export function parseSeed(seed: string | undefined): Stored | null {
  if (!seed) return null;
  try {
    const raw = seed.trim();
    const j = JSON.parse(raw.startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8"));
    return j && typeof j === "object" ? (j as Stored) : null;
  } catch {
    return null;
  }
}

export class FileOAuthProvider implements OAuthClientProvider {
  pendingAuthUrl: string | null = null;
  private readonly file: string;
  constructor(private readonly redirect: string, file?: string) {
    this.file = file || storeFile();
  }

  get storePath(): string {
    return this.file;
  }

  private read(): Stored {
    let stored: Stored = {};
    try {
      if (existsSync(this.file)) stored = JSON.parse(readFileSync(this.file, "utf8"));
    } catch {
      stored = {};
    }
    if (stored.tokens?.access_token) return stored;
    // No usable login on disk: import CANVA_OAUTH_JSON if it carries one. This is how the
    // tokens from `npm run tendi:canva-login` (done on a laptop) reach a hosted instance.
    const seed = parseSeed(process.env.CANVA_OAUTH_JSON);
    if (seed?.tokens?.access_token) {
      this.write(seed);
      return seed;
    }
    return stored;
  }
  private write(s: Stored): void {
    s.savedAt = Date.now();
    writeFileSync(this.file, JSON.stringify(s), { mode: 0o600 });
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

/** Peak Nine master templates in Canva. Tendi copies them; it never opens one for editing. */
export const MASTER_TEMPLATE_IDS = ["DAHRT8eVhhA", "DAHKhE6U2vk", "DAHWFiZkv6w", "DAHWICf3ANs"];

/**
 * Refuse any Canva call that would edit a master template: opening an editing
 * transaction on one (read-design with open_transaction), or any write tool other
 * than copy-design that names one. Edits go through a transaction, so blocking the
 * transaction on a master blocks the edit. Returns an error text, or null when fine.
 */
export function masterTemplateGuard(name: string, input: any, ids: string[] = MASTER_TEMPLATE_IDS): string | null {
  const raw = name.replace(/^canva_/, "");
  const ref = String(input?.design_id || input?.design_url || "");
  const hit = ids.find((id) => ref === id || ref.includes(`/design/${id}`) || ref.includes(id));
  if (!hit) return null;
  if (/^copy[-_]design$/i.test(raw)) return null;
  const opensEdit = /^read[-_]design$/i.test(raw) && input?.open_transaction === true;
  if (opensEdit || isCanvaWriteTool(name)) {
    return `Blocked: ${hit} is a Peak Nine master template. Copy it first (copy-design) and edit the copy.`;
  }
  return null;
}

/**
 * Text and images of an MCP tool result. Canva's edit and read tools return page
 * thumbnails as image blocks; those go to the model as images, never as base64 text
 * (which used to flood the context with tens of thousands of characters).
 */
export function splitContent(res: any): { text: string; images: { data: string; mimeType: string }[] } {
  if (!Array.isArray(res?.content)) return { text: JSON.stringify(res?.structuredContent ?? res), images: [] };
  const images: { data: string; mimeType: string }[] = [];
  const texts: string[] = [];
  for (const c of res.content) {
    if (typeof c?.text === "string") texts.push(c.text);
    else if (c?.type === "image" && typeof c.data === "string") {
      if (c.data.length < 4_500_000) images.push({ data: c.data, mimeType: String(c.mimeType || "image/png") });
    } else texts.push(JSON.stringify(c));
  }
  if (!texts.join("").trim() && res?.structuredContent) texts.push(JSON.stringify(res.structuredContent));
  return { text: texts.join("\n"), images };
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
    const result = await auth(this.provider, { serverUrl: CANVA_MCP_URL, scope: CANVA_SCOPES });
    if (result === "REDIRECT") return { redirect: this.provider.pendingAuthUrl || undefined, connected: false };
    await this.connect();
    return { connected: true };
  }

  async finishAuth(code: string, state: string | undefined): Promise<void> {
    if (!this.provider.checkState(state)) throw new Error("OAuth state mismatch; start again from /canva/connect.");
    const result = await auth(this.provider, { serverUrl: CANVA_MCP_URL, authorizationCode: code, scope: CANVA_SCOPES });
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

  async call(name: string, input: any): Promise<{ text: string; isError: boolean; images?: { data: string; mimeType: string }[] }> {
    const raw = this.rawNames.get(name);
    if (!raw) return { isError: true, text: `Unknown Canva tool ${name}.` };
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        if (!this.client) await this.connect();
        // A plain tools/call request, without the SDK's client-side check of the answer
        // against the tool's output schema: a schema mismatch on Canva's side must not
        // turn a good answer (a page read, an edit result) into an error.
        const res: any = await this.client!.request({ method: "tools/call", params: { name: raw, arguments: input || {} } }, CallToolResultSchema, { timeout: 120_000 });
        const { text, images } = splitContent(res);
        return { text: text || "(no content)", isError: !!res?.isError, ...(images.length ? { images } : {}) };
      } catch (e: any) {
        const msg = String(e?.message || e);
        console.error(`[canva] ${raw} failed (attempt ${attempt + 1}): ${msg.slice(0, 400)}`);
        if (e instanceof UnauthorizedError || /unauthori[sz]ed|401/i.test(String(e?.message))) {
          await this.disconnect();
          return {
            isError: true,
            text: "Canva rejected the stored login (token expired or revoked). Ask Niels to reconnect Canva via the /canva/connect link, then try again.",
          };
        }
        // Canva answered with an error (bad input, rate limit): no point reconnecting.
        if ([-32600, -32601, -32602, -32603, 429].includes(Number(e?.code)) || /rate.?limit|too many requests/i.test(msg)) return { isError: true, text: `Canva tool ${raw} failed: ${msg}` };
        // Session dropped or transport hiccup: reconnect once, then give up honestly.
        await this.disconnect();
        if (attempt === 1) return { isError: true, text: `Canva tool ${raw} failed: ${msg}` };
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
