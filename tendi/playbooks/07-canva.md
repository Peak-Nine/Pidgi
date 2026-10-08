# Canva through Canva's hosted MCP server

Tendi talks to Canva through Canva's own MCP server (mcp.canva.com). The exact tool names are whatever that server lists at runtime; they appear in your tool list prefixed with `canva_`. Call `canva_status` first when you are about to use Canva: it tells you whether Canva is connected, and if not, how Niels connects it (a one-time login link, admin only).

If Canva is not connected, do not stall the proposal: deliver the drafts, the Word file and a manual Canva checklist (what to copy, what to replace where), and tell Niels once how to connect.

## Working rules

- Never edit a master template. Always copy first: `DAHRT8eVhhA` (Proof of Change deck), `DAHKhE6U2vk` (modular proposal deck), `DAHWFiZkv6w` (Philea proposal doc). Save the copy's id and edit URL to the workspace links immediately.
- Read the copy before editing to learn its text elements (ids, locators, current text). Replace text element by element; keep each replacement close to the original length so nothing overflows. If the fuller text does not fit, shorten the slide text and keep the fuller version in the thread.
- For the Philea proposal doc (fixed pages) use `canva_doc_map` and `canva_doc_fill` instead of raw edit calls: they keep the typography, check for overflow and return thumbnails. What we learned testing on copies (8 Oct 2026): `replace_text` gives a whole box the style of its first run, so a box with a grey label above body text becomes one grey label; find-and-replace inside a run keeps that run's style; line breaks work; a link on a run survives a text change, so old client links must be cleared; boxes grow downwards and fonts never shrink. `copy-design` takes `page_numbers`, so copy only the pages the proposal needs: pages cannot be deleted afterwards.
- Editing usually runs as a transaction: start, perform operations, commit (or cancel). If a tool fails mid-transaction, cancel, report, and retry once. Never leave a transaction open.
- Replace every placeholder token: "Client Name", "XXX", "Lorem ipsum", "Header Subtitle", and template residue such as "OpenTeleRehab", "Enabel", "HI", "OTR", "P&V", "coops.vc", "Febecoop" where the playbook says so. Then re-read the copy and grep your own output for leftovers before you report done.
- Do not delete pages (the API cannot). Leave unneeded pages out when copying, or tell Niels which pages to hide or delete manually.
- Whiteboards (the Philea poster `DAHWICf3ANs`): Canva reports the page as not editable and lists no separate text elements, but find-and-replace on the whole page works when you pass `is_editable: true` (tested 8 Oct 2026). Follow step 6 of 04-rfp-philea.md: copy, show the ordered list, apply on a yes, commit, re-read and check, return the edit link. If Canva rejects the operations, give Niels the list to run by hand instead.
- Before you commit an edit, show in the thread what will change (by slide or block) and wait for a yes. Canva's own tools ask for that too.
- The on-brand PDF: when a filled copy has no leftovers, call `deliver_canva_pdf` with the copy's design id and a clear file name ("Peak Nine for <client> - Technical Proposal.pdf"). It exports through Canva and posts the PDF in the thread. For the poster the Canva link is the deliverable; export it only when Niels asks. Never export a master template. If export is unavailable, say it is done from Canva by hand.
- Rate limits exist on Canva's side (copy, export and transaction tools are limited to a handful of calls per minute). Batch text replacements into as few operations as the tools allow, and if you hit a rate-limit error wait and retry once rather than hammering.

## What to report

The copy's edit URL, what was filled where (by slide marker), what stays manual, and any place where length forced a compromise.
