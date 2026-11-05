#!/usr/bin/env bash
# Copy the racer from the Learning Zone (the ONE source of truth) into the standalone Grand Fable GP app.
#   tools/build_standalone.sh [DEST]      default DEST: ../grand-fable-gp-app (next to this repo)
# Copies race3d.js + every asset it loads (3D cars, world textures, track pictures, videos, car sheets, the GLTF loader),
# then stamps the app's service-worker cache name with this repo's commit so phones pick up the new build.
# It never copies index.html / lessons / the Learning Zone service worker: the app keeps its own shell (index.html,
# app-shim.js, sw.js, manifest, icons), which this script does not touch.
set -euo pipefail
SRC="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${1:-$SRC/../grand-fable-gp-app}"
DEST="$(cd "$DEST" && pwd)"
[ -f "$DEST/app-shim.js" ] || { echo "no app shell in $DEST (app-shim.js missing)"; exit 1; }
node --check "$SRC/race3d.js"
mkdir -p "$DEST/assets"
cp "$SRC/race3d.js" "$DEST/race3d.js"
for d in cars3d world tracks video cars vendor; do
  rsync -a --delete --exclude '.DS_Store' "$SRC/assets/$d/" "$DEST/assets/$d/"
done
cp "$SRC/assets/intro_race.mp4" "$DEST/assets/intro_race.mp4"
REV="$(git -C "$SRC" rev-parse --short HEAD 2>/dev/null || echo nogit)$(git -C "$SRC" diff --quiet -- race3d.js assets 2>/dev/null || echo -dirty)"
STAMP="$REV-$(date +%Y%m%d%H%M)"
sed -i '' -E "s/^const VERSION = \"[^\"]*\";/const VERSION = \"$STAMP\";/" "$DEST/sw.js" 2>/dev/null || sed -i -E "s/^const VERSION = \"[^\"]*\";/const VERSION = \"$STAMP\";/" "$DEST/sw.js"
printf 'built from Learning Zone %s on %s\n' "$REV" "$(date '+%Y-%m-%d %H:%M')" > "$DEST/BUILD.txt"
# guard: the app must never use the Learning Zone's storage keys
if grep -n "plz_v1\|plz_guard" "$DEST/index.html" "$DEST/app-shim.js" "$DEST/sw.js" "$DEST/race3d.js"; then echo "ERROR: Learning Zone storage key found in the app"; exit 1; fi
echo "standalone built: $DEST ($STAMP), $(du -sh "$DEST" | cut -f1)"
