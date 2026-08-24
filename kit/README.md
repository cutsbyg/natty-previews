# Natty Websites — Brubaker meeting kit

This repo is the shared brain for the Mike Brubaker (Double B Farm Supply) pitch, so anyone's Claude can get up to speed fast.

## The live sites (show these)
- Main: https://cutsbyg.github.io/natty-previews/bb-v4/ ← open this one first (composite cow hero)
- Variants: https://cutsbyg.github.io/natty-previews/bb-v1/ · /bb-v2/ · /bb-v3/
- The currently-live original: https://cutsbyg.github.io/natty-previews/rebuild-doubleb/

## The content system (show this second)
- `brubaker/FORMATS-3-FOR-MIKE.md` — 3 ready-to-film video formats with the full backbone: visual/verbal/text hook, open, close, value, and a second-by-second playout.
- `brubaker/POSTS-30.md` — 30 trending posts in his niche, same backbone on every one, grouped 3-a-day for a daily email drip.
- `brubaker/EMAIL-DAY1.md` — the first email Mike gets the moment he says yes.
- `brubaker/best20-sheet.jpg` — the 20 best photos scraped from his own Facebook (851 reviewed).

## How format generation works
Read `HOW-FORMATS-WORK.md`. Short version: find genuinely trending videos in the client's niche → run them through a Gemini video-analysis tool (`tools/hook_brain.py`) that extracts the verbal hook, visual hook, text hook, open, close and value frame-accurately → rewrite each as a "how YOU film it" card using the client's real products → deliver 3 per day by email (`tools/mailer/`).

## The offer at the meeting
Free website already built + free month of trending-format posts + $0 down. Monthly starts day 31. (Grady carries the numbers — they are not in this repo on purpose.)

## Rules that are law
- Never invent facts, photos, reviews, or client work. Real references only.
- Every fact on a page must be sourceable to the client's own published material.
- No API keys or passwords in this repo, ever. Ask Grady directly for keys.
