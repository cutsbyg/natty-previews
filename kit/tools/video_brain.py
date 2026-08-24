"""Ship a clip to Gemini (which watches frames + audio together) and get back a beat map:
funny moments, facial expressions, idea opens/payoffs, comedic timing — each with
timestamps and a why. Grady 2026-08-21: "i need some kind of ai brain that can understand
funny momets, facial expressions, remarks, open and closes in ideas, conversations,
comedic timing" — this is that brain; the ffmpeg pipeline stays the hands.

Usage: python tools/video_brain.py <video-path> <name> [extra prompt notes...]
Writes work/brain/<name>.beats.json. The upload proxy is 720p (Gemini samples 1fps, so
full res is wasted upload time on an 850MB source).
"""
import json, os, subprocess, sys, time
import urllib.request

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BRAIN = os.path.join(ROOT, "work", "brain")
# billing enabled 2026-08-21: gemini-pro-latest answers (3.1-pro-preview still 429s);
# flash models stay as the fallback rungs
MODELS = ["gemini-pro-latest", "gemini-3-flash-preview", "gemini-flash-latest"]
BASE = "https://generativelanguage.googleapis.com"

PROMPT = """You are watching raw footage from a barbershop content shoot. Grady (the barber)
films consults and challenges with clients for Instagram reels. Watch the WHOLE video —
facial expressions, voice, pauses, delivery — not just the words.

Map every moment worth keeping in a short-form comedy edit:
- "funny": a genuinely funny moment (verbal or visual). Say WHY it lands (delivery? face? absurdity?)
- "reaction": a facial expression / physical reaction that sells a beat
- "open": a line that opens an idea or sets stakes (good cold-open candidates)
- "payoff": where a setup pays off or an idea closes
- "dead": long spans with nothing usable (so the editor can skip them)

Be a harsh comedy editor: most of a raw take is NOT funny. Only flag moments a stranger
scrolling Instagram would stop for. Rate each keeper 1-5 on how hard it hits.

Return STRICT JSON only, no markdown fences:
{"summary": "2-3 sentences: what happens in this video and what the funniest arc is",
 "best_open": "M:SS - the single strongest cold-open moment and why",
 "beats": [{"start": "M:SS", "end": "M:SS", "kind": "funny|reaction|open|payoff|dead",
            "score": 1-5, "why": "specific reason, mention face/voice if visual"}]}
"""


def _key():
    with open(os.path.join(ROOT, ".env")) as f:
        for line in f:
            if line.startswith("GEMINI_API_KEY="):
                return line.split("=", 1)[1].strip()
    raise SystemExit("GEMINI_API_KEY not in instavids/.env")


def _req(url, data=None, headers=None, method=None, raw=False):
    r = urllib.request.Request(url, data=data, headers=headers or {}, method=method)
    with urllib.request.urlopen(r, timeout=600) as resp:
        body = resp.read()
        return (dict(resp.headers), body) if raw else json.loads(body)


def make_proxy(src, name):
    proxy = os.path.join(BRAIN, f"{name}.proxy.mp4")
    if not os.path.exists(proxy):
        subprocess.run(
            ["ffmpeg", "-nostdin", "-y", "-v", "error", "-i", src,
             "-vf", "scale=-2:720,fps=30", "-c:v", "libx264", "-crf", "26",
             "-preset", "veryfast", "-pix_fmt", "yuv420p",
             "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart", proxy], check=True)
    print(f"proxy: {os.path.getsize(proxy)/1e6:.0f} MB", flush=True)
    return proxy


def upload(key, path, name):
    size = os.path.getsize(path)
    hdrs, _ = _req(
        f"{BASE}/upload/v1beta/files?key={key}",
        data=json.dumps({"file": {"display_name": name}}).encode(),
        headers={"X-Goog-Upload-Protocol": "resumable", "X-Goog-Upload-Command": "start",
                 "X-Goog-Upload-Header-Content-Length": str(size),
                 "X-Goog-Upload-Header-Content-Type": "video/mp4",
                 "Content-Type": "application/json"}, raw=True)
    up_url = hdrs["X-Goog-Upload-URL"]
    with open(path, "rb") as f:
        blob = f.read()
    info = _req(up_url, data=blob,
                headers={"X-Goog-Upload-Command": "upload, finalize",
                         "X-Goog-Upload-Offset": "0", "Content-Length": str(size)})
    fname = info["file"]["name"]
    for _ in range(120):
        f = _req(f"{BASE}/v1beta/{fname}?key={key}")
        if f["state"] == "ACTIVE":
            return f["uri"]
        if f["state"] == "FAILED":
            raise SystemExit("Gemini failed to process the upload")
        print(f"  processing...", flush=True)
        time.sleep(5)
    raise SystemExit("timed out waiting for file to go ACTIVE")


def analyze(key, uri, notes):
    body = {"contents": [{"parts": [
        {"file_data": {"mime_type": "video/mp4", "file_uri": uri}},
        {"text": PROMPT + (f"\nExtra context from Grady: {notes}" if notes else "")}]}],
        "generationConfig": {"temperature": 0.4, "response_mime_type": "application/json"}}
    data = json.dumps(body).encode()
    for model in MODELS:
        for attempt in range(3):
            try:
                d = _req(f"{BASE}/v1beta/models/{model}:generateContent?key={key}",
                         data=data, headers={"Content-Type": "application/json"})
                print(f"  model: {model}", flush=True)
                return json.loads(d["candidates"][0]["content"]["parts"][0]["text"])
            except urllib.error.HTTPError as e:
                if e.code in (403, 404):
                    print(f"  {e.code} on {model}, stepping down", flush=True)
                    break
                if e.code != 429:
                    raise
                wait = 25 * (attempt + 1)
                print(f"  429 on {model}, retry in {wait}s...", flush=True)
                time.sleep(wait)
        print(f"  {model} rate-limited out, stepping down", flush=True)
    raise SystemExit("every model in the ladder is rate-limited")


def main():
    src, name = sys.argv[1], sys.argv[2]
    notes = " ".join(sys.argv[3:])
    os.makedirs(BRAIN, exist_ok=True)
    key = _key()
    proxy = make_proxy(src, name)
    print("uploading...", flush=True)
    uri = upload(key, proxy, name)
    print("analyzing...", flush=True)
    beats = analyze(key, uri, notes)
    out = os.path.join(BRAIN, f"{name}.beats.json")
    with open(out, "w", encoding="utf-8") as f:
        json.dump(beats, f, indent=2)
    keep = [b for b in beats["beats"] if b["kind"] != "dead"]
    print(f"\n{len(keep)} beats -> {out}")
    print(beats["summary"])


if __name__ == "__main__":
    main()
