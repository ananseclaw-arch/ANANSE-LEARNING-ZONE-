'use strict';
// Enumerate generated mirror inputs. Derive answers from displayed equations/stories,
// and exercise the production mirrorCheck rather than mirrorExpected.
const fs=require('fs'),vm=require('vm');
const c={Math,console,JSON,Set,Array,Object,Number,String,RegExp,P:{name:'Test'}};vm.createContext(c);vm.runInContext(fs.readFileSync('reveal.js','utf8'),c);
let checks=0, failures=[];
function test(m,cut,v,want,label){const got=c.mirrorCheck(m,cut,v);checks++;if(got!==want)failures.push(label+' got '+got+' for '+JSON.stringify(v));}
function evalSide(s){s=s.replace(/×/g,'*').replace(/÷/g,'/').trim();if(!/^\d+(?:\s*[*/+]\s*\d+)*$/.test(s))throw Error(s);return Function('return '+s)();}
for(const id of ['4-6','5-1','5-2'])for(let slot=0;slot<10;slot++)for(let g=1;g<=10;g++)for(let n=1;n<=10;n++){
 if(id==='4-6'&&slot>=4&&(g<2||n<2))continue;if(id==='5-1'&&(g<2||n<2))continue;if(id==='5-2'&&g!==3)continue;
 const q=c.mirrorQuestion(id,slot,g,n),m=q.mirror,label=[id,slot,g,n].join('/');
 if(id==='5-1'){
  if(slot%2){const match=q.q.match(/in (\d+) rows with (\d+) in each row/);if(!match||+match[1]!==g||+match[2]!==n)failures.push(label+' story mismatch');}
  for(let cut=1;cut<n;cut++)for(let swap=0;swap<2;swap++)for(let a=0;a<2;a++)for(let b=0;b<2;b++){
   let groups=[[g,cut],[g,n-cut]],products=[g*cut,g*(n-cut)];if(swap){groups.reverse();products.reverse();}if(a)groups[0].reverse();if(b)groups[1].reverse();let v=[...groups[0],...groups[1],...products,g*n];if(slot%2)v.push(g*n);test(m,cut,v,true,label);let bad=v.slice();bad[6]++;test(m,cut,bad,false,label);
  }
  test(m,0,[g,1,g,n-1,g,g*(n-1),g*n],false,label);continue;
 }
 let expected=[];
 if(id==='4-6'){
  if(slot>=4){let story=q.q.match(/shares (\d+) .*? equally among (\d+)/);if(!story){failures.push(label+' story parse');continue;}const quotient=+story[1]/+story[2];expected=Array(m.rows.length).fill(quotient);}
  else expected=[n,n];
 }else{
  const row=m.rows[0];let valid=[];for(let x=0;x<=100;x++){let parts=row.replace('{0}',x).split('=');if(evalSide(parts[0])===evalSide(parts[1]))valid.push(x);}if(valid.length!==1){failures.push(label+' equation solutions '+valid);continue;}expected=valid;
 }
 test(m,null,expected,true,label);for(let i=0;i<expected.length;i++){let bad=expected.slice();bad[i]++;test(m,null,bad,false,label);}
}
console.log(JSON.stringify({checks,failures:failures.slice(0,100),failureCount:failures.length},null,2));process.exitCode=failures.length?1:0;
