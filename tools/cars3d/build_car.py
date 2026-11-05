# Grand Fable GP - Rosso Falcon #7 GT race car (v3: rounded body, haunches, deep tyres, recessed rims), built headless in Blender 4.2 and exported to GLB.
# Run: Blender -b -P build_car.py -- <out.glb> [render_dir]
# Everything is modelled in GAME coordinates (x = right, y = up, z = forward/nose, metres) and mapped to
# Blender (x, -z, y) so the glTF export (+Y up) comes back out exactly in game coordinates.
# Node layout (names are what race3d.js looks for):
#   falcon (root)
#     body                 all bodywork, glass, wing, lights (one mesh, one primitive per material)
#     hub_FL/FR/RL/RR      empties at each wheel centre (front hubs steer about y)
#       wheel_XX           tyre + rim + disc (spins about x)
#       caliper_XX         red brake caliper (does not spin)
import bpy, bmesh, math, sys, os
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = argv[0] if argv else "/tmp/falcon.glb"
RENDER = argv[1] if len(argv) > 1 else None
HERE = os.path.dirname(os.path.abspath(__file__))

# ---------------------------------------------------------------- scene reset
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

def B(p):  # game -> blender
    return Vector((p[0], -p[2], p[1]))

# ---------------------------------------------------------------- materials
def mat(name, col, rough=0.5, metal=0.0, emit=None, emit_str=0.0, alpha=None, tex=None):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*col, 1)
    bsdf.inputs["Roughness"].default_value = rough
    bsdf.inputs["Metallic"].default_value = metal
    if emit:
        bsdf.inputs["Emission Color"].default_value = (*emit, 1)
        bsdf.inputs["Emission Strength"].default_value = emit_str
    if tex:
        img = bpy.data.images.load(tex)
        tn = m.node_tree.nodes.new("ShaderNodeTexImage"); tn.image = img
        m.node_tree.links.new(tn.outputs["Color"], bsdf.inputs["Base Color"])
        m.node_tree.links.new(tn.outputs["Alpha"], bsdf.inputs["Alpha"])
        m.blend_method = "CLIP"; m.alpha_threshold = 0.5
    return m

def srgb(h):
    h = h.lstrip("#"); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple((x / 12.92) if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c)

M = {
    "paint": mat("paint", srgb("#d1121c"), 0.28, 0.1),
    "stripe": mat("stripe", srgb("#f4f4f2"), 0.3, 0.0),
    "carbon": mat("carbon", srgb("#15161a"), 0.45, 0.2),
    "glass": mat("glass", srgb("#141c26"), 0.08, 0.3),
    "tyre": mat("tyre", srgb("#1a1a1c"), 0.85, 0.0),
    "tyrewall": mat("tyrewall", srgb("#26272b"), 0.7, 0.0),
    "rim": mat("rim", srgb("#c9ccd2"), 0.25, 0.9),
    "rimdark": mat("rimdark", srgb("#2a2c31"), 0.35, 0.7),
    "disc": mat("disc", srgb("#6c6e72"), 0.4, 0.8),
    "caliper": mat("caliper", srgb("#f2c21b"), 0.4, 0.1),
    "lamp": mat("lamp", srgb("#ffffff"), 0.1, 0.0, emit=(1, 0.97, 0.9), emit_str=2.0),
    "tail": mat("tail", srgb("#b0000a"), 0.25, 0.0, emit=(1, 0.05, 0.03), emit_str=0.6),
    "exhaust": mat("exhaust", srgb("#2b2b2e"), 0.4, 0.6),
    "spoke": mat("spoke", srgb("#3a3d44"), 0.35, 0.6),
    "decal": mat("decal", (1, 1, 1), 0.35, 0.0, tex=os.path.join(HERE, "num7.png")),
}
MAT_ORDER = list(M.keys())

# ---------------------------------------------------------------- mesh builder
class MB:
    def __init__(s): s.v = []; s.f = []; s.fm = []; s.uv = []
    def vert(s, p): s.v.append(tuple(p)); return len(s.v) - 1
    def face(s, idx, m, uv=None):
        s.f.append(list(idx)); s.fm.append(m); s.uv.append(uv)
    def to_obj(s, name, smooth_angle=40, parent=None, loc=(0, 0, 0)):
        me = bpy.data.meshes.new(name)
        me.from_pydata([B(p) for p in s.v], [], s.f)
        used = []
        for f_m in s.fm:
            if f_m not in used: used.append(f_m)
        used.sort(key=MAT_ORDER.index)
        for u in used: me.materials.append(M[u])
        for poly, f_m in zip(me.polygons, s.fm): poly.material_index = used.index(f_m)
        if any(u is not None for u in s.uv):
            uvl = me.uv_layers.new(name="UVMap")
            for poly, u in zip(me.polygons, s.uv):
                for li, lo in enumerate(poly.loop_indices):
                    uvl.data[lo].uv = u[li] if u else (0.5, 0.5)
        me.validate(); me.update()
        bm = bmesh.new(); bm.from_mesh(me)
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
        bm.to_mesh(me); bm.free(); me.update()
        ob = bpy.data.objects.new(name, me); scene.collection.objects.link(ob)
        for p in me.polygons: p.use_smooth = True
        bpy.context.view_layer.objects.active = ob; ob.select_set(True)
        bpy.ops.object.shade_smooth_by_angle(angle=math.radians(smooth_angle))
        ob.select_set(False)
        ob.location = B(loc)
        if parent: ob.parent = parent
        return ob
    def box(s, c, size, m, rot_x=0.0, taper=1.0):
        """axis-aligned box centred at c (game coords), optional pitch about x and top taper"""
        cx, cy, cz = c; hx, hy, hz = size[0] / 2, size[1] / 2, size[2] / 2
        pts = []
        for (sx, sy, sz) in [(-1,-1,-1),(1,-1,-1),(1,1,-1),(-1,1,-1),(-1,-1,1),(1,-1,1),(1,1,1),(-1,1,1)]:
            x, y, z = sx * hx * (taper if sy > 0 else 1), sy * hy, sz * hz
            if rot_x:
                y, z = y * math.cos(rot_x) - z * math.sin(rot_x), y * math.sin(rot_x) + z * math.cos(rot_x)
            pts.append(s.vert((cx + x, cy + y, cz + z)))
        q = [(0,3,2,1),(4,5,6,7),(0,1,5,4),(2,3,7,6),(1,2,6,5),(0,4,7,3)]
        for f in q: s.face([pts[i] for i in f], m)
    def cyl(s, c, r, length, m, axis="z", seg=16, r2=None, cap=True):
        r2 = r if r2 is None else r2
        ring = []
        for e, rr in ((-1, r), (1, r2)):
            rr_ = []
            for i in range(seg):
                a = 2 * math.pi * i / seg; u, w = math.cos(a) * rr, math.sin(a) * rr; h = e * length / 2
                if axis == "z": p = (c[0] + u, c[1] + w, c[2] + h)
                elif axis == "x": p = (c[0] + h, c[1] + u, c[2] + w)
                else: p = (c[0] + u, c[1] + h, c[2] + w)
                rr_.append(s.vert(p))
            ring.append(rr_)
        for i in range(seg):
            j = (i + 1) % seg
            s.face([ring[0][i], ring[0][j], ring[1][j], ring[1][i]], m)
        if cap:
            s.face(list(reversed(ring[0])), m); s.face(ring[1], m)

# ---------------------------------------------------------------- dimensions (match GP_SHAPE.super)
# v3: rounder, lower body. Every cross-section is a smooth curve (sill tucks under, side bulges, shoulder rolls over into a
# fender crown), the rear fenders rise into haunches above the deck and the front fenders above the hood (Ferrari-style
# valleys), the cabin narrows (tumblehome) and the tail corners are rounded in plan and profile.
L = 4.70; HW = 1.05
ZN, ZT = 2.35, -2.30
FLOOR = 0.11
WF = dict(z=1.45, r=0.37, w=0.30); WR = dict(z=-1.42, r=0.39, w=0.38)
WF["x"] = 1.00 - 0.015 - WF["w"] / 2     # tyre outer face 1.5 cm inside the fender: wide track, wheels fill the arches
WR["x"] = 1.05 - 0.015 - WR["w"] / 2
ARCH_GAP = 0.10                           # tyre top to arch lip (room for the body to roll / dive over the wheels)

def lerp(a, b, t): return a + (b - a) * t
def keys(K, z):
    if z <= K[0][0]: return K[0][1]
    for i in range(1, len(K)):
        if z <= K[i][0]:
            t = (z - K[i-1][0]) / (K[i][0] - K[i-1][0]); t = t * t * (3 - 2 * t)
            return lerp(K[i-1][1], K[i][1], t)
    return K[-1][1]

# half width (max, at the side bulge): wide rear hips, waist, front fenders, rounded nose / tail in plan
WID = [(-2.30, 0.86), (-2.22, 0.95), (-2.05, 1.01), (-1.8, 1.045), (-1.42, 1.05), (-1.0, 1.02), (-0.45, 0.945), (0.2, 0.935),
       (0.9, 0.97), (1.45, 1.00), (1.9, 0.98), (2.15, 0.92), (2.35, 0.78)]
# centre-line top: deck / rear glass / roof / windscreen / hood
TOP = [(-2.30, 0.835), (-2.2, 0.87), (-1.9, 0.885), (-1.6, 0.905), (-1.42, 0.93), (-0.9, 1.065), (-0.5, 1.095), (0.0, 1.085),
       (0.3, 1.02), (0.85, 0.745), (1.4, 0.675), (1.9, 0.59), (2.2, 0.49), (2.35, 0.36)]
# fender crown height (about 20 cm in from the side): haunches over the rear wheels, crowns over the front wheels
FPK = [(-2.30, 0.835), (-2.15, 0.92), (-1.9, 0.975), (-1.42, 1.0), (-0.95, 0.9), (-0.4, 0.80), (0.4, 0.78), (1.0, 0.80),
       (1.45, 0.81), (1.9, 0.74), (2.2, 0.59), (2.35, 0.40)]
CAB = [(-1.62, 0.0), (-1.42, 1.0), (0.62, 1.0), (0.86, 0.0)]          # 1 = greenhouse
ROOFW = [(-1.5, 0.56), (-0.8, 0.50), (0.0, 0.52), (0.7, 0.60)]       # roof half width (tumblehome)

def hw(z): return keys(WID, z)
def arch_y(z):
    """bottom edge of the body side: sill height, rising to the wheel-arch lip over each wheel"""
    base = FLOOR + 0.06; y = base
    for W_ in (WF, WR):
        d = z - W_["z"]; R = W_["r"] + 0.15
        if abs(d) < R:
            t = math.sqrt(max(0.0, 1 - (d / R) ** 2))
            y = max(y, lerp(base, 2 * W_["r"] + ARCH_GAP, t ** 0.5))
    if z < WR["z"]:   # open GT-style rear: the haunch stays up behind the rear wheels so the fat tyres show from the chase cam
        k = min(1.0, (WR["z"] - z) / (WR["z"] - ZT)); y = lerp(2 * WR["r"] + ARCH_GAP, 0.70, k ** 0.9)
    return y
def floor_in(z):
    f = hw(z) - 0.12
    for W_ in (WF, WR):
        f = lerp(f, min(f, W_["x"] - W_["w"] / 2 - 0.05), max(0, min(1, (W_["r"] + 0.17 - abs(z - W_["z"])) / 0.05)))
    if z < WR["z"]: f = min(f, WR["x"] - WR["w"] / 2 - 0.05)
    return f

def catmull(p0, p1, p2, p3, t):
    t2, t3 = t * t, t * t * t
    return tuple(0.5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 +
                        (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3) for k in range(2))

SMOOTH_FROM, SMOOTH_TO = 4, 12      # key points 4..12 (sill .. top) get a Catmull-Rom midpoint per span
def section(z):
    """half cross-section from bottom centre to top centre: list of (x, y, tag)"""
    w = hw(z); top = keys(TOP, z); cab = keys(CAB, z)
    sb = arch_y(z); fi = floor_in(z)
    fpk = max(keys(FPK, z), sb + 0.1)
    fl = FLOOR + max(0.0, (z - 1.9)) * 0.25          # splitter lip rises a touch at the very nose
    if z < WR["z"] - 0.1:                             # diffuser ramp: the floor sweeps up behind the rear axle
        k = min(1.0, (WR["z"] - 0.1 - z) / (WR["z"] - 0.1 - ZT)); fl = FLOOR + 0.2 * k ** 1.3
    ym = lerp(sb, fpk, 0.42)
    rw = keys(ROOFW, z)
    pts = [(0.0, fl, "floor"), (fi * 0.5, fl, "floor"), (fi, fl, "floor"),
           (fi, max(fl + 0.01, sb - 0.03), "well"),                 # inner wheel-well wall (vertical at the arches)
           (w - 0.075, sb, "sill"),                                  # sill / arch lip tucks under
           (w - 0.02, lerp(sb, ym, 0.55), "side"),
           (w, ym, "side"),                                          # widest point
           (w - 0.028, lerp(ym, fpk, 0.6), "side"),
           (w - 0.1, fpk - 0.028, "shoulder"),
           (w - 0.21, fpk, "crown")]                                 # fender crown
    # inboard of the crown: hood / deck valley (no cabin) or window base -> roof edge (cabin)
    x10 = lerp(w - 0.37, w - 0.27, cab); y10 = lerp(lerp(fpk, top, 0.45), fpk + 0.006, cab)
    x11 = lerp(0.43, rw, cab);           y11 = lerp(lerp(top, fpk, 0.12), top - 0.055, cab)
    pts += [(x10, y10, "winbase"), (x11, y11, "roofedge"),
            (0.30, top - 0.008 - 0.006 * (1 - cab), "top"), (0.20, top - 0.003, "stripe"), (0.05, top, "stripe"), (0.0, top, "top")]
    # smooth: a Catmull-Rom midpoint in every span between the sill and the top
    out = pts[:SMOOTH_FROM]
    for i in range(SMOOTH_FROM, SMOOTH_TO):
        p0 = pts[max(0, i - 1)]; p1 = pts[i]; p2 = pts[i + 1]; p3 = pts[min(len(pts) - 1, i + 2)]
        m = catmull(p0, p1, p2, p3, 0.5)
        out.append(p1); out.append((m[0], m[1], p1[2]))
    out += pts[SMOOTH_TO:]
    pts = out
    # tail: round the last few centimetres so the rear corners are not a sharp box
    if z < ZT + 0.16:
        k = (ZT + 0.16 - z) / 0.16
        pts = [(x * (1 - 0.06 * k * k) if x > 0.3 else x, y - (0.04 * k * k if y > 0.72 else 0.0), tg) for (x, y, tg) in pts]
    # nose: pull the section in so the front is rounded in plan and profile
    if z > 2.05:
        k = (z - 2.05) / (ZN - 2.05)
        mid = 0.36
        o2 = []
        for (x, y, tg) in pts:
            x2 = x * (1 - 0.18 * k * k)
            y2 = lerp(y, mid + (y - mid) * 0.55, k ** 1.6) if y > mid else lerp(y, max(y, FLOOR + 0.03 * k), k)
            o2.append((x2, y2, tg))
        pts = o2
    return pts

def side_x(z, y):
    """outer body surface x at height y on station z (for decals that follow the curved side)"""
    s = [p for p in section(z) if p[2] in ("sill", "side", "shoulder")]
    for a, b in zip(s, s[1:]):
        if a[1] <= y <= b[1]:
            t = (y - a[1]) / max(1e-6, b[1] - a[1]); return lerp(a[0], b[0], t)
    return hw(z)

# stations: dense where things change
zs = []
z = ZT
while z < ZN - 1e-6:
    dense = any(abs(z - W_["z"]) < W_["r"] + 0.24 for W_ in (WF, WR)) or z > 2.0 or z < -2.1
    zs.append(z); z += 0.03 if dense else 0.05
zs.append(ZN)

body = MB()
NP = len(section(0.0))
rings = []
for z in zs:
    sec = section(z)
    ringR = [body.vert((x, y, z)) for (x, y, tg) in sec]
    ringL = [body.vert((-x, y, z)) if x > 1e-6 else ringR[i] for i, (x, y, tg) in enumerate(sec)]
    rings.append((ringR, ringL, sec, z))

def face_mat(sec, i, z0, z1):
    """material of the quad between section points i..i+1 and stations z0..z1"""
    zc = (z0 + z1) / 2; cab = keys(CAB, zc)
    t0, t1 = sec[i][2], sec[i + 1][2]
    if t0 == "floor": return "carbon"
    if t0 == "well": return "paint" if zc < WR["z"] - WR["r"] - 0.12 else "carbon"   # behind the rear wheels the inner wall is the red bumper side
    if t0 == "winbase":
        if -1.38 < zc < 0.56 and cab > 0.6: return "glass"
        return "paint"
    windscreen = 0.1 < zc < 0.8
    rearglass = -1.38 < zc < -0.66
    if t0 == "stripe" and t1 == "stripe" and not windscreen: return "stripe"
    if t0 in ("roofedge", "top", "stripe") and (windscreen or rearglass): return "glass"
    return "paint"

for a in range(len(rings) - 1):
    R0, L0, s0, z0 = rings[a]; R1, L1, s1, z1 = rings[a + 1]
    for i in range(NP - 1):
        m = face_mat(s0, i, z0, z1)
        body.face([R0[i], R1[i], R1[i + 1], R0[i + 1]], m)       # right side (normals out)
        if not (s0[i][0] < 1e-6 and s0[i + 1][0] < 1e-6):
            body.face([L0[i + 1], L1[i + 1], L1[i], L0[i]], m)   # mirrored
# rear panel: horizontal bands between the mirrored section points (dark below the light line, paint above)
R_, L_, s_, z_ = rings[0]
for i in range(NP - 1):
    if s_[i][0] < 1e-6 and s_[i + 1][0] < 1e-6: continue
    ym_ = (s_[i][1] + s_[i + 1][1]) / 2
    q = [R_[i], L_[i], L_[i + 1], R_[i + 1]] if s_[i][0] > 1e-6 else [R_[i], L_[i + 1], R_[i + 1]]
    if s_[i + 1][0] < 1e-6: q = [R_[i], L_[i], R_[i + 1]]
    body.face(q, "carbon" if ym_ < 0.34 else "paint")
# nose cap
R_, L_, s_, z_ = rings[-1]
loop = R_ + list(reversed(L_[1:-1]))
c = body.vert((0, sum(p[1] for p in s_) / len(s_), z_))
for i in range(len(loop)):
    j = (i + 1) % len(loop)
    body.face([loop[i], loop[j], c], "paint")

# ---- aero + detail parts (all part of the body mesh)
body.box((0, FLOOR - 0.005, 2.1), (1.84, 0.035, 0.5), "carbon")                     # front splitter
for sd in (-1, 1):
    body.box((sd * 0.86, FLOOR + 0.025, 0.03), (0.07, 0.05, 1.9), "carbon")         # side skirts
for k in range(-2, 3):
    body.box((k * 0.22, 0.22, ZT + 0.2), (0.025, 0.1, 0.42), "carbon", rot_x=0.4)   # diffuser fins
body.box((0, 0.27, 2.31), (1.0, 0.11, 0.06), "carbon")                               # front grille (dark mouth)
for sd in (-1, 1):
    body.box((sd * 0.78, 0.33, 2.15), (0.24, 0.02, 0.18), "carbon", rot_x=0.2)       # canards
for sd in (-1, 1):
    body.box((sd * 0.6, 0.5, 2.19), (0.36, 0.04, 0.14), "lamp", rot_x=-0.55)         # slim LED headlights
# rear: full-width light bar on the panel top, LED clusters, rain light, dark vents, twin centre exhausts
body.box((0, 0.785, ZT - 0.012), (1.42, 0.04, 0.03), "tail")
for sd in (-1, 1):
    body.box((sd * 0.6, 0.745, ZT - 0.014), (0.36, 0.08, 0.034), "tail")
    body.box((sd * 0.6, 0.745, ZT - 0.004), (0.42, 0.13, 0.02), "carbon")
    body.box((sd * 0.4, 0.53, ZT - 0.004), (0.34, 0.16, 0.02), "carbon")              # rear vents
    body.box((sd * 0.4, 0.53, ZT - 0.002), (0.3, 0.025, 0.02), "spoke")
body.box((0, 0.6, ZT - 0.03), (0.18, 0.09, 0.05), "tail")                            # centre rain light
for sd in (-1, 1):
    body.cyl((sd * 0.11, 0.4, ZT - 0.03), 0.062, 0.14, "exhaust", axis="z", seg=12)
    body.cyl((sd * 0.11, 0.4, ZT - 0.095), 0.046, 0.01, "carbon", axis="z", seg=12)
# big rear wing: end plates, main plane, gurney flap, swan-neck pylons (rising from the deck valley)
WZ, WY = -2.02, 1.24
body.box((0, WY, WZ), (1.92, 0.04, 0.42), "carbon", rot_x=-0.1)
body.box((0, WY + 0.03, WZ - 0.21), (1.92, 0.05, 0.02), "carbon")
for sd in (-1, 1):
    body.box((sd * 0.97, WY - 0.06, WZ - 0.02), (0.03, 0.3, 0.56), "paint")
    body.box((sd * 0.97, WY - 0.06, WZ - 0.02), (0.035, 0.05, 0.5), "stripe")
    body.box((sd * 0.32, (WY + 0.86) / 2, WZ + 0.06), (0.04, WY - 0.86, 0.12), "carbon", rot_x=0.25)
# mirrors on slim stalks
for sd in (-1, 1):
    body.box((sd * 0.99, 0.9, 0.38), (0.16, 0.085, 0.13), "paint")
    body.box((sd * 0.99, 0.9, 0.31), (0.14, 0.065, 0.012), "carbon")
    body.box((sd * 0.88, 0.85, 0.40), (0.12, 0.03, 0.05), "carbon")
# roof scoop + shark fin
body.box((0, 1.12, -0.05), (0.3, 0.06, 0.3), "carbon", taper=0.8)
body.box((0, keys(TOP, -1.25) + 0.07, -1.3), (0.03, 0.14, 0.8), "paint")
# hood vents (in the hood valley)
for sd in (-1, 1):
    body.box((sd * 0.36, keys(TOP, 1.15) + 0.005, 1.15), (0.3, 0.02, 0.3), "carbon", rot_x=0.12)

# number roundels on both doors (following the curved side) and on the hood
def door_decal(sd, zc, yc, size, n=4):
    h = size / 2; cols = []
    for zi in (zc - h, zc + h):
        col = []
        for k in range(n + 1):
            y = yc - h + size * k / n
            col.append(body.vert((sd * (side_x(zi, y) + 0.012), y, zi)))
        cols.append(col)
    for k in range(n):
        v0, v1 = k / n, (k + 1) / n
        a, b, c_, d = cols[0][k], cols[1][k], cols[1][k + 1], cols[0][k + 1]
        if sd > 0: body.face([a, b, c_, d], "decal", [(1, v0), (0, v0), (0, v1), (1, v1)])
        else:      body.face([b, a, d, c_], "decal", [(1, v0), (0, v0), (0, v1), (1, v1)])
DZ = -0.15
sb0 = arch_y(DZ); ym0 = lerp(sb0, max(keys(FPK, DZ), sb0 + 0.1), 0.42)
for sd in (-1, 1):
    door_decal(sd, DZ, ym0 + 0.02, 0.4)
hz = 1.22; hy = keys(TOP, hz) + 0.01; h = 0.19
idx = [body.vert(q) for q in [(-h, hy, hz - h), (h, hy, hz - h), (h, hy, hz + h), (-h, hy, hz + h)]]
body.face(idx, "decal", [(0, 0), (1, 0), (1, 1), (0, 1)])

body_ob = body.to_obj("body", smooth_angle=62)

# ---------------------------------------------------------------- wheels
def wheel_mesh(W_, side):
    """deep wheel: lathe tyre with bulging sidewalls, rounded shoulders and three tread grooves; the rim face sits ~6 cm
    inside the sidewall (a dish), dark gunmetal spokes run from a proud centre-lock hub back to a polished lip"""
    r, tw = W_["r"], W_["w"]; mb = MB(); seg = 32; o = side
    rr = r * 0.64; s = tw / 0.38; hw_ = tw / 2
    # outer half profile, tread centre -> bead (x across the tyre, radius)
    tread = [(0.0, r)]
    for gx in (0.072 * s,):
        tread += [(gx - 0.010, r), (gx - 0.007, r - 0.013), (gx + 0.007, r - 0.013), (gx + 0.010, r)]
    shoulder = [(hw_ - 0.04, r), (hw_ - 0.014, r - 0.008), (hw_ - 0.002, r - 0.03), (hw_ + 0.008, r - 0.065)]
    wall = [(hw_ + 0.013, r * 0.86), (hw_ + 0.012, r * 0.78), (hw_ + 0.006, r * 0.71), (hw_ - 0.006, rr + 0.004)]
    half = tread + shoulder + wall
    # full profile inner bead -> outer bead; centre groove on the middle
    prof = [(-x, rad, "wall" if x > hw_ - 0.001 else "tyre") for (x, rad) in reversed(half)]
    prof += [(x, rad, "wall" if x > hw_ - 0.001 else "tyre") for (x, rad) in half[1:]]
    rings_ = []
    for (px, pr, tg) in prof:
        ring = [mb.vert((px * o, math.cos(2 * math.pi * i / seg) * pr, math.sin(2 * math.pi * i / seg) * pr)) for i in range(seg)]
        rings_.append(ring)
    for k in range(len(prof) - 1):
        m = "tyrewall" if (prof[k][2] == "wall" and prof[k + 1][2] == "wall") else "tyre"
        for i in range(seg):
            j = (i + 1) % seg
            q = [rings_[k][i], rings_[k][j], rings_[k + 1][j], rings_[k + 1][i]]
            if o < 0: q = q[::-1]
            mb.face(q[::-1], m)
    x_lip = (hw_ - 0.006) * o; x_face = (hw_ - 0.065) * o; x_in = (-hw_ + 0.03) * o; x_hub = (hw_ - 0.028) * o
    mb.cyl(((x_lip + x_in) / 2, 0, 0), rr, abs(x_lip - x_in), "rimdark", axis="x", seg=seg, cap=False)     # barrel
    mb.cyl((x_lip - 0.004 * o, 0, 0), rr * 1.0, 0.012, "rim", axis="x", seg=seg, r2=rr * 0.9, cap=False)   # polished lip (cone)
    mb.cyl(((x_lip + x_face) / 2, 0, 0), rr * 0.9, abs(x_lip - x_face), "spoke", axis="x", seg=seg, cap=False)   # recess wall
    mb.cyl((x_face - 0.03 * o, 0, 0), rr * 0.9, 0.01, "rimdark", axis="x", seg=seg)                         # dark dish
    mb.cyl(((hw_ - 0.13) * o, 0, 0), rr * 0.8, 0.025, "disc", axis="x", seg=24)  # brake disc
    # 10 spokes (5 pairs), concave: from the hub (proud) back to the rim face
    def beam(p0, p1, wd0, wd1, th, tang):
        vs = []
        for (p, wd) in ((p0, wd0), (p1, wd1)):
            for (u, v) in ((-1, -1), (1, -1), (1, 1), (-1, 1)):
                vs.append(mb.vert((p[0] + u * th / 2, p[1] + v * wd / 2 * tang[0], p[2] + v * wd / 2 * tang[1])))
        for f in [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (2, 3, 7, 6), (1, 2, 6, 5), (0, 4, 7, 3)]:
            mb.face([vs[i] for i in f], "spoke")
    for k in range(5):
        for dd in (-0.11, 0.11):
            a = 2 * math.pi * k / 5 + dd; ca, sa = math.cos(a), math.sin(a)
            p0 = (x_hub - 0.005 * o, ca * rr * 0.2, sa * rr * 0.2); p1 = (x_face + 0.006 * o, ca * rr * 0.9, sa * rr * 0.9)
            beam(p0, p1, 0.05, 0.034, 0.024, (-sa, ca))
    mb.cyl((x_hub, 0, 0), rr * 0.24, 0.05, "spoke", axis="x", seg=12)
    mb.cyl((x_hub + 0.028 * o, 0, 0), rr * 0.12, 0.02, "rim", axis="x", seg=6)    # centre-lock nut
    return mb

def caliper_mesh(W_, side, front):
    r, tw = W_["r"], W_["w"]; mb = MB(); rr = r * 0.64; xo = (tw / 2 - 0.115) * side
    ang = math.radians(200 if front else 160)
    cy, cz = math.sin(ang) * rr * 0.68, math.cos(ang) * rr * 0.68
    mb.box((xo, cy, cz), (0.06, 0.2, 0.12), "caliper")
    return mb

for name, W_, side in (("FL", WF, 1), ("FR", WF, -1), ("RL", WR, 1), ("RR", WR, -1)):
    # FL = +x side. In game the car's +x is its LEFT when looking forward along +z with y up (right-handed), so
    # name by game-left = +x.
    hub = bpy.data.objects.new("hub_" + name, None); scene.collection.objects.link(hub)
    hub.location = B((side * W_["x"], W_["r"], W_["z"]))
    wm = wheel_mesh(W_, side).to_obj("wheel_" + name, smooth_angle=35)
    wm.parent = hub
    cm = caliper_mesh(W_, side, name[0] == "F").to_obj("caliper_" + name, smooth_angle=30)
    cm.parent = hub

# root
root = bpy.data.objects.new("falcon", None); scene.collection.objects.link(root)
for ob in list(scene.collection.objects):
    if ob is not root and ob.parent is None: ob.parent = root

# stats
tris = 0
for ob in scene.collection.objects:
    if ob.type == "MESH":
        ob.data.calc_loop_triangles(); tris += len(ob.data.loop_triangles)
print("TRIS", tris)

bpy.ops.export_scene.gltf(filepath=OUT, export_format="GLB", export_apply=True, export_yup=True,
                          export_texcoords=True, export_normals=True, export_materials="EXPORT",
                          export_cameras=False, export_lights=False, export_animations=False)
print("WROTE", OUT, os.path.getsize(OUT))

# ---------------------------------------------------------------- quick look renders
if RENDER:
    os.makedirs(RENDER, exist_ok=True)
    world = bpy.data.worlds.new("w"); scene.world = world; world.use_nodes = True
    bg = world.node_tree.nodes["Background"]; bg.inputs[0].default_value = (0.55, 0.62, 0.72, 1); bg.inputs[1].default_value = 0.9
    sun = bpy.data.lights.new("sun", "SUN"); sun.energy = 3.5
    so = bpy.data.objects.new("sun", sun); scene.collection.objects.link(so); so.rotation_euler = (math.radians(50), 0, math.radians(30))
    ground = bpy.data.meshes.new("g"); ground.from_pydata([(-20, -20, 0), (20, -20, 0), (20, 20, 0), (-20, 20, 0)], [], [(0, 1, 2, 3)])
    go = bpy.data.objects.new("ground", ground); scene.collection.objects.link(go)
    gm = mat("ground", (0.18, 0.18, 0.2), 0.9); ground.materials.append(gm)
    try: scene.render.engine = "BLENDER_EEVEE_NEXT"
    except Exception: scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x, scene.render.resolution_y = 900, 560
    cam = bpy.data.cameras.new("c"); cam.lens = 40
    co = bpy.data.objects.new("cam", cam); scene.collection.objects.link(co); scene.camera = co
    views = {
        "chase": (0.0, 1.85, -7.4, 0.0, 0.7, 0.0),
        "chase_left": (2.6, 1.85, -6.8, 0.0, 0.7, 0.3),
        "front34": (4.6, 1.6, 5.0, 0.0, 0.55, 0.0),
        "side": (7.5, 0.9, 0.0, 0.0, 0.6, 0.0),
        "rear34": (-4.5, 1.9, -5.0, 0.0, 0.6, 0.0),
        "top": (0.01, 9.0, 0.0, 0.0, 0.0, 0.0),
    }
    for nm, (x, y, z, tx, ty, tz) in views.items():
        co.location = B((x, y, z))
        d = B((tx, ty, tz)) - co.location
        co.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
        scene.render.filepath = os.path.join(RENDER, nm + ".png")
        bpy.ops.render.render(write_still=True)
    print("RENDERED", RENDER)
