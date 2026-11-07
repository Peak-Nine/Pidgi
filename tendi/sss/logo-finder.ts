/**
 * Find an organisation's official logo on its own website and make the two
 * single-colour versions the Scale & Sustain Stories template needs.
 *
 * No headless browser: plain HTTP requests (with a normal browser user agent),
 * HTML parsing with cheerio, and image work with sharp (which also renders SVG).
 *
 * When the site blocks plain requests (bot checks) or no logo is found, findLogo
 * throws a LogoError with .reason 'blocked' | 'not_found' | 'download_failed', so
 * Tendi asks a person in Slack for the logo file or a link instead.
 */
import * as cheerio from "cheerio";
import sharp from "sharp";

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";

export class LogoError extends Error {
  constructor(
    public reason: "blocked" | "not_found" | "download_failed",
    message: string,
  ) {
    super(message);
  }
}

export interface LogoVariants {
  original: Buffer;
  black: Buffer;
  white: Buffer;
  width: number;
  height: number;
  aspect: number;
}

interface Candidate {
  kind: "url" | "symbol" | "sprite" | "inline";
  url?: string;
  id?: string;
  viewBox?: string;
  inner?: string;
  svg?: string;
  score: number;
  why: string;
}

const BOT_WALL = /sgcaptcha|cf-challenge|cf_chl|just a moment\.\.\.|attention required|captcha|access denied|ddos-guard/i;

function get(url: string, accept: string): Promise<Response> {
  return fetch(url, { headers: { "User-Agent": UA, Accept: accept, "Accept-Language": "en" }, redirect: "follow", signal: AbortSignal.timeout(20_000) });
}

function abs(url: string, base: string): string | null {
  try {
    return new URL(url, base).href;
  } catch {
    return null;
  }
}

function collectCandidates($: cheerio.CheerioAPI, base: string, orgName: string): Candidate[] {
  const out: Candidate[] = [];
  const name = (orgName || "").toLowerCase();
  const hint = (s: string) => /logo|brand/i.test(s || "");
  const parentText = (el: any) =>
    $(el)
      .parents()
      .slice(0, 4)
      .map((_i, p) => [$(p).attr("class"), $(p).attr("id")].join(" "))
      .get()
      .join(" ");

  // 1. Structured data (often the cleanest, official file)
  $('script[type="application/ld+json"]').each((_i, el) => {
    let data: any;
    try {
      data = JSON.parse($(el).contents().text());
    } catch {
      return;
    }
    const walk = (o: any): void => {
      if (!o || typeof o !== "object") return;
      if (Array.isArray(o)) return o.forEach(walk);
      const types = ([] as any[]).concat(o["@type"] || []).join(" ");
      if (o.logo && /Organization|NGO|Corporation|NonProfit|WebSite/i.test(types)) {
        const u = typeof o.logo === "string" ? o.logo : o.logo.url || o.logo.contentUrl;
        const href = u && abs(u, base);
        if (href) out.push({ kind: "url", url: href, score: 5, why: "structured data" });
      }
      Object.values(o).forEach(walk);
    };
    walk(data);
  });

  // 2. <img> elements
  $("img").each((_i, el) => {
    const $el = $(el);
    let src = $el.attr("data-src") || $el.attr("data-lazy-src") || $el.attr("src") || "";
    const srcset = $el.attr("srcset") || $el.attr("data-srcset");
    if ((!src || src.startsWith("data:")) && srcset) src = srcset.split(",").pop()!.trim().split(" ")[0];
    if (!src || (src.startsWith("data:") && src.length < 400)) return; // lazy-load placeholders
    const alt = $el.attr("alt") || "";
    const own = [src, alt, $el.attr("class"), $el.attr("id")].join(" ");
    const parents = parentText(el);
    let score = 0;
    if (hint(own)) score += 3;
    if (hint(parents)) score += 2;
    if ($el.closest('header, nav, [class*="header"], [id*="header"]').length) score += 2;
    const href = $el.closest("a").attr("href") || "";
    if (["/", base, base.replace(/\/$/, "")].includes(href)) score += 1;
    if (name && alt.toLowerCase().includes(name)) score += 2;
    if (/\.svg(\?|$)/i.test(src)) score += 1;
    if (/icon|avatar|partner|sponsor|client|footer/i.test(own + " " + parents)) score -= 2;
    if (score >= 3) {
      const url = src.startsWith("data:") ? src : abs(src, base);
      if (url) out.push({ kind: "url", url, score, why: "image in the page" });
    }
  });

  // 3. Inline <svg> logos
  $("svg").each((_i, el) => {
    const $el = $(el);
    const ctx = [$el.attr("class"), $el.attr("id"), $el.attr("aria-label")].join(" ");
    const parents = parentText(el);
    const inHeader = $el.closest('header, nav, [class*="header"]').length > 0;
    let score = 0;
    if (hint(ctx)) score += 3;
    if (hint(parents)) score += 2;
    if (inHeader) score += 1;
    if (score < 3) return;
    const markup = $.html(el);
    const use = $el.find("use").first();
    const ref = use.attr("href") || use.attr("xlink:href");
    if (ref) {
      const [file, id] = ref.split("#");
      if (!id) return;
      if (!file) {
        const sym = $(`symbol[id="${id}"]`).first();
        if (sym.length) out.push({ kind: "symbol", viewBox: sym.attr("viewbox") || sym.attr("viewBox"), inner: sym.html() || "", score, why: "SVG symbol in the page" });
      } else {
        const url = abs(file, base);
        if (url) out.push({ kind: "sprite", url, id, score, why: "SVG sprite" });
      }
    } else if (markup.length > 300) {
      const svg = markup.includes("xmlns=") ? markup : markup.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
      out.push({ kind: "inline", svg, score, why: "inline SVG in the page" });
    }
  });

  // 4. Last resort: touch icon (square mark only, no wordmark)
  const icon = $('link[rel="apple-touch-icon"]').attr("href");
  const iconUrl = icon && abs(icon, base);
  if (iconUrl) out.push({ kind: "url", url: iconUrl, score: 0.5, why: "touch icon (mark only)" });

  const seen = new Set<string>();
  return out
    .filter((c) => {
      const k = (c.url || "") + (c.id || "") + (c.svg || c.inner || "").slice(0, 200);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .sort((a, b) => b.score - a.score);
}

const symbolToSvg = (viewBox: string | undefined, inner: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"${viewBox ? ` viewBox="${viewBox}"` : ""}>${inner}</svg>`;

async function loadCandidate(c: Candidate): Promise<{ buffer: Buffer; isSvg: boolean } | null> {
  if (c.kind === "inline") return { buffer: Buffer.from(c.svg || ""), isSvg: true };
  if (c.kind === "symbol") return { buffer: Buffer.from(symbolToSvg(c.viewBox, c.inner || "")), isSvg: true };
  if (c.kind === "sprite") {
    const res = await get(c.url!, "image/svg+xml,*/*");
    if (!res.ok) return null;
    const $s = cheerio.load(await res.text(), { xmlMode: true });
    const sym = $s(`symbol[id="${c.id}"]`).first();
    if (!sym.length) return null;
    return { buffer: Buffer.from(symbolToSvg(sym.attr("viewBox"), sym.html() || "")), isSvg: true };
  }
  const url = c.url!;
  if (url.startsWith("data:")) {
    const [meta, data] = url.split(",");
    const buf = meta.includes("base64") ? Buffer.from(data, "base64") : Buffer.from(decodeURIComponent(data));
    return { buffer: buf, isSvg: meta.includes("svg") };
  }
  const res = await get(url, "image/avif,image/webp,image/svg+xml,image/*,*/*;q=0.8");
  const type = res.headers.get("content-type") || "";
  if (!res.ok || !/image|svg|octet-stream/i.test(type)) return null;
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length < 200) return null;
  return { buffer, isSvg: /svg/i.test(type) || /\.svg(\?|$)/i.test(url) };
}

/** Render to a large PNG (SVG at high density) and check it is usable. */
export async function rasterise({ buffer, isSvg }: { buffer: Buffer; isSvg: boolean }): Promise<{ png: Buffer; width: number; height: number }> {
  let img = sharp(buffer, isSvg ? { density: 600 } : {});
  let meta = await img.metadata();
  if (isSvg && meta.width && meta.width > 4000) img = sharp(buffer, { density: Math.max(72, Math.floor(600 * (3000 / meta.width))) });
  let png = await img.png().toBuffer();
  meta = await sharp(png).metadata();
  if ((meta.width || 0) > 2400) {
    png = await sharp(png).resize({ width: 2400 }).png().toBuffer();
    meta = await sharp(png).metadata();
  }
  return { png, width: meta.width || 0, height: meta.height || 0 };
}

export async function findLogo(siteUrl: string, { orgName = "" } = {}): Promise<{ buffer: Buffer; source: string; why: string; width: number; height: number; score: number; markOnly: boolean }> {
  let res: Response;
  try {
    res = await get(siteUrl, "text/html,application/xhtml+xml");
  } catch (e: any) {
    throw new LogoError("blocked", `Could not open ${siteUrl}: ${e?.message || e}`);
  }
  const html = await res.text();
  if (!res.ok || res.status === 202 || (html.length < 3000 && BOT_WALL.test(html))) {
    throw new LogoError("blocked", `${siteUrl} answered with a bot check or error (${res.status}).`);
  }
  const base = res.url || siteUrl;
  const $ = cheerio.load(html);
  const candidates = collectCandidates($, base, orgName);
  if (!candidates.length) throw new LogoError("not_found", `No logo found on ${base}.`);

  const found: { buffer: Buffer; source: string; why: string; width: number; height: number; score: number }[] = [];
  for (const c of candidates.slice(0, 6)) {
    try {
      const loaded = await loadCandidate(c);
      if (!loaded) continue;
      const r = await rasterise(loaded);
      if (r.width < 80 || r.height < 20) continue; // too small to be the wordmark
      found.push({ buffer: r.png, source: c.url || c.why, why: c.why, width: r.width, height: r.height, score: c.score });
      if (found.length >= 3) break;
    } catch {
      continue;
    }
  }
  if (!found.length) throw new LogoError("download_failed", `Found logo candidates on ${base} but none could be downloaded.`);
  found.sort((a, b) => Number(b.score >= 3) - Number(a.score >= 3) || Math.min(b.width, 1200) - Math.min(a.width, 1200) || b.score - a.score);
  const best = found[0];
  return { ...best, markOnly: best.score < 3 };
}

/** Black and white versions, with transparent background and trimmed edges. */
export async function makeLogoVariants(pngBuffer: Buffer): Promise<LogoVariants> {
  const { data, info } = await sharp(pngBuffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const px = (x: number, y: number) => (y * w + x) * 4;

  // No transparency (a JPEG or a flat PNG): treat the edge colour as background and fade it out.
  let opaque = true;
  for (let i = 3; i < data.length; i += 4)
    if (data[i] < 250) {
      opaque = false;
      break;
    }
  if (opaque) {
    const bg = [data[0], data[1], data[2]];
    for (let i = 0; i < data.length; i += 4) {
      const d = Math.hypot(data[i] - bg[0], data[i + 1] - bg[1], data[i + 2] - bg[2]);
      data[i + 3] = Math.max(0, Math.min(255, (d - 25) * 4));
    }
  }

  let x0 = w,
    y0 = h,
    x1 = -1,
    y1 = -1;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (data[px(x, y) + 3] > 8) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
  if (x1 < 0) throw new LogoError("not_found", "The logo image is empty.");
  const cw = x1 - x0 + 1,
    ch = y1 - y0 + 1;

  const solid = (v: number) => {
    const out = Buffer.alloc(cw * ch * 4);
    for (let y = 0; y < ch; y++)
      for (let x = 0; x < cw; x++) {
        const s = px(x0 + x, y0 + y),
          d = (y * cw + x) * 4;
        out[d] = out[d + 1] = out[d + 2] = v;
        out[d + 3] = data[s + 3];
      }
    return sharp(out, { raw: { width: cw, height: ch, channels: 4 } }).png().toBuffer();
  };
  const original = await sharp(data, { raw: { width: w, height: h, channels: 4 } }).extract({ left: x0, top: y0, width: cw, height: ch }).png().toBuffer();

  return { original, black: await solid(0), white: await solid(255), width: cw, height: ch, aspect: cw / ch };
}
