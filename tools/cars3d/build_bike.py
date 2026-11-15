# Grand Fable GP - the Lightning Bike (job 1114-2350-08f7): a faired sport motorbike with a rider in a sport tuck, headless in Blender 4.2.
# Run:  Blender -b --factory-startup -P tools/cars3d/build_bike.py -- [--out DIR] [--render DIR] [--json PATH] [--paint #hex] [--name n]
# It reuses build_fleet.py's helpers (mesh builder MB/MBX, materials, scene, export settings, game coords x,-z,y) by running only
# the helper half of that file, so build_fleet.py itself is unchanged. Writes <out>/bike.glb and merges a "bike" entry into fleet.json.
# Node layout (what race3d.js drives):  bike (root) -> body -> { every bike + rider mesh, hub_FL -> (wheel_FL, caliper_FL, fork_FL),
#   hub_RL -> (wheel_RL, caliper_RL) }.  The hubs sit INSIDE body (unlike the cars) so the machine, wheels and rider lean together.
#   Only FL and RL exist; hub x = 0; origin on the ground under the middle of the wheelbase.
# Tyres have a ROUND profile so the bike looks right leaned over (the game leans it about the tyre contact line, pivotY 0.001).
import os, sys, math, json
HERE = os.path.dirname(os.path.abspath(__file__))
_src = open(os.path.join(HERE, "build_fleet.py")).read()
exec(compile(_src[:_src.index("# ================================================================ the cars")], "build_fleet_helpers", "exec"))
exec(compile(_src[_src.index("# ================================================================ quick-look renders"):_src.index("# ================================================================ main")], "build_fleet_renders", "exec"))
argv_ = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
PAINT = argv_[argv_.index("--paint") + 1] if "--paint" in argv_ else "#d21f2a"
NAME = argv_[argv_.index("--name") + 1] if "--name" in argv_ else "bike"
if "--paint" in argv_ or "--name" in argv_:   # strip our own flags from the ids the helper parsed
    IDS = [a for a in IDS if a not in (PAINT, NAME, "--paint", "--name")]

# ------------------------------------------------------------------ dimensions (metres, game coords: x = bike's left, y up, z = nose)
WF = dict(z=0.72, r=0.31, w=0.12, rim=0.215)    # front 120/70-17
WR = dict(z=-0.70, r=0.32, w=0.18, rim=0.215)   # rear 180/55-17
SUIT, HELMET = "#1f6fd6", "#ffd23f"             # blue suit, yellow helmet: bright primary colours next to the red bike

def lerp_(a, b, t): return a + (b - a) * t
def table(K, z):
    """piecewise smooth interpolation of (z, value...) rows, rows sorted by z ascending"""
    if z <= K[0][0]: return K[0][1:]
    for i in range(1, len(K)):
        if z <= K[i][0]:
            t = (z - K[i - 1][0]) / (K[i][0] - K[i - 1][0]); t = t * t * (3 - 2 * t)
            return tuple(lerp_(a, b, t) for a, b in zip(K[i - 1][1:], K[i][1:]))
    return K[-1][1:]

# fairing + tank (one smooth loft): z, half-width, bottom y, top y, squareness
FAIR = [(-0.22, 0.13, 0.50, 0.84, 2.4), (-0.12, 0.19, 0.30, 0.88, 2.6), (0.02, 0.24, 0.23, 0.95, 2.8), (0.20, 0.27, 0.22, 0.99, 2.8),
        (0.32, 0.28, 0.24, 0.97, 2.8), (0.38, 0.28, 0.34, 0.97, 2.7), (0.46, 0.27, 0.56, 0.98, 2.6), (0.58, 0.26, 0.64, 1.00, 2.5),
        (0.72, 0.24, 0.66, 1.01, 2.4), (0.84, 0.20, 0.65, 0.98, 2.3), (0.94, 0.13, 0.66, 0.91, 2.2), (1.01, 0.04, 0.71, 0.80, 2.0)]
# tail unit under the seat, rising to the tail lamp
TAIL = [(-1.04, 0.03, 0.865, 0.905, 2.0), (-0.96, 0.075, 0.81, 0.925, 2.6), (-0.78, 0.105, 0.75, 0.92, 2.8), (-0.55, 0.135, 0.67, 0.895, 2.8),
        (-0.32, 0.155, 0.59, 0.865, 2.8), (-0.16, 0.15, 0.52, 0.845, 2.6)]

def sect(K, z, n=24):
    hw, yb, yt, sq = table(K, z); yc, hh = (yb + yt) / 2, (yt - yb) / 2; e = 2.0 / sq; pts = []
    for i in range(n):
        a = 2 * PI * i / n; c, s = math.cos(a), math.sin(a)
        pts.append((hw * math.copysign(abs(c) ** e, c), yc + hh * math.copysign(abs(s) ** e, s), z))
    return pts

def loft(b, K, z0, z1, steps, mat_of, n=24):
    """loft of superellipse sections; mat_of(i, z) picks the material per face (ring point i, station z)"""
    R = [sect(K, lerp_(z0, z1, k / steps), n) for k in range(steps + 1)]
    idx = [[b.vert(p) for p in ring] for ring in R]
    for a in range(steps):
        zm = lerp_(z0, z1, (a + 0.5) / steps)
        for i in range(n):
            j = (i + 1) % n; b.face([idx[a][i], idx[a][j], idx[a + 1][j], idx[a + 1][i]], mat_of(i, zm))
    b.face(list(reversed(idx[0])), mat_of(n * 3 // 4, z0)); b.face(idx[-1], mat_of(n // 4, z1))

def side_x(K, z, y):
    """x of the loft surface at (z, y) on the +x side"""
    hw, yb, yt, sq = table(K, z); yc, hh = (yb + yt) / 2, (yt - yb) / 2
    t = min(1.0, abs((y - yc) / hh)); return hw * max(0.0, 1 - t ** sq) ** (1 / sq)

def earclip(P):
    """triangulate a simple polygon (list of 2D points, either winding) -> index triples"""
    idx = list(range(len(P))); area = sum(P[i][0] * P[(i + 1) % len(P)][1] - P[(i + 1) % len(P)][0] * P[i][1] for i in idx)
    if area < 0: idx.reverse()
    cross = lambda o, a, b: (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
    def inside(p, a, b, c): return cross(a, b, p) > 0 and cross(b, c, p) > 0 and cross(c, a, p) > 0
    out = []
    while len(idx) > 3:
        for k in range(len(idx)):
            i0, i1, i2 = idx[k - 1], idx[k], idx[(k + 1) % len(idx)]
            if cross(P[i0], P[i1], P[i2]) <= 0: continue
            if any(inside(P[j], P[i0], P[i1], P[i2]) for j in idx if j not in (i0, i1, i2)): continue
            out.append((i0, i1, i2)); idx.pop(k); break
        else: break
    out.append(tuple(idx[:3])); return out

def side_slab(b, K, pts_zy, m, off=0.004):
    """a flat decal-like slab hugging the fairing side on both sides (pts in (z, y), any simple polygon)"""
    tri = earclip(pts_zy)
    for sd in (1, -1):
        ring = [b.vert((sd * (side_x(K, z, y) + off), y, z)) for (z, y) in pts_zy]
        for (a_, b_, c_) in tri:
            f = [ring[a_], ring[b_], ring[c_]]; b.face(f if sd < 0 else f[::-1], m)

# ------------------------------------------------------------------ wheels (round motorcycle tyres, cast 3-split-spoke rims)
def bike_wheel(W_, front):
    mb = MB(); r, tw, rr = W_["r"], W_["w"], W_["rim"]; a, bb = tw / 2, r - rr; seg = 40; prof = []
    for k in range(15):                                  # semi-ellipse cross-section: bead (x=+-a, r=rim) over a round crown
        ph = -PI / 2 + PI * k / 14; prof.append((a * math.sin(ph) * (1.04 if abs(ph) > 0.9 else 1.0), rr + bb * math.cos(ph), abs(ph)))
    rg = [[mb.vert((px, math.cos(2 * PI * i / seg) * pr, math.sin(2 * PI * i / seg) * pr)) for i in range(seg)] for (px, pr, _) in prof]
    for k in range(len(prof) - 1):
        m = "tyre" if max(prof[k][2], prof[k + 1][2]) < 1.15 else "tyrewall"
        for i in range(seg):
            j = (i + 1) % seg; mb.face([rg[k][i], rg[k][j], rg[k + 1][j], rg[k + 1][i]][::-1], m)
    # rim: lip rings + barrel, hub, 5 split spokes (10 thin blades)
    mb.cyl((0, 0, 0), rr, tw * 0.78, "rimdark", axis="x", seg=seg, cap=False)
    for sd in (-1, 1): mb.cyl((sd * tw * 0.39, 0, 0), rr + 0.006, 0.012, "rim", axis="x", seg=seg, r2=rr - 0.012, cap=False)
    mb.cyl((0, 0, 0), 0.05, tw * 0.95, "rim", axis="x", seg=14)
    for k in range(5):
        for dd in (-0.09, 0.09):
            a0 = 2 * PI * k / 5 + dd; a1 = a0 + dd * 0.6; ca0, sa0, ca1, sa1 = math.cos(a0), math.sin(a0), math.cos(a1), math.sin(a1)
            p0 = (0, ca0 * 0.05, sa0 * 0.05); p1 = (0, ca1 * (rr - 0.01), sa1 * (rr - 0.01)); am = (a0 + a1) / 2
            mid = tuple((p0[q] + p1[q]) / 2 for q in range(3)); half = tuple((p1[q] - p0[q]) / 2 for q in range(3))
            mb.obox(mid, (0.012, 0, 0), half, (0, -math.sin(am) * 0.011, math.cos(am) * 0.011), "spoke")
    # brake discs: twin floating discs at the front, one on the right (-x) at the rear; rear sprocket on the left
    discs = [(0.075, 0.155), (-0.075, 0.155)] if front else [(-0.08, 0.11)]
    for (x, rd) in discs:
        mb.cyl((x, 0, 0), rd, 0.006, "disc", axis="x", seg=28)
        mb.cyl((x, 0, 0), rd * 0.62, 0.008, "spoke", axis="x", seg=16)
    if not front: mb.cyl((0.09, 0, 0), 0.10, 0.008, "carbon", axis="x", seg=24)
    return mb

def bike_calipers(front):
    mb = MB()
    if front:
        for sd in (1, -1):
            ang = math.radians(150); mb.box((sd * 0.083, math.cos(ang) * -0.13 + 0.03, math.sin(ang) * -0.13 - 0.05), (0.03, 0.12, 0.05), "caliper", rot_x=0.5)
    else:
        mb.box((-0.088, -0.04, 0.10), (0.03, 0.05, 0.10), "caliper")
    return mb

def fork_mesh():
    """fork legs, axle clamps and the front mudguard - children of hub_FL, so they turn with the bars"""
    mb = MB(); top = (0.0, 0.62, -0.26)                     # triple clamp, relative to the front axle (rake ~23 deg)
    for sd in (1, -1):
        x = sd * 0.088; p0 = (x, 0.0, 0.0); p1 = (x, top[1] * 0.48, top[2] * 0.48); p2 = (x, top[1], top[2])
        mb.tube([p0, p1], 0.032, "rimdark", seg=10)             # lower legs
        mb.tube([p1, p2], 0.024, "chrome", seg=10)              # chrome stanchions
        mb.cyl((x, 0, 0), 0.034, 0.05, "rimdark", axis="x", seg=10)
    mb.box((0, top[1] - 0.02, top[2]), (0.24, 0.035, 0.08), "rimdark", rot_x=0.4)
    # mudguard: a thin arc over the tyre crown (paint), from ahead of the axle to behind it
    R = WF["r"] + 0.045; segs = 10; prev = None
    for k in range(segs + 1):
        a = math.radians(lerp_(28, 152, k / segs)); c, s = math.cos(a), math.sin(a)
        ring = [(-0.072, s * R, c * R), (0.072, s * R, c * R), (0.072, s * (R + 0.012), c * (R + 0.012)), (-0.072, s * (R + 0.012), c * (R + 0.012))]
        ids = [mb.vert(p) for p in ring]
        if prev:
            for i in range(4):
                j = (i + 1) % 4; mb.face([prev[i], prev[j], ids[j], ids[i]], "paint")
        else: mb.face(ids[::-1], "paint")
        prev = ids
    mb.face(prev, "paint")
    return mb

# ------------------------------------------------------------------ body + rider
class Ctx: pass
def build_body():
    b = MBX(); C = Ctx(); C.hl = []; b.C = C
    stripe_band = lambda i, z: "stripe" if i in (4, 28) and 0.10 < z < 0.95 else "paint"     # white pin line along both flanks
    def fair_mat(i, z):
        if z < 0.40 and i in (21, 22, 23, 24, 25, 26, 27) : return "carbon"                         # carbon belly pan under the engine
        return stripe_band(i, z)
    loft(b, FAIR, FAIR[0][0], FAIR[-1][0], 44, fair_mat, n=32)
    loft(b, TAIL, TAIL[0][0], TAIL[-1][0], 18, lambda i, z: "carbon" if i in (22, 23, 24, 25, 26) else "paint", n=32)
    # lightning bolt on both side panels (white), the bike's name in a shape
    bolt = [(0.36, 0.90), (0.22, 0.90), (0.08, 0.62), (0.19, 0.645), (0.00, 0.36), (0.31, 0.72), (0.20, 0.695)]
    side_slab(b, FAIR, bolt, "stripe")
    # engine block + cylinder head showing below the fairing, radiator dark
    b.box((0, 0.36, 0.06), (0.34, 0.26, 0.42), "exhaust"); b.box((0, 0.50, 0.24), (0.36, 0.18, 0.10), "carbon", rot_x=0.25)
    # frame spars (twin beam) from the steering head to the swingarm pivot, visible between tank and seat
    for sd in (1, -1):
        b.tube([(sd * 0.2, 0.84, 0.44), (sd * 0.24, 0.72, 0.10), (sd * 0.2, 0.52, -0.16)], 0.03, "rim", seg=8)
    # swingarm to the rear axle + chain on the left
    for sd in (1, -1):
        b.tube([(sd * 0.13, 0.42, -0.14), (sd * 0.13, 0.36, -0.45), (sd * 0.11, WR["r"], WR["z"])], 0.032 if sd < 0 else 0.028, "rim", seg=8)
    b.tube([(0.10, 0.40, -0.02), (0.10, 0.42, WR["z"])], 0.009, "exhaust", seg=6); b.tube([(0.10, 0.30, -0.02), (0.10, 0.22, WR["z"])], 0.009, "exhaust", seg=6)
    b.cyl((0.10, 0.35, -0.02), 0.05, 0.02, "exhaust", axis="x", seg=12)
    # rear shock (yellow spring) behind the engine
    b.tube([(0, 0.66, -0.20), (0, 0.42, -0.30)], 0.03, "caliper", seg=8)
    # underslung exhaust: header round to a short silencer on the right, chrome heat shield + tip
    b.tube([(-0.10, 0.30, 0.20), (-0.14, 0.20, -0.02), (-0.15, 0.30, -0.30), (-0.16, 0.42, -0.50)], 0.035, "exhaust", seg=10)
    can_c = (-0.17, 0.50, -0.62)
    b.tube([(-0.165, 0.44, -0.52), (-0.175, 0.56, -0.72)], 0.068, "exhaust", seg=14)
    b.tube([(-0.205, 0.465, -0.53), (-0.215, 0.545, -0.68)], 0.035, "chrome", seg=10)
    b.tube([(-0.175, 0.56, -0.72), (-0.178, 0.58, -0.76)], 0.045, "chrome", seg=12)
    exh_tip = [-0.178, 0.58, -0.77]
    # rear hugger over the tyre + carbon chain guard
    b.box((0, WR["r"] * 2 + 0.05, WR["z"] + 0.10), (0.20, 0.02, 0.36), "carbon", rot_x=-0.25)
    # windscreen (glass) - a curved bubble from the nose top back over the clocks
    n = 9; RR = []
    for k in range(n):
        t = -1 + 2 * k / (n - 1); x = 0.17 * t
        y0 = 0.985 - 0.04 * t * t; z0 = 0.84 - 0.03 * t * t; y1 = 1.12 - 0.07 * t * t; z1 = 0.56 - 0.02 * t * t
        RR.append([(x, y0, z0), (x * 0.86, y1, z1), (x * 0.86, y1 - 0.012, z1 + 0.004), (x, y0 - 0.012, z0 + 0.004)])
    idx = [[b.vert(p) for p in r] for r in RR]
    for a in range(n - 1):
        for i in range(4):
            j = (i + 1) % 4; b.face([idx[a][i], idx[a][j], idx[a + 1][j], idx[a + 1][i]], "glass")
    b.face(list(reversed(idx[0])), "glass"); b.face(idx[-1], "glass")
    # twin headlamp units in the nose (MBX turns each lamp box into housing + reflector + projector + clear lens; centres -> hl)
    for sd in (1, -1):
        b.box((sd * 0.085, 0.80, 0.955), (0.11, 0.055, 0.04), "lamp", rot_x=-0.5, rot_y=sd * 0.35)
    b.box((0, 0.735, 1.005), (0.05, 0.03, 0.03), "lamp", rot_x=-0.3)   # small centre air-intake light
    # mirrors on stalks with glass faces
    for sd in (1, -1):
        b.tube([(sd * 0.22, 0.98, 0.70), (sd * 0.30, 1.02, 0.66)], 0.01, "carbon", seg=5)
        b.box((sd * 0.33, 1.03, 0.65), (0.11, 0.055, 0.035), "paint"); b.box((sd * 0.33, 1.03, 0.630), (0.09, 0.04, 0.006), "chrome")
    # clip-on bars, grips, levers, chrome bar ends; instrument pod
    for sd in (1, -1):
        b.tube([(sd * 0.10, 0.94, 0.46), (sd * 0.30, 0.92, 0.40)], 0.014, "carbon", seg=6)
        b.cyl((sd * 0.33, 0.92, 0.39), 0.019, 0.08, "interior", axis="x", seg=8)
        b.cyl((sd * 0.375, 0.92, 0.39), 0.016, 0.02, "chrome", axis="x", seg=8)
        b.tube([(sd * 0.27, 0.935, 0.42), (sd * 0.33, 0.94, 0.47)], 0.006, "rim", seg=4)
    b.box((0, 0.99, 0.53), (0.16, 0.05, 0.08), "interior", rot_x=-0.6)
    # seat (rider) and the pillion cowl
    b.ellipsoid((0, 0.858, -0.34), 0.145, 0.035, 0.22, "interior", seg=14, rings=6)
    # foot pegs + hangers
    for sd in (1, -1):
        b.cyl((sd * 0.21, 0.36, -0.32), 0.012, 0.08, "rim", axis="x", seg=6); b.box((sd * 0.17, 0.42, -0.34), (0.02, 0.14, 0.06), "rim")
    # tail lamp: red emitter behind a glossy lens (MBX), plus small indicator-style strip
    b.box((0, 0.878, -1.03), (0.12, 0.038, 0.03), "tail")
    # ---- rider in a sport tuck: blue suit, yellow full-face helmet with the visor down, black gloves and boots ----
    b.ellipsoid((0, 0.93, -0.33), 0.165, 0.11, 0.14, "suit", seg=12, rings=7)                        # hips
    b.tube([(0, 0.96, -0.30), (0, 1.07, -0.13), (0, 1.13, 0.03)], 0.14, "suit", seg=12)            # back, leaning forward
    b.ellipsoid((0, 1.12, 0.06), 0.21, 0.085, 0.11, "suit", seg=12, rings=6)                        # shoulders
    b.ellipsoid((0, 1.06, -0.12), 0.155, 0.13, 0.17, "suit", seg=12, rings=7)                       # chest
    b.ellipsoid((0, 1.105, -0.14), 0.05, 0.08, 0.2, "stripe", seg=8, rings=5)                         # white back stripe (aero hump)
    b.cyl((0, 1.17, 0.12), 0.05, 0.08, "suit", axis="y", seg=8)                                       # neck
    b.ellipsoid((0, 1.275, 0.21), 0.13, 0.135, 0.155, "helmet", seg=16, rings=10)                     # helmet (top ~1.41)
    b.box((0, 1.275, 0.352), (0.18, 0.07, 0.03), "glass", rot_x=0.25)                                 # visor down
    b.box((0, 1.405, 0.20), (0.035, 0.016, 0.22), "stripe")                                           # helmet stripe
    b.box((0, 1.33, 0.05), (0.07, 0.03, 0.06), "helmet", rot_x=-0.3)                                  # little rear spoiler on the helmet
    for sd in (1, -1):
        b.tube([(sd * 0.19, 1.10, 0.06), (sd * 0.26, 1.00, 0.22), (sd * 0.31, 0.94, 0.37)], 0.045, "suit", seg=8)   # arms
        b.ellipsoid((sd * 0.325, 0.935, 0.395), 0.04, 0.04, 0.055, "interior", seg=8, rings=5)                     # gloves
        b.tube([(sd * 0.13, 0.92, -0.30), (sd * 0.24, 0.80, -0.12), (sd * 0.29, 0.70, 0.02)], 0.068, "suit", seg=8)  # thighs
        b.ellipsoid((sd * 0.295, 0.70, 0.03), 0.05, 0.06, 0.06, "stripe", seg=8, rings=5)                         # knee slider
        b.tube([(sd * 0.29, 0.70, 0.02), (sd * 0.24, 0.52, -0.16), (sd * 0.21, 0.41, -0.29)], 0.052, "suit", seg=8)  # shins
        b.box((sd * 0.205, 0.39, -0.31), (0.08, 0.11, 0.21), "interior", rot_x=0.2)                               # boots
    return b, C, exh_tip

def add_bike_wheels(body_ob):
    for name, W_, front in (("FL", WF, True), ("RL", WR, False)):
        hub = bpy.data.objects.new("hub_" + name, None); scene.collection.objects.link(hub)
        hub.parent = body_ob; hub.location = B((0, W_["r"], W_["z"]))
        bike_wheel(W_, front).to_obj("wheel_" + name, smooth_angle=50, parent=hub)
        bike_calipers(front).to_obj("caliper_" + name, smooth_angle=30, parent=hub)
        if front: fork_mesh().to_obj("fork_" + name, smooth_angle=40, parent=hub)

def build_bike():
    S = dict(paint=PAINT, stripe="#f4f4f2", mats={"helmet": (HELMET, 0.25, 0.1), "suit": (SUIT, 0.7, 0.0)})
    new_scene(S)
    b, C, exh_tip = build_body()
    body_ob = b.to_obj("body", smooth_angle=55)
    add_bike_wheels(body_ob)
    root = bpy.data.objects.new(NAME, None); scene.collection.objects.link(root); body_ob.parent = root
    tris = 0
    for ob in scene.collection.objects:
        if ob.type == "MESH":
            ob.data.calc_loop_triangles(); tris += len(ob.data.loop_triangles)
            if os.environ.get("GP_DEBUG_VIEWS"): print("TRIS", ob.name, len(ob.data.loop_triangles))
    out = os.path.join(OUTDIR, NAME + ".glb")
    bpy.ops.export_scene.gltf(filepath=out, export_format="GLB", export_apply=True, export_yup=True,
                              export_texcoords=True, export_normals=True, export_materials="EXPORT",
                              export_cameras=False, export_lights=False, export_animations=False)
    ys = [v[1] for v in b.v]; zs = [v[2] for v in b.v]; xs = [abs(v[0]) for v in b.v]
    tl = b.tris_of("tail") + b.tris_of("taillens")
    st = dict(n="Lightning Bike", bytes=os.path.getsize(out), tris=tris, len=round(max(max(zs), WF["z"] + WF["r"]) - min(min(zs), WR["z"] - WR["r"]), 3),
              w=round(2 * max(xs), 3), ride=0.16, rad=WF["r"], radR=WR["r"], twF=WF["w"], twR=WR["w"], tyreX=0.0, tyreXF=0.0,
              xf=WF["z"], xr=WR["z"], tail=round(min(v[2] for v in tl), 3), nose=round(max(max(zs), WF["z"] + WF["r"]), 3), pivotY=0.001,
              roofY=round(max(ys), 3), glows=[[0.0, 0.878, 0.2, 0.09]], sticker=[0.27, 0.62, 0.20, 0.0], wing=False,
              eye=[0.0, 1.30, 0.30], exh=[exh_tip], hl=C.hl, bike=True)
    print("BUILT", NAME, st["bytes"], "bytes", tris, "tris", "len", st["len"], "w", st["w"], "roofY", st["roofY"], "hl", C.hl)
    return st

st = build_bike()
if RENDER:
    CAM = 0.52
    VIEWS.update({"side": (7.5, 0.9, 0.0, 0.0, 0.62, 0.0), "lean": (3.0, 1.2, 5.5, 0.0, 0.6, 0.0)})
    render(NAME)
if NAME == "bike":
    fleet = json.load(open(JSON)) if os.path.exists(JSON) else {}
    fleet["bike"] = st
    with open(JSON, "w") as f:
        f.write("{\n" + ",\n".join('  "%s": %s' % (k, json.dumps(v, separators=(",", ":"))) for k, v in fleet.items()) + "\n}\n")
    print("FLEET", JSON, "bike", st["bytes"], st["tris"])
