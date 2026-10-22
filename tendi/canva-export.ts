/**
 * Helpers for the deliver_canva_pdf tool: find the download link in Canva's
 * export answer and fetch the PDF (checked to really be a PDF, size-capped).
 * Canva's export answer looks like {"job":{"status":"success","urls":["https://export-download.canva.com/...pdf?X-Amz-..."]}}
 * (seen on 8 Oct 2026). The link is temporary, so Tendi uploads the file to Slack.
 */

/** The download link in Canva's export answer (JSON or text). */
export function pickDownloadUrl(text: string): string | null {
  const urls = String(text || "").match(/https:\/\/[^\s"'<>\\)]+/g) || [];
  const clean = urls.map((u) => u.replace(/[.,;]+$/, ""));
  return clean.find((u) => /export|download|\.pdf/i.test(u) && !/canva\.com\/design\//i.test(u)) || null;
}

export async function downloadPdf(url: string, maxBytes = 60 * 1024 * 1024): Promise<Buffer> {
  const u = new URL(url);
  if (u.protocol !== "https:") throw new Error("export link is not https");
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 90_000);
  try {
    const res = await fetch(u, { signal: ctrl.signal, redirect: "follow" });
    if (!res.ok) throw new Error(`download HTTP ${res.status}`);
    const len = Number(res.headers.get("content-length") || 0);
    if (len > maxBytes) throw new Error(`PDF too large for Slack upload (${len} bytes)`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > maxBytes) throw new Error(`PDF too large (${buf.length} bytes)`);
    if (buf.subarray(0, 5).toString("latin1") !== "%PDF-") throw new Error("the download is not a PDF (the export may not be ready)");
    return buf;
  } finally {
    clearTimeout(t);
  }
}


/**
 * Arguments for Canva's export-design, shaped after the tool's own input schema:
 * the newer tool takes format as an object {type, pages, size}; an older one may
 * take format as a plain string with pages and size beside it.
 */
export function exportArgs(schema: any, designId: string, pages: number[] | null, size: string | null): Record<string, any> {
  const props = schema?.properties || {};
  const fmt = props.format;
  const fmtIsString = fmt && (fmt.type === "string" || Array.isArray(fmt.enum));
  if (fmtIsString) {
    const out: Record<string, any> = { design_id: designId, format: "pdf" };
    if (pages && props.pages) out.pages = pages;
    if (size && props.size) out.size = size;
    return out;
  }
  const format: Record<string, any> = { type: "pdf" };
  if (pages) format.pages = pages;
  if (size) format.size = size;
  return { design_id: designId, format };
}
