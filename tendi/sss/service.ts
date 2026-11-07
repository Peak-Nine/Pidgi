/**
 * Scale & Sustain Stories inside the Tendi web service, next to Scout:
 *   - the weekly schedule: Monday from 08:30 Europe/Brussels (checked every 5 minutes,
 *     follows the clock changes because it reads Brussels wall time), at most two
 *     attempts per week, remembered on the persistent disk
 *   - Slack: 🔁 reactions and replies, logo files or links in a post's thread
 *   - admin routes (need ?key=TENDI_ADMIN_KEY):
 *       GET /sss/status
 *       GET /sss/run            build this week's post now (skips if the week has one)
 *       GET /sss/intro?confirm=1   post the introduction and issue #01, once per channel
 */
import { localClock } from "../scout/service.js";
import { SSS, sssAllowedUsers, sssEnabled } from "./config.js";
import { loadSssState, saveSssState, type ScaleSustain } from "./job.js";
import { isoDate, weekStartBrussels } from "./notion-log.js";

/** True when the weekly build is due: Monday, between 08:30 and 20:00 Brussels, not done this week, fewer than 2 attempts. */
export function weeklyDue(now: Date, week: { monday: string; attempts: number; done: boolean } | undefined): boolean {
  const c = localClock(now, SSS.timeZone);
  if (c.weekday !== SSS.weekday) return false;
  if (c.hhmm < SSS.time || c.hhmm >= SSS.latest) return false;
  const monday = isoDate(weekStartBrussels(now));
  if (week && week.monday === monday && (week.done || week.attempts >= 2)) return false;
  return true;
}

export interface SssServiceDeps {
  app: any;
  router: any;
  adminOk: (req: any, res: any) => boolean;
  sss: ScaleSustain | null;
  /** Why the job is off, when sss is null (missing Notion or Canva). */
  offReason?: string;
  firstTime: (id: string) => boolean;
  botUserId: () => string;
}

export function startSssService(deps: SssServiceDeps) {
  const log = (l: string) => console.log(`[sss] ${l}`);
  let lastResult: any = null;
  let lastError = "";

  async function run(label: string, fn: () => Promise<any>) {
    try {
      lastResult = { at: new Date().toISOString(), label, result: await fn() };
      lastError = "";
      return lastResult.result;
    } catch (e: any) {
      lastError = `${new Date().toISOString()} ${label}: ${String(e?.message || e).slice(0, 400)}`;
      log(lastError);
      return null;
    }
  }

  // ── schedule ────────────────────────────────────────────────────────────────
  function tick() {
    const sss = deps.sss;
    if (!sss || sss.isBusy()) return;
    const now = new Date();
    const st = loadSssState();
    if (!weeklyDue(now, st.week)) return;
    const monday = isoDate(weekStartBrussels(now));
    const attempts = st.week?.monday === monday ? st.week.attempts : 0;
    st.week = { monday, attempts: attempts + 1, done: false };
    saveSssState(st);
    log(`weekly run, attempt ${attempts + 1} of 2 this week`);
    void run("schedule", () => sss.runWeekly(now)).then((r) => {
      if (r) {
        const s2 = loadSssState();
        s2.week = { monday, attempts: attempts + 1, done: true };
        saveSssState(s2);
      }
    });
  }
  if (deps.sss && sssEnabled()) {
    setTimeout(tick, 90_000);
    setInterval(tick, 5 * 60_000).unref?.();
    log(`weekly post every Monday from ${SSS.time} ${SSS.timeZone} into ${deps.sss.channel}; 🔁 allowed for ${sssAllowedUsers().length} user(s)`);
  } else {
    log(deps.sss ? "schedule paused (SSS_ENABLED=0)" : `off: ${deps.offReason || "not configured"}`);
  }

  // ── Slack ───────────────────────────────────────────────────────────────────
  async function userName(client: any, id: string): Promise<string | undefined> {
    try {
      const u = await client.users.info({ user: id });
      return u?.user?.profile?.real_name || u?.user?.real_name || u?.user?.name;
    } catch {
      return undefined;
    }
  }

  deps.app.event("reaction_added", async ({ event, client }: any) => {
    const sss = deps.sss;
    if (!sss || event?.item?.type !== "message" || event.item.channel !== sss.channel) return;
    if (!sss.isRepeatSignal({ type: "reaction_added", reaction: event.reaction })) return;
    if (event.user === deps.botUserId()) return;
    if (!deps.firstTime(`sss-react:${event.item.ts}:${event.user}:${event.event_ts || ""}`)) return;
    await run("repeat (reaction)", async () => sss.handleRepeat({ userId: event.user, userName: await userName(client, event.user), messageTs: event.item.ts, threadTs: null }));
  });

  deps.app.event("message", async ({ event, client }: any) => {
    const sss = deps.sss;
    const e = event || {};
    if (!sss || e.channel !== sss.channel || !e.thread_ts) return;
    if (e.bot_id || (deps.botUserId() && e.user === deps.botUserId())) return;
    if (e.subtype && e.subtype !== "file_share") return;
    if (!deps.firstTime(`sss-msg:${e.channel}:${e.ts}`)) return;
    if (sss.isRepeatSignal({ type: "message", text: e.text })) {
      await run("repeat (reply)", async () => sss.handleRepeat({ userId: e.user, userName: await userName(client, e.user), messageTs: e.ts, threadTs: e.thread_ts }));
      return;
    }
    const files = Array.isArray(e.files) ? e.files : [];
    if (files.length || /https?:\/\/\S+/i.test(e.text || "")) {
      await run("logo reply", () => sss.handleLogoReply({ threadTs: e.thread_ts, files, text: e.text || "" }));
    }
  });

  // ── admin routes ────────────────────────────────────────────────────────────
  deps.router.get("/sss/status", (req: any, res: any) => {
    if (!deps.adminOk(req, res)) return;
    const st = loadSssState();
    res.json({
      enabled: !!deps.sss && sssEnabled(),
      off_reason: deps.sss ? null : deps.offReason || null,
      channel: deps.sss?.channel || SSS.channelId,
      schedule: `Monday ${SSS.time} ${SSS.timeZone}`,
      allowed_users: sssAllowedUsers(),
      busy: deps.sss?.isBusy() || false,
      week: st.week || null,
      awaiting_logo: st.awaitingLogo,
      intro_posted: st.introPosted || {},
      lastResult,
      lastError: lastError || null,
    });
  });

  deps.router.get("/sss/run", (req: any, res: any) => {
    if (!deps.adminOk(req, res)) return;
    const sss = deps.sss;
    if (!sss) return void res.status(400).json({ started: false, reason: deps.offReason || "not configured" });
    if (sss.isBusy()) return void res.status(409).json({ started: false, reason: "a build is already going" });
    void run("manual", () => sss.runWeekly());
    res.status(202).json({ started: true, channel: sss.channel, note: "A build takes a few minutes. Check /sss/status?key=... for the result." });
  });

  deps.router.get("/sss/intro", (req: any, res: any) => {
    if (!deps.adminOk(req, res)) return;
    const sss = deps.sss;
    if (!sss) return void res.status(400).json({ started: false, reason: deps.offReason || "not configured" });
    if (req.query.confirm !== "1") return void res.status(400).json({ started: false, reason: `add &confirm=1 to post the introduction and issue #01 in ${sss.channel}` });
    void run("intro", () => sss.postIntro({ force: req.query.force === "1" }));
    res.status(202).json({ started: true, channel: sss.channel, note: "Check /sss/status?key=... for the result." });
  });
}
