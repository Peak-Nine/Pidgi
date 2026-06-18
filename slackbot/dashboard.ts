/**
 * Dashbird 🐦 — live planning dashboard served by the bot.
 *
 * Two routes (wired in index.ts), both protected by DASHBOARD_KEY:
 *   GET /dashboard?key=...            -> the HTML shell + client JS (renderShell)
 *   GET /dashboard/data?key=...&weeks=&start=  -> live JSON (gatherDashboardData)
 *
 * The shell renders nothing on its own; the client fetches /dashboard/data and
 * draws three interactive views:
 *   1. Team capacity heatmap (people x weeks, planned/available, hours or %).
 *   2. Day-by-day "who works on what" team grid (people x working days, with
 *      project-coloured blocks showing the task and hours, out-of-range flagged).
 *   3. Open projects (revenue / budget).
 * Controls: time window (2/4/6/12 weeks), filter by person, filter by project,
 * hours-vs-% toggle, and click a day cell to drill into that day's reservations.
 *
 * Data is live from Teamleader only (excludes Google Calendar). Task names come
 * from teamleader_get_task (the reservation's source is a v1 todo id); the project
 * and colour come from teamleader_list_projects_v2.
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

const num = (x: any): number => (typeof x === "number" ? x : 0);

/** Gather everything the client needs for the selected window. */
export async function gatherDashboardData(mcp: any, startISO: string | undefined, weeks: number): Promise<any> {
  const wk = Math.min(Math.max(Math.round(weeks || 6), 1), 12);
  const start = monday(startISO ? new Date(startISO) : new Date());
  const end = addDays(start, wk * 7 - 1);

  // Working days (Mon–Fri) across the window, and week-start Mondays.
  const days: string[] = [];
  for (let n = 0; n < wk * 7; n++) {
    const d = addDays(start, n);
    const wd = d.getDay();
    if (wd !== 0 && wd !== 6) days.push(iso(d));
  }
  const weekStarts: string[] = [];
  for (let w = 0; w < wk; w++) weekStarts.push(iso(addDays(start, w * 7)));

  // Users.
  const usersR = await tl(mcp, "list_users", { page_size: 100 });
  const users = (usersR.data || []).map((u: any) => ({
    id: u.id,
    name: (u.first_name || "").trim() || u.email || u.id,
  }));

  // Projects (metadata, colour, revenue).
  const projR = await tl(mcp, "list_projects_v2", { status: "open", page_size: 100 });
  const projects = (projR.data || []).map((p: any) => ({
    id: p.id,
    title: p.title,
    color: p.color || "#C0C0C4",
    revenue: num(p.external_budget?.amount) || num(p.price?.amount) || 0,
    spent: num(p.external_budget_spent?.amount),
    remaining: num(p.external_budget_remaining?.amount),
    start: p.start_date || null,
    end: p.end_date || null,
    marginPct: typeof p.margin_percentage === "number" ? p.margin_percentage : null,
  }));

  // Daily availability per user -> aggregate to weeks.
  const availR = await tl(mcp, "get_user_availability_daily", {
    start_date: iso(start),
    end_date: iso(end),
    assignees: users.map((u: any) => ({ type: "user", id: u.id })),
  });
  const capacity: Record<string, Record<string, { planned: number; net: number }>> = {};
  (availR.data || []).forEach((row: any) => {
    const uid = row.user?.id;
    if (!uid) return;
    capacity[uid] = {};
    weekStarts.forEach((ws, i) => {
      const next = weekStarts[i + 1];
      let planned = 0, net = 0;
      (row.availabilities || []).forEach((a: any) => {
        if (a.date >= ws && (i === weekStarts.length - 1 || a.date < next)) {
          planned += num(a.availability?.planned_time?.value) / 60;
          net += num(a.availability?.net_time_available?.value) / 60;
        }
      });
      capacity[uid][ws] = { planned, net };
    });
  });

  // All task reservations in the window (paginated).
  const reservations: any[] = [];
  for (let page = 1; page <= 25; page++) {
    const r = await tl(mcp, "list_reservations", {
      start_date: iso(start),
      end_date: iso(end),
      source_types: ["task"],
      page,
      page_size: 100,
    });
    const batch = r.data || [];
    reservations.push(...batch);
    if (batch.length < 100) break;
  }

  // Resolve task id -> { title, projectId } via get_task (cached, parallel chunks).
  const taskIds = Array.from(
    new Set(reservations.filter((r) => r.source?.type === "task" && r.source?.id).map((r) => r.source.id))
  );
  const taskMap: Record<string, { title: string; projectId: string | null }> = {};
  for (let i = 0; i < taskIds.length; i += 8) {
    const chunk = taskIds.slice(i, i + 8);
    await Promise.all(
      chunk.map(async (id) => {
        try {
          const t = await tl(mcp, "get_task", { id });
          taskMap[id] = { title: t.data?.title || "Task", projectId: t.data?.project?.id || null };
        } catch {
          taskMap[id] = { title: "Task", projectId: null };
        }
      })
    );
  }

  // Day blocks.
  const blocks = reservations
    .map((r) => {
      const tid = r.source?.id;
      const info = (tid && taskMap[tid]) || { title: "Task", projectId: null };
      return {
        userId: r.assignee?.id || null,
        date: r.date,
        hours: num(r.duration?.value) / 60,
        taskTitle: info.title,
        projectId: info.projectId,
        outOfRange: !!(r.date_range_status && r.date_range_status !== "within_range"),
      };
    })
    .filter((b) => b.userId && days.indexOf(b.date) >= 0);

  // Only keep users who have availability or any block in the window.
  const activeUserIds = new Set<string>();
  Object.keys(capacity).forEach((uid) => {
    if (weekStarts.some((ws) => capacity[uid][ws] && (capacity[uid][ws].net > 0 || capacity[uid][ws].planned > 0)))
      activeUserIds.add(uid);
  });
  blocks.forEach((b) => activeUserIds.add(b.userId as string));
  const activeUsers = users.filter((u: any) => activeUserIds.has(u.id));

  return {
    generatedAt: new Date().toISOString().slice(0, 16).replace("T", " ") + " UTC",
    start: iso(start),
    weeks: wk,
    days,
    weekStarts,
    users: activeUsers,
    projects,
    capacity,
    blocks,
  };
}

/** The static HTML shell + client JS. No server data is interpolated here. */
export function renderShell(): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Dashbird 🐦 — Peak Nine planning</title>
<style>
:root{color-scheme:light}
*{box-sizing:border-box}
body{margin:0;background:#faf9f5;color:#1f1e1b;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:14px}
.wrap{max-width:1280px;margin:0 auto;padding:22px}
h1{font-size:22px;margin:0 0 2px}
.sub{color:#6b6a64;font-size:12px;margin:0 0 16px}
.controls{display:flex;flex-wrap:wrap;gap:10px 16px;align-items:center;background:#fff;border:1px solid #e7e5dd;border-radius:12px;padding:12px 14px;margin-bottom:18px}
.controls label{font-size:12px;color:#6b6a64;margin-right:6px}
.controls select{font-size:13px;padding:5px 8px;border:1px solid #d9d7cd;border-radius:8px;background:#fff;color:#1f1e1b}
.seg{display:inline-flex;border:1px solid #d9d7cd;border-radius:8px;overflow:hidden}
.seg button{border:0;background:#fff;color:#1f1e1b;font-size:13px;padding:5px 12px;cursor:pointer}
.seg button.on{background:#1f1e1b;color:#fff}
h2{font-size:15px;margin:24px 0 8px}
.scroll{overflow-x:auto;border:1px solid #e7e5dd;border-radius:10px;background:#fff}
table{border-collapse:collapse;width:100%;font-size:13px}
th,td{padding:7px 9px;text-align:center;border-bottom:1px solid #efede6;white-space:nowrap}
th{color:#6b6a64;font-weight:600;font-size:11px;background:#f6f4ee;position:sticky;top:0}
th.name,td.name{text-align:left;position:sticky;left:0;background:#fff;font-weight:600;z-index:2;border-right:1px solid #efede6;min-width:120px}
th.name{z-index:3;background:#f6f4ee}
td.r{text-align:right}
td .h{font-weight:600}
td .p{font-size:11px;color:#5f5e5a}
.wk{border-left:2px solid #e2e0d6}
td.day{text-align:left;vertical-align:top;min-width:120px;white-space:normal;padding:5px 6px}
.chip{border-left:4px solid #999;border-radius:5px;padding:3px 6px;margin:2px 0;line-height:1.25}
.chip .ct{display:block;font-size:11.5px}
.chip .ch{font-size:11px;color:#4d4c47;font-weight:600}
.chip .flag{color:#b3261e;font-weight:700}
.cell-empty{color:#cbc9bf}
.daycell{cursor:pointer}
.daycell:hover{outline:2px solid #cfe3d6}
.legend{display:flex;flex-wrap:wrap;gap:12px;font-size:12px;color:#6b6a64;margin:6px 2px 0}
.legend span{display:flex;align-items:center;gap:5px}
.sw{width:12px;height:12px;border-radius:3px;display:inline-block}
.dot{width:10px;height:10px;border-radius:50%;display:inline-block;margin-right:6px;vertical-align:middle}
.foot{color:#8a897f;font-size:11px;margin-top:18px}
#drill{position:fixed;right:18px;bottom:18px;max-width:360px;background:#fff;border:1px solid #d9d7cd;border-radius:12px;box-shadow:0 8px 28px rgba(0,0,0,.14);padding:14px 16px;display:none;z-index:9}
#drill h3{margin:0 0 6px;font-size:14px}
#drill .x{position:absolute;top:8px;right:11px;cursor:pointer;color:#8a897f;font-size:16px}
#drill .row{font-size:12.5px;padding:4px 0;border-top:1px solid #efede6}
#msg{color:#6b6a64;font-size:13px;padding:14px}
</style></head><body><div class="wrap">
<h1>Dashbird 🐦</h1>
<p class="sub" id="sub">Live from Teamleader. Capacity reflects Teamleader planning only (excludes Google Calendar).</p>

<div class="controls">
  <span><label>Window</label><select id="weeks">
    <option value="2">2 weeks</option><option value="4">4 weeks</option>
    <option value="6" selected>6 weeks</option><option value="12">12 weeks</option>
  </select></span>
  <span><label>Person</label><select id="person"><option value="all">Everyone</option></select></span>
  <span><label>Project</label><select id="project"><option value="all">All projects</option></select></span>
  <span><label>Capacity as</label><span class="seg"><button id="mh" class="on">Hours</button><button id="mp">%</button></span></span>
</div>

<div id="msg">Loading live data…</div>
<div id="content" style="display:none">
  <h2>Team capacity</h2>
  <div class="scroll"><table id="cap"></table></div>
  <div class="legend">
    <span><i class="sw" style="background:#d8f0e2"></i>&le;50%</span>
    <span><i class="sw" style="background:#fdf0c8"></i>50–85%</span>
    <span><i class="sw" style="background:#fbd9b0"></i>85–100%</span>
    <span><i class="sw" style="background:#f6c0c0"></i>over capacity</span>
  </div>

  <h2>Who works on what — day by day</h2>
  <div class="scroll"><table id="grid"></table></div>

  <h2>Open projects</h2>
  <div class="scroll"><table id="proj"></table></div>
</div>

<div id="drill"><span class="x" onclick="document.getElementById('drill').style.display='none'">×</span><div id="drillbody"></div></div>

<p class="foot">Read-only. Refresh the page or switch the window to reload live data. Built by Pidgi.</p>
</div>
<script>
(function(){
  var KEY = new URLSearchParams(location.search).get('key') || '';
  var state = { weeks: 6, person: 'all', project: 'all', mode: 'hours', data: null };
  var $ = function(id){ return document.getElementById(id); };
  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
  function hrs(h){ return (Math.round(h*10)/10) + 'h'; }
  function capColor(u){ if(u<=0) return '#eef2f0'; if(u<=0.5) return '#d8f0e2'; if(u<=0.85) return '#fdf0c8'; if(u<=1.0) return '#fbd9b0'; return '#f6c0c0'; }
  function eur(n){ return '€' + Math.round(n).toLocaleString('en-IE'); }
  function dlabel(d){ var x=new Date(d+'T00:00:00'); var wd=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][x.getDay()]; return wd+' '+x.getDate()+'/'+(x.getMonth()+1); }

  function projMap(){ var m={}; (state.data.projects||[]).forEach(function(p){ m[p.id]=p; }); return m; }
  function userMap(){ var m={}; (state.data.users||[]).forEach(function(u){ m[u.id]=u.name; }); return m; }

  function visibleUsers(){
    var us = state.data.users || [];
    if(state.person !== 'all') us = us.filter(function(u){ return u.id===state.person; });
    return us;
  }

  function renderCap(){
    var d=state.data, us=visibleUsers(), ws=d.weekStarts;
    var h='<thead><tr><th class="name">Person</th>';
    ws.forEach(function(w){ h+='<th>wk '+esc(w.slice(5))+'</th>'; });
    h+='</tr></thead><tbody>';
    if(!us.length){ h+='<tr><td class="name">—</td><td>no data</td></tr>'; }
    us.forEach(function(u){
      h+='<tr><td class="name">'+esc(u.name)+'</td>';
      ws.forEach(function(w){
        var c=(d.capacity[u.id]&&d.capacity[u.id][w])||{planned:0,net:0};
        var util = c.net>0 ? c.planned/c.net : (c.planned>0?1.5:0);
        var pct = c.net>0 ? Math.round(util*100)+'%' : (c.planned>0?'—':'0');
        var label;
        if(state.mode==='hours'){ label = c.net>0 ? Math.round(c.planned)+'/'+Math.round(c.net)+'h' : (c.planned>0?Math.round(c.planned)+'h':'0'); }
        else { label = pct; }
        h+='<td style="background:'+capColor(util)+'"><div class="h">'+esc(label)+'</div>'
          +(state.mode==='hours'?'<div class="p">'+(c.net>0?pct:'')+'</div>':'')+'</td>';
      });
      h+='</tr>';
    });
    h+='</tbody>'; $('cap').innerHTML=h;
  }

  function blocksByUserDay(){
    var m={};
    (state.data.blocks||[]).forEach(function(b){
      if(state.project!=='all' && b.projectId!==state.project) return;
      var k=b.userId+'|'+b.date; (m[k]=m[k]||[]).push(b);
    });
    return m;
  }

  function renderGrid(){
    var d=state.data, us=visibleUsers(), days=d.days, pm=projMap(), bd=blocksByUserDay();
    var h='<thead><tr><th class="name">Person</th>';
    days.forEach(function(dy){ var isWk=d.weekStarts.indexOf(dy)>=0; h+='<th class="'+(isWk?'wk':'')+'">'+esc(dlabel(dy))+'</th>'; });
    h+='</tr></thead><tbody>';
    if(!us.length){ h+='<tr><td class="name">—</td><td>no data</td></tr>'; }
    us.forEach(function(u){
      h+='<tr><td class="name">'+esc(u.name)+'</td>';
      days.forEach(function(dy){
        var isWk = d.weekStarts.indexOf(dy)>=0;
        var list=bd[u.id+'|'+dy]||[];
        var inner='';
        if(!list.length){ inner='<span class="cell-empty">·</span>'; }
        else{
          list.forEach(function(b){
            var p=pm[b.projectId]||{title:'(unknown project)',color:'#C0C0C4'};
            inner+='<div class="chip" style="border-left-color:'+esc(p.color)+';background:'+esc(p.color)+'1f" title="'+esc(p.title)+'">'
              +'<span class="ct">'+esc(b.taskTitle)+'</span>'
              +'<span class="ch">'+hrs(b.hours)+(b.outOfRange?' <span class="flag" title="Outside the task date window">⚠</span>':'')+'</span></div>';
          });
        }
        h+='<td class="day daycell'+(isWk?' wk':'')+'" data-u="'+esc(u.id)+'" data-d="'+esc(dy)+'">'+inner+'</td>';
      });
      h+='</tr>';
    });
    h+='</tbody>'; $('grid').innerHTML=h;
    var cells=$('grid').querySelectorAll('.daycell');
    for(var i=0;i<cells.length;i++){ cells[i].addEventListener('click', onDrill); }
  }

  function onDrill(e){
    var td=e.currentTarget, uid=td.getAttribute('data-u'), dy=td.getAttribute('data-d');
    var pm=projMap(), um=userMap();
    var list=(state.data.blocks||[]).filter(function(b){ return b.userId===uid && b.date===dy && (state.project==='all'||b.projectId===state.project); });
    var total=0; list.forEach(function(b){ total+=b.hours; });
    var h='<h3>'+esc(um[uid]||uid)+' · '+esc(dlabel(dy))+'</h3>';
    if(!list.length){ h+='<div class="row">No reservations.</div>'; }
    list.forEach(function(b){ var p=pm[b.projectId]||{title:'(unknown)',color:'#999'};
      h+='<div class="row"><span class="dot" style="background:'+esc(p.color)+'"></span>'+esc(b.taskTitle)+' — '+hrs(b.hours)+' <span style="color:#8a897f">('+esc(p.title)+')</span>'+(b.outOfRange?' <span style="color:#b3261e">⚠ out of range</span>':'')+'</div>'; });
    if(list.length){ h+='<div class="row" style="font-weight:600">Total: '+hrs(total)+'</div>'; }
    $('drillbody').innerHTML=h; $('drill').style.display='block';
  }

  function renderProj(){
    var d=state.data, h='<thead><tr><th class="name">Project</th><th style="text-align:left">Window</th><th class="r">Revenue</th><th class="r">Spent</th><th class="r">Remaining</th></tr></thead><tbody>';
    var ps=(d.projects||[]).slice().sort(function(a,b){ return (b.revenue||0)-(a.revenue||0); });
    if(!ps.length){ h+='<tr><td class="name">—</td><td colspan="4">no open projects</td></tr>'; }
    ps.forEach(function(p){
      h+='<tr><td class="name"><span class="dot" style="background:'+esc(p.color)+'"></span>'+esc(p.title)+'</td>'
       +'<td style="text-align:left">'+esc(p.start||'?')+' → '+esc(p.end||'?')+'</td>'
       +'<td class="r">'+(p.revenue?eur(p.revenue):'—')+'</td>'
       +'<td class="r">'+(p.spent?eur(p.spent):'—')+'</td>'
       +'<td class="r">'+(p.remaining?eur(p.remaining):'—')+'</td></tr>';
    });
    h+='</tbody>'; $('proj').innerHTML=h;
  }

  function populateFilters(){
    var pSel=$('person'); pSel.innerHTML='<option value="all">Everyone</option>';
    (state.data.users||[]).forEach(function(u){ var o=document.createElement('option'); o.value=u.id; o.textContent=u.name; pSel.appendChild(o); });
    pSel.value=state.person;
    var prSel=$('project'); prSel.innerHTML='<option value="all">All projects</option>';
    (state.data.projects||[]).slice().sort(function(a,b){return a.title<b.title?-1:1;}).forEach(function(p){ var o=document.createElement('option'); o.value=p.id; o.textContent=p.title; prSel.appendChild(o); });
    prSel.value=state.project;
  }

  function renderAll(){ renderCap(); renderGrid(); renderProj(); }

  function load(){
    $('msg').style.display='block'; $('msg').textContent='Loading live data…'; $('content').style.display='none';
    fetch('/dashboard/data?key='+encodeURIComponent(KEY)+'&weeks='+state.weeks)
      .then(function(r){ if(!r.ok) throw new Error('HTTP '+r.status); return r.json(); })
      .then(function(d){
        state.data=d; populateFilters();
        $('sub').textContent='Live from Teamleader (excludes Google Calendar). Window '+d.weeks+' weeks from '+d.start+'. Generated '+d.generatedAt+'.';
        $('msg').style.display='none'; $('content').style.display='block'; renderAll();
      })
      .catch(function(e){ $('msg').textContent='Could not load data: '+e.message; });
  }

  $('weeks').addEventListener('change', function(){ state.weeks=this.value; load(); });
  $('person').addEventListener('change', function(){ state.person=this.value; renderAll(); });
  $('project').addEventListener('change', function(){ state.project=this.value; renderAll(); });
  $('mh').addEventListener('click', function(){ state.mode='hours'; $('mh').classList.add('on'); $('mp').classList.remove('on'); renderCap(); });
  $('mp').addEventListener('click', function(){ state.mode='pct'; $('mp').classList.add('on'); $('mh').classList.remove('on'); renderCap(); });

  load();
})();
</script>
</body></html>`;
}

export function dashboardLink(): string {
  const base = process.env.PUBLIC_BASE_URL || "";
  const key = process.env.DASHBOARD_KEY || "";
  if (!base || !key) return "Dashboard not configured (set PUBLIC_BASE_URL and DASHBOARD_KEY).";
  return `${base.replace(/\/$/, "")}/dashboard?key=${encodeURIComponent(key)}`;
}
