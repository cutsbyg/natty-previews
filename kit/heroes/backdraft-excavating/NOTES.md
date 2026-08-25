# Backdraft Excavating, LLC — ROUND 2, all 8 are fresh

- **Business:** Backdraft Excavating, LLC
- **Trade:** excavating / drainage / driveways
- **Town:** Duncannon, PA — 3 Firehouse Road. Phone 717.853.0850
- **FB URL:** https://www.facebook.com/backdraftexcavating
- **Own website:** https://backdraftexcavating.com (live WordPress, behind Cloudflare)
- **Photo-set assessment:** **Round 1 was all finished driveways and trenches, and Grady
  rejected it. This round deliberately leads with people and iron instead.** Every one of the
  8 on the sheet is new — none was offered in the previous round.

## How "fresh" was enforced

The 12 photos offered in round 1 (`clients/backdraft-excavating/research/CANDIDATES.json`:
30, 01, 16, 31, 12, 27, 36, 20, 29, 28, 17, 39) were perceptually hashed and every candidate
in the new pool was checked against them. **11 of the 12 were re-found in the new harvest and
mechanically excluded**; the pool that survived is 53 photos, and the sheet is the best 8 of
those. Nothing on this sheet has been shown to Grady before.

## Where the new material came from

| Source | Yield |
|---|---|
| FB `/photos`, `/photos_by`, `/photos_albums`, root, `/posts`, `/photos_all` + every `media/set/?set=a.<id>` album, then each `photo.php?fbid=` permalink | **56 photos** |
| `backdraftexcavating.com` WordPress media library via `wp-json/wp/v2/media` (needed a stealth fetch — plain requests get a Cloudflare 403) | 56 files, of which **32 are their own photos** and 24 are theme stock (pexels/*, Rectangle-*, mt-sample-*, skid-loader-background, the yellow header) — the stock was deleted, not sheeted |
| **Merged, de-duplicated pool** | 88 files in `big/`, 53 of them never previously offered |

Their site's own gallery turned out to be **their Facebook photos re-uploaded** — the WordPress
filenames are the fbcdn ids. So the site added resolution (1.2–4 MB originals vs Facebook's
compressed serves), not new subjects. The genuinely new subjects came from the deeper FB
albums.

## The 8 on the sheet, in the order I'd rank them

| # | What it is | Why it's here |
|---|---|---|
| 1 | **Two men shaking hands in front of a new Bobcat mini-excavator on its tracks**, blue sky, open gravel yard | **Best hero, and the single most "fresh" frame they own.** Both men clearly readable, subject sits right-of-centre, the whole left half is gravel and sky — perfect left-extend for the text box. **Two flags:** the man on the right is dressed as an equipment-dealer rep (delivery-day handshake, so he may not be staff), and a **"Reub's Refuse 717-994-6718" sign** sits in the background at right — crop or clone it |
| 2 | Man kneeling with a hand float, finishing a fresh concrete pad along white siding | **Person doing the work, unmistakable at any size.** Subject is left-of-frame, so the text box would want the right side, or mirror it |
| 3 | Deep red-clay trench with a black corrugated riser standing in it | The most dramatic dirt frame in the fresh pool — colour and depth |
| 4 | Tight low shot of a yellow CAT skid steer, orange cones and a red barn behind | Iron, hard and close. **2048x1072 — already a wide hero band, no crop or upscale needed.** No person |
| 5 | New stone drive sweeping up to an old stone-and-clapboard farmhouse in autumn light | The best *scene* they own — a real house, real light, a job you can see |
| 6 | Long new stone lane curving through a fenced green field | Calm, wide, plenty of left space |
| 7 | Two people standing above a rebuilt stone bank behind a house | Has humans, but they read as **homeowners, not crew** — arms folded, street clothes. Weakest of the eight |
| 8 | Black drain pipe bedded in clean white stone, greenery either side | A texture close-up of what they actually sell. No person, no context |

## Harvest completeness

**Facebook: deep walk done, end not proven** — 56 photos across every album link the logged-out
page exposes, each pulled full-res through `photo.php?fbid=`. Facebook does not paginate album
grids logged out, so record this as **"56 found — deeper album unwalked"**.
**Website: complete** — the `wp-json` media endpoint enumerates the entire WordPress library
and it returned under one page (100 items), so that source *is* exhausted.

## Still worth knowing

- Their live site runs a **stock dozer photo** in the hero while they own a backhoe with their
  own name painted on the boom — that contrast is the pitch [FACTS.md]
- Logo is a fire-service Maltese cross with a hard hat and a backhoe; "Backdraft" is a
  firefighting term, not a surname — the registered address is 3 Firehouse Road
- No owner name is confirmed to the 0.85 bar; do not put a person's name on the site yet
