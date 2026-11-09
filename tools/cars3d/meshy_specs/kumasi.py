# Kumasi V8 (Meshy 6 Lite shape). Yellow muscle fastback, twin matte black bonnet/roof stripes, chrome bumper + grille surround, slotted mags. Outlines fitted on lz-gp-phasea-shots/blender/raw/kumasi_v8/*_g.jpg
LEN = 4.94; ZF = 1.455; ZR = -1.455; WBC = .085
TYRE_R = .388; TYRE_X = .80; TYRE_W = .29
PAL = dict(paint="#fcbc0a", stripe="#101012", rim="#d8dbe0", rimdark="#2a2c31", spoke="#d2d5da", caliper="#3a3c40")
WHEEL = dict(rim=.68, n=6, split=False, spw=1.25)
CUT_R = .43
GLASS_SIDE = (-.78, 1.1, 1.05, .38); GLASS_WIND = (.82, .05, .5); GLASS_REAR = (.68, -1.65, .45); GLASS_ZSPLIT = -.45; GLASS_PLAIN_REAR = True; X_LINER = .965
SIDE_LINES = [[(.55, 1.07), (.6, .7), (.55, .34), (-.72, .34), (-.72, 1.08)]]
TOP_LINES = [[(s * .84, .55), (s * .86, 1.4), (s * .8, 2.1)] for s in (1, -1)] + [[(-.8, 2.1), (.8, 2.1)]]
ST_IN = .05; ST_OUT = .38; STRIPE_NOSE = 2.22
def circ(cx, cy, r, n=20): return [(cx + r * math.cos(2 * math.pi * i / n), cy + r * math.sin(2 * math.pi * i / n)) for i in range(n)]
def define_zones():
    GZS = [(.26, 1.07), (.12, 1.24), (.02, 1.4), (-.2, 1.425), (-.6, 1.42), (-.75, 1.38), (-.725, 1.09), (-.3, 1.075), (.05, 1.07)]
    GZO = [(.29, 1.055), (.14, 1.26), (.03, 1.42), (-.2, 1.445), (-.61, 1.44), (-.775, 1.395), (-.745, 1.07), (-.3, 1.055), (.05, 1.05)]
    WS = [(0, .12), (.4, .1), (.7, .05), (.8, .42), (.4, .5), (0, .52), (-.4, .5), (-.8, .42), (-.7, .05), (-.4, .1)]
    WSO = [(0, .1), (.405, .08), (.72, .03), (.825, .435), (.405, .52), (0, .54), (-.405, .52), (-.825, .435), (-.72, .03), (-.405, .08)]
    for s in (1, -1):
        side = lambda f, c, n, g, s=s: g[0] * s > .1 and abs(n.x) > .25 and n.x * s > 0
        zone("rim", "zy", GZO, side)
        zone("glass", "zy", GZS, side)
        # quarter louvres: four black slats
        for k in range(4):
            z0 = -.945 - k * .042
            zone("carbon", "zy", [(z0, 1.1), (z0 - .026, 1.1), (z0 - .026, 1.34), (z0, 1.34)], lambda f, c, n, g, s=s: g[0] * s > .4 and n.x * s > .25, smooth=False)
    zone("rim", "xz", WSO, lambda f, c, n, g: n.z > .25 and n.y < .1 and g[1] > 1.)
    zone("glass", "xz", WS, lambda f, c, n, g: n.z > .25 and n.y < .1 and g[1] > 1.)
    zone("rim", "xz", [(-.645, -1.2), (.645, -1.2), (.68, -1.235), (.69, -1.615), (.655, -1.65), (-.655, -1.65), (-.69, -1.615), (-.68, -1.235)], lambda f, c, n, g: n.z > .3 and n.y > 0 and g[1] > 1., smooth=False)
    zone("glass", "xz", [(-.635, -1.222), (.635, -1.222), (.66, -1.247), (.67, -1.603), (.645, -1.628), (-.645, -1.628), (-.67, -1.603), (-.66, -1.247)], lambda f, c, n, g: n.z > .3 and n.y > 0 and g[1] > 1., smooth=False)
    # bonnet scoop: black, over the stripes
    zone("carbon", "xz", [(-.24, 1.66), (.24, 1.66), (.21, 1.1), (.09, 1.08), (.085, .81), (-.085, .81), (-.09, 1.08), (-.21, 1.1)], lambda f, c, n, g: g[1] > 1., smooth=False)
    # grille: chrome surround, black mesh, chrome-ringed round headlamps
    fr = lambda f, c, n, g: g[2] > 1.9 and n.y < -.25
    zone("rim", "xy", [(-.89, .63), (.89, .63), (.89, .885), (-.89, .885)], fr, smooth=False)
    zone("carbon", "xy", [(-.86, .655), (.86, .655), (.86, .865), (-.86, .865)], fr, smooth=False)
    zone("carbon", "xy", [(-.33, .45), (.33, .45), (.33, .535), (-.33, .535)], fr, smooth=False)
    for s in (1, -1):
        zone("rim", "xy", circ(s * .675, .755, .135), lambda f, c, n, g, s=s: g[2] > 1.9 and n.y < -.1 and g[0] * s > 0, smooth=False)
        zone("lamp", "xy", circ(s * .675, .755, .095), lambda f, c, n, g, s=s: g[2] > 1.9 and n.y < -.1 and g[0] * s > 0, smooth=False)
        zone("carbon", "xy", [(s * .6, .48), (s * .76, .48), (s * .76, .525), (s * .6, .525)], fr, smooth=False)
        # tail lamps: long dark lens, three bright bars
        rear = lambda f, c, n, g, s=s: g[2] < -2. and n.y > .25 and g[0] * s > 0
        zone("taillens", "xy", [(s * .09, .755), (s * .78, .755), (s * .78, .925), (s * .09, .925)], rear, smooth=False)
        for k in range(3):
            x0 = .13 + k * .215
            zone("tail", "xy", [(s * x0, .785), (s * (x0 + .17), .785), (s * (x0 + .17), .895), (s * x0, .895)], rear, smooth=False)
        zone("exhaust", "zy", [(-1.98, .32), (-2.5, .32), (-2.5, .445), (-1.98, .445)], lambda f, c, n, g, s=s: .42 < g[0] * s < .8, smooth=False)
    zone("carbon", "xy", [(-.3, .535), (.3, .535), (.3, .645), (-.3, .645)], lambda f, c, n, g: g[2] < -2. and n.y > .25, smooth=False)   # plate recess
def cut_xs(x_, ymin):
    # like cut_x, but picks every face straddling the plane (cut_x misses big triangles whose centre is more than .12 away: ragged stripes on the flat deck)
    sel = [f for f in bm.faces if f.is_valid and f.material_index != liner_idx and min(v.co.x for v in f.verts) < x_ < max(v.co.x for v in f.verts) and G(f.calc_center_median())[1] > ymin]
    if not sel: return
    geom = list({e for f in sel for e in f.edges}) + sel + list({v for f in sel for v in f.verts})
    bmesh.ops.bisect_plane(bm, geom=geom, dist=.0005, plane_co=B(x_, 0, 0), plane_no=Vector((1, 0, 0)))
def cut_zs(z_, ymin):
    # same as cut_xs across the car: a clean straight front end for the stripes
    sel = [f for f in bm.faces if f.is_valid and f.material_index != liner_idx and min(G(v.co)[2] for v in f.verts) < z_ < max(G(v.co)[2] for v in f.verts) and G(f.calc_center_median())[1] > ymin]
    if not sel: return
    geom = list({e for f in sel for e in f.edges}) + sel + list({v for f in sel for v in f.verts})
    bmesh.ops.bisect_plane(bm, geom=geom, dist=.0005, plane_co=B(0, 0, z_), plane_no=Vector((0, 1, 0)))
def extra_cuts():
    for x_ in (ST_IN, -ST_IN, ST_OUT, -ST_OUT): cut_xs(x_, .85)
    # the liner back plates reach y=.08, below this car's high sills: lift them inside the body
    for v in {v for f in bm.faces if f.is_valid and f.material_index == liner_idx for v in f.verts}:
        if v.co.z < .27: v.co.z = .27
    cut_zs(STRIPE_NOSE, .85)
    cut_y(.265, -1.06, 1.06)
    cut_y(.54, 1.75, 3.); cut_y(.612, 1.75, 3.)
    cut_y(.85, -1.05, 1.05); cut_y(.89, -1.05, 1.05)
def classify_pre(f, c, n, g):
    x, y, z = g; ax = abs(x)
    if ST_IN < ax < ST_OUT and n.z > .2 and y > .9 and -2.5 < z < STRIPE_NOSE: return "stripe"
    if .85 < y < .89 and -1.05 < z < 1.05 and ax > .6 and abs(n.x) > .5: return "stripe"       # thin waist stripe
    return None
def classify_post(f, c, n, g):
    x, y, z = g; ax = abs(x)
    if z > 1.8 and .54 < y < .612: return "rim"                                  # chrome front bumper
    if ax > .84 and 0. < z < .32 and y > 1.1: return "rim"                      # chrome mirrors
    if ax > .9 and -.68 < z < -.43 and .97 < y < 1.03 and n.x * x > .3: return "rim"              # door handles
    if .5 < ax < .66 and 1.95 < z < 2.09 and n.z > .3 and y > .9: return "rim"   # bonnet pins
    if ax < .72 and .43 < z < .7 and y > 1.11 and f.material_index not in (IDX("glass"), IDX("rim")): return "carbon"                 # wipers
    if y < .265 and -1.06 < z < 1.06: return "carbon"                                     # underside
    return None
