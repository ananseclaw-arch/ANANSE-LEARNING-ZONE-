# Shogun GT (Meshy 6 Lite shape). Pearl white, black intakes + wing + mirrors, bronze wheels. Outlines fitted on lz-gp-phasea-shots/blender/raw/shogun_gt/*_g.jpg
LEN = 4.62; ZF = 1.35; ZR = -1.35; WBC = .005
TYRE_R = .367; TYRE_X = .785; TYRE_W = .29
PAL = dict(paint="#f0f0f2", stripe="#111214", rim="#7a5a2c", rimdark="#2a2115", spoke="#7f5e30", caliper="#d8a13a")
WHEEL = dict(rim=.72, n=10, split=False, spw=.8)
GLASS_SIDE = (-1.05, 1.68, .99, .33); GLASS_WIND = (.72, 0., .8); GLASS_REAR = (.52, -1.65, .75); GLASS_ZSPLIT = -.45; GLASS_PLAIN_REAR = True; X_LINER = .925
SIDE_LINES = [[(.86, .92), (.8, .46), (.72, .28), (-.72, .28), (-.86, .46), (-.92, .88)], [(1.72, .86), (1.5, .95), (1.14, .99)], [(-1.2, .98), (-1.7, .95), (-2.05, .92)]]
TOP_LINES = [[(s * .52, .8), (s * .72, 1.3), (s * .76, 1.75), (s * .55, 2.2)] for s in (1, -1)] + [[(-.52, .8), (.52, .8)]]
def circ(cx, cy, r, n=16): return [(cx + r * math.cos(2 * math.pi * i / n), cy + r * math.sin(2 * math.pi * i / n)) for i in range(n)]
def define_zones():
    GZS = [(.6, 1.0), (.4, 1.17), (.12, 1.28), (-.42, 1.31), (-.82, 1.24), (-1.04, 1.1), (-.98, 1.02), (-.4, 1.0), (.2, .985)]
    for s in (1, -1):
        zone("glass", "zy", GZS, lambda f, c, n, g, s=s: g[0] * s > .1 and abs(n.x) > .25 and n.x * s > 0)
    zone("glass", "xz", [(0, -.02), (.32, -.05), (.63, -.12), (.72, .5), (.38, .7), (0, .78), (-.38, .7), (-.72, .5), (-.63, -.12), (-.32, -.05)], lambda f, c, n, g: n.z > .25 and g[1] > .92)
    zone("glass", "xz", [(0, -.92), (.5, -.95), (.52, -1.64), (0, -1.62), (-.52, -1.64), (-.5, -.95)], lambda f, c, n, g: n.z > .3 and g[1] > .95)
    # black intakes and grilles (front view)
    zone("carbon", "xy", [(-.47, .515), (.47, .515), (.42, .645), (-.42, .645)], lambda f, c, n, g: g[2] > 1.8 and n.y < .62, smooth=False)
    zone("carbon", "xy", [(-.52, .235), (.52, .235), (.47, .47), (-.47, .47)], lambda f, c, n, g: g[2] > 1.8 and n.y < .62, smooth=False)
    for s in (1, -1):
        zone("carbon", "xy", [(s * .62, .32), (s * .77, .32), (s * .78, .41), (s * .63, .41)], lambda f, c, n, g, s=s: g[2] > 1.8 and n.y < .62 and g[0] * s > 0, smooth=False)
        # headlamps: dark housing first, bright lamp inside
        zone("glass", "xy", [(s * .54, .7), (s * .74, .8), (s * .92, .79), (s * .94, .64), (s * .78, .625), (s * .6, .65)], lambda f, c, n, g, s=s: g[2] > 1.4 and n.z > .1 and g[0] * s > 0)
        zone("lamp", "xy", [(s * .66, .735), (s * .76, .765), (s * .88, .758), (s * .86, .735), (s * .74, .73), (s * .68, .72)], lambda f, c, n, g, s=s: g[2] > 1.4 and n.z > .1 and g[0] * s > 0)
        # twin round tail lamps: red lens with bright ring
        for cx in (.43, .67):
            zone("taillens", "xy", circ(s * cx, .93, .092), lambda f, c, n, g, s=s: g[2] < -1.5 and n.y > .15 and g[0] * s > 0)
            zone("tail", "xy", circ(s * cx, .93, .06), lambda f, c, n, g, s=s: g[2] < -1.5 and n.y > .15 and g[0] * s > 0)
        zone("exhaust", "xy", [(s * .26, .24), (s * .27, .36), (s * .42, .38), (s * .5, .33), (s * .5, .24)], lambda f, c, n, g, s=s: g[2] < -1.9 and g[0] * s > 0, smooth=False)
    zone("carbon", "xy", [(-.28, .6), (.28, .6), (.28, .74), (-.28, .74)], lambda f, c, n, g: g[2] < -1.8 and n.y > .4, smooth=False)   # plate recess
def extra_cuts():
    cut_y(.255, -1.06, 1.08); cut_y(.235, 1.72, 3.); cut_y(.385, -3., -1.8); cut_y(1.05, -3., -1.72)
def classify_pre(f, c, n, g): return None
def classify_post(f, c, n, g):
    x, y, z = g; ax = abs(x)
    if y < .255 and -1.06 < z < 1.08 and ax > .3: return "carbon"           # side skirts
    if z > 1.72 and y < .235: return "carbon"                               # splitter
    if z < -1.72 and y < .385 and ax < .86 and f.material_index != IDX("exhaust"): return "carbon"  # diffuser
    if z < -1.72 and (y > 1.05 or (.3 < ax < .5 and y > 1.)): return "carbon"     # wing + uprights
    if ax > .78 and .94 < y < 1.2 and -.12 < z < .46: return "carbon"       # mirrors
    if .66 < ax < .95 and y < .36 and 1.0 < z < 1.75 and n.x * x > .1: return "carbon"  # front arch vent strip
    return None
