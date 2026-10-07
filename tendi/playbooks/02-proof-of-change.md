# Playbook: Proof of Change proposal

Turn a client briefing into a Peak Nine proposal built on the Proof of Change methodology, delivered as a filled, duplicated Canva deck. The deck is the single deliverable. No Word companion unless explicitly asked (then use `build_docx` with the same content).

Canonical template in Canva: design ID `DAHRT8eVhhA`, titled "(Template) Peak Nine for Client Name - Proof of Change" (37 pages). Never edit the master. Always duplicate first.

## The methodology (own this before writing anything)

Peak Nine is a systemic impact innovation studio. It helps donors and grantees move beyond the grant into lasting, self-sustaining impact at scale. Proof of Change is its proprietary framework, built organically on Theory of Change. Where Theory of Change is explorative, project-based and donor-centric (why and what), Proof of Change is decisive and system-based (how): assumptions meet reality, meaning real people, real incentives, real institutions, real constraints.

### The five proof points

- Demand Proof. Validates real need, value and readiness of user groups and potential payers and partners. Criteria: awareness of the problem; proof of a problem worth solving; understanding; inclusion; accessibility and affordability.
- Traction Proof. Validates that people choose it and use it repeatedly, adoption is stable enough to measure, growth is understood. Criteria: start to use; keep on using; big enough to scale; growth mechanism exists; easy enough to scale.
- Impact Proof. Validates that outcomes are measurably better than the current alternative (or cheaper for the same outcomes). Criteria: clarity on outcomes; baseline metrics; impact measurement experiments; outcome metrics; impact evidence gap.
- Economics Proof. Validates a viable path to fund the runway beyond the grant through revenue and cost-down levers. Criteria: clear view on 2 to 3 realistic funding routes; historic data visible and complete; costs visible and complete; staged funding transition plan; willingness-to-pay validated.
- Resilience Proof. Validates that the solution survives leadership changes, donor cycles, geographic expansion. Criteria: day-to-day operations have continuity; ownership is defined; replication is predictable; exit plan is real; scaling pathways defined, tested, proven.

### The process: three gates

1. Audit of Change (about 2 weeks). Understand where the initiative stands, what is proven, what remains uncertain. Modules: Co-creative Kickoff, then Insights and Research (desk research, expert and stakeholder interviews, system assessment), then Analysis and Outlook (strategic benchmarking, Proof of Change evaluation). Outcomes: ecosystem and value-flow map, the five proof areas assessed, stakeholder perspectives, strategic benchmarks, 10 to 20 evidence gaps and assumptions, areas of opportunity defined.
2. Opportunities of Change (about 2 weeks). Turn evidence into focused, viable directions. Modules: Co-creative Ideation, then Filtering and Roadmap (impact prioritisation, financial modelling of 2 to 3 scenarios over 3 to 5 years, strategic roadmap for the next 6 to 12 months). Outcomes: 50 to 150 ideas, 8 to 15 concepts, 3 to 5 priorities, refined stakeholder value propositions, comparative financial model, clear assumptions and validation priorities.
3. Road to Change (scope TBD). Translate the selected direction into action. Capabilities drawn per need: service and product design, prototyping, partnerships, business modelling, funding, communication, governance, digital development. Never prescribed upfront; shaped collaboratively after gate 2.

Rate card (excl. VAT): up to 10 MD at €1,000 per MD; 11 to 25 MD at €975 per MD; more than 25 MD at €950 per MD. The tier applies to the total MD volume of the proposal.

## Step 1. Ingest the briefing

Read everything provided. Map what you find onto the fixed question set below and note what each briefing already answers. Save the facts with `workspace_update`.

## Step 2. The fixed question set

These ten questions define what every Proof of Change proposal needs. Ask ONLY the ones the briefing leaves open, numbered, in one message. Never fill a gap with a guess.

1. Client and initiative: who is the client, what is the intervention, what stage is it at, where does it operate, who uses it?
2. Main challenge statement: what must transition beyond the grant, in one or two sharp sentences?
3. Client's unfair advantage: what does this client or initiative uniquely have going for it?
4. Funding reality: current donor or grant situation, runway, pressure points.
5. Evidence baseline: what is already proven versus assumed across the five proofs (even a rough read helps tailor emphasis)?
6. Scope: all three gates, or Audit of Change only, or Audit plus Opportunities?
7. Timeline: constraints, desired start, deadlines (tender deadlines especially).
8. Budget envelope: MD expectations or budget ceiling, and whether the standard rate card applies.
9. Procurement context: tender reference number, formal addressee, submission requirements, evaluation criteria.
10. Audience and language: who decides, and in which language should the proposal be written?

## Step 3. Research the client

Web search on the client and the initiative: what the intervention actually does and for whom, its funding history, public signals about sustainability or scale ambitions, anything that bridges naturally to the five proof points. Context and sharpness only. Never invent facts about the client, never contradict the briefing.

## Step 4. Draft the tailored slide copy

The deck has fixed methodology slides and client-tailored slides. Identify slides by their content markers, not page numbers (the template may evolve).

Tailored slides (rewrite per client):
- Cover: "Large project title or name" plus subtitle plus "Client Name".
- Cover letter (marker: "Dear XXX Procurement Team"): a personal letter from Niels and Jonas on why this engagement sits at the intersection of Peak Nine's passion and expertise. The template contains leftover OpenTeleRehab / Enabel / HI text here: always fully replace it.
- The Challenge (marker: "Main Challenge Statement" / "THE CHALLENGE"): the client's challenge in Proof of Change terms.
- Client unfair advantage (marker: "Main Client Unfair Advantage" / "CLIENT NAME").
- Co-creative Kickoff slide: its bullet list is client-specific (template residue mentions "OTR", replace it).
- Timeline (marker: "Timeline phases real time XXX"): real weeks and milestones for the proposed scope. Use `date_info`.
- Financial Proposal (marker: "Financial Proposal" with MD lines and total): MD per gate, total excl. VAT, consistent with the rate card.
- Financial Overview (three-column gate summary): investment, lead time, modules, deliverables per gate, matching the proposed scope.

Fixed slides (do not rewrite; only replace placeholder tokens such as "Client Name", "XXX", "Lorem ipsum", "Header Subtitle" where they appear): Peak Nine positioning, Point of View reality and opportunity slides, the Theory of Change versus Proof of Change comparison, the five proof points, the criteria matrix, all process and tools-and-methods slides, closing contact slide.

"Beyond the grant" thinking should be visible in the challenge and the cover letter. Every substantive claim traces back to the briefing, the answered questions, or research you can point to.

Post the drafted copy in the thread, slide by slide (name each slide by its marker), for a quick pass BEFORE touching Canva. Iterate until approved.

## Step 5. Duplicate and fill the deck (only on go, only when Canva is connected)

1. Copy design `DAHRT8eVhhA`. Never edit the master.
2. Rename the copy: "Peak Nine for [CLIENT NAME] - Proof of Change".
3. Read the copy to get the locator or element IDs per text element.
4. Replace the tailored slide content and every placeholder token. Watch text length: keep replacements close to the placeholder's length so slides do not overflow. If a drafted text clearly exceeds the space, shorten the slide text and keep the fuller version in the thread.
5. If scope excludes a gate (for example Audit only), adjust the financial slides and tell Niels which process slides he may want to hide or delete manually rather than deleting pages yourself.
6. Commit the edits and return the edit URL. Save it with `workspace_update` (links).

## Step 6. Deliver

Give Niels: the Canva edit link, a short list of what was filled where, and any slide where text length forced a compromise. Keep the closing message short. Do not create Teamleader records unless explicitly asked; if the proposal is later accepted, the deal-won flow handles that.

## Quality checks before finishing

- Zero template residue: no "OpenTeleRehab", "Enabel", "HI", "OTR", "XXX", "Lorem ipsum", "Client Name" left anywhere.
- The challenge statement is specific enough to act on, framed in Proof of Change terms.
- The five proof points and the criteria matrix are untouched (fixed methodology).
- Financial figures are internally consistent: MD × rate tier = total, and the rate tier matches the total MD volume.
- Every client fact traces to the briefing, Niels's answers, or cited research. Nothing invented.
- Language passes the voice rules in 00-voice.md.
