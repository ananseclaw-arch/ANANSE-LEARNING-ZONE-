# Grand Fable GP - low-poly TRAFFIC vehicles for the street courses (City Circuit, Accra, Coast), built headless in Blender 4.2.
# Run: Blender -b -P build_traffic.py -- <out.glb> [render_dir]
# Game coordinates (x = right, y = up, z = forward/nose, metres) mapped to Blender (x, -z, y), like build_car.py.
# One root object per vehicle type (sedan, hatch, taxi, ghtaxi, van, trotro, bus); each root holds ONE mesh with a primitive per
# material. race3d.js merges every type into a few InstancedMeshes: "paint" (tinted per car), "glass", and everything else
# (vertex-coloured from the material colour). No wheels spin (traffic is seen from behind at modest speed), so ~600-1400 tris each.
import bpy, bmesh, math, sys, os
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = argv[0] if argv else "/tmp/traffic.glb"
RENDER = argv[1] if len(argv) > 1 else None
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
def B(p): return Vector((p[0], -p[2], p[1]))
def srgb(h):
    h = h.lstrip("#"); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple((x / 12.92) if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c)
def mat(name, col, rough=0.5, metal=0.0, emit=None, es=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*col, 1); b.inputs["Roughness"].default_value = rough; b.inputs["Metallic"].default_value = metal
    if emit: b.inputs["Emission Color"].default_value = (*emit, 1); b.inputs["Emission Strength"].default_value = es
    return m
M = {"paint": mat("paint", srgb("#ffffff"), 0.35, 0.1), "glass": mat("glass", srgb("#1a2430"), 0.08, 0.3),
     "trim": mat("trim", srgb("#1c1d21"), 0.6), "tyre": mat("tyre", srgb("#161618"), 0.9), "rim": mat("rim", srgb("#9ea3aa"), 0.35, 0.6),
     "lamp": mat("lamp", srgb("#fff6e0"), 0.1, emit=(1, 0.97, 0.9), es=1.0), "tail": mat("tail", srgb("#c0101a"), 0.3, emit=(1, 0.05, 0.03), es=0.4),
     "plate": mat("plate", srgb("#e9e9e2"), 0.5), "panel": mat("panel", srgb("#ff9a1a"), 0.4), "sign": mat("sign", srgb("#ffd21c"), 0.4, emit=(1, 0.85, 0.2), es=0.3),
     "rack": mat("rack", srgb("#3a3b40"), 0.5, 0.5), "bag1": mat("bag1", srgb("#2f6fd6"), 0.8), "bag2": mat("bag2", srgb("#d8452a"), 0.8),
     "bag3": mat("bag3", srgb("#2e9e57"), 0.8), "stripe": mat("stripe", srgb("#ffcc00"), 0.4), "stripe2": mat("stripe2", srgb("#c8102e"), 0.4)}
ORDER = list(M.keys())

class MB:
    def __init__(s): s.v = []; s.f = []; s.fm = []
    def vert(s, p): s.v.append(tuple(p)); return len(s.v) - 1
    def face(s, idx, m): s.f.append(list(idx)); s.fm.append(m)
    def box(s, c, size, m, taper=1.0):
        cx, cy, cz = c; hx, hy, hz = size[0] / 2, size[1] / 2, size[2] / 2; P = []
        for (sx, sy, sz) in [(-1,-1,-1),(1,-1,-1),(1,1,-1),(-1,1,-1),(-1,-1,1),(1,-1,1),(1,1,1),(-1,1,1)]:
            P.append(s.vert((cx + sx * hx * (taper if sy > 0 else 1), cy + sy * hy, cz + sz * hz)))
        for f in [(0,3,2,1),(4,5,6,7),(0,1,5,4),(2,3,7,6),(1,2,6,5),(0,4,7,3)]: s.face([P[i] for i in f], m)
    def wheel(s, c, r, w, seg=14):
        # tyre (axis x) with a rim disc on the outer face; c = centre, outer side = sign of c.x
        sd = 1 if c[0] > 0 else -1; rings = []
        for e in (-1, 1):
            rr = []
            for i in range(seg):
                a = 2 * math.pi * i / seg; rr.append(s.vert((c[0] + e * w / 2, c[1] + math.cos(a) * r, c[2] + math.sin(a) * r)))
            rings.append(rr)
        for i in range(seg):
            j = (i + 1) % seg; s.face([rings[0][i], rings[0][j], rings[1][j], rings[1][i]], "tyre")
        inner = rings[0] if sd > 0 else rings[1]; outer = rings[1] if sd > 0 else rings[0]
        s.face(list(reversed(inner)) if sd > 0 else inner, "tyre")
        rim = [s.vert((c[0] + sd * (w / 2 + 0.005), c[1] + math.cos(2 * math.pi * i / seg) * r * 0.62, c[2] + math.sin(2 * math.pi * i / seg) * r * 0.62)) for i in range(seg)]
        for i in range(seg):
            j = (i + 1) % seg; s.face([outer[i], outer[j], rim[j], rim[i]] if sd > 0 else [outer[j], outer[i], rim[i], rim[j]], "tyre")
        s.face(rim if sd > 0 else list(reversed(rim)), "rim")
    def obj(s, name, parent):
        me = bpy.data.meshes.new(name); me.from_pydata([B(p) for p in s.v], [], s.f)
        used = sorted(set(s.fm), key=ORDER.index)
        for u in used: me.materials.append(M[u])
        for poly, fm in zip(me.polygons, s.fm): poly.material_index = used.index(fm)
        me.validate(); me.update(); bm = bmesh.new(); bm.from_mesh(me); bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(me); bm.free()
        ob = bpy.data.objects.new(name, me); scene.collection.objects.link(ob); ob.parent = parent
        for p in me.polygons: p.use_smooth = False
        return ob

def lerp(a, b, t): return a + (b - a) * t
def keys(K, z):
    if z <= K[0][0]: return K[0][1]
    for i in range(1, len(K)):
        if z <= K[i][0]:
            t = (z - K[i-1][0]) / (K[i][0] - K[i-1][0]); t = t * t * (3 - 2 * t); return lerp(K[i-1][1], K[i][1], t)
    return K[-1][1]

def body(mb, D):
    """lofted body: half width W(z), sill height, belt (shoulder) height, cab factor C(z) 0..1 (greenhouse), roof height + half width.
    Every section has the same 9 points (bottom centre -> roof centre), mirrored for the other side."""
    zs = D["zs"]; secs = []
    for z in zs:
        w = keys(D["W"], z); sill = keys(D["SILL"], z); belt = keys(D["BELT"], z); c = keys(D["CAB"], z); roof = keys(D["ROOF"], z); rw = keys(D["RW"], z)
        top0 = belt + 0.06
        pts = [(0.0, sill + 0.02), (w - 0.1, sill), (w, sill + 0.14), (w, belt - 0.14), (w - 0.035, belt),
               (lerp(w - 0.2, w - 0.1, c), top0 - 0.02 + 0.02 * c), (lerp(w * 0.62, rw, c), lerp(top0 - 0.005, roof - 0.07, c)),
               (lerp(w * 0.3, rw - 0.13, c), lerp(top0, roof, c)), (0.0, lerp(top0, roof + 0.015, c))]
        secs.append((z, c, pts))
    idx = []
    for z, c, pts in secs:
        R = [mb.vert((p[0], p[1], z)) for p in pts]; L = [mb.vert((-p[0], p[1], z)) for p in pts]; idx.append((R, L, c))
    glass_band = D.get("band")   # (zA, zB) side windows only inside this range (vans); None = wherever the cab is up
    for k in range(len(secs) - 1):
        (R0, L0, c0), (R1, L1, c1) = idx[k], idx[k + 1]; z0, z1 = secs[k][0], secs[k + 1][0]; zm = (z0 + z1) / 2; cm = (c0 + c1) / 2
        for i in range(8):
            m = "paint"
            if i == 0: m = "trim"
            if i == 5 and cm > 0.5 and (glass_band is None or glass_band[0] <= zm <= glass_band[1]): m = "glass"
            if i == 7 and 0.08 < cm < 0.92: m = "glass"                                   # windscreen / rear glass on the cab ramps
            if i in (1, 2) and D.get("panels"):
                if any(abs(zm - wz) < 0.62 for wz in D["panels"]): m = "panel"
            if i == 2 and D.get("stripe") and D["stripe"][0] <= zm <= D["stripe"][1]: m = D.get("stripeM", "stripe")
            mb.face([R0[i], R1[i], R1[i + 1], R0[i + 1]], m); mb.face([L0[i + 1], L1[i + 1], L1[i], L0[i]], m)
    for (R, L, c), front in ((idx[0], False), (idx[-1], True)):   # end caps: a fan from the centre line
        ring = R + list(reversed(L))[1:-1]
        ctr = mb.vert((0.0, sum(mb.v[i][1] for i in ring) / len(ring), mb.v[R[0]][2]))
        for i in range(len(ring)):
            j = (i + 1) % len(ring)
            mb.face([ctr, ring[j], ring[i]] if front else [ctr, ring[i], ring[j]], "paint")

def lights(mb, D, w_front, w_back, yl, yt, zf, zb, wide=0.32, tall=0.12):
    for sd in (-1, 1):
        mb.box((sd * (w_front - wide / 2 - 0.06), yl, zf + 0.01), (wide, tall, 0.06), "lamp")
        mb.box((sd * (w_back - wide / 2 - 0.05), yt, zb - 0.01), (wide, tall + 0.02, 0.06), "tail")
    mb.box((0, yt - 0.18, zb - 0.02), (0.5, 0.12, 0.04), "plate"); mb.box((0, yl - 0.2, zf + 0.02), (0.5, 0.12, 0.04), "plate")

def car(name, D, extra=None):
    root = bpy.data.objects.new(name, None); scene.collection.objects.link(root); mb = MB()
    body(mb, D)
    L, wb, r = D["len"], D["wb"], D["r"]; tw = D["track"]
    for zc in (wb / 2 + D.get("woff", 0), -wb / 2 + D.get("woff", 0)):
        for sd in (-1, 1): mb.wheel((sd * tw, r, zc), r, D.get("tyw", 0.21))
    zf, zb = L / 2, -L / 2
    # bumpers (dark), lights, mirrors
    mb.box((0, D["bumpY"], zf - 0.05), (keys(D["W"], zf - 0.1) * 2 - 0.05, 0.16, 0.14), "trim")
    mb.box((0, D["bumpY"], zb + 0.05), (keys(D["W"], zb + 0.1) * 2 - 0.05, 0.16, 0.14), "trim")
    lights(mb, D, keys(D["W"], zf - 0.05), keys(D["W"], zb + 0.05), D["lampY"], D["tailY"], zf - 0.02, zb + 0.02, D.get("lampW", 0.3), D.get("lampH", 0.12))
    for sd in (-1, 1):
        mz = D.get("mirrorZ", 0.6); w = keys(D["W"], mz); mb.box((sd * (w + 0.08), keys(D["BELT"], mz) + 0.1, mz), (0.14, 0.1, 0.06), "trim")
    if extra: extra(mb, D)
    mb.obj(name + "_mesh", root); return root

def Z(L, n): return [-L / 2 + L * i / n for i in range(n + 1)]
def rnd_plan(L, w, nose=0.75, tail=0.8):   # rounded corners in plan
    return [(-L/2, w * tail), (-L/2 + 0.25, w * 0.97), (-L/2 + 0.6, w), (L/2 - 0.6, w), (L/2 - 0.25, w * 0.95), (L/2, w * nose)]

SEDAN = dict(len=4.6, wb=2.7, r=0.32, track=0.76, tyw=0.21, bumpY=0.42, lampY=0.7, tailY=0.82, mirrorZ=0.75, zs=Z(4.6, 22),
    W=rnd_plan(4.6, 0.9), SILL=[(-2.3, 0.4), (2.3, 0.38)], BELT=[(-2.3, 0.86), (-1.6, 0.95), (1.4, 0.92), (2.3, 0.7)],
    CAB=[(-2.3, 0), (-1.55, 0), (-0.95, 1), (0.55, 1), (1.35, 0), (2.3, 0)], ROOF=[(-2.3, 1.42), (2.3, 1.46)], RW=[(-2.3, 0.66), (2.3, 0.68)])
HATCH = dict(SEDAN, len=4.0, wb=2.5, zs=Z(4.0, 20), W=rnd_plan(4.0, 0.875), SILL=[(-2, 0.4), (2, 0.38)], BELT=[(-2, 0.88), (-1.6, 0.95), (1.2, 0.92), (2, 0.72)],
    CAB=[(-2, 0), (-1.95, 0.2), (-1.65, 1), (0.45, 1), (1.2, 0), (2, 0)], ROOF=[(-2, 1.46), (2, 1.5)], RW=[(-2, 0.68), (2, 0.68)], tailY=0.95)
GHTAXI = dict(SEDAN, panels=[1.35, -1.35])
VAN = dict(len=5.0, wb=3.1, r=0.34, track=0.82, tyw=0.22, bumpY=0.45, lampY=0.85, tailY=0.95, mirrorZ=1.45, zs=Z(5.0, 20), lampW=0.28, lampH=0.16,
    W=rnd_plan(5.0, 0.97, 0.85, 0.97), SILL=[(-2.5, 0.42), (2.5, 0.4)], BELT=[(-2.5, 1.0), (1.6, 1.0), (2.5, 0.85)],
    CAB=[(-2.5, 1), (1.3, 1), (2.15, 0), (2.5, 0)], ROOF=[(-2.5, 2.05), (2.5, 2.05)], RW=[(-2.5, 0.9), (2.5, 0.9)], band=(0.9, 2.2))
TROTRO = dict(VAN, len=5.6, wb=3.6, zs=Z(5.6, 24), W=rnd_plan(5.6, 1.0, 0.85, 0.98), SILL=[(-2.8, 0.42), (2.8, 0.4)], BELT=[(-2.8, 1.05), (1.9, 1.05), (2.8, 0.88)],
    CAB=[(-2.8, 1), (1.6, 1), (2.45, 0), (2.8, 0)], ROOF=[(-2.8, 2.35), (2.8, 2.35)], RW=[(-2.8, 0.92), (2.8, 0.92)], band=(-2.6, 2.5),
    stripe=(-2.6, 2.6), stripeM="stripe", mirrorZ=1.8)
BUS = dict(len=10.5, wb=6.2, woff=-0.6, r=0.48, track=1.0, tyw=0.3, bumpY=0.5, lampY=0.85, tailY=1.1, mirrorZ=4.9, zs=Z(10.5, 28), lampW=0.34, lampH=0.18,
    W=rnd_plan(10.5, 1.25, 0.9, 0.95), SILL=[(-5.25, 0.38), (5.25, 0.36)], BELT=[(-5.25, 1.25), (5.25, 1.2)],
    CAB=[(-5.25, 1), (4.9, 1), (5.25, 0.6)], ROOF=[(-5.25, 3.1), (5.25, 3.1)], RW=[(-5.25, 1.18), (5.25, 1.18)], band=(-4.9, 5.2),
    stripe=(-5.2, 5.2), stripeM="stripe2")

def taxi_sign(mb, D): mb.box((0, keys(D["ROOF"], 0) + 0.12, -0.2), (0.62, 0.2, 0.26), "sign")
def rack(mb, D):
    y = keys(D["ROOF"], 0) + 0.06
    for sd in (-1, 1): mb.box((sd * 0.78, y + 0.06, -0.4), (0.05, 0.05, 4.2), "rack")
    for zc in (-2.2, -1.0, 0.2, 1.4): mb.box((0, y + 0.06, zc), (1.6, 0.05, 0.05), "rack")
    for zc, m, s in ((-1.7, "bag1", (0.9, 0.42, 0.8)), (-0.6, "bag2", (0.7, 0.5, 0.7)), (0.5, "bag3", (1.0, 0.36, 0.9)), (1.25, "bag1", (0.5, 0.3, 0.5))):
        mb.box((0.1 if m == "bag2" else -0.15, y + 0.08 + s[1] / 2, zc), s, m)
def bus_extra(mb, D):
    mb.box((0, keys(D["ROOF"], 0) + 0.12, -1.0), (1.4, 0.25, 2.6), "trim")    # roof AC pod
    mb.box((0, 2.75, 5.26), (1.9, 0.28, 0.04), "sign")                          # destination board

roots = [car("sedan", SEDAN), car("hatch", HATCH), car("taxi", SEDAN, taxi_sign), car("ghtaxi", GHTAXI), car("van", VAN),
         car("trotro", TROTRO, rack), car("bus", BUS, bus_extra)]
bpy.ops.object.select_all(action="DESELECT")
bpy.ops.export_scene.gltf(filepath=OUT, export_format="GLB", export_apply=True, export_yup=True, export_normals=True, export_materials="EXPORT")
tris = {}
for r in roots:
    for ch in r.children: tris[r.name] = sum(len(p.vertices) - 2 for p in ch.data.polygons)
print("TRIS", tris)
if RENDER:
    os.makedirs(RENDER, exist_ok=True)
    for i, r in enumerate(roots): r.location = B((i * 3.2 - 10, 0, (i % 2) * 7 - 3.5))
    w = bpy.data.worlds.new("w"); scene.world = w; w.use_nodes = True; w.node_tree.nodes["Background"].inputs[0].default_value = (0.6, 0.7, 0.85, 1)
    sun = bpy.data.lights.new("sun", "SUN"); sun.energy = 3.5; so = bpy.data.objects.new("sun", sun); scene.collection.objects.link(so); so.rotation_euler = (math.radians(50), 0, math.radians(30))
    bpy.ops.mesh.primitive_plane_add(size=80); bpy.context.object.data.materials.append(mat("ground", srgb("#7b7f86"), 0.9))
    for r in roots:
        for ch in r.children:
            if ch.type == "MESH":
                for sl in ch.material_slots:
                    if sl.material.name == "paint":
                        p2 = sl.material.copy(); p2.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (*srgb({"sedan":"#2f5fb8","hatch":"#c23b2b","taxi":"#f2c21b","ghtaxi":"#3a6f3a","van":"#e8e8e8","trotro":"#f4f4f4","bus":"#1f6fd1"}[r.name]), 1); sl.material = p2
    scene.render.engine = "BLENDER_EEVEE_NEXT"; scene.render.resolution_x = 1400; scene.render.resolution_y = 700
    cam = bpy.data.cameras.new("c"); co = bpy.data.objects.new("c", cam); scene.collection.objects.link(co); scene.camera = co; cam.lens = 32
    for nm, loc, rot in (("rear34", (-4, 9, 4.5), (65, 0, 200)), ("front34", (8, -12, 5), (68, 0, 30))):
        co.location = loc; co.rotation_euler = tuple(math.radians(a) for a in rot)
        scene.render.filepath = os.path.join(RENDER, nm + ".png"); bpy.ops.render.render(write_still=True)
