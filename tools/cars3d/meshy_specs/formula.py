# Volta Formula (Meshy 6 Lite shape). Purple F1 single seater, carbon floor + arms, yellow accents, dark wheels, yellow sidewall. Outlines fitted on lz-gp-phasea-shots/blender/raw/volta_formula/*_g.jpg
LEN = 5.15; ZF = 1.615; ZR = -1.615; WBC = -.27
TYRE_R = .36; TYRE_X = .745; TYRE_W = .385; ARCH = False; CUT_R = .387; X_IN = .525
PAL = dict(paint="#5a1fa8", stripe="#f2dc12", rim="#f2dc12", rimdark="#0c0d10", spoke="#1b1c20", caliper="#26282d")
WHEEL = dict(rim=.72, n=6, split=False, spw=.72)   # the "rim" lip is the thin yellow ring of the card; barrel + spokes stay dark
GLASS_PLAIN_REAR = True
BODY_TARGET = 30000
def define_zones():
    # chassis outline: everything outside it between the axles' ends is suspension (carbon)
    # front wing: yellow flap strip on the top surface
    for s in (1, -1):
        zone("stripe", "xz", [(s * .2, 2.53), (s * .74, 2.27), (s * .75, 2.33), (s * .2, 2.6)], lambda f, c, n, g, s=s: n.z > 0 and g[2] > 2. and g[1] < .3 and g[0] * s > 0, smooth=False)
        # end plate slash, front + rear
        zone("stripe", "zy", [(2.42, .34), (2.12, .22), (2.12, .27), (2.42, .4)], lambda f, c, n, g, s=s: abs(g[0]) > .72 and g[2] > 1.98 and n.x * s > .3 and g[0] * s > 0, smooth=False)
        zone("stripe", "zy", [(-1.8, .66), (-2.2, .78), (-2.2, .83), (-1.8, .71)], lambda f, c, n, g, s=s: abs(g[0]) > .44 and g[2] < -1.7 and n.x * s > .3 and g[0] * s > 0, smooth=False)
        # sidepod swoosh
        zone("stripe", "zy", [(-.18, .55), (-.34, .55), (-1.02, .29), (-.96, .24), (-.3, .46)], lambda f, c, n, g, s=s: n.x * s > .25 and g[0] * s > 0 and abs(g[0]) > .2, smooth=False)
        # engine cover flash
        zone("stripe", "xz", [(s * .1, -.5), (s * .23, -.72), (s * .13, -.98), (s * .16, -.72)], lambda f, c, n, g, s=s: n.z > .3 and g[1] > .5, smooth=False)
    # nose chevrons
    zone("stripe", "xz", [(-.14, 2.26), (0, 2.16), (.14, 2.26), (.14, 2.35), (0, 2.26), (-.14, 2.35)], lambda f, c, n, g: n.z > .2 and g[2] > 1.9, smooth=False)
    zone("stripe", "xz", [(-.11, 1.84), (0, 1.77), (.11, 1.84), (.11, 1.88), (0, 1.82), (-.11, 1.88)], lambda f, c, n, g: n.z > .2 and g[2] > 1.5, smooth=False)
    # rear wing: yellow line on the top surface and across the back
    zone("stripe", "xz", [(-.45, -2.2), (.45, -2.2), (.45, -2.14), (-.45, -2.14)], lambda f, c, n, g: n.z > .3 and g[1] > .78 and g[2] < -1.7, smooth=False)
    zone("stripe", "xy", [(-.45, .795), (.45, .795), (.45, .82), (-.45, .82)], lambda f, c, n, g: n.y > .3 and g[2] < -1.7 and g[1] > .75, smooth=False)
    # airbox mouth
    zone("carbon", "xy", [(-.12, .86), (.12, .86), (.12, 1.02), (-.12, 1.02)], lambda f, c, n, g: -.35 < g[2] < .15 and n.y < -.35, smooth=False)
    # rain light + exhaust (back view)
    zone("exhaust", "xy", [(-.05, .37), (.05, .37), (.05, .46), (-.05, .46)], lambda f, c, n, g: g[2] < -2. and n.y > .3, smooth=False)
    zone("tail", "xy", [(-.09, .25), (.09, .25), (.09, .33), (-.09, .33)], lambda f, c, n, g: g[2] < -2.18 and n.y > .3, smooth=False)
    for s in (1, -1):   # LED strips on the back edge of the rear wing end plates
        zone("tail", "xy", [(s * .46, .72), (s * .54, .72), (s * .54, .9), (s * .46, .9)], lambda f, c, n, g, s=s: g[2] < -2.15 and n.y > .3 and g[0] * s > 0, smooth=False)
def extra_cuts():
    cut_y(.23, -1.35, .75); cut_y(.79, -2.4, -1.7)
def classify_pre(f, c, n, g): return None
def chassis_hw(z):
    pts = [(.85, .23), (1.0, .19), (1.3, .15), (1.7, .115), (2.0, .115), (2.7, .13)]
    if z <= pts[0][0]: return pts[0][1]
    for (a, ha), (b, hb) in zip(pts, pts[1:]):
        if z <= b: return ha + (hb - ha) * (z - a) / (b - a)
    return pts[-1][1]
def classify_post(f, c, n, g):
    x, y, z = g; ax = abs(x)
    if f.material_index in (IDX("tail"), IDX("exhaust")): return None           # lamps + exhaust keep their zones
    if y > 1.06 and -.4 < z < 0: return "stripe"                               # T-wing on the airbox
    if ax > .32 and .71 < y < .8 and .6 < z < .8 and n.z > .2: return "stripe"  # mirror tops
    if .33 < ax < .52 and .55 < y < .78 and .6 < z < .8: return "paint"         # mirror bodies
    if .85 < z < 2.0 and ax > chassis_hw(z) + .015 and y < .62: return "carbon"  # front suspension + brake ducts
    if z > 2.0 and ax > .15:                                                     # front wing
        if ax > .78: return "carbon" if f.material_index != IDX("stripe") else None   # end plates
        if y < .15: return "carbon"
        return None
    if y < .23 and z < .75: return "carbon"                                     # floor + lower sidepod
    if z < -1.25 and ax > .13 and y < .62 and z > -2.05: return "carbon"         # rear suspension, gearbox area
    if z < -1.72 and y < .5: return "carbon"                                     # diffuser, crash structure
    if z < -1.7 and (ax > .46 or (ax > .43 and abs(n.x) > .5)): return "carbon" if f.material_index != IDX("stripe") else None   # rear end plates
    if z < -1.7 and ax > .38 and (y < .79 or abs(n.x) > .4): return "carbon" if f.material_index != IDX("stripe") else None   # end plate inner faces
    if z < -1.7 and y < .79 and y > .55: return "carbon"                         # beam wing + pylons
    if .02 < z < .6 and ax < .19 and .35 < y < .7: return "carbon"               # cockpit tub
    if n.y > .35 and ax > .6 and y < .62 and -.4 < z < .2: return "carbon"       # back of the sidepod shoulders
    return None
