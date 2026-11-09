# Alpine Rally (Meshy 6 Lite shape). Blue rally hatch, white bonnet stripes + roof + door panel, four spot lamps, white gravel wheels. Outlines fitted on lz-gp-phasea-shots/blender/raw/alpine_rally/*_g.jpg
LEN = 4.13; ZF = 1.22; ZR = -1.22; WBC = -.035
TYRE_R = .35; TYRE_X = .80; TYRE_W = .27
PAL = dict(paint="#1257b8", stripe="#f2f2ee", rim="#e8e8e4", rimdark="#b9bab6", spoke="#efefea", caliper="#3a3c40")
WHEEL = dict(rim=.62, n=8, split=False, spw=.95)
GLASS_SIDE = (-1.15, 1.8, .97, .33); GLASS_WIND = (.68, .12, .72); GLASS_REAR = (.55, -1.8, .4); GLASS_ZSPLIT = -.8; GLASS_PLAIN_REAR = True; X_LINER = .915
SIDE_LINES = [[(.69, .95), (.7, .45), (.62, .29), (-.62, .29), (-.62, .95)], [(1.5, .86), (1.1, .93), (.75, .98)]]
TOP_LINES = [[(s * .6, .88), (s * .62, 1.4), (s * .5, 1.8)] for s in (1, -1)] + [[(-.6, .88), (.6, .88)]]
def circ(cx, cy, r, n=20): return [(cx + r * math.cos(2 * math.pi * i / n), cy + r * math.sin(2 * math.pi * i / n)) for i in range(n)]
STR = (.21, .24, .275)  # centre stripe half width, pin inner, pin outer
def define_zones():
    for n_ in ("rim", "spoke"):   # painted white wheels, not polished metal
        b_ = MATS[n_].node_tree.nodes["Principled BSDF"]; b_.inputs["Metallic"].default_value = .12; b_.inputs["Roughness"].default_value = .42
    d_ = MATS["disc"].node_tree.nodes["Principled BSDF"]; d_.inputs["Metallic"].default_value = .15   # slots read mid-grey, not mirror black
    # white roof, then windscreen, side glass, rear screen
    zone("stripe", "xz", [(-.6, .14), (.6, .14), (.62, -.6), (.6, -1.25), (.52, -1.5), (0, -1.54), (-.52, -1.5), (-.6, -1.25), (-.62, -.6)], lambda f, c, n, g: n.z > .3 and g[1] > 1.1)
    zone("glass", "xz", [(0, .16), (.38, .18), (.6, .22), (.68, .63), (.3, .76), (0, .8), (-.3, .76), (-.68, .63), (-.6, .22), (-.38, .18)], lambda f, c, n, g: n.z > .25 and g[1] > .92 and g[1] < 1.36)
    SIDE = [(.6, 1.02), (.34, 1.18), (.1, 1.27), (-.2, 1.29), (-.48, 1.27), (-.52, 1.1), (-.5, .98), (0, .97)]
    QUART = [(-.6, 1.27), (-1.0, 1.25), (-1.15, 1.12), (-.62, 1.0)]
    for s in (1, -1):
        for P in (SIDE, QUART):
            zone("glass", "zy", P, lambda f, c, n, g, s=s: g[0] * s > .1 and abs(n.x) > .25 and n.x * s > 0 and g[1] > .9)
    zone("glass", "xy", [(.5, 1.27), (.55, 1.02), (-.55, 1.02), (-.5, 1.27)], lambda f, c, n, g: n.y > .25 and g[2] < -1.4 and g[1] > .95)
    # side graphic: big white panel + diagonal slash + sill line
    for s in (1, -1):
        flt = lambda f, c, n, g, s=s: n.x * s > .55 and g[0] * s > .4 and .28 < g[1] < .95
        zone("stripe", "zy", [(.47, .45), (.18, .82), (-.72, .86), (-.76, .46)], flt, smooth=False)
        zone("stripe", "zy", [(.62, .45), (.53, .45), (.25, .82), (.33, .82)], flt, smooth=False)
        zone("stripe", "zy", [(.6, .335), (-.72, .335), (-.72, .385), (.6, .385)], flt, smooth=False)
    # grille + intakes (front view)
    zone("carbon", "xy", [(-.4, .29), (.4, .29), (.4, .5), (-.4, .5)], lambda f, c, n, g: g[2] > 1.75 and n.y < .6, smooth=False)
    for s in (1, -1):
        zone("carbon", "xy", [(s * .57, .36), (s * .76, .36), (s * .73, .49), (s * .6, .49)], lambda f, c, n, g, s=s: g[2] > 1.7 and n.y < .6 and g[0] * s > 0, smooth=False)
        # headlamps: dark housing, bright core
        zone("glass", "xy", [(s * .47, .7), (s * .6, .86), (s * .82, .9), (s * .86, .72), (s * .7, .66)], lambda f, c, n, g, s=s: g[2] > 1.3 and n.z > .05 and g[0] * s > 0 and n.y < .3)
        zone("lamp", "xy", [(s * .58, .74), (s * .66, .82), (s * .78, .83), (s * .78, .75), (s * .66, .72)], lambda f, c, n, g, s=s: g[2] > 1.3 and n.z > .05 and g[0] * s > 0 and n.y < .3)
        # bonnet vents
        zone("carbon", "xz", [(s * .36, 1.08), (s * .57, 1.08), (s * .53, 1.3), (s * .38, 1.3)], lambda f, c, n, g: n.z > .5 and g[1] > .7)
        # tail lamps, high on the hatch corners (the chase camera sees these)
        zone("taillens", "xy", [(s * .54, .8), (s * .8, .8), (s * .78, 1.04), (s * .6, 1.0)], lambda f, c, n, g, s=s: g[2] < -1.45 and n.y > .15 and g[0] * s > 0)
        zone("tail", "xy", [(s * .6, .85), (s * .75, .85), (s * .73, .98), (s * .63, .95)], lambda f, c, n, g, s=s: g[2] < -1.45 and n.y > .15 and g[0] * s > 0)
        zone("carbon", "xy", [(s * .1, .25), (s * .55, .25), (s * .55, .47), (s * .1, .47)], lambda f, c, n, g, s=s: g[2] < -1.8 and n.y > .1 and g[0] * s > 0, smooth=False)
    zone("carbon", "xy", [(-.32, .76), (.34, .76), (.34, .9), (-.32, .9)], lambda f, c, n, g: g[2] < -1.7 and n.y > .4, smooth=False)   # plate recess
    # four spot lamps: black pods, bright lens
    for cx in (-.291, -.097, .097, .291):
        zone("carbon", "xy", circ(cx, .772, .122), lambda f, c, n, g: g[2] > 1.84 and .62 < g[1] < .92, smooth=False)
        zone("lamp", "xy", circ(cx, .772, .09), lambda f, c, n, g: g[2] > 1.9 and n.y < -.4, smooth=False)
def extra_cuts():
    for x_ in STR:
        cut_x(x_, .45); cut_x(-x_, .45)
    cut_y(.265, -.95, .95); cut_y(.265, 1.7, 3.); cut_y(.48, -3., -1.6); cut_y(.53, -1.8, -1.55); cut_x(.68, .2); cut_x(-.68, .2)
def classify_pre(f, c, n, g):
    x, y, z = g; ax = abs(x)
    if z > .8 and y > .5 and n.z > -.2 and n.y < .5 and (ax < STR[0] or STR[1] < ax < STR[2]): return "stripe"
    return None
FLAP_R = [(-1.58, .53), (-1.66, .53), (-1.74, .03), (-1.66, .03), (-1.6, .3)]
def classify_post(f, c, n, g):
    x, y, z = g; ax = abs(x)
    if ax < .19 and .1 < z < .3 and 1.32 < y < 1.4 and n.y < -.2: return "carbon"   # roof scoop mouth
    if ax < .2 and -.7 < z < .3 and y > 1.3: return "stripe"      # roof scoop shell
    if y < .265 and -.95 < z < .95 and ax > .3: return "carbon"   # sills
    if z > 1.7 and y < .265: return "carbon"                      # splitter
    if z < -1.62 and y > 1.21 and f.material_index != IDX("glass"): return "carbon"  # wing + endplates
    if ax > .72 and y > .99 and .26 < z < .52: return "carbon"    # mirrors
    if ax > .7 and .93 < y <= .99 and .31 < z < .43: return "carbon"   # mirror stalks
    if ax > .75 and .72 < z < .84 and y < .27: return "carbon"    # front mudflap
    if ax > .64 and inpoly((z, y), FLAP_R): return "carbon"       # rear mudflap
    if z < -1.6 and y < .48 and ax < .68: return "carbon"         # rear diffuser boxes and tow eye
    return None
