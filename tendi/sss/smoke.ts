/**
 * npm run tendi:sss-smoke
 * Smoke test with the LIVE library and a real logo lookup; Slack, Notion, Canva and
 * Claude are mocked. Port of the brief's test/smoke.mjs. Writes nothing anywhere
 * except a temp data dir.
 */
import assert from "assert/strict";
import os from "os";
import path from "path";
import { mkdtempSync } from "fs";

process.env.TENDI_DATA_DIR = mkdtempSync(path.join(os.tmpdir(), "sss-smoke-"));

import { loadLibrary, isEligible, relativeYear, guessOrgWebsite } from "./library.js";
import { pickCase } from "./pick-case.js";
import { validateCopy } from "./validate-copy.js";
import { textOps, logoOps, type LogoSlot } from "./canva-build.js";
import { encodeNotes, decodeNotes, weekStartBrussels, isoDate } from "./notion-log.js";
import { createScaleSustain } from "./job.js";
import { findLogo, makeLogoVariants } from "./logo-finder.js";
import ve from "./examples/village-enterprise.json";
import map from "./template-map.json";

const ok = (m: string) => console.log("  ok  " + m);

async function main() {
  // 1. Library and case picking
  const lib = await loadLibrary();
  const eligible = lib.cases.filter(isEligible);
  ok(`library: ${lib.cases.length} cases, ${eligible.length} fit the template automatically`);
  const veCase = lib.cases.find((c) => c.id === "WEB-2026-001")!;
  assert.ok(veCase && isEligible(veCase));
  assert.equal(relativeYear("2018-2020", 2017), "years 2-4");
  assert.equal(relativeYear("2006-2007", 2006), "years 1-2");
  const pick = pickCase(lib.cases, { featuredIds: new Set(["WEB-2026-001", "WEB-2026-002"]), recent: [{ caseId: "WEB-2026-001", routes: ["O"], theme: "Livelihoods and jobs" }] })!;
  ok(`next pick: ${pick.id} ${pick.org} (${pick.theme}, routes ${(pick.routes || []).join("+")}), website guess: ${guessOrgWebsite(pick)}`);

  // 2. The approved Village Enterprise copy passes, with the right relative years
  const v = validateCopy(ve.deck, veCase);
  assert.deepEqual(v.problems, []);
  assert.deepEqual(
    v.deck.timeline.map((t) => t.pill),
    ["year 1", "years 2-4", "year 5", "year 6"],
  );
  ok("Village Enterprise copy passes; pills: " + v.deck.timeline.map((t) => t.pill).join(" | "));

  // 3. Broken copy is caught
  const bad = JSON.parse(JSON.stringify(ve.deck));
  bad.cover.headline = "A very long headline that goes on and on beyond the fifty-five character limit";
  bad.timeline[0].text = "Launched in autumn 2017 \u2014 with outcome payers";
  bad.takeaways.pop();
  const b = validateCopy(bad, veCase);
  assert.ok(b.problems.some((p) => p.includes("cover.headline")));
  assert.ok(b.problems.some((p) => p.includes("calendar year")));
  assert.ok(b.problems.some((p) => p.includes("long dash")));
  assert.ok(b.problems.some((p) => p.includes("takeaways has 3")));
  ok(`broken copy caught: ${b.problems.length} problems`);

  // 4. Canva operations
  const ops = textOps(v.deck, { title: "Scale & Sustain Stories #01: Village Enterprise" });
  const total = Object.values(ops).reduce((n, a) => n + a.length, 0);
  assert.equal(ops[4].length, 12);
  assert.equal(ops[4][0].replace_text, "year 1");
  ok(`text operations: ${total} across pages ${Object.keys(ops).join(", ")}`);
  const lo = logoOps(map.logos[1] as LogoSlot, "MEDIA", 3.36);
  assert.equal(lo[0].type, "delete_element");
  assert.ok(Math.abs(lo[1].width - 129.39) < 0.1);
  const wide = logoOps(map.logos[1] as LogoSlot, "MEDIA", 12);
  assert.equal(wide[1].width, 330);
  ok("logo operations: normal and very wide logos fit their slot");

  // 5. Notion notes and dates
  const n = decodeNotes(encodeNotes({ caseId: "X-1", designId: "DABC", slackTs: "1.2", threadTs: "1.0", routes: ["O", "C"], theme: "Health" }));
  assert.deepEqual([n.caseId, n.designId, n.slackTs, n.threadTs, n.routes.join(","), n.theme], ["X-1", "DABC", "1.2", "1.0", "O,C", "Health"]);
  assert.equal(isoDate(weekStartBrussels(new Date("2026-11-09T07:30:00Z"))), "2026-11-09");
  assert.equal(isoDate(weekStartBrussels(new Date("2026-11-15T22:30:00Z"))), "2026-11-09");
  ok("Notion notes round-trip; week start in Brussels is right");

  // 6. Real logo lookup on the next pick's website (some sites block plain requests; that is reported, not failed)
  const site = guessOrgWebsite(pick);
  if (site) {
    try {
      const found = await findLogo(site, { orgName: pick.org });
      const variants = await makeLogoVariants(found.buffer);
      ok(`logo for ${pick.org} from ${found.source} (${variants.width}x${variants.height}, aspect ${variants.aspect.toFixed(2)})`);
    } catch (e: any) {
      ok(`logo lookup for ${pick.org} at ${site}: ${e?.reason || "error"} (${e?.message}); Tendi would ask in the thread`);
    }
  } else ok(`no website guess for ${pick.org}; Tendi would ask in the thread`);

  // 7. Full weekly run with mocks
  const calls = { canva: [] as string[], notion: [] as string[], slack: [] as string[], texts: [] as string[] };
  const reply = (o: any) => ({ text: JSON.stringify(o), isError: false });
  const canva = {
    has: () => true,
    async call(name: string, _args: any) {
      calls.canva.push(name);
      if (name === "copy-design") return reply({ design: { id: "DAMOCK00001", urls: { edit_url: "https://www.canva.com/d/mock" } } });
      if (name === "read-design") return reply({ transaction: { transaction_id: "tx1" } });
      if (name === "create-upload-url") return reply({ upload_url: "mock://upload" });
      if (name === "edit-design") return reply({ edit_operation_results: [], document: { page: { elements: [{ id: map.text.howStatement.id, top: 288.46, height: 534.6 }] } } });
      if (name === "export-design") return reply({ job: { status: "failed" } });
      throw new Error("unexpected tool " + name);
    },
  };
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (url: any, opts: any) => (String(url).startsWith("mock://") ? new Response(JSON.stringify({ asset: { id: "MAMOCK" } }), { status: 201 }) : realFetch(url, opts))) as any;
  const notion = {
    async request(method: string, p: string) {
      calls.notion.push(`${method} ${p.split("/")[0]}`);
      if (p.endsWith("/query")) return { results: [], has_more: false };
      if (method === "POST" && p === "pages") return { id: "page1", url: "https://notion.so/page1" };
      return {};
    },
  };
  const slack = {
    chat: {
      async postMessage(m: any) {
        calls.slack.push("post");
        calls.texts.push(m.text);
        return { ts: "111.222" };
      },
      async getPermalink() {
        return { permalink: "https://slack/p" };
      },
    },
    files: {
      async uploadV2() {
        calls.slack.push("files");
        return {};
      },
    },
  };
  const anthropic: any = { messages: { create: async () => ({ content: [{ type: "text", text: JSON.stringify(ve.deck) }] }) } };
  const sss = createScaleSustain({
    slack,
    notion: notion as any,
    canva,
    anthropic,
    model: "mock",
    slackToken: "x",
    channel: "C123",
    allowedUserIds: ["UNIELS"],
    library: async () => lib,
    log: { info() {}, warn: (m) => console.log("  (warn) " + m), error() {} },
  });
  const result: any = await sss.runWeekly(new Date("2026-11-09T07:30:00Z"));
  globalThis.fetch = realFetch;
  assert.equal(result.issueNo, 1);
  ok(`weekly run (mocked): #${result.issueNo} ${result.org} (${result.caseId}), Canva calls: ${calls.canva.length}, Notion calls: ${calls.notion.join(", ")}, Slack: ${calls.slack.join(", ")}`);
  assert.ok(sss.isRepeatSignal({ type: "reaction_added", reaction: "repeat" }));
  assert.ok(sss.isRepeatSignal({ type: "message", text: "nah 🔁" }));
  assert.ok(!sss.isRepeatSignal({ type: "reaction_added", reaction: "thumbsup" }));
  ok("🔁 detection works for reactions and replies");
  console.log(
    "\nSample weekly message:\n" +
      calls.texts[0]
        .split("\n")
        .map((l) => "    " + l)
        .join("\n"),
  );
  console.log("\nAll checks passed.");
}

main().catch((e) => {
  console.error("FAILED:", e);
  process.exit(1);
});
