# Quick Start — Teamleader Focus MCP

---

## 1. Build

```bash
git clone https://github.com/YOUR_USERNAME/Tailormade.TeamleaderFocusMcp.git
cd Tailormade.TeamleaderFocusMcp
npm install
npm run build
```

---

## 2. Get OAuth2 Refresh Token (one-time)

**Step 1 — Open in browser:**
```
https://focus.teamleader.eu/oauth2/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=http://localhost:3000/oauth/callback
```

**Step 2 — Exchange code for token:**
```bash
curl -X POST https://focus.teamleader.eu/oauth2/access_token \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "code=CODE_FROM_URL" \
  -d "grant_type=authorization_code" \
  -d "redirect_uri=http://localhost:3000/oauth/callback"
```

Save the `refresh_token` from the response. It auto-rotates and is persisted to `~/.teamleader-tokens.json`.

---

## 3. Configure Claude Desktop / Claude Code

**File (Windows):** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "teamleader": {
      "command": "node",
      "args": ["C:\\ABSOLUTE\\PATH\\TO\\dist\\index.js"],
      "env": {
        "TEAMLEADER_CLIENT_ID": "your_client_id",
        "TEAMLEADER_CLIENT_SECRET": "your_client_secret",
        "TEAMLEADER_REFRESH_TOKEN": "your_refresh_token"
      }
    }
  }
}
```

**Restart Claude Desktop after saving.**

---

## 4. Verify

In Claude, type:
```
List my time tracking entries from this week
```

If entries appear (or "no entries found"), the MCP is working.

---

## Typical Workflows

### Time logging (recommended)

```
1. teamleader_load_tasks(company_name="Acme", visual=true)
   → shows numbered task list

2. teamleader_log_time(company_name="Acme", task_name="Bug fix", started_on="09:00", ended_on="11:30")
   → resolves from cache, logs entry
```

### Find and log a specific task

```
1. teamleader_find_task(company_name="Acme", group_name="Sprint 12", task_name="Bug fix")
   → resolves interactively, caches result

2. teamleader_log_time(company_name="Acme", task_name="Bug fix", started_on="09:00", ended_on="11:30")
```

### Browse contacts / deals / invoices

```
- List contacts tagged VIP
- Find company Acme Corp
- Show open deals in proposal phase
- List unpaid invoices from this month
- Create draft invoice for company X
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Missing required environment variable` | Check `claude_desktop_config.json` for typos |
| `Failed to refresh token` | Re-run OAuth flow to get a new refresh_token |
| Tools not appearing | Use absolute path in config + restart Claude Desktop fully |
| Build errors | `rm -rf node_modules dist && npm install && npm run build` |
| Task not found in cache | Run `teamleader_find_task` or `teamleader_load_tasks` first |
| Duplicate entry blocked | Use `force=true` to override, or check times |

---

## Tool Count

| Module | Tools |
|--------|-------|
| Contacts | 4 |
| Companies | 3 |
| Deals | 4 |
| Tasks (legacy) | 2 |
| Events | 3 |
| Invoices | 3 |
| Time Tracking | 7 |
| Projects v2 | 8 |
| Smart Resolution | 6 |
| **Total** | **40** |

---

## Full Documentation

- [README.md](README.md) — All tools + parameters + API quirks
- [CHANGELOG.md](CHANGELOG.md) — Version history
- [docs/find-task-business-logic.md](docs/find-task-business-logic.md) — Smart resolution flow
- [CLAUDE.md](CLAUDE.md) — Instructions for AI agents / CodingMachine
