/**
 * Scout inside the Tendi web service:
 *   - a daily schedule (in-process, checked every 5 minutes, at most one run per day,
 *     remembered on the persistent disk so a redeploy never runs it twice)
 *   - admin routes: GET /scout/status and GET /scout/run (both need ?key=TENDI_ADMIN_KEY)
 *   - 👍 / 👎 reactions on digest items, stored as calibration for the scorer
 *   - the "Start a proposal" button, which hands the item to Tendi in a new thread
 *
 * Why in-process and not a Render Cron Job: a Render persistent disk attaches to one
 * service only, and Scout's memory (seen items, feedback) lives on Tendi's disk.
 * GET /scout/run can still be called from any external scheduler if you prefer one.
 *
 * Nothing posts until SCOUT_CHANNEL is set.
 */
import type Anthropic from "@anthropic-ai/sdk";
import { postDigest, START_ACTION_ID, TZ } from "./digest.js";
import { runScout, type RunResult } from "./run.js";
import { SCOUT_MODEL } from "./scorer.js";
import {
  addFeedback,
  feedbackCounts,
  getLastScheduledDay,
  itemById,
  itemForMessage,
  lastRuns,
  removeFeedback,
  saveState,
  setLastScheduledDay,
  topRecent,
  type SeenRecord,
} from "./store.js";

export interface ScoutConfig {
  channel: string;
  enabled: boolean;
  time: string; // HH:MM in TZ
  days: number[]; // 1 = Monday ... 7 = Sunday
  tz: string;
  model: string;
}

export function scoutConfig(env = process.env): ScoutConfig {
  const channel = (env.SCOUT_CHANNEL || "").trim();
  const time = /^\d{1,2}:\d{2}$/.test(env.SCOUT_TIME || "") ? (env.SCOUT_TIME as string) : "07:30";
  const days = (env.SCOUT_DAYS || "1,2,3,4,5")
    .split(",")
    .map((d) => Number(d.trim()))
    .filter((d) => d >= 1 && d <= 7);
  return { channel, enabled: !!channel && env.SCOUT_ENABLED !== "0", time, days: days.length ? days : [1, 2, 3, 4, 5], tz: TZ, model: SCOUT_MODEL };
}

const WEEKDAY: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };

/** Local day, weekday and time in the given time zone. */
export function localClock(now: Date, tz: string): { day: string; weekday: number; hhmm: string } {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false })
      .formatToParts(now)
      .map((p) => [p.type, p.value])
  );
  const hour = parts.hour === "24" ? "00" : parts.hour;
  return { day: `${parts.year}-${parts.month}-${parts.day}`, weekday: WEEKDAY[parts.weekday] || 0, hhmm: `${hour}:${parts.minute}` };
}

/** True when a scheduled run is due now. */
export function isDue(cfg: ScoutConfig, now: Date, lastDay: string | undefined): boolean {
  if (!cfg.enabled) return false;
  const c = localClock(now, cfg.tz);
  if (!cfg.days.includes(c.weekday)) return false;
  const [h, m] = cfg.time.split(":").map(Number);
  const due = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  return c.hhmm >= due && lastDay !== c.day;
}

export function verdictFromReaction(name: string): "up" | "down" | null {
  const base = String(name || "").split("::")[0];
  if (base === "+1" || base === "thumbsup") return "up";
  if (base === "-1" || base === "thumbsdown") return "down";
  return null;
}

export interface ScoutServiceDeps {
  app: any; // @slack/bolt App
  router: any; // express Router of the ExpressReceiver
  anthropic: Anthropic;
  adminOk: (req: any, res: any) => boolean;
  startProposal: (args: { channel: string; userId: string; record: SeenRecord }) => Promise<void>;
  log?: (line: string) => void;
}

export function startScoutService(deps: ScoutServiceDeps) {
  const cfg = scoutConfig();
  const log = deps.log || ((l: string) => console.log(`[scout] ${l}`));
  let running = false;
  let lastError = "";
  let lastResult: { at: number; trigger: string; headerTs?: string; posted?: number } | null = null;

  async function runAndPost(trigger: "schedule" | "manual", opts: { dryRun?: boolean; post?: boolean; sources?: string[]; since?: string } = {}): Promise<RunResult | null> {
    if (running) return null;
    running = true;
    try {
      const run = await runScout({ anthropic: deps.anthropic, trigger, dryRun: opts.dryRun, sources: opts.sources, since: opts.since, log });
      let headerTs: string | undefined;
      let posted = 0;
      if (opts.post !== false && !opts.dryRun && cfg.channel) {
        const r = await postDigest(deps.app.client, cfg.channel, run);
        headerTs = r.headerTs;
        posted = r.posted;
      }
      lastResult = { at: Date.now(), trigger, headerTs, posted };
      lastError = "";
      return run;
    } catch (e: any) {
      lastError = `${new Date().toISOString()} ${String(e?.message || e).slice(0, 300)}`;
      log(`run failed: ${lastError}`);
      return null;
    } finally {
      running = false;
    }
  }

  // ── schedule ───────────────────────────────────────────────────────────────
  function tick() {
    try {
      const now = new Date();
      if (running || !isDue(cfg, now, getLastScheduledDay())) return;
      // Claim the day before running, so a crash mid-run never loops.
      setLastScheduledDay(localClock(now, cfg.tz).day);
      saveState();
      void runAndPost("schedule");
    } catch (e: any) {
      log(`schedule check failed: ${e?.message || e}`);
    }
  }
  if (cfg.enabled) {
    setTimeout(tick, 60_000);
    setInterval(tick, 5 * 60_000).unref?.();
    log(`daily run at ${cfg.time} ${cfg.tz} on days ${cfg.days.join(",")} into channel ${cfg.channel}; scorer ${cfg.model}`);
  } else {
    log(cfg.channel ? "schedule paused (SCOUT_ENABLED=0)" : "schedule off: set SCOUT_CHANNEL to the tenders channel id to switch it on");
  }

  // ── admin routes ───────────────────────────────────────────────────────────
  deps.router.get("/scout/status", (req: any, res: any) => {
    if (!deps.adminOk(req, res)) return;
    res.json({
      config: { ...cfg, channel: cfg.channel || "(not set)", reliefweb: process.env.RELIEFWEB_APPNAME ? "appname set" : "waiting for appname" },
      running,
      lastScheduledDay: getLastScheduledDay() || null,
      lastResult,
      lastError: lastError || null,
      feedback: feedbackCounts(),
      runs: lastRuns(5),
      top7days: topRecent(7, 15).map((r) => ({ score: r.score?.score, verdict: r.score?.verdict, title: r.title, buyer: r.buyer, deadline: r.deadline, url: r.url, posted: !!r.posted })),
    });
  });

  // GET /scout/run?key=...            run now and post (needs SCOUT_CHANNEL)
  //   &dry=1                          fetch and filter only, no model, nothing stored or posted
  //   &post=0                         score and store, but do not post
  //   &sources=ted,enabel&since=YYYY-MM-DD
  deps.router.get("/scout/run", (req: any, res: any) => {
    if (!deps.adminOk(req, res)) return;
    if (running) {
      res.status(409).json({ started: false, reason: "a run is already going" });
      return;
    }
    const dryRun = req.query.dry === "1";
    const post = req.query.post !== "0";
    const sources = typeof req.query.sources === "string" && req.query.sources ? String(req.query.sources).split(",").map((s: string) => s.trim()) : undefined;
    const since = typeof req.query.since === "string" && /^\d{4}-\d{2}-\d{2}$/.test(req.query.since) ? req.query.since : undefined;
    void runAndPost("manual", { dryRun, post, sources, since });
    res.status(202).json({ started: true, dryRun, post: post && !dryRun && !!cfg.channel, note: "Runs take one to three minutes. Check /scout/status?key=... for the result." });
  });

  // ── reactions: 👍 / 👎 on an item message ─────────────────────────────────
  deps.app.event("reaction_added", async ({ event }: any) => {
    const v = verdictFromReaction(event?.reaction);
    if (!v || event?.item?.type !== "message") return;
    const rec = itemForMessage(event.item.channel, event.item.ts);
    if (!rec) return;
    addFeedback({ itemId: rec.id, title: rec.title, buyer: rec.buyer, verdict: v, by: event.user, at: Date.now() });
    saveState();
    log(`feedback ${v} on ${rec.id} by ${event.user}`);
  });
  deps.app.event("reaction_removed", async ({ event }: any) => {
    const v = verdictFromReaction(event?.reaction);
    if (!v || event?.item?.type !== "message") return;
    const rec = itemForMessage(event.item.channel, event.item.ts);
    if (!rec) return;
    removeFeedback(rec.id, event.user, v);
    saveState();
  });

  // ── "Start a proposal" button ──────────────────────────────────────────────
  const recentClicks = new Map<string, number>();
  deps.app.action(START_ACTION_ID, async ({ ack, body, action, client }: any) => {
    await ack();
    const id = String(action?.value || "");
    const channel = body?.channel?.id || cfg.channel;
    const userId = body?.user?.id || "";
    const key = `${id}:${userId}`;
    const last = recentClicks.get(key) || 0;
    if (Date.now() - last < 10 * 60_000) return; // double click
    recentClicks.set(key, Date.now());
    const rec = itemById(id);
    if (!rec) {
      try {
        await client.chat.postEphemeral({ channel, user: userId, text: "I no longer have this tender in Scout's memory. Paste the link to me and I'll start from that." });
      } catch {
        /* ignore */
      }
      return;
    }
    try {
      await deps.startProposal({ channel, userId, record: rec });
    } catch (e: any) {
      log(`start proposal failed for ${id}: ${e?.message || e}`);
    }
  });

  return {
    config: cfg,
    runNow: runAndPost,
    isRunning: () => running,
  };
}
