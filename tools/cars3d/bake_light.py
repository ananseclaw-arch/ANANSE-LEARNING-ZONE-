# Blender-baked lighting for the game's car GLBs (job 1112-0016-43fd, "baked lighting" + "Blender-built models").
#
#   Blender -b --factory-startup -P tools/cars3d/bake_light.py -- <in.glb> <out.json> [--meshy] [--shadow out.png] [--cycles]
#
# Blender is the bake engine; it does NOT re-export the GLB. It imports the car, adds a ground plane, and bakes per vertex:
#   ambient occlusion (Cycles AO bake into a vertex colour layer, or the deterministic BVH ray-cast below)
#   x a soft analytic sky + golden-hour key term from the vertex normal (roofs/bonnets light, lower sides darker),
# smooths it over the mesh (2 Laplacian passes) and writes the values per glTF node + primitive to <out.json>.
# tools/cars3d/pack_glb.mjs then writes them into the ORIGINAL glb as COLOR_0, so every node, material, livery, extension
# and number the game relies on stays byte-for-byte the shape Eb approved. --shadow also bakes the car's soft ground shadow
# (what the car hides of the sky, seen from the road) into a 128x128 greyscale tile.
import bpy, bmesh, sys, os, json, math, random
from mathutils import Vector
from mathutils.bvhtree import BVHTree

argv = sys.argv[sys.argv.index("--") + 1:]
IN, OUT = argv[0], argv[1]
MESHY = "--meshy" in argv
CYCLES = "--cycles" in argv
SHADOW = argv[argv.index("--shadow") + 1] if "--shadow" in argv else None
SKIP = {"glass", "decal", "decal_band", "decal_roof", "lamp", "lens", "tail", "taillens", "plate", "sign"}   # lit by their own shaders / must stay crisp
FLOOR = 0.6 if MESHY else 0.35          # Meshy cars already carry a baked AO x shut-line map; keep the vertex term gentle so they don't double-darken
KEY = Vector((-0.40, -0.45, 0.80)).normalized()   # Blender space (z up, game +z = Blender -y): above, front, left (the game's golden-hour sun side)

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=IN, merge_vertices=False)
meshes = [o for o in bpy.context.scene.objects if o.type == "MESH"]
dg = bpy.context.evaluated_depsgraph_get()

# world-space BVH of the whole car + a ground plane at the tyre contact height (z=0 in game space)
zmin = min((o.matrix_world @ Vector(c)).z for o in meshes for c in o.bound_box)
verts, polys = [], []
for o in meshes:
    m = o.data; mw = o.matrix_world; b = len(verts)
    verts += [mw @ v.co for v in m.vertices]; polys += [[b + i for i in p.vertices] for p in m.polygons]
b = len(verts); G = 8.0
verts += [Vector((-G, -G, zmin - 0.005)), Vector((G, -G, zmin - 0.005)), Vector((G, G, zmin - 0.005)), Vector((-G, G, zmin - 0.005))]; polys.append([b, b + 1, b + 2, b + 3])
bvh = BVHTree.FromPolygons(verts, polys)

rng = random.Random(7)
def hemi(n, k):
    """k cosine-weighted directions around normal n (fixed seed: same result every run)"""
    t = n.orthogonal().normalized(); bt = n.cross(t); out = []
    for i in range(k):
        u, v = (i + rng.random()) / k, rng.random(); r = math.sqrt(u); a = 2 * math.pi * v
        out.append((t * (r * math.cos(a)) + bt * (r * math.sin(a)) + n * math.sqrt(max(0.0, 1 - u))).normalized())
    return out
DIST = 0.6
def ao_ray(p, n, k=24):
    """deterministic AO: share of k cosine rays that escape within DIST m (the fallback the plan asked for, and the default)"""
    o = p + n * 0.004; hit = 0
    for d in hemi(n, k):
        if bvh.ray_cast(o, d, DIST)[0] is not None: hit += 1
    return 1.0 - hit / k

def cycles_ao(o):
    """Cycles AO bake into a POINT colour layer (used with --cycles; falls back to the ray cast on any error)"""
    sc = bpy.context.scene; sc.render.engine = "CYCLES"; sc.cycles.device = "CPU"; sc.cycles.samples = 32
    sc.render.bake.target = "VERTEX_COLORS"; sc.world = sc.world or bpy.data.worlds.new("w"); sc.world.light_settings.distance = DIST
    m = o.data; ca = m.color_attributes.new("AO", "FLOAT_COLOR", "POINT"); m.color_attributes.active_color = ca
    for x in bpy.context.selected_objects: x.select_set(False)
    o.select_set(True); bpy.context.view_layer.objects.active = o
    bpy.ops.object.bake(type="AO")
    return [ca.data[i].color[0] for i in range(len(m.vertices))]

res = {"src": os.path.basename(IN), "meshy": MESHY, "nodes": {}}
for o in meshes:
    m = o.data; mw = o.matrix_world; nm3 = mw.to_3x3().inverted().transposed()
    skip = [False] * len(m.vertices); mats = [s.material.name if s.material else "" for s in o.material_slots]
    for p in m.polygons:
        if mats and mats[p.material_index] in SKIP:
            for i in p.vertices: skip[i] = True
    ao = None; WHEEL = o.name.startswith(("wheel_", "caliper_"))
    if CYCLES:
        try: ao = cycles_ao(o)
        except Exception as e: print("CYCLES_FAIL", o.name, e)
    val = []
    for i, v in enumerate(m.vertices):
        if skip[i]: val.append(1.0); continue
        p = mw @ v.co; n = (nm3 @ v.normal).normalized()
        a = ao[i] if ao else ao_ray(p, n)
        sky = 0.70 + 0.30 * max(0.0, min(1.0, n.z * 0.75 + n.dot(KEY) * 0.25))
        a = (0.72 + 0.28 * a) if WHEEL else (0.5 + 0.5 * a)   # wheels sit in their own arches: keep rims bright enough to read
        if MESHY: a = 0.75 + 0.25 * a
        val.append(max(FLOOR, min(1.0, a * sky * 1.15)))   # x1.15: open, upward panels stay at full colour, the bake only adds shade
    # 2 Laplacian smoothing passes over the mesh edges (low-poly cars stop looking blotchy)
    nb = [[] for _ in m.vertices]
    for e in m.edges: a_, b_ = e.vertices; nb[a_].append(b_); nb[b_].append(a_)
    for _ in range(2):
        val = [val[i] if skip[i] or not nb[i] else 0.5 * val[i] + 0.5 * sum(val[j] for j in nb[i]) / len(nb[i]) for i in range(len(val))]
    # the importer keeps one Blender vertex per glTF vertex (merge_vertices=False), primitives in order; per-primitive slices are cut by pack_glb.mjs
    pk = [[i] + [round(c, 4) for c in (m.vertices[i].co.x, m.vertices[i].co.z, -m.vertices[i].co.y)] for i in sorted({0, len(val) // 3, 2 * len(val) // 3, len(val) - 1})]   # glTF-space probes: pack_glb.mjs checks the vertex order matches
    res["nodes"][o.name] = {"mesh": m.name, "n": len(val), "pk": pk, "v": [round(x, 3) for x in val]}
    print("BAKED", o.name, len(val), "verts", "min", round(min(val), 2), "mean", round(sum(val) / len(val), 2))

if SHADOW:
    # ground shadow: from each road point under the car, how much of the sky (cosine-weighted, plus the sun direction) the car hides
    xs = [(o.matrix_world @ Vector(c)) for o in meshes for c in o.bound_box]
    x0, x1 = min(p.x for p in xs), max(p.x for p in xs); y0, y1 = min(p.y for p in xs), max(p.y for p in xs)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2; W, L = (x1 - x0) * 1.3, (y1 - y0) * 1.3; N = 128
    up = Vector((0, 0, 1)); dirs = hemi(up, 40)
    img = bpy.data.images.new("shadow", N, N, alpha=False, float_buffer=False); px = [0.0] * (N * N * 4)
    for j in range(N):
        for i in range(N):
            p = Vector((cx + (i + 0.5) / N * W - W / 2, cy + (j + 0.5) / N * L - L / 2, zmin + 0.01)); hit = 0
            for d in dirs:
                if bvh.ray_cast(p, d, 6.0)[0] is not None: hit += 1
            occ = hit / len(dirs)
            k = (j * N + i) * 4; px[k] = px[k + 1] = px[k + 2] = 1.0 - occ; px[k + 3] = 1.0
    img.pixels = px; img.filepath_raw = SHADOW; img.file_format = "PNG"; img.save()
    # game space footprint (x right, z = nose = -Blender y)
    res["shadow"] = {"cx": round(cx, 3), "cz": round(-cy, 3), "w": round(W, 3), "l": round(L, 3)}
    print("SHADOW", SHADOW, res["shadow"])

json.dump(res, open(OUT, "w"))
print("WROTE", OUT)
