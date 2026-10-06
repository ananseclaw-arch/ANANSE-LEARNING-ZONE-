#!/usr/bin/env python3
"""Wednesday art drop → game assets (run with /usr/bin/python3: needs PIL + numpy + ffmpeg).

Picks follow lz-fable-assets/CHOICES.md:
  wed_gpt/rally|muscle|kei.png  -> assets/cars/<id>.webp     3-view sheets laid out 2x2 (nose-right, straight, nose-left)
  wed/red5.png                  -> assets/cars/red5.webp     5-view sheet laid out 2x3 (hard R, slight R, straight, slight L, hard L)
  assets/cars/red.webp          -> assets/world/flame.webp   exhaust flame sprite (frame 3 minus frame 0 of the old red sheet)
  wed_gpt/gantry.png            -> assets/world/gantry.webp  + light centres and LED screen rectangle
  wed_gpt/pits.png              -> assets/world/pits.webp
  wed_gpt/grandstand.png        -> assets/world/stand.webp   + a tileable crowd strip (assets/world/crowd.webp)
  wed/boards.png + wed_gpt/boards.png -> assets/world/boards.webp atlas (ad boards, 100/200/300 plates, tyre wall) + assets/world/kerb.webp tile
  wed_gpt/podium.png            -> assets/world/podium.webp  + step-top positions
  videos/*.mp4                  -> assets/video/{win,podium,flyover}.mp4 (960x540 H.264 CRF 30, no audio) + flyover poster + card backdrop
Every keyed picture is cut from the green screen with key()/clean() from key_cars.py.
"""
import os, json, sys, subprocess
import numpy as np
from PIL import Image, ImageFilter
sys.argv = sys.argv[:1]
from key_cars import key, clean, bbox, components, A

REPO = os.path.dirname(os.path.abspath(__file__))
CARS = os.path.join(REPO, "assets", "cars"); WORLD = os.path.join(REPO, "assets", "world"); VID = os.path.join(REPO, "assets", "video")
for d in (CARS, WORLD, VID): os.makedirs(d, exist_ok=True)
DBG = os.path.join(A, "out3"); os.makedirs(DBG, exist_ok=True)
meta = {}

def load(rel): return np.asarray(Image.open(os.path.join(A, rel)).convert("RGB")).astype(np.float32)
def rgba(fg, al): return Image.fromarray(np.concatenate([np.clip(fg, 0, 255), al[..., None] * 255], -1).astype(np.uint8), "RGBA")
def save_webp(img, path, q=82, aq=90, limit_kb=245):
    img.save(path, "WEBP", quality=q, method=6, alpha_quality=aq, exact=False)
    kb = os.path.getsize(path) // 1024
    while limit_kb and kb > limit_kb and q > 40:
        q -= 6; img.save(path, "WEBP", quality=q, method=6, alpha_quality=aq, exact=False); kb = os.path.getsize(path) // 1024
    print(f"{os.path.relpath(path, REPO)}  {img.width}x{img.height}  {kb} KB  q{q}")
    assert kb <= 250, path
    return kb
def preview(img, name):
    chk = Image.new("RGBA", img.size, (110, 110, 110, 255)); px = np.asarray(chk).copy()
    yy, xx = np.mgrid[0:img.height, 0:img.width]; px[((yy // 16 + xx // 16) % 2) == 1] = (150, 150, 150, 255)
    chk = Image.fromarray(px); chk.alpha_composite(img.convert("RGBA")); chk.convert("RGB").save(os.path.join(DBG, name + "_preview.png"))
def keyed(rel, keep_min=1500):
    rgb = load(rel); fg, al = key(rgb); al = clean(al, keep_min); return fg, al
def fit_width(img, maxw):
    if img.width <= maxw: return img
    return img.resize((maxw, round(img.height * maxw / img.width)), Image.LANCZOS)
def blobs(al, min_area):
    """connected components of the keyed mask → list of (x0,y0,x1,y1,area) sorted left-to-right, top-to-bottom"""
    lab = components(al > 0.5); ids, cnt = np.unique(lab[lab > 0], return_counts=True); out = []
    for i, c in zip(ids, cnt):
        if c < min_area: continue
        ys, xs = np.where(lab == i); out.append((int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1, int(c)))
    return out
def merge_boxes(bx, gap):
    """merge boxes that overlap or sit within `gap` px of each other (a sign and its post, tyres in a stack)"""
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

# ---------------- cars ----------------
def car_sheet(rel, cid, nviews, width_m, cols, upscale=1.0, keep_min=1500):
    fg, al = keyed(rel, keep_min)
    # one column-run per car (the cars never touch in these pictures)
    cols_on = (al > 0.5).sum(0); runs = []; on = False
    for x in range(al.shape[1]):
        if cols_on[x] and not on: on = True; s = x
        if not cols_on[x] and on: on = False; runs.append((s, x))
    if on: runs.append((s, al.shape[1]))
    runs = [r for r in runs if r[1] - r[0] > 60]
    while len(runs) < nviews:                      # touching cars (mirror to mirror): split the widest run at its thinnest column
        k = max(range(len(runs)), key=lambda i: runs[i][1] - runs[i][0]); a, b = runs[k]; w = b - a
        seg = cols_on[a + int(w * 0.3):a + int(w * 0.7)]; cut_x = a + int(w * 0.3) + int(np.argmin(seg))
        runs[k:k + 1] = [(a, cut_x), (cut_x, b)]
    runs.sort(); assert len(runs) == nviews, (cid, runs)
    views = []
    for (a, b) in runs:
        m = al.copy(); m[:, :a] = 0; m[:, b:] = 0
        lab = components(m > 0.5); ids, cnt = np.unique(lab[lab > 0], return_counts=True); m = m * (lab == ids[np.argmax(cnt)])   # one body per view (drops a neighbour's mirror tip)
        x0, y0, x1, y1 = bbox(m)
        # nose direction: the far end of the car sits higher in a chase-camera view, so compare the x-centre of the
        # top rows with the bottom rows (+ = nose points right of frame)
        sub = m[y0:y1, x0:x1]; h = y1 - y0; xs = np.arange(x1 - x0)[None, :]
        top = sub[: max(2, h // 5)]; bot = sub[-max(2, h // 5):]
        cxt = (top * xs).sum() / max(1e-6, top.sum()); cxb = (bot * xs).sum() / max(1e-6, bot.sum())
        views.append({"m": m, "box": (x0, y0, x1, y1), "nose": cxt - cxb})
    # order: most nose-right first … most nose-left last; the straight view is the one with the least offset
    views.sort(key=lambda v: -v["nose"]); print(cid, "nose offsets (R→L):", [round(v["nose"], 1) for v in views])
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
    path = os.path.join(CARS, f"{cid}.webp"); save_webp(img, path, 84, 90); preview(img, cid)
    meta[cid] = {"src": f"assets/cars/{cid}.webp", "frames": nviews, "cols": cols, "rows": rows, "fw": fw, "fh": fh, "ppm": round(mid_w / width_m, 2)}

car_sheet("wed_gpt/rally.png", "rally", 3, 2.05, 2)
car_sheet("wed_gpt/muscle.png", "muscle", 3, 2.1, 2)
car_sheet("wed_gpt/kei.png", "kei", 3, 1.75, 2)
car_sheet("wed/red5.png", "red5", 5, 2.2, 2, upscale=1.5, keep_min=800)

# ---------------- exhaust flame sprite from the old red sheet (frame 3 = nose-right with flames, frame 0 = without) ----------------
old = np.asarray(Image.open(os.path.join(CARS, "red.webp")).convert("RGBA")).astype(np.float32)
FW = old.shape[1] // 6; f0 = old[:, FW:2 * FW]; f3 = old[:, 4 * FW:5 * FW]        # straight view without / with flames
lum0 = f0[..., :3].mean(-1) * f0[..., 3] / 255; lum3 = f3[..., :3].mean(-1) * f3[..., 3] / 255
m = np.clip((lum3 - lum0 - 40) / 90, 0, 1) * (f3[..., 3] / 255); m = (m > 0.08) * m
m[: int(old.shape[0] * 0.55)] = 0                                                  # flames sit under the tail: ignore paint reflections higher up
lab = components(m > 0.15); ids, cnt = np.unique(lab[lab > 0], return_counts=True); keep = np.isin(lab, ids[cnt >= 120]); m = m * keep
ys, xs = np.where(m > 0.1); x0, y0, x1, y1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
fl = np.zeros((y1 - y0, x1 - x0, 4), np.float32); fl[..., :3] = f3[y0:y1, x0:x1, :3]; fl[..., 3] = m[y0:y1, x0:x1] * 255
flame = Image.fromarray(np.clip(fl, 0, 255).astype(np.uint8), "RGBA").filter(ImageFilter.GaussianBlur(0.6))
save_webp(flame, os.path.join(WORLD, "flame.webp"), 80, 80); preview(flame, "flame")
# where it sits relative to the car frame: fractions of the frame width/height, measured from the frame's bottom centre
meta["flame"] = {"src": "assets/world/flame.webp", "w": flame.width, "h": flame.height, "cx": round(((x0 + x1) / 2 - FW / 2) / FW, 3), "bottom": round((old.shape[0] - y1) / old.shape[0], 3), "relW": round((x1 - x0) / FW, 3)}
print("flame", meta["flame"])

# ---------------- gantry ----------------
gfg, gal = keyed("wed_gpt/gantry.png", 300)
x0, y0, x1, y1 = bbox(gal); gimg = rgba(gfg, gal).crop((x0, y0, x1, y1)); GW0, GH0 = gimg.size
g = np.asarray(gimg).astype(np.float32); r, gg, b, a = g[..., 0], g[..., 1], g[..., 2], g[..., 3]
red = (r > 150) & (gg < 110) & (b < 110) & (a > 128)
# the five lamps: red blobs in the lower two thirds, clustered by column
rb = [bx for bx in blobs(red.astype(np.float32), 800) if bx[1] > GH0 * 0.3 and GW0 * 0.25 < bx[0] < GW0 * 0.75]   # lamps hang in the middle; the red wraps on the posts do not count
ymed = np.median([t[1] for t in rb]); rb = [t for t in rb if abs(t[1] - ymed) < GH0 * 0.03]; rb.sort()
assert len(rb) == 5, rb
lights = [[round(((t[0] + t[2]) / 2) / GW0, 4), round(((t[1] + t[3]) / 2) / GH0, 4), round(max(t[2] - t[0], t[3] - t[1]) / 2 / GW0, 4)] for t in rb]
# the LED screen: the biggest dark rectangle in the upper half
dark = ((r < 50) & (gg < 50) & (b < 50) & (a > 128)).astype(np.float32); dark[int(GH0 * 0.5):] = 0
db = sorted(blobs(dark, 2000), key=lambda t: -t[4])[0]
screen = [round(db[0] / GW0, 4), round(db[1] / GH0, 4), round((db[2] - db[0]) / GW0, 4), round((db[3] - db[1]) / GH0, 4)]
# post centres from the bottom rows of the mask
bot = (np.asarray(gimg)[..., 3][-int(GH0 * 0.06):] > 128).sum(0); on = bot > bot.max() * 0.3
xs = np.flatnonzero(on); gaps = np.flatnonzero(np.diff(xs) > 20); groups = np.split(xs, gaps + 1)
postL, postR = groups[0].mean() / GW0, groups[-1].mean() / GW0
gimg = fit_width(gimg, 1024); save_webp(gimg, os.path.join(WORLD, "gantry.webp"), 80, 85); preview(gimg, "gantry")
meta["gantry"] = {"src": "assets/world/gantry.webp", "w": gimg.width, "h": gimg.height, "lights": lights, "screen": screen, "posts": [round(postL, 4), round(postR, 4)]}
print("gantry", meta["gantry"])
dbg = gimg.convert("RGB").copy(); from PIL import ImageDraw; d = ImageDraw.Draw(dbg)
for lx, ly, lr in lights: d.ellipse((lx * dbg.width - lr * dbg.width, ly * dbg.height - lr * dbg.width, lx * dbg.width + lr * dbg.width, ly * dbg.height + lr * dbg.width), outline=(0, 255, 255), width=3)
d.rectangle((screen[0] * dbg.width, screen[1] * dbg.height, (screen[0] + screen[2]) * dbg.width, (screen[1] + screen[3]) * dbg.height), outline=(255, 0, 255), width=3)
d.line((postL * dbg.width, 0, postL * dbg.width, dbg.height), fill=(255, 255, 0), width=2); d.line((postR * dbg.width, 0, postR * dbg.width, dbg.height), fill=(255, 255, 0), width=2); dbg.save(os.path.join(DBG, "gantry_marks.png"))

# ---------------- pit building ----------------
pfg, pal = keyed("wed_gpt/pits.png", 400)
x0, y0, x1, y1 = bbox(pal); pimg = fit_width(rgba(pfg, pal).crop((x0, y0, x1, y1)), 1024)
save_webp(pimg, os.path.join(WORLD, "pits.webp"), 80, 85); preview(pimg, "pits")
meta["pits"] = {"src": "assets/world/pits.webp", "w": pimg.width, "h": pimg.height}

# ---------------- grandstand + crowd strip ----------------
sfg, sal = keyed("wed_gpt/grandstand.png", 400)
x0, y0, x1, y1 = bbox(sal); simg_full = rgba(sfg, sal).crop((x0, y0, x1, y1))
simg = fit_width(simg_full, 1024); save_webp(simg, os.path.join(WORLD, "stand.webp"), 80, 85); preview(simg, "stand")
meta["stand"] = {"src": "assets/world/stand.webp", "w": simg.width, "h": simg.height}
# crowd: the densest band of saturated, varied pixels (the seated fans), taken as a strip and tiled by mirroring
sf = np.asarray(simg_full.convert("RGB")).astype(np.float32); SH, SW = sf.shape[:2]
sat = sf.max(-1) - sf.min(-1); var = np.abs(np.diff(sf.mean(-1), axis=1)); band = (sat[:, 1:] > 40) & (var > 18)
rows = band[:, int(SW * 0.3):int(SW * 0.85)].mean(1); best = int(np.argmax(np.convolve(rows, np.ones(int(SH * 0.14)) / int(SH * 0.14), "same")))
cy0 = max(0, best - int(SH * 0.07)); cy1 = min(SH, best + int(SH * 0.07))
strip = Image.fromarray(sf[cy0:cy1, int(SW * 0.32):int(SW * 0.8)].astype(np.uint8))
strip = strip.resize((512, 96), Image.LANCZOS)
mir = Image.new("RGB", (1024, 96)); mir.paste(strip, (0, 0)); mir.paste(strip.transpose(Image.FLIP_LEFT_RIGHT), (512, 0)); mir = mir.resize((512, 64), Image.LANCZOS)
save_webp(mir, os.path.join(WORLD, "crowd.webp"), 78, 0); mir.save(os.path.join(DBG, "crowd_preview.png"))
meta["crowd"] = {"src": "assets/world/crowd.webp", "w": 512, "h": 64}

# ---------------- boards atlas: Gemini ad boards + 100/200/300 plates, ChatGPT tyre wall; kerb tile from the ChatGPT strip ----------------
bfg, bal = keyed("wed/boards.png", 300); bb = merge_boxes(blobs(bal, 400), 12); bb.sort(key=lambda t: (t[1] // 200, t[0]))
print("gemini boards blobs", bb)
cells = {}
def cut(name, box, fg=bfg, al=bal):
    x0, y0, x1, y1 = box[:4]; cells[name] = (fg[y0:y1, x0:x1], al[y0:y1, x0:x1])
# largest six blobs: by position — top row: ad1, ad2, sign; bottom row: ad3, tyre stack, kerb
six = sorted(bb, key=lambda t: -t[4])[:6]; top = sorted([t for t in six if t[1] < bal.shape[0] * 0.45], key=lambda t: t[0]); botr = sorted([t for t in six if t[1] >= bal.shape[0] * 0.45], key=lambda t: t[0])
assert len(top) == 3 and len(botr) == 3, (top, botr)
cut("ad1", top[0]); cut("ad2", top[1]); cut("ad3", botr[0])
# the sign: three number rows on one plate → three plates (post dropped: the game draws its own)
sx0, sy0, sx1, sy1 = top[2][:4]; plate = bfg[sy0:sy1, sx0:sx1]; pm = bal[sy0:sy1, sx0:sx1]
white = ((plate.min(-1) > 170) & (pm > 0.5)); wr = white.mean(1); wc = white.mean(0)
pr = np.flatnonzero(wr > 0.25); pc = np.flatnonzero(wc > 0.25); py0, py1, px0, px1 = pr.min(), pr.max() + 1, pc.min(), pc.max() + 1
inkrows = ((plate[py0:py1, px0:px1].max(-1) < 90) & (pm[py0:py1, px0:px1] > 0.5)).mean(1) > 0.04
runs = []; on = False
for i, v in enumerate(inkrows):
    if v and not on: on = True; s = i
    if not v and on: on = False; runs.append((s, i))
if on: runs.append((s, len(inkrows)))
runs = [r for r in runs if r[1] - r[0] > 8]; print("sign digit rows", runs); assert len(runs) == 3, runs
for name, (ra, rb_) in zip(("b100", "b200", "b300"), runs):
    pad = int((rb_ - ra) * 0.45); ya, yb = max(py0, py0 + ra - pad), min(py1, py0 + rb_ + pad)
    cells[name] = (plate[ya:yb, px0:px1], np.ones((yb - ya, px1 - px0), np.float32))
# tyre wall from the ChatGPT sheet: the biggest very dark blob in the left half
tfg, tal = keyed("wed_gpt/boards.png", 300); tb = blobs(tal, 400)
darkness = []
for t in tb:
    x0, y0, x1, y1 = t[:4]; sub = tfg[y0:y1, x0:x1]; msk = tal[y0:y1, x0:x1] > 0.5
    darkness.append((sub[msk].mean() if msk.any() else 255, t))
tyre = min([d for d in darkness if d[1][0] < tal.shape[1] * 0.5 and d[1][1] > tal.shape[0] * 0.3], key=lambda d: d[0])[1]
cut("tyres", tyre, tfg, tal)
# kerb: the widest blob at the bottom of the ChatGPT sheet → one red+white period, squashed to a tile
kb = max([t for t in tb if t[3] > tal.shape[0] * 0.8], key=lambda t: t[2] - t[0]); kx0, ky0, kx1, ky1 = kb[:4]
ks = tfg[ky0:ky1, kx0:kx1]; km = tal[ky0:ky1, kx0:kx1] > 0.5
redcol = ((ks[..., 0] > 120) & (ks[..., 1] < 100) & km).mean(0) > 0.15
edges = np.flatnonzero(np.diff(redcol.astype(int)) != 0); print("kerb colour edges", edges[:12])
if len(edges) >= 3:
    period = int(np.median(np.diff(edges)) * 2); start = int(edges[0]) + 2
else:
    period = (kx1 - kx0) // 4; start = 0
rowsk = np.flatnonzero(km[:, start:start + period].mean(1) > 0.97); ky_a, ky_b = rowsk.min(), rowsk.max() + 1
tile = Image.fromarray(ks[ky_a:ky_b, start:start + period].astype(np.uint8)).resize((128, 32), Image.LANCZOS)
save_webp(tile, os.path.join(WORLD, "kerb.webp"), 84, 0); tile.resize((512, 128)).save(os.path.join(DBG, "kerb_preview.png"))
meta["kerb"] = {"src": "assets/world/kerb.webp", "w": 128, "h": 32}
# pack the atlas: bottoms on one line, ≤ 1024 wide, cells scaled so the whole set fits
order = ["ad1", "ad2", "ad3", "tyres", "b100", "b200", "b300"]
PAD = 4; tot = sum(cells[n][0].shape[1] for n in order) + PAD * (len(order) + 1); sc = min(1.0, 1000 / tot)
imgs = {}
for n in order:
    cfg, cal = cells[n]; im = rgba(cfg, cal)
    if sc < 1: im = im.resize((max(1, round(im.width * sc)), max(1, round(im.height * sc))), Image.LANCZOS)
    imgs[n] = im
AW = sum(imgs[n].width for n in order) + PAD * (len(order) + 1); AH = max(imgs[n].height for n in order) + PAD * 2
atlas = Image.new("RGBA", (AW, AH), (0, 0, 0, 0)); x = PAD; acells = {}
heights = {"ad1": 2.6, "ad2": 2.6, "ad3": 2.6, "tyres": 2.2, "b100": 1.5, "b200": 1.5, "b300": 1.5}   # world height in metres
for n in order:
    im = imgs[n]; y = AH - PAD - im.height; atlas.paste(im, (x, y)); acells[n] = {"x": x, "y": y, "w": im.width, "h": im.height, "m": heights[n]}; x += im.width + PAD
save_webp(atlas, os.path.join(WORLD, "boards.webp"), 82, 90); preview(atlas, "boards")
meta["boards"] = {"src": "assets/world/boards.webp", "w": AW, "h": AH, "cells": acells}

# ---------------- podium ----------------
pdfg, pdal = keyed("wed_gpt/podium.png", 200)
x0, y0, x1, y1 = bbox(pdal); pd = rgba(pdfg, pdal).crop((x0, y0, x1, y1)); pd = fit_width(pd, 1024)
save_webp(pd, os.path.join(WORLD, "podium.webp"), 78, 80); preview(pd, "podium")
# step tops: at 25 / 50 / 75 % of the width, the first marble row (bright, unsaturated, with 20 marble rows under it) in the lower half
pa = np.asarray(pd).astype(np.float32); PH, PW = pa.shape[:2]
marble = (pa[..., :3].min(-1) > 150) & ((pa[..., :3].max(-1) - pa[..., :3].min(-1)) < 50) & (pa[..., 3] > 200)
steps = {}
for name, dx, fx in (("p2", 0.3, 0.23), ("p1", 0.4, 0.5), ("p3", 0.7, 0.77)):   # probe beside the trophy, label at the block centre
    col = marble[:, int(PW * dx) - 10:int(PW * dx) + 10].mean(1) > 0.6
    y = next(yy for yy in range(int(PH * 0.45), PH - 24) if col[yy:yy + 24].all())
    steps[name] = [fx, round(y / PH, 4)]
meta["podium"] = {"src": "assets/world/podium.webp", "w": pd.width, "h": pd.height, "steps": steps}
print("podium", meta["podium"])
dbg = pd.convert("RGB").copy(); d = ImageDraw.Draw(dbg)
for n, (fx, fy) in steps.items(): d.ellipse((fx * PW - 8, fy * PH - 8, fx * PW + 8, fy * PH + 8), fill=(0, 255, 255))
dbg.save(os.path.join(DBG, "podium_marks.png"))

# ---------------- videos ----------------
V = os.path.join(A, "videos")
def ff(args): subprocess.run(["ffmpeg", "-v", "error", "-y"] + args, check=True)
common = ["-an", "-c:v", "libx264", "-preset", "slow", "-crf", "30", "-pix_fmt", "yuv420p", "-profile:v", "main", "-level", "3.1", "-movflags", "+faststart"]
ff(["-i", os.path.join(V, "vid_2_win.mp4"), "-t", "7", "-vf", "scale=960:540,fade=out:st=6.3:d=0.7"] + common + [os.path.join(VID, "win.mp4")])
ff(["-i", os.path.join(V, "vid_1_JapaneseSunsetRacingPodiumVide.mp4"), "-t", "5", "-vf", "scale=960:540,fade=in:st=0:d=0.4,fade=out:st=4.4:d=0.6"] + common + [os.path.join(VID, "podium.mp4")])
# flyover: the calm wide aerial (6–10 s) played forwards then backwards so the loop never jumps
ff(["-i", os.path.join(V, "vid_0_JapaneseF1CircuitDroneVideo.mp4"), "-filter_complex", "[0:v]trim=6:10,setpts=PTS-STARTPTS,scale=960:540,split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1:a=0[v]", "-map", "[v]"] + common + [os.path.join(VID, "flyover.mp4")])
ff(["-ss", "8", "-i", os.path.join(V, "vid_0_JapaneseF1CircuitDroneVideo.mp4"), "-frames:v", "1", os.path.join(DBG, "flyover_frame.png")])
fp = Image.open(os.path.join(DBG, "flyover_frame.png")).convert("RGB").resize((960, 540), Image.LANCZOS)
save_webp(fp, os.path.join(VID, "flyover_poster.webp"), 70, 0, limit_kb=120)
card = fp.resize((640, 360), Image.LANCZOS).crop((0, 45, 640, 315)).filter(ImageFilter.GaussianBlur(1.2))
save_webp(card, os.path.join(WORLD, "card.webp"), 70, 0, limit_kb=80)
for n in ("win", "podium", "flyover"):
    p = os.path.join(VID, n + ".mp4"); kb = os.path.getsize(p) // 1024; print(n + ".mp4", kb, "KB"); assert kb < 2048, p
meta["video"] = {"win": "assets/video/win.mp4", "podium": "assets/video/podium.mp4", "flyover": "assets/video/flyover.mp4", "poster": "assets/video/flyover_poster.webp", "card": "assets/world/card.webp"}

json.dump(meta, open(os.path.join(DBG, "wed_meta.json"), "w"), indent=1)
print(json.dumps(meta))
