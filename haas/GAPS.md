# Haas Creative Carpentry — gaps and measured trades

Everything here is a number that was measured on the shipped build, not an opinion.
Last measured 2026-08-15 against `http://localhost:8099/haaswebsite/builds/haas-blueprint/`.

---

## §1.0b-A — the two required hero numbers

| | measured | required | verdict |
|---|---|---|---|
| `panel.rightEdge` | **46.00%** of the media box (identical at 1366 / 1440 / 1920 / 2545 / 3440) | — | — |
| `subject.leftEdge` | **50.95%** of the media box | ≥ `panel.rightEdge + 3%` = 49.00% | **PASS**, by 1.95 points |

**How `subject.leftEdge` was read.** The subject is the timber-frame house. `img/house-cut.png`
is its alpha cut-out and is placed at `left:47.19%` — but that rect is the PNG's canvas, not the
house. The first 79 of the PNG's 856 columns are fully transparent, so the leftmost opaque pixel
of the building sits at `47.19% + 79/856 × 40.76% =` **50.95%**. Taking the rect's `left` at face
value would have reported 47.19% and failed the test on an artefact of the file, not the frame.
Clear frame between the panel's right edge and the house: **4.95%**.

**Test 1 — the subject is whole.** Discrete object. The house runs 50.95%–87.95% horizontally and
3.71%–90.96% vertically, with sky above the chimney and patio below the foundation. You can see
the whole house. PASS.

**Not re-cropped, deliberately.** The frame was already cropped 932 → 808 with the percentage
overlays rescaled by 1.15347; both tests pass on it, so re-cropping would only move `hero__pop`
and `hero__fly` off the house for no gain.

### Open on the hero

- **The pool is cut by the bottom and left frame edges.** It is not the product — Haas is a
  carpenter and the house is the subject — so this is not a Test 1 failure. Worth knowing if the
  hero is ever re-framed.
- **Resolution.** The desktop asset is 2100 px wide. Above ~2100 px of viewport it is upscaled
  (1.64× at 3440). Ask Dustin for the original full-resolution file, or upscale it.

---

## §1a — the built-work limit was hand-measured, and the tool was wrong in the loose direction

§1a requires an override to be written down with all three numbers. Here they are.

| | |
|---|---|
| `panelcheck` derived limit | **58.7%** (it confirmed built work at 66.7%, run 16/21 cells, less its 8% ridge margin) |
| what the detector actually fired on | the **lit stone wall and columns** of the pool pavilion at 66.7% — the brightest contiguous run under the panel's x-span |
| hand-measured built work | **50.7%** — the pool pavilion's hip-roof ridge apex, read off a 1%-gridline overlay and confirmed by a pixel scan down column x = 22.6%, where the dark blue metal roof begins at row 410 of 808 |
| governing limit | **50.7%** — the lower of the two, always |
| required rail bottom (§1a step 8c, limit − 3%) | **≤ 47.70%** |

This is the exact failure §1a predicts: a dark standing-seam roof against dark trees at dusk has
almost no area, so the detector skips it and fires on the lit masonry 16 points lower. Trusting
58.7% would have licensed the panel to sit 8 points onto Dustin's own pool house while printing
`OK`.

**Before this pass the rail was resting on that ridge** — 50.82% at 1440 against a 50.7% apex,
i.e. contact, not clearance.

---

## §1a step 2 — achieved headline fill, and why it is not 85%

| viewport | h1 | words column | fill | rail bottom | clearance below 50.7% |
|---|---|---|---|---|---|
| 1366 | 44.2 px | 383 px | 75.6% | 47.23% | 3.47 pts |
| 1440 | 46.6 px | 404 px | 75.6% | 47.08% | 3.62 pts |
| 1920 | 62.2 px | 540 px | 75.4% | 45.77% | 4.93 pts |
| 2545 | 82.5 px | 716 px | 75.5% | 43.51% | 7.19 pts |
| 3440 | 111.6 px | 968 px | 75.5% | 41.31% | 9.39 pts |
| 430 (slab) | 37.8 px | 291 px | 85.2% | panel is below the photo | n/a |
| 393 (phone) | 34.6 px | 265 px | 85.5% | " | n/a |
| 375 (phone) | 33.0 px | 250 px | 86.5% | " | n/a |

`h1.scrollWidth − h1.clientWidth = 0` and the rendered line count = the authored 4 at every one of
these widths.

**The 85% floor is unreachable on desktop and this is the measured reason.** The words column is
70.3% of the panel's content box, and `DELIVERING` sets 6.55× its own font-size in Archivo 900, so
85% fill needs `9.1cqw`. Four lines at .82 leading add 3.28 px of panel for every 1 px of type, so
`9.1cqw` puts the rail at **55.8%** — five points *inside* the pool pavilion's roof. §1a step 2's
own escape clause governs: the built-work limit outranks the fill ratio.

All four named levers were spent before the headline yielded:

1. panel padding `.55vw → .38vw`
2. panel top inset `3.5% → 2.0%`
3. the rating badge `4.6cqw → 3.9cqw` stars, and the support line `2.0cqw → 1.85cqw`
4. the action row's `rem` floors — it was the panel's only `rem`-governed block, which is why the
   rail sat at 50.8% on a 1440 and 48.3% on a 1920 off the same CSS

Only then did the coefficient settle at **`min(7rem, 8.1cqw)`**, tuned at 1366 (the narrowest
desktop width) as §1a step 2 requires. Achieved 75.6% — above the signed-off reference's ~74%,
below the 85% floor, recorded here rather than quietly passed.

---

## §3.4 — page height is over the bar, and it was over before this pass

**6035 px = 6.71 viewports at 1440×900, against a bar of 6.0.** Measured at 6004 px / 6.67
viewports with the old reviews styling, so the §6 fixes below cost 31 px of it; the overage is
pre-existing and structural.

It is **not** being taken out of the reviews band — §6 is explicit that the band a customer
speaks in never gets the tight treatment. The height is in `cta` (1515 px, the CTA plus the
submit-a-project form) and `work` (1061 px). That is where a future pass should look.

---

## §6 — reviews

Compliant as of this pass: per-card gold star rows inside every card, above the quote, at
**1.6rem**; quote **1.12rem**; reviewer name **1.05rem** at 800; card padding **1.6rem**; no
percentage, no score-out-of-ten, no bar or gauge anywhere on the page. The hero panel carries the
score (4.7 on Google) and the band carries the count (11 reviews on Google →), each fact once.

Open: **the three quoted reviews are carried at five stars each.** They came from Google, where
the aggregate is 4.7 across 11. If any of the three is not actually a 5★ review, its card must
show its own real count — four filled and one empty — and that has to come from the profile, not
from an assumption. Worth one look at the Google Business Profile before this goes live.
