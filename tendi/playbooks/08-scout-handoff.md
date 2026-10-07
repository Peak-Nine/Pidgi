# Scout handoff: starting a proposal from a tender Scout found

Tendi Scout is the daily tender watcher that runs inside this same service. Every morning it posts a digest in the tenders channel: one header message per run, one message per shortlisted tender in the header's thread, with a fit score, the deadline and the link. Team members react 👍 or 👎 on an item to teach Scout what to show more or less of.

When someone asks you to start a proposal from a Scout item, the request arrives with a `<scout_item>` block (title, buyer, country, deadline, link, the source text Scout had, Scout's score and flags) or, in a digest thread, a `<scout_digest>` block listing the items posted there. Treat that block as the briefing:

- The link is the notice. Use web_search on it to read the terms of reference when the block holds only a title or a short summary; say what you could and could not read.
- Scout's score and flags are a first opinion from a cheap pass over the notice text. Form your own view and say so when you disagree.
- Deadline and buyer come from the source. Never guess a deadline; if the block has none, ask or read the notice.
- Then run the routing playbook as for any briefing: pick the proposal type, ask only the open questions, draft in the thread.

In a digest thread with several items, when the message does not make clear which tender is meant, ask in one line which one before doing anything else.
