# Deployment Guide - Teamleader MCP Extended

**Step-by-step instructies voor deployment op je Windows machine**

---

## 📋 Voorwaarden Checklist

- [ ] Node.js 20+ geïnstalleerd
- [ ] Claude Desktop geïnstalleerd
- [ ] Teamleader Focus account met admin rechten
- [ ] Git geïnstalleerd (optioneel - voor updates)

---

## 🚀 Deployment Stappen

### Stap 1: Download & Installeer

**Optie A: Via Git (Aanbevolen)**
```bash
cd C:\Projects  # Of je preferred directory
git clone https://github.com/tailormade-eu/teamleader-focus-mcp.git Tailormade.TeamleaderFocusMcp
cd Tailormade.TeamleaderFocusMcp
```

**Optie B: Download ZIP**
1. Download ZIP from GitHub
2. Extract naar `C:\Projects\Tailormade.TeamleaderFocusMcp`
3. Open terminal in die map

### Stap 2: Installeer Dependencies
```bash
npm install
```

**Verwachte output:**
```
added 99 packages in 14s
```

### Stap 3: Build
```bash
npm run build
```

**Verwachte output:**
```
> Tailormade.TeamleaderFocusMcp-teamleader@1.0.0 build
> tsc
```

**Verificatie:**
```bash
dir dist  # Moet index.js, tools/, api/, types/ bevatten
```

---

## 🔐 Teamleader OAuth2 Setup

### Stap 1: Marketplace Integratie Aanmaken

1. Ga naar https://marketplace.focus.teamleader.eu/
2. Login met je Teamleader account
3. Klik "Create integration"
4. Vul in:
   - **Name:** Claude MCP Server (of eigen keuze)
   - **Description:** MCP server for time tracking automation
   - **Redirect URI:** `http://localhost:3000/oauth/callback`
   - **Scopes:** Laat standaard (full access)
5. Klik "Save"
6. Noteer:
   - ✅ **Client ID**
   - ✅ **Client Secret**

### Stap 2: Refresh Token Verkrijgen

**A. Authorization Code krijgen:**

Open deze URL in browser (vervang YOUR_CLIENT_ID):
```
https://focus.teamleader.eu/oauth2/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=http://localhost:3000/oauth/callback
```

**B. Login & Authorize:**
- Login met Teamleader
- Klik "Authorize"
- Je wordt geredirect naar `http://localhost:3000/oauth/callback?code=XXXXX`
- **Kopieer de CODE uit de URL**

**C. Exchange voor tokens:**

Windows PowerShell:
```powershell
$body = @{
    client_id = "YOUR_CLIENT_ID"
    client_secret = "YOUR_CLIENT_SECRET"
    code = "AUTHORIZATION_CODE_FROM_URL"
    grant_type = "authorization_code"
    redirect_uri = "http://localhost:3000/oauth/callback"
}

Invoke-RestMethod -Uri "https://focus.teamleader.eu/oauth2/access_token" -Method Post -Body $body
```

Of via Curl (Git Bash / WSL):
```bash
curl -X POST https://focus.teamleader.eu/oauth2/access_token \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "code=AUTHORIZATION_CODE" \
  -d "grant_type=authorization_code" \
  -d "redirect_uri=http://localhost:3000/oauth/callback"
```

**D. Kopieer refresh_token:**

Response:
```json
{
  "token_type": "Bearer",
  "expires_in": 3600,
  "access_token": "...",
  "refresh_token": "SAVE_THIS_TOKEN"  ← DIT BEWAREN!
}
```

✅ Kopieer `refresh_token` - dit heb je nodig voor Claude Desktop config

---

## ⚙️ Claude Desktop Configuratie

### Stap 1: Vind Config File

Windows:
```
%APPDATA%\Claude\claude_desktop_config.json
```

Volledige path meestal:
```
C:\Users\YOUR_USERNAME\AppData\Roaming\Claude\claude_desktop_config.json
```

### Stap 2: Open Config File

```bash
# Via Notepad
notepad %APPDATA%\Claude\claude_desktop_config.json

# Via VS Code
code %APPDATA%\Claude\claude_desktop_config.json
```

### Stap 3: Voeg Teamleader Server Toe

**Let op:** Gebruik ABSOLUTE path naar dist/index.js!

```json
{
  "mcpServers": {
    "teamleader": {
      "command": "node",
      "args": ["C:\\Projects\\Tailormade.TeamleaderFocusMcp\\dist\\index.js"],
      "env": {
        "TEAMLEADER_CLIENT_ID": "paste_client_id_here",
        "TEAMLEADER_CLIENT_SECRET": "paste_client_secret_here",
        "TEAMLEADER_REFRESH_TOKEN": "paste_refresh_token_here"
      }
    }
  }
}
```

**Voorbeeldwaarden:**
```json
{
  "mcpServers": {
    "teamleader": {
      "command": "node",
      "args": ["C:\\Projects\\Tailormade.TeamleaderFocusMcp\\dist\\index.js"],
      "env": {
        "TEAMLEADER_CLIENT_ID": "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6",
        "TEAMLEADER_CLIENT_SECRET": "s3cr3t_k3y_h3r3_v3ry_l0ng",
        "TEAMLEADER_REFRESH_TOKEN": "r3fr3sh_t0k3n_h3r3_v3ry_l0ng"
      }
    }
  }
}
```

### Stap 4: Opslaan & Restart

1. **Save** de config file
2. **Sluit Claude Desktop VOLLEDIG AF** (check System Tray!)
3. **Herstart Claude Desktop**

---

## ✅ Verificatie

### Test 1: Tools Beschikbaar?

Open Claude en type:
```
List available Teamleader tools
```

Je zou moeten zien:
- ✅ teamleader_list_timetracking
- ✅ teamleader_add_timetracking
- ✅ teamleader_start_timer
- ✅ ... (27 tools totaal)

### Test 2: Eenvoudige Query

```
Show me my contacts from Teamleader
```

Claude zou nu teamleader_list_contacts moeten aanroepen.

### Test 3: Time Tracking (Nieuwe Feature!)

```
List my time tracking entries from this week
```

Als dit werkt: **🎉 Gelukt!**

---

## 🔧 Troubleshooting

### ❌ "Missing required environment variable"

**Probleem:** Environment variables niet correct gezet

**Oplossing:**
1. Check `claude_desktop_config.json` voor typos
2. Ensure geen spaties in JSON
3. Gebruik double quotes `"` niet single quotes `'`
4. Restart Claude Desktop volledig

### ❌ "Failed to refresh Teamleader token"

**Probleem:** Refresh token is invalid of expired

**Oplossing:**
1. Doe OAuth2 flow opnieuw (Stap 3)
2. Krijg nieuwe refresh token
3. Update `claude_desktop_config.json`
4. Restart Claude Desktop

### ❌ Tools verschijnen niet

**Probleem:** Path naar dist/index.js is incorrect

**Oplossing:**
1. Verify absolute path:
   ```bash
   cd C:\Projects\Tailormade.TeamleaderFocusMcp
   echo %CD%\dist\index.js
   ```
2. Copy EXACT path naar config
3. Gebruik dubbele backslashes `\\` in JSON
4. Restart Claude Desktop

### ❌ "Cannot find module"

**Probleem:** Dependencies niet geïnstalleerd of build failed

**Oplossing:**
```bash
cd C:\Projects\Tailormade.TeamleaderFocusMcp
rm -rf node_modules dist
npm install
npm run build
```

### ❌ Build errors

**Check Node versie:**
```bash
node --version  # Should be v20.x.x or higher
```

**Reinstall:**
```bash
npm cache clean --force
npm install
npm run build
```

---

## 🔄 Updates & Maintenance

### Update naar Nieuwe Versie

```bash
cd C:\Projects\Tailormade.TeamleaderFocusMcp
git pull origin main
npm install
npm run build
```

Restart Claude Desktop na update.

### Sync met Upstream (Globodai)

Als Globodai nieuwe features released:

```bash
git remote add upstream https://github.com/globodai-group/mcp-teamleader.git
git fetch upstream
git merge upstream/main
npm install
npm run build
```

---

## 📊 Integratie met n8n

### Optie 1: MCP via Claude Desktop (Huidige Setup)

- ✅ Interactive queries via Claude
- ✅ Natural language interface
- ❌ Niet direct automatable

### Optie 2: n8n HTTP Requests (Voor Workflows)

Voor geautomatiseerde workflows gebruik n8n met direct HTTP calls:

**n8n HTTP Request Node:**
```javascript
Method: POST
URL: https://api.focus.teamleader.eu/timeTracking.add
Authentication: OAuth2
Headers: {"Content-Type": "application/json"}
Body: {
  "user_id": "{{$json.user_id}}",
  "work_type_id": "{{$json.work_type_id}}",
  "started_on": "{{$json.started_on}}",
  "ended_on": "{{$json.ended_on}}",
  "subject": {
    "type": "project",
    "id": "{{$json.project_id}}"
  }
}
```

**Hybrid Approach (Aanbevolen):**
- **MCP** (deze setup): Interactive queries, manual corrections
- **n8n**: Automated workflows, scheduled tasks

---

## 📁 File Locations Reference

| Item | Location |
|------|----------|
| Project root | `C:\Projects\Tailormade.TeamleaderFocusMcp` |
| Built files | `C:\Projects\Tailormade.TeamleaderFocusMcp\dist` |
| Claude config | `%APPDATA%\Claude\claude_desktop_config.json` |
| Source code | `C:\Projects\Tailormade.TeamleaderFocusMcp\src` |
| This guide | `C:\Projects\Tailormade.TeamleaderFocusMcp\DEPLOYMENT.md` |

---

## 🎯 Next Steps

Na succesvolle deployment:

1. **Test alle functies:**
   - Contacts/Companies
   - Deals/Tasks
   - ⭐ Time Tracking (nieuwe feature!)
   
2. **Workflow automation opzetten:**
   - ManicTime → Teamleader time sync
   - Email → Task creation
   - Daily timesheet reminder
   
3. **Eventueel uitbreiden:**
   - Projects module (als je deze nodig hebt)
   - Webhooks (voor real-time triggers)
   - Advanced invoice operations

---

## 💡 Tips

1. **Backup je config:** 
   ```bash
   copy %APPDATA%\Claude\claude_desktop_config.json backup_config.json
   ```

2. **Test met MCP Inspector** (advanced):
   ```bash
   npx @modelcontextprotocol/inspector node dist/index.js
   ```

3. **Check logs** bij problemen:
   - Claude Desktop logs meestal in `%APPDATA%\Claude\logs`

4. **Security:**
   - NEVER commit je refresh_token naar Git
   - NEVER share je client_secret
   - Gebruik `.env` files lokaal voor development

---

## ✅ Deployment Checklist

- [ ] Node.js 20+ installed
- [ ] Repository cloned/downloaded
- [ ] `npm install` succesvol
- [ ] `npm run build` succesvol
- [ ] Teamleader OAuth2 integration created
- [ ] Client ID & Secret verkregen
- [ ] Refresh token verkregen via OAuth flow
- [ ] `claude_desktop_config.json` updated met credentials
- [ ] Absolute path naar `dist/index.js` correct
- [ ] Claude Desktop herstart
- [ ] Tools visible in Claude (verify)
- [ ] Test query succesvol
- [ ] Time tracking test succesvol

**Alle checkboxes ✅?** → **JE BENT KLAAR! 🎉**

---

**Vragen? Issues?** Check de troubleshooting sectie of open een issue op GitHub.
