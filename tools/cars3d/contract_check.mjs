// contract_check.mjs <old_unpacked_dir> <new_unpacked_dir> [ids...]: a REBUILT car model may change its looks, never what the game drives.
// Fails (exit 1) for a car when:
//  - a contract node (root, body, hub_*, wheel_*, caliper_*) is missing or moved > 2 mm;
//  - an old material name is gone, or a new one appears that is not in NEW_OK;
//  - a wheel node's radius (y/z half extent) or width (x extent) differs > 3 mm (the game's rad / twF / twR describe the tyre);
//  - the whole-car bounding box (len, width, height) differs > 10 mm, or the body's lowest point (ride) moves > 5 mm;
//  - triangles > 34,000 or material count > old + 2.
// Run from a folder that has @gltf-transform/* + meshoptimizer in node_modules (see pack_all.sh).
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import fs from 'fs';
const [O, D, ...want] = process.argv.slice(2);
const NEW_OK = new Set(['lens', 'taillens', 'chrome', 'interior']);
await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
const grow = (bb, x, y, z) => { if (!bb) return [x, y, z, x, y, z]; bb[0] = Math.min(bb[0], x); bb[1] = Math.min(bb[1], y); bb[2] = Math.min(bb[2], z); bb[3] = Math.max(bb[3], x); bb[4] = Math.max(bb[4], y); bb[5] = Math.max(bb[5], z); return bb; };
const info = async f => {
  const doc = await io.read(f), r = doc.getRoot(), nodes = {}, mats = r.listMaterials().map(m => m.getName());
  let tris = 0, all = null;
  for (const n of r.listNodes()) {
    const m = n.getMesh(); let bb = null, lb = null;
    if (m) for (const p of m.listPrimitives()) {
      const a = p.getAttribute('POSITION'), idx = p.getIndices(); tris += (idx ? idx.getCount() : a.getCount()) / 3;
      const mw = n.getWorldMatrix(), e = [];
      for (let i = 0; i < a.getCount(); i++) { const v = a.getElement(i, e);
        lb = grow(lb, v[0], v[1], v[2]);
        bb = grow(bb, mw[0] * v[0] + mw[4] * v[1] + mw[8] * v[2] + mw[12], mw[1] * v[0] + mw[5] * v[1] + mw[9] * v[2] + mw[13], mw[2] * v[0] + mw[6] * v[1] + mw[10] * v[2] + mw[14]); }
    }
    if (bb) all = grow(grow(all, bb[0], bb[1], bb[2]), bb[3], bb[4], bb[5]);
    nodes[n.getName()] = { bb, lb, t: n.getWorldMatrix().slice(12, 15) };
  }
  return { nodes, mats, tris, all };
};
const CONTRACT = /^(body|hub_(FL|FR|RL|RR)|wheel_(FL|FR|RL|RR)|caliper_(FL|FR|RL|RR))$/;
let bad = 0; const rows = [];
const files = fs.readdirSync(D).filter(x => x.endsWith('.glb') && fs.existsSync(`${O}/${x}`) && (!want.length || want.includes(x.slice(0, -4)))).sort();
for (const f of files) {
  const a = await info(`${O}/${f}`), b = await info(`${D}/${f}`), err = [], id = f.slice(0, -4);
  if (!b.nodes[id]) err.push('root node missing');
  for (const k in a.nodes) { if (!CONTRACT.test(k)) continue; const p = a.nodes[k], q = b.nodes[k];
    if (!q) { err.push(`${k} missing`); continue; }
    const mv = Math.max(...p.t.map((v, i) => Math.abs(v - q.t[i]))); if (mv > 0.002) err.push(`${k} moved ${(mv * 1000).toFixed(1)} mm`);
    if (/^wheel_/.test(k) && p.lb && q.lb) {
      const rad = l => Math.max(l[4] - l[1], l[5] - l[2]) / 2, wid = l => l[3] - l[0];
      const dr = Math.abs(rad(p.lb) - rad(q.lb)), dw = Math.abs(wid(p.lb) - wid(q.lb));
      if (dr > 0.003) err.push(`${k} radius ${(dr * 1000).toFixed(1)} mm`); if (dw > 0.003) err.push(`${k} width ${(dw * 1000).toFixed(1)} mm`); } }
  for (const m of a.mats) if (!b.mats.includes(m)) err.push(`material ${m} gone`);
  for (const m of b.mats) if (!a.mats.includes(m) && !NEW_OK.has(m)) err.push(`new material ${m} not allowed`);
  const dims = x => [x[3] - x[0], x[4] - x[1], x[5] - x[2]], da = dims(a.all), db = dims(b.all);
  ['width', 'height', 'len'].forEach((nm, i) => { const d = Math.abs(da[i] - db[i]); if (d > 0.010) err.push(`${nm} ${(d * 1000).toFixed(1)} mm`); });
  if (a.nodes.body && b.nodes.body && a.nodes.body.bb && b.nodes.body.bb) { const d = Math.abs(a.nodes.body.bb[1] - b.nodes.body.bb[1]); if (d > 0.005) err.push(`body ride ${(d * 1000).toFixed(1)} mm`); }
  if (b.tris > 34000) err.push(`tris ${b.tris} > 34000`);
  if (b.mats.length > a.mats.length + 2) err.push(`materials ${a.mats.length} -> ${b.mats.length}`);
  if (err.length) bad++;
  rows.push(`${id.padEnd(9)} tris ${String(a.tris).padStart(6)} -> ${String(b.tris).padStart(6)}  mats ${a.mats.length} -> ${b.mats.length}  bbox ${db.map(v => v.toFixed(3)).join('x')}  ${err.length ? 'FAIL ' + err.join('; ') : 'ok'}`);
}
console.log(rows.join('\n')); console.log(`${files.length} checked, ${bad} failing`);
process.exit(bad ? 1 : 0);
