/* ============================================================
   ACCRA SPEEDWAY — kart racing, open to play any time
   A pseudo-3D road racer (curves, rival karts, coins, boosts,
   banana hazards, 3 laps). Auto-accelerates so young players only
   steer. Keyboard: ← → (A/D), ↓ brake, Esc quit. Touch: hold the
   left/right half of the track or the on-screen buttons.
   Placement earns XP for the logged-in learner; works without one.
   ============================================================ */
"use strict";
let RC=null;
const RACE_RIVALS=[{n:"Kofi",c:"#e0512f",e:"🐘"},{n:"Ama",c:"#7c5cf0",e:"🐆"},{n:"Esi",c:"#3bb273",e:"🦓"},{n:"Kwame",c:"#4aa3e0",e:"🐊"}];
const RACE_TRACKS=[
 {id:"accra",name:"Accra Speedway",laps:3,sky:["#4aa3e0","#bfe3ff"],grass:["#3f9a4a","#368a40"],road:["#5a5f6b","#565b66"],curves:[[40,0],[60,2],[40,0],[50,-3],[30,0],[70,4],[40,0],[60,-2],[50,0],[60,3],[40,0]]},
 {id:"kumasi",name:"Kumasi Hills",laps:3,sky:["#ff9a5a","#ffd9a8"],grass:["#7a9a3a","#6a8a30"],road:["#6b5f52","#665a4e"],curves:[[30,0],[50,-4],[30,1],[60,4],[40,-1],[50,-4],[30,0],[70,3],[40,-3],[50,0]]},
 {id:"cape",name:"Cape Coast Shore",laps:2,sky:["#1b2a6b","#7fb4ff"],grass:["#d9c48a","#c9b47a"],road:["#4a5566","#465162"],curves:[[50,0],[40,3],[40,-3],[40,3],[40,-3],[60,0],[50,5],[40,0],[60,-5],[50,0]]}
];
function raceStop(){
  if(!RC)return;
  if(RC.raf)cancelAnimationFrame(RC.raf);
  window.removeEventListener("keydown",RC.kd);window.removeEventListener("keyup",RC.ku);
  RC=null;
}
function renderRace(){
  clearTimers();closeOverlay();defocus();showAnanseCorner(false);raceStop();
  document.body.classList.add("learningworld");
  const best=P&&P.race?P.race:{};
  const tracks=RACE_TRACKS.map(t=>'<button class="kh-tile" style="--c:'+t.sky[0]+'" onclick="startRace(\''+t.id+'\')"><span class="kh-tic">🏁</span><span class="kh-tnm">'+esc(t.name)+'</span><span class="kh-tsub">'+t.laps+' laps'+(best[t.id]?' · best '+raceFmt(best[t.id].time)+' · '+raceOrdinal(best[t.id].place):' · not raced yet')+'</span></button>').join("");
  app.innerHTML='<div class="fadein" style="max-width:720px;margin:0 auto">'
   +'<div class="center"><div class="ananse-wrap">'+ananseSVG(100,"party")+'</div><h1 style="color:#fff">🏎️ Accra Speedway</h1>'
   +'<div class="speech" style="max-width:520px;margin:10px auto">Race Ananse\'s kart against Kofi, Ama, Esi and Kwame! Grab ⭐ coins, hit 🍄 boosts, dodge 🍌 bananas. The kart drives itself — you just steer.</div></div>'
   +'<h2 style="color:#fff;font-size:18px;margin:14px 0 8px">Pick a track</h2><div class="kh-tiles">'+tracks+'</div>'
   +'<div class="card" style="margin-top:14px"><b>How to play</b><p class="muted" style="margin-top:6px">Keyboard: ← → to steer (or A / D), ↓ to brake, Esc to quit. Touch: hold the left or right side of the road, or use the buttons under the track. Finish 1st for 30 XP, 2nd 20, 3rd 10.</p></div>'
   +'<div class="btn-row" style="margin-top:14px"><button class="btn" onclick="'+(P?'renderHome()':'renderProfiles()')+'">⟵ Back</button></div><div class="spacer"></div></div>';
  say("Welcome to Accra Speedway! Pick a track and let's race.");
}
function raceFmt(ms){const s=Math.floor(ms/1000),m=Math.floor(s/60);return m+":"+String(s%60).padStart(2,"0")+"."+String(Math.floor((ms%1000)/100));}
function raceOrdinal(n){return n+(["th","st","nd","rd"][(n%100>10&&n%100<14)?0:(n%10<4?n%10:0)]);}
function startRace(tid){
  raceStop();clearTimers();closeOverlay();showAnanseCorner(false);
  const T=RACE_TRACKS.find(t=>t.id===tid)||RACE_TRACKS[0];
  app.innerHTML='<div class="fadein race-wrap">'
   +'<div class="race-hud"><span class="pill" id="rcPos">—</span><span class="pill" id="rcLap">Lap 1/'+T.laps+'</span><span class="pill" id="rcTime">0:00.0</span><span class="pill" id="rcCoins">⭐ 0</span></div>'
   +'<canvas id="rcCanvas" width="640" height="400"></canvas>'
   +'<div class="race-ctl"><button class="race-btn" id="rcL">◀</button><button class="race-btn" id="rcB">🛑</button><button class="race-btn" id="rcR">▶</button></div>'
   +'<div class="center" style="margin-top:8px"><button class="readbtn" onclick="renderRace()">⟵ Quit race</button></div></div>';
  const c=$("rcCanvas"),x=c.getContext("2d");
  // ---- build the track ----
  const SEG=200,RW=2200,LANES=3;const segs=[];
  T.curves.forEach(([n,curve])=>{for(let i=0;i<n;i++){const t=i/n;const ease=curve*(t<0.25?t*4:(t>0.75?(1-t)*4:1));segs.push({curve:ease,sprites:[],cars:[]});}});
  const N=segs.length,LEN=N*SEG;
  const rnd2=n=>Math.floor(Math.random()*n);
  // roadside sprites
  for(let i=0;i<N;i+=3){const side=i%6<3?-1:1;const s=["🌴","🌳","🌵","🏠","🥥","🌴","🥁"][rnd2(7)];segs[i].sprites.push({e:s,off:side*(1.6+Math.random()*0.8),size:1});if(i%30===0)segs[i].sprites.push({e:"🇬🇭",off:-side*1.5,size:.8});}
  // items
  const items=[];for(let i=20;i<N;i+=7){const kind=Math.random();const it={z:i*SEG+rnd2(SEG),x:(rnd2(LANES)-1)*0.6,e:kind<0.55?"⭐":(kind<0.8?"🍄":"🍌"),alive:true};items.push(it);}
  const cars=RACE_RIVALS.map((r,i)=>({name:r.n,e:r.e,c:r.c,z:(i+1)*SEG*3,x:(i%2?0.45:-0.45),speed:0,max:11800+i*450+rnd2(500),lap:0,total:0,ai:true,wobble:Math.random()*6}));
  RC={T,segs,N,LEN,SEG,RW,items,cars,player:{z:0,x:0,speed:0,max:13000,lap:0,total:0,spin:0,boost:0,coins:0},keys:{},t0:performance.now(),time:0,done:false,raf:null,cam:{h:1000,depth:1/Math.tan((80/2)*Math.PI/180)},last:performance.now(),touchDir:0,brake:false};
  RC.kd=e=>{if(!RC)return;if(e.key==="Escape"){renderRace();return;}RC.keys[e.key.toLowerCase()]=true;if(["arrowleft","arrowright","arrowdown","arrowup"," "].includes(e.key.toLowerCase()))e.preventDefault();};
  RC.ku=e=>{if(!RC)return;RC.keys[e.key.toLowerCase()]=false;};
  window.addEventListener("keydown",RC.kd);window.addEventListener("keyup",RC.ku);
  const hold=(id,dir)=>{const b=$(id);const on=ev=>{ev.preventDefault();if(dir==="b")RC.brake=true;else RC.touchDir=dir;};const off=ev=>{ev.preventDefault();if(dir==="b")RC.brake=false;else if(RC.touchDir===dir)RC.touchDir=0;};["pointerdown","touchstart"].forEach(t=>b.addEventListener(t,on,{passive:false}));["pointerup","pointerleave","pointercancel","touchend"].forEach(t=>b.addEventListener(t,off));};
  hold("rcL",-1);hold("rcR",1);hold("rcB","b");
  c.addEventListener("pointerdown",ev=>{const r=c.getBoundingClientRect();RC.touchDir=(ev.clientX-r.left)<r.width/2?-1:1;});
  ["pointerup","pointerleave","pointercancel"].forEach(t=>c.addEventListener(t,()=>{if(RC)RC.touchDir=0;}));
  say("Three, two, one, go!");
  RC.countdown=3.2;
  RC.raf=requestAnimationFrame(raceFrame);
}
function raceFrame(now){
  if(!RC)return;
  const dt=Math.min(0.05,(now-RC.last)/1000);RC.last=now;
  if(RC.countdown>0){RC.countdown-=dt;raceDraw();RC.raf=requestAnimationFrame(raceFrame);return;}
  if(!RC.done)RC.time=now-RC.t0-3200;
  raceUpdate(dt);raceDraw();
  RC.raf=requestAnimationFrame(raceFrame);
}
function raceUpdate(dt){
  const p=RC.player,k=RC.keys;
  const left=k["arrowleft"]||k["a"]||RC.touchDir<0,right=k["arrowright"]||k["d"]||RC.touchDir>0,brake=k["arrowdown"]||k["s"]||RC.brake;
  const seg=RC.segs[Math.floor(p.z/RC.SEG)%RC.N];
  // speed: auto-accelerate
  const maxNow=p.max*(p.boost>0?1.35:1)*(p.spin>0?0.35:1)*(Math.abs(p.x)>1?0.55:1);
  if(brake)p.speed=Math.max(0,p.speed-16000*dt);else p.speed+=(maxNow-p.speed)*Math.min(1,dt*1.4);
  if(Math.abs(p.x)>1)p.speed=Math.min(p.speed,maxNow);
  const spd=p.speed/p.max;
  if(p.spin>0){p.spin-=dt;p.x+=Math.sin(p.spin*20)*dt*0.5;}
  else{if(left)p.x-=dt*2.2*Math.max(.4,spd);if(right)p.x+=dt*2.2*Math.max(.4,spd);}
  p.x-=seg.curve*spd*dt*0.9;                 // centrifugal drift on curves
  p.x=Math.max(-1.6,Math.min(1.6,p.x));
  if(p.boost>0)p.boost-=dt;
  const dz=p.speed*dt;p.z+=dz;p.total+=dz;
  if(p.z>=RC.LEN){p.z-=RC.LEN;p.lap++;if(p.lap>=RC.T.laps&&!RC.done)raceFinish();else{sfx("tick");say("Lap "+(p.lap+1)+"!");}}
  // items
  RC.items.forEach(it=>{if(!it.alive)return;const d=(it.z-p.z+RC.LEN)%RC.LEN;if(d<RC.SEG*0.6&&Math.abs(it.x-p.x)<0.35){it.alive=false;if(it.e==="⭐"){p.coins++;sfx("correct");}else if(it.e==="🍄"){p.boost=2.2;sfx("levelup");}else{p.spin=1.1;sfx("wrong");}setTimeout(()=>{it.alive=true;},9000);}});
  // rivals
  RC.cars.forEach(car=>{
    car.speed+=(car.max-car.speed)*Math.min(1,dt*1.2);
    car.wobble+=dt;const target=Math.sin(car.wobble*0.6)*0.55;car.x+=(target-car.x)*dt*1.2;
    // avoid the player's lane when close behind
    const gap=(p.z-car.z+RC.LEN)%RC.LEN;if(gap<RC.SEG*3&&gap>0&&Math.abs(car.x-p.x)<0.3)car.x+=(car.x<p.x?-1:1)*dt*1.5;
    const cz=car.speed*dt;car.z+=cz;car.total+=cz;if(car.z>=RC.LEN){car.z-=RC.LEN;car.lap++;}
    // collision with player
    const d=(car.z-p.z+RC.LEN)%RC.LEN;
    if(d<RC.SEG*0.7&&Math.abs(car.x-p.x)<0.4&&p.speed>car.speed){p.speed=car.speed*0.85;p.x+=(p.x<car.x?-1:1)*0.25;sfx("tick");}
  });
  // standings
  const all=[{name:"You",total:p.total}].concat(RC.cars.map(c=>({name:c.name,total:c.total}))).sort((a,b)=>b.total-a.total);
  RC.place=all.findIndex(a=>a.name==="You")+1;
  const el=(id,v)=>{const e=$(id);if(e)e.textContent=v;};
  el("rcPos",raceOrdinal(RC.place)+" of 5");el("rcLap","Lap "+Math.min(RC.T.laps,p.lap+1)+"/"+RC.T.laps);el("rcTime",raceFmt(Math.max(0,RC.time)));el("rcCoins","⭐ "+p.coins);
}
function raceProject(px,py,pz,camX,camY,camZ,W,H){
  const dz=pz-camZ;const scale=RC.cam.depth/Math.max(1,dz);
  return{x:Math.round(W/2+scale*(px-camX)*W/2),y:Math.round(H/2-scale*(py-camY)*H/2),w:Math.round(scale*RC.RW*W/2),scale};
}
function raceDraw(){
  const c=$("rcCanvas");if(!c)return;const x=c.getContext("2d"),W=c.width,H=c.height,p=RC.player,T=RC.T;
  // sky
  const g=x.createLinearGradient(0,0,0,H/2);g.addColorStop(0,T.sky[0]);g.addColorStop(1,T.sky[1]);x.fillStyle=g;x.fillRect(0,0,W,H/2);
  x.font="28px system-ui";x.fillText("☀️",W-70,50);x.font="22px system-ui";x.fillStyle="rgba(255,255,255,.8)";x.fillText("☁️",60+((p.z/50)%W),70);x.fillText("☁️",(320+(p.z/70))%W,40);
  const baseIdx=Math.floor(p.z/RC.SEG);const basePct=(p.z%RC.SEG)/RC.SEG;
  const camX=p.x*RC.RW,camY=RC.cam.h,camZ=p.z;
  let maxY=H,dx=-(RC.segs[baseIdx%RC.N].curve*basePct),xoff=0;
  const sprites=[];
  for(let n=0;n<110;n++){
    const idx=(baseIdx+n)%RC.N,seg=RC.segs[idx];
    const z1=(baseIdx+n)*RC.SEG,z2=z1+RC.SEG;
    const p1=raceProject(xoff,0,z1,camX,camY,camZ,W,H);
    xoff+=dx;dx+=seg.curve;
    const p2=raceProject(xoff,0,z2,camX,camY,camZ,W,H);
    if(p2.y<maxY&&p1.y>p2.y){
      const dark=Math.floor((baseIdx+n)/3)%2;
      x.fillStyle=T.grass[dark];x.fillRect(0,p2.y,W,p1.y-p2.y);
      const rumble=w=>w*1.15;
      x.fillStyle=dark?"#fff":"#e0512f";racePoly(x,p1.x-rumble(p1.w),p1.y,p1.x+rumble(p1.w),p1.y,p2.x+rumble(p2.w),p2.y,p2.x-rumble(p2.w),p2.y);
      x.fillStyle=T.road[dark];racePoly(x,p1.x-p1.w,p1.y,p1.x+p1.w,p1.y,p2.x+p2.w,p2.y,p2.x-p2.w,p2.y);
      if(dark){x.fillStyle="rgba(255,255,255,.7)";for(let l=1;l<3;l++){const lw1=p1.w*0.02,lw2=p2.w*0.02;const lx1=p1.x-p1.w+p1.w*2*l/3,lx2=p2.x-p2.w+p2.w*2*l/3;racePoly(x,lx1-lw1,p1.y,lx1+lw1,p1.y,lx2+lw2,p2.y,lx2-lw2,p2.y);}}
      if(idx===0){x.fillStyle="#fff";racePoly(x,p1.x-p1.w,p1.y,p1.x+p1.w,p1.y,p2.x+p2.w,p2.y,p2.x-p2.w,p2.y);x.fillStyle="#111";for(let k=0;k<8;k++)if(k%2)x.fillRect(p1.x-p1.w+(p1.w*2)*k/8,p2.y,(p1.w*2)/8,Math.max(1,p1.y-p2.y));}
      maxY=p2.y;
    }
    seg.sprites.forEach(s=>sprites.push({e:s.e,x:p1.x+p1.w*s.off,y:p1.y,s:p1.scale*RC.RW*W/2*0.5*s.size,d:n}));
    RC.items.forEach(it=>{if(it.alive&&Math.floor(it.z/RC.SEG)===idx){sprites.push({e:it.e,x:p1.x+p1.w*it.x,y:p1.y,s:p1.scale*RC.RW*W/2*0.35,d:n});}});
    RC.cars.forEach(car=>{if(Math.floor(car.z/RC.SEG)===idx){sprites.push({car,x:p1.x+p1.w*car.x,y:p1.y,s:p1.scale*RC.RW*W/2*0.5,d:n});}});
  }
  sprites.sort((a,b)=>b.d-a.d).forEach(s=>{
    const size=Math.max(6,Math.min(140,s.s));
    if(s.car){raceKart(x,s.x,s.y,size,s.car.c,s.car.e);}
    else{x.font=size+"px system-ui";x.textAlign="center";x.fillText(s.e,s.x,s.y);x.textAlign="left";}
  });
  // player kart
  raceKart(x,W/2+(p.spin>0?Math.sin(p.spin*30)*10:0),H-18,110,"#f5a623","🦁",p.boost>0);
  if(p.spin>0){x.font="40px system-ui";x.fillText("💫",W/2-20,H-140);}
  // overlays
  if(RC.countdown>0){x.fillStyle="rgba(0,0,0,.35)";x.fillRect(0,0,W,H);x.fillStyle="#ffd166";x.font="900 90px system-ui";x.textAlign="center";const n=Math.ceil(RC.countdown-0.2);x.fillText(n>0?String(n):"GO!",W/2,H/2+30);x.textAlign="left";}
  if(RC.done){x.fillStyle="rgba(0,0,0,.45)";x.fillRect(0,0,W,H);x.fillStyle="#fff";x.font="900 44px system-ui";x.textAlign="center";x.fillText("🏁 "+raceOrdinal(RC.place)+" place!",W/2,H/2-10);x.font="700 22px system-ui";x.fillText(raceFmt(RC.time)+" · ⭐ "+p.coins+(RC.xp?" · +"+RC.xp+" XP":""),W/2,H/2+30);x.textAlign="left";}
}
function racePoly(x,x1,y1,x2,y2,x3,y3,x4,y4){x.beginPath();x.moveTo(x1,y1);x.lineTo(x2,y2);x.lineTo(x3,y3);x.lineTo(x4,y4);x.closePath();x.fill();}
function raceKart(x,cx,by,size,color,driver,flame){
  const w=size,h=size*0.55;
  x.save();x.translate(cx,by);
  if(flame){x.font=(size*0.4)+"px system-ui";x.textAlign="center";x.fillText("🔥",0,h*0.35);}
  x.fillStyle="#111";x.beginPath();x.roundRect(-w/2,-h*0.35,w*0.22,h*0.45,4);x.fill();x.beginPath();x.roundRect(w/2-w*0.22,-h*0.35,w*0.22,h*0.45,4);x.fill();
  x.fillStyle=color;x.beginPath();x.roundRect(-w*0.4,-h*0.75,w*0.8,h*0.6,Math.max(4,size*0.08));x.fill();
  x.fillStyle="rgba(255,255,255,.25)";x.fillRect(-w*0.3,-h*0.7,w*0.6,h*0.12);
  x.font=(size*0.42)+"px system-ui";x.textAlign="center";x.fillText(driver,0,-h*0.62);x.textAlign="left";
  x.restore();
}
function raceFinish(){
  RC.done=true;RC.player.speed*=0.5;
  const place=RC.place;const xp=[0,30,20,10,5,5][place]||5;RC.xp=P?xp:0;
  sfx(place===1?"levelup":"correct");if(place===1)confetti();
  say(place===1?"You win! Champion of "+RC.T.name+"!":"You finished "+raceOrdinal(place)+". Great driving!");
  if(P){
    P.xp+=xp;P.race=P.race||{};const prev=P.race[RC.T.id];
    if(!prev||RC.time<prev.time||place<prev.place)P.race[RC.T.id]={time:prev&&prev.time<RC.time?prev.time:RC.time,place:Math.min(place,prev?prev.place:9),date:today()};
    if(place===1&&!P.trophies.some(t=>t.type==="race")&&typeof awardTrophy==="function")awardTrophy({type:"race",icon:"🏎️",label:"Speedway Champion",color:"#ffd166",detail:"Won a race on "+RC.T.name+"."});
    save();
  }
  setTimeout(()=>{if(!RC)return;const wrap=document.querySelector(".race-wrap");if(wrap)wrap.insertAdjacentHTML("beforeend",'<div class="center fadein" style="margin-top:10px"><div class="btn-row"><button class="btn big" onclick="startRace(\''+RC.T.id+'\')">Race again 🔁</button><button class="btn secondary big" onclick="renderRace()">Tracks 🏁</button><button class="btn secondary big" onclick="'+(P?'renderHome()':'renderProfiles()')+'">Home 🏠</button></div></div>');},1200);
}
