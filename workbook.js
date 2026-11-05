/* ============================================================
   WORKBOOK PRACTICE — Reveal Math Grade 3, lessons 3-1 to 4-2
   Original, generated practice inspired by the page structure in
   Prince's current Student Practice Book. This module deliberately
   keeps its own state and only adds P.workbook to learner profiles.
   ============================================================ */
"use strict";

var WB=null;

const WB_LESSONS={
  "3-1":{title:"Understand Equal Groups",review:"Multiply the number of objects in each group by the number of equal groups. Four packs with 6 stickers in each pack make 24 stickers in all.",reviewModel:{kind:"groups",groups:4,size:6},reviewEq:"4 packs × 6 stickers per pack = 24 stickers in all"},
  "3-2":{title:"Use Arrays to Multiply",review:"An array has rows and columns. Multiply the number of rows by the number of columns to find the total. Five rows of 3 dots make 15 dots.",reviewModel:{kind:"array",rows:5,cols:3},reviewEq:"5 × 3 = 15"},
  "3-3":{title:"Commutative Property",review:"You can change the order of the factors and the product stays the same. Two rows of 6 and 6 rows of 2 both have 12 dots.",reviewModel:{kind:"array",rows:2,cols:6},reviewEq:"2 × 6 = 6 × 2 = 12"},
  "3-4":{title:"Understand Equal Sharing",review:"You can divide by sharing objects equally among groups. Share 24 counters among 4 groups and each group gets 6 counters.",reviewModel:{kind:"groups",groups:4,size:6},reviewEq:"24 ÷ 4 = 6"},
  "3-5":{title:"Understand Equal Grouping",review:"Make equal groups until every object is used. If 24 objects are put in groups of 6, there are 4 groups: 24 divided by 6 equals 4.",reviewModel:{kind:"groups",groups:4,size:6},reviewEq:"24 ÷ 6 = 4"},
  "3-6":{title:"Relate Multiplication and Division",review:"The same array tells related multiplication and division facts. Four rows of 5 make 20, so 4 times 5 equals 20, 20 divided by 4 equals 5, and 20 divided by 5 equals 4.",reviewModel:{kind:"array",rows:4,cols:5},reviewEq:"4 × 5 = 20   ·   20 ÷ 4 = 5   ·   20 ÷ 5 = 4"},
  "3-7":{title:"Find the Unknown",review:"You can draw a representation, write an equation and find the unknown. Share 30 books equally on 5 shelves: 5 groups, so 30 ÷ 5 = 6 books on each shelf. Check with a related fact: 5 × 6 = 30. Count everyone: a person and 3 friends are 4 people.",reviewModel:{kind:"groups",groups:5,size:6},reviewEq:"30 ÷ 5 = 6   ·   5 × 6 = 30"},
  "4-1":{title:"Multiply by 2",review:"You can use doubling to multiply by 2. Mia gives 2 stickers each to 10 friends at her club. Create an equation to represent how many stickers she will hand out: 10 × 2 = 20. Mia will hand out 20 stickers.",reviewModel:{kind:"groups",groups:10,size:2},reviewEq:"10 × 2 = 10 + 10 = 20"},
  "4-2":{title:"Multiply by 5",review:"You can use what you know about multiplying 5s to solve problems. Leo hangs photo frames in 5 columns and some rows. How many frames could Leo have in all? Products of 5 have a 0 or 5 in the ones place. So Leo could have 5, 10, 15, 20, 25, 30, 35, 40, 45, or 50 frames.",reviewModel:{kind:"array",rows:5,cols:4},reviewEq:"5 × 4 = 20"},
  "4-3":{title:"Multiply by 10",review:"You can use what you know about multiplication with 10 to solve problems. Each storybook has 10 pages. How many pages are there in 4 storybooks? 4 × 10 = 40. There are 40 pages.",reviewModel:{kind:"array",rows:4,cols:10},reviewEq:"4 × 10 = 40"},
  "4-4":{title:"Multiply by 1 and 0",review:"You can use what you know about multiplying with 1 and 0 to solve problems. Ella walks 1 mile a day for 10 days: 10 × 1 = 10 miles. Any number multiplied by 1 equals itself. Omar puts 0 books in each of 2 boxes: 2 × 0 = 0 books. Any number multiplied by 0 equals 0.",reviewModel:{kind:"groups",groups:10,size:1},reviewEq:"10 × 1 = 10   ·   2 × 0 = 0"},
  "4-5":{title:"Use Patterns to Multiply",review:"You can identify patterns to help you solve multiplication problems. The product of 0 and any number is always 0 (7 × 0 = 0). The product of any number and 1 is the other number (1 × 4 = 4). Products of 2 have a 0, 2, 4, 6, or 8 in the ones place (2 × 6 = 12). Products of 5 have a 0 or 5 in the ones place (5 × 6 = 30, 9 × 5 = 45). When you multiply a digit by 10, the digit is in the tens place and 0 is in the ones place (10 × 8 = 80).",reviewModel:{kind:"groups",groups:5,size:2},reviewEq:"2 × 6 = 12   ·   5 × 9 = 45   ·   10 × 8 = 80"}
};

const WB_FALLBACK_NAMES=["Ama","Kofi","Zane","Esi","Kwame","Abena","Yaw","Adwoa","Maya","Omar"];
function wbRand(n){return Math.floor(Math.random()*n);}
function wbPick(a){return a[wbRand(a.length)];}
function wbShuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=wbRand(i+1),t=a[i];a[i]=a[j];a[j]=t;}return a;}
function wbName(){let names=typeof RV_NAMES!=="undefined"&&RV_NAMES.length?RV_NAMES:WB_FALLBACK_NAMES;const mine=(typeof P!=="undefined"&&P&&P.name?String(P.name).trim().toLowerCase():"");names=names.filter(x=>x!=="Prince"&&x.toLowerCase()!==mine);if(!names.length)names=["Maya","Omar","Ivy"];return wbPick(names);}
function wbFactor(min,max){return min+wbRand(max-min+1);}
function wbEq(op,a,b,c){return{op:op,values:[a,b,c]};}
function wbBase(id,type,q,spoken){return{lesson:id,type:type,q:q,spoken:spoken||q};}
function wbAnswerObject(eq,value,remainder){const a={eq:eq.values.slice(),value:value};if(remainder!=null)a.remainder=remainder;return a;}
function wbModelForDivision(total,divisor,quotient,mode){return mode==="array"?{kind:"array",rows:divisor,cols:quotient}:{kind:"groups",groups:quotient,size:divisor};}
function wbStory(id,q,spoken,eq,value,unit,model,opts){opts=opts||{};const p=wbBase(id,"story",q,spoken);p.eq=eq;p.answer=wbAnswerObject(eq,value,opts.remainder);p.unit=unit;p.model=model;p.requireWork=!!opts.requireWork;p.instruction=opts.instruction||(p.requireWork?"Draw a representation. Then write an equation and solve.":"Show your work below. Then write an equation and solve.");p.explain=opts.explain||("The model has "+(model.kind==="array"?model.rows+" rows of "+model.cols:model.groups+" equal groups of "+model.size)+".");if(opts.remainder!=null)p.remainderUnit=opts.remainderUnit||"left over";return p;}
function wbFill(id,parts,answer,spoken,explain){const p=wbBase(id,"fill","What number completes the equation?",spoken);p.parts=parts;p.answer=answer;p.explain=explain||("The box is "+answer+".");const shown=parts.map(x=>x==="□"?answer:x),m=shown.indexOf("×"),d=shown.indexOf("÷");if(m>0)p.model={kind:"groups",groups:Number(shown[m-1]),size:Number(shown[m+1])};else if(d>0)p.model={kind:"array",rows:Number(shown[d+1]),cols:Number(shown[shown.indexOf("=")+1])};if(p.model&&!(p.model.kind==="groups"?(p.model.groups>=1&&p.model.size>=1&&p.model.groups<=10&&p.model.size<=10):(p.model.rows>=1&&p.model.cols>=1)))p.model=null;return p;}
function wbPicture(id,q,spoken,visual,eq,opts){opts=opts||{};const p=wbBase(id,"picture",q,spoken);p.visual=visual||null;p.eq=eq;p.answer={eq:eq.values.slice()};p.model=opts.model||visual;p.requireWork=!!opts.requireWork;p.instruction=opts.instruction||"";p.explain=opts.explain||("The representation shows "+eq.values.join(" "+(eq.op==="÷"?"divided into":"times")+" ")+".");return p;}
function wbMulti(id,factor,options){const p=wbBase(id,"multi","Which equations are true? Choose all that apply.","Choose all the equations that are true.");p.options=options.map((o,i)=>({id:String.fromCharCode(65+i),text:o.text,true:!!o.true,why:o.why}));p.answer=p.options.filter(o=>o.true).map(o=>o.id);p.factor=factor;return p;}
function wbPair(id,q,spoken,models,product,opts){opts=opts||{};const p=wbBase(id,"pair",q,spoken);p.models=models;p.model={kind:"pair",models:models};p.answer={product:product};p.requireWork=true;p.instruction=opts.instruction||"Build both representations. Then write the product they share.";p.explain=opts.explain||"Both representations have "+product+" objects.";if(opts.equations){p.equations=opts.equations.map(e=>e.values.slice());p.answer.equations=p.equations.map(e=>e.slice());}if(opts.compareAnswer){p.people=opts.people||["Same","Different"];p.compareAnswer=opts.compareAnswer;p.answer.compare=opts.compareAnswer;}return p;}
/* ---------- typed-form helpers (type "form"): real text boxes, answers checked with maths / key ideas ---------- */
const WB_TEN=["3-7","4-1","4-2","4-3","4-4","4-5"];
const WB_R={
  even:["even","evn","pairs","pair","2","two","twos","double","doubles","odd","od","half","halves","couples"],
  order:["same","order","swap","switch","flip","commutative","backwards","backward","reverse","turn","change","either","equal","both","around"],
  zero:["0","zero","nothing","none","empty"],
  ones:["ones","end","ends","last","digit","0","zero","tens","multiple","multiples","10","ten","place"],
  dbl:["double","doubled","doubles","twice","two","2","half","halves","add","plus","+","again","same","both","equal"],
  ten:["10","ten","tens","multiple","multiples","skip","count","groups","group","each","times","×","x"],
  five:["5","five","fives","groups","group","pile","piles","stack","stacks","pack","packs","sheet","sheets","end","ends","0","zero","each","times","×","x","multiple","multiples","skip","count"],
  one:["1","one","each","every","same","equal","as many","itself","match"],
  mix:["0","zero","ten","10","ones","end","ends","multiple","both","five","5","even","odd","two","2","1","one"],
  same:["0","zero","nothing","1","one","itself","same","different","not","equal","product","order"]
};
function wbN2(){const a=wbName();let b=wbName(),t=0;while(b===a&&t++<40)b=wbName();return[a,b];}
function wbNorm(s){return String(s==null?"":s).toLowerCase().replace(/[✕*]/g,"×").replace(/[^a-z0-9×+=\s$]/g," ").replace(/\s+/g," ").trim();}
function wbLev(a,b){const m=a.length,n=b.length;if(!m)return n;if(!n)return m;let prev=[];for(let j=0;j<=n;j++)prev[j]=j;for(let i=1;i<=m;i++){const cur=[i];for(let j=1;j<=n;j++)cur[j]=Math.min(prev[j]+1,cur[j-1]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));prev=cur;}return prev[n];}
function wbWordOK(text,accept){const t=wbNorm(text).replace(/^(a|an|the)\s+/,"");if(!t)return false;return accept.some(w=>{w=String(w).toLowerCase();if(t===w)return true;if(w.length>=4&&wbLev(t,w)<=1)return true;if(w.length>=7&&wbLev(t,w)<=2)return true;return false;});}
/* Explain reasons are NEVER auto-marked (Eb, 2026-11-04, option A): only the answer is checked; the reason is saved
   for the parent (P.explains) and the model explanation is always shown. */
function wbYN(text){const t=wbNorm(text).split(" ")[0];if(/^(y|yes|yep|yeah|yup|correct|true|sure)$/.test(t))return"yes";if(/^(n|no|nope|nah|false|not|incorrect)$/.test(t))return"no";return null;}
function wbNum(text){const t=String(text==null?"":text).trim().replace(/^\$/,"").replace(/,/g,"");return /^\d{1,4}$/.test(t)?Number(t):NaN;}
function wbSideParse(str){if(!str)return null;const terms=str.split("+").map(t=>t.split("*"));if(terms.some(t=>t.some(f=>!/^\d{1,3}$/.test(f))))return null;const nums=terms.map(t=>t.map(Number));return{terms:nums,value:nums.reduce((s,t)=>s+t.reduce((a,b)=>a*b,1),0)};}
function wbEqParse(s){const t=String(s==null?"":s).toLowerCase().replace(/[×x*]/g,"*").replace(/\s+/g,"");if(!/^[0-9+*=]+$/.test(t))return{ok:false};const sides=t.split("=");if(sides.length!==2)return{ok:false};const L=wbSideParse(sides[0]),R=wbSideParse(sides[1]);if(!L||!R)return{ok:false};const isExpr=x=>x.terms.length>1||x.terms[0].length>1;const ex=isExpr(L)?L:(isExpr(R)?R:null);return{ok:L.value===R.value&&!!ex,L:L,R:R,terms:ex?ex.terms:null,total:L.value};}
function wbClassEq(s){const e=wbEqParse(s);if(!e.ok)return null;const t=e.terms;if(t.length>=2&&t.every(x=>x.length===1)){const v=t.map(x=>x[0]);if(v.every(x=>x===v[0]))return{kind:"add",x:v[0],k:v.length,total:e.total};return null;}if(t.length===1&&t[0].length===2)return{kind:"mul",f:t[0].slice(),total:e.total};return null;}
function wbTwoEqOK(a,b,g){const x=wbClassEq(a),y=wbClassEq(b);if(!x||!y)return false;const add=x.kind==="add"?x:(y.kind==="add"?y:null),mul=x.kind==="mul"?x:(y.kind==="mul"?y:null);if(!add||!mul||add.total!==mul.total)return false;if(add.x<1||add.k<2||add.x>10||add.k>10||add.total>100)return false;if(mul.f.slice().sort().join()!==[add.x,add.k].sort().join())return false;if(g.fixedCount!=null&&add.k!==g.fixedCount)return false;if(g.fixedValue!=null&&add.x!==g.fixedValue)return false;return true;}
function wbFormCheck(p,f){
  if(!f||typeof f!=="object")return false;
  for(const c of (p.checks||[])){
    if(c.t==="reason")continue; // the "because" part is saved, not marked
    const v=f[c.k];if(v==null||String(v).trim()==="")return false;
    if(c.t==="num"){if(wbNum(v)!==c.want)return false;}
    else if(c.t==="word"){if(!wbWordOK(v,c.accept))return false;}
    else if(c.t==="yn"){if(wbYN(v)!==c.want)return false;}
    else if(c.t==="mult"){const n=wbNum(v);if(!(n>=c.min&&n<=c.max&&n%c.of===0))return false;}
    else if(c.t==="divides"){const n=wbNum(v);if(!(n>=2&&n<=c.max&&c.of%n===0))return false;}
    else return false;
  }
  const g=p.group;
  if(g){
    for(const k of (g.keys||[]))if(f[k]==null||String(f[k]).trim()==="")return false;
    if(g.kind==="twoEq")return wbTwoEqOK(f[g.keys[0]],f[g.keys[1]],g);
    if(g.kind==="pairprod"){const a=wbNum(f[g.keys[0]]),b=wbNum(f[g.keys[1]]);return a>=1&&b>=1&&a<=10&&b<=10&&a*b===g.product;}
    if(g.kind==="zeroblank"){const a=wbNum(f[g.keys[0]]),b=wbNum(f[g.keys[1]]),c=wbNum(f[g.keys[2]]);return Number.isInteger(a)&&Number.isInteger(b)&&(a===0||b===0)&&c===0;}
    if(g.kind==="oneEq"){const e=wbClassEq(f[g.keys[0]]);return !!e&&e.kind==="mul"&&(e.f[0]===1||e.f[1]===1)&&e.total>=1&&e.total<=30;}
    return false;
  }
  return true;
}
function wbSig(p){return JSON.stringify([p.q,p.parts||null,p.rows||null,p.options?p.options.map(o=>o.text):null,p.pairs?p.pairs.map(x=>x.left):null,p.people||null,p.eq?p.eq.values:null]);}
function wbForm(id,q,spoken,rows,checks,group,ans,explain,lines,opts){
  opts=opts||{};const p=wbBase(id,"form",q,spoken);p.rows=rows;p.fields=[];
  rows.forEach(r=>{String(r).replace(/\{([nt]):(\w+)\}/g,(m,t,k)=>{p.fields.push({key:k,kind:t==="n"?"num":"text"});return m;});});
  p.checks=checks||[];p.group=group||null;p.answer={f:ans};p.explain=explain;p.answerLines=lines||[];p.instruction=opts.instruction||(p.fields.length===1?"Type your answer in the box.":"Type your answers in the boxes.");p.visual=opts.visual||null;return p;
}
function wbMultiAuto(id,texts,q,spoken,factor){
  if(new Set(texts).size!==texts.length)return null;
  const opts=wbShuffle(texts).map(t=>{const e=wbEqParse(t);const ok=!!e.ok;return{text:t,true:ok,why:ok?"Both sides equal "+e.total+".":(e.L&&e.R?"The left side is "+e.L.value+" but the right side is "+e.R.value+".":"The two sides are not equal.")};});
  if(!opts.some(o=>o.true)||!opts.some(o=>!o.true))return null;
  const p=wbMulti(id,factor||0,opts);if(q)p.q=q;if(spoken)p.spoken=spoken;p.explain="Work out both sides of each equation. An equation is true only when both sides have the same value.";return p;
}
function wbMatchRights(id,q,spoken,items){
  const order=wbShuffle(items),pairs=items.map((it,k)=>({id:"p"+k,left:it.left,right:it.right}));
  const p=wbBase(id,"match",q,spoken);p.pairs=pairs;p.rights=order.map(o=>o.right);p.answer=pairs.map((pr,k)=>[pr.id,order.indexOf(items[k])+1]);p.explain="Solve each equation, then find the matching addition.";return p;
}
function wbMatchNumbers(id,q,spoken,items){
  const pairs=items.map((it,k)=>({id:"p"+k,left:it.left,right:String(it.value)}));
  const p=wbBase(id,"match",q,spoken);p.pairs=pairs;p.numbers=wbShuffle(items.map(x=>x.value));p.answer=pairs.map((pr,k)=>[pr.id,items[k].value]);p.explain="Solve each equation and type the number that makes it true.";return p;
}
function wbMulStory(id,q,spoken,g,s,unit,explain,model){const t=g*s;const p=wbStory(id,q,spoken,wbEq("×",g,s,t),t,unit,model||{kind:"groups",groups:g,size:s},{explain:explain});p.allowEqTurn=true;return p;}
function wbFillT(id,parts,answer,spoken,explain,q){const p=wbFill(id,parts,answer,spoken,explain);if(q)p.q=q;return p;}

function wbGen31(i){
  const id="3-1",slot=i%8,n=wbName();
  if(slot<3){const g=wbFactor(2,6),s=wbFactor(2,9),t=g*s;return wbPicture(id,"How can you use a drawing to represent "+g+" equal groups of "+s+"?","Build "+g+" equal groups with "+s+" in each group.",null,wbEq("×",g,s,t),{model:{kind:"groups",groups:g,size:s},requireWork:true,instruction:"Build the equal groups. Then write the multiplication equation.",explain:g+" equal groups with "+s+" in each group have "+t+" objects."});}
  if(slot===3){const g=wbFactor(3,5),s=wbFactor(3,8),t=g*s;return wbPicture(id,"What multiplication equation represents the equal groups?","Write the multiplication equation shown by the circles of dots.",{kind:"circles",groups:g,size:s},wbEq("×",g,s,t),{explain:"There are "+g+" groups with "+s+" dots in each group, so there are "+t+" dots."});}
  if(slot===4){const packs=wbFactor(3,7),each=wbFactor(2,8),t=packs*each;return wbStory(id,n+" buys stickers in packages of "+each+". How many stickers are in "+packs+" packages?",n+" buys "+packs+" packages with "+each+" stickers in each. How many stickers are there?",wbEq("×",packs,each,t),t,"stickers",{kind:"groups",groups:packs,size:each},{requireWork:true,instruction:"Draw a picture, write an equation, and solve.",explain:packs+" packages with "+each+" stickers each make "+t+" stickers."});}
  if(slot===5){const dogs=wbFactor(4,9),pay=wbFactor(3,8),t=dogs*pay;return wbStory(id,n+" earns $"+pay+" for walking each of "+dogs+" dogs. How much does "+n+" earn? Explain how you know.",n+" earns "+pay+" dollars for each of "+dogs+" dogs. How much does "+n+" earn?",wbEq("×",dogs,pay,t),t,"dollars",{kind:"groups",groups:dogs,size:pay},{explain:dogs+" equal payments of $"+pay+" total $"+t+"."});}
  if(slot===6){const sites=wbFactor(3,6),each=wbFactor(2,9),t=sites*each;return wbStory(id,n+" orders "+each+" boxes of nails for each of "+sites+" construction sites. How many boxes might "+n+" order? Explain how you know.",n+" orders "+each+" boxes for each of "+sites+" sites. How many boxes altogether?",wbEq("×",sites,each,t),t,"boxes",{kind:"groups",groups:sites,size:each},{explain:sites+" sites with "+each+" boxes for each site make "+t+" boxes."});}
  const g=wbFactor(2,5),s=wbFactor(4,9),t=g*s;return wbPicture(id,"What multiplication equation represents this picture?","Write the multiplication equation for the equal groups.",{kind:"circles",groups:g,size:s},wbEq("×",g,s,t),{explain:g+" groups of "+s+" equal "+t+"."});
}

function wbGen32(i){
  const id="3-2",slot=i%8,n=wbName();
  if(slot<4){const shapes=[[4,3],[7,2],[3,6],[4,5]],base=shapes[slot],r=Math.max(2,Math.min(10,base[0]+wbFactor(-1,1))),c=Math.max(2,Math.min(10,base[1]+wbFactor(-1,1))),t=r*c;return wbPicture(id,"What multiplication equation represents the array?","Write the multiplication equation for "+r+" rows and "+c+" columns.",{kind:"array",rows:r,cols:c},wbEq("×",r,c,t),{explain:"The array has "+r+" rows and "+c+" columns, for "+t+" dots."});}
  if(slot===4){const r=wbFactor(3,6),c=wbFactor(3,8),t=r*c,addition=Array(r).fill(c).join(" + ");const p=wbPicture(id,"How can you draw an array to represent "+addition+" = "+t+"?","Build an array for "+r+" groups of "+c+".",null,wbEq("×",r,c,t),{model:{kind:"array",rows:r,cols:c},requireWork:true,instruction:"Build the array. You may turn it sideways.",explain:r+" rows of "+c+", or "+c+" rows of "+r+", have "+t+" dots."});p.allowTurn=true;p.allowEqTurn=true;return p;}
  if(slot===5){const r=wbFactor(3,7),c=wbFactor(3,8),t=r*c;return wbStory(id,n+"'s classroom has "+r+" rows of desks with "+c+" desks in each row. How many desks are in the classroom?",n+"'s classroom has "+r+" rows with "+c+" desks in each row. How many desks are there?",wbEq("×",r,c,t),t,"desks",{kind:"array",rows:r,cols:c},{requireWork:true,instruction:"Draw an array, write an equation, and solve.",explain:r+" rows of "+c+" desks make "+t+" desks."});}
  if(slot===6){const r=wbFactor(3,6),c=wbFactor(3,8),t=r*c,p=wbStory(id,n+" has a muffin tin with "+r+" rows and "+c+" cups in each row. What array and equation show how many muffins the tin can hold?",n+" has a muffin tin with "+r+" rows of "+c+". How many muffins can it hold?",wbEq("×",r,c,t),t,"muffins",{kind:"array",rows:r,cols:c},{requireWork:true,instruction:"Build the array, write an equation, and solve.",explain:r+" rows of "+c+" cups hold "+t+" muffins."});p.visual={kind:"array",rows:r,cols:c};return p;}
  const r=wbFactor(2,8),c=wbFactor(2,8),t=r*c;return wbPicture(id,"Write an equation for the dot array.","Write an equation for "+r+" rows of "+c+" dots.",{kind:"array",rows:r,cols:c},wbEq("×",r,c,t),{explain:r+" times "+c+" equals "+t+"."});
}

function wbGen33(i){
  const id="3-3",slot=i%8,n=wbName();
  if(slot<4){const a=wbFactor(2,8);let b=wbFactor(2,8);while(b===a)b=wbFactor(2,8);const t=a*b;return wbPair(id,"Draw representations to show that "+a+" × "+b+" and "+b+" × "+a+" have equal products.","Build an array for "+a+" times "+b+" and another for "+b+" times "+a+".",[{kind:"array",rows:a,cols:b},{kind:"array",rows:b,cols:a}],t,{explain:a+" × "+b+" and "+b+" × "+a+" both equal "+t+"."});}
  if(slot===4){const a=wbFactor(2,9),b=wbFactor(2,9),t=a*b,p=wbBase(id,"who","Do "+a+" × "+b+" and "+b+" × "+a+" have the same product? Choose yes or no, then enter the product.","Do "+a+" times "+b+" and "+b+" times "+a+" have the same product?");p.people=["Yes","No"];p.answer={person:"Yes",value:t};p.valueAnswer=t;p.unit="product";p.explain="Yes. Changing the order of the factors does not change the product. Both equations equal "+t+".";return p;}
  if(slot===5){const a=wbFactor(3,7);let b=wbFactor(3,8);while(b===a)b=wbFactor(3,8);const t=a*b,first=wbName();let second=wbName();while(second===first)second=wbName();return wbPair(id,first+" has "+a+" packs of "+b+" pens. "+second+" has "+b+" packs of "+a+" pens. Build both sets, write both equations, and decide who has more.",first+" has "+a+" packs of "+b+" pens. "+second+" has "+b+" packs of "+a+" pens.",[{kind:"groups",groups:a,size:b,label:first},{kind:"groups",groups:b,size:a,label:second}],t,{equations:[wbEq("×",a,b,t),wbEq("×",b,a,t)],people:[first,second,"Same"],compareAnswer:"Same",instruction:"Build both sets of equal groups. Then write both equations and the shared product.",explain:"Both arrangements have "+t+" pens, so neither person has more."});}
  if(slot===6){const cases=[[6,4,4,6],[8,5,5,8],[9,4,6,6],[7,6,6,7]],v=wbPick(cases),first=v[0],feet=v[1],second=v[2],each=v[3],total=first*feet;return wbStory(id,n+" cuts "+first+" pieces of rope that are each "+feet+" feet long. A friend cuts "+second+" equal pieces with the same total length. How long is each friend's piece?",n+" cuts "+first+" pieces, each "+feet+" feet long. The same total is split into "+second+" pieces. How long is each piece?",wbEq("÷",total,second,each),each,"feet",{kind:"groups",groups:second,size:each},{explain:first+" × "+feet+" = "+total+", and "+total+" ÷ "+second+" = "+each+"."});}
  const a=wbFactor(3,8);let b=wbFactor(3,9);while(b===a)b=wbFactor(3,9);const t=a*b,p=wbPicture(id,n+" sets up "+t+" chairs in "+a+" equal rows of "+b+". Build another equal-row array and write an equation for it.","Build another array for "+t+" chairs.",{kind:"array",rows:a,cols:b},wbEq("×",b,a,t),{model:{kind:"array",rows:b,cols:a},requireWork:true,instruction:"Turn the array to make a different arrangement.",explain:b+" rows of "+a+" is another equal-row arrangement for "+t+" chairs."});p.allowEqTurn=true;return p;
}

function wbGen34(i){
  const id="3-4",divisor=wbFactor(2,8),quotient=wbFactor(2,9),total=divisor*quotient,p=wbFill(id,[total,"÷",divisor,"=","□"],quotient,total+" divided by "+divisor+" equals what number?","Share "+total+" equally among "+divisor+" groups. Each group gets "+quotient+".");p.q="Draw a representation for "+total+" ÷ "+divisor+" and complete the equation.";p.model={kind:"groups",groups:divisor,size:quotient};p.requireWork=true;p.instruction="Build "+divisor+" equal groups using all "+total+" counters. Then type the quotient.";return p;
}

function wbGen35(i){
  const id="3-5",slot=i%8,n=wbName();
  if(slot===0||slot===6){
    const size=wbFactor(2,8),groups=wbFactor(2,5),total=size*groups,kind=slot===0?"circles":"eggs";
    return wbPicture(id,"What division equation represents the equal grouping?","What division equation represents these equal groups?",{kind:kind,groups:groups,size:size},wbEq("÷",total,size,groups),{explain:total+" objects are arranged in groups of "+size+", so there are "+groups+" groups."});
  }
  if(slot===1){
    const size=wbFactor(3,7),groups=wbFactor(2,4),total=size*groups;
    return wbPicture(id,"What division equation represents the bowls?","Write the division equation shown by the bowls.",{kind:"bowls",groups:groups,size:size},wbEq("÷",total,size,groups),{explain:"There are "+total+" apples, with "+size+" in each bowl, making "+groups+" bowls."});
  }
  if(slot===2){
    const groups=wbFactor(3,6),each=wbFactor(2,8),total=groups*each;
    return wbStory(id,n+" has "+total+" ribbons to share equally among "+groups+" classmates. How many ribbons does each classmate get?",n+" has "+total+" ribbons to share equally among "+groups+" classmates. How many does each get?",wbEq("÷",total,groups,each),each,"ribbons",{kind:"groups",groups:groups,size:each},{explain:"Sharing "+total+" equally among "+groups+" classmates puts "+each+" ribbons in each group."});
  }
  if(slot===3||slot===5){
    const each=wbFactor(2,7),groups=wbFactor(3,8),total=each*groups,item=slot===3?"markers":"storybooks",people=slot===3?"teams":"shelves";
    return wbStory(id,n+" has "+total+" "+item+". "+n+" puts "+each+" on each of several "+people+". How many "+people+" are needed?",n+" has "+total+" "+item+" and puts "+each+" in each group. How many groups are needed?",wbEq("÷",total,each,groups),groups,people,{kind:"groups",groups:groups,size:each},{requireWork:true,explain:total+" divided into groups of "+each+" makes "+groups+" groups."});
  }
  if(slot===4){
    const workers=wbFactor(3,6),each=wbFactor(3,9),rem=wbFactor(1,workers-1),total=workers*each+rem;
    return wbStory(id,"A garden has "+total+" flowerpots to water. If "+workers+" helpers each water the same number, how many can each helper water and how many are left over?","There are "+total+" flowerpots and "+workers+" helpers. How many can each helper water, and how many are left over?",wbEq("÷",total,workers,each),each,"pots each",{kind:"groups",groups:workers,size:each},{remainder:rem,remainderUnit:"pots left over",explain:workers+" groups of "+each+" use "+(workers*each)+" pots, leaving "+rem+"."});
  }
  const each=wbFactor(2,6),groups=wbFactor(3,7),total=each*groups;
  return wbStory(id,n+" packs "+total+" muffins with "+each+" muffins on each tray. How many trays are needed? Justify your answer.",n+" packs "+total+" muffins with "+each+" on each tray. How many trays are needed?",wbEq("÷",total,each,groups),groups,"trays",{kind:"groups",groups:groups,size:each},{requireWork:true,instruction:"Draw a representation. Write an equation, solve, and justify your answer.",explain:groups+" groups of "+each+" use all "+total+" muffins."});
}

function wbGen36(i){
  const id="3-6",slot=i%8,n=wbName();
  if(slot===0){const g=wbFactor(2,5),s=wbFactor(2,6),t=g*s;return wbPicture(id,"Draw equal groups for the equations.","Draw "+g+" equal groups of "+s+".",null,wbEq("×",g,s,t),{model:{kind:"groups",groups:g,size:s},requireWork:true,instruction:"Draw equal groups for "+g+" groups of "+s+" equals "+t+" and "+t+" divided by "+g+" equals "+s+".",explain:g+" groups with "+s+" in each have "+t+" objects."});}
  if(slot===1){const r=wbFactor(2,5),c=wbFactor(2,7),t=r*c;return wbPicture(id,"Draw an array for the equations.","Draw an array with "+r+" rows and "+c+" columns.",null,wbEq("×",r,c,t),{model:{kind:"array",rows:r,cols:c},requireWork:true,instruction:"Draw an array for "+r+" times "+c+" equals "+t+" and "+t+" divided by "+r+" equals "+c+".",explain:"An array with "+r+" rows and "+c+" columns has "+t+" dots."});}
  if(slot===2){const r=wbFactor(2,5),c=wbFactor(3,7),t=r*c,p=wbPicture(id,"What multiplication and division equations can you write for the array?","Write a multiplication equation and a related division equation for the array.",{kind:"array",rows:r,cols:c},wbEq("×",r,c,t),{explain:"The array has "+r+" rows of "+c+", so "+r+" times "+c+" equals "+t+". The related division fact is "+t+" divided by "+r+" equals "+c+"."});p.extraEq=wbEq("÷",t,r,c);p.answer.eq2=p.extraEq.values.slice();return p;}
  if(slot===3){const g=wbFactor(4,10),s=wbFactor(2,9),t=g*s;return wbStory(id,n+" sorts "+t+" craft sticks equally into "+g+" cups. How many craft sticks go in each cup?",n+" sorts "+t+" craft sticks equally into "+g+" cups. How many go in each cup?",wbEq("÷",t,g,s),s,"craft sticks",{kind:"array",rows:g,cols:s},{explain:"The related multiplication fact is "+g+" times "+s+" equals "+t+"."});}
  if(slot===4){const a=wbFactor(12,35),b=wbFactor(8,25),per=wbFactor(3,9),sum=Math.ceil((a+b)/per)*per;const aa=Math.max(8,sum-b);return wbStory(id,n+" has "+aa+" red beads and "+b+" blue beads. "+n+" uses "+per+" beads for each key ring. How many key rings can be made?",n+" combines "+aa+" red beads and "+b+" blue beads, then uses "+per+" for each key ring. How many key rings?",wbEq("÷",aa+b,per,(aa+b)/per),(aa+b)/per,"key rings",{kind:"groups",groups:(aa+b)/per,size:per},{explain:"First add: "+aa+" plus "+b+" equals "+(aa+b)+". Then divide by "+per+" to get "+((aa+b)/per)+" key rings."});}
  if(slot===5){const a=wbFactor(2,8),b=wbFactor(2,9),t=a*b;return wbFill(id,[t,"÷",a,"=","□"],b,t+" divided by "+a+" equals what number?","Because "+a+" times "+b+" equals "+t+", "+t+" divided by "+a+" equals "+b+".");}
  if(slot===6){const a=wbFactor(2,8),b=wbFactor(2,9),t=a*b;return wbPicture(id,"Use an array to show the related facts.","Build an array for "+a+" times "+b+".",null,wbEq("×",a,b,t),{model:{kind:"array",rows:a,cols:b},requireWork:true,instruction:"Build or draw an array, then write the multiplication equation.",explain:a+" rows of "+b+" make "+t+". So "+t+" divided by "+a+" equals "+b+"."});}
  const g=wbFactor(3,8),s=wbFactor(2,9),t=g*s;return wbStory(id,n+" shares "+t+" sheets of paper equally among "+g+" students. Use a related multiplication fact to find how many sheets each student gets.",n+" shares "+t+" sheets equally among "+g+" students. How many does each get?",wbEq("÷",t,g,s),s,"sheets",{kind:"groups",groups:g,size:s},{explain:g+" times "+s+" equals "+t+", so "+t+" divided by "+g+" equals "+s+"."});
}

function wbGen37(i){
  const id="3-7",slot=i%10,n=wbName();
  if(slot<3){const a=wbFactor(2,9),b=wbFactor(2,9),t=a*b,pos=slot%3;if(pos===0)return wbFill(id,[a,"×","□","=",t],b,a+" times what number equals "+t+"?","Divide "+t+" by "+a+" to get "+b+".");if(pos===1)return wbFill(id,["□","×",b,"=",t],a,"What number times "+b+" equals "+t+"?","The missing number is "+a+" because "+a+" times "+b+" equals "+t+".");return wbFill(id,[t,"=","□","×",b],a,t+" equals what number times "+b+"?","Read the equation in either direction: "+a+" times "+b+" equals "+t+".");}
  if(slot===3){const g=wbFactor(3,8),s=wbFactor(2,9),t=g*s;return wbStory(id,n+" has "+t+" plates and places an equal number at "+g+" picnic tables. How many plates should be placed at each table?",n+" shares "+t+" plates among "+g+" tables. How many at each table?",wbEq("÷",t,g,s),s,"plates at each table",{kind:"groups",groups:g,size:s},{requireWork:true,explain:t+" divided by "+g+" equals "+s+". Equal groups use × or ÷, not +: "+g+" × "+s+" = "+t+"."});}
  if(slot===4){const plants=wbFactor(3,8),each=wbFactor(3,9),t=plants*each;return wbStory(id,n+" has "+t+" ounces of water to divide equally among "+plants+" plants. How much water does each plant get?",n+" divides "+t+" ounces of water among "+plants+" plants. How much for each plant?",wbEq("÷",t,plants,each),each,"ounces for each plant",{kind:"groups",groups:plants,size:each},{requireWork:true,explain:t+" divided by "+plants+" equals "+each+" ounces for each plant."});}
  if(slot===5||slot===8){const mates=wbFactor(3,7),people=mates+1,each=wbFactor(3,9),t=people*each;const q=slot===5?n+" and "+mates+" teammates each sell the same number of shirts to raise money. Together they sell "+t+" shirts. How many shirts does each person sell?":n+" and "+mates+" friends share "+t+" stickers equally. How many stickers does each person get?";const u=slot===5?"shirts each":"stickers each";return wbStory(id,q,q,wbEq("÷",t,people,each),each,u,{kind:"groups",groups:people,size:each},{requireWork:true,explain:"Count "+n+" too: "+mates+(slot===5?" teammates":" friends")+" plus "+n+" makes "+people+" people, not "+mates+". "+t+" divided by "+people+" is "+each+"."});}
  if(slot===6){const a=wbFactor(2,7),b=wbFactor(2,9),t=a*b,pr=wbN2(),first=pr[0],second=pr[1],ci=wbRand(2),people=[first,second];const says=ci===0?[b,t]:[t,b];const p=wbBase(id,"who",first+" and "+second+" need to find the number that makes this equation true: "+t+" = "+a+" × □. "+first+" says it is "+says[0]+". "+second+" says it is "+says[1]+". Who do you agree with? Draw a representation to support your answer.","Who do you agree with about "+t+" equals "+a+" times what number?");p.people=people;p.answer=people[ci];p.model={kind:"groups",groups:a,size:b};p.requireWork=true;p.eq=wbEq("×",a,b,t);p.explain=people[ci]+" is right. "+a+" groups of "+b+" make "+t+", so the unknown is "+b+". The other answer is the total, not the number in each group.";return p;}
  if(slot===7){const a=wbFactor(2,9),b=wbFactor(2,9),t=a*b;const p=wbPicture(id,"Find the unknown: "+a+" × □ = "+t+".",a+" times what number equals "+t+"?",null,wbEq("×",a,b,t),{model:{kind:"groups",groups:a,size:b},requireWork:true,instruction:"Draw a representation, then complete the equation.",explain:a+" equal groups need "+b+" in each group to make "+t+"."});p.allowEqTurn=true;return p;}
  const cups=wbFactor(3,8),each=wbFactor(2,9),t=cups*each,things=wbPick(["beans","pennies","buttons"]);return wbStory(id,n+" shares "+t+" "+things+" equally into "+cups+" cups. How many "+things+" go in each cup?",n+" shares "+t+" "+things+" into "+cups+" cups equally. How many in each cup?",wbEq("÷",t,cups,each),each,things+" in each cup",{kind:"groups",groups:cups,size:each},{requireWork:true,explain:t+" divided by "+cups+" equals "+each+"."});
}

function wbGen41(i){
  const id="4-1",slot=i%10,n=wbName();
  if(slot<4){const f=wbFactor(1,10),t=2*f,pos=slot;if(pos===0)return wbFill(id,[2,"×","□","=",t],f,"Two times what number equals "+t+"?","Double "+f+" is "+t+".");if(pos===1)return wbFill(id,["□","=",f,"×",2],t,"What number equals "+f+" times 2?",f+" plus "+f+" equals "+t+".");if(pos===2)return wbFill(id,["□","×",2,"=",t],f,"What number times 2 equals "+t+"?","The missing factor is "+f+".");return wbFill(id,[t,"=","□","×",2],f,t+" equals what number times 2?","Read it backward as "+f+" times 2 equals "+t+".");}
  if(slot===4){for(let k=0;k<50;k++){const a=wbFactor(1,9),b=wbFactor(3,9),c=wbFactor(1,9),d=wbFactor(2,9);const p=wbMultiAuto(id,["2 × "+a+" = "+a+" + "+a,"2 × "+b+" = "+b+" + 2","2 × "+c+" = "+c+" + "+c,"2 × "+d+" = "+d+" + "+d+" + "+d],null,"Choose all the equations that are true.",2);if(p)return p;}}
  if(slot===5){const vals=wbShuffle([1,2,3,4,5,6,7,8,9,10]).slice(0,3);const items=vals.map((v,k)=>({left:(k%2?"□ × 2 = ":"2 × □ = ")+(2*v),right:v+" + "+v}));return wbMatchRights(id,"Type the number of the matching addition fact.","Match each multiplication equation to the related addition equation.",items);}
  if(slot===6){const pool=[["roses","two cousins"],["balloons","two neighbors"],["cookies","two classmates"],["apples","two teachers"],["stickers","two friends"]],pr=wbPick(pool),v=wbFactor(2,9);return wbForm(id,n+" wants to buy "+pr[0]+" for "+pr[1]+" and give both the same number, from 1 to 10 each. How can you use two equations to represent how many "+pr[0]+" "+n+" might buy? Explain your answer.","How can you use two equations to represent how many "+pr[0]+" might be bought? Explain.",["Addition equation: {t:e1}","Multiplication equation: {t:e2}","Explain: because {t:r}"],[{k:"r",t:"reason",keys:WB_R.dbl}],{kind:"twoEq",keys:["e1","e2"],fixedCount:2},{e1:v+" + "+v+" = "+2*v,e2:"2 × "+v+" = "+2*v,r:"both get the same so it doubles"},"Both people get the same number, so you double it: "+v+" + "+v+" = "+2*v+" and 2 × "+v+" = "+2*v+". Any number from 1 to 10 works if both equations have the same total.",["For example: "+v+" + "+v+" = "+2*v+" and 2 × "+v+" = "+2*v,"Any number added to itself (n + n) equals 2 × n."]);}
  if(slot===7){const pool=[["tablespoons of salt","gallon of water","gallons of water"],["cups of flour","batch of dough","batches of dough"],["scoops of soil","pot","pots"],["spoons of sugar","jar","jars"]],pr=wbPick(pool),g=wbFactor(3,10);return wbMulStory(id,"For a project, 2 "+pr[0]+" are needed for every "+pr[1]+". How many "+pr[0]+" will be needed for "+g+" "+pr[2]+"?","2 "+pr[0]+" for every "+pr[1]+". How many for "+g+" "+pr[2]+"?",g,2,pr[0]+" will be needed",g+" groups of 2: double "+g+" is "+2*g+". Use ×, not +: "+g+" × 2 = "+2*g+".");}
  if(slot===8){const pool=[["seeds","pot"],["stickers","card"],["candles","cake"],["pencils","box"]],pr=wbPick(pool),k=wbFactor(2,8),t=2*k;return wbForm(id,n+" is putting 2 "+pr[0]+" in each of 2 to 10 "+(pr[1]==="box"?"boxes":pr[1]+"s")+". How can you write two equations to represent how many "+pr[0]+" "+n+" might need?","Write two equations for putting 2 "+pr[0]+" in each "+pr[1]+".",["Addition equation: {t:e1}","Multiplication equation: {t:e2}"],[],{kind:"twoEq",keys:["e1","e2"],fixedValue:2},{e1:Array(k).fill(2).join(" + ")+" = "+t,e2:k+" × 2 = "+t},"With "+k+" "+(pr[1]==="box"?"boxes":pr[1]+"s")+": "+Array(k).fill(2).join(" + ")+" = "+t+" and "+k+" × 2 = "+t+". Any number from 2 to 10 works if both equations show the same total.",["For example: "+Array(k).fill(2).join(" + ")+" = "+t+" and "+k+" × 2 = "+t]);}
  const pool=[["pencils","student","students"],["markers","artist","artists"],["crayons","child","children"]],pr=wbPick(pool),g=wbFactor(3,10);return wbMulStory(id,"For a project, each "+pr[1]+" needs 2 "+pr[0]+". How many "+pr[0]+" will be needed for "+g+" "+pr[2]+"?","Each "+pr[1]+" needs 2 "+pr[0]+". How many for "+g+" "+pr[2]+"?",g,2,pr[0]+" will be needed",g+" × 2 = "+2*g+". Doubling "+g+" gives "+2*g+".");
}

function wbGen42(i){
  const id="4-2",slot=i%10,n=wbName();
  if(slot<4){const f=wbFactor(1,10),t=5*f;if(slot===0){const p=wbFill(id,[5,"×","□","=",t],f,"Five times what number equals "+t+"?","Count by 5 "+f+(f===1?" time":" times")+" to reach "+t+".");p.model={kind:"groups",groups:f,size:5};return p;}if(slot===1)return wbFill(id,[5,"×",f,"=","□"],t,"Five times "+f+" equals what number?","The product is "+t+"; products of 5 end in 0 or 5.");if(slot===2)return wbFill(id,["□","×",5,"=",t],f,"What number times 5 equals "+t+"?","The missing factor is "+f+".");const h=wbFactor(2,9);return wbFillT(id,[h,"×",5,"=","□"],5*h,h+" hands have 5 fingers each. How many fingers?","Each hand has 5 fingers. "+h+" × 5 = "+5*h+".",h+" hands have 5 fingers each. How many fingers are there? Complete the fact.");}
  if(slot===4){for(let k=0;k<80;k++){const a=wbFactor(2,9),b=wbFactor(2,9),c=wbFactor(3,9),d=wbFactor(2,9);const p=wbMultiAuto(id,["5 × "+a+" = "+Array(a).fill("5").join(" + "),"5 × "+b+" = "+5*b,"5 × "+c+" = "+Array(c-1).fill("5").join(" + "),"5 × "+d+" = 5 + "+d],null,"Choose all the equations that are true.",5);if(p)return p;}}
  if(slot===5){for(let k=0;k<80;k++){const m=wbFactor(3,7);const p=wbMultiAuto(id,["5 × "+m+" = "+Array(m).fill("5").join(" + "),"5 × "+m+" = "+Array(m+1).fill("5").join(" + "),"5 × "+m+" = "+Array(m-1).fill("5").join(" + "),"5 × "+m+" = 5 + "+m],"Which equation is true?","Choose the one equation that is true.",5);if(p&&p.answer.length===1)return p;}}
  if(slot===6){const a=wbPick([2,3,4,6,7,8,9]),t=5*a;return wbForm(id,"How does knowing 5 × "+a+" help you remember "+a+" × 5?","How does knowing 5 times "+a+" help you remember "+a+" times 5?",[a+" × 5 = {n:p}","Because {t:r}"],[{k:"p",t:"num",want:t},{k:"r",t:"reason",keys:WB_R.order.concat([String(t)])}],null,{p:String(t),r:"the order does not change the product"},"You can multiply in either order: 5 × "+a+" = "+t+" and "+a+" × 5 = "+t+". The product stays the same.",[a+" × 5 = "+t,"The order of the factors does not change the product."]);}
  if(slot===7){const pool=[["toy cars","row"],["books","stack"],["cards","pack"],["stickers","sheet"]],pr=wbPick(pool);return wbForm(id,n+" is organizing "+pr[0]+" into 2 to 10 "+pr[1]+"s. Each "+pr[1]+" has 5 "+pr[0]+". How many "+pr[0]+" could "+n+" have in all? Explain.","Each "+pr[1]+" has 5 "+pr[0]+". How many could there be in all? Explain.",["{n:v} "+pr[0]+" in all","Because {t:r}"],[{k:"v",t:"mult",of:5,min:10,max:50},{k:"r",t:"reason",keys:WB_R.five}],null,{v:"20",r:"I counted by 5s"},"Any multiple of 5 from 10 to 50 works (10, 15, … 50) because every "+pr[1]+" has 5 and products of 5 end in 0 or 5.",["Any multiple of 5 from 10 to 50, for example 20.","Reason: count by 5s / groups of 5."]);}
  if(slot===8){const k=wbFactor(2,9),pool=[["fiction books","books"],["comic books","comics"],["picture books","picture books"]],pr=wbPick(pool);return wbMulStory(id,n+" has 5 piles of "+pr[0]+". Each pile has "+k+" "+pr[1]+". How many "+pr[0]+" does "+n+" have?",n+" has 5 piles with "+k+" in each pile. How many in all?",5,k,pr[0]+" in all","5 groups of "+k+" make "+5*k+". Count by 5s: "+k+" × 5 = "+5*k+".");}
  const k=wbFactor(2,9),pool=[["apple","apples","bags"],["orange","oranges","crates"],["pear","pears","baskets"]],pr=wbPick(pool);return wbMulStory(id,"A fruit stand has 5 "+pr[2]+" of "+pr[1]+". There are "+k+" "+pr[1]+" in each. How many "+pr[1]+" are at the stand?","5 "+pr[2]+" with "+k+" "+pr[1]+" each. How many in all?",5,k,pr[1]+" at the stand","5 groups of "+k+" make "+5*k+". Products of 5 end in 0 or 5.");
}

function wbGen43(i){
  const id="4-3",slot=i%10,n=wbName();
  const fillAt=pos=>{const a=wbFactor(2,9),b=wbFactor(2,9);if(pos===0)return wbFill(id,["□","=",a,"×",10],10*a,"What number equals "+a+" times 10?",a+" × 10 = "+10*a+": put a 0 after "+a+".");if(pos===1)return wbFill(id,[10,"×","□","=",10*b],b,"Ten times what number equals "+10*b+"?","10 × "+b+" = "+10*b+".");if(pos===2)return wbFill(id,["□","×",10,"=",10*b],b,"What number times 10 equals "+10*b+"?","The missing factor is "+b+".");return wbFill(id,[a,"×",10,"=","□"],10*a,a+" times 10 equals what number?",a+" tens make "+10*a+".");};
  if(slot===0){const k=wbFactor(2,9),th=wbPick(["crayons","pencils","stickers","markers"]),st=wbPick([["set","sets"],["pack","packs"],["box","boxes"]]),set=st[0];return wbForm(id,n+" has "+k+" "+st[1]+" of "+th+". There are 10 "+th+" in each "+set+". What pattern can you use to find the total number of "+th+"?","What pattern can you use to find the total number of "+th+"?",["Pattern: skip count by {n:p}s","Total: {n:t} "+th],[{k:"p",t:"num",want:10},{k:"t",t:"num",want:10*k}],null,{p:"10",t:String(10*k)},"Count by 10s "+k+" times: "+k+" × 10 = "+10*k+". Use × here, not +.",["Skip count by 10s","Total: "+k+" × 10 = "+10*k]);}
  if(slot===1){const b=wbFactor(6,11),pool=[["baskets","fruit","apples"],["shelves","books","books"],["boxes","toys","toys"]],pr=wbPick(pool);return wbForm(id,n+" has 10 "+pr[0]+" of "+pr[1]+". Each one has the same number of "+pr[2]+". Each one has at least 1 and fewer than "+b+" "+pr[2]+". How many "+pr[2]+" could "+n+" have? Explain.","Ten "+pr[0]+" with the same number in each, at least 1 and fewer than "+b+" in each. How many could there be? Explain.",["{n:v} "+pr[2],"Because {t:r}"],[{k:"v",t:"mult",of:10,min:10,max:10*(b-1)},{k:"r",t:"reason",keys:WB_R.ten}],null,{v:"20",r:"10 groups of 2"},"Each of the 10 "+pr[0]+" holds 1 to "+(b-1)+", so the total is 10 × (1 to "+(b-1)+"): any multiple of 10 up to "+10*(b-1)+".",["Any multiple of 10 from 10 to "+10*(b-1)+", for example 30.","Reason: 10 groups of the same number."]);}
  if(slot===2){for(let k=0;k<200;k++){const t1=wbFactor(2,9),c=wbPick([2,3,4]),pr=c===2?[4,5]:c===3?[5,6]:[5,8],x=wbFactor(2,9),t2=wbFactor(2,9),m=wbFactor(2,9);const p=wbMultiAuto(id,[Array(t1).fill("10").join(" + ")+" = 10 × "+t1,pr[0]+" × "+pr[1]+" = "+c+" × 10",x+" × 5 = "+x+" × 10",Array(t2).fill("10").join(" + ")+" = 10 × "+m],null,"Choose all the equations that are true.",10);if(p)return p;}}
  if(slot===3){for(let k=0;k<300;k++){const a=wbFactor(2,9),b=wbFactor(2,9),m=wbFactor(2,9),c=wbFactor(2,9),d=wbFactor(2,9),e=wbFactor(2,9);const vals=[10*a,b,10,10*c,d,10*e];if(new Set(vals).size!==6)continue;return wbMatchNumbers(id,"Type the number that makes each equation true.","Type the number that makes each equation true.",[{left:"□ = "+a+" × 10",value:10*a},{left:"10 × □ = "+10*b,value:b},{left:m+" × □ = "+10*m,value:10},{left:"□ = "+c+" × 10",value:10*c},{left:"□ × 10 = "+10*d,value:d},{left:e+" × 10 = □",value:10*e}]);}}
  if(slot===4){const k=wbFactor(2,9);return wbForm(id,"What number is in the ones place of a product of 10 and another number, such as "+k+" × 10? Explain.","What number is in the ones place of a product of 10 and another number? Explain.",["Ones place: {n:p}","Because {t:r}"],[{k:"p",t:"num",want:0},{k:"r",t:"reason",keys:WB_R.ones}],null,{p:"0",r:"multiples of 10 end in 0"},"Every product of 10 ends in 0: "+k+" × 10 = "+10*k+". The ones place is 0.",["Ones place: 0","Products of 10 always end in 0."]);}
  if(slot===5){const a=wbFactor(2,9);return wbForm(id,"How does knowing "+a+" × 5 help you remember "+a+" × 10?","How does knowing "+a+" times 5 help you remember "+a+" times 10?",[a+" × 10 = {n:p}","Because {t:r}"],[{k:"p",t:"num",want:10*a},{k:"r",t:"reason",keys:WB_R.dbl.concat(["10","ten"])}],null,{p:String(10*a),r:"it is double"},a+" × 10 is double "+a+" × 5: "+5*a+" + "+5*a+" = "+10*a+".",[a+" × 10 = "+10*a,a+" × 10 is double "+a+" × 5 ("+5*a+" + "+5*a+")."]);}
  if(slot===6){const k=wbFactor(2,9),pool=[["laps","bikes"],["pages","reads"],["jumps","does"],["minutes","practices"]],pr=wbPick(pool);return wbMulStory(id,n+" "+pr[1]+" 10 "+pr[0]+" each day. How many "+pr[0]+" in "+k+" days?",n+" "+pr[1]+" 10 "+pr[0]+" each day for "+k+" days. How many in all?",k,10,pr[0]+" in all",k+" days of 10 make "+k+" × 10 = "+10*k+". Skip count by 10s.",{kind:"array",rows:k,cols:10});}
  if(slot===7){const k=wbFactor(2,9);return wbMulStory(id,"A dime is worth 10 cents. How many cents are in "+k+" dimes?","A dime is worth 10 cents. How many cents are in "+k+" dimes?",k,10,"cents in all",k+" dimes × 10 cents = "+10*k+" cents. Count by 10s: 10, 20, 30, …",{kind:"array",rows:k,cols:10});}
  return fillAt(wbRand(4));
}

function wbGen44(i){
  const id="4-4",slot=i%10,n=wbName();
  if(slot<3){const k=wbFactor(2,9);const forms=[
    ()=>wbFill(id,[k,"×",1,"=","□"],k,k+" times 1 equals what number?","Any number multiplied by 1 equals itself."),
    ()=>wbFill(id,[k,"=",1,"×","□"],k,k+" equals 1 times what number?","1 times a number is that number."),
    ()=>wbFill(id,["□","×",1,"=",k],k,"What number times 1 equals "+k+"?","Any number times 1 is itself."),
    ()=>wbFill(id,[k,"×","□","=",k],1,k+" times what number equals "+k+"?","Multiplying by 1 keeps the number the same."),
    ()=>wbFill(id,["□","=",0,"×",k],0,"What number equals 0 times "+k+"?","Any number multiplied by 0 equals 0."),
    ()=>wbFill(id,[0,"×",k,"=","□"],0,"0 times "+k+" equals what number?","Zero groups of "+k+" is 0."),
    ()=>wbFill(id,[0,"=","□","×",k],0,"0 equals what number times "+k+"?","Only 0 times "+k+" makes 0."),
    ()=>wbFill(id,["□","×",k,"=",0],0,"What number times "+k+" equals 0?","0 × "+k+" = 0.")];
    const sets=[[0,1,2,3],[4,5,6,7],[0,1,2,3,4,5,6,7]];return forms[wbPick(sets[slot])]();}
  if(slot===3){const pool=[["strawberries","containers"],["grapes","bowls"],["crackers","boxes"],["marbles","bags"]],pr=wbPick(pool),k=wbFactor(2,9),q=n+" has "+k+" "+pr[1]+". Each has 0 "+pr[0]+" in it. How many "+pr[0]+" are there in all?";return wbForm(id,q,q,["There are {n:a} "+pr[0]+" in all."],[{k:"a",t:"num",want:0}],null,{a:"0"},k+" groups of 0 make 0. Any number multiplied by 0 equals 0.",["0 "+pr[0]+" in all."]);}
  if(slot===4){for(let k=0;k<200;k++){const a=wbFactor(2,9),b=wbFactor(2,9),c=wbFactor(2,9),d=wbFactor(2,9),e=wbFactor(2,9),f=wbFactor(2,9);const p=wbMultiAuto(id,[a+" × 0 = "+a,e+" × 0 = "+b+" × 0",2*f+" × 1 = "+f+" × 2",c+" × 1 = "+c,d+" × 1 = "+d+" × 0"].sort(()=>Math.random()-.5).slice(0,4),null,"Choose all the equations that are true.",1);if(p)return p;}}
  if(slot===5){const k=wbFactor(2,10),pool=[["fish bowls","fish","pet store","fish"],["trays","muffin","bakery","muffins"],["vases","flower","shop","flowers"]],pr=wbPick(pool);return wbMulStory(id,"There are "+k+" "+pr[0]+" at a "+pr[2]+". There is 1 "+pr[1]+" in each. How many "+pr[3]+" are there?","There are "+k+" "+pr[0]+" with 1 "+pr[1]+" in each. How many "+pr[3]+" in all?",k,1,pr[3]+" in all",k+" groups of 1 make "+k+". Any number multiplied by 1 equals itself.",{kind:"bowls",groups:Math.min(k,10),size:1});}
  if(slot===6){const k=wbFactor(3,10),pool=[["pages","reads"],["laps","swims"],["points","scores"]],pr=wbPick(pool);return wbMulStory(id,n+" "+pr[1]+" 0 "+pr[0]+" each day for "+k+" days. How many "+pr[0]+" in "+k+" days?",n+" "+pr[1]+" 0 "+pr[0]+" each day for "+k+" days. How many in all?",k,0,pr[0]+" in all",k+" days of 0 is "+k+" × 0 = 0. Any number multiplied by 0 equals 0. Use ×, not +.");}
  if(slot===7){const pool=[["shirts","dancer","dancers"],["backpacks","student","students"],["caps","player","players"]],pr=wbPick(pool),k=wbFactor(2,12);return wbForm(id,n+" is ordering "+pr[0]+" for each "+pr[1]+" in a class. "+n+" orders the same number of "+pr[0]+" as "+pr[2]+". There are 30 or fewer "+pr[2]+". What equation could you write to describe the number of "+pr[0]+" "+n+" could order? Explain.","What equation describes the number of "+pr[0]+" ordered? Explain.",["Equation: {t:e}","Because {t:r}"],[{k:"r",t:"reason",keys:WB_R.one}],{kind:"oneEq",keys:["e"]},{e:k+" × 1 = "+k,r:"each one gets 1"},"One for each: number of "+pr[2]+" × 1 = the same number. For example "+k+" × 1 = "+k+". Any number multiplied by 1 equals itself.",["For example: "+k+" × 1 = "+k,"Any number from 1 to 30 × 1 = that same number."]);}
  if(slot===8){const a=wbFactor(2,9),mode=wbRand(3);let b=wbFactor(2,9),l,r,ans,keys;while(b===a)b=wbFactor(2,9);if(mode===0){l=a+" × 0";r=b+" × 0";ans="yes";}else if(mode===1){l=a+" × 1";r=b+" × 0";ans="no";}else{l=a+" × 1";r="1 × "+a;ans="yes";}const lv=mode===0?0:a,rv=mode===2?a:0;ans=lv===rv?"yes":"no";return wbForm(id,"Jordan says that "+l+" and "+r+" have the same product. Is Jordan correct? Explain.","Jordan says "+l+" and "+r+" have the same product. Is that correct? Explain.",["Answer (yes or no): {t:a}","Because {t:r}"],[{k:"a",t:"yn",want:ans},{k:"r",t:"reason",keys:ans==="no"?["0","zero","different","not",String(a)]:WB_R.same}],null,{a:ans,r:mode===0?"anything times 0 is 0":mode===1?"one is "+a+" and the other is 0":"same product in either order"},ans==="yes"?(mode===0?"Yes. "+l+" = 0 and "+r+" = 0, because any number multiplied by 0 equals 0.":"Yes. "+l+" = "+a+" and "+r+" = "+a+": the order does not change the product."):"No. "+l+" = "+a+" but "+r+" = 0. Multiplying by 1 keeps the number; multiplying by 0 gives 0.",[ans==="yes"?"Yes":"No",l+" = "+lv+" and "+r+" = "+rv]);}
  const k=wbFactor(2,9),th=wbPick([["cups","napkins"],["plates","spoons"]]);return wbForm(id,n+" sets the table for "+k+" people. Each person gets 1 "+th[0].slice(0,-1)+". Nobody needs "+th[1]+", so each person gets 0. How many "+th[0]+" and how many "+th[1]+" are needed in all?","Each of "+k+" people gets 1 "+th[0].slice(0,-1)+" and 0 "+th[1]+". How many of each in all?",[th[0]+": {n:c}",th[1]+": {n:s}"],[{k:"c",t:"num",want:k},{k:"s",t:"num",want:0}],null,{c:String(k),s:"0"},k+" × 1 = "+k+" "+th[0]+" and "+k+" × 0 = 0 "+th[1]+".",[th[0]+": "+k,th[1]+": 0"]);
}

function wbGen45(i){
  const id="4-5",slot=i%10,n=wbName();
  if(slot===0){const v=wbRand(3);if(v===0)return wbForm(id,"What word makes the statement true? Products of 2 are always ____.","Products of 2 are always what?",["Products of 2 are always {t:w}."],[{k:"w",t:"word",accept:["even","evens"]}],null,{w:"even"},"Products of 2 are even: they end in 0, 2, 4, 6 or 8.",["even"]);if(v===1)return wbForm(id,"What number makes the statement true? Products of 10 always have a ____ in the ones place.","Products of 10 always have what in the ones place?",["Products of 10 always have a {t:w} in the ones place."],[{k:"w",t:"word",accept:["0","zero"]}],null,{w:"0"},"A digit times 10 puts that digit in the tens place and 0 in the ones place.",["0"]);return wbForm(id,"What number makes the statement true? Products of 5 have a 0 or a ____ in the ones place.","Products of 5 have a 0 or what in the ones place?",["Products of 5 have a 0 or a {t:w} in the ones place."],[{k:"w",t:"word",accept:["5","five"]}],null,{w:"5"},"Products of 5 end in 0 or 5: 5, 10, 15, 20, …",["5"]);}
  if(slot===1){const m=wbFactor(2,9),P=10*m;return wbForm(id,"Find two numbers from 1 to 10 whose product is "+P+".","Fill in the two numbers whose product is "+P+".",[P+" is the product of {n:a} and {n:b}."],[],{kind:"pairprod",keys:["a","b"],product:P},{a:"10",b:String(m)},"Products of 10 end in 0. "+P+" = 10 × "+m+". Any two numbers (10 or less) that multiply to "+P+" also work.",["10 and "+m+" (either order)"]);}
  if(slot===2){const o=wbPick([3,5,7,9]),P=5*o;return wbForm(id,"By using number patterns, you can tell that "+P+" is a product of ____ because it has a 5 in the ones place.","What number is "+P+" a product of?",[P+" is a product of {n:a} because it has a 5 in the ones place."],[{k:"a",t:"num",want:5}],null,{a:"5"},"Products of 5 end in 0 or 5. "+P+" ends in 5, so it is a product of 5: 5 × "+o+" = "+P+".",["5"]);}
  if(slot===3){return wbForm(id,"What numbers make the statement true?","Fill in the blanks about a product of 0.",["0 is the product of {n:a} and {n:b} because any number multiplied by {n:c} is 0."],[],{kind:"zeroblank",keys:["a","b","c"]},{a:"0",b:String(wbFactor(1,9)),c:"0"},"Any number multiplied by 0 equals 0, so 0 is a product of 0 and any number.",["0 and any number; any number multiplied by 0 is 0."]);}
  if(slot===4){const M=wbFactor(6,10),pool=[["$5 bills","dollars"],["$5 gift cards","dollars"]],pr=wbPick(pool);return wbForm(id,n+" has some "+pr[0]+" in a wallet, fewer than "+M+" in all. How much money might "+n+" have?","Some "+pr[0]+", fewer than "+M+". How much money might there be?",["$ {n:v}"],[{k:"v",t:"mult",of:5,min:5,max:5*(M-1)}],null,{v:"20"},"Any multiple of 5 from $5 to $"+5*(M-1)+" works. Products of 5 end in 0 or 5.",["Any multiple of 5 from 5 to "+5*(M-1)+", for example 20."]);}
  if(slot===5){const N=wbFactor(11,49),th=wbPick(["socks","gloves","shoes"]),exs=wbPick([["A store employee","the employee"],["A clerk","the clerk"],["A shop helper","the helper"]]),ex=exs[0];const yn=N%2===0?"yes":"no";return wbForm(id,ex+" is making a display of pairs of "+th+". Can "+exs[1]+" use "+N+" "+th+" in all, with none left over? Explain.","Can "+N+" "+th+" make pairs with none left over? Explain.",["Answer (yes or no): {t:a}","Because {t:r}"],[{k:"a",t:"yn",want:yn},{k:"r",t:"reason",keys:WB_R.even}],null,{a:yn,r:N%2===0?"pairs make even numbers":"it is odd"},(yn==="yes"?"Yes. ":"No. ")+"Pairs make products of 2, and products of 2 are even. "+N+" is "+(N%2===0?"even":"odd")+".",[yn==="yes"?"Yes":"No",N+" is "+(N%2===0?"even":"odd")]);}
  if(slot===6){const M=wbFactor(5,9);return wbForm(id,n+" staples 10 sheets of paper together to make a packet. "+n+" makes at least 1 but fewer than "+M+" packets and uses all of the paper. How many sheets of paper could "+n+" have used? Explain how you know.","Packets of 10 sheets, fewer than "+M+" packets. How many sheets could be used? Explain.",["{n:v} sheets","Because {t:r}"],[{k:"v",t:"mult",of:10,min:10,max:10*(M-1)},{k:"r",t:"reason",keys:WB_R.ten}],null,{v:"30",r:"3 packets of 10"},"Each packet has 10 sheets, so the total is a multiple of 10 up to "+10*(M-1)+".",["Any multiple of 10 from 10 to "+10*(M-1)+", for example 30."]);}
  if(slot===7){const gen=wbRand(2)===0;const N=wbPick([10,20,30,40,50,60,70,80,90,15,25,35,45,12,14,16,18,22,24]);let q,yn,expl;if(gen){q="Can one number show up when you skip count by 2s, by 5s and by 10s? Explain.";yn="yes";expl="Yes. Numbers that end in 0, like 10 or 20, show up when you count by 2s, by 5s and by 10s.";}else{q="Does "+N+" show up when you skip count by 2s, by 5s and by 10s? Explain.";yn=N%10===0?"yes":"no";expl=(yn==="yes"?"Yes. "+N+" ends in 0, so you say it when you count by 2s, by 5s and by 10s.":"No. "+N+" ends in "+N%10+", so you skip it when you count by 10s. Only numbers that end in 0 are in all three counts.");}
    return wbForm(id,q,q,["Answer (yes or no): {t:a}","Because {t:r}"],[{k:"a",t:"yn",want:yn},{k:"r",t:"reason",keys:WB_R.mix}],null,{a:yn,r:yn==="yes"?"it ends in 0":"it does not end in 0"},expl,[yn==="yes"?"Yes":"No",expl]);}
  if(slot===8){const k=wbFactor(2,9),v=wbRand(3);if(v===0)return wbMulStory(id,n+" counts "+k+" five-dollar bills. How much money is that?",n+" counts "+k+" five dollar bills. How much money?",k,5,"dollars in all",k+" × 5 = "+5*k+". Products of 5 end in 0 or 5.");if(v===1)return wbMulStory(id,n+" has "+k+" nickels. A nickel is worth 5 cents. How many cents is that?",n+" has "+k+" nickels, 5 cents each. How many cents?",k,5,"cents in all",k+" × 5 = "+5*k+". Count by 5s.");return wbMulStory(id,n+" has "+k+" dimes. A dime is worth 10 cents. How many cents is that?",n+" has "+k+" dimes, 10 cents each. How many cents?",k,10,"cents in all",k+" × 10 = "+10*k+". Count by 10s.",{kind:"array",rows:k,cols:10});}
  const f=wbPick([2,5,10]),k=wbFactor(1,9),pr=f*k;return wbForm(id,"Write the product of "+f+" × "+k+". Then name the digit in the ones place.","What is "+f+" times "+k+"? What digit is in the ones place?",[f+" × "+k+" = {n:p}","Ones place digit: {n:d}"],[{k:"p",t:"num",want:pr},{k:"d",t:"num",want:pr%10}],null,{p:String(pr),d:String(pr%10)},f+" × "+k+" = "+pr+". The ones place is "+pr%10+". "+(f===2?"Products of 2 end in 0, 2, 4, 6 or 8.":f===5?"Products of 5 end in 0 or 5.":"Products of 10 end in 0.")+" Use × not +.",[f+" × "+k+" = "+pr,"Ones place: "+pr%10]);
}

function wbGenerate(lessonId,n){
  const count=n==null?8:Math.max(0,Math.floor(Number(n)||0)),fn={"3-1":wbGen31,"3-2":wbGen32,"3-3":wbGen33,"3-4":wbGen34,"3-5":wbGen35,"3-6":wbGen36,"3-7":wbGen37,"4-1":wbGen41,"4-2":wbGen42,"4-3":wbGen43,"4-4":wbGen44,"4-5":wbGen45}[lessonId];
  if(!fn)return[];const slots=WB_TEN.indexOf(lessonId)>=0?10:8,out=[],seen=new Set();
  for(let i=0;i<count;i++){let p,t=0,sig;do{p=fn(i);sig=wbSig(p);t++;}while(seen.has(sig)&&t<60);seen.add(sig);p.slot=i%slots;out.push(p);}
  return out;
}
function wbSameArray(a,b){if(!Array.isArray(a)||!Array.isArray(b)||a.length!==b.length)return false;return a.every((v,i)=>String(v)===String(b[i]));}
function wbEquationMatches(problem,got,want){if(wbSameArray(got,want))return true;return !!(problem.allowEqTurn&&Array.isArray(got)&&Array.isArray(want)&&got.length===3&&Number(got[0])===Number(want[1])&&Number(got[1])===Number(want[0])&&Number(got[2])===Number(want[2]));}
function wbCheck(problem,answer){
  if(!problem)return false;
  if(problem.type==="fill")return Number(answer&&answer.value!=null?answer.value:answer)===Number(problem.answer);
  if(problem.type==="multi"){const got=(Array.isArray(answer)?answer:(answer&&answer.selected)||[]).map(String).sort(),want=problem.answer.slice().map(String).sort();return wbSameArray(got,want);}
  if(problem.type==="picture"){const eq=Array.isArray(answer)?answer:(answer&&answer.eq);if(!wbEquationMatches(problem,eq,problem.answer.eq))return false;return !problem.answer.eq2||wbSameArray(answer&&answer.eq2,problem.answer.eq2);}
  if(problem.type==="form")return wbFormCheck(problem,(answer&&answer.f)||answer);
  if(problem.type==="story"){if(!answer||!wbEquationMatches(problem,answer.eq,problem.answer.eq)||Number(answer.value)!==Number(problem.answer.value))return false;return problem.answer.remainder==null||Number(answer.remainder)===Number(problem.answer.remainder);}
  if(problem.type==="who"){const person=answer&&answer.person!=null?answer.person:answer,expected=problem.answer&&problem.answer.person!=null?problem.answer.person:problem.answer;if(String(person)!==String(expected))return false;const value=problem.answer&&problem.answer.value!=null?problem.answer.value:problem.valueAnswer;return value==null||Number(answer&&answer.value)===Number(value);}
  if(problem.type==="match"){const got=(answer&&answer.pairs)||answer;if(!Array.isArray(got))return false;const norm=x=>x.map(p=>Array.isArray(p)?p.join(":"):String(p)).sort();return wbSameArray(norm(got),norm(problem.answer));}
  if(problem.type==="pair"){if(!answer||Number(answer.product)!==Number(problem.answer.product))return false;if(problem.answer.equations){if(!Array.isArray(answer.equations)||answer.equations.length!==2||!wbSameArray(answer.equations[0],problem.answer.equations[0])||!wbSameArray(answer.equations[1],problem.answer.equations[1]))return false;}return problem.answer.compare==null||String(answer.compare)===String(problem.answer.compare);}
  return false;
}

const WB_CSS=`
.wb-shell,.wb-shell *{box-sizing:border-box}.wb-shell{max-width:940px;margin:0 auto;color:#17243a}.wb-page{background:#fff;color:#17243a;border:1px solid #cbd5e1;border-radius:10px;box-shadow:0 12px 32px rgba(31,60,112,.16);padding:18px 22px 20px}.wb-page h1,.wb-page h2,.wb-page h3,.wb-page p,.wb-page button,.wb-page label,.wb-page span{color:inherit}.wb-head{display:flex;justify-content:space-between;align-items:flex-end;gap:14px;border-bottom:2px solid #17243a;padding-bottom:10px}.wb-kicker{font-size:16px;font-weight:800}.wb-title{font-size:30px!important;line-height:1.05;color:#17243a!important}.wb-name{min-width:210px;border-bottom:2px solid #64748b;padding:0 4px 3px;font-size:16px;color:#475569}.wb-review{margin:14px 0;background:#edf6ff;border:3px solid #3782bf;border-radius:8px;padding:14px 16px;display:grid;grid-template-columns:minmax(0,1fr) minmax(210px,.65fr);gap:16px;align-items:center;color:#17243a}.wb-review h2{font-size:25px!important;color:#174f7d!important;margin:0 0 4px}.wb-review p{font-size:18px;line-height:1.42}.wb-review-eq{font-size:20px;font-weight:850;margin-top:8px}.wb-review-visual{text-align:center;overflow:hidden}.wb-review-visual svg{max-height:150px}.wb-picker{display:grid;gap:10px;margin-top:14px}.wb-pick{background:#fff;border:2px solid #9fc6e8;border-radius:10px;min-height:70px;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px;text-align:left;font:inherit;cursor:pointer;color:#17243a}.wb-pick b{display:block;font-size:20px}.wb-pick small{color:#52657a}.wb-best{background:#174f7d;color:#fff!important;border-radius:999px;padding:7px 12px;font-size:15px;font-weight:850;white-space:nowrap}.wb-progress{height:7px;background:#dbe8f5;border-radius:9px;margin:10px 0 14px;overflow:hidden}.wb-progress i{display:block;height:100%;background:#3782bf}.wb-problem{border-top:1px solid #b8c5d1;padding-top:12px}.wb-qrow{display:grid;grid-template-columns:42px minmax(0,1fr);gap:10px;align-items:start}.wb-qnum{font-size:25px;font-weight:900}.wb-qcopy{font-size:23px;font-weight:720;line-height:1.35}.wb-instruction{font-size:16px;color:#52657a!important;font-weight:700;margin-top:4px}.wb-read{border:1px solid #9fc6e8;background:#edf6ff;border-radius:999px;padding:7px 11px;font-size:15px;font-weight:800;cursor:pointer;color:#174f7d!important}.wb-visual{text-align:center;margin:10px auto;min-height:82px;overflow-x:auto}.wb-visual svg{width:auto;max-width:100%;max-height:190px}.wb-eq{display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;font-size:29px;font-weight:850;margin:12px 0}.wb-num-box{min-width:70px;height:60px;border:3px solid #406b91;background:#fff;border-radius:7px;font:inherit;font-size:28px;font-weight:850;color:#17243a;cursor:pointer}.wb-num-box.active{outline:4px solid #f5b942;border-color:#174f7d}.wb-num-box.empty:after{content:"";display:block;margin:30px 12px 0;border-bottom:2px solid #8da1b4}.wb-answer-line{display:flex;justify-content:center;align-items:center;gap:9px;flex-wrap:wrap;margin:10px 0;font-size:21px;font-weight:750}.wb-answer-line .wb-num-box{min-width:86px}.wb-pad{display:grid;grid-template-columns:repeat(3,minmax(64px,92px));gap:8px;justify-content:center;margin:10px auto 0}.wb-key{min-height:58px;border:2px solid #9fb6ca;border-radius:12px;background:#f7fafc;font-size:26px;font-weight:850;color:#17243a;cursor:pointer}.wb-key.action{background:#dbeeff;color:#174f7d}.wb-key.go{background:#2d8d57;color:#fff;border-color:#247447}.wb-key:disabled{opacity:.38;cursor:not-allowed}.wb-choice-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin:12px 0}.wb-check{display:flex;gap:10px;align-items:flex-start;min-height:58px;text-align:left;border:2px solid #a9bfd2;background:#f8fbfe;border-radius:9px;padding:11px;font:inherit;font-size:18px;font-weight:700;color:#17243a;cursor:pointer}.wb-check .box{width:27px;height:27px;border:2px solid #406b91;border-radius:4px;display:grid;place-items:center;flex:none}.wb-check.on .box{background:#174f7d;color:#fff}.wb-person{min-width:155px;min-height:58px;background:#f7fafc;border:3px solid #9fb6ca;border-radius:12px;font-size:20px;font-weight:850;color:#17243a;cursor:pointer}.wb-person.on{background:#dbeeff;border-color:#174f7d}.wb-work{border:2px solid #89b7dc;border-radius:10px;margin:13px 0;background:#f5faff;color:#17243a}.wb-worktop{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:9px 12px;border-bottom:1px solid #b9d4ea}.wb-worktop b{color:#174f7d}.wb-tabs{display:flex;gap:6px}.wb-tab{min-height:42px;border:2px solid #7faacb;border-radius:8px;background:#fff;padding:7px 12px;font:inherit;font-weight:800;color:#174f7d;cursor:pointer}.wb-tab.on{background:#174f7d;color:#fff}.wb-workbody{padding:10px}.wb-buildbar{display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap}.wb-buildbtn{min-height:48px;border:2px solid #7faacb;background:#fff;border-radius:10px;padding:8px 14px;font:inherit;font-weight:800;color:#174f7d;cursor:pointer}.wb-buildmat{min-height:96px;display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;margin:8px 0}.wb-buildgroup{width:82px;height:82px;border:3px solid #406b91;border-radius:50%;background:#fff;display:flex;align-content:center;justify-content:center;flex-wrap:wrap;gap:3px;padding:12px;cursor:pointer}.wb-builddot{width:11px;height:11px;background:#17243a;border-radius:50%}.wb-stepnum{min-width:56px;text-align:center;font-size:28px;font-weight:900}.wb-workhint{text-align:center;background:#fff;border-radius:8px;padding:7px;font-size:16px;color:#52657a}.wb-workhint.good{background:#e2f6e9;color:#207141;font-weight:850}.wb-canvasbar{display:flex;gap:7px;align-items:center;flex-wrap:wrap;margin-bottom:7px}.wb-tool{min-height:40px;border:2px solid #9fb6ca;background:#fff;border-radius:8px;padding:6px 10px;font:inherit;font-weight:800;color:#17243a;cursor:pointer}.wb-tool.on{border-color:#174f7d;background:#dbeeff}.wb-swatch{width:38px;padding:0}.wb-swatch:before{content:"";width:18px;height:18px;border-radius:50%;background:var(--sw);display:block;margin:auto}.wb-padcanvas{width:100%;height:178px;display:block;background:#fff;border:2px solid #9fb6ca;border-radius:8px;touch-action:none}.wb-match{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:12px 0}.wb-matchcol{display:grid;gap:8px}.wb-matchitem{min-height:55px;border:2px solid #9fb6ca;background:#fff;border-radius:9px;padding:8px;font:inherit;font-size:18px;font-weight:750;color:#17243a;cursor:pointer}.wb-matchitem.sel{outline:4px solid #f5b942}.wb-matchitem.paired{background:#e6f3ff;border-color:#3782bf}.wb-pairlist{text-align:center;font-size:16px;color:#52657a;margin:7px}.wb-submit{min-height:56px;padding:12px 24px;border:0;border-radius:12px;background:#2d8d57;color:#fff!important;font-size:21px;font-weight:900;cursor:pointer}.wb-submit:disabled{opacity:.38;cursor:not-allowed}.wb-lock{text-align:center;color:#9b5c12!important;font-size:15px;font-weight:800;margin-top:5px}.wb-feedback{border-radius:10px;padding:14px;margin-top:12px}.wb-feedback.good{background:#e4f7eb;border:2px solid #57a977}.wb-feedback.try{background:#fff3df;border:2px solid #e2a84a}.wb-feedback h2{font-size:25px!important;color:#17243a!important}.wb-teach{background:#fff;border-left:5px solid #3782bf;padding:10px 12px;margin:10px 0;font-size:18px}.wb-feedback .wb-visual svg{max-height:150px}.wb-multi-review{display:grid;gap:7px;margin:10px 0}.wb-multi-line{background:#fff;border-radius:8px;padding:8px 10px;font-size:16px}.wb-resultdots{display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin:16px}.wb-resultdot{width:48px;height:48px;display:grid;place-items:center;border-radius:50%;font-weight:900;background:#e3edf5}.wb-resultdot.good{background:#dff3e6;color:#207141}.wb-resultdot.bad{background:#ffe5df;color:#a63e2e}.wb-finish{max-width:620px;margin:0 auto;text-align:center}.wb-score{font-size:54px;font-weight:950;color:#174f7d}.wb-btnrow{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:12px}.wb-primary,.wb-secondary{min-height:56px;border-radius:12px;padding:12px 22px;font:inherit;font-size:19px;font-weight:850;cursor:pointer}.wb-primary{border:0;background:#2d8d57;color:#fff}.wb-secondary{border:2px solid #8fb5d3;background:#edf6ff;color:#174f7d}.wb-hidden{display:none!important}
.wb-pairbuild,.wb-pairvisual{display:grid;grid-template-columns:1fr 1fr;gap:10px}.wb-pairpanel{min-width:0;border:2px solid #b9d4ea;border-radius:9px;background:#fff;padding:8px}.wb-pairlabel{text-align:center;font-weight:900;color:#174f7d;margin-bottom:6px}.wb-pairpanel .wb-buildmat{min-height:105px}.wb-pairvisual>div{min-width:0;overflow:hidden}.wb-pairvisual svg{max-width:100%}
@media(max-width:700px){.wb-page{padding:14px 12px}.wb-head{align-items:flex-start}.wb-name{display:none}.wb-title{font-size:25px!important}.wb-review{grid-template-columns:1fr}.wb-review-visual svg{max-height:120px}.wb-qcopy{font-size:20px}.wb-choice-grid{grid-template-columns:1fr}.wb-num-box{min-width:62px}.wb-worktop{align-items:flex-start;flex-direction:column}.wb-tabs{width:100%}.wb-tab{flex:1}.wb-match{gap:7px}.wb-matchitem{font-size:16px}.wb-padcanvas{height:210px}.wb-pairbuild{grid-template-columns:1fr}.wb-pairvisual{gap:4px}}
@media(min-width:900px) and (max-height:850px){#app:has(.wb-shell){padding-top:62px}.wb-page{padding-top:12px}.wb-review{margin:9px 0;padding:10px 14px}.wb-review-visual svg{max-height:115px}.wb-padcanvas{height:145px}.wb-key{min-height:56px}.wb-qcopy{font-size:21px}}
.wb-primary{color:#fff!important}
.wb-form{display:flex;flex-direction:column;gap:16px;margin:10px 0}.wb-formrow{font-size:23px;font-weight:750;display:flex;flex-wrap:wrap;align-items:center;gap:10px}.wb-in{height:62px;border:3px solid #406b91;border-radius:8px;font:inherit;font-size:26px;font-weight:800;padding:0 12px;color:#17243a;background:#fff;max-width:100%}.wb-in:focus{outline:4px solid #f5a623}.wb-in.num{width:112px;text-align:center}.wb-in.text{width:min(100%,380px)}.wb-in.wide{width:min(100%,560px)}
.wb-rights{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin:8px 0 12px}.wb-right{border:2px solid #406b91;border-radius:8px;padding:6px 14px;font-size:22px;font-weight:800;background:#f5f9fd}.wb-right b{color:#174f7d;margin-right:6px}
@media(min-width:900px) and (max-height:850px){.wb-problem{display:grid;grid-template-columns:minmax(0,1.12fr) minmax(340px,.88fr);gap:18px;align-items:start}.wb-work{margin-bottom:0}.wb-answerarea{align-self:start}}
`;
function wbInstallStyle(){if(typeof document==="undefined")return;let s=document.getElementById("workbook");if(!s){s=document.createElement("style");s.id="workbook";document.head.appendChild(s);}s.textContent=WB_CSS;}
wbInstallStyle();

function wbEscape(v){if(typeof esc==="function")return esc(v);return String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function wbData(){if(!P)return{best:{},log:[]};P.workbook=P.workbook||{best:{},log:[]};P.workbook.best=P.workbook.best||{};P.workbook.log=P.workbook.log||[];return P.workbook;}
function wbResumeSnapshot(state){
  if(!state||typeof state!=="object")return null;
  const copy=Object.assign({},state);
  if(state.canvas&&(state.drew||state.strokes)){try{copy.canvasData=wbCanvasJpeg(state.canvas);}catch(e){}}
  delete copy.canvas;delete copy.ctx;
  try{return JSON.parse(JSON.stringify(copy));}catch(e){return null;}
}
function wbResumeSave(){
  try{
    if(!WB||!WB.reveal||!P||typeof DB==="undefined"||typeof save!=="function"||!/^4-/.test(WB.lessonId)||typeof revealProfileIsPrince!=="function"||!revealProfileIsPrince(P))return;
    const snapshot=wbResumeSnapshot(WB);if(!snapshot)return;
    DB.resume=DB.resume||{};DB.resume[P.id]={t:Date.now(),wb:snapshot};save();
  }catch(e){}
}
function wbResumeRestore(snapshot){
  try{
    if(!snapshot||!snapshot.reveal||!/^4-/.test(snapshot.lessonId)||!Array.isArray(snapshot.problems)||!snapshot.cur)return false;
    if(typeof revealUnit4Gate==="function"&&!revealUnit4Gate(P,snapshot.lessonId).allowed)return false;
    if(snapshot.flex&&typeof lztStart==="function"){lztStart(snapshot.lessonId);return true;}
    WB=JSON.parse(JSON.stringify(snapshot));WB.canvas=null;WB.ctx=null;
    WB.results=Array.isArray(WB.results)?WB.results:[];WB.fields=WB.fields||{};WB.selected=Array.isArray(WB.selected)?WB.selected:[];WB.match=WB.match||{};WB.groupDots=Array.isArray(WB.groupDots)?WB.groupDots:[];WB.pairBuild=Array.isArray(WB.pairBuild)?WB.pairBuild:[];
    if(WB.answered&&typeof WB.lastOK==="boolean")wbRenderFeedback(WB.lastOK,WB.lastAnswer||null);else wbRenderProblem(true);
    return true;
  }catch(e){return false;}
}
function wbDotPositions(n,cx,cy,spread){const pts=[];if(n===1)return[[cx,cy]];const cols=Math.min(3,Math.ceil(Math.sqrt(n))),rows=Math.ceil(n/cols);for(let i=0;i<n;i++){const row=Math.floor(i/cols),col=i%cols;pts.push([cx+(col-(cols-1)/2)*spread,cy+(row-(rows-1)/2)*spread]);}return pts;}
function wbVisual(model){
  if(!model)return"";
  if(model.kind==="pair")return'<div class="wb-pairvisual">'+model.models.map((m,i)=>'<div><b>Model '+(i+1)+'. </b>'+wbVisual(m)+'</div>').join("")+'</div>';
  if(model.kind==="array"){const rows=model.rows||0,cols=model.cols||0,cell=Math.max(15,Math.min(28,150/Math.max(rows,cols,1))),w=Math.max(80,cols*cell+28),h=Math.max(70,rows*cell+28);let dots="";for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)dots+='<circle cx="'+(14+c*cell+cell/2)+'" cy="'+(14+r*cell+cell/2)+'" r="'+Math.max(4,cell*.24)+'" fill="#17243a"/>';return'<svg viewBox="0 0 '+w+' '+h+'" role="img" aria-label="'+rows+' rows of '+cols+' dots">'+dots+'</svg>';
  }
  const groups=model.groups||0,size=model.size||0,per=Math.min(groups,5),cw=86,ch=88,w=Math.max(100,per*cw),h=Math.ceil(groups/per)*ch;let body="";
  for(let g=0;g<groups;g++){const x=(g%per)*cw+43,y=Math.floor(g/per)*ch+42,pts=wbDotPositions(size,x,y-2,17);
    if(model.kind==="bowls"){body+='<path d="M'+(x-36)+' '+y+' Q '+x+' '+(y+53)+' '+(x+36)+' '+y+' Z" fill="#e7f0f7" stroke="#406b91" stroke-width="3"/>';pts.forEach(p=>body+='<circle cx="'+p[0]+'" cy="'+(p[1]-12)+'" r="7" fill="#d96538" stroke="#7a331e"/>');}
    else if(model.kind==="eggs"){body+='<rect x="'+(x-37)+'" y="'+(y-29)+'" width="74" height="58" rx="10" fill="#e9e1c8" stroke="#6e6040" stroke-width="3"/>';pts.forEach(p=>body+='<ellipse cx="'+p[0]+'" cy="'+p[1]+'" rx="7" ry="9" fill="#fff9e8" stroke="#6e6040"/>');}
    else{body+='<circle cx="'+x+'" cy="'+y+'" r="36" fill="#fff" stroke="#406b91" stroke-width="3"/>';pts.forEach(p=>body+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="6" fill="#17243a"/>');}
  }
  return'<svg viewBox="0 0 '+w+' '+h+'" role="img" aria-label="'+groups+' groups of '+size+'">'+body+'</svg>';
}
function wbPageHead(id){const L=WB_LESSONS[id];return'<div class="wb-head"><div><div class="wb-kicker">Lesson '+wbEscape(id)+'</div><h1 class="wb-title">Additional Practice</h1></div><div class="wb-name">Name&nbsp; '+wbEscape((P&&P.name)||"")+'</div></div><div style="font-size:16px;font-weight:800;margin-top:5px">'+wbEscape(L.title)+'</div>';}
/* Question screens: ONE slim line "Lesson 4-2 · Multiply by 5" (Eb 2026-11-05 look fix); the workbook-page head stays on intro/finish pages. */
function wbQHead(id){const L=WB_LESSONS[id];return'<h1 class="wb-qhead"><span>Lesson '+wbEscape(id)+'</span>'+(L&&L.title?'<span class="wb-qh-sep" aria-hidden="true">·</span><span class="wb-qh-t">'+wbEscape(L.title)+'</span>':'')+'</h1>';}
/* Sticky bottom bar, the SAME on every question screen (Eb 2026-11-05 correction pass):
   [◀ Back] (44pt ghost) · ONE primary (Check, then Next / Try again / I'm ready) · [Skip ▶] (44pt ghost).
   Lesson test: Back = previous question, Skip = next open one. Practice: Back = look at the last answer, Skip = do this one later. */
function lzqBackBtn(id,fn,dis){return'<button type="button" class="lzq-back lzq-ghost" id="'+id+'" onclick="'+fn+'"'+(dis?' disabled':'')+'><span class="lzq-ic" aria-hidden="true">◀</span><span>Back</span></button>';}
function lzqSkipBtn(id,fn,dis,label){return'<button type="button" class="lzq-skip lzq-ghost" id="'+id+'" onclick="'+fn+'"'+(dis?' disabled':'')+'><span>'+(label||'Skip')+'</span><span class="lzq-ic" aria-hidden="true">▶</span></button>';}
function lzqBarHTML(primary){
  const f=!!(WB&&WB.flex);let back,skip;
  if(f){back=lzqBackBtn("lztPrev","lztPrev()",!(WB.index>0));skip=lzqSkipBtn("lztSkip","lztSkip()",false);}
  else{back=lzqBackBtn("wbPrev","wbLookBack()",!wbHist().length);skip=lzqSkipBtn("wbSkip","wbPracticeSkip()",!wbCanSkip());}
  return'<div class="lzq-bar'+(f?' flex':' prac')+'"><div class="lzq-grp">'+back+'<div class="lzq-main">'+(primary||'')+'</div>'+skip+'</div></div>';
}
/* one primary button for the bar's middle slot; `wait` = solid muted "waiting" look with a readable label */
function lzqPrimary(id,label,fn,wait,cls){return'<button type="button" id="'+id+'" class="lzq-check'+(cls?' '+cls:'')+(wait?' wait':'')+'" onclick="'+fn+'"'+(wait?' disabled':'')+'>'+label+'</button>';}
function lzqSetMain(html){try{const m=document.querySelector&&document.querySelector(".lzq-bar .lzq-main");if(!m)return false;m.innerHTML=html;return true;}catch(e){return false;}}
function wbWaitLabel(){const p=WB&&WB.cur;if(!p)return"Type your answer";if(!wbWorkDone())return"Show your work";if(p.type==="multi"||(p.type==="who"&&p.valueAnswer==null))return"Pick an answer";if(p.type==="match")return"Match them all";return"Type your answer";}
function wbCheckLabel(){return'Check ✓';}
function wbCheckBtnHTML(){const ok=wbCanSubmit();return'<button id="wbSubmit" class="wb-submit lzq-check'+(ok?'':' wait')+'" onclick="wbSubmit()" '+(ok?'':'disabled')+'>'+wbCheckLabel()+'</button>';}
function wbBarAnswered(){const b=document.getElementById("wbSubmit");if(b&&b.closest&&b.closest(".lzq-bar"))b.hidden=true;}
/* after he picks a reason, the waiting Next in the bar wakes up */
function lzqWake(){const b=document.getElementById("lztNextBtn")||document.getElementById("wbNextBtn");if(b&&b.disabled){b.disabled=false;b.classList.remove("wait");b.innerHTML=b.getAttribute("data-go")||"Next ▶";}}
/* ---- practice (not the lesson test): history for Back, "do it later" for Skip. Marking is unchanged. ---- */
function wbHist(){return(WB&&Array.isArray(WB.hist))?WB.hist:[];}
function wbCanSkip(){if(!WB||WB.flex)return false;if(WB.answered||WB.isTwin)return true;return WB.index<(WB.size||8)-1;}
function wbPracticeSkip(){
  if(!WB||WB.flex)return;if(typeof stopRecorded==="function")stopRecorded();
  if(WB.answered||WB.isTwin)return wbContinue();
  const n=WB.size||8;if(WB.index>=n-1)return;
  const p=WB.problems.splice(WB.index,1)[0];p._later=true;WB.problems.splice(n-1,0,p);wbLoadProblem(WB.problems[WB.index],false);
}
function wbPracticeDots(){const n=WB.size||8,out=[];for(let i=0;i<n;i++){if(i<WB.index||(i===WB.index&&WB.answered&&WB.results.length>i))out.push(WB.results[i]?"right":"wrong");else out.push(WB.problems[i]&&WB.problems[i]._later?"skip":"todo");}return out;}
function wbPracticeStripHTML(){
  const n=WB.size||8,num=Math.min(n,WB.index+1);
  return'<div class="lzt-strip wb-pstrip"><div class="lzt-count"><b>'+(WB.isTwin?'Question '+num+' · one like it':'Question '+num+' of '+n)+'</b>'+lztInfoBtn()+'</div>'+lztDotsHTML(wbPracticeDots(),false,WB.index)+lztLegendHTML()+'</div>';
}
function wbLookBack(){
  const h=wbHist();if(!h.length||typeof lzDialog!=="function")return;
  let k=h.length-1;const show=()=>{const e=h[k];
    lzDialog({title:"Question "+e.n,body:'<p class="lzd-q">'+wbEscape(e.q)+'</p><p class="lzd-a">Your answer: <b>'+wbEscape(e.given||"—")+'</b></p><p class="lzd-r '+(e.ok?'ok':'no')+'">'+(e.ok?'✓ You got this one right.':'✗ Not right that time.')+'</p>',
      buttons:(k>0?[{label:"◀ Earlier",cls:"ghost",id:"lzdEarlier",keep:true,fn:()=>{k--;show();}}]:[]).concat([{label:"Back to question "+Math.min(WB.size||8,WB.index+1)+" ▶",cls:"go",id:"lzdBackTo"}])});};
  show();
}
function wbPracticeExit(){const id=WB&&WB.lessonId;if(typeof stopRecorded==="function")stopRecorded();if(WB&&WB.reveal&&typeof window!=="undefined"&&typeof window.wbRevealExit==="function")return window.wbRevealExit(id);renderWorkbookLesson(id);}
function wbPracticeChrome(){if(WB&&!WB.flex&&typeof lzBack==="function")lzBack(wbPracticeExit,"Exit lesson",{exit:true,confirm:{title:"Leave the lesson?",body:"Your answers so far are saved."}});}
/* Keep the bar + the box he is typing in above an on-screen keyboard (iOS / Telegram leave the layout viewport under it).
   Keyboard open (Eb 2026-11-05): body.lzq-kb collapses the top header to a slim strip; font sizes and the bar never change. */
const _lzqMaxH={};
function lzqKbState(){try{const v=window.visualViewport,h=Math.round(v?v.height:innerHeight),w=String(innerWidth);_lzqMaxH[w]=Math.max(_lzqMaxH[w]||0,h,innerHeight);
  const el=document.activeElement,typing=!!(el&&el.classList&&el.classList.contains("wb-in")&&document.querySelector(".lzq-bar"));
  const kb=typing&&h<_lzqMaxH[w]-120;if(document.body.classList.contains("lzq-kb")!==kb)document.body.classList.toggle("lzq-kb",kb);}catch(e){}}
function lzqKbFit(){try{lzqKbState();const v=window.visualViewport,b=document.querySelector(".lzq-bar");if(!v||!b)return;const kb=Math.max(0,Math.round(innerHeight-v.offsetTop-v.height));b.style.bottom=kb>60?kb+"px":"";}catch(e){}}
function lzqKeep(){try{const el=document.activeElement;if(!el||!el.classList||!el.classList.contains("wb-in"))return;lzqKbFit();
  const v=window.visualViewport,r=el.getBoundingClientRect(),bar=document.querySelector(".lzq-bar"),tb=document.getElementById("topbar"),bh=bar?bar.offsetHeight:0,top=(v?v.offsetTop:0)+(tb?tb.getBoundingClientRect().bottom:60)+12,bottom=(v?v.offsetTop+v.height:innerHeight)-bh-12;
  if(r.bottom>bottom)window.scrollBy(0,Math.min(r.bottom-bottom,r.top-top));else if(r.top<top)window.scrollBy(0,r.top-top);}catch(x){}}
function lzqFocusIn(e){const el=e&&e.target;lzqKbState();if(el&&el.classList&&el.classList.contains("wb-in"))setTimeout(lzqKeep,320);}
function lzqFocusOut(){setTimeout(lzqKbState,60);}
function lzqResize(){lzqKbFit();setTimeout(lzqKeep,80);}
if(typeof window!=="undefined"&&!window.__lzqKb){window.__lzqKb=1;try{document.addEventListener("focusin",lzqFocusIn);document.addEventListener("focusout",lzqFocusOut);window.addEventListener("resize",lzqResize);if(window.visualViewport){visualViewport.addEventListener("resize",lzqResize);visualViewport.addEventListener("scroll",lzqKbFit);}}catch(e){}}
function renderWorkbookPicker(){
  if(typeof clearTimers==="function")clearTimers();if(typeof closeOverlay==="function")closeOverlay();if(typeof defocus==="function")defocus();if(typeof showAnanseCorner==="function")showAnanseCorner(false);wbInstallStyle();
  const data=wbData(),rows=Object.keys(WB_LESSONS).map(id=>{const L=WB_LESSONS[id],best=data.best[id];return'<button class="wb-pick" onclick="renderWorkbookLesson(\''+id+'\')"><span><b>Lesson '+id+' · '+wbEscape(L.title)+'</b><small>8 fresh workbook-style problems</small></span><span class="wb-best">'+(best==null?'New':('Best '+best+'/8'))+'</span></button>';}).join("");
  app.innerHTML='<div class="fadein wb-shell"><div class="wb-page"><div class="wb-head"><div><div class="wb-kicker">Reveal Math · Grade 3</div><h1 class="wb-title">📒 Workbook Practice</h1></div><div class="wb-name">Name&nbsp; '+wbEscape((P&&P.name)||"")+'</div></div><p style="font-size:18px;margin-top:12px">Practice that looks like the pages from class — with space to build or draw your work.</p><div class="wb-picker">'+rows+'</div><div class="wb-btnrow"><button class="wb-secondary" onclick="renderHome()">🏠 Home</button></div></div></div>';
  if(typeof say==="function")say("Workbook practice. Pick a lesson.");
}
function renderWorkbookLesson(id){
  const L=WB_LESSONS[id];if(!L)return renderWorkbookPicker();if(typeof clearTimers==="function")clearTimers();if(typeof closeOverlay==="function")closeOverlay();if(typeof defocus==="function")defocus();if(typeof showAnanseCorner==="function")showAnanseCorner(false);
  const best=wbData().best[id];app.innerHTML='<div class="fadein wb-shell"><div class="wb-page">'+wbPageHead(id)+'<section class="wb-review"><div><h2>Review</h2><p>'+wbEscape(L.review)+'</p><div class="wb-review-eq">'+wbEscape(L.reviewEq)+'</div></div><div class="wb-review-visual">'+wbVisual(L.reviewModel)+'</div></section>'+(best==null?'':'<p style="text-align:center;font-weight:800">Best score: '+best+' of 8</p>')+'<div class="wb-btnrow"><button class="wb-primary" onclick="wbStart(\''+id+'\')">Start problems 1–8 ▶</button><button class="wb-secondary" onclick="say(WB_LESSONS[\''+id+'\'].review)">🔊 Read Review</button><button class="wb-secondary" onclick="renderWorkbookPicker()">← Lessons</button></div></div></div>';
  if(typeof say==="function")say("Lesson "+id+", "+L.title+". Review. "+L.review);
}
function wbStart(id,opts){opts=opts||{};if(opts.reveal&&typeof revealUnit4Gate==="function"){const gate=revealUnit4Gate(P,id);if(!gate.allowed){if(typeof renderRevealLockedLesson==="function")renderRevealLockedLesson(id,gate);return;}}const size=Math.max(1,Math.floor(Number(opts.size)||(opts.reveal?10:8)));WB={lessonId:id,size:size,reveal:!!opts.reveal,problems:wbGenerate(id,size),index:0,results:[],cur:null,isTwin:false,answered:false,start:Date.now()};wbLoadProblem(WB.problems[0],false);}
function wbLoadProblem(p,isTwin,restore,silent){WB.cur=p;WB.isTwin=!!isTwin;WB.answered=false;WB.lastAnswer=null;WB.lastOK=null;WB.startedAt=Date.now();WB.fields={};WB.active=null;WB.selected=[];WB.person=null;WB.match={};WB.matchLeft=null;WB.matchOrder=null;if(p.type==="match"){p.pairs.forEach(x=>WB.fields[x.id]="");WB.active=p.pairs[0].id;}WB.workTab="build";WB.groupDots=[];WB.rows=0;WB.cols=0;WB.pairBuild=(p.models||[]).map(m=>m.kind==="array"?{rows:0,cols:0}:{groupDots:[]});WB.drew=false;WB.strokes=0;WB.canvasData=null;WB.canvas=null;WB.ctx=null;WB.drawTool="pen";WB.drawColor="#17243a";if(p.type==="form"){p.fields.forEach(f=>{WB.fields[f.key]="";});}if(p.type==="fill"){WB.fields.ans="";WB.active="ans";}if(p.type==="picture"){p.eq.values.forEach((v,i)=>WB.fields["e"+i]="");if(p.extraEq)p.extraEq.values.forEach((v,i)=>WB.fields["x"+i]="");WB.active="e0";}if(p.type==="story"){p.eq.values.forEach((v,i)=>WB.fields["e"+i]="");WB.fields.ans="";if(p.answer.remainder!=null)WB.fields.rem="";WB.active="e0";}if(p.type==="who"&&p.valueAnswer!=null){WB.fields.ans="";WB.active="ans";}if(p.type==="pair"){WB.fields.ans="";if(p.equations){p.equations[0].forEach((v,i)=>WB.fields["e"+i]="");p.equations[1].forEach((v,i)=>WB.fields["x"+i]="");WB.active="e0";}else WB.active="ans";}if(restore){const r=JSON.parse(JSON.stringify(restore));["fields","selected","match","person","groupDots","rows","cols","pairBuild"].forEach(k=>{if(r[k]!==undefined&&r[k]!==null)WB[k]=r[k];});}wbRenderProblem(silent);}
function wbNeedsWork(p){return p&&(p.type==="story"||p.type==="who"||p.requireWork);}
function wbOneModelMatches(m,state,allowTurn){if(!m||!state)return false;if(m.kind==="array")return state.rows===m.rows&&state.cols===m.cols||!!(allowTurn&&state.rows===m.cols&&state.cols===m.rows);if(!Array.isArray(state.groupDots)||state.groupDots.length!==m.groups)return false;return state.groupDots.every(n=>n===m.size);}
function wbModelMatches(){const p=WB&&WB.cur,m=p&&p.model;if(!m)return false;if(m.kind==="pair")return m.models.every((x,i)=>wbOneModelMatches(x,WB.pairBuild[i],false));if(m.kind==="array")return wbOneModelMatches(m,{rows:WB.rows,cols:WB.cols},p.allowTurn);return wbOneModelMatches(m,{groupDots:WB.groupDots},false);}
function wbWorkDone(){if(WB.cur.type==="pair")return wbModelMatches();return !WB.cur.requireWork||wbModelMatches()||WB.drew;}
function wbFieldButton(k,label){const v=WB.fields[k],cl=v===""?" empty":"";return'<button type="button" class="wb-num-box'+cl+(WB.active===k?' active':'')+'" onclick="wbActivate(\''+k+'\')" aria-label="'+wbEscape(label||"number box")+'">'+(v===""?'':wbEscape(v))+'</button>';}
function wbFillHTML(p){let used=false;return'<div class="wb-eq">'+p.parts.map(x=>{if(x==="□"&&!used){used=true;return wbFieldButton("ans","unknown number");}return'<span>'+wbEscape(x)+'</span>';}).join("")+'</div>';}
function wbEquationHTML(p){let h='<div class="wb-eq">'+wbFieldButton("e0","first number")+'<span>'+wbEscape(p.eq.op)+'</span>'+wbFieldButton("e1","second number")+'<span>=</span>'+wbFieldButton("e2","answer in equation")+'</div>';if(p.extraEq)h+='<div class="wb-eq">'+wbFieldButton("x0","first number in related equation")+'<span>'+wbEscape(p.extraEq.op)+'</span>'+wbFieldButton("x1","second number in related equation")+'<span>=</span>'+wbFieldButton("x2","answer in related equation")+'</div>';return h;}
function wbAnswerLine(p){let h='<div class="wb-answer-line">'+wbFieldButton("ans","answer")+' <span>'+wbEscape(p.unit)+'</span>';if(p.answer.remainder!=null)h+=' <span>and</span> '+wbFieldButton("rem","remainder")+' <span>'+wbEscape(p.remainderUnit)+'</span>';return h+'</div>';}
function wbFormHTML(p){return'<div class="wb-form">'+p.rows.map(r=>'<div class="wb-formrow">'+String(r).split(/(\{[nt]:\w+\})/).map(part=>{const m=/^\{([nt]):(\w+)\}$/.exec(part);if(!m)return part?'<span>'+wbEscape(part)+'</span>':"";const k=m[2],num=m[1]==="n";if(k==="r")return'<textarea class="wb-in wide wb-because" data-k="r" aria-label="because" rows="2" maxlength="120" placeholder="I know that…" autocomplete="off" autocapitalize="none" spellcheck="false" enterkeyhint="done" onkeydown="if(event.key===\'Enter\'){event.preventDefault();this.blur();}" oninput="wbFormInput(this)">'+wbEscape(WB.fields[k]||"")+'</textarea>';
  return'<input class="wb-in '+(num?'num':'text')+'" data-k="'+k+'" aria-label="'+(num?'answer':'type here')+'" '+(num?'inputmode="numeric" pattern="[0-9]*" maxlength="4"':'maxlength="120"')+' autocomplete="off" autocapitalize="none" spellcheck="false" value="'+wbEscape(WB.fields[k]||"")+'" oninput="wbFormInput(this)">';}).join("")+'</div>').join("")+'</div>';}
function wbFormInput(el){if(!WB||!WB.cur||WB.cur.type!=="form")return;if(el.tagName==="TEXTAREA"&&/[\r\n]/.test(el.value))el.value=el.value.replace(/\s*[\r\n]+\s*/g," ");WB.fields[el.getAttribute("data-k")]=el.value;wbRefreshSubmit();}
function wbQuestionAnswerHTML(p){if(p.type==="form")return wbFormHTML(p);if(p.type==="fill")return wbFillHTML(p);if(p.type==="picture")return wbEquationHTML(p);if(p.type==="story")return wbEquationHTML(p)+wbAnswerLine(p);if(p.type==="multi")return wbMultiHTML(p);if(p.type==="who")return'<div class="wb-btnrow">'+p.people.map(n=>'<button class="wb-person'+(WB.person===n?' on':'')+'" onclick="wbPickPerson(\''+wbEscape(n)+'\')">'+wbEscape(n)+'</button>').join("")+'</div>'+(p.valueAnswer!=null?'<div class="wb-answer-line"><span>Product:</span>'+wbFieldButton("ans","product")+'</div>':'');if(p.type==="match")return wbMatchHTML(p);if(p.type==="pair")return wbPairAnswerHTML(p);return"";}
function wbPairAnswerHTML(p){let h="";if(p.equations)h=wbEquationHTML({eq:{op:"×"},extraEq:{op:"×"}});h+='<div class="wb-answer-line"><span>Shared product:</span>'+wbFieldButton("ans","shared product")+'</div>';if(p.people)h+='<div class="wb-answer-line"><span>Who has more?</span></div><div class="wb-btnrow">'+p.people.map(n=>'<button class="wb-person'+(WB.person===n?' on':'')+'" onclick="wbPickPerson(\''+wbEscape(n)+'\')">'+wbEscape(n)+'</button>').join("")+'</div>';return h;}
function wbMultiHTML(p){return'<div class="wb-choice-grid">'+p.options.map(o=>'<button class="wb-check'+(WB.selected.includes(o.id)?' on':'')+'" onclick="wbToggleMulti(\''+o.id+'\')"><span class="box">'+(WB.selected.includes(o.id)?'✓':'')+'</span><span><b>'+o.id+'.</b> '+wbEscape(o.text)+'</span></button>').join("")+'</div>';}
function wbMatchHTML(p){const hint=p.rights?'<div class="wb-rights">'+p.rights.map((r,i)=>'<span class="wb-right"><b>'+(i+1)+'. </b>'+wbEscape(r)+'</span>').join("")+'</div>':'<p>Numbers: <b>'+p.numbers.map(wbEscape).join(" · ")+'</b></p>';return hint+p.pairs.map(x=>'<div class="wb-answer-line"><span>'+wbEscape(x.left)+'</span> '+wbFieldButton(x.id,"matching number")+'</div>').join("");}
function wbNumberPad(){const keys=["1","2","3","4","5","6","7","8","9","0","⌫"];return'<div class="wb-pad lzq-pad">'+keys.map(k=>'<button type="button" class="wb-key '+(k==="⌫"?'action':(k==="0"?'zero':''))+'"'+(k==="⌫"?' aria-label="Delete"':'')+' onclick="wbKey(\''+k+'\')">'+k+'</button>').join("")+'</div>'+(wbNeedsWork(WB.cur)&&!wbWorkDone()?'<div class="wb-lock">'+(WB.cur.type==="pair"?'Build both models correctly to unlock ✓':'Show your work to unlock ✓')+'</div>':'');}
function wbCanSubmit(){const p=WB&&WB.cur;if(!p||WB.answered||!wbWorkDone())return false;if(p.type==="form")return p.fields.every(f=>String(WB.fields[f.key]==null?"":WB.fields[f.key]).trim()!=="");if(p.type==="fill")return WB.fields.ans!=="";if(p.type==="picture")return["e0","e1","e2"].concat(p.extraEq?["x0","x1","x2"]:[]).every(k=>WB.fields[k]!=="");if(p.type==="story")return["e0","e1","e2","ans"].every(k=>WB.fields[k]!=="")&&(p.answer.remainder==null||WB.fields.rem!=="");if(p.type==="multi")return WB.selected.length>0;if(p.type==="who")return!!WB.person&&(p.valueAnswer==null||WB.fields.ans!=="");if(p.type==="match")return p.pairs.every(x=>WB.fields[x.id]!=="");if(p.type==="pair")return WB.fields.ans!==""&&(!p.equations||["e0","e1","e2","x0","x1","x2"].every(k=>WB.fields[k]!==""))&&(!p.people||!!WB.person);return false;}
function wbSubmitButton(){return''+(wbNeedsWork(WB.cur)&&!wbWorkDone()?'<div class="wb-lock">Build the model or make a few drawing strokes first.</div>':'');}
function wbRenderProblem(silent){
  const p=WB.cur,L=WB_LESSONS[WB.lessonId],pct=Math.round(WB.index/(WB.size||8)*100),num=WB.index+1,work=wbNeedsWork(p),visual=p.visual?'<div class="wb-visual">'+wbVisual(p.visual)+'</div>':'';
  let controls=wbQuestionAnswerHTML(p),submit=(p.type==="fill"||p.type==="picture"||p.type==="story"||p.type==="pair"||p.type==="match"||(p.type==="who"&&p.valueAnswer!=null))?wbNumberPad():wbSubmitButton();
  app.innerHTML='<div class="fadein wb-shell lzq'+(WB.flex?' lzt-test':' wb-prac')+'"><div class="wb-page">'+wbQHead(WB.lessonId)+(WB.flex?lztStripHTML():wbPracticeStripHTML())+'<div class="wb-problem"><div class="wb-questionarea"><div class="wb-qrow"><div class="wb-qbody"><div class="wb-qcopy">'+(WB.isTwin?'<span style="color:#207141">Try one like it:</span> ':'')+wbEscape(p.q)+'</div>'+(p.instruction&&p.instruction!==p.q?'<div class="wb-instruction">'+wbEscape(p.instruction)+'</div>':'')+'</div><button type="button" class="wb-read" onclick="say(WB.cur.spoken)" aria-label="Read it to me"><span aria-hidden="true">🔈</span><span class="wb-read-t">Read it</span></button></div>'+visual+(work?wbWorkHTML(p):'')+'</div><div class="wb-answerarea">'+controls+submit+'</div></div>'+lzqBarHTML(wbCheckBtnHTML())+'</div></div>';
  if(WB.flex)lztAfterRender();else wbPracticeChrome();
  if(work&&WB.workTab==="draw")setTimeout(wbInitCanvas,0);wbResumeSave();if(!silent&&typeof say==="function")say((WB.isTwin?"Try one like it. ":"")+p.spoken);
  if(!silent)wbWarmExplain();
}

function wbWorkHTML(p){return'<section class="wb-work"><div class="wb-worktop"><b>✏️ SHOW YOUR WORK</b><div class="wb-tabs"><button class="wb-tab '+(WB.workTab==="build"?'on':'')+'" onclick="wbWorkTab(\'build\')">Build it</button><button class="wb-tab '+(WB.workTab==="draw"?'on':'')+'" onclick="wbWorkTab(\'draw\')">Draw it</button></div></div><div class="wb-workbody" id="wbWorkBody">'+(WB.workTab==="build"?wbBuildHTML(p):wbDrawHTML())+'</div></section>';}
function wbBuildHTML(p){const m=p.model;if(!m)return'<div class="wb-workhint">Use Draw it to show your thinking.</div>';if(m.kind==="pair")return wbPairBuildHTML(p);if(m.kind==="array"){return'<div class="wb-buildbar"><span>Rows</span><button class="wb-buildbtn" onclick="wbArrayStep(\'rows\',-1)">−</button><span class="wb-stepnum">'+WB.rows+'</span><button class="wb-buildbtn" onclick="wbArrayStep(\'rows\',1)">+</button><span>Columns</span><button class="wb-buildbtn" onclick="wbArrayStep(\'cols\',-1)">−</button><span class="wb-stepnum">'+WB.cols+'</span><button class="wb-buildbtn" onclick="wbArrayStep(\'cols\',1)">+</button></div><div class="wb-buildmat">'+wbVisual({kind:"array",rows:WB.rows,cols:WB.cols})+'</div>'+wbBuildHint();}
  return'<div class="wb-buildbar"><button class="wb-buildbtn" onclick="wbAddGroup()">＋ Add a circle</button><button class="wb-buildbtn" onclick="wbBuildClear()">↺ Clear</button><span>Tap a circle to add a dot.</span></div><div class="wb-buildmat">'+WB.groupDots.map((n,i)=>'<button class="wb-buildgroup" onclick="wbGroupDot('+i+')" aria-label="Group '+(i+1)+' with '+n+' dots">'+Array(n).fill('<span class="wb-builddot"></span>').join("")+'</button>').join("")+'</div>'+wbBuildHint();}
function wbPairBuildHTML(p){return'<div class="wb-pairbuild">'+p.models.map((m,i)=>{const s=WB.pairBuild[i],label=m.label||("Model "+(i+1));if(m.kind==="array")return'<div class="wb-pairpanel"><div class="wb-pairlabel">'+wbEscape(label)+'</div><div class="wb-buildbar"><span>Rows</span><button class="wb-buildbtn" onclick="wbPairStep('+i+',\'rows\',-1)">−</button><span class="wb-stepnum">'+s.rows+'</span><button class="wb-buildbtn" onclick="wbPairStep('+i+',\'rows\',1)">+</button><span>Columns</span><button class="wb-buildbtn" onclick="wbPairStep('+i+',\'cols\',-1)">−</button><span class="wb-stepnum">'+s.cols+'</span><button class="wb-buildbtn" onclick="wbPairStep('+i+',\'cols\',1)">+</button></div><div class="wb-buildmat">'+wbVisual({kind:"array",rows:s.rows,cols:s.cols})+'</div></div>';return'<div class="wb-pairpanel"><div class="wb-pairlabel">'+wbEscape(label)+'</div><div class="wb-buildbar"><button class="wb-buildbtn" onclick="wbPairAddGroup('+i+')">＋ Circle</button><button class="wb-buildbtn" onclick="wbPairClear('+i+')">↺ Clear</button></div><div class="wb-buildmat">'+s.groupDots.map((n,j)=>'<button class="wb-buildgroup" onclick="wbPairGroupDot('+i+','+j+')">'+Array(n).fill('<span class="wb-builddot"></span>').join("")+'</button>').join("")+'</div></div>';}).join("")+'</div>'+wbBuildHint();}
function wbBuildHint(){const m=WB.cur.model;if(wbModelMatches())return'<div class="wb-workhint good">✓ Your drawing matches!</div>';if(m.kind==="pair")return'<div class="wb-workhint">Build both models so each one matches its multiplication expression.</div>';if(m.kind==="array"){if(!WB.rows&&!WB.cols)return'<div class="wb-workhint">Use the buttons to build rows and columns.</div>';return'<div class="wb-workhint">You made '+WB.rows+' rows of '+WB.cols+'. The problem needs '+m.rows+' rows of '+m.cols+'.</div>';}
  if(!WB.groupDots.length)return'<div class="wb-workhint">Add circles for the equal groups, then tap each circle to add dots.</div>';const same=WB.groupDots.every(n=>n===WB.groupDots[0]),size=same?WB.groupDots[0]:"different amounts";return'<div class="wb-workhint">You made '+WB.groupDots.length+' groups of '+size+'. The problem needs '+m.groups+' groups of '+m.size+'.</div>';}
function wbDrawHTML(){return'<div class="wb-canvasbar"><button class="wb-tool '+(WB.drawTool==="pen"?'on':'')+'" onclick="wbTool(\'pen\')">✏️ Pen</button><button class="wb-tool '+(WB.drawTool==="eraser"?'on':'')+'" onclick="wbTool(\'eraser\')">▱ Eraser</button><button class="wb-tool wb-swatch" style="--sw:#17243a" aria-label="Blue-black pen" onclick="wbColor(\'#17243a\')"></button><button class="wb-tool wb-swatch" style="--sw:#d14b34" aria-label="Red pen" onclick="wbColor(\'#d14b34\')"></button><button class="wb-tool" onclick="wbCanvasClear()">↺ Clear</button><span id="wbDrawStatus" class="wb-workhint '+(WB.drew?'good':'')+'">'+(WB.drew?'✓ Drawing added':'Make a few strokes to show your thinking.')+'</span></div><canvas id="wbCanvas" class="wb-padcanvas" aria-label="Draw your work here"></canvas>';}
function wbWorkTab(tab){if(tab===WB.workTab)return;if(WB.workTab==="draw")wbRememberCanvas();WB.workTab=tab;const body=document.getElementById("wbWorkBody");if(body){body.innerHTML=tab==="build"?wbBuildHTML(WB.cur):wbDrawHTML();if(tab==="draw")setTimeout(wbInitCanvas,0);}wbRefreshSubmit();}
function wbRefreshWork(){const body=document.getElementById("wbWorkBody");if(body&&WB.workTab==="build")body.innerHTML=wbBuildHTML(WB.cur);wbRefreshSubmit();}
function wbAddGroup(){if(WB.groupDots.length<10)WB.groupDots.push(0);wbRefreshWork();}
function wbGroupDot(i){if(WB.groupDots[i]<10)WB.groupDots[i]++;wbRefreshWork();}
function wbBuildClear(){WB.groupDots=[];WB.rows=0;WB.cols=0;wbRefreshWork();}
function wbArrayStep(k,d){WB[k]=Math.max(0,Math.min(10,(WB[k]||0)+d));wbRefreshWork();}
function wbPairStep(i,k,d){const s=WB.pairBuild[i];if(s)s[k]=Math.max(0,Math.min(10,(s[k]||0)+d));wbRefreshWork();}
function wbPairAddGroup(i){const s=WB.pairBuild[i];if(s&&s.groupDots&&s.groupDots.length<10)s.groupDots.push(0);wbRefreshWork();}
function wbPairGroupDot(i,j){const s=WB.pairBuild[i];if(s&&s.groupDots&&s.groupDots[j]<10)s.groupDots[j]++;wbRefreshWork();}
function wbPairClear(i){const m=WB.cur.models[i];WB.pairBuild[i]=m.kind==="array"?{rows:0,cols:0}:{groupDots:[]};wbRefreshWork();}
function wbBuiltRecord(){const m=WB&&WB.cur&&WB.cur.model;if(!m)return null;if(m.kind==="pair")return WB.pairBuild.map((s,i)=>WB.cur.models[i].kind==="array"?{rows:s.rows,cols:s.cols}:{groups:s.groupDots.length,size:s.groupDots.length&&s.groupDots.every(n=>n===s.groupDots[0])?s.groupDots[0]:0});if(m.kind==="array")return{rows:WB.rows,cols:WB.cols};const equal=WB.groupDots.length&&WB.groupDots.every(n=>n===WB.groupDots[0]);return{groups:WB.groupDots.length,size:equal?WB.groupDots[0]:0};}
function wbInitCanvas(){const c=document.getElementById("wbCanvas");if(!c||!c.getContext)return;const rect=c.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1),w=Math.max(280,Math.round(rect.width)),h=Math.max(150,Math.round(rect.height));c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);const ctx=c.getContext("2d");ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle="#fff";ctx.fillRect(0,0,w,h);ctx.lineCap="round";ctx.lineJoin="round";WB.canvas=c;WB.ctx=ctx;WB.canvasW=w;WB.canvasH=h;if(WB.canvasData){const img=new Image();img.onload=()=>ctx.drawImage(img,0,0,w,h);img.src=WB.canvasData;}
  let drawing=false,last=null,moved=false;const point=e=>{const r=c.getBoundingClientRect();return{x:(e.clientX-r.left)*w/r.width,y:(e.clientY-r.top)*h/r.height};};
  c.onpointerdown=e=>{e.preventDefault();drawing=true;moved=false;last=point(e);try{c.setPointerCapture(e.pointerId);}catch(x){}};
  c.onpointermove=e=>{if(!drawing)return;e.preventDefault();const now=point(e);ctx.strokeStyle=WB.drawTool==="eraser"?"#fff":WB.drawColor;ctx.lineWidth=WB.drawTool==="eraser"?18:4;ctx.beginPath();ctx.moveTo(last.x,last.y);ctx.lineTo(now.x,now.y);ctx.stroke();last=now;moved=true;};
  c.onpointerup=c.onpointercancel=()=>{if(drawing&&moved){WB.strokes++;if(WB.strokes>=3&&!WB.drew){WB.drew=true;const s=document.getElementById("wbDrawStatus");if(s){s.className="wb-workhint good";s.textContent="✓ Drawing added";}wbRefreshSubmit();}}drawing=false;last=null;moved=false;};
}
function wbTool(t){wbRememberCanvas();WB.drawTool=t;const body=document.getElementById("wbWorkBody");if(body)body.innerHTML=wbDrawHTML();setTimeout(wbInitCanvas,0);}
function wbColor(c){wbRememberCanvas();WB.drawColor=c;WB.drawTool="pen";const body=document.getElementById("wbWorkBody");if(body)body.innerHTML=wbDrawHTML();setTimeout(wbInitCanvas,0);}
function wbRememberCanvas(){if(WB.canvas&&(WB.drew||WB.strokes)){try{WB.canvasData=wbCanvasJpeg(WB.canvas);}catch(e){}}WB.canvas=null;WB.ctx=null;}
function wbCanvasClear(){if(WB.ctx&&WB.canvas){WB.ctx.save();WB.ctx.setTransform(1,0,0,1,0,0);WB.ctx.fillStyle="#fff";WB.ctx.fillRect(0,0,WB.canvas.width,WB.canvas.height);WB.ctx.restore();}WB.drew=false;WB.strokes=0;WB.canvasData=null;const s=document.getElementById("wbDrawStatus");if(s){s.className="wb-workhint";s.textContent="Make a few strokes to show your thinking.";}wbRefreshSubmit();}
function wbCanvasJpeg(source){const max=600,sw=source.width,sh=source.height,scale=Math.min(1,max/sw),out=document.createElement("canvas");out.width=Math.max(1,Math.round(sw*scale));out.height=Math.max(1,Math.round(sh*scale));const x=out.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,out.width,out.height);x.drawImage(source,0,0,out.width,out.height);return out.toDataURL("image/jpeg",.6);}
function wbSendDrawing(meta){if(!WB.drew)return;let data=WB.canvasData;if(WB.canvas){try{data=wbCanvasJpeg(WB.canvas);}catch(e){}}if(!data)return;try{const base=typeof voiceBase==="function"&&voiceBase();if(base&&typeof window.lzSendWork==="function")window.lzSendWork(meta,data);}catch(e){}}

function wbActivate(k){WB.active=k;wbUpdateFieldButtons();}
function wbKey(k){if(!WB.active||!(WB.active in WB.fields))return;let v=WB.fields[WB.active];if(k==="⌫")v=v.slice(0,-1);else if(v.length<3)v=(v==="0"?k:v+k);WB.fields[WB.active]=v;wbUpdateFieldButtons();}
function wbUpdateFieldButtons(){document.querySelectorAll(".wb-num-box").forEach(b=>{const m=(b.getAttribute("onclick")||"").match(/wbActivate\('([^']+)'\)/);if(!m)return;const v=WB.fields[m[1]];b.textContent=v;b.classList.toggle("empty",v==="");b.classList.toggle("active",WB.active===m[1]);});wbRefreshSubmit();}
function wbRefreshSubmit(){const b=document.getElementById("wbSubmit");if(b){const ok=wbCanSubmit();b.disabled=!ok;if(b.classList&&b.classList.contains("lzq-check")){b.classList.toggle("wait",!ok);b.innerHTML=wbCheckLabel();}}document.querySelectorAll(".wb-key.go").forEach(k=>k.disabled=!wbCanSubmit());wbResumeSave();}
function wbToggleMulti(id){const i=WB.selected.indexOf(id);if(i>=0)WB.selected.splice(i,1);else WB.selected.push(id);wbRenderProblem(true);}
function wbPickPerson(n){if(WB.workTab==="draw")wbRememberCanvas();WB.person=n;wbRenderProblem(true);}
function wbMatchTap(side,id){if(side==="left"){WB.matchLeft=id;}else if(WB.matchLeft){Object.keys(WB.match).forEach(k=>{if(WB.match[k]===id)delete WB.match[k];});WB.match[WB.matchLeft]=id;WB.matchLeft=null;}wbRenderProblem(true);}
function wbDrag(e,id){if(e&&e.dataTransfer)e.dataTransfer.setData("text/plain",id);WB.matchLeft=id;}
function wbDrop(e,id){e.preventDefault();const left=(e.dataTransfer&&e.dataTransfer.getData("text/plain"))||WB.matchLeft;if(!left)return;Object.keys(WB.match).forEach(k=>{if(WB.match[k]===id)delete WB.match[k];});WB.match[left]=id;WB.matchLeft=null;wbRenderProblem(true);}
function wbCollectAnswer(){const p=WB.cur;if(p.type==="form"){const f={};p.fields.forEach(x=>f[x.key]=String(WB.fields[x.key]==null?"":WB.fields[x.key]).trim());return{f:f};}if(p.type==="fill")return{value:Number(WB.fields.ans)};if(p.type==="picture"){const a={eq:[0,1,2].map(i=>Number(WB.fields["e"+i]))};if(p.extraEq)a.eq2=[0,1,2].map(i=>Number(WB.fields["x"+i]));return a;}if(p.type==="story"){const a={eq:[0,1,2].map(i=>Number(WB.fields["e"+i])),value:Number(WB.fields.ans)};if(p.answer.remainder!=null)a.remainder=Number(WB.fields.rem);return a;}if(p.type==="multi")return{selected:WB.selected.slice()};if(p.type==="who"){const a={person:WB.person};if(p.valueAnswer!=null)a.value=Number(WB.fields.ans);return a;}if(p.type==="match")return{pairs:p.pairs.map(x=>[x.id,Number(WB.fields[x.id])])};if(p.type==="pair"){const a={product:Number(WB.fields.ans)};if(p.equations)a.equations=[[0,1,2].map(i=>Number(WB.fields["e"+i])),[0,1,2].map(i=>Number(WB.fields["x"+i]))];if(p.people)a.compare=WB.person;return a;}return null;}
function wbCompactAnswer(a){if(!a)return null;if(a.f)return a.f;if(a.eq)return{eq:a.eq,eq2:a.eq2,value:a.value,remainder:a.remainder};if(a.selected)return{selected:a.selected};if(a.person&&a.value==null)return a.person;if(a.pairs)return{pairs:a.pairs};if(a.product!=null)return{product:a.product,equations:a.equations,compare:a.compare};if(a.value!=null)return a.person?{person:a.person,value:a.value}:a.value;return a;}
/* Eb 2026-11-03: plain-text "shown / given / correct" for the parent answer log (P.qlog). Data only - nothing on screen changes. */
function wbLogInfo(p,a){try{
  const eqT=(op,v)=>(v&&v.length===3)?v[0]+" "+op+" "+v[1]+" = "+v[2]:"",blank=(op)=>"__ "+op+" __ = __",num=v=>(v==null||Number.isNaN(v))?"_":String(v);
  const optT=o=>o.id+". "+o.text,rightT=n=>p.rights&&p.rights[n-1]!=null?n+". "+p.rights[n-1]:String(n);
  let shown=String(p.q||""),given=null,correct=null;
  if(p.instruction&&p.instruction!==p.q)shown+=" ("+p.instruction+")";
  const v=p.visual||(p.type==="fill"?null:p.model);
  if(v&&v.kind==="array")shown+=" [picture: "+v.rows+" rows of "+v.cols+"]";else if(v&&v.kind==="groups")shown+=" [picture: "+v.groups+" groups of "+v.size+"]";
  if(p.type==="fill"){let used=false;shown+=" "+p.parts.map(x=>{if(x==="□"&&!used){used=true;return"__";}return x;}).join(" ");
    let u2=false;const fillIn=val=>p.parts.map(x=>{if(x==="□"&&!u2){u2=true;return val;}return x;}).join(" ");given=fillIn(num(a&&a.value));u2=false;correct=fillIn(p.answer);}
  else if(p.type==="form"){const fill=f=>p.rows.map(r=>String(r).replace(/\{[nt]:(\w+)\}/g,(m,k)=>f&&f[k]!=null&&f[k]!==""?f[k]:"__")).join(" / ");shown+=" "+fill(null);given=fill(a&&a.f);correct=(p.answerLines&&p.answerLines.length)?p.answerLines.join(" / "):fill(p.answer&&p.answer.f);}
  else if(p.type==="multi"){shown+=" Options: "+p.options.map(optT).join(" | ");given=p.options.filter(o=>a&&a.selected&&a.selected.includes(o.id)).map(optT);correct=p.options.filter(o=>o.true).map(optT);if(!given.length)given=["(none)"];}
  else if(p.type==="picture"||p.type==="story"){shown+=" Write: "+blank(p.eq.op)+(p.extraEq?" and "+blank(p.extraEq.op):"")+(p.type==="story"?" Answer: __ "+(p.unit||""):"");
    given=eqT(p.eq.op,a&&a.eq&&a.eq.map(num))+(p.extraEq?" and "+eqT(p.extraEq.op,a&&a.eq2&&a.eq2.map(num)):"")+(p.type==="story"?"; answer "+num(a&&a.value)+" "+(p.unit||"")+(a&&a.remainder!=null?" r "+num(a.remainder):""):"");
    correct=eqT(p.eq.op,p.answer.eq)+(p.extraEq?" and "+eqT(p.extraEq.op,p.extraEq.values):"")+(p.type==="story"?"; answer "+p.answer.value+" "+(p.unit||"")+(p.answer.remainder!=null?" r "+p.answer.remainder:""):"");}
  else if(p.type==="who"){shown+=" Choices: "+(p.people||[]).join(" / ");const want=p.answer&&p.answer.person!=null?p.answer.person:p.answer,val=p.answer&&p.answer.value!=null?p.answer.value:p.valueAnswer;
    given=String(a&&a.person)+(p.valueAnswer!=null?"; product "+num(a&&a.value):"");correct=String(want)+(val!=null?"; product "+val:"");}
  else if(p.type==="match"){shown+=(p.rights?" Choices: "+p.rights.map((r,i)=>(i+1)+". "+r).join(" | "):" Numbers: "+(p.numbers||[]).join(", "))+" Match: "+p.pairs.map(x=>x.left).join(" | ");
    const got={};((a&&a.pairs)||[]).forEach(x=>got[x[0]]=x[1]);const want={};(p.answer||[]).forEach(x=>want[x[0]]=x[1]);
    given=p.pairs.map(x=>x.left+" -> "+(p.rights?rightT(got[x.id]):num(got[x.id]))).join(" | ");correct=p.pairs.map(x=>x.left+" -> "+(p.rights?rightT(want[x.id]):want[x.id])).join(" | ");}
  else if(p.type==="pair"){shown+=" Write the shared product"+(p.equations?" and both equations":"")+(p.people?"; who has more? "+p.people.join(" / "):"");
    given=(a&&a.equations?a.equations.map(e=>eqT("×",e.map(num))).join(" and ")+"; ":"")+"product "+num(a&&a.product)+(a&&a.compare!=null?"; "+a.compare:"");
    correct=(p.equations?p.equations.map(e=>eqT("×",e)).join(" and ")+"; ":"")+"product "+p.answer.product+(p.answer.compare!=null?"; "+p.answer.compare:"");}
  return{shown:shown,given:given,correct:correct};
}catch(e){return null;}}
/* ---------- Explain questions (Eb, 2026-11-04, option A): mark the ANSWER only, save his "because" for the parent ---------- */
function wbIsExplain(p){return!!(p&&p.type==="form"&&(p.checks||[]).some(c=>c.t==="reason"));}
function wbExplainParts(p,f){
  f=f||{};const rk=(p.checks||[]).filter(c=>c.t==="reason").map(c=>c.k),ans=[],why=[];
  (p.rows||[]).forEach(r=>{const keys=[];String(r).replace(/\{[nt]:(\w+)\}/g,(m,k)=>{keys.push(k);return m;});
    if(keys.some(k=>rk.indexOf(k)>=0))keys.forEach(k=>{if(rk.indexOf(k)>=0)why.push(f[k]==null?"":String(f[k]));});
    else ans.push(String(r).replace(/\{[nt]:(\w+)\}/g,(m,k)=>f[k]==null||String(f[k]).trim()===""?"__":String(f[k]).trim()));});
  return{answer:ans.join(" / "),reason:why.join(" / ")};
}
/* Additive profile field P.explains (never touches older fields): one record per Explain attempt, reason kept exactly as typed. */
function wbSaveExplain(p,a,ok){
  try{
    if(!wbIsExplain(p)||typeof P==="undefined"||!P)return null;
    const x=wbExplainParts(p,(a&&a.f)||{});
    const rec={at:new Date().toISOString(),date:typeof today==="function"?today():new Date().toISOString().slice(0,10),lesson:(WB&&WB.lessonId)||p.lesson||"",q:p.q,answer:x.answer,ok:!!ok,reason:x.reason,model:p.explain||"",mode:WB&&WB.flex?(WB.phase==="fix"?"fix":"test"):"practice"};
    if(!Array.isArray(P.explains))P.explains=[];
    P.explains.push(rec);if(P.explains.length>1000)P.explains=P.explains.slice(-1000);
    return rec;
  }catch(e){return null;}
}
function wbModelHTML(p,reason){
  return'<div class="lzt-model" role="status">'+(reason?'<p class="lzt-you">You wrote: <i>because '+wbEscape(String(reason).trim().replace(/^because\s+/i,""))+'</i></p>':'')
   +'<p class="lzt-model-h">💬 Nice thinking! Here’s another way to say it:</p><p class="lzt-model-t">'+wbEscape(p.explain||"")+'</p></div>';
}
/* While he types an Explain answer, quietly pre-render the model line in the teacher voice so it plays at once. */
/* Spoken in sentence-sized pieces: the fixed opening is rendered once and cached for good; each new sentence is short
   enough for the teacher voice to make quickly. */
const WB_EXPLAIN_CHUNK=90;
function wbExplainLine(p){return(WB&&WB.flex?"Your answer is right! ":"Nice work. Your answer is correct. ")+wbModelSpoken(p);}
function wbWarmExplain(){
  const p=WB&&WB.cur;if(!wbIsExplain(p)||typeof warmTeacherLine!=="function")return;
  setTimeout(()=>{if(WB&&WB.cur===p&&!WB.answered){if(wbPickSet(p)){warmTeacherLine((WB.flex?"Your answer is right! ":"Nice work. Your answer is correct. ")+wbPickAsk(p)+" "+wbPickRightLine(p)+" "+wbPickWrongLine(p),WB_EXPLAIN_CHUNK);}else warmTeacherLine(wbExplainLine(p),WB_EXPLAIN_CHUNK);}},4000); // after the question read-out
}
function wbModelSpoken(p){return"Nice thinking! Here's another way to say it. "+lztSpeakable(p.explain||"");}
/* ---------- "Which reason is best?" (Eb, 2026-11-05): after the answer is marked he picks the best of 3 short reasons.
   Reasons come from code (no AI), built from the question's own words and numbers, so every generated variant (and an
   older saved test) gets a valid set. One is the concept reason from the model explanation; two are believable kid
   mistakes. One try, never a loop, and the pick never changes whether the ANSWER counted (tracked on P.explains). */
function wbPickSet(p){
  if(!wbIsExplain(p))return null;
  const q=String(p.q||""),f=(p.answer&&p.answer.f)||{},S=(best,w1,w2,why)=>({best:best,wrong:[w1,w2],why:why});let m;
  if(/two equations to represent/.test(q)){const v=Number((String(f.e1||"").match(/^(\d+)/)||[])[1])||5;
    return S("Adding a number to itself is 2 times it","You add 2 more to the number","Times always makes more than adding",v+" + "+v+" = "+2*v+" and 2 × "+v+" = "+2*v+". Same total.");}
  if((m=q.match(/knowing 5 × (\d+) help you remember (\d+) × 5\?/))&&m[1]===m[2]){const a=+m[1];
    return S("Switching the order doesn't change the answer","Switching the numbers makes the answer bigger","You add 5 and "+a+" to get it","5 × "+a+" and "+a+" × 5 are both "+5*a+".");}
  if((m=q.match(/Each (\w+) has 5 (\w+)/))){const u=m[1];
    return S("Each "+u+" has 5, so I count by 5s","You add 5 to the number of "+u+"s","Any number works, like 12 or 23","Every "+u+" adds 5 more: 10, 15, 20 … up to 50.");}
  if((m=q.match(/has 10 (\w+) of .*fewer than (\d+)/))){const c=m[1],b=+m[2];
    return S("10 equal "+c+", so it's 10 times a number","You add 10 to the number in each","Any number works, like 25 or 33","10 × 1 up to 10 × "+(b-1)+" makes 10, 20, 30 … up to "+10*(b-1)+".");}
  if((m=q.match(/ones place of a product of 10.*such as (\d+) × 10/))){const k=+m[1];
    return S("Every product of 10 ends in 0","Times 10 just adds 10 to the number","The ones digit is always the other number",k+" × 10 = "+10*k+". Products of 10 always end in 0.");}
  if((m=q.match(/knowing (\d+) × 5 help you remember/))){const a=+m[1];
    return S("10 is double 5, so the answer is double too","You add 5 more to "+a+" × 5","Just put a 0 on the end of "+5*a,a+" × 5 = "+5*a+", and "+5*a+" + "+5*a+" = "+10*a+".");}
  if(/orders the same number of .+ as /.test(q))
    return S("One each: a number times 1 is itself","Times 1 adds one more","Any number times 1 is 1","Each person gets 1, so any number × 1 stays that same number.");
  if((m=q.match(/says that (\d+) × (\d+) and (\d+) × (\d+) have the same product/))){const A=+m[1],B=+m[2],C=+m[3],D=+m[4];
    if(B===0&&D===0)return S("Any number times 0 is 0","Times 0 keeps the number the same","You add 0 to both numbers",A+" × 0 = 0 and "+C+" × 0 = 0.");
    if(B===1&&D===0)return S(A+" × 1 is "+A+", but "+C+" × 0 is 0","Times 1 and times 0 both give 0","A × sign always makes it bigger",A+" × 1 = "+A+" but "+C+" × 0 = 0. They are not the same.");
    return S("Switching the order doesn't change the answer","Times 1 always gives 1","You add 1 to "+A+" both times",A+" × 1 = "+A+" and 1 × "+A+" = "+A+".");}
  if((m=q.match(/use (\d+) \w+ in all, with none left over/))){const N=+m[1];
    return N%2===0?S(N+" is even, so it splits into pairs",N+" is even, so 1 would be left over","Any number can be put in pairs","2 × "+N/2+" = "+N+". Every one has a partner.")
      :S(N+" is odd, so 1 would be left over",N+" is odd, so it splits into pairs","Any number can be put in pairs","2 × "+(N-1)/2+" = "+(N-1)+", so 1 is left over.");}
  if((m=q.match(/fewer than (\d+) packets/))){const M=+m[1];
    return S("Each packet has 10, so it's a 10s number","You add 10 to the number of packets","Any number works, like 25 or 33","1 to "+(M-1)+" packets of 10 make 10, 20, 30 … up to "+10*(M-1)+".");}
  if(/Can one number show up when you skip count by 2s, by 5s and by 10s/.test(q))
    return S("Numbers that end in 0, like 10, are in all three counts","Every number shows up when you count by 2s","5 is odd, so no number can be in all three","10 = 2 × 5 = 5 × 2 = 10 × 1.");
  if((m=q.match(/Does (\d+) show up when you skip count by 2s, by 5s and by 10s/))){const N=+m[1];
    return N%10===0?S(N+" ends in 0, so it's in all three counts","It only works for 10, not for 2s or 5s","Every even number shows up when you count by 10s","Numbers that end in 0 can be made by 2s, 5s and 10s: "+N+" = 10 × "+N/10+".")
      :S(N+" doesn't end in 0, so you skip it when counting by 10s",N%2===0?"It's in the 2s count, so it's in all three":"It ends in 5, so it's in the 10s count","Any number over 10 shows up when you count by 10s","Counting by 10s always lands on numbers that end in 0. "+N+" ends in "+N%10+".");}
  return null;
}
/* Shuffled once per question (the same order is pre-warmed in the teacher voice while he types). */
function wbPickChoices(p){
  if(WB&&WB._pick&&WB._pick.p===p)return WB._pick.choices;
  const s=wbPickSet(p);if(!s)return null;
  const choices=wbShuffle([{t:s.best,best:true},{t:s.wrong[0],best:false},{t:s.wrong[1],best:false}]);
  if(WB)WB._pick={p:p,choices:choices,set:s,done:false,rec:null,tail:"",tok:0};
  return choices;
}
function wbPickAsk(p){const c=wbPickChoices(p);return c?"Which reason is best? "+c.map(x=>lztSpeakable(x.t)+".").join(" "):"";}
function wbPickRightLine(p){return"Yes! That is the best reason. "+lztSpeakable(p.explain||"");}
function wbPickWrongLine(p){const s=wbPickSet(p);return s?"Not quite. The best reason is: "+lztSpeakable(s.best)+". "+lztSpeakable(s.why):"";}
/* The pick card. `tail` (model explanation + Next buttons) is shown only after he picks. */
function wbPickHTML(p,rec,tail){
  const c=wbPickChoices(p);if(!c)return tail;
  WB._pick.rec=rec||null;WB._pick.tail=tail;WB._pick.done=false;
  return'<div class="lzp" id="lzpBox"><h3 class="lzp-h"><span aria-hidden="true">🤔</span> Which reason is best?</h3><div class="lzp-list">'
    +c.map((x,i)=>'<button type="button" class="lzp-btn" id="lzpBtn'+i+'" onclick="wbPickTap('+i+')"><span class="lzp-k" aria-hidden="true">'+"ABC"[i]+'</span><span class="lzp-t">'+wbEscape(x.t)+'</span></button>').join("")
    +'</div><div id="lzpOut" aria-live="polite"></div></div>';
}
function wbPickTap(i){
  const k=WB&&WB._pick;if(!k||k.done||!k.choices[i])return;k.done=true;
  const pick=k.choices[i],ok=!!pick.best,best=k.choices.find(x=>x.best),p=k.p;
  k.choices.forEach((x,j)=>{const b=document.getElementById("lzpBtn"+j);if(!b)return;b.disabled=true;b.setAttribute("aria-disabled","true");
    if(x.best)b.classList.add("best");if(j===i)b.classList.add("picked",ok?"right":"wrong");if(!x.best&&j!==i)b.classList.add("dim");});
  const rec=k.rec;if(rec){rec.picked=pick.t;rec.pickOk=ok;rec.choices=k.choices.map(x=>x.t);rec.pickBest=best.t;rec.pickAt=new Date().toISOString();}
  if(typeof save==="function")save();
  if(typeof sfx==="function")sfx(ok?"correct":"wrong");
  const out=document.getElementById("lzpOut");
  if(out)out.innerHTML=(ok?'<div class="lzp-res good" role="status"><b>⭐ Yes! That’s the best reason.</b></div>'
    :'<div class="lzp-res try" role="status"><b>Not quite. The best reason is the green one.</b><span>'+wbEscape(k.set.why)+'</span></div>')+k.tail;
  lzqWake();try{const n=document.getElementById("lzpOut");if(n&&n.scrollIntoView)n.scrollIntoView({block:"nearest",behavior:"smooth"});}catch(e){}
  if(typeof say==="function")say(ok?wbPickRightLine(p):wbPickWrongLine(p),{chunk:WB_EXPLAIN_CHUNK});
}
function wbPickIntoView(){try{const b=document.getElementById("lzpBox");if(b&&b.scrollIntoView)b.scrollIntoView({block:"nearest",behavior:"smooth"});}catch(e){}}
function wbSubmit(){
  if(!wbCanSubmit()){if(typeof toast==="function")toast(wbWorkDone()?"Finish every answer box first":"Show your work first");return;}
  WB.answered=true;wbBarAnswered();if(WB.workTab==="draw")wbRememberCanvas();const p=WB.cur,a=wbCollectAnswer(),ok=wbCheck(p,a);WB.lastAnswer=a;WB.lastOK=ok;WB.explainRec=wbSaveExplain(p,a,ok);const built=wbBuiltRecord(),rec={lesson:WB.lessonId,type:p.type,q:p.q,answer:wbCompactAnswer(a),correct:ok,built:built,drew:!!WB.drew,at:new Date().toISOString()};
  const data=wbData();data.log.push(rec);if(data.log.length>2000)data.log=data.log.slice(-2000);if(!WB.isTwin&&!WB.flex){WB.results.push(ok);let g="";try{const li=wbLogInfo(p,a);g=li&&li.given!=null?(Array.isArray(li.given)?li.given.join(", "):String(li.given)):"";}catch(e){}WB.hist=wbHist().concat([{n:WB.index+1,q:p.q,given:g,ok:ok}]).slice(-12);}if(typeof logQuestion==="function")logQuestion("workbook","math","reveal "+WB.lessonId+" workbook","workbook:"+WB.lessonId,p.q,ok,0,Date.now()-WB.startedAt,wbLogInfo(p,a));else if(typeof save==="function")save();wbSendDrawing(rec);if(typeof save==="function")save();if(typeof sfx==="function")sfx(ok?"correct":"wrong");if(WB.flex){lztAfterAnswer(ok,a);return;}wbRenderFeedback(ok,a);
}
function wbCorrectEquation(p){if(p.type==="fill"){let used=false;return p.parts.map(x=>{if(x==="□"&&!used){used=true;return p.answer;}return x;}).join(" ");}if(p.eq)return p.eq.values[0]+" "+p.eq.op+" "+p.eq.values[1]+" = "+p.eq.values[2];return"";}
function wbCorrectAnswerHTML(p){if(p.type==="form")return'<div class="wb-multi-review">'+(p.answerLines||[]).map(l=>'<div class="wb-multi-line"><b>'+wbEscape(l)+'</b></div>').join("")+'</div>';if(p.type==="multi")return'<div class="wb-multi-review">'+p.options.map(o=>'<div class="wb-multi-line"><b>'+(o.true?'✓':'✗')+' '+o.id+'. '+wbEscape(o.text)+'</b><br>'+wbEscape(o.why)+'</div>').join("")+'</div>';if(p.type==="match")return'<div class="wb-multi-review">'+p.pairs.map(x=>'<div class="wb-multi-line">'+wbEscape(x.left)+' ↔ '+wbEscape(x.right)+'</div>').join("")+'</div>';if(p.type==="pair"){let h=(p.equations||[]).map(e=>'<div class="wb-review-eq">'+e[0]+' × '+e[1]+' = '+e[2]+'</div>').join("");h+='<div class="wb-review-eq">Shared product: '+p.answer.product+'</div>';if(p.answer.compare)h+='<div class="wb-review-eq">Who has more? '+wbEscape(p.answer.compare)+'</div>';return h;}if(p.type==="who"){const who=p.answer&&p.answer.person!=null?p.answer.person:p.answer;return'<p><b>'+wbEscape(who)+(who==="Yes"?' — the shared product is '+p.valueAnswer:' is right.')+'</b></p>';}let h=wbCorrectEquation(p)?'<div class="wb-review-eq">'+wbEscape(wbCorrectEquation(p))+'</div>':'';if(p.extraEq)h+='<div class="wb-review-eq">'+wbEscape(p.extraEq.values[0]+" "+p.extraEq.op+" "+p.extraEq.values[1]+" = "+p.extraEq.values[2])+'</div>';if(p.type==="story")h+='<div class="wb-review-eq">Answer: '+p.answer.value+' '+wbEscape(p.unit)+(p.answer.remainder!=null?' and '+p.answer.remainder+' '+wbEscape(p.remainderUnit):'')+'</div>';return h;}
function wbRenderFeedback(ok,a){
  const p=WB.cur,model=p.model||p.visual,head=ok?(WB.isTwin?"You got the new one!":"Yes — nice work!"):"Let’s look at the model.",voice=ok?"Nice work. Your answer is correct.":"Good try. Look at the model and the equation.";
  const hasPick=!!wbPickSet(p),why=wbIsExplain(p)?wbExplainParts(p,(a&&a.f)||{}).reason:"",twin=!ok&&!WB.isTwin,last=WB.index===(WB.size||8)-1;
  // ONE primary in the bar (Eb 2026-11-05): Try one like it (missed) or Next / See my score; a reason pick keeps it waiting until he picks
  const go=twin?'Try one like it ↻':(last?'See my score ▶':'Next ▶'),fn=twin?'wbTryTwin()':'wbContinue()';
  const prim=hasPick?'<button type="button" id="wbNextBtn" class="lzq-check wait" onclick="'+fn+'" data-go="'+go+'" disabled>'+go+'</button>':lzqPrimary("wbNextBtn",go,fn,false,twin?"try":"");
  app.innerHTML='<div class="fadein wb-shell lzq wb-prac"><div class="wb-page">'+wbQHead(WB.lessonId)+wbPracticeStripHTML()+'<div class="wb-feedback '+(ok?'good':'try')+'"><h2>'+(ok?'✓ ':'')+wbEscape(head)+'</h2>'+(!ok&&model?'<div class="wb-visual">'+wbVisual(model)+'</div>':'')+wbCorrectAnswerHTML(p)+(hasPick?wbPickHTML(p,WB.explainRec,wbModelHTML(p,why)):(wbIsExplain(p)?wbModelHTML(p,why):'<div class="wb-teach">'+wbEscape(p.explain||"Use the model to check each number in the equation.")+'</div>'))+'</div>'+lzqBarHTML(prim)+'</div></div>';
  wbPracticeChrome();
  wbResumeSave();if(hasPick)wbPickIntoView();if(typeof say==="function")say(hasPick?(ok?"Nice work. Your answer is correct. ":"Good try. Look at the model and the answer. ")+wbPickAsk(p):wbIsExplain(p)&&ok?wbExplainLine(p):voice+" "+(wbIsExplain(p)?wbModelSpoken(p):(p.explain||"")),{chunk:WB_EXPLAIN_CHUNK});
}
function wbTryTwin(){const original=WB.cur,type=original.type;let twin=null;for(let tries=0;tries<10&&!twin;tries++){const osig=wbSig(original),pool=wbGenerate(WB.lessonId,30).filter(x=>x.type===type&&(original.slot==null||x.slot===original.slot)&&wbSig(x)!==osig);if(pool.length)twin=wbPick(pool);}if(!twin){wbContinue();return;}wbLoadProblem(twin,true);}
function wbContinue(){WB.index++;if(WB.index>=(WB.size||8))return wbFinish();wbLoadProblem(WB.problems[WB.index],false);}
function wbFinish(){
  const size=WB.size||8,score=WB.results.filter(Boolean).length,data=wbData(),old=data.best[WB.lessonId];
  if(!WB.reveal){data.best[WB.lessonId]=old==null?score:Math.max(old,score);}
  if(WB.reveal&&typeof sessClear==="function")sessClear();if(typeof save==="function")save();if(typeof syncProgress==="function")syncProgress("finish");if(score>=Math.ceil(size*0.8)&&typeof confetti==="function")confetti();
  const marks=WB.results.map((ok,i)=>'<span class="wb-resultdot '+(ok?'good':'bad')+'">'+(i+1)+' '+(ok?'✓':'✗')+'</span>').join(""),id=WB.lessonId;
  const buttons=WB.reveal?'<button class="wb-primary" onclick="window.wbRevealExit&&window.wbRevealExit(\''+id+'\')">Back to the lesson ▶</button>':'<button class="wb-primary" onclick="wbStart(\''+id+'\')">Play again ↻</button><button class="wb-secondary" onclick="renderHome()">🏠 Home</button><button class="wb-secondary" onclick="renderWorkbookPicker()">📒 Lessons</button>';
  app.innerHTML='<div class="fadein wb-shell"><div class="wb-page wb-finish"><div class="wb-kicker">Lesson '+wbEscape(id)+' · '+(WB.reveal?'Practice':'Workbook Practice')+'</div><h1 class="wb-title">Practice complete!</h1><div class="wb-score">'+score+' / '+size+'</div><p style="font-size:20px">'+(score===size?'Every problem is correct — excellent explaining and modeling!':score>=size*0.75?'Strong work. Your models are helping your multiplication and division grow.':'You kept showing your thinking. That is how mathematicians learn!')+'</p><div class="wb-resultdots">'+marks+'</div><div class="wb-btnrow">'+buttons+'</div></div></div>';
  if(typeof say==="function")say("Workbook practice complete. You got "+score+" out of "+size+".");
  if(WB.reveal&&typeof window!=="undefined"&&typeof window.wbRevealDone==="function")window.wbRevealDone(id,score,size);
}
function wbRevealReview(id){const L=WB_LESSONS[id];if(!L)return"";return'<section class="wb-review"><div><h2>Review</h2><p>'+wbEscape(L.review)+'</p><div class="wb-review-eq">'+wbEscape(L.reviewEq)+'</div></div><div class="wb-review-visual">'+wbVisual(L.reviewModel)+'</div></section>';}

/* ===================== Flexible lesson test (Eb 2026-11-04, "it should be more flexible") =====================
   Used by the Reveal lessons that run on this engine (REVEAL_FLEX in reveal.js: 3-7, 4-1..4-5).
   1. Instant feedback: right -> a short varied praise line (recorded teacher clips); wrong -> "Not quite right" + a tip,
      then Try again or Next (it comes back in the fix round).
   2. Question strip (done / to fix / skipped / not yet) with Back and Skip; tap any dot to jump.
   3. After the first pass, ONLY the missed or skipped questions come back, each after a tip card built from his
      own answer. 4. Every question right = lesson passed (P.revealPass) and the next lesson opens.
   State lives in P.revealTest[id] (saved on every step), so Back, closing the app or the locked screen all resume it. */
const LZT_PRAISE=["Great!","Well done!","You got it!","Nice thinking!","Exactly right!","Brilliant!"]; // each is a recorded teacher-voice clip
let _lztBag=[],_lztLastPraise="",_lztTok=0;
function lztPraiseLine(){if(!_lztBag.length){_lztBag=wbShuffle(LZT_PRAISE);if(_lztBag[0]===_lztLastPraise)_lztBag.push(_lztBag.shift());}_lztLastPraise=_lztBag.shift();return _lztLastPraise;}
function lztSpeakable(t){return String(t||"").replace(/□|__+/g," blank ").replace(/×/g," times ").replace(/÷/g," divided by ").replace(/(\d)\s*[−-]\s*(\d)/g,"$1 minus $2").replace(/\+/g," plus ").replace(/=/g," equals ").replace(/\s+/g," ").trim();}
function lztKid(n){return n===1?"1 question":n+" questions";}
function lztStatus(id){
  const t=typeof P!=="undefined"&&P&&P.revealTest&&P.revealTest[id];if(!t||!Array.isArray(t.st)||!t.st.length)return null;
  const left=t.st.filter(x=>x.s!=="right").length;if(!left)return null;
  return{phase:t.phase,left:left,total:t.st.length,at:Math.min(t.st.length,(t.index||0)+1),dots:t.st.map(x=>x.s)};
}
function lztDotsHTML(dots,live,cur){
  // colour + icon carry the meaning (no text legend for kids): ✓ done, ! to fix, » skipped, number = not yet, filled blue = now
  const name={right:"done",wrong:"to fix",skip:"skipped",todo:"not yet"},ic={right:"✓",wrong:"!",skip:"»"};
  return'<div class="lzt-dots'+(live?' live':'')+'"'+(live?'':' role="img" aria-label="'+dots.filter(s=>s==="right").length+' of '+dots.length+' done"')+'>'+dots.map((s,i)=>{const now=cur!=null&&i===cur,inner=now?String(i+1):(ic[s]||String(i+1));
    return live?'<button type="button" class="lzt-dot '+s+(now?' cur':'')+'" onclick="lztJump('+i+')" aria-label="Question '+(i+1)+', '+name[s]+(now?', now':'')+'"'+(now?' aria-current="step"':'')+'><span class="lzt-dc">'+inner+'</span></button>':'<span class="lzt-dot '+s+(now?' cur':'')+'"><span class="lzt-dc">'+inner+'</span></span>';}).join("")+'</div>';
}
/* the colour key lives behind a small ⓘ (Eb 2026-11-05: no text legend for kids) */
function lztInfoBtn(){return'<button type="button" class="lzt-info" onclick="lztLegendToggle(this)" aria-expanded="false" aria-label="What the colours mean"><span aria-hidden="true">ⓘ</span></button>';}
function lztLegendHTML(){return'<div class="lzt-legend" hidden><span><i class="cur"></i>now</span><span><i class="right">✓</i>done</span><span><i class="wrong">!</i>to fix</span><span><i class="skip">»</i>skipped</span><span><i class="todo"></i>not yet</span></div>';}
function lztLegendToggle(b){const st=b&&b.closest&&b.closest(".lzt-strip"),l=st&&st.querySelector(".lzt-legend");if(!l)return;l.hidden=!l.hidden;b.setAttribute("aria-expanded",String(!l.hidden));}
function lztStripHTML(){
  const st=WB.st||[],fix=WB.phase==="fix";
  return'<div class="lzt-strip"><div class="lzt-count"><b>Question '+(WB.index+1)+' of '+st.length+'</b>'+(fix?'<span class="lzt-fixchip">Fix round: '+st.filter(x=>x.s!=="right").length+' left</span>':'')+lztInfoBtn()+'</div>'
   +lztDotsHTML(st.map(x=>x.s),true,WB.index)+lztLegendHTML()+'</div>';
}
function lztRefreshStrip(){const old=document.querySelector(".lzt-strip");if(!old)return;const tmp=document.createElement("div");tmp.innerHTML=lztStripHTML();old.replaceWith(tmp.firstElementChild);}
function lztSnapUI(){const o={};["fields","selected","match","person","groupDots","rows","cols","pairBuild"].forEach(k=>{if(WB[k]!==undefined)o[k]=WB[k];});return JSON.parse(JSON.stringify(o));}
/* Bring his last answer back only where editing it makes sense (typed words, ticked choices); number boxes start empty. */
function lztKeepUI(p){return p&&(p.type==="form"||p.type==="multi"||p.type==="who");}
function lztSave(){
  if(!WB||!WB.flex||typeof P==="undefined"||!P)return;
  P.revealTest=P.revealTest||{};
  P.revealTest[WB.lessonId]={lessonId:WB.lessonId,size:WB.size,phase:WB.phase,index:WB.index,scored:!!WB.scored,introShown:!!WB.introShown,start:WB.start,t:Date.now(),seeded:WB.seeded||null,problems:WB.problems,st:WB.st};
  if(typeof save==="function")save();
}
function lztNewState(id,saved){
  if(saved){const t=JSON.parse(JSON.stringify(saved));return{lessonId:id,size:t.st.length,reveal:true,flex:true,problems:t.problems,st:t.st,phase:t.phase||"test",index:Math.max(0,Math.min(t.st.length-1,t.index||0)),scored:!!t.scored,introShown:!!t.introShown,start:t.start||Date.now(),seeded:t.seeded||null,results:[],cur:null,isTwin:false,answered:false};}
  const size=10,problems=wbGenerate(id,size);
  return{lessonId:id,size:size,reveal:true,flex:true,problems:problems,st:problems.map(()=>({s:"todo",first:null,tries:0})),phase:"test",index:0,scored:false,start:Date.now(),results:[],cur:null,isTwin:false,answered:false};
}
function lztStart(id){
  if(typeof P==="undefined"||!P)return;
  if(typeof revealUnit4Gate==="function"){const gate=revealUnit4Gate(P,id);if(!gate.allowed){if(typeof renderRevealLockedLesson==="function")renderRevealLockedLesson(id,gate);return;}}
  if(typeof clearTimers==="function")clearTimers();if(typeof closeOverlay==="function")closeOverlay();
  const saved=P.revealTest&&P.revealTest[id];
  WB=lztNewState(id,saved&&Array.isArray(saved.st)&&saved.st.some(x=>x.s!=="right")?saved:null);
  if(WB.phase==="fix"&&!WB.introShown){WB.introShown=true;lztSave();return lztFixIntro();}
  lztSave();lztShow();
}
function lztShow(){
  const i=WB.index,st=WB.st[i],p=WB.problems[i];
  if(WB.phase==="fix"&&st.s!=="right"&&!st.tipShown)return lztFixTip(i);
  if(!p){lztDoneOnly(i);return;}
  const keep=st.ui&&st.s!=="right"&&lztKeepUI(p)?st.ui:null;
  wbLoadProblem(p,false,st.s==="right"?st.ui:keep,st.s==="right");
  if(st.s==="right")lztShowDone(i);
}
function lztAfterRender(){
  const id=WB.lessonId;
  if(typeof lzBack==="function")lzBack(lztExit,"Exit lesson",{exit:true});
  const st=WB.st[WB.index];
  if(st&&st.s==="wrong"&&st.tip&&!WB.answered){const area=document.querySelector(".wb-answerarea");if(area)area.insertAdjacentHTML("afterbegin",'<div class="lzt-hint"><b>💡 Tip:</b> '+wbEscape(st.tip)+'</div>');}
}
function lztExit(){lztSave();_lztTok++;if(typeof renderRevealLesson==="function")renderRevealLesson(WB.lessonId,{fromTest:true});}
/* the one primary after answering goes in the bar (inline row only if a screen has no bar) */
function lztNextHTML(){return lzqPrimary("lztNextBtn","Next ▶","lztNext()",false,"next");}
function lztPlaceMain(html,area){if(!lzqSetMain(html)&&area)area.insertAdjacentHTML("beforeend",'<div class="lzt-row">'+html.replace('class="lzq-check','class="lzt-btn lzt-next')+'</div>');}
function lztShowDone(i){
  WB.answered=true;const area=document.querySelector(".wb-answerarea");
  document.querySelectorAll(".wb-answerarea button,.wb-answerarea input,.wb-work button").forEach(b=>{if(!b.closest(".lzt-row"))b.disabled=true;});
  if(area)area.insertAdjacentHTML("beforeend",'<div class="lzt-praise lzt-static" role="status"><span class="lzt-star" aria-hidden="true">✓</span><b>You got this one right.</b></div>'+(wbIsExplain(WB.cur)?wbModelHTML(WB.cur,""):""));
  lztPlaceMain(lztNextHTML(),area);
}
function lztDoneOnly(i){ // a question already right in his last test (rebuilt from the answer log): nothing to redo
  const id=WB.lessonId;
  app.innerHTML='<div class="fadein wb-shell lzq lzt-test"><div class="wb-page">'+wbQHead(id)+lztStripHTML()+'<div class="lzt-card lzt-note"><p class="lzt-big">✓ You got question '+(i+1)+' right last time. Nothing to fix here!</p></div>'+lzqBarHTML(lztNextHTML())+'</div></div>';
  if(typeof lzBack==="function")lzBack(lztExit,"Exit lesson",{exit:true});
}
function lztAfterAnswer(ok,a){
  const i=WB.index,st=WB.st[i],p=WB.cur;let info=null;try{info=wbLogInfo(p,a);}catch(e){}
  st.ui=lztSnapUI();st.given=info&&info.given!=null?(Array.isArray(info.given)?info.given.join(", "):String(info.given)):"";
  if(ok){if(st.first===null||st.first===undefined)st.first=true;st.s="right";st.tip="";st.why="";lztSave();if(wbIsExplain(p))lztExplainPraise(p,a);else lztPraise();}
  else{if(st.first===null||st.first===undefined)st.first=false;st.s="wrong";st.tries=(st.tries||0)+1;const t=lztTip(p,a);st.tip=t.tip;st.why=t.why;st.tipShown=true;lztSave();lztWrong(t,st.tries);}
}
function lztPraise(){
  const line=lztPraiseLine(),tok=++_lztTok,area=document.querySelector(".wb-answerarea");lztRefreshStrip();
  if(area)area.innerHTML='<div class="lzt-praise" role="status"><span class="lzt-star" aria-hidden="true">⭐</span><b>'+wbEscape(line)+'</b></div>';
  lztPlaceMain(lztNextHTML(),area);
  const t0=Date.now(),go=()=>setTimeout(()=>{if(tok===_lztTok&&document.getElementById("lztNextBtn"))lztNext();},Math.max(0,1300-(Date.now()-t0)));
  lztIntoView("lztNextBtn");
  if(typeof sayAndThen==="function")sayAndThen(line,go,2600);else{if(typeof say==="function")say(line);go();}
}
/* his own answer, e.g. "6 × 5 = 30 ✓", so the "Your answer is right!" banner refers to something (Eb 2026-11-05 polish) */
function lztAnswerLineHTML(p,a){try{const f=(a&&a.f)||WB.fields||{},rows=(p.rows||[]).filter(r=>!/\{t:r\}/.test(String(r)));if(!rows.length)return"";
  const out=rows.map(r=>String(r).split(/(\{[nt]:\w+\})/).map(x=>{const m=/^\{([nt]):(\w+)\}$/.exec(x);return m?'<b>'+wbEscape(String(f[m[2]]==null?"":f[m[2]]).trim())+'</b>':wbEscape(x);}).join("").trim()).filter(Boolean);
  return out.length?'<div class="lzt-yours" role="status">'+out.map(t=>'<span>'+t+' <i aria-hidden="true">✓</i></span>').join("")+'</div>':"";}catch(e){return"";}}
function lztExplainPraise(p,a){ // answer right on an Explain question: no score for the reason, just the model explanation (spoken); Next when ready
  _lztTok++;const area=document.querySelector(".wb-answerarea");lztRefreshStrip();
  const why=wbExplainParts(p,(a&&a.f)||{}).reason;
  const tail=wbModelHTML(p,why),hasPick=!!wbPickSet(p);
  const ins=document.querySelector(".wb-questionarea .wb-instruction");if(ins)ins.remove();
  if(area)area.innerHTML=lztAnswerLineHTML(p,a)+'<div class="lzt-praise lzt-praise-explain" role="status"><span class="lzt-star" aria-hidden="true">⭐</span><b>Your answer is right!</b></div>'+(hasPick?wbPickHTML(p,WB.explainRec,tail):tail);
  // reason pick: Next waits (slate) in the bar until he picks
  lztPlaceMain(hasPick?'<button type="button" id="lztNextBtn" class="lzq-check next wait" onclick="lztNext()" data-go="Next ▶" disabled>Next ▶</button>':lztNextHTML(),area);
  if(hasPick)wbPickIntoView();else lztIntoView("lztNextBtn");
  if(typeof say==="function")say(hasPick?"Your answer is right! "+wbPickAsk(p):wbExplainLine(p),{chunk:WB_EXPLAIN_CHUNK});
}
function lztWrong(t,tries){
  _lztTok++;const area=document.querySelector(".wb-answerarea"),p=WB.cur,shown=tries>=3;lztRefreshStrip();
  const body=shown?'<p class="lzt-why">Here is how this one works:</p>'+wbCorrectAnswerHTML(p)+'<p class="lzt-tipline">'+wbEscape(p.explain||"")+'</p>':(t.why?'<p class="lzt-why">'+wbEscape(t.why)+'</p>':'')+'<p class="lzt-tipline"><b>💡 Tip:</b> '+wbEscape(t.tip)+'</p>';
  if(area)area.innerHTML='<div class="lzt-tip" role="alert"><h3>Not quite right. That\'s OK!</h3>'+body+'</div>'+(WB.phase==="test"?'<p class="lzt-small">Tap Skip to move on. This one comes back at the end with its tip.</p>':'');
  // one primary: Try again (Skip ▶ in the bar moves on)
  lztPlaceMain(shown?lzqPrimary("lztTryBtn","↻ Try a new one","lztFresh()",false,"try"):lzqPrimary("lztTryBtn","↻ Try again","lztRetry()",false,"try"),area);
  lztIntoView("lztTryBtn");
  if(typeof say==="function")say(shown?"That's not quite right. Here is how this one works. Then try a new one like it.":"That's not quite right. "+lztSpeakable(t.tip));
}
function lztIntoView(id){try{const e=document.getElementById(id);if(e&&e.scrollIntoView)e.scrollIntoView({block:"nearest",behavior:"smooth"});}catch(x){}}
function lztRetry(){_lztTok++;if(typeof stopRecorded==="function")stopRecorded();lztShow();}
function lztFresh(){ // after 3 misses on one question he sees the worked answer, then gets a NEW one of the same kind (still must be right)
  _lztTok++;const i=WB.index,o=WB.problems[i];let twin=null;
  for(let k=0;k<12&&!twin;k++){const pool=wbGenerate(WB.lessonId,30).filter(x=>x.type===o.type&&(o.slot==null||x.slot===o.slot)&&wbSig(x)!==wbSig(o));if(pool.length)twin=wbPick(pool);}
  if(twin){twin.slot=o.slot;WB.problems[i]=twin;}
  const st=WB.st[i];st.tries=0;st.ui=null;st.tip="";st.why="";lztSave();lztShow();
}
function lztGo(i){if(!WB||!WB.flex||i<0||i>=WB.st.length)return;_lztTok++;if(typeof stopRecorded==="function")stopRecorded();WB.index=i;lztSave();lztShow();}
function lztJump(i){lztGo(i);}
function lztPrev(){if(WB&&WB.index>0)lztGo(WB.index-1);}
function lztSkip(){if(!WB||!WB.flex)return;const st=WB.st[WB.index];if(st.s==="todo")st.s="skip";lztNext();}
function lztNext(){
  if(!WB||!WB.flex)return;_lztTok++;if(typeof stopRecorded==="function")stopRecorded();
  const n=WB.st.length,from=WB.index,want=WB.phase==="test"?(x=>x.s==="todo"):(x=>x.s!=="right");
  for(let k=1;k<=n;k++){const j=(from+k)%n;if(want(WB.st[j])){WB.index=j;lztSave();return lztShow();}}
  if(WB.phase==="test"){const open=WB.st.findIndex(x=>x.s!=="right");if(open<0)return lztPassed();return lztFirstPassDone();}
  if(WB.st.every(x=>x.s==="right"))return lztPassed();
}
function lztRecordScore(){
  if(WB.scored)return;WB.scored=true;const first=WB.st.filter(x=>x.first===true).length;
  if(typeof window!=="undefined"&&typeof window.wbRevealDone==="function")window.wbRevealDone(WB.lessonId,first,WB.st.length);
}
function lztFirstPassDone(){
  lztRecordScore();WB.phase="fix";WB.st.forEach(x=>{if(x.s!=="right")x.tipShown=false;});
  WB.index=WB.st.findIndex(x=>x.s!=="right");WB.introShown=true;lztSave();
  if(typeof syncProgress==="function")syncProgress("finish");lztFixIntro(true);
}
function lztFixIntro(afterTest){
  const id=WB.lessonId,right=WB.st.filter(x=>x.s==="right").length,left=WB.st.length-right,next=typeof revealNextInUnit==="function"?revealNextInUnit(id):null;
  const passedAlready=typeof revealProfilePassed==="function"&&revealProfilePassed(P,id);
  const unlock=next&&!passedAlready?' Fix '+(left===1?'it':'them all')+' to unlock Lesson '+next.id+'.':'';
  const head=afterTest?'You got '+right+' of '+WB.st.length+' right!':'Let\'s fix the ones you missed';
  const msg='Now fix the '+lztKid(left)+' you missed. Each one comes with a tip first.'+unlock;
  app.innerHTML='<div class="fadein wb-shell lzt-test"><div class="wb-page">'+wbPageHead(id)+'<section class="lzt-card lzt-result"><div class="lzt-score"><b>'+right+'</b><span>/'+WB.st.length+'</span></div><h2 class="lzt-h">'+wbEscape(head)+' ⭐</h2><p class="lzt-big">'+wbEscape(msg)+'</p>'+lztDotsHTML(WB.st.map(x=>x.s),false)
    +'<p class="lzt-small">You only redo these. Everything you got right stays done.</p><div class="lzt-row"><button type="button" class="lzt-btn lzt-go" id="lztFixGo" onclick="lztShow()">Fix '+(left===1?'it':'them')+' now ▶</button></div></section></div></div>';
  if(typeof lzBack==="function")lzBack(lztExit,"Exit lesson",{exit:true});
  if(typeof say==="function")say((afterTest?"You got "+right+" right! ":"")+"Now let's fix the other "+left+". Each one comes with a tip.");
}
function lztFixTip(i){
  const id=WB.lessonId,st=WB.st[i],p=WB.problems[i];
  if(!st.tip){const t=lztTip(p,st.s==="skip"?null:lztParseGiven(p,st.given),st.given);st.tip=t.tip;st.why=t.why;}
  const why=st.s==="skip"?"You skipped this one.":st.like?"This one is like a question you missed last time.":(st.why||"");
  app.innerHTML='<div class="fadein wb-shell lzq lzt-test"><div class="wb-page">'+wbQHead(id)+lztStripHTML()+'<section class="lzt-card lzt-fix"><div class="lzt-kicker">Let\'s fix question '+(i+1)+'</div><p class="lzt-q">'+wbEscape(p?p.q:"")+'</p>'
    +(st.s==="wrong"&&st.given?'<p class="lzt-you">You answered: <b>'+wbEscape(st.given)+'</b></p>':'')
    +(why?'<p class="lzt-why">'+wbEscape(why)+'</p>':'')+'<p class="lzt-tipline"><b>💡 Tip:</b> '+wbEscape(st.tip)+'</p>'
    +'</section>'+lzqBarHTML(lzqPrimary("lztReady","I\'m ready ▶","lztFixGo()",false,"go"))+'</div></div>';
  if(typeof lzBack==="function")lzBack(lztExit,"Exit lesson",{exit:true});
  if(typeof say==="function")say("Let's fix this one. "+lztSpeakable((why?why+" ":"")+"Here is a tip. "+st.tip));
}
function lztFixGo(){const st=WB.st[WB.index];st.tipShown=true;lztSave();lztShow();}
function lztPassed(){
  const id=WB.lessonId,next=typeof revealNextInUnit==="function"?revealNextInUnit(id):null;lztRecordScore();_lztTok++;
  P.revealPass=P.revealPass||{};const had=!!P.revealPass[id];if(!had)P.revealPass[id]={how:"all",date:typeof today==="function"?today():"",t:Date.now()};
  if(P.revealTest)delete P.revealTest[id];if(typeof sessClear==="function")sessClear();if(typeof save==="function")save();
  if(typeof markTodayPlanDone==="function")try{markTodayPlanDone("reveal",id);}catch(e){}
  if(typeof syncProgress==="function")syncProgress("finish");if(typeof confetti==="function")confetti();
  const L=typeof revealLesson==="function"?revealLesson(id):null,u=L?L.u:4,seq=typeof revealProfileIsPrince==="function"&&revealProfileIsPrince(P);
  const nextOpen=next&&(typeof revealUnit4Gate!=="function"||revealUnit4Gate(P,next.id).allowed);
  const msg='Every question is right.'+(next?(nextOpen?(seq?' Lesson '+next.id+' is unlocked!':' Lesson '+next.id+' is next!'):''):' You finished this unit!');
  app.innerHTML='<div class="fadein wb-shell lzt-test"><div class="wb-page">'+wbPageHead(id)+'<section class="lzt-card lzt-passed"><div class="lzt-burst" aria-hidden="true">⭐</div><h2 class="lzt-h">Lesson '+wbEscape(id)+' passed!</h2><p class="lzt-big">'+wbEscape(msg)+'</p>'+lztDotsHTML(WB.st.map(x=>x.s),false)
    +'<div class="lzt-row">'+(next&&nextOpen?'<button type="button" class="lzt-btn lzt-go" id="lztNextLesson" onclick="renderRevealLesson(\''+next.id+'\')">Go to Lesson '+next.id+' ▶</button>':'')+'<button type="button" class="lzt-btn lzt-plain" onclick="renderRevealUnit('+u+')">Unit '+u+'</button></div></section></div></div>';
  if(typeof lzBack==="function")lzBack(()=>renderRevealUnit(u),"Unit "+u);
  if(typeof say==="function")say("Lesson passed! Every question is right."+(next&&nextOpen?" The next lesson is unlocked.":""));
}
/* ---- kid-words tips: what went wrong (from HIS answer) + how to get it, never the answer itself ---- */
const LZT_RULE={"3-7":"Share the total into equal groups, or think of the times fact that uses the same numbers.","4-1":"Times 2 means doubling: add the number to itself.","4-2":"Count by 5s. Products of 5 end in 0 or 5.","4-3":"Count by 10s. A product of 10 always ends in 0.","4-4":"Any number times 1 stays the same. Any number times 0 is 0.","4-5":"Use the patterns: times 2 is even, times 5 ends in 0 or 5, times 10 ends in 0."};
function lztReview(id){if(LZT_RULE[id])return LZT_RULE[id];const L=WB_LESSONS[id];return L&&L.review?String(L.review).split(/(?<=\.)\s+/)[0]:"";}
function lztCount(x,y){ // skip-count tip for x × y, counting by the lesson's friendly factor
  if(x===0||y===0)return"Any number times 0 is 0.";if(x===1||y===1)return"Any number times 1 stays the same number.";
  const base=[10,5,2].find(f=>f===x||f===y)||Math.min(x,y),times=base===x?y:x;
  return"Count by "+base+"s, "+times+(times===1?" time":" times")+". Keep track on your fingers.";
}
function lztTip(p,a){
  const id=p&&p.lesson,review=lztReview(id);let why="",tip="";
  if(!p)return{why:"",tip:review||"Read the question again slowly."};
  try{
  if(p.type==="fill"){
    const parts=p.parts.map(String),eq=parts.indexOf("="),left=parts.slice(0,eq),right=parts.slice(eq+1),g=a&&Number.isFinite(a.value)?a.value:null;
    const one=left.length===1?left:right,expr=left.length===1?right:left,op=expr[1];
    if(op==="×"){
      if(one[0]==="□"){const x=+expr[0],y=+expr[2];if(g!=null)why=x+" × "+y+" is not "+g+".";tip=lztCount(x,y);}
      else{const total=+one[0],known=+(expr[0]==="□"?expr[2]:expr[0]);
        if(g!=null)why=g===total?"You wrote "+g+", but "+total+" is the total. The box is how many "+known+"s make "+total+".":(known+" × "+g+" makes "+known*g+", not "+total+".");
        tip=known===0?"0 times any number is 0. Which number makes this true?":known===1?"1 times a number is that same number.":p.lesson==="4-4"&&total===0?"Any number times 0 is 0. Which number makes this true?":p.lesson==="4-4"&&total===known?"Think about which number keeps "+known+" the same when you multiply.":"Count by "+known+"s until you reach "+total+". The number of jumps goes in the box.";}
      if(g!=null&&p.lesson==="4-2"&&one[0]==="□"&&g%5!==0)tip+=" Products of 5 end in 0 or 5.";
    }else if(op==="÷"){
      const total=+expr[0],div=+expr[2];
      if(one[0]==="□"){if(g!=null)why=total+" ÷ "+div+" is not "+g+".";tip="Think: "+div+" times what number makes "+total+"? Or share "+total+" into "+div+" equal groups.";}
      else tip="Think of the multiplication fact that uses these numbers.";
    }else tip=review||"Work out each side, then check that both sides match.";
  }else if(p.type==="multi"){
    const sel=a&&a.selected||[],bad=p.options.filter(o=>sel.indexOf(o.id)>=0&&!o.true),miss=p.options.filter(o=>o.true&&sel.indexOf(o.id)<0);
    if(bad.length)why="You picked "+bad[0].id+". "+(bad[0].why||"Its two sides are not equal.");
    else if(!sel.length)why="You did not pick any.";else if(miss.length)why=miss.length===1?"One more of them is true.":miss.length+" more of them are true.";
    tip=(p.answer.length===1?"Only one is true. ":"")+"Work out both sides of each one. Pick it only if both sides make the same number.";
  }else if(p.type==="form"){
    const f=a&&a.f||{};let bad=null;for(const c of p.checks||[]){const one={checks:[c],group:null,lesson:p.lesson,q:p.q,answer:p.answer};if(!wbFormCheck(one,f)){bad=c;break;}}
    const row=bad?(p.rows||[]).find(r=>String(r).indexOf(":"+bad.k+"}")>=0)||"":"",m=/(\d+)\s*×\s*(\d+)/.exec(row)||/(\d+)\s*×\s*(\d+)/.exec(p.q||"");
    const v=bad?String(f[bad.k]==null?"":f[bad.k]).trim():"";
    if(!bad){const g=p.group;why="Check how your answers fit together.";tip=review||"Read each part again.";if(g&&g.kind==="twoEq")tip="Write one adding equation and one times equation that make the same total.";}
    else if(bad.t==="num"){why=v?"Check this number: you wrote "+v+".":"One box is empty.";tip=m?lztCount(+m[1],+m[2]):(review||"Work it out step by step.");}
    else if(bad.t==="mult"){why=v?v+" doesn't work here.":"One box is empty.";tip="It has to be a number you say when you count by "+bad.of+"s, from "+bad.min+" to "+bad.max+".";}
    else if(bad.t==="divides"){why=v?v+" doesn't work here.":"One box is empty.";tip="Pick a number that shares "+bad.of+" into equal groups with none left over.";}
    else{why=v?"Check your answer: you wrote "+v+".":"One box is empty.";tip=review||"Read the question again slowly.";}
  }else if(p.type==="story"||p.type==="picture"){
    const e=p.answer.eq,op=p.eq.op,got=a&&a.eq;const eqOK=got&&wbEquationMatches(p,got,e);
    if(got&&!eqOK)why="Check your equation: "+got.map(x=>Number.isFinite(x)?x:"_").join(" ").replace(/^(\S+) (\S+) (\S+)$/,"$1 "+op+" $2 = $3")+".";
    else if(p.type==="story"&&a&&a.value!==e[2])why="Your equation is right, but the answer line doesn't match it.";
    const m=p.model||p.visual;
    if(p.type==="story"&&eqOK)tip="Copy the answer from your equation onto the answer line.";
    else if(op==="÷")tip="Share "+e[0]+" into "+e[1]+" equal groups. How many land in each group?";
    else if(m&&m.kind==="array")tip="Count the rows, then how many are in each row. Write rows × how many in each row.";
    else if(m&&m.kind==="groups")tip="Count the groups, then how many are in each group. "+lztCount(m.groups,m.size);
    else tip=review||"Write the equation one part at a time.";
  }else if(p.type==="match")tip="Solve each one first, then find its partner.";
  else if(p.type==="who")tip="Work it out yourself first, then see whose answer matches yours.";
  else if(p.type==="pair")tip="Build both models, count each one, then compare them.";
  }catch(e){}
  return{why:why,tip:tip||review||"Read the question again slowly and check each step."};
}
/* His logged answer text (P.qlog "given") back into an answer object, so tips can talk about what he actually wrote. */
function lztParseGiven(p,given){
  if(!p||given==null||given==="")return null;const g=String(given);
  try{
  if(p.type==="fill"){const toks=g.split(/\s+/),bi=p.parts.indexOf("□");const v=Number(toks[bi]);return Number.isFinite(v)?{value:v}:null;}
  if(p.type==="multi"){const ids=(g.match(/(?:^|[\[,'"\s])([A-F])\./g)||[]).map(x=>x.replace(/[^A-F]/g,""));return{selected:ids};}
  if(p.type==="form"){const parts=g.split(" / "),f={};(p.rows||[]).forEach((r,ri)=>{const keys=[];const rx=new RegExp("^"+String(r).replace(/[.*+?^$()|[\]\\]/g,"\\$&").replace(/\\?\{[nt]:(\w+)\\?\}/g,(m0,k)=>{keys.push(k);return"(.*?)";})+"$");const mm=rx.exec(parts[ri]||"");if(mm)keys.forEach((k,j)=>f[k]=mm[j+1]==="__"?"":mm[j+1]);});return{f:f};}
  if(p.type==="story"||p.type==="picture"){const n=(g.match(/\d+|_/g)||[]).map(x=>x==="_"?NaN:Number(x));return{eq:n.slice(0,3),value:n[3]};}
  }catch(e){}
  return null;
}
/* ---- one-time: his LAST finished test of a lesson (from P.qlog, shown/given/correct since d8dc399) becomes a fix round ---- */
const LZT_GEN={"3-7":wbGen37,"4-1":wbGen41,"4-2":wbGen42,"4-3":wbGen43,"4-4":wbGen44,"4-5":wbGen45};
function lztClip(v){return typeof qlogClip==="function"?qlogClip(v):String(v==null?"":v).replace(/\s+/g," ").trim();}
function lztShown(p){try{return lztClip(wbLogInfo(p,null).shown);}catch(e){return"";}}
function lztWords(t){const w=new Set(String(t||"").toLowerCase().replace(/[^a-z ]/g," ").split(/\s+/).filter(w=>w.length>2));const shape=String(t||"").replace(/\d+/g,"#").replace(/[^#_×÷=+?]/g,"");w.add("§"+shape);w.add("§§"+shape);return w;} // the equation's shape (5 × __ = 15 vs 5 × 2 = __) tells look-alike slots apart
function lztSim(a,b){let n=0;a.forEach(w=>{if(b.has(w))n++;});return n/Math.max(1,a.size+b.size-n);}
function lztRebuild(id,e,exactNeeded){
  const fn=LZT_GEN[id];if(!fn||!e)return null;const tw=lztWords(e.shown||e.q);
  const ranked=[];for(let slot=0;slot<10;slot++){let best=0,sample=null;for(let k=0;k<10;k++){const p=fn(slot);const sc=lztSim(lztWords(lztShown(p)),tw);if(sc>best){best=sc;sample=p;}}ranked.push({slot:slot,score:best,sample:sample});}
  ranked.sort((x,y)=>y.score-x.score);if(!ranked[0]||ranked[0].score<0.35)return null;
  if(!exactNeeded)return{slot:ranked[0].slot,p:null,exact:false};
  const target=lztClip(e.shown);
  if(/ Options: /.test(target)&&!/\.\.\.$/.test(target)){const m=lztMultiFromLog(id,e,ranked[0]);if(m)return m;}
  for(const r of ranked.slice(0,3)){if(r.score<0.35)break;for(let k=0;k<6000;k++){const p=fn(r.slot);if(lztShown(p)===target){p.slot=r.slot;return{slot:r.slot,p:p,exact:true};}}}
  const p=fn(ranked[0].slot);p.slot=ranked[0].slot;return{slot:ranked[0].slot,p:p,exact:false}; // same kind of question, new numbers
}
function lztMultiFromLog(id,e,r){
  const opts=String(e.shown).split(" Options: ")[1].split(" | ").map(x=>{const m=/^([A-F])\. (.*)$/.exec(x.trim());return m?{id:m[1],text:m[2]}:null;});
  if(opts.some(o=>!o))return null;const truth=new Set((Array.isArray(e.correct)?e.correct:[e.correct]).map(x=>String(x).trim().charAt(0)));
  const built=opts.map(o=>{const q=wbEqParse(o.text),ok=!!q.ok;return{text:o.text,true:ok,why:ok?"Both sides equal "+q.total+".":(q.L&&q.R?"The left side is "+q.L.value+" but the right side is "+q.R.value+".":"The two sides are not equal.")};});
  if(built.some((o,i)=>o.true!==truth.has(opts[i].id)))return null; // the maths must agree with the logged key
  const s=r.sample||{};const p=wbMulti(id,s.factor||0,built);p.q=e.q||s.q;p.spoken=s.spoken||p.spoken;p.explain=s.explain||"Work out both sides of each equation.";p.slot=r.slot;
  return{slot:r.slot,p:p,exact:true};
}
function lztSeedFromLog(profile){
  if(!profile||profile.fixSeedV1)return;profile.fixSeedV1=Date.now();
  try{
    profile.revealTest=profile.revealTest||{};
    Object.keys(LZT_GEN).forEach(id=>{
      if(profile.revealTest[id]||(profile.revealPass&&profile.revealPass[id]))return;
      const ses=(profile.sessions||[]).filter(s=>s&&s.lesson==="reveal:"+id&&s.total&&s.t).sort((x,y)=>x.t-y.t);if(!ses.length)return;
      const last=ses[ses.length-1],prevT=ses.length>1?ses[ses.length-2].t:0;
      const log=(profile.qlog||[]).filter(x=>x&&x.lesson==="workbook:"+id&&x.t>prevT&&x.t<=last.t+2000).sort((x,y)=>x.t-y.t);
      if(!log.length||log.some(x=>!x.shown))return;
      const rows=log.map(x=>({e:x,r:lztRebuild(id,x,false)}));if(rows.some(x=>!x.r))return;
      const prim=[];for(let k=0;k<rows.length;k++){const pr=prim[prim.length-1];if(pr&&pr===rows[k-1]&&!pr.e.ok&&!pr.twin&&pr.r.slot===rows[k].r.slot){pr.twin=rows[k];continue;}prim.push(rows[k]);} // "Try one like it" twins are not test questions
      const wrong=prim.filter(x=>!x.e.ok);
      if(prim.length!==Number(last.total)||!wrong.length||wrong.length!==Number(last.total)-Number(last.correct))return;
      const problems=[],st=[];
      for(const x of prim){if(x.e.ok){problems.push(null);st.push({s:"right",first:true,tries:0});continue;}
        const r=lztRebuild(id,x.e,true);if(!r||!r.p)return;problems.push(r.p);st.push({s:"wrong",first:false,tries:1,given:r.exact?String(Array.isArray(x.e.given)?x.e.given.join(", "):x.e.given||""):"",like:!r.exact,tipShown:false});}
      profile.revealTest[id]={lessonId:id,size:st.length,phase:"fix",index:st.findIndex(x=>x.s!=="right"),scored:true,start:Date.now(),t:Date.now(),seeded:"qlog:"+last.t,problems:problems,st:st};
    });
  }catch(e){}
}

const LZT_CSS=`
#topbar .tb-btn.lzb{min-width:84px;height:68px;padding:0 14px 0 10px;flex-direction:row;gap:8px;background:#fff;color:#1E293B;border:1.5px solid rgba(30,41,59,.16);border-radius:18px;box-shadow:0 2px 8px rgba(15,23,42,.08);font-weight:900;backdrop-filter:none;-webkit-backdrop-filter:none;transition:transform .1s ease,box-shadow .1s ease}
#topbar .tb-btn.lzb .lzb-ar{font-size:34px;line-height:1}#topbar .tb-btn.lzb .lzb-to{font-size:18px;font-weight:900;white-space:nowrap;line-height:1.05;text-transform:none;letter-spacing:0;opacity:1}
#topbar .tb-btn.lzb:active{transform:translate(4px,5px);box-shadow:0 0 0 #1E293B}#topbar .tb-btn.lzb[hidden]{display:none}
body.lz-back #app{padding-top:98px!important}
@media(max-width:520px){#topbar .tb-btn.lzb{min-width:72px;height:64px;padding:0 10px 0 8px;gap:4px}#topbar .tb-btn.lzb .lzb-ar{font-size:28px}#topbar .tb-btn.lzb .lzb-to{font-size:14px;max-width:62px;white-space:normal}
 body.lz-back #topbar .tb-group{gap:5px}body.lz-back #topbar .tb-btn:not(.lzb){min-width:46px;padding:4px 5px}body.lz-back #topbar .tb-btn:not(.lzb) .tb-lb{display:none}body.lz-back #app{padding-top:90px!important}}
.lzt-praise{display:flex;align-items:center;justify-content:center;gap:14px;margin:12px 0;padding:16px 18px;background:#FFD166;border:1.5px solid rgba(30,41,59,.16);border-radius:20px;box-shadow:0 2px 8px rgba(15,23,42,.08);animation:lztPop .45s cubic-bezier(.3,1.6,.5,1)}
.lzt-praise b{font-size:30px;line-height:1.1;color:#1E293B!important}.lzt-star{font-size:44px;line-height:1;animation:lztSpin .6s ease-out}
.lzt-praise.lzt-static{background:#dcfce7;animation:none}.lzt-praise.lzt-static b{font-size:22px}.lzt-praise.lzt-static .lzt-star{color:#15803d!important;font-size:34px;animation:none}
.lzt-tip{margin:12px 0;padding:14px 16px;background:#fff;border:1.5px solid rgba(30,41,59,.16);border-left:6px solid #FF6B6B;border-radius:18px;box-shadow:0 2px 8px rgba(15,23,42,.08);animation:lztIn .3s ease-out}
.lzt-tip h3{font-size:24px!important;margin:0 0 6px;color:#1E293B!important}.lzt-why{font-size:19px;font-weight:700;line-height:1.4;margin:4px 0;color:#334155!important}.lzt-tipline{font-size:20px;font-weight:800;line-height:1.4;margin:6px 0;color:#1E293B!important}
.lzt-model{margin:12px 0;padding:14px 16px;background:#EAF7EF;border:1.5px solid rgba(30,41,59,.16);border-left:6px solid #47D18C;border-radius:18px;box-shadow:0 2px 8px rgba(15,23,42,.08);text-align:left;animation:lztIn .3s ease-out}
.lzt-model-h{font-size:21px;font-weight:900;margin:0 0 6px;color:#1E293B!important}.lzt-model-t{font-size:20px;font-weight:700;line-height:1.45;margin:0;color:#1E293B!important}
.lzt-you{font-size:17px;font-weight:600;margin:0 0 8px;color:#475569!important;overflow-wrap:anywhere}
.wb-feedback .lzt-model{margin:14px 0 4px}
.lzt-hint{margin:0 0 10px;padding:10px 12px;background:#fff7ed;border:2px solid #FF9F1C;border-radius:14px;font-size:18px;font-weight:700;color:#1E293B!important}
.lzt-row{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-top:12px}
.lzt-btn{min-height:64px;padding:10px 24px;border:0;border-radius:16px;font:inherit;font-size:20px;font-weight:900;cursor:pointer;box-shadow:0 4px 0 rgba(15,23,42,.22);color:#fff!important;transition:transform .1s ease,box-shadow .1s ease}
.lzt-btn:active{transform:translateY(4px);box-shadow:0 0 0 transparent}.lzt-try{background:#FF9F1C}.lzt-next{background:#2EC4B6}.lzt-go{background:#FF9F1C;font-size:23px;min-height:72px;padding:12px 30px}.lzt-plain{background:#fff;color:#1E293B!important;box-shadow:inset 0 0 0 1.5px #CBD5E1,0 4px 0 #CBD5E1}
.lzt-small{font-size:15px;font-weight:700;color:#64748b!important;text-align:center;margin:8px 0 0}
.lzt-card{background:#fff;color:#1E293B;border:1.5px solid rgba(30,41,59,.16);border-radius:24px;box-shadow:0 2px 8px rgba(15,23,42,.08);padding:20px 22px;margin:16px auto;max-width:640px;text-align:center;animation:lztPop .4s cubic-bezier(.3,1.5,.6,1)}
.lzt-card *{color:inherit}.lzt-h{font-size:28px!important;line-height:1.15;margin:4px 0 8px;color:#1E293B!important}.lzt-big{font-size:21px;font-weight:800;line-height:1.4;margin:6px 0}
.lzt-card.lzt-lock{border-style:solid;background:#fffaf0}.lzt-lockic{font-size:54px;line-height:1}
.lzt-card.lzt-note{background:#f0fbfa;border-color:rgba(30,41,59,.16);box-shadow:0 2px 8px rgba(15,23,42,.08);padding:14px 16px}.lzt-card.lzt-note .lzt-big{font-size:19px}
.lzt-card.lzt-fix{text-align:left;border-left:6px solid #FF6B6B}.lzt-kicker{font-size:15px;font-weight:900;text-transform:uppercase;letter-spacing:.06em;color:#c2410c!important}
.lzt-q{font-size:21px;font-weight:800;line-height:1.35;margin:8px 0;padding:10px 12px;background:#f1f5f9;border-radius:12px}.lzt-you{font-size:19px;margin:8px 0}.lzt-you b{color:#b91c1c!important}
.lzt-card.lzt-fix .lzt-row{justify-content:flex-start}
.lzt-score{display:inline-flex;align-items:baseline;justify-content:center;width:104px;height:104px;border-radius:50%;background:#1E293B;padding-top:24px}.lzt-score b{font-size:44px;color:#fff!important}.lzt-score span{font-size:22px;color:#cbd5e1!important}
.lzt-card.lzt-passed{background:#f0fdf4}.lzt-burst{font-size:72px;line-height:1;animation:lztSpin .8s ease-out}
@keyframes lztPop{0%{transform:scale(.85);opacity:0}70%{transform:scale(1.04)}100%{transform:none;opacity:1}}
@keyframes lztSpin{0%{transform:scale(0) rotate(-40deg)}60%{transform:scale(1.3) rotate(12deg)}100%{transform:none}}
@keyframes lztIn{from{transform:translateY(10px);opacity:0}to{transform:none;opacity:1}}
@media (prefers-reduced-motion:reduce){.lzt-praise,.lzt-star,.lzt-card,.lzt-tip,.lzt-burst{animation:none}}
@media(max-width:520px){.lzt-tip h3{font-size:21px!important}.lzt-why{font-size:17px}.lzt-btn{flex:1 1 140px;font-size:19px;padding:10px 12px}.lzt-praise b{font-size:26px}.lzt-card{padding:16px 14px}.lzt-h{font-size:24px!important}.lzt-big{font-size:18px}.lzt-tipline{font-size:18px}.lzt-q{font-size:18px}}
/* "Which reason is best?" pick card (design-inspo 20261105-100749: chunky white buttons, mint = best, soft coral = not quite) */
.lzp{margin:12px 0;padding:12px 14px 14px;background:#EBF4F6;border:1.5px solid rgba(30,41,59,.16);border-radius:20px;box-shadow:0 2px 8px rgba(15,23,42,.08);text-align:left;animation:lztIn .25s ease-out}
.lzp-h{font-size:24px!important;line-height:1.15;margin:0 0 10px!important;color:#1E293B!important;font-weight:900}
.lzp-list{display:grid;gap:12px}
.lzp-btn{display:flex;align-items:center;gap:12px;width:100%;min-height:68px;padding:8px 14px;background:#fff;color:#1E293B!important;border:1.5px solid #CBD5E1;border-radius:18px;box-shadow:0 4px 0 #CBD5E1;font:inherit;font-size:20px;font-weight:800;line-height:1.25;text-align:left;cursor:pointer;transition:transform .1s ease,box-shadow .1s ease,background .15s}
.lzp-btn:active:not(:disabled){transform:translateY(4px);box-shadow:0 0 0 transparent}
.lzp-k{flex:0 0 40px;height:40px;border-radius:50%;background:#FFD166;border:0;display:inline-flex;align-items:center;justify-content:center;font-size:18px;font-weight:900;color:#1E293B!important}
.lzp-t{flex:1;min-width:0}
.lzp-btn:disabled{cursor:default}
.lzp-btn.best{background:#1CD0A1;border-color:#12a982;color:#0b3d2e!important;box-shadow:0 4px 0 #12a982}.lzp-btn.best .lzp-k{background:#fff}
.lzp-btn.best:not(.picked){animation:lzpGlow 1s ease-in-out 2;outline:4px solid #1CD0A1;outline-offset:3px}
.lzp-btn.picked.wrong{background:#FF8A8A;color:#4a1010!important;animation:lzpWiggle .2s ease-in-out 2}
.lzp-btn.picked.right{animation:lztPop .3s cubic-bezier(.3,1.6,.5,1)}
.lzp-btn.dim{opacity:.5}
.lzp-res{margin:12px 0 0;padding:12px 14px;border:1.5px solid rgba(30,41,59,.16);border-radius:16px;box-shadow:0 2px 8px rgba(15,23,42,.08);animation:lztPop .25s cubic-bezier(.3,1.6,.5,1)}
.lzp-res b{display:block;font-size:22px;line-height:1.2;color:#1E293B!important}.lzp-res span{display:block;font-size:19px;font-weight:700;line-height:1.35;margin-top:4px;color:#1E293B!important}
.lzp-res.good{background:#FFD166}.lzp-res.try{background:#fff;border-left:6px solid #FF8A8A}
.lzp #lzpOut .lzt-model{margin:12px 0 4px}.lzp #lzpOut .wb-btnrow{margin-top:12px}
@keyframes lzpWiggle{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
@keyframes lzpGlow{0%,100%{outline-color:#1CD0A1}50%{outline-color:#FFD166}}
@media (prefers-reduced-motion:reduce){.lzp,.lzp-btn,.lzp-res{animation:none!important}}
@media(max-width:520px){.lzp{padding:10px 10px 12px}.lzp-h{font-size:21px!important;margin-bottom:8px!important}.lzp-list{gap:10px}.lzp-btn{min-height:64px;font-size:18px;padding:6px 10px;gap:9px}.lzp-k{flex-basis:34px;height:34px;font-size:16px}.lzp-res b{font-size:20px}.lzp-res span{font-size:17px}}
/* ===== Question screen look (Eb 2026-11-05 "too clunky"; design-inspo 20261105-103740 + 60fps Duolingo lesson screen) =====
   one system: 1.5px light lines, soft shadows, 0 4px 0 press shadow on buttons, radius 12/16/20, 8px spacing scale */
#topbar .tb-btn.lzb.lzb-exit{min-width:0;height:44px;padding:0 14px 0 11px;gap:6px;background:rgba(5,25,48,.68);color:#fff;border:1.5px solid rgba(151,213,255,.38);border-radius:999px;box-shadow:0 6px 18px rgba(0,0,0,.22);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
#topbar .tb-btn.lzb.lzb-exit .lzb-ar{font-size:17px;font-weight:900;color:#fff}#topbar .tb-btn.lzb.lzb-exit .lzb-to{font-size:15px;font-weight:800;max-width:none;white-space:nowrap;color:#fff}
#topbar .tb-btn.lzb.lzb-exit:active{transform:scale(.96);box-shadow:none}
body.lz-back.lz-exit #app{padding-top:72px!important}
html:has(.lzq-bar){scroll-padding-top:72px;scroll-padding-bottom:96px}
.wb-shell.lzq .wb-page{border:1px solid rgba(255,255,255,.6);border-radius:20px;box-shadow:0 10px 28px rgba(5,20,40,.22);padding:16px 24px 0}
.wb-qhead{display:flex;flex-wrap:wrap;align-items:baseline;gap:0 8px;margin:0;font-size:16px!important;line-height:1.3;font-weight:800;color:#334155!important;letter-spacing:0}
.wb-qhead .wb-qh-sep{color:#94A3B8!important}.wb-qhead .wb-qh-t{color:#174f7d!important;font-weight:900}
.lzt-strip{margin:8px 0 0;padding:0 0 8px;border-bottom:1px solid #E2E8F0}
.lzt-count{display:flex;flex-wrap:wrap;align-items:center;gap:4px 8px;font-size:15px;font-weight:800;color:#475569}.lzt-count b{color:#1E293B!important;font-weight:900}
.lzt-fixchip{background:#FFF1E6;color:#9A3412!important;border-radius:999px;padding:2px 10px;font-size:13px;font-weight:900}
.wb-pstrip .wb-progress{margin:8px 0 0}
.lzt-dots{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:8px 0}
.lzt-dots.live{flex-wrap:nowrap;gap:0;justify-content:flex-start;margin:2px 0 0}
.lzt-dot{display:inline-flex;align-items:center;justify-content:center;padding:0;margin:0;border:0;background:none;font:inherit;flex:0 0 auto;width:34px;height:34px;color:#1E293B!important}
.lzt-dots.live .lzt-dot{flex:1 1 0;min-width:0;max-width:44px;height:44px;cursor:pointer;-webkit-tap-highlight-color:transparent}
.lzt-dc{width:28px;height:28px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;line-height:1;background:#F1F5F9;border:1.5px solid #CBD5E1;color:#475569!important;transition:transform .15s ease}
.lzt-dot.right .lzt-dc{background:#22c55e;border-color:#16a34a;color:#fff!important}
.lzt-dot.wrong .lzt-dc{background:#FF6B6B;border-color:#e04848;color:#fff!important}
.lzt-dot.skip .lzt-dc{background:#FFD166;border-color:#e9b23c;color:#5b4300!important}
.lzt-dot.todo .lzt-dc{background:#fff;border:1.5px dashed #94A3B8;color:#475569!important}
.lzt-dot.cur .lzt-dc{background:#2563EB;border:1.5px solid #2563EB;color:#fff!important;box-shadow:0 0 0 3px #BFDBFE;transform:scale(1.12)}
.lzt-dots.live .lzt-dot:active .lzt-dc{transform:scale(.92)}
.lzt-legend{display:flex;flex-wrap:wrap;gap:2px 12px;justify-content:center;font-size:13px;line-height:1.3;font-weight:700;color:#475569;margin:2px 0 0}
.lzt-legend i{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:4px;vertical-align:-1px;border:1.5px solid transparent}
.lzt-legend i.cur{background:#2563EB}.lzt-legend i.right{background:#22c55e}.lzt-legend i.wrong{background:#FF6B6B}.lzt-legend i.skip{background:#FFD166}.lzt-legend i.todo{background:#fff;border:1.5px dashed #94A3B8}
.lzt-result .lzt-dots .lzt-dc,.lzt-passed .lzt-dots .lzt-dc{width:30px;height:30px}
.wb-shell.lzq .wb-problem{border-top:0;padding-top:16px}
.wb-shell.lzq .wb-qrow{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:start}
.wb-shell.lzq .wb-qcopy{font-size:22px;line-height:1.35;font-weight:800;color:#1E293B}
.wb-shell.lzq .wb-instruction{font-size:15px;color:#475569!important;font-weight:700;margin-top:4px}
.wb-shell.lzq .wb-read{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:40px;min-width:40px;padding:0 12px;margin:0;border:1.5px solid #BFDBFE;background:#EFF6FF;border-radius:999px;font:inherit;font-size:14px;font-weight:800;color:#1D4ED8!important;cursor:pointer;position:relative}
.wb-shell.lzq .wb-read:after{content:"";position:absolute;inset:-4px}
.wb-shell.lzq .wb-read:active{transform:scale(.95)}
.wb-shell.lzq .wb-form{gap:16px;margin:16px 0 8px}.wb-shell.lzq .wb-formrow{font-size:21px;gap:8px 10px;color:#1E293B}
.wb-shell.lzq .wb-in{height:52px;border:1.5px solid #94A3B8;border-radius:12px;font-size:24px;padding:0 12px;box-shadow:inset 0 2px 0 rgba(15,23,42,.05);transition:border-color .15s,box-shadow .15s}
.wb-shell.lzq .wb-in:focus{outline:0;border-color:#2563EB;box-shadow:0 0 0 3px #BFDBFE}
.wb-shell.lzq .wb-in.num{width:96px}.wb-shell.lzq .wb-in.text{width:min(100%,320px)}
.wb-shell.lzq .wb-because{display:block;width:100%;height:auto;min-height:84px;padding:10px 12px;font-size:20px;font-weight:700;line-height:1.35;resize:none;font-family:inherit}
.wb-shell.lzq .wb-because::placeholder,.wb-shell.lzq .wb-in::placeholder{color:#64748B;font-weight:600;opacity:1}
.wb-shell.lzq .wb-key{border:1.5px solid #CBD5E1;box-shadow:0 3px 0 #CBD5E1;background:#fff}.wb-shell.lzq .wb-key:active{transform:translateY(3px);box-shadow:none}
.wb-shell.lzq .wb-key.go{background:#16a34a;border-color:#15803d;box-shadow:0 3px 0 #15803d}.wb-shell.lzq .wb-key.action{background:#EFF6FF}
.wb-shell.lzq .wb-check,.wb-shell.lzq .wb-person,.wb-shell.lzq .wb-matchitem{border:1.5px solid #CBD5E1;box-shadow:0 3px 0 #E2E8F0;background:#fff}
.wb-shell.lzq .wb-check.on,.wb-shell.lzq .wb-person.on{border-color:#2563EB;background:#EFF6FF}
.wb-shell.lzq .wb-num-box{border:1.5px solid #94A3B8;border-radius:12px}.wb-shell.lzq .wb-num-box.active{outline:0;border-color:#2563EB;box-shadow:0 0 0 3px #BFDBFE}
.wb-shell.lzq .wb-work{border:1.5px solid #CBD5E1;border-radius:16px}.wb-shell.lzq .wb-tab,.wb-shell.lzq .wb-buildbtn,.wb-shell.lzq .wb-tool{border-width:1.5px}
.wb-shell.lzq .wb-feedback{border-width:1.5px;border-radius:16px}.wb-shell.lzq .wb-primary,.wb-shell.lzq .wb-secondary{border-radius:16px}
.wb-shell.lzq .wb-primary{background:#16a34a;box-shadow:0 4px 0 #15803d}.wb-shell.lzq .wb-secondary{border:1.5px solid #CBD5E1;background:#fff;box-shadow:0 4px 0 #CBD5E1}
.wb-shell.lzq .wb-lock{margin-top:8px}
.lzq-bar{position:sticky;bottom:0;z-index:30;display:flex;align-items:center;gap:8px;margin:16px -24px 0;padding:12px 24px calc(12px + env(safe-area-inset-bottom,0px));background:rgba(255,255,255,.97);border-top:1px solid #E2E8F0;border-radius:0 0 20px 20px;box-shadow:0 -6px 16px rgba(15,23,42,.06)}
.lzq-main{flex:1 1 auto;min-width:0;display:flex;justify-content:center}
.lzq-bar .lzq-check{width:100%;max-width:420px;min-height:52px;padding:8px 16px;border:0;border-radius:16px;background:#16a34a;color:#fff!important;font:inherit;font-size:20px;font-weight:900;box-shadow:0 4px 0 #15803d;cursor:pointer;transition:transform .1s ease,box-shadow .1s ease}
.lzq-bar .lzq-check:active:not(:disabled){transform:translateY(4px);box-shadow:none}
.lzq-bar .lzq-check:disabled{opacity:1;background:#E2E8F0;color:#64748B!important;box-shadow:0 4px 0 #CBD5E1;cursor:not-allowed}
.lzq-bar .lzq-check[hidden]{display:none}
.lzq-back{flex:0 0 auto;min-height:44px;padding:0 14px;border:1.5px solid #CBD5E1;border-radius:12px;background:#fff;color:#334155!important;font:inherit;font-size:16px;font-weight:800;cursor:pointer;box-shadow:0 2px 0 #E2E8F0}
.lzq-back:active:not(:disabled){transform:translateY(2px);box-shadow:none}.lzq-back:disabled{opacity:.45;cursor:default;box-shadow:none}
.wb-shell.lzq .lzt-row{margin-top:16px}.wb-shell.lzq .lzt-btn{min-height:56px}
.wb-shell.lzq .wb-answerarea .lzt-praise{margin:16px 0 8px}
@media(min-width:700px){.wb-shell.lzq .wb-page{padding:20px 28px 0}.lzq-bar{margin:16px -28px 0;padding:12px 28px 12px;gap:16px}.lzq-back,.lzq-skip{font-size:17px}
 .lzt-dots.live{justify-content:center}.lzt-dots.live .lzt-dot{flex:0 0 44px}.lzt-dc{width:32px;height:32px;font-size:14px}.lzt-strip{display:grid;grid-template-columns:auto 1fr;align-items:center;column-gap:16px}.lzt-strip .lzt-legend{grid-column:1 / -1}.wb-pstrip{display:block}}
@media(max-width:520px){.wb-shell.lzq .wb-page{padding:12px 16px 0;border-radius:18px}.lzq-bar{margin:16px -16px 0;padding:10px 12px calc(10px + env(safe-area-inset-bottom,0px));border-radius:0 0 18px 18px;gap:6px}
 .wb-shell.lzq .wb-qcopy{font-size:20px}.wb-shell.lzq .wb-formrow{font-size:19px}.lzq-bar .lzq-check{font-size:18px;padding:8px 10px}.lzq-back{padding:0 10px;font-size:15px}.lzq-skip{font-size:15px}
 .wb-qhead{font-size:15px!important}.lzt-dc{width:26px;height:26px;font-size:12px}}
@media(min-width:900px) and (max-height:850px){#app:has(.wb-shell.lzq){padding-top:72px}}
.wb-qhead,.wb-qhead span{background:none!important;-webkit-text-fill-color:currentColor!important;text-shadow:none!important}
.wb-qhead>span:first-child{color:#475569!important}
.lzq-bar .lzq-check{white-space:nowrap}
.wb-shell.lzq .lzt-praise{padding:12px 16px;gap:12px;border-radius:16px}.wb-shell.lzq .lzt-praise b{font-size:24px}.wb-shell.lzq .lzt-star{font-size:32px}
.wb-shell.lzq .lzp{border-radius:16px}.wb-shell.lzq .lzt-tip,.wb-shell.lzq .lzt-model{border-radius:16px}
.rvq .rvq-head{margin:-6px 0 16px;padding-bottom:12px;border-bottom:1px solid #E2E8F0;text-align:left}
.rvq .rvq-head .lzt-count{margin-top:6px}.rvq .rvq-head .wb-progress{height:8px;background:#E2E8F0;border-radius:9px;margin:8px 0 0;overflow:hidden}.rvq .rvq-head .wb-progress i{display:block;height:100%;background:#2563EB;border-radius:9px}
.rvq-lvl{background:#EFF6FF;color:#1D4ED8!important;border-radius:999px;padding:2px 10px;font-size:13px;font-weight:800}
.rvq .rvq-head .focus-chip{font-size:13px}
@media(min-width:700px){.wb-shell.lzq .wb-qcopy{font-size:24px}.wb-shell.lzq .wb-instruction{font-size:16px}}
@media(max-width:380px){.lzq-mw{display:none}}
@media(max-width:520px){.wb-shell.lzq .lzt-praise b{font-size:21px}.wb-shell.lzq .lzt-star{font-size:28px}}
/* ===== Correction pass (Eb 2026-11-05 review: phone 6/10, iPad 5/10). design-inspo 20261105-111639 + 60fps Brilliant/Duolingo =====
   one exit, 44pt ghost Back/Skip around ONE primary, readable meta, icon dots, labelled Read it, slim header while typing, tablet layout */
body.lz-exit #homeBtn{display:none!important}
@media(max-width:520px){body.lz-back.lz-exit #topbar .tb-btn:not(.lzb){min-width:54px;padding:4px 6px}body.lz-back.lz-exit #topbar .tb-btn:not(.lzb) .tb-lb{display:block}}
.lzq-bar{display:block;padding:10px 16px calc(10px + env(safe-area-inset-bottom,0px));background:#fff}
.lzq-grp{display:flex;align-items:center;gap:12px}
.lzq-main{flex:1 1 auto;min-width:0;display:flex;justify-content:center}
.lzq-ghost{flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:48px;min-width:48px;padding:0 14px;margin:0;border:2px solid #94A3B8;border-radius:14px;background:#fff;color:#1E293B!important;font:inherit;font-size:16px;font-weight:800;line-height:1;text-decoration:none;box-shadow:none;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:transform .1s ease,background .15s}
.lzq-ghost .lzq-ic{font-size:12px;color:#475569!important}
.lzq-ghost:active:not(:disabled){transform:translateY(2px);background:#F1F5F9}
.lzq-ghost:disabled{opacity:1;background:#F1F5F9;border-color:#CBD5E1;color:#475569!important;cursor:default}
.lzq-ghost:disabled .lzq-ic{color:#64748B!important}
.lzq-bar .lzq-check{display:inline-flex;align-items:center;justify-content:center;gap:6px;width:100%;max-width:420px;min-height:52px;padding:6px 12px;border:0;border-radius:16px;background:#15803d;color:#fff!important;font:inherit;font-size:19px;font-weight:900;line-height:1.1;box-shadow:0 4px 0 #166534;white-space:nowrap;overflow:hidden;cursor:pointer}
.lzq-bar .lzq-check.try{background:#C2410C;box-shadow:0 4px 0 #9A3412}
.lzq-bar .lzq-check.wait,.lzq-bar .lzq-check:disabled{background:#E2E8F0;color:#334155!important;box-shadow:inset 0 0 0 2px #CBD5E1;font-size:17px;font-weight:800;cursor:default;transform:none}
.lzq-bar .lzq-check:active:not(:disabled){transform:translateY(4px);box-shadow:none}
.lzt-strip .lzt-count{font-size:16px;gap:6px 10px;color:#334155}.lzt-strip .lzt-count b{font-size:16px}
.lzt-fixchip{display:inline-flex;align-items:center;min-height:28px;padding:2px 12px;border-radius:999px;background:#FFEDD5;border:1.5px solid #FDBA74;color:#9A3412!important;font-size:15px;font-weight:900}
.lzt-info{display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;margin:-10px -10px -10px auto;padding:0;border:0;background:none;color:#475569!important;font:inherit;font-size:20px;line-height:1;cursor:pointer}
.lzt-info[aria-expanded=true]{color:#1D4ED8!important}
.lzt-legend[hidden]{display:none!important}
.lzt-legend{font-size:14px;margin:6px 0 0;padding:6px 8px;background:#F8FAFC;border-radius:10px;color:#334155}
.lzt-legend i{width:18px;height:18px;font-style:normal;font-size:11px;font-weight:900;line-height:15px;text-align:center;color:#fff;vertical-align:-4px}
.lzt-legend i.skip{color:#5b4300}
.lzt-dot.wrong .lzt-dc,.lzt-dot.skip .lzt-dc{font-size:16px}
.lzt-dc{width:30px;height:30px;font-size:14px}
.lzt-dots.live{margin:4px 0 0}
.wb-shell.lzq .wb-read{min-height:44px;min-width:0;padding:0 14px;font-size:15px;gap:6px;white-space:nowrap}
.wb-shell.lzq .wb-read-t{display:inline!important}
.wb-shell.lzq .wb-qhead{font-size:15px!important}
.wb-shell.lzq .lzt-small{font-size:15px;color:#475569!important}
.lzp-btn{min-height:68px;font-size:19px}
.lzp-k{flex:0 0 44px;height:44px;font-size:20px}
@media(max-width:520px){.lzp-btn{min-height:68px;font-size:19px;padding:8px 12px;gap:12px}.lzp-k{flex-basis:44px;height:44px;font-size:20px}.lzp-h{font-size:22px!important}
 .lzq-bar{padding:10px 12px calc(10px + env(safe-area-inset-bottom,0px))}.lzq-grp{gap:12px}.lzq-ghost{padding:0 11px;font-size:16px}.lzq-bar .lzq-check{font-size:18px;padding:6px 8px}.lzq-bar .lzq-check.wait,.lzq-bar .lzq-check:disabled{font-size:16px}
 .lzt-dc{width:30px;height:30px;font-size:14px}}
/* keyboard open: the header collapses to a slim strip; nothing else changes size */
body.lzq-kb #topbar{padding:4px 12px;background:rgba(11,27,61,.96);box-shadow:0 2px 10px rgba(0,0,0,.25);pointer-events:auto}
body.lzq-kb #topbar .tb-btn:not(.lzb){display:none!important}
body.lzq-kb.lz-back #app{padding-top:60px!important}
body.lzq-kb .wb-shell.lzq .wb-qhead,body.lzq-kb .wb-shell.lzq .lzt-strip{display:none!important}
body.lzq-kb .wb-shell.lzq .wb-problem{padding-top:4px}
@media(max-width:520px){.lzq-bar .lzq-mw{display:none}}
html:has(body.lzq-kb){scroll-padding-top:60px}
/* Reveal quiz screen (general quiz shell, Reveal lessons only) */
.rvq.focus-wrap{max-width:640px}
.rvq .card.gold{padding:14px 16px 0;border:1px solid rgba(255,255,255,.6);border-radius:20px;box-shadow:0 10px 28px rgba(5,20,40,.22)}
.rvq .rvq-head{margin:0 0 12px;padding-bottom:8px}
.rvq .rvq-head .lzt-count{font-size:16px;margin-top:4px}
.rvq-qrow{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:start}
.rvq .qtext{margin:0;font-size:21px;line-height:1.35;font-weight:800;color:#1E293B}
.rvq-read{display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:0 14px;border:1.5px solid #BFDBFE;background:#EFF6FF;border-radius:999px;font:inherit;font-size:15px;font-weight:800;color:#1D4ED8!important;white-space:nowrap;cursor:pointer}
.rvq .rvq-tools{margin:10px 0 0!important;justify-content:flex-start!important}
.rvq .readbtn{min-height:44px;font-size:16px;padding:6px 14px}
.rvq .scratch{margin:10px 0 4px;padding:6px 10px}
.rvq .opts{margin-top:12px;gap:10px}
.rvq .opt{min-height:60px;padding:10px 12px;font-size:18px;line-height:1.3;border:2px solid #CBD5E1;border-radius:16px;background:#fff;box-shadow:0 3px 0 #E2E8F0;gap:10px}
.rvq .opt .letter{min-width:36px;height:36px;border-radius:50%;font-size:18px}
.rvq .opts.g2{grid-template-columns:1fr 1fr}
.rvq .opts.g2 .opt{flex-direction:column;align-items:flex-start;justify-content:flex-start;gap:6px}
.rvq .opt.sel{border-color:#2563EB;background:#EFF6FF;box-shadow:0 0 0 3px #BFDBFE}
.rvq .lzq-bar{margin:14px -16px 0;border-radius:0 0 20px 20px}
.rvq #nextbar .hero-chip,.rvq #trybar .speech{font-size:16px}
@media(min-width:700px){.wb-shell.lzq .wb-qhead{font-size:17px!important}.lzt-strip .lzt-count,.lzt-strip .lzt-count b,.rvq .rvq-head .lzt-count{font-size:18px}.lzq-ghost{font-size:17px}
 .lzt-strip{display:grid;grid-template-columns:auto minmax(0,1fr);align-items:center;column-gap:16px}.lzt-strip .lzt-legend{grid-column:1 / -1}
 .lzt-strip .lzt-info{margin:-10px 0 -10px 0}.lzt-dc{width:36px;height:36px;font-size:16px}.lzt-dots.live .lzt-dot{flex:0 0 44px;max-width:44px;height:44px}.lzt-dots.live{justify-content:flex-start;gap:2px}.lzt-strip .lzt-dots{justify-content:flex-start;margin:0}.rvq .wb-qhead{font-size:17px!important}}
/* iPad / tablet (1180x820): a real tablet layout, not a scaled phone */
@media(min-width:900px){
 .wb-shell.lzq{max-width:900px}
 .wb-shell.lzq .wb-page{padding:22px 40px 0}
 .wb-shell.lzq .lzq-bar{margin:20px -40px 0;padding:12px 40px}
 .lzq-grp{justify-content:center;gap:16px;max-width:680px;margin:0 auto}
 .lzq-main{flex:0 1 400px}
 .lzq-ghost{min-height:56px;padding:0 22px;font-size:18px;border-radius:16px}
 .lzq-bar .lzq-check{min-height:56px;font-size:21px}.lzq-bar .lzq-check.wait,.lzq-bar .lzq-check:disabled{font-size:19px}
 .wb-shell.lzq .wb-problem{display:block}
 .wb-shell.lzq .wb-qcopy{font-size:28px}
 .wb-shell.lzq .wb-instruction{font-size:22px}
 .wb-shell.lzq .wb-answerarea{margin-top:12px}
 .wb-shell.lzq .wb-form{margin:12px 0 4px}
 .wb-shell.lzq .wb-formrow{font-size:24px}
 .wb-shell.lzq .wb-in{height:60px;font-size:28px}.wb-shell.lzq .wb-in.num{width:120px}
 .wb-shell.lzq .wb-because{font-size:22px;min-height:96px;max-width:none}
 .wb-shell.lzq .wb-eq{justify-content:center;font-size:32px}
 .wb-shell.lzq .wb-pad{grid-template-columns:repeat(3,112px);gap:12px;margin:14px auto 0}
 .wb-shell.lzq .wb-key{min-height:64px;font-size:30px}
 .wb-shell.lzq .wb-read{font-size:17px;min-height:48px;padding:0 18px}
 .wb-shell.lzq .lzt-why,.wb-shell.lzq .lzt-tipline,.wb-shell.lzq .lzt-model-t,.wb-shell.lzq .lzt-hint{font-size:22px}
 .wb-shell.lzq .lzt-small{font-size:18px}
 .wb-shell.lzq .lzp-btn{font-size:22px;min-height:72px}.wb-shell.lzq .lzp-k{flex-basis:48px;height:48px;font-size:22px}
 .wb-shell.lzq .wb-feedback h2{font-size:28px}.wb-shell.lzq .wb-teach{font-size:22px}
 .rvq.focus-wrap{max-width:900px}.rvq .card.gold{padding:22px 40px 0}.rvq .lzq-bar{margin:20px -40px 0;padding:12px 40px}
 .rvq .qtext{font-size:28px}.rvq .opt{font-size:22px;min-height:72px;padding:12px 16px}.rvq .opt .letter{min-width:42px;height:42px;font-size:20px}.rvq-read{font-size:17px;min-height:48px}
}
/* dialog: exit confirm + look back */
.lzd-wrap{position:fixed;inset:0;z-index:300;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(11,27,61,.6);animation:lztIn .15s ease-out}
.lzd{width:100%;max-width:440px;background:#fff;color:#1E293B;border-radius:20px;padding:22px 20px 18px;box-shadow:0 20px 50px rgba(0,0,0,.35);text-align:left}
.lzd *{color:inherit}.lzd-t{margin:0 0 6px!important;font-size:24px!important;line-height:1.2;font-weight:900;color:#1E293B!important;background:none!important;-webkit-text-fill-color:currentColor!important}
.lzd-b p{margin:6px 0;font-size:18px;line-height:1.4;font-weight:700;color:#334155!important}.lzd-b .lzd-q{font-size:19px;color:#1E293B!important;background:#F1F5F9;border-radius:12px;padding:10px 12px}
.lzd-b .lzd-r.ok{color:#15803d!important;font-weight:900}.lzd-b .lzd-r.no{color:#B91C1C!important;font-weight:900}
.lzd-btns{display:flex;gap:12px;margin-top:16px}
.lzd-btn{flex:1 1 0;min-height:52px;padding:6px 12px;border-radius:16px;font:inherit;font-size:19px;font-weight:900;cursor:pointer}
.lzd-btn.go{background:#15803d;color:#fff!important;border:0;box-shadow:0 4px 0 #166534}
.lzd-btn.ghost{background:#fff;color:#1E293B!important;border:2px solid #94A3B8}
.lzd-btn:active{transform:translateY(2px)}
/* ===== Final polish (Eb 2026-11-05 review: phone 7/10, iPad 6/10; design-inspo v3 + 60fps Duolingo/Brilliant bottom sheet) =====
   bar pinned to the viewport bottom on every question screen, one submit, "Check ✓" slate -> green, roomier tablet layout, bigger meta type */
:root{--lzqBar:76px;--lzqTop:72px}
@media(min-width:900px){:root{--lzqBar:88px;--lzqTop:76px}}
.wb-shell.lzq.fadein,.rvq.fadein{animation:lzqFade .3s ease}
@keyframes lzqFade{from{opacity:0}to{opacity:1}}
#app:has(.lzq-bar){padding-bottom:calc(var(--lzqBar) + 16px + env(safe-area-inset-bottom,0px))!important}
body.lz-exit #app:has(.lzq-bar){padding-top:var(--lzqTop)!important}
html:has(.lzq-bar){scroll-padding-bottom:calc(var(--lzqBar) + 24px)}
/* 1 the bar: fixed to the bottom of the viewport, same height everywhere */
.lzq-bar,.wb-shell.lzq .lzq-bar,.rvq .lzq-bar{position:fixed!important;left:0;right:0;bottom:0;z-index:40;margin:0!important;height:calc(var(--lzqBar) + env(safe-area-inset-bottom,0px));padding:0 12px env(safe-area-inset-bottom,0px)!important;display:flex;align-items:center;background:#fff;border:0;border-top:1px solid #E2E8F0;border-radius:0!important;box-shadow:0 -8px 24px rgba(5,20,40,.16);transform:none}
.lzq-bar .lzq-grp{width:100%;max-width:640px;margin:0 auto}
.wb-shell.lzq .wb-page,.rvq .card.gold{display:flex;flex-direction:column;min-height:calc(100vh - var(--lzqTop) - var(--lzqBar) - 16px - env(safe-area-inset-bottom,0px));min-height:calc(100svh - var(--lzqTop) - var(--lzqBar) - 16px - env(safe-area-inset-bottom,0px));padding-bottom:16px}
.wb-shell.lzq .wb-problem,.wb-shell.lzq .lzt-card{flex:1 0 auto}
/* 7 main button: waiting = solid slate + white label, ready = bright green "Check ✓"; Back/Skip stay quiet outlines */
.lzq-bar .lzq-check{background:#16A34A;box-shadow:0 4px 0 #166534;color:#fff!important;font-size:20px;font-weight:900}
.lzq-bar .lzq-check.wait,.lzq-bar .lzq-check:disabled{background:#475569;color:#fff!important;box-shadow:0 4px 0 #334155;font-size:20px;font-weight:900;opacity:1}
.lzq-bar .lzq-check.try{background:#C2410C;box-shadow:0 4px 0 #9A3412}
.lzq-ghost{min-height:48px;font-size:16px;border-width:2px}
/* 2 number pad without a ✓ key: 0 is wide, ⌫ on the right */
.wb-shell.lzq .wb-pad.lzq-pad .wb-key.zero{grid-column:span 2}
.ty-grid .ty-zero{grid-column:span 2}
/* 3 his answer above the banner */
.lzt-yours{display:flex;flex-wrap:wrap;gap:6px 18px;margin:4px 0 10px;font-size:24px;font-weight:900;color:#1E293B}
.lzt-yours span{display:inline-flex;align-items:center;gap:8px;padding:6px 14px;background:#F0FDF4;border:1.5px solid #86EFAC;border-radius:14px}
.lzt-yours b{color:#14532D!important}.lzt-yours i{font-style:normal;color:#16A34A!important}
/* 8 Read it chip on its own row (top-right), question gets the full width */
.wb-shell.lzq .wb-qrow,.rvq-qrow{display:flex!important;flex-direction:column;align-items:stretch;gap:4px}
.wb-shell.lzq .wb-qrow .wb-read,.rvq-qrow .rvq-read{order:-1;align-self:flex-end}
/* 6 type: lesson line + "Question n of N" dark */
.wb-shell.lzq .wb-qhead,.rvq .wb-qhead{color:#1E293B!important;font-size:16px!important}
.wb-shell.lzq .wb-qhead>span:first-child,.rvq .wb-qhead>span:first-child{color:#1E293B!important}
.lzt-strip .lzt-count,.lzt-strip .lzt-count b{color:#0F172A!important;font-size:17px}
.wb-shell.lzq .wb-instruction{color:#334155!important;font-size:16px}
.lzt-dot.seen .lzt-dc{background:#CBD5E1;border-color:#94A3B8;color:#1E293B!important}
/* 9 Reveal quiz: same head as the lesson test; badges like the reason pick; long choices in one column; help + scratchpad one row */
.rvq .rvq-head.lzt-strip{display:block;margin:0 0 12px;padding:0 0 8px}
.rvq .rvq-head .lzt-dots{flex-wrap:nowrap;justify-content:flex-start;gap:0;margin:6px 0 0}
.rvq .rvq-head .lzt-dot{flex:1 1 0;min-width:0;max-width:44px;height:36px}
.rvq .opt .letter{background:#FFD166!important;color:#1E293B!important;border:0}
.rvq .opts:not(.g2){grid-template-columns:1fr!important}
.rvq .rvq-tools{display:flex!important;flex-wrap:wrap;align-items:center;gap:10px;margin:8px 0 4px!important}
.rvq .rvq-tools .readbtn{margin:0;min-height:48px}
.rvq .rvq-tools .scratch{flex:1 1 160px;margin:0;padding:0 12px;min-height:48px;display:flex;flex-direction:column;justify-content:center}
.rvq .rvq-tools .scratch[open]{flex-basis:100%;padding:8px 10px;display:block}
.rvq .rvq-tools .scratch summary{min-height:44px;display:flex;align-items:center;font-size:17px}
/* 10 Exit pill: solid, dark text, 48pt; Learners moves to the right group so nothing sits next to Exit */
#topbar .tb-btn.lzb.lzb-exit{height:48px;padding:0 18px 0 14px;background:#F8FAFC;color:#0F172A;border:2px solid #fff;box-shadow:0 6px 18px rgba(0,0,0,.3);-webkit-backdrop-filter:none;backdrop-filter:none}
#topbar .tb-btn.lzb.lzb-exit .lzb-ar,#topbar .tb-btn.lzb.lzb-exit .lzb-to{color:#0F172A}
#topbar .tb-btn.lzb.lzb-exit .lzb-to{font-size:16px;font-weight:900}
body.lz-exit #topbar .tb-group:first-child{flex:1 1 auto}
body.lz-exit #topbar #usersBtn{margin-left:auto}
body.lz-exit #topbar .tb-group:first-child+.tb-group{margin-left:8px}
@media(max-width:520px){body.lz-back.lz-exit #topbar .tb-btn:not(.lzb){min-width:52px;height:52px;padding:4px 5px;flex-direction:column;gap:2px}
 body.lz-back.lz-exit #topbar .tb-btn:not(.lzb) .tb-ic{font-size:18px}
 body.lz-back.lz-exit #topbar .tb-btn:not(.lzb) .tb-lb{display:block;font-size:13px;text-transform:none;letter-spacing:0;opacity:1}
 #topbar .tb-btn.lzb.lzb-exit{padding:0 14px 0 12px}
 body.lz-exit #topbar .tb-group{gap:6px}}
/* iPad / tablet: a 1000px card that fills the screen, content balanced in it, two-column keypad screens */
@media(min-width:900px){
 .wb-shell.lzq{max-width:1000px}.rvq.focus-wrap{max-width:1000px}
 .wb-shell.lzq .wb-page,.rvq .card.gold{padding:22px 44px 18px}
 .lzq-bar .lzq-grp{max-width:1000px;padding:0 44px;justify-content:center;gap:20px}
 .lzq-main{flex:0 1 440px}
 .lzq-bar .lzq-check,.lzq-bar .lzq-check.wait,.lzq-bar .lzq-check:disabled{min-height:60px;font-size:23px}
 .lzq-ghost{min-height:52px;padding:0 20px;font-size:18px}
 .wb-shell.lzq .wb-qhead,.rvq .wb-qhead{font-size:20px!important}
 .lzt-strip .lzt-count,.lzt-strip .lzt-count b,.rvq .rvq-head .lzt-count,.rvq .rvq-head .lzt-count b{font-size:21px}
 .lzt-strip{grid-template-columns:auto minmax(0,1fr)}
 .lzt-dots.live .lzt-dot,.rvq .rvq-head .lzt-dot{flex:0 0 52px;max-width:52px;height:52px}
 .lzt-dc,.rvq .rvq-head .lzt-dc{width:42px;height:42px;font-size:18px}
 .lzt-dot.wrong .lzt-dc,.lzt-dot.skip .lzt-dc{font-size:20px}
 .rvq .rvq-head.lzt-strip{display:grid;grid-template-columns:auto minmax(0,1fr);align-items:center;column-gap:20px}
 .rvq .rvq-head .wb-qhead{grid-column:1 / -1}
 .rvq .rvq-head .lzt-dots{margin:0}
 .wb-shell.lzq .wb-read,.rvq-read{font-size:18px;min-height:52px;padding:0 20px}
 .rvq .rvq-tools .readbtn{font-size:18px;min-height:52px;padding:6px 18px}
 .rvq .rvq-tools .scratch summary{font-size:18px;min-height:48px}
 .wb-shell.lzq .wb-instruction{font-size:22px}
 #topbar .tb-lb{font-size:16px!important}
 #topbar .tb-btn.lzb.lzb-exit{height:52px}#topbar .tb-btn.lzb.lzb-exit .lzb-to{font-size:18px}
 /* content balanced vertically in the card (no wall of blank under it) */
 .wb-shell.lzq .wb-problem{display:flex!important;flex-direction:column;justify-content:center;padding-top:12px}
 .wb-shell.lzq .lzt-card{display:flex;flex-direction:column;justify-content:center}
 .rvq .card.gold>.opts{margin-top:16px}
 /* Explain: bigger boxes and Because area */
 .wb-shell.lzq .wb-formrow{font-size:28px}
 .wb-shell.lzq .wb-in{height:72px;font-size:32px}.wb-shell.lzq .wb-in.num{width:150px}
 .wb-shell.lzq .wb-because{font-size:26px;min-height:150px;padding:14px 16px}
 .wb-shell.lzq .wb-form{gap:22px;margin:18px 0 6px}
 .lzt-yours{font-size:28px}
 .wb-shell.lzq .lzp-btn{min-height:80px;font-size:23px}
 /* keypad questions: question + equation left, keypad right */
 .wb-shell.lzq .wb-problem:has(.wb-answerarea>.wb-pad){display:grid!important;grid-template-columns:minmax(0,1fr) auto;grid-template-rows:auto 1fr;column-gap:40px;align-content:center}
 .wb-shell.lzq .wb-problem:has(.wb-answerarea>.wb-pad)>.wb-questionarea{grid-column:1;grid-row:1}
 .wb-shell.lzq .wb-problem:has(.wb-answerarea>.wb-pad)>.wb-answerarea{display:contents}
 .wb-shell.lzq .wb-problem:has(.wb-answerarea>.wb-pad) .wb-answerarea>*{grid-column:1}
 .wb-shell.lzq .wb-problem:has(.wb-answerarea>.wb-pad) .wb-answerarea>.wb-pad{grid-column:2;grid-row:1 / span 6;align-self:center;margin:0}
 .wb-shell.lzq .wb-problem:has(.wb-answerarea>.wb-pad) .wb-eq{justify-content:flex-start;align-self:center;font-size:44px;margin:12px 0}
 .wb-shell.lzq .wb-problem:has(.wb-answerarea>.wb-pad) .wb-num-box{min-width:110px;height:84px;font-size:44px}
 .wb-shell.lzq .wb-pad.lzq-pad{grid-template-columns:repeat(3,112px);gap:12px}
 .wb-shell.lzq .wb-pad.lzq-pad .wb-key{min-height:96px;height:96px;font-size:36px}
 .ty-grid .ty-key{min-height:96px;font-size:34px}
}
/* polish round 2: full-width content, iPad Read it sits beside the (full-width-enough) question, fix-round meta on one line */
.wb-shell.lzq .wb-problem>.wb-questionarea,.wb-shell.lzq .wb-problem>.wb-answerarea{width:100%;max-width:none}
.wb-shell.lzq .wb-because{width:100%!important;max-width:none!important}
.wb-shell.lzq .wb-answerarea .lzp,.wb-shell.lzq .wb-answerarea .lzt-praise{max-width:none}
@media(max-width:520px){.lzt-strip .lzt-count{flex-wrap:nowrap;white-space:nowrap}.lzt-strip .lzt-fixchip{font-size:14px;padding:2px 9px}}
@media(min-width:900px){
 .wb-shell.lzq .wb-qrow,.rvq-qrow{display:grid!important;grid-template-columns:minmax(0,1fr) auto;column-gap:24px;align-items:center}
 .wb-shell.lzq .wb-qrow .wb-read,.rvq-qrow .rvq-read{order:0;align-self:start}
 .wb-shell.lzq .wb-problem:has(.wb-answerarea>.wb-pad){grid-template-rows:auto auto auto auto 1fr;align-content:center}
 .wb-shell.lzq .wb-problem:has(.wb-answerarea>.wb-pad) .wb-answerarea>.wb-pad{grid-row:1 / -1}
 .wb-shell.lzq .wb-problem:has(.wb-answerarea>.wb-pad) .wb-qrow{display:flex!important;flex-direction:column;align-items:stretch}
 .wb-shell.lzq .wb-problem:has(.wb-answerarea>.wb-pad) .wb-qrow .wb-read{order:-1;align-self:flex-start;margin-bottom:6px}
 .lzt-yours{margin:0 0 10px}
 .wb-shell.lzq .lzp{padding:12px 16px 14px}.wb-shell.lzq .lzp-list{gap:10px}.wb-shell.lzq .lzp-btn{min-height:72px}
 .wb-shell.lzq .wb-answerarea:has(>.lzt-yours){display:grid;grid-template-columns:auto minmax(0,1fr);column-gap:14px;align-items:stretch}
 .wb-shell.lzq .wb-answerarea:has(>.lzt-yours)>*{grid-column:1 / -1}
 .wb-shell.lzq .wb-answerarea:has(>.lzt-yours)>.lzt-yours{grid-column:1;margin:0}
 .wb-shell.lzq .wb-answerarea:has(>.lzt-yours)>.lzt-praise{grid-column:2;margin:0}
 .wb-shell.lzq .wb-answerarea:has(>.lzt-yours)>.lzp{margin-top:12px}
}
`;
function lztInstallStyle(){if(typeof document==="undefined")return;let s=document.getElementById("lzt-style");if(!s){s=document.createElement("style");s.id="lzt-style";document.head.appendChild(s);}s.textContent=LZT_CSS;}
lztInstallStyle();
const wbPublic={lessons:WB_LESSONS,gen:wbGenerate,check:wbCheck,review:wbRevealReview,tenSlot:WB_TEN,resumeSnapshot:wbResumeSnapshot,resumeRestore:wbResumeRestore};
if(typeof window!=="undefined")window.__wb=wbPublic;else if(typeof globalThis!=="undefined")globalThis.__wb=wbPublic;
