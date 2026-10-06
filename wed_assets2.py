#!/usr/bin/env python3
"""Wednesday art drop, second pass (wed_gpt2 ChatGPT extras) → game assets. Run with /usr/bin/python3 (PIL + numpy).

  wed_gpt2/<car>5.png    -> assets/cars/<car>5.webp   five-view sheets laid out 2x3 (hard R, slight R, straight, slight L, hard L), like red5
  wed_gpt2/hero_<car>.png-> assets/world/hero_<id>.webp  car-select card art, cropped to the card's 2.4:1 with the car whole
  wed_gpt2/sky_fuji.png  -> assets/world/sky.webp       360-degree band: the pano ahead over 140 degrees, gradient + treeline behind
  wed_gpt2/sky_dusk.png  -> assets/world/sky_dusk.webp  same recipe, used on Tokyo Bay
  wed_gpt2/trees.png     -> assets/world/trees.webp     billboard atlas: cherry S/M/L, two cedars, a maple
  wed_gpt2/crowd.png     -> assets/world/crowd.webp     keyed fans with flags, three staggered rows, tiles sideways
  wed_gpt2/fx.png        -> assets/world/smoke.webp (tyre-smoke puff), petal.webp (one petal for the 3D particles),
                            fx.webp (petals + confetti cells for the podium screen)
  wed_gpt2/road_kerb.png -> assets/world/kerb.webp      one red + one white block, 64 px across the kerb, 128 px along the road
  wed_gpt2/title_screen.png -> assets/world/title.webp  car-select (title) header art
Keyed pictures are cut from the green screen with key()/clean() from key_cars.py, like wed_assets.py.
"""
import os, json, sys
import numpy as np
from PIL import Image, ImageFilter
sys.argv = sys.argv[:1]
from key_cars import key, clean, bbox, components, A

REPO = os.path.dirname(os.path.abspath(__file__))
CARS = os.path.join(REPO, "assets", "cars"); WORLD = os.path.join(REPO, "assets", "world")
SRC = os.path.join(A, "wed_gpt2")
DBG = os.path.join(A, "out4"); os.makedirs(DBG, exist_ok=True)
meta = {}; sizes = {}

def load(name): return np.asarray(Image.open(os.path.join(SRC, name)).convert("RGB")).astype(np.float32)
def rgba(fg, al): return Image.fromarray(np.concatenate([np.clip(fg, 0, 255), al[..., None] * 255], -1).astype(np.uint8), "RGBA")
def save_webp(img, path, q=82, aq=90, limit_kb=245):
    img.save(path, "WEBP", quality=q, method=6, alpha_quality=aq, exact=False)
    kb = os.path.getsize(path) // 1024
    while limit_kb and kb > limit_kb and q > 40:
        q -= 6; img.save(path, "WEBP", quality=q, method=6, alpha_quality=aq, exact=False); kb = os.path.getsize(path) // 1024
    print(f"{os.path.relpath(path, REPO)}  {img.width}x{img.height}  {kb} KB  q{q}")
    assert kb <= 250, path
    sizes[os.path.relpath(path, REPO)] = os.path.getsize(path)
    return kb
def preview(img, name):
    chk = Image.new("RGBA", img.size, (110, 110, 110, 255)); px = np.asarray(chk).copy()
    yy, xx = np.mgrid[0:img.height, 0:img.width]; px[((yy // 16 + xx // 16) % 2) == 1] = (150, 150, 150, 255)
    chk = Image.fromarray(px); chk.alpha_composite(img.convert("RGBA")); chk.convert("RGB").save(os.path.join(DBG, name + "_preview.png"))
def keyed(name, keep_min=1500):
    rgb = load(name); fg, al = key(rgb); al = clean(al, keep_min); return fg, al
def blobs(al, min_area):
    lab = components(al > 0.5); ids, cnt = np.unique(lab[lab > 0], return_counts=True); out = []
    for i, c in zip(ids, cnt):
        if c < min_area: continue
        ys, xs = np.where(lab == i); out.append((int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1, int(c)))
    return out
def merge_boxes(bx, gap):
    bx = [list(b) for b in bx]; changed = True
    while changed:
        changed = False
        for i in range(len(bx)):
            for j in range(i + 1, len(bx)):
                a, b = bx[i], bx[j]
                if a[0] - gap < b[2] and b[0] - gap < a[2] and a[1] - gap < b[3] and b[1] - gap < a[3]:
                    bx[i] = [min(a[0], b[0]), min(a[1], b[1]), max(a[2], b[2]), max(a[3], b[3]), a[4] + b[4]]; del bx[j]; changed = True; break
            if changed: break
    return [tuple(b) for b in bx]

# ---------------- five-view car sheets (same recipe as wed_assets.car_sheet) ----------------
def fill_holes(fg, al):
    """transparent pockets fully enclosed by the body (rear windows that reflected the green screen) become dark tinted glass"""
    lab = components(al < 0.85); border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]])))
    ids, cnt = np.unique(lab[lab > 0], return_counts=True); n = 0
    for i, c in zip(ids, cnt):
        if i in border or c < 40: continue
        m = lab == i; lum = fg[m].mean(-1, keepdims=True); fg[m] = np.clip(lum * 0.25 + np.array([26, 30, 40]), 0, 255); al[m] = 1.0; n += 1
    return fg, al, n
def car_sheet(name, cid, nviews, width_m, cols, upscale=1.0, keep_min=1500, q=84):
    fg, al = keyed(name, keep_min); fg, al, nh = fill_holes(fg, al); print(cid, "filled holes:", nh)
    cols_on = (al > 0.5).sum(0); runs = []; on = False
    for x in range(al.shape[1]):
        if cols_on[x] and not on: on = True; s = x
        if not cols_on[x] and on: on = False; runs.append((s, x))
    if on: runs.append((s, al.shape[1]))
    runs = [r for r in runs if r[1] - r[0] > 60]
    while len(runs) < nviews:
        k = max(range(len(runs)), key=lambda i: runs[i][1] - runs[i][0]); a, b = runs[k]; w = b - a
        seg = cols_on[a + int(w * 0.3):a + int(w * 0.7)]; cut_x = a + int(w * 0.3) + int(np.argmin(seg))
        runs[k:k + 1] = [(a, cut_x), (cut_x, b)]
    runs.sort(); assert len(runs) == nviews, (cid, runs)
    views = []
    for (a, b) in runs:
        m = al.copy(); m[:, :a] = 0; m[:, b:] = 0
        lab = components(m > 0.5); ids, cnt = np.unique(lab[lab > 0], return_counts=True); m = m * (lab == ids[np.argmax(cnt)])
        x0, y0, x1, y1 = bbox(m)
        sub = m[y0:y1, x0:x1]; h = y1 - y0; xs = np.arange(x1 - x0)[None, :]
        top = sub[: max(2, h // 5)]; bot = sub[-max(2, h // 5):]
        cxt = (top * xs).sum() / max(1e-6, top.sum()); cxb = (bot * xs).sum() / max(1e-6, bot.sum())
        views.append({"m": m, "box": (x0, y0, x1, y1), "nose": cxt - cxb, "x": a})
    # the picture order is hard-left … hard-right; the sheet wants most nose-right first. Sort by the measured nose offset
    # and check it agrees with the picture order (monotonic), else fall back to the picture order reversed.
    by_nose = sorted(views, key=lambda v: -v["nose"]); by_pic = sorted(views, key=lambda v: -v["x"])
    print(cid, "nose offsets (pic order L→R):", [round(v["nose"], 1) for v in sorted(views, key=lambda v: v["x"])])
    views = by_nose if [v["x"] for v in by_nose] == [v["x"] for v in by_pic] else by_pic
    if views is by_pic: print(cid, "  (nose measure not monotonic: using picture order)")
    mid = views[nviews // 2]
    W = max(v["box"][2] - v["box"][0] for v in views) + 4; H = max(v["box"][3] - v["box"][1] for v in views) + 4
    rows = -(-nviews // cols)
    sheet = np.zeros((H * rows, W * cols, 4), np.float32)
    for k, v in enumerate(views):
        x0, y0, x1, y1 = v["box"]; cw, ch = x1 - x0, y1 - y0; ox = (W - cw) // 2; oy = H - 2 - ch
        cx, cy = (k % cols) * W, (k // cols) * H
        sheet[cy + oy:cy + oy + ch, cx + ox:cx + ox + cw, :3] = fg[y0:y1, x0:x1]; sheet[cy + oy:cy + oy + ch, cx + ox:cx + ox + cw, 3] = v["m"][y0:y1, x0:x1] * 255
    img = Image.fromarray(np.clip(sheet, 0, 255).astype(np.uint8), "RGBA")
    scale = min(upscale, 1024 / img.width, 512 / W)
    if scale != 1:
        img = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)
        if scale > 1: img = img.filter(ImageFilter.UnsharpMask(radius=1.2, percent=60, threshold=2))
    fw, fh = img.width // cols, img.height // rows
    mid_w = (mid["box"][2] - mid["box"][0]) * scale
    path = os.path.join(CARS, f"{cid}.webp"); save_webp(img, path, q, 90); preview(img, cid)
    meta[cid] = {"src": f"assets/cars/{cid}.webp", "frames": nviews, "cols": cols, "rows": rows, "fw": fw, "fh": fh, "ppm": round(mid_w / width_m, 2)}

car_sheet("silver5.png", "silver5", 5, 2.1, 2, upscale=1.2)
car_sheet("white5.png", "white5", 5, 1.95, 2, upscale=1.2)
car_sheet("rally5.png", "rally5", 5, 2.05, 2, upscale=1.2)
car_sheet("muscle5.png", "muscle5", 5, 2.1, 2, upscale=1.2)
car_sheet("kei5.png", "kei5", 5, 1.75, 2, upscale=1.2)

# ---------------- hero shots → 2.4:1 card art (the car kept whole; Fuji's cap may lose its tip) ----------------
HERO = {"arrow": ("hero_silver.png", 112), "shogun": ("hero_white.png", 100), "rally": ("hero_rally.png", 90), "kumasi": ("hero_muscle.png", 80), "kei": ("hero_kei.png", 100)}
for cid, (name, y0) in HERO.items():
    im = Image.open(os.path.join(SRC, name)).convert("RGB"); w, h = im.size; ch = round(w / 2.4); y0 = min(y0, h - ch)
    card = im.crop((0, y0, w, y0 + ch)).resize((960, 400), Image.LANCZOS)
    save_webp(card, os.path.join(WORLD, f"hero_{cid}.webp"), 74, 0, limit_kb=110)
    meta["hero_" + cid] = f"assets/world/hero_{cid}.webp"

# ---------------- sky bands: the pano ahead over SPAN degrees, per-row gradient + the pano's own treeline behind ----------------
def sky_band(name, out, hor_frac, span=140, BW=2048, q=78):
    pano = load(name); PH0, PW0 = pano.shape[:2]
    pw = round(BW * span / 360); sc = pw / PW0; ph = round(PH0 * sc)
    p = np.asarray(Image.fromarray(pano.astype(np.uint8)).resize((pw, ph), Image.LANCZOS)).astype(np.float32)
    HOR = int(round(hor_frac * ph))
    # side fill: the pano's per-row mean (sky gradient, haze at the horizon), with the pano's own bottom treeline mirrored along
    rowmean = p.mean(axis=1, keepdims=True); FW = BW - pw
    # fill for the back: the pano mirrored at its right edge and blurred sideways (soft hills, no features), the sun glow capped
    wide = np.concatenate([p, p[:, ::-1], p, p[:, ::-1]], axis=1)                # a whole pano of padding before the part we keep (no edge darkening)
    k = 71; ker = np.exp(-0.5 * (np.arange(k) - k // 2) ** 2 / (k / 5) ** 2); ker /= ker.sum()
    blur = np.stack([np.apply_along_axis(lambda r: np.convolve(r, ker, "same"), 1, wide[..., c]) for c in range(3)], -1)
    blur = np.clip(blur, rowmean * 0.9 - 6, rowmean * 1.18 + 8)                  # no second sun glow, no ghost mountain behind the player
    fill = blur[:, pw:pw + FW].copy()
    tl0 = int(ph * 0.84); tree = p[tl0:]                                      # bottom rows = distant treeline only (per the prompt)
    tile = np.concatenate([tree, tree[:, ::-1]], axis=1)
    reps = -(-FW // tile.shape[1]); strip = np.concatenate([tile] * reps, axis=1)[:, :FW]
    fill[tl0:] = strip
    for kk in range(22):                                                       # soften the treeline's top edge into the haze
        t = kk / 22.0; r = tl0 + kk
        if r < ph: fill[r] = fill[r] * t + rowmean[r][None] * (1 - t)
    band = np.concatenate([p, fill], axis=1)                                   # pano, then the fill; the band wraps fill-end → pano-start
    FE = 190
    for kk in range(FE):                                                       # cross-fade both junctions (pano right edge → fill, fill end → pano left edge)
        t = 0.5 - 0.5 * np.cos(np.pi * kk / FE)
        band[:, pw - 1 - kk] = fill[:, kk] * (1 - t) + p[:, pw - 1 - kk] * t
        band[:, kk] = fill[:, FW - 1 - kk] * (1 - t) + p[:, kk] * t
    band = np.roll(band, (BW - pw) // 2, axis=1)                               # Fuji's pano in the middle of the band
    alpha = np.ones((ph, BW), np.float32); yy = np.arange(ph)[:, None].astype(np.float32)
    alpha *= np.clip(yy / 50.0, 0, 1); alpha *= np.clip((ph - 1 - yy) / 40.0, 0, 1)
    img = rgba(band, alpha).transpose(Image.FLIP_LEFT_RIGHT)                   # seen from inside the cylinder
    save_webp(img, os.path.join(WORLD, out + ".webp"), q, 70, limit_kb=245); preview(img, out)
    topc = p[:3].reshape(-1, 3).mean(0); horc = p[HOR - 40:HOR - 25].reshape(-1, 3).mean(0) * 1.06
    mpp = round(1500 * (np.pi / 180) / (BW / 360), 2)                          # metres per texel on the r=1500 cylinder (square texels)
    rec = {"src": f"assets/world/{out}.webp", "w": BW, "h": ph, "hor": round(HOR / ph, 4), "mpp": mpp, "r": 1500, "horY": 55,
           "top": "#%02x%02x%02x" % tuple(int(v) for v in topc), "haze": "#%02x%02x%02x" % tuple(int(min(255, v)) for v in horc)}
    print(out, rec); meta[out] = rec
sky_band("sky_fuji.png", "sky", 0.655)
sky_band("sky_dusk.png", "sky_dusk", 0.555)

# ---------------- trees atlas (already transparent PNG): cherry S/M/L on the top row, cedar A/B + maple below ----------------
tr = np.asarray(Image.open(os.path.join(SRC, "trees.png")).convert("RGBA")).astype(np.float32)
tal = tr[..., 3] / 255; cols_on = (tal > 0.5).sum(0).astype(np.float32); runs = []; on = False
for x in range(tal.shape[1]):
    if cols_on[x] > 0 and not on: on = True; s0 = x
    if cols_on[x] == 0 and on: on = False; runs.append((s0, x))
if on: runs.append((s0, tal.shape[1]))
runs = [r for r in runs if r[1] - r[0] > 40]
def split_run(a, b, k):
    """split columns a..b into k pieces at the k-1 deepest, well separated valleys of the alpha column count"""
    seg = np.convolve(cols_on[a:b], np.ones(9) / 9, "same"); mx = seg.max(); cands = []
    for x in range(30, len(seg) - 30):
        if seg[x] <= seg[x - 30:x + 31].min() and seg[x] < mx * 0.45: cands.append((seg[x], x))
    cands.sort(); picks = []
    for v, x in cands:
        if all(abs(x - p) > 120 for p in picks): picks.append(x)
        if len(picks) == k - 1: break
    picks.sort(); cuts = [a] + [a + p for p in picks] + [b]; return [(cuts[i], cuts[i + 1]) for i in range(len(cuts) - 1)]
while len(runs) < 6:
    k = max(range(len(runs)), key=lambda i: runs[i][1] - runs[i][0]); a, b = runs[k]
    runs[k:k + 1] = split_run(a, b, 6 - len(runs) + 1)
runs.sort(); print("tree runs", runs); assert len(runs) == 6, runs
tb = []
for (a, b) in runs:
    m = tal.copy(); m[:, :a] = 0; m[:, b:] = 0; x0, y0, x1, y1 = bbox(m); tb.append((x0, y0, x1, y1))
names = ["cherryS", "cherryM", "cherryL", "cedarA", "cedarB", "maple"]; hm = {"cherryS": 7.0, "cherryM": 9.5, "cherryL": 12.0, "cedarA": 17.0, "cedarB": 16.0, "maple": 8.5}
cells = {}
for n, b in zip(names, tb):
    sub = tr[b[1]:b[3], b[0]:b[2]].copy(); cells[n] = Image.fromarray(sub.astype(np.uint8), "RGBA")
rows_def = [["cherryS", "cherryM", "cherryL"], ["cedarA", "cedarB", "maple"]]
PAD = 4; SC = min(0.7, (1024 - PAD * 4) / max(sum(cells[n].width for n in r) for r in rows_def))
for n in names:
    im = cells[n]
    if SC < 1: im = im.resize((max(1, round(im.width * SC)), max(1, round(im.height * SC))), Image.LANCZOS)
    cells[n] = im
AW = max(sum(cells[n].width for n in r) + PAD * (len(r) + 1) for r in rows_def); row_h = [max(cells[n].height for n in r) + PAD for r in rows_def]
atlas = Image.new("RGBA", (AW, sum(row_h) + PAD), (0, 0, 0, 0)); acells = {}; y = PAD
for r, rh in zip(rows_def, row_h):
    x = PAD
    for n in r:
        im = cells[n]; yy = y + rh - PAD - im.height; atlas.paste(im, (x, yy)); acells[n] = {"x": x, "y": yy, "w": im.width, "h": im.height, "m": hm[n]}; x += im.width + PAD
    y += rh
save_webp(atlas, os.path.join(WORLD, "trees.webp"), 78, 60, limit_kb=200); preview(atlas, "trees")
meta["trees"] = {"src": "assets/world/trees.webp", "w": atlas.width, "h": atlas.height, "cells": acells}

# ---------------- crowd: keyed fans with flags; three staggered rows, seamless sideways ----------------
cfg, cal = keyed("crowd.png", 400)
x0, y0, x1, y1 = bbox(cal); cfg, cal = cfg[y0:y1, x0:x1], cal[y0:y1, x0:x1]
OV = 220                                                                       # cross-fade the ends so the strip tiles sideways
w = cfg.shape[1]; t = (np.arange(OV) / OV)[None, :, None]
fg2 = cfg[:, :w - OV].copy(); al2 = cal[:, :w - OV].copy()
fg2[:, -OV:] = cfg[:, w - 2 * OV:w - OV] * (1 - t) + cfg[:, :OV] * t; al2[:, -OV:] = cal[:, w - 2 * OV:w - OV] * (1 - t[..., 0]) + cal[:, :OV] * t[..., 0]
row = rgba(fg2, al2); CW = 1024; row = row.resize((CW, round(row.height * CW / row.width)), Image.LANCZOS); RH = row.height
STEP = int(RH * 0.5); ROWS = 4; canvas = Image.new("RGBA", (CW, RH + (ROWS - 1) * STEP), (0, 0, 0, 0))
for k in range(ROWS):                                                          # back row first, each rolled sideways so faces never line up
    dy, shift = k * STEP, ((k * 3 + 1) * CW // 7) % CW
    arr = np.roll(np.asarray(row), shift, axis=1); layer = Image.fromarray(arr, "RGBA")
    if k < ROWS - 1:                                                           # rows behind: a touch darker
        a = np.asarray(layer).astype(np.float32); a[..., :3] *= 0.82 + 0.06 * k; layer = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), "RGBA")
    canvas.alpha_composite(layer, (0, dy))
save_webp(canvas, os.path.join(WORLD, "crowd.webp"), 74, 70, limit_kb=240); preview(canvas, "crowd")
meta["crowd"] = {"src": "assets/world/crowd.webp", "w": canvas.width, "h": canvas.height, "mPerU": 12}   # 12 m per repeat: the tile is about as tall as the bank

# ---------------- fx: smoke puff, one petal, podium atlas (petals + confetti) ----------------
ffg, fal = keyed("fx.png", 60)
fb = merge_boxes(blobs(fal, 200), 40); fb.sort(key=lambda t: (t[1] // (fal.shape[0] // 2), t[0])); print("fx blobs", fb)
H2 = fal.shape[0] // 2
top = sorted([b for b in fb if b[1] < H2 and b[4] > 5000], key=lambda b: b[0]); bot = sorted([b for b in fb if b[1] >= H2 and b[4] > 5000], key=lambda b: b[0])
assert len(top) == 3 and len(bot) == 3, (top, bot)
puff = top[0]                                                                  # top row: puff, trail, flame; bottom: sparks, petals, confetti
px0, py0, px1, py1 = puff[:4]; pf, pa = ffg[py0:py1, px0:px1], fal[py0:py1, px0:px1]
S = max(px1 - px0, py1 - py0) + 24; sq = np.zeros((S, S, 4), np.float32); ox, oy = (S - (px1 - px0)) // 2, (S - (py1 - py0)) // 2
sq[oy:oy + py1 - py0, ox:ox + px1 - px0, :3] = pf; sq[oy:oy + py1 - py0, ox:ox + px1 - px0, 3] = pa * 255
# the puff's own shading stays in rgb; its alpha is softened so the point sprite never shows a hard rim
smoke = Image.fromarray(np.clip(sq, 0, 255).astype(np.uint8), "RGBA").resize((256, 256), Image.LANCZOS)
sm = np.asarray(smoke).astype(np.float32); yy, xx = np.mgrid[0:256, 0:256]; rr = np.hypot(xx - 128, yy - 128) / 128
grey = np.minimum(sm[..., 1], np.maximum(sm[..., 0], sm[..., 2])) * 0.5 + np.minimum(sm[..., 0], sm[..., 2]) * 0.5   # the key's magenta/green rims become neutral
sm[..., 0] = sm[..., 1] = sm[..., 2] = np.clip(grey * 1.05, 0, 255)
sm[..., 3] *= np.clip((1.0 - rr) / 0.25, 0, 1); smoke = Image.fromarray(np.clip(sm, 0, 255).astype(np.uint8), "RGBA").filter(ImageFilter.GaussianBlur(1.0))
save_webp(smoke, os.path.join(WORLD, "smoke.webp"), 80, 80, limit_kb=60); preview(smoke, "smoke")
meta["smoke"] = {"src": "assets/world/smoke.webp", "w": 256, "h": 256}
# petals and confetti: individual pieces inside the two bottom-row groups
petal_box = bot[1]; conf_box = bot[2]
def pieces(box, min_area, max_n):
    bx0, by0, bx1, by1 = box[:4]; sub = fal[by0:by1, bx0:bx1]; pb = blobs(sub, min_area)
    pb = sorted(pb, key=lambda b: -b[4])[:max_n]
    return [(bx0 + b[0], by0 + b[1], bx0 + b[2], by0 + b[3]) for b in pb]
pet = pieces(petal_box, 500, 4); con = pieces(conf_box, 120, 10); print("petals", pet, "confetti", con)
def cut(box):
    bx0, by0, bx1, by1 = box; return rgba(ffg[by0:by1, bx0:bx1], fal[by0:by1, bx0:bx1])
# one petal → square 64 px sprite for the 3D points
p0 = cut(pet[0]); S = max(p0.size) + 8; one = Image.new("RGBA", (S, S), (0, 0, 0, 0)); one.alpha_composite(p0, ((S - p0.width) // 2, (S - p0.height) // 2))
one = one.resize((64, 64), Image.LANCZOS); save_webp(one, os.path.join(WORLD, "petal.webp"), 84, 90, limit_kb=20); preview(one, "petal")
meta["petal"] = {"src": "assets/world/petal.webp", "w": 64, "h": 64}
# podium atlas: petals and confetti pieces on one row, each fitted into a 48 px box
items = [("p%d" % i, cut(b)) for i, b in enumerate(pet)] + [("c%d" % i, cut(b)) for i, b in enumerate(con)]
BOX = 48; fxa = Image.new("RGBA", (BOX * len(items), BOX), (0, 0, 0, 0)); fcells = {}
for i, (n, im) in enumerate(items):
    s = min((BOX - 4) / im.width, (BOX - 4) / im.height); im = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)
    fxa.alpha_composite(im, (i * BOX + (BOX - im.width) // 2, (BOX - im.height) // 2)); fcells[n] = {"x": i * BOX, "y": 0, "w": BOX, "h": BOX}
save_webp(fxa, os.path.join(WORLD, "fx.webp"), 84, 90, limit_kb=40); preview(fxa, "fx")
meta["fx"] = {"src": "assets/world/fx.webp", "w": fxa.width, "h": fxa.height, "box": BOX, "petals": len(pet), "confetti": len(con)}

# ---------------- kerb tile: the kerb strip down the left edge of the road texture, one red + one white block ----------------
rk = load("road_kerb.png"); RH0, RW0 = rk.shape[:2]
redc = ((rk[..., 0] > 140) & (rk[..., 1] < 110) & (rk[..., 2] < 110))
colfrac = redc.mean(0); kx1 = int(np.flatnonzero(colfrac > 0.2).max()) + 1          # last column with red blocks
whitec = (rk[..., :3].min(-1) > 170).mean(0); lx = np.flatnonzero(whitec[kx1:kx1 + 80] > 0.6)   # the white track-limit line after the kerb
kerb_x1 = kx1 + 1
rows_red = redc[:, :kx1].mean(1) > 0.3; edges = np.flatnonzero(np.diff(rows_red.astype(int)) != 0); print("kerb edges", edges[:10], "kerb x1", kerb_x1)
period = int(np.median(np.diff(edges)) * 2); y0 = int(edges[0]) + 1
tile = rk[y0:y0 + period, :kerb_x1][:, ::-1]                                       # inner (road) side first: u=0 is the road edge in the game
tile_img = Image.fromarray(tile.astype(np.uint8)).resize((64, 128), Image.LANCZOS)
save_webp(tile_img, os.path.join(WORLD, "kerb.webp"), 86, 0, limit_kb=30); tile_img.resize((256, 512)).save(os.path.join(DBG, "kerb_preview.png"))
meta["kerb"] = {"src": "assets/world/kerb.webp", "w": 64, "h": 128}

# ---------------- title art ----------------
ti = Image.open(os.path.join(SRC, "title_screen.png")).convert("RGB").resize((1024, 576), Image.LANCZOS)
save_webp(ti, os.path.join(WORLD, "title.webp"), 72, 0, limit_kb=150)
meta["title"] = "assets/world/title.webp"

json.dump(meta, open(os.path.join(DBG, "wed2_meta.json"), "w"), indent=1)
print(json.dumps(meta))
print("TOTAL new images: %.2f MB" % (sum(sizes.values()) / 1048576))
