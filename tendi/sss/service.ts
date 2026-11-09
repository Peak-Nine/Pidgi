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
/** The deployed commit (Render sets RENDER_GIT_COMMIT). A new deploy gets fresh attempts for a week whose runs failed. */
const BOOT_ID = `boot-${Date.now()}`;
export function deployId(env = process.env): string {
  return env.RENDER_GIT_COMMIT || BOOT_ID;
}
/** At most this many fresh starts per week after failed runs, so a crash loop cannot keep retrying. */
export const MAX_RESETS_PER_WEEK = 3;

export function weeklyDue(now: Date, week: { monday: string; attempts: number; done: boolean; deploy?: string; resets?: number } | undefined, deploy = deployId()): boolean {
  const c = localClock(now, SSS.timeZone);
  if (c.weekday !== SSS.weekday) return false;
  if (c.hhmm < SSS.time || c.hhmm >= SSS.latest) return false;
  const monday = isoDate(weekStartBrussels(now));
  if (week && week.monday === monday) {
    if (week.done) return false;
    const fresh = !!deploy && week.deploy !== deploy && (week.resets || 0) < MAX_RESETS_PER_WEEK;
    if (week.attempts >= 2 && !fresh) return false;
  }
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
    const thisWeek = st.week?.monday === monday ? st.week : undefined;
    const reset = !!thisWeek && thisWeek.attempts >= 2 && thisWeek.deploy !== deployId();
    const attempts = thisWeek && !reset ? thisWeek.attempts : 0;
    const resets = (thisWeek?.resets || 0) + (reset ? 1 : 0);
    st.week = { monday, attempts: attempts + 1, done: false, deploy: deployId(), resets };
    saveSssState(st);
    log(`weekly run, attempt ${attempts + 1} of 2 this week`);
    void run("schedule", () => sss.runWeekly(now)).then((r) => {
      if (r) {
        const s2 = loadSssState();
        s2.week = { monday, attempts: attempts + 1, done: true, deploy: deployId(), resets };
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

  // ── the intro, once, on its own ─────────────────────────────────────────────
  // SSS_AUTO_INTRO=1 (the default) posts the introduction and issue #01 shortly after start,
  // but only while #01's Content Calendar entry has no Slack message yet (see introPending).
  // No admin key needed: a deploy is enough. SSS_AUTO_INTRO=0 switches it off.
  if (deps.sss && process.env.SSS_AUTO_INTRO !== "0") {
    const sss = deps.sss;
    setTimeout(() => {
      void (async () => {
        try {
          if (!(await sss.introPending())) {
            log("intro: already posted (or #01 not in the Content Calendar); nothing to do");
            return;
          }
          log(`intro: posting the introduction and issue #01 in ${sss.channel}`);
          await run("auto intro", () => sss.postIntro());
        } catch (e: any) {
          lastError = `${new Date().toISOString()} auto intro check: ${String(e?.message || e).slice(0, 400)}`;
          log(lastError);
        }
      })();
    }, Number(process.env.SSS_AUTO_INTRO_DELAY_MS) || 75_000).unref?.();
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
