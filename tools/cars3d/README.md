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

## Baked light + compression (job 1112-0016-43fd)
Every car GLB carries Blender-baked lighting in `COLOR_0` and is meshopt-compressed. Blender is the bake engine only; the GLB
is never re-exported through Blender, so nodes, materials, liveries and numbers stay exactly as built above.

    # 1. bake (one Blender at a time): vertex light json + ground-shadow tile per car
    Blender -b --factory-startup -P tools/cars3d/bake_light.py -- <unpacked car.glb> <bake/id.json> [--meshy] [--shadow bake/id_sh.png]
    # 2. shadow atlas (Pillow): assets/cars3d/shadows.webp + the GP_SHADOW_TILES table pasted into race3d.js
    python3 tools/cars3d/shadow_atlas.py bake assets/cars3d/shadows.webp bake/atlas.json
    # 3. write the bake into the UNPACKED originals, compress, check (node deps installed OUTSIDE the repo)
    bash tools/cars3d/pack_all.sh <dir of unpacked originals> bake assets/cars3d <node_dir>

Re-running the build scripts above gives an unpacked GLB again: run steps 1-3 on it before committing.
`bake_light.py`: Cycles-free deterministic ray-cast AO (24 cosine rays, 0.6 m, ground plane) x analytic sky/key term, 2 smoothing
passes; `--cycles` uses a Cycles AO bake instead. Meshy cars keep their own baked AO map; their vertex term stays >= 0.6.
`pack_glb.mjs`: meshopt (EXT_meshopt_compression) + KHR_mesh_quantization on normals/uvs/colours only - positions stay float
because three r128 ray-casts the bodies on the CPU (name plates, roof numbers) and does not de-normalise quantised positions.
`check_glb.mjs`: same node names, material names, triangle count and per-node bounding box (2 mm) as the original.
`assets/vendor/meshopt_decoder.js` = meshopt_decoder.cjs from meshoptimizer 1.3 (MIT, (c) Arseny Kapoulkine), unchanged.

## Realistic look (job 1112-0147-25ca)
The six Meshy cars keep their geometry; Realistic gives them real alloy / glass numbers through the cosmetic `rs` key in
`GP_GLB` (merged over `matSet` only in the Realistic look, so Cartoon/Storybook are unchanged). The fleet rebuild, lamp units
and the contract check are described in `README_fleet.md`.
