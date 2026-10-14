import { describe, it, expect } from "vitest";

const GIZ_HTML = `<table><thead><tr><th>Datum</th><th>Frist</th><th>Bezeichnung</th><th>Typ</th><th>Stelle</th><th>Aktion</th></tr></thead><tbody>
<tr>
  <td class="text-center"><abbr title='13.10.2026 um 05:54 Uhr'>13.10.2026</abbr></td>
  <td class="text-center"><abbr title='12.11.2026 um 12:00 Uhr'>12.11.2026</abbr></td>
  <td class="word-break">10032371 - Strengthening reproductive health and empowerment of young women</td>
  <td> VgV<br />TNW </td>
  <td>Deutsche Gesellschaft für Internationale Zusammenarbeit (GIZ) GmbH</td>
  <td class="text-center"><a class="noTextDecorationLink" href="/Satellite/public/company/projectForwarding.do?pid=53093" target="_blank"><img src="x.gif"></a></td>
</tr>
<tr>
  <td class="text-center"><abbr title='12.10.2026 um 10:00 Uhr'>12.10.2026</abbr></td>
  <td class="text-center">nv</td>
  <td class="word-break">Strategische Beratung regionales Energieprojekt</td>
  <td> UVgO<br />Vergebener Auftrag </td>
  <td>GIZ</td>
  <td class="text-center"><a href="/Satellite/public/company/projectForwarding.do?pid=53140"></a></td>
</tr>
<tr>
  <td class="text-center"><abbr title='10.10.2026 um 09:00 Uhr'>10.10.2026</abbr></td>
  <td class="text-center"><abbr title='26.10.2026 um 10:00 Uhr'>26.10.2026</abbr></td>
  <td class="word-break">Solaranlagen je 38,4 kWp</td>
  <td> VgV<br />Ausschreibung </td>
  <td>GIZ</td>
  <td class="text-center"><a href="/Satellite/public/company/projectForwarding.do?pid=53102"></a></td>
</tr>
</tbody></table>
<div class='browsePagesText'>Seite: 2 von 13 - Gesamteinträge: 249</div>`;

describe("scout/sources/giz", () => {
  it("parses the GIZ list table: dates, procedure, open or closed, pid", async () => {
    const { parseGizList, mapGizRow, splitGizTitle } = await import("../tendi/scout/sources/giz.js");
    const p = parseGizList(GIZ_HTML);
    expect(p.page).toBe(2);
    expect(p.pages).toBe(13);
    expect(p.total).toBe(249);
    expect(p.rows).toHaveLength(3);
    const [rh, awarded, solar] = p.rows;
    expect(rh.published).toBe("2026-10-13");
    expect(rh.deadline).toBe("2026-11-12");
    expect(rh.deadlineTime).toBe("12:00");
    expect(rh.reference).toBe("10032371");
    expect(rh.title).toBe("Strengthening reproductive health and empowerment of young women");
    expect(rh.procedure).toBe("VgV · TNW");
    expect(rh.open).toBe(true);
    expect(rh.pid).toBe("53093");
    expect(awarded.open).toBe(false);
    expect(awarded.deadline).toBe("");
    expect(solar.open).toBe(true);
    const o = mapGizRow(rh);
    expect(o.id).toBe("giz:53093");
    expect(o.url).toContain("pid=53093");
    expect(o.title).toBe("10032371 - Strengthening reproductive health and empowerment of young women");
    expect(o.meta?.procedure).toBe("VgV · TNW");
    expect(splitGizTitle("10038801X-Expert Pool: Demand-driven")).toEqual({ reference: "10038801X", title: "Expert Pool: Demand-driven" });
    expect(splitGizTitle("Batteriesysteme je 60 kWh").reference).toBe("");
  });

  it("judges GIZ items on the title, so a solar supply is dropped and a strategy tender kept", async () => {
    const { parseGizList, mapGizRow } = await import("../tendi/scout/sources/giz.js");
    const { prefilter } = await import("../tendi/scout/filter.js");
    const rows = parseGizList(GIZ_HTML).rows;
    expect(prefilter(mapGizRow(rows[0])).keep).toBe(true); // reproductive health, empowerment
    expect(prefilter(mapGizRow(rows[2])).keep).toBe(false);
    expect(prefilter(mapGizRow({ ...rows[0], title: "Strategic Advisory on Humanitarian Programming" })).keep).toBe(true);
  });
});

describe("notion-board", () => {
  it("builds a card from a Scout record and maps the source, fit and playbook", async () => {
    const { cardFromScout, boardEnabled } = await import("../tendi/notion-board.js");
    delete process.env.NOTION_TOKEN;
    expect(boardEnabled()).toBe(false);
    const c = cardFromScout(
      {
        id: "giz:53093",
        source: "giz",
        title: "10032371 - Strengthening reproductive health and empowerment of young women",
        buyer: "GIZ",
        country: "",
        deadline: "2026-11-10",
        url: "https://ausschreibungen.giz.de/Satellite/public/company/projectForwarding.do?pid=53093",
        score: { score: 71, verdict: "possible", why: "Health, but VgV and consortium-sized.", flags: ["participation competition"], playbook: "rfp-philea" },
      },
      "Relevant"
    );
    expect(c.name).toBe("GIZ · 10032371 - Strengthening reproductive health and empowerment of young women");
    expect(c.stage).toBe("Relevant");
    expect(c.source).toBe("GIZ");
    expect(c.reference).toBe("53093");
    expect(c.fit).toBe("Possible");
    expect(c.playbook).toBe("rfp-philea");
    expect(c.why).toContain("Flags: participation competition");
    expect(c.added_by).toBe("Scout");
    expect(c.deadline).toBe("2026-11-10");
  });

  it("writes only the fields given, with the board's property names", async () => {
    const { toProperties } = await import("../tendi/notion-board.js");
    const { properties, notes } = await toProperties({ name: "Oxfam · Facilitation Bangkok", stage: "Submitted", submitted_on: "2026-10-12", estimated_value: "15,000 EUR", debrief_received: false });
    expect(Object.keys(properties).sort()).toEqual(["Debrief received", "Estimated value", "Name", "Stage", "Submitted on"]);
    expect(properties["Stage"]).toEqual({ status: { name: "Submitted" } });
    expect(properties["Submitted on"]).toEqual({ date: { start: "2026-10-12" } });
    expect(notes).toEqual([]);
  });
});
