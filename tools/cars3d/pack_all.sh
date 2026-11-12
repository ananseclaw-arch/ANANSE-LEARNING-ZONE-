#!/bin/bash
# pack_all.sh <orig_dir> <bake_dir> <out_dir> <node_dir>: bake light into + compress every car GLB (see pack_glb.mjs, check_glb.mjs)
# node_dir = a folder OUTSIDE the repo with: npm i @gltf-transform/core @gltf-transform/extensions @gltf-transform/functions meshoptimizer
set -e; H=$(cd "$(dirname "$0")" && pwd); O=$1; B=$2; D=$3; N=$4
cp "$H/pack_glb.mjs" "$H/check_glb.mjs" "$N/"
for f in "$O"/*.glb; do id=$(basename "$f" .glb); bj="$B/$id.json"; [ -f "$bj" ] || bj=-
  (cd "$N" && node pack_glb.mjs "$f" "$bj" "$D/$id.glb"); done
(cd "$N" && node check_glb.mjs "$O" "$D")
