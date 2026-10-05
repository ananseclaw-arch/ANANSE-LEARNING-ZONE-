/* ============================================================
   GRAND FABLE HORIZON — JAPAN EDITION (Three.js r128)
   An open-road racer in the spirit of Forza Horizon 6: Mount Fuji on
   the horizon, cherry blossom, cedar forests, a torii start gate,
   lakeside towns with tiled roofs, a hazy city skyline, golden-hour
   light, glossy real-looking sports cars and a round MPH speedometer.
   · Realistic look by default; the ink-and-watercolour STORYBOOK look
     from the previous edition is still selectable on the route screen.
   · FREE DRIVE: collect floating music notes that build a song.
   · RACE: beat 4 rivals, chain skills (DRIFT, NEAR MISS, PASS,
     DRAFTING, CLEAN RACING) for a multiplier. No weapons, no damage.
   · Same entry points as before: renderRace / renderCircuits /
     startRace3D. Falls back to the 2D racer when WebGL is missing.
   · Built for iPad: instanced vegetation, one shadow light, pixel
     ratio <= 2, automatic quality step-down, canvas-made textures.
   ============================================================ */
"use strict";
let R3=null;
const GP_CARS=[
 {id:"falcon",n:"Rosso Falcon",cls:"S2",pi:960,type:"super",paint:"#d1121c",speed:5,handle:4,accel:5,bio:"Red mid-engine supercar. Fast, wide and glued to the road."},
 {id:"arrow",n:"Silver Arrow",cls:"S2",pi:980,type:"hyper",paint:"#d7dbe0",speed:5,handle:3,accel:5,bio:"Silver hypercar with a giant rear wing."},
 {id:"shogun",n:"Shogun GT",cls:"S1",pi:900,type:"gt",paint:"#f2f2f2",speed:4,handle:5,accel:4,bio:"Japanese super-coupe. Brilliant in the bends."},
 {id:"rally",n:"Alpine Rally",cls:"A",pi:800,type:"rally",paint:"#1d5fd1",speed:3,handle:5,accel:5,bio:"Rally hatchback. Darts through tight mountain corners."},
 {id:"kumasi",n:"Kumasi V8",cls:"A",pi:820,type:"muscle",paint:"#f28a1c",speed:5,handle:2,accel:5,bio:"Muscle coupe. Loves long straights."},
 {id:"kei",n:"Lemon Kei",cls:"B",pi:640,type:"kei",paint:"#f7e85c",speed:3,handle:5,accel:4,bio:"Tiny city car. Nips round every corner."}
];
/* body shapes: z runs along the car, +z is the nose; all in metres */
const GP_SHAPE={
 super:{len:4.7,w:2.04,ride:0.2,rad:0.37,radR:0.39,xf:1.45,xr:-1.32,nose:0.5,hood:0.72,belt:0.8,deck:0.82,tail:0.68,cabF:0.5,roofF:-0.1,roofR:-0.9,cabR:-1.5,roof:1.1,wing:"lip",tyreW:0.3,tyreWR:0.38,hip:0.06},
 hyper:{len:4.8,w:2.1,ride:0.2,rad:0.38,radR:0.4,xf:1.5,xr:-1.35,nose:0.48,hood:0.7,belt:0.78,deck:0.8,tail:0.66,cabF:0.4,roofF:-0.2,roofR:-0.95,cabR:-1.5,roof:1.08,wing:"big",tyreW:0.3,tyreWR:0.4,hip:0.07},
 gt:{len:4.7,w:1.98,ride:0.24,rad:0.38,radR:0.38,xf:1.42,xr:-1.38,nose:0.58,hood:0.86,belt:0.92,deck:0.92,tail:0.8,cabF:0.3,roofF:-0.45,roofR:-1.25,cabR:-1.95,roof:1.26,wing:"duck",tyreW:0.3,tyreWR:0.34,hip:0.04},
 rally:{len:4.2,w:1.86,ride:0.34,rad:0.36,radR:0.36,xf:1.28,xr:-1.28,nose:0.68,hood:0.96,belt:1.02,deck:1.04,tail:1.02,cabF:0.55,roofF:-0.1,roofR:-1.4,cabR:-1.9,roof:1.48,wing:"roof",tyreW:0.28,tyreWR:0.28},
 muscle:{len:4.9,w:1.98,ride:0.26,rad:0.38,radR:0.4,xf:1.5,xr:-1.45,nose:0.64,hood:0.94,belt:0.98,deck:0.94,tail:0.84,cabF:0.1,roofF:-0.55,roofR:-1.3,cabR:-1.95,roof:1.32,wing:"duck",tyreW:0.3,tyreWR:0.36,hip:0.03},
 kei:{len:3.4,w:1.6,ride:0.3,rad:0.3,radR:0.3,xf:1.05,xr:-1.05,nose:0.7,hood:0.92,belt:0.98,deck:1.02,tail:1.0,cabF:0.75,roofF:0.2,roofR:-1.1,cabR:-1.5,roof:1.52,wing:"none",tyreW:0.24,tyreWR:0.24}
};
/* Real car pictures (Gemini renders keyed off a green screen by key_cars.py): one WebP sheet
   per car with 6 frames of equal size on a shared ground line: nose-right, straight, nose-left,
   then the same three with exhaust flames. ppm = pixels per metre of the straight view. */
const GP_PICS={
 falcon:{src:"assets/cars/red.webp",frames:6,fw:498,fh:286,ppm:152.17},
 arrow:{src:"assets/cars/silver.webp",frames:6,fw:500,fh:286,ppm:153.48},
 shogun:{src:"assets/cars/white.webp",frames:3,fw:308,fh:150,ppm:91}
};
/* Gemini world pictures (world_assets.py): a 360-degree sky band with Fuji in the middle, a billboard
   atlas (cherry, cedar, torii, lantern, banner), one guard-rail bay, tileable asphalt, the dial face. */
const GP_WORLD={
 sky:{src:"assets/world/sky.webp",hor:0.583,mpp:3.3,top:"#c5b2a8",haze:"#dcc3a9",r:1500,horY:55},
 props:{src:"assets/world/props.webp",w:746,h:357,cells:{cherry:{x:4,y:79,w:222,h:274,m:9.5},cedar:{x:230,y:4,w:105,h:349,m:17},torii:{x:339,y:129,w:220,h:224,m:7.5},lantern:{x:563,y:138,w:100,h:215,m:2.3},banner:{x:667,y:66,w:75,h:287,m:4.6}}},
 rail:{src:"assets/world/rail.webp",len:2.4,hgt:0.86},
 road:{src:"assets/world/road.webp"},
 speedo:{src:"assets/world/speedo.webp",a0:137,a1:404.5,max:200},
 logo:"assets/world/logo.webp",hero:"assets/world/hero.webp"
};
const GP_INTRO="assets/intro_race.mp4";
const GP_PAINTS=["#d1121c","#d7dbe0","#f2f2f2","#1d5fd1","#f28a1c","#f7e85c","#0d0f14","#2e9e57","#8e3bd6","#ff5fa2"];
const GP_SCALE=[392,440,523.25,587.33,659.25,783.99,880,1046.5,1174.66];
const GP_DRIVERS=["Kofi","Ama","Esi","Kwame","Abena"];
/* routes: points are x,z on the ground. Each loop starts in the middle of a gentle straight heading roughly -z (north),
   so the grid, the torii gate and Fuji line up; the first and last points must never meet at a sharp angle. */
const GP_CIRCUITS=[
 {id:"kawaguchi",name:"Lake Kawaguchi Loop",laps:2,tree:"cherry",hills:2.4,grass:0x7fa65a,lake:{x:30,z:-470,rx:420,rz:230},town:1,city:0.35,fuji:[40,-1180],
  look:{top:"#4f86cf",mid:"#a3c6e6",hor:"#f3d7ad",glow:"#ffe3b0",sun:"#ffd7a6",sunI:1.25,hemi:0.72,dir:[0.62,0.34,-0.58],haze:"#d9dcea",hill:"#5d6f98",time:"Golden hour by the lake",night:0,tint:[1,1,1]},
  story:{paper:"#f7f0e1",ink:"#2b2735",hill:"#a7c7a0",top:"#a9d8ee",hor:"#fbf3e2"},
  pts:[[-112,18],[-95,-20],[-40,-60],[30,-150],[100,-160],[150,-100],[140,-20],[160,60],[110,110],[40,100],[-20,140],[-90,120],[-120,50]]},
 {id:"hakone",name:"Hakone Mountain Pass",laps:2,tree:"cedar",hills:5.5,grass:0x5f8a46,lake:null,town:0,city:0,fuji:[-120,-1150],mtn:[{x:230,z:-60,r:260,h:42},{x:-260,z:120,r:220,h:30}],
  look:{top:"#5b92d6",mid:"#b2d0ea",hor:"#eadfc8",glow:"#fff0c8",sun:"#fff0d2",sunI:1.2,hemi:0.78,dir:[-0.5,0.5,-0.55],haze:"#cfd8e3",hill:"#4b6a8f",time:"Misty mountain morning",night:0,tint:[0.9,0.97,1.06]},
  story:{paper:"#f7f0e1",ink:"#2d2632",hill:"#c3b68c",top:"#8fb8e6",hor:"#fde3bf"},
  pts:[[-118,5],[-100,-30],[-45,-75],[10,-130],[70,-150],[140,-130],[170,-50],[130,20],[150,90],[90,140],[20,120],[-40,150],[-110,110],[-130,40]]},
 {id:"tokyo",name:"Tokyo Bay Run",laps:2,tree:"mixed",hills:1.6,grass:0x7f9a5c,lake:{x:340,z:40,rx:280,rz:620,sea:1},town:0,city:1,fuji:[-200,-1200],
  look:{top:"#3c5f9e",mid:"#9ab2d6",hor:"#f7b98a",glow:"#ffc48a",sun:"#ffc07a",sunI:1.15,hemi:0.62,dir:[-0.75,0.28,-0.45],haze:"#d8c8c8",hill:"#5a5f86",time:"Sunset over the bay",night:0.5,tint:[1.1,0.9,0.8]},
  story:{paper:"#e8d3c6",ink:"#241c30",hill:"#7a7aa6",top:"#3b3f78",hor:"#f2a88e"},
  pts:[[-128,0],[-110,-40],[-55,-90],[0,-140],[40,-170],[110,-170],[140,-100],[120,-30],[140,50],[100,120],[30,130],[-40,170],[-110,130],[-140,40]]}
];
const GP_MPH=3.4;                        // game speed → mph on the dial
const GP_GEARS=[0,28,52,78,104,132];     // mph where each gear starts
function gpOrd(n){return n+(["th","st","nd","rd"][(n%100>10&&n%100<14)?0:(n%10<4?n%10:0)]);}
function gpSuf(n){return gpOrd(n).slice(String(n).length);}
function gpFmt(ms){const s=Math.floor(ms/1000),m=Math.floor(s/60);return m+":"+String(s%60).padStart(2,"0")+"."+String(Math.floor((ms%1000)/100));}
function gpLin(c){return new THREE.Color(c).convertSRGBToLinear();}
function gpNum(n){return Math.round(n).toLocaleString("en-US");}
function gpCar(){const id=(P&&P.gpCar)||window._gpCar||"falcon";return GP_CARS.find(c=>c.id===id)||GP_CARS[0];}
function gpPaint(){const p=(P&&P.gpPaint)||window._gpPaint;return (p&&/^#[0-9a-f]{6}$/i.test(p))?p:gpCar().paint;}
function gpLook(){return (P&&P.gpLook)||window._gpLook||"real";}
function gpStory(){return gpLook()==="story";}
function gpStats(car){return{max:36+car.speed*3,accel:9+car.accel*2.2,steer:1.4+car.handle*0.28,offF:car.type==="rally"?0.62:0.45};}
/* ---------- ink & wash post-process (one full-screen pass) ---------- */
const GP_POST_FS=`
uniform sampler2D tCol;uniform sampler2D tDep;uniform vec2 res;uniform float t;uniform float hasDep;uniform vec3 paper;uniform vec3 ink;uniform float cn;uniform float cf;uniform float night;
varying vec2 vUv;
float hsh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float nz(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hsh(i),hsh(i+vec2(1.0,0.0)),f.x),mix(hsh(i+vec2(0.0,1.0)),hsh(i+vec2(1.0,1.0)),f.x),f.y);}
float rawD(vec2 uv){return texture2D(tDep,uv).x;}
float linD(float z){float zn=z*2.0-1.0;return 2.0*cn*cf/(cf+cn-zn*(cf-cn));}
void main(){
  float bt=floor(t*12.0);
  vec2 wob=vec2(nz(vUv*7.0+bt*1.7),nz(vUv*7.0+bt*1.7+19.3))-0.5;
  vec2 uv=vUv+wob*2.2/res;
  vec2 px=2.1/res;
  vec3 c=texture2D(tCol,vUv).rgb;
  vec3 cl=texture2D(tCol,uv-vec2(px.x,0.0)).rgb,cr=texture2D(tCol,uv+vec2(px.x,0.0)).rgb,cu=texture2D(tCol,uv+vec2(0.0,px.y)).rgb,cd=texture2D(tCol,uv-vec2(0.0,px.y)).rgb;
  float e=smoothstep(0.10,0.30,length(cr-cl)+length(cu-cd));
  float sky=0.0;
  if(hasDep>0.5){
    sky=step(0.99999,rawD(vUv));
    float dc=linD(rawD(uv)),dl=linD(rawD(uv-vec2(px.x,0.0))),dr=linD(rawD(uv+vec2(px.x,0.0))),du=linD(rawD(uv+vec2(0.0,px.y))),dd=linD(rawD(uv-vec2(0.0,px.y)));
    float lap=(abs(dl+dr-2.0*dc)+abs(du+dd-2.0*dc))/max(dc,1.0);
    float jump=max(max(abs(dl-dc),abs(dr-dc)),max(abs(du-dc),abs(dd-dc)))/max(dc,1.0);
    e=max(e,max(smoothstep(0.012,0.045,lap),smoothstep(0.025,0.08,jump)));
    e*=1.0-smoothstep(260.0,800.0,dc)*0.8;
  }
  vec3 gl=vec3(0.0);
  for(int i=0;i<8;i++){float a=float(i)*0.7854;vec2 o=vec2(cos(a),sin(a))*7.0/res;vec3 s=texture2D(tCol,vUv+o).rgb;gl+=max(s-vec3(0.86),0.0);}
  c+=gl*(0.07+night*0.22);
  c=mix(c,paper,0.08+sky*(0.34-night*0.2));
  float bl=nz(vUv*res/190.0)*0.6+nz(vUv*res/55.0)*0.4;
  c*=0.93+0.12*bl;
  float gr=hsh(floor(vUv*res/1.6))*0.55+nz(vec2(vUv.x*res.x/2.5,vUv.y*res.y/9.0))*0.45;
  c*=0.935+0.075*gr;
  float lum=dot(c,vec3(0.299,0.587,0.114));
  float hat=step(0.55,fract((vUv.x*res.x+vUv.y*res.y)/6.0));
  c=mix(c,ink,min(1.0,e*1.05)*0.9+(1.0-smoothstep(0.16,0.34,lum))*hat*0.16*(1.0-sky));
  c*=1.0-night*0.12*(1.0-sky);
  vec2 q=vUv*(1.0-vUv);float v=pow(clamp(q.x*q.y*18.0,0.0,1.0),0.16);
  c=mix(paper*0.84,c,v);
  gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
}`;
function gpPostSetup(T,renderer,L){let depthOK=true;const rt=new T.WebGLRenderTarget(4,4,{minFilter:T.LinearFilter,magFilter:T.LinearFilter,format:T.RGBAFormat});rt.texture.encoding=T.sRGBEncoding;
  try{const ok=renderer.capabilities.isWebGL2||renderer.extensions.has("WEBGL_depth_texture");if(!ok)throw 0;rt.depthTexture=new T.DepthTexture();rt.depthTexture.type=T.UnsignedIntType;}catch(e){depthOK=false;rt.depthTexture=null;}
  const mat=new T.ShaderMaterial({uniforms:{tCol:{value:rt.texture},tDep:{value:rt.depthTexture},res:{value:new T.Vector2(4,4)},t:{value:0},hasDep:{value:depthOK?1:0},paper:{value:new T.Color(L.paper)},ink:{value:new T.Color(L.ink)},cn:{value:0.6},cf:{value:1800},night:{value:L.night||0}},
    vertexShader:"varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}",fragmentShader:GP_POST_FS,depthTest:false,depthWrite:false});
  const quad=new T.Mesh(new T.PlaneGeometry(2,2),mat);quad.frustumCulled=false;const scene=new T.Scene();scene.add(quad);const cam=new T.OrthographicCamera(-1,1,1,-1,0,1);
  return{rt,mat,scene,cam,depthOK,resize(w,h,pr){const W=Math.max(2,Math.round(w*pr)),H=Math.max(2,Math.round(h*pr));rt.setSize(W,H);mat.uniforms.res.value.set(W,H);},dispose(){rt.dispose();if(rt.depthTexture)rt.depthTexture.dispose();mat.dispose();quad.geometry.dispose();}};}

/* ---------- sound: synthesised with WebAudio (no files) ---------- */
const GPA={ctx:null,master:null,eng:null,muted:false,
  init(){try{if(!this.ctx){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;this.ctx=new AC();this.master=this.ctx.createGain();this.master.gain.value=this.muted?0:0.9;this.master.connect(this.ctx.destination);
      const nb=this.ctx.createBuffer(1,this.ctx.sampleRate,this.ctx.sampleRate),d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;this.noiseBuf=nb;}
    if(this.ctx.state==="suspended")this.ctx.resume();}catch(e){}},
  setMute(m){this.muted=m;if(this.master&&this.ctx)this.master.gain.setTargetAtTime(m?0:0.9,this.ctx.currentTime,0.02);},
  startEngine(){if(!this.ctx||this.eng)return;try{const c=this.ctx;
    const o1=c.createOscillator(),o2=c.createOscillator(),f=c.createBiquadFilter(),g=c.createGain();
    o1.type="sawtooth";o2.type="square";o1.frequency.value=50;o2.frequency.value=25;f.type="lowpass";f.frequency.value=400;f.Q.value=4;g.gain.value=0;
    o1.connect(f);o2.connect(f);f.connect(g);g.connect(this.master);o1.start();o2.start();
    const ns=c.createBufferSource();ns.buffer=this.noiseBuf;ns.loop=true;const bp=c.createBiquadFilter();bp.type="bandpass";bp.frequency.value=1900;bp.Q.value=4;const ng=c.createGain();ng.gain.value=0;
    ns.connect(bp);bp.connect(ng);ng.connect(this.master);ns.start();this.eng={o1,o2,f,g,ng,ns};}catch(e){}},
  engine(rf,load,screech,idle){const e=this.eng;if(!e)return;const t=this.ctx.currentTime;const base=idle?40+rf*40:36+rf*150;
    e.o1.frequency.setTargetAtTime(base,t,0.035);e.o2.frequency.setTargetAtTime(base/2+0.7,t,0.035);
    e.f.frequency.setTargetAtTime(240+rf*1800,t,0.05);e.g.gain.setTargetAtTime(0.026+load*0.05,t,0.08);e.ng.gain.setTargetAtTime(screech?0.05:0,t,0.05);},
  stopEngine(){const e=this.eng;if(!e)return;try{e.g.gain.setTargetAtTime(0,this.ctx.currentTime,0.05);e.ng.gain.setTargetAtTime(0,this.ctx.currentTime,0.05);const s=this.ctx.currentTime+0.3;e.o1.stop(s);e.o2.stop(s);e.ns.stop(s);}catch(x){}this.eng=null;},
  tone(freq,dur,type,vol,slideTo,delay){if(!this.ctx)return;try{const c=this.ctx,t=c.currentTime+(delay||0);const o=c.createOscillator(),g=c.createGain();o.type=type||"sine";o.frequency.setValueAtTime(freq,t);if(slideTo)o.frequency.exponentialRampToValueAtTime(slideTo,t+dur);
    g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol||0.2,t+0.01);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);o.connect(g);g.connect(this.master);o.start(t);o.stop(t+dur+0.05);}catch(e){}},
  noise(dur,vol,freq,delay){if(!this.ctx||!this.noiseBuf)return;try{const c=this.ctx,t=c.currentTime+(delay||0);const s=c.createBufferSource();s.buffer=this.noiseBuf;const f=c.createBiquadFilter();f.type="bandpass";f.frequency.value=freq||1000;f.Q.value=1.2;const g=c.createGain();
    g.gain.setValueAtTime(vol||0.2,t);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);s.connect(f);f.connect(g);g.connect(this.master);s.start(t);s.stop(t+dur+0.05);}catch(e){}},
  box(f,delay){if(!this.ctx)return;try{const c=this.ctx,t=c.currentTime+(delay||0);[[1,0.2],[2.01,0.055],[3.98,0.022]].forEach(([m,v])=>{const o=c.createOscillator(),g=c.createGain();o.type="sine";o.frequency.value=f*m;g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(v,t+0.005);g.gain.exponentialRampToValueAtTime(0.0001,t+1.3/m);o.connect(g);g.connect(this.master);o.start(t);o.stop(t+1.4);});}catch(e){}},
  play(n){switch(n){
    case"beep":this.tone(660,0.2,"square",0.12);break;
    case"go":this.tone(1320,0.5,"square",0.14);break;
    case"shift":this.noise(0.07,0.1,2200);this.tone(190,0.09,"square",0.05,110);break;
    case"skill":this.tone(1180,0.09,"triangle",0.12);break;
    case"bank":this.tone(880,0.12,"triangle",0.18);this.tone(1320,0.2,"triangle",0.18,null,0.08);this.tone(1760,0.3,"triangle",0.14,null,0.16);break;
    case"trap":this.noise(0.05,0.25,4000);this.tone(1760,0.18,"sine",0.14,null,0.04);break;
    case"break":this.tone(300,0.3,"sawtooth",0.1,120);break;
    case"bump":this.tone(150,0.18,"square",0.16,80);this.noise(0.15,0.25,500);break;
    case"lap":this.tone(990,0.15,"triangle",0.2);this.tone(1320,0.28,"triangle",0.2,null,0.12);break;
    case"fanfare":[523,659,784,1047].forEach((f,i)=>this.tone(f,0.3,"triangle",0.22,null,i*0.14));this.tone(1047,1.0,"triangle",0.2,null,0.62);this.tone(784,1.0,"triangle",0.12,null,0.62);break;}}
};


/* ---------- one-time CSS: Horizon look (default) + storybook modifier ---------- */
function gpCss(){if(document.getElementById("gpV4Css"))return;const s=document.createElement("style");s.id="gpV4Css";s.textContent=`
.fz-pic{position:relative;display:block;width:100%;aspect-ratio:2.4;overflow:hidden;border-radius:10px;background:linear-gradient(#5f8fd0,#c9dcf0 55%,#4a5a3c 56%,#2b3524)}
.fz-pic i{position:absolute;left:50%;top:5%;height:90%;aspect-ratio:var(--ar,1.74);transform:translateX(-50%);overflow:hidden;filter:drop-shadow(0 10px 8px rgba(0,0,0,.45))}
.fz-pic img{display:block;height:100%;width:auto;margin-left:-100%}
.story .fz-pic{background:linear-gradient(#e3f1ef,#f7f0e1);border:2px solid #2b2735}
.fz-paint-note{display:none;text-align:center;color:#cdd6e6;font-size:14px;margin-top:12px}
.fz-shell.pic .fz-paints{display:none}.fz-shell.pic .fz-paint-note{display:block}
.fz-intro{position:fixed;inset:0;z-index:4000;background:#000;display:flex;align-items:center;justify-content:center;opacity:1;transition:opacity .3s}
.fz-intro.out{opacity:0;pointer-events:none}
.fz-intro video{width:100%;height:100%;object-fit:contain;background:#000}
.fz-intro .fz-skip{position:absolute;right:max(18px,env(safe-area-inset-right));bottom:max(18px,env(safe-area-inset-bottom));padding:16px 34px;font:900 italic 26px/1 system-ui,sans-serif;letter-spacing:.04em;color:#fff;background:rgba(255,45,135,.9);border:3px solid #fff;border-radius:40px;box-shadow:0 8px 30px rgba(0,0,0,.6);cursor:pointer;touch-action:manipulation}
.fz-intro .fz-skip:active{transform:scale(.96)}
.fz-intro .fz-tag{position:absolute;left:max(18px,env(safe-area-inset-left));top:max(14px,env(safe-area-inset-top));color:#fff;font:900 italic 22px/1 system-ui,sans-serif;text-shadow:0 2px 12px #000;opacity:.9}
.fz-head{position:relative;text-align:center;padding:26px 8px 14px;margin:-10px -12px 12px;border-radius:17px 17px 0 0;background:#0a0d18 center 38%/cover no-repeat;overflow:hidden}
.fz-head::before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,13,24,.15),rgba(10,13,24,.35) 60%,#10152a 100%)}
.fz-head>*{position:relative}
.fz-logo{display:block;width:min(560px,82%);height:auto;margin:0 auto;filter:drop-shadow(0 8px 18px rgba(0,0,0,.55))}
.fz-head .fz-sub{margin-top:10px;text-shadow:0 2px 8px #000}
.fz-shell.story .fz-head{background-image:none!important;background:#efe6d3;padding-top:14px}.fz-shell.story .fz-head::before{display:none}
.fz-shell{position:relative;background:linear-gradient(170deg,#141a2e,#0a0d18 60%,#1a0f2a);border:1px solid rgba(255,255,255,.12);border-radius:18px;padding:10px 12px 16px;margin-top:8px!important;box-shadow:0 20px 50px rgba(0,0,0,.45);color:#fff;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
.fz-title{font-size:clamp(30px,6.5vw,54px);font-weight:900;font-style:italic;letter-spacing:.02em;line-height:1;color:#fff;text-transform:uppercase;text-shadow:0 3px 14px rgba(0,0,0,.5)}
.fz-title em{font-style:italic;background:linear-gradient(90deg,#ff2d87,#ff7a00);-webkit-background-clip:text;background-clip:text;color:transparent}
.fz-sub{margin-top:6px;font-size:12px;letter-spacing:.24em;font-weight:800;color:#ffd2e6;text-transform:uppercase}
.fz-cars{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px}
.fz-car{position:relative;display:flex;flex-direction:column;gap:6px;padding:12px;border-radius:16px;border:2px solid rgba(255,255,255,.14);background:linear-gradient(160deg,#1c2238,#0b0f1e);color:#fff;font-family:inherit;text-align:left;cursor:pointer;transition:transform .15s,border-color .15s}
.fz-car:hover{transform:translateY(-2px)}
.fz-car.on{border-color:#ff2d87;box-shadow:0 0 0 3px rgba(255,45,135,.3),0 10px 30px rgba(255,45,135,.25)}
.fz-car canvas{width:100%;height:auto;border-radius:10px;background:linear-gradient(#5f8fd0,#c9dcf0 55%,#4a5a3c 56%,#2b3524)}
.fz-car b{font-size:17px;font-style:italic;text-transform:uppercase}
.fz-car small{font-size:11px;color:#cdd6e6;line-height:1.3}
.fz-cls{position:absolute;top:18px;left:18px;display:flex;font-weight:900;font-size:12px;border-radius:5px;overflow:hidden}
.fz-cls i{font-style:normal;background:#ff2d87;padding:2px 6px}.fz-cls em{font-style:normal;background:#fff;color:#111;padding:2px 6px}
.fz-bar{display:flex;align-items:center;gap:6px;font-size:10px;font-weight:800;color:#e9dbff;text-transform:uppercase}
.fz-bar i{width:58px;flex:none;font-style:normal}.fz-bar s{flex:1;height:6px;border-radius:3px;background:rgba(255,255,255,.12);overflow:hidden;text-decoration:none}.fz-bar em{display:block;height:100%;border-radius:3px;background:linear-gradient(90deg,#ff7a00,#ff2d87)}
.fz-paints{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-top:12px}
.fz-sw{width:40px;height:40px;border-radius:50%;border:3px solid rgba(255,255,255,.3);cursor:pointer}
.fz-sw.on{border-color:#fff;box-shadow:0 0 0 3px #ff2d87}
.fz-route{display:flex;flex-direction:column;gap:6px;padding:10px;border-radius:16px;border:2px solid rgba(255,255,255,.14);background:linear-gradient(160deg,#1c2238,#0b0f1e);color:#fff;font-family:inherit;cursor:pointer;text-align:left}
.fz-route:hover{border-color:#ff2d87}
.fz-route canvas{width:100%;height:auto;border-radius:10px}
.fz-route b{font-size:16px;font-style:italic;text-transform:uppercase}.fz-route small{font-size:12px;color:#cdd6e6}
.fz-card{background:rgba(20,24,44,.72)!important;color:#f3eaff!important;border:1px solid rgba(255,45,135,.3)!important}
.fz-card p{color:#dcd6ea!important}
.fz-mode{display:flex;gap:10px;justify-content:center;margin:0 0 12px;flex-wrap:wrap}
.fz-mode button{font:inherit;font-size:15px;font-weight:800;padding:10px 16px;border-radius:14px;border:2px solid rgba(255,255,255,.2);background:rgba(255,255,255,.06);color:#fff;cursor:pointer}
.fz-mode button.on{background:linear-gradient(90deg,#ff2d87,#ff7a00);border-color:transparent}
.gp3-wrap.v3{--tach:clamp(118px,14vw,172px);position:relative;max-width:min(1600px,calc((100vh - 70px)*16/9));width:100%;margin:0 auto;aspect-ratio:16/9;border-radius:14px;overflow:hidden;background:#000;border:2px solid rgba(255,255,255,.18);box-shadow:0 20px 50px rgba(0,0,0,.5);touch-action:none;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
@supports (height:100dvh){.gp3-wrap.v3{max-width:min(1600px,calc((100dvh - 70px)*16/9))}}
.gp3-wrap.v3 canvas#gp3c{display:block;width:100%;height:100%}
.gp3-wrap.v3 canvas.fz-fx{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:2}
.gp3-wrap.v3 .gp3-touch{position:absolute;top:0;left:0;width:50%;height:100%;z-index:1;touch-action:none}.gp3-wrap.v3 .gp3-touch.right{left:50%}
.fz-vig{position:absolute;inset:0;pointer-events:none;z-index:2;background:radial-gradient(ellipse at 50% 50%,transparent 60%,rgba(0,0,0,.42))}
.fz-tl{position:absolute;left:14px;top:10px;z-index:3;color:#fff;pointer-events:none;text-shadow:0 2px 8px rgba(0,0,0,.6)}
.fz-pos{font-size:clamp(40px,5.4vw,64px);font-weight:900;font-style:italic;line-height:.9}
.fz-pos small{font-size:.42em;margin-left:1px}.fz-pos em{font-size:.36em;font-style:italic;color:#ffc2dc;margin-left:6px}
.fz-lap{margin-top:4px;font-size:clamp(12px,1.4vw,15px);font-weight:900;font-style:italic;letter-spacing:.08em;background:linear-gradient(90deg,#ff2d87,#ff7a00);display:inline-block;padding:2px 10px;border-radius:3px;transform:skewX(-12deg)}
.fz-time{font-size:clamp(15px,1.8vw,20px);font-weight:800;font-variant-numeric:tabular-nums;margin-top:3px}
.gp3-wrap.v3 .gp3-map{position:absolute;left:14px;top:clamp(118px,13.5vw,146px);width:clamp(96px,11vw,136px);aspect-ratio:150/110;height:auto;z-index:3;border-radius:12px;border:2px solid rgba(255,255,255,.3);background:rgba(10,12,25,.5);pointer-events:none}
.fz-skill{position:absolute;left:14px;top:48%;z-index:3;pointer-events:none;color:#fff;min-width:150px;opacity:0;transition:opacity .2s;text-shadow:0 2px 8px rgba(0,0,0,.7)}
.fz-skill.on{opacity:1}
.fz-skill .pts{font-size:clamp(22px,2.8vw,32px);font-weight:900;font-style:italic;line-height:1}
.fz-skill .mul{display:inline-block;margin-left:8px;font-size:.6em;background:#ff2d87;padding:1px 7px;border-radius:4px;vertical-align:middle}
.fz-skill .row{font-size:clamp(11px,1.2vw,13px);font-weight:800;letter-spacing:.06em;color:#ffd6e8;text-transform:uppercase;margin-top:2px}
.fz-skill .row:first-of-type{color:#fff}
.fz-tach{position:absolute;right:10px;bottom:calc(clamp(70px,7.8vw,94px) + 22px);width:var(--tach);height:var(--tach);z-index:3;pointer-events:none}
.fz-btn{position:absolute;right:12px;z-index:6;width:42px;height:42px;border-radius:50%;border:2px solid rgba(255,255,255,.35);background:rgba(10,12,25,.55);color:#fff;font-size:19px;display:grid;place-items:center;cursor:pointer;touch-action:manipulation;padding:0}
.fz-btn.mute{top:10px}.fz-btn.quit{top:60px}
.gp3-wrap.v3 .gp3-msg{position:absolute;left:50%;top:17%;transform:translateX(-50%) skewX(-10deg);z-index:4;padding:6px 18px;font-size:clamp(15px,2.2vw,24px);font-weight:900;font-style:italic;letter-spacing:.04em;color:#fff;background:linear-gradient(90deg,rgba(255,45,135,.92),rgba(255,122,0,.92));border-radius:4px;opacity:0;transition:opacity .25s;pointer-events:none;white-space:nowrap;text-transform:uppercase}
.gp3-wrap.v3 .gp3-msg.show{opacity:1}
.gp3-wrap.v3 .gp3-count{position:absolute;left:50%;top:27%;transform:translate(-50%,-50%);z-index:5;font-size:clamp(40px,7.5vw,76px);font-weight:900;font-style:italic;color:#fff;text-shadow:0 0 30px #ff2d87,0 6px 20px #000;opacity:0;pointer-events:none}
.gp3-wrap.v3 .gp3-count.show{opacity:1}
.gp3-wrap.v3 .gp3-card{position:absolute;left:50%;top:8%;bottom:auto;height:auto;width:max-content;max-width:80%;transform:translateX(-50%);z-index:4;padding:5px 14px;text-align:center;color:#fff;background:rgba(10,12,25,.72);border-left:4px solid #ff2d87;border-radius:4px;transition:opacity .6s;pointer-events:none;white-space:nowrap}
.gp3-wrap.v3 .gp3-card b{display:block;font-size:clamp(13px,1.7vw,19px);font-style:italic;text-transform:uppercase}.gp3-wrap.v3 .gp3-card small{font-size:10px;color:#ffd2e6;letter-spacing:.1em;text-transform:uppercase}
.gp3-wrap.v3 .gp3-card.hide{opacity:0}
.gp3-pad{position:absolute;bottom:12px;display:flex;gap:clamp(8px,1.2vw,14px);z-index:5;align-items:flex-end}
.gp3-pad.l{left:12px}.gp3-pad.r{right:12px}
.gp3-wrap.v3 .race-btn{width:clamp(70px,7.8vw,94px);height:clamp(70px,7.8vw,94px);border-radius:50%;border:2px solid rgba(255,255,255,.4);background:rgba(10,12,25,.45);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);color:#fff;font-size:clamp(24px,3vw,34px);touch-action:none;display:grid;place-items:center;padding:0;font-family:inherit;cursor:pointer;user-select:none;-webkit-user-select:none}
.gp3-wrap.v3 .race-btn.txt{font-size:clamp(11px,1.3vw,14px);font-weight:900;font-style:italic;letter-spacing:.04em}
.gp3-wrap.v3 .race-btn.brake{background:rgba(160,20,40,.55)}
.gp3-wrap.v3 .race-btn.drift{background:linear-gradient(135deg,rgba(255,45,135,.8),rgba(255,122,0,.8))}
.gp3-wrap.v3 .race-btn.on{background:#fff;color:#111}
.gp3-wrap.v3 .gp3-finish{position:absolute;inset:0;z-index:8;display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(135deg,rgba(40,5,40,.88),rgba(10,8,25,.9));color:#fff;text-align:center;padding:10px}
.fz-fin-t{font-size:clamp(30px,6vw,56px);font-weight:900;font-style:italic;background:linear-gradient(90deg,#ff2d87,#ff7a00);-webkit-background-clip:text;background-clip:text;color:transparent}
.fz-res{margin:8px 0;min-width:min(420px,90%);font-size:clamp(12px,1.6vw,15px)}
.fz-res div{display:grid;grid-template-columns:38px 1fr 1fr;gap:8px;padding:4px 10px;text-align:left;border-bottom:1px solid rgba(255,255,255,.08);font-weight:700}
.fz-res div.me{background:linear-gradient(90deg,rgba(255,45,135,.5),rgba(255,122,0,.3));font-weight:900}
.fz-res i{font-style:italic}
.fz-fin-s{font-weight:800;color:#ffd2e6;margin-top:2px}
.gp3-wrap.v3.done .gp3-pad,.gp3-wrap.v3.done .fz-btn,.gp3-wrap.v3.done .fz-skill,.gp3-wrap.v3.done .fz-tach{display:none}
.fz-quit-row{margin-top:8px}
.fz-song{margin-top:6px;display:flex;align-items:center;gap:5px;background:rgba(10,12,25,.55);border:1px solid rgba(255,255,255,.3);border-radius:10px;padding:3px 8px;font-size:clamp(13px,1.5vw,17px);width:max-content}
.fz-song b{font-weight:700;margin-right:3px}
.fz-song i{width:11px;height:11px;border-radius:50%;border:2px solid #fff;display:inline-block;background:transparent}
.fz-song i.on{background:var(--c)}
/* ---- phones: the race takes over the whole screen ---- */
@media (max-height:520px),(orientation:portrait) and (max-width:600px){
.gp3-wrap.v3{position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;max-width:none!important;aspect-ratio:auto!important;margin:0!important;border:0!important;border-radius:0!important;z-index:9000;--tach:96px}
@supports (height:100dvh){.gp3-wrap.v3{height:100dvh!important}}
.gp3-wrap.v3 ~ .fz-quit-row{display:none}
.fz-tl{left:calc(8px + env(safe-area-inset-left));top:calc(6px + env(safe-area-inset-top))}
.fz-pos{font-size:36px}.fz-lap{font-size:11px}.fz-time{font-size:14px}
.gp3-wrap.v3 .gp3-map{top:calc(92px + env(safe-area-inset-top));left:calc(8px + env(safe-area-inset-left));width:84px}
.fz-skill{left:calc(8px + env(safe-area-inset-left));min-width:120px}
.fz-skill .pts{font-size:22px}.fz-skill .row{font-size:10px}
.fz-tach{right:calc(6px + env(safe-area-inset-right));bottom:calc(74px + env(safe-area-inset-bottom))}
.fz-btn{width:36px;height:36px;font-size:16px;right:calc(8px + env(safe-area-inset-right))}
.fz-btn.mute{top:calc(8px + env(safe-area-inset-top))}.fz-btn.quit{top:calc(50px + env(safe-area-inset-top))}
.gp3-pad{bottom:calc(10px + env(safe-area-inset-bottom));gap:8px}.gp3-pad.l{left:calc(10px + env(safe-area-inset-left))}.gp3-pad.r{right:calc(10px + env(safe-area-inset-right))}
.gp3-wrap.v3 .race-btn{width:58px;height:58px;font-size:22px}
.gp3-wrap.v3 .race-btn.txt{font-size:10px}
.gp3-wrap.v3 .gp3-msg{font-size:15px;top:24%}
.gp3-wrap.v3 .gp3-count{font-size:44px;top:24%}
.gp3-wrap.v3 .gp3-card{padding:6px 14px}.gp3-wrap.v3 .gp3-card b{font-size:16px}
.fz-fin-t{font-size:30px}.fz-res{font-size:12px}.gp3-wrap.v3 .gp3-finish .btn{padding:8px 12px;font-size:14px}
.fz-song{font-size:12px;padding:2px 6px}.fz-song i{width:8px;height:8px}
}
@media (max-height:520px){.gp3-wrap.v3{--tach:84px}.fz-skill{top:46%}.fz-pos{font-size:30px}.gp3-wrap.v3 .gp3-map{width:70px;top:calc(96px + env(safe-area-inset-top))}.gp3-wrap.v3 .race-btn{width:54px;height:54px}}
@media (orientation:portrait) and (max-width:600px){.fz-skill{top:32%}.gp3-wrap.v3 .gp3-finish .btn-row{flex-direction:column;gap:8px}}
/* ---- storybook (ink & wash) modifier ---- */
.fz-shell.story,.gp3-wrap.v3.story{font-family:"Patrick Hand","Chalkboard SE","Comic Sans MS",system-ui,sans-serif}
.fz-shell.story{background:#efe6d3;border:3px solid #2b2735;box-shadow:6px 6px 0 rgba(0,0,0,.25);color:#2b2735}
.fz-shell.story .fz-title{color:#2b2735;text-shadow:3px 3px 0 #e8604c;font-style:normal;letter-spacing:.04em}.fz-shell.story .fz-title em{background:none;-webkit-text-fill-color:#2b2735;color:#2b2735}
.fz-shell.story .fz-sub{color:#6b6076}
.fz-shell.story .fz-car,.fz-shell.story .fz-route{background:#f7f0e1;color:#2b2735;border:3px solid #2b2735;box-shadow:4px 4px 0 rgba(0,0,0,.3)}
.fz-shell.story .fz-car.on{border-color:#e8604c;box-shadow:0 0 0 3px #e8604c,4px 4px 0 rgba(0,0,0,.3)}
.fz-shell.story .fz-car canvas{background:linear-gradient(#e3f1ef,#f7f0e1);border:2px solid #2b2735}
.fz-shell.story .fz-car b,.fz-shell.story .fz-route b{font-style:normal;font-size:19px}
.fz-shell.story .fz-car small,.fz-shell.story .fz-route small{color:#5b5566}
.fz-shell.story .fz-route canvas{border:2px solid #2b2735}
.fz-shell.story .fz-bar{color:#2b2735}.fz-shell.story .fz-bar s{background:rgba(43,39,53,.15)}.fz-shell.story .fz-bar em{background:#e8604c}
.fz-shell.story .fz-cls i{background:#e8604c;color:#fff}.fz-shell.story .fz-cls em{background:#2b2735;color:#fff}
.fz-shell.story .fz-sw{border-color:#2b2735}.fz-shell.story .fz-sw.on{box-shadow:0 0 0 3px #e8604c}
.fz-shell.story .fz-card{background:#f7f0e1!important;color:#2b2735!important;border:3px solid #2b2735!important}.fz-shell.story .fz-card p{color:#3d3747!important}
.fz-shell.story .fz-mode button{font-size:19px;border:3px solid #2b2735;background:#f7f0e1;color:#2b2735;box-shadow:3px 3px 0 rgba(0,0,0,.3)}.fz-shell.story .fz-mode button.on{background:#e8604c;color:#fff}
.gp3-wrap.v3.story{border:3px solid #2b2735;background:#f7f0e1}
.gp3-wrap.v3.story .fz-vig,.gp3-wrap.v3.story canvas.fz-fx{display:none}
.gp3-wrap.v3.story .fz-tl{color:#2b2735;text-shadow:none}
.gp3-wrap.v3.story .fz-pos{color:#2b2735;font-style:normal;text-shadow:2px 2px 0 #f7f0e1}.gp3-wrap.v3.story .fz-pos em{color:#6b6076}
.gp3-wrap.v3.story .fz-lap{background:#e8604c;color:#fff;transform:none;border:2px solid #2b2735;font-style:normal}
.gp3-wrap.v3.story .fz-time{color:#2b2735;background:rgba(247,240,225,.9);display:inline-block;padding:0 6px;border-radius:6px;margin-left:4px;border:2px solid #2b2735}
.gp3-wrap.v3.story .fz-song{background:rgba(247,240,225,.92);border:2px solid #2b2735;color:#2b2735}.gp3-wrap.v3.story .fz-song i{border-color:#2b2735}
.gp3-wrap.v3.story .fz-skill{color:#2b2735;text-shadow:0 0 6px #f7f0e1,0 0 2px #f7f0e1}.gp3-wrap.v3.story .fz-skill .row{color:#5b4f66}.gp3-wrap.v3.story .fz-skill .row:first-of-type{color:#2b2735}.gp3-wrap.v3.story .fz-skill .mul{background:#e8604c;color:#fff}
.gp3-wrap.v3.story .gp3-map{background:rgba(247,240,225,.9);border:2px solid #2b2735}
.gp3-wrap.v3.story .fz-btn{background:#f7f0e1;color:#2b2735;border:2px solid #2b2735}
.gp3-wrap.v3.story .gp3-msg{background:#f7f0e1;color:#2b2735;border:3px solid #2b2735;transform:translateX(-50%) rotate(-2deg);font-style:normal;box-shadow:3px 3px 0 rgba(0,0,0,.25);text-transform:none}
.gp3-wrap.v3.story .gp3-count{color:#f7f0e1;text-shadow:4px 4px 0 #2b2735;font-style:normal}
.gp3-wrap.v3.story .gp3-card{background:#f7f0e1;color:#2b2735;border:3px solid #2b2735;border-left:8px solid #e8604c}.gp3-wrap.v3.story .gp3-card b{font-style:normal}.gp3-wrap.v3.story .gp3-card small{color:#6b6076}
.gp3-wrap.v3.story .race-btn{background:rgba(247,240,225,.78);color:#2b2735;border:3px solid #2b2735;-webkit-backdrop-filter:none;backdrop-filter:none}
.gp3-wrap.v3.story .race-btn.txt{font-style:normal;font-size:clamp(13px,1.5vw,17px)}
.gp3-wrap.v3.story .race-btn.brake{background:rgba(232,96,76,.85);color:#fff}
.gp3-wrap.v3.story .race-btn.drift{background:rgba(242,193,78,.92);color:#2b2735}
.gp3-wrap.v3.story .race-btn.on{background:#2b2735;color:#f7f0e1}
.gp3-wrap.v3.story .gp3-finish{background:rgba(247,240,225,.95);color:#2b2735}
.gp3-wrap.v3.story .fz-fin-t{background:none;color:#2b2735;-webkit-text-fill-color:#2b2735;font-style:normal;text-shadow:3px 3px 0 #f2c14e}
.gp3-wrap.v3.story .fz-res div{border-bottom:1px dashed rgba(43,39,53,.3)}.gp3-wrap.v3.story .fz-res div.me{background:#f2c14e}
.gp3-wrap.v3.story .fz-fin-s{color:#5b4f66}
`;document.head.appendChild(s);if(gpStory()&&!document.getElementById("gpFont")){const l=document.createElement("link");l.id="gpFont";l.rel="stylesheet";l.href="https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap";document.head.appendChild(l);}}

/* ---------- menus: car select → route select → race ---------- */
function gpStop(){
  document.querySelectorAll(".fz-intro").forEach(e=>{try{const v=e.querySelector("video");if(v){v.pause();v.removeAttribute("src");v.load();}}catch(x){}e.remove();});
  if(window._gpPrev){try{window._gpPrev.r.dispose();window._gpPrev.r.forceContextLoss();}catch(e){}window._gpPrev=null;}
  if(!R3)return;
  if(R3.raf)cancelAnimationFrame(R3.raf);
  window.removeEventListener("keydown",R3.kd);window.removeEventListener("keyup",R3.ku);window.removeEventListener("resize",R3.onResize);
  window.removeEventListener("orientationchange",R3.onOrient);document.removeEventListener("visibilitychange",R3.onVis);
  if(R3.blockTouch){document.removeEventListener("touchmove",R3.blockTouch);document.removeEventListener("gesturestart",R3.blockTouch);}
  GPA.stopEngine();
  try{const seen=new Set();R3.scene.traverse(o=>{if(o.geometry&&!seen.has(o.geometry)){seen.add(o.geometry);o.geometry.dispose();}
    const ms=Array.isArray(o.material)?o.material:(o.material?[o.material]:[]);ms.forEach(m=>{if(seen.has(m))return;seen.add(m);["map","emissiveMap","alphaMap"].forEach(k=>{if(m[k]&&!seen.has(m[k])){seen.add(m[k]);m[k].dispose();}});m.dispose();});});}catch(e){}
  try{if(R3.envRT)R3.envRT.dispose();}catch(e){}
  try{if(R3.post)R3.post.dispose();}catch(e){}
  try{R3.renderer.dispose();R3.renderer.forceContextLoss();}catch(e){}
  R3=null;
}
function gpHead(sub){return '<div class="fz-head" style="background-image:url('+GP_WORLD.hero+')"><img class="fz-logo" src="'+GP_WORLD.logo+'" alt="Grand Fable Horizon" decoding="async"><div class="fz-sub">'+sub+'</div></div>';}
function gpShellClass(){return "fadein fz-shell"+(gpStory()?" story":"");}
function renderRace(){
  clearTimers();closeOverlay();defocus();showAnanseCorner(false);gpStop();
  if(typeof kdWebgl==="function"&&!kdWebgl()){renderRace2D();return;}
  gpCss();document.body.classList.add("learningworld");
  const sel=gpCar().id,paint=gpPaint();
  const cards=GP_CARS.map(c=>'<button class="fz-car'+(c.id===sel?" on":"")+'" data-car="'+c.id+'" onclick="gpPickCar(\''+c.id+'\')">'+(GP_PICS[c.id]?'<span class="fz-pic"><i style="--ar:'+(GP_PICS[c.id].fw/GP_PICS[c.id].fh).toFixed(3)+'"><img src="'+GP_PICS[c.id].src+'" alt="'+esc(c.n)+'" decoding="async"></i></span>':'<canvas width="480" height="200" data-prev="'+c.id+'"></canvas>')+'<span class="fz-cls"><i>'+c.cls+'</i><em>'+c.pi+'</em></span><b>'+esc(c.n)+'</b>'
    +'<span class="fz-bar"><i>Speed</i><s><em style="width:'+(c.speed*20)+'%"></em></s></span><span class="fz-bar"><i>Handling</i><s><em style="width:'+(c.handle*20)+'%"></em></s></span><span class="fz-bar"><i>Launch</i><s><em style="width:'+(c.accel*20)+'%"></em></s></span>'
    +'<small>'+esc(c.bio)+'</small></button>').join("");
  const sw=GP_PAINTS.map(h=>'<button class="fz-sw'+(h===paint?" on":"")+'" style="background:'+h+'" data-paint="'+h+'" onclick="gpPickPaint(\''+h+'\')" aria-label="Paint colour"></button>').join("");
  app.innerHTML='<div class="'+gpShellClass()+(GP_PICS[sel]?" pic":"")+'" id="fzShell" style="max-width:980px;margin:0 auto;padding:0 8px">'
   +gpHead("Japan · choose your car")
   +'<div class="fz-cars">'+cards+'</div>'
   +'<div class="fz-paints">'+sw+'</div><div class="fz-paint-note">📸 This car comes in its own colour.</div>'
   +'<div class="center" style="margin-top:14px"><button class="btn big" onclick="renderCircuits()">Next: choose a route ▶</button></div>'
   +'<div class="btn-row" style="margin-top:12px"><button class="btn secondary" onclick="'+(P?'renderHome()':'renderProfiles()')+'">⟵ Back</button><button class="btn secondary" style="font-size:14px" onclick="renderRace2D()">Classic 2D racer</button></div><div class="spacer"></div></div>';
  gpDrawPreviews();
  loadThree().then(gpDrawPreviews).catch(()=>{});
  say("Grand Fable Horizon! Choose your car.");
}
function gpDrawPreviews(){if(!window.THREE)return;const pc=gpCar().id,pp=gpPaint();document.querySelectorAll("canvas[data-prev]").forEach(cv=>{const c=GP_CARS.find(x=>x.id===cv.dataset.prev);if(c)gpCarDraw(cv,c,c.id===pc?pp:c.paint);});}
function gpPickCar(id){if(P){P.gpCar=id;save();}else window._gpCar=id;document.querySelectorAll(".fz-car").forEach(b=>b.classList.toggle("on",b.dataset.car===id));const sh=$("fzShell");if(sh)sh.classList.toggle("pic",!!GP_PICS[id]);gpDrawPreviews();sfx("tick");}
function gpPickPaint(h){if(P){P.gpPaint=h;save();}else window._gpPaint=h;document.querySelectorAll(".fz-sw").forEach(b=>b.classList.toggle("on",b.dataset.paint===h));gpDrawPreviews();sfx("tick");}
function gpPickRacer(id){gpPickCar(GP_CARS.some(c=>c.id===id)?id:"falcon");}
function gpMode(){return (P&&P.gpMode)||window._gpMode||"free";}
function gpPace(){return (P&&P.gpPace)||window._gpPace||"gentle";}
function gpPickPace(v){if(P){P.gpPace=v;save();}else window._gpPace=v;document.querySelectorAll(".fz-pace button").forEach(b=>b.classList.toggle("on",b.dataset.p===v));sfx("tick");}
function gpPaceMul(){const g=gpPace()==="gentle";return gpMode()==="free"?(g?0.55:0.72):(g?0.68:0.85);}
function gpPickMode(m){if(P){P.gpMode=m;save();}else window._gpMode=m;document.querySelectorAll(".fz-mode.fz-m button").forEach(b=>b.classList.toggle("on",b.dataset.m===m));sfx("tick");}
function gpPickLook(v){if(P){P.gpLook=v;save();}else window._gpLook=v;sfx("tick");renderCircuits();}
function renderCircuits(){
  clearTimers();closeOverlay();showAnanseCorner(false);gpStop();gpCss();
  const best=P&&P.race?P.race:{};
  app.innerHTML='<div class="'+gpShellClass()+'" id="fzShell" style="max-width:980px;margin:0 auto;padding:0 8px">'
   +gpHead(esc(gpCar().n)+" · choose a route")
   +'<div class="fz-mode fz-pace"><button data-p="gentle" class="'+(gpPace()==="gentle"?"on":"")+'" onclick="gpPickPace(\'gentle\')">🐢 Gentle speed</button><button data-p="normal" class="'+(gpPace()==="normal"?"on":"")+'" onclick="gpPickPace(\'normal\')">🚗 Normal speed</button></div>'
   +'<div class="fz-mode fz-m"><button data-m="free" class="'+(gpMode()==="free"?"on":"")+'" onclick="gpPickMode(\'free\')">🎵 Free drive: collect the music</button><button data-m="race" class="'+(gpMode()==="race"?"on":"")+'" onclick="gpPickMode(\'race\')">🏁 Race: beat 4 rivals</button></div>'
   +'<div class="fz-mode fz-look"><button class="'+(gpStory()?"":"on")+'" onclick="gpPickLook(\'real\')">🗻 Realistic look</button><button class="'+(gpStory()?"on":"")+'" onclick="gpPickLook(\'story\')">🖌️ Storybook look</button></div>'
   +'<div class="fz-cars">'+GP_CIRCUITS.map((c,i)=>'<button class="fz-route" onclick="startRace3D(\''+c.id+'\')"><canvas id="gpMini'+i+'" width="220" height="150"></canvas><b>'+esc(c.name)+'</b><small>'+esc(c.look.time)+' · '+c.laps+' laps'+(best[c.id]&&best[c.id].time?' · best '+gpFmt(best[c.id].time)+' · '+gpOrd(best[c.id].place):'')+(best[c.id]&&best[c.id].skill?' · skill '+gpNum(best[c.id].skill):'')+(best[c.id]&&best[c.id].notes?' · 🎵 '+best[c.id].notes+' notes':'')+'</small></button>').join("")+'</div>'
   +'<div class="card fz-card" style="margin-top:14px"><b>How to play</b><p style="margin-top:6px">🎵 <b>Free drive</b>: cruise Japan and drive through the floating music notes. Every 8 notes makes a tune, and at the end you can play your whole song.<br>🏁 <b>Race</b>: beat 4 rivals. Score skill points for drifting, near misses, passing and clean driving.<br>◀ ▶ steer · BRAKE slows down · hold DRIFT while turning to slide. The car speeds up on its own. Keyboard: ← → steer, ↓ brake, Space drift, M mute, Esc quit.</p></div>'
   +'<div class="btn-row" style="margin-top:12px"><button class="btn secondary" onclick="renderRace()">⟵ Cars</button><button class="btn secondary" onclick="gpIntro(true)">🎬 Watch the intro</button></div><div class="spacer"></div></div>';
  GP_CIRCUITS.forEach((c,i)=>gpDrawMini($("gpMini"+i),c,null));
  say("Choose a route.");
}
function gpDrawMini(cv,c,karts){
  if(!cv)return;const x=cv.getContext("2d");x.clearRect(0,0,cv.width,cv.height);const story=gpStory();
  const xs=c.pts.map(p=>p[0]),zs=c.pts.map(p=>p[1]);const minX=Math.min(...xs)-15,maxX=Math.max(...xs)+15,minZ=Math.min(...zs)-15,maxZ=Math.max(...zs)+15;
  const sx=cv.width/(maxX-minX),sz=cv.height/(maxZ-minZ),s=Math.min(sx,sz);const ox=(cv.width-(maxX-minX)*s)/2,oz=(cv.height-(maxZ-minZ)*s)/2;
  const map=(px,pz)=>[ox+(px-minX)*s,oz+(pz-minZ)*s];
  if(!c._mini){const P0=c.pts,n=P0.length,pts=[];for(let i=0;i<n;i++){const a=P0[(i-1+n)%n],b=P0[i],cc=P0[(i+1)%n],d=P0[(i+2)%n];for(let t=0;t<1;t+=0.1){const t2=t*t,t3=t2*t;pts.push([0.5*((2*b[0])+(-a[0]+cc[0])*t+(2*a[0]-5*b[0]+4*cc[0]-d[0])*t2+(-a[0]+3*b[0]-3*cc[0]+d[0])*t3),0.5*((2*b[1])+(-a[1]+cc[1])*t+(2*a[1]-5*b[1]+4*cc[1]-d[1])*t2+(-a[1]+3*b[1]-3*cc[1]+d[1])*t3)]);}}c._mini=pts;}
  const pts=c._mini;
  if(!karts){x.fillStyle=story?"#e3eee9":"#1b2234";x.fillRect(0,0,cv.width,cv.height);if(!story){x.fillStyle="#f4f7fb";x.beginPath();x.moveTo(cv.width*0.62,18);x.lineTo(cv.width*0.74,4);x.lineTo(cv.width*0.86,18);x.closePath();x.fill();x.fillStyle="#7d8fb5";x.beginPath();x.moveTo(cv.width*0.5,30);x.lineTo(cv.width*0.74,4);x.lineTo(cv.width*0.98,30);x.closePath();x.fill();x.fillStyle="#f4f7fb";x.beginPath();x.moveTo(cv.width*0.665,12);x.lineTo(cv.width*0.74,4);x.lineTo(cv.width*0.815,12);x.closePath();x.fill();}}
  x.lineCap="round";x.lineJoin="round";x.strokeStyle=story?"#2b2735":"rgba(255,255,255,.35)";x.lineWidth=karts?cv.width/26:9;x.beginPath();pts.forEach((p,i)=>{const m=map(p[0],p[1]);i?x.lineTo(m[0],m[1]):x.moveTo(m[0],m[1]);});x.closePath();x.stroke();
  x.strokeStyle=story?"#f2c14e":"#fff";x.lineWidth=karts?cv.width/80:3.5;x.stroke();
  const P0=c.pts;const st=map(P0[0][0],P0[0][1]);x.fillStyle="#fff";x.fillRect(st[0]-4,st[1]-4,8,8);x.fillStyle="#111";x.fillRect(st[0]-4,st[1]-4,4,4);x.fillRect(st[0],st[1],4,4);
  if(karts)karts.forEach(k=>{const p=k.pos;const m=map(p.x,p.z);x.fillStyle=k.player?"#ff2d87":k.racer.css;const rr=cv.width/(k.player?24:34);x.beginPath();x.arc(m[0],m[1],rr,0,7);x.fill();x.strokeStyle=k.player?"#fff":"rgba(0,0,0,.5)";x.lineWidth=cv.width/90;x.stroke();});
}
/* ---------- textures drawn on canvases ---------- */
function gpCanvasTex(w,h,draw,repeat){const cv=document.createElement("canvas");cv.width=w;cv.height=h;draw(cv.getContext("2d"),w,h);const t=new THREE.CanvasTexture(cv);if(repeat){t.wrapS=t.wrapT=THREE.RepeatWrapping;}t.anisotropy=window._gpAniso||4;if(THREE.sRGBEncoding)t.encoding=THREE.sRGBEncoding;return t;}
function gpTextTex(text,bg,fg,w,h,size){return gpCanvasTex(w||512,h||128,(x,W,H)=>{if(Array.isArray(bg)){const g=x.createLinearGradient(0,0,W,0);bg.forEach((c,i)=>g.addColorStop(i/(bg.length-1),c));x.fillStyle=g;}else x.fillStyle=bg;x.fillRect(0,0,W,H);x.fillStyle=fg;x.font="italic 900 "+(size||64)+"px system-ui";x.textAlign="center";x.textBaseline="middle";x.shadowColor="rgba(0,0,0,.4)";x.shadowBlur=6;x.fillText(text,W/2,H/2+2);});}
function gpSoftDot(){return gpCanvasTex(64,64,(x,w,h)=>{const g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,"rgba(255,255,255,1)");g.addColorStop(0.35,"rgba(255,255,255,.7)");g.addColorStop(1,"rgba(255,255,255,0)");x.fillStyle=g;x.fillRect(0,0,w,h);});}
function gpAoTex(){return gpCanvasTex(128,128,(x,w,h)=>{x.clearRect(0,0,w,h);x.save();x.translate(64,64);x.scale(1,1);const g=x.createRadialGradient(0,0,0,0,0,64);g.addColorStop(0,"rgba(255,255,255,1)");g.addColorStop(0.5,"rgba(255,255,255,.96)");g.addColorStop(0.72,"rgba(255,255,255,.55)");g.addColorStop(1,"rgba(255,255,255,0)");x.fillStyle=g;x.beginPath();x.ellipse(0,0,64,64,0,0,7);x.fill();x.restore();});}
function gpRimTex(){return gpCanvasTex(128,128,(x,w,h)=>{x.clearRect(0,0,w,h);const c=64;x.fillStyle="#17181c";x.beginPath();x.arc(c,c,62,0,7);x.fill();
  const g=x.createRadialGradient(c,c,10,c,c,60);g.addColorStop(0,"#d9dde3");g.addColorStop(0.7,"#aeb4bd");g.addColorStop(1,"#6d737c");x.fillStyle=g;x.beginPath();x.arc(c,c,62,0,7);x.arc(c,c,54,0,7,true);x.fill();
  x.fillStyle=g;for(let k=0;k<5;k++){const a=k*Math.PI*2/5;x.save();x.translate(c,c);x.rotate(a);x.beginPath();x.moveTo(-9,0);x.lineTo(-5,-56);x.lineTo(5,-56);x.lineTo(9,0);x.closePath();x.fill();x.restore();}
  x.fillStyle="#2a2d33";x.beginPath();x.arc(c,c,12,0,7);x.fill();x.fillStyle="#c0c5cc";x.beginPath();x.arc(c,c,7,0,7);x.fill();});}
/* ---------- the car: a smooth lofted hull, glass canopy, lights, diffuser, rims ---------- */
function gpLoft(T,stations,closed,caps){
  const N=stations.length,K=stations[0].length;const pos=[],idx=[];
  stations.forEach(st=>st.forEach(p=>pos.push(p[0],p[1],p[2])));
  const KK=closed?K:K-1;
  for(let i=0;i<N-1;i++)for(let j=0;j<KK;j++){const j2=(j+1)%K;const a=i*K+j,b=i*K+j2,c=(i+1)*K+j,d=(i+1)*K+j2;idx.push(a,b,c,b,d,c);}
  if(caps)[0,N-1].forEach((i,e)=>{const st=stations[i];let cx=0,cy=0,cz=0;st.forEach(p=>{cx+=p[0];cy+=p[1];cz+=p[2];});cx/=K;cy/=K;cz/=K;const ci=pos.length/3;pos.push(cx,cy,cz);for(let j=0;j<KK;j++){const a=i*K+j,b=i*K+(j+1)%K;if(e===0)idx.push(ci,b,a);else idx.push(ci,a,b);}});
  const g=new T.BufferGeometry();g.setAttribute("position",new T.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return g;}
function gpSmooth(arr,passes){let a=arr.slice();for(let p=0;p<passes;p++){const b=a.slice();for(let i=1;i<a.length-1;i++)b[i]=(a[i-1]+a[i]*2+a[i+1])/4;a=b;}return a;}
function gpLerpKeys(keys,z){if(z<=keys[0][0])return keys[0][1];for(let i=1;i<keys.length;i++){if(z<=keys[i][0]){const t=(z-keys[i-1][0])/(keys[i][0]-keys[i-1][0]);return keys[i-1][1]+(keys[i][1]-keys[i-1][1])*t;}}return keys[keys.length-1][1];}
function gpCarGeo(T,S){
  const hl=S.len/2,N=44,K=26,ss=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};
  const zs=[];for(let i=0;i<N;i++)zs.push(-hl+(i/(N-1))*S.len);
  const topKeys=[[-hl,S.tail-0.08],[-hl+0.25,S.tail],[S.cabR-0.35,S.deck],[S.cabR,S.belt],[S.cabF,S.hood],[hl-0.8,S.nose+0.1],[hl-0.2,S.nose],[hl,S.nose-0.12]];
  const top=gpSmooth(zs.map(z=>gpLerpKeys(topKeys,z)),2);
  const hip=S.hip||0;const hw=z=>(S.w/2)*(1-0.11*ss(0.45,1,z/hl)-0.09*ss(0.6,1,-z/hl)+hip*Math.exp(-Math.pow((z-S.xr)/0.9,2))+hip*0.5*Math.exp(-Math.pow((z-S.xf)/0.8,2)));
  const bot=z=>S.ride+0.12*ss(0.72,1,Math.abs(z)/hl);
  const stations=zs.map((z,i)=>{const w=hw(z),yb=bot(z),yt=top[i],yc=(yb+yt)/2,hh=(yt-yb)/2,ring=[];
    for(let j=0;j<K;j++){const a=j/K*Math.PI*2,c=Math.cos(a),s=Math.sin(a),n=s>0?3.1:6;let x=w*Math.sign(c)*Math.pow(Math.abs(c),2/n),y=yc+hh*Math.sign(s)*Math.pow(Math.abs(s),2/n);if(y>yc)x*=1-0.16*((y-yc)/hh);ring.push([x,y,z]);}return ring;});
  const body=gpLoft(T,stations,true,true);
  // glass canopy
  const CN=16,CK=13,cz=[];for(let i=0;i<CN;i++)cz.push(S.cabR+(i/(CN-1))*(S.cabF-S.cabR));
  const roofKeys=[[S.cabR,S.belt+0.02],[S.roofR,S.roof],[S.roofF,S.roof],[S.cabF,S.hood+0.02]];
  const cTop=gpSmooth(cz.map(z=>gpLerpKeys(roofKeys,z)),2);
  const cab=cz.map((z,i)=>{const base=gpLerpKeys(topKeys,z)-0.05,h=Math.max(0.03,cTop[i]-base),w=hw(z)*0.84-0.03,ring=[];
    for(let j=0;j<CK;j++){const a=j/(CK-1)*Math.PI,c=Math.cos(a),s=Math.sin(a);ring.push([w*Math.sign(c)*Math.pow(Math.abs(c),1/1.25),base+h*Math.pow(Math.abs(s),1/1.3),z]);}return ring;});
  const glass=gpLoft(T,cab,false,false);
  return{body,glass,hw,hl};}
function gpCarMats(T,paint,shared){const M=shared;
  const body=new T.MeshPhysicalMaterial({color:new T.Color(paint),metalness:0.06,roughness:0.32,clearcoat:1,clearcoatRoughness:0.12,envMapIntensity:0.9});
  const tail=new T.MeshStandardMaterial({color:0xff2020,emissive:0xff0a0a,emissiveIntensity:0.9,roughness:0.3,metalness:0.1});
  return{body,tail,...M};}
function gpCarShared(T){return{
  dark:new T.MeshStandardMaterial({color:0x0c0d10,roughness:0.5,metalness:0.4}),
  glass:new T.MeshStandardMaterial({color:0x2c4259,roughness:0.14,metalness:0.6,envMapIntensity:1.8}),
  lamp:new T.MeshStandardMaterial({color:0xffffff,emissive:0xfff8e8,emissiveIntensity:1.6,roughness:0.1}),
  tyre:new T.MeshStandardMaterial({color:0x121214,roughness:0.92,metalness:0}),
  rim:new T.MeshStandardMaterial({map:gpRimTex(),transparent:true,roughness:0.3,metalness:0.8,envMapIntensity:1.2}),
  caliper:new T.MeshStandardMaterial({color:0xd0202a,roughness:0.5}),
  chrome:new T.MeshStandardMaterial({color:0xe0e4ea,roughness:0.15,metalness:1}),
  blob:gpSoftDot(),ao:gpAoTex()};}
function gpBuildCar(T,car,paint,shared){
  const S=GP_SHAPE[car.type],G=gpCarGeo(T,S),mats=gpCarMats(T,paint,shared),g=new T.Group(),b=new T.Group();g.add(b);
  const add=(geo,mat,x,y,z,rx,ry,rz,par)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);if(rx)m.rotation.x=rx;if(ry)m.rotation.y=ry;if(rz)m.rotation.z=rz;m.castShadow=true;(par||b).add(m);return m;};
  add(G.body,mats.body,0,0,0);const gl=add(G.glass,mats.glass,0,0,0);gl.castShadow=false;
  const hl=G.hl,w=S.w,dark=mats.dark;
  // front: splitter, grille, slim LED headlights
  add(new T.BoxGeometry(w*0.96,0.06,0.5),dark,0,S.ride+0.05,hl-0.18);
  add(new T.BoxGeometry(w*0.5,Math.max(0.12,S.nose-S.ride-0.3),0.12),dark,0,(S.ride+S.nose)/2,hl-0.03);
  [-1,1].forEach(sd=>{const m=add(new T.BoxGeometry(0.46,0.07,0.12),mats.lamp,sd*w*0.3,S.nose-0.14,hl-0.04);m.rotation.y=sd*0.35;m.rotation.z=sd*0.12;
    add(new T.BoxGeometry(0.2,0.1,0.14),mats.body,sd*(G.hw(S.cabF)+0.12),S.hood+0.18,S.cabF+0.1);add(new T.BoxGeometry(0.05,0.04,0.12),dark,sd*(G.hw(S.cabF)+0.03),S.hood+0.14,S.cabF+0.1);
    add(new T.BoxGeometry(0.1,0.1,(S.xf-S.xr)-0.9),dark,sd*(w/2-0.06),S.ride+0.06,(S.xf+S.xr)/2);});
  // rear: LED light bar, diffuser with fins, exhausts, wing
  add(new T.BoxGeometry(w*0.9,0.08,0.1),mats.tail,0,S.tail-0.17,-hl-0.02);add(new T.BoxGeometry(w*0.92,0.14,0.06),dark,0,S.tail-0.17,-hl+0.01);
  [-1,1].forEach(sd=>{add(new T.CylinderGeometry(0.07,0.07,0.08,12),mats.tail,sd*w*0.36,S.tail-0.2,-hl-0.02,Math.PI/2);});
  add(new T.BoxGeometry(w*0.9,0.26,0.46),dark,0,S.ride+0.12,-hl+0.1);for(let k=-2;k<=2;k++)add(new T.BoxGeometry(0.035,0.3,0.54),dark,k*0.26,S.ride+0.14,-hl+0.12);
  [-1,1].forEach(sd=>{add(new T.CylinderGeometry(0.06,0.065,0.3,10),mats.chrome,sd*0.42,S.ride+0.2,-hl-0.08,Math.PI/2);});
  if(S.wing==="big"){add(new T.BoxGeometry(w*0.98,0.045,0.42),dark,0,S.tail+0.42,-hl+0.4);[-0.5,0.5].forEach(x=>add(new T.BoxGeometry(0.05,0.46,0.26),dark,x,S.tail+0.2,-hl+0.42));[-1,1].forEach(sd=>add(new T.BoxGeometry(0.04,0.22,0.42),mats.body,sd*w*0.49,S.tail+0.52,-hl+0.4));}
  if(S.wing==="duck")add(new T.BoxGeometry(w*0.84,0.05,0.26),dark,0,S.tail+0.02,-hl+0.18,-0.3);
  if(S.wing==="lip")add(new T.BoxGeometry(w*0.8,0.04,0.22),mats.body,0,S.tail+0.01,-hl+0.12,-0.2);
  if(S.wing==="roof")add(new T.BoxGeometry(w*0.7,0.04,0.3),mats.body,0,S.roof+0.08,S.roofR-0.1,0.25);
  // wheels: tyre + textured rim + caliper, with a dark arch ring on the body
  const wheels=[],steers=[];
  [[1,S.xf,S.rad,S.tyreW],[-1,S.xf,S.rad,S.tyreW],[1,S.xr,S.radR,S.tyreWR],[-1,S.xr,S.radR,S.tyreWR]].forEach(([sd,z,rad,tw])=>{const hx=G.hw(z)-tw/2+0.03;const hub=new T.Group();hub.position.set(sd*hx,rad,z);g.add(hub);const wg=new T.Group();hub.add(wg);
    const ty=new T.Mesh(new T.CylinderGeometry(rad,rad,tw,24),mats.tyre);ty.rotation.z=Math.PI/2;ty.castShadow=true;wg.add(ty);
    const rm=new T.Mesh(new T.CircleGeometry(rad*0.7,24),mats.rim);rm.position.x=sd*(tw/2+0.004);rm.rotation.y=sd*Math.PI/2;wg.add(rm);
    const cal=new T.Mesh(new T.BoxGeometry(0.06,0.3,0.12),mats.caliper);cal.position.set(sd*(tw/2-0.08),0,-rad*0.55);hub.add(cal);
    const arch=new T.Mesh(new T.CylinderGeometry(rad+0.1,rad+0.1,0.05,22),dark);arch.rotation.z=Math.PI/2;arch.position.set(sd*(G.hw(z)-0.0),rad+0.02,z);arch.castShadow=false;g.add(arch);
    wg.userData.rad=rad;wheels.push(wg);if(z>0)steers.push(hub);});
  const blob=new T.Mesh(new T.PlaneGeometry(w*1.5,S.len*1.2),new T.MeshBasicMaterial({map:shared.blob,color:0x000000,transparent:true,opacity:0.42,depthWrite:false}));blob.material.userData.lin=1;blob.rotation.x=-Math.PI/2;blob.position.y=0.04;g.add(blob);
  return{g,body:b,wheels,steers,tailMat:mats.tail,bodyMat:mats.body,S,xr:S.xr,hw:G.hw};}
/* ---------- real car pictures ---------- */
/* Loads every car sheet once (lazily, only when the racer opens). Resolves with a map id → texture
   or null when a picture failed; a null means that car keeps its 3D model. */
function gpLoadPics(){
  if(!window.THREE)return Promise.resolve({});
  const T=THREE;window._gpPics=window._gpPics||{};const L=new T.TextureLoader();
  return Promise.all(Object.keys(GP_PICS).map(id=>new Promise(res=>{
    if(window._gpPics[id]!==undefined)return res();
    L.load(GP_PICS[id].src,t=>{if(T.sRGBEncoding)t.encoding=T.sRGBEncoding;t.magFilter=T.LinearFilter;const gl2=!!(window.WebGL2RenderingContext&&document.createElement("canvas").getContext("webgl2"));t.minFilter=gl2?T.LinearMipmapLinearFilter:T.LinearFilter;t.generateMipmaps=gl2;t.anisotropy=window._gpAniso||4;window._gpPics[id]=t;res();},undefined,()=>{window._gpPics[id]=null;res();});
  }))).then(()=>window._gpPics);
}
function gpLoadWorld(){
  if(!window.THREE)return Promise.resolve({});
  const T=THREE,W=window._gpWorld=window._gpWorld||{},L=new T.TextureLoader();
  const gl2=!!(window.WebGL2RenderingContext&&document.createElement("canvas").getContext("webgl2"));
  const tex=(k,rep,pot)=>new Promise(res=>{if(W[k]!==undefined)return res();L.load(GP_WORLD[k].src,t=>{if(T.sRGBEncoding)t.encoding=T.sRGBEncoding;if(rep)t.wrapS=t.wrapT=T.RepeatWrapping;const mip=gl2||pot;t.generateMipmaps=mip;t.minFilter=mip?T.LinearMipmapLinearFilter:T.LinearFilter;t.anisotropy=window._gpAniso||4;W[k]=t;res();},undefined,()=>{W[k]=null;res();});});
  const img=new Promise(res=>{if(W.speedo!==undefined)return res();const im=new Image();im.onload=()=>{W.speedo=im;res();};im.onerror=()=>{W.speedo=null;res();};im.src=GP_WORLD.speedo.src;});
  return Promise.all([tex("sky",false,false),tex("props",false,false),tex("rail",true,true),tex("road",true,true),img]).then(()=>W);
}
/* A picture car: one upright plane that turns to face the camera (Out Run style), showing the
   nose-right / straight / nose-left frame chosen from the car's angle to the line of sight.
   Physics, collisions and the soft contact shadow are exactly the same as the 3D cars. */
function gpBuildPicCar(T,car,tex,shared){
  const S=GP_SHAPE[car.type],D=GP_PICS[car.id],g=new T.Group(),b=new T.Group();g.add(b);
  const t=tex.clone();t.needsUpdate=true;t.repeat.set(1/D.frames,1);t.offset.set(1/D.frames,0);
  const w=D.fw/D.ppm,h=D.fh/D.ppm;
  const mat=new T.MeshBasicMaterial({map:t,transparent:true,alphaTest:0.08,side:T.DoubleSide,depthWrite:true,color:shared.carTint||0xffffff});mat.toneMapped=false;mat.userData.lin=1;
  const pl=new T.Mesh(new T.PlaneGeometry(w,h),mat);pl.position.set(0,h/2+0.012,-0.1);pl.castShadow=false;pl.receiveShadow=false;b.add(pl);
  // contact shadow: a dense dark core the size of the car's footprint that softens outwards, so the picture sits on the road
  const blob=new T.Mesh(new T.PlaneGeometry(S.w*1.6,S.len*1.0),new T.MeshBasicMaterial({map:shared.ao,color:0x000000,transparent:true,opacity:0.86,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}));blob.material.userData.lin=1;blob.rotation.x=-Math.PI/2;blob.position.y=0.03;blob.position.z=-0.3;g.add(blob);
  return{g,body:b,wheels:[],steers:[],tailMat:{emissiveIntensity:0.9},bodyMat:mat,S,xr:S.xr,hw:z=>S.w/2,pic:{pl,t,D,frame:1,side:0,flameT:0}};}
function gpWrapAng(a){while(a>Math.PI)a-=Math.PI*2;while(a<-Math.PI)a+=Math.PI*2;return a;}
/* per frame: face the camera and pick the frame */
function gpPicUpdate(kt,dt,camPos,inp){
  const pc=kt.pic,V=R3.tmpV;kt.g.getWorldDirection(V);const carYaw=Math.atan2(V.x,V.z);
  const losYaw=Math.atan2(kt.g.position.x-camPos.x,kt.g.position.z-camPos.z);
  let rel=gpWrapAng(carYaw-losYaw);                 // + = nose turned to the viewer's left
  if(kt.player)rel=-(inp*0.36+(kt.sv||0)*0.12+(kt.drift||0)*0.4); // straight unless the player steers or slides (never yawed while parked)
  pc.pl.rotation.y=gpWrapAng(losYaw+Math.PI-carYaw);
  const on=0.26,off=0.14;                           // the side frames show a ~30° view, so only use them past ~15°; hysteresis so the frame does not flicker
  if(pc.side===0){if(rel>on)pc.side=1;else if(rel<-on)pc.side=-1;}else if(Math.abs(rel)<off||Math.sign(rel)!==pc.side)pc.side=rel>on?1:(rel<-on?-1:0);
  if(pc.flameT>0)pc.flameT-=dt;
  const f=(pc.side===1?2:(pc.side===-1?0:1))+(pc.flameT>0&&pc.D.frames>=6?3:0);
  if(f!==pc.frame){pc.frame=f;pc.t.offset.x=f/pc.D.frames;}
}
function gpFlame(kt,sec){if(kt&&kt.pic)kt.pic.flameT=Math.max(kt.pic.flameT,sec);}
/* cinematic intro: plays once per session before the first race (or on demand from the routes
   screen) with a big SKIP button; muted when the app's sound is off. */
function gpIntro(force){
  return new Promise(res=>{
    if(window._gpIntroDone&&!force)return res();window._gpIntroDone=true;
    if(P&&typeof P.gpMute==="boolean")GPA.muted=P.gpMute;
    gpCss();const ov=document.createElement("div");ov.className="fz-intro";
    ov.innerHTML='<video playsinline webkit-playsinline preload="auto" disablepictureinpicture></video><div class="fz-tag">GRAND FABLE HORIZON · JAPAN</div><button class="fz-skip" aria-label="Skip intro">SKIP ▶</button>';
    document.body.appendChild(ov);const v=ov.querySelector("video");v.muted=!!GPA.muted||!(typeof DB!=="undefined"&&DB&&DB.sound);v.volume=0.9;v.src=GP_INTRO;
    let over=false;const done=()=>{if(over)return;over=true;clearTimeout(to);try{v.pause();}catch(e){}ov.classList.add("out");setTimeout(()=>{try{v.removeAttribute("src");v.load();}catch(e){}ov.remove();},320);res();};
    v.addEventListener("ended",done);v.addEventListener("error",done);v.addEventListener("stalled",()=>{if(v.currentTime<0.2)setTimeout(()=>{if(!over&&v.currentTime<0.2)done();},4000);});
    ov.querySelector(".fz-skip").addEventListener("click",ev=>{ev.preventDefault();sfx("tick");done();});
    const to=setTimeout(done,16000);
    const p=v.play();if(p&&p.catch)p.catch(()=>{v.muted=true;const q=v.play();if(q&&q.catch)q.catch(done);});
  });
}
/* menu preview: a tiny offscreen 3D render of the real car model */
function gpPreview(){if(window._gpPrev)return window._gpPrev;if(!window.THREE)return null;try{const T=THREE;const cv=document.createElement("canvas");cv.width=480;cv.height=200;
  const r=new T.WebGLRenderer({canvas:cv,antialias:true,alpha:true});r.setPixelRatio(1);if(T.sRGBEncoding)r.outputEncoding=T.sRGBEncoding;r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=1.05;r.shadowMap.enabled=true;
  const scene=new T.Scene();scene.add(new T.HemisphereLight(0xcfe0f5,0x4a5a3c,0.9));const sun=new T.DirectionalLight(0xfff0d8,1.6);sun.position.set(4,6,3);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);scene.add(sun);
  let env=null;try{const pm=new T.PMREMGenerator(r);const eq=gpCanvasTex(128,64,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,"#6ea0dc");g.addColorStop(0.45,"#dfe9f3");g.addColorStop(0.52,"#8a9470");g.addColorStop(1,"#2f3a22");x.fillStyle=g;x.fillRect(0,0,w,h);x.fillStyle="rgba(255,255,255,.95)";x.fillRect(0,20,w,8);});eq.mapping=T.EquirectangularReflectionMapping;env=pm.fromEquirectangular(eq);pm.dispose();eq.dispose();scene.environment=env.texture;}catch(e){}
  const floor=new T.Mesh(new T.CircleGeometry(4,32),new T.MeshStandardMaterial({color:0x4b5540,roughness:1}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
  const cam=new T.PerspectiveCamera(26,2.4,0.1,60);cam.position.set(6.4,2.3,5.4);cam.lookAt(0,0.5,0);
  const shared=gpCarShared(T);window._gpPrev={r,scene,cam,cv,env,shared,cur:null};return window._gpPrev;}catch(e){return null;}}
function gpCarDraw(cv,car,paint){if(!cv||!window.THREE||!car)return;const pv=gpPreview();if(!pv){return;}
  try{if(pv.cur){pv.scene.remove(pv.cur.g);pv.cur.g.traverse(o=>{if(o.geometry)o.geometry.dispose();});}
    const m=gpBuildCar(THREE,car,paint,pv.shared);m.g.rotation.y=-0.55;pv.scene.add(m.g);pv.cur=m;pv.r.render(pv.scene,pv.cam);
    const x=cv.getContext("2d");x.clearRect(0,0,cv.width,cv.height);x.drawImage(pv.cv,0,0,cv.width,cv.height);}catch(e){}}
/* One draw call of camera-facing photo props: an instanced quad per prop with its atlas cell, size and
   mirror flag; the vertex shader turns each quad about Y towards the camera. Photo colours are shown as
   they are (like the picture cars) with the scene fog mixed in; a soft blob under each one grounds it. */
function gpBillboards(T,scene,atlas,BB,fogCol,near,far,tint,blobTex){
  if(!BB.length)return;const cells=GP_WORLD.props.cells,AW=GP_WORLD.props.w,AH=GP_WORLD.props.h,n=BB.length;
  const base=new T.PlaneGeometry(1,1);base.translate(0,0.5,0);const g=new T.InstancedBufferGeometry();g.index=base.index;g.attributes.position=base.attributes.position;g.attributes.uv=base.attributes.uv;
  const pos=new Float32Array(n*3),size=new Float32Array(n*2),uv=new Float32Array(n*4),lum=new Float32Array(n);
  const dummy=new T.Object3D(),blobs=new T.InstancedMesh(new T.PlaneGeometry(1,1).rotateX(-Math.PI/2),new T.MeshBasicMaterial({map:blobTex,color:0x000000,transparent:true,opacity:0.4,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}),n);blobs.material.userData.lin=1;
  BB.forEach((b,i)=>{const c=cells[b[0]]||cells.cherry;const h=c.m*b[4],w=h*c.w/c.h;pos[i*3]=b[1];pos[i*3+1]=b[2]-0.05;pos[i*3+2]=b[3];size[i*2]=b[5]?-w:w;size[i*2+1]=h;
    uv[i*4]=c.x/AW;uv[i*4+1]=1-(c.y+c.h)/AH;uv[i*4+2]=c.w/AW;uv[i*4+3]=c.h/AH;lum[i]=0.9+((i*37)%7)/7*0.18;
    dummy.position.set(b[1],b[2]+0.02,b[3]);dummy.rotation.set(0,0,0);dummy.scale.set(w*0.9,1,w*0.55);dummy.updateMatrix();blobs.setMatrixAt(i,dummy.matrix);});
  g.setAttribute("iPos",new T.InstancedBufferAttribute(pos,3));g.setAttribute("iSize",new T.InstancedBufferAttribute(size,2));g.setAttribute("iUV",new T.InstancedBufferAttribute(uv,4));g.setAttribute("iLum",new T.InstancedBufferAttribute(lum,1));
  const mat=new T.ShaderMaterial({uniforms:{map:{value:atlas},fogColor:{value:fogCol},fogNear:{value:near},fogFar:{value:far},tint:{value:tint}},side:T.DoubleSide,
    vertexShader:"attribute vec3 iPos;attribute vec2 iSize;attribute vec4 iUV;attribute float iLum;varying vec2 vUv;varying float vFog;varying float vLum;void main(){vec3 right=normalize(vec3(viewMatrix[0][0],0.0,viewMatrix[2][0]));vec3 p=iPos+right*(position.x*iSize.x)+vec3(0.0,position.y*iSize.y,0.0);vec4 mv=viewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mv;vUv=vec2(iUV.x+uv.x*iUV.z,iUV.y+uv.y*iUV.w);vFog=-mv.z;vLum=iLum;}",
    fragmentShader:"uniform sampler2D map;uniform vec3 fogColor;uniform float fogNear;uniform float fogFar;uniform vec3 tint;varying vec2 vUv;varying float vFog;varying float vLum;void main(){vec4 c=texture2D(map,vUv);if(c.a<0.45||vFog<3.0)discard;vec3 col=c.rgb*tint*vLum;float f=smoothstep(fogNear,fogFar,vFog);gl_FragColor=vec4(mix(col,fogColor,f),1.0);}"});
  mat.toneMapped=false;const m=new T.Mesh(g,mat);m.frustumCulled=false;scene.add(m);scene.add(blobs);
}
function gpParticles(T,scene,n,size,additive,opacity,tex){
  const g=new T.BufferGeometry();const pos=new Float32Array(n*3),col=new Float32Array(n*3);for(let i=0;i<n;i++)pos[i*3+1]=-999;
  g.setAttribute("position",new T.BufferAttribute(pos,3));g.setAttribute("color",new T.BufferAttribute(col,3));
  const m=new T.PointsMaterial({size,map:tex||gpSoftDot(),vertexColors:true,transparent:true,opacity:opacity||1,depthWrite:false,blending:additive?T.AdditiveBlending:T.NormalBlending,sizeAttenuation:true});
  const pts=new T.Points(g,m);pts.frustumCulled=false;scene.add(pts);
  return{pts,g,pos,col,n,additive,life:new Float32Array(n),max:new Float32Array(n),vel:new Float32Array(n*3),c0:new Float32Array(n*3),next:0,live:0,
    emit(x,y,z,vx,vy,vz,r,gg,b,life){const i=this.next;this.next=(i+1)%this.n;const k=i*3;this.pos[k]=x;this.pos[k+1]=y;this.pos[k+2]=z;this.vel[k]=vx;this.vel[k+1]=vy;this.vel[k+2]=vz;this.c0[k]=r;this.c0[k+1]=gg;this.c0[k+2]=b;this.col[k]=r;this.col[k+1]=gg;this.col[k+2]=b;this.life[i]=life;this.max[i]=life;this.live=1;},
    update(dt,grav){if(!this.live)return;let any=0;for(let i=0;i<this.n;i++){if(this.life[i]<=0)continue;this.life[i]-=dt;const k=i*3;if(this.life[i]<=0){this.pos[k+1]=-999;continue;}any=1;
      this.vel[k+1]-=grav*dt;this.pos[k]+=this.vel[k]*dt;this.pos[k+1]+=this.vel[k+1]*dt;this.pos[k+2]+=this.vel[k+2]*dt;
      const f=this.life[i]/this.max[i];if(this.additive){this.col[k]=this.c0[k]*f;this.col[k+1]=this.c0[k+1]*f;this.col[k+2]=this.c0[k+2]*f;}}
      this.live=any;this.g.attributes.position.needsUpdate=true;this.g.attributes.color.needsUpdate=true;}};
}
/* ---------- the race ---------- */
async function startRace3D(cid){
  clearTimers();closeOverlay();showAnanseCorner(false);gpStop();
  GPA.init(); // inside the tap on a route card, which is what iOS needs to allow sound
  const C=GP_CIRCUITS.find(c=>c.id===cid)||GP_CIRCUITS[0];
  app.innerHTML='<div class="fadein center" style="padding-top:20vh"><div class="ananse-wrap">'+ananseSVG(100,"idle")+'</div><h2 style="color:#fff">Heading to Japan…</h2><p class="muted" style="color:#ffd2e6">Loading '+esc(C.name)+'…</p></div>';
  const fb=()=>startRace2D(cid==="kawaguchi"?"accra":(cid==="tokyo"?"nebula":"skybridge"));
  const intro=gpIntro(false);   // started inside the tap so iOS lets it play with sound
  try{await loadThree();}catch(e){document.querySelectorAll(".fz-intro").forEach(e=>e.remove());toast("3D engine could not load — using the classic racer");fb();return;}
  // car pictures load lazily here (a slow network never holds the race more than a few seconds: cars without a picture use the 3D model)
  if(!gpStory()){try{await Promise.race([Promise.all([gpLoadPics(),gpLoadWorld()]),new Promise(r=>setTimeout(r,7000))]);}catch(e){}}
  await intro;
  if(!app.querySelector("h2"))return;   // the player left while the intro was playing
  try{gpBuild(C);}catch(e){console.error(e);gpStop();toast("3D racer hit a problem — using the classic racer");fb();}
}
function gpBuild(C){
  gpCss();
  const myCar=gpCar(),myPaint=gpPaint(),story=gpStory(),L=story?Object.assign({},C.look,C.story):C.look;
  if(P&&typeof P.gpMute==="boolean")GPA.muted=P.gpMute;GPA.setMute(GPA.muted);
  app.innerHTML='<div class="fadein gp3-wrap v3'+(story?" story":"")+'" id="gp3">'
   +'<canvas id="gp3c"></canvas><canvas class="fz-fx" id="gp3Fx" width="16" height="9"></canvas><div class="fz-vig"></div>'
   +'<div class="gp3-touch" id="gp3L"></div><div class="gp3-touch right" id="gp3R"></div>'
   +'<div class="fz-tl"><div class="fz-pos" id="gp3Pos"'+(gpMode()==="free"?' style="display:none"':'')+'>5<small>th</small><em>/5</em></div><div class="fz-lap" id="gp3Lap">LAP 1/'+C.laps+'</div><div class="fz-time" id="gp3Time">0:00.0</div><div class="fz-song" id="gp3Song"'+(gpMode()==="free"?'':' style="display:none"')+'></div></div>'
   +'<canvas class="gp3-map" id="gp3Map" width="300" height="220"></canvas>'
   +'<div class="fz-skill" id="gp3Skill"></div>'
   +'<canvas class="fz-tach" id="gp3Tach" width="320" height="320"></canvas>'
   +'<button class="fz-btn mute" id="gp3Mute" aria-label="Sound on or off">'+(GPA.muted?"🔇":"🔊")+'</button>'
   +'<button class="fz-btn quit" id="gp3Quit" aria-label="Quit race" onclick="renderCircuits()">✕</button>'
   +'<div class="gp3-msg" id="gp3Msg"></div>'
   +'<div class="gp3-card" id="gp3Card"><b>'+esc(C.name)+'</b><small>'+(gpMode()==="free"?"Free drive · ":"Race · ")+esc(L.time)+' · '+esc(myCar.n)+'</small></div>'
   +'<div class="gp3-count" id="gp3Count"></div>'
   +'<div class="gp3-pad l"><button class="race-btn" id="rcL" aria-label="Steer left">◀</button><button class="race-btn" id="rcR" aria-label="Steer right">▶</button></div>'
   +'<div class="gp3-pad r"><button class="race-btn txt brake" id="rcB" aria-label="Brake">BRAKE</button><button class="race-btn txt drift" id="rcD" aria-label="Drift">DRIFT</button></div>'
   +'</div>'
   +'<div class="center fz-quit-row"><button class="readbtn" onclick="renderCircuits()">⟵ Quit race</button></div>';
  const T=THREE,canvas=$("gp3c"),UP=new T.Vector3(0,1,0);
  const renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:"high-performance"});
  const pr0=Math.min(window.devicePixelRatio||1,2);renderer.setPixelRatio(pr0);
  if(T.sRGBEncoding)renderer.outputEncoding=T.sRGBEncoding;
  if(!story){renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=0.95;}
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
  const aniso=Math.min(8,renderer.capabilities.getMaxAnisotropy?renderer.capabilities.getMaxAnisotropy():4);window._gpAniso=aniso;
  const scene=new T.Scene();
  const WD=story?{}:(window._gpWorld||{}),TINT=new T.Color(L.tint?L.tint[0]:1,L.tint?L.tint[1]:1,L.tint?L.tint[2]:1);
  const bandOn=!!WD.sky,mulHex=(hex,c)=>new T.Color(hex).multiply(c);
  const hazeHex=bandOn?"#"+mulHex(GP_WORLD.sky.haze,TINT).getHexString():L.haze;
  const hazeCol=story?gpLin(L.paper):gpLin(hazeHex);scene.fog=story?new T.Fog(hazeCol,140,820):new T.Fog(hazeCol,bandOn?150:160,bandOn?1000:1150);
  const camera=new T.PerspectiveCamera(60,16/9,0.5,3400);
  const post=story?gpPostSetup(T,renderer,{paper:L.paper,ink:L.ink,night:L.night||0}):null;
  const phone=Math.min(window.screen.width||999,window.screen.height||999,Math.max(innerWidth,innerHeight))<600||Math.min(innerWidth,innerHeight)<520;
  const rnd=(()=>{let s=C.id.length*911+7;return()=>{s=(s*16807)%2147483647;return (s-1)/2147483646;};})();
  // ---- lights: one golden-hour sun with shadows + sky/ground hemisphere ----
  const sunDir=new T.Vector3(L.dir[0],L.dir[1],L.dir[2]).normalize();
  scene.add(new T.HemisphereLight(gpLin(story?L.hor:L.mid),gpLin(C.grass),story?0.95:L.hemi));
  const sun=new T.DirectionalLight(gpLin(L.sun),story?1.05:L.sunI);sun.castShadow=true;
  sun.shadow.mapSize.set(phone?1024:2048,phone?1024:2048);const sc=sun.shadow.camera;sc.left=-40;sc.right=40;sc.top=40;sc.bottom=-40;sc.near=5;sc.far=420;sun.shadow.bias=-0.0004;if("normalBias" in sun.shadow)sun.shadow.normalBias=0.05;
  scene.add(sun);scene.add(sun.target);
  // ---- sky dome: three-stop gradient, sun disc, warm glow around the sun ----
  const skyMat=new T.ShaderMaterial({side:T.BackSide,depthWrite:false,fog:false,
    uniforms:{top:{value:new T.Color(L.top)},mid:{value:bandOn?mulHex(GP_WORLD.sky.top,TINT):new T.Color(story?L.hor:L.mid)},hor:{value:bandOn?mulHex(GP_WORLD.sky.top,TINT):new T.Color(L.hor)},glow:{value:new T.Color(L.glow)},sunDir:{value:sunDir}},
    vertexShader:"varying vec3 vD;void main(){vD=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
    fragmentShader:"uniform vec3 top;uniform vec3 mid;uniform vec3 hor;uniform vec3 glow;uniform vec3 sunDir;varying vec3 vD;void main(){vec3 d=normalize(vD);float h=clamp(d.y,0.0,1.0);vec3 c=h<0.16?mix(hor,mid,smoothstep(0.0,0.16,h)):mix(mid,top,pow(smoothstep(0.16,1.0,h),0.7));float s=max(dot(d,sunDir),0.0);c+=glow*(smoothstep(0.9988,0.9994,s)*1.8+pow(s,70.0)*0.45+pow(s,5.0)*0.16);if(d.y<0.0)c=hor;gl_FragColor=vec4(c,1.0);}"});
  const sky=new T.Mesh(new T.SphereGeometry(2600,32,16),skyMat);sky.renderOrder=-2;sky.frustumCulled=false;scene.add(sky);
  // ---- photo horizon: a camera-following cylinder band with Mount Fuji centred on the start straight ----
  let band=null;if(bandOn){const SK=GP_WORLD.sky,bh=326*SK.mpp;const bm=new T.MeshBasicMaterial({map:WD.sky,transparent:false,blending:T.CustomBlending,blendSrc:T.SrcAlphaFactor,blendDst:T.OneMinusSrcAlphaFactor,blendEquation:T.AddEquation,depthWrite:false,depthTest:false,fog:false,side:T.BackSide,color:TINT.clone()});bm.toneMapped=false;bm.userData.lin=1;   // opaque pass (drawn right after the sky dome), alpha-blended edges
    band=new T.Mesh(new T.CylinderGeometry(SK.r,SK.r,bh,72,1,true),bm);band.renderOrder=-1;band.frustumCulled=false;band.userData.y=SK.horY+(0.5-(1-SK.hor))*bh;band.position.y=band.userData.y;scene.add(band);}
  // ---- reflections for paint and glass: a small painted panorama → PMREM environment ----
  let envRT=null;if(!story){try{const pm=new T.PMREMGenerator(renderer);const gh0="#"+C.grass.toString(16).padStart(6,"0");
    const eq=gpCanvasTex(256,128,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,L.top);g.addColorStop(0.42,L.mid);g.addColorStop(0.5,L.hor);g.addColorStop(0.52,gh0);g.addColorStop(1,"#2a3a22");x.fillStyle=g;x.fillRect(0,0,w,h);
      const sx=((Math.atan2(sunDir.x,-sunDir.z)/(Math.PI*2))+0.5)*w,sy=(0.5-Math.asin(sunDir.y)/Math.PI)*h;const sg=x.createRadialGradient(sx,sy,0,sx,sy,26);sg.addColorStop(0,"rgba(255,250,235,1)");sg.addColorStop(0.3,"rgba(255,235,200,.8)");sg.addColorStop(1,"rgba(255,235,200,0)");x.fillStyle=sg;x.fillRect(0,0,w,h);
      x.fillStyle="rgba(255,255,255,.55)";for(let i=0;i<6;i++){x.fillRect(rnd()*w,h*0.3+rnd()*h*0.12,30+rnd()*50,6);}});
    eq.mapping=T.EquirectangularReflectionMapping;envRT=pm.fromEquirectangular(eq);pm.dispose();eq.dispose();if(envRT&&envRT.texture)scene.environment=envRT.texture;}catch(e){envRT=null;}}
  // ---- terrain: rolling hills, optional mountains, a lake or bay, flat under the road ----
  let cx=0,cz=0;C.pts.forEach(p=>{cx+=p[0];cz+=p[1];});cx/=C.pts.length;cz/=C.pts.length;
  const HA=C.hills||3,ph=C.id.length*1.7,LK=C.lake;
  const lakeF=(x,z)=>{if(!LK)return 0;const dx=(x-cx-LK.x)/LK.rx,dz=(z-cz-LK.z)/LK.rz;const d=Math.sqrt(dx*dx+dz*dz);const t=Math.max(0,Math.min(1,(d-0.72)/0.4));return 1-t*t*(3-2*t);};
  const hgt=(x,z)=>{let h=5+HA*(Math.sin(x*0.011+ph)*Math.cos(z*0.013-ph*0.7)+0.55*Math.sin((x+z)*0.019+ph*1.3)+0.25*Math.cos((x-z)*0.031));
    if(C.mtn)C.mtn.forEach(m=>{const dx=x-cx-m.x,dz=z-cz-m.z;h+=m.h*Math.exp(-(dx*dx+dz*dz)/(m.r*m.r));});
    const lf=lakeF(x,z);return h*(1-lf)+(-7)*lf;};
  const curve=new T.CatmullRomCurve3(C.pts.map(p=>new T.Vector3(p[0],hgt(p[0],p[1]),p[1])),true,"centripetal",0.6);
  const M=720,W=7.6;const len=curve.getLength();
  const samples=[];for(let i=0;i<=M;i++){const t=(i/M)%1;const pos=curve.getPointAt(t);const tan=curve.getTangentAt(t).normalize();const nor=new T.Vector3(-tan.z,0,tan.x).normalize();samples.push({pos,tan,nor});}
  const CELL=24,hash=new Map();for(let i=0;i<M;i++){const p=samples[i].pos;const k=Math.floor(p.x/CELL)+","+Math.floor(p.z/CELL);let l=hash.get(k);if(!l){l=[];hash.set(k,l);}l.push(i);}
  const nearest=(x,z)=>{const cx0=Math.floor(x/CELL),cz0=Math.floor(z/CELL);let bd=1e12,bi=-1;for(let a=-2;a<=2;a++)for(let b=-2;b<=2;b++){const l=hash.get((cx0+a)+","+(cz0+b));if(!l)continue;for(const i of l){const p=samples[i].pos;const d=(p.x-x)*(p.x-x)+(p.z-z)*(p.z-z);if(d<bd){bd=d;bi=i;}}}return[bi,Math.sqrt(bd)];};
  const RW=W+3.2,BL=30;
  const groundAt=(x,z)=>{const n=nearest(x,z);const h=hgt(x,z);if(n[0]<0)return h;const rp=samples[n[0]].pos;const ry=rp.y-0.12;if(n[1]<=RW)return ry;const t=Math.min(1,(n[1]-RW)/BL);const e=t*t*(3-2*t);return ry+(h-ry)*e;};
  const gh="#"+C.grass.toString(16).padStart(6,"0");
  const grassTex=gpCanvasTex(256,256,(x,w,h)=>{x.fillStyle=gh;x.fillRect(0,0,w,h);for(let i=0;i<70;i++){const r=8+rnd()*40;x.fillStyle=rnd()<0.5?"rgba(0,0,0,.06)":"rgba(255,240,160,.07)";x.beginPath();x.arc(rnd()*w,rnd()*h,r,0,7);x.fill();}
    for(let i=0;i<3200;i++){x.fillStyle=rnd()<0.5?"rgba(0,0,0,.1)":"rgba(255,255,190,.08)";x.fillRect(rnd()*w,rnd()*h,1.5,3);}},true);grassTex.repeat.set(140,140);
  const GS=1700,TG=new T.PlaneGeometry(GS,GS,170,170);TG.rotateX(-Math.PI/2);const tp=TG.attributes.position;const tcol=new Float32Array(tp.count*3);
  const cGrass=gpLin(C.grass).multiply(bandOn?new T.Color(0.74,0.74,0.5):new T.Color(1,1,1)),cHigh=gpLin(story?0x6f8f5a:0x4f6b3a),cShore=gpLin(story?0xe9d9b8:0xb8a77c),tmpC=new T.Color();
  for(let i=0;i<tp.count;i++){const x=tp.getX(i)+cx,z=tp.getZ(i)+cz;const y=groundAt(x,z);tp.setXYZ(i,x,y,z);tmpC.copy(cGrass);if(y<1.2)tmpC.lerp(cShore,Math.min(1,(1.2-y)/2));else if(y>12)tmpC.lerp(cHigh,Math.min(1,(y-12)/22));tcol[i*3]=tmpC.r;tcol[i*3+1]=tmpC.g;tcol[i*3+2]=tmpC.b;}
  TG.setAttribute("color",new T.BufferAttribute(tcol,3));TG.computeVertexNormals();
  const ground=new T.Mesh(TG,new T.MeshLambertMaterial({map:grassTex,vertexColors:true}));ground.receiveShadow=true;scene.add(ground);
  const farMat=new T.MeshLambertMaterial({color:story?L.hill:(LK?0x6d93b8:0x5f7050)});const far=new T.Mesh(new T.PlaneGeometry(7000,7000),farMat);far.rotation.x=-Math.PI/2;far.position.set(cx,LK?-1.3:0.5,cz);scene.add(far);
  let water=null,waterTex=null;if(LK){waterTex=gpCanvasTex(256,256,(x,w,h)=>{x.fillStyle=story?"#5cc6c0":"#6d93b8";x.fillRect(0,0,w,h);for(let i=0;i<500;i++){x.fillStyle="rgba(255,255,255,.07)";x.fillRect(rnd()*w,rnd()*h,4,1.5);}x.strokeStyle="rgba(255,255,255,.35)";x.lineWidth=1.5;for(let i=0;i<30;i++){const px=rnd()*w,py=rnd()*h,l=10+rnd()*24;x.beginPath();x.moveTo(px,py);x.quadraticCurveTo(px+l/2,py-3,px+l,py);x.stroke();}},true);waterTex.repeat.set(40,40);
    const wm=story?new T.MeshLambertMaterial({map:waterTex}):new T.MeshStandardMaterial({map:waterTex,roughness:0.12,metalness:0.55,envMapIntensity:1.4});
    water=new T.Mesh(new T.PlaneGeometry(GS,GS),wm);water.rotation.x=-Math.PI/2;water.position.set(cx,-1.1,cz);water.receiveShadow=true;scene.add(water);}
  // ---- Mount Fuji: a huge concave-sided cone with a snow cap and its own haze ----
  const FH=470,FR=780,fx=cx+C.fuji[0],fz=cz+C.fuji[1];
  const prof=[];for(let i=0;i<=26;i++){const h=i/26;prof.push(new T.Vector2(FR*(0.07+0.93*Math.pow(1-h,1.3)),FH*h));}
  const fujiGeo=new T.LatheGeometry(prof,56);
  const fujiMat=new T.ShaderMaterial({fog:false,uniforms:{sunDir:{value:sunDir},haze:{value:story?new T.Color(L.paper):new T.Color(L.haze).lerp(new T.Color(L.mid),0.45)},rockA:{value:new T.Color(story?L.hill:"#283a66")},rockB:{value:new T.Color(story?L.hill:"#52689c")},snow:{value:new T.Color("#ffffff")},sunCol:{value:new T.Color(L.sun)},H:{value:FH},snowLine:{value:0.5},ink:{value:story?1:0}},
    vertexShader:"varying vec3 vN;varying vec3 vP;void main(){vN=normalize(mat3(modelMatrix)*normal);vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
    fragmentShader:"uniform vec3 sunDir;uniform vec3 haze;uniform vec3 rockA;uniform vec3 rockB;uniform vec3 snow;uniform vec3 sunCol;uniform float H;uniform float snowLine;uniform float ink;varying vec3 vN;varying vec3 vP;void main(){float h=vP.y/H;float ang=atan(vP.x,vP.z);float wob=sin(ang*9.0)*0.035+sin(ang*23.0+1.3)*0.02+sin(ang*47.0)*0.012;float sn=smoothstep(snowLine-0.06+wob,snowLine+0.06+wob,h);float gul=0.5+0.5*sin(ang*64.0);vec3 rock=mix(rockA,rockB,h)*(0.88+0.2*gul*(1.0-h));vec3 c=mix(rock,snow*(0.93+0.07*gul),sn);float li=0.7+0.45*max(dot(normalize(vN),sunDir),0.0);c*=li*mix(vec3(1.0),sunCol,0.12);float hz=(0.14+0.4*(1.0-h))*(1.0-ink*0.4)*(1.0-sn*0.7);c=mix(c,haze,hz);gl_FragColor=vec4(c,1.0);}"});
  const fuji=new T.Mesh(fujiGeo,fujiMat);fuji.position.set(fx,-6,fz);if(!bandOn)scene.add(fuji);
  // ---- the road: asphalt with white edge lines and dashed centre line ----
  const ribbon=(inner,outer,mat,yIn,yOut,vScale)=>{const g=new T.BufferGeometry();const v=[],uv=[],idx=[];for(let i=0;i<=M;i++){const s=samples[i];const a=s.pos.clone().addScaledVector(s.nor,inner),b=s.pos.clone().addScaledVector(s.nor,outer);v.push(a.x,s.pos.y+yIn,a.z,b.x,s.pos.y+yOut,b.z);uv.push(0,i*vScale,1,i*vScale);if(i<M){const k=i*2;idx.push(k,k+1,k+2,k+1,k+3,k+2);}}g.setAttribute("position",new T.Float32BufferAttribute(v,3));g.setAttribute("uv",new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();const m=new T.Mesh(g,mat);m.receiveShadow=true;return m;};
  const roadTex=gpCanvasTex(512,512,(x,w,h)=>{if(story){x.fillStyle="#d8c9b4";x.fillRect(0,0,w,h);for(let i=0;i<40;i++){x.fillStyle=rnd()<0.5?"rgba(160,140,120,.07)":"rgba(255,255,255,.1)";x.beginPath();x.arc(rnd()*w,rnd()*h,20+rnd()*50,0,7);x.fill();}x.fillStyle="#f2b92e";x.fillRect(w/2-12,h*0.08,24,h*0.46);x.strokeStyle="#2b2735";x.lineWidth=3;x.strokeRect(w/2-12,h*0.08,24,h*0.46);x.fillStyle="#2b2735";x.fillRect(0,0,9,h);x.fillRect(w-9,0,9,h);x.fillStyle="#f7f2ea";x.fillRect(16,0,8,h);x.fillRect(w-24,0,8,h);return;}
    x.fillStyle="#3a3b3f";x.fillRect(0,0,w,h);for(let i=0;i<14000;i++){const v=42+rnd()*40|0;x.fillStyle="rgba("+v+","+v+","+(v+3)+",.6)";x.fillRect(rnd()*w,rnd()*h,2,2);}
    const gr=x.createLinearGradient(0,0,w,0);[[0,0],[.22,.2],[.36,0],[.64,0],[.78,.2],[1,0]].forEach(s=>gr.addColorStop(s[0],"rgba(10,10,12,"+s[1]+")"));x.fillStyle=gr;x.fillRect(0,0,w,h);
    x.fillStyle="rgba(240,240,236,.9)";x.fillRect(18,0,7,h);x.fillRect(w-25,0,7,h);x.fillStyle="rgba(240,240,236,.85)";x.fillRect(w/2-4,h*0.1,8,h*0.4);},true);
  const roadMat=story?new T.MeshLambertMaterial({map:roadTex}):new T.MeshStandardMaterial({map:WD.road||roadTex,roughness:WD.road?0.78:0.86,metalness:0.05});
  scene.add(ribbon(-W,W,roadMat,0.03,0.03,(len/M)/((WD.road?4:2)*W)));
  const vergeTex=gpCanvasTex(128,128,(x,w,h)=>{x.fillStyle=story?"#e9d9b8":"#7d7a66";x.fillRect(0,0,w,h);if(story){x.fillStyle="#d9785f";x.fillRect(0,0,14,h);x.fillRect(w-14,0,14,h);return;}for(let i=0;i<1200;i++){const v=100+rnd()*70|0;x.fillStyle="rgba("+v+","+(v-6)+","+(v-22)+",.6)";x.fillRect(rnd()*w,rnd()*h,2,2);}},true);
  const vergeMat=new T.MeshLambertMaterial({map:vergeTex});scene.add(ribbon(-W-2.2,-W,vergeMat,-0.06,0.02,0.4));scene.add(ribbon(W,W+2.2,vergeMat,0.02,-0.06,0.4));
  const dummy=new T.Object3D(),shared0=gpCarShared(T);
  const s0=samples[0],sStart=s0.pos.clone();
  const hdgAt=i=>Math.atan2(samples[(i+M)%M].tan.x,samples[(i+M)%M].tan.z),hdgMean=(a,b)=>{let sx=0,sz=0;for(let i=a;i<=b;i++){sx+=Math.sin(hdgAt(i));sz+=Math.cos(hdgAt(i));}return Math.atan2(sx,sz);};const standRanges=[[M-28,M],[0,28]];const inStands=i=>standRanges.some(([a,b])=>i>=a-4&&i<=b+4);
  // ---- guard rails (white steel) with posts, and red-white delineator posts that streak past ----
  const railPic=WD.rail||null;
  const railMat=railPic?new T.MeshStandardMaterial({map:railPic,transparent:true,alphaTest:0.5,side:T.DoubleSide,roughness:0.5,metalness:0.3}):new T.MeshStandardMaterial({color:story?0xd9785f:0xe8e9ea,roughness:0.4,metalness:0.6,side:T.DoubleSide});
  const rail=(off,y0,y1)=>{const g=new T.BufferGeometry();const v=[],uv=[],idx=[];let d=0;for(let i=0;i<=M;i++){const s=samples[i];const a=s.pos.clone().addScaledVector(s.nor,off);const gy=groundAt(a.x,a.z);const hide=inStands(i%M);if(i)d+=samples[i].pos.distanceTo(samples[i-1].pos);const u=d/GP_WORLD.rail.len;v.push(a.x,hide?gy-2:gy+y0,a.z,a.x,hide?gy-2:gy+y1,a.z);uv.push(u,0,u,1);if(i<M){const k=i*2;idx.push(k,k+2,k+1,k+1,k+2,k+3);}}g.setAttribute("position",new T.Float32BufferAttribute(v,3));g.setAttribute("uv",new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();const m=new T.Mesh(g,railMat);m.castShadow=!railPic;return m;};
  [-1,1].forEach(side=>scene.add(railPic?rail(side*(W+2.6),0.0,GP_WORLD.rail.hgt):rail(side*(W+2.6),0.45,0.78)));
  const posts=[];for(let i=0;i<M;i+=4){const s=samples[i];[-1,1].forEach(side=>{const p=s.pos.clone().addScaledVector(s.nor,side*(W+2.6));posts.push([p.x,groundAt(p.x,p.z),p.z]);});}
  const postIM=new T.InstancedMesh(new T.BoxGeometry(0.12,0.8,0.12),new T.MeshLambertMaterial({color:0x9a9ea3}),posts.length);posts.forEach((p,k)=>{dummy.position.set(p[0],p[1]+0.4,p[2]);dummy.rotation.set(0,0,0);dummy.scale.set(1,1,1);dummy.updateMatrix();postIM.setMatrixAt(k,dummy.matrix);});if(!railPic)scene.add(postIM);
  // photo props (trees, lanterns, banners, torii) collect here and become one batch of camera-facing billboards
  const BB=[],bbOn=!!WD.props,bbAdd=(type,x,y,z,s,flip)=>{BB.push([type,x,y,z,s,flip]);};
  const delin=[];for(let i=2;i<M;i+=8){if(inStands(i))continue;const s=samples[i];[-1,1].forEach(side=>{const p=s.pos.clone().addScaledVector(s.nor,side*(W+1.9));delin.push([p.x,groundAt(p.x,p.z),p.z]);});}
  const delTex=gpCanvasTex(16,64,(x,w,h)=>{x.fillStyle="#f4f4f4";x.fillRect(0,0,w,h);x.fillStyle="#d8232a";x.fillRect(0,0,w,14);x.fillRect(0,28,w,10);});
  const delIM=new T.InstancedMesh(new T.CylinderGeometry(0.05,0.05,1.1,6),new T.MeshLambertMaterial({map:delTex}),delin.length);delin.forEach((p,k)=>{dummy.position.set(p[0],p[1]+0.55,p[2]);dummy.updateMatrix();delIM.setMatrixAt(k,dummy.matrix);});scene.add(delIM);
  // ---- torii start gate framing the road, Horizon flags along the start straight ----
  const verm=new T.MeshStandardMaterial({color:0xc8321e,roughness:0.55}),blackM=new T.MeshStandardMaterial({color:0x151417,roughness:0.6});
  const torii=new T.Group();const tw=W+3.6;[-1,1].forEach(sd=>{const pl=new T.Mesh(new T.CylinderGeometry(0.42,0.5,10,12),verm);pl.position.set(sd*tw,5,0);pl.castShadow=true;torii.add(pl);const base=new T.Mesh(new T.CylinderGeometry(0.7,0.75,0.5,12),blackM);base.position.set(sd*tw,0.25,0);torii.add(base);});
  const nuki=new T.Mesh(new T.BoxGeometry(tw*2+1.6,0.5,0.42),verm);nuki.position.set(0,7.9,0);nuki.castShadow=true;torii.add(nuki);
  const kasagi=new T.Mesh(new T.BoxGeometry(tw*2+4.2,0.62,0.62),verm);kasagi.position.set(0,9.75,0);kasagi.castShadow=true;torii.add(kasagi);
  const shimaki=new T.Mesh(new T.BoxGeometry(tw*2+4.4,0.26,0.72),blackM);shimaki.position.set(0,10.2,0);torii.add(shimaki);
  [-1,1].forEach(sd=>{const tip=new T.Mesh(new T.BoxGeometry(1.6,0.6,0.62),verm);tip.position.set(sd*(tw+2.3),10.05,0);tip.rotation.z=sd*0.28;torii.add(tip);});
  const gaku=new T.Mesh(new T.BoxGeometry(1.6,1.2,0.2),blackM);gaku.position.set(0,8.85,0);torii.add(gaku);
  torii.position.copy(sStart);torii.lookAt(sStart.clone().add(s0.tan));scene.add(torii);
  const flagTex=gpCanvasTex(64,128,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,"#ff2d87");g.addColorStop(1,"#7a1fd6");x.fillStyle=g;x.fillRect(0,0,w,h);x.fillStyle="#fff";x.font="900 26px system-ui";x.textAlign="center";x.save();x.translate(32,64);x.rotate(Math.PI/2);x.fillText("HORIZON",0,10);x.restore();});
  const flags=[];for(const [a,b] of [[M-64,M],[0,64]])for(let i=a;i<b;i+=(bbOn?16:8)){const s=samples[i%M];[-1,1].forEach(side=>{const p=s.pos.clone().addScaledVector(s.nor,side*(W+5.2));flags.push([p.x,groundAt(p.x,p.z),p.z,side,s.nor.clone()]);});}
  const fpIM=new T.InstancedMesh(new T.CylinderGeometry(0.05,0.07,6.5,6),new T.MeshStandardMaterial({color:0xdddddd,roughness:0.4,metalness:0.6}),flags.length),flIM=new T.InstancedMesh(new T.PlaneGeometry(1.1,2.6),new T.MeshStandardMaterial({map:flagTex,side:T.DoubleSide,roughness:0.7}),flags.length);
  flags.forEach((f,k)=>{dummy.rotation.set(0,0,0);dummy.scale.set(1,1,1);dummy.position.set(f[0],f[1]+3.25,f[2]);dummy.updateMatrix();fpIM.setMatrixAt(k,dummy.matrix);dummy.position.set(f[0]+f[4].x*0.6*f[3],f[1]+5.1,f[2]+f[4].z*0.6*f[3]);dummy.lookAt(f[0]+f[4].x*5,f[1]+5.1,f[2]+f[4].z*5);dummy.updateMatrix();flIM.setMatrixAt(k,dummy.matrix);});
  fpIM.castShadow=true;flIM.castShadow=true;scene.add(fpIM);scene.add(flIM);
  // ---- lakeside town: tiled hipped roofs, white and timber walls ----
  const winTex=gpCanvasTex(128,128,(x,w,h)=>{x.fillStyle="#fff";x.fillRect(0,0,w,h);x.fillStyle="#2c3a4a";[[20,30],[76,30],[20,78],[76,78]].forEach(q=>{x.fillRect(q[0],q[1],32,30);});x.strokeStyle="#e9e2d3";x.lineWidth=3;[[20,30],[76,30],[20,78],[76,78]].forEach(q=>{x.beginPath();x.moveTo(q[0]+16,q[1]);x.lineTo(q[0]+16,q[1]+30);x.stroke();x.beginPath();x.moveTo(q[0],q[1]+15);x.lineTo(q[0]+32,q[1]+15);x.stroke();});x.fillStyle="#6b4a2e";x.fillRect(50,100,26,28);});
  const wallCols=story?[0xf7f0e1,0xf4e3c3,0xe9f0ee,0xf6d9cf,0xdfe8f5]:[0xf3efe6,0xe8dcc6,0xd9d4c8,0x8a6a48,0xf0ece2],roofCols=story?[0xd9624a,0xc9553f,0xe07a55,0x6d8fb3]:[0x3f4756,0x4a5468,0x2f3542,0x5a5f6b,0x6b4a3a];
  const houses=[];const addHouse=(x,z,ang,sz,hh)=>{const y=groundAt(x,z);if(y<0.8||lakeF(x,z)>0.05)return;houses.push([x,y,z,sz,hh,ang]);};
  if((C.town||C.city)&&(!bbOn||C.city>0.5)){for(let i=0;i<M;i+=6){if(rnd()<0.45||inStands(i))continue;const s=samples[i];const side=rnd()<0.5?-1:1;const p=s.pos.clone().addScaledVector(s.nor,side*(W+(bbOn?22:12)+rnd()*(bbOn?28:22)));addHouse(p.x,p.z,Math.atan2(s.tan.x,s.tan.z)+(rnd()-0.5)*0.3,3+rnd()*2.4,2.6+rnd()*2.2);}}
  if(LK&&C.town){for(let k=0;k<110;k++){const a=rnd()*6.28,r=0.95+rnd()*0.5;const x=cx+LK.x+Math.cos(a)*LK.rx*r,z=cz+LK.z+Math.sin(a)*LK.rz*r;if(nearest(x,z)[1]<W+14)continue;addHouse(x,z,a+Math.PI/2,3+rnd()*3,2.6+rnd()*2.6);}}
  if(houses.length){const hb=new T.InstancedMesh(new T.BoxGeometry(1,1,1),new T.MeshLambertMaterial({map:winTex}),houses.length);const rg=new T.ConeGeometry(0.78,0.62,4);rg.rotateY(Math.PI/4);const hr=new T.InstancedMesh(rg,new T.MeshLambertMaterial({color:0xffffff}),houses.length);
    houses.forEach((h,k)=>{dummy.position.set(h[0],h[1]+h[4]/2,h[2]);dummy.rotation.set(0,h[5],0);dummy.scale.set(h[3],h[4],h[3]*1.25);dummy.updateMatrix();hb.setMatrixAt(k,dummy.matrix);hb.setColorAt(k,gpLin(wallCols[k%wallCols.length]));
      dummy.position.set(h[0],h[1]+h[4]+h[3]*0.3,h[2]);dummy.scale.set(h[3]*1.5,h[3]*0.95,h[3]*1.75);dummy.updateMatrix();hr.setMatrixAt(k,dummy.matrix);hr.setColorAt(k,gpLin(roofCols[k%roofCols.length]));});
    [hb,hr].forEach(m=>{if(m.instanceColor)m.instanceColor.needsUpdate=true;m.castShadow=true;m.receiveShadow=true;scene.add(m);});}
  // ---- hazy city skyline with a red lattice tower ----
  if(C.city){const n=Math.round(110*C.city);const towers=[];const sec=C.id==="tokyo"?{x:0,z:-560,sx:380,sz:110}:{x:430,z:-330,sx:170,sz:120};
    for(let k=0;k<n;k++){const x=cx+sec.x+(rnd()-0.5)*2*sec.sx,z=cz+sec.z+(rnd()-0.5)*2*sec.sz;const mid=1-Math.abs((x-cx-sec.x)/sec.sx);const hgt2=(14+rnd()*30+mid*rnd()*90)*(C.city>0.5?1:0.55);towers.push([x,z,hgt2,8+rnd()*14,8+rnd()*14]);}
    const ctex=gpCanvasTex(64,128,(x,w,h)=>{x.fillStyle="#6c7a8c";x.fillRect(0,0,w,h);for(let r=4;r<h;r+=8)for(let c=4;c<w;c+=8){const lit=rnd()<(0.25+L.night*0.5);x.fillStyle=lit?"rgba(255,235,180,.95)":"rgba(30,40,60,.85)";x.fillRect(c,r,4,5);}},true);
    const cMat=new T.MeshLambertMaterial({map:ctex,emissive:new T.Color(0xffd79a).multiplyScalar(0.35*L.night),emissiveMap:ctex});
    const cIM=new T.InstancedMesh(new T.BoxGeometry(1,1,1),cMat,towers.length);towers.forEach((t,k)=>{const y=groundAt(t[0],t[1]);dummy.position.set(t[0],y+t[2]/2,t[1]);dummy.rotation.set(0,rnd()*0.4,0);dummy.scale.set(t[3],t[2],t[4]);dummy.updateMatrix();cIM.setMatrixAt(k,dummy.matrix);});scene.add(cIM);
    const tx=cx+sec.x-sec.sx*0.25,tz=cz+sec.z;const ty=groundAt(tx,tz);const tower=new T.Group();const tm=new T.MeshLambertMaterial({color:0xe0401e});[[0,28,16],[28,70,8],[70,120,4]].forEach(([y0,y1,r])=>{const m=new T.Mesh(new T.CylinderGeometry(r*0.5,r,y1-y0,8,1,true),tm);m.position.y=(y0+y1)/2;tower.add(m);});
    const deck=new T.Mesh(new T.BoxGeometry(14,5,14),new T.MeshLambertMaterial({color:0xf0f0f0}));deck.position.y=70;tower.add(deck);const spire=new T.Mesh(new T.CylinderGeometry(0.4,1.2,40,6),tm);spire.position.y=140;tower.add(spire);tower.position.set(tx,ty,tz);scene.add(tower);}
  // ---- trees: cherry blossom, cedar forest or a mix; lining the road and filling the fields ----
  const spots=[],lineSpots=[];
  const lineStep=C.tree==="cedar"?3:(C.tree==="cherry"?8:7),lineOff=C.tree==="cedar"?5.5:8;
  for(let i=0;i<M;i+=lineStep){if(inStands(i))continue;const s=samples[i];[-1,1].forEach(side=>{if(rnd()<(C.tree==="cedar"?0.12:0.3))return;const p=s.pos.clone().addScaledVector(s.nor,side*(W+lineOff+rnd()*2.5));const y=groundAt(p.x,p.z);if(y<0.8)return;lineSpots.push([p.x,y,p.z,0.85+rnd()*0.5,rnd()*6.28,rnd()]);});}
  for(let i=0;i<M;i+=5){if(inStands(i))continue;const s=samples[i];for(let r=0;r<3;r++){if(r&&rnd()<0.45)continue;const side=rnd()<0.5?-1:1;const p=s.pos.clone().addScaledVector(s.nor,side*(W+16+r*16+rnd()*16));const y=groundAt(p.x,p.z);if(y<0.8||lakeF(p.x,p.z)>0.05)continue;if(houses.some(h=>Math.abs(h[0]-p.x)<5&&Math.abs(h[2]-p.z)<5))continue;spots.push([p.x,y,p.z,0.8+rnd()*0.7,rnd()*6.28,rnd()]);}}
  for(let k=0;k<420;k++){const a=rnd()*6.28,r=150+rnd()*520;const x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r;if(nearest(x,z)[1]<W+22)continue;const y=groundAt(x,z);if(y<0.8||lakeF(x,z)>0.05)continue;spots.push([x,y,z,0.9+rnd()*0.9,rnd()*6.28,rnd()]);}
  const all=lineSpots.concat(spots);
  if(bbOn){const cf=C.tree==="cherry"?0.85:(C.tree==="mixed"?0.4:0.08);all.forEach(s=>{const cherryT=s[5]<cf;bbAdd(cherryT?"cherry":"cedar",s[0],s[1],s[2],(cherryT?0.95:1)*s[3]*(0.9+(s[5]*7%1)*0.25),s[4]>3.14);});all.length=0;}
  const trunkMat=new T.MeshLambertMaterial({color:0x5a4030});
  const cherryFrac=C.tree==="cherry"?0.85:(C.tree==="mixed"?0.35:0),cedarFrac=C.tree==="cedar"?0.9:(C.tree==="mixed"?0.3:0.12);
  const cherry=[],cedar=[],broad=[];all.forEach(s=>{if(s[5]<cherryFrac)cherry.push(s);else if(s[5]<cherryFrac+cedarFrac)cedar.push(s);else broad.push(s);});
  const tg=new T.CylinderGeometry(0.22,0.4,3.2,6);tg.translate(0,1.6,0);
  const trIM=new T.InstancedMesh(tg,trunkMat,Math.max(1,all.length));let ti=0;
  if(cherry.length){const pinks=story?[0xf4a6c6,0xf7bfd6,0xf09ab8]:[0xf3a9c7,0xf8c7da,0xee93b4,0xfadbe6];const blIM=new T.InstancedMesh(new T.IcosahedronGeometry(2.4,1),new T.MeshStandardMaterial({color:0xffffff,roughness:0.95}),cherry.length*4);let bi=0;
    cherry.forEach((s,i)=>{s[3]*=0.85;dummy.rotation.set(0,s[4],0);dummy.position.set(s[0],s[1],s[2]);dummy.scale.set(s[3],s[3]*0.9,s[3]);dummy.updateMatrix();trIM.setMatrixAt(ti++,dummy.matrix);
      [[0,3.9,0,0.78],[1.3,4.3,0.7,0.6],[-1.2,4.5,-0.6,0.58],[0.3,5.1,-0.9,0.5]].forEach(c=>{dummy.position.set(s[0]+c[0]*s[3],s[1]+c[1]*s[3],s[2]+c[2]*s[3]);dummy.scale.set(s[3]*c[3]*1.1,s[3]*c[3]*0.8,s[3]*c[3]*1.1);dummy.updateMatrix();blIM.setMatrixAt(bi,dummy.matrix);blIM.setColorAt(bi,gpLin(pinks[(i+bi)%pinks.length]));bi++;});});
    blIM.count=bi;if(blIM.instanceColor)blIM.instanceColor.needsUpdate=true;blIM.castShadow=true;scene.add(blIM);}
  if(cedar.length){const cg=new T.ConeGeometry(1.9,6,7);cg.translate(0,3,0);const cnIM=new T.InstancedMesh(cg,new T.MeshStandardMaterial({color:0xffffff,roughness:0.95}),cedar.length*3);let ni=0;const greens=story?[0x2f5e2e,0x3b6b33,0x2a4f2c]:[0x1d3b24,0x24492b,0x2c5631,0x183320];
    cedar.forEach((s,i)=>{const sc2=s[3]*1.5;dummy.rotation.set(0,s[4],0);dummy.position.set(s[0],s[1],s[2]);dummy.scale.set(s[3]*1.2,sc2*1.6,s[3]*1.2);dummy.updateMatrix();trIM.setMatrixAt(ti++,dummy.matrix);
      [[2.5,1.1],[6.2,0.86],[9.4,0.62]].forEach(c=>{dummy.position.set(s[0],s[1]+c[0]*sc2*0.8,s[2]);dummy.scale.set(sc2*c[1],sc2*c[1]*1.15,sc2*c[1]);dummy.updateMatrix();cnIM.setMatrixAt(ni,dummy.matrix);cnIM.setColorAt(ni,gpLin(greens[(i+ni)%greens.length]));ni++;});});
    cnIM.count=ni;if(cnIM.instanceColor)cnIM.instanceColor.needsUpdate=true;cnIM.castShadow=true;scene.add(cnIM);}
  if(broad.length){const crIM=new T.InstancedMesh(new T.IcosahedronGeometry(2.6,1),new T.MeshStandardMaterial({color:0xffffff,roughness:0.9}),broad.length*2);let ci=0;const greens=story?[0x2e9e57,0x3cb371,0x27884a]:[0x3f6b2e,0x4d7a33,0x5f8a3a,0x7a8a3a];
    broad.forEach((s,i)=>{dummy.rotation.set(0,s[4],0);dummy.position.set(s[0],s[1],s[2]);dummy.scale.set(s[3],s[3],s[3]);dummy.updateMatrix();trIM.setMatrixAt(ti++,dummy.matrix);
      [[0,4.6,0,1],[1.2,5.6,0.6,0.72]].forEach(c=>{dummy.position.set(s[0]+c[0]*s[3],s[1]+c[1]*s[3],s[2]+c[2]*s[3]);dummy.scale.set(s[3]*c[3],s[3]*c[3]*0.85,s[3]*c[3]);dummy.updateMatrix();crIM.setMatrixAt(ci,dummy.matrix);crIM.setColorAt(ci,gpLin(greens[(i+ci)%greens.length]));ci++;});});
    crIM.count=ci;if(crIM.instanceColor)crIM.instanceColor.needsUpdate=true;crIM.castShadow=true;scene.add(crIM);}
  trIM.count=ti;trIM.castShadow=true;scene.add(trIM);
  // ---- stone lanterns (cherry route) / street lights (city route) ----
  const lamps=[];if(C.tree==="cherry"||C.city>0.5){for(let i=10;i<M;i+=18){if(inStands(i))continue;const s=samples[i];[-1,1].forEach(side=>{const p=s.pos.clone().addScaledVector(s.nor,side*(W+4.8));const y=groundAt(p.x,p.z);if(y>0.8)lamps.push([p.x,y,p.z]);});}}
  if(bbOn&&C.tree==="cherry"){lamps.forEach((l,k)=>bbAdd("lantern",l[0],l[1],l[2],1,k%2===1));lamps.length=0;}
  if(lamps.length){if(C.tree==="cherry"){const stone=new T.MeshLambertMaterial({color:0x8d8a80});const lb=new T.InstancedMesh(new T.BoxGeometry(0.5,1.6,0.5),stone,lamps.length),lc=new T.InstancedMesh(new T.ConeGeometry(0.7,0.5,4),stone,lamps.length),lh=new T.InstancedMesh(new T.BoxGeometry(0.42,0.42,0.42),new T.MeshBasicMaterial({color:0xffe9b8}),lamps.length);
      lamps.forEach((l,k)=>{dummy.rotation.set(0,0,0);dummy.scale.set(1,1,1);dummy.position.set(l[0],l[1]+0.8,l[2]);dummy.updateMatrix();lb.setMatrixAt(k,dummy.matrix);dummy.position.set(l[0],l[1]+1.8,l[2]);dummy.updateMatrix();lh.setMatrixAt(k,dummy.matrix);dummy.position.set(l[0],l[1]+2.25,l[2]);dummy.rotation.set(0,Math.PI/4,0);dummy.updateMatrix();lc.setMatrixAt(k,dummy.matrix);});
      [lb,lc].forEach(m=>{m.castShadow=true;scene.add(m);});scene.add(lh);}
    else{const poleM=new T.MeshLambertMaterial({color:0x6f7580});const lpg=new T.CylinderGeometry(0.06,0.09,7,6);lpg.translate(0,3.5,0);const lp=new T.InstancedMesh(lpg,poleM,lamps.length),lh=new T.InstancedMesh(new T.BoxGeometry(0.9,0.18,0.3),new T.MeshBasicMaterial({color:L.night>0.3?0xfff1c9:0xd8dde6}),lamps.length);
      lamps.forEach((l,k)=>{dummy.rotation.set(0,0,0);dummy.scale.set(1,1,1);dummy.position.set(l[0],l[1],l[2]);dummy.updateMatrix();lp.setMatrixAt(k,dummy.matrix);const s=samples[Math.min(M-1,Math.round(nearest(l[0],l[2])[0]))];const tw2=l[0]-s.pos.x,tz2=l[2]-s.pos.z,dn=Math.hypot(tw2,tz2)||1;dummy.position.set(l[0]-tw2/dn*0.9,l[1]+6.9,l[2]-tz2/dn*0.9);dummy.lookAt(s.pos.x,l[1]+6.9,s.pos.z);dummy.updateMatrix();lh.setMatrixAt(k,dummy.matrix);});
      lp.castShadow=true;scene.add(lp);scene.add(lh);}}
  // ---- chevron bend signs, speed trap on the straightest stretch ----
  const poleMat=new T.MeshStandardMaterial({color:0xdddddd,roughness:0.4,metalness:0.6});
  const chevTex=gpCanvasTex(128,96,(x,w,h)=>{x.fillStyle="#1a4fd6";x.fillRect(0,0,w,h);x.fillStyle="#fff";for(let k=0;k<2;k++){const o=22+k*44;x.beginPath();x.moveTo(o+34,14);x.lineTo(o+14,48);x.lineTo(o+34,82);x.lineTo(o+22,82);x.lineTo(o+2,48);x.lineTo(o+22,14);x.closePath();x.fill();}x.strokeStyle="#fff";x.lineWidth=4;x.strokeRect(2,2,w-4,h-4);});
  const chev=[];for(let i=0;i<M;i+=6){if(inStands(i))continue;const a=samples[i],b=samples[(i+10)%M];const ang=Math.acos(Math.max(-1,Math.min(1,a.tan.x*b.tan.x+a.tan.z*b.tan.z)));if(ang<0.2)continue;const left=a.tan.clone().cross(b.tan).y>0;const side=left?1:-1;
    const p=a.pos.clone().addScaledVector(a.nor,side*(W+5));chev.push([p.x,groundAt(p.x,p.z),p.z,a.tan.clone(),left]);}
  if(chev.length){const bIM=new T.InstancedMesh(new T.PlaneGeometry(1.3,0.95),new T.MeshStandardMaterial({map:chevTex,roughness:0.5,side:T.DoubleSide}),chev.length);const pIM=new T.InstancedMesh(new T.CylinderGeometry(0.05,0.05,1.3,5),poleMat,chev.length);
    chev.forEach((c,i)=>{dummy.position.set(c[0],c[1]+1.55,c[2]);dummy.rotation.set(0,0,0);dummy.scale.set(1,1,1);dummy.lookAt(new T.Vector3(c[0]-c[3].x,c[1]+1.55,c[2]-c[3].z));dummy.scale.set(c[4]?1:-1,1,1);dummy.updateMatrix();bIM.setMatrixAt(i,dummy.matrix);
      dummy.scale.set(1,1,1);dummy.rotation.set(0,0,0);dummy.position.set(c[0],c[1]+0.65,c[2]);dummy.updateMatrix();pIM.setMatrixAt(i,dummy.matrix);});bIM.castShadow=true;scene.add(bIM);scene.add(pIM);}
  let trapI=Math.floor(M*0.3),bestStr=-9;for(let i=Math.floor(M*0.12);i<Math.floor(M*0.88);i+=4){if(inStands(i))continue;const a=samples[(i-25+M)%M].tan,b=samples[(i+25)%M].tan;const d=a.x*b.x+a.z*b.z;if(d>bestStr){bestStr=d;trapI=i;}}
  if(band){const h0=hdgMean(-26,12),dh=gpWrapAng(hdgMean(trapI-25,trapI+25)-h0);band.rotation.y=(Math.abs(dh)<1.05?h0+dh*0.5:h0)-Math.PI;}   // Fuji sits ahead on the start straight and on the main straight
  if(gpMode()==="race"){const s=samples[trapI];const p=s.pos.clone().addScaledVector(s.nor,W+5);const y=groundAt(p.x,p.z);const pole=new T.Mesh(new T.CylinderGeometry(0.12,0.14,4.4,8),poleMat);pole.position.set(p.x,y+2.2,p.z);pole.castShadow=true;scene.add(pole);
    const sign=new T.Mesh(new T.BoxGeometry(3.6,1.3,0.2),new T.MeshStandardMaterial({map:gpTextTex("SPEED TRAP",["#0a4dcc","#0a2a88"],"#fff",512,180,78),roughness:0.4}));sign.position.set(p.x,y+4.6,p.z);sign.lookAt(sign.position.clone().sub(s.tan));sign.castShadow=true;scene.add(sign);
    const cam=new T.Mesh(new T.BoxGeometry(0.5,0.4,0.7),new T.MeshStandardMaterial({color:0x222222,roughness:0.4}));cam.position.set(p.x,y+3.7,p.z);scene.add(cam);}
  if(bbOn){for(let i=36;i<M;i+=30){if(inStands(i)||Math.abs(i-trapI)<16)continue;const s=samples[i];const side=(i/30)%2?1:-1;const p=s.pos.clone().addScaledVector(s.nor,side*(W+5));const y=groundAt(p.x,p.z);if(y>0.8)bbAdd("banner",p.x,y,p.z,1,side>0);}
    [0.42,0.74].forEach((f,k)=>{const s=samples[Math.floor(M*f)];const side=k?-1:1;const p=s.pos.clone().addScaledVector(s.nor,side*(W+15));const y=groundAt(p.x,p.z);if(y>0.8&&lakeF(p.x,p.z)<0.05)bbAdd("torii",p.x,y,p.z,1,false);});
    gpBillboards(T,scene,WD.props,BB,new T.Color(hazeHex),scene.fog.near,scene.fog.far,TINT,shared0.blob);}
  // ---- distant ridges (lower in front of Fuji), clouds, sun glare ----
  const hillMat=new T.MeshStandardMaterial({color:new T.Color(L.hill),roughness:1,flatShading:true});
  const fujiAng=Math.atan2(C.fuji[1],C.fuji[0]);
  for(let i=0;i<(bandOn?0:20);i++){const a=i/20*Math.PI*2+rnd()*0.25,r=680+rnd()*160;let da=Math.abs(a-fujiAng);da=Math.min(da,Math.PI*2-da);const inFront=da<0.55;const h=new T.Mesh(new T.IcosahedronGeometry(1,2),hillMat);h.position.set(cx+Math.cos(a)*r,-16,cz+Math.sin(a)*r);h.scale.set(150+rnd()*110,(inFront?34:(C.tree==="cedar"?95:62))+rnd()*50,150+rnd()*110);scene.add(h);}
  const cloudTex=gpCanvasTex(256,128,(x,w,h)=>{[[70,80,40],[120,60,52],[180,78,40],[100,92,34],[150,94,36]].forEach(c=>{const g=x.createRadialGradient(c[0],c[1]-c[2]*0.3,c[2]*0.1,c[0],c[1],c[2]);g.addColorStop(0,"rgba(255,255,255,1)");g.addColorStop(0.7,"rgba(250,246,240,.85)");g.addColorStop(1,"rgba(240,236,232,0)");x.fillStyle=g;x.beginPath();x.arc(c[0],c[1],c[2],0,7);x.fill();});});
  for(let i=0;i<(bandOn?7:16);i++){const sp=new T.Sprite(new T.SpriteMaterial({map:cloudTex,transparent:true,fog:false,opacity:bandOn?0.6:0.8,depthWrite:false}));const s=90+rnd()*90;sp.scale.set(s,s/2.2,1);sp.position.set(cx+(rnd()-0.5)*2200,170+rnd()*120,cz+(rnd()-0.5)*2200);scene.add(sp);}
  for(let i=0;i<(bandOn?0:5);i++){const sp=new T.Sprite(new T.SpriteMaterial({map:cloudTex,transparent:true,fog:false,opacity:0.75,depthWrite:false}));const s=160+rnd()*120;sp.scale.set(s,s/3,1);sp.position.set(fx+(rnd()-0.5)*700,FH*0.3+rnd()*FH*0.18-6,fz+120+rnd()*300);scene.add(sp);}
  const glare=new T.Sprite(new T.SpriteMaterial({map:gpSoftDot(),color:new T.Color(L.glow),transparent:true,opacity:story?0.55:0.2,blending:T.AdditiveBlending,depthWrite:false,fog:false}));glare.material.userData.lin=1;glare.scale.set(bandOn?100:140,bandOn?100:140,1);scene.add(glare);
  // ---- cars on the grid ----
  const shared=shared0;
  if(!story){const ct=new T.Color(1,1,1).lerp(gpLin(L.sun),0.3).multiply(TINT);ct.multiplyScalar(1/Math.max(ct.r,ct.g,ct.b));shared.carTint=ct;}   // sunset rim/tint for the photo cars, matched to the route light
  const others=GP_CARS.filter(c=>c.id!==myCar.id);
  const pname=(P&&typeof P.name==="string"&&P.name.trim())?P.name.trim().split(/\s+/)[0]:"You";
  const racers=[{n:pname,car:myCar,css:myPaint,player:true}].concat(gpMode()==="race"?others.slice(0,4).map((c,i)=>({n:GP_DRIVERS[i%GP_DRIVERS.length],car:c,css:c.paint,player:false})):[]);
  const pics=story?{}:(window._gpPics||{});   // the storybook look keeps the drawn 3D cars (the ink filter buries a photo)
  const pace=gpPaceMul();const karts=racers.map((r,i)=>{const m=(GP_PICS[r.car.id]&&pics[r.car.id])?gpBuildPicCar(T,r.car,pics[r.car.id],shared):gpBuildCar(T,r.car,r.css,shared);scene.add(m.g);const st=gpStats(r.car);st.max*=pace;st.accel*=0.75;
    return{racer:r,player:r.player,...m,...st,t:0,x:0,px:0,speed:0,lap:0,spin:0,drift:0,off:0,hop:0,roll:0,pitch:0,steerVis:0,yaw:null,lastSpeed:0,skidD:0,ahead:true,started:false,pos:new T.Vector3(),draft:false,brakeOn:false};});
  const rows=karts.length,pitch=8/(len/M);karts.forEach((k,i)=>{const row=k.player?rows-1:i-1;k.t=((M-5-row*pitch)/M)%1;k.x=(row%2?0.4:-0.4)*(rows>1?1:0);k.px=k.x;});
  if(gpMode()==="race"){const boxTex=gpCanvasTex(128,256,(x,w,h)=>{x.clearRect(0,0,w,h);x.strokeStyle="rgba(255,255,255,.9)";x.lineWidth=10;x.strokeRect(6,6,w-12,h-12);});
    const boxMat=new T.MeshBasicMaterial({map:boxTex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});boxMat.userData.lin=1;const boxGeo=new T.PlaneGeometry(2.8,5.8).rotateX(-Math.PI/2);
    karts.forEach(k=>{const p=curve.getPointAt(k.t),tn=curve.getTangentAt(k.t).normalize(),nn=new T.Vector3(-tn.z,0,tn.x).normalize();p.addScaledVector(nn,k.x*(W-1.2));const bx=new T.Mesh(boxGeo,boxMat);bx.position.set(p.x,p.y+0.06,p.z);bx.rotation.y=Math.atan2(tn.x,tn.z);scene.add(bx);});
    const lineTex=gpCanvasTex(512,32,(x,w,h)=>{for(let i=0;i<32;i++)for(let j=0;j<2;j++){x.fillStyle=(i+j)%2?"#15161a":"#e6e6e2";x.fillRect(i*16,j*16,16,16);}});
    const sl=new T.Mesh(new T.PlaneGeometry(W*2-0.4,1.0).rotateX(-Math.PI/2),new T.MeshBasicMaterial({map:lineTex,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));sl.material.userData.lin=1;sl.position.set(sStart.x,sStart.y+0.06,sStart.z);sl.rotation.y=Math.atan2(s0.tan.x,s0.tan.z);scene.add(sl);}
  // ---- music notes to collect (free drive) ----
  const notes=[];if(gpMode()==="free"){const noteCols=["#ff2d87","#ffb000","#2fd3c3","#4f8cff","#c27bff"];const noteTex=noteCols.map(c=>gpCanvasTex(128,128,(x,w,h)=>{x.fillStyle="rgba(255,255,255,.95)";x.beginPath();x.arc(64,64,54,0,7);x.fill();x.lineWidth=7;x.strokeStyle=c;x.stroke();x.fillStyle=c;x.font="bold 86px serif";x.textAlign="center";x.textBaseline="middle";x.fillText("♪",60,70);}));
    for(let i=24;i<M-10;i+=19){const k=notes.length;const sp=new T.Sprite(new T.SpriteMaterial({map:noteTex[k%noteTex.length],transparent:true,depthWrite:false}));sp.scale.set(2,2,1);const t=i/M,x=Math.max(-0.7,Math.min(0.7,Math.sin(i*0.37)*0.62));
      const pp=curve.getPointAt(t),tn=curve.getTangentAt(t).normalize(),nn=new T.Vector3(-tn.z,0,tn.x).normalize();pp.addScaledVector(nn,x*(W-1.2));sp.position.set(pp.x,pp.y+1.5,pp.z);scene.add(sp);notes.push({t,x,mesh:sp,alive:true,col:noteCols[k%noteCols.length],k,y:pp.y+1.5});}}
  // ---- particles: tyre smoke, dust, sparks, cherry petals; skid marks ----
  const smoke=gpParticles(T,scene,300,2.6,false,0.55),dust=gpParticles(T,scene,160,2.0,false,0.5),sparks=gpParticles(T,scene,120,0.6,true);
  const petals=C.tree==="cherry"?gpParticles(T,scene,160,0.32,false,0.9):null;
  const skidGeo=new T.PlaneGeometry(0.26,1.0);skidGeo.rotateX(-Math.PI/2);const SK=700;
  const skids=new T.InstancedMesh(skidGeo,new T.MeshBasicMaterial({color:0x0a0a0a,transparent:true,opacity:0.42,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),SK);skids.material.userData.lin=1;
  dummy.position.set(0,-999,0);dummy.rotation.set(0,0,0);dummy.scale.set(0.0001,0.0001,0.0001);dummy.updateMatrix();for(let i=0;i<SK;i++)skids.setMatrixAt(i,dummy.matrix);skids.frustumCulled=false;scene.add(skids);
  // convert plain colours from sRGB to linear once (colours look right with sRGB output + tone mapping)
  const seen=new Set();scene.traverse(o=>{if(o===sky||o===fuji)return;const ms=Array.isArray(o.material)?o.material:(o.material?[o.material]:[]);ms.forEach(m=>{if(!m||seen.has(m)||m.isShaderMaterial||m.isPointsMaterial)return;seen.add(m);if(m.userData.lin)return;m.userData.lin=1;
    if(m.color&&!(o.isInstancedMesh&&o.instanceColor)&&!m.map)m.color.convertSRGBToLinear();if(m.emissive&&!m.emissiveMap)m.emissive.convertSRGBToLinear();});});
  R3={T,C,renderer,scene,camera,curve,samples,M,W,len,karts,me:karts.find(k=>k.player),keys:{},touchDir:0,brake:false,drift:false,t0:performance.now(),time:0,countdown:3.8,lastN:null,done:false,raf:null,last:performance.now(),camPos:new T.Vector3(),msgT:0,place:5,board:[],
    sun,sky,band,glare,sunDir,sunOff:sunDir.clone().multiplyScalar(170),envRT,smoke,dust,sparks,petals,skids,skN:0,dummy,shake:0,fov:60,pr:pr0,fpsT:0,fpsN:0,fps:0,lowT:0,shadowsOn:true,tmpV:new T.Vector3(),tmpV2:new T.Vector3(),UP,story,
    trapT:trapI/M,trapBest:0,gear:1,tachT:0,post,mode:gpMode(),notes,notesGot:0,notesTotal:notes.length*C.laps,song:[],lastDeg:4,songDirty:1,water,waterTex,fx:$("gp3Fx"),fxW:16,fxH:9,sk:{chain:0,mult:1,total:0,idle:0,list:[],dirty:1,clean:0,cool:0},bumpT:9};
  window.__gp={fps:0,pr:pr0,shadows:true};
  // keyboard
  R3.kd=e=>{if(!R3)return;const k=e.key.toLowerCase();GPA.init();if(k==="escape"){renderCircuits();return;}if(k==="m"){gpToggleMute();return;}R3.keys[k]=true;if(["arrowleft","arrowright","arrowdown","arrowup","shift"," "].includes(k))e.preventDefault();};
  R3.ku=e=>{if(!R3)return;R3.keys[e.key.toLowerCase()]=false;};
  window.addEventListener("keydown",R3.kd);window.addEventListener("keyup",R3.ku);
  // touch
  const hold=(id,dir)=>{const b=$(id);if(!b)return;const on=ev=>{ev.preventDefault();GPA.init();if(!R3)return;b.classList.add("on");if(dir==="b")R3.brake=true;else if(dir==="d")R3.drift=true;else R3.touchDir=dir;};
    const off=ev=>{b.classList.remove("on");if(!R3)return;if(dir==="b")R3.brake=false;else if(dir==="d")R3.drift=false;else if(R3.touchDir===dir)R3.touchDir=0;};
    ["pointerdown","touchstart"].forEach(t=>b.addEventListener(t,on,{passive:false}));["pointerup","pointerleave","pointercancel","touchend","touchcancel"].forEach(t=>b.addEventListener(t,off));b.addEventListener("contextmenu",ev=>ev.preventDefault());};
  hold("rcL",-1);hold("rcR",1);hold("rcB","b");hold("rcD","d");hold("gp3L",-1);hold("gp3R",1);
  $("gp3Mute").addEventListener("click",ev=>{ev.preventDefault();gpToggleMute();});
  R3.blockTouch=ev=>{if(R3&&!R3.done&&ev.cancelable)ev.preventDefault();};
  document.addEventListener("touchmove",R3.blockTouch,{passive:false});document.addEventListener("gesturestart",R3.blockTouch,{passive:false});
  R3.onVis=()=>{if(!GPA.ctx)return;if(document.hidden)GPA.ctx.suspend();else GPA.ctx.resume();};document.addEventListener("visibilitychange",R3.onVis);
  const wrapEl=$("gp3");
  R3.onResize=()=>{if(!R3)return;const w=wrapEl.clientWidth||720,h=wrapEl.clientHeight||Math.round(w*9/16);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();if(R3.post)R3.post.resize(w,h,renderer.getPixelRatio());if(R3.fx){R3.fxW=Math.max(16,Math.round(w/2));R3.fxH=Math.max(9,Math.round(h/2));R3.fx.width=R3.fxW;R3.fx.height=R3.fxH;}};
  R3.onOrient=()=>{[150,400,900].forEach(ms=>setTimeout(()=>{if(R3)R3.onResize();},ms));};
  window.addEventListener("resize",R3.onResize);window.addEventListener("orientationchange",R3.onOrient);R3.onResize();
  setTimeout(()=>{const c=$("gp3Card");if(c)c.classList.add("hide");},2000);
  GPA.startEngine();
  say(C.name+". "+myCar.n+". Three, two, one, go!");
  R3.raf=requestAnimationFrame(gpFrame);
  setTimeout(gpEnvCheck,1200);
}
/* safety net: if the reflection map ever blacks out the scene on some device, switch it off */
function gpEnvCheck(){try{if(!R3||!R3.scene.environment)return;R3.renderer.render(R3.scene,R3.camera);const c=R3.renderer.domElement,o=document.createElement("canvas");o.width=64;o.height=36;const x=o.getContext("2d");x.drawImage(c,0,0,64,36);const d=x.getImageData(0,27,64,9).data;let sum=0;for(let i=0;i<d.length;i+=4)sum+=d[i]+d[i+1]+d[i+2];if(sum/(d.length/4)<25){R3.scene.environment=null;window.__gp.envOff=true;}}catch(e){}}
function gpToggleMute(){GPA.init();GPA.setMute(!GPA.muted);if(P){P.gpMute=GPA.muted;save();}const b=$("gp3Mute");if(b)b.textContent=GPA.muted?"🔇":"🔊";}
function gpMsg(m){if(!R3)return;const e=$("gp3Msg");if(e){e.textContent=m;e.classList.add("show");}R3.msgT=1.7;}
/* ---------- skill chains ---------- */
/* one row per skill name (a repeated skill adds to its row and shows a count); the multiplier grows with each new
   skill type and with each repeat of a discrete one; nothing is scored for a moment after a chain breaks */
function gpSkill(name,pts,discrete){const S=R3.sk;if(S.cool>0)return;let row=S.list.find(l=>l.n===name);
  if(!row){row={n:name,p:0,c:0};S.list.unshift(row);if(S.list.length>1)S.mult=Math.min(5,S.mult+1);if(S.list.length>4)S.list.length=4;}
  else if(discrete){S.mult=Math.min(5,S.mult+1);if(S.list[0]!==row){S.list.splice(S.list.indexOf(row),1);S.list.unshift(row);}}
  if(discrete){row.c++;GPA.play("skill");}
  if(S.chain<=0){const e=$("gp3Msg");if(e&&R3.msgT>0&&/chain broken/i.test(e.textContent)){R3.msgT=0;e.classList.remove("show");}}   // a fresh chain clears a lingering CHAIN BROKEN banner
  row.p+=pts;S.chain+=pts;S.idle=0;S.dirty=1;}
function gpChainBreak(){const S=R3.sk;if(S.chain>0){gpMsg("Chain broken");GPA.play("break");}S.chain=0;S.mult=1;S.list=[];S.cool=1.0;S.dirty=1;}
function gpBank(){const S=R3.sk;if(S.chain<=0)return;const v=Math.round(S.chain*S.mult);S.total+=v;gpMsg("+"+gpNum(v)+" skill");GPA.play("bank");gpFlame(R3.me,0.7);S.chain=0;S.mult=1;S.list=[];S.dirty=1;}
function gpSkillHud(){const S=R3.sk;if(!S.dirty)return;S.dirty=0;const e=$("gp3Skill");if(!e)return;if(!S.list.length){e.classList.remove("on");return;}
  e.innerHTML='<div class="pts">'+gpNum(S.chain)+(S.mult>1?'<span class="mul">×'+S.mult+'</span>':'')+'</div>'+S.list.map(l=>'<div class="row">'+esc(l.n)+(l.c>1?' ×'+l.c:'')+' '+gpNum(l.p)+'</div>').join("");e.classList.add("on");}
/* ---------- round MPH speedometer with rev arc and gear (Horizon style) ---------- */
function gpTach(mph,gear,rf){const cv=$("gp3Tach");if(!cv)return;const x=cv.getContext("2d"),S=cv.width,c=S/2,r=S*0.41,story=R3&&R3.story;x.clearRect(0,0,S,S);
  const face=(!story&&window._gpWorld&&window._gpWorld.speedo)||null;
  if(face){const D=GP_WORLD.speedo,R=S/2,v=Math.max(0,Math.min(1,mph/D.max)),ang=q=>(D.a0+(D.a1-D.a0)*q)*Math.PI/180;x.drawImage(face,0,0,S,S);
    x.lineCap="butt";x.strokeStyle="rgba(14,16,24,.88)";x.lineWidth=R*0.085;x.beginPath();x.arc(c,c,R*0.6,ang(v),ang(1)+0.02);x.stroke();                 // unlit part of the baked arc
    const a=ang(v);x.save();x.translate(c,c);x.rotate(a);x.shadowColor="rgba(255,60,90,.8)";x.shadowBlur=R*0.06;x.fillStyle="#fff";x.beginPath();x.moveTo(-R*0.03,-R*0.022);x.lineTo(R*0.70,-R*0.006);x.lineTo(R*0.70,R*0.006);x.lineTo(-R*0.03,R*0.022);x.closePath();x.fill();x.fillStyle="#ff2d55";x.fillRect(R*0.56,-R*0.012,R*0.14,R*0.024);x.restore();
    x.fillStyle="#1a1d28";x.beginPath();x.arc(c,c,R*0.07,0,7);x.fill();x.lineWidth=R*0.012;x.strokeStyle="rgba(255,255,255,.7)";x.stroke();
    x.textAlign="center";x.textBaseline="middle";x.fillStyle="#fff";x.font="italic 900 "+(S*0.2)+"px system-ui";x.shadowColor="rgba(0,0,0,.8)";x.shadowBlur=S*0.02;x.fillText(String(Math.round(mph)),c,c+S*0.04);
    x.fillStyle="rgba(255,255,255,.8)";x.font="800 "+(S*0.055)+"px system-ui";x.fillText("MPH",c,c+S*0.16);
    x.fillStyle="rgba(255,45,135,.9)";x.beginPath();x.arc(c,c-S*0.14,S*0.065,0,7);x.fill();x.fillStyle="#fff";x.font="italic 900 "+(S*0.085)+"px system-ui";x.fillText(String(gear),c,c-S*0.136);
    x.shadowBlur=0;x.fillStyle="rgba(10,12,20,.9)";const pw=R*0.5,ph=R*0.14,py=c+R*0.79;x.beginPath();x.roundRect?x.roundRect(c-pw/2,py-ph/2,pw,ph,ph/2):x.rect(c-pw/2,py-ph/2,pw,ph);x.fill();x.fillStyle="#ffd2e6";x.font="800 "+(S*0.05)+"px system-ui";x.fillText("GEAR "+gear,c,py+1);return;}
  x.fillStyle=story?"rgba(247,240,225,.92)":"rgba(8,10,18,.55)";x.beginPath();x.arc(c,c,S*0.48,0,7);x.fill();x.lineWidth=S*0.012;x.strokeStyle=story?"#2b2735":"rgba(255,255,255,.55)";x.stroke();
  const a0=Math.PI*0.7,a1=Math.PI*2.3,ang=v=>a0+(a1-a0)*v;x.lineCap="butt";
  x.lineWidth=S*0.05;x.strokeStyle=story?"rgba(43,39,53,.15)":"rgba(255,255,255,.14)";x.beginPath();x.arc(c,c,r,a0,a1);x.stroke();
  x.strokeStyle="rgba(255,40,60,.75)";x.beginPath();x.arc(c,c,r,ang(0.84),a1);x.stroke();
  const g=x.createLinearGradient(0,S,S,0);if(story){g.addColorStop(0,"#f2c14e");g.addColorStop(1,"#e8604c");}else{g.addColorStop(0,"#ffffff");g.addColorStop(0.7,"#ff7ab0");g.addColorStop(1,"#ff2d87");}x.strokeStyle=g;x.beginPath();x.arc(c,c,r,a0,ang(Math.max(0.01,Math.min(1,rf))));x.stroke();
  x.strokeStyle=story?"#2b2735":"rgba(255,255,255,.8)";x.lineWidth=S*0.008;for(let k=0;k<=16;k++){const a=ang(k/16),ri=k%2?r+S*0.03:r+S*0.038,ro=r+S*0.052;x.beginPath();x.moveTo(c+Math.cos(a)*ri,c+Math.sin(a)*ri);x.lineTo(c+Math.cos(a)*ro,c+Math.sin(a)*ro);x.stroke();}
  x.fillStyle=story?"rgba(43,39,53,.7)":"rgba(255,255,255,.7)";x.font="700 "+(S*0.06)+"px system-ui";x.textAlign="center";x.textBaseline="middle";for(let k=0;k<=8;k++){const a=ang(k/8);x.fillText(String(k),c+Math.cos(a)*r*0.78,c+Math.sin(a)*r*0.78);}
  x.fillStyle=story?"#2b2735":"#fff";x.font="italic 900 "+(S*0.25)+"px system-ui";x.fillText(String(Math.round(mph)),c,c+S*0.07);
  x.fillStyle=story?"#6b6076":"rgba(255,255,255,.75)";x.font="800 "+(S*0.065)+"px system-ui";x.letterSpacing="2px";x.fillText("MPH",c,c+S*0.22);
  x.fillStyle=story?"#e8604c":"rgba(255,255,255,.14)";x.beginPath();x.arc(c,c-S*0.17,S*0.085,0,7);x.fill();if(!story){x.lineWidth=S*0.008;x.strokeStyle="rgba(255,255,255,.7)";x.stroke();}
  x.fillStyle="#fff";x.font="italic 900 "+(S*0.11)+"px system-ui";x.fillText(String(gear),c,c-S*0.165);}
function gpFrame(now){
  if(!R3)return;
  const raw=(now-R3.last)/1000;const dt=Math.min(0.05,raw);R3.last=now;
  R3.fpsT+=raw;R3.fpsN++;if(R3.fpsT>=2){R3.fps=R3.fpsN/R3.fpsT;R3.fpsT=0;R3.fpsN=0;window.__gp.fps=Math.round(R3.fps);
    if(R3.fps<45&&!document.hidden){R3.lowT++;if(R3.lowT>=2){R3.lowT=0;if(R3.pr>1){R3.pr=Math.max(1,R3.pr-0.25);R3.renderer.setPixelRatio(R3.pr);R3.onResize();}else if(R3.shadowsOn){R3.shadowsOn=false;R3.sun.castShadow=false;}}}else R3.lowT=0;
    window.__gp.pr=R3.pr;window.__gp.shadows=R3.shadowsOn;}
  if(R3.countdown>0){R3.countdown-=dt;const c=$("gp3Count");if(c){const n=Math.min(3,Math.ceil(R3.countdown-0.3));if(n!==R3.lastN){R3.lastN=n;GPA.play(n>0?"beep":"go");}c.textContent=n>0?String(n):"GO!";c.classList.add("show");if(R3.countdown<=0)setTimeout(()=>{const cc=$("gp3Count");if(cc)cc.classList.remove("show");},700);}}
  else if(!R3.done)R3.time=now-R3.t0-3800;
  gpUpdate(dt,R3.countdown>0);gpRender(dt);
  R3.raf=requestAnimationFrame(gpFrame);
}
function gpUpdate(dt,waiting){
  const {karts,samples,M,len,T,me}=R3;
  const k=R3.keys;const left=k["arrowleft"]||k["a"]||R3.touchDir<0,right=k["arrowright"]||k["d"]||R3.touchDir>0,brake=k["arrowdown"]||k["s"]||R3.brake,driftBtn=k["shift"]||k[" "]||k["x"]||R3.drift;
  const V=R3.tmpV,sk=R3.sk;R3.bumpT+=dt;
  karts.forEach(kt=>{
    const i=Math.floor(kt.t*M)%M;const s=samples[i],s2=samples[(i+4)%M];
    const curv=s.tan.clone().cross(s2.tan).y;
    const offroad=Math.abs(kt.x)>1.05;
    let draft=false;if(!waiting&&kt.speed/kt.max>0.55){draft=karts.some(o=>{if(o===kt)return false;const d=(o.t-kt.t+1)%1;return d>0.003&&d<0.028&&Math.abs(o.x-kt.x)<0.32;});}kt.draft=draft;
    let band=1;if(!kt.player&&!waiting){const gap=(kt.lap+kt.t)-(me.lap+me.t);band=gap>0.06?0.93:(gap<-0.06?1.07:1);}
    const maxNow=waiting?0:kt.max*band*(draft?1.07:1)*(kt.spin>0?0.6:1)*(offroad?kt.offF:1)*(kt.drift?0.94:1);
    kt.brakeOn=kt.player&&brake&&!waiting;
    if(kt.brakeOn)kt.speed=Math.max(0,kt.speed-38*dt);else kt.speed+=(maxNow-kt.speed)*Math.min(1,dt*(kt.speed<maxNow?kt.accel/10:2.2));
    if(!kt.player&&!waiting){const nxt=samples[(i+14)%M];const bend=Math.abs(s.tan.x*nxt.tan.z-s.tan.z*nxt.tan.x);kt.brakeOn=bend>0.22&&kt.speed>kt.max*0.8;if(kt.brakeOn)kt.speed-=12*dt;}
    const spd=kt.speed/kt.max;kt.px=kt.x;
    if(kt.player&&!waiting){
      const inp=(left?-1:0)+(right?1:0);
      if(!kt.drift&&driftBtn&&inp!==0&&spd>0.4&&!offroad){kt.drift=inp;kt.off=0;kt.hop=0.22;}
      if(kt.drift)kt.off=offroad?kt.off+dt:0;
      if(kt.drift&&(!driftBtn||kt.off>0.6||spd<0.3))kt.drift=0;
      if(kt.drift){const same=inp===kt.drift,opp=inp===-kt.drift;kt.x+=kt.drift*dt*kt.steer*Math.max(.35,spd)*(same?0.5:(opp?-0.35:0.18));}
      else{const tgt=((left?-1:0)+(right?1:0))*kt.steer*(R3.mode==="free"?0.36:0.42)*Math.max(.4,spd);kt.sv=(kt.sv||0)+(tgt-(kt.sv||0))*Math.min(1,dt*(tgt?3:8));kt.x+=kt.sv*dt;}
    }
    else if(!kt.player){const target=Math.sin((kt.t*6.28*3)+kt.racer.n.length)*0.45-curv*6;const ahead=karts.find(o=>o!==kt&&((o.t-kt.t+1)%1)<0.012&&Math.abs(o.x-kt.x)<0.35);kt.x+=((ahead?(kt.x<ahead.x?-0.65:0.65):Math.max(-0.8,Math.min(0.8,target)))-kt.x)*dt*(1.1+kt.racer.car.handle*0.18);}
    kt.x-=curv*spd*dt*(kt.player?(R3.mode==="free"?3:6):14)*(kt.drift?0.4:1);
    if(kt.player&&R3.mode==="race"&&!kt.drift&&!left&&!right&&Math.abs(kt.x)>0.95)kt.x-=Math.sign(kt.x)*dt*0.7;
    if(kt.player&&R3.mode==="free"&&!kt.drift&&!left&&!right&&Math.abs(kt.x)>0.7)kt.x-=Math.sign(kt.x)*dt*0.5;
    const lim=kt.player?(R3.mode==="free"?1.15:1.22):1.1;kt.x=Math.max(-lim,Math.min(lim,kt.x));   // road edge is 1.19 (the car's outer wheels on the shoulder), the rail is 1.6
    if(kt.hop>0)kt.hop-=dt;
    const before=kt.t;kt.t=(kt.t+kt.speed*dt/len)%1;
    if(!waiting&&kt.t<before&&before>0.5&&!kt.started){kt.started=true;}
    else if(!waiting&&kt.t<before&&before>0.5){kt.lap++;if(kt.player){if(kt.lap>=R3.C.laps&&!R3.done)gpFinish();else{R3.notes.forEach(n=>{n.alive=true;n.mesh.visible=true;});GPA.play("lap");gpMsg(kt.lap+1===R3.C.laps?"Final lap":"Lap "+(kt.lap+1));}}}
    if(kt.player&&!waiting&&!R3.done&&R3.mode==="race"){const tt=R3.trapT;const crossed=before<=kt.t?(before<tt&&kt.t>=tt):(before<tt||kt.t>=tt);if(crossed){const mph=Math.round(kt.speed*GP_MPH);R3.trapBest=Math.max(R3.trapBest,mph);const r=kt.speed/(kt.max||1);const stars=r>=0.97?"★★★":r>=0.9?"★★":"★";gpMsg("Speed trap "+mph+" mph "+stars);GPA.play("trap");gpSkill("Speed trap",mph*4,true);}}
    // place the car
    const pos=R3.curve.getPointAt(kt.t),tan=R3.curve.getTangentAt(kt.t).normalize(),nor=new T.Vector3(-tan.z,0,tan.x).normalize();
    pos.addScaledVector(nor,kt.x*(R3.W-1.2));kt.pos.copy(pos);
    kt.g.position.copy(pos);let y=0;if(offroad)y=Math.abs(Math.sin(kt.t*len*3))*0.08;if(kt.hop>0)y+=Math.sin(Math.PI*(1-kt.hop/0.22))*0.25;kt.g.position.y+=y;
    kt.g.lookAt(pos.clone().add(tan));
    const yaw=Math.atan2(tan.x,tan.z);let yawRate=0;if(kt.yaw!==null){let d=yaw-kt.yaw;if(d>Math.PI)d-=Math.PI*2;if(d<-Math.PI)d+=Math.PI*2;yawRate=d/Math.max(dt,0.001);}kt.yaw=yaw;
    const vx=(kt.x-kt.px)/Math.max(dt,0.001);
    kt.g.rotateY((-vx*0.05)+(kt.drift?-kt.drift*0.35:0));
    const rollT=Math.max(-0.09,Math.min(0.09,yawRate*0.18*spd-vx*0.04+(kt.drift?-kt.drift*0.05:0)));kt.roll+=(rollT-kt.roll)*Math.min(1,dt*6);
    const acc=(kt.speed-kt.lastSpeed)/Math.max(dt,0.001);kt.lastSpeed=kt.speed;const pitchT=Math.max(-0.045,Math.min(0.045,-acc*0.003));kt.pitch+=(pitchT-kt.pitch)*Math.min(1,dt*6);
    kt.body.rotation.z=kt.roll;kt.body.rotation.x=kt.pitch;
    const stT=Math.max(-0.45,Math.min(0.45,yawRate*0.32-vx*0.22+(kt.drift?kt.drift*0.35:0)));kt.steerVis+=(stT-kt.steerVis)*Math.min(1,dt*10);kt.steers.forEach(h=>h.rotation.y=kt.steerVis);
    kt.wheels.forEach(w=>w.rotation.x+=kt.speed*dt/w.userData.rad);
    kt.tailMat.emissiveIntensity=kt.brakeOn?3.4:0.9;
    if(kt.pic){if(!kt.player&&!waiting&&spd>0.8&&Math.random()<dt*0.1)gpFlame(kt,0.3);gpPicUpdate(kt,dt,R3.camPos,kt.player?((left?-1:0)+(right?1:0)):0);}
    // effects: tyre smoke + skid marks when drifting or braking hard, dust off the road
    const near=kt.player||(kt.pos.distanceToSquared(me.pos)<2500&&kt.pos.distanceToSquared(R3.camPos)>30);
    const skid=!offroad&&((kt.drift&&spd>0.35)||(kt.brakeOn&&spd>0.55));if(!skid)kt.skidD=0;
    if(near&&(skid||(offroad&&spd>0.2))){kt.g.updateMatrixWorld(true);
      [-1,1].forEach(sd=>{V.set(sd*(kt.S.w/2-0.04),0.1,kt.xr);kt.g.localToWorld(V);
        if(skid){if(Math.random()<0.8)R3.smoke.emit(V.x,V.y+0.2,V.z,(Math.random()-0.5)*1.5-tan.x*2,0.6+Math.random()*0.9,(Math.random()-0.5)*1.5-tan.z*2,0.92,0.92,0.94,1.2);}
        else if(Math.random()<0.6)R3.dust.emit(V.x,V.y+0.2,V.z,-tan.x*3+(Math.random()-0.5)*2,0.8+Math.random()*1.2,-tan.z*3+(Math.random()-0.5)*2,0.6,0.5,0.35,0.9);});}
    if(skid&&near){kt.skidD+=kt.speed*dt;if(kt.skidD>0.9){const dl=Math.min(6,kt.skidD);kt.skidD=0;const D=R3.dummy;const fw=Math.atan2(tan.x,tan.z)+(kt.drift?-kt.drift*0.42:0);   // each mark spans the distance since the last one, so the trail is continuous at any frame rate
      [-1,1].forEach(sd=>{V.set(sd*(kt.S.w/2-0.04),0,kt.xr);kt.g.localToWorld(V);D.position.set(V.x-tan.x*dl*0.5,kt.pos.y+0.045,V.z-tan.z*dl*0.5);D.rotation.set(0,fw,0);D.scale.set(1,1,dl+0.1);D.updateMatrix();R3.skids.setMatrixAt(R3.skN,D.matrix);R3.skN=(R3.skN+1)%700;});R3.skids.instanceMatrix.needsUpdate=true;}}
  });
  // bumps between cars
  for(let a=0;a<karts.length;a++)for(let b=a+1;b<karts.length;b++){const A=karts[a],B=karts[b];const d=(A.t-B.t+1)%1;const close=d<0.004||d>0.996;if(close&&Math.abs(A.x-B.x)<0.42){const back=d<0.5?B:A,front=back===A?B:A;if(back.speed>front.speed)back.speed=front.speed*0.88;A.x+=(A.x<B.x?-1:1)*0.18;B.x-=(A.x<B.x?-1:1)*0.18;
    if((A.player||B.player)&&R3.bumpT>0.8&&!waiting){R3.bumpT=0;R3.shake=0.45;GPA.play("bump");sk.clean=0;gpChainBreak();const p=me.pos;for(let q=0;q<14;q++){const an=Math.random()*6.28;R3.sparks.emit(p.x,p.y+0.7,p.z,Math.cos(an)*4,2+Math.random()*3,Math.sin(an)*4,1,0.7,0.25,0.4);}}}}
  // skills
  if(!waiting&&!R3.done&&R3.mode==="race"){const spd=me.speed/me.max,offroad=Math.abs(me.x)>1.05;
    if(me.drift&&spd>0.35&&!offroad)gpSkill("Drift",me.speed*dt*9);
    if(me.draft)gpSkill("Drafting",me.speed*dt*4);
    karts.forEach(o=>{if(o.player)return;const ahead=(o.lap+o.t)>(me.lap+me.t);if(o.ahead&&!ahead&&me.started){const gap=Math.abs(o.x-me.x)*(R3.W-1.2);if(R3.bumpT>1){if(gap<3.3){gpSkill("Near miss",350,true);gpMsg("Near miss");}else gpSkill("Pass",150,true);}}o.ahead=ahead;});
    if(!offroad&&R3.bumpT>0.8)sk.clean+=dt;else if(offroad)sk.clean=0;if(sk.clean>=12){sk.clean=0;gpSkill("Clean racing",250,true);}
    if(sk.cool>0)sk.cool-=dt;sk.idle+=dt;if(sk.chain>0&&sk.idle>2.6)gpBank();}
  if(R3.notes.length){const tn=performance.now()/1000;R3.notes.forEach(n=>{if(!n.alive)return;n.mesh.position.y=n.y+Math.sin(tn*2.2+n.k)*0.25;if(waiting||R3.done)return;const d=(n.t-me.t+1)%1;if(d<0.006&&Math.abs(n.x-me.x)<0.45){n.alive=false;n.mesh.visible=false;gpNote(n);}});}
  if(R3.petals){const p=R3.petals;if(Math.random()<0.5){const tn=R3.curve.getTangentAt((me.t+0.01)%1);const px=me.pos.x+tn.x*(10+Math.random()*25)+(Math.random()-0.5)*26,pz=me.pos.z+tn.z*(10+Math.random()*25)+(Math.random()-0.5)*26;p.emit(px,me.pos.y+4+Math.random()*5,pz,(Math.random()-0.5)*2,-0.6-Math.random()*0.6,(Math.random()-0.5)*2,0.98,0.72,0.84,5);}p.update(dt,0.02);}
  if(R3.waterTex){R3.waterTex.offset.x+=dt*0.006;R3.waterTex.offset.y+=dt*0.003;}
  R3.smoke.update(dt,-1.2);R3.dust.update(dt,-0.4);R3.sparks.update(dt,9);
  // standings + HUD
  const all=karts.slice().sort((a,b)=>(b.lap+b.t)-(a.lap+a.t));R3.board=all;R3.place=all.indexOf(me)+1;
  if(R3.msgT>0){R3.msgT-=dt;if(R3.msgT<=0){const e=$("gp3Msg");if(e)e.classList.remove("show");}}
  const el=(id,v)=>{const e=$(id);if(e&&e.textContent!==v)e.textContent=v;};
  el("gp3Lap","LAP "+Math.min(R3.C.laps,me.lap+1)+"/"+R3.C.laps);el("gp3Time",gpFmt(Math.max(0,R3.time)));
  const pe=$("gp3Pos");if(pe&&pe.dataset.p!==String(R3.place)){pe.dataset.p=String(R3.place);pe.innerHTML=R3.place+"<small>"+gpSuf(R3.place)+"</small><em>/"+karts.length+"</em>";}
  gpSkillHud();
  if(R3.mode==="free"&&R3.songDirty){R3.songDirty=0;const e=$("gp3Song");if(e){const cur=R3.song.length%8,ph=R3.song.slice(R3.song.length-cur);let dots="";for(let i=0;i<8;i++)dots+='<i class="'+(i<cur?"on":"")+'" style="--c:'+(ph[i]?ph[i].c:"#fff")+'"></i>';e.innerHTML='🎵 <b>'+R3.notesGot+' / '+R3.notesTotal+'</b>'+dots;}}
  gpDrawMini($("gp3Map"),R3.C,karts);
  // gearbox + engine sound + speedometer
  const mph=me.speed*GP_MPH;let gear=1;for(let g=1;g<GP_GEARS.length;g++)if(mph>=GP_GEARS[g])gear=g+1;
  const lo=GP_GEARS[gear-1],hi=gear<GP_GEARS.length?GP_GEARS[gear]:180;let rf=0.14+0.8*Math.max(0,Math.min(1,(mph-lo)/(hi-lo)));if(waiting)rf=0.14+Math.random()*0.02;
  if(gear>R3.gear&&!waiting){GPA.play("shift");if(gear>=3)gpFlame(me,0.28);}R3.gear=gear;
  GPA.engine(rf,(waiting?0.2:(me.brakeOn?0.3:1))*(R3.mode==="free"?0.5:1),!!me.drift||(me.brakeOn&&me.speed/me.max>0.55),waiting);
  R3.tachT+=dt;if(R3.tachT>0.04){R3.tachT=0;gpTach(mph,gear,rf);}
}
/* edge speed lines drawn on a half-resolution overlay canvas */
function gpSpeedFx(spd,drift){const cv=R3.fx;if(!cv)return;const x=cv.getContext("2d"),W=R3.fxW,H=R3.fxH;x.clearRect(0,0,W,H);const a=Math.max(0,(spd-0.5)/0.5);if(a<=0.02)return;
  const cx=W/2,cy=H*0.52,R=Math.hypot(W,H)/2;x.lineCap="round";const n=Math.round(10+a*26);
  for(let i=0;i<n;i++){const ang=Math.random()*Math.PI*2;const r0=R*(0.45+Math.random()*0.35),r1=r0+R*(0.12+Math.random()*0.25)*a;const w=0.6+Math.random()*1.6;x.strokeStyle="rgba(255,255,255,"+(0.05+Math.random()*0.22*a)+")";x.lineWidth=w;x.beginPath();x.moveTo(cx+Math.cos(ang)*r0,cy+Math.sin(ang)*r0*0.9);x.lineTo(cx+Math.cos(ang)*r1,cy+Math.sin(ang)*r1*0.9);x.stroke();}
  const g=x.createRadialGradient(cx,cy,R*0.55,cx,cy,R*1.05);g.addColorStop(0,"rgba(0,0,0,0)");g.addColorStop(1,"rgba(0,0,0,"+(0.22*a)+")");x.fillStyle=g;x.fillRect(0,0,W,H);}
function gpRender(dt){
  const me=R3.me,T=R3.T;const tan=R3.curve.getTangentAt(me.t).normalize();const flat=R3.tmpV2.set(tan.x,0,tan.z).normalize();const nor=new T.Vector3(-flat.z,0,flat.x);
  const spd=me.speed/me.max,tall=R3.camera.aspect<1;
  let target,look;
  if(R3.countdown>0.5){const a=Math.max(0,(R3.countdown-0.5)/3.3);   // grid view: a little higher and further back than the chase camera, easing down as the lights count, so the rows ahead stay in frame
    target=me.pos.clone().addScaledVector(flat,-((tall?8.0:6.3)+a*3.2)).add(new T.Vector3(0,(tall?3.9:2.1)+a*1.6,0));look=me.pos.clone().addScaledVector(flat,(tall?9:10)+a*12).add(new T.Vector3(0,tall?-0.6:0.95,0));R3.camPos.copy(target);}
  else{const back=(tall?8.0:6.3)-spd*1.0;target=me.pos.clone().addScaledVector(flat,-back).add(new T.Vector3(0,(tall?3.9:2.1)-spd*0.35,0)).addScaledVector(nor,(me.drift||0)*0.9);
    target.y=Math.max(target.y,me.pos.y+(tall?3.4:1.4));
    look=me.pos.clone().addScaledVector(tan,tall?9:10).add(new T.Vector3(0,tall?-0.6:0.95,0));
    // smooth the offset from the car, not the absolute position: the camera never trails further at speed
    const off=target.sub(me.pos);if(!R3.camOff)R3.camOff=R3.camPos.clone().sub(me.pos);R3.camOff.lerp(off,Math.min(1,dt*4.5));R3.camPos.copy(me.pos).add(R3.camOff);}
  R3.camera.position.copy(R3.camPos);
  R3.karts.forEach(k=>{if(k.player)return;const fwd=(k.pos.x-R3.camPos.x)*flat.x+(k.pos.z-R3.camPos.z)*flat.z;const vis=fwd>3.2;if(k.g.visible!==vis)k.g.visible=vis;if(k.pic){const o=Math.max(0,Math.min(1,(fwd-3.2)/2.2));if(k.pic.pl.material.opacity!==o)k.pic.pl.material.opacity=o;}});
  const sh=R3.shake;if(sh>0){R3.shake=Math.max(0,R3.shake-dt*1.6);const a=sh*0.35;R3.camera.position.x+=(Math.random()-0.5)*a;R3.camera.position.y+=(Math.random()-0.5)*a;}
  if(spd>0.8&&R3.countdown<=0){const a=(spd-0.8)*0.06;R3.camera.position.y+=(Math.random()-0.5)*a;}
  R3.camera.lookAt(look);
  const fovT=(tall?78:60)+Math.min(1.1,spd)*(R3.story?4:11)+(me.draft?2:0);R3.fov+=(fovT-R3.fov)*Math.min(1,dt*3);if(Math.abs(R3.camera.fov-R3.fov)>0.05){R3.camera.fov=R3.fov;R3.camera.updateProjectionMatrix();}
  R3.sky.position.copy(R3.camera.position);if(R3.band)R3.band.position.set(R3.camera.position.x,R3.band.userData.y,R3.camera.position.z);R3.glare.position.copy(R3.camera.position).addScaledVector(R3.sunDir,1500);
  R3.sun.position.copy(me.pos).add(R3.sunOff);R3.sun.target.position.copy(me.pos);R3.sun.target.updateMatrixWorld();
  const pp=R3.post;if(pp){pp.mat.uniforms.t.value=performance.now()/1000;R3.renderer.setRenderTarget(pp.rt);R3.renderer.render(R3.scene,R3.camera);R3.renderer.setRenderTarget(null);R3.renderer.render(pp.scene,pp.cam);}else{R3.renderer.render(R3.scene,R3.camera);gpSpeedFx(R3.countdown>0?0:spd,me.drift);}
}
function gpNote(n){let d=R3.lastDeg+[-2,-1,-1,0,1,1,2][Math.floor(Math.random()*7)];if(d<0)d=1;if(d>GP_SCALE.length-1)d=GP_SCALE.length-2;R3.lastDeg=d;R3.song.push({d,c:n.col});R3.notesGot++;GPA.box(GP_SCALE[d]);
  const p=n.mesh.position,col=new R3.T.Color(n.col);for(let q=0;q<16;q++){const a=Math.random()*6.28;R3.sparks.emit(p.x,p.y,p.z,Math.cos(a)*3,1+Math.random()*3,Math.sin(a)*3,col.r,col.g,col.b,0.6);}
  R3.songDirty=1;if(R3.notesGot%8===0){R3.song.slice(-8).forEach((s,i)=>GPA.box(GP_SCALE[s.d],0.35+i*0.17));gpMsg("🎵 Tune "+(R3.notesGot/8)+" done!");}}
function gpPlaySong(){GPA.init();const s=window._gpSong||[];if(!s.length){toast("Collect some notes first!");return;}s.slice(0,64).forEach((n,i)=>GPA.box(GP_SCALE[n.d],i*0.22+Math.floor(i/8)*0.25));}
function gpFinishFree(){R3.done=true;const got=R3.notesGot,tot=R3.notesTotal,tunes=Math.floor(got/8);const xp=10+Math.min(20,Math.floor(got/3));
  const w0=$("gp3");if(w0)w0.classList.add("done");GPA.play("fanfare");if(got>=tot*0.8)confetti();
  say("Trip complete! You collected "+got+" music notes.");
  let earned=0;if(P){earned=xp;P.xp+=xp;P.race=P.race||{};const prev=P.race[R3.C.id]||{};P.race[R3.C.id]=Object.assign({},prev,{notes:Math.max(got,prev.notes||0),date:today()});if(typeof markTodayPlanDone==="function")markTodayPlanDone("race","race");save();if(typeof syncProgress==="function")syncProgress("finish");}
  window._gpSong=R3.song.slice();
  setTimeout(()=>{if(!R3)return;GPA.stopEngine();const w=$("gp3");if(!w)return;w.insertAdjacentHTML("beforeend",'<div class="gp3-finish"><div class="fz-fin-t">Trip complete! 🎵</div><div class="fz-fin-s" style="font-size:1.25em;margin:8px 0">'+got+' of '+tot+' notes · '+tunes+' tune'+(tunes===1?'':'s')+' · '+gpFmt(R3.time)+(earned?' · +'+earned+' XP':'')+'</div><div class="btn-row" style="margin-top:12px"><button class="btn big" onclick="gpPlaySong()">▶ Play my song</button><button class="btn secondary big" onclick="startRace3D(\''+R3.C.id+'\')">Drive again 🔁</button><button class="btn secondary big" onclick="renderCircuits()">Routes 🗺️</button></div></div>');},1300);}
function gpFinish(){
  if(R3.mode==="free")return gpFinishFree();
  R3.done=true;gpBank();const place=R3.place;const skill=R3.sk.total;const bonus=Math.min(10,Math.floor(skill/2000));const xp=([0,30,20,10,5,5][place]||5)+bonus;
  const w0=$("gp3");if(w0)w0.classList.add("done");
  GPA.play(place<=3?"fanfare":"lap");if(place===1)confetti();
  say(place===1?"You win at "+R3.C.name+"! Horizon champion!":"You finished "+gpOrd(place)+". Great driving!");
  let earned=0;
  if(P){earned=xp;P.xp+=xp;P.race=P.race||{};const prev=P.race[R3.C.id]||{};P.race[R3.C.id]={time:prev.time&&prev.time<R3.time?prev.time:R3.time,place:Math.min(place,prev.place||9),skill:Math.max(skill,prev.skill||0),trap:Math.max(R3.trapBest,prev.trap||0),date:today()};
    if(place===1&&!P.trophies.some(t=>t.type==="race")&&typeof awardTrophy==="function")awardTrophy({type:"race",icon:"🏎️",label:"Grand Fable Champion",color:"#ff2d87",detail:"Won the Grand Fable Horizon race at "+R3.C.name+"."});if(typeof markTodayPlanDone==="function")markTodayPlanDone("race","race");save();if(typeof syncProgress==="function")syncProgress("finish");}
  const rows=R3.board.map((k,i)=>'<div class="'+(k.player?"me":"")+'"><i>'+gpOrd(i+1)+'</i><span>'+esc(k.racer.n)+'</span><span>'+esc(k.racer.car.n)+'</span></div>').join("");
  setTimeout(()=>{if(!R3)return;GPA.stopEngine();const w=$("gp3");if(!w)return;w.insertAdjacentHTML("beforeend",'<div class="gp3-finish"><div class="fz-fin-t">'+gpOrd(place).toUpperCase()+' PLACE</div><div class="fz-res">'+rows+'</div><div class="fz-fin-s">'+gpFmt(R3.time)+' · Skill '+gpNum(skill)+(R3.trapBest?' · Speed trap '+R3.trapBest+' mph':'')+(earned?' · +'+earned+' XP':'')+'</div><div class="btn-row" style="margin-top:12px"><button class="btn big" onclick="startRace3D(\''+R3.C.id+'\')">Race again 🔁</button><button class="btn secondary big" onclick="renderCircuits()">Routes 🏁</button><button class="btn secondary big" onclick="renderRace()">Cars 🚗</button></div></div>');},1300);
}
