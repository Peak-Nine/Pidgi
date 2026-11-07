---
name: scale-sustain-stories
description: Make Peak Nine's weekly "Scale & Sustain Stories" LinkedIn carousel (case of the week, organisation spotlight) from one case in the Beyond the Grant Case Library, by filling a copy of the master Canva template "Beyond the Grant - Organisation Spotlight" with the case's facts and the organisation's logo, plus the LinkedIn caption. Use this skill whenever Niels or Jonas mention the case of the week, Scale & Sustain Stories, the organisation spotlight, this week's LinkedIn case post, featuring a library case, or ask to pick or fill the next case, even if they don't name the template or the skill.
---

# Scale & Sustain Stories: the weekly case post

Each week Peak Nine posts one case from the Beyond the Grant Case Library
(library.peaknine.studio) as an 11-page LinkedIn carousel built in Canva, and tags
the featured organisation. This skill turns one library case into that post.

The master template is the Canva design **"Beyond the Grant - Organisation
Spotlight"**, ID `DAHZT4MaY2s`. It is the master: never fill it in. Every week works
on a copy. The slot-by-slot map (positions, widths, font sizes, character limits,
logo slots) is in `references/template-map.md`; read it before filling anything.

## The carousel, page by page

1. Cover: organisation logo, "Case of the week", a headline and a sub-headline.
2. Who they are: a statement, a paragraph and a wide hero image.
3. How they approach scale: the payer logic in one statement plus the numbers.
4. Timeline "Going from sustain to scale": four steps, each a relative-year pill, a short header and a line.
5 to 8. Four takeaways (01 to 04), each a reusable lesson backed by one fact.
9. Call to action: "Curious to scale and sustain your own intervention?"
10. End card with the Peak Nine logo.
11. Working page holding the LinkedIn caption. Never exported as a slide.

## Workflow

### 1. Pick the case (or take the one the user names)

Read the library live with the bundled script:

```bash
python scripts/library_case.py list --status success --evidence high --min-steps 4 --dated
python scripts/library_case.py show "One Acre Fund"
```

To see which cases have already been featured, search Canva for earlier issues
(`search-designs`, query "Scale & Sustain Stories") and exclude them with `--exclude`.
DHIS2 is the sample inside the master, so treat it as issue 00.

A good weekly pick:
- has an outcome of "lasted" and high evidence, so every claim is solid;
- has at least four timeline steps, because page 4 needs four;
- has numbers that show the payer shift (shares of cost, revenue, counts);
- adds variety: rotate payer routes, themes and regions from week to week;
- is an organisation that is active on LinkedIn, so the tag lands.

A stalled case can be featured now and then, but frame it as lessons and check with
the user first, because the organisation may not welcome the attention.

Propose one case in two or three lines (why it fits, the payer route, what the
numbers show) and wait for the user's OK.

### 2. Write the copy deck and get it approved

Fill every slot marked bold in `references/template-map.md`, within its character
limit. Show the user the deck as a simple list per page, plus the caption, and wait
for approval or edits before touching Canva.

Rules for the copy:
- **Every fact comes from the case**: the summary, timeline, models and their
  "why", lessons and evidence note. No outside facts, no rounding that changes
  meaning, no invented numbers. If a slot needs something the case doesn't hold, say
  so and ask.
- **Be honest about the payer**. If donors still pay part, or the sources stop
  before the payer shift is proven, say it, usually in the page 3 paragraph or a
  takeaway.
- **Peak Nine house style**: warm, plain and direct; short sentences; British
  spelling ("programme", "organisation"); no em dashes; no "it's not X, it's Y"
  constructions; no buzzwords; typographic apostrophes (’).
- **Timeline in relative years.** The pills read "year 1" for the first step, then
  "year 3", "years 2-4" and so on, counted from the first step's year. Never put a
  calendar year anywhere on page 4, in pills, headers or descriptions: the reader
  should see the time between milestones at a glance, without doing sums.
- **Takeaways** are lessons another programme can reuse, each backed by one fact
  from this case in the support line.
- **Page 9 paragraph** speaks for Peak Nine, for example: "Our Proof of Change
  programme helps development interventions build a path to financial
  sustainability and local ownership."
- **"Beyond the Grant" is always bold** wherever the formatting allows it.

### 3. The caption (also written onto page 11)

Follow the structure of the sample caption in the master:
1. A question that names the tension ("What does it take to ...?").
2. One line with the insight this case shows.
3. Two or three lines of story: where it started, how it changed, the milestone,
   with the case's numbers (calendar years are fine here).
4. "The lesson?" plus one or two sentences.
5. "Explore the <organisation> story and more real-world examples in our Beyond the
   Grant Library." then `https://library.peaknine.studio`.
6. Four hashtags: `#BeyondTheGrant` plus three that fit the theme.

Name the organisation's LinkedIn page (and any partner named in the caption) so the
user can tag them when posting.

### 4. The logo: always, every week

Never leave the previous organisation's logo in a post. Every week:

1. **Find the official logo on the organisation's own website** with the bundled
   script, which opens the site in a browser (passing bot checks), finds the header
   logo, renders it sharply and makes the black and white versions:
   ```bash
   python scripts/make_logo.py --site https://<organisation site>/ --out /tmp/logo
   ```
   Look at `logo-original.png` to confirm it is the right, current logo. If the
   script finds the wrong image, pass `--logo-url` with the logo file's address. If
   no usable logo can be found, stop and ask the user for the file.
2. **Upload both files to Canva**: call `create-upload-url` once per file, then send
   the file's raw bytes with
   `curl -s -X POST -H "Content-Type: application/octet-stream" --data-binary @<file> "<uploadUrl>"`.
   Only `application/octet-stream` works: `image/png` and form uploads are refused
   with error 415, and each upload URL can be used once. The response holds the
   `mediaId`. If the user's approval for the upload doesn't come through, say so and
   ask them to approve or upload the files themselves.
3. **Place them** as described in "Logos" in `references/template-map.md`: delete the
   old logo and `insert_fill` the new one at the slot's top, left and height, with
   the width from the aspect ratio. Black on pages 1 to 4, white on pages 5 to 8.

The logo identifies the organisation in an editorial feature; tagging them is the
courteous way to let them know.

### 5. The hero image on page 2

Do not replace the hero image with a photo found online: photos need the
organisation's permission, and many show participants. Leave it unless the user
supplies an image or confirms permission. If the image still shows another
organisation (the master holds a DHIS2 screenshot), warn the user plainly before
they post.

### 6. Build the copy in Canva

1. `copy-design` the master `DAHZT4MaY2s` and title it
   "Scale & Sustain Stories #NN: <organisation>" (`update_title`).
2. `read-design` the copy with `open_transaction: true` and
   `fields: ["design_content"]`. Element IDs in a copy match the master's.
3. Fill text with `replace_text` (it keeps the template's formatting). The year pills
   on page 4 are shapes with text inside: use `find_and_replace_text` on them.
4. On page 3, set the paragraph's top to the statement's top + new height + 48.
5. Swap the logos as in step 4.
6. Check every page thumbnail before moving on:
   - no text runs over or collides with other text;
   - **no line of text ends within about 40 px of the vertical "peaknine.studio"**
     (the large text boxes are 800 px wide for this reason; never widen them, and
     shorten the copy if a line still ends too close);
   - the logo sits where the old one did;
   - the hero image belongs to this organisation, or the user has been warned.
7. Show the user the previews and wait for explicit approval, then `commit`. Never
   commit before the user approves.

### 7. Deliver

- The Canva link to the copy.
- LinkedIn carousels are uploaded as a PDF document: offer to export pages 1 to 10
  as PDF (`export-design`), leaving out the caption page.
- The caption text in the reply, ready to paste, and the LinkedIn pages to tag.

## Things that go wrong

- **Text overflow or text too close to peaknine.studio**: shorten the copy rather
  than shrinking fonts or widening boxes; the template's sizes are the brand.
- **Fewer than four timeline steps or takeaways in the case**: pick another case or
  ask the user; never pad with invented steps.
- **Logo slot refuses the image** ("does not accept media replacements"): delete and
  insert as described above.
- **Upload refused or no approval**: say so plainly and ask the user to upload the
  logo files to Canva; find them with `get-assets`.
- **The user edits the copy in Canva by hand**: re-read the design before any change
  and never overwrite their edits.
