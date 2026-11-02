/* node tools/dump_questions.js [outdir] [count]
   Prints/saves, per lesson, N generated questions as JSON: on-screen text (rendered through the app's own render code
   for the workbook-engine lessons; assembled from the same rows for the mirror lessons), accepted answer(s), checker rule.
   Lessons: 3-7, 4-1..4-5 (workbook.js), 4-6, 5-1, 5-2 (reveal.js mirror). */
"use strict";
const fs=require("fs"),vm=require("vm"),path=require("path");
const ROOT=path.join(__dirname,"..");
const OUT=process.argv[2]||path.join(process.env.HOME,"staging/lz-notes/declutter/audit");
const COUNT=Number(process.argv[3]||60);
fs.mkdirSync(OUT,{recursive:true});

// ---------- workbook.js lessons ----------
const app={innerHTML:""};
const ctx={window:{},console,Math,JSON,Set,Map,Number,String,Array,Object,RegExp,Date,P:{name:"Test"},app,
  RV_NAMES:["Ama","Kofi","Prince","Esi","Kwame","Abena","Yaw","Adwoa","Maya","Omar"],esc:s=>String(s),say(){},save(){},toast(){},
  setTimeout(){},document:{getElementById:()=>null,createElement:()=>({}),head:{appendChild(){}},querySelectorAll:()=>[]}};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT,"workbook.js"),"utf8"),ctx);
const run=c=>vm.runInContext(c,ctx);
const wb=ctx.window.__wb;

const decode=s=>s.replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'");
function screenText(html){
  return decode(html
    .replace(/<input[^>]*data-k="(\w+)"[^>]*>/g,"[ $1 ]")
    .replace(/<button[^>]*wb-num-box[^>]*>.*?<\/button>/g,"[ box ]")
    .replace(/<div class="wb-pad">.*?<\/div>/g,"")
    .replace(/<button class="wb-read".*?<\/button>/g,"")
    .replace(/<section class="wb-work">.*?<\/section>/g,"[work area]")
    .replace(/<\/(div|p|section|h\d|span)>/g,"\n").replace(/<br\s*\/?>/g,"\n")
    .replace(/<[^>]+>/g,"")).split("\n").map(x=>x.replace(/\s+/g," ").trim()).filter(Boolean);
}
function ruleOf(p){
  if(p.type==="form"){
    const r=[];
    (p.checks||[]).forEach(c=>r.push(c.k+": "+({num:"exactly "+c.want,word:"word in "+JSON.stringify(c.accept)+" (typo-tolerant)",yn:"yes/no = "+c.want,reason:"reason mentions one of "+JSON.stringify(c.keys),mult:"any multiple of "+c.of+" from "+c.min+" to "+c.max,divides:"any divisor of "+c.of+" from 2 to "+c.max})[c.t]||c.t));
    if(p.group)r.push("group "+p.group.kind+" on "+p.group.keys.join(",")+" "+JSON.stringify(Object.assign({},p.group,{keys:undefined,kind:undefined})));
    return r;
  }
  return [p.type+(p.allowEqTurn?" exact match, multiplication factors may be reversed":" exact match")];
}
const result={};
for(const id of ["3-7","4-1","4-2","4-3","4-4","4-5"]){
  const list=[];
  while(list.length<COUNT){
    run("wbStart")(id,{reveal:true,size:10});
    const WB=run("WB");
    for(const p of WB.problems){
      if(list.length>=COUNT)break;
      run("wbLoadProblem")(p,false);
      list.push({n:list.length+1,type:p.type,prompt:p.q,instruction:p.instruction||null,
        screen:screenText(app.innerHTML).filter(l=>!/^Lesson \d|^Review$|^\d+\.$|^Additional Practice|^Name/.test(l)).slice(1),
        rows:p.rows||null,parts:p.parts||null,options:p.options?p.options.map(o=>o.id+". "+o.text+(o.true?"  [TRUE]":"")):null,
        pairs:p.pairs?p.pairs.map(x=>x.left):null,rights:p.rights||null,numbers:p.numbers||null,
        answer:p.answer,rule:ruleOf(p),explain:p.explain||null,model:p.model||null,problem:JSON.parse(JSON.stringify(p))});
    }
  }
  result[id]=list;
}

// ---------- reveal.js mirror lessons ----------
const m2={Math,console,JSON,Set,Array,Object,Number,String,RegExp,P:{name:"Test"},document:{getElementById:()=>null}};
vm.createContext(m2);
vm.runInContext('function rnd(n){return Math.floor(Math.random()*n)}; function pick(a){return a[rnd(a.length)]}; function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){let j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};',m2);
vm.runInContext(fs.readFileSync(path.join(ROOT,"reveal.js"),"utf8"),m2);
for(const id of ["4-6","5-1","5-2"]){
  const list=[];
  while(list.length<COUNT){
    const s=m2.mirrorSession(id);
    for(const q of s.prim){
      if(list.length>=COUNT)break;
      const m=q.mirror,rows=Array.from(m2.mirrorRows(m));
      const cuts=m.split?Array.from({length:m.n-1},(_,i)=>i+1):[null];
      const answers={};cuts.forEach(c=>{answers[c===null?"-":"cut after col "+c]=Array.from(m2.mirrorExpected(m,c));});
      list.push({n:list.length+1,type:m.split?"array-split":"mirror",prompt:q.q,
        screen:[q.q].concat(m.split?["[array: "+m.g+" rows x "+m.n+" columns, tap a gap to split]"]:[]).concat(rows.map(r=>r.replace(/\{(\d+)\}/g,"[ box$1 ]"))),
        rows,g:m.g,n:m.n,slot:m.slot,mirror:JSON.parse(JSON.stringify(m)),answer:answers,rule:[m.split?"any split; each product either way round; partial products must match":"each box exactly equals expected"],teach:q.teach.map(t=>t.t)});
    }
  }
  result[id]=list;
}
for(const id of Object.keys(result)){
  fs.writeFileSync(path.join(OUT,"questions_"+id+".json"),JSON.stringify(result[id],null,1));
  console.log(id+": "+result[id].length+" questions -> questions_"+id+".json");
}
