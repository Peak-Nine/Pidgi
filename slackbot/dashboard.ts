/**
 * Live web dashboard served by the bot (read-only).
 *
 * GET /dashboard?key=<DASHBOARD_KEY> returns an HTML page that pulls live data
 * from Teamleader (via the connected MCP client) and renders:
 *   - a team capacity heatmap (people x next 6 weeks, planned vs available), and
 *   - an open-projects overview (name, window/lead time, revenue).
 *
 * Server-rendered plain HTML/CSS (no external libraries), light mode.
 * Protected by a shared key in the URL (DASHBOARD_KEY); disabled if unset.
 */

async function tl(mcp: any, tool: string, args: any): Promise<any> {
  const r: any = await mcp.callTool({ name: "teamleader_" + tool, arguments: args || {} });
  const text = Array.isArray(r?.content)
    ? r.content.map((c: any) => (typeof c?.text === "string" ? c.text : "")).join("")
    : "";
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

function monday(d: Date): Date {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}
function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}
function esc(s: any): string {
  return String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));
}

function cellColor(util: number): string {
  if (util <= 0) return "#eef2f0";
  if (util <= 0.5) return "#d8f0e2";
  if (util <= 0.85) return "#fdf0c8";
  if (util <= 1.0) return "#fbd9b0";
  return "#f6c0c0";
}

const eur = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

export async function renderDashboard(mcp: any): Promise<string> {
  const start = monday(new Date());
  const end = addDays(start, 41); // 6 weeks
  const weekStarts = [0, 7, 14, 21, 28, 35].map((n) => iso(addDays(start, n)));

  const usersR = await tl(mcp, "list_users", { page_size: 100 });
  const users = (usersR.data || []).map((u: any) => ({
    id: u.id,
    name: (u.first_name || "").trim() || u.email || u.id,
  }));

  const availR = await tl(mcp, "get_user_availability_daily", {
    start_date: iso(start),
    end_date: iso(end),
    assignees: users.map((u: any) => ({ type: "user", id: u.id })),
  });
  const availByUser: Record<string, any[]> = {};
  (availR.data || []).forEach((row: any) => {
    availByUser[row.user.id] = (row.availabilities || []).map((a: any) => ({
      date: a.date,
      planned: (a.availability?.planned_time?.value || 0) / 60,
      net: (a.availability?.net_time_available?.value || 0) / 60,
    }));
  });

  const projR = await tl(mcp, "list_projects_v2", { status: "open", page_size: 100 });
  const projects = (projR.data || [])
    .map((p: any) => ({
      title: p.title,
      start: p.start_date,
      end: p.end_date,
      revenue: (p.external_budget && p.external_budget.amount) || (p.price && p.price.amount) || 0,
    }))
    .sort((a: any, b: any) => (b.revenue || 0) - (a.revenue || 0));

  // Build capacity rows.
  const capRows = users
    .map((u: any) => {
      const days = availByUser[u.id] || [];
      const cells = weekStarts.map((ws, i) => {
        const next = weekStarts[i + 1];
        let planned = 0, net = 0;
        for (const d of days) {
          if (d.date >= ws && (i === weekStarts.length - 1 || d.date < next)) {
            planned += d.planned;
            net += d.net;
          }
        }
        const util = net > 0 ? planned / net : planned > 0 ? 1.5 : 0;
        return { planned, net, util };
      });
      const hasAny = cells.some((c) => c.net > 0 || c.planned > 0);
      return { name: u.name, cells, hasAny };
    })
    .filter((r: any) => r.hasAny);

  const headCols = weekStarts.map((w) => `<th>wk ${esc(w.slice(5))}</th>`).join("");
  const bodyRows = capRows
    .map((r: any) => {
      const tds = r.cells
        .map((c: any) => {
          const pct = c.net > 0 ? Math.round(c.util * 100) : c.planned > 0 ? null : 0;
          const label = c.net > 0 ? `${Math.round(c.planned)}/${Math.round(c.net)}h` : c.planned > 0 ? `${Math.round(c.planned)}h` : "0";
          return `<td style="background:${cellColor(c.util)}"><div class="h">${esc(label)}</div><div class="p">${pct === null ? "" : pct + "%"}</div></td>`;
        })
        .join("");
      return `<tr><th class="name">${esc(r.name)}</th>${tds}</tr>`;
    })
    .join("");

  const projRows = projects
    .map(
      (p: any) =>
        `<tr><td>${esc(p.title)}</td><td>${esc(p.start || "?")} → ${esc(p.end || "?")}</td><td class="r">${p.revenue ? esc(eur.format(p.revenue)) : "—"}</td></tr>`
    )
    .join("");

  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Peak Nine — Planning dashboard</title>
<style>
:root{color-scheme:light}
body{margin:0;background:#faf9f5;color:#1f1e1b;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:14px}
.wrap{max-width:1100px;margin:0 auto;padding:24px}
h1{font-size:20px;margin:0 0 2px}
.sub{color:#6b6a64;font-size:12px;margin:0 0 18px}
h2{font-size:15px;margin:26px 0 8px}
table{border-collapse:collapse;width:100%;font-size:13px;background:#fff;border:1px solid #e7e5dd;border-radius:10px;overflow:hidden}
th,td{padding:8px 10px;text-align:center;border-bottom:1px solid #efede6;white-space:nowrap}
th{color:#6b6a64;font-weight:600;font-size:12px;background:#f6f4ee}
th.name,td:first-child{text-align:left}
td.r{text-align:right}
.name{font-weight:600;background:#fff}
td .h{font-weight:600}
td .p{font-size:11px;color:#5f5e5a}
.legend{display:flex;gap:14px;font-size:12px;color:#6b6a64;margin:6px 0 0}
.legend span{display:flex;align-items:center;gap:5px}
.sw{width:12px;height:12px;border-radius:3px;display:inline-block}
.foot{color:#8a897f;font-size:11px;margin-top:20px}
</style></head><body><div class="wrap">
<h1>Peak Nine — planning dashboard</h1>
<p class="sub">Live from Teamleader. Capacity reflects Teamleader planning only (excludes Google Calendar). Generated ${esc(new Date().toISOString().slice(0, 16).replace("T", " "))} UTC.</p>

<h2>Team capacity — next 6 weeks (planned / available, % allocated)</h2>
<table><thead><tr><th class="name">Person</th>${headCols}</tr></thead><tbody>${bodyRows || `<tr><td colspan="7">No availability data.</td></tr>`}</tbody></table>
<div class="legend"><span><i class="sw" style="background:#d8f0e2"></i>&le;50%</span><span><i class="sw" style="background:#fdf0c8"></i>50–85%</span><span><i class="sw" style="background:#fbd9b0"></i>85–100%</span><span><i class="sw" style="background:#f6c0c0"></i>over capacity</span></div>

<h2>Open projects</h2>
<table><thead><tr><th class="name">Project</th><th style="text-align:left">Window (lead time)</th><th class="r">Revenue</th></tr></thead><tbody>${projRows || `<tr><td colspan="3">No open projects.</td></tr>`}</tbody></table>

<p class="foot">Read-only. Refresh the page for the latest. Built by Pidgi.</p>
</div></body></html>`;
}

export function dashboardLink(): string {
  const base = process.env.PUBLIC_BASE_URL || "";
  const key = process.env.DASHBOARD_KEY || "";
  if (!base || !key) return "Dashboard not configured (set PUBLIC_BASE_URL and DASHBOARD_KEY).";
  return `${base.replace(/\/$/, "")}/dashboard?key=${encodeURIComponent(key)}`;
}
