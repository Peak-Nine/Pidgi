// Scout's tender PDF reader. Runs as its own short-lived Node process, one PDF at
// a time, so a heavy PDF can never take Tendi down (on 8 Oct 2026 reading PDFs
// inside the main process pushed it past Render's 512 MB limit twice).
//
//   node --max-old-space-size=160 pdf-pages.mjs <file.pdf> [maxPages]
//
// It reads the cover and the table of contents (pages 1 to 4), finds where the
// decisive sections start (award criteria, terms of reference, selection file),
// reads only those pages and prints one JSON line on stdout:
//   {"ok":true,"total":43,"pages":[1,2,3,14,25,...],"sections":{...},"text":"..."}
// Measured on two Enabel tenders: about 150 MB peak for this process.
import { readFileSync, writeFileSync } from "fs";

// If memory runs short, the kernel should kill this helper, not Tendi.
try {
  writeFileSync("/proc/self/oom_score_adj", "1000");
} catch {
  /* not Linux, or not allowed: fine */
}

const SECTION_PATTERNS = {
  award: /(award criteria|crit[eè]res d.attribution|gunningscriteria)/i,
  tor: /(terms of reference|termes de r[ée]f[ée]rence|technical specifications|sp[ée]cifications techniques|technische specificaties)/i,
  selection: /(selection file|dossier de s[ée]lection|selectiedossier|qualitative selection|s[ée]lection qualitative)/i,
};

/** Table-of-contents lines look like "5 Terms of reference ........ 25". */
export function tocEntries(text) {
  const out = [];
  for (const line of String(text).split(/\n/)) {
    const m = line.match(/^\s*(.+?)\s*\.{4,}\s*(\d{1,3})\s*$/);
    if (m) out.push({ title: m[1].trim(), page: Number(m[2]) });
  }
  return out;
}

/** Which pages to read, given the TOC entries and the page count. */
export function pickPages(entries, total, maxPages = 12) {
  const find = (rx) => entries.find((e) => rx.test(e.title))?.page;
  const award = find(SECTION_PATTERNS.award);
  const tor = find(SECTION_PATTERNS.tor);
  // Prefer the chapter-level "Selection file" over the clause "Qualitative selection".
  const selection = entries.find((e) => /(selection file|dossier de s[ée]lection|selectiedossier)/i.test(e.title))?.page ?? find(SECTION_PATTERNS.selection);
  const chapterStarts = entries.filter((e) => /^\d+\s+\S/.test(e.title)).map((e) => e.page).sort((a, b) => a - b);
  const nextChapterAfter = (p) => chapterStarts.find((c) => c > p);
  const pages = new Set([1, 2]);
  const addRange = (from, to) => {
    for (let p = from; p <= to; p++) if (p >= 1 && p <= total) pages.add(p);
  };
  if (award) addRange(award, award + 1);
  if (tor) addRange(tor, Math.min(tor + 5, (nextChapterAfter(tor) || tor + 6) - 1));
  if (selection) addRange(selection, Math.min(selection + 2, (nextChapterAfter(selection) || selection + 3) - 1));
  const list = [...pages].sort((a, b) => a - b).slice(0, maxPages);
  return { pages: list, sections: { award: award ?? null, tor: tor ?? null, selection: selection ?? null } };
}

async function main() {
  const file = process.argv[2];
  const maxPages = Number(process.argv[3]) || 12;
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: new Uint8Array(readFileSync(file)) });
  try {
    const head = await parser.getText({ first: 4 });
    const total = head.total || 0;
    const entries = tocEntries(head.text);
    const pick = entries.length ? pickPages(entries, total, maxPages) : { pages: [1, 2, 3].filter((p) => p <= total), sections: {} };
    const body = await parser.getText({ partial: pick.pages });
    const text = (body.pages || [])
      .map((p) => `[page ${p.num}]\n${String(p.text || "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim()}`)
      .join("\n\n");
    process.stdout.write(JSON.stringify({ ok: true, total, pages: pick.pages, sections: pick.sections, toc: entries.length, text }) + "\n");
  } finally {
    await parser.destroy().catch(() => undefined);
  }
}

if (process.argv[1] && process.argv[1].endsWith("pdf-pages.mjs")) {
  main().catch((e) => {
    process.stdout.write(JSON.stringify({ ok: false, error: String((e && e.message) || e).slice(0, 300) }) + "\n");
    process.exit(1);
  });
}
