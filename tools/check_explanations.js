/* Evidence of free-response checker behavior on generated questions. */
'use strict';
const fs=require('fs'),vm=require('vm');
const ctx={window:{},console,Math,Set,Map,Number,String,Array,Object,RegExp,Date,P:{name:'Test'},RV_NAMES:['Ama','Kofi','Esi','Kwame']};
vm.createContext(ctx);vm.runInContext(fs.readFileSync('workbook.js','utf8'),ctx);
const wb=ctx.window.__wb;
let failures=0;
for(const id of ['4-1','4-2','4-3','4-4','4-5']) {
  for(const p of wb.gen(id,10).filter(p=>p.type==='form' && p.checks.some(c=>c.t==='reason'))) {
    const c=p.checks.find(c=>c.t==='reason');
    const right=wb.check(p,p.answer);
    const reasons=['I do not know, banana '+c.keys[0], 'idk', 'it is', 'banana banana '+c.keys[0], 'the banana is '+c.keys[0]];
    const sensible=[];
    if(id==='4-5' && /pairs of/.test(p.q)) {
      reasons.push(p.answer.f.a==='no'?'it is even':'it is odd');
      sensible.push(p.answer.f.a==='no'?'it is od':'it is evn');
    }
    if(id==='4-5' && /product of 2, a product of 5, and a product of 10/.test(p.q)) {
      reasons.push(p.answer.f.a==='no'?'it ends in 0':'it does not end in 0');
      reasons.push(p.answer.f.a==='no'?'yes it works':'no it cannot work');
    }
    if(id==='4-2' && /remember/.test(p.q)) sensible.push('the order stays the same','the oder stays the same');
    if(id==='4-3' && /ones place/.test(p.q)) sensible.push('multiples of 10 end in 0','multipls of 10 end in 0');
    const wrong=reasons.filter(reason=>wb.check(p,{f:{...p.answer.f,[c.k]:reason}}));
    const sensibleRejected=sensible.filter(reason=>!wb.check(p,{f:{...p.answer.f,[c.k]:reason}}));
    console.log(JSON.stringify({lesson:id,prompt:p.q,correct:p.answer.f,correctAccepted:right,wrongAccepted:wrong,sensibleRejected}));
    if(!right||wrong.length||sensibleRejected.length) failures++;
  }
}
console.log('Failures:',failures);process.exitCode=failures?1:0;
