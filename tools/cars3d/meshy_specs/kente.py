# Black Star Kente (Meshy 6 Lite shape). Red coupe, black star on the bonnet, kente bands along the sides and across the roof, black wheels + red calipers. Outlines fitted on lz-gp-phasea-shots/blender/raw/black_star_kente/*_g.jpg
LEN = 4.55; ZF = 1.35; ZR = -1.35; WBC = .005
TYRE_R = .362; TYRE_X = .825; TYRE_W = .30; CUT_R = .395; X_LINER = .95
PAL = dict(paint="#c80a10", stripe="#0e7a3c", rim="#15161a", rimdark="#0b0c0f", spoke="#17181c", caliper="#c8101a")
WHEEL = dict(rim=.75, n=5, split=True, spw=1.)
GLASS_SIDE = (-1.45, 1.6, .96, .27); GLASS_WIND = (.75, -.06, .75); GLASS_REAR = (.6, -1.82, .84); GLASS_ZSPLIT = -.5; GLASS_PLAIN_REAR = True
SIDE_LINES = [[(.18, .97), (.22, .7), (.16, .26)], [(-.42, .97), (-.36, .6), (-.28, .26)]]
TOP_LINES = [[(s * .6, .72), (s * .84, 1.4), (s * .8, 2.0)] for s in (1, -1)]
BODY_TARGET = 22000
# no AO/shut-line bake: meshy_car_bake.py bakes decal faces through their planar UVs too, and those overlap the atlas (dark patches on the paint, which the game maps with it)
BAKE = False
HUB = .36
def _arc(zc, r, a0, a1, n): return [(zc + r * math.cos(a0 + (a1 - a0) * i / n), HUB + r * math.sin(a0 + (a1 - a0) * i / n)) for i in range(n + 1)]
# outlines the decals fill exactly: crisp cuts along the artwork's own gold border, no red decal background next to the clearcoat paint
SIDE_POLY = [(2.1, .2), (2.1, .5)] + _arc(ZF, .64, .2204, 2.486, 14) + _arc(ZR, .66, .6326, 2.342, 12) + [(-2., .9375), (-2., .2)]
ROOF_POLY = [(-.66, -.02), (.66, -.02), (.66, -.62), (-.66, -.62)]
STAR_POLY = [((.54 if i % 2 == 0 else .2063) * math.sin(i * math.pi / 5), 1.34 + (.54 if i % 2 == 0 else .2063) * math.cos(i * math.pi / 5)) for i in range(10)]
def side_flt(f, c, n, g): return abs(n.x) > .25 and -.6 < n.z < .78
def roof_flt(f, c, n, g): return n.z > .5 and g[1] > 1.1
def star_flt(f, c, n, g): return n.z > .35 and g[1] > .6
DECALS = [
    {"img": "meshy_specs/img/kente_star.png", "ax": "xz", "rect": (-.6, .74, .6, 1.94), "name": "decal", "flt": lambda f, c, n, g: star_flt(f, c, n, g) and inpoly((g[0], g[2]), STAR_POLY)},
    {"img": "meshy_specs/img/kente_side.png", "ax": "zy", "rect": (-2.3, .2, 2.3, 1.02), "name": "decal_band", "flt": lambda f, c, n, g: side_flt(f, c, n, g) and inpoly((g[2], g[1]), SIDE_POLY)},
    {"img": "meshy_specs/img/kente_roof.png", "ax": "xz", "rect": (-.85, -.62, .85, -.02), "name": "decal_roof", "flt": lambda f, c, n, g: roof_flt(f, c, n, g) and inpoly((g[0], g[2]), ROOF_POLY)},
]
def circ(cx, cy, r, n=16): return [(cx + r * math.cos(2 * math.pi * i / n), cy + r * math.sin(2 * math.pi * i / n)) for i in range(n)]
def define_zones():
    # cut lines only (material stays paint): the decals below fill these outlines
    zone("paint", "zy", SIDE_POLY, side_flt, smooth=False); zone("paint", "xz", ROOF_POLY, roof_flt, smooth=False); zone("paint", "xz", STAR_POLY, star_flt, smooth=False)
    GZS = [(.12, .97), (.08, 1.05), (-.02, 1.12), (-.1, 1.175), (-.22, 1.21), (-.38, 1.22), (-.6, 1.205), (-.85, 1.17), (-1.05, 1.13), (-1.25, 1.09), (-1.42, 1.06), (-1.2, 1.01), (-.95, .985), (-.5, .97), (-.1, .96)]
    for s in (1, -1):
        zone("glass", "zy", GZS, lambda f, c, n, g, s=s: g[0] * s > .1 and abs(n.x) > .25 and n.x * s > 0 and abs(g[0]) < .86)
    zone("glass", "xz", [(0, .665), (.38, .62), (.62, .53), (.74, .42), (.7, .24), (.62, .05), (.55, -.06), (.3, -.02), (0, 0), (-.3, -.02), (-.55, -.06), (-.62, .05), (-.7, .24), (-.74, .42), (-.62, .53), (-.38, .62)], lambda f, c, n, g: n.z > .25 and g[1] > .93)
    zone("glass", "xz", [(0, -.985), (.58, -.98), (.6, -1.35), (.57, -1.6), (.42, -1.75), (0, -1.82), (-.42, -1.75), (-.57, -1.6), (-.6, -1.35), (-.58, -.98)], lambda f, c, n, g: n.z > .3 and g[1] > .95)
    # black grille + side intakes (front view)
    zone("carbon", "xy", [(-.37, .28), (.37, .28), (.37, .455), (-.37, .455)], lambda f, c, n, g: g[2] > 1.8 and n.y < .6, smooth=False)
    for s in (1, -1):
        zone("carbon", "xy", [(s * .42, .315), (s * .8, .315), (s * .81, .465), (s * .42, .455)], lambda f, c, n, g, s=s: g[2] > 1.7 and n.y < .6 and g[0] * s > 0, smooth=False)
        # headlamps: dark housing, bright strip inside
        zone("glass", "xy", [(s * .5, .56), (s * .62, .6), (s * .78, .625), (s * .875, .655), (s * .87, .615), (s * .7, .575), (s * .56, .55)], lambda f, c, n, g, s=s: g[2] > 1.5 and n.z > .05 and g[0] * s > 0)
        zone("lamp", "xy", [(s * .56, .574), (s * .68, .598), (s * .8, .62), (s * .85, .635), (s * .8, .605), (s * .68, .582), (s * .58, .566)], lambda f, c, n, g, s=s: g[2] > 1.5 and n.z > .05 and g[0] * s > 0, smooth=False)
        # exhausts
        zone("exhaust", "xy", [(s * .28, .3), (s * .45, .3), (s * .44, .365), (s * .3, .365)], lambda f, c, n, g, s=s: g[2] < -1.85 and g[0] * s > 0, smooth=False)
    # full-width tail bar in the rear crease: dark lens, bright outer lamps
    zone("taillens", "xy", [(-.84, .85), (.84, .85), (.84, .91), (-.84, .91)], lambda f, c, n, g: g[2] < -1.9 and n.y > .0, smooth=False)
    for s in (1, -1):
        zone("tail", "xy", [(s * .3, .862), (s * .82, .862), (s * .82, .9), (s * .3, .9)], lambda f, c, n, g, s=s: g[2] < -1.9 and n.y > .0 and g[0] * s > 0, smooth=False)
    # diffuser + plate recess
    zone("carbon", "xy", [(-.73, .31), (.73, .31), (.56, .48), (-.56, .48)], lambda f, c, n, g: g[2] < -1.8 and n.y > .1, smooth=False)
    zone("carbon", "xy", [(-.335, .55), (.335, .55), (.275, .69), (-.275, .69)], lambda f, c, n, g: g[2] < -1.9 and n.y > .3, smooth=False)
def extra_cuts():
    cut_y(.225, -1.02, 1.02); cut_y(.215, 1.7, 3.); cut_y(.28, 1.6, 3.); cut_y(.31, -3., -1.8); cut_y(1.0, -3., -1.7)
def classify_pre(f, c, n, g): return None
def classify_post(f, c, n, g):
    x, y, z = g; ax = abs(x)
    if y < .225 and -1.02 < z < 1.02 and ax > .3: return "carbon"           # side skirts
    if z > 1.7 and y < .215: return "carbon"                                # splitter
    if z > 1.6 and y < .28 and ax < .9: return "stripe"                     # green front lip
    if z < -1.8 and y < .31 and ax < .86 and f.material_index != IDX("exhaust"): return "carbon"   # under-bumper
    if z < -1.72 - .3 * (1 - min(1, (ax / .8) ** 2)) and y > 1.0 and ax < .82: return "carbon"     # black spoiler blade
    return None
