// pack_glb.mjs <in.glb> <bake.json|-> <out.glb>   (job 1112-0016-43fd)
// Writes the Blender-baked vertex light (tools/cars3d/bake_light.py) into the ORIGINAL car GLB as COLOR_0, then compresses it for the
// offline PWA: meshopt (EXT_meshopt_compression, decoder = assets/vendor/meshopt_decoder.js, ~29 KB) + KHR_mesh_quantization on
// normals / texcoords / colours only. Positions stay float on purpose: three r128 reads raw (not de-normalised) values on the CPU, and the
// game ray-casts the car bodies to place name plates and roof numbers - quantised positions would put them in the wrong place.
// No node, material, extension or texture is renamed or re-encoded. Needs @gltf-transform/{core,extensions,functions} + meshoptimizer
// (install outside the repo; ES modules ignore NODE_PATH, so tools/cars3d/pack_all.sh copies this file next to that node_modules and runs it there).
import { NodeIO, PropertyType } from '@gltf-transform/core';
import { ALL_EXTENSIONS, EXTMeshoptCompression } from '@gltf-transform/extensions';
import { reorder, quantize, prune, dedup } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer';
import fs from 'fs';

const [inp, bakeP, out] = process.argv.slice(2);
await MeshoptEncoder.ready; await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder });
const doc = await io.read(inp);
const bake = bakeP && bakeP !== '-' ? JSON.parse(fs.readFileSync(bakeP, 'utf8')) : null;
let colored = 0;
if (bake) {
  const seen = new Set();
  for (const node of doc.getRoot().listNodes()) {
    const mesh = node.getMesh(); if (!mesh) continue;
    const b = bake.nodes[node.getName()]; if (!b) { console.error('NO BAKE for node', node.getName()); process.exit(2); }
    if (seen.has(mesh)) continue; seen.add(mesh);   // a mesh shared by several nodes is coloured once (first node's bake)
    const prims = mesh.listPrimitives(); const total = prims.reduce((n, p) => n + p.getAttribute('POSITION').getCount(), 0);
    if (total !== b.n) { console.error('VERTEX COUNT MISMATCH', node.getName(), total, b.n); process.exit(3); }
    // vertex order probe: Blender's vertex i must be glTF vertex i
    const at = i => { let k = i; for (const p of prims) { const a = p.getAttribute('POSITION'); if (k < a.getCount()) return a.getElement(k, []); k -= a.getCount(); } };
    for (const [i, x, y, z] of b.pk) { const q = at(i); if (Math.abs(q[0] - x) + Math.abs(q[1] - y) + Math.abs(q[2] - z) > 3e-3) { console.error('VERTEX ORDER MISMATCH', node.getName(), i, q, [x, y, z]); process.exit(4); } }
    let off = 0;
    for (const p of prims) {
      const n = p.getAttribute('POSITION').getCount(), arr = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) { const v = b.v[off + i]; arr[i * 3] = arr[i * 3 + 1] = arr[i * 3 + 2] = v; }
      off += n;
      const acc = doc.createAccessor().setType('VEC3').setArray(arr).setBuffer(doc.getRoot().listBuffers()[0]);
      p.setAttribute('COLOR_0', acc); colored++;
    }
  }
}
await doc.transform(
  dedup({ propertyTypes: [PropertyType.ACCESSOR] }),
  prune({ keepAttributes: true, keepExtras: true, keepLeaves: true }),
  reorder({ encoder: MeshoptEncoder, target: 'size' }),
  quantize({ pattern: /^(NORMAL|TEXCOORD_\d|COLOR_\d)$/, quantizeNormal: 10, quantizeTexcoord: 12, quantizeColor: 8 }),
);
doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE });
await io.write(out, doc);
console.log(JSON.stringify({ file: out.split('/').pop(), in: fs.statSync(inp).size, out: fs.statSync(out).size, colored }));
