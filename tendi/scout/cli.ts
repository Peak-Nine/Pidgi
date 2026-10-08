/**
 * Run Scout from a terminal.
 *
 *   npm run tendi:scout                      fetch + keyword filter, print, nothing stored (dry run)
 *   npm run tendi:scout -- --score           also score with Claude and remember the items
 *   npm run tendi:scout -- --score --post    and post the digest to SCOUT_CHANNEL
 *   npm run tendi:scout -- --sources ted,enabel --since 2026-10-01
 *
 * Reads tendi/.env. --score needs ANTHROPIC_API_KEY; --post needs SLACK_BOT_TOKEN and
 * SCOUT_CHANNEL. State goes to TENDI_DATA_DIR (or the OS temp dir), so a laptop run
 * does not touch the Render disk.
 */
import path from "path";
import dotenv from "dotenv";
import Anthropic from "@anthropic-ai/sdk";
import { WebClient } from "@slack/web-api";
import { postDigest, renderPlain } from "./digest.js";
import { runScout } from "./run.js";
import { lookbackFor, scoutConfig } from "./service.js";

dotenv.config({ path: path.join(__dirname, "..", ".env") });

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  if (i < 0) return undefined;
  const v = process.argv[i + 1];
  return v && !v.startsWith("--") ? v : "";
}
const has = (name: string) => process.argv.includes(`--${name}`);

async function main() {
  const score = has("score") || has("post");
  const post = has("post");
  const sources = arg("sources")?.split(",").map((s) => s.trim()).filter(Boolean);
  const since = arg("since") || undefined;

  if (score && !process.env.ANTHROPIC_API_KEY) throw new Error("--score needs ANTHROPIC_API_KEY (in tendi/.env or the environment).");
  if (post && (!process.env.SLACK_BOT_TOKEN || !process.env.SCOUT_CHANNEL)) throw new Error("--post needs SLACK_BOT_TOKEN and SCOUT_CHANNEL.");

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "not-needed-for-dry-run" });
  const lookbackDays = lookbackFor(scoutConfig().days);
  const run = await runScout({ anthropic, trigger: "cli", dryRun: !score, sources, since, lookbackDays, log: (l) => console.error(`[scout] ${l}`) });
  console.log(renderPlain(run));
  console.log("");
  console.log(`Notes:\n${run.summary.notes.map((n) => `  ${n}`).join("\n")}`);
  if (run.summary.errors.length) console.log(`Errors:\n${run.summary.errors.map((n) => `  ${n}`).join("\n")}`);
  if (score) console.log(`Scored with ${run.model}.`);

  if (post) {
    const slack = new WebClient(process.env.SLACK_BOT_TOKEN);
    const r = await postDigest(slack, process.env.SCOUT_CHANNEL!, run);
    console.log(`Posted digest ${r.headerTs} with ${r.posted} item(s).`);
  }
}

main().catch((e) => {
  console.error(`Scout failed: ${e?.message || e}`);
  process.exit(1);
});
