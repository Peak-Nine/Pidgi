/**
 * Ask Claude for this week's copy deck and caption, then check it with validateCopy.
 * Uses Tendi's Anthropic client; the model is SSS_MODEL, else TENDI_MODEL.
 */
import fs from "fs";
import path from "path";
import type Anthropic from "@anthropic-ai/sdk";
import { recordUsage } from "../usage.js";
import { validateCopy, type Deck } from "./validate-copy.js";
import type { LibraryCase, ReadableCase } from "./library.js";

let SYSTEM: string | null = null;
function system(): string {
  if (SYSTEM === null) SYSTEM = fs.readFileSync(path.join(__dirname, "prompts", "copy-system.md"), "utf8");
  return SYSTEM;
}

export function parseJsonLoose(text: string): any {
  const t = String(text).replace(/```json|```/g, "").trim();
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  return JSON.parse(t.slice(start, end + 1));
}

export class CopyError extends Error {
  deck?: Deck;
}

export async function writeCopy({
  anthropic,
  model,
  readable,
  raw,
  maxAttempts = 5,
}: {
  anthropic: Pick<Anthropic, "messages">;
  model: string;
  readable: ReadableCase;
  raw: LibraryCase;
  maxAttempts?: number;
}): Promise<Deck> {
  const { routes: _routes, ...forPrompt } = readable;
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: `Here is this week's case as JSON:\n\n${JSON.stringify(forPrompt, null, 2)}` }];
  let last: { deck: Deck; problems: string[] } | undefined;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res: any = await anthropic.messages.create({ model, max_tokens: 4000, system: system(), messages });
    try {
      if (res?.usage) recordUsage(model, res.usage, { thread: "scale-sustain" });
    } catch {
      /* usage log is best effort */
    }
    const text = (res.content || [])
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("\n");
    let draft: any;
    try {
      draft = parseJsonLoose(text);
    } catch {
      messages.push({ role: "assistant", content: text || "(empty)" });
      messages.push({ role: "user", content: "That was not valid JSON. Return only the JSON object." });
      continue;
    }
    last = validateCopy(draft, raw);
    if (!last.problems.length) return last.deck;
    messages.push({ role: "assistant", content: JSON.stringify(draft) });
    const lengthNote = last.problems.some((p) => /characters \(max/.test(p))
      ? "\nCount every character, spaces included, and aim for at least 3 characters under each limit. For a short header, use fewer words rather than shorter words."
      : "";
    messages.push({ role: "user", content: `Fix these problems and return the full JSON again, changing nothing else:\n- ${last.problems.join("\n- ")}${lengthNote}` });
  }
  const err = new CopyError(`the copy still had problems after ${maxAttempts} attempts: ${last?.problems?.join("; ") || "no valid JSON"}`);
  err.deck = last?.deck;
  throw err;
}
