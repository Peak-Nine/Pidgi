/**
 * Polite HTTP for Scout. Every outbound request goes through here so the rules
 * that keep us off blocklists live in one place:
 *   - a descriptive User-Agent with a contact address
 *   - per-host spacing (default 1.5 s between requests to the same host)
 *   - a hard timeout, two retries with exponential backoff, and respect for
 *     Retry-After on 429/503
 *   - conditional requests (ETag / Last-Modified) so unchanged pages cost nothing
 *   - a per-run request budget per host; when it is spent we stop, we don't push
 *   - no fetching of private addresses (the model can ask for URLs via read_url)
 */
import dns from "dns/promises";
import net from "net";

export const USER_AGENT =
  process.env.SCOUT_USER_AGENT || "TendiScout/1.0 (+https://peaknine.studio; niels@peaknine.studio)";

const MIN_GAP_MS = Number(process.env.SCOUT_HOST_GAP_MS) || 1500;
const TIMEOUT_MS = Number(process.env.SCOUT_TIMEOUT_MS) || 25_000;
const MAX_BYTES = Number(process.env.SCOUT_MAX_BYTES) || 8 * 1024 * 1024;

const lastHit = new Map<string, number>();
const budgetUsed = new Map<string, number>();
const cache = new Map<string, { etag?: string; lastModified?: string; body: string; ct: string }>();

export class BudgetExhausted extends Error {}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function spaceOut(host: string) {
  const last = lastHit.get(host) || 0;
  const wait = last + MIN_GAP_MS - Date.now();
  if (wait > 0) await sleep(wait);
  lastHit.set(host, Date.now());
}

export function resetBudgets(): void {
  budgetUsed.clear();
}

function spend(host: string, budget: number) {
  const used = (budgetUsed.get(host) || 0) + 1;
  if (used > budget) throw new BudgetExhausted(`request budget for ${host} (${budget}/run) is spent`);
  budgetUsed.set(host, used);
}

function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || a >= 224;
  }
  const low = ip.toLowerCase();
  return low === "::1" || low.startsWith("fc") || low.startsWith("fd") || low.startsWith("fe80") || low.startsWith("::ffff:");
}

/** Refuse URLs that point at localhost, private networks or cloud metadata endpoints. */
export async function assertPublicUrl(url: string): Promise<URL> {
  const u = new URL(url);
  if (u.protocol !== "https:" && u.protocol !== "http:") throw new Error(`unsupported protocol ${u.protocol}`);
  const host = u.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) throw new Error("local addresses are not fetched");
  if (net.isIP(host)) {
    if (isPrivateIp(host)) throw new Error("private addresses are not fetched");
    return u;
  }
  try {
    const addrs = await dns.lookup(host, { all: true });
    if (addrs.some((a) => isPrivateIp(a.address))) throw new Error("private addresses are not fetched");
  } catch (e: any) {
    if (/not fetched/.test(e?.message)) throw e;
    // DNS hiccup: let fetch produce the real error.
  }
  return u;
}

// Windows-1252 code points for bytes 0x80..0x9F (undefined bytes keep their value).
const CP1252 = [
  0x20ac, 0x81, 0x201a, 0x192, 0x201e, 0x2026, 0x2020, 0x2021, 0x2c6, 0x2030, 0x160, 0x2039, 0x152, 0x8d, 0x17d, 0x8f,
  0x90, 0x2018, 0x2019, 0x201c, 0x201d, 0x2022, 0x2013, 0x2014, 0x2dc, 0x2122, 0x161, 0x203a, 0x153, 0x9d, 0x17e, 0x178,
];

/** Node's TextDecoder treats latin1 as plain ISO-8859-1, so decode Windows-1252 by hand. */
export function decodeWindows1252(buf: Buffer): string {
  let out = "";
  for (let i = 0; i < buf.length; i += 8192) {
    const chunk = buf.subarray(i, i + 8192);
    const codes = new Array<number>(chunk.length);
    for (let k = 0; k < chunk.length; k++) {
      const b = chunk[k];
      codes[k] = b >= 0x80 && b <= 0x9f ? CP1252[b - 0x80] : b;
    }
    out += String.fromCharCode(...codes);
  }
  return out;
}

/**
 * Decode a response body using the charset from the Content-Type header, the XML
 * declaration or an HTML meta tag. UNDP's feed says ISO-8859-1 but contains
 * Windows-1252 bytes (curly quotes, dashes), so that family is decoded as
 * Windows-1252, as browsers do. Falls back to UTF-8.
 */
export function decodeBody(buf: Buffer, contentType = ""): string {
  const head = buf.subarray(0, 1024).toString("latin1");
  const label =
    (contentType.match(/charset=["']?([\w-]+)/i) || [])[1] ||
    (head.match(/<\?xml[^>]*encoding=["']([\w-]+)["']/i) || [])[1] ||
    (head.match(/<meta[^>]+charset=["']?([\w-]+)/i) || [])[1] ||
    "utf-8";
  if (/^utf-?8$/i.test(label)) return buf.toString("utf8");
  if (/^(iso-?8859-1|latin-?1|l1|windows-1252|cp1252|us-ascii|ascii)$/i.test(label)) return decodeWindows1252(buf);
  try {
    return new TextDecoder(label.toLowerCase()).decode(buf);
  } catch {
    return buf.toString("utf8");
  }
}

export interface GetOptions {
  budget?: number; // max requests to this host per run (default 40)
  accept?: string;
  headers?: Record<string, string>;
  method?: "GET" | "POST";
  body?: string;
  conditional?: boolean; // use ETag / Last-Modified cache (GET only)
  retries?: number;
}

export interface GetResult {
  status: number;
  ok: boolean;
  notModified: boolean;
  text: string;
  contentType: string;
  url: string;
}

export async function politeFetch(url: string, opts: GetOptions = {}): Promise<GetResult> {
  const u = await assertPublicUrl(url);
  const host = u.host;
  const budget = opts.budget ?? 40;
  const retries = opts.retries ?? 2;
  const cached = opts.conditional !== false && (opts.method || "GET") === "GET" ? cache.get(url) : undefined;

  let attempt = 0;
  for (;;) {
    spend(host, budget);
    await spaceOut(host);
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      const headers: Record<string, string> = {
        "user-agent": USER_AGENT,
        accept: opts.accept || "application/json, application/xml;q=0.9, text/html;q=0.8, */*;q=0.5",
        "accept-language": "en, fr;q=0.8, nl;q=0.8",
        ...(opts.headers || {}),
      };
      if (cached?.etag) headers["if-none-match"] = cached.etag;
      if (cached?.lastModified) headers["if-modified-since"] = cached.lastModified;
      const res = await fetch(u, { method: opts.method || "GET", headers, body: opts.body, signal: ctrl.signal, redirect: "follow" });
      if (res.status === 304 && cached) {
        return { status: 304, ok: true, notModified: true, text: cached.body, contentType: cached.ct, url };
      }
      if ((res.status === 429 || res.status === 503 || res.status >= 500) && attempt < retries) {
        const ra = Number(res.headers.get("retry-after"));
        const backoff = Number.isFinite(ra) && ra > 0 ? Math.min(ra * 1000, 60_000) : 2000 * Math.pow(2, attempt);
        attempt++;
        await sleep(backoff);
        continue;
      }
      const len = Number(res.headers.get("content-length") || 0);
      if (len > MAX_BYTES) throw new Error(`response too large (${len} bytes)`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length > MAX_BYTES) throw new Error(`response too large (${buf.length} bytes)`);
      const ct = res.headers.get("content-type") || "";
      const text = decodeBody(buf, ct);
      if (res.ok && opts.conditional !== false && (opts.method || "GET") === "GET") {
        const etag = res.headers.get("etag") || undefined;
        const lastModified = res.headers.get("last-modified") || undefined;
        if (etag || lastModified) cache.set(url, { etag, lastModified, body: text, ct });
      }
      return { status: res.status, ok: res.ok, notModified: false, text, contentType: ct, url };
    } catch (e: any) {
      if (e instanceof BudgetExhausted) throw e;
      if (attempt < retries && !/too large|not fetched|unsupported protocol/.test(String(e?.message))) {
        attempt++;
        await sleep(2000 * Math.pow(2, attempt));
        continue;
      }
      throw e;
    } finally {
      clearTimeout(t);
    }
  }
}

/** Download bytes (for PDFs). Same politeness rules, no text decoding. */
export async function politeFetchBytes(url: string, opts: GetOptions = {}): Promise<{ status: number; ok: boolean; bytes: Buffer; contentType: string }> {
  const u = await assertPublicUrl(url);
  spend(u.host, opts.budget ?? 40);
  await spaceOut(u.host);
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(u, { headers: { "user-agent": USER_AGENT, accept: opts.accept || "application/pdf, */*;q=0.5", ...(opts.headers || {}) }, signal: ctrl.signal, redirect: "follow" });
    const len = Number(res.headers.get("content-length") || 0);
    if (len > MAX_BYTES) throw new Error(`file too large (${len} bytes)`);
    const bytes = Buffer.from(await res.arrayBuffer());
    if (bytes.length > MAX_BYTES) throw new Error(`file too large (${bytes.length} bytes)`);
    return { status: res.status, ok: res.ok, bytes, contentType: res.headers.get("content-type") || "" };
  } finally {
    clearTimeout(t);
  }
}
