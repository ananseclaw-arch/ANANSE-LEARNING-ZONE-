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

## Cleanup pass (commit "Fable: cleanup pass (artefacts, grid, HUD, seams)")
An independent review of the screenshots found eight problems. Most of them had one root
cause: every route's point list closed back on its first point at a 134° hairpin *at the
start/finish line* (headings 45° → 119° → −174° within 20 m, a 9 m radius), so the torii
gate, the Horizon flag poles and the guard rails stood on the outside of a corner that cars
slid through at 100 mph, the chase camera clipped straight through them, and the grid was
parked around that bend.

- **Routes re-closed** (`GP_CIRCUITS[].pts`): each loop now starts in the middle of a gentle
  straight (heading drifts ~30° over the 80 m around the line; sharpest corner anywhere is
  ~27 m radius; no two stretches pass within 49 m). Laps are 946 / 987 / 1007 m.
- **1 · orange vertical line** = a torii pillar sliced by the camera's near plane. Gone with
  the re-closed loops, the wider gate (`W+3.6`) and the tighter lateral limits.
- **2 · pale-green pole** = a flag pole (bare metal reflecting the green ground) 2 m from the
  camera. Flag poles moved to `W+5.2`, banners / chevrons / speed-trap pole to `W+5`, lanterns
  and street lights to `W+4.8`, delineators to `W+1.9`; the photo-prop shader discards any
  billboard within 3 m of the camera. Players are now clamped at `x=±1.22` (outer wheels on
  the shoulder, 1.5 m inside the rail) and rivals at `±1.1`, instead of `±1.5` (= in the rail).
- **3 · road seam**: that was the verge and the guard rail seen from above while the car ran
  on the shoulder beyond the rail line. Same fix as above.
- **4 · HUD**: one row per skill name (a repeat adds to its row and shows `×2`), the multiplier
  grows with each new skill type or each repeated discrete skill, nothing is scored for 1 s
  after a chain breaks, no PASS credit within 1 s of a bump, and a fresh chain clears a
  lingering CHAIN BROKEN banner.
- **5 · rival clipping the camera**: rivals are hidden when they are less than 3.2 m ahead of
  the camera plane; photo cars fade out between 5.4 m and 3.2 m first. Rivals near the camera
  emit no smoke or dust.
- **6 · grid**: staggered two-wide rows 8 m apart, all ahead of the player, with white grid
  boxes painted in each slot and a chequered start line. The countdown camera is a raised
  chase view that eases down into the normal one (the old side orbit hid the rows).
- **7 · photo cars** take a mild multiply tint toward the route's sun colour and tint
  (`shared.carTint`: warm cream in Tokyo, faintly warm by the lake, faintly cool on Hakone).
- **8 · Fuji**: the sky band is now aimed at the mean heading of the start straight and the
  speed-trap straight (they agree within 30° on every route), so Fuji is ahead on both.
- Also fixed: the sky band's `toneMapped=false; userData.lin=1` had been swallowed by a
  trailing comment, so the photo horizon was being ACES-mapped while the photo props and cars
  were not.
- Also fixed: skid marks were one 1 m tile per frame, so at 140 mph (and any low frame rate)
  they read as a lattice of separate rectangles; each mark now spans the distance covered since
  the last one. Photo cars switch to their nose-left/right frame only past ~15° (was ~6°), so
  rivals on the grid no longer look parked sideways.
- `sw.js` → `learning-zone-v68`.
- Verified with headless Chrome (`lz-fable-shots/fz_world.py` ×4 rounds covering all three routes,
  photo and 3D player cars, Realistic and Storybook; plus the new `fz_edge.py`, which pins the car
  to its lateral limit for long stretches on Kawaguchi and Tokyo). 93 frames scanned: no
  full-height line, no pole or rail at the camera, grid rows visible on every route at the
  countdown, Fuji ahead on the start and main straights, HUD rows unique and CHAIN BROKEN never
  shown next to a live combo.

## F1 circuits + thumb pedals (commit "Fable: F1-style circuits + gas/brake pedals")

- Rebuilt Kawaguchi, Hakone and Tokyo from closed straight/arc segment lists. Each 1.10–1.16 km
  road circuit now has a long start straight, 17 m hairpin, quick opposite-direction chicane,
  flowing esses, 80–100 m fast sweeper, medium 90-degree turns and a route-specific crest/dip
  profile. The generated points also drive the route cards and live mini-map.
- Added circuit analysis at build time: signed curvature, corner/apex regions, grip-limited speed,
  backwards braking profiles and an outside–inside–outside racing line. Rivals follow the line and
  brake before the corner instead of running every bend flat; the player gets a BRAKE cue when the
  speed profile says the next corner needs it. Excess lateral load now pushes a car wide and scrubs
  speed, so the tight corners have a real braking consequence.
- Added red/white apex and exit kerbs, white limits, asphalt/gravel run-off, stacked tyre barriers,
  catch fencing, 300/200/100 boards, pit wall and lane, pit garages, roofed grandstands, grid boxes,
  chequered line and a start-light gantry. The Fuji horizon, cherry trees, torii and Gemini photo
  cars/world art remain in all three settings.
- Replaced the old throttle/brake/drift buttons with large pedal-shaped BRAKE and GAS controls and
  a full left-half steering slide pad. Independent captured pointer IDs allow steering and a pedal
  together; pressed pedals tilt/light, and touch scrolling, zoom gestures, dragging and long-press
  menus are blocked during play. Gas is bound only to the visible GAS pedal. Up/Down and Space
  remain gas/brake/drift keyboard controls; BRAKE + steer initiates a drift and BRAKE reverses slowly
  once stopped.
- Added the per-profile `gpAuto` route-screen choice. `Auto gas (easy)` persists through `save()`;
  missing/older profile values default to OFF. Free-drive notes, song progress and lap reset continue
  to use the generated circuit.
- Three visual rounds are in `lz-fable-shots` (`r1k_*`, `r2h_*` / `r2t_*`, `r3g_*`), covering the
  grid/main straight, pedals, chicanes, hairpins and completed laps. `fz_f1.py` exercises two-pointer
  input and a scripted speed-profile/racing-line driver while recording rival braking; `fz_f1b.py`
  covers persisted auto gas, free-drive notes, keyboard pedals, reverse and the start-line guard.
  A deterministic all-route lap check also completed two laps per circuit with distinct straight and
  corner speeds for both the scripted player and rivals.
- `sw.js` cache advanced to `learning-zone-v69`.

## Wednesday art drop: photo cars for every racer, F1 track dressing, win flow, menu flyover
- New pipeline `wed_assets.py` (PIL/numpy + ffmpeg, picks per `lz-fable-assets/CHOICES.md`): keys the
  green-screen art, trims it and writes WebP sheets ≤ 1024 px wide and ≤ 250 KB each (≈ 0.8 MB of
  images + 2.1 MB of video in total). Sheets are laid out as grids (`cols`/`rows` in `GP_PICS`);
  the view order is always nose-right → straight → nose-left, worked out from the picture itself.
- Cars: Alpine Rally, Kumasi V8 and Lemon Kei are photo sprites now (ChatGPT 3-view sheets, 512 px
  frames); the Rosso Falcon uses the Gemini five-view sheet (`red5.webp`, hard/slight/straight) and
  the view follows a smoothed steer amount with hysteresis, so turning walks straight → slight → hard.
  Sheets without baked flames get an additive exhaust-flame sprite cut from the old red sheet. The
  3D lofted cars remain only as the storybook look / load-failure fallback.
- Track: ChatGPT start gantry over the line (five lamps all red on the grid, going out one by one
  through the count, covers hide each lamp; the blank LED screen is a live canvas: title, then
  LAP x/y · Pn, then FINISH), ChatGPT pit building with a depth block along the main straight, ChatGPT
  grandstands opposite (alternate copies mirrored), a crowd strip cut from the grandstand on sloped
  stands behind the hairpin fences, photo tyre walls at the other big corners, Gemini ad boards along
  the straights, Gemini 100/200/300 plates on the braking boards, ChatGPT kerb tile on every kerb.
  Procedural versions stay as fallbacks when the art has not loaded (and in the storybook look).
- Win flow: 1st place plays the 7 s finish celebration (`assets/video/win.mp4`, skippable, muted
  unless the app sound is on, hard 9 s timeout) and then the podium screen; 2nd/3rd go straight to
  the podium: the podium art with the top three cars and names on the steps and the sunset podium
  clip looping quietly behind. 4th/5th keep the plain results panel.
- Routes screen: the drone flyover (4 s calm aerial played forwards then backwards, 0.7 MB) loops
  muted behind the pickers; it is lazy-loaded 0.5 s after the screen opens, skipped for Save-Data
  and reduced-motion, has a poster fallback and is never precached (`sw.js` leaves mp4 to the network).
- Car select: every card is a hero shot (blurred aerial backdrop + the car's straight view);
  `GP_PICS[id].hero` can point at a dedicated hero image later (wed_gpt2 pass).
- Fixes: rivals no longer fade to see-through when passed (visibility toggle only, alphaTest 0.3);
  trees/houses/lamps keep out of a zone around the pit building and grandstands; the contact shadow is
  a dense core plus a wide soft blob; tyre smoke is its own points shader (≤ 80 puffs, each capped to
  14% of the screen height, per-puff growth/fade, and the cloud dims whenever it would paint more than
  ~15% of the screen).
- Verified: `node --check` on race3d.js/sw.js and all 15 inline script blocks, `inline_lessons.py`,
  `check.py` (only the pre-existing reveal `questionSig`/mascot-emoji items remain, same as main), and
  `lz-fable-shots/fz_sim.py` headless Chrome runs (autopilot on the racing line, 6× time steps):
  2 laps for the player and all four rivals on Kawaguchi, Hakone and Tokyo, plus a storybook race and
  a free drive, with no console errors; screenshots `s1*_*.jpg` cover grid, lights, lap 2 and finish.
- Still to come (second pass): wed_gpt2 extras (five-view sheets for the other cars, hero shots,
  trees sheet, crowd, sky variants, title screen).
- `sw.js` cache advanced to `learning-zone-v70`; the new WebP files are precached, videos are not.

## Wednesday art drop, second pass: wed_gpt2 extras (commit "Fable: wed_gpt2 extras")
- New pipeline `wed_assets2.py` (same green key / trim / WebP rules as `wed_assets.py`; previews and
  `wed2_meta.json` in `lz-fable-assets/out4/`). All 17 ChatGPT pictures were checked by eye; none were
  skipped outright. Parts not used: the fx sheet's drift-trail, exhaust-flame and sparks sprites (the
  smoke system builds trails from puffs, the flame is a side-on burst that does not match the rear-view
  exhausts cut from the red sheet, and the sparks spray has a fixed direction that point sprites cannot
  turn). Everything else went in. New images total 1.37 MB; the five superseded 3-view sheets are deleted.
- Cars: Silver Arrow, Shogun GT, Alpine Rally, Kumasi V8 and Lemon Kei now use five-view sheets
  (`assets/cars/<car>5.webp`, 2x3 grid, hard/slight/straight like red5), so steering walks through the
  slight and hard views for every car. Each sheet showed five clearly different angles in the prompted
  order; where the nose heuristic was not monotonic (small bodies) the picture order is used, checked in
  the keyboard-steering shots (right = frame 0, left = frame 4). Rear windows that reflected the green
  screen are filled as dark glass. Same colour and shape as before, so the cards and the race agree.
- Car select: hero shots for those five cars (`GP_PICS[id].hero`, cropped to the card's 2.4:1 with the car
  whole; Fuji may lose its tip). The Rosso Falcon keeps its current card. The car-select (title) header
  shows the ChatGPT title art under the logo; the routes header keeps the red hero shot.
- Sky: the Fuji band is rebuilt from `sky_fuji.png` (2048 px wide, pano over 140 degrees ahead, the back
  filled with a sideways-blurred mirror of the pano plus its own treeline, cross-faded over 190 px at both
  junctions so the wrap is seamless; band height and metres-per-texel now come from `GP_WORLD.sky`).
  `sky_dusk.png` becomes `sky_dusk.webp`, used by Tokyo Bay (`sky:"dusk"` on the circuit) with its own
  top/haze colours; the other two circuits keep golden hour.
- Trees: `trees.webp` atlas (cherry S/M/L, two cedars, a maple) replaces the two-cell props trees as
  billboards; same spots, pit/grandstand exclusion zones and lake checks as before; the old cells remain
  the fallback when the atlas has not loaded.
- Crowd: `crowd.webp` is the keyed ChatGPT fans-with-flags strip, made seamless sideways and stacked as
  four staggered rows (1024x576, alpha above the flags), tiled every 12 m along the hairpin banks with one
  repeat up the slope (`alphaTest` 0.4 so the sky shows above the heads).
- Effects: tyre smoke uses the ChatGPT puff (`smoke.webp`, its own shading, mirrored four ways per puff
  from the size attribute so the cloud never looks cloned; the 15% screen cap is unchanged); cherry-route
  petals use a real petal sprite (`petal.webp`); the podium screen gets a canvas of confetti and petals
  (`fx.webp` cells) tumbling for ~9 s, skipped for prefers-reduced-motion.
- Kerb: `kerb.webp` is one red + one white block cut from `road_kerb.png`, 64 px across and 128 px along
  the road (was 128x32 along), road side first.
- Verified: `node --check race3d.js sw.js`, `python3 inline_lessons.py`, `node --check` on all 15 inline
  non-JSON scripts, `check.py` (only the pre-existing reveal `questionSig` items), and headless Chrome:
  `lz-fable-shots/fz_sim.py` 2 laps for the player and all rivals on Kawaguchi, Hakone and Tokyo (no
  console errors, podium rendered), `fz_cars.py` keyboard steering (muscle car frames 0/4), and a new
  `lz-fable-shots/fz_spot.py` that shoots at set track fractions (hairpin crowd banks, sky in every
  direction). Screenshots: `s3*_cars/routes/grid/lap2/finish.jpg`, `s2c_left/right.jpg`, `sp_*.jpg`.
- `sw.js` cache advanced to `learning-zone-v71`; the new WebP files are precached.
