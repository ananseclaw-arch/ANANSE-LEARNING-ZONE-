#!/usr/bin/env python3
"""Turn the Gemini world pictures into game assets (run with /usr/bin/python3: needs PIL + numpy).

  white.png      -> assets/cars/white.webp     3-frame sheet (nose-right / straight / nose-left) for the Shogun GT
  fuji.png       -> assets/world/sky.webp      360-degree band: the Fuji panel ahead, the hazy hills strip behind
  props.png      -> assets/world/props.webp    billboard atlas (cherry, cedar, torii, lantern, banner) + props.json
                 -> assets/world/rail.webp     one tileable guard-rail bay (post + beam)
  road.png       -> assets/world/road.webp     asphalt with edge lines and dashed centre line (tileable)
  speedo.png     -> assets/world/speedo.webp   dial face, GEAR text painted out
  logo.png       -> assets/world/logo.webp     title logo with alpha
  picker_red.png -> assets/world/hero.webp     car-select hero shot
Keying reuses key()/clean() from key_cars.py (green dominance, edge unmixing, despill, speck removal).
"""
import os, json, sys
import numpy as np
from PIL import Image
sys.argv = sys.argv[:1]            # key_cars reads argv[1] as its output folder
from key_cars import key, clean, bbox, A

REPO = os.path.dirname(os.path.abspath(__file__))
WORLD = os.path.join(REPO, "assets", "world"); CARS = os.path.join(REPO, "assets", "cars")
os.makedirs(WORLD, exist_ok=True); os.makedirs(CARS, exist_ok=True)
DBG = os.path.join(A, "out2"); os.makedirs(DBG, exist_ok=True)

def load(name):
    return np.asarray(Image.open(os.path.join(A, name)).convert("RGB")).astype(np.float32)

def rgba(fg, alpha):
    return Image.fromarray(np.concatenate([np.clip(fg, 0, 255), alpha[..., None] * 255], -1).astype(np.uint8), "RGBA")

def save_webp(img, path, q=82, aq=90, limit_kb=None):
    img.save(path, "WEBP", quality=q, method=6, alpha_quality=aq, exact=False)
    kb = os.path.getsize(path) // 1024
    while limit_kb and kb > limit_kb and q > 50:
        q -= 6; img.save(path, "WEBP", quality=q, method=6, alpha_quality=aq, exact=False); kb = os.path.getsize(path) // 1024
    print(f"{os.path.relpath(path, REPO)}  {img.width}x{img.height}  {kb} KB  q{q}")
    return kb

def preview(img, name):
    chk = Image.new("RGBA", img.size, (110, 110, 110, 255)); px = np.asarray(chk).copy()
    yy, xx = np.mgrid[0:img.height, 0:img.width]; px[((yy // 16 + xx // 16) % 2) == 1] = (150, 150, 150, 255)
    chk = Image.fromarray(px); chk.alpha_composite(img.convert("RGBA")); chk.convert("RGB").save(os.path.join(DBG, name + "_preview.png"))

meta = {}

# ---------------- white GT car: three views, one shared ground line ----------------
rgb = load("white.png"); fg, al = key(rgb); al = clean(al)
cols = (al > 0.5).sum(0); runs = []; on = False
for x in range(al.shape[1]):
    if cols[x] and not on: on = True; s = x
    if not cols[x] and on: on = False; runs.append((s, x))
if on: runs.append((s, al.shape[1]))
runs = [r for r in runs if r[1] - r[0] > 60][:3]
assert len(runs) == 3, runs
views = []
for (a, b) in runs:
    m = al.copy(); m[:, :a] = 0; m[:, b:] = 0; views.append((m, bbox(m)))
W = max(bx[2] - bx[0] for _, bx in views) + 4; base = max(bx[3] for _, bx in views); top = min(bx[1] for _, bx in views); H = base - top + 4
sheet = np.zeros((H, W * 3, 4), np.float32)
for vi, (m, (x0, y0, x1, y1)) in enumerate(views):
    cw, chh = x1 - x0, y1 - y0; ox = (W - cw) // 2; oy = H - 2 - chh
    sheet[oy:oy + chh, vi * W + ox:vi * W + ox + cw, :3] = fg[y0:y1, x0:x1]; sheet[oy:oy + chh, vi * W + ox:vi * W + ox + cw, 3] = m[y0:y1, x0:x1] * 255
img = Image.fromarray(np.clip(sheet, 0, 255).astype(np.uint8), "RGBA")
scale = min(1.0, 560 / W)
if scale < 1: img = img.resize((int(img.width * scale), int(img.height * scale)), Image.LANCZOS)
fw, fh = img.width // 3, img.height
mid_w = (views[1][1][2] - views[1][1][0]) * scale
save_webp(img, os.path.join(CARS, "white.webp"), 84); preview(img, "white")
meta["shogun"] = {"src": "assets/cars/white.webp", "frames": 3, "fw": fw, "fh": fh, "ppm": round(mid_w / 2.0, 2)}   # the GT is 2.0 m wide with mirrors

# ---------------- sky band: Fuji panel ahead, hazy hills strip behind ----------------
f = load("fuji.png")
rm = f.mean(axis=(1, 2)); div = int(np.argmax(rm[300:360] > 200)) + 300          # thin white divider row
pano = f[:div - 1]                                                               # top panel only
strip = f[div + 4:]                                                              # hills strip under the divider
PH, PW = pano.shape[:2]; HOR = 190                                               # pano horizon row (lake shore / city base)
st = Image.fromarray(strip.astype(np.uint8)).resize((PW * 2, strip.shape[0] * 2), Image.LANCZOS); st = np.asarray(st).astype(np.float32)
SH = 66                                                                          # strip horizon row after the 2x upscale
band = np.zeros((PH, PW * 3, 3), np.float32)
# sky fill for the sides: the pano's own sky, averaged per row (keeps the golden gradient, drops the clouds)
sky = pano[:, :, :].mean(axis=1, keepdims=True)
sides = np.repeat(sky, PW * 2, axis=1).copy()
y0 = HOR - SH; y1 = min(PH, y0 + st.shape[0]); sides[y0:y1] = st[:y1 - y0]
# soften the join between the sky fill and the strip's own sky
for k in range(28):
    t = k / 28.0; r = y0 + k; sides[r] = sides[r] * t + np.repeat(sky[r], PW * 2, axis=0)[None] * (1 - t)
band[:, :PW] = sides[:, PW:]; band[:, PW:2 * PW] = pano; band[:, 2 * PW:] = sides[:, :PW]
# cross-fade the pano's edges with a mirrored continuation of the strip (the wrap seam is already continuous:
# the strip's left half ends where its right half starts)
FE = 120
def blend(a, b, t): return a * (1 - t) + b * t
for k in range(FE):
    t = 0.5 - 0.5 * np.cos(np.pi * k / FE)
    band[:, PW + k] = blend(sides[:, 2 * PW - 1 - k], pano[:, k], t)
    band[:, 2 * PW - 1 - k] = blend(sides[:, k], pano[:, PW - 1 - k], t)
alpha = np.ones((PH, PW * 3), np.float32)
yy = np.arange(PH)[:, None].astype(np.float32)
alpha *= np.clip((yy - 0) / 60.0, 0, 1)                       # top fades into the sky dome
alpha *= np.clip((PH - 1 - yy) / 50.0, 0, 1)                   # bottom dissolves into the fogged ground
band_img = rgba(band, alpha).transpose(Image.FLIP_LEFT_RIGHT)   # seen from inside a cylinder, so mirrored
save_webp(band_img, os.path.join(WORLD, "sky.webp"), 80, 70, limit_kb=390); preview(band_img, "sky")
topc = pano[:3].reshape(-1, 3).mean(0); horc = pano[HOR - 40:HOR - 25].reshape(-1, 3).mean(0) * 1.06
meta["sky"] = {"src": "assets/world/sky.webp", "w": band_img.width, "h": band_img.height, "hor": HOR / PH,
               "top": "#%02x%02x%02x" % tuple(int(v) for v in topc), "haze": "#%02x%02x%02x" % tuple(int(v) for v in horc)}

# ---------------- props atlas ----------------
p = load("props.png"); pfg, pal = key(p); pal = clean(pal, 400)
H0, W0 = pal.shape; yy, xx = np.mgrid[0:H0, 0:W0]
cuts = {"cherry": (xx >= 20) & (xx < 263), "cedar": (xx >= 263) & (xx < 376), "torii": (xx >= 376) & (xx < 600), "lantern": (xx >= 600) & (xx < 712),
        "banner": (xx >= 712) & (xx < 806) & ((yy < 378) | (xx < 768)), "rail": (xx >= 768) & ((yy >= 378) & (xx >= 768)) & ~((xx < 806) & (yy < 378))}
cuts["rail"] = (xx >= 775) & (yy >= 376)
cells = {}
for name, cut in cuts.items():
    m = pal * cut; x0, y0, x1, y1 = bbox(m); cells[name] = (pfg[y0:y1, x0:x1], m[y0:y1, x0:x1], (x0, y0, x1, y1))
    print(name, "bbox", (x0, y0, x1, y1), "size", x1 - x0, y1 - y0)
order = ["cherry", "cedar", "torii", "lantern", "banner"]
PAD = 4; AW = sum(cells[n][0].shape[1] + PAD for n in order) + PAD; AH = max(cells[n][0].shape[0] for n in order) + PAD * 2
atlas = np.zeros((AH, AW, 4), np.float32); x = PAD; props = {}
heights = {"cherry": 9.5, "cedar": 17.0, "torii": 7.5, "lantern": 2.3, "banner": 4.6}   # world height in metres
for n in order:
    cfg, cal, _ = cells[n]; h, w = cal.shape; y = AH - PAD - h                               # bottoms on one line
    atlas[y:y + h, x:x + w, :3] = cfg; atlas[y:y + h, x:x + w, 3] = cal * 255
    props[n] = {"x": x, "y": y, "w": w, "h": h, "m": heights[n]}; x += w + PAD
atlas_img = Image.fromarray(np.clip(atlas, 0, 255).astype(np.uint8), "RGBA")
save_webp(atlas_img, os.path.join(WORLD, "props.webp"), 84, 92); preview(atlas_img, "props")
meta["props"] = {"src": "assets/world/props.webp", "w": AW, "h": AH, "cells": props}
# guard rail: one bay from post centre to post centre so it tiles along the road
rfg, ral, (rx0, ry0, rx1, ry1) = cells["rail"]
colsum = (ral > 0.5).sum(0); posts = [i for i in range(1, len(colsum) - 1) if colsum[i] > colsum.max() * 0.85]
pa, pb = posts[0], posts[-1]
while pb - 1 in posts: pb -= 1
while pa + 1 in posts: pa += 1
tile_fg, tile_al = rfg[:, pa:pb], ral[:, pa:pb]
rail_img = rgba(tile_fg, tile_al).resize((128, 64), Image.LANCZOS)   # power of two so it can repeat on WebGL1
save_webp(rail_img, os.path.join(WORLD, "rail.webp"), 86, 95); preview(rail_img, "rail")
meta["rail"] = {"src": "assets/world/rail.webp", "w": rail_img.width, "h": rail_img.height, "len": 2.4, "hgt": round(2.4 * rail_img.height / rail_img.width, 3)}

# ---------------- road ----------------
road = Image.open(os.path.join(A, "road.png")).convert("RGB")
save_webp(road, os.path.join(WORLD, "road.webp"), 80, limit_kb=390)

# ---------------- speedometer face ----------------
s = load("speedo.png"); sfg, sal = key(s); sal = clean(sal, 2000)
x0, y0, x1, y1 = bbox(sal); cx, cy = (x0 + x1) / 2, (y0 + y1) / 2; r = max(x1 - x0, y1 - y0) / 2 + 2
# paint out the baked "GEAR 4" (bottom centre) with the surrounding dial colour
gy0, gy1, gx0, gx1 = int(cy + r * 0.72), int(cy + r * 0.86), int(cx - r * 0.2), int(cx + r * 0.2)
ring = np.concatenate([sfg[gy0 - 6:gy0, gx0:gx1].reshape(-1, 3), sfg[gy1:gy1 + 6, gx0:gx1].reshape(-1, 3)])
fill = np.median(ring, axis=0)
ys, xs = np.mgrid[gy0:gy1, gx0:gx1]; ell = (((xs - cx) / (r * 0.2)) ** 2 + ((ys - (gy0 + gy1) / 2) / (r * 0.07)) ** 2) <= 1
sub = sfg[gy0:gy1, gx0:gx1]; sub[ell] = fill
sp_img = rgba(sfg, sal).crop((int(cx - r), int(cy - r), int(cx + r), int(cy + r))).resize((440, 440), Image.LANCZOS)
save_webp(sp_img, os.path.join(WORLD, "speedo.webp"), 84, 92); preview(sp_img, "speedo")
# where the numbers sit: 0 at the lower left, 200 at the lower right (measured on the picture)
meta["speedo"] = {"src": "assets/world/speedo.webp", "a0": 136, "a1": 406, "max": 200}

# ---------------- logo ----------------
l = load("logo.png"); lfg, lal = key(l); lal = clean(lal, 300)
x0, y0, x1, y1 = bbox(lal); lg = rgba(lfg, lal).crop((x0 - 6, y0 - 6, x1 + 6, y1 + 6))
save_webp(lg, os.path.join(WORLD, "logo.webp"), 86, 95); preview(lg, "logo")

# ---------------- hero ----------------
hero = Image.open(os.path.join(A, "picker_red.png")).convert("RGB")
save_webp(hero, os.path.join(WORLD, "hero.webp"), 78, limit_kb=260)

json.dump(meta, open(os.path.join(DBG, "world_meta.json"), "w"), indent=1)
print(json.dumps(meta))
