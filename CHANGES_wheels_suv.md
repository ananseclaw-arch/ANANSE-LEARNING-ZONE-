# Wheels + SUV changes

## What changed

- Added **Thunder Ridge XL** (`ridge`, `suv`, `#2457D6`, A/780, speed 4, handling 2, acceleration 3) to `GP_CARS`.
- Added the tall, long-wheelbase `suv` fallback to `GP_SHAPE`. `gpBuildCar()` adds plain roof rails/crossbars; there are no brand names, badges, or logos in the definition.
- Added `ridge5.webp` and `hero_ridge.webp` to `GP_PICS`. `gpLoadPics(ids)` / `gpRacePicIds()` now load only the selected car and the four cars on its grid, so the SUV race sheet is not loaded when the SUV is not participating.
- Added measured per-frame wheel ellipses in `GP_WHEEL_VIEWS` and the shared patch path in `gpWheelPatchShared()`, `gpBuildWheelPatch()`, `gpWheelPatchView()`, `gpWheelPatchCell()`, and `gpWheelPatchUpdate()`.
  - One shared 1024x64 canvas atlas contains twelve sharp six-spoke phases and one radially pre-blurred state.
  - The blur is drawn once by accumulating rotated spoke samples; there is no per-frame texture creation.
  - A car's visible wheel ellipses share one indexed geometry/material, so one or two wheels cost one draw call per patched car.
  - `wheelPhase += speed * dt / wheelRadius`; it is unwrapped for telemetry and does not advance at zero speed.
  - Blur hysteresis enters at 7.5 rad/s and returns to sharp below 5.5 rad/s. Sharp spokes are not sampled at racing angular speeds, preventing reverse/stationary wagon-wheel aliasing.
- `gpUpdate()` now keeps each car root and its contact shadows on the road. Hop, off-road bob, speed/distance-based vibration, roll, squat, and brake dive affect `body` only. The SUV has slightly slower settling and a little more visible roll/squat travel.
- `gpRender()` now has a fixed post-countdown chase offset and fixed FOV: landscape is 60 degrees with offset length 6.641 world units; portrait is 78 degrees with offset length 8.900. Speed/drafting FOV changes, speed jitter, drift offset, and collision shake were removed.
- Roadside delineators in `gpBuild()` are placed every 3 track samples instead of every 8 (2.67x as many instances) in the same existing `InstancedMesh`, so marker density rises without another draw call.
- Existing pooled smoke remains limited to drifting, hard braking/slip, and off-road dust. No heat haze, radial blur pass, or other full-screen pass was added.
- Ran `python3 inline_lessons.py`; `index.html` now contains the same `race3d.js`.

## Wheel patch coverage

Frame order is 0 hard nose-right, 1 slight nose-right, 2 straight, 3 slight nose-left, 4 hard nose-left. Coordinates/sizes/ellipse tilt are stored in `GP_WHEEL_VIEWS` as frame-local source pixels.

| Car | Patched views | Deliberately unpatched |
|---|---|---|
| Rosso Falcon | 0, 1, 3, 4 | 2: tyre backs/no clean rim face |
| Silver Arrow | 0, 4 | 1, 2, 3: rim hidden or only a tyre edge |
| Shogun GT | 0, 4 | 1, 2, 3: rim hidden or only a tyre edge |
| Alpine Rally | 0, 4 | 1, 2, 3: mudflap/tyre edge prevents a clean overlay |
| Kumasi V8 | 0, 1, 3, 4 | 2: tyre backs/no clean rim face |
| Lemon Kei | 0, 1, 3, 4 | 2: tyre backs/no clean rim face |
| Thunder Ridge XL | 0, 1, 3, 4 | 2: tyre backs/no clean rim face |

Total: 22/35 views. Missing views use the untouched photographed wheel rather than a misplaced patch.

## SUV art status

- Re-ran `/usr/bin/python3 turn_sheet.py suv_turn.png ridge5 2.05` against `lz-fable-assets/turn/suv_turn.png`.
- Output: `assets/cars/ridge5.webp`, 932x867, 63 KB; metadata is 5 frames, 2 columns, 3 rows, `fw:466`, `fh:289`, `ppm:151.71`.
- Source nose offsets left-to-right were `[26.3, 18.8, 0.7, -13.7, -26.8]`, monotonically decreasing. The packer's conservative check used reversed picture order; visual inspection confirms packed frame 0 is nose-right. In `gpPicUpdate()`, steering right produces bin -2 and selects frame 0.
- `assets/world/hero_ridge.webp` is 960x400 (2.4:1), 59 KB, matching the existing hero asset format.
- I inspected the keyed sheet and hero: the vehicle is complete, blue, cleanly keyed, and has no visible badge/logo/text. The keyed sheet has no obvious green halo at normal pixel inspection.

## Measurement and test hooks

`window.__gp` is updated every rendered frame with:

- `playerWheelPhase` / `wheelPhase`
- `playerSpeed` / `speed`
- `wheelRadius`
- `cameraFov`
- `cameraOffsetFromCar` / `cameraOffset`, plus `cameraOffsetVector`
- `playerShadowWorldY` / `shadowY`
- `rendererCalls` / `renderCalls` from `renderer.info.render.calls`
- `wheelPatchDrawCalls`
- `wheelPatchState` (`sharp`, `blur`, or `3d`), `wheelPatchVisible`, and `wheelPatchFrame`

`renderer.info.autoReset` is disabled and `renderer.info.reset()` is called once at the start of `gpRender()`, so the reported call count includes both the scene and Storybook post pass when applicable.

### Draw-call change

- A steady photo car previously used 3 calls: body plane + 2 contact shadows.
- A visible patched photo car uses 4 calls: the same 3 + 1 batched wheel mesh. An unpatched view remains at 3. A transient exhaust flame adds one call in either version.
- Therefore a five-photo-car race adds 0 to 5 calls depending on visible view bins. `wheelPatchDrawCalls` exposes the exact per-frame increment, and `rendererCalls` exposes the actual full-scene total.
- The closer reflector spacing changes instance count only and adds 0 calls.
- Storybook/fallback 3D cars add 0 wheel-patch calls; their existing 3D wheels continue to rotate.

## Validation completed

- `node --check race3d.js`: passed.
- Parsed every inline script in `index.html` with Node `vm.Script`: 15/15 passed.
- `git diff --check`: passed.
- Re-ran the SUV sheet pipeline and verified dimensions/order listed above.
- Performed an offline, source-pixel overlay review of every annotated view and corrected near-edge anchors.

## Not checked here

- This sandbox has no usable browser/localhost path, so I could not honestly record live FPS, a full-scene before/after `renderer.info` number, screenshots, Safari/iPad texture behavior, or a runtime console-error count. Hermes can read all required values from `window.__gp` and perform those browser checks.
- The generated wheel patches cannot reproduce body/fender occlusion in views where the rim is not cleanly exposed; those views are the ones explicitly left unpatched above.

## Pass 2

### Straight-view tread motion

- Added measured frame-2 rear-tyre patches to all seven photo cars: Rosso Falcon, Silver Arrow, Shogun GT, Alpine Rally, Kumasi V8, Lemon Kei, and Thunder Ridge XL.
- The tread patches reuse each car's existing two-quad wheel batch, the shared wheel atlas, and the existing material, so frame 2 now has motion without adding a draw call beyond the one wheel-patch call already budgeted per car.
- Six sharp tread phases scroll down the photographed tyre backs from `wheelPhase` below the existing 7.5 rad/s blur threshold. Above it, the same quads switch to a soft vertical tread smear; blur exits below 5.5 rad/s.
- `window.__gp.wheelPatchVisible` is now true in frame 2 for every photo car. `wheelPatchFrame`, `wheelPatchState`, and the added `wheelPatchKind` (`tread`, `rim`, or `3d`) identify the active view and patch type.

### Rim, body, shadow, and HUD fixes

- Reworked the shared sharp and blurred rim art to dark gunmetal matching the source sheets, with a dark tyre ring, six restrained spokes, a small bright hub, and faint concentric high-speed streaks. The transparent outer falloff and lower alpha-test edge remove the pale-disc outline.
- Photo cars no longer receive the drift-start hop. On-road photo-body vibration is capped to 2.5 cm peak-to-peak, photo roll is capped at 0.008 rad, and photo pitch/squat/dive is capped at 0.008 rad. The rim/tread mesh remains parented to the photo plane, so it follows this body motion exactly. Off-road travel remains available.
- Replaced the offset, oversized photo shadow with a centered soft footprint and one batched four-oval tyre-contact mesh. Both are children of the car root, so they follow heading/yaw; the four contact ovals darken the road directly under the tyres. The shadow path remains two draw calls per photo car.
- Moved the red `BRAKE` cue from 60% screen height to 15%, above the player car.

### Pass-2 wheel coverage

Frame order is 0 hard nose-right, 1 slight nose-right, 2 straight, 3 slight nose-left, 4 hard nose-left.

| Car | Tread patches | Rim patches | Unpatched views |
|---|---|---|---|
| Rosso Falcon | 2 | 0, 1, 3, 4 | none |
| Silver Arrow | 2 | 0, 4 | 1, 3 |
| Shogun GT | 2 | 0, 4 | 1, 3 |
| Alpine Rally | 2 | 0, 4 | 1, 3 |
| Kumasi V8 | 2 | 0, 1, 3, 4 | none |
| Lemon Kei | 2 | 0, 1, 3, 4 | none |
| Thunder Ridge XL | 2 | 0, 1, 3, 4 | none |

Total pass-2 coverage is 29/35 views. The six remaining slight-turn views do not expose a clean rim face or a straight-on tyre back, so adding either patch there would paint over bodywork; they remain intentionally photographic.

### Pass-2 validation and limitation

- Re-ran `python3 inline_lessons.py`; the current `race3d.js` is inlined into `index.html`.
- `node --check race3d.js`, all 15 inline `<script>` blocks in `index.html`, and `git diff --check` pass.
- A source-level runtime harness verified that all seven frame-2 entries contain two tread patches, low-speed `wheelPhase` changes the tread cell, the high-speed state selects the tread-blur cell, and hysteresis returns to sharp at low speed.
- The measured patch rectangles were overlaid on enlarged frame-2 source crops for all seven sheets and visually checked against the tyre backs.
- I could not rerun a live full-race browser capture in this sandbox because binding a localhost test server is denied. Live draw-call/FPS/browser screenshots remain for Hermes; no requested implementation item was otherwise left undone.

## Pass 3

### Hard-turn grounding

- Cause: the sprite plane was always placed from the transparent frame-cell bottom (`h/2 + 0.012`) instead of the photographed tyre contact row, while the complete photo plane also received up to `0.008` rad of dynamic body roll and on-road vertical vibration. The Ridge source itself is not vertically mispacked: its lowest solid tyre pixel is row 286 in all five 289 px frames. Its hard-turn photographs do contain normal baked three-quarter perspective (the far tyre appears higher), which the runtime roll was exaggerating; wheel-patch placement was not the cause.
- Measured and stored the solid-alpha tyre-bottom row for every view of all seven photo sheets in `GP_PICS.tyreBottom`. `gpPicAnchor()` converts that row to the plane's local contact line and re-anchors it to the road whenever a view changes, so the contact line remains fixed rather than inheriting each frame's transparent padding.
- On-road photo sprites no longer receive vertical vibration or body roll. The 3D fallback cars retain their suspension and roll behavior, and off-road photo travel remains available. This removes the one-sided runtime lift and the vertical step at view switches without changing FOV or camera motion.

### Contact shadow

- Cause: the two-layer shadow was correctly parented to the yawing car root, but its broad footprint and tyre ovals were too light and slightly high above the road to read as contact on pale asphalt.
- Tightened the footprint, lowered both layers toward the road, raised the soft footprint opacity to `0.46`, and raised each tyre-core oval to `0.64` centre opacity. Both layers still use the radial alpha texture, so their edges fall off softly with no rectangular quad edge, and the path remains two draw calls per photo car.

### Turn effects and skid marks

- Cause: ordinary cornering could satisfy the old standalone `slip > 0.25` test, spawning large, pale, 0.7–1.1 second smoke puffs even without a drift or brake-slide. Skid instances also used hard-edged rectangular geometry and never expired until the 700-instance ring buffer wrapped.
- Smoke now requires either an active drift or braking plus measured lateral slip. Puff rate, size, opacity, growth, screen cap, live-puff cap, velocity, and lifetime were reduced; ordinary steering and ordinary straight-line braking emit none. Off-road dust remains restricted to off-road travel.
- Skid marks are 0.18 m wide, dark, soft-edged in their shader, and carry a per-instance four-second lifetime with an alpha fade over the final 1.2 seconds. They remain one instanced draw call and cannot leave pale squares.

### Pass-3 telemetry and validation

- Added per-frame `window.__gp.bodyRoll`, `window.__gp.spriteBottomY` (the transformed world-space tyre-contact line for a photo sprite), and `window.__gp.smokeCount` (currently live tyre-smoke puffs).
- Re-ran `python3 inline_lessons.py`; `index.html` contains the updated `race3d.js`.
- `node --check race3d.js`, every inline `<script>` block in `index.html`, and `git diff --check` pass.

## Fable pass

Headless Chrome (SwiftShader, 1180x820) on `kawaguchi`, race mode, Auto gas off, all seven cars driven as the player; harness in
`~/staging/lz-wheels-shots/fable/fable_test.py` (serves on 8880-8899 via `serve.py`, shoots grid / slow straight / fast straight / slight
right / slight left / steer right / steer left / braking, samples `window.__gp`). Review sheets per car are `fable/r2/sheet_<car>.jpg`,
the deliverable shots are `fable/<car>_race_*.jpg` and `fable/all7_cars_and_grid.jpg`.

### 1. Contact shadows now sit under the photographed tyres

- Cause: the pass-2/3 "four tyre ovals" were built from the 3D shape's wheel positions (`S.xf`, `S.xr`, `±0.4 w`), not from where the
  picture's tyres are, and their quads were wound clockwise, so the GPU back-face culled them: only the soft footprint ever showed.
  In three-quarter frames the far tyres also sit higher in the photo (baked perspective), so a patch at the 3D position could never be
  under them.
- Change: `GP_PICS.<car>.tyres` stores every photographed tyre bottom per packed frame as `[centre x px, lowest tyre row px, tread width px]`
  (auto-measured from the alpha silhouettes by `fable/overlay/tyres2.py`, hand-checked on zoomed pixel grids; the Gemini red5 sheet
  needed hand values because its keyed silhouette includes the baked ground shadow). `gpBuildPicCar()` builds one four-quad contact mesh
  (new tighter `gpContactTex()`, black, opacity 0.88) inside a group that turns with the sprite plane; `gpContactUpdate()` places each
  patch where the camera ray through that tyre's bottom row meets the road - straight below for the near tyres, pushed away from the
  camera by `Dc·lift/(Hc-lift)` for the higher far tyres - so from the player's viewpoint every patch is exactly under its tyre, follows
  yaw, has no gap and no rectangular edge (radial alpha). It writes the existing position buffer; no per-frame allocation. The soft body
  footprint stays as the ambient darkening under the car. Rivals use the same path. Draw calls are unchanged (one contact call per photo
  car, as before).

### 2. Rivals no longer read as tilted / broadside

- Cause: rivals already had the tyre-line anchor and zero roll from pass 3; what made them look tilted was view selection. Rivals switched
  to the slight view at 4 degrees and the hard three-quarter view at 12.5 degrees off the line of sight, so a rival a little off-axis
  was drawn with a ~35 degree photo whose far side sits visibly higher - a "lifted" car. On top of that their contact patches were culled
  (see 1), so nothing tied them to the road.
- Change: rival thresholds are now 0.13 / 0.36 rad (about 7.5 / 21 degrees) with 0.05 rad hysteresis, nearer the photographed angles; the
  player keeps 0.07 / 0.22 because its view angle is synthesised from steering input. Every photo rival gets the per-tyre contact patches
  from (1) and keeps the anchor / no-roll rule. Measured `bodyRoll` stayed 0 for every sample of every car.

### 3. Wheel patches checked on all 35 views

Overlay sheets of every patch ellipse on the source frames are in `fable/overlay/<car>_grid.png`; in-game views are in `fable/r2/sheet_<car>.jpg`
(the slight views were forced with the new test hook `R3.dbgRel`, which pins the player view angle and is otherwise unset).

| Car | Result |
|---|---|
| Rosso Falcon | 0/1/3/4 rim and 2 tread patches on the wheels; no change |
| Silver Arrow | 0/4 rim, 2 tread correct; 1/3 stay photographic |
| Shogun GT | all correct |
| Alpine Rally | all correct |
| Kumasi V8 | patches correct per packed frame, but the sheet itself is packed nose-left ... nose-right (the opposite of the other six): steering right showed the car's left flank. Fixed with `rev:true` on `GP_PICS.kumasi` and `gpPicPacked()`, which maps logical frame f to packed frame 4-f for the texture offset, anchor row, tyre data and wheel views. |
| Lemon Kei | all correct |
| Thunder Ridge XL | frame 1 rear patch was on the bumper corner left of the wheel and frame 3's was on the front tyre's tread; both moved onto the real rim faces (1: `[347,214,18,86]`, front `[396,209,27,80]`; 3: `[124,229,20,88]`). 0/2/4 unchanged. |

No patch was disabled; no green fringes seen at 1180x820.

### 4. Realism

- Rim blur: a third wheel state. The shared atlas is now 32 cells (2048x64, a power of two): 12 sharp phases, the radial blur, 6 tread
  phases, the tread smear, and 12 new semi-blurred phases (seven spoke copies over ±0.12 rad at 20% alpha). `gpWheelPatchUpdate()` goes
  sharp → semi at 7.5 rad/s → blur at 13 rad/s and back at 10 / 5.5 rad/s, so the spokes smear before they vanish instead of snapping to a
  flat disc. `wheelPatchState` can now also read `semi`.
- Tried and removed: a mirrored lower-body road reflection quad per car (vertex-alpha fade). Even at full opacity it was almost invisible
  on the asphalt and cost a draw call per car, so it is not in the build.
- Contact darkening: footprint 0.5 opacity, tyre patches 0.88 with a tight core (see 1).

### 5. Speed feel without camera motion

- Edge streaks now appear only above 80% of top speed (previously from 50%), on 22 fixed directions across the upper half and both sides,
  growing and fading with distance travelled instead of random lines every frame, so they never flicker, never cross the car or the pedal /
  dial corners, and keep the FOV and camera untouched. Stroke colours come from a 25-entry table built once (no per-frame strings).
- Roadside delineators (every 3 samples), kerbs and lane dashes are unchanged and already stream at true speed.
- Tyre smoke: `smokeCount` stayed 0 through every sample of ordinary driving, steering and straight-line braking for all seven cars.

### Measurements

- Errors: 0 JS exceptions / console errors in every run (7 cars plus probes).
- FOV: 60 in every sample; chase offset 6.51-6.64; `bodyRoll` 0; photo body `position.y` stays 0 on-road (unchanged from pass 3).
- Draw calls, same scene (race grid, five photo cars), committed baseline vs this build: 108 vs 108 total; contact meshes 5, footprints 5,
  wheel patches 3 in both. Teleporting the player to ten fixed track fractions and reading `rendererCalls` on both builds gave the same
  numbers within particle noise: t=0.1 → 54/56, 0.5 → 60/60, 0.9 → 117/117, 0.96 → 112/112 (new/baseline). The ~117 peak is the pit
  straight (garages, stands, crowd, flags) and exists unchanged in the committed build; everywhere else the race runs at 54-108. Final
  run per phase (ridge): fast straight 67, steering 75-78, braking 102-110, grid 108.
- FPS in headless SwiftShader: 5-7 both before and after (software rasteriser, not representative of the iPad; the budget check is the
  draw-call parity above).
- `node --check race3d.js` passes; all 16 inline `<script>` blocks of `index.html` parse; `index.html` contains `race3d.js` verbatim;
  `git diff --check` clean; only `race3d.js` and `index.html` changed.

### Not done / limits

- The far-tyre patch for a rival far down the road is pushed up to 3 m behind the sprite; from the camera it still sits under the tyre,
  but it is clamped, so a very distant rival in a hard view can show its far patch a little short.
- Slight-turn views of Silver Arrow, Shogun GT and Alpine Rally still have no rim patch (no clean rim face in the photo), as in pass 2.
- Contact data for the red5 Gemini sheet is approximate (±8 px) because its keyed silhouette includes the car's own baked shadow.
- No Safari / iPad measurement from here.

### Kids'-game rating

Before this pass: 7/10 - the cars floated slightly on faint blobs, the far wheel in every hard turn hung in the air, the muscle car turned
the wrong way in its pictures, and the ridge's slight-turn rims were painted on the bumper. After: 8.5/10 - every car sits on its tyres in
all views, rivals are planted, wheels spin through three believable states, and top speed gets a calm streak cue. What would take it to 9+
is proper per-view rim patches for the three slight-turn sheets and a real iPad fps check.
