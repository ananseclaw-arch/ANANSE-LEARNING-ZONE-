/* Progress safety test for the flexible-test pass rule.
   node test_progress_migration.js                 -> built-in sample learner (no real data in the repo)
   node test_progress_migration.js <copy.json>     -> a COPY of a real synced record (never point it at the original)
   Proves: reading/computing progress never changes the record; the one-time migration only ADDS new fields,
   leaves every old field byte-identical, is idempotent, keeps every old-rule pass passed, and 4-2 starts on just
   the missed questions (or a fresh attempt when the log can't rebuild them). */
"use strict";
const fs=require("fs"),path=require("path");
const DIR=__dirname,ARG=process.argv[2];
global.window=global;
global.document={getElementById:()=>null,createElement:()=>({}),head:{appendChild(){}},querySelector:()=>null,querySelectorAll:()=>[]};
Object.assign(global,{esc:s=>String(s),say:()=>{},save:()=>{},toast:()=>{},today:()=>"2026-11-05",questionSig:q=>String(q&&q.q),capTimestampMap:m=>m,
  rnd:n=>Math.floor(Math.random()*n),qlogClip:v=>{v=String(v==null?"":v).replace(/\s+/g," ").trim();return v.length>300?v.slice(0,297)+"...":v;}});
global.pick=a=>a[global.rnd(a.length)];global.shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=global.rnd(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;};
(0,eval)(fs.readFileSync(path.join(DIR,"reveal.js"),"utf8")+"\n"+fs.readFileSync(path.join(DIR,"workbook.js"),"utf8")+
  "\n;global.__t={revealProfilePassed,revealUnit4Gate,revealProgressInit,lztStatus,REVEAL_LESSONS};");
const T=global.__t;
let fails=0;const ok=(c,m)=>{console.log((c?"PASS ":"FAIL ")+m);if(!c)fails++;};
const NEW_FIELDS=["revealPass","passRuleV2","fixSeedV1","revealTest"];

/* The OLD rule, written out independently of the branch code: best/correct >= ceil(total*0.75) in P.reveal or any session. */
const oldRec=r=>{if(!r||typeof r!=="object")return false;const t=+r.total,s=+(r.best!=null?r.best:(r.correct!=null?r.correct:r.score));return t>0&&Number.isFinite(s)&&s>=Math.ceil(t*0.75);};
const oldPassed=(p,id)=>oldRec((p.reveal||{})[id])||(p.sessions||[]).some(s=>s&&s.lesson==="reveal:"+id&&oldRec(s));

const sample={id:"s1",name:"Prince",reveal:{"2-1":{best:8,total:8,tries:1,date:"2026-10-20"},"3-2":{best:6,total:8,tries:2,date:"2026-10-28"},
  "4-1":{best:6,total:8,tries:1,date:"2026-11-02"},"4-2":{best:7,total:10,tries:2,date:"2026-11-03"}},
  sessions:[{lesson:"reveal:2-4",correct:7,total:8,t:1},{lesson:"reveal:4-2",correct:7,total:10,t:2},{lesson:"reveal:4-2",correct:6,total:10,t:3}],qlog:[]};
const original=ARG?JSON.parse(fs.readFileSync(ARG,"utf8")):sample;
console.log("record:",ARG||"built-in sample");
const ids=new Set(T.REVEAL_LESSONS.map(l=>l.id));Object.keys(original.reveal||{}).forEach(id=>ids.add(id));
const wasPassed=[...ids].filter(id=>oldPassed(original,id));
console.log("passed under the old rule:",wasPassed.join(" "));

// 1. Reading only: every read path, every lesson -> record unchanged.
{const P=JSON.parse(JSON.stringify(original)),before=JSON.stringify(P);global.P=P;
  ids.forEach(id=>{T.revealProfilePassed(P,id);T.revealUnit4Gate(P,id);T.lztStatus(id);});
  ok(JSON.stringify(P)===before,"reading pass state / gates / status for "+ids.size+" lessons leaves the record byte-identical");
  ok(wasPassed.every(id=>T.revealProfilePassed(P,id)),"before migration: every old-rule pass reads as passed");}

// 2. Migration: additive only, old fields byte-identical, idempotent.
const P=JSON.parse(JSON.stringify(original));global.P=P;
ok(T.revealProgressInit(P)===true,"first run reports a change (so the app saves once)");
const oldKeys=Object.keys(original),newKeys=Object.keys(P).filter(k=>!(k in original));
const changedOld=oldKeys.filter(k=>JSON.stringify(original[k])!==JSON.stringify(P[k]));
ok(changedOld.length===0,"every old field byte-identical after migration (changed: "+(changedOld.join(",")||"none")+")");
ok(newKeys.every(k=>NEW_FIELDS.includes(k)),"only new fields added: "+newKeys.join(","));
ok(oldKeys.every(k=>k in P),"no old field removed");
const once=JSON.stringify(P);
ok(T.revealProgressInit(P)===false&&JSON.stringify(P)===once,"second run changes nothing (idempotent)");
ids.forEach(id=>{T.revealProfilePassed(P,id);T.revealUnit4Gate(P,id);T.lztStatus(id);});
ok(JSON.stringify(P)===once,"reads after migration also leave the record unchanged");

// 3. Old passes stay passed; nothing newly passed that wasn't.
const lost=wasPassed.filter(id=>!T.revealProfilePassed(P,id));
ok(lost.length===0,"every old-rule pass still passed after migration (lost: "+(lost.join(",")||"none")+")");
ok(wasPassed.every(id=>P.revealPass[id]&&P.revealPass[id].how==="legacy"),"each old pass recorded as a legacy pass");
const gained=[...ids].filter(id=>T.revealProfilePassed(P,id)&&!wasPassed.includes(id));
ok(gained.length===0,"no lesson became passed that was not passed before (gained: "+(gained.join(",")||"none")+")");
if(wasPassed.includes("4-1")){const g=T.revealUnit4Gate(P,"4-2");ok(g.allowed,"4-2 still open (4-1 passed)");
  const g3=T.revealUnit4Gate(P,"4-3");ok(!g3.allowed&&g3.prerequisite==="4-2","4-3 waits for 4-2");}

// 4. 4-2 starts on just the missed questions, or a fresh attempt.
const t=P.revealTest&&P.revealTest["4-2"];
const ses42=(original.sessions||[]).filter(s=>s&&s.lesson==="reveal:4-2"&&s.total&&s.t).sort((a,b)=>a.t-b.t);
if(t){const last=ses42[ses42.length-1],wrong=t.st.filter(x=>x.s==="wrong").length;
  ok(t.phase==="fix"&&wrong===last.total-last.correct,"4-2 seeded from the log: fix "+wrong+" missed of "+t.size+" (last test "+last.correct+"/"+last.total+")");
  ok(t.st.every((x,i)=>x.s==="right"?t.problems[i]===null:!!t.problems[i]),"only the missed questions come back; right ones are done");
  const st=T.lztStatus("4-2");ok(st&&st.phase==="fix"&&st.left===wrong,"4-2 status: "+JSON.stringify(st&&{phase:st.phase,left:st.left,total:st.total}));}
else{ok(!T.lztStatus("4-2")&&!T.revealProfilePassed(P,"4-2"),"4-2: log can't rebuild the misses -> fresh attempt (no fix round, not passed)");}
// fallback path is always exercised: same record with the 4-2 log removed -> fresh attempt
{const Q=JSON.parse(JSON.stringify(original));Q.qlog=(Q.qlog||[]).filter(e=>e.lesson!=="workbook:4-2");global.P=Q;T.revealProgressInit(Q);
  ok(!(Q.revealTest&&Q.revealTest["4-2"])&&!T.revealProfilePassed(Q,"4-2"),"no 4-2 log -> fresh 4-2 attempt");global.P=P;}

// 5. A record that already has new-rule passes: migration never overwrites or removes them.
{const Q=JSON.parse(JSON.stringify(original));Q.revealPass={"4-2":{how:"all",date:"2026-11-05"}};const keep=JSON.stringify(Q.revealPass["4-2"]);
  global.P=Q;T.revealProgressInit(Q);ok(JSON.stringify(Q.revealPass["4-2"])===keep&&!(Q.revealTest&&Q.revealTest["4-2"]),"existing new-rule pass kept, no fix round seeded over it");global.P=P;}

if(ARG){const out=path.join(path.dirname(path.resolve(ARG)),"migration_diff.json");
  fs.writeFileSync(out,JSON.stringify({record:ARG,oldFieldsChanged:changedOld,fieldsAdded:newKeys,oldRulePasses:wasPassed,lostPasses:lost,
    revealPass:P.revealPass,fix42:t?{phase:t.phase,dots:t.st.map(x=>x.s),seeded:t.seeded}:null},null,1));console.log("diff written:",out);}
console.log(fails?fails+" FAILED":"ALL PASS");process.exit(fails?1:0);
