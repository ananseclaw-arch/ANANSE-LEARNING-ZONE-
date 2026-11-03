/* Regression tests for Prince's staging-only sequential Reveal Unit 4 path.
   Run with: node test_unit4_sequential.js */
"use strict";

const assert=require("assert");
const fs=require("fs");
const vm=require("vm");

const revealSource=fs.readFileSync("reveal.js","utf8");
const workbookSource=fs.readFileSync("workbook.js","utf8");
const indexSource=fs.readFileSync("index.html","utf8");

const progressionContext={console,Math,JSON,Set,Map,Number,String,Array,Object,RegExp,Date};
vm.createContext(progressionContext);
vm.runInContext(revealSource,progressionContext);
const progression=progressionContext.__revealProgression;
assert(progression,"progression test API is exposed");
assert.deepStrictEqual(Array.from(progression.unit4Ids),["4-1","4-2","4-3","4-4","4-5","4-6"]);

const rec=(best,total)=>({best,total,tries:1,date:"2026-11-03"});
const prince=extra=>Object.assign({id:"prince",name:"Prince",reveal:{},sessions:[]},extra||{});

// A saved Unit 2 class pointer and real Unit 2 scores must neither redirect nor be changed.
const legacy=prince({revealCurrent:"2-7",reveal:{"2-1":rec(8,8),"2-7":rec(6,8)},sessions:[{lesson:"reveal:2-7",correct:6,total:8}]});
const legacyBefore=JSON.stringify(legacy);
assert.strictEqual(progression.nextId(legacy),"4-1");
assert.strictEqual(progression.gate(legacy,"2-8").allowed,true);
assert.strictEqual(JSON.stringify(legacy),legacyBefore,"reading progression must not rewrite legacy data");

// No progress and a failed attempt stay on 4-1; every later Unit 4 entry is gated.
const fresh=prince();
assert.strictEqual(progression.nextId(fresh),"4-1");
assert.strictEqual(progression.gate(fresh,"4-1").allowed,true);
assert.strictEqual(progression.gate(fresh,"4-2").prerequisite,"4-1");
assert.strictEqual(progression.gate(fresh,"4-6").prerequisite,"4-1");
const failed=prince({reveal:{"4-1":rec(7,10)}});
assert.strictEqual(progression.recordPassed(failed.reveal["4-1"]),false);
assert.strictEqual(progression.nextId(failed),"4-1");
assert.strictEqual(progression.gate(failed,"4-2").allowed,false);

// Current 10-question completion passes at 8/10; the next lesson opens, but not lessons beyond it.
const passed=prince({reveal:{"4-1":rec(8,10)}});
assert.strictEqual(progression.recordPassed(passed.reveal["4-1"]),true);
assert.strictEqual(progression.nextId(passed),"4-2");
assert.strictEqual(progression.gate(passed,"4-2").allowed,true);
assert.strictEqual(progression.gate(passed,"4-3").prerequisite,"4-2");

// The engine's actual historical pass was 6/8. Existing records and session-only records count.
const oldRecord=prince({reveal:{"4-1":rec(6,8)}});
assert.strictEqual(progression.recordPassed(oldRecord.reveal["4-1"]),true);
assert.strictEqual(progression.gate(oldRecord,"4-2").allowed,true);
const oldSession=prince({sessions:[{lesson:"reveal:4-1",correct:6,total:8}]});
assert.strictEqual(progression.profilePassed(oldSession,"4-1"),true);
assert.strictEqual(progression.nextId(oldSession),"4-2");

// Out-of-order historical Unit 4 records remain intact but cannot create a hole in the sequence.
const hole=prince({reveal:{"4-1":rec(8,10),"4-2":rec(7,10),"4-3":rec(10,10)}});
const holeBefore=JSON.stringify(hole);
assert.strictEqual(progression.nextId(hole),"4-2");
assert.strictEqual(progression.gate(hole,"4-3").prerequisite,"4-2");
assert.strictEqual(progression.gate(hole,"4-4").prerequisite,"4-2");
assert.strictEqual(JSON.stringify(hole),holeBefore);

// The staging rule is Prince-only and never blocks older units.
assert.strictEqual(progression.gate(prince(),"3-7").allowed,true);
assert.strictEqual(progression.gate(prince(),"2-1").allowed,true);
assert.strictEqual(progression.gate({name:"Ama",reveal:{}},"4-6").allowed,true);

// Exercise the actual workbook snapshot/restore path used by Unit 4 lessons 4-1 through 4-5.
const documentStub={
  getElementById(){return null;},
  createElement(){return{};},
  head:{appendChild(){}},
  querySelectorAll(){return[];}
};
let saves=0;
const reloadContext={
  console,Math,JSON,Set,Map,Number,String,Array,Object,RegExp,Date,
  window:{},document:documentStub,app:{innerHTML:""},P:prince(),DB:{resume:{}},
  esc:s=>String(s),say(){},sfx(){},save(){saves++;},syncProgress(){},toast(){},
  setTimeout(fn){return 1;},clearTimeout(){},confetti(){}
};
vm.createContext(reloadContext);
vm.runInContext(revealSource,reloadContext);
vm.runInContext(workbookSource,reloadContext);
const run=code=>vm.runInContext(code,reloadContext);
run("wbStart('4-1',{reveal:true,size:10})");
run("WB.results=[true,false];WB.index=2;wbLoadProblem(WB.problems[2],false)");
const field=run("Object.keys(WB.fields)[0]");
assert(field,"generated Unit 4 problem has a resumable answer field");
run("WB.fields["+JSON.stringify(field)+"]='77';WB.drew=true;WB.strokes=3;WB.canvasData='data:image/jpeg;base64,resume';wbResumeSave()");
const saved=JSON.parse(JSON.stringify(reloadContext.DB.resume.prince.wb));
const signature=JSON.stringify(saved.cur);
assert.strictEqual(saved.index,2);
assert.deepStrictEqual(Array.from(saved.results),[true,false]);
assert.strictEqual(saved.fields[field],"77");
assert.strictEqual(saved.canvasData,"data:image/jpeg;base64,resume");
assert.strictEqual("canvas" in saved,false);
assert.strictEqual("ctx" in saved,false);
run("WB=null");
assert.strictEqual(run("wbResumeRestore("+JSON.stringify(saved)+")"),true);
assert.strictEqual(run("WB.index"),2);
assert.deepStrictEqual(Array.from(run("WB.results")),[true,false]);
assert.strictEqual(run("WB.fields["+JSON.stringify(field)+"]"),"77");
assert.strictEqual(run("JSON.stringify(WB.cur)"),signature);
assert(saves>0,"in-progress state was persisted");

// Static guard checks cover direct lesson, direct start, workbook start, and reload entry paths.
assert(/function renderRevealLesson\(id\)[\s\S]{0,220}revealUnit4Gate\(P,id\)/.test(revealSource));
assert(/function startReveal\(id\)[\s\S]{0,180}revealUnit4Gate\(P,id\)/.test(revealSource));
assert(/function wbStart\(id,opts\)[\s\S]{0,220}revealUnit4Gate\(P,id\)/.test(workbookSource));
assert(/function sessTryResume\(\)[\s\S]{0,360}savedResumeAllowed\(r\)/.test(indexSource));

console.log("Unit 4 sequential progression: legacy, fresh, failed, passed, gates, reload resume, and old-unit access passed.");
