/* ============================================================
   GRAND FABLE GP — true 3D kart racing (Three.js), open any time
   Bright stadium circuits seen from behind the kart: asphalt with a
   yellow centre line, red/white rumble strips, a start arch with a
   title banner and checkered flags, grandstands full of spectators,
   cones, palms, clouds and balloons. Choose-your-racer screen with
   five original racers, three circuits, item boxes (rocket, homing
   orb, shield, banana), rivals that fight back, lap/timer HUD, live
   leaderboard, minimap, podium. Falls back to the 2D racer when
   WebGL or the Three.js script is unavailable.
   ============================================================ */
"use strict";
let R3=null;
const GP_RACERS=[
 {id:"ananse",n:"Ananse",e:"🦁",c:0xf5a623,css:"#f5a623",helmet:0xc9a84c,speed:4,handle:4,accel:4,bio:"The Wise Lion. Balanced, clever, never gives up."},
 {id:"kofi",n:"Kofi",e:"🐘",c:0xff4d6d,css:"#ff4d6d",helmet:0x8b1e3f,speed:5,handle:2,accel:2,bio:"Big engine, big heart. Slow to turn, fast on straights."},
 {id:"ama",n:"Ama",e:"🐆",c:0xb06bff,css:"#b06bff",helmet:0x5b2a9e,speed:5,handle:3,accel:4,bio:"Quick as a leopard. Top speed to burn."},
 {id:"esi",n:"Esi",e:"🦓",c:0x39e6a0,css:"#39e6a0",helmet:0x1b8f5e,speed:3,handle:5,accel:4,bio:"Hugs every corner. Best handling on the grid."},
 {id:"kwame",n:"Kwame",e:"🐊",c:0x4dd2ff,css:"#4dd2ff",helmet:0x1a6fa0,speed:4,handle:3,accel:5,bio:"Snappy starts. Launches off the line like a rocket."}
];
const GP_CIRCUITS=[
 {id:"palm",name:"Palm Cove Circuit",laps:3,tree:"palm",grass:0x58b85a,sky:0x8fd3ff,pts:[[0,0],[70,-8],[125,25],[135,85],[95,125],[30,118],[-35,140],[-95,105],[-115,45],[-70,-5]]},
 {id:"stadium",name:"Accra Stadium Loop",laps:3,tree:"round",grass:0x4faf52,sky:0x7cc4ff,pts:[[0,0],[90,0],[130,40],[110,95],[40,110],[-10,80],[-60,110],[-120,80],[-125,25],[-70,-10]]},
 {id:"hills",name:"Kumasi Hillside",laps:2,tree:"round",grass:0x6cae4a,sky:0xa9dcff,pts:[[0,0],[60,-20],[120,10],[140,70],[100,110],[60,80],[10,120],[-60,130],[-120,90],[-110,30],[-50,-15]]}
];
const GP_ITEMS={rocket:{e:"🚀",n:"Rocket boost"},orb:{e:"🌀",n:"Homing orb"},shield:{e:"🛡️",n:"Shield"},banana:{e:"🍌",n:"Banana"}};
function gpOrd(n){return n+(["th","st","nd","rd"][(n%100>10&&n%100<14)?0:(n%10<4?n%10:0)]);}
function gpFmt(ms){const s=Math.floor(ms/1000),m=Math.floor(s/60);return m+":"+String(s%60).padStart(2,"0")+"."+String(Math.floor((ms%1000)/100));}
function gpStop(){
  if(!R3)return;
  if(R3.raf)cancelAnimationFrame(R3.raf);
  window.removeEventListener("keydown",R3.kd);window.removeEventListener("keyup",R3.ku);window.removeEventListener("resize",R3.onResize);
  try{R3.renderer.dispose();}catch(e){}
  R3=null;
}
/* ---------- entry: racer select → circuit select → race ---------- */
function renderRace(){
  clearTimers();closeOverlay();defocus();showAnanseCorner(false);gpStop();
  if(typeof kdWebgl==="function"&&!kdWebgl()){renderRace2D();return;}
  document.body.classList.add("learningworld");
  const sel=(P&&P.gpRacer)||"ananse";
  const cards=GP_RACERS.map(r=>'<button class="gp-racer'+(r.id===sel?" on":"")+'" style="--c:'+r.css+'" onclick="gpPickRacer(\''+r.id+'\')"><span class="gp-face">'+r.e+'</span><b>'+r.n+'</b>'
    +'<span class="gp-stat"><i>Speed</i><em style="width:'+(r.speed*20)+'%"></em></span><span class="gp-stat"><i>Turning</i><em style="width:'+(r.handle*20)+'%"></em></span><span class="gp-stat"><i>Start</i><em style="width:'+(r.accel*20)+'%"></em></span>'
    +'<small>'+esc(r.bio)+'</small></button>').join("");
  app.innerHTML='<div class="fadein gp-shell" style="max-width:820px;margin:0 auto">'
   +'<div class="gp-banner"><div class="gp-title">GRAND FABLE GP</div><div class="gp-sub">Choose your racer</div></div>'
   +'<div class="gp-grid" id="gpRacers">'+cards+'</div>'
   +'<div class="center" style="margin-top:14px"><button class="btn big" onclick="renderCircuits()">Next: choose a circuit ▶</button></div>'
   +'<div class="btn-row" style="margin-top:12px"><button class="btn secondary" onclick="'+(P?'renderHome()':'renderProfiles()')+'">⟵ Back</button><button class="btn secondary" style="font-size:14px" onclick="renderRace2D()">Classic 2D racer</button></div><div class="spacer"></div></div>';
  say("Grand Fable GP! Choose your racer.");
}
function gpPickRacer(id){if(P){P.gpRacer=id;save();}else window._gpRacer=id;document.querySelectorAll(".gp-racer").forEach(b=>b.classList.toggle("on",b.getAttribute("onclick").indexOf("'"+id+"'")>0));sfx("tick");}
function gpRacer(){const id=(P&&P.gpRacer)||window._gpRacer||"ananse";return GP_RACERS.find(r=>r.id===id)||GP_RACERS[0];}
function renderCircuits(){
  clearTimers();closeOverlay();showAnanseCorner(false);gpStop();
  const best=P&&P.race?P.race:{};
  app.innerHTML='<div class="fadein gp-shell" style="max-width:820px;margin:0 auto">'
   +'<div class="gp-banner"><div class="gp-title">GRAND FABLE GP</div><div class="gp-sub">'+esc(gpRacer().n)+' · choose a circuit</div></div>'
   +'<div class="gp-grid">'+GP_CIRCUITS.map((c,i)=>'<button class="gp-circuit" onclick="startRace3D(\''+c.id+'\')"><canvas id="gpMini'+i+'" width="220" height="150"></canvas><b>'+esc(c.name)+'</b><small>'+c.laps+' laps'+(best[c.id]?' · best '+gpFmt(best[c.id].time)+' · '+gpOrd(best[c.id].place):'')+'</small></button>').join("")+'</div>'
   +'<div class="card gp-card" style="margin-top:14px"><b>Controls</b><p class="muted" style="margin-top:6px">← → steer (A / D) · ↓ brake · Space or ↑ fires your item · Esc quits. Touch: hold the left or right side of the screen, ⚡ fires. 1st = 30 XP, 2nd = 20, 3rd = 10. Win once for the Grand Fable Champion trophy.</p></div>'
   +'<div class="btn-row" style="margin-top:12px"><button class="btn secondary" onclick="renderRace()">⟵ Racers</button></div><div class="spacer"></div></div>';
  GP_CIRCUITS.forEach((c,i)=>gpDrawMini($("gpMini"+i),c,null));
  say("Choose a circuit.");
}
function gpCurveFor(c){return new THREE.CatmullRomCurve3(c.pts.map(p=>new THREE.Vector3(p[0],0,p[1])),true,"centripetal",0.6);}
function gpDrawMini(cv,c,karts){
  if(!cv)return;const x=cv.getContext("2d");x.clearRect(0,0,cv.width,cv.height);
  const xs=c.pts.map(p=>p[0]),zs=c.pts.map(p=>p[1]);const minX=Math.min(...xs)-15,maxX=Math.max(...xs)+15,minZ=Math.min(...zs)-15,maxZ=Math.max(...zs)+15;
  const sx=cv.width/(maxX-minX),sz=cv.height/(maxZ-minZ),s=Math.min(sx,sz);const ox=(cv.width-(maxX-minX)*s)/2,oz=(cv.height-(maxZ-minZ)*s)/2;
  const map=(px,pz)=>[ox+(px-minX)*s,oz+(pz-minZ)*s];
  // smooth loop via Catmull-Rom in 2D (no THREE needed)
  const P0=c.pts,n=P0.length,pts=[];for(let i=0;i<n;i++){const a=P0[(i-1+n)%n],b=P0[i],cc=P0[(i+1)%n],d=P0[(i+2)%n];for(let t=0;t<1;t+=0.1){const t2=t*t,t3=t2*t;pts.push([0.5*((2*b[0])+(-a[0]+cc[0])*t+(2*a[0]-5*b[0]+4*cc[0]-d[0])*t2+(-a[0]+3*b[0]-3*cc[0]+d[0])*t3),0.5*((2*b[1])+(-a[1]+cc[1])*t+(2*a[1]-5*b[1]+4*cc[1]-d[1])*t2+(-a[1]+3*b[1]-3*cc[1]+d[1])*t3)]);}}
  x.fillStyle="rgba(60,160,80,.35)";x.fillRect(0,0,cv.width,cv.height);
  x.lineCap="round";x.lineJoin="round";x.strokeStyle="#2b2f3a";x.lineWidth=9;x.beginPath();pts.forEach((p,i)=>{const m=map(p[0],p[1]);i?x.lineTo(m[0],m[1]):x.moveTo(m[0],m[1]);});x.closePath();x.stroke();
  x.strokeStyle="#ffd166";x.lineWidth=1.5;x.setLineDash([4,4]);x.stroke();x.setLineDash([]);
  const st=map(P0[0][0],P0[0][1]);x.fillStyle="#fff";x.fillRect(st[0]-4,st[1]-4,8,8);x.fillStyle="#111";x.fillRect(st[0]-4,st[1]-4,4,4);x.fillRect(st[0],st[1],4,4);
  if(karts)karts.forEach(k=>{const p=k.pos;const m=map(p.x,p.z);x.fillStyle=k.player?"#fff":k.racer.css;x.beginPath();x.arc(m[0],m[1],k.player?5:4,0,7);x.fill();if(k.player){x.strokeStyle="#111";x.lineWidth=1.5;x.stroke();}});
}
/* ---------- textures drawn on canvases ---------- */
function gpCanvasTex(w,h,draw,repeat){const cv=document.createElement("canvas");cv.width=w;cv.height=h;draw(cv.getContext("2d"),w,h);const t=new THREE.CanvasTexture(cv);if(repeat){t.wrapS=t.wrapT=THREE.RepeatWrapping;}t.anisotropy=4;return t;}
function gpFaceTex(emoji,skin){return gpCanvasTex(128,128,(x,w,h)=>{x.fillStyle=skin||"#ffe0b2";x.beginPath();x.arc(64,64,62,0,7);x.fill();x.font="84px system-ui";x.textAlign="center";x.textBaseline="middle";x.fillText(emoji,64,70);});}
function gpTextTex(text,bg,fg,w,h,size){return gpCanvasTex(w||512,h||128,(x,W,H)=>{x.fillStyle=bg;x.fillRect(0,0,W,H);x.fillStyle="rgba(255,255,255,.12)";for(let i=0;i<W;i+=40)x.fillRect(i,0,20,H);x.fillStyle=fg;x.font="900 "+(size||64)+"px system-ui";x.textAlign="center";x.textBaseline="middle";x.shadowColor="rgba(0,0,0,.5)";x.shadowBlur=8;x.fillText(text,W/2,H/2);});}
/* ---------- the race ---------- */
async function startRace3D(cid){
  clearTimers();closeOverlay();showAnanseCorner(false);gpStop();
  const C=GP_CIRCUITS.find(c=>c.id===cid)||GP_CIRCUITS[0];
  app.innerHTML='<div class="fadein center" style="padding-top:20vh"><div class="ananse-wrap">'+ananseSVG(100,"idle")+'</div><h2 style="color:#fff">Warming up the engines…</h2><p class="muted" style="color:#c9e6ff">Loading the 3D circuit (needs internet the first time).</p></div>';
  try{await loadThree();}catch(e){toast("3D engine could not load — using the classic racer");startRace2D(cid==="palm"?"accra":(cid==="stadium"?"nebula":"skybridge"));return;}
  gpBuild(C);
}
function gpBuild(C){
  const me=gpRacer();
  app.innerHTML='<div class="fadein gp3-wrap" id="gp3">'
   +'<canvas id="gp3c"></canvas>'
   +'<div class="gp3-hud gp3-tl"><div class="gp3-lap" id="gp3Lap">LAP 1/'+C.laps+'</div><div class="gp3-time" id="gp3Time">0:00.0</div></div>'
   +'<div class="gp3-hud gp3-tr" id="gp3Board"></div>'
   +'<div class="gp3-hud gp3-bl"><div class="gp3-item" id="gp3Item">—</div><div class="gp3-speed" id="gp3Speed">0</div></div>'
   +'<canvas class="gp3-map" id="gp3Map" width="150" height="110"></canvas>'
   +'<div class="gp3-msg" id="gp3Msg"></div>'
   +'<div class="gp3-card" id="gp3Card"><b>'+esc(C.name)+'</b><small>'+C.laps+' laps · '+esc(me.n)+'</small></div>'
   +'<div class="gp3-count" id="gp3Count"></div>'
   +'<div class="gp3-touch" id="gp3L"></div><div class="gp3-touch right" id="gp3R"></div>'
   +'</div>'
   +'<div class="race-ctl"><button class="race-btn" id="rcL">◀</button><button class="race-btn" id="rcB">🛑</button><button class="race-btn gp-fire" id="rcF">⚡</button><button class="race-btn" id="rcR">▶</button></div>'
   +'<div class="center" style="margin-top:8px"><button class="readbtn" onclick="renderCircuits()">⟵ Quit race</button></div>';
  const T=THREE,canvas=$("gp3c");
  const renderer=new T.WebGLRenderer({canvas,antialias:true});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  const scene=new T.Scene();scene.background=new T.Color(C.sky);scene.fog=new T.Fog(C.sky,160,420);
  const camera=new T.PerspectiveCamera(62,16/9,0.5,700);
  scene.add(new T.HemisphereLight(0xffffff,0x6a9a4a,0.95));const sun=new T.DirectionalLight(0xffffff,0.85);sun.position.set(120,220,80);scene.add(sun);
  // ground
  const grassTex=gpCanvasTex(256,256,(x,w,h)=>{x.fillStyle="#"+C.grass.toString(16).padStart(6,"0");x.fillRect(0,0,w,h);x.fillStyle="rgba(0,0,0,.06)";for(let i=0;i<220;i++)x.fillRect(Math.random()*w,Math.random()*h,3,3);x.fillStyle="rgba(255,255,255,.05)";x.fillRect(0,0,w,h/2);},true);grassTex.repeat.set(60,60);
  const ground=new T.Mesh(new T.PlaneGeometry(1600,1600),new T.MeshLambertMaterial({map:grassTex}));ground.rotation.x=-Math.PI/2;ground.position.y=-0.02;scene.add(ground);
  // track curve + road ribbon
  const curve=gpCurveFor(C);const M=700,W=7.5;const len=curve.getLength();
  const samples=[];for(let i=0;i<=M;i++){const t=i/M;const pos=curve.getPointAt(t%1);const tan=curve.getTangentAt(t%1).normalize();const nor=new T.Vector3(-tan.z,0,tan.x);samples.push({pos,tan,nor});}
  const ribbon=(inner,outer,tex,y)=>{const g=new T.BufferGeometry();const v=[],uv=[],idx=[];for(let i=0;i<=M;i++){const s=samples[i];const a=s.pos.clone().addScaledVector(s.nor,inner),b=s.pos.clone().addScaledVector(s.nor,outer);v.push(a.x,y,a.z,b.x,y,b.z);uv.push(0,i*0.5,1,i*0.5);if(i<M){const k=i*2;idx.push(k,k+1,k+2,k+1,k+3,k+2);}}g.setAttribute("position",new T.Float32BufferAttribute(v,3));g.setAttribute("uv",new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return new T.Mesh(g,new T.MeshLambertMaterial({map:tex,side:T.DoubleSide}));};
  const roadTex=gpCanvasTex(256,256,(x,w,h)=>{x.fillStyle="#3a3f4b";x.fillRect(0,0,w,h);x.fillStyle="rgba(255,255,255,.05)";for(let i=0;i<300;i++)x.fillRect(Math.random()*w,Math.random()*h,2,2);x.fillStyle="#f6c343";x.fillRect(w/2-4,0,8,h*0.55);x.fillStyle="#f4f4f4";x.fillRect(0,0,8,h);x.fillRect(w-8,0,8,h);},true);
  const rumbleTex=gpCanvasTex(64,128,(x,w,h)=>{x.fillStyle="#fff";x.fillRect(0,0,w,h);x.fillStyle="#e0512f";x.fillRect(0,0,w,h/2);},true);
  scene.add(ribbon(-W,W,roadTex,0.02));scene.add(ribbon(-W-1.4,-W,rumbleTex,0.03));scene.add(ribbon(W,W+1.4,rumbleTex,0.03));
  // start arch
  const s0=samples[0];const archMat=new T.MeshLambertMaterial({color:0xd94141});
  [-1,1].forEach(side=>{const py=new T.Mesh(new T.BoxGeometry(1.2,9,1.2),archMat);const p=s0.pos.clone().addScaledVector(s0.nor,side*(W+2));py.position.set(p.x,4.5,p.z);scene.add(py);
    const flag=new T.Mesh(new T.PlaneGeometry(2.4,1.6),new T.MeshBasicMaterial({map:gpCanvasTex(64,48,(x,w,h)=>{for(let i=0;i<8;i++)for(let j=0;j<6;j++){x.fillStyle=(i+j)%2?"#111":"#fff";x.fillRect(i*8,j*8,8,8);}}),side:T.DoubleSide}));flag.position.set(p.x+s0.tan.x*0.2,10.2,p.z+s0.tan.z*0.2);flag.lookAt(flag.position.clone().add(s0.nor));scene.add(flag);});
  const beam=new T.Mesh(new T.BoxGeometry((W+2)*2+1.2,2.6,1.4),new T.MeshLambertMaterial({map:gpTextTex("GRAND FABLE GP","#c62828","#fff",1024,160,96)}));beam.position.set(s0.pos.x,8.6,s0.pos.z);beam.lookAt(beam.position.clone().add(s0.tan));scene.add(beam);
  const screen=new T.Mesh(new T.BoxGeometry(5,3,0.6),new T.MeshBasicMaterial({map:gpTextTex("LAP 1","#0b1f5c","#7cf",512,300,120)}));screen.position.set(s0.pos.x,12.2,s0.pos.z);screen.lookAt(screen.position.clone().add(s0.tan));scene.add(screen);R3s_screen=screen;
  // grandstands with spectators (start straight + one far straight)
  const specGeo=new T.SphereGeometry(0.42,8,6),specMat=new T.MeshLambertMaterial({color:0xffffff});
  const standRanges=[[M-40,M],[0,45],[Math.floor(M*0.48),Math.floor(M*0.48)+50]];
  let specCount=0;standRanges.forEach(([a,b])=>specCount+=Math.floor((b-a)/2)*2*4);
  const spec=new T.InstancedMesh(specGeo,specMat,specCount);let si=0;const dummy=new T.Object3D();const palette=[0xff4d6d,0xffd166,0x4dd2ff,0x39e6a0,0xb06bff,0xffffff,0xff8c42];
  standRanges.forEach(([a,b])=>{[-1,1].forEach(side=>{const sa=samples[a],sb=samples[b];const mid=sa.pos.clone().add(sb.pos).multiplyScalar(0.5);const dir=sb.pos.clone().sub(sa.pos);const L=dir.length();dir.normalize();const nor=new T.Vector3(-dir.z,0,dir.x);
    const stand=new T.Mesh(new T.BoxGeometry(L,5,7),new T.MeshLambertMaterial({color:0x8d99ae}));const sp=mid.clone().addScaledVector(nor,side*(W+8));stand.position.set(sp.x,2.5,sp.z);stand.lookAt(stand.position.clone().add(dir));scene.add(stand);
    const roof=new T.Mesh(new T.BoxGeometry(L+2,0.4,8),new T.MeshLambertMaterial({color:0xd94141}));roof.position.set(sp.x,7,sp.z);roof.lookAt(roof.position.clone().add(dir));scene.add(roof);
    for(let i=a;i<b;i+=2)for(let tier=0;tier<4;tier++){const s=samples[i];const p=s.pos.clone().addScaledVector(nor,side*(W+5.5+tier*1.3));dummy.position.set(p.x,3.2+tier*0.8,p.z);dummy.updateMatrix();spec.setMatrixAt(si,dummy.matrix);spec.setColorAt(si,new T.Color(palette[(i+tier)%palette.length]));si++;}
  });});
  spec.count=si;spec.instanceMatrix.needsUpdate=true;if(spec.instanceColor)spec.instanceColor.needsUpdate=true;scene.add(spec);
  // cones, trees, balloons, clouds
  const coneGeo=new T.ConeGeometry(0.5,1.3,8),coneMat=new T.MeshLambertMaterial({color:0xff7f11});
  for(let i=10;i<M;i+=14){const s=samples[i];const side=(i/14)%2?1:-1;const cn=new T.Mesh(coneGeo,coneMat);const p=s.pos.clone().addScaledVector(s.nor,side*(W+2.2));cn.position.set(p.x,0.65,p.z);scene.add(cn);}
  const trunkMat=new T.MeshLambertMaterial({color:0x8d5a2b}),leafMat=new T.MeshLambertMaterial({color:0x2e8b57}),frondMat=new T.MeshLambertMaterial({color:0x3cb371,side:T.DoubleSide});
  for(let i=0;i<M;i+=9){if(standRanges.some(([a,b])=>i>=a-6&&i<=b+6))continue;const s=samples[i];const side=Math.random()<0.5?-1:1;const p=s.pos.clone().addScaledVector(s.nor,side*(W+9+Math.random()*16));const g=new T.Group();
    if(C.tree==="palm"){const tr=new T.Mesh(new T.CylinderGeometry(0.35,0.5,7,6),trunkMat);tr.position.y=3.5;g.add(tr);for(let f=0;f<6;f++){const fr=new T.Mesh(new T.ConeGeometry(0.9,4.2,4),frondMat);fr.position.y=7;fr.rotation.z=Math.PI/2.4;fr.rotation.y=f*Math.PI/3;fr.position.x=Math.cos(f*Math.PI/3)*1.6;fr.position.z=Math.sin(f*Math.PI/3)*1.6;fr.rotation.x=0;g.add(fr);}}
    else{const tr=new T.Mesh(new T.CylinderGeometry(0.4,0.6,3,6),trunkMat);tr.position.y=1.5;g.add(tr);const lf=new T.Mesh(new T.SphereGeometry(2.6,8,6),leafMat);lf.position.y=4.6;g.add(lf);const lf2=new T.Mesh(new T.SphereGeometry(1.8,8,6),leafMat);lf2.position.set(1.4,5.6,0.6);g.add(lf2);}
    g.position.set(p.x,0,p.z);scene.add(g);}
  for(let i=0;i<10;i++){const s=samples[Math.floor(Math.random()*M)];const p=s.pos.clone().addScaledVector(s.nor,(Math.random()<0.5?-1:1)*(W+4));const b=new T.Mesh(new T.SphereGeometry(1,10,8),new T.MeshLambertMaterial({color:palette[i%palette.length]}));b.position.set(p.x,6+Math.random()*3,p.z);b.userData.bob=Math.random()*6;scene.add(b);R3_balloons.push(b);}
  const cloudTex=gpCanvasTex(128,64,(x,w,h)=>{x.fillStyle="rgba(255,255,255,.95)";[[30,40,22],[60,30,26],[92,40,20],[50,44,18],[75,46,18]].forEach(c=>{x.beginPath();x.arc(c[0],c[1],c[2],0,7);x.fill();});});
  for(let i=0;i<14;i++){const sp=new T.Sprite(new T.SpriteMaterial({map:cloudTex,transparent:true}));sp.scale.set(40,20,1);sp.position.set((Math.random()-0.5)*700,60+Math.random()*30,(Math.random()-0.5)*700);scene.add(sp);}
  // item boxes + bananas
  const boxTex=gpCanvasTex(128,128,(x,w,h)=>{const g=x.createLinearGradient(0,0,w,h);["#ff4d6d","#ffd166","#39e6a0","#4dd2ff","#b06bff"].forEach((c,i)=>g.addColorStop(i/4,c));x.fillStyle=g;x.fillRect(0,0,w,h);x.fillStyle="#fff";x.font="900 90px system-ui";x.textAlign="center";x.textBaseline="middle";x.fillText("?",64,68);});
  const boxMat=new T.MeshBasicMaterial({map:boxTex,transparent:true,opacity:0.85});const items=[];
  for(let i=30;i<M;i+=48){for(let l=-1;l<=1;l++){const it={t:(i/M+Math.random()*0.01)%1,x:l*0.55,kind:"box",alive:true,mesh:new T.Mesh(new T.BoxGeometry(1.5,1.5,1.5),boxMat)};scene.add(it.mesh);items.push(it);}}
  const bananaTex=gpCanvasTex(64,64,(x,w,h)=>{x.font="52px system-ui";x.textAlign="center";x.textBaseline="middle";x.fillText("🍌",32,36);});
  const mkBanana=(t,x)=>{const sp=new T.Sprite(new T.SpriteMaterial({map:bananaTex,transparent:true}));sp.scale.set(2,2,1);scene.add(sp);return{t,x,kind:"banana",alive:true,mesh:sp};};
  for(let i=70;i<M;i+=120)items.push(mkBanana(i/M,(Math.floor(Math.random()*3)-1)*0.55));
  // karts
  const mkKart=r=>{const g=new T.Group();const body=new T.Mesh(new T.BoxGeometry(2.2,0.6,3.2),new T.MeshLambertMaterial({color:r.c}));body.position.y=0.75;g.add(body);
    const nose=new T.Mesh(new T.BoxGeometry(1.4,0.4,1.2),new T.MeshLambertMaterial({color:r.c}));nose.position.set(0,0.65,2.1);g.add(nose);
    const seat=new T.Mesh(new T.BoxGeometry(1.2,0.8,0.5),new T.MeshLambertMaterial({color:0x222}));seat.position.set(0,1.4,-0.9);g.add(seat);
    const plate=new T.Mesh(new T.PlaneGeometry(0.9,0.6),new T.MeshBasicMaterial({map:gpTextTex(String(GP_RACERS.indexOf(r)+1),"#fff","#111",64,48,40)}));plate.position.set(0,0.9,2.72);g.add(plate);
    const wheels=[];[[-1.15,0.5,1.1],[1.15,0.5,1.1],[-1.2,0.5,-1.1],[1.2,0.5,-1.1]].forEach(p=>{const w=new T.Mesh(new T.CylinderGeometry(0.5,0.5,0.45,12),new T.MeshLambertMaterial({color:0x151515}));w.rotation.z=Math.PI/2;w.position.set(p[0],p[1],p[2]);g.add(w);wheels.push(w);const hub=new T.Mesh(new T.CylinderGeometry(0.22,0.22,0.5,8),new T.MeshLambertMaterial({color:0xdddddd}));hub.rotation.z=Math.PI/2;hub.position.set(p[0],p[1],p[2]);g.add(hub);});
    const head=new T.Mesh(new T.SphereGeometry(0.62,16,12),new T.MeshBasicMaterial({map:gpFaceTex(r.e)}));head.position.set(0,2.05,-0.5);head.rotation.y=Math.PI;g.add(head);
    const helmet=new T.Mesh(new T.SphereGeometry(0.7,16,10,0,Math.PI*2,0,Math.PI/2),new T.MeshLambertMaterial({color:r.helmet}));helmet.position.set(0,2.15,-0.5);g.add(helmet);
    const torso=new T.Mesh(new T.BoxGeometry(1,0.9,0.7),new T.MeshLambertMaterial({color:r.c}));torso.position.set(0,1.35,-0.5);g.add(torso);
    const wheelSt=new T.Mesh(new T.TorusGeometry(0.35,0.06,6,16),new T.MeshLambertMaterial({color:0x333}));wheelSt.position.set(0,1.45,0.5);wheelSt.rotation.x=Math.PI/3;g.add(wheelSt);
    const shield=new T.Mesh(new T.SphereGeometry(2.6,16,12),new T.MeshBasicMaterial({color:0x4dd2ff,transparent:true,opacity:0.25}));shield.position.y=1.2;shield.visible=false;g.add(shield);
    const flame=new T.Sprite(new T.SpriteMaterial({map:gpCanvasTex(64,64,(x)=>{x.font="52px system-ui";x.textAlign="center";x.textBaseline="middle";x.fillText("🔥",32,36);}),transparent:true}));flame.scale.set(2,2,1);flame.position.set(0,0.8,-2.4);flame.visible=false;g.add(flame);
    scene.add(g);return{g,wheels,shieldMesh:shield,flameMesh:flame};};
  const karts=[];GP_RACERS.forEach((r,i)=>{const isMe=r.id===me.id;const m=mkKart(r);const order=isMe?0:(karts.length+1);
    karts.push({racer:r,player:isMe,...m,t:0,x:0,speed:0,max:36+r.speed*3,accel:9+r.accel*2.2,steer:1.4+r.handle*0.28,lap:0,spin:0,boost:0,shield:0,item:null,fireIn:8+Math.random()*8,wobble:Math.random()*7,boxes:0,pos:new T.Vector3()});});
  // starting grid: player at back row centre, rivals ahead in two columns
  let gi=0;karts.forEach(k=>{if(k.player){k.t=(M-6)/M;k.x=0;}else{k.t=(M-2-gi*3)/M%1;k.x=gi%2?0.5:-0.5;gi++;}});
  R3={T,C,me,renderer,scene,camera,curve,samples,M,W,len,items,karts,shots:[],mkBanana,keys:{},touchDir:0,brake:false,t0:performance.now(),time:0,countdown:3.5,done:false,raf:null,last:performance.now(),camPos:new T.Vector3(),msgT:0,place:5,board:[]};
  R3.kd=e=>{if(!R3)return;const k=e.key.toLowerCase();if(k==="escape"){renderCircuits();return;}if(k===" "||k==="arrowup"){gpUseItem(R3.karts.find(x=>x.player));e.preventDefault();return;}R3.keys[k]=true;if(["arrowleft","arrowright","arrowdown"].includes(k))e.preventDefault();};
  R3.ku=e=>{if(!R3)return;R3.keys[e.key.toLowerCase()]=false;};
  window.addEventListener("keydown",R3.kd);window.addEventListener("keyup",R3.ku);
  const hold=(id,dir)=>{const b=$(id);if(!b)return;const on=ev=>{ev.preventDefault();if(!R3)return;if(dir==="b")R3.brake=true;else R3.touchDir=dir;};const off=ev=>{if(!R3)return;if(dir==="b")R3.brake=false;else if(R3.touchDir===dir)R3.touchDir=0;};["pointerdown","touchstart"].forEach(t=>b.addEventListener(t,on,{passive:false}));["pointerup","pointerleave","pointercancel","touchend"].forEach(t=>b.addEventListener(t,off));};
  hold("rcL",-1);hold("rcR",1);hold("rcB","b");hold("gp3L",-1);hold("gp3R",1);
  $("rcF").addEventListener("pointerdown",ev=>{ev.preventDefault();if(R3)gpUseItem(R3.karts.find(x=>x.player));});
  R3.onResize=()=>{if(!R3)return;const w=canvas.clientWidth||720,h=Math.round(w*9/16);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();};
  window.addEventListener("resize",R3.onResize);R3.onResize();
  setTimeout(()=>{const c=$("gp3Card");if(c)c.classList.add("hide");},3500);
  say("Grand Fable GP at "+C.name+". Three, two, one, go!");
  R3.raf=requestAnimationFrame(gpFrame);
}
let R3s_screen=null;const R3_balloons=[];
function gpMsg(m){if(!R3)return;const e=$("gp3Msg");if(e){e.textContent=m;e.classList.add("show");}R3.msgT=1.6;}
function gpUseItem(k){
  if(!R3||R3.done||R3.countdown>0||!k||!k.item)return;const it=k.item;k.item=null;
  if(it==="rocket"){k.boost=3;if(k.player){sfx("levelup");gpMsg("🚀 Rocket boost!");}}
  else if(it==="shield"){k.shield=8;if(k.player){sfx("tick");gpMsg("🛡️ Shield up!");}}
  else if(it==="banana"){R3.items.push(R3.mkBanana((k.t-0.012+1)%1,k.x));if(k.player){sfx("tick");gpMsg("🍌 Banana dropped!");}}
  else if(it==="orb"){const s=new R3.T.Mesh(new R3.T.SphereGeometry(0.7,12,10),new R3.T.MeshBasicMaterial({color:0x4dd2ff}));R3.scene.add(s);R3.shots.push({t:k.t,x:k.x,speed:k.speed+30,from:k,life:5,mesh:s});if(k.player){sfx("correct");gpMsg("🌀 Homing orb away!");}}
  if(k.player)gpHudItem();
}
function gpHit(k,cause){
  if(k.shield>0){k.shield=0;if(k.player){sfx("tick");gpMsg("🛡️ Shield blocked it!");}return;}
  k.spin=1.2;k.boost=0;if(k.player){sfx("wrong");gpMsg(cause==="orb"?"🌀 Hit by an orb!":"🍌 Banana spin!");}
}
function gpHudItem(){const k=R3&&R3.karts.find(x=>x.player);const e=$("gp3Item");if(e&&k)e.innerHTML=k.item?GP_ITEMS[k.item].e+'<small>⚡ USE</small>':'—<small>ITEM</small>';}
function gpFrame(now){
  if(!R3)return;
  const dt=Math.min(0.05,(now-R3.last)/1000);R3.last=now;
  if(R3.countdown>0){R3.countdown-=dt;const c=$("gp3Count");if(c){const n=Math.ceil(R3.countdown-0.3);c.textContent=n>0?String(n):"GO!";c.classList.add("show");if(R3.countdown<=0)setTimeout(()=>{const cc=$("gp3Count");if(cc)cc.classList.remove("show");},700);}}
  else if(!R3.done)R3.time=now-R3.t0-3500;
  gpUpdate(dt,R3.countdown>0);gpRender(dt);
  R3.raf=requestAnimationFrame(gpFrame);
}
function gpUpdate(dt,waiting){
  const {karts,samples,M,len,items}=R3;const me=karts.find(k=>k.player);
  const k=R3.keys;const left=k["arrowleft"]||k["a"]||R3.touchDir<0,right=k["arrowright"]||k["d"]||R3.touchDir>0,brake=k["arrowdown"]||k["s"]||R3.brake;
  karts.forEach(kt=>{
    const i=Math.floor(kt.t*M)%M;const s=samples[i],s2=samples[(i+4)%M];
    const curv=s.tan.clone().cross(s2.tan).y;         // + = turning left
    const offroad=Math.abs(kt.x)>1.05;
    const maxNow=waiting?0:kt.max*(kt.boost>0?1.35:1)*(kt.spin>0?0.3:1)*(offroad?0.45:1);
    if(kt.player&&brake&&!waiting)kt.speed=Math.max(0,kt.speed-40*dt);else kt.speed+=(maxNow-kt.speed)*Math.min(1,dt*(kt.speed<maxNow?kt.accel/10:3));
    const spd=kt.speed/kt.max;
    if(kt.spin>0){kt.spin-=dt;kt.x+=Math.sin(kt.spin*18)*dt*0.6;}
    else if(kt.player){if(left)kt.x-=dt*kt.steer*Math.max(.35,spd);if(right)kt.x+=dt*kt.steer*Math.max(.35,spd);}
    else{kt.wobble+=dt;const target=Math.sin(kt.wobble*0.5)*0.5;const ahead=karts.find(o=>o!==kt&&((o.t-kt.t+1)%1)<0.012&&Math.abs(o.x-kt.x)<0.35);kt.x+=((ahead?(kt.x<ahead.x?-0.7:0.7):target)-kt.x)*dt*(1.2+kt.racer.handle*0.2);
      kt.fireIn-=dt;if(kt.fireIn<=0&&!waiting&&!R3.done){kt.fireIn=10+Math.random()*10;if(!kt.item)kt.item=["orb","rocket","banana","shield"][Math.floor(Math.random()*4)];const gap=(me.t-kt.t+1)%1;if(kt.item==="orb"&&gap>0.005&&gap<0.12)gpUseItem(kt);else if(kt.item==="banana"&&gap>0.88)gpUseItem(kt);else if(kt.item==="rocket"||kt.item==="shield")gpUseItem(kt);}}
    kt.x-=curv*spd*dt*14;                                // drift outward on curves
    kt.x=Math.max(-1.7,Math.min(1.7,kt.x));
    if(kt.boost>0)kt.boost-=dt;if(kt.shield>0)kt.shield-=dt;
    const before=kt.t;kt.t=(kt.t+kt.speed*dt/len)%1;
    if(!waiting&&kt.t<before&&before>0.5&&!kt.started){kt.started=true;} // first crossing = leaving the grid
    else if(!waiting&&kt.t<before&&before>0.5){kt.lap++;if(kt.player){if(kt.lap>=R3.C.laps&&!R3.done)gpFinish();else{sfx("tick");gpMsg(kt.lap+1===R3.C.laps?"🏁 Final lap!":"Lap "+(kt.lap+1)+"!");if(R3s_screen)R3s_screen.material.map=gpTextTex("LAP "+(kt.lap+1),"#0b1f5c","#7cf",512,300,120);}}}
    // world position + orientation
    const pos=R3.curve.getPointAt(kt.t),tan=R3.curve.getTangentAt(kt.t).normalize(),nor=new R3.T.Vector3(-tan.z,0,tan.x);
    pos.addScaledVector(nor,kt.x*(R3.W-1.2));kt.pos.copy(pos);
    kt.g.position.copy(pos);if(offroad)kt.g.position.y=Math.abs(Math.sin(kt.t*len*3))*0.12;
    kt.g.lookAt(pos.clone().add(tan));kt.g.rotation.y+=(kt.spin>0?Math.sin(kt.spin*15)*0.9:0)+(kt.player?((right?-1:0)+(left?1:0))*0.12:0);
    kt.wheels.forEach(w=>w.rotation.x+=kt.speed*dt*1.8);
    kt.shieldMesh.visible=kt.shield>0;kt.flameMesh.visible=kt.boost>0;
    // items
    items.forEach(it=>{if(!it.alive)return;const d=(it.t-kt.t+1)%1;if(d<0.004&&Math.abs(it.x-kt.x)<0.35){
      if(it.kind==="box"){it.alive=false;it.mesh.visible=false;setTimeout(()=>{it.alive=true;it.mesh.visible=true;},7000);kt.boxes++;if(!kt.item){const pool=R3.place>=4&&kt.player?["rocket","rocket","orb","shield"]:["rocket","orb","shield","banana"];kt.item=pool[Math.floor(Math.random()*pool.length)];if(kt.player){sfx("correct");gpMsg("🎁 "+GP_ITEMS[kt.item].n+"!");gpHudItem();}}}
      else if(it.kind==="banana"&&kt.spin<=0){it.alive=false;it.mesh.visible=false;if(!it.dropped)setTimeout(()=>{it.alive=true;it.mesh.visible=true;},9000);gpHit(kt,"banana");}
    }});
  });
  // kart-kart bumps
  for(let a=0;a<karts.length;a++)for(let b=a+1;b<karts.length;b++){const A=karts[a],B=karts[b];const d=(A.t-B.t+1)%1;const close=d<0.004||d>0.996;if(close&&Math.abs(A.x-B.x)<0.42){const back=d<0.5?B:A,front=back===A?B:A;if(back.speed>front.speed)back.speed=front.speed*0.85;A.x+=(A.x<B.x?-1:1)*0.2;B.x-=(A.x<B.x?-1:1)*0.2;}}
  // homing orbs
  R3.shots=R3.shots.filter(s=>{s.life-=dt;s.t=(s.t+s.speed*dt/len)%1;let target=null,bd=1;karts.forEach(o=>{if(o===s.from)return;const d=(o.t-s.t+1)%1;if(d<0.09&&d<bd){bd=d;target=o;}});
    if(target){s.x+=(target.x-s.x)*dt*4;if(bd<0.004&&Math.abs(target.x-s.x)<0.45){gpHit(target,"orb");if(s.from.player){sfx("correct");gpMsg("🌀 Got "+target.racer.n+"!");}R3.scene.remove(s.mesh);return false;}}
    const pos=R3.curve.getPointAt(s.t),tan=R3.curve.getTangentAt(s.t),nor=new R3.T.Vector3(-tan.z,0,tan.x);pos.addScaledVector(nor,s.x*(R3.W-1.2));s.mesh.position.set(pos.x,1,pos.z);
    if(s.life<=0){R3.scene.remove(s.mesh);return false;}return true;});
  // item + balloon animation
  items.forEach(it=>{if(it.kind==="box"){it.mesh.rotation.y+=dt*1.5;it.mesh.rotation.x+=dt*0.7;}const pos=R3.curve.getPointAt(it.t),tan=R3.curve.getTangentAt(it.t),nor=new R3.T.Vector3(-tan.z,0,tan.x);pos.addScaledVector(nor,it.x*(R3.W-1.2));it.mesh.position.set(pos.x,it.kind==="box"?1.3+Math.sin(performance.now()/400+it.x)*0.2:0.9,pos.z);});
  R3_balloons.forEach(b=>{b.position.y+=Math.sin(performance.now()/900+b.userData.bob)*dt*0.6;});
  // standings
  const all=karts.slice().sort((a,b)=>(b.lap+b.t)-(a.lap+a.t));R3.board=all;R3.place=all.indexOf(me)+1;
  if(R3.msgT>0){R3.msgT-=dt;if(R3.msgT<=0){const e=$("gp3Msg");if(e)e.classList.remove("show");}}
  // HUD
  const el=(id,v)=>{const e=$(id);if(e&&e.textContent!==v)e.textContent=v;};
  el("gp3Lap","LAP "+Math.min(R3.C.laps,me.lap+1)+"/"+R3.C.laps+"  ·  "+gpOrd(R3.place).toUpperCase());el("gp3Time",gpFmt(Math.max(0,R3.time)));el("gp3Speed",Math.round(me.speed*3.2)+" km/h");
  const bd=$("gp3Board");if(bd){const html=all.map((k2,i)=>'<div class="'+(k2.player?"me":"")+'"><i style="background:'+k2.racer.css+'"></i>'+(i+1)+'. '+esc(k2.racer.n)+'</div>').join("");if(bd.innerHTML!==html)bd.innerHTML=html;}
  gpDrawMini($("gp3Map"),R3.C,karts);
}
function gpRender(dt){
  const me=R3.karts.find(k=>k.player);const tan=R3.curve.getTangentAt(me.t).normalize();
  const target=me.pos.clone().addScaledVector(tan,-11).add(new R3.T.Vector3(0,5.2,0));
  if(R3.countdown>0&&R3.camPos.lengthSq()===0)R3.camPos.copy(target);
  R3.camPos.lerp(target,Math.min(1,dt*5));R3.camera.position.copy(R3.camPos);
  R3.camera.lookAt(me.pos.clone().addScaledVector(tan,8).add(new R3.T.Vector3(0,1.6,0)));
  R3.renderer.render(R3.scene,R3.camera);
}
function gpFinish(){
  R3.done=true;const me=R3.karts.find(k=>k.player);const place=R3.place;const xp=[0,30,20,10,5,5][place]||5;
  sfx(place===1?"levelup":"correct");if(place===1)confetti();
  say(place===1?"You win the Grand Fable GP! Champion of "+R3.C.name+"!":"You finished "+gpOrd(place)+". Great driving!");
  let earned=0;
  if(P){earned=xp;P.xp+=xp;P.race=P.race||{};const prev=P.race[R3.C.id];P.race[R3.C.id]={time:prev&&prev.time<R3.time?prev.time:R3.time,place:Math.min(place,prev?prev.place:9),date:today()};
    if(place===1&&!P.trophies.some(t=>t.type==="race")&&typeof awardTrophy==="function")awardTrophy({type:"race",icon:"🏎️",label:"Grand Fable Champion",color:"#ffd166",detail:"Won the Grand Fable GP at "+R3.C.name+"."});save();}
  const podium=R3.board.slice(0,3).map((k,i)=>'<div class="gp-pod p'+(i+1)+'"><span>'+k.racer.e+'</span><b>'+gpOrd(i+1)+'</b><small>'+esc(k.racer.n)+'</small></div>').join("");
  setTimeout(()=>{if(!R3)return;const w=$("gp3");if(!w)return;w.insertAdjacentHTML("beforeend",'<div class="gp3-finish"><div class="gp3-fin-title">🏁 '+gpOrd(place).toUpperCase()+' PLACE</div><div class="gp-podium">'+podium+'</div><div class="gp3-fin-sub">'+gpFmt(R3.time)+' · 🎁 '+me.boxes+' boxes'+(earned?' · +'+earned+' XP':'')+'</div><div class="btn-row" style="margin-top:12px"><button class="btn big" onclick="startRace3D(\''+R3.C.id+'\')">Race again 🔁</button><button class="btn secondary big" onclick="renderCircuits()">Circuits 🏁</button><button class="btn secondary big" onclick="'+(P?'renderHome()':'renderProfiles()')+'">Home 🏠</button></div></div>');},1300);
}
