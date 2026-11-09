# Master template map: "Beyond the Grant - Organisation Spotlight"

Canva design ID of the master: `DAHZT4MaY2s` (11 fixed pages, 1080 x 1350 px).
Never edit the master. Every week works on a copy.

Element IDs change when a design is copied, so find each slot in the copy by
**page, type, position and font size** (positions in px from the top-left of the
page; match within a few px). Re-read the copy with `read-design`
(`open_transaction: true`, `fields: ["design_content"]`) before editing.

Fonts in the template: `YAGyACOUONc` (Funnel family, used everywhere) and
`YAGv8QTcROg` (pill and button text). Never change fonts; `replace_text` keeps the
existing formatting.

Character limits below are safe maximums so text stays inside its box. Aim lower
when the words allow it. Count spaces.

## The peaknine.studio strip: keep clear

Every page has "peaknine.studio" running vertically near the right edge. It occupies
roughly x 960 to 985 and y 174 to 436. No text may come within about 40 px of it.
That is why every large text box that crosses those heights is **800 px wide**
(left 108, right edge 908). Never widen these boxes. After filling, check the
thumbnails: if the end of a line sits close to the strip, shorten the copy rather than
moving or shrinking anything.

## Page 1: cover (sand panel)

| Slot | Type | Top, left | Size | Font | Limit | Fill with |
|---|---|---|---|---|---|---|
| Series label "SCALE & SUSTAIN STORIES" | text | 96, 108 | 728 x 25 | 21 bold | fixed | keep |
| Star mark | image | 72, 936 | 72 x 72 | | fixed | keep |
| "peaknine.studio" (vertical) | text | 293, 841 | rotated -90 | 21 | fixed | keep |
| **Organisation logo, large** | image | 256, 111 | 313 x 95 | | | the organisation's logo in black |
| "Case of the week" | text | 365, 108 | 364 x 51 | 43 | fixed | keep |
| Source line (40% opacity) | text | 423, 108 | 544 x 25 | 21 | fixed | keep ("From the Peak Nine Beyond the Grant Library") |
| **Headline** | text | 502, 108 | 876 x 445 | 107 | 55 | what the organisation achieves, in plain words |
| **Sub-headline** | text | 986, 108 | 631 x 170 | 32 | 120 | what they are and for whom |
| "Swipe for their story" + arrow | text, line | 1211, 472 | | 27 | fixed | keep |

## Page 2: who they are (sand panel on top, image band below)

| Slot | Type | Top, left | Size | Font | Limit | Fill with |
|---|---|---|---|---|---|---|
| **Organisation logo, small** | image | 89, 462 | 127 x 39 | | | logo in black |
| "Who they are" | text | 225, 112 | | 27 | fixed | keep |
| **Statement** | text | 288, 108 | 800 x up to 417 | 75 | 90 | one sentence: who they are and what they do (5 lines at most) |
| **Paragraph** | text | 749, 110 | 826 x 170 | 32 | 190 | origin, where they work, how it works |
| **Hero image** | image (replaceable) | 1016, 15 | 1049 x 318 | | | photo or visual of the work, wide crop (about 3.3 : 1) |
| "Read more" + arrow (white) | text, line | 1204, 641 | | 32 | fixed | keep; needs a darkish image behind it |

## Page 3: how they approach scale

| Slot | Type | Top, left | Size | Font | Limit | Fill with |
|---|---|---|---|---|---|---|
| **Organisation logo, small** | image | 89, 462 | 127 x 39 | | | logo in black |
| "How they approach scale" | text | 225, 112 | | 27 | fixed | keep |
| **Statement** | text | 288, 108 | 800 x up to 640 | 96 | 75 | the payer logic in one sentence (6 lines at most) |
| **Paragraph** | text | see note, 110 | 826 x 170 | 32 | 190 | the numbers behind it, and who still pays what |

Page 3 paragraph position: after filling the statement, read its new height from
the edit result and set the paragraph's top to statement top + height + 48
(a five-line statement puts it at about 871, six lines at about 960). The master
keeps it at 960.

## Page 4: timeline "Going from sustain to scale"

Title (174, 108, 75 px) stays fixed. Four rows, each a pill, a header and a description.

| Row | Pill (shape with text) top | Header top | Description top |
|---|---|---|---|
| 1 | 447 | 447 | 507 |
| 2 | 619 | 622 | 682 |
| 3 | 803 | 805 | 869 |
| 4 | 987 | 997 | 1061 |

All pills: left 108, 179 x 74, 32 px text, **limit 9 characters**, always **relative years**:
"year 1" for the first step, then "year 3", "years 2-4", "year 12" and so on, counted from
the first step's year. Never a calendar year: readers should not have to work out how
much time passed between milestones.
All headers: left 337, about 600 wide, 43 px, **limit 24 characters** (2 to 4 words, one line).
All descriptions: left 337, 635 wide, 19 px, **limit 140 characters** (two lines), with
**no calendar years** in them either.

## Pages 5 to 8: takeaways 01 to 04 (dark panel)

Same layout on each page; only the number differs ("01" to "04", fixed).

| Slot | Type | Top, left | Size | Font | Limit | Fill with |
|---|---|---|---|---|---|---|
| **Organisation logo, small** | image | 89, 462 | 127 x 39 | | | logo in **white** |
| Number | text | 189, 108 | | 96 | fixed | keep |
| **Takeaway** | text | 367, 108 | 800 x up to 576 | 96 | 85 | the lesson, as a short line a reader can reuse (6 lines at most) |
| **Support line** | text | 1016, 108 | 778 x 126 | 32 | 140 | the fact from this case that backs it up |

The master's sample takeaways are placeholders; replace them every time.

## Page 9: call to action (dark panel)

| Slot | Type | Top, left | Size | Font | Limit | Fill with |
|---|---|---|---|---|---|---|
| Headline "Curious to scale and sustain your own intervention?" | text | 174, 108 | 800 wide, 5 lines | 107 | fixed | keep |
| **Paragraph** | text | 775, 108 | 778 x 126 | 32 | 140 | a Peak Nine line (see SKILL.md); the master still holds a DHIS2 sample here |
| Button "Let's have a chat" | text on lime shape | 1176, 146 | | 32 | fixed | keep |

## Page 10: end card

Peak Nine logo and "www.peaknine.studio". Fixed.

## Page 11: LinkedIn caption (lime page)

One text element (top 108, left 108, 864 x 940, 32 px) holding the post text.
It is a working page for the caption: never export it as a slide.
Replace the whole text with the new caption (`replace_text` on that element), then
set its font size to 27 (`format_text`) so a full caption fits the page.

## Logos: how they are set up

The template's logos are single-colour images: black on the sand pages (1 to 4) and
white on the dark pages (5 to 8). Make both files every week with
`scripts/make_logo.py` (see SKILL.md).

The logo slots refuse a direct swap (`update_fill` returns "does not accept media
replacements"). Replace each one by deleting the old logo and inserting the new file
at the same spot, with the height fixed and the width set from the logo's own aspect
ratio (width = height x aspect ratio):

| Slot | Pages | File | Top | Left | Height |
|---|---|---|---|---|---|
| Large logo | 1 | black | 256.34 | 111.08 | 94.82 |
| Small logo | 2, 3, 4 | black | 88.74 | 462 | 38.51 |
| Small logo | 5, 6, 7, 8 | white | 88.74 | 462 | 38.51 |

A very wide logo (aspect ratio above about 5) would run into the series label on the
small slot: then reduce the height until the width stays under 330 px.
