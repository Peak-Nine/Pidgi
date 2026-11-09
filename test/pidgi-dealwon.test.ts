/**
 * Deal won → Teamleader project: the model's proposal is checked in code, budgets are 60% of
 * gate revenue, and the button's run is resumable without creating a second project.
 * With a fake Teamleader.
 */
import { describe, it, expect } from "vitest";
import os from "os";
import fs from "fs";
import path from "path";
// dealwon.ts reads the data folder on each call, so setting it here (before any test runs) is enough.
process.env.PIDGI_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "pidgi-launch-"));

import {
  internalBudget,
  totals,
  normaliseGroups,
  checkAgainstTeamleader,
  buildPlan,
  executePlan,
  planBlocks,
  resultBlocks,
  savePlan,
  otherLaunchForDeal,
  PLACEHOLDER_TASK,
} from "../slackbot/dealwon.js";

const DEAL = "d-1";
const QUOTE = "q-1";
const input = {
  deal_id: DEAL,
  quotation_id: QUOTE,
  start_date: "2026-12-01",
  description: "Solar as a Service support for Recma.",
  groups: [
    { title: "Gate 1: Discovery (3 months)", revenue: 24999.6, start_date: "2026-12-01", end_date: "2027-02-28", tasks: [{ title: "Field research", hours: 40 }, { title: "Synthesis", hours: 16.5 }] },
    { title: "Gate 2: Pilot design", revenue: 18000, start_date: "2027-03-01", end_date: "2027-06-30", tasks: [{ title: "Pilot plan", hours: null }] },
    { title: "Gate 3: Pilot", revenue: 999, placeholder: true, start_date: "2027-07-01" },
  ],
};

function fakeTl(over: Partial<Record<string, any>> = {}) {
  const calls: { tool: string; args: any }[] = [];
  let n = 0;
  const tl = async (tool: string, args: any) => {
    calls.push({ tool, args });
    const o = over[tool];
    if (typeof o === "function") return o(args);
    if (o !== undefined) return o;
    if (tool === "get_deal") return { data: { id: DEAL, title: "Peak Nine for Recma", status: "open", customer: { type: "company", id: "c-1" } } };
    if (tool === "get_quotation") return { data: { id: QUOTE, status: "open", deal: { id: DEAL }, total: { tax_exclusive: { amount: 43000, currency: "EUR" } } } };
    if (tool === "get_company") return { data: { id: "c-1", name: "Recma" } };
    if (tool.startsWith("create_")) return { data: { id: `${tool}-${++n}`, type: "x" } };
    return {};
  };
  return { tl, calls };
}

describe("budget maths", () => {
  it("internal budget is 60% of revenue, rounded to the euro", () => {
    expect(internalBudget(25000)).toBe(15000);
    expect(internalBudget(18333)).toBe(11000); // 10999.8
    expect(internalBudget(0)).toBe(0);
  });

  it("totals leave placeholder gates out", () => {
    const { groups } = normaliseGroups(input);
    expect(totals(groups)).toEqual({ revenue: 25000 + 18000, budget: 15000 + 10800 });
  });
});

describe("normaliseGroups", () => {
  it("rounds revenue, zeroes placeholders and gives them a placeholder task", () => {
    const { groups, errors, warnings } = normaliseGroups(input);
    expect(errors).toEqual([]);
    expect(groups[0].revenue).toBe(25000);
    expect(groups[2]).toMatchObject({ revenue: 0, placeholder: true, end_date: null });
    expect(groups[2].tasks).toEqual([{ title: PLACEHOLDER_TASK, hours: 0 }]);
    expect(warnings.join(" ")).toMatch(/1 task\(s\) in "Gate 2: Pilot design" have no hours/);
  });

  it("refuses missing revenue, bad dates and an empty structure", () => {
    expect(normaliseGroups({ groups: [] }).errors[0]).toMatch(/groups is empty/);
    const bad = normaliseGroups({ groups: [{ title: "G1", start_date: "2026-02-30", tasks: [{ title: "x", hours: -2 }] }] });
    expect(bad.errors.join(" ")).toMatch(/needs its revenue/);
    expect(bad.errors.join(" ")).toMatch(/not a YYYY-MM-DD date/);
    expect(bad.errors.join(" ")).toMatch(/hours must be a number/);
  });
});

describe("checkAgainstTeamleader", () => {
  const { groups } = normaliseGroups(input);
  it("warns when the gates don't add up to the quotation total", () => {
    const r = checkAgainstTeamleader(groups, { data: { customer: { id: "c" } } }, { data: { deal: { id: DEAL }, total: { tax_exclusive: { amount: 50000 } } } }, DEAL);
    expect(r.errors).toEqual([]);
    expect(r.warnings[0]).toMatch(/€43\.000.*€50\.000/);
  });
  it("blocks a quotation from another deal", () => {
    const r = checkAgainstTeamleader(groups, { data: { customer: { id: "c" } } }, { data: { deal: { id: "other" } } }, DEAL);
    expect(r.errors[0]).toMatch(/another deal/);
  });
});

describe("buildPlan", () => {
  const ctx = { requester: "U1", channel: "C1", thread_ts: "1.0" };

  it("builds a draft from the deal, with the customer from Teamleader and the deal title as default title", async () => {
    const { tl } = fakeTl();
    const { plan, errors } = await buildPlan(input, ctx, tl);
    expect(errors).toEqual([]);
    expect(plan).toMatchObject({ title: "Peak Nine for Recma", customer_id: "c-1", customer_type: "company", customer_name: "Recma", status: "draft" });
    const text = JSON.stringify(planBlocks(plan!));
    expect(text).toContain("€15.000 (60%)");
    expect(text).toContain("Mark won + create project");
  });

  it("asks for a start date instead of guessing one", async () => {
    const { tl, calls } = fakeTl();
    const { plan, errors } = await buildPlan({ ...input, start_date: undefined }, ctx, tl);
    expect(plan).toBeUndefined();
    expect(errors[0]).toMatch(/start_date/);
    expect(calls).toEqual([]);
  });

  it("skips the accept and win steps when Teamleader says they are done", async () => {
    const { tl } = fakeTl({
      get_deal: { data: { id: DEAL, title: "T", status: "won", customer: { type: "company", id: "c-1" } } },
      get_quotation: { data: { id: QUOTE, status: "accepted", deal: { id: DEAL }, total: { tax_exclusive: { amount: 43000 } } } },
    });
    const { plan } = await buildPlan(input, ctx, tl);
    expect(plan!.progress).toMatchObject({ accepted: true, won: true });
  });
});

describe("executePlan", () => {
  const ctx = { requester: "U1", channel: "C1" };

  it("runs the deal-won steps in order with the right amounts", async () => {
    const { tl, calls } = fakeTl();
    const { plan } = await buildPlan(input, ctx, tl);
    calls.length = 0;
    const out = await executePlan(plan!, tl, () => {});
    expect(out.status).toBe("done");
    expect(calls.map((c) => c.tool)).toEqual([
      "accept_quotation",
      "win_deal",
      "create_project_v2",
      "add_project_deal",
      "add_project_quotation",
      "assign_project",
      "create_project_group",
      "create_project_task_v2",
      "create_project_task_v2",
      "create_project_group",
      "create_project_task_v2",
      "create_project_group",
      "create_project_task_v2",
    ]);
    const groups = calls.filter((c) => c.tool === "create_project_group").map((c) => c.args);
    expect(groups[0]).toMatchObject({ billing_method: "fixed_price", fixed_price_amount: 25000, internal_budget_amount: 15000, fixed_price_currency: "EUR", start_date: "2026-12-01", end_date: "2027-02-28" });
    expect(groups[1]).toMatchObject({ fixed_price_amount: 18000, internal_budget_amount: 10800 });
    expect(groups[2]).toMatchObject({ fixed_price_amount: 0, internal_budget_amount: 0 });
    expect(groups[2].end_date).toBeUndefined();
    const tasks = calls.filter((c) => c.tool === "create_project_task_v2").map((c) => c.args);
    expect(tasks[0]).toMatchObject({ title: "Field research", billing_method: "parent_fixed_price", time_estimated_value: 40, time_estimated_unit: "hours" });
    expect(tasks[2].time_estimated_value).toBeUndefined(); // no hours in the offer → no estimate
    expect(calls.find((c) => c.tool === "assign_project")!.args).toEqual({ id: "create_project_v2-1", assignee_type: "user", assignee_id: "1dc0408f-6a00-0039-a953-c67fcb7767f8" });
    expect(JSON.stringify(resultBlocks(out))).toContain("is live in Teamleader");
  });

  it("stops at a failure and the retry continues without a second project", async () => {
    let fail = true;
    const { tl, calls } = fakeTl({
      create_project_task_v2: (a: any) => {
        if (fail && a.title === "Synthesis") throw new Error("rate limited");
        return { data: { id: "t" } };
      },
    });
    const { plan } = await buildPlan(input, ctx, tl);
    calls.length = 0;
    const first = await executePlan(plan!, tl, () => {});
    expect(first.status).toBe("partial");
    expect(first.progress.error).toMatch(/Synthesis.*rate limited/);
    expect(JSON.stringify(resultBlocks(first))).toContain("Retry the rest");

    fail = false;
    calls.length = 0;
    const second = await executePlan(first, tl, () => {});
    expect(second.status).toBe("done");
    expect(calls.map((c) => c.tool)).not.toContain("create_project_v2");
    expect(calls.map((c) => c.tool)).not.toContain("win_deal");
    expect(calls[0]).toMatchObject({ tool: "create_project_task_v2", args: { title: "Synthesis" } });
  });

  it("knows when another card already made a project for the deal", async () => {
    const { tl } = fakeTl();
    const { plan } = await buildPlan(input, ctx, tl);
    plan!.progress.project_id = "p-9";
    savePlan(plan!);
    expect(otherLaunchForDeal(DEAL, "someone-else")?.id).toBe(plan!.id);
    expect(otherLaunchForDeal(DEAL, plan!.id)).toBeNull();
    const again = await buildPlan(input, ctx, tl);
    expect(again.plan!.warnings.join(" ")).toMatch(/already created for this deal/);
  });

  it("never cuts a long gate silently on the card", async () => {
    const { tl } = fakeTl();
    const many = { ...input, groups: [{ ...input.groups[0], tasks: Array.from({ length: 60 }, (_, i) => ({ title: `Deliverable number ${i + 1} with a fairly long descriptive name for the client`, hours: 8 })) }] };
    const { plan } = await buildPlan(many, { requester: "U1", channel: "C1" }, tl);
    const sections = planBlocks(plan!).filter((b: any) => b.type === "section").map((b: any) => b.text.text);
    expect(sections.every((t: string) => t.length <= 3000)).toBe(true);
    expect(sections.join("\n")).toMatch(/…and \d+ more task\(s\), all of them will be created/);
    expect(plan!.groups[0].tasks).toHaveLength(60);
  });
});
