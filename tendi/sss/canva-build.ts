/**
 * Build this week's carousel from the master Canva template, through Tendi's own
 * Canva MCP connection (CanvaBridge, Niels's login).
 *
 * Tool names are the newer generation (copy-design, read-design with
 * open_transaction, edit-design, create-upload-url, export-design). Tendi's
 * connection had the older editing tools on 8 Oct 2026 (start-editing-transaction
 * and friends); if it still does, the build stops with a clear message instead of
 * guessing, and the Slack post says so. canva_status lists the tools Tendi sees.
 *
 * Never edits the master design, never replaces the page 2 photo.
 */
import map from "./template-map.json";
import { SSS } from "./config.js";
import { parseJson, withRetry, type CallResult } from "../canva-doc.js";
import { downloadPdf, exportArgs } from "../canva-export.js";
import type { Deck } from "./validate-copy.js";
import type { LogoVariants } from "./logo-finder.js";

/** What the job needs from Tendi's Canva connection: raw tool names, text answers. */
export interface CanvaLike {
  call: (rawTool: string, input: any) => Promise<CallResult>;
  has: (rawTool: string) => boolean;
  schema?: (rawTool: string) => any;
  /** Connect if the connection dropped (CanvaBridge only lists tools once connected). */
  ensure?: () => Promise<void>;
}

export const TOOLS = {
  copy: "copy-design",
  read: "read-design",
  edit: "edit-design",
  uploadUrl: "create-upload-url",
  export: "export-design",
};

const pages: Record<string, string> = map.pages;
const loc = (page: number | string, id: string) => `${pages[String(page)]}-${id}`;
const intent = (s: string) => ({ user_intent: s.slice(0, 250) });

export function missingTools(canva: CanvaLike): string[] {
  return Object.values(TOOLS).filter((t) => !canva.has(t));
}

/** Call a tool and parse its JSON answer; a Canva error becomes an exception. */
async function callJson(canva: CanvaLike, tool: string, input: any): Promise<any> {
  const call = withRetry((t, i) => canva.call(t, i));
  const r = await call(tool, input);
  if (r.isError) throw new Error(`Canva ${tool} failed: ${r.text.slice(0, 400)}`);
  return parseJson(r.text) ?? { _text: r.text };
}

/** Upload a PNG and return its Canva asset id. Only application/octet-stream works (image/png gives 415). Each URL works once. */
export async function uploadPng(canva: CanvaLike, buffer: Buffer, what: string): Promise<string> {
  const j = await callJson(canva, TOOLS.uploadUrl, intent(`Upload ${what} for Scale & Sustain Stories`));
  const uploadUrl = j.upload_url || j.uploadUrl || j.url || (String(j._text || JSON.stringify(j)).match(/https:\/\/[^\s"'<>\\]+/) || [])[0];
  if (!uploadUrl) throw new Error(`Canva gave no upload URL. Its answer began: ${JSON.stringify(j).slice(0, 300)}`);
  const res = await fetch(uploadUrl, { method: "POST", headers: { "Content-Type": "application/octet-stream" }, body: new Uint8Array(buffer) });
  const body = await res.text();
  if (!res.ok) throw new Error(`Canva upload failed (${res.status}): ${body.slice(0, 300)}`);
  const id = assetIdFrom(body);
  if (!id) throw new Error(`Canva upload worked but I could not find the asset id in its answer: ${body.slice(0, 300)}`);
  return id;
}

/** The asset id in the upload answer. Shape not documented in the tool text, so look in the usual places. */
export function assetIdFrom(body: string): string | null {
  let j: any = null;
  try {
    j = JSON.parse(body);
  } catch {
    j = parseJson(body);
  }
  if (j) {
    const direct = j.mediaId || j.media_id || j.asset_id || j.assetId || j.asset?.id || j.media?.id || j.id;
    if (typeof direct === "string" && direct) return direct;
    for (const v of Object.values(j)) {
      if (v && typeof v === "object") {
        const inner: any = v;
        const x = inner.mediaId || inner.media_id || inner.asset_id || inner.assetId || inner.id;
        if (typeof x === "string" && x) return x;
      }
    }
  }
  const m = String(body).match(/"(?:mediaId|media_id|asset_id|assetId)"\s*:\s*"([^"]+)"/);
  return m ? m[1] : null;
}

async function edit(canva: CanvaLike, tx: string, page: number, operations: any[], what: string): Promise<any> {
  const res = await callJson(canva, TOOLS.edit, { transaction_id: tx, page_index: page, operations, finalize: "keep_open", ...intent(what) });
  const failed = (res.edit_operation_results || []).filter((r: any) => /fail|error/i.test(String(r?.status || "")));
  if (failed.length) throw new Error(`Canva edit on page ${page} failed: ${failed.map((f: any) => f.error?.message || f.message || f.status).join("; ")}`);
  return res;
}

export interface LogoSlot {
  page: number;
  id: string;
  colour: string;
  top: number;
  left: number;
  height: number;
  maxWidth: number;
}

/** Remove the template's logo (if still there) and place the new one at the same spot, height fixed, width from the aspect ratio. */
export function logoOps(slot: LogoSlot, mediaId: string | null, aspect: number, { deleteOld = true } = {}): any[] {
  let height = slot.height;
  let width = height * aspect;
  if (width > slot.maxWidth) {
    width = slot.maxWidth;
    height = width / aspect;
  }
  const ops: any[] = [];
  if (deleteOld) ops.push({ type: "delete_element", locator_id: loc(slot.page, slot.id) });
  if (mediaId) {
    ops.push({
      type: "insert_fill",
      page_id: pages[String(slot.page)],
      asset_type: "image",
      asset_id: mediaId,
      alt_text: "Organisation logo",
      top: slot.top + (slot.height - height) / 2,
      left: slot.left,
      width: Math.round(width * 100) / 100,
      height: Math.round(height * 100) / 100,
    });
  }
  return ops;
}

/** Text operations per page, from a validated deck. */
export function textOps(deck: Deck, { title }: { title?: string } = {}): Record<number, any[]> {
  const T: any = map.text;
  const ops: Record<number, any[]> = {
    1: [
      ...(title ? [{ type: "update_title", title }] : []),
      { type: "replace_text", locator_id: loc(1, T.coverHeadline.id), text: deck.cover.headline },
      { type: "replace_text", locator_id: loc(1, T.coverSub.id), text: deck.cover.subheadline },
    ],
    2: [
      { type: "replace_text", locator_id: loc(2, T.whoStatement.id), text: deck.who.statement },
      { type: "replace_text", locator_id: loc(2, T.whoParagraph.id), text: deck.who.paragraph },
    ],
    3: [
      { type: "replace_text", locator_id: loc(3, T.howStatement.id), text: deck.how.statement },
      { type: "replace_text", locator_id: loc(3, T.howParagraph.id), text: deck.how.paragraph },
    ],
    4: deck.timeline.flatMap((s, i) => {
      const row = map.timeline[i];
      return [
        // The pills are shapes with text inside: find_and_replace_text works on them.
        { type: "find_and_replace_text", locator_id: loc(4, row.pill), find_text: row.pillMasterText, replace_text: s.pill },
        { type: "replace_text", locator_id: loc(4, row.header), text: s.header },
        { type: "replace_text", locator_id: loc(4, row.text), text: s.text },
      ];
    }),
    9: [{ type: "replace_text", locator_id: loc(9, T.ctaParagraph.id), text: SSS.ctaParagraph }],
    11: [
      { type: "replace_text", locator_id: loc(11, T.caption.id), text: deck.caption },
      { type: "format_text", locator_id: loc(11, T.caption.id), formatting: { font_size: T.caption.fontSize } },
    ],
  };
  deck.takeaways.forEach((t, i) => {
    const slot = map.takeaways[i];
    ops[slot.page] = [
      { type: "replace_text", locator_id: loc(slot.page, slot.lesson), text: t.lesson },
      { type: "replace_text", locator_id: loc(slot.page, slot.support), text: t.support },
    ];
  });
  return ops;
}

function findElement(res: any, id: string): any {
  const stack: any[] = [res?.document?.page, res?.page, res?.document].filter(Boolean);
  while (stack.length) {
    const x = stack.pop();
    if (!x || typeof x !== "object") continue;
    if (x.id === id || (typeof x.locator_id === "string" && x.locator_id.endsWith(`-${id}`))) return x;
    for (const v of Object.values(x)) if (v && typeof v === "object") stack.push(v);
  }
  return null;
}

async function openTransaction(canva: CanvaLike, designId: string, what: string): Promise<string> {
  const read = await callJson(canva, TOOLS.read, { design_id: designId, open_transaction: true, filter: { fields: ["page_metadata"], page_indices: [1] }, ...intent(what) });
  const tx = read?.transaction?.transaction_id || read?.transaction_id;
  if (!tx) throw new Error(`Canva did not open an editing session on ${designId}. Its answer began: ${JSON.stringify(read).slice(0, 300)}`);
  return String(tx);
}

async function designUrls(canva: CanvaLike, designId: string): Promise<{ edit_url?: string; view_url?: string }> {
  try {
    const j = await callJson(canva, TOOLS.read, { design_id: designId, filter: { fields: ["design_metadata"] }, ...intent("Get the links of the new Scale & Sustain Stories design") });
    return j?.design_metadata?.urls || j?.urls || {};
  } catch {
    return {};
  }
}

export interface BuiltPost {
  designId: string;
  title: string;
  editUrl: string;
  pdf: Buffer | null;
  cover: Buffer | null;
  exportNote?: string;
}

/**
 * Build the post. logo is null when none could be found: the template's logos are
 * removed so no other organisation's logo ever shows, and Tendi asks for the file in Slack.
 * The new copy is filed in the shared Peak Nine folder by CanvaBridge itself (TENDI_CANVA_FOLDER_ID).
 */
export async function buildPost({ canva, deck, issueNo, org, logo }: { canva: CanvaLike; deck: Deck; issueNo: number; org: string; logo: LogoVariants | null }): Promise<BuiltPost> {
  await canva.ensure?.();
  const missing = missingTools(canva);
  if (missing.length) throw new Error(`Tendi's Canva connection lacks ${missing.join(", ")} (it may still have the older editing tools); reconnect Canva with npm run tendi:canva-login and check canva_status`);
  const title = SSS.designTitle(issueNo, org);
  const copy = await callJson(canva, TOOLS.copy, { design_id: map.masterDesignId, ...intent(`Copy the Scale & Sustain master for ${title}`) });
  const designId: string | undefined =
    copy?.design?.id || copy?.design_id || copy?.id || (JSON.stringify(copy).match(/\b(D(?!AHZT4MaY2s)[A-Za-z0-9_-]{10})\b/) || [])[1];
  if (!designId || designId === map.masterDesignId) throw new Error(`could not read the new design id from Canva's copy answer: ${JSON.stringify(copy).slice(0, 300)}`);
  const urls = copy?.design?.urls?.edit_url ? copy.design.urls : await designUrls(canva, designId);

  const tx = await openTransaction(canva, designId, `Open ${title} for filling`);

  let blackId: string | null = null;
  let whiteId: string | null = null;
  if (logo) {
    blackId = await uploadPng(canva, logo.black, `${org} logo (black)`);
    whiteId = await uploadPng(canva, logo.white, `${org} logo (white)`);
  }

  const ops = textOps(deck, { title });
  for (const slot of map.logos as LogoSlot[]) {
    const media = slot.colour === "black" ? blackId : whiteId;
    ops[slot.page] = [...(ops[slot.page] || []), ...logoOps(slot, media, logo?.aspect || 1)];
  }

  try {
    for (const page of Object.keys(ops)
      .map(Number)
      .sort((a, b) => a - b)) {
      const res = await edit(canva, tx, page, ops[page], `Fill page ${page} of ${title}`);
      if (page === 3) {
        // Keep a fixed gap under the "how" statement, whatever its length.
        const st = findElement(res, map.text.howStatement.id);
        if (st && Number.isFinite(Number(st.top)) && Number.isFinite(Number(st.height))) {
          await edit(
            canva,
            tx,
            3,
            [{ type: "position_element", locator_id: loc(3, map.text.howParagraph.id), top: Math.round(Number(st.top) + Number(st.height) + map.text.howParagraph.gapBelowStatement), left: map.text.howParagraph.left }],
            `Space the page 3 paragraph of ${title}`,
          );
        }
      }
    }
    await callJson(canva, TOOLS.edit, { transaction_id: tx, finalize: "commit", ...intent(`Save ${title}`) });
  } catch (e) {
    await canva.call(TOOLS.edit, { transaction_id: tx, finalize: "cancel", ...intent("Discard the failed Scale & Sustain build") }).catch(() => undefined);
    throw e;
  }

  const files = await exportFiles(canva, designId);
  return { designId, title, editUrl: urls.edit_url || urls.view_url || `https://www.canva.com/design/${designId}/edit`, ...files };
}

/** Add the logo later, when a person has posted the file in the Slack thread. */
export async function addLogoLater({ canva, designId, logo, org }: { canva: CanvaLike; designId: string; logo: LogoVariants; org: string }) {
  if (designId === map.masterDesignId) throw new Error("refusing to edit the master design");
  await canva.ensure?.();
  const tx = await openTransaction(canva, designId, `Open the ${org} post to add the logo`);
  const blackId = await uploadPng(canva, logo.black, `${org} logo (black)`);
  const whiteId = await uploadPng(canva, logo.white, `${org} logo (white)`);
  try {
    for (const slot of map.logos as LogoSlot[]) {
      await edit(canva, tx, slot.page, logoOps(slot, slot.colour === "black" ? blackId : whiteId, logo.aspect, { deleteOld: false }), `Add the ${org} logo on page ${slot.page}`);
    }
    await callJson(canva, TOOLS.edit, { transaction_id: tx, finalize: "commit", ...intent(`Save the ${org} logo`) });
  } catch (e) {
    await canva.call(TOOLS.edit, { transaction_id: tx, finalize: "cancel", ...intent("Discard") }).catch(() => undefined);
    throw e;
  }
  return exportFiles(canva, designId);
}

/** Download link in an export answer. Seen on 6 Nov 2026: {"job":{"id":..,"status":"success","urls":["https://export-download.canva.com/..."]}}. */
export function exportUrl(j: any): string | null {
  const u = j?.job?.urls?.[0] || j?.urls?.[0] || j?.url || j?.download_url;
  if (u) return String(u);
  const m = JSON.stringify(j || {}).match(/https:\/\/export-download\.canva\.com[^"\\]+/);
  return m ? m[0] : null;
}

async function exportOne(canva: CanvaLike, designId: string, type: "pdf" | "png", pageList: number[], what: string): Promise<string | null> {
  let args: any;
  if (type === "pdf") args = exportArgs(canva.schema?.(TOOLS.export), designId, pageList, null);
  else args = { design_id: designId, format: { type: "png", pages: pageList } };
  for (let attempt = 0; attempt < 3; attempt++) {
    const j = await callJson(canva, TOOLS.export, { ...args, ...intent(what) });
    const url = exportUrl(j);
    if (url) return url;
    if (j?.job?.status && !/progress|pending/i.test(String(j.job.status))) return null;
    await new Promise((r) => setTimeout(r, 5000));
  }
  return null;
}

/** Pages 1 to 10 as one PDF (the LinkedIn document, without the caption page 11) and page 1 as PNG (the Slack preview). */
export async function exportFiles(canva: CanvaLike, designId: string): Promise<{ pdf: Buffer | null; cover: Buffer | null; exportNote?: string }> {
  await canva.ensure?.();
  const notes: string[] = [];
  let pdf: Buffer | null = null;
  let cover: Buffer | null = null;
  try {
    const url = await exportOne(canva, designId, "pdf", map.exportPages, "Export the Scale & Sustain LinkedIn PDF, pages 1 to 10");
    if (url) pdf = await downloadPdf(url);
    else notes.push("the PDF export returned no link");
  } catch (e: any) {
    notes.push(`PDF export failed: ${e?.message || e}`);
  }
  try {
    const url = await exportOne(canva, designId, "png", [1], "Export the Scale & Sustain cover image for Slack");
    if (url) {
      const r = await fetch(url, { signal: AbortSignal.timeout(60_000) });
      if (r.ok) cover = Buffer.from(await r.arrayBuffer());
      else notes.push(`cover download HTTP ${r.status}`);
    } else notes.push("the cover export returned no link");
  } catch (e: any) {
    notes.push(`cover export failed: ${e?.message || e}`);
  }
  return { pdf, cover, ...(notes.length ? { exportNote: notes.join("; ") } : {}) };
}
