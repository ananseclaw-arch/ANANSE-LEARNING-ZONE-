/* node test_wb_node.js  — maths + key-idea self-test for workbook.js (all lessons). Exits non-zero on any failure. */
"use strict";
const fs=require("fs"),vm=require("vm"),path=require("path");
const SESSIONS=Number(process.env.WB_SESSIONS||500);
const ctx={window:{},console,Math,JSON,Set,Map,Number,String,Array,Object,RegExp,Date,P:{name:"Test"},
  RV_NAMES:["Ama","Kofi","Prince","Esi","Kwame","Abena","Yaw","Adwoa","Maya","Omar"],esc:s=>String(s),say(){},save(){},
  document:{getElementById:()=>null,createElement:()=>({}),head:{appendChild(){}},querySelectorAll:()=>[]}};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname,"workbook.js"),"utf8"),ctx);
const run=c=>vm.runInContext(c,ctx);
const wb=ctx.window.__wb;
let fails=0;const seenFail=new Set();
function fail(m){fails++;if(!seenFail.has(m)){seenFail.add(m);if(seenFail.size<=40)console.log("FAIL:",m);}}
// independent evaluator (does not use workbook.js parsing)
function ev(side){side=side.replace(/×/g,"*").replace(/÷/g,"/").replace(/\s+/g,"");if(!/^[0-9+*\/]+$/.test(side))return NaN;return Function('"use strict";return ('+side+')')();}
function eqTrue(s){const parts=s.split("=");if(parts.length!==2)return false;const a=ev(parts[0]),b=ev(parts[1]);return Number.isFinite(a)&&a===b;}
const ids=Object.keys(wb.lessons);
const TEN=["3-7","4-1","4-2","4-3","4-4","4-5"];
const banned=[/Prince/,/\b9[- ]years?[- ]old\b/i,/\byears? old\b/i,/\bage[d]? 9\b/i,/\bnine[- ]year/i];
const summary={};
function wrongVariants(p){
  const out=[],ans=JSON.parse(JSON.stringify(p.answer));
  if(p.type==="fill"){out.push({value:Number(p.answer)+1});out.push({value:Number(p.answer)+10});}
  else if(p.type==="multi"){const ids=p.options.map(o=>o.id),right=p.answer;const extra=ids.find(i=>!right.includes(i));out.push({selected:right.concat([extra])});if(right.length>1)out.push({selected:right.slice(1)});else out.push({selected:ids.filter(i=>!right.includes(i)).slice(0,1)});out.push({selected:[]});}
  else if(p.type==="match"){const a=ans.map(x=>x.slice());if(a.length>1){const t=a[0][1];a[0][1]=a[1][1];a[1][1]=t;out.push({pairs:a});}}
  else if(p.type==="story"){out.push({eq:ans.eq,value:ans.value+1,remainder:ans.remainder});out.push({eq:[ans.eq[0],ans.eq[1],ans.eq[2]+1],value:ans.value,remainder:ans.remainder});if(p.eq.op==="×"&&ans.eq[0]!==ans.eq[1]&&ans.eq[0]+ans.eq[1]!==ans.eq[2])out.push({eq:[ans.eq[0],ans.eq[1],ans.eq[0]+ans.eq[1]],value:ans.value,remainder:ans.remainder});}
  else if(p.type==="form"){
    const keys=new Set((p.group&&p.group.keys)||[]);
    for(const f of p.fields){
      const c=(p.checks||[]).find(x=>x.k===f.key);const cur=ans.f[f.key];let bad;
      if(c){if(c.t==="num"||c.t==="mult"||c.t==="divides")bad=String(Number(cur)+1);else if(c.t==="word")bad="qzxwv";else if(c.t==="yn")bad=cur==="yes"?"no":"yes";else if(c.t==="reason")continue; /* reasons are never marked (option A) */}
      else if(keys.has(f.key)){if(p.group.kind==="zeroblank"&&f.key===p.group.keys[1])continue;bad=f.kind==="num"?String(Number(cur)+1):"4 + 8 = 32";}
      if(bad==null)continue;const f2=Object.assign({},ans.f);f2[f.key]=bad;out.push({f:f2});
    }
    if(p.group&&p.group.kind==="twoEq"){const f2=Object.assign({},ans.f);f2[p.group.keys[1]]=ans.f[p.group.keys[0]];out.push({f:f2});}
    if(p.group&&p.group.kind==="oneEq"){const f2=Object.assign({},ans.f);f2[p.group.keys[0]]="3 × 2 = 6";out.push({f:f2});}
  }
  return out;
}
for(const id of ids){
  const size=TEN.includes(id)?10:8;const types={},slotTypes={};let probs=0,wrongTested=0,forms=0;
  for(let s=0;s<SESSIONS;s++){
    const sess=wb.gen(id,size);
    if(sess.length!==size)fail(id+": session length "+sess.length);
    const sigs=new Set();
    sess.forEach((p,i)=>{
      probs++;types[p.type]=(types[p.type]||0)+1;
      const sg=run("wbSig")(p);if(sigs.has(sg))fail(id+": duplicate question in session: "+p.q.slice(0,60));sigs.add(sg);
      const blob=JSON.stringify(p)+p.q;banned.forEach(b=>{if(b.test(blob))fail(id+": child name/age text in "+p.q.slice(0,50));});
      if(p.instruction===p.q)fail(id+": instruction===q");
      if(!wb.check(p,p.type==="form"?p.answer:p.type==="fill"?{value:p.answer}:p.type==="multi"?{selected:p.answer}:p.type==="match"?{pairs:p.answer}:p.answer))fail(id+": canonical answer rejected ("+p.type+") "+p.q.slice(0,60));
      if(p.type==="fill"){const shown=p.parts.map(x=>x==="□"?p.answer:x).join(" ");if(!eqTrue(shown))fail(id+": fill not true: "+shown);const nums=shown.match(/\d+/g).map(Number);if(nums.some(n=>n>100))fail(id+": fill number >100: "+shown);}
      if(p.type==="multi"){let t=0,f=0;p.options.forEach(o=>{const v=eqTrue(o.text);if(v!==o.true)fail(id+": multi flag wrong for "+o.text);v?t++:f++;});if(!t||!f)fail(id+": multi lacks true/false trap: "+p.options.map(o=>o.text).join(" | "));const want=p.options.filter(o=>eqTrue(o.text)).map(o=>o.id).sort().join();if(want!==p.answer.slice().sort().join())fail(id+": multi answer key wrong");}
      if(p.type==="match"){p.pairs.forEach((x,k)=>{const want=p.answer[k][1];if(p.numbers){const eq=x.left.replace("□",want);if(!eqTrue(eq))fail(id+": match eq not true: "+eq);}else{const m=/(\d+) \+ \1/.exec(p.rights[want-1]);const v=Number(m[1]);const eq=x.left.replace("□",v);if(!eqTrue(eq))fail(id+": match related eq wrong: "+x.left+" ~ "+p.rights[want-1]);}});if(p.numbers&&new Set(p.answer.map(a=>a[1])).size!==p.answer.length)fail(id+": match answers not unique");}
      if(p.type==="story"){const [a,b,c]=p.answer.eq;if(p.eq.op==="×"&&a*b!==c)fail(id+": story product wrong");if(p.eq.op==="÷"&&p.answer.remainder==null&&c*b!==a)fail(id+": story quotient wrong");if(c>100&&p.eq.op==="×")fail(id+": story >100");if(p.eq.op==="÷"&&p.answer.remainder==null&&!Number.isInteger(a/b))fail(id+": inexact division");if(!(wb.check(p,{eq:p.answer.eq,value:p.answer.value,remainder:p.answer.remainder})))fail(id+": story canonical");}
      if(p.type==="form"){
        forms++;
        const f=p.answer.f;
        for(const fl of p.fields)if(f[fl.key]==null)fail(id+": canonical missing field "+fl.key);
        // independent re-verification of equations in canonical answers
        for(const k of Object.keys(f))if(/=/.test(f[k])&&!eqTrue(f[k].replace(/×/g,"*")))fail(id+": canonical equation false: "+f[k]);
        const kinds=(p.checks||[]).map(c=>c.t).concat(p.group?[p.group.kind]:[]).join("+");
        const wr=wrongVariants(p);wr.forEach(w=>{wrongTested++;if(wb.check(p,w))fail(id+": WRONG answer accepted "+JSON.stringify(w.f)+" for "+p.q.slice(0,60));});
        (p.checks||[]).filter(c=>c.t==="mult").forEach(c=>{const f2=Object.assign({},f);f2[c.k]=String(c.max+c.of);if(wb.check(p,{f:f2}))fail(id+": mult above range accepted");f2[c.k]=String(c.min-c.of);if(wb.check(p,{f:f2}))fail(id+": mult below range accepted");
          // every multiple in range accepted
          for(let v=c.min;v<=c.max;v+=c.of){const f3=Object.assign({},f);f3[c.k]=String(v);if(!wb.check(p,{f:f3}))fail(id+": valid could-answer rejected "+v);} });
        // yes/no derivations
        let m;
        if(id==="4-5"&&(m=/use (\d+) (socks|gloves|shoes)/.exec(p.q))){const yn=Number(m[1])%2===0?"yes":"no";if(f.a!==yn)fail("4-5 pairs yes/no wrong");}
        if(id==="4-5"&&(m=/^Is (\d+) a product of 2/.exec(p.q))){const yn=Number(m[1])%10===0?"yes":"no";if(f.a!==yn)fail("4-5 product yes/no wrong "+p.q);}
        if(id==="4-4"&&(m=/says that (\d+) × (\d) and (\d+) × (\d|\d)/.exec(p.q))){}
        if(id==="4-4"&&(m=/says that (.+?) and (.+?) have the same product/.exec(p.q))){const yn=ev(m[1])===ev(m[2])?"yes":"no";if(f.a!==yn)fail("4-4 yes/no wrong "+p.q);}
        if(id==="4-5"&&/Products of 2 are always/.test(p.q)&&f.w!=="even")fail("even");
        if(id==="4-5"&&(m=/^Write the product of (\d+) × (\d+)/.exec(p.q))){const pr=Number(m[1])*Number(m[2]);if(Number(f.p)!==pr||Number(f.d)!==pr%10)fail("4-5 ones digit wrong");}
        if(id==="4-3"&&(m=/skip count/.test(p.rows[0]||"")&&/(\d+) (sets|packs|boxes)/.exec(p.q))){if(Number(f.t)!==10*Number(m[1]))fail("4-3 pattern total wrong");}
        slotTypes[p.slot]=kinds;
      }else slotTypes[p.slot]=p.type;
    });
  }
  // negative checks on the helpers
  summary[id]={size,probs,types,forms,wrongTested,slotTypes};
}
// helper unit tests (wrong order of operations, spelling, reasons)
const T=(c,m)=>{if(!c)fail("unit: "+m);};
const wbFormCheck=run("wbFormCheck"),wbEqParse=run("wbEqParse"),wbTwoEqOK=run("wbTwoEqOK"),wbWordOK=run("wbWordOK"),wbYN=run("wbYN");
T(!wbEqParse("4 + 8 = 32").ok,"4+8=32 must be false");T(wbEqParse("4 x 8 = 32").ok,"4x8=32");T(wbEqParse("32 = 4 × 8").ok,"32=4x8");T(!wbEqParse("4 + 8").ok,"no equals");
T(wbTwoEqOK("6 + 6 = 12","2 × 6 = 12",{fixedCount:2}),"doubles ok");T(wbTwoEqOK("12 = 6 + 6","6 x 2 = 12",{fixedCount:2}),"doubles ok reversed forms");
T(!wbTwoEqOK("6 + 6 = 12","2 × 6 = 13",{fixedCount:2}),"wrong total");T(!wbTwoEqOK("6 + 6 = 12","6 + 6 = 12",{fixedCount:2}),"two additions");T(!wbTwoEqOK("2 + 2 + 2 = 6","2 × 3 = 6",{fixedCount:2}),"count must be 2");
T(wbTwoEqOK("2 + 2 + 2 = 6","3 × 2 = 6",{fixedValue:2}),"seeds ok");T(!wbTwoEqOK("3 + 3 = 6","3 × 2 = 6",{fixedValue:2}),"seeds wrong 3+3");
T(wbWordOK("Evan","even".split(" "))===false||true,"noop");T(wbWordOK("evan",["even"]),"typo evan");T(!wbWordOK("odd",["even"]),"odd not even");
// Explain = option A (Eb 2026-11-04): the reason is NEVER marked. Any reason (even junk or blank) with the right answer passes;
// a wrong answer with a great reason still fails. wbReasonOK must be gone.
T(typeof ctx.wbReasonOK==="undefined"&&vm.runInContext("typeof wbReasonOK",ctx)==="undefined","reason checker removed");
{let explains=0;for(const id of ids)for(const p of wb.gen(id,60)){if(!(p.type==="form"&&(p.checks||[]).some(c=>c.t==="reason")))continue;explains++;
  const rk=p.checks.filter(c=>c.t==="reason").map(c=>c.k);
  for(const junk of ["banana smoothie","zzzz","i dont know",""]){const f2=Object.assign({},p.answer.f);rk.forEach(k=>f2[k]=junk);if(!wb.check(p,{f:f2}))fail(id+": right answer + reason '"+junk+"' marked wrong: "+p.q.slice(0,50));}
  const nk=p.checks.find(c=>c.t!=="reason");if(nk){const f3=Object.assign({},p.answer.f);f3[nk.k]=nk.t==="yn"?(f3[nk.k]==="yes"?"no":"yes"):String(Number(f3[nk.k])+1);if(wb.check(p,{f:f3}))fail(id+": wrong answer with good reason accepted");}
  if(!p.explain)fail(id+": Explain question without a model explanation: "+p.q.slice(0,50));
  const parts=vm.runInContext("wbExplainParts",ctx)(p,Object.assign({},p.answer.f,Object.fromEntries(rk.map(k=>[k,"  Because It's EVEN!! "]))));
  if(parts.reason!=="  Because It's EVEN!! ")fail(id+": reason not kept exactly as typed");if(/\{|because/i.test(parts.answer))fail(id+": answer text wrong: "+parts.answer);}
 T(explains>20,"explain questions found ("+explains+")");}
// "Which reason is best?" (Eb 2026-11-05): every generated Explain variant has 3 distinct, short, clean reasons + a why line
{ctx.app=ctx.app||{innerHTML:""};ctx.toast=()=>{};const wbPickSet=run("wbPickSet");let n=0;const kinds=new Set();
 for(const id of ids)for(let r=0;r<6;r++)for(const p of wb.gen(id,60)){if(!(p.type==="form"&&(p.checks||[]).some(c=>c.t==="reason")))continue;n++;
  const s=wbPickSet(p);if(!s){fail(id+": Explain question without a reason set: "+p.q.slice(0,60));continue;}
  const all=[s.best].concat(s.wrong);kinds.add(id+"|"+s.best.replace(/\d+/g,"#"));
  if(new Set(all.map(x=>x.toLowerCase())).size!==3)fail(id+": reasons not distinct "+all.join(" | "));
  for(const t of all.concat([s.why])){if(!t||/undefined|NaN|null/.test(t))fail(id+": bad reason text "+t);if(/Prince/i.test(t))fail(id+": real name in reason");}
  for(const t of all)if(t.length>60)fail(id+": reason too long ("+t.length+"): "+t);
  if(/remember \d+ × 10/.test(p.q)&&!/double/.test(s.best))fail(id+": a × 5 -> a × 10 question got the wrong reason set: "+s.best);
  if(/remember \d+ × 5\?/.test(p.q)&&!/order/.test(s.best))fail(id+": 5 × a -> a × 5 question got the wrong reason set: "+s.best);}
 T(n>100,"explain variants checked ("+n+", "+kinds.size+" reason kinds)");
 // tapping a reason saves picked/pickOk/choices on the P.explains record; one try only; the answer mark is unchanged
 ctx.P.explains=[];const exs=[];for(const id of ["4-2","4-5"])for(const p of wb.gen(id,40))if(p.type==="form"&&(p.checks||[]).some(c=>c.t==="reason"))exs.push(p);
 run("wbStart")("4-5",{reveal:true});
 [true,false].forEach((wantBest,j)=>{const p=exs[j],WB=run("WB");run("wbLoadProblem")(p,false);for(const f of p.fields)WB.fields[f.key]=p.answer.f[f.key];WB.drew=true;run("wbSubmit")();
   const k=run("WB")._pick,i=k.choices.findIndex(c=>c.best===wantBest);run("wbPickTap")(i);run("wbPickTap")(k.choices.findIndex(c=>c.best!==wantBest));
   const rec=ctx.P.explains[ctx.P.explains.length-1];
   T(rec&&rec.ok===true&&rec.pickOk===wantBest&&Array.isArray(rec.choices)&&rec.choices.length===3&&rec.picked===k.choices[i].t&&rec.pickBest===k.set.best,"pick saved ("+(wantBest?"best":"wrong")+" pick, one try only, answer still right)");});}
T(wbYN("Yes it is")==="yes"&&wbYN("nope")==="no"&&wbYN("maybe")===null,"yn parse");
// no pick-the-reason (multiple choice) allowed outside lettered multi: no problem has p.options unless type multi
for(const id of ids)for(const p of wb.gen(id,40)){if(p.options&&p.type!=="multi")fail(id+": options on non-multi");if(p.type==="form"&&p.fields.length<1)fail("form without fields");}

// ---- UI flow test: render every problem, fill canonical answer, submit, finish (reveal mode hooks) ----
ctx.app={innerHTML:""};ctx.toast=()=>{};
let done=null,exited=null;ctx.window.wbRevealDone=(i,s,z)=>{done=[i,s,z];};ctx.window.wbRevealExit=i=>{exited=i;};
for(const id of ids){
  const size=TEN.includes(id)?10:8;
  run("wbStart")(id,{reveal:true,size:size});
  for(let k=0;k<size;k++){
    const WB=run("WB"),p=WB.cur;
    if(!/wb-problem/.test(ctx.app.innerHTML))fail(id+": problem not rendered");
    if(run("wbCanSubmit")())fail(id+": submit enabled before answering ("+p.type+")");
    if(p.type==="form"){for(const f of p.fields)WB.fields[f.key]=p.answer.f[f.key];if(p.fields.some(f=>f.kind==="num")&&!/inputmode="none" data-lzpad="num"/.test(ctx.app.innerHTML))fail("num input missing (in-app keypad field expected)");if(!/<input class="wb-in/.test(ctx.app.innerHTML))fail("form inputs missing");}
    else if(p.type==="fill")WB.fields.ans=String(p.answer);
    else if(p.type==="multi")WB.selected=p.answer.slice();
    else if(p.type==="who"){WB.person=(p.answer&&p.answer.person!=null)?p.answer.person:p.answer;if(p.valueAnswer!=null)WB.fields.ans=String(p.valueAnswer);}
    else if(p.type==="match"){p.answer.forEach(a=>WB.fields[a[0]]=String(a[1]));}
    else if(p.type==="picture"){p.eq.values.forEach((v,i)=>WB.fields["e"+i]=String(v));if(p.extraEq)p.answer.eq2.forEach((v,i)=>WB.fields["x"+i]=String(v));}
    else if(p.type==="story"){p.answer.eq.forEach((v,i)=>WB.fields["e"+i]=String(v));WB.fields.ans=String(p.answer.value);if(p.answer.remainder!=null)WB.fields.rem=String(p.answer.remainder);}
    else if(p.type==="pair"){WB.fields.ans=String(p.answer.product);if(p.equations){p.equations[0].forEach((v,i)=>WB.fields["e"+i]=String(v));p.equations[1].forEach((v,i)=>WB.fields["x"+i]=String(v));}if(p.people)WB.person=p.answer.compare;}
    WB.drew=true;if(p.type==="pair"){WB.pairBuild=p.models.map(m=>m.kind==="array"?{rows:m.rows,cols:m.cols}:{groupDots:Array(m.groups).fill(m.size)});}
    if(p.model&&p.model.kind==="groups"&&p.requireWork){WB.groupDots=Array(p.model.groups).fill(p.model.size);}
    if(!run("wbCanSubmit")()){fail(id+": submit disabled after filling ("+p.type+") "+p.q.slice(0,50));}
    run("wbSubmit")();
    if(!/wb-feedback/.test(ctx.app.innerHTML))fail(id+": no feedback screen");
    if(!/wb-teach|lzt-model/.test(ctx.app.innerHTML+((run("WB")._pick&&run("WB")._pick.p===p)?run("WB")._pick.tail:"")))fail(id+": explanation not shown");if(p.type==="form"&&(p.checks||[]).some(c=>c.t==="reason")){const k=run("WB")._pick;if(!/class="lzp-btn"/.test(ctx.app.innerHTML)||(ctx.app.innerHTML.match(/class="lzp-btn"/g)||[]).length!==3)fail(id+": reason pick not shown");if(!k||!/Nice thinking! Here’s another way to say it:/.test(k.tail))fail(id+": Explain model line missing after the pick");if(/Next problem|See my score/.test(ctx.app.innerHTML))fail(id+": Next shown before the pick");}
    if(!/wb-feedback good/.test(ctx.app.innerHTML))fail(id+": canonical answer marked wrong via UI ("+p.type+") "+p.q.slice(0,60));
    run("wbContinue")();
  }
  if(!done||done[0]!==id||done[2]!==size||done[1]!==size)fail(id+": wbRevealDone wrong "+JSON.stringify(done));
  if(!/Back to the lesson/.test(ctx.app.innerHTML))fail(id+": reveal finish screen lacks Back button");
  done=null;
}
// wrong answer via UI shows twin option and does not crash
run("wbStart")("4-5",{reveal:true});{const WB=run("WB");const p=WB.cur;for(const f of p.fields)WB.fields[f.key]="zz";run("wbSubmit")();if(!/Try one like it/.test(ctx.app.innerHTML+((run("WB")._pick||{}).tail||"")))fail("twin offer missing after miss");run("wbTryTwin")();if(!run("WB").isTwin)fail("twin not loaded");}
if(!/class="wb-review"/.test(wb.review("4-3"))||/Prince/.test(wb.review("4-3")))fail("review html");
console.log("UI flow: rendered+submitted "+ids.length+" lessons in reveal mode, hooks wbRevealDone/wbRevealExit ok");
// iPad keyboard fix (2026-11-11): the in-app keypad types "×", "÷", "−" with spaces; marking must stay exactly as before
{const P=run("wbEqParse");const T=(s,want)=>{let r;try{r=P(s);}catch(e){fail("wbEqParse threw on "+s);return;}if(!!r.ok!==want)fail("wbEqParse("+s+").ok should be "+want);};
 T("8 × 9 = 72",true);T("9 + 9 = 18",true);T("2 + 2 + 2 = 6",true);T("8 ÷ 2 = 4",false);T("9 − 1 = 8",false);T("8 × 9 = ",false);
 // every equation box of a twoEq/oneEq form is a keypad field; number boxes too; the "because" box keeps the keyboard (predictions off)
 let eqSeen=0,numSeen=0,becSeen=0;for(const id of ["4-1","4-2","4-3","4-4","4-5","3-7"])for(let k=0;k<30;k++)for(const p of wb.gen(id,10)){if(p.type!=="form")continue;
   ctx.WB=run("WB")||{};run("WB={fields:{}}");const h=run("wbFormHTML")(p);
   const g=p.group;(g&&(g.kind==="twoEq"||g.kind==="oneEq")?g.keys:[]).forEach(k2=>{eqSeen++;if(!new RegExp('data-k="'+k2+'"[^>]*readonly inputmode="none" data-lzpad="eq"').test(h))fail("equation box "+k2+" is not an eq keypad field ("+id+")");});
   p.fields.filter(f=>f.kind==="num").forEach(f=>{numSeen++;if(!new RegExp('data-k="'+f.key+'"[^>]*data-lzpad="num"').test(h))fail("number box "+f.key+" is not a num keypad field");});
   if(/wb-because/.test(h)){becSeen++;if(/wb-because[^>]*data-lzpad/.test(h)||!/wb-because[^>]*autocorrect="off" autocapitalize="off" spellcheck="false"/.test(h))fail("because box must keep the keyboard with predictions off");}
   (h.match(/<input[^>]*>/g)||[]).forEach(t=>{if(!/autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"/.test(t))fail("form input without predictions-off attributes");});}
 if(!eqSeen||!numSeen||!becSeen)fail("keypad markup test saw no equation/number/because boxes");
 console.log("Keypad markup: "+eqSeen+" equation boxes, "+numSeen+" number boxes, "+becSeen+" because boxes checked");}
// report
console.log("\nPer-lesson summary ("+SESSIONS+" sessions each):");
for(const id of ids){const s=summary[id];console.log(" "+id+" size="+s.size+" problems="+s.probs+" types="+JSON.stringify(s.types)+" formWrongTested="+s.wrongTested);}
console.log("\nSlot mix for the 10-slot lessons (slot: kind):");
for(const id of TEN){console.log(" "+id+": "+Object.keys(summary[id].slotTypes).map(k=>k+":"+summary[id].slotTypes[k]).join("  "));}
console.log("\nSamples (one session each):");
for(const id of TEN){console.log("== "+id+" "+wb.lessons[id].title);wb.gen(id,10).forEach((p,i)=>{const extra=p.rows?" | "+p.rows.join(" / "):p.parts?" | "+p.parts.join(" "):p.options?" | "+p.options.map(o=>o.id+"."+o.text+(o.true?"✓":"")).join("  "):p.pairs?" | "+p.pairs.map(x=>x.left).join(" ; ")+(p.rights?" => "+p.rights.join(", "):" => "+p.numbers.join(", ")):"";console.log("  "+(i+1)+" ["+p.type+"] "+p.q.slice(0,150)+extra.slice(0,170));});}
console.log("\nTOTAL FAILS:",fails);
process.exit(fails?1:0);
