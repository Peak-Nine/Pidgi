/**
 * npm run tendi:sss-intro
 *
 * Asks the running Tendi service to post the Scale & Sustain Stories introduction and
 * issue #01 (Village Enterprise), once per channel. It calls the service's admin route
 * instead of logging in to Canva itself: a second Canva session from a laptop would
 * refresh (and so replace) the hosted service's Canva tokens.
 *
 * Needs PUBLIC_BASE_URL and TENDI_ADMIN_KEY (in tendi/.env or the environment).
 *   npm run tendi:sss-intro            post, then show /sss/status
 *   npm run tendi:sss-intro -- status  only show /sss/status
 */
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function main() {
  const base = (process.env.PUBLIC_BASE_URL || "").replace(/\/$/, "");
  const key = process.env.TENDI_ADMIN_KEY || "";
  if (!base || !key) throw new Error("Set PUBLIC_BASE_URL (the Tendi service URL) and TENDI_ADMIN_KEY.");
  const q = `key=${encodeURIComponent(key)}`;
  if (process.argv[2] !== "status") {
    const r = await fetch(`${base}/sss/intro?${q}&confirm=1`);
    console.log(`intro: HTTP ${r.status}`, await r.text());
    if (!r.ok) process.exit(1);
    console.log("Waiting 90 seconds for the export and the Slack posts...");
    await new Promise((res) => setTimeout(res, 90_000));
  }
  const s = await fetch(`${base}/sss/status?${q}`);
  console.log(JSON.stringify(await s.json(), null, 2));
}

main().catch((e) => {
  console.error(e?.message || e);
  process.exit(1);
});
