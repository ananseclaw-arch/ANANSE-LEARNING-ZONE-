'use strict';
// Independent arithmetic oracle: evaluate the rendered equation sides, not the generator's expected list.
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const ctx={Math,console};vm.createContext(ctx);
vm.runInContext('function rnd(n){return Math.floor(Math.random()*n)}; function pick(a){return a[rnd(a.length)]}; function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){let j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};',ctx);
vm.runInContext(fs.readFileSync('reveal.js','utf8'),ctx);
function evalSide(s){assert(/^[\d\s×÷+]+$/.test(s),s);return Function('return '+s.replace(/×/g,'*').replace(/÷/g,'/'))();}
function verify(q){const m=q.mirror;assert(m.g>=1&&m.g<=10&&m.n>=1&&m.n<=10&&m.g*m.n<=100);
 const cuts=m.split?Array.from({length:m.n-1},(_,i)=>i+1):[null];
 for(const cut of cuts){const answers=Array.from(ctx.mirrorExpected(m,cut));assert(ctx.mirrorCheck(m,cut,answers));
  const rows=Array.from(ctx.mirrorRows(m));
  for(const row of rows){const filled=row.replace(/\{(\d+)\}/g,(_,i)=>answers[i]);if(filled.includes('=')){const sides=filled.split('=');assert.strictEqual(evalSide(sides[0]),evalSide(sides[1]),filled);}else assert.strictEqual(answers[answers.length-1],m.split?m.g*m.n:m.n);}
  for(let i=0;i<answers.length;i++){const wrong=answers.slice();wrong[i]++;assert(!ctx.mirrorCheck(m,cut,wrong));wrong[i]='';assert(!ctx.mirrorCheck(m,cut,wrong));wrong[i]='1x';assert(!ctx.mirrorCheck(m,cut,wrong));}
  if(m.split){const rev=[answers[2],answers[3],answers[0],answers[1],answers[5],answers[4],answers[6],...answers.slice(7)];assert(ctx.mirrorCheck(m,cut,rev));assert(!ctx.mirrorCheck(m,0,answers));}
 }
}
for(const id of ['4-6','5-1','5-2']){let count=0;for(let session=0;session<50;session++){const x=ctx.mirrorSession(id);const all=[...x.prim,...x.twins,...x.comebacks,...x.rushes];assert.equal(all.length,40);assert.equal(new Set(all.map(q=>q.sig)).size,40);if(id==='5-2'){assert.equal(x.prim[3].mirror.rows[0],'3 = {0} × 1');assert.equal(new Set(all.map(q=>q.mirror.rows.join('|'))).size,40);assert(x.prim[8].mirror.rows[0].startsWith('3 × '));assert(x.prim[9].mirror.rows[0].includes(' × {0} = 3 × '));}all.forEach(verify);count+=all.length;}console.log(id+': '+count+' independently checked instances, including all splits and reserved retries');}
// Story prompts use varied names and settings, and never the learner's own name.
ctx.P={name:'Maya'};
for(const id of ['4-6','5-1']){
 const stories=[];
 for(let slot=0;slot<10;slot++) for(let g=2;g<=5;g++) for(let n=2;n<=5;n++){
  const q=ctx.mirrorQuestion(id,slot,g,n);
  if((id==='4-6'&&slot>=4)||(id==='5-1'&&slot%2)){
   assert(!/\bMaya\b|A group shares|A gardener/.test(q.q),q.q);
   if(id==='5-1') assert(ctx.mirrorRows(q.mirror).at(-1).includes(q.mirror.arrayItem));
   stories.push(q.q);
  }
 }
 assert(new Set(stories.map(s=>s.match(/\b(Leo|Zoe|Noah|Ivy|Jamal|Nia|Eli|Sofia|Mateo|Lila|Omar)\b/)[0])).size>1);
}
console.log('Story names and contexts checked, including learner-name exclusion');
