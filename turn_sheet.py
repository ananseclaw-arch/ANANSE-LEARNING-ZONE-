#!/usr/bin/env python3
"""Key a ChatGPT five-view turning sheet (assets in lz-fable-assets/turn) into assets/cars/<out>.webp.
Usage: /usr/bin/python3 turn_sheet.py red_turn.png red5t 2.0
Reuses the car_sheet recipe from wed_assets2.py (exec'd up to the batch calls) with SRC pointed at turn/."""
import os, sys, json
REPO = os.path.dirname(os.path.abspath(__file__))
name, cid, width_m = sys.argv[1], sys.argv[2], float(sys.argv[3])
src = open(os.path.join(REPO, "wed_assets2.py")).read().split('car_sheet("silver5.png"')[0]
src = src.replace('SRC = os.path.join(A, "wed_gpt2")', 'SRC = os.path.join(A, "turn")')
os.chdir(REPO); sys.path.insert(0, REPO)
g = {"__file__": os.path.join(REPO, "wed_assets2.py"), "__name__": "turn"}
exec(compile(src, "wed_assets2_head", "exec"), g)
g["car_sheet"](name, cid, 5, width_m, 2, upscale=1.0)
print(json.dumps(g["meta"][cid]))
