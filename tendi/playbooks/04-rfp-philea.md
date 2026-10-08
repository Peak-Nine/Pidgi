# Playbook: RFP proposal from the Philea template

Take a new RFP or tender, write a Peak Nine proposal in the structure, tone and look of the Philea proposal, and hand back a master file plus the separate files the portal asks for. The Philea pair is the reference for structure, tone and look. The originals are never edited.

Source designs in Canva (always copy, never touch):
- Philea proposal doc, fixed pages, API-editable: Canva ID `DAHWFiZkv6w`
- Philea V1 methodology poster, whiteboard: Canva ID `DAHWICf3ANs`. Its text is changed with whole-poster find-and-replace (see step 6), not element by element

Standing rules for every line (on top of 00-voice.md):
- Every claim traces back to the RFP, to something Niels decided, or to a reference case Peak Nine has actually done (05-credentials.md). No invented numbers, clients, results or quotes. Unknowns become `[TO CONFIRM: ...]` or `[TO COMPLETE: ...]` and go on the open-items list.
- Keep the tone of the Philea doc: "Hi there! Nice to meet you", options rather than one answer, honest about what we do not know.

## Step 1. Intake: pull the hard facts out of the RFP

Read every attachment (RFP, terms, portal screenshots described in text). Extract and save with `workspace_update` (facts) before anything else:
- the client, the unit that commissions, how they call their people (Ipas calls staff "Netizens", Philea has a "strategy cell": reuse their words)
- the assignment in one sentence, the priority areas or questions
- the deliverables as the RFP names them, with due dates
- timeline: questions deadline, submission deadline with time zone, start, end
- currency, payment terms, tax or withholding clauses, invoice rules
- evaluation criteria and weights, page limits, format rules
- the upload slots of the portal (name, number, allowed format, single or multiple files); the split of the final files follows these slots exactly
- contact person and email

Flag anything that might change after the clarification round.

## Step 2. Ask Niels the decisions block, in ONE message

Do not guess these. Ask them together, numbered, so he can answer in one line each:
1. Day rate and currency (Philea used EUR; Ipas used USD 1,200 flat)
2. Days: does Peak Nine estimate, or is there a budget envelope to fit?
3. Team (who is in, who leads)
4. References: Niels picks, or Tendi picks from the known cases and says why
5. Tax and VAT line: what to scrape from the terms, who confirms with the accountant
6. Number and location of in-person moments
7. Languages the team can offer
8. Anything the RFP makes specific (pilots, surveys, options to price separately)

If he answers "you pick" on references, choose from the cases in 05-credentials.md (OpenTeleRehab with HI and Enabel, Allez Circulez with KBF, the KBF youth-debt fund strategy, the undisclosed corporate foundation, the global MedTech cross-regional insight case) and say openly where the fit is weak.

## Step 3. Reflect on fit before writing

If Canva is connected, read the Philea doc `DAHWFiZkv6w` to have the reference text in front of you. Map each RFP requirement to a Philea section and decide: carries over as is, rewrite, or new. Write down the honest gaps (no reference in this exact domain, missing bio, unclear scope) so they end up as open items and not as padding.

Design the approach for this client the way the Philea approach was designed: phases that fit the RFP calendar, a sign-off moment per phase, deliverables named exactly as the RFP names them, the in-person moments placed where being in one room changes the work most, knowledge transfer built in where the RFP asks for it, time zones and languages handled practically.

## Step 4. Write the master text in the Philea structure

Sections, in this order:
1. Cover with one "How might we" question for this client
2. Cover letter ("Hi there! Nice to meet you")
3. Understanding: what we read in the brief, what we read around it, five to seven HMW questions
4. Methodology: the vehicle, the lens, the phases, how we work with the client, their engagement principles as our commitments, a deliverables table, options priced separately
5. Work plan: phase table with days per phase, a month grid, assumptions
6. Team: coverage table and bios (use bios that exist in the thread or the credentials file; placeholder for anyone without one)
7. Experience: three cases in the fixed shape (label, title, client line, the challenge, what we did, result, reference contact)
8. Financial: fees by phase at the agreed rate, daily rates table, expenses as an estimate with a cap, options, taxes paragraph, payment schedule, validity
9. Closing

Day estimate: build it bottom-up per phase and show the total. Mark travel and expenses as approximate, to verify. Where the RFP weights evaluation criteria, add a short "How to read this proposal" table that maps each criterion to the section that answers it, as the Philea doc did.

Post the master text in the thread for Niels's pass. Iterate.

## Step 5. Build the files (on go)

Draft 1 goes out as a Word file via `build_docx` (Peak Nine document design: page background #F0E7DD, dark green #1E3A2F table headers, small-caps section labels, footer "Peak Nine for <client> · <section>"). Name it "Peak Nine for <client> - Technical and Financial Proposal.docx". The portal split (one file per upload slot) is done by Niels from the master, or by Tendi as separate `build_docx` calls, one per slot, named "<slot number> <slot name> - Peak Nine for <client>.docx", when he asks.

After Niels has marked up draft 1 and Canva is connected: copy `DAHWFiZkv6w`, read the copy to get the text locators, replace the text block by block, show what changed, commit on his yes, and return the edit URL. Then deliver the on-brand PDF of the copy with `deliver_canva_pdf` ("Peak Nine for <client> - Technical and Financial Proposal.pdf"). If export fails, give the edit URL and say the PDF is exported from Canva by hand.

## Step 6. The poster

The poster is a Canva whiteboard. Canva reports its page as not editable, but its edit tool does accept find-and-replace on the whole whiteboard page when you pass `is_editable: true` (tested on 8 Oct 2026: every occurrence of a find string on the poster is replaced, across all cards). That behaviour is not documented by Canva, so check the result every time and fall back to the manual list when it stops working.

1. Copy `DAHWICf3ANs` and save the copy's design id and edit URL in the workspace links. Never touch the master.
2. Build the ordered replacement list from the approved draft and post it in the thread (old text, new text, in order). Wait for Niels's yes.
3. On yes: read the copy with an editing transaction to get the whiteboard page's locator id (the page id). Apply the list with `find_and_replace_text` operations on that page locator, with `page_index: 1` and `is_editable: true`, in batches of about 20 operations per call, keeping the transaction open. Then commit. Tendi refuses to open an editing transaction on a master template, so a transaction on the master is never possible.
4. Re-read the copy's saved text (no transaction) and check every line of the list: the old text must be gone and the new text present. Search for template residue too: "Philea", "General Assembly", old dates, old names. Anything that did not change goes back to Niels as a short manual list.
5. Return the copy's edit link. That is the deliverable for the poster; export a PDF only when Niels asks.

Order matters, because each find-and-replace changes every occurrence on the whole poster:
- reference-case text first, because it contains short words (Benchmark, Roadmap, Draft) used later as chips
- long strings before any short substring they contain ("Workstream A to B" before "Workstream A")
- deliverable lines that contain dates before the month labels of the timeline
- chips and single words last
- never write a replacement that a later find string would match (write dates in full month names if a short month label is replaced later)
- text boxes with manual line breaks do not match a full-line find; replace in two or three chunks that stop at the break, and confirm in step 4
- avoid find strings that depend on the euro sign

Tell Niels what stays manual in Canva: the client logo in the header, moving milestone markers and phase bands to the new timeline slots, adding or removing team cards, overflow in cards where the new text runs longer, which case tag sits on which reference card, reference images. The poster normally goes into the work plan slot.

## Step 7. Close the loop

Update the workspace with: decisions, day allocation, draft status, Canva IDs and edit links of the copies, remaining text swaps, manual layout items, and the open items for Niels (bios, names to confirm, tax check with the accountant, clarifying questions to send before the questions deadline). Tell Niels in a short, scannable message what is done, what is not and what he must decide, and ask nothing he already answered.
