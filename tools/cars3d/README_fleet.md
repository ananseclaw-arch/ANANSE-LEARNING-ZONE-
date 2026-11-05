# Grand Fable GP 3D fleet (17 cars + the Rosso Falcon)

`build_fleet.py` builds the 17 fleet cars (10 road/race cars, 4 exotics, 3 trucks) headless in Blender 4.2 LTS. It does not touch `build_car.py` or `falcon.glb`.

    Blender -b -P tools/cars3d/build_fleet.py -- [--out assets/cars3d] [--render ~/staging/lz-gp-speed-shots/cars] [--json PATH] [ids...]

- No ids means all of them: `falcon arrow shogun rally kumasi kei ridge formula retro kente viper razor aurora comet breeze
  monster trophy semi`. `falcon` only imports
  `falcon.glb` so it can be rendered and its stats measured.
- Writes `assets/cars3d/<id>.glb` and merges the per-car stats into `assets/cars3d/fleet.json`, so rebuilding one car keeps
  the other entries. With `--render` it also writes `chase`, `rear34`, `front34`, `side` and `front` PNGs per car (the trucks'
  cameras are pulled back by their `cam` factor). `GP_DEBUG_VIEWS=1` adds `top`, `rearclose` and `under` views plus per-object
  triangle counts.
- Cars not rebuilt in a run still get `eye`/`exh` refreshed in fleet.json; that is computed in pure Python (no re-export), so
  building only some ids never touches the other GLBs.
- On every run it regenerates the helper textures next to the script with numpy: `kente_livery.png` (kente band atlas plus
  gold/green/black/red swatches), `teal_livery.png`, `yellow_livery.png` and `num59.png` (number roundel).
- It prints `CHECK` lines for wheel clearances (tyre top to arch lip, tyre face vs body side, inner well clearance).
- The whole fleet with renders takes about 30 s.

Conventions match build_car.py. Everything is modelled in game coords (x = car's left, y up, z = nose) and mapped to
Blender as (x, -z, y). The node layout is `<id>` -> `body`, `hub_FL/FR/RL/RR` -> `wheel_XX` + `caliper_XX`, and it uses the
same material names. The main body is always `paint`. The only extra material is `livery` (textured, not recoloured by the
game). The export settings are the same as build_car.py. The breeze adds `helmet` and `suit` for its driver; the game keeps
unknown material names as they are.

Road cars all use one parameterised version of build_car.py's smoothed cross-section body. Per-car key tables set:
- width, centre-line top, fender crown, cabin, roof width, and pickup bed
- glass ranges
- nose and tail rounding
- whether the rear arch is open
- material "bands" picked by section-point tag, with optional UVs; these make the kente band, sills, intakes and louvres

Each car then adds its own parts (lamps, wings, bars and so on). A key table wrapped in `Lin([...])` is interpolated
linearly instead of with smoothstep, which gives the razor its crisp wedge creases. The formula car is built separately from lofts (tub,
sidepods, wings, halo). Wheel styles: sport, mag, aero, wire, mesh8, rally, beadlock, truck (chrome dish plus lug nuts). Treads: slick, ribbed,
gravel, knobbly, monster (big alternating paddles). A wheel with `dual=True` (semi rear) puts two tyres in the one `wheel_XX`
node. Helpers for the trucks: `shock` (coil-over), `coil`, `arc_fender`, `spare_tyre`, `prism` (fin) and `side_line` (door cuts).

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
- `eye`: [x, y, z], the driver's eye point for a cockpit camera (x > 0 is the car's left; road cars sit the driver on the left,
  while formula and comet are central). Roof cars use y = centre-line roof height - 0.14 at that z.
- `exh`: list of [x, y, z] exhaust tip points facing backwards (for boost flames). A 4th value of 1 means the tip points up
  (the semi's stacks). Cars without pipes get points at the diffuser centre (arrow), and the formula gets one above its rain light.

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
| razor | wedge hypercar | Very low, linear (`Lin`) wedge tables with sharp sections, scissor-door cut line hinged at the A-pillar front (chrome hinge pod), a raised crease running into a carbon side intake, glass engine window with louvres, chevron tail lamps, hex twin exhausts, big raised diffuser, ducktail blade and no wing. |
| aurora | front-engine V12 GT | Long bonnet with a power bulge and twin vents, cab set far back, long fastback glass, chrome side gills, oval chrome grille, twin oval tail lamps each side with a chrome bar, quad chrome pipes. |
| comet | Le Mans prototype | Fender pods with a low valley between them, closed bubble canopy (glass front and sides, body-colour spine), orange (`stripe`) shark fin from the canopy to a wide wing, tail strips on the end plates, pod tail lamps, rain light, chunky lamp pods. Eye is central. |
| breeze | open roadster | Open two-seater with a small wrap screen, two chrome roll hoops, a driver on the left (`suit` torso and arms, `helmet` with a visor and a stripe), steering wheel, white side stripe. `roofY` is set to 1.22 (helmet and hoop height). |
| monster | monster truck | 0.80 m wheels (0.60 wide, `monster` paddle tread, beadlocks) set 0.43 m outboard of a pickup body at ride 1.30, solid axles with diffs, 4-link bars, 8 coil-overs, a bed roll cage, a roof light bar, chrome tube bumpers and twin pipes under the bed. |
| trophy | desert trophy truck | 0.47 m knobbly tyres under wide flared fenders (carbon flares), ride 0.75, long-travel front (upper and lower A-arms, 2 coil-overs a side), trailing arms and coil-overs at the rear, a spare wheel tipped back in the bed, a rear cage with a red chase-light bar, a roof light bar and a skid plate. |
| semi | racing semi cab | Flat-front cab-over with a sleeper fairing, big chrome grille with bars, split windscreen with a visor, chrome bumper, mirrors on arms, twin chrome stacks (exh points up), side skirts with steps, a fifth wheel, quarter fenders and mud flaps, dual rear tyres, and a rear crossmember with round lamps. Rear wheels are outside the loft body, so the arch CHECK only covers the front. 6.46 m long. |

## Notes for the game side
- The game caches the first `decal` material it sees (`SM.decal`), so the retro's "59" roundel would show as the Falcon's
  "7" unless decals are cached per car.
- `gpBuildGlbCar` hardcodes tyre widths 0.30/0.38 and takes the wheel radius from `GP_SHAPE`. Use `twF/twR/rad/radR` from
  fleet.json for these cars.
- The formula's rear wing is narrower than its track (as on real cars). Its sticker sits on the main plane at x = ±0.27.
- The trucks need `twF/twR/rad/radR` from fleet.json even more than the others: monster tyres are 0.80 m x 0.60 m and the
  semi's rear `twR` 0.66 covers both dual tyres. Their `ride` is the body floor (monster 1.30, trophy 0.75, semi cab 0.95).
