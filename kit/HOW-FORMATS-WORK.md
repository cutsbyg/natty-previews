# How the format generator works

1. **Find** — search YouTube/TikTok/Instagram for what's actually trending in the client's niche (yt-dlp pulls the videos; verify every reference is real — a dead or invented link kills trust).
2. **Analyze** — `tools/hook_brain.py` uploads a video to Gemini and extracts, frame-accurately: the VERBAL hook (first spoken words), VISUAL hook (first 2 seconds on screen), TEXT hook (on-screen caption), the OPEN (how the first 10 seconds earns the watch), the CLOSE (ending/CTA), and the VALUE delivered. It reuses `video_brain.py`'s upload/model plumbing (the Gemini API key comes from an env var / local .env — never committed).
3. **Rewrite** — each analyzed video becomes a format card: same backbone, but "how YOU film it" with the client's actual products, yard, and voice, plus a ready caption. One-person, phone-only formats ONLY — nothing that needs a second person to perform on cue.
4. **Deliver** — `tools/mailer/make_emails.py` splits the 30-post doc into 10 plain-text daily emails; `send_day.py` sends one per morning and refuses to double-send. Arming steps in `tools/mailer/ARM-IT.md`.
5. **Taste rules** — problem-first hooks beat product-first ("why your cows stop here" beats "look at our chute"); silent loopable clips are legit (most feeds autoplay muted); drone-shot references get an honest "a ladder gets you 80% of the effect" adapt note.
