/**
 * Word (.docx) builder for Tendi, in the Peak Nine document design:
 *   - Funnel Display for headings, Funnel Sans for body (Word substitutes if the
 *     fonts are not installed on the reader's machine)
 *   - page background #F0E7DD, dark green #1E3A2F table headers and labels
 *   - small-caps section labels above headings
 *   - footer "Peak Nine for <client> · <subtitle>" with page numbers
 *
 * The model hands over a structured DocSpec (never raw Word XML), this module
 * turns it into a Buffer. Inline *bold* and **bold** segments are supported.
 */
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  HeadingLevel,
  LevelFormat,
  PageBreak,
  PageNumber,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";

export type DocBlock =
  | { type: "paragraph"; text: string }
  | { type: "subheading"; text: string }
  | { type: "bullets"; items: string[] }
  | { type: "numbered"; items: string[] }
  | { type: "table"; header: string[]; rows: string[][] }
  | { type: "callout"; text: string }
  | { type: "page_break" };

export interface DocSection {
  label?: string;
  heading: string;
  blocks: DocBlock[];
}

export interface DocSpec {
  title: string;
  subtitle?: string;
  client: string;
  question?: string;
  date?: string;
  meta?: string[];
  sections: DocSection[];
}

const GREEN = "1E3A2F";
const SAND = "F0E7DD";
const INK = "1A1A1A";
const MUTED = "5B5B5B";
const HEAD_FONT = "Funnel Display";
const BODY_FONT = "Funnel Sans";

export const DOC_SPEC_SCHEMA = {
  type: "object",
  properties: {
    filename: { type: "string", description: 'File name ending in .docx, e.g. "Acme - Peak Nine Proposal.docx". No em dashes.' },
    spec: {
      type: "object",
      description: "The document content. Client-facing prose in Peak Nine voice.",
      properties: {
        title: { type: "string", description: 'Cover title, e.g. "Peak Nine for Acme"' },
        subtitle: { type: "string", description: 'Cover subtitle, e.g. "Technical and financial proposal" or the program type' },
        client: { type: "string", description: "Client name, used in the footer" },
        question: { type: "string", description: 'Optional "How might we ..." line on the cover' },
        date: { type: "string", description: 'Date line on the cover, e.g. "7 October 2026"' },
        meta: { type: "array", items: { type: "string" }, description: "Extra cover lines (company line, contact line). Defaults to the Peak Nine company and contact lines." },
        sections: {
          type: "array",
          items: {
            type: "object",
            properties: {
              label: { type: "string", description: 'Small-caps label above the heading, e.g. "The context"' },
              heading: { type: "string" },
              blocks: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string", enum: ["paragraph", "subheading", "bullets", "numbered", "table", "callout", "page_break"] },
                    text: { type: "string", description: "paragraph / subheading / callout text. **bold** segments allowed." },
                    items: { type: "array", items: { type: "string" }, description: "bullets / numbered items" },
                    header: { type: "array", items: { type: "string" }, description: "table header cells" },
                    rows: { type: "array", items: { type: "array", items: { type: "string" } }, description: "table body rows" },
                  },
                  required: ["type"],
                },
              },
            },
            required: ["heading", "blocks"],
          },
        },
      },
      required: ["title", "client", "sections"],
    },
  },
  required: ["filename", "spec"],
} as const;

const DEFAULT_META = [
  "Peak Nine BV · BE 1028.521.286 · Posthofbrug 6 bus 5, 2600 Antwerpen · peaknine.studio",
  "Contact: Niels Van Espen · niels@peaknine.studio · +32 476 90 02 04",
];

// Turn "text with **bold** and *bold*" into TextRuns.
export function runs(text: string, base: Partial<ConstructorParameters<typeof TextRun>[0] & object> = {}): TextRun[] {
  const out: TextRun[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*\n]+\*)/g;
  let last = 0;
  const s = String(text ?? "");
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    if (m.index > last) out.push(new TextRun({ text: s.slice(last, m.index), font: BODY_FONT, color: INK, size: 22, ...(base as any) }));
    const inner = m[0].replace(/^\*\*|\*\*$/g, "").replace(/^\*|\*$/g, "");
    out.push(new TextRun({ text: inner, bold: true, font: BODY_FONT, color: INK, size: 22, ...(base as any) }));
    last = m.index + m[0].length;
  }
  if (last < s.length) out.push(new TextRun({ text: s.slice(last), font: BODY_FONT, color: INK, size: 22, ...(base as any) }));
  if (!out.length) out.push(new TextRun({ text: "", font: BODY_FONT, size: 22 }));
  return out;
}

function label(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 360, after: 60 },
    children: [new TextRun({ text: text.toUpperCase(), font: HEAD_FONT, color: GREEN, size: 16, characterSpacing: 60, bold: true })],
  });
}

function heading(text: string, level: (typeof HeadingLevel)[keyof typeof HeadingLevel] = HeadingLevel.HEADING_1): Paragraph {
  const size = level === HeadingLevel.HEADING_1 ? 40 : 28;
  return new Paragraph({
    heading: level,
    spacing: { before: level === HeadingLevel.HEADING_1 ? 120 : 240, after: 160 },
    children: [new TextRun({ text, font: HEAD_FONT, color: GREEN, size, bold: true })],
  });
}

function para(text: string): Paragraph {
  return new Paragraph({ spacing: { after: 160, line: 300 }, children: runs(text) });
}

function callout(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 120, after: 200, line: 300 },
    indent: { left: 360, right: 360 },
    border: { left: { style: BorderStyle.SINGLE, size: 18, color: GREEN, space: 12 } },
    children: runs(text, { italics: true, color: GREEN } as any),
  });
}

function list(items: string[], reference: "tendi-bullets" | "tendi-numbers"): Paragraph[] {
  return (items || []).map(
    (t) =>
      new Paragraph({
        numbering: { reference, level: 0 },
        spacing: { after: 80, line: 290 },
        children: runs(String(t)),
      })
  );
}

function cell(text: string, opts: { header?: boolean; width?: number } = {}): TableCell {
  const color = opts.header ? "FFFFFF" : INK;
  return new TableCell({
    shading: opts.header ? { type: ShadingType.CLEAR, fill: GREEN, color: GREEN } : undefined,
    margins: { top: 90, bottom: 90, left: 120, right: 120 },
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    children: [
      new Paragraph({
        spacing: { after: 0, line: 260 },
        children: runs(text, { color, bold: !!opts.header, size: 20 } as any),
      }),
    ],
  });
}

function table(header: string[], rows: string[][]): Table {
  const cols = Math.max(header?.length || 0, ...(rows || []).map((r) => r.length), 1);
  const width = Math.floor(100 / cols);
  const pad = (r: string[]) => Array.from({ length: cols }, (_, i) => r[i] ?? "");
  const border = { style: BorderStyle.SINGLE, size: 4, color: "D9CFC1" };
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: { top: border, bottom: border, left: border, right: border, insideHorizontal: border, insideVertical: border },
    rows: [
      new TableRow({ tableHeader: true, children: pad(header || []).map((h) => cell(h, { header: true, width })) }),
      ...(rows || []).map((r) => new TableRow({ children: pad(r).map((c) => cell(c, { width })) })),
    ],
  });
}

function blockToChildren(b: DocBlock): (Paragraph | Table)[] {
  switch (b.type) {
    case "paragraph":
      return [para(b.text)];
    case "subheading":
      return [heading(b.text, HeadingLevel.HEADING_2)];
    case "bullets":
      return list(b.items, "tendi-bullets");
    case "numbered":
      return list(b.items, "tendi-numbers");
    case "table":
      return [table(b.header, b.rows), new Paragraph({ spacing: { after: 120 }, children: [] })];
    case "callout":
      return [callout(b.text)];
    case "page_break":
      return [new Paragraph({ children: [new PageBreak()] })];
    default:
      return [];
  }
}

export function validateSpec(spec: any): string[] {
  const errs: string[] = [];
  if (!spec || typeof spec !== "object") return ["spec must be an object"];
  if (!spec.title) errs.push("spec.title is required");
  if (!spec.client) errs.push("spec.client is required");
  if (!Array.isArray(spec.sections) || !spec.sections.length) errs.push("spec.sections must be a non-empty array");
  (spec.sections || []).forEach((s: any, i: number) => {
    if (!s?.heading) errs.push(`sections[${i}].heading is required`);
    if (!Array.isArray(s?.blocks)) errs.push(`sections[${i}].blocks must be an array`);
  });
  return errs;
}

export async function buildDocx(spec: DocSpec): Promise<Buffer> {
  const errs = validateSpec(spec);
  if (errs.length) throw new Error(errs.join("; "));

  const footerText = `Peak Nine for ${spec.client}${spec.subtitle ? ` · ${spec.subtitle}` : ""}`;
  const meta = spec.meta && spec.meta.length ? spec.meta : DEFAULT_META;

  const cover: Paragraph[] = [
    new Paragraph({ spacing: { before: 2400, after: 200 }, children: [new TextRun({ text: (spec.subtitle || "Proposal").toUpperCase(), font: HEAD_FONT, color: GREEN, size: 18, characterSpacing: 60, bold: true })] }),
    new Paragraph({ spacing: { after: 240 }, children: [new TextRun({ text: spec.title, font: HEAD_FONT, color: GREEN, size: 64, bold: true })] }),
  ];
  if (spec.question) {
    cover.push(new Paragraph({ spacing: { after: 400, line: 320 }, children: [new TextRun({ text: spec.question, font: BODY_FONT, color: INK, size: 26, italics: true })] }));
  }
  if (spec.date) {
    cover.push(new Paragraph({ spacing: { before: 200, after: 120 }, children: [new TextRun({ text: spec.date, font: BODY_FONT, color: MUTED, size: 20 })] }));
  }
  for (const line of meta) {
    cover.push(new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: line, font: BODY_FONT, color: MUTED, size: 18 })] }));
  }
  cover.push(new Paragraph({ children: [new PageBreak()] }));

  const body: (Paragraph | Table)[] = [];
  spec.sections.forEach((s, idx) => {
    if (idx > 0 && !(s.blocks[0] && s.blocks[0].type === "page_break")) {
      body.push(new Paragraph({ spacing: { before: 200 }, children: [] }));
    }
    if (s.label) body.push(label(s.label));
    body.push(heading(s.heading));
    for (const b of s.blocks || []) body.push(...blockToChildren(b));
  });

  const doc = new Document({
    creator: "Tendi (Peak Nine)",
    title: spec.title,
    description: footerText,
    background: { color: SAND },
    styles: {
      default: { document: { run: { font: BODY_FONT, size: 22, color: INK } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: HEAD_FONT, size: 40, bold: true, color: GREEN } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: HEAD_FONT, size: 28, bold: true, color: GREEN } },
      ],
    },
    numbering: {
      config: [
        {
          reference: "tendi-bullets",
          levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 270 } } } }],
        },
        {
          reference: "tendi-numbers",
          levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 300 } } } }],
        },
      ],
    },
    sections: [
      {
        properties: { page: { margin: { top: 1300, bottom: 1200, left: 1300, right: 1300 } } },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                tabStops: [{ type: "right" as any, position: 9000 }],
                children: [
                  new TextRun({ text: footerText, font: BODY_FONT, color: MUTED, size: 16 }),
                  new TextRun({ text: "\t", font: BODY_FONT, size: 16 }),
                  new TextRun({ children: [PageNumber.CURRENT], font: BODY_FONT, color: MUTED, size: 16 }),
                ],
              }),
            ],
          }),
        },
        children: [...cover, ...body],
      },
    ],
  });

  return Packer.toBuffer(doc);
}

export function safeFilename(name: string, fallback = "Peak Nine Proposal.docx"): string {
  let n = String(name || "").replace(/[\\/:*?"<>|\u0000-\u001f]/g, "-").replace(/\s+/g, " ").trim();
  if (!n) n = fallback;
  if (!/\.docx$/i.test(n)) n += ".docx";
  return n.slice(0, 180);
}
