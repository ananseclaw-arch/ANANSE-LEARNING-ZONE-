# Grand Fable GP - Rosso Falcon #7 "Meshy" vertical slice: a real shape from Meshy 6 Lite (CC BY 4.0, untextured), painted by script.
# Run (Blender 4.2 headless):
#   Blender -b --factory-startup -P build_meshy_falcon.py -- <raw.glb> <out.glb> [render_dir] [workdir]
# Everything is in GAME coordinates (x, y up, z nose, metres) and mapped to Blender as (x, -z, y), same as build_car.py, so glTF export (+Y up)
# comes back out exactly in game coordinates. Node names + material names match what race3d.js drives:
#   body (springs), hub_FL/FR/RL/RR (steer), wheel_XX (spin about x), caliper_XX; materials swapped by name (paint, stripe, tail, carbon, glass ...)
# Steps: scale/orient -> decimate -> cut the fused wheels out with booleans -> black arch liners -> delete faces nobody can ever see ->
# light smooth -> decimate -> cut crisp paint boundaries into the mesh (planes through hand-fitted outlines) -> assign materials ->
# new lathed wheels -> UV + baked ambient-occlusion/panel-line map -> GLB.
import bpy, bmesh, math, os, sys, time
from mathutils import Vector, Matrix
from mathutils.bvhtree import BVHTree

a = sys.argv[sys.argv.index("--") + 1:]
SRC, OUT = a[0], a[1]
RENDER = a[2] if len(a) > 2 and a[2] != "-" else None
WORK = a[3] if len(a) > 3 else os.path.dirname(os.path.abspath(OUT))
HERE = os.path.dirname(os.path.abspath(__file__))
BODY_TARGET = 19500
BAKE = os.environ.get("BAKE", "1") == "1"
BAKE_SIZE = int(os.environ.get("BAKE_SIZE", "1024"))
t0 = time.time()
def log(*x): print(f"[{time.time() - t0:6.1f}s]", *x, flush=True)

# ---------------------------------------------------- measured from the raw mesh (see lz-gp-meshy-shots/blender/measure.py)
RAW_S = 4.65 / 1.8986
RAW_WB_C = (-.4875 + .616) / 2     # wheelbase centre on the raw x axis: the game pivots the car about this
RAW_GROUND = -.2535
TYRE_R = .385
XF, XR = (.4875 + RAW_WB_C) * RAW_S, -(.616 - RAW_WB_C) * RAW_S
TYRE_X = .845          # tyre centre line
TYRE_W = .31
CUT_R, X_IN, X_LINER = .412, .61, .94

def B(x, y, z): return Vector((x, -z, y))
def G(v): return (v.x, v.z, -v.y)

# ---------------------------------------------------- load + orient
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)
ob = [o for o in bpy.data.objects if o.type == "MESH"][0]
ob.name = "body"; m = ob.data; m.name = "body"
T = Matrix(((0, -1, 0, 0), (1, 0, 0, -RAW_WB_C * RAW_S), (0, 0, 1, 0), (0, 0, 0, 1)))
m.transform(T @ Matrix.Scale(RAW_S, 4) @ Matrix.Translation((0, 0, -RAW_GROUND)))
ob.matrix_world = Matrix.Identity(4); m.update()
bpy.context.view_layer.objects.active = ob; ob.select_set(True)
def apply(md): bpy.ops.object.modifier_apply(modifier=md.name)

# ---------------------------------------------------- materials (names are the contract with race3d.js; Blender values only drive the previews/bake)
def srgb(h):
    h = h.lstrip("#"); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple((x / 12.92) if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c)
def mat(name, col, rough=.5, metal=0., emit=None, es=0., coat=0.):
    mt = bpy.data.materials.new(name); mt.use_nodes = True; b = mt.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*col, 1); b.inputs["Roughness"].default_value = rough; b.inputs["Metallic"].default_value = metal
    b.inputs["Coat Weight"].default_value = coat; b.inputs["Coat Roughness"].default_value = .05
    if emit: b.inputs["Emission Color"].default_value = (*emit, 1); b.inputs["Emission Strength"].default_value = es
    return mt
MATS = {n: mat(n, *v[:2], **(v[2] if len(v) > 2 else {})) for n, v in {
    "paint": (srgb("#c8101a"), .26, dict(metal=.05, coat=1.)),
    "stripe": (srgb("#f2f2ee"), .3, dict(coat=.8)),
    "carbon": (srgb("#101114"), .42, dict(metal=.25)),
    "glass": (srgb("#0a1119"), .06, dict(metal=.6)),
    "lamp": (srgb("#ffffff"), .12, dict(emit=(1, .97, .9), es=2.)),
    "tail": (srgb("#7a0208"), .2, dict(emit=(1, .05, .03), es=.8)),
    "exhaust": (srgb("#232326"), .4, dict(metal=.7)),
    "taillens": (srgb("#3e0408"), .08, dict(metal=.2, coat=1.)),
    "tyre": (srgb("#131315"), .9, {}),
    "tyrewall": (srgb("#232327"), .7, {}),
    "rim": (srgb("#c9ccd2"), .25, dict(metal=.9)),
    "rimdark": (srgb("#2a2c31"), .35, dict(metal=.7)),
    "spoke": (srgb("#c6cad0"), .28, dict(metal=.85)),
    "disc": (srgb("#6c6e72"), .4, dict(metal=.8)),
    "caliper": (srgb("#c8101a"), .4, dict(metal=.1)),
}.items()}
# number panel: the decal texture is drawn in the panel step below
MIDX = {n: i for i, n in enumerate(["paint", "stripe", "carbon", "glass", "lamp", "tail", "taillens", "rim", "exhaust", "tyre", "decal"])}
glass_img = bpy.data.images.load(os.path.join(HERE, "meshy_glass.png")); gb_ = MATS["glass"].node_tree; gt_ = gb_.nodes.new("ShaderNodeTexImage"); gt_.image = glass_img
gb_.links.new(gt_.outputs["Color"], gb_.nodes["Principled BSDF"].inputs["Base Color"])

# ---------------------------------------------------- 1) coarse decimate, cut the wheels out
md = ob.modifiers.new("d", "DECIMATE"); md.ratio = .4; apply(md); log("decimate 1", len(m.polygons))
def cutter(zc, side):
    bm = bmesh.new(); N = 60; hub = TYRE_R
    pts = [(zc + CUT_R * math.cos(math.pi * i / N), hub + CUT_R * math.sin(math.pi * i / N)) for i in range(N + 1)] + [(zc - CUT_R, -.5), (zc + CUT_R, -.5)]
    x0, x1 = (X_IN, 1.6) if side > 0 else (-1.6, -X_IN)
    r0 = [bm.verts.new(B(x0, y, z)) for z, y in pts]; r1 = [bm.verts.new(B(x1, y, z)) for z, y in pts]; n = len(pts)
    bm.faces.new(r0); bm.faces.new(list(reversed(r1)))
    for i in range(n): bm.faces.new([r0[i], r1[i], r1[(i + 1) % n], r0[(i + 1) % n]])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new("cut"); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new("cut", me); bpy.context.scene.collection.objects.link(o); return o
for zc in (XF, XR):
    for side in (1, -1):
        c = cutter(zc, side); md = ob.modifiers.new("b", "BOOLEAN"); md.operation = "DIFFERENCE"; md.solver = "EXACT"; md.object = c; md.material_mode = "TRANSFER"
        apply(md); bpy.data.objects.remove(c)
log("wheels cut", len(m.polygons))

# ---------------------------------------------------- 2) arch liners: hide Meshy's interior junk, then delete everything no outside ray can reach
for mname in ("paint", "tyre"):
    m.materials.append(MATS[mname])
liner_idx = list(m.materials).index(MATS["tyre"])
bm = bmesh.new(); bm.from_mesh(m)
def add_liner(zc, side):
    N = 40; R = CUT_R + .003; hub = TYRE_R
    def ring(x):
        pts = []
        for i in range(N + 1):
            an = math.pi * i / N; pts.append(bm.verts.new(B(x, hub + R * math.sin(an), zc + R * math.cos(an))))
        return pts
    inner = ring(side * X_IN); outer = ring(side * X_LINER)
    for i in range(N):
        q = [inner[i], outer[i], outer[i + 1], inner[i + 1]]
        f = bm.faces.new(q); f.normal_update(); mid = (inner[i].co + outer[i + 1].co) / 2; axis = B(mid.x, hub, -mid.y)
        if f.normal.dot(axis - mid) < 0: f.normal_flip()   # liner faces the hub (single-sided in the game)
        f.material_index = liner_idx
    # inner wall, tube below the hub: the flat plate + the two front/rear strips stop see-through at the bottom
    lo = bm.verts.new(B(side * X_IN, .16, zc + R)); lo2 = bm.verts.new(B(side * X_IN, .16, zc - R))
    plate = inner + [lo2, lo]
    f = bm.faces.new(plate); f.normal_update()
    if f.normal.dot(Vector((side, 0, 0))) < 0: f.normal_flip()
    f.material_index = liner_idx
for zc in (XF, XR):
    for s in (1, -1): add_liner(zc, s)
bmesh.ops.triangulate(bm, faces=[f for f in bm.faces if len(f.verts) > 4])
bm.to_mesh(m); bm.free(); m.update()
# visibility cull
tree = BVHTree.FromObject(ob, bpy.context.evaluated_depsgraph_get())
dirs = []
n_dirs = 48
for i in range(n_dirs):
    y = 1 - (i + .5) * 2 / n_dirs; r = math.sqrt(1 - y * y); t = i * 2.39996
    dirs.append(Vector((math.cos(t) * r, y, math.sin(t) * r)))
bm = bmesh.new(); bm.from_mesh(m); bm.faces.ensure_lookup_table(); dead = []
for f in bm.faces:
    if f.material_index == liner_idx: continue
    c = f.calc_center_median(); n = f.normal; vis = False
    for d in [n] + dirs:
        hit = tree.ray_cast(c + n * .004 + d * .002, d, 9.)
        if hit[0] is None: vis = True; break
    if not vis: dead.append(f)
log("hidden faces removed", len(dead), "of", len(bm.faces))
bmesh.ops.delete(bm, geom=dead, context="FACES"); bm.to_mesh(m); bm.free(); m.update()

# ---------------------------------------------------- 3) light smooth + final decimate. Liners stay exact (vertex group locks them out of the smooth)
vg = ob.vertex_groups.new(name="free")
vg.add([v.index for v in m.vertices if not any(m.polygons[0] is None for _ in ())], 1., "REPLACE")
bm = bmesh.new(); bm.from_mesh(m); bm.verts.ensure_lookup_table(); liner_v = set()
for f in bm.faces:
    if f.material_index == liner_idx: liner_v.update(v.index for v in f.verts)
bm.free()
vg.remove(list(liner_v))
sm = ob.modifiers.new("s", "SMOOTH"); sm.factor = .6; sm.iterations = 6; sm.vertex_group = "free"; apply(sm)
vt = ob.vertex_groups.new(name="tailp"); vt.add([v.index for v in m.vertices if -2.2 < -v.co.y < -1.7 and .33 < v.co.z < .92 and v.index not in liner_v], 1., "REPLACE")
sm = ob.modifiers.new("s", "SMOOTH"); sm.factor = .7; sm.iterations = 14; sm.vertex_group = "tailp"; apply(sm)
md = ob.modifiers.new("d", "DECIMATE"); md.ratio = BODY_TARGET / len(m.polygons); md.use_collapse_triangulate = True; apply(md); log("decimate 2", len(m.polygons))
ob.vertex_groups.clear()

# ---------------------------------------------------- 4) paint zones: planes through hand-fitted outlines cut crisp edges, then faces are classified
OUTLINES = {  # (axis pair, [points]) axis pair picks the projection the outline is drawn in
 # side windows (z,y) - right side, mirrored to left
 "window": ("zy", [(.86, .79), (.70, .92), (.46, 1.075), (.18, 1.155), (-.12, 1.135), (-.36, 1.045), (-.455, .965), (-.33, .905), (-.05, .87), (.28, .84), (.58, .815), (.76, .80)]),
}
def build_outlines():
    return OUTLINES
def inpoly(p, poly):
    x, y = p; c = False; n = len(poly)
    for i in range(n):
        x1, y1 = poly[i]; x2, y2 = poly[(i + 1) % n]
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1 + 1e-12) + x1: c = not c
    return c
def smooth_poly(pts, closed=True, it=2):
    """Chaikin corner cutting: hand points become a smooth outline"""
    p = list(pts)
    for _ in range(it):
        q = []; n = len(p)
        for i in range(n):
            a_, b_ = p[i], p[(i + 1) % n]
            q.append((a_[0] * .75 + b_[0] * .25, a_[1] * .75 + b_[1] * .25)); q.append((a_[0] * .25 + b_[0] * .75, a_[1] * .25 + b_[1] * .75))
        p = q
    return p
def proj(v, ax):
    g = G(v); return {"zy": (g[2], g[1]), "xz": (g[0], g[2]), "xy": (g[0], g[1])}[ax]
def plane_for(a2, b2, ax):
    """plane containing the 2D edge and the projection axis, in Blender coords"""
    if ax == "zy": p1 = B(0, a2[1], a2[0]); p2 = B(0, b2[1], b2[0]); w = Vector((1, 0, 0))
    elif ax == "xz": p1 = B(a2[0], 0, a2[1]); p2 = B(b2[0], 0, b2[1]); w = Vector((0, 0, 1))
    else: p1 = B(a2[0], a2[1], 0); p2 = B(b2[0], b2[1], 0); w = Vector((0, 1, 0))
    n = (p2 - p1).cross(w).normalized(); return p1, n

bm = bmesh.new(); bm.from_mesh(m)
for mname in MIDX:
    if mname == "decal": continue
    if MATS[mname].name not in [x.name for x in m.materials if x]: m.materials.append(MATS[mname])
bm.to_mesh(m); bm.free(); m.update()
# rebuild index map after material list changes
mat_names = [x.name if x else "" for x in m.materials]
def IDX(name): return mat_names.index(name)

ZONES = []  # (name, material, ax, polygon, face filter)
def zone(mat_name, ax, poly, flt, smooth=True):
    ZONES.append((mat_name, ax, smooth_poly(poly, it=2 if mat_name == "glass" else 1) if smooth else list(poly), flt))
def mirrored(poly, ax):
    return [(-p[0], p[1]) for p in poly] if ax[0] == "x" else poly
ZSIDE = [(.84, .79), (.68, .92), (.44, 1.078), (.18, 1.156), (-.12, 1.137), (-.37, 1.05), (-.47, .965), (-.33, .905), (-.05, .87), (.28, .84), (.58, .815), (.76, .80)]
RSCOOP = [(-.52, .86), (-.76, .9), (-.975, .87), (-.985, .76), (-.88, .69), (-.74, .7), (-.62, .76)]
# windows: z/y outlines, both sides. Filter: only faces pointing mostly sideways on that side
for s in (1, -1):
    zone("glass", "zy", ZSIDE, lambda f, c, n, g, s=s: g[0] * s > .1 and abs(n.x) > .25 and n.x * s > 0)
    zone("carbon", "zy", RSCOOP, lambda f, c, n, g, s=s: g[0] * s > .1 and n.x * s > -.2)
# windscreen + rear screen (top projection, x/z)
WIND_F = [(.0, 1.285), (.3, 1.25), (.5, 1.14), (.62, 1.0), (.68, .82), (.66, .72), (.5, .58), (.2, .48), (.0, .46), (-.2, .48), (-.5, .58), (-.66, .72), (-.68, .82), (-.62, 1.0), (-.5, 1.14), (-.3, 1.25)]
zone("glass", "xz", WIND_F, lambda f, c, n, g: n.z > .3 and g[1] > .8)
REAR_S = [(0, -.42), (.24, -.43), (.4, -.5), (.44, -.82), (.36, -.92), (0, -.94), (-.36, -.92), (-.44, -.82), (-.4, -.5), (-.24, -.43)]
zone("glass", "xz", REAR_S, lambda f, c, n, g: n.z > .3 and g[1] > .85)
for s in (1, -1):   # thin dark trims on the arch edges, where the Meshy flare meets the cut
    zone("carbon", "zy", [(.905, .27), (.998, .27), (1.0, .5), (.97, .62), (.91, .62)], lambda f, c, n, g, s=s: g[0] * s > .1 and n.x * s > .1)
    zone("carbon", "zy", [(-.905, .27), (-.998, .27), (-1.0, .5), (-.97, .6), (-.905, .6)], lambda f, c, n, g, s=s: g[0] * s > .1 and n.x * s > .1)
# bonnet vents and cowl: black
for s in (1, -1):
    zone("carbon", "xz", [(s * .22, 1.66), (s * .3, 1.6), (s * .39, 1.65), (s * .405, 1.8), (s * .33, 1.87), (s * .25, 1.84)], lambda f, c, n, g, s=s: n.z > .15 and g[0] * s > 0)
zone("carbon", "xz", [(0, 1.32), (.34, 1.28), (.56, 1.12), (.69, .98), (.72, 1.05), (.6, 1.2), (.34, 1.34), (0, 1.38), (-.34, 1.34), (-.6, 1.2), (-.72, 1.05), (-.69, .98), (-.56, 1.12), (-.34, 1.28)], lambda f, c, n, g: n.z > .05 and g[1] > 1.)
# front: intakes + chin (x/y projection, nose faces)
for s in (1, -1):
    zone("carbon", "xy", [(s * .21, .275), (s * .22, .445), (s * .4, .46), (s * .64, .44), (s * .73, .39), (s * .76, .28), (s * .66, .255), (s * .42, .25)], lambda f, c, n, g, s=s: g[2] > 1.6 and n.y < .6 and g[0] * s > 0)
zone("carbon", "xy", [(-.16, .19), (.16, .19), (.16, .41), (-.16, .41)], lambda f, c, n, g: g[2] > 1.6 and n.y < .6, smooth=False)
for s in (1, -1):   # headlamps: slanted shapes on the front corners (top projection), dark surround first then bright lamp inside
    zone("glass", "xz", [(s * .56, 2.24), (s * .76, 2.13), (s * .93, 1.96), (s * .95, 1.87), (s * .82, 1.98), (s * .62, 2.1)], lambda f, c, n, g, s=s: n.z > 0 and g[0] * s > 0)
    zone("rim", "xz", [(s * .715, 2.075), (s * .755, 2.06), (s * .77, 2.02), (s * .74, 2.0), (s * .7, 2.02), (s * .69, 2.055)], lambda f, c, n, g, s=s: n.z > 0 and g[0] * s > 0)
    zone("lamp", "xz", [(s * .63, 2.19), (s * .77, 2.11), (s * .89, 1.98), (s * .905, 1.94), (s * .79, 2.05), (s * .65, 2.15)], lambda f, c, n, g, s=s: n.z > 0 and g[0] * s > 0)
# tail: lights, plate recess and exhaust surrounds (x/y seen from the back)
for s in (1, -1):
    zone("taillens", "xy", [(s * .39, .732), (s * .54, .796), (s * .73, .816), (s * .86, .785), (s * .875, .705), (s * .7, .67), (s * .5, .68)], lambda f, c, n, g, s=s: g[2] < -1.6 and n.y > .15 and g[0] * s > 0)
    zone("tail", "xy", [(s * .46, .752), (s * .57, .783), (s * .72, .799), (s * .835, .775), (s * .84, .751), (s * .72, .768), (s * .58, .755), (s * .49, .735)], lambda f, c, n, g, s=s: g[2] < -1.6 and n.y > .15 and g[0] * s > 0)
    zone("exhaust", "xy", [(s * .27, .29), (s * .32, .44), (s * .47, .475), (s * .58, .4), (s * .62, .29), (s * .46, .26)], lambda f, c, n, g, s=s: g[2] < -1.7 and g[0] * s > 0)
zone("carbon", "xy", [(-.24, .5), (.24, .5), (.24, .62), (-.24, .62)], lambda f, c, n, g: g[2] < -1.7 and n.y > .1, smooth=False)
log("zones", len(ZONES))
# number panel polygons (uv-mapped afterwards)
NUM_RECT = [(.46, .37), (.46, .77), (.84, .77), (.84, .37)]
# stripes: planes at |x| = STR_IN/OUT
STR_IN, STR_OUT = .05, .25

bm = bmesh.new(); bm.from_mesh(m); bm.faces.ensure_lookup_table()
def cut_outline(poly, ax, flt, closed=True):
    """bisect only faces near the outline edge (bbox test), so cut lines never run across the rest of the car"""
    n = len(poly)
    for i in range(n if closed else n - 1):
        a2, b2 = poly[i], poly[(i + 1) % n]
        pl_co, pl_no = plane_for(a2, b2, ax)
        lo = (min(a2[0], b2[0]) - .015, min(a2[1], b2[1]) - .015); hi = (max(a2[0], b2[0]) + .015, max(a2[1], b2[1]) + .015)
        sel = []
        for f in bm.faces:
            if not f.is_valid: continue
            c = f.calc_center_median(); pp = [proj(v.co, ax) for v in f.verts]
            # the face's own box must overlap the edge's box (big triangles reach across several outline edges)
            if max(p_[0] for p_ in pp) < lo[0] or min(p_[0] for p_ in pp) > hi[0] or max(p_[1] for p_ in pp) < lo[1] or min(p_[1] for p_ in pp) > hi[1]: continue
            if flt and not flt(f, c, f.normal, G(c)): continue
            sel.append(f)
        if not sel: continue
        geom = list({e for f in sel for e in f.edges}) + sel + list({v for f in sel for v in f.verts})
        bmesh.ops.bisect_plane(bm, geom=geom, dist=.0005, plane_co=pl_co, plane_no=pl_no, clear_inner=False, clear_outer=False)
    bm.faces.ensure_lookup_table()
for name, ax, poly, flt in ZONES:
    cut_outline(poly, ax, flt)
log("outline cuts done", len(bm.faces))
# stripes
for x_ in (STR_IN, STR_OUT, -STR_IN, -STR_OUT):
    sel = [f for f in bm.faces if f.is_valid and abs(G(f.calc_center_median())[0] - x_) < .12 and G(f.calc_center_median())[1] > .4 and f.material_index != liner_idx]
    geom = list({e for f in sel for e in f.edges}) + sel + list({v for f in sel for v in f.verts})
    bmesh.ops.bisect_plane(bm, geom=geom, dist=.0005, plane_co=B(x_, 0, 0), plane_no=Vector((1, 0, 0)))
# skirts, splitter, diffuser, wing are height/position cuts
for y_, zlo, zhi in ((.262, -.99, .99), (.25, 1.6, 3.), (.3, -3., -1.44), (.462, -3., -1.72)):
    sel = [f for f in bm.faces if f.is_valid and zlo < G(f.calc_center_median())[2] < zhi and min(G(v.co)[1] for v in f.verts) < y_ + .002 and max(G(v.co)[1] for v in f.verts) > y_ - .002 and f.material_index != liner_idx]
    geom = list({e for f in sel for e in f.edges}) + sel + list({v for f in sel for v in f.verts})
    bmesh.ops.bisect_plane(bm, geom=geom, dist=.0005, plane_co=B(0, y_, 0), plane_no=Vector((0, 0, 1)))
# number panel cuts, both sides
for s in (1, -1):
    def flt(f, c, n, g, s=s): return g[0] * s > .1 and n.x * s > .1
    for i in range(4):
        a2, b2 = NUM_RECT[i], NUM_RECT[(i + 1) % 4]; pc, pn = plane_for(a2, b2, "zy")
        sel = [f for f in bm.faces if f.is_valid and flt(f, f.calc_center_median(), f.normal, G(f.calc_center_median())) and max(G(v.co)[2] for v in f.verts) > min(a2[0], b2[0]) - .02 and min(G(v.co)[2] for v in f.verts) < max(a2[0], b2[0]) + .02 and max(G(v.co)[1] for v in f.verts) > min(a2[1], b2[1]) - .02 and min(G(v.co)[1] for v in f.verts) < max(a2[1], b2[1]) + .02]
        if sel:
            geom = list({e for f in sel for e in f.edges}) + sel + list({v for f in sel for v in f.verts})
            bmesh.ops.bisect_plane(bm, geom=geom, dist=.0005, plane_co=pc, plane_no=pn)
bm.faces.ensure_lookup_table()
# classification (later rules win)
base = IDX("paint")
def is_liner(f): return f.material_index == liner_idx
for f in bm.faces:
    if is_liner(f): continue
    f.material_index = base
for f in bm.faces:
    if is_liner(f): continue
    c = f.calc_center_median(); n = f.normal; g = G(c)
    if STR_IN < abs(g[0]) < STR_OUT and g[1] > .4 and g[2] > -1.86 and (g[2] > -1.7 or n.z > .3) and (n.z > .1 or (n.y < -.5 and g[1] > .42) or (n.y > .5 and g[1] > .85)):
        f.material_index = IDX("stripe")
    for name, ax, poly, flt in ZONES:
        if flt(f, c, n, g) and inpoly(proj(c, ax), poly): f.material_index = IDX(name)
    if g[1] < .262 and -.97 < g[2] < .97 and abs(g[0]) > .3: f.material_index = IDX("carbon")          # side skirts
    if g[2] > 1.6 and g[1] < .25: f.material_index = IDX("carbon")                                                   # splitter
    if g[2] < -1.44 and g[1] < .3: f.material_index = IDX("carbon")
    if g[2] < -1.72 and g[1] < .462 and abs(g[0]) < .78 and f.material_index != IDX("exhaust"): f.material_index = IDX("carbon")   # GT-style black diffuser panel over the rough lower bumper                                                     # diffuser
    if g[2] < -1.66 and (g[1] > .955 or (.24 < abs(g[0]) < .44 and g[1] > .9)): f.material_index = IDX("carbon")                                                  # wing, endplates, uprights
    if abs(g[0]) < .2 and -2. < g[2] < -1.5 and g[1] > .92 and n.z < .3: f.material_index = IDX("carbon")
# number panel: own material + planar uv
decal_img = bpy.data.images.load(os.path.join(HERE, "meshy_num7.png")); decal_img.colorspace_settings.name = "sRGB"
decal = bpy.data.materials.new("decal"); decal.use_nodes = True; bs = decal.node_tree.nodes["Principled BSDF"]; bs.inputs["Roughness"].default_value = .3
tx = decal.node_tree.nodes.new("ShaderNodeTexImage"); tx.image = decal_img; decal.node_tree.links.new(tx.outputs["Color"], bs.inputs["Base Color"])
m.materials.append(decal); mat_names = [x.name if x else "" for x in m.materials]
uv = bm.loops.layers.uv.new("UVMap") if not bm.loops.layers.uv else bm.loops.layers.uv[0]
zs = [p[0] for p in NUM_RECT]; ys = [p[1] for p in NUM_RECT]
z0, z1, y0, y1 = min(zs), max(zs), min(ys), max(ys)
for f in bm.faces:
    c = f.calc_center_median(); g = G(c)
    if abs(g[0]) < .1 or f.normal.x * g[0] < .1 or not (z0 <= g[2] <= z1 and y0 <= g[1] <= y1) or f.material_index != base: continue
    f.material_index = mat_names.index("decal")
    for l in f.loops:
        gg = G(l.vert.co); u = (gg[2] - z0) / (z1 - z0); v = (gg[1] - y0) / (y1 - y0)
        if g[0] > 0: u = 1 - u
        l[uv].uv = (u, v)
bm.to_mesh(m); bm.free(); m.validate(); m.update(); log("tris", sum(len(p.vertices) - 2 for p in m.polygons)); log("painted", len(m.polygons), [m.materials[i].name for i in sorted(set(p.material_index for p in m.polygons))])
for p in m.polygons: p.use_smooth = True
bpy.ops.object.shade_smooth_by_angle(angle=math.radians(48))
# ---------------------------------------------------- wheels (lathed, separate nodes)
def lathe(vs, fs, mids, profile, seg, mid, flip):
    """profile: [(x, r)], x outward from car centre (local). returns ring start."""
    start = len(vs)
    for x_, r_ in profile:
        for i in range(seg):
            a2 = 2 * math.pi * i / seg; vs.append((x_, r_ * math.cos(a2), r_ * math.sin(a2)))
    n = len(profile)
    for j in range(n - 1):
        for i in range(seg):
            p0 = start + j * seg + i; p1 = start + j * seg + (i + 1) % seg; p2 = start + (j + 1) * seg + (i + 1) % seg; p3 = start + (j + 1) * seg + i
            fs.append([p0, p1, p2, p3] if not flip else [p3, p2, p1, p0]); mids.append(mid)
def build_mesh(name, vs, fs, mids, side, smooth=40.):
    me = bpy.data.meshes.new(name); pts = [Vector((v[0] * side, v[1], v[2])) for v in vs]
    # flip for mirrored side
    if side < 0: fs = [list(reversed(f)) for f in fs]
    me.from_pydata([(p.x, p.y, p.z) for p in pts], [], fs); used = sorted(set(mids), key=mids.index)
    for u in used: me.materials.append(MATS[u])
    for p, md_ in zip(me.polygons, mids): p.material_index = used.index(md_)
    me.validate(); me.update(); return me
def wheel_geo(r, tw, seg=26):
    vs, fs, ms = [], [], []
    hw = tw / 2; rr = r * .7   # rim radius (19in look)
    # tyre: inner bead -> shoulder -> tread (with grooves) -> shoulder -> outer bead (x>0 is the outer side)
    lathe(vs, fs, ms, [(hw, rr * 1.02), (hw + .018, rr + .05), (hw + .012, r - .045), (hw - .012, r - .012)], seg, "tyrewall", True)
    lathe(vs, fs, ms, [(hw - .012, r - .012), (hw - .05, r), (-hw + .05, r), (-hw + .012, r - .012)], seg, "tyre", True)
    lathe(vs, fs, ms, [(-hw + .012, r - .012), (-hw - .012, r - .045), (-hw - .018, rr + .05), (-hw, rr * 1.02)], seg, "tyrewall", True)
    # rim barrel + outer lip
    lathe(vs, fs, ms, [(hw + .008, rr * 1.04), (hw + .004, rr), (hw - .03, rr - .012)], seg, "rim", False)
    lathe(vs, fs, ms, [(hw - .03, rr - .012), (hw - .05, rr - .03), (-hw + .03, rr - .03), (-hw + .03, rr * .55)], seg, "rimdark", False)
    # brake disc (behind spokes)
    lathe(vs, fs, ms, [(hw * .1, rr * .86), (hw * .1, rr * .26)], seg, "disc", False)
    lathe(vs, fs, ms, [(hw * .1 + .012, rr * .86), (hw * .1 + .012, rr * .26)], seg, "disc", True)
    # spokes: 10 split spokes, each a bent prism from hub to lip, set back from the outer face
    N = 10; xf_ = hw - .05; xb_ = hw - .125; r0 = rr * .19; r1 = rr * .985
    for i in range(N):
        an = 2 * math.pi * i / N
        for sgn in (-1, 1):
            hw0 = .017; hw1 = .012
            off0 = sgn * .013; off1 = sgn * .05   # Y split: spokes spread to the rim
            base_i = len(vs)
            def pt(rad, off, x_):
                return (x_, rad * math.cos(an) - off * math.sin(an), rad * math.sin(an) + off * math.cos(an))
            for rad, off, hw_ in ((r0, off0, hw0), (r1, off1, hw1)):
                for dx, ds in ((xf_, -hw_), (xf_, hw_), (xb_, hw_), (xb_, -hw_)):
                    vs.append(pt(rad, off + ds, dx))
            for q in range(4):
                a_ = base_i + q; b_ = base_i + (q + 1) % 4; c_ = base_i + 4 + (q + 1) % 4; d_ = base_i + 4 + q
                fs.append([a_, d_, c_, b_]); ms.append("spoke")
    # hub cap + centre lock
    base_i = len(vs); hs = 16
    for x_, r_ in ((xf_ + .004, rr * .24), (xf_ + .022, rr * .2), (xf_ + .03, rr * .13), (xb_, rr * .24)):
        for i in range(hs):
            a2 = 2 * math.pi * i / hs; vs.append((x_, r_ * math.cos(a2), r_ * math.sin(a2)))
    for j in range(3):
        for i in range(hs):
            p0 = base_i + j * hs + i; p1 = base_i + j * hs + (i + 1) % hs; p2 = base_i + (j + 1) * hs + (i + 1) % hs; p3 = base_i + (j + 1) * hs + i
            fs.append([p3, p2, p1, p0]); ms.append("spoke" if j < 2 else "rimdark")
    fs.append([base_i + 2 * hs + i for i in reversed(range(hs))]); ms.append("rimdark")
    # hub cap face
    return vs, fs, ms
wmesh = {}
for side in (1, -1):
    v_, f_, m_ = wheel_geo(TYRE_R, TYRE_W); wmesh[side] = build_mesh(f"wheelmesh_{'R' if side > 0 else 'L'}", v_, f_, m_, side)
    wmesh[side].polygons.foreach_set("use_smooth", [True] * len(wmesh[side].polygons)); wmesh[side].update()
def caliper_mesh(r, side):
    vs, fs, ms = [], [], []
    # curved block on the disc, behind the spokes: arc segments in local coords (x outward)
    x0, x1 = .05, .135; r0, r1 = r * .41, r * .545
    st = len(vs); seg = 6; a0, a1 = 2.45, 3.45
    for i in range(seg + 1):
        an = a0 + (a1 - a0) * i / seg
        for rad, xx in ((r0, x0), (r1, x0), (r1, x1), (r0, x1)):
            vs.append((xx, rad * math.cos(an), rad * math.sin(an)))
    for i in range(seg):
        for q in range(4):
            a_ = st + i * 4 + q; b_ = st + i * 4 + (q + 1) % 4; c_ = st + (i + 1) * 4 + (q + 1) % 4; d_ = st + (i + 1) * 4 + q
            fs.append([a_, b_, c_, d_]); ms.append("caliper")
    fs.append([st, st + 1, st + 2, st + 3]); ms.append("caliper"); e = st + seg * 4; fs.append([e + 3, e + 2, e + 1, e]); ms.append("caliper")
    return build_mesh(f"calipermesh_{'R' if side > 0 else 'L'}", vs, fs, ms, side)
cal = {side: caliper_mesh(TYRE_R, side) for side in (1, -1)}
root = bpy.data.objects.new("falcon", None); bpy.context.scene.collection.objects.link(root); ob.parent = root
for name, zc, side in (("FL", XF, 1), ("FR", XF, -1), ("RL", XR, 1), ("RR", XR, -1)):
    hub = bpy.data.objects.new("hub_" + name, None); bpy.context.scene.collection.objects.link(hub); hub.parent = root; hub.location = B(side * TYRE_X, TYRE_R, zc)
    w = bpy.data.objects.new("wheel_" + name, wmesh[side]); bpy.context.scene.collection.objects.link(w); w.parent = hub
    c = bpy.data.objects.new("caliper_" + name, cal[side]); bpy.context.scene.collection.objects.link(c); c.parent = hub
log("wheels built")

# ---------------------------------------------------- optional bake (paint map: AO x panel lines) - body only, stored as material 'body_ao' for the game
exec(open(os.path.join(HERE, "meshy_falcon_bake.py")).read()) if BAKE else None

# ---------------------------------------------------- export
bpy.ops.object.select_all(action="DESELECT")
for o in bpy.data.objects: o.select_set(True)
bpy.ops.export_scene.gltf(filepath=OUT, export_format="GLB", export_apply=True, export_yup=True, use_selection=True,
    export_materials="EXPORT", export_texcoords=True, export_normals=True, export_tangents=False, export_cameras=False, export_lights=False,
    export_image_format="JPEG" if BAKE else "AUTO", export_jpeg_quality=78, export_draco_mesh_compression_enable=False, export_animations=False, export_skins=False, export_morph=False)
log("exported", OUT, os.path.getsize(OUT))
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(WORK, "final.blend"))
if RENDER:
    exec(open(os.path.join(HERE, "meshy_falcon_previews.py")).read())
