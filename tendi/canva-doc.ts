/**
 * Fill a copy of a fixed-page Canva design (the Philea proposal doc) with new text,
 * keeping its typography. Two tools for the model:
 *
 *   canva_doc_map   open an editing session on the copy and list every text box
 *                   with a short key (p4.t2), its size and its text runs (r0, r1...),
 *                   each run with its style. Images are listed too (p1.i1).
 *   canva_doc_fill  apply edits by key, page by page, check the result (boxes that
 *                   grew past the page or into the box below), return a thumbnail
 *                   per edited page, and only save on finalize "commit".
 *
 * Why runs and not whole boxes: tested on 8 Oct 2026 on a copy of the Philea doc.
 * Canva's replace_text gives the whole box the style of its first run, so a box
 * with a grey label above body text turns into one grey label. find_and_replace
 * on one run keeps that run's style. Line breaks work in both find and replace.
 * A link on a run survives a find_and_replace, so old client links have to be
 * cleared (clear_links). Empty replacements are accepted. Text boxes grow
 * downwards when the text gets longer; nothing shrinks the font.
 *
 * The edits of the last fill are kept on disk so they can be re-applied when the
 * Canva editing session expired before Niels said yes.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { dataDir } from "./state.js";

export interface CanvaImage {
  data: string;
  mimeType: string;
}
export interface CallResult {
  text: string;
  isError: boolean;
  images?: CanvaImage[];
}
/** Calls a Canva MCP tool by its raw name ("read-design", "edit-design"). */
export type CanvaCaller = (tool: "read-design" | "edit-design", input: any) => Promise<CallResult>;

export interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}
export interface Run {
  i: number;
  text: string;
  style: string;
  link?: string;
}
export interface MapElement {
  key: string;
  locator: string;
  kind: "text" | "image" | "background";
  box: Box;
  runs?: Run[];
}
export interface MapPage {
  index: number;
  locator: string;
  width: number;
  height: number;
  editable: boolean;
  elements: MapElement[];
}
export interface DocMap {
  designId: string;
  transactionId: string;
  pages: MapPage[];
  at: number;
}

export interface FillEdit {
  key: string;
  /** New text per run index, e.g. {"1": "new body", "2": ""}. Keeps each run's style. */
  runs?: Record<string, string>;
  /** Whole new text, only for boxes with a single styled run. */
  text?: string;
  /** Remove every link (and underline) in this box. */
  clear_links?: boolean;
  /** Remove the element (text box or image). */
  delete?: boolean;
}
export interface PageReplace {
  /** Page index; omit for every page. */
  page?: number;
  find: string;
  replace: string;
}
export interface FillInput {
  design_id: string;
  edits?: FillEdit[];
  page_replace?: PageReplace[];
  finalize?: "keep_open" | "commit" | "cancel";
  reapply?: boolean;
  check_terms?: string[];
}

const round = (n: number) => Math.round(Number(n) || 0);

function styleOf(f: any): string {
  if (!f) return "";
  const parts = [`${Math.round((Number(f.fontSize) || 0) * 10) / 10}pt`];
  if (f.fontWeight === "bold") parts.push("bold");
  if (f.fontStyle === "italic") parts.push("italic");
  if (f.listMarker && f.listMarker !== "none") parts.push("bullet");
  if (f.color && !/^#0e0e0c$|^#000000$/i.test(f.color)) parts.push(String(f.color));
  return parts.join(" ");
}

function mediaFill(el: any): boolean {
  if (el?.fill?.media) return true;
  return Array.isArray(el?.paths) && el.paths.some((p: any) => p?.fill?.media);
}

function regionsOf(el: any): any[] {
  if (Array.isArray(el?.textRegions)) return el.textRegions;
  if (Array.isArray(el?.textContents)) return el.textContents.flatMap((t: any) => (Array.isArray(t?.textRegions) ? t.textRegions : []));
  return [];
}

/** Flatten groups: any nested object with its own locator_id is its own element. */
function flatten(elements: any[]): any[] {
  const out: any[] = [];
  for (const el of elements || []) {
    if (!el || typeof el !== "object") continue;
    out.push(el);
    for (const k of ["elements", "children", "contents"]) if (Array.isArray(el[k])) out.push(...flatten(el[k]));
  }
  return out;
}

export function parsePage(page: any, index: number): MapPage {
  const width = Number(page?.dimensions?.width) || 0;
  const height = Number(page?.dimensions?.height) || 0;
  const raw = flatten(page?.elements || []).filter((e) => e?.locator_id);
  const sorted = raw.slice().sort((a, b) => round(a.top / 8) - round(b.top / 8) || Number(a.left) - Number(b.left));
  const elements: MapElement[] = [];
  let t = 0;
  let im = 0;
  for (const el of sorted) {
    const box: Box = { top: Number(el.top) || 0, left: Number(el.left) || 0, width: Number(el.width) || 0, height: Number(el.height) || 0 };
    const regions = regionsOf(el);
    const hasText = regions.some((r: any) => String(r?.characters || "").trim());
    if (hasText) {
      t++;
      const runs: Run[] = regions.map((r: any, i: number) => ({
        i,
        text: String(r?.characters || ""),
        style: styleOf(r?.formatting),
        ...(r?.formatting?.link ? { link: String(r.formatting.link) } : {}),
      }));
      elements.push({ key: `p${index}.t${t}`, locator: el.locator_id, kind: "text", box, runs });
    } else if (mediaFill(el)) {
      const background = width && height && box.width * box.height >= 0.8 * width * height;
      im++;
      elements.push({ key: background ? `p${index}.bg${im}` : `p${index}.i${im}`, locator: el.locator_id, kind: background ? "background" : "image", box });
    }
  }
  return { index, locator: String(page?.id || page?.locator_id || ""), width, height, editable: page?.isEditable !== false, elements };
}

/** Pull the first JSON object out of a tool's text answer. */
export function parseJson(text: string): any {
  const s = String(text || "");
  const start = s.indexOf("{");
  if (start < 0) return null;
  for (let end = s.lastIndexOf("}"); end > start; end = s.lastIndexOf("}", end - 1)) {
    try {
      return JSON.parse(s.slice(start, end + 1));
    } catch {
      /* try a shorter slice */
    }
  }
  return null;
}

export function renderMap(map: DocMap): string {
  const lines = [
    `Design ${map.designId}, editing session ${map.transactionId}. Keys below are what canva_doc_fill takes. Runs (r0, r1...) are the styled pieces of a box: rewrite run by run to keep the styling; a run with internal line breaks can hold several paragraphs. Box sizes are in px; a box that must hold much more text than now will grow downwards.`,
  ];
  for (const p of map.pages) {
    lines.push("", `== Page ${p.index} (${round(p.width)}x${round(p.height)})${p.editable ? "" : " NOT EDITABLE"}`);
    for (const e of p.elements) {
      const b = `top ${round(e.box.top)}, left ${round(e.box.left)}, ${round(e.box.width)}x${round(e.box.height)}`;
      if (e.kind !== "text") {
        lines.push(`${e.key} ${e.kind} [${b}]`);
        continue;
      }
      const runs = (e.runs || []).filter((r) => r.text.trim());
      const chars = runs.reduce((n, r) => n + r.text.trim().length, 0);
      lines.push(`${e.key} [${b}] ${chars} chars`);
      for (const r of runs) lines.push(`  r${r.i} (${r.style}${r.link ? `, link ${r.link}` : ""}): ${JSON.stringify(r.text.replace(/\n+$/, ""))}`);
    }
  }
  return lines.join("\n");
}

// ---- storage ------------------------------------------------------------

const maps = new Map<string, DocMap>();
const lastFill = new Map<string, FillInput>();

function storeDir(): string {
  const d = path.join(dataDir(), "tendi-canva");
  try {
    mkdirSync(d, { recursive: true });
  } catch {
    /* read-only disk: memory only */
  }
  return d;
}
function save(designId: string): void {
  try {
    writeFileSync(path.join(storeDir(), `${designId}.json`), JSON.stringify({ map: maps.get(designId), fill: lastFill.get(designId) }));
  } catch {
    /* memory only */
  }
}
function load(designId: string): void {
  if (maps.has(designId)) return;
  try {
    const f = path.join(storeDir(), `${designId}.json`);
    if (!existsSync(f)) return;
    const j = JSON.parse(readFileSync(f, "utf8"));
    if (j.map) maps.set(designId, j.map);
    if (j.fill) lastFill.set(designId, j.fill);
  } catch {
    /* ignore */
  }
}
export function getMap(designId: string): DocMap | undefined {
  load(designId);
  return maps.get(designId);
}
/** Tests only. */
export function _setMap(map: DocMap): void {
  maps.set(map.designId, map);
}

// ---- turning edits into Canva operations ---------------------------------

export interface PagePlan {
  page: number;
  operations: any[];
  touched: string[];
  notes: string[];
}

function stripEnd(s: string): string {
  return s.replace(/\n+$/, "");
}

/** Build the Canva operations per page. Simulates find_and_replace (it hits every match in the box) to catch clashes. */
export function planFill(map: DocMap, edits: FillEdit[], pageReplace: PageReplace[] = []): { pages: PagePlan[]; problems: string[] } {
  const problems: string[] = [];
  const byKey = new Map<string, { page: MapPage; el: MapElement }>();
  for (const p of map.pages) for (const el of p.elements) byKey.set(el.key, { page: p, el });
  const plans = new Map<number, PagePlan>();
  const planFor = (n: number) => {
    if (!plans.has(n)) plans.set(n, { page: n, operations: [], touched: [], notes: [] });
    return plans.get(n)!;
  };

  for (const ed of edits || []) {
    const hit = byKey.get(String(ed.key || ""));
    if (!hit) {
      problems.push(`${ed.key}: no such key in the current map`);
      continue;
    }
    const { page, el } = hit;
    const plan = planFor(page.index);
    if (ed.delete) {
      plan.operations.push({ type: "delete_element", locator_id: el.locator });
      plan.touched.push(el.key);
      continue;
    }
    if (el.kind !== "text") {
      if (ed.runs || ed.text !== undefined) problems.push(`${ed.key}: is an image; only delete works on it`);
      continue;
    }
    const runs = el.runs || [];
    const styled = runs.filter((r) => r.text.trim());
    if (ed.text !== undefined) {
      const styles = new Set(styled.map((r) => r.style));
      if (styles.size > 1) {
        problems.push(`${ed.key}: has ${styles.size} different styles; give new text per run (runs) instead of text, or the whole box takes the style of its first run`);
      } else {
        plan.operations.push({ type: "replace_text", locator_id: el.locator, text: String(ed.text) });
        plan.touched.push(el.key);
      }
    }
    if (ed.runs && typeof ed.runs === "object") {
      let current = runs.map((r) => r.text).join("");
      const ops: { find: string; replace: string; idx: number }[] = [];
      for (const [k, v] of Object.entries(ed.runs)) {
        const idx = Number(String(k).replace(/^r/i, ""));
        const run = runs.find((r) => r.i === idx);
        if (!run || !run.text.trim()) {
          problems.push(`${ed.key}: run r${k} does not exist or is empty`);
          continue;
        }
        const find = stripEnd(run.text);
        const replace = stripEnd(String(v ?? ""));
        if (find === replace) continue;
        ops.push({ find, replace, idx });
      }
      // Longest first, so a short run that also sits inside a longer one does not cut it up.
      ops.sort((a, b) => b.find.length - a.find.length);
      for (const op of ops) {
        const count = current.split(op.find).length - 1;
        if (count === 0) {
          problems.push(`${ed.key} r${op.idx}: its text is no longer in the box (an earlier replacement changed it); skipped`);
          continue;
        }
        if (count > 1) plan.notes.push(`${ed.key} r${op.idx}: the same text appears ${count} times in this box, all were replaced`);
        current = current.split(op.find).join(op.replace);
        plan.operations.push({ type: "find_and_replace_text", locator_id: el.locator, find_text: op.find, replace_text: op.replace });
      }
      if (ops.length) plan.touched.push(el.key);
    }
    if (ed.clear_links) {
      plan.operations.push({ type: "format_text", locator_id: el.locator, formatting: { link: "", decoration: "none" } });
      if (!plan.touched.includes(el.key)) plan.touched.push(el.key);
    }
  }

  // Page-wide replacements go last, so they never break the run finds above.
  for (const pr of pageReplace || []) {
    if (!pr?.find) continue;
    const targets = pr.page ? map.pages.filter((p) => p.index === Number(pr.page)) : map.pages;
    if (!targets.length) problems.push(`page_replace: page ${pr.page} is not in the map`);
    for (const p of targets) {
      const hasIt = p.elements.some((e) => (e.runs || []).some((r) => r.text.includes(pr.find)));
      if (!hasIt && !pr.page) continue;
      planFor(p.index).operations.push({ type: "find_and_replace_text", locator_id: p.locator, find_text: pr.find, replace_text: String(pr.replace ?? "") });
    }
  }

  const pages = [...plans.values()].filter((p) => p.operations.length).sort((a, b) => a.page - b.page);
  return { pages, problems };
}

// ---- checking the result ------------------------------------------------

function overlapX(a: Box, b: Box): number {
  return Math.min(a.left + a.width, b.left + b.width) - Math.max(a.left, b.left);
}

/** Compare a page after editing with the map: boxes that grew past the page bottom or into what sits below them. */
export function fitWarnings(before: MapPage, afterPage: any, touched: string[]): string[] {
  const after = parsePage(afterPage, before.index);
  const byLoc = new Map(after.elements.map((e) => [e.locator, e]));
  const warnings: string[] = [];
  const bottomMargin = before.height ? before.height - 30 : Infinity;
  for (const key of touched) {
    const b = before.elements.find((e) => e.key === key);
    if (!b || b.kind !== "text") continue;
    const a = byLoc.get(b.locator);
    if (!a) continue;
    const grew = a.box.height - b.box.height;
    if (grew <= 2) continue;
    const newBottom = a.box.top + a.box.height;
    const oldBottom = b.box.top + b.box.height;
    if (newBottom > bottomMargin && oldBottom <= bottomMargin) warnings.push(`${key} grew ${round(grew)} px and now runs past the bottom of the page`);
    for (const other of before.elements) {
      if (other.key === key || other.kind === "background") continue;
      if (other.box.top < oldBottom - 1) continue; // only things that sat below it
      if (overlapX(b.box, other.box) < 10) continue;
      if (newBottom > other.box.top + 2) {
        const what = other.kind === "text" ? `${other.key} ("${stripEnd((other.runs || []).map((r) => r.text).join("")).slice(0, 40)}")` : `${other.key} (image)`;
        warnings.push(`${key} grew ${round(grew)} px and now overlaps ${what}`);
      }
    }
  }
  return warnings;
}

/** Where do these words still appear? Page text per page, case-insensitive. */
export function findTerms(pageTexts: { page: number; text: string }[], terms: string[]): string[] {
  const out: string[] = [];
  for (const term of terms.map((t) => String(t || "").trim()).filter(Boolean)) {
    const re = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const hits = pageTexts.filter((p) => re.test(p.text));
    if (!hits.length) continue;
    const first = hits[0];
    const m = first.text.search(re);
    const snippet = first.text.slice(Math.max(0, m - 40), m + term.length + 40).replace(/\s+/g, " ");
    out.push(`"${term}" still on page${hits.length > 1 ? "s" : ""} ${hits.map((h) => h.page).join(", ")} (e.g. "...${snippet}...")`);
  }
  return out;
}

/** Keys stay attached to the same element for the whole session, also after a delete shifts the numbering. */
export function rekey(updated: MapPage, before: MapPage): MapPage {
  const keyOf = new Map(before.elements.map((e) => [e.locator, e.key]));
  return { ...updated, elements: updated.elements.map((e) => ({ ...e, key: keyOf.get(e.locator) || `${e.key}n` })) };
}

// ---- the two tools -------------------------------------------------------

const PAGES_PER_READ = 4;

async function readPages(call: CanvaCaller, designId: string, pages: number[] | null, transactionId?: string): Promise<{ map?: DocMap; error?: string }> {
  // Page count first (cheap), opening the session at the same time when needed.
  const meta = await call("read-design", {
    design_id: designId,
    ...(transactionId ? { transaction_id: transactionId } : { open_transaction: true }),
    filter: { fields: ["page_metadata"] },
    user_intent: "Map the text boxes of the proposal copy before filling it",
  });
  if (meta.isError) return { error: `Canva read failed: ${meta.text.slice(0, 400)}` };
  const mj = parseJson(meta.text) || {};
  const txn = transactionId || mj?.transaction?.transaction_id;
  if (!txn) return { error: `Canva did not open an editing session: ${meta.text.slice(0, 300)}` };
  const total = Array.isArray(mj.page_metadata) ? mj.page_metadata.length : 0;
  const want = (pages && pages.length ? pages : Array.from({ length: total }, (_, i) => i + 1)).filter((n) => n >= 1 && (!total || n <= total));
  const out: MapPage[] = [];
  for (let i = 0; i < want.length; i += PAGES_PER_READ) {
    const chunk = want.slice(i, i + PAGES_PER_READ);
    const r = await call("read-design", { design_id: designId, transaction_id: txn, filter: { fields: ["design_content"], page_indices: chunk }, user_intent: "Map the text boxes of the proposal copy" });
    if (r.isError) return { error: `Canva read of pages ${chunk.join(",")} failed: ${r.text.slice(0, 300)}` };
    const j = parseJson(r.text);
    const got: any[] = j?.design_content?.pages || [];
    got.forEach((pg, k) => out.push(parsePage(pg, chunk[k] ?? chunk[0] + k)));
  }
  return { map: { designId, transactionId: txn, pages: out, at: Date.now() } };
}

export async function canvaDocMap(call: CanvaCaller, input: { design_id: string; pages?: number[] }): Promise<CallResult> {
  const designId = String(input?.design_id || "").trim();
  const prev = getMap(designId);
  const r = await readPages(call, designId, Array.isArray(input?.pages) ? input.pages.map(Number) : null);
  if (r.error || !r.map) return { isError: true, text: r.error || "Could not map the design." };
  // Merge with pages mapped earlier in the same session is not possible (new session), so replace.
  maps.set(designId, r.map);
  save(designId);
  const note = prev && prev.transactionId !== r.map.transactionId ? "\n(A new editing session was opened; keys from an earlier map still apply if nothing was saved since.)" : "";
  return { isError: false, text: renderMap(r.map) + note };
}

function expired(text: string): boolean {
  return /transaction|session/i.test(text) && /(expired|not found|invalid|no longer|unknown)/i.test(text);
}

export async function canvaDocFill(call: CanvaCaller, input: FillInput): Promise<CallResult> {
  const designId = String(input?.design_id || "").trim();
  let map = getMap(designId);
  if (!map) return { isError: true, text: "No map for this design. Call canva_doc_map first." };
  const finalize = input?.finalize || "keep_open";
  let edits = input?.edits || [];
  let pageReplace = input?.page_replace || [];
  const notes: string[] = [];

  if (input?.reapply) {
    const prev = lastFill.get(designId);
    if (!prev) return { isError: true, text: "Nothing stored to re-apply for this design." };
    const fresh = await readPages(call, designId, map.pages.map((p) => p.index));
    if (fresh.error || !fresh.map) return { isError: true, text: fresh.error || "Could not reopen the design." };
    map = fresh.map;
    maps.set(designId, map);
    edits = prev.edits || [];
    pageReplace = prev.page_replace || [];
    notes.push(`Re-applied the stored edits in a new editing session (${map.transactionId}).`);
  }

  const images: CanvaImage[] = [];
  const report: string[] = [];
  let applied = 0;

  if (edits.length || pageReplace.length) {
    const { pages, problems } = planFill(map, edits, pageReplace);
    for (const p of problems) report.push(`⚠ ${p}`);
    for (const plan of pages) {
      const before = map.pages.find((p) => p.index === plan.page)!;
      let lastPage: any = null;
      const errors: string[] = [];
      for (let i = 0; i < plan.operations.length; i += 30) {
        const ops = plan.operations.slice(i, i + 30);
        const r = await call("edit-design", { transaction_id: map.transactionId, page_index: plan.page, operations: ops, finalize: "keep_open", user_intent: "Fill the proposal copy with the approved text" });
        if (r.isError) {
          if (expired(r.text)) return { isError: true, text: `The Canva editing session has expired. Call canva_doc_fill again with reapply: true (and the same finalize) to redo the stored edits in a new session.\n${r.text.slice(0, 200)}` };
          errors.push(r.text.slice(0, 300));
          continue;
        }
        const j = parseJson(r.text);
        for (const res of j?.edit_operation_results || []) if (res?.status && !/applied/.test(res.status)) errors.push(`${res.operation_info?.type || "operation"}: ${res.status} ${res.message || ""}`.trim());
        applied += ops.length;
        if (j?.document?.page) lastPage = j.document.page;
        if (r.images?.length) {
          // keep only the latest thumbnail of this page
          if (i + 30 >= plan.operations.length) images.push(r.images[r.images.length - 1]);
        }
      }
      const warns = lastPage ? fitWarnings(before, lastPage, plan.touched) : [];
      report.push(`Page ${plan.page}: ${plan.operations.length} change${plan.operations.length === 1 ? "" : "s"}${errors.length ? `, ${errors.length} problem(s)` : ""}`);
      for (const e of errors) report.push(`  ✗ ${e}`);
      for (const w of warns) report.push(`  ⚠ ${w}`);
      for (const n of plan.notes) report.push(`  · ${n}`);
      if (lastPage) {
        // Keep the map in step with the edited page, so a second fill in the same session sees the new text.
        const updated = rekey(parsePage(lastPage, plan.page), before);
        map.pages = map.pages.map((p) => (p.index === plan.page ? updated : p));
      }
    }
    if (!input?.reapply) {
      const prev = lastFill.get(designId);
      lastFill.set(designId, { design_id: designId, edits: [...(prev?.edits || []), ...edits], page_replace: [...(prev?.page_replace || []), ...pageReplace] });
    }
    maps.set(designId, map);
    save(designId);
  }

  if (finalize === "cancel") {
    const r = await call("edit-design", { transaction_id: map.transactionId, finalize: "cancel", user_intent: "Discard the draft changes on the proposal copy" });
    lastFill.delete(designId);
    save(designId);
    return { isError: r.isError, text: r.isError ? `Cancel failed: ${r.text.slice(0, 300)}` : "Draft changes discarded. Nothing was saved." };
  }

  if (finalize === "commit") {
    const r = await call("edit-design", { transaction_id: map.transactionId, finalize: "commit", user_intent: "Save the approved changes to the proposal copy" });
    if (r.isError) {
      if (expired(r.text)) return { isError: true, text: "The Canva editing session expired before saving. Call canva_doc_fill with reapply: true and finalize: \"commit\"." };
      return { isError: true, text: `Saving failed: ${r.text.slice(0, 400)}` };
    }
    report.push("Saved in Canva.");
    lastFill.delete(designId);
    save(designId);
    const terms = (input?.check_terms || []).filter(Boolean);
    if (terms.length) {
      const texts: { page: number; text: string }[] = [];
      for (const p of map.pages) {
        const rr = await call("read-design", { design_id: designId, filter: { fields: ["design_content"], page_indices: [p.index] }, user_intent: "Check the saved copy for leftover template text" });
        if (rr.isError) continue;
        const j = parseJson(rr.text);
        const c = j?.design_content;
        texts.push({ page: p.index, text: typeof c === "string" ? c : JSON.stringify(c || "") });
      }
      const left = findTerms(texts, terms);
      report.push(left.length ? "Leftovers found:" : `No leftovers found for: ${terms.join(", ")}.`);
      for (const l of left) report.push(`  ⚠ ${l}`);
    }
  } else if (applied) {
    report.push(`Not saved yet: the changes sit in editing session ${map.transactionId}. Look at the thumbnails, fix what is off with another canva_doc_fill, then show Niels a short preview and save with finalize "commit" on his yes.`);
  }

  return { isError: false, text: [...notes, ...report].join("\n") || "Nothing to do.", images: images.slice(-24) };
}
