# Teamleader: deal and quotation

Constants to use when creating deals and quotations through the `teamleader_*` tools. Only after an explicit go from Niels or Jonas, and only after you showed the exact structure in the thread.

## Sales pipeline and phases

- Pipeline id: `5fca771a-80a9-0e61-9244-e43b4f38c725`
- Phase ids: Nieuw `0997e498-aac1-0236-bb6f-e46de01348cb`; Gecontacteerd `bd93433c-7252-0634-af6e-0f1f201348cc`; Meeting gepland `7221056c-d36b-0792-8367-76e3301348cd`; Offerte verzonden `2e40562a-4ae5-090d-8d65-d57c2a1348ce`; Aanvaard `eba6eac0-05a3-0766-8f64-9da5bc1348cf`; Geweigerd `781c964f-209c-025c-a868-3a65a21348d0`.
- Use "Offerte verzonden" when creating a deal at the same time as a quotation.
- Responsible user for new deals: Niels Van Espen `1dc0408f-6a00-0039-a953-c67fcb7767f8`.

If a tool call fails because an id is unknown, look the ids up with `teamleader_list_deal_pipelines`, `teamleader_list_deal_phases`, `teamleader_list_users` and `teamleader_list_tax_rates`, show Niels what you found, and continue with the confirmed ids.

## Quotation defaults

- Hourly rate: €122 (modular proposals). For a Proof of Change proposal the rate card is per man-day (see 02-proof-of-change.md); line items are then days at the MD rate.
- Currency: EUR; `currency_exchange_rate`: 1.
- Tax rate (21% VAT) id: `01fd76af-8a27-0598-844e-75e12b1ec381`.
- Each line item: `quantity` = hours (or days), `unit_price_amount` = 122 (or the MD rate), `tax_rate_id` as above, `description` = the deliverable name.

## Standard quotation structure for a 3-gate program

Each gate = one `grouped_lines` section (`section_title`) with 4 to 6 line items. Gate 3 is always a placeholder section with 0-hour items: it signals the stage-gated model without asking the client to commit to an unknown number upfront.

Gate 1, System Challenge Definition (3 months, roughly €55k). Typical deliverables and hours, adjust per program:
- System mapping and landscape research: 40
- Expert interviews and synthesis: 80
- Challenge statement development: 60
- Stakeholder validation workshops: 40
- Gate 1 report and go/no-go preparation: 30
About 250 hours × €122 = about €30,500 for a research-heavy Gate 1; a larger €55k Gate 1 is about 451 hours across the five deliverables.

Gate 2, Solution or Model Development (3 to 4 months, roughly €70k):
- Solution concept development: 120
- Financial and governance modelling: 80
- Co-design workshops with stakeholders: 60
- Business case development: 120
- Gate 2 report and go/no-go preparation: 50
About 430 hours × €122 = about €52,460 for a standard Gate 2; a larger €70k Gate 2 is about 574 hours.

Gate 3, Pilots (TBD after Gate 2): placeholder section, 0-hour items, for example "Pilot design and setup", "Pilot execution and monitoring", "Proof of Change assessment", "Final report and scale recommendations", or a single line "Pilot scope to be defined after Gate 2 go/no-go decision".

Hours = gate budget ÷ 122, distributed across the deliverables. Check: totals must match the proposal's financial overview within a few euros of rounding.

## Sequence

1. Look up the company: `teamleader_list_companies` with `term` = the client name. If found, note its `id`. If not found, `teamleader_create_company` with the client's full name (confirm the spelling with Niels first).
2. Create the deal: `teamleader_create_deal` with `title` "Peak Nine for [CLIENT NAME] - [PROGRAM TYPE]", `customer_type` "company", `customer_id`, `phase_id` = Offerte verzonden, `responsible_user_id` = Niels. Add `estimated_value_amount` (Gate 1 + Gate 2 excl. VAT) and `estimated_value_currency` "EUR" when the figures are known.
3. Create the quotation: `teamleader_create_quotation` with `deal_id`, `currency_code` "EUR", `currency_exchange_rate` 1, and `grouped_lines` as above.
4. Report back: deal title and id, quotation id, total hours and total value excl. VAT for Gate 1 plus Gate 2. The Teamleader deal URL format is believed to be `https://focus.teamleader.eu/deals/[deal_id]` (as pidgi uses `https://focus.teamleader.eu/projects/[project_id]/...` for projects); say it is unverified if you show it.

Never create a second deal for the same proposal: check `teamleader_list_deals` for an existing one with the same title first.
