# Rosso Falcon #7 3D model

`assets/cars3d/falcon.glb` is built headless in Blender 4.2 LTS (free) from `build_car.py`:

    Blender -b -P tools/cars3d/build_car.py -- assets/cars3d/falcon.glb [render_dir]

Everything is modelled in game coordinates (x right, y up, z = nose, metres). race3d.js drives these nodes:
`body` (lean/dive/squat), `hub_FL/FR` (steer), `wheel_XX` (spin), `caliper_XX`; materials are swapped by name
(`paint`, `stripe`, `tail` = brake lights, `decal` = number roundels). The optional render_dir writes quick-look PNGs.

v3 (job 1104-2023-e307): rounder body built from smoothed cross-sections (Catmull-Rom midpoints), rear haunches and front
fender crowns above the deck/hood, tumblehome cabin, rounded tail; deep tyres (bulging sidewalls, tread grooves) with the
gunmetal rim face recessed ~6 cm (`spoke` material), wider track so the rear tyres show from the chase cam, 10 cm arch gap
so the body can roll ~7.5 deg / dive ~4 deg over the wheels. ~21.6k tris, ~613 KB. The game loads it as `falcon.glb?v=3`
(bump the query when the model changes so iPads don't keep the old file).

## Meshy vertical slice (job 1108-2132-5e28)
`assets/cars3d/falcon.glb` v5 is now the Meshy 6 Lite shape (CC BY 4.0, raw GLB kept in staging `gp-meshy/`, not in this repo), cleaned, cut, wheeled and painted by
`build_meshy_falcon.py` (plus `meshy_falcon_bake.py`, `meshy_falcon_previews.py`, `meshy_num7.png`). Same node + material contract as `build_car.py`.
Run: `Blender -b --factory-startup -P build_meshy_falcon.py -- <raw.glb> <out.glb> [render_dir] [workdir]`
The old code-built falcon stays in git history (`build_car.py` still builds it). Paint zones are hand-fitted outlines in game coordinates.
