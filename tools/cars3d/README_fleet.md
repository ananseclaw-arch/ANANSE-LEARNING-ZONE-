# Grand Fable GP 3D fleet (10 cars + the Rosso Falcon)

`build_fleet.py` builds the 10 new cars headless in Blender 4.2 LTS. It does not touch `build_car.py` or `falcon.glb`.

    Blender -b -P tools/cars3d/build_fleet.py -- [--out assets/cars3d] [--render ~/staging/lz-gp-speed-shots/cars] [--json PATH] [ids...]

- No ids means all of them: `falcon arrow shogun rally kumasi kei ridge formula retro kente viper`. `falcon` only imports
  `falcon.glb` so it can be rendered and its stats measured.
- Writes `assets/cars3d/<id>.glb` and merges the per-car stats into `assets/cars3d/fleet.json`, so rebuilding one car keeps
  the other entries. With `--render` it also writes `chase`, `rear34`, `front34`, `side` and `front` PNGs per car.
- On every run it regenerates the helper textures next to the script with numpy: `kente_livery.png` (kente band atlas plus
  gold/green/black/red swatches), `teal_livery.png`, `yellow_livery.png` and `num59.png` (number roundel).
- It prints `CHECK` lines for wheel clearances (tyre top to arch lip, tyre face vs body side, inner well clearance).
- The whole fleet with renders takes about 30 s.

Conventions match build_car.py. Everything is modelled in game coords (x = car's left, y up, z = nose) and mapped to
Blender as (x, -z, y). The node layout is `<id>` -> `body`, `hub_FL/FR/RL/RR` -> `wheel_XX` + `caliper_XX`, and it uses the
same material names. The main body is always `paint`. The only extra material is `livery` (textured, not recoloured by the
game). The export settings are the same as build_car.py.

Road cars all use one parameterised version of build_car.py's smoothed cross-section body. Per-car key tables set:
- width, centre-line top, fender crown, cabin, roof width, and pickup bed
- glass ranges
- nose and tail rounding
- whether the rear arch is open
- material "bands" picked by section-point tag, with optional UVs; these make the kente band, sills, intakes and louvres

Each car then adds its own parts (lamps, wings, bars and so on). The formula car is built separately from lofts (tub,
sidepods, wings, halo). Wheel styles: sport, mag, aero, wire, mesh8, rally, beadlock. Treads: slick, ribbed, gravel, knobbly.

## fleet.json
One entry per id:
- `n`, `bytes`, `tris`
- `len` and `w`: overall bounding box, including bumpers, bull bar and mirrors
- `ride`, `rad`, `radR`, `twF`, `twR`
- `tyreX`: rear half track. `tyreXF`: front half track (extra field).
- `xf`, `xr`, `tail` (min z of the `tail` material), `nose`, `pivotY`, `roofY`
- `glows`: [x, y, w, h] per brake lamp
- `sticker`: [x, y, z, rotX] for the +x side
- `wing`

## Per-car notes
| id | type | notes |
|---|---|---|
| arrow | electric hypercar | Very low, black bubble canopy, thin full-width tail bar and curved front lamp bar, no exhausts. Teal (`livery`) centre stripe, sill blades and aero-disc rings. Open rear arches. |
| shogun | Japanese super-coupe | Squarer sections (`sharp` 0.55), box flares, 4 round tail lamps in a dark panel, ducktail lip plus medium wing. The wing's gurney line is `stripe`, which the game turns red on a white car. |
| rally | rally hatch | Ride 0.20 m, raked hatch with a thick C-pillar, white side and roof stripes (`stripe`), roof scoop, roof-edge wing, white mud flaps, 4-lamp pod on the bonnet, gravel-lug tyres, white 6-spoke rims (`stripe`). |
| kumasi | muscle car | Long hood with scoop, fastback, twin `stripe` stripes, chrome bumpers, mirrors and exhaust tips (`rim`), quad round headlamps, fat rear tyres (0.40 m), twin big pipes. |
| kei | small hot hatch | 3.4 m body, 1.53 m tall and boxy, 0.29 m wheels, roof spoiler, round headlamps, vertical tail lamps, hatch glass. |
| ridge | pickup / off-roader | Ride 0.40 m, 0.43 m knobbly tyres on beadlock rims, tall cab, open bed with a carbon liner, roll bar, roof light bar, bull bar, black lower cladding. Body 5.3 m; 5.63 m with the bull bar and bumper. |
| formula | open-wheeler | Narrow tub, open cockpit, halo, helmet, airbox, sidepods with dark intakes, big front and rear wings with yellow (`livery`) flaps, exposed wheels on wishbones, rain light plus end-plate LEDs. |
| retro | 1950s sports racer | Cigar body, bulging fenders, twin headrest humps, wrap-around screen, oval grille, faired round lamps, wire wheels with knock-off spinners, cream `stripe`, "59" roundels (`decal` with num59.png). |
| kente | Ghana sports car | Red `paint`. `livery` atlas: green sills, gold line, kente band along both sides and over the rear deck, gold ducktail, gold mirror caps, green splitter. Black stars (`carbon` slabs) on the bonnet and roof. |
| viper | mid-engine wedge | Hood level with the fenders so it reads as a wedge, cab-forward, carbon side intakes and engine-cover louvres (bands), 7-fin diffuser, low wide wing. |

## Notes for the game side
- The game caches the first `decal` material it sees (`SM.decal`), so the retro's "59" roundel would show as the Falcon's
  "7" unless decals are cached per car.
- `gpBuildGlbCar` hardcodes tyre widths 0.30/0.38 and takes the wheel radius from `GP_SHAPE`. Use `twF/twR/rad/radR` from
  fleet.json for these cars.
- The formula's rear wing is narrower than its track (as on real cars). Its sticker sits on the main plane at x = ±0.27.
