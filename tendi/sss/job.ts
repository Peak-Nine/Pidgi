/**
 * Everything Tendi does for Scale & Sustain Stories:
 *
 *   runWeekly()        Monday 08:30 Brussels: pick a case, write the copy, find the logo,
 *                      build the Canva copy, log it in Notion, post it in the channel
 *   handleRepeat()     🔁 from Niels or Jonas: mark the post "Review if still relevant", build another
 *   handleLogoReply()  a logo file or link in the thread of a post without a logo: add it, post the new PDF
 *   postIntro()        once: the introduction, then issue #01 (Village Enterprise)
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import sharp from "sharp";
import type Anthropic from "@anthropic-ai/sdk";
import { dataDir } from "../state.js";
import { SSS, sssAllowedUsers } from "./config.js";
import { loadLibrary, readableCase, guessOrgWebsite, verifyWebsite, type Library } from "./library.js";
import { pickCase, weekSeed } from "./pick-case.js";
import { writeCopy } from "./copy-writer.js";
import { validateCopy } from "./validate-copy.js";
import { findLogo, makeLogoVariants, type LogoVariants } from "./logo-finder.js";
import { buildPost, addLogoLater, exportFiles, type CanvaLike } from "./canva-build.js";
import { listSeriesEntries, createEntry, updateNotes, markReplaced, buildsThisWeek, weekStartBrussels, isoDate, brusselsDay, type NotionLike, type SeriesEntry } from "./notion-log.js";
import { INTRO_TEXT, postText, whyLine, postWithFiles, replacedText, limitText, notAllowedText, failText, logoAskText } from "./slack-messages.js";
import firstPost from "./examples/village-enterprise.json";

const N = SSS.notion;
const shortOrg = (name: string) => String(name).replace(/\s*\(.*?\)\s*/g, " ").trim();
export const pdfName = (n: number, org: string) => `${SSS.designTitle(n, org).replace(/[^\w&#: -]/g, "")}.pdf`;
const orgFromTitle = (title: string) => title.replace(/^.*?:\s*/, "");

// ── small local memory: which designs still wait for a logo, and whether the intro ran ──
interface SssState {
  awaitingLogo: Record<string, { org: string; issueNo: number; threadTs: string }>; // designId -> post
  introPosted?: Record<string, string>; // channel -> ISO time
  week?: { monday: string; attempts: number; done: boolean };
}
function stateFile(): string {
  const d = path.join(dataDir(), "tendi-sss");
  try {
    mkdirSync(d, { recursive: true });
  } catch {
    /* ignore */
  }
  return path.join(d, "state.json");
}
export function loadSssState(): SssState {
  try {
    const f = stateFile();
    if (existsSync(f)) return { awaitingLogo: {}, ...JSON.parse(readFileSync(f, "utf8")) };
  } catch {
    /* fresh */
  }
  return { awaitingLogo: {} };
}
export function saveSssState(s: SssState): void {
  try {
    writeFileSync(stateFile(), JSON.stringify(s, null, 2));
  } catch {
    /* memory only */
  }
}

export interface SssDeps {
  slack: any; // Bolt app.client
  notion: NotionLike;
  canva: CanvaLike | null;
  anthropic: Pick<Anthropic, "messages">;
  model: string;
  slackToken: string;
  channel?: string;
  allowedUserIds?: string[];
  log?: { info: (m: string) => void; warn: (m: string) => void; error: (m: string, e?: unknown) => void };
  /** Tests only: skip the live library. */
  library?: () => Promise<Library>;
  /** Tests only: no real logo lookup. */
  logoLookup?: (site: string, org: string) => Promise<LogoVariants>;
}

export function createScaleSustain(deps: SssDeps) {
  const { slack, notion, anthropic, model, slackToken } = deps;
  const channel = deps.channel || SSS.channelId;
  const allowed = deps.allowedUserIds || sssAllowedUsers();
  const log = deps.log || { info: (m: string) => console.log(`[sss] ${m}`), warn: (m: string) => console.warn(`[sss] ${m}`), error: (m: string, e?: unknown) => console.error(`[sss] ${m}`, e ?? "") };
  const library = deps.library || (() => loadLibrary());
  let busy = false;

  function canvaOrThrow(): CanvaLike {
    if (!deps.canva) throw new Error("Canva is not connected to Tendi (check canva_status)");
    return deps.canva;
  }

  async function lookupLogo(site: string, org: string): Promise<LogoVariants> {
    if (deps.logoLookup) return deps.logoLookup(site, org);
    const found = await findLogo(site, { orgName: org });
    log.info(`logo for ${org} from ${found.source}`);
    return makeLogoVariants(found.buffer);
  }

  async function buildAndPost({ now = new Date(), threadTs = null as string | null, isRebuild = false } = {}) {
    const canva = canvaOrThrow();
    const lib = await library();
    const entries = await listSeriesEntries(notion);
    const featured = new Set(entries.map((e) => e.caseId).filter(Boolean));
    const byId = new Map(lib.cases.map((c) => [c.id, c]));
    const recent = entries.filter((e) => e.status !== N.statusReplaced).map((e) => ({ ...e, region: byId.get(e.caseId)?.region }));
    const c = pickCase(lib.cases, { featuredIds: featured, recent, seed: weekSeed(now) + entries.length });
    if (!c) throw new Error("there is no eligible case left in the library");

    const readable = readableCase(c, lib.cards);
    const org = shortOrg(c.org);
    const deck = await writeCopy({ anthropic, model, readable, raw: c });

    // The logo: always from the organisation's own website, never another source.
    let logo: LogoVariants | null = null;
    const site = guessOrgWebsite(c) || (deck.website ? await verifyWebsite(deck.website, org) : null);
    try {
      if (!site) throw new Error("no website among the case sources");
      logo = await lookupLogo(site, org);
    } catch (e: any) {
      log.warn(`no logo for ${org}: ${e?.message || e}`);
    }

    const issueNo = Math.max(0, ...entries.map((e) => e.issueNo || 0)) + 1;
    const built = await buildPost({ canva, deck, issueNo, org, logo });

    const page = await createEntry(notion, {
      issueNo,
      org,
      caseId: c.id,
      designId: built.designId,
      routes: readable.routes,
      theme: c.theme,
      canvaUrl: built.editUrl,
      caseLink: readable.library_link,
      publishDate: isoDate(weekStartBrussels(now)),
      caption: deck.caption,
      tags: deck.tags,
      notesForTeam: deck.notes_for_team,
    });

    const posted = await postWithFiles(slack, {
      channel,
      threadTs,
      broadcast: true,
      text: postText({
        issueNo,
        org,
        isRebuild,
        why: whyLine(readable),
        canvaUrl: built.editUrl,
        notionUrl: page.url,
        caseLink: readable.library_link,
        tags: deck.tags,
        hasLogo: Boolean(logo),
        notesForTeam: deck.notes_for_team,
        exportNote: built.exportNote,
      }),
      pdf: built.pdf,
      cover: built.cover,
      pdfName: pdfName(issueNo, org),
      caption: deck.caption,
    });
    const rootTs = threadTs || posted.ts;
    if (!logo) {
      const st = loadSssState();
      st.awaitingLogo[built.designId] = { org, issueNo, threadTs: rootTs };
      saveSssState(st);
      await slack.chat.postMessage({ channel, thread_ts: rootTs, text: logoAskText(org) });
    }

    await updateNotes(notion, page.id, { caseId: c.id, designId: built.designId, slackTs: posted.ts, threadTs: rootTs, routes: readable.routes, theme: c.theme }, posted.permalink || undefined);
    log.info(`posted #${issueNo} ${org} (${c.id}), design ${built.designId}`);
    return { issueNo, org, caseId: c.id, designId: built.designId, notionUrl: page.url, slackTs: posted.ts };
  }

  async function exclusive<T>(fn: () => Promise<T>): Promise<T | { busy: true }> {
    if (busy) return { busy: true };
    busy = true;
    try {
      return await fn();
    } finally {
      busy = false;
    }
  }

  /** Does this week (Brussels) already have a live post? */
  function weekHasPost(entries: SeriesEntry[], now: Date): boolean {
    const monday = isoDate(weekStartBrussels(now));
    return entries.some((e) => brusselsDay(e.created) >= monday && e.status !== N.statusReplaced);
  }

  /** Monday 08:30. Runs once per week: if this week already has a live post, it stops. */
  async function runWeekly(now = new Date()) {
    return exclusive(async () => {
      const entries = await listSeriesEntries(notion);
      if (weekHasPost(entries, now)) {
        log.info("this week already has a post; skipping");
        return { skipped: true as const };
      }
      try {
        return await buildAndPost({ now });
      } catch (e: any) {
        log.error("weekly build failed", e);
        await slack.chat.postMessage({ channel, text: failText(String(e?.message || e)) });
        throw e;
      }
    });
  }

  /** 🔁 as a reaction (event.type reaction_added) or in a thread reply. */
  function isRepeatSignal(event: { type: string; reaction?: string; text?: string }): boolean {
    if (event.type === "reaction_added") return String(event.reaction || "").split("::")[0] === SSS.repeatEmoji;
    if (event.type === "message") return /🔁|:repeat:/.test(event.text || "");
    return false;
  }

  async function handleRepeat({ userId, userName, messageTs, threadTs }: { userId: string; userName?: string; messageTs: string; threadTs?: string | null }) {
    const entries = await listSeriesEntries(notion);
    // A reaction points at a post's own message; a thread reply points at the thread.
    const live = entries.filter((e) => e.status !== N.statusReplaced);
    const target = live.find((e) => e.slackTs === messageTs) || (threadTs ? live.find((e) => e.threadTs === threadTs || e.slackTs === threadTs) : undefined);
    if (!target) return { ignored: true as const };
    const rootTs = target.threadTs || target.slackTs;

    if (!allowed.includes(userId)) {
      await slack.chat.postMessage({ channel, thread_ts: rootTs, text: notAllowedText() });
      return { refused: true as const };
    }
    if (buildsThisWeek(entries) >= SSS.maxBuildsPerWeek) {
      await slack.chat.postMessage({ channel, thread_ts: rootTs, text: limitText() });
      return { limited: true as const };
    }
    if (busy) {
      await slack.chat.postMessage({ channel, thread_ts: rootTs, text: "I’m already building a post. Give me a few minutes." });
      return { busy: true as const };
    }
    const org = orgFromTitle(target.title);
    await markReplaced(notion, target.pageId, target, userName || userId);
    await slack.chat.postMessage({ channel, thread_ts: rootTs, text: replacedText(userName || "Someone", org) });
    return exclusive(async () => {
      try {
        return await buildAndPost({ threadTs: rootTs, isRebuild: true });
      } catch (e: any) {
        log.error("rebuild failed", e);
        await slack.chat.postMessage({ channel, thread_ts: rootTs, text: failText(String(e?.message || e)) });
        throw e;
      }
    });
  }

  /** Someone posted a logo file (or an image link) in the thread of a post that waits for one. */
  async function handleLogoReply({ threadTs, files = [], text = "" }: { threadTs: string; files?: any[]; text?: string }) {
    const st = loadSssState();
    const waiting = Object.entries(st.awaitingLogo).find(([, v]) => v.threadTs === threadTs);
    if (!waiting) return { ignored: true as const };
    const [designId, post] = waiting;

    let buffer: Buffer | null = null;
    const file = files.find((f) => /^image\//.test(f?.mimetype || "") || /\.(png|jpe?g|svg|webp)$/i.test(f?.name || ""));
    if (file) {
      const r = await fetch(file.url_private_download || file.url_private, { headers: { Authorization: `Bearer ${slackToken}` } });
      if (!r.ok) throw new Error(`could not download the file from Slack (${r.status})`);
      buffer = Buffer.from(await r.arrayBuffer());
    } else {
      const link = (text.match(/<?(https?:\/\/[^\s>|]+)/) || [])[1];
      if (!link) return { ignored: true as const };
      const r = await fetch(link, { signal: AbortSignal.timeout(20_000) });
      if (!r.ok || !/image|svg/.test(r.headers.get("content-type") || "")) return { ignored: true as const };
      buffer = Buffer.from(await r.arrayBuffer());
    }
    try {
      const png = await sharp(buffer, { density: 600 }).png().toBuffer();
      const logo = await makeLogoVariants(png);
      const out = await addLogoLater({ canva: canvaOrThrow(), designId, logo, org: post.org });
      delete st.awaitingLogo[designId];
      saveSssState(st);
      await postWithFiles(slack, {
        channel,
        threadTs,
        text: `Logo added for ${post.org} on pages 1 to 8. Here are the updated PDF and cover.${out.exportNote ? ` (${out.exportNote})` : ""}`,
        pdf: out.pdf,
        cover: out.cover,
        pdfName: pdfName(post.issueNo, post.org),
      });
      return { updated: true as const };
    } catch (e: any) {
      await slack.chat.postMessage({ channel, thread_ts: threadTs, text: `I couldn’t add that logo: ${e?.message || e}. A PNG with a transparent background works best.` });
      return { failed: true as const };
    }
  }

  /**
   * Once, after deploy: the intro message, then issue #01 (Village Enterprise), built and
   * approved in Canva on 7 Nov 2026, and its Content Calendar entry gets the Slack message.
   */
  async function postIntro({ force = false } = {}) {
    const st = loadSssState();
    const already = st.introPosted?.[channel];
    if (already && !force) return { skipped: true as const, introPostedAt: already };
    const canva = canvaOrThrow();
    const lib = await library();
    const c = lib.cases.find((x) => x.id === firstPost.caseId);
    if (!c) throw new Error(`case ${firstPost.caseId} is no longer in the library`);
    const readable = readableCase(c, lib.cards);
    const { deck, problems } = validateCopy(firstPost.deck, c);
    if (problems.length) log.warn(`first post copy: ${problems.join("; ")}`);
    const files = await exportFiles(canva, firstPost.designId);

    const entries = await listSeriesEntries(notion);
    const existing = entries.find((e) => e.caseId === firstPost.caseId) || entries.find((e) => e.issueNo === 1);
    let page: { pageId: string; url: string };
    if (existing) page = { pageId: existing.pageId, url: existing.url };
    else {
      log.warn("#01 not found in the Content Calendar; creating it");
      const created = await createEntry(notion, {
        issueNo: 1,
        org: firstPost.org,
        caseId: c.id,
        designId: firstPost.designId,
        routes: readable.routes,
        theme: c.theme,
        canvaUrl: firstPost.canvaUrl,
        caseLink: readable.library_link,
        publishDate: isoDate(weekStartBrussels(new Date())),
        caption: deck.caption,
        tags: deck.tags,
        notesForTeam: firstPost.notesForTeam,
      });
      page = { pageId: created.id, url: created.url };
    }

    await slack.chat.postMessage({ channel, text: INTRO_TEXT, unfurl_links: false, unfurl_media: false });
    const posted = await postWithFiles(slack, {
      channel,
      text: postText({
        issueNo: 1,
        org: firstPost.org,
        why: whyLine(readable),
        canvaUrl: firstPost.canvaUrl,
        notionUrl: page.url,
        caseLink: readable.library_link,
        tags: deck.tags,
        hasLogo: true,
        notesForTeam: firstPost.notesForTeam,
        exportNote: files.exportNote,
      }),
      pdf: files.pdf,
      cover: files.cover,
      pdfName: pdfName(1, firstPost.org),
      caption: deck.caption,
    });
    await updateNotes(notion, page.pageId, { caseId: c.id, designId: firstPost.designId, slackTs: posted.ts, threadTs: posted.ts, routes: readable.routes, theme: c.theme }, posted.permalink || undefined);
    const after = loadSssState();
    after.introPosted = { ...(after.introPosted || {}), [channel]: new Date().toISOString() };
    saveSssState(after);
    return { posted: true as const, ts: posted.ts, channel, notionUrl: page.url };
  }

  return { runWeekly, handleRepeat, handleLogoReply, isRepeatSignal, postIntro, buildAndPost, isBusy: () => busy, channel };
}

export type ScaleSustain = ReturnType<typeof createScaleSustain>;
