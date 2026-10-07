import { describe, it, expect } from "vitest";
import mammoth from "mammoth";
import { buildDocx, validateSpec, safeFilename, type DocSpec } from "../tendi/docx.js";
import { extractText, inlineBlock, kindOf, normalise } from "../tendi/files.js";
import { buildStaticSystemPrompt, loadPlaybooks } from "../tendi/prompt.js";
import path from "path";

const SPEC: DocSpec = {
  title: "Peak Nine for Acme Foundation",
  subtitle: "Technical and financial proposal",
  client: "Acme Foundation",
  question: "How might we take the repair programme beyond the grant without losing the people it serves?",
  date: "7 October 2026",
  sections: [
    {
      label: "A short personal note",
      heading: "Hi there! Nice to meet you",
      blocks: [
        { type: "paragraph", text: "Dear members of the selection panel, before you dive into the proposal we wanted to add a **short personal note** on why this mandate resonates with us." },
        { type: "callout", text: "Every claim here traces back to your brief or to work we have actually done." },
      ],
    },
    {
      label: "Work plan",
      heading: "Phases and days",
      blocks: [
        { type: "subheading", text: "Three phases" },
        { type: "bullets", items: ["Audit of Change: 2 weeks", "Opportunities of Change: 2 weeks", "Road to Change: [TO CONFIRM: scope]"] },
        { type: "numbered", items: ["Kickoff", "Interviews", "Synthesis"] },
        { type: "table", header: ["Phase", "Days", "Fee"], rows: [["Audit", "8", "[TO CONFIRM]"], ["Opportunities", "7", "[TO CONFIRM]"]] },
        { type: "page_break" },
        { type: "paragraph", text: "Closing paragraph." },
      ],
    },
  ],
};

describe("tendi/docx", () => {
  it("validates specs", () => {
    expect(validateSpec(null)).toEqual(["spec must be an object"]);
    expect(validateSpec({ title: "x" }).length).toBeGreaterThan(0);
    expect(validateSpec(SPEC)).toEqual([]);
  });

  it("makes safe file names", () => {
    expect(safeFilename("Acme: Peak Nine / Proposal")).toBe("Acme- Peak Nine - Proposal.docx");
    expect(safeFilename("")).toBe("Peak Nine Proposal.docx");
    expect(safeFilename("x.DOCX")).toBe("x.DOCX");
  });

  it("builds a readable .docx with the content in order", async () => {
    const buf = await buildDocx(SPEC);
    expect(buf.length).toBeGreaterThan(3000);
    expect(buf.subarray(0, 2).toString("latin1")).toBe("PK");
    const { value } = await mammoth.extractRawText({ buffer: buf });
    expect(value).toContain("Peak Nine for Acme Foundation");
    expect(value).toContain("short personal note");
    expect(value.indexOf("Hi there! Nice to meet you")).toBeLessThan(value.indexOf("Phases and days"));
    expect(value).toContain("Opportunities");
    expect(value).toContain("Closing paragraph.");
    expect(value).toContain("Peak Nine BV · BE 1028.521.286");
  });

  it("rejects a spec without sections", async () => {
    await expect(buildDocx({ title: "t", client: "c", sections: [] } as any)).rejects.toThrow(/sections/);
  });
});

describe("tendi/files", () => {
  it("classifies attachments", () => {
    expect(kindOf({ name: "rfp.pdf" })).toBe("pdf");
    expect(kindOf({ mimetype: "application/pdf" })).toBe("pdf");
    expect(kindOf({ name: "brief.docx" })).toBe("docx");
    expect(kindOf({ name: "notes.md" })).toBe("text");
    expect(kindOf({ name: "photo.png", mimetype: "image/png" })).toBe("unsupported");
    expect(kindOf({ name: "model.xlsx" })).toBe("unsupported");
  });

  it("extracts a docx it just built, and reports unsupported files honestly", async () => {
    const buf = await buildDocx(SPEC);
    const x = await extractText({ name: "proposal.docx" }, buf);
    expect(x.ok).toBe(true);
    expect(x.text).toContain("Phases and days");
    const block = inlineBlock(x);
    expect(block.startsWith('[Attachment "proposal.docx"')).toBe(true);
    const img = await extractText({ name: "logo.png", mimetype: "image/png" }, Buffer.from("not an image"));
    expect(img.ok).toBe(false);
    expect(img.note).toMatch(/not extracted/);
  });

  it("normalises whitespace", () => {
    expect(normalise("a  \r\nb\n\n\n\nc")).toBe("a\nb\n\nc");
  });
});

describe("tendi/prompt", () => {
  it("loads every playbook in order and builds the static prompt", () => {
    const dir = path.join(__dirname, "..", "tendi", "playbooks");
    const books = loadPlaybooks(dir);
    expect(books.map((b) => b.name)).toEqual([
      "00-voice.md",
      "01-routing.md",
      "02-proof-of-change.md",
      "03-new-proposal.md",
      "04-rfp-philea.md",
      "05-credentials.md",
      "06-teamleader.md",
      "07-canva.md",
    ]);
    const prompt = buildStaticSystemPrompt(dir);
    expect(prompt).toContain("You are Tendi");
    expect(prompt).toContain("DAHRT8eVhhA");
    expect(prompt).toContain("DAHKhE6U2vk");
    expect(prompt).toContain("DAHWFiZkv6w");
    expect(prompt).toContain("5fca771a-80a9-0e61-9244-e43b4f38c725");
    // House style guard: the playbooks themselves must not use em dashes.
    for (const b of books) expect(b.text.includes("—"), `${b.name} contains an em dash`).toBe(false);
  });
});
