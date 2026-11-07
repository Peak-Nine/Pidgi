/**
 * Check (and lightly tidy) the copywriter's JSON before it goes into Canva.
 * Returns { deck, problems }; an empty problems list means it can be used.
 */
import map from "./template-map.json";
import { relativeYear, firstYear, type LibraryCase } from "./library.js";

export interface Deck {
  cover: { headline: string; subheadline: string };
  who: { statement: string; paragraph: string };
  how: { statement: string; paragraph: string };
  timeline: { step_index: number; header: string; text: string; pill?: string | null }[];
  takeaways: { lesson: string; support: string }[];
  caption: string;
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
    else if ([...String(value)].length > limit) problems.push(`${label} is ${[...String(value)].length} characters (max ${limit})`);
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

  deck.caption = tidy(deck.caption);
  check("caption", deck.caption, L.caption.limit);
  if (!deck.caption.includes("https://library.peaknine.studio")) problems.push("caption is missing the library link");
  if (!/#BeyondTheGrant/.test(deck.caption)) problems.push("caption is missing #BeyondTheGrant");

  deck.tags = Array.isArray(deck.tags) ? deck.tags.map(String) : [];
  deck.website = typeof deck.website === "string" ? deck.website.trim() : "";
  deck.notes_for_team = tidy(deck.notes_for_team || "");
  return { deck: deck as Deck, problems };
}
