#!/usr/bin/env python3
"""Chroma-key the Gemini car videos into 6-frame sprite sheets.

Sheet frame order (left to right):
  0 noseR  (video LEFT car: yawed so its nose points right of frame)
  1 mid    (straight)
  2 noseL  (video RIGHT car, the mirror)
  3-5 the same three views with exhaust flames
All six frames share one canvas (same width/height, same ground baseline).
"""
import sys, json, os, subprocess
import numpy as np
from PIL import Image

A = "/Users/ananseclaw/staging/lz-fable-assets"
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(A, "out")
os.makedirs(OUT, exist_ok=True)
CARS = {"red": ("red_car_3view.mp4", 0.5, 3.0), "silver": ("silver_car_3view.mp4", 0.5, 3.5)}

def grab(video, t):
    p = os.path.join(A, "frames", f"grab_{os.path.basename(video)}_{t}.png")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(t), "-i", os.path.join(A, video), "-frames:v", "1", p], check=True)
    return np.asarray(Image.open(p).convert("RGB")).astype(np.float32)

def key(rgb):
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    d = g - np.maximum(r, b)                      # green dominance
    lo, hi = 10.0, 48.0
    alpha = np.clip(1.0 - (d - lo) / (hi - lo), 0.0, 1.0)
    # background colour (median of the top rows, which are pure screen)
    G = np.median(rgb[:40].reshape(-1, 3), axis=0)
    # unmix anti-aliased edges: c = a*fg + (1-a)*G
    a3 = alpha[..., None]
    safe = np.maximum(a3, 0.2)
    fg = (rgb - (1 - a3) * G) / safe
    fg = np.where(a3 > 0.05, fg, rgb)
    # despill: green never above the larger of red/blue
    mx = np.maximum(fg[..., 0], fg[..., 2])
    fg[..., 1] = np.minimum(fg[..., 1], mx + 2)
    fg = np.clip(fg, 0, 255)
    return fg, alpha

def components(mask):
    """Connected components (4-neighbour) without scipy: iterative label propagation on a
    downsampled grid is too lossy, so do a simple two-pass union-find on rows."""
    h, w = mask.shape
    labels = np.zeros((h, w), np.int32)
    parent = [0]
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    nxt = 1
    for y in range(h):
        row = mask[y]
        xs = np.flatnonzero(row)
        if not len(xs):
            continue
        # runs of consecutive pixels
        breaks = np.flatnonzero(np.diff(xs) > 1)
        starts = np.concatenate(([xs[0]], xs[breaks + 1]))
        ends = np.concatenate((xs[breaks], [xs[-1]]))
        for s, e in zip(starts, ends):
            lab = 0
            if y > 0:
                above = labels[y - 1, s:e + 1]
                ids = np.unique(above[above > 0])
                if len(ids):
                    roots = sorted(set(find(int(i)) for i in ids))
                    lab = roots[0]
                    for r_ in roots[1:]:
                        parent[r_] = lab
            if lab == 0:
                lab = nxt; parent.append(lab); nxt += 1
            labels[y, s:e + 1] = lab
    flat = labels.ravel()
    roots = np.array([find(i) for i in range(nxt)], np.int32)
    return roots[flat].reshape(h, w)

def clean(alpha, keep_min=1500):
    """Drop small floating bits (sun glints, specks) and tiny holes."""
    m = alpha > 0.5
    lab = components(m)
    ids, cnt = np.unique(lab[lab > 0], return_counts=True)
    keep = np.isin(lab, ids[cnt >= keep_min])
    # also keep soft pixels that touch a kept region (dilate 2 px)
    k = keep.copy()
    for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0), (1, 1), (-1, -1), (1, -1), (-1, 1)):
        k |= np.roll(np.roll(keep, dy, 0), dx, 1)
    for _ in range(1):
        k2 = k.copy()
        for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0)):
            k2 |= np.roll(np.roll(k, dy, 0), dx, 1)
        k = k2
    return alpha * k

def seam(alpha, fg, a, b, target):
    """Lowest-cost top-to-bottom seam between columns a..b: prefers transparent pixels,
    then dark crevices, so touching cars are separated along their shadow line."""
    luma = (fg[:, a:b, 0] * 0.3 + fg[:, a:b, 1] * 0.59 + fg[:, a:b, 2] * 0.11) / 255.0
    cost = alpha[:, a:b] * (0.15 + luma) + 0.004 * np.abs(np.arange(a, b)[None, :] - target)
    h, w = cost.shape
    acc = cost.copy(); back = np.zeros((h, w), np.int8)
    for y in range(1, h):
        p = acc[y - 1]
        left = np.concatenate(([1e9], p[:-1])) + 0.02
        right = np.concatenate((p[1:], [1e9])) + 0.02
        stack = np.stack((left, p, right))
        k = np.argmin(stack, axis=0)
        acc[y] += stack[k, np.arange(w)]; back[y] = k - 1
    x = int(np.argmin(acc[-1])); xs = np.zeros(h, np.int32)
    for y in range(h - 1, -1, -1):
        xs[y] = x + a; x = x + int(back[y, x]) if y > 0 else x
    return xs

def splits(alpha, fg):
    w = alpha.shape[1]
    s1 = seam(alpha, fg, 430, 540, 476)   # between the mirrors of the left and middle cars
    s2 = seam(alpha, fg, 740, 850, 805)
    return s1, s2

def bbox(alpha, thr=0.5):
    ys, xs = np.where(alpha > thr)
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1

meta = {}
for name, (video, t_clean, t_flame) in CARS.items():
    frames = []
    for t in (t_clean, t_flame):
        rgb = grab(video, t)
        fg, al = key(rgb)
        al = clean(al)
        frames.append((fg, al))
    # per-frame, per-view alpha masks cut along the seams
    H0, W0 = frames[0][1].shape
    xx = np.arange(W0)[None, :]
    masked = []  # masked[frame][view] = alpha
    for fi, (fg, al) in enumerate(frames):
        s1, s2 = splits(al, fg)
        print(name, "frame", fi, "seam1 range", s1.min(), s1.max(), "seam2 range", s2.min(), s2.max())
        m0 = al * (xx < s1[:, None]); m1 = al * ((xx >= s1[:, None]) & (xx < s2[:, None])); m2 = al * (xx >= s2[:, None])
        if name == "silver":
            m0[:380, :27] = 0           # the left wing bar runs past its end plate into the frame edge
        masked.append([m0, m1, m2])
        dbg = fg.copy(); dbg[np.arange(H0), s1] = (255, 0, 255); dbg[np.arange(H0), s2] = (255, 0, 255)
        Image.fromarray(dbg.astype(np.uint8)).crop((380, 260, 900, 580)).save(os.path.join(OUT, f"{name}_seam{fi}.png"))
    boxes = []
    for vi in range(3):
        bx = None
        for fi in range(len(frames)):
            x0, y0, x1, y1 = bbox(masked[fi][vi])
            bx = (x0, y0, x1, y1) if bx is None else (min(bx[0], x0), min(bx[1], y0), max(bx[2], x1), max(bx[3], y1))
        boxes.append(bx)
    # middle car only: its own clean box defines the metre scale
    mx0, my0, mx1, my1 = bbox(masked[0][1])
    mid_w = mx1 - mx0
    W = max(b[2] - b[0] for b in boxes) + 4
    base = max(b[3] for b in boxes)                 # shared ground line (lowest tyre)
    top = min(b[1] for b in boxes)
    H = base - top + 4
    print(name, "boxes", boxes, "canvas", W, H, "mid width px", mid_w, "baseline y", base)
    sheet = np.zeros((H, W * 6, 4), np.float32)
    for fi, (fg, _) in enumerate(frames):
        for vi, (x0, y0, x1, y1) in enumerate(boxes):
            al = masked[fi][vi]
            cw = x1 - x0
            ox = (W - cw) // 2
            # paste with the bottom aligned to the shared baseline (2 px margin)
            yoff = H - 2 - (y1 - y0)       # every view sits on the canvas floor
            dst_y0 = yoff; dst_y1 = yoff + (y1 - y0)
            cell = fi * 3 + vi
            sheet[dst_y0:dst_y1, cell * W + ox: cell * W + ox + cw, :3] = fg[y0:y1, x0:x1]
            sheet[dst_y0:dst_y1, cell * W + ox: cell * W + ox + cw, 3] = al[y0:y1, x0:x1] * 255
    # premultiplied-looking fringe fix: where alpha is 0, copy colour from nearest (keeps WebP edges clean)
    img = Image.fromarray(np.clip(sheet, 0, 255).astype(np.uint8), "RGBA")
    # scale so the sheet is not wasteful: keep native res but cap frame width at 560 px
    scale = min(1.0, 560 / W)
    if scale < 1:
        img = img.resize((int(img.width * scale), int(img.height * scale)), Image.LANCZOS)
    fw, fh = img.width // 6, img.height
    path = os.path.join(OUT, f"{name}.webp")
    img.save(path, "WEBP", quality=84, method=6, alpha_quality=90, exact=False)
    # a standalone middle frame for the car picker is just the sheet cropped in CSS; no extra file
    # car width in metres for the middle view: body + mirrors ~ 2.3 m
    ppm = (mid_w * scale) / 2.3
    meta[name] = {"src": f"assets/cars/{name}.webp", "frames": 6, "fw": fw, "fh": fh, "ppm": round(ppm, 2),
                  "w": round(fw / ppm, 3), "h": round(fh / ppm, 3)}
    print(name, "->", path, os.path.getsize(path) // 1024, "KB", meta[name])
    # debug preview on a checker background
    chk = Image.new("RGBA", img.size, (90, 90, 90, 255))
    px = np.asarray(chk).copy(); yy, xx = np.mgrid[0:img.height, 0:img.width]
    px[((yy // 16 + xx // 16) % 2) == 1] = (140, 140, 140, 255)
    chk = Image.fromarray(px); chk.alpha_composite(img); chk.convert("RGB").save(os.path.join(OUT, f"{name}_preview.png"))
json.dump(meta, open(os.path.join(OUT, "meta.json"), "w"), indent=1)
print(json.dumps(meta))
