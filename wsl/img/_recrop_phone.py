"""Build the WSL phone hero from the outpainted frame, with the house actually centred.

The problem: in every ORIGINAL source the house runs flush to the right edge, so it could
not be centred by panning -- there was no image on that side. Trimming the dead left only
got it to 53%.

The fix: one outpaint pass (5:4, 2 credits) grew the canvas on both sides. It added trees,
lawn and hillside only -- it did NOT invent any building, which was the risk. Now there is
real ground to the right of the house, so a centred crop exists.

Crop width is capped by how much canvas sits right of the house's centre: that is what
limits how wide the frame can be while still keeping the house at 50%.
"""
from PIL import Image
from pathlib import Path

HERE = Path(__file__).parent
RAW = HERE / "_outpaint-raw.png"
OUT = HERE / "hero-phone.jpg"

# House bounds read off the outpainted frame (2304x1856).
HOUSE_L, HOUSE_R = 805, 2185
TARGET_W = 1000                      # final served width; height follows the crop's aspect

im = Image.open(RAW).convert("RGB")
W, H = im.size
cx = (HOUSE_L + HOUSE_R) // 2

# widest centred crop that still fits inside the canvas on both sides
half = min(cx, W - cx)
left, right = cx - half, cx + half
crop = im.crop((left, 0, right, H))

cw, ch = crop.size
out = crop.resize((TARGET_W, round(TARGET_W * ch / cw)), Image.LANCZOS)
out.save(OUT, quality=90, subsampling=0, optimize=True)

hl = (HOUSE_L - left) / cw
hr = (HOUSE_R - left) / cw
print(f"outpainted {W}x{H} -> crop {cw}x{ch} -> served {out.size[0]}x{out.size[1]}")
print(f"aspect {out.size[0]/out.size[1]:.4f}  (CSS aspect-ratio must match)")
print(f"house spans {hl*100:.0f}%..{hr*100:.0f}%, centre {(hl+hr)/2*100:.1f}%")
print(f"margins  left {hl*100:.0f}%   right {(1-hr)*100:.0f}%")
