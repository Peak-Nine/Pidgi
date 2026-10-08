import { describe, it, expect, beforeAll } from "vitest";
import { mkdtempSync } from "fs";
import os from "os";
import path from "path";

beforeAll(() => {
  process.env.TENDI_DATA_DIR = mkdtempSync(path.join(os.tmpdir(), "tendi-scout-test-"));
  process.env.SCOUT_POST_GAP_MS = "1";
});

const NOW = new Date("2026-10-07T08:00:00Z");

function opp(over: Partial<import("../tendi/scout/types.js").Opportunity> = {}): import("../tendi/scout/types.js").Opportunity {
  return {
    id: "ted:1-2026",
    source: "ted",
    title: "Strategy review for a philanthropy network",
    buyer: "Some Foundation",
    country: "BEL",
    deadline: "2026-10-30",
    published: "2026-10-05",
    url: "https://example.org/notice/1",
    summary: "Consultancy to design a new strategic framework and theory of change.",
    ...over,
  };
}

describe("scout/filter", () => {
  it("keeps strategy and consultancy work, drops supplies and works", async () => {
    const { prefilter } = await import("../tendi/scout/filter.js");
    expect(prefilter(opp()).keep).toBe(true);
    expect(prefilter(opp({ title: "Supply of office furniture", summary: "Delivery of desks and chairs" })).keep).toBe(false);
    expect(prefilter(opp({ title: "Construction of a school", summary: "civil works, impact on the community" })).keep).toBe(false);
    // a service-type title survives a single negative word
    expect(prefilter(opp({ title: "Feasibility study for a solar panel programme strategy", summary: "" })).keep).toBe(true);
  });

  it("drops national-only consultant roles but keeps international ones", async () => {
    const { prefilter } = await import("../tendi/scout/filter.js");
    expect(prefilter(opp({ title: "UNDP-LAO-00751 - National Monitoring & Evaluation Consultant - UNDP - LAO PDR", summary: "" })).keep).toBe(false);
    expect(prefilter(opp({ title: "UNDP-ETH-1 - IC-National Consultant to Support capacity development - UNDP - ETHIOPIA", summary: "" })).keep).toBe(false);
    expect(prefilter(opp({ title: "UNDP-PNG-00212 - National Climate Finance Consultant - EU-SRBC Project - UNDP - PAPUA NEW GUINEA", summary: "" })).keep).toBe(false);
    expect(prefilter(opp({ title: "Lead consultant on Business and Human Rights (National)", summary: "" })).keep).toBe(false);
    expect(prefilter(opp({ title: "UNDP-MNG-00755 - IC/2026/108 - PFM Lead Consultant (National Consultant) - UNDP - MONGOLIA", summary: "" })).keep).toBe(false);
    expect(prefilter(opp({ title: "UNDP-LSO-00496 - Request for Expression of Interest : Roster of National Consultants - UNDP - LESOTHO", summary: "" })).keep).toBe(false);
    expect(prefilter(opp({ title: "UNDP-MDA-01126 - Qu26/03121:PRIM National Consultant Design Content Creation EVO - UNDP - MOLDOVA", summary: "" })).keep).toBe(false);
    expect(prefilter(opp({ title: "International Consultant for a strategy evaluation", summary: "" })).keep).toBe(true);
    expect(prefilter(opp({ title: "Consultancy for Mapping and Analysis of National Policies and Strategies", summary: "" })).keep).toBe(true);
    expect(prefilter(opp({ title: "Consultant to review the national strategy", summary: "" })).keep).toBe(true);
  });

  it("ignores TED's own category label", async () => {
    const { prefilter } = await import("../tendi/scout/filter.js");
    const o = opp({ title: "Generella utredningstjänster", summary: "", meta: { ted_category: "Business and management consultancy services" } });
    expect(prefilter(o).keep).toBe(false);
  });

  it("counts days to a deadline", async () => {
    const { daysUntil } = await import("../tendi/scout/filter.js");
    expect(daysUntil("2026-10-17", NOW)).toBe(10);
    expect(daysUntil("", NOW)).toBe(null);
  });
});

describe("scout/rss and http decoding", () => {
  it("parses an RSS 1.0 (RDF) feed like UNDP's and decodes entities", async () => {
    const { parseFeed, decodeEntities } = await import("../tendi/scout/rss.js");
    const xml = `<?xml version="1.0" encoding="ISO-8859-1" ?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns="http://purl.org/rss/1.0/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel rdf:about="https://procurement-notices.undp.org/"><title>UNDP</title></channel>
  <item rdf:about="https://procurement-notices.undp.org/view_negotiation.cfm?nego_id=50376">
    <title>UNDP-CIV-1 - Recrutement d'un consultant pour une &amp;#xe9;tude - UNDP - COTE d'IVOIRE</title>
    <link>https://procurement-notices.undp.org/view_negotiation.cfm?nego_id=50376</link>
    <description>Deadline : 16-Oct-26 &lt;br&gt; Strategy work</description>
    <dc:date>2026-10-06T10:00:00Z</dc:date>
  </item>
</rdf:RDF>`;
    const items = parseFeed(xml);
    expect(items.length).toBe(1);
    expect(items[0].title).toContain("étude");
    expect(items[0].date).toBe("2026-10-06");
    expect(decodeEntities("A &#8211; B &rsquo;x&rsquo; &amp;#xe9;")).toBe("A \u2013 B \u2019x\u2019 é");
  });

  it("decodes Windows-1252 bytes in a feed that says ISO-8859-1", async () => {
    const { decodeBody } = await import("../tendi/scout/http.js");
    const buf = Buffer.concat([Buffer.from('<?xml version="1.0" encoding="ISO-8859-1"?><t>SA'), Buffer.from([0x92, 0x73, 0x20, 0x96, 0x20, 0xe9]), Buffer.from("</t>")]);
    expect(decodeBody(buf, "text/xml")).toContain("SA’s – é");
  });

  it("refuses private addresses", async () => {
    const { assertPublicUrl } = await import("../tendi/scout/http.js");
    await expect(assertPublicUrl("http://127.0.0.1/x")).rejects.toThrow();
    await expect(assertPublicUrl("http://localhost/x")).rejects.toThrow();
    await expect(assertPublicUrl("file:///etc/passwd")).rejects.toThrow();
  });
});

describe("scout/sources", () => {
  it("maps a UNDP feed item", async () => {
    const { mapUndpItem, undpCountryFromTitle } = await import("../tendi/scout/sources/undp.js");
    const o = mapUndpItem({
      title: "UNDP-PNG-00213 - National Blue Carbon Strategy Consultant - UNDP - PAPUA NEW GUINEA",
      link: "https://procurement-notices.undp.org/view_negotiation.cfm?nego_id=50376",
      description: "Deadline : 12-Oct-26",
      date: "2026-10-05",
      id: "",
    });
    expect(o.id).toBe("undp:nego-50376");
    expect(o.country).toBe("Papua New Guinea");
    expect(undpCountryFromTitle("no tail here")).toBe("");
  });

  it("maps a TED notice and strips the translated prefix", async () => {
    const { mapNotice, tedQuery } = await import("../tendi/scout/sources/ted.js");
    const o = mapNotice({
      "publication-number": "681546-2026",
      "notice-title": { eng: "Belgium – Research and development consultancy services – Supporting the AI Observatory", fra: "x" },
      "description-proc": { eng: "Support to the observatory" },
      "buyer-name": { eng: ["European Commission &amp; friends"] },
      "buyer-country": ["BEL"],
      "publication-date": "2026-10-05+02:00",
      "deadline-receipt-tender-date-lot": ["2026-11-03+01:00"],
      "notice-type": "cn-standard",
    });
    expect(o.id).toBe("ted:681546-2026");
    expect(o.title).toBe("Supporting the AI Observatory");
    expect(o.buyer).toBe("European Commission & friends");
    expect(o.deadline).toBe("2026-11-03");
    expect(o.meta?.ted_category).toBe("Research and development consultancy services");
    expect(tedQuery("2026-10-04", ["79410000"])).toContain("publication-date >= 20261004");
  });

  it("parses Enabel's tender cards", async () => {
    const { parseEnabelList, parseEnabelDate } = await import("../tendi/scout/sources/enabel.js");
    const html = `<div class="card--news card--tenders">
      <p class="h5"><span>TZA22003-10792 – Public service contract for “Tracer Study”</span></p>
      <p><strong>Country : </strong> Tanzania</p>
      <p><strong>Closing date : </strong> 23 October 2026 13:00</p>
      <div class="hidden__card hidden"><p><strong>Status : </strong> Open</p>
      <a href="https://www.enabel.be/app/uploads/2026/10/TZA22003-10792_Tender-Specifications.pdf">PDF</a></div>
    </div>`;
    const items = parseEnabelList(html);
    expect(items.length).toBe(1);
    expect(items[0].id).toBe("enabel:TZA22003-10792");
    expect(items[0].country).toBe("Tanzania");
    expect(items[0].deadline).toBe("2026-10-23");
    expect(items[0].url).toMatch(/\.pdf$/);
    expect(parseEnabelDate("3 mars 2026")).toBe("2026-03-03");
    expect(parseEnabelDate("soon")).toBe("");
  });

  it("maps a World Bank expression of interest and filters on its title", async () => {
    const { mapWorldbankNotice, worldbankUrl } = await import("../tendi/scout/sources/worldbank.js");
    const { prefilter } = await import("../tendi/scout/filter.js");
    const o = mapWorldbankNotice({
      id: "OP00452966",
      notice_type: "Request for Expression of Interest",
      notice_lang_name: "French",
      submission_date: "2026-10-06T00:00:00Z",
      submission_deadline_date: "2026-10-23T00:00:00Z",
      project_ctry_name: "Niger",
      project_name: "Projet d'appui aux entrepreneurs",
      bid_description: "Recrutement de prestataire pour l'accompagnement post-financement des promoteurs",
      procurement_method_name: "Consultant Qualification Selection",
      contact_organization: "Unité de coordination",
      notice_text: "<p>Le consultant devra assurer l&#39;évaluation, la stratégie, le renforcement...</p>",
    });
    expect(o.id).toBe("worldbank:OP00452966");
    expect(o.deadline).toBe("2026-10-23");
    expect(o.published).toBe("2026-10-06");
    expect(o.url).toContain("procurement-detail/OP00452966");
    expect(o.summary).toContain("l'évaluation");
    expect(prefilter(o).keep).toBe(true);
    // long boilerplate text alone does not let a works title through
    const works = { ...o, title: "Suivi contrôle travaux du kori", meta: { project: "Développement urbain" } };
    expect(prefilter(works).keep).toBe(false);
    expect(worldbankUrl(100)).toContain("procurement_group=CS");
    expect(worldbankUrl(100)).toContain("os=100");
  });

  it("ReliefWeb waits for an appname instead of hitting the wall", async () => {
    delete process.env.RELIEFWEB_APPNAME;
    const { reliefwebAdapter } = await import("../tendi/scout/sources/reliefweb.js");
    const r = await reliefwebAdapter.fetch({ since: "2026-10-04", log: () => undefined });
    expect(r.ok).toBe(true);
    expect(r.items.length).toBe(0);
    expect(r.notes[0]).toMatch(/appname/);
  });
});

describe("scout/scorer batches", () => {
  it("scores items with a document excerpt two at a time", async () => {
    const { makeBatches } = await import("../tendi/scout/scorer.js");
    const items = [{ id: "a", details: "x" }, { id: "b" }, { id: "c", details: "y" }, { id: "d", details: "z" }, { id: "e" }];
    const b = makeBatches(items as any, 10, 2);
    expect(b.map((x: any[]) => x.map((o) => o.id))).toEqual([["a", "c"], ["d"], ["b", "e"]]);
  });
});

describe("scout/scorer", () => {
  it("fills in missing scores and adds deadline flags itself", async () => {
    const { normalizeScores, verdictFor } = await import("../tendi/scout/scorer.js");
    const items = [opp({ id: "a", deadline: "2026-10-10" }), opp({ id: "b" })];
    const out = normalizeScores(items, { scores: [{ id: "a", score: 85, why: "Strategy for a foundation.", flags: [], playbook: "rfp-philea" }, { id: "zzz", score: 99 }] }, NOW);
    expect(out[0].score).toBe(85);
    expect(out[0].verdict).toBe("strong");
    expect(out[0].flags.some((f) => /deadline in 3 days/.test(f))).toBe(true);
    expect(out[1].score).toBe(0);
    expect(out[1].why).toMatch(/Unscored/);
    expect(verdictFor(40)).toBe("possible");
    expect(verdictFor(39)).toBe("weak");
  });

  it("keeps the model's dashes out of the digest", async () => {
    const { houseStyle } = await import("../tendi/scout/scorer.js");
    expect(houseStyle("Impact frameworks for MFIs \u2014 exactly our work.")).toBe("Impact frameworks for MFIs, exactly our work.");
    expect(houseStyle("pages 31\u201335")).toBe("pages 31 to 35");
  });

  it("says when the notice text is thin", async () => {
    const { describeForScoring } = await import("../tendi/scout/scorer.js");
    expect(describeForScoring(opp({ summary: "" }), NOW)).toContain("title only");
  });
});

describe("scout/run + store + digest", () => {
  it("runs end to end with fake sources and a fake model, then dedupes", async () => {
    const { runScout } = await import("../tendi/scout/run.js");
    const { postDigest, itemText } = await import("../tendi/scout/digest.js");
    const store = await import("../tendi/scout/store.js");

    const fakeAdapter = {
      id: "ted" as const,
      fetch: async () => ({
        source: "ted" as const,
        ok: true,
        notes: ["2 notices"],
        items: [opp({ id: "ted:keep" }), opp({ id: "ted:drop", title: "Supply of laptops", summary: "laptops and printers" })],
      }),
    };
    let calls = 0;
    const fakeAnthropic: any = {
      messages: {
        create: async (req: any) => {
          calls++;
          expect(req.tool_choice?.name).toBe("record_scores");
          return { usage: {}, content: [{ type: "tool_use", id: "t", name: "record_scores", input: { scores: [{ id: "ted:keep", score: 82, why: "Strategy for a philanthropy network.", flags: [], playbook: "rfp-philea" }] } }] };
        },
      },
    };

    const run = await runScout({ anthropic: fakeAnthropic, trigger: "manual", adapters: [fakeAdapter], log: () => undefined, now: NOW });
    expect(calls).toBe(1);
    expect(run.summary.newItems).toBe(2);
    expect(run.summary.prefiltered).toBe(1);
    expect(run.scored[0].scored.score).toBe(82);
    expect(store.isSeen("ted:keep")).toBe(true);
    expect(store.isSeen("ted:drop")).toBe(true);
    expect(itemText(run.scored[0], NOW)).toContain("Fit 82/100 (strong)");

    const posted: any[] = [];
    const slack = { chat: { postMessage: async (args: any) => (posted.push(args), { ts: `100.${posted.length}` }) } };
    const r = await postDigest(slack, "C1", run, NOW);
    expect(r.posted).toBe(1);
    expect(posted[0].text).toContain("Scout");
    expect(posted[1].thread_ts).toBe(r.headerTs);
    expect(posted[1].reply_broadcast).toBe(true);

    // reactions attribute to the item, digest threads resolve to their items
    expect(store.itemForMessage("C1", posted.length > 1 ? "100.2" : "")?.id).toBe("ted:keep");
    expect(store.itemsForDigest("C1", r.headerTs)?.map((x) => x.id)).toEqual(["ted:keep"]);

    // second run: nothing new, no model call
    const run2 = await runScout({ anthropic: fakeAnthropic, trigger: "manual", adapters: [fakeAdapter], log: () => undefined, now: NOW });
    expect(run2.summary.newItems).toBe(0);
    expect(calls).toBe(1);
  });

  it("keeps one verdict per person per item", async () => {
    const store = await import("../tendi/scout/store.js");
    store.addFeedback({ itemId: "x", title: "X", buyer: "B", verdict: "up", by: "U1", at: 1 });
    store.addFeedback({ itemId: "x", title: "X", buyer: "B", verdict: "down", by: "U1", at: 2 });
    let fb = store.recentFeedback();
    expect(fb.up.find((f) => f.itemId === "x")).toBeUndefined();
    expect(fb.down.find((f) => f.itemId === "x")).toBeDefined();
    store.removeFeedback("x", "U1", "up"); // removing the old 👍 must not remove the 👎
    fb = store.recentFeedback();
    expect(fb.down.find((f) => f.itemId === "x")).toBeDefined();
    store.removeFeedback("x", "U1", "down");
    expect(store.recentFeedback().down.find((f) => f.itemId === "x")).toBeUndefined();
  });

  it("hands an item to Tendi with its gaps marked", async () => {
    const { scoutItemBlock } = await import("../tendi/scout/handoff.js");
    const t = scoutItemBlock({ id: "enabel:1", title: "T", buyer: "Enabel", deadline: "", url: "https://x", firstSeen: 1 });
    expect(t).toContain("deadline: (not given by the source)");
    expect(t).toContain("Scout had only the title");
  });
});

describe("scout/pdf reader", () => {
  const TOC = [
    "1 General Remarks ............................................................ 5",
    "3 Award Procedure ............................................................ 8",
    "15. Award criteria ........................................................... 14",
    "4 Special Contractual Provisions ............................................. 16",
    "5 Terms of reference ......................................................... 25",
    "6 Selection file ............................................................. 33",
    "7 Overview of the documents to be submitted ................................. 35",
  ].join("\n");

  it("finds the decisive pages through the table of contents", async () => {
    const mod: any = await import("../tendi/scout/pdf-pages.mjs" + "");
    const entries = mod.tocEntries(TOC);
    expect(entries.length).toBe(7);
    const pick = mod.pickPages(entries, 43, 12);
    expect(pick.sections).toEqual({ award: 14, tor: 25, selection: 33 });
    expect(pick.pages).toEqual([1, 2, 14, 15, 25, 26, 27, 28, 29, 30, 33, 34]);
  });

  it("works on the French Enabel template too", async () => {
    const mod: any = await import("../tendi/scout/pdf-pages.mjs" + "");
    const fr = "15. Critères d'attribution .............................. 14\n5 Termes de référence ................................. 27\n6 Dossier de sélection ..............................31\n7 Récapitulatif des documents à remettre ............. 34";
    const pick = mod.pickPages(mod.tocEntries(fr), 51, 12);
    expect(pick.sections).toEqual({ award: 14, tor: 27, selection: 31 });
    expect(pick.pages).toContain(31);
    expect(pick.pages).not.toContain(34);
  });

  it("picks the tender specifications among the attachments", async () => {
    const { pickTenderPdf } = await import("../tendi/scout/sources/enabel.js");
    expect(pickTenderPdf(["https://x/BFA-PUB_Invitation.pdf", "https://x/BFA-CSC_PUB.pdf"])).toBe("https://x/BFA-CSC_PUB.pdf");
    expect(pickTenderPdf(["https://x/a.docx"])).toBeUndefined();
  });

  it("a broken PDF stops only the helper process", async () => {
    const { runPdfHelper } = await import("../tendi/scout/sources/enabel.js");
    const { writeFileSync } = await import("fs");
    const f = path.join(os.tmpdir(), `not-a-pdf-${Date.now()}.pdf`);
    writeFileSync(f, "hello, this is not a pdf");
    const r = await runPdfHelper(f, 12, 30_000);
    expect(r.ok).toBe(false);
  }, 40_000);
});

describe("scout/env", () => {
  it("honours an explicit 0", async () => {
    const { envInt } = await import("../tendi/scout/env.js");
    expect(envInt("X", 6, { X: "0" } as any)).toBe(0);
    expect(envInt("X", 6, {} as any)).toBe(6);
    expect(envInt("X", 6, { X: "abc" } as any)).toBe(6);
  });
});

describe("scout/service", () => {
  it("schedules once per local day on the chosen weekdays", async () => {
    const { isDue, localClock, scoutConfig, verdictFromReaction, completedOn, MAX_ATTEMPTS_PER_DAY } = await import("../tendi/scout/service.js");
    const cfg = scoutConfig({ SCOUT_CHANNEL: "C1", SCOUT_TIME: "7:30", SCOUT_DAYS: "1,2,3,4,5" } as any);
    expect(cfg.time).toBe("07:30");
    expect(cfg.latest).toBe("20:00");
    const fresh = { completed: false, attempts: 0 };
    // 2026-10-07 is a Wednesday; 05:20 UTC = 07:20 in Brussels (CEST)
    expect(localClock(new Date("2026-10-07T05:20:00Z"), "Europe/Brussels")).toEqual({ day: "2026-10-07", weekday: 3, hhmm: "07:20" });
    expect(isDue(cfg, new Date("2026-10-07T05:20:00Z"), fresh)).toBe(false);
    expect(isDue(cfg, new Date("2026-10-07T05:31:00Z"), fresh)).toBe(true);
    // a finished run today, or too many crashed attempts, means no more runs today
    expect(isDue(cfg, new Date("2026-10-07T05:31:00Z"), { completed: true, attempts: 1 })).toBe(false);
    expect(isDue(cfg, new Date("2026-10-07T05:31:00Z"), { completed: false, attempts: 1 })).toBe(true);
    expect(isDue(cfg, new Date("2026-10-07T05:31:00Z"), { completed: false, attempts: MAX_ATTEMPTS_PER_DAY })).toBe(false);
    // a deploy at 23:58 does not post a digest at midnight
    expect(isDue(cfg, new Date("2026-10-07T21:58:00Z"), fresh)).toBe(false);
    // Saturday 10 Oct 2026
    expect(isDue(cfg, new Date("2026-10-10T09:00:00Z"), fresh)).toBe(false);
    // what counts as "done today"
    const at = new Date("2026-10-08T05:35:00Z").getTime();
    expect(completedOn("2026-10-08", [{ finishedAt: at, trigger: "schedule", posted: 0 }], "Europe/Brussels")).toBe(true);
    expect(completedOn("2026-10-08", [{ finishedAt: at, trigger: "manual", posted: 0 }], "Europe/Brussels")).toBe(false);
    expect(completedOn("2026-10-08", [{ finishedAt: at, trigger: "manual", posted: 5 }], "Europe/Brussels")).toBe(true);
    expect(completedOn("2026-10-09", [{ finishedAt: at, trigger: "schedule", posted: 3 }], "Europe/Brussels")).toBe(false);
    // Monday and Thursday by default, looking back far enough to cover the gap
    const { lookbackFor } = await import("../tendi/scout/service.js");
    expect(scoutConfig({ SCOUT_CHANNEL: "C1" } as any).days).toEqual([1, 4]);
    expect(lookbackFor([1, 4])).toBe(5);
    expect(lookbackFor([1, 2, 3, 4, 5])).toBe(4);
    expect(scoutConfig({} as any).enabled).toBe(false);
    expect(verdictFromReaction("+1::skin-tone-3")).toBe("up");
    expect(verdictFromReaction("thumbsdown")).toBe("down");
    expect(verdictFromReaction("tada")).toBe(null);
  });
});
