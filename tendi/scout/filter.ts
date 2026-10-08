/**
 * Cheap prefilter before anything reaches the model. Keyword lists in EN/NL/FR/DE,
 * positive and negative. Deliberately generous: its job is to drop the obvious
 * (furniture, construction, vehicles), not to judge fit. Edit the lists freely.
 */
import type { Opportunity } from "./types.js";

export const POSITIVE = [
  // what Peak Nine does
  "strategy", "strategic", "strategie", "stratégie", "strategisch", "strategique",
  "theory of change", "proof of change", "verandertheorie", "théorie du changement",
  "financial sustainability", "sustainability strategy", "sustainable financing", "financing model", "funding model", "business model", "revenue model", "exit strategy", "exit plan", "beyond the grant",
  "financiële duurzaamheid", "verdienmodel", "businessmodel", "financieringsmodel", "modèle économique", "modèle de financement", "pérennisation", "pérennité", "viabilité financière", "autonomisation financière",
  "systemic", "system change", "systems change", "systeemverandering", "changement systémique", "systems thinking", "systemisch", "systémique",
  "innovation", "innovatie", "co-creation", "cocreatie", "co-création", "design thinking", "human-centred", "human-centered", "service design", "prototyp", "pilot",
  "impact", "social impact", "impact measurement", "impactmeting", "mesure d'impact", "impact investing", "impact finance", "blended finance", "financement mixte",
  "social enterprise", "social entrepreneurship", "sociaal ondernemerschap", "entrepreneuriat social", "circular economy", "circulaire economie", "économie circulaire",
  "foundation", "philanthrop", "stichting", "fondation", "fonds", "fund design", "grant", "subsidie", "subvention", "call for proposals design",
  "learning review", "strategic review", "evaluation", "evaluatie", "évaluation", "mid-term review", "midterm review", "final evaluation", "capitalisation", "lessons learned",
  "scaling", "scale-up", "opschaling", "mise à l'échelle", "replication", "institutionalisation", "institutionalization",
  "capacity building", "capacity development", "capaciteitsopbouw", "renforcement des capacités", "coaching", "accompagnement", "incubation", "accelerat",
  "ecosystem mapping", "stakeholder mapping", "value chain", "market system", "msd", "private sector engagement", "partnership strategy",
  "feasibility study", "haalbaarheidsstudie", "étude de faisabilité", "scoping study", "landscape analysis", "diagnostic", "assessment",
  "digital health", "health system", "rehabilitation", "livelihood", "agri", "food system", "youth employment", "entrepreneurship", "tvet", "skills",
  "consultancy", "consultant", "consulting", "advisory", "technical assistance", "assistance technique", "expertise",
  // generic study and advice words, per language (the scorer sorts out the rest)
  "study", "studies", "capacity strengthening", "organisational development", "organizational development",
  "stratégique", "appui stratégique", "appui technique", "appui-conseil", "conseil", "étude", "études", "renforcement", "organisationnel",
  "studie", "onderzoek", "advies", "begeleiding", "veranderingstraject",
  "beratung", "konzept", "evaluierung", "begleitung",
];

export const NEGATIVE = [
  "supply of", "supplies", "furniture", "printer", "laptop", "vehicle", "motorcycle", "generator", "solar panel", "construction", "rehabilitation of", "renovation", "building works", "civil works", "drilling", "borehole", "road", "bridge",
  "security guard", "cleaning services", "catering", "travel agency", "insurance", "audit services", "statutory audit", "accounting services", "legal services", "translation services", "interpretation services", "printing services", "event management", "hotel", "conference venue", "transport services", "freight", "logistics",
  "software licence", "software license", "it equipment", "network equipment", "server", "hosting", "medical equipment", "medicines", "pharmaceutical", "laboratory equipment", "seeds", "fertili", "livestock", "textbook", "school desks",
  "meubilair", "levering van", "werken", "bouw", "wegen", "mobilier", "fourniture de", "travaux", "nettoyage", "gardiennage",
  "equipment", "équipement", "matériel", "acquisition", "livraison", "semences", "engrais", "intrants", "procurement of", "public sale", "rental", "leasing", "maintenance", "repair", "fuel", "uniforms", "air tickets",
  "audit of", "hact audit", "external audit", "financial audit",
];

/**
 * UNDP and others post "National Consultant" roles that only nationals or residents
 * of the country can take. [assumption] Dropped by default; set SCOUT_KEEP_NATIONAL=1
 * to keep them. "International consultant" is not affected.
 */
export const NATIONAL_ONLY =
  /\bnational\s+(individual\s+)?consultants?\b|(^|[-:\u2013|(]\s*)(national|local)\b[^-:\u2013|]{0,60}\bconsultant|\bconsultant\(?e?\)?\s+nationa(l|le|ux)\b|\(national\)|recruitment of an? (national|local)\b|recrutement d.un\(?e?\)? consultant\(?e?\)? nationa/i;

// Meta keys that describe the source's own classification, not the assignment.
// TED's category is the CPV label we searched on ("consultancy services"), so it
// would let every TED notice through the keyword filter.
const META_SKIP = new Set(["ted_category", "notice_type", "closing_raw", "status", "legislation"]);

// Sources whose notice text is long boilerplate ("the consultant shall...", "evaluation
// criteria"): every notice would match, so only the title and project name count.
const TITLE_ONLY_SOURCES = new Set(["worldbank"]);

export function textOf(o: Opportunity): string {
  if (TITLE_ONLY_SOURCES.has(o.source)) return `${o.title}\n${o.meta?.project || ""}`.toLowerCase();
  const meta = o.meta ? Object.entries(o.meta).filter(([k]) => !META_SKIP.has(k)).map(([, v]) => v).join(" ") : "";
  return `${o.title}\n${o.summary}\n${meta}`.toLowerCase();
}

export interface PrefilterResult {
  keep: boolean;
  hits: string[];
  misses: string[];
}

/**
 * Keep when at least one positive term appears and the title is not dominated by
 * negative terms. Titles with "consultancy"/"services" words survive a single
 * negative hit; pure supplies and works do not.
 */
export function prefilter(o: Opportunity): PrefilterResult {
  const text = textOf(o);
  const title = o.title.toLowerCase();
  const hits = POSITIVE.filter((k) => text.includes(k));
  const misses = NEGATIVE.filter((k) => title.includes(k));
  const servicey = /(consult|advis|service|study|strategy|evaluat|assessment|research|training|technical assistance|expert)/.test(title);
  if (process.env.SCOUT_KEEP_NATIONAL !== "1" && NATIONAL_ONLY.test(o.title)) misses.push("national consultant (nationals only)");
  const nationalOnly = misses.some((m) => m.startsWith("national consultant"));
  const keep = hits.length > 0 && !nationalOnly && (misses.length === 0 || (servicey && misses.length <= 1));
  return { keep, hits: hits.slice(0, 8), misses };
}

/** Days until deadline, or null when unknown. */
export function daysUntil(deadline: string, now = new Date()): number | null {
  if (!deadline) return null;
  const d = new Date(deadline + "T12:00:00Z");
  if (isNaN(d.getTime())) return null;
  return Math.round((d.getTime() - now.getTime()) / 86400000);
}
