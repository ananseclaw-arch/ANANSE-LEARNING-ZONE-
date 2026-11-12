# shadow_atlas.py <bake_dir> <out.webp> <out.json>: packs the Blender-baked ground shadow tiles (bake_light.py --shadow) into one
# 5x4 atlas of 128 px tiles. Alpha = how much sky the car hides from that patch of road (0 at the tile edge). Needs Pillow.
import sys, os, json, glob
from PIL import Image, ImageFilter
B, OUT, OJ = sys.argv[1:4]; N = 128; COLS = 5
ids = sorted(os.path.basename(f)[:-7] for f in glob.glob(os.path.join(B, "*_sh.png")))
rows = (len(ids) + COLS - 1) // COLS; atlas = Image.new("RGBA", (COLS * N, rows * N), (0, 0, 0, 0)); meta = {}
for k, cid in enumerate(ids):
    g = Image.open(os.path.join(B, cid + "_sh.png")).convert("L").transpose(Image.FLIP_TOP_BOTTOM)   # Blender rows run bottom-up
    g = g.filter(ImageFilter.GaussianBlur(2.5)); a = Image.new("L", (N, N)); px = g.load(); pa = a.load()
    for y in range(N):
        for x in range(N):
            e = min(x, y, N - 1 - x, N - 1 - y) / 10.0; fade = max(0.0, min(1.0, e))   # fade to 0 over the outer 10 px
            occ = max(0.0, min(1.0, (255 - px[x, y]) / 255.0)) ** 1.3 * 0.9; pa[x, y] = int(255 * occ * fade)
    c, r = k % COLS, k // COLS; atlas.paste(Image.merge("RGBA", (Image.new("L", (N, N), 0),) * 3 + (a,)), (c * N, r * N))
    j = json.load(open(os.path.join(B, cid + ".json")))["shadow"]; meta[cid] = [c, r] + [j["cx"], j["cz"], j["w"], j["l"]]
atlas.save(OUT, "WEBP", quality=80, method=6, lossless=False)
json.dump({"cols": COLS, "rows": rows, "tiles": meta}, open(OJ, "w"))
print("atlas", OUT, os.path.getsize(OUT), "bytes", len(ids), "tiles")
