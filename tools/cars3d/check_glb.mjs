// check_glb.mjs <orig_dir> <packed_dir>: every packed car must keep the same node names, material names, triangle count and
// per-named-node bounding box (2 mm) as the original, and carry COLOR_0 on every primitive. Prints a size table; exit 1 on any failure.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import fs from 'fs';
const [O, D] = process.argv.slice(2);
await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
const info = async f => {
  const doc = await io.read(f), r = doc.getRoot(), nodes = {}, mats = r.listMaterials().map(m => m.getName()).sort();
  let tris = 0, noCol = 0;
  for (const n of r.listNodes()) {
    const m = n.getMesh(); let bb = null;
    if (m) for (const p of m.listPrimitives()) {
      const a = p.getAttribute('POSITION'), idx = p.getIndices(); tris += (idx ? idx.getCount() : a.getCount()) / 3; if (!p.getAttribute('COLOR_0')) noCol++;
      const mw = n.getWorldMatrix(), e = [];
      for (let i = 0; i < a.getCount(); i++) { const v = a.getElement(i, e), x = mw[0] * v[0] + mw[4] * v[1] + mw[8] * v[2] + mw[12], y = mw[1] * v[0] + mw[5] * v[1] + mw[9] * v[2] + mw[13], z = mw[2] * v[0] + mw[6] * v[1] + mw[10] * v[2] + mw[14];
        bb = bb || [x, y, z, x, y, z]; bb[0] = Math.min(bb[0], x); bb[1] = Math.min(bb[1], y); bb[2] = Math.min(bb[2], z); bb[3] = Math.max(bb[3], x); bb[4] = Math.max(bb[4], y); bb[5] = Math.max(bb[5], z); }
    }
    nodes[n.getName()] = { bb, t: n.getTranslation() };
  }
  return { nodes, mats, tris, noCol, size: fs.statSync(f).size };
};
let bad = 0, t0 = 0, t1 = 0; const rows = [];
for (const f of fs.readdirSync(O).filter(x => x.endsWith('.glb')).sort()) {
  const a = await info(`${O}/${f}`), b = await info(`${D}/${f}`), err = [];
  if (Object.keys(a.nodes).sort().join() !== Object.keys(b.nodes).sort().join()) err.push('node names differ');
  if (a.mats.join() !== b.mats.join()) err.push('material names differ');
  if (a.tris !== b.tris) err.push(`tris ${a.tris} -> ${b.tris}`);
  if (b.noCol) err.push(`${b.noCol} primitives without COLOR_0`);
  for (const k in a.nodes) { const p = a.nodes[k], q = b.nodes[k]; if (!q) continue;
    if (p.t.some((v, i) => Math.abs(v - q.t[i]) > 1e-4)) err.push(`${k} moved`);
    if (p.bb && (!q.bb || p.bb.some((v, i) => Math.abs(v - q.bb[i]) > 0.002))) err.push(`${k} bbox changed`); }
  t0 += a.size; t1 += b.size; if (err.length) bad++;
  rows.push(`${f.padEnd(12)} ${String(Math.round(a.size / 1024)).padStart(5)} KB -> ${String(Math.round(b.size / 1024)).padStart(5)} KB  ${String(a.tris).padStart(6)} tris  ${err.length ? 'FAIL ' + err.join('; ') : 'ok'}`);
}
console.log(rows.join('\n')); console.log(`TOTAL ${Math.round(t0 / 1024)} KB -> ${Math.round(t1 / 1024)} KB, ${bad} failing`);
process.exit(bad ? 1 : 0);
