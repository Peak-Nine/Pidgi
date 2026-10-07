/**
 * Attachments dropped into a Tendi thread: download from Slack, extract text.
 *
 * Supported: PDF (pdf-parse), Word .docx (mammoth), plain text, Markdown, CSV,
 * JSON. Anything else (images, spreadsheets, PowerPoint, old .doc) is reported
 * as "not extracted" so the model can tell Niels instead of silently working
 * from a partial read.
 *
 * Slack needs the `files:read` bot scope for url_private_download to work.
 */
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

export interface SlackFileRef {
  id?: string;
  name?: string;
  title?: string;
  mimetype?: string;
  filetype?: string;
  size?: number;
  url_private_download?: string;
  url_private?: string;
}

export interface ExtractedFile {
  name: string;
  ok: boolean;
  text: string;
  chars: number;
  note?: string;
}

// Hard cap per file so one 400-page tender cannot blow the prompt. The full text
// stays in the thread workspace; the model pages through it with read_source.
export const MAX_CHARS_PER_FILE = Number(process.env.TENDI_MAX_CHARS_PER_FILE) || 400_000;
// How much of each file is injected inline into the user turn.
export const INLINE_CHARS_PER_FILE = Number(process.env.TENDI_INLINE_CHARS_PER_FILE) || 14_000;
const MAX_BYTES = Number(process.env.TENDI_MAX_FILE_BYTES) || 25 * 1024 * 1024;

export async function downloadSlackFile(f: SlackFileRef, botToken: string): Promise<Buffer> {
  const url = f.url_private_download || f.url_private;
  if (!url) throw new Error("file has no private URL");
  if (f.size && f.size > MAX_BYTES) throw new Error(`file is larger than ${Math.round(MAX_BYTES / 1024 / 1024)} MB`);
  const res = await fetch(url, { headers: { Authorization: `Bearer ${botToken}` } });
  if (!res.ok) throw new Error(`Slack returned ${res.status} when downloading the file`);
  const ct = res.headers.get("content-type") || "";
  const buf = Buffer.from(await res.arrayBuffer());
  // Slack answers with an HTML login page instead of the bytes when the bot lacks files:read.
  if (/text\/html/i.test(ct) && !/html?$/i.test(f.name || "")) {
    throw new Error("Slack returned a web page instead of the file; the bot probably lacks the files:read scope");
  }
  return buf;
}

export function kindOf(f: SlackFileRef): "pdf" | "docx" | "text" | "unsupported" {
  const name = (f.name || f.title || "").toLowerCase();
  const mt = (f.mimetype || "").toLowerCase();
  const ft = (f.filetype || "").toLowerCase();
  if (mt === "application/pdf" || ft === "pdf" || name.endsWith(".pdf")) return "pdf";
  if (
    mt === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    ft === "docx" ||
    name.endsWith(".docx")
  )
    return "docx";
  if (
    mt.startsWith("text/") ||
    ["text", "markdown", "csv", "json", "html", "xml"].includes(ft) ||
    /\.(txt|md|markdown|csv|json|html?|xml|rtf)$/.test(name)
  )
    return "text";
  return "unsupported";
}

export async function extractText(f: SlackFileRef, buf: Buffer): Promise<ExtractedFile> {
  const name = f.name || f.title || f.id || "attachment";
  const kind = kindOf(f);
  try {
    let text = "";
    let note: string | undefined;
    if (kind === "pdf") {
      const parser = new PDFParse({ data: new Uint8Array(buf) });
      try {
        const r = await parser.getText();
        text = r.text || "";
        if (r.total) note = `${r.total} page(s)`;
      } finally {
        await parser.destroy().catch(() => undefined);
      }
      if (text.replace(/\s+/g, "").length < 50) {
        note = (note ? note + "; " : "") + "almost no text layer found: this PDF is probably scanned images, OCR is not available here";
      }
    } else if (kind === "docx") {
      const r = await mammoth.extractRawText({ buffer: buf });
      text = r.value || "";
    } else if (kind === "text") {
      text = buf.toString("utf8");
    } else {
      return {
        name,
        ok: false,
        text: "",
        chars: 0,
        note: `not extracted (${f.mimetype || f.filetype || "unknown type"}): images, spreadsheets and PowerPoint are not read; ask for a PDF, Word or text version if the content matters`,
      };
    }
    text = normalise(text);
    if (text.length > MAX_CHARS_PER_FILE) {
      note = (note ? note + "; " : "") + `truncated to the first ${MAX_CHARS_PER_FILE} characters`;
      text = text.slice(0, MAX_CHARS_PER_FILE);
    }
    return { name, ok: true, text, chars: text.length, note };
  } catch (e: any) {
    return { name, ok: false, text: "", chars: 0, note: `extraction failed: ${e?.message || e}` };
  }
}

export function normalise(s: string): string {
  return s
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\u0000/g, "")
    .trim();
}

/** The block that goes into the user turn for one attachment. */
export function inlineBlock(x: ExtractedFile): string {
  if (!x.ok) return `[Attachment "${x.name}": ${x.note}]`;
  const head = x.text.slice(0, INLINE_CHARS_PER_FILE);
  const more = x.chars > INLINE_CHARS_PER_FILE ? `\n[... ${x.chars - INLINE_CHARS_PER_FILE} more characters; read the rest with read_source name="${x.name}"]` : "";
  const note = x.note ? ` (${x.note})` : "";
  return `[Attachment "${x.name}", ${x.chars} characters extracted${note}]\n${head}${more}\n[End of attachment "${x.name}"]`;
}
