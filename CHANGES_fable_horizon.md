# Grand Fable Horizon — Japan edition (branch `fable-horizon`)

The 3D racer (`race3d.js`, inlined into `index.html` by `inline_lessons.py`) was
rebuilt to look and feel like Forza Horizon 6's Japan. Every entry point and
learning hook is unchanged: `renderRace` → `renderCircuits` → `startRace3D`,
XP / `P.race` best times / trophy / `markTodayPlanDone` / `syncProgress`, the
music-note free drive and the 2D fallback when WebGL or Three.js is missing.

## World (all three routes)
- **Mount Fuji** on the horizon: a huge concave-sided lathe mesh with its own
  shader (blue-grey rock, wavy snow line, gullies, built-in haze so it never
  disappears into the fog) placed beyond the start straight so the torii frames
  it and it stays in view for most of the lap. Cloud wisps sit on its flank.
- **Lake Kawaguchi Loop**: golden hour, cherry blossom lining the road, falling
  petals, stone lanterns, a lakeside town with tiled hipped roofs around a
  reflective lake, a small hazy city in the distance.
- **Hakone Mountain Pass**: misty morning, two mountain bumps the road climbs,
  dense cedar forest hugging the road, chevron bend signs, taller ridges.
- **Tokyo Bay Run**: sunset, a varied hazy skyline of lit tower blocks with a
  red lattice tower, the road running along the bay.
- Torii start gate spanning the road, pink HORIZON flags on the start straight,
  white guard rails with posts, red-and-white delineator posts, rolling hills,
  asphalt with white edge lines and dashed centre line, distance haze, golden
  sun with one shadow-casting light, soft contact shadow under every car.

## Cars
- Bodies are now smooth lofted hulls (superellipse cross-sections with
  tumblehome and rear hips) plus a raked glass canopy, slim LED headlights,
  full-width LED tail bar with round lamps, diffuser with fins, splitter, side
  skirts, mirrors, exhausts, rear wings (lip / duck / big swan-neck / roof),
  dark wheel-arch rings, textured 5-spoke rims and red calipers.
- Clear-coat paint (`MeshPhysicalMaterial`) reflecting a PMREM environment
  built from a canvas-painted panorama; glass canopy reflects it too.
- Six cars: Rosso Falcon (default red supercar), Silver Arrow (hypercar with
  big wing), Shogun GT, Alpine Rally, Kumasi V8, Lemon Kei. Old saved car ids
  fall back to the Falcon. Menu previews are real 3D renders of the same model.
- Races put all five cars on a staggered two-column grid; the player starts
  at the back and the intro camera sweeps past the rivals and the torii.

## HUD and feel
- Horizon-style round **MPH** speedometer with rev arc, red line, tick ring and
  gear bubble; position, lap, timer, mini-map (with a Fuji silhouette on the
  route cards), skill-chain banner (DRIFT, NEAR MISS, PASS, DRAFTING, CLEAN
  RACING, SPEED TRAP) with multiplier and banking.
- Speed feel: FOV pushes from 60 to 73 at top speed, half-resolution overlay
  canvas draws edge speed lines and a darkening vignette, roadside posts /
  trees / flags streak past, tyre smoke and skid marks on drifts, dust off
  road, camera buzz at high speed, engine pitch follows revs (WebAudio kept).
- Dial reads mph (`GP_MPH`), gears in mph (`GP_GEARS`), speed-trap scores and
  best-trap records are in mph.

## Looks
- **Realistic** is the default: ACES tone mapping, sRGB output, sky gradient
  shader with sun disc and warm glow, fog haze, shadows.
- **Storybook** (the previous ink-and-watercolour post-process, paper HUD and
  hand-written font) is selectable on the route screen and saved as
  `P.gpLook`. The storybook CSS is scoped under `.story`.

## Performance
- Instanced meshes for trees, crowns, houses, towers, posts, flags, lanterns,
  signs, skids; one directional shadow light; pixel ratio capped at 2; the
  existing auto step-down (pixel ratio, then shadows) when fps < 45.
- No new runtime downloads: every texture is drawn on a canvas; Three.js r128
  is still loaded by `loadThree()`.

## Verification
- `node --check race3d.js`, `python3 inline_lessons.py`, and `node --check` on
  all 15 non-JSON inline scripts of `index.html` pass.
- Five headless-Chrome screenshot rounds (software WebGL) via
  `fz_shot_any.py` plus an extra race-mode script
  (`staging/lz-fable-shots/fz_extra.py`) covering all routes, car select and
  the storybook look. Fixes made from them: Fuji colour/size/shape, far-plane
  double colour conversion that rendered the Tokyo bay black, bay placement,
  washed-out paint, floating spoilers, oversized cherry crowns, glare size.

## Real car pictures + intro film (commit "Gemini car sprites + intro video")
- **Sprite cars, Out Run style.** The Rosso Falcon (red) and Silver Arrow
  (silver) are now Gemini-rendered photos instead of built meshes. Each car is
  one upright plane that turns to face the camera (`gpBuildPicCar`,
  `gpPicUpdate`); the frame is picked from the car's angle to the line of sight
  (nose-right / straight / nose-left, with hysteresis). For the player the
  steering input is folded in so the car leans the moment a button is pressed;
  rivals use their real relative yaw. Flame frames flash on up-shifts from 3rd,
  when a skill chain banks, and now and then on fast rivals (`gpFlame`).
  Physics, collisions, the skid/smoke effects and the soft contact shadow are
  unchanged; the 3D model is still used for the other four cars, for any car
  whose picture fails to load (or takes more than 7 s), and under the Storybook
  look, whose ink filter buries a photo.
- **Assets** (`assets/cars/red.webp`, `assets/cars/silver.webp`, ~85 KB each):
  6-frame sheets (3 views, then the same 3 with exhaust flames) cut from the
  green-screen videos by `key_cars.py` (ffmpeg frame grab, alpha from green
  dominance, edge unmixing + despill, floor shadows and sun glints dropped,
  neighbouring cars separated with a lowest-cost seam, every view tight-cropped
  onto one shared ground line). Scale comes from the straight view's width
  (`GP_PICS[id].ppm` px/m, the straight car = 2.3 m with mirrors).
- **Intro film** (`assets/intro_race.mp4`, 1.5 MB, faststart): plays once per
  session before the first race with a big SKIP button (`gpIntro`); it starts
  inside the route tap so iOS allows sound, is muted when the app's sound or the
  racer's mute is off, and can be replayed from the routes screen
  ("🎬 Watch the intro"). It is only requested when a race starts.
- **Car picker** shows the straight picture for the two photo cars; the paint
  swatches hide for them ("This car comes in its own colour").
- **Service worker** (`learning-zone-v66`): the two sheets are precached, video
  files bypass the worker entirely (Safari needs real range replies and the film
  must not sit in the app cache).
- Verified with four headless-Chrome rounds (`lz-fable-shots/fz_cars.py`):
  picker, intro playing + skip, grid, flames, steering left/right frames,
  rivals at distance, second race without intro, Hakone in Storybook (3D cars),
  Tokyo free drive with the silver car.

## Gemini world art (commit "Gemini world art (Fuji sky, road, props, HUD, white car)")
The photo cars no longer sit in a low-poly toy world: the far world, road, roadside
props, rails, HUD dial and menus now come from the Gemini pictures too. All of it is
gated on the Realistic look; the Storybook look keeps the painted 3D world.

- **Assets** (`world_assets.py`, run with `/usr/bin/python3`; reuses `key()`/`clean()`
  from `key_cars.py`, whose main body is now under `if __name__ == "__main__"`):
  `assets/world/sky.webp` (61 KB, 3072×326 360° band: the Fuji panel in the middle,
  the hazy hills strip from under the divider mirrored into the back 240°, feathered
  top and bottom, pre-mirrored because it is seen from inside a cylinder),
  `props.webp` (50 KB atlas: cherry, cedar, torii, lantern, banner), `rail.webp`
  (one guard-rail bay, 128×64 so it repeats on WebGL1), `road.webp` (269 KB),
  `speedo.webp` (dial with the baked "GEAR 4" painted out), `logo.webp`, `hero.webp`
  (74 KB) and `assets/cars/white.webp` (22 KB, 3 views of the white GT). Everything is
  precached by `sw.js` (`learning-zone-v67`) but only requested when a race starts
  (`gpLoadWorld`, same 7 s race as the car pictures) or the picker opens.
- **Sky**: a camera-following cylinder band (`GP_WORLD.sky`, r 1500 m, 3.3 m/px,
  horizon 55 m up) drawn in the opaque pass right after the sky dome with custom alpha
  blending, so it only shows where nothing else is drawn. It is rotated so Fuji sits
  on the start straight. The 3D Fuji, the 20 low-poly far ridges and the flank clouds
  are skipped when the band is on; fog and the dome's lower stops take the band's own
  colours, tinted per route (`look.tint`: cool for Hakone, warm for Tokyo).
- **Road**: the asphalt photo (edge lines + dashed centre) repeats every 30 m along
  the ribbon with anisotropic filtering; the white rails are now the photo bay repeated
  every 2.4 m (alpha-tested, no shadow caster), the grey posts go with it.
- **Props**: one draw call of camera-facing billboards (`gpBillboards`: instanced quad
  with per-instance position, size/mirror, atlas cell; vertex shader turns them about Y;
  photo colours shown as-is with scene fog mixed in) replaces every low-poly tree,
  the stone lanterns on the lake route, and adds purple banners every 30 samples and two
  photo torii off-road. Each prop has a soft ground blob. Grass is warmed and darkened
  to match the golden hour, the pink HORIZON flags are halved, roadside houses are
  dropped on the lake and mountain routes and pushed back on the bay route.
- **Shogun GT** is the third photo car (3-frame sheet, no flame frames).
- **Grounding**: a dense ambient-occlusion blob (`gpAoTex`), 1.6× car width, under every
  photo car.
- **Chase camera**: closer and lower as speed builds (6.3 → 5.3 m, 2.1 → 1.75 m), and it
  smooths its *offset* from the car instead of its absolute position, which removed a
  ~12 m lag at 147 mph.
- **Frames**: the player car uses the straight frame unless the steer button / steering
  velocity / drift says otherwise — never yawed while parked on the grid.
- **HUD**: the photo dial is the speedometer face: live needle, the baked rev arc is
  masked beyond the needle, mph digits and gear bubble in the glass centre, live
  "GEAR n" pill where the baked text was. Countdown is smaller and higher; the route
  card is smaller, sits at the top and fades after 2 s (an old `.gp3-card{bottom}`
  rule was stretching it).
- **Menus**: the logo and the red-car hero shot head both the car picker and the
  route screen (storybook keeps the logo on paper).
- **Race grid**: verified in race mode — five cars on the grid, position HUD shown.
- Verified with five headless-Chrome rounds (`lz-fable-shots/fz_world.py`) across all
  three routes, race and free drive, Realistic and Storybook, all three photo cars.
