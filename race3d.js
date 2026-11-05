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
 {id:"falcon",n:"Rosso Falcon",cls:"S2",pi:960,type:"super",paint:"#d1121c",speed:5,handle:4,accel:5,bio:"Red GT race car, number 7. Big rear wing, fat slicks, glued to the road."},
 {id:"arrow",n:"Silver Arrow",cls:"S2",pi:980,type:"hyper",paint:"#d7dbe0",speed:5,handle:3,accel:5,bio:"Silver hypercar with a giant rear wing."},
 {id:"shogun",n:"Shogun GT",cls:"S1",pi:900,type:"gt",paint:"#f2f2f2",speed:4,handle:5,accel:4,bio:"Japanese super-coupe. Brilliant in the bends."},
 {id:"rally",n:"Alpine Rally",cls:"A",pi:800,type:"rally",paint:"#1d5fd1",speed:3,handle:5,accel:5,bio:"Rally hatchback. Darts through tight mountain corners."},
 {id:"kumasi",n:"Kumasi V8",cls:"A",pi:820,type:"muscle",paint:"#f28a1c",speed:5,handle:2,accel:5,bio:"Muscle coupe. Loves long straights."},
 {id:"kei",n:"Lemon Kei",cls:"B",pi:640,type:"kei",paint:"#f7e85c",speed:3,handle:5,accel:4,bio:"Tiny city car. Nips round every corner."},
 {id:"ridge",n:"Thunder Ridge XL",cls:"A",pi:780,type:"suv",paint:"#2457D6",speed:4,handle:2,accel:3,bio:"Big, steady and strong on the straights."}
];
/* body shapes: z runs along the car, +z is the nose; all in metres */
const GP_SHAPE={
 super:{len:4.7,w:2.04,ride:0.2,rad:0.37,radR:0.39,xf:1.45,xr:-1.32,nose:0.5,hood:0.72,belt:0.8,deck:0.82,tail:0.68,cabF:0.5,roofF:-0.1,roofR:-0.9,cabR:-1.5,roof:1.1,wing:"lip",tyreW:0.3,tyreWR:0.38,hip:0.06},
 hyper:{len:4.8,w:2.1,ride:0.2,rad:0.38,radR:0.4,xf:1.5,xr:-1.35,nose:0.48,hood:0.7,belt:0.78,deck:0.8,tail:0.66,cabF:0.4,roofF:-0.2,roofR:-0.95,cabR:-1.5,roof:1.08,wing:"big",tyreW:0.3,tyreWR:0.4,hip:0.07},
 gt:{len:4.7,w:1.98,ride:0.24,rad:0.38,radR:0.38,xf:1.42,xr:-1.38,nose:0.58,hood:0.86,belt:0.92,deck:0.92,tail:0.8,cabF:0.3,roofF:-0.45,roofR:-1.25,cabR:-1.95,roof:1.26,wing:"duck",tyreW:0.3,tyreWR:0.34,hip:0.04},
 rally:{len:4.2,w:1.86,ride:0.34,rad:0.36,radR:0.36,xf:1.28,xr:-1.28,nose:0.68,hood:0.96,belt:1.02,deck:1.04,tail:1.02,cabF:0.55,roofF:-0.1,roofR:-1.4,cabR:-1.9,roof:1.48,wing:"roof",tyreW:0.28,tyreWR:0.28},
 muscle:{len:4.9,w:1.98,ride:0.26,rad:0.38,radR:0.4,xf:1.5,xr:-1.45,nose:0.64,hood:0.94,belt:0.98,deck:0.94,tail:0.84,cabF:0.1,roofF:-0.55,roofR:-1.3,cabR:-1.95,roof:1.32,wing:"duck",tyreW:0.3,tyreWR:0.36,hip:0.03},
 kei:{len:3.4,w:1.6,ride:0.3,rad:0.3,radR:0.3,xf:1.05,xr:-1.05,nose:0.7,hood:0.92,belt:0.98,deck:1.02,tail:1.0,cabF:0.75,roofF:0.2,roofR:-1.1,cabR:-1.5,roof:1.52,wing:"none",tyreW:0.24,tyreWR:0.24},
 suv:{len:5.3,w:2.05,ride:0.34,rad:0.42,radR:0.42,xf:1.62,xr:-1.62,nose:0.82,hood:1.04,belt:1.2,deck:1.4,tail:1.24,cabF:1.2,roofF:0.82,roofR:-1.88,cabR:-2.36,roof:1.88,wing:"none",tyreW:0.32,tyreWR:0.32,hip:0.025}
};
/* Real car pictures keyed off a green screen (key_cars.py, world_assets.py, wed_assets.py): one WebP sheet per car,
   frames of equal size on a shared ground line laid out in a cols x rows grid (frame f at column f%cols, row f/cols).
   Angle order is always nose-right ... straight ... nose-left (3 or 5 views); the old 6-frame sheets repeat their three
   views with baked exhaust flames, the newer sheets get a separate flame sprite. ppm = pixels per metre, straight view. */
const GP_PICS={
 falcon:{src:"assets/cars/gt7.webp",frames:5,cols:2,rows:3,fw:422,fh:210,ppm:138,flameRelW:0.13,flameBottom:0.05,tyreBottom:[207,207,207,207,207],tyres:[[[40,197,40],[272,207,52],[372,179,40]],[[55,204,45],[300,207,55],[370,181,30]],[[80,207,54],[341,207,54]],[[60,181,40],[125,207,52],[365,202,40]],[[40,177,40],[145,207,50],[380,191,40]]],lights:[[[115,139,1],[35,100,0.8],[240,104,0.8]],[[162,142,1],[60,104,0.8],[282,107,0.8]],[[210,144,1],[88,108,0.8],[336,108,0.8]],[[270,143,1],[150,106,0.8],[372,104,0.8]],[[298,137,1],[178,104,0.8],[388,100,0.8]]]},   // GT race-car sheet (ChatGPT, lz-gp-gates-shots/art/gt_a.png); the old road-car sheet red5.webp stays for rollback
 arrow:{src:"assets/cars/silver5.webp",frames:5,cols:2,rows:3,fw:474,fh:277,ppm:176,tyreBottom:[274,274,274,275,275],tyres:[[[40,262,40],[340,274,72],[405,240,36]],[[75,270,50],[365,272,60]],[[86,271,64],[388,271,64]],[[110,272,60],[400,270,50]],[[65,240,36],[132,275,71],[435,262,40]]],hero:"assets/world/hero_arrow.webp",lights:[[[89,144,0.8],[275,159,0.8]],[[122,160,0.8],[338,162,0.8]],[[127,161,0.8],[344,162,0.8]],[[133,161,0.8],[350,160,0.8]],[[196,159,0.8],[383,146,0.8]]]},
 shogun:{src:"assets/cars/white5.webp",frames:5,cols:2,rows:3,fw:499,fh:268,ppm:198.77,tyreBottom:[265,265,266,266,267],tyres:[[[53,248,61],[319,265,63],[472,216,34]],[[96,264,52],[401,265,53]],[[88,266,56],[409,266,57]],[[100,266,53],[404,262,54]],[[27,218,34],[178,267,62],[445,250,61]]],hero:"assets/world/hero_shogun.webp",lights:[[[150,119,0.8],[258,120,0.8]],[[130,119,0.8],[354,133,0.8]],[[127,117,0.8],[365,127,0.8]],[[149,124,0.8],[369,137,0.8]],[[238,122,0.8],[340,125,0.8]]]},
 rally:{src:"assets/cars/rally5.webp",frames:5,cols:2,rows:3,fw:512,fh:345,ppm:179.15,tyreBottom:[342,342,343,343,344],tyres:[[[40,305,72],[338,342,83],[480,238,44]],[[102,340,62],[400,342,58]],[[102,343,58],[408,343,58]],[[112,343,57],[410,341,61]],[[32,240,44],[172,344,82],[470,307,70]]],hero:"assets/world/hero_rally.webp",lights:[[[54,147,0.8],[295,169,0.8]],[[117,172,0.8],[374,175,0.8]],[[125,174,0.8],[384,175,0.8]],[[137,176,0.8],[394,174,0.8]],[[214,171,0.8],[457,148,0.8]]]},
 kumasi:{src:"assets/cars/muscle5.webp",frames:5,cols:2,rows:3,fw:489,fh:259,ppm:169.71,tyreBottom:[256,256,256,256,257],tyres:[[[22,186,40],[166,256,68],[404,242,58]],[[120,256,59],[388,254,58]],[[100,256,54],[385,256,53]],[[102,254,58],[368,256,60]],[[86,242,60],[324,257,66],[466,188,40]]],rev:true,hero:"assets/world/hero_kumasi.webp",lights:[[[234,155,0.8],[357,154,0.8]],[[169,156,0.8],[386,155,0.8]],[[125,156,0.8],[360,156,0.8]],[[102,155,0.8],[318,156,0.8]],[[130,154,0.8],[253,157,0.8]]]},
 kei:{src:"assets/cars/kei5.webp",frames:5,cols:2,rows:3,fw:492,fh:370,ppm:209.83,tyreBottom:[367,367,368,368,369],tyres:[[[47,337,61],[320,367,64],[462,268,44]],[[82,360,57],[380,367,55],[447,262,36]],[[94,368,52],[397,368,53]],[[43,262,36],[112,368,54],[408,361,56]],[[28,268,44],[171,369,61],[443,339,57]]],hero:"assets/world/hero_kei.webp",lights:[[[35,184,0.8],[266,201,0.8]],[[92,199,0.8],[347,203,0.8]],[[115,206,0.8],[375,206,0.8]],[[146,203,0.8],[398,200,0.8]],[[224,202,0.8],[453,185,0.8]]]},
 ridge:{src:"assets/cars/ridge5.webp",frames:5,cols:2,rows:3,fw:466,fh:289,ppm:151.71,tyreBottom:[286,286,286,286,286],tyres:[[[65,279,57],[296,286,56],[422,257,56]],[[84,282,52],[326,286,50],[396,250,30]],[[108,286,46],[355,286,45]],[[75,255,40],[142,286,51],[383,282,53]],[[42,258,52],[168,286,57],[396,280,58]]],hero:"assets/world/hero_ridge.webp",lights:[[[30,116,0.8],[231,115,0.8]],[[58,117,0.8],[291,117,0.8]],[[111,118,0.8],[351,118,0.8]],[[176,119,0.8],[408,119,0.8]],[[229,117,0.8],[447,117,0.8]]]}
};   // wed_assets2.py: ChatGPT five-view sheets (hard/slight/straight) + hero shots; the Rosso Falcon keeps the Gemini red5 sheet.
/* tyres: every photographed tyre bottom per packed frame as [centre x px, lowest tyre row px, tread width px] (lz-wheels-shots/fable/overlay/tyres2.py
   plus hand checks); the contact shadows are placed from these, so each one sits under the tyre the picture shows. rev: the sheet is packed
   nose-left ... nose-right (the muscle sheet), so logical frame f shows packed frame angles-1-f. */
/* Wheel openings measured in each packed frame (frame-local pixels, top-left origin). Each ellipse is [cx,cy,w,h,tilt].
   Turning views patch exposed rim faces; every straight view patches the two photographed rear tyre backs with scrolling tread. */
const GP_WHEEL_VIEWS={
 falcon:[null,null,{kind:"tread",dir:1,p:[[79,188,16,30,0],[341,188,16,30,0]]},null,null],
 arrow:[{dir:1,p:[[377,199,39,88,0.04]]},null,{kind:"tread",dir:1,p:[[65,242,15,43,0],[409,242,15,43,0]]},null,{dir:-1,p:[[97,203,39,88,-0.04]]}],
 shogun:[{dir:1,p:[[350,204,39,80,0.03],[480,181,23,58,0.02]]},null,{kind:"tread",dir:1,p:[[72,246,23,42,0],[427,246,23,42,0]]},null,{dir:-1,p:[[151,207,39,80,-0.03],[18,184,23,58,-0.02]]}],
 rally:[{dir:1,p:[[382,254,47,99,0.02],[495,187,31,70,0.02]]},null,{kind:"tread",dir:1,p:[[111,316,20,54,0],[401,316,20,54,0]]},null,{dir:-1,p:[[130,260,47,99,-0.02],[17,202,31,70,-0.02]]}],
 kumasi:[{dir:1,p:[[135,190,38,81,0.02],[16,145,25,57,0.02]]},{dir:1,p:[[89,190,17,61,0.01]]},{kind:"tread",dir:1,p:[[92,228,25,57,0],[397,228,25,57,0]]},{dir:-1,p:[[400,190,17,61,-0.01]]},{dir:-1,p:[[352,204,38,81,-0.02],[475,153,25,57,-0.02]]}],
 kei:[{dir:1,p:[[350,288,51,108,0.03],[464,215,39,78,0.02]]},{dir:1,p:[[410,276,31,86,0.01],[448,218,21,61,0.01]]},{kind:"tread",dir:1,p:[[75,330,27,74,0],[417,330,27,74,0]]},{dir:-1,p:[[57,229,23,65,-0.01]]},{dir:-1,p:[[147,290,51,108,-0.03],[30,223,39,78,-0.02]]}],
 ridge:[{dir:1,p:[[315,218,47,84,0.02],[435,197,39,65,0.02]]},{dir:1,p:[[347,214,18,86,0.01],[396,209,27,80,0.01]]},{kind:"tread",dir:1,p:[[100,255,20,57,0],[366,255,20,57,0]]},{dir:-1,p:[[124,229,20,88,-0.01]]},{dir:-1,p:[[150,219,47,84,-0.02],[30,195,39,65,-0.02]]}]
};
function gpPicFrames(D){return D.frames>=6?{angles:3,flames:true}:{angles:D.frames,flames:false};}   // 6-frame sheets = 3 views + 3 flame views
function gpPicOffset(D,f){const c=f%D.cols,r=Math.floor(f/D.cols);return[c/D.cols,1-(r+1)/D.rows];}
function gpPicMid(D){return D.frames>=6?1:(D.frames-1)>>1;}
function gpPicPacked(D,f,angles){return D.rev?(angles-1-(f%angles))+(f-f%angles):f;}   // logical (nose-right first) → packed frame index
function gpPicAnchor(pc,frame){const D=pc.D,f=gpPicPacked(D,frame,pc.angles)%pc.angles,b=D.tyreBottom?D.tyreBottom[f]:D.fh-1;pc.bottomPx=b;pc.bottomLocalY=(D.fh/2-b-1)/D.ppm;pc.pl.position.y=-pc.bottomLocalY;if(pc.mat)pc.mat.uniforms.uBase.value=pc.bottomLocalY;}
/* Gemini world pictures (world_assets.py): a 360-degree sky band with Fuji in the middle, a billboard
   atlas (cherry, cedar, torii, lantern, banner), one guard-rail bay, tileable asphalt, the dial face. */
const GP_WORLD={
 sky:{src:"assets/world/sky.webp",w:2048,h:224,hor:0.6562,mpp:4.6,top:"#a0969e",haze:"#bc845d",r:1500,horY:55},
 skyDusk:{src:"assets/world/sky_dusk.webp",w:2048,h:279,hor:0.5556,mpp:4.6,top:"#303162",haze:"#905641",r:1500,horY:55},   // circuits with sky:"dusk"
 trees:{src:"assets/world/trees.webp",w:864,h:795,cells:{cherryS:{x:4,y:152,w:183,h:202,m:7},cherryM:{x:191,y:70,w:276,h:284,m:9.5},cherryL:{x:471,y:4,w:389,h:350,m:12},cedarA:{x:4,y:358,w:153,h:433,m:17},cedarB:{x:161,y:358,w:157,h:433,m:16},maple:{x:322,y:485,w:291,h:306,m:8.5}}},
 smoke:{src:"assets/world/smoke.webp"},petal:{src:"assets/world/petal.webp"},
 fx:{src:"assets/world/fx.webp",box:48,petals:4,confetti:10},   // podium confetti + petals: 48 px cells, petals first
 title:"assets/world/title.webp",
 props:{src:"assets/world/props.webp",w:746,h:357,cells:{cherry:{x:4,y:79,w:222,h:274,m:9.5},cedar:{x:230,y:4,w:105,h:349,m:17},torii:{x:339,y:129,w:220,h:224,m:7.5},lantern:{x:563,y:138,w:100,h:215,m:2.3},banner:{x:667,y:66,w:75,h:287,m:4.6}}},
 rail:{src:"assets/world/rail.webp",len:2.4,hgt:0.86},
 road:{src:"assets/world/road.webp"},
 speedo:{src:"assets/world/speedo.webp",a0:137,a1:404.5,max:200},
 logo:"assets/world/logo.webp",hero:"assets/world/hero.webp",card:"assets/world/card.webp",
 /* Wednesday drop (wed_assets.py): exhaust flame sprite, start gantry (lamp centres + LED screen as fractions of the picture),
    pit building, grandstand, crowd strip, kerb tile, trackside atlas (ad boards, tyre wall, 100/200/300 plates), podium */
 flame:{src:"assets/world/flame.webp",w:131,h:56,cx:-0.001,bottom:0.084,relW:0.263},
 gantry:{src:"assets/world/gantry.webp",w:1024,h:484,lights:[[0.3873,0.5472,0.0156],[0.4429,0.5466,0.0159],[0.4991,0.546,0.0159],[0.5536,0.5466,0.0159],[0.6095,0.5466,0.0159]],screen:[0.2532,0.1472,0.5058,0.2577],posts:[0.06,0.9386]},
 pits:{src:"assets/world/pits.webp",w:1024,h:212,hgt:13},
 stand:{src:"assets/world/stand.webp",w:1024,h:513,hgt:15},
 crowd:{src:"assets/world/crowd.webp",w:1024,h:576,mPerU:12},   // four staggered rows of fans; one 12 m repeat, about as tall as the bank
 kerb:{src:"assets/world/kerb.webp",w:64,h:128},
 boards:{src:"assets/world/boards.webp",w:1015,h:150,cells:{ad1:{x:4,y:31,w:161,h:115,m:2.6},ad2:{x:169,y:31,w:167,h:115,m:2.6},ad3:{x:340,y:31,w:162,h:115,m:2.6},tyres:{x:506,y:4,w:325,h:142,m:2.2},b100:{x:835,y:106,w:56,h:40,m:1.5},b200:{x:895,y:103,w:56,h:43,m:1.5},b300:{x:955,y:106,w:56,h:40,m:1.5}}},
 podium:{src:"assets/world/podium.webp",w:1024,h:656,steps:{p2:[0.23,0.7607],p1:[0.5,0.6784],p3:[0.77,0.814]}}
};
const GP_INTRO="assets/intro_race.mp4";
/* videos stream from the network on demand (never precached): finish celebration, podium loop, menu flyover loop */
const GP_VIDEO={win:"assets/video/win.mp4",podium:"assets/video/podium.mp4",flyover:"assets/video/flyover.mp4",poster:"assets/video/flyover_poster.webp"};
const GP_PAINTS=["#d1121c","#d7dbe0","#f2f2f2","#1d5fd1","#f28a1c","#f7e85c","#0d0f14","#2e9e57","#8e3bd6","#ff5fa2"];
const GP_SCALE=[392,440,523.25,587.33,659.25,783.99,880,1046.5,1174.66];
const GP_DRIVERS=["Kofi","Ama","Esi","Kwame","Abena"];
/* routes: each circuit is a list of straights ["S",metres] and arcs ["R"|"L",radius,degrees] walked from the
   start/finish line heading north (-z); the loop is designed to close on itself (checked by lz-fable-shots/f1/design.js).
   Every circuit has a long main straight (grid, gantry, pit wall, grandstands), a tight hairpin, a chicane, flowing esses,
   a fast sweeper and medium 90-degree corners; `elev` is an up-and-down profile along the lap in metres. */
const GP_CIRCUITS=[
 {id:"kawaguchi",name:"Lake Kawaguchi Circuit",laps:2,stars:1,blurb:"Cherry blossom and Mount Fuji by the lake",tree:"cherry",hills:2.4,grass:0x7fa65a,lake:{x:30,z:-520,rx:420,rz:230},town:1,city:0.35,fuji:[40,-1180],elev:[3,1.5,0.4],
  look:{top:"#4f86cf",mid:"#a3c6e6",hor:"#f3d7ad",glow:"#ffe3b0",sun:"#ffd7a6",sunI:1.25,hemi:0.72,dir:[0.62,0.34,-0.58],haze:"#d9dcea",hill:"#5d6f98",time:"Golden hour by the lake",night:0,tint:[1,1,1]},
  story:{paper:"#f7f0e1",ink:"#2b2735",hill:"#a7c7a0",top:"#a9d8ee",hor:"#fbf3e2"},
  segs:[["S",95],["R",30,90],["S",40],["R",28,90],["L",50,45],["R",50,90],["L",50,45],["S",45],["R",22,55],["L",22,55],["S",55],["L",26,90],["S",85],["R",17,180],["S",100.2],["R",90,90],["S",150.5]]},
 {id:"hakone",name:"Hakone Mountain Circuit",laps:2,stars:2,blurb:"Cedar forest and mountain bends",tree:"cedar",hills:5.5,grass:0x5f8a46,lake:null,town:0,city:0,fuji:[-120,-1150],mtn:[{x:330,z:-60,r:260,h:30},{x:-330,z:120,r:220,h:28}],elev:[5,2.5,1.2],
  look:{top:"#5b92d6",mid:"#b2d0ea",hor:"#eadfc8",glow:"#fff0c8",sun:"#fff0d2",sunI:1.2,hemi:0.78,dir:[-0.5,0.5,-0.55],haze:"#cfd8e3",hill:"#4b6a8f",time:"Misty mountain morning",night:0,tint:[0.9,0.97,1.06]},
  story:{paper:"#f7f0e1",ink:"#2d2632",hill:"#c3b68c",top:"#8fb8e6",hor:"#fde3bf"},
  segs:[["S",90],["L",28,90],["S",45],["L",30,90],["S",30],["R",45,50],["L",45,100],["R",45,50],["S",35],["L",20,60],["R",20,60],["S",45],["R",26,90],["S",80],["L",17,180],["S",109],["L",80,90],["S",174.5]]},
 {id:"tokyo",name:"Tokyo Bay Street Circuit",laps:2,stars:2,blurb:"Sunset over the bay and the city",tree:"mixed",sky:"dusk",hills:1.6,grass:0x7f9a5c,lake:{x:560,z:0,rx:300,rz:700,sea:1},town:0,city:1,fuji:[-200,-1200],elev:[2.5,1.2,2.2],
  look:{top:"#3c5f9e",mid:"#9ab2d6",hor:"#f7b98a",glow:"#ffc48a",sun:"#ffc07a",sunI:1.15,hemi:0.62,dir:[-0.75,0.28,-0.45],haze:"#d8c8c8",hill:"#5a5f86",time:"Sunset over the bay",night:0.5,tint:[1.1,0.9,0.8]},
  story:{paper:"#e8d3c6",ink:"#241c30",hill:"#7a7aa6",top:"#3b3f78",hor:"#f2a88e"},
  segs:[["S",105],["R",32,90],["S",30],["R",24,60],["L",24,60],["S",35],["R",30,90],["S",45],["L",48,45],["R",48,90],["L",48,45],["S",30],["L",24,90],["S",95],["R",17,180],["S",187.6],["R",100,90],["S",85.8]]},
 /* ---- street + themed courses (theme: city / accra / coast) - built by gpThemeWorld; zones are lap fractions ---- */
 {id:"city",name:"City Circuit",theme:"city",laps:2,stars:3,tree:"none",hills:0.35,grass:0x8b9178,lake:null,town:0,city:0,fuji:null,ridges:0,elev:[1.2,0.5,0.3],downtown:[0.8,0.28],
  traffic:[["sedan",4],["hatch",3],["taxi",3],["van",2],["bus",2]],blurb:"Downtown streets, traffic, a tunnel and a canal bridge",
  zones:{tunnel:[[0.294,0.371]],bridge:[[0.584,0.613]],avenue:[[0.69,0.915]]},
  look:{top:"#3f7fd6",mid:"#a9c8ea",hor:"#f0e2c8",glow:"#fff0c8",sun:"#fff1d6",sunI:1.5,hemi:0.55,dir:[0.55,0.6,-0.45],haze:"#cfd9e6",hill:"#5a6a88",time:"Sunny afternoon downtown",night:0,tint:[1,1,1]},
  story:{paper:"#f4efe6",ink:"#262a33",hill:"#a9b4c4",top:"#a9d0ee",hor:"#fbf3e2"},
  segs:[["S",150],["R",24,90],["S",80],["L",20,90],["S",50],["R",20,90],["S",193.14],["R",40,90],["S",100],["R",26,45],["L",26,45],["S",175.34],["R",22,90],["S",320],["R",20,90],["S",90]]},
 {id:"accra",name:"Accra Streets",theme:"accra",laps:2,stars:2,tree:"palm",hills:0.8,grass:0x9a9a5c,town:0,city:0,fuji:null,ridges:0,elev:[1.2,0.6,0.5],seaSide:-1,parkSide:1,seaZone:[0.26,0.4],
  traffic:[["ghtaxi",5],["trotro",4],["sedan",3],["hatch",2]],blurb:"Black Star Gate, the Labadi beach road, Osu shops",special:"gh",
  zones:{square:[[0.93,0.097]],beach:[[0.15,0.41]],shops:[[0.45,0.78]],park:[[0.875,0.93]]},
  look:{top:"#2f86e0",mid:"#9cc9ef",hor:"#f3e3c3",glow:"#fff4d6",sun:"#fff4dc",sunI:1.6,hemi:0.6,dir:[0.35,0.8,-0.35],haze:"#e6dccb",hill:"#7d8a6a",time:"Hot sunny afternoon in Accra",night:0,tint:[1,1,1]},
  story:{paper:"#f8eedc",ink:"#2b2420",hill:"#c9b27a",top:"#8ec8f0",hor:"#fde9c4"},
  segs:[["S",140],["R",30,90],["S",60],["R",140,25],["L",140,25],["S",215.83],["R",25,90],["S",120],["R",18,90],["S",200],["L",18,90],["S",90],["R",18,90],["S",150],["R",45,90],["S",100.27]]},
 {id:"coast",name:"Coast Road",theme:"coast",laps:2,stars:1,tree:"none",hills:3.2,grass:0x7ea456,town:0,city:0,fuji:null,ridges:14,elev:[3.5,1.6,0.9],seaSide:-1,seaZone:[0.43,0.6],
  traffic:[["sedan",3],["hatch",2],["van",2],["trotro",1]],blurb:"Dirt lot, water splash, country lanes, highway bridge, forest",
  zones:{dirt:[[0.955,0.125]],ford:[[0.156,0.168]],country:[[0.13,0.38]],highway:[[0.38,0.876]],bridge:[[0.45,0.52]],forest:[[0.876,0.99]]},
  look:{top:"#4a83d0",mid:"#a8c7e8",hor:"#f6d3a3",glow:"#ffe0b0",sun:"#ffd9a8",sunI:1.45,hemi:0.6,dir:[-0.6,0.45,-0.5],haze:"#dbd7d0",hill:"#4f6a7f",time:"Golden evening on the coast",night:0,tint:[1.04,1,0.95]},
  story:{paper:"#f7f0e1",ink:"#2d2632",hill:"#a7c7a0",top:"#a9d8ee",hor:"#fbf3e2"},
  segs:[["S",120],["R",25,90],["S",150],["L",32,60],["R",32,60],["L",32,40],["R",32,40],["S",40],["R",35,90],["S",206.32],["R",80,90],["S",220.46],["R",30,90],["L",28,45],["R",28,45],["S",60]]}
];
/* walk the segment list: a point every ~9 m on straights and every ~6 m (or 15 degrees) round arcs; the last point is the start again, so it is dropped */
function gpTrackPts(segs){const pts=[];let x=0,z=0,h=0,since=99;const push=()=>{pts.push([+x.toFixed(2),+z.toFixed(2)]);since=0;};push();
  segs.forEach(sg=>{const arc=sg[0]!=="S",R=sg[1],L=arc?R*sg[2]*Math.PI/180:sg[1],sgn=sg[0]==="R"?1:-1,every=arc?Math.min(6,R*0.26):Math.min(9,L/Math.max(1,Math.round(L/9)));let d=0;
    while(d<L-0.01){const st=Math.min(arc?0.5:1,L-d);x+=Math.sin(h)*st;z-=Math.cos(h)*st;if(arc)h+=sgn*st/R;d+=st;since+=st;if(since>=every-0.001&&L-d>(arc?2:3))push();}push();});
  pts.pop();return pts;}
GP_CIRCUITS.forEach(c=>{c.pts=gpTrackPts(c.segs);c.mainS=[c.segs[c.segs.length-1][1],c.segs[0][1]];
  c.km=c.segs.reduce((d,q)=>d+(q[0]==="S"?q[1]:q[1]*q[2]*Math.PI/180),0)/1000;
  if(c.seaZone&&c.seaSide){   // the sea: a huge ellipse just beyond the beach / highway side, shore ~40 m from the road
    const P=c.pts,n=P.length,i0=Math.floor(c.seaZone[0]*n),i1=Math.floor(c.seaZone[1]*n),im=(i0+i1)>>1;let mx=0,mz=0;for(let i=i0;i<=i1;i++){mx+=P[i][0];mz+=P[i][1];}mx/=(i1-i0+1);mz/=(i1-i0+1);
    const a=P[(im-2+n)%n],b=P[(im+2)%n],tx=b[0]-a[0],tz=b[1]-a[1],tl=Math.hypot(tx,tz)||1,nx=-tz/tl*c.seaSide,nz=tx/tl*c.seaSide;
    let cx=0,cz=0;P.forEach(p=>{cx+=p[0];cz+=p[1];});cx/=n;cz/=n;const R=520,along=1400,ew=Math.abs(nx)>Math.abs(nz);
    c.lake={x:mx+nx*(14+0.92*R)-cx,z:mz+nz*(14+0.92*R)-cz,rx:ew?R:along,rz:ew?along:R,sea:1};}});
const GP_GRIP=24;                        // tyre grip (lateral g in game units): corner speed = sqrt(GRIP * radius)
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
      const nb=this.ctx.createBuffer(1,this.ctx.sampleRate,this.ctx.sampleRate),d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;this.noiseBuf=nb;
      try{const sb=this.ctx.createBufferSource();sb.buffer=this.ctx.createBuffer(1,1,22050);sb.connect(this.ctx.destination);sb.start(0);}catch(e){}}   // a silent sample inside the tap fully unlocks iOS audio
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
    case"bonk":this.tone(210,0.12,"triangle",0.13,130);this.noise(0.08,0.08,700);break;   // soft car-to-car bump
    case"lap":this.tone(990,0.15,"triangle",0.2);this.tone(1320,0.28,"triangle",0.2,null,0.12);break;
    case"fanfare":[523,659,784,1047].forEach((f,i)=>this.tone(f,0.3,"triangle",0.22,null,i*0.14));this.tone(1047,1.0,"triangle",0.2,null,0.62);this.tone(784,1.0,"triangle",0.12,null,0.62);break;}}
};


/* first tap anywhere on the racer screens wakes the game audio (iPad keeps WebAudio asleep until a gesture), so the first countdown beep is on time */
function gpAudioUnlock(){if(window._gpAU)return;window._gpAU=true;const f=()=>{GPA.init();if(GPA.ctx&&GPA.ctx.state==="running")["pointerdown","touchend","click","keydown"].forEach(t=>document.removeEventListener(t,f,true));};["pointerdown","touchend","click","keydown"].forEach(t=>document.addEventListener(t,f,true));}
/* ---------- one-time CSS: Horizon look (default) + storybook modifier ---------- */
function gpCss(){if(document.getElementById("gpV4Css"))return;const s=document.createElement("style");s.id="gpV4Css";s.textContent=`
.fz-pic{position:relative;display:block;width:100%;aspect-ratio:2.4;overflow:hidden;border-radius:10px;background:linear-gradient(#5f8fd0,#c9dcf0 55%,#4a5a3c 56%,#2b3524)}
.fz-pic.hero{background:#0a0d18 var(--bg) center/cover no-repeat}
.fz-pic.hero::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,13,24,0) 40%,rgba(10,13,24,.55) 100%)}
.fz-pic i{position:absolute;left:50%;top:5%;height:90%;aspect-ratio:var(--ar,1.74);transform:translateX(-50%);overflow:hidden;filter:drop-shadow(0 10px 8px rgba(0,0,0,.45))}
.fz-pic img{display:block;height:100%;width:auto;margin-left:-100%}
.fz-thumb{display:block;background-repeat:no-repeat;z-index:1}
.fz-pic.hero .fz-thumb{top:8%;height:88%;filter:drop-shadow(0 12px 10px rgba(0,0,0,.6))}
.fz-pic.shot{background:#0a0d18 var(--bg) center/cover no-repeat}
.story .fz-pic{background:linear-gradient(#e3f1ef,#f7f0e1);border:2px solid #2b2735}
.fz-bgvid{position:absolute;inset:0;overflow:hidden;border-radius:18px;z-index:0;pointer-events:none}
.fz-bgvid video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.55;filter:saturate(1.1)}
.fz-bgvid::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,13,24,.2),rgba(10,13,24,.55) 60%,rgba(10,13,24,.92) 100%)}
.fz-shell>*:not(.fz-bgvid){position:relative;z-index:1}
.fz-shell.story .fz-bgvid{display:none}
.fz-podium{position:relative;width:min(560px,92%);aspect-ratio:1024/656;margin:2px auto 0;background:var(--pod) center bottom/contain no-repeat}
.fz-podium .fz-step{position:absolute;transform:translate(-50%,-100%);display:flex;flex-direction:column;align-items:center;gap:2px;width:30%}
.fz-podium .fz-step .fz-thumb{height:clamp(34px,7.5vw,74px);filter:drop-shadow(0 6px 6px rgba(0,0,0,.6))}
.fz-podium .fz-step b{font-size:clamp(11px,1.5vw,15px);font-style:italic;text-transform:uppercase;background:rgba(10,12,25,.78);padding:2px 8px;border-radius:4px;white-space:nowrap;max-width:100%;overflow:hidden;text-overflow:ellipsis}
.fz-podium .fz-step.me b{background:linear-gradient(90deg,#ff2d87,#ff7a00)}
.gp3-wrap.v3 .gp3-finish video.fz-podvid{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.45;z-index:-1}
.gp3-wrap.v3 .gp3-finish canvas.fz-fx{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:3}
.gp3-wrap.v3 .gp3-finish.pod{justify-content:flex-start;padding-top:2%;overflow:hidden}
.gp3-wrap.v3 .gp3-finish.pod .fz-res{margin:4px 0;font-size:clamp(11px,1.4vw,14px)}.gp3-wrap.v3 .gp3-finish.pod .fz-res div{padding:2px 10px}
@media (max-height:520px){.fz-podium{width:min(300px,60%)}.gp3-wrap.v3 .gp3-finish.pod .fz-res{display:none}}
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
.fz-tabs{display:flex;gap:6px;margin:10px auto 12px;padding:5px;max-width:560px;border-radius:999px;background:rgba(10,15,36,.75);border:1px solid rgba(255,255,255,.12)}
.fz-tabs button{flex:1;min-height:56px;border:0;border-radius:999px;background:transparent;color:#cfd6e6;font:inherit;font-size:17px;font-weight:900;font-style:italic;cursor:pointer}
.fz-tabs button.on{background:linear-gradient(90deg,#ff2d87,#ff7a00);color:#fff;box-shadow:0 4px 0 #b3005a}
.fz-tracks{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
.fz-track{position:relative;display:flex;flex-direction:column;gap:4px;padding:8px 8px 10px;border-radius:20px;border:2px solid rgba(0,229,255,.18);background:#161f3d;color:#fff;text-align:left;cursor:pointer;font:inherit;box-shadow:0 0 12px rgba(0,229,255,.12),0 6px 0 #0a0f24;transition:transform .12s}
.fz-track:active{transform:translateY(3px) scale(.99)}
.fz-tpic{position:relative;display:block;aspect-ratio:16/9;border-radius:14px;overflow:hidden;background:linear-gradient(#5f8fd0,#c9dcf0 55%,#4a5a3c 56%,#2b3524)}
.fz-tpic img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.fz-tpic canvas{position:absolute;right:6px;bottom:6px;width:34%;height:auto;filter:drop-shadow(0 2px 3px rgba(0,0,0,.6))}
.fz-tag{position:absolute;left:8px;top:8px;padding:3px 9px;border-radius:8px;background:rgba(10,15,36,.82);color:var(--tg);font-style:italic;font-weight:900;font-size:12px;letter-spacing:.08em}
.fz-gh{position:absolute;right:8px;top:8px;display:flex;align-items:center;gap:5px;padding:3px 8px;border-radius:999px;background:rgba(10,15,36,.82);font-style:normal;font-weight:800;font-size:12px}
.fz-flag{display:inline-block;width:22px;height:14px;border-radius:2px;background:linear-gradient(#ce1126 33.3%,#fcd116 33.3% 66.6%,#006b3f 66.6%);position:relative}
.fz-flag::after{content:"★";position:absolute;left:50%;top:50%;transform:translate(-50%,-52%);font-size:8px;color:#000}
.fz-kente{display:block;height:10px;border-radius:5px;background:repeating-linear-gradient(90deg,#f2b705 0 14px,#0b7a3e 14px 20px,#c8102e 20px 30px,#111 30px 33px,#f2b705 33px 42px,#0b7a3e 42px 50px)}
.fz-track.gh{border-color:#fcd116;box-shadow:0 0 16px rgba(252,209,22,.35),0 6px 0 #0a0f24}
.fz-track b{font-size:clamp(16px,2vw,21px);font-weight:900;font-style:italic;text-transform:uppercase;letter-spacing:-.01em;line-height:1.05}
.fz-trow{display:flex;align-items:center;justify-content:space-between}
.fz-stars i{font-style:normal;font-size:20px;color:rgba(255,255,255,.22)}.fz-stars i.on{color:#ffd166;text-shadow:0 0 6px rgba(255,209,102,.6)}
.fz-km{font-weight:900;font-style:italic;font-size:16px}
.fz-track small{font-size:12px;color:#aeb9cf;line-height:1.3}
.fz-hint{text-align:center;margin:12px 0 0;color:#cfd6e6;font-size:14px}
.fz-link{font:inherit;font-weight:800;color:#2fd3c3;background:none;border:0;cursor:pointer;min-height:44px;padding:0 8px}
.fz-opts{display:flex;flex-direction:column;gap:12px;max-width:760px;margin:0 auto}
.fz-opt{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:18px;background:rgba(22,31,61,.88);border:1px solid rgba(255,255,255,.1)}
.fz-ol{flex:0 0 150px;font-weight:900;font-style:italic;font-size:17px;color:#fff}
.fz-opt>div{flex:1;display:flex;gap:8px;flex-wrap:wrap}
.fz-opt button{flex:1;min-width:84px;min-height:64px;border-radius:999px;border:2px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);color:#fff;font:inherit;font-size:17px;font-weight:900;cursor:pointer;box-shadow:0 5px 0 rgba(0,0,0,.35)}
.fz-opt button.on{background:linear-gradient(135deg,#ff2d87,#ff7a00);border-color:transparent;box-shadow:0 5px 0 #b3005a}
.fz-opt button:active{transform:translateY(3px);box-shadow:0 2px 0 rgba(0,0,0,.35)}
.fz-garage-row{text-align:center;margin-top:4px}
@media (max-width:820px){.fz-tracks{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:560px){.fz-tracks{grid-template-columns:1fr}.fz-opt{flex-direction:column;align-items:stretch}.fz-ol{flex:none}.fz-tabs button{font-size:15px}}
.fz-shell.story .fz-track{background:#f7f0e1;color:#2b2735;border:3px solid #2b2735}.fz-shell.story .fz-opt{background:#f7f0e1}.fz-shell.story .fz-ol,.fz-shell.story .fz-opt button{color:#2b2735}
@media (max-width:600px),(max-height:520px){body:has(#gp3) #topbar{display:none}}   /* phones: the app bar would cover the race HUD; the race has its own quit + sound buttons */
.fz-ck{position:absolute;inset:0;width:100%;height:100%;z-index:2;pointer-events:none;display:none}
.gp3-wrap.ck .fz-ck{display:block}.gp3-wrap.ck .fz-tach{display:none}
.fz-btn.cam{top:110px}
.fz-route{display:flex;flex-direction:column;gap:6px;padding:10px;border-radius:16px;border:2px solid rgba(255,255,255,.14);background:linear-gradient(160deg,#1c2238,#0b0f1e);color:#fff;font-family:inherit;cursor:pointer;text-align:left}
.fz-route:hover{border-color:#ff2d87}
.fz-route canvas{width:100%;height:auto;border-radius:10px}
.fz-route b{font-size:16px;font-style:italic;text-transform:uppercase}.fz-route small{font-size:12px;color:#cdd6e6}
.fz-card{background:rgba(20,24,44,.72)!important;color:#f3eaff!important;border:1px solid rgba(255,45,135,.3)!important}
.fz-card p{color:#dcd6ea!important}
.fz-mode{display:flex;gap:10px;justify-content:center;margin:0 0 12px;flex-wrap:wrap}
.fz-mode button{font:inherit;font-size:15px;font-weight:800;padding:10px 16px;border-radius:14px;border:2px solid rgba(255,255,255,.2);background:rgba(255,255,255,.06);color:#fff;cursor:pointer}
.fz-mode button.on{background:linear-gradient(90deg,#ff2d87,#ff7a00);border-color:transparent}
.gp3-wrap.v3{--tach:clamp(118px,14vw,172px);--ped:clamp(146px,18vw,186px);--pad:clamp(90px,9.5vw,118px);position:relative;max-width:min(1600px,calc((100vh - 70px)*16/9));width:100%;margin:0 auto;aspect-ratio:16/9;border-radius:14px;overflow:hidden;background:#000;border:2px solid rgba(255,255,255,.18);box-shadow:0 20px 50px rgba(0,0,0,.5);touch-action:none;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
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
.fz-tach{position:absolute;right:10px;bottom:calc(var(--ped) + 26px);width:var(--tach);height:var(--tach);z-index:3;pointer-events:none}
.fz-btn{position:absolute;right:12px;z-index:6;width:42px;height:42px;border-radius:50%;border:2px solid rgba(255,255,255,.35);background:rgba(10,12,25,.55);color:#fff;font-size:19px;display:grid;place-items:center;cursor:pointer;touch-action:manipulation;padding:0}
.fz-btn.mute{top:10px}.fz-btn.quit{top:60px}
.gp3-wrap.v3 .gp3-msg{position:absolute;left:50%;top:17%;transform:translateX(-50%) skewX(-10deg);z-index:4;padding:6px 18px;font-size:clamp(15px,2.2vw,24px);font-weight:900;font-style:italic;letter-spacing:.04em;color:#fff;background:linear-gradient(90deg,rgba(255,45,135,.92),rgba(255,122,0,.92));border-radius:4px;opacity:0;transition:opacity .25s;pointer-events:none;white-space:nowrap;text-transform:uppercase}
.gp3-wrap.v3 .gp3-msg.show{opacity:1}
.gp3-wrap.v3 .gp3-count{position:absolute;left:50%;top:27%;transform:translate(-50%,-50%);z-index:5;font-size:clamp(40px,7.5vw,76px);font-weight:900;font-style:italic;color:#fff;text-shadow:0 0 30px #ff2d87,0 6px 20px #000;opacity:0;pointer-events:none}
.gp3-wrap.v3 .gp3-count.show{opacity:1}
.gp3-wrap.v3 .gp3-count.pop{animation:gpCdPop .34s cubic-bezier(.2,1.6,.4,1)}
@keyframes gpCdPop{0%{transform:translate(-50%,-50%) scale(1.6)}100%{transform:translate(-50%,-50%) scale(1)}}
.gp3-wrap.v3 .gp3-card{position:absolute;left:50%;top:8%;bottom:auto;height:auto;width:max-content;max-width:80%;transform:translateX(-50%);z-index:4;padding:5px 14px;text-align:center;color:#fff;background:rgba(10,12,25,.72);border-left:4px solid #ff2d87;border-radius:4px;transition:opacity .6s;pointer-events:none;white-space:nowrap}
.gp3-wrap.v3 .gp3-card b{display:block;font-size:clamp(13px,1.7vw,19px);font-style:italic;text-transform:uppercase}.gp3-wrap.v3 .gp3-card small{font-size:10px;color:#ffd2e6;letter-spacing:.1em;text-transform:uppercase}
.gp3-wrap.v3 .gp3-card.hide{opacity:0}
.gp3-pad{position:absolute;bottom:12px;display:flex;gap:clamp(14px,1.8vw,24px);z-index:5;align-items:flex-end;pointer-events:none}
.gp3-pad.l{left:14px}.gp3-pad.r{right:14px;pointer-events:auto}
.gp3-wrap.v3 .race-btn{width:var(--pad);height:var(--pad);border-radius:26px;border:3px solid rgba(255,255,255,.45);background:rgba(10,12,25,.5);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);color:#fff;font-size:clamp(30px,3.6vw,42px);display:grid;place-items:center;padding:0;font-family:inherit;user-select:none;-webkit-user-select:none;pointer-events:none;transition:background .08s,transform .08s}
.gp3-wrap.v3 .race-btn.on{background:#fff;color:#111;transform:scale(.94)}
/* pedals: GAS tall and narrow on the right, BRAKE wide on its left; a rubber tread with a hinge at the foot, pressed = tipped forward and lit */
.gp3-wrap.v3 .fz-pedal{position:relative;display:block;border:0;padding:0;margin:0;background:none;color:#fff;font-family:inherit;cursor:pointer;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent;transform-origin:50% 100%;transition:transform .07s,filter .07s;outline:0}
.gp3-wrap.v3 .fz-pedal.gas{width:clamp(124px,13.5vw,164px);height:var(--ped)}
.gp3-wrap.v3 .fz-pedal.brake{width:clamp(124px,13vw,160px);height:calc(var(--ped)*.9)}
.gp3-wrap.v3 .fz-pedal i{position:absolute;left:0;right:0;top:0;bottom:12px;border-radius:16px;background:repeating-linear-gradient(180deg,#464a53 0 9px,#23262c 9px 14px);border:3px solid #a8aeb8;box-shadow:inset 0 2px 0 rgba(255,255,255,.3),inset 0 -8px 14px rgba(0,0,0,.6),0 10px 18px rgba(0,0,0,.6)}
.gp3-wrap.v3 .fz-pedal.gas i{border-color:#58c76b;background:repeating-linear-gradient(180deg,#3f5a46 0 9px,#1e2b22 9px 14px)}
.gp3-wrap.v3 .fz-pedal.brake i{border-color:#e0485a;background:repeating-linear-gradient(90deg,#5a2a31 0 11px,#2a1418 11px 16px)}
.gp3-wrap.v3 .fz-pedal::after{content:"";position:absolute;left:50%;bottom:0;width:34%;height:14px;transform:translateX(-50%);background:linear-gradient(#7c828c,#2a2d33);border-radius:5px 5px 0 0}
.gp3-wrap.v3 .fz-pedal b{position:absolute;left:0;right:0;top:44%;transform:translateY(-50%);font-size:clamp(15px,1.8vw,22px);font-weight:900;font-style:italic;letter-spacing:.08em;text-shadow:0 2px 6px #000;pointer-events:none}
.gp3-wrap.v3 .fz-pedal.on{transform:perspective(420px) rotateX(26deg) translateY(5px);filter:brightness(1.4)}
.gp3-wrap.v3 .fz-pedal.on i{box-shadow:inset 0 0 0 3px #fff,inset 0 -4px 10px rgba(0,0,0,.5),0 2px 6px rgba(0,0,0,.6)}
.gp3-wrap.v3 .fz-pedal.auto{opacity:.4}
.fz-cue{position:absolute;left:50%;top:15%;transform:translate(-50%,-50%) skewX(-10deg);z-index:4;padding:4px 18px;border-radius:6px;background:#d81e2a;color:#fff;font-size:clamp(18px,2.6vw,30px);font-weight:900;font-style:italic;letter-spacing:.1em;opacity:0;pointer-events:none;transition:opacity .12s;box-shadow:0 0 24px rgba(216,30,42,.8)}
.fz-cue.on{opacity:1;animation:fzCue .5s infinite alternate}
@keyframes fzCue{from{transform:translate(-50%,-50%) skewX(-10deg) scale(1)}to{transform:translate(-50%,-50%) skewX(-10deg) scale(1.08)}}
.gp3-wrap.v3 .gp3-finish{position:absolute;inset:0;z-index:8;display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(135deg,rgba(40,5,40,.88),rgba(10,8,25,.9));color:#fff;text-align:center;padding:10px}
.fz-fin-t{font-size:clamp(30px,6vw,56px);font-weight:900;font-style:italic;background:linear-gradient(90deg,#ff2d87,#ff7a00);-webkit-background-clip:text;background-clip:text;color:transparent}
.fz-res{margin:8px 0;min-width:min(420px,90%);font-size:clamp(12px,1.6vw,15px)}
.fz-res div{display:grid;grid-template-columns:38px 1fr 1fr;gap:8px;padding:4px 10px;text-align:left;border-bottom:1px solid rgba(255,255,255,.08);font-weight:700}
.fz-res div.me{background:linear-gradient(90deg,rgba(255,45,135,.5),rgba(255,122,0,.3));font-weight:900}
.fz-res i{font-style:italic}
.fz-fin-s{font-weight:800;color:#ffd2e6;margin-top:2px}
.gp3-wrap.v3.done .gp3-pad,.gp3-wrap.v3.done .fz-btn,.gp3-wrap.v3.done .fz-skill,.gp3-wrap.v3.done .fz-tach,.gp3-wrap.v3.done .fz-cue,.gp3-wrap.v3.done .gp3-touch{display:none}
.fz-quit-row{margin-top:8px}
.fz-song{margin-top:6px;display:flex;align-items:center;gap:5px;background:rgba(10,12,25,.55);border:1px solid rgba(255,255,255,.3);border-radius:10px;padding:3px 8px;font-size:clamp(13px,1.5vw,17px);width:max-content}
.fz-song b{font-weight:700;margin-right:3px}
.fz-song i{width:11px;height:11px;border-radius:50%;border:2px solid #fff;display:inline-block;background:transparent}
.fz-song i.on{background:var(--c)}
/* ---- phones: the race takes over the whole screen ---- */
@media (max-height:520px),(orientation:portrait) and (max-width:600px){
.gp3-wrap.v3{position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;max-width:none!important;aspect-ratio:auto!important;margin:0!important;border:0!important;border-radius:0!important;z-index:9000;--tach:96px;--ped:112px;--pad:66px}
@supports (height:100dvh){.gp3-wrap.v3{height:100dvh!important}}
.gp3-wrap.v3 ~ .fz-quit-row{display:none}
.fz-tl{left:calc(8px + env(safe-area-inset-left));top:calc(6px + env(safe-area-inset-top))}
.fz-pos{font-size:36px}.fz-lap{font-size:11px}.fz-time{font-size:14px}
.gp3-wrap.v3 .gp3-map{top:calc(92px + env(safe-area-inset-top));left:calc(8px + env(safe-area-inset-left));width:84px}
.fz-skill{left:calc(8px + env(safe-area-inset-left));min-width:120px}
.fz-skill .pts{font-size:22px}.fz-skill .row{font-size:10px}
.fz-tach{right:calc(6px + env(safe-area-inset-right));bottom:calc(var(--ped) + 16px + env(safe-area-inset-bottom))}
.fz-btn{width:36px;height:36px;font-size:16px;right:calc(8px + env(safe-area-inset-right))}
.fz-btn.mute{top:calc(8px + env(safe-area-inset-top))}.fz-btn.quit{top:calc(50px + env(safe-area-inset-top))}
.gp3-pad{bottom:calc(10px + env(safe-area-inset-bottom));gap:8px}.gp3-pad.l{left:calc(10px + env(safe-area-inset-left))}.gp3-pad.r{right:calc(10px + env(safe-area-inset-right))}
.gp3-wrap.v3 .race-btn{font-size:24px;border-radius:18px}
.gp3-wrap.v3 .fz-pedal.gas{width:72px}.gp3-wrap.v3 .fz-pedal.brake{width:104px}.gp3-wrap.v3 .fz-pedal b{font-size:12px}
.gp3-wrap.v3 .gp3-msg{font-size:15px;top:24%}
.gp3-wrap.v3 .gp3-count{font-size:44px;top:24%}
.gp3-wrap.v3 .gp3-card{padding:6px 14px}.gp3-wrap.v3 .gp3-card b{font-size:16px}
.fz-fin-t{font-size:30px}.fz-res{font-size:12px}.gp3-wrap.v3 .gp3-finish .btn{padding:8px 12px;font-size:14px}
.fz-song{font-size:12px;padding:2px 6px}.fz-song i{width:8px;height:8px}
}
@media (max-height:520px){.gp3-wrap.v3{--tach:84px;--ped:96px;--pad:58px}.fz-skill{top:46%}.fz-pos{font-size:30px}.gp3-wrap.v3 .gp3-map{width:70px;top:calc(96px + env(safe-area-inset-top))}}
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
.gp3-wrap.v3.story .race-btn.on{background:#2b2735;color:#f7f0e1}
.gp3-wrap.v3.story .fz-pedal i{border-color:#2b2735;box-shadow:3px 3px 0 rgba(0,0,0,.3)}.gp3-wrap.v3.story .fz-pedal.gas i{background:repeating-linear-gradient(180deg,#8fc49a 0 9px,#5f9a6c 9px 14px)}.gp3-wrap.v3.story .fz-pedal.brake i{background:repeating-linear-gradient(90deg,#e8604c 0 11px,#c54a3a 11px 16px)}
.gp3-wrap.v3.story .fz-pedal b{color:#2b2735;text-shadow:0 0 4px #f7f0e1}.gp3-wrap.v3.story .fz-cue{background:#e8604c;border:3px solid #2b2735}
.gp3-wrap.v3.story .gp3-finish{background:rgba(247,240,225,.95);color:#2b2735}
.gp3-wrap.v3.story .fz-fin-t{background:none;color:#2b2735;-webkit-text-fill-color:#2b2735;font-style:normal;text-shadow:3px 3px 0 #f2c14e}
.gp3-wrap.v3.story .fz-res div{border-bottom:1px dashed rgba(43,39,53,.3)}.gp3-wrap.v3.story .fz-res div.me{background:#f2c14e}
.gp3-wrap.v3.story .fz-fin-s{color:#5b4f66}
/* pick-an-upgrade (direction: lz-gp-3dcar-shots SOURCES.md): navy cards, thick border, hard bottom shadow, spring pop-in, idle hum */
.fz-up{position:absolute;inset:0;z-index:12;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:clamp(8px,2.2vh,18px);padding:clamp(10px,3vh,26px) clamp(10px,3vw,30px);background:radial-gradient(120% 90% at 50% 20%,rgba(27,38,59,.985),rgba(13,27,42,.995));color:#FDF0D5;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;transition:opacity .28s}
.fz-up.out{opacity:0}
.fz-up-h{text-align:center;animation:fzUpIn .45s cubic-bezier(.34,1.56,.64,1) both}
.fz-up-h b{display:block;font-style:italic;font-weight:900;font-size:clamp(26px,5vw,48px);letter-spacing:.5px;color:#F4A261;text-shadow:0 3px 0 #0D1B2A}
.fz-up-h span{font-weight:600;font-size:clamp(13px,1.8vw,17px);opacity:.85}
.fz-up-cards{display:flex;gap:clamp(10px,2vw,22px);width:100%;max-width:900px;justify-content:center;align-items:stretch}
.fz-upc{--c:#2A9D8F;position:relative;flex:1 1 0;min-width:0;max-width:280px;min-height:clamp(150px,42vh,300px);display:flex;flex-direction:column;align-items:center;justify-content:space-between;gap:8px;padding:clamp(12px,2.4vh,22px) 12px;border:4px solid #0a1422;border-top:8px solid var(--c);border-radius:20px;background:linear-gradient(135deg,#132238 0%,#1B263B 100%);color:#FDF0D5;box-shadow:0 8px 0 #050b14,0 14px 26px rgba(0,0,0,.45);cursor:pointer;font:inherit;text-align:center;touch-action:manipulation;-webkit-tap-highlight-color:transparent;
  animation:fzUpIn .5s cubic-bezier(.34,1.56,.64,1) both,fzHum 3s ease-in-out infinite;animation-delay:var(--d),calc(var(--d) + .6s);transition:transform .2s,box-shadow .2s,border-color .2s,opacity .25s}
.fz-upc:hover,.fz-upc:focus-visible{transform:translateY(-4px);border-color:var(--c);box-shadow:0 12px 0 var(--c),0 18px 30px rgba(0,0,0,.45);outline:none}
.fz-upc:active{transform:scale(.95)}
.fz-upi{display:grid;place-items:center;width:clamp(56px,11vh,96px);height:clamp(56px,11vh,96px);border-radius:50%;background:radial-gradient(circle at 35% 30%,rgba(255,255,255,.22),rgba(255,255,255,.04));border:3px solid var(--c);font-style:normal;font-size:clamp(30px,6vh,52px);line-height:1}
.fz-upi.sw{background:radial-gradient(circle at 35% 30%,rgba(255,255,255,.55),rgba(255,255,255,0) 45%),var(--p);border-color:#FDF0D5}
.fz-upt{display:flex;flex-direction:column;align-items:center;gap:4px}
.fz-upt b{font-style:italic;font-weight:900;font-size:clamp(17px,2.6vw,24px);text-transform:uppercase;line-height:1.05}
.fz-upt small{font-weight:600;font-size:clamp(12px,1.6vw,15px);opacity:.88;line-height:1.25}
.fz-pips{display:inline-flex;gap:6px;margin-top:4px}.fz-pips em{width:16px;height:16px;border-radius:50%;border:2px solid rgba(253,240,213,.55);background:transparent}
.fz-pips em.on{background:#F4A261;border-color:#F4A261}.fz-pips em.new{border-color:var(--c);border-style:dashed;animation:fzPip 1s ease-in-out infinite}
.fz-pips em.new.on{background:var(--c);border-style:solid;animation:fzBump .45s cubic-bezier(.34,1.56,.64,1)}
.fz-upgo{display:block;width:100%;max-width:200px;padding:10px 0;border-radius:12px;background:var(--c);color:#0D1B2A;font-weight:900;font-style:italic;font-size:clamp(15px,2vw,19px);letter-spacing:1px;box-shadow:inset 0 -5px 0 rgba(0,0,0,.25)}
.fz-up.chosen .fz-upc:not(.picked){opacity:0;transform:translateY(24px) scale(.9);pointer-events:none;animation:none}
.fz-upc.picked{animation:fzPick .55s cubic-bezier(.34,1.56,.64,1) forwards;border-color:var(--c);box-shadow:0 0 0 4px var(--c),0 0 40px var(--c),0 10px 0 #050b14}
.fz-up-fit{position:absolute;left:50%;top:44%;transform:translate(-50%,-50%) rotate(-8deg);padding:6px 16px;border-radius:10px;background:#2A9D8F;color:#fff;font-weight:900;font-style:italic;font-size:clamp(20px,3vw,30px);border:3px solid #FDF0D5;box-shadow:0 5px 0 #0D1B2A;animation:fzStamp .35s cubic-bezier(.34,1.56,.64,1) both}
.fz-spark{position:absolute;width:12px;height:12px;border-radius:50%;background:var(--c);pointer-events:none;z-index:3;animation:fzSpark .8s cubic-bezier(.2,.7,.3,1) forwards}
.fz-fin-up{display:none;margin-top:6px;padding:4px 14px;border-radius:999px;background:rgba(42,157,143,.25);border:2px solid #2A9D8F;font-weight:800;font-size:clamp(13px,1.6vw,16px)}.fz-fin-up.on{display:inline-block}
@keyframes fzUpIn{0%{opacity:0;transform:translateY(30px) scale(.6)}100%{opacity:1;transform:none}}
@keyframes fzHum{0%,100%{translate:0 0}50%{translate:0 -4px}}
@keyframes fzPick{0%{transform:scale(1)}40%{transform:scale(1.1)}100%{transform:scale(1.05)}}
@keyframes fzStamp{0%{opacity:0;transform:translate(-50%,-50%) rotate(-8deg) scale(2)}100%{opacity:1;transform:translate(-50%,-50%) rotate(-8deg) scale(1)}}
@keyframes fzSpark{0%{transform:translate(-50%,-50%) scale(1);opacity:1}100%{transform:translate(calc(-50% + var(--x)),calc(-50% + var(--y))) scale(.2);opacity:0}}
@keyframes fzPip{50%{transform:scale(1.25)}}@keyframes fzBump{0%{transform:scale(.4)}100%{transform:scale(1)}}
@media (prefers-reduced-motion:reduce){.fz-upc,.fz-up-h,.fz-upc.picked,.fz-pips em.new{animation:none!important}}
@media (max-height:520px){.fz-up{gap:6px;padding:8px 14px}.fz-up-h b{font-size:24px}.fz-up-h span{font-size:12px}.fz-upc{min-height:0;padding:8px 8px 10px;border-top-width:6px;gap:5px}.fz-upi{width:48px;height:48px;font-size:28px}.fz-upt b{font-size:16px}.fz-upt small{font-size:11.5px}.fz-upgo{padding:7px 0;font-size:14px}}
@media (orientation:portrait) and (max-width:600px){.fz-up-cards{flex-direction:column;max-width:420px}.fz-upc{flex:0 0 auto;max-width:none;min-height:84px;flex-direction:row;justify-content:flex-start;text-align:left;padding:12px 14px;gap:12px}.fz-upt{align-items:flex-start;flex:1}.fz-upi{width:64px;height:64px;font-size:36px;flex:none}.fz-upgo{width:auto;padding:12px 14px;flex:none}.fz-up-fit{top:50%}}
.fz-garage{margin:14px auto 0;max-width:760px;padding:12px 14px;border-radius:18px;background:linear-gradient(135deg,#132238,#1B263B);border:3px solid #0a1422;box-shadow:0 6px 0 #050b14;color:#FDF0D5}
.fz-garage.empty{text-align:center;font-weight:700;font-size:15px}
.fz-gt{font-weight:900;font-style:italic;font-size:18px;margin-bottom:6px}.fz-gt small{font-weight:600;font-style:normal;font-size:12px;opacity:.75}
.fz-glvs{display:flex;flex-wrap:wrap;gap:8px 18px}.fz-glv{display:inline-flex;align-items:center;gap:8px;font-size:14px}.fz-glv .fz-pips{margin:0}
.fz-gchips{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:10px}.fz-gchips i{font-style:normal;font-weight:800;font-size:13px;opacity:.8;min-width:56px}
.fz-gp,.fz-gs{width:44px;height:44px;border-radius:50%;border:3px solid rgba(253,240,213,.35);cursor:pointer;display:grid;place-items:center;font-size:22px;background:#0D1B2A;color:#FDF0D5}
.fz-gp{background:radial-gradient(circle at 35% 30%,rgba(255,255,255,.5),rgba(255,255,255,0) 45%),var(--p)}
.fz-gp.on,.fz-gs.on{border-color:#F4A261;box-shadow:0 0 0 3px rgba(244,162,97,.45)}
`;document.head.appendChild(s);if(gpStory()&&!document.getElementById("gpFont")){const l=document.createElement("link");l.id="gpFont";l.rel="stylesheet";l.href="https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap";document.head.appendChild(l);}}

/* ---------- menus: car select → route select → race ---------- */
function gpStop(){
  gpStopVideos();
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
/* the straight view of a car sheet as a CSS-cropped thumbnail (works for one-row and grid sheets) */
function gpThumb(id,extra){const D=GP_PICS[id];if(!D)return"";const mid=gpPicMid(D),c=mid%D.cols,r=Math.floor(mid/D.cols);const px=D.cols>1?c*100/(D.cols-1):0,py=D.rows>1?r*100/(D.rows-1):0;
  return '<i class="fz-thumb" style="aspect-ratio:'+(D.fw/D.fh).toFixed(3)+';background-image:url('+D.src+');background-size:'+(D.cols*100)+'% '+(D.rows*100)+'%;background-position:'+px.toFixed(2)+'% '+py.toFixed(2)+'%;'+(extra||'')+'"></i>';}
function gpCardPic(c){const D=GP_PICS[c.id];if(!D)return'<canvas width="480" height="200" data-prev="'+c.id+'"></canvas>';
  if(D.hero)return'<span class="fz-pic shot" style="--bg:url('+D.hero+')"></span>';   // a real hero shot when one exists
  return'<span class="fz-pic hero" style="--bg:url('+GP_WORLD.card+')">'+gpThumb(c.id,"position:absolute;left:50%;transform:translateX(-50%)")+'</span>';}
function gpHead(sub,bg,pos){return '<div class="fz-head" style="background-image:url('+(bg||GP_WORLD.hero)+')'+(pos?';background-position:'+pos:'')+'"><img class="fz-logo" src="'+GP_WORLD.logo+'" alt="Grand Fable Horizon" decoding="async"><div class="fz-sub">'+sub+'</div></div>';}
function gpShellClass(){return "fadein fz-shell"+(gpStory()?" story":"");}
function renderRace(){
  clearTimers();closeOverlay();defocus();showAnanseCorner(false);gpStop();
  if(typeof kdWebgl==="function"&&!kdWebgl()){renderRace2D();return;}
  gpCss();gpAudioUnlock();document.body.classList.add("learningworld");
  const sel=gpCar().id,paint=gpPaint();
  const cards=GP_CARS.map(c=>'<button class="fz-car'+(c.id===sel?" on":"")+'" data-car="'+c.id+'" onclick="gpPickCar(\''+c.id+'\')">'+gpCardPic(c)+'<span class="fz-cls"><i>'+c.cls+'</i><em>'+c.pi+'</em></span><b>'+esc(c.n)+'</b>'
    +'<span class="fz-bar"><i>Speed</i><s><em style="width:'+(c.speed*20)+'%"></em></s></span><span class="fz-bar"><i>Handling</i><s><em style="width:'+(c.handle*20)+'%"></em></s></span><span class="fz-bar"><i>Launch</i><s><em style="width:'+(c.accel*20)+'%"></em></s></span>'
    +'<small>'+esc(c.bio)+'</small></button>').join("");
  const sw=GP_PAINTS.map(h=>'<button class="fz-sw'+(h===paint?" on":"")+'" style="background:'+h+'" data-paint="'+h+'" onclick="gpPickPaint(\''+h+'\')" aria-label="Paint colour"></button>').join("");
  app.innerHTML='<div class="'+gpShellClass()+(GP_PICS[sel]?" pic":"")+'" id="fzShell" style="max-width:980px;margin:0 auto;padding:0 8px">'
   +gpHead("Japan · choose your car",GP_WORLD.title,"center 44%")
   +'<div class="fz-cars">'+cards+'</div>'
   +'<div class="fz-paints">'+sw+'</div><div class="fz-paint-note">🎨 New paint colours come from race upgrades.</div>'+gpGarageHtml()
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
function gpAuto(){return !!(P?P.gpAuto:window._gpAuto);}
function gpPickAuto(v){if(P){P.gpAuto=!!v;save();}else window._gpAuto=!!v;document.querySelectorAll(".fz-auto button").forEach(b=>b.classList.toggle("on",(b.dataset.a==="1")===!!v));sfx("tick");}
function gpTrafficOn(){const v=P?P.gpTraffic:window._gpTrafficOpt;return v!==false;}
function gpPickLook(v){if(P){P.gpLook=v;save();}else window._gpLook=v;sfx("tick");renderCircuits(window._gpTab);}
/* ---------- options (saved on the profile, like the other racer choices) ---------- */
function gpOpt(k,def){const v=P?P[k]:window["_"+k];return v==null?def:v;}
function gpSetOpt(k,v){if(P){P[k]=v;save();}else window["_"+k]=v;}
function gpCamMode(){const v=gpOpt("gpCam","chase");return ["chase","bumper","cockpit"].includes(v)?v:"chase";}
function gpLaps(){const n=+gpOpt("gpLaps",2);return n>=1&&n<=3?n:2;}
function gpPickOpt(k,v){if(k==="gpLook"){gpPickLook(v);return;}if(k==="gpTraffic")v=!!v;if(k==="gpLaps")v=+v;gpSetOpt(k,v);if(k==="gpPace")window._gpPace=v;
  document.querySelectorAll('.fz-opt[data-k="'+k+'"] button').forEach(b=>b.classList.toggle("on",b.dataset.v===String(v)));sfx("tick");}
const GP_TAG={kawaguchi:["JAPAN","#ff5fa2"],hakone:["JAPAN","#ff5fa2"],tokyo:["JAPAN","#ff5fa2"],city:["CITY","#2fd3c3"],accra:["GHANA","#fcd116"],coast:["COAST","#4fa8ff"]};
function gpStars(n){let h="";for(let i=0;i<3;i++)h+='<i class="'+(i<n?"on":"")+'">★</i>';return'<span class="fz-stars" aria-label="'+n+' of 3 stars">'+h+'</span>';}
function gpTrackCard(c,i,best){const tg=GP_TAG[c.id]||["ROUTE","#fff"],b=best[c.id]||{},gh=c.special==="gh";
  return'<button class="fz-track'+(gh?" gh":"")+'" data-id="'+c.id+'" onclick="startRace3D(\''+c.id+'\')">'
   +'<span class="fz-tpic"><img src="assets/tracks/'+c.id+'.webp?v=1" alt="" loading="lazy" decoding="async" onerror="this.remove()"><canvas id="gpMini'+i+'" width="160" height="110"></canvas>'
   +'<em class="fz-tag" style="--tg:'+tg[1]+'">'+tg[0]+'</em>'+(gh?'<em class="fz-gh"><i class="fz-flag"></i>🚐 trotro + taxis</em>':(c.traffic&&c.traffic.length?'<em class="fz-gh">🚕 traffic</em>':''))+'</span>'
   +(gh?'<span class="fz-kente"></span>':'')
   +'<b>'+esc(c.name)+'</b><span class="fz-trow">'+gpStars(c.stars||1)+'<span class="fz-km">'+c.km.toFixed(1)+' km</span></span>'
   +'<small>'+esc(c.blurb||c.look.time)+(b.time?' · best '+gpFmt(b.time)+(b.place?' · '+gpOrd(b.place):''):'')+(b.notes?' · 🎵 '+b.notes:'')+'</small></button>';}
function gpOptRow(k,label,opts,cur){return'<div class="fz-opt" data-k="'+k+'"><span class="fz-ol">'+label+'</span><div>'+opts.map(o=>'<button data-v="'+o[0]+'" class="'+(String(cur)===String(o[0])?"on":"")+'" onclick="gpPickOpt(\''+k+'\','+JSON.stringify(o[0]).replace(/"/g,"'")+')">'+o[1]+'</button>').join("")+'</div></div>';}
function GP_TRACK_ORDER(){const first=["accra","city","coast"];return GP_CIRCUITS.map((c,i)=>i).sort((a,b)=>{const fa=first.indexOf(GP_CIRCUITS[a].id),fb=first.indexOf(GP_CIRCUITS[b].id);return (fa<0?9+a:fa)-(fb<0?9+b:fb);});}   // the new courses lead the picker
function renderCircuits(tab){
  clearTimers();closeOverlay();showAnanseCorner(false);gpStop();gpCss();gpAudioUnlock();
  tab=tab==="opts"?"opts":"tracks";window._gpTab=tab;
  const best=P&&P.race?P.race:{};
  const tracks='<div class="fz-mode fz-m"><button data-m="race" class="'+(gpMode()==="race"?"on":"")+'" onclick="gpPickMode(\'race\')">🏁 Race: beat 4 rivals</button><button data-m="free" class="'+(gpMode()==="free"?"on":"")+'" onclick="gpPickMode(\'free\')">🎵 Free drive: collect the music</button></div>'
   +'<div class="fz-tracks">'+GP_TRACK_ORDER().map(i=>gpTrackCard(GP_CIRCUITS[i],i,best)).join("")+'</div>'
   +'<div class="fz-hint">Tap a track to start · '+gpLaps()+' lap'+(gpLaps()>1?'s':'')+' · '+({chase:"chase cam",bumper:"bumper cam",cockpit:"cockpit cam"}[gpCamMode()])+' · traffic '+(gpTrafficOn()?'on':'off')+' <button class="fz-link" onclick="renderCircuits(\'opts\')">change ⚙️</button></div>';
  const opts='<div class="fz-opts">'
   +gpOptRow("gpCam","🎥 Camera",[["chase","🚗 Chase"],["bumper","📷 Bumper"],["cockpit","🎛️ Cockpit"]],gpCamMode())
   +gpOptRow("gpTraffic","🚕 Traffic in town",[[true,"On"],[false,"Off"]],gpTrafficOn())
   +gpOptRow("gpLaps","🔁 Laps",[[1,"1"],[2,"2"],[3,"3"]],gpLaps())
   +gpOptRow("gpPace","⭐ Difficulty",[["gentle","🐢 Easy"],["normal","🚗 Normal"]],gpPace())
   +gpOptRow("gpAuto","🦶 Pedals",[[false,"Gas + brake"],[true,"✨ Auto gas"]],gpAuto())
   +gpOptRow("gpLook","🖌️ Look",[["real","🗻 Realistic"],["story","🖌️ Storybook"]],gpLook())
   +'<div class="fz-garage-row"><button class="btn big" onclick="renderRace()">🚗 Garage: '+esc(gpCar().n)+' ▶</button></div>'+gpGarageHtml()
   +'<div class="center" style="margin-top:12px"><button class="btn big fz-go" onclick="renderCircuits(\'tracks\')">🏁 Pick a track ▶</button></div></div>';
  app.innerHTML='<div class="'+gpShellClass()+'" id="fzShell" style="max-width:1080px;margin:0 auto;padding:0 8px">'
   +'<div class="fz-bgvid"><video id="fzFly" muted loop playsinline webkit-playsinline preload="none" poster="'+GP_VIDEO.poster+'" disablepictureinpicture aria-hidden="true"></video></div>'
   +gpHead(esc(gpCar().n)+" · "+(tab==="opts"?"garage & options":"choose a track"))
   +'<div class="fz-tabs" role="tablist"><button role="tab" class="'+(tab==="tracks"?"on":"")+'" onclick="renderCircuits(\'tracks\')">🏁 Tracks</button><button role="tab" class="'+(tab==="opts"?"on":"")+'" onclick="renderCircuits(\'opts\')">⚙️ Garage &amp; Options</button></div>'
   +(tab==="opts"?opts:tracks)
   +'<div class="card fz-card" style="margin-top:14px"><b>How to play</b><p style="margin-top:6px">Left thumb: ◀ ▶ steer. Right thumb: hold <b>GAS</b> to go, <b>BRAKE</b> to slow down (watch the 300·200·100 boards). Hold BRAKE while steering at speed to drift. In the city, weave past the traffic: a bump is just a soft bounce. 🎥 in the race switches the camera. Keyboard: ← → steer, ↑ gas, ↓ brake, Space drift, C camera, M mute, Esc quit.</p></div>'
   +'<div class="btn-row" style="margin-top:12px"><button class="btn secondary" onclick="renderRace()">⟵ Cars</button><button class="btn secondary" onclick="gpIntro(true)">🎬 Watch the intro</button></div><div class="spacer"></div></div>';
  if(tab==="tracks")GP_CIRCUITS.forEach((c,i)=>gpDrawMini($("gpMini"+i),c,null,true));
  gpFlyover();
  say(tab==="opts"?"Choose your options.":"Choose a route.");
}
/* the drone flyover starts a moment after the routes screen is up, only when nothing asks for data saving or still motion */
function gpFlyover(){const v=$("fzFly");if(!v||gpStory())return;
  try{if(navigator.connection&&navigator.connection.saveData)return;if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)return;}catch(e){}
  setTimeout(()=>{const el=$("fzFly");if(!el||!document.contains(el))return;el.muted=true;el.src=GP_VIDEO.flyover;const p=el.play();if(p&&p.catch)p.catch(()=>{});},500);}
function gpStopVideos(){document.querySelectorAll(".fz-bgvid video,.gp3-finish video").forEach(v=>{try{v.pause();v.removeAttribute("src");v.load();}catch(e){}});}
function gpDrawMini(cv,c,karts,overlay){
  if(!cv)return;const x=cv.getContext("2d");x.clearRect(0,0,cv.width,cv.height);const story=gpStory();
  const xs=c.pts.map(p=>p[0]),zs=c.pts.map(p=>p[1]);const minX=Math.min(...xs)-15,maxX=Math.max(...xs)+15,minZ=Math.min(...zs)-15,maxZ=Math.max(...zs)+15;
  const sx=cv.width/(maxX-minX),sz=cv.height/(maxZ-minZ),s=Math.min(sx,sz);const ox=(cv.width-(maxX-minX)*s)/2,oz=(cv.height-(maxZ-minZ)*s)/2;
  const map=(px,pz)=>[ox+(px-minX)*s,oz+(pz-minZ)*s];
  if(!c._mini){const P0=c.pts,n=P0.length,pts=[];for(let i=0;i<n;i++){const a=P0[(i-1+n)%n],b=P0[i],cc=P0[(i+1)%n],d=P0[(i+2)%n];for(let t=0;t<1;t+=0.1){const t2=t*t,t3=t2*t;pts.push([0.5*((2*b[0])+(-a[0]+cc[0])*t+(2*a[0]-5*b[0]+4*cc[0]-d[0])*t2+(-a[0]+3*b[0]-3*cc[0]+d[0])*t3),0.5*((2*b[1])+(-a[1]+cc[1])*t+(2*a[1]-5*b[1]+4*cc[1]-d[1])*t2+(-a[1]+3*b[1]-3*cc[1]+d[1])*t3)]);}}c._mini=pts;}
  const pts=c._mini;
  if(!karts&&!overlay){x.fillStyle=story?"#e3eee9":"#1b2234";x.fillRect(0,0,cv.width,cv.height);if(!story){x.fillStyle="#f4f7fb";x.beginPath();x.moveTo(cv.width*0.62,18);x.lineTo(cv.width*0.74,4);x.lineTo(cv.width*0.86,18);x.closePath();x.fill();x.fillStyle="#7d8fb5";x.beginPath();x.moveTo(cv.width*0.5,30);x.lineTo(cv.width*0.74,4);x.lineTo(cv.width*0.98,30);x.closePath();x.fill();x.fillStyle="#f4f7fb";x.beginPath();x.moveTo(cv.width*0.665,12);x.lineTo(cv.width*0.74,4);x.lineTo(cv.width*0.815,12);x.closePath();x.fill();}}
  x.lineCap="round";x.lineJoin="round";x.strokeStyle=story?"#2b2735":(overlay?"rgba(10,13,24,.75)":"rgba(255,255,255,.35)");x.lineWidth=karts?cv.width/26:(overlay?8:9);x.beginPath();pts.forEach((p,i)=>{const m=map(p[0],p[1]);i?x.lineTo(m[0],m[1]):x.moveTo(m[0],m[1]);});x.closePath();x.stroke();
  x.strokeStyle=story?"#f2c14e":"#fff";x.lineWidth=karts?cv.width/80:3.5;x.stroke();
  const P0=c.pts;const st=map(P0[0][0],P0[0][1]);x.fillStyle="#fff";x.fillRect(st[0]-4,st[1]-4,8,8);x.fillStyle="#111";x.fillRect(st[0]-4,st[1]-4,4,4);x.fillRect(st[0],st[1],4,4);
  if(karts&&R3&&R3.traffic)R3.traffic.cars.forEach(k=>{const m=map(k.pos.x,k.pos.z);x.fillStyle="rgba(230,235,245,.8)";x.fillRect(m[0]-2,m[1]-2,4,4);});
  if(karts)karts.forEach(k=>{const p=k.pos;const m=map(p.x,p.z);x.fillStyle=k.player?"#ff2d87":k.racer.css;const rr=cv.width/(k.player?24:34);x.beginPath();x.arc(m[0],m[1],rr,0,7);x.fill();x.strokeStyle=k.player?"#fff":"rgba(0,0,0,.5)";x.lineWidth=cv.width/90;x.stroke();});
}
/* ---------- textures drawn on canvases ---------- */
function gpCanvasTex(w,h,draw,repeat){const cv=document.createElement("canvas");cv.width=w;cv.height=h;draw(cv.getContext("2d"),w,h);const t=new THREE.CanvasTexture(cv);if(repeat){t.wrapS=t.wrapT=THREE.RepeatWrapping;}t.anisotropy=window._gpAniso||4;if(THREE.sRGBEncoding)t.encoding=THREE.sRGBEncoding;return t;}
function gpTextTex(text,bg,fg,w,h,size){return gpCanvasTex(w||512,h||128,(x,W,H)=>{if(Array.isArray(bg)){const g=x.createLinearGradient(0,0,W,0);bg.forEach((c,i)=>g.addColorStop(i/(bg.length-1),c));x.fillStyle=g;}else x.fillStyle=bg;x.fillRect(0,0,W,H);x.fillStyle=fg;x.font="italic 900 "+(size||64)+"px system-ui";x.textAlign="center";x.textBaseline="middle";x.shadowColor="rgba(0,0,0,.4)";x.shadowBlur=6;x.fillText(text,W/2,H/2+2);});}
function gpSoftDot(){return gpCanvasTex(64,64,(x,w,h)=>{const g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,"rgba(255,255,255,1)");g.addColorStop(0.35,"rgba(255,255,255,.7)");g.addColorStop(1,"rgba(255,255,255,0)");x.fillStyle=g;x.fillRect(0,0,w,h);});}
function gpAoTex(){return gpCanvasTex(128,128,(x,w,h)=>{x.clearRect(0,0,w,h);x.save();x.translate(64,64);x.scale(1,1);const g=x.createRadialGradient(0,0,0,0,0,64);g.addColorStop(0,"rgba(255,255,255,1)");g.addColorStop(0.5,"rgba(255,255,255,.96)");g.addColorStop(0.72,"rgba(255,255,255,.55)");g.addColorStop(1,"rgba(255,255,255,0)");x.fillStyle=g;x.beginPath();x.ellipse(0,0,64,64,0,0,7);x.fill();x.restore();});}
function gpContactTex(){return gpCanvasTex(64,64,(x,w,h)=>{x.clearRect(0,0,w,h);const g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,"rgba(255,255,255,1)");g.addColorStop(0.4,"rgba(255,255,255,.93)");g.addColorStop(0.68,"rgba(255,255,255,.42)");g.addColorStop(1,"rgba(255,255,255,0)");x.fillStyle=g;x.fillRect(0,0,w,h);});}
function gpRimTex(){return gpCanvasTex(128,128,(x,w,h)=>{x.clearRect(0,0,w,h);const c=64;x.fillStyle="#17181c";x.beginPath();x.arc(c,c,62,0,7);x.fill();
  const g=x.createRadialGradient(c,c,10,c,c,60);g.addColorStop(0,"#d9dde3");g.addColorStop(0.7,"#aeb4bd");g.addColorStop(1,"#6d737c");x.fillStyle=g;x.beginPath();x.arc(c,c,62,0,7);x.arc(c,c,54,0,7,true);x.fill();
  x.fillStyle=g;for(let k=0;k<5;k++){const a=k*Math.PI*2/5;x.save();x.translate(c,c);x.rotate(a);x.beginPath();x.moveTo(-9,0);x.lineTo(-5,-56);x.lineTo(5,-56);x.lineTo(9,0);x.closePath();x.fill();x.restore();}
  x.fillStyle="#2a2d33";x.beginPath();x.arc(c,c,12,0,7);x.fill();x.fillStyle="#c0c5cc";x.beginPath();x.arc(c,c,7,0,7);x.fill();});}
/* One atlas shared by every photo car: twelve sharp six-spoke rim phases, one radial rim blur,
   six scrolling rear-tread phases and one vertically smeared tread state. Each car keeps one geometry/material. */
function gpWheelPatchShared(T){
  const phases=12,treadPhases=6,cols=32,cell=64,blurCell=12,treadCell=13,treadBlurCell=19,semiCell=20;
  const tex=gpCanvasTex(cols*cell,cell,(x,W,H)=>{const tyre=(cx)=>{const tg=x.createRadialGradient(cx-2,29,8,cx,32,31);tg.addColorStop(0,"rgba(58,61,66,.98)");tg.addColorStop(0.56,"rgba(25,27,31,.98)");tg.addColorStop(0.82,"rgba(7,8,10,.94)");tg.addColorStop(1,"rgba(2,3,4,0)");x.fillStyle=tg;x.beginPath();x.arc(cx,32,31,0,7);x.fill();};
    const rim=(cx,phase,blur)=>{tyre(cx);const rg=x.createRadialGradient(cx-4,27,2,cx,32,23);rg.addColorStop(0,"#8c929a");rg.addColorStop(0.38,"#555b64");rg.addColorStop(0.76,"#30353d");rg.addColorStop(1,"#121519");x.fillStyle=rg;x.beginPath();x.arc(cx,32,22,0,7);x.fill();x.fillStyle="#171a1f";x.beginPath();x.arc(cx,32,17,0,7);x.fill();
      const spokes=a=>{x.save();x.translate(cx,32);x.rotate(a);for(let k=0;k<6;k++){x.rotate(Math.PI/3);x.beginPath();x.moveTo(-2.2,1.2);x.lineTo(-1,-17.5);x.lineTo(2.1,-17.5);x.lineTo(2.8,0);x.closePath();x.fill();}x.restore();};
      x.fillStyle="#626973";if(blur==="semi"){x.save();x.globalAlpha=0.2;for(let q=-3;q<=3;q++)spokes(phase+q*0.04);x.restore();}else if(blur){x.save();x.globalAlpha=0.035;for(let q=0;q<30;q++)spokes(q*Math.PI/90);x.restore();x.strokeStyle="rgba(132,139,148,.25)";x.lineWidth=2.2;[9,13,17].forEach(r=>{x.beginPath();x.arc(cx,32,r,0,7);x.stroke();});}else spokes(phase);
      x.fillStyle="#262a31";x.beginPath();x.arc(cx,32,6,0,7);x.fill();x.fillStyle="#9ca2aa";x.beginPath();x.arc(cx,32,2.2,0,7);x.fill();};
    const tread=(cx,phase,blur)=>{x.save();x.beginPath();x.arc(cx,32,31,0,7);x.clip();const bg=x.createRadialGradient(cx-5,27,3,cx,32,33);bg.addColorStop(0,"rgba(54,57,61,.94)");bg.addColorStop(0.5,"rgba(25,27,30,.98)");bg.addColorStop(0.82,"rgba(8,9,11,.94)");bg.addColorStop(1,"rgba(2,3,4,0)");x.fillStyle=bg;x.fillRect(cx-32,0,64,64);
      if(blur){const sm=x.createLinearGradient(cx-23,0,cx+23,0);sm.addColorStop(0,"rgba(105,108,112,0)");sm.addColorStop(0.25,"rgba(105,108,112,.08)");sm.addColorStop(0.5,"rgba(145,147,150,.16)");sm.addColorStop(0.75,"rgba(105,108,112,.08)");sm.addColorStop(1,"rgba(105,108,112,0)");x.fillStyle=sm;for(let k=-18;k<=18;k+=7)x.fillRect(cx+k,5,2,54);
      }else{x.fillStyle="rgba(119,122,126,.38)";const shift=phase*2;for(let yy=-12;yy<76;yy+=12){const y=yy+shift;x.save();x.translate(cx,y);x.rotate((yy/12)%2?0.16:-0.16);x.fillRect(-23,-2.2,18,4.4);x.fillRect(5,-2.2,18,4.4);x.restore();}x.strokeStyle="rgba(8,9,10,.7)";x.lineWidth=2;x.beginPath();x.moveTo(cx,2);x.lineTo(cx,62);x.stroke();}x.restore();};
    for(let i=0;i<phases;i++)rim(i*cell+32,i*(Math.PI/3)/phases,false);rim(blurCell*cell+32,0,true);for(let i=0;i<phases;i++)rim((semiCell+i)*cell+32,i*(Math.PI/3)/phases,"semi");for(let i=0;i<treadPhases;i++)tread((treadCell+i)*cell+32,i,false);tread(treadBlurCell*cell+32,0,true);});
  tex.magFilter=T.LinearFilter;tex.minFilter=T.LinearMipmapLinearFilter;tex.generateMipmaps=true;
  const mat=new T.MeshBasicMaterial({map:tex,transparent:true,alphaTest:0.025,depthWrite:false,side:T.DoubleSide});mat.toneMapped=false;mat.userData.lin=1;
  return{tex,mat,phases,treadPhases,cols,blurCell,treadCell,treadBlurCell,semiCell};
}
function gpWheelPatchCell(wp,cell){if(cell===wp.cell)return;wp.cell=cell;const u0=cell/wp.shared.cols,u1=(cell+1)/wp.shared.cols,uv=wp.uv;
  for(let q=0;q<2;q++){const k=q*8;uv[k]=u0;uv[k+1]=0;uv[k+2]=u1;uv[k+3]=0;uv[k+4]=u1;uv[k+5]=1;uv[k+6]=u0;uv[k+7]=1;}wp.geo.attributes.uv.needsUpdate=true;}
function gpWheelPatchView(wp,D,frame){const V=(GP_WHEEL_VIEWS[wp.id]||[])[frame]||null;wp.view=frame;wp.dir=V?V.dir:1;wp.kind=V&&V.kind==="tread"?"tread":"rim";wp.mesh.visible=!!(V&&V.p&&V.p.length);if(!wp.mesh.visible)return;
  const a=wp.pos;for(let q=0;q<2;q++){const P=V.p[q]||null,k=q*12;if(!P){for(let j=0;j<12;j++)a[k+j]=0;continue;}const cx=(P[0]-D.fw/2)/D.ppm,cy=(D.fh/2-P[1])/D.ppm,hw=P[2]/D.ppm/2,hh=P[3]/D.ppm/2,co=Math.cos(P[4]||0),si=Math.sin(P[4]||0),corn=[[-hw,-hh],[hw,-hh],[hw,hh],[-hw,hh]];
    corn.forEach((p,j)=>{const x=p[0]*co-p[1]*si,y=p[0]*si+p[1]*co;a[k+j*3]=cx+x;a[k+j*3+1]=cy+y;a[k+j*3+2]=0;});}wp.geo.attributes.position.needsUpdate=true;wp.geo.computeBoundingSphere();}
function gpBuildWheelPatch(T,id,D,shared,frame){const views=GP_WHEEL_VIEWS[id];if(!views)return null;const geo=new T.BufferGeometry(),pos=new Float32Array(24),uv=new Float32Array(16);geo.setAttribute("position",new T.BufferAttribute(pos,3));geo.setAttribute("uv",new T.BufferAttribute(uv,2));geo.setIndex([0,1,2,0,2,3,4,5,6,4,6,7]);
  const mesh=new T.Mesh(geo,shared.mat),wp={id,mesh,geo,pos,uv,shared,cell:-1,view:-1,dir:1,kind:"rim",state:"sharp"};mesh.position.z=0.012;mesh.renderOrder=3;gpWheelPatchCell(wp,0);gpWheelPatchView(wp,D,frame);return wp;}
function gpWheelPatchUpdate(kt){const wp=kt.pic&&kt.pic.wheelPatch;if(!wp)return;const omega=Math.abs(kt.speed)/Math.max(0.01,kt.wheelRadius);let st=wp.state;if(st==="blur"){if(omega<10)st="semi";}else if(st==="semi"){if(omega>13)st="blur";else if(omega<5.5)st="sharp";}else if(omega>7.5)st="semi";wp.state=st;   // sharp → semi-blurred spokes → full radial blur, with hysteresis both ways
  if(wp.kind==="tread"){if(wp.state==="blur")gpWheelPatchCell(wp,wp.shared.treadBlurCell);else{const turn=((kt.wheelPhase*wp.dir)%(Math.PI*2)+Math.PI*2)%(Math.PI*2);gpWheelPatchCell(wp,wp.shared.treadCell+(Math.floor(turn/(Math.PI*2)*wp.shared.treadPhases+0.5)%wp.shared.treadPhases));}}
  else if(wp.state==="blur")gpWheelPatchCell(wp,wp.shared.blurCell);else{const turn=((kt.wheelPhase*wp.dir*6)%(Math.PI*2)+Math.PI*2)%(Math.PI*2);gpWheelPatchCell(wp,(wp.state==="semi"?wp.shared.semiCell:0)+Math.floor(turn/(Math.PI*2)*wp.shared.phases+0.5)%wp.shared.phases);}}
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
  if(car.type==="suv"){[-1,1].forEach(sd=>add(new T.BoxGeometry(0.055,0.055,3.45),dark,sd*w*0.34,S.roof+0.1,-0.35));[-1.35,0.65].forEach(z=>add(new T.BoxGeometry(w*0.72,0.045,0.055),dark,0,S.roof+0.125,z));}
  // wheels: tyre + textured rim + caliper, with a dark arch ring on the body
  const wheels=[],steers=[];
  [[1,S.xf,S.rad,S.tyreW],[-1,S.xf,S.rad,S.tyreW],[1,S.xr,S.radR,S.tyreWR],[-1,S.xr,S.radR,S.tyreWR]].forEach(([sd,z,rad,tw])=>{const hx=G.hw(z)-tw/2+0.03;const hub=new T.Group();hub.position.set(sd*hx,rad,z);g.add(hub);const wg=new T.Group();hub.add(wg);
    const ty=new T.Mesh(new T.CylinderGeometry(rad,rad,tw,24),mats.tyre);ty.rotation.z=Math.PI/2;ty.castShadow=true;wg.add(ty);
    const rm=new T.Mesh(new T.CircleGeometry(rad*0.7,24),mats.rim);rm.position.x=sd*(tw/2+0.004);rm.rotation.y=sd*Math.PI/2;wg.add(rm);
    const cal=new T.Mesh(new T.BoxGeometry(0.06,0.3,0.12),mats.caliper);cal.position.set(sd*(tw/2-0.08),0,-rad*0.55);hub.add(cal);
    const arch=new T.Mesh(new T.CylinderGeometry(rad+0.1,rad+0.1,0.05,22),dark);arch.rotation.z=Math.PI/2;arch.position.set(sd*(G.hw(z)-0.0),rad+0.02,z);arch.castShadow=false;g.add(arch);
    wg.userData.rad=rad;wheels.push(wg);if(z>0)steers.push(hub);});
  const blob=new T.Mesh(new T.PlaneGeometry(w*1.5,S.len*1.2),new T.MeshBasicMaterial({map:shared.blob,color:0x000000,transparent:true,opacity:0.42,depthWrite:false}));blob.material.userData.lin=1;blob.rotation.x=-Math.PI/2;blob.position.y=0.04;g.add(blob);
  return{g,body:b,wheels,steers,shadows:[blob],tailMat:mats.tail,bodyMat:mats.body,S,xr:S.xr,hw:G.hw};}
/* ---------- real 3D car models (GLB) ----------
   Built headless in Blender (lz-gp-3dcar-shots/blender/build_car.py) and loaded with the r128 GLTFLoader (vendored next to the game, so
   it stays on the same Three.js as Kingdom). Node names the game drives: body (suspension lean/dive/squat), hub_FL/FR/RL/RR (front hubs
   steer about y), wheel_XX (spin about x), caliper_XX (stay still). Materials are swapped by name so paint, brake lights and the number
   decal are ours to drive. A model that fails to load leaves that car on its picture sprite. */
const GP_GLB={falcon:{src:"assets/cars3d/falcon.glb?v=4",tyreX:0.865,xr:-1.42,tail:-2.30,pivotY:0.32,glows:[[0.6,0.745,0.66,0.3],[-0.6,0.745,0.66,0.3],[0,0.6,0.36,0.26],[0.3,0.785,0.6,0.16],[-0.3,0.785,0.6,0.16]]}};   // glows: [x,y,w,h] over the lamps
const GP_GLTF_SRC="assets/vendor/GLTFLoader.r128.js";
function gpGltfLoader(){if(window.THREE&&THREE.GLTFLoader)return Promise.resolve(true);if(window._gpGltfP)return window._gpGltfP;
  window._gpGltfP=new Promise(res=>{const s=document.createElement("script");s.src=GP_GLTF_SRC;s.async=true;s.onload=()=>res(!!(window.THREE&&THREE.GLTFLoader));s.onerror=()=>{window._gpGltfP=null;res(false);};document.head.appendChild(s);});return window._gpGltfP;}
function gpLoadGlb(ids){
  if(!window.THREE)return Promise.resolve({});window._gpGlb=window._gpGlb||{};
  const want=[...new Set(ids||Object.keys(GP_GLB))].filter(id=>GP_GLB[id]&&!window._gpGlb[id]);if(!want.length)return Promise.resolve(window._gpGlb);
  return gpGltfLoader().then(ok=>{if(!ok)return window._gpGlb;const L=new THREE.GLTFLoader();
    return Promise.all(want.map(id=>new Promise(res=>L.load(GP_GLB[id].src,g=>{window._gpGlb[id]=g.scene;res();},undefined,()=>{res();})))).then(()=>window._gpGlb);});}
function gpGlbShared(T,shared){if(shared.glb)return shared.glb;
  const std=o=>{const m=new T.MeshStandardMaterial(o);m.userData.lin=1;return m;};
  shared.glb={
    stripe:std({color:gpLin("#f4f4f0"),roughness:0.32,metalness:0.02}),
    carbon:std({color:gpLin("#16171b"),roughness:0.5,metalness:0.25,envMapIntensity:0.6}),
    glass:std({color:gpLin("#0d141d"),roughness:0.06,metalness:0.7,envMapIntensity:1.8}),
    tyre:std({color:gpLin("#151517"),roughness:0.9,metalness:0,envMapIntensity:0.3}),
    tyrewall:std({color:gpLin("#26272c"),roughness:0.7,metalness:0,envMapIntensity:0.45}),
    rim:std({color:gpLin("#c9cdd4"),roughness:0.3,metalness:0.55,envMapIntensity:0.35}),   // low env: shiny rims mirrored the grass and looked green
    rimdark:std({color:gpLin("#1b1c20"),roughness:0.45,metalness:0.3,envMapIntensity:0.3}),
    spoke:std({color:gpLin("#3d4047"),roughness:0.38,metalness:0.45,envMapIntensity:0.3}),   // dark gunmetal spokes in the recessed rim face
    disc:std({color:gpLin("#7b7e83"),roughness:0.45,metalness:0.8}),
    caliper:std({color:gpLin("#f2c21b"),roughness:0.4,metalness:0.1}),
    lamp:std({color:gpLin("#ffffff"),emissive:gpLin("#fff4e2"),emissiveIntensity:1.5,roughness:0.1}),
    exhaust:std({color:gpLin("#2a2a2d"),roughness:0.45,metalness:0.5,envMapIntensity:0.25}),
    decal:null,glowTex:gpSoftDot(),
    // spoke blur: a soft spun-metal disc that fades in over the outer face as the wheel spins up, so fast wheels read as spinning, not strobing
    blurTex:gpCanvasTex(128,128,(x,w,h)=>{x.clearRect(0,0,w,h);const c=64,g=x.createRadialGradient(c,c,0,c,c,63);g.addColorStop(0,"rgba(40,41,46,1)");g.addColorStop(0.2,"rgba(70,72,78,1)");g.addColorStop(0.24,"rgba(150,154,162,.95)");g.addColorStop(0.62,"rgba(126,130,138,.9)");g.addColorStop(0.9,"rgba(95,98,105,.92)");g.addColorStop(0.95,"rgba(205,208,214,1)");g.addColorStop(1,"rgba(205,208,214,0)");x.fillStyle=g;x.beginPath();x.arc(c,c,63,0,7);x.fill();
      x.strokeStyle="rgba(255,255,255,.12)";for(let r=18;r<56;r+=6){x.lineWidth=1.5;x.beginPath();x.arc(c,c,r,0,7);x.stroke();}})};
  return shared.glb;}
function gpGlbPaintFor(car,player){const u=player&&gpUp().paint;return(u&&/^#[0-9a-f]{6}$/i.test(u))?u:car.paint;}   // model cars keep their own colour unless a paint upgrade was picked
function gpUp(){const u=P&&P.gpUp;return(u&&typeof u==="object")?u:(window._gpUp||{});}
function gpGlbPaint(paint){const m=new THREE.MeshPhysicalMaterial({color:gpLin(paint).multiplyScalar(0.8),metalness:0.05,roughness:0.38,clearcoat:1,clearcoatRoughness:0.08,envMapIntensity:0.6});m.userData.lin=1;return m;}
function gpBuildGlbCar(T,car,src,paint,shared){
  const S=GP_SHAPE[car.type],D=GP_GLB[car.id],SM=gpGlbShared(T,shared),g=new T.Group(),root=src.clone(true);g.add(root);
  const paintM=gpGlbPaint(paint);let stripe=SM.stripe;if(gpUpLight(paint)){stripe=SM.stripe.clone();stripe.color.copy(gpLin("#d1121c"));stripe.userData.lin=1;}
  const tail=new T.MeshStandardMaterial({color:gpLin("#5a0004"),emissive:gpLin("#ff0d06"),emissiveIntensity:0.55,roughness:0.3});tail.userData.lin=1;tail.toneMapped=false;   // stays RED when lit (tone mapping turned it orange)
  let body=null;const hubs={},wh={};
  root.traverse(o=>{if(o.name==="body")body=o;else if(/^hub_/.test(o.name))hubs[o.name.slice(4)]=o;else if(/^wheel_/.test(o.name))wh[o.name.slice(6)]=o;
    if(!o.isMesh)return;const nm=o.material&&o.material.name;
    if(nm==="decal"){if(!SM.decal){const d=o.material;d.alphaTest=0.5;d.transparent=false;d.polygonOffset=true;d.polygonOffsetFactor=-2;d.polygonOffsetUnits=-2;d.roughness=0.35;d.metalness=0;d.userData.lin=1;SM.decal=d;}o.material=SM.decal;o.castShadow=false;return;}
    o.material=nm==="paint"?paintM:nm==="tail"?tail:nm==="stripe"?stripe:(SM[nm]||o.material);if(!o.material.userData.lin)o.material.userData.lin=1;
    o.castShadow=nm!=="glass"&&!/^(wheel|caliper|hub)_/.test(o.parent&&o.parent.name||o.name);o.receiveShadow=false;});   // wheels skip the shadow pass (draw calls); the body shadow + soft footprint ground them
  if(!body)body=root;
  const wheels=[],steers=[],blurs=[];if(!SM.blurGeo)SM.blurGeo=new T.CircleGeometry(1,28);
  ["FL","FR","RL","RR"].forEach(k=>{const w=wh[k];if(!w)return;const rad=k[0]==="F"?S.rad:S.radR,tw=k[0]==="F"?0.3:0.38,sd=hubs[k]&&hubs[k].position.x<0?-1:1;w.userData.rad=rad;wheels.push(w);if(k[0]==="F"&&hubs[k])steers.push(hubs[k]);
    const bm=new T.MeshBasicMaterial({map:SM.blurTex,transparent:true,opacity:0,depthWrite:false});bm.userData.lin=1;const b=new T.Mesh(SM.blurGeo,bm);b.scale.setScalar(rad*0.6);b.position.x=sd*(tw/2-0.02);b.rotation.y=sd*Math.PI/2;b.visible=false;b.renderOrder=2;w.add(b);w.userData.blur=b;blurs.push(b);});
  // brake lights: soft additive glows over the LED clusters and the rain light, faded in on the brake (plus the emissive lamp material)
  const glows=(D.glows||[]).map(q=>{const m=new T.SpriteMaterial({map:SM.glowTex,color:0xff1606,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending});m.toneMapped=false;m.userData.lin=1;
    const s=new T.Sprite(m);s.position.set(q[0],q[1],D.tail-0.08);s.scale.set(q[2],q[3],1);s.visible=false;body.add(s);return s;});
  // grounding: a dark soft footprint under the whole car + a tight contact patch under each tyre. Both live on the car root (not the
  // sprung body), so they stay flat on the road through lean / dive / hops and turn with the car in a drift.
  const blob=new T.Mesh(new T.PlaneGeometry(S.w*1.22,S.len*1.02),new T.MeshBasicMaterial({map:shared.ao||shared.blob,color:0x000000,transparent:true,opacity:0.92,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}));blob.material.userData.lin=1;blob.rotation.x=-Math.PI/2;blob.position.y=0.035;g.add(blob);
  if(!shared.contact)shared.contact=gpContactTex();
  const cps=[],cu=[],ci=[];["FL","FR","RL","RR"].forEach((k,q)=>{const h=hubs[k];if(!h)return;const tw=(k[0]==="F"?0.3:0.38)+0.24,ln=0.95,x=h.position.x,z=h.position.z;cps.push(x-tw/2,0,z-ln/2,x+tw/2,0,z-ln/2,x+tw/2,0,z+ln/2,x-tw/2,0,z+ln/2);cu.push(0,0,1,0,1,1,0,1);const v=q*4;ci.push(v,v+2,v+1,v,v+3,v+2);});
  const cg=new T.BufferGeometry();cg.setAttribute("position",new T.Float32BufferAttribute(cps,3));cg.setAttribute("uv",new T.Float32BufferAttribute(cu,2));cg.setIndex(ci);
  const cmat=new T.MeshBasicMaterial({map:shared.contact,color:0x000000,transparent:true,opacity:1,depthWrite:false,side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});cmat.userData.lin=1;
  const contacts=new T.Mesh(cg,cmat);contacts.position.y=0.04;contacts.frustumCulled=false;g.add(contacts);
  return{g,body,wheels,steers,shadows:[blob,contacts],tailMat:tail,bodyMat:paintM,stripeMat:stripe,S,xr:D.xr||S.xr,hw:z=>S.w/2,tyreX:D.tyreX,glb:{glows,blurs,glow:0,rollV:0,pitchV:0,heave:0,heaveV:0,pivotY:D.pivotY||0.3}};}
/* per frame for model cars: brake glow fade (the springs for lean / dive / squat run in gpUpdate) */
function gpGlbUpdate(kt,dt){const G=kt.glb;G.glow+=((kt.brakeOn?1:0)-G.glow)*Math.min(1,dt*(kt.brakeOn?18:7));
  const om=Math.abs(kt.speed)/Math.max(0.1,kt.S.radR),bo=Math.max(0,Math.min(0.88,(om-18)/34));G.blurs.forEach(b=>{const v=bo>0.02;if(b.visible!==v)b.visible=v;if(v)b.material.opacity=bo;});
  kt.tailMat.emissiveIntensity=0.5+G.glow*1.9;G.glows.forEach(s=>{const v=G.glow>0.02;if(s.visible!==v)s.visible=v;if(v)s.material.opacity=G.glow*0.7;});}
/* ---------- pick-an-upgrade after each race ----------
   Finishing a race (any place) offers 3 big cards; one tap fits that upgrade, saved on the profile (P.gpUp, same save() pattern).
   Everything is earned by racing: no shop, no coins, nothing to buy. Steps are small so races stay fair and finishable:
   tyres +4% grip, speed +2% top speed, launch +6% pick-up per level (3 levels each); paint and stickers are looks only and
   show on the 3D Rosso Falcon. Upgrades help in every car. */
const GP_UP_MAX=3;
const GP_UP_PERF={
  tyres:{n:"Grippier tyres",icon:"🛞",c:"#2A9D8F",line:"Stickier in the corners",step:"+4% grip"},
  speed:{n:"Faster top speed",icon:"⚡",c:"#E63946",line:"A bit more speed on the straights",step:"+2% top speed"},
  launch:{n:"Quicker launch",icon:"🚀",c:"#F4A261",line:"Zoom off the start line",step:"+6% launch"}};
const GP_UP_PAINTS=[["#1d5fd1","Ocean blue"],["#f7c600","Sunny yellow"],["#2e9e57","Racing green"],["#8e3bd6","Galaxy purple"],["#ff7a00","Tiger orange"],["#ff5fa2","Bubblegum pink"],["#15171c","Midnight black"],["#eef0f2","Snow white"],["#18b8a8","Turbo teal"]];
const GP_UP_STICKERS=[["star","⭐","Gold star"],["bolt","⚡","Lightning bolt"],["flame","🔥","Hot flames"],["crown","👑","Champion crown"],["lion","🦁","Brave lion"],["rocket","🚀","Rocket"],["heart","💜","Purple heart"],["dragon","🐉","Dragon"]];
const GP_TYRE_RING=["","#ffd21f","#2fd3c3","#ff3d8b"];   // sidewall stripe colour per tyre level
function gpUpState(){const u=gpUp(),lv=k=>Math.max(0,Math.min(GP_UP_MAX,u[k]|0));
  return{tyres:lv("tyres"),speed:lv("speed"),launch:lv("launch"),paints:Array.isArray(u.paints)?u.paints.filter(h=>GP_UP_PAINTS.some(p=>p[0]===h)):[],stickers:Array.isArray(u.stickers)?u.stickers.filter(s=>GP_UP_STICKERS.some(x=>x[0]===s)):[],
    paint:typeof u.paint==="string"?u.paint:null,sticker:typeof u.sticker==="string"?u.sticker:null,picks:u.picks|0};}
function gpUpSave(u){if(P){P.gpUp=u;save();}else window._gpUp=u;}
function gpUpShuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
/* three different cards: performance upgrades that still have a level to go, one new paint, one new sticker */
function gpUpOffer(){const u=gpUpState(),perf=Object.keys(GP_UP_PERF).filter(k=>u[k]<GP_UP_MAX).map(k=>({k}));
  const pn=GP_UP_PAINTS.filter(p=>!u.paints.includes(p[0])),sn=GP_UP_STICKERS.filter(s=>!u.stickers.includes(s[0]));
  const looks=[];if(pn.length){const p=pn[Math.floor(Math.random()*pn.length)];looks.push({k:"paint",v:p[0],name:p[1]});}if(sn.length){const s=sn[Math.floor(Math.random()*sn.length)];looks.push({k:"sticker",v:s[0],e:s[1],name:s[2]});}
  let pick=gpUpShuffle(perf).slice(0,2).concat(gpUpShuffle(looks).slice(0,1));   // usually 2 go-faster cards + 1 look card
  const rest=gpUpShuffle(perf.concat(looks).filter(c=>!pick.includes(c)));while(pick.length<3&&rest.length)pick.push(rest.shift());
  return gpUpShuffle(pick);}
function gpUpCard(c,i){const u=gpUpState();let icon,title,line,pips="",col;
  if(GP_UP_PERF[c.k]){const D=GP_UP_PERF[c.k],lv=u[c.k];icon='<i class="fz-upi">'+D.icon+'</i>';title=D.n;line=D.line+' · '+D.step;col=D.c;
    pips='<span class="fz-pips" aria-label="Level '+(lv+1)+' of '+GP_UP_MAX+'">'+Array.from({length:GP_UP_MAX},(_,q)=>'<em class="'+(q<lv?"on":(q===lv?"new":""))+'"></em>').join("")+'</span>';}
  else if(c.k==="paint"){icon='<i class="fz-upi sw" style="--p:'+c.v+'"></i>';title="New paint";line=c.name+' for your car';col=c.v;}
  else{icon='<i class="fz-upi">'+c.e+'</i>';title="Sticker";line=c.name+' on your rear wing';col="#FFB7B2";}
  return'<button class="fz-upc" style="--c:'+col+';--d:'+(i*110)+'ms" data-i="'+i+'">'+icon+'<span class="fz-upt"><b>'+esc(title)+'</b><small>'+esc(line)+'</small>'+pips+'</span><span class="fz-upgo">PICK</span></button>';}
/* shows the picker over the finish panel; resolves after the pick animation (or at once when there is nothing left to offer) */
function gpUpPicker(host,done){const offer=gpUpOffer();if(!host||!offer.length){done&&done(null);return;}
  const ov=document.createElement("div");ov.className="fz-up";ov.setAttribute("role","dialog");ov.setAttribute("aria-label","Pick an upgrade");
  ov.innerHTML='<div class="fz-up-h"><b>PICK AN UPGRADE!</b><span>Choose one for your car</span></div><div class="fz-up-cards">'+offer.map(gpUpCard).join("")+'</div>';
  host.appendChild(ov);let picked=false;
  ov.querySelectorAll(".fz-upc").forEach(b=>b.addEventListener("click",ev=>{ev.preventDefault();ev.stopPropagation();if(picked)return;picked=true;const c=offer[+b.dataset.i];
    const u=gpUpState();let msg;
    if(GP_UP_PERF[c.k]){u[c.k]=Math.min(GP_UP_MAX,u[c.k]+1);msg=GP_UP_PERF[c.k].icon+" "+GP_UP_PERF[c.k].n+" · level "+u[c.k];}
    else if(c.k==="paint"){if(!u.paints.includes(c.v))u.paints.push(c.v);u.paint=c.v;msg="🎨 "+c.name+" paint";}
    else{if(!u.stickers.includes(c.v))u.stickers.push(c.v);u.sticker=c.v;msg=c.e+" "+c.name+" sticker";}
    u.picks=(u.picks|0)+1;gpUpSave(u);sfx("tick");
    b.classList.add("picked");ov.classList.add("chosen");const pe=b.querySelector(".fz-pips em.new");if(pe)pe.classList.add("on");
    if(!(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)){const r=b.getBoundingClientRect(),hr=ov.getBoundingClientRect();
      for(let q=0;q<14;q++){const s=document.createElement("i");s.className="fz-spark";const a=q/14*6.283+Math.random()*0.4,d=70+Math.random()*60;s.style.cssText="left:"+(r.left-hr.left+r.width/2)+"px;top:"+(r.top-hr.top+r.height*0.35)+"px;--x:"+(Math.cos(a)*d).toFixed(0)+"px;--y:"+(Math.sin(a)*d-30).toFixed(0)+"px;--c:"+(q%2?"#fff3c4":getComputedStyle(b).getPropertyValue("--c"));ov.appendChild(s);}}
    const fit=document.createElement("div");fit.className="fz-up-fit";fit.textContent="FITTED! ✓";b.appendChild(fit);
    setTimeout(()=>{ov.classList.add("out");setTimeout(()=>ov.remove(),300);done&&done(msg);},1250);}));}
/* 3D bits that show the upgrades on a model car: tyre sidewall stripes and the stickers on the rear wing */
function gpUpFit(T,m,player,shared){if(!player||!m.glb)return;const u=gpUpState(),SM=shared.glb;
  if(u.tyres>0){const rm=new T.MeshStandardMaterial({color:gpLin(GP_TYRE_RING[u.tyres]),roughness:0.5,side:T.DoubleSide});rm.userData.lin=1;
    m.wheels.forEach((w,i)=>{const front=i<2,rad=front?m.S.rad:m.S.radR,tw=front?0.3:0.38,b=w.userData.blur,sd=b?Math.sign(b.position.x):1;const ring=new T.Mesh(new T.RingGeometry(rad*0.8,rad*0.87,32),rm);ring.position.x=sd*(tw/2+0.017);ring.rotation.y=sd*Math.PI/2;w.add(ring);});}
  const st=GP_UP_STICKERS.find(s=>s[0]===u.sticker);
  if(st){const tex=gpCanvasTex(256,256,(x,w,h)=>{x.clearRect(0,0,w,h);x.fillStyle="#fff";x.beginPath();x.arc(128,128,118,0,7);x.fill();x.lineWidth=10;x.strokeStyle="#15161a";x.stroke();x.font="150px system-ui,'Apple Color Emoji','Segoe UI Emoji'";x.textAlign="center";x.textBaseline="middle";x.fillText(st[1],128,142);});
    const sm=new T.MeshStandardMaterial({map:tex,transparent:true,alphaTest:0.4,roughness:0.4,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});sm.userData.lin=1;
    [-1,1].forEach(sd=>{const q=new T.Mesh(new T.PlaneGeometry(0.36,0.36),sm);q.position.set(sd*0.6,1.272,-2.02);q.rotation.set(-Math.PI/2-0.1,0,Math.PI);m.body.add(q);});}}
function gpUpLight(h){const c=new THREE.Color(h);return c.r*0.3+c.g*0.59+c.b*0.11>0.7;}
/* car screen: the upgrades already fitted, with paint and sticker chips to switch between */
function gpGarageHtml(){const u=gpUpState();if(!u.picks)return'<div class="fz-garage empty">🏁 Finish a race to pick your first upgrade!</div>';
  const lv=k=>'<span class="fz-glv"><b>'+GP_UP_PERF[k].icon+' '+GP_UP_PERF[k].n+'</b><span class="fz-pips">'+Array.from({length:GP_UP_MAX},(_,q)=>'<em class="'+(q<u[k]?"on":"")+'"></em>').join("")+'</span></span>';
  const paints=[["","Rosso red"]].concat(GP_UP_PAINTS.filter(p=>u.paints.includes(p[0])));
  const ps=u.paints.length?'<div class="fz-gchips"><i>Paint</i>'+paints.map(p=>'<button class="fz-gp'+((u.paint||"")===p[0]?" on":"")+'" style="--p:'+(p[0]||"#d1121c")+'" aria-label="'+esc(p[1])+'" onclick="gpGarageSet(\'paint\',\''+p[0]+'\')"></button>').join("")+'</div>':"";
  const ss=u.stickers.length?'<div class="fz-gchips"><i>Sticker</i><button class="fz-gs'+(!u.sticker?" on":"")+'" onclick="gpGarageSet(\'sticker\',\'\')" aria-label="No sticker">✕</button>'+GP_UP_STICKERS.filter(s=>u.stickers.includes(s[0])).map(s=>'<button class="fz-gs'+(u.sticker===s[0]?" on":"")+'" aria-label="'+esc(s[2])+'" onclick="gpGarageSet(\'sticker\',\''+s[0]+'\')">'+s[1]+'</button>').join("")+'</div>':"";
  return'<div class="fz-garage"><div class="fz-gt">🔧 My upgrades <small>(paint and stickers show on the Rosso Falcon)</small></div><div class="fz-glvs">'+["tyres","speed","launch"].map(lv).join("")+'</div>'+ps+ss+'</div>';}
function gpGarageSet(k,v){const u=gpUpState();u[k]=v||null;gpUpSave(u);sfx("tick");const g=document.querySelector(".fz-garage");if(g)g.outerHTML=gpGarageHtml();}
/* ---------- real car pictures ---------- */
/* Loads only the sheets used by this grid, so the SUV race texture stays lazy until the SUV is selected. Resolves with a map id → texture
   or null when a picture failed; a null means that car keeps its 3D model. */
function gpRacePicIds(){const mine=gpCar(),others=GP_CARS.filter(c=>c.id!==mine.id).slice(0,4);return[mine].concat(others).map(c=>c.id);}
function gpLoadPics(ids){
  if(!window.THREE)return Promise.resolve({});
  const T=THREE;window._gpPics=window._gpPics||{};const L=new T.TextureLoader(),want=[...new Set(ids||Object.keys(GP_PICS))].filter(id=>GP_PICS[id]);
  return Promise.all(want.map(id=>new Promise(res=>{
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
  return Promise.all([tex("sky",false,false),tex("props",false,false),tex("rail",true,true),tex("road",true,true),img,
    tex("flame",false,false),tex("gantry",false,false),tex("pits",false,false),tex("stand",false,false),tex("crowd",true,true),tex("kerb",true,true),tex("boards",false,false),
    tex("skyDusk",false,false),tex("trees",false,false),tex("smoke",false,false),tex("petal",false,false)]).then(()=>W);
}
/* A picture car: one upright plane that turns to face the camera (Out Run style), showing the
   nose-right / straight / nose-left frame chosen from the car's angle to the line of sight.
   Physics, collisions and the soft contact shadow are exactly the same as the 3D cars. */
/* Picture-car shader. Two texture lookups (view A and view B of the sheet) mixed by uMix give a smooth turn between photographed
   views. The plane is cut into 14 rows: rows above the wheel hubs rotate by uLean about hub height (body roll) and rise by uLift
   (tail up under braking, squat under power), rows at tyre level stay put, so the tyres never leave the road. Colours stay in the
   texture's sRGB space (same result as the old MeshBasicMaterial with sRGB in and out, tone mapping off). */
function gpPicMat(T,tex,D,tint){
  const tc=tint?new T.Color(Math.pow(tint.r,1/2.2),Math.pow(tint.g,1/2.2),Math.pow(tint.b,1/2.2)):new T.Color(1,1,1);
  const m=new T.ShaderMaterial({side:T.DoubleSide,transparent:false,
    uniforms:{map:{value:tex},uRep:{value:new T.Vector2(1/D.cols,1/D.rows)},uOffA:{value:new T.Vector2()},uOffB:{value:new T.Vector2()},uMix:{value:0},uTint:{value:tc},
      uLean:{value:0},uLift:{value:0},uHub:{value:0.38},uBase:{value:-1},uGlint:{value:0.5},uGlintA:{value:0.12}},
    vertexShader:"uniform float uLean,uLift,uHub,uBase;varying vec2 vUv;void main(){vUv=uv;vec3 p=position;float hy=p.y-uBase;float w=smoothstep(uHub*0.7,uHub*1.8,hy);float a=uLean*w;float py=hy-uHub;float c=cos(a),s=sin(a);float x=position.x;p.x=x*c-py*s;p.y=uBase+uHub+x*s+py*c+uLift*w;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}",
    fragmentShader:"uniform sampler2D map;uniform vec2 uRep,uOffA,uOffB;uniform float uMix,uGlint,uGlintA;uniform vec3 uTint;varying vec2 vUv;void main(){vec2 uv=clamp(vUv,vec2(0.002),vec2(0.998))*uRep;vec4 a=texture2D(map,uv+uOffA);vec4 b=uMix>0.001?texture2D(map,uv+uOffB):a;float wa=a.a*(1.0-uMix),wb=b.a*uMix,al=wa+wb;if(al<0.3)discard;vec3 c=(a.rgb*wa+b.rgb*wb)/max(al,0.001);float lum=dot(c,vec3(0.299,0.587,0.114));float d=(vUv.x-uGlint)*2.6+(vUv.y-0.62)*1.3;float band=exp(-d*d*6.0)*smoothstep(0.35,0.75,vUv.y);c=c*uTint+uGlintA*band*smoothstep(0.12,0.5,lum)*vec3(1.0,0.9,0.75);gl_FragColor=vec4(c,1.0);}"});
  m.toneMapped=false;m.userData.lin=1;return m;}
function gpPicSetFrames(pc,fa,fb,mix){const D=pc.D,U=pc.mat.uniforms,oa=gpPicOffset(D,gpPicPacked(D,fa,pc.angles)),ob=gpPicOffset(D,gpPicPacked(D,fb,pc.angles));U.uOffA.value.set(oa[0],oa[1]);U.uOffB.value.set(ob[0],ob[1]);U.uMix.value=mix;}
function gpGlowPlace(pc,f){if(!pc.glows)return;const D=pc.D,L=D.lights[gpPicPacked(D,f,pc.angles)%pc.angles]||[];pc.glows.forEach((g,q)=>{const l=L[q];g.userData.on=!!l;if(!l){g.visible=false;return;}g.position.x=(l[0]-D.fw/2)/D.ppm;g.position.y=(D.fh/2-l[1])/D.ppm;const sz=0.42*l[2];g.scale.set(sz*1.5,sz,1);});}
function gpBuildPicCar(T,car,tex,shared){
  const S=GP_SHAPE[car.type],D=GP_PICS[car.id],g=new T.Group(),b=new T.Group();g.add(b);const PF=gpPicFrames(D),mid=gpPicMid(D);
  const t=tex.clone();t.needsUpdate=true;t.repeat.set(1/D.cols,1/D.rows);const o0=gpPicOffset(D,mid);t.offset.set(o0[0],o0[1]);
  const w=D.fw/D.ppm,h=D.fh/D.ppm;
  // the picture is drawn by a small shader (gpPicMat): it cross-fades between two views when the angle changes (no snapping), leans and
  // lifts the body above the wheel line while the tyres stay planted, and slides a warm sheen across the paint as the car turns
  const mat=gpPicMat(T,tex,D,shared.carTint);
  const pl=new T.Mesh(new T.PlaneGeometry(w,h,1,14),mat);pl.position.z=-0.1;pl.castShadow=false;pl.receiveShadow=false;b.add(pl);
  if(!shared.wheelPatch)shared.wheelPatch=gpWheelPatchShared(T);const wheelPatch=gpBuildWheelPatch(T,car.id,D,shared.wheelPatch,mid);if(wheelPatch)pl.add(wheelPatch.mesh);
  // exhaust flames for sheets without baked flame frames: a small additive sprite under the tail, shown while flameT runs
  let flame=null;if(!PF.flames&&shared.flameTex){const FL=GP_WORLD.flame,fw=w*(D.flameRelW||FL.relW),fh=fw*FL.h/FL.w;const fm=new T.MeshBasicMaterial({map:shared.flameTex,transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide});fm.toneMapped=false;fm.userData.lin=1;
    flame=new T.Mesh(new T.PlaneGeometry(fw,fh),fm);flame.position.set(FL.cx*w,-h/2+(D.flameBottom!=null?D.flameBottom:FL.bottom)*h+fh/2,0.01);flame.visible=false;pl.add(flame);}
  // contact shadow: a centred soft footprint on the car root (ambient darkening under the body) plus one tight patch under every photographed
  // tyre. The patches live in a group that turns with the sprite plane; gpContactUpdate() puts each one where the camera ray through that
  // tyre's bottom row meets the road, so it sits exactly under the tyre the picture shows (the far tyres of a three-quarter photo sit higher).
  const mk=(sw,sl,op,y,z,tex)=>{const m=new T.Mesh(new T.PlaneGeometry(sw,sl),new T.MeshBasicMaterial({map:tex,color:0x000000,transparent:true,opacity:op,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}));m.material.userData.lin=1;m.rotation.x=-Math.PI/2;m.position.y=y;m.position.z=z;g.add(m);return m;};
  const footprint=mk(S.w*1.1,S.len*0.68,0.5,0.04,0,shared.ao);
  if(!shared.contact)shared.contact=gpContactTex();
  const NC=4,cg=new T.BufferGeometry(),cp=new Float32Array(NC*12),cu=new Float32Array(NC*8),ci=[];for(let q=0;q<NC;q++){cu.set([0,0,1,0,1,1,0,1],q*8);const v=q*4;ci.push(v,v+1,v+2,v,v+2,v+3);}
  cg.setAttribute("position",new T.BufferAttribute(cp,3));cg.setAttribute("uv",new T.BufferAttribute(cu,2));cg.setIndex(ci);
  const cm=new T.MeshBasicMaterial({map:shared.contact,color:0x000000,transparent:true,opacity:0.88,depthWrite:false,side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});cm.userData.lin=1;
  const contacts=new T.Mesh(cg,cm);contacts.frustumCulled=false;const cgrp=new T.Group();cgrp.position.set(0,0.045,-0.1);cgrp.add(contacts);g.add(cgrp);
  const shadows=[footprint,contacts];
  // brake lights: soft additive glows on the photographed lamps (GP_PICS.<car>.lights per view), faded in while braking
  let glows=null;if(D.lights){if(!shared.glowTex)shared.glowTex=gpSoftDot();glows=[];for(let q=0;q<3;q++){const gm=new T.MeshBasicMaterial({map:shared.glowTex,color:0xff2a14,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide});gm.toneMapped=false;gm.userData.lin=1;const gl=new T.Mesh(new T.PlaneGeometry(1,1),gm);gl.position.z=0.03;gl.visible=false;pl.add(gl);glows.push(gl);}}
  mat.uniforms.uHub.value=S.radR;const pic={pl,t,D,mat,glows,w,h,angles:PF.angles,flames:PF.flames,flame,wheelPatch,frame:mid,prevFrame:mid,fade:1,bin:0,rel:0,flameT:0,bottomPx:0,bottomLocalY:0,cgrp,cgeo:cg,cpos:cp,tyres:D.tyres?D.tyres[mid]:null,lean:0,leanV:0,lift:0,liftV:0,glow:0};gpPicAnchor(pic,mid);gpPicSetFrames(pic,mid,mid,0);gpGlowPlace(pic,mid);
  return{g,body:b,wheels:[],steers:[],shadows,tailMat:{emissiveIntensity:0.9},bodyMat:mat,S,xr:S.xr,hw:z=>S.w/2,pic};}
/* Place the tyre-contact patches: for each photographed tyre bottom (plane-local x, height above the contact line) find where the camera
   ray through it meets the road - straight below for the near tyres, pushed away from the camera for the higher far tyres - so every
   patch sits under its tyre from the player's viewpoint. Writes the existing position buffer; nothing is allocated per frame. */
function gpContactUpdate(kt,camPos){const pc=kt.pic,ty=pc.tyres,a=pc.cpos;pc.cgrp.rotation.y=pc.pl.rotation.y;if(!ty){for(let j=0;j<a.length;j++)a[j]=0;pc.cgeo.attributes.position.needsUpdate=true;return;}
  const D=pc.D,g=kt.g,dx=g.position.x-camPos.x,dz=g.position.z-camPos.z,Dc=Math.max(1,Math.hypot(dx,dz)),Hc=Math.max(0.6,camPos.y-g.position.y),tb=pc.bottomPx,hd=kt.S.radR*0.7;let n=0;
  for(;n<ty.length&&n<4;n++){const t=ty[n],x=(t[0]-D.fw/2)/D.ppm,lift=Math.max(0,(tb-t[1])/D.ppm),hw=t[2]/D.ppm*0.7,push=Math.min(3,Dc*lift/Math.max(0.3,Hc-lift)),k=(Dc+push)/Dc,cx=x*k,cz=-push,kk=n*12;
    a[kk]=cx-hw;a[kk+1]=0;a[kk+2]=cz+hd;a[kk+3]=cx+hw;a[kk+4]=0;a[kk+5]=cz+hd;a[kk+6]=cx+hw;a[kk+7]=0;a[kk+8]=cz-hd;a[kk+9]=cx-hw;a[kk+10]=0;a[kk+11]=cz-hd;}
  for(let q=n;q<4;q++)for(let j=0;j<12;j++)a[q*12+j]=0;
  pc.cgeo.attributes.position.needsUpdate=true;}
/* Podium party: confetti pieces and cherry petals (cells of assets/world/fx.webp) tumble down over the finish panel on a
   canvas for ~9 s. Nothing is drawn for prefers-reduced-motion or when the sheet fails to load. */
function gpConfetti(host){
  if(!host||!GP_WORLD.fx||(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches))return;
  const FX=GP_WORLD.fx,img=new Image();img.decoding="async";
  img.onload=()=>{if(!document.contains(host))return;const cv=document.createElement("canvas");cv.className="fz-fx";cv.setAttribute("aria-hidden","true");host.appendChild(cv);const x=cv.getContext("2d");
    const N=70,P=[];for(let i=0;i<N;i++){const petal=i%4===0;P.push({c:petal?(i>>2)%FX.petals:FX.petals+(i%FX.confetti),x:Math.random(),y:-Math.random()*1.2-0.05,vy:(petal?0.05:0.09)+Math.random()*0.07,sw:0.4+Math.random()*1.2,ph:Math.random()*6.28,r:Math.random()*6.28,vr:(Math.random()-0.5)*(petal?2:5),s:petal?0.65+Math.random()*0.4:0.5+Math.random()*0.5});}
    let last=performance.now(),t=0,raf=0;const B=FX.box;
    const step=now=>{if(!document.contains(cv))return;const dt=Math.min(0.05,(now-last)/1000);last=now;t+=dt;const W=cv.clientWidth|0,H=cv.clientHeight|0;if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H;}x.clearRect(0,0,W,H);const sz=Math.max(14,Math.min(30,W/36));
      P.forEach(p=>{p.y+=p.vy*dt;p.r+=p.vr*dt;const px=(p.x+Math.sin(t*p.sw+p.ph)*0.03)*W,py=p.y*H;if(py>H+sz)return;x.save();x.translate(px,py);x.rotate(p.r);x.scale(1,0.55+0.45*Math.abs(Math.cos(t*p.sw*1.7+p.ph)));x.drawImage(img,p.c*B,0,B,B,-sz*p.s/2,-sz*p.s/2,sz*p.s,sz*p.s);x.restore();});
      if(t<9)raf=requestAnimationFrame(step);else cv.remove();};
    raf=requestAnimationFrame(step);};
  img.src=FX.src;
}
function gpWrapAng(a){while(a>Math.PI)a-=Math.PI*2;while(a<-Math.PI)a+=Math.PI*2;return a;}
/* per frame: face the camera, pick the view and cross-fade into it, and move the body (lean / tail lift / kerb chatter).
   The player's view comes from the real angle between car and chase camera (the camera swings late into corners, so the car
   is seen turning) plus a little of the steering, so the photographed steered front wheels show while you turn. */
const GP_VIEW_ANG={player:[0.085,0.24],rival:[0.17,0.45]};   // angle where the slight and the hard view are centred
function gpPicUpdate(kt,dt,camPos,inp){
  const pc=kt.pic,V=R3.tmpV;kt.g.getWorldDirection(V);const carYaw=Math.atan2(V.x,V.z);
  const losYaw=Math.atan2(kt.g.position.x-camPos.x,kt.g.position.z-camPos.z);
  let rel=gpWrapAng(carYaw-losYaw);                 // + = nose turned to the viewer's left
  if(kt.player)rel=rel-(kt.steerIn||0)*0.07*Math.min(1,Math.abs(kt.speed)/4);   // steering shows the turned front wheels; parked = straight
  if(kt.player&&R3.dbgRel!=null)rel=R3.dbgRel;   // test hook: pin the player view angle for screenshots
  const base=gpWrapAng(losYaw+Math.PI-carYaw);
  pc.rel+=(rel-pc.rel)*Math.min(1,dt*8);
  const a=pc.rel,m=Math.abs(a),sg=a<0?-1:1,cur=Math.abs(pc.bin);let lvl=cur;
  if(pc.angles>=5){const H=kt.player?[0.045,0.165]:[0.1,0.3],hys=kt.player?0.025:0.04;if(cur<2&&m>H[cur])lvl=cur+1;if(cur>0&&m<H[cur-1]-hys)lvl=cur-1;}
  else{if(cur<1&&m>0.26)lvl=1;if(cur>0&&m<0.14)lvl=0;}
  if(lvl>0&&cur>0&&sg!==Math.sign(pc.bin))lvl=0;    // changing direction passes through the straight view
  pc.bin=lvl*sg;
  if(pc.flameT>0)pc.flameT-=dt;
  const half=(pc.angles-1)>>1,f=(half+pc.bin)+(pc.flameT>0&&pc.flames?pc.angles:0);   // bin + = nose to the viewer's left = later frames
  if(f!==pc.frame){pc.prevFrame=pc.fade<0.5?pc.prevFrame:pc.frame;pc.frame=f;pc.fade=0;const pf=gpPicPacked(pc.D,f,pc.angles);gpPicAnchor(pc,f);pc.tyres=pc.D.tyres?pc.D.tyres[pf%pc.angles]:null;if(pc.wheelPatch)gpWheelPatchView(pc.wheelPatch,pc.D,pf%pc.angles);gpGlowPlace(pc,f);}
  if(pc.fade<1){pc.fade=Math.min(1,pc.fade+dt/0.17);const e=pc.fade*pc.fade*(3-2*pc.fade);gpPicSetFrames(pc,pc.prevFrame,pc.frame,e);if(pc.fade>=1)gpPicSetFrames(pc,pc.frame,pc.frame,0);}
  // between photographed views the plane itself turns a little (residual angle), so the turn keeps moving instead of stepping
  const VA=kt.player?GP_VIEW_ANG.player:GP_VIEW_ANG.rival,va=lvl===0?0:sg*VA[lvl-1];
  pc.pl.rotation.y=base+Math.max(-0.12,Math.min(0.12,(a-va)*0.55));
  // body: springs (a touch of overshoot) for lean and tail lift; tyres stay on the road
  const U=pc.mat.uniforms,leanT=kt.leanT||0,liftT=kt.liftT||0;
  pc.leanV+=((leanT-pc.lean)*70-pc.leanV*11)*dt;pc.lean+=pc.leanV*dt;pc.liftV+=((liftT-pc.lift)*90-pc.liftV*12)*dt;pc.lift+=pc.liftV*dt;
  U.uLean.value=pc.lean;U.uLift.value=pc.lift+(kt.chatter||0);
  // paint sheen: slides across the body as the car turns relative to the camera and as it travels
  U.uGlint.value=0.5-a*1.6+Math.sin((kt.travel||0)*0.035)*0.18;U.uGlintA.value=kt.player?0.16:0.1;
  // brake lights
  pc.glow+=((kt.brakeOn?1:0)-pc.glow)*Math.min(1,dt*(kt.brakeOn?16:7));
  if(pc.glows)pc.glows.forEach(g=>{const v=g.userData.on&&pc.glow>0.02;if(g.visible!==v)g.visible=v;if(v)g.material.opacity=pc.glow*0.95;});
  gpContactUpdate(kt,camPos);gpWheelPatchUpdate(kt);
  if(pc.flame){const v=pc.flameT>0;if(pc.flame.visible!==v)pc.flame.visible=v;if(v)pc.flame.scale.set(0.8+Math.random()*0.4,0.75+Math.random()*0.5,1);}
}
function gpFlame(kt,sec){if(kt&&kt.pic)kt.pic.flameT=Math.max(kt.pic.flameT,sec);}
/* cinematic intro: plays once per session before the first race (or on demand from the routes
   screen) with a big SKIP button; muted when the app's sound is off. */
function gpIntro(force){
  if(window._gpIntroDone&&!force)return Promise.resolve();window._gpIntroDone=true;
  return gpVideo(GP_INTRO,"GRAND FABLE HORIZON · JAPAN",16000);
}
/* full-screen video overlay with a big SKIP button (tap anywhere skips too); muted when the app's sound is off; a video that
   never starts, errors or runs past maxMs ends the overlay so the game can never get stuck behind it */
function gpVideo(src,tag,maxMs){
  return new Promise(res=>{
    if(P&&typeof P.gpMute==="boolean")GPA.muted=P.gpMute;
    gpCss();const ov=document.createElement("div");ov.className="fz-intro";
    ov.innerHTML='<video playsinline webkit-playsinline preload="auto" disablepictureinpicture></video><div class="fz-tag">'+esc(tag||"")+'</div><button class="fz-skip" aria-label="Skip video">SKIP ▶</button>';
    document.body.appendChild(ov);const v=ov.querySelector("video");v.muted=!!GPA.muted||!(typeof DB!=="undefined"&&DB&&DB.sound);v.volume=0.9;v.src=src;
    let over=false;const done=()=>{if(over)return;over=true;clearTimeout(to);try{v.pause();}catch(e){}ov.classList.add("out");setTimeout(()=>{try{v.removeAttribute("src");v.load();}catch(e){}ov.remove();},320);res();};
    v.addEventListener("ended",done);v.addEventListener("error",done);v.addEventListener("stalled",()=>{if(v.currentTime<0.2)setTimeout(()=>{if(!over&&v.currentTime<0.2)done();},4000);});
    ov.querySelector(".fz-skip").addEventListener("click",ev=>{ev.preventDefault();ev.stopPropagation();sfx("tick");done();});
    ov.addEventListener("click",()=>{done();});
    const to=setTimeout(done,maxMs||16000);
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
function gpBillboards(T,scene,atlas,BB,fogCol,near,far,tint,blobTex,ATL){
  if(!BB.length)return;const A=ATL||GP_WORLD.props,cells=A.cells,AW=A.w,AH=A.h,n=BB.length;
  const base=new T.PlaneGeometry(1,1);base.translate(0,0.5,0);const g=new T.InstancedBufferGeometry();g.index=base.index;g.attributes.position=base.attributes.position;g.attributes.uv=base.attributes.uv;
  const pos=new Float32Array(n*3),size=new Float32Array(n*2),uv=new Float32Array(n*4),lum=new Float32Array(n);
  const dummy=new T.Object3D(),blobs=new T.InstancedMesh(new T.PlaneGeometry(1,1).rotateX(-Math.PI/2),new T.MeshBasicMaterial({map:blobTex,color:0x000000,transparent:true,opacity:0.4,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}),n);blobs.material.userData.lin=1;
  BB.forEach((b,i)=>{const c=cells[b[0]]||cells[Object.keys(cells)[0]];const h=c.m*b[4],w=h*c.w/c.h;pos[i*3]=b[1];pos[i*3+1]=b[2]-0.05;pos[i*3+2]=b[3];size[i*2]=b[5]?-w:w;size[i*2+1]=h;
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
/* Tyre smoke: a points cloud with its own shader so every puff grows and fades on its own (and rises by its own radius as it grows, so big
   puffs never cut a hard edge into the road); at most `cap` puffs live,
   each capped to a fraction of the screen height, and the whole cloud dims whenever it would paint more than ~8% of
   the screen (the old PointsMaterial smoke could white the whole view out in a long drift). */
function gpSmoke(T,scene,n,tex,fog){
  const g=new T.BufferGeometry();const pos=new Float32Array(n*3),life=new Float32Array(n),size=new Float32Array(n);for(let i=0;i<n;i++)pos[i*3+1]=-999;
  g.setAttribute("position",new T.BufferAttribute(pos,3));g.setAttribute("aLife",new T.BufferAttribute(life,1));g.setAttribute("aSize",new T.BufferAttribute(size,1));
  const mat=new T.ShaderMaterial({uniforms:{map:{value:tex},opacity:{value:0.16},scale:{value:300},maxPx:{value:72},tint:{value:new T.Color(0.9,0.9,0.92)},shade:{value:new T.Color(0.62,0.64,0.7)},fogColor:{value:fog?fog.color.clone():new T.Color(1,1,1)},fogNear:{value:fog?fog.near:1},fogFar:{value:fog?fog.far:1000}},transparent:true,depthWrite:false,depthTest:true,
    vertexShader:"attribute float aLife;attribute float aSize;uniform float scale;uniform float maxPx;varying float vA;varying float vFog;varying vec2 vFlip;void main(){float age=1.0-aLife;vec4 mv=modelViewMatrix*vec4(position+vec3(0.0,aSize*(0.45+2.1*age)*0.38,0.0),1.0);float px=aSize*(0.45+2.1*age)*scale/max(1.0,-mv.z);gl_PointSize=min(px,maxPx);vA=smoothstep(0.0,0.22,age)*pow(aLife,1.4);vFog=-mv.z;vFlip=vec2(step(0.5,fract(aSize*37.0)),step(0.5,fract(aSize*91.0)));gl_Position=projectionMatrix*mv;}",
    fragmentShader:"uniform sampler2D map;uniform float opacity;uniform vec3 tint;uniform vec3 shade;uniform vec3 fogColor;uniform float fogNear;uniform float fogFar;varying float vA;varying float vFog;varying vec2 vFlip;void main(){vec2 uv=abs(vFlip-gl_PointCoord);vec4 c=texture2D(map,uv);vec3 lit=mix(shade,tint,smoothstep(0.95,0.15,gl_PointCoord.y));float f=smoothstep(fogNear,fogFar,vFog);gl_FragColor=vec4(mix(lit*c.rgb,fogColor,f),c.a*vA*opacity);}"});
  const pts=new T.Points(g,mat);pts.frustumCulled=false;scene.add(pts);
  return{pts,g,pos,life,size,n,max:new Float32Array(n),vel:new Float32Array(n*3),next:0,liveN:0,cap:Math.min(n,84),base:0.3,lim:0.08,mat,dirty:0,
    emit(x,y,z,vx,vy,vz,sz,lf){if(this.liveN>=this.cap)return;const i=this.next;this.next=(i+1)%this.n;if(this.life[i]>0)return;const k=i*3;this.pos[k]=x;this.pos[k+1]=y;this.pos[k+2]=z;this.vel[k]=vx;this.vel[k+1]=vy;this.vel[k+2]=vz;this.size[i]=sz;this.life[i]=1;this.max[i]=lf;this.liveN++;this.dirty=1;},
    update(dt,camPos,W,H){if(!this.liveN&&!this.dirty)return;let live=0,cov=0;const sc=this.mat.uniforms.scale.value,mx=this.mat.uniforms.maxPx.value;
      for(let i=0;i<this.n;i++){if(this.life[i]<=0)continue;this.life[i]-=dt/this.max[i];const k=i*3;if(this.life[i]<=0){this.life[i]=0;this.pos[k+1]=-999;continue;}live++;
        this.vel[k+1]+=0.9*dt;const dr=Math.max(0,1-dt*1.5);this.vel[k]*=dr;this.vel[k+2]*=dr;this.pos[k]+=this.vel[k]*dt;this.pos[k+1]+=this.vel[k+1]*dt;this.pos[k+2]+=this.vel[k+2]*dt;
        const dx=this.pos[k]-camPos.x,dy=this.pos[k+1]-camPos.y,dz=this.pos[k+2]-camPos.z;const d=Math.max(1,Math.sqrt(dx*dx+dy*dy+dz*dz));const px=Math.min(mx,this.size[i]*(0.45+2.1*(1-this.life[i]))*sc/d);cov+=px*px*0.55*Math.pow(this.life[i],1.4);}
      this.liveN=live;const frac=cov/Math.max(1,W*H);const lim=this.lim||0.08;this.mat.uniforms.opacity.value=frac>lim?this.base*lim/frac:this.base;
      this.g.attributes.position.needsUpdate=true;this.g.attributes.aLife.needsUpdate=true;this.g.attributes.aSize.needsUpdate=true;this.dirty=live?1:0;}};
}
/* ======================= STREET + THEMED COURSES (City Circuit, Accra, Coast Road) =======================
   Built from code (no photos, no logos): instanced low-poly buildings whose facade textures repeat per bay and floor
   (the UV is scaled from each instance's size in the vertex shader), shop fronts, street lights, zebra crossings with
   traffic lights, a tunnel, bridges, palms, landmarks, and TRAFFIC (Blender-built cars, a few InstancedMeshes per type).
   Accra is Accra-INSPIRED from public knowledge (Black Star Gate / Black Star Square, Independence Arch, the Memorial
   Park, Osu Oxford Street shops, the Labadi beach road, trotros and orange-panel taxis, kente, Ghana flag colours);
   no Street View imagery (Google's terms forbid it as game graphics) and no real business names. */
const GP_TRAFFIC_SRC="assets/cars3d/traffic.glb?v=1";
const GP_TRAFFIC_DIM={sedan:{w:1.8,len:4.6,mass:0.75},hatch:{w:1.75,len:4.0,mass:0.7},taxi:{w:1.8,len:4.6,mass:0.75},ghtaxi:{w:1.8,len:4.6,mass:0.75},van:{w:1.95,len:5.0,mass:0.9},trotro:{w:2.0,len:5.6,mass:0.95},bus:{w:2.5,len:10.5,mass:1.3}};
const GP_TRAFFIC_PAINT={sedan:["#2f5fb8","#c9ccd2","#1d1f24","#8a1c22","#e8e8e8","#4f6d3a","#b9a58a"],hatch:["#c23b2b","#f2f2f2","#2a7fd6","#f2a91c","#3b3d42"],taxi:["#f2c21b"],
  ghtaxi:["#2e6b3a","#2a4f9e","#b8b8b8","#7b1e2a","#f2f2f2"],van:["#f2f2f2","#d7dbe0","#2a4f9e"],trotro:["#f4f4f4","#f7d23e","#3a8fd6","#2e9e57","#e8e2d0"],bus:["#1f6fd1","#d83a2a","#f2b705"]};
function gpLoadTraffic(){if(!window.THREE)return Promise.resolve(null);if(window._gpTraffic)return Promise.resolve(window._gpTraffic);
  return gpGltfLoader().then(ok=>ok?new Promise(res=>new THREE.GLTFLoader().load(GP_TRAFFIC_SRC,g=>{window._gpTraffic=g.scene;res(g.scene);},undefined,()=>res(null))):null);}
/* merge meshes into one non-indexed geometry (positions + normals, optional flat vertex colour per source) */
function gpMerge(T,parts){let n=0;parts.forEach(p=>{n+=p.g.index?p.g.index.count:p.g.attributes.position.count;});const pos=new Float32Array(n*3),nor=new Float32Array(n*3),col=new Float32Array(n*3);let o=0;
  parts.forEach(p=>{const g=p.g.index?p.g.toNonIndexed():p.g,P=g.attributes.position,N=g.attributes.normal,c=p.c||{r:1,g:1,b:1};for(let i=0;i<P.count;i++){pos[o*3]=P.getX(i);pos[o*3+1]=P.getY(i);pos[o*3+2]=P.getZ(i);if(N){nor[o*3]=N.getX(i);nor[o*3+1]=N.getY(i);nor[o*3+2]=N.getZ(i);}col[o*3]=c.r;col[o*3+1]=c.g;col[o*3+2]=c.b;o++;}});
  const G=new T.BufferGeometry();G.setAttribute("position",new T.BufferAttribute(pos,3));G.setAttribute("normal",new T.BufferAttribute(nor,3));G.setAttribute("color",new T.BufferAttribute(col,3));return G;}
/* a facade material: the texture is ONE bay x ONE floor; every instanced box repeats it by its own size (roof = the slab colour) */
function gpFacadeMat(T,tex,bay,floor,extra){const m=new T.MeshLambertMaterial(Object.assign({map:tex},extra||{}));tex.wrapS=tex.wrapT=T.RepeatWrapping;
  m.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace("#include <common>","#include <common>\nattribute float aOff;").replace("#include <uv_vertex>",
    "#include <uv_vertex>\n#ifdef USE_INSTANCING\nvec3 gsc=vec3(length(instanceMatrix[0].xyz),length(instanceMatrix[1].xyz),length(instanceMatrix[2].xyz));\nif(abs(normal.y)>0.5)vUv=vec2(0.03,0.03);else{float hz=abs(normal.x)>0.5?gsc.z:gsc.x;vUv=vec2(uv.x*max(1.0,floor(hz/"+bay.toFixed(2)+"+0.5))+aOff,uv.y*max(1.0,floor(gsc.y/"+floor.toFixed(2)+"+0.5)));}\n#endif");};
  m.customProgramCacheKey=()=>"gpfac"+bay+"x"+floor;return m;}
function gpFacadeTex(kind){return gpCanvasTex(128,128,(x,w,h)=>{const R=(a,b,c,d,f)=>{x.fillStyle=f;x.fillRect(a,b,c,d);};
  const slab=c=>R(0,h-10,w,10,c);   // bottom band = floor slab; its colour is also the roof
  if(kind==="glass"){R(0,0,w,h,"#5e7f9e");const g=x.createLinearGradient(0,0,w,h);g.addColorStop(0,"rgba(190,220,240,.55)");g.addColorStop(0.5,"rgba(60,90,120,.1)");g.addColorStop(1,"rgba(170,205,230,.45)");R(0,0,w,h,g);R(0,0,4,h,"#2c3a48");R(w-4,0,4,h,"#2c3a48");R(0,h/2-2,w,4,"#2c3a48");slab("#7c8792");}
  else if(kind==="brick"){R(0,0,w,h,"#9a4e36");x.fillStyle="rgba(0,0,0,.12)";for(let r=0;r<h;r+=8)for(let c=(r/8)%2?0:8;c<w;c+=16)x.fillRect(c,r,15,1);R(30,22,68,70,"#e9e2d3");R(36,28,56,58,"#2a3442");R(62,28,4,58,"#e9e2d3");R(36,55,56,3,"#e9e2d3");R(26,92,76,6,"#d8cfbd");slab("#8a8378");}
  else if(kind==="office"){R(0,0,w,h,"#c9c6be");R(0,26,w,56,"#33465a");x.fillStyle="rgba(255,255,255,.18)";x.fillRect(0,26,w,10);R(0,26,w,3,"#9aa3ad");R(62,26,3,56,"#9aa3ad");slab("#a19d95");}
  else if(kind==="stone"){R(0,0,w,h,"#e6dcc4");R(32,24,64,72,"#cfc4aa");R(38,30,52,62,"#2d3846");R(62,30,4,62,"#e6dcc4");R(30,18,68,8,"#d6cbb0");R(28,96,72,6,"#cfc4aa");slab("#b9ae94");}
  else if(kind==="dark"){R(0,0,w,h,"#2e3138");R(10,14,22,88,"#6f8db0");R(53,14,22,88,"#6f8db0");R(96,14,22,88,"#6f8db0");x.fillStyle="rgba(255,255,255,.15)";[10,53,96].forEach(c=>x.fillRect(c,14,8,88));slab("#3c3f46");}
  // Accra: painted plaster (white base so the instance tint gives yellow / peach / mint / blue / pink walls), louvres, burglar bars, balconies
  else if(kind==="plaster"){R(0,0,w,h,"#f4efe4");R(30,26,68,62,"#6b4a2e");x.fillStyle="#8a6644";for(let r=30;r<86;r+=6)x.fillRect(33,r,62,3);R(62,26,4,62,"#f4efe4");R(26,88,76,6,"#e2dccf");slab("#d9d2c4");}
  else if(kind==="bars"){R(0,0,w,h,"#f2f0ea");R(28,24,72,64,"#2d3a44");x.fillStyle="#d8d4cc";for(let c=34;c<100;c+=9)x.fillRect(c,24,3,64);x.fillRect(28,54,72,3);R(24,88,80,5,"#d8d4cc");slab("#cfc9bd");}
  else if(kind==="balcony"){R(0,0,w,h,"#f6f2ea");R(18,14,92,70,"#3a4652");R(10,78,108,6,"#e6e0d4");x.fillStyle="#e6e0d4";for(let c=12;c<118;c+=8)x.fillRect(c,62,3,18);R(10,60,108,3,"#e6e0d4");slab("#d4cdbf");}
  else if(kind==="block"){R(0,0,w,h,"#efe9dc");R(16,30,40,46,"#2f3a44");R(72,30,40,46,"#2f3a44");R(16,30,40,4,"#cfc6b4");R(72,30,40,4,"#cfc6b4");x.fillStyle="rgba(120,90,60,.12)";x.fillRect(0,96,w,22);slab("#c9c0ae");}});}
/* shop-front band: three shops per tile (glass, door, a sign with a plain word), 18 m x 4.2 m; no business names */
function gpShopTex(words,cols,accra){return gpCanvasTex(768,180,(x,w,h)=>{const sw=w/3;for(let k=0;k<3;k++){const ox=k*sw,c=cols[k%cols.length];
    x.fillStyle=accra?["#f6e7c8","#e8f1f2","#f3dede"][k]:"#e9e6df";x.fillRect(ox,0,sw,h);x.fillStyle=c;x.fillRect(ox+6,10,sw-12,46);
    x.fillStyle="#fff";x.font="900 30px system-ui";x.textAlign="center";x.textBaseline="middle";let fs=30;while(x.measureText(words[k]).width>sw-26&&fs>14){fs-=2;x.font="900 "+fs+"px system-ui";}x.fillText(words[k],ox+sw/2,34);
    x.fillStyle="#26323d";x.fillRect(ox+14,66,sw-90,h-76);x.fillStyle="rgba(255,255,255,.22)";x.fillRect(ox+14,66,(sw-90)*0.35,h-76);
    x.fillStyle=accra?"#7a4b2a":"#3a2c22";x.fillRect(ox+sw-68,70,46,h-70);x.fillStyle="rgba(255,220,150,.35)";x.fillRect(ox+18,h-40,sw-100,22);
    if(accra){x.fillStyle=c;for(let i=0;i<6;i++)x.fillRect(ox+20+i*28,76,14,30);}   // goods on display
    x.fillStyle="rgba(0,0,0,.25)";x.fillRect(ox,0,3,h);}x.fillStyle="#8b8478";x.fillRect(0,h-6,w,6);});}
function gpKenteTex(){return gpCanvasTex(64,192,(x,w,h)=>{const C=["#f2b705","#0b7a3e","#c8102e","#111111"];x.fillStyle="#f2b705";x.fillRect(0,0,w,h);
  for(let r=0;r<h;r+=24){const a=C[(r/24)%4],b=C[((r/24)+2)%4];x.fillStyle=a;x.fillRect(0,r,w,12);x.fillStyle=b;for(let c=0;c<w;c+=16)x.fillRect(c,r+12,8,12);x.fillStyle="#111";x.fillRect(0,r+11,w,2);}
  x.fillStyle="#0b7a3e";x.fillRect(0,0,6,h);x.fillRect(w-6,0,6,h);});}
function gpGhanaFlagTex(){return gpCanvasTex(192,128,(x,w,h)=>{x.fillStyle="#ce1126";x.fillRect(0,0,w,h/3);x.fillStyle="#fcd116";x.fillRect(0,h/3,w,h/3);x.fillStyle="#006b3f";x.fillRect(0,2*h/3,w,h/3);
  x.fillStyle="#000";x.beginPath();for(let i=0;i<10;i++){const r=i%2?9:22,a=-Math.PI/2+i*Math.PI/5;x.lineTo(w/2+Math.cos(a)*r,h/2+Math.sin(a)*r);}x.closePath();x.fill();});}
/* five-pointed star prism (black star on the gate / mausoleum) */
function gpStarGeo(T,R,depth){const s=new T.Shape();for(let i=0;i<10;i++){const r=i%2?R*0.4:R,a=Math.PI/2+i*Math.PI/5;i?s.lineTo(Math.cos(a)*r,Math.sin(a)*r):s.moveTo(Math.cos(a)*r,Math.sin(a)*r);}s.closePath();const g=new T.ExtrudeGeometry(s,{depth,bevelEnabled:false});g.translate(0,0,-depth/2);return g;}
/* palm: curved trunk (stacked tapered rings) + a crown of drooping fronds, both as one geometry each (instanced) */
function gpPalmGeos(T){const segs=7,trunk=[];for(let i=0;i<segs;i++){const y0=i*1.15,c=new T.CylinderGeometry(0.17-i*0.012,0.21-i*0.012,1.2,7,1,true);const bend=0.035*i*i;c.translate(bend,y0+0.6,0);trunk.push({g:c});}
  const tg=gpMerge(T,trunk);const top=[0.035*(segs-1)*(segs-1),segs*1.15];
  const fr=[];for(let k=0;k<9;k++){const a=k/9*Math.PI*2+0.3,L=3.4+(k%3)*0.5;const g=new T.BufferGeometry();const v=[],n=12;for(let i=0;i<n;i++){const t0=i/n,t1=(i+1)/n,y=t=>0.5*t-1.7*t*t,wd=t=>0.55*Math.sin(Math.PI*Math.min(1,t*1.15));
      const P=(t,s)=>{const r=t*L,yy=y(t),ww=wd(t)*s;return[top[0]+Math.cos(a)*r-Math.sin(a)*ww,top[1]+yy,Math.sin(a)*r+Math.cos(a)*ww];};const A=P(t0,-1),B=P(t0,1),C2=P(t1,1),D=P(t1,-1);v.push(...A,...B,...C2,...A,...C2,...D);}
    g.setAttribute("position",new T.Float32BufferAttribute(v,3));g.computeVertexNormals();fr.push({g});}
  return{trunk:tg,crown:gpMerge(T,fr),top};}
function gpThemeWorld(X){const {T,scene,C,samples,M,W,ds,nearest,groundAt,dummy,rnd,kap,ribbonR,wallR,wallS,inStands,poMat,shared}=X;const SEA=C.seaSide||0;const TH=C.theme,wrapI=i=>((i%M)+M)%M,out={update:null,traffic:null,zoneAt:null,splash:[],dirt:[]};
  const fr=(a,b)=>[Math.round(a*M),Math.round(b*M)];const Z=C.zones||{};const inZ=(i,name)=>(Z[name]||[]).some(([a,b])=>{const ia=Math.round(a*M),ib=Math.round(b*M);i=wrapI(i);return ia<=ib?(i>=ia&&i<=ib):(i>=ia||i<=ib);});
  out.zoneAt=inZ;
  const yawAt=i=>{const s=samples[wrapI(i)];return Math.atan2(s.tan.x,s.tan.z);};
  const sidePt=(i,off)=>{const s=samples[wrapI(i)];return s.pos.clone().addScaledVector(s.nor,off);};
  const clearOf=(x,z,r)=>nearest(x,z)[1]>=r;
  const IM=(geo,mat,list,fn,opt)=>{if(!list.length)return null;const m=new T.InstancedMesh(geo,mat,list.length);list.forEach((it,k)=>{fn(it,k,m);});if(m.instanceColor)m.instanceColor.needsUpdate=true;m.castShadow=!!(opt&&opt.shadow);m.receiveShadow=!(opt&&opt.noRecv);scene.add(m);return m;};
  const put=(x,y,z,yaw,sx,sy,sz)=>{dummy.position.set(x,y,z);dummy.rotation.set(0,yaw||0,0);dummy.scale.set(sx||1,sy||1,sz||1);dummy.updateMatrix();return dummy.matrix;};
  const lin=h=>gpLin(h);
  const street=TH==="city"||TH==="accra";
  // ---------- sidewalks + kerbs (street courses), dirt / water / highway surfaces (coast) ----------
  if(street){const pave=gpCanvasTex(128,128,(x,w,h)=>{x.fillStyle=TH==="accra"?"#c9b89a":"#b9b6ae";x.fillRect(0,0,w,h);x.strokeStyle="rgba(0,0,0,.14)";x.lineWidth=2;for(let k=0;k<=w;k+=32){x.beginPath();x.moveTo(k,0);x.lineTo(k,h);x.stroke();x.beginPath();x.moveTo(0,k);x.lineTo(w,k);x.stroke();}for(let i=0;i<500;i++){x.fillStyle="rgba(0,0,0,.05)";x.fillRect(rnd()*w,rnd()*h,2,2);}},true);
    const pm=new T.MeshLambertMaterial({map:pave}),curbM=new T.MeshLambertMaterial({color:TH==="accra"?0xe9e2d0:0xd7d4cc,side:T.DoubleSide});
    [-1,1].forEach(sd=>{ribbonR(0,M,sd*(W+2.7),sd*(W+7.2),pm,0.16,0.16,0.25);wallR(0,M,W+2.7,sd,0,0.17,curbM,0.5);});}
  if(TH==="coast"){(Z.dirt||[]).forEach(([a,b])=>{const dirtT=gpCanvasTex(128,128,(x,w,h)=>{x.fillStyle="#9b7b55";x.fillRect(0,0,w,h);for(let i=0;i<1600;i++){const v=110+rnd()*70|0;x.fillStyle="rgba("+v+","+(v-25|0)+","+(v-55|0)+",.55)";x.fillRect(rnd()*w,rnd()*h,2+rnd()*2,2);}x.fillStyle="rgba(60,40,25,.25)";x.fillRect(w*0.28,0,10,h);x.fillRect(w*0.68,0,10,h);},true);
      const ia=Math.round(a*M),ib=Math.round(b*M);ribbonR(ia,ib<ia?ib+M:ib,-W-2.6,W+2.6,poMat(new T.MeshLambertMaterial({map:dirtT})),0.045,0.045,0.08);});
    // the ford: shallow water across the road + the stream running off both sides; cars splash through it
    (Z.ford||[]).forEach(([a,b])=>{const ia=Math.round(a*M),ib=Math.round(b*M);const wt=gpCanvasTex(128,128,(x,w,h)=>{x.fillStyle="#5d8fa8";x.fillRect(0,0,w,h);x.strokeStyle="rgba(255,255,255,.45)";x.lineWidth=2;for(let i=0;i<18;i++){const px=rnd()*w,py=rnd()*h;x.beginPath();x.moveTo(px,py);x.quadraticCurveTo(px+8,py-3,px+18,py);x.stroke();}},true);
      const wm=new T.MeshStandardMaterial({map:wt,roughness:0.08,metalness:0.4,transparent:true,opacity:0.86,depthWrite:false});out.fordTex=wt;
      ribbonR(ia,ib,-W-60,W+60,poMat(wm),0.09,0.09,0.06);out.splash.push([ia,ib]);});
    // highway: lane lines (4 lanes) and concrete safety barriers instead of the steel rail
    (Z.highway||[]).forEach(([a,b])=>{const ia=Math.round(a*M),ib=Math.round(b*M);const lt=gpCanvasTex(64,256,(x,w,h)=>{x.clearRect(0,0,w,h);x.fillStyle="rgba(245,245,240,.92)";x.fillRect(w/2-4,0,8,h*0.45);},true);
      const lm=poMat(new T.MeshBasicMaterial({map:lt,transparent:true,depthWrite:false}));lm.userData.lin=1;[-W/2,0,W/2].forEach(o=>ribbonR(ia,ib,o-0.12,o+0.12,lm,0.05,0.05,1/14));
      const jb=new T.MeshLambertMaterial({color:0xd9d6cf,side:T.DoubleSide});[-1,1].forEach(sd=>{wallS(ia,ib,W+2.0,sd,0,0.95,jb,0.1);wallS(ia,ib,W+2.55,sd,0,0.95,jb,0.1);ribbonR(ia,ib,sd*(W+2.0),sd*(W+2.55),jb,0.95,0.95,0.1);});});}
  // ---------- bridges: deck sides, balustrade, piers, water below (ground is cut away in groundAt) ----------
  (Z.bridge||[]).forEach(([a,b])=>{const ia=Math.round(a*M),ib=Math.round(b*M);const deck=new T.MeshLambertMaterial({color:TH==="city"?0xb9b2a4:0xc9c6be,side:T.DoubleSide});
    [-1,1].forEach(sd=>{wallS(ia,ib,W+2.75,sd,-4.2,0.0,deck,0.1);ribbonR(ia,ib,sd*(W+2.6),sd*(W+3.3),deck,1.1,1.1,0.1);wallS(ia,ib,W+3.3,sd,0,1.1,deck,0.1);wallS(ia,ib,W+2.6,sd,0,1.1,deck,0.1);});
    ribbonR(ia,ib,-W-2.75,W+2.75,deck,-4.2,-4.2,0.1);
    const piers=[];for(let i=ia+6;i<ib-4;i+=Math.round(16/ds))piers.push(i);IM(new T.BoxGeometry(2.2,9,W*2+3),deck,piers,(i,k,m)=>{const s=samples[wrapI(i)];m.setMatrixAt(k,put(s.pos.x,s.pos.y-8.6,s.pos.z,yawAt(i)));},{shadow:true});
    const wt=gpCanvasTex(128,128,(x,w,h)=>{x.fillStyle="#3f7896";x.fillRect(0,0,w,h);x.strokeStyle="rgba(255,255,255,.3)";for(let i=0;i<26;i++){const px=rnd()*w,py=rnd()*h;x.beginPath();x.moveTo(px,py);x.quadraticCurveTo(px+9,py-3,px+20,py);x.stroke();}},true);
    out.waterTex2=wt;ribbonR(ia-14,ib+14,-90,90,new T.MeshStandardMaterial({map:wt,roughness:0.1,metalness:0.45}),-3.6,-3.6,0.05);});
  // ---------- tunnel: walls, roof slab with lamp strips, portals, a little park on top ----------
  (Z.tunnel||[]).forEach(([a,b])=>{const ia=Math.round(a*M),ib=Math.round(b*M);const cm=new T.MeshLambertMaterial({color:0xa8a49a}),tm=new T.MeshLambertMaterial({color:0x6e6b66,side:T.DoubleSide});
    [-1,1].forEach(sd=>{wallS(ia,ib,W+2.3,sd,0,6.6,tm,0.2);});const roof=ribbonR(ia,ib,-W-3.4,W+3.4,cm,6.6,6.6,0.1);roof.castShadow=true;const under=ribbonR(ia,ib,W+3.4,-W-3.4,tm,6.55,6.55,0.1);
    const top=ribbonR(ia,ib,-W-8,W+8,new T.MeshLambertMaterial({color:0x6f9a4c}),7.4,7.4,0.1);top.castShadow=true;
    [ia,ib].forEach(i=>{const s=samples[wrapI(i)];const p=new T.Mesh(new T.BoxGeometry(W*2+10,2.4,1.4),cm);p.position.set(s.pos.x,s.pos.y+7.6,s.pos.z);p.rotation.y=yawAt(i);p.castShadow=true;scene.add(p);
      [-1,1].forEach(sd=>{const q=new T.Mesh(new T.BoxGeometry(3,8.8,1.4),cm);const pp=sidePt(i,sd*(W+4.4));q.position.set(pp.x,s.pos.y+4.4,pp.z);q.rotation.y=yawAt(i);q.castShadow=true;scene.add(q);});});
    const lamps=[];for(let i=ia+2;i<ib;i+=Math.round(7/ds))[-1,1].forEach(sd=>lamps.push([i,sd]));const lmM=new T.MeshBasicMaterial({color:0xfff3d0});lmM.userData.lin=1;
    IM(new T.BoxGeometry(0.5,0.12,2.4),lmM,lamps,(it,k,m)=>{const s=samples[wrapI(it[0])],p=sidePt(it[0],it[1]*(W-1.5));m.setMatrixAt(k,put(p.x,s.pos.y+6.45,p.z,yawAt(it[0])));});
    const trees=[];for(let i=ia+4;i<ib-4;i+=Math.round(11/ds))[-1,1].forEach(sd=>{if(rnd()<0.6)trees.push([i,sd*(2+rnd()*W)]);});out.parkTop=(out.parkTop||[]).concat(trees.map(t=>{const p=sidePt(t[0],t[1]);return[p.x,samples[wrapI(t[0])].pos.y+7.4,p.z];}));});
  // ---------- buildings (city / accra) ----------
  const B=[];   // [x,y,z,w,h,d,yaw,style,tint,shop]
  const cityS=["glass","brick","office","stone","dark"],accraS=["plaster","bars","balcony","block"];const styles=TH==="city"?cityS:(TH==="accra"?accraS:[]);
  const tintsC=["#ffffff","#f2efe8","#e6ecf2","#f4e9dc","#e3e3e3"],tintsA=["#ffe9a8","#ffd3b0","#c9f0d8","#bfe0f7","#ffc8d6","#f7d58a","#ffffff","#e8d5ff"];
  const noBld=i=>inStands(i)||inZ(i,"tunnel")||inZ(i,"bridge")||inZ(i,"park")||inZ(i,"square");
  if(street){const front=W+7.6;[-1,1].forEach(sd=>{for(let row=0;row<(TH==="city"?2:1);row++){let i=0;while(i<M){const wB=TH==="city"?12+rnd()*12:9+rnd()*9,step=Math.max(2,Math.round((wB+(row?4:1.5))/ds));const mid=wrapI(i+Math.round(step/2));
        if(noBld(mid)||(sd===SEA&&inZ(mid,"beach"))||(row===0&&sd===(C.parkSide||0)&&inZ(mid,"park"))){i+=step;continue;}
        const dB=TH==="city"?12+rnd()*10:8+rnd()*6,off=front+row*26+dB/2+(row?rnd()*8:0),s=samples[mid],yaw=yawAt(mid);const p=s.pos.clone().addScaledVector(s.nor,sd*off);
        const tx=s.tan.x,tz=s.tan.z,nx=s.nor.x*sd,nz=s.nor.z*sd;let ok=true;for(const[a,b2]of[[-1,-1],[1,-1],[-1,1],[1,1]]){const cx2=p.x+tx*a*wB/2+nx*b2*dB/2,cz2=p.z+tz*a*wB/2+nz*b2*dB/2;if(!clearOf(cx2,cz2,W+7.2)){ok=false;break;}}
        if(ok&&B.some(o=>Math.abs(o[0]-p.x)<(o[3]+wB)*0.42&&Math.abs(o[2]-p.z)<(o[3]+wB)*0.42))ok=false;
        if(ok){const down=TH==="city"&&C.downtown?Math.max(0,1-Math.abs(((mid/M)-C.downtown[0]+1.5)%1-0.5)/C.downtown[1]):0;
          const hB=TH==="city"?(row?18+rnd()*40+down*50:9+rnd()*20+down*rnd()*40):(inZ(mid,"shops")?6.8+rnd()*7:4+rnd()*6);
          const st=styles[Math.floor(rnd()*styles.length)],tint=(TH==="city"?tintsC:tintsA)[Math.floor(rnd()*(TH==="city"?tintsC:tintsA).length)];
          B.push([p.x,groundAt(p.x,p.z)-0.4,p.z,wB,hB,dB,yaw,st,tint,row===0&&(TH==="city"||inZ(mid,"shops"))?1:0,sd]);}
        i+=step;}}});}
  if(B.length){const geo=new T.BoxGeometry(1,1,1);geo.translate(0,0.5,0);
    styles.forEach(st=>{const list=B.filter(b=>b[7]===st);if(!list.length)return;const g=geo.clone();g.setAttribute("aOff",new T.InstancedBufferAttribute(Float32Array.from(list,()=>Math.floor(rnd()*4)/4),1));
      IM(g,gpFacadeMat(T,gpFacadeTex(st),st==="glass"||st==="dark"?3.4:3.2,st==="office"?3.8:3.4),list,(b,k,m)=>{const sh=b[9]?4.4:0;m.setMatrixAt(k,put(b[0],b[1]+sh,b[2],b[6],b[3],b[4]-sh+(b[4]>16?0:0),b[5]));m.setColorAt(k,lin(b[8]));},{shadow:true});});
    // tall towers get a narrower crown on top
    const crowns=B.filter(b=>b[4]>34);IM(geo.clone(),new T.MeshLambertMaterial({color:0x8a96a3}),crowns,(b,k,m)=>{m.setMatrixAt(k,put(b[0],b[1]+b[4],b[2],b[6],b[3]*0.6,3+(k%3)*2,b[5]*0.6));},{shadow:true});
    // shop fronts: a band round the ground floor, 3 shops per 18 m tile, random tile offset per building
    const shops=B.filter(b=>b[9]);if(shops.length){const words=TH==="accra"?[["CHOP BAR","KELEWELE","FRESH JOLLOF"],["KENTE CLOTH","PHONE REPAIRS","BEAUTY SALON"],["AKWAABA STORES","FRESH COCONUT","OSU FASHION"],["WAAKYE","SPARE PARTS","PROVISIONS"]]:[["CAFE","BAKERY","BOOKS"],["PIZZA","TOYS","FLOWERS"],["SHOES","MUSIC","ICE CREAM"],["DINER","BIKES","FRUIT"]];
      const cols=TH==="accra"?["#c8102e","#0b7a3e","#e0a100","#1f5fbf","#8e3bd6"]:["#d1121c","#1d5fd1","#2e9e57","#f28a1c","#8e3bd6","#111"];
      words.forEach((wd,q)=>{const list=shops.filter((b,k)=>k%words.length===q);if(!list.length)return;const g=geo.clone();g.setAttribute("aOff",new T.InstancedBufferAttribute(Float32Array.from(list,()=>Math.floor(rnd()*3)/3),1));
        const cc=[cols[q%cols.length],cols[(q+2)%cols.length],cols[(q+3)%cols.length]];IM(g,gpFacadeMat(T,gpShopTex(wd,cc,TH==="accra"),18,4.4),list,(b,k,m)=>{m.setMatrixAt(k,put(b[0],b[1],b[2],b[6],b[3]+0.3,4.4+0.4,b[5]+0.3));},{shadow:false});});
      // awnings over the pavement on the road side
      const awT=gpCanvasTex(64,64,(x,w,h)=>{for(let i=0;i<8;i++){x.fillStyle=i%2?"#ffffff":"#e8e8e8";x.fillRect(i*8,0,8,h);}},true);
      IM(new T.BoxGeometry(1,0.12,1),new T.MeshLambertMaterial({map:awT}),shops,(b,k,m)=>{const nx=Math.cos(b[6]),nz=-Math.sin(b[6]);const o=-(b[10]||1)*(b[5]/2+1.1);dummy.position.set(b[0]+nx*o,b[1]+4.6,b[2]+nz*o);dummy.rotation.set(0,b[6],(b[10]||1)*0.32);dummy.scale.set(b[3]*0.86,1,2.4);dummy.updateMatrix();m.setMatrixAt(k,dummy.matrix);m.setColorAt(k,lin(cols[k%cols.length]));},{shadow:true});}
    // rooftop clutter: AC units, water tanks (Accra: black polytanks)
    const roofs=[];B.forEach(b=>{const n=1+Math.floor(rnd()*2);for(let q=0;q<n;q++)roofs.push([b[0]+(rnd()-0.5)*b[3]*0.5,b[1]+b[4],b[2]+(rnd()-0.5)*b[5]*0.5,b[6]]);});
    IM(TH==="accra"?new T.CylinderGeometry(0.7,0.7,1.5,8).translate(0,0.75,0):new T.BoxGeometry(1.6,1.1,1.2).translate(0,0.55,0),new T.MeshLambertMaterial({color:TH==="accra"?0x1e1f22:0x9ca3ab}),roofs,(r,k,m)=>{m.setMatrixAt(k,put(r[0],r[1],r[2],r[3]));},{shadow:false});}
  out.buildings=B.length;
  // distant skyline ring (city) / low town (accra): cheap boxes far out, fogged
  if(TH==="city"||TH==="accra"){const far=[];const n=TH==="city"?150:90;for(let k=0;k<n;k++){const a=rnd()*6.283,r=(TH==="city"?260:320)+rnd()*380;const x=X.cx+Math.cos(a)*r,z=X.cz+Math.sin(a)*r;if(nearest(x,z)[1]<W+70)continue;if(X.lakeF&&X.lakeF(x,z)>0.05)continue;far.push([x,groundAt(x,z),z,10+rnd()*20,TH==="city"?20+rnd()*90:6+rnd()*14,10+rnd()*20,rnd()]);}
    const g=new T.BoxGeometry(1,1,1);g.translate(0,0.5,0);g.setAttribute("aOff",new T.InstancedBufferAttribute(new Float32Array(far.length),1));
    IM(g,gpFacadeMat(T,gpFacadeTex(TH==="city"?"office":"block"),3.2,3.4),far,(b,k,m)=>{m.setMatrixAt(k,put(b[0],b[1]-1,b[2],b[6],b[3],b[4],b[5]));m.setColorAt(k,lin(TH==="city"?["#dfe6ee","#c9d3de","#e8e2d8"][k%3]:tintsA[k%tintsA.length]));},{noRecv:true});}
  // ---------- street lights (both sides), with kente banners (Accra) or festival banners (city) ----------
  const lamps=[];if(street||TH==="coast"){const every=Math.round((TH==="coast"?34:26)/ds);for(let i=4;i<M;i+=every){if(inStands(i)||inZ(i,"tunnel"))continue;if(TH==="coast"&&!inZ(i,"highway")&&!inZ(i,"bridge"))continue;[-1,1].forEach(sd=>{if(TH==="accra"&&sd===SEA&&inZ(i,"beach")&&(i/every)%2)return;lamps.push([i,sd]);});}}
  if(lamps.length){const poleG=new T.CylinderGeometry(0.09,0.13,8,6);poleG.translate(0,4,0);const armG=new T.BoxGeometry(0.1,0.1,2.4);armG.translate(0,0,-1.2);const headG=new T.BoxGeometry(0.42,0.16,0.9);
    const lp=lamps.map(([i,sd])=>{const s=samples[wrapI(i)],off=street?W+3.3:W+3.0,p=sidePt(i,sd*off);return[p.x,groundAt(p.x,p.z)+(street?0.16:0),p.z,i,sd,s];});
    const pm=new T.MeshLambertMaterial({color:TH==="accra"?0x5f6d62:0x60666f});IM(poleG,pm,lp,(l,k,m)=>{m.setMatrixAt(k,put(l[0],l[1],l[2],0));},{shadow:true});
    IM(armG,pm,lp,(l,k,m)=>{const s=l[5];dummy.position.set(l[0],l[1]+7.8,l[2]);dummy.rotation.set(0,0,0);dummy.scale.set(1,1,1);dummy.lookAt(l[0]-s.nor.x*l[4],l[1]+7.8,l[2]-s.nor.z*l[4]);dummy.rotateY(Math.PI);dummy.updateMatrix();m.setMatrixAt(k,dummy.matrix);});
    const hm=new T.MeshBasicMaterial({color:0xf3f1e6});hm.userData.lin=1;IM(headG,hm,lp,(l,k,m)=>{const s=l[5];m.setMatrixAt(k,put(l[0]-s.nor.x*l[4]*2.3,l[1]+7.7,l[2]-s.nor.z*l[4]*2.3,Math.atan2(s.nor.x,s.nor.z)));});
    if(street){const bt=TH==="accra"?gpKenteTex():gpCanvasTex(64,192,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,"#ff2d87");g.addColorStop(1,"#ff7a00");x.fillStyle=g;x.fillRect(0,0,w,h);x.fillStyle="rgba(255,255,255,.9)";x.font="900 22px system-ui";x.save();x.translate(w/2+8,h/2);x.rotate(-Math.PI/2);x.textAlign="center";x.fillText("GRAND PRIX",0,0);x.restore();});
      const bm=new T.MeshLambertMaterial({map:bt,side:T.DoubleSide});const bl=lp.filter((l,k)=>k%2===0);IM(new T.PlaneGeometry(0.9,2.7),bm,bl,(l,k,m)=>{const s=l[5];dummy.position.set(l[0]-s.nor.x*l[4]*0.5,l[1]+5.4,l[2]-s.nor.z*l[4]*0.5);dummy.rotation.set(0,Math.atan2(s.nor.x,s.nor.z),0);dummy.scale.set(1,1,1);dummy.updateMatrix();m.setMatrixAt(k,dummy.matrix);},{shadow:true});}}
  // ---------- zebra crossings + traffic lights (street courses) ----------
  if(street){const cr=[];for(let i=Math.round(60/ds);i<M-Math.round(40/ds);i+=Math.round(95/ds)){if(inStands(i)||inZ(i,"tunnel")||inZ(i,"bridge")||Math.abs(kap[wrapI(i)])>1/120)continue;cr.push(i);}
    const zt=gpCanvasTex(256,32,(x,w,h)=>{x.clearRect(0,0,w,h);x.fillStyle="rgba(245,245,240,.95)";for(let k=0;k<w;k+=32)x.fillRect(k+6,0,18,h);},true);const zm=poMat(new T.MeshBasicMaterial({map:zt,transparent:true,depthWrite:false}));zm.userData.lin=1;
    cr.forEach(i=>ribbonR(i,i+Math.round(4/ds),-W+0.4,W-0.4,zm,0.05,0.05,0.25));   // u runs across the road, so the bars lie along the lane like a real zebra
    const tl=[];cr.forEach(i=>[-1,1].forEach(sd=>tl.push([i,sd])));const poleM=new T.MeshLambertMaterial({color:0x2a2c30});
    const tlp=tl.map(([i,sd])=>{const p=sidePt(i,sd*(W+3.1));return[p.x,groundAt(p.x,p.z)+0.16,p.z,yawAt(i)];});
    IM(new T.CylinderGeometry(0.08,0.08,3.6,6).translate(0,1.8,0),poleM,tlp,(l,k,m)=>{m.setMatrixAt(k,put(l[0],l[1],l[2],0));},{shadow:true});
    IM(new T.BoxGeometry(0.42,1.15,0.32).translate(0,4.05,0),poleM,tlp,(l,k,m)=>{m.setMatrixAt(k,put(l[0],l[1],l[2],l[3]));});
    const gm=new T.MeshBasicMaterial({color:0x3cff7a});gm.userData.lin=1;IM(new T.CircleGeometry(0.13,10),gm,tlp,(l,k,m)=>{dummy.position.set(l[0]-Math.sin(l[3])*0.17,l[1]+3.7,l[2]-Math.cos(l[3])*0.17);dummy.rotation.set(0,l[3]+Math.PI,0);dummy.scale.set(1,1,1);dummy.updateMatrix();m.setMatrixAt(k,dummy.matrix);});
    out.crossings=cr.length;}
  // ---------- vegetation: palms (accra / city avenues), broadleaf + conifers (coast forest) ----------
  const palms=[],broad=[],conif=[];
  const treeOK=(x,z,r)=>clearOf(x,z,r)&&!(X.lakeF&&X.lakeF(x,z)>0.03)&&!B.some(b=>Math.abs(b[0]-x)<b[3]*0.6+2&&Math.abs(b[2]-z)<b[5]*0.6+2);
  if(TH==="accra"){for(let i=0;i<M;i+=Math.round(11/ds)){if(inStands(i))continue;const beach=inZ(i,"beach"),park=inZ(i,"park")||inZ(i,"square");[-1,1].forEach(sd=>{if(!(beach||park)&&rnd()<0.75)return;const off=W+(beach&&sd===SEA?9+rnd()*14:8+rnd()*4);const p=sidePt(i,sd*off);if(treeOK(p.x,p.z,W+6.5))palms.push([p.x,groundAt(p.x,p.z),p.z,0.85+rnd()*0.45,rnd()*6.28]);});}}
  if(TH==="city"){for(let i=0;i<M;i+=Math.round(24/ds)){if(!inZ(i,"avenue"))continue;[-1,1].forEach(sd=>{const p=sidePt(i,sd*(W+5.4));palms.push([p.x,groundAt(p.x,p.z)+0.16,p.z,0.8+rnd()*0.2,rnd()*6.28]);});}}
  (out.parkTop||[]).forEach(p=>broad.push([p[0],p[1],p[2],0.6+rnd()*0.3,rnd()*6.28]));
  if(TH==="coast"){for(let i=0;i<M;i+=Math.round(5/ds)){const forest=inZ(i,"forest"),hw=inZ(i,"highway")||inZ(i,"bridge");for(let r=0;r<(forest?4:2);r++){if(!forest&&rnd()<0.55)continue;const sd=rnd()<0.5?-1:1;if(hw&&sd===SEA)continue;const off=W+(forest?5.5+r*6+rnd()*5:9+r*14+rnd()*12);const p=sidePt(i,sd*off);if(!treeOK(p.x,p.z,W+4.5))continue;
      (forest||rnd()<0.3?conif:broad).push([p.x,groundAt(p.x,p.z),p.z,0.85+rnd()*0.6,rnd()*6.28]);}}
    for(let k=0;k<380;k++){const a=rnd()*6.28,r=120+rnd()*520;const x=X.cx+Math.cos(a)*r,z=X.cz+Math.sin(a)*r;if(!treeOK(x,z,W+25))continue;(rnd()<0.5?conif:broad).push([x,groundAt(x,z),z,0.9+rnd()*0.8,rnd()*6.28]);}}
  if(TH==="accra"||TH==="city"){for(let k=0;k<(TH==="accra"?160:60);k++){const a=rnd()*6.28,r=90+rnd()*300;const x=X.cx+Math.cos(a)*r,z=X.cz+Math.sin(a)*r;if(!treeOK(x,z,W+30))continue;(TH==="accra"&&rnd()<0.7?palms:broad).push([x,groundAt(x,z),z,0.9+rnd()*0.5,rnd()*6.28]);}}
  if(palms.length){const PG=gpPalmGeos(T);IM(PG.trunk,new T.MeshLambertMaterial({color:0x8a7356}),palms,(p,k,m)=>{m.setMatrixAt(k,put(p[0],p[1]-0.1,p[2],p[4],p[3],p[3],p[3]));},{shadow:true});
    const cm=new T.MeshLambertMaterial({color:0xffffff,side:T.DoubleSide});IM(PG.crown,cm,palms,(p,k,m)=>{m.setMatrixAt(k,put(p[0],p[1]-0.1,p[2],p[4],p[3],p[3],p[3]));m.setColorAt(k,lin(["#3f7d2c","#4d8a33","#5a9433","#3a6f2a"][k%4]));},{shadow:true});}
  const trunkM=new T.MeshLambertMaterial({color:0x5a4030});
  if(broad.length){const tg=new T.CylinderGeometry(0.2,0.32,3,6).translate(0,1.5,0);IM(tg,trunkM,broad,(p,k,m)=>{m.setMatrixAt(k,put(p[0],p[1],p[2],p[4],p[3],p[3],p[3]));});
    const cg=gpMerge(T,[{g:new T.IcosahedronGeometry(2.5,1).translate(0,4.4,0)},{g:new T.IcosahedronGeometry(1.8,1).translate(1.2,5.4,0.5)},{g:new T.IcosahedronGeometry(1.7,1).translate(-1.1,5.2,-0.6)}]);
    IM(cg,new T.MeshLambertMaterial({color:0xffffff,flatShading:true}),broad,(p,k,m)=>{m.setMatrixAt(k,put(p[0],p[1],p[2],p[4],p[3],p[3],p[3]));m.setColorAt(k,lin(["#3f6b2e","#4d7a33","#5f8a3a","#6f8a3a"][k%4]));},{shadow:true});}
  if(conif.length){const cg=gpMerge(T,[{g:new T.CylinderGeometry(0.16,0.24,2.4,5).translate(0,1.2,0),c:lin("#5a4030")},{g:new T.ConeGeometry(2.2,4.2,7).translate(0,3.6,0),c:{r:1,g:1,b:1}},{g:new T.ConeGeometry(1.7,3.6,7).translate(0,5.8,0),c:{r:1,g:1,b:1}},{g:new T.ConeGeometry(1.1,2.8,7).translate(0,7.8,0),c:{r:1,g:1,b:1}}]);
    IM(cg,new T.MeshLambertMaterial({color:0xffffff,vertexColors:true,flatShading:true}),conif,(p,k,m)=>{m.setMatrixAt(k,put(p[0],p[1],p[2],p[4],p[3],p[3]*1.15,p[3]));m.setColorAt(k,lin(["#1f4a2a","#2a5a32","#24502d","#2f6234"][k%4]));},{shadow:true});}
  out.trees=palms.length+broad.length+conif.length;
  // ---------- coast extras: wooden fences on the country road, hay bales + tyre stacks round the dirt lot, rocks on the shore ----------
  if(TH==="coast"){const fence=[];for(let i=0;i<M;i+=Math.round(3/ds)){if(!inZ(i,"country"))continue;[-1,1].forEach(sd=>{const p=sidePt(i,sd*(W+4.2));fence.push([p.x,groundAt(p.x,p.z),p.z,yawAt(i)]);});}
    const wood=new T.MeshLambertMaterial({color:0x8a6a48});IM(new T.BoxGeometry(0.14,1.1,0.14).translate(0,0.55,0),wood,fence,(f,k,m)=>{m.setMatrixAt(k,put(f[0],f[1],f[2],f[3]));},{shadow:true});
    IM(new T.BoxGeometry(0.06,0.12,3.2).translate(0,0.85,0),wood,fence.filter((f,k)=>k%2===0),(f,k,m)=>{m.setMatrixAt(k,put(f[0],f[1],f[2],f[3]));});
    const hay=[];for(let i=0;i<M;i+=Math.round(7/ds)){if(!inZ(i,"dirt"))continue;[-1,1].forEach(sd=>{const p=sidePt(i,sd*(W+3.4));hay.push([p.x,groundAt(p.x,p.z),p.z,yawAt(i)]);});}
    IM(new T.CylinderGeometry(0.75,0.75,1.4,12).rotateZ(Math.PI/2).translate(0,0.75,0),new T.MeshLambertMaterial({color:0xd8b25a}),hay,(f,k,m)=>{m.setMatrixAt(k,put(f[0],f[1],f[2],f[3]+Math.PI/2));},{shadow:true});
    out.dirt=(Z.dirt||[]).map(([a,b])=>[Math.round(a*M),Math.round(b*M)]);}
  // ---------- Accra landmarks ----------
  if(TH==="accra"){const white=new T.MeshStandardMaterial({color:0xf3f0e8,roughness:0.75}),black=new T.MeshStandardMaterial({color:0x111111,roughness:0.5}),gold=new T.MeshStandardMaterial({color:0xd4a017,roughness:0.35,metalness:0.6});
    // Black Star Gate over the start straight: two great piers, the lintel with its inscription, the black star on top
    {const i=Math.round(55/ds),s=samples[wrapI(i)],g=new T.Group(),span=W+7;[-1,1].forEach(sd=>{const p=new T.Mesh(new T.BoxGeometry(5,17,6),white);p.position.set(sd*(span+2.5),8.5,0);p.castShadow=true;g.add(p);});
      const lt=new T.Mesh(new T.BoxGeometry(span*2+10,5,6.4),white);lt.position.y=19.5;lt.castShadow=true;g.add(lt);
      const ins=gpTextTex("AD 1957 · FREEDOM AND JUSTICE","#efebe2","#1a1a1a",1024,96,52);const im=new T.MeshBasicMaterial({map:ins});im.userData.lin=1;[1,-1].forEach(f=>{const pl=new T.Mesh(new T.PlaneGeometry(span*1.5,1.6),im);pl.position.set(0,19.6,f*3.22);pl.rotation.y=f>0?0:Math.PI;g.add(pl);});
      const star=new T.Mesh(gpStarGeo(T,3.6,1.2),black);star.position.set(0,26.2,0);star.castShadow=true;g.add(star);const ped=new T.Mesh(new T.BoxGeometry(5,2.2,3),white);ped.position.y=23;g.add(ped);
      g.position.copy(s.pos);g.rotation.y=yawAt(i);scene.add(g);out.gate=g;}
    // Independence Arch on the square beside the straight: a white block with three arches, flag colours on top
    {const i=Math.round(105/ds),sd=-(C.parkSide||1),p=sidePt(i,sd*(W+34)),g=new T.Group();const body=new T.Mesh(new T.BoxGeometry(30,13,5),white);body.position.y=6.5;body.castShadow=true;g.add(body);
      [-9,0,9].forEach(ax=>{const a=new T.Mesh(new T.BoxGeometry(6,8.5,5.2),new T.MeshLambertMaterial({color:0x5f6870}));a.position.set(ax,4.25,0);g.add(a);const c=new T.Mesh(new T.CylinderGeometry(3,3,5.2,16,1,false,0,Math.PI),new T.MeshLambertMaterial({color:0x5f6870}));c.rotation.z=Math.PI/2;c.rotation.y=Math.PI/2;c.position.set(ax,8.5,0);g.add(c);});
      const fl=new T.Mesh(new T.BoxGeometry(30.2,1.2,5.2),new T.MeshBasicMaterial({map:gpGhanaFlagTex()}));fl.material.userData.lin=1;fl.position.y=13.6;g.add(fl);
      g.position.set(p.x,groundAt(p.x,p.z),p.z);g.rotation.y=yawAt(i);scene.add(g);}
    // Black Star Square: the big paved parade ground + stands in red, gold and green
    {const sq=(Z.square||[[0.9,0.13]]);sq.forEach(([a,b])=>{const ia=Math.round(a*M),ib=Math.round(b*M)+(b<a?M:0);const sd=-(C.parkSide||1);ribbonR(ia,ib,sd*(W+7.2),sd*(W+70),new T.MeshLambertMaterial({color:0xd8d3c6}),0.1,0.1,0.05);
      const st=[];for(let i=ia+4;i<ib-4;i+=Math.round(16/ds))st.push(i);const cols=["#ce1126","#fcd116","#006b3f"];
      for(let t=0;t<4;t++)IM(new T.BoxGeometry(15,1.2,2.6),new T.MeshLambertMaterial({color:0xffffff}),st,(i,k,m)=>{const p=sidePt(i,-sd*(W+9+t*2.4));m.setMatrixAt(k,put(p.x,groundAt(p.x,p.z)+0.6+t*1.2,p.z,yawAt(i)));m.setColorAt(k,lin(cols[(k+t)%3]));},{shadow:true});});}
    // Kwame Nkrumah Memorial Park (inside the sweeper): a reflecting pool with fountains, the tall marble mausoleum topped by a black star, a statue on a plinth
    {const pk=(Z.park||[[0.85,0.95]])[0],i=Math.round((pk[0]+pk[1])/2*M),sd=C.parkSide||1,p=sidePt(i,sd*(W+34)),y=groundAt(p.x,p.z),g=new T.Group();
      const lawn=new T.Mesh(new T.CircleGeometry(30,28),new T.MeshLambertMaterial({color:0x5e9a3f}));lawn.rotation.x=-Math.PI/2;lawn.position.y=0.08;lawn.receiveShadow=true;g.add(lawn);
      const pool=new T.Mesh(new T.BoxGeometry(26,0.6,12),new T.MeshStandardMaterial({color:0x4c8fb0,roughness:0.05,metalness:0.5}));pool.position.set(0,0.3,6);g.add(pool);
      const rim=new T.Mesh(new T.BoxGeometry(27,0.5,13),white);rim.position.set(0,0.2,6);g.add(rim);
      const base=new T.Mesh(new T.BoxGeometry(10,3,10),white);base.position.set(0,1.5,-8);base.castShadow=true;g.add(base);
      const taper=new T.Mesh(new T.CylinderGeometry(1.2,5.2,20,4,1),white);taper.rotation.y=Math.PI/4;taper.position.set(0,13,-8);taper.castShadow=true;g.add(taper);
      const st2=new T.Mesh(gpStarGeo(T,1.8,0.6),black);st2.position.set(0,24.6,-8);g.add(st2);
      const plinth=new T.Mesh(new T.BoxGeometry(2.2,3,2.2),white);plinth.position.set(9,1.5,-2);g.add(plinth);const fig=new T.Mesh(new T.CylinderGeometry(0.45,0.6,3,8),new T.MeshStandardMaterial({color:0x5b4a2e,roughness:0.4,metalness:0.6}));fig.position.set(9,4.5,-2);fig.castShadow=true;g.add(fig);
      const head=new T.Mesh(new T.SphereGeometry(0.4,10,8),fig.material);head.position.set(9,6.3,-2);g.add(head);
      g.position.set(p.x,y,p.z);g.rotation.y=yawAt(i)+(sd>0?Math.PI/2:-Math.PI/2);scene.add(g);out.fountain={x:p.x,y,z:p.z,yaw:g.rotation.y};}
    // Labadi beach: fishing canoes in bright colours on the sand, umbrellas
    {const cn=[],um=[];for(let i=0;i<M;i+=Math.round(19/ds)){if(!inZ(i,"beach"))continue;const sd=SEA;const p=sidePt(i,sd*(W+26+rnd()*12));const y=groundAt(p.x,p.z);if(y<-0.4)continue;(rnd()<0.55?cn:um).push([p.x,y,p.z,yawAt(i)+(rnd()-0.5)*0.8]);}
      const hull=new T.CylinderGeometry(0.6,0.6,8,10,1,false,0,Math.PI);hull.rotateZ(Math.PI);hull.rotateX(Math.PI/2);hull.scale(1,0.8,1);hull.translate(0,0.5,0);
      IM(hull,new T.MeshLambertMaterial({color:0xffffff,side:T.DoubleSide}),cn,(c,k,m)=>{m.setMatrixAt(k,put(c[0],c[1],c[2],c[3]));m.setColorAt(k,lin(["#ce1126","#fcd116","#006b3f","#1f5fbf","#ff7a00"][k%5]));},{shadow:true});
      IM(new T.ConeGeometry(1.8,0.8,10).translate(0,2.4,0),new T.MeshLambertMaterial({color:0xffffff}),um,(c,k,m)=>{m.setMatrixAt(k,put(c[0],c[1],c[2],0));m.setColorAt(k,lin(["#ff5a5f","#ffd23f","#3ec1d3","#ffffff"][k%4]));},{shadow:true});
      IM(new T.CylinderGeometry(0.05,0.05,2.4,5).translate(0,1.2,0),new T.MeshLambertMaterial({color:0xdddddd}),um,(c,k,m)=>{m.setMatrixAt(k,put(c[0],c[1],c[2],0));});}
    // bunting across Oxford Street: strings of red / gold / green pennants between the lamp posts
    {const pen=[];for(let i=0;i<M;i+=Math.round(22/ds)){if(!inZ(i,"shops"))continue;const a=sidePt(i,-(W+3.3)),b=sidePt(i,W+3.3),y0=samples[wrapI(i)].pos.y+6.4;for(let q=1;q<14;q++){const t=q/14;pen.push([a.x+(b.x-a.x)*t,y0-Math.sin(Math.PI*t)*1.1,a.z+(b.z-a.z)*t,yawAt(i)+Math.PI/2,q]);}}
      const tri=new T.BufferGeometry();tri.setAttribute("position",new T.Float32BufferAttribute([-0.35,0,0,0.35,0,0,0,-0.75,0],3));tri.computeVertexNormals();
      IM(tri,new T.MeshBasicMaterial({color:0xffffff,side:T.DoubleSide}),pen,(c,k,m)=>{m.setMatrixAt(k,put(c[0],c[1],c[2],c[3]));m.setColorAt(k,lin(["#ce1126","#fcd116","#006b3f"][c[4]%3]));});}}
  // ---------- flags on tall poles: Ghana flags (Accra) ----------
  if(TH==="accra"){const fl=[];for(let i=Math.round(20/ds);i<M;i+=Math.round(60/ds)){if(inZ(i,"tunnel"))continue;const sd=(fl.length%2)?1:-1,p=sidePt(i,sd*(W+6.6));fl.push([p.x,groundAt(p.x,p.z),p.z,samples[wrapI(i)].nor.clone(),sd]);}
    IM(new T.CylinderGeometry(0.06,0.08,9,6).translate(0,4.5,0),new T.MeshLambertMaterial({color:0xdddddd}),fl,(f,k,m)=>{m.setMatrixAt(k,put(f[0],f[1],f[2],0));},{shadow:true});
    const fm=new T.MeshLambertMaterial({map:gpGhanaFlagTex(),side:T.DoubleSide});IM(new T.PlaneGeometry(2.7,1.8),fm,fl,(f,k,m)=>{dummy.position.set(f[0]+f[3].x*f[4]*1.35,f[1]+8.0,f[2]+f[3].z*f[4]*1.35);dummy.rotation.set(0,Math.atan2(f[3].x,f[3].z)+Math.PI/2,0);dummy.scale.set(1,1,1);dummy.updateMatrix();m.setMatrixAt(k,dummy.matrix);},{shadow:true});}
  // ---------- coast: overhead highway sign gantry ----------
  if(TH==="coast"){(Z.highway||[]).forEach(([a])=>{const i=Math.round(a*M)+Math.round(40/ds),s=samples[wrapI(i)],g=new T.Group(),steel=new T.MeshLambertMaterial({color:0x8d939c});[-1,1].forEach(sd=>{const p=new T.Mesh(new T.CylinderGeometry(0.22,0.22,7.4,8),steel);p.position.set(sd*(W+2.3),3.7,0);g.add(p);});
      const beam=new T.Mesh(new T.BoxGeometry(W*2+5,0.5,0.5),steel);beam.position.y=7.2;g.add(beam);const sign=new T.Mesh(new T.PlaneGeometry(9,2.6),new T.MeshBasicMaterial({map:gpTextTex("COAST ROAD  ⟶","#11673a","#fff",512,148,62),side:T.DoubleSide}));sign.material.userData.lin=1;sign.position.set(-W/2,7.0,-0.3);sign.rotation.y=Math.PI;g.add(sign);
      g.position.copy(s.pos);g.rotation.y=yawAt(i);g.traverse(o=>{if(o.isMesh)o.castShadow=true;});scene.add(g);});}
  return out;}
/* ---------- traffic: real-looking cars in lanes, recycled far ahead of the player (never right in front of him) ---------- */
function gpTrafficBuild(T,scene,src,C,karts,len,me,shared){const kinds=C.traffic||[];if(!src||!kinds.length)return null;const XS=7.6-1.2;
  const types={};const lanes=C.lanes||[-0.55,0,0.55];
  const cars=[];kinds.forEach(([type,n])=>{if(!n)return;const root=src.getObjectByName(type);if(!root)return;root.updateMatrixWorld(true);
    const paint=[],glass=[],det=[],glow=[];root.traverse(o=>{if(!o.isMesh)return;const g=o.geometry.clone();g.applyMatrix4(o.matrixWorld);const mn=(o.material&&o.material.name)||"";
      if(mn==="paint")paint.push({g});else if(mn==="glass")glass.push({g});else if(mn==="lamp"||mn==="tail"||mn==="sign")glow.push({g,c:mn==="tail"?{r:0.95,g:0.05,b:0.04}:(mn==="sign"?{r:1,g:0.75,b:0.1}:{r:1,g:0.97,b:0.88})});else det.push({g,c:o.material.color});});
    const mk=(parts,mat,cast)=>{if(!parts.length)return null;const im=new T.InstancedMesh(gpMerge(T,parts),mat,n);im.castShadow=cast;im.receiveShadow=false;im.frustumCulled=false;scene.add(im);return im;};
    const pm=new T.MeshStandardMaterial({color:0xffffff,roughness:0.32,metalness:0.15,envMapIntensity:0.7});pm.userData.lin=1;
    const gm=new T.MeshStandardMaterial({color:gpLin("#1a2430"),roughness:0.06,metalness:0.6,envMapIntensity:1.4});gm.userData.lin=1;
    const dm=new T.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:0.6,metalness:0.1});dm.userData.lin=1;
    const lm=new T.MeshBasicMaterial({color:0xffffff,vertexColors:true});lm.userData.lin=1;lm.toneMapped=false;
    const ty={paint:mk(paint,pm,true),glass:mk(glass,gm,false),det:mk(det,dm,false),glow:mk(glow,lm,false),n:0};types[type]=ty;
    const D=GP_TRAFFIC_DIM[type]||GP_TRAFFIC_DIM.sedan,pal=GP_TRAFFIC_PAINT[type]||["#cccccc"];
    for(let q=0;q<n;q++){const c={traffic:true,type,ty,k:ty.n++,t:0,x:0,lane:0,speed:0,cruise:0,S:{w:D.w,len:D.len},mass:D.mass,yawRel:0,bv:0,pos:new T.Vector3(),off:false,lap:0,started:true,col:pal[(q*3+cars.length)%pal.length]};
      if(ty.paint)ty.paint.setColorAt(c.k,gpLin(c.col));cars.push(c);}
    if(ty.paint&&ty.paint.instanceColor)ty.paint.instanceColor.needsUpdate=true;});
  // soft contact shadows under every traffic car (one instanced draw)
  const blob=new T.InstancedMesh(new T.PlaneGeometry(1,1).rotateX(-Math.PI/2),new T.MeshBasicMaterial({map:shared.ao||shared.blob||gpAoTex(),color:0x000000,transparent:true,opacity:0.75,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}),cars.length);blob.material.userData.lin=1;blob.frustumCulled=false;scene.add(blob);
  const TR={cars,types,blob,lanes,len,XS,dummy:new T.Object3D(),tv:new T.Vector3(),respawns:0,minSpawnAhead:1e9};
  // initial spread round the lap, but nothing on the grid or the first 140 m ahead of it
  const n=cars.length;cars.forEach((c,q)=>{const free=len-200,d=(140+free*(q+0.5)/n+(Math.random()-0.5)*20);c.t=((me.t*len+d)/len)%1;c.lane=lanes[q%lanes.length];c.x=c.lane;c.cruise=(0.36+((q*7)%5)*0.045)*me.max;c.speed=c.cruise;});
  return TR;}
function gpTrafficUpdate(dt,waiting){const TR=R3.traffic;if(!TR)return;const me=R3.me,L=TR.len,XS=TR.XS;
  for(const c of TR.cars){if(waiting){c.speed=0;continue;}   // traffic waits for the lights too (nobody drives into the grid)
    let rel=((c.t-me.t+1.5)%1-0.5)*L;
    if(rel<-80){// far behind Prince: recycle it well ahead, in a lane with room, away from rivals (it never appears right in front of him)
      let best=null;for(let tries=0;tries<10&&!best;tries++){const d=230+Math.random()*120,lane=TR.lanes[Math.floor(Math.random()*TR.lanes.length)],t=((me.t*L+d)/L)%1;
        const busy=R3.bodies.some(o=>o!==c&&!o.off&&Math.abs(((o.t-t+1.5)%1-0.5)*L)<(o.traffic&&Math.abs(o.x-lane)<0.3?28:14)&&Math.abs(o.x-lane)<0.5);if(!busy)best={t,lane,d};}
      if(best){c.t=best.t;c.lane=best.lane;c.x=best.lane;c.bv=0;c.yawRel=0;c.cruise=(0.34+Math.random()*0.2)*me.max;c.speed=c.cruise;TR.respawns++;TR.minSpawnAhead=Math.min(TR.minSpawnAhead,best.d);rel=best.d;}}
    // keep a gap to whatever is ahead in the same lane
    let tgt=c.cruise;for(const o of R3.bodies){if(o===c||o.off)continue;const d=((o.t-c.t+1.5)%1-0.5)*L;if(d>0&&d<(c.S.len+o.S.len)/2+12&&Math.abs(o.x-c.x)<0.32)tgt=Math.min(tgt,o.speed*0.95);}
    c.speed+=(tgt-c.speed)*Math.min(1,dt*(c.speed>tgt?2.4:0.8));
    const before=c.t;c.t=(c.t+c.speed*dt/L+1)%1;
    const vx0=c.x;c.x+=(c.lane-c.x)*Math.min(1,dt*0.9)+c.bv*dt;c.bv*=Math.exp(-4*dt);if(Math.abs(c.bv)<0.002)c.bv=0;
    if(Math.abs(c.x)>0.98){c.x=Math.sign(c.x)*0.98;c.bv=0;}c.yawRel=Math.max(-0.12,Math.min(0.12,(c.x-vx0)/Math.max(dt,1e-3)*0.06));}}
function gpTrafficPlace(){const TR=R3.traffic;if(!TR)return;const D=TR.dummy,XS=TR.XS,dirty=new Set();
  TR.cars.forEach((c,q)=>{const p=R3.curve.getPointAt(c.t),tn=R3.curve.getTangentAt(c.t);const l=Math.hypot(tn.x,tn.z)||1,nx=-tn.z/l,nz=tn.x/l;p.x+=nx*c.x*XS;p.z+=nz*c.x*XS;c.pos.copy(p);
    D.position.copy(p);D.rotation.set(0,Math.atan2(tn.x,tn.z)+c.yawRel,0);D.scale.set(1,1,1);D.updateMatrix();const ty=c.ty;["paint","glass","det","glow"].forEach(k=>{if(ty[k])ty[k].setMatrixAt(c.k,D.matrix);});dirty.add(ty);
    D.position.y+=0.03;D.scale.set(c.S.w*1.25,1,c.S.len*1.1);D.updateMatrix();TR.blob.setMatrixAt(q,D.matrix);});
  dirty.forEach(ty=>["paint","glass","det","glow"].forEach(k=>{if(ty[k])ty[k].instanceMatrix.needsUpdate=true;}));TR.blob.instanceMatrix.needsUpdate=true;}

/* ---------- the race ---------- */
async function startRace3D(cid){
  clearTimers();closeOverlay();showAnanseCorner(false);gpStop();
  GPA.init(); // inside the tap on a route card, which is what iOS needs to allow sound
  const C0=GP_CIRCUITS.find(c=>c.id===cid)||GP_CIRCUITS[0],C=Object.assign({},C0,{laps:gpLaps()});   // laps come from Options (1-3)
  app.innerHTML='<div class="fadein center" style="padding-top:20vh"><div class="ananse-wrap">'+ananseSVG(100,"idle")+'</div><h2 style="color:#fff">'+({city:"Heading downtown…",accra:"Akwaaba! Heading to Accra…",coast:"Heading to the coast…"}[C.theme]||"Heading to Japan…")+'</h2><p class="muted" style="color:#ffd2e6">Loading '+esc(C.name)+'…</p></div>';
  const fb=()=>startRace2D(cid==="kawaguchi"?"accra":(cid==="tokyo"?"nebula":"skybridge"));
  const intro=gpIntro(false);   // started inside the tap so iOS lets it play with sound
  try{await loadThree();}catch(e){document.querySelectorAll(".fz-intro").forEach(e=>e.remove());toast("3D engine could not load — using the classic racer");fb();return;}
  // car pictures load lazily here (a slow network never holds the race more than a few seconds: cars without a picture use the 3D model)
  if(!gpStory()){try{await Promise.race([Promise.all([gpLoadPics(gpRacePicIds()),gpLoadGlb(gpRacePicIds()),gpLoadWorld(),C.theme&&gpTrafficOn()?gpLoadTraffic():null]),new Promise(r=>setTimeout(r,7000))]);}catch(e){}}
  await intro;
  if(!app.querySelector("h2"))return;   // the player left while the intro was playing
  try{gpBuild(C);}catch(e){console.error(e);gpStop();toast("3D racer hit a problem — using the classic racer");fb();}
}
function gpBuild(C){
  gpCss();
  const myCar=gpCar(),myPaint=gpPaint(),story=gpStory(),L=story?Object.assign({},C.look,C.story):C.look;
  if(P&&typeof P.gpMute==="boolean")GPA.muted=P.gpMute;GPA.setMute(GPA.muted);
  app.innerHTML='<div class="fadein gp3-wrap v3'+(story?" story":"")+'" id="gp3">'
   +'<canvas id="gp3c"></canvas><canvas class="fz-fx" id="gp3Fx" width="16" height="9"></canvas><div class="fz-vig"></div><canvas class="fz-ck" id="gp3Ck" width="16" height="9"></canvas>'
   +'<div class="gp3-touch" id="gp3L"></div>'
   +'<div class="fz-tl"><div class="fz-pos" id="gp3Pos"'+(gpMode()==="free"?' style="display:none"':'')+'>5<small>th</small><em>/5</em></div><div class="fz-lap" id="gp3Lap">LAP 1/'+C.laps+'</div><div class="fz-time" id="gp3Time">0:00.0</div><div class="fz-song" id="gp3Song"'+(gpMode()==="free"?'':' style="display:none"')+'></div></div>'
   +'<canvas class="gp3-map" id="gp3Map" width="300" height="220"></canvas>'
   +'<div class="fz-skill" id="gp3Skill"></div>'
   +'<canvas class="fz-tach" id="gp3Tach" width="320" height="320"></canvas>'
   +'<button class="fz-btn mute" id="gp3Mute" aria-label="Sound on or off">'+(GPA.muted?"🔇":"🔊")+'</button>'
   +'<button class="fz-btn quit" id="gp3Quit" aria-label="Quit race" onclick="renderCircuits()">✕</button><button class="fz-btn cam" id="gp3Cam" aria-label="Change camera">🎥</button>'
   +'<div class="gp3-msg" id="gp3Msg"></div>'
   +'<div class="gp3-card" id="gp3Card"><b>'+esc(C.name)+'</b><small>'+(gpMode()==="free"?"Free drive · ":"Race · ")+esc(L.time)+' · '+esc(myCar.n)+'</small></div>'
   +'<div class="gp3-count" id="gp3Count"></div>'
   +'<div class="fz-cue" id="gp3Cue">BRAKE</div>'
   +'<div class="gp3-pad l"><span class="race-btn" id="rcL" aria-hidden="true">◀</span><span class="race-btn" id="rcR" aria-hidden="true">▶</span></div>'
   +'<div class="gp3-pad r"><button class="fz-pedal brake" id="rcB" aria-label="Brake pedal"><i></i><b>BRAKE</b></button><button class="fz-pedal gas'+(gpAuto()?" auto":"")+'" id="rcG" aria-label="Gas pedal"><i></i><b>'+(gpAuto()?"AUTO":"GAS")+'</b></button></div>'
   +'</div>'
   +'<div class="center fz-quit-row"><button class="readbtn" onclick="renderCircuits()">⟵ Quit race</button></div>';
  const T=THREE,canvas=$("gp3c"),UP=new T.Vector3(0,1,0);
  const renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:"high-performance"});
  renderer.info.autoReset=false;
  const pr0=Math.min(window.devicePixelRatio||1,2);renderer.setPixelRatio(pr0);
  if(T.sRGBEncoding)renderer.outputEncoding=T.sRGBEncoding;
  if(!story){renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=0.95;}
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
  const aniso=Math.min(8,renderer.capabilities.getMaxAnisotropy?renderer.capabilities.getMaxAnisotropy():4);window._gpAniso=aniso;
  const scene=new T.Scene();
  const WD=story?{}:(window._gpWorld||{}),TINT=new T.Color(L.tint?L.tint[0]:1,L.tint?L.tint[1]:1,L.tint?L.tint[2]:1);
  const SKYK=(C.sky==="dusk"&&WD.skyDusk)?"skyDusk":"sky",SKY=GP_WORLD[SKYK];   // Tokyo Bay runs under the dusk band
  const TH=C.theme||null,street=TH==="city"||TH==="accra";
  const bandOn=!TH&&!!WD[SKYK],mulHex=(hex,c)=>new T.Color(hex).multiply(c);
  const hazeHex=bandOn?"#"+mulHex(SKY.haze,TINT).getHexString():L.haze;
  const hazeCol=story?gpLin(L.paper):gpLin(hazeHex);scene.fog=story?new T.Fog(hazeCol,140,820):new T.Fog(hazeCol,bandOn?150:160,bandOn?1000:1150);
  const camera=new T.PerspectiveCamera(60,16/9,0.5,3400);
  const post=story?gpPostSetup(T,renderer,{paper:L.paper,ink:L.ink,night:L.night||0}):null;
  const phone=Math.min(window.screen.width||999,window.screen.height||999,Math.max(innerWidth,innerHeight))<600||Math.min(innerWidth,innerHeight)<520;
  const rnd=(()=>{let s=C.id.length*911+7;return()=>{s=(s*16807)%2147483647;return (s-1)/2147483646;};})();
  // ---- lights: one golden-hour sun with shadows + sky/ground hemisphere ----
  const sunDir=new T.Vector3(L.dir[0],L.dir[1],L.dir[2]).normalize();
  // warmer sunset: the sun light leans toward amber and the sky fill picks up a little of the horizon glow (Horizon look only)
  const sunCol=story?gpLin(L.sun):new T.Color(L.sun).lerp(new T.Color("#ff9a52"),0.3).convertSRGBToLinear(),skyCol=story?gpLin(L.hor):new T.Color(L.mid).lerp(new T.Color(L.hor),0.35).convertSRGBToLinear();
  scene.add(new T.HemisphereLight(skyCol,gpLin(C.grass),story?0.95:L.hemi));
  const sun=new T.DirectionalLight(sunCol,story?1.05:L.sunI*1.06);sun.castShadow=true;
  sun.shadow.mapSize.set(phone?1024:2048,phone?1024:2048);const sc=sun.shadow.camera;sc.left=-40;sc.right=40;sc.top=40;sc.bottom=-40;sc.near=5;sc.far=420;sun.shadow.bias=-0.0004;if("normalBias" in sun.shadow)sun.shadow.normalBias=0.05;
  scene.add(sun);scene.add(sun.target);
  // ---- sky dome: three-stop gradient, sun disc, warm glow around the sun ----
  const skyMat=new T.ShaderMaterial({side:T.BackSide,depthWrite:false,fog:false,
    uniforms:{top:{value:new T.Color(L.top)},mid:{value:bandOn?mulHex(SKY.top,TINT):new T.Color(story?L.hor:L.mid)},hor:{value:bandOn?mulHex(SKY.top,TINT):new T.Color(L.hor)},glow:{value:new T.Color(L.glow)},sunDir:{value:sunDir}},
    vertexShader:"varying vec3 vD;void main(){vD=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
    fragmentShader:"uniform vec3 top;uniform vec3 mid;uniform vec3 hor;uniform vec3 glow;uniform vec3 sunDir;varying vec3 vD;void main(){vec3 d=normalize(vD);float h=clamp(d.y,0.0,1.0);vec3 c=h<0.16?mix(hor,mid,smoothstep(0.0,0.16,h)):mix(mid,top,pow(smoothstep(0.16,1.0,h),0.7));float s=max(dot(d,sunDir),0.0);c+=glow*(smoothstep(0.9988,0.9994,s)*1.8+pow(s,70.0)*0.45+pow(s,5.0)*0.16);if(d.y<0.0)c=hor;gl_FragColor=vec4(c,1.0);}"});
  const sky=new T.Mesh(new T.SphereGeometry(2600,32,16),skyMat);sky.renderOrder=-2;sky.frustumCulled=false;scene.add(sky);
  // ---- photo horizon: a camera-following cylinder band with Mount Fuji centred on the start straight ----
  let band=null;if(bandOn){const SK=SKY,bh=SK.h*SK.mpp;const bm=new T.MeshBasicMaterial({map:WD[SKYK],transparent:false,blending:T.CustomBlending,blendSrc:T.SrcAlphaFactor,blendDst:T.OneMinusSrcAlphaFactor,blendEquation:T.AddEquation,depthWrite:false,depthTest:false,fog:false,side:T.BackSide,color:TINT.clone()});bm.toneMapped=false;bm.userData.lin=1;   // opaque pass (drawn right after the sky dome), alpha-blended edges
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
  const EV=C.elev||[0,0,0],NP=C.pts.length,elevAt=k=>EV[0]*Math.sin(k/NP*6.2832+EV[2])+EV[1]*Math.sin(k/NP*12.566+EV[2]*1.7);   // crests and dips along the lap (the main straight stays near level)
  const curve=new T.CatmullRomCurve3(C.pts.map((p,k)=>new T.Vector3(p[0],hgt(p[0],p[1])+elevAt(k),p[1])),true,"centripetal",0.6);curve.arcLengthDivisions=Math.max(2000,Math.round(C.pts.length*24));   // a fine arc-length table: t*len is then true metres along the road (the default 200 steps was ~10 cm off between cars)
  const M=960,W=7.6;const len=curve.getLength();
  const samples=[];for(let i=0;i<=M;i++){const t=(i/M)%1;const pos=curve.getPointAt(t);const tan=curve.getTangentAt(t).normalize();const nor=new T.Vector3(-tan.z,0,tan.x).normalize();samples.push({pos,tan,nor});}
  const CELL=24,hash=new Map();for(let i=0;i<M;i++){const p=samples[i].pos;const k=Math.floor(p.x/CELL)+","+Math.floor(p.z/CELL);let l=hash.get(k);if(!l){l=[];hash.set(k,l);}l.push(i);}
  const nearest=(x,z)=>{const cx0=Math.floor(x/CELL),cz0=Math.floor(z/CELL);let bd=1e12,bi=-1;for(let a=-2;a<=2;a++)for(let b=-2;b<=2;b++){const l=hash.get((cx0+a)+","+(cz0+b));if(!l)continue;for(const i of l){const p=samples[i].pos;const d=(p.x-x)*(p.x-x)+(p.z-z)*(p.z-z);if(d<bd){bd=d;bi=i;}}}return[bi,Math.sqrt(bd)];};
  // ---- circuit analysis: signed curvature (+ = left), corner regions, the speed a car can carry, a racing line ----
  const ds=len/M,wrapI=i=>((i%M)+M)%M;
  const kap0=new Float32Array(M),kap=new Float32Array(M);for(let i=0;i<M;i++){const a=samples[wrapI(i-2)].tan,b=samples[wrapI(i+2)].tan;const la=Math.hypot(a.x,a.z)||1,lb=Math.hypot(b.x,b.z)||1;const cr=(a.z*b.x-a.x*b.z)/(la*lb);const dot=Math.max(-1,Math.min(1,(a.x*b.x+a.z*b.z)/(la*lb)));kap0[i]=Math.sign(cr)*Math.acos(dot)/(4*ds);}   // heading change per metre on the ground plane (slopes must not read as bends)
  for(let i=0;i<M;i++){let v=0;for(let k=-3;k<=3;k++)v+=kap0[wrapI(i+k)];kap[i]=v/7;}
  const GRIP=GP_GRIP*(gpPace()==="gentle"?1.15:1);
  const vLim=new Float32Array(M),vProf=new Float32Array(M);for(let i=0;i<M;i++)vLim[i]=Math.min(70,Math.sqrt(GRIP/Math.max(1e-4,Math.abs(kap[i]))));
  for(let i=0;i<M;i++)vProf[i]=vLim[i];for(let pass=0;pass<2;pass++)for(let j=2*M-1;j>=0;j--){const i=wrapI(j),nx=wrapI(j+1);vProf[i]=Math.min(vProf[i],Math.sqrt(vProf[nx]*vProf[nx]+2*22*ds));}   // brake early enough (22 units/s²) for the corner ahead
  const blur=(src,r)=>{const o=new Float32Array(M);for(let i=0;i<M;i++){let v=0;for(let k=-r;k<=r;k++)v+=src[wrapI(i+k)];o[i]=v/(2*r+1);}return o;};
  const kn=blur(kap,Math.round(10/ds)),kw=blur(kap,Math.round(50/ds));
  const lineX=new Float32Array(M);for(let i=0;i<M;i++)lineX[i]=Math.max(-0.7,Math.min(0.7,-0.75*kn[i]*30+0.8*kw[i]*30));   // outside on the way in, inside at the apex, outside on the way out
  const corners=[];{let i0=-1,sg=0;const thr=1/110;for(let i=0;i<=M;i++){const v=i<M?kap[i]:0;const on=Math.abs(v)>thr,ss=Math.sign(v);if(on&&(i0<0||ss!==sg)){if(i0>=0)corners.push({a:i0,b:i-1,sgn:sg});i0=i;sg=ss;}else if(!on&&i0>=0){corners.push({a:i0,b:i-1,sgn:sg});i0=-1;}}
    corners.forEach(c=>{let m=0;for(let i=c.a;i<=c.b;i++)if(Math.abs(kap[i])>m){m=Math.abs(kap[i]);c.apex=i;}c.R=1/m;c.n=c.b-c.a+1;});}
  const big=corners.filter(c=>c.R<40&&c.n*ds>12);   // hairpins, chicanes and 90-degree corners get run-off, tyre walls and braking boards
  const runW=W+12.5,flatW=new Float32Array(M).fill(W+3.2),runOut=new Int8Array(M);   // runOut: which side (sign) has the run-off at sample i
  if(!street)big.forEach(c=>{for(let i=c.a-8;i<=c.b+10;i++){const j=wrapI(i);runOut[j]=c.sgn;flatW[j]=runW+1.6;}});
  for(let r=0;r<2;r++){const f2=Float32Array.from(flatW);for(let i=0;i<M;i++){let v=0;for(let k=-6;k<=6;k++)v+=flatW[wrapI(i+k)];f2[i]=v/13;}flatW.set(f2);}
  const inRun=i=>runOut[wrapI(i)]!==0;
  const RW=W+3.2,BL=30;
  const cutZ=[];if(C.zones){(C.zones.bridge||[]).forEach(([a,b])=>cutZ.push([Math.round(a*M),Math.round(b*M),6.6,W+2.9]));(C.zones.ford||[]).forEach(([a,b])=>cutZ.push([Math.round(a*M)-6,Math.round(b*M)+6,0.9,W+0.5]));}
  const groundAt=(x,z)=>{const n=nearest(x,z);const h=hgt(x,z);if(n[0]<0)return h;const rp=samples[n[0]].pos;const ry=rp.y-0.12;const rw=flatW[n[0]];
    for(const q of cutZ){if(n[0]>=q[0]&&n[0]<=q[1]&&n[1]>q[3]){const e=Math.min(1,Math.min(n[0]-q[0],q[1]-n[0])*ds/9),f=Math.min(1,(n[1]-q[3])/4);return ry-q[2]*e*f*(3-2*f)*f;}}   // river / stream bed under bridges and across the ford
    if(n[1]<=rw)return ry;const t=Math.min(1,(n[1]-rw)/BL);const e=t*t*(3-2*t);return ry+(h-ry)*e;};
  const gh="#"+C.grass.toString(16).padStart(6,"0");
  const grassTex=gpCanvasTex(256,256,(x,w,h)=>{x.fillStyle=gh;x.fillRect(0,0,w,h);for(let i=0;i<70;i++){const r=8+rnd()*40;x.fillStyle=rnd()<0.5?"rgba(0,0,0,.06)":"rgba(255,240,160,.07)";x.beginPath();x.arc(rnd()*w,rnd()*h,r,0,7);x.fill();}
    for(let i=0;i<3200;i++){x.fillStyle=rnd()<0.5?"rgba(0,0,0,.1)":"rgba(255,255,190,.08)";x.fillRect(rnd()*w,rnd()*h,1.5,3);}},true);grassTex.repeat.set(140,140);
  const GS=1700,TG=new T.PlaneGeometry(GS,GS,170,170);TG.rotateX(-Math.PI/2);const tp=TG.attributes.position;const tcol=new Float32Array(tp.count*3);
  const cGrass=gpLin(C.grass).multiply(bandOn?new T.Color(0.74,0.74,0.5):new T.Color(1,1,1)),cHigh=gpLin(story?0x6f8f5a:0x4f6b3a),cShore=gpLin(story?0xe9d9b8:(C.theme?0xe6d3a3:0xb8a77c)),tmpC=new T.Color();
  for(let i=0;i<tp.count;i++){const x=tp.getX(i)+cx,z=tp.getZ(i)+cz;const y=groundAt(x,z);tp.setXYZ(i,x,y,z);tmpC.copy(cGrass);if(y<1.2)tmpC.lerp(cShore,Math.min(1,(1.2-y)/2));else if(y>12)tmpC.lerp(cHigh,Math.min(1,(y-12)/22));tcol[i*3]=tmpC.r;tcol[i*3+1]=tmpC.g;tcol[i*3+2]=tmpC.b;}
  TG.setAttribute("color",new T.BufferAttribute(tcol,3));TG.computeVertexNormals();
  const ground=new T.Mesh(TG,new T.MeshLambertMaterial({map:grassTex,vertexColors:true}));ground.receiveShadow=true;scene.add(ground);
  const farMat=new T.MeshLambertMaterial({color:story?L.hill:(LK?(LK.sea?0x2a8fb4:0x6d93b8):0x5f7050)});const far=new T.Mesh(new T.PlaneGeometry(7000,7000),farMat);far.rotation.x=-Math.PI/2;far.position.set(cx,LK?-1.3:0.5,cz);scene.add(far);
  let water=null,waterTex=null;if(LK){waterTex=gpCanvasTex(256,256,(x,w,h)=>{x.fillStyle=story?"#5cc6c0":(LK.sea?"#2a8fb4":"#6d93b8");x.fillRect(0,0,w,h);for(let i=0;i<500;i++){x.fillStyle="rgba(255,255,255,.07)";x.fillRect(rnd()*w,rnd()*h,4,1.5);}x.strokeStyle="rgba(255,255,255,.35)";x.lineWidth=1.5;for(let i=0;i<30;i++){const px=rnd()*w,py=rnd()*h,l=10+rnd()*24;x.beginPath();x.moveTo(px,py);x.quadraticCurveTo(px+l/2,py-3,px+l,py);x.stroke();}},true);waterTex.repeat.set(40,40);
    const wm=story?new T.MeshLambertMaterial({map:waterTex}):new T.MeshStandardMaterial({map:waterTex,roughness:LK.sea?0.3:0.12,metalness:LK.sea?0.15:0.55,envMapIntensity:LK.sea?0.8:1.4});
    water=new T.Mesh(new T.PlaneGeometry(GS,GS),wm);water.rotation.x=-Math.PI/2;water.position.set(cx,-1.1,cz);water.receiveShadow=true;scene.add(water);}
  // ---- Mount Fuji: a huge concave-sided cone with a snow cap and its own haze ----
  const FH=470,FR=780,FJ=C.fuji||[0,-1200],fx=cx+FJ[0],fz=cz+FJ[1];
  const prof=[];for(let i=0;i<=26;i++){const h=i/26;prof.push(new T.Vector2(FR*(0.07+0.93*Math.pow(1-h,1.3)),FH*h));}
  const fujiGeo=new T.LatheGeometry(prof,56);
  const fujiMat=new T.ShaderMaterial({fog:false,uniforms:{sunDir:{value:sunDir},haze:{value:story?new T.Color(L.paper):new T.Color(L.haze).lerp(new T.Color(L.mid),0.45)},rockA:{value:new T.Color(story?L.hill:"#283a66")},rockB:{value:new T.Color(story?L.hill:"#52689c")},snow:{value:new T.Color("#ffffff")},sunCol:{value:new T.Color(L.sun)},H:{value:FH},snowLine:{value:0.5},ink:{value:story?1:0}},
    vertexShader:"varying vec3 vN;varying vec3 vP;void main(){vN=normalize(mat3(modelMatrix)*normal);vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
    fragmentShader:"uniform vec3 sunDir;uniform vec3 haze;uniform vec3 rockA;uniform vec3 rockB;uniform vec3 snow;uniform vec3 sunCol;uniform float H;uniform float snowLine;uniform float ink;varying vec3 vN;varying vec3 vP;void main(){float h=vP.y/H;float ang=atan(vP.x,vP.z);float wob=sin(ang*9.0)*0.035+sin(ang*23.0+1.3)*0.02+sin(ang*47.0)*0.012;float sn=smoothstep(snowLine-0.06+wob,snowLine+0.06+wob,h);float gul=0.5+0.5*sin(ang*64.0);vec3 rock=mix(rockA,rockB,h)*(0.88+0.2*gul*(1.0-h));vec3 c=mix(rock,snow*(0.93+0.07*gul),sn);float li=0.7+0.45*max(dot(normalize(vN),sunDir),0.0);c*=li*mix(vec3(1.0),sunCol,0.12);float hz=(0.14+0.4*(1.0-h))*(1.0-ink*0.4)*(1.0-sn*0.7);c=mix(c,haze,hz);gl_FragColor=vec4(c,1.0);}"});
  const fuji=new T.Mesh(fujiGeo,fujiMat);fuji.position.set(fx,-6,fz);if(!bandOn&&C.fuji)scene.add(fuji);
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
  const hdgAt=i=>Math.atan2(samples[(i+M)%M].tan.x,samples[(i+M)%M].tan.z),hdgMean=(a,b)=>{let sx=0,sz=0;for(let i=a;i<=b;i++){sx+=Math.sin(hdgAt(i));sz+=Math.cos(hdgAt(i));}return Math.atan2(sx,sz);};const stA=Math.round(C.mainS[0]*0.62/ds),stB=Math.round(C.mainS[1]*0.72/ds);const standRanges=[[M-stA,M],[0,stB]];const inStands=i=>standRanges.some(([a,b])=>i>=a-4&&i<=b+4);   // pit wall + grandstands along the main straight
  const pitSide=corners.length?corners[0].sgn:1,busy=i=>inStands(i)||inRun(i);   // pits on the inside of turn 1, the big grandstand opposite
  let trapI=Math.floor(M*0.3),bestStr=-9;for(let i=Math.floor(M*0.12);i<Math.floor(M*0.88);i+=4){if(inStands(i))continue;const a=samples[(i-25+M)%M].tan,b=samples[(i+25)%M].tan;const d=a.x*b.x+a.z*b.z;if(d>bestStr){bestStr=d;trapI=i;}}   // speed trap on the straightest stretch away from the pits
  const nearBld=(x,z)=>{const n=nearest(x,z);return inStands(n[0])&&n[1]<W+38;};   // nothing grows on the pit building or in the grandstands
  // ---- guard rails (white steel) with posts, and red-white delineator posts that streak past ----
  const railPic=WD.rail||null;
  const railMat=railPic?new T.MeshStandardMaterial({map:railPic,transparent:true,alphaTest:0.5,side:T.DoubleSide,roughness:0.5,metalness:0.3}):new T.MeshStandardMaterial({color:story?0xd9785f:0xe8e9ea,roughness:0.4,metalness:0.6,side:T.DoubleSide});
  // rail offset per side and sample: at the shoulder normally, out at the edge of the run-off round the big corners, gone along the main straight (walls there)
  const railOff=[null,null,null];[-1,1].forEach(side=>{const o=new Float32Array(M);for(let i=0;i<M;i++)o[i]=runOut[i]===side?runW+0.9:W+2.6;for(let r=0;r<2;r++){const o2=Float32Array.from(o);for(let i=0;i<M;i++){let v=0;for(let k=-5;k<=5;k++)v+=o[wrapI(i+k)];o2[i]=v/11;}o.set(o2);}railOff[side+1]=o;});
  const rail=(side,y0,y1)=>{const g=new T.BufferGeometry();const v=[],uv=[],idx=[];let d=0;const off=railOff[side+1];for(let i=0;i<=M;i++){const s=samples[i%M];const a=s.pos.clone().addScaledVector(s.nor,side*off[i%M]);const gy=groundAt(a.x,a.z);const hide=inStands(i%M);if(i)d+=samples[i%M].pos.distanceTo(samples[i-1].pos);const u=d/GP_WORLD.rail.len;v.push(a.x,hide?gy-2:gy+y0,a.z,a.x,hide?gy-2:gy+y1,a.z);uv.push(u,0,u,1);if(i<M){const k=i*2;idx.push(k,k+2,k+1,k+1,k+2,k+3);}}g.setAttribute("position",new T.Float32BufferAttribute(v,3));g.setAttribute("uv",new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();const m=new T.Mesh(g,railMat);m.castShadow=!railPic;return m;};
  [-1,1].forEach(side=>scene.add(railPic?rail(side,0.0,GP_WORLD.rail.hgt):rail(side,0.45,0.78)));
  const posts=[];for(let i=0;i<M;i+=4){if(inStands(i))continue;const s=samples[i];[-1,1].forEach(side=>{const p=s.pos.clone().addScaledVector(s.nor,side*railOff[side+1][i]);posts.push([p.x,groundAt(p.x,p.z),p.z]);});}
  const postIM=new T.InstancedMesh(new T.BoxGeometry(0.12,0.8,0.12),new T.MeshLambertMaterial({color:0x9a9ea3}),posts.length);posts.forEach((p,k)=>{dummy.position.set(p[0],p[1]+0.4,p[2]);dummy.rotation.set(0,0,0);dummy.scale.set(1,1,1);dummy.updateMatrix();postIM.setMatrixAt(k,dummy.matrix);});if(!railPic)scene.add(postIM);
  // photo props (trees, lanterns, banners, torii) collect here and become one batch of camera-facing billboards
  const BB=[],bbOn=!TH&&!!WD.props,bbAdd=(type,x,y,z,s,flip)=>{BB.push([type,x,y,z,s,flip]);};
  const delin=[];for(let i=2;i<M;i+=3){if(busy(i)||street)continue;const s=samples[i];[-1,1].forEach(side=>{const p=s.pos.clone().addScaledVector(s.nor,side*(W+1.9));delin.push([p.x,groundAt(p.x,p.z),p.z]);});}
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
  if(!TH){const ti=Math.round(45/ds),st=samples[ti];torii.position.copy(st.pos);torii.lookAt(st.pos.clone().add(st.tan));scene.add(torii);}   // the torii stands just past the gantry, framing Fuji down the straight
  const flagTex=gpCanvasTex(64,128,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,"#ff2d87");g.addColorStop(1,"#7a1fd6");x.fillStyle=g;x.fillRect(0,0,w,h);x.fillStyle="#fff";x.font="900 26px system-ui";x.textAlign="center";x.save();x.translate(32,64);x.rotate(Math.PI/2);x.fillText("HORIZON",0,10);x.restore();});
  const flags=[];for(let i=0;i<M;i+=(bbOn?22:12)){if(busy(i)||street||Math.abs(kap[i])>1/80)continue;const s=samples[i%M];[-1,1].forEach(side=>{const p=s.pos.clone().addScaledVector(s.nor,side*(W+5.2));flags.push([p.x,groundAt(p.x,p.z),p.z,side,s.nor.clone()]);});}
  const fpIM=new T.InstancedMesh(new T.CylinderGeometry(0.05,0.07,6.5,6),new T.MeshStandardMaterial({color:0xdddddd,roughness:0.4,metalness:0.6}),flags.length),flIM=new T.InstancedMesh(new T.PlaneGeometry(1.1,2.6),new T.MeshStandardMaterial({map:flagTex,side:T.DoubleSide,roughness:0.7}),flags.length);
  flags.forEach((f,k)=>{dummy.rotation.set(0,0,0);dummy.scale.set(1,1,1);dummy.position.set(f[0],f[1]+3.25,f[2]);dummy.updateMatrix();fpIM.setMatrixAt(k,dummy.matrix);dummy.position.set(f[0]+f[4].x*0.6*f[3],f[1]+5.1,f[2]+f[4].z*0.6*f[3]);dummy.lookAt(f[0]+f[4].x*5,f[1]+5.1,f[2]+f[4].z*5);dummy.updateMatrix();flIM.setMatrixAt(k,dummy.matrix);});
  fpIM.castShadow=true;flIM.castShadow=true;scene.add(fpIM);scene.add(flIM);
  // ---- F1 trackside: kerbs, run-off, tyre walls, catch fencing, braking boards, pit wall and garages, grandstands, the start gantry ----
  const ribbonR=(i0,i1,inner,outer,mat,yIn,yOut,uPerM,swap,vMax)=>{const g=new T.BufferGeometry();const v=[],uv=[],idx=[];let d=0,n=0;for(let i=i0;i<=i1;i++){const s=samples[wrapI(i)];if(i>i0)d+=ds;const a=s.pos.clone().addScaledVector(s.nor,inner),b=s.pos.clone().addScaledVector(s.nor,outer);v.push(a.x,s.pos.y+yIn,a.z,b.x,s.pos.y+yOut,b.z);if(swap)uv.push(d*uPerM,0,d*uPerM,vMax||1);else uv.push(0,d*uPerM,1,d*uPerM);if(i<i1){const k=n*2;idx.push(k,k+1,k+2,k+1,k+3,k+2);}n++;}g.setAttribute("position",new T.Float32BufferAttribute(v,3));g.setAttribute("uv",new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();const m=new T.Mesh(g,mat);m.receiveShadow=true;scene.add(m);return m;};
  const wallR=(i0,i1,off,side,y0,y1,mat,uPerM)=>{const g=new T.BufferGeometry();const v=[],uv=[],idx=[];let d=0,n=0;for(let i=i0;i<=i1;i++){const s=samples[wrapI(i)];if(i>i0)d+=ds;const a=s.pos.clone().addScaledVector(s.nor,side*off);const gy=groundAt(a.x,a.z);v.push(a.x,gy+y0,a.z,a.x,gy+y1,a.z);uv.push(d*uPerM,0,d*uPerM,1);if(i<i1){const k=n*2;idx.push(k,k+2,k+1,k+1,k+2,k+3);}n++;}g.setAttribute("position",new T.Float32BufferAttribute(v,3));g.setAttribute("uv",new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();const m=new T.Mesh(g,mat);scene.add(m);return m;};
  const wallS=(i0,i1,off,side,y0,y1,mat,uPerM)=>{const g=new T.BufferGeometry();const v=[],uv=[],idx=[];let d=0,n=0;for(let i=i0;i<=i1;i++){const s=samples[wrapI(i)];if(i>i0)d+=ds;const a=s.pos.clone().addScaledVector(s.nor,side*off);v.push(a.x,s.pos.y+y0,a.z,a.x,s.pos.y+y1,a.z);uv.push(d*uPerM,0,d*uPerM,1);if(i<i1){const k=n*2;idx.push(k,k+2,k+1,k+1,k+2,k+3);}n++;}g.setAttribute("position",new T.Float32BufferAttribute(v,3));g.setAttribute("uv",new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();const m=new T.Mesh(g,mat);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m;};
  const poMat=o=>{o.polygonOffset=true;o.polygonOffsetFactor=-1;o.polygonOffsetUnits=-1;return o;};
  // photo props are shown as they are (sun already baked in), tinted to the route light and fogged like everything else
  const picMat=(t,extra)=>{const m=new T.MeshBasicMaterial(Object.assign({map:t,transparent:true,alphaTest:0.5,side:T.DoubleSide,color:TINT.clone()},extra||{}));m.toneMapped=false;m.userData.lin=1;return m;};
  const BA=GP_WORLD.boards,atlasMat=WD.boards?picMat(WD.boards):null;
  const atlasGeo=(cell,hM)=>{const c=BA.cells[cell];const g=new T.PlaneGeometry(hM*c.w/c.h,hM);const uv=g.attributes.uv;const u0=c.x/BA.w,u1=(c.x+c.w)/BA.w,v0=1-(c.y+c.h)/BA.h,v1=1-c.y/BA.h;for(let i=0;i<uv.count;i++)uv.setXY(i,u0+uv.getX(i)*(u1-u0),v0+uv.getY(i)*(v1-v0));return g;};
  const kerbTex=gpCanvasTex(128,32,(x,w,h)=>{x.fillStyle="#e8e6e0";x.fillRect(0,0,w,h);x.fillStyle="#d81e2a";x.fillRect(0,0,w/2,h);x.fillStyle="rgba(0,0,0,.18)";x.fillRect(0,h-4,w,4);},true);
  const kerbMat=poMat(new T.MeshLambertMaterial({map:WD.kerb||kerbTex}));   // photo kerb tile (one red + one white block per 2 m) when the world art loaded
  corners.forEach(c=>{if(c.n*ds<8)return;const si=-c.sgn,so=c.sgn;   // inside kerb through the whole corner, exit kerb on the outside from the apex
    const kIn=(i0,i1,side)=>ribbonR(i0,i1,side*(W-0.45),side*(W+1.35),kerbMat,0.06,0.0,0.5);
    kIn(c.a,c.b,si);kIn(c.apex,c.b+Math.round(10/ds),so);});
  const gravelTex=gpCanvasTex(128,128,(x,w,h)=>{x.fillStyle=story?"#e6d8bd":"#b9ad92";x.fillRect(0,0,w,h);for(let i=0;i<2600;i++){const v=150+rnd()*90|0;x.fillStyle="rgba("+v+","+(v-12)+","+(v-40)+",.7)";x.fillRect(rnd()*w,rnd()*h,2,2);}},true);
  const runAsph=gpCanvasTex(64,64,(x,w,h)=>{x.fillStyle=story?"#cfc3ad":"#5b5c60";x.fillRect(0,0,w,h);for(let i=0;i<500;i++){const v=80+rnd()*40|0;x.fillStyle="rgba("+v+","+v+","+v+",.5)";x.fillRect(rnd()*w,rnd()*h,2,2);}},true);
  const gravelMat=new T.MeshLambertMaterial({map:gravelTex}),runMat=new T.MeshLambertMaterial({map:runAsph});
  const tyreTex=gpCanvasTex(64,64,(x,w,h)=>{x.fillStyle="#1b1b1d";x.fillRect(0,0,w,h);x.fillStyle="rgba(255,255,255,.12)";for(let i=0;i<8;i++)x.fillRect(i*8,0,3,h);});
  const tyreGeo=new T.CylinderGeometry(0.5,0.5,0.72,10),tyreSpots=[];const fencePosts=[],fenceRanges=[],boards=[];
  big.forEach(c=>{const a=c.a-8,b=c.b+10,so=c.sgn;if(!street){ribbonR(a,b,so*(W+2.2),so*runW,c.R<23?gravelMat:runMat,0.0,0.0,0.12);   // gravel trap at the hairpins and chicanes, asphalt run-off elsewhere (street courses: none, the city is right there)
    const stepT=Math.max(1,Math.round(1.05/ds));for(let i=a+2;i<=b-2;i+=stepT){const s=samples[wrapI(i)];const p=s.pos.clone().addScaledVector(s.nor,so*(runW+0.9));const y=groundAt(p.x,p.z);tyreSpots.push([p.x,y,p.z,i]);}
    fenceRanges.push([a,b,so]);for(let i=a;i<=b;i+=Math.round(4/ds)){const s=samples[wrapI(i)];const p=s.pos.clone().addScaledVector(s.nor,so*(runW+1.8));fencePosts.push([p.x,groundAt(p.x,p.z),p.z]);}}
    [100,200,300].forEach(dist=>{const i=c.a-Math.round(dist/ds);const j=wrapI(i);if(Math.abs(kap[j])>1/250||corners.some(o=>o!==c&&j>=o.a-6&&j<=o.b+6)||inStands(j))return;const s=samples[j];const p=s.pos.clone().addScaledVector(s.nor,so*(W+4.4));boards.push([p.x,groundAt(p.x,p.z),p.z,s.tan.clone(),dist]);});});
  if(tyreSpots.length){const tyreIM=new T.InstancedMesh(tyreGeo,new T.MeshLambertMaterial({map:tyreTex}),tyreSpots.length*2);const bands=[0xd81e2a,0xf2f2f2,0x1d5fd1,0xf2f2f2];let q=0;
    tyreSpots.forEach((t,k)=>{for(let r=0;r<2;r++){dummy.position.set(t[0],t[1]+0.36+r*0.72,t[2]);dummy.rotation.set(0,0,0);dummy.scale.set(1,1,1);dummy.updateMatrix();tyreIM.setMatrixAt(q,dummy.matrix);tyreIM.setColorAt(q,gpLin(r?bands[(k>>1)%bands.length]:0x2a2a2e));q++;}});
    if(tyreIM.instanceColor)tyreIM.instanceColor.needsUpdate=true;tyreIM.castShadow=true;scene.add(tyreIM);}
  const fenceTex=gpCanvasTex(64,64,(x,w,h)=>{x.clearRect(0,0,w,h);x.strokeStyle="rgba(200,205,215,.85)";x.lineWidth=1.5;for(let k=0;k<=w;k+=8){x.beginPath();x.moveTo(k,0);x.lineTo(k,h);x.stroke();x.beginPath();x.moveTo(0,k);x.lineTo(w,k);x.stroke();}},true);
  const fenceMat=new T.MeshBasicMaterial({map:fenceTex,transparent:true,alphaTest:0.3,side:T.DoubleSide,depthWrite:false});fenceMat.userData.lin=1;
  fenceRanges.forEach(([a,b,so])=>wallR(a,b,runW+1.8,so,0,4.2,fenceMat,0.6));
  if(fencePosts.length){const fpg=new T.CylinderGeometry(0.07,0.07,4.3,6);fpg.translate(0,2.15,0);const fpIM2=new T.InstancedMesh(fpg,new T.MeshLambertMaterial({color:0x8d939c}),fencePosts.length);fencePosts.forEach((p,k)=>{dummy.position.set(p[0],p[1],p[2]);dummy.rotation.set(0,0,0);dummy.scale.set(1,1,1);dummy.updateMatrix();fpIM2.setMatrixAt(k,dummy.matrix);});scene.add(fpIM2);}
  if(boards.length){const bTex={};if(!atlasMat)[100,200,300].forEach(d=>{bTex[d]=gpCanvasTex(128,128,(x,w,h)=>{x.fillStyle="#f4f4f4";x.fillRect(0,0,w,h);x.fillStyle="#d81e2a";x.fillRect(0,0,w,18);x.fillRect(0,h-18,w,18);x.fillStyle="#111";x.font="900 62px system-ui";x.textAlign="center";x.textBaseline="middle";x.fillText(String(d),w/2,h/2+2);});});
    [100,200,300].forEach(d=>{const list=boards.filter(b=>b[4]===d);if(!list.length)return;const im=new T.InstancedMesh(atlasMat?atlasGeo("b"+d,1.2):new T.PlaneGeometry(1.5,1.5),atlasMat||new T.MeshLambertMaterial({map:bTex[d],side:T.DoubleSide}),list.length),pm=new T.InstancedMesh(new T.BoxGeometry(0.12,1.0,0.12),new T.MeshLambertMaterial({color:0x6b6f78}),list.length);
      list.forEach((b,k)=>{dummy.position.set(b[0],b[1]+1.75,b[2]);dummy.rotation.set(0,0,0);dummy.scale.set(1,1,1);dummy.lookAt(b[0]-b[3].x,b[1]+1.75,b[2]-b[3].z);dummy.updateMatrix();im.setMatrixAt(k,dummy.matrix);dummy.rotation.set(0,0,0);dummy.position.set(b[0],b[1]+0.5,b[2]);dummy.updateMatrix();pm.setMatrixAt(k,dummy.matrix);});im.castShadow=true;scene.add(im);scene.add(pm);});}
  // main straight: concrete walls both sides, pit lane + garages on the pit side, a stepped grandstand with a roof opposite
  const concMat=new T.MeshLambertMaterial({color:story?0xe9e2d2:0xc9c7c0}),concTop=new T.MeshLambertMaterial({color:story?0xd9cfb8:0xb3b1aa});
  const SR0=standRanges[0][0]-M,SR1=standRanges[1][1];   // the straight as one index range crossing zero
  [-1,1].forEach(side=>{wallR(SR0,SR1,W+2.4,side,0,1.05,concMat,0.1);ribbonR(SR0,SR1,side*(W+2.4),side*(W+2.95),concTop,1.05,1.05,0.1);wallR(SR0,SR1,W+2.95,side,0,1.05,concMat,0.1);});
  const pitAsph=new T.MeshLambertMaterial({map:runAsph});ribbonR(SR0,SR1,pitSide*(W+2.95),pitSide*(W+10.5),pitAsph,-0.02,-0.02,0.12);
  const pitLineTex=gpCanvasTex(16,16,(x,w,h)=>{x.fillStyle="#f2f2f2";x.fillRect(0,0,w,h);});ribbonR(SR0,SR1,pitSide*(W+3.3),pitSide*(W+3.5),poMat(new T.MeshBasicMaterial({map:pitLineTex})),0.0,0.0,0.1);
  const garTex=gpCanvasTex(256,128,(x,w,h)=>{x.fillStyle="#d9dbe0";x.fillRect(0,0,w,h);const cols=["#d1121c","#1d5fd1","#f28a1c","#2e9e57","#8e3bd6","#d7dbe0"];for(let k=0;k<4;k++){x.fillStyle="#2a2d33";x.fillRect(k*64+6,40,52,88);x.fillStyle=cols[k%cols.length];x.fillRect(k*64+6,16,52,20);}x.fillStyle="#f4f4f4";x.font="900 14px system-ui";x.textAlign="center";[0,1,2,3].forEach(k=>x.fillText("PIT "+(k+1),k*64+32,31));});
  const crowdTex=gpCanvasTex(256,64,(x,w,h)=>{x.fillStyle="#3a3f4c";x.fillRect(0,0,w,h);x.fillStyle="#2a2e38";x.fillRect(0,0,w,10);x.fillRect(0,h-6,w,6);const cols=["#ff2d87","#ffd23f","#39c0ff","#f4f4f4","#ff7a00","#2e9e57","#d1121c","#7a4bd6"];for(let r=0;r<2;r++)for(let c=0;c<40;c++){x.fillStyle=cols[(rnd()*cols.length)|0];x.beginPath();x.arc(4+c*6.4+rnd()*2,22+r*22+rnd()*3,2.6,0,7);x.fill();x.fillStyle="#f1c9a5";x.beginPath();x.arc(4+c*6.4+rnd()*2,15+r*22,1.7,0,7);x.fill();}},true);crowdTex.repeat.set(10,1);
  const chunks=[];for(let i=SR0+6;i<=SR1-16;i+=Math.round(20/ds))chunks.push(wrapI(i));
  const picPits=!TH&&!!WD.pits,picStand=(!TH||TH==="city")&&!!WD.stand;
  if(chunks.length&&!TH){const garIM=picPits?null:new T.InstancedMesh(new T.BoxGeometry(20,6.5,11),new T.MeshLambertMaterial({map:garTex}),chunks.length),garRoof=picPits?null:new T.InstancedMesh(new T.BoxGeometry(21,0.5,12.5),new T.MeshLambertMaterial({color:0x5a6070}),chunks.length);
    const tiers=picStand?0:5,tierIM=[];for(let t=0;t<tiers;t++)tierIM.push(new T.InstancedMesh(new T.BoxGeometry(20,1.4,2.4),new T.MeshLambertMaterial({map:crowdTex}),chunks.length));
    const roofIM=picStand?null:new T.InstancedMesh(new T.BoxGeometry(20.5,0.4,13.5),new T.MeshLambertMaterial({color:story?0xe8604c:0x3b4150}),chunks.length),poleIM=picStand?null:new T.InstancedMesh(new T.CylinderGeometry(0.16,0.16,10.5,6),new T.MeshLambertMaterial({color:0x9aa0ab}),chunks.length*2);
    chunks.forEach((i,k)=>{const s=samples[wrapI(i+Math.round(10/ds))];const yaw=Math.atan2(s.tan.x,s.tan.z);
      const place=(im,idx,off,y,sx,sy,sz)=>{if(!im)return;const p=s.pos.clone().addScaledVector(s.nor,off);const gy=groundAt(p.x,p.z);dummy.position.set(p.x,gy+y,p.z);dummy.rotation.set(0,yaw,0);dummy.scale.set(sx||1,sy||1,sz||1);dummy.updateMatrix();im.setMatrixAt(idx,dummy.matrix);};
      place(garIM,k,pitSide*(W+16.5),3.25);place(garRoof,k,pitSide*(W+16.5),6.7);
      for(let t=0;t<tiers;t++)place(tierIM[t],k,-pitSide*(W+8.2+t*2.4),0.7+t*1.3);
      place(roofIM,k,-pitSide*(W+13.4),10.6);place(poleIM,k*2,-pitSide*(W+7.2),5.25);place(poleIM,k*2+1,-pitSide*(W+19.6),5.25);});
    [garIM,garRoof,roofIM,poleIM].concat(tierIM).forEach(m=>{if(!m)return;m.castShadow=true;m.receiveShadow=true;scene.add(m);});}
  // photo buildings: a flat picture facing the track with a dark block behind it for depth, repeated along the straight
  const bldBox=new T.MeshLambertMaterial({color:story?0xd9cfb8:0x3a3e48});
  const alongStraight=(i0,i1,lenM,gapM,mk)=>{const step=Math.round((lenM+gapM)/ds);let k=0;for(let i=i0;i+Math.round(lenM/ds)<=i1;i+=step){mk(samples[wrapI(i+Math.round(lenM/2/ds))],k++);}};
  if(picPits){const PT=GP_WORLD.pits,ph=PT.hgt,pw=ph*PT.w/PT.h,pm=picMat(WD.pits);
    alongStraight(SR0+8,SR1-10,pw,8,(s,k)=>{const p=s.pos.clone().addScaledVector(s.nor,pitSide*(W+16.5));const gy=groundAt(p.x,p.z);const m=new T.Mesh(new T.PlaneGeometry(pw,ph),pm);m.position.set(p.x,gy+ph/2-0.1,p.z);m.lookAt(p.x-s.nor.x*pitSide*10,gy+ph/2-0.1,p.z-s.nor.z*pitSide*10);scene.add(m);
      const bx=new T.Mesh(new T.BoxGeometry(13,ph*0.92,pw*0.985),bldBox);bx.position.set(p.x+s.nor.x*pitSide*6.6,gy+ph*0.46-0.1,p.z+s.nor.z*pitSide*6.6);bx.rotation.y=Math.atan2(s.tan.x,s.tan.z);bx.castShadow=true;bx.receiveShadow=true;scene.add(bx);});}
  if(picStand){const ST=GP_WORLD.stand,sh=ST.hgt,sw=sh*ST.w/ST.h,sm=picMat(WD.stand);
    alongStraight(SR0+8,SR1-10,sw,3,(s,k)=>{const p=s.pos.clone().addScaledVector(s.nor,-pitSide*(W+12.5));const gy=groundAt(p.x,p.z);const m=new T.Mesh(new T.PlaneGeometry(sw,sh),sm);m.position.set(p.x,gy+sh/2-0.1,p.z);m.lookAt(p.x+s.nor.x*pitSide*10,gy+sh/2-0.1,p.z+s.nor.z*pitSide*10);if(k%2)m.scale.x=-1;scene.add(m);});}   // every other stand mirrored: pairs read as one long symmetric tribune
  // crowd slopes behind the catch fence at the hairpins, photo tyre walls at the other big corners, ad boards along the straights
  const BB2=[];
  if(WD.crowd&&!street){const cm=picMat(WD.crowd,{alphaTest:0.4}),CR=GP_WORLD.crowd;big.forEach(c=>{if(c.R>=23)return;const so=c.sgn,a=c.a-4,b=c.b+6;ribbonR(a,b,so*(runW+3.4),so*(runW+9.8),cm,1.2,5.6,1/CR.mPerU,true,7.8/(CR.mPerU*CR.h/CR.w));wallR(a,b,runW+3.4,so,0,1.25,concMat,0.1);});}
  if(atlasMat&&!TH){big.forEach(c=>{if(c.R<23)return;const so=c.sgn;for(let i=c.a-6;i<=c.b+8;i+=Math.round(4.6/ds)){const s=samples[wrapI(i)];const p=s.pos.clone().addScaledVector(s.nor,so*(runW+3.2));BB2.push(["tyres",p.x,groundAt(p.x,p.z),p.z,1,(i>>2)%2===0]);}});
    const ads=[];for(let i=18;i<M;i+=Math.round(52/ds)){if(busy(i)||Math.abs(kap[i])>1/100||Math.abs(i-trapI)<14)continue;const s=samples[i];const side=(ads.length%2)?-1:1;const p=s.pos.clone().addScaledVector(s.nor,side*(W+5.4));const y=groundAt(p.x,p.z);if(y>0.8)ads.push([p.x,y,p.z,side,s.nor.clone()]);}
    ["ad1","ad2","ad3"].forEach((cell,ci)=>{const list=ads.filter((a,k)=>k%3===ci);if(!list.length)return;const im=new T.InstancedMesh(atlasGeo(cell,2.6),atlasMat,list.length);
      list.forEach((a,k)=>{dummy.position.set(a[0],a[1]+1.3,a[2]);dummy.rotation.set(0,0,0);dummy.scale.set(1,1,1);dummy.lookAt(a[0]-a[4].x*a[3],a[1]+1.3,a[2]-a[4].z*a[3]);dummy.updateMatrix();im.setMatrixAt(k,dummy.matrix);});scene.add(im);});}
  // the start/finish gantry: steel truss over the line, five start lights facing the grid, a sign over the track
  const steel=new T.MeshStandardMaterial({color:0x3a3d44,roughness:0.5,metalness:0.6}),gantry=new T.Group(),gw=W+2.0;
  const lights=[],covers=[];let screenTex=null,screenCv=null;
  if(WD.gantry){const GA=GP_WORLD.gantry,gwM=2*(W+3.6)/(GA.posts[1]-GA.posts[0]),ghM=gwM*GA.h/GA.w;
    const gpl=new T.Mesh(new T.PlaneGeometry(gwM,ghM),picMat(WD.gantry));gpl.rotation.y=Math.PI;gpl.position.y=ghM/2-0.05;gantry.add(gpl);   // turned to face the grid
    GA.lights.forEach(([lx,ly,lr])=>{const cm=new T.MeshBasicMaterial({color:0x1a1214});cm.userData.lin=1;const c=new T.Mesh(new T.CircleGeometry(lr*gwM*1.25,18),cm);c.position.set((lx-0.5)*gwM,(0.5-ly)*ghM,0.04);c.visible=false;gpl.add(c);covers.push(c);});   // a cover hides a lamp once it has gone out
    screenCv=document.createElement("canvas");screenCv.width=512;screenCv.height=128;screenTex=new T.CanvasTexture(screenCv);if(T.sRGBEncoding)screenTex.encoding=T.sRGBEncoding;
    const [sx,sy,sw,sh]=GA.screen;const sm=new T.MeshBasicMaterial({map:screenTex});sm.toneMapped=false;sm.userData.lin=1;const scr=new T.Mesh(new T.PlaneGeometry(sw*gwM*0.98,sh*ghM*0.94),sm);scr.position.set((sx+sw/2-0.5)*gwM,(0.5-(sy+sh/2))*ghM,0.04);gpl.add(scr);}
  else [-1,1].forEach(sd=>{const pl=new T.Mesh(new T.BoxGeometry(0.7,8.2,0.7),steel);pl.position.set(sd*gw,4.1,0);pl.castShadow=true;gantry.add(pl);});
  if(!WD.gantry){const beam=new T.Mesh(new T.BoxGeometry(gw*2+0.7,1.5,1.0),steel);beam.position.set(0,8.0,0);beam.castShadow=true;gantry.add(beam);
    const signMat=new T.MeshBasicMaterial({map:gpTextTex("GRAND FABLE HORIZON GP",["#ff2d87","#ff7a00"],"#fff",1024,160,92)});signMat.userData.lin=1;
    const signF=new T.Mesh(new T.PlaneGeometry(gw*2+0.4,1.3),signMat);signF.position.set(0,8.0,-0.52);signF.rotation.y=Math.PI;gantry.add(signF);
    const signB=new T.Mesh(new T.PlaneGeometry(gw*2+0.4,1.3),signMat);signB.position.set(0,8.0,0.52);gantry.add(signB);
    const lightPanel=new T.Mesh(new T.BoxGeometry(4.2,1.0,0.3),new T.MeshLambertMaterial({color:0x111216}));lightPanel.position.set(0,6.7,0.1);gantry.add(lightPanel);
    for(let k=0;k<5;k++){const lm=new T.MeshBasicMaterial({color:0xff2020});lm.userData.lin=1;const lb=new T.Mesh(new T.SphereGeometry(0.3,12,8),lm);lb.position.set(-1.6+k*0.8,6.7,0.3);gantry.add(lb);lights.push(lm);}}
  gantry.position.copy(sStart);gantry.lookAt(sStart.clone().add(s0.tan));scene.add(gantry);
  // start lights: all five red on the grid, going out one by one through the count, all out at GO
  const setLights=on=>{const lit=k=>k>=1&&k<=on;lights.forEach((m,k)=>m.color.setHex(lit(k)?0xff2020:0x3a0a0a));covers.forEach((c,k)=>{c.visible=!lit(k);});};setLights(0);   // the three middle lamps: 3 lit on "3", one goes out per beat, all out on GO
  const setScreen=txt=>{if(!screenCv)return;const x=screenCv.getContext("2d"),w=512,h=128;const g=x.createLinearGradient(0,0,w,0);g.addColorStop(0,"#ff2d87");g.addColorStop(1,"#ff7a00");x.fillStyle=g;x.fillRect(0,0,w,h);
    x.fillStyle="rgba(0,0,0,.35)";for(let i=0;i<32;i++){if(i%2)x.fillRect(i*16,0,16,10);else x.fillRect(i*16,h-10,16,10);}
    x.fillStyle="#fff";x.textAlign="center";x.textBaseline="middle";x.shadowColor="rgba(0,0,0,.5)";x.shadowBlur=6;let fs=60;x.font="italic 900 "+fs+"px system-ui";const tw=x.measureText(txt).width;if(tw>w-40){fs=Math.floor(fs*(w-40)/tw);x.font="italic 900 "+fs+"px system-ui";}x.fillText(txt,w/2,h/2+3);screenTex.needsUpdate=true;};setScreen("GRAND FABLE HORIZON GP");
  // ---- lakeside town: tiled hipped roofs, white and timber walls ----
  const winTex=gpCanvasTex(128,128,(x,w,h)=>{x.fillStyle="#fff";x.fillRect(0,0,w,h);x.fillStyle="#2c3a4a";[[20,30],[76,30],[20,78],[76,78]].forEach(q=>{x.fillRect(q[0],q[1],32,30);});x.strokeStyle="#e9e2d3";x.lineWidth=3;[[20,30],[76,30],[20,78],[76,78]].forEach(q=>{x.beginPath();x.moveTo(q[0]+16,q[1]);x.lineTo(q[0]+16,q[1]+30);x.stroke();x.beginPath();x.moveTo(q[0],q[1]+15);x.lineTo(q[0]+32,q[1]+15);x.stroke();});x.fillStyle="#6b4a2e";x.fillRect(50,100,26,28);});
  const wallCols=story?[0xf7f0e1,0xf4e3c3,0xe9f0ee,0xf6d9cf,0xdfe8f5]:[0xf3efe6,0xe8dcc6,0xd9d4c8,0x8a6a48,0xf0ece2],roofCols=story?[0xd9624a,0xc9553f,0xe07a55,0x6d8fb3]:[0x3f4756,0x4a5468,0x2f3542,0x5a5f6b,0x6b4a3a];
  const houses=[];const addHouse=(x,z,ang,sz,hh)=>{const y=groundAt(x,z);if(y<0.8||lakeF(x,z)>0.05||nearest(x,z)[1]<W+13||nearBld(x,z))return;houses.push([x,y,z,sz,hh,ang]);};
  if((C.town||C.city)&&(!bbOn||C.city>0.5)){for(let i=0;i<M;i+=6){if(rnd()<0.45||busy(i))continue;const s=samples[i];const side=rnd()<0.5?-1:1;const p=s.pos.clone().addScaledVector(s.nor,side*(W+(bbOn?22:12)+rnd()*(bbOn?28:22)));addHouse(p.x,p.z,Math.atan2(s.tan.x,s.tan.z)+(rnd()-0.5)*0.3,3+rnd()*2.4,2.6+rnd()*2.2);}}
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
  const BB3=[];if(!TH){const spots=[],lineSpots=[];
  const lineStep=C.tree==="cedar"?3:(C.tree==="cherry"?8:7),lineOff=C.tree==="cedar"?5.5:8;
  for(let i=0;i<M;i+=lineStep){if(busy(i))continue;const s=samples[i];[-1,1].forEach(side=>{if(rnd()<(C.tree==="cedar"?0.12:0.3)||runOut[wrapI(i-12)]===side||runOut[wrapI(i+12)]===side)return;const p=s.pos.clone().addScaledVector(s.nor,side*(W+lineOff+rnd()*2.5));const y=groundAt(p.x,p.z);if(y<0.8||nearest(p.x,p.z)[1]<W+4||nearBld(p.x,p.z))return;lineSpots.push([p.x,y,p.z,0.85+rnd()*0.5,rnd()*6.28,rnd()]);});}
  for(let i=0;i<M;i+=5){if(inStands(i))continue;const s=samples[i];for(let r=0;r<3;r++){if(r&&rnd()<0.45)continue;const side=rnd()<0.5?-1:1;const p=s.pos.clone().addScaledVector(s.nor,side*(W+16+r*16+rnd()*16));const y=groundAt(p.x,p.z);if(y<0.8||lakeF(p.x,p.z)>0.05||nearest(p.x,p.z)[1]<runW+4||nearBld(p.x,p.z))continue;if(houses.some(h=>Math.abs(h[0]-p.x)<5&&Math.abs(h[2]-p.z)<5))continue;spots.push([p.x,y,p.z,0.8+rnd()*0.7,rnd()*6.28,rnd()]);}}
  for(let k=0;k<420;k++){const a=rnd()*6.28,r=150+rnd()*520;const x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r;if(nearest(x,z)[1]<W+22||nearBld(x,z))continue;const y=groundAt(x,z);if(y<0.8||lakeF(x,z)>0.05)continue;spots.push([x,y,z,0.9+rnd()*0.9,rnd()*6.28,rnd()]);}
  const all=lineSpots.concat(spots);
  if(bbOn&&WD.trees){const cf=C.tree==="cherry"?0.85:(C.tree==="mixed"?0.4:0.08),mf=C.tree==="cedar"?0.06:0.14;   // ChatGPT tree sheet: three cherries, two cedars, a maple
    all.forEach(s=>{const r=s[5],v=(r*131)%1;let type;if(r<cf)type=v<0.3?"cherryS":(v<0.68?"cherryM":"cherryL");else if(v<mf)type="maple";else type=v<0.5+mf/2?"cedarA":"cedarB";
      const sc=(type[0]==="c"&&type[1]==="h"?0.95:1)*s[3]*(0.9+(r*7%1)*0.25);BB3.push([type,s[0],s[1],s[2],sc,s[4]>3.14]);});all.length=0;}
  else if(bbOn){const cf=C.tree==="cherry"?0.85:(C.tree==="mixed"?0.4:0.08);all.forEach(s=>{const cherryT=s[5]<cf;bbAdd(cherryT?"cherry":"cedar",s[0],s[1],s[2],(cherryT?0.95:1)*s[3]*(0.9+(s[5]*7%1)*0.25),s[4]>3.14);});all.length=0;}
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
  trIM.count=ti;trIM.castShadow=true;scene.add(trIM);}
  // ---- street / themed courses: sidewalks, buildings, shops, lights, crossings, tunnel, bridges, landmarks, palms ----
  const TW=TH?gpThemeWorld({T,scene,C,samples,M,W,ds,nearest,groundAt,dummy,rnd,kap,ribbonR,wallR,wallS,inStands,poMat,shared:shared0,cx,cz,lakeF:LK?lakeF:null}):null;
  // ---- stone lanterns (cherry route) / street lights (city route) ----
  const lamps=[];if(C.tree==="cherry"||C.city>0.5){for(let i=10;i<M;i+=18){if(busy(i))continue;const s=samples[i];[-1,1].forEach(side=>{const p=s.pos.clone().addScaledVector(s.nor,side*(W+4.8));const y=groundAt(p.x,p.z);if(y>0.8)lamps.push([p.x,y,p.z]);});}}
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
  const chev=[];for(let i=0;i<M;i+=6){if(busy(i))continue;const a=samples[i],b=samples[(i+10)%M];const ang=Math.acos(Math.max(-1,Math.min(1,a.tan.x*b.tan.x+a.tan.z*b.tan.z)));if(ang<0.2)continue;const left=a.tan.clone().cross(b.tan).y>0;const side=left?1:-1;
    const p=a.pos.clone().addScaledVector(a.nor,side*(W+5));chev.push([p.x,groundAt(p.x,p.z),p.z,a.tan.clone(),left]);}
  if(chev.length){const bIM=new T.InstancedMesh(new T.PlaneGeometry(1.3,0.95),new T.MeshStandardMaterial({map:chevTex,roughness:0.5,side:T.DoubleSide}),chev.length);const pIM=new T.InstancedMesh(new T.CylinderGeometry(0.05,0.05,1.3,5),poleMat,chev.length);
    chev.forEach((c,i)=>{dummy.position.set(c[0],c[1]+1.55,c[2]);dummy.rotation.set(0,0,0);dummy.scale.set(1,1,1);dummy.lookAt(new T.Vector3(c[0]-c[3].x,c[1]+1.55,c[2]-c[3].z));dummy.scale.set(c[4]?1:-1,1,1);dummy.updateMatrix();bIM.setMatrixAt(i,dummy.matrix);
      dummy.scale.set(1,1,1);dummy.rotation.set(0,0,0);dummy.position.set(c[0],c[1]+0.65,c[2]);dummy.updateMatrix();pIM.setMatrixAt(i,dummy.matrix);});bIM.castShadow=true;scene.add(bIM);scene.add(pIM);}
  // ---- glowing red checkpoint gates (race mode, Horizon look): three neon arches per lap on one instanced, additive plane ----
  let gates=null;if(gpMode()==="race"&&!story){const gTex=gpCanvasTex(512,256,(x,w,h)=>{x.clearRect(0,0,w,h);const fr=(lw,blur,col)=>{x.save();x.shadowColor="#ff2a1a";x.shadowBlur=blur;x.strokeStyle=col;x.lineWidth=lw;x.lineJoin="round";x.beginPath();x.moveTo(26,h);x.lineTo(26,40);x.quadraticCurveTo(26,22,44,22);x.lineTo(w-44,22);x.quadraticCurveTo(w-26,22,w-26,40);x.lineTo(w-26,h);x.stroke();x.restore();};
      fr(26,30,"rgba(255,40,20,0.55)");fr(12,18,"rgba(255,60,30,0.95)");fr(4,6,"rgba(255,220,200,1)");});
    const gMat=new T.MeshBasicMaterial({map:gTex,transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,opacity:0.9});gMat.toneMapped=false;gMat.userData.lin=1;
    const spots=[];[0.3,0.55,0.8].forEach(f=>{let i=Math.floor(M*f);for(let k=0;k<40&&(busy(i)||Math.abs(i-trapI)<14);k++)i=(i+3)%M;spots.push(i);});
    const gw=W*2+3,gh=gw*0.5,gIM=new T.InstancedMesh(new T.PlaneGeometry(gw,gh),gMat,spots.length);
    spots.forEach((i,k)=>{const sa=samples[i];dummy.position.set(sa.pos.x,sa.pos.y+gh/2-0.05,sa.pos.z);dummy.rotation.set(0,Math.atan2(sa.tan.x,sa.tan.z),0);dummy.scale.set(1,1,1);dummy.updateMatrix();gIM.setMatrixAt(k,dummy.matrix);});
    gIM.frustumCulled=false;scene.add(gIM);gates={mat:gMat,ts:spots.map(i=>i/M),flash:0};}
  if(band){const h0=hdgMean(-26,12),dh=gpWrapAng(hdgMean(trapI-25,trapI+25)-h0);band.rotation.y=(Math.abs(dh)<1.05?h0+dh*0.5:h0)-Math.PI;}   // Fuji sits ahead on the start straight and on the main straight
  if(gpMode()==="race"){const s=samples[trapI];const p=s.pos.clone().addScaledVector(s.nor,W+5);const y=groundAt(p.x,p.z);const pole=new T.Mesh(new T.CylinderGeometry(0.12,0.14,4.4,8),poleMat);pole.position.set(p.x,y+2.2,p.z);pole.castShadow=true;scene.add(pole);
    const sign=new T.Mesh(new T.BoxGeometry(3.6,1.3,0.2),new T.MeshStandardMaterial({map:gpTextTex("SPEED TRAP",["#0a4dcc","#0a2a88"],"#fff",512,180,78),roughness:0.4}));sign.position.set(p.x,y+4.6,p.z);sign.lookAt(sign.position.clone().sub(s.tan));sign.castShadow=true;scene.add(sign);
    const cam=new T.Mesh(new T.BoxGeometry(0.5,0.4,0.7),new T.MeshStandardMaterial({color:0x222222,roughness:0.4}));cam.position.set(p.x,y+3.7,p.z);scene.add(cam);}
  if(bbOn){for(let i=36;i<M;i+=30){if(busy(i)||Math.abs(i-trapI)<16)continue;const s=samples[i];const side=(i/30)%2?1:-1;const p=s.pos.clone().addScaledVector(s.nor,side*(W+5));const y=groundAt(p.x,p.z);if(y>0.8)bbAdd("banner",p.x,y,p.z,1,side>0);}
    [0.42,0.74].forEach((f,k)=>{const s=samples[Math.floor(M*f)];const side=k?-1:1;const p=s.pos.clone().addScaledVector(s.nor,side*(W+15));const y=groundAt(p.x,p.z);if(y>0.8&&lakeF(p.x,p.z)<0.05)bbAdd("torii",p.x,y,p.z,1,false);});
    gpBillboards(T,scene,WD.props,BB,new T.Color(hazeHex),scene.fog.near,scene.fog.far,TINT,shared0.blob);}
  if(BB2.length)gpBillboards(T,scene,WD.boards,BB2,new T.Color(hazeHex),scene.fog.near,scene.fog.far,TINT,shared0.blob,GP_WORLD.boards);
  if(BB3.length)gpBillboards(T,scene,WD.trees,BB3,new T.Color(hazeHex),scene.fog.near,scene.fog.far,TINT,shared0.blob,GP_WORLD.trees);
  // ---- distant ridges (lower in front of Fuji), clouds, sun glare ----
  const hillMat=new T.MeshStandardMaterial({color:new T.Color(L.hill),roughness:1,flatShading:true});
  const fujiAng=Math.atan2(FJ[1],FJ[0]);
  const nR=bandOn?0:(C.ridges!=null?C.ridges:20);for(let i=0;i<nR;i++){const a=i/nR*Math.PI*2+rnd()*0.25,r=680+rnd()*160;let da=Math.abs(a-fujiAng);da=Math.min(da,Math.PI*2-da);const inFront=da<0.55;const h=new T.Mesh(new T.IcosahedronGeometry(1,2),hillMat);h.position.set(cx+Math.cos(a)*r,-16,cz+Math.sin(a)*r);h.scale.set(150+rnd()*110,(inFront?34:(C.tree==="cedar"?95:62))+rnd()*50,150+rnd()*110);scene.add(h);}
  const cloudTex=gpCanvasTex(256,128,(x,w,h)=>{[[70,80,40],[120,60,52],[180,78,40],[100,92,34],[150,94,36]].forEach(c=>{const g=x.createRadialGradient(c[0],c[1]-c[2]*0.3,c[2]*0.1,c[0],c[1],c[2]);g.addColorStop(0,"rgba(255,255,255,1)");g.addColorStop(0.7,"rgba(250,246,240,.85)");g.addColorStop(1,"rgba(240,236,232,0)");x.fillStyle=g;x.beginPath();x.arc(c[0],c[1],c[2],0,7);x.fill();});});
  for(let i=0;i<(bandOn?7:16);i++){const sp=new T.Sprite(new T.SpriteMaterial({map:cloudTex,transparent:true,fog:false,opacity:bandOn?0.6:0.8,depthWrite:false}));const s=90+rnd()*90;sp.scale.set(s,s/2.2,1);sp.position.set(cx+(rnd()-0.5)*2200,170+rnd()*120,cz+(rnd()-0.5)*2200);scene.add(sp);}
  for(let i=0;i<(bandOn?0:5);i++){const sp=new T.Sprite(new T.SpriteMaterial({map:cloudTex,transparent:true,fog:false,opacity:0.75,depthWrite:false}));const s=160+rnd()*120;sp.scale.set(s,s/3,1);sp.position.set(fx+(rnd()-0.5)*700,FH*0.3+rnd()*FH*0.18-6,fz+120+rnd()*300);scene.add(sp);}
  const glare=new T.Sprite(new T.SpriteMaterial({map:gpSoftDot(),color:new T.Color(L.glow),transparent:true,opacity:story?0.55:0.2,blending:T.AdditiveBlending,depthWrite:false,fog:false}));glare.material.userData.lin=1;glare.scale.set(bandOn?100:140,bandOn?100:140,1);scene.add(glare);
  // ---- cars on the grid ----
  const shared=shared0;shared.flameTex=WD.flame||null;
  if(!story){const ct=new T.Color(1,1,1).lerp(gpLin(L.sun),0.3).multiply(TINT);ct.multiplyScalar(1/Math.max(ct.r,ct.g,ct.b));shared.carTint=ct;}   // sunset rim/tint for the photo cars, matched to the route light
  const others=GP_CARS.filter(c=>c.id!==myCar.id);
  const pname=(P&&typeof P.name==="string"&&P.name.trim())?P.name.trim().split(/\s+/)[0]:"You";
  const racers=[{n:pname,car:myCar,css:myPaint,player:true}].concat(gpMode()==="race"?others.slice(0,4).map((c,i)=>({n:GP_DRIVERS[i%GP_DRIVERS.length],car:c,css:c.paint,player:false})):[]);
  const pics=story?{}:(window._gpPics||{});   // the storybook look keeps the drawn 3D cars (the ink filter buries a photo)
  const glbs=story?{}:(window._gpGlb||{});   // real 3D models (GLB) win over the photo sprites when they loaded
  const pace=gpPaceMul();const karts=racers.map((r,i)=>{const m=(GP_GLB[r.car.id]&&glbs[r.car.id])?gpBuildGlbCar(T,r.car,glbs[r.car.id],gpGlbPaintFor(r.car,r.player),shared):(GP_PICS[r.car.id]&&pics[r.car.id])?gpBuildPicCar(T,r.car,pics[r.car.id],shared):gpBuildCar(T,r.car,r.css,shared);scene.add(m.g);const st=gpStats(r.car);st.max*=pace;st.accel*=0.75;if(r.player&&gpMode()==="race"){const U=gpUpState();st.max*=1+0.02*U.speed;st.accel*=1+0.06*U.launch;gpUpFit(T,m,true,shared);}
    return{racer:r,player:r.player,...m,...st,t:0,x:0,px:0,speed:0,lap:0,spin:0,drift:0,off:0,hop:0,roll:0,pitch:0,steerVis:0,st1:0,steerIn:0,sv:0,dHold:0,wasBrake:false,lockT:0,gasT:0,wallT:0,knock:0,headA:0,headV:0,leanT:0,liftT:0,chatter:0,yaw:null,lastSpeed:0,wheelPhase:0,wheelRadius:m.S.radR,travel:0,skidD:0,ahead:true,started:false,pos:new T.Vector3(),draft:false,brakeOn:false,aiSkill:(r.player?1:0.95+(i%3)*0.025+r.car.handle*0.006)*(r.player||gpPace()!=="gentle"?1:0.97)};});
  const rows=karts.length,pitch=8/(len/M);karts.forEach((k,i)=>{const row=k.player?rows-1:i-1;k.t=((M-5-row*pitch)/M)%1;k.x=(row%2?0.4:-0.4)*(rows>1?1:0);k.px=k.x;});
  const TR=(TH&&gpTrafficOn()&&!story)?gpTrafficBuild(T,scene,window._gpTraffic,C,karts,len,karts.find(k=>k.player),shared0):null;   // traffic cars (street + coast courses, Options: traffic on)
  if(gpMode()==="race"){const boxTex=gpCanvasTex(128,256,(x,w,h)=>{x.clearRect(0,0,w,h);x.strokeStyle="rgba(255,255,255,.9)";x.lineWidth=10;x.strokeRect(6,6,w-12,h-12);});
    const boxMat=new T.MeshBasicMaterial({map:boxTex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});boxMat.userData.lin=1;const boxGeo=new T.PlaneGeometry(2.8,5.8).rotateX(-Math.PI/2);
    for(let slot=0;slot<10;slot++){const t=((M-5-slot*pitch)/M)%1,x=(slot%2?0.4:-0.4);const p=curve.getPointAt(t),tn=curve.getTangentAt(t).normalize(),nn=new T.Vector3(-tn.z,0,tn.x).normalize();p.addScaledVector(nn,x*(W-1.2));const bx=new T.Mesh(boxGeo,boxMat);bx.position.set(p.x,p.y+0.06,p.z);bx.rotation.y=Math.atan2(tn.x,tn.z);scene.add(bx);}
    const lineTex=gpCanvasTex(512,32,(x,w,h)=>{for(let i=0;i<32;i++)for(let j=0;j<2;j++){x.fillStyle=(i+j)%2?"#15161a":"#e6e6e2";x.fillRect(i*16,j*16,16,16);}});
    const sl=new T.Mesh(new T.PlaneGeometry(W*2-0.4,1.0).rotateX(-Math.PI/2),new T.MeshBasicMaterial({map:lineTex,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));sl.material.userData.lin=1;sl.position.set(sStart.x,sStart.y+0.06,sStart.z);sl.rotation.y=Math.atan2(s0.tan.x,s0.tan.z);scene.add(sl);}
  // ---- music notes to collect (free drive) ----
  const notes=[];if(gpMode()==="free"){const noteCols=["#ff2d87","#ffb000","#2fd3c3","#4f8cff","#c27bff"];const noteTex=noteCols.map(c=>gpCanvasTex(128,128,(x,w,h)=>{x.fillStyle="rgba(255,255,255,.95)";x.beginPath();x.arc(64,64,54,0,7);x.fill();x.lineWidth=7;x.strokeStyle=c;x.stroke();x.fillStyle=c;x.font="bold 86px serif";x.textAlign="center";x.textBaseline="middle";x.fillText("♪",60,70);}));
    for(let i=24;i<M-10;i+=19){const k=notes.length;const sp=new T.Sprite(new T.SpriteMaterial({map:noteTex[k%noteTex.length],transparent:true,depthWrite:false}));sp.scale.set(2,2,1);const t=i/M,x=Math.max(-0.7,Math.min(0.7,Math.sin(i*0.37)*0.62));
      const pp=curve.getPointAt(t),tn=curve.getTangentAt(t).normalize(),nn=new T.Vector3(-tn.z,0,tn.x).normalize();pp.addScaledVector(nn,x*(W-1.2));sp.position.set(pp.x,pp.y+1.5,pp.z);scene.add(sp);notes.push({t,x,mesh:sp,alive:true,col:noteCols[k%noteCols.length],k,y:pp.y+1.5});}}
  // ---- particles: tyre smoke, dust, sparks, cherry petals; skid marks ----
  const smoke=gpSmoke(T,scene,150,WD.smoke||gpSoftDot(),scene.fog),dust=gpParticles(T,scene,120,1.6,false,0.4),sparks=gpParticles(T,scene,120,0.6,true);
  const petals=C.tree==="cherry"?gpParticles(T,scene,160,WD.petal?0.42:0.32,false,0.9,WD.petal||null):null;
  const skidGeo=new T.PlaneGeometry(0.18,1.0);skidGeo.rotateX(-Math.PI/2);const SK=700,skidLife=new Float32Array(SK),skidFade=new T.InstancedBufferAttribute(new Float32Array(SK),1);skidGeo.setAttribute("aFade",skidFade);
  const skidMat=new T.ShaderMaterial({transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2,
    vertexShader:"attribute float aFade;varying float vFade;varying vec2 vUv;void main(){vFade=aFade;vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.0);}",
    fragmentShader:"varying float vFade;varying vec2 vUv;void main(){float side=smoothstep(0.0,0.16,min(vUv.x,1.0-vUv.x));float ends=smoothstep(0.0,0.08,min(vUv.y,1.0-vUv.y));gl_FragColor=vec4(vec3(0.01),0.48*vFade*side*ends);}"});skidMat.toneMapped=false;
  const skids=new T.InstancedMesh(skidGeo,skidMat,SK);skids.material.userData.lin=1;
  dummy.position.set(0,-999,0);dummy.rotation.set(0,0,0);dummy.scale.set(0.0001,0.0001,0.0001);dummy.updateMatrix();for(let i=0;i<SK;i++)skids.setMatrixAt(i,dummy.matrix);skids.frustumCulled=false;scene.add(skids);
  // convert plain colours from sRGB to linear once (colours look right with sRGB output + tone mapping)
  const seen=new Set();scene.traverse(o=>{if(o===sky||o===fuji)return;const ms=Array.isArray(o.material)?o.material:(o.material?[o.material]:[]);ms.forEach(m=>{if(!m||seen.has(m)||m.isShaderMaterial||m.isPointsMaterial)return;seen.add(m);if(m.userData.lin)return;m.userData.lin=1;
    if(m.color&&!(o.isInstancedMesh&&o.instanceColor)&&!m.map)m.color.convertSRGBToLinear();if(m.emissive&&!m.emissiveMap)m.emissive.convertSRGBToLinear();});});
  R3={T,C,renderer,scene,camera,curve,samples,M,W,len,karts,me:karts.find(k=>k.player),keys:{},touchDir:0,brake:false,gas:false,drift:false,autoGas:gpAuto(),kap,vProf,lineX,corners,big,grip:GRIP,t0:performance.now(),time:0,countdown:3.8,phase:"intro",cdReq:false,cdLog:[],frameN:0,goAt:0,done:false,raf:null,last:performance.now(),camPos:new T.Vector3(),msgT:0,place:5,board:[],
    sun,sky,band,glare,sunDir,sunOff:sunDir.clone().multiplyScalar(170),envRT,smoke,dust,sparks,petals,skids,skidLife,skidFade,skN:0,dummy,setLights,setScreen,screenTxt:"",fov:60,pr:pr0,fpsT:0,fpsN:0,fps:0,lowT:0,shadowsOn:true,tmpV:new T.Vector3(),tmpV2:new T.Vector3(),tmpV3:new T.Vector3(),tmpV4:new T.Vector3(),camYaw:null,teleV:new T.Vector3(),teleShadow:new T.Vector3(),teleSprite:new T.Vector3(),UP,story,
    gates,trapT:trapI/M,trapBest:0,gear:1,tachT:0,post,mode:gpMode(),notes,notesGot:0,notesTotal:notes.length*C.laps,song:[],lastDeg:4,songDirty:1,water,waterTex,fx:$("gp3Fx"),fxW:16,fxH:9,sk:{chain:0,mult:1,total:0,idle:0,list:[],dirty:1,clean:0,cool:0},bumpT:9,upGrip:gpMode()==="race"?1+0.04*gpUpState().tyres:1,cLog:null,sunTint:new T.Color(L.sun).lerp(new T.Color(1,1,1),0.35),skyTint:new T.Color(L.mid).lerp(new T.Color(L.hor),0.4),traffic:TR,tw:TW,splash:TH==="coast"?gpParticles(T,scene,140,0.9,false,0.55):null};R3.bodies=R3.karts.concat(TR?TR.cars:[]);
  window.__gp={fps:0,pr:pr0,shadows:true,playerWheelPhase:0,wheelPhase:0,playerSpeed:0,speed:0,wheelRadius:R3.me.wheelRadius,cameraFov:60,cameraOffsetFromCar:0,cameraOffset:0,cameraOffsetVector:{x:0,y:0,z:0},playerShadowWorldY:0,shadowY:0,bodyRoll:0,spriteBottomY:R3.me.pos.y,smokeCount:0,rendererCalls:0,renderCalls:0,wheelPatchDrawCalls:0,wheelPatchState:R3.me.pic?"sharp":"3d",wheelPatchVisible:false,wheelPatchFrame:R3.me.pic?R3.me.pic.frame:null,wheelPatchKind:R3.me.pic&&R3.me.pic.wheelPatch?R3.me.pic.wheelPatch.kind:"3d",phys:{slipDeg:0,steerIn:0,sv:0,drift:0,x:0,speed:0},cam:{}};
  // keyboard
  R3.kd=e=>{if(!R3)return;const k=e.key.toLowerCase();GPA.init();if(k==="escape"){renderCircuits();return;}if(k==="m"){gpToggleMute();return;}if(k==="c"){gpCycleCam();return;}R3.keys[k]=true;if(["arrowleft","arrowright","arrowdown","arrowup","shift"," "].includes(k))e.preventDefault();};
  R3.ku=e=>{if(!R3)return;R3.keys[e.key.toLowerCase()]=false;};
  window.addEventListener("keydown",R3.kd);window.addEventListener("keyup",R3.ku);
  // touch: pointer events with capture so one thumb can steer while the other holds a pedal.
  // Left half = steering (left or right of the gap between the arrow pads; slide across to switch); the two right-side pedals have their own independent pointers.
  const ptr={steer:new Map(),gas:new Set(),brake:new Set()};
  const syncCtl=()=>{if(!R3)return;let d=0;for(const v of ptr.steer.values())d=v;R3.touchDir=d;R3.gas=ptr.gas.size>0;R3.brake=ptr.brake.size>0;
    const tog=(id,on)=>{const e=$(id);if(e)e.classList.toggle("on",!!on);};tog("rcL",d<0);tog("rcR",d>0);tog("rcG",R3.gas);tog("rcB",R3.brake);};
  const guard=el=>{el.addEventListener("touchstart",ev=>{if(ev.cancelable)ev.preventDefault();},{passive:false});el.addEventListener("contextmenu",ev=>ev.preventDefault());el.addEventListener("dragstart",ev=>ev.preventDefault());};
  const hold=(el,set)=>{if(!el)return;guard(el);el.addEventListener("pointerdown",ev=>{ev.preventDefault();GPA.init();if(!R3)return;try{el.setPointerCapture(ev.pointerId);}catch(e){}set.add(ev.pointerId);syncCtl();});
    ["pointerup","pointercancel","lostpointercapture"].forEach(t=>el.addEventListener(t,ev=>{if(!set.has(ev.pointerId))return;set.delete(ev.pointerId);syncCtl();}));};
  const zoneL=$("gp3L");guard(zoneL);
  const steerDir=ev=>{const rL=$("rcL").getBoundingClientRect(),rR=$("rcR").getBoundingClientRect();const mid=(rL.right+rR.left)/2,dz=Math.max(5,(rR.left-rL.right)/2);const dx=ev.clientX-mid;return dx<-dz?-1:(dx>dz?1:0);};
  zoneL.addEventListener("pointerdown",ev=>{ev.preventDefault();GPA.init();if(!R3)return;try{zoneL.setPointerCapture(ev.pointerId);}catch(e){}ptr.steer.set(ev.pointerId,steerDir(ev));syncCtl();});
  zoneL.addEventListener("pointermove",ev=>{if(!R3||!ptr.steer.has(ev.pointerId))return;const d=steerDir(ev);if(ptr.steer.get(ev.pointerId)!==d){ptr.steer.set(ev.pointerId,d);syncCtl();}});
  ["pointerup","pointercancel","lostpointercapture"].forEach(t=>zoneL.addEventListener(t,ev=>{if(!ptr.steer.has(ev.pointerId))return;ptr.steer.delete(ev.pointerId);syncCtl();}));
  hold($("rcG"),ptr.gas);hold($("rcB"),ptr.brake);
  R3.ctl=ptr;
  $("gp3Mute").addEventListener("click",ev=>{ev.preventDefault();gpToggleMute();});$("gp3Cam").addEventListener("click",ev=>{ev.preventDefault();gpCycleCam();});R3.camMode=gpCamMode();gpCamApply();
  R3.blockTouch=ev=>{if(R3&&!R3.done&&ev.cancelable)ev.preventDefault();};
  document.addEventListener("touchmove",R3.blockTouch,{passive:false});document.addEventListener("gesturestart",R3.blockTouch,{passive:false});
  R3.onVis=()=>{if(!GPA.ctx)return;if(document.hidden)GPA.ctx.suspend();else GPA.ctx.resume();};document.addEventListener("visibilitychange",R3.onVis);
  const wrapEl=$("gp3");
  R3.onResize=()=>{if(!R3)return;const w=wrapEl.clientWidth||720,h=wrapEl.clientHeight||Math.round(w*9/16);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();const pr=renderer.getPixelRatio();R3.vpW=w*pr;R3.vpH=h*pr;R3.smoke.mat.uniforms.scale.value=h*pr*0.72;R3.smoke.mat.uniforms.maxPx.value=h*pr*(R3.me&&R3.me.glb?0.5:0.08);if(R3.post)R3.post.resize(w,h,renderer.getPixelRatio());if(R3.fx){R3.fxW=Math.max(16,Math.round(w/2));R3.fxH=Math.max(9,Math.round(h/2));R3.fx.width=R3.fxW;R3.fx.height=R3.fxH;}const ck=$("gp3Ck");if(ck){const q=Math.min(2,window.devicePixelRatio||1);ck.width=Math.round(w*q);ck.height=Math.round(h*q);}};
  R3.onOrient=()=>{[150,400,900].forEach(ms=>setTimeout(()=>{if(R3)R3.onResize();},ms));};
  window.addEventListener("resize",R3.onResize);window.addEventListener("orientationchange",R3.onOrient);if(R3.me.glb){R3.smoke.lim=0.95;R3.smoke.base=0.85;R3.smoke.cap=150;const sc=R3.sunTint||new T.Color(1,1,1),sk=R3.skyTint||new T.Color(0.8,0.82,0.9);R3.smoke.mat.uniforms.tint.value.copy(sc).multiplyScalar(1.2);R3.smoke.mat.uniforms.shade.value.copy(sk).multiplyScalar(0.97);}R3.onResize();   // smoke takes the scene light: warm sun on top, sky-blue shade underneath
  GPA.startEngine();
  // the track + car line is said BEFORE the count; the count starts when that clip ends (never speaks "three, two, one")
  const voiceOn=typeof DB!=="undefined"&&DB&&DB.sound&&!(typeof _voiceUnlocked!=="undefined"&&!_voiceUnlocked);
  if(voiceOn&&typeof sayAndThen==="function")sayAndThen(C.name+". "+myCar.n+".",()=>setTimeout(gpCountStart,250),6000);
  else setTimeout(gpCountStart,1300);
  R3.raf=requestAnimationFrame(gpFrame);
  setTimeout(gpEnvCheck,1200);
}
/* safety net: if the reflection map ever blacks out the scene on some device, switch it off */
function gpEnvCheck(){try{if(!R3||!R3.scene.environment)return;R3.renderer.render(R3.scene,R3.camera);const c=R3.renderer.domElement,o=document.createElement("canvas");o.width=64;o.height=36;const x=o.getContext("2d");x.drawImage(c,0,0,64,36);const d=x.getImageData(0,27,64,9).data;let sum=0;for(let i=0;i<d.length;i+=4)sum+=d[i]+d[i+1]+d[i+2];if(sum/(d.length/4)<25){R3.scene.environment=null;window.__gp.envOff=true;}}catch(e){}}
/* ---------- camera views: chase (default) / bumper / cockpit with a digital dash; choice saved on the profile ---------- */
function gpCamApply(){if(!R3)return;const w=$("gp3");if(w)w.classList.toggle("ck",R3.camMode==="cockpit");}
function gpCycleCam(){if(!R3)return;const L=["chase","bumper","cockpit"];R3.camMode=L[(L.indexOf(R3.camMode)+1)%3];gpSetOpt("gpCam",R3.camMode);gpCamApply();gpMsg({chase:"Chase cam",bumper:"Bumper cam",cockpit:"Cockpit cam"}[R3.camMode]);sfx("tick");}
/* the cockpit: roof edge + mirror, A-pillars, a carbon dash, a wheel that turns with the steering, and a digital display
   (big mph, gear, a shift-light bar, place + lap). Drawn on one 2D canvas under the touch controls. */
function gpCockpit(){const cv=$("gp3Ck");if(!cv||!R3)return;const x=cv.getContext("2d"),W=cv.width,H=cv.height,me=R3.me;x.clearRect(0,0,W,H);
  const u=Math.min(W,H*1.8)/100;
  x.fillStyle="#0c0d10";x.beginPath();x.moveTo(0,0);x.lineTo(W,0);x.lineTo(W,H*0.06);x.quadraticCurveTo(W/2,H*0.1,0,H*0.06);x.fill();
  x.fillStyle="#15171c";x.beginPath();x.moveTo(0,0);x.lineTo(W*0.08,0);x.lineTo(W*0.16,H*0.06);x.lineTo(W*0.05,H*0.62);x.lineTo(0,H*0.7);x.fill();
  x.beginPath();x.moveTo(W,0);x.lineTo(W*0.92,0);x.lineTo(W*0.84,H*0.06);x.lineTo(W*0.95,H*0.62);x.lineTo(W,H*0.7);x.fill();
  x.fillStyle="#1d232c";x.strokeStyle="#0a0b0e";x.lineWidth=u*0.6;x.beginPath();x.rect(W/2-u*11,H*0.02,u*22,u*4.2);x.fill();x.stroke();
  const dy=H*0.8;x.fillStyle="#121317";x.beginPath();x.moveTo(0,H);x.lineTo(0,dy+u*2);x.quadraticCurveTo(W/2,dy-u*7,W,dy+u*2);x.lineTo(W,H);x.fill();
  x.strokeStyle="rgba(255,255,255,.08)";x.lineWidth=u*0.3;x.beginPath();x.moveTo(0,dy+u*2.2);x.quadraticCurveTo(W/2,dy-u*6.6,W,dy+u*2.2);x.stroke();
  const cx=W/2,cy=H+u*6,R=u*25,rot=(me.steerIn||0)*1.4+(me.headA||0)*0.6;x.save();x.translate(cx,cy);x.rotate(rot);
  x.lineWidth=u*4.2;x.strokeStyle="#1a1b1f";x.beginPath();x.arc(0,0,R,Math.PI*1.08,Math.PI*1.92);x.stroke();x.lineWidth=u*1;x.strokeStyle="#ff2d87";x.beginPath();x.arc(0,0,R,Math.PI*1.47,Math.PI*1.53);x.stroke();
  x.fillStyle="#22242a";x.beginPath();x.moveTo(-R*0.95,-R*0.18);x.lineTo(-u*7,-u*6);x.lineTo(u*7,-u*6);x.lineTo(R*0.95,-R*0.18);x.lineTo(u*8,u*2);x.lineTo(-u*8,u*2);x.fill();
  const mph=Math.round(Math.abs(me.speed)*GP_MPH),gw=u*17,gh=u*8.5,gx=-gw/2,gy=-R*0.8;x.fillStyle="#05070a";x.fillRect(gx,gy,gw,gh);x.strokeStyle="#3a3f4a";x.lineWidth=u*0.4;x.strokeRect(gx,gy,gw,gh);
  const rf=Math.max(0,Math.min(1,me.speed/me.max)),n=10;for(let i=0;i<n;i++){x.fillStyle=i/n<rf?(i<5?"#3cff7a":(i<8?"#ffd23f":"#ff3b3b")):"#1c2027";x.fillRect(gx+u*0.8+i*(gw-u*1.6)/n,gy+u*0.7,(gw-u*1.6)/n-u*0.35,u*1.2);}
  x.fillStyle="#fff";x.font="italic 900 "+(u*4.4).toFixed(1)+"px system-ui";x.textAlign="center";x.textBaseline="middle";x.fillText(String(mph),0,gy+gh*0.58);
  x.font="800 "+(u*1.5).toFixed(1)+"px system-ui";x.fillStyle="#9fb0c8";x.fillText("MPH",0,gy+gh*0.9);
  x.textAlign="left";x.font="italic 900 "+(u*2.6).toFixed(1)+"px system-ui";x.fillStyle="#2fd3c3";x.fillText(String(R3.gear||1),gx+u*1,gy+gh*0.58);
  x.textAlign="right";x.fillStyle="#ffd23f";x.font="900 "+(u*1.7).toFixed(1)+"px system-ui";x.fillText(R3.mode==="race"?"P"+R3.place:"♪"+R3.notesGot,gx+gw-u*0.9,gy+gh*0.45);x.fillStyle="#cfd6e6";x.fillText("L"+Math.min(R3.C.laps,me.lap+1)+"/"+R3.C.laps,gx+gw-u*0.9,gy+gh*0.78);
  x.restore();}
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
  const raw=Math.max(0,(now-R3.last)/1000);const dt=Math.min(0.05,raw);R3.last=now;   // a frame stamp can sit just before the build's clock
  R3.fpsT+=raw;R3.fpsN++;if(R3.fpsT>=2){R3.fps=R3.fpsN/R3.fpsT;R3.fpsT=0;R3.fpsN=0;window.__gp.fps=Math.round(R3.fps);
    if(R3.fps<45&&!document.hidden){R3.lowT++;if(R3.lowT>=2){R3.lowT=0;if(R3.pr>1){R3.pr=Math.max(1,R3.pr-0.25);R3.renderer.setPixelRatio(R3.pr);R3.onResize();}else if(R3.shadowsOn){R3.shadowsOn=false;R3.sun.castShadow=false;}}}else R3.lowT=0;
    window.__gp.pr=R3.pr;window.__gp.shadows=R3.shadowsOn;}
  R3.frameN=(R3.frameN||0)+1;
  gpCountTick(now);
  if(R3.phase==="race"&&!R3.done)R3.time=now-R3.goAt;
  gpUpdate(dt,R3.countdown>0);gpRender(dt);
  R3.raf=requestAnimationFrame(gpFrame);
}
/* crossing the start line forwards / backing over it (shared by driving and by contact nudges, so a push can never skip a lap) */
function gpLapCross(kt,before,waiting){if(waiting||kt.traffic)return;const fwdX=kt.t<before&&before-kt.t>0.5,backX=kt.t>before&&kt.t-before>0.5;
  if(backX){if(kt.lap>0)kt.lap--;else kt.started=false;}
  else if(fwdX&&!kt.started){kt.started=true;}
  else if(fwdX){kt.lap++;if(kt.player){if(kt.lap>=R3.C.laps&&!R3.done)gpFinish();else{R3.notes.forEach(n=>{n.alive=true;n.mesh.visible=true;});GPA.play("lap");gpMsg(kt.lap+1===R3.C.laps?"Final lap":"Lap "+(kt.lap+1));}}}}
/* ---------- car-to-car contact (racers and traffic): smooth and kid-fair ----------
   Every car is a box in the road's frame (along-road metres x across-road metres; Prince's box turns with his slide angle).
   When two boxes overlap, the shallower axis is the contact normal: a side rub separates sideways, a nudge from behind
   separates along the road. Only the overlap itself is removed (split by weight), so nothing snaps or teleports. A closing
   speed turns into a soft bounce (restitution 0.2) shared by both cars plus ~1% speed loss each; separating cars are left
   alone, and a tiny sideways nudge keeps a nose-to-tail pair from sticking. No yaw kick, so nobody spins. Run up to 3
   passes per frame, with the road-edge limits applied between passes. */
function gpYawRel(b){return b.player?Math.max(-0.7,Math.min(0.7,b.headA||0)):(b.yawRel||0);}   // body yaw relative to the road (+ = nose toward +x)
function gpLatV(b){return b.player?b.sv:(b.bv||0);}
function gpAddLatV(b,v){if(b.player)b.sv=Math.max(-0.6,Math.min(0.6,b.sv+v));else b.bv=Math.max(-0.5,Math.min(0.5,(b.bv||0)+v));}
function gpLimX(b){return b.player?(R3.mode==="free"?1.15:1.22):(b.traffic?0.98:1.1);}
function gpClampX(b){const lim=gpLimX(b);if(Math.abs(b.x)>lim){const sd=Math.sign(b.x);b.x=sd*lim;if(gpLatV(b)*sd>0)gpAddLatV(b,-gpLatV(b));}}
function gpShiftT(b,d,waiting){const before=b.t;b.t=(b.t+d+1)%1;b._mv=1;gpLapCross(b,before,waiting);}
/* two turned boxes in the road frame (u = across in metres, v = along in metres): separating-axis test over the 4 box axes.
   Returns null when apart, else the push normal (unit, from A to B) and the overlap depth along it. */
function gpSat(ua,va,aa,wa,la,ub,vb,ab,wb,lb){const ax=[[Math.cos(aa),-Math.sin(aa)],[Math.sin(aa),Math.cos(aa)],[Math.cos(ab),-Math.sin(ab)],[Math.sin(ab),Math.cos(ab)]];
  const ra=[ax[0],ax[1]],rb=[ax[2],ax[3]],du=ub-ua,dv=vb-va;let best=1e9,bn=null;
  for(const n of ax){const pa=wa*Math.abs(ra[0][0]*n[0]+ra[0][1]*n[1])+la*Math.abs(ra[1][0]*n[0]+ra[1][1]*n[1]),pb=wb*Math.abs(rb[0][0]*n[0]+rb[0][1]*n[1])+lb*Math.abs(rb[1][0]*n[0]+rb[1][1]*n[1]);
    const d=du*n[0]+dv*n[1],o=pa+pb-Math.abs(d);if(o<=0)return null;if(o<best){best=o;bn=d<0?[-n[0],-n[1]]:[n[0],n[1]];}}
  return{n:bn,o:best};}
/* where a car really is on the ground: road point + sideways offset, and the road direction there (x/z only) */
function gpRoadAt(b,o){const p=R3.curve.getPointAt(b.t,o.p),tn=R3.curve.getTangentAt(b.t,o.t);const l=Math.hypot(tn.x,tn.z)||1;o.tx=tn.x/l;o.tz=tn.z/l;o.nx=-o.tz;o.nz=o.tx;const XS=R3.W-1.2;o.x=p.x+o.nx*b.x*XS;o.z=p.z+o.nz*b.x*XS;return o;}
function gpContacts(dt,waiting){if(waiting)return 0;const B=R3.bodies,L=R3.len,XS=R3.W-1.2,log=R3.cLog,T=R3.T;let n=0;
  const RA=R3._ra||(R3._ra={p:new T.Vector3(),t:new T.Vector3()}),RC=R3._rc||(R3._rc={p:new T.Vector3(),t:new T.Vector3()});
  for(let it=0;it<3;it++){let any=false;
    for(let a=0;a<B.length;a++){const A=B[a];if(A.off)continue;
      for(let b=a+1;b<B.length;b++){const C=B[b];if(C.off)continue;
        let dz=(C.t-A.t)*L;if(dz>L/2)dz-=L;else if(dz<-L/2)dz+=L;if(dz>12||dz<-12||Math.abs((C.x-A.x)*XS)>7)continue;
        // C's true position and road direction, seen from A's road frame (u = across, v = along): exact on bends and over the arc-length table
        gpRoadAt(A,RA);gpRoadAt(C,RC);const wx=RC.x-RA.x,wz=RC.z-RA.z,u=wx*RA.nx+wz*RA.nz,v=wx*RA.tx+wz*RA.tz;
        const th=Math.atan2(RC.tx*RA.nx+RC.tz*RA.nz,RC.tx*RA.tx+RC.tz*RA.tz),ct=Math.cos(th),st=Math.sin(th);
        const hit=gpSat(0,0,gpYawRel(A),A.S.w/2,A.S.len/2,u,v,th+gpYawRel(C),C.S.w/2,C.S.len/2);if(!hit)continue;
        any=true;n++;const mA=A.mass||1,mC=C.mass||1,wA=mC/(mA+mC),wC=mA/(mA+mC),nu=hit.n[0],nv=hit.n[1],pen=hit.o+0.02;
        const cu=nu*ct-nv*st,cv=nu*st+nv*ct;   // the same normal in C's own road frame
        // remove just the overlap along the contact normal, split by weight (A goes -n, C goes +n)
        A.x-=nu*pen*wA/XS;C.x+=cu*pen*wC/XS;A._mv=C._mv=1;gpShiftT(A,-nv*pen*wA/L,waiting);gpShiftT(C,cv*pen*wC/L,waiting);
        // closing speed along the normal (m/s): A's velocity in its frame vs C's velocity turned into A's frame
        const aU=gpLatV(A)*XS,aV=A.speed,cU0=gpLatV(C)*XS,cV0=C.speed,cU=cU0*ct+cV0*st,cV=-cU0*st+cV0*ct,vrel=(cU-aU)*nu+(cV-aV)*nv;   // < 0: closing
        let impact=0;if(vrel<0){impact=-vrel;const e=impact>2.5?0.2:0;   // a real knock bounces softly; a slow push is a plain push (no frame-to-frame ping-pong)
          const j=-(1+e)*vrel/(1/mA+1/mC);gpAddLatV(A,-j*nu/mA/XS);A.speed-=j*nv/mA;gpAddLatV(C,j*cu/mC/XS);C.speed+=j*cv/mC;
          if(impact>0.8){const loss=Math.min(0.03,0.004*impact);A.speed*=1-loss;C.speed*=1-loss;}}   // the small speed loss is shared
        if(Math.abs(nv)>0.7){const sx=u>=0?1:-1,nud=0.04+Math.min(0.08,impact*0.006);gpAddLatV(A,-sx*nud);gpAddLatV(C,sx*nud);}   // nose to tail: a gentle sideways ease so the pair slides apart instead of sticking
        gpClampX(A);gpClampX(C);
        if(it===0&&(A.player||C.player)){const fresh=R3.bumpT>0.6;R3.bumpT=0;
          if(fresh&&impact>1.2){GPA.play("bonk");R3.sk.clean=0;gpChainBreak();const pa=A.pos,pc=C.pos;for(let q=0;q<6;q++){const an=Math.random()*6.28;R3.sparks.emit((pa.x+pc.x)/2,(pa.y+pc.y)/2+0.6,(pa.z+pc.z)/2,Math.cos(an)*2.5,1.5+Math.random()*2,Math.sin(an)*2.5,1,0.75,0.35,0.3);}}}
        if(log&&(A.player||C.player)&&it===0)log.push({f:R3.frameN,o:+hit.o.toFixed(3),nu:+nu.toFixed(2),nv:+nv.toFixed(2),impact:+impact.toFixed(2)});}}
    if(!any)break;}
  return n;}
/* rivals: follow the racing line, but look ~20 m ahead for anything in the way (rivals, traffic, Prince) and pass on the freer
   side; if both sides are shut, hold its speed (kt.capSpd) instead of running into it. When Prince is alongside or just
   behind, keep a car's width plus a metre away from him. Sideways speed is capped (~2.7 m/s), so a rival never darts. */
function gpRivalSteer(kt,i,waiting){const XS=R3.W-1.2,L=R3.len,me=R3.me,hw=kt.S.w/2;let target=R3.lineX[(i+Math.round(12/(L/R3.M)))%R3.M];kt.capSpd=null;
  if(waiting)return 0;
  if(kt.testHold){kt.capSpd=kt.testHold.speed;return Math.max(-0.42,Math.min(0.42,(kt.testHold.x-kt.x)*1.5));}   // contact test only: hold a lane and a speed
  let blk=null,bd=1e9;for(const o of R3.bodies){if(o===kt||o.off)continue;let dz=((o.t-kt.t+1.5)%1-0.5)*L;const need=(hw+o.S.w/2+0.7)/XS;
    if(dz>kt.S.len*0.3&&dz<20+Math.max(0,kt.speed-o.speed)*1.2&&Math.abs(o.x-kt.x)<need&&dz<bd){blk=o;bd=dz;}}
  if(blk){const need=(hw+blk.S.w/2+1.0)/XS,free=x=>Math.abs(x)<=0.98&&!R3.bodies.some(o=>o!==kt&&o!==blk&&!o.off&&Math.abs(((o.t-kt.t+1.5)%1-0.5)*L-bd)<9&&Math.abs(o.x-x)<(hw+o.S.w/2+0.5)/XS);
    const l=blk.x-need,r=blk.x+need,lo=free(l),ro=free(r);
    if(lo||ro)target=lo&&ro?(Math.abs(l-target)<Math.abs(r-target)?l:r):(lo?l:r);
    if(Math.abs(blk.x-kt.x)<(hw+blk.S.w/2+0.3)/XS&&bd<12+Math.max(0,kt.speed-blk.speed)*0.8)kt.capSpd=Math.max(0,blk.speed*0.97-(bd<kt.S.len?2:0));}
  const dzp=((me.t-kt.t+1.5)%1-0.5)*L;if(dzp>-9&&dzp<6){const gap=(hw+me.S.w/2+1.0)/XS;if(Math.abs(me.x-kt.x)<gap){const sd=kt.x>=me.x?1:-1,want=me.x+sd*gap;target=Math.abs(want)<=0.98?want:me.x-sd*gap;}}
  const gain=1.1+kt.racer.car.handle*0.18,vmax=0.42;return Math.max(-vmax,Math.min(vmax,(target-kt.x)*gain));}
/* put cars that a contact moved back on the road this same frame (the view never shows the overlap that was just removed) */
function gpPlaceAll(){const XS=R3.W-1.2,T=R3.T;R3.karts.forEach(kt=>{if(!kt._mv)return;kt._mv=0;const pos=R3.curve.getPointAt(kt.t),tan=R3.curve.getTangentAt(kt.t);const nx=-tan.z,nz=tan.x,nl=Math.hypot(nx,nz)||1;
  pos.x+=nx/nl*kt.x*XS;pos.z+=nz/nl*kt.x*XS;kt.pos.copy(pos);kt.g.position.copy(pos);});}
/* ---------- start sequence: ONE clock ----------
   1. "intro": the track + car line is spoken while the grid sits still (no numbers, lamps dark). The count waits for that clip
      to finish (or ~1.3 s when no voice will play), so the voice never talks over the beeps.
   2. "count": three beats of exactly 1 s, timed from the rAF frame stamp. On the frame a beat starts, the number on screen, its
      beep, the gantry LED and the start lamps (3 lit -> 2 -> 1) all change together. Nothing about the count is spoken.
   3. GO: same frame for "GO!", the go sound, all lamps out and the cars being released. The race clock starts on that frame.
   Every beat is logged in R3.cdLog (frame number, frame time, audio time of the beep) for the sync test. */
function gpCountStart(){if(!R3||R3.phase!=="intro"||R3.cdReq)return;
  const go=()=>{if(R3&&R3.phase==="intro")R3.cdReq=true;};
  const c=GPA.ctx;if(c&&c.state!=="running"&&!GPA.muted){let fired=false;const f=()=>{if(fired)return;fired=true;go();};try{c.resume().then(f,f);}catch(e){f();}setTimeout(f,450);}   // wake the audio first so beat 1's beep is not late
  else go();}
function gpCountTick(now){const R=R3;
  if(R.phase==="intro"){R.countdown=3.8;if(!R.cdReq)return;R.cdReq=false;R.phase="count";R.cdF0=now;R.cdStep=-1;const cd=$("gp3Card");if(cd)cd.classList.add("hide");}
  if(R.phase!=="count")return;
  let e=(now-R.cdF0)/1000,step=Math.min(3,Math.floor(e)),stall=0;
  if(step>R.cdStep+1){step=R.cdStep+1;stall=now-(R.cdF0+step*1000);R.cdF0=now-step*1000;e=step;}   // a frame that arrives very late (device hiccup) never swallows a number: show the next one now and give it its full second
  if(step!==R.cdStep){R.cdStep=step;const n=3-step;R.setLights(n);R.litShown=n;R.setScreen(n>0?String(n):"GO!");GPA.play(n>0?"beep":"go");
    const c=$("gp3Count");if(c){c.textContent=n>0?String(n):"GO!";c.classList.remove("pop");void c.offsetWidth;c.classList.add("show","pop");}
    let beepPerf=null;try{if(GPA.ctx&&GPA.ctx.getOutputTimestamp){const ts=GPA.ctx.getOutputTimestamp();beepPerf=+(ts.performanceTime+(GPA.ctx.currentTime-ts.contextTime)*1000).toFixed(2);}}catch(x){}
    R.cdLog.push({n,frame:R.frameN,frameMs:+now.toFixed(2),ideal:+(R.cdF0+step*1000).toFixed(2),callPerf:+performance.now().toFixed(2),beepPerf,beepAudio:GPA.ctx?+GPA.ctx.currentTime.toFixed(4):null,audioState:GPA.ctx?GPA.ctx.state:"none",lit:n,released:n===0,stallMs:+stall.toFixed(1)});
    if(n===0){R.phase="race";R.countdown=0;R.goAt=now;setTimeout(()=>{const cc=$("gp3Count");if(cc)cc.classList.remove("show");},800);}}
  if(R.phase==="count")R.countdown=Math.max(0.001,3-e);}
function gpUpdate(dt,waiting){
  const {karts,samples,M,len,T,me}=R3;
  const k=R3.keys;const left=k["arrowleft"]||k["a"]||R3.touchDir<0,right=k["arrowright"]||k["d"]||R3.touchDir>0,brake=k["arrowdown"]||k["s"]||R3.brake,gas=R3.autoGas||k["arrowup"]||k["w"]||R3.gas,driftKey=k["shift"]||k[" "]||k["x"];
  const V=R3.tmpV,sk=R3.sk;R3.bumpT+=dt;if(!waiting){R3.simT=(R3.simT||0)+dt;if(R3.relFrame==null)R3.relFrame=R3.frameN;}
  karts.forEach(kt=>{
    const i=Math.floor(kt.t*M)%M;const s=samples[i];
    const kap=R3.kap[i];                                   // signed curvature here (+ = left-hander)
    const offroad=Math.abs(kt.x)>1.05;
    let draft=false;if(!waiting&&kt.speed/kt.max>0.55){draft=karts.some(o=>{if(o===kt)return false;const d=(o.t-kt.t+1)%1;return d>0.003&&d<0.028&&Math.abs(o.x-kt.x)<0.32;});}kt.draft=draft;
    let band=1;if(!kt.player&&!waiting){const gap=(kt.lap+kt.t)-(me.lap+me.t);band=gap>0.06?0.93:(gap<-0.06?1.07:1);}
    const maxNow=waiting?0:kt.max*band*(draft?1.07:1)*(kt.spin>0?0.6:1)*(R3.tw&&R3.tw.zoneAt(i,"ford")?0.9:1)*(offroad?(kt.player?Math.max(0.62,kt.offF):kt.offF):1)*(kt.drift?0.94:1);
    const spd0=kt.speed/kt.max,inp=kt.player?(left?-1:0)+(right?1:0):0;
    if(kt.player){
      // steering input eases in and out (two cascaded smoothers = an S-curve over ~0.3 s): a tap never jerks the car
      const kS=1-Math.exp(-dt*(inp!==0?8:10));kt.st1+=(inp-kt.st1)*kS;kt.steerIn+=(kt.st1-kt.steerIn)*kS;
      // drift: tap BRAKE (or the drift key) while steering at speed to start it; it then holds while you keep steering into the
      // bend (GAS on, brake not needed), and ends cleanly when you let go of the steering or steer the other way
      const driftBtn=(brake||driftKey)&&inp!==0;
      if(!kt.drift&&driftBtn&&spd0>0.42&&!offroad&&!waiting){kt.drift=inp;kt.off=0;kt.dHold=0;}
      if(kt.drift){kt.off=offroad?kt.off+dt:0;kt.dHold=inp===kt.drift?0:kt.dHold+dt;if(kt.dHold>(inp===-kt.drift?0.22:0.4)||kt.off>0.6||spd0<0.3)kt.drift=0;}
      const braking=brake&&!waiting;if(braking&&!kt.wasBrake&&spd0>0.6)kt.lockT=0.45;kt.wasBrake=braking;if(kt.lockT>0)kt.lockT-=dt;
      kt.brakeOn=braking;
      if(!gas||waiting)kt.gasT=0;
      if(waiting)kt.speed=0;
      else if(brake){kt.speed=kt.speed>0.3?Math.max(0,kt.speed-(kt.drift?14:24)*dt):Math.max(-5,kt.speed-5*dt);}
      else if(gas||kt.speed<0){kt.gasT+=dt;const launch=kt.speed<maxNow*0.5?Math.min(1,0.62+kt.gasT*1.5):1;   // pull builds over the first ~0.25 s instead of jumping
        kt.speed+=(maxNow-kt.speed)*Math.min(1,dt*(kt.speed<maxNow?kt.accel/10*launch:(offroad?1.1:2.2)));}
      else{kt.speed=Math.max(0,kt.speed-(2.5+0.06*kt.speed)*dt);if(kt.speed>maxNow)kt.speed+=(maxNow-kt.speed)*Math.min(1,dt*(offroad?1.1:2.2));}   // coasting
    }else{
      // rivals follow the speed profile (real braking points for every corner), with a little driver variety and the rubber band
      const tgt=kt.testHold?kt.testHold.speed:Math.min(maxNow,R3.vProf[(i+3)%M]*kt.aiSkill*band,kt.capSpd!=null?kt.capSpd:1e9);
      kt.brakeOn=!waiting&&kt.speed>tgt+0.8;
      if(waiting)kt.speed=0;else if(kt.brakeOn)kt.speed=Math.max(tgt,kt.speed-26*dt);else kt.speed+=(tgt-kt.speed)*Math.min(1,dt*(kt.speed<tgt?kt.accel/10:2.2));
    }
    // tyres: lateral load v²/R beyond the grip limit pushes the car to the outside of the bend and scrubs speed
    const spd=Math.abs(kt.speed)/kt.max;kt.px=kt.x;
    const aLat=kt.speed*kt.speed*Math.abs(kap),grip=R3.grip*(offroad?0.5:1)*(kt.drift?1.6:1)*(kt.player?R3.upGrip:1.06);
    const ex=Math.min(2.5,Math.max(0,aLat/grip-1));kt.slip=ex;
    kt.x+=Math.sign(kap)*(ex*1.7+0.12*spd*Math.min(1,aLat/grip))*dt;
    if(ex>0&&!waiting)kt.speed=Math.max(0,kt.speed-ex*9*dt);
    if(kt.player&&!waiting){
      // lateral speed follows the smoothed stick with some inertia, so the car carries its weight across the road
      let tgt;if(kt.drift){const same=inp===kt.drift,opp=inp===-kt.drift;tgt=kt.drift*kt.steer*Math.max(.35,spd)*(same?0.32:(opp?-0.3:0.14));}
      else tgt=kt.steerIn*kt.steer*(R3.mode==="free"?0.36:0.42)*Math.max(.4,spd);
      kt.sv+=(tgt-kt.sv)*Math.min(1,dt*(kt.drift?2.8:4.5));kt.x+=kt.sv*dt;
    }
    else if(!kt.player){kt.x+=gpRivalSteer(kt,i,waiting)*dt;if(kt.bv){kt.x+=kt.bv*dt;kt.bv*=Math.exp(-5*dt);if(Math.abs(kt.bv)<0.002)kt.bv=0;}}
    if(kt.player&&R3.mode==="race"&&!kt.drift&&!left&&!right&&Math.abs(kt.x)>0.95)kt.x-=Math.sign(kt.x)*dt*0.7;
    if(kt.player&&R3.mode==="free"&&!kt.drift&&!left&&!right&&Math.abs(kt.x)>0.7)kt.x-=Math.sign(kt.x)*dt*0.5;
    const lim=kt.player?(R3.mode==="free"?1.15:1.22):1.1;
    if(Math.abs(kt.x)>lim){const sd=Math.sign(kt.x),vOut=(kt.x-kt.px)/Math.max(dt,0.001)*sd;kt.x=sd*lim;if(kt.player&&!waiting){
        if(vOut>0.08&&kt.wallT<=0){kt.sv=-sd*Math.min(0.55,0.18+vOut*0.5);kt.speed*=1-Math.min(0.06,vOut*0.07);kt.drift=0;kt.wallT=0.35;kt.knock=Math.min(1,0.35+vOut);   // gentle bounce back toward the road, a small speed loss, never a dead stop
          if(vOut>0.3){GPA.play("bump");}kt.g.updateMatrixWorld(true);V.set(sd*-(kt.S.w/2),0.35,0.4);kt.g.localToWorld(V);for(let q=0;q<10;q++)R3.sparks.emit(V.x,V.y,V.z,(Math.random()-0.5)*4,1+Math.random()*2.5,(Math.random()-0.5)*4,1,0.75,0.3,0.35);}
        else if(kt.sv*sd>0)kt.sv*=0.5;}}
    if(kt.wallT>0)kt.wallT-=dt;   // road edge is 1.19 (the car's outer wheels on the shoulder), the rail is 1.6
    if(kt.hop>0)kt.hop-=dt;
    const before=kt.t;kt.t=(kt.t+kt.speed*dt/len+1)%1;
    gpLapCross(kt,before,waiting);
    if(kt.player&&!waiting&&!R3.done&&R3.mode==="race"){const tt=R3.trapT;const crossed=before<=kt.t?(before<tt&&kt.t>=tt):(before<tt||kt.t>=tt);if(crossed){const mph=Math.round(kt.speed*GP_MPH);R3.trapBest=Math.max(R3.trapBest,mph);const r=kt.speed/(kt.max||1);const stars=r>=0.97?"★★★":r>=0.9?"★★":"★";gpMsg("Speed trap "+mph+" mph "+stars);GPA.play("trap");gpSkill("Speed trap",mph*4,true);}}
    if(kt.player&&R3.gates&&!waiting){const G=R3.gates;G.ts.forEach(gt=>{const crossed=before<=kt.t?(before<gt&&kt.t>=gt):(before<gt||kt.t>=gt);if(crossed)G.flash=1;});}
    // place the car
    const pos=R3.curve.getPointAt(kt.t),tan=R3.curve.getTangentAt(kt.t).normalize(),nor=new T.Vector3(-tan.z,0,tan.x).normalize();
    pos.addScaledVector(nor,kt.x*(R3.W-1.2));kt.pos.copy(pos);
    kt.g.position.copy(pos);kt.travel+=Math.abs(kt.speed)*dt;kt.wheelPhase+=kt.speed*dt/Math.max(0.01,kt.wheelRadius);
    let y=0;if(offroad)y=Math.abs(Math.sin(kt.t*len*3))*0.08;if(kt.hop>0)y+=Math.sin(Math.PI*(1-kt.hop/0.22))*0.25;
    const vib=spd*(Math.sin(kt.travel*(kt.racer.car.type==="suv"?5.2:7.4))*0.005+Math.sin(kt.travel*2.3+1.1)*0.002);kt.body.position.y=kt.pic?(offroad?Math.min(0.08,y+vib):0):y+vib;   // photo tyre line stays planted on-road; the 3D fallback keeps its suspension motion
    kt.g.lookAt(pos.clone().add(tan));
    const yaw=Math.atan2(tan.x,tan.z);let yawRate=0;if(kt.yaw!==null){let d=yaw-kt.yaw;if(d>Math.PI)d-=Math.PI*2;if(d<-Math.PI)d+=Math.PI*2;yawRate=d/Math.max(dt,0.001);}kt.yaw=yaw;
    const vx=(kt.x-kt.px)/Math.max(dt,0.001);
    if(kt.player){
      // heading: the nose points where the car is really going (lateral speed vs forward speed) plus the drift angle; a damped
      // spring gives the body weight - it swings into a slide, holds it, and settles back without snapping
      const inpN=(left?-1:0)+(right?1:0),opp=kt.drift&&inpN===-kt.drift,latMs=kt.sv*(R3.W-1.2);
      const latA=Math.max(-0.2,Math.min(0.2,0.8*Math.atan2(latMs,Math.max(6,Math.abs(kt.speed))))),headT=kt.drift?Math.max(-0.48,Math.min(0.48,latA*0.5+kt.drift*(opp?0.18:0.36))):latA;   // a held drift settles near 22-27 degrees
      kt.headV+=((headT-kt.headA)*38-kt.headV*10.5)*dt;kt.headA+=kt.headV*dt;kt.g.rotateY(-kt.headA);
      const ph=window.__gp&&window.__gp.phys;if(ph){ph.slipDeg=kt.headA*57.3;ph.steerIn=kt.steerIn;ph.sv=kt.sv;ph.drift=kt.drift;ph.x=kt.x;ph.speed=kt.speed;}
    }else{kt.yawRel=vx*0.05+(kt.drift?kt.drift*0.35:0);kt.g.rotateY(-kt.yawRel);}
    const heavy=kt.racer.car.type==="suv",settle=heavy?4.5:6,rollMax=kt.pic?0:(heavy?0.105:0.09);
    const acc=(kt.speed-kt.lastSpeed)/Math.max(dt,0.001);kt.lastSpeed=kt.speed;
    if(kt.glb){   // model cars: body on springs (a touch of overshoot) - leans out of corners and slides, dives on the brakes, squats on launch
      // roll saturates softly at ~7.3 deg in the hardest corners / slides; dive reaches ~3.7 deg on the brakes. The body turns about a
      // roll centre 0.32 m up (not the ground), so the outside drops onto its wheels and the inside lifts, and the tyres stay on the road.
      const G=kt.glb,lat=kt.player?-kt.sv*0.2:-vx*0.07,RM=0.16;
      const rawR=yawRate*0.19*spd+lat+(kt.drift?-kt.drift*0.06:0),rollT=waiting?0:RM*Math.tanh(rawR/RM);
      G.rollV+=((rollT-kt.roll)*70-G.rollV*11)*dt;kt.roll+=G.rollV*dt;
      const pitchT=waiting?0:Math.max(-0.045,Math.min(0.065,-acc*0.0034+(kt.brakeOn&&spd>0.15?0.038:0)));
      G.pitchV+=((pitchT-kt.pitch)*70-G.pitchV*8.5)*dt;kt.pitch+=G.pitchV*dt;
      kt.body.position.y+=-Math.abs(kt.roll)*0.03-Math.max(0,kt.pitch)*0.2;}   // the body sits down a little into the lean / dive
    else{const rollT=Math.max(-rollMax,Math.min(rollMax,yawRate*0.18*spd-vx*0.04+(kt.drift?-kt.drift*0.05:0)));kt.roll+=(rollT-kt.roll)*Math.min(1,dt*settle);
    const pitchMax=kt.pic?0.008:0.045,pitchT=Math.max(-pitchMax,Math.min(pitchMax,-acc*(kt.pic?0.00055:(heavy?0.0034:0.003))));kt.pitch+=(pitchT-kt.pitch)*Math.min(1,dt*settle);}
    kt.body.rotation.z=kt.roll;kt.body.rotation.x=kt.pitch;
    if(kt.glb){const py=kt.glb.pivotY,P=V.set(0,py,0).applyEuler(kt.body.rotation);kt.body.position.x=-P.x;kt.body.position.y+=py-P.y;kt.body.position.z=-P.z;}   // pivot about the roll centre
    if(kt.pic){   // picture cars: body lean / tail lift / kerb chatter targets for the sprite shader (gpPicUpdate springs toward them)
      const cl=-yawRate*0.06*spd+(kt.player?kt.steerIn*0.03*spd+kt.headA*0.09:0);kt.leanT=Math.max(-0.08,Math.min(0.08,cl));
      kt.liftT=waiting?0:Math.max(-0.035,Math.min(0.06,-acc*0.0022));
      const edge=Math.abs(kt.x)>0.97&&spd>0.15;kt.knock=Math.max(0,(kt.knock||0)-dt*3);
      kt.chatter=(edge?Math.sin(kt.travel*11)*0.013*Math.min(1,spd*1.5):0)+kt.knock*Math.sin(kt.travel*5+R3.time*0.04)*0.03;}
    let stT;if(kt.glb){const path=Math.atan(2.77*kap*(kt.speed>0.5?1:0));   // Ackermann angle for the bend (wheelbase 2.77 m)
      stT=kt.player?(kt.drift?path*0.4+kt.headA*1.05-kt.steerIn*0.06:path-kt.steerIn*0.42+kt.headA*0.25):path-vx*0.3;   // + = wheels point left; in a drift they point back along the slide (counter-steer)
      stT=Math.max(-0.55,Math.min(0.55,stT));}
    else stT=Math.max(-0.45,Math.min(0.45,yawRate*0.32-vx*0.22+(kt.drift?kt.drift*0.35:0)));
    kt.steerVis+=(stT-kt.steerVis)*Math.min(1,dt*(kt.glb?12:10));kt.steers.forEach(h=>h.rotation.y=kt.steerVis);
    kt.wheels.forEach(w=>w.rotation.x+=kt.speed*dt/w.userData.rad);
    if(kt.glb)gpGlbUpdate(kt,dt);else kt.tailMat.emissiveIntensity=kt.brakeOn?3.4:0.9;
    if(kt.pic){if(!kt.player&&!waiting&&spd>0.8&&Math.random()<dt*0.1)gpFlame(kt,0.3);gpPicUpdate(kt,dt,R3.camPos,kt.player?((left?-1:0)+(right?1:0)):0);}
    // effects: tyre smoke + skid marks only for a real drift/brake-slide; dust stays off-road
    const near=kt.player||(kt.pos.distanceToSquared(me.pos)<2500&&kt.pos.distanceToSquared(R3.camPos)>30);
    const driftSlide=!!kt.drift&&spd>0.38,brakeSlide=kt.brakeOn&&((kt.slip>0.16&&spd>0.55)||(kt.lockT>0&&spd>0.5)),skid=!offroad&&(driftSlide||brakeSlide);if(!skid)kt.skidD=0;
    if(near&&(skid||(offroad&&spd>0.2))){kt.g.updateMatrixWorld(true);
      [-1,1].forEach(sd=>{V.set(sd*(kt.tyreX||kt.S.w/2-0.04),0.1,kt.xr);kt.g.localToWorld(V);
        if(skid){const hero=kt.player&&!!kt.glb;kt.smk=(kt.smk||0)+dt*(kt.player?(driftSlide?(hero?34:9):(hero?20:6)):4);while(kt.smk>=1){kt.smk-=1;const big=kt.player&&driftSlide?(hero?4.4:1.35):(hero?3.4:1),lf=hero?(driftSlide?3.1:2.2):big;   // the model car's smoke is a big billowing white cloud that hangs behind it
          const sp=hero?2.2:0.9,cv=hero?kt.speed*(driftSlide?0.6+Math.random()*0.2:0.3+Math.random()*0.2):-0.8;   // hero puffs leave with part of the car's speed, so the cloud billows right behind it instead of vanishing off-screen
          const ox=hero&&driftSlide?-kt.drift*(1.2+Math.random()*1.6):0;R3.smoke.emit(V.x+(Math.random()-0.5)*0.3,V.y+0.14,V.z+(Math.random()-0.5)*0.3,(Math.random()-0.5)*sp+tan.x*cv-tan.z*ox,(hero?0.5:0.2)+Math.random()*(hero?0.8:0.3),(Math.random()-0.5)*sp+tan.z*cv+tan.x*ox,(0.5+Math.random()*0.3)*big,(hero?0.55+Math.random()*0.3:0.3+Math.random()*0.18)*lf);}}
        else if(Math.random()<0.6)R3.dust.emit(V.x,V.y+0.2,V.z,-tan.x*3+(Math.random()-0.5)*2,0.8+Math.random()*1.2,-tan.z*3+(Math.random()-0.5)*2,0.6,0.5,0.35,0.9);});}
    if(skid&&near){kt.skidD+=kt.speed*dt;if(kt.skidD>0.9){const dl=Math.min(6,kt.skidD);kt.skidD=0;const D=R3.dummy;const fw=Math.atan2(tan.x,tan.z)-(kt.player?kt.headA:(kt.drift?kt.drift*0.42:0));   // each mark spans the distance since the last one, so the trail is continuous at any frame rate
      [-1,1].forEach(sd=>{V.set(sd*(kt.tyreX||kt.S.w/2-0.04),0,kt.xr);kt.g.localToWorld(V);D.position.set(V.x-tan.x*dl*0.5,kt.pos.y+0.028,V.z-tan.z*dl*0.5);D.rotation.set(0,fw,0);D.scale.set(1,1,dl+0.1);D.updateMatrix();const si=R3.skN;R3.skids.setMatrixAt(si,D.matrix);R3.skidLife[si]=4;R3.skidFade.setX(si,1);R3.skN=(si+1)%700;});R3.skids.instanceMatrix.needsUpdate=true;R3.skidFade.needsUpdate=true;}}
    // Coast Road: brown dust from both rear wheels on the dirt, a big spray through the ford
    if(R3.tw&&near&&!waiting&&spd>0.12){const onDirt=R3.tw.zoneAt(i,"dirt"),inFord=R3.tw.zoneAt(i,"ford");if(onDirt||inFord){kt.g.updateMatrixWorld(true);
      [-1,1].forEach(sd=>{V.set(sd*(kt.tyreX||kt.S.w/2-0.04),0.15,kt.xr);kt.g.localToWorld(V);
        if(onDirt&&Math.random()<(kt.player?0.9:0.5))R3.dust.emit(V.x,V.y+0.1,V.z,-tan.x*kt.speed*0.12+(Math.random()-0.5)*2.5,0.6+Math.random()*1.4,-tan.z*kt.speed*0.12+(Math.random()-0.5)*2.5,0.62,0.47,0.3,1.4);
        if(inFord&&R3.splash)for(let q=0;q<(kt.player?3:1);q++)R3.splash.emit(V.x+(Math.random()-0.5)*0.6,V.y,V.z+(Math.random()-0.5)*0.6,sd*(1.5+Math.random()*2.5)*Math.abs(tan.z)+(Math.random()-0.5)*2+tan.x*kt.speed*0.2,2.5+Math.random()*3.5,sd*(1.5+Math.random()*2.5)*Math.abs(tan.x)+(Math.random()-0.5)*2+tan.z*kt.speed*0.2,0.86,0.93,1,0.6);});}}
    // a little dust off the outside wheel when the player runs right on the road edge / kerb
    if(kt.player&&!offroad&&Math.abs(kt.x)>0.97&&spd>0.3&&Math.random()<0.45){const sd=-Math.sign(kt.x);kt.g.updateMatrixWorld(true);V.set(sd*(kt.tyreX||kt.S.w/2-0.04),0.1,kt.xr);kt.g.localToWorld(V);R3.dust.emit(V.x,V.y+0.15,V.z,-tan.x*2+(Math.random()-0.5)*1.5,0.5+Math.random()*0.8,-tan.z*2+(Math.random()-0.5)*1.5,0.62,0.55,0.42,0.6);}
  });
  gpTrafficUpdate(dt,waiting);
  // car-to-car contact: resolved after everyone has moved, then the cars are re-placed on the road so what you see has no overlap
  if(gpContacts(dt,waiting))gpPlaceAll();
  gpTrafficPlace();
  if(R3.splash)R3.splash.update(dt,9.5);if(R3.tw&&R3.tw.fordTex){R3.tw.fordTex.offset.y-=dt*0.25;}if(R3.tw&&R3.tw.waterTex2){R3.tw.waterTex2.offset.x+=dt*0.02;}
  // skills
  if(!waiting&&!R3.done&&R3.mode==="race"){const spd=me.speed/me.max,offroad=Math.abs(me.x)>1.05;
    if(me.drift&&spd>0.35&&!offroad)gpSkill("Drift",me.speed*dt*9);
    if(me.draft)gpSkill("Drafting",me.speed*dt*4);
    karts.forEach(o=>{if(o.player)return;const ahead=(o.lap+o.t)>(me.lap+me.t);if(o.ahead&&!ahead&&me.started){const gap=Math.abs(o.x-me.x)*(R3.W-1.2);if(R3.bumpT>1){if(gap<3.3){gpSkill("Near miss",350,true);gpMsg("Near miss");}else gpSkill("Pass",150,true);}}o.ahead=ahead;});
    if(!offroad&&R3.bumpT>0.8)sk.clean+=dt;else if(offroad)sk.clean=0;if(sk.clean>=12){sk.clean=0;gpSkill("Clean racing",250,true);}
    if(sk.cool>0)sk.cool-=dt;sk.idle+=dt;if(sk.chain>0&&sk.idle>2.6)gpBank();}
  if(R3.notes.length){const tn=performance.now()/1000;R3.notes.forEach(n=>{if(!n.alive)return;n.mesh.position.y=n.y+Math.sin(tn*2.2+n.k)*0.25;if(waiting||R3.done)return;const d=(n.t-me.t+1)%1;if(d<0.006&&Math.abs(n.x-me.x)<0.45){n.alive=false;n.mesh.visible=false;gpNote(n);}});}
  if(R3.petals){const p=R3.petals;if(Math.random()<0.5){const tn=R3.curve.getTangentAt((me.t+0.01)%1);const px=me.pos.x+tn.x*(10+Math.random()*25)+(Math.random()-0.5)*26,pz=me.pos.z+tn.z*(10+Math.random()*25)+(Math.random()-0.5)*26;const tx=!!p.pts.material.map.image;p.emit(px,me.pos.y+4+Math.random()*5,pz,(Math.random()-0.5)*2,-0.6-Math.random()*0.6,(Math.random()-0.5)*2,tx?1:0.98,tx?0.92:0.72,tx?0.96:0.84,5);}p.update(dt,0.02);}
  if(R3.gates){const G=R3.gates;G.flash=Math.max(0,G.flash-dt*1.6);G.mat.opacity=0.72+0.18*Math.sin(performance.now()/260)+G.flash*0.6;}
  if(R3.waterTex){R3.waterTex.offset.x+=dt*0.006;R3.waterTex.offset.y+=dt*0.003;}
  {let dirty=false;for(let i=0;i<R3.skidLife.length;i++){const life=R3.skidLife[i];if(life<=0)continue;const next=Math.max(0,life-dt);R3.skidLife[i]=next;R3.skidFade.setX(i,Math.min(1,next/1.2));dirty=true;}if(dirty)R3.skidFade.needsUpdate=true;}
  R3.smoke.update(dt,R3.camPos,R3.vpW||1280,R3.vpH||720);R3.dust.update(dt,-0.4);R3.sparks.update(dt,9);
  // standings + HUD
  const all=karts.slice().sort((a,b)=>(b.lap+b.t)-(a.lap+a.t));R3.board=all;R3.place=all.indexOf(me)+1;
  if(R3.msgT>0){R3.msgT-=dt;if(R3.msgT<=0){const e=$("gp3Msg");if(e)e.classList.remove("show");}}
  const el=(id,v)=>{const e=$(id);if(e&&e.textContent!==v)e.textContent=v;};
  el("gp3Lap","LAP "+Math.min(R3.C.laps,me.lap+1)+"/"+R3.C.laps);el("gp3Time",gpFmt(Math.max(0,R3.time)));
  if(!waiting){const st=R3.done?(R3.mode==="race"?"FINISH  P"+R3.place:"TRIP DONE"):(R3.mode==="race"?"LAP "+Math.min(R3.C.laps,me.lap+1)+"/"+R3.C.laps+"   P"+R3.place:"LAP "+Math.min(R3.C.laps,me.lap+1)+"/"+R3.C.laps+"  ♪ "+R3.notesGot);if(st!==R3.screenTxt){R3.screenTxt=st;R3.setScreen(st);}}
  const pe=$("gp3Pos");if(pe&&pe.dataset.p!==String(R3.place)){pe.dataset.p=String(R3.place);pe.innerHTML=R3.place+"<small>"+gpSuf(R3.place)+"</small><em>/"+karts.length+"</em>";}
  gpSkillHud();
  {const i=Math.floor(me.t*M)%M;const ahead=R3.vProf[(i+Math.round(8/(len/M)))%M];const cue=!waiting&&!R3.done&&me.speed>ahead*1.1&&ahead<me.max*0.9&&!me.brakeOn;const ce=$("gp3Cue");if(ce&&ce.classList.contains("on")!==cue)ce.classList.toggle("on",cue);}
  if(R3.mode==="free"&&R3.songDirty){R3.songDirty=0;const e=$("gp3Song");if(e){const cur=R3.song.length%8,ph=R3.song.slice(R3.song.length-cur);let dots="";for(let i=0;i<8;i++)dots+='<i class="'+(i<cur?"on":"")+'" style="--c:'+(ph[i]?ph[i].c:"#fff")+'"></i>';e.innerHTML='🎵 <b>'+R3.notesGot+' / '+R3.notesTotal+'</b>'+dots;}}
  gpDrawMini($("gp3Map"),R3.C,karts);
  // gearbox + engine sound + speedometer
  const mph=me.speed*GP_MPH;let gear=1;for(let g=1;g<GP_GEARS.length;g++)if(mph>=GP_GEARS[g])gear=g+1;
  const lo=GP_GEARS[gear-1],hi=gear<GP_GEARS.length?GP_GEARS[gear]:180;let rf=0.14+0.8*Math.max(0,Math.min(1,(mph-lo)/(hi-lo)));if(waiting)rf=(gas&&!R3.autoGas?0.6:0.14)+Math.random()*0.02;
  if(gear>R3.gear&&!waiting){GPA.play("shift");if(gear>=3)gpFlame(me,0.28);}R3.gear=gear;
  GPA.engine(rf,(waiting?0.2:(me.brakeOn?0.3:1))*(R3.mode==="free"?0.5:1),!!me.drift||(me.brakeOn&&me.speed/me.max>0.55),waiting);
  R3.tachT+=dt;if(R3.tachT>0.04){R3.tachT=0;gpTach(mph,gear,rf);}
}
/* edge speed lines drawn on a half-resolution overlay canvas; the 25 stroke colours are built once (no per-frame strings) */
const GP_STREAK=Array.from({length:25},(_,i)=>"rgba(255,255,255,"+(i/80).toFixed(4)+")");
function gpSpeedFx(spd,drift){const cv=R3.fx;if(!cv)return;const x=cv.getContext("2d"),W=R3.fxW,H=R3.fxH;x.clearRect(0,0,W,H);const a=Math.max(0,Math.min(1,(spd-0.72)/0.2));if(a<=0.02)return;
  // wind streaks only near top speed: 22 fixed directions across the upper half and both sides (nothing below the horizon in the middle), each growing and fading with distance travelled
  // (no per-frame randomness, so nothing flickers), starting well outside the car and clear of the pedals and the dial
  const cx=W/2,cy=H*0.5,R=Math.hypot(W,H)/2,tr=R3.me.travel;x.lineCap="round";
  for(let i=0;i<22;i++){const ang=Math.PI-0.42+i*(Math.PI+0.84)/21,ph=((tr*0.05+i*0.37)%1+1)%1,r0=R*(0.66+0.08*((i*7)%5)/5),r1=r0+R*(0.08+0.2*ph)*a,c=Math.cos(ang),sn=Math.sin(ang);
    x.strokeStyle=GP_STREAK[Math.min(24,Math.round((0.05+0.3*a)*(1-ph)*80))];x.lineWidth=0.8+1.4*(1-ph);x.beginPath();x.moveTo(cx+c*r0,cy+sn*r0*0.92);x.lineTo(cx+c*r1,cy+sn*r1*0.92);x.stroke();}}
function gpRender(dt){
  const me=R3.me,T=R3.T;const tan=R3.curve.getTangentAt(me.t).normalize();const flat=R3.tmpV2.set(tan.x,0,tan.z).normalize();
  const spd=me.speed/me.max,tall=R3.camera.aspect<1;
  let target,look;
  if(R3.countdown>0.5){const a=Math.max(0,(R3.countdown-0.5)/3.3);   // grid view: a little higher and further back than the chase camera, easing down as the lights count, so the rows ahead stay in frame
    target=me.pos.clone().addScaledVector(flat,-((tall?8.0:6.3)+a*3.2)).add(new T.Vector3(0,(tall?3.9:2.1)+a*1.6,0));look=me.pos.clone().addScaledVector(flat,(tall?9:10)+a*12).add(new T.Vector3(0,tall?-0.6:0.95,0));R3.camPos.copy(target);R3.camYaw=null;}
  else{
    // Forza-style chase: the camera's heading trails the car's (it swings late into a corner and shows the car turning, and follows
    // part of a drift angle), it eases sideways after lane changes, and pulls back up to 0.5 m as speed builds. Every term is a smooth
    // ease - no shake, no FOV change.
    const roadYaw=Math.atan2(flat.x,flat.z),tgtYaw=roadYaw-(me.headA||0)*0.35;
    if(R3.camYaw==null){R3.camYaw=roadYaw;R3.camX=me.x;R3.camBack=0;}
    R3.camYaw+=gpWrapAng(tgtYaw-R3.camYaw)*Math.min(1,dt*3.2);R3.camYaw=gpWrapAng(R3.camYaw);
    R3.camX+=(me.x-R3.camX)*Math.min(1,dt*4);R3.camBack+=(Math.max(0,spd)*0.5-R3.camBack)*Math.min(1,dt*1.5);
    const nor=R3.tmpV3.set(-flat.z,0,flat.x),foc=me.pos.clone().addScaledVector(nor,(R3.camX-me.x)*(R3.W-1.2)*0.45);
    const dir=R3.tmpV4.set(Math.sin(R3.camYaw),0,Math.cos(R3.camYaw)),back=(tall?8.0:6.3)+R3.camBack;
    target=foc.clone().addScaledVector(dir,-back).add(new T.Vector3(0,(tall?3.9:2.1)+R3.camBack*0.25,0));
    target.y=Math.max(target.y,me.pos.y+(tall?3.4:1.4));
    look=foc.clone().addScaledVector(tan,tall?9:10).add(new T.Vector3(0,tall?-0.6:0.95,0));
    R3.camPos.copy(target);const cm=window.__gp.cam;cm.lagDeg=gpWrapAng(R3.camYaw-roadYaw)*57.3;cm.back=back;}
  const cmode=R3.countdown<=0.5?R3.camMode:"chase";if(cmode!=="chase"){me.g.updateMatrixWorld(true);   // bumper: low on the nose; cockpit: driver's eye. Both ride the car's heading (not its body roll), FOV stays fixed
    if(cmode==="bumper"){R3.camPos.copy(me.g.localToWorld(R3.tmpV3.set(0,0.62,2.5)));look=me.g.localToWorld(new T.Vector3(0,0.5,30));}
    else{R3.camPos.copy(me.g.localToWorld(R3.tmpV3.set(0,1.04,-0.35)));look=me.g.localToWorld(new T.Vector3(0,0.82,30));}}
  {const showMe=cmode==="chase"||!!window.__gpCam;if(me.g.visible!==showMe)me.g.visible=showMe;}
  const dc=window.__gpCam;if(dc&&R3.countdown<=0.5){   // test hook only: replay angle on the player car, set in the road's frame (a TV camera), so the car's
    // own heading (straight along the road, or the drift angle) is what you see; {car:true} restores the old lens glued to the car
    if(dc.car){me.g.updateMatrixWorld(true);R3.camPos.copy(me.g.localToWorld(R3.tmpV3.set(dc.side||0,dc.h||1.2,-(dc.back||5))));look=me.g.localToWorld(new T.Vector3(0,dc.look||0.5,dc.ahead||0));}
    else{const rx=R3.tmpV3.set(flat.z,0,-flat.x);R3.camPos.copy(me.pos).addScaledVector(rx,dc.side||0).addScaledVector(flat,-(dc.back||5));R3.camPos.y+=dc.h||1.2;look=me.pos.clone().addScaledVector(flat,dc.ahead||0);look.y+=dc.look||0.5;}}
  R3.camera.position.copy(R3.camPos);
  R3.karts.forEach(k=>{if(k.player)return;const fwd=(k.pos.x-R3.camPos.x)*flat.x+(k.pos.z-R3.camPos.z)*flat.z;const vis=fwd>2.4;if(k.g.visible!==vis)k.g.visible=vis;});   // a solid car until it passes the camera (an opacity fade made rivals see-through)
  R3.camera.lookAt(look);
  const fovT=tall?78:(cmode==="chase"?60:66);R3.fov=fovT;if(R3.camera.fov!==fovT){R3.camera.fov=fovT;R3.camera.updateProjectionMatrix();}
  R3.sky.position.copy(R3.camera.position);if(R3.band)R3.band.position.set(R3.camera.position.x,R3.band.userData.y,R3.camera.position.z);R3.glare.position.copy(R3.camera.position).addScaledVector(R3.sunDir,1500);
  R3.sun.position.copy(me.pos).add(R3.sunOff);R3.sun.target.position.copy(me.pos);R3.sun.target.updateMatrixWorld();
  R3.renderer.info.reset();if(cmode==="cockpit")gpCockpit();
  const pp=R3.post;if(pp){pp.mat.uniforms.t.value=performance.now()/1000;R3.renderer.setRenderTarget(pp.rt);R3.renderer.render(R3.scene,R3.camera);R3.renderer.setRenderTarget(null);R3.renderer.render(pp.scene,pp.cam);}else{R3.renderer.render(R3.scene,R3.camera);gpSpeedFx(R3.countdown>0?0:spd,me.drift);}
  const tele=window.__gp,off=R3.teleV.copy(R3.camera.position).sub(me.pos),ov=tele.cameraOffsetVector;ov.x=off.x;ov.y=off.y;ov.z=off.z;
  tele.playerWheelPhase=tele.wheelPhase=me.wheelPhase;tele.playerSpeed=tele.speed=me.speed;tele.wheelRadius=me.wheelRadius;tele.cameraFov=R3.camera.fov;tele.cameraOffsetFromCar=tele.cameraOffset=off.length();
  if(me.shadows&&me.shadows[0]){me.shadows[0].getWorldPosition(R3.teleShadow);tele.playerShadowWorldY=tele.shadowY=R3.teleShadow.y;}
  tele.bodyRoll=me.body.rotation.z;tele.smokeCount=R3.smoke.liveN;if(me.pic){R3.teleSprite.set(0,me.pic.bottomLocalY,0);me.pic.pl.localToWorld(R3.teleSprite);tele.spriteBottomY=R3.teleSprite.y;}else tele.spriteBottomY=me.pos.y;
  tele.rendererCalls=tele.renderCalls=R3.renderer.info.render.calls;tele.wheelPatchDrawCalls=R3.karts.reduce((n,k)=>n+(k.g.visible&&k.pic&&k.pic.wheelPatch&&k.pic.wheelPatch.mesh.visible?1:0),0);
  tele.wheelPatchVisible=!!(me.pic&&me.pic.wheelPatch&&me.pic.wheelPatch.mesh.visible);tele.wheelPatchState=me.pic&&me.pic.wheelPatch?me.pic.wheelPatch.state:"3d";tele.wheelPatchFrame=me.pic?me.pic.frame:null;tele.wheelPatchKind=me.pic&&me.pic.wheelPatch?me.pic.wheelPatch.kind:"3d";
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
  const board=R3.board.slice(),story=R3.story,cid=R3.C.id,timeS=gpFmt(R3.time),trap=R3.trapBest,podium=place<=3&&!story&&board.length>=3;
  const steps=GP_WORLD.podium.steps,stepHtml=podium?'<div class="fz-podium" style="--pod:url('+GP_WORLD.podium.src+')">'+[["p1",0],["p2",1],["p3",2]].map(([k,i])=>{const r=board[i];const st=steps[k];return'<div class="fz-step'+(r.player?" me":"")+'" style="left:'+(st[0]*100).toFixed(1)+'%;top:'+(st[1]*100).toFixed(1)+'%">'+gpThumb(r.racer.car.id)+'<b>'+esc(r.racer.n)+'</b></div>';}).join("")+'</div>':"";
  const panel=()=>{if(!R3)return;const w=$("gp3");if(!w)return;w.insertAdjacentHTML("beforeend",'<div class="gp3-finish'+(podium?" pod":"")+'">'+(podium?'<video class="fz-podvid" muted loop playsinline webkit-playsinline preload="none" disablepictureinpicture aria-hidden="true"></video>':'')+'<div class="fz-fin-t">'+gpOrd(place).toUpperCase()+' PLACE'+(place===1?' 🏆':'')+'</div>'+stepHtml+'<div class="fz-res">'+rows+'</div><div class="fz-fin-s">'+timeS+' · Skill '+gpNum(skill)+(trap?' · Speed trap '+trap+' mph':'')+(earned?' · +'+earned+' XP':'')+'</div><div class="fz-fin-up" id="fzFinUp"></div><div class="btn-row" style="margin-top:10px"><button class="btn big" onclick="startRace3D(\''+cid+'\')">Race again 🔁</button><button class="btn secondary big" onclick="renderCircuits()">Routes 🏁</button><button class="btn secondary big" onclick="renderRace()">Cars 🚗</button></div></div>');
    const pv=w.querySelector(".fz-podvid");if(pv){setTimeout(()=>{if(!document.contains(pv))return;pv.src=GP_VIDEO.podium;const p=pv.play();if(p&&p.catch)p.catch(()=>{});},400);}
    if(podium)gpConfetti(w.querySelector(".gp3-finish"));
    if(!R3.upDone){R3.upDone=true;gpUpPicker(w,msg=>{const e=$("fzFinUp");if(e&&msg){e.textContent="New: "+msg;e.classList.add("on");}});}};
  setTimeout(()=>{if(!R3)return;GPA.stopEngine();if(place===1&&!story){gpVideo(GP_VIDEO.win,"HORIZON CHAMPION · "+R3.C.name.toUpperCase(),9000).then(panel);}else panel();},1300);
}
