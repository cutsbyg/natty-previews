> # 🛑 THIS TASK IS CLOSED (2026-08-28) — do not pick heroes from these sheets
> Grady picked every hero on 8/27–28 and three of the sites are already BUILT:
> - Boyer's Tree — AI climber (site live) · Command Site — AI excavator (site live)
> - Jones Construction — AI golden-hour (site live) · Lauvers — storm roof + crew (pending Grady's final yes)
> - Backdraft — AI cine-blue (live since 8/25) · Burkholder — skipped, door-knock only
> The sheets below now serve ONE purpose: shortlisting real photos for each site's PROJECT GRID.
> **Bug William hit (8/28): the Boyer's sheet shows PERSONAL-profile photos (including a mirror
> selfie of the likely owner) labeled as hero candidates.** That harvest came from a personal
> Facebook profile — photos OF a person are founder-class material at best (portrait law:
> AI-professionalized from a real photo, only with the owner's say-so at the door), never heroes.
> Current hero flow lives at: https://cutsbyg.github.io/natty-previews/heropick/ (AI candidates,
> Grady's gate). Source of truth for every site = the hub, crm/clients/.

# William — hero picking starts here

**William:** point your Claude at this file and say *"read this and walk me through it."*
**William's Claude:** you are running a guided workflow. Follow the steps in order, out loud,
one at a time. Don't dump this whole document on him — walk him through it.

---

## Step 0 — Claude: open the reference sites first

Before anything else, open these four in the browser, one tab each, and let William scroll
them. This is what a finished Reisinger Media website looks like — the standard every pick
serves:

1. https://cutsbyg.github.io/natty-previews/haas/ — Haas Creative Carpentry (the original reference build)
2. https://cutsbyg.github.io/natty-previews/wsl/ — WSL Incorporated
3. https://cutsbyg.github.io/natty-previews/bb-v4/ — Double B Farm Supply (Mike Brubaker — our first client)
4. https://cutsbyg.github.io/natty-previews/wenger/ — Wenger's Flooring

Point out, on any one of them: the **hero** (big photo, text box on the LEFT, subject on the
RIGHT), the **owner portrait** in the text box, the **project grid** (big before/after lead
card, even rows, a person working in every photo), reviews, and the sticky call button on
mobile. That's the anatomy. Every hero William picks becomes one of these.

## Step 1 — Claude: explain the job in two sentences

William picks the hero photo for each upcoming prospect website. A numbered contact sheet of
candidates exists for each business in the `heroes/` folder next to this file — his job is to
look at each sheet and pick the number that makes the best hero.

## Step 2 — What makes a good hero (the taste rules, learned the hard way)

**NEW DEFAULT (Grady, Aug 25): heroes are custom AI-generated for every trade except
portfolio trades like custom home builders.** So when a sheet's real photos are just okay,
"none of these — go AI" is usually the RIGHT answer, and Grady's Claude generates cinematic
candidates in that niche (that's how Jameson's and Backdraft's heroes were made). The sheets
still matter: the best real photos fill the work section of every site, and an exceptional
real shot can still win the hero.

- **The work being DONE by a person beats a picture of the result.** "Just a picture of trees
  is stupid" — Grady. A human doing the job, easily visible, wins.
- **The subject should sit RIGHT-of-frame or be extendable leftward** — the text box always
  lives on the left. Empty sky/background on the left is GOOD.
- **Cinematic beats mediocre.** If none of the business's own photos are good enough, say so
  in the pick — Grady's Claude can generate a cinematic AI hero in their niche (that's how
  Jameson's was made: https://cutsbyg.github.io/natty-previews/jameson-tree-pruners/).
- **Nothing fake that the owner would catch.** Never pick a photo that misrepresents their
  actual products or work — the owner spots it instantly (Mike caught a wrong tub in 5
  seconds).
- Calm, sharp, real light. Phone photos are fine; blurry or dark is not.

## Step 3 — The picking loop (Claude runs this per business)

For each folder in `heroes/` (one per business):
1. Show William the contact sheet image (`<business>-sheet.jpg`) full size.
2. Tell him the business name, trade, and town (in `NOTES.md` in that folder).
3. He answers with a number, or "none of these" (which is a valid, useful answer — write it
   down, Grady's Claude will hunt more photos or go cinematic).
4. Record every answer in `PICKS.md` in this folder, format:
   `- <Business> — pick: #N (or NONE — <one-line reason>)`

## Step 4 — Send the picks back

When all sheets are done, Claude composes the finished PICKS.md content as a plain message.
**William sends it to Grady** (text or email — gradymreisinger@gmail.com). Grady's Claude
builds every site from those picks the same night. That's the whole loop.

## Rules that are law (same as the meeting kit)

- Never invent facts, photos, reviews, or client work.
- No API keys or passwords in this repo, ever. Ask Grady directly for anything secret.
- Pricing is never discussed in this repo — Grady carries the numbers.
