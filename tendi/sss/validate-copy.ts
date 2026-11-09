/**
 * Check (and lightly tidy) the copywriter's JSON before it goes into Canva.
 * Returns { deck, problems }; an empty problems list means it can be used.
 */
import map from "./template-map.json";
import { relativeYear, firstYear, type LibraryCase } from "./library.js";
import { SSS } from "./config.js";

export interface Deck {
  cover: { headline: string; subheadline: string };
  who: { statement: string; paragraph: string };
  how: { statement: string; paragraph: string };
  timeline: { step_index: number; header: string; text: string; pill?: string | null }[];
  takeaways: { lesson: string; support: string }[];
  /** The full LinkedIn caption: the body Claude wrote plus the fixed outro, case link and hashtags. */
  caption: string;
  /** Only the part Claude wrote, from the hook to the closing question. */
  caption_body?: string;
  hashtags?: string[];
  tags: string[];
  website: string;
  notes_for_team: string;
}

const YEAR = /\b(19|20)\d{2}\b/;
const DASHES = /[\u2014\u2013]/; // em dash, en dash

/** Straight apostrophes to typographic ones, leaving URLs alone. */
export function tidy(s: unknown): string {
  return String(s ?? "")
    .split(/(https?:\/\/\S+)/)
    .map((part, i) => (i % 2 ? part : part.replace(/(\w)'(\w)/g, "$1’$2").replace(/ '/g, " ‘").replace(/'(\s|$|[.,;:!?])/g, "’$1")))
    .join("")
    .trim();
}

export function validateCopy(raw: any, caseData: LibraryCase): { deck: Deck; problems: string[] } {
  const problems: string[] = [];
  const deck: any = JSON.parse(JSON.stringify(raw || {}));
  const L: any = map.text;

  const check = (label: string, value: string, limit: number) => {
    if (!value || !String(value).trim()) problems.push(`${label} is empty`);
    else if ([...String(value)].length > limit) problems.push(`${label} is ${[...String(value)].length} characters (max ${limit}): "${value}"`);
    if (DASHES.test(value || "")) problems.push(`${label} contains a long dash`);
  };

  for (const [p, key] of [
    [["cover", "headline"], "coverHeadline"],
    [["cover", "subheadline"], "coverSub"],
    [["who", "statement"], "whoStatement"],
    [["who", "paragraph"], "whoParagraph"],
    [["how", "statement"], "howStatement"],
    [["how", "paragraph"], "howParagraph"],
  ] as [string[], string][]) {
    deck[p[0]] = deck[p[0]] || {};
    deck[p[0]][p[1]] = tidy(deck[p[0]][p[1]]);
    check(p.join("."), deck[p[0]][p[1]], L[key].limit);
  }

  if (/^How\b/.test(deck.cover.subheadline)) problems.push('cover.subheadline must not start with "How" (the headline does)');

  // Timeline: exactly 4 steps, chronological, first and last included, no calendar years
  const steps: any[] = Array.isArray(deck.timeline) ? deck.timeline : [];
  if (steps.length !== 4) problems.push(`timeline has ${steps.length} items (needs 4)`);
  const fy = firstYear(caseData);
  const caseSteps = caseData.evolution || [];
  const idx = steps.map((s) => Number(s?.step_index));
  if (idx.some((i, k) => k > 0 && i <= idx[k - 1])) problems.push("timeline steps are not in chronological order");
  if (caseSteps.length && (idx[0] !== 0 || idx[idx.length - 1] !== caseSteps.length - 1)) problems.push("timeline must include the first and the last step of the case");
  deck.timeline = steps.map((s, k) => {
    const step = caseSteps[Number(s?.step_index)];
    const pill = step && fy ? relativeYear(step.label, fy) : null;
    if (!pill) problems.push(`timeline item ${k + 1} points to a step without a year`);
    const out = { ...s, pill, header: tidy(s?.header), text: tidy(s?.text) };
    check(`timeline ${k + 1} header`, out.header, map.timelineLimits.header);
    check(`timeline ${k + 1} text`, out.text, map.timelineLimits.text);
    if (pill && pill.length > map.timelineLimits.pill) problems.push(`timeline ${k + 1} pill "${pill}" is too long`);
    if (YEAR.test(out.header) || YEAR.test(out.text)) problems.push(`timeline ${k + 1} mentions a calendar year`);
    return out;
  });

  const tks: any[] = Array.isArray(deck.takeaways) ? deck.takeaways : [];
  if (tks.length !== 4) problems.push(`takeaways has ${tks.length} items (needs 4)`);
  deck.takeaways = tks.map((t, k) => {
    const out = { lesson: tidy(t?.lesson), support: tidy(t?.support) };
    check(`takeaway ${k + 1} lesson`, out.lesson, map.takeawayLimits.lesson);
    check(`takeaway ${k + 1} support`, out.support, map.takeawayLimits.support);
    return out;
  });

  // Caption: Claude writes the body (hook to closing question); the code adds the fixed end.
  const body = tidy(deck.caption_body ?? deck.caption);
  problems.push(...captionProblems(body));
  const tags = normaliseHashtags(deck.hashtags);
  if (tags.length !== 3) problems.push(`hashtags has ${tags.length} items (needs 3, without #BeyondTheGrant)`);
  deck.caption_body = body;
  deck.hashtags = tags;
  deck.caption = assembleCaption(body, caseData, tags);
  check("caption", deck.caption, L.caption.limit);

  deck.tags = Array.isArray(deck.tags) ? deck.tags.map(String) : [];
  deck.website = typeof deck.website === "string" ? deck.website.trim() : "";
  deck.notes_for_team = tidy(deck.notes_for_team || "");
  return { deck: deck as Deck, problems };
}

const shortOrgName = (org: string) => String(org || "").replace(/\s*\(.*?\)\s*/g, " ").trim();

export function normaliseHashtags(raw: unknown): string[] {
  const list = Array.isArray(raw) ? raw : typeof raw === "string" ? raw.split(/\s+/) : [];
  return list
    .map((t) => String(t).trim())
    .filter(Boolean)
    .map((t) => (t.startsWith("#") ? t : `#${t}`).replace(/[^#\p{L}\p{N}]/gu, ""))
    .filter((t) => t.length > 1 && t.toLowerCase() !== "#beyondthegrant")
    .slice(0, 3);
}

/** The fixed end of every caption: series paragraph, link to this exact case, hashtags. */
export function assembleCaption(body: string, caseData: LibraryCase, hashtags: string[]): string {
  return [
    body.trim(),
    "--",
    SSS.captionOutro,
    "--",
    `${SSS.captionLinkLine(shortOrgName(caseData.org))}\n${SSS.caseLink(caseData.id)}`,
    ["#BeyondTheGrant", ...hashtags].join(" "),
  ].join("\n\n");
}

/** The agreed structure: What-if hook, 👇 rehook, context, three "what worked" bullets, takeaway, closing question. */
export function captionProblems(body: string): string[] {
  const p: string[] = [];
  const lines = body.split("\n").map((l) => l.trim());
  const filled = lines.filter(Boolean);
  if ([...body].length > SSS.captionBodyLimit) p.push(`caption is ${[...body].length} characters (max ${SSS.captionBodyLimit} for the part you write)`);
  const hook = filled[0] || "";
  if (!/^What if\b/.test(hook)) p.push(`caption must open with a "What if" hook (it starts: "${hook.slice(0, 60)}")`);
  if (!hook.endsWith("?")) p.push("the hook must be a question ending in ?");
  if (hook.split(/\s+/).length >= 10) p.push(`the hook is ${hook.split(/\s+/).length} words (keep it under 10)`);
  if (lines[1] === undefined || !lines[1] || !/👇\s*$/.test(lines[1])) p.push("the second line, right under the hook, must tie it to the organisation and end with 👇");
  const at = lines.findIndex((l) => l === "Here is what actually worked:");
  if (at < 0) p.push('caption is missing the line "Here is what actually worked:"');
  else {
    const after = lines.slice(at + 1).filter(Boolean);
    const bullets = [];
    for (const l of after) {
      if (!l.startsWith("•")) break;
      bullets.push(l);
    }
    if (bullets.length !== 3) p.push(`"Here is what actually worked:" needs exactly 3 bullets (has ${bullets.length})`);
    bullets.forEach((b, i) => {
      if (!/^•\s*[^:]{2,40}:\s+\S/.test(b)) p.push(`bullet ${i + 1} must read "• <Short action>: <one-line fact>"`);
    });
    const rest = after.slice(bullets.length);
    if (rest.length < 2) p.push("after the bullets, add a one-sentence takeaway and then a closing question");
  }
  if (!(filled[filled.length - 1] || "").endsWith("?")) p.push("caption must end with a closing question for the comments");
  if (/https?:\/\/|#\w/.test(body)) p.push("leave links and hashtags out of the caption; the code adds them");
  if (/About this series|P\.S\./i.test(body)) p.push("leave the series paragraph and any P.S. out; the code adds the ending");
  if (/[\u2014\u2013]/.test(body)) p.push("caption contains a long dash");
  return p;
}
