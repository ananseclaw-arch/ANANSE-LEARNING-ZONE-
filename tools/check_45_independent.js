'use strict';
// Read the actual inlined workbook engine, not the separately edited source.
const fs=require('fs'),vm=require('vm');const html=fs.readFileSync('index.html','utf8');let start=html.indexOf('/* workbook.js is inlined here');start=html.indexOf('\n',start)+1;let end=html.indexOf('\n</script>',start);
const c={Math,console,JSON,Set,Map,Number,String,Array,Object,RegExp,Date,P:{name:'Test'},window:{}};vm.createContext(c);vm.runInContext(html.slice(start,end),c);
let checks=0, failures=[];function test(p,f,expected,label){checks++;let got=c.wbFormCheck(p,f);if(got!==expected)failures.push({label,fields:f,expected,got});}
const qs=JSON.parse(fs.readFileSync(process.env.HOME+'/staging/lz-notes/declutter/audit/questions_4-5.json'));
for(const q of qs){const p=q.problem,slot=p.slot,base={...p.answer.f},label='sample '+q.n+' slot '+slot;if(p.type!=='form')continue;
 if(slot===0){let s=p.q.includes('Products of 2')?'even':p.q.includes('Products of 10')?'0':'5';test(p,{...base,w:s},true,label);test(p,{...base,w:'banana'},false,label);}
 if(slot===1){let P=+p.q.match(/product is (\d+)/)[1];for(let a=1;a<=10;a++)for(let b=1;b<=10;b++)test(p,{a:String(a),b:String(b)},a*b===P,label);}
 if(slot===2){test(p,{a:'5'},true,label);for(const x of ['0','1','2','3','4','6','10'])test(p,{a:x},false,label);}
 if(slot===3){for(let a=0;a<=20;a++)for(let b=0;b<=20;b++)test(p,{a:String(a),b:String(b),c:'0'},a===0||b===0,label);test(p,{a:'0',b:'3',c:'1'},false,label);for(const x of ['-1','0.5','10000'])test(p,{a:'0',b:x,c:'0'},false,label+' outside stated range');}
 if(slot===4||slot===6){let M=+p.q.match(/fewer than (\d+)/)[1],step=slot===4?5:10;for(let x=0;x<=step*M+1;x++)test(p,{...base,v:String(x)},x>=step&&x<step*M&&x%step===0,label);}
 if(slot===5){let n=+p.q.match(/use (\d+)/)[1],want=n%2?'no':'yes';test(p,{...base,a:want},true,label);test(p,{...base,a:want==='yes'?'no':'yes'},false,label);}
 if(slot===7){let n=p.q.match(/^Is (\d+)/),want=!n||+n[1]%10===0?'yes':'no';test(p,{...base,a:want},true,label);test(p,{...base,a:want==='yes'?'no':'yes'},false,label);}
 if(slot===9){let z=p.q.match(/product of (\d+) × (\d+)/),v=+z[1]*+z[2];test(p,{p:String(v),d:String(v%10)},true,label);test(p,{p:String(v+1),d:String(v%10)},false,label);test(p,{p:String(v),d:String((v+1)%10)},false,label);}
}
console.log(JSON.stringify({checks,failures,failureCount:failures.length},null,2));process.exitCode=failures.length?1:0;
