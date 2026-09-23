#!/usr/bin/env python3
"""Health check for the Ananse Learning Zone. Run before every deploy.

Checks: every inline script block parses; the inlined copies of lessons.js,
lab.js and reveal.js match their source files; lesson and lab data have the
shape the engine expects; every Reveal Math generator produces clean,
non-duplicate problems; no spider text; service worker lists no missing files.
Exit code 0 and "ALL CHECKS PASSED" means safe to deploy.
Requires: python3, node.
"""
import json, os, re, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
def read(n): return open(os.path.join(HERE, n), encoding="utf-8").read()
problems = []
def bad(msg): problems.append(msg); print("  ✗", msg)
def ok(msg): print("  ✓", msg)

html = read("index.html")

# 1. every inline script block parses
blocks = re.findall(r"<script(?![^>]*src=)[^>]*>(.*?)</script>", html, re.S)
with tempfile.TemporaryDirectory() as td:
    for i, sc in enumerate(blocks):
        p = os.path.join(td, f"blk{i}.js"); open(p, "w").write(sc)
        r = subprocess.run(["node", "--check", p], capture_output=True, text=True)
        if r.returncode: bad(f"script block {i} has a syntax error:\n{r.stderr[:400]}")
ok(f"{len(blocks)} script blocks parse") if not problems else None

# 2. inlined copies match sources
for fn, marker in (("lessons.js", "/* lessons.js is inlined here"), ("lab.js", "/* lab.js is inlined here"), ("reveal.js", "/* reveal.js is inlined here")):
    src = read(fn)
    start = html.find(marker)
    if start < 0: bad(f"{fn} marker missing from index.html"); continue
    a = html.index("\n", start) + 1; b = html.index("\n</script>", a)
    if html[a:b] != src: bad(f"{fn} is edited but not inlined — run: python3 inline_lessons.py")
    else: ok(f"{fn} inlined and current")

# 3. data shape + generators, evaluated with node
js = r"""
const fs=require("fs");
function rnd(n){return Math.floor(Math.random()*n)}
function pick(a){return a[rnd(a.length)]}
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
function esc(s){return String(s)}
function numOpts(ans,spread){const set=new Set([ans]);let g=0;while(set.size<4&&g++<60){let d=ans+(rnd(2)?1:-1)*(1+rnd(spread));if(d>=0&&!set.has(d))set.add(d);}while(set.size<4)set.add(ans+set.size*3+1);const opts=shuffle([...set]);return {opts:opts.map(String),a:opts.indexOf(ans)};}
const out={bad:[],lessons:0,qs:0,labs:0,reveal:0};
__SOURCES__
const ids=new Set();
for(const g in LESSONS)for(const L of LESSONS[g]){out.lessons++;
  if(ids.has(L.id))out.bad.push("duplicate lesson id "+L.id);ids.add(L.id);
  if(!L.subject||!L.title||!L.std)out.bad.push(L.id+" missing subject/title/std");
  if(L.subject==="comprehension"&&!(L.story&&L.story.text))out.bad.push(L.id+" comprehension lesson without story");
  if(L.subject!=="comprehension"&&!(L.teach&&L.teach.length>=3))out.bad.push(L.id+" needs 3 teach cards");
  for(const q of L.qs||[]){out.qs++;
    if(!q.q||!Array.isArray(q.opts)||q.opts.length<3||q.opts.length>4)out.bad.push(L.id+" bad opts: "+(q.q||"").slice(0,40));
    else if(new Set(q.opts).size!==q.opts.length)out.bad.push(L.id+" duplicate opts: "+q.q.slice(0,40));
    if(q.a!==0)out.bad.push(L.id+" a must be 0: "+q.q.slice(0,40));
    if(!q.teach||q.teach.length<2)out.bad.push(L.id+" question needs teach steps: "+q.q.slice(0,40));
    if(!q.topic)out.bad.push(L.id+" question without topic");
    else if(!LESSON_TOPIC_SUBJECT[q.topic]&&!["addition","subtraction","multiplication","division","fractions","place value","money","rounding","area","word problems","order of operations","grammar","vocabulary","context clues","inference","story structure","comprehension","figurative language","space","animals","human body","how things work","folklore","ashanti kingdom","independence","kente & adinkra"].includes(q.topic))out.bad.push(L.id+" unknown topic '"+q.topic+"' (add to LESSON_TOPIC_SUBJECT)");
  }
}
for(const l of LABS){out.labs++;if(!l.mystery||!l.goal||!(l.reflect&&l.reflect.length===2))out.bad.push("lab "+l.id+" needs mystery, goal, 2 reflect questions");for(const r of l.reflect||[])if(!r.opts||r.opts.length!==4||new Set(r.opts).size!==4)out.bad.push("lab "+l.id+" reflect opts");}
const rvIds=new Set();
for(const L of REVEAL_LESSONS){out.reveal++;if(rvIds.has(L.id))out.bad.push("duplicate reveal id "+L.id);rvIds.add(L.id);
  if(!REVEAL_REVIEW[L.id])out.bad.push("reveal "+L.id+" has no review card");
  if(!RV_GEN[L.g]){out.bad.push("reveal "+L.id+" generator '"+L.g+"' missing");continue;}
  for(let i=0;i<40;i++){let q;try{q=revealGen(L)}catch(e){out.bad.push("reveal "+L.id+" threw: "+e.message);break;}
    if(!q.q||!Array.isArray(q.opts)||q.opts.length<3)out.bad.push("reveal "+L.id+" bad opts");
    else if(new Set(q.opts).size!==q.opts.length){out.bad.push("reveal "+L.id+" duplicate opts: "+q.opts.join("|"));break;}
    if(q.a<0||q.a>=q.opts.length)out.bad.push("reveal "+L.id+" bad answer index");
    if(/undefined|NaN/.test(q.q+q.opts.join()+(q.vis||"")))out.bad.push("reveal "+L.id+" undefined/NaN in text");
    if(!q.teach||q.teach.length<3){out.bad.push("reveal "+L.id+" needs 3 teach steps");break;}
  }
}
console.log(JSON.stringify(out));
"""
sources = "\n".join(read(fn).replace('"use strict";', "", 1) for fn in ("lessons.js", "lab.js", "reveal.js"))
with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False) as f:
    f.write(js.replace("__SOURCES__", sources)); jsp = f.name
r = subprocess.run(["node", jsp], capture_output=True, text=True)
os.unlink(jsp)
if r.returncode:
    bad("content check crashed:\n" + (r.stderr or r.stdout)[:600])
else:
    res = json.loads(r.stdout.strip().splitlines()[-1])
    for m in sorted(set(res["bad"]))[:40]: bad(m)
    if not res["bad"]: ok(f"{res['lessons']} lessons / {res['qs']} questions, {res['labs']} labs, {res['reveal']} Reveal lessons × 40 generated problems all clean")

# 4. no spider text in shipped files
for fn in ("index.html", "README.md", "manifest.webmanifest"):
    t = read(fn)
    # science content may legitimately mention spiders (arachnid classification); the MASCOT must not
    hits = [m.group(0) for m in re.finditer(r"Wise Spider|Ananse the spider|🕷|🕸|ananse-3d\.png|SVG spider", t, re.I)]
    if hits: bad(f"mascot spider reference in {fn}: {hits[:3]} — the mascot is a lion")
ok("no mascot spider references") if not any("spider" in p for p in problems) else None

# 5. service worker: every listed file exists, cache version is a number
sw = read("sw.js")
m = re.search(r'const CACHE = "learning-zone-v(\d+)"', sw)
if not m: bad("sw.js CACHE version not found")
else: ok(f"service worker cache v{m.group(1)} (bump it before deploying)")
files = re.findall(r'"\./([^"]+)"', sw)
for fn in files:
    if fn and not os.path.exists(os.path.join(HERE, fn)): bad(f"sw.js lists missing file {fn}")

# 6. voice manifest sanity
try:
    vm = json.load(open(os.path.join(HERE, "voice", "manifest.json")))
    missing = [k for k, v in vm.items() if not os.path.exists(os.path.join(HERE, "voice", v))]
    if missing: bad(f"{len(missing)} voice clips listed in manifest are missing on disk")
    else: ok(f"{len(vm)} voice clips present")
except Exception as e:
    bad(f"voice manifest unreadable: {e}")

print()
if problems:
    print(f"{len(problems)} PROBLEM(S) — do not deploy"); sys.exit(1)
print("ALL CHECKS PASSED — safe to deploy (remember to bump sw.js CACHE)")
