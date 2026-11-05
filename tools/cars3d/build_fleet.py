# Grand Fable GP - the 3D FLEET (10 cars besides the Rosso Falcon), built headless in Blender 4.2 LTS and exported to GLB.
# Run:  Blender -b -P tools/cars3d/build_fleet.py -- [--out DIR] [--render DIR] [--json PATH] [ids...]
#   ids default to every car; "falcon" only imports assets/cars3d/falcon.glb for renders + stats (never rebuilt here).
# Same conventions as build_car.py: everything is modelled in GAME coordinates (x = car's left side, y up, z = nose, metres)
# and mapped to Blender (x, -z, y) so the glTF export comes back out in game coordinates.
# Node layout (what race3d.js drives):  <id> (root) -> body, hub_FL/FR/RL/RR (empties at the wheel centres, FL = +x),
#   each hub -> wheel_XX (spins about x) + caliper_XX.  Materials are swapped by name in game: paint, stripe, carbon, glass,
#   tyre, tyrewall, rim, rimdark, spoke, disc, caliper, lamp, tail, exhaust, decal, plus the textured `livery` (kept as is).
# Road cars share one parameterised body: smoothed cross-sections (build_car.py's section()) driven by key tables per car;
# the open-wheel formula car is built from its own lofts (tub, sidepods, wings, halo).
import bpy, bmesh, math, sys, os, json
import numpy as np
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, "..", ".."))
argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUTDIR = os.path.join(ROOT, "assets", "cars3d"); RENDER = None; JSON = None; IDS = []
i_ = 0
while i_ < len(argv):
    a_ = argv[i_]
    if a_ in ("--out", "--render", "--json"):
        v_ = argv[i_ + 1]
        if a_ == "--out": OUTDIR = v_
        elif a_ == "--render": RENDER = v_
        else: JSON = v_
        i_ += 2; continue
    IDS.append(a_); i_ += 1
JSON = JSON or os.path.join(OUTDIR, "fleet.json")
PI = math.pi

def B(p): return Vector((p[0], -p[2], p[1]))
def lerp(a, b, t): return a + (b - a) * t
def clamp(x, a=0.0, b=1.0): return max(a, min(b, x))
def keys(K, z):
    if z <= K[0][0]: return K[0][1]
    for i in range(1, len(K)):
        if z <= K[i][0]:
            t = (z - K[i-1][0]) / (K[i][0] - K[i-1][0]); t = t * t * (3 - 2 * t)
            return lerp(K[i-1][1], K[i][1], t)
    return K[-1][1]
def srgb(h):
    h = h.lstrip("#"); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple((x / 12.92) if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c)
def catmull(p0, p1, p2, p3, t):
    t2, t3 = t * t, t * t * t
    return tuple(0.5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 +
                        (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3) for k in range(2))

# ================================================================ textures (numpy -> png, saved next to this script)
def tex_save(path, rgba):
    h, w, _ = rgba.shape
    img = bpy.data.images.new("tmp_tex", w, h, alpha=True)
    img.pixels.foreach_set((np.flipud(rgba).astype(np.float32) / 255.0).ravel())
    img.filepath_raw = path; img.file_format = "PNG"; img.save(); bpy.data.images.remove(img)

KENTE_PNG = os.path.join(HERE, "kente_livery.png")
TEAL_PNG = os.path.join(HERE, "teal_livery.png")
YELLOW_PNG = os.path.join(HERE, "yellow_livery.png")
NUM59_PNG = os.path.join(HERE, "num59.png")
# kente atlas: top 3/4 (v 0.25..1) = a horizontally tiling kente strip band, bottom 1/4 = solid swatches gold | green | black | red
K_GOLD, K_GREEN, K_BLACK, K_RED = (0.125, 0.125), (0.375, 0.125), (0.625, 0.125), (0.875, 0.125)
K_V0, K_V1 = 0.27, 0.98

def make_textures():
    G = (252, 209, 22); GR = (0, 107, 63); R = (206, 17, 38); K = (22, 22, 22)
    a = np.zeros((256, 512, 4), np.uint8); a[..., 3] = 255
    yy, xx = np.mgrid[0:192, 0:64]
    for k, t in enumerate("ABCDACBD"):
        blk = np.zeros((192, 64, 3), np.uint8)
        if t == "A":                                   # gold block with green / red / black weft stripes
            blk[:] = G; m = yy % 24
            blk[(m >= 3) & (m < 8)] = GR; blk[(m >= 12) & (m < 16)] = R; blk[(m >= 19) & (m < 21)] = K
        elif t == "B":                                 # green block with a gold checker
            blk[:] = GR; chk = ((yy // 16 + xx // 16) % 2 == 0)
            blk[chk & (yy >= 32) & (yy < 160)] = G; blk[(yy < 20) | (yy >= 172)] = K
        elif t == "C":                                 # red warp bars (black + gold)
            blk[:] = R; m = xx % 16; blk[m < 5] = K; blk[(m >= 9) & (m < 12)] = G
        else:                                          # black block with gold / green diamonds
            blk[:] = K; cy = (yy % 48) - 24; cx = xx - 32; d = np.abs(cx) + np.abs(cy)
            blk[d < 19] = G; blk[d < 10] = GR
        blk[:, :3] = K if t == "A" else G
        a[:192, k * 64:(k + 1) * 64, :3] = blk
    a[0:7, :, :3] = K; a[7:12, :, :3] = G; a[180:185, :, :3] = G; a[185:192, :, :3] = K
    a[192:, 0:128, :3] = G; a[192:, 128:256, :3] = GR; a[192:, 256:384, :3] = K; a[192:, 384:512, :3] = R
    tex_save(KENTE_PNG, a)
    for path, col in ((TEAL_PNG, (24, 184, 168)), (YELLOW_PNG, (255, 222, 71))):
        s = np.zeros((8, 8, 4), np.uint8); s[..., :3] = col; s[..., 3] = 255; tex_save(path, s)
    # number roundel "59" (white disc, black ring + digits, transparent outside) in the style of num7.png
    N = 256; yy, xx = np.mgrid[0:N, 0:N].astype(np.float32)
    rr = np.hypot(xx - 128, yy - 128)
    img = np.zeros((N, N, 4), np.float32)
    disc = np.clip(119 - rr, 0, 1); ring = np.clip(np.minimum(rr - 107, 119 - rr) + 0.5, 0, 1)
    img[..., :3] = 248; img[..., 3] = disc * 255
    def segs(cx, pts, w=21):
        d = np.full((N, N), 1e9, np.float32)
        for (ax, ay), (bx, by) in zip(pts, pts[1:]):
            ax += cx; bx += cx; ay += 128; by += 128
            vx, vy = bx - ax, by - ay; L2 = max(1e-6, vx * vx + vy * vy)
            t = np.clip(((xx - ax) * vx + (yy - ay) * vy) / L2, 0, 1)
            d = np.minimum(d, np.hypot(xx - ax - t * vx, yy - ay - t * vy))
        return np.clip(w / 2 - d + 0.5, 0, 1)
    five = [(30, -58), (-26, -58), (-28, -6), (10, -12), (28, 6), (30, 34), (14, 56), (-30, 56)]
    nine_a = [(26, -6), (-14, -6), (-30, -24), (-30, -40), (-14, -58), (14, -58), (30, -40), (30, 36), (12, 58), (-28, 58)]
    ink = np.maximum(np.maximum(segs(84, five), segs(172, nine_a)), ring)
    img[..., :3] = img[..., :3] * (1 - ink[..., None]) + 18 * ink[..., None]
    tex_save(NUM59_PNG, np.clip(img, 0, 255).astype(np.uint8))

# ================================================================ scene + materials
scene = None; M = {}; MAT_ORDER = []
def mat(name, col, rough=0.5, metal=0.0, emit=None, emit_str=0.0, tex=None, alpha=False):
    m = bpy.data.materials.new(name); m.use_nodes = True
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
        if not alpha: tn.interpolation = "Linear"
        m.node_tree.links.new(tn.outputs["Color"], bsdf.inputs["Base Color"])
        if alpha:
            m.node_tree.links.new(tn.outputs["Alpha"], bsdf.inputs["Alpha"])
            m.blend_method = "CLIP"; m.alpha_threshold = 0.5
    return m

def new_scene(S):
    global scene, M, MAT_ORDER
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    M = {
        "paint": mat("paint", srgb(S["paint"]), 0.28, 0.1),
        "stripe": mat("stripe", srgb(S.get("stripe", "#f4f4f2")), 0.3, 0.0),
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
        "decal": mat("decal", (1, 1, 1), 0.35, 0.0, tex=S.get("decal_png") or os.path.join(HERE, "num7.png"), alpha=True),
    }
    if S.get("livery"): M["livery"] = mat("livery", (1, 1, 1), 0.35, 0.05, tex=S["livery"])
    MAT_ORDER = list(M.keys())

# ================================================================ mesh builder
class MB:
    def __init__(s): s.v = []; s.f = []; s.fm = []; s.uv = []
    def vert(s, p): s.v.append((float(p[0]), float(p[1]), float(p[2]))); return len(s.v) - 1
    def face(s, idx, m, uv=None):
        if uv is not None and not isinstance(uv[0], (tuple, list)): uv = [tuple(uv)] * len(idx)
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
        if any(u is not None for u in s.uv) or any(u in ("livery", "decal") for u in used):
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
    def box(s, c, size, m, rot_x=0.0, taper=1.0, uv=None, rot_y=0.0):
        """box centred at c (game coords), optional pitch about x (rot_x), yaw about y and top taper"""
        cx, cy, cz = c; hx, hy, hz = size[0] / 2, size[1] / 2, size[2] / 2
        pts = []
        for (sx, sy, sz) in [(-1,-1,-1),(1,-1,-1),(1,1,-1),(-1,1,-1),(-1,-1,1),(1,-1,1),(1,1,1),(-1,1,1)]:
            x, y, z = sx * hx * (taper if sy > 0 else 1), sy * hy, sz * hz
            if rot_x: y, z = y * math.cos(rot_x) - z * math.sin(rot_x), y * math.sin(rot_x) + z * math.cos(rot_x)
            if rot_y: x, z = x * math.cos(rot_y) + z * math.sin(rot_y), -x * math.sin(rot_y) + z * math.cos(rot_y)
            pts.append(s.vert((cx + x, cy + y, cz + z)))
        for f in [(0,3,2,1),(4,5,6,7),(0,1,5,4),(2,3,7,6),(1,2,6,5),(0,4,7,3)]: s.face([pts[i] for i in f], m, uv)
    def obox(s, c, ex, ey, ez, m, uv=None):
        """oriented box: centre c plus half-axis vectors ex, ey, ez"""
        P = []
        for (sx, sy, sz) in [(-1,-1,-1),(1,-1,-1),(1,1,-1),(-1,1,-1),(-1,-1,1),(1,-1,1),(1,1,1),(-1,1,1)]:
            P.append(s.vert(tuple(c[k] + sx * ex[k] + sy * ey[k] + sz * ez[k] for k in range(3))))
        for f in [(0,3,2,1),(4,5,6,7),(0,1,5,4),(2,3,7,6),(1,2,6,5),(0,4,7,3)]: s.face([P[i] for i in f], m, uv)
    def cyl(s, c, r, length, m, axis="z", seg=16, r2=None, cap=True, ry=None, uv=None):
        r2 = r if r2 is None else r2; k_ = 1.0 if ry is None else ry / r
        ring = []
        for e, rr in ((-1, r), (1, r2)):
            rr_ = []
            for i in range(seg):
                a = 2 * math.pi * i / seg; u, w = math.cos(a) * rr, math.sin(a) * rr * k_; h = e * length / 2
                if axis == "z": p = (c[0] + u, c[1] + w, c[2] + h)
                elif axis == "x": p = (c[0] + h, c[1] + u, c[2] + w)
                else: p = (c[0] + u, c[1] + h, c[2] + w)
                rr_.append(s.vert(p))
            ring.append(rr_)
        for i in range(seg):
            j = (i + 1) % seg
            s.face([ring[0][i], ring[0][j], ring[1][j], ring[1][i]], m, uv)
        if cap:
            s.face(list(reversed(ring[0])), m, uv); s.face(ring[1], m, uv)
    def rings(s, R, m, cap0=True, cap1=True, uv=None, cap_m0=None, cap_m1=None):
        """loft closed rings (list of lists of 3D points, same length)"""
        idx = [[s.vert(p) for p in ring] for ring in R]; n = len(R[0])
        for a in range(len(idx) - 1):
            for i in range(n):
                j = (i + 1) % n
                s.face([idx[a][i], idx[a][j], idx[a + 1][j], idx[a + 1][i]], m, uv)
        if cap0: s.face(list(reversed(idx[0])), cap_m0 or m, uv)
        if cap1: s.face(idx[-1], cap_m1 or m, uv)
    def tube(s, path, r, m, seg=6, uv=None):
        """round tube along a polyline (game coords)"""
        P = [Vector(p) for p in path]; R = []
        for k in range(len(P)):
            t = (P[min(k + 1, len(P) - 1)] - P[max(k - 1, 0)]).normalized()
            up = Vector((0, 1, 0)) if abs(t.y) < 0.9 else Vector((1, 0, 0))
            n = t.cross(up).normalized(); b = t.cross(n).normalized()
            R.append([tuple(P[k] + (n * math.cos(2 * PI * i / seg) + b * math.sin(2 * PI * i / seg)) * r) for i in range(seg)])
        s.rings(R, m, uv=uv)
    def ellipsoid(s, c, rx, ry, rz, m, seg=12, rings=8, uv=None):
        R = []
        for k in range(1, rings):
            ph = -PI / 2 + PI * k / rings; cz = math.sin(ph) * rz; rr = math.cos(ph)
            R.append([(c[0] + math.cos(2 * PI * i / seg) * rx * rr, c[1] + math.sin(2 * PI * i / seg) * ry * rr, c[2] + cz) for i in range(seg)])
        idx = [[s.vert(p) for p in ring] for ring in R]
        for a in range(len(idx) - 1):
            for i in range(seg):
                j = (i + 1) % seg; s.face([idx[a][i], idx[a][j], idx[a + 1][j], idx[a + 1][i]], m, uv)
        p0 = s.vert((c[0], c[1], c[2] - rz)); p1 = s.vert((c[0], c[1], c[2] + rz))
        for i in range(seg):
            j = (i + 1) % seg
            s.face([idx[0][j], idx[0][i], p0], m, uv); s.face([idx[-1][i], idx[-1][j], p1], m, uv)
    def tris_of(s, m):
        return [s.v[i] for f, fm in zip(s.f, s.fm) if fm == m for i in f]

# ================================================================ parameterised road-car body (from build_car.py)
BASE = dict(
    FLOOR=0.11, ARCH_GAP=0.09, crown_min=0.10, sill_h=0.06, sill_in=0.075, tumble=1.0, sh_x=0.10, sh_y=0.028, cr_x=0.21,
    ymf=0.42, sharp=0.0, hood_x=0.43, roof_round=0.055, topx=[(0.30, "paint"), (0.20, "paint"), (0.05, "paint")],
    nose_len=0.30, nose_pinch=0.18, nose_mid=0.36, nose_sq=0.55, nose_lift=0.25,
    tail_len=0.16, tail_pinch=0.06, tail_drop=0.04, tail_dropy=0.72,
    rear_open=None, diff=0.2, well_paint_rear=True, f_inset=0.015, r_inset=-0.005,
    windscreen=None, rearglass=None, sideglass=None, side_cab=0.6, BED=None,
    bands=[], dense=[], breaks=[], step_d=0.04, step_s=0.075, smooth=62,
    wheel_style="sport", spokes=5, tread="slick", rimfrac=0.64, wseg=24,
    pivotY=0.3, wing=False, stripe="#f4f4f2", livery=None,
)
TOPINNER = ["crown", "crownm", "winbase", "winbasem", "roofedge", "roofedgem"]

class Car:
    def __init__(s, S):
        s.S = S; s.glows = []; s.sticker = None
        s.WF = dict(S["WF"]); s.WR = dict(S["WR"])
        s.ZN, s.ZT, s.FLOOR = S["ZN"], S["ZT"], S["FLOOR"]
        s.WF["x"] = s.hw(s.WF["z"]) - S["f_inset"] - s.WF["w"] / 2
        s.WR["x"] = s.hw(s.WR["z"]) - S["r_inset"] - s.WR["w"] / 2
        s.ttags = ["T%d" % k for k in range(len(S["topx"]))]
        s._sec = {}
    def hw(s, z): return keys(s.S["WID"], z)
    def arch_y(s, z):
        S = s.S; base = s.FLOOR + S["sill_h"]; y = base
        for W_ in (s.WF, s.WR):
            d = z - W_["z"]; R = W_["r"] + 0.15
            if abs(d) < R:
                t = math.sqrt(max(0.0, 1 - (d / R) ** 2))
                y = max(y, lerp(base, 2 * W_["r"] + S["ARCH_GAP"], t ** 0.5))
        if S["rear_open"] is not None and z < s.WR["z"]:
            k = min(1.0, (s.WR["z"] - z) / (s.WR["z"] - s.ZT)); y = lerp(2 * s.WR["r"] + S["ARCH_GAP"], S["rear_open"], k ** 0.9)
        return y
    def floor_in(s, z):
        f = s.hw(z) - 0.12
        for W_ in (s.WF, s.WR):
            f = lerp(f, min(f, W_["x"] - W_["w"] / 2 - 0.05), clamp((W_["r"] + 0.17 - abs(z - W_["z"])) / 0.05))
        if s.S["rear_open"] is not None and z < s.WR["z"]: f = min(f, s.WR["x"] - s.WR["w"] / 2 - 0.05)
        return f
    def section(s, z):
        z = round(z, 6)
        if z in s._sec: return s._sec[z]
        S = s.S; WR = s.WR
        w = s.hw(z); top = keys(S["TOP"], z); cab = keys(S["CAB"], z); bed = keys(S["BED"], z) if S["BED"] else 0.0
        sb = s.arch_y(z); fi = s.floor_in(z)
        fpk = max(keys(S["FPK"], z), sb + S["crown_min"])
        fl = s.FLOOR + max(0.0, z - (s.ZN - 0.45)) * S["nose_lift"]
        if z < WR["z"] - 0.1:
            k = min(1.0, (WR["z"] - 0.1 - z) / (WR["z"] - 0.1 - s.ZT)); fl = s.FLOOR + S["diff"] * k ** 1.3
        ym = lerp(sb, fpk, S["ymf"]); rw = keys(S["ROOFW"], z); tb = S["tumble"]; cr = S["cr_x"]
        pts = [(0.0, fl, "f0"), (fi * 0.5, fl, "f1"), (fi, fl, "f2"), (fi, max(fl + 0.01, sb - 0.03), "well"),
               (w - S["sill_in"], sb, "sill"), (w - 0.02 * tb, lerp(sb, ym, 0.55), "side1"), (w, ym, "side2"),
               (w - 0.028 * tb, lerp(ym, fpk, 0.6), "side3"), (w - S["sh_x"], fpk - S["sh_y"], "shoulder"), (w - cr, fpk, "crown")]
        x10 = lerp(w - cr - 0.16, w - cr - 0.06, cab); y10 = lerp(lerp(fpk, top, 0.45), fpk + 0.006, cab)
        x11 = lerp(S["hood_x"], rw, cab);          y11 = lerp(lerp(top, fpk, 0.12), top - S["roof_round"], cab)
        if bed > 0:
            x10 = lerp(x10, w - cr - 0.03, bed); y10 = lerp(y10, top + 0.04, bed)
            x11 = lerp(x11, w - cr - 0.06, bed); y11 = lerp(y11, top, bed)
        pts += [(x10, y10, "winbase"), (x11, y11, "roofedge")]
        for k, (tx, _) in enumerate(S["topx"]):
            tx = min(tx, x11 - 0.04 * (k + 1))
            pts.append((tx, top - (0.011 * (tx / 0.3) ** 2) * (1 - bed), s.ttags[k]))
        pts.append((0.0, top, "C"))
        sharp = max(S["sharp"], bed)
        out = pts[:4]
        for i in range(4, 12):
            p0 = pts[max(0, i - 1)]; p1 = pts[i]; p2 = pts[i + 1]; p3 = pts[min(len(pts) - 1, i + 2)]
            m = catmull(p0, p1, p2, p3, 0.5); ml = ((p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2)
            out.append(p1); out.append((lerp(m[0], ml[0], sharp), lerp(m[1], ml[1], sharp), p1[2] + "m"))
        out += pts[12:]
        pts = out
        if z < s.ZT + S["tail_len"]:
            k = (s.ZT + S["tail_len"] - z) / S["tail_len"]
            pts = [(x * (1 - S["tail_pinch"] * k * k) if x > 0.3 else x, y - (S["tail_drop"] * k * k if y > S["tail_dropy"] else 0.0), tg)
                   for (x, y, tg) in pts]
        if z > s.ZN - S["nose_len"]:
            k = (z - (s.ZN - S["nose_len"])) / S["nose_len"]; mid = S["nose_mid"]; o2 = []
            for (x, y, tg) in pts:
                x2 = x * (1 - S["nose_pinch"] * k * k)
                y2 = lerp(y, mid + (y - mid) * S["nose_sq"], k ** 1.6) if y > mid else lerp(y, max(y, s.FLOOR + 0.03 * k), k)
                o2.append((x2, y2, tg))
            pts = o2
        s._sec[z] = pts
        return pts
    # ---- surface queries (for placing parts on the curved body)
    def surf_y(s, x, z):
        """top surface height at (x, z) (searching the section from the widest point inward)"""
        sec = s.section(z); ax = abs(x)
        k0 = [p[2] for p in sec].index("side2"); up = sec[k0:]
        if ax >= up[0][0]: return up[0][1]
        for a, b in zip(up, up[1:]):
            if b[0] <= ax <= a[0]:
                t = (ax - a[0]) / (b[0] - a[0]) if abs(b[0] - a[0]) > 1e-9 else 0.0
                return lerp(a[1], b[1], t)
        return up[-1][1]
    def side_x(s, z, y):
        sec = s.section(z); sp = [p for p in sec if p[2].startswith(("sill", "side", "shoulder"))]
        for a, b in zip(sp, sp[1:]):
            if a[1] <= y <= b[1]:
                t = (y - a[1]) / max(1e-6, b[1] - a[1]); return lerp(a[0], b[0], t)
        return s.hw(z)
    def inside(s, x, y, z):
        poly = [(p[0], p[1]) for p in s.section(z)]; ax = abs(x); c = False
        for (x1, y1), (x2, y2) in zip(poly, poly[1:] + poly[:1]):
            if (y1 > y) != (y2 > y):
                xi = x1 + (y - y1) * (x2 - x1) / (y2 - y1)
                if ax < xi: c = not c
        return c
    def front_z(s, x, y):
        z = s.ZN
        while z > s.ZN - 0.8 and not s.inside(x, y, z): z -= 0.004
        return z if z > s.ZN - 0.8 else s.ZN
    def rear_z(s, x, y):
        z = s.ZT
        while z < s.ZT + 0.8 and not s.inside(x, y, z): z += 0.004
        if z >= s.ZT + 0.8: print("WARN rear_z miss", s.S["id"], x, y); return s.ZT
        return z
    def normal_rot(s, x, z):
        e = 0.03; dz = (s.surf_y(x, z + e) - s.surf_y(x, z - e)) / (2 * e)
        n = Vector((0, 1, -dz)).normalized(); return math.atan2(-n.y, n.z)
    # ---- face materials
    def face_mat(s, sec, i, zc):
        S = s.S; t0 = sec[i][2]; cab = keys(S["CAB"], zc)
        for b in S["bands"]:
            if t0 in b["tags"] and b["z0"] <= zc <= b["z1"]: return b["mat"], b
        if t0 in ("f0", "f1", "f2"): return "carbon", None
        if t0 == "well":
            return ("paint" if (S["well_paint_rear"] and zc < s.WR["z"] - s.WR["r"] - 0.12) else "carbon"), None
        inr = lambda r: r is not None and r[0] <= zc <= r[1]
        if t0 in ("winbase", "winbasem"):
            return ("glass" if (cab > S["side_cab"] and inr(S["sideglass"])) else "paint"), None
        if t0 in ("roofedge", "roofedgem") or t0 in s.ttags or t0 == "C":
            if inr(S["windscreen"]) or inr(S["rearglass"]): return "glass", None
            if t0 in s.ttags: return S["topx"][s.ttags.index(t0)][1], None
        return "paint", None

def stations(S, extra_breaks):
    ZT, ZN = S["ZT"], S["ZN"]; zs = []; z = ZT
    while z < ZN - 1e-6:
        dense = any(abs(z - W_["z"]) < W_["r"] + 0.24 for W_ in (S["WF"], S["WR"])) or z > ZN - 0.34 or z < ZT + 0.22 \
            or any(a <= z <= b for a, b in S["dense"])
        zs.append(z); z += S["step_d"] if dense else S["step_s"]
    brk = sorted(set([round(b, 5) for b in list(S["breaks"]) + extra_breaks if ZT + 0.005 < b < ZN - 0.005]))
    zs = [z for z in zs if all(abs(z - b) > 0.012 for b in brk)] + brk + [ZN]
    zs = sorted(set(round(z, 5) for z in zs))
    out = [zs[0]]
    for z in zs[1:]:
        if z - out[-1] > 0.006: out.append(z)
    return out

def build_loft_body(C):
    S = C.S; body = MB()
    eb = []
    for r in (S["windscreen"], S["rearglass"], S["sideglass"]):
        if r: eb += [r[0], r[1]]
    for b in S["bands"]: eb += [b["z0"], b["z1"]]
    zs = stations(S, eb)
    rings = []
    for z in zs:
        sec = C.section(z)
        R = [body.vert((x, y, z)) for (x, y, tg) in sec]
        L = [body.vert((-x, y, z)) if x > 1e-6 else R[i] for i, (x, y, tg) in enumerate(sec)]
        rings.append((R, L, sec, z))
    NP = len(rings[0][2])
    for a in range(len(rings) - 1):
        R0, L0, s0, z0 = rings[a]; R1, L1, s1, z1 = rings[a + 1]; zc = (z0 + z1) / 2
        for i in range(NP - 1):
            m, band = C.face_mat(s0, i, zc)
            uvR = uvL = None
            if band is not None and band.get("uv"):
                kind = band["uv"][0]
                if kind == "solid": uvR = uvL = band["uv"][1]
                else:
                    per, v0_, v1_ = band["uv"][1], band["uv"][2], band["uv"][3]
                    tg = band["tags"]; n = len(tg); k = tg.index(s0[i][2])
                    va, vb = lerp(v0_, v1_, k / n), lerp(v0_, v1_, (k + 1) / n)
                    ua, ub = z0 / per, z1 / per
                    uvR = [(ua, va), (ub, va), (ub, vb), (ua, vb)]
                    uvL = [(ua, vb), (ub, vb), (ub, va), (ua, va)]
            body.face([R0[i], R1[i], R1[i + 1], R0[i + 1]], m, uvR)
            if not (s0[i][0] < 1e-6 and s0[i + 1][0] < 1e-6):
                body.face([L0[i + 1], L1[i + 1], L1[i], L0[i]], m, uvL)
    # rounded nose: one extra ring pulled in towards the nose centre before the cap
    R_, L_, s_, z_ = rings[-1]; mid = S["nose_mid"]; k_ = S.get("nose_cap", 0.55)
    cs = [(x * k_, mid + (y - mid) * k_, tg) for (x, y, tg) in s_]; zc_ = z_ + S.get("nose_cap_d", 0.03)
    R2 = [body.vert((x, y, zc_)) for (x, y, tg) in cs]; L2 = [body.vert((-x, y, zc_)) if x > 1e-6 else R2[i] for i, (x, y, tg) in enumerate(cs)]
    for i in range(NP - 1):
        m, _ = C.face_mat(s_, i, z_ - 0.01)
        if m == "livery": m = "paint"
        body.face([R_[i], R2[i], R2[i + 1], R_[i + 1]], m)
        if not (s_[i][0] < 1e-6 and s_[i + 1][0] < 1e-6): body.face([L_[i + 1], L2[i + 1], L2[i], L_[i]], m)
    rings.append((R2, L2, cs, zc_))
    for (R_, L_, s_, z_), m in ((rings[0], S.get("tail_mat", "paint")), (rings[-1], "paint")):
        loop = R_ + list(reversed(L_[1:-1]))
        body.face(loop, m, (0.5, 0.5) if m == "livery" else None)
    return body

# ---------------------------------------------------------------- shared detail helpers
def tail_rect(C, b, x, y, w, h, sym=True, depth=0.03, z=None, glow=True, surround=None):
    for sd in ((-1, 1) if sym and x != 0 else (1,)):
        zz = (C.rear_z(sd * x, y) if z is None else z)
        b.box((sd * x, y, zz - depth / 2 + 0.012), (w, h, depth), "tail")
        if surround: b.box((sd * x, y, zz + depth / 2 - 0.008), (w + surround, h + surround, depth), "carbon")
        if glow: C.glows.append([round(sd * x, 3), round(y, 3), round(w + 0.26, 3), round(h + 0.2, 3)])
def tail_round(C, b, x, y, r, sym=True, z=None, ring=True):
    for sd in ((-1, 1) if sym and x != 0 else (1,)):
        zz = (C.rear_z(sd * x, y) if z is None else z)
        b.cyl((sd * x, y, zz - 0.004), r, 0.05, "tail", axis="z", seg=16)
        if ring: b.cyl((sd * x, y, zz + 0.004), r * 1.22, 0.05, "rim", axis="z", seg=16)
        C.glows.append([round(sd * x, 3), round(y, 3), round(2 * r + 0.24, 3), round(2 * r + 0.2, 3)])
def mirrors(C, b, z, y, x, mat="paint"):
    for sd in (-1, 1):
        b.box((sd * x, y, z), (0.15, 0.085, 0.12), mat)
        b.box((sd * x, y, z - 0.062), (0.13, 0.065, 0.01), "carbon")
        xin = C.side_x(z, y - 0.05) - 0.05
        x0 = min(xin, x - 0.11); b.box((sd * (x0 + x - 0.07) / 2, y - 0.035, z + 0.02), (x - 0.07 - x0, 0.03, 0.05), "carbon")
def wing(C, b, y, z, width, chord, rot, plate_h, pylon_x, mat="paint", plate_mat=None, gurney="stripe", pylon_mat="carbon"):
    b.box((0, y, z), (width, 0.022, chord), mat, rot_x=rot)
    b.box((0, y + 0.022 + chord / 2 * -math.sin(rot) * 0, z - chord / 2 - 0.005), (width, 0.026, 0.014), gurney)
    for sd in (-1, 1):
        b.box((sd * (width / 2 + 0.008), y - plate_h * 0.3, z - 0.02), (0.022, plate_h, chord + 0.12), plate_mat or mat)
        yd = C.surf_y(pylon_x, z + 0.06) - 0.02
        b.box((sd * pylon_x, (y + yd) / 2, z + 0.05), (0.024, y - yd, 0.08), pylon_mat, rot_x=0.2)
    C.sticker = [0.5 if width > 1.4 else 0.3, round(y + 0.011 + 0.005, 3), round(z, 3), round(-PI / 2 + rot, 4)]
def deck_sticker(C, x, z):
    C.sticker = [x, round(C.surf_y(x, z) + 0.008, 3), z, round(C.normal_rot(x, z), 4)]
def surf_slab(C, b, pts2d, m, off=0.006, th=0.008, uv=None):
    """flat-topped closed slab lying on the top surface; pts2d = polygon (x, z) (convex or star-shaped about its centroid)"""
    cx = sum(p[0] for p in pts2d) / len(pts2d); cz = sum(p[1] for p in pts2d) / len(pts2d)
    top = [b.vert((x, C.surf_y(x, z) + off + th, z)) for (x, z) in pts2d]
    bot = [b.vert((x, C.surf_y(x, z) + off - 0.004, z)) for (x, z) in pts2d]
    ct = b.vert((cx, C.surf_y(cx, cz) + off + th, cz)); cb = b.vert((cx, C.surf_y(cx, cz) + off - 0.004, cz)); n = len(pts2d)
    for i in range(n):
        j = (i + 1) % n
        b.face([top[i], top[j], ct], m, uv); b.face([bot[j], bot[i], cb], m, uv); b.face([bot[i], bot[j], top[j], top[i]], m, uv)
def star_pts(cx, cz, R, rot=0.0):
    out = []
    for k in range(10):
        a = rot + PI / 2 + k * PI / 5; rr = R if k % 2 == 0 else R * 0.40
        out.append((cx + math.cos(a) * rr, cz + math.sin(a) * rr))
    return out
def door_decal(C, b, sd, zc, yc, size, n=4):
    h = size / 2; cols = []
    for zi in (zc - h, zc + h):
        col = []
        for k in range(n + 1):
            y = yc - h + size * k / n
            col.append(b.vert((sd * (C.side_x(zi, y) + 0.012), y, zi)))
        cols.append(col)
    for k in range(n):
        v0, v1 = k / n, (k + 1) / n
        a, bb, c_, d = cols[0][k], cols[1][k], cols[1][k + 1], cols[0][k + 1]
        if sd > 0: b.face([a, bb, c_, d], "decal", [(1, v0), (0, v0), (0, v1), (1, v1)])
        else:      b.face([bb, a, d, c_], "decal", [(1, v0), (0, v0), (0, v1), (1, v1)])
def skirts(C, b, z0, z1, mat="carbon"):
    for sd in (-1, 1):
        zc = (z0 + z1) / 2; x = C.hw(zc) - 0.15
        b.box((sd * x, C.FLOOR + 0.03, zc), (0.07, 0.05, z1 - z0), mat)
def diffuser(C, b, n=5, gap=0.22, h=0.1, mat="carbon"):
    for k in range(n):
        x = (k - (n - 1) / 2) * gap
        b.box((x, C.FLOOR + 0.11, C.ZT + 0.2), (0.025, h, 0.42), mat, rot_x=0.4)
def exhaust(C, b, x, y, r=0.06, sym=True, length=0.16, tip="exhaust"):
    for sd in ((-1, 1) if sym and x != 0 else (1,)):
        z = C.rear_z(sd * x, y) if C.inside(sd * x, y, C.ZT + 0.2) else C.ZT
        b.cyl((sd * x, y, z - 0.03), r, length, tip, axis="z", seg=12)
        b.cyl((sd * x, y, z - 0.03 - length / 2 - 0.004), r * 0.72, 0.012, "carbon", axis="z", seg=12)

# ================================================================ wheels (styles)
def wheel_mesh(S, W_, o):
    r, tw = W_["r"], W_["w"]; mb = MB(); seg = S["wseg"]; style = S["wheel_style"]; tread = S["tread"]
    lug = {"knobbly": 0.038, "gravel": 0.016}.get(tread, 0.0)
    rt = r - lug; rr = r * S["rimfrac"]; hw_ = tw / 2
    gfr = {"slick": [0.38], "ribbed": [0.2, 0.5], "gravel": [0.2, 0.52], "knobbly": []}[tread]
    gh = min(0.010, hw_ * 0.08)
    tread_pts = [(0.0, rt)]
    for f in gfr:
        gx = f * hw_; tread_pts += [(gx - gh, rt), (gx - gh * 0.7, rt - 0.013), (gx + gh * 0.7, rt - 0.013), (gx + gh, rt)]
    shoulder = [(hw_ - 0.04, rt), (hw_ - 0.014, rt - 0.008), (hw_ - 0.002, rt - 0.03), (hw_ + 0.008, rt - 0.065)]
    wh = rt - 0.065 - rr
    wall = [(hw_ + 0.013, rr + wh * 0.72), (hw_ + 0.012, rr + wh * 0.45), (hw_ + 0.006, rr + wh * 0.18), (hw_ - 0.006, rr + 0.004)]
    half = tread_pts + shoulder + wall
    prof = [(-x, rad, "wall" if x > hw_ - 0.001 else "tyre") for (x, rad) in reversed(half)]
    prof += [(x, rad, "wall" if x > hw_ - 0.001 else "tyre") for (x, rad) in half[1:]]
    rg = []
    for (px, pr, tg) in prof:
        rg.append([mb.vert((px * o, math.cos(2 * PI * i / seg) * pr, math.sin(2 * PI * i / seg) * pr)) for i in range(seg)])
    for k in range(len(prof) - 1):
        m = "tyrewall" if (prof[k][2] == "wall" and prof[k + 1][2] == "wall") else "tyre"
        for i in range(seg):
            j = (i + 1) % seg
            q = [rg[k][i], rg[k][j], rg[k + 1][j], rg[k + 1][i]]
            if o < 0: q = q[::-1]
            mb.face(q[::-1], m)
    # tread lugs
    if lug:
        nl = seg if tread == "knobbly" else int(seg * 0.9)
        rows = ([(-hw_ + 0.04, 0.075, 0.0), (0.0, 0.08, 0.5), (hw_ - 0.04, 0.075, 0.0)] if tread == "knobbly"
                else [(-hw_ * 0.5, 0.07, 0.0), (hw_ * 0.5, 0.07, 0.5)])
        pitch = 2 * PI * rt / nl
        for (rx, lx, ph) in rows:
            for i in range(nl):
                a = 2 * PI * (i + ph) / nl; ca, sa = math.cos(a), math.sin(a)
                rc = rt + lug / 2 - 0.004
                mb.obox((rx * o, ca * rc, sa * rc), (lx / 2, 0, 0), (0, ca * (lug / 2 + 0.004), sa * (lug / 2 + 0.004)),
                        (0, -sa * pitch * 0.3, ca * pitch * 0.3), "tyre")
    x_lip = (hw_ - 0.006) * o; depth = 0.065 if style not in ("aero",) else 0.03
    x_face = (hw_ - depth) * o; x_in = (-hw_ + 0.03) * o; x_hub = (hw_ - 0.028) * o
    mb.cyl(((x_lip + x_in) / 2, 0, 0), rr, abs(x_lip - x_in), "rimdark", axis="x", seg=seg, cap=False)
    mb.cyl((x_lip - 0.004 * o, 0, 0), rr, 0.012, "rim", axis="x", seg=seg, r2=rr * 0.9, cap=False)
    mb.cyl(((x_lip + x_face) / 2, 0, 0), rr * 0.9, abs(x_lip - x_face), "rimdark" if style == "beadlock" else "spoke", axis="x", seg=seg, cap=False)
    mb.cyl((x_face - 0.03 * o, 0, 0), rr * 0.9, 0.01, "rimdark", axis="x", seg=seg)
    mb.cyl(((-hw_ * 0.3) * o, 0, 0), rr * 0.8, 0.025, "disc", axis="x", seg=16)
    def beam(p0, p1, wd0, wd1, th, tang, m):
        vs = []
        for (p, wd) in ((p0, wd0), (p1, wd1)):
            for (u, v) in ((-1, -1), (1, -1), (1, 1), (-1, 1)):
                vs.append(mb.vert((p[0] + u * th / 2, p[1] + v * wd / 2 * tang[0], p[2] + v * wd / 2 * tang[1])))
        for f in [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (2, 3, 7, 6), (1, 2, 6, 5), (0, 4, 7, 3)]:
            mb.face([vs[i] for i in f], m)
    def spokes(n, pair, w0, w1, th, m, r0=0.2, r1=0.9, xa=None, xb=None, twist=0.0):
        xa = x_hub - 0.005 * o if xa is None else xa; xb = x_face + 0.006 * o if xb is None else xb
        for k in range(n):
            for dd in ((-pair, pair) if pair else (0.0,)):
                a0 = 2 * PI * k / n + dd; a1 = a0 + twist
                p0 = (xa, math.cos(a0) * rr * r0, math.sin(a0) * rr * r0); p1 = (xb, math.cos(a1) * rr * r1, math.sin(a1) * rr * r1)
                am = (a0 + a1) / 2
                beam(p0, p1, w0, w1, th, (-math.sin(am), math.cos(am)), m)
    if style == "sport":
        spokes(S["spokes"], 0.11, 0.05 * rr / 0.25, 0.034 * rr / 0.25, 0.024, "spoke")
        mb.cyl((x_hub, 0, 0), rr * 0.24, 0.05, "spoke", axis="x", seg=12)
        mb.cyl((x_hub + 0.028 * o, 0, 0), rr * 0.12, 0.02, "rim", axis="x", seg=6)
    elif style == "mag":
        spokes(5, 0, 0.10 * rr / 0.25, 0.075 * rr / 0.25, 0.03, "rim")
        mb.cyl((x_hub, 0, 0), rr * 0.3, 0.05, "rim", axis="x", seg=12)
        mb.cyl((x_hub + 0.028 * o, 0, 0), rr * 0.14, 0.02, "rimdark", axis="x", seg=8)
    elif style == "aero":
        mb.cyl(((hw_ - 0.022) * o, 0, 0), rr * 0.9, 0.012, "rim", axis="x", seg=seg, r2=rr * 0.86)
        mb.cyl(((hw_ - 0.016) * o, 0, 0), rr * 0.62, 0.012, "livery", axis="x", seg=seg, uv=(0.5, 0.5))
        mb.cyl(((hw_ - 0.012) * o, 0, 0), rr * 0.5, 0.012, "rim", axis="x", seg=seg)
        mb.cyl(((hw_ - 0.006) * o, 0, 0), rr * 0.16, 0.012, "rimdark", axis="x", seg=12)
        for k in range(3):                     # three dark turbine slots
            a = 2 * PI * k / 3 + 0.4; ca, sa = math.cos(a), math.sin(a)
            mb.obox(((hw_ - 0.013) * o, ca * rr * 0.75, sa * rr * 0.75), (0.006, 0, 0), (0, ca * rr * 0.07, sa * rr * 0.07),
                    (0, -sa * rr * 0.18, ca * rr * 0.18), "rimdark")
    elif style == "wire":
        spokes(18, 0, 0.012, 0.010, 0.008, "rim", r0=0.24, r1=0.92, twist=0.32, xa=(hw_ - 0.012) * o)
        spokes(18, 0, 0.012, 0.010, 0.008, "rim", r0=0.24, r1=0.92, twist=-0.32, xa=(hw_ - 0.03) * o)
        mb.cyl(((hw_ - 0.01) * o, 0, 0), rr * 0.28, 0.06, "rim", axis="x", seg=12, r2=rr * 0.22)
        mb.box(((hw_ + 0.03) * o, 0, 0), (0.025, rr * 0.75, 0.035), "rim")      # knock-off spinner ears
        mb.box(((hw_ + 0.03) * o, 0, 0), (0.025, 0.035, rr * 0.75), "rim")
    elif style == "mesh8":
        spokes(8, 0, 0.035, 0.028, 0.02, "rim")
        mb.cyl((x_hub, 0, 0), rr * 0.3, 0.04, "rim", axis="x", seg=12)
        mb.cyl((x_hub + 0.022 * o, 0, 0), rr * 0.15, 0.015, "carbon", axis="x", seg=8)
    elif style == "rally":
        spokes(6, 0, 0.07 * rr / 0.22, 0.06 * rr / 0.22, 0.03, "stripe")
        mb.cyl((x_face + 0.004 * o, 0, 0), rr * 0.9, 0.012, "stripe", axis="x", seg=seg, r2=rr * 0.85, cap=False)
        mb.cyl((x_hub, 0, 0), rr * 0.3, 0.05, "stripe", axis="x", seg=12)
        mb.cyl((x_hub + 0.028 * o, 0, 0), rr * 0.13, 0.02, "rim", axis="x", seg=6)
    elif style == "beadlock":
        spokes(6, 0, 0.08 * rr / 0.24, 0.07 * rr / 0.24, 0.03, "rimdark")
        mb.cyl((x_lip + 0.004 * o, 0, 0), rr * 1.04, 0.022, "rim", axis="x", seg=seg, r2=rr * 1.04)
        mb.cyl((x_lip + 0.004 * o, 0, 0), rr * 0.9, 0.024, "rimdark", axis="x", seg=seg, cap=False)
        for k in range(12):
            a = 2 * PI * k / 12; mb.box((x_lip + 0.016 * o, math.cos(a) * rr * 0.97, math.sin(a) * rr * 0.97), (0.012, 0.022, 0.022), "rimdark")
        mb.cyl((x_hub, 0, 0), rr * 0.3, 0.05, "rim", axis="x", seg=12)
    return mb

def caliper_mesh(W_, side, front, rimfrac):
    r, tw = W_["r"], W_["w"]; mb = MB(); rr = r * rimfrac; xo = (-tw * 0.3 + 0.04) * side
    ang = math.radians(200 if front else 160)
    mb.box((xo, math.sin(ang) * rr * 0.62, math.cos(ang) * rr * 0.62), (0.055, rr * 0.55, rr * 0.33), "caliper")
    return mb

def add_wheels(S, WF, WR):
    for name, W_, side in (("FL", WF, 1), ("FR", WF, -1), ("RL", WR, 1), ("RR", WR, -1)):
        hub = bpy.data.objects.new("hub_" + name, None); scene.collection.objects.link(hub)
        hub.location = B((side * W_["x"], W_["r"], W_["z"]))
        wm = wheel_mesh(S, W_, side).to_obj("wheel_" + name, smooth_angle=35); wm.parent = hub
        cm = caliper_mesh(W_, side, name[0] == "F", S["rimfrac"]).to_obj("caliper_" + name, smooth_angle=30); cm.parent = hub

def wheel_checks(C):
    """print clearances: tyre top to arch lip, tyre outer face vs body side, tyre inner face vs inner well"""
    for nm, W_ in (("front", C.WF), ("rear", C.WR)):
        r = W_["r"]; gaps = []; out = []; inn = []
        for k in range(13):
            d = -r + 2 * r * k / 12; z = W_["z"] + d
            yt = r + math.sqrt(max(0, r * r - d * d)); gaps.append(C.arch_y(z) - yt)
            out.append(W_["x"] + W_["w"] / 2 + 0.013 - C.hw(z)); inn.append(C.floor_in(z) - (W_["x"] - W_["w"] / 2 - 0.013))
        print("CHECK %s %s: min arch gap %.3f (top %.3f), tyre proud of body %.3f, inner well clearance %.3f" %
              (C.S["id"], nm, min(gaps), gaps[6], max(out), -max(inn)))

# ================================================================ the cars
CARS = {}
def car(fn): CARS[fn.__name__[4:]] = fn; return fn

# ---------------------------------------------------------------- 1 Silver Arrow: electric hypercar
@car
def car_arrow():
    S = dict(BASE, id="arrow", n="Silver Arrow", paint="#c4c9d0", livery=TEAL_PNG,
        ZN=2.32, ZT=-2.28, FLOOR=0.09, ARCH_GAP=0.075,
        WF=dict(z=1.42, r=0.35, w=0.28), WR=dict(z=-1.38, r=0.36, w=0.36),
        WID=[(-2.28, 0.80), (-2.18, 0.92), (-1.9, 1.0), (-1.38, 1.02), (-0.9, 0.98), (-0.3, 0.93), (0.4, 0.93), (1.0, 0.97),
             (1.42, 0.99), (1.9, 0.95), (2.15, 0.85), (2.32, 0.66)],
        TOP=[(-2.28, 0.76), (-2.1, 0.81), (-1.7, 0.86), (-1.2, 0.93), (-0.6, 1.03), (-0.1, 1.07), (0.3, 1.05), (0.8, 0.90),
             (1.2, 0.80), (1.6, 0.74), (2.0, 0.60), (2.32, 0.36)],
        FPK=[(-2.28, 0.76), (-2.0, 0.84), (-1.38, 0.88), (-0.8, 0.80), (0, 0.76), (0.8, 0.80), (1.42, 0.86), (1.9, 0.74), (2.32, 0.40)],
        CAB=[(-1.35, 0.0), (-1.0, 1.0), (0.6, 1.0), (0.95, 0.0)],
        ROOFW=[(-1.2, 0.38), (-0.5, 0.47), (0.2, 0.50), (0.7, 0.58)],
        windscreen=(-1.18, 0.92), sideglass=(-0.95, 0.70),
        topx=[(0.30, "paint"), (0.07, "livery")], rear_open=0.64, tail_dropy=0.70,
        bands=[dict(tags=["side1"], mat="livery", z0=-0.92, z1=0.98, uv=("solid", (0.5, 0.5)))],
        wheel_style="aero", pivotY=0.28, wing=False)
    def extras(C, b):
        ZT = C.ZT
        diffuser(C, b, 5, 0.22)
        skirts(C, b, -0.9, 0.95)
        b.box((0, C.FLOOR - 0.005, 2.08), (1.7, 0.03, 0.5), "carbon")
        # full-width thin light bar, rear + front
        y = 0.67; zr = C.rear_z(0.0, y)
        b.box((0, y, zr + 0.002), (1.42, 0.035, 0.03), "tail")
        b.box((0, y, zr + 0.008), (1.5, 0.08, 0.03), "carbon")
        for x in (-0.5, 0.0, 0.5): C.glows.append([x, y, 0.7, 0.16])
        b.box((0, 0.46, ZT + 0.004), (1.1, 0.03, 0.02), "livery", uv=(0.5, 0.5))      # teal accent under the bar
        zf = C.front_z(0.0, 0.40)
        z0_ = C.front_z(0.0, 0.37); z6_ = C.front_z(0.6, 0.37); kq = (z0_ - z6_) / 0.36
        b.tube([(x, 0.37, z0_ - kq * x * x + 0.01) for x in [k * 0.1 for k in range(-7, 8)]], 0.016, "lamp", seg=6)
        b.box((0, 0.24, zf - 0.02), (1.0, 0.07, 0.06), "carbon")
        mirrors(C, b, 0.45, 0.82, 0.98)
        # small ducktail lip (no wing) + teal sill blades
        b.box((0, C.surf_y(0, ZT + 0.08) + 0.012, ZT + 0.07), (1.3, 0.02, 0.1), "paint", rot_x=-0.25)
        deck_sticker(C, 0.5, -1.75)
    return S, extras

# ---------------------------------------------------------------- 2 Shogun GT: Japanese super-coupe
@car
def car_shogun():
    S = dict(BASE, id="shogun", nose_cap=0.85, nose_cap_d=0.012, n="Shogun GT", paint="#f4f4f2", stripe="#d1121c",
        ZN=2.30, ZT=-2.25, FLOOR=0.12,
        WF=dict(z=1.38, r=0.34, w=0.28), WR=dict(z=-1.36, r=0.35, w=0.34),
        WID=[(-2.25, 0.88), (-2.18, 0.95), (-1.9, 0.99), (-1.36, 1.0), (-0.95, 0.95), (-0.5, 0.91), (0.4, 0.91), (0.95, 0.95),
             (1.38, 0.98), (1.85, 0.96), (2.15, 0.91), (2.30, 0.84)],
        TOP=[(-2.25, 1.00), (-2.1, 1.03), (-1.85, 1.0), (-1.55, 1.0), (-1.05, 1.24), (-0.7, 1.30), (-0.1, 1.30), (0.25, 1.24),
             (0.85, 0.86), (1.4, 0.80), (1.9, 0.75), (2.15, 0.66), (2.30, 0.55)],
        FPK=[(-2.25, 0.98), (-1.9, 0.98), (-1.36, 0.98), (-0.8, 0.92), (0.4, 0.90), (1.0, 0.86), (1.38, 0.86), (1.9, 0.80), (2.30, 0.58)],
        CAB=[(-1.62, 0.0), (-1.32, 1.0), (0.55, 1.0), (0.82, 0.0)],
        ROOFW=[(-1.3, 0.58), (-0.6, 0.62), (0.2, 0.64), (0.6, 0.70)],
        windscreen=(0.22, 0.82), rearglass=(-1.35, -0.72), sideglass=(-1.2, 0.5),
        sharp=0.55, sh_x=0.06, cr_x=0.15, ymf=0.5, tumble=0.6, sill_in=0.05, hood_x=0.45,
        nose_len=0.22, nose_pinch=0.10, nose_mid=0.45, nose_sq=0.75,
        tail_len=0.08, tail_pinch=0.03, tail_drop=0.02, tail_dropy=0.9, rear_open=0.66, smooth=50,
        bands=[dict(tags=["sill", "sillm"], mat="carbon", z0=-0.95, z1=0.98)],
        wheel_style="sport", spokes=6, pivotY=0.32, wing=True)
    def extras(C, b):
        ZT = C.ZT
        diffuser(C, b, 4, 0.26)
        b.box((0, C.FLOOR - 0.005, 2.1), (1.8, 0.035, 0.42), "carbon")
        # four round tail lamps in a dark panel
        y = 0.86
        b.box((0, y, C.rear_z(0, y) + 0.004), (1.62, 0.22, 0.02), "carbon")
        tail_round(C, b, 0.40, y, 0.085, z=C.rear_z(0.0, y) - 0.008)
        tail_round(C, b, 0.70, y, 0.085, z=C.rear_z(0.0, y) - 0.008)
        exhaust(C, b, 0.5, 0.36, 0.06)
        # wide mouth + slanted headlights
        zf = C.front_z(0, 0.36); b.box((0, 0.36, zf + 0.0), (1.1, 0.16, 0.06), "carbon")
        for sd in (-1, 1):
            x = 0.66; yy = 0.62; b.box((sd * x, yy, C.front_z(sd * x, yy) - 0.03), (0.34, 0.06, 0.14), "lamp", rot_x=-0.6)
        b.box((0, C.surf_y(0, 1.15) + 0.006, 1.15), (0.5, 0.02, 0.36), "carbon", rot_x=0.1)       # hood vent
        mirrors(C, b, 0.40, 0.98, 0.97)
        # ducktail lip + medium wing on short pylons
        b.box((0, C.surf_y(0, ZT + 0.06) + 0.02, ZT + 0.06), (1.5, 0.03, 0.1), "paint", rot_x=-0.3)
        wing(C, b, 1.21, -2.02, 1.78, 0.3, -0.08, 0.22, 0.42)
    return S, extras

# ---------------------------------------------------------------- 3 Alpine Rally: rally hatchback
@car
def car_rally():
    S = dict(BASE, id="rally", nose_cap=0.85, nose_cap_d=0.012, n="Alpine Rally", paint="#1d5fd1",
        ZN=2.10, ZT=-2.00, FLOOR=0.20,
        WF=dict(z=1.27, r=0.34, w=0.27), WR=dict(z=-1.27, r=0.34, w=0.27),
        WID=[(-2.0, 0.86), (-1.92, 0.92), (-1.6, 0.94), (-1.27, 0.95), (-0.8, 0.92), (0, 0.91), (0.8, 0.92), (1.27, 0.95),
             (1.75, 0.93), (1.98, 0.88), (2.10, 0.80)],
        TOP=[(-2.0, 1.08), (-1.95, 1.18), (-1.75, 1.30), (-1.35, 1.40), (-0.5, 1.43), (0.3, 1.41), (0.6, 1.32), (1.0, 1.04),
             (1.5, 0.95), (1.85, 0.88), (2.0, 0.80), (2.10, 0.68)],
        FPK=[(-2.0, 1.04), (-1.6, 1.06), (-1.27, 1.05), (-0.6, 1.02), (0.5, 1.0), (1.0, 0.97), (1.27, 0.95), (1.8, 0.88), (2.10, 0.70)],
        CAB=[(-1.97, 0.0), (-1.86, 1.0), (0.82, 1.0), (1.02, 0.0)],
        ROOFW=[(-1.8, 0.60), (-0.6, 0.66), (0.6, 0.68)],
        windscreen=(0.35, 0.98), rearglass=(-1.93, -1.40), sideglass=(-1.30, 0.80),
        sharp=0.35, sh_x=0.07, cr_x=0.16, ymf=0.45, tumble=0.8, hood_x=0.42,
        nose_len=0.22, nose_pinch=0.10, nose_mid=0.5, nose_sq=0.75,
        tail_len=0.08, tail_pinch=0.03, tail_drop=0.03, tail_dropy=0.95, rear_open=0.62, diff=0.08, smooth=55,
        topx=[(0.30, "paint"), (0.12, "stripe")],
        bands=[dict(tags=["side2", "side2m"], mat="stripe", z0=-2.0, z1=1.95),
               dict(tags=["sill", "sillm"], mat="carbon", z0=-0.95, z1=0.95)],
        wheel_style="rally", tread="gravel", rimfrac=0.58, pivotY=0.45, wing=True)
    def extras(C, b):
        ZT = C.ZT
        diffuser(C, b, 3, 0.3, 0.08)
        b.box((0, C.FLOOR + 0.0, 1.95), (1.5, 0.04, 0.3), "carbon")       # sump guard
        # roof scoop + roof-edge wing over the hatch
        b.box((0, 1.43 + 0.035, 0.05), (0.34, 0.07, 0.34), "paint", taper=0.85)
        b.box((0, 1.46, 0.225), (0.28, 0.045, 0.012), "carbon")
        wing(C, b, 1.45, -1.86, 1.62, 0.32, -0.12, 0.2, 0.45, plate_mat="paint")
        # tail lamps up the hatch corners, single big exhaust
        tail_rect(C, b, 0.68, 0.88, 0.12, 0.22, surround=0.03)
        exhaust(C, b, -0.55, 0.36, 0.065, sym=False, length=0.2)
        # mud flaps behind every wheel (white, short so the rear tyres still show)
        for W_ in (C.WF, C.WR):
            for sd in (-1, 1):
                b.box((sd * W_["x"], 0.30, W_["z"] - W_["r"] - 0.07), (W_["w"] + 0.02, 0.2, 0.012), "stripe")
        # rally light pod on the bonnet: 4 round lamps
        zp = 1.78; yb = C.surf_y(0, zp)
        b.box((0, yb + 0.05, zp), (0.98, 0.09, 0.08), "carbon", rot_x=-0.15)
        for x in (-0.36, -0.12, 0.12, 0.36):
            b.cyl((x, yb + 0.1, zp + 0.06), 0.085, 0.07, "rimdark", axis="z", seg=16)
            b.cyl((x, yb + 0.1, zp + 0.098), 0.07, 0.01, "lamp", axis="z", seg=16)
        for sd in (-1, 1):
            x = 0.62; b.box((sd * x, 0.78, C.front_z(sd * x, 0.78) - 0.03), (0.3, 0.1, 0.1), "lamp", rot_x=-0.4)
        b.box((0, 0.55, C.front_z(0, 0.55) - 0.01), (0.9, 0.18, 0.05), "carbon")
        mirrors(C, b, 0.70, 1.10, 0.95)
    return S, extras

# ---------------------------------------------------------------- 4 Kumasi V8: muscle car
@car
def car_kumasi():
    S = dict(BASE, id="kumasi", nose_cap=0.85, nose_cap_d=0.012, n="Kumasi V8", paint="#f28a1c",
        ZN=2.45, ZT=-2.40, FLOOR=0.12,
        WF=dict(z=1.55, r=0.35, w=0.27), WR=dict(z=-1.32, r=0.37, w=0.40),
        WID=[(-2.40, 0.90), (-2.3, 0.95), (-1.9, 0.98), (-1.32, 0.99), (-0.8, 0.95), (0, 0.93), (0.9, 0.94), (1.55, 0.96),
             (2.1, 0.95), (2.35, 0.92), (2.45, 0.86)],
        TOP=[(-2.40, 0.98), (-2.32, 1.01), (-2.05, 1.0), (-1.6, 1.05), (-0.9, 1.22), (-0.35, 1.30), (0.12, 1.29), (0.4, 1.17),
             (0.75, 0.93), (1.4, 0.89), (2.0, 0.86), (2.3, 0.80), (2.45, 0.66)],
        FPK=[(-2.40, 0.96), (-2.0, 0.99), (-1.32, 1.01), (-0.7, 0.95), (0.3, 0.92), (1.0, 0.92), (1.55, 0.92), (2.1, 0.90), (2.45, 0.70)],
        CAB=[(-1.95, 0.0), (-1.25, 1.0), (0.3, 1.0), (0.62, 0.0)],
        ROOFW=[(-1.6, 0.52), (-0.6, 0.60), (0.2, 0.62), (0.5, 0.68)],
        windscreen=(0.15, 0.68), rearglass=(-1.75, -0.6), sideglass=(-0.9, 0.28),
        sharp=0.45, sh_x=0.06, cr_x=0.14, ymf=0.55, tumble=0.7, hood_x=0.42,
        nose_len=0.14, nose_pinch=0.05, nose_mid=0.52, nose_sq=0.88,
        tail_len=0.07, tail_pinch=0.02, tail_drop=0.02, tail_dropy=0.9, rear_open=0.62, diff=0.1, smooth=52,
        topx=[(0.36, "paint"), (0.30, "stripe"), (0.11, "paint")],
        wheel_style="mag", rimfrac=0.62, pivotY=0.35, wing=False)
    def extras(C, b):
        ZT, ZN = C.ZT, C.ZN
        # chrome bumpers (rim material), grille + quad round headlights
        b.box((0, 0.42, ZN + 0.02), (1.84, 0.11, 0.10), "rim")
        b.box((0, 0.64, C.front_z(0, 0.64) - 0.01), (1.2, 0.2, 0.05), "carbon")
        for x in (0.52, 0.74):
            for sd in (-1, 1):
                zz = C.front_z(sd * x, 0.64)
                b.cyl((sd * x, 0.64, zz - 0.01), 0.075, 0.05, "rim", axis="z", seg=14)
                b.cyl((sd * x, 0.64, zz + 0.012), 0.062, 0.012, "lamp", axis="z", seg=14)
        b.box((0, 0.50, ZT - 0.03), (1.80, 0.10, 0.10), "rim")
        y = 0.80
        b.box((0, y, C.rear_z(0, y) + 0.004), (1.66, 0.18, 0.02), "carbon")
        tail_rect(C, b, 0.47, y, 0.62, 0.11, z=C.rear_z(0, y) - 0.004)
        exhaust(C, b, 0.6, 0.33, 0.072, length=0.18, tip="rim")
        # hood scoop + ducktail lip
        zs_ = 1.15; ys = C.surf_y(0, zs_)
        b.box((0, ys + 0.04, zs_), (0.52, 0.1, 0.62), "paint", taper=0.85)
        b.box((0, ys + 0.05, zs_ + 0.31), (0.4, 0.06, 0.01), "carbon")
        b.box((0, C.surf_y(0, ZT + 0.07) + 0.03, ZT + 0.07), (1.55, 0.04, 0.12), "paint", rot_x=-0.35)
        mirrors(C, b, 0.30, 0.98, 0.98, mat="rim")
        deck_sticker(C, 0.62, -2.0)
    return S, extras

# ---------------------------------------------------------------- 5 Lemon Kei: small tall hot hatch
@car
def car_kei():
    S = dict(BASE, id="kei", nose_cap=0.85, nose_cap_d=0.012, n="Lemon Kei", paint="#f7e85c",
        ZN=1.70, ZT=-1.70, FLOOR=0.15,
        WF=dict(z=1.12, r=0.29, w=0.21), WR=dict(z=-1.12, r=0.29, w=0.22),
        WID=[(-1.70, 0.76), (-1.62, 0.80), (-1.12, 0.81), (0, 0.80), (1.12, 0.81), (1.52, 0.79), (1.70, 0.72)],
        TOP=[(-1.70, 1.34), (-1.65, 1.45), (-1.52, 1.51), (-0.5, 1.53), (0.3, 1.52), (0.55, 1.43), (1.02, 1.02), (1.3, 0.93),
             (1.55, 0.85), (1.70, 0.74)],
        FPK=[(-1.70, 1.04), (-1.12, 1.05), (0, 1.03), (1.0, 0.96), (1.4, 0.89), (1.70, 0.76)],
        CAB=[(-1.80, 1.0), (0.98, 1.0), (1.12, 0.0)],
        ROOFW=[(-1.6, 0.64), (0, 0.67), (0.9, 0.69)],
        windscreen=(0.40, 1.05), rearglass=(-1.72, -1.56), sideglass=(-1.30, 0.95),
        sharp=0.45, sh_x=0.05, cr_x=0.08, ymf=0.45, tumble=0.9, sill_in=0.05, hood_x=0.40, roof_round=0.04,
        nose_len=0.16, nose_pinch=0.06, nose_mid=0.55, nose_sq=0.8,
        tail_len=0.05, tail_pinch=0.02, tail_drop=0.02, tail_dropy=1.2, rear_open=0.50, diff=0.05, smooth=48,
        topx=[(0.30, "paint"), (0.20, "paint"), (0.05, "paint")],
        bands=[dict(tags=["sill", "sillm"], mat="carbon", z0=-1.0, z1=1.0)],
        wheel_style="mesh8", rimfrac=0.6, wseg=20, pivotY=0.45, wing=False)
    def extras(C, b):
        ZT, ZN = C.ZT, C.ZN
        # rear: hatch window, vertical lamps, dark bumper
        b.box((0, 1.19, C.rear_z(0, 1.19) - 0.004), (1.08, 0.24, 0.02), "glass")
        tail_rect(C, b, 0.66, 0.93, 0.12, 0.30, surround=0.03)
        b.box((0, 0.36, ZT - 0.02), (1.5, 0.14, 0.08), "carbon")
        exhaust(C, b, 0.45, 0.30, 0.045, sym=False)
        # roof spoiler with little side plates
        ys = C.surf_y(0, -1.55)
        b.box((0, ys + 0.03, -1.62), (1.24, 0.035, 0.26), "paint", rot_x=-0.12)
        for sd in (-1, 1): b.box((sd * 0.62, ys + 0.0, -1.6), (0.02, 0.08, 0.28), "paint")
        # cute round headlights + smile grille
        for sd in (-1, 1):
            x = 0.50; y = 0.62; zz = C.front_z(sd * x, y)
            b.cyl((sd * x, y, zz - 0.012), 0.115, 0.05, "rim", axis="z", seg=18)
            b.cyl((sd * x, y, zz + 0.016), 0.095, 0.012, "lamp", axis="z", seg=18)
        b.box((0, 0.44, C.front_z(0, 0.44) - 0.01), (0.5, 0.08, 0.04), "carbon")
        b.box((0, 0.30, ZN - 0.02), (1.44, 0.14, 0.08), "carbon")
        mirrors(C, b, 0.85, 1.10, 0.86)
        deck_sticker(C, 0.36, -0.7)
    return S, extras

# ---------------------------------------------------------------- 6 Thunder Ridge XL: pickup / off-roader
@car
def car_ridge():
    S = dict(BASE, id="ridge", nose_cap=0.85, nose_cap_d=0.012, n="Thunder Ridge XL", paint="#2457D6",
        ZN=2.62, ZT=-2.68, FLOOR=0.40, sill_h=0.06,
        WF=dict(z=1.72, r=0.43, w=0.34), WR=dict(z=-1.62, r=0.43, w=0.34),
        WID=[(-2.68, 0.97), (-2.2, 0.98), (-1.62, 1.02), (-1.0, 0.98), (-0.3, 0.97), (1.1, 0.98), (1.72, 1.02), (2.3, 0.98), (2.62, 0.93)],
        TOP=[(-2.68, 1.0), (-0.72, 1.0), (-0.64, 1.86), (-0.52, 1.90), (0.2, 1.90), (0.45, 1.78), (0.95, 1.30), (1.6, 1.25),
             (2.3, 1.20), (2.5, 1.12), (2.62, 1.0)],
        FPK=[(-2.68, 1.32), (-0.7, 1.32), (0.2, 1.32), (0.9, 1.28), (1.72, 1.26), (2.4, 1.22), (2.62, 1.08)],
        CAB=[(-0.74, 0.0), (-0.64, 1.0), (0.90, 1.0), (1.04, 0.0)],
        BED=[(-0.76, 1.0), (-0.66, 0.0)],
        ROOFW=[(-0.6, 0.72), (0.2, 0.74), (0.85, 0.80)],
        windscreen=(0.30, 0.98), rearglass=(-0.67, -0.56), sideglass=(-0.58, 0.88),
        sharp=0.8, sh_x=0.05, cr_x=0.10, ymf=0.5, tumble=0.4, sill_in=0.04, hood_x=0.50, roof_round=0.05,
        nose_len=0.10, nose_pinch=0.04, nose_mid=0.85, nose_sq=0.85, nose_lift=0.0,
        tail_len=0.03, tail_pinch=0.01, tail_drop=0.0, rear_open=0.70, diff=0.05, smooth=45, f_inset=-0.01, r_inset=-0.01,
        dense=[(-0.8, -0.5)], breaks=[-0.76, -0.72, -0.70, -0.68, -0.66, -0.64],
        bands=[dict(tags=TOPINNER[1:] + ["T0", "T1", "T2"], mat="carbon", z0=-2.7, z1=-0.74),
               dict(tags=["sill", "sillm", "side1"], mat="carbon", z0=-2.7, z1=2.7)],
        wheel_style="beadlock", tread="knobbly", rimfrac=0.52, wseg=22, pivotY=0.6, wing=False)
    def extras(C, b):
        ZT, ZN = C.ZT, C.ZN
        # tail: vertical lamps on the bed corners, step bumper, tailgate handle
        tail_rect(C, b, 0.88, 1.08, 0.10, 0.36, z=ZT)
        b.box((0, 0.55, ZT - 0.05), (1.92, 0.16, 0.2), "carbon")
        b.box((0, 1.22, ZT - 0.008), (0.3, 0.05, 0.02), "carbon")
        # roll bar over the bed + roof light bar
        zb = -0.98
        b.tube([(0.86, 1.30, zb), (0.86, 1.70, zb), (0.80, 1.80, zb), (-0.80, 1.80, zb), (-0.86, 1.70, zb), (-0.86, 1.30, zb)], 0.045, "carbon", seg=8)
        for sd in (-1, 1): b.tube([(sd * 0.83, 1.72, zb - 0.02), (sd * 0.86, 1.32, -1.75)], 0.035, "carbon", seg=8)
        b.box((0, 1.95, 0.25), (1.2, 0.07, 0.1), "carbon")
        for x in (-0.42, -0.14, 0.14, 0.42): b.box((x, 1.95, 0.302), (0.2, 0.045, 0.01), "lamp")
        # bull bar
        zf = ZN + 0.14
        b.tube([(0.56, 0.52, zf - 0.03), (0.56, 1.12, zf), (0.44, 1.26, zf - 0.02), (-0.44, 1.26, zf - 0.02), (-0.56, 1.12, zf), (-0.56, 0.52, zf - 0.03)], 0.04, "carbon", seg=8)
        b.tube([(-0.56, 0.84, zf), (0.56, 0.84, zf)], 0.035, "carbon", seg=8)
        for sd in (-1, 1): b.tube([(sd * 0.56, 0.62, zf - 0.02), (sd * 0.56, 0.62, ZN - 0.04)], 0.04, "carbon", seg=8)
        # front: big grille, square lamps, bumper
        b.box((0, 1.0, C.front_z(0, 1.0) - 0.01), (1.2, 0.3, 0.05), "carbon")
        for x in (-0.36, -0.12, 0.12, 0.36): b.box((x, 1.0, C.front_z(0, 1.0) + 0.017), (0.03, 0.26, 0.01), "rimdark")
        for sd in (-1, 1): b.box((sd * 0.76, 1.04, C.front_z(sd * 0.76, 1.04) - 0.02), (0.28, 0.13, 0.05), "lamp")
        b.box((0, 0.62, ZN - 0.02), (1.96, 0.2, 0.16), "carbon")
        mirrors(C, b, 0.75, 1.42, 1.08)
        exhaust(C, b, -0.6, 0.48, 0.05, sym=False, length=0.1)
        deck_sticker(C, 0.38, -0.1)
    return S, extras

# ---------------------------------------------------------------- 8 Classic 59: 1950s/60s sports racer
@car
def car_retro():
    S = dict(BASE, id="retro", n="Classic 59", paint="#1f6b45", stripe="#f1e6c8", decal_png=NUM59_PNG,
        ZN=2.12, ZT=-2.13, FLOOR=0.13,
        WF=dict(z=1.18, r=0.33, w=0.19), WR=dict(z=-1.18, r=0.335, w=0.21),
        WID=[(-2.13, 0.50), (-2.02, 0.66), (-1.7, 0.79), (-1.18, 0.84), (-0.65, 0.79), (0, 0.77), (0.65, 0.79), (1.18, 0.83),
             (1.6, 0.79), (1.92, 0.66), (2.12, 0.42)],
        TOP=[(-2.13, 0.52), (-1.98, 0.66), (-1.55, 0.79), (-0.92, 0.83), (-0.66, 0.81), (-0.56, 0.60), (0.40, 0.60), (0.50, 0.77),
             (0.9, 0.75), (1.4, 0.69), (1.85, 0.58), (2.12, 0.40)],
        FPK=[(-2.13, 0.52), (-1.92, 0.70), (-1.18, 0.90), (-0.62, 0.80), (0, 0.78), (0.62, 0.80), (1.18, 0.88), (1.72, 0.72), (2.12, 0.42)],
        CAB=[(-9, 0.0), (9, 0.0)], ROOFW=[(-9, 0.4), (9, 0.4)], hood_x=0.40,
        sharp=0.0, ymf=0.40, tumble=1.2, sill_in=0.10, f_inset=0.01, r_inset=0.01,
        nose_len=0.30, nose_pinch=0.22, nose_mid=0.42, nose_sq=0.6,
        tail_len=0.22, tail_pinch=0.12, tail_drop=0.06, tail_dropy=0.45, diff=0.1, smooth=60,
        topx=[(0.30, "paint"), (0.13, "stripe")], breaks=[-0.66, -0.56, 0.40, 0.50],
        bands=[dict(tags=TOPINNER[2:] + ["T0", "T1", "C"], mat="carbon", z0=-0.58, z1=0.46)],
        wheel_style="wire", tread="ribbed", rimfrac=0.60, pivotY=0.3, wing=False)
    def extras(C, b):
        ZT, ZN = C.ZT, C.ZN
        # twin headrest fairings behind the cockpit
        for sd in (-1, 1):
            R = []
            for k in range(9):
                t = k / 8; z = -0.56 - 1.0 * t; s = math.sin(PI / 2 * (1 - t)) ** 0.7 if t > 0 else 1.0
                s = max(0.05, (1 - t ** 2.2)) * min(1.0, 0.55 + t * 4)
                yd = C.surf_y(sd * 0.3, z) - 0.04
                R.append([(sd * 0.3 + math.cos(2 * PI * i / 12) * 0.16 * s, yd + max(0, math.sin(2 * PI * i / 12)) * 0.20 * s
                           + min(0, math.sin(2 * PI * i / 12)) * 0.03, z) for i in range(12)])
            b.rings(R, "paint")
        # wrap-around windscreen (a thin curved glass slab)
        n = 9; bot = []; topp = []
        for k in range(n):
            t = -1 + 2 * k / (n - 1); x = 0.58 * t; z = 0.44 - 0.2 * t * t
            yb = C.surf_y(x, z + 0.04) - 0.03; bot.append((x, yb, z)); topp.append((x * 0.97, 0.98 - 0.08 * t * t, z - 0.08))
        R = []
        for (pb, pt) in zip(bot, topp):
            R.append([pb, pt, (pt[0], pt[1], pt[2] - 0.012), (pb[0], pb[1], pb[2] - 0.012)])
        idx = [[b.vert(p) for p in r] for r in R]
        for a in range(n - 1):
            for i in range(4):
                j = (i + 1) % 4; b.face([idx[a][i], idx[a][j], idx[a + 1][j], idx[a + 1][i]], "glass")
        b.face(list(reversed(idx[0])), "glass"); b.face(idx[-1], "glass")
        # steering wheel + seats
        sw = [(0.28 + math.cos(2 * PI * k / 12) * 0.16, 0.74 + math.sin(2 * PI * k / 12) * 0.15, 0.22 + math.sin(2 * PI * k / 12) * 0.05) for k in range(13)]
        b.tube(sw, 0.014, "carbon", seg=5)
        # oval grille mouth, faired round headlights
        zf = C.front_z(0, 0.32); b.cyl((0, 0.32, zf - 0.01), 0.2, 0.05, "carbon", axis="z", seg=16, ry=0.1)
        b.cyl((0, 0.32, zf - 0.03), 0.23, 0.05, "rim", axis="z", seg=16, ry=0.125)
        for sd in (-1, 1):
            x = 0.56; y = 0.56; zz = C.front_z(sd * x, y)
            b.cyl((sd * x, y, zz - 0.02), 0.1, 0.06, "rim", axis="z", seg=16)
            b.cyl((sd * x, y, zz + 0.012), 0.085, 0.01, "lamp", axis="z", seg=16)
        # small round tail lamps, single exhaust
        tail_round(C, b, 0.36, 0.52, 0.06)
        exhaust(C, b, -0.22, 0.24, 0.045, sym=False, tip="rim")
        mirrors(C, b, 0.30, 0.86, 0.66, mat="rim")
        # number roundels: both doors + bonnet
        DZ = -0.1; sb0 = C.arch_y(DZ); ym0 = lerp(sb0, max(keys(C.S["FPK"], DZ), sb0 + 0.1), 0.42)
        for sd in (-1, 1): door_decal(C, b, sd, DZ, ym0 + 0.04, 0.38)
        hz = 1.42; h = 0.17; n = 4
        G = [[b.vert((-h + 2 * h * i / n, C.surf_y(-h + 2 * h * i / n, hz - h + 2 * h * j / n) + 0.008, hz - h + 2 * h * j / n))
              for i in range(n + 1)] for j in range(n + 1)]
        for j in range(n):
            for i in range(n):
                b.face([G[j][i], G[j][i + 1], G[j + 1][i + 1], G[j + 1][i]], "decal",
                       [(i / n, j / n), ((i + 1) / n, j / n), ((i + 1) / n, (j + 1) / n), (i / n, (j + 1) / n)])
        deck_sticker(C, 0.42, -1.72)
    return S, extras

# ---------------------------------------------------------------- 9 Black Star Kente: Ghana-themed sports car
@car
def car_kente():
    side_tags = ["side2", "side2m", "side3"]
    deck_tags = ["winbase", "winbasem", "roofedge", "roofedgem", "T0", "T1", "T2"]
    S = dict(BASE, id="kente", n="Black Star Kente", paint="#ce1126", stripe="#fcd116", livery=KENTE_PNG,
        ZN=2.30, ZT=-2.20, FLOOR=0.11,
        WF=dict(z=1.42, r=0.35, w=0.28), WR=dict(z=-1.32, r=0.37, w=0.36),
        WID=[(-2.20, 0.86), (-2.12, 0.94), (-1.8, 0.98), (-1.32, 0.99), (-0.8, 0.95), (0, 0.92), (0.8, 0.95), (1.42, 0.98),
             (1.95, 0.94), (2.18, 0.84), (2.30, 0.66)],
        TOP=[(-2.20, 0.98), (-2.12, 1.03), (-1.9, 1.02), (-1.45, 1.0), (-1.0, 1.14), (-0.55, 1.23), (-0.1, 1.24), (0.2, 1.16),
             (0.65, 0.86), (1.1, 0.80), (1.6, 0.73), (2.0, 0.60), (2.30, 0.40)],
        FPK=[(-2.20, 0.96), (-1.9, 0.99), (-1.32, 1.01), (-0.8, 0.92), (0, 0.86), (0.7, 0.84), (1.42, 0.86), (1.9, 0.76), (2.30, 0.42)],
        CAB=[(-1.5, 0.0), (-1.15, 1.0), (0.25, 1.0), (0.6, 0.0)],
        ROOFW=[(-1.2, 0.55), (-0.5, 0.57), (0.1, 0.60), (0.5, 0.68)],
        windscreen=(0.05, 0.62), rearglass=(-1.42, -0.72), sideglass=(-1.12, 0.22),
        sharp=0.2, ymf=0.45, nose_len=0.28, nose_pinch=0.16, nose_mid=0.38, nose_sq=0.6,
        tail_len=0.10, tail_pinch=0.04, tail_drop=0.03, tail_dropy=0.9, rear_open=0.66,
        bands=[dict(tags=side_tags, mat="livery", z0=-2.25, z1=1.98, uv=("band", 0.6, K_V0, K_V1)),
               dict(tags=deck_tags, mat="livery", z0=-2.25, z1=-1.62, uv=("band", 0.6, K_V0, K_V1)),
               dict(tags=["side1m"], mat="livery", z0=-2.25, z1=2.0, uv=("solid", K_GOLD)),
               dict(tags=["sill", "sillm", "side1"], mat="livery", z0=-2.25, z1=2.3, uv=("solid", K_GREEN))],
        wheel_style="sport", spokes=5, pivotY=0.32, wing=False)
    def extras(C, b):
        ZT = C.ZT
        diffuser(C, b, 5, 0.22)
        b.box((0, C.FLOOR - 0.005, 2.08), (1.7, 0.03, 0.46), "livery", uv=K_GREEN)
        # black stars on the bonnet and the roof (slabs following the surface)
        surf_slab(C, b, star_pts(0.0, 1.30, 0.30), "carbon")
        surf_slab(C, b, star_pts(0.0, -0.38, 0.24), "carbon")
        # tail: gold surround + two red light strips + centre gold bar, twin exhausts
        y = 0.86
        b.box((0, y, C.rear_z(0, y) + 0.004), (1.64, 0.16, 0.02), "livery", uv=K_BLACK)
        tail_rect(C, b, 0.52, y, 0.5, 0.07, z=C.rear_z(0, y) - 0.004)
        b.box((0, y, C.rear_z(0, y) - 0.008), (0.36, 0.05, 0.02), "livery", uv=K_GOLD)
        exhaust(C, b, 0.14, 0.38, 0.055)
        # gold ducktail
        b.box((0, C.surf_y(0, ZT + 0.07) + 0.025, ZT + 0.07), (1.5, 0.03, 0.12), "livery", rot_x=-0.3, uv=K_GOLD)
        # front: slim lamps, mouth
        for sd in (-1, 1):
            x = 0.6; yy = 0.5; b.box((sd * x, yy, C.front_z(sd * x, yy) - 0.03), (0.34, 0.04, 0.14), "lamp", rot_x=-0.55)
        b.box((0, 0.28, C.front_z(0, 0.28) - 0.01), (0.95, 0.1, 0.05), "carbon")
        mirrors(C, b, 0.38, 0.92, 0.98)
        for sd in (-1, 1): b.box((sd * 0.99, 0.92, 0.38), (0.15, 0.03, 0.12), "livery", uv=K_GOLD)
        deck_sticker(C, 0.55, -1.9)
    return S, extras

# ---------------------------------------------------------------- 10 Lagoon Viper: mid-engine wedge supercar
@car
def car_viper():
    louv = []
    z = -0.86
    for k in range(8):
        louv.append(dict(tags=["roofedge", "roofedgem", "T0", "T1", "T2"], mat="carbon", z0=z - 0.05, z1=z)); z -= 0.12
    S = dict(BASE, id="viper", n="Lagoon Viper", paint="#12B0E8",
        ZN=2.30, ZT=-2.25, FLOOR=0.09, crown_min=0.06,
        WF=dict(z=1.38, r=0.31, w=0.27), WR=dict(z=-1.40, r=0.38, w=0.38), ARCH_GAP=0.085,
        WID=[(-2.25, 0.94), (-2.12, 1.0), (-1.4, 1.03), (-0.9, 0.98), (-0.3, 0.91), (0.4, 0.91), (1.0, 0.95), (1.38, 0.97),
             (1.9, 0.93), (2.15, 0.84), (2.30, 0.70)],
        TOP=[(-2.25, 0.90), (-2.15, 0.93), (-1.5, 0.97), (-0.75, 1.02), (-0.4, 1.05), (0.0, 1.05), (0.35, 0.98), (1.0, 0.81),
             (1.5, 0.74), (2.0, 0.57), (2.30, 0.32)],
        FPK=[(-2.25, 0.88), (-1.4, 0.94), (-0.8, 0.86), (0, 0.80), (0.8, 0.79), (1.38, 0.76), (1.9, 0.61), (2.30, 0.33)],
        CAB=[(-0.8, 0.0), (-0.5, 1.0), (0.9, 1.0), (1.15, 0.0)],
        ROOFW=[(-0.6, 0.52), (0, 0.55), (0.8, 0.62)],
        windscreen=(0.25, 1.10), rearglass=(-0.72, -0.42), sideglass=(-0.55, 0.92),
        sharp=0.85, sh_x=0.05, cr_x=0.14, ymf=0.5, tumble=0.4,
        nose_len=0.30, nose_pinch=0.10, nose_mid=0.22, nose_sq=0.3, nose_lift=0.1,
        tail_len=0.06, tail_pinch=0.02, tail_drop=0.02, tail_dropy=0.8, rear_open=0.62, diff=0.26, smooth=40,
        bands=[dict(tags=["side2", "side2m", "side3"], mat="carbon", z0=-0.98, z1=-0.48)] + louv,
        wheel_style="sport", spokes=5, pivotY=0.28, wing=True)
    def extras(C, b):
        ZT = C.ZT
        diffuser(C, b, 7, 0.17, 0.16)
        skirts(C, b, -0.95, 0.95)
        b.box((0, C.FLOOR - 0.005, 2.05), (1.75, 0.03, 0.5), "carbon")
        # slim tail bars + centre bar, twin centre exhausts
        y = 0.76
        b.box((0, y, C.rear_z(0, y) + 0.004), (1.8, 0.14, 0.02), "carbon")
        tail_rect(C, b, 0.62, y, 0.48, 0.05, z=C.rear_z(0, y) - 0.004)
        tail_rect(C, b, 0.0, y + 0.0, 0.5, 0.03, z=C.rear_z(0, y) - 0.004)
        exhaust(C, b, 0.12, 0.47, 0.055)
        # low wide wing
        wing(C, b, 1.06, -2.06, 1.96, 0.26, -0.06, 0.16, 0.5)
        # sharp nose: slim lamps + intakes
        for sd in (-1, 1):
            x = 0.62; yy = 0.40; b.box((sd * x, yy, C.front_z(sd * x, yy) - 0.05), (0.3, 0.03, 0.16), "lamp", rot_x=-0.25)
        for sd in (-1, 1): b.box((sd * 0.45, 0.22, C.front_z(sd * 0.45, 0.22) - 0.01), (0.42, 0.08, 0.05), "carbon")
        mirrors(C, b, 0.55, 0.86, 0.96)
    return S, extras

# ---------------------------------------------------------------- 7 Volta Formula: open-wheel single-seater (own builder)
def formula_spec():
    return dict(BASE, id="formula", n="Volta Formula", paint="#7B2CBF", livery=YELLOW_PNG,
                ZN=2.52, ZT=-2.62, FLOOR=0.06,
                WF=dict(z=1.70, r=0.36, w=0.34, x=0.78), WR=dict(z=-1.70, r=0.37, w=0.40, x=0.75),
                wheel_style="sport", spokes=5, rimfrac=0.66, pivotY=0.25, wing=True)

TZ_HW = [(-2.15, 0.10), (-1.85, 0.14), (-1.4, 0.21), (-0.9, 0.31), (-0.56, 0.38), (-0.40, 0.42), (0.0, 0.40), (0.55, 0.34),
         (0.9, 0.27), (1.4, 0.20), (1.9, 0.14), (2.30, 0.10), (2.50, 0.07)]
TZ_YB = [(-2.15, 0.24), (-1.85, 0.18), (-1.4, 0.13), (-0.9, 0.10), (-0.5, 0.08), (0.55, 0.08), (0.9, 0.09), (1.4, 0.12),
         (1.9, 0.15), (2.30, 0.17), (2.50, 0.19)]
TZ_YT = [(-2.15, 0.42), (-1.85, 0.52), (-1.4, 0.72), (-0.9, 0.94), (-0.56, 1.00), (-0.42, 0.72), (0.0, 0.68), (0.55, 0.70),
         (0.9, 0.62), (1.4, 0.52), (1.9, 0.42), (2.30, 0.34), (2.50, 0.29)]
COCK = (-0.40, 0.48)

class FCar:
    """minimal Car-like object for the formula car (stats + glows + sticker)"""
    def __init__(s, S):
        s.S = S; s.WF = S["WF"]; s.WR = S["WR"]; s.ZN, s.ZT, s.FLOOR = S["ZN"], S["ZT"], S["FLOOR"]; s.glows = []; s.sticker = None

def tub_half(z, n=11):
    hw = keys(TZ_HW, z); yb = keys(TZ_YB, z); yt = keys(TZ_YT, z); yc = (yb + yt) / 2; hh = (yt - yb) / 2; out = []
    for k in range(n):
        th = -PI / 2 + PI * k / (n - 1); c, s_ = math.cos(th), math.sin(th)
        x = hw * (abs(c) ** (2 / 3.2)); y = yc + hh * math.copysign(abs(s_) ** (2 / 3.2), s_)
        if COCK[0] < z < COCK[1] and x < hw * 0.72 and s_ > 0:
            y = min(y, 0.52)
        out.append((x, y))
    out[0] = (0.0, out[0][1]); out[-1] = (0.0, out[-1][1])
    return out

def build_formula(C):
    b = MB(); zs = []; z = -2.15
    while z < 2.50 - 1e-6:
        zs.append(z); z += 0.025 if (-0.62 < z < -0.36 or COCK[0] - 0.05 < z < COCK[0] + 0.05 or COCK[1] - 0.05 < z < COCK[1] + 0.05) else 0.06
    zs += [2.50, COCK[0], COCK[1]]; zs = sorted(set(round(v, 4) for v in zs))
    rings = []
    for z in zs:
        h = tub_half(z); R = [b.vert((x, y, z)) for (x, y) in h]; L = [b.vert((-x, y, z)) if x > 1e-6 else R[i] for i, (x, y) in enumerate(h)]
        rings.append((R, L, h, z))
    n = len(rings[0][2])
    for a in range(len(rings) - 1):
        R0, L0, h0, z0 = rings[a]; R1, L1, h1, z1 = rings[a + 1]; zc = (z0 + z1) / 2; hwz = keys(TZ_HW, zc)
        for i in range(n - 1):
            m = "paint"
            if COCK[0] < zc < COCK[1] and h0[i][0] < hwz * 0.72 and h0[i][1] > 0.3 and h0[i + 1][0] < hwz * 0.73: m = "carbon"
            elif i >= n - 3 and (zc > 0.62 or zc < -0.62): m = "livery"
            elif i < 3: m = "carbon"
            uv = (0.5, 0.5) if m == "livery" else None
            b.face([R0[i], R1[i], R1[i + 1], R0[i + 1]], m, uv)
            b.face([L0[i + 1], L1[i + 1], L1[i], L0[i]], m, uv)
    for (R_, L_, h_, z_), m in ((rings[0], "carbon"), (rings[-1], "livery")):
        b.face(R_ + list(reversed(L_[1:-1])), m, (0.5, 0.5) if m == "livery" else None)
    # sidepods (closed lofts, carbon intake mouths)
    SPz = [0.40, 0.25, -0.2, -0.8, -1.30]; SPx = [0.56, 0.57, 0.56, 0.48, 0.32]; SPw = [0.15, 0.17, 0.17, 0.13, 0.05]
    SPb = [0.10, 0.09, 0.09, 0.10, 0.14]; SPt = [0.50, 0.56, 0.55, 0.42, 0.26]
    for sd in (-1, 1):
        R = []
        for k in range(14):
            t = k / 13; zz = lerp(0.40, -1.30, t)
            K = lambda L_: keys(list(zip(SPz[::-1], L_[::-1])), zz)
            cx, hw, yb, yt = K(SPx), K(SPw), K(SPb), K(SPt); yc = (yb + yt) / 2; hh = (yt - yb) / 2
            ring = []
            for i in range(14):
                th = 2 * PI * i / 14; c, s_ = math.cos(th), math.sin(th)
                ring.append((sd * (cx + hw * math.copysign(abs(c) ** (2 / 3.0), c)), yc + hh * math.copysign(abs(s_) ** (2 / 3.0), s_), zz))
            R.append(ring)
        b.rings(R, "paint", cap_m0="carbon")
        b.box((sd * 0.56, 0.36, 0.42), (0.26, 0.04, 0.02), "livery", uv=(0.5, 0.5))
    # floor, plank, diffuser
    b.box((0, 0.075, 0.1), (1.24, 0.03, 2.0), "carbon")
    b.box((0, 0.075, -1.15), (0.98, 0.03, 0.5), "carbon")
    b.box((0, 0.16, -1.75), (0.9, 0.025, 0.6), "carbon", rot_x=0.28)
    for k in range(-2, 3): b.box((k * 0.2, 0.14, -1.7), (0.02, 0.1, 0.5), "carbon", rot_x=0.28)
    # front wing
    b.box((0, 0.10, 2.36), (1.80, 0.025, 0.30), "paint")
    b.box((0, 0.16, 2.24), (1.64, 0.018, 0.16), "livery", rot_x=0.35, uv=(0.5, 0.5))
    b.box((0, 0.21, 2.17), (1.50, 0.015, 0.11), "paint", rot_x=0.55)
    for sd in (-1, 1):
        b.box((sd * 0.91, 0.15, 2.33), (0.02, 0.2, 0.40), "paint")
        b.box((sd * 0.06, 0.145, 2.38), (0.02, 0.08, 0.2), "carbon")
    # rear wing, beam wing, pylon, crash structure light + end-plate LEDs
    b.box((0, 0.90, -2.25), (1.02, 0.03, 0.32), "paint", rot_x=-0.12)
    b.box((0, 1.01, -2.42), (1.02, 0.02, 0.18), "livery", rot_x=-0.45, uv=(0.5, 0.5))
    b.box((0, 0.46, -2.05), (0.86, 0.02, 0.16), "carbon", rot_x=-0.2)
    b.box((0, 0.66, -2.12), (0.035, 0.46, 0.12), "carbon")
    for sd in (-1, 1):
        b.box((sd * 0.52, 0.80, -2.30), (0.025, 0.46, 0.62), "paint")
        b.box((sd * 0.52, 0.60, -2.30), (0.03, 0.08, 0.64), "livery", uv=(0.5, 0.5))
        b.box((sd * 0.52, 0.86, -2.615), (0.03, 0.30, 0.02), "tail")
        C.glows.append([sd * 0.52, 0.86, 0.22, 0.5])
    b.box((0, 0.33, -2.165), (0.11, 0.09, 0.03), "tail"); C.glows.append([0, 0.33, 0.37, 0.3])
    C.sticker = [0.27, 0.92, -2.25, round(-PI / 2 - 0.12, 4)]
    # halo (body colour) + centre pillar, helmet, airbox, mirrors
    hp = [(0.34, 0.66, -0.36), (0.33, 0.84, -0.22), (0.30, 0.93, -0.02), (0.20, 0.96, 0.22), (0.0, 0.97, 0.38),
          (-0.20, 0.96, 0.22), (-0.30, 0.93, -0.02), (-0.33, 0.84, -0.22), (-0.34, 0.66, -0.36)]
    b.tube(hp, 0.032, "paint", seg=8)
    b.tube([(0.0, 0.97, 0.38), (0.0, 0.86, 0.50), (0.0, 0.69, 0.62)], 0.03, "paint", seg=8)
    b.ellipsoid((0, 0.80, -0.16), 0.125, 0.13, 0.14, "livery", seg=14, rings=9, uv=(0.5, 0.5))
    b.box((0, 0.81, -0.05), (0.17, 0.055, 0.06), "glass", rot_x=0.2)
    b.box((0, 0.90, -0.47), (0.2, 0.15, 0.04), "carbon")
    for sd in (-1, 1):
        b.box((sd * 0.52, 0.76, 0.30), (0.13, 0.06, 0.08), "paint")
        b.box((sd * 0.52, 0.76, 0.258), (0.11, 0.045, 0.01), "carbon")
        b.box((sd * 0.42, 0.72, 0.32), (0.12, 0.02, 0.04), "carbon")
    # suspension (static wishbones to the hubs)
    for W_, zz in ((C.WF, 1.70), (C.WR, -1.70)):
        xi = 0.14; xo = W_["x"] - W_["w"] / 2 + 0.03
        for sd in (-1, 1):
            for yy in (0.26, 0.47):
                b.tube([(sd * xi, yy, zz + 0.16), (sd * xo, yy + 0.02, zz)], 0.016, "carbon", seg=5)
                b.tube([(sd * xi, yy, zz - 0.16), (sd * xo, yy + 0.02, zz)], 0.016, "carbon", seg=5)
    # rain-light housing / gearbox cap
    return b

# ================================================================ build one car
def finish_stats(C, body, out_path, tris):
    S = C.S
    ys = [v[1] for v in body.v]; zs = [v[2] for v in body.v]
    tailz = min(v[2] for v in body.tris_of("tail"))
    wb = max(max(abs(v[0]) for v in body.v), C.WF["x"] + C.WF["w"] / 2 + 0.013, C.WR["x"] + C.WR["w"] / 2 + 0.013)
    if S["id"] == "formula": roof = 1.0
    else: roof = max(p[1] for z in (S["ZT"] + 0.3, -0.5, 0.0, 0.3) for p in C.section(z))
    return dict(n=S["n"], bytes=os.path.getsize(out_path), tris=tris, len=round(max(zs) - min(zs), 3), w=round(2 * wb, 3),
                ride=S["FLOOR"], rad=C.WF["r"], radR=C.WR["r"], twF=C.WF["w"], twR=C.WR["w"], tyreX=round(C.WR["x"], 3),
                tyreXF=round(C.WF["x"], 3), xf=C.WF["z"], xr=C.WR["z"], tail=round(tailz, 3), nose=round(max(zs), 3),
                pivotY=S["pivotY"], roofY=round(roof, 3), glows=C.glows, sticker=C.sticker, wing=S["wing"])

def build(cid):
    if cid == "formula":
        S = formula_spec(); new_scene(S); C = FCar(S); body = build_formula(C)
    else:
        S, extras = CARS[cid](); new_scene(S); C = Car(S); wheel_checks(C)
        body = build_loft_body(C); extras(C, body)
    body.to_obj("body", smooth_angle=S.get("smooth", 62))
    add_wheels(S, C.WF, C.WR)
    root = bpy.data.objects.new(cid, None); scene.collection.objects.link(root)
    for ob in list(scene.collection.objects):
        if ob is not root and ob.parent is None: ob.parent = root
    tris = 0
    for ob in scene.collection.objects:
        if ob.type == "MESH": ob.data.calc_loop_triangles(); tris += len(ob.data.loop_triangles)
    out = os.path.join(OUTDIR, cid + ".glb")
    bpy.ops.export_scene.gltf(filepath=out, export_format="GLB", export_apply=True, export_yup=True,
                              export_texcoords=True, export_normals=True, export_materials="EXPORT",
                              export_cameras=False, export_lights=False, export_animations=False)
    st = finish_stats(C, body, out, tris)
    print("BUILT", cid, st["bytes"], "bytes", tris, "tris")
    return st

FALCON = dict(n="Rosso Falcon", len=4.65, w=2.14, ride=0.11, rad=0.37, radR=0.39, twF=0.30, twR=0.38, tyreX=0.865, tyreXF=0.835,
              xf=1.45, xr=-1.42, tail=-2.30, nose=2.35, pivotY=0.32, roofY=1.095,
              glows=[[0.6, 0.745, 0.66, 0.3], [-0.6, 0.745, 0.66, 0.3], [0, 0.6, 0.36, 0.26], [0.3, 0.785, 0.6, 0.16], [-0.3, 0.785, 0.6, 0.16]],
              sticker=[0.6, 1.272, -2.02, round(-PI / 2 - 0.1, 4)], wing=True)
def falcon_import():
    new_scene(dict(paint="#d1121c"))
    p = os.path.join(OUTDIR, "falcon.glb")
    bpy.ops.import_scene.gltf(filepath=p)
    tris = 0
    for ob in scene.objects:
        if ob.type == "MESH": ob.data.calc_loop_triangles(); tris += len(ob.data.loop_triangles)
    return dict(FALCON, bytes=os.path.getsize(p), tris=tris)

# ================================================================ quick-look renders
VIEWS = {
    "chase": (0.0, 1.85, -7.4, 0.0, 0.7, 0.0),
    "rear34": (-4.5, 1.9, -5.0, 0.0, 0.6, 0.0),
    "front34": (4.6, 1.6, 5.0, 0.0, 0.55, 0.0),
    "side": (7.5, 0.9, 0.0, 0.0, 0.6, 0.0),
    "front": (1.2, 1.2, 5.6, 0.0, 0.5, 0.8),
}
def render(cid):
    d = os.path.join(RENDER, cid); os.makedirs(d, exist_ok=True)
    world = bpy.data.worlds.new("w"); scene.world = world; world.use_nodes = True
    bg = world.node_tree.nodes["Background"]; bg.inputs[0].default_value = (0.55, 0.62, 0.72, 1); bg.inputs[1].default_value = 0.9
    sun = bpy.data.lights.new("sun", "SUN"); sun.energy = 3.5
    so = bpy.data.objects.new("sun", sun); scene.collection.objects.link(so); so.rotation_euler = (math.radians(50), 0, math.radians(30))
    g = bpy.data.meshes.new("g"); g.from_pydata([(-20, -20, 0), (20, -20, 0), (20, 20, 0), (-20, 20, 0)], [], [(0, 1, 2, 3)])
    go = bpy.data.objects.new("ground", g); scene.collection.objects.link(go)
    g.materials.append(mat("ground", (0.18, 0.18, 0.2), 0.9))
    try: scene.render.engine = "BLENDER_EEVEE_NEXT"
    except Exception: scene.render.engine = "BLENDER_EEVEE"
    try: scene.eevee.taa_render_samples = 24
    except Exception: pass
    scene.render.resolution_x, scene.render.resolution_y = 900, 560
    scene.view_settings.view_transform = "Standard"
    cam = bpy.data.cameras.new("c"); cam.lens = 40
    co = bpy.data.objects.new("cam", cam); scene.collection.objects.link(co); scene.camera = co
    for nm, (x, y, z, tx, ty, tz) in VIEWS.items():
        co.location = B((x, y, z)); dv = B((tx, ty, tz)) - co.location
        co.rotation_euler = dv.to_track_quat("-Z", "Y").to_euler()
        scene.render.filepath = os.path.join(d, nm + ".png")
        bpy.ops.render.render(write_still=True)

# ================================================================ main
ORDER = ["falcon", "arrow", "shogun", "rally", "kumasi", "kei", "ridge", "formula", "retro", "kente", "viper"]
make_textures()
want = IDS or ORDER
stats = {}
for cid in want:
    st = falcon_import() if cid == "falcon" else build(cid)
    stats[cid] = st
    if RENDER: render(cid)
fleet = {}
if os.path.exists(JSON):
    try: fleet = json.load(open(JSON))
    except Exception: fleet = {}
if "falcon" not in fleet and "falcon" not in stats:
    p = os.path.join(OUTDIR, "falcon.glb"); fleet["falcon"] = dict(FALCON, bytes=os.path.getsize(p), tris=21600)
fleet.update(stats)
fleet = {k: fleet[k] for k in ORDER if k in fleet}
with open(JSON, "w") as f:
    f.write("{\n" + ",\n".join('  "%s": %s' % (k, json.dumps(v, separators=(",", ":"))) for k, v in fleet.items()) + "\n}\n")
print("FLEET", JSON, {k: (v["bytes"], v["tris"]) for k, v in stats.items()})
