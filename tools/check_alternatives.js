'use strict';
const fs=require('fs'),vm=require('vm'),html=fs.readFileSync('index.html','utf8');let start=html.indexOf('/* workbook.js is inlined here');start=html.indexOf('\n',start)+1;let end=html.indexOf('\n</script>',start);const c={Math,console,JSON,Set,Map,Number,String,Array,Object,RegExp,Date,P:{name:'Test'},window:{}};vm.createContext(c);vm.runInContext(html.slice(start,end),c);
let checks=0,failures=[];function test(p,f,want,label){checks++;let got=c.wbFormCheck(p,f);if(got!==want)failures.push({label,fields:f,want,got});}
const sample=(id,slot)=>c.wbGenerate(id,10)[slot];
for(const [id,slot] of [['4-1',6],['4-1',8]]){const p=sample(id,slot),base={...p.answer.f};for(let k=2;k<=10;k++)for(let x=1;x<=10;x++){
 let valid=slot===6?k===2:x===2,add=Array(k).fill(x).join(' + '),t=k*x;
 for(let rev=0;rev<2;rev++)for(let side=0;side<2;side++)for(let order=0;order<2;order++){
 let mult=rev?`${x} × ${k}`:`${k} × ${x}`,ea=side?`${t} = ${add}`:`${add} = ${t}`,em=side?`${t} = ${mult}`:`${mult} = ${t}`;let f={...base,e1:order?em:ea,e2:order?ea:em};test(p,f,valid,`${id}/${slot}`);
 }
 }for(const pair of [['2+3=5','2×3=6'],['1+1=2','3×1=3'],['2+2=4','2×2=5'],['1+1=2','1+1=2']])test(p,{...base,e1:pair[0],e2:pair[1]},false,`${id}/${slot} invalid`);
}
{const p=sample('4-4',7),base={...p.answer.f};for(let x=1;x<=30;x++)for(const mult of [`${x} × 1`,`1 × ${x}`])for(const e of [`${mult} = ${x}`,`${x} = ${mult}`])test(p,{...base,e},true,'oneEq');for(const e of ['31×1=31','0×1=0','2×2=4','1×5=6'])test(p,{...base,e},false,'oneEq invalid');}
for(const [id,slot,step] of [['4-2',7,5],['4-3',1,10],['4-5',4,5],['4-5',6,10]]){const p=sample(id,slot),base={...p.answer.f};let min=step,max;if(id==='4-2'){min=10;max=50;}else {let n=+p.q.match(/fewer than (\d+)/)[1];max=(n-1)*step;}for(let x=0;x<=max+step+1;x++)test(p,{...base,v:String(x)},x>=min&&x<=max&&x%step===0,`${id}/${slot}`);}
{const p=sample('4-5',3);for(let x=0;x<=9999;x++){test(p,{a:'0',b:String(x),c:'0'},true,'zero left');test(p,{a:String(x),b:'0',c:'0'},true,'zero right');}for(const f of [{a:'1',b:'2',c:'0'},{a:'0',b:'2',c:'1'},{a:'0',b:'-1',c:'0'},{a:'0',b:'10000',c:'0'}])test(p,f,false,'zero invalid');}
console.log(JSON.stringify({checks,failureCount:failures.length,failures:failures.slice(0,100)},null,2));process.exitCode=failures.length?1:0;
