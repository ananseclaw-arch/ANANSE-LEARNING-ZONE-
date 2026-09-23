/* ============================================================
   ANANSE'S SCIENCE LAB — explore, experiment, discover
   Quests instead of quizzes: every lab is a mystery Ananse needs
   help with. Getting it "wrong" is safe and shows WHY (the bridge
   cracks, the plant wilts, the pond turns green). Standards noted
   per lab match the grade science lessons (NGSS as adopted by MD).
   ============================================================ */
"use strict";
let LAB=null; // active lab state
const LABS=[
{id:"gravity",icon:"🪐",title:"Gravity Drop",std:"3-PS2-1 · 4-PS3-1",grade:"3–4",
 mystery:"Ananse dropped his basketball on four different worlds and lost track of which one made it fall the SLOWEST. Drop the ball on each planet and time it.",
 goal:"Find the world where the ball takes more than 3 seconds to fall.",
 reflect:[{q:"Where did the ball fall slowest, and why?",opts:["The Moon — its gravity pulls the weakest","Jupiter — it is the biggest","Earth — it is our home","Mars — it is red"]},
          {q:"A bigger gravity pull makes a falling ball...",opts:["Speed up faster and land sooner","Float","Fall slower","Stop in the air"]}]},
{id:"plant",icon:"🌱",title:"Grow-a-Plant",std:"3-LS1-1 · 3-LS4-3",grade:"3",
 mystery:"Grandma's tomato seedling will not grow. Ananse thinks it is the sun and the water. Set the hours of sunlight and cups of water, then run a week and watch.",
 goal:"Grow a healthy plant to 20 cm or taller in 7 days.",
 reflect:[{q:"What happened with LOTS of water every day?",opts:["The roots drowned and the plant wilted","It grew twice as tall","Nothing changed","It turned into a tree"]},
          {q:"Plants need sunlight because...",opts:["They use it to make their own food","It keeps them warm at night","It waters them","They like the color"]}]},
{id:"circuit",icon:"💡",title:"Light the Lantern",std:"4-PS3-2",grade:"4",
 mystery:"Ananse's lantern will not light. Electricity needs a complete loop from the battery, through the bulb, and back. Tap each piece to change it until the lantern glows.",
 goal:"Make the bulb light up.",
 reflect:[{q:"Why did the bulb stay dark when one piece was a gap?",opts:["Electricity needs an unbroken loop to flow","The battery was empty","Bulbs only work at night","Gaps make it brighter"]},
          {q:"An OPEN switch in a circuit...",opts:["Breaks the loop so the bulb goes off","Makes the bulb brighter","Charges the battery","Does nothing"]}]},
{id:"pond",icon:"🐟",title:"Rescue the Pond",std:"5-LS2-1 · 5-ESS3-1",grade:"5",
 mystery:"The pond by Ananse's den is turning green and the fish are gasping. Fertilizer from the farm washes in and feeds algae that steal the oxygen. Change what happens on land, then run 10 weeks.",
 goal:"After 10 weeks: oxygen at 6 or higher AND at least 20 fish alive.",
 reflect:[{q:"What did planting trees along the stream do?",opts:["Caught runoff before it reached the pond","Made the water colder","Fed the fish","Blocked the sun"]},
          {q:"Too much algae is bad for fish because algae...",opts:["Use up the oxygen fish need to breathe","Eat the fish","Make waves","Are too colorful"]}]},
{id:"bridge",icon:"🌉",title:"Bridge Builder",std:"3-5-ETS1-1 · 3-5-ETS1-3",grade:"3–5",
 mystery:"The team bus must cross the river to the tournament. Tap the bridge to add supports (you get 3). Send the bus — if a span is too long it cracks, and Ananse shows you where.",
 goal:"Get the bus across without a collapse.",
 reflect:[{q:"When the bus fell through, what was wrong?",opts:["A span between supports was too long to hold the weight","The bus was too fast","The river was too wet","The bridge was too short"]},
          {q:"Engineers test designs and fix failures because...",opts:["Each failure shows exactly what to improve","Bridges never fail","Testing is a game","It looks fun"]}]},
{id:"sound",icon:"🎤",title:"See Your Sound",std:"4-PS4-1",grade:"4",
 mystery:"Ananse wants to SEE sound. Your device's microphone can draw the wave. Make a loud sound to raise the wave, then a high sound to squeeze the wiggles together.",
 goal:"Make a LOUD wave (tall) and a HIGH wave (wiggles close together).",
 reflect:[{q:"A louder sound made the wave...",opts:["Taller (bigger amplitude)","Shorter","Disappear","Change color"]},
          {q:"A higher-pitched sound made the wiggles...",opts:["Closer together (shorter wavelength)","Farther apart","Stop","Taller only"]}]},
{id:"tilt",icon:"⚖️",title:"Balance the Ball",std:"3-PS2-1",grade:"3",
 mystery:"Ananse balanced a ball on a board — then sneezed. Tilt your device (or use the arrows) to roll the ball back to the centre and hold it there for 3 seconds. That is balanced forces!",
 goal:"Keep the ball inside the centre circle for 3 seconds.",
 reflect:[{q:"When the ball stayed still in the centre, the forces on it were...",opts:["Balanced — pulls cancelled out","Unbalanced","Gone","Magnetic"]},
          {q:"Tilting the board made the ball roll because...",opts:["Gravity pulled it downhill — an unbalanced force","The ball got heavier","The board pushed up","Air pushed it"]}]},
{id:"zoom",icon:"🔭",title:"Zoom the Universe",std:"5-ESS1-1 · 5-PS1-1",grade:"5",
 mystery:"Ananse's telescope zooms from the whole Solar System all the way down to the atoms inside a basketball. Slide through every scale and read the clues.",
 goal:"Visit every scale from the Solar System to the atom.",
 reflect:[{q:"Which is the SMALLEST thing you zoomed to?",opts:["An atom","A cell","A basketball","Maryland"]},
          {q:"Why can't you see atoms or cells with your eyes?",opts:["They are far too small — you need microscopes","They are invisible magic","They move too fast","They are underground"]}]}
];
function labById(id){return LABS.find(l=>l.id===id)}
function labDone(id){return !!(P&&P.lab&&P.lab[id])}
/* ---------- hub ---------- */
function renderLab(){
  clearTimers();closeOverlay();defocus();showAnanseCorner(false);
  if(typeof labStop==="function")labStop();
  const done=LABS.filter(l=>labDone(l.id)).length;
  const cards=LABS.map(l=>'<button class="opt lab-card'+(labDone(l.id)?" done":"")+'" onclick="openLab(\''+l.id+'\')"><span class="lab-ic">'+l.icon+'</span><span style="text-align:left;flex:1"><b>'+esc(l.title)+'</b><br><span class="muted" style="font-size:13px">'+esc(l.std)+' · Grade '+esc(l.grade)+'</span></span>'+(labDone(l.id)?'<span class="lvl-badge" style="background:#2f8f4e">★ done</span>':'<span class="lvl-badge" style="background:#6f88ad">quest</span>')+'</button>').join("");
  app.innerHTML='<div class="fadein" style="max-width:700px;margin:0 auto">'
   +'<div class="center"><div class="ananse-wrap">'+ananseSVG(110,"teach")+'</div><h1>🧪 Ananse\'s Science Lab</h1>'
   +'<div class="speech" style="max-width:520px;margin:10px auto">Real scientists do not just answer questions — they try things and watch what happens. Each quest is a mystery I need your help with. Nothing here can break, so experiment!</div></div>'
   +'<p class="muted center" style="margin-top:8px">'+done+' of '+LABS.length+' quests solved · each first solve earns 30 XP</p>'
   +'<div class="opts" style="margin-top:14px">'+cards+'</div>'
   +'<div class="btn-row" style="margin-top:18px"><button class="btn" onclick="renderHome()">⟵ Back to Adventure</button><button class="btn secondary" onclick="renderLessons()">📚 Lessons</button></div><div class="spacer"></div></div>';
  say("Welcome to my science lab, "+P.name+"! Pick a quest and let's experiment.");
}
function openLab(id){
  const l=labById(id);if(!l)return renderLab();
  clearTimers();closeOverlay();defocus();showAnanseCorner(false);
  if(typeof labStop==="function")labStop();
  LAB={id,goalMet:false,flags:{},raf:null,timers:[]};
  app.innerHTML='<div class="fadein" style="max-width:720px;margin:0 auto">'
   +'<div class="hud"><span class="pill">🧪 <b>Science Lab</b></span><span class="pill">'+l.icon+' '+esc(l.title)+'</span><span class="lvl-badge">'+esc(l.std)+'</span></div>'
   +'<div class="center"><div class="ananse-wrap">'+ananseSVG(90,"teach")+'</div>'
   +'<div class="speech" style="max-width:560px;margin:8px auto">'+esc(l.mystery)+'</div></div>'
   +'<div class="lab-goal" id="labGoal">🎯 Quest: '+esc(l.goal)+'</div>'
   +'<div class="card gold lab-area" id="labArea"></div>'
   +'<div id="labFeedback" class="lab-feedback" hidden></div>'
   +'<div class="btn-row" style="margin-top:14px"><button class="btn secondary" onclick="renderLab()">⟵ All quests</button><button class="btn secondary" onclick="say(labById(LAB.id).mystery)">🔊 Read it to me</button><button class="btn" id="labDoneBtn" hidden onclick="labReflect()">I solved it! What did I discover? ▶</button></div><div class="spacer"></div></div>';
  say(l.mystery);
  ({gravity:labGravity,plant:labPlant,circuit:labCircuit,pond:labPond,bridge:labBridge,sound:labSound,tilt:labTilt,zoom:labZoom})[id]($("labArea"));
}
function labStop(){
  if(!LAB)return;
  if(LAB.raf)cancelAnimationFrame(LAB.raf);
  (LAB.timers||[]).forEach(clearInterval);
  if(LAB.cleanup){try{LAB.cleanup()}catch(e){}}
}
function labFeedback(html,kind){const f=$("labFeedback");if(!f)return;f.hidden=false;f.className="lab-feedback "+(kind||"");f.innerHTML=html;}
function labGoalMet(msg){
  if(!LAB||LAB.goalMet)return;
  LAB.goalMet=true;
  const g=$("labGoal");if(g){g.classList.add("met");g.innerHTML="✅ Quest solved! "+esc(msg||"");}
  const b=$("labDoneBtn");if(b)b.hidden=false;
  sfx("correct");confetti();say("You solved it! "+(msg||""));
}
function labReflect(){
  const l=labById(LAB.id);labStop();
  LAB.ri=0;LAB.rc=0;labReflectQ();
}
function labReflectQ(){
  const l=labById(LAB.id);const r=l.reflect[LAB.ri];
  if(!r)return labFinish();
  const order=shuffle(r.opts.map((_,i)=>i));LAB.order=order;
  const letters=["A","B","C","D"];
  openOverlay('<div><div class="center"><div class="ananse-wrap">'+ananseSVG(80,"teach")+'</div><div class="speech">Scientist\'s notebook — question '+(LAB.ri+1)+' of '+l.reflect.length+'</div></div><div class="spacer"></div>'
   +'<p class="qtext" style="font-size:22px">'+esc(r.q)+'</p><div class="opts">'+order.map((oi,pos)=>'<button class="opt" id="lopt'+pos+'" onclick="labReflectA('+pos+')"><span class="letter">'+letters[pos]+'</span><span>'+esc(r.opts[oi])+'</span></button>').join("")+'</div></div>');
  say(r.q);
}
function labReflectA(pos){
  const l=labById(LAB.id);const r=l.reflect[LAB.ri];
  const correct=LAB.order[pos]===0;
  LAB.order.forEach((oi,p)=>{const b=$("lopt"+p);if(!b)return;if(oi===0)b.classList.add("correct");else if(p===pos)b.classList.add("wrong");else b.classList.add("dim");b.onclick=null;});
  if(correct){LAB.rc++;sfx("correct");}else sfx("wrong");
  const msg=correct?"Exactly what the experiment showed!":"Look back at what happened in the lab: "+r.opts[0]+".";
  say(msg);
  setTimeout(()=>{LAB.ri++;labReflectQ();},1400);
}
function labFinish(){
  closeOverlay();
  const l=labById(LAB.id);
  P.lab=P.lab||{};
  const first=!P.lab[l.id];
  P.lab[l.id]={date:today(),notebook:LAB.rc+"/"+l.reflect.length};
  if(first){P.xp+=30;}
  P.sessions.push({date:today(),subject:"science",correct:LAB.rc,total:l.reflect.length,lvlAvg:3,xp:first?30:0,t:Date.now(),durMs:0,lab:l.id});
  if(first&&Object.keys(P.lab).length>=4&&!P.trophies.some(t=>t.type==="lab")&&typeof awardTrophy==="function")awardTrophy({type:"lab",icon:"🧪",label:"Lab Explorer",color:"#9ad8ff",detail:"Solved 4 science quests in Ananse's Lab."});
  save();
  app.innerHTML='<div class="fadein center"><div class="ananse-wrap ananse-celebrate">'+ananseSVG(150,"party")+'</div><h1>Quest Complete!</h1>'
   +'<div class="speech" style="max-width:480px;margin:14px auto">'+esc(l.title)+' solved. Notebook: '+LAB.rc+' of '+l.reflect.length+'. '+(first?'+30 XP for a first solve!':'You already earned XP for this one — but every experiment teaches something new.')+'</div>'
   +'<div class="spacer"></div><div class="btn-row"><button class="btn big" onclick="renderLab()">More quests 🧪</button><button class="btn secondary big" onclick="renderHome()">Home 🏠</button></div></div>';
  say("Quest complete! "+(first?"Thirty XP earned.":""));
  confetti();
}
/* ---------- helpers ---------- */
function labSlider(id,label,min,max,val,step,unit){return '<label class="lab-lbl">'+label+': <b id="'+id+'v">'+val+unit+'</b></label><input type="range" id="'+id+'" min="'+min+'" max="'+max+'" step="'+(step||1)+'" value="'+val+'" oninput="$(\''+id+'v\').textContent=this.value+\''+unit+'\'">';}
function labVal(id){return +($(id)&&$(id).value||0)}
function labCanvas(w,h){const c=document.createElement("canvas");c.width=w;c.height=h;c.style.width="100%";c.style.maxWidth=w+"px";c.style.display="block";c.style.margin="0 auto";c.style.borderRadius="16px";c.style.background="#0b2a55";return c;}

/* ---------- 1. Gravity Drop ---------- */
const PLANETS={Earth:{g:9.8,c:"#3b8bd6",e:"🌍"},Moon:{g:1.6,c:"#b9c2cc",e:"🌕"},Mars:{g:3.7,c:"#d96a3d",e:"🔴"},Jupiter:{g:24.8,c:"#d9b27a",e:"🟠"}};
function labGravity(area){
  area.innerHTML='<div class="btn-row" style="justify-content:center">'+Object.keys(PLANETS).map(p=>'<button class="btn secondary" onclick="gravDrop(\''+p+'\')">'+PLANETS[p].e+' '+p+'</button>').join("")+'</div>'
   +'<div id="gravStage"></div><div id="gravLog" class="lab-log"></div>';
  const c=labCanvas(600,260);$("gravStage").appendChild(c);LAB.c=c;LAB.results={};
  gravDraw(0,null,0);
}
function gravDraw(y,planet,t){
  const c=LAB.c,x=c.getContext("2d");x.clearRect(0,0,c.width,c.height);
  x.fillStyle=planet?PLANETS[planet].c:"#1f3c70";x.fillRect(0,230,c.width,30);
  x.fillStyle="#9fd0ff";x.font="16px system-ui";x.fillText(planet?planet+" · gravity "+PLANETS[planet].g+" m/s²":"Pick a world to drop the ball from 10 metres",16,26);
  x.fillText("⏱ "+t.toFixed(2)+" s",500,26);
  x.font="34px system-ui";x.fillText("🏀",285,50+y);
}
function gravDrop(planet){
  if(LAB.raf)cancelAnimationFrame(LAB.raf);
  const g=PLANETS[planet].g,h=10,T=Math.sqrt(2*h/g),start=performance.now();
  const step=now=>{
    const t=Math.min(T,(now-start)/1000);
    gravDraw((t*t*g/2)/h*180,planet,t);
    if(t<T)LAB.raf=requestAnimationFrame(step);
    else{
      LAB.results[planet]=T;sfx("tick");
      $("gravLog").innerHTML=Object.keys(LAB.results).map(p=>'<span class="pill">'+PLANETS[p].e+' '+p+': <b>'+LAB.results[p].toFixed(2)+' s</b></span>').join(" ");
      if(T>3)labGoalMet("On the "+planet+" the ball took "+T.toFixed(1)+" seconds — the weakest pull.");
      else labFeedback("On "+planet+" it landed in "+T.toFixed(2)+" seconds. Try a world with a smaller gravity number.","info");
    }
  };
  LAB.raf=requestAnimationFrame(step);
}

/* ---------- 2. Grow-a-Plant ---------- */
function labPlant(area){
  area.innerHTML='<div class="lab-controls">'+labSlider("sun","Sunlight each day",0,12,3,1," h")+labSlider("water","Water each day",0,6,5,1," cups")+'</div>'
   +'<div class="btn-row" style="justify-content:center;margin-top:8px"><button class="btn" onclick="plantRun()">▶ Run 7 days</button></div><div id="plantStage"></div>';
  const c=labCanvas(600,260);$("plantStage").appendChild(c);LAB.c=c;plantDraw(0,1,0,"Set sun and water, then run a week.");
}
function plantDraw(h,health,day,note){
  const c=LAB.c,x=c.getContext("2d");x.clearRect(0,0,c.width,c.height);
  x.fillStyle="#7a4b21";x.fillRect(0,215,c.width,45);
  const px=h*6;const green=health>0.6?"#3bb273":(health>0.3?"#c9c94a":"#a0763c");
  x.strokeStyle=green;x.lineWidth=Math.max(3,px/20);x.beginPath();x.moveTo(300,215);x.lineTo(300,215-px);x.stroke();
  for(let i=1;i<=Math.floor(px/25);i++){const y=215-i*25;x.fillStyle=green;x.beginPath();x.ellipse(300+(i%2?18:-18),y,18,8,i%2?-.5:.5,0,7);x.fill();}
  if(h>=20&&health>0.6){x.font="26px system-ui";x.fillText("🍅",288,205-px);}
  x.fillStyle="#9fd0ff";x.font="16px system-ui";x.fillText("Day "+day+" · height "+h.toFixed(0)+" cm · "+(health>0.6?"healthy":(health>0.3?"struggling":"wilting")),16,26);
  x.fillText(note,16,48);
}
function plantRun(){
  (LAB.timers||[]).forEach(clearInterval);LAB.timers=[];
  const sun=labVal("sun"),water=labVal("water");
  const sunF=sun>10?0.55:Math.min(1.2,sun/8);
  const waterF=water===0?0:(water===1?0.5:(water<=3?1:(water===4?0.7:0.2)));
  let h=2,day=0,health=1;
  const note=sun>10?"Too much sun scorches the leaves.":(sun<3?"Not enough light to make food.":(water>=5?"Soggy soil — the roots cannot breathe.":(water===0?"No water at all.":"Looking good…")));
  const iv=setInterval(()=>{
    day++;health=Math.min(1,0.4+0.6*Math.min(sunF,waterF)/1);
    if(sun>10||water>=5||water===0)health=Math.min(health,0.3);
    h+=4*sunF*waterF;
    plantDraw(h,health,day,note);
    if(day>=7){clearInterval(iv);
      if(h>=20&&health>0.6)labGoalMet("Grandma's tomato is "+h.toFixed(0)+" cm tall and healthy!");
      else labFeedback("Day 7: "+h.toFixed(0)+" cm and "+(health>0.6?"healthy":"unhappy")+". "+note+" Change one thing and run again.","warn");
    }
  },450);
  LAB.timers.push(iv);
}

/* ---------- 3. Light the Lantern (circuit) ---------- */
const CIRC_STATES=[{k:"gap",l:"·   ·",t:"gap"},{k:"wire",l:"━━━",t:"wire"},{k:"open",l:"━/ ━",t:"switch OPEN"},{k:"closed",l:"━●━",t:"switch CLOSED"}];
function labCircuit(area){
  LAB.slots=[0,1,2,1];
  area.innerHTML='<p class="muted center">Tap a piece to change it: gap → wire → open switch → closed switch</p><div class="circ" id="circ"></div>';
  circDraw();
}
function circDraw(){
  const conducts=s=>s===1||s===3;
  const ok=LAB.slots.every(conducts);
  const firstBad=LAB.slots.findIndex(s=>!conducts(s));
  const slot=i=>'<button class="circ-slot'+(i===firstBad?" bad":"")+'" onclick="circTap('+i+')"><span class="circ-sym">'+CIRC_STATES[LAB.slots[i]].l+'</span><small>'+CIRC_STATES[LAB.slots[i]].t+'</small></button>';
  $("circ").innerHTML='<div class="circ-row"><span class="circ-part">🔋<small>battery</small></span>'+slot(0)+slot(1)+'<span class="circ-part">'+(ok?"🔆":"💡")+'<small>'+(ok?"ON!":"off")+'</small></span></div>'
   +'<div class="circ-row"><span class="circ-part" style="opacity:.0">·</span>'+slot(3)+slot(2)+'<span class="circ-part" style="opacity:.0">·</span></div>';
  if(ok)labGoalMet("A complete loop — the lantern glows!");
  else labFeedback("Electricity leaves the battery but stops at the red piece — the loop is broken there.","warn");
}
function circTap(i){LAB.slots[i]=(LAB.slots[i]+1)%4;sfx("tick");circDraw();}

/* ---------- 4. Rescue the Pond ---------- */
function labPond(area){
  area.innerHTML='<div class="lab-controls">'+labSlider("fert","Fertilizer runoff from the farm",0,10,8,1,"")+labSlider("trees","Trees planted along the stream",0,10,1,1,"")+labSlider("fish","Fish added at the start",0,30,10,1,"")+'</div>'
   +'<div class="btn-row" style="justify-content:center;margin-top:8px"><button class="btn" onclick="pondRun()">▶ Run 10 weeks</button></div><div id="pondStage"></div>';
  const c=labCanvas(600,260);$("pondStage").appendChild(c);LAB.c=c;pondDraw(0,2,8.5,10);
}
function pondDraw(week,algae,oxy,fish){
  const c=LAB.c,x=c.getContext("2d");x.clearRect(0,0,c.width,c.height);
  const g=Math.min(1,algae/10);
  x.fillStyle="rgb("+Math.round(40+60*g)+","+Math.round(120+80*g)+","+Math.round(200-150*g)+")";x.fillRect(0,60,c.width,200);
  x.font="22px system-ui";for(let i=0;i<Math.min(fish,30);i++){x.fillText(oxy<4?"🐟":"🐠",30+(i%10)*55,110+Math.floor(i/10)*50);}
  x.fillStyle="#edf7ff";x.font="16px system-ui";x.fillText("Week "+week+"  ·  algae "+algae.toFixed(1)+"  ·  oxygen "+oxy.toFixed(1)+" mg/L  ·  fish "+Math.round(fish),16,26);
  x.fillStyle=oxy>=6?"#3bb273":(oxy>=4?"#f5a623":"#e0512f");x.fillRect(16,36,Math.max(4,oxy/10*560),10);
}
function pondRun(){
  (LAB.timers||[]).forEach(clearInterval);LAB.timers=[];
  const fert=labVal("fert"),trees=labVal("trees");let fish=labVal("fish"),algae=2,week=0;
  const iv=setInterval(()=>{
    week++;
    const runoff=fert*(1-trees/12);
    algae=Math.max(0.5,algae*0.8+runoff*0.9);
    const oxy=Math.max(0,9.5-algae*0.65);
    if(oxy<4)fish=fish*0.72;else if(oxy>=6)fish=Math.min(40,fish*1.08);
    pondDraw(week,algae,oxy,fish);
    if(week>=10){clearInterval(iv);
      if(oxy>=6&&fish>=20)labGoalMet("Oxygen "+oxy.toFixed(1)+" and "+Math.round(fish)+" fish — the pond is alive again!");
      else labFeedback("Week 10: oxygen "+oxy.toFixed(1)+", fish "+Math.round(fish)+". "+(oxy<6?"Algae are still eating the oxygen — cut the runoff or catch it with trees.":"Oxygen is fine but there were not enough fish to start.")+" Adjust and run again.","warn");
    }
  },420);
  LAB.timers.push(iv);
}

/* ---------- 5. Bridge Builder ---------- */
function labBridge(area){
  LAB.supports=[];
  area.innerHTML='<p class="muted center">Tap the bridge deck to place a support (3 max). Then send the bus.</p><div id="bridgeStage"></div><div class="btn-row" style="justify-content:center;margin-top:8px"><button class="btn" onclick="bridgeGo()">🚌 Send the bus</button><button class="btn secondary" onclick="LAB.supports=[];bridgeDraw();">Clear supports</button></div>';
  const c=labCanvas(600,240);$("bridgeStage").appendChild(c);LAB.c=c;
  c.addEventListener("click",ev=>{if(LAB.busX!=null)return;const r=c.getBoundingClientRect();const x=(ev.clientX-r.left)*(c.width/r.width);if(x<60||x>540)return;if(LAB.supports.length>=3){labFeedback("Only 3 supports — tap Clear to start over.","warn");return;}LAB.supports.push(Math.round(x));LAB.supports.sort((a,b)=>a-b);sfx("tick");bridgeDraw();});
  bridgeDraw();
}
function bridgeSpans(){const pts=[50].concat(LAB.supports,[550]);const out=[];for(let i=0;i<pts.length-1;i++)out.push([pts[i],pts[i+1]]);return out;}
function bridgeDraw(busX,broken){
  const c=LAB.c,x=c.getContext("2d");x.clearRect(0,0,c.width,c.height);
  x.fillStyle="#2a5fa8";x.fillRect(50,150,500,90);x.fillStyle="#5a7d3a";x.fillRect(0,120,50,120);x.fillRect(550,120,50,120);
  const LIMIT=190;
  bridgeSpans().forEach(([a,b])=>{
    const L=b-a,sag=Math.min(40,(L/LIMIT)*(L/LIMIT)*14);
    const bad=broken&&L>LIMIT;
    x.strokeStyle=bad?"#e0512f":(L>LIMIT?"#f5a623":"#c9a84c");x.lineWidth=8;x.beginPath();x.moveTo(a,120);x.quadraticCurveTo((a+b)/2,120+sag*2,b,120);x.stroke();
    if(bad){x.fillStyle="#ffd166";x.font="15px system-ui";x.fillText("⚡ too long: "+L+" px",(a+b)/2-45,120+sag+34);}
  });
  LAB.supports.forEach(s=>{x.fillStyle="#8d6e63";x.fillRect(s-6,120,12,120);});
  x.fillStyle="#9fd0ff";x.font="15px system-ui";x.fillText("supports: "+LAB.supports.length+"/3 · spans longer than "+LIMIT+" px turn orange (risky)",16,22);
  if(busX!=null){x.font="30px system-ui";x.fillText("🚌",busX-15,112);}
}
function bridgeGo(){
  if(LAB.raf)cancelAnimationFrame(LAB.raf);
  const LIMIT=190;const bad=bridgeSpans().find(([a,b])=>b-a>LIMIT);
  let bx=20;const start=performance.now();
  const step=now=>{
    bx=20+(now-start)/2200*560;
    LAB.busX=bx;
    if(bad&&bx>=(bad[0]+bad[1])/2){LAB.busX=null;bridgeDraw((bad[0]+bad[1])/2,true);
      const c=LAB.c,x=c.getContext("2d");x.font="30px system-ui";x.fillText("💥",(bad[0]+bad[1])/2-15,160);
      sfx("wrong");labFeedback("Crack! The span from "+bad[0]+" to "+bad[1]+" is "+(bad[1]-bad[0])+" px — longer than the "+LIMIT+" px this deck can hold under a bus. Add a support inside the red span and try again.","warn");return;}
    bridgeDraw(bx,false);
    if(bx<580)LAB.raf=requestAnimationFrame(step);
    else{LAB.busX=null;labGoalMet("The bus made it across with "+LAB.supports.length+" support"+(LAB.supports.length===1?"":"s")+"!");}
  };
  LAB.raf=requestAnimationFrame(step);
}

/* ---------- 6. See Your Sound (microphone) ---------- */
function labSound(area){
  area.innerHTML='<div id="soundStage"></div><div class="lab-log" id="soundLog"><span class="pill">🔊 loud: <b id="sLoud">not yet</b></span> <span class="pill">🎵 high: <b id="sHigh">not yet</b></span></div>'
   +'<div class="btn-row" style="justify-content:center;margin-top:8px"><button class="btn" id="micBtn" onclick="soundStart()">🎤 Turn on the microphone</button></div>'
   +'<p class="muted center" style="font-size:14px">No microphone? <button class="readbtn" onclick="soundSim(0.2,200)">quiet + low</button> <button class="readbtn" onclick="soundSim(0.9,200)">loud + low</button> <button class="readbtn" onclick="soundSim(0.9,900)">loud + high</button></p>';
  const c=labCanvas(600,220);$("soundStage").appendChild(c);LAB.c=c;LAB.cleanup=()=>{if(LAB.stream)LAB.stream.getTracks().forEach(t=>t.stop());if(LAB.actx)LAB.actx.close().catch(()=>{});};
  soundDraw(new Float32Array(600).fill(0),0,0);
}
function soundDraw(buf,amp,freq){
  const c=LAB.c,x=c.getContext("2d");x.clearRect(0,0,c.width,c.height);
  x.strokeStyle="rgba(159,208,255,.35)";x.lineWidth=1;x.beginPath();x.moveTo(0,110);x.lineTo(600,110);x.stroke();
  x.strokeStyle="rgba(255,209,102,.5)";x.setLineDash([6,6]);x.beginPath();x.moveTo(0,55);x.lineTo(600,55);x.moveTo(0,165);x.lineTo(600,165);x.stroke();x.setLineDash([]);
  x.strokeStyle=amp>0.5?"#ffd166":"#6fd0ff";x.lineWidth=3;x.beginPath();
  for(let i=0;i<600;i++){const v=buf[Math.floor(i*buf.length/600)]||0;const y=110-v*100;i?x.lineTo(i,y):x.moveTo(i,y);}x.stroke();
  x.fillStyle="#edf7ff";x.font="15px system-ui";x.fillText("amplitude (loudness): "+(amp*100).toFixed(0)+"%   ·   pitch ≈ "+Math.round(freq)+" Hz",16,22);
  x.fillText("reach the dashed lines = LOUD",400,50);
}
function soundCheck(amp,freq){
  if(amp>0.5&&!LAB.flags.loud){LAB.flags.loud=true;$("sLoud").textContent="✓";sfx("tick");}
  if(freq>600&&amp>0.15&&!LAB.flags.high){LAB.flags.high=true;$("sHigh").textContent="✓";sfx("tick");}
  if(LAB.flags.loud&&LAB.flags.high)labGoalMet("You made a tall wave AND a squeezed wave — amplitude and wavelength!");
}
async function soundStart(){
  try{
    const stream=await navigator.mediaDevices.getUserMedia({audio:true});LAB.stream=stream;
    const actx=new (window.AudioContext||window.webkitAudioContext)();LAB.actx=actx;
    const src=actx.createMediaStreamSource(stream),an=actx.createAnalyser();an.fftSize=2048;src.connect(an);
    const buf=new Float32Array(an.fftSize);$("micBtn").textContent="🎤 Listening… clap, sing, whistle!";
    const loop=()=>{
      an.getFloatTimeDomainData(buf);
      let amp=0,zc=0;for(let i=1;i<buf.length;i++){amp=Math.max(amp,Math.abs(buf[i]));if((buf[i-1]<0&&buf[i]>=0))zc++;}
      const freq=zc*actx.sampleRate/buf.length;
      soundDraw(buf,amp,amp>0.05?freq:0);soundCheck(amp,amp>0.05?freq:0);
      LAB.raf=requestAnimationFrame(loop);
    };loop();
  }catch(e){labFeedback("I could not reach the microphone ("+(e.name||"blocked")+"). Use the simulate buttons below instead — the science is the same.","warn");}
}
function soundSim(amp,freq){
  if(LAB.raf)cancelAnimationFrame(LAB.raf);
  const buf=new Float32Array(600);const start=performance.now();
  const loop=now=>{const t=(now-start)/1000;for(let i=0;i<600;i++)buf[i]=amp*Math.sin((i/600)*freq/40*Math.PI*2+t*8);soundDraw(buf,amp,freq);soundCheck(amp,freq);LAB.raf=requestAnimationFrame(loop);};
  LAB.raf=requestAnimationFrame(loop);
}

/* ---------- 7. Balance the Ball (tilt sensor) ---------- */
function labTilt(area){
  area.innerHTML='<div id="tiltStage"></div><div class="btn-row" style="justify-content:center;margin-top:8px"><button class="btn" id="tiltBtn" onclick="tiltStart()">📱 Use my device\'s tilt sensor</button></div>'
   +'<div class="tilt-pad"><button class="btn secondary" onclick="tiltPush(0,-1)">▲</button><div><button class="btn secondary" onclick="tiltPush(-1,0)">◀</button><button class="btn secondary" onclick="tiltPush(1,0)">▶</button></div><button class="btn secondary" onclick="tiltPush(0,1)">▼</button></div>';
  const c=labCanvas(600,300);$("tiltStage").appendChild(c);LAB.c=c;
  LAB.b={x:120,y:90,vx:0,vy:0,ax:0,ay:0,held:0,last:performance.now()};
  LAB.cleanup=()=>{if(LAB.onOri)window.removeEventListener("deviceorientation",LAB.onOri);};
  const loop=now=>{
    const b=LAB.b,dt=Math.min(0.05,(now-b.last)/1000);b.last=now;
    b.vx=(b.vx+b.ax*300*dt)*0.985;b.vy=(b.vy+b.ay*300*dt)*0.985;
    b.x+=b.vx*dt;b.y+=b.vy*dt;
    if(b.x<20){b.x=20;b.vx*=-0.5}if(b.x>580){b.x=580;b.vx*=-0.5}if(b.y<20){b.y=20;b.vy*=-0.5}if(b.y>280){b.y=280;b.vy*=-0.5}
    const inside=Math.hypot(b.x-300,b.y-150)<40;
    b.held=inside?b.held+dt:0;
    tiltDraw(inside);
    if(b.held>=3)labGoalMet("Three seconds of balance — every push and pull cancelled out.");
    if(!LAB.goalMet)LAB.raf=requestAnimationFrame(loop);
  };
  LAB.raf=requestAnimationFrame(loop);
}
function tiltDraw(inside){
  const c=LAB.c,x=c.getContext("2d"),b=LAB.b;x.clearRect(0,0,c.width,c.height);
  x.strokeStyle=inside?"#3bb273":"rgba(255,209,102,.7)";x.lineWidth=4;x.beginPath();x.arc(300,150,40,0,7);x.stroke();
  x.fillStyle="#f5a623";x.beginPath();x.arc(b.x,b.y,16,0,7);x.fill();
  x.fillStyle="#edf7ff";x.font="15px system-ui";x.fillText("tilt: x "+b.ax.toFixed(2)+"  y "+b.ay.toFixed(2)+"   ·   balanced for "+b.held.toFixed(1)+" s / 3",16,22);
}
function tiltPush(dx,dy){LAB.b.vx+=dx*120;LAB.b.vy+=dy*120;sfx("tick");}
async function tiltStart(){
  try{
    if(typeof DeviceOrientationEvent!=="undefined"&&typeof DeviceOrientationEvent.requestPermission==="function"){const r=await DeviceOrientationEvent.requestPermission();if(r!=="granted")throw new Error("denied");}
    LAB.onOri=ev=>{if(ev.gamma==null)return;LAB.b.ax=Math.max(-1,Math.min(1,ev.gamma/30));LAB.b.ay=Math.max(-1,Math.min(1,(ev.beta-40)/30));};
    window.addEventListener("deviceorientation",LAB.onOri);
    $("tiltBtn").textContent="📱 Tilt your device to roll the ball";
    setTimeout(()=>{if(LAB&&LAB.b&&LAB.b.ax===0&&LAB.b.ay===0)labFeedback("No tilt data is arriving — this device may not have a sensor. The arrow buttons work the same way.","info");},2500);
  }catch(e){labFeedback("The tilt sensor is not available here. Use the arrow buttons — each tap is a push (an unbalanced force).","info");}
}

/* ---------- 8. Zoom the Universe ---------- */
const ZOOMS=[
 {e:"🌌",n:"The Solar System",s:"about 10,000,000,000 km across",t:"Eight planets circle the Sun. Earth is the third one out."},
 {e:"🌍",n:"Earth",s:"12,700 km wide",t:"A rocky planet wrapped in air and mostly covered by ocean."},
 {e:"🗺️",n:"Maryland",s:"about 400 km across",t:"Home of the Chesapeake Bay, the biggest estuary in the United States."},
 {e:"🏀",n:"A basketball",s:"24 cm wide",t:"Made of rubber and leather — matter you can hold."},
 {e:"🧫",n:"A skin cell",s:"0.03 mm — 30 micrometres",t:"Your body is built from trillions of cells. You need a microscope to see one."},
 {e:"🧬",n:"DNA",s:"2 nanometres wide",t:"A twisted ladder inside every cell carrying the instructions for life."},
 {e:"⚛️",n:"An atom",s:"0.1 nanometres — 1,000,000× smaller than a hair is wide",t:"Everything is made of atoms: a tiny nucleus with electrons whizzing around it."}
];
function labZoom(area){
  LAB.z=0;LAB.seen=new Set([0]);
  area.innerHTML='<div class="zoom-stage" id="zoomStage"></div><input type="range" id="zoomR" min="0" max="'+(ZOOMS.length-1)+'" value="0" oninput="zoomTo(+this.value)" style="width:100%"><div class="btn-row" style="justify-content:center;margin-top:8px"><button class="btn secondary" onclick="zoomTo(LAB.z-1)">⟵ Zoom out</button><button class="btn" onclick="zoomTo(LAB.z+1)">Zoom in ⟶</button></div>';
  zoomTo(0);
}
function zoomTo(i){
  i=Math.max(0,Math.min(ZOOMS.length-1,i));LAB.z=i;LAB.seen.add(i);$("zoomR").value=i;
  const z=ZOOMS[i];
  $("zoomStage").innerHTML='<div class="zoom-emoji">'+z.e+'</div><h2>'+esc(z.n)+'</h2><p class="muted">'+esc(z.s)+'</p><p style="font-size:18px;max-width:480px;margin:6px auto">'+esc(z.t)+'</p><p class="muted" style="font-size:13px">scale '+(i+1)+' of '+ZOOMS.length+' · seen '+LAB.seen.size+'</p>';
  sfx("tick");
  if(LAB.seen.size===ZOOMS.length)labGoalMet("From the Solar System to a single atom — you zoomed through every scale!");
}
