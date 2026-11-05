# Grand Fable GP - Rosso Falcon #7 GT race car, built headless in Blender 4.2 and exported to GLB.
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
L = 4.70; HW = 1.02
ZN, ZT = 2.35, -2.26
FLOOR = 0.13
WF = dict(z=1.45, r=0.37, w=0.30); WR = dict(z=-1.45, r=0.39, w=0.38)
for W_ in (WF, WR): W_["x"] = HW - 0.02 - W_["w"] / 2   # tyre outer face 2 cm inside the fender lip

def lerp(a, b, t): return a + (b - a) * t
def keys(K, z):
    if z <= K[0][0]: return K[0][1]
    for i in range(1, len(K)):
        if z <= K[i][0]:
            t = (z - K[i-1][0]) / (K[i][0] - K[i-1][0]); t = t * t * (3 - 2 * t)
            return lerp(K[i-1][1], K[i][1], t)
    return K[-1][1]
def bump(d, R):  # smooth 1 -> 0 over |d| in [0,R]
    if abs(d) >= R: return 0.0
    t = abs(d) / R; return (1 - t * t) ** 2

# centre-line top (hood / windscreen / roof / fastback / deck)
TOP = [(-2.26, 0.90), (-2.12, 0.885), (-1.9, 0.89), (-1.55, 0.93), (-0.9, 1.10), (-0.55, 1.15), (0.0, 1.14), (0.32, 1.02), (0.78, 0.76),
       (1.5, 0.66), (2.0, 0.56), (2.25, 0.46), (2.35, 0.38)]
# shoulder / belt line (fender tops bulge over both axles)
BELT = [(-2.26, 0.86), (-1.9, 0.88), (-1.45, 0.92), (-0.75, 0.82), (0.0, 0.76), (0.8, 0.76), (1.45, 0.84), (2.0, 0.70), (2.35, 0.40)]
# half width: wide hips, slight coke-bottle waist, rounded nose
WID = [(-2.26, 0.90), (-2.1, 0.97), (-1.85, 1.01), (-1.45, 1.02), (-0.6, 0.97), (0.3, 0.96), (1.1, 1.0), (1.45, 1.02), (1.95, 0.99), (2.2, 0.93), (2.35, 0.80)]
CAB = [(-1.7, 0.0), (-1.45, 1.0), (0.55, 1.0), (0.8, 0.0)]          # 1 = greenhouse
ROOFW = [(-1.6, 0.66), (-0.8, 0.56), (0.0, 0.58), (0.7, 0.70)]   # roof half width

def hw(z): return keys(WID, z)
def arch_y(z):
    """bottom edge of the body side: sill height, rising to the wheel-arch lip over each wheel"""
    y = FLOOR + 0.07
    for W_ in (WF, WR):
        d = z - W_["z"]; R = W_["r"] + 0.13
        if abs(d) < R:
            t = math.sqrt(max(0.0, 1 - (d / R) ** 2))
            y = max(y, lerp(FLOOR + 0.07, 2 * W_["r"] + 0.06, t ** 0.55))
    if z < WR["z"]:   # open GT3-style rear: the body stays up behind the rear wheels so the fat tyres show from behind
        k = min(1.0, (WR["z"] - z) / (WR["z"] - ZT)); y = lerp(2 * WR["r"] + 0.06, 0.58, k ** 0.8)
    return y
def floor_in(z):
    f = hw(z) - 0.12
    for W_ in (WF, WR):
        f = lerp(f, min(f, W_["x"] - W_["w"] / 2 - 0.06), max(0, min(1, (W_["r"] + 0.16 - abs(z - W_["z"])) / 0.05)))
    if z < WR["z"]: f = min(f, WR["x"] - WR["w"] / 2 - 0.06)
    return f

def section(z):
    """half cross-section from bottom centre to top centre: list of (x, y, tag)"""
    w = hw(z); top = keys(TOP, z); belt = max(keys(BELT, z), arch_y(z) + 0.06); cab = keys(CAB, z)
    sb = arch_y(z); fi = floor_in(z)
    fl = FLOOR + max(0.0, (z - 1.9)) * 0.25          # splitter lip rises a touch at the very nose
    if z < WR["z"] - 0.1:                             # diffuser ramp: the floor sweeps up behind the rear axle
        k = min(1.0, (WR["z"] - 0.1 - z) / (WR["z"] - 0.1 - ZT)); fl = FLOOR + 0.24 * k ** 1.3
    pts = []
    pts.append((0.0, fl, "floor"))
    pts.append((fi * 0.5, fl, "floor"))
    pts.append((fi, fl, "floor"))
    pts.append((fi, max(fl + 0.01, sb - 0.03), "well"))   # inner wheel-well wall (vertical at the arches)
    pts.append((w - 0.035, sb, "sill"))
    pts.append((w, lerp(sb, belt, 0.40), "side"))
    pts.append((w - 0.008, lerp(sb, belt, 0.78), "side"))
    pts.append((w - 0.05, belt, "shoulder"))
    # top: window base -> roof edge -> stripes -> centre
    rw = keys(ROOFW, z)
    ytop = top
    hood_x = w - 0.16
    y6 = belt + 0.015 if cab > 0.02 else lerp(belt - 0.01, ytop, 0.35)
    x7 = lerp(min(hood_x - 0.08, 0.62), rw, cab)
    y7 = lerp(lerp(belt, ytop, 0.75), ytop - 0.06, cab)
    pts.append((hood_x, y6, "winbase"))
    pts.append((x7, y7, "roofedge"))
    pts.append((0.32, ytop - 0.012 - 0.01 * (1 - cab), "top"))
    pts.append((0.20, ytop - 0.004, "stripe"))
    pts.append((0.05, ytop, "stripe"))
    pts.append((0.0, ytop, "top"))
    # tail: round the last few centimetres so the rear corners are not a sharp box
    if z < ZT + 0.14:
        k = (ZT + 0.14 - z) / 0.14
        pts = [(x * (1 - 0.05 * k * k) if x > 0.3 else x, y - (0.035 * k * k if y > 0.7 else 0.0), tg) for (x, y, tg) in pts]
    # nose: pull the section in so the front is rounded in plan and profile
    if z > 2.05:
        k = (z - 2.05) / (ZN - 2.05)
        mid = 0.36
        out = []
        for (x, y, tg) in pts:
            x2 = x * (1 - 0.18 * k * k)
            y2 = lerp(y, mid + (y - mid) * 0.55, k ** 1.6) if y > mid else lerp(y, max(y, FLOOR + 0.03 * k), k)
            out.append((x2, y2, tg))
        pts = out
    return pts

# stations: dense where things change
zs = []
z = ZT
while z < ZN - 1e-6:
    dense = any(abs(z - W_["z"]) < W_["r"] + 0.22 for W_ in (WF, WR)) or z > 2.0 or z < -2.15
    zs.append(z); z += 0.03 if dense else 0.045
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
    if t0 == "floor" or t0 == "well": return "carbon"
    if t0 == "sill" and arch_y(zc) < 0.3: return "carbon" if False else "paint"
    if t0 == "winbase" and t1 == "roofedge":
        if -1.38 < zc < 0.5 and cab > 0.6: return "glass"
        return "paint"
    top = keys(TOP, zc)
    windscreen = 0.08 < zc < 0.74
    rearglass = -1.42 < zc < -0.62
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
# tail cap (rear panel) and nose cap
# rear panel: horizontal bands between the mirrored section points (dark below the light line, paint above)
R_, L_, s_, z_ = rings[0]
for i in range(NP - 1):
    if s_[i][0] < 1e-6 and s_[i + 1][0] < 1e-6: continue
    ym = (s_[i][1] + s_[i + 1][1]) / 2
    q = [R_[i], L_[i], L_[i + 1], R_[i + 1]] if s_[i][0] > 1e-6 else [R_[i], L_[i + 1], R_[i + 1]]
    if s_[i + 1][0] < 1e-6: q = [R_[i], L_[i], R_[i + 1]]
    body.face(q, "carbon" if ym < 0.56 else "paint")
for (R_, L_, s_, z_), flip in ((rings[-1], True),):
    loop = R_ + list(reversed(L_[1:-1]))
    c = body.vert((0, sum(p[1] for p in s_) / len(s_), z_ + (0.0 if not flip else 0.0)))
    for i in range(len(loop)):
        j = (i + 1) % len(loop)
        f = [loop[i], loop[j], c] if flip else [loop[j], loop[i], c]
        body.face(f, "paint")

# ---- aero + detail parts (all part of the body mesh)
# front splitter, side skirts, rear diffuser with fins
body.box((0, FLOOR - 0.005, 2.1), (1.86, 0.035, 0.5), "carbon")
for sd in (-1, 1):
    body.box((sd * (HW - 0.05), FLOOR + 0.03, 0.03), (0.08, 0.06, 2.0), "carbon")
for k in range(-2, 3):
    body.box((k * 0.24, 0.25, ZT + 0.2), (0.025, 0.1, 0.42), "carbon", rot_x=0.4)
# front grille (dark mouth), canards
body.box((0, 0.27, 2.31), (1.1, 0.12, 0.06), "carbon")
for sd in (-1, 1):
    body.box((sd * 0.78, 0.34, 2.15), (0.24, 0.02, 0.18), "carbon", rot_x=0.2)
# headlights: slim LED strips raked along the nose
for sd in (-1, 1):
    x0 = 0.62
    body.box((sd * x0, 0.55, 2.13), (0.42, 0.045, 0.16), "lamp", rot_x=-0.35)
# rear light bar + rain light (brake lights)
body.box((0, 0.775, ZT - 0.014), (1.5, 0.04, 0.03), "tail")
for sd in (-1, 1):
    body.box((sd * 0.68, 0.72, ZT - 0.016), (0.34, 0.12, 0.034), "tail")
    body.box((sd * 0.68, 0.72, ZT - 0.006), (0.4, 0.17, 0.02), "carbon")
body.box((0, 0.5, ZT - 0.03), (0.18, 0.09, 0.05), "tail")          # centre rain light
body.box((0, 0.6, ZT - 0.006), (0.7, 0.08, 0.02), "carbon")        # rear vent
# exhausts
for sd in (-1, 1):
    body.cyl((sd * 0.3, 0.44, ZT - 0.03), 0.062, 0.14, "carbon", axis="z", seg=12)
    body.cyl((sd * 0.3, 0.44, ZT - 0.095), 0.048, 0.01, "carbon", axis="z", seg=12)
# big rear wing: end plates, main plane, gurney flap, swan-neck pylons
WZ, WY = -2.02, 1.24
body.box((0, WY, WZ), (1.92, 0.04, 0.42), "carbon", rot_x=-0.1)
body.box((0, WY + 0.03, WZ - 0.21), (1.92, 0.05, 0.02), "carbon")
for sd in (-1, 1):
    body.box((sd * 0.97, WY - 0.06, WZ - 0.02), (0.03, 0.3, 0.56), "paint")
    body.box((sd * 0.97, WY - 0.06, WZ - 0.02), (0.035, 0.05, 0.5), "stripe")
    body.box((sd * 0.36, (WY + 0.84) / 2, WZ + 0.06), (0.04, WY - 0.84, 0.12), "carbon", rot_x=0.25)
# mirrors
for sd in (-1, 1):
    body.box((sd * 1.0, 0.9, 0.36), (0.17, 0.09, 0.13), "paint")
    body.box((sd * 1.0, 0.9, 0.29), (0.15, 0.07, 0.012), "carbon")
    body.box((sd * 0.9, 0.84, 0.38), (0.1, 0.06, 0.05), "carbon")
# roof scoop + shark fin
body.box((0, 1.18, -0.05), (0.32, 0.07, 0.3), "carbon", taper=0.8)
body.box((0, 1.1, -1.25), (0.03, 0.16, 0.9), "paint")
# hood vents
for sd in (-1, 1):
    body.box((sd * 0.4, 0.705, 1.15), (0.36, 0.02, 0.32), "carbon", rot_x=0.12)

# number roundels on both doors and on the hood (textured quads sitting just proud of the paint)
def decal(center, normal_x, size, upz=None):
    cx, cy, cz = center; h = size / 2
    if upz is None:   # door (faces +x or -x)
        sx = normal_x
        p = [(cx, cy - h, cz - h * sx), (cx, cy - h, cz + h * sx), (cx, cy + h, cz + h * sx), (cx, cy + h, cz - h * sx)]
        p = [(cx, cy - h, cz + h * -sx * -1), (cx, cy - h, cz - h * sx * -1), (cx, cy + h, cz - h * sx * -1), (cx, cy + h, cz + h * -sx * -1)]
        # x stays fixed; order so the normal points outward and the 7 reads front-to-back
        if sx > 0: p = [(cx, cy - h, cz - h), (cx, cy - h, cz + h), (cx, cy + h, cz + h), (cx, cy + h, cz - h)]
        else:      p = [(cx, cy - h, cz + h), (cx, cy - h, cz - h), (cx, cy + h, cz - h), (cx, cy + h, cz + h)]
        uv = [(1, 0), (0, 0), (0, 1), (1, 1)]
    else:             # hood (faces up, readable from the front)
        y = cy
        p = [(cx + h, y, cz - h), (cx - h, y, cz - h), (cx - h, y + 0.0, cz + h), (cx + h, y, cz + h)]
        uv = [(0, 0), (1, 0), (1, 1), (0, 1)]
        p = [(cx - h, y, cz - h), (cx + h, y, cz - h), (cx + h, y, cz + h), (cx - h, y, cz + h)]
        uv = [(0, 0), (1, 0), (1, 1), (0, 1)]
    idx = [body.vert(q) for q in p]
    body.face(idx, "decal", uv)

DZ = -0.15
sec = section(DZ); sb = arch_y(DZ); belt = keys(BELT, DZ)
dy = lerp(sb, belt, 0.55)
for sd in (-1, 1):
    decal((sd * (hw(DZ) + 0.012), dy, DZ), sd, 0.42)
decal((0, keys(TOP, 1.25) + 0.012, 1.25), 0, 0.38, upz=True)

body_ob = body.to_obj("body", smooth_angle=50)

# ---------------------------------------------------------------- wheels
def wheel_mesh(W_, side):
    r, tw = W_["r"], W_["w"]; mb = MB(); seg = 32
    o = side  # +1 = outer face toward +x
    # tyre: lathe profile (x across tread, radius); outer and inner sidewalls + rounded tread shoulders
    prof = [(-tw / 2, r * 0.70), (-tw / 2 - 0.004, r * 0.80), (-tw / 2 + 0.002, r * 0.92), (-tw / 2 + 0.03, r * 0.995), (-tw / 2 + 0.07, r),
            (tw / 2 - 0.07, r), (tw / 2 - 0.03, r * 0.995), (tw / 2 - 0.002, r * 0.92), (tw / 2 + 0.004, r * 0.80), (tw / 2, r * 0.70)]
    rings_ = []
    for (px, pr) in prof:
        ring = []
        for i in range(seg):
            a = 2 * math.pi * i / seg
            ring.append(mb.vert((px * o, math.cos(a) * pr, math.sin(a) * pr)))
        rings_.append(ring)
    for k in range(len(prof) - 1):
        tread = 3 <= k <= 5
        for i in range(seg):
            j = (i + 1) % seg
            q = [rings_[k][i], rings_[k][j], rings_[k + 1][j], rings_[k + 1][i]]
            if o < 0: q = q[::-1]
            mb.face(q[::-1], "tyre")
    # rim barrel (dark) and outer lip
    rr = r * 0.70; xo = (tw / 2 - 0.01) * o; xi = (-tw / 2 + 0.03) * o
    mb.cyl(((xo + xi) / 2, 0, 0), rr, abs(xo - xi), "rimdark", axis="x", seg=seg, cap=False)
    # dish behind the spokes (dark) so the spokes read against it
    mb.cyl((xo - 0.05 * o, 0, 0), rr * 0.98, 0.012, "rimdark", axis="x", seg=seg)
    # brake disc
    mb.cyl((xo - 0.1 * o, 0, 0), rr * 0.82, 0.03, "rimdark", axis="x", seg=24)
    # 10 split spokes (5 pairs) in bright machined silver, centre-lock hub
    for k in range(5):
        for dd in (-0.13, 0.13):
            a = 2 * math.pi * k / 5 + dd
            c = (xo - 0.02 * o, math.cos(a) * rr * 0.52, math.sin(a) * rr * 0.52)
            # spoke as a thin box oriented radially
            ca, sa = math.cos(a), math.sin(a)
            ln = rr * 0.9; wd = 0.05; th = 0.03
            base = []
            for (u, v, w) in [(-th, -wd, -ln / 2), (th, -wd, -ln / 2), (th, wd, -ln / 2), (-th, wd, -ln / 2), (-th, -wd, ln / 2), (th, -wd, ln / 2), (th, wd, ln / 2), (-th, wd, ln / 2)]:
                # local: u along x, v tangential, w radial
                y = w * ca - v * sa; z = w * sa + v * ca
                base.append(mb.vert((c[0] + u, c[1] + y, c[2] + z)))
            for f in [(0,3,2,1),(4,5,6,7),(0,1,5,4),(2,3,7,6),(1,2,6,5),(0,4,7,3)]:
                mb.face([base[i] for i in f], "rim")
    mb.cyl((xo - 0.01 * o, 0, 0), rr * 0.2, 0.06, "rim", axis="x", seg=12)
    mb.cyl((xo + 0.02 * o, 0, 0), rr * 0.1, 0.03, "rim", axis="x", seg=6)    # centre-lock nut (yellow)
    mb.cyl((xo + 0.005 * o, 0, 0), rr * 1.0, 0.014, "rim", axis="x", seg=seg, r2=rr * 1.03, cap=False)  # polished lip
    return mb

def caliper_mesh(W_, side, front):
    r, tw = W_["r"], W_["w"]; mb = MB(); rr = r * 0.70; xo = (tw / 2 - 0.01) * side
    # caliper sits at the back of the disc (toward -z for front, -z for rear too), clamping the disc edge
    ang = math.radians(200 if front else 160)
    cy, cz = math.sin(ang) * rr * 0.72, math.cos(ang) * rr * 0.72
    mb.box((xo - 0.1 * side, cy, cz), (0.07, 0.2, 0.12), "caliper")
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
