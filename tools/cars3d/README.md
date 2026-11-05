# Rosso Falcon #7 3D model

`assets/cars3d/falcon.glb` is built headless in Blender 4.2 LTS (free) from `build_car.py`:

    Blender -b -P tools/cars3d/build_car.py -- assets/cars3d/falcon.glb [render_dir]

Everything is modelled in game coordinates (x right, y up, z = nose, metres). race3d.js drives these nodes:
`body` (lean/dive/squat), `hub_FL/FR` (steer), `wheel_XX` (spin), `caliper_XX`; materials are swapped by name
(`paint`, `stripe`, `tail` = brake lights, `decal` = number roundels). The optional render_dir writes quick-look PNGs.
