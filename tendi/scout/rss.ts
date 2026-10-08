/**
 * Small RSS reader for Scout: RSS 2.0, RSS 1.0 (RDF, what UNDP serves) and Atom.
 * Returns plain items; adapters map them onto Opportunity.
 */
import { XMLParser } from "fast-xml-parser";

export interface FeedItem {
  title: string;
  link: string;
  description: string;
  date: string; // ISO YYYY-MM-DD or ""
  id: string;
  categories: string[];
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  cdataPropName: "#cdata",
  trimValues: true,
  parseTagValue: false,
});

function text(v: any): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) return v.map(text).filter(Boolean).join(" ");
  if (typeof v === "object") {
    if (v["#cdata"] !== undefined) return text(v["#cdata"]);
    if (v["#text"] !== undefined) return text(v["#text"]);
    if (v["@_href"]) return String(v["@_href"]);
    if (v["@_rdf:resource"]) return String(v["@_rdf:resource"]);
  }
  return "";
}

function arr<T>(v: T | T[] | undefined): T[] {
  if (v === undefined || v === null) return [];
  return Array.isArray(v) ? v : [v];
}

export function toIsoDate(s: string): string {
  if (!s) return "";
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  const m = String(s).match(/(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : "";
}

const NAMED: Record<string, string> = {
  nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", ndash: "\u2013", mdash: "\u2014", rsquo: "\u2019", lsquo: "\u2018", rdquo: "\u201d", ldquo: "\u201c", hellip: "\u2026",
  eacute: "é", egrave: "è", ecirc: "ê", euml: "ë", agrave: "à", acirc: "â", ccedil: "ç", ocirc: "ô", ucirc: "û", ugrave: "ù", icirc: "î", iuml: "ï", ouml: "ö", uuml: "ü", auml: "ä", ntilde: "ñ", oacute: "ó", aacute: "á", iacute: "í", uacute: "ú",
  Eacute: "É", Egrave: "È", Agrave: "À", Ccedil: "Ç",
};

function cp(n: number): string {
  try {
    return n > 0 && n < 0x110000 ? String.fromCodePoint(n) : "";
  } catch {
    return "";
  }
}

/** Decode HTML entities, twice, because some feeds escape them twice ("&amp;#xe9;"). */
export function decodeEntities(s: string): string {
  let out = String(s || "");
  for (let i = 0; i < 2; i++) {
    out = out
      .replace(/&#x([0-9a-f]+);/gi, (_, h) => cp(parseInt(h, 16)))
      .replace(/&#(\d+);/g, (_, n) => cp(Number(n)))
      .replace(/&([a-zA-Z]+);/g, (m, name) => (NAMED[name] !== undefined ? NAMED[name] : m));
  }
  return out;
}

export function stripHtml(s: string): string {
  return decodeEntities(
    String(s || "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|li|tr|h\d)>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/[ \t\u00a0]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .trim();
}

export function parseFeed(xml: string): FeedItem[] {
  const doc = parser.parse(xml);
  const out: FeedItem[] = [];

  // RSS 2.0: rss.channel.item ; RSS 1.0: rdf:RDF.item ; Atom: feed.entry
  const rss2 = doc?.rss?.channel;
  const rdf = doc?.["rdf:RDF"];
  const atom = doc?.feed;

  const items: any[] = rss2 ? arr(rss2.item) : rdf ? arr(rdf.item) : atom ? arr(atom.entry) : [];
  for (const it of items) {
    const link = atom
      ? text(arr(it.link).find((l: any) => !l?.["@_rel"] || l["@_rel"] === "alternate") || it.link)
      : text(it.link) || text(it["@_rdf:about"]) || "";
    const title = stripHtml(text(it.title));
    const description = stripHtml(text(it.description ?? it.summary ?? it.content ?? it["content:encoded"]));
    const date = toIsoDate(text(it.pubDate ?? it["dc:date"] ?? it.published ?? it.updated ?? it.date));
    const id = text(it.guid ?? it.id) || link || title;
    const categories = arr(it.category).map((c: any) => stripHtml(text(c?.["@_term"] ? c["@_term"] : c))).filter(Boolean);
    if (!title && !link) continue;
    out.push({ title, link, description, date, id, categories });
  }
  return out;
}
