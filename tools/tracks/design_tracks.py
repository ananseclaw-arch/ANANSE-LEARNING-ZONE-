#!/usr/bin/env python3
"""Grand Fable GP track designer: closes each route exactly, checks it never crosses itself, plots it.
Routes use race3d.js's segment language: ["S", metres, opt] straights, ["R"|"L", radius, degrees, opt] arcs, walked from
the start line heading north (-z). Two straights per route have length "?" and are solved so the loop closes; the turns
must add up to +360 (clockwise). opt (optional dict): z = zone name(s), h = road height (m) at the END of the segment,
j = jump crest height (m) in the middle of a straight.
usage: design_tracks.py routes.json out_dir   -> prints closed routes as JS + writes <id>.png overhead plots"""
import json, math, sys, os
from itertools import combinations

def walk(segs, lens=None):
    x = z = h = 0.0; pts = [(0.0, 0.0)]; dist = [0.0]; d = 0.0; k = 0
    for sg in segs:
        if sg[0] == "S":
            L = sg[1] if sg[1] != "?" else lens[k]
            if sg[1] == "?": k += 1
            n = max(1, int(L // 3)); st = L / n
            for _ in range(n):
                x += math.sin(h) * st; z -= math.cos(h) * st; d += st; pts.append((x, z)); dist.append(d)
        else:
            R, deg = sg[1], sg[2]; sgn = 1 if sg[0] == "R" else -1; L = R * math.radians(deg); n = max(2, int(L // 2)); st = L / n
            for _ in range(n):
                hm = h + sgn * st / R / 2
                x += math.sin(hm) * st; z -= math.cos(hm) * st; h += sgn * st / R; d += st; pts.append((x, z)); dist.append(d)
    return pts, dist, h

def heading_at_free(segs):
    """heading (rad) of each '?' straight"""
    h = 0.0; out = []
    for sg in segs:
        if sg[0] == "S":
            if sg[1] == "?": out.append(h)
        else:
            h += (1 if sg[0] == "R" else -1) * math.radians(sg[2])
    return out, h

def close(segs):
    hs, H = heading_at_free(segs)
    if not hs: return []
    assert len(hs) == 2, "need exactly two '?' straights"
    assert abs(abs(H) - 2 * math.pi) < 1e-6, f"turns add up to {math.degrees(H):.2f} deg, need +-360"
    pts, _, _ = walk(segs, [0.0, 0.0]); ex, ez = pts[-1]
    # end + L1*(sin h1, -cos h1) + L2*(sin h2, -cos h2) = 0
    a, b = math.sin(hs[0]), math.sin(hs[1]); c, d = -math.cos(hs[0]), -math.cos(hs[1])
    det = a * d - b * c
    assert abs(det) > 1e-6, "free straights are parallel"
    L1 = (-ex * d + ez * b) / det; L2 = (-a * ez + c * ex) / det
    return [round(L1, 2), round(L2, 2)]

def self_gap(pts, dist, total):
    """smallest distance between two parts of the road that are > 120 m apart along the lap"""
    sp = pts[::3]; sd = dist[::3]; best = (1e9, None)
    for i, j in combinations(range(len(sp)), 2):
        along = abs(sd[i] - sd[j]); along = min(along, total - along)
        if along < 120: continue
        g = math.hypot(sp[i][0] - sp[j][0], sp[i][1] - sp[j][1])
        if g < best[0]: best = (g, (round(sd[i]), round(sd[j])))
    return best

def corners(segs):
    out = []
    for sg in segs:
        if sg[0] != "S": out.append((sg[0], sg[1], sg[2]))
    return out

def plot(route, pts, dist, total, path, info):
    from PIL import Image, ImageDraw, ImageFont
    xs = [p[0] for p in pts]; zs = [p[1] for p in pts]; pad = 60
    w = max(xs) - min(xs); hgt = max(zs) - min(zs); S = 900 / max(w, hgt)
    W, H = int(w * S) + 2 * pad, int(hgt * S) + 2 * pad + 70
    im = Image.new("RGB", (W, H), (24, 28, 36)); dr = ImageDraw.Draw(im)
    P = lambda p: (pad + (p[0] - min(xs)) * S, 70 + pad + (p[1] - min(zs)) * S)
    try: f = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 22); fs = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 15)
    except Exception: f = fs = None
    # zones + heights coloured along the lap
    zl = route.get("_zl", [])
    for i in range(len(pts) - 1):
        col = (235, 235, 235)
        for (a, b, name) in zl:
            if a <= dist[i] <= b: col = {"tunnel": (120, 120, 120), "bridge": (80, 170, 255), "beach": (255, 214, 120), "dirt": (190, 140, 90), "highway": (200, 200, 255), "ford": (60, 140, 255)}.get(name, col)
        dr.line([P(pts[i]), P(pts[i + 1])], fill=col, width=7)
    for jd in route.get("_jumps", []):
        k = min(range(len(dist)), key=lambda i: abs(dist[i] - jd)); x, y = P(pts[k]); dr.ellipse([x - 11, y - 11, x + 11, y + 11], outline=(255, 222, 71), width=4)
    x, y = P(pts[0]); dr.rectangle([x - 14, y - 4, x + 14, y + 4], fill=(255, 59, 48))
    dr.text((20, 14), f"{route['id']}  {total/1000:.2f} km  ·  {info}", fill=(255, 255, 255), font=f)
    dr.text((20, 44), "red = start/finish (heading up)   yellow rings = jump crests   blue = bridge   grey = tunnel   sand = beach", fill=(190, 196, 210), font=fs)
    im.save(path)

if __name__ == "__main__":
    routes = json.load(open(sys.argv[1])); out = sys.argv[2]; os.makedirs(out, exist_ok=True); res = {}
    for r in routes:
        segs = r["segs"]; L = close(segs); k = 0; fixed = []
        for sg in segs:
            if sg[0] == "S" and sg[1] == "?": sg = ["S", L[k]] + sg[2:]; k += 1
            fixed.append(sg)
        pts, dist, H = walk(fixed); total = dist[-1]
        gap = self_gap(pts, dist, total)
        # zone + jump distances for the plot
        d = 0.0; zl = []; jumps = []
        for sg in fixed:
            ln = sg[1] if sg[0] == "S" else sg[1] * math.radians(sg[2]); opt = sg[2] if sg[0] == "S" and len(sg) > 2 else (sg[3] if len(sg) > 3 else {})
            for zn in ([opt["z"]] if isinstance(opt.get("z"), str) else opt.get("z", [])): zl.append((d, d + ln, zn))
            if "j" in opt: jumps.append(d + ln * opt.get("jat", 0.5))
            d += ln
        r["_zl"] = zl; r["_jumps"] = jumps
        cs = corners(fixed); tight = sum(1 for c in cs if c[1] < 40); hair = sum(1 for c in cs if c[1] < 24 and c[2] >= 120)
        info = f"{len(cs)} turns ({tight} tight, {hair} hairpins) · free straights {L} · closest pass {gap[0]:.0f} m"
        print(r["id"], f"{total:.0f} m", info, "gap at", gap[1], "end error", [round(v, 3) for v in pts[-1]])
        if L and min(L) < 20: print("  !! free straight too short")
        if gap[0] < 30: print("  !! road passes too close to itself")
        plot(r, pts, dist, total, os.path.join(out, r["id"] + ".png"), info)
        res[r["id"]] = {"segs": fixed, "km": round(total / 1000, 3), "turns": len(cs), "tight": tight, "hairpins": hair, "gap": round(gap[0])}
    json.dump(res, open(os.path.join(out, "routes_closed.json"), "w"), indent=0)
