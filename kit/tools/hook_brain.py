"""Same Gemini plumbing as video_brain.py, different question: instead of comedy beats,
pull the SHORT-FORM BACKBONE out of a reference post — verbal hook, visual hook, text hook,
open, close, value. Built 2026-08-24 for the Double B Farm Supply "30 trending posts" deck.

Usage: python tools/hook_brain.py <video-path> <name> [extra context...]
Writes work/brain/<name>.hooks.json
"""
import json, os, sys

import video_brain as vb  # reuse proxy/upload/model-ladder

PROMPT = """You are watching a real social-media video from the cattle-handling / farm-equipment
niche. A dealer wants to copy its BACKBONE. Watch the whole thing: what is spoken, what is on
screen, what text is burned in, how it opens and how it ends.

Report the structure frame-accurately. Quote real words — never invent a line that was not said
or shown. If an element is absent (e.g. no on-screen text), say "none" and say what carries that
job instead.

Return STRICT JSON only, no markdown fences:
{"summary": "2-3 sentences: what happens in this video",
 "verbal_hook": {"t": "M:SS", "quote": "the first spoken line, verbatim", "why": "why it holds"},
 "visual_hook": {"t": "0:00-0:02", "what": "exactly what is on screen in the first 2 seconds",
                 "shot": "framing/angle/motion", "why": "why it stops a scroll"},
 "text_hook": {"t": "M:SS", "quote": "on-screen text verbatim or 'none'", "style": "placement/size"},
 "open": {"span": "0:00-0:10", "how": "how the first 10 seconds earn the watch — the promise,
          question, or tension set up, beat by beat"},
 "close": {"t": "M:SS", "how": "how it ends", "cta": "the call to action, verbatim or 'none'"},
 "value": "what the viewer walks away with in one sentence",
 "pacing": "cut rhythm, roughly how many seconds per shot, any dead air",
 "reproducible_solo": "yes/no + what one person with a phone on a tripod would need"}
"""


def main():
    src, name = sys.argv[1], sys.argv[2]
    notes = " ".join(sys.argv[3:])
    os.makedirs(vb.BRAIN, exist_ok=True)
    key = vb._key()
    proxy = vb.make_proxy(src, name)
    print("uploading...", flush=True)
    uri = vb.upload(key, proxy, name)
    print("analyzing...", flush=True)
    vb.PROMPT = PROMPT  # analyze() reads the module global
    out_data = vb.analyze(key, uri, notes)
    out = os.path.join(vb.BRAIN, f"{name}.hooks.json")
    with open(out, "w", encoding="utf-8") as f:
        json.dump(out_data, f, indent=2)
    print(f"\n-> {out}")
    print(json.dumps(out_data, indent=2)[:4000])


if __name__ == "__main__":
    main()
