"""Crop the Haas landscape heroes to the standard hero ratio, from the BOTTOM up.

The standard is WSL's desktop hero: 2560x985 = 2.5990. Grady picked that height as the
one every hero should use, whatever the trade. Haas was 2100x932 = 2.2532 — taller, so it
pushed the first band further down the page.

Crop from the BOTTOM only. The top of the frame is sky and roofline; the bottom is pool
water and paving, which is the least load-bearing part of the picture. Cropping the top
would take the chimney and the truss gable, which is the thing being sold.

Originals are kept as *-tall.* so this is reversible.
"""
from PIL import Image
from pathlib import Path

HERE = Path(__file__).parent
TARGET_AR = 2560 / 985           # WSL desktop hero — the house ratio

for name in ["hero-wide.webp", "hero-mid.webp"]:
    src = HERE / name
    im = Image.open(src)
    w, h = im.size
    new_h = round(w / TARGET_AR)
    assert new_h < h, f"{name}: already at or below target ({h} -> {new_h})"

    backup = HERE / (src.stem + "-tall" + src.suffix)
    if not backup.exists():
        im.save(backup, quality=95)

    im.crop((0, 0, w, new_h)).save(src, quality=92)
    print(f"{name:18} {w}x{h} (ar {w/h:.4f}) -> {w}x{new_h} (ar {w/new_h:.4f})  "
          f"cut {h-new_h}px off the bottom")

# The hero overlays are positioned in PERCENT of the media box. Shortening the box without
# rescaling them slides the house cut-out and the fly hotspot off the actual house.
print("\npercent boxes must be rescaled by oldH/newH:")
for name, old_h in [("hero-wide.webp", 932), ("hero-mid.webp", 932)]:
    w = Image.open(HERE / name).size[0]
    new_h = round(w / TARGET_AR)
    k = old_h / new_h
    print(f"  {name}: factor {k:.5f}")
    for label, top, height in [("hero__pop", 3.22, 75.64), ("hero__fly", 6.0, 82.0)]:
        print(f"    {label:10} top {top}% -> {top*k:.2f}%   height {height}% -> {height*k:.2f}%")
    break
