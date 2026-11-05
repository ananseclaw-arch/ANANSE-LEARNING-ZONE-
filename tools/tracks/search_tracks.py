#!/usr/bin/env python3
"""Pick lengths for the adjustable straights (["S",[lo,hi],opt] or ["S","?",opt]) so each route closes exactly, hits its
target lap length and never passes within ~50 m of itself. The end point and the lap length are linear in the straight
lengths, so a feasible set is found by alternating projections (onto the 3 linear constraints, then onto the [lo,hi] box)
from many random starts; the start with the most room between road sections wins.
usage: search_tracks.py routes_src.json out.json [starts]"""
import json, math, random, sys
import numpy as np
import design_tracks as D
src = json.load(open(sys.argv[1])); out = sys.argv[2]; N = int(sys.argv[3]) if len(sys.argv) > 3 else 400
random.seed(11); np.random.seed(11); res = []
for r in src:
    segs0 = [list(s) for s in r["segs"]]; tgt = r["target"]
    for s in segs0:
        if s[0] == "S" and s[1] == "?": s[1] = [40, 380]
    h = 0.0; x = z = 0.0; heads = []; idx = []; arcs_len = fixed_len = 0.0
    for i, s in enumerate(segs0):
        if s[0] == "S":
            if isinstance(s[1], list): heads.append(h); idx.append(i)
            else: x += math.sin(h) * s[1]; z -= math.cos(h) * s[1]; fixed_len += s[1]
        else:
            R, deg = s[1], s[2]; sg = 1 if s[0] == "R" else -1; n = 400; st = R * math.radians(deg) / n; arcs_len += R * math.radians(deg)
            for _ in range(n): hm = h + sg * st / R / 2; x += math.sin(hm) * st; z -= math.cos(hm) * st; h += sg * st / R
    A = np.array([[math.sin(q) for q in heads], [-math.cos(q) for q in heads], [1.0] * len(heads)])
    b = np.array([-x, -z, tgt - fixed_len - arcs_len])
    lo = np.array([segs0[i][1][0] for i in idx], float); hi = np.array([segs0[i][1][1] for i in idx], float)
    P = A.T @ np.linalg.inv(A @ A.T)
    best = None; feas = 0
    for it in range(N):
        L = lo + np.random.rand(len(lo)) * (hi - lo)
        for _ in range(400):
            L = L - P @ (A @ L - b); L = np.clip(L, lo, hi)
        L = L - P @ (A @ L - b)                       # final exact projection (may step slightly outside the box)
        if (L < lo - 8).any() or (L > hi + 8).any() or (L < 30).any(): continue
        feas += 1
        fixed = list(segs0); 
        for k, i in enumerate(idx): fixed[i] = ["S", round(float(L[k]), 2)] + segs0[i][2:]
        pts, dist, _ = D.walk(fixed)
        if math.hypot(*pts[-1]) > 0.5: continue
        gap = D.self_gap(pts, dist, dist[-1])[0]
        sc = min(gap, 95) + 0.001 * float(np.min(L))
        if not best or sc > best[0]: best = (sc, fixed, dist[-1], gap)
        if best[3] >= 95: break
    if not best: print(r["id"], "NO FEASIBLE LENGTHS (feasible starts", feas, ")"); continue
    print(r["id"], round(best[2]), "m  closest pass", round(best[3]), "m  feasible starts", feas)
    res.append({"id": r["id"], "segs": best[1]})
json.dump(res, open(out, "w"))
