"""Split POSTS-30.md into 10 ready-to-send emails (day-01.md .. day-10.md)."""
import re, pathlib

HERE = pathlib.Path(__file__).resolve().parent
SRC = HERE.parent / "POSTS-30.md"
FOOTER = ("Want us to film and edit any of these for you instead? "
          "That's the done-for-you plan - just hit reply.")


def clean(s):
    s = re.sub(r"\*\([^)]*\)\*", "", s)                 # drop *(0:02)* timestamps
    s = s.replace("**", "").replace("*", "").strip(" :")
    return " ".join(s.split())


def yours(txt):
    """Mike's version of a hook if given, else the reference line."""
    m = re.search(r"→ \*\*Yours:\*\*(.*)", txt)
    return clean(m.group(1) if m else txt.split("→")[0])


def parse_post(num, title, body):
    bl = {}
    for chunk in re.split(r"\n- (?=\*\*)", "\n" + body):
        m = re.match(r"\*\*([A-Z ]+)\*\*(.*)", chunk.split("\n\n")[0], re.S)
        if m:
            bl[m.group(1).strip()] = m.group(2)
    films = re.search(r"\*\*How Mike films it:\*\*(.*?)\n\n", body, re.S)
    caption = re.findall(r"^> (.*)$", body.split("**Caption:**")[-1], re.M)
    lines = [f"POST {num} - {clean(title)}", ""]
    for label, key in (("Say this first:", "VERBAL HOOK"),
                       ("Point the phone at:", "VISUAL HOOK"),
                       ("Words on screen:", "TEXT HOOK")):
        if key in bl:
            lines.append(f"{label} {yours(bl[key])}")
    if "OPEN" in bl:
        lines.append(f"Why the first seconds hold: {clean(bl['OPEN'])}")
    if "CLOSE" in bl:
        lines.append(f"How it ends: {clean(bl['CLOSE'])}")
    if "VALUE" in bl:
        lines.append(f"What they walk away knowing: {clean(bl['VALUE'])}")
    if films:
        lines += ["", "How you film it:", clean(films.group(1))]
    if caption:
        lines += ["", "Caption to copy:"] + caption
    return "\n".join(lines)


def main():
    doc = SRC.read_text(encoding="utf-8").split("## Quick reference")[0]
    days = re.split(r"^# DAY (\d+) — (.*)$", doc, flags=re.M)[1:]
    for n, theme, content in zip(days[0::3], days[1::3], days[2::3]):
        n, theme = int(n), clean(theme)
        posts = re.split(r"^## (\d+)\. (.*)$", content, flags=re.M)[1:]
        first = int(posts[0])
        if n == 1:
            subject = "Your first 3 posts - Double B"
            intro = ("Mike - great meeting today. Here are your first three posts, "
                     "exactly as promised.\nEach one is a format already working in the "
                     "cattle world. Film on your phone, post, done.")
        else:
            subject = f"Posts {first}-{first + 2}: {theme} - Double B"
            intro = (f"Mike - day {n} of ten. Today's three are about one thing: "
                     f"{theme.lower()}.\nSame deal as always - your phone, your yard, "
                     "no editing past a text overlay.")
        chunks = [parse_post(a, b, c) for a, b, c in
                  zip(posts[0::3], posts[1::3], posts[2::3])]
        out = (f"Subject: {subject}\n\n{intro}\n\n" + "\n\n----------\n\n".join(chunks)
               + f"\n\n----------\n\n{FOOTER}\n\n- Grady, Natty Websites\n")
        (HERE / f"day-{n:02d}.md").write_text(out, encoding="utf-8")
        print(f"day-{n:02d}.md  ({len(out)} chars)  {subject}")


if __name__ == "__main__":
    main()
