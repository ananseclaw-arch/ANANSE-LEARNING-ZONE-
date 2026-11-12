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
let GPN=null;   // the online room (Race a friend) this device is in; null = plain single-player
const GP_CARS=[
 {id:"falcon",grp:"racers",n:"Rosso Falcon",kind:"GT racer",cls:"S2",pi:940,type:"super",paint:"#c8101a",fin:"solid",speed:4,grip:5,handle:5,accel:4,bio:"Red GT race car, number 7. Big rear wing, glued to the road."},
 {id:"arrow",grp:"exotics",n:"Silver Arrow",kind:"Electric hypercar",cls:"S2",pi:960,type:"hyper",paint:"#c4c8ce",fin:"metallic",speed:5,grip:3,handle:3,accel:5,bio:"Silent electric rocket. Fastest off the line - brake early!"},
 {id:"viper",grp:"exotics",n:"Lagoon Viper",kind:"Supercar",cls:"S2",pi:950,type:"hyper",paint:"#0f6fb0",fin:"metallic",speed:5,grip:3,handle:4,accel:4,bio:"Wedge-shaped supercar. Huge speed on the long straights."},
 {id:"formula",grp:"racers",n:"Volta Formula",kind:"Open-wheel racer",cls:"S1",pi:930,type:"super",paint:"#4a1c8c",fin:"solid",speed:5,grip:4,handle:4,accel:3,bio:"Single-seater with big wings. Fast and grippy, gentle pick-up."},
 {id:"shogun",grp:"racers",n:"Shogun GT",kind:"Super coupe",cls:"S1",pi:900,type:"gt",paint:"#eceef0",fin:"pearl",speed:4,grip:4,handle:4,accel:4,bio:"Japanese super-coupe. Good at everything."},
 {id:"kente",grp:"racers",n:"Black Star Kente",kind:"Ghana special",cls:"S1",pi:900,type:"super",paint:"#c20f22",fin:"solid",speed:4,grip:4,handle:4,accel:4,bio:"Ghana's own sports car: red, gold and green with kente cloth and the Black Star."},
 {id:"kumasi",grp:"racers",n:"Kumasi V8",kind:"Muscle car",cls:"A",pi:840,type:"muscle",paint:"#e79a08",fin:"solid",speed:5,grip:2,handle:2,accel:4,bio:"Loud muscle car. Loves straights - slow down for the bends!"},
 {id:"rally",grp:"racers",n:"Alpine Rally",kind:"Rally car",cls:"A",pi:820,type:"rally",paint:"#1a4fb4",fin:"metallic",speed:3,grip:4,handle:5,accel:5,bio:"Rally hatchback. Best on dirt and tight twisty corners."},
 {id:"retro",grp:"racers",n:"Classic 59",kind:"Retro racer",cls:"A",pi:800,type:"gt",paint:"#174f35",fin:"solid",speed:3,grip:4,handle:4,accel:3,bio:"A 1950s racer, number 59. Smooth and easy to drive."},
 {id:"kei",grp:"racers",n:"Lemon Kei",kind:"Hot hatch",cls:"B",pi:700,type:"kei",paint:"#ecd640",fin:"solid",speed:2,grip:5,handle:5,accel:5,bio:"Tiny hot hatch. Nips round every corner, zippy pick-up."},
 {id:"ridge",grp:"trucks",n:"Thunder Ridge XL",kind:"Pickup / off-roader",cls:"A",pi:780,type:"suv",cam:{back:0.6,up:0.35},paint:"#1f3f8f",fin:"metallic",speed:3,grip:2,handle:2,accel:3,bio:"Big off-road pickup. Shrugs off dirt and bumps."},
 {id:"razor",grp:"exotics",n:"Razor Wedge",kind:"Wedge hypercar",cls:"S2",pi:970,type:"hyper",paint:"#7fb41e",fin:"pearl",speed:5,grip:4,handle:4,accel:5,bio:"Sharp as a blade, with doors that swing up. Blisteringly quick - brake early!"},
 {id:"aurora",grp:"exotics",n:"Aurora V12",kind:"V12 grand tourer",cls:"S1",pi:930,type:"gt",paint:"#142c63",fin:"metallic",speed:5,grip:3,handle:3,accel:4,bio:"Long-nosed V12 grand tourer. Huge top speed, smooth and heavy in the bends."},
 {id:"comet",grp:"exotics",n:"Comet LMP",kind:"Le Mans prototype",cls:"S2",pi:960,type:"super",paint:"#c21f66",fin:"solid",speed:5,grip:5,handle:4,accel:4,bio:"Endurance prototype with a shark fin. Glued to the road at high speed."},
 {id:"breeze",grp:"exotics",n:"Breeze Roadster",kind:"Open-top roadster",cls:"A",pi:860,type:"super",paint:"#1f9c94",fin:"metallic",speed:4,grip:4,handle:5,accel:4,bio:"Open-top roadster - you can see the driver! Light, nimble and fun."},
 {id:"monster",grp:"trucks",n:"Big Bouncer",kind:"Monster truck",cls:"B",pi:720,type:"truck",paint:"#2f9a35",fin:"solid",speed:2,grip:3,handle:3,accel:3,cam:{back:2.2,up:1.5},bio:"Giant wheels and a huge bounce. Slow on the straights, flies over every jump."},
 {id:"trophy",grp:"trucks",n:"Dune Hawk",kind:"Desert trophy truck",cls:"A",pi:790,type:"truck",paint:"#e0a406",fin:"solid",speed:3,grip:3,handle:3,accel:4,cam:{back:1.2,up:0.5},bio:"Long-travel desert racer. Floats over bumps, sand and dunes."},
 {id:"semi",grp:"trucks",n:"Thunder Hauler",kind:"Racing semi-truck",cls:"B",pi:700,type:"truck",paint:"#cf4f2c",fin:"solid",speed:3,grip:2,handle:2,accel:2,cam:{back:3.7,up:2.1},bio:"A big-rig cab with chrome stacks. Slow to get going, unstoppable once rolling."}
];
/* body shapes: z runs along the car, +z is the nose; all in metres */
const GP_SHAPE={
 super:{len:4.7,w:2.04,ride:0.2,rad:0.37,radR:0.39,xf:1.45,xr:-1.32,nose:0.5,hood:0.72,belt:0.8,deck:0.82,tail:0.68,cabF:0.5,roofF:-0.1,roofR:-0.9,cabR:-1.5,roof:1.1,wing:"lip",tyreW:0.3,tyreWR:0.38,hip:0.06},
 hyper:{len:4.8,w:2.1,ride:0.2,rad:0.38,radR:0.4,xf:1.5,xr:-1.35,nose:0.48,hood:0.7,belt:0.78,deck:0.8,tail:0.66,cabF:0.4,roofF:-0.2,roofR:-0.95,cabR:-1.5,roof:1.08,wing:"big",tyreW:0.3,tyreWR:0.4,hip:0.07},
 gt:{len:4.7,w:1.98,ride:0.24,rad:0.38,radR:0.38,xf:1.42,xr:-1.38,nose:0.58,hood:0.86,belt:0.92,deck:0.92,tail:0.8,cabF:0.3,roofF:-0.45,roofR:-1.25,cabR:-1.95,roof:1.26,wing:"duck",tyreW:0.3,tyreWR:0.34,hip:0.04},
 rally:{len:4.2,w:1.86,ride:0.34,rad:0.36,radR:0.36,xf:1.28,xr:-1.28,nose:0.68,hood:0.96,belt:1.02,deck:1.04,tail:1.02,cabF:0.55,roofF:-0.1,roofR:-1.4,cabR:-1.9,roof:1.48,wing:"roof",tyreW:0.28,tyreWR:0.28},
 muscle:{len:4.9,w:1.98,ride:0.26,rad:0.38,radR:0.4,xf:1.5,xr:-1.45,nose:0.64,hood:0.94,belt:0.98,deck:0.94,tail:0.84,cabF:0.1,roofF:-0.55,roofR:-1.3,cabR:-1.95,roof:1.32,wing:"duck",tyreW:0.3,tyreWR:0.36,hip:0.03},
 kei:{len:3.4,w:1.6,ride:0.3,rad:0.3,radR:0.3,xf:1.05,xr:-1.05,nose:0.7,hood:0.92,belt:0.98,deck:1.02,tail:1.0,cabF:0.75,roofF:0.2,roofR:-1.1,cabR:-1.5,roof:1.52,wing:"none",tyreW:0.24,tyreWR:0.24},
 truck:{len:5.6,w:2.3,ride:0.6,rad:0.6,radR:0.6,xf:1.8,xr:-1.8,nose:0.9,hood:1.5,belt:1.7,deck:1.8,tail:1.6,cabF:1.3,roofF:0.9,roofR:-1.2,cabR:-1.6,roof:2.4,wing:"none",tyreW:0.42,tyreWR:0.42,hip:0.02},
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
 {id:"kawaguchi",name:"Lake Kawaguchi Circuit",laps:2,stars:1,blurb:"Cherry blossom and Mount Fuji by the lake",tree:"cherry",hills:2.4,grass:0x7fa65a,lake:{x:30,z:-520,rx:420,rz:230},town:1,city:0.35,fuji:[40,-1180],
  look:{top:"#4f86cf",mid:"#a3c6e6",hor:"#f3d7ad",glow:"#ffe3b0",sun:"#ffd7a6",sunI:1.25,hemi:0.72,dir:[0.62,0.34,-0.58],haze:"#d9dcea",hill:"#5d6f98",time:"Golden hour by the lake",night:0,tint:[1,1,1]},
  story:{paper:"#f7f0e1",ink:"#2b2735",hill:"#a7c7a0",top:"#a9d8ee",hor:"#fbf3e2"},
  segs:[["S",120],["R",30,90],["S",97.32],["L",50,45],["R",50,90],["L",50,45],["S",48.6,{"h":4}],["R",22,55],["L",22,55],["S",75.96],["R",70,30],["L",70,30],["S",116.81,{"h":6}],["R",28,90],["S",105.63],["R",17,180],["S",62.38],["L",17,180],["S",72.54,{"j":1.8,"h":2}],["R",30,40],["L",30,40],["L",25,50],["R",25,50],["S",90.04],["R",40,90],["S",48.15],["L",24,90],["S",40.0,{"h":5}],["R",24,90],["S",77.72],["R",45,45],["L",45,90],["R",45,45],["S",40.0],["R",60,35],["L",60,35],["S",40.0,{"h":3}],["R",90,90],["S",214.52]]},
 {id:"hakone",name:"Hakone Mountain Circuit",laps:2,stars:2,blurb:"Cedar forest and mountain bends",tree:"cedar",hills:5.5,grass:0x5f8a46,lake:null,town:0,city:0,fuji:[-120,-1150],mtn:[{x:330,z:-60,r:260,h:30},{x:-330,z:120,r:220,h:28}],
  look:{top:"#5b92d6",mid:"#b2d0ea",hor:"#eadfc8",glow:"#fff0c8",sun:"#fff0d2",sunI:1.2,hemi:0.78,dir:[-0.5,0.5,-0.55],haze:"#cfd8e3",hill:"#4b6a8f",time:"Misty mountain morning",night:0,tint:[0.9,0.97,1.06]},
  story:{paper:"#f7f0e1",ink:"#2d2632",hill:"#c3b68c",top:"#8fb8e6",hor:"#fde3bf"},
  segs:[["S",110],["L",28,90],["S",150.0,{"h":4}],["L",40,45],["R",40,90],["L",40,45],["S",113.77,{"h":6}],["R",20,60],["L",20,60],["S",180.45,{"h":10}],["L",30,90],["S",100.0,{"h":14}],["L",20,180],["S",46.6,{"h":20}],["R",20,180],["S",69.26,{"h":26}],["R",45,50],["L",45,100],["R",45,50],["S",140.0,{"h":30,"j":2.6}],["L",26,90],["S",84.53,{"h":22}],["L",20,60],["R",20,60],["S",68.88,{"h":14,"j":2.4,"jat":0.35}],["L",50,45],["R",50,90],["L",50,45],["S",86.04,{"h":6}],["L",40,90],["S",95.13,{"h":3}],["R",24,90],["S",40.48],["L",24,90],["S",95.41,{"h":0}]]},
 {id:"tokyo",name:"Tokyo Bay Street Circuit",laps:2,stars:2,blurb:"Sunset over the bay and the city",tree:"mixed",sky:"dusk",hills:1.6,grass:0x7f9a5c,lake:{x:600,z:0,rx:300,rz:700,sea:1},town:0,city:1,fuji:[-200,-1200],
  look:{top:"#3c5f9e",mid:"#9ab2d6",hor:"#f7b98a",glow:"#ffc48a",sun:"#ffc07a",sunI:1.15,hemi:0.62,dir:[-0.75,0.28,-0.45],haze:"#d8c8c8",hill:"#5a5f86",time:"Sunset over the bay",night:0.5,tint:[1.1,0.9,0.8]},
  story:{paper:"#e8d3c6",ink:"#241c30",hill:"#7a7aa6",top:"#3b3f78",hor:"#f2a88e"},
  segs:[["S",130],["R",32,90],["S",114.1],["R",24,60],["L",24,60],["S",159.98,{"h":5}],["R",20,90],["S",43.59,{"h":7}],["L",20,90],["S",65.49,{"h":1}],["R",30,90],["S",225.98],["L",48,45],["R",48,90],["L",48,45],["S",80.48,{"j":1.8}],["R",17,180],["S",72.86],["L",17,180],["S",40.0,{"h":6}],["R",22,90],["S",40.0,{"h":8}],["L",26,45],["R",26,45],["S",63.61],["L",22,90],["S",40.0,{"h":2}],["R",22,90],["S",94.71],["R",100,90],["S",147.77],["L",30,40],["R",30,40],["S",219.85]]},
 /* ---- street + themed courses (theme: city / accra / coast) - built by gpThemeWorld; zones are lap fractions ---- */
 {id:"city",name:"City Circuit",theme:"city",laps:2,stars:3,tree:"none",hills:0.35,grass:0x8b9178,lake:null,town:0,city:0,fuji:null,ridges:0,downtown:[0.8,0.28],
  traffic:[["sedan",4],["hatch",3],["taxi",3],["van",2],["bus",2]],blurb:"Downtown streets, traffic, a tunnel and a canal bridge",
  
  look:{top:"#3f7fd6",mid:"#a9c8ea",hor:"#f0e2c8",glow:"#fff0c8",sun:"#fff1d6",sunI:1.5,hemi:0.55,dir:[0.55,0.6,-0.45],haze:"#cfd9e6",hill:"#5a6a88",time:"Sunny afternoon downtown",night:0,tint:[1,1,1]},
  story:{paper:"#f4efe6",ink:"#262a33",hill:"#a9b4c4",top:"#a9d0ee",hor:"#fbf3e2"},
  segs:[["S",150],["R",22,90],["S",58.81],["L",20,90],["S",90.05,{"h":4}],["R",20,90],["S",38.81],["R",28,45],["L",28,45],["S",170,{"z":"tunnel","h":4}],["S",38.81],["L",26,40],["R",26,40],["S",38.81],["R",40,90],["S",106.57,{"h":10}],["L",22,90],["S",38.81,{"h":14}],["R",18,90],["S",188.63,{"z":"bridge","j":3.4,"jat":0.72,"h":2}],["L",35,60],["R",35,60],["S",87.84],["R",40,30],["L",40,30],["S",84.71,{"h":1}],["R",20,90],["S",121.24],["L",18,90],["S",49.97],["R",18,90],["S",101.24],["R",16,180],["S",38.81],["L",16,180],["S",381.24,{"z":"avenue"}],["R",20,90],["S",100.05],["R",30,45],["L",30,45],["S",230.05]]},
 {id:"accra",name:"Accra Streets",theme:"accra",laps:2,stars:2,tree:"palm",hills:0.8,grass:0x9a9a5c,town:0,city:0,fuji:null,ridges:0,seaSide:-1,parkSide:1,
  traffic:[["ghtaxi",5],["trotro",4],["sedan",3],["hatch",2]],blurb:"Black Star Gate, the Labadi beach road, Osu shops",special:"gh",
  
  look:{top:"#2f86e0",mid:"#9cc9ef",hor:"#f3e3c3",glow:"#fff4d6",sun:"#fff4dc",sunI:1.6,hemi:0.6,dir:[0.35,0.8,-0.35],haze:"#e6dccb",hill:"#7d8a6a",time:"Hot sunny afternoon in Accra",night:0,tint:[1,1,1]},
  story:{paper:"#f8eedc",ink:"#2b2420",hill:"#c9b27a",top:"#8ec8f0",hor:"#fde9c4"},
  segs:[["S",140,{"z":"square"}],["R",30,90],["S",160.0,{"h":6}],["L",40,45],["R",40,45],["S",200.0,{"h":14}],["R",60,30,{"h":16}],["S",200.0,{"h":3,"j":2.6,"jat":0.3}],["R",25,60,{"z":["beach","sea"]}],["S",107.57,{"z":["beach","sea"],"h":1}],["L",60,40,{"z":["beach","sea"]}],["R",60,80,{"z":["beach","sea"]}],["L",60,40,{"z":["beach","sea"]}],["S",91.32,{"z":["beach","sea"]}],["R",30,40,{"z":["beach","sea"]}],["L",30,40,{"z":["beach","sea"]}],["S",88.56,{"z":["beach","sea"]}],["R",22,90],["S",100.22,{"z":"shops"}],["L",18,90,{"z":"shops"}],["S",57.45,{"z":"shops"}],["R",18,90,{"z":"shops"}],["S",222.55,{"z":"shops"}],["R",17,180,{"z":"shops"}],["S",80.0,{"z":"shops"}],["L",18,180,{"z":"shops"}],["S",81.37],["R",26,45],["L",26,45],["S",95.64],["R",18,90],["S",100.0,{"z":"park"}],["L",18,90],["S",77.68],["R",20,90],["S",290.77,{"z":"square"}]]},
 {id:"coast",name:"Coast Road",theme:"coast",laps:2,stars:1,roadFloor:0.7,tree:"none",hills:3.2,grass:0x7ea456,town:0,city:0,fuji:null,ridges:14,seaSide:-1,
  traffic:[["sedan",3],["hatch",2],["van",2],["trotro",1]],blurb:"Dirt lot, water splash, country lanes, highway bridge, forest",
  
  look:{top:"#4a83d0",mid:"#a8c7e8",hor:"#f6d3a3",glow:"#ffe0b0",sun:"#ffd9a8",sunI:1.45,hemi:0.6,dir:[-0.6,0.45,-0.5],haze:"#dbd7d0",hill:"#4f6a7f",time:"Golden evening on the coast",night:0,tint:[1.04,1,0.95]},
  story:{paper:"#f7f0e1",ink:"#2d2632",hill:"#a7c7a0",top:"#a9d8ee",hor:"#fbf3e2"},
  segs:[["S",120,{"z":"dirt"}],["R",25,90,{"z":"dirt"}],["S",60,{"z":"country"}],["S",40,{"z":["country","ford"],"h":-2}],["S",114.95,{"z":"country","j":3.3}],["L",32,60,{"z":"country"}],["R",32,120,{"z":"country"}],["L",32,60,{"z":"country"}],["S",86.82,{"z":"country","h":8}],["R",32,40,{"z":"country"}],["L",32,40,{"z":"country"}],["S",86.83,{"z":"country"}],["R",18,180,{"z":"country"}],["S",75.39,{"z":"country","h":12}],["L",18,180,{"z":"country"}],["S",67.9,{"z":"country"}],["R",35,90,{"z":"country"}],["S",223.28,{"z":["highway","sea"]}],["L",80,30,{"z":["highway","sea"]}],["R",80,30,{"z":["highway","sea"]}],["S",144.03,{"z":["highway","bridge","sea"],"j":3,"jat":0.85}],["R",80,90,{"z":["highway","sea"]}],["S",258.19,{"z":"highway","j":3.2}],["L",40,30,{"z":"highway"}],["R",40,30,{"z":"highway"}],["S",71.94,{"z":"highway"}],["R",24,50,{"z":"highway"}],["L",24,50,{"z":"highway"}],["S",97.63,{"z":"highway"}],["R",30,90,{"z":"forest"}],["L",28,45,{"z":"forest"}],["R",28,90,{"z":"forest"}],["L",28,45,{"z":"forest"}],["S",98.45,{"z":"forest"}],["S",290.21,{"z":"dirt"}]]},
 {id:"desert",name:"Desert Rally",theme:"desert",laps:2,stars:2,tree:"none",hills:1.4,dunes:15,grass:0xd6ad72,lake:null,town:0,city:0,fuji:null,ridges:0,fog:[110,820],
  blurb:"Sand dunes with big jumps, a red-rock canyon and arch, an oasis, a dry riverbed",
  look:{top:"#5f93d4",mid:"#e3cfa8",hor:"#f3c48a",glow:"#ffd9a0",sun:"#ffd29a",sunI:1.6,hemi:0.62,dir:[0.7,0.27,-0.55],haze:"#e8cba0",hill:"#b07a4a",time:"Hot desert afternoon, low sun",night:0,tint:[1.03,0.99,0.93]},
  story:{paper:"#f7ecd6",ink:"#3a2a1c",hill:"#d9a86a",top:"#a9d0ee",hor:"#fbe3bf"},
  segs:[["S",140,{"z":"camp"}],["R",30,90],["S",121.73,{"z":["dunes","sand"],"j":2.8}],["L",45,45,{"z":"dunes"}],["R",45,90,{"z":"dunes"}],["L",45,45,{"z":"dunes"}],["S",151.73,{"z":["dunes","sand"],"j":3.4,"jat":0.45,"h":7}],["R",35,60,{"z":"dunes"}],["L",35,60,{"z":"dunes"}],["S",121.73,{"z":["dunes","sand"],"j":3.0,"h":3}],["R",22,90],["S",226.96,{"z":"canyon","h":-1}],["L",28,45,{"z":"canyon"}],["R",28,90,{"z":"canyon"}],["L",28,45,{"z":"canyon"}],["S",216.62,{"z":["canyon","arch"]}],["R",18,180,{"z":"canyon"}],["S",91.73,{"z":"oasis"}],["L",18,180,{"z":"oasis"}],["S",219.05,{"z":"oasis","h":2}],["R",40,90],["S",150.99,{"z":["riverbed"],"h":-2}],["L",30,40],["R",30,40],["S",94.71,{"z":"sand"}],["R",60,45],["L",25,50],["R",25,50],["S",200.86],["R",50,45],["S",381.73,{"z":"camp"}]]},
 /* ---- Japan Countryside (job 1109-1435, the Forza-style reimagine): an open country road - a village, rice paddies, a cedar-forest climb with two hairpins, a cherry-blossom run home. Built by gpInakaWorld ---- */
 {id:"inaka",name:"Japan Countryside",theme:"inaka",laps:2,stars:2,tree:"none",hills:0.7,grass:0xaab283,lake:null,town:0,city:0,fuji:null,ridges:0,fog:[90,1250],cloud:0.5,
  mtn:[{x:-420,z:-330,r:260,h:46},{x:520,z:-80,r:300,h:40},{x:80,z:560,r:320,h:36},{x:-480,z:330,r:240,h:30}],
  blurb:"Rice fields, cedar forest, cherry blossom and a sleepy village at golden hour",
  look:{top:"#6f93c8",mid:"#bfd0e0",hor:"#f6dfb4",glow:"#ffe9c0",sun:"#ffd49a",sunI:2.05,hemi:0.58,dir:[0.58,0.33,-0.62],haze:"#d9d4c2",hill:"#5d7566",time:"Golden hour in the countryside",night:0,tint:[1,0.97,0.9]},
  story:{paper:"#f7f0e1",ink:"#2d2632",hill:"#a7c7a0",top:"#a9d8ee",hor:"#fbf3e2"},
  segs:[["S",150,{"z":"village"}],["R",60,45,{"z":"village"}],["S",79.31,{"z":"paddy"}],["R",80,20,{"z":"paddy"}],["L",80,20,{"z":"paddy"}],["S",41.42,{"z":"paddy"}],["L",45,40,{"z":"paddy"}],["R",45,40,{"z":"paddy"}],["S",231.69,{"z":"paddy","h":1}],["R",26,90,{"z":"forest"}],["S",380.0,{"z":"forest","h":8}],["L",30,50,{"z":"forest"}],["R",30,100,{"z":"forest"}],["L",30,50,{"z":"forest"}],["S",298.42,{"z":"forest","h":20,"j":2.4}],["R",18,180,{"z":"forest"}],["S",65.17,{"z":"forest","h":26}],["L",18,180,{"z":"forest"}],["S",283.22,{"z":"sakura","h":18}],["R",40,90,{"z":"sakura"}],["S",374.47,{"z":"sakura","h":7,"j":2.6,"jat":0.4}],["L",24,60,{"z":"village"}],["R",24,60,{"z":"village"}],["S",222.79,{"z":"village","h":2}],["R",30,90,{"z":"village"}],["S",267.09,{"z":"paddy"}],["L",28,45,{"z":"paddy"}],["R",28,45,{"z":"paddy"}],["S",364.82,{"z":"paddy"}],["L",50,30,{"z":"paddy"}],["R",50,75,{"z":"village"}],["S",221.31,{"z":"village"}]]},
 /* ---- Dakar Desert (job 1109-1629): a long rally stage in the open desert - a hard-packed piste, five big dunes the road climbs and drops off (each a crest
    you can fly from), a dry riverbed (wadi), rocky outcrops, a mud-brick village and the bivouac camp at the start. No kerbs, rails or grandstands: marker stakes and flags
    show the way. Segment tag dn = the height (m) of a whole dune under the road (its crest sits at jat along the straight). Built by gpDakarWorld ---- */
 {id:"dakar",name:"Dakar Desert",theme:"dakar",laps:2,stars:2,tree:"none",hills:0.8,grass:0xd79a55,lake:null,town:0,city:0,fuji:null,ridges:0,fog:[170,1500],cloud:0.24,
  blurb:"A real rally stage: giant sand dunes to fly off, a dry riverbed, rocks and the bivouac camp",
  look:{top:"#3f7fd4",mid:"#a9c6e2",hor:"#f3d6a8",glow:"#ffdca0",sun:"#ffc98a",sunI:2.25,hemi:0.5,dir:[0.6,0.25,-0.52],haze:"#ecc999",hill:"#c99a62",time:"Golden low sun over the dunes",night:0,tint:[1.03,0.98,0.9]},
  story:{paper:"#f7ecd6",ink:"#3a2a1c",hill:"#d9a86a",top:"#a9d0ee",hor:"#fbe3bf"},
  segs:[["S",170,{"z":"camp"}],["R",70,70,{"z":"piste"}],["S",354.39,{"z":"piste"}],["L",90,25,{"z":"piste"}],["R",90,25,{"z":"piste"}],["S",328.62,{"z":"dunes","dn":12,"j":2.6,"jat":0.55}],["R",60,60,{"z":"dunes"}],["S",442.4,{"z":"dunes","dn":18,"j":3.2,"jat":0.5}],["L",55,50,{"z":"dunes"}],["R",55,80,{"z":"dunes"}],["S",439.51,{"z":"dunes","dn":13,"j":3.0,"jat":0.5}],["R",28,60,{"z":"dunes","h":0}],["S",212.12,{"z":"wadi","h":-3.5}],["L",40,45,{"z":"wadi","h":-3.5}],["R",40,90,{"z":"wadi","h":-3.5}],["L",40,45,{"z":"wadi","h":-3.5}],["S",314.87,{"z":"wadi","h":-3.5}],["R",24,50,{"z":"rocks","h":0}],["S",130.0,{"z":"rocks"}],["L",30,60,{"z":"rocks"}],["R",30,60,{"z":"rocks"}],["S",361.31,{"z":"dunes","dn":16,"j":3.4,"jat":0.5}],["R",80,45,{"z":"dunes"}],["S",430.65,{"z":"dunes","dn":11,"j":2.6,"jat":0.5}],["L",45,40,{"z":"village"}],["R",45,85,{"z":"village"}],["S",170,{"z":"village"}],["S",244.67,{"z":"camp"}]]},
 /* ---- Coral Deep: starts on a sunny beach, dives under the sea (road ~16-20 m down), two ramps throw the car out of the water, then back up to the beach. The water line is y=C.deep.y ---- */
 {id:"deep",name:"Coral Deep",theme:"deep",laps:2,stars:2,deep:{y:0},farE:-36,tree:"none",hills:0.5,grass:0xe6d6a6,lake:null,town:0,city:0,fuji:null,ridges:0,fog:[240,1500],
  blurb:"Dive under the sea, dodge giant friendly animals, leap out of the water",
  look:{top:"#1f8fe6",mid:"#7fd2f7",hor:"#d4f3f8",glow:"#fff4d0",sun:"#fff4dc",sunI:1.7,hemi:0.78,dir:[0.38,0.78,-0.42],haze:"#cdeef5",hill:"#3f90a8",time:"Sunny day on the reef",night:0,tint:[1,1,1]},
  story:{paper:"#e6f4ef",ink:"#12324a",hill:"#9fd0c8",top:"#9fdcf0",hor:"#eafaf2"},
  segs:[["S",140,{"z":"beach"}],["R",32,90,{"z":"beach"}],["S",125.42,{"z":"beach"}],["L",42,45,{"z":"beach"}],["R",42,45,{"z":"beach"}],["S",298.52,{"z":"dive","h":-21}],["R",48,60,{"z":"deep"}],["L",48,60,{"z":"deep"}],["S",196.11,{"z":["deep","turtle"],"h":-19}],["R",24,90,{"z":"deep"}],["S",193.97,{"z":["deep","octo"],"h":-22}],["L",28,45,{"z":"deep"}],["R",28,45,{"z":"deep"}],["S",305.23,{"z":["deep","whale"],"h":-20}],["R",32,180,{"z":"deep"}],["S",210,{"z":["deep","leapup"],"h":-6}],["S",200,{"z":["deep","leapdown"],"h":-17,"leap":6,"jat":0.0}],["L",30,90,{"z":"deep"}],["S",40.38,{"z":"deep"}],["R",24,60,{"z":"deep"}],["L",24,60,{"z":"deep"}],["S",150.0,{"z":["deep","manta"],"h":-21}],["L",30,90,{"z":"deep"}],["S",247.3,{"z":["deep","shark"],"h":-18}],["R",54,45,{"z":"deep"}],["L",54,45,{"z":"deep"}],["R",26,90,{"z":"deep"}],["S",200,{"z":["deep","leapup"],"h":-6}],["S",170,{"z":["deep","leapdown"],"h":-14,"leap":6,"jat":0.0}],["R",38,90,{"z":"deep"}],["S",181.86,{"z":"surface","h":0}],["L",50,30,{"z":"beach"}],["R",50,30,{"z":"beach"}],["S",60.0,{"z":"beach"}]]}
];
/* walk the segment list: a point every ~4 m on straights (jump crests need the detail) and every ~4 m (or 15 degrees) round arcs;
   the last point is the start again, so it is dropped. Segments may carry an options object (after the numbers):
   z = zone name(s) for the themed scenery, h = road height (m) at the END of the segment, j = jump crest height (m) on a straight
   (jat = where along it, 0..1, default 0.5). Zones, the sea and the elevation profile are all worked out from these tags. */
function gpTrackPts(segs){const pts=[];let x=0,z=0,h=0,since=99;const push=()=>{pts.push([+x.toFixed(2),+z.toFixed(2)]);since=0;};push();
  segs.forEach(sg=>{const arc=sg[0]!=="S",R=sg[1],L=arc?R*sg[2]*Math.PI/180:sg[1],sgn=sg[0]==="R"?1:-1,every=arc?Math.min(4,R*0.26):Math.min(4,L/Math.max(1,Math.round(L/4)));let d=0;
    while(d<L-0.01){const st=Math.min(0.5,L-d);x+=Math.sin(h)*st;z-=Math.cos(h)*st;if(arc)h+=sgn*st/R;d+=st;since+=st;if(since>=every-0.001&&L-d>2)push();}push();});
  pts.pop();return pts;}
function gpSegOpt(sg){const o=sg[0]==="S"?sg[2]:sg[3];return(o&&typeof o==="object")?o:{};}
function gpSegLen(sg){return sg[0]==="S"?sg[1]:sg[1]*sg[2]*Math.PI/180;}
/* MEGA ramps per course: [segment index, how far along it the lip sits]. All on long straights with a safe run-out after the lip, away from
   tunnels, arches and start gantries (checked in the tests by flying off every one of them). */
const GP_MEGA={kawaguchi:[[38,0.35],[12,0.3]],hakone:[[9,0.3],[2,0.3]],tokyo:[[11,0.35],[33,0.35],[5,0.3]],city:[[35,0.35],[40,0.25],[27,0.3]],accra:[[22,0.3],[5,0.3]],coast:[[22,0.3],[17,0.3],[34,0.35]],desert:[[30,0.4],[11,0.3],[19,0.3]],inaka:[[28,0.35],[10,0.3]],dakar:[[2,0.35],[16,0.3]]};
const GP_MEGA_H=4;
/* road height profile along the lap (metres, before the terrain under it): smooth (cosine) between the tagged heights, plus a
   kicker for every jump - a long concave ramp up that ends with real slope at the lip (that slope x speed = the launch), then a short drop.
   [d, height, kind]: kind "mega" = big chevron kicker; "hill" = a crest added on a hill top or bridge; otherwise a route-tagged jump crest. */
function gpJumpShape(J){return J[2]==="leap"?{ra:62,fb:15,p:1.6}:J[2]==="mega"?{ra:44,fb:16,p:2}:{ra:26+4*J[1],fb:10+1.5*J[1],p:1.7};}
function gpHillsRaw(C,d){const K=C.ekeys;for(let k=1;k<K.length;k++){if(d<=K[k][0]){const a=K[k-1],b=K[k],t=(d-a[0])/Math.max(1e-6,b[0]-a[0]);return a[1]+(b[1]-a[1])*(0.5-0.5*Math.cos(Math.PI*t));}}return 0;}
/* Dakar Desert: a whole dune under the road - a long windward climb (6.5 m of road per metre of height), the crest, a shorter lee slope down */
function gpDuneShape(H,u){const up=H*6.5,dn=H*5;return(u<=-up||u>=dn)?0:H*(u<0?0.5-0.5*Math.cos(Math.PI*(1+u/up)):0.5+0.5*Math.cos(Math.PI*u/dn));}
function gpDuneBody(C,d){if(!C.dnl)return 0;let y=0;for(const q of C.dnl){let u=d-q[0];if(u>C.lapM/2)u-=C.lapM;else if(u<-C.lapM/2)u+=C.lapM;y+=gpDuneShape(q[1],u);}return y;}
function gpElevAt(C,d){const L=C.lapM;d=((d%L)+L)%L;
  if(!C.eprof){const n=Math.ceil(L/2),raw=new Float32Array(n),o=new Float32Array(n),r=30;for(let i=0;i<n;i++)raw[i]=gpHillsRaw(C,i*L/n);   // hills blurred over ~60 m: rolling, never a kink that throws the car
    const w=[];let ws=0;for(let k=-r;k<=r;k++){const v=Math.exp(-k*k/(2*(r/2)*(r/2)));w.push(v);ws+=v;}for(let i=0;i<n;i++){let s=0;for(let k=-r;k<=r;k++)s+=raw[((i+k)%n+n)%n]*w[k+r];o[i]=s/ws;}C.eprof=o;}
  const P=C.eprof,n=P.length,f=d/L*n,i0=Math.floor(f)%n,u=f-Math.floor(f);let y=P[i0]*(1-u)+P[(i0+1)%n]*u+gpDuneBody(C,d);
  for(const J of C.jumps){let u=d-J[0];if(u>L/2)u-=L;else if(u<-L/2)u+=L;const sh=gpJumpShape(J);if(u>-sh.ra&&u<sh.fb){y+=u<0?J[1]*Math.pow(1+u/sh.ra,sh.p):J[1]*Math.pow(1-u/sh.fb,2);}}
  return y;}
GP_CIRCUITS.forEach(c=>{c.pts=gpTrackPts(c.segs);c.mainS=[c.segs[c.segs.length-1][1],c.segs[0][1]];
  c.lapM=c.segs.reduce((d,q)=>d+gpSegLen(q),0);c.km=c.lapM/1000;
  // distance along the lap of every point, scaled so the last point closes the loop at lapM
  {let d=0;const D=[0];for(let i=1;i<c.pts.length;i++){d+=Math.hypot(c.pts[i][0]-c.pts[i-1][0],c.pts[i][1]-c.pts[i-1][1]);D.push(d);}
    const close=d+Math.hypot(c.pts[0][0]-c.pts[c.pts.length-1][0],c.pts[0][1]-c.pts[c.pts.length-1][1]),f=c.lapM/close;c.ptsD=D.map(v=>v*f);}
  // zones (lap fractions) and elevation keys from the segment tags
  const Z={},keys=[[0,0]],jumps=[],dnl=[];let d=0;
  c.segs.forEach((sg,si)=>{const L=gpSegLen(sg),o=gpSegOpt(sg);[].concat(o.z||[]).forEach(n=>{const r=Z[n]||(Z[n]=[]),last=r[r.length-1],a=d/c.lapM,b=(d+L)/c.lapM;if(last&&Math.abs(last[1]-a)<1e-6)last[1]=b;else r.push([a,b]);});
    if(typeof o.h==="number")keys.push([d+L,o.h]);if(typeof o.dn==="number")dnl.push([d+L*(typeof o.jat==="number"?o.jat:0.5),o.dn]);const mg=(GP_MEGA[c.id]||[]).find(q=>q[0]===si);if(mg)jumps.push([d+L*mg[1],GP_MEGA_H,"mega"]);else if(typeof o.leap==="number"&&sg[0]==="S")jumps.push([d+L*(o.jat||0),o.leap,"leap"]);else if(typeof o.j==="number"&&sg[0]==="S")jumps.push([d+L*(typeof o.jat==="number"?o.jat:0.5),o.j]);d+=L;});
  keys.push([c.lapM,0]);c.ekeys=keys;c.jumps=jumps;c.eprof=null;if(dnl.length)c.dnl=dnl;
  // hill tops: every crest of the rolling profile that sits on a straight, with room to land after it, gets its own small kicker, so hills throw the car too
  {const segAt=[];let dd=0;c.segs.forEach(sg=>{const L=gpSegLen(sg),o=gpSegOpt(sg);segAt.push({a:dd,b:dd+L,st:sg[0]==="S",tun:[].concat(o.z||[]).includes("tunnel")||[].concat(o.z||[]).includes("arch")});dd+=L;});
    const n=Math.ceil(c.lapM/4),H=[];for(let i=0;i<n;i++)H.push(gpHillsRaw(c,i*c.lapM/n));const add=[];
    for(let i=0;i<n&&!c.dnl;i++){const r=20;let top=true,lo=1e9;for(let k=-r;k<=r;k++){const v=H[((i+k)%n+n)%n];if(v>H[i]+1e-6)top=false;lo=Math.min(lo,v);}if(!top||H[i]-lo<1.5)continue;const dH=i*c.lapM/n,sg=segAt.find(q=>q.st&&dH>=q.a&&dH<=q.b+30);if(!sg)continue;const sgB=segAt.find(q=>dH+55>=q.a&&dH+55<q.b);
      const dp=Math.min(sg.b-40,dH);if(dp<sg.a+25)continue;if(jumps.concat(add).some(q=>{let u=Math.abs(q[0]-dp);u=Math.min(u,c.lapM-u);return u<90;})||sg.tun||(sgB&&sgB.tun))continue;add.push([dp,2,"hill"]);}
    add.forEach(q=>jumps.push(q));}
  Object.keys(Z).forEach(n=>{const r=Z[n];if(r.length>1&&r[0][0]<1e-6&&r[r.length-1][1]>1-1e-6){r[0][0]=r.pop()[0];}});   // a zone across the start line wraps (a > b)
  if(Object.keys(Z).length){c.zones=Z;if(Z.sea)c.seaZone=Z.sea[0].slice();}
  if(c.seaZone&&c.seaSide){   // the sea: a huge ellipse beyond the beach / highway side; its shore sits ~60 m out from the road's outermost bulge
    const P=c.pts,n=P.length,i0=Math.floor(c.seaZone[0]*n),i1=Math.floor(c.seaZone[1]*n),im=(i0+i1)>>1;let mx=0,mz=0;for(let i=i0;i<=i1;i++){mx+=P[i][0];mz+=P[i][1];}mx/=(i1-i0+1);mz/=(i1-i0+1);
    const a=P[i0],b=P[i1],tx=b[0]-a[0],tz=b[1]-a[1],tl=Math.hypot(tx,tz)||1,nx=-tz/tl*c.seaSide,nz=tx/tl*c.seaSide;   // the zone's overall direction (esses must not tilt the coast)
    let out=0;for(let i=i0;i<=i1;i++)out=Math.max(out,(P[i][0]-mx)*nx+(P[i][1]-mz)*nz);
    let cx=0,cz=0;P.forEach(p=>{cx+=p[0];cz+=p[1];});cx/=n;cz/=n;const R=520,along=1400,ew=Math.abs(nx)>Math.abs(nz),off=out+0.98*R;
    c.lake={x:mx+nx*off-cx,z:mz+nz*off-cz,rx:ew?R:along,rz:ew?along:R,sea:1};}});
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
const GP_LOOK_DEFAULT="real";   /* Realistic by default (Eb 2026-11-12: "realistic cars, not cartoons"); Cartoon stays as an optional style. A saved Look is always respected */
const GP_LOOKS=["toon","real","story"];
function gpLook(){if(GPN&&GPN.look)return GPN.look;const v=(P&&P.gpLook)||window._gpLook;return GP_LOOKS.includes(v)?v:GP_LOOK_DEFAULT;}   // in a Race-a-friend room the host's look wins for everyone; the player's own saved Look is never touched, so it is simply back when they leave
function gpStory(){return gpLook()==="story";}
function gpToon(){return gpLook()==="toon";}
function gpFx(){return gpOpt("gpFx","auto")==="off"?"off":"auto";}   // ✨ Effects option: light rays, sparkle, glow (auto = on, switched off by itself if the frame rate drops)
function gpStats(car){const g=car.grip||car.handle;return{max:44+car.speed*3.6,accel:9+car.accel*2.2,steer:1.4+car.handle*0.28,offF:car.type==="truck"?0.74:(car.type==="rally"||car.type==="suv"?0.62:0.45),gripK:0.9+g*0.04,dirtK:car.type==="truck"?1.35:(car.type==="rally"||car.type==="suv"?1.25:1)};}   // v4 (job 1104-2330): ~30% more top speed; grip differs per car
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
    e.f.frequency.setTargetAtTime((240+rf*1800)*(1-0.62*(this.under||0)),t,0.05);e.g.gain.setTargetAtTime(0.026+load*0.05,t,0.08);e.ng.gain.setTargetAtTime((screech===true?1:(+screech||0))*0.05,t,0.05);},
  stopEngine(){const e=this.eng;if(!e)return;try{e.g.gain.setTargetAtTime(0,this.ctx.currentTime,0.05);e.ng.gain.setTargetAtTime(0,this.ctx.currentTime,0.05);const s=this.ctx.currentTime+0.3;e.o1.stop(s);e.o2.stop(s);e.ns.stop(s);}catch(x){}this.eng=null;},
  tone(freq,dur,type,vol,slideTo,delay){if(!this.ctx)return;try{const c=this.ctx,t=c.currentTime+(delay||0);const o=c.createOscillator(),g=c.createGain();o.type=type||"sine";o.frequency.setValueAtTime(freq,t);if(slideTo)o.frequency.exponentialRampToValueAtTime(slideTo,t+dur);
    g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol||0.2,t+0.01);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);o.connect(g);g.connect(this.master);o.start(t);o.stop(t+dur+0.05);}catch(e){}},
  noise(dur,vol,freq,delay){if(!this.ctx||!this.noiseBuf)return;try{const c=this.ctx,t=c.currentTime+(delay||0);const s=c.createBufferSource();s.buffer=this.noiseBuf;const f=c.createBiquadFilter();f.type="bandpass";f.frequency.value=freq||1000;f.Q.value=1.2;const g=c.createGain();
    g.gain.setValueAtTime(vol||0.2,t);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);s.connect(f);f.connect(g);g.connect(this.master);s.start(t);s.stop(t+dur+0.05);}catch(e){}},
  box(f,delay){if(!this.ctx)return;try{const c=this.ctx,t=c.currentTime+(delay||0);[[1,0.2],[2.01,0.055],[3.98,0.022]].forEach(([m,v])=>{const o=c.createOscillator(),g=c.createGain();o.type="sine";o.frequency.value=f*m;g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(v,t+0.005);g.gain.exponentialRampToValueAtTime(0.0001,t+1.3/m);o.connect(g);g.connect(this.master);o.start(t);o.stop(t+1.4);});}catch(e){}},
  play(n,a){switch(n){
    case"wings":this.noise(0.5,0.3,2400);this.tone(240,0.34,"sawtooth",0.1,1250);this.tone(1400,0.16,"triangle",0.1,2100,0.22);break;
    case"ring":{const q=Math.min(9,(a||1)-1);this.tone(880*Math.pow(1.0595,q*2),0.14,"triangle",0.17);this.tone(1760*Math.pow(1.0595,q*2),0.18,"sine",0.08,null,0.05);break;}
    case"jetfold":this.noise(0.42,0.2,1100);this.tone(760,0.42,"triangle",0.08,230);break;
    case"fuel":this.tone(620,0.1,"square",0.08);this.tone(620,0.1,"square",0.08,null,0.17);break;
    case"splashout":this.noise(0.55,0.34,1500);this.noise(0.35,0.24,3200,0.06);this.tone(240,0.22,"sine",0.13,620);break;
    case"splashin":this.noise(0.5,0.38,800);this.noise(0.45,0.2,2400,0.05);this.tone(420,0.3,"sine",0.14,110);[0.12,0.22,0.3].forEach((d,i)=>this.tone(520+i*170,0.09,"sine",0.06,1100,d));break;
    case"boing":this.tone(190,0.34,"sine",0.26,520);this.tone(520,0.18,"triangle",0.1,240,0.1);[0.08,0.17,0.26].forEach((d,i)=>this.tone(600+i*210,0.08,"sine",0.07,1200,d));break;
    case"beep":this.tone(660,0.2,"square",0.12);break;
    case"go":this.tone(1320,0.5,"square",0.14);break;
    case"shift":this.noise(0.07,0.1,2200);this.tone(190,0.09,"square",0.05,110);break;
    case"skill":this.tone(1180,0.09,"triangle",0.12);break;
    case"bank":this.tone(880,0.12,"triangle",0.18);this.tone(1320,0.2,"triangle",0.18,null,0.08);this.tone(1760,0.3,"triangle",0.14,null,0.16);break;
    case"trap":this.noise(0.05,0.25,4000);this.tone(1760,0.18,"sine",0.14,null,0.04);break;
    case"break":this.tone(300,0.3,"sawtooth",0.1,120);break;
    case"bump":this.tone(150,0.18,"square",0.16,80);this.noise(0.15,0.25,500);break;
    case"boost":this.noise(0.55,0.32,1100);this.tone(180,0.55,"sawtooth",0.1,720);break;
    case"land":this.tone(95,0.22,"sine",0.26,48);this.noise(0.18,0.28,320);break;
    case"spin":this.noise(0.6,0.16,1500);this.tone(420,0.5,"sawtooth",0.05,180);break;
    case"trick":this.noise(0.32,0.2,2400);this.tone(420,0.3,"triangle",0.09,1100);break;
    case"cheer":this.noise(0.9,0.2,1500);this.noise(0.7,0.12,2600,0.1);[784,988,1175,1568].forEach((f,i)=>this.tone(f,0.2,"triangle",0.16,null,i*0.07));break;   // crowd roar + a rising arpeggio (no voice)
    case"wobble":this.tone(170,0.32,"sine",0.2,70);this.noise(0.2,0.14,420);this.tone(240,0.22,"triangle",0.08,120,0.1);break;
    case"bonk":this.tone(210,0.12,"triangle",0.13,130);this.noise(0.08,0.08,700);break;   // soft car-to-car bump
    case"lap":this.tone(990,0.15,"triangle",0.2);this.tone(1320,0.28,"triangle",0.2,null,0.12);break;
    case"fanfare":[523,659,784,1047].forEach((f,i)=>this.tone(f,0.3,"triangle",0.22,null,i*0.14));this.tone(1047,1.0,"triangle",0.2,null,0.62);this.tone(784,1.0,"triangle",0.12,null,0.62);break;}}
};


/* first tap anywhere on the racer screens wakes the game audio (iPad keeps WebAudio asleep until a gesture), so the first countdown beep is on time */
function gpAudioUnlock(){if(window._gpAU)return;window._gpAU=true;const f=()=>{GPA.init();if(GPA.ctx&&GPA.ctx.state==="running")["pointerdown","touchend","click","keydown"].forEach(t=>document.removeEventListener(t,f,true));};["pointerdown","touchend","click","keydown"].forEach(t=>document.addEventListener(t,f,true));}
/* ---------- one-time CSS: Horizon look (default) + storybook modifier ---------- */
function gpCss(){if(document.getElementById("gpV4Css")){gpStoryFont();return;}const s=document.createElement("style");s.id="gpV4Css";s.textContent=`
.gpn-entry{display:block;width:100%;min-height:68px;margin:0 0 10px;padding:9px 14px;border:0;border-bottom:5px solid #00a93f;border-radius:16px;background:#00ff66;color:#061a10;cursor:pointer;font-family:inherit;text-align:center}.gpn-entry b{display:block;font-size:22px;font-weight:900}.gpn-entry small{font-size:14px;font-weight:600}.gpn-entry:active{transform:translateY(3px);border-bottom-width:2px}
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
.fz-car.v4{gap:5px;border:3px solid rgba(255,255,255,.85);background:#1A1A24;box-shadow:0 6px 0 rgba(0,0,0,.35);transition:transform .15s}
.fz-car.v4.on{border-color:#FFDE47;box-shadow:0 6px 0 #b8901a,0 0 0 3px rgba(255,222,71,.35);animation:fzCarPop .32s cubic-bezier(.3,1.6,.5,1)}
@keyframes fzCarPop{0%{transform:scale(.94)}60%{transform:scale(1.04)}100%{transform:scale(1)}}
.fz-thumb{display:block;width:100%;aspect-ratio:2/1;border-radius:10px;background:var(--bg) center/contain no-repeat,radial-gradient(ellipse at 50% 85%,#3a4a66,#1f2638 70%)}
.fz-gtabs{display:flex;gap:10px;margin:6px 0 14px;padding:0}
.fz-gtabs button{flex:1;min-height:72px;border-radius:18px;border:4px solid #2F4F4F;background:#1E90FF;color:#fff;font-family:inherit;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;box-shadow:0 7px 0 #2F4F4F;transform:translateY(0);transition:transform .1s,box-shadow .1s;-webkit-tap-highlight-color:transparent}
.fz-gtabs button i{font-style:normal;font-size:22px;line-height:1}.fz-gtabs button b{font-size:clamp(15px,2vw,20px);font-weight:900;letter-spacing:.05em;line-height:1.1}.fz-gtabs button small{font-size:11px;font-weight:800;opacity:.85}
.fz-gtabs button.on{background:#FFD700;color:#1d2a2a;transform:translateY(5px);box-shadow:0 2px 0 #2F4F4F,inset 0 3px 0 rgba(255,255,255,.6)}
.fz-car.v4[hidden]{display:none}
@media (min-width:900px){.fz-cars{grid-template-columns:repeat(4,minmax(0,1fr))}}
.fz-kind{align-self:flex-start;font-size:11px;font-weight:900;letter-spacing:.06em;text-transform:uppercase;color:#1A1A24;background:#12B0E8;border-radius:6px;padding:1px 7px}
.fz-st{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:900;color:#fff;text-transform:uppercase}
.fz-st i{width:48px;flex:none;font-style:normal}
.fz-st s{flex:1;display:flex;gap:3px;padding:3px;border-radius:6px;background:rgba(0,0,0,.35);text-decoration:none}
.fz-st em{flex:1;height:11px;border-radius:3px;background:rgba(255,255,255,.14)}
.fz-st.sp em.on{background:#FF3B30}.fz-st.gr em.on{background:#12B0E8}.fz-st.ac em.on{background:#FFDE47}
@media (max-width:520px){.fz-cars{grid-template-columns:1fr 1fr;gap:8px}.fz-car.v4{padding:8px}.fz-car.v4 small{display:none}.fz-car.v4 b{font-size:13px}.fz-st{font-size:9px;gap:4px}.fz-st i{width:36px}.fz-st em{height:8px}}
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
/* camera switch (job 1105-0558): big gold toy button with the current view written on it, above every overlay incl. the cockpit dash */
.gp3-wrap.v3 .fz-cam{position:absolute;right:12px;top:110px;z-index:7;width:clamp(68px,7vw,84px);height:clamp(68px,7vw,84px);border-radius:18px;border:4px solid #2F4F4F;background:#FFD700;color:#1d2a2a;box-shadow:0 6px 0 #2F4F4F,0 8px 18px rgba(0,0,0,.45);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;padding:0;cursor:pointer;touch-action:none;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none;font-family:inherit}
.gp3-wrap.v3 .fz-cam i{font-style:normal;font-size:clamp(24px,2.6vw,30px);line-height:1}
.gp3-wrap.v3 .fz-cam b{font-size:clamp(11px,1.1vw,13px);font-weight:900;letter-spacing:.04em;line-height:1}
.gp3-wrap.v3 .fz-cam:active,.gp3-wrap.v3 .fz-cam.dn{transform:translateY(5px);box-shadow:0 1px 0 #2F4F4F,0 3px 8px rgba(0,0,0,.4)}
.gp3-wrap.v3.ck .fz-cam{box-shadow:0 6px 0 #2F4F4F,0 0 0 3px rgba(255,255,255,.9),0 0 22px rgba(255,215,0,.85)}
/* BOOST: round orange button for the right thumb, left of the dial and above BRAKE, with a charge ring round it */
.gp3-wrap.v3 .fz-boost{position:absolute;z-index:6;left:14px;bottom:calc(12px + var(--pad) + 14px);width:var(--bst);height:var(--bst);border-radius:50%;border:0;padding:0;background:none;cursor:pointer;touch-action:none;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none;font-family:inherit;--bst:clamp(84px,8.4vw,104px)}
.gp3-wrap.v3 .fz-boost svg{position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg)}
.gp3-wrap.v3 .fz-boost .bg{fill:none;stroke:rgba(10,12,25,.6);stroke-width:9}
.gp3-wrap.v3 .fz-boost .rg{fill:none;stroke:#FF4500;stroke-width:9;stroke-linecap:round;transition:stroke-dashoffset .15s linear}
.gp3-wrap.v3 .fz-boost .core{position:absolute;inset:11%;border-radius:50%;background:radial-gradient(circle at 50% 35%,#ff9a3c,#FF4500 60%,#c2310a);border:4px solid #2F4F4F;box-shadow:0 5px 0 #2F4F4F;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;opacity:.55;transition:opacity .15s}
.gp3-wrap.v3 .fz-boost b{font-size:clamp(13px,1.35vw,17px);font-weight:900;font-style:italic;letter-spacing:.03em;text-shadow:0 2px 0 #7a1c00}
.gp3-wrap.v3 .fz-boost small{font-size:clamp(10px,1vw,12px);letter-spacing:2px;color:#ffe9a8;line-height:1}
.gp3-wrap.v3 .fz-boost.ready .core{opacity:1;animation:fzBoostRdy 1s ease-in-out infinite alternate}
.gp3-wrap.v3 .fz-boost.ready .rg{stroke:#FFD700}
.gp3-wrap.v3 .fz-boost.on .core{opacity:1;background:radial-gradient(circle at 50% 35%,#bff0ff,#2fb6ff 55%,#1c5fd1);transform:scale(.94)}
.gp3-wrap.v3 .fz-boost.on .rg{stroke:#7fd8ff}
.gp3-wrap.v3 .fz-boost.no .core{animation:fzBoostNo .3s}
@keyframes fzBoostRdy{from{box-shadow:0 5px 0 #2F4F4F,0 0 0 rgba(255,215,0,0)}to{box-shadow:0 5px 0 #2F4F4F,0 0 22px rgba(255,215,0,.9)}}
@keyframes fzBoostNo{0%,100%{transform:translateX(0)}30%{transform:translateX(-5px)}70%{transform:translateX(5px)}}
.gp3-wrap.v3.done .fz-boost,.gp3-wrap.v3.done .fz-cam,.gp3-wrap.v3.done .fz-trick,.gp3-wrap.v3.done .fz-nitro{display:none}
.gp3-wrap.v3:not(.done){touch-action:none}
/* JET MODE: fuel + rings top centre, the UP/DOWN rocker in the LEFT cluster with the arrows and BOOST (GAS and BRAKE stay on the right), an arrow back to the course */
.gp3-wrap.v3 .fz-jhud{position:absolute;z-index:7;left:50%;top:calc(10px + env(safe-area-inset-top));transform:translate(-50%,-140%);opacity:0;display:flex;align-items:center;gap:10px;padding:7px 14px;border-radius:15px;border:3px solid #00F0FF;background:rgba(13,17,39,.82);box-shadow:0 5px 0 rgba(13,17,39,.8),0 0 18px rgba(0,240,255,.5);transition:transform .22s cubic-bezier(.25,1.5,.5,1),opacity .15s;pointer-events:none;color:#fff;white-space:nowrap}
.gp3-wrap.v3.jet .fz-jhud{transform:translate(-50%,0);opacity:1}
.fz-jl{font-weight:900;font-style:italic;font-size:clamp(15px,1.9vw,21px);letter-spacing:.06em;color:#FF2A85;text-shadow:0 2px 0 #0D1127}
.fz-fuel{display:block;position:relative;width:clamp(116px,21vw,270px);height:clamp(14px,1.9vw,20px);border-radius:9px;background:#23284a;overflow:hidden;box-shadow:inset 0 2px 4px rgba(0,0,0,.6)}
.fz-fuel i{position:absolute;inset:0;transform-origin:0 50%;background:linear-gradient(90deg,#39FF14,#c8ff30);border-radius:9px}
.gp3-wrap.v3.jetlow .fz-fuel i{background:linear-gradient(90deg,#FF2A85,#ff8a30);animation:fzFuel .3s ease-in-out infinite alternate}
.gp3-wrap.v3.jetlow .fz-jhud{border-color:#FF2A85;box-shadow:0 5px 0 rgba(13,17,39,.8),0 0 22px rgba(255,42,133,.8)}
@keyframes fzFuel{from{opacity:1}to{opacity:.45}}
.fz-ja{font-weight:900;font-style:italic;font-size:clamp(13px,1.7vw,19px);color:#FFDD00;white-space:nowrap}.fz-ja:empty{display:none}.fz-jr{display:inline-flex;align-items:center;gap:5px;font-weight:900;font-size:clamp(14px,1.8vw,20px)}.fz-jr em{font-style:normal;color:#FFDD00;font-size:1.15em;line-height:1}.fz-jr b{font-weight:900;font-variant-numeric:tabular-nums;display:inline-block}.fz-jr b.hit{animation:fzRingHit .28s ease-out}
@keyframes fzRingHit{0%{transform:scale(1.55);color:#FFDD00}100%{transform:scale(1);color:#fff}}
/* FLIGHT CONTROLLER (Eb 2026-11-09): in the air the left arrows swap to one round D-pad. Up = climb, down = dive, left/right = steer, TRICK in the middle, on landing the arrows come back. The hit circle is 10px wider than the glass so every arm is 64px+ deep */
.gp3-wrap.v3{--flyD:clamp(200px,20vw,250px);--flyC:clamp(76px,7.6vw,92px);--flyL:14px;--flyB:12px}
.gp3-wrap.v3 .fz-fly{position:absolute;z-index:8;left:calc(var(--flyL) - 10px);bottom:calc(var(--flyB) - 10px);width:calc(var(--flyD) + 20px);height:calc(var(--flyD) + 20px);border-radius:50%;opacity:0;visibility:hidden;pointer-events:none;transform:translateY(18px) scale(.9);transition:opacity .2s ease,transform .2s cubic-bezier(.2,.9,.3,1.15),visibility 0s linear .2s;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent;cursor:pointer}
.gp3-wrap.v3.fly .fz-fly{opacity:1;visibility:visible;pointer-events:auto;transform:none;transition:opacity .2s ease,transform .2s cubic-bezier(.2,.9,.3,1.15),visibility 0s}
.fz-fly .rim{position:absolute;inset:10px;border-radius:50%;background:radial-gradient(circle at 50% 38%,rgba(255,255,255,.3),rgba(255,255,255,.08) 58%,rgba(13,17,39,.34));border:3px solid rgba(255,255,255,.72);box-shadow:0 8px 22px rgba(13,17,39,.42),inset 0 0 18px rgba(255,255,255,.22);-webkit-backdrop-filter:blur(5px) saturate(1.2);backdrop-filter:blur(5px) saturate(1.2);pointer-events:none;overflow:hidden}
.fz-fly .arm{position:absolute;inset:0;border-radius:50%;opacity:0;transition:opacity .06s;background:conic-gradient(from var(--a),#00F0FF 0deg 90deg,transparent 90deg)}
.fz-fly .arm.u{--a:-45deg}.fz-fly .arm.r{--a:45deg}.fz-fly .arm.d{--a:135deg}.fz-fly .arm.l{--a:225deg}
.fz-fly.u .arm.u,.fz-fly.r .arm.r,.fz-fly.d .arm.d,.fz-fly.l .arm.l{opacity:.9}
.fz-fly em{position:absolute;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;width:64px;height:64px;font-style:normal;color:#fff;text-shadow:0 2px 3px rgba(13,17,39,.85);pointer-events:none}
.fz-fly em i{font-style:normal;font-size:28px;line-height:1;transition:transform .06s}.fz-fly em b{font-size:12px;font-weight:900;font-style:italic;letter-spacing:.06em;line-height:1}
.fz-fly em.u{left:calc(50% - 32px);top:12px}.fz-fly em.d{left:calc(50% - 32px);bottom:12px}.fz-fly em.l{left:12px;top:calc(50% - 32px)}.fz-fly em.r{right:12px;top:calc(50% - 32px)}
.fz-fly.u em.u,.fz-fly.r em.r,.fz-fly.d em.d,.fz-fly.l em.l{color:#0D1127;text-shadow:none}
.fz-fly.u em.u i{transform:translateY(-3px)}.fz-fly.d em.d i{transform:translateY(3px)}.fz-fly.l em.l i{transform:translateX(-3px)}.fz-fly.r em.r i{transform:translateX(3px)}
.gp3-wrap.v3 .fz-flyt{position:absolute;left:50%;top:50%;width:var(--flyC);height:var(--flyC);margin:calc(var(--flyC)/-2) 0 0 calc(var(--flyC)/-2);padding:0;border-radius:50%;border:3px solid rgba(255,255,255,.82);background:radial-gradient(circle at 50% 30%,rgba(255,255,255,.42),rgba(255,42,133,.5) 72%);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0;font-family:inherit;touch-action:none;-webkit-tap-highlight-color:transparent;cursor:pointer;opacity:.6;transition:opacity .12s,background .06s,box-shadow .12s}
.fz-flyt i{font-style:normal;font-size:clamp(20px,2.2vw,28px);line-height:1;color:#FFE27A;text-shadow:0 2px 2px rgba(13,17,39,.65)}.fz-flyt b{font-size:clamp(11px,1.1vw,14px);font-weight:900;font-style:italic;letter-spacing:.04em;line-height:1;text-shadow:0 2px 2px rgba(13,17,39,.75)}
.gp3-wrap.v3 .fz-flyt.on{opacity:1;box-shadow:0 0 18px rgba(255,226,122,.85)}.gp3-wrap.v3 .fz-flyt.dn,.gp3-wrap.v3 .fz-flyt.spin{background:radial-gradient(circle at 50% 32%,#fff3a0,#FFDD00 62%,#ff9d00);color:#1A0B36;opacity:1}.fz-flyt.dn b,.fz-flyt.spin b{text-shadow:none}
.gp3-wrap.v3.fly.glide .fz-fly{opacity:.5}
.gp3-wrap.v3.fly .fz-trick{display:none!important}
.gp3-wrap.v3 .race-btn{transition:opacity .2s ease,transform .06s}
.gp3-wrap.v3.fly #rcL,.gp3-wrap.v3.fly #rcR{opacity:0}
.gp3-wrap.v3 .fz-boost{transition:left .2s ease,bottom .2s ease}
.gp3-wrap.v3.fly .fz-boost{left:calc(var(--flyL) + var(--flyD) + 16px);bottom:calc(var(--flyB) + 8px)}
@media (prefers-reduced-motion:reduce){.gp3-wrap.v3 .fz-fly{transform:none}.gp3-wrap.v3 .fz-boost{transition:none}}
.gp3-wrap.v3.done .fz-fly{display:none}
@media (max-height:520px),(orientation:portrait) and (max-width:600px){.gp3-wrap.v3{--flyD:172px;--flyC:64px;--flyL:calc(10px + env(safe-area-inset-left));--flyB:calc(10px + env(safe-area-inset-bottom))}}
@media (max-height:520px){.gp3-wrap.v3.fly .fz-boost{--bst:72px}}
@media (orientation:portrait) and (max-width:600px){.gp3-wrap.v3{--flyD:176px}.gp3-wrap.v3.fly .fz-boost{--bst:64px;z-index:9;left:calc(var(--flyL) + var(--flyD) + 4px);bottom:calc(var(--flyB) + 104px)}.gp3-wrap.v3.net.fly .gp3-plate .fz-boost{left:var(--flyL);bottom:calc(var(--flyB) + var(--flyD) - 14px);width:64px;height:64px;--bst:64px}}
@media (max-height:380px){.gp3-wrap.v3.fly .gp3-map{opacity:0}}
.gp3-wrap.v3.jet .fz-pedal.brake b{color:#FFDD00}
.fz-jback{position:absolute;z-index:6;left:50%;top:clamp(62px,12vh,100px);transform:translate(-50%,0) scale(.7);opacity:0;display:flex;align-items:center;gap:10px;padding:6px 14px;border-radius:13px;background:#FFDD00;color:#0D1127;border:3px solid #0D1127;font-weight:900;font-style:italic;font-size:clamp(14px,1.9vw,21px);white-space:nowrap;pointer-events:none;transition:transform .14s cubic-bezier(.25,1.6,.5,1),opacity .12s}
.fz-jback.on{opacity:1;transform:translate(-50%,0) scale(1)}.fz-jback i{font-style:normal;font-size:1.5em;line-height:1}.fz-jback.l i{animation:fzBackL .4s ease-in-out infinite alternate}.fz-jback.r i{animation:fzBackR .4s ease-in-out infinite alternate}
@keyframes fzBackL{to{transform:translateX(-7px)}}@keyframes fzBackR{to{transform:translateX(7px)}}
.gp3-wrap.v3.done .fz-jhud,.gp3-wrap.v3.done .fz-jback{display:none}
@media (max-height:520px),(orientation:portrait) and (max-width:600px){.fz-fuel{width:clamp(92px,28vw,150px)}.gp3-wrap.v3 .fz-jhud{gap:7px;padding:5px 9px;border-width:2px;top:calc(62px + env(safe-area-inset-top))}}
/* TRICK: only there while the car flies; big, chunky, pulsing */
.gp3-wrap.v3 .fz-trick{position:absolute;z-index:8;left:50%;bottom:calc(14px + env(safe-area-inset-bottom));width:clamp(112px,12vw,140px);height:clamp(112px,12vw,140px);margin-left:calc(clamp(112px,12vw,140px)/-2);border-radius:50%;border:5px solid #1A0B36;background:radial-gradient(circle at 50% 32%,#ff7ab5,#FF2A85 62%,#d40f63);color:#fff;box-shadow:0 8px 0 #1A0B36,0 0 34px rgba(255,42,133,.85);display:none;flex-direction:column;align-items:center;justify-content:center;gap:0;padding:0;cursor:pointer;touch-action:none;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none;font-family:inherit}
.gp3-wrap.v3 .fz-trick.on{display:flex;animation:fzTrick .42s ease-in-out infinite}
.gp3-wrap.v3 .fz-trick i{font-style:normal;font-size:clamp(34px,4vw,46px);line-height:1;color:#FFDD00;text-shadow:0 3px 0 #1A0B36}
.gp3-wrap.v3 .fz-trick b{font-size:clamp(18px,2vw,24px);font-weight:900;font-style:italic;letter-spacing:.03em;line-height:1;text-shadow:0 3px 0 #1A0B36}
.gp3-wrap.v3 .fz-trick.dn,.gp3-wrap.v3 .fz-trick.spin{box-shadow:0 2px 0 #1A0B36,0 0 44px rgba(255,221,0,.95);background:radial-gradient(circle at 50% 32%,#fff3a0,#FFDD00 60%,#ff9d00);color:#1A0B36}
.gp3-wrap.v3 .fz-trick.spin b{text-shadow:none}
@keyframes fzTrick{0%,100%{transform:scale(1) rotate(-3deg)}50%{transform:scale(1.13) rotate(3deg)}}
/* trick name while flying, +NITRO on a clean landing, a soft "wobbly" on a messy one */
.fz-nitro{position:absolute;left:50%;top:44%;z-index:5;transform:translate(-50%,-50%) scale(0);text-align:center;pointer-events:none;opacity:0;white-space:nowrap}
.fz-nitro b{display:block;font-size:clamp(30px,5vw,60px);font-weight:900;font-style:italic;color:#5DE416;-webkit-text-stroke:2px #1A0B36;text-shadow:0 4px 0 #1A0B36}
.fz-nitro small{display:inline-block;margin-top:3px;padding:2px 12px;border-radius:9px;background:#1A0B36;border:2px solid #00F0FF;color:#00F0FF;font-weight:900;font-size:clamp(14px,1.8vw,20px)}
.fz-nitro.t b{color:#FFDD00;font-size:clamp(24px,3.6vw,44px)}
.fz-nitro.m b{color:#ffb38a;font-size:clamp(24px,3.6vw,44px)}
.fz-nitro.on{animation:fzNitro 1.25s cubic-bezier(.25,1.4,.5,1) forwards}
.fz-nitro.t.on{animation-duration:.7s}
@keyframes fzNitro{0%{opacity:0;transform:translate(-50%,-50%) scale(.3) rotate(-6deg)}16%{opacity:1;transform:translate(-50%,-50%) scale(1.18) rotate(2deg)}30%{transform:translate(-50%,-50%) scale(1) rotate(0)}78%{opacity:1;transform:translate(-50%,-62%) scale(1)}100%{opacity:0;transform:translate(-50%,-90%) scale(.95)}}
/* the gauge visibly gulps nitro in: a cyan ring + a glow while it fills */
.gp3-wrap.v3 .fz-boost.fill .rg{stroke:#00F0FF;stroke-width:13;transition:stroke-dashoffset .06s linear}
.gp3-wrap.v3 .fz-boost.fill .core{opacity:1;animation:fzFill .3s ease-in-out infinite alternate}
@keyframes fzFill{from{box-shadow:0 5px 0 #2F4F4F,0 0 8px rgba(0,240,255,.5);transform:scale(1)}to{box-shadow:0 5px 0 #2F4F4F,0 0 34px rgba(0,240,255,1);transform:scale(1.09)}}
@media (max-height:520px),(orientation:portrait) and (max-width:600px){.gp3-wrap.v3 .fz-cam{top:calc(8px + env(safe-area-inset-top));right:calc(56px + env(safe-area-inset-right));width:68px;height:68px}.gp3-wrap.v3 .fz-boost{--bst:80px;left:calc(10px + env(safe-area-inset-left));bottom:calc(10px + env(safe-area-inset-bottom) + var(--pad) + 12px)}.gp3-wrap.v3 .fz-trick{width:92px;height:92px;margin-left:-46px;left:41%;bottom:calc(var(--ped) + 26px + env(safe-area-inset-bottom))}.gp3-wrap.v3 .fz-trick i{font-size:30px}.gp3-wrap.v3 .fz-trick b{font-size:17px}}
@media (orientation:portrait) and (max-width:600px){.gp3-wrap.v3 .fz-trick{left:auto;margin:0;right:calc(8px + env(safe-area-inset-right));bottom:calc(var(--ped) + var(--tach) + 34px + env(safe-area-inset-bottom))}.gp3-wrap.v3 .fz-jhud{top:calc(158px + env(safe-area-inset-top))}}
@media (orientation:portrait) and (min-width:601px){.gp3-wrap.v3 .fz-cam{right:calc(10px + var(--tach) + 10px)}}
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
.fz-cue{position:absolute;left:50%;top:17%;transform:translate(-50%,-50%) skewX(-8deg);z-index:4;display:flex;align-items:center;gap:.35em;padding:5px 20px;border-radius:10px;background:linear-gradient(#ff4b3e,#d81e2a);border:3px solid #1A1A24;color:#FFDE47;font-size:clamp(20px,3vw,36px);font-weight:900;font-style:italic;letter-spacing:.04em;-webkit-text-stroke:1.5px #1A1A24;text-shadow:0 3px 0 #1A1A24;opacity:0;pointer-events:none;transition:opacity .12s;box-shadow:0 5px 0 #1A1A24,0 0 26px rgba(255,59,48,.75);white-space:nowrap}
.fz-deepcue{position:absolute;left:50%;top:27%;z-index:4;display:flex;align-items:center;gap:.4em;padding:5px 16px 5px 10px;border-radius:999px;background:#0B1B3D;border:3px solid #00D2FF;box-shadow:0 5px 0 rgba(11,27,61,.55),0 0 18px rgba(0,210,255,.5);color:#fff;font-weight:900;font-size:clamp(15px,2.3vw,24px);letter-spacing:.03em;white-space:nowrap;pointer-events:none;opacity:0;transform:translate(-50%,-50%) scale(.6);transition:opacity .14s,transform .2s cubic-bezier(.3,1.7,.5,1)}
.fz-deepcue.on{opacity:1;transform:translate(-50%,-50%) scale(1)}
.fz-deepcue i{font-style:normal;font-size:1.3em}.fz-deepcue em{font-style:normal;color:#FFDF00;font-size:1.3em;line-height:1}
.gp3-wrap.v3.done .fz-deepcue{display:none}
.fz-wash{position:absolute;inset:0;z-index:2;pointer-events:none;opacity:0;background:radial-gradient(ellipse at 50% 45%,rgba(255,255,255,0) 28%,rgba(190,240,255,.42) 74%,rgba(235,250,255,.72) 100%)}
.fz-wash.on{animation:fzWash .55s ease-out}
@keyframes fzWash{0%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(14%)}}
.fz-cue i{font-style:normal;color:#fff;-webkit-text-stroke:1px #1A1A24}
.fz-air{position:absolute;left:50%;top:30%;transform:translate(-50%,-50%) scale(0);z-index:4;text-align:center;pointer-events:none;opacity:0}
.fz-air b{display:block;font-size:clamp(28px,4.4vw,54px);font-weight:900;font-style:italic;color:#FFDE47;-webkit-text-stroke:2px #1A1A24;text-shadow:0 4px 0 #1A1A24}
.fz-air small{display:inline-block;margin-top:2px;padding:1px 10px;border-radius:8px;background:#12B0E8;border:2px solid #1A1A24;color:#fff;font-weight:900;font-size:clamp(13px,1.6vw,18px)}
.fz-air.on{animation:fzAir 1.3s cubic-bezier(.25,1.4,.5,1) forwards}
@keyframes fzAir{0%{opacity:0;transform:translate(-50%,-50%) scale(.3) rotate(-8deg)}18%{opacity:1;transform:translate(-50%,-50%) scale(1.15) rotate(3deg)}32%{transform:translate(-50%,-50%) scale(1) rotate(0)}80%{opacity:1;transform:translate(-50%,-60%) scale(1)}100%{opacity:0;transform:translate(-50%,-80%) scale(.9)}}
.fz-cue.on{opacity:1;animation:fzCue .32s infinite alternate}
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
`;document.head.appendChild(s);gpStoryFont();}
function gpStoryFont(){if(gpStory()&&!document.getElementById("gpFont")){const l=document.createElement("link");l.id="gpFont";l.rel="stylesheet";l.href="https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap";document.head.appendChild(l);}}

/* ---------- menus: car select → route select → race ---------- */
function gpStop(){
  gpStopVideos();gpFzTurnStop();
  document.querySelectorAll(".fz-intro").forEach(e=>{try{const v=e.querySelector("video");if(v){v.pause();v.removeAttribute("src");v.load();}}catch(x){}e.remove();});
  if(window._gpPrev){try{window._gpPrev.r.dispose();window._gpPrev.r.forceContextLoss();}catch(e){}window._gpPrev=null;}
  if(!R3)return;
  if(R3.raf)cancelAnimationFrame(R3.raf);
  if(R3.mir){try{R3.mir.rt.dispose();}catch(e){}}
  window.removeEventListener("keydown",R3.kd);window.removeEventListener("keyup",R3.ku);window.removeEventListener("resize",R3.onResize);
  window.removeEventListener("orientationchange",R3.onOrient);document.removeEventListener("visibilitychange",R3.onVis);
  if(R3.blockTouch){document.removeEventListener("touchmove",R3.blockTouch);document.removeEventListener("gesturestart",R3.blockTouch);}
  GPA.stopEngine();
  try{const seen=new Set();R3.scene.traverse(o=>{if(o.geometry&&!seen.has(o.geometry)){seen.add(o.geometry);o.geometry.dispose();}
    const ms=Array.isArray(o.material)?o.material:(o.material?[o.material]:[]);ms.forEach(m=>{if(seen.has(m))return;seen.add(m);["map","emissiveMap","alphaMap"].forEach(k=>{if(m[k]&&!seen.has(m[k])){seen.add(m[k]);m[k].dispose();}});m.dispose();});});}catch(e){}
  try{if(R3.envRT)R3.envRT.dispose();}catch(e){}
  try{if(R3.post)R3.post.dispose();}catch(e){}
  try{if(R3.fz)R3.fz.dispose();if(R3.fzSky)R3.fzSky.dispose();if(R3.cenv)R3.cenv.dispose();}catch(e){}
  try{if(R3.pfx&&R3.pfx.bloom){R3.pfx.bloom.rt.dispose();R3.pfx.bloom.m.dispose();}if(R3.bake&&R3.renderer.shadowMap)R3.renderer.shadowMap.autoUpdate=true;}catch(e){}
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
function gpShellClass(){return "fadein fz-shell"+(gpStory()?" story":" fzm");}
function renderRace(){
  if(GPN)gpnLeave();clearTimers();closeOverlay();defocus();showAnanseCorner(false);gpStop();
  if(typeof kdWebgl==="function"&&!kdWebgl()){renderRace2D();return;}
  gpCss();gpAudioUnlock();document.body.classList.add("learningworld");
  const sel=gpCar().id,paint=gpPaint();
  // v4 garage (job 1104-2330): 11 real 3D cars; each card = in-game picture, type, and chunky 5-step Speed / Grip / Acceleration bars
  // (segmented "arcade" bars from the Gemini direction; selected card pops like the 60fps.design card/badge patterns)
  const seg=(k,v,cl)=>'<span class="fz-st '+cl+'"><i>'+k+'</i><s>'+[1,2,3,4,5].map(q=>'<em class="'+(q<=v?"on":"")+'"></em>').join("")+'</s></span>';
  const grp=window._gpGrp||(GP_CARS.find(c=>c.id===sel)||{}).grp||"racers";
  const cards=GP_CARS.map(c=>'<button class="fz-car v4'+(c.id===sel?" on":"")+'"'+((c.grp||"racers")===grp?'':' hidden')+' data-grp="'+(c.grp||"racers")+'" data-car="'+c.id+'" onclick="gpPickCar(\''+c.id+'\')" aria-label="'+esc(c.n)+'">'
    +'<span class="fz-thumb" style="--bg:url(assets/cars3d/thumbs/'+c.id+'.webp)"></span><span class="fz-kind">'+esc(c.kind||c.type)+'</span><b>'+esc(c.n)+'</b>'
    +seg("Speed",c.speed,"sp")+seg("Grip",c.grip||c.handle,"gr")+seg("Accel",c.accel,"ac")+'<small>'+esc(c.bio)+'</small></button>').join("");
  const sw=GP_PAINTS.map(h=>'<button class="fz-sw'+(h===paint?" on":"")+'" style="background:'+h+'" data-paint="'+h+'" onclick="gpPickPaint(\''+h+'\')" aria-label="Paint colour"></button>').join("");
  app.innerHTML='<div class="'+gpShellClass()+(GP_PICS[sel]?" pic":"")+'" id="fzShell" style="max-width:980px;margin:0 auto;padding:0 8px">'
   +gpHead("Festival garage · choose your car",GP_WORLD.title,"center 44%")+gpFzStageHtml()
   +'<div class="fz-gtabs" role="tablist">'+GP_GROUPS.map(g=>'<button role="tab" class="'+(g[0]===grp?'on':'')+'" data-grp="'+g[0]+'" aria-selected="'+(g[0]===grp)+'" onclick="gpPickGrp(\''+g[0]+'\')"><i>'+g[1]+'</i><b>'+g[2]+'</b><small>'+GP_CARS.filter(c=>(c.grp||"racers")===g[0]).length+' cars</small></button>').join('')+'</div>'
   +'<div class="fz-cars">'+cards+'</div>'
   +(GP_MESHY.has(sel)?'<div class="fz-paint-note" style="font-size:12px;opacity:.72">3D car shape made with Meshy (CC BY 4.0)</div>':'')+(GP_GLB[sel]?'<div class="fz-paint-note">🎨 Win races to unlock new paint and stickers for every car.</div>':'<div class="fz-paints">'+sw+'</div><div class="fz-paint-note">🎨 New paint colours come from race upgrades.</div>')+gpGarageHtml()
   +'<div class="center" style="margin-top:14px"><button class="btn big" onclick="renderCircuits()">Next: choose a route ▶</button></div>'
   +'<div class="btn-row" style="margin-top:12px"><button class="btn secondary" onclick="'+(P?'renderHome()':'renderProfiles()')+'">⟵ Back</button><button class="btn secondary" style="font-size:14px" onclick="renderRace2D()">Classic 2D racer</button></div><div class="spacer"></div></div>';
  gpDrawPreviews();gpFzStageSync();
  loadThree().then(()=>{gpDrawPreviews();gpFzStageSync();}).catch(()=>{});
  say("Grand Fable Horizon! Choose your car.");
}
function gpDrawPreviews(){if(!window.THREE)return;const pc=gpCar().id,pp=gpPaint();document.querySelectorAll("canvas[data-prev]").forEach(cv=>{const c=GP_CARS.find(x=>x.id===cv.dataset.prev);if(c)gpCarDraw(cv,c,c.id===pc?pp:c.paint);});}
const GP_GROUPS=[["racers","🏁","RACERS"],["exotics","💎","EXOTICS"],["trucks","🛻","TRUCKS"]];
function gpPickGrp(g){window._gpGrp=g;document.querySelectorAll(".fz-gtabs button").forEach(b=>{const on=b.dataset.grp===g;b.classList.toggle("on",on);b.setAttribute("aria-selected",on);});document.querySelectorAll(".fz-car.v4").forEach(b=>{b.hidden=b.dataset.grp!==g;});sfx("tick");}
function gpPickCar(id){if(P){P.gpCar=id;save();}else window._gpCar=id;document.querySelectorAll(".fz-car").forEach(b=>b.classList.toggle("on",b.dataset.car===id));const sh=$("fzShell");if(sh)sh.classList.toggle("pic",!!GP_PICS[id]);gpDrawPreviews();gpFzStageSync();sfx("tick");}
function gpPickPaint(h){if(P){P.gpPaint=h;save();}else window._gpPaint=h;document.querySelectorAll(".fz-sw").forEach(b=>b.classList.toggle("on",b.dataset.paint===h));gpDrawPreviews();sfx("tick");}
function gpPickRacer(id){gpPickCar(GP_CARS.some(c=>c.id===id)?id:"falcon");}
function gpMode(){if(GPN&&GPN.race)return"race";return (P&&P.gpMode)||window._gpMode||"free";}
function gpPace(){if(GPN&&GPN.race)return GPN.race.pace;return (P&&P.gpPace)||window._gpPace||"gentle";}
function gpPickPace(v){if(P){P.gpPace=v;save();}else window._gpPace=v;document.querySelectorAll(".fz-pace button").forEach(b=>b.classList.toggle("on",b.dataset.p===v));sfx("tick");}
function gpPaceMul(){const g=gpPace()==="gentle";return gpMode()==="free"?(g?0.62:0.8):(g?0.76:0.92);}
function gpPickMode(m){if(P){P.gpMode=m;save();}else window._gpMode=m;document.querySelectorAll(".fz-mode.fz-m button").forEach(b=>b.classList.toggle("on",b.dataset.m===m));sfx("tick");}
function gpAuto(){return !!(P?P.gpAuto:window._gpAuto);}
function gpPickAuto(v){if(P){P.gpAuto=!!v;save();}else window._gpAuto=!!v;document.querySelectorAll(".fz-auto button").forEach(b=>b.classList.toggle("on",(b.dataset.a==="1")===!!v));sfx("tick");}
function gpTrafficOn(){if(GPN&&GPN.race)return false;const v=P?P.gpTraffic:window._gpTrafficOpt;return v!==false;}
function gpPickLook(v){if(P){P.gpLook=v;save();}else window._gpLook=v;sfx("tick");renderCircuits(window._gpTab);}
/* ---------- options (saved on the profile, like the other racer choices) ---------- */
function gpOpt(k,def){const v=P?P[k]:window["_"+k];return v==null?def:v;}
function gpSetOpt(k,v){if(P){P[k]=v;save();}else window["_"+k]=v;}
const GP_VIEWS=["chase","far","hood","bumper","cockpit"],GP_VIEW_NAME={chase:"CHASE",far:"FAR",hood:"HOOD",bumper:"BUMPER",cockpit:"COCKPIT"};   // the 🎥 button cycles them in this order
function gpCamMode(){const v=gpOpt("gpCam","chase");return GP_VIEWS.includes(v)?v:"chase";}
function gpLaps(){if(GPN&&GPN.race)return GPN.race.laps;const n=+gpOpt("gpLaps",2);return n>=1&&n<=3?n:2;}
function gpPickOpt(k,v){if(k==="gpLook"){gpPickLook(v);return;}if(k==="gpTraffic")v=!!v;if(k==="gpLaps")v=+v;gpSetOpt(k,v);if(k==="gpPace")window._gpPace=v;
  document.querySelectorAll('.fz-opt[data-k="'+k+'"] button').forEach(b=>b.classList.toggle("on",b.dataset.v===String(v)));sfx("tick");}
const GP_TAG={dakar:["NEW · DAKAR RALLY","#ffb300"],inaka:["JAPAN","#ff8c00"],deep:["UNDERWATER","#00d2ff"],desert:["DESERT","#ffb347"],kawaguchi:["JAPAN","#ff5fa2"],hakone:["JAPAN","#ff5fa2"],tokyo:["JAPAN","#ff5fa2"],city:["CITY","#2fd3c3"],accra:["GHANA","#fcd116"],coast:["COAST","#4fa8ff"]};
function gpStars(n){let h="";for(let i=0;i<3;i++)h+='<i class="'+(i<n?"on":"")+'">★</i>';return'<span class="fz-stars" aria-label="'+n+' of 3 stars">'+h+'</span>';}
function gpTrackCard(c,i,best){const tg=GP_TAG[c.id]||["ROUTE","#fff"],b=best[c.id]||{},gh=c.special==="gh";
  return'<button class="fz-track'+(gh?" gh":"")+'" data-id="'+c.id+'" onclick="startRace3D(\''+c.id+'\')">'
   +'<span class="fz-tpic"><img src="assets/tracks/'+((!gpStory()&&GP_POSTERS[c.id])?'posters/':'')+c.id+'.webp?v=1" alt="" loading="lazy" decoding="async" onerror="if(this.src.indexOf(\'posters/\')>0)this.src=this.src.replace(\'posters/\',\'\');else this.remove()"><canvas id="gpMini'+i+'" width="160" height="110"></canvas>'
   +'<em class="fz-tag" style="--tg:'+tg[1]+'">'+tg[0]+'</em>'+(gh?'<em class="fz-gh"><i class="fz-flag"></i>🚐 trotro + taxis</em>':(c.traffic&&c.traffic.length?'<em class="fz-gh">🚕 traffic</em>':''))+'</span>'
   +(gh?'<span class="fz-kente"></span>':'')
   +'<b>'+esc(c.name)+'</b><span class="fz-trow">'+gpStars(c.stars||1)+'<span class="fz-km">'+c.km.toFixed(1)+' km</span></span>'
   +'<small>'+esc(c.blurb||c.look.time)+(b.time?' · best '+gpFmt(b.time)+(b.place?' · '+gpOrd(b.place):''):'')+(b.notes?' · 🎵 '+b.notes:'')+'</small></button>';}
function gpOptRow(k,label,opts,cur){return'<div class="fz-opt" data-k="'+k+'"><span class="fz-ol">'+label+'</span><div>'+opts.map(o=>'<button data-v="'+o[0]+'" class="'+(String(cur)===String(o[0])?"on":"")+'" onclick="gpPickOpt(\''+k+'\','+JSON.stringify(o[0]).replace(/"/g,"'")+')">'+o[1]+'</button>').join("")+'</div></div>';}
function GP_TRACK_ORDER(){const first=["dakar","inaka","deep","desert","accra","city","coast"];return GP_CIRCUITS.map((c,i)=>i).sort((a,b)=>{const fa=first.indexOf(GP_CIRCUITS[a].id),fb=first.indexOf(GP_CIRCUITS[b].id);return (fa<0?9+a:fa)-(fb<0?9+b:fb);});}   // the new courses lead the picker
function renderCircuits(tab){
  if(GPN)gpnLeave();clearTimers();closeOverlay();showAnanseCorner(false);gpStop();gpCss();gpFzMenuCss();gpAudioUnlock();
  tab=tab==="opts"?"opts":"tracks";window._gpTab=tab;
  const best=P&&P.race?P.race:{};
  const tracks='<button class="gpn-entry" id="gpnEntry" onclick="renderOnline()"><b>👫 Race a friend</b><small>Each on your own device, with a private code</small></button><div class="fz-mode fz-m"><button data-m="race" class="'+(gpMode()==="race"?"on":"")+'" onclick="gpPickMode(\'race\')">🏁 Race: beat 4 rivals</button><button data-m="free" class="'+(gpMode()==="free"?"on":"")+'" onclick="gpPickMode(\'free\')">🎵 Free drive: collect the music</button></div>'
   +'<div class="fz-tracks">'+GP_TRACK_ORDER().map(i=>gpTrackCard(GP_CIRCUITS[i],i,best)).join("")+'</div>'
   +'<div class="fz-hint">Tap a track to start · '+gpLaps()+' lap'+(gpLaps()>1?'s':'')+' · '+(GP_VIEW_NAME[gpCamMode()]||"CHASE").toLowerCase()+' cam'+' · traffic '+(gpTrafficOn()?'on':'off')+' <button class="fz-link" onclick="renderCircuits(\'opts\')">change ⚙️</button></div>';
  const opts='<div class="fz-opts">'
   +gpOptRow("gpCam","🎥 Camera",[["chase","🚗 Chase"],["far","🔭 Far"],["hood","🏁 Hood"],["bumper","📷 Bumper"],["cockpit","🎛️ Cockpit"]],gpCamMode())
   +gpOptRow("gpTraffic","🚕 Traffic in town",[[true,"On"],[false,"Off"]],gpTrafficOn())
   +gpOptRow("gpLaps","🔁 Laps",[[1,"1"],[2,"2"],[3,"3"]],gpLaps())
   +gpOptRow("gpPace","⭐ Difficulty",[["gentle","🐢 Easy"],["normal","🚗 Normal"],["hard","🔥 Hard"]],gpPace())
   +gpOptRow("gpAuto","🦶 Pedals",[[false,"Gas + brake"],[true,"✨ Auto gas"]],gpAuto())
   +gpOptRow("gpLook","🖌️ Look",[["real","🗻 Realistic"],["toon","🎨 Cartoon"],["story","🖌️ Storybook"]],gpLook())
   +gpOptRow("gpFx","✨ Effects",[["auto","Auto"],["off","Off"]],gpFx())
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
  if(karts)karts.forEach(k=>{if(k.netGone)return;const p=k.pos;const m=map(p.x,p.z);x.fillStyle=k.player?"#ff2d87":k.racer.css;const rr=cv.width/(k.player?24:34);x.beginPath();x.arc(m[0],m[1],rr,0,7);x.fill();x.strokeStyle=k.player?"#fff":"rgba(0,0,0,.5)";x.lineWidth=cv.width/90;x.stroke();});
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
const GP_GLB={   // every car is a real 3D model (tools/cars3d/build_car.py + build_fleet.py; numbers from assets/cars3d/fleet.json; eye = cockpit eye point, exh = exhaust tips for the boost flames, [x,y,z,1] = a stack pointing up)
 falcon:{src:"assets/cars3d/falcon.glb?v=6",tyreX:0.845,xr:-1.351,tail:-2.164,pivotY:0.3,twF:0.31,twR:0.31,S:{len:4.65,w:2.15,rad:0.385,radR:0.385,xf:1.351,xr:-1.351},sticker:[0.6,1.236,-1.95,-1.6708],glows:[[0.63,0.745,0.62,0.2],[-0.63,0.745,0.62,0.2]],eye:[0.36,0.98,-0.1],exh:[[0.42,0.37,-2.13],[-0.42,0.37,-2.13]],nose:2.486,roofY:1.23,ride:0.11,no:"7",roofNo:{z:-0.32,s:0.62},plate:{sy:0.52,sz:-0.26,sw:1.08,ry:0.585,rw:0.9},blur:{col:0x5a5d64,max:0.22},tailCol:"#c4060e",rs:{rim:{c:"#b9bdc4",m:0.9,r:0.22,env:1.0},spoke:{c:"#b2b6bd",m:0.9,r:0.24,env:1.0},glass:{map:1,c:"#ffffff",m:0.1,r:0.04,env:1.5}},matSet:{paint:1,stripe:1,carbon:1,rim:{c:"#a9adb4",m:0.55,r:0.3,env:0.35},spoke:{c:"#a4a8af",m:0.55,r:0.32,env:0.35},caliper:"#c8101a",glass:{map:1,c:"#ffffff",m:0.2,r:0.07,env:1.15},lamp:{c:"#dfe6f2",e:"#fff6e8",ei:1.15}}},   // Meshy-shape car, painted by script (tools/cars3d/build_meshy_falcon.py); shape CC BY 4.0
 arrow:{src:"assets/cars3d/arrow.glb?v=2",tyreX:0.845,xr:-1.38,tail:-2.293,pivotY:0.28,twF:0.28,twR:0.36,S:{len:4.64,w:2.11,rad:0.35,radR:0.36,xf:1.42,xr:-1.38},sticker:[0.5,0.865,-1.75,-1.6543],glows:[[-0.5,0.67,0.7,0.16],[0.0,0.67,0.7,0.16],[0.5,0.67,0.7,0.16]],eye:[0.34,0.929,-0.15],exh:[[0.22,0.21,-2.28],[-0.22,0.21,-2.28]],nose:2.35,roofY:1.067,ride:0.09},
 shogun:{src:"assets/cars3d/shogun.glb?v=3",tyreX:0.785,xr:-1.35,tail:-2.299,pivotY:0.32,twF:0.29,twR:0.29,S:{len:4.62,w:1.93,rad:0.367,radR:0.367,xf:1.35,xr:-1.35},sticker:[0.5,1.205,-2.0,-1.6508],glows:[[0.55,0.93,0.34,0.24],[-0.55,0.93,0.34,0.24]],eye:[0.36,1.1,-0.2],exh:[[0.36,0.3,-2.28],[-0.36,0.3,-2.28]],nose:2.317,roofY:1.329,ride:0.12,plate:{sy:0.52,sz:0.02,sw:1.0,ry:0.67,rw:0.56},blur:{col:0x5a5d64,max:0.22},tailCol:"#c4060e",no:"23",rs:{rim:{c:"#8a6a34",m:0.9,r:0.28,env:0.9},spoke:{c:"#86662f",m:0.9,r:0.3,env:0.9},glass:{map:1,c:"#ffffff",m:0.1,r:0.04,env:1.5}},matSet:{paint:1,stripe:1,carbon:1,rim:{c:"#7a5a2c",m:0.75,r:0.32,env:0.35},spoke:{c:"#7f5e30",m:0.75,r:0.34,env:0.35},caliper:"#d8a13a",glass:{map:1,c:"#ffffff",m:0.2,r:0.07,env:1.15},lamp:{c:"#dfe6f2",e:"#fff6e8",ei:1.15}}},   // Meshy-shape car, painted by script (tools/cars3d/build_meshy_car.py + meshy_specs/shogun.py); shape CC BY 4.0
 rally:{src:"assets/cars3d/rally.glb?v=3",tyreX:0.8,xr:-1.22,tail:-2.023,pivotY:0.45,twF:0.27,twR:0.27,S:{len:4.13,w:1.89,rad:0.35,radR:0.35,xf:1.22,xr:-1.22},sticker:[0.5,1.466,-1.86,-1.6908],glows:[[0.67,0.92,0.26,0.24],[-0.67,0.92,0.26,0.24]],eye:[0.36,1.12,-0.1],exh:[[0.32,0.36,-1.9],[-0.32,0.36,-1.9]],nose:2.103,roofY:1.43,ride:0.2,no:"14",plate:{sy:0.65,sz:-0.25,sw:0.7,ry:0.83,rw:0.6},blur:{col:0x5a5d64,max:0.22},tailCol:"#c4060e",rs:{rim:{c:"#ecece8",m:0.12,r:0.3,env:0.6},spoke:{c:"#efefea",m:0.12,r:0.3,env:0.6},glass:{map:1,c:"#ffffff",m:0.1,r:0.04,env:1.5}},matSet:{paint:1,stripe:"#f2f2ee",carbon:1,rim:{c:"#e8e8e4",m:0.12,r:0.42,env:0.3},spoke:{c:"#efefea",m:0.12,r:0.42,env:0.3},caliper:"#c8101a",glass:{map:1,c:"#ffffff",m:0.2,r:0.07,env:1.15},lamp:{c:"#dfe6f2",e:"#fff6e8",ei:1.15}}},   // Meshy shape (CC BY 4.0), painted by tools/cars3d/build_meshy_car.py + meshy_specs/rally.py
 kumasi:{src:"assets/cars3d/kumasi.glb?v=3",tyreX:0.8,xr:-1.455,tail:-2.547,pivotY:0.35,twF:0.29,twR:0.29,S:{len:4.94,w:2.03,rad:0.388,radR:0.388,xf:1.455,xr:-1.455},sticker:[0.62,1.005,-2.0,-1.6123],glows:[[0.435,0.84,0.69,0.17],[-0.435,0.84,0.69,0.17]],eye:[0.36,1.3,-0.25],exh:[[0.605,0.396,-2.46]],nose:2.387,roofY:1.552,ride:0.12,no:"8",plate:{sy:0.6,sz:-0.08,sw:1.0,ry:0.59,rw:0.44},blur:{col:0x5a5d64,max:0.22},tailCol:"#c4060e",rs:{rim:{c:"#dfe2e6",m:1.0,r:0.14,env:1.1},spoke:{c:"#d8dbe0",m:1.0,r:0.16,env:1.1},glass:{map:1,c:"#ffffff",m:0.1,r:0.04,env:1.5}},matSet:{paint:1,stripe:"#101012",carbon:1,rim:{c:"#d8dbe0",m:0.75,r:0.22,env:0.6},spoke:{c:"#d2d5da",m:0.75,r:0.24,env:0.6},caliper:"#3a3c40",glass:{map:1,c:"#ffffff",m:0.2,r:0.07,env:1.15},lamp:{c:"#dfe6f2",e:"#fff6e8",ei:1.15}}},   // Meshy shape (CC BY 4.0), painted by tools/cars3d/build_meshy_car.py + meshy_specs/kumasi.py
 kei:{src:"assets/cars3d/kei.glb?v=2",tyreX:0.705,xr:-1.12,tail:-1.718,pivotY:0.45,twF:0.21,twR:0.22,S:{len:3.44,w:1.69,rad:0.29,radR:0.29,xf:1.12,xr:-1.12},sticker:[0.36,1.525,-0.7,-1.5898],glows:[[-0.66,0.93,0.38,0.5],[0.66,0.93,0.38,0.5]],eye:[0.33,1.382,0.1],exh:[[0.45,0.3,-1.82]],nose:1.722,roofY:1.53,ride:0.15},
 ridge:{src:"assets/cars3d/ridge.glb?v=2",tyreX:0.86,xr:-1.62,tail:-2.698,pivotY:0.6,twF:0.34,twR:0.34,S:{len:5.5,w:2.12,rad:0.43,radR:0.43,xf:1.72,xr:-1.62},sticker:[0.38,1.892,-0.1,-1.5712],glows:[[-0.88,1.08,0.36,0.56],[0.88,1.08,0.36,0.56]],eye:[0.38,1.76,0.0],exh:[[-0.6,0.48,-2.77]],nose:2.8,roofY:1.9,ride:0.4},
 formula:{src:"assets/cars3d/formula.glb?v=3",tyreX:0.745,xr:-1.615,tail:-2.296,pivotY:0.25,twF:0.385,twR:0.385,S:{len:5.15,w:1.91,rad:0.36,radR:0.36,xf:1.615,xr:-1.615},sticker:[0.27,0.905,-1.95,-1.6908],glows:[[-0.5,0.81,0.16,0.24],[0.5,0.81,0.16,0.24],[0,0.29,0.26,0.14]],eye:[0.0,0.84,0.12],exh:[[0.0,0.415,-2.3]],nose:2.845,roofY:1.114,ride:0.06,plate:{sy:0.62,sz:-0.5,sw:0.5,ry:0.862,rw:0.36},blur:{col:0x5a5d64,max:0.22},tailCol:"#c4060e",rs:{rim:{c:"#f2dc12",m:0.05,r:0.3,env:0.6},spoke:{c:"#1b1c20",m:0.4,r:0.45,env:0.5}},matSet:{paint:1,stripe:"#f2dc12",carbon:1,rim:{c:"#f2dc12",m:0.05,r:0.4,env:0.25},spoke:{c:"#1b1c20",m:0.35,r:0.4,env:0.3},caliper:"#26282d"}},   // Meshy shape (CC BY 4.0), painted by tools/cars3d/build_meshy_car.py + meshy_specs/formula.py
 retro:{src:"assets/cars3d/retro.glb?v=2",tyreX:0.725,xr:-1.18,tail:-2.099,pivotY:0.3,twF:0.19,twR:0.21,S:{len:4.25,w:1.69,rad:0.33,radR:0.335,xf:1.18,xr:-1.18},sticker:[0.42,0.748,-1.72,-1.9238],glows:[[-0.36,0.52,0.36,0.32],[0.36,0.52,0.36,0.32]],eye:[0.28,0.98,-0.15],exh:[[-0.22,0.24,-2.25]],nose:2.15,roofY:0.798,ride:0.13},
 kente:{src:"assets/cars3d/kente.glb?v=3",tyreX:0.825,xr:-1.35,tail:-2.273,pivotY:0.32,twF:0.3,twR:0.3,S:{len:4.55,w:2.07,rad:0.362,radR:0.362,xf:1.35,xr:-1.35},sticker:[0.55,1.016,-1.9,-1.5802],glows:[[0.56,0.88,0.56,0.16],[-0.56,0.88,0.56,0.16]],eye:[0.36,1.1,-0.2],exh:[[0.36,0.31,-2.22],[-0.36,0.31,-2.22]],nose:2.273,roofY:1.332,ride:0.11,no:"11",plate:{sy:0.85,sz:0,sw:0.95,ry:0.62,rw:0.52},blur:{col:0x5a5d64,max:0.22},tailCol:"#c4060e",rs:{rim:{c:"#15161a",m:0.6,r:0.2,env:0.9},spoke:{c:"#17181c",m:0.6,r:0.2,env:0.9},glass:{c:"#0a0f15",m:0,r:0.04,env:1.6}},matSet:{paint:1,stripe:"#0e7a3c",carbon:1,rim:{c:"#15161a",m:0.55,r:0.3,env:0.35},spoke:{c:"#17181c",m:0.55,r:0.3,env:0.35},caliper:"#c8101a",glass:{c:"#0a1119",m:0.2,r:0.07,env:1.15},lamp:{c:"#dfe6f2",e:"#fff6e8",ei:1.15}}},   // Meshy shape (CC BY 4.0), painted by tools/cars3d/build_meshy_car.py + meshy_specs/kente.py
 viper:{src:"assets/cars3d/viper.glb?v=2",tyreX:0.845,xr:-1.4,tail:-2.272,pivotY:0.28,twF:0.27,twR:0.38,S:{len:4.6,w:2.1,rad:0.31,radR:0.38,xf:1.38,xr:-1.4},sticker:[0.5,1.076,-2.06,-1.6308],glows:[[-0.62,0.76,0.74,0.25],[0.62,0.76,0.74,0.25],[0.0,0.76,0.76,0.23]],eye:[0.36,0.91,-0.1],exh:[[-0.12,0.47,-2.37],[0.12,0.47,-2.37]],nose:2.33,roofY:1.05,ride:0.09},
 razor:{src:"assets/cars3d/razor.glb?v=2",tyreX:0.845,xr:-1.42,tail:-2.243,pivotY:0.26,twF:0.28,twR:0.4,S:{len:4.66,w:2.116,rad:0.33,radR:0.37,xf:1.4,xr:-1.42},sticker:[0.55,0.927,-1.7,-1.6324],glows:[[-0.62,0.7,0.7,0.42],[0.62,0.7,0.7,0.42]],eye:[0.36,0.92,-0.05],exh:[[-0.13,0.5,-2.33],[0.13,0.5,-2.33]],nose:2.33,roofY:1.059,ride:0.08},
 aurora:{src:"assets/cars3d/aurora.glb?v=2",tyreX:0.82,xr:-1.3,tail:-2.309,pivotY:0.32,twF:0.27,twR:0.35,S:{len:4.928,w:2.09,rad:0.35,radR:0.37,xf:1.62,xr:-1.3},sticker:[0.55,0.984,-1.95,-1.6492],glows:[[-0.44,0.8,0.45,0.3],[-0.68,0.8,0.45,0.3],[0.44,0.8,0.45,0.3],[0.68,0.8,0.45,0.3]],eye:[0.36,1.12,-0.42],exh:[[-0.34,0.36,-2.38],[0.34,0.36,-2.38],[-0.48,0.36,-2.38],[0.48,0.36,-2.38]],nose:2.548,roofY:1.251,ride:0.12},
 comet:{src:"assets/cars3d/comet.glb?v=2",tyreX:0.815,xr:-1.45,tail:-2.434,pivotY:0.26,twF:0.32,twR:0.38,S:{len:4.98,w:2.036,rad:0.35,radR:0.36,xf:1.5,xr:-1.45},sticker:[0.5,1.096,-2.16,-1.6708],glows:[[-0.97,1.0,0.24,0.44],[0.97,1.0,0.24,0.44],[-0.72,0.72,0.62,0.25],[0.72,0.72,0.62,0.25],[0,0.4,0.36,0.3]],eye:[0.0,0.88,0.05],exh:[[-0.17,0.5,-2.5],[0.17,0.5,-2.5]],nose:2.48,roofY:0.9,ride:0.07},
 breeze:{src:"assets/cars3d/breeze.glb?v=2",tyreX:0.75,xr:-1.22,tail:-1.998,pivotY:0.3,twF:0.24,twR:0.27,S:{len:4.11,w:1.87,rad:0.31,radR:0.32,xf:1.25,xr:-1.22},sticker:[0.4,0.822,-1.5,-1.6907],glows:[[-0.5,0.6,0.52,0.28],[0.5,0.6,0.52,0.28]],eye:[0.3,1.08,-0.33],exh:[[-0.16,0.27,-2.08],[0.16,0.27,-2.08]],nose:2.03,roofY:1.22,ride:0.12},
 monster:{src:"assets/cars3d/monster.glb?v=2",tyreX:1.11,xr:-1.5,tail:-2.368,pivotY:1.3,twF:0.6,twR:0.6,S:{len:5.05,w:2.846,rad:0.8,radR:0.8,xf:1.5,xr:-1.5},sticker:[0.38,2.752,-0.1,-1.5712],glows:[[-0.84,1.86,0.38,0.54],[0.84,1.86,0.38,0.54]],eye:[0.38,2.5,0.05],exh:[[-0.25,1.24,-2.45],[0.25,1.24,-2.45]],nose:2.49,roofY:2.76,ride:1.3},
 trophy:{src:"assets/cars3d/trophy.glb?v=2",tyreX:1.02,xr:-1.65,tail:-2.818,pivotY:0.85,twF:0.4,twR:0.4,S:{len:5.914,w:2.466,rad:0.47,radR:0.47,xf:1.9,xr:-1.65},sticker:[0.38,2.013,-0.2,-1.5715],glows:[[-0.3,2.12,0.42,0.22],[0.0,2.12,0.42,0.22],[0.3,2.12,0.42,0.22],[-0.86,1.32,0.38,0.5],[0.86,1.32,0.38,0.5]],eye:[0.38,1.82,0.0],exh:[[-0.5,0.7,-2.84],[0.5,0.7,-2.84]],nose:2.975,roofY:2.02,ride:0.75},
 semi:{src:"assets/cars3d/semi.glb?v=2",tyreX:0.94,xr:-2.25,tail:-3.153,pivotY:1.0,twF:0.32,twR:0.66,S:{len:6.456,w:2.98,rad:0.54,radR:0.54,xf:2.15,xr:-2.25},sticker:[0.5,3.544,0.75,-1.5714],glows:[[-0.58,0.86,0.37,0.33],[0.58,0.86,0.37,0.33],[-0.82,0.86,0.37,0.33],[0.82,0.86,0.37,0.33]],eye:[0.55,2.3,2.7],exh:[[-1.02,3.9,0.12,1],[1.02,3.9,0.12,1]],nose:3.303,roofY:3.56,ride:0.95}};
const GP_MESHY=new Set(["falcon","shogun","formula","kente","kumasi","rally"]);   // cars whose 3D shape is a free Meshy 6 Lite model
const GP_GLTF_SRC="assets/vendor/GLTFLoader.r128.js",GP_MESHOPT_SRC="assets/vendor/meshopt_decoder.js";   // models are meshopt-compressed (tools/cars3d/pack_glb.mjs); the 29 KB decoder unpacks them
/* Blender-baked ground shadow per car (tools/cars3d/bake_light.py --shadow -> shadow_atlas.py): [atlas col,row, centre x,z, width,length in metres] */
const GP_SHADOW_TILES={"arrow":[0,0,0.0,0.028,2.743,6.036],"aurora":[1,0,0.0,0.084,2.717,6.406],"breeze":[2,0,0.0,-0.025,2.431,5.343],"comet":[3,0,0.0,-0.01,2.647,6.474],"falcon":[4,0,-0.005,0.163,2.778,6.025],"formula":[0,1,0.0,0.274,2.484,6.683],"kei":[1,1,0.0,-0.049,2.431,4.605],"kente":[2,1,-0.006,0.0,2.685,5.909],"kumasi":[3,1,-0.004,-0.08,2.633,6.415],"monster":[4,1,0.0,-0.035,3.708,6.565],"rally":[0,2,0.0,0.04,2.478,5.364],"razor":[1,2,0.0,-0.0,2.751,6.058],"retro":[2,2,0.0,-0.05,2.269,5.72],"ridge":[3,2,0.0,-0.015,3.003,7.319],"semi":[4,2,0.0,0.075,3.874,8.393],"shogun":[0,3,-0.004,-0.001,2.5,6.002],"trophy":[1,3,0.0,0.017,3.214,7.689],"viper":[2,3,0.0,-0.02,2.725,6.11]};
const GP_SHADOW_SRC="assets/cars3d/shadows.webp?v=1",GP_SHADOW_GRID=[5,4];
/* the loader attaches itself to the THREE it finds. Two overlapping loadThree() calls (car previews + a quick route tap) can run
   three.min.js twice, replacing window.THREE after the loader was attached - then every model fell back to the old drawn car.
   So the promise is kept per THREE object and the script is run again for a new one. */
function gpGltfLoader(){if(window.THREE&&THREE.GLTFLoader)return Promise.resolve(true);if(window._gpGltfP&&window._gpGltfFor===window.THREE)return window._gpGltfP;
  window._gpGltfFor=window.THREE;window._gpGltfP=new Promise(res=>{const s=document.createElement("script");s.src=GP_GLTF_SRC;s.async=true;s.onload=()=>gpMeshopt().then(()=>res(!!(window.THREE&&THREE.GLTFLoader)));s.onerror=()=>{window._gpGltfP=null;res(false);};document.head.appendChild(s);});return window._gpGltfP;}
/* meshopt decoder (plain script, sets window.MeshoptDecoder; wasm with a non-SIMD fallback). If it can't load, the packed models fail and the
   game falls back to its drawn cars exactly as when a model is missing. */
function gpMeshopt(){if(window.MeshoptDecoder)return window.MeshoptDecoder.ready.then(()=>true,()=>false);if(window._gpMoptP)return window._gpMoptP;
  window._gpMoptP=new Promise(res=>{const s=document.createElement("script");s.src=GP_MESHOPT_SRC;s.async=true;s.onload=()=>{if(!window.MeshoptDecoder)return res(false);window.MeshoptDecoder.ready.then(()=>res(true),()=>res(false));};s.onerror=()=>{window._gpMoptP=null;res(false);};document.head.appendChild(s);});return window._gpMoptP;}
function gpGltf(){const L=new THREE.GLTFLoader();if(window.MeshoptDecoder&&L.setMeshoptDecoder)L.setMeshoptDecoder(window.MeshoptDecoder);return L;}
function gpLoadGlb(ids){
  if(!window.THREE)return Promise.resolve({});window._gpGlb=window._gpGlb||{};
  const want=[...new Set(ids||Object.keys(GP_GLB))].filter(id=>GP_GLB[id]&&!window._gpGlb[id]);if(!want.length)return Promise.resolve(window._gpGlb);
  return gpGltfLoader().then(ok=>{if(!ok)return window._gpGlb;const L=gpGltf();
    return Promise.all(want.map(id=>new Promise(res=>L.load(GP_GLB[id].src,g=>{window._gpGlb[id]=g.scene;res();},undefined,()=>{res();})))).then(()=>window._gpGlb);});}
/* Realistic look (Eb 2026-11-12: "realistic cars, not cartoons"): every car material number in one place. Cartoon/Storybook keep the old numbers.
   paint finishes: [metalness, roughness, reflection strength]; vc = how much of the Blender-baked vertex light stays on clear-coat paint */
const GP_REAL={paint:{solid:{m:0,r:0.30,env:1.3},metallic:{m:0.55,r:0.34,env:1.35},pearl:{m:0.15,r:0.25,env:1.25}},ccr:0.03,mul:0.9,vc:0.6,
  glass:{c:"#0a0f15",m:0,r:0.04,env:1.6},chrome:{c:"#e6e9ee",m:1,r:0.08,env:1.3},rim:{c:"#c3c7ce",m:0.9,r:0.22,env:1.0},spoke:{c:"#a3a7ae",m:0.85,r:0.28,env:0.9},
  rimdark:{c:"#1b1c20",m:0.6,r:0.35,env:0.7},disc:{c:"#7b7e83",m:0.9,r:0.4,env:0.8},tyre:{c:"#0e0e10",m:0,r:0.86,env:0.15},tyrewall:{c:"#1c1d20",m:0,r:0.72,env:0.25},
  carbon:{c:"#16171b",m:0.3,r:0.38,env:0.8},exhaust:{c:"#3a3a3e",m:0.9,r:0.25,env:1.0},stripe:{r:0.28,env:1.0},lamp:{c:"#f4f7fb",e:"#fff4e2",ei:1.2,r:0.05},
  lens:{c:"#f4f7fb",e:"#fff4e2",ei:0.35},taillens:{c:"#7a0508",e:"#ff0d06",ei:0.35},hl:{day:0.18,night:0.55}};
function gpReal(){return gpLook()==="real";}
function gpMatSet(m,v){if(v.c)m.color.copy(gpLin(v.c));if(v.m!=null)m.metalness=v.m;if(v.r!=null)m.roughness=v.r;if(v.env!=null)m.envMapIntensity=v.env;if(v.e)m.emissive.copy(gpLin(v.e));if(v.ei!=null)m.emissiveIntensity=v.ei;return m;}
/* clear-coat paint: a strong baked vertex shade under a mirror-like coat looks dirty, so only part of it is kept (Realistic only) */
function gpRealVc(m){m.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace("#include <color_fragment>","\n#ifdef USE_COLOR\n\tdiffuseColor.rgb*=mix(vec3(1.0),vColor,"+GP_REAL.vc.toFixed(2)+");\n#endif\n");};m.customProgramCacheKey=()=>"gpRealVc";return m;}
function gpGlbShared(T,shared){if(shared.glb&&shared.glbLook===gpLook())return shared.glb;shared.glbLook=gpLook();
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
  const G=shared.glb,R=GP_REAL,phy=o=>{const m=new T.MeshPhysicalMaterial(o);m.userData.lin=1;return m;};
  G.chrome=std({color:gpLin("#d9dce2"),roughness:0.15,metalness:1,envMapIntensity:0.8});G.lens=std({color:gpLin("#eef2f7"),emissive:gpLin("#fff4e2"),emissiveIntensity:0.6,roughness:0.08});G.interior=std({color:gpLin("#1a1b1f"),roughness:0.75,metalness:0});
  if(gpReal()){["rim","spoke","rimdark","disc","tyre","tyrewall","carbon","exhaust","stripe","lamp","chrome"].forEach(k=>gpMatSet(G[k],R[k]));
    G.glass=phy({color:gpLin(R.glass.c),metalness:R.glass.m,roughness:R.glass.r,clearcoat:1,clearcoatRoughness:0.02,envMapIntensity:R.glass.env});
    G.lens=phy({color:gpLin(R.lens.c),emissive:gpLin(R.lens.e),emissiveIntensity:R.lens.ei,roughness:0.03,metalness:0,clearcoat:1,clearcoatRoughness:0.02,envMapIntensity:1.4});}
  return shared.glb;}
function gpGlbPaintFor(car,player){const u=player&&gpUp().paint;return(u&&/^#[0-9a-f]{6}$/i.test(u))?u:car.paint;}   // model cars keep their own colour unless a paint upgrade was picked
function gpUp(){const u=P&&P.gpUp;return(u&&typeof u==="object")?u:(window._gpUp||{});}
function gpGlbPaint(paint,fin){if(gpReal()){const F=GP_REAL.paint[fin]||GP_REAL.paint.solid,m=new THREE.MeshPhysicalMaterial({color:gpLin(paint).multiplyScalar(GP_REAL.mul),metalness:F.m,roughness:F.r,clearcoat:1,clearcoatRoughness:GP_REAL.ccr,envMapIntensity:F.env});m.userData.lin=1;return gpRealVc(m);}
  const m=new THREE.MeshPhysicalMaterial({color:gpLin(paint).multiplyScalar(0.8),metalness:0.05,roughness:0.38,clearcoat:1,clearcoatRoughness:0.08,envMapIntensity:0.6});m.userData.lin=1;return m;}
function gpGlbCarMat(T,SM,cid,nm,base,val,own){   // per-car material: the model's baked shading map on paint/stripe/carbon, or a colour override. Shared materials are cloned once per car; the paint is already per racer
  const k=cid+"|"+nm;SM.carMats=SM.carMats||{};const map=own&&own.map;
  if(nm==="paint"){if(map)base.map=map,base.needsUpdate=true;return base;}
  if(!SM.carMats[k]){const m=base.clone();if(val===1){if(map)m.map=map;}else if(typeof val==="string")m.color.copy(gpLin(val));else{if(val.map&&map)m.map=map;if(val.c)m.color.copy(gpLin(val.c));if(val.m!=null)m.metalness=val.m;if(val.r!=null)m.roughness=val.r;if(val.env!=null)m.envMapIntensity=val.env;if(val.e)m.emissive.copy(gpLin(val.e));if(val.ei!=null)m.emissiveIntensity=val.ei;}m.userData.lin=1;SM.carMats[k]=m;}
  return SM.carMats[k];}
function gpVcMat(m,shared){if(!m||m.vertexColors)return m;if(!shared){m.vertexColors=true;m.needsUpdate=true;return m;}
  if(!m.userData.vc){const c=m.clone();c.vertexColors=true;c.userData=Object.assign({},m.userData);c.userData.vcOf=1;m.userData.vc=c;}return m.userData.vc;}
function gpBuildGlbCar(T,car,src,paint,shared){
  const D=GP_GLB[car.id],S=Object.assign({},GP_SHAPE[car.type]||GP_SHAPE.super,D.S||{}),SM=gpGlbShared(T,shared),g=new T.Group(),root=src.clone(true);g.add(root);
  const paintM=gpGlbPaint(paint,car.fin);let stripe=SM.stripe;if(gpUpLight(paint)){stripe=SM.stripe.clone();stripe.color.copy(gpLin("#d1121c"));stripe.userData.lin=1;}
  const tail=new T.MeshStandardMaterial({color:gpLin(D.tailCol||"#5a0004"),emissive:gpLin("#ff0d06"),emissiveIntensity:0.55,roughness:0.3});tail.userData.lin=1;tail.toneMapped=false;   // stays RED when lit (tone mapping turned it orange)
  const TL=GP_REAL.taillens,tlens=gpReal()?new T.MeshPhysicalMaterial({color:gpLin(TL.c),emissive:gpLin(TL.e),emissiveIntensity:TL.ei,roughness:0.08,clearcoat:1,clearcoatRoughness:0.03,envMapIntensity:1.2}):new T.MeshStandardMaterial({color:gpLin(TL.c),emissive:gpLin(TL.e),emissiveIntensity:TL.ei,roughness:0.15});tlens.userData.lin=1;tlens.toneMapped=false;
  const MS=(gpReal()&&D.rs)?Object.assign({},D.matSet||{},D.rs):D.matSet;   /* rs = Realistic-only per-car material numbers (real alloys, glass) */
  let body=null;const hubs={},wh={};
  root.traverse(o=>{if(o.name==="body")body=o;else if(/^hub_/.test(o.name))hubs[o.name.slice(4)]=o;else if(/^wheel_/.test(o.name))wh[o.name.slice(6)]=o;
    if(!o.isMesh)return;const nm=o.material&&o.material.name;
    if(nm==="decal"){SM.decals=SM.decals||{};SM.decal=SM.decals[car.id]||null;if(!SM.decal){const d=o.material;d.alphaTest=0.5;d.transparent=false;d.polygonOffset=true;d.polygonOffsetFactor=-2;d.polygonOffsetUnits=-2;d.roughness=0.35;d.metalness=0;d.userData.lin=1;SM.decal=d;SM.decals[car.id]=d;}o.material=SM.decal;o.castShadow=false;return;}
    const baseMt=nm==="paint"?paintM:nm==="tail"?tail:nm==="taillens"?tlens:nm==="stripe"?stripe:(SM[nm]||o.material);o.material=(MS&&MS[nm]!==undefined)?gpGlbCarMat(T,SM,car.id,nm,baseMt,MS[nm],o.material):baseMt;if(!o.material.userData.lin)o.material.userData.lin=1;
    if(o.geometry.attributes.color&&nm!=="decal")o.material=gpVcMat(o.material,SM[nm]===o.material||(nm==="stripe"&&o.material===SM.stripe));   // Blender-baked light (tools/cars3d/bake_light.py) lives in COLOR_0
    o.castShadow=nm!=="glass"&&!/^(wheel|caliper|hub)_/.test(o.parent&&o.parent.name||o.name);o.receiveShadow=false;});   // wheels skip the shadow pass (draw calls); the body shadow + soft footprint ground them
  if(!body)body=root;
  const wheels=[],steers=[],blurs=[];if(!SM.blurGeo)SM.blurGeo=new T.CircleGeometry(1,28);
  ["FL","FR","RL","RR"].forEach(k=>{const w=wh[k];if(!w)return;const rad=k[0]==="F"?S.rad:S.radR,tw=k[0]==="F"?(D.twF||0.3):(D.twR||0.38),sd=hubs[k]&&hubs[k].position.x<0?-1:1;w.userData.rad=rad;wheels.push(w);if(k[0]==="F"&&hubs[k])steers.push(hubs[k]);
    const bm=new T.MeshBasicMaterial({map:SM.blurTex,transparent:true,opacity:0,depthWrite:false});if(D.blur&&D.blur.col!=null)bm.color.setHex(D.blur.col);bm.userData.lin=1;const b=new T.Mesh(SM.blurGeo,bm);b.scale.setScalar(rad*0.6);b.position.x=sd*(tw/2-0.02);b.rotation.y=sd*Math.PI/2;b.visible=false;b.renderOrder=2;w.add(b);w.userData.blur=b;blurs.push(b);});
  // brake lights: soft additive glows over the LED clusters and the rain light, faded in on the brake (plus the emissive lamp material)
  const glows=(D.glows||[]).map(q=>{const m=new T.SpriteMaterial({map:SM.glowTex,color:0xff1606,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending});m.toneMapped=false;m.userData.lin=1;
    const s=new T.Sprite(m);s.position.set(q[0],q[1],D.tail-0.08);s.scale.set(q[2],q[3],1);s.visible=false;body.add(s);return s;});
  // grounding: a dark soft footprint under the whole car + a tight contact patch under each tyre. Both live on the car root (not the
  // sprung body), so they stay flat on the road through lean / dive / hops and turn with the car in a drift.
  const tile=GP_SHADOW_TILES[car.id],shTex=window._gpWorld&&window._gpWorld.carShadows;let blob;
  if(tile&&shTex){const [c,r,cx,cz,w,l]=tile,[CO,RO]=GP_SHADOW_GRID,pg=new T.PlaneGeometry(w,l),uv=pg.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,(c+uv.getX(i))/CO,1-(r+uv.getY(i))/RO);   // plane top (v=1) lies toward the tail after the -90 deg tilt; the tile's top row is the nose
    blob=new T.Mesh(pg,new T.MeshBasicMaterial({map:shTex,color:0x000000,transparent:true,opacity:1,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}));blob.position.set(cx,0.035,cz);blob.userData.baked=1;}   // Blender-baked: what the car hides of the sky, seen from the road
  else{blob=new T.Mesh(new T.PlaneGeometry(S.w*1.22,S.len*1.02),new T.MeshBasicMaterial({map:shared.ao||shared.blob,color:0x000000,transparent:true,opacity:0.92,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}));blob.position.y=0.035;}
  blob.material.userData.lin=1;blob.rotation.x=-Math.PI/2;g.add(blob);
  if(!shared.contact)shared.contact=gpContactTex();
  const cps=[],cu=[],ci=[];["FL","FR","RL","RR"].forEach((k,q)=>{const h=hubs[k];if(!h)return;const tw=(k[0]==="F"?(D.twF||0.3):(D.twR||0.38))+0.24,ln=0.95,x=h.position.x,z=h.position.z;cps.push(x-tw/2,0,z-ln/2,x+tw/2,0,z-ln/2,x+tw/2,0,z+ln/2,x-tw/2,0,z+ln/2);cu.push(0,0,1,0,1,1,0,1);const v=q*4;ci.push(v,v+2,v+1,v,v+3,v+2);});
  const cg=new T.BufferGeometry();cg.setAttribute("position",new T.Float32BufferAttribute(cps,3));cg.setAttribute("uv",new T.Float32BufferAttribute(cu,2));cg.setIndex(ci);
  const cmat=new T.MeshBasicMaterial({map:shared.contact,color:0x000000,transparent:true,opacity:1,depthWrite:false,side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});cmat.userData.lin=1;
  const contacts=new T.Mesh(cg,cmat);contacts.position.y=0.04;contacts.frustumCulled=false;g.add(contacts);
  Object.values(hubs).forEach(h=>{h.userData.y0=h.position.y;});
  // far-away detail: small parts that cost a draw call each but can't be seen from 60 m (brake discs, calipers, spokes, decals...)
  const lod=[],casters=[];root.traverse(o=>{if(!o.isMesh)return;const nm=o.material&&o.material.name,pn=(o.parent&&o.parent.name)||"";if(/^(disc|caliper|spoke|rimdark|exhaust|decal|lamp|carbon)$/.test(nm||"")||/^caliper_/.test(o.name)||/^caliper_/.test(pn))lod.push(o);if(o.castShadow)casters.push(o);});
  if(gpToon())root.traverse(o=>{if(o.isMesh)gpToonPatch(o.material);});
  if(gpReal()&&R3&&R3.cenv&&R3.cenv.env)root.traverse(o=>{if(o.isMesh)gpCarEnvMat(o.material,R3.cenv.env.texture);});
  return{lod,casters,lodFar:false,carId:car.id,g,body,wheels,steers,hubs:Object.values(hubs),shadows:[blob,contacts],tailMat:tail,tlens,bodyMat:paintM,stripeMat:stripe,S,xr:D.xr||S.xr,hw:z=>S.w/2,tyreX:D.tyreX,glb:{glows,blurs,glow:0,rollV:0,pitchV:0,heave:0,heaveV:0,pivotY:D.pivotY||0.3}};}
/* per frame for model cars: brake glow fade (the springs for lean / dive / squat run in gpUpdate) */
function gpGlbUpdate(kt,dt){const G=kt.glb;G.glow+=((kt.brakeOn?1:0)-G.glow)*Math.min(1,dt*(kt.brakeOn?18:7));
  const blD=(kt.carId&&GP_GLB[kt.carId]&&GP_GLB[kt.carId].blur)||null,om=Math.abs(kt.speed)/Math.max(0.1,kt.S.radR),bo=Math.max(0,Math.min(blD&&blD.max||0.88,(om-18)/34));G.blurs.forEach(b=>{const v=bo>0.02&&!kt.lodFar;if(b.visible!==v)b.visible=v;if(v)b.material.opacity=bo;});
  kt.tailMat.emissiveIntensity=0.5+G.glow*1.9;if(kt.tlens)kt.tlens.emissiveIntensity=GP_REAL.taillens.ei+G.glow*1.6;G.glows.forEach(s=>{const v=G.glow>0.02;if(s.visible!==v)s.visible=v;if(v)s.material.opacity=G.glow*0.7;});}
/* ---------- the racing name ON the car (job 1107-0258): a livery plate on both doors and one across the back ----------
   Only ever drawn from a name that passed gpnNameOk (2-10 letters, rude-word filter). The plates sit on the sprung body so they lean with
   it; their spot is found by shooting a ray at the real model (every car has a different shape), with a fixed guess if nothing is hit.
   Plate colours flip with the paint (light paint = dark plate) so the name reads on every car, in the chase camera at race distance. */
function gpnFontFace(){if(document.getElementById("gpnFont"))return;const s=document.createElement("style");s.id="gpnFont";s.textContent='@font-face{font-family:"GPN Bungee";src:url(assets/vendor/fonts/Bungee-Regular.woff2) format("woff2");font-display:swap}';document.head.appendChild(s);}
function gpnLight(hex){const h=/^#[0-9a-f]{6}$/i.test(hex||"")?hex:"#888888",r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);return(0.299*r+0.587*g+0.114*b)/255;}
function gpNamePlate(text,paint,W,H){const dark=gpnLight(paint)>0.56,bg=dark?"#14101f":"#ffffff",fg=dark?"#ffffff":"#14101f",edge=dark?"#00f0ff":"#ff2d87";
  const draw=(x,w,h)=>{x.clearRect(0,0,w,h);const r=h*0.3;x.fillStyle=edge;x.beginPath();x.moveTo(r,0);x.arcTo(w,0,w,h,r);x.arcTo(w,h,0,h,r);x.arcTo(0,h,0,0,r);x.arcTo(0,0,w,0,r);x.fill();
    const b=h*0.1;x.fillStyle=bg;x.beginPath();x.moveTo(r,b);x.arcTo(w-b,b,w-b,h-b,r*0.8);x.arcTo(w-b,h-b,b,h-b,r*0.8);x.arcTo(b,h-b,b,b,r*0.8);x.arcTo(b,b,w-b,b,r*0.8);x.fill();
    let px=h*0.62;const fam='"GPN Bungee",Impact,system-ui,sans-serif',wt=document.fonts&&document.fonts.check('40px "GPN Bungee"')?"400":"900";x.font=wt+" "+px+"px "+fam;const mw=x.measureText(text).width;if(mw>w*0.86){px*=w*0.86/mw;x.font=wt+" "+px+"px "+fam;}
    x.textAlign="center";x.textBaseline="middle";x.fillStyle=fg;x.fillText(text,w/2,h/2+h*0.04);};
  const tex=gpCanvasTex(W,H,draw);if(document.fonts&&document.fonts.load)document.fonts.load('40px "GPN Bungee"').then(()=>{const cv=tex.image;draw(cv.getContext("2d"),cv.width,cv.height);tex.needsUpdate=true;}).catch(()=>{});return tex;}
function gpNameLivery(T,m,text,paint,shared){if(!m||!m.g||!m.body||(m.pic))return;const D=(m.carId&&GP_GLB[m.carId])||{};if(/^test$/i.test(String(text||"").trim()))text="";const named=!!text&&gpnNameOk(text);if(!named&&!D.no)return;gpnFontFace();
  const S=m.S||{len:4.4,w:1.9},roofY=D.roofY||1.2,tail=D.tail||-S.len/2,tyX=D.tyreX||S.w*0.42;
  const g=m.g;g.updateMatrixWorld(true);const skin=[];m.g.traverse(o=>{if(!o.isMesh||!o.material||o.material.transparent||o.material.opacity<1)return;const nm=o.material.name||"";if(/^(glass|decal|lamp)$/.test(nm))return;for(let q=o;q&&q!==g;q=q.parent)if(/^(wheel|hub|caliper)_/.test(q.name||""))return;skin.push(o);});
  const rc=new T.Raycaster(),hit=(o,d)=>{const wo=g.localToWorld(new T.Vector3(o[0],o[1],o[2])),wd=new T.Vector3(d[0],d[1],d[2]).transformDirection(g.matrixWorld);rc.set(wo,wd);rc.far=12;const h=rc.intersectObjects(skin,false)[0];return h?g.worldToLocal(h.point.clone()):null;};
  const bodyIn=v=>m.body.worldToLocal(g.localToWorld(v.clone()));
  const PL=D.plate||{},y=PL.sy||roofY*0.5,yr=PL.ry||roofY*0.62,zs=PL.sz==null?0.05:PL.sz,sw=PL.sw||Math.min(1.7,Math.max(1.15,S.len*0.3)),sh=sw*0.27,rw=PL.rw||Math.min(1.5,Math.max(0.9,S.w*0.64)),rh=rw*0.25;
  const sideTex=named?gpNamePlate(text,paint,512,138):null,rearTex=gpNamePlate(named?text:("GF "+D.no),paint,512,128);
  const mk=(tex,w,h)=>{const mt=new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-6,polygonOffsetUnits:-6,toneMapped:false});mt.userData.lin=1;const mesh=new T.Mesh(new T.PlaneGeometry(w,h),mt);mesh.renderOrder=3;mesh.userData.liv=1;return mesh;};
  const out=[];
  if(named)[1,-1].forEach(sd=>{let p=hit([sd*3,y,zs],[-sd,0,0]);const x=p?p.x:sd*S.w*0.46;const pl=mk(sideTex,sw,sh);const v=bodyIn(new T.Vector3(x+sd*0.012,y,zs));pl.position.copy(v);pl.rotation.y=sd*Math.PI/2;m.body.add(pl);out.push(pl);});
  {const p=hit([0,yr,tail-3],[0,0,1]);const z=p?p.z:tail;const pl=mk(rearTex,rw,rh);pl.position.copy(bodyIn(new T.Vector3(0,yr,z-0.012)));pl.rotation.y=Math.PI;m.body.add(pl);out.push(pl);}
  if(D.no&&D.roofNo){const Q=gpRoofNumber(T,m,D.no,D.roofNo,skin,shared);if(Q)out.push(Q);}
  m.livery=out;}
/* race number on the roof: a small grid draped over the body with rays once per car type, so it follows the curve and reads from the rear 3/4 chase view */
/* height of a Meshy car's body at (x,z), straight down from above (body-local, a hair above the surface); `fb` for the older models whose numbers are exact */
function gpGlbTop(T,m,x,z,fb){if(!GP_MESHY.has(m.carId))return fb;const g=m.g;g.updateMatrixWorld(true);const skin=[];m.body.traverse(o=>{if(o.isMesh&&o.material&&!o.material.transparent)skin.push(o);});const rc=new T.Raycaster();rc.set(g.localToWorld(new T.Vector3(x,6,z)),new T.Vector3(0,-1,0).transformDirection(g.matrixWorld));rc.far=9;const h=rc.intersectObjects(skin,false)[0];return h?m.body.worldToLocal(h.point.clone()).y+0.012:fb;}
function gpRoofNumber(T,m,no,R,skin,shared){const g=m.g,S=shared||{};const rc=new T.Raycaster(),N=8,sz=R.s||0.62,x0=R.x||0,z0=R.z,P=[],UV=[],I=[];const cache=(S.roofGeo=S.roofGeo||{});let geo=cache[m.carId];
  if(!geo){g.updateMatrixWorld(true);const off=0.012;for(let j=0;j<=N;j++)for(let i=0;i<=N;i++){const lx=x0+(i/N-0.5)*sz,lz=z0+(0.5-j/N)*sz;rc.set(g.localToWorld(new T.Vector3(lx,6,lz)),new T.Vector3(0,-1,0).transformDirection(g.matrixWorld));rc.far=9;const h=rc.intersectObjects(skin,false)[0];if(!h)return null;const q=m.body.worldToLocal(h.point.clone());P.push(q.x,q.y+off,q.z);UV.push(1-i/N,1-j/N);}
    for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i,b=a+1,c=a+N+1,d=c+1;I.push(a,b,c,b,d,c);}geo=new T.BufferGeometry();geo.setAttribute("position",new T.Float32BufferAttribute(P,3));geo.setAttribute("uv",new T.Float32BufferAttribute(UV,2));geo.setIndex(I);geo.computeVertexNormals();cache[m.carId]=geo;}
  const texC=(S.roofTex=S.roofTex||{});let tex=texC[no];if(!tex){const c=document.createElement("canvas");c.width=c.height=256;const x=c.getContext("2d");x.fillStyle="#f4f4f0";x.beginPath();x.arc(128,128,122,0,7);x.fill();x.fillStyle="#14101f";x.font="900 170px system-ui,Arial";x.textAlign="center";x.textBaseline="middle";x.fillText(String(no),128,138);tex=new T.CanvasTexture(c);texC[no]=tex;}
  const mt=new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-6,polygonOffsetUnits:-6,toneMapped:false});mt.userData.lin=1;const q=new T.Mesh(geo,mt);q.renderOrder=3;q.userData.liv=1;m.body.add(q);return q;}
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
    m.wheels.forEach((w,i)=>{const GD=GP_GLB[m.carId]||{},front=i<2,rad=front?m.S.rad:m.S.radR,tw=front?(GD.twF||0.3):(GD.twR||0.38),b=w.userData.blur,sd=b?Math.sign(b.position.x):1;const ring=new T.Mesh(new T.RingGeometry(rad*0.8,rad*0.87,32),rm);ring.position.x=sd*(tw/2+0.017);ring.rotation.y=sd*Math.PI/2;w.add(ring);});}
  const st=GP_UP_STICKERS.find(s=>s[0]===u.sticker);
  if(st){const tex=gpCanvasTex(256,256,(x,w,h)=>{x.clearRect(0,0,w,h);x.fillStyle="#fff";x.beginPath();x.arc(128,128,118,0,7);x.fill();x.lineWidth=10;x.strokeStyle="#15161a";x.stroke();x.font="150px system-ui,'Apple Color Emoji','Segoe UI Emoji'";x.textAlign="center";x.textBaseline="middle";x.fillText(st[1],128,142);});
    const sm=new T.MeshStandardMaterial({map:tex,transparent:true,alphaTest:0.4,roughness:0.4,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});sm.userData.lin=1;
    [-1,1].forEach(sd=>{const q=new T.Mesh(new T.PlaneGeometry(0.36,0.36),sm);const SP=(GP_GLB[m.carId]||{}).sticker||[0.6,1.272,-2.02,-Math.PI/2-0.1];q.position.set(sd*SP[0],gpGlbTop(T,m,sd*SP[0],SP[2],SP[1]),SP[2]);q.rotation.set(SP[3],0,Math.PI);m.body.add(q);});}}
function gpUpLight(h){const c=new THREE.Color(h);return c.r*0.3+c.g*0.59+c.b*0.11>0.7;}
/* car screen: the upgrades already fitted, with paint and sticker chips to switch between */
function gpGarageHtml(){const u=gpUpState();if(!u.picks)return'<div class="fz-garage empty">🏁 Finish a race to pick your first upgrade!</div>';
  const lv=k=>'<span class="fz-glv"><b>'+GP_UP_PERF[k].icon+' '+GP_UP_PERF[k].n+'</b><span class="fz-pips">'+Array.from({length:GP_UP_MAX},(_,q)=>'<em class="'+(q<u[k]?"on":"")+'"></em>').join("")+'</span></span>';
  const paints=[["","Factory colour"]].concat(GP_UP_PAINTS.filter(p=>u.paints.includes(p[0])));
  const ps=u.paints.length?'<div class="fz-gchips"><i>Paint</i>'+paints.map(p=>'<button class="fz-gp'+((u.paint||"")===p[0]?" on":"")+'" style="--p:'+(p[0]||gpCar().paint)+'" aria-label="'+esc(p[1])+'" onclick="gpGarageSet(\'paint\',\''+p[0]+'\')"></button>').join("")+'</div>':"";
  const ss=u.stickers.length?'<div class="fz-gchips"><i>Sticker</i><button class="fz-gs'+(!u.sticker?" on":"")+'" onclick="gpGarageSet(\'sticker\',\'\')" aria-label="No sticker">✕</button>'+GP_UP_STICKERS.filter(s=>u.stickers.includes(s[0])).map(s=>'<button class="fz-gs'+(u.sticker===s[0]?" on":"")+'" aria-label="'+esc(s[2])+'" onclick="gpGarageSet(\'sticker\',\''+s[0]+'\')">'+s[1]+'</button>').join("")+'</div>':"";
  return'<div class="fz-garage"><div class="fz-gt">🔧 My upgrades <small>(paint and stickers go on every car)</small></div><div class="fz-glvs">'+["tyres","speed","launch"].map(lv).join("")+'</div>'+ps+ss+'</div>';}
function gpGarageSet(k,v){const u=gpUpState();u[k]=v||null;gpUpSave(u);sfx("tick");const g=document.querySelector(".fz-garage");if(g)g.outerHTML=gpGarageHtml();}
/* ---------- real car pictures ---------- */
/* Loads only the sheets used by this grid, so the SUV race texture stays lazy until the SUV is selected. Resolves with a map id → texture
   or null when a picture failed; a null means that car keeps its 3D model. */
function gpRivalCars(cid){const mine=gpCar(),others=GP_CARS.filter(c=>c.id!==mine.id),k=Math.max(0,GP_CIRCUITS.findIndex(c=>c.id===cid));const out=[];
  if(cid==="desert"||cid==="dakar"){const tr=others.filter(c=>c.grp==="trucks"),ot=others.filter(c=>c.grp!=="trucks");return[ot[2],tr[0],ot[9]||ot[0],tr[2]||tr[1]];}   // desert: two trucks on the grid
  for(let q=0;q<4;q++)out.push(others[(k*3+q*Math.max(1,Math.floor(others.length/4)))%others.length]);return out;}
function gpRacePicIds(cid){if(GPN&&GPN.race)return GPN.race.roster.map(r=>(GP_CARS.find(c=>c.id===r.car)||GP_CARS[0]).id);   // ids, like the single-player branch (it returned car objects, so no friend's 3D model was ever preloaded)
  return[gpCar()].concat(gpRivalCars(cid)).map(c=>c.id);}
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
  const shd=new Promise(res=>{if(W.carShadows!==undefined)return res();L.load(GP_SHADOW_SRC,t=>{t.generateMipmaps=true;t.minFilter=T.LinearMipmapLinearFilter;W.carShadows=t;res();},undefined,()=>{W.carShadows=null;res();});});
  const img=new Promise(res=>{if(W.speedo!==undefined)return res();const im=new Image();im.onload=()=>{W.speedo=im;res();};im.onerror=()=>{W.speedo=null;res();};im.src=GP_WORLD.speedo.src;});
  return Promise.all([shd,tex("sky",false,false),tex("props",false,false),tex("rail",true,true),tex("road",true,true),img,
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
  let env=null;try{const pm=new T.PMREMGenerator(r);const eq=gpCanvasTex(128,64,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,"#6ea0dc");g.addColorStop(0.45,"#dfe9f3");g.addColorStop(0.52,"#8a9470");g.addColorStop(1,"#2f3a22");x.fillStyle=g;x.fillRect(0,0,w,h);x.fillStyle="rgba(255,255,255,.95)";x.fillRect(0,20,w,8);
    if(gpReal()){x.fillStyle="rgba(255,255,255,.9)";x.fillRect(0,h*0.44,w,h*0.055);x.fillStyle="rgba(18,22,18,.6)";x.fillRect(0,h*0.5,w,h*0.05);x.fillStyle="rgba(30,32,36,.5)";x.fillRect(0,h*0.62,w,h*0.38);}});eq.mapping=T.EquirectangularReflectionMapping;env=pm.fromEquirectangular(eq);pm.dispose();eq.dispose();scene.environment=env.texture;}catch(e){}
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
  if(!additive)m.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace("#include <project_vertex>","#include <project_vertex>\n{vec4 dq=projectionMatrix*vec4(mvPosition.xy,mvPosition.z+2.2,mvPosition.w);gl_Position.z=dq.z/dq.w*gl_Position.w;}");};   // dust puffs are flat cards: without a depth nudge towards the camera the road slices them along hard straight lines
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
const GP_TRAFFIC_SRC="assets/cars3d/traffic.glb?v=2";
const GP_TRAFFIC_DIM={sedan:{w:1.8,len:4.6,mass:0.75},hatch:{w:1.75,len:4.0,mass:0.7},taxi:{w:1.8,len:4.6,mass:0.75},ghtaxi:{w:1.8,len:4.6,mass:0.75},van:{w:1.95,len:5.0,mass:0.9},trotro:{w:2.0,len:5.6,mass:0.95},bus:{w:2.5,len:10.5,mass:1.3}};
const GP_TRAFFIC_PAINT={sedan:["#2f5fb8","#c9ccd2","#1d1f24","#8a1c22","#e8e8e8","#4f6d3a","#b9a58a"],hatch:["#c23b2b","#f2f2f2","#2a7fd6","#f2a91c","#3b3d42"],taxi:["#f2c21b"],
  ghtaxi:["#2e6b3a","#2a4f9e","#b8b8b8","#7b1e2a","#f2f2f2"],van:["#f2f2f2","#d7dbe0","#2a4f9e"],trotro:["#f4f4f4","#f7d23e","#3a8fd6","#2e9e57","#e8e2d0"],bus:["#1f6fd1","#d83a2a","#f2b705"]};
function gpLoadTraffic(){if(!window.THREE)return Promise.resolve(null);if(window._gpTraffic)return Promise.resolve(window._gpTraffic);
  return gpGltfLoader().then(ok=>ok?new Promise(res=>gpGltf().load(GP_TRAFFIC_SRC,g=>{window._gpTraffic=g.scene;res(g.scene);},undefined,()=>res(null))):null);}
/* merge meshes into one non-indexed geometry (positions + normals, optional flat vertex colour per source) */
function gpMerge(T,parts){let n=0;parts.forEach(p=>{n+=p.g.index?p.g.index.count:p.g.attributes.position.count;});const pos=new Float32Array(n*3),nor=new Float32Array(n*3),col=new Float32Array(n*3),uvs=new Float32Array(n*2);let o=0;
  parts.forEach(p=>{const g=p.g.index?p.g.toNonIndexed():p.g,P=g.attributes.position,N=g.attributes.normal,U=g.attributes.uv,K=g.attributes.color,c=p.c||{r:1,g:1,b:1};const nk=a=>!a||!a.normalized?1:a.array instanceof Uint8Array?1/255:a.array instanceof Uint16Array?1/65535:a.array instanceof Int8Array?1/127:a.array instanceof Int16Array?1/32767:1,kn=nk(N),ku=nk(U),kk=nk(K);   // r128 hands back raw values of quantised attributes
    for(let i=0;i<P.count;i++){pos[o*3]=P.getX(i);pos[o*3+1]=P.getY(i);pos[o*3+2]=P.getZ(i);if(N){nor[o*3]=N.getX(i)*kn;nor[o*3+1]=N.getY(i)*kn;nor[o*3+2]=N.getZ(i)*kn;}if(U){uvs[o*2]=U.getX(i)*ku;uvs[o*2+1]=U.getY(i)*ku;}const b=K?K.getX(i)*kk:1;col[o*3]=c.r*b;col[o*3+1]=c.g*b;col[o*3+2]=c.b*b;o++;}});
  const G=new T.BufferGeometry();G.setAttribute("position",new T.BufferAttribute(pos,3));G.setAttribute("normal",new T.BufferAttribute(nor,3));G.setAttribute("color",new T.BufferAttribute(col,3));G.setAttribute("uv",new T.BufferAttribute(uvs,2));return G;}
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
function gpKenteTex(){if(window._gpKente)return window._gpKente;window._gpKente=gpCanvasTex(128,256,(x,w,h)=>{const G="#f2b705",Gr="#0b7a3e",R="#c8102e",K="#141414",B="#1f4fa8",SW=32,BH=32;
  // a kente cloth is narrow woven strips sewn edge to edge; each strip alternates a warp-faced block (fine lengthwise stripes)
  // with a weft-faced block (cross bands and motifs), and neighbouring strips are offset so the blocks checker across the cloth
  const warp=(ox,oy,k)=>{const cols=[[G,Gr,G,R],[G,K,G,Gr],[R,G,Gr,G]][k%3];for(let c=0;c<SW;c+=2){x.fillStyle=cols[(c/2)%cols.length];x.fillRect(ox+c,oy,2,BH);}x.fillStyle="rgba(0,0,0,.25)";x.fillRect(ox+SW/2-1,oy,2,BH);};
  const weft=(ox,oy,k)=>{const bg=[Gr,K,R][k%3],fg=G;x.fillStyle=bg;x.fillRect(ox,oy,SW,BH);x.fillStyle=fg;
    const m=k%4;if(m===0){for(let r=0;r<BH;r+=8)x.fillRect(ox,oy+r+3,SW,2);}                                  // cross bands
    else if(m===1){for(let r=0;r<4;r++)for(let c=0;c<4;c++)if((r+c)%2)x.fillRect(ox+c*8,oy+r*8,8,8);}               // checks
    else if(m===2){x.fillRect(ox+3,oy+2,3,BH-4);x.fillRect(ox+SW-6,oy+2,3,BH-4);for(let r=4;r<BH;r+=6)x.fillRect(ox+3,oy+r,SW-6,2);}   // ladder
    else{x.beginPath();for(let c=0;c<=SW;c+=8){x.lineTo(ox+c,oy+(c/8)%2*10+6);}for(let c=SW;c>=0;c-=8){x.lineTo(ox+c,oy+(c/8)%2*10+12);}x.fill();
      x.beginPath();for(let c=0;c<=SW;c+=8){x.lineTo(ox+c,oy+(c/8)%2*10+18);}for(let c=SW;c>=0;c-=8){x.lineTo(ox+c,oy+(c/8)%2*10+24);}x.fill();}   // zigzags
    x.fillStyle=R;x.fillRect(ox,oy,SW,2);x.fillRect(ox,oy+BH-2,SW,2);};
  for(let s=0;s<w/SW;s++)for(let b=0;b<h/BH;b++){const ox=s*SW,oy=b*BH,k=s*3+b;((b+s)%2?weft:warp)(ox,oy,k);if(b%4===3&&s%2===0){x.fillStyle=B;x.fillRect(ox+12,oy+12,8,8);}}
  for(let s=0;s<=w/SW;s++){x.fillStyle=K;x.fillRect(s*SW-1,0,2,h);}   // strip seams
  for(let yy=0;yy<h;yy+=2){x.fillStyle=yy%4?"rgba(255,255,255,.05)":"rgba(0,0,0,.07)";x.fillRect(0,yy,w,1);}   // weave texture
},true);return window._gpKente;}
function gpGhanaFlagTex(){return gpCanvasTex(192,128,(x,w,h)=>{x.fillStyle="#ce1126";x.fillRect(0,0,w,h/3);x.fillStyle="#fcd116";x.fillRect(0,h/3,w,h/3);x.fillStyle="#006b3f";x.fillRect(0,2*h/3,w,h/3);
  x.fillStyle="#000";x.beginPath();for(let i=0;i<10;i++){const r=i%2?9:22,a=-Math.PI/2+i*Math.PI/5;x.lineTo(w/2+Math.cos(a)*r,h/2+Math.sin(a)*r);}x.closePath();x.fill();});}
/* LED screen colours + the hello line per course */
const GP_SCREEN={gp:{bg:["#ff2d87","#ff7a00"],fg:"#fff",hello:"GRAND FABLE HORIZON GP"},accra:{bg:["#006b3f","#0d0d0d","#0d0d0d","#ce1126"],fg:"#fcd116",hello:"AKWAABA! ACCRA GP"},
  city:{bg:["#0b3d91","#1a8fb3"],fg:"#fff",hello:"CITY CIRCUIT"},coast:{bg:["#11673a","#1e88c8"],fg:"#fff",hello:"COAST ROAD"},desert:{bg:["#e8603c","#f2b705"],fg:"#fff",hello:"DESERT RALLY"},inaka:{bg:["#27313d","#4a5a6c"],fg:"#fff",hello:"JAPAN COUNTRYSIDE"},dakar:{bg:["#c2571a","#f2a31b"],fg:"#fff",hello:"DAKAR DESERT"},deep:{bg:["#0072ff","#00d2ff"],fg:"#fff",hello:"CORAL DEEP"}};
/* start gantry for the new courses, built in 3D (the photo gantry carries Japan's flag): two posts, a beam with the LED screen
   facing the grid, the five start lamps, and course dressing - Accra: Ghana-flag posts, kente drapes, black star, flags on top */
function gpThemeGantry(T,C,W,g,lights){const TH=C.theme,gw=W+2.4,ph=8.4,by=ph+0.2,bw=2*gw+1.0,AC=TH==="accra";
  const lin=h=>gpLin(h),add=(geo,mat,shadow)=>{const m=new T.Mesh(geo,mat);m.castShadow=!!shadow;g.add(m);return m;};
  const box=(w,h,d,x,y,z)=>new T.BoxGeometry(w,h,d).translate(x,y,z),plane=(w,h,x,y,z,ry)=>{const q=new T.PlaneGeometry(w,h);if(ry)q.rotateY(ry);return q.translate(x,y,z);};
  // posts (Accra: wrapped in the flag's red, gold and green)
  const star=(x,cx,cy,R)=>{x.beginPath();for(let i=0;i<10;i++){const r=i%2?R*0.4:R,a=-Math.PI/2+i*Math.PI/5;x.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);}x.closePath();x.fill();};
  const postTex=gpCanvasTex(64,192,(x,w,h)=>{(AC?["#ce1126","#fcd116","#006b3f"]:(TH==="city"?["#2b3442","#2b3442"]:["#f2f4f2","#1d6b45","#f2f4f2"])).forEach((c,q,a)=>{x.fillStyle=c;x.fillRect(0,q*h/a.length,w,h/a.length+1);});
    if(AC){x.fillStyle="#111";star(x,w/2,h/2,22);}else{x.fillStyle="rgba(0,0,0,.16)";for(let y=0;y<h;y+=24)x.fillRect(0,y,w,2);}});
  add(gpMerge(T,[-1,1].map(sd=>({g:box(1.0,ph,1.0,sd*gw,ph/2,0)}))),new T.MeshLambertMaterial({map:postTex}),true);
  // beam, feet, lamp panel + hanger (and Accra's gold plinth + flag poles) as one vertex-coloured mesh
  const beamC=lin(TH==="city"?"#2b3442":(TH==="inaka"?"#3a4350":"#1d6b45")),dark=lin("#0e0f12"),foot=lin("#bdbab2"),parts=[...(AC?[]:[{g:box(bw,2.0,1.2,0,by,0),c:beamC}]),{g:box(4.6,1.05,0.4,0,by-1.75,-0.1),c:dark},{g:box(0.12,0.75,0.12,0,by-1.1,-0.1),c:dark}];
  [-1,1].forEach(sd=>parts.push({g:box(1.6,0.5,1.6,sd*gw,0.25,0),c:foot}));
  if(AC){parts.push({g:box(2.2,0.5,0.8,0,by+1.25,0),c:lin("#fcd116")});[-1,1].forEach(sd=>parts.push({g:new T.CylinderGeometry(0.05,0.05,2.6,6).translate(sd*gw,ph+2.4,0),c:lin("#dddddd")}));}
  add(gpMerge(T,parts),new T.MeshLambertMaterial({color:0xffffff,vertexColors:true}),true);
  if(AC){const bt=gpCanvasTex(256,96,(x,w,h)=>{["#ce1126","#fcd116","#006b3f"].forEach((c,q)=>{x.fillStyle=c;x.fillRect(0,q*h/3,w,h/3+1);});});add(box(bw,2.0,1.2,0,by,0),new T.MeshLambertMaterial({map:bt}),true);}
  // LED screen facing the grid + the course sign on the far side
  const cv=document.createElement("canvas");cv.width=512;cv.height=128;const tex=new T.CanvasTexture(cv);if(T.sRGBEncoding)tex.encoding=T.sRGBEncoding;
  const sm=new T.MeshBasicMaterial({map:tex});sm.toneMapped=false;sm.userData.lin=1;const sw=Math.min(9,bw-3);add(plane(sw,1.1,0,by,-0.62,Math.PI),sm);
  const sign={accra:["AKWAABA · ACCRA",["#006b3f","#111","#ce1126"],"#fcd116"],city:["CITY CIRCUIT",["#0b3d91","#1a8fb3"],"#fff"],coast:["COAST ROAD",["#11673a","#1e88c8"],"#fff"],inaka:["JAPAN COUNTRYSIDE",["#27313d","#4a5a6c"],"#fff"],dakar:["DAKAR DESERT · RALLY STAGE",["#c2571a","#f2a31b"],"#fff"]}[TH]||["GRAND PRIX",["#ff2d87","#ff7a00"],"#fff"];
  const signM=new T.MeshBasicMaterial({map:gpTextTex(sign[0],sign[1],sign[2],1024,128,78)});signM.userData.lin=1;add(plane(sw,1.1,0,by,0.62),signM);
  // five start lamps = one instanced draw; lights[k].color.setHex() recolours lamp k (same API as the material lamps)
  const lm=new T.MeshBasicMaterial({color:0xffffff});lm.toneMapped=false;lm.userData.lin=1;const li=new T.InstancedMesh(new T.SphereGeometry(0.34,14,10),lm,5),dm=new T.Object3D(),lc=new T.Color();
  for(let k=0;k<5;k++){dm.position.set(-1.7+k*0.85,by-1.75,-0.36);dm.updateMatrix();li.setMatrixAt(k,dm.matrix);li.setColorAt(k,lc.setHex(0xff2020));
    lights.push({color:{setHex:h=>{li.setColorAt(k,lc.setHex(h));li.instanceColor.needsUpdate=true;}}});}
  li.frustumCulled=false;g.add(li);
  if(AC){const kt=gpKenteTex().clone();kt.needsUpdate=true;kt.wrapS=kt.wrapT=T.RepeatWrapping;kt.repeat.set(bw/0.6,0.26/1.2);   // kente bands along the beam, both faces
    add(gpMerge(T,[[by+0.88,-1],[by-0.88,-1],[by+0.88,1],[by-0.88,1]].map(([y,f])=>({g:plane(bw,0.26,0,y,f*0.61,f<0?Math.PI:0)}))),new T.MeshLambertMaterial({map:kt}));
    add(gpStarGeo(T,1.6,0.4).translate(0,by+2.6,0),new T.MeshStandardMaterial({color:0x111111,roughness:0.45}),true);   // the black star
    add(gpMerge(T,[-1,1].map(sd=>({g:plane(1.15,4.2,sd*(gw-1.15),by-3.1,-0.66)}))),new T.MeshLambertMaterial({map:gpKenteTex(),side:T.DoubleSide}));   // kente drapes beside the posts (outside the road)
    add(gpMerge(T,[-1,1].map(sd=>({g:plane(1.8,1.2,0,0,0,Math.PI/2).translate(sd*gw+sd*0.92,ph+3.05,0)}))),new T.MeshLambertMaterial({map:gpGhanaFlagTex(),side:T.DoubleSide}));}   // a Ghana flag on each post
  else{const ck=gpCanvasTex(64,256,(x,w,h)=>{for(let r=0;r<h/16;r++)for(let c=0;c<4;c++){x.fillStyle=(r+c)%2?"#111":"#f4f4f4";x.fillRect(c*16,r*16,16,16);}x.fillStyle=TH==="city"?"#1a8fb3":"#1d6b45";x.fillRect(0,0,w,26);});
    add(gpMerge(T,[-1,1].map(sd=>({g:plane(1.0,3.6,sd*(gw-1.1),by-2.8,-0.66)}))),new T.MeshLambertMaterial({map:ck,side:T.DoubleSide}));}
  return{cv,tex};}
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
    let lowY=1e9;for(let i=ia;i<=ib;i++)lowY=Math.min(lowY,samples[wrapI(i)].pos.y);const wY=lowY-3.6;   // the river is flat at the bridge's lowest point (the deck may hump over it)
    const piers=[];for(let i=ia+6;i<ib-4;i+=Math.round(16/ds))piers.push(i);IM(new T.BoxGeometry(2.2,1,W*2+3),deck,piers,(i,k,m)=>{const s=samples[wrapI(i)],top=s.pos.y-4.2,bot=wY-2.5;m.setMatrixAt(k,put(s.pos.x,(top+bot)/2,s.pos.z,yawAt(i),1,Math.max(0.5,top-bot),1));},{shadow:true});
    const wt=gpCanvasTex(128,128,(x,w,h)=>{x.fillStyle="#3f7896";x.fillRect(0,0,w,h);x.strokeStyle="rgba(255,255,255,.3)";for(let i=0;i<26;i++){const px=rnd()*w,py=rnd()*h;x.beginPath();x.moveTo(px,py);x.quadraticCurveTo(px+9,py-3,px+20,py);x.stroke();}},true);
    out.waterTex2=wt;const wm=ribbonR(ia-14,ib+14,-90,90,new T.MeshStandardMaterial({map:wt,roughness:0.1,metalness:0.45}),-3.6,-3.6,0.05);if(wm&&wm.geometry){const P=wm.geometry.attributes.position;for(let q=0;q<P.count;q++)P.setY(q,wY);P.needsUpdate=true;wm.geometry.computeVertexNormals();}});
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
  if(TH==="accra"){const sq=-(C.parkSide||1);for(let d=-66;d<=100;d+=11){if(Math.abs(d)<6||(d>48&&d<62))continue;const i=Math.round(d/ds),p=sidePt(i,sq*(W+6.6));if(clearOf(p.x,p.z,W+6.2))palms.push([p.x,groundAt(p.x,p.z),p.z,0.95+rnd()*0.3,rnd()*6.28]);}}   // a palm avenue down the start straight
  if(TH==="city"){for(let i=0;i<M;i+=Math.round(24/ds)){if(!inZ(i,"avenue"))continue;[-1,1].forEach(sd=>{const p=sidePt(i,sd*(W+5.4));palms.push([p.x,groundAt(p.x,p.z)+0.16,p.z,0.8+rnd()*0.2,rnd()*6.28]);});}}
  (out.parkTop||[]).forEach(p=>broad.push([p[0],p[1],p[2],0.6+rnd()*0.3,rnd()*6.28]));
  if(TH==="coast"){for(let i=0;i<M;i+=Math.round(5/ds)){const forest=inZ(i,"forest"),hw=inZ(i,"highway")||inZ(i,"bridge");for(let r=0;r<(forest?4:2);r++){if(!forest&&rnd()<0.55)continue;const sd=rnd()<0.5?-1:1;if(hw&&sd===SEA)continue;const off=W+(forest?5.5+r*6+rnd()*5:9+r*14+rnd()*12);const p=sidePt(i,sd*off);if(!treeOK(p.x,p.z,W+4.5))continue;
      (forest||rnd()<0.3?conif:broad).push([p.x,groundAt(p.x,p.z),p.z,0.85+rnd()*0.6,rnd()*6.28]);}}
    for(let k=0;k<380;k++){const a=rnd()*6.28,r=120+rnd()*520;const x=X.cx+Math.cos(a)*r,z=X.cz+Math.sin(a)*r;if(!treeOK(x,z,W+25))continue;(rnd()<0.5?conif:broad).push([x,groundAt(x,z),z,0.9+rnd()*0.8,rnd()*6.28]);}}
  if(TH==="accra"||TH==="city"){for(let k=0;k<(TH==="accra"?160:60);k++){const a=rnd()*6.28,r=90+rnd()*300;const x=X.cx+Math.cos(a)*r,z=X.cz+Math.sin(a)*r;if(!treeOK(x,z,W+30))continue;(TH==="accra"&&rnd()<0.7?palms:broad).push([x,groundAt(x,z),z,0.9+rnd()*0.5,rnd()*6.28]);}}
  if(palms.length){const PG=gpPalmGeos(T);const pmA=IM(PG.trunk,new T.MeshLambertMaterial({color:0x8a7356}),palms,(p,k,m)=>{m.setMatrixAt(k,put(p[0],p[1]-0.1,p[2],p[4],p[3],p[3],p[3]));},{shadow:true});
    const cm=new T.MeshLambertMaterial({color:0xffffff,side:T.DoubleSide});const pmB=IM(PG.crown,cm,palms,(p,k,m)=>{m.setMatrixAt(k,put(p[0],p[1]-0.1,p[2],p[4],p[3],p[3],p[3]));m.setColorAt(k,lin(["#3f7d2c","#4d8a33","#5a9433","#3a6f2a"][k%4]));},{shadow:true});[pmA,pmB].forEach(q=>{if(q)q.userData.mirror=1;});}
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
      const dp=[],gc={r:0.78,g:0.76,b:0.72},bc={r:0.07,g:0.07,b:0.07};[-1,1].forEach(sd=>{const px=sd*(span+2.5);[-1,1].forEach(f=>{[-1.2,1.2].forEach(gx=>dp.push({g:new T.BoxGeometry(0.42,13.5,0.12).translate(px+gx,8.2,f*3.03),c:gc}));
          dp.push({g:new T.BoxGeometry(5.4,0.5,0.14).translate(px,15.6,f*3.04),c:gc});dp.push({g:new T.BoxGeometry(5.6,1.0,6.4).translate(px,0.5,0),c:gc});});});
      dp.push({g:new T.BoxGeometry(span*2+10.8,0.7,6.9).translate(0,22.35,0),c:{r:0.93,g:0.92,b:0.89}});dp.push({g:new T.BoxGeometry(span*2+10.4,0.35,6.6).translate(0,16.85,0),c:gc});
      dp.push({g:new T.BoxGeometry(span*1.5+0.6,0.12,0.1).translate(0,20.5,3.25),c:bc});dp.push({g:new T.BoxGeometry(span*1.5+0.6,0.12,0.1).translate(0,18.7,3.25),c:bc});
      const dm=new T.Mesh(gpMerge(T,dp),new T.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:0.8}));dm.castShadow=true;g.add(dm);
      g.position.copy(s.pos);g.rotation.y=yawAt(i);scene.add(g);out.gate=g;}
    // trotro station on the square just past the start line: a canopy with a destination board, trotros and orange-panel taxis parked at the kerb
    {const sq=-(C.parkSide||1),ga=Math.round(16/ds),gb=Math.round(40/ds),mid=Math.round(28/ds),p=sidePt(mid,sq*(W+17)),y=groundAt(p.x,p.z),g=new T.Group();
      const cream=new T.MeshLambertMaterial({color:0xf3ead6}),post=new T.MeshLambertMaterial({color:0x2f6b3c});
      const roof=new T.Mesh(new T.BoxGeometry(20,0.3,5),new T.MeshLambertMaterial({map:gpCanvasTex(256,64,(x,w,h)=>{const c=["#ce1126","#fcd116","#006b3f"];for(let k=0;k<12;k++){x.fillStyle=c[k%3];x.fillRect(k*w/12,0,w/12+1,h);}})}));roof.position.y=3.6;roof.castShadow=true;g.add(roof);
      const sp=[{g:new T.BoxGeometry(14,0.5,0.8).translate(0,0.45,1.2*-sq),c:gpLin("#f3ead6")}];[-9,-3,3,9].forEach(px=>[-2,2].forEach(pz=>sp.push({g:new T.CylinderGeometry(0.1,0.1,3.6,6).translate(px,1.8,pz),c:gpLin("#2f6b3c")})));
      g.add(new T.Mesh(gpMerge(T,sp),new T.MeshLambertMaterial({color:0xffffff,vertexColors:true})));
      const brd=new T.MeshBasicMaterial({map:gpTextTex("TROTRO STATION · CIRCLE · MADINA · LABADI",["#fcd116","#f2b705"],"#111",1024,96,44),side:T.DoubleSide});brd.userData.lin=1;
      const sign=new T.Mesh(new T.PlaneGeometry(13,1.2),brd);sign.position.set(0,4.45,0);g.add(sign);
      g.position.set(p.x,y,p.z);g.rotation.y=yawAt(mid);scene.add(g);
      out.parked=[];const lay=[["trotro",18,0.06],["ghtaxi",25.5,0.04],["trotro",32,-0.05],["ghtaxi",39,0.08],["ghtaxi",-14,0.03]];
      lay.forEach(([type,d,a],q)=>{const i=Math.round(d/ds),pp=sidePt(i,sq*(W+(type==="trotro"?11.2:10.8)));out.parked.push({type,x:pp.x,y:groundAt(pp.x,pp.z),z:pp.z,yaw:yawAt(i)+a,col:q});});}
    // Independence Arch on the square beside the straight: a white block with three arches, flag colours on top
    {const i=Math.round(105/ds),sd=-(C.parkSide||1),p=sidePt(i,sd*(W+34)),g=new T.Group();const body=new T.Mesh(new T.BoxGeometry(30,13,5),white);body.position.y=6.5;body.castShadow=true;g.add(body);
      [-9,0,9].forEach(ax=>{const a=new T.Mesh(new T.BoxGeometry(6,8.5,5.2),new T.MeshLambertMaterial({color:0x5f6870}));a.position.set(ax,4.25,0);g.add(a);const c=new T.Mesh(new T.CylinderGeometry(3,3,5.2,16,1,false,0,Math.PI),new T.MeshLambertMaterial({color:0x5f6870}));c.rotation.z=Math.PI/2;c.rotation.y=Math.PI/2;c.position.set(ax,8.5,0);g.add(c);});
      const fl=new T.Mesh(new T.BoxGeometry(30.2,1.2,5.2),new T.MeshBasicMaterial({map:gpGhanaFlagTex()}));fl.material.userData.lin=1;fl.position.y=13.6;g.add(fl);
      g.position.set(p.x,groundAt(p.x,p.z),p.z);g.rotation.y=yawAt(i);scene.add(g);}
    // Black Star Square: the big paved parade ground + stands in red, gold and green
    {const sq=(Z.square||[[0.9,0.13]]);sq.forEach(([a,b])=>{const ia=Math.round(a*M),ib=Math.round(b*M)+(b<a?M:0);const sd=-(C.parkSide||1);{const cols=7,v=[],uv=[],idx=[];let n=0;for(let i=ia;i<=ib;i++){const sa=samples[wrapI(i)];for(let c=0;c<=cols;c++){const off=sd*(W+7.2+(62.8*c/cols)),px=sa.pos.x+sa.nor.x*off,pz=sa.pos.z+sa.nor.z*off;v.push(px,groundAt(px,pz)+0.09,pz);uv.push(c*62.8/cols/6,(i-ia)*ds/6);}
          if(i<ib)for(let c=0;c<cols;c++){const k=n*(cols+1)+c;idx.push(k,k+cols+1,k+1,k+1,k+cols+1,k+cols+2);}n++;}   // the parade ground follows the ground (a flat ribbon was buried under the terrain)
        const pg=new T.BufferGeometry();pg.setAttribute("position",new T.Float32BufferAttribute(v,3));pg.setAttribute("uv",new T.Float32BufferAttribute(uv,2));pg.setIndex(idx);pg.computeVertexNormals();
        const slab=gpCanvasTex(128,128,(x,w,h)=>{x.fillStyle="#ddd6c6";x.fillRect(0,0,w,h);for(let i=0;i<300;i++){x.fillStyle="rgba(0,0,0,.035)";x.fillRect(rnd()*w,rnd()*h,3,3);}x.strokeStyle="rgba(90,80,60,.28)";x.lineWidth=2;x.strokeRect(1,1,w-2,h-2);x.beginPath();x.moveTo(w/2,0);x.lineTo(w/2,h);x.moveTo(0,h/2);x.lineTo(w,h/2);x.stroke();},true);
        const pm=new T.Mesh(pg,new T.MeshLambertMaterial({map:slab,side:T.DoubleSide}));pm.receiveShadow=true;scene.add(pm);}
      const st=[];for(let i=ia+4;i<ib-4;i+=Math.round(16/ds))st.push(i);
      const crowd=gpCanvasTex(256,64,(x,w,h)=>{x.fillStyle="#e9e4d8";x.fillRect(0,0,w,h);x.fillStyle="#cfc9bb";x.fillRect(0,h-12,w,12);const cols=["#ce1126","#fcd116","#006b3f","#f4f4f4","#1f5fbf","#ff7a00","#8e3bd6","#111"],skin=["#5c3a24","#7a4b2e","#8d5a3b","#4a2e1c","#a06a45"];
        for(let c=0;c<36;c++){const px=4+c*7+rnd()*2,py=30+rnd()*4;x.fillStyle=cols[(rnd()*cols.length)|0];x.fillRect(px-3,py,6,14);x.fillStyle=skin[(rnd()*skin.length)|0];x.beginPath();x.arc(px,py-4,3,0,7);x.fill();
          if(c%7===3){x.fillStyle="#ddd";x.fillRect(px+3,py-22,1,20);["#ce1126","#fcd116","#006b3f"].forEach((fc,q)=>{x.fillStyle=fc;x.fillRect(px+4,py-22+q*3,9,3);});}}},true);crowd.repeat.set(4,1);
      for(let t=0;t<4;t++)IM(new T.BoxGeometry(15,1.2,2.6),new T.MeshLambertMaterial({map:crowd}),st,(i,k,m)=>{const p=sidePt(i,-sd*(W+9+t*2.4));m.setMatrixAt(k,put(p.x,groundAt(p.x,p.z)+0.6+t*1.2,p.z,yawAt(i)));},{shadow:true});
      const kt=gpKenteTex().clone();kt.needsUpdate=true;kt.wrapS=kt.wrapT=T.RepeatWrapping;kt.repeat.set(15/0.6,1.1/1.2);
      IM(new T.PlaneGeometry(15.6,1.1),new T.MeshLambertMaterial({map:kt}),st,(i,k,m)=>{const p=sidePt(i,-sd*(W+7.66));const s2=samples[wrapI(i)];dummy.position.set(p.x,groundAt(p.x,p.z)+0.62,p.z);dummy.rotation.set(0,0,0);dummy.scale.set(1,1,1);dummy.lookAt(p.x+s2.nor.x*sd*5,groundAt(p.x,p.z)+0.62,p.z+s2.nor.z*sd*5);dummy.updateMatrix();m.setMatrixAt(k,dummy.matrix);});
      IM(new T.BoxGeometry(15.8,0.35,11),new T.MeshLambertMaterial({color:0xf4f1ea}),st,(i,k,m)=>{const p=sidePt(i,-sd*(W+12.8));m.setMatrixAt(k,put(p.x,groundAt(p.x,p.z)+8.4,p.z,yawAt(i)));},{shadow:true});
      const edge=gpCanvasTex(96,24,(x,w,h)=>{["#ce1126","#fcd116","#006b3f"].forEach((c,q)=>{x.fillStyle=c;x.fillRect(0,q*h/3,w,h/3+1);});});
      IM(new T.BoxGeometry(15.8,0.6,0.2),new T.MeshLambertMaterial({map:edge}),st,(i,k,m)=>{const p=sidePt(i,-sd*(W+7.3));m.setMatrixAt(k,put(p.x,groundAt(p.x,p.z)+8.2,p.z,yawAt(i)));});
      const poles=[];st.forEach(i=>[-6.5,6.5].forEach(o=>{const s2=samples[wrapI(i)],p=sidePt(i,-sd*(W+7.6));poles.push([p.x+s2.tan.x*o,groundAt(p.x,p.z),p.z+s2.tan.z*o]);}));
      IM(new T.CylinderGeometry(0.12,0.12,8.4,6).translate(0,4.2,0),new T.MeshLambertMaterial({color:0xdedad2}),poles,(q,k,m)=>{m.setMatrixAt(k,put(q[0],q[1],q[2],0));});});}
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
  if(TH==="dakar")gpDakarWorld({T,scene,C,samples,M,W,ds,nearest,groundAt,dummy,rnd,kap,ribbonR,inStands,poMat,IM,put,lin,inZ,Z,sidePt,yawAt,clearOf,wrapI,out,cx:X.cx,cz:X.cz});
  if(TH==="desert")gpDesertWorld({T,scene,C,samples,M,W,ds,groundAt,dummy,rnd,ribbonR,inStands,poMat,IM,put,lin,inZ,Z,sidePt,yawAt,clearOf,wrapI,out,cx:X.cx,cz:X.cz});
  if(TH==="deep")gpDeepWorld({T,scene,C,samples,M,W,ds,groundAt,dummy,rnd,ribbonR,wallS,poMat,IM,put,inZ,Z,sidePt,yawAt,clearOf,wrapI,out,phone:phone3()});
  return out;}
/* ---------- Desert Rally (job 1105-0558): dunes, red-rock canyon with an arch, mesas, saguaro cacti, scrub, tumbleweeds rolling
   across the road, an oasis with palms and water, a dry riverbed, a tent camp at the start/finish and a heat shimmer on the horizon.
   Every repeated prop is ONE instanced mesh (one draw call each), so iPad keeps its frame rate. ---------- */
function gpDesertWorld(D){const {T,scene,C,samples,M,W,ds,groundAt,dummy,rnd,ribbonR,inStands,poMat,IM,put,lin,inZ,Z,sidePt,yawAt,clearOf,wrapI,out}=D;
  const rr=(a,b)=>a+rnd()*(b-a),pick=a=>a[Math.floor(rnd()*a.length)];
  // sand counts as dirt for grip + dust (packed-sand road sections and the dry riverbed)
  const z0=out.zoneAt;out.zoneAt=(i,n)=>n==="dirt"?(z0(i,"sand")||z0(i,"riverbed")):z0(i,n);
  // ---- packed sand over the road: light ochre with two darker tyre ruts ----
  const sandT=gpCanvasTex(128,128,(x,w,h)=>{x.fillStyle="#cfa66c";x.fillRect(0,0,w,h);for(let i=0;i<1800;i++){const v=150+rnd()*80|0;x.fillStyle="rgba("+v+","+(v-28|0)+","+(v-70|0)+",.5)";x.fillRect(rnd()*w,rnd()*h,2+rnd()*2,2);}
    x.fillStyle="rgba(110,70,35,.2)";x.fillRect(w*0.24,0,14,h);x.fillRect(w*0.64,0,14,h);},true);
  const sandM=poMat(new T.MeshLambertMaterial({map:sandT}));
  (Z.sand||[]).forEach(([a,b])=>{const ia=Math.round(a*M),ib=Math.round(b*M);ribbonR(ia,ib<ia?ib+M:ib,-W-2.6,W+2.6,sandM,0.045,0.045,0.08);});
  // ---- dry riverbed: a wide pale wash of cracked mud across the road, round stones, a sign ----
  const mudT=gpCanvasTex(256,256,(x,w,h)=>{x.fillStyle="#d9c3a0";x.fillRect(0,0,w,h);x.strokeStyle="rgba(120,90,60,.55)";x.lineWidth=2;
    for(let k=0;k<70;k++){let px=rnd()*w,py=rnd()*h;x.beginPath();x.moveTo(px,py);for(let s=0;s<4;s++){px+=(rnd()-0.5)*50;py+=(rnd()-0.5)*50;x.lineTo(px,py);}x.stroke();}},true);
  const stones=[];(Z.riverbed||[]).forEach(([a,b])=>{const ia=Math.round(a*M),ib=Math.round(b*M);ribbonR(ia,ib,-W-34,W+34,poMat(new T.MeshLambertMaterial({map:mudT})),-1.05,-1.05,0.05);
    ribbonR(ia,ib,-W,W,poMat(new T.MeshLambertMaterial({map:mudT,color:0xf2e6d0})),0.05,0.05,0.12);
    for(let i=ia;i<=ib;i+=2)for(let r=0;r<2;r++){const sd=rnd()<0.5?-1:1,p=sidePt(i,sd*(W+3+rnd()*30));stones.push([p.x,groundAt(p.x,p.z),p.z,0.25+rnd()*0.6,rnd()*6.28]);}});
  // ---- rocks: canyon walls (tall red pillars both sides), boulders, distant mesas with strata ----
  const rockG=new T.DodecahedronGeometry(1,0),rockM=new T.MeshLambertMaterial({color:0xffffff,flatShading:true});
  const reds=["#b4532a","#a8471f","#c46a3a","#9c3f22","#cf7a45","#b85d33"];
  const walls=[];for(let i=0;i<M;i+=Math.max(1,Math.round(5/ds))){if(!inZ(i,"canyon"))continue;[-1,1].forEach(sd=>{for(let r=0;r<2;r++){const off=W+6.5+r*7+rnd()*3,p=sidePt(i,sd*off);if(!clearOf(p.x,p.z,W+5.5))continue;
    walls.push([p.x,groundAt(p.x,p.z),p.z,rr(4,7),rr(9,22)*(r?1.3:1),rr(4,7),rnd()*6.28,pick(reds)]);}});}
  IM(rockG,rockM,walls,(w,k,m)=>{m.setMatrixAt(k,put(w[0],w[1]+w[4]*0.42,w[2],w[6],w[3],w[4],w[5]));m.setColorAt(k,lin(w[7]));},{shadow:true});
  const boulders=[];for(let k=0;k<260;k++){const i=Math.floor(rnd()*M),sd=rnd()<0.5?-1:1,p=sidePt(i,sd*(W+8+rnd()*60));if(!clearOf(p.x,p.z,W+6)||inStands(i))continue;boulders.push([p.x,groundAt(p.x,p.z),p.z,rr(0.6,2.6),rnd()*6.28,pick(reds)]);}
  stones.forEach(s=>boulders.push([s[0],s[1],s[2],s[3],s[4],"#bba78a"]));
  IM(rockG,rockM.clone(),boulders,(b,k,m)=>{m.setMatrixAt(k,put(b[0],b[1]+b[3]*0.25,b[2],b[4],b[3],b[3]*0.7,b[3]*1.1));m.setColorAt(k,lin(b[5]));},{shadow:true});
  const strataT=gpCanvasTex(64,256,(x,w,h)=>{const cs=["#c9693a","#b4532a","#d98b55","#a4482a","#e0a070","#b85d33","#c26a40"];let y=0;while(y<h){const t=6+rnd()*26;x.fillStyle=pick(cs);x.fillRect(0,y,w,t);y+=t;}
    x.fillStyle="rgba(0,0,0,.08)";for(let i=0;i<60;i++)x.fillRect(rnd()*w,rnd()*h,1,8+rnd()*20);},true);
  const mesas=[];for(let k=0;k<26;k++){const a=rnd()*6.283,r=420+rnd()*520,x=D.cx+Math.cos(a)*r,z=D.cz+Math.sin(a)*r;if(!clearOf(x,z,W+120))continue;mesas.push([x,groundAt(x,z),z,rr(40,120),rr(30,85),rnd()*6.28]);}
  const mg=new T.CylinderGeometry(1,1.18,1,9,1,false);mg.translate(0,0.5,0);
  IM(mg,new T.MeshLambertMaterial({map:strataT,flatShading:true}),mesas,(q,k,m)=>{m.setMatrixAt(k,put(q[0],q[1]-4,q[2],q[5],q[3],q[4],q[3]*rr(0.6,1)));},{noRecv:true});
  // ---- the rock arch over the canyon road ----
  (Z.arch||[]).forEach(([a,b])=>{const i=Math.round((a+b)/2*M),s=samples[wrapI(i)],R=W+7.5,g=new T.Group();
    const am=new T.MeshLambertMaterial({color:new T.Color("#b65a2e"),flatShading:true});const tor=new T.Mesh(new T.TorusGeometry(R,2.6,7,22,Math.PI),am);tor.scale.set(1,1.12,1.25);tor.castShadow=true;g.add(tor);
    [-1,1].forEach(sd=>{const leg=new T.Mesh(rockG,am);leg.scale.set(4.2,5.5,4.6);leg.position.set(sd*R,1.5,0);leg.castShadow=true;g.add(leg);const top=new T.Mesh(rockG,am);top.scale.set(3.4,2.6,3.6);top.position.set(sd*R*0.55,R*0.95,0.4);g.add(top);});
    g.position.set(s.pos.x,s.pos.y-0.6,s.pos.z);g.rotation.y=yawAt(i);scene.add(g);out.arch=g;});
  // ---- saguaro cacti: one merged trunk + arms geometry, instanced ----
  const cyl=(r,h,x,y,z,rz)=>{const c=new T.CylinderGeometry(r*0.92,r,h,8);if(rz)c.rotateZ(rz);c.translate(x,y,z);return{g:c};},cap=(r,x,y,z)=>{const q=new T.SphereGeometry(r,8,5,0,Math.PI*2,0,Math.PI/2);q.translate(x,y,z);return{g:q};};
  const sag=gpMerge(T,[cyl(0.36,5.2,0,2.6,0),cap(0.33,0,5.2,0),cyl(0.22,1.0,0.65,2.2,0,Math.PI/2),cyl(0.22,1.7,1.12,3.0,0),cap(0.2,1.12,3.85,0),cyl(0.2,0.8,-0.55,2.9,0,Math.PI/2),cyl(0.2,1.3,-0.92,3.5,0),cap(0.19,-0.92,4.15,0)]);
  const cacti=[];for(let i=0;i<M;i+=Math.max(1,Math.round(9/ds))){if(inStands(i)||inZ(i,"canyon")||inZ(i,"oasis"))continue;[-1,1].forEach(sd=>{if(rnd()<0.45)return;const p=sidePt(i,sd*(W+7+rnd()*26));if(!clearOf(p.x,p.z,W+5.5))return;cacti.push([p.x,groundAt(p.x,p.z),p.z,rr(0.7,1.35),rnd()*6.28]);});}
  for(let k=0;k<160;k++){const a=rnd()*6.283,r=60+rnd()*420,x=D.cx+Math.cos(a)*r,z=D.cz+Math.sin(a)*r;if(!clearOf(x,z,W+20))continue;cacti.push([x,groundAt(x,z),z,rr(0.8,1.5),rnd()*6.28]);}
  IM(sag,new T.MeshLambertMaterial({color:new T.Color("#4f8a3c"),vertexColors:false}),cacti,(c,k,m)=>{m.setMatrixAt(k,put(c[0],c[1]-0.1,c[2],c[4],c[3],c[3],c[3]));},{shadow:true});
  // ---- scrub bushes (low olive / khaki domes) ----
  const scrub=[];for(let k=0;k<620;k++){const i=Math.floor(rnd()*M),sd=rnd()<0.5?-1:1,p=sidePt(i,sd*(W+3.5+rnd()*48));if(!clearOf(p.x,p.z,W+3)||inStands(i))continue;scrub.push([p.x,groundAt(p.x,p.z),p.z,rr(0.5,1.3),rnd()*6.28,pick(["#7d7a3e","#8c8448","#6e6a36","#9a8a52","#5f6b35"])]);}
  IM(new T.IcosahedronGeometry(1,0),new T.MeshLambertMaterial({color:0xffffff,flatShading:true}),scrub,(b,k,m)=>{m.setMatrixAt(k,put(b[0],b[1]+b[3]*0.2,b[2],b[4],b[3]*1.3,b[3]*0.6,b[3]*1.2));m.setColorAt(k,lin(b[5]));});
  // ---- oasis: a pond with a grass ring, palms and reeds beside the road ----
  const palms=[],reeds=[];(Z.oasis||[]).forEach(([a,b])=>{const ia=Math.round(a*M),ib=Math.round(b*M),im=Math.round((ia+ib)/2);[-1,1].forEach(sd=>{const off=W+17,p=sidePt(im,sd*off);if(!clearOf(p.x,p.z,W+9))return;
    const y=groundAt(p.x,p.z),yaw=yawAt(im),grass=new T.Mesh(new T.CircleGeometry(1,28).rotateX(-Math.PI/2),new T.MeshLambertMaterial({color:new T.Color("#6f9a3c")}));grass.rotation.y=yaw;grass.scale.set(14,1,24);grass.position.set(p.x,y+0.04,p.z);grass.receiveShadow=true;scene.add(grass);
    const wm=new T.MeshStandardMaterial({color:new T.Color("#2f8fb0"),roughness:0.08,metalness:0.35,envMapIntensity:1.3});const pond=new T.Mesh(new T.CircleGeometry(1,28).rotateX(-Math.PI/2),wm);pond.rotation.y=yaw;pond.scale.set(9,1,17);pond.position.set(p.x,y+0.09,p.z);scene.add(pond);out.ponds=(out.ponds||[]).concat([pond]);
    for(let k=0;k<11;k++){const ang=k/11*6.283+rnd()*0.3,ex=Math.cos(ang),ez=Math.sin(ang),s=samples[wrapI(im)],q=[p.x+(s.nor.x*ex*11+s.tan.x*ez*19),p.z+(s.nor.z*ex*11+s.tan.z*ez*19)];if(!clearOf(q[0],q[1],W+3.5))continue;palms.push([q[0],groundAt(q[0],q[1]),q[1],rr(0.85,1.3),rnd()*6.28]);}
    for(let k=0;k<26;k++){const ang=rnd()*6.283,s=samples[wrapI(im)],q=[p.x+(s.nor.x*Math.cos(ang)*9.4+s.tan.x*Math.sin(ang)*17.4),p.z+(s.nor.z*Math.cos(ang)*9.4+s.tan.z*Math.sin(ang)*17.4)];reeds.push([q[0],y,q[1],rr(0.6,1.2),rnd()*6.28]);}});});
  // a few lonely palms along the oasis stretch
  for(let i=0;i<M;i+=Math.max(1,Math.round(16/ds))){if(!inZ(i,"oasis"))continue;const sd=rnd()<0.5?-1:1,p=sidePt(i,sd*(W+6+rnd()*6));if(clearOf(p.x,p.z,W+5))palms.push([p.x,groundAt(p.x,p.z),p.z,rr(0.8,1.2),rnd()*6.28]);}
  if(palms.length){const PG=gpPalmGeos(T);IM(PG.trunk,new T.MeshLambertMaterial({color:0x8a7356}),palms,(p,k,m)=>{m.setMatrixAt(k,put(p[0],p[1]-0.1,p[2],p[4],p[3],p[3],p[3]));},{shadow:true});
    IM(PG.crown,new T.MeshLambertMaterial({color:0xffffff,side:T.DoubleSide}),palms,(p,k,m)=>{m.setMatrixAt(k,put(p[0],p[1]-0.1,p[2],p[4],p[3],p[3],p[3]));m.setColorAt(k,lin(["#3f7d2c","#4d8a33","#5a9433","#3a6f2a"][k%4]));},{shadow:true});}
  const reedG=new T.ConeGeometry(0.18,1.6,4);reedG.translate(0,0.8,0);IM(reedG,new T.MeshLambertMaterial({color:new T.Color("#5d7f2e")}),reeds,(r,k,m)=>{m.setMatrixAt(k,put(r[0],r[1],r[2],r[4],r[3],r[3],r[3]));});
  // ---- the camp at the start / finish: striped tents, a big canopy, flags on poles, crates and barrels ----
  const tents=[],canopies=[],flags=[],barrels=[];(Z.camp||[]).forEach(([a,b])=>{const ia=Math.round(a*M),ib=Math.round(b*M)+(b<a?M:0);
    for(let i=ia+6;i<ib;i+=Math.max(1,Math.round(15/ds))){[-1,1].forEach(sd=>{const off=W+13+rnd()*10,p=sidePt(i,sd*off);if(!clearOf(p.x,p.z,W+10))return;tents.push([p.x,groundAt(p.x,p.z),p.z,rr(2.4,3.6),yawAt(i)+Math.PI/4,pick(["#f2f2f2","#e8603c","#f2b705","#1f8fa8","#d9d0bf"])]);
      if(rnd()<0.5){const q=sidePt(i+3,sd*(W+5.6));barrels.push([q.x,groundAt(q.x,q.z),q.z,rnd()*6.28,pick(["#c8321e","#1f5fbf","#2e9e57","#e0a100"])]);}});
      if((i-ia)%Math.round(30/ds)<Math.round(15/ds)){const sd=((i/Math.round(15/ds))|0)%2?1:-1,p=sidePt(i,sd*(W+4.6));flags.push([p.x,groundAt(p.x,p.z),p.z,samples[wrapI(i)].nor.clone(),sd,pick(["#ff7a00","#12b0e8","#ffd23f","#ff2d87"])]);}}
    const im=ia+Math.round(30/ds);[-1,1].forEach(sd=>{const p=sidePt(im,sd*(W+11));if(clearOf(p.x,p.z,W+9))canopies.push([p.x,groundAt(p.x,p.z),p.z,yawAt(im)]);});});
  const tentG=new T.ConeGeometry(1,1.4,4,1);tentG.translate(0,0.7,0);IM(tentG,new T.MeshLambertMaterial({color:0xffffff,flatShading:true}),tents,(t,k,m)=>{m.setMatrixAt(k,put(t[0],t[1],t[2],t[4],t[3],t[3]*1.1,t[3]));m.setColorAt(k,lin(t[5]));},{shadow:true});
  const awnT=gpCanvasTex(128,32,(x,w,h)=>{for(let k=0;k<8;k++){x.fillStyle=k%2?"#f4efe4":"#e8603c";x.fillRect(k*16,0,16,h);}});
  IM(new T.BoxGeometry(14,0.35,8).translate(0,4.2,0),new T.MeshLambertMaterial({map:awnT}),canopies,(c,k,m)=>{m.setMatrixAt(k,put(c[0],c[1],c[2],c[3]));},{shadow:true});
  const cp=[];canopies.forEach(c=>{[[-6.6,-3.6],[6.6,-3.6],[-6.6,3.6],[6.6,3.6]].forEach(o=>{const cs=Math.cos(c[3]),sn=Math.sin(c[3]);cp.push([c[0]+o[0]*cs+o[1]*sn,c[1],c[2]-o[0]*sn+o[1]*cs]);});});
  IM(new T.CylinderGeometry(0.1,0.1,4.2,6).translate(0,2.1,0),new T.MeshLambertMaterial({color:0x8d939c}),cp,(p,k,m)=>{m.setMatrixAt(k,put(p[0],p[1],p[2],0));});
  IM(new T.CylinderGeometry(0.06,0.08,7,6).translate(0,3.5,0),new T.MeshLambertMaterial({color:0xdddddd}),flags,(f,k,m)=>{m.setMatrixAt(k,put(f[0],f[1],f[2],0));},{shadow:true});
  const penG=new T.BufferGeometry();penG.setAttribute("position",new T.Float32BufferAttribute([0,0,0,0,-1.8,0,2.4,-0.9,0],3));penG.computeVertexNormals();
  IM(penG,new T.MeshLambertMaterial({color:0xffffff,side:T.DoubleSide}),flags,(f,k,m)=>{dummy.position.set(f[0],f[1]+6.9,f[2]);dummy.rotation.set(0,Math.atan2(f[3].x,f[3].z)+(f[4]>0?Math.PI:0)-Math.PI/2,0);dummy.scale.set(1,1,1);dummy.updateMatrix();m.setMatrixAt(k,dummy.matrix);m.setColorAt(k,lin(f[5]));});
  IM(new T.CylinderGeometry(0.42,0.42,1.1,10).translate(0,0.55,0),new T.MeshLambertMaterial({color:0xffffff}),barrels,(b,k,m)=>{m.setMatrixAt(k,put(b[0],b[1],b[2],b[3]));m.setColorAt(k,lin(b[4]));},{shadow:true});
  // ---- tumbleweeds: a tangle of twigs on a ball; they roll across the road ahead of the player (no collision) ----
  const twT=gpCanvasTex(128,128,(x,w,h)=>{x.clearRect(0,0,w,h);x.lineCap="round";for(let i=0;i<120;i++){x.strokeStyle=rnd()<0.5?"#8a6a3c":"#a98652";x.lineWidth=1+rnd()*2;x.beginPath();let px=rnd()*w,py=rnd()*h;x.moveTo(px,py);x.quadraticCurveTo(px+(rnd()-0.5)*60,py+(rnd()-0.5)*60,px+(rnd()-0.5)*80,py+(rnd()-0.5)*80);x.stroke();}});
  const twM=new T.MeshLambertMaterial({map:twT,transparent:true,alphaTest:0.35,side:T.DoubleSide,depthWrite:true});
  const TWN=9,twIM=new T.InstancedMesh(new T.IcosahedronGeometry(0.8,1),twM,TWN);twIM.castShadow=true;twIM.frustumCulled=false;scene.add(twIM);
  const tws=[];for(let k=0;k<TWN;k++)tws.push({i:Math.floor(rnd()*M),off:(rnd()-0.5)*80,dir:rnd()<0.5?-1:1,v:3+rnd()*3,rot:0,ph:rnd()*6,sc:0.8+rnd()*0.7,life:0});
  out.tumble=tws;
  // ---- heat shimmer: a faint wavy band low on the horizon that follows the camera ----
  const shT=gpCanvasTex(512,64,(x,w,h)=>{x.clearRect(0,0,w,h);for(let i=0;i<46;i++){const y=h*(0.25+rnd()*0.6);x.strokeStyle="rgba(255,236,200,"+(0.06+rnd()*0.12).toFixed(3)+")";x.lineWidth=1+rnd()*2.5;x.beginPath();x.moveTo(0,y);for(let px=0;px<=w;px+=16)x.lineTo(px,y+Math.sin(px*0.05+i)*2.2);x.stroke();}
    const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,"rgba(255,226,180,0)");g.addColorStop(0.55,"rgba(255,226,180,.16)");g.addColorStop(1,"rgba(255,226,180,0)");x.fillStyle=g;x.fillRect(0,0,w,h);},true);
  shT.repeat.set(6,1);const shM=new T.MeshBasicMaterial({map:shT,transparent:true,depthWrite:false,fog:false,side:T.BackSide,blending:T.AdditiveBlending});shM.userData.lin=1;
  const shimmer=new T.Mesh(new T.CylinderGeometry(700,700,46,48,1,true),shM);shimmer.renderOrder=1;shimmer.frustumCulled=false;scene.add(shimmer);
  out.update=(dt,me,cam,waiting)=>{shT.offset.x+=dt*0.004;shT.offset.y=Math.sin(performance.now()/700)*0.03;shimmer.position.set(cam.x,me.pos.y+12,cam.z);
    (out.ponds||[]).forEach(p=>{p.material.envMapIntensity=1.2+0.15*Math.sin(performance.now()/500);});
    const mi=Math.floor(me.t*M);tws.forEach((w,k)=>{w.life-=dt;let ahead=((w.i-mi)%M+M)%M;if(ahead>M/2)ahead-=M;
      if(w.life<=0||ahead*ds<-30||ahead*ds>260){w.i=wrapI(mi+Math.round((50+rnd()*150)/ds));w.dir=rnd()<0.5?-1:1;w.off=-w.dir*(W+16+rnd()*10);w.v=3+rnd()*3.5;w.life=24;w.sc=0.8+rnd()*0.7;}
      w.off+=w.dir*w.v*dt;if(Math.abs(w.off)>W+40)w.life=0;w.rot+=w.v*dt/(0.8*w.sc);w.ph+=dt*w.v*1.3;
      const s=samples[wrapI(w.i)],x=s.pos.x+s.nor.x*w.off,z=s.pos.z+s.nor.z*w.off,y=(Math.abs(w.off)<W+2?s.pos.y:groundAt(x,z))+0.8*w.sc+Math.abs(Math.sin(w.ph))*0.9;
      dummy.position.set(x,y,z);dummy.rotation.set(0,Math.atan2(s.nor.x,s.nor.z),0);dummy.rotateX(w.rot*w.dir);dummy.scale.setScalar(w.sc);dummy.updateMatrix();twIM.setMatrixAt(k,dummy.matrix);});
    twIM.instanceMatrix.needsUpdate=true;};
}
/* ---------- Coral Deep (job 1106-2314): the road dives under the sea. Everything underwater hangs off R3.dp and exists only on this course:
   the surface seen from above and below, blue fog, light rays, bubbles, caustics, coral, kelp and fish, five kinds of big friendly animals on fixed,
   learnable paths (a bump and a slowdown, never a crash), and ramps that throw the car right out of the water with a splash each way.
   Every animal is one merged mesh + one small wave shader, so a whole animal is one draw call. ---------- */
const GP_DEEP={
  env:{fog:"#0a86c6",near:10,far:235,top:"#7be6ff",mid:"#159fdc",hor:"#0a86c6",sun:0.8,hemi:0.92,hemiSky:"#a6ecff",hemiGnd:"#1c6f9c"},
  hit:{normal:0.6,gentle:0.74,floor:0.3,safe:1.5,slowS:1.5,slowN:0.66,slowE:0.8},pay:0.07,
  kinds:{
    whale:{n:"WHALE",e:"🐋",say:"the whale",s:1.4,a:11.4,b:3.3,y:4.3,top:8.4,span:72,P:18},
    turtle:{n:"TURTLES",e:"🐢",say:"the turtles",s:1.5,a:2.8,b:2.2,y:1.75,top:3.9,span:62,P:10.5},
    manta:{n:"MANTA RAY",e:"🌊",say:"the manta ray",s:1.35,a:3.0,b:5.4,y:2.2,top:4.1,span:26,P:8.8},
    octo:{n:"OCTOPUS",e:"🐙",say:"the octopus",s:1.3,a:3.4,b:3.4,y:0.7,top:7,span:14,P:12.8},
    shark:{n:"SHARK",e:"🦈",say:"the shark",s:1.3,a:5.2,b:1.6,y:1.9,top:4,span:18,P:6.8}}};
/* a kind's road-frame path at time tm: d = metres along the road from the zone centre, x = lane (same units as kt.x), h = extra height. Fixed and periodic, so a child can learn it */
function gpDeepPath(A,tm){const K=GP_DEEP.kinds[A.kind],P=K.P*A.slow,w=Math.PI*2/P,u=tm*w+A.ph;
  switch(A.kind){
    case"whale":return{d:A.d0+55*Math.sin(u),x:0.56*Math.cos(u),h:Math.sin(u*2)*0.25};   // a long lazy oval: one lane up, the other lane back
    case"turtle":return{d:A.d0,x:1.42*Math.sin(u),h:Math.sin(u*3)*0.18};                  // straight across and back
    case"manta":return{d:A.d0+16*Math.sin(u*2),x:1.0*Math.sin(u),h:0.45*Math.sin(u*2+1)}; // a wide figure of eight
    case"shark":return{d:A.d0+12*Math.sin(u*2),x:1.04*Math.sin(u),h:0.15*Math.sin(u*3)};  // a sweep from side to side
    case"octo":{const L=[-0.62,0,0.62,0],s=P/4,q=((tm+A.ph*P/6.2832)%P+P)%P,n=Math.floor(q/s),f=(q-n*s)/s,hop=0.62,e=f<hop?0:(f-hop)/(1-hop),m=e*e*(3-2*e);   // sits, then hops to the next spot: left, middle, right, middle
      return{d:A.d0,x:L[n]+(L[(n+1)%4]-L[n])*m,h:Math.sin(Math.PI*e)*3.1,next:L[(n+1)%4],soon:f>=hop-0.3&&f<1,crouch:f<hop&&f>hop-0.1?1:0};}
  }return{d:A.d0,x:0,h:0};}
/* ---- building the animals ---- */
function gpDeepKit(T){const V=[],N=[],C=[],W=[],col=new T.Color(),tmp=new T.Vector3();
  const add=(geo,tf,cf,wf)=>{const g=geo.index?geo.toNonIndexed():geo;g.computeVertexNormals();const P=g.attributes.position,Nn=g.attributes.normal;const pv=new T.Vector3();
    const out=[];for(let i=0;i<P.count;i++){pv.set(P.getX(i),P.getY(i),P.getZ(i));tf(pv);out.push(pv.x,pv.y,pv.z);}
    for(let i=0;i<out.length;i+=9){const a=tmp.set(out[i],out[i+1],out[i+2]).clone(),b=new T.Vector3(out[i+3],out[i+4],out[i+5]),c=new T.Vector3(out[i+6],out[i+7],out[i+8]);const n=b.clone().sub(a).cross(c.clone().sub(a)).normalize();
      [a,b,c].forEach(p=>{V.push(p.x,p.y,p.z);const c0=cf(p);col.set(c0).convertSRGBToLinear();C.push(col.r,col.g,col.b);const w0=wf?wf(p):0;W.push(w0);});N.push(n.x,n.y,n.z,n.x,n.y,n.z,n.x,n.y,n.z);}};
  // smooth normals on the round parts: average by rounded position when finished
  const finish=()=>{const m=new Map();for(let i=0;i<V.length;i+=3){const k=Math.round(V[i]*40)+","+Math.round(V[i+1]*40)+","+Math.round(V[i+2]*40);let e=m.get(k);if(!e){e=[0,0,0];m.set(k,e);}e[0]+=N[i];e[1]+=N[i+1];e[2]+=N[i+2];}
    const nn=new Float32Array(N.length);for(let i=0;i<V.length;i+=3){const k=Math.round(V[i]*40)+","+Math.round(V[i+1]*40)+","+Math.round(V[i+2]*40),e=m.get(k),l=Math.hypot(e[0],e[1],e[2])||1;nn[i]=e[0]/l;nn[i+1]=e[1]/l;nn[i+2]=e[2]/l;}
    const G=new T.BufferGeometry();G.setAttribute("position",new T.Float32BufferAttribute(V,3));G.setAttribute("normal",new T.BufferAttribute(nn,3));G.setAttribute("color",new T.Float32BufferAttribute(C,3));G.setAttribute("aW",new T.Float32BufferAttribute(W,1));return G;};
  const ball=(sx,sy,sz,px,py,pz,cf,wf,seg)=>add(new T.SphereGeometry(1,seg||14,Math.max(8,(seg||14)-4)),p=>{p.set(p.x*sx+px,p.y*sy+py,p.z*sz+pz);},typeof cf==="function"?cf:(()=>cf),wf);
  const eye=(sd,x,y,z,r,lookZ,wf)=>{   // big round friendly eye: white, a large dark pupil looking forward, one shiny dot
    ball(r,r,r,sd*x,y,z,"#ffffff",wf,12);ball(r*0.62,r*0.68,r*0.62,sd*(x+r*0.5),y,z+r*(lookZ||0.25),"#11213f",wf,10);ball(r*0.2,r*0.2,r*0.2,sd*(x+r*0.92),y+r*0.3,z+r*(lookZ||0.25)+r*0.2,"#ffffff",wf,6);};
  const smile=(pts,r,cf,wf)=>{const c=new T.CatmullRomCurve3(pts.map(p=>new T.Vector3(p[0],p[1],p[2])));add(new T.TubeGeometry(c,16,r,6,false),()=>{},()=>cf,wf);};
  return{add,ball,eye,smile,finish};}
function gpDeepGeo(T,kind){const K=gpDeepKit(T),lerp=(a,b,t)=>a+(b-a)*t;
  if(kind==="whale"){   // 18 m, chubby and round-headed, head towards +z
    const prof=z=>{const u=(z+1)/2;return Math.pow(Math.max(0,Math.sin(Math.PI*Math.pow(u,1.9))),0.6)+0.08*(1-u);};
    const wW=p=>Math.pow(Math.max(0,(-p.z+1.5)/10),2);
    K.add(new T.SphereGeometry(1,28,20),p=>{const zz=p.z,r=prof(zz);p.set(p.x*r*3.15,p.y*r*(p.y<0?3.05:2.75),zz*9);},p=>{const y=p.y,gr=Math.sin(p.x*5.2)>0.1;if(y<-0.55)return (gr&&p.z>-3.5)?"#d8e7ee":"#f4f6ee";return y>1.6?"#2d6fc0":"#3d86d6";},wW);
    [[1.55,1.75,1.15,0.3,0.95],[-1.2,2.2,1.0,0.25,0.8],[-3.4,1.8,0.82,0.22,0.7],[2.9,2.0,0.72,0.2,0.65],[0.8,2.55,0.6,0.16,0.55]].forEach(s=>{K.ball(s[3],s[3]*0.8,s[3],s[1]*0.45,s[1]+0.15,s[0],"#dff2fb",wW,6);K.ball(s[3],s[3]*0.8,s[3],-s[1]*0.45,s[1]+0.15,s[0]-0.4,"#dff2fb",wW,6);});   // cute pale spots on the back
    K.eye(1,2.1,0.55,6.0,0.62,0.45);K.eye(-1,2.1,0.55,6.0,0.62,0.45);
    [[1,3.15],[-1,3.15]].forEach(([s])=>{K.smile([[s*3.0,-0.75,4.1],[s*2.75,-0.95,5.6],[s*2.1,-0.95,7.2],[s*0.95,-0.72,8.55]],0.09,"#1a3a6b");});
    [-1,1].forEach(s=>K.add(new T.SphereGeometry(1,12,8),p=>{const t=Math.abs(p.x);p.set(s*(2.2+(p.x*s+1)*1.9),-1.45+p.y*0.22-(p.x*s+1)*0.7,1.7+p.z*(1.25-t*0.5));},()=>"#2d6fc0",p=>Math.pow(Math.abs(p.x)/5,2)*0.5));
    [-1,1].forEach(s=>K.add(new T.SphereGeometry(1,12,8),p=>{p.set(s*(p.x*s+1.1)*2.05,p.y*0.16+0.25,-8.8+p.z*(1.3-Math.abs(p.x)*0.55)-Math.abs(p.x)*0.9);},()=>"#2d6fc0",()=>1.3));
    return K.finish();}
  if(kind==="manta"){   // 9.5 m across, thin and smooth, a wide happy mouth
    const wW=p=>Math.pow(Math.min(1,Math.abs(p.x)/4.6),1.6)*1.5;
    K.add(new T.SphereGeometry(1,28,18),p=>{const u=Math.abs(p.x),th=Math.max(0.05,1-Math.pow(u,1.25)),sw=Math.pow(u,1.5)*1.8,ln=Math.pow(1-Math.pow(u,1.6),0.65);p.set(p.x*4.8,p.y*0.62*th+u*u*0.3,p.z*2.9*ln-sw+0.4);},p=>{if(p.y<-0.02)return"#f5f8f2";const sp=Math.abs(Math.sin(p.x*1.4)*Math.cos(p.z*1.7));return sp>0.9&&Math.abs(p.x)>0.8?"#a9d6ef":(Math.abs(p.x)<1?"#1d4e96":"#2767b8");},wW);
    [-1,1].forEach(s=>K.add(new T.SphereGeometry(1,8,6),p=>{p.set(s*(1.0+p.x*0.24),0.08+p.y*0.13,3.1+p.z*0.95+(p.z>0?0.05:0));},()=>"#1d4e96"));   // the two soft horns
    {const c=new T.CatmullRomCurve3([[0,0,-1.8],[0,0,-3.5],[0,0.15,-5.2]].map(a=>new T.Vector3(a[0],a[1],a[2])));K.add(new T.TubeGeometry(c,8,0.09,6,false),()=>{},()=>"#1d4e96",p=>Math.max(0,(-p.z-1.8)/3.4)*0.9);}
    K.eye(1,1.18,0.38,2.25,0.42,0.5);K.eye(-1,1.18,0.38,2.25,0.42,0.5);
    K.smile([[-1.15,-0.09,2.86],[-0.5,-0.2,3.2],[0.5,-0.2,3.2],[1.15,-0.09,2.86]],0.07,"#1a3a6b");
    return K.finish();}
  if(kind==="turtle"){   // 3.6 m, round shell with big soft tiles, smiling head
    const wF=p=>Math.min(1,Math.pow(Math.abs(p.x)/2.3,2))*1.2;
    K.add(new T.SphereGeometry(1,22,14),p=>{p.set(p.x*1.65,(p.y>0?p.y*1.02:p.y*0.34)+0.1,p.z*2.0);},p=>{if(p.y<0.1)return"#efe3a8";const hx=Math.abs(((p.x*1.1)%1.2+1.2)%1.2-0.6),hz=Math.abs(((p.z*0.95+(Math.floor(p.x*1.1/1.2+0.5)%2?0.6:0))%1.2+1.2)%1.2-0.6);return(hx>0.5||hz>0.5)?"#1a7a35":"#37b24a";});
    K.ball(0.88,0.78,0.98,0,0.34,2.5,"#8fdc6a",null,14);
    K.eye(1,0.52,0.58,3.0,0.31,0.5);K.eye(-1,0.52,0.58,3.0,0.31,0.5);K.smile([[-0.5,0.05,3.05],[-0.2,-0.08,3.38],[0.2,-0.08,3.38],[0.5,0.05,3.05]],0.04,"#1a5a2a");
    [-1,1].forEach(s=>{K.add(new T.SphereGeometry(1,10,6),p=>{p.set(s*(1.45+(p.x*s+1)*1.05),-0.05+p.y*0.13,1.1+p.z*(0.72-Math.abs(p.x)*0.25)+(p.x*s+1)*0.55);},()=>"#6fcc55",wF);K.add(new T.SphereGeometry(1,8,6),p=>{p.set(s*(1.25+(p.x*s+1)*0.55),-0.05+p.y*0.11,-1.5+p.z*0.5-(p.x*s+1)*0.2);},()=>"#6fcc55",wF);});
    return K.finish();}
  if(kind==="octo"){   // round pink head, huge eyes, eight curly arms; +z is its face
    const wT=p=>Math.max(0,Math.min(1,Math.hypot(p.x,p.z)/3.6));
    K.add(new T.SphereGeometry(1,24,18),p=>{const up=Math.max(0,p.y);p.set(p.x*(1.82+up*0.35),2.95+p.y*(p.y>0?2.1:1.15),p.z*(1.82+up*0.35));},p=>{const sp=Math.abs(Math.sin(p.x*2.1+1)*Math.sin(p.y*2.3)*Math.sin(p.z*2.1+2));return sp>0.62&&p.y>3.5?"#ffb1cf":"#ff5fa2";});
    K.eye(1,0.88,3.2,1.5,0.72,0.55);K.eye(-1,0.88,3.2,1.5,0.72,0.55);
    K.smile([[-0.72,2.42,1.62],[-0.28,2.12,1.92],[0.28,2.12,1.92],[0.72,2.42,1.62]],0.07,"#a31e62");
    [-1,1].forEach(s=>K.ball(0.3,0.16,0.14,s*1.34,2.62,1.3,"#ff9dc4",null,8));   // rosy cheeks
    for(let k=0;k<8;k++){const a=(k+0.5)/8*Math.PI*2,c=Math.cos(a),n=Math.sin(a),pts=[];for(let i=0;i<7;i++){const t=i/6,r=1.05+t*3.1,h=2.1-t*2.0+Math.sin(t*3.1)*0.32;const swirl=a+t*0.6;pts.push(new T.Vector3(Math.cos(swirl)*r,h,Math.sin(swirl)*r));}
      const cv=new T.CatmullRomCurve3(pts),G=new T.TubeGeometry(cv,18,1,7,false),P=G.attributes.position,uv=G.attributes.uv;for(let i=0;i<P.count;i++){const u=uv.getX(i),q=cv.getPointAt(Math.min(1,Math.max(0,u))),rad=0.46*(1-u)+0.08;P.setXYZ(i,q.x+(P.getX(i)-q.x)*rad,q.y+(P.getY(i)-q.y)*rad,q.z+(P.getZ(i)-q.z)*rad);}
      K.add(G,()=>{},p=>p.y<0.5?"#ffc2d9":"#ff4f97",wT);}
    return K.finish();}
  if(kind==="shark"){   // 8.5 m, blue-grey and rounded with a closed-mouth grin: a friend, not a monster
    const wS=p=>Math.pow(Math.max(0,(-p.z+1.2)/5.4),2);
    K.add(new T.SphereGeometry(1,24,16),p=>{const u=(p.z+1)/2,r=Math.pow(Math.max(0,Math.sin(Math.PI*Math.pow(u,1.25))),0.72)+0.05*(1-u);p.set(p.x*r*1.32,p.y*r*1.42,p.z*4.25);},p=>p.y<-0.32?"#f6f8f4":(p.y>0.62?"#4e87c2":"#6ea4d6"));
    K.add(new T.SphereGeometry(1,10,6),p=>{const t=(p.y+1)/2;p.set(p.x*0.14*(1.1-t),1.15+t*1.7,-0.2+p.z*(1.05-t*0.75)-t*0.75);},()=>"#4e87c2");   // dorsal fin
    [-1,1].forEach(s=>K.add(new T.SphereGeometry(1,10,6),p=>{const t=(p.x*s+1)/2;p.set(s*(0.95+t*1.75),-0.45+p.y*0.11-t*0.55,0.9+p.z*(0.75-t*0.42)-t*0.6);},()=>"#4e87c2"));
    K.add(new T.SphereGeometry(1,10,6),p=>{const t=p.y;p.set(p.x*0.11,t*1.6+(t>0?0.25:0),-4.5+p.z*(0.72-Math.abs(t)*0.38)-Math.abs(t)*0.65);},()=>"#4e87c2",()=>1.5);
    K.eye(1,0.8,0.42,2.45,0.42,0.55);K.eye(-1,0.8,0.42,2.45,0.42,0.55);
    K.smile([[-1.02,-0.2,2.05],[-0.62,-0.42,3.05],[0,-0.48,3.62],[0.62,-0.42,3.05],[1.02,-0.2,2.05]],0.055,"#17345e");
    return K.finish();}
  return K.finish();}
/* the same wave shader for all of them: `mode` picks how the weighted parts swim (0 body up-down, 1 wings flap, 2 flippers row, 3 arms curl, 4 tail side to side) */
function gpDeepAnimalMat(T,mode,U){const m=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});m.userData.lin=1;m.toneMapped=false;
  m.onBeforeCompile=sh=>{sh.uniforms.uDpA=U.t;sh.uniforms.uDpH=U.hit;sh.fragmentShader=sh.fragmentShader.replace("#include <fog_fragment>","gl_FragColor.rgb+=vColor*0.2;\n#ifdef USE_FOG\nfloat dpF=smoothstep(fogNear,fogFar,fogDepth)*0.55;gl_FragColor.rgb=mix(gl_FragColor.rgb,fogColor,dpF);\n#endif");sh.vertexShader="uniform float uDpA;uniform float uDpH;attribute float aW;\n"+sh.vertexShader.replace("#include <begin_vertex>",
   "#include <begin_vertex>\nfloat dpT=uDpA+float("+mode+")*1.3;\n"+
   ({0:"transformed.y+=sin(dpT*1.25-position.z*0.35)*aW*0.85;transformed.x+=sin(dpT*0.7)*aW*0.05;",
     1:"transformed.y+=sin(dpT*1.9-abs(position.x)*0.32)*aW*1.05;",
     2:"transformed.y+=sin(dpT*2.9+sign(position.x)*position.z*0.25)*aW*0.42;",
     3:"transformed.x+=sin(dpT*2.0+atan(position.z,position.x)*2.0)*aW*0.48;transformed.y+=sin(dpT*2.4+atan(position.z,position.x)*3.0)*aW*0.42;transformed.z+=cos(dpT*2.0+atan(position.z,position.x)*2.0)*aW*0.48;",
     4:"transformed.x+=sin(dpT*3.1-position.z*0.55)*aW*1.05;"}[mode]||"")+
   "\ntransformed*=1.0+uDpH*0.1*sin(uDpA*22.0);");};
  m.customProgramCacheKey=()=>"gpDeepAnimal"+mode;return m;}
/* ---- soft textures made once ---- */
function gpDeepCausticTex(T){if(window._gpDpCa&&window._gpDpCa.ok)return window._gpDpCa.t;const S=128,cv=document.createElement("canvas");cv.width=cv.height=S;const x=cv.getContext("2d"),im=x.createImageData(S,S),pts=[];let s=7;const r=()=>{s=(s*16807)%2147483647;return(s-1)/2147483646;};for(let i=0;i<22;i++)pts.push([r(),r()]);
  for(let j=0;j<S;j++)for(let i=0;i<S;i++){let a=9,b=9;const u=i/S,v=j/S;for(const p of pts){let dx=Math.abs(u-p[0]),dy=Math.abs(v-p[1]);if(dx>0.5)dx=1-dx;if(dy>0.5)dy=1-dy;const d=Math.hypot(dx,dy);if(d<a){b=a;a=d;}else if(d<b)b=d;}const e=Math.pow(Math.max(0,1-(b-a)*11),2.6),k=i+j*S<<2,c=e*255;im.data[k]=c;im.data[k+1]=c;im.data[k+2]=c;im.data[k+3]=255;}
  x.putImageData(im,0,0);const t=new T.CanvasTexture(cv);t.wrapS=t.wrapT=T.RepeatWrapping;t.generateMipmaps=true;t.minFilter=T.LinearMipMapLinearFilter;window._gpDpCa={t,ok:0};return t;}
/* moving caustic light on the road and the seabed: only below the water line */
function gpDeepCaustics(T){const tex=gpDeepCausticTex(T),U={tex:{value:tex},t:{value:0},y:{value:0},k:{value:1}};
  return{U,patch(m){m.onBeforeCompile=sh=>{sh.uniforms.uDpTex=U.tex;sh.uniforms.uDpT=U.t;sh.uniforms.uDpY=U.y;sh.uniforms.uDpK=U.k;
      sh.vertexShader="varying vec3 vDpW;\n"+sh.vertexShader.replace("#include <project_vertex>","#include <project_vertex>\nvDpW=(modelMatrix*vec4(transformed,1.0)).xyz;");
      sh.fragmentShader="varying vec3 vDpW;uniform sampler2D uDpTex;uniform float uDpT;uniform float uDpY;uniform float uDpK;\n"+sh.fragmentShader.replace("#include <fog_fragment>",
       "{float c1=texture2D(uDpTex,vDpW.xz*0.043+vec2(uDpT*0.018,uDpT*0.011)).r,c2=texture2D(uDpTex,vDpW.xz*0.067-vec2(uDpT*0.021,-uDpT*0.014)).r;float dk=smoothstep(uDpY+0.1,uDpY-1.6,vDpW.y);gl_FragColor.rgb+=vec3(0.5,0.9,1.0)*min(c1,c2)*0.5*dk*uDpK;}\n#include <fog_fragment>");};
    m.customProgramCacheKey=()=>"gpDeepCa"+m.type;return m;}};}
/* ---- the world: seabed props, kelp, coral, fish, sunken ship, reef arch, surface sheets, ramps, banners ---- */
function gpDeepWorld(D){const {T,scene,C,samples,M,W,ds,groundAt,dummy,rnd,ribbonR,wallS,poMat,IM,put,inZ,Z,sidePt,yawAt,clearOf,wrapI,out,story,phone}=D;const SEA=C.deep.y,rr=(a,b)=>a+rnd()*(b-a),pick=a=>a[Math.floor(rnd()*a.length)];
  const U={t:{value:0},hit:{value:0}},dp=out.deep={y:SEA,U,kelpT:{value:0},k:-1,t:0};
  const inDeep=i=>{const n=wrapI(i);return samples[n].pos.y<SEA-3;};
  // ---- spots along the road, either side, on the seabed ----
  const spots=(n,o0,o1,test)=>{const L=[];let tries=0;while(L.length<n&&tries++<n*14){const i=Math.floor(rnd()*M),sd=rnd()<0.5?-1:1,off=rr(o0,o1),p=sidePt(i,sd*off);if(!test(i,p))continue;if(!clearOf(p.x,p.z,W+3.2))continue;const y=groundAt(p.x,p.z);L.push([p.x,y,p.z,rnd()*6.28,rnd(),i,sd,off]);}return L;};
  const under=(i,p)=>groundAt(p.x,p.z)<SEA-1.6;
  const CO=["#ff5fa2","#ff7a59","#ffb238","#c86bff","#ff4b82","#f7d046","#ff8fb8","#48d8c8"],GR=["#1fae6a","#38c96b","#129a7a","#7bd13c"];
  const mul=phone?0.62:1,lam=(o)=>new T.MeshLambertMaterial(o);
  // ---- kelp forests: ribbons that sway (one instanced draw) ----
  const kelpTex=gpCanvasTex(64,256,(x,w,h)=>{x.clearRect(0,0,w,h);x.strokeStyle="#fff";x.lineWidth=5;x.beginPath();x.moveTo(w/2,h);x.lineTo(w/2,0);x.stroke();x.fillStyle="#fff";for(let i=0;i<13;i++){const y=h-12-i*19,s=i%2?1:-1,ln=24-i*0.8;x.beginPath();x.moveTo(w/2,y+7);x.quadraticCurveTo(w/2+s*ln*0.9,y+2,w/2+s*ln,y-11);x.quadraticCurveTo(w/2+s*ln*0.3,y-9,w/2,y-3);x.fill();}});
  {const g=new T.PlaneGeometry(2.4,12,1,8);g.translate(0,6,0);const g2=g.clone();g2.rotateY(Math.PI/2);const kg=gpMerge(T,[{g},{g:g2}]);const km=lam({map:kelpTex,alphaTest:0.45,side:T.DoubleSide,color:0xffffff,emissive:0x0a2a1c});km.userData.lin=1;
    km.onBeforeCompile=sh=>{sh.uniforms.uDpK=dp.kelpT;sh.vertexShader="uniform float uDpK;\n"+sh.vertexShader.replace("#include <begin_vertex>","#include <begin_vertex>\nfloat ky=position.y/12.0;float kph=instanceMatrix[3].x*0.21+instanceMatrix[3].z*0.17;transformed.x+=sin(uDpK*1.1+kph+ky*3.0)*ky*ky*2.3;transformed.z+=cos(uDpK*0.9+kph*1.3+ky*2.2)*ky*ky*1.5;");};
    const L=spots(Math.round(340*mul),W+4,W+62,under);IM(kg,km,L,(p,k,m)=>{const s=0.75+p[4]*0.9,room=Math.max(0.3,(SEA-1.5-p[1])/12);m.setMatrixAt(k,put(p[0],p[1]-0.2,p[2],p[3],s,Math.min(room,s*(0.65+p[4]*0.55)),s));m.setColorAt(k,gpLin(GR[k%GR.length]));},{noRecv:1});}
  // ---- coral ----
  const brainG=new T.IcosahedronGeometry(1,1);{const P=brainG.attributes.position;for(let i=0;i<P.count;i++){const n=1+0.09*Math.sin(P.getX(i)*9)*Math.sin(P.getZ(i)*9);P.setXYZ(i,P.getX(i)*n,Math.max(-0.2,P.getY(i))*0.75*n,P.getZ(i)*n);}brainG.computeVertexNormals();}
  const tubeParts=[];for(let k=0;k<7;k++){const a=k/7*6.28,r=k?0.55:0,h=1.1+((k*37)%7)*0.2,c=new T.CylinderGeometry(0.22,0.28,h,6,1,false);c.translate(Math.cos(a)*r,h/2,Math.sin(a)*r);tubeParts.push({g:c});}
  const tubeG=gpMerge(T,tubeParts);
  const branchParts=[];const branch=(x,y,z,a,e,len,d)=>{const dx=Math.cos(a)*Math.sin(e),dy=Math.cos(e),dz=Math.sin(a)*Math.sin(e),c=new T.CylinderGeometry(0.06+0.05*d,0.09+0.06*d,len,6);c.applyMatrix4(new T.Matrix4().lookAt(new T.Vector3(dx,dy,dz),new T.Vector3(),new T.Vector3(0,0,1)).multiply(new T.Matrix4().makeRotationX(Math.PI/2)));c.translate(x+dx*len/2,y+dy*len/2,z+dz*len/2);branchParts.push({g:c});if(d>0)for(let q=0;q<3;q++)branch(x+dx*len,y+dy*len,z+dz*len,a+q*2.1+d,e+0.42,len*0.7,d-1);};branch(0,0,0,0,0,0.9,2);
  const branchG=gpMerge(T,branchParts);
  const fanTex=gpCanvasTex(128,128,(x,w,h)=>{x.clearRect(0,0,w,h);x.strokeStyle="#fff";x.lineCap="round";const go=(px,py,a,l,d)=>{if(d<0)return;const qx=px+Math.cos(a)*l,qy=py+Math.sin(a)*l;x.lineWidth=d*0.9+0.9;x.beginPath();x.moveTo(px,py);x.lineTo(qx,qy);x.stroke();go(qx,qy,a-0.42,l*0.78,d-1);go(qx,qy,a+0.42,l*0.78,d-1);};go(64,126,-1.57,26,6);});
  const fanG=new T.PlaneGeometry(4,4);fanG.translate(0,2,0);const fanM=lam({map:fanTex,alphaTest:0.3,side:T.DoubleSide,color:0xffffff,emissive:0x1c1016});fanM.userData.lin=1;
  const coralSet=(geo,mat,n,o0,o1,s0,s1,cols,rand)=>{const L=spots(Math.round(n*mul),o0,o1,under);IM(geo,mat,L,(p,k,m)=>{const s=rr(s0,s1);m.setMatrixAt(k,put(p[0],p[1]-0.1,p[2],p[3],s,s,s));m.setColorAt(k,gpLin(cols[k%cols.length]));},{noRecv:1});};
  const coralM=lam({color:0xffffff,emissive:0x1c1016});coralM.userData.lin=1;
  coralSet(brainG,coralM,170,W+3.4,W+40,0.9,3.4,CO);coralSet(tubeG,coralM,120,W+3.4,W+34,1,3.1,CO.slice().reverse());coralSet(branchG,coralM,100,W+3.4,W+34,1.6,4.2,CO);coralSet(fanG,fanM,110,W+3.5,W+34,0.9,2.3,["#c86bff","#ff5fa2","#ffb238","#ff7a59"]);
  // ---- round boulders and tall sea stacks that give the fog something to swallow ----
  {const rg=new T.DodecahedronGeometry(1,1);{const P=rg.attributes.position;for(let i=0;i<P.count;i++){const n=1+0.14*Math.sin(P.getX(i)*5+P.getZ(i)*3)*Math.cos(P.getY(i)*4);P.setXYZ(i,P.getX(i)*n,P.getY(i)*n,P.getZ(i)*n);}rg.computeVertexNormals();}
    const rm=lam({color:0xffffff});rm.userData.lin=1;const L=spots(Math.round(110*mul),W+5,W+68,under);IM(rg,rm,L,(p,k,m)=>{const s=rr(1.4,5.5);m.setMatrixAt(k,put(p[0],p[1]-s*0.25,p[2],p[3],s*rr(0.9,1.5),s*rr(0.6,1.1),s*rr(0.9,1.5)));m.setColorAt(k,gpLin(pick(["#4b7a91","#5c8d9e","#6a8fa0","#3d6c84"])));},{noRecv:1,shadow:false});
    const L2=spots(Math.round(44*mul),W+42,W+190,under);IM(rg,rm,L2,(p,k,m)=>{const s=rr(8,20);m.setMatrixAt(k,put(p[0],p[1]-3,p[2],p[3],s,s*rr(1.1,1.85),s));m.setColorAt(k,gpLin(pick(["#2f7a98","#3a7f9d","#2a6f90"])));},{noRecv:1});}
  // ---- fish schools: each a small instanced shoal circling near the road ----
  {const fp=[];const b=new T.SphereGeometry(0.5,8,6);b.scale(0.45,0.7,1);fp.push({g:b});const tl=new T.ConeGeometry(0.42,0.6,4);tl.rotateX(-Math.PI/2);tl.scale(0.2,1,1);tl.translate(0,0,-0.68);fp.push({g:tl});const fg=gpMerge(T,fp);fg.deleteAttribute("color");const fm=lam({color:0xffffff,emissive:0x202020});fm.userData.lin=1;
    const SC=["#ffd23f","#ff7a59","#39e0d0","#ff5fa2","#fff2a8"],sch=[];const zs=["reef","turtle","octo","whale","manta","shark"].filter(n=>Z[n]);const NS=phone?5:8;for(let q=0;q<NS;q++){const zn=zs[q%zs.length],r0=Z[zn][q%Z[zn].length],i=Math.round((r0[0]+(r0[1]-r0[0])*((q*0.37)%1))*M),sd=q%2?1:-1,p=sidePt(i,sd*(W+rr(11,26)));const g=new T.Group();g.position.set(p.x,samples[wrapI(i)].pos.y+rr(3,8),p.z);const N=phone?16:26,im=new T.InstancedMesh(fg,fm,N);const R=rr(5,9);for(let k=0;k<N;k++){const a=k/N*6.28+rnd()*0.2,r=R+rnd()*3.2,yy=(rnd()-0.5)*3.4,s=rr(0.55,1.15);dummy.position.set(Math.cos(a)*r,yy,Math.sin(a)*r);dummy.rotation.set(0,-a+Math.PI,0);dummy.scale.set(s,s,s);dummy.updateMatrix();im.setMatrixAt(k,dummy.matrix);im.setColorAt(k,gpLin(SC[q%SC.length]));}im.instanceColor.needsUpdate=true;im.frustumCulled=false;g.add(im);scene.add(g);sch.push({g,v:(q%2?1:-1)*rr(0.28,0.5)});}dp.fish=sch;}
  // ---- landmarks: a pink coral arch over the road, and a sunken wooden ship by the whale's road ----
  {const zn=Z.octo&&Z.octo[0];if(zn){const i=Math.round(zn[1]*M)+Math.round(30/ds),s=samples[wrapI(i)],g=new T.Group(),am=lam({color:0xff5fa2,emissive:0x2a0b18}),dm=lam({color:0xffa24c,emissive:0x2a1608});[am,dm].forEach(m=>{m.userData.lin=1;});const R0=W+4.2,a=new T.Mesh(new T.TorusGeometry(R0,1.7,10,36,Math.PI),am);g.add(a);const bs=[];for(let k=0;k<26;k++){const t=k/25*Math.PI,r=R0+(k%2?1.4:-1.2),q=new T.IcosahedronGeometry(0.75+((k*13)%7)*0.14,1);q.translate(Math.cos(t)*r,Math.sin(t)*r,(k%3-1)*1.1);bs.push({g:q});}g.add(new T.Mesh(gpMerge(T,bs),dm));g.position.set(s.pos.x,s.pos.y-0.5,s.pos.z);g.rotation.y=yawAt(i);scene.add(g);}
    const zw=Z.whale&&Z.whale[0];if(zw){const i=Math.round((zw[0]+zw[1])/2*M),sd=-1,p=sidePt(i,sd*(W+34)),hl=new T.Group(),wood=lam({color:0x8a5a33}),dk=lam({color:0x6a4426}),sail=lam({color:0xf0e6c8,side:T.DoubleSide,transparent:true,opacity:0.9});[wood,dk,sail].forEach(m=>{m.userData.lin=1;});
      const hullG=new T.SphereGeometry(1,16,8,0,6.29,Math.PI/2,Math.PI/2);hullG.scale(5,6,16);hl.add(new T.Mesh(hullG,wood));const dg=new T.BoxGeometry(9.2,0.5,28);hl.add(new T.Mesh(dg,dk));const md=(h,z)=>{const m=new T.Mesh(new T.CylinderGeometry(0.28,0.42,h,8).translate(0,h/2,z),dk);hl.add(m);const sg=new T.PlaneGeometry(8,h*0.45,6,4);{const P=sg.attributes.position;for(let q=0;q<P.count;q++){const u=P.getX(q)/4;P.setZ(q,(1-u*u)*1.4);}sg.computeVertexNormals();sg.translate(0,h*0.58,z+0.9);}hl.add(new T.Mesh(sg,sail));};md(15,-5);md(19,5);
      hl.position.set(p.x,groundAt(p.x,p.z)+2.6,p.z);hl.rotation.set(0.14,yawAt(i)+0.45,0.28);scene.add(hl);}}
  // ---- beach above the water: palms, parasols and a sand strip beside the start ----
  {const up=(i,p)=>groundAt(p.x,p.z)>SEA+0.9;const pl=spots(phone?36:56,W+5,W+42,up);if(pl.length){const PG=gpPalmGeos(T),tm=lam({color:0x9a7a55}),cm=lam({color:0x37b34a,side:T.DoubleSide});IM(PG.trunk,tm,pl,(p,k,m)=>{const s=rr(1,1.4);p[8]=s;m.setMatrixAt(k,put(p[0],p[1]-0.1,p[2],p[3],s,s,s));},{shadow:true});IM(PG.crown,cm,pl,(p,k,m)=>{m.setMatrixAt(k,put(p[0],p[1]-0.1,p[2],p[3],p[8],p[8],p[8]));},{shadow:true});}
    const para=spots(phone?14:24,W+5,W+24,up);if(para.length){const pg=new T.ConeGeometry(2.3,1.0,8);pg.translate(0,3.0,0);const stick=new T.CylinderGeometry(0.06,0.06,3,6);stick.translate(0,1.5,0);const pc=gpMerge(T,[{g:pg},{g:stick}]);const pm=lam({color:0xffffff});pm.userData.lin=1;IM(pc,pm,para,(p,k,m)=>{m.setMatrixAt(k,put(p[0],p[1],p[2],p[3],1,1,1));m.setColorAt(k,gpLin(["#ff4b82","#ffdf00","#00d2ff","#ff7a59"][k%4]));},{shadow:true});}}
  // ---- the water, seen from above (a bright sea) and from below (a shining ceiling) ----
  const ca=gpDeepCausticTex(T);
  {const topT=gpCanvasTex(256,256,(x,w,h)=>{x.fillStyle="#0a8ad8";x.fillRect(0,0,w,h);for(let i=0;i<500;i++){x.fillStyle="rgba(120,230,255,.12)";x.fillRect(rnd()*w,rnd()*h,5,1.5);}x.strokeStyle="rgba(255,255,255,.42)";x.lineWidth=1.6;for(let i=0;i<34;i++){const px=rnd()*w,py=rnd()*h,l=10+rnd()*26;x.beginPath();x.moveTo(px,py);x.quadraticCurveTo(px+l/2,py-4,px+l,py);x.stroke();}},true);topT.repeat.set(60,60);
    const tm=new T.MeshBasicMaterial({map:topT,transparent:true,opacity:0.95,depthWrite:false,side:T.FrontSide});tm.toneMapped=false;tm.userData.lin=1;tm.color.setRGB(1,1,1);
    const top=new T.Mesh(new T.PlaneGeometry(5200,5200).rotateX(-Math.PI/2),tm);top.position.y=SEA;top.renderOrder=3;top.frustumCulled=false;scene.add(top);dp.top=top;dp.topT=topT;
    const bt=gpCanvasTex(128,128,(x,w,h)=>{x.fillStyle="#2bb0e4";x.fillRect(0,0,w,h);x.globalCompositeOperation="lighter";x.globalAlpha=0.5;x.drawImage(ca.image,0,0,w,h);},true);bt.repeat.set(24,24);const bm=new T.MeshBasicMaterial({map:bt,side:T.BackSide,fog:true});bm.userData.lin=1;bm.toneMapped=false;
    const bot=new T.Mesh(new T.PlaneGeometry(1500,1500).rotateX(-Math.PI/2),bm);bot.position.y=SEA;bot.renderOrder=-1;bot.frustumCulled=false;scene.add(bot);dp.bot=bot;dp.botT=bt;}
  // ---- light rays: slanted additive planes that wrap around the camera ----
  {const rt=gpCanvasTex(64,256,(x,w,h)=>{const g=x.createLinearGradient(0,0,w,0);g.addColorStop(0,"rgba(255,255,255,0)");g.addColorStop(0.5,"rgba(255,255,255,1)");g.addColorStop(1,"rgba(255,255,255,0)");x.fillStyle=g;x.fillRect(0,0,w,h);const v=x.createLinearGradient(0,0,0,h);v.addColorStop(0,"rgba(0,0,0,0)");v.addColorStop(0.06,"rgba(0,0,0,0)");v.addColorStop(0.72,"rgba(0,0,0,.84)");v.addColorStop(1,"rgba(0,0,0,1)");x.globalCompositeOperation="destination-out";x.fillStyle=v;x.fillRect(0,0,w,h);});
    const g=new T.PlaneGeometry(1,1);g.translate(0,-0.5,0);const m=new T.MeshBasicMaterial({map:rt,color:0xbff2ff,transparent:true,opacity:0.2,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide,fog:false});m.userData.lin=1;m.toneMapped=false;const N=phone?9:14,im=new T.InstancedMesh(g,m,N);im.frustumCulled=false;im.renderOrder=4;scene.add(im);const L=[];for(let k=0;k<N;k++)L.push({x:rnd()*170,z:rnd()*170,w:6+rnd()*15,h:50+rnd()*26,ph:rnd()*6.28,v:0.25+rnd()*0.4});dp.rays={im,L,m};}
  // ---- ramps out of the water: bold chevrons up the kicker, a red/white lip, coral-pink sides ----
  const mkBanner=(i,text,bg,fg)=>{const s=samples[wrapI(i)],yaw=Math.atan2(s.tan.x,s.tan.z);const pm=lam({color:0x0b1b3d});pm.userData.lin=1;const pole=new T.CylinderGeometry(0.22,0.26,9,8).translate(0,4.5,0);[-1,1].forEach(sd=>{const m=new T.Mesh(pole,pm);m.position.set(s.pos.x+s.nor.x*sd*(W+1.3),s.pos.y-0.8,s.pos.z+s.nor.z*sd*(W+1.3));scene.add(m);});
    const bm=new T.MeshBasicMaterial({map:gpTextTex(text,bg,fg,1024,128,74),side:T.DoubleSide});bm.userData.lin=1;bm.toneMapped=false;const b=new T.Mesh(new T.PlaneGeometry(2*(W+1.3),1.9),bm);b.position.set(s.pos.x,s.pos.y+7.2,s.pos.z);b.rotation.y=yaw+Math.PI;scene.add(b);};
  const chevT=gpCanvasTex(256,256,(x,w,h)=>{x.fillStyle="#0b1b3d";x.fillRect(0,0,w,h);const cv=(cy,col)=>{x.fillStyle=col;x.beginPath();x.moveTo(0,cy+60);x.lineTo(w/2,cy-40);x.lineTo(w,cy+60);x.lineTo(w,cy+118);x.lineTo(w/2,cy+18);x.lineTo(0,cy+118);x.closePath();x.fill();};cv(-64,"#ffdf00");cv(64,"#00d2ff");cv(192,"#ffdf00");},true);dp.chevT=chevT;
  {const rm=new T.MeshBasicMaterial({map:chevT,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});rm.userData.lin=1;const lipT=gpCanvasTex(128,32,(x,w,h)=>{for(let k=0;k<8;k++){x.fillStyle=k%2?"#ffffff":"#ff4b82";x.fillRect(k*16,0,16,h);}},true),lm=new T.MeshBasicMaterial({map:lipT,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3});lm.userData.lin=1;const side=lam({color:0xff5fa2,emissive:0x2a0b18,side:T.DoubleSide});side.userData.lin=1;
    (C.jumps||[]).forEach(J=>{if(J[2]!=="leap")return;const ij=Math.round(J[0]/C.lapM*M);let ib=ij,by=-1e9;for(let k=-18;k<=18;k++){const i=wrapI(ij+k);if(samples[i].pos.y>by){by=samples[i].pos.y;ib=ij+k;}}
      const n=Math.round(52/ds),rb=ribbonR(ib-n,ib,-W,W,rm,0.05,0.05,1/7);rb.receiveShadow=false;ribbonR(ib-1,ib,-W,W,lm,0.09,0.09,1/2,false);[-1,1].forEach(sd=>wallS(ib-n,ib+Math.round(7/ds),W+0.05,sd,-7,0.25,side,0.1));mkBanner(ib-n-Math.round(14/ds),"LEAP!  🐬  FULL SPEED",["#ff4b82","#ff7a00"],"#ffffff");});}
  // ---- the signs on the way down and back up ----
  (Z.dive||[]).forEach(([a,b])=>mkBanner(Math.round(a*M)+Math.round(18/ds),"DIVE!  🫧  DOWN WE GO",["#0072ff","#00d2ff"],"#ffffff"));
  (Z.surface||[]).forEach(([a,b])=>mkBanner(Math.round(a*M)+Math.round(36/ds),"BACK TO THE SUN  ☀️",["#ffb300","#ff7a00"],"#0b1b3d"));
  // ---- the animals + their warnings: a banner well ahead, a tinted stretch of road, a soft shadow that shows exactly where each one is ----
  const lanes=[["turtle",[0,1,2].map(k=>({d:(k-1)*44,ph:k*2.1}))],["octo",[{d:0,ph:0}]],["whale",[{d:0,ph:0}]],["manta",[{d:0,ph:1.0}]],["shark",[{d:-38,ph:0},{d:44,ph:Math.PI}]]];
  const geos={},mats={whale:0,manta:1,turtle:2,octo:3,shark:4};const animals=[],meets=[];
  const zoneT=gpCanvasTex(128,128,(x,w,h)=>{x.clearRect(0,0,w,h);x.fillStyle="rgba(255,223,0,.62)";for(let k=0;k<6;k++)x.fillRect(4+k*21,50,13,28);},true);
  const zoneM=poMat(new T.MeshBasicMaterial({map:zoneT,transparent:true,depthWrite:false}));zoneM.userData.lin=1;zoneM.toneMapped=false;
  lanes.forEach(([kind,list])=>{const zs=Z[kind];if(!zs)return;const K=GP_DEEP.kinds[kind];if(!geos[kind])geos[kind]=gpDeepGeo(T,kind);zs.forEach(zn=>{const c=(zn[0]+zn[1])/2,cd=c*C.lapM;const li=Math.round(c*M);
      const E={kind,c,d:c,ring:null,hits:{},paid:{},list:[]};meets.push(E);
      list.forEach(q=>{const U1={t:U.t,hit:{value:0}},mat=gpDeepAnimalMat(T,mats[kind],U1),mesh=new T.Mesh(geos[kind],mat);mesh.scale.setScalar(K.s||1);mesh.frustumCulled=true;mesh.visible=false;scene.add(mesh);const A={kind,d0:q.d,ph:q.ph,slow:1,mesh,U:U1,E,yaw:null,hitT:0,x:0,relYaw:0,dNow:0,hNow:0};animals.push(A);E.list.push(A);});
      const half=Math.round(K.span/ds);ribbonR(li-half,li+half,-W,W,zoneM,0.055,0.055,1/6.5);
      mkBanner(li-half-Math.round(110/ds),K.e+"  "+K.n+" AHEAD  "+K.e,["#ffdf00","#ffb300"],"#0b1b3d");
      if(kind==="octo"){const rg=new T.RingGeometry(1.7,2.5,28);rg.rotateX(-Math.PI/2);const rm=poMat(new T.MeshBasicMaterial({color:0xffdf00,transparent:true,opacity:0.9,depthWrite:false,side:T.DoubleSide}));rm.userData.lin=1;rm.toneMapped=false;const ring=new T.Mesh(rg,rm);ring.visible=false;scene.add(ring);E.ring=ring;}});});
  dp.animals=animals;dp.meets=meets;
  {const sh=new T.InstancedMesh(new T.PlaneGeometry(1,1).rotateX(-Math.PI/2),(()=>{const m=new T.MeshBasicMaterial({map:gpSoftDot(),color:0x05243f,transparent:true,opacity:0.62,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3});m.userData.lin=1;m.toneMapped=false;return m;})(),Math.max(1,animals.length));sh.frustumCulled=false;scene.add(sh);dp.shad=sh;}
}
/* the world's frame for the road at d metres along the lap */
function gpDeepAt(R,d,xn,out){const M=R.M,f=(((d/R.len)%1+1)%1)*M,i=Math.floor(f)%M,u=f-Math.floor(f),a=R.samples[i],b=R.samples[(i+1)%M],XS=R.W-1.2;out.x=a.pos.x+(b.pos.x-a.pos.x)*u+a.nor.x*xn*XS;out.y=a.pos.y+(b.pos.y-a.pos.y)*u;out.z=a.pos.z+(b.pos.z-a.pos.z)*u+a.nor.z*xn*XS;out.tx=a.tan.x;out.tz=a.tan.z;return out;}
function gpDeepInit(){const R=R3,dp=R.dp,T=R.T;dp.easy=gpPace()==="gentle";dp.slow=dp.easy?1.28:1;dp.animals.forEach(A=>{A.slow=dp.slow;});dp.cue=$("gp3Deep");dp.cueTxt="";dp.wash=$("gp3Wash");dp.pA={};dp.pB={};dp.stats={hits:0,dodges:0,exits:0,entries:0,log:[]};
  dp.spl=gpParticles(T,R.scene,phone3()?360:620,1.5,false,0.96);R.splash=dp.spl;
  dp.drop=gpParticles(T,R.scene,phone3()?200:320,0.5,false,0.95);dp.bub=gpParticles(T,R.scene,phone3()?220:360,0.52,false,0.85,gpDeepBubbleTex(T));dp.bubT=0;
  // crowns of water that shoot up round the car on the way out and back in
  const ct=gpCanvasTex(128,128,(x,w,h)=>{x.clearRect(0,0,w,h);for(let i=0;i<64;i++){const px=i*2+((i*53)%7),t=0.35+((i*29)%10)/14;const g=x.createLinearGradient(0,h,0,h*(1-t));g.addColorStop(0,"rgba(255,255,255,.95)");g.addColorStop(0.75,"rgba(225,250,255,.7)");g.addColorStop(1,"rgba(225,250,255,0)");x.fillStyle=g;x.fillRect(px,h*(1-t),2.2,h*t);}},true);
  const cg=new T.CylinderGeometry(1,0.7,1,28,1,true);cg.translate(0,0.5,0);dp.crowns=[];for(let k=0;k<4;k++){const m=new T.MeshBasicMaterial({map:ct,transparent:true,depthWrite:false,side:T.DoubleSide,opacity:0});m.userData.lin=1;m.toneMapped=false;const c=new T.Mesh(cg,m);c.visible=false;c.frustumCulled=false;c.renderOrder=5;R.scene.add(c);dp.crowns.push({m:c,a:0,big:1});}
  const rt=gpCanvasTex(128,128,(x,w,h)=>{x.clearRect(0,0,w,h);x.strokeStyle="rgba(255,255,255,.9)";x.lineWidth=12;x.beginPath();x.arc(64,64,50,0,7);x.stroke();x.strokeStyle="rgba(255,255,255,.4)";x.lineWidth=5;x.beginPath();x.arc(64,64,36,0,7);x.stroke();});
  dp.foam=[];for(let k=0;k<4;k++){const m=new T.MeshBasicMaterial({map:rt,transparent:true,depthWrite:false,opacity:0,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});m.userData.lin=1;m.toneMapped=false;const f=new T.Mesh(new T.PlaneGeometry(1,1).rotateX(-Math.PI/2),m);f.position.y=dp.y+0.05;f.visible=false;f.frustumCulled=false;R.scene.add(f);dp.foam.push({m:f,a:0,big:1});}
  dp.crownN=0;dp.hemi=null;R.scene.traverse(o=>{if(o.isHemisphereLight)dp.hemi=o;});
  const E0=GP_DEEP.env;dp.A={fog:R.scene.fog.color.clone(),near:R.scene.fog.near,far:R.scene.fog.far,top:R.sky.material.uniforms.top.value.clone(),mid:R.sky.material.uniforms.mid.value.clone(),hor:R.sky.material.uniforms.hor.value.clone(),sun:R.sun.intensity,hemi:dp.hemi?dp.hemi.intensity:1,hs:dp.hemi?dp.hemi.color.clone():null,hg:dp.hemi?dp.hemi.groundColor.clone():null,sunC:R.sun.color.clone()};
  dp.B={fog:new T.Color(E0.fog),near:E0.near,far:E0.far,top:new T.Color(E0.top),mid:new T.Color(E0.mid),hor:new T.Color(E0.hor),sun:E0.sun,hemi:E0.hemi,hs:gpLin(E0.hemiSky),hg:gpLin(E0.hemiGnd),sunC:gpLin("#c8f4ff")};
  if(dp.Ca)dp.Ca.U.y.value=dp.y;
  R.karts.forEach(k=>{k.wet=false;k.wetY=null;});
  // first use of the splash + animal materials would stutter: compile them now
  try{const hid=[];dp.animals.forEach(A=>{A.mesh.visible=true;hid.push(A.mesh);});dp.crowns.concat(dp.foam).forEach(c=>{c.m.visible=true;hid.push(c.m);});R.renderer.compile(R.scene,R.camera);hid.forEach(m=>{m.visible=false;});}catch(e){}}
function phone3(){return Math.min(window.screen.width||999,window.screen.height||999,Math.max(innerWidth,innerHeight))<600||Math.min(innerWidth,innerHeight)<520;}
function gpDeepBubbleTex(T){return gpCanvasTex(64,64,(x,w,h)=>{x.clearRect(0,0,w,h);x.strokeStyle="rgba(255,255,255,.95)";x.lineWidth=4;x.beginPath();x.arc(32,32,24,0,7);x.stroke();x.fillStyle="rgba(255,255,255,.14)";x.beginPath();x.arc(32,32,24,0,7);x.fill();x.fillStyle="rgba(255,255,255,.95)";x.beginPath();x.arc(23,22,6,0,7);x.fill();});}
/* car breaks the water: a crown, a foam ring, a lot of drops, and a wash over the lens if the camera goes through too */
function gpDeepSplash(kt,dir,power){const R=R3,dp=R.dp,sp=dp.spl,V=kt.pos,tn=R.curve.getTangentAt(kt.t),big=Math.max(0.55,Math.min(1.5,power)),near=kt.player||kt.pos.distanceToSquared(R.camPos)<14400;if(!near)return;
  const n=Math.round((kt.player?120:46)*big);for(let q=0;q<n;q++){const a=Math.random()*6.283,r=(0.8+Math.random()*2.2)*big,vr=(3+Math.random()*7.5)*big,up=(5.5+Math.random()*11)*big;sp.emit(V.x+Math.cos(a)*r,dp.y+0.1,V.z+Math.sin(a)*r,Math.cos(a)*vr+tn.x*kt.speed*0.3,up,Math.sin(a)*vr+tn.z*kt.speed*0.3,0.92,0.98,1,0.75+Math.random()*0.75);}
  const c=dp.crowns[dp.crownN%4],f=dp.foam[dp.crownN%4];dp.crownN++;c.a=1;c.big=dir>0?big*0.72:big;c.op=dir>0?0.6:1;c.x=V.x;c.z=V.z;c.vx=tn.x*kt.speed*0.2;c.vz=tn.z*kt.speed*0.2;c.m.visible=true;f.a=1;f.big=big;f.m.position.x=V.x;f.m.position.z=V.z;f.m.visible=true;
  if(dir<0&&dp.bub){for(let q=0;q<(kt.player?46:18);q++)dp.bub.emit(V.x+(Math.random()-0.5)*3,dp.y-0.5-Math.random()*2.5,V.z+(Math.random()-0.5)*3,tn.x*kt.speed*0.1+(Math.random()-0.5)*2,1.2+Math.random()*3,tn.z*kt.speed*0.1+(Math.random()-0.5)*2,0.9,0.98,1,1.3+Math.random()*1.3);}
  if(kt.player){GPA.play(dir>0?"splashout":"splashin",big);R.shake=Math.max(R.shake,0.2*big);if(dir>0)dp.stats.exits++;else dp.stats.entries++;dp.stats.log.push({ev:dir>0?"out":"in",t:+(R.simT||0).toFixed(2),kmh:Math.round(kt.speed*3.6),air:!!kt.air,vy:+(kt.vy||0).toFixed(1)});}}
function gpDeepWash(){const e=R3.dp.wash;if(!e)return;e.classList.remove("on");void e.offsetWidth;e.classList.add("on");}
/* everything that moves or decides, once a frame: animals, bumps, dodge rewards, the cue, splashes, bubbles */
function gpDeepUpdate(dt,waiting){const R=R3,dp=R.dp,me=R.me,T=R.T,S=dp.y;if(!dp.A)return;dp.t+=dt;if(R.online&&R.netGo)dp.t=(performance.now()-R.netGo)/1000+60;const tm=dp.t;dp.U.t.value=tm;dp.kelpT.value=tm;if(dp.Ca){dp.Ca.U.t.value=tm;}
  if(dp.chevT)dp.chevT.offset.y=(dp.chevT.offset.y-dt*1.4)%1;
  if(dp.fish)dp.fish.forEach(f=>{f.g.rotation.y+=f.v*dt;});
  // ---- cars and the water line ----
  R.karts.forEach(k=>{const was=k.wetY,y=k.y;k.wet=y<S-0.25;if(was!=null&&!waiting&&!k.jet){if(was<S&&y>=S&&(k.air||k.speed>6))gpDeepSplash(k,1,(gpNearJump(k)?1.25:0.58)*(0.65+Math.abs(k.speed)/70));else if(was>=S&&y<S&&(k.air||k.speed>6))gpDeepSplash(k,-1,(k.air?Math.min(1.5,0.6+Math.abs(k.vy||0)/13):0.6));}k.wetY=y;
    // drops fly off the wheels for the first moments out of the water, and bubbles stream from a car driving along the bottom
    if(k.air&&y>S&&k.airT<0.85&&(k.player||k.pos.distanceToSquared(me.pos)<3600)){const n=k.player?3:1;k.g.updateMatrixWorld(true);const V=R.tmpV,tn=R.curve.getTangentAt(k.t);for(let q=0;q<n;q++){V.set((Math.random()<0.5?-1:1)*(k.tyreX||k.S.w/2),0.2,(Math.random()<0.5?1:-1)*(k.xr||1.3));k.g.localToWorld(V);dp.drop.emit(V.x-tn.x*1.6,V.y,V.z-tn.z*1.6,tn.x*k.speed*0.45+(Math.random()-0.5)*4,0.5+Math.random()*4,tn.z*k.speed*0.45+(Math.random()-0.5)*4,0.92,0.98,1,0.45+Math.random()*0.5);}}
    else if(k.wet&&!waiting&&k.speed>10&&(k.player||k.pos.distanceToSquared(me.pos)<2500)&&Math.random()<(k.player?0.28:0.12)){const V=R.tmpV,tn=R.curve.getTangentAt(k.t);k.g.updateMatrixWorld(true);V.set((Math.random()-0.5)*k.S.w,0.35,-(k.S.len||4)*0.5);k.g.localToWorld(V);dp.bub.emit(V.x,V.y,V.z,tn.x*k.speed*0.45,0.7+Math.random()*1.4,tn.z*k.speed*0.45,0.9,0.98,1,0.9+Math.random()*0.7);}});
  // ---- bubbles and little drifting motes around the camera ----
  if(R.camPos.y<S){dp.bubT+=dt*42;while(dp.bubT>=1){dp.bubT-=1;const a=Math.random()*6.283,r=4+Math.random()*44,tn=R.curve.getTangentAt(me.t),ah=Math.random()*38;dp.bub.emit(R.camPos.x+Math.cos(a)*r+tn.x*ah,R.camPos.y-7+Math.random()*12,R.camPos.z+Math.sin(a)*r+tn.z*ah,(Math.random()-0.5)*0.5,1.1+Math.random()*1.4,(Math.random()-0.5)*0.5,0.9,0.98,1,2.6+Math.random()*2);}}
  dp.bub.update(dt,-0.6);dp.drop.update(dt,9.5);
  for(const c of dp.crowns){if(c.a<=0)continue;c.a=Math.max(0,c.a-dt/0.82);const u=1-c.a,rise=Math.sin(Math.min(1,u*1.25)*Math.PI),rad=(2.6+u*6.6)*c.big,hgt=Math.max(0.1,(9.2*rise+0.2)*c.big);c.x+=c.vx*dt;c.z+=c.vz*dt;c.m.position.set(c.x,S-0.12,c.z);c.m.scale.set(rad,hgt,rad);{const dc=Math.hypot(c.x-R.camPos.x,c.z-R.camPos.z);c.m.material.opacity=(c.op||1)*Math.min(1,c.a*1.9)*Math.max(0,Math.min(1,(dc-rad-1)/7));}if(c.a<=0)c.m.visible=false;}
  for(const f of dp.foam){if(f.a<=0)continue;f.a=Math.max(0,f.a-dt/1.7);const u=1-f.a,s=(5+u*20)*f.big;f.m.scale.set(s,1,s);f.m.material.opacity=f.a*0.85;if(f.a<=0)f.m.visible=false;}
  // ---- the animals ----
  const XS=R.W-1.2,P0=dp.pA,P1=dp.pB,camP=me.pos,len=R.len,D=R.dummy,SH=dp.shad;let sn=0;
  for(const A of dp.animals){const K=GP_DEEP.kinds[A.kind],cd=A.E.c*len;const p=gpDeepPath(A,tm),q=gpDeepPath(A,tm+0.08);const dn=cd+p.d,xn=p.x;gpDeepAt(R,dn,xn,P0);gpDeepAt(R,cd+q.d,q.x,P1);A.dNow=dn;A.x=xn;A.hNow=p.h;
    const dx=P1.x-P0.x,dz=P1.z-P0.z,mv=Math.hypot(dx,dz);if(mv>0.008){const want=Math.atan2(dx,dz);if(A.yaw==null)A.yaw=want;let e=gpWrapAng(want-A.yaw);A.yaw=gpWrapAng(A.yaw+e*Math.min(1,dt*(A.kind==="whale"?1.5:2.4)));}else if(A.yaw==null)A.yaw=Math.atan2(P0.tx,P0.tz);
    const roadYaw=Math.atan2(P0.tx,P0.tz);if(A.kind==="octo")A.yaw=roadYaw+Math.PI;A.relYaw=gpWrapAng(A.yaw-roadYaw);   // the octopus always looks at the drivers coming
    const far=(P0.x-camP.x)*(P0.x-camP.x)+(P0.z-camP.z)*(P0.z-camP.z);const vis=far<102400;if(A.mesh.visible!==vis)A.mesh.visible=vis;
    if(A.hitT>0){A.hitT=Math.max(0,A.hitT-dt);A.U.hit.value=A.hitT;}
    if(vis){const y=P0.y+K.y+p.h;A.mesh.position.set(P0.x,y,P0.z);A.mesh.rotation.set(0,A.yaw,(A.hitT>0?Math.sin(A.hitT*10)*0.2:0)+(A.kind==="manta"?Math.max(-0.45,Math.min(0.45,gpWrapAng(A.relYaw)*0.3)):0));
      // its shadow on the road: the honest answer to "where is it?" from far away
      const w=A.kind==="whale"?6.5:(A.kind==="manta"?8.5:(A.kind==="octo"?7:(A.kind==="turtle"?3.6:3.2))),l=A.kind==="whale"?19:(A.kind==="manta"?5.5:(A.kind==="octo"?7:(A.kind==="turtle"?5:9)));D.position.set(P0.x,P0.y+0.1,P0.z);D.rotation.set(0,A.yaw,0);D.scale.set(w*(K.s||1),1,l*(K.s||1));D.updateMatrix();SH.setMatrixAt(sn++,D.matrix);}
    if(A.E.ring&&A.kind==="octo"){const r=A.E.ring;if(vis&&p.soon&&p.next!=null){gpDeepAt(R,dn,p.next,P1);r.position.set(P1.x,P1.y+0.12,P1.z);const pu=0.82+0.28*Math.sin(tm*11);r.scale.set(pu,1,pu);r.visible=true;}else r.visible=false;}
    if(waiting||R.done)continue;
    // ---- contact: an ellipse on the road's own frame, a little smaller than the picture (fair to the driver) ----
    const fairK=dp.easy?0.8:0.92,a=K.a*fairK,b=K.b*fairK,cy=Math.cos(A.relYaw),sy=Math.sin(A.relYaw);
    for(const k of R.karts){if(k.net||k.jet||(k.dpSafe||0)>0)continue;let dd=k.t*len-dn;if(dd>len/2)dd-=len;else if(dd<-len/2)dd+=len;if(Math.abs(dd)>26)continue;const lat=(k.x-xn)*XS,al=dd*cy+lat*sy,ac=-dd*sy+lat*cy,top=K.top+p.h;if(k.air&&k.y-(k.ry||0)>top)continue;
      const aa=a+(k.S.len||4.4)*0.42,bb=b+(k.S.w||2)*0.42;if((al*al)/(aa*aa)+(ac*ac)/(bb*bb)<1)gpDeepBump(k,A,lat,dd);}
  }
  SH.count=sn;SH.instanceMatrix.needsUpdate=true;
  R.karts.forEach(k=>{if(k.dpSafe>0)k.dpSafe-=dt;if(k.dpSlow>0)k.dpSlow-=dt;});
  if(!waiting&&!R.done)gpDeepCue(dt,tm);}
/* bump: a shove, a slowdown, a shower of bubbles, a friendly word. No spin, no stop, no game over. A moment of safety after it so a child cannot get stuck on an animal */
function gpDeepBump(k,A,lat,dd){const R=R3,dp=R.dp,H=GP_DEEP.hit,K=GP_DEEP.kinds[A.kind],pl=k.player;k.dpSafe=pl?H.safe:2.2;A.hitT=0.9;k.dpSlow=pl?H.slowS:1.2;k.dpSlowK=pl?(dp.easy?H.slowE:H.slowN):0.82;   // the top speed stays down for a moment: a bump costs real time, so dodging is worth it
  const keep=pl?(dp.easy?H.gentle:H.normal):0.78;const v0=k.speed;k.speed=Math.max(Math.min(v0,k.max*H.floor),k.speed*keep);
  const side=(Math.abs(lat)>0.6?Math.sign(lat):(k.x>0?-1:1));if(pl){k.sv=Math.max(-0.6,Math.min(0.6,(k.sv||0)+side*0.32));k.wobT=Math.max(k.wobT||0,0.65);R.shake=Math.max(R.shake,0.4);k.drift=0;k.loss=null;k.lossA=0;gpChainBreak();GPA.play("boing");gpMsg("Boop! "+(A.kind==="turtle"?"Sorry, turtle!":"Sorry, "+K.n.toLowerCase()+"!"));dp.stats.hits++;A.E.hits[Math.floor(k.lap)]=1;dp.stats.log.push({ev:"bump",kind:A.kind,t:+(R.simT||0).toFixed(2),from:Math.round(v0*3.6),to:Math.round(k.speed*3.6),x:+k.x.toFixed(2)});}
  else{k.bv=(k.bv||0)+side*0.35;}
  if(k.player||k.pos.distanceToSquared(R.camPos)<6400){const V=k.pos;for(let q=0;q<(pl?60:20);q++)dp.bub.emit(V.x+(Math.random()-0.5)*3.2,V.y+0.6+Math.random()*1.6,V.z+(Math.random()-0.5)*3.2,(Math.random()-0.5)*5,1.5+Math.random()*4,(Math.random()-0.5)*5,0.9,0.98,1,0.9+Math.random()*0.9);}}
/* where would each animal be when I get there? The safer side, for the cue and for the rivals */
function gpDeepBest(k,E,tm){const R=R3,len=R.len,XS=R.W-1.2,K=GP_DEEP.kinds[E.kind],v=Math.max(14,k.speed||14),cd=E.c*len,kd=k.t*len,L=[];let first=1e9;
  for(const A of E.list){const p0=gpDeepPath(A,tm);let g=cd+p0.d-kd;if(g<-len/2)g+=len;if(g>len/2)g-=len;if(g<-K.a-3)continue;L.push([A,g]);first=Math.min(first,g);}
  let gap=cd-kd;if(gap<-len/2)gap+=len;if(gap>len/2)gap-=len;if(!L.length)return{x:k.x,gap};
  const cand=[-0.95,-0.7,-0.45,-0.2,0.05,0.3,0.55,0.8,0.95];let best=k.x,bs=-1e9;for(const c of cand){let clr=1e9;for(const q of L){const A=q[0];if(q[1]>first+70)continue;const arr=Math.max(0,q[1])/v,p=gpDeepPath(A,tm+arr),n=gpDeepPath(A,tm+arr+0.1),ang=Math.atan2((n.x-p.x)*XS,(n.d-p.d)||1e-3),half=Math.abs(Math.sin(ang))*K.a+Math.abs(Math.cos(ang))*K.b;clr=Math.min(clr,Math.abs(c-p.x)*XS-half);}const s=Math.min(clr,4.5)-Math.abs(c-k.x)*1.1;if(s>bs){bs=s;best=c;}}return{x:best,gap};}
function gpDeepCue(dt,tm){const R=R3,dp=R.dp,me=R.me,len=R.len;let E0=null,g0=1e9;for(const E of dp.meets){const K=GP_DEEP.kinds[E.kind];let g=E.c*len-me.t*len;if(g<-len/2)g+=len;if(g>len/2)g-=len;if(g>-K.span&&g<g0&&g<250){g0=g;E0=E;}
    // past it without a bump: well done + a little nitro
    const lap=Math.floor(me.lap);if(me.started&&g<-K.span&&g>-K.span-60&&!E.paid[lap]){E.paid[lap]=1;if(!E.hits[lap]&&me.speed>12&&R.mode==="race"){gpSkill("Dodged "+GP_DEEP.kinds[E.kind].say,320,true);if(R.boost)R.boost.q=Math.min(1,R.boost.q+GP_DEEP.pay);gpMsg("Nice dodge! +nitro");GPA.play("skill");dp.stats.dodges++;}}}
  dp.cueT=(dp.cueT||0)-dt;const e=dp.cue;if(!e)return;if(!E0){if(dp.cueTxt){dp.cueTxt="";e.classList.remove("on");}return;}
  if(dp.cueT<=0||dp.cueE!==E0){dp.cueT=0.18;dp.cueE=E0;const B=gpDeepBest(me,E0,tm),K=GP_DEEP.kinds[E0.kind],arrow=Math.abs(B.x-me.x)<0.2?"⬆":(B.x<me.x?"⬅":"➡");dp.hintX=B.x;const t=K.e+" "+K.n+" "+arrow;if(t!==dp.cueTxt){dp.cueTxt=t;e.innerHTML='<i>'+K.e+'</i><b>'+K.n+'</b><em>'+arrow+'</em>';e.classList.add("on");}}}
/* rivals see the animals as well: they drift to the safe side in good time */
function gpDeepRival(kt,target){const R=R3,dp=R.dp;if(!dp||!dp.meets)return target;const len=R.len;for(const E of dp.meets){let g=E.c*len-kt.t*len;if(g<-len/2)g+=len;if(g>len/2)g-=len;const K=GP_DEEP.kinds[E.kind];if(g>-K.span&&g<K.span+70)return gpDeepBest(kt,E,dp.t).x;}return target;}
/* the view: above or below the surface. Fog, sky, lights, rays, the wash on the lens */
function gpDeepRender(dt){const R=R3,dp=R.dp,S=dp.y;if(!dp.A)return;const cam=R.camera.position,want=cam.y<S?1:0;if(dp.k<0){dp.k=want;dp.kw=want;}if(want!==dp.kw){dp.kw=want;gpDeepWash();const w=$("gp3");if(w)w.classList.toggle("deepw",!!want);}dp.k+=(want-dp.k)*Math.min(1,dt*14);const k=dp.k,A=dp.A,B=dp.B,F=R.scene.fog;
  if(Math.abs((dp.k0==null?-1:dp.k0)-k)>0.002){dp.k0=k;F.color.copy(A.fog).lerp(B.fog,k);F.near=A.near+(B.near-A.near)*k;F.far=A.far+(B.far-A.far)*k;const su=R.sky.material.uniforms;su.top.value.copy(A.top).lerp(B.top,k);su.mid.value.copy(A.mid).lerp(B.mid,k);su.hor.value.copy(A.hor).lerp(B.hor,k);R.sun.intensity=A.sun+(B.sun-A.sun)*k;R.sun.color.copy(A.sunC).lerp(B.sunC,k);if(dp.hemi){dp.hemi.intensity=A.hemi+(B.hemi-A.hemi)*k;dp.hemi.color.copy(A.hs).lerp(B.hs,k);dp.hemi.groundColor.copy(A.hg).lerp(B.hg,k);}if(R.glare)R.glare.visible=k<0.5;if(R.scene.environment&&!dp.envSeen)dp.envSeen=1;GPA.under=k;}
  dp.top.position.x=cam.x;dp.top.position.z=cam.z;dp.bot.position.x=cam.x;dp.bot.position.z=cam.z;{const a=dp.t;dp.topT.offset.set(cam.x*60/5200+a*0.012,-cam.z*60/5200+a*0.007);dp.botT.offset.set(cam.x*24/1500+a*0.008,-cam.z*24/1500-a*0.011);}   // the sheets follow the camera: the pattern must stay put in the worlddp.top.visible=k<0.5;dp.bot.visible=k>=0.5;
  // an animal the lens is passing through is simply not drawn that frame: never a screen full of turtle
  for(const A of dp.animals){if(!A.mesh.visible)continue;const K=GP_DEEP.kinds[A.kind],q=A.mesh.position,dx=cam.x-q.x,dz=cam.z-q.z,cy=Math.cos(A.yaw),sy=Math.sin(A.yaw),al=dx*sy+dz*cy,ac=dx*cy-dz*sy,ra=K.a+2.5,rb=K.b+2.5;if((al*al)/(ra*ra)+(ac*ac)/(rb*rb)<1&&Math.abs(cam.y-q.y)<K.top+2)A.mesh.visible=false;}
  const RY=dp.rays;RY.im.visible=k>0.5;if(RY.im.visible){const D=R.dummy,tm=dp.t,W0=170;for(let i=0;i<RY.L.length;i++){const q=RY.L[i],px=cam.x+(((q.x-cam.x+W0/2)%W0+W0)%W0)-W0/2,pz=cam.z+(((q.z-cam.z+W0/2)%W0+W0)%W0)-W0/2;const dc=Math.hypot(px-cam.x,pz-cam.z),nr=Math.min(1,Math.max(0,(dc-16)/22));D.position.set(px,S,pz);D.rotation.set(0,Math.atan2(cam.x-px,cam.z-pz),-0.28);const wob=0.82+0.28*Math.sin(tm*q.v+q.ph);D.scale.set(Math.max(0.001,q.w*wob*nr),q.h,1);D.updateMatrix();RY.im.setMatrixAt(i,D.matrix);}RY.im.instanceMatrix.needsUpdate=true;}}
/* off a leap ramp: out of the water, whatever the speed. The flight is worked out with the slow fall through the water at the end, and it never runs past the room before the next bend */
function gpDeepFlightT(L,v,vy,y0){const R=R3,M=R.M,S=R.samples,ds=R.len/M,i0=Math.round(L.t*M),W0=R.dp.y;let y=y0,V=vy,T=0;for(;T<4.5;T+=0.03){const wet=y<W0;V-=(wet?GP_G*0.46:GP_G)*0.03;if(wet)V*=Math.exp(-1.5*0.03);y+=V*0.03;if(y<=S[(i0+Math.round(v*T/ds))%M].pos.y)return T;}return T;}
function gpDeepLeap(kt,L,ry){kt.speed=Math.max(kt.speed,Math.min(kt.max*0.82,kt.speed+16));const v=kt.speed,tMax=Math.max(1.1,(L.room-6)/Math.max(10,v));let vy=Math.max(8.5,Math.min(14,L.slope*v));for(let n=0;n<6&&gpDeepFlightT(L,v,vy,ry)>tMax;n++)vy*=0.88;
  const over=Math.max(0,((kt.t-L.t+1.5)%1-0.5)*R3.len);kt.air=true;kt.airT=0;kt.airPeak=0;kt.y=Math.max(ry,L.y+vy*over/Math.max(10,v));kt.vy=vy;kt.takeoff={v:Math.round(v*3.6),vy:+vy.toFixed(2),f:R3.frameN,kind:"leap"};kt.lipT=R3.simT||0;gpRivalTrick(kt,vy);if(kt.player)GPA.play("boost");{const dp=R3.dp,tn=R3.curve.getTangentAt(kt.t),n=kt.player?70:(kt.pos.distanceToSquared(R3.me.pos)<3600?24:0),W2=kt.S.w||2;for(let q=0;q<n;q++){const a=(Math.random()-0.5)*W2*1.9,b=3+Math.random()*7;dp.drop.emit(kt.pos.x-tn.z*a-tn.x*b,ry+0.3+Math.random()*1.3,kt.pos.z+tn.x*a-tn.z*b,tn.x*v*(0.35+Math.random()*0.25)-tn.z*a*2,vy*(0.25+Math.random()*0.6),tn.z*v*(0.35+Math.random()*0.25)+tn.x*a*2,0.92,0.98,1,0.55+Math.random()*0.6);}}return true;}
/* desert dunes: long wind-blown ridges (sharp crests, soft troughs) that ride on the land away from the road (gpBuild's groundAt) */
function gpSandy(C){return C.theme==="desert"||C.theme==="dakar";}
/* Dakar Desert: the open dune field away from the road - long wind-blown ridges (gentle windward side, sharp crest, steep slip face) with small dunes riding on them; 0..~21 m */
function gpDakarDune(x,z){const w=Math.sin(x*0.0031+z*0.0017)*1.9+Math.sin(z*0.0043-x*0.0012+1.7)*1.3,p=(x*0.82+z*0.57)/165+w*0.55,f=p-Math.floor(p),t=f/0.7,pr=f<0.7?(t*t*(3-2*t))*0.55+t*0.45:Math.pow(1-(f-0.7)/0.3,1.6);
  const amp=0.35+0.65*Math.max(0,Math.min(1,0.5+0.9*Math.sin(x*0.0057-z*0.0049+0.6)*Math.cos(z*0.0038+x*0.0021)));
  const p2=(x*0.55-z*0.83)/61+Math.sin(x*0.011)*0.8,f2=p2-Math.floor(p2),t2=f2/0.72,pr2=f2<0.72?t2:Math.pow(1-(f2-0.72)/0.28,1.4);return 19*amp*pr+2.4*pr2*(0.35+0.65*pr);}
function gpDune(C,x,z){const a=0.5+0.5*Math.sin(x*0.011+Math.sin(z*0.006)*2.2+z*0.004),b=0.5+0.5*Math.sin(x*0.005-z*0.009+1.3);return C.dunes*(Math.pow(a,2.4)+0.55*Math.pow(b,2));}
/* ---------- traffic: real-looking cars in lanes, recycled far ahead of the player (never right in front of him) ---------- */
function gpTrafficBuild(T,scene,src,C,karts,len,me,shared,opt){const kinds=C.traffic||[];if(!src||!kinds.length)return null;const XS=7.6-1.2;
  opt=opt||{moving:true,parked:[]};const parked=opt.parked||[],parkedOut=[];
  const types={};const lanes=C.lanes||[-0.55,0,0.55];
  const cars=[];kinds.forEach(([type,n0])=>{const n=opt.moving?n0:0,pk=parked.filter(q=>q.type===type),tot=n+pk.length;if(!tot)return;const root=src.getObjectByName(type);if(!root)return;root.updateMatrixWorld(true);
    const paint=[],glass=[],det=[],glow=[];root.traverse(o=>{if(!o.isMesh)return;const g=o.geometry.clone();g.applyMatrix4(o.matrixWorld);const mn=(o.material&&o.material.name)||"";
      if(mn==="paint")paint.push({g});else if(mn==="glass")glass.push({g});else if(mn==="lamp"||mn==="tail"||mn==="sign")glow.push({g,c:mn==="tail"?{r:0.95,g:0.05,b:0.04}:(mn==="sign"?{r:1,g:0.75,b:0.1}:{r:1,g:0.97,b:0.88})});else det.push({g,c:o.material.color});});
    const mk=(parts,mat,cast)=>{if(!parts.length)return null;const im=new T.InstancedMesh(gpMerge(T,parts),mat,tot);im.userData.mirror=1;im.castShadow=cast;im.receiveShadow=false;im.frustumCulled=false;scene.add(im);return im;};
    const pm=new T.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:0.32,metalness:0.15,envMapIntensity:0.7});pm.userData.lin=1;if(gpReal()){pm.roughness=0.3;pm.metalness=0.1;pm.envMapIntensity=1.0;pm.userData.cenv=2;}   // vertex colour = the Blender-baked light (1 where a model has none)
    const gm=new T.MeshStandardMaterial({color:gpLin("#1a2430"),roughness:0.06,metalness:0.6,envMapIntensity:1.4});gm.userData.lin=1;if(gpReal()){gm.color.copy(gpLin(GP_REAL.glass.c));gm.metalness=0.3;gm.roughness=0.04;gm.envMapIntensity=1.6;gm.userData.cenv=2;}
    const dm=new T.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:0.6,metalness:0.1});dm.userData.lin=1;
    const lm=new T.MeshBasicMaterial({color:0xffffff,vertexColors:true});lm.userData.lin=1;lm.toneMapped=false;
    const ty={paint:mk(paint,pm,true),glass:mk(glass,gm,false),det:mk(det,dm,false),glow:mk(glow,lm,false),n:0};types[type]=ty;
    const D=GP_TRAFFIC_DIM[type]||GP_TRAFFIC_DIM.sedan,pal=GP_TRAFFIC_PAINT[type]||["#cccccc"];
    for(let q=0;q<n;q++){const c={traffic:true,type,ty,k:ty.n++,t:0,x:0,lane:0,speed:0,cruise:0,S:{w:D.w,len:D.len},mass:D.mass,yawRel:0,bv:0,pos:new T.Vector3(),off:false,lap:0,started:true,col:pal[(q*3+cars.length)%pal.length]};
      if(ty.paint)ty.paint.setColorAt(c.k,gpLin(c.col));cars.push(c);}
    const D0=new T.Object3D();pk.forEach(q=>{const k=ty.n++;D0.position.set(q.x,q.y,q.z);D0.rotation.set(0,q.yaw,0);D0.updateMatrix();["paint","glass","det","glow"].forEach(f=>{if(ty[f])ty[f].setMatrixAt(k,D0.matrix);});
      if(ty.paint)ty.paint.setColorAt(k,gpLin(pal[(q.col*2+1)%pal.length]));parkedOut.push(Object.assign({w:D.w,len:D.len},q));});
    if(ty.paint&&ty.paint.instanceColor)ty.paint.instanceColor.needsUpdate=true;});
  // soft contact shadows under every traffic car (one instanced draw)
  const blob=new T.InstancedMesh(new T.PlaneGeometry(1,1).rotateX(-Math.PI/2),new T.MeshBasicMaterial({map:shared.ao||shared.blob||gpAoTex(),color:0x000000,transparent:true,opacity:0.75,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}),cars.length+parkedOut.length);blob.userData.mirror=1;blob.material.userData.lin=1;blob.frustumCulled=false;scene.add(blob);
  {const D0=new T.Object3D();parkedOut.forEach((q,j)=>{D0.position.set(q.x,q.y+0.03,q.z);D0.rotation.set(0,q.yaw,0);D0.scale.set(q.w*1.25,1,q.len*1.1);D0.updateMatrix();blob.setMatrixAt(cars.length+j,D0.matrix);});}
  const TR={cars,types,blob,lanes,len,XS,dummy:new T.Object3D(),tv:new T.Vector3(),respawns:0,minSpawnAhead:1e9,parked:parkedOut};
  // initial spread round the lap, but nothing on the grid or the first 140 m ahead of it
  const n=cars.length,ord=cars.slice();if(C.theme==="accra")["ghtaxi","trotro"].forEach(ty=>{const j=ord.findIndex(c=>c.type===ty);if(j>0)ord.unshift(ord.splice(j,1)[0]);});   // Accra: the first car up the road is a trotro, then a taxi
  ord.forEach((c,q)=>{const free=len-200,d=(140+free*(q+0.5)/n+(Math.random()-0.5)*20);c.t=((me.t*len+d)/len)%1;c.lane=lanes[q%lanes.length];c.x=c.lane;c.cruise=(0.36+((q*7)%5)*0.045)*me.max;c.speed=c.cruise;});
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
  TR.cars.forEach((c,q)=>{const p=R3.curve.getPointAt(c.t),tn=R3.curve.getTangentAt(c.t);const l=Math.hypot(tn.x,tn.z)||1,nx=-tn.z/l,nz=tn.x/l;p.x+=nx*c.x*XS;p.z+=nz*c.x*XS;
    // sit on the road under the front and rear wheels (the chord), so a long bus over a crest or dip keeps all its wheels on the tarmac
    const hl=c.S.len*0.36,yf=R3.curve.getPointAt(((c.t+hl/TR.len)%1+1)%1).y,yr=R3.curve.getPointAt(((c.t-hl/TR.len)%1+1)%1).y;p.y=(yf+yr)/2;c.pos.copy(p);
    D.position.copy(p);D.rotation.order="YXZ";D.rotation.set(-Math.atan2(yf-yr,2*hl),Math.atan2(tn.x,tn.z)+c.yawRel,0);D.scale.set(1,1,1);D.updateMatrix();const ty=c.ty;["paint","glass","det","glow"].forEach(k=>{if(ty[k])ty[k].setMatrixAt(c.k,D.matrix);});dirty.add(ty);
    D.position.y+=0.03;D.scale.set(c.S.w*1.25,1,c.S.len*1.1);D.updateMatrix();TR.blob.setMatrixAt(q,D.matrix);});
  dirty.forEach(ty=>["paint","glass","det","glow"].forEach(k=>{if(ty[k])ty[k].instanceMatrix.needsUpdate=true;}));TR.blob.instanceMatrix.needsUpdate=true;}

/* ---------- the race ---------- */
async function startRace3D(cid){
  clearTimers();closeOverlay();showAnanseCorner(false);gpStop();
  GPA.init(); // inside the tap on a route card, which is what iOS needs to allow sound
  const C0=GP_CIRCUITS.find(c=>c.id===cid)||GP_CIRCUITS[0],C=Object.assign({},C0,{laps:gpLaps()});   // laps come from Options (1-3)
  app.innerHTML='<div class="fadein center" id="gpnLoad" style="padding-top:20vh"><div class="ananse-wrap">'+ananseSVG(100,"idle")+'</div><h2 style="color:#fff">'+({city:"Heading downtown…",accra:"Akwaaba! Heading to Accra…",coast:"Heading to the coast…",desert:"Heading into the desert…",dakar:"Heading to the Dakar dunes…",inaka:"Heading to the Japanese countryside…",deep:"Diving into the deep…"}[C.theme]||"Heading to Japan…")+'</h2><p class="muted" style="color:#ffd2e6">Loading '+esc(C.name)+'…</p></div>';
  const fb=()=>startRace2D(cid==="kawaguchi"?"accra":(cid==="tokyo"?"nebula":"skybridge"));
  const intro=(GPN&&GPN.race)?null:gpIntro(false);   // started inside the tap so iOS lets it play with sound
  try{await loadThree();}catch(e){document.querySelectorAll(".fz-intro").forEach(e=>e.remove());if(GPN&&GPN.race){renderOnline("The 3D game couldn't load on this device. Check the Wi-Fi and try again.");return;}toast("3D engine could not load — using the classic racer");fb();return;}
  // car pictures load lazily here (a slow network never holds the race more than a few seconds: cars without a picture use the 3D model)
  if(!gpStory()){try{await Promise.race([Promise.all([gpLoadPics(gpRacePicIds(C.id).filter(id=>!GP_GLB[id])),gpLoadGlb(gpRacePicIds(C.id)),gpLoadWorld(),C.traffic&&C.theme&&(gpTrafficOn()||C.theme==="accra")?gpLoadTraffic():null]),new Promise(r=>setTimeout(r,7000))]);}catch(e){}}
  await intro;
  if(!app.querySelector("h2")||(GPN&&GPN.race&&!$("gpnLoad")))return;   // the player left while the intro was playing
  try{gpBuild(C);}catch(e){console.error(e);gpStop();if(GPN&&GPN.race){renderOnline("The 3D game hit a problem on this device.");return;}toast("3D racer hit a problem — using the classic racer");fb();}
}
function gpBuild(C){
  gpCss();gpFzCss();
  const myCar=gpCar(),myPaint=gpPaint(),story=gpStory(),L=story?Object.assign({},C.look,C.story):C.look;
  if(P&&typeof P.gpMute==="boolean")GPA.muted=P.gpMute;GPA.setMute(GPA.muted);
  app.innerHTML='<div class="fadein gp3-wrap v3'+(story?" story":" fzh")+(GPN&&GPN.race?" net":"")+'" id="gp3">'
   +'<canvas id="gp3c"></canvas><canvas class="fz-fx" id="gp3Fx" width="16" height="9"></canvas><div class="fz-vig"></div><canvas class="fz-ck" id="gp3Ck" width="16" height="9"></canvas>'
   +'<div class="gp3-touch" id="gp3L"></div>'
   +'<div class="fz-tl"><div class="fz-pos" id="gp3Pos"'+(gpMode()==="free"?' style="display:none"':'')+'>5<small>th</small><em>/5</em></div><div class="fz-lap" id="gp3Lap">LAP 1/'+C.laps+'</div><div class="fz-time" id="gp3Time">0:00.0</div>'+(GPN&&GPN.race?'<div class="fz-spd" id="gp3Spd"></div>':'')+'<div class="fz-song" id="gp3Song"'+(gpMode()==="free"?'':' style="display:none"')+'></div></div>'
   +'<canvas class="gp3-map" id="gp3Map" width="300" height="220"></canvas>'
   +'<div class="fz-skill" id="gp3Skill"></div>'
   +'<canvas class="fz-tach" id="gp3Tach" width="320" height="320"></canvas>'
   +'<button class="fz-btn mute" id="gp3Mute" aria-label="Sound on or off">'+(GPA.muted?"🔇":"🔊")+'</button>'
   +'<button class="fz-btn quit" id="gp3Quit" aria-label="Quit race" onclick="renderCircuits()">✕</button><button class="fz-cam" id="gp3Cam" aria-label="Change camera view"><i>🎥</i><b id="gp3CamL">CHASE</b></button>'
   +'<div class="gp3-msg" id="gp3Msg"></div><div class="gp3-last" id="gp3Last" aria-live="polite">LAST LAP</div>'
   +'<div class="gp3-card" id="gp3Card"><b>'+esc(C.name)+'</b><small>'+(gpMode()==="free"?"Free drive · ":"Race · ")+esc(L.time)+' · '+esc(myCar.n)+'</small></div>'
   +'<div class="gp3-count" id="gp3Count"></div>'
   +'<div class="fz-cue" id="gp3Cue"><b>TOO FAST!</b></div><div class="fz-air" id="gp3Air"></div><div class="fz-deepcue" id="gp3Deep"></div><div class="fz-wash" id="gp3Wash"></div><div class="fz-nitro" id="gp3Nitro"></div>'
   +'<div class="gp3-pad l"><span class="race-btn" id="rcL" aria-hidden="true">◀</span><span class="race-btn" id="rcR" aria-hidden="true">▶</span></div>'
   +'<button class="fz-boost" id="gp3Boost" aria-label="Boost"><svg viewBox="0 0 100 100"><circle class="bg" cx="50" cy="50" r="44"/><circle class="rg" id="gp3BoostRing" cx="50" cy="50" r="44" stroke-dasharray="276.5" stroke-dashoffset="138"/></svg><span class="core"><b>BOOST</b><small id="gp3BoostN">●</small></span></button>'
   +'<button class="fz-trick" id="gp3Trick" aria-label="Do a trick"><i>★</i><b>TRICK</b></button>'
   +'<div class="fz-jhud" id="gp3Jet"><span class="fz-jl">JET</span><span class="fz-fuel"><i id="gp3FuelFill"></i></span><span class="fz-jr"><em>◯</em><b id="gp3JetRings">0 / 0</b></span><span class="fz-ja" id="gp3JetAir"></span></div><div class="fz-jback" id="gp3Back"></div>'
   +'<div class="fz-fly" id="gp3Fly" role="group" aria-label="Flight controls: up, down, left, right"><div class="rim"><i class="arm u"></i><i class="arm r"></i><i class="arm d"></i><i class="arm l"></i></div><em class="u" aria-hidden="true"><i>▲</i><b>UP</b></em><em class="d" aria-hidden="true"><b>DOWN</b><i>▼</i></em><em class="l" aria-hidden="true"><i>◀</i></em><em class="r" aria-hidden="true"><i>▶</i></em><button class="fz-flyt" id="gp3FlyT" aria-label="Do a trick"><i>★</i><b>TRICK</b></button></div>'
   +'<div class="gp3-pad r"><button class="fz-pedal brake" id="rcB" aria-label="Brake pedal"><i></i><b>BRAKE</b></button><button class="fz-pedal gas'+(gpAuto()?" auto":"")+'" id="rcG" aria-label="Gas pedal"><i></i><b>'+(gpAuto()?"AUTO":"GAS")+'</b></button></div>'
   +'</div>'
   +'<div class="center fz-quit-row"><button class="readbtn" onclick="renderCircuits()">⟵ Quit race</button></div>';
  if(GPN&&GPN.race){const w3=$("gp3"),pl=document.createElement("div");pl.className="gp3-plate";pl.id="gp3Plate";pl.append(w3.querySelector(".gp3-pad.l"),$("gp3Boost"),w3.querySelector(".gp3-pad.r"));w3.appendChild(pl);}   // online on a phone: the controls live on their own plate (CSS decides where; on a big screen it changes nothing)
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
  const RALLY=C.theme==="dakar";let DK=null;const TH=C.theme||null,street=TH==="city"||TH==="accra"||TH==="deep";   // Coral Deep has no run-off, tyre walls or race flags either
  const bandOn=!TH&&!!WD[SKYK],mulHex=(hex,c)=>new T.Color(hex).multiply(c);
  const hazeHex=bandOn?"#"+mulHex(SKY.haze,TINT).getHexString():L.haze;
  const hazeCol=story?gpLin(L.paper):gpLin(hazeHex);scene.fog=story?new T.Fog(hazeCol,140,820):new T.Fog(hazeCol,C.fog?C.fog[0]:(bandOn?150:160),C.fog?C.fog[1]:(bandOn?1000:1150));   // desert: a light sandstorm haze closes in sooner
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
  const fzSky=(!story&&!bandOn&&!C.deep)?gpFzSky(T,renderer,L,sunDir,C):null;const sky=new T.Mesh(new T.SphereGeometry(2600,32,16),fzSky?fzSky.mat:skyMat);sky.renderOrder=-2;sky.frustumCulled=false;scene.add(sky);
  // ---- photo horizon: a camera-following cylinder band with Mount Fuji centred on the start straight ----
  let band=null;if(bandOn){const SK=SKY,bh=SK.h*SK.mpp;const bm=new T.MeshBasicMaterial({map:WD[SKYK],transparent:false,blending:T.CustomBlending,blendSrc:T.SrcAlphaFactor,blendDst:T.OneMinusSrcAlphaFactor,blendEquation:T.AddEquation,depthWrite:false,depthTest:false,fog:false,side:T.BackSide,color:TINT.clone()});bm.toneMapped=false;bm.userData.lin=1;   // opaque pass (drawn right after the sky dome), alpha-blended edges
    band=new T.Mesh(new T.CylinderGeometry(SK.r,SK.r,bh,72,1,true),bm);band.renderOrder=-1;band.frustumCulled=false;band.userData.y=SK.horY+(0.5-(1-SK.hor))*bh;band.position.y=band.userData.y;scene.add(band);}
  // ---- reflections for paint and glass: a small painted panorama → PMREM environment ----
  let envRT=null;if(!story){try{const pm=new T.PMREMGenerator(renderer);const gh0="#"+C.grass.toString(16).padStart(6,"0");
    const eq=gpCanvasTex(256,128,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,L.top);g.addColorStop(0.42,L.mid);g.addColorStop(0.5,L.hor);g.addColorStop(0.52,gh0);g.addColorStop(1,"#2a3a22");x.fillStyle=g;x.fillRect(0,0,w,h);
      const sx=((Math.atan2(sunDir.x,-sunDir.z)/(Math.PI*2))+0.5)*w,sy=(0.5-Math.asin(sunDir.y)/Math.PI)*h;const sg=x.createRadialGradient(sx,sy,0,sx,sy,26);sg.addColorStop(0,"rgba(255,250,235,1)");sg.addColorStop(0.3,"rgba(255,235,200,.8)");sg.addColorStop(1,"rgba(255,235,200,0)");x.fillStyle=sg;x.fillRect(0,0,w,h);
      x.fillStyle="rgba(255,255,255,.55)";for(let i=0;i<6;i++){x.fillRect(rnd()*w,h*0.3+rnd()*h*0.12,30+rnd()*50,6);}});
    eq.mapping=T.EquirectangularReflectionMapping;envRT=pm.fromEquirectangular(eq);pm.dispose();eq.dispose();if(envRT&&envRT.texture)scene.environment=envRT.texture;}catch(e){envRT=null;}}
  if(fzSky&&fzSky.env)scene.environment=fzSky.env.texture;   // paint, glass and the damp road reflect the real cloud sky
  // ---- terrain: rolling hills, optional mountains, a lake or bay, flat under the road ----
  let cx=0,cz=0;C.pts.forEach(p=>{cx+=p[0];cz+=p[1];});cx/=C.pts.length;cz/=C.pts.length;
  const HA=C.hills||3,ph=C.id.length*1.7,LK=C.lake;
  const lakeF=(x,z)=>{if(!LK)return 0;const dx=(x-cx-LK.x)/LK.rx,dz=(z-cz-LK.z)/LK.rz;const d=Math.sqrt(dx*dx+dz*dz);const t=Math.max(0,Math.min(1,(d-0.72)/0.4));return 1-t*t*(3-2*t);};
  const hBase=(x,z)=>{let h=5+HA*(Math.sin(x*0.011+ph)*Math.cos(z*0.013-ph*0.7)+0.55*Math.sin((x+z)*0.019+ph*1.3)+0.25*Math.cos((x-z)*0.031));
    if(C.mtn)C.mtn.forEach(m=>{const dx=x-cx-m.x,dz=z-cz-m.z;h+=m.h*Math.exp(-(dx*dx+dz*dz)/(m.r*m.r));});return h;};
  // the road's own hills, valleys and jump crests (gpElevAt, from the route tags) ride on the rolling ground. The land round the road
  // follows them too: a coarse field F spreads the road's lift over ~100 m, so hills look like hills (not a dyke) and valleys open out.
  const RE=C.pts.map((p,k)=>gpElevAt(C,C.ptsD[k])),FG=25,FN=Math.ceil(1800/FG)+1,F0x=cx-900,F0z=cz-900,FF=new Float32Array(FN*FN);
  {const sp=[];for(let k=0;k<C.pts.length;k+=3)sp.push(k);const s2=2*95*95,w0=Math.exp(-260*260/s2);
    for(let a=0;a<FN;a++)for(let b=0;b<FN;b++){const x=F0x+a*FG,z=F0z+b*FG;let sw=w0,se=w0*(C.farE||0);for(const k of sp){const dx=C.pts[k][0]-x,dz=C.pts[k][1]-z,d2=dx*dx+dz*dz;if(d2>90000)continue;const w=Math.exp(-d2/s2);sw+=w;se+=w*RE[k];}FF[a*FN+b]=se/sw;}}
  const Fat=(x,z)=>{const fx=Math.max(0,Math.min(FN-1.001,(x-F0x)/FG)),fz=Math.max(0,Math.min(FN-1.001,(z-F0z)/FG)),a=Math.floor(fx),b=Math.floor(fz),u=fx-a,v=fz-b;
    return (FF[a*FN+b]*(1-u)+FF[(a+1)*FN+b]*u)*(1-v)+(FF[a*FN+b+1]*(1-u)+FF[(a+1)*FN+b+1]*u)*v;};
  const hgt=(x,z)=>{const h=hBase(x,z)+(DK?DK.at(x,z):Fat(x,z)),lf=lakeF(x,z);return h*(1-lf)+(-7)*lf;};   // the lake / sea floor never pulls the road down (the road uses hBase)
  const curve=new T.CatmullRomCurve3(C.pts.map((p,k)=>new T.Vector3(p[0],Math.max(C.roadFloor==null?-1e9:C.roadFloor,hBase(p[0],p[1])+RE[k]),p[1])),true,"centripetal",0.5);curve.arcLengthDivisions=Math.max(2000,Math.round(C.pts.length*24));   // a fine arc-length table: t*len is then true metres along the road (the default 200 steps was ~10 cm off between cars)
  const len=curve.getLength(),M=Math.max(960,Math.round(len/1.4)),W=7.6;   // ~1.4 m between road samples (jump crests and hairpins stay smooth)
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
  const RW=W+3.2,BL=RALLY?44:30;
  const cutZ=[];if(C.zones){(C.zones.bridge||[]).forEach(([a,b])=>{const ia=Math.round(a*M),ib=Math.round(b*M);let lo=1e9;for(let i=ia;i<=ib;i++)lo=Math.min(lo,samples[i%M].pos.y);cutZ.push([ia,ib,6.6,W+2.9,lo]);});(C.zones.ford||[]).forEach(([a,b])=>cutZ.push([Math.round(a*M)-6,Math.round(b*M)+6,0.9,W+0.5]));(C.zones.riverbed||[]).forEach(([a,b])=>cutZ.push([Math.round(a*M),Math.round(b*M),1.1,W+3]));}
  if(RALLY){   // Dakar: every dune the road climbs is a real ridge across the land (same shape as the road's own profile, so they meet without a seam); open dunes fill the rest, kept low round the piste, wadi, rocks and camp
    const Zs=C.zones||{},zin=(i,n)=>(Zs[n]||[]).some(([a,b])=>{const f=i/M;return a<=b?(f>=a&&f<=b):(f>=a||f<=b);}),sst=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};
    let duneK=new Float32Array(M),wadi=new Float32Array(M);for(let i=0;i<M;i++){duneK[i]=zin(i,"dunes")?1:(zin(i,"wadi")?0.3:(zin(i,"rocks")?0.2:0.07));wadi[i]=zin(i,"wadi")?1:0;}
    duneK=blur(blur(duneK,Math.round(40/ds)),Math.round(40/ds));wadi=blur(blur(wadi,Math.round(24/ds)),Math.round(24/ds));for(let i=0;i<M;i++)flatW[i]+=wadi[i]*13;
    const ridges=(C.dnl||[]).map((q,k)=>{const i=Math.round(q[0]/C.lapM*M)%M,s=samples[i],tl=Math.hypot(s.tan.x,s.tan.z)||1,J=(C.jumps||[]).find(j=>Math.abs(j[0]-q[0])<1&&!j[2]),sh=J?gpJumpShape(J):null;
      return{x:s.pos.x,z:s.pos.z,tx:s.tan.x/tl,tz:s.tan.z/tl,H:q[1],up:q[1]*6.5,dn:q[1]*5,J:J?J[1]:0,ra:sh?sh.ra:1,fb:sh?sh.fb:1,p:sh?sh.p:1,bow:(k%2?1:-1)/(520+k*70),ph:k*1.7};});
    const AF=new Float32Array(FN*FN),st=Math.max(2,Math.round(8/ds));for(let a=0;a<FN;a++)for(let b=0;b<FN;b++){const x=F0x+a*FG,z=F0z+b*FG;let bd=1e12,bi=0;for(let i=0;i<M;i+=st){const p=samples[i].pos,d=(p.x-x)*(p.x-x)+(p.z-z)*(p.z-z);if(d<bd){bd=d;bi=i;}}const d=Math.sqrt(bd);AF[a*FN+b]=(duneK[bi]+(1-duneK[bi])*sst(150,330,d))*sst(11,58,d);}
    const Aat=(x,z)=>{const fx=Math.max(0,Math.min(FN-1.001,(x-F0x)/FG)),fz=Math.max(0,Math.min(FN-1.001,(z-F0z)/FG)),a=Math.floor(fx),b=Math.floor(fz),u=fx-a,v=fz-b;return (AF[a*FN+b]*(1-u)+AF[(a+1)*FN+b]*u)*(1-v)+(AF[a*FN+b+1]*(1-u)+AF[(a+1)*FN+b+1]*u)*v;};
    DK={duneK,wadi,ridges,zin,sst,at(x,z){let h=gpDakarDune(x,z)*Aat(x,z);for(const r of ridges){const dx=x-r.x,dz=z-r.z,v=dz*r.tx-dx*r.tz,av=Math.abs(v);if(av>330)continue;const u=dx*r.tx+dz*r.tz+r.bow*v*v+8*Math.sin(v*0.027+r.ph)*Math.min(1,av/50);if(u<=-r.up||u>=r.dn)continue;
        const lat=Math.exp(-(v*v)/(210*210))*(1-0.22*Math.pow(Math.sin(v*0.011),2))*(av>230?1-(av-230)/100:1);h+=lat*(gpDuneShape(r.H,u)+(r.J&&u>-r.ra&&u<r.fb?(u<0?r.J*Math.pow(1+u/r.ra,r.p):r.J*Math.pow(1-u/r.fb,2)):0));}return h;}};}
  const groundAt=(x,z)=>{const n=nearest(x,z);const h=hgt(x,z);if(n[0]<0)return h;const rp=samples[n[0]].pos;const ry=rp.y-(C.deep?0.5:0.12);const rw=flatW[n[0]];
    for(const q of cutZ){if(n[0]>=q[0]&&n[0]<=q[1]&&n[1]>q[3]){const e=Math.min(1,Math.min(n[0]-q[0],q[1]-n[0])*ds/9),f=Math.min(1,(n[1]-q[3])/4);return (q[4]!=null?Math.min(ry,q[4]-0.12):ry)-q[2]*e*f*(3-2*f)*f;}}   // river / stream bed under bridges and across the ford
    if(n[1]<=rw)return ry;const t=Math.min(1,(n[1]-rw)/BL);const e=t*t*(3-2*t);const dn=C.dunes?gpDune(C,x,z)*Math.min(1,Math.max(0,(n[1]-rw-8)/55)):0;return ry+(h-ry)*e+dn;};
  const gh="#"+C.grass.toString(16).padStart(6,"0");
  const grassTex=gpCanvasTex(256,256,(x,w,h)=>{x.fillStyle=gh;x.fillRect(0,0,w,h);for(let i=0;i<70;i++){const r=8+rnd()*40;x.fillStyle=rnd()<0.5?"rgba(0,0,0,.06)":"rgba(255,240,160,.07)";x.beginPath();x.arc(rnd()*w,rnd()*h,r,0,7);x.fill();}
    for(let i=0;i<3200;i++){x.fillStyle=rnd()<0.5?"rgba(0,0,0,.1)":"rgba(255,255,190,.08)";x.fillRect(rnd()*w,rnd()*h,1.5,3);}
    if(RALLY){x.fillStyle="#d8d2c4";x.fillRect(0,0,w,h);for(let i=0;i<5200;i++){const v=rnd();x.fillStyle=v<0.5?"rgba(110,80,50,.07)":"rgba(255,255,255,.09)";x.fillRect(rnd()*w,rnd()*h,2,2);}   // wind ripples: fine wavy lines across the wind (the vertex colours carry the sand colour)
      for(let k=0;k<26;k++){const y0=(k+0.5)*h/26;x.strokeStyle="rgba(96,66,38,"+(0.16+rnd()*0.12).toFixed(2)+")";x.lineWidth=1.6+rnd()*1.4;x.beginPath();for(let px=0;px<=w;px+=8){const y=y0+Math.sin(px/w*Math.PI*2*3+k*1.3)*2.4+Math.sin(px/w*Math.PI*2*7+k)*1.1;px?x.lineTo(px,y):x.moveTo(px,y);}x.stroke();x.strokeStyle="rgba(255,250,235,.14)";x.lineWidth=1.2;x.beginPath();for(let px=0;px<=w;px+=8){const y=y0+3+Math.sin(px/w*Math.PI*2*3+k*1.3)*2.4+Math.sin(px/w*Math.PI*2*7+k)*1.1;px?x.lineTo(px,y):x.moveTo(px,y);}x.stroke();}}},true);grassTex.repeat.set(RALLY?190:140,RALLY?190:140);
  const GS=1700,TG=new T.PlaneGeometry(GS,GS,170,170);TG.rotateX(-Math.PI/2);const tp=TG.attributes.position;const tcol=new Float32Array(tp.count*3);
  const DKC=[0xd9c6a2,0xb4936c,0xe6ab62].map(h=>gpLin(h));const FZF=[0x9aa85e,0xc2b673,0x7f9a52,0xa39a6a,0x8fae5c,0x6f8a4a,0xb7b06c].map(h=>gpLin(h));const DES=gpSandy(C),cGrass=gpLin(C.grass).multiply(bandOn?new T.Color(0.74,0.74,0.5):new T.Color(1,1,1)),cHigh=gpLin(DES?0xe8c690:(story?0x6f8f5a:0x4f6b3a)),cShore=gpLin(story?0xe9d9b8:(C.theme?0xe6d3a3:0xb8a77c)),tmpC=new T.Color();
  for(let i=0;i<tp.count;i++){const x=tp.getX(i)+cx,z=tp.getZ(i)+cz;const y=groundAt(x,z);tp.setXYZ(i,x,y,z);tmpC.copy(cGrass);if(TH==="inaka"&&!story){const fa=Math.floor((x*0.83+z*0.56)/44),fb=Math.floor((z*0.83-x*0.56)/36),hh=Math.abs(Math.sin(fa*12.9898+fb*78.233)*43758.5453)%1;tmpC.lerp(FZF[Math.floor(hh*FZF.length)],0.62);tmpC.multiplyScalar(0.92+0.16*((hh*7)%1));}if(RALLY){const n=nearest(x,z),hh=Math.abs(Math.sin(Math.floor(x/30)*12.9898+Math.floor(z/30)*78.233)*43758.5453)%1;tmpC.multiplyScalar(0.95+0.1*hh);tmpC.lerp(DKC[2],Math.min(0.5,Math.max(0,(y-9)/30)));if(n[0]>=0&&n[1]<48){const f=1-DK.sst(14,48,n[1]),w=DK.wadi[n[0]],dk=DK.duneK[n[0]];tmpC.lerp(DKC[0],f*w*0.8);tmpC.lerp(DKC[1],f*(1-w)*(1-dk)*0.62);}}else if(y<1.2)tmpC.lerp(cShore,Math.min(1,(1.2-y)/2));else if(y>12)tmpC.lerp(cHigh,Math.min(1,(y-12)/22));tcol[i*3]=tmpC.r;tcol[i*3+1]=tmpC.g;tcol[i*3+2]=tmpC.b;}
  TG.setAttribute("color",new T.BufferAttribute(tcol,3));TG.computeVertexNormals();
  const ground=new T.Mesh(TG,new T.MeshLambertMaterial({map:grassTex,vertexColors:true}));ground.receiveShadow=true;scene.add(ground);
  const farMat=new T.MeshLambertMaterial({color:story?L.hill:(C.deep?0xd8c48e:(LK?(LK.sea?0x2a8fb4:0x6d93b8):(DES?0xd2a86e:0x5f7050)))});const far=new T.Mesh(new T.PlaneGeometry(7000,7000),farMat);far.rotation.x=-Math.PI/2;far.position.set(cx,C.deep?-31:(LK?-1.3:0.5),cz);scene.add(far);
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
  const roadMat=story?new T.MeshLambertMaterial({map:roadTex}):RALLY?gpDakarPiste(T,rnd):new T.MeshStandardMaterial({map:WD.road||roadTex,roughness:WD.road?0.78:0.86,metalness:0.05});
  if(C.deep&&!story){const dt0=gpCanvasTex(256,512,(x,w,h)=>{x.fillStyle="#1f7e9d";x.fillRect(0,0,w,h);for(let i=0;i<5200;i++){const v=rnd();x.fillStyle=v<0.5?"rgba(8,60,90,.28)":"rgba(150,235,245,.1)";x.fillRect(rnd()*w,rnd()*h,2,2);}const gr=x.createLinearGradient(0,0,w,0);[[0,.35],[.14,0],[.86,0],[1,.35]].forEach(q=>gr.addColorStop(q[0],"rgba(4,30,60,"+q[1]+")"));x.fillStyle=gr;x.fillRect(0,0,w,h);x.fillStyle="#eafcff";x.fillRect(6,0,5,h);x.fillRect(w-11,0,5,h);x.fillStyle="rgba(234,252,255,.85)";[0,0.5].forEach(o=>x.fillRect(w/2-3,h*(0.08+o),6,h*0.13));},true);roadMat.map=dt0;roadMat.roughness=0.62;}
  if(!story&&!C.deep&&!RALLY)gpFzRoad(T,roadMat,C,L,rnd,!!WD.road);   // darker damp asphalt with a sky sheen (every course); Japan Countryside gets its own orange-centre-line paint
  {const rm=RALLY?ribbon(-W-2.6,W+2.6,roadMat,0.03,0.03,(len/M)/30):ribbon(-W,W,roadMat,0.03,0.03,(len/M)/((WD.road?4:2)*W));if(RALLY)rm.renderOrder=-1;scene.add(rm);}
  const vergeTex=gpCanvasTex(128,128,(x,w,h)=>{x.fillStyle=story?"#e9d9b8":(C.deep?"#d9c58f":"#7d7a66");x.fillRect(0,0,w,h);if(story){x.fillStyle="#d9785f";x.fillRect(0,0,14,h);x.fillRect(w-14,0,14,h);return;}for(let i=0;i<1200;i++){const v=100+rnd()*70|0;x.fillStyle="rgba("+v+","+(v-6)+","+(v-22)+",.6)";x.fillRect(rnd()*w,rnd()*h,2,2);}},true);
  const vergeMat=new T.MeshLambertMaterial({map:vergeTex});if(!RALLY){scene.add(ribbon(-W-2.2,-W,vergeMat,-0.06,0.02,0.4));scene.add(ribbon(W,W+2.2,vergeMat,0.02,-0.06,0.4));}
  const deepCa=C.deep?gpDeepCaustics(T):null;if(deepCa)[roadMat,vergeMat,ground.material].forEach(m=>deepCa.patch(m));   // moving light on the road and the sand
  const dummy=new T.Object3D(),shared0=gpCarShared(T);
  const s0=samples[0],sStart=s0.pos.clone();
  const hdgAt=i=>Math.atan2(samples[(i+M)%M].tan.x,samples[(i+M)%M].tan.z),hdgMean=(a,b)=>{let sx=0,sz=0;for(let i=a;i<=b;i++){sx+=Math.sin(hdgAt(i));sz+=Math.cos(hdgAt(i));}return Math.atan2(sx,sz);};const stA=Math.round(C.mainS[0]*0.62/ds),stB=Math.round(C.mainS[1]*0.72/ds);const standRanges=[[M-stA,M],[0,stB]];const inStands=i=>standRanges.some(([a,b])=>i>=a-4&&i<=b+4);   // pit wall + grandstands along the main straight
  const pitSide=corners.length?corners[0].sgn:1,busy=i=>inStands(i)||inRun(i);   // pits on the inside of turn 1, the big grandstand opposite
  let trapI=Math.floor(M*0.3),bestStr=-9;for(let i=Math.floor(M*0.12);i<Math.floor(M*0.88);i+=4){if(inStands(i))continue;const a=samples[(i-25+M)%M].tan,b=samples[(i+25)%M].tan;const d=a.x*b.x+a.z*b.z;if(d>bestStr){bestStr=d;trapI=i;}}   // speed trap on the straightest stretch away from the pits
  const nearBld=(x,z)=>{const n=nearest(x,z);return inStands(n[0])&&n[1]<W+38;};   // nothing grows on the pit building or in the grandstands
  // ---- guard rails (white steel) with posts, and red-white delineator posts that streak past ----
  const furn0=scene.children.length;   // Dakar: everything a race circuit puts beside the road from here to the themed world (rails, posts, kerbs, run-off, fences, walls, flags) is taken out again
  const railPic=C.deep?null:(WD.rail||null);
  const railMat=C.deep?(()=>{const q=(c,ln)=>gpCanvasTex(256,32,(x,w,h)=>{x.fillStyle=c;x.fillRect(0,0,w,h);x.fillStyle=ln;for(let k=0;k<4;k++)x.fillRect(k*64+8,10,44,12);},true),m=new T.MeshLambertMaterial({map:q("#0b1b3d","#7ff3ff"),emissiveMap:q("#000000","#39e8ff"),emissive:0xffffff,side:T.DoubleSide});m.userData.lin=1;return m;})():railPic?new T.MeshStandardMaterial({map:railPic,transparent:true,alphaTest:0.5,side:T.DoubleSide,roughness:0.5,metalness:0.3}):new T.MeshStandardMaterial({color:story?0xd9785f:0xe8e9ea,roughness:0.4,metalness:0.6,side:T.DoubleSide});
  // rail offset per side and sample: at the shoulder normally, out at the edge of the run-off round the big corners, gone along the main straight (walls there)
  const railOff=[null,null,null];[-1,1].forEach(side=>{const o=new Float32Array(M);for(let i=0;i<M;i++)o[i]=runOut[i]===side?runW+0.9:W+2.6;for(let r=0;r<2;r++){const o2=Float32Array.from(o);for(let i=0;i<M;i++){let v=0;for(let k=-5;k<=5;k++)v+=o[wrapI(i+k)];o2[i]=v/11;}o.set(o2);}railOff[side+1]=o;});
  const rail=(side,y0,y1)=>{const g=new T.BufferGeometry();const v=[],uv=[],idx=[];let d=0;const off=railOff[side+1];for(let i=0;i<=M;i++){const s=samples[i%M];const a=s.pos.clone().addScaledVector(s.nor,side*off[i%M]);const gy=groundAt(a.x,a.z);const hide=inStands(i%M);if(i)d+=samples[i%M].pos.distanceTo(samples[i-1].pos);const u=d/GP_WORLD.rail.len;v.push(a.x,hide?gy-2:gy+y0,a.z,a.x,hide?gy-2:gy+y1,a.z);uv.push(u,0,u,1);if(i<M){const k=i*2;idx.push(k,k+2,k+1,k+1,k+2,k+3);}}g.setAttribute("position",new T.Float32BufferAttribute(v,3));g.setAttribute("uv",new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();const m=new T.Mesh(g,railMat);m.castShadow=!railPic;return m;};
  [-1,1].forEach(side=>scene.add(railPic?rail(side,0.0,GP_WORLD.rail.hgt):(C.deep?rail(side,0.0,0.82):rail(side,0.45,0.78))));
  const posts=[];for(let i=0;i<M;i+=4){if(inStands(i))continue;const s=samples[i];[-1,1].forEach(side=>{const p=s.pos.clone().addScaledVector(s.nor,side*railOff[side+1][i]);posts.push([p.x,groundAt(p.x,p.z),p.z]);});}
  const postIM=new T.InstancedMesh(new T.BoxGeometry(0.12,0.8,0.12),new T.MeshLambertMaterial({color:0x9a9ea3}),posts.length);posts.forEach((p,k)=>{dummy.position.set(p[0],p[1]+0.4,p[2]);dummy.rotation.set(0,0,0);dummy.scale.set(1,1,1);dummy.updateMatrix();postIM.setMatrixAt(k,dummy.matrix);});if(!railPic&&!C.deep)scene.add(postIM);
  // photo props (trees, lanterns, banners, torii) collect here and become one batch of camera-facing billboards
  const BB=[],bbOn=!TH&&!!WD.props,bbAdd=(type,x,y,z,s,flip)=>{BB.push([type,x,y,z,s,flip]);};
  const delin=[];for(let i=2;i<M;i+=(TH==="inaka"?9:3)){if(busy(i)||street)continue;const s=samples[i];[-1,1].forEach(side=>{const p=s.pos.clone().addScaledVector(s.nor,side*(W+1.9));delin.push([p.x,groundAt(p.x,p.z),p.z]);});}
  const delTex=gpCanvasTex(16,64,(x,w,h)=>{x.fillStyle="#f4f4f4";x.fillRect(0,0,w,h);x.fillStyle="#d8232a";x.fillRect(0,0,w,14);x.fillRect(0,28,w,10);});
  const delIM=new T.InstancedMesh(new T.CylinderGeometry(0.075,0.075,1.25,6),new T.MeshLambertMaterial({map:delTex}),delin.length);delin.forEach((p,k)=>{dummy.position.set(p[0],p[1]+0.62,p[2]);dummy.updateMatrix();delIM.setMatrixAt(k,dummy.matrix);});scene.add(delIM);
  // tall roadside poles just outside the rail, every ~26 m: near things sliding past fast is what sells speed, one extra draw call (job 1108-0900)
  if(!C.deep&&!street&&TH!=="inaka"){const step=Math.max(4,Math.round(26/ds)),pl=[];for(let i=1;i<M;i+=step){if(busy(i))continue;const s=samples[i];[-1,1].forEach(side=>{const off=railOff[side+1][i]+1.25,p=s.pos.clone().addScaledVector(s.nor,side*off);pl.push([p.x,groundAt(p.x,p.z),p.z,Math.atan2(s.tan.x,s.tan.z)]);});}
    if(pl.length){const g=gpBoxesGeo(T,[[0.13,5.2,0.13,0,2.6,0],[1.3,0.09,0.09,0,4.9,0],[0.09,0.09,0.09,0.52,5.0,0],[0.09,0.09,0.09,-0.52,5.0,0]]),im=new T.InstancedMesh(g,new T.MeshLambertMaterial({color:0x5b5f66}),pl.length);pl.forEach((p,k)=>{dummy.position.set(p[0],p[1],p[2]);dummy.rotation.set(0,p[3],0);dummy.scale.set(1,1,1);dummy.updateMatrix();im.setMatrixAt(k,dummy.matrix);});dummy.rotation.set(0,0,0);im.frustumCulled=false;scene.add(im);}}
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
  const flags=[];for(let i=0;i<M;i+=(bbOn?22:12)){if(busy(i)||street||C.theme==="desert"||TH==="inaka"||Math.abs(kap[i])>1/80)continue;const s=samples[i%M];[-1,1].forEach(side=>{const p=s.pos.clone().addScaledVector(s.nor,side*(W+5.2));flags.push([p.x,groundAt(p.x,p.z),p.z,side,s.nor.clone()]);});}
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
  if(TH==="coast"){const ct=gpCanvasTex(512,128,(x,w,h)=>{x.clearRect(0,0,w,h);const cols=["#ff5a5f","#ffd23f","#39c0ff","#f4f4f4","#ff7a00","#2e9e57","#7a4bd6","#1d5fd1"],skin=["#f1c9a5","#c68e5d","#8d5a3b","#e0ac7d","#5c3a24"];
      for(let r=0;r<4;r++)for(let c=0;c<44;c++){const px=6+c*11.5+(r%2)*5,py=34+r*24;x.fillStyle=cols[(c*7+r*3)%cols.length];x.beginPath();x.ellipse(px,py+8,5,8,0,0,7);x.fill();x.fillStyle=skin[(c+r*5)%skin.length];x.beginPath();x.arc(px,py-3,3.6,0,7);x.fill();
        if((c*5+r)%9===0){x.fillStyle="#ddd";x.fillRect(px+3,py-22,1.5,22);for(let a=0;a<3;a++)for(let b=0;b<2;b++){x.fillStyle=(a+b)%2?"#111":"#fff";x.fillRect(px+4.5+a*4,py-22+b*4,4,4);}}}});
    const cm=new T.MeshLambertMaterial({map:ct,transparent:true,alphaTest:0.4});big.forEach(c=>{if(c.R>=23)return;const so=c.sgn,a=c.a-4,b=c.b+6;ribbonR(a,b,so*(runW+3.4),so*(runW+9.8),cm,1.2,5.6,1/16,true,1);wallR(a,b,runW+3.4,so,0,1.25,concMat,0.1);});}
  if(WD.crowd&&!TH){const cm=picMat(WD.crowd,{alphaTest:0.4}),CR=GP_WORLD.crowd;big.forEach(c=>{if(c.R>=23)return;const so=c.sgn,a=c.a-4,b=c.b+6;ribbonR(a,b,so*(runW+3.4),so*(runW+9.8),cm,1.2,5.6,1/CR.mPerU,true,7.8/(CR.mPerU*CR.h/CR.w));wallR(a,b,runW+3.4,so,0,1.25,concMat,0.1);});}
  if(atlasMat&&!TH){big.forEach(c=>{if(c.R<23)return;const so=c.sgn;for(let i=c.a-6;i<=c.b+8;i+=Math.round(4.6/ds)){const s=samples[wrapI(i)];const p=s.pos.clone().addScaledVector(s.nor,so*(runW+3.2));BB2.push(["tyres",p.x,groundAt(p.x,p.z),p.z,1,(i>>2)%2===0]);}});
    const ads=[];for(let i=18;i<M;i+=Math.round(52/ds)){if(busy(i)||Math.abs(kap[i])>1/100||Math.abs(i-trapI)<14)continue;const s=samples[i];const side=(ads.length%2)?-1:1;const p=s.pos.clone().addScaledVector(s.nor,side*(W+5.4));const y=groundAt(p.x,p.z);if(y>0.8)ads.push([p.x,y,p.z,side,s.nor.clone()]);}
    ["ad1","ad2","ad3"].forEach((cell,ci)=>{const list=ads.filter((a,k)=>k%3===ci);if(!list.length)return;const im=new T.InstancedMesh(atlasGeo(cell,2.6),atlasMat,list.length);
      list.forEach((a,k)=>{dummy.position.set(a[0],a[1]+1.3,a[2]);dummy.rotation.set(0,0,0);dummy.scale.set(1,1,1);dummy.lookAt(a[0]-a[4].x*a[3],a[1]+1.3,a[2]-a[4].z*a[3]);dummy.updateMatrix();im.setMatrixAt(k,dummy.matrix);});scene.add(im);});}
  // the start/finish gantry: steel truss over the line, five start lights facing the grid, a sign over the track
  const steel=new T.MeshStandardMaterial({color:0x3a3d44,roughness:0.5,metalness:0.6}),gantry=new T.Group(),gw=W+2.0;
  const lights=[],covers=[];let screenTex=null,screenCv=null;
  if(TH){const tg=gpThemeGantry(T,C,W,gantry,lights);screenCv=tg.cv;screenTex=tg.tex;}
  else if(WD.gantry){const GA=GP_WORLD.gantry,gwM=2*(W+3.6)/(GA.posts[1]-GA.posts[0]),ghM=gwM*GA.h/GA.w;
    const gpl=new T.Mesh(new T.PlaneGeometry(gwM,ghM),picMat(WD.gantry));gpl.rotation.y=Math.PI;gpl.position.y=ghM/2-0.05;gantry.add(gpl);   // turned to face the grid
    GA.lights.forEach(([lx,ly,lr])=>{const cm=new T.MeshBasicMaterial({color:0x1a1214});cm.userData.lin=1;const c=new T.Mesh(new T.CircleGeometry(lr*gwM*1.25,18),cm);c.position.set((lx-0.5)*gwM,(0.5-ly)*ghM,0.04);c.visible=false;gpl.add(c);covers.push(c);});   // a cover hides a lamp once it has gone out
    screenCv=document.createElement("canvas");screenCv.width=512;screenCv.height=128;screenTex=new T.CanvasTexture(screenCv);if(T.sRGBEncoding)screenTex.encoding=T.sRGBEncoding;
    const [sx,sy,sw,sh]=GA.screen;const sm=new T.MeshBasicMaterial({map:screenTex});sm.toneMapped=false;sm.userData.lin=1;const scr=new T.Mesh(new T.PlaneGeometry(sw*gwM*0.98,sh*ghM*0.94),sm);scr.position.set((sx+sw/2-0.5)*gwM,(0.5-(sy+sh/2))*ghM,0.04);gpl.add(scr);}
  else [-1,1].forEach(sd=>{const pl=new T.Mesh(new T.BoxGeometry(0.7,8.2,0.7),steel);pl.position.set(sd*gw,4.1,0);pl.castShadow=true;gantry.add(pl);});
  if(!WD.gantry&&!TH){const beam=new T.Mesh(new T.BoxGeometry(gw*2+0.7,1.5,1.0),steel);beam.position.set(0,8.0,0);beam.castShadow=true;gantry.add(beam);
    const signMat=new T.MeshBasicMaterial({map:gpTextTex("GRAND FABLE HORIZON GP",["#ff2d87","#ff7a00"],"#fff",1024,160,92)});signMat.userData.lin=1;
    const signF=new T.Mesh(new T.PlaneGeometry(gw*2+0.4,1.3),signMat);signF.position.set(0,8.0,-0.52);signF.rotation.y=Math.PI;gantry.add(signF);
    const signB=new T.Mesh(new T.PlaneGeometry(gw*2+0.4,1.3),signMat);signB.position.set(0,8.0,0.52);gantry.add(signB);
    const lightPanel=new T.Mesh(new T.BoxGeometry(4.2,1.0,0.3),new T.MeshLambertMaterial({color:0x111216}));lightPanel.position.set(0,6.7,0.1);gantry.add(lightPanel);
    for(let k=0;k<5;k++){const lm=new T.MeshBasicMaterial({color:0xff2020});lm.userData.lin=1;const lb=new T.Mesh(new T.SphereGeometry(0.3,12,8),lm);lb.position.set(-1.6+k*0.8,6.7,0.3);gantry.add(lb);lights.push(lm);}}
  gantry.position.copy(sStart);gantry.lookAt(sStart.clone().add(s0.tan));scene.add(gantry);
  // start lights: all five red on the grid, going out one by one through the count, all out at GO
  const setLights=on=>{const lit=k=>k>=1&&k<=on;lights.forEach((m,k)=>m.color.setHex(lit(k)?0xff2020:0x3a0a0a));covers.forEach((c,k)=>{c.visible=!lit(k);});};setLights(0);   // the three middle lamps: 3 lit on "3", one goes out per beat, all out on GO
  const SCR=GP_SCREEN[TH]||GP_SCREEN.gp;
  const setScreen=txt=>{if(!screenCv)return;const x=screenCv.getContext("2d"),w=512,h=128;const g=x.createLinearGradient(0,0,w,0);SCR.bg.forEach((c,q)=>g.addColorStop(q/(SCR.bg.length-1),c));x.fillStyle=g;x.fillRect(0,0,w,h);
    x.fillStyle="rgba(0,0,0,.35)";for(let i=0;i<32;i++){if(i%2)x.fillRect(i*16,0,16,10);else x.fillRect(i*16,h-10,16,10);}
    x.fillStyle=SCR.fg;x.textAlign="center";x.textBaseline="middle";x.shadowColor="rgba(0,0,0,.5)";x.shadowBlur=6;let fs=60;x.font="italic 900 "+fs+"px system-ui";const tw=x.measureText(txt).width;if(tw>w-40){fs=Math.floor(fs*(w-40)/tw);x.font="italic 900 "+fs+"px system-ui";}x.fillText(txt,w/2,h/2+3);screenTex.needsUpdate=true;};setScreen(SCR.hello);
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
  if(RALLY)for(let k=scene.children.length-1;k>=furn0;k--){const o=scene.children[k];if(o===gantry)continue;scene.remove(o);if(o.geometry)o.geometry.dispose();}
  const TW=TH==="inaka"?gpInakaWorld({T,scene,C,samples,M,W,ds,nearest,groundAt,dummy,rnd,kap,inStands,runOut,railOff,torii,WD,hazeHex,TINT,blob:shared0.blob,story,cx,cz}):TH?gpThemeWorld({T,scene,C,samples,M,W,ds,nearest,groundAt,dummy,rnd,kap,ribbonR,wallR,wallS,inStands,poMat,shared:shared0,cx,cz,lakeF:LK?lakeF:null}):null;
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
      dummy.scale.set(1,1,1);dummy.rotation.set(0,0,0);dummy.position.set(c[0],c[1]+0.65,c[2]);dummy.updateMatrix();pIM.setMatrixAt(i,dummy.matrix);});bIM.castShadow=true;if(!RALLY){scene.add(bIM);scene.add(pIM);}}
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
  for(let i=0;i<(fzSky?0:(bandOn?7:16));i++){const sp=new T.Sprite(new T.SpriteMaterial({map:cloudTex,transparent:true,fog:false,opacity:bandOn?0.6:0.8,depthWrite:false}));const s=90+rnd()*90;sp.scale.set(s,s/2.2,1);sp.position.set(cx+(rnd()-0.5)*2200,170+rnd()*120,cz+(rnd()-0.5)*2200);scene.add(sp);}
  for(let i=0;i<(bandOn||fzSky?0:5);i++){const sp=new T.Sprite(new T.SpriteMaterial({map:cloudTex,transparent:true,fog:false,opacity:0.75,depthWrite:false}));const s=160+rnd()*120;sp.scale.set(s,s/3,1);sp.position.set(fx+(rnd()-0.5)*700,FH*0.3+rnd()*FH*0.18-6,fz+120+rnd()*300);scene.add(sp);}
  const glare=new T.Sprite(new T.SpriteMaterial({map:gpSoftDot(),color:new T.Color(L.glow),transparent:true,opacity:story?0.55:(fzSky?0.1:0.2),blending:T.AdditiveBlending,depthWrite:false,fog:false}));glare.material.userData.lin=1;glare.scale.set(bandOn?100:140,bandOn?100:140,1);scene.add(glare);
  // ---- corner warning boards: yellow/black chevrons on the outside of every tight bend (where the safe speed is well below top speed),
  // pointing the way it turns, and a JUMP! board before every crest, so Prince learns where to brake ----
  if(!story){const chev=dirn=>gpCanvasTex(256,128,(x,w,h)=>{x.fillStyle="#FFDE47";x.fillRect(0,0,w,h);x.fillStyle="#1A1A24";x.lineWidth=10;x.strokeStyle="#1A1A24";x.strokeRect(5,5,w-10,h-10);
      for(let k=0;k<3;k++){const cx0=56+k*72;x.beginPath();if(dirn<0){x.moveTo(cx0+22,20);x.lineTo(cx0-14,64);x.lineTo(cx0+22,108);x.lineTo(cx0+42,108);x.lineTo(cx0+6,64);x.lineTo(cx0+42,20);}else{x.moveTo(cx0-22,20);x.lineTo(cx0+14,64);x.lineTo(cx0-22,108);x.lineTo(cx0-42,108);x.lineTo(cx0-6,64);x.lineTo(cx0-42,20);}x.closePath();x.fill();}});
    const boards={"-1":[],"1":[]},postL=[],yawI=i=>{const s=samples[wrapI(i)];return Math.atan2(s.tan.x,s.tan.z);};
    corners.forEach(c=>{if(c.R>48||c.n*ds<10||vLim[c.apex]>34)return;const out=c.sgn,dirn=c.sgn>0?-1:1;   // + kap = left-hander: board on the right, chevrons point left
      const span=c.b-c.a,nb=Math.max(2,Math.min(5,Math.round(span*ds/14)));for(let q=0;q<nb;q++){const i=wrapI(c.a+Math.round(span*(q+0.5)/nb)),s=samples[i],off=W+4.2;
        const px=s.pos.x+s.nor.x*out*off,pz=s.pos.z+s.nor.z*out*off,gy=Math.max(groundAt(px,pz),s.pos.y-0.3);boards[dirn].push([px,gy,pz,yawI(i)+Math.PI]);postL.push([px,gy,pz]);}});
    const bGeo=new T.PlaneGeometry(2.0,1.0);[-1,1].forEach(d=>{const L=boards[d];if(!L.length)return;const m=new T.InstancedMesh(bGeo,new T.MeshBasicMaterial({map:chev(d),side:T.DoubleSide}),L.length);m.material.userData.lin=1;
      L.forEach((b,k)=>{dummy.position.set(b[0],b[1]+1.45,b[2]);dummy.rotation.set(0,b[3],0);dummy.scale.set(1,1,1);dummy.updateMatrix();m.setMatrixAt(k,dummy.matrix);});scene.add(m);});
    const jb=[];(C.jumps||[]).forEach(J=>{const ij=Math.round(J[0]/C.lapM*M),i=wrapI(ij-Math.round(70/ds)),s=samples[i];[-1,1].forEach(sd=>{const px=s.pos.x+s.nor.x*sd*(W+4.2),pz=s.pos.z+s.nor.z*sd*(W+4.2),gy=Math.max(groundAt(px,pz),s.pos.y-0.3);jb.push([px,gy,pz,yawI(i)+Math.PI]);postL.push([px,gy,pz]);});});
    if(jb.length){const jt=gpCanvasTex(256,192,(x,w,h)=>{x.fillStyle="#FFDE47";x.fillRect(0,0,w,h);x.lineWidth=10;x.strokeStyle="#1A1A24";x.strokeRect(5,5,w-10,h-10);x.fillStyle="#1A1A24";
        x.beginPath();x.moveTo(40,150);x.lineTo(150,150);x.lineTo(150,112);x.closePath();x.fill();x.beginPath();x.arc(186,92,13,0,7);x.fill();x.fillRect(170,70,36,12);   // a ramp and a flying car
        x.font="italic 900 58px system-ui";x.textAlign="center";x.fillText("JUMP!",128,62);});
      const m=new T.InstancedMesh(new T.PlaneGeometry(1.8,1.35),new T.MeshBasicMaterial({map:jt,side:T.DoubleSide}),jb.length);m.material.userData.lin=1;
      jb.forEach((b,k)=>{dummy.position.set(b[0],b[1]+1.65,b[2]);dummy.rotation.set(0,b[3],0);dummy.scale.set(1,1,1);dummy.updateMatrix();m.setMatrixAt(k,dummy.matrix);});scene.add(m);}
    if(postL.length){const pm=new T.InstancedMesh(new T.CylinderGeometry(0.06,0.06,1.0,6).translate(0,0.5,0),new T.MeshLambertMaterial({color:0x3a3d44}),postL.length);
      postL.forEach((q,k)=>{dummy.position.set(q[0],q[1],q[2]);dummy.rotation.set(0,0,0);dummy.scale.set(1,1,1);dummy.updateMatrix();pm.setMatrixAt(k,dummy.matrix);});scene.add(pm);}
    window.__gp_signs={chevrons:boards["-1"].length+boards["1"].length,jumps:jb.length};}
  // ---- cars on the grid ----
  const shared=shared0;shared.flameTex=WD.flame||null;
  if(!story){const ct=new T.Color(1,1,1).lerp(gpLin(L.sun),0.3).multiply(TINT);ct.multiplyScalar(1/Math.max(ct.r,ct.g,ct.b));shared.carTint=ct;}   // sunset rim/tint for the photo cars, matched to the route light
  const others=gpRivalCars(C.id);
  const pname=(P&&typeof P.name==="string"&&P.name.trim())?P.name.trim().split(/\s+/)[0]:"You";
  const NET=!!(GPN&&GPN.race);const racers=NET?GPN.race.roster.map((r,ri)=>({rank:ri,n:r.disp,livery:r.name||"",car:GP_CARS.find(c=>c.id===r.car)||GP_CARS[0],css:r.paint,player:!!r.me,netPaint:r.paint,netUid:r.uid,slot:r.slot})):[{n:pname,livery:gpnProfileName(),car:myCar,css:myPaint,player:true}].concat(gpMode()==="race"?others.slice(0,4).map((c,i)=>({n:GP_DRIVERS[i%GP_DRIVERS.length],car:c,css:c.paint,player:false})):[]);
  const pics=story?{}:(window._gpPics||{});   // the storybook look keeps the drawn 3D cars (the ink filter buries a photo)
  const glbs=story?{}:(window._gpGlb||{});   // real 3D models (GLB) win over the photo sprites when they loaded
  const pace=gpPaceMul();const karts=racers.map((r,i)=>{const m=(GP_GLB[r.car.id]&&glbs[r.car.id])?gpBuildGlbCar(T,r.car,glbs[r.car.id],r.netPaint||gpGlbPaintFor(r.car,r.player),shared):(GP_PICS[r.car.id]&&pics[r.car.id])?gpBuildPicCar(T,r.car,pics[r.car.id],shared):gpBuildCar(T,r.car,r.css,shared);scene.add(m.g);gpNameLivery(T,m,r.livery,r.netPaint||(r.player?gpGlbPaintFor(r.car,true):r.css),shared);const st=gpStats(NET?GPN_STD:r.car);st.max*=pace;st.accel*=0.75;if(r.player&&gpMode()==="race"){const U=gpUpState();if(!NET){st.max*=1+0.02*U.speed;st.accel*=1+0.06*U.launch;}gpUpFit(T,m,true,shared);}   // online: everyone races on the car's own numbers, upgrades are looks only
    return{racer:r,player:r.player,net:NET&&!r.player,netUid:r.netUid,...m,...st,t:0,x:0,px:0,speed:0,lap:0,spin:0,drift:0,off:0,hop:0,roll:0,pitch:0,steerVis:0,st1:0,steerIn:0,sv:0,dHold:0,wasBrake:false,lockT:0,gasT:0,wallT:0,knock:0,headA:0,headV:0,wallRec:0,leanT:0,liftT:0,chatter:0,yaw:null,lastSpeed:0,wheelPhase:0,wheelRadius:m.S.radR,travel:0,skidD:0,ahead:true,started:false,pos:new T.Vector3(),draft:false,brakeOn:false,load:0,squeal:0,loss:null,lossA:0,lossCool:0,overT:0,air:false,airT:0,vy:null,y:0,ry:null,sq:0,sqV:0,hang:0,pS:null,aiSkill:(r.player?1:(0.95+(i%3)*0.025+r.car.handle*0.006)*(gpPace()!=="gentle"?1:0.97)*(gpPK().skill||1)*(NET||r.player?1:gpRivK(C.id)))};});
  {const me0=karts.find(k=>k.player),PK=gpPK(),RK=gpRivK(C.id);if(!NET)karts.forEach(k=>{if(!k.player)k.max=Math.max(me0.max*(PK.capLo||0.9),Math.min(k.max,me0.max*(PK.cap||1.05)))*RK;});}   // every rival's top speed sits in a tight band around the player's car (so no race is won or lost on the car draw), times the track's measured pace number
  const rows=karts.length,pitch=8/(len/M);karts.forEach((k,i)=>{const row=NET?(k.racer.rank+(GPN.race.shift||0))%rows:(k.player?rows-1:i-1);k.t=((M-5-row*pitch)/M)%1;k.x=(row%2?0.4:-0.4)*(rows>1?1:0);k.px=k.x;});
  const TR=(TH&&!story&&(gpTrafficOn()||!!(TW&&TW.parked&&TW.parked.length)))?gpTrafficBuild(T,scene,window._gpTraffic,C,karts,len,karts.find(k=>k.player),shared0,{moving:gpTrafficOn(),parked:(TW&&TW.parked)||[]}):null;   // traffic cars (street + coast courses, Options: traffic on)
  if(gpMode()==="race"){const boxTex=gpCanvasTex(128,256,(x,w,h)=>{x.clearRect(0,0,w,h);x.strokeStyle="rgba(255,255,255,.9)";x.lineWidth=10;x.strokeRect(6,6,w-12,h-12);});
    const boxMat=new T.MeshBasicMaterial({map:boxTex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});boxMat.userData.lin=1;const boxGeo=new T.PlaneGeometry(2.8,5.8).rotateX(-Math.PI/2);
    for(let slot=0;slot<10;slot++){const t=((M-5-slot*pitch)/M)%1,x=(slot%2?0.4:-0.4);const p=curve.getPointAt(t),tn=curve.getTangentAt(t).normalize(),nn=new T.Vector3(-tn.z,0,tn.x).normalize();p.addScaledVector(nn,x*(W-1.2));const bx=new T.Mesh(boxGeo,boxMat);bx.position.set(p.x,p.y+0.06,p.z);bx.rotation.y=Math.atan2(tn.x,tn.z);scene.add(bx);}
    const lineTex=gpCanvasTex(512,32,(x,w,h)=>{for(let i=0;i<32;i++)for(let j=0;j<2;j++){x.fillStyle=(i+j)%2?"#15161a":"#e6e6e2";x.fillRect(i*16,j*16,16,16);}});
    const sl=new T.Mesh(new T.PlaneGeometry(W*2-0.4,1.0).rotateX(-Math.PI/2),new T.MeshBasicMaterial({map:lineTex,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));sl.material.userData.lin=1;sl.position.set(sStart.x,sStart.y+0.06,sStart.z);sl.rotation.y=Math.atan2(s0.tan.x,s0.tan.z);scene.add(sl);}
  // ---- MEGA ramps: chevrons up the kicker (they scroll towards the lip), a red and white lip, solid sides, an arch banner and flags ----
  const megaTex=(C.jumps||[]).some(J=>J[2]==="mega")?gpCanvasTex(256,256,(x,w,h)=>{x.fillStyle="#1A0B36";x.fillRect(0,0,w,h);const cv=(cy,col)=>{x.fillStyle=col;x.beginPath();x.moveTo(0,cy+60);x.lineTo(w/2,cy-40);x.lineTo(w,cy+60);x.lineTo(w,cy+118);x.lineTo(w/2,cy+18);x.lineTo(0,cy+118);x.closePath();x.fill();};cv(-128+64,"#00F0FF");cv(64,"#FFDD00");cv(192,"#00F0FF");},true):null;
  if(megaTex){const rm=new T.MeshBasicMaterial({map:megaTex,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});rm.userData.lin=1;
    const lipT=gpCanvasTex(128,32,(x,w,h)=>{for(let k=0;k<8;k++){x.fillStyle=k%2?"#ffffff":"#ff2a2a";x.fillRect(k*16,0,16,h);}},true),lm=new T.MeshBasicMaterial({map:lipT,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3});lm.userData.lin=1;
    const sideM=new T.MeshLambertMaterial({color:0xff2a85}),poleM=new T.MeshLambertMaterial({color:0x1a0b36}),banT=gpTextTex("MEGA RAMP",["#FF2A85","#ff6a00"],"#ffffff",1024,128,84),banM=new T.MeshBasicMaterial({map:banT,side:T.DoubleSide});banM.userData.lin=1;
    const coneG=new T.ConeGeometry(0.42,1.3,8).translate(0,0.65,0),coneM=new T.MeshLambertMaterial({color:0xff6a00}),cones=[];
    C.jumps.forEach(J=>{if(J[2]!=="mega")return;const ij=Math.round(J[0]/C.lapM*M);let ib=ij,by=-1e9;for(let k=-14;k<=14;k++){const i=wrapI(ij+k);if(samples[i].pos.y>by){by=samples[i].pos.y;ib=ij+k;}}
      const n=Math.round(40/ds),rb=ribbonR(ib-n,ib,-W,W,rm,0.05,0.05,1/7);rb.receiveShadow=false;ribbonR(ib-1,ib,-W,W,lm,0.09,0.09,1/2,false);
      [-1,1].forEach(sd=>{wallS(ib-n,ib+Math.round(8/ds),W+0.05,sd,-2.4,0.22,sideM,0.1);});
      const ig=wrapI(ib-n-Math.round(5/ds)),sg=samples[ig],yg=sg.pos.y,yaw=Math.atan2(sg.tan.x,sg.tan.z);const pole=new T.CylinderGeometry(0.2,0.2,9,8).translate(0,4.5,0);[-1,1].forEach(sd=>{const m=new T.Mesh(pole,poleM);m.position.set(sg.pos.x+sg.nor.x*sd*(W+1.1),yg-1,sg.pos.z+sg.nor.z*sd*(W+1.1));scene.add(m);});
      const ban=new T.Mesh(new T.PlaneGeometry(2*(W+1.1),1.9),banM);ban.position.set(sg.pos.x,yg+7.4,sg.pos.z);ban.rotation.y=yaw+Math.PI;scene.add(ban);
      for(let k=0;k<5;k++){const i=wrapI(ib-k*Math.round(10/ds));[-1,1].forEach(sd=>{const s=samples[i];cones.push([s.pos.x+s.nor.x*sd*(W+0.6),s.pos.y+0.15,s.pos.z+s.nor.z*sd*(W+0.6)]);});}});
    const cm=new T.InstancedMesh(coneG,coneM,cones.length);cones.forEach((c,k)=>{dummy.position.set(c[0],c[1],c[2]);dummy.rotation.set(0,0,0);dummy.scale.set(1,1,1);dummy.updateMatrix();cm.setMatrixAt(k,dummy.matrix);});scene.add(cm);}
  // ---- music notes to collect (free drive) ----
  const notes=[];if(gpMode()==="free"){const noteCols=["#ff2d87","#ffb000","#2fd3c3","#4f8cff","#c27bff"];const noteTex=noteCols.map(c=>gpCanvasTex(128,128,(x,w,h)=>{x.fillStyle="rgba(255,255,255,.95)";x.beginPath();x.arc(64,64,54,0,7);x.fill();x.lineWidth=7;x.strokeStyle=c;x.stroke();x.fillStyle=c;x.font="bold 86px serif";x.textAlign="center";x.textBaseline="middle";x.fillText("♪",60,70);}));
    for(let i=24;i<M-10;i+=19){const k=notes.length;const sp=new T.Sprite(new T.SpriteMaterial({map:noteTex[k%noteTex.length],transparent:true,depthWrite:false}));sp.scale.set(2,2,1);const t=i/M,x=Math.max(-0.7,Math.min(0.7,Math.sin(i*0.37)*0.62));
      const pp=curve.getPointAt(t),tn=curve.getTangentAt(t).normalize(),nn=new T.Vector3(-tn.z,0,tn.x).normalize();pp.addScaledVector(nn,x*(W-1.2));sp.position.set(pp.x,pp.y+1.5,pp.z);scene.add(sp);notes.push({t,x,mesh:sp,alive:true,col:noteCols[k%noteCols.length],k,y:pp.y+1.5});}}
  // ---- particles: tyre smoke, dust, sparks, cherry petals; skid marks ----
  const smoke=gpSmoke(T,scene,150,WD.smoke||gpSoftDot(),scene.fog),dust=C.theme==="dakar"?gpParticles(T,scene,520,3.0,false,0.46):C.theme==="desert"?gpParticles(T,scene,300,2.3,false,0.5):gpParticles(T,scene,120,1.6,false,0.4),sparks=gpParticles(T,scene,160,0.6,true);
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
  R3={T,C,renderer,scene,camera,curve,samples,M,W,len,karts,me:karts.find(k=>k.player),keys:{},touchDir:0,brake:false,gas:false,drift:false,autoGas:gpAuto(),kap,vProf,vLim,lineX,corners,big,grip:GRIP,groundAt,shake:0,lossLog:[],jumpLog:[],t0:performance.now(),time:0,countdown:3.8,phase:"intro",cdReq:false,cdLog:[],frameN:0,goAt:0,done:false,raf:null,last:performance.now(),camPos:new T.Vector3(),msgT:0,place:5,board:[],
    sun,sky,band,glare,sunDir,sunOff:sunDir.clone().multiplyScalar(170),envRT,smoke,dust,sparks,petals,skids,skidLife,skidFade,skN:0,dummy,setLights,setScreen,screenTxt:"",fov:60,pr:pr0,fpsT:0,fpsN:0,fps:0,lowT:0,shadowsOn:true,tmpV:new T.Vector3(),tmpV2:new T.Vector3(),tmpV3:new T.Vector3(),tmpV4:new T.Vector3(),camYaw:null,teleV:new T.Vector3(),teleShadow:new T.Vector3(),teleSprite:new T.Vector3(),UP,story,
    gates,trapT:trapI/M,trapBest:0,gear:1,tachT:0,post,mode:gpMode(),notes,notesGot:0,notesTotal:notes.length*C.laps,song:[],lastDeg:4,songDirty:1,water,waterTex,fx:$("gp3Fx"),fxW:16,fxH:9,sk:{chain:0,mult:1,total:0,idle:0,list:[],dirty:1,clean:0,cool:0},bumpT:9,upGrip:(gpMode()==="race"&&!NET)?1+0.04*gpUpState().tyres:1,online:NET,netGo:0,cLog:null,sunTint:new T.Color(L.sun).lerp(new T.Color(1,1,1),0.35),skyTint:new T.Color(L.mid).lerp(new T.Color(L.hor),0.4),traffic:TR,tw:TW,megaTex,splash:TH==="coast"?gpParticles(T,scene,140,0.9,false,0.55):null};R3.bodies=R3.karts.concat(TR?TR.cars:[]);R3.fzSky=fzSky;R3.L0=L;R3.skyMat=skyMat;if(!story)gpFzInit(T,renderer,phone);
  window.__gp={fz:!!R3.fz,fps:0,pr:pr0,shadows:true,playerWheelPhase:0,wheelPhase:0,playerSpeed:0,speed:0,wheelRadius:R3.me.wheelRadius,cameraFov:60,cameraOffsetFromCar:0,cameraOffset:0,cameraOffsetVector:{x:0,y:0,z:0},playerShadowWorldY:0,shadowY:0,bodyRoll:0,spriteBottomY:R3.me.pos.y,smokeCount:0,rendererCalls:0,renderCalls:0,wheelPatchDrawCalls:0,wheelPatchState:R3.me.pic?"sharp":"3d",wheelPatchVisible:false,wheelPatchFrame:R3.me.pic?R3.me.pic.frame:null,wheelPatchKind:R3.me.pic&&R3.me.pic.wheelPatch?R3.me.pic.wheelPatch.kind:"3d",phys:{slipDeg:0,steerIn:0,sv:0,drift:0,x:0,speed:0},cam:{}};gpBakeInit();gpToonInit();gpFxInit();gpCarEnvApply();
  // keyboard
  R3.kd=e=>{if(!R3)return;const k=e.key.toLowerCase();GPA.init();if(k==="escape"){renderCircuits();return;}if(k==="m"){gpToggleMute();return;}if(k==="c"){gpCycleCam();return;}if((k==="b"||k==="shift")&&!e.repeat){gpBoost();e.preventDefault();return;}if(k==="t"&&!e.repeat){gpTrick("spin",1);e.preventDefault();return;}if(k==="l"&&!e.repeat&&R3.me&&R3.me.jet){gpTrick("flip",1);e.preventDefault();return;}
    if(!e.repeat&&R3.me&&R3.me.air&&!R3.me.jet){if(k==="arrowleft")gpTrick("roll",-1);else if(k==="arrowright")gpTrick("roll",1);else if(k==="arrowup")gpTrick("flip",1);}R3.keys[k]=true;if(["arrowleft","arrowright","arrowdown","arrowup","shift"," "].includes(k))e.preventDefault();};
  R3.ku=e=>{if(!R3)return;R3.keys[e.key.toLowerCase()]=false;};
  window.addEventListener("keydown",R3.kd);window.addEventListener("keyup",R3.ku);
  // touch: pointer events with capture so one thumb can steer while the other holds a pedal.
  // Left half = steering (left or right of the gap between the arrow pads; slide across to switch); the two right-side pedals have their own independent pointers.
  const ptr={steer:new Map(),gas:new Set(),brake:new Set()};
  const syncCtl=()=>{if(!R3)return;let d=0;for(const v of ptr.steer.values())d=v;let pIn=0;if(ptr.fly)for(const v of ptr.fly.values()){if(v.s)d=v.s;pIn=v.p;}R3.touchDir=d;R3.pitchIn=pIn;R3.gas=ptr.gas.size>0;R3.brake=ptr.brake.size>0;const fe=$("gp3Fly");if(fe){fe.classList.toggle("l",d<0);fe.classList.toggle("r",d>0);fe.classList.toggle("u",pIn>0);fe.classList.toggle("d",pIn<0);}
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
  // the flight D-pad: one thumb, press or slide. Up/down = climb/dive, left/right = steer, a diagonal does both. Only live while the car is in the air; at touchdown every thumb on it is let go, so nothing carries over to the road
  ptr.fly=new Map();{const pe=$("gp3Fly");if(pe){guard(pe);
    const dirOf=ev=>{const r=pe.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,dx=ev.clientX-cx,dy=ev.clientY-cy,di=Math.hypot(dx,dy),dead=($("gp3FlyT").getBoundingClientRect().width/2)*0.82;if(di<dead)return{s:0,p:0};const ax=dx/di,ay=dy/di;return{s:Math.abs(ax)>0.42?Math.sign(ax):0,p:Math.abs(ay)>0.42?(ay<0?1:-1):0};},
      same=(a,b)=>a&&b&&a.s===b.s&&a.p===b.p;
    pe.addEventListener("pointerdown",ev=>{ev.preventDefault();ev.stopPropagation();GPA.init();if(!R3||!R3.flyUi)return;try{pe.setPointerCapture(ev.pointerId);}catch(e){}ptr.fly.set(ev.pointerId,dirOf(ev));syncCtl();});
    pe.addEventListener("pointermove",ev=>{if(!R3||!ptr.fly.has(ev.pointerId))return;const d=dirOf(ev);if(!same(ptr.fly.get(ev.pointerId),d)){ptr.fly.set(ev.pointerId,d);syncCtl();}});
    ["pointerup","pointercancel","lostpointercapture"].forEach(t=>pe.addEventListener(t,ev=>{if(!ptr.fly.has(ev.pointerId))return;ptr.fly.delete(ev.pointerId);syncCtl();}));
    R3.flyEnd=()=>{if(!R3)return;if(!ptr.fly.size){R3.pitchIn=0;return;}for(const id of ptr.fly.keys()){try{pe.releasePointerCapture(id);}catch(e){}}ptr.fly.clear();syncCtl();};}}
  R3.flySync=()=>{const fe=$("gp3Fly");if(fe&&R3){fe.classList.toggle("l",R3.touchDir<0);fe.classList.toggle("r",R3.touchDir>0);}};
  R3.ctl=ptr;
  $("gp3Mute").addEventListener("click",ev=>{ev.preventDefault();gpToggleMute();});
  // camera + boost react to their own pointer (pointerdown/up), not "click": iOS drops the click of a tap made while the other thumb holds GAS
  const tapBtn=(el,fn,onDown)=>{if(!el)return;guard(el);let pid=null,lastT=0;const fire=()=>{const t=performance.now();if(t-lastT<250)return;lastT=t;fn();};
    el.addEventListener("pointerdown",ev=>{ev.preventDefault();ev.stopPropagation();GPA.init();pid=ev.pointerId;el.classList.add("dn");try{el.setPointerCapture(ev.pointerId);}catch(e){}if(onDown)fire();});
    el.addEventListener("pointerup",ev=>{if(ev.pointerId!==pid)return;pid=null;el.classList.remove("dn");if(!onDown)fire();});
    ["pointercancel","lostpointercapture"].forEach(t=>el.addEventListener(t,ev=>{if(ev.pointerId===pid){pid=null;el.classList.remove("dn");}}));
    el.addEventListener("click",ev=>{ev.preventDefault();if(ev.detail===0)fire();});};   // keyboard Enter/Space on the focused button
  tapBtn($("gp3Cam"),gpCycleCam,false);tapBtn($("gp3Boost"),gpBoost,true);tapBtn($("gp3Trick"),()=>gpTrick("spin",1),true);tapBtn($("gp3FlyT"),()=>gpTrick("spin",1),true);
  R3.camMode=gpCamMode();gpCamApply();gpLipsBuild();gpTrickInit();gpJetInit();if(TW&&TW.deep){R3.dp=TW.deep;R3.dp.Ca=deepCa;gpDeepInit();}
  R3.blockTouch=ev=>{if(R3&&!R3.done&&ev.cancelable)ev.preventDefault();};
  document.addEventListener("touchmove",R3.blockTouch,{passive:false});document.addEventListener("gesturestart",R3.blockTouch,{passive:false});
  R3.onVis=()=>{if(!GPA.ctx)return;if(document.hidden)GPA.ctx.suspend();else GPA.ctx.resume();};document.addEventListener("visibilitychange",R3.onVis);
  const wrapEl=$("gp3");
  R3.onResize=()=>{if(!R3)return;const w=wrapEl.clientWidth||720,h=(wrapEl.classList.contains("net")&&canvas.clientHeight>50?canvas.clientHeight:wrapEl.clientHeight)||Math.round(w*9/16);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();const pr=renderer.getPixelRatio();R3.vpW=w*pr;R3.vpH=h*pr;R3.smoke.mat.uniforms.scale.value=h*pr*0.72;R3.smoke.mat.uniforms.maxPx.value=h*pr*(R3.me&&R3.me.glb?0.5:0.08);if(R3.post)R3.post.resize(w,h,renderer.getPixelRatio());if(R3.fz)R3.fz.resize(w,h,renderer.getPixelRatio());if(R3.fx){R3.fxW=Math.max(16,Math.round(w/2));R3.fxH=Math.max(9,Math.round(h/2));R3.fx.width=R3.fxW;R3.fx.height=R3.fxH;}const ck=$("gp3Ck");if(ck){const q=Math.min(2,window.devicePixelRatio||1);ck.width=Math.round(w*q);ck.height=Math.round(h*q);}};
  R3.onOrient=()=>{[150,400,900].forEach(ms=>setTimeout(()=>{if(R3)R3.onResize();},ms));};
  window.addEventListener("resize",R3.onResize);window.addEventListener("orientationchange",R3.onOrient);if(R3.me.glb){R3.smoke.lim=0.95;R3.smoke.base=0.85;R3.smoke.cap=150;const sc=R3.sunTint||new T.Color(1,1,1),sk=R3.skyTint||new T.Color(0.8,0.82,0.9);R3.smoke.mat.uniforms.tint.value.copy(sc).multiplyScalar(1.2);R3.smoke.mat.uniforms.shade.value.copy(sk).multiplyScalar(0.97);}if(R3.C.theme==="dakar"){R3.smoke.mat.uniforms.tint.value.setRGB(0.93,0.66,0.36);R3.smoke.mat.uniforms.shade.value.setRGB(0.62,0.42,0.24);}R3.onResize();   // smoke takes the scene light: warm sun on top, sky-blue shade underneath
  GPA.under=0;GPA.startEngine();
  // the track + car line is said BEFORE the count; the count starts when that clip ends (never speaks "three, two, one")
  const voiceOn=typeof DB!=="undefined"&&DB&&DB.sound&&!(typeof _voiceUnlocked!=="undefined"&&!_voiceUnlocked);
  if(NET)gpnBuilt();
  else if(voiceOn&&typeof sayAndThen==="function")sayAndThen(C.name+". "+myCar.n+".",()=>setTimeout(gpCountStart,250),6000);
  else setTimeout(gpCountStart,1300);
  R3.raf=requestAnimationFrame(gpFrame);
  setTimeout(gpEnvCheck,1200);
}
/* safety net: if the reflection map ever blacks out the scene on some device, switch it off */
function gpEnvCheck(){try{if(!R3||!R3.scene.environment)return;R3.renderer.render(R3.scene,R3.camera);const c=R3.renderer.domElement,o=document.createElement("canvas");o.width=64;o.height=36;const x=o.getContext("2d");x.drawImage(c,0,0,64,36);const d=x.getImageData(0,27,64,9).data;let sum=0;for(let i=0;i<d.length;i+=4)sum+=d[i]+d[i+1]+d[i+2];if(sum/(d.length/4)<25){R3.scene.environment=null;window.__gp.envOff=true;}}catch(e){}}
/* ---------- camera views: chase (default) / bumper / cockpit with a digital dash; choice saved on the profile ---------- */
function gpCamApply(){if(!R3)return;const w=$("gp3");if(w)w.classList.toggle("ck",R3.camMode==="cockpit");const l=$("gp3CamL");if(l)l.textContent=GP_VIEW_NAME[R3.camMode]||"CHASE";const b=$("gp3Cam");if(b)b.setAttribute("aria-label","Camera: "+(GP_VIEW_NAME[R3.camMode]||"CHASE").toLowerCase()+" view - tap to change");}
/* ---------- BOOST (job 1105-0558) ----------
   Tap BOOST (or B / Shift) for a 2.6 s burst: x2.4 pick-up and +22% top speed, blue + orange exhaust flames, a wider FOV, streaks and a
   small camera pull. One burst costs a third of the meter; the race starts with half a meter; it refills slowly by itself and faster
   from drifting, jumps (air time) and clean fast driving. Not during the countdown; 1.2 s cool-down between bursts. Grip is NOT
   boosted, so boosting into a tight bend can still slide wide (the Easy slide assist still caps it). Rivals take an occasional
   burst (Normal +12%, Hard +16%, Easy +5%) from their own meter on a clear straight, to attack the car ahead or hold off the car behind; on Easy a rival that is already ahead of Prince never boosts. */
const GP_BOOST={burst:2.6,cost:0.34,cool:1.2,mul:1.22,start:0.5};
function gpBoostInit(){const R=R3;R.boost={q:GP_BOOST.start,cool:0,easy:gpPace()==="gentle",uses:0,ring:$("gp3BoostRing"),btn:$("gp3Boost"),pips:$("gp3BoostN"),key:""};R.boostLog=[];
  R.karts.forEach(k=>{k.boostT=0;k.boostMul=1;k.bq=GP_BOOST.start;k.bNext=k.player?0:6+Math.random()*6;});}
function gpBoost(){const R=R3;if(!R||!R.boost)return false;const B=R.boost,me=R.me;
  if(R.done||R.phase!=="race"||R.countdown>0.5||(me.boostT>0&&!(me.jet&&me.boostMul<GP_BOOST.mul))||B.cool>0||B.q<GP_BOOST.cost-1e-6){if(B.btn){B.btn.classList.remove("no");void B.btn.offsetWidth;B.btn.classList.add("no");}return false;}
  B.q-=GP_BOOST.cost;B.uses++;me.boostT=GP_BOOST.burst;me.boostMul=GP_BOOST.mul;GPA.play("boost");gpMsg("BOOST!");R.boostLog.push({t:+(R.simT||0).toFixed(2),mph:Math.round(me.speed*GP_MPH)});return true;}
function gpBoostTick(dt,waiting){const R=R3;if(!R.boost)gpBoostInit();const B=R.boost,me=R.me;
  R.karts.forEach(k=>{if(k.boostT>0){k.boostT=Math.max(0,k.boostT-dt);if(k.boostT===0&&k.player&&!k.jet)B.cool=GP_BOOST.cool;}gpFlameUpdate(k,dt);});
  if(B.cool>0)B.cool=Math.max(0,B.cool-dt);
  if(!waiting&&!R.done){const spd=me.speed/me.max,off=Math.abs(me.x)>1.05&&!me.jet;let r=B.easy?0.03:0.018;   // on its own: a full meter in ~35-55 s
    if(me.drift&&spd>0.35&&!off)r+=0.11;if(me.air)r+=0.08;if(!off&&spd>0.55&&R.bumpT>2&&!me.loss)r+=B.easy?0.03:0.02;
    if(me.boostT<=0)B.q=Math.min(1,B.q+r*dt);
    const PK=gpPK();R.karts.forEach(k=>{if(k.player||k.net)return;k.bq=Math.min(1,(k.bq==null?GP_BOOST.start:k.bq)+PK.bq*dt);if(k.boostT>0||k.jet||k.air)return;k.bNext-=dt;if(k.bNext>0||k.bq<GP_BOOST.cost)return;
      const i=Math.floor(k.t*R.M)%R.M,clear=R.vProf[(i+Math.round(40/(R.len/R.M)))%R.M]>=k.max*0.98&&R.vProf[i]>=k.max*0.98;
      if(!clear){k.bNext=0.5;return;}if(B.easy&&(k.lap+k.t)>(me.lap+me.t)){k.bNext=5;return;}
      let ah=1e9,bh=1e9;const p=k.lap+k.t;for(const o of R.karts){if(o===k)continue;const d=((o.lap+o.t)-p)*R.len;if(d>0)ah=Math.min(ah,d);else bh=Math.min(bh,-d);}
      if(!((ah>5&&ah<70)||bh<22||k.bq>0.97)){k.bNext=0.5;return;}   // attack the car ahead, hold off the car behind, or never sit on a full meter
      k.bq-=GP_BOOST.cost;k.boostT=2.2;k.boostMul=PK.bmul;k.bNext=1.5+Math.random()*2.5;(R.rivBoost=R.rivBoost||[]).push({t:+(R.simT||0).toFixed(1),why:ah<70?"attack":bh<22?"defend":"full"});});}
  const ready=!waiting&&!R.done&&R.phase==="race"&&B.q>=GP_BOOST.cost&&B.cool<=0&&me.boostT<=0,on=me.boostT>0,key=Math.round(B.q*100)+"|"+ready+"|"+on;
  if(key!==B.key&&B.btn){B.key=key;B.ring.setAttribute("stroke-dashoffset",(276.5*(1-B.q)).toFixed(1));B.btn.classList.toggle("ready",ready);B.btn.classList.toggle("on",on);
    const n=Math.floor(B.q/GP_BOOST.cost+1e-6);B.pips.textContent=n?"●".repeat(n):"○";B.btn.setAttribute("aria-label","Boost - "+n+" ready");}}
/* exhaust flames: an orange outer cone + a blue core per exhaust tip (fleet.json `exh`; [x,y,z,1] = a stack pointing up), additive,
   built the first time that car boosts, hung on the sprung body so they ride with it */
function gpFlameBuild(kt){if(kt.flm!==undefined)return kt.flm;kt.flm=null;const D=GP_GLB[kt.racer.car.id];if(!kt.glb||!D)return null;const T=R3.T;
  if(!R3.flameGeo){const g=new T.ConeGeometry(1,1,12,1,true);g.translate(0,0.5,0);g.rotateX(-Math.PI/2);R3.flameGeo=g;
    const mk=c=>{const m=new T.MeshBasicMaterial({color:c,transparent:true,opacity:0.9,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide});m.toneMapped=false;m.userData.lin=1;return m;};
    R3.flameMat=[mk(0xff6a10),mk(0x66c8ff)];R3.flameGlow=new T.SpriteMaterial({map:gpSoftDot(),color:0xff8a30,transparent:true,depthWrite:false,blending:T.AdditiveBlending});R3.flameGlow.toneMapped=false;}
  const pts=D.exh&&D.exh.length?D.exh:[[0.36,0.42,(D.tail||-2.2)+0.04],[-0.36,0.42,(D.tail||-2.2)+0.04]];
  const list=pts.map(q=>{const g=new T.Group();g.position.set(q[0],q[1],q[2]);if(q[3])g.rotation.x=Math.PI/2;
    const o=new T.Mesh(R3.flameGeo,R3.flameMat[0]),c=new T.Mesh(R3.flameGeo,R3.flameMat[1]),s=new T.Sprite(R3.flameGlow);s.scale.set(0.9,0.9,1);g.add(o);g.add(c);g.add(s);g.visible=false;kt.body.add(g);return{g,o,c,s};});
  kt.flm={list,a:0};return kt.flm;}
function gpFlameUpdate(kt,dt){const want=kt.boostT>0?1:0;if(!want&&!kt.flm)return;const F=gpFlameBuild(kt);if(!F)return;F.a+=(want-F.a)*Math.min(1,dt*(want?14:6));const vis=F.a>0.03;
  F.list.forEach(f=>{if(f.g.visible!==vis)f.g.visible=vis;if(!vis)return;const fl=0.75+Math.random()*0.5,big=kt.player&&!kt.jet&&!kt.air,L=(big?1.9:(kt.player?1.25:0.9))*F.a*fl,wd=big?0.19:0.15;f.o.scale.set(wd*F.a,wd*F.a,L);f.c.scale.set(wd*0.55*F.a,wd*0.55*F.a,L*0.6);f.s.material.opacity=0.8*F.a;{const gs=big?1.1+fl*0.5:0.9;if(kt.player)f.s.scale.set(gs,gs,1);}});}
function gpCycleCam(){if(!R3||R3.me.jet)return;const L=GP_VIEWS;R3.camMode=L[(L.indexOf(R3.camMode)+1)%L.length];R3.camLog=(R3.camLog||[]).concat([R3.camMode]);gpSetOpt("gpCam",R3.camMode);gpCamApply();gpMsg({chase:"Chase cam",far:"Far chase cam",hood:"Hood cam",bumper:"Bumper cam",cockpit:"Cockpit cam"}[R3.camMode]);sfx("tick");}
/* a few boxes merged into one geometry, [w,h,d,cx,cy,cz] */
function gpBoxesGeo(T,L){const P=[],N=[];L.forEach(b=>{const[w,h,d,cx,cy,cz]=b,x=w/2,y=h/2,z=d/2,fa=(nx,ny,nz,v)=>{v.forEach(q=>{P.push(cx+q[0]*x,cy+q[1]*y,cz+q[2]*z);N.push(nx,ny,nz);});};
  fa(0,0,1,[[-1,-1,1],[1,-1,1],[1,1,1],[-1,-1,1],[1,1,1],[-1,1,1]]);fa(0,0,-1,[[1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,-1,-1],[-1,1,-1],[1,1,-1]]);fa(1,0,0,[[1,-1,1],[1,-1,-1],[1,1,-1],[1,-1,1],[1,1,-1],[1,1,1]]);fa(-1,0,0,[[-1,-1,-1],[-1,-1,1],[-1,1,1],[-1,-1,-1],[-1,1,1],[-1,1,-1]]);fa(0,1,0,[[-1,1,1],[1,1,1],[1,1,-1],[-1,1,1],[1,1,-1],[-1,1,-1]]);});
  const g=new T.BufferGeometry();g.setAttribute("position",new T.Float32BufferAttribute(P,3));g.setAttribute("normal",new T.Float32BufferAttribute(N,3));return g;}
/* chase framing (job 1108-0900): car low and centred, horizon near 40% from the top. Upright phones sit a little further back and higher. */
function gpChaseRig(tall,car){const t=car&&car.type,h=t==="truck"?1.9:(t==="suv"?0.9:0),r=tall?{back:7.2,up:3.7,ahead:9,ly:1.15}:{back:5.2,up:2.35,ahead:13,ly:0.35};r.back+=h;r.up+=h*0.3;return r;}
/* the cockpit: roof edge + mirror, A-pillars, a carbon dash, a wheel that turns with the steering, and a digital display
   (big mph, gear, a shift-light bar, place + lap). Drawn on one 2D canvas under the touch controls. */
function gpCkBox(W,H){const u=Math.min(W,H*1.8)/100,tall=H>W,mw=u*(tall?44:23),mh=u*(tall?10:5.4),mx=tall?W/2-mw/2:W/2+u*9,my=H*(tall?0.09:0.04);return{u,tall,mx,my,mw,mh,r:u*1.5};}
function gpCkRR(x,X,Y,w,h,r){x.moveTo(X+r,Y);x.arcTo(X+w,Y,X+w,Y+h,r);x.arcTo(X+w,Y+h,X,Y+h,r);x.arcTo(X,Y+h,X,Y,r);x.arcTo(X,Y,X+w,Y,r);x.closePath();}
/* everything that doesn't move, painted once per screen size: roof + visors, pillars, dash, binnacle, mirror frame (a hole is left for the glass) */
function gpCkStatic(W,H){const c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d"),B=gpCkBox(W,H),u=B.u,t=B.tall,G=(a,b,d,e,L)=>{const g=x.createLinearGradient(a,b,d,e);L.forEach(q=>g.addColorStop(q[0],q[1]));return g;};
  // roof + sun visors
  x.fillStyle=G(0,0,0,H*0.12,[[0,"#050608"],[1,"#15171c"]]);x.beginPath();x.moveTo(0,0);x.lineTo(W,0);x.lineTo(W,H*0.055);x.quadraticCurveTo(W/2,H*(t?0.1:0.115),0,H*0.055);x.fill();
  x.fillStyle="rgba(255,255,255,.04)";x.beginPath();x.moveTo(W*0.16,H*0.055);x.quadraticCurveTo(W/2,H*(t?0.095:0.11),W*0.84,H*0.055);x.quadraticCurveTo(W/2,H*(t?0.085:0.098),W*0.16,H*0.055);x.fill();
  // A-pillars: dark with a soft inner edge
  [[0,1],[W,-1]].forEach(q=>{const e=q[0],d=q[1];x.fillStyle=G(e,0,e+d*W*0.2,0,[[0,"#090a0d"],[1,"#1b1d23"]]);x.beginPath();x.moveTo(e,0);x.lineTo(e+d*W*(t?0.055:0.075),0);x.lineTo(e+d*W*(t?0.11:0.17),H*0.06);x.lineTo(e+d*W*(t?0.06:0.06),H*0.58);x.lineTo(e,H*0.7);x.closePath();x.fill();x.strokeStyle="rgba(255,255,255,.06)";x.lineWidth=u*0.25;x.beginPath();x.moveTo(e+d*W*(t?0.11:0.17),H*0.06);x.lineTo(e+d*W*(t?0.06:0.06),H*0.58);x.stroke();});
  // dash: a soft curved top with a stitched seam and a thin light strip
  const dy=H*(t?0.72:0.73),rise=u*(t?7:9);x.fillStyle=G(0,dy-rise,0,H,[[0,"#1c1e24"],[0.35,"#121317"],[1,"#07080a"]]);x.beginPath();x.moveTo(0,H);x.lineTo(0,dy+u*2.5);x.quadraticCurveTo(W/2,dy-rise,W,dy+u*2.5);x.lineTo(W,H);x.fill();
  x.setLineDash([u*0.8,u*0.8]);x.strokeStyle="rgba(255,255,255,.12)";x.lineWidth=u*0.18;x.beginPath();x.moveTo(0,dy+u*3.4);x.quadraticCurveTo(W/2,dy-rise+u*1.4,W,dy+u*3.4);x.stroke();x.setLineDash([]);
  x.strokeStyle="rgba(0,240,255,.35)";x.lineWidth=u*0.28;x.shadowColor="rgba(0,240,255,.55)";x.shadowBlur=u*0.9;x.beginPath();x.moveTo(W*0.18,dy+u*1.2);x.quadraticCurveTo(W/2,dy-rise+u*0.2,W*0.82,dy+u*1.2);x.stroke();x.shadowBlur=0;
  // binnacle: a hood behind the wheel
  const bw=u*(t?46:36),bh=u*(t?11:10);x.fillStyle=G(0,dy-bh,0,dy+u*2,[[0,"#23252c"],[1,"#101114"]]);x.beginPath();x.moveTo(W/2-bw*0.55,dy+u*4);x.quadraticCurveTo(W/2-bw*0.6,dy-bh*0.5,W/2-bw*0.32,dy-bh*0.82);x.lineTo(W/2+bw*0.32,dy-bh*0.82);x.quadraticCurveTo(W/2+bw*0.6,dy-bh*0.5,W/2+bw*0.55,dy+u*4);x.closePath();x.fill();
  // centre vents below the dash line
  const vy=dy+u*(t?8:7.5),vw=u*11;[-1,1].forEach(d=>{const vx=W/2+d*(bw*0.75+vw*0.6)-vw/2;x.fillStyle="#08090b";x.beginPath();gpCkRR(x,vx,vy,vw,u*3.2,u*0.8);x.fill();x.strokeStyle="rgba(255,255,255,.1)";x.lineWidth=u*0.2;x.stroke();x.strokeStyle="rgba(255,255,255,.14)";for(let i=1;i<4;i++){x.beginPath();x.moveTo(vx+u*0.7,vy+i*0.8*u);x.lineTo(vx+vw-u*0.7,vy+i*0.8*u);x.stroke();}});
  // mirror: stalk, frame, thin cyan edge, clear glass (the rear view is drawn in 3D underneath)
  const M=B;x.fillStyle="#0a0b0e";x.fillRect(M.mx+M.mw/2-u*1.2,0,u*2.4,M.my+u*0.6);x.save();x.beginPath();gpCkRR(x,M.mx,M.my,M.mw,M.mh,M.r);x.lineWidth=u*1.1;x.strokeStyle="#0a0b0e";x.stroke();x.lineWidth=u*0.28;x.strokeStyle="rgba(0,240,255,.55)";x.stroke();x.clip();x.clearRect(M.mx,M.my,M.mw,M.mh);x.fillStyle="rgba(255,255,255,.07)";x.beginPath();x.moveTo(M.mx+M.mw*0.08,M.my);x.lineTo(M.mx+M.mw*0.22,M.my);x.lineTo(M.mx+M.mw*0.12,M.my+M.mh);x.lineTo(M.mx-M.mw*0.02,M.my+M.mh);x.fill();x.restore();
  return{c,dy,bw};}
/* the wheel as one sprite: flat-bottom rim, spokes, hub with the race star, buttons, gloves at 9 and 3. Drawn centred, turned as one piece every frame */
function gpCkWheel(u,R){const pad=u*7,S=Math.ceil((R+pad)*2),c=document.createElement("canvas");c.width=c.height=S;const x=c.getContext("2d"),mid=S/2,RT=R*0.82;x.translate(mid,mid);
  const rim=(w,col)=>{x.lineWidth=w;x.strokeStyle=col;x.lineJoin="round";x.lineCap="round";x.beginPath();const A=Math.PI*0.17,B=Math.PI*0.83;x.arc(0,0,R,B,Math.PI*2+A,false);x.quadraticCurveTo(0,RT+u*0.9,Math.cos(B)*R,Math.sin(B)*R);x.stroke();};
  // spokes
  const sp=(a,w)=>{x.save();x.rotate(a);const g=x.createLinearGradient(0,-w,0,w);g.addColorStop(0,"#2f323a");g.addColorStop(0.5,"#1b1d22");g.addColorStop(1,"#0f1014");x.fillStyle=g;x.beginPath();x.moveTo(R*0.2,-w*1.2);x.lineTo(R*0.98,-w*0.7);x.lineTo(R*0.98,w*0.7);x.lineTo(R*0.2,w*1.2);x.fill();x.restore();};
  sp(Math.PI*0.04,u*2.3);sp(Math.PI*0.96,u*2.3);sp(Math.PI/2,u*2.2);
  rim(u*4.4,"#101114");rim(u*3.8,"#26282e");x.globalAlpha=0.55;rim(u*0.7,"#55585f");x.globalAlpha=1;
  x.save();x.lineWidth=u*1.5;x.strokeStyle="#00F0FF";x.beginPath();x.arc(0,0,R+u*1.2,Math.PI*1.48,Math.PI*1.52);x.stroke();x.restore();   // straight-ahead marker
  // hub + race star
  const hw=u*8,hh=u*6.4;const g=x.createLinearGradient(0,-hh,0,hh);g.addColorStop(0,"#2a2d34");g.addColorStop(1,"#101114");x.fillStyle=g;x.beginPath();gpCkRR(x,-hw,-hh,hw*2,hh*2,u*2);x.fill();x.strokeStyle="rgba(255,255,255,.12)";x.lineWidth=u*0.25;x.stroke();
  x.fillStyle="#FFB800";x.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?u*1.05:u*2.5;x.lineTo(Math.cos(a)*r,Math.sin(a)*r);}x.closePath();x.fill();
  [["#00F0FF",-1],["#FF3E6C",1]].forEach(q=>{x.fillStyle=q[0];x.beginPath();x.arc(q[1]*R*0.66,-u*0.2,u*1.15,0,7);x.fill();x.strokeStyle="rgba(0,0,0,.5)";x.lineWidth=u*0.25;x.stroke();});
  // gloves on the rim at 9 and 3
  [-1,1].forEach(d=>{x.save();x.rotate(d*Math.PI*0.045);x.translate(d*R,0);x.rotate(d>0?-0.12:0.12);x.fillStyle="#1d1f25";x.beginPath();gpCkRR(x,-u*3.5,-u*4.4,u*7,u*8.8,u*2.6);x.fill();x.fillStyle="#2c2f37";for(let i=0;i<4;i++){x.beginPath();gpCkRR(x,-u*3.1+(d>0?0:u*0.2),-u*3.9+i*u*1.95,u*2.4,u*1.6,u*0.8);x.fill();}x.fillStyle="#00F0FF";x.fillRect(d>0?u*2.6:-u*3.4,-u*3.3,u*0.7,u*6.6);x.restore();});
  return{c,S};}
function gpCockpit(){const cv=$("gp3Ck");if(!cv||!R3)return;const x=cv.getContext("2d"),W=cv.width,H=cv.height,me=R3.me,R0=R3;x.clearRect(0,0,W,H);
  let L=R0.ckL;if(!L||L.W!==W||L.H!==H){L=R0.ckL={W,H,st:gpCkStatic(W,H),box:gpCkBox(W,H)};const u=L.box.u;L.R=u*(L.box.tall?26:22);L.wh=gpCkWheel(u,L.R);L.cy=H*(L.box.tall?0.82:0.895);}
  const B=L.box,u=B.u,Wh=L.wh,R=L.R,cx=W/2,cy=L.cy,rot=(me.steerIn||0)*1.4+(me.headA||0)*0.6,t=B.tall;
  x.drawImage(L.st.c,0,0);
  // forearms from the screen corners up to the wheel
  x.lineCap="round";[-1,1].forEach(d=>{const a=d*Math.PI*0.045,c=Math.cos(rot+a),s=Math.sin(rot+a),hx=cx+d*c*R,hy=cy+d*s*R,ox=cx+d*(R+u*(t?12:16)),oy=H+u*4;const g=x.createLinearGradient(ox,oy,hx,hy);g.addColorStop(0,"#0c1320");g.addColorStop(1,"#28436e");x.strokeStyle=g;x.lineWidth=u*6.4;x.beginPath();x.moveTo(ox,oy);x.lineTo(hx,hy);x.stroke();});
  // digital cluster: fixed behind the wheel, read through its top half
  const cw=u*(t?36:33),ch=u*(t?13.4:12.4),gx=cx-cw/2,gy=cy-R-ch*0.1+(t?u*2.2:u*2.8);
  x.fillStyle="#05070a";x.beginPath();gpCkRR(x,gx,gy,cw,ch,u*1.5);x.fill();x.strokeStyle="#3a3f4a";x.lineWidth=u*0.3;x.stroke();
  const mph=Math.round(Math.abs(me.speed)*GP_MPH),rf=Math.max(0,Math.min(1,me.speed/me.max)),n=16,bw=(cw-u*2.4)/n,red=R0.boost&&me.boostT>0;
  for(let i=0;i<n;i++){x.fillStyle=i/n<rf?(i<n*0.56?"#1FDE7F":(i<n*0.82?"#FFB800":"#FF3E6C")):"#1a1e26";x.fillRect(gx+u*1.2+i*bw,gy+u*1,bw-u*0.28,u*1.25);}
  x.textBaseline="middle";x.textAlign="center";x.fillStyle=red?"#00F0FF":"#fff";x.font="italic 900 "+(u*6.6).toFixed(1)+"px system-ui";x.fillText(String(mph),cx,gy+ch*0.6);
  x.font="800 "+(u*1.7).toFixed(1)+"px system-ui";x.fillStyle="#9fb0c8";x.fillText("MPH",cx,gy+ch*0.87);
  x.textAlign="left";x.fillStyle="#00F0FF";x.font="italic 900 "+(u*4.2).toFixed(1)+"px system-ui";x.fillText(String(R0.gear||1),gx+u*2,gy+ch*0.6);x.font="800 "+(u*1.5).toFixed(1)+"px system-ui";x.fillStyle="#9fb0c8";x.fillText("GEAR",gx+u*2,gy+ch*0.87);
  x.textAlign="right";x.fillStyle="#FFB800";x.font="900 "+(u*2.5).toFixed(1)+"px system-ui";x.fillText(R0.mode==="race"?"P"+R0.place:"♪"+R0.notesGot,gx+cw-u*2,gy+ch*0.5);x.fillStyle="#cfd6e6";x.font="800 "+(u*1.9).toFixed(1)+"px system-ui";x.fillText("L"+Math.min(R0.C.laps,me.lap+1)+"/"+R0.C.laps,gx+cw-u*2,gy+ch*0.74);
  if(R0.boost){const bq=Math.max(0,Math.min(1,R0.boost.q));x.fillStyle="#1a1e26";x.fillRect(gx+cw-u*9.6,gy+ch*0.89,u*7.6,u*0.8);x.fillStyle=bq>=0.33?"#00F0FF":"#3a5a64";x.fillRect(gx+cw-u*9.6,gy+ch*0.89,u*7.6*bq,u*0.8);}
  // the wheel turns on top of the cluster
  x.save();x.translate(cx,cy);x.rotate(rot);x.drawImage(Wh.c,-Wh.S/2,-Wh.S/2);x.restore();}
/* rear-view mirror (cockpit cam): the road behind rendered from the driver's head looking back into a small target every other
   frame, then drawn mirror-flipped into the glass of the cockpit mirror. Far plane 320 m + the sky drawn first keep it cheap. */
function gpMirror(){const R=R3,T=R.T,rd=R.renderer;let m=R.mir;
  if(!m){const rt=new T.WebGLRenderTarget(16,16);const mat=new T.MeshBasicMaterial({map:rt.texture,side:T.DoubleSide,depthTest:false,depthWrite:false});mat.toneMapped=false;
    const hs=new T.Scene(),q=new T.Mesh(new T.PlaneGeometry(1,1),mat);hs.add(q);
    R.scene.traverse(o=>{if(o.isLight||(o.isMesh&&!o.isInstancedMesh)||o.userData.mirror)o.layers.enable(1);});
    m=R.mir={rt,cam:new T.PerspectiveCamera(26,4,0.5,320),sky:new T.PerspectiveCamera(26,4,1,3200),hs,hc:new T.OrthographicCamera(0,1,1,0,-1,1),q,n:0,a:new T.Vector3(),b:new T.Vector3(),w:0,h:0,renders:0,calls:0};m.cam.layers.set(1);m.sky.layers.set(1);}
  const cv=rd.domElement,W=cv.width,H=cv.height,Bx=gpCkBox(W,H),u=Bx.u,pad=u*0.5;   // same box as gpCockpit draws (fractions match: both canvases fill the race)
  const fx=(Bx.mx+pad)/W,fw=(Bx.mw-2*pad)/W,fy=(Bx.my+pad)/H,fh=(Bx.mh-2*pad)/H,pw=Math.max(16,Math.min(640,Math.round(fw*W))),ph=Math.max(8,Math.min(160,Math.round(fh*H)));
  if(pw!==m.w||ph!==m.h){m.w=pw;m.h=ph;m.rt.setSize(pw,ph);m.cam.aspect=m.sky.aspect=pw/ph;m.cam.updateProjectionMatrix();m.sky.updateProjectionMatrix();}
  m.q.position.set(fx+fw/2,1-(fy+fh/2),0);m.q.scale.set(-fw,fh,1);   // negative width = a mirror image, like a real mirror
  if((m.n++)%2===0){const me=R.me;me.g.updateMatrixWorld(true);me.g.localToWorld(m.a.set(0,1.18,-0.4));me.g.localToWorld(m.b.set(0,0.9,-40));
    m.cam.position.copy(m.a);m.cam.lookAt(m.b);m.sky.position.copy(m.a);m.sky.quaternion.copy(m.cam.quaternion);
    const hid=[];R.karts.forEach(k=>{if(!k.player&&!k.g.visible&&!k.netGone){k.g.visible=true;hid.push(k);}});   // rivals behind are hidden for the main camera
    const au=rd.shadowMap.autoUpdate;rd.shadowMap.autoUpdate=false;const sp=R.sky.position.clone();R.sky.position.copy(m.a);
    rd.setRenderTarget(m.rt);rd.clear();rd.render(R.sky,m.sky);rd.clearDepth();const ac=rd.autoClear;rd.autoClear=false;const c0=rd.info.render.calls;rd.render(R.scene,m.cam);m.calls=rd.info.render.calls-c0;rd.autoClear=ac;rd.setRenderTarget(null);
    R.sky.position.copy(sp);rd.shadowMap.autoUpdate=au;hid.forEach(k=>{k.g.visible=false;});m.renders++;}
  const ac=rd.autoClear;rd.autoClear=false;rd.render(m.hs,m.hc);rd.autoClear=ac;}
function gpToggleMute(){GPA.init();GPA.setMute(!GPA.muted);if(P){P.gpMute=GPA.muted;save();}const b=$("gp3Mute");if(b)b.textContent=GPA.muted?"🔇":"🔊";}
function gpLastLap(){const e=$("gp3Last");if(!e)return;e.classList.remove("show");void e.offsetWidth;e.classList.add("show");R3.lastLapAt=R3.time;}
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
  if(R3&&!story){gpFzTach(x,S,mph,gear,rf);return;}
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
  R3.fpsT+=raw;R3.fpsN++;if(R3.fpsT>=2){R3.fps=typeof window.__gpForceFps==="number"?window.__gpForceFps:R3.fpsN/R3.fpsT;R3.fpsT=0;R3.fpsN=0;window.__gp.fps=Math.round(R3.fps);
    if(gpFxLow(R3.fps)){}else if(R3.fps<45&&!document.hidden){R3.lowT++;if(R3.lowT>=2){R3.lowT=0;if(R3.fz&&R3.fz.on&&R3.pr<=1.5&&!window.__gpFzKeep){R3.fz.on=false;window.__gp.fz=false;}else if(R3.pr>1){R3.pr=Math.max(1,R3.pr-0.25);R3.renderer.setPixelRatio(R3.pr);R3.onResize();}else if(R3.shadowsOn){R3.shadowsOn=false;R3.sun.castShadow=false;}}}else R3.lowT=0;
    window.__gp.pr=R3.pr;window.__gp.shadows=R3.shadowsOn;window.__gp.look=gpLook();}
  R3.frameN=(R3.frameN||0)+1;
  gpCountTick(now);
  if(R3.phase==="race"&&!R3.done)R3.time=now-R3.goAt-(R3.timeBonus||0);
  if(R3.online)gpnTick(now);
  gpUpdate(dt,R3.countdown>0);gpRender(dt);
  R3.raf=requestAnimationFrame(gpFrame);
}
/* crossing the start line forwards / backing over it (shared by driving and by contact nudges, so a push can never skip a lap) */
function gpLapCross(kt,before,waiting){if(waiting||kt.traffic)return;const fwdX=kt.t<before&&before-kt.t>0.5,backX=kt.t>before&&kt.t-before>0.5;
  if(backX){if(kt.lap>0)kt.lap--;else kt.started=false;}
  else if(fwdX&&!kt.started){kt.started=true;}
  else if(fwdX){kt.lap++;if(kt.player){if(kt.lap>=R3.C.laps&&!R3.done)gpFinish();else{R3.notes.forEach(n=>{n.alive=true;n.mesh.visible=true;});GPA.play("lap");if(kt.lap+1===R3.C.laps&&R3.online)gpLastLap();else gpMsg(kt.lap+1===R3.C.laps?"Final lap":"Lap "+(kt.lap+1));}}}}
/* ---------- grip limit (Prince's car) ----------
   Every corner has a safe speed: lateral load v^2/R over the tyres' grip (ratio r). Kid-fair, progressive:
   r > 0.88  the tyres squeal and puff a little smoke (a warning, nothing else);
   r > 1     the front washes out: the car runs wide toward the outside and scrubs speed (lift or brake and it tucks back in);
   r > 1.32  for ~0.12 s (and not drifting): the rear steps out. Easy keeps it a slide (~25-37 deg) with a gentle assist;
             Normal swings wider (~34-52 deg, it used to be a half-spin of up to ~150 deg, which read as "the car turns round at every wall").
             Either way the car pivots back straight in ~1.1-1.7 s at about half speed - never a dead stop, never a reset, never backwards.
             Braking during the slide gathers it up faster; touching a wall ends the slide (gpWallHit).
   The drift button is unchanged: a held drift has 1.6x grip, so a controlled slide stays below the limit. */
function gpGrip(kt,kap,r,ex,spd,dt,brake){const easy=gpPace()==="gentle",sg=Math.sign(kap)||1;
  kt.squeal=kt.drift?0:Math.max(0,Math.min(1,(r-0.88)/0.2));
  kt.x+=sg*(ex*2.1+0.12*spd*Math.min(1,r))*dt;if(ex>0)kt.speed=Math.max(0,kt.speed-ex*8*dt);
  if(kt.loss){const L=kt.loss;L.t+=dt*(brake?1.45:1);const u=Math.min(1,L.t/L.dur);
    const a=u<0.28?1-Math.pow(1-u/0.28,2):(u<0.45?1:0.5+0.5*Math.cos(Math.PI*(u-0.45)/0.55));   // swing out fast, hold, pivot back
    kt.lossA=L.dir*L.peak*a;kt.speed+=(L.v0*(easy?0.62:0.5)-kt.speed)*Math.min(1,dt*(u<0.6?2.6:0.6));kt.x+=L.side*0.35*(1-u)*dt;
    if(u>=1){kt.loss=null;kt.lossA=0;kt.lossCool=1.2;}return;}
  if(!kt.drift&&r>(easy?1.45:1.32)&&kt.lossCool<=0&&spd>0.35){kt.overT+=dt;if(kt.overT>0.12){const sev=Math.min(1,(r-1.32)/0.6);
      kt.loss={t:0,dur:easy?1.1+0.2*sev:1.2+0.5*sev,peak:easy?0.45+0.2*sev:0.6+0.3*sev,dir:-sg,side:sg,v0:kt.speed,r:+r.toFixed(2)};kt.overT=0;kt.drift=0;
      const lg=R3.lossLog||(R3.lossLog=[]);lg.push({f:R3.frameN,t:+(R3.simT||0).toFixed(2),pace:easy?"easy":"normal",ratio:kt.loss.r,peakDeg:Math.round(kt.loss.peak*57.3),dur:+kt.loss.dur.toFixed(2),kmh:Math.round(kt.speed*3.6)});
      GPA.play("spin");R3.sk.clean=0;gpChainBreak();gpMsg("Whoa, slide! Brake before the bend");}}
  else kt.overT=0;}
/* ---------- the wall (Prince's car): he always keeps racing the way the road goes ----------
   hit angle = the steeper of "where the car is going" (sideways speed vs speed along the road) and "where its nose points".
   Glancing (< 40 deg): a scrape - the sideways speed dies, the nose eases parallel to the wall, 2-6% speed loss, a stream of sparks.
   Head-on (>= 40 deg): a soft bounce back a little, speed cut to about 60%, the nose straight along the road in < 1 s.
   Either way any slide in progress ends here: the wall can never be what swings a car round. kt.wallRec = recovering (fast heading
   spring + quick gas), kt.hitLog for the tests. Sparks are real only where a barrier is; on open sand it kicks up dust instead. */
function gpWallHit(kt,sd,vOut,dt,inp){const XS=R3.W-1.2,V=R3.tmpV,vF=Math.max(0,kt.speed),vL=vOut*XS,nose=(kt.headA+(kt.lossA||0))*sd,ang=Math.max(Math.atan2(Math.max(0,vL),Math.max(1,vF)),nose,0),fresh=kt.wallT<=0&&vOut>0.08;
  if(kt.sv*sd>0)kt.sv=0;
  if(kt.loss&&!fresh){kt.headA=Math.max(-0.5,Math.min(0.5,kt.headA+(kt.lossA||0)));kt.headV=0;kt.loss=null;kt.lossA=0;kt.lossCool=1.5;kt.wallRec=Math.max(kt.wallRec||0,0.45);}   // a slide that reaches the rail without a real impact ends there too
  if(fresh){kt.lossCool=Math.max(kt.lossCool||0,1.5);const head=ang>=0.7,deg=Math.round(ang*57.3),v0=kt.speed;kt.drift=0;kt.wallT=0.35;kt.knock=Math.min(1,0.35+vOut);
    kt.loss=null;kt.headA=kt.headA+(kt.lossA||0);kt.lossA=0;   // the slide stops at the wall; the spring below brings the nose back from where it is
    kt.headA=Math.max(-0.5,Math.min(0.5,kt.headA));kt.headV=0;
    if(head){kt.speed=Math.max(Math.min(kt.speed,5),kt.speed*0.6);kt.sv=-sd*Math.min(0.42,0.12+vOut*0.12);kt.wallRec=0.9;GPA.play("bump");R3.shake=Math.max(R3.shake,0.22);}
    else{kt.speed*=1-Math.min(0.06,0.02+ang*0.1);kt.sv=-sd*Math.min(0.1,0.03+vOut*0.05);kt.wallRec=Math.max(kt.wallRec||0,0.45);if(vOut>0.3)GPA.play("bump");}
    R3.hitT=R3.simT||0;R3.sk.clean=0;
    const lg=R3.hitLog||(R3.hitLog=[]);lg.push({t:+(R3.simT||0).toFixed(2),deg,kind:head?"head-on":"scrape",v0:Math.round(v0*3.6),v1:Math.round(kt.speed*3.6)});
    gpWallFx(kt,sd,head?16:9);}
  else if(kt.speed>6&&(inp===sd||Math.abs(kt.steerIn)>0.3&&kt.steerIn*sd>0)){   // still leaning on it: scrape along, a light drag, sparks trail
    kt.speed*=1-0.14*dt;kt.headA*=Math.exp(-5*dt);kt.scr=(kt.scr||0)+dt*26;if(kt.scr>=1){gpWallFx(kt,sd,Math.floor(kt.scr));kt.scr=0;}}}
function gpWallFx(kt,sd,n){const V=R3.tmpV,R=R3,tn=R.curve.getTangentAt(kt.t),sandy=gpSandy(R.C);kt.g.updateMatrixWorld(true);V.set(sd*-(kt.S.w/2),0.35,0.4);kt.g.localToWorld(V);
  for(let q=0;q<n;q++){if(sandy)R.dust.emit(V.x,V.y,V.z,tn.x*kt.speed*0.3+(Math.random()-0.5)*3,0.8+Math.random()*1.6,tn.z*kt.speed*0.3+(Math.random()-0.5)*3,0.8,0.66,0.46,1.0);
    else R.sparks.emit(V.x,V.y,V.z,tn.x*kt.speed*0.55+(Math.random()-0.5)*4,1+Math.random()*2.5,tn.z*kt.speed*0.55+(Math.random()-0.5)*4,1,0.75,0.3,0.35);}}
/* ---------- the pack: real racing (jobs 1109-1803 / 1109-1919) ----------
   Normal and Hard: NO help of any kind. Rivals never ease off when they lead (ahead 0), never get pushed when they trail (behind 0), and Prince gets no
   top-speed or pick-up bonus (me 0, hit 0). Rivals race on their own pace (skill), all in cars within a few percent of the player's top speed (capLo..cap),
   carry a real boost meter (bq = refill per second, bmul = burst) that they spend to attack or defend, cover the inside once when a car closes from behind (def),
   and now and then make a driver's mistake (err = average seconds between them).
   Easy keeps a small, quiet version of the old help so a young driver still finishes near the front: rivals further ahead than 15 m ease off up to 2%, rivals
   further behind push up to 4%, and Prince, when more than 12 m behind the leader, gets up to +3.5% (plus 3% for a few seconds after a wall hit or a slide);
   nothing once he leads. Grip is never touched, so corners stay his to get right. */
const GP_PACK={gentle:{ahead:0.02,behind:0.04,me:0.035,hit:0.03,skill:1.015,cap:0.97,capLo:0.9,err:24,bq:0.016,bmul:1.05,def:0},
  normal:{ahead:0,behind:0,me:0,hit:0,skill:1.03,cap:1.03,capLo:0.97,err:45,bq:0.03,bmul:1.12,def:0.7},
  hard:{ahead:0,behind:0,me:0,hit:0,skill:1.04,cap:1.05,capLo:0.99,err:90,bq:0.04,bmul:1.16,def:1}};
function gpPK(){return GP_PACK[gpPace()]||GP_PACK.normal;}
/* rival pace per track (1 = as built): measured with the test drivers so a clean lap beats the best rival by about the same margin on every track
   (flight ramps help the player, town corners and the sea help the rivals, so one number for all tracks left some unwinnable and some a walkover) */
const GP_RIVK={kawaguchi:[1.05,0.982],hakone:[1.03,0.914],tokyo:[1.05,0.995],city:[1.045,0.915],accra:[1.02,1.04],coast:[1.085,1.018],desert:[1.09,1.08],inaka:[1.045,1.007],dakar:[1.072,1.01],deep:[1.0,0.95]};   // [Easy, Normal+Hard]
function gpRivK(id){const k=GP_RIVK[id];return k?k[gpPace()==="gentle"?0:1]:1;}
function gpBand(kt){const R=R3,me=R.me,K=GP_PACK[gpPace()]||GP_PACK.normal,g=((kt.lap+kt.t)-(me.lap+me.t))*R.len,u=Math.min(1,Math.max(0,(Math.abs(g)-15)/115)),e=u*u*(3-2*u);return g>0?1-K.ahead*e:1+(K.behind+(me.jet?GP_JET.pull[gpPace()==="gentle"?"gentle":"normal"]:0))*e;}
function gpPack(dt,waiting){const R=R3,me=R.me;if(R.online&&!waiting&&R.mode==="race"&&!R.done){me.cu=gpnCatchUp(dt);return;}if(waiting||R.mode!=="race"||R.done||R.online){me.cu=0;return;}const K=GP_PACK[gpPace()]||GP_PACK.normal;let top=-1e9;for(const k of R.karts)if(!k.player)top=Math.max(top,k.lap+k.t);
  const gap=top<-1e8?0:(top-(me.lap+me.t))*R.len,u=Math.min(1,Math.max(0,(gap-12)/138));R.recB=me.loss||me.wobT>0||me.wallRec>0.5?1:Math.max(0,(R.recB||0)-dt/4);
  const want=gap>0?K.me*u+K.hit*R.recB:0;me.cu=(me.cu||0)+(want-(me.cu||0))*Math.min(1,dt*(want>(me.cu||0)?1.5:0.8));R.packLog&&R.packLog.push(+me.cu.toFixed(3));}
/* ---------- tricks in the air ----------
   One at a time, 0.6 s each, chained if there is air left. Swipe left/right on the race view = barrel roll, swipe up = flip, TRICK button or T = 360 spin,
   arrow keys while airborne = the same moves. A landing with every trick done, or nearly done (window: Normal the last 28% of the turn, Easy the last 50%),
   is CLEAN: +NITRO, the BOOST gauge fills (one trick 35%, two 80%, three or more 100%), a cheer. A landing mid-trick is messy: the car rights itself, wobbles
   and slows for about a second, with no nitro, no spin and no crash. Rivals do the odd simple trick; it is only for show. */
const GP_TRICK={dur:0.6,name:{roll:"BARREL ROLL!",flip:"FLIP!",spin:"360 SPIN!"},nitro:[0,0.35,0.8,1],win:{normal:0.72,gentle:0.5}};
function gpTrickInit(){const R=R3;R.tk={btn:$("gp3Trick"),pop:$("gp3Nitro"),on:false,fill:0,log:[],count:0,next:null,swipe:new Map()};
  const g=$("gp3");if(!g)return;   // swipes anywhere on the race view (pedals and buttons keep their own fingers); capture phase, because the steering zone captures its pointer
  const isCtl=t=>t&&t.closest&&t.closest(".fz-pedal,.fz-boost,.fz-cam,.fz-trick,.fz-btn,.fz-fly");
  const dn=e=>{if(isCtl(e.target)||!R3||!R3.tk)return;R3.tk.swipe.set(e.pointerId,{x:e.clientX,y:e.clientY,t:e.timeStamp,st:!!(e.target&&e.target.id==="gp3L")});};
  const mv=e=>{const K=R3&&R3.tk;if(!K)return;const p=K.swipe.get(e.pointerId);if(!p)return;const now=e.timeStamp,dx=e.clientX-p.x,dy=e.clientY-p.y,fly=R3.me.air&&!(R3.me.jet&&p.st);   /* in a jet the steering thumb slides a lot: only the other side of the screen swipes */
    if(!fly||now-p.t>(R3.me.jet?800:420)){p.x=e.clientX;p.y=e.clientY;p.t=now;return;}
    const ax=Math.abs(dx),ay=Math.abs(dy);if(Math.max(ax,ay)<26)return;let ok=false;if(ax>=ay)ok=gpTrick("roll",dx<0?-1:1);else if(dy<0)ok=gpTrick("flip",1);p.x=e.clientX;p.y=e.clientY;p.t=now;void ok;};
  const up=e=>{const K=R3&&R3.tk;if(K)K.swipe.delete(e.pointerId);};
  g.addEventListener("pointerdown",dn,true);g.addEventListener("pointermove",mv,true);["pointerup","pointercancel"].forEach(t=>g.addEventListener(t,up,true));}
function gpAirLeft(kt){if(kt.jet)return gpJetAirLeft(kt);const h=Math.max(0,kt.y-(kt.ry||0)),v=kt.vy||0;return(v+Math.sqrt(v*v+2*GP_G*h))/GP_G;}   // flat-road estimate of the flight still to come
function gpTrick(kind,dir){const R=R3;if(!R||!R.me||R.done||R.phase!=="race")return false;const me=R.me,K=R.tk;if(!K||!me.air)return false;if(me.jet&&kind==="spin")kind="roll";
  if(me.trick){if(me.trick.t>me.trick.dur*0.55&&!K.next){K.next={kind,dir};return true;}return false;}
  if(gpAirLeft(me)<(me.jet?GP_JET.trickDur[kind]+0.05:0.14))return false;   // too late to even start one: ignore it, so a stray swipe just before the wheels touch does no harm
  gpTrickStart(me,kind,dir);return true;}
function gpTrickStart(kt,kind,dir){kt.trick={k:kind,d:dir||1,t:0,dur:kt.jet&&kt.player?GP_JET.trickDur[kind]:GP_TRICK.dur};if(kt.player){const K=R3.tk;K.count=K.count||0;GPA.play("trick");K.btn&&K.btn.classList.add("spin");gpTrickPop("t",kt.jet&&kind==="flip"?"LOOP!":GP_TRICK.name[kind],"");K.log.push({t:+(R3.simT||0).toFixed(2),k:kind,air:+kt.airT.toFixed(2)});}}
function gpTrickPop(cls,big,small){const e=R3.tk&&R3.tk.pop;if(!e)return;e.className="fz-nitro "+cls;e.innerHTML='<b>'+big+'</b>'+(small?'<small>'+small+'</small>':'');void e.offsetWidth;e.classList.add("on");}
/* each frame: run the trick clock, show the button only in the air, spin the body */
function gpTrickTick(kt,dt){const T0=kt.trick;
  if(T0){T0.t+=dt;if(T0.t>=T0.dur){kt.trick=null;kt.trickDone=(kt.trickDone||0)+1;if(kt.player){const K=R3.tk;K.btn&&K.btn.classList.remove("spin");if(K.next&&kt.air&&gpAirLeft(kt)>(kt.jet?GP_JET.trickDur[K.next.k]+0.05:0.14)){const n=K.next;K.next=null;gpTrickStart(kt,n.k,n.d);}else K.next=null;}}}
  if(kt.tkRe){kt.tkRe.t+=dt;if(kt.tkRe.t>=kt.tkRe.dur)kt.tkRe=null;}
  if(kt.wobT>0){kt.wobT=Math.max(0,kt.wobT-dt);}}
function gpTrickAngle(kt){let a=0,k=null;const Tr=kt.trick;if(Tr){const u=Math.min(1,Tr.t/Tr.dur),e=u<0.5?2*u*u:1-2*(1-u)*(1-u);a=e*Math.PI*2*Tr.d;k=Tr.k;}else if(kt.tkRe){const u=Math.min(1,kt.tkRe.t/kt.tkRe.dur),e=1-(1-u)*(1-u);a=kt.tkRe.a0+(kt.tkRe.a1-kt.tkRe.a0)*e;k=kt.tkRe.k;}return{a,k};}
function gpTrickPose(kt){const P0=gpTrickAngle(kt);let lift=0;if(P0.k==="roll")kt.body.rotation.z+=P0.a;else if(P0.k==="flip")kt.body.rotation.x-=P0.a;else if(P0.k==="spin")kt.body.rotation.y=P0.a;else kt.body.rotation.y=0;
  if(P0.k&&kt.air)lift=Math.abs(Math.sin(P0.a/2))*0.55;kt.tkLift=lift;
  if(kt.wobT>0){const w=kt.wobT;kt.body.rotation.z+=Math.sin(w*19)*0.13*Math.min(1,w*1.4);kt.body.rotation.x+=Math.sin(w*13+1)*0.05*Math.min(1,w*1.4);}}
function gpTrickLand(kt){const Tr=kt.trick,done=kt.trickDone||0;kt.trickDone=0;
  if(!kt.player){if(Tr){const a=gpTrickAngle(kt);kt.tkRe={k:Tr.k,a0:a.a,a1:Math.round(a.a/(Math.PI*2))*Math.PI*2,t:0,dur:0.14};kt.trick=null;}return;}
  const R=R3,K=R.tk,easy=gpPace()==="gentle",u=Tr?Tr.t/Tr.dur:1;if(K){K.next=null;K.btn&&K.btn.classList.remove("spin");}
  if(!Tr&&!done)return;   // a plain jump: nothing to judge
  const a=gpTrickAngle(kt),cl=!Tr||u>=(easy?GP_TRICK.win.gentle:GP_TRICK.win.normal);
  if(Tr){const m=Math.round(a.a/(Math.PI*2));kt.tkRe={k:Tr.k,a0:a.a,a1:(cl?(Tr.d>0?Math.PI*2:-Math.PI*2):m*Math.PI*2),t:0,dur:cl?0.1:0.26};kt.trick=null;}
  const n=done+(Tr&&cl?1:0),lg=K.landLog||(K.landLog=[]);
  if(cl){const add=GP_TRICK.nitro[Math.min(3,n)];K.fill=Math.min(1,(K.fill||0)+add);GPA.play("cheer");gpTrickPop("",n>1?"COMBO! +NITRO":"+NITRO","+"+Math.round(add*100)+"% BOOST");gpSkill("Clean trick",n*400,true);lg.push({t:+(R.simT||0).toFixed(2),clean:true,n,add,q0:R.boost?+R.boost.q.toFixed(2):null});}
  else{kt.wobT=1.05;kt.speed*=0.86;kt.lossCool=Math.max(kt.lossCool||0,1.4);kt.drift=0;GPA.play("wobble");gpTrickPop("m","WOBBLY!","Finish the trick first");lg.push({t:+(R.simT||0).toFixed(2),clean:false,n:done,u:+u.toFixed(2)});}}
function gpRivalTrick(kt,vy){if(kt.player||vy<6.5||Math.random()>0.3)return;const flight=2*vy/GP_G;if(flight<0.85)return;gpTrickStart(kt,Math.random()<0.6?"roll":"spin",Math.random()<0.5?-1:1);}
/* HUD part, once a frame: the button only in the air; nitro pours into the gauge over ~0.5 s */
function gpTrickHud(dt){const R=R3,K=R.tk;if(!K)return;const me=R.me,show=!!me.air&&!R.done&&R.phase==="race"&&(me.trick||(me.airT>=0.03&&gpAirLeft(me)>=(me.jet?0.85:0.14)));
  if(show!==K.on){K.on=show;if(K.btn){K.btn.classList.toggle("on",show);if(!show)K.btn.classList.remove("spin","dn");}}
  {const ft=K.ft||(K.ft=$("gp3FlyT"));if(ft){ft.classList.toggle("on",show);ft.classList.toggle("spin",!!me.trick);}}
  if(K.fill>0&&R.boost){const B=R.boost,d=Math.min(K.fill,dt*1.5);K.fill-=d;B.q=Math.min(1,B.q+d);if(B.btn&&!B.btn.classList.contains("fill"))B.btn.classList.add("fill");if(K.fill<=1e-4||B.q>=1){K.fill=0;K._hold=0.35;}}
  else if(K._hold>0){K._hold-=dt;if(K._hold<=0&&R.boost&&R.boost.btn)R.boost.btn.classList.remove("fill");}}
/* ---------- JET MODE (Eb 2026-11-05) ----------
   A MEGA ramp at speed (or the rare golden WINGS pickup on a long straight) gives the car wings, tail fins and twin afterburners for one flight.
   The flight lives in the ROAD'S frame: t (how far along the lap), x (how far across) and h (height above a "sky floor" worked out from the real scenery).
   So a flight always follows the route, can never leave it for good, and a landing is simply x, h and the nose all easing back to the road.
   Phases: fly (fuel counts down; steer = bank + yaw, UP/DOWN = pitch, BOOST = afterburner, TRICK/swipes = barrel roll + loop; hands off = level flight)
   -> land (fuel out, or BRAKE: wings fold, a glide onto the road AHEAD: never off it, never into a wall, never backwards, speed kept down to what the next bends allow).
   Rivals fly the same gates with their own lines and misses (first car through a gate takes its full worth, the next ones half). Easy: more fuel, bigger rings, autopilot towards the next ring, a softer bump in the air. */
const GP_JET={out:0.3,fuel:{normal:7,gentle:9.5},h0:7,hMax:26,xArrow:24,xSoft:28,xHard:36,rings:{normal:10,gentle:12},ringR:{normal:5.8,gentle:8},ringGap:0.62,
  climb:11,minSpeed:24,cruise:{normal:1.04,gentle:1.04},cruiseMin:0.48,cruiseK:1.0,ringQ:0.035,ringMs:200,sgAdd:0.03,sgMax:0.09,sgFade:0.05,aiHit:{normal:0.74,gentle:0.45},aiV:{hard:0.99,normal:0.97,gentle:0.92},aiSg:{normal:0.45,gentle:0.3},landQ:[0.1,0.25],hopT:[2.6,3.4],hopH:[7,12],pull:{normal:0.24,gentle:0.26},trickDur:{roll:0.78,flip:1.15,spin:0.78}};
/* the sky floor: the highest solid thing near the road at every sample, from the real scene (buildings, trees, hills, tunnels, gantries), so a flight clears all of it on every track */
function gpJetFloor(){const R=R3,T=R.T,M=R.M,S=R.samples,ds=R.len/M,t0=performance.now(),CELL=8,key=(x,z)=>Math.floor(x/CELL)*200003+Math.floor(z/CELL),top=new Map(),corr=new Set(),st=Math.max(1,Math.round(5/ds));
  for(let i=0;i<M;i+=st){const s=S[i];for(let d=-44;d<=44;d+=6)corr.add(key(s.pos.x+s.nor.x*d,s.pos.z+s.nor.z*d));}
  const mark=(x,z,y)=>{const k=key(x,z);if(!corr.has(k))return;const o=top.get(k);if(o===undefined||y>o)top.set(k,y);};
  const skip=new Set([R.sky,R.band,R.glare,R.water].filter(Boolean)),A=new T.Vector3(),B=new T.Vector3(),C=new T.Vector3(),m4=new T.Matrix4(),im=new T.Matrix4(),box=new T.Box3();R.scene.updateMatrixWorld(true);
  const walk=o=>{if(skip.has(o)||R.karts.some(k=>k.g===o))return;if(o.isMesh&&o.visible!==false&&o.geometry&&o.geometry.attributes.position){const mat=Array.isArray(o.material)?o.material[0]:o.material;
      if(!(mat&&((mat.transparent&&!mat.depthWrite)||mat.side===T.BackSide))){const g=o.geometry,P=g.attributes.position;
        if(o.isInstancedMesh){if(!g.boundingBox)g.computeBoundingBox();const b=g.boundingBox;for(let n=0;n<o.count;n++){o.getMatrixAt(n,im);m4.multiplyMatrices(o.matrixWorld,im);box.copy(b).applyMatrix4(m4);if(box.max.y>box.min.y+900)continue;
            const nx=Math.min(10,Math.ceil((box.max.x-box.min.x)/CELL)),nz=Math.min(10,Math.ceil((box.max.z-box.min.z)/CELL));for(let a=0;a<=nx;a++)for(let c=0;c<=nz;c++)mark(box.min.x+(box.max.x-box.min.x)*a/nx,box.min.z+(box.max.z-box.min.z)*c/nz,box.max.y);}}
        else{const I=g.index,nT=I?I.count/3:P.count/3,e=o.matrixWorld;for(let n=0;n<nT;n++){const a=I?I.getX(n*3):n*3,b=I?I.getX(n*3+1):n*3+1,c=I?I.getX(n*3+2):n*3+2;A.fromBufferAttribute(P,a).applyMatrix4(e);B.fromBufferAttribute(P,b).applyMatrix4(e);C.fromBufferAttribute(P,c).applyMatrix4(e);
            const y=Math.max(A.y,B.y,C.y);if(y>900)continue;const L=Math.max(Math.abs(A.x-B.x),Math.abs(A.z-B.z),Math.abs(A.x-C.x),Math.abs(A.z-C.z),Math.abs(B.x-C.x),Math.abs(B.z-C.z));
            if(L<CELL){mark(A.x,A.z,y);continue;}const q=Math.min(14,Math.ceil(L/CELL));for(let u=0;u<=q;u++)for(let v=0;v<=q-u;v++){const w=q-u-v;mark((A.x*u+B.x*v+C.x*w)/q,(A.z*u+B.z*v+C.z*w)/q,y);}}}}}
    if(o.children)o.children.forEach(walk);};walk(R.scene);
  const at=(i,d)=>{const s=S[i],v=top.get(key(s.pos.x+s.nor.x*d,s.pos.z+s.nor.z*d));return v===undefined?-1e9:v;};
  let F=new Float32Array(M),raw=new Float32Array(M);for(let i=0;i<M;i++){let v=S[i].pos.y+9;for(let d=-12;d<=12;d+=6){const q=at(i,d);if(q+5>v)v=q+5;}raw[i]=v;}
  {const r=Math.max(1,Math.round(36/ds));const dq=[];const O=new Float32Array(M);for(let k=-r;k<M+r;k++){const i=((k%M)+M)%M;while(dq.length&&dq[dq.length-1][1]<=raw[i])dq.pop();dq.push([k,raw[i]]);while(dq[0][0]<k-2*r)dq.shift();if(k-r>=0&&k-r<M)O[k-r]=dq[0][1];}F=O;}
  const dy=0.26*ds;for(let pass=0;pass<2;pass++){for(let i=1;i<M*2;i++){const a=i%M,b=(i-1)%M;if(F[a]<F[b]-dy)F[a]=F[b]-dy;}for(let i=M*2;i>0;i--){const a=i%M,b=(i+1)%M;if(F[a]<F[b]-dy)F[a]=F[b]-dy;}}
  const lim=[new Float32Array(M),new Float32Array(M)];for(let i=0;i<M;i++)[-1,1].forEach((sd,q)=>{let L=GP_JET.xHard;for(let d=18;d<=42;d+=6){if(at(i,sd*d)>F[i]-1){L=Math.max(R.W*0.85,d-9);break;}}lim[q][i]=L;});
  lim.forEach((a,q)=>{const r=Math.max(1,Math.round(70/ds)),O=new Float32Array(M);for(let i=0;i<M;i++)O[i]=a[i];for(let pass=0;pass<Math.ceil(r/12);pass++){const P0=O.slice();for(let i=0;i<M;i++)O[i]=Math.min(P0[i],P0[(i+12)%M],P0[(i-12+M)%M]);}lim[q]=O;});
  const low=new Uint8Array(M);for(let i=0;i<M;i++){if(R.tw&&R.tw.zoneAt&&(R.tw.zoneAt(i,"tunnel")||R.tw.zoneAt(i,"arch")))low[i]=1;}
  (R.C.zones?["tunnel","arch"]:[]).forEach(n=>(R.C.zones[n]||[]).forEach(([a,b])=>{const ia=Math.floor(a*M),ib=Math.ceil((b<a?b+1:b)*M);for(let i=ia;i<=ib;i++)low[i%M]=1;}));
  R.jetF=F;R.jetLim=lim;R.jetLow=low;R.jetFloorMs=Math.round(performance.now()-t0);}
function gpJetF(t){const R=R3,M=R.M,f=((t%1)+1)%1*M,i=Math.floor(f)%M,u=f-Math.floor(f);return R.jetF[i]+(R.jetF[(i+1)%M]-R.jetF[i])*u;}
/* wings, tail fins and nozzles, sized from the car's own box so they fit a kei car and a semi alike; hung on the sprung body */
function gpJetParts(T){const R=R3;if(R.jetGeo)return R.jetGeo;
  const ext=(pts,dep)=>{const s=new T.Shape();pts.forEach((p,i)=>i?s.lineTo(p[0],p[1]):s.moveTo(p[0],p[1]));s.closePath();const g=new T.ExtrudeGeometry(s,{depth:dep,bevelEnabled:false,steps:1});g.translate(0,0,-dep/2);return g;};
  // a stubby swept toy wing: span along +x, chord along z, thickness along y
  const wing=ext([[0,0.55],[0.72,-0.02],[1,-0.2],[1,-0.58],[0.62,-0.42],[0,-0.62]],0.075);wing.rotateX(Math.PI/2);wing.computeVertexNormals();
  const edge=ext([[0,0.62],[0.74,0.03],[1.03,-0.17],[1,-0.2],[0.72,-0.02],[0,0.55]],0.09);edge.rotateX(Math.PI/2);edge.computeVertexNormals();
  const tip=ext([[-0.2,0],[-0.58,0],[-0.74,0.36],[-0.52,0.36]],0.05);tip.rotateY(-Math.PI/2);tip.translate(1,0,0);tip.computeVertexNormals();
  const fin=ext([[-0.5,0],[-0.72,1],[-0.28,1],[0.42,0]],0.09);fin.rotateY(-Math.PI/2);fin.computeVertexNormals();
  const noz=new T.CylinderGeometry(1,0.82,1,14,1,true).rotateX(Math.PI/2);const cap=new T.CircleGeometry(0.82,14).rotateY(Math.PI).translate(0,0,-0.5);
  const flame=new T.ConeGeometry(1,1,10,1,true);flame.translate(0,0.5,0);flame.rotateX(-Math.PI/2);
  const add=(c,o)=>{const m=new T.MeshBasicMaterial({color:c,transparent:true,opacity:o||0.92,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide});m.toneMapped=false;m.userData.lin=1;return m;};
  const trim=new T.MeshBasicMaterial({color:0x00f0ff});trim.toneMapped=false;trim.userData.lin=1;const dark=new T.MeshStandardMaterial({color:0x20222a,metalness:0.6,roughness:0.45,side:T.DoubleSide});dark.userData.lin=1;const glow=new T.MeshBasicMaterial({color:0xff7a2a});glow.toneMapped=false;glow.userData.lin=1;
  R.jetGeo={wing,edge,tip,fin,noz,cap,flame,trim,dark,glow,fo:add(0xff5a14),fc:add(0x7fe8ff),spr:new T.SpriteMaterial({map:gpSoftDot(),color:0xff8a30,transparent:true,depthWrite:false,blending:T.AdditiveBlending})};R.jetGeo.spr.toneMapped=false;R.jetGeo.spr.userData.lin=1;return R.jetGeo;}
function gpJetBox(kt){const T=R3.T,b=new T.Box3(),q=new T.Box3(),inv=new T.Matrix4(),m=new T.Matrix4();kt.g.updateMatrixWorld(true);inv.copy(kt.g.matrixWorld).invert();const sh=kt.shadows||[];
  kt.body.traverse(o=>{if(!o.isMesh||!o.geometry||o.isSprite||sh.includes(o))return;const mt=o.material;if(mt&&mt.transparent&&mt.depthWrite===false)return;if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();m.multiplyMatrices(inv,o.matrixWorld);q.copy(o.geometry.boundingBox).applyMatrix4(m);b.union(q);});
  if(b.isEmpty()){const S=kt.S;b.min.set(-S.w/2,0.1,-S.len/2);b.max.set(S.w/2,1.2,S.len/2);}return b;}
function gpJetGear(kt){if(kt.jg)return kt.jg;const T=R3.T,G=gpJetParts(T),b=gpJetBox(kt),w=b.max.x-b.min.x,h=b.max.y-b.min.y,L=b.max.z-b.min.z,paint=(()=>{const c=kt.bodyMat&&kt.bodyMat.color;if(!c)return G.dark;const m=new T.MeshStandardMaterial({color:c.clone(),roughness:0.62,metalness:0.05});m.userData.lin=1;return m;})();
  const span=Math.min(3.6,Math.max(1.9,w*1.2)),ch=Math.min(3.1,Math.max(1.9,L*0.42)),yW=b.min.y+h*Math.min(0.5,0.72/Math.max(0.6,h)+0.14),zW=b.min.z+L*0.46,g=new T.Group();
  const side=sd=>{const p=new T.Group();p.position.set(sd*w*0.42,yW,zW);p.scale.set(sd*span,ch,ch);const a=new T.Mesh(G.wing,paint),e=new T.Mesh(G.edge,G.trim),tp=new T.Mesh(G.tip,paint);p.add(a);p.add(e);p.add(tp);const tipO=new T.Object3D();tipO.position.set(1.08,0.05,-0.3);p.add(tipO);g.add(p);p.userData.sd=sd;p.userData.tip=tipO;return p;};
  const wl=side(1),wr=side(-1),fh=Math.min(1.5,Math.max(0.72,h*0.5)),fy=b.min.y+h*0.62,fz=b.min.z+L*0.17;
  const fins=[1,-1].map(sd=>{const f=new T.Mesh(G.fin,paint);f.position.set(sd*w*0.3,fy,fz);f.rotation.z=-sd*0.42;f.scale.set(1,fh,Math.min(1.7,L*0.32));g.add(f);return f;});
  const rn=Math.min(0.34,Math.max(0.2,w*0.125)),ny=b.min.y+Math.min(h*0.48,0.72),nz=b.min.z+0.1;
  const noz=[1,-1].map(sd=>{const n=new T.Group();n.position.set(sd*w*0.25,ny,nz);const m=new T.Mesh(G.noz,G.dark);m.scale.set(rn,rn,0.62);const c=new T.Mesh(G.cap,G.glow);c.scale.set(rn,rn,0.62);n.add(m);n.add(c);
    const o=new T.Mesh(G.flame,G.fo),i=new T.Mesh(G.flame,G.fc);o.position.z=-0.3;i.position.z=-0.3;n.add(o);n.add(i);let s=null;if(kt.player){s=new T.Sprite(G.spr);s.position.z=-0.45;s.scale.set(1.3,1.3,1);n.add(s);}g.add(n);return{n,o,i,s,rn};});
  g.visible=false;kt.body.add(g);kt.jg={g,wl,wr,fins,noz,fh,a:0,want:0,span,ch,w};return kt.jg;}
/* 0 = stowed, 1 = out; a quick pop with a little overshoot */
function gpJetGearTick(kt,dt){const Q=kt.jg;if(!Q||(!Q.want&&Q.a<=0))return;const rate=1/GP_JET.out;Q.a=Q.want?Math.min(1,Q.a+dt*rate):Math.max(0,Q.a-dt*rate*0.62);const vis=Q.a>0.001;if(Q.g.visible!==vis)Q.g.visible=vis;if(!vis)return;
  const u=Q.a,c1=2.2,e=1+(c1+1)*Math.pow(u-1,3)+c1*Math.pow(u-1,2);[Q.wl,Q.wr].forEach(p=>{const sd=p.userData.sd,s=0.3+0.7*e;p.scale.set(sd*Q.span*s,Q.ch*(0.55+0.45*e),Q.ch*(0.55+0.45*e));p.rotation.y=sd*1.32*(1-Math.min(1,e));p.rotation.z=sd*0.05*e;});
  Q.fins.forEach(f=>{f.scale.y=Q.fh*Math.max(0.01,e);});
  const J=kt.jet,boost=kt.boostT>0,pow=(J&&J.ph!=="land"?1:0.25)*Math.min(1,u*1.3),fl=(0.8+Math.random()*0.4)*(kt.player?(boost?3.4:1.9):1.5);Q.noz.forEach(q=>{const rr=q.rn*(boost?1.1:0.92)*pow;q.o.scale.set(rr,rr,fl*pow);q.i.scale.set(rr*0.55,rr*0.55,fl*pow*0.62);if(q.s)q.s.material.opacity=(boost?0.95:0.6)*pow;});}
/* one flight's rings, laid out for this car's speed so the fuel always reaches the last one: a gentle slalom along the road direction, inside the safe lane */
function gpJetRingsMake(kt,J){const R=R3,easy=gpPace()==="gentle",fuel0=GP_JET.fuel[easy?"gentle":"normal"];let key=null,t0=kt.t,v=Math.max(J.vc,kt.speed*0.95),rnd=R.rnd01;
  if(J.how==="ramp"&&R.lips){const Ms=R.lips.filter(l=>l.kind==="mega");let bi=-1,bd=1e9;Ms.forEach((L,q)=>{const d=(kt.t-L.t+1)%1;if(d<bd){bd=d;bi=q;}});
    if(bi>=0&&bd*R.len<60){key=bi+"_"+Math.max(0,kt.lap|0);t0=Ms[bi].t;const N=R.karts.filter(k=>!k.traffic);v=N.reduce((a,k)=>a+k.max,0)/Math.max(1,N.length)*0.9;let h=2166136261;for(const c of R.C.id+key){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}let q=h>>>0;rnd=()=>{q=(q*1664525+1013904223)>>>0;return q/4294967296;};}}
  const G=R.jetGates||(R.jetGates={});let base=key&&G[key];if(!base){base=gpJetGatesBuild(t0,v,fuel0,rnd,easy);if(key)G[key]=base;}
  return base.map(g=>({k:g.k,t:g.t,x:g.x,h:g.h,r:g.r,y:g.y,g,hit:0,miss:0,fx:0}));}
function gpJetGatesBuild(t0,v,fuel0,rnd,easy){const R=R3,M=R.M,n=GP_JET.rings[easy?"gentle":"normal"],rad=GP_JET.ringR[easy?"gentle":"normal"],XS=R.W-1.2,gap=Math.max(GP_JET.ringGap,(fuel0-0.7)/n),ph=rnd()*6.28,ph2=rnd()*6.28,list=[];
  for(let k=0;k<n;k++){const tau=0.95+k*gap,t=(t0+v*tau/R.len)%1,i=Math.floor(t*M)%M;let a=Math.sin(ph+k*0.72)*(easy?0.7:1.05)*R.W;const kp=R.kap[i],inner=kp!==0?0.55/Math.abs(kp):1e9,lL=R.jetLim[0][i]*0.72,lR=R.jetLim[1][i]*0.72;a=Math.max(-lL,Math.min(lR,a));if(kp>0&&a<-inner)a=-inner;if(kp<0&&a>inner)a=inner;
    const h=6+4.5*(1+Math.sin(ph2+k*0.6));list.push({k,t,x:a/XS,h,r:rad,y:gpJetF(t)+h,by:null});}
  return list;}
/* enough fuel to reach the last gate: a slower car never has gates it can't get to */
function gpJetReach(kt,J){const last=J.rings[J.rings.length-1];if(!last)return;const need=((last.t-kt.t+1)%1)*R3.len/Math.max(J.vc,30)+0.7;if(need>J.fuel){J.fuel=Math.min(need,J.fuel+2.5);J.fuel0=J.fuel;}}
function gpJetRingsShow(list){const R=R3,G=R.jr;G.list=list;G.t=0;G.fade=0;G.mesh.count=list.length;const D=R.jetD,V=R.tmpV;list.forEach(r=>{const p=R.curve.getPointAt(r.t),tn=R.curve.getTangentAt(r.t);const nor=V.set(-tn.z,0,tn.x).normalize();p.addScaledVector(nor,r.x*(R.W-1.2));p.y=r.y;r.p=p;r.tn=tn.clone();});G.mesh.visible=true;gpJetRingsDraw(0);}
function gpJetRingsDraw(dt){const R=R3,G=R.jr;if(!G||!G.mesh.visible)return;G.t+=dt;if(G.fade>0){G.fade=Math.max(0,G.fade-dt/0.5);if(G.fade<=0){G.mesh.visible=false;G.list=[];return;}}const D=R.jetD,C=R.jetC,me=R.me,J=me.jet,next=G.list.find(r=>!r.hit&&!r.miss);
  G.list.forEach((r,i)=>{const pop=Math.min(1,Math.max(0,(G.t-i*0.05)/0.28)),e=pop*pop*(3-2*pop);let s=r.r*Math.max(0.001,e)*(G.fade>0?G.fade:1);let col=0x00f0ff;
    if(r.hit){r.fx+=dt;s=Math.max(0.001,r.r*(1-r.fx/0.14));col=0xffffff;}else if(r.miss){col=0x2a7f96;}else if(r===next){col=(r.g&&r.g.by&&r.g.by!==me)?0xff7ab5:0xffdd00;s*=1+0.06*Math.sin(G.t*9);}else if(r.g&&r.g.by&&r.g.by!==me)col=0xff2a85;
    D.position.copy(r.p);D.up.set(0,1,0);D.lookAt(r.p.x+r.tn.x,r.p.y+r.tn.y*0,r.p.z+r.tn.z);D.scale.setScalar(s);D.updateMatrix();G.mesh.setMatrixAt(i,D.matrix);C.set(col);G.mesh.setColorAt(i,C);});
  G.mesh.instanceMatrix.needsUpdate=true;if(G.mesh.instanceColor)G.mesh.instanceColor.needsUpdate=true;}
/* cruising speed: what the road under this flight is worth to a good driver (a touch more), so a flight is a thrill, not a free 200 m on the rivals who still have to brake for its bends. Tops out at the car's top speed + a bit on an open road */
function gpJetCruise(kt,fuel){const R=R3,M=R.M,ds=R.len/M,i0=Math.floor(kt.t*M)%M,g=Math.sqrt((kt.gripK||1)*(R.upGrip||1)),n=Math.round(kt.max*(fuel+1.6)/ds);let s=0,c=0;for(let k=0;k<n;k+=4){s+=1/Math.max(8,R.vProf[(i0+k)%M]*g);c++;}const avg=c/Math.max(1e-6,s);return Math.max(GP_JET.minSpeed*1.5,Math.min(kt.max*GP_JET.cruise[gpPace()==="gentle"?"gentle":"normal"],Math.max(kt.max*GP_JET.cruiseMin,avg*GP_JET.cruiseK)));}
/* lift-off */
function gpJetStart(kt,ry,how){const R=R3,easy=gpPace()==="gentle";if(kt.jet)return;const Q=gpJetGear(kt);Q.want=1;kt.air=true;kt.airT=0;kt.airPeak=0;kt.y=ry;kt.ry=ry;kt.loss=null;kt.lossA=0;kt.drift=0;kt.wobT=0;kt.takeoff={v:Math.round(kt.speed*3.6),vy:0,f:R.frameN,kind:how};
  if(!kt.player&&Math.abs(((kt.lap+kt.t)-(R.me.lap+R.me.t))*R.len)>170){const r=Math.random(),gapB=Math.max(0,((R.me.lap+R.me.t)-(kt.lap+kt.t))*R.len);kt.jet={ph:"hop",t:0,T:GP_JET.hopT[0]+r*(GP_JET.hopT[1]-GP_JET.hopT[0])+Math.min(3.5,gapB/70),H:GP_JET.hopH[0]+r*(GP_JET.hopH[1]-GP_JET.hopH[0]),hdg:0,roll:0,pitch:0,safe:0};kt.jet.safe=gpJetSafe(kt,kt.speed*kt.jet.T);kt.vy=6;if(Math.random()<0.3)gpTrickStart(kt,Math.random()<0.6?"roll":"spin",Math.random()<0.5?-1:1);(R.jetHops=R.jetHops||[]).push({car:kt.racer.car.id,t:+(R.simT||0).toFixed(2)});return;}
  if(!kt.player){const r=Math.random(),fuelR=GP_JET.fuel[easy?"gentle":"normal"]*(0.72+r*0.18),vcR=gpJetCruise(kt,fuelR)*(GP_JET.aiV[gpPace()]||GP_JET.aiV.normal);kt.jet={ph:"fly",ai:1,t:0,fuel:fuelR,fuel0:fuelR,h:GP_JET.h0,vh:0,hdg:0,roll:0,pitch:0,yOff:0,vc:vcR,how,hit:0,lt:0,lT:1.6,speed0:kt.speed,streak:0,pHit:GP_JET.aiHit[easy?"gentle":"normal"]*(0.85+0.15*Math.min(1,kt.aiSkill||1))};kt.jet.yOff=ry-(gpJetF(kt.t)+kt.jet.h);kt.jet.rings=gpJetRingsMake(kt,kt.jet);gpJetReach(kt,kt.jet);kt.vy=6;(R.jetHops=R.jetHops||[]).push({car:kt.racer.car.id,t:+(R.simT||0).toFixed(2)});return;}
  const fuel0v=GP_JET.fuel[easy?"gentle":"normal"],vc=gpJetCruise(kt,fuel0v),fuel=GP_JET.fuel[easy?"gentle":"normal"];
  const J=kt.jet={ph:"fly",t:0,fuel,fuel0:fuel,h:GP_JET.h0,vh:0,hdg:0,roll:0,pitch:0,yOff:0,vc,how,hit:0,lt:0,lT:1.6,brk:!!(R.brake||R.keys["s"]||R.keys[" "]),speed0:kt.speed,streak:0};J.yOff=ry-(gpJetF(kt.t)+J.h);
  J.rings=gpJetRingsMake(kt,J);gpJetReach(kt,J);gpJetRingsShow(J.rings);kt.sv=0;kt.headV=0;R.jetBrakeLock=true;R.jetCount=(R.jetCount||0)+1;kt.boostT=Math.max(kt.boostT||0,0.9);kt.boostMul=Math.max(kt.boostMul||1,1.12);
  if(R.camMode==="hood"||R.camMode==="bumper"||R.camMode==="cockpit"){R.camSave=R.camMode;R.camMode="chase";gpCamApply();}
  GPA.play("wings");gpTrickPop("t",how==="pick"?"WINGS!":"JET MODE!","");(R.jetLog=R.jetLog||[]).push({ev:"start",how,t:+(R.simT||0).toFixed(2),f:R.frameN,kmh:Math.round(kt.speed*3.6),fuel});}
/* the lowest safe speed over the next stretch of road: a landing never hands Prince a bend he can't make */
function gpJetSafe(kt,dist){const R=R3,M=R.M,ds=R.len/M,i0=Math.floor(kt.t*M)%M,a=Math.round(dist/ds),b=a+Math.round(25/ds),g=kt.player?Math.sqrt((kt.gripK||1)*(R.upGrip||1)):kt.aiSkill||1;let v=1e9;for(let k=a;k<b;k+=2){const q=R.vProf[(i0+k)%M]*g;if(q<v)v=q;}return v;}   // the speed profile already has the braking room for what comes next
function gpJetLowAhead(kt,dist){const R=R3,M=R.M,ds=R.len/M,i0=Math.floor(kt.t*M)%M,n=Math.round((dist+45)/ds);for(let k=-8;k<n;k+=3)if(R.jetLow[((i0+k)%M+M)%M])return true;return false;}
/* the wheels should touch down on a calm stretch, not halfway round a hairpin */
function gpJetBendAt(kt,dist){const R=R3,M=R.M,ds=R.len/M,i0=Math.floor(kt.t*M)%M,a=Math.round((dist-25)/ds),b=Math.round((dist+95)/ds);for(let k=a;k<b;k+=3)if(Math.abs(R.kap[((i0+k)%M+M)%M])>1/60)return true;return false;}
/* begin the glide, unless the road just ahead has a roof (tunnel, arch): then hold height until it's clear */
function gpJetLand(kt){const J=kt.jet,R=R3;if(!J||J.ph!=="fly")return false;const y=gpJetF(kt.t)+J.h+J.yOff,road=R.curve.getPointAt(kt.t).y,H=Math.max(0,y-road),T1=Math.max(1.5,Math.min(3.6,H*1.5/15)),dist=Math.max(30,kt.speed)*T1;J.hold=(J.hold||0)+(J.fuel<=0||J.wantLand?(R.frameDt||1/60):0);if(gpJetLowAhead(kt,dist)||(J.hold<(J.wantLand?1:2.5)&&!R.done&&gpJetBendAt(kt,dist))){if(!J.wantLand)J.fuel=0;return false;}
  J.ph="land";J.lt=0;J.lT=T1;J.x0=kt.x;J.xT=Math.max(-0.6,Math.min(0.6,kt.x*0.25));J.safe=gpJetSafe(kt,dist);J.hdg0=J.hdg;if(kt.jg)kt.jg.want=0;if(kt.player)GPA.play("jetfold");(R.jetLog=R.jetLog||[]).push({ev:"land",t:+(R.simT||0).toFixed(2),fuel:+J.fuel.toFixed(2),x:+kt.x.toFixed(2),T:+T1.toFixed(2),safe:Math.round(J.safe*3.6)});return true;}
/* speed in the air: the car settles at its cruising speed; afterburner on top; on the way down, no faster than the next bends allow */
function gpJetSpeed(kt,dt){R3.frameDt=dt;const J=kt.jet;if(J.ph==="hop"){const left=J.T-J.t;if(left<1.2&&kt.speed>J.safe)kt.speed=Math.max(J.safe,kt.speed-16*dt);else kt.speed*=1-0.015*dt;return;}
  if(J.ph==="land"){J.safe=gpJetSafe(kt,Math.max(0,kt.speed*(J.lT-J.lt)));const tg=Math.min(J.safe,Math.max(kt.speed,J.vc));if(kt.speed>tg)kt.speed=Math.max(tg,kt.speed-Math.max(10,(kt.speed-tg)/Math.max(0.3,J.lT-J.lt))*dt);return;}
  if(J.sg)J.sg=Math.max(0,J.sg-GP_JET.sgFade*dt);const tg=J.vc*(kt.boostT>0?1.26:1)*(1+(kt.cu||0)*0.5)*(kt.player&&gpPace()!=="gentle"&&!R3.autoGas&&!R3.gas?0.94:1)*(1+(J.sg||0))*(kt.player||R3.online?1:Math.min(1,gpBand(kt)));kt.speed+=(tg-kt.speed)*Math.min(1,dt*(kt.speed<tg?1.5:1.6));}
/* across the road and along it: returns how fast the car moves along the road's centre line (true curved-road geometry, so an outside line is really longer) */
function gpJetMove(kt,inp,kap,dt,i){const J=kt.jet,R=R3,XS=R.W-1.2,M=R.M;if(J.ph==="hop")return kt.speed;
  J.kap=(J.kap==null?kap:J.kap+(kap-J.kap)*Math.min(1,dt*5));const k=J.kap,xm=kt.x*XS,v=Math.max(10,kt.speed);
  if(J.ph==="fly"){const easy=gpPace()==="gentle",next=J.rings.find(r=>!r.hit&&!r.miss);let hT=inp?inp*0.58:0;J.pIn=J.ai?0:gpJetPitchIn();let vhT=J.pIn*GP_JET.climb;
    if(J.ai){if(next){if(next.aim==null)next.aim=Math.random()<J.pHit?(Math.random()-0.5)*next.r*0.7:(Math.random()<0.5?-1:1)*(next.r*1.3+1);const dist=Math.max(14,((next.t-kt.t+1)%1)*R.len);hT=Math.max(-0.5,Math.min(0.5,Math.atan2((next.x-kt.x)*XS+next.aim,dist)*1.35));vhT=Math.max(-GP_JET.climb,Math.min(GP_JET.climb,(next.h+next.aim*0.5-J.h)*v/dist*1.2));}else{hT=Math.max(-0.4,Math.min(0.4,Math.atan2(-xm,70)));vhT=Math.max(-GP_JET.climb*0.6,Math.min(GP_JET.climb*0.6,(GP_JET.h0-J.h)*0.8));}}
    else if(easy&&next){const dist=Math.max(14,((next.t-kt.t+1)%1)*R.len),aH=Math.max(-0.5,Math.min(0.5,Math.atan2((next.x-kt.x)*XS,dist)*1.35)),aV=Math.max(-GP_JET.climb,Math.min(GP_JET.climb,(next.h-J.h)*v/dist*1.2));hT=inp?inp*0.42+aH*0.45:aH;vhT=J.pIn?J.pIn*GP_JET.climb*0.7+aV*0.4:aV;}
    const over=Math.abs(xm)-GP_JET.xSoft;if(over>0)hT-=Math.sign(xm)*Math.min(0.75,over*0.09);
    const sideLim=R.jetLim[xm<0?0:1][i];if(Math.abs(xm)>sideLim-5)hT-=Math.sign(xm)*Math.min(0.7,(Math.abs(xm)-sideLim+5)*0.14);
    J.hdg+=(hT-J.hdg)*Math.min(1,dt*3.4);J.vh+=(vhT-J.vh)*Math.min(1,dt*4.2);J.h+=J.vh*dt;
    if(J.h<2.4&&J.vh<0)J.vh*=Math.max(0,J.h/2.4);if(J.h<0){J.h=0;J.vh=Math.max(0,J.vh);}
    if(J.h>GP_JET.hMax-4&&J.vh>0)J.vh*=Math.max(0,(GP_JET.hMax-J.h)/4);if(J.h>GP_JET.hMax){J.h=GP_JET.hMax;J.vh=Math.min(0,J.vh);}
    if(!J.ai){const bk=!!(R.brake||R.keys["s"]||R.keys[" "]);if(bk&&!J.brk&&!J.wantLand){J.wantLand=1;gpMsg("Landing...");}J.brk=bk;}
    if(J.t>GP_JET.out)J.fuel=Math.max(0,J.fuel-dt);if(J.fuel<=0||J.wantLand||R.done)gpJetLand(kt);
    kt.x+=Math.sin(J.hdg)*v*dt/XS;if(J.kx){kt.x+=J.kx*dt;J.kx*=Math.exp(-5*dt);if(Math.abs(J.kx)<0.002)J.kx=0;}}
  else{J.lt+=dt;const u=Math.min(1,J.lt/J.lT),e=Math.min(1,u/0.72),s=e*e*(3-2*e),xn=J.x0+(J.xT-J.x0)*s,vx=(xn-kt.x)*XS/Math.max(dt,0.001);kt.x=xn;const hT=Math.max(-0.42,Math.min(0.42,Math.atan2(vx,v)))*(1-u);J.hdg+=(hT-J.hdg)*Math.min(1,dt*7);J.vh=0;}
  // hard limits: the far edge of the corridor, the scenery beside it, and the inside of a bend (the road frame folds up past the centre of the curve)
  {const m=kt.x*XS,sg=m<0?0:1;let L=Math.min(GP_JET.xHard,J.ph==="fly"?R.jetLim[sg][i]+3:99);if((k>0&&m<0)||(k<0&&m>0))L=Math.min(L,0.7/Math.max(1e-4,Math.abs(k)));if(Math.abs(m)>L)kt.x-=Math.sign(m)*(Math.abs(m)-L)*Math.min(1,dt*3)/XS;}
  const inward=(k>0?-1:1)*kt.x*XS*Math.abs(k),den=Math.max(0.5,Math.min(2,1-inward));
  return Math.max(4,kt.speed*Math.cos(J.hdg)/den);}
function gpJetPitchIn(){const R=R3,k=R.keys;let p=R.pitchIn||0;if(k["arrowup"]||k["w"])p=1;else if(k["arrowdown"])p=-1;return p;}
/* height: the set arc for a rival's hop; for Prince the sky floor + h, a quick climb off the ramp, and on landing an S-curve down onto the road, soft at both ends */
function gpJetVert(kt,pos,dt,waiting){const ry=pos.y,J=kt.jet;
  if(kt.vy==null||kt.ry==null||waiting||dt<=0||Math.abs(ry-kt.ry)>0.6+Math.abs(kt.speed)*dt*0.9){gpJetCancel(kt);kt.y=ry;kt.vy=0;kt.ry=ry;kt.air=false;kt.airT=0;kt.tPrev=kt.t;pos.y=ry;return;}
  const rv=Math.max(-kt.speed*0.6-2,Math.min(kt.speed*0.6+2,(ry-kt.ry)/dt));kt.ry=ry;kt.tPrev=kt.t;kt.airT+=dt;J.t+=dt;let y,down=false;
  if(J.ph==="hop"){const u=Math.min(1,J.t/J.T);y=ry+J.H*Math.pow(Math.sin(Math.PI*Math.pow(u,0.8)),1.25);down=u>=1;J.e=u;}
  else{J.yOff*=Math.exp(-dt/0.7);const yf=gpJetF(kt.t)+J.h+J.yOff;if(J.ph==="land"){const u=Math.min(1,J.lt/J.lT),e=u*u*(3-2*u);y=yf+(ry-yf)*e;J.e=e;down=u>=1;}else{y=yf;J.e=0;}}
  if(y<ry)y=ry;kt.vy=(y-kt.y)/dt;kt.y=y;kt.airPeak=Math.max(kt.airPeak,y-ry);pos.y=y;
  if(down)gpJetTouch(kt,ry,rv,pos);}
function gpJetCancel(kt){const J=kt.jet;if(!J)return;kt.jet=null;if(kt.jg){kt.jg.want=0;kt.jg.a=0;kt.jg.g.visible=false;}if(kt.player){const R=R3;if(R.jr)R.jr.fade=0.001;R.jetBrakeLock=false;gpJetCamBack();gpJetHudOff();}gpJetShadow(kt,false);}
function gpJetCamBack(){const R=R3;if(R.camSave){R.camMode=R.camSave;R.camSave=null;gpCamApply();}}
function gpJetTouch(kt,ry,rv,pos){const R=R3,J=kt.jet,imp=Math.max(0,rv-kt.vy);kt.y=ry;kt.vy=rv;kt.air=false;pos.y=ry;kt.jet=null;kt.pS=kt.sR;kt.noBurst=1;gpJetShadow(kt,false);if(kt.jg)kt.jg.want=0;gpTrickLand(kt);gpLand(kt,Math.min(2.2,imp));kt.noBurst=0;
  if(!kt.player)return;if(R.flyEnd)R.flyEnd();kt.headA=J.hdg;kt.headV=0;kt.sv=0;kt.lossCool=Math.max(kt.lossCool||0,2.5);kt.overT=0;kt.wallRec=0;kt.jetGas=2.4;kt.jetCalm=gpPace()==="gentle"?2.2:1.6;gpJetCamBack();gpJetHudOff();if(R.jr)R.jr.fade=1;
  const n=J.rings.length,hit=J.hit;let add=0;if(hit>0&&R.tk){add=GP_JET.landQ[0]+GP_JET.landQ[1]*hit/n;R.tk.fill=Math.min(1,(R.tk.fill||0)+add);gpTrickPop("",hit===n?"PERFECT LANDING!":"SMOOTH LANDING!","+NITRO · "+hit+"/"+n+" rings");GPA.play("cheer");gpSkill("Jet flight",hit*150,true);}
  (R.jetLog=R.jetLog||[]).push({ev:"touch",t:+(R.simT||0).toFixed(2),f:R.frameN,x:+kt.x.toFixed(3),hdg:+(J.hdg*57.3).toFixed(1),kmh:Math.round(kt.speed*3.6),imp:+imp.toFixed(2),rings:hit,of:n,add:+add.toFixed(2),lapT:+kt.t.toFixed(4),air:+kt.airT.toFixed(2)});}
/* the body in the air: banks into the turn, nose follows the climb, and the road's own bends lean it too */
function gpJetPose(kt,dt,yawRate){const J=kt.jet;if(J.ph==="hop"){const u=J.e||0;kt.body.rotation.x+=-0.22*Math.cos(Math.PI*u);kt.body.rotation.z+=0;return;}
  const v=Math.max(10,kt.speed),land=J.ph==="land",rT=land?0:Math.max(-1.05,Math.min(1.05,J.hdg*1.35+Math.max(-0.65,Math.min(0.65,yawRate*0.5)))),pT=land?0.02+0.1*(1-(J.e||0))*(1-(J.e||0)):Math.max(-0.5,Math.min(0.42,-J.vh/v*2.2-(J.pIn||0)*0.14+(J.t<0.7?-0.3*(1-J.t/0.7):0)));
  J.roll+=(rT-J.roll)*Math.min(1,dt*5.5);J.pitch+=(pT-J.pitch)*Math.min(1,dt*4.5);kt.body.rotation.z=kt.roll*0.3+J.roll;kt.body.rotation.x=kt.pitch*0.3+J.pitch;
  gpJetShadow(kt,true);}
/* a tall flight doesn't leave a dark blob and tyre marks glued to the road */
function gpJetShadow(kt,on){if(!kt.shadows)return;const sh=kt.shadows,bl=sh[0];if(!bl||!bl.material)return;if(!on){if(kt._jsh){bl.material.opacity=kt._jsh;kt._jsh=0;if(sh[1])sh[1].visible=true;}return;}if(!kt._jsh)kt._jsh=bl.material.opacity;const lift=Math.max(0,kt.y-(kt.ry||0));bl.material.opacity=kt._jsh*Math.max(0.1,1-lift/32);if(sh[1])sh[1].visible=lift<1.5;}
/* in-flight: rings flown through, wings pickup, HUD, contrails */
function gpJetRingCheck(kt,before){const J=kt.jet,R=R3;if(!J||J.ph!=="fly"&&J.ph!=="land"||!J.rings)return;const XS=R.W-1.2,span=((kt.t-before)%1+1)%1,y=kt.y,easy=gpPace()==="gentle";for(const r of J.rings){if(r.hit||r.miss)continue;const d=((r.t-before)%1+1)%1;if(d>span)continue;const ok=Math.hypot((kt.x-r.x)*XS,y-r.y)<=r.r*1.12;if(ok){r.hit=1;J.hit++;J.streak++;const G=r.g,first=!G||!G.by;if(G&&!G.by)G.by=kt;const worth=first||(kt.player&&easy)?1:0.5;J.sg=Math.min(GP_JET.sgMax,(J.sg||0)+GP_JET.sgAdd*worth*(kt.player?1:GP_JET.aiSg[easy?"gentle":"normal"]));if(kt.player){if(R.boost)R.boost.q=Math.min(1,R.boost.q+GP_JET.ringQ*worth);R.timeBonus=(R.timeBonus||0)+GP_JET.ringMs*worth;GPA.play("ring",J.streak);if(R.jh){R.jh.pop=worth<1?"HALF":"+"+(GP_JET.ringMs/1000).toFixed(1)+"s";}(R.jetLog=R.jetLog||[]).push({ev:"gate",k:r.k,first:!!first,worth,sg:+J.sg.toFixed(3)});}}else{r.miss=1;J.streak=0;}}}
/* a friend's car flies through one of my gates: it counts as theirs on this screen too */
function gpJetNetClaim(kt,t0){const R=R3,J=R.me.jet;if(!J||!kt.netJet||!J.rings)return;const XS=R.W-1.2,span=((kt.t-t0)%1+1)%1;if(span>0.2)return;for(const r of J.rings){if(!r.g||r.g.by)continue;const d=((r.t-t0)%1+1)%1;if(d<=span&&Math.hypot((kt.x-r.x)*XS,kt.y-r.y)<=r.r*1.12)r.g.by=kt;}}
function gpJetPick(kt,before){const R=R3,P0=R.jp;if(!P0||!P0.alive||kt.air||R.done)return;const span=((kt.t-before)%1+1)%1,d=((P0.t-before)%1+1)%1;if(d>span)return;const easy=gpPace()==="gentle";if(Math.abs(kt.x-P0.x)>(easy?0.6:0.42)||kt.speed<GP_JET.minSpeed)return;P0.alive=false;P0.mesh.visible=false;(R.jetLog=R.jetLog||[]).push({ev:"pick",t:+(R.simT||0).toFixed(2)});gpJetStart(kt,R.curve.getPointAt(kt.t).y,"pick");}
function gpJetAirLeft(kt){const J=kt.jet;if(J.ph==="fly")return J.fuel+1.4;return 0;}
function gpJetTrail(dt){const R=R3,Tr=R.jetTrail;if(!Tr)return;const me=R.me,J=me.jet,on=!!(J&&J.ph==="fly"&&me.jg&&me.jg.a>0.8),N=Tr.N;Tr.acc+=dt;if(on&&!Tr.on){Tr.on=true;Tr.n=0;}else if(!on&&Tr.on)Tr.on=false;
  if(Tr.on&&Tr.acc>=0.03){Tr.acc=0;[me.jg.wl,me.jg.wr].forEach((w,q)=>{w.userData.tip.getWorldPosition(R.tmpV);const a=Tr.pts[q];a.copyWithin(3,0,(N-1)*3);a[0]=R.tmpV.x;a[1]=R.tmpV.y;a[2]=R.tmpV.z;});Tr.n=Math.min(N,Tr.n+1);Tr.life=1;}
  if(!Tr.on&&Tr.life>0)Tr.life=Math.max(0,Tr.life-dt/1.1);const vis=Tr.life>0&&Tr.n>2;if(Tr.mesh.visible!==vis)Tr.mesh.visible=vis;if(!vis)return;
  const P1=Tr.pos,C1=Tr.col,cam=R.camPos,Hw=0.09;let o=0,c=0;for(let q=0;q<2;q++){const a=Tr.pts[q];if(Tr.on){me.jg[q?"wr":"wl"].userData.tip.getWorldPosition(R.tmpV);a[0]=R.tmpV.x;a[1]=R.tmpV.y;a[2]=R.tmpV.z;}
    for(let i=0;i<N;i++){const j=Math.min(i,Tr.n-1)*3,jn=Math.max(0,Math.min(i,Tr.n-1)-1)*3,x=a[j],y=a[j+1],z=a[j+2];let dx=x-a[jn],dy=y-a[jn+1],dz=z-a[jn+2];const vx=x-cam.x,vy=y-cam.y,vz=z-cam.z;let sx=dy*vz-dz*vy,sy=dz*vx-dx*vz,sz=dx*vy-dy*vx;const L=Math.hypot(sx,sy,sz)||1,f=1-Math.min(i,Tr.n-1)/(Tr.n-1),w=Hw*(0.5+0.5*f)*(1+((N-i)/N)*0.2);sx*=w/L;sy*=w/L;sz*=w/L;
      P1[o++]=x-sx;P1[o++]=y-sy;P1[o++]=z-sz;P1[o++]=x+sx;P1[o++]=y+sy;P1[o++]=z+sz;const dc=Math.hypot(vx,vy,vz),br=f*f*0.6*Tr.life*Math.max(0,Math.min(1,(dc-7)/16));for(let e=0;e<2;e++){C1[c++]=br*0.9;C1[c++]=br;C1[c++]=br;}}}
  Tr.g.attributes.position.needsUpdate=true;Tr.g.attributes.color.needsUpdate=true;}
function gpJetHudOff(){const H=R3.jh;if(!H)return;H.on=false;const w=$("gp3");if(w)w.classList.remove("jet","jetlow");if(H.back)H.back.classList.remove("on");const b=$("rcB");if(b){const t=b.querySelector("b");if(t)t.textContent="BRAKE";}}
function gpJetAirRace(H,dt){const R=R3,me=R.me;H.ar=(H.ar||0)-dt;if(H.ar>0)return;H.ar=0.15;const prog=k=>(k.lap||0)+k.t,mp=prog(me);let ahead=0,n=0;const was=H.am,am=new Map();for(const o of R.karts){if(o===me||o.netGone)continue;const fly=(o.jet&&o.jet.ph!=="hop")||o.netJet;const d=(prog(o)-mp)*R.len;if(!fly||Math.abs(d)>150)continue;n++;const a=d>0;if(a)ahead++;am.set(o,a);if(was&&was.has(o)&&was.get(o)!==a&&(R.simT||0)-(H.ovT||-9)>1.2){H.ovT=R.simT||0;(R.jetLog=R.jetLog||[]).push({ev:a?"passedBy":"overtake",t:+(R.simT||0).toFixed(2)});if(!a){gpTrickPop("t","OVERTAKE!","");GPA.play("ring",4);}else gpMsg(o.racer.n+" went past you!");}}H.am=am;const el=H.air||(H.air=$("gp3JetAir"));if(el){const t=n?(["1st","2nd","3rd","4th","5th","6th"][ahead]||"")+" in the air":"";if(t!==H.airTxt){H.airTxt=t;el.textContent=t;}}}
function gpJetHud(dt){const R=R3,H=R.jh;if(!H)return;const me=R.me,J=me.jet,fly=!!(J&&J.ph==="fly"&&!R.done);{const on=!!(me.air&&!J&&!R.dp&&!R.done&&(H.big||gpAirLeft(me)>0.45));if(on!==!!H.big){H.big=on;const w0=$("gp3");if(w0)w0.classList.toggle("bigair",on);}}{const ui=!!(!R.done&&R.phase==="race"&&(fly||H.big||(J&&J.ph==="land")));if(ui!==!!H.ui){H.ui=ui;R.flyUi=ui;const wf=$("gp3");if(wf)wf.classList.toggle("fly",ui);if(ui){if(R.flySync)R.flySync();}else if(R.flyEnd)R.flyEnd();}const wg=$("gp3");if(wg)wg.classList.toggle("glide",!!(J&&J.ph==="land"));}if(fly!==H.on){H.on=fly;const w=$("gp3");if(w)w.classList.toggle("jet",fly);const b=$("rcB");if(b){const t=b.querySelector("b");if(t)t.textContent=fly?"LAND":"BRAKE";}if(!fly){if(w)w.classList.remove("jetlow");if(H.back)H.back.classList.remove("on");}}
  if(!fly){H.am=null;return;}gpJetAirRace(H,dt);const f=Math.max(0,J.fuel/J.fuel0),q=Math.round(f*200);if(q!==H.q){H.q=q;H.fill.style.transform="scaleX("+f.toFixed(3)+")";const low=f<0.28;if(low!==H.low){H.low=low;$("gp3").classList.toggle("jetlow",low);if(low)GPA.play("fuel");}}
  const rt=J.hit+" / "+J.rings.length;if(rt!==H.rt){H.rt=rt;H.rings.textContent=rt;H.rings.classList.remove("hit");void H.rings.offsetWidth;if(J.hit)H.rings.classList.add("hit");}
  const m=me.x*(R.W-1.2),off=Math.abs(m)>GP_JET.xArrow;if(off!==H.off){H.off=off;H.back.classList.toggle("on",off);}if(off){const dir=m>0?"l":"r";if(dir!==H.dir){H.dir=dir;H.back.className="fz-jback on "+dir;H.back.innerHTML=dir==="l"?"<i>◀</i><b>BACK TO THE TRACK</b>":"<b>BACK TO THE TRACK</b><i>▶</i>";(R.jetLog=R.jetLog||[]).push({ev:"arrow",x:+me.x.toFixed(2)});}}}
/* everything built once per race, at the start, so a lift-off never hitches on the iPad */
function gpJetInit(){const R=R3,T=R.T,M=R.M,ds=R.len/M;R.rnd01=(()=>{let s=(R.C.id.length*7919+13)>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};})();gpJetFloor();
  R.jetD=new T.Object3D();R.jetC=new T.Color();
  {const m=new T.MeshBasicMaterial({color:0xffffff,side:T.DoubleSide,fog:false});m.toneMapped=false;m.userData.lin=1;const g=new T.TorusGeometry(1,0.085,8,40);const im=new T.InstancedMesh(g,m,16);im.frustumCulled=false;im.visible=false;im.setColorAt(0,new T.Color(1,1,1));im.count=0;R.scene.add(im);R.jr={mesh:im,list:[],t:0,fade:0};}
  {const N=28,g=new T.BufferGeometry(),pos=new Float32Array(N*2*3*2),col=new Float32Array(N*2*3*2),idx=[];for(let q=0;q<2;q++){const b=q*N*2;for(let i=0;i<N-1;i++){const a=b+i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}}g.setAttribute("position",new T.BufferAttribute(pos,3));g.setAttribute("color",new T.BufferAttribute(col,3));g.setIndex(idx);const m=new T.MeshBasicMaterial({vertexColors:true,transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,fog:false});m.toneMapped=false;m.userData.lin=1;const mesh=new T.Mesh(g,m);mesh.frustumCulled=false;mesh.visible=false;R.scene.add(mesh);R.jetTrail={N,g,pos,col,mesh,pts:[new Float32Array(N*3),new Float32Array(N*3)],n:0,acc:0,on:false,life:0};}
  R.karts.forEach(k=>gpJetGear(k));
  R.jh={on:false,fill:$("gp3FuelFill"),rings:$("gp3JetRings"),back:$("gp3Back"),q:-1,low:false,off:false,dir:null,rt:""};
  // the rare WINGS pickup: the longest clear straight on the lap, far from every ramp and any roof
  {let best=null;const clear=i=>Math.abs(R.kap[i%M])<1/280&&!R.jetLow[i%M];let run=0;for(let i=0;i<M*2;i++){if(clear(i))run++;else{if(run*ds>170){const a=i-run,tp=(a+Math.round(run*0.45))%M,t=tp/M;const farLip=(R.lips||[]).filter(L=>L.kind==="mega").every(L=>{let u=Math.abs(L.t-t);u=Math.min(u,1-u)*R.len;return u>170;}),farLine=Math.min(t,1-t)*R.len>120;if(farLip&&farLine&&(!best||run>best.run))best={run,t};}run=0;}}
    if(best&&!R.C.deep){const P1=R.curve.getPointAt(best.t),tn=R.curve.getTangentAt(best.t),G=gpJetParts(T),m=new T.MeshBasicMaterial({color:0xffdd00});m.toneMapped=false;m.userData.lin=1;const g=new T.Group();[1,-1].forEach(sd=>{const w=new T.Mesh(G.wing,m),e=new T.Mesh(G.edge,G.trim);w.scale.set(sd*1.5,1.5,1.5);e.scale.set(sd*1.5,1.5,1.5);g.add(w);g.add(e);});const bs=new T.Sprite(new T.SpriteMaterial({map:gpSoftDot(),color:0xffdd00,transparent:true,opacity:0.55,depthWrite:false,blending:T.AdditiveBlending}));bs.material.toneMapped=false;bs.material.userData.lin=1;bs.scale.set(5.5,5.5,1);g.add(bs);g.position.set(P1.x,P1.y+1.7,P1.z);g.rotation.y=Math.atan2(tn.x,tn.z);R.scene.add(g);R.jp={t:best.t,x:0,mesh:g,alive:true,y0:P1.y+1.7};}}
  // first use of the jet materials costs a shader compile: do it now, while the track is still loading
  try{const vis=[];R.karts.forEach(k=>{if(k.jg){vis.push(k.jg.g);k.jg.g.visible=true;}});R.jr.mesh.visible=true;R.jetTrail.mesh.visible=true;R.renderer.compile(R.scene,R.camera);vis.forEach(g=>{g.visible=false;});R.jr.mesh.visible=false;R.jetTrail.mesh.visible=false;}catch(e){}}
/* ---------- vertical motion: the car follows the road over hills and dips, and flies off crests it takes too fast ----------
   On the ground the car rides the road. Each frame the ballistic step (current climb rate minus gravity) is compared with the road
   under the new spot: if the road falls away faster than gravity can follow, the car is airborne - wheels off the road, no grip, no
   steering - until it comes down, which is a landing with a suspension squash, a small bounce, dust and (for Prince) a screen shake. */
const GP_G=15.5;
/* every lip's real place on this build's road (sample nearest the top), its slope, and the room after it before the next proper bend */
function gpLipsBuild(){const R=R3,C=R.C,M=R.M,ds=R.len/M,S=R.samples;R.lips=(C.jumps||[]).map(J=>{const i0=Math.round(J[0]/C.lapM*M);let bi=i0,by=-1e9;for(let k=-14;k<=14;k++){const i=((i0+k)%M+M)%M;if(S[i].pos.y>by){by=S[i].pos.y;bi=i;}}
    const n=Math.round(10/ds),slope=Math.max(0,(by-S[((bi-n)%M+M)%M].pos.y)/(n*ds))*1.12;let room=0;for(let k=1;k<Math.round(240/ds);k++){if(Math.abs(R.kap[(bi+k)%M])>1/90)break;room=k*ds;}
    return{t:bi/M,y:by,slope,room,kind:J[2]||"jump",h:J[1],hit:0};});}
/* off the lip: the climb rate is slope x speed (exactly, at any frame rate); a mega ramp also fires a burst, so nobody stalls on it. The room left to land
   caps the flight, so a landing always comes before the next bend. */
function gpFlightT(L,v,vy,y0){const R=R3,M=R.M,S=R.samples,ds=R.len/M,i0=Math.round(L.t*M);for(let T=0.1;T<3;T+=0.05){const k=Math.round(v*T/ds),y=y0+vy*T-0.5*GP_G*T*T;if(y<=S[(i0+k)%M].pos.y)return T;}return 3;}
function gpLaunch(kt,L,ry){if(kt.speed<(L.kind==="mega"?8:15))return false;if(L.kind==="leap")return gpDeepLeap(kt,L,ry);const mega=L.kind==="mega",toJet=mega&&!!R3.jetF&&kt.speed>=Math.max(GP_JET.minSpeed,kt.max*0.32);
  if(mega){const v0=kt.speed;kt.speed=Math.max(kt.speed*1.05,Math.min(kt.max*0.86,kt.speed+30));if(kt.boostT!==undefined){kt.boostT=Math.max(kt.boostT,0.9);kt.boostMul=Math.max(kt.boostMul||1,1.12);}if(kt.player){GPA.play("boost");if(!toJet)gpMsg("MEGA RAMP!");}}
  if(toJet){gpJetStart(kt,ry,"ramp");return true;}
  const dune=!mega&&!!R3.C.dnl,v=kt.speed,tMax=dune?Math.min(GP_DUNE_AIR.tMax,Math.max(0.62,(L.room-GP_DUNE_AIR.keep)/Math.max(10,v))):Math.min(mega?1.55:1.2,Math.max(0.62,(L.room-(mega?14:8))/Math.max(10,v)));let vy=Math.min(Math.max(L.slope,mega?0.16:0.09)*v,dune?GP_DUNE_AIR.vy:(mega?7.6:6.5));
  for(let n=0;n<(dune?9:5)&&gpFlightT(L,v,vy,ry)>tMax;n++)vy*=dune?0.92:0.86;
  if(dune&&v>22&&(kt.player||kt.pos.distanceToSquared(R3.me.pos)<8100)){const tn=R3.curve.getTangentAt(kt.t),P=kt.pos;for(let q=0;q<(kt.player?16:8);q++)R3.dust.emit(P.x+(Math.random()-0.5)*2.2,ry+0.2,P.z+(Math.random()-0.5)*2.2,tn.x*v*0.5+(Math.random()-0.5)*7,2.5+Math.random()*4.5,tn.z*v*0.5+(Math.random()-0.5)*7,0.86,0.64,0.38,1.25);}   // sand thrown off the crest   // the real flight over the real road ahead (a hillside can fall away under the car): never longer than the room allows
  const over=Math.max(0,((kt.t-L.t+1.5)%1-0.5)*R3.len);kt.air=true;kt.airT=0;kt.airPeak=0;kt.y=Math.max(ry,L.y+vy*over/Math.max(10,v));kt.vy=vy;kt.takeoff={v:Math.round(v*3.6),vy:+vy.toFixed(2),f:R3.frameN,kind:L.kind};kt.lipT=R3.simT||0;gpRivalTrick(kt,vy);return true;}
/* Dakar dunes (job 1109-1803): off a dune crest the car is thrown UP (climb rate up to vy m/s) and may fly up to tMax seconds, always landing at least `keep` metres before the next bend */
const GP_DUNE_AIR={vy:8.5,tMax:2.0,keep:48};
function gpVert(kt,pos,dt,waiting){if(kt.jet){gpJetVert(kt,pos,dt,waiting);return;}const ry=pos.y;
  if(kt.vy==null||waiting||kt.ry==null||dt<=0){kt.y=ry;kt.vy=0;kt.ry=ry;kt.air=false;kt.airT=0;kt.tPrev=kt.t;return;}
  if(Math.abs(ry-kt.ry)>0.6+Math.abs(kt.speed)*dt*0.35){kt.y=ry;kt.vy=0;kt.ry=ry;kt.air=false;kt.airT=0;kt.tPrev=kt.t;kt.trick=null;pos.y=ry;return;}   // a placement jump (grid, test hook), not motion
  const tilt=Math.abs((kt.pS||0)-(kt.sR||0))*1.45,rv=Math.max(-kt.speed*0.6-2,Math.min(kt.speed*0.6+2,(ry-kt.ry)/dt));kt.ry=ry;
  if(!kt.air&&kt.tPrev!=null&&R3.lips){const a=kt.tPrev,b=kt.t;if(b!==a&&kt.speed>0){for(const L of R3.lips){const hit=a<=b?(a<L.t&&b>=L.t):(a-b>0.5&&(a<L.t||b>=L.t));if(hit&&gpLaunch(kt,L,ry)){pos.y=kt.y;kt.tPrev=kt.t;return;}}}}
  kt.tPrev=kt.t;
  if(!kt.air&&R3.lips&&kt.speed>0){for(const L of R3.lips){let u=(kt.t-L.t)*R3.len;if(u>R3.len/2)u-=R3.len;else if(u<-R3.len/2)u+=R3.len;if(u>-52&&u<=0.5){kt.y=ry;kt.vy=rv;pos.y=ry+tilt;return;}}}   // on the ramp the car stays on it, right up to the lip
  if(!kt.air){const g=gpNearJump(kt)?GP_G:GP_G+0.0045*kt.speed*kt.speed,yb=kt.y+kt.vy*dt-0.5*g*dt*dt;   // downforce keeps the car on the road over ordinary crests
    if(yb>ry+0.04&&kt.speed>14){kt.air=true;kt.airT=0;kt.airPeak=0;kt.y=yb;kt.vy-=GP_G*dt;kt.takeoff={v:Math.round(kt.speed*3.6),vy:+kt.vy.toFixed(2),f:R3.frameN};}
    else{kt.y=ry;kt.vy=rv;}}
  else{kt.airT+=dt;const inW=R3.dp&&kt.y<R3.dp.y,gm=(kt.player&&!R3.dp&&R3.pitchIn)?(R3.pitchIn>0?0.62:1.55):1;kt.vy-=(inW?GP_G*0.46:GP_G*gm)*dt;if(inW)kt.vy*=Math.exp(-1.5*dt);kt.y+=kt.vy*dt;kt.airPeak=Math.max(kt.airPeak,kt.y-ry);
    if(kt.y-(kt.airT>0.3&&kt.vy<0?Math.min(0.9,tilt):0)<=ry){   // touches down on its lowest tyre (nose-low after a long flight), then pivots onto the road
      const imp=Math.max(0,rv-kt.vy);kt.y=ry;kt.vy=rv;kt.air=false;if(kt.player&&R3.flyEnd)R3.flyEnd();gpTrickLand(kt);gpLand(kt,imp);}}
  pos.y=kt.air?kt.y:kt.y+tilt;}   // on the ground the car rides on whichever tyre is lowest while its pitch catches up with the road
function gpNearJump(kt){const C=R3.C,J=C.jumps;if(!J||!J.length)return false;const d=kt.t*C.lapM;for(const q of J){let u=d-q[0];if(u>C.lapM/2)u-=C.lapM;else if(u<-C.lapM/2)u+=C.lapM;if(u>-60&&u<40)return true;}return false;}
function gpLand(kt,imp){const big=kt.airT>0.22||imp>2.5;if(!big)return;
  const trk=kt.racer.car.type==="truck";kt.sqV=(kt.sqV||0)-Math.min(trk?4.2:2.6,imp*(trk?0.36:0.22));   // springs squash, then a little bounce (trucks: a big soft one)
  if(trk&&kt.speed>8)kt.speed*=1.02;   // long-travel suspension: trucks keep their speed over the landing
  const near=kt.player||kt.pos.distanceToSquared(R3.me.pos)<3600;
  if(near){kt.g.updateMatrixWorld(true);const V=R3.tmpV;[-1,1].forEach(sd=>[kt.xr,-kt.xr].forEach(zz=>{V.set(sd*(kt.tyreX||kt.S.w/2-0.04),0.1,zz);kt.g.localToWorld(V);
      const tn=R3.curve.getTangentAt(kt.t),cv=kt.speed*0.6;for(let q=0;q<(kt.player?(kt.airT>0.7?7:4):2);q++)R3.dust.emit(V.x,V.y+0.15,V.z,tn.x*cv+(Math.random()-0.5)*(kt.airT>0.7?7:4),0.8+Math.random()*(kt.airT>0.7?2.6:1.6),tn.z*cv+(Math.random()-0.5)*(kt.airT>0.7?7:4),0.66,0.6,0.5,kt.airT>0.7?1.1:0.9);}));
    if(imp>4.5){V.set(0,0.12,0);kt.g.localToWorld(V);for(let q=0;q<10;q++)R3.sparks.emit(V.x,V.y,V.z,(Math.random()-0.5)*5,1+Math.random()*2.5,(Math.random()-0.5)*5,1,0.75,0.3,0.35);}}
  if(kt.player){R3.shake=Math.min(0.55,0.05+imp*0.055);GPA.play("land");
    const lg=R3.jumpLog||(R3.jumpLog=[]);lg.push({f:R3.frameN,t:+(R3.simT||0).toFixed(2),air:+kt.airT.toFixed(2),peak:+kt.airPeak.toFixed(2),impact:+imp.toFixed(1),takeoffKmh:kt.takeoff?kt.takeoff.v:null});
    if(kt.airT>0.4&&R3.mode==="race"&&!kt.noBurst){gpSkill("Big air",Math.round(kt.airT*700),true);gpAirBurst(kt.airT);}}}
function gpAirBurst(t){const e=$("gp3Air");if(!e)return;const ms=$("gp3Msg");if(ms)ms.classList.remove("show");e.innerHTML='<b>BIG AIR!</b><small>'+t.toFixed(1)+' s</small>';e.classList.remove("on");void e.offsetWidth;e.classList.add("on");}
/* "TOO FAST!" banner with an arrow for the bend: shown when a tight corner is coming up and Prince is still too fast to make it
   by braking normally from here (his speed vs the corner's safe speed and the distance left); it goes away as soon as he brakes */
function gpWarn(me,waiting){const R=R3,M=R.M,ds=R.len/M,i=Math.floor(me.t*M)%M,v=me.speed,ce=$("gp3Cue");if(!ce)return;let on=false,dir=0;
  if(!waiting&&!R.done&&!me.air&&!me.loss&&v>12&&R.vLim){const gk=Math.sqrt((me.gripK||1)*(R.upGrip||1)),brk=22,n=Math.round(170/ds);
    for(let k=3;k<n;k+=2){const j=(i+k)%M,vl=R.vLim[j]*gk;if(vl<v*0.93&&vl<me.max*0.8){const need=(v*v-vl*vl)/(2*brk)+12;if(k*ds<need+28){on=!me.brakeOn;dir=R.kap[j]>0?-1:1;}break;}}}
  if(ce.classList.contains("on")!==on)ce.classList.toggle("on",on);
  if(on&&ce.dataset.d!==String(dir)){ce.dataset.d=String(dir);ce.innerHTML=(dir<0?'<i>❮❮</i>':'')+'<b>TOO FAST!</b>'+(dir>0?'<i>❯❯</i>':'');}}
/* ---------- car-to-car contact (racers and traffic): smooth and kid-fair ----------
   Every car is a box in the road's frame (along-road metres x across-road metres; Prince's box turns with his slide angle).
   When two boxes overlap, the shallower axis is the contact normal: a side rub separates sideways, a nudge from behind
   separates along the road. Only the overlap itself is removed (split by weight), so nothing snaps or teleports. A closing
   speed turns into a soft bounce (restitution 0.2) shared by both cars plus ~1% speed loss each; separating cars are left
   alone, and a tiny sideways nudge keeps a nose-to-tail pair from sticking. No yaw kick, so nobody spins. Run up to 3
   passes per frame, with the road-edge limits applied between passes. */
function gpYawRel(b){return b.player?Math.max(-0.7,Math.min(0.7,(b.headA||0)+(b.lossA||0))):(b.yawRel||0);}   // body yaw relative to the road (+ = nose toward +x)
function gpLatV(b){const fl=b.jet&&b.jet.ph==="fly"?Math.sin(b.jet.hdg||0)*Math.max(10,b.speed)/(R3.W-1.2):0;return b.player?(b.jet?(b.jet.kx||0)+fl:b.sv):(b.bv||0)+fl;}
function gpAddLatV(b,v){if(b.player&&b.jet){b.jet.kx=Math.max(-0.5,Math.min(0.5,(b.jet.kx||0)+v));return;}if(b.player)b.sv=Math.max(-0.6,Math.min(0.6,b.sv+v));else b.bv=Math.max(-0.5,Math.min(0.5,(b.bv||0)+v));}
function gpLimX(b){if(b.jet&&(b.player||b.jet.ph==="fly"))return 99;return b.player?(R3.mode==="free"?1.15:1.22):(b.traffic?0.98:1.1);}
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
      for(let b=a+1;b<B.length;b++){const C=B[b];if(C.off)continue;if(A.netGone||C.netGone||A.netDone||C.netDone)continue;
        let dz=(C.t-A.t)*L;if(dz>L/2)dz-=L;else if(dz<-L/2)dz+=L;if(dz>12||dz<-12||Math.abs((C.x-A.x)*XS)>7)continue;
        // C's true position and road direction, seen from A's road frame (u = across, v = along): exact on bends and over the arc-length table
                gpRoadAt(A,RA);gpRoadAt(C,RC);if((A.air||C.air)&&Math.abs((A.air?A.y-RA.p.y:0)-(C.air?C.y-RC.p.y:0))>1.15)continue;   // one is flying over the other
        const wx=RC.x-RA.x,wz=RC.z-RA.z,u=wx*RA.nx+wz*RA.nz,v=wx*RA.tx+wz*RA.tz;
        const th=Math.atan2(RC.tx*RA.nx+RC.tz*RA.nz,RC.tx*RA.tx+RC.tz*RA.tz),ct=Math.cos(th),st=Math.sin(th);
        const hit=gpSat(0,0,gpYawRel(A),A.S.w/2,A.S.len/2,u,v,th+gpYawRel(C),C.S.w/2,C.S.len/2);if(!hit)continue;
        any=true;n++;const mA=A.mass||1,mC=C.mass||1,wA=mC/(mA+mC),wC=mA/(mA+mC),nu=hit.n[0],nv=hit.n[1],pen=hit.o+0.02;
        const cu=nu*ct-nv*st,cv=nu*st+nv*ct;   // the same normal in C's own road frame
        // remove just the overlap along the contact normal, split by weight (A goes -n, C goes +n)
        A.x-=nu*pen*wA/XS;C.x+=cu*pen*wC/XS;A._mv=C._mv=1;gpShiftT(A,-nv*pen*wA/L,waiting);gpShiftT(C,cv*pen*wC/L,waiting);
        // closing speed along the normal (m/s): A's velocity in its frame vs C's velocity turned into A's frame
        const aU=gpLatV(A)*XS,aV=A.speed,cU0=gpLatV(C)*XS,cV0=C.speed,cU=cU0*ct+cV0*st,cV=-cU0*st+cV0*ct,vrel=Math.max((A.net||C.net)?-2.5:((A.air||C.air||gpPace()==="gentle")?-4:-6),(cU-aU)*nu+(cV-aV)*nv);   // < 0: closing (online: a capped, gentle knock, since the other car is a moment old)
        const airSoft=(A.air||C.air)&&gpPace()==="gentle"?0.55:1;const bc=A._bc||(A._bc=new Map()),tn=R3.simT||0,hard=-vrel>2.5||!!(A.air||C.air),cool=hard&&tn-(bc.get(C)==null?-9:bc.get(C))<0.35;let impact=0;if(vrel<0&&!cool){impact=-vrel;if(hard)bc.set(C,tn);const e=impact>2.5?0.2:0;   // a real knock bounces softly; a slow push is a plain push (no frame-to-frame ping-pong)
          const j=-(1+e)*vrel/(1/mA+1/mC)*airSoft;gpAddLatV(A,-j*nu/mA/XS);A.speed-=j*nv/mA;gpAddLatV(C,j*cu/mC/XS);C.speed+=j*cv/mC;
          if(impact>0.8){const loss=Math.min(0.03,0.004*impact);A.speed*=1-loss;C.speed*=1-loss;}}   // the small speed loss is shared
        if(Math.abs(nv)>0.7){const sx=u>=0?1:-1,nud=0.04+Math.min(0.08,impact*0.006);gpAddLatV(A,-sx*nud);gpAddLatV(C,sx*nud);}   // nose to tail: a gentle sideways ease so the pair slides apart instead of sticking
        gpClampX(A);gpClampX(C);
        if(it===0&&(A.jet||C.jet)&&impact>0.5){const up=(A.y||0)>=(C.y||0)?1:-1,kick=Math.min(2.2,0.7+impact*0.3)*airSoft;if(A.jet&&A.jet.ph==="fly")A.jet.vh+=up*kick;if(C.jet&&C.jet.ph==="fly")C.jet.vh-=up*kick;}   // in the air a knock also lifts the top car and drops the other, a little
        if(it===0&&R3.online&&(A.net||C.net)&&(A.player||C.player)&&impact>0.6){const other=A.net?A:C,side=A.net?(Math.abs(nu)>0.3?-Math.sign(nu):(u>=0?-1:1)):(Math.abs(cu)>0.3?Math.sign(cu):(u>=0?1:-1));gpnBumpOut(other,side,impact);}
        if(it===0&&(A.player||C.player)){const fresh=R3.bumpT>0.6;R3.bumpT=0;
          if(fresh&&impact>1.2){GPA.play("bonk");R3.sk.clean=0;gpChainBreak();const pa=A.pos,pc=C.pos;for(let q=0;q<6;q++){const an=Math.random()*6.28;R3.sparks.emit((pa.x+pc.x)/2,(pa.y+pc.y)/2+0.6,(pa.z+pc.z)/2,Math.cos(an)*2.5,1.5+Math.random()*2,Math.sin(an)*2.5,1,0.75,0.35,0.3);}}}
        if(log&&(A.player||C.player)&&it===0)log.push({f:R3.frameN,o:+hit.o.toFixed(3),nu:+nu.toFixed(2),nv:+nv.toFixed(2),impact:+impact.toFixed(2)});}}
    if(!any)break;}
  return n;}
/* rivals: follow the racing line, but look ~20 m ahead for anything in the way (rivals, traffic, Prince) and pass on the freer
   side; if both sides are shut, hold its speed (kt.capSpd) instead of running into it. When Prince is alongside or just
   behind, keep a car's width plus a metre away from him. Sideways speed is capped (~2.7 m/s), so a rival never darts. */
function gpRivalSteer(kt,i,waiting){const XS=R3.W-1.2,L=R3.len,me=R3.me,hw=kt.S.w/2;let target=R3.lineX[(i+Math.round(12/(L/R3.M)))%R3.M];kt.capSpd=null;if(R3.dp)target=gpDeepRival(kt,target);
  if(waiting)return 0;
  if(kt.testHold){kt.capSpd=kt.testHold.speed;return Math.max(-0.42,Math.min(0.42,(kt.testHold.x-kt.x)*1.5));}   // contact test only: hold a lane and a speed
  let blk=null,bd=1e9;for(const o of R3.bodies){if(o===kt||o.off||o.jet)continue;let dz=((o.t-kt.t+1.5)%1-0.5)*L;const need=(hw+o.S.w/2+0.7)/XS;
    if(dz>kt.S.len*0.3&&dz<20+Math.max(0,kt.speed-o.speed)*1.2&&Math.abs(o.x-kt.x)<need&&dz<bd){blk=o;bd=dz;}}
  if(blk){const need=(hw+blk.S.w/2+1.0)/XS,free=x=>Math.abs(x)<=0.98&&!R3.bodies.some(o=>o!==kt&&o!==blk&&!o.off&&Math.abs(((o.t-kt.t+1.5)%1-0.5)*L-bd)<9&&Math.abs(o.x-x)<(hw+o.S.w/2+0.5)/XS);
    const l=blk.x-need,r=blk.x+need,lo=free(l),ro=free(r);
    if(lo||ro)target=lo&&ro?(Math.abs(l-target)<Math.abs(r-target)?l:r):(lo?l:r);
    if(Math.abs(blk.x-kt.x)<(hw+blk.S.w/2+0.3)/XS&&bd<12+Math.max(0,kt.speed-blk.speed)*0.8)kt.capSpd=Math.max(0,blk.speed*0.97-(bd<kt.S.len?2:0));}
  const dzp=((me.t-kt.t+1.5)%1-0.5)*L,DEF=gpPK().def||0,side=(kt.S.len+me.S.len)/2+1.2;
  if(!me.jet&&(DEF?(dzp>-side&&dzp<side):(dzp>-9&&dzp<6))){const gap=(hw+me.S.w/2+1.0)/XS;if(Math.abs(me.x-kt.x)<gap){const sd=kt.x>=me.x?1:-1,want=me.x+sd*gap;target=Math.abs(want)<=0.98?want:me.x-sd*gap;}}
  else if(DEF&&!me.jet&&!blk&&!kt.air&&dzp<=-side&&dzp>-24&&me.speed>kt.speed-1.5&&kt.speed>kt.max*0.4){const now=R3.simT||0;   // defending: cover the side he is coming up on (one move, held ~1.8 s: no weaving)
    if(!(kt.defU>now)){kt.defX=Math.max(-0.82,Math.min(0.82,target+(me.x-target)*DEF*0.85));kt.defU=now+1.8;(R3.defLog=R3.defLog||[]).push(+now.toFixed(1));}target=kt.defX;}
  const gain=1.1+kt.racer.car.handle*0.18,vmax=0.42;return Math.max(-vmax,Math.min(vmax,(target-kt.x)*gain));}
/* put cars that a contact moved back on the road this same frame (the view never shows the overlap that was just removed) */
function gpPlaceAll(){const XS=R3.W-1.2,T=R3.T;R3.karts.forEach(kt=>{if(!kt._mv)return;kt._mv=0;const pos=R3.curve.getPointAt(kt.t),tan=R3.curve.getTangentAt(kt.t);const nx=-tan.z,nz=tan.x,nl=Math.hypot(nx,nz)||1;
  pos.x+=nx/nl*kt.x*XS;pos.z+=nz/nl*kt.x*XS;if(kt.air)pos.y=kt.y;kt.pos.copy(pos);kt.g.position.copy(pos);});}   // a car bumped in flight stays in the air
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
  if(R.online&&R.phase==="intro"){R.countdown=3.8;if(!R.netGo||now<R.netGo-3000)return;R.phase="count";R.cdF0=R.netGo-3000;R.cdStep=-1;const cd=$("gp3Card");if(cd)cd.classList.add("hide");}   // online: one GO for everyone, from the server's clock; a late screen joins the count where it stands
  if(R.phase==="intro"){R.countdown=3.8;if(!R.cdReq)return;R.cdReq=false;R.phase="count";R.cdF0=now;R.cdStep=-1;const cd=$("gp3Card");if(cd)cd.classList.add("hide");}
  if(R.phase!=="count")return;
  let e=(now-R.cdF0)/1000,step=Math.min(3,Math.floor(e)),stall=0;
  if(step>R.cdStep+1&&!R.online){step=R.cdStep+1;stall=now-(R.cdF0+step*1000);R.cdF0=now-step*1000;e=step;}   // a frame that arrives very late (device hiccup) never swallows a number: show the next one now and give it its full second
  if(step!==R.cdStep){R.cdStep=step;const n=3-step;R.setLights(n);R.litShown=n;R.setScreen(n>0?String(n):"GO!");GPA.play(n>0?"beep":"go");
    const c=$("gp3Count");if(c){c.textContent=n>0?String(n):"GO!";c.classList.remove("pop");void c.offsetWidth;c.classList.add("show","pop");}
    let beepPerf=null;try{if(GPA.ctx&&GPA.ctx.getOutputTimestamp){const ts=GPA.ctx.getOutputTimestamp();beepPerf=+(ts.performanceTime+(GPA.ctx.currentTime-ts.contextTime)*1000).toFixed(2);}}catch(x){}
    R.cdLog.push({n,frame:R.frameN,frameMs:+now.toFixed(2),ideal:+(R.cdF0+step*1000).toFixed(2),callPerf:+performance.now().toFixed(2),beepPerf,beepAudio:GPA.ctx?+GPA.ctx.currentTime.toFixed(4):null,audioState:GPA.ctx?GPA.ctx.state:"none",lit:n,released:n===0,stallMs:+stall.toFixed(1)});
    if(n===0){R.phase="race";R.countdown=0;R.goAt=R.online?R.netGo:now;setTimeout(()=>{const cc=$("gp3Count");if(cc)cc.classList.remove("show");},800);}}
  if(R.phase==="count")R.countdown=Math.max(0.001,3-e);}
function gpUpdate(dt,waiting){
  const {karts,samples,M,len,T,me}=R3;
  const k=R3.keys;const left=k["arrowleft"]||k["a"]||R3.touchDir<0,right=k["arrowright"]||k["d"]||R3.touchDir>0,gas=R3.autoGas||k["arrowup"]||k["w"]||R3.gas||(me.jetGas>0&&me.speed<R3.vProf[Math.floor(me.t*R3.M)%R3.M]),driftKey=k[" "]||k["x"];let brake=k["arrowdown"]||k["s"]||R3.brake;
  if(me.jetGas>0)me.jetGas-=dt;if(R3.jetBrakeLock){if(!me.jet&&!brake)R3.jetBrakeLock=false;else brake=false;}   // a thumb or key still down from flying (DOWN, LAND) doesn't slam the brakes at touchdown
  gpBoostTick(dt,waiting);gpPack(dt,waiting);
  const V=R3.tmpV,sk=R3.sk;R3.bumpT+=dt;if(!waiting){R3.simT=(R3.simT||0)+dt;if(R3.relFrame==null)R3.relFrame=R3.frameN;}
  karts.forEach(kt=>{
    const i=Math.floor(kt.t*M)%M;const s=samples[i];
    const kap=R3.kap[i];                                   // signed curvature here (+ = left-hander)
    const offroad=Math.abs(kt.x)>1.05&&!kt.jet;
    if(kt.net){const t00=kt.t;gpNetKart(kt,dt);gpJetNetClaim(kt,t00);}else{   // a friend's car: their device drives it, this one only draws it
    let draft=false;if(!waiting&&!kt.jet&&kt.speed/kt.max>0.55){draft=karts.some(o=>{if(o===kt)return false;const d=(o.t-kt.t+1)%1;return d>0.003&&d<0.028&&Math.abs(o.x-kt.x)<0.32;});}kt.draft=draft;const dG=R3.online?gpnDraft(kt,dt,waiting):0;if(R3.online)kt.draft=dG>0.2;
    let band=1;if(!kt.player&&!waiting)band=gpBand(kt);
    const maxNow=waiting?0:kt.max*band*(R3.online?1+GPN_DRAFT*dG:(draft?1.07:1))*(kt.spin>0?0.6:1)*(R3.tw&&R3.tw.zoneAt(i,"ford")?0.9:1)*(offroad?(kt.player?Math.max(0.62,kt.offF):kt.offF):1)*(kt.drift?0.94:1)*(kt.boostT>0?kt.boostMul:1)*(kt.wobT>0?0.84:1)*(kt.dpSlow>0?kt.dpSlowK:1)*(kt.player?1+(kt.cu||0):1);
    kt.mxn=maxNow;
    const spd0=kt.speed/kt.max,inp=kt.player?(left?-1:0)+(right?1:0):0;
    if(kt.player){
      // steering input eases in and out (two cascaded smoothers = an S-curve over ~0.3 s): a tap never jerks the car
      const kS=1-Math.exp(-dt*(inp!==0?8:10));kt.st1+=(inp-kt.st1)*kS;kt.steerIn+=(kt.st1-kt.steerIn)*kS;
      // drift: tap BRAKE (or the drift key) while steering at speed to start it; it then holds while you keep steering into the
      // bend (GAS on, brake not needed), and ends cleanly when you let go of the steering or steer the other way
      const driftBtn=(brake||driftKey)&&inp!==0;
      if(!kt.drift&&driftBtn&&spd0>0.42&&!offroad&&!waiting&&!kt.air&&!kt.loss){kt.drift=inp;kt.off=0;kt.dHold=0;}
      if(kt.drift){kt.off=offroad?kt.off+dt:0;kt.dHold=inp===kt.drift?0:kt.dHold+dt;if(kt.dHold>(inp===-kt.drift?0.22:0.4)||kt.off>0.6||spd0<0.3)kt.drift=0;}
      const braking=brake&&!waiting;if(braking&&!kt.wasBrake&&spd0>0.6)kt.lockT=0.45;kt.wasBrake=braking;if(kt.lockT>0)kt.lockT-=dt;
      kt.brakeOn=braking;
      if(!gas||waiting)kt.gasT=0;
      if(waiting)kt.speed=0;
      else if(kt.jet)gpJetSpeed(kt,dt);
      else if(kt.air)kt.speed*=1-0.015*dt;   // flying: no grip for the pedals
      else if(brake){kt.speed=kt.speed>0.3?Math.max(0,kt.speed-(kt.drift?14:24)*dt):Math.max(-5,kt.speed-5*dt);}
      else if(gas||kt.boostT>0||kt.speed<0){kt.gasT+=dt;const launch=(kt.speed<maxNow*0.5?Math.min(1,0.62+kt.gasT*1.5):1);   // pull builds over the first ~0.25 s instead of jumping
        kt.speed+=(maxNow-kt.speed)*Math.min(1,dt*(kt.speed<maxNow?kt.accel/10*launch*(kt.boostT>0?2.4:1)*(1+(kt.cu||0)*1.5):(offroad?1.1:2.2)));}
      else{kt.speed=Math.max(0,kt.speed-(2.5+0.06*kt.speed)*dt);if(kt.speed>maxNow)kt.speed+=(maxNow-kt.speed)*Math.min(1,dt*(offroad?1.1:2.2));}   // coasting
    }else{
      // rivals follow the speed profile (real braking points for every corner), with a little driver variety, the odd mistake, and (Easy only) the quiet pack help
      const tgt0=kt.testHold?kt.testHold.speed:Math.min(maxNow,R3.vProf[(i+3)%M]*kt.aiSkill*band*(kt.boostT>0?kt.boostMul:1),kt.capSpd!=null?kt.capSpd:1e9);
      if(!waiting&&!kt.testHold&&!kt.jet){const now=R3.simT||0,PK=gpPK();if(kt.errN==null)kt.errN=now+PK.err*(0.5+Math.random()*1.2);if(now>kt.errN&&!kt.air){kt.errT=0.8+Math.random()*0.9;kt.errK=0.84+Math.random()*0.09;kt.errN=now+PK.err*(0.5+Math.random());(R3.errLog=R3.errLog||[]).push(+now.toFixed(1));}}
      let tgt=tgt0;if(kt.errT>0){kt.errT-=dt;tgt=tgt0*kt.errK;if(!kt.air)kt.x+=(Math.sign(kap)||(kt.x>=0?1:-1))*0.16*dt;}
      kt.brakeOn=!waiting&&kt.speed>tgt+0.8;
      if(waiting)kt.speed=0;else if(kt.jet)gpJetSpeed(kt,dt);else if(kt.air)kt.speed*=1-0.015*dt;else if(kt.brakeOn)kt.speed=Math.max(tgt,kt.speed-26*dt);else kt.speed+=(tgt-kt.speed)*Math.min(1,dt*(kt.speed<tgt?kt.accel/10*(kt.boostT>0?1.8:1):2.2));
    }
    // tyres: lateral load v²/R beyond the grip limit pushes the car to the outside of the bend and scrubs speed
    const spd=Math.abs(kt.speed)/kt.max;kt.px=kt.x;kt.spdV=spd;
    const onDirt=!!(R3.tw&&R3.tw.zoneAt&&R3.tw.zoneAt(i,"dirt"));
    const aLat=kt.speed*kt.speed*Math.abs(kap),grip=R3.grip*(offroad?0.5:1)*(onDirt?0.82*kt.dirtK:1)*(kt.drift?1.6:1)*(kt.player?R3.upGrip:1.06)*kt.gripK*(kt.player&&kt.wet?0.95:1);
    const ratio=aLat/grip,ex=Math.min(2.5,Math.max(0,ratio-1));kt.slip=ex;kt.load=ratio;
    if(kt.lossCool>0)kt.lossCool-=dt;
    if(kt.jetCalm>0){kt.jetCalm-=dt;kt.squeal=0;const vq=R3.vProf[(i+3)%M]*Math.sqrt((kt.gripK||1)*(R3.upGrip||1));if(kt.speed>vq)kt.speed=Math.max(vq,kt.speed-20*dt);}   // the first moments after a jet landing: the car is settled and eased to what the road allows, however the thumbs are
    if(kt.air||kt.jetCalm>0){kt.squeal=0;}   // in the air the tyres carry nothing
    else if(kt.player&&!waiting)gpGrip(kt,kap,ratio,ex,spd,dt,brake);
    else{kt.x+=Math.sign(kap)*(ex*1.7+0.12*spd*Math.min(1,ratio))*dt;if(ex>0&&!waiting)kt.speed=Math.max(0,kt.speed-ex*9*dt);}
    if(kt.player&&!waiting){
      // lateral speed follows the smoothed stick with some inertia, so the car carries its weight across the road
      let tgt;if(kt.drift){const same=inp===kt.drift,opp=inp===-kt.drift;tgt=kt.drift*kt.steer*Math.max(.35,spd)*(same?0.32:(opp?-0.3:0.14));}
      else tgt=kt.steerIn*kt.steer*(R3.mode==="free"?0.36:0.42)*Math.max(.4,spd);
      if(kt.loss)tgt*=0.35;   // sliding: the steering only half answers until the car gathers itself
      if(kt.jet)kt.sv=0;else if(kt.air&&!kt.wet)kt.sv*=Math.exp(-0.4*dt);else kt.sv+=(tgt-kt.sv)*Math.min(1,dt*(kt.drift?2.8:(kt.wet?(kt.air?1.7:3.2):4.5)));kt.x+=kt.sv*dt;   // under water the car floats: the steering takes a moment longer to bite, and it still answers on the way down
    }
    else if(!kt.player){if(!kt.air)kt.x+=gpRivalSteer(kt,i,waiting)*dt;if(kt.bv){kt.x+=kt.bv*dt;kt.bv*=Math.exp(-5*dt);if(Math.abs(kt.bv)<0.002)kt.bv=0;}}
    if(kt.air&&!(kt.jet&&(kt.player||kt.jet.ph==="fly"))&&Math.abs(kt.x)>0.8)kt.x-=Math.sign(kt.x)*(Math.abs(kt.x)-0.8)*2.6*dt;   // flying cars ease in from the edge: a landing is always on the road, never against the wall
    if(kt.player&&!kt.jet&&R3.mode==="race"&&!kt.drift&&!left&&!right&&Math.abs(kt.x)>0.95)kt.x-=Math.sign(kt.x)*dt*0.7;
    if(kt.player&&!kt.jet&&R3.mode==="free"&&!kt.drift&&!left&&!right&&Math.abs(kt.x)>0.7)kt.x-=Math.sign(kt.x)*dt*0.5;
    const lim=kt.player?(R3.mode==="free"?1.15:1.22):1.1;
    if(Math.abs(kt.x)>lim&&!(kt.jet&&(kt.player||kt.jet.ph==="fly"))){const sd=Math.sign(kt.x),vOut=(kt.x-kt.px)/Math.max(dt,0.001)*sd;kt.x=sd*lim;if(kt.player&&!waiting)gpWallHit(kt,sd,vOut,dt,inp);}
    if(kt.wallT>0)kt.wallT-=dt;   // road edge is 1.19 (the car's outer wheels on the shoulder), the rail is 1.6
    if(kt.hop>0)kt.hop-=dt;
    const before=kt.t,vAlong=kt.jet?gpJetMove(kt,inp,kap,dt,i):kt.speed;kt.t=(kt.t+vAlong*dt/len+1)%1;
    if(kt.player&&!waiting){if(kt.jet)gpJetRingCheck(kt,before);else gpJetPick(kt,before);}else if(kt.jet&&!waiting)gpJetRingCheck(kt,before);
    gpLapCross(kt,before,waiting);
    if(kt.player&&!waiting&&!R3.done&&R3.mode==="race"&&kt.speed>1){const tt=R3.trapT;   // forwards only (reversing over the line read as a negative speed)
      const crossed=before<=kt.t?(before<tt&&kt.t>=tt):(before<tt||kt.t>=tt);if(crossed){const mph=Math.round(kt.speed*GP_MPH);R3.trapBest=Math.max(R3.trapBest,mph);const r=kt.speed/(kt.max||1);const stars=r>=0.97?"★★★":r>=0.9?"★★":"★";gpMsg("Speed trap "+mph+" mph "+stars);GPA.play("trap");gpSkill("Speed trap",mph*4,true);}}
    if(kt.player&&R3.gates&&!waiting){const G=R3.gates;G.ts.forEach(gt=>{const crossed=before<=kt.t?(before<gt&&kt.t>=gt):(before<gt||kt.t>=gt);if(crossed)G.flash=1;});}
    }
    const spd=kt.net?Math.abs(kt.speed)/kt.max:kt.spdV;
    // place the car
    const pos=R3.curve.getPointAt(kt.t),tan=R3.curve.getTangentAt(kt.t).normalize(),nor=new T.Vector3(-tan.z,0,tan.x).normalize();
    pos.addScaledVector(nor,kt.x*(R3.W-1.2));if(kt.net){kt.ry=pos.y;if(kt.air)pos.y=kt.y;else kt.y=pos.y;}else gpVert(kt,pos,dt,waiting);kt.pos.copy(pos);
    kt.g.position.copy(pos);kt.travel+=Math.abs(kt.speed)*dt;kt.wheelPhase+=kt.speed*dt/Math.max(0.01,kt.wheelRadius);
    let y=0;if(offroad)y=Math.abs(Math.sin(kt.t*len*3))*0.08;if(kt.hop>0)y+=Math.sin(Math.PI*(1-kt.hop/0.22))*0.25;
    const vib=spd*(Math.sin(kt.travel*(kt.racer.car.type==="suv"||kt.racer.car.type==="truck"?5.2:7.4))*0.005+Math.sin(kt.travel*2.3+1.1)*0.002);kt.body.position.y=kt.pic?(offroad?Math.min(0.08,y+vib):0):y+vib;   // photo tyre line stays planted on-road; the 3D fallback keeps its suspension motion
    {const fl=Math.hypot(tan.x,tan.z)||1,sR=kt.sR=tan.y/fl,sT=kt.jet?sR*(kt.jet.e||0):(kt.air?Math.max(-0.3,Math.min(0.4,kt.vy/Math.max(8,kt.speed)))*0.85:sR);   // in the air the nose follows the flight path (up off the ramp, dipping as it falls)
      kt.pS=kt.pS==null?sR:kt.pS+(sT-kt.pS)*Math.min(1,dt*(kt.jet?7:(kt.air?2.6:30)));kt.g.lookAt(pos.x+tan.x/fl,pos.y+kt.pS,pos.z+tan.z/fl);}
    const yaw=Math.atan2(tan.x,tan.z);let yawRate=0;if(kt.yaw!==null){let d=yaw-kt.yaw;if(d>Math.PI)d-=Math.PI*2;if(d<-Math.PI)d+=Math.PI*2;yawRate=d/Math.max(dt,0.001);}kt.yaw=yaw;
    const vx=(kt.x-kt.px)/Math.max(dt,0.001);
    if(kt.player){
      // heading: the nose points where the car is really going (lateral speed vs forward speed) plus the drift angle; a damped
      // spring gives the body weight - it swings into a slide, holds it, and settles back without snapping
      const inpN=(left?-1:0)+(right?1:0),opp=kt.drift&&inpN===-kt.drift,latMs=kt.sv*(R3.W-1.2);
      const latA=Math.max(-0.2,Math.min(0.2,0.8*Math.atan2(latMs,Math.max(6,Math.abs(kt.speed))))),headT=kt.drift?Math.max(-0.48,Math.min(0.48,latA*0.5+kt.drift*(opp?0.18:0.36))):latA+((R3.C.theme==="dakar"&&!kt.air&&R3.tw&&R3.tw.zoneAt(i,"dirt"))?kt.steerIn*0.13*Math.min(1,spd*1.5):0);   // a held drift settles near 22-27 degrees
      if(kt.wallRec>0)kt.wallRec-=dt;const hk=kt.wallRec>0?64:38,hc=kt.wallRec>0?14:10.5;if(kt.jet){kt.headA=kt.jet.hdg;kt.headV=0;}else{kt.headV+=((headT-kt.headA)*hk-kt.headV*hc)*dt;kt.headA+=kt.headV*dt;}kt.g.rotateY(-(kt.headA+(kt.lossA||0)));
      const ph=window.__gp&&window.__gp.phys;if(ph){ph.slipDeg=kt.headA*57.3;ph.steerIn=kt.steerIn;ph.sv=kt.sv;ph.drift=kt.drift;ph.x=kt.x;ph.speed=kt.speed;}
    }else{kt.yawRel=kt.net?(kt.netA||0):vx*0.05+(kt.drift?kt.drift*0.35:0);kt.g.rotateY(-kt.yawRel);}
    const heavy=kt.racer.car.type==="suv"||kt.racer.car.type==="truck",settle=heavy?4.5:6,rollMax=kt.pic?0:(heavy?0.105:0.09);
    const acc=(kt.speed-kt.lastSpeed)/Math.max(dt,0.001);kt.lastSpeed=kt.speed;
    if(kt.glb){   // model cars: body on springs (a touch of overshoot) - leans out of corners and slides, dives on the brakes, squats on launch
      // roll saturates softly at ~6 deg in the hardest corners / slides; dive reaches ~3.7 deg on the brakes. The body turns about a
      // roll centre 0.32 m up (not the ground), so the outside drops onto its wheels and the inside lifts, and the tyres stay on the road.
      const G=kt.glb,lat=kt.player?-kt.sv*0.2:-vx*0.07,RM=0.125;
      const rawR=yawRate*0.19*spd+lat+(kt.drift?-kt.drift*0.06:0),rollT=waiting?0:RM*Math.tanh(rawR/RM);
      G.rollV+=((rollT-kt.roll)*70-G.rollV*11)*dt;kt.roll+=G.rollV*dt;
      const pitchT=waiting?0:Math.max(-0.045,Math.min(0.065,-acc*0.0034+(kt.brakeOn&&spd>0.15?0.038:0)));
      G.pitchV+=((pitchT-kt.pitch)*70-G.pitchV*8.5)*dt;kt.pitch+=G.pitchV*dt;
      kt.body.position.y+=-Math.abs(kt.roll)*0.03-Math.max(0,kt.pitch)*0.2;}   // the body sits down a little into the lean / dive
    else{const rollT=Math.max(-rollMax,Math.min(rollMax,yawRate*0.18*spd-vx*0.04+(kt.drift?-kt.drift*0.05:0)));kt.roll+=(rollT-kt.roll)*Math.min(1,dt*settle);
    const pitchMax=kt.pic?0.008:0.045,pitchT=Math.max(-pitchMax,Math.min(pitchMax,-acc*(kt.pic?0.00055:(heavy?0.0034:0.003))));kt.pitch+=(pitchT-kt.pitch)*Math.min(1,dt*settle);}
    kt.body.rotation.z=kt.roll;kt.body.rotation.x=kt.pitch;if(kt.jet)gpJetPose(kt,dt,yawRate);gpJetGearTick(kt,dt);gpTrickTick(kt,dt);if(kt.trick||kt.tkRe||kt.wobT>0||kt.tkLift)gpTrickPose(kt);
    if(kt.sqV||kt.sq){kt.sqV+=(-kt.sq*170-kt.sqV*13)*dt;kt.sq+=kt.sqV*dt;if(Math.abs(kt.sq)<1e-4&&Math.abs(kt.sqV)<1e-3){kt.sq=0;kt.sqV=0;}}
    kt.hang=(kt.hang||0)+(((kt.air&&kt.airT>0.06&&kt.y-(kt.ry||0)>1.1)?0.12:0)-(kt.hang||0))*Math.min(1,dt*(kt.air?9:22));
    kt.body.position.y+=(kt.sq||0)+kt.hang*0.35+(kt.tkLift||0);if(kt.wet&&!kt.air&&kt.glb){const bb=(R3.simT||0)*2.1+kt.t*40;kt.body.position.y+=Math.sin(bb)*0.05;kt.body.rotation.z+=Math.sin(bb*0.7)*0.016;}if(kt.hubs)kt.hubs.forEach(h=>{h.position.y=h.userData.y0-kt.hang;});
    if(kt.shadows&&kt.air){const lift=Math.max(0,kt.y-kt.ry),hide=!!R3.dp&&lift>2;kt.shDp=hide;kt.shadows.forEach(s=>{if(s.userData.y0==null)s.userData.y0=s.position.y;s.position.y=s.userData.y0-lift;if(R3.dp)s.visible=!hide;});}
    else if(kt.shadows&&kt.shadows[0]&&kt.shadows[0].userData.y0!=null&&kt.shadows[0].position.y!==kt.shadows[0].userData.y0)kt.shadows.forEach(s=>{s.position.y=s.userData.y0;if(R3.dp)s.visible=true;});
    if(kt.glb){const py=kt.glb.pivotY,P=V.set(0,py,0).applyEuler(kt.body.rotation);kt.body.position.x=-P.x;kt.body.position.y+=py-P.y;kt.body.position.z=-P.z;}   // pivot about the roll centre
    if(kt.jet&&kt.trick&&kt.player){const A0=gpTrickAngle(kt);if(A0.k==="flip"){kt.body.position.y+=(1-Math.cos(A0.a))*3.6;kt.body.position.z+=Math.sin(A0.a)*3.6;}else if(A0.k==="roll")kt.body.position.x+=Math.sin(A0.a)*1.1;}   // a loop really circles; a barrel roll corkscrews
    if(kt.pic){   // picture cars: body lean / tail lift / kerb chatter targets for the sprite shader (gpPicUpdate springs toward them)
      const cl=-yawRate*0.06*spd+(kt.player?kt.steerIn*0.03*spd+kt.headA*0.09:0);kt.leanT=Math.max(-0.06,Math.min(0.06,cl));   // small roll, glued to the road (job 1108-0900)
      kt.liftT=waiting?0:Math.max(-0.035,Math.min(0.06,-acc*0.0022));kt.dipT=waiting?0:Math.max(-0.02,Math.min(0.038,-acc*0.0016));   // gas: rear squats; brake: tail up + roof dips
      const edge=Math.abs(kt.x)>0.97&&spd>0.15;kt.knock=Math.max(0,(kt.knock||0)-dt*3);
      kt.chatter=(edge?Math.sin(kt.travel*11)*0.013*Math.min(1,spd*1.5):0)+kt.knock*Math.sin(kt.travel*5+R3.time*0.04)*0.03;}
    let stT;if(kt.glb){const path=Math.atan(2.77*kap*(kt.speed>0.5?1:0));   // Ackermann angle for the bend (wheelbase 2.77 m)
      stT=kt.player?(kt.drift?path*0.4+kt.headA*1.05-kt.steerIn*0.06:path-kt.steerIn*0.42+kt.headA*0.25):path-vx*0.3;   // + = wheels point left; in a drift they point back along the slide (counter-steer)
      if(kt.lossA)stT+=kt.lossA*0.6;stT=Math.max(-0.55,Math.min(0.55,stT));}
    else stT=Math.max(-0.45,Math.min(0.45,yawRate*0.32-vx*0.22+(kt.drift?kt.drift*0.35:0)));
    kt.steerVis+=(stT-kt.steerVis)*Math.min(1,dt*(kt.glb?12:10));kt.steers.forEach(h=>h.rotation.y=kt.steerVis);
    kt.wheels.forEach(w=>w.rotation.x+=kt.speed*dt/w.userData.rad);
    if(kt.glb)gpGlbUpdate(kt,dt);else kt.tailMat.emissiveIntensity=kt.brakeOn?3.4:0.9;
    if(kt.pic){if(!kt.player&&!waiting&&spd>0.8&&Math.random()<dt*0.1)gpFlame(kt,0.3);gpPicUpdate(kt,dt,R3.camPos,kt.player?((left?-1:0)+(right?1:0)):0);}
    // effects: tyre smoke + skid marks only for a real drift/brake-slide; dust stays off-road
    const near=kt.player||(kt.pos.distanceToSquared(me.pos)<2500&&kt.pos.distanceToSquared(R3.camPos)>30);
    const driftSlide=(!!kt.drift||!!kt.loss)&&spd>0.3,squealPuff=!kt.air&&(kt.squeal||0)>0.45&&spd>0.4,brakeSlide=kt.brakeOn&&((kt.slip>0.16&&spd>0.55)||(kt.lockT>0&&spd>0.5)),skid=!offroad&&!kt.air&&(driftSlide||brakeSlide||squealPuff);if(!skid)kt.skidD=0;
    if(near&&(skid||(offroad&&spd>0.2))){kt.g.updateMatrixWorld(true);
      [-1,1].forEach(sd=>{V.set(sd*(kt.tyreX||kt.S.w/2-0.04),0.1,kt.xr);kt.g.localToWorld(V);
        if(skid){const hero=kt.player&&!!kt.glb;kt.smk=(kt.smk||0)+dt*(kt.player?(driftSlide?(hero?34:9):(hero?20:6)):4);while(kt.smk>=1){kt.smk-=1;const big=kt.player&&driftSlide?(hero?4.4:1.35):(hero?3.4:1),lf=hero?(driftSlide?3.1:2.2):big;   // the model car's smoke is a big billowing white cloud that hangs behind it
          const sp=hero?2.2:0.9,cv=hero?kt.speed*(driftSlide?0.6+Math.random()*0.2:0.3+Math.random()*0.2):-0.8;   // hero puffs leave with part of the car's speed, so the cloud billows right behind it instead of vanishing off-screen
          const ox=hero&&driftSlide?-kt.drift*(1.2+Math.random()*1.6):0;R3.smoke.emit(V.x+(Math.random()-0.5)*0.3,V.y+0.14,V.z+(Math.random()-0.5)*0.3,(Math.random()-0.5)*sp+tan.x*cv-tan.z*ox,(hero?0.5:0.2)+Math.random()*(hero?0.8:0.3),(Math.random()-0.5)*sp+tan.z*cv+tan.x*ox,(0.5+Math.random()*0.3)*big,(hero?0.55+Math.random()*0.3:0.3+Math.random()*0.18)*lf);}}
        else if(Math.random()<0.6)R3.dust.emit(V.x,V.y+0.2,V.z,-tan.x*3+(Math.random()-0.5)*2,0.8+Math.random()*1.2,-tan.z*3+(Math.random()-0.5)*2,0.6,0.5,0.35,0.9);});}
    if(skid&&near){kt.skidD+=kt.speed*dt;if(kt.skidD>0.9){const dl=Math.min(6,kt.skidD);kt.skidD=0;const D=R3.dummy;const fw=Math.atan2(tan.x,tan.z)-(kt.player?kt.headA+(kt.lossA||0):(kt.drift?kt.drift*0.42:0));   // each mark spans the distance since the last one, so the trail is continuous at any frame rate
      [-1,1].forEach(sd=>{V.set(sd*(kt.tyreX||kt.S.w/2-0.04),0,kt.xr);kt.g.localToWorld(V);D.position.set(V.x-tan.x*dl*0.5,kt.pos.y+0.028,V.z-tan.z*dl*0.5);D.rotation.set(0,fw,0);D.scale.set(1,1,dl+0.1);D.updateMatrix();const si=R3.skN;R3.skids.setMatrixAt(si,D.matrix);R3.skidLife[si]=4;R3.skidFade.setX(si,1);R3.skN=(si+1)%700;});R3.skids.instanceMatrix.needsUpdate=true;R3.skidFade.needsUpdate=true;}}
    // Coast Road: brown dust from both rear wheels on the dirt, a big spray through the ford
    if(R3.tw&&near&&!waiting&&!kt.jet&&spd>0.12){const onDirt=R3.C.theme!=="dakar"&&R3.tw.zoneAt(i,"dirt"),inFord=R3.tw.zoneAt(i,"ford");if(onDirt||inFord){kt.g.updateMatrixWorld(true);
      [-1,1].forEach(sd=>{V.set(sd*(kt.tyreX||kt.S.w/2-0.04),0.15,kt.xr);kt.g.localToWorld(V);
        if(onDirt&&Math.random()<(kt.player?0.9:0.5))R3.dust.emit(V.x,V.y+0.1,V.z,-tan.x*kt.speed*0.12+(Math.random()-0.5)*2.5,0.6+Math.random()*1.4,-tan.z*kt.speed*0.12+(Math.random()-0.5)*2.5,0.62,0.47,0.3,1.4);
        if(inFord&&R3.splash)for(let q=0;q<(kt.player?3:1);q++)R3.splash.emit(V.x+(Math.random()-0.5)*0.6,V.y,V.z+(Math.random()-0.5)*0.6,sd*(1.5+Math.random()*2.5)*Math.abs(tan.z)+(Math.random()-0.5)*2+tan.x*kt.speed*0.2,2.5+Math.random()*3.5,sd*(1.5+Math.random()*2.5)*Math.abs(tan.x)+(Math.random()-0.5)*2+tan.z*kt.speed*0.2,0.86,0.93,1,0.6);});}}
    // desert: every car pulls a sandy dust trail; much bigger off the road
    if(R3.C.theme==="dakar"){if(near&&!waiting&&!kt.jet&&!kt.air&&spd>0.2&&Math.random()<(kt.player?1:0.85)){kt.g.updateMatrixWorld(true);const soft=offroad||(R3.tw&&R3.tw.zoneAt(i,"dirt")),big=(offroad?1.5:1)*(soft?1.15:0.8)*(0.6+0.6*spd),cr=0.74+Math.random()*0.08;   // Dakar: a tall golden plume off both rear wheels, biggest in the soft sand
        for(let q=0;q<(kt.player?2:1);q++){const sd=q?1:-1;V.set(sd*(kt.tyreX||kt.S.w/2-0.04)*(kt.player?1:Math.random()*2-1),0.15,kt.xr-0.3);kt.g.localToWorld(V);R3.dust.emit(V.x,V.y+0.15,V.z,-tan.x*kt.speed*0.16+(Math.random()-0.5)*2.6*big,0.9+Math.random()*2.3*big,-tan.z*kt.speed*0.16+(Math.random()-0.5)*2.6*big,cr,cr*0.7,cr*0.4,(1.1+Math.random()*0.7)*big);}}}
    else if(R3.C.theme==="desert"&&near&&!waiting&&!kt.jet&&spd>0.25&&Math.random()<(offroad?0.95:(kt.player?0.55:0.3))){kt.g.updateMatrixWorld(true);const sd=Math.random()<0.5?-1:1;V.set(sd*(kt.tyreX||kt.S.w/2-0.04),0.15,kt.xr);kt.g.localToWorld(V);const big=offroad?1.9:1;
      for(let q=0;q<(offroad?2:1);q++)R3.dust.emit(V.x,V.y+0.1,V.z,-tan.x*kt.speed*0.1+(Math.random()-0.5)*2.2*big,0.5+Math.random()*1.3*big,-tan.z*kt.speed*0.1+(Math.random()-0.5)*2.2*big,0.8,0.66,0.46,1.2*big);}
    // a little dust off the outside wheel when the player runs right on the road edge / kerb
    if(kt.player&&!offroad&&!kt.jet&&Math.abs(kt.x)>0.97&&spd>0.3&&Math.random()<0.45){const sd=-Math.sign(kt.x);kt.g.updateMatrixWorld(true);V.set(sd*(kt.tyreX||kt.S.w/2-0.04),0.1,kt.xr);kt.g.localToWorld(V);R3.dust.emit(V.x,V.y+0.15,V.z,-tan.x*2+(Math.random()-0.5)*1.5,0.5+Math.random()*0.8,-tan.z*2+(Math.random()-0.5)*1.5,0.62,0.55,0.42,0.6);}
  });
  karts.forEach(k=>{if(k.player||!k.lod)return;const d2=k.pos.distanceToSquared(R3.camPos),far=k.lodFar?d2>3025:d2>4225;if(far!==k.lodFar){k.lodFar=far;k.lod.forEach(o=>{o.visible=!far;});k.casters.forEach(o=>{o.castShadow=!far;});if(k.glb)k.glb.blurs.forEach(b=>{if(far)b.visible=false;});}});   // rivals 65 m+ away: no small parts, no shadow
  gpTrafficUpdate(dt,waiting);
  // car-to-car contact: resolved after everyone has moved, then the cars are re-placed on the road so what you see has no overlap
  if(gpContacts(dt,waiting))gpPlaceAll();
  gpTrafficPlace();
  if(R3.tw&&R3.tw.update)R3.tw.update(dt,me,R3.camPos,waiting);if(R3.splash)R3.splash.update(dt,9.5);if(R3.tw&&R3.tw.fordTex){R3.tw.fordTex.offset.y-=dt*0.25;}if(R3.tw&&R3.tw.waterTex2){R3.tw.waterTex2.offset.x+=dt*0.02;}
  // skills
  if(!waiting&&!R3.done&&R3.mode==="race"){const spd=me.speed/me.max,offroad=Math.abs(me.x)>1.05&&!me.jet;
    if(me.drift&&spd>0.35&&!offroad)gpSkill("Drift",me.speed*dt*9);
    if(me.draft)gpSkill("Drafting",me.speed*dt*4);
    karts.forEach(o=>{if(o.player)return;const ahead=(o.lap+o.t)>(me.lap+me.t);if(o.ahead&&!ahead&&me.started){const gap=Math.abs(o.x-me.x)*(R3.W-1.2);if(R3.bumpT>1){if(gap<3.3){gpSkill("Near miss",350,true);gpMsg("Near miss");}else gpSkill("Pass",150,true);}}o.ahead=ahead;});
    if(!offroad&&R3.bumpT>0.8)sk.clean+=dt;else if(offroad)sk.clean=0;if(sk.clean>=12){sk.clean=0;gpSkill("Clean racing",250,true);}
    if(sk.cool>0)sk.cool-=dt;sk.idle+=dt;if(sk.chain>0&&sk.idle>2.6)gpBank();}
  if(R3.notes.length){const tn=performance.now()/1000;R3.notes.forEach(n=>{if(!n.alive)return;n.mesh.position.y=n.y+Math.sin(tn*2.2+n.k)*0.25;if(waiting||R3.done)return;const d=(n.t-me.t+1)%1;if(d<0.006&&Math.abs(n.x-me.x)<0.45){n.alive=false;n.mesh.visible=false;gpNote(n);}});}
  if(R3.petals){const p=R3.petals;if(Math.random()<0.5){const tn=R3.curve.getTangentAt((me.t+0.01)%1);const px=me.pos.x+tn.x*(10+Math.random()*25)+(Math.random()-0.5)*26,pz=me.pos.z+tn.z*(10+Math.random()*25)+(Math.random()-0.5)*26;const tx=!!p.pts.material.map.image;p.emit(px,me.pos.y+4+Math.random()*5,pz,(Math.random()-0.5)*2,-0.6-Math.random()*0.6,(Math.random()-0.5)*2,tx?1:0.98,tx?0.92:0.72,tx?0.96:0.84,5);}p.update(dt,0.02);}
  if(R3.gates){const G=R3.gates;G.flash=Math.max(0,G.flash-dt*1.6);G.mat.opacity=0.72+0.18*Math.sin(performance.now()/260)+G.flash*0.6;}
  if(R3.megaTex)R3.megaTex.offset.y=(R3.megaTex.offset.y-dt*1.4)%1;
  if(R3.waterTex){R3.waterTex.offset.x+=dt*0.006;R3.waterTex.offset.y+=dt*0.003;}
  {let dirty=false;for(let i=0;i<R3.skidLife.length;i++){const life=R3.skidLife[i];if(life<=0)continue;const next=Math.max(0,life-dt);R3.skidLife[i]=next;R3.skidFade.setX(i,Math.min(1,next/1.2));dirty=true;}if(dirty)R3.skidFade.needsUpdate=true;}
  R3.smoke.update(dt,R3.camPos,R3.vpW||1280,R3.vpH||720);R3.dust.update(dt,-0.4);R3.sparks.update(dt,9);
  // standings + HUD
  const all=R3.online?karts.filter(q=>!q.netGone).sort((a,b)=>(b.lap+b.t-(b.started?0:1))-(a.lap+a.t-(a.started?0:1))):karts.slice().sort((a,b)=>(b.lap+b.t)-(a.lap+a.t));R3.board=all;R3.place=all.indexOf(me)+1;
  if(R3.msgT>0){R3.msgT-=dt;if(R3.msgT<=0){const e=$("gp3Msg");if(e)e.classList.remove("show");}}
  const el=(id,v)=>{const e=$(id);if(e&&e.textContent!==v)e.textContent=v;};
  el("gp3Lap","LAP "+Math.min(R3.C.laps,me.lap+1)+"/"+R3.C.laps);el("gp3Time",gpFmt(Math.max(0,R3.time)));
  if(!waiting){const st=R3.done?(R3.mode==="race"?"FINISH  P"+R3.place:"TRIP DONE"):(R3.mode==="race"?"LAP "+Math.min(R3.C.laps,me.lap+1)+"/"+R3.C.laps+"   P"+R3.place:"LAP "+Math.min(R3.C.laps,me.lap+1)+"/"+R3.C.laps+"  ♪ "+R3.notesGot);if(st!==R3.screenTxt){R3.screenTxt=st;R3.setScreen(st);}}
  const pe=$("gp3Pos");if(pe&&pe.dataset.p!==String(R3.place)){pe.dataset.p=String(R3.place);pe.innerHTML=R3.place+"<small>"+gpSuf(R3.place)+"</small><em>/"+R3.board.length+"</em>";}
  if(R3.dp)gpDeepUpdate(dt,waiting);
  gpSkillHud();gpTrickHud(dt);gpJetHud(dt);gpJetRingsDraw(dt);gpJetTrail(dt);if(R3.jp&&R3.jp.alive){R3.jp.mesh.rotation.y+=dt*2.1;R3.jp.mesh.position.y=R3.jp.y0+Math.sin(performance.now()/380)*0.3;}
  gpWarn(me,waiting);
  if(R3.mode==="free"&&R3.songDirty){R3.songDirty=0;const e=$("gp3Song");if(e){const cur=R3.song.length%8,ph=R3.song.slice(R3.song.length-cur);let dots="";for(let i=0;i<8;i++)dots+='<i class="'+(i<cur?"on":"")+'" style="--c:'+(ph[i]?ph[i].c:"#fff")+'"></i>';e.innerHTML='🎵 <b>'+R3.notesGot+' / '+R3.notesTotal+'</b>'+dots;}}
  gpDrawMini($("gp3Map"),R3.C,karts);if(R3.online){gpnBoard(dt);const sp=$("gp3Spd");if(sp){const t=Math.round(me.speed*GP_MPH)+" mph";if(sp.textContent!==t)sp.textContent=t;}}
  // gearbox + engine sound + speedometer
  const mph=me.speed*GP_MPH;let gear=1;for(let g=1;g<GP_GEARS.length;g++)if(mph>=GP_GEARS[g])gear=g+1;
  const lo=GP_GEARS[gear-1],hi=gear<GP_GEARS.length?GP_GEARS[gear]:180;let rf=0.14+0.8*Math.max(0,Math.min(1,(mph-lo)/(hi-lo)));if(waiting)rf=(gas&&!R3.autoGas?0.6:0.14)+Math.random()*0.02;
  if(gear>R3.gear&&!waiting){GPA.play("shift");if(gear>=3)gpFlame(me,0.28);}R3.gear=gear;
  GPA.engine(rf,(waiting?0.2:(me.brakeOn?0.3:1))*(R3.mode==="free"?0.5:1),(me.drift||me.loss||(me.brakeOn&&me.speed/me.max>0.55))?1:Math.min(0.8,(me.squeal||0)*0.8),waiting);
  R3.tachT+=dt;if(R3.tachT>0.04){R3.tachT=0;gpTach(mph,gear,rf);}
}
/* edge speed lines drawn on a half-resolution overlay canvas; the 25 stroke colours are built once (no per-frame strings) */
const GP_STREAK=Array.from({length:25},(_,i)=>"rgba(255,255,255,"+(i/80).toFixed(4)+")");
function gpSpeedFx(spd,drift){const cv=R3.fx;if(!cv)return;const x=cv.getContext("2d"),W=R3.fxW,H=R3.fxH;x.clearRect(0,0,W,H);
  const dg=R3.online?(R3.me.drG||0):0;
  if(dg>0.04){   // slipstream: long cool-white streaks pouring past both sides of the car, stronger the longer you sit in the tow
    const cx=W/2,cy=H*0.56,R=Math.hypot(W,H)/2,tr=R3.me.travel;x.lineCap="round";
    for(let i=0;i<20;i++){const side=i%2?1:-1,j=i>>1,ang=(side<0?Math.PI:0)+side*(-0.5+((j*0.173)%1)*0.95)*(side<0?-1:1)*0.9+(side<0?0.05:-0.05),ph=((tr*0.09+j*0.131+(i%2)*0.37)%1+1)%1,r0=R*(0.34+0.2*ph*ph+0.06*((j*5)%3)),r1=r0+R*(0.16+0.3*dg)*(0.4+ph),c=Math.cos(ang),sn=Math.sin(ang);
      x.strokeStyle="rgba(190,245,255,"+(Math.min(0.85,(0.25+0.6*dg)*(1-ph*0.7))).toFixed(2)+")";x.lineWidth=(1+2.2*dg)*(1-ph*0.5);x.beginPath();x.moveTo(cx+c*r0,cy+sn*r0*0.85);x.lineTo(cx+c*r1,cy+sn*r1*0.85);x.stroke();}}
  const a=Math.max(0,Math.min(1,(spd-0.6)/0.3));if(a<=0.02)return;
  // wind streaks only near top speed: 22 fixed directions across the upper half and both sides (nothing below the horizon in the middle), each growing and fading with distance travelled
  // (no per-frame randomness, so nothing flickers), starting well outside the car and clear of the pedals and the dial
  const cx=W/2,cy=H*0.5,R=Math.hypot(W,H)/2,tr=R3.me.travel;x.lineCap="round";
  for(let i=0;i<22;i++){const ang=Math.PI-0.42+i*(Math.PI+0.84)/21,ph=((tr*0.05+i*0.37)%1+1)%1,r0=R*(0.66+0.08*((i*7)%5)/5),r1=r0+R*(0.08+0.2*ph)*a,c=Math.cos(ang),sn=Math.sin(ang);
    x.strokeStyle=GP_STREAK[Math.min(24,Math.round((0.05+0.3*a)*(1-ph)*80))];x.lineWidth=0.8+1.4*(1-ph);x.beginPath();x.moveTo(cx+c*r0,cy+sn*r0*0.92);x.lineTo(cx+c*r1,cy+sn*r1*0.92);x.stroke();}}
function gpRender(dt){if(R3&&R3.cenvWant){R3.cenvWant=0;const R=R3,sm=R.skyMat;R.cenv=gpCarEnv(R.T,R.renderer,R.fzSky,R.C,R.L0,R.sunDir,R.band,sm&&sm.uniforms&&sm.uniforms.top?sm.uniforms.top.value:null);gpCarEnvApply();}   /* car reflection map: built on the first drawn frame (built during race set-up, PMREM came out black) */

  const me=R3.me,T=R3.T;const tan=R3.curve.getTangentAt(me.t).normalize();const flat=R3.tmpV2.set(tan.x,0,tan.z).normalize();
  const spd=me.speed/me.max,tall=R3.camera.aspect<1,rig=gpChaseRig(tall,me.racer.car);
  let target,look;
  if(R3.countdown>0.5){const a=Math.max(0,(R3.countdown-0.5)/3.3);   // grid view: a little higher and further back than the chase camera, easing down as the lights count, so the rows ahead stay in frame
    target=me.pos.clone().addScaledVector(flat,-(rig.back+a*3.2)).add(new T.Vector3(0,rig.up+a*1.6,0));look=me.pos.clone().addScaledVector(flat,rig.ahead+a*12).add(new T.Vector3(0,rig.ly,0));R3.camPos.copy(target);R3.camYaw=null;}
  else{
    // Chase camera (job 1108-0900): the lens swings late into a corner on a critically damped spring, so you see the car's flank and rear quarter,
    // then settles back behind it. The lag is soft-limited, and the aim point sits between the road ahead and the car so the car stays low and central.
    const roadYaw=Math.atan2(flat.x,flat.z),jt=me.jet,tgtYaw=roadYaw-(me.headA||0)*(jt?0.72:0.35);R3.jetK=(R3.jetK||0)+((jt&&jt.ph!=="hop"&&jt.ph!=="land"?1:0)-(R3.jetK||0))*Math.min(1,dt*(jt?2.4:1.4));const jk=R3.jetK;
    if(R3.camYaw==null){R3.camYaw=roadYaw;R3.camYawV=0;R3.camYawS=null;R3.camX=me.x;R3.camBack=0;}
    if(jt){R3.camYaw+=gpWrapAng(tgtYaw-R3.camYaw)*Math.min(1,dt*3.2);R3.camYawV=0;}else{const w=7,c1=gpWrapAng(R3.camYaw-tgtYaw),c2=R3.camYawV+w*c1,E=Math.exp(-w*dt);R3.camYaw=tgtYaw+(c1+c2*dt)*E;R3.camYawV=(c2-w*(c1+c2*dt))*E;}
    R3.camYaw=gpWrapAng(R3.camYaw);{const M=0.38,L=gpWrapAng(R3.camYaw-tgtYaw),w=gpWrapAng(tgtYaw+M*Math.tanh(L/M));if(R3.camYawS==null||jt)R3.camYawS=w;else{const d=gpWrapAng(w-R3.camYawS),m=1.8*dt;R3.camYawS=gpWrapAng(R3.camYawS+Math.max(-m,Math.min(m,d)));}}   // the lens turns at a capped rate, so a knock against a wall cannot snap the view
    R3.camX+=(me.x-R3.camX)*Math.min(1,dt*4);R3.camBack+=(Math.max(0,spd)*1.15-R3.camBack)*Math.min(1,dt*1.5);
    const nor=R3.tmpV3.set(-flat.z,0,flat.x),foc=me.pos.clone().addScaledVector(nor,(R3.camX-me.x)*(R3.W-1.2)*0.45);
    {const hN=(R3.C.dnl&&me.air&&!me.jet&&me.ry!=null)?Math.max(0,me.y-me.ry):0,w=Math.min(1,Math.max(0,(hN-1.2)/6));R3.airH=(R3.airH||0)+(w-(R3.airH||0))*Math.min(1,dt*(w>(R3.airH||0)?3.2:2.2));R3.airHm=hN;}   // high over the sand off a dune: the lens lifts and drops back so the gap under the car and its shadow on the sand stay in the picture
    const vw0=R3.countdown<=0.5?R3.camMode:"chase",far=vw0==="far",cc=me.racer.car.cam||{},dir=R3.tmpV4.set(Math.sin(R3.camYawS),0,Math.cos(R3.camYawS));R3.airK=(R3.airK||0)+(((me.air&&me.airT>0.1)?1:0)-(R3.airK||0))*Math.min(1,dt*(me.air?2.6:3.5));const back=rig.back+R3.camBack+(cc.back||0)+(far?(tall?5:4.5):0)+(R3.bk||0)*1.1+R3.airK*2.2+jk*(tall?2.4:3.2)+(R3.airH||0)*(tall?2.0:2.8);
    target=foc.clone().addScaledVector(dir,-back).add(new T.Vector3(0,rig.up+R3.camBack*0.3+(cc.up||0)+(far?2.2:0)-(R3.bk||0)*0.25+R3.airK*0.9+jk*1.3+(R3.airH||0)*2.3,0));
    target.y=Math.max(target.y,me.pos.y+(tall?3.4:1.4)+(cc.up||0));
    {let gy=R3.groundAt?Math.max(R3.groundAt(target.x,target.z),R3.curve.getPointAt(((me.t-back/R3.len)%1+1)%1).y):-1e9,want=Math.max(target.y,gy+1.4)+((R3.dp&&me.air)?1.6:0);if(R3.dp){const WL=R3.dp.y;if(me.y<WL-0.15)want=Math.min(want,WL-0.5);else if(me.y>WL+0.15)want=Math.max(want,WL+0.7);}   // the lens stays on the car's side of the water: no looking at a ghost through the surface   // a lagging height: the car visibly rises off a crest, and the camera never dips into the hill behind
      if(R3.camYs==null)R3.camYs=want;R3.camYs+=(want-R3.camYs)*Math.min(1,dt*(me.jet?6:(me.air?(R3.dp?9:4.5):8)));target.y=Math.max(R3.camYs,gy+1.2);}
    look=foc.clone().addScaledVector(jt?dir:new T.Vector3(tan.x*0.42+dir.x*0.58,tan.y,tan.z*0.42+dir.z*0.58),rig.ahead+jk*8).add(new T.Vector3(0,rig.ly+(cc.up||0)*0.45-(jt&&jt.pitch?jt.pitch*5:0)*jk-(R3.airH||0)*Math.min(7,(R3.airHm||0)*0.55),0));
    R3.camPos.copy(target);const cm=window.__gp.cam;cm.lagDeg=gpWrapAng(R3.camYawS-roadYaw)*57.3;cm.back=back;}
  const vw=R3.countdown<=0.5?R3.camMode:"chase",cmode=vw==="far"?"chase":vw;if(cmode!=="chase"){me.g.updateMatrixWorld(true);   // bumper: low on the nose; hood: above the bonnet (car visible); cockpit: driver's eye. All ride the car's heading (not its body roll)
    const GD=GP_GLB[me.racer.car.id]||{},E=GD.eye||[0,1.04,-0.35],nz=GD.nose||(me.S.len/2),rY=GD.roofY||1.1;
    if(cmode==="bumper"){const by=Math.max(0.62,(GD.ride||0.1)+0.48);R3.camPos.copy(me.g.localToWorld(R3.tmpV3.set(0,by,Math.max(2.5,nz+0.1))));look=me.g.localToWorld(new T.Vector3(0,by-0.12,30));}
    else if(cmode==="hood"){const hy=Math.max(E[1]+0.3,rY+0.12);R3.camPos.copy(me.g.localToWorld(R3.tmpV3.set(0,hy,E[2]+0.2)));look=me.g.localToWorld(new T.Vector3(0,hy-0.55,30));}
    else{R3.camPos.copy(me.g.localToWorld(R3.tmpV3.set(0,E[1],E[2])));look=me.g.localToWorld(new T.Vector3(0,E[1]-0.22,30));}}
  {const showMe=cmode==="chase"||(cmode==="hood"&&!me.trick&&!me.tkRe)||!!window.__gpCam;if(me.g.visible!==showMe)me.g.visible=showMe;}
  const dc=window.__gpCam;if(dc&&R3.countdown<=0.5){   // test hook only: replay angle on the player car, set in the road's frame (a TV camera), so the car's
    // own heading (straight along the road, or the drift angle) is what you see; {car:true} restores the old lens glued to the car
    if(dc.car){me.g.updateMatrixWorld(true);R3.camPos.copy(me.g.localToWorld(R3.tmpV3.set(dc.side||0,dc.h||1.2,-(dc.back||5))));look=me.g.localToWorld(new T.Vector3(0,dc.look||0.5,dc.ahead||0));}
    else{const rx=R3.tmpV3.set(flat.z,0,-flat.x);R3.camPos.copy(me.pos).addScaledVector(rx,dc.side||0).addScaledVector(flat,-(dc.back||5));R3.camPos.y+=dc.h||1.2;look=me.pos.clone().addScaledVector(flat,dc.ahead||0);look.y+=dc.look||0.5;}}
  R3.camera.position.copy(R3.camPos);
  if(R3.shake>0){R3.shake=Math.max(0,R3.shake-dt*1.7);const a=R3.shake*R3.shake*0.6,tt=performance.now()/1000;R3.camera.position.y+=Math.sin(tt*57)*a;R3.camera.position.x+=Math.sin(tt*43+1.3)*a*0.6;R3.camera.position.z+=Math.cos(tt*39)*a*0.6;}   // short landing shake only
  if(R3.fz&&R3.countdown<=0&&!window.__gpCam){const k=Math.max(0,spd-0.84)*0.05+(R3.bk||0)*0.03+((Math.abs(me.x)>1.04&&!me.air&&!me.jet)?0.028*Math.min(1,spd*2):0);if(k>0.0005){const tt=(R3.simT!=null?R3.simT:performance.now()/1000);R3.camera.position.y+=Math.sin(tt*61)*k*0.5;R3.camera.position.x+=Math.sin(tt*47+2.1)*k*0.35;}}   // the road buzzing through the camera at top speed, on BOOST and on the rough verge - centimetres, never a wobble
  R3.karts.forEach(k=>{if(k.player)return;const fwd=(k.pos.x-R3.camPos.x)*flat.x+(k.pos.z-R3.camPos.z)*flat.z;const vis=fwd>2.4&&!k.netGone;if(k.g.visible!==vis)k.g.visible=vis;});   // a solid car until it passes the camera (an opacity fade made rivals see-through)
  R3.camera.lookAt(look);
  if(R3.jetK>0.01&&me.jet&&me.jet.roll)R3.camera.rotateZ(-me.jet.roll*0.22*R3.jetK);   // the chase plane leans with him
  if(cmode!=="chase"&&me.trick&&me.trick.k==="roll"&&!window.__gpCam)R3.camera.rotateZ(gpTrickAngle(me).a);   // from inside the car a barrel roll turns the whole world
  R3.fovK=(R3.fovK||0)+(Math.max(0,Math.min(1,(spd-0.45)/0.55))-(R3.fovK||0))*Math.min(1,dt*1.6);R3.bk=(R3.bk||0)+((me.boostT>0?1:0)-(R3.bk||0))*Math.min(1,dt*(me.boostT>0?7:2.2));const fovT=(tall?(cmode==="chase"?76:78):(cmode==="chase"?58:66))+R3.fovK*(tall?6:(cmode==="chase"?8:7))+R3.bk*(tall?7:11)+(R3.jetK||0)*(tall?3:5);R3.fov=fovT;if(Math.abs(R3.camera.fov-fovT)>0.01){R3.camera.fov=fovT;R3.camera.updateProjectionMatrix();}   // eases wider with speed (no jumps)
  R3.sky.position.copy(R3.camera.position);if(R3.band)R3.band.position.set(R3.camera.position.x,R3.band.userData.y,R3.camera.position.z);R3.glare.position.copy(R3.camera.position).addScaledVector(R3.sunDir,1500);
  if(gpBakeFrame(me)){}else{R3.sun.position.copy(me.pos).add(R3.sunOff);R3.sun.target.position.copy(me.pos);if(me.jet){const dh=me.pos.y-me.ry;R3.sun.position.y-=dh;R3.sun.target.position.y-=dh;}R3.sun.target.updateMatrixWorld();}
  if(R3.dp)gpDeepRender(dt);
  if(R3.online)gpnLabels();
  R3.renderer.info.reset();gpFxFrame(dt,cmode);if(cmode==="cockpit")gpCockpit();
  const pp=R3.post;if(pp){pp.mat.uniforms.t.value=performance.now()/1000;R3.renderer.setRenderTarget(pp.rt);R3.renderer.render(R3.scene,R3.camera);R3.renderer.setRenderTarget(null);R3.renderer.render(pp.scene,pp.cam);}else{gpFzRender(dt,spd,cmode);if(cmode==="cockpit")gpMirror();gpSpeedFx(R3.countdown>0?0:spd+(R3.bk||0)*0.4,me.drift);}
  if(pp&&(me.jet||R3.fxOn||(R3.online&&me.drG>0.04))){R3.fxOn=!!me.jet||(R3.online&&me.drG>0.04);gpSpeedFx(me.jet?Math.max(spd,0.95)+(R3.bk||0)*0.4:0,0);}
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
  const w0=$("gp3");if(w0)w0.classList.add("done");GPA.play("fanfare");if(got>=tot*0.8&&typeof confetti==="function")confetti();
  say("Trip complete! You collected "+got+" music notes.");
  let earned=0;if(P){earned=xp;P.xp+=xp;P.race=P.race||{};const prev=P.race[R3.C.id]||{};P.race[R3.C.id]=Object.assign({},prev,{notes:Math.max(got,prev.notes||0),date:today()});if(typeof markTodayPlanDone==="function")markTodayPlanDone("race","race");save();if(typeof syncProgress==="function")syncProgress("finish");}
  window._gpSong=R3.song.slice();
  const myR=R3;setTimeout(()=>{if(!R3||R3!==myR)return;GPA.stopEngine();const w=$("gp3");if(!w)return;w.insertAdjacentHTML("beforeend",'<div class="gp3-finish"><div class="fz-fin-t">Trip complete! 🎵</div><div class="fz-fin-s" style="font-size:1.25em;margin:8px 0">'+got+' of '+tot+' notes · '+tunes+' tune'+(tunes===1?'':'s')+' · '+gpFmt(R3.time)+(earned?' · +'+earned+' XP':'')+'</div><div class="btn-row" style="margin-top:12px"><button class="btn big" onclick="gpPlaySong()">▶ Play my song</button><button class="btn secondary big" onclick="startRace3D(\''+R3.C.id+'\')">Drive again 🔁</button><button class="btn secondary big" onclick="renderCircuits()">Routes 🗺️</button></div></div>');},1300);}
function gpFinish(){
  if(R3.online)return gpnFinish();
  if(R3.mode==="free")return gpFinishFree();
  R3.done=true;gpBank();const place=R3.place;const skill=R3.sk.total;const bonus=Math.min(10,Math.floor(skill/2000));const xp=([0,30,20,10,5,5][place]||5)+bonus;
  const w0=$("gp3");if(w0)w0.classList.add("done");
  GPA.play(place<=3?"fanfare":"lap");if(place===1&&typeof confetti==="function")confetti();
  say(place===1?"You win at "+R3.C.name+"! Horizon champion!":"You finished "+gpOrd(place)+". Great driving!");
  let earned=0;
  if(P){earned=xp;P.xp+=xp;P.race=P.race||{};const prev=P.race[R3.C.id]||{};P.race[R3.C.id]={time:prev.time&&prev.time<R3.time?prev.time:R3.time,place:Math.min(place,prev.place||9),skill:Math.max(skill,prev.skill||0),trap:Math.max(R3.trapBest,prev.trap||0),date:today()};
    if(place===1&&!P.trophies.some(t=>t.type==="race")&&typeof awardTrophy==="function")awardTrophy({type:"race",icon:"🏎️",label:"Grand Fable Champion",color:"#ff2d87",detail:"Won the Grand Fable Horizon race at "+R3.C.name+"."});if(typeof markTodayPlanDone==="function")markTodayPlanDone("race","race");save();if(typeof syncProgress==="function")syncProgress("finish");}
  const rows=R3.board.map((k,i)=>'<div class="'+(k.player?"me":"")+'"><i>'+gpOrd(i+1)+'</i><span>'+esc(k.racer.n)+'</span><span>'+esc(k.racer.car.n)+'</span></div>').join("");
  const board=R3.board.slice(),story=R3.story,cid=R3.C.id,timeS=gpFmt(R3.time),trap=R3.trapBest,podium=place<=3&&!story&&board.length>=3;
  const steps=GP_WORLD.podium.steps,stepHtml=podium?'<div class="fz-podium" style="--pod:url('+GP_WORLD.podium.src+')">'+[["p1",0],["p2",1],["p3",2]].map(([k,i])=>{const r=board[i];const st=steps[k];return'<div class="fz-step'+(r.player?" me":"")+'" style="left:'+(st[0]*100).toFixed(1)+'%;top:'+(st[1]*100).toFixed(1)+'%">'+gpThumb(r.racer.car.id)+'<b>'+esc(r.racer.n)+'</b></div>';}).join("")+'</div>':"";
  const myR=R3;   // the finish panel + upgrade picker belong to THIS race only: a timer or the win video can finish after a new race has started
  const panel=()=>{if(!R3||R3!==myR||!R3.done)return;const w=$("gp3");if(!w||!w.classList.contains("done"))return;w.insertAdjacentHTML("beforeend",'<div class="gp3-finish'+(podium?" pod":"")+'">'+(podium?'<video class="fz-podvid" muted loop playsinline webkit-playsinline preload="none" disablepictureinpicture aria-hidden="true"></video>':'')+'<div class="fz-fin-t">'+gpOrd(place).toUpperCase()+' PLACE'+(place===1?' 🏆':'')+'</div>'+stepHtml+'<div class="fz-res">'+rows+'</div><div class="fz-fin-s">'+timeS+' · Skill '+gpNum(skill)+(trap?' · Speed trap '+trap+' mph':'')+(earned?' · +'+earned+' XP':'')+'</div><div class="fz-fin-up" id="fzFinUp"></div><div class="btn-row" style="margin-top:10px"><button class="btn big" onclick="startRace3D(\''+cid+'\')">Race again 🔁</button><button class="btn secondary big" onclick="renderCircuits()">Routes 🏁</button><button class="btn secondary big" onclick="renderRace()">Cars 🚗</button></div></div>');
    const pv=w.querySelector(".fz-podvid");if(pv){setTimeout(()=>{if(!document.contains(pv))return;pv.src=GP_VIDEO.podium;const p=pv.play();if(p&&p.catch)p.catch(()=>{});},400);}
    if(podium)gpConfetti(w.querySelector(".gp3-finish"));
    if(!R3.upDone){R3.upDone=true;gpUpPicker(w,msg=>{const e=$("fzFinUp");if(e&&msg){e.textContent="New: "+msg;e.classList.add("on");}});}};
  setTimeout(()=>{if(!R3||R3!==myR)return;GPA.stopEngine();if(place===1&&!story){gpVideo(GP_VIDEO.win,"HORIZON CHAMPION · "+R3.C.name.toUpperCase(),9000).then(panel);}else panel();},1300);
}
/* ========== RACE A FRIEND (job 1107-0116): live online races, every kid on their own device ==========
   Backend: its own free Firebase project (Realtime DB + Anonymous Auth), rules in tools/online/. Safety by design: no chat, no free
   text anywhere (cars and tracks are ids from a fixed list, labels like "Red Falcon" are made on each screen), no public lobby, no
   room list (rules deny it): the only way in is a private 5-letter code that someone read out to you.
   A room: meta (host, track, laps, pace, state, run, goAt, touched) + slots/0-3 (seat claims, capping a room at 4) + players/<uid> +
   cars/<uid> (12 x a second, numbers only) + finish/<uid> + order (host only). Each car is simulated only on its owner's device; the others
   draw it from a short buffer of snapshots (kt.net karts in gpUpdate). The host's device runs the room; if it drops, the next player
   takes over. Nothing here runs unless someone taps "Race a friend". */
const GPN_CFG={apiKey:"AIzaSyAtBgXG5ydZQ8ljCZ3KwcYE2eCigourCSA",authDomain:"grand-fable-gp-race.firebaseapp.com",databaseURL:"https://grand-fable-gp-race-default-rtdb.firebaseio.com",projectId:"grand-fable-gp-race",appId:"1:77253679827:web:b0450b83cd962adf465226"};
const GPN_ALPHA="BDFGHJKLMNRSTWXY";   // no vowels (so no words), and only letters that are hard to mishear when read out
const GPN_BAD=/(.)\1|FK|FG|FD|SHT|SH[DGLRTW]|BTCH|BT|DK|DMN|DM|GDD|KK|NGG|NGR|WTF|STF|TWT|WNK|WHR|SLT|HNT|LMF|MF|BJ|JRK|GTF|GFY|XX|TTY|WTH|FML|SX|SXY|HL|DRN|BLLX|BLX|DLD|DYK|TRD|TWD|PWN|LST/;
/* every car races on the same numbers online (the car you pick is a look, not an advantage) */
const GPN_STD={speed:4,grip:4,handle:4,accel:4,type:"gt"};
const GPN_IDLE=1800000,GPN_SEND=83,GPN_MAX=4,GPN_LATE=75000;
const GPN_COLS=[["Red",209,18,28],["Silver",215,219,224],["White",245,245,245],["Blue",29,95,209],["Orange",242,138,28],["Yellow",247,216,60],["Black",20,22,28],["Green",46,158,87],["Purple",142,59,214],["Pink",255,80,160],["Sky Blue",18,176,232],["Brown",130,84,50],["Teal",20,160,150],["Gold",196,160,70]];
const GPN_SPARE=["#1d5fd1","#f7c600","#2e9e57","#8e3bd6","#f28a1c","#ff3d8b","#12b0e8","#f2f2f2"];
function gpnCodeOk(c){return /^[BDFGHJKLMNRSTWXY]{5}$/.test(c)&&!GPN_BAD.test(c);}
function gpnNewCode(){for(;;){const a=new Uint8Array(5);crypto.getRandomValues(a);let c="";a.forEach(v=>{c+=GPN_ALPHA[v%16];});if(gpnCodeOk(c))return c;}}
function gpnColor(h){const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);let n="",bd=1e9;GPN_COLS.forEach(c=>{const d=(c[1]-r)*(c[1]-r)+(c[2]-g)*(c[2]-g)+(c[3]-b)*(c[3]-b);if(d<bd){bd=d;n=c[0];}});return n;}
function gpnLabel(car,paint){const C=GP_CARS.find(c=>c.id===car),w=C?C.n.split(/\s+/).pop():"Car";return gpnColor(paint)+" "+w;}
/* ---------- the racing name (job 1107-0258): the kid's own first name, letters only, run through a rude-word filter ----------
   2-10 letters A-Z, Title Case. Anything else (or a rude word) is refused and the car+colour label is shown instead. The database
   rules (tools/online/make_rules.py, which reads these two lists) check the very same pattern, length and word list. Whole words are
   checked for the short ones (so Hassan and Cassandra are fine), stems for the long ones; a letter repeated ("Fuuck") still counts. */
const GPN_RUDE_SUB="fuck|fuk|shit|shyt|bitch|cunt|nigg|nigr|fagg|whore|slut|penis|vagina|hitler|porn|dildo|bastard|pussy|wank|twat|dickhead|asshole|bollock|sexy|stupid|idiot|retard|moron|kkk|nude|naked|suck|nipple|orgasm|erotic|molest|paedo|pedo|terror|suicide|killer";
const GPN_RUDE_EX="ass|arse|dick|cock|cum|sex|tit|tits|boob|boobs|butt|bum|poo|poop|fart|piss|crap|damn|hell|anus|rape|nazi|jerk|dumb|loser|ugly|fat|hate|kill|die|dead|drunk|stfu|wtf|gay|fag|hoe|ho|pee|wee";
const GPN_RUDE_RE=(()=>{const ex=s=>s.split("").map(c=>c+"+").join("");return{sub:new RegExp("("+GPN_RUDE_SUB.split("|").map(ex).join("|")+")"),ex:new RegExp("^("+GPN_RUDE_EX.split("|").map(ex).join("|")+")$")};})();
function gpnNameOk(n){return typeof n==="string"&&/^[A-Z][a-z]{1,9}$/.test(n)&&!GPN_RUDE_RE.sub.test(n.toLowerCase())&&!GPN_RUDE_RE.ex.test(n.toLowerCase());}
/* anything a kid (or a profile) has typed -> a clean racing name, or "" if it can't be one */
function gpnNameClean(s){let t=String(s==null?"":s);try{t=t.normalize("NFD").replace(/[̀-ͯ]/g,"");}catch(e){}const w=t.split(/[^A-Za-z]+/).filter(Boolean)[0]||"";const n=w?w.charAt(0).toUpperCase()+w.slice(1,10).toLowerCase():"";return gpnNameOk(n)?n:"";}
function gpnProfileName(){const n=gpnNameClean(P&&P.name);return /^test$/i.test(n)?"":n;}   // the preview link's throwaway "Test" profile never shows on cars or boards
function gpnMyName(){return typeof window._gpnName==="string"?window._gpnName:gpnProfileName();}
function gpnMyPaint(){const c=gpCar(),p=String(gpGlbPaintFor(c,true)||c.paint||"#d1121c").toLowerCase();return /^#[0-9a-f]{6}$/.test(p)?p:"#d1121c";}
function gpnLoadSdk(){if(window._gpnSdk)return window._gpnSdk;
  const load=src=>new Promise((res,rej)=>{const s=document.createElement("script");s.src=src;s.async=false;const to=setTimeout(()=>rej(new Error("timeout")),20000);s.onload=()=>{clearTimeout(to);res();};s.onerror=()=>{clearTimeout(to);rej(new Error("load"));};document.head.appendChild(s);});
  const B="assets/vendor/firebase/firebase-";
  window._gpnSdk=load(B+"app-compat.js").then(()=>Promise.all([load(B+"auth-compat.js"),load(B+"database-compat.js")]));
  window._gpnSdk.catch(()=>{window._gpnSdk=null;});return window._gpnSdk;}
/* sign in with a throwaway anonymous id. Session persistence: it dies with the tab, and two tabs are two players */
async function gpnConnect(){if(window._gpnFb&&window._gpnFb.auth.currentUser)return window._gpnFb;
  await gpnLoadSdk();
  if(!window._gpnFb){const app=firebase.apps.find(a=>a.name==="gfgp")||firebase.initializeApp(GPN_CFG,"gfgp"),auth=firebase.auth(app),db=firebase.database(app),E=window.__GPN_EMU;
    if(E){auth.useEmulator("http://127.0.0.1:"+E.auth,{disableWarnings:true});db.useEmulator("127.0.0.1",E.db);}
    window._gpnFb={app,auth,db,off:0,conn:false};
    db.ref(".info/serverTimeOffset").on("value",s=>{window._gpnFb.off=s.val()||0;});
    db.ref(".info/connected").on("value",s=>{const on=!!s.val();window._gpnFb.conn=on;if(GPN&&GPN.code)gpnPresence(on);});}
  const F=window._gpnFb;await F.auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
  if(!F.auth.currentUser)await Promise.race([F.auth.signInAnonymously(),new Promise((_,r)=>setTimeout(()=>r(new Error("timeout")),15000))]);
  return F;}
function gpnNow(){return Date.now()+((window._gpnFb&&window._gpnFb.off)||0);}
const GPN_SV=()=>firebase.database.ServerValue.TIMESTAMP;
function gpnRef(p){return window._gpnFb.db.ref("rooms/"+GPN.code+(p?"/"+p:""));}
/* ---------- screens: menu, code keypad, lobby ---------- */
function gpnCss(){gpCss();if($("gpnCss"))return;const s=document.createElement("style");s.id="gpnCss";s.textContent=`
@font-face{font-family:"GPN Bungee";src:url(assets/vendor/fonts/Bungee-Regular.woff2) format("woff2");font-display:swap}
.gpn{position:relative;max-width:1000px;margin:0 auto;min-height:calc(100dvh - 8px);padding:max(12px,env(safe-area-inset-top)) 14px 22px;box-sizing:border-box;background:#120626;border-radius:18px;color:#fff;display:flex;flex-direction:column;gap:12px;font-weight:600}
.gpn h1,.gpn h2,.gpn .gpn-big{font-family:"GPN Bungee",system-ui,sans-serif;font-weight:400;margin:0;letter-spacing:.5px}
.gpn-top{display:flex;align-items:center;justify-content:space-between;gap:10px}.gpn-top h1{font-size:clamp(20px,5.4vw,30px)}
.gpn button{font-family:inherit;color:inherit;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.gpn-x{min-width:64px;min-height:48px;border-radius:14px;border:3px solid #4b2a80;background:#2d1254;font-weight:800;font-size:16px}
.gpn-note{margin:0;color:#d9cdf2;font-size:15px;line-height:1.35}
.gpn-mine{display:flex;align-items:center;gap:12px;background:#2d1254;border-radius:18px;padding:10px 14px}.gpn-mine i{flex:none;width:96px;height:56px;background:center/contain no-repeat var(--pic)}.gpn-mine b{display:block;font-size:19px}.gpn-mine small{color:#d9cdf2}
.gpn-mine button{margin-left:auto;min-height:48px;padding:0 14px;border-radius:14px;border:3px solid #00f0ff;background:transparent;font-weight:800}
.gpn .gpn-act{display:block;width:100%;min-height:96px;padding:14px;border-radius:22px;border:0;border-bottom:7px solid #00a93f;background:#00ff66;color:#061a10!important;font-family:"GPN Bungee",system-ui,sans-serif;font-size:clamp(21px,6vw,30px);text-align:center;transition:transform .12s cubic-bezier(.3,1.6,.5,1)}.gpn .gpn-act small{display:block;font:700 15px system-ui,sans-serif;margin-top:4px}
.gpn .gpn-act:active{transform:translateY(4px) scale(.985);border-bottom-width:3px}.gpn .gpn-act.cy{background:#00f0ff;border-bottom-color:#0098a3}.gpn .gpn-act.off{background:#2d1254;border:4px solid #00ff66;color:#fff!important;border-bottom-width:4px}.gpn .gpn-act[disabled]{opacity:.55;cursor:default}
.gpn-err{min-height:22px;margin:0;color:#ffd600;font-weight:700;font-size:16px;text-align:center}
.gpn-cells{display:flex;justify-content:center;gap:8px}.gpn-cells b{display:flex;align-items:center;justify-content:center;width:min(16vw,76px);aspect-ratio:.86;border-radius:14px;background:#2d1254;border:3px solid #4b2a80;color:#ffd600;font:400 clamp(30px,10vw,50px) "GPN Bungee",system-ui,sans-serif}.gpn-cells b.on{border-color:#00f0ff}.gpn-cells.bad{animation:gpnShake .3s}
@keyframes gpnShake{25%{transform:translateX(-7px)}75%{transform:translateX(7px)}}
.gpn-keys{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;max-width:520px;width:100%;margin:0 auto}.gpn-keys button{min-height:64px;border-radius:14px;border:0;border-bottom:5px solid #1a0a33;background:#4b2a80;font:400 28px "GPN Bungee",system-ui,sans-serif}.gpn-keys button:active{transform:translateY(3px);border-bottom-width:2px;background:#00f0ff;color:#120626}.gpn-keys .wide{grid-column:span 2;font:800 19px system-ui,sans-serif;background:#2d1254}
.gpn-code{border:5px solid #00f0ff;border-radius:22px;padding:8px 10px 10px;text-align:center;background:#0d041d;box-shadow:0 0 22px rgba(0,240,255,.25)}.gpn-code small{font-size:15px;color:#fff}.gpn-code .gpn-big{display:block;color:#ffd600;font-size:clamp(46px,14.5vw,76px);line-height:1.08;letter-spacing:.09em;margin-right:-.09em}
.gpn-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.gpn-slot{position:relative;min-height:112px;border-radius:16px;background:#2d1254;padding:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;overflow:hidden;text-align:center}.gpn-slot.empty{background:transparent;border:3px dashed #4b2a80;color:#a897cc}.gpn-slot.empty em{font-style:normal;font-size:30px;line-height:1}.gpn-slot.ready{background:#0c6a36;box-shadow:inset 0 0 0 3px #00ff66}.gpn-slot.gone{opacity:.5}
.gpn-slot i{width:100%;height:50px;background:center/contain no-repeat var(--pic)}.gpn-slot b{font-size:17px;line-height:1.1}.gpn-slot small{font-size:13px;color:#e8e0f7}.gpn-slot u{position:absolute;right:-27px;top:11px;width:100px;transform:rotate(38deg);text-decoration:none;background:repeating-linear-gradient(120deg,#ffd600 0 12px,#111 12px 16px);color:#111;font:400 11px "GPN Bungee",system-ui,sans-serif;padding:2px 0;text-shadow:0 0 3px #ffd600}
.gpn-slot .kick{position:absolute;left:4px;top:4px;width:48px;height:48px;border-radius:12px;border:0;background:rgba(0,0,0,.35);font-size:18px}
.gpn-h{font-size:15px;color:#00f0ff;font-weight:800;letter-spacing:.3px;margin:2px 0 -4px}
.gpn-tr{display:flex;gap:8px;overflow-x:auto;padding:4px 2px 8px;scroll-snap-type:x proximity;-webkit-overflow-scrolling:touch}.gpn-tr button{flex:none;width:138px;padding:0;border-radius:14px;border:4px solid transparent;background:#2d1254;overflow:hidden;scroll-snap-align:start;text-align:left}.gpn-tr button.on{border-color:#ffd600}.gpn-tr img{display:block;width:100%;height:68px;object-fit:cover;background:#1a0a33}.gpn-tr b{display:block;font-size:13px;line-height:1.15;padding:5px 7px 6px;min-height:36px}
.gpn-picked{display:flex;align-items:center;gap:12px;background:#2d1254;border-radius:14px;overflow:hidden}.gpn-picked img{width:124px;height:72px;object-fit:cover}.gpn-picked b{font-size:17px}.gpn-picked small{display:block;color:#d9cdf2;font-weight:600}
.gpn-chips{display:flex;gap:6px;flex-wrap:wrap;align-items:center}.gpn-chips button{min-height:48px;min-width:56px;padding:0 12px;border-radius:12px;border:3px solid #4b2a80;background:#2d1254;font-weight:800;font-size:15px}.gpn-chips button.on{background:#ffd600;border-color:#ffd600;color:#120626}.gpn-chips span{font-size:14px;color:#d9cdf2;margin-left:6px}
.gpn-cta{margin-top:auto;position:sticky;bottom:8px;z-index:3}
.gpn.gpn-sheet{position:fixed;inset:0;z-index:50;background:rgba(10,3,24,.86);display:flex;flex-direction:row;gap:0;align-items:flex-end;justify-content:center;animation:gpnFade .15s}@keyframes gpnFade{from{opacity:0}}
.gpn-sheet>div{width:100%;max-width:760px;max-height:84dvh;overflow:auto;background:#1c0b3a;border-radius:22px 22px 0 0;padding:14px;box-sizing:border-box;animation:gpnUp .22s cubic-bezier(.2,.9,.3,1)}@keyframes gpnUp{from{transform:translateY(40px)}}
.gpn-sheet .row{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}.gpn-sheet h2{font-size:20px}
.gpn-pick{display:grid;grid-template-columns:repeat(auto-fill,minmax(112px,1fr));gap:8px}.gpn-pick button{border-radius:14px;border:3px solid #4b2a80;background:#2d1254;padding:6px;font-size:13px;font-weight:700;min-height:84px;color:#fff}.gpn-pick button.on{border-color:#00ff66}.gpn-pick i{display:block;height:48px;background:center/contain no-repeat var(--pic)}
@media(min-width:760px) and (min-height:560px){.gpn-lob{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px}.gpn-lob>div{display:flex;flex-direction:column;gap:10px;min-width:0}.gpn-tr{flex-wrap:wrap;overflow:visible}.gpn-tr button{width:calc(33.3% - 6px)}}
@media(min-width:600px) and (max-height:520px){.gpn-lob{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:10px}.gpn-lob>div{display:flex;flex-direction:column;gap:8px;min-width:0}.gpn-slot{min-height:84px}.gpn-slot i{height:34px}.gpn-code .gpn-big{font-size:44px}}
@media(max-width:380px),(max-height:700px){.gpn-slot{min-height:92px}.gpn-slot i{height:38px}}
.gp3-wrap .gpn-wait{position:absolute;left:50%;top:18%;transform:translateX(-50%);z-index:7;background:rgba(18,6,38,.85);border:3px solid #00f0ff;border-radius:14px;padding:8px 14px;color:#fff;font-weight:800;font-size:15px;white-space:nowrap;pointer-events:none}
.gp3-finish .gpn-rows{display:flex;flex-direction:column;gap:6px;margin:10px auto;width:min(420px,100%)}.gpn-rows div{display:flex;align-items:center;gap:10px;background:rgba(45,18,84,.92);border-radius:12px;padding:7px 12px;font-weight:700;color:#fff;text-align:left}.gpn-rows div.me{box-shadow:inset 0 0 0 3px #ffd600}.gpn-az{grid-template-columns:repeat(7,1fr);max-width:560px}.gpn-az button{min-height:56px;font-size:24px}.gpn-az .wide{grid-column:span 2;font:800 17px system-ui,sans-serif}.gpn-az .wide.ok{grid-column:span 3;background:#00ff66;color:#061a10;border-bottom-color:#00a93f}
.gpn-nm{margin:6px auto 0;min-width:70%;text-align:center;padding:10px 14px;border-radius:16px;background:#0d041d;border:4px solid #00f0ff;color:#ffd600;font:400 clamp(30px,9vw,46px)/1.15 "GPN Bungee",system-ui,sans-serif;letter-spacing:.04em;min-height:1.2em}
.gpn-slot small.cl{font-size:12px;color:#bfb2dd}.gpn-slot button.kick{font-size:18px}.gpn-slot b{font-family:"GPN Bungee",system-ui,sans-serif;font-weight:400;letter-spacing:.3px;font-size:18px;word-break:break-all}
.gpn-rows em{font:400 18px "GPN Bungee",system-ui,sans-serif;font-style:normal;width:46px;flex:none;color:#ffd600}.gpn-rows span{flex:1;min-width:0}.gpn-rows small{flex:none;opacity:.9;font-weight:600}

.gpn-fin{overflow:auto}.gpn-fin .gpn-rows{margin:6px auto}
.gpn-rows b.pts{flex:none;display:flex;flex-direction:column;align-items:flex-end;font:400 17px "GPN Bungee",system-ui,sans-serif;color:#00ff66;line-height:1}.gpn-rows b.pts i{font:700 11px system-ui,sans-serif;font-style:normal;color:#e8e0f7;margin-top:2px}
.gpn-rows div.pf{box-shadow:inset 0 0 0 3px #ff2d87}.gpn-rows div.pf.me{box-shadow:inset 0 0 0 3px #ffd600}
.gpn-pf{margin:2px auto;width:min(420px,100%);box-sizing:border-box;display:flex;flex-direction:column;align-items:center;gap:1px;padding:7px 12px;border-radius:12px;background:linear-gradient(90deg,#ff2d87,#ff7a00);color:#fff;text-align:center;transform:skewX(-6deg);animation:gpnPop .5s cubic-bezier(.2,1.6,.4,1)}.gpn-pf b{font:400 20px "GPN Bungee",system-ui,sans-serif;letter-spacing:.5px}.gpn-pf span{font-size:15px;font-weight:800}
@keyframes gpnPop{from{transform:scale(.6) skewX(-6deg);opacity:0}}
.gpn-flash{position:absolute;inset:0;z-index:30;background:#fff;pointer-events:none;animation:gpnFlash .9s ease-out forwards}@keyframes gpnFlash{0%{opacity:.95}100%{opacity:0}}
.gpn-ser{margin:4px auto;width:min(420px,100%);font-size:14px;font-weight:700;color:#ffd9ec;text-align:center}
.gpn-pod{margin:6px auto;width:min(420px,100%)}.gpn-podt{font:400 15px "GPN Bungee",system-ui,sans-serif;color:#ffd600;text-align:center;margin-bottom:6px}
.gpn-podc{display:flex;align-items:flex-end;justify-content:center;gap:8px}.gpn-podc>div{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;background:rgba(45,18,84,.92);border-radius:14px 14px 0 0;padding:6px 4px 0;color:#fff}.gpn-podc>div.me{box-shadow:inset 0 0 0 3px #ffd600}
.gpn-podc span{font-size:28px;line-height:1}.gpn-podc b{font:400 15px "GPN Bungee",system-ui,sans-serif;max-width:100%;overflow:hidden;text-overflow:ellipsis}.gpn-podc i{font:700 13px system-ui,sans-serif;font-style:normal;color:#00ff66}.gpn-podc u{display:block;width:100%;margin-top:4px;background:#4b2a80}
.gpn-podc .p1 u{height:46px;background:#ffd600}.gpn-podc .p2 u{height:28px;background:#c9ced6}.gpn-podc .p3 u{height:16px;background:#cd8a4b}
/* live position board: 1st-4th with names and the gap to the car in front */
.gpn-tags{position:absolute;left:0;top:0;width:0;height:0;z-index:3;pointer-events:none}.gpn-tag{position:absolute;left:0;top:0;white-space:nowrap;padding:.2em .7em .22em;border-radius:.7em;background:rgba(18,6,38,.9);border:.17em solid #00E5FF;color:#fff;font:800 16px system-ui,sans-serif;letter-spacing:.02em;box-shadow:0 2px 6px rgba(0,0,0,.45);will-change:transform}.gpn-tag:after{content:"";position:absolute;left:50%;bottom:-.5em;margin-left:-.32em;border:.32em solid transparent;border-top:.38em solid #00E5FF;border-bottom:0}
.gp3-wrap.v3.story .gpn-tag{background:#fff8e6;border-color:#2b2735;color:#2b2735;font-family:"Patrick Hand","Chalkboard SE","Comic Sans MS",system-ui,sans-serif;box-shadow:0 2px 0 #2b2735}.gp3-wrap.v3.story .gpn-tag:after{border-top-color:#2b2735}
.gpn-look{margin:8px 0 4px;padding:8px 12px;border-radius:14px;background:#2d1254;border:3px solid #4b2a80;color:#fff;font:700 16px system-ui,sans-serif;text-align:center}.gpn-look b{color:#ffd600;font-family:"GPN Bungee",system-ui,sans-serif;font-weight:400}.gpn-look small{display:block;font-size:13px;color:#e8e0f7;font-weight:600;margin-top:2px}
.gpn-board{position:absolute;z-index:4;left:calc(178px + env(safe-area-inset-left));top:calc(8px + env(safe-area-inset-top));width:clamp(150px,15vw,200px);display:flex;flex-direction:column;gap:3px;pointer-events:none;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
.gpn-board div{display:flex;align-items:center;gap:6px;height:28px;padding:0 9px 0 4px;border-radius:15px;background:rgba(18,22,32,.72);color:#fff;font-weight:800;font-size:14px;line-height:1;box-sizing:border-box;border:2px solid transparent}
.gpn-board div.me{border-color:#00E5FF;box-shadow:0 0 12px rgba(0,229,255,.45)}.gpn-board em{flex:none;width:20px;height:20px;border-radius:50%;display:grid;place-items:center;background:#fff;color:#121620;font-style:normal;font-size:12px;font-weight:900}.gpn-board div:first-child em{background:#FFD700}
.gpn-board b{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:800}.gpn-board u{flex:none;text-decoration:none;font-size:12px;font-weight:800;color:#39FF14;font-variant-numeric:tabular-nums}.gpn-board u.l{color:#ffd0e3}
.gp3-last{position:absolute;left:50%;top:21%;z-index:9;transform:translate(-50%,-50%) skewX(-10deg) scale(0);padding:8px 26px;border-radius:10px;border:4px solid #121620;background:#FF2079;color:#fff;font:400 clamp(28px,8vw,52px) "GPN Bungee",system-ui,sans-serif;letter-spacing:1px;box-shadow:0 6px 0 #121620,0 0 34px rgba(255,32,121,.8);pointer-events:none;white-space:nowrap;opacity:0}
.gp3-last.show{animation:gpLast 2.2s ease-out forwards}@keyframes gpLast{0%{opacity:1;transform:translate(-50%,-50%) skewX(-10deg) scale(1.9)}12%{transform:translate(-50%,-50%) skewX(-10deg) scale(1)}80%{opacity:1;transform:translate(-50%,-50%) skewX(-10deg) scale(1)}100%{opacity:0;transform:translate(-50%,-50%) skewX(-10deg) scale(1)}}
@media (prefers-reduced-motion:reduce){.gp3-last.show{animation-duration:2.4s}.gpn-pf,.gpn-flash{animation:none}}
.gp3-wrap.net .fz-skill,.gp3-wrap.net .fz-pos{display:none}
.gp3-wrap.net .fz-tl .fz-spd{font-size:13px;font-weight:800;margin-top:3px;color:#cfe}
/* phones, upright: big steering / brake / gas / boost buttons on their own plate under the picture, so nothing sits over the road */
@media (orientation:portrait) and (max-width:600px){
.gp3-wrap.v3.net{--plate:clamp(184px,25vh,232px)}@supports (height:100dvh){.gp3-wrap.v3.net{--plate:clamp(184px,25dvh,232px)}}
.gp3-wrap.v3.net canvas#gp3c{height:calc(100% - var(--plate))}.gp3-wrap.v3.net canvas.fz-fx,.gp3-wrap.v3.net .fz-vig,.gp3-wrap.v3.net canvas.fz-ck{height:calc(100% - var(--plate));bottom:auto}
.gp3-wrap.v3.net .gp3-plate{position:absolute;left:0;right:0;bottom:0;height:var(--plate);z-index:5;box-sizing:border-box;padding:10px 10px calc(10px + env(safe-area-inset-bottom));background:linear-gradient(#1a1f2e,#0d111b);border-top:4px solid #00E5FF;box-shadow:0 -6px 18px rgba(0,0,0,.45);display:grid;grid-template-columns:1fr 1fr .9fr 1fr;grid-template-rows:1fr 1fr;gap:8px;pointer-events:none}
.gp3-wrap.v3.net .gp3-plate .gp3-pad{display:contents}
.gp3-wrap.v3.net .gp3-plate .race-btn{width:auto;height:auto;min-width:0;border-radius:22px;font-size:40px;grid-row:1/3;background:#262c40;border:4px solid #3a4468;box-shadow:0 6px 0 #0a0d16;-webkit-backdrop-filter:none;backdrop-filter:none}
.gp3-wrap.v3.net .gp3-plate #rcL{grid-column:1}.gp3-wrap.v3.net .gp3-plate #rcR{grid-column:2}
.gp3-wrap.v3.net .gp3-plate .race-btn.on{background:#00E5FF;color:#121620;transform:translateY(4px);box-shadow:0 2px 0 #0a0d16}
.gp3-wrap.v3.net .gp3-plate .fz-pedal{width:100%!important;height:100%!important;pointer-events:auto;min-height:0}
.gp3-wrap.v3.net .gp3-plate .fz-pedal.gas{grid-column:4;grid-row:1/3}.gp3-wrap.v3.net .gp3-plate .fz-pedal.brake{grid-column:3;grid-row:1/3}
.gp3-wrap.v3.net .gp3-plate .fz-pedal b{top:46%;font-size:15px}
.gp3-wrap.v3.net .gp3-plate .fz-boost{position:absolute;right:auto;left:calc(10px + env(safe-area-inset-left));bottom:calc(100% + 10px);width:84px;height:84px;--bst:84px;pointer-events:auto}
.gp3-wrap.v3.net .fz-jhud{top:calc(116px + env(safe-area-inset-top));left:calc(8px + env(safe-area-inset-left));max-width:calc(100% - 92px);transform:translateY(-140%);box-sizing:border-box}.gp3-wrap.v3.net.jet .fz-jhud{transform:none}.gp3-wrap.v3.net .fz-trick{left:auto;right:calc(10px + 44px);bottom:calc(var(--plate) - 4px);margin:0;z-index:8;width:96px;height:96px}
.gp3-wrap.v3.net .fz-trick.on{bottom:calc(var(--plate) + 8px)}
.gp3-wrap.v3.net .fz-tach{display:none}
.gp3-wrap.v3.net .fz-cam{display:flex;top:calc(140px + env(safe-area-inset-top));right:calc(8px + env(safe-area-inset-right));width:68px;height:68px}
.gp3-wrap.v3.net .fz-tl{display:flex;flex-wrap:wrap;align-items:center;gap:8px;max-width:calc(100% - 130px);top:calc(8px + env(safe-area-inset-top))}.gp3-wrap.v3.net .fz-lap{margin:0}.gp3-wrap.v3.net .fz-time{margin:0;font-size:16px}.gp3-wrap.v3.net .fz-tl .fz-spd{margin:0}
.gp3-wrap.v3.net .gpn-board{left:calc(8px + env(safe-area-inset-left));top:calc(48px + env(safe-area-inset-top));width:min(46vw,190px)}
.gp3-wrap.v3.net .gp3-map{left:auto;right:calc(8px + env(safe-area-inset-right));top:calc(60px + env(safe-area-inset-top));width:78px}
.gp3-wrap.v3.net .fz-btn{width:44px;height:44px;font-size:19px;top:calc(8px + env(safe-area-inset-top))}.gp3-wrap.v3.net .fz-btn.quit{right:calc(8px + env(safe-area-inset-right))}.gp3-wrap.v3.net .fz-btn.mute{right:calc(60px + env(safe-area-inset-right))}
.gp3-wrap.v3.net .gp3-msg{top:30%}.gp3-wrap.v3.net .gp3-count{top:30%}
.gp3-wrap.v3.net.done .gp3-plate{display:none}.gp3-wrap.v3.net.done canvas#gp3c{height:100%}
}
`;document.head.appendChild(s);}
function gpnShell(title,back,body){return'<div class="fadein gpn" id="gpnScr"><div class="gpn-top"><h1>'+esc(title)+'</h1><button class="gpn-x" onclick="'+back+'">⟵ Back</button></div>'+body+'</div>';}
function gpnCarPic(id){return'assets/cars3d/thumbs/'+id+'.webp';}
function gpnFriendErr(e){const c=String(e&&(e.code||e.message)||e);if(/network|timeout|load|unavailable/i.test(c))return"Can't reach the race server. Check the Wi-Fi and try again.";return"Something went wrong. Try again.";}
function renderOnline(msg){window.scrollTo(0,0);clearTimers();closeOverlay();showAnanseCorner(false);gpStop();gpnCss();gpAudioUnlock();if(GPN)gpnLeave();GPA.init();
  const c=gpCar(),p=gpnMyPaint();
  app.innerHTML=gpnShell("Race a friend","renderCircuits()",
    '<div class="gpn-mine"><i style="--pic:url('+gpnCarPic(c.id)+')"></i><div><b>'+esc(gpnLabel(c.id,p))+'</b><small>This is your name in the race</small></div><button onclick="renderRace()">Change</button></div>'
    +'<button class="gpn-act" id="gpnCreate" onclick="gpnCreate()">Create room<small>You get a code to read out to your friends</small></button>'
    +'<button class="gpn-act cy" id="gpnJoin" onclick="gpnJoinScreen()">Join room<small>Your friend tells you their code</small></button>'
    +'<p class="gpn-err" id="gpnErr">'+esc(msg||"")+'</p>'
    +'<p class="gpn-note">🔒 Only people you give the code to can join. There is no chat and no strangers. Up to 4 players, each on their own device. Rooms end by themselves after 30 minutes with nothing going on.</p>');
  say("Race a friend.");gpnSweepMine();}
/* the room I made last time, if it was left behind by a crash or a closed tab: the rules let anyone remove a room idle for 30 min */
function gpnRememberRoom(c){try{if(c)localStorage.setItem("gfgp_room",c+"|"+Date.now());else localStorage.removeItem("gfgp_room");}catch(e){}}
async function gpnSweepMine(){let v=null;try{v=localStorage.getItem("gfgp_room");}catch(e){}if(!v)return;const q=v.split("|");if(Date.now()-(+q[1]||0)<31*60000)return;gpnRememberRoom(null);try{const F=await gpnConnect();await F.db.ref("rooms/"+q[0]).remove();}catch(e){}}
function gpnBusy(on,msg){["gpnCreate","gpnJoin"].forEach(i=>{const b=$(i);if(b)b.disabled=!!on;});const e=$("gpnErr");if(e)e.textContent=msg||"";}
async function gpnCreate(){gpnBusy(true,"Making your room…");
  try{const F=await gpnConnect(),uid=F.auth.currentUser.uid;let code=null;
    for(let i=0;i<6&&!code;i++){const c=gpnNewCode();   // the rules only let a room be made where nothing exists, so a code in use (or an expired room) just refuses: try another
      const meta={host:uid,track:window._gpnTrack||"deep",laps:2,pace:"gentle",state:"lobby",run:0,touched:GPN_SV()};if(!window._gpnNoLook)meta.look=gpLook();
      try{await F.db.ref("rooms/"+c+"/meta").set(meta);code=c;}catch(e){if(!/denied/i.test(String(e.code||e.message)))throw e;if(meta.look){window._gpnNoLook=true;i--;}}}   // a database that doesn't know "look" yet refuses it: make the room without (everyone then keeps their own Look), rather than not at all
    if(!code)throw new Error("no code");
    await F.db.ref("rooms/"+code+"/slots/0").set(uid);await gpnEnter(code,0);gpnRememberRoom(code);}
  catch(e){console.warn("online create",e);GPN=null;gpnBusy(false,gpnFriendErr(e));}}
function gpnJoinScreen(msg){gpnCss();window._gpnEntry="";window.scrollTo(0,0);
  const keys=GPN_ALPHA.split("").map(l=>'<button data-k="'+l+'" onclick="gpnKey(\''+l+'\')">'+l+'</button>').join("");
  app.innerHTML=gpnShell("Join room","renderOnline()",'<p class="gpn-note" style="text-align:center;font-size:17px">Type the 5 letters your friend reads out</p><div class="gpn-cells" id="gpnCells">'+[0,1,2,3,4].map(()=>'<b></b>').join("")+'</div><p class="gpn-err" id="gpnErr">'+esc(msg||"")+'</p><div class="gpn-keys">'+keys+'<button class="wide" onclick="gpnKey(\'back\')">⌫ Delete</button><button class="wide" onclick="gpnKey(\'clear\')">Clear</button></div>');
  gpnCellsDraw();window._gpnKd=e=>{if(!$("gpnCells")){window.removeEventListener("keydown",window._gpnKd);return;}const k=e.key.toUpperCase();if(k==="BACKSPACE")gpnKey("back");else if(k.length===1&&GPN_ALPHA.includes(k))gpnKey(k);};window.addEventListener("keydown",window._gpnKd);}
function gpnCellsDraw(){const v=window._gpnEntry||"",e=$("gpnCells");if(!e)return;[...e.children].forEach((b,i)=>{b.textContent=v[i]||"";b.classList.toggle("on",i===v.length);});}
function gpnKey(k){if(window._gpnJoining)return;let v=window._gpnEntry||"";if(k==="back")v=v.slice(0,-1);else if(k==="clear")v="";else if(v.length<5)v+=k;window._gpnEntry=v;gpnCellsDraw();if(typeof sfx==="function")sfx("tick");const er=$("gpnErr");if(er&&v.length<5)er.textContent="";if(v.length===5)gpnJoin(v);}
function gpnBad(msg){window._gpnJoining=false;window._gpnEntry="";gpnCellsDraw();const e=$("gpnErr"),c=$("gpnCells");if(e)e.textContent=msg;if(c){c.classList.remove("bad");void c.offsetWidth;c.classList.add("bad");}}
async function gpnJoin(code){window._gpnJoining=true;const er=$("gpnErr");if(er)er.textContent="Looking for the room…";
  const none="No room with that code. Check the letters with your friend. Rooms end after 30 minutes with nothing going on.";
  if(!/^[BDFGHJKLMNRSTWXY]{5}$/.test(code))return gpnBad(none);
  try{const F=await gpnConnect(),uid=F.auth.currentUser.uid;let m=null;
    try{m=(await F.db.ref("rooms/"+code+"/meta").once("value")).val();}catch(e){if(/denied/i.test(String(e.code||e.message)))return gpnBad(none);throw e;}   // an expired room is simply gone
    if(!m)return gpnBad(none);
    if(m.locked)return gpnBad("That room is locked. Ask the host to open it.");
    if(m.state!=="lobby")return gpnBad("That race has already started. Ask them to tap Race again, then join.");
    let seat=-1;try{const mine=(await F.db.ref("rooms/"+code+"/players/"+uid).once("value")).val();if(mine)seat=mine.slot;}catch(e){}   // back after a page refresh: same seat
    for(let n=0;n<GPN_MAX&&seat<0;n++){try{await F.db.ref("rooms/"+code+"/slots/"+n).set(uid);seat=n;}catch(e){if(!/denied/i.test(String(e.code||e.message)))throw e;}}
    if(seat<0)return gpnBad("That room is full (4 players), or the host closed your spot.");
    await gpnEnter(code,seat);window._gpnJoining=false;}
  catch(e){console.warn("online join",e);GPN=null;gpnBad(gpnFriendErr(e));}}
/* sits in a seat: write my player row, then start listening (reads are members only) */
async function gpnEnter(code,seat){const F=window._gpnFb,uid=F.auth.currentUser.uid,c=gpCar();
  GPN={code,uid,seat,meta:null,players:{},series:{},finish:{},order:null,race:null,scr:"lobby",iv:null,subs:[],offT:{},sendL:0,inflight:0,sent:0};
  const G=GPN;const nm=gpnMyName(),row={car:c.id,paint:gpnMyPaint(),slot:seat,on:true,ready:-1,load:-1};if(nm)row.name=nm;await gpnRef("players/"+uid).set(row);
  gpnRef("players/"+uid).onDisconnect().update({on:false,offAt:GPN_SV()});G.leaveArmed=true;
  const sub=(path,ev,fn)=>{const r=gpnRef(path),cb=r.on(ev,fn,()=>{if(GPN===G&&(path==="meta"||path===""))gpnGone();});G.subs.push(()=>r.off(ev,cb));};
  sub("meta","value",s=>{if(GPN===G)gpnOnMeta(s.val());});
  sub("players","value",s=>{if(GPN===G)gpnOnPlayers(s.val()||{});});
  sub("slots","value",s=>{if(GPN===G)G.slots=s.val()||{};});
  sub("finish","value",s=>{if(GPN===G)gpnOnFinish(s.val()||{});});
  sub("order","value",s=>{if(GPN===G)gpnOnOrder(s.val());});
  sub("series","value",s=>{if(GPN===G){G.series=s.val()||{};if(G.scr==="lobby")gpnLobbySoon();else gpnPanelSoon();}});
  sub("bump","child_added",s=>{if(GPN===G)gpnOnBump(s.key,s.val());});sub("bump","child_changed",s=>{if(GPN===G)gpnOnBump(s.key,s.val());});sub("cars","child_added",s=>{if(GPN===G)gpnOnCar(s.key,s.val());});sub("cars","child_changed",s=>{if(GPN===G)gpnOnCar(s.key,s.val());});
  sub("kick/"+uid,"value",s=>{if(GPN===G&&s.val()){gpnLeave(true);renderOnline("The host closed your spot in that room.");}});
  G.iv=setInterval(()=>{if(GPN===G)gpnRoomTick();},500);
  gpnTouch();window.scrollTo(0,0);gpnLobby();}
function gpnTouch(){if(!GPN)return;GPN.touchT=gpnNow();gpnRef("meta/touched").set(GPN_SV()).catch(()=>{});}
function gpnPresence(on){const G=GPN;if(!G||!G.leaveArmed)return;if(on){gpnRef("players/"+G.uid).onDisconnect().update({on:false,offAt:GPN_SV()});gpnRef("players/"+G.uid+"/on").set(true).catch(()=>{});}}
/* leave for good: seat and car go; the last one out removes the whole room */
function gpnLeave(quiet){const G=GPN;if(!G)return;GPN=null;clearInterval(G.iv);G.subs.forEach(f=>{try{f();}catch(e){}});
  const F=window._gpnFb,R="rooms/"+G.code+"/",u=G.uid;if(!F)return;const db=F.db,others=Object.keys(G.players).filter(k=>k!==u&&G.players[k].on!==false);
  try{db.ref(R+"players/"+u).onDisconnect().cancel();
    const rm=()=>Promise.all([db.ref(R+"players/"+u).remove(),db.ref(R+"cars/"+u).remove(),db.ref(R+"slots/"+G.seat).remove()]);
    if(!others.length){const amHost=G.meta&&G.meta.host===u;(amHost?Promise.resolve():db.ref(R+"meta/host").set(u)).then(()=>db.ref("rooms/"+G.code).remove()).then(()=>gpnRememberRoom(null)).catch(()=>rm().catch(()=>{}));}
    else rm().catch(()=>{});}catch(e){}}
function gpnGone(msg){const G=GPN;if(!G)return;GPN=null;clearInterval(G.iv);G.subs.forEach(f=>{try{f();}catch(e){}});gpnRememberRoom(null);try{window._gpnFb.db.ref("rooms/"+G.code).remove().catch(()=>{});}catch(e){}gpStop();renderOnline(msg||"That room has ended.");}   // the rules only allow that removal if the room really has expired
/* everyone in seat order, each with the paint and label THIS race uses (the same on every screen: a copy of an earlier car gets a spare colour) */
function gpnRoster(){const G=GPN,used=[],names=[],out=[];Object.keys(G.players).map(u=>Object.assign({uid:u},G.players[u])).sort((a,b)=>a.slot-b.slot).forEach(p=>{let pt=p.paint;if(used.includes(p.car+pt)){pt=GPN_SPARE.find(s=>!used.includes(p.car+s)&&gpnColor(s)!==gpnColor(p.paint))||pt;}used.push(p.car+pt);let label=gpnLabel(p.car,pt);{const same=out.filter(o=>o.label===label).length;if(same)label+=" "+(same+1);}const nm=gpnNameOk(p.name)?p.name:"",dup=!!nm&&names.includes(nm.toLowerCase());if(nm&&!dup)names.push(nm.toLowerCase());out.push(Object.assign(p,{paint:pt,label,name:dup?"":nm,dup,disp:(nm&&!dup)?nm:label,me:p.uid===G.uid}));});return out;}
function gpnOnMeta(m){const G=GPN;if(!m){gpnGone();return;}const prev=G.meta;G.meta=m;G.look=GP_LOOKS.includes(m.look)?m.look:null;
  if(m.state==="lobby"){if(G.scr!=="lobby"){gpStop();G.race=null;G.scr="lobby";G.finish={};G.order=null;window.scrollTo(0,0);gpnLobby();return;}gpnLobbySoon();return;}
  if((!G.race||G.race.run!==m.run)&&(m.state==="load"||m.state==="count"||m.state==="race")){if(!gpnOnScreen()){gpnLeave();return;}gpnBegin(m);}
  if(R3&&R3.online&&m.goAt&&!R3.netGo&&G.race&&G.race.run===m.run){gpnSetGo(m.goAt);}
  if(G.scr==="race"||G.scr==="done")gpnPanelSoon();}
function gpnOnPlayers(v){const G=GPN;G.players=v;const u=G.uid;
  if(!v[u]&&G.meta){gpnLeave(true);renderOnline("You left that room.");return;}
  const nowT=gpnNow();Object.keys(v).forEach(k=>{if(v[k].on===false){if(!G.offT[k])G.offT[k]=nowT;}else delete G.offT[k];});
  if(G.scr==="lobby")gpnLobbySoon();
  if(R3&&R3.online){R3.karts.forEach(kt=>{if(!kt.net)return;const p=v[kt.netUid],off=!p||p.on===false;if(off&&!kt.netOffS){kt.netOffS=1;kt.netGone=true;gpMsg(kt.racer.n+" left the race");}else if(!off&&kt.netOffS){kt.netOffS=0;}});gpnPanelSoon();}
}
function gpnOnFinish(v){const G=GPN;G.finish=v;if(G.scr==="race"||G.scr==="done")gpnPanelSoon();}
function gpnOnOrder(o){const G=GPN;G.order=o;if(G.race&&o&&o.run===G.race.run&&o.final&&R3&&R3.online&&!R3.done){gpFinish();}if(G.scr==="race"||G.scr==="done")gpnPanelSoon();}
function gpnLobbySoon(){if(window._gpnLS)return;window._gpnLS=1;setTimeout(()=>{window._gpnLS=0;if(GPN&&GPN.scr==="lobby")gpnLobby();},30);}
function gpnPanelSoon(){if(window._gpnPS)return;window._gpnPS=1;setTimeout(()=>{window._gpnPS=0;if(GPN&&R3&&R3.online&&R3.done)gpnPanel();},60);}
function gpnSlotHtml(r,i,G,isHost){if(!r)return'<div class="gpn-slot empty"><em>＋</em><small>Waiting for a friend</small></div>';
  const m=G.meta,rdy=r.ready===(m?m.run:-2),gone=r.on===false;
  return'<div class="gpn-slot'+(rdy?" ready":"")+(gone?" gone":"")+'" data-uid="'+esc(r.uid)+'">'+(rdy?'<u>READY</u>':'')+(isHost&&!r.me?'<button class="kick" aria-label="Remove this player" onclick="gpnKick(\''+esc(r.uid)+'\')">✕</button>':'')+'<i style="--pic:url('+gpnCarPic(r.car)+')"></i><b>'+esc(r.disp)+'</b>'+(r.name?'<small class="cl">'+esc(r.label)+'</small>':'')+'<small>'+(r.me?"You":(gone?"Lost connection…":(rdy?"Ready":"Getting ready")))+(m&&m.host===r.uid?" · Host":"")+((m&&(m.n|0)>0&&G.series&&G.series[r.uid]!=null)?" · "+G.series[r.uid]+" pts":"")+'</small></div>';}
function gpnLobby(){const G=GPN;if(!G||G.scr!=="lobby"||!app)return;gpnCss();const m=G.meta||{track:"deep",laps:2,pace:"gentle",run:0},isHost=m.host===G.uid,ros=gpnRoster(),me=ros.find(r=>r.me),rdy=!!me&&me.ready===m.run,C=GP_CIRCUITS.find(c=>c.id===m.track)||GP_CIRCUITS[0];
  const seats=[0,1,2,3].map(n=>ros.find(r=>r.slot===n)||null);
  const prevScroll=(()=>{const t=document.querySelector(".gpn-tr");return t?t.scrollLeft:0;})();
  const tracks=isHost?'<p class="gpn-h">PICK THE TRACK</p><div class="gpn-tr">'+GP_TRACK_ORDER().map(i=>{const c=GP_CIRCUITS[i];return'<button class="'+(c.id===m.track?"on":"")+'" data-id="'+c.id+'" onclick="gpnSet(\'track\',\''+c.id+'\')"><img src="assets/tracks/'+c.id+'.webp?v=1" alt="" loading="lazy"><b>'+esc(c.name)+'</b></button>';}).join("")+'</div>'
    +'<div class="gpn-chips">'+[1,2,3].map(n=>'<button class="'+(m.laps===n?"on":"")+'" onclick="gpnSet(\'laps\','+n+')">'+n+' lap'+(n>1?"s":"")+'</button>').join("")+'<button class="'+(m.pace==="gentle"?"on":"")+'" onclick="gpnSet(\'pace\',\'gentle\')">🐢 Easy</button><button class="'+(m.pace==="normal"?"on":"")+'" onclick="gpnSet(\'pace\',\'normal\')">🚗 Normal</button><button id="gpnLock" class="'+(m.locked?"on":"")+'" onclick="gpnSet(\'locked\','+(m.locked?"false":"true")+')">'+(m.locked?"🔒 Locked":"🔓 Open")+'</button></div>'
    :'<p class="gpn-h">THE TRACK</p><div class="gpn-picked" id="gpnPicked"><img src="assets/tracks/'+C.id+'.webp?v=1" alt=""><div><b>'+esc(C.name)+'</b><small>'+m.laps+' lap'+(m.laps>1?"s":"")+' · '+(m.pace==="normal"?"Normal":"Easy")+'</small></div></div>';
  const hostR=ros.find(r=>r.uid===m.host),curLook=G.look||gpLook(),
    lookLine=!G.look?"":'<p class="gpn-look" id="gpnLook">🖌️ Look: <b>'+(curLook==="story"?"Storybook":curLook==="toon"?"Cartoon":"Realistic")+'</b>, picked by '+(isHost?"you":esc(hostR?hostR.disp:"the host"))+'<small>Everyone races with this look</small></p>'
     +(isHost?'<div class="gpn-chips" id="gpnLookChips"><button class="'+(curLook==="real"?"on":"")+'" data-look="real" onclick="gpnSet(\'look\',\'real\')">🗻 Realistic</button><button class="'+(curLook==="toon"?"on":"")+'" data-look="toon" onclick="gpnSet(\'look\',\'toon\')">🎨 Cartoon</button><button class="'+(curLook==="story"?"on":"")+'" data-look="story" onclick="gpnSet(\'look\',\'story\')">🖌️ Storybook</button></div>':"");
  const others=ros.filter(r=>!r.me&&r.on!==false).length;
  const taken=!!(me&&me.dup),hint=taken?"A friend has your name, so you race as "+esc(me.label)+". Change name to use your own":(others?(rdy?"Waiting for everyone to tap Ready":"Tap when you're ready. The race starts when everyone is"):"Read the code out to a friend");
  app.innerHTML='<div class="gpn" id="gpnScr"><div class="gpn-top"><h1>Grand Fable GP</h1><button class="gpn-x" id="gpnExit" onclick="renderOnline()">Exit</button></div>'
   +'<div class="gpn-lob"><div><div class="gpn-code" id="gpnCode" aria-label="Room code '+G.code.split("").join(" ")+'"><small>ROOM CODE · read it out to your friends</small><span class="gpn-big">'+G.code+'</span></div>'
   +'<div class="gpn-grid" id="gpnSeats">'+seats.map((r,i)=>gpnSlotHtml(r,i,G,isHost)).join("")+'</div></div>'
   +'<div>'+(m.n>0?'<p class="gpn-h" id="gpnSer">SERIES · RACE '+Math.min(GPN_RACES,(m.n|0)+1)+' OF '+GPN_RACES+' · points carry over</p>':'')+tracks+lookLine
   +'<div class="gpn-mine" style="padding:6px 12px"><small>Your racing name<b id="gpnMyName" style="display:block;font-size:19px;color:#fff;font-family:\'GPN Bungee\',system-ui,sans-serif;font-weight:400">'+esc(me?me.disp:"")+'</b></small><button id="gpnNameBtn" onclick="gpnNameSheet()"'+(rdy?" disabled":"")+'>✏️ Change name</button></div>'
   +'<div class="gpn-mine" style="padding:6px 12px"><small>Your car: <b style="display:inline;font-size:15px;color:#fff">'+esc(me?me.label:"")+'</b></small><button id="gpnCarBtn" onclick="gpnCarSheet()"'+(rdy?" disabled":"")+'>🚗 Change car</button></div>'
   +'<div class="gpn-cta"><button class="gpn-act'+(rdy?" off":"")+'" id="gpnReady" onclick="gpnReady()">'+(rdy?"Ready ✓<small>"+hint+"</small>":"Ready to race!<small>"+hint+"</small>")+'</button></div></div></div></div>';
  const t2=document.querySelector(".gpn-tr");if(t2&&prevScroll)t2.scrollLeft=prevScroll;}
function gpnSet(k,v){const G=GPN;if(!G||!G.meta||G.meta.host!==G.uid||G.meta.state!=="lobby")return;if(k==="track")window._gpnTrack=v;if(typeof sfx==="function")sfx("tick");gpnRef("meta").update({[k]:v,touched:GPN_SV()}).catch(e=>console.warn(e));}
function gpnReady(){const G=GPN;if(!G||!G.meta)return;GPA.init();if(typeof sfx==="function")sfx("tick");const me=G.players[G.uid];if(!me)return;gpnRef("players/"+G.uid+"/ready").set(me.ready===G.meta.run?-1:G.meta.run).catch(e=>console.warn(e));gpnTouch();}
function gpnKick(uid){const G=GPN;if(!G||G.meta.host!==G.uid||uid===G.uid)return;const p=G.players[uid];if(!p)return;Promise.all([gpnRef("meta/locked").set(true),gpnRef("kick/"+uid).set(true),gpnRef("slots/"+p.slot).remove(),gpnRef("players/"+uid).remove(),gpnRef("cars/"+uid).remove()]).catch(e=>console.warn(e));}
function gpnCarSheet(){const sel=gpCar().id,h='<div class="gpn gpn-sheet" id="gpnSheet" style="max-width:none;min-height:0;padding:0;background:rgba(10,3,24,.86);border-radius:0"><div><div class="row"><h2>Choose your car</h2><button class="gpn-x" onclick="$(\'gpnSheet\').remove()">Close</button></div><div class="gpn-pick">'+GP_CARS.map(c=>'<button class="'+(c.id===sel?"on":"")+'" data-car="'+c.id+'" onclick="gpnPickCar(\''+c.id+'\')"><i style="--pic:url('+gpnCarPic(c.id)+')"></i>'+esc(c.n)+'</button>').join("")+'</div></div></div>';document.body.insertAdjacentHTML("beforeend",h);}
function gpnPickCar(id){const sh=$("gpnSheet");if(sh)sh.remove();gpPickCar(id);const G=GPN;if(G)gpnRef("players/"+G.uid).update({car:gpCar().id,paint:gpnMyPaint()}).catch(e=>console.warn(e));}
/* the racing name keypad: big letter keys only (no free text box), Title Case, run through the same filter the database uses */
function gpnNameSheet(){const G=GPN;if(!G||$("gpnSheet"))return;window._gpnNm=(gpnRoster().find(r=>r.me)||{}).name||"";
  const keys="ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(l=>'<button data-k="'+l+'" onclick="gpnNameKey(\''+l+'\')">'+l+'</button>').join("");
  document.body.insertAdjacentHTML("beforeend",'<div class="gpn gpn-sheet" id="gpnSheet" style="max-width:none;min-height:0;padding:0;background:rgba(10,3,24,.86);border-radius:0"><div><div class="row"><h2>Your racing name</h2><button class="gpn-x" onclick="$(\'gpnSheet\').remove()">Close</button></div>'
   +'<p class="gpn-note" style="text-align:center">It shows on your car and over it for your friends. 2 to 10 letters.</p><div class="gpn-nm" id="gpnNmShow"></div><p class="gpn-err" id="gpnNmErr"></p><div class="gpn-keys gpn-az">'+keys+'<button class="wide" onclick="gpnNameKey(\'back\')">⌫ Delete</button><button class="wide" onclick="gpnNameKey(\'clear\')">Clear</button><button class="wide ok" id="gpnNmSave" onclick="gpnNameSave()">✓ Save</button></div></div></div>');
  gpnNameDraw();window._gpnNmKd=e=>{if(!$("gpnNmShow")){window.removeEventListener("keydown",window._gpnNmKd);return;}const k=e.key;if(k==="Backspace")gpnNameKey("back");else if(k==="Enter")gpnNameSave();else if(/^[A-Za-z]$/.test(k))gpnNameKey(k.toUpperCase());};window.addEventListener("keydown",window._gpnNmKd);}
function gpnNameDraw(){const e=$("gpnNmShow"),v=window._gpnNm||"";if(e)e.innerHTML=v?esc(v):'<span style="opacity:.45">Type a name</span>';const er=$("gpnNmErr");if(er)er.textContent="";}
function gpnNameKey(k){let v=window._gpnNm||"";if(k==="back")v=v.slice(0,-1);else if(k==="clear")v="";else if(v.length<10)v+=k;v=v?v.charAt(0).toUpperCase()+v.slice(1).toLowerCase():"";window._gpnNm=v;if(typeof sfx==="function")sfx("tick");gpnNameDraw();}
function gpnNameSave(){const v=window._gpnNm||"",er=$("gpnNmErr");
  if(v&&!gpnNameOk(v)){if(er)er.textContent=v.length<2?"A name needs at least 2 letters.":"That name can't be used. Try a different one.";return;}
  const G=GPN;if(!G)return;window._gpnName=v;const sh=$("gpnSheet");if(sh)sh.remove();
  gpnRef("players/"+G.uid+"/name").set(v||null).catch(e=>console.warn(e));gpnTouch();}
/* ---------- the room's heartbeat: the host's device moves the state on ---------- */
function gpnOnScreen(){const G=GPN;return G.scr==="lobby"?!!$("gpnScr"):(!!R3||!!$("gpnLoad"));}   // false once the kid went somewhere else (Learning Zone Home button, say)
function gpnRoomTick(){const G=GPN,m=G.meta;if(!gpnOnScreen()){gpnLeave();return;}if(!m)return;const now=gpnNow(),u=G.uid,ros=gpnRoster();
  if(m.touched&&now-m.touched>GPN_IDLE){gpnGone("That room ended after 30 minutes with nothing going on.");return;}
  const on=ros.filter(r=>r.on!==false);
  // the host has gone: the player in the lowest seat takes over, after a short grace
  const H=G.players[m.host],stale=m.state!=="lobby"&&m.state!=="done"&&now-m.touched>120000;   // gone, or still connected but its timers have stopped (a tab in the background) so nothing moves on
  if(m.host!==u&&(!H||H.on===false||stale)){if(!G.hostOff)G.hostOff=now;if(now-G.hostOff>11000&&on.length&&on[0].uid===u){gpnRef("meta/host").set(u).catch(()=>{});G.hostOff=0;}}else G.hostOff=0;
  if(m.host!==u)return;
  if(m.state!=="lobby"&&m.state!=="done"&&!(m.goAt&&now-m.goAt>GPN_IDLE)&&(!G.touchT||now-G.touchT>60000))gpnTouch();
  if(m.state==="lobby"){
    ros.forEach(r=>{if(r.on===false&&G.offT[r.uid]&&now-G.offT[r.uid]>20000){gpnRef("players/"+r.uid).remove();gpnRef("slots/"+r.slot).remove();gpnRef("cars/"+r.uid).remove();}});
    const SL=G.slots||{},emp=G.emptyS||(G.emptyS={});Object.keys(SL).forEach(n=>{const u=SL[n];if(!u||G.players[u]){delete emp[n];return;}if(!emp[n])emp[n]=now;else if(now-emp[n]>15000){delete emp[n];gpnRef("slots/"+n).remove().catch(()=>{});}});   // a seat claimed with no player in it (crash mid-join) frees itself
    if(on.length>=2&&on.every(r=>r.ready===m.run)&&!G.starting){G.starting=true;G.loadAt=now;gpnRef("meta").update({state:"load",run:(m.run+1)%9000,touched:GPN_SV()}).catch(e=>console.warn(e)).then(()=>{G.starting=false;});}}
  else if(m.state==="load"){const need=(G.race?G.race.roster:on).filter(r=>{const p=G.players[r.uid];return p&&p.on!==false;});const all=need.every(r=>G.players[r.uid].load===m.run);if(!G.loadAt)G.loadAt=now;
    if(all||now-G.loadAt>25000){G.loadAt=0;gpnRef("meta").update({state:"count",goAt:now+4300,touched:GPN_SV()}).catch(e=>console.warn(e));}}
  else if(m.state==="count"){if(m.goAt&&now>m.goAt)gpnRef("meta/state").set("race").catch(()=>{});}
  else if(m.state==="race"){gpnHostOrder(m,on,now);}}
/* the order everyone sees. Times come from the shared race clock; two times under 50 ms apart are a tie, and the tie goes to whichever reached the host first */
function gpnSortFinish(G,run){const seq=G.finSeq||(G.finSeq={}),rows=Object.keys(G.finish).filter(u=>G.finish[u].run===run).map(u=>{if(!(u in seq))seq[u]=Object.keys(seq).length;return{u,ms:G.finish[u].ms,s:seq[u]};});rows.sort((a,b)=>Math.abs(a.ms-b.ms)<50?a.s-b.s:a.ms-b.ms);return rows.map(r=>r.u);}
function gpnHostOrder(m,on,now){const G=GPN,list=gpnSortFinish(G,m.run);if(!list.length)return;if(!G.firstFin||G.firstRun!==m.run){G.firstFin=now;G.firstRun=m.run;}
  const left=on.filter(r=>!list.includes(r.uid)),fin=!left.length||now-G.firstFin>GPN_LATE,key=list.join()+(fin?"!":"");
  if(G.orderKey===m.run+key)return;G.orderKey=m.run+key;const o={run:m.run,final:fin,list:{}};list.forEach((u,i)=>{o.list[i]=u;});
  gpnRef("order").set(o).then(()=>{if(fin)return gpnScore(m,list).then(()=>gpnRef("meta/state").set("done"));}).catch(e=>console.warn(e));}
/* series points (10/6/4/2 for 1st-4th, 0 for not finishing), written once per race by whoever is host, in ONE update together with the "scored" mark, so a host change never counts a race twice */
const GPN_PTS=[10,6,4,2],GPN_RACES=3;
function gpnScore(m,list){const G=GPN;if(!G||m.scored===m.run)return Promise.resolve();const S=G.series||{},upd={};
  (G.race?G.race.roster:[]).forEach(r=>{upd["series/"+r.uid]=S[r.uid]||0;});list.forEach((u,i)=>{upd["series/"+u]=(S[u]||0)+(GPN_PTS[i]||0);});
  upd["meta/scored"]=m.run;upd["meta/n"]=Math.min(GPN_RACES,(m.n|0)+1);upd["meta/touched"]=GPN_SV();return gpnRef("").update(upd);}
function gpnAgain(){const G=GPN;if(!G||G.meta.host!==G.uid)return;G.finSeq={};const fresh=(G.meta.n|0)>=GPN_RACES;   // after the third race "Race again" starts a new series from zero
  Promise.all([gpnRef("order").remove(),gpnRef("finish").remove(),gpnRef("cars").remove(),gpnRef("bump").remove()].concat(fresh?[gpnRef("series").remove()]:[])).then(()=>gpnRef("meta").update(Object.assign({state:"lobby",goAt:null,touched:GPN_SV()},fresh?{n:0}:{}))).catch(e=>console.warn(e));}
/* ---------- into the race ---------- */
function gpnBegin(m){const G=GPN;G.race={run:m.run,no:(m.n|0)+1,shift:(m.n|0),track:m.track,laps:m.laps,pace:m.pace,roster:gpnRoster().filter(r=>r.on!==false)};G.scr="race";G.finSeq={};G.firstFin=0;G.orderKey="";G.pfShown=0;G.panelKey="";G.loadAt=gpnNow();const sh=$("gpnSheet");if(sh)sh.remove();startRace3D(m.track);}
function gpnBuilt(){const G=GPN,R=R3;if(!G||!R)return;R.online=true;R.netGo=0;const T=R.T;R.karts.forEach(k=>{if(!k.net)return;k.netBuf=[];k.netJit=0;k.netOff=null;k.netOffW=[];k.netDelay=130;k.netSt=null;k.netLast=performance.now();
    // the label over a friend's car: a plain on-screen label (not a picture inside the 3D scene), so the Storybook ink filter and the distance can't wash it out; it is made from the player's name only
    const el=document.createElement("div");el.className="gpn-tag";el.textContent=k.racer.n;el.style.display="none";k.netTag=el;});
  {const w0=$("gp3");if(w0){const bx=document.createElement("div");bx.className="gpn-tags";bx.id="gpnTags";bx.setAttribute("aria-hidden","true");R.karts.forEach(k=>{if(k.netTag)bx.appendChild(k.netTag);});w0.appendChild(bx);R.nlBox=bx;}}
  const w=$("gp3");if(w)w.insertAdjacentHTML("beforeend",'<div class="gpn-board" id="gpnBoard" aria-label="Race positions"></div><div class="gpn-wait" id="gpnWait">Waiting for your friends…</div>');
  if(G.meta&&G.meta.goAt)gpnSetGo(G.meta.goAt);
  gpnRef("players/"+G.uid+"/load").set(G.race.run).catch(()=>{});
  if(G.order&&G.order.run===G.race.run&&G.order.final)setTimeout(()=>{if(GPN===G&&R3===R&&!R.done)gpFinish();},0);   // built so late the race is already over
}
function gpnSetGo(goAt){const R=R3;R.netGo=performance.now()+(goAt-gpnNow());const e=$("gpnWait");if(e)e.remove();}
/* a knock between two devices: whichever device sees the contact tells the other car's device, which gives its own car the same soft push (each device still only ever moves its own car) */
function gpnBumpOut(other,side,impact){const G=GPN,R=R3;if(!G||!other.netUid)return;const uid=other.netUid,t=R.simT||0,S=R.bumpSeen||(R.bumpSeen={});S[uid]=t;const sent=R.bumpSent||(R.bumpSent={});if(t-(sent[uid]||-9)<0.5)return;sent[uid]=t;const i=Math.min(9,+impact.toFixed(1));(R.bumpLog=R.bumpLog||[]).push({who:other.racer.n,side,i,via:"local",at:gpnNow()});gpnRef("bump/"+G.uid).set({to:uid,s:side,i,n:gpnNow()}).catch(()=>{});}
function gpnOnBump(uid,v){const G=GPN,R=R3;if(!G||uid===G.uid||!v||v.to!==G.uid||!R||!R.online||R.done||R.countdown>0.5)return;if(gpnNow()-v.n>1500||v.n<=(G.bumpN||0))return;G.bumpN=v.n;const t=R.simT||0,S=R.bumpSeen||(R.bumpSeen={});if(t-(S[uid]||-9)<0.3)return;   // this device already felt the same knock itself
  const me=R.me,i=Math.max(0,Math.min(9,+v.i||0)),side=v.s>0?1:-1;gpAddLatV(me,side*(0.06+Math.min(0.08,i*0.012)));me.speed*=1-Math.min(0.03,0.004*i);if(me.jet&&me.jet.ph==="fly")me.jet.vh+=(Math.random()<0.5?-1:1)*Math.min(2.2,0.7+i*0.3);S[uid]=t;R.bumpT=0;if(i>1.2){GPA.play("bonk");gpChainBreak();const p=me.pos;for(let q=0;q<6;q++){const an=Math.random()*6.28;R.sparks.emit(p.x,p.y+0.6,p.z,Math.cos(an)*2.5,1.5+Math.random()*2,Math.sin(an)*2.5,1,0.75,0.35,0.3);}}
  const k=R.karts.find(q=>q.netUid===uid);(R.bumpLog=R.bumpLog||[]).push({who:k?k.racer.n:uid,side,i,via:"net",at:gpnNow(),sentAt:v.n});}
function gpnOnCar(uid,v){const G=GPN;if(!G||uid===G.uid||!v)return;const L=window.__gpnLag;if(L){const d=L[0]+Math.random()*(L[1]-L[0]);setTimeout(()=>gpnInCar(G,uid,v),d);return;}gpnInCar(G,uid,v);}
function gpnInCar(G,uid,v){if(GPN!==G||!R3||!R3.online)return;const k=R3.karts.find(q=>q.net&&q.netUid===uid);if(!k||!k.netBuf)return;const now=performance.now();const B=k.netBuf;if(B.length&&v.n<=B[B.length-1].n)return;
  // the sender's clock mapped onto mine: the quickest recent delivery is the baseline, spread above it = jitter
  const off=now-v.n,W=k.netOffW;W.push({at:now,o:off});while(W.length&&now-W[0].at>4000)W.shift();let mn=1e12;for(let i=0;i<W.length;i++)if(W[i].o<mn)mn=W[i].o;k.netOff=mn;const jit=off-mn;k.netJit=Math.max(jit,(k.netJit||0)*0.97);
  const gap=k.netLast?now-k.netLast:83;k.netGap=(k.netGap||83)*0.9+gap*0.1;k.netDelay=Math.max(100,Math.min(420,k.netGap*1.15+k.netJit*1.1+15));k.netLast=now;
  B.push(v);if(B.length>48)B.shift();if(k.netOffS&&!(!G.players[uid]||G.players[uid].on===false))k.netGone=false;}
/* ---------- fair racing online (job 1107-0258) ----------
   Slipstream: sit 3.5-26 m behind another car (and within 2.6 m of its line) and, after about a second, the air in front lets you go up to
   +3% faster than the top speed everyone has (it builds over 1 s, fades over 0.6 s; wind lines show it). There is NO catch-up bonus on any pace
   (job 1109-1803 removed the Easy last-place +4%): nobody is helped for being behind. Each device works out its own bonus from the same shared positions. */
const GPN_DRAFT=0.03,GPN_CATCH=0;   // job 1109-1803: skill decides - the catch-up bonus is gone on every pace, and the tow is +3% (was +5%)
function gpnDraft(kt,dt,waiting){const R=R3,XS=R.W-1.2,L=R.len;let on=false,who=null;
  if(!waiting&&!R.done&&!kt.jet&&!kt.air&&kt.speed>0.5*kt.max){for(let i=0;i<R.karts.length;i++){const o=R.karts[i];if(o===kt||o.netGone||!o.started||o.net&&!o.netBuf)continue;const d=((o.t-kt.t+1)%1)*L;if(d<3.5||d>26||Math.abs(o.x-kt.x)*XS>2.6)continue;on=true;who=o;break;}}
  kt.drT=on?Math.min(1.5,(kt.drT||0)+dt):Math.max(0,(kt.drT||0)-dt/0.6);const k=Math.min(1,kt.drT);kt.drG=k*k*(3-2*k);kt.drWho=on?who:null;
  if(on&&kt.drG>0.2){R.drLog=R.drLog||{t:0,max:0};R.drLog.t+=dt;R.drLog.max=Math.max(R.drLog.max,kt.drG*GPN_DRAFT);}
  return kt.drG;}
function gpnCatchUp(dt){R3.me.cuT=0;return 0;}   // no help for whoever is behind: same car numbers, same boost meter, same grip for everyone in the room
/* a friend's name over their car, every frame: projected from the car's spot; bigger and crisper near, never smaller than a phone can read; hidden when the car is behind you */
function gpnLabels(){const R=R3;if(!R||!R.online||!R.nlBox)return;const cam=R.camera,cv=R.renderer.domElement,cw=cv.clientWidth,ch=cv.clientHeight;if(!cw||!ch)return;cam.updateMatrixWorld(true);const V=R.nlV||(R.nlV=new THREE.Vector3());
  R.karts.forEach(k=>{const el=k.netTag;if(!el)return;let on=false;if(k.net&&k.g.visible&&!k.netGone){V.set(k.g.position.x,k.g.position.y+(k.racer.car.grp==="trucks"?3.7:2.5),k.g.position.z);const d=V.distanceTo(cam.position);V.project(cam);
      if(V.z<1&&Math.abs(V.x)<1.1&&V.y>-1&&V.y<1.1){on=true;const px=Math.max(14,Math.min(20,21-d*0.04)),x=cv.offsetLeft+(V.x*0.5+0.5)*cw,y=cv.offsetTop+(-V.y*0.5+0.5)*ch;
        if(el.style.display!=="block")el.style.display="block";if(el._px!==Math.round(px)){el._px=Math.round(px);el.style.fontSize=el._px+"px";}el.style.transform="translate3d("+x.toFixed(1)+"px,"+y.toFixed(1)+"px,0) translate(-50%,-100%)";}}
    if(!on&&el.style.display!=="none")el.style.display="none";});}
/* live position board: 1st-4th, name, and the gap (seconds) to the car in front. Refreshed ~6 times a second from the same positions the race uses */
function gpnBoard(dt){const R=R3;R.bdT=(R.bdT||0)-dt;if(R.bdT>0)return;R.bdT=0.16;const el=$("gpnBoard");if(!el||!R.board)return;
  const html=R.board.map((k,i)=>{let g="";if(i>0){const a=R.board[i-1],d=((a.lap+a.t)-(k.lap+k.t))*R.len,sec=d/Math.max(25,k.speed||0);g='<u>+'+Math.max(0,sec).toFixed(1)+'s</u>';}else g='<u class="l">LEAD</u>';
    return'<div class="'+(k.player?"me":"")+'" data-n="'+esc(k.racer.n)+'"><em>'+(i+1)+'</em><b>'+esc(k.racer.n)+'</b>'+g+'</div>';}).join("");
  if(R.bdHtml!==html){R.bdHtml=html;el.innerHTML=html;}}
/* a friend's car this frame: where the snapshots say it was a moment ago (short prediction if they are late), joined up so a correction is never a jump */
function gpNetKart(kt,dt){const R=R3,B=kt.netBuf,now=performance.now();kt.px=kt.x;if(!B||!B.length){kt.speed=0;return;}
  const age=now-kt.netLast;if(age>5000&&!kt.netGone){kt.netGone=true;if(!kt.netOffS)gpMsg(kt.racer.n+" lost connection");}else if(age<1000&&!kt.netOffS&&kt.netGone)kt.netGone=false;
  const tgt=now-kt.netOff-kt.netDelay,L=R.len;let a=B[0],b=null;for(let i=B.length-1;i>=0;i--){if(B[i].n<=tgt){a=B[i];b=B[i+1]||null;break;}}
  const dw=(p,q)=>{let d=q-p;if(d>0.5)d-=1;else if(d<-0.5)d+=1;return d;};
  // how fast it really moves, measured from the snapshots themselves (a slow sender's "speed" is not its real progress)
  const last=B[B.length-1],prev=B.length>1?B[B.length-2]:null,rate=(b&&b.n>a.n)?dw(a.t,b.t)/(b.n-a.n):((prev&&last.n>prev.n)?dw(prev.t,last.t)/(last.n-prev.n):a.v/L/1000);
  let t,x,y,yaw,v,lap;
  if(b&&b.n>a.n&&tgt>=a.n){const u=(tgt-a.n)/(b.n-a.n);t=(a.t+dw(a.t,b.t)*u+1)%1;x=a.x+(b.x-a.x)*u;y=a.y+(b.y-a.y)*u;yaw=a.a+(b.a-a.a)*u;v=a.v+(b.v-a.v)*u;lap=(t<a.t-0.5)?b.l:a.l;}
  else{const ex=Math.max(0,Math.min(tgt-a.n,400)),lv=(prev&&a===last&&a.n>prev.n)?(a.x-prev.x)/(a.n-prev.n):0;t=(a.t+rate*ex+1)%1;x=a.x+lv*ex;y=a.y;yaw=a.a;v=a.v;lap=(t<a.t-0.5)?a.l+1:a.l;}
  const f=(last||a).f|0,F=a.f|0;
  // carry on at that rate and ease into the target: no lag and no snap (only a real teleport, over ~18 m, jumps)
  const wall=kt.netWall?Math.min(0.5,(now-kt.netWall)/1000):dt;kt.netWall=now;
  let S=kt.netSt;if(!S){S=kt.netSt={t,x,y,a:yaw};}
  const pt=(S.t+rate*wall*1000+1)%1,et=dw(pt,t);
  if(Math.abs(et*L)>18){S.t=t;S.x=x;S.y=y;S.a=yaw;}
  else{const q=1-Math.exp(-wall*9),nx=(pt+et*q+1)%1;S.t=(rate>=0&&dw(S.t,nx)<0)?S.t:nx;S.x+=(x-S.x)*q;S.y+=(y-S.y)*(1-Math.exp(-wall*16));S.a+=(yaw-S.a)*q;}   // driving forwards it only ever eases forwards
  kt.t=S.t;kt.x=S.x;kt.vy=dt>0?Math.max(-30,Math.min(30,(S.y-(kt.y||S.y))/dt)):0;kt.y=S.y;kt.netA=S.a;kt.speed=v;kt.lap=(kt.t<0.02&&lap<a.l)?a.l:lap;kt.started=true;
  const air=!!(F&1);kt.airT=air?(kt.airT||0)+dt:0;kt.air=air;kt.brakeOn=!!(f&32);kt.drift=(f&8)?-1:((f&16)?1:0);kt.boostT=(f&4)?0.3:0;kt.boostMul=1;kt.netDone=!!(f&512);
  if(kt.jg)kt.jg.want=(F&2)?1:0;kt.netJet=!!(F&2);
  const tk=(f>>6)&3;if(tk&&!kt.netTk&&!kt.trick)gpTrickStart(kt,["","roll","flip","spin"][tk],(f&256)?-1:1);kt.netTk=tk;
}
function gpnSend(now){const G=GPN,R=R3,me=R.me;if(!G||!R.online)return;const every=(R.countdown>1||R.done)?500:GPN_SEND;if(now-G.sendL<every||G.inflight>=3)return;G.sendL=now;
  const tk=me.trick?({roll:1,flip:2,spin:3}[me.trick.k]||0):0;
  const f=(me.air?1:0)|(me.jet?2:0)|(me.boostT>0?4:0)|(me.drift<0?8:0)|(me.drift>0?16:0)|(me.brakeOn?32:0)|(tk<<6)|(me.trick&&me.trick.d<0?256:0)|(R.done?512:0);
  const num=(v,d,lo,hi)=>{const r=+(+v).toFixed(d);return r<lo?lo:(r>hi?hi:(isFinite(r)?r:0));};
  const v={t:num(me.t,5,0,1),l:me.started?Math.min(9,me.lap):-1,x:num(me.x,3,-99,99),y:num(me.pos.y,2,-1000,3000),a:num(gpYawRel(me),3,-7,7),v:num(me.speed,1,-200,400),f,n:Math.round(now)};
  G.inflight++;G.sent++;gpnRef("cars/"+G.uid).set(v).then(()=>{G.inflight=Math.max(0,G.inflight-1);},e=>{G.inflight=Math.max(0,G.inflight-1);if(!G.sendErr){G.sendErr=1;console.warn("online send",e&&e.code);}});}
function gpnTick(now){if(GPN&&R3&&R3.online)gpnSend(performance.now());}
/* crossing the line: my time from the shared GO, then the results board fills in from the host's order */
function gpnFinish(){const G=GPN,R=R3;if(!G||!G.race){R.done=true;return;}R.done=true;gpBank();const crossed=R.me.lap>=R.C.laps;const ms=Math.max(1,Math.round(performance.now()-(R.netGo||performance.now())));
  if(crossed)gpnRef("finish/"+G.uid).set({ms,run:G.race.run}).catch(e=>console.warn(e));else G.dnf=true;
  G.scr="done";G.xpDone=false;const w=$("gp3");if(w)w.classList.add("done");GPA.play("lap");R.gas=false;R.touchDir=0;R.autoGas=false;setTimeout(()=>{if(GPN===G&&R3===R)GPA.stopEngine();},1300);gpnPanel();}
function gpnRows(){const G=GPN,run=G.race.run,o=G.order&&G.order.run===run?G.order:null,ros=G.race.roster;const names=ros.map(r=>Object.assign({},r,{ms:G.finish[r.uid]&&G.finish[r.uid].run===run?G.finish[r.uid].ms:null}));
  const list=o&&o.list?Object.keys(o.list).sort((a,b)=>a-b).map(i=>o.list[i]):[];
  const fin=list.map(u=>names.find(n=>n.uid===u)).filter(Boolean),rest=names.filter(n=>!list.includes(n.uid));
  return{fin,rest,final:!!(o&&o.final),list};}
function gpnPanel(){const G=GPN,R=R3;if(!G||!R||!R.done||!G.race)return;const w=$("gp3");if(!w)return;let P0=w.querySelector(".gp3-finish");if(!P0){w.insertAdjacentHTML("beforeend",'<div class="gp3-finish gpn-fin" id="gpnFin"></div>');P0=w.querySelector(".gp3-finish");}
  const X=gpnRows(),mePos=X.list.indexOf(G.uid)+1,isHost=G.meta&&G.meta.host===G.uid,run=G.race.run,scored=!!(X.final&&G.meta&&G.meta.scored===run),S=G.series||{},nDone=G.meta?(G.meta.n|0):0,series=scored&&nDone>=GPN_RACES;
  const title=X.final?(mePos?gpOrd(mePos).toUpperCase()+" PLACE"+(mePos===1?" 🏆":""):"TIME'S UP"):(mePos?gpOrd(mePos).toUpperCase()+" SO FAR":"FINISHED");
  // photo finish: two neighbours across the line less than 0.2 s apart (the closest pair gets the banner)
  let pf=null;for(let i=1;i<X.fin.length;i++){const a=X.fin[i-1],b=X.fin[i];if(a.ms!=null&&b.ms!=null&&b.ms-a.ms<200){const d=b.ms-a.ms;if(!pf||d<pf.d)pf={w:a,l:b,d};}}
  const pfBan=pf?'<div class="gpn-pf" id="gpnPf"><b>📸 PHOTO FINISH!</b><span>'+esc(pf.w.disp)+' beat '+esc(pf.l.disp)+' by '+(pf.d/1000).toFixed(3)+' s</span></div>':"";
  const pts=n=>{if(!scored)return"";const i=X.list.indexOf(n.uid);return'<b class="pts">'+(i>=0&&GPN_PTS[i]?"+"+GPN_PTS[i]:"+0")+'<i>'+(S[n.uid]||0)+' pts</i></b>';};
  const row=(n,pos)=>'<div class="'+(n.me?"me":"")+(pf&&(n===pf.w||n===pf.l)?" pf":"")+'" data-uid="'+esc(n.uid)+'"><em>'+pos+'</em><span>'+esc(n.disp)+(n.me?" · You":"")+'</span><small>'+(n.ms!=null?gpFmt(n.ms):"")+'</small>'+pts(n)+'</div>';
  const rows=X.fin.map((n,i)=>row(n,gpOrd(i+1))).join("")+X.rest.map(n=>{const p=G.players[n.uid],gone=!p||p.on===false,txt=gone?"Left":(X.final?"Didn't finish":"Still racing…");return'<div class="'+(n.me?"me":"")+'" data-uid="'+esc(n.uid)+'"><em>–</em><span>'+esc(n.disp)+(n.me?" · You":"")+'</span><small>'+txt+'</small>'+pts(n)+'</div>';}).join("");
  // series: race n of 3, then a podium on the points
  let ser="";
  if(series){const best={};X.list.forEach((u,i)=>{best[u]=i;});const rank=G.race.roster.map(r=>Object.assign({},r,{pt:S[r.uid]||0})).sort((a,b)=>b.pt-a.pt||((best[a.uid]==null?9:best[a.uid])-(best[b.uid]==null?9:best[b.uid]))),top=rank.slice(0,3),order=top.length>=3?[1,0,2]:(top.length===2?[1,0]:[0]),med=["🥇","🥈","🥉"];
    ser='<div class="gpn-pod" id="gpnPod"><div class="gpn-podt">SERIES PODIUM · after '+GPN_RACES+' races</div><div class="gpn-podc">'+order.map(i=>{const r=top[i];return'<div class="p'+(i+1)+(r.me?" me":"")+'" data-uid="'+esc(r.uid)+'"><span>'+med[i]+'</span><b>'+esc(r.disp)+'</b><i>'+r.pt+' pts</i><u></u></div>';}).join("")+'</div></div>';}
  else if(X.final)ser='<div class="gpn-ser" id="gpnSerLine">Series: race '+Math.min(GPN_RACES,Math.max(1,G.race.no))+' of '+GPN_RACES+' done · points carry over to the next race</div>';
  const next=nDone>=GPN_RACES?"New series 🔁":"Race again 🔁";
  const btn=X.final?(isHost?'<button class="btn big" id="gpnAgainBtn" onclick="gpnAgain()">'+next+'</button>':'<div class="fz-fin-s" id="gpnWaitHost">Waiting for the host to start the next race…</div>'):'<div class="fz-fin-s">Waiting for everyone to finish…</div>';
  const key=title+pfBan+rows+ser+btn;if(G.panelKey===key&&P0.innerHTML)return;const first=!G.panelKey;G.panelKey=key;
  P0.innerHTML='<div class="fz-fin-t" id="gpnFinT">'+title+'</div>'+pfBan+'<div class="gpn-rows" id="gpnRows">'+rows+'</div>'+ser+'<div class="btn-row" style="margin-top:10px">'+btn+'<button class="btn secondary big" onclick="renderOnline()">Leave room</button></div>';
  if(pf&&!G.pfShown){G.pfShown=1;const f=document.createElement("div");f.className="gpn-flash";w.appendChild(f);setTimeout(()=>f.remove(),900);}
  if(X.final&&!G.xpDone){G.xpDone=true;if(mePos===1){if(typeof confetti==="function")confetti();gpConfetti(P0);GPA.play("fanfare");}if(P&&mePos){P.xp=(P.xp||0)+([0,30,20,10,5][mePos]||5);if(typeof save==="function")save();}}}

/* ========== THE REIMAGINE (job 1109-1435): open-road festival look and feel for the Realistic look ==========
   Everything here is for the Realistic look only (Storybook keeps its own bright ink pass):
   · gpFzSky    - a real cloud sky, painted ONCE by a shader into a panorama (no per-frame cost); it also lights the reflections
   · gpFzRoad   - darker damp asphalt with a sky sheen toward the horizon; Japan Countryside gets orange centre / white edge paint
   · gpFzInit / gpFzRender - one full-screen pass: speed blur that keeps the car sharp, a filmic muted grade, soft vignette,
                  a colour fringe on BOOST. Switches itself off on a slow device (gpFrame) before shadows are touched.
   · gpInakaWorld - the Japan Countryside course: rice paddies, cedar forest, cherry blossom, wooden houses, vending machines,
                  utility poles with wires. Every repeated prop is one instanced draw call. */
const GP_FZ_NOISE="float fzH(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}float fzN(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(fzH(i),fzH(i+vec2(1.0,0.0)),f.x),mix(fzH(i+vec2(0.0,1.0)),fzH(i+vec2(1.0,1.0)),f.x),f.y);}float fzF(vec2 p){float a=0.5,s=0.0;for(int i=0;i<5;i++){s+=a*fzN(p);p=p*2.03+vec2(17.1,9.2);a*=0.5;}return s;}";
function gpFzSky(T,renderer,L,sunDir,C){try{
  const W=2048,H=1024,rt=new T.WebGLRenderTarget(W,H,{minFilter:T.LinearFilter,magFilter:T.LinearFilter,format:T.RGBAFormat,depthBuffer:false});rt.texture.encoding=T.sRGBEncoding;rt.texture.wrapS=T.RepeatWrapping;
  const cover=C.cloud!=null?C.cloud:(gpSandy(C)?0.3:0.46),sd=(C.id.length*7.3)%19;
  const bake=new T.ShaderMaterial({depthTest:false,depthWrite:false,uniforms:{top:{value:new T.Color(L.top)},mid:{value:new T.Color(L.mid)},hor:{value:new T.Color(L.hor)},glow:{value:new T.Color(L.glow)},sunDir:{value:sunDir},cover:{value:cover},seed:{value:sd},night:{value:L.night||0}},
    vertexShader:"varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}",
    fragmentShader:"uniform vec3 top;uniform vec3 mid;uniform vec3 hor;uniform vec3 glow;uniform vec3 sunDir;uniform float cover;uniform float seed;uniform float night;varying vec2 vUv;"+GP_FZ_NOISE+
     "void main(){float ph=(vUv.x-0.5)*6.2831853,th=(vUv.y-0.5)*3.14159265;vec3 d=vec3(sin(ph)*cos(th),sin(th),-cos(ph)*cos(th));float h=clamp(d.y,0.0,1.0);"+
     "vec3 c=mix(hor,mid,smoothstep(0.0,0.2,h));c=mix(c,top,pow(smoothstep(0.2,1.0,h),0.75));float s=max(dot(d,sunDir),0.0);"+
     "c+=glow*(pow(s,6.0)*0.22+pow(s,40.0)*0.35);"+
     "vec2 p=d.xz/(max(d.y,0.0)+0.16)*1.25+seed;float n=fzF(p*0.9)+0.35*fzF(p*2.7+3.1)-0.18;float cv=smoothstep(1.0-cover-0.12,1.0-cover+0.3,n*1.25);"+
     "float n2=fzF((p+sunDir.xz*0.22)*0.9)+0.35*fzF((p+sunDir.xz*0.22)*2.7+3.1)-0.18;float lit=clamp(0.55+(n-n2)*2.6,0.0,1.0);"+
     "vec3 shade=mix(mid,top,0.35)*0.72,bright=mix(vec3(1.0),glow,0.55);vec3 cl=mix(shade,bright,lit*(0.55+0.45*h));cl+=glow*pow(s,5.0)*0.35*(1.0-cv*0.5);cl*=1.0-night*0.25;"+
     "cv*=smoothstep(0.0,0.1,d.y);c=mix(c,cl,cv*0.93);"+
     "c+=glow*smoothstep(0.9990,0.9996,s)*(1.0-cv)*1.2;"+
     "float hz=exp(-max(d.y,0.0)*11.0);c=mix(c,mix(hor,glow,0.15+0.35*pow(s,3.0)),hz*0.7);if(d.y<0.0)c=mix(hor,glow,0.2);gl_FragColor=vec4(c,1.0);}"});
  const q=new T.Mesh(new T.PlaneGeometry(2,2),bake);q.frustumCulled=false;const sc=new T.Scene();sc.add(q);const cam=new T.OrthographicCamera(-1,1,1,-1,0,1);
  const tm=renderer.toneMapping;renderer.toneMapping=T.NoToneMapping;renderer.setRenderTarget(rt);renderer.render(sc,cam);renderer.setRenderTarget(null);renderer.toneMapping=tm;bake.dispose();q.geometry.dispose();
  const mat=new T.ShaderMaterial({side:T.BackSide,depthWrite:false,fog:false,uniforms:{map:{value:rt.texture}},
    vertexShader:"varying vec3 vD;void main(){vD=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
    fragmentShader:"uniform sampler2D map;varying vec3 vD;void main(){vec3 d=normalize(vD);vec2 uv=vec2(atan(d.x,-d.z)/6.2831853+0.5,asin(clamp(d.y,-1.0,1.0))/3.14159265+0.5);gl_FragColor=vec4(texture2D(map,uv).rgb,1.0);}"});
  let env=null;try{const pm=new T.PMREMGenerator(renderer);env=pm.fromEquirectangular(rt.texture);pm.dispose();}catch(e){env=null;}
  return{rt,mat,env,dispose(){try{rt.dispose();if(env)env.dispose();}catch(e){}}};}catch(e){return null;}}
/* car-only reflection map (Realistic): the sky above + a real ground below - dark asphalt under the car, the track's ground colour toward the
   horizon, a dark broken band of trees / barriers on the horizon and a brighter strip round the sun. This is the sky/ground "horizon line"
   that makes clear-coat paint read as a real car. Only car + traffic materials use it; the world and the damp road keep scene.environment. */
function gpCarEnv(T,renderer,fzSky,C,L,sunDir,band,skyTop){try{
  const sandy=gpSandy(C)||C.theme==="dakar",gc=new T.Color(sandy?0xc9a46a:C.grass).lerp(new T.Color(L.hor),0.25);
  const m=new T.ShaderMaterial({side:T.BackSide,depthTest:false,depthWrite:false,fog:false,uniforms:{sky:{value:fzSky?fzSky.rt.texture:null},hasSky:{value:fzSky?1:0},bTex:{value:null},hasBand:{value:0},bY0:{value:0},bH:{value:1},bR:{value:1},bTint:{value:new T.Color(1,1,1)},bTop:{value:new T.Color(skyTop||L.top)},bMat:{value:new T.Matrix3()},top:{value:new T.Color(L.top)},mid:{value:new T.Color(L.mid)},hor:{value:new T.Color(L.hor)},gnd:{value:gc},asp:{value:new T.Color(0x2a2c30)},sunDir:{value:sunDir},night:{value:L.night||0}},
    vertexShader:"varying vec3 vD;void main(){vD=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
    fragmentShader:"uniform sampler2D sky;uniform float hasSky;uniform sampler2D bTex;uniform float hasBand;uniform float bY0;uniform float bH;uniform float bR;uniform vec3 bTint;uniform vec3 bTop;uniform mat3 bMat;uniform vec3 top;uniform vec3 mid;uniform vec3 hor;uniform vec3 gnd;uniform vec3 asp;uniform vec3 sunDir;uniform float night;varying vec3 vD;"+GP_FZ_NOISE+
     "void main(){vec3 d=normalize(vD);float ph=atan(d.x,-d.z),el=asin(clamp(d.y,-1.0,1.0));vec2 vUv=vec2(ph/6.2831853+0.5,el/3.14159265+0.5);vec3 c;"+
     "if(d.y>=0.0){if(hasSky>0.5)c=texture2D(sky,vUv).rgb;else{c=mix(hor,mid,smoothstep(0.0,0.2,d.y));c=mix(c,top,pow(smoothstep(0.2,1.0,d.y),0.75));}"+
     "if(hasBand>0.5){float v=(tan(min(el,1.45))*bR-bY0)/bH,u=atan(d.x,d.z)/6.2831853;u=u<0.0?u+1.0:u;vec4 t=texture2D(bTex,(bMat*vec3(u,clamp(v,0.002,0.998),1.0)).xy);c=mix(mix(bTop,top,smoothstep(0.3,1.2,el)),t.rgb*bTint,t.a*(1.0-smoothstep(0.97,1.0,v)));}"+
     "c+=hor*0.35*exp(-el*28.0);}"+
     "else{float e=-d.y;c=mix(gnd,asp,smoothstep(0.02,0.35,e));c*=0.85+0.15*fzF(vec2(ph*6.0,e*20.0));}"+
     "float n=fzF(vec2(ph*9.0,1.7))*0.6+fzF(vec2(ph*23.0,4.1))*0.4,bt=0.035+0.07*n,band=smoothstep(-0.035,-0.012,el)*(1.0-smoothstep(bt-0.02,bt,el));"+
     "c=mix(c,mix(gnd*0.3,vec3(0.05,0.055,0.06),0.5),band*0.55);c*=1.0+0.6*smoothstep(0.978,1.0,max(dot(d,sunDir),0.0));c*=1.0-night*0.55;gl_FragColor=linearToOutputTexel(vec4(pow(max(c,vec3(0.0)),vec3(2.2)),1.0));}"});
  if(band&&band.material&&band.material.map){const U=m.uniforms,P=band.geometry.parameters,mp=band.material.map;mp.updateMatrix();U.bTex.value=mp;U.hasBand.value=1;U.bH.value=P.height;U.bR.value=P.radiusTop;U.bY0.value=band.position.y-P.height/2;U.bTint.value.copy(band.material.color);U.bMat.value.copy(mp.matrix);}
  /* rendered as a direction-shaded sphere through PMREM fromScene: in r128 fromEquirectangular only worked for the first call on a page (the race's own sky env map uses it) */
  const sc=new T.Scene(),sp=new T.Mesh(new T.SphereGeometry(40,48,24),m);sp.frustumCulled=false;sc.add(sp);
  const pm=new T.PMREMGenerator(renderer),env=pm.fromScene(sc,0,0.1,100);pm.dispose();m.dispose();sp.geometry.dispose();
  return{env,dispose(){try{env.dispose();}catch(e){}}};}catch(e){return null;}}
function gpCarEnvMat(m,tex){(Array.isArray(m)?m:[m]).forEach(x=>{if(!x||!x.isMeshStandardMaterial||x.envMap===tex)return;x.envMap=tex;x.needsUpdate=true;x.userData.cenv=x.userData.cenv||1;});}
/* once per race, after cars + world are built: car + traffic materials take the car reflection map (Realistic only; not in Coral Deep) */
function gpCarEnvApply(){const R=R3;if(!R||!gpReal()||R.C.deep)return;try{if(!R.cenv){R.cenvWant=1;return;}if(!R.cenv.env)return;const tex=R.cenv.env.texture;let n=0;
  R.karts.forEach(k=>{if(k&&k.g)k.g.traverse(o=>{if(o.isMesh){gpCarEnvMat(o.material,tex);n++;}});});
  R.scene.traverse(o=>{if(o.isMesh&&o.material&&o.material.userData&&o.material.userData.cenv===2)gpCarEnvMat(o.material,tex);});
  if(window.__gp)window.__gp.cenv=n;}catch(e){}}
/* asphalt: tone it down, let it take the sky at grazing angles (the "just rained an hour ago" sheen of the reference), keep worn dry patches */
function gpFzRoad(T,mat,C,L,rnd,pic){
  if(C.theme==="inaka"){const t=gpCanvasTex(512,1024,(x,w,h)=>{x.fillStyle="#34363a";x.fillRect(0,0,w,h);
      for(let i=0;i<26000;i++){const v=34+rnd()*44|0;x.fillStyle="rgba("+v+","+v+","+(v+3)+",.55)";x.fillRect(rnd()*w,rnd()*h,2,2);}
      for(let i=0;i<26;i++){const px=rnd()*w,py=rnd()*h,r=30+rnd()*90;const g=x.createRadialGradient(px,py,0,px,py,r);const dk=rnd()<0.6;g.addColorStop(0,dk?"rgba(14,15,18,.30)":"rgba(120,120,118,.16)");g.addColorStop(1,"rgba(0,0,0,0)");x.fillStyle=g;x.fillRect(px-r,py-r,2*r,2*r);}   // worn + patched areas
      const gr=x.createLinearGradient(0,0,w,0);[[0,0],[.14,.16],[.24,0],[.33,.16],[.43,0],[.57,0],[.67,.16],[.76,0],[.86,.16],[1,0]].forEach(s=>gr.addColorStop(s[0],"rgba(8,8,10,"+s[1]+")"));x.fillStyle=gr;x.fillRect(0,0,w,h);   // tyre-polished lanes
      x.strokeStyle="rgba(10,10,12,.5)";x.lineWidth=1.5;for(let i=0;i<9;i++){let px=rnd()*w,py=rnd()*h;x.beginPath();x.moveTo(px,py);for(let k=0;k<6;k++){px+=(rnd()-0.5)*50;py+=20+rnd()*40;x.lineTo(px,py);}x.stroke();}   // sealed cracks
      x.fillStyle="rgba(238,238,232,.93)";x.fillRect(16,0,7,h);x.fillRect(w-23,0,7,h);   // white edge lines
      x.fillStyle="rgba(244,148,32,.96)";x.fillRect(w/2-9,0,6,h);x.fillRect(w/2+3,0,6,h);   // double orange centre line
      x.fillStyle="rgba(236,236,230,.9)";[0.25,0.75].forEach(u=>{[0.06,0.56].forEach(v=>x.fillRect(w*u-3,h*v,6,h*0.2));});   // lane dashes
      for(let i=0;i<5000;i++){x.fillStyle="rgba(40,41,45,.5)";x.fillRect(rnd()*w,rnd()*h,2,1);}},true);
    t.repeat.set(1,pic?1:0.5);mat.map=t;mat.roughness=0.6;mat.metalness=0.0;mat.envMapIntensity=0.3;}
  else{mat.color=new T.Color(0.82,0.82,0.84);mat.roughness=Math.min(mat.roughness,0.62);mat.envMapIntensity=0.5;}
  const sk=new T.Color(L.hor).lerp(new T.Color(L.mid),0.35).lerp(new T.Color(L.glow),0.25);mat.userData.fzSheen={value:sk};mat.userData.fzWet={value:C.theme==="inaka"?0.27:(C.theme==="desert"?0.14:0.3)};
  mat.onBeforeCompile=sh=>{sh.uniforms.fzSheen=mat.userData.fzSheen;sh.uniforms.fzWet=mat.userData.fzWet;
    sh.fragmentShader="uniform vec3 fzSheen;uniform float fzWet;\n"+sh.fragmentShader.replace("#include <tonemapping_fragment>",
      "{float fzc=clamp(dot(normalize(vViewPosition),normal),0.0,1.0);float fzf=pow(1.0-fzc,4.0);float fzp=0.55+0.45*sin(vUv.y*2.3+sin(vUv.x*4.0)*1.3)*sin(vUv.x*3.1+vUv.y*0.7);gl_FragColor.rgb=mix(gl_FragColor.rgb,fzSheen*fzSheen,clamp(fzf*fzWet*(0.75+0.5*fzp),0.0,0.5));}\n#include <tonemapping_fragment>");};
  mat.customProgramCacheKey=()=>"fzroad";mat.needsUpdate=true;}
/* the one full-screen pass */
function gpFzInit(T,renderer,phone){try{
  const gl2=renderer.capabilities.isWebGL2&&!!T.WebGLMultisampleRenderTarget&&!phone,o={minFilter:T.LinearFilter,magFilter:T.LinearFilter,format:T.RGBAFormat};
  const rt=gl2?new T.WebGLMultisampleRenderTarget(4,4,o):new T.WebGLRenderTarget(4,4,o);rt.texture.encoding=T.sRGBEncoding;if(gl2)rt.samples=4;
  const C=R3.C,deep=!!C.deep,warm=gpSandy(C)||C.theme==="accra";
  const mat=new T.ShaderMaterial({depthTest:false,depthWrite:false,uniforms:{tCol:{value:rt.texture},res:{value:new T.Vector2(4,4)},uBlur:{value:0},uBoost:{value:0},uT:{value:0},uSat:{value:deep?1.0:(warm?0.94:0.9)},uCon:{value:deep?0.0:0.3},uVig:{value:0.2},uInk:{value:0},uInkC:{value:new T.Color(GP_TOON.ink)},uGrain:{value:0.014},tBloom:{value:null},uBloom:{value:0},
      uLift:{value:new T.Vector3(0.012,0.018,0.03)},uGain:{value:new T.Vector3(1.03,1.0,0.955)},uC:{value:new T.Vector2(0.5,0.42)}},
    vertexShader:"varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}",
    fragmentShader:"uniform sampler2D tCol;uniform sampler2D tBloom;uniform float uBloom;uniform vec2 res;uniform float uInk;uniform vec3 uInkC;uniform float uGrain;uniform float uBlur;uniform float uBoost;uniform float uT;uniform float uSat;uniform float uCon;uniform float uVig;uniform vec3 uLift;uniform vec3 uGain;uniform vec2 uC;varying vec2 vUv;"+
     "float hs(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}"+
     "void main(){vec2 dv=vUv-uC;dv.x*=res.x/res.y;float r2=dot(dv,dv);dv=vUv-uC;vec3 col=texture2D(tCol,vUv).rgb;float ink=0.0;"+"if(uInk>0.0){vec2 px=(res.y>1400.0?3.0:(res.y>650.0?2.0:1.0))/res;vec3 a1=texture2D(tCol,vUv+px).rgb,a2=texture2D(tCol,vUv-px).rgb,a3=texture2D(tCol,vUv+vec2(px.x,-px.y)).rgb,a4=texture2D(tCol,vUv+vec2(-px.x,px.y)).rgb;"+"vec3 g1=a1-a2,g2=a3-a4;float d=max(length(g1),length(g2))*0.7+abs(dot(g1+g2,vec3(0.3,0.59,0.11)))*0.6;float lc=dot(col,vec3(0.3,0.59,0.11));ink=smoothstep(0.13,0.30,d)*(1.0-smoothstep(0.82,0.95,lc)*step(col.r,col.b))*(1.0-0.9*smoothstep(0.45,0.62,vUv.y)*smoothstep(0.36,0.52,lc));}"+
     "float k=uBlur*smoothstep(0.035,0.42,r2);if(k>0.004){float j=hs(vUv*res+uT)-0.5;vec3 a=col;for(int i=1;i<=6;i++){float f=1.0-k*0.03*(float(i)+j);a+=texture2D(tCol,uC+dv*f).rgb;}col=a/7.0;}"+
     "if(uBoost>0.01){float ab=uBoost*0.0035*smoothstep(0.06,0.5,r2);col.r=mix(col.r,texture2D(tCol,uC+dv*(1.0-ab)).r,0.85);col.b=mix(col.b,texture2D(tCol,uC+dv*(1.0+ab)).b,0.85);}"+
     "float l=dot(col,vec3(0.2126,0.7152,0.0722));col=mix(vec3(l),col,uSat);col=col*uGain+uLift*(1.0-l);col=mix(col,col*col*(3.0-2.0*col),uCon);"+
     "if(uBloom>0.0)col+=texture2D(tBloom,vUv).rgb*uBloom;col*=1.0-uVig*smoothstep(0.16,0.75,r2);col=mix(col,uInkC,uInk*ink*0.88);col+=(hs(vUv*res+uT*7.0)-0.5)*uGrain;gl_FragColor=vec4(clamp(col,0.0,1.0),1.0);}"});
  const quad=new T.Mesh(new T.PlaneGeometry(2,2),mat);quad.frustumCulled=false;const scene=new T.Scene();scene.add(quad);const cam=new T.OrthographicCamera(-1,1,1,-1,0,1);
  R3.fz={rt,mat,scene,cam,on:true,blur:0,msaa:!!gl2,resize(w,h,pr){const W=Math.max(2,Math.round(w*pr)),H=Math.max(2,Math.round(h*pr));rt.setSize(W,H);mat.uniforms.res.value.set(W,H);gpFxResize();if(window._gpHullMat){window._gpHullMat.uniforms.uResY.value=H;window._gpHullMat.uniforms.uPx.value=Math.max(2.2,Math.min(5,H/330));}},dispose(){rt.dispose();mat.dispose();quad.geometry.dispose();}};
}catch(e){R3.fz=null;}}
function gpFzRender(dt,spd,cmode){const R=R3,F=R.fz,r=R.renderer;
  if(!F||!F.on){r.render(R.scene,R.camera);return;}
  const me=R.me,bk=R.bk||0,want=R.countdown>0?0:Math.max(0,Math.min(1,(spd-0.62)/0.38))*0.28+bk*0.3+(me.jet?0.12:0);
  F.blur+=(want-F.blur)*Math.min(1,dt*4);const U=F.mat.uniforms;U.uBlur.value=window.__gpNoBlur?0:F.blur;U.uBoost.value=bk;U.uT.value=(R.frameN||0)%97;
  U.uC.value.set(0.5,cmode==="chase"?(R.camera.aspect<1?0.36:0.4):0.5);
  r.setRenderTarget(F.rt);r.render(R.scene,R.camera);if(R.pfx&&R.pfx.bloom&&U.uBloom.value>0){r.setRenderTarget(R.pfx.bloom.rt);r.render(R.pfx.bloom.sc,F.cam);}r.setRenderTarget(null);r.render(F.scene,F.cam);}
/* ---------- Japan Countryside: zones village / paddy / forest / sakura (from the route tags) ---------- */
function gpInakaWorld(X){const {T,scene,C,samples,M,W,ds,nearest,groundAt,dummy,rnd,kap,inStands,runOut,railOff,WD,story}=X;
  const wrapI=i=>((i%M)+M)%M,Z=C.zones||{},out={update:null,traffic:null,splash:[],dirt:[],parked:[]};
  const inZ=(i,name)=>(Z[name]||[]).some(([a,b])=>{const ia=Math.round(a*M),ib=Math.round(b*M);i=wrapI(i);return ia<=ib?(i>=ia&&i<=ib):(i>=ia||i<=ib);});out.zoneAt=inZ;
  const yawAt=i=>{const s=samples[wrapI(i)];return Math.atan2(s.tan.x,s.tan.z);},lin=h=>gpLin(h),step=m=>Math.max(1,Math.round(m/ds));
  const sidePt=(i,off)=>{const s=samples[wrapI(i)];return s.pos.clone().addScaledVector(s.nor,off);},rOff=(i,sd)=>railOff[sd+1][wrapI(i)],run=(i,sd)=>runOut[wrapI(i)]===sd||runOut[wrapI(i-10)]===sd||runOut[wrapI(i+10)]===sd;
  const put=(x,y,z,yaw,sx,sy,sz)=>{dummy.position.set(x,y,z);dummy.rotation.set(0,yaw||0,0);dummy.scale.set(sx||1,sy||1,sz||1);dummy.updateMatrix();return dummy.matrix;};
  const IM=(geo,mat,list,fn,sh)=>{if(!list.length)return null;const m=new T.InstancedMesh(geo,mat,list.length);list.forEach((it,k)=>fn(it,k,m));if(m.instanceColor)m.instanceColor.needsUpdate=true;m.castShadow=!!sh;m.receiveShadow=true;scene.add(m);return m;};
  const used=[],free=(x,z,r)=>!used.some(u=>(u[0]-x)*(u[0]-x)+(u[1]-z)*(u[1]-z)<(u[2]+r)*(u[2]+r)),take=(x,z,r)=>used.push([x,z,r]);
  // ---- rice paddies: flat sheets of still water in terraces beside the road, young rice in rows, earth banks ----
  {const tops=[],skirts=[],pw=24,pl=27,P=(x,y,z)=>new T.Vector3(x,y,z);
    for(let i=0;i<M;i+=step(pl+2.5)){if(!inZ(i,"paddy")||!inZ(i+step(pl),"paddy")||inStands(i))continue;const im=i+step(pl/2);if(Math.abs(kap[wrapI(im)])>1/60)continue;
      [-1,1].forEach(sd=>{if(run(im,sd)||run(i,sd)||run(i+step(pl),sd))return;for(let row=0;row<2;row++){const o0=W+7.5+row*(pw+1.6),c=sidePt(im,sd*(o0+pw/2));if(!free(c.x,c.z,pw*0.7)||nearest(c.x,c.z)[1]<o0+pw/2-3)return;
        const s=samples[wrapI(im)],tx=s.tan.x,tz=s.tan.z,nx=s.nor.x*sd,nz=s.nor.z*sd,cs=[[-1,-1],[1,-1],[1,1],[-1,1]].map(q=>[c.x+tx*q[0]*pl/2+nx*q[1]*pw/2,c.z+tz*q[0]*pl/2+nz*q[1]*pw/2]);
        let y=groundAt(c.x,c.z);cs.forEach(q=>{y=Math.max(y,groundAt(q[0],q[1]));});y+=0.12;if(y>s.pos.y+2.2||y<s.pos.y-3)return;take(c.x,c.z,pw*0.72);
        const g=new T.BufferGeometry(),v=[],uv=[];[[0,1,2],[0,2,3]].forEach(t=>t.forEach(k=>{v.push(cs[k][0],y,cs[k][1]);uv.push(k===1||k===2?3:0,k>=2?3:0);}));g.setAttribute("position",new T.Float32BufferAttribute(v,3));g.setAttribute("uv",new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();tops.push({g});
        const gs=new T.BufferGeometry(),sv=[];for(let k=0;k<4;k++){const a=cs[k],b=cs[(k+1)%4],e=0.9,ax=a[0]+(a[0]-c.x)*0.035,az=a[1]+(a[1]-c.z)*0.035,bx=b[0]+(b[0]-c.x)*0.035,bz=b[1]+(b[1]-c.z)*0.035;
          sv.push(ax,y+0.14,az,bx,y+0.14,bz,bx,y-e*2,bz, ax,y+0.14,az,bx,y-e*2,bz,ax,y-e*2,az, a[0],y+0.14,a[1],b[0],y+0.14,b[1],bx,y+0.14,bz, a[0],y+0.14,a[1],bx,y+0.14,bz,ax,y+0.14,az);}
        gs.setAttribute("position",new T.Float32BufferAttribute(sv,3));gs.computeVertexNormals();gs.setAttribute("uv",new T.Float32BufferAttribute(new Float32Array(sv.length/3*2),2));skirts.push({g:gs});}});}
    if(tops.length){const rice=gpCanvasTex(256,256,(x,w,h)=>{x.fillStyle="#5d6e58";x.fillRect(0,0,w,h);for(let i=0;i<40;i++){x.fillStyle=rnd()<0.5?"rgba(40,60,50,.16)":"rgba(190,200,180,.10)";x.beginPath();x.arc(rnd()*w,rnd()*h,20+rnd()*40,0,7);x.fill();}
        for(let r=0;r<16;r++)for(let c=0;c<32;c++){const px=c*8+3+rnd()*2,py=r*16+4+rnd()*3;x.fillStyle=["#6f9a3e","#86ad45","#5c8a36"][(r+c)%3];x.fillRect(px,py,2.2,7);x.fillRect(px-1.5,py+1,1.2,5);x.fillRect(px+2.4,py+2,1.2,4);}},true);
      const wm=story?new T.MeshLambertMaterial({map:rice}):new T.MeshStandardMaterial({map:rice,roughness:0.42,metalness:0.0,envMapIntensity:0.32});const tm=new T.Mesh(gpMerge(T,tops),wm);tm.receiveShadow=true;scene.add(tm);
      const bm=new T.Mesh(gpMerge(T,skirts),new T.MeshLambertMaterial({color:0x6f7a4c}));bm.receiveShadow=true;scene.add(bm);out.paddies=tops.length;}}
  // ---- houses: timber and plaster walls under dark tiled gable roofs, with a lower porch roof on the two-storey ones ----
  const houses=[];{const addH=(i,sd,off,big)=>{if(run(i,sd))return;if(inStands(i))off=Math.max(off,W+13.5);const w=big?9+rnd()*3:7+rnd()*3,d=6+rnd()*2,p=sidePt(i,sd*(off+d/2));if(!free(p.x,p.z,w*0.62)||nearest(p.x,p.z)[1]<off+d/2-2.5)return;const y=groundAt(p.x,p.z);take(p.x,p.z,w*0.62);houses.push({x:p.x,y,z:p.z,yaw:yawAt(i)+Math.PI/2+(sd<0?Math.PI:0),w,d,h:big?5.4:3.1,big,k:houses.length});};
    for(let i=0;i<M;i+=step(13)){if(inZ(i,"village")){[-1,1].forEach(sd=>{if(rnd()<0.82)addH(i+Math.round((rnd()-0.5)*step(4)),sd,rOff(i,sd)+6.5+rnd()*3,rnd()<0.42);if(rnd()<0.5)addH(i,sd,rOff(i,sd)+21+rnd()*6,rnd()<0.5);});}
      else if(inZ(i,"paddy")&&rnd()<0.2){const sd=rnd()<0.5?-1:1;addH(i,sd,W+62+rnd()*14,rnd()<0.5);}else if(inZ(i,"sakura")&&rnd()<0.18){const sd=rnd()<0.5?-1:1;addH(i,sd,rOff(i,sd)+12+rnd()*5,false);}}
    const wallT=gpCanvasTex(256,128,(x,w,h)=>{x.fillStyle="#e9e3d4";x.fillRect(0,0,w,h);x.fillStyle="#3b2c22";x.fillRect(0,h*0.56,w,h*0.44);for(let k=0;k<=8;k++)x.fillRect(k*32-2,0,4,h);x.fillRect(0,0,w,6);x.fillRect(0,h*0.52,w,6);
        x.fillStyle="#dcd4bf";for(let k=0;k<8;k++){if(k%3===1){x.fillRect(k*32+5,h*0.6,22,h*0.36);x.strokeStyle="#3b2c22";x.lineWidth=1;for(let q=1;q<3;q++){x.beginPath();x.moveTo(k*32+5+q*7.3,h*0.6);x.lineTo(k*32+5+q*7.3,h*0.96);x.stroke();}for(let q=1;q<4;q++){x.beginPath();x.moveTo(k*32+5,h*0.6+q*11);x.lineTo(k*32+27,h*0.6+q*11);x.stroke();}}}
        x.fillStyle="#2e3a46";for(let k=0;k<8;k++){if(k%3!==1)x.fillRect(k*32+7,h*0.14,18,h*0.26);}x.fillStyle="rgba(255,214,150,.55)";[2,5].forEach(k=>x.fillRect(k*32+7,h*0.14,18,h*0.26));});
    const roofT=gpCanvasTex(128,128,(x,w,h)=>{x.fillStyle="#3a4048";x.fillRect(0,0,w,h);for(let r=0;r<8;r++){x.fillStyle="rgba(0,0,0,.28)";x.fillRect(0,r*16+13,w,3);x.fillStyle="rgba(255,255,255,.07)";x.fillRect(0,r*16,w,2);for(let c=0;c<16;c++){x.fillStyle="rgba(0,0,0,.16)";x.fillRect(c*8+(r%2)*4,r*16,1.5,16);}}},true);
    const body=new T.BoxGeometry(1,1,1).translate(0,0.5,0);
    const roofG=(()=>{const g=new T.BufferGeometry(),v=[],uv=[],q=(a,b,c,d,ua)=>{[a,b,c,a,c,d].forEach((p,k)=>{v.push(p[0],p[1],p[2]);const m=[0,1,2,0,2,3][k];uv.push(ua[m][0],ua[m][1]);});},L=[-0.5,0,0.5],R=[0.5,0,0.5],L2=[-0.5,0,-0.5],R2=[0.5,0,-0.5],A=[-0.5,1,0],B=[0.5,1,0];
      q(L,R,B,A,[[0,0],[4,0],[4,2],[0,2]]);q(R2,L2,A,B,[[0,0],[4,0],[4,2],[0,2]]);[[L,A,L2],[R2,B,R]].forEach(t=>t.forEach(p=>{v.push(p[0],p[1],p[2]);uv.push(0.02,0.02);}));q(L2,R2,R,L,[[0,0],[0.02,0],[0.02,0.02],[0,0.02]]);
      g.setAttribute("position",new T.Float32BufferAttribute(v,3));g.setAttribute("uv",new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();return g;})();
    const walls=[0xffffff,0xe9dcc4,0xc9b79a,0xf4efe4,0x9a7a5a],roofs=[0xffffff,0xd9c0b0,0xb9c4d6,0xe6e6e6];
    IM(body,new T.MeshLambertMaterial({map:wallT}),houses,(h,k,m)=>{m.setMatrixAt(k,put(h.x,h.y-0.3,h.z,h.yaw,h.w,h.h+0.3,h.d));m.setColorAt(k,lin(walls[k%walls.length]));},true);
    IM(roofG,new T.MeshStandardMaterial({map:roofT,roughness:0.55,metalness:0.1,side:T.DoubleSide}),houses,(h,k,m)=>{m.setMatrixAt(k,put(h.x,h.y+h.h-0.05,h.z,h.yaw,h.w*1.22,h.d*0.36,h.d*1.42));m.setColorAt(k,lin(roofs[k%roofs.length]));},true);
    const porch=houses.filter(h=>h.big);IM(roofG,new T.MeshStandardMaterial({map:roofT,roughness:0.55,metalness:0.1,side:T.DoubleSide}),porch,(h,k,m)=>{m.setMatrixAt(k,put(h.x,h.y+2.75,h.z,h.yaw,h.w*1.3,h.d*0.12,h.d*1.62));m.setColorAt(k,lin(roofs[h.k%roofs.length]));},true);out.houses=houses.length;}
  // ---- vending machines (lit fronts, no brands), hedges and low stone walls along the village street ----
  {const vend=[[],[]],hedge=[],wall=[];for(let i=step(6);i<M;i+=step(9)){if(!inZ(i,"village")&&!(inZ(i,"sakura")&&i%7===0))continue;if(inStands(i))continue;[-1,1].forEach(sd=>{if(run(i,sd))return;const r=rnd(),o=rOff(i,sd);
        if(r<0.2){const p=sidePt(i,sd*(o+1.5));if(nearest(p.x,p.z)[1]<o+0.9)return;vend[(i+sd)&1?1:0].push([p.x,groundAt(p.x,p.z),p.z,yawAt(i)+sd*Math.PI/2]);}
        else if(r<0.62){const p=sidePt(i,sd*(o+3.1));if(nearest(p.x,p.z)[1]<o+2.2)return;(r<0.42?hedge:wall).push([p.x,groundAt(p.x,p.z),p.z,yawAt(i),0.9+rnd()*0.3]);}});}
    const vt=gpCanvasTex(256,256,(x,w,h)=>{x.fillStyle="#ffffff";x.fillRect(0,0,w,h);[["#f4f6f8","#2a6fd0"],["#d8232a","#f4f4f4"]].forEach((c,q)=>{const ox=q*128;x.fillStyle=c[0];x.fillRect(ox+4,4,120,248);x.fillStyle=c[1];x.fillRect(ox+4,4,120,34);x.fillStyle="#10141c";x.fillRect(ox+12,44,104,120);
        for(let r=0;r<3;r++)for(let k=0;k<7;k++){x.fillStyle=["#e8413a","#f2b21c","#2f9e58","#2a6fd0","#f4f4f4","#f08a2c","#7a4bd6"][(k*3+r*2+q)%7];x.fillRect(ox+16+k*14,50+r*38,10,26);x.fillStyle="rgba(255,255,255,.75)";x.fillRect(ox+16+k*14,50+r*38,10,5);x.fillStyle="#cfd6de";x.fillRect(ox+17+k*14,79+r*38,8,3);}
        x.fillStyle="rgba(255,255,255,.14)";x.fillRect(ox+12,44,40,120);x.fillStyle="#22262e";x.fillRect(ox+20,178,88,26);x.fillStyle="#9aa3ad";x.fillRect(ox+86,170,22,5);x.fillStyle="#0c0e12";x.fillRect(ox+28,214,72,22);});});
    const vgeo=q=>{const b=new T.BoxGeometry(1.05,1.85,0.72).translate(0,0.925,0),uv=b.attributes.uv;for(let k=0;k<uv.count;k++)uv.setXY(k,q*0.5+0.02,0.99);const f=new T.PlaneGeometry(1.05,1.85).translate(0,0.925,0.365),fu=f.attributes.uv;for(let k=0;k<fu.count;k++)fu.setX(k,q*0.5+fu.getX(k)*0.5);
      return gpMerge(T,[{g:b,c:lin(q?"#c8262c":"#eef0f2")},{g:f}]);};
    const vm=new T.MeshLambertMaterial({map:vt,emissiveMap:vt,emissive:new T.Color(0x2b2b2b),vertexColors:true});vm.userData.lin=1;[0,1].forEach(q=>IM(vgeo(q),vm,vend[q],(v,k,m)=>m.setMatrixAt(k,put(v[0],v[1],v[2],v[3])),true));
    const ht=gpCanvasTex(64,64,(x,w,h)=>{x.fillStyle="#3f5a30";x.fillRect(0,0,w,h);for(let i=0;i<700;i++){x.fillStyle=["rgba(20,40,16,.5)","rgba(110,140,60,.5)","rgba(60,90,40,.6)"][i%3];x.fillRect(rnd()*w,rnd()*h,2.5,2.5);}},true);
    IM(new T.BoxGeometry(8.2,1.15,1.1).translate(0,0.5,0),new T.MeshLambertMaterial({map:ht}),hedge,(v,k,m)=>m.setMatrixAt(k,put(v[0],v[1],v[2],v[3],1,v[4],1)),true);
    const st=gpCanvasTex(128,64,(x,w,h)=>{x.fillStyle="#8a8a84";x.fillRect(0,0,w,h);for(let r=0;r<4;r++)for(let c=0;c<5;c++){const v=110+rnd()*50|0;x.fillStyle="rgb("+v+","+v+","+(v-8)+")";x.fillRect(c*26+(r%2)*13-12,r*16+1,24,14);}},true);
    IM(new T.BoxGeometry(8.2,0.85,0.5).translate(0,0.4,0),new T.MeshLambertMaterial({map:st}),wall,(v,k,m)=>m.setMatrixAt(k,put(v[0],v[1],v[2],v[3])),true);out.vending=vend[0].length+vend[1].length;}
  // ---- utility poles down one side with three sagging wires, crossing the road now and then (the look of every Japanese lane) ----
  {const poles=[],wv=[];let sd=1,prev=null,cnt=0;for(let i=step(12);i<M;i+=step(31)){if(cnt%14===13){sd=-sd;}cnt++;if(run(i,sd)){prev=null;continue;}
      const p=sidePt(i,sd*(inStands(i)?W+11.8:rOff(i,sd)+1.35)),y=groundAt(p.x,p.z),yaw=yawAt(i);const s=samples[wrapI(i)],cur={x:p.x,y,z:p.z,nx:s.nor.x,nz:s.nor.z};poles.push([p.x,y,p.z,yaw]);
      if(prev){[[-0.95,8.5],[0.95,8.5],[0,7.75]].forEach(q=>{const a=[prev.x+prev.nx*q[0],prev.y+q[1],prev.z+prev.nz*q[0]],b=[cur.x+cur.nx*q[0],cur.y+q[1],cur.z+cur.nz*q[0]];const N=7;for(let k=0;k<N;k++){const t0=k/N,t1=(k+1)/N,sg=t=>-1.1*4*t*(1-t);wv.push(a[0]+(b[0]-a[0])*t0,a[1]+(b[1]-a[1])*t0+sg(t0),a[2]+(b[2]-a[2])*t0,a[0]+(b[0]-a[0])*t1,a[1]+(b[1]-a[1])*t1+sg(t1),a[2]+(b[2]-a[2])*t1);}});}
      prev=cur;}
    const pg=gpMerge(T,[{g:new T.CylinderGeometry(0.13,0.17,9.2,7).translate(0,4.6,0)},{g:new T.BoxGeometry(2.2,0.11,0.11).translate(0,8.5,0)},{g:new T.BoxGeometry(1.2,0.1,0.1).translate(0,7.75,0)},{g:new T.CylinderGeometry(0.22,0.22,0.7,8).translate(0.42,7.0,0),c:lin("#5b6168")},{g:new T.BoxGeometry(0.5,0.12,0.5).translate(0,0.06,0)}]);
    IM(pg,new T.MeshLambertMaterial({color:0x8d8b84,vertexColors:true}),poles,(v,k,m)=>m.setMatrixAt(k,put(v[0],v[1],v[2],v[3])),true);
    if(wv.length){const g=new T.BufferGeometry();g.setAttribute("position",new T.Float32BufferAttribute(wv,3));const lm=new T.LineBasicMaterial({color:0x1c1e22,transparent:true,opacity:0.85});const ls=new T.LineSegments(g,lm);ls.frustumCulled=false;scene.add(ls);}out.poles=poles.length;}
  // ---- trees: cedar walls in the forest, a cherry-blossom avenue, lone maples in the village, cedars on every hill behind ----
  {const BB=[],fb={cedar:[],cherry:[]},ok=(x,z,o)=>nearest(x,z)[1]>=o&&free(x,z,1.5),add=(type,x,z,sc,flip)=>{const y=groundAt(x,z);if(y<0.5)return;BB.push([type,x,y,z,sc,flip]);(type[1]==="h"?fb.cherry:fb.cedar).push([x,y,z,sc]);};
    for(let i=0;i<M;i+=step(4.2)){const F=inZ(i,"forest"),S=inZ(i,"sakura"),V=inZ(i,"village"),PZ=inZ(i,"paddy");[-1,1].forEach(sd=>{if(run(i,sd))return;const o=inStands(i)?W+10.5:rOff(i,sd);
        if(F){[[3.2,0.8],[7.5,1.0],[13,1.15],[21,1.3],[31,1.4],[44,1.5]].forEach((r,ri)=>{if(rnd()<(ri?0.2:0.35))return;const p=sidePt(i+Math.round((rnd()-0.5)*step(3)),sd*(o+r[0]+rnd()*3.5));if(ok(p.x,p.z,o+2.4))add(rnd()<0.5?"cedarA":"cedarB",p.x,p.z,r[1]*(0.8+rnd()*0.45),rnd()<0.5);});}
        else if(S){if(i%(2*step(4.2))<step(4.2)){const p=sidePt(i,sd*(o+3.4+rnd()*1.5));if(ok(p.x,p.z,o+2.6))add(["cherryM","cherryL","cherryS"][(i+sd+9)%3],p.x,p.z,0.85+rnd()*0.35,rnd()<0.5);}
          if(rnd()<0.5){const p=sidePt(i,sd*(o+14+rnd()*22));if(ok(p.x,p.z,o+9))add(rnd()<0.35?"cherryL":(rnd()<0.5?"cedarA":"cedarB"),p.x,p.z,0.9+rnd()*0.4,rnd()<0.5);}}
        else if(V){if(rnd()<(inStands(i)?0.3:0.16)){const p=sidePt(i,sd*(o+4+rnd()*28));if(ok(p.x,p.z,o+3))add(rnd()<0.4?"maple":(rnd()<0.5?"cherryM":"cedarB"),p.x,p.z,0.7+rnd()*0.4,rnd()<0.5);}}
        else if(PZ){if(rnd()<0.2){const p=sidePt(i,sd*(W+64+rnd()*40));if(ok(p.x,p.z,W+50))add(rnd()<0.5?"cedarA":"cedarB",p.x,p.z,0.9+rnd()*0.5,rnd()<0.5);}}
        if(!F&&rnd()<0.34){const p=sidePt(i,sd*(W+78+rnd()*70));if(ok(p.x,p.z,W+66))add(rnd()<0.85?(rnd()<0.5?"cedarA":"cedarB"):"maple",p.x,p.z,1.1+rnd()*0.6,rnd()<0.5);}});}
    for(let k=0;k<900;k++){const a=rnd()*6.283,r=120+rnd()*560,x=X.cx+Math.cos(a)*r,z=X.cz+Math.sin(a)*r;if(nearest(x,z)[1]<W+46||!free(x,z,2))continue;const y=groundAt(x,z);if(y<9&&rnd()<0.8)continue;add(rnd()<0.92?(rnd()<0.5?"cedarA":"cedarB"):"maple",x,z,1.0+rnd()*0.7,rnd()<0.5);}   // the hills wear forest, the flat valley stays open
    if(WD.trees&&!story)gpBillboards(T,scene,WD.trees,BB,new T.Color(X.hazeHex),scene.fog.near,scene.fog.far,X.TINT,X.blob,GP_WORLD.trees);
    else{const cg=new T.ConeGeometry(2.3,13,7).translate(0,7.5,0);IM(cg,new T.MeshLambertMaterial({color:story?0x3b6b33:0x24492b}),fb.cedar,(v,k,m)=>m.setMatrixAt(k,put(v[0],v[1],v[2],0,v[3],v[3],v[3])),true);
      IM(new T.IcosahedronGeometry(3.3,1).translate(0,5.2,0),new T.MeshLambertMaterial({color:0xf3a9c7}),fb.cherry,(v,k,m)=>m.setMatrixAt(k,put(v[0],v[1],v[2],0,v[3],v[3]*0.8,v[3])),true);
      IM(new T.CylinderGeometry(0.2,0.3,3.4,6).translate(0,1.7,0),new T.MeshLambertMaterial({color:0x5a4030}),fb.cherry,(v,k,m)=>m.setMatrixAt(k,put(v[0],v[1],v[2],0,v[3],v[3],v[3])));}
    out.trees=BB.length;}
  // ---- roadside undergrowth: low bushes just behind the rail wherever there is no house, wall or run-off (the near layer that rushes past) ----
  {const bush=[];for(let i=0;i<M;i+=step(5.5)){if(inStands(i)||inZ(i,"village"))continue;[-1,1].forEach(sd=>{if(run(i,sd)||rnd()<0.42)return;const o=rOff(i,sd)+1.6+rnd()*2.6,p=sidePt(i,sd*o);if(nearest(p.x,p.z)[1]<o-0.6||!free(p.x,p.z,0.4))return;bush.push([p.x,groundAt(p.x,p.z),p.z,rnd()*6.28,0.7+rnd()*0.9,rnd()]);});}
    const bg=new T.IcosahedronGeometry(1,1);bg.scale(1.25,0.72,1.0);bg.translate(0,0.45,0);const cols=[0x3d5a2c,0x4a6a33,0x587838,0x34502a,0x6a7f3c];
    IM(bg,new T.MeshLambertMaterial({color:0xffffff,flatShading:true}),bush,(v,k,m)=>{m.setMatrixAt(k,put(v[0],v[1],v[2],v[3],v[4],v[4]*(0.8+v[5]*0.5),v[4]));m.setColorAt(k,lin(cols[k%cols.length]));},true);out.bushes=bush.length;}
  // ---- three rings of far hills beyond the valley: forest green near, blue-grey and pale behind (the haze does the rest) ----
  {let R0=0;C.pts.forEach(p=>{R0=Math.max(R0,Math.hypot(p[0]-X.cx,p[1]-X.cz));});const hg=new T.SphereGeometry(1,14,8,0,Math.PI*2,0,Math.PI/2),hills=[];
    [[200,0x4a6846,20,45,115],[470,0x58746a,18,100,190],[820,0x7a8f94,15,170,310]].forEach((r,ri)=>{for(let k=0;k<r[2];k++){const a=k/r[2]*6.283+rnd()*0.3+ri,d=R0+r[0]+rnd()*120;hills.push([X.cx+Math.cos(a)*d,X.cz+Math.sin(a)*d,190+rnd()*170+ri*70,r[3]+rnd()*(r[4]-r[3]),r[1],rnd()*3]);}});
    const ht2=gpCanvasTex(512,256,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,"#ffffff");g.addColorStop(1,"#b9c2b4");x.fillStyle=g;x.fillRect(0,0,w,h);for(let i=0;i<5200;i++){const px=rnd()*w,py=rnd()*h,r=2+rnd()*5;x.fillStyle=rnd()<0.55?"rgba(30,52,34,.34)":"rgba(196,206,150,.22)";x.beginPath();x.ellipse(px,py,r,r*1.5,0,0,7);x.fill();}for(let i=0;i<26;i++){x.fillStyle="rgba(24,44,30,.16)";x.beginPath();x.ellipse(rnd()*w,rnd()*h,30+rnd()*60,14+rnd()*30,rnd()*3,0,7);x.fill();}},true);ht2.repeat.set(5,1.6);
    const hm=IM(hg,new T.MeshLambertMaterial({color:0xffffff,map:ht2}),hills,(h,k,m)=>{m.setMatrixAt(k,put(h[0],-8,h[1],h[5],h[2],h[3],h[2]*(0.7+((k*7)%5)*0.12)));m.setColorAt(k,lin(h[4]));});if(hm){hm.receiveShadow=false;hm.frustumCulled=false;}}
  // ---- a vermilion torii over the road where the cherry avenue begins ----
  if(X.torii&&Z.sakura){const i=Math.round(Z.sakura[0][0]*M)+step(30),s=samples[wrapI(i)],t=X.torii.clone();t.position.copy(s.pos);t.lookAt(s.pos.clone().add(s.tan));scene.add(t);}
  window.__gp_inaka={paddies:out.paddies||0,houses:out.houses||0,vending:out.vending||0,poles:out.poles||0,trees:out.trees||0};
  return out;}
/* ---------- the clean HUD skin (Realistic look): colours and surfaces only - every size and position stays where the layouts put it ---------- */
function gpFzCss(){if(document.getElementById("gpFzCss"))return;const s=document.createElement("style");s.id="gpFzCss";s.textContent=`
.gp3-wrap.v3.fzh{border-color:rgba(255,255,255,.1)}
.gp3-wrap.v3.fzh .fz-vig{background:radial-gradient(ellipse at 50% 50%,transparent 68%,rgba(0,0,0,.16))}
.gp3-wrap.v3.fzh .fz-tl{text-shadow:0 1px 10px rgba(0,0,0,.55)}
.gp3-wrap.v3.fzh .fz-pos{font-weight:800;letter-spacing:-.02em}
.gp3-wrap.v3.fzh .fz-pos em{color:rgba(255,255,255,.72);font-weight:600}
.gp3-wrap.v3.fzh .fz-lap{background:none;transform:none;border-radius:0;padding:4px 0 0;margin-top:7px;border-top:2px solid #ff8c00;font-weight:700;letter-spacing:.16em}
.gp3-wrap.v3.fzh .fz-time{font-weight:600;font-style:italic;opacity:.92}
.gp3-wrap.v3.fzh .gp3-map{border:0;background:none;border-radius:0;filter:drop-shadow(0 1px 4px rgba(0,0,0,.65))}
.gp3-wrap.v3.fzh .fz-skill .mul{background:#ff8c00}.gp3-wrap.v3.fzh .fz-skill .row{color:rgba(255,255,255,.8);font-weight:700}
.gp3-wrap.v3.fzh .fz-btn{background:rgba(22,24,30,.3);border:1.5px solid rgba(255,255,255,.45);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}
.gp3-wrap.v3.fzh .gp3-msg{background:none;border-radius:0;border-bottom:2px solid #ff8c00;padding:2px 8px 4px;font-weight:800;letter-spacing:.14em;font-size:clamp(13px,1.7vw,19px);text-shadow:0 2px 10px rgba(0,0,0,.75)}
.gp3-wrap.v3.fzh .gp3-count{text-shadow:0 0 26px rgba(255,140,0,.75),0 6px 20px #000}
.gp3-wrap.v3.fzh .gp3-card{background:rgba(18,19,24,.38);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border-left:3px solid #ff8c00;border-radius:3px}
.gp3-wrap.v3.fzh .gp3-card small{color:rgba(255,255,255,.78)}
.gp3-wrap.v3.fzh .race-btn{background:rgba(24,26,32,.26);border:1.5px solid rgba(255,255,255,.55);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border-radius:22px}
.gp3-wrap.v3.fzh .race-btn.on{background:rgba(255,255,255,.9);color:#111}
.gp3-wrap.v3.fzh .fz-pedal i{bottom:0;border-radius:22px;border:1.5px solid rgba(255,255,255,.55);background:rgba(24,26,32,.26);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);box-shadow:none}
.gp3-wrap.v3.fzh .fz-pedal.gas i{border-color:rgba(130,235,160,.9);background:linear-gradient(180deg,rgba(60,200,110,.08),rgba(60,200,110,.30))}
.gp3-wrap.v3.fzh .fz-pedal.brake i{border-color:rgba(255,120,120,.9);background:linear-gradient(180deg,rgba(255,70,70,.08),rgba(255,70,70,.28))}
.gp3-wrap.v3.fzh .fz-pedal::after{display:none}
.gp3-wrap.v3.fzh .fz-pedal b{top:50%;font-weight:800;letter-spacing:.18em;text-shadow:0 1px 8px rgba(0,0,0,.65)}
.gp3-wrap.v3.fzh .fz-pedal.on{transform:scale(.96);filter:none}
.gp3-wrap.v3.fzh .fz-pedal.on i{box-shadow:inset 0 0 0 2px #fff;background:rgba(255,255,255,.34)}
.gp3-wrap.v3.fzh .fz-cam{border:1.5px solid rgba(255,255,255,.55);background:rgba(24,26,32,.3);color:#fff;box-shadow:none;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border-radius:20px}
.gp3-wrap.v3.fzh .fz-cam i{filter:grayscale(1) brightness(1.7)}
.gp3-wrap.v3.fzh .fz-cam b{font-weight:700;letter-spacing:.12em}
.gp3-wrap.v3.fzh .fz-cam:active,.gp3-wrap.v3.fzh .fz-cam.dn{transform:scale(.94);box-shadow:none;background:rgba(255,255,255,.3)}
.gp3-wrap.v3.fzh .fz-boost .bg{stroke:rgba(24,26,32,.42)}
.gp3-wrap.v3.fzh .fz-boost .rg{stroke:#ff8c00}
.gp3-wrap.v3.fzh .fz-boost .core{background:rgba(24,26,32,.34);border:1.5px solid rgba(255,255,255,.55);box-shadow:none;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);opacity:.7}
.gp3-wrap.v3.fzh .fz-boost b{text-shadow:0 1px 6px rgba(0,0,0,.6);letter-spacing:.1em;font-weight:800}
.gp3-wrap.v3.fzh .fz-boost small{color:#ffb14a}
.gp3-wrap.v3.fzh .fz-boost.ready .core{background:linear-gradient(180deg,rgba(255,140,0,.34),rgba(255,90,0,.58));border-color:#ffb14a}
.gp3-wrap.v3.fzh .fz-boost.ready .rg{stroke:#ffb14a}
.gp3-wrap.v3.fzh .fz-boost.on .core{background:linear-gradient(180deg,rgba(150,225,255,.6),rgba(40,150,255,.7));border-color:#bfeaff}
.gp3-wrap.v3.fzh .fz-cue{background:rgba(18,19,24,.5);border:0;border-bottom:3px solid #ff3b30;border-radius:3px;box-shadow:none;color:#fff;-webkit-text-stroke:0;text-shadow:0 2px 8px rgba(0,0,0,.6);font-size:clamp(16px,2.3vw,27px);letter-spacing:.1em;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}
.gp3-wrap.v3.fzh .fz-cue i{-webkit-text-stroke:0;color:#ff8c00}
.gp3-wrap.v3.fzh .fz-nitro{mix-blend-mode:screen}
.gp3-wrap.v3.fzh .fz-air b{color:#fff;-webkit-text-stroke:0;text-shadow:0 2px 12px rgba(0,0,0,.7);font-weight:800;letter-spacing:.1em;font-size:clamp(20px,3vw,36px)}
`;document.head.appendChild(s);}
/* the dial: a thin white rev arc with a short red zone, the gear in a ring, big slanted speed digits - nothing else */
function gpFzTach(x,S,mph,gear,rf){const c=S/2,r=S*0.40,a0=Math.PI*0.75,a1=Math.PI*2.25,ang=v=>a0+(a1-a0)*v,bk=(R3&&R3.bk)||0,v=Math.max(0.01,Math.min(1,rf));
  const g=x.createRadialGradient(c,c,r*0.2,c,c,S*0.5);g.addColorStop(0,"rgba(14,15,20,.58)");g.addColorStop(0.8,"rgba(14,15,20,.42)");g.addColorStop(1,"rgba(14,15,20,0)");x.fillStyle=g;x.beginPath();x.arc(c,c,S*0.5,0,7);x.fill();
  x.lineCap="butt";x.lineWidth=S*0.012;x.strokeStyle="rgba(255,255,255,.26)";x.beginPath();x.arc(c,c,r,a0,ang(0.84));x.stroke();x.strokeStyle="rgba(255,59,48,.9)";x.lineWidth=S*0.02;x.beginPath();x.arc(c,c,r,ang(0.84),a1);x.stroke();
  for(let k=0;k<=32;k++){const q=k/32,a=ang(q),maj=k%4===0,ri=r-(maj?S*0.055:S*0.03),lit=q<=v;x.strokeStyle=q>0.84?(lit?"#ff3b30":"rgba(255,59,48,.5)"):(lit?(bk>0.3?"#ffb14a":"#fff"):"rgba(255,255,255,.34)");x.lineWidth=maj?S*0.012:S*0.007;x.beginPath();x.moveTo(c+Math.cos(a)*ri,c+Math.sin(a)*ri);x.lineTo(c+Math.cos(a)*(r-S*0.004),c+Math.sin(a)*(r-S*0.004));x.stroke();}
  x.fillStyle="rgba(255,255,255,.62)";x.font="600 "+(S*0.05)+"px system-ui";x.textAlign="center";x.textBaseline="middle";for(let k=0;k<=8;k+=2){const a=ang(k/8);x.fillText(String(k),c+Math.cos(a)*r*0.74,c+Math.sin(a)*r*0.74);}
  const a=ang(v)+(v>0.93?Math.sin(performance.now()/28)*0.012:0);x.save();x.translate(c,c);x.rotate(a);x.shadowColor="rgba(0,0,0,.6)";x.shadowBlur=S*0.02;x.fillStyle=bk>0.3?"#ffb14a":"#ff8c00";x.beginPath();x.moveTo(r*0.2,-S*0.008);x.lineTo(r*0.98,-S*0.003);x.lineTo(r*0.98,S*0.003);x.lineTo(r*0.2,S*0.008);x.closePath();x.fill();x.restore();
  x.lineWidth=S*0.008;x.strokeStyle="rgba(255,255,255,.85)";x.beginPath();x.arc(c,c-S*0.085,S*0.075,0,7);x.stroke();x.fillStyle="#fff";x.font="italic 800 "+(S*0.1)+"px system-ui";x.fillText(String(gear),c-S*0.004,c-S*0.08);
  x.shadowColor="rgba(0,0,0,.7)";x.shadowBlur=S*0.03;x.textAlign="right";x.font="italic 800 "+(S*0.235)+"px system-ui";x.fillStyle="#fff";{const tx=String(Math.round(mph)),pad="0".repeat(Math.max(0,3-tx.length)),w=x.measureText(tx).width;x.fillText(tx,c+S*0.36,c+S*0.19);if(pad){x.fillStyle="rgba(255,255,255,.28)";x.shadowBlur=0;x.fillText(pad,c+S*0.36-w,c+S*0.19);}}
  x.shadowBlur=0;x.font="700 "+(S*0.052)+"px system-ui";x.fillStyle="rgba(255,255,255,.75)";x.fillText("MPH",c+S*0.36,c+S*0.335);x.textAlign="center";}
/* ---------- Dakar Desert (job 1109-1629) ----------
   · gpDakarPiste - the road itself: packed sand with tyre ruts that fades into the dunes at both edges (no tarmac, no lines)
   · gpDakarWorld - hard-packed gravel on the piste, the cracked-mud wadi, rock outcrops, marker stakes with pennants, feather flags on every dune crest,
     the bivouac (marquees, dome tents, rally trucks, fuel drums, tyres), a mud-brick village with palms, acacias and scrub, far mesas, a filming helicopter,
     heat shimmer, and sand that streams across the road in gusts. Every repeated prop is one instanced mesh. */
function gpDakarPiste(T,rnd){const t=gpCanvasTex(256,512,(x,w,h)=>{x.clearRect(0,0,w,h);x.fillStyle="#c99a5e";x.fillRect(0,0,w,h);
    for(let i=0;i<9000;i++){const v=150+rnd()*80|0;x.fillStyle="rgba("+v+","+(v-36|0)+","+(v-86|0)+",.5)";x.fillRect(rnd()*w,rnd()*h,2+rnd()*2,2);}
    for(let i=0;i<30;i++){const px=rnd()*w,py=rnd()*h,r=14+rnd()*40,g=x.createRadialGradient(px,py,0,px,py,r);g.addColorStop(0,rnd()<0.5?"rgba(120,80,40,.16)":"rgba(255,225,170,.16)");g.addColorStop(1,"rgba(0,0,0,0)");x.fillStyle=g;x.fillRect(px-r,py-r,2*r,2*r);}
    [[0.26,13,0.34],[0.4,10,0.3],[0.6,10,0.3],[0.74,13,0.34],[0.33,5,0.2],[0.67,5,0.2],[0.5,7,0.14]].forEach(q=>{const g=x.createLinearGradient(w*q[0]-q[1],0,w*q[0]+q[1],0);g.addColorStop(0,"rgba(96,60,28,0)");g.addColorStop(0.5,"rgba(96,60,28,"+q[2]+")");g.addColorStop(1,"rgba(96,60,28,0)");x.fillStyle=g;x.fillRect(w*q[0]-q[1],0,q[1]*2,h);});   // tyre ruts
    x.lineCap="round";for(let i=0;i<34;i++){x.strokeStyle="rgba(92,58,28,"+(0.1+rnd()*0.14).toFixed(2)+")";x.lineWidth=2+rnd()*3;let px=w*(0.18+rnd()*0.64),py=-20;x.beginPath();x.moveTo(px,py);while(py<h+20){px+=(rnd()-0.5)*12;py+=40+rnd()*40;x.lineTo(px,py);}x.stroke();}   // crossing tracks
    for(let i=0;i<60;i++){const v=110+rnd()*60|0;x.fillStyle="rgb("+v+","+(v-22)+","+(v-46)+")";x.beginPath();x.arc(rnd()*w,rnd()*h,0.8+rnd()*1.6,0,7);x.fill();}
    const im=x.getImageData(0,0,w,h),d=im.data;for(let py=0;py<h;py++)for(let px=0;px<w;px++){const e=Math.min(px,w-1-px)/w,wob=0.03*Math.sin(py/h*Math.PI*2*3)+0.02*Math.sin(py/h*Math.PI*2*7+1.3),a=Math.max(0,Math.min(1,(e-0.035-wob)/0.12));d[(py*w+px)*4+3]=Math.round(255*a*a*(3-2*a));}x.putImageData(im,0,0);},true);
  const m=new T.MeshLambertMaterial({map:t,transparent:true,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});return m;}
function gpDakarWorld(D){const {T,scene,C,samples,M,W,ds,nearest,groundAt,dummy,rnd,kap,ribbonR,poMat,IM,put,lin,inZ,Z,sidePt,yawAt,clearOf,wrapI,out}=D;
  const rr=(a,b)=>a+rnd()*(b-a),pick=a=>a[Math.floor(rnd()*a.length)],stp=m=>Math.max(1,Math.round(m/ds));
  const ranges=n=>(Z[n]||[]).map(([a,b])=>{const ia=Math.round(a*M),ib=Math.round(b*M);return[ia,ib<ia?ib+M:ib];});
  const each=(n,m,fn)=>ranges(n).forEach(([ia,ib])=>{for(let i=ia;i<=ib;i+=stp(m))fn(i,ia,ib);});
  // soft sand (the dunes and the riverbed) counts as dirt: a little less grip, the tail steps out, bigger dust
  const z0=out.zoneAt;out.zoneAt=(i,n)=>n==="dirt"?(z0(i,"dunes")||z0(i,"wadi")):z0(i,n);
  const edge=(x,w,h,k)=>{const im=x.getImageData(0,0,w,h),d=im.data;for(let py=0;py<h;py++)for(let px=0;px<w;px++){const e=Math.min(px,w-1-px)/w,wob=0.02*Math.sin(py/h*Math.PI*2*4),a=Math.max(0,Math.min(1,(e-0.02-wob)/k));d[(py*w+px)*4+3]=Math.round(d[(py*w+px)*4+3]*a*a*(3-2*a));}x.putImageData(im,0,0);};
  const over=(tex,o)=>{const m=new T.MeshLambertMaterial(Object.assign({map:tex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2},o||{}));return m;};
  // ---- hard-packed piste (gravel plain, camp, village, rocks): darker stony ground, two polished wheel tracks ----
  const packT=gpCanvasTex(256,256,(x,w,h)=>{x.fillStyle="#a98a66";x.fillRect(0,0,w,h);for(let i=0;i<5200;i++){const v=120+rnd()*90|0;x.fillStyle="rgba("+v+","+(v-20|0)+","+(v-48|0)+",.55)";x.fillRect(rnd()*w,rnd()*h,2+rnd()*2,2);}
    for(let i=0;i<220;i++){const v=118+rnd()*60|0;x.fillStyle="rgb("+v+","+(v-16)+","+(v-36)+")";x.beginPath();x.arc(rnd()*w,rnd()*h,0.6+rnd()*1.1,0,7);x.fill();}
    [[0.3,16],[0.7,16]].forEach(q=>{const g=x.createLinearGradient(w*q[0]-q[1],0,w*q[0]+q[1],0);g.addColorStop(0,"rgba(226,200,160,0)");g.addColorStop(0.5,"rgba(226,200,160,.34)");g.addColorStop(1,"rgba(226,200,160,0)");x.fillStyle=g;x.fillRect(w*q[0]-q[1],0,q[1]*2,h);});edge(x,w,h,0.13);},true);
  const packM=over(packT);["piste","camp","village","rocks"].forEach(n=>ranges(n).forEach(([ia,ib])=>{ribbonR(ia,ib,-W-2.4,W+2.4,packM,0.05,0.05,1/20).renderOrder=-0.9;}));
  // ---- wadi: a wide bed of pale cracked mud with pebbles; the road runs down the middle of it ----
  const mudT=gpCanvasTex(256,256,(x,w,h)=>{x.fillStyle="#dcc9a6";x.fillRect(0,0,w,h);for(let i=0;i<2600;i++){const v=180+rnd()*50|0;x.fillStyle="rgba("+v+","+(v-18|0)+","+(v-50|0)+",.5)";x.fillRect(rnd()*w,rnd()*h,2,2);}
    x.strokeStyle="rgba(120,90,60,.5)";x.lineWidth=1.6;for(let k=0;k<90;k++){let px=rnd()*w,py=rnd()*h;x.beginPath();x.moveTo(px,py);for(let s=0;s<4;s++){px+=(rnd()-0.5)*44;py+=(rnd()-0.5)*44;x.lineTo(px,py);}x.stroke();}edge(x,w,h,0.2);},true);
  const stones=[];ranges("wadi").forEach(([ia,ib])=>{const mm=ribbonR(ia+stp(14),ib-stp(14),-W-14,W+14,over(mudT),0.02,0.02,1/36);mm.renderOrder=-0.95;
    for(let i=ia;i<=ib;i+=2)for(let r=0;r<2;r++){const sd=rnd()<0.5?-1:1,p=sidePt(i,sd*(W+1.5+rnd()*24));stones.push([p.x,groundAt(p.x,p.z),p.z,0.18+rnd()*0.55,rnd()*6.28,pick(["#bfae92","#a8977c","#8f7f68","#cdbda0"])]);}});
  // ---- rocks: dark sandstone outcrops crowd the road in the rocks section, boulders dot the gravel plain and the wadi banks ----
  const rockG=new T.DodecahedronGeometry(1,0),rockM=new T.MeshLambertMaterial({color:0xffffff,flatShading:true}),browns=["#8a6a4a","#7a5a3e","#9b7a55","#6e5238","#a58560","#94704c"];
  const crags=[];each("rocks",5.5,i=>{[-1,1].forEach(sd=>{for(let r=0;r<3;r++){if(r&&rnd()<0.3)continue;const off=W+7+r*8.5+rnd()*4,p=sidePt(i,sd*off);if(!clearOf(p.x,p.z,W+5.5))continue;crags.push([p.x,groundAt(p.x,p.z),p.z,rr(3.5,6.5),rr(4,9)*(1+r*0.5),rr(3.5,6.5),rnd()*6.28,pick(browns)]);}});});
  for(let k=0;k<7;k++){const i=Math.floor(rnd()*M);if(inZ(i,"camp")||inZ(i,"village")||inZ(i,"dunes"))continue;const sd=rnd()<0.5?-1:1,c=sidePt(i,sd*(W+34+rnd()*40));for(let q=0;q<7;q++){const x=c.x+rr(-13,13),z=c.z+rr(-13,13);if(!clearOf(x,z,W+9))continue;crags.push([x,groundAt(x,z),z,rr(3,7),rr(3,10),rr(3,7),rnd()*6.28,pick(browns)]);}}
  IM(rockG,rockM,crags,(w,k,m)=>{m.setMatrixAt(k,put(w[0],w[1]+w[4]*0.36,w[2],w[6],w[3],w[4],w[5]));m.setColorAt(k,lin(w[7]));},{shadow:true});
  const boulders=[];for(let k=0;k<300;k++){const i=Math.floor(rnd()*M);if(inZ(i,"dunes")||inZ(i,"camp"))continue;const sd=rnd()<0.5?-1:1,p=sidePt(i,sd*(W+4+rnd()*55));if(!clearOf(p.x,p.z,W+3.5))continue;boulders.push([p.x,groundAt(p.x,p.z),p.z,rr(0.4,1.9),rnd()*6.28,pick(browns)]);}
  stones.forEach(s=>boulders.push(s));
  IM(rockG,rockM.clone(),boulders,(b,k,m)=>{m.setMatrixAt(k,put(b[0],b[1]+b[3]*0.22,b[2],b[4],b[3],b[3]*0.66,b[3]*1.1));m.setColorAt(k,lin(b[5]));},{shadow:true});
  // ---- far mesas with rock strata, beyond the dune sea ----
  const strataT=gpCanvasTex(64,256,(x,w,h)=>{const cs=["#c58a5c","#b3764a","#d39a6a","#a86a44","#dcae80","#b98058"];let y=0;while(y<h){const t=6+rnd()*26;x.fillStyle=pick(cs);x.fillRect(0,y,w,t);y+=t;}x.fillStyle="rgba(0,0,0,.08)";for(let i=0;i<60;i++)x.fillRect(rnd()*w,rnd()*h,1,8+rnd()*20);},true);
  const far=(x,z)=>{let b=1e12;for(let i=0;i<M;i+=8){const p=samples[i].pos,d=(p.x-x)*(p.x-x)+(p.z-z)*(p.z-z);if(d<b)b=d;}return Math.sqrt(b);};
  const mesas=[];for(let k=0;k<22;k++){const a=k/22*6.283+rnd()*0.2,r=960+rnd()*420,x=D.cx+Math.cos(a)*r,z=D.cz+Math.sin(a)*r;if(far(x,z)<400)continue;mesas.push([x,0,z,rr(70,170),rr(38,74),rnd()*6.28,rr(0.6,1)]);}
  const mg=new T.CylinderGeometry(1,1.2,1,9,1,false);mg.translate(0,0.5,0);IM(mg,new T.MeshLambertMaterial({map:strataT,flatShading:true}),mesas,(q,k,m)=>{m.setMatrixAt(k,put(q[0],q[1]-6,q[2],q[5],q[3],q[4],q[3]*q[6]));},{noRecv:true});
  // ---- course markers: thin stakes with an orange pennant both sides of the piste, feather flags on every crest and at the camp ----
  const stakes=[];for(let i=stp(8);i<M;i+=stp(26)){if(inZ(i,"camp"))continue;[-1,1].forEach(sd=>{const p=sidePt(i,sd*(W+1.5));stakes.push([p.x,groundAt(p.x,p.z),p.z,yawAt(i),sd]);});}
  IM(new T.CylinderGeometry(0.035,0.045,1.9,5).translate(0,0.95,0),new T.MeshLambertMaterial({color:0xe8e2d4}),stakes,(f,k,m)=>{m.setMatrixAt(k,put(f[0],f[1],f[2],0));});
  const penG=new T.BufferGeometry();penG.setAttribute("position",new T.Float32BufferAttribute([0,0,0,0,-0.5,0,0.8,-0.25,0],3));penG.computeVertexNormals();
  const penM=new T.MeshBasicMaterial({color:0xff6a00,side:T.DoubleSide});penM.userData.lin=1;IM(penG,penM,stakes,(f,k,m)=>{m.setMatrixAt(k,put(f[0],f[1]+1.88,f[2],f[3]+(f[4]>0?0.5:Math.PI-0.5)));},{noRecv:true});
  const fthT=gpCanvasTex(64,256,(x,w,h)=>{x.clearRect(0,0,w,h);x.fillStyle="#fff";x.beginPath();x.moveTo(8,h-4);x.lineTo(8,40);x.quadraticCurveTo(10,4,34,6);x.quadraticCurveTo(62,22,56,90);x.quadraticCurveTo(48,190,8,h-4);x.closePath();x.fill();
    x.fillStyle="rgba(0,0,0,.2)";x.fillRect(8,150,60,10);x.fillRect(8,170,60,5);x.fillStyle="rgba(0,0,0,.72)";x.beginPath();x.moveTo(20,96);x.lineTo(38,70);x.lineTo(38,84);x.lineTo(50,84);x.lineTo(50,108);x.lineTo(38,108);x.lineTo(38,122);x.closePath();x.fill();});   // a plain route arrow, no words
  const fth=[],fcol=["#ffb300","#ff1744","#29b6f6","#00e676","#ff6a00"];
  (C.jumps||[]).forEach((J,q)=>{if(J[2])return;const i=Math.round(J[0]/C.lapM*M);[-1,1].forEach(sd=>{[0,-14].forEach((bk,e)=>{const p=sidePt(i+stp(bk),sd*(W+3.4+e*0.8));fth.push([p.x,groundAt(p.x,p.z),p.z,yawAt(i),fcol[(q+e)%fcol.length],1.25]);});});});
  // ---- the bivouac at the start / finish ----
  const marq=[],domes=[],trucks=[],drums=[],tyres=[],crates=[];
  ranges("camp").forEach(([ia,ib])=>{let k=0;for(let i=ia+stp(10);i<ib-stp(8);i+=stp(15),k++){const s0=((i%M)+M)%M,near0=Math.min(s0,M-s0)*ds;
      if(near0<95&&k%2===0)[-1,1].forEach(sd=>{const p=sidePt(i,sd*(W+4.6));fth.push([p.x,groundAt(p.x,p.z),p.z,yawAt(i),fcol[(k+(sd>0?2:0))%fcol.length],1]);});
      const sdT=1,pt=sidePt(i,sdT*(W+11+(k%3)*1.2));if(clearOf(pt.x,pt.z,W+8))trucks.push([pt.x,groundAt(pt.x,pt.z),pt.z,yawAt(i)-sdT*(Math.PI/2)+rr(-0.12,0.12),pick(["#1f5fbf","#f2f2f2","#c8321e","#e0a100","#168a8a","#f2f2f2"]),k%4===3?0.8:1]);
      if(k%2===0){const pm=sidePt(i,-(W+17));if(clearOf(pm.x,pm.z,W+11))marq.push([pm.x,groundAt(pm.x,pm.z),pm.z,yawAt(i)]);}
      for(let q=0;q<3;q++){const pd=sidePt(i+stp(rr(-6,6)),(q%2?1:-1)*(W+28+rnd()*24));if(clearOf(pd.x,pd.z,W+24))domes.push([pd.x,groundAt(pd.x,pd.z),pd.z,rr(1.5,2.3),rnd()*6.28,pick(["#f2f2f2","#ff8c00","#29b6f6","#ffd23f","#e8603c","#7ac74f"])]);}
      if(k%2){const q=sidePt(i,-(W+7+rnd()*2));if(clearOf(q.x,q.z,W+5))for(let e=0;e<3;e++)drums.push([q.x+rr(-1.2,1.2),groundAt(q.x,q.z),q.z+rr(-1.2,1.2),rnd()*6.28,pick(["#c8321e","#1f5fbf","#2e9e57","#e0a100"])]);
        const t=sidePt(i+stp(5),W+6.2);if(clearOf(t.x,t.z,W+5))for(let e=0;e<3;e++)tyres.push([t.x,groundAt(t.x,t.z)+0.18+e*0.36,t.z]);}}});
  IM(new T.CylinderGeometry(0.05,0.06,5,6).translate(0,2.5,0),new T.MeshLambertMaterial({color:0x33363c}),fth,(f,k,m)=>{m.setMatrixAt(k,put(f[0],f[1],f[2],0,1,f[5],1));},{shadow:true});
  IM(new T.PlaneGeometry(1.15,4.2).translate(0.62,0,0),new T.MeshLambertMaterial({map:fthT,color:0xffffff,transparent:true,alphaTest:0.5,side:T.DoubleSide}),fth,(f,k,m)=>{m.setMatrixAt(k,put(f[0],f[1]+2.75*f[5],f[2],f[3]+Math.PI/2,f[5],f[5],f[5]));m.setColorAt(k,lin(f[4]));},{shadow:true,noRecv:true});
  // rally trucks: cab, box body, three axles (plain colours, no names)
  {const B=(w,h,d,x,y,z,c)=>({g:new T.BoxGeometry(w,h,d).translate(x,y,z),c}),wh=(x,z)=>({g:new T.CylinderGeometry(0.62,0.62,0.5,12).rotateZ(Math.PI/2).translate(x,0.62,z),c:{r:0.035,g:0.035,b:0.04}}),wt={r:1,g:1,b:1},gy={r:0.82,g:0.82,b:0.8},dk={r:0.06,g:0.07,b:0.09},gl={r:0.1,g:0.16,b:0.24};
    const tg=gpMerge(T,[B(2.2,0.36,7.2,0,1.12,0,dk),B(2.44,2.0,2.0,0,2.3,2.5,wt),B(2.2,0.78,0.06,0,2.62,3.52,gl),B(0.06,0.7,1.1,1.23,2.66,2.6,gl),B(0.06,0.7,1.1,-1.23,2.66,2.6,gl),B(2.5,2.4,4.6,0,2.52,-1.2,gy),B(2.5,0.26,4.6,0,1.5,-1.2,wt),B(2.5,0.3,0.3,0,1.05,3.62,dk),B(1.9,0.5,0.1,0,3.56,3.3,dk),wh(1.12,2.45),wh(-1.12,2.45),wh(1.12,-0.9),wh(-1.12,-0.9),wh(1.12,-2.45),wh(-1.12,-2.45)]);
    IM(tg,new T.MeshLambertMaterial({color:0xffffff,vertexColors:true}),trucks,(t,k,m)=>{m.setMatrixAt(k,put(t[0],t[1],t[2],t[3],t[5],t[5],t[5]));m.setColorAt(k,lin(t[4]));},{shadow:true});}
  // marquees: a white hall with a pitched roof and an open front
  {const roof=new T.BufferGeometry(),a=5.2,b=3.6,h0=2.9,h1=4.7;roof.setAttribute("position",new T.Float32BufferAttribute([-a,h0,b,a,h0,b,a,h1,0,-a,h0,b,a,h1,0,-a,h1,0, a,h0,-b,-a,h0,-b,-a,h1,0,a,h0,-b,-a,h1,0,a,h1,0, -a,h0,b,-a,h1,0,-a,h0,-b, a,h0,-b,a,h1,0,a,h0,b],3));roof.computeVertexNormals();
    const walls=gpBoxesGeo(T,[[0.12,h0,b*2,-a,h0/2,0],[0.12,h0,b*2,a,h0/2,0],[a*2,h0,0.12,0,h0/2,-b],[0.16,h0,0.16,-a,h0/2,b],[0.16,h0,0.16,a,h0/2,b],[0.16,h0,0.16,0,h0/2,b]]);
    const canv=new T.MeshLambertMaterial({color:0xf3efe6,side:T.DoubleSide});IM(roof,canv,marq,(c,k,m)=>{m.setMatrixAt(k,put(c[0],c[1],c[2],c[3]+Math.PI/2));},{shadow:true});IM(walls,canv,marq,(c,k,m)=>{m.setMatrixAt(k,put(c[0],c[1],c[2],c[3]+Math.PI/2));},{shadow:true});}
  IM(new T.SphereGeometry(1,10,6,0,Math.PI*2,0,Math.PI/2),new T.MeshLambertMaterial({color:0xffffff,flatShading:true}),domes,(t,k,m)=>{m.setMatrixAt(k,put(t[0],t[1]-0.05,t[2],t[4],t[3],t[3]*0.72,t[3]*1.25));m.setColorAt(k,lin(t[5]));});
  IM(new T.CylinderGeometry(0.3,0.3,0.9,10).translate(0,0.45,0),new T.MeshLambertMaterial({color:0xffffff}),drums,(b,k,m)=>{m.setMatrixAt(k,put(b[0],b[1],b[2],b[3]));m.setColorAt(k,lin(b[4]));});
  IM(new T.TorusGeometry(0.42,0.18,6,12).rotateX(Math.PI/2),new T.MeshLambertMaterial({color:0x17171a}),tyres,(b,k,m)=>{m.setMatrixAt(k,put(b[0],b[1],b[2],0));});
  // ---- the village: flat-roofed mud-brick houses, a low wall, date palms ----
  const adobeT=gpCanvasTex(128,128,(x,w,h)=>{x.fillStyle="#fff";x.fillRect(0,0,w,h);for(let i=0;i<900;i++){x.fillStyle=rnd()<0.5?"rgba(90,60,30,.07)":"rgba(255,255,255,.08)";x.fillRect(rnd()*w,rnd()*h,3,2);}x.fillStyle="rgba(60,40,24,.9)";x.fillRect(52,70,24,58);x.fillRect(16,40,16,18);x.fillRect(96,40,16,18);x.fillStyle="rgba(90,60,30,.25)";x.fillRect(0,0,w,7);});
  const houses=[],palms=[];each("village",17,i=>{[-1,1].forEach(sd=>{if(rnd()<0.2)return;const p=sidePt(i,sd*(W+13+rnd()*16));if(!clearOf(p.x,p.z,W+10))return;houses.push([p.x,groundAt(p.x,p.z),p.z,yawAt(i)+(sd>0?-1:1)*Math.PI/2+rr(-0.2,0.2),rr(5,8),rr(3,4.6),rr(5,7),pick(["#c9a070","#b98c5c","#d4ad7c","#c2966a"])]);
      if(rnd()<0.75){const q=sidePt(i+stp(7),sd*(W+7+rnd()*5));if(clearOf(q.x,q.z,W+5.5))palms.push([q.x,groundAt(q.x,q.z),q.z,rr(0.85,1.3),rnd()*6.28]);}});});
  IM(new T.BoxGeometry(1,1,1).translate(0,0.5,0),new T.MeshLambertMaterial({map:adobeT}),houses,(q,k,m)=>{m.setMatrixAt(k,put(q[0],q[1]-0.2,q[2],q[3],q[4],q[5],q[6]));m.setColorAt(k,lin(q[7]));},{shadow:true});
  IM(new T.BoxGeometry(1,1,1).translate(0,0.5,0),new T.MeshLambertMaterial({color:0xffffff}),houses,(q,k,m)=>{m.setMatrixAt(k,put(q[0],q[1]+q[5]-0.2,q[2],q[3],q[4]+0.5,0.5,q[6]+0.5));m.setColorAt(k,lin(q[7]).multiplyScalar(0.86));},{shadow:true});
  ranges("wadi").forEach(([ia,ib])=>{for(let i=ia+stp(30);i<ib;i+=stp(46)){const sd=rnd()<0.5?-1:1,p=sidePt(i,sd*(W+16+rnd()*8));if(clearOf(p.x,p.z,W+9))palms.push([p.x,groundAt(p.x,p.z),p.z,rr(0.8,1.15),rnd()*6.28]);}});
  if(palms.length){const PG=gpPalmGeos(T);IM(PG.trunk,new T.MeshLambertMaterial({color:0x8a7356}),palms,(p,k,m)=>{m.setMatrixAt(k,put(p[0],p[1]-0.1,p[2],p[4],p[3],p[3],p[3]));},{shadow:true});
    IM(PG.crown,new T.MeshLambertMaterial({color:0xffffff,side:T.DoubleSide}),palms,(p,k,m)=>{m.setMatrixAt(k,put(p[0],p[1]-0.1,p[2],p[4],p[3],p[3],p[3]));m.setColorAt(k,lin(["#4f7d2c","#5d8a33","#6a9433","#4a6f2a"][k%4]));},{shadow:true});}
  // ---- acacia thorn trees (flat tops) along the wadi and the plain; dry scrub everywhere, thin in the dunes ----
  const acacia=[];for(let k=0;k<46;k++){const i=Math.floor(rnd()*M);if(inZ(i,"dunes")||inZ(i,"camp"))continue;const sd=rnd()<0.5?-1:1,p=sidePt(i,sd*(W+9+rnd()*(inZ(i,"wadi")?22:60)));if(!clearOf(p.x,p.z,W+7))continue;acacia.push([p.x,groundAt(p.x,p.z),p.z,rr(0.8,1.4),rnd()*6.28]);}
  {const tr=gpMerge(T,[{g:new T.CylinderGeometry(0.14,0.24,2.6,6).translate(0,1.3,0)},{g:new T.CylinderGeometry(0.08,0.13,1.9,5).rotateZ(0.7).translate(-0.6,2.9,0)},{g:new T.CylinderGeometry(0.08,0.13,1.9,5).rotateZ(-0.7).translate(0.6,2.9,0)}]);
    IM(tr,new T.MeshLambertMaterial({color:0x5a4634}),acacia,(c,k,m)=>{m.setMatrixAt(k,put(c[0],c[1]-0.1,c[2],c[4],c[3],c[3],c[3]));},{shadow:true});
    IM(new T.IcosahedronGeometry(1,1).scale(2.7,0.55,2.4).translate(0,3.75,0),new T.MeshLambertMaterial({color:0xffffff,flatShading:true}),acacia,(c,k,m)=>{m.setMatrixAt(k,put(c[0],c[1]-0.1,c[2],c[4],c[3],c[3],c[3]));m.setColorAt(k,lin(["#6f7a3a","#7d8442","#5f6b35"][k%3]));},{shadow:true});}
  const scrub=[];for(let k=0;k<620;k++){const i=Math.floor(rnd()*M),du=inZ(i,"dunes");if(du&&rnd()<0.72)continue;const sd=rnd()<0.5?-1:1,p=sidePt(i,sd*(W+3.2+rnd()*(du?30:50)));if(!clearOf(p.x,p.z,W+3))continue;scrub.push([p.x,groundAt(p.x,p.z),p.z,rr(0.35,1.0),rnd()*6.28,pick(["#8c8448","#9a8a52","#7d7a3e","#a8935a","#6e6a36"])]);}
  IM(new T.IcosahedronGeometry(1,0),new T.MeshLambertMaterial({color:0xffffff,flatShading:true}),scrub,(b,k,m)=>{m.setMatrixAt(k,put(b[0],b[1]+b[3]*0.2,b[2],b[4],b[3]*1.3,b[3]*0.62,b[3]*1.2));m.setColorAt(k,lin(b[5]));});
  // ---- the filming helicopter: it hangs ahead of Prince's car, low over the stage ----
  const heli=new T.Group();{const wt=lin("#f2f2f2"),og=lin("#ff6a00"),dk=lin("#15171b"),P=(g,c)=>({g,c});
    const body=new T.Mesh(gpMerge(T,[P(new T.SphereGeometry(1,12,8).scale(1.25,1.15,2.3),wt),P(new T.SphereGeometry(1,10,6).scale(1.05,0.8,1.2).translate(0,0.05,1.45),dk),P(new T.BoxGeometry(0.34,0.4,4.6).translate(0,0.35,-3.9),og),P(new T.BoxGeometry(0.12,1.5,0.8).translate(0,0.95,-6.0),og),
      P(new T.BoxGeometry(0.12,0.12,3.4).translate(0.95,-1.5,0.2),dk),P(new T.BoxGeometry(0.12,0.12,3.4).translate(-0.95,-1.5,0.2),dk),P(new T.CylinderGeometry(0.12,0.12,0.6,6).translate(0,1.4,0),dk)]),new T.MeshLambertMaterial({vertexColors:true}));body.castShadow=true;heli.add(body);
    const hd=new T.MeshLambertMaterial({color:0x15171b}),rot=new T.Mesh(gpBoxesGeo(T,[[11,0.06,0.42,0,0,0],[0.42,0.06,11,0,0,0]]),hd);rot.position.y=1.72;heli.add(rot);heli.userData.rot=[rot];
    const tr=new T.Mesh(new T.BoxGeometry(0.05,1.9,0.22),hd);tr.position.set(0.22,0.95,-6.0);heli.add(tr);heli.userData.tr=tr;heli.scale.setScalar(1.15);heli.position.set(samples[0].pos.x,samples[0].pos.y+26,samples[0].pos.z);scene.add(heli);}
  // ---- sand streaming across the road in the wind (dune sections), stronger in gusts ----
  const strT=gpCanvasTex(256,256,(x,w,h)=>{x.clearRect(0,0,w,h);x.lineCap="round";for(let i=0;i<34;i++){const x0=w*(0.1+rnd()*0.8),l=50+rnd()*130,y0=rnd()*h,dx=(rnd()-0.5)*36;x.strokeStyle="rgba(255,236,196,"+(0.12+rnd()*0.3).toFixed(2)+")";x.lineWidth=1+rnd()*3;[0,-h,h].forEach(o=>{x.beginPath();x.moveTo(x0,y0+o);x.quadraticCurveTo(x0+dx,y0+o+l/2,x0+dx*0.6,y0+o+l);x.stroke();});}edge(x,w,h,0.2);},true);
  const strM=new T.MeshBasicMaterial({map:strT,transparent:true,opacity:0.3,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3});strM.userData.lin=1;
  ranges("dunes").forEach(([ia,ib])=>{const m=ribbonR(ia,ib,-W-2.4,W+2.4,strM,0.07,0.07,1/26);m.receiveShadow=false;m.renderOrder=-0.8;});
  // ---- heat shimmer: a faint wavy band low on the horizon that follows the camera ----
  const shT=gpCanvasTex(512,64,(x,w,h)=>{x.clearRect(0,0,w,h);for(let i=0;i<46;i++){const y=h*(0.25+rnd()*0.6);x.strokeStyle="rgba(255,236,200,"+(0.06+rnd()*0.12).toFixed(3)+")";x.lineWidth=1+rnd()*2.5;x.beginPath();x.moveTo(0,y);for(let px=0;px<=w;px+=16)x.lineTo(px,y+Math.sin(px*0.05+i)*2.2);x.stroke();}
    const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,"rgba(255,226,180,0)");g.addColorStop(0.55,"rgba(255,226,180,.18)");g.addColorStop(1,"rgba(255,226,180,0)");x.fillStyle=g;x.fillRect(0,0,w,h);},true);
  shT.repeat.set(6,1);const shM=new T.MeshBasicMaterial({map:shT,transparent:true,depthWrite:false,fog:false,side:T.BackSide,blending:T.AdditiveBlending});shM.userData.lin=1;
  const shimmer=new T.Mesh(new T.CylinderGeometry(760,760,50,48,1,true),shM);shimmer.renderOrder=1;shimmer.frustumCulled=false;scene.add(shimmer);
  const G={t:5,on:0,k:0},crests=(C.jumps||[]).filter(J=>!J[2]).map(J=>Math.round(J[0]/C.lapM*M)%M);out.gust=G;
  out.update=(dt,me,cam,waiting)=>{const now=performance.now()/1000;shT.offset.x+=dt*0.004;shT.offset.y=Math.sin(now*1.4)*0.03;shimmer.position.set(cam.x,me.pos.y+12,cam.z);
    if(!waiting){G.t-=dt;if(G.t<=0){G.on=3.4;G.t=10+rnd()*9;}}if(G.on>0)G.on-=dt;const gk=G.on>0?Math.min(1,G.on/0.6,(3.4-G.on)/0.6):0;G.k=gk;
    strT.offset.y-=dt*(0.35+0.9*gk);strM.opacity=0.22+0.5*gk;
    const mi=Math.floor(me.t*M)%M;
    if(typeof R3!=="undefined"&&R3&&R3.dust&&!waiting){for(const ci of crests){let ah=ci-mi;if(ah<-M/2)ah+=M;if(ah>M/2)ah-=M;if(ah*ds<-25||ah*ds>300)continue;   // spindrift: the wind lifts a veil of sand off the next crest, thicker in a gust
        const n=(rnd()<0.55+0.45*gk?1:0)+Math.round(2*gk);for(let q=0;q<n;q++){const s=samples[wrapI(ci+stp(rnd()*5))],o=(rnd()-0.5)*(2*W+12),c=0.7+rnd()*0.08;R3.dust.emit(s.pos.x+s.nor.x*o,s.pos.y+0.2+rnd()*0.5,s.pos.z+s.nor.z*o,s.tan.x*(7+rnd()*5)+s.nor.x*(rnd()-0.5)*3,1.2+rnd()*1.6,s.tan.z*(7+rnd()*5)+s.nor.z*(rnd()-0.5)*3,c,c*0.72,c*0.42,0.8+rnd()*0.5);}}}
    // helicopter: eases to a spot ahead and to one side of the player, nose along the road, rotor spinning
    {const ia=wrapI(mi+stp(95)),s=samples[ia],side=26*Math.sin(now*0.11),tx=s.pos.x+s.nor.x*side,tz=s.pos.z+s.nor.z*side,ty=Math.max(s.pos.y,me.pos.y)+21+2.5*Math.sin(now*0.7),k=Math.min(1,dt*0.9);
      heli.position.x+=(tx-heli.position.x)*k;heli.position.y+=(ty-heli.position.y)*k;heli.position.z+=(tz-heli.position.z)*k;const yw=Math.atan2(s.tan.x,s.tan.z);let dy=yw-heli.rotation.y;while(dy>Math.PI)dy-=Math.PI*2;while(dy<-Math.PI)dy+=Math.PI*2;heli.rotation.y+=dy*Math.min(1,dt*1.2);heli.rotation.x=0.12;
      heli.userData.rot.forEach(r=>{r.rotation.y+=dt*31;});heli.userData.tr.rotation.x+=dt*40;}};
  window.__gp_dakar={trucks:trucks.length,marquees:marq.length,tents:domes.length,stakes:stakes.length,flags:fth.length,houses:houses.length,palms:palms.length,crags:crags.length,boulders:boulders.length,mesas:mesas.length,scrub:scrub.length,acacia:acacia.length,ridges:(C.dnl||[]).length};
}
/* ---------- festival menus (Realistic look): the car turns on a lit stage, the six festival cars sit in a strip under it, tracks are big posters ---------- */
const GP_POSTERS={dakar:1,inaka:1,kawaguchi:1,hakone:1,tokyo:1,city:1,accra:1,coast:1,desert:1,deep:1};
function gpFzMenuCss(){if(document.getElementById("gpFzMenuCss"))return;const s=document.createElement("style");s.id="gpFzMenuCss";s.textContent=`
.fz-shell.fzm{background:linear-gradient(175deg,#1a1d29,#111219 55%,#1d1712);border-color:rgba(255,255,255,.1)}
.fz-shell.fzm .fz-head{padding:16px 8px 10px}
.fzs{position:relative;margin:4px 0 14px;border-radius:22px;overflow:hidden;background:radial-gradient(ellipse at 50% 96%,rgba(255,150,40,.42),transparent 60%),linear-gradient(180deg,#232a3c 0%,#2c2533 46%,#14141a 100%);border:1px solid rgba(255,255,255,.12);box-shadow:0 18px 40px rgba(0,0,0,.45)}
.fzs canvas{display:block;width:100%;height:clamp(220px,40vw,400px);touch-action:pan-y;cursor:grab}
.fzs-info{position:absolute;left:16px;top:12px;right:16px;color:#fff;pointer-events:none;text-shadow:0 2px 12px rgba(0,0,0,.65);display:flex;justify-content:space-between;align-items:flex-start;gap:10px}
.fzs-info em{display:inline-block;font-style:normal;font-weight:800;font-size:12px;letter-spacing:.16em;background:#ff8c00;color:#15151c;padding:2px 8px;border-radius:3px;text-shadow:none}
.fzs-info b{display:block;font-size:clamp(24px,5.2vw,52px);font-weight:900;font-style:italic;text-transform:uppercase;line-height:1;margin-top:6px;letter-spacing:-.01em}
.fzs-info span.k{display:block;margin-top:4px;font-size:clamp(11px,1.5vw,14px);letter-spacing:.16em;text-transform:uppercase;opacity:.82}
.fzs-bars{display:grid;gap:5px;min-width:clamp(104px,20vw,190px);margin-top:2px}
.fzs-bars i{display:flex;align-items:center;justify-content:flex-end;gap:7px;font-style:normal;font-size:clamp(10px,1.3vw,12px);font-weight:700;letter-spacing:.14em;text-transform:uppercase}
.fzs-bars s{display:flex;gap:3px;text-decoration:none}.fzs-bars s u{width:clamp(11px,2.1vw,22px);height:6px;border-radius:2px;background:rgba(255,255,255,.22);text-decoration:none}.fzs-bars s u.on{background:#ff8c00}
.fzs-six{display:flex;gap:9px;padding:10px 12px 12px;overflow-x:auto;scroll-snap-type:x proximity;background:linear-gradient(rgba(0,0,0,0),rgba(0,0,0,.5));-webkit-overflow-scrolling:touch;scrollbar-width:none}
.fzs-six::-webkit-scrollbar{display:none}
.fzs-chip{position:relative;flex:1 0 clamp(96px,15vw,140px);min-height:68px;aspect-ratio:3/2;border-radius:14px;border:2px solid rgba(255,255,255,.22);background:#22242c center/cover no-repeat;scroll-snap-align:center;cursor:pointer;padding:0;overflow:hidden;font:inherit;color:#fff;transition:transform .14s,border-color .14s}
.fzs-chip b{position:absolute;left:0;right:0;bottom:0;padding:12px 6px 5px;font-size:clamp(10px,1.3vw,12px);font-weight:800;font-style:italic;letter-spacing:.06em;text-transform:uppercase;text-align:center;background:linear-gradient(rgba(0,0,0,0),rgba(0,0,0,.78))}
.fzs-chip.on{border-color:#ff8c00;box-shadow:0 0 0 3px rgba(255,140,0,.32);transform:translateY(-2px)}
.fzs-chip:active{transform:scale(.96)}
.fz-shell.fzm .fz-gtabs button.on{background:linear-gradient(90deg,#ff8c00,#ff5a1f);border-color:transparent}
.fz-shell.fzm .fz-car.v4.on{border-color:#ff8c00;box-shadow:0 0 0 3px rgba(255,140,0,.28)}
.fz-shell.fzm .fz-mode button.on,.fz-shell.fzm .fz-tabs button.on{background:linear-gradient(90deg,#ff8c00,#ff5a1f);border-color:transparent}
.fz-shell.fzm .fz-tracks{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px}
.fz-shell.fzm .fz-track{aspect-ratio:2/3;justify-content:flex-end;padding:12px 12px 12px;border-radius:20px;overflow:hidden;border:2px solid rgba(255,255,255,.14);background:#15151c;box-shadow:0 14px 30px rgba(0,0,0,.45);gap:3px}
.fz-shell.fzm .fz-track.gh{border-color:rgba(252,209,22,.7);box-shadow:0 14px 30px rgba(0,0,0,.45)}
.fz-shell.fzm .fz-track .fz-tpic{position:absolute;inset:0;aspect-ratio:auto;border-radius:0;background:#1b1d26}
.fz-shell.fzm .fz-track .fz-tpic::after{content:"";position:absolute;left:0;right:0;bottom:0;height:52%;background:linear-gradient(rgba(12,12,18,0),rgba(12,12,18,.9) 58%,rgba(12,12,18,.97))}
.fz-shell.fzm .fz-track .fz-tpic canvas{right:8px;bottom:auto;top:25%;width:26%;z-index:1;opacity:.9}
.fz-shell.fzm .fz-track .fz-tpic .fz-tag{top:27%;left:10px}.fz-shell.fzm .fz-track .fz-tpic .fz-gh{top:auto;bottom:calc(52% + 4px);left:10px;right:auto}
.fz-shell.fzm .fz-track>b,.fz-shell.fzm .fz-track>.fz-trow,.fz-shell.fzm .fz-track>small{position:relative;z-index:2;text-shadow:0 2px 8px rgba(0,0,0,.7)}
.fz-shell.fzm .fz-track>b{font-size:clamp(17px,2.1vw,23px)}
.fz-shell.fzm .fz-track>small{color:rgba(255,255,255,.8)}
.fz-shell.fzm .fz-track:hover{border-color:#ff8c00;transform:translateY(-3px)}
@media (max-width:640px){.fz-shell.fzm .fz-tracks{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:12px;margin:0 -12px;padding:4px 14% 14px;-webkit-overflow-scrolling:touch;scrollbar-width:none}.fz-shell.fzm .fz-tracks::-webkit-scrollbar{display:none}.fz-shell.fzm .fz-track{flex:0 0 72%;scroll-snap-align:center}}
@media (prefers-reduced-motion:reduce){.fzs-chip,.fz-shell.fzm .fz-track{transition:none}}
`;document.head.appendChild(s);}
function gpFzStageHtml(){if(gpStory())return"";gpFzMenuCss();const sel=gpCar().id;
  return'<div class="fzs" id="fzStage"><canvas id="fzTurn" width="640" height="360" role="img" aria-label="Your car on the festival turntable"></canvas><div class="fzs-info" id="fzsInfo"></div>'
   +'<div class="fzs-six" role="list" aria-label="Festival cars">'+GP_CARS.filter(c=>GP_MESHY.has(c.id)).map(c=>'<button class="fzs-chip'+(c.id===sel?" on":"")+'" role="listitem" data-chip="'+c.id+'" style="background-image:url(assets/cars/cards/'+c.id+'.webp)" onclick="gpPickGrp(\''+(c.grp||"racers")+'\');gpPickCar(\''+c.id+'\')" aria-label="'+esc(c.n)+'"><b>'+esc(c.n)+'</b></button>').join("")+'</div></div>';}
function gpFzStageSync(){const e=$("fzsInfo");if(!e)return;const c=gpCar(),bar=(k,v)=>'<i>'+k+'<s>'+[1,2,3,4,5].map(q=>'<u class="'+(q<=v?"on":"")+'"></u>').join("")+'</s></i>';
  e.innerHTML='<div><em>'+esc(c.cls||"A")+' · '+(c.pi||800)+'</em><b>'+esc(c.n)+'</b><span class="k">'+esc(c.kind||c.type)+'</span></div><div class="fzs-bars">'+bar("Speed",c.speed)+bar("Grip",c.grip||c.handle)+bar("Accel",c.accel)+'</div>';
  document.querySelectorAll(".fzs-chip").forEach(b=>b.classList.toggle("on",b.dataset.chip===c.id));gpFzTurn();}
/* the turntable: its own small renderer; drag to spin; stops by itself when the screen changes */
function gpFzTurnStop(){const S=window._gpTurn;if(!S)return;window._gpTurn=null;try{cancelAnimationFrame(S.raf);S.scene.traverse(o=>{if(o.geometry)o.geometry.dispose();});if(S.env)S.env.dispose();S.r.dispose();S.r.forceContextLoss();}catch(e){}}
function gpFzTurn(){const cv=$("fzTurn");if(!cv||!window.THREE)return;const T=THREE;let S=window._gpTurn;
  if(S&&S.cv!==cv){gpFzTurnStop();S=null;}
  if(!S){try{const r=new T.WebGLRenderer({canvas:cv,antialias:true,alpha:true});r.setPixelRatio(Math.min(window.devicePixelRatio||1,2));if(T.sRGBEncoding)r.outputEncoding=T.sRGBEncoding;r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=0.96;r.shadowMap.enabled=true;r.shadowMap.type=T.PCFSoftShadowMap;
      const scene=new T.Scene();scene.add(new T.HemisphereLight(0xdfe6f2,0x3a2c20,0.55));
      const key=new T.DirectionalLight(0xffe2b8,1.3);key.position.set(5,7,4);key.castShadow=true;key.shadow.mapSize.set(1024,1024);const sc=key.shadow.camera;sc.left=-5;sc.right=5;sc.top=5;sc.bottom=-5;sc.near=1;sc.far=24;key.shadow.bias=-0.0005;scene.add(key);
      const rim=new T.DirectionalLight(0xff9440,1.1);rim.position.set(-6,3,-6);scene.add(rim);const fill=new T.DirectionalLight(0x9db8ff,0.35);fill.position.set(-4,2,6);scene.add(fill);
      let env=null;try{const pm=new T.PMREMGenerator(r);const eq=gpCanvasTex(256,128,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,"#56709c");g.addColorStop(0.36,"#c9d3de");g.addColorStop(0.5,"#f6dcae");g.addColorStop(0.53,"#3a3028");g.addColorStop(1,"#141318");x.fillStyle=g;x.fillRect(0,0,w,h);
          if(gpReal()){x.fillStyle="rgba(255,246,228,.85)";x.fillRect(0,h*0.455,w,h*0.04);x.fillStyle="rgba(14,12,12,.6)";x.fillRect(0,h*0.5,w,h*0.045);}
          [[40,34,60,10],[150,26,80,8],[215,40,36,7]].forEach(q=>{x.fillStyle="rgba(255,255,255,.9)";x.fillRect(q[0],q[1],q[2],q[3]);});const sg=x.createRadialGradient(190,60,0,190,60,34);sg.addColorStop(0,"rgba(255,225,170,1)");sg.addColorStop(1,"rgba(255,200,120,0)");x.fillStyle=sg;x.fillRect(0,0,w,h);});eq.mapping=T.EquirectangularReflectionMapping;env=pm.fromEquirectangular(eq);pm.dispose();eq.dispose();scene.environment=env.texture;}catch(e){}
      const spin=new T.Group();scene.add(spin);
      const deck=new T.Mesh(new T.CylinderGeometry(3.25,3.4,0.2,72),new T.MeshStandardMaterial({color:0x0c0d11,roughness:0.5,metalness:0.2,envMapIntensity:0.35}));deck.position.y=-0.1;deck.receiveShadow=true;spin.add(deck);
      const marks=new T.Mesh(new T.RingGeometry(2.72,2.8,72,1),new T.MeshBasicMaterial({color:0x4a4d58}));marks.rotation.x=-Math.PI/2;marks.position.y=0.004;spin.add(marks);
      for(let k=0;k<12;k++){const t=new T.Mesh(new T.PlaneGeometry(0.06,0.34),new T.MeshBasicMaterial({color:0x6a6d78}));t.rotation.x=-Math.PI/2;t.rotation.z=k*Math.PI/6;t.position.set(Math.sin(k*Math.PI/6)*3.0,0.005,Math.cos(k*Math.PI/6)*3.0);spin.add(t);}
      const ringM=new T.MeshBasicMaterial({color:0xff8c00});ringM.toneMapped=false;const ring=new T.Mesh(new T.TorusGeometry(3.42,0.035,8,96),ringM);ring.rotation.x=Math.PI/2;ring.position.y=-0.03;scene.add(ring);
      const base=new T.Mesh(new T.CylinderGeometry(3.7,3.9,0.16,72),new T.MeshStandardMaterial({color:0x101116,roughness:0.5,metalness:0.5}));base.position.y=-0.28;scene.add(base);
      const cam=new T.PerspectiveCamera(30,16/9,0.1,80);
      S=window._gpTurn={r,scene,cam,cv,spin,env,shared:gpCarShared(T),cur:null,id:null,last:performance.now(),w:0,h:0,drag:null,vel:0.42};
      cv.addEventListener("pointerdown",ev=>{S.drag={x:ev.clientX};try{cv.setPointerCapture(ev.pointerId);}catch(e){}});cv.addEventListener("pointermove",ev=>{if(!S.drag)return;const dx=ev.clientX-S.drag.x;S.drag.x=ev.clientX;spin.rotation.y+=dx*0.012;S.vel=Math.max(-3,Math.min(3,dx*0.6));});
      ["pointerup","pointercancel","lostpointercapture"].forEach(t=>cv.addEventListener(t,()=>{S.drag=null;}));
      const loop=now=>{if(window._gpTurn!==S)return;if(!cv.isConnected){gpFzTurnStop();return;}const dt=Math.min(0.05,(now-S.last)/1000);S.last=now;const w=cv.clientWidth,h=cv.clientHeight;
        if(w&&h&&(w!==S.w||h!==S.h)){S.w=w;S.h=h;r.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();const d=cam.aspect<1.25?11.6:(cam.aspect<1.7?9.6:8.8);cam.position.set(d*0.62,d*0.25,d*0.74);cam.lookAt(0,0.62,0);}
        if(!S.drag){S.vel+=(0.42-S.vel)*Math.min(1,dt*1.5);spin.rotation.y+=S.vel*dt;}r.render(scene,cam);S.frames=(S.frames||0)+1;S.raf=requestAnimationFrame(loop);};S.raf=requestAnimationFrame(loop);}catch(e){window._gpTurn=null;return;}}
  const car=gpCar(),id=car.id,key=id+"|"+gpPaint();if(S.id===key)return;S.id=key;
  const show=()=>{if(window._gpTurn!==S||S.id!==key)return;try{if(S.cur){S.spin.remove(S.cur.g);}const src=(window._gpGlb||{})[id];const m=(GP_GLB[id]&&src)?gpBuildGlbCar(T,car,src,gpGlbPaintFor(car,true),S.shared):gpBuildCar(T,car,gpPaint(),S.shared);
      m.g.traverse(o=>{if(o.isMesh){o.castShadow=true;}});m.g.position.set(0,0,0);m.g.rotation.set(0,0,0);S.spin.add(m.g);S.cur=m;S.car=id;S.built=(GP_GLB[id]&&src)?"glb":"drawn";}catch(e){}};
  if(GP_GLB[id]&&!(window._gpGlb||{})[id])gpLoadGlb([id]).then(show,show);else show();}
/* ---------- baked lighting (job 1112-0016-43fd, Realistic + Cartoon looks; Storybook and Coral Deep keep their own path) ----------
   The world is generated at race start, so "baking" happens once there, not in Blender:
   - the sun's shadow map is drawn ONCE for the whole track (WHOLE mode, when a 4096/2048 map still gives <= 0.55 m texels), or for long
     tracks re-drawn only after the car has travelled 18 m (FOLLOW mode, ~2-4 times a second instead of every frame);
   - cars and anything that moves stop casting into it (cars carry their Blender-baked ground shadow instead). Movers are also found
     automatically: every caster's matrix is compared after the race starts; whatever moved stops casting and the map is redrawn once;
   - props get a baked "darker at the base" ambient term in their vertex colours, and one instanced draw of soft contact shadows. */
function gpBakeOn(){return !gpStory()&&!(R3&&R3.C&&R3.C.deep)&&!window.__gpNoBake;}
function gpBakeInit(){const R=R3;if(!R||!gpBakeOn())return;const T=R.T,rd=R.renderer,sun=R.sun,t0=performance.now();
  R.bake={mode:"whole",n:0,c:new T.Vector3(),watch:[],t:0};
  R.karts.forEach(k=>k.g.traverse(o=>{o.castShadow=false;}));if(R.traffic&&R.traffic.types)Object.values(R.traffic.types).forEach(ty=>["paint","glass","det","glow"].forEach(q=>{if(ty[q])ty[q].castShadow=false;}));
  // light-space box of the whole road (+80 m)
  const d=R.sunDir.clone().negate().normalize(),up=Math.abs(d.y)>0.99?new T.Vector3(0,0,1):new T.Vector3(0,1,0),rx=new T.Vector3().crossVectors(d,up).normalize(),ux=new T.Vector3().crossVectors(rx,d).normalize();
  let a0=1e9,a1=-1e9,b0=1e9,b1=-1e9,z0=1e9,z1=-1e9,cx=0,cy=0,cz=0;R.samples.forEach(s=>{const p=s.pos;cx+=p.x;cy+=p.y;cz+=p.z;const a=p.dot(rx),b=p.dot(ux),z=p.dot(d);a0=Math.min(a0,a);a1=Math.max(a1,a);b0=Math.min(b0,b);b1=Math.max(b1,b);z0=Math.min(z0,z);z1=Math.max(z1,z);});
  const n=R.samples.length,ctr=new T.Vector3(cx/n,cy/n,cz/n),M=80;a0-=M;a1+=M;b0-=M+30;b1+=M+30;
  const big=rd.capabilities.maxTextureSize>=4096&&Math.min(innerWidth,innerHeight)>=520&&!(navigator.maxTouchPoints>1),MAP=big?4096:2048,span=Math.max(a1-a0,b1-b0),texel=span/MAP;
  R.bake.texel=+texel.toFixed(3);
  if(texel<=0.55&&!window.__gpBakeFollow){
    const ca=ctr.dot(rx),cb=ctr.dot(ux),mid=new T.Vector3().addScaledVector(rx,(a0+a1)/2-ca).addScaledVector(ux,(b0+b1)/2-cb).add(ctr);
    sun.position.copy(mid).addScaledVector(d,-1500);sun.target.position.copy(mid);sun.target.updateMatrixWorld();
    const sc=sun.shadow.camera,hw=(a1-a0)/2,hh=(b1-b0)/2;sc.left=-hw;sc.right=hw;sc.top=hh;sc.bottom=-hh;const zc=mid.dot(d);sc.near=Math.max(1,1500+(z0-zc)-300);sc.far=1500+(z1-zc)+300;sc.updateProjectionMatrix();
    if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null;}sun.shadow.mapSize.set(MAP,MAP);sun.shadow.bias=-0.0008;if("normalBias" in sun.shadow)sun.shadow.normalBias=0.25;sun.shadow.radius=3;
  }else{R.bake.mode="follow";R.bake.c.set(1e9,0,0);sun.shadow.bias=-0.0005;}
  R.bake.rx=rx;R.bake.ux=ux;
  rd.shadowMap.autoUpdate=false;rd.shadowMap.needsUpdate=true;
  gpBakeAO(R);gpBakeDecals(R);
  const hemi=R.scene.children.find(o=>o.isHemisphereLight);if(hemi)hemi.intensity*=1.09;   // the baked base shade takes a little light away; give it back as sky fill
  R.bake.ms=Math.round(performance.now()-t0);
  // movers: snapshot every caster now, compare once the race has run (anything that moved stops casting, the map is redrawn)
  R.scene.traverse(o=>{if(o.castShadow&&(o.isMesh||o.isInstancedMesh)){o.updateMatrixWorld(true);R.bake.watch.push([o,o.matrixWorld.elements.slice(),o.isInstancedMesh?o.instanceMatrix.version:0]);}});
  if(window.__gp)window.__gp.bake=R.bake.mode+" "+R.bake.texel+"m "+R.bake.ms+"ms";}
/* per frame (gpRender): FOLLOW mode re-centres the sun box only after 18 m (texel-snapped), consumes redraw requests, checks movers twice */
function gpBakeFrame(me){const R=R3,B=R.bake,rd=R.renderer;if(!B)return false;B.t++;
  if((B.t===90||B.t===600)&&B.watch.length){let moved=0;B.watch=B.watch.filter(w=>{const o=w[0];o.updateMatrixWorld(true);const e=o.matrixWorld.elements,mv=e.some((v,i)=>Math.abs(v-w[1][i])>1e-4)||(o.isInstancedMesh&&o.instanceMatrix.version!==w[2]);if(mv){o.castShadow=false;moved++;return false;}return true;});if(moved){B.movers=(B.movers||0)+moved;B.dirty=true;}}
  if(B.mode==="follow"){const gy=me.jet&&me.ry!=null?me.ry:me.pos.y,dx=me.pos.x-B.c.x,dz=me.pos.z-B.c.z,dy=gy-B.c.y;
    if(dx*dx+dz*dz+dy*dy>18*18){const t=(R.sun.shadow.camera.right-R.sun.shadow.camera.left)/R.sun.shadow.mapSize.x,c=new R.T.Vector3(me.pos.x,gy,me.pos.z),a=c.dot(B.rx),b=c.dot(B.ux);
      c.addScaledVector(B.rx,-(a-Math.round(a/t)*t)).addScaledVector(B.ux,-(b-Math.round(b/t)*t));B.c.copy(c);R.sun.position.copy(c).add(R.sunOff);R.sun.target.position.copy(c);R.sun.target.updateMatrixWorld();B.dirty=true;}}
  if(B.dirty&&R.sun.castShadow){rd.shadowMap.needsUpdate=true;B.n++;B.dirty=false;}
  return true;}
/* baked ambient: props darker at their base (0.72 -> 1.0 over the lower 35% of their height), in vertex colours, once per geometry.
   Only small props (under 60 m across, over 1 m tall); road, terrain and walls are built in world space and are left alone. A material is
   only switched to vertex colours when EVERY mesh using it got colours, so nothing can turn black. */
function gpBakeAO(R){const T=R.T,byMat=new Map(),skip=new Set();R.karts.forEach(k=>k.g.traverse(o=>skip.add(o)));
  R.scene.traverse(o=>{if(!(o.isMesh||o.isInstancedMesh)||skip.has(o)||!o.geometry||!o.geometry.attributes||!o.geometry.attributes.position)return;const m=o.material;if(Array.isArray(m)||!m)return;
    if(!(m.isMeshLambertMaterial||(m.isMeshStandardMaterial&&!m.userData.vcOf)))return;if(!byMat.has(m))byMat.set(m,[]);byMat.get(m).push(o);});
  let done=0;const geoOK=new Map();
  const fit=g=>{if(geoOK.has(g))return geoOK.get(g);if(!g.boundingBox)g.computeBoundingBox();const b=g.boundingBox,h=b.max.y-b.min.y,w=Math.max(b.max.x-b.min.x,b.max.z-b.min.z);const ok=h>1&&w<60&&g.attributes.position.count<20000;geoOK.set(g,ok);return ok;};
  byMat.forEach((list,m)=>{if(!list.every(o=>fit(o.geometry)))return;if(m.vertexColors&&!list.every(o=>o.geometry.attributes.color))return;
    list.forEach(o=>{const g=o.geometry;if(g.userData.ao)return;g.userData.ao=1;const P=g.attributes.position,b=g.boundingBox,h=b.max.y-b.min.y,n=P.count;let C=g.attributes.color;
      if(!C){C=new T.BufferAttribute(new Float32Array(n*3).fill(1),3);g.setAttribute("color",C);}
      const k=C.normalized&&C.array instanceof Uint8Array?255:1;for(let i=0;i<n;i++){const u=Math.max(0,Math.min(1,(P.getY(i)-b.min.y)/(h*0.35))),f=0.72+0.28*u*u*(3-2*u);C.setXYZ(i,C.getX(i)*f,C.getY(i)*f,C.getZ(i)*f);}C.needsUpdate=true;done++;
      if(k===255){}});
    if(!m.vertexColors){m.vertexColors=true;m.needsUpdate=true;}});
  R.bake.ao=done;}
/* soft contact shadows under every instanced prop near the road: ONE instanced draw */
function gpBakeDecals(R){const T=R.T,pts=[],mx=new T.Matrix4(),p=new T.Vector3(),q=new T.Quaternion(),s=new T.Vector3(),S=R.samples,step=Math.max(1,Math.round(S.length/240));
  const near=(x,z)=>{for(let i=0;i<S.length;i+=step){const a=S[i].pos,dx=a.x-x,dz=a.z-z;if(dx*dx+dz*dz<62*62)return true;}return false;};
  R.scene.traverse(o=>{if(!o.isInstancedMesh||!o.castShadow||!o.geometry)return;const g=o.geometry;if(!g.boundingBox)g.computeBoundingBox();const b=g.boundingBox,h=b.max.y-b.min.y,w=Math.max(b.max.x-b.min.x,b.max.z-b.min.z);if(h<1.2||w>40)return;
    o.updateMatrixWorld(true);for(let i=0;i<o.count&&pts.length<1600;i++){o.getMatrixAt(i,mx);mx.premultiply(o.matrixWorld);mx.decompose(p,q,s);if(s.x<0.05)continue;if(!near(p.x,p.z))continue;pts.push([p.x,p.y+b.min.y*s.y+0.04,p.z,Math.max(0.6,w*0.5*Math.max(s.x,s.z)*1.25)]);}});
  if(!pts.length)return;const m=new T.MeshBasicMaterial({map:gpSoftDot(),color:0x000000,transparent:true,opacity:0.42,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});m.userData.lin=1;
  const im=new T.InstancedMesh(new T.PlaneGeometry(2,2).rotateX(-Math.PI/2),m,pts.length),D=new T.Object3D();pts.forEach((a,i)=>{D.position.set(a[0],a[1],a[2]);D.scale.set(a[3],1,a[3]);D.updateMatrix();im.setMatrixAt(i,D.matrix);});
  im.frustumCulled=false;im.renderOrder=1;im.userData.bakeDecal=1;R.scene.add(im);R.bake.decals=pts.length;R.bake.decalMesh=im;}
/* ---------- Cartoon look (job 1112-0016-43fd; look id "toon"; inspo/LOOK_SPEC.md) ----------
   Cel shading is patched INTO the materials the game already uses (Lambert, Standard, Physical) rather than swapping them, so every
   material the game animates (brake lights, start lights, screens, paint upgrades) keeps working. The light reaching a pixel is split
   into 3 bands (shadow 0.45 / mid 0.75 / lit 1.0, soft 0.04 edges) relative to the scene's full sun+sky level; the dark band leans
   lavender. The Blender-baked vertex shade stays underneath as tone. Shiny reflections are toned down (cartoon, never photoreal).
   Cars get a deep-ink inverted-hull outline (one merged hull per body / per wheel, ~2-3 px wide on screen at any distance);
   the world gets a 1-2 px ink edge inside the existing full-screen pass (no extra pass). */
const GP_TOON={bands:[0.45,0.75,1.0],cut:[0.42,0.74],edge:0.04,ink:"#1a1a22",tint:[0.86,0.87,1.08]};
window._gpToonRef=window._gpToonRef||{value:2.4};
function gpToonPatch(m){if(!m||m.userData.toonP||!(m.isMeshLambertMaterial||m.isMeshStandardMaterial||m.isMeshToonMaterial||m.isMeshPhongMaterial))return m;m.userData.toonP=1;
  const ob=m.onBeforeCompile,ok=m.customProgramCacheKey;
  m.onBeforeCompile=function(sh,r){if(ob)ob.call(this,sh,r);sh.uniforms.uToonRef=window._gpToonRef;
    const B=GP_TOON.bands,C=GP_TOON.cut,e=GP_TOON.edge.toFixed(3),f=v=>v.toFixed(3),tn=GP_TOON.tint.map(f).join(",");
    const code="\n{float dl=max(dot(diffuseColor.rgb,vec3(0.299,0.587,0.114)),0.003);vec3 tot=reflectedLight.directDiffuse+reflectedLight.indirectDiffuse;float q=dot(tot,vec3(0.299,0.587,0.114))/dl/uToonRef;"
      +"float lv="+f(B[0])+"+"+f(B[1]-B[0])+"*smoothstep("+f(C[0]-0.02)+","+f(C[0]+0.02)+",q)+"+f(B[2]-B[1])+"*smoothstep("+f(C[1]-0.02)+","+f(C[1]+0.02)+",q);"
      +"float k=lv/max(q,0.02);reflectedLight.directDiffuse*=k;reflectedLight.indirectDiffuse*=k;vec3 tt=mix(vec3(1.0),vec3("+tn+"),clamp((0.8-lv)*1.6,0.0,1.0));reflectedLight.directDiffuse*=tt;reflectedLight.indirectDiffuse*=tt;\n"
      +"#if defined(STANDARD)\nreflectedLight.directSpecular*=0.55;reflectedLight.indirectSpecular*=0.6;\n#endif\n}\n";
    if(sh.fragmentShader.indexOf("#include <aomap_fragment>")<0){if(!window._gpToonWarn){window._gpToonWarn=1;console.warn("toon: shader chunk not found, left unbanded");}return;}
    sh.fragmentShader="uniform float uToonRef;\n"+sh.fragmentShader.replace("#include <aomap_fragment>","#include <aomap_fragment>"+code);};
  m.customProgramCacheKey=function(){return "toon|"+(ok?ok.call(this):"");};m.needsUpdate=true;return m;}
/* once per race after the world + cars are built (Cartoon look only) */
function gpToonInit(){const R=R3;if(!R||!gpToon()||R.C.deep&&false)return;const T=R.T,sun=R.sun,hemi=R.scene.children.find(o=>o.isHemisphereLight);
  const lum=c=>c.r*0.299+c.g*0.587+c.b*0.114;window._gpToonRef.value=Math.max(0.4,lum(sun.color)*sun.intensity*Math.max(0.3,Math.min(1,R.sunDir.y))*1.05+(hemi?lum(hemi.color)*hemi.intensity:0.6));   // "fully lit" = flat ground in the sun (a low golden-hour sun lights the road at a grazing angle)
  let n=0;R.scene.traverse(o=>{if(!o.isMesh&&!o.isInstancedMesh)return;(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{if(m&&!m.userData.toonP&&gpToonPatch(m)&&m.userData.toonP)n++;});
    const fw=o.material&&o.material.userData&&o.material.userData.fzWet;if(fw&&!o.material.userData.toonRoad){fw.value=0;o.material.userData.toonRoad=1;o.material.color.multiplyScalar(1.7);}});   // no wet sheen on a cartoon road: a lighter flat asphalt instead (mockup A)
  // a touch more colour in the world (HSL saturation x1.12), once per material
  const hsl={};R.scene.traverse(o=>{if(!(o.isMesh||o.isInstancedMesh)||R.karts.some(k=>k.g===o))return;const m=o.material;if(!m||Array.isArray(m)||!m.color||m.userData.toonSat||m.isShaderMaterial)return;m.userData.toonSat=1;m.color.getHSL(hsl);m.color.setHSL(hsl.h,Math.min(1,hsl.s*1.12),hsl.l);});
  R.karts.forEach(k=>gpToonHull(k));if(window._gpHullMat&&R.fz){const H=R.fz.mat.uniforms.res.value.y;window._gpHullMat.uniforms.uResY.value=H;window._gpHullMat.uniforms.uPx.value=Math.max(2.2,Math.min(5,H/330));}
  R.toon={mats:n,hulls:R.karts.reduce((a,k)=>a+((k.hulls&&k.hulls.length)||0),0)};
  if(R.fz&&R.fz.mat.uniforms.uInk){const U=R.fz.mat.uniforms;U.uInk.value=1;U.uSat.value+=0.08;U.uCon.value=0.18;U.uVig.value=0.12;U.uGrain.value=0;}
  if(window.__gp)window.__gp.toon=R.toon;}
/* smooth (position-welded) normals for the hull push, so hard edges don't split the outline */
function gpHullNormals(T,g){const P=g.attributes.position,n=P.count,idx=g.index,acc=new Map(),key=i=>Math.round(P.getX(i)*1e3)+"|"+Math.round(P.getY(i)*1e3)+"|"+Math.round(P.getZ(i)*1e3);
  const keys=new Array(n);for(let i=0;i<n;i++){keys[i]=key(i);if(!acc.has(keys[i]))acc.set(keys[i],[0,0,0]);}
  const a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3(),fnm=new T.Vector3(),tri=idx?idx.count/3:n/3;
  for(let t=0;t<tri;t++){const i0=idx?idx.getX(t*3):t*3,i1=idx?idx.getX(t*3+1):t*3+1,i2=idx?idx.getX(t*3+2):t*3+2;a.fromBufferAttribute(P,i0);b.fromBufferAttribute(P,i1);c.fromBufferAttribute(P,i2);fnm.subVectors(c,b).cross(a.clone().sub(b));
    [i0,i1,i2].forEach(i=>{const s=acc.get(keys[i]);s[0]+=fnm.x;s[1]+=fnm.y;s[2]+=fnm.z;});}
  const out=new Float32Array(n*3);for(let i=0;i<n;i++){const s=acc.get(keys[i]),l=Math.hypot(s[0],s[1],s[2])||1;out[i*3]=s[0]/l;out[i*3+1]=s[1]/l;out[i*3+2]=s[2]/l;}
  g.setAttribute("hullN",new T.BufferAttribute(out,3));return g;}
function gpHullMat(T){if(window._gpHullMat&&window._gpHullMat.__T===T)return window._gpHullMat;
  const m=new T.ShaderMaterial({side:T.BackSide,fog:true,uniforms:T.UniformsUtils.merge([T.UniformsLib.fog,{uInk:{value:new T.Color(GP_TOON.ink).convertSRGBToLinear()},uPx:{value:2.2},uResY:{value:800}}]),
    vertexShader:"attribute vec3 hullN;uniform float uPx;uniform float uResY;\n#include <fog_pars_vertex>\nvoid main(){vec4 mv0=modelViewMatrix*vec4(position,1.0);float sc=length(modelMatrix[0].xyz);float w=clamp(uPx*(-mv0.z)*2.0/(uResY*projectionMatrix[1][1]),0.008,0.06)/max(sc,0.001);vec4 mvPosition=modelViewMatrix*vec4(position+hullN*w,1.0);gl_Position=projectionMatrix*mvPosition;\n#include <fog_vertex>\n}",
    fragmentShader:"uniform vec3 uInk;\n#include <fog_pars_fragment>\nvoid main(){gl_FragColor=vec4(uInk,1.0);\n#include <fog_fragment>\n}"});
  m.userData.lin=1;m.__T=T;window._gpHullMat=m;return m;}
/* one merged hull per car body and per wheel (cached per car id); hidden with the far-detail list */
function gpToonHull(k){if(!k||!k.glb||!k.body||k.hulls)return;const T=R3?R3.T:THREE,g=k.g,cid=k.carId||"x",C=window._gpHullGeo=window._gpHullGeo||{};k.hulls=[];const mat=gpHullMat(T);
  const roots=[k.body].concat(k.wheels||[]);g.updateMatrixWorld(true);
  roots.forEach((rt,ri)=>{const ck=cid+"|"+(ri?rt.name:"body");let geo=C[ck];
    if(!geo){const parts=[],inv=new T.Matrix4().copy(rt.matrixWorld).invert();
      rt.traverse(o=>{if(!o.isMesh||o.userData.liv||o.userData.hull||!o.geometry||!o.geometry.attributes.position)return;const nm=(o.material&&o.material.name)||"";if(/^(decal|lamp|tail|taillens)/.test(nm)||o.material.transparent||o.material.isMeshBasicMaterial)return;
        for(let q=o.parent;q&&q!==rt;q=q.parent)if(q!==rt&&roots.includes(q))return;   // wheels inside the body tree belong to their own hull
        const gg=new T.BufferGeometry();gg.setAttribute("position",o.geometry.attributes.position.clone());if(o.geometry.index)gg.setIndex(o.geometry.index.clone());gg.applyMatrix4(new T.Matrix4().multiplyMatrices(inv,o.matrixWorld));parts.push(gg);});
      if(!parts.length)return;let n=0,ni=0;parts.forEach(p=>{n+=p.attributes.position.count;ni+=p.index?p.index.count:p.attributes.position.count;});const pos=new Float32Array(n*3),ix=new Uint32Array(ni);let vo=0,io=0;
      parts.forEach(p=>{const c=p.attributes.position.count;pos.set(p.attributes.position.array,vo*3);if(p.index){const a=p.index.array;for(let i=0;i<a.length;i++)ix[io++]=a[i]+vo;}else for(let i=0;i<c;i++)ix[io++]=vo+i;vo+=c;p.dispose();});
      geo=new T.BufferGeometry();geo.setAttribute("position",new T.BufferAttribute(pos,3));geo.setIndex(new T.BufferAttribute(ix,1));gpHullNormals(T,geo);geo.computeBoundingSphere();C[ck]=geo;}
    const h=new T.Mesh(geo,mat);h.userData.hull=1;h.castShadow=false;h.renderOrder=0;rt.add(h);k.hulls.push(h);if(k.lod&&ri)k.lod.push(h);});}
/* ---------- cheap polish effects (job 1112-0016-43fd): light rays, sparkle motes, soft glow (bloom) + an automatic low-power switch ----------
   Realistic + Cartoon looks only (not Storybook, not Coral Deep). Levels: 2 = all, 1 = rays + motes (no glow), 0 = off.
   Start: Effects option Off -> 0; small screens -> 1; otherwise 2. Two slow 2-s windows in a row (< 50 fps) drop one level
   (2 -> 1 -> 0) BEFORE the old quality ladder; it never climbs back during a race (no flicker) and resets next race.
   Costs: rays = 1 draw (a handful of camera-facing additive shafts), motes = 1 draw (one Points cloud wrapped round the camera),
   glow = one quarter-resolution pass read by the existing full-screen pass. */
function gpFxInit(){const R=R3;if(!R||gpStory()||R.C.deep)return;const T=R.T,lv=gpFx()==="off"?0:(Math.min(innerWidth,innerHeight)<520?1:2);
  R.pfx={level:lv,why:gpFx()==="off"?"user":"start",low:0,t:0,objs:[]};
  const sandy=gpSandy(R.C)||R.C.theme==="dakar",S=R.samples,n=S.length,sd=R.sunDir,sx=new T.Vector3(sd.x,0,sd.z).normalize();
  // light rays: ~8 shafts beside the road on the sun side, slanting down along the sunlight (Realistic: fainter, none on dusk/night tracks)
  const real=gpReal(),night=!!(R.L0&&R.L0.night);
  if(!(real&&night)){const N=Math.max(12,Math.min(36,Math.round(R.len/110))),cs=[],qs=[],ps=[],ix=[];let rr=R.C.id.length*37+11;const rnd=()=>{rr=(rr*16807)%2147483647;return (rr-1)/2147483646;};
    for(let k=0;k<N;k++){const s=S[Math.floor((k+0.35+rnd()*0.3)/N*n)%n];const side=Math.sign(s.nor.x*sx.x+s.nor.z*sx.z)||1,off=R.W+9+rnd()*14,c=s.pos.clone().addScaledVector(s.nor,side*off);c.y=s.pos.y-1;
      const wd=10+rnd()*8,ln=45+rnd()*30,ph=rnd()*6.28,b=k*4;[[-0.5,0],[0.5,0],[0.5,1],[-0.5,1]].forEach(q=>{cs.push(c.x,c.y,c.z);qs.push(q[0]*wd,q[1]*ln);ps.push(ph);});ix.push(b,b+1,b+2,b,b+2,b+3);}
    const g=new T.BufferGeometry();g.setAttribute("position",new T.Float32BufferAttribute(cs,3));g.setAttribute("aQ",new T.Float32BufferAttribute(qs,2));g.setAttribute("aP",new T.Float32BufferAttribute(ps,1));g.setIndex(ix);
    const m=new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false,uniforms:{uDir:{value:new T.Vector3(sd.x*0.5,1,sd.z*0.5).normalize()},uT:{value:0},uCol:{value:new T.Color(sandy?(real?"#e8c89a":"#ffc98a"):"#ffd9a0").convertSRGBToLinear()},uOp:{value:real?(sandy?0.08:0.10):0.17}},
      vertexShader:"attribute vec2 aQ;attribute float aP;uniform vec3 uDir;uniform float uT;varying vec2 vQ;varying float vA;void main(){vec3 c=position;vec3 v=normalize(cameraPosition-c);vec3 r=normalize(cross(uDir,v));vec3 p=c+uDir*aQ.y+r*aQ.x;float d=distance(cameraPosition,p);vQ=vec2(aQ.x/max(0.001,abs(aQ.x))*0.5+0.5,aQ.y);vA=smoothstep(6.0,18.0,d)*(1.0-smoothstep(260.0,420.0,d))*(0.75+0.25*sin(uT*0.63+aP));gl_Position=projectionMatrix*viewMatrix*vec4(p,1.0);}",
      fragmentShader:"uniform vec3 uCol;uniform float uOp;varying vec2 vQ;varying float vA;void main(){float e=1.0-abs(vQ.x*2.0-1.0);float a=e*e*vA*uOp;gl_FragColor=vec4(uCol*a,a);}"});
    m.userData.lin=1;m.toneMapped=false;const mesh=new T.Mesh(g,m);mesh.frustumCulled=false;mesh.renderOrder=5;R.scene.add(mesh);R.pfx.rays=mesh;R.pfx.objs.push(mesh);
    // the shafts measure their length in metres: scale the unit quad's y by the real length (already in aQ.y); keep them out of the mirror/minimap
    mesh.userData.fx=1;}
  // sparkle / dust motes: one Points cloud, wrapped round the camera in the vertex shader (Cartoon only - they read as toy sparkles on real cars)
  if(gpToon()){const N=lv>=2?280:140,P=new Float32Array(N*3),ph=new Float32Array(N);let rr=99;const rnd=()=>{rr=(rr*16807)%2147483647;return (rr-1)/2147483646;};for(let i=0;i<N;i++){P[i*3]=rnd()*60;P[i*3+1]=rnd()*18;P[i*3+2]=rnd()*60;ph[i]=rnd()*6.28;}
    const g=new T.BufferGeometry();g.setAttribute("position",new T.BufferAttribute(P,3));g.setAttribute("aP",new T.BufferAttribute(ph,1));
    const m=new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false,uniforms:{uT:{value:0},uMap:{value:gpSoftDot()},uCol:{value:new T.Color(sandy?"#f3d7a6":"#ffe29a").convertSRGBToLinear()},uPx:{value:300},uMax:{value:9}},
      vertexShader:"attribute float aP;uniform float uT;uniform float uPx;uniform float uMax;varying float vA;void main(){vec3 box=vec3(60.0,18.0,60.0);vec3 p=mod(position-cameraPosition+box*0.5+vec3(sin(uT*0.21+aP)*1.5,uT*0.25,cos(uT*0.17+aP)*1.5),box)-box*0.5+cameraPosition;p.y+=-3.0;vec4 mv=viewMatrix*vec4(p,1.0);float d=-mv.z;vA=smoothstep(2.0,5.0,d)*(1.0-smoothstep(22.0,30.0,d))*(0.35+0.65*pow(0.5+0.5*sin(uT*2.3+aP*3.0),3.0));gl_PointSize=clamp(uPx*0.09/max(d,0.1),1.5,uMax);gl_Position=projectionMatrix*mv;}",
      fragmentShader:"uniform sampler2D uMap;uniform vec3 uCol;varying float vA;void main(){float a=texture2D(uMap,gl_PointCoord).a*vA;gl_FragColor=vec4(uCol*a,a);}"});
    m.userData.lin=1;m.toneMapped=false;const pts=new T.Points(g,m);pts.frustumCulled=false;pts.renderOrder=6;pts.userData.fx=1;R.scene.add(pts);R.pfx.motes=pts;R.pfx.objs.push(pts);}
  // glow: bright-pass + 9-tap blur at quarter resolution, added in the final full-screen pass
  if(R.fz){const o={minFilter:T.LinearFilter,magFilter:T.LinearFilter,format:T.RGBAFormat},rt=new T.WebGLRenderTarget(4,4,o);
    const m=new T.ShaderMaterial({depthTest:false,depthWrite:false,uniforms:{tCol:{value:R.fz.rt.texture},px:{value:new T.Vector2(1/256,1/256)},uTh:{value:real?new T.Vector2(0.86,0.98):new T.Vector2(0.78,0.95)}},vertexShader:"varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}",
      fragmentShader:"uniform sampler2D tCol;uniform vec2 px;uniform vec2 uTh;varying vec2 vUv;vec3 bp(vec2 u){vec3 c=texture2D(tCol,u).rgb;float l=dot(c,vec3(0.2126,0.7152,0.0722));return c*smoothstep(uTh.x,uTh.y,l);}void main(){vec3 a=bp(vUv)*0.25;a+=(bp(vUv+vec2(px.x,0.0))+bp(vUv-vec2(px.x,0.0))+bp(vUv+vec2(0.0,px.y))+bp(vUv-vec2(0.0,px.y)))*0.125;a+=(bp(vUv+px)+bp(vUv-px)+bp(vUv+vec2(px.x,-px.y))+bp(vUv+vec2(-px.x,px.y)))*0.0625;gl_FragColor=vec4(a,1.0);}"});
    const q=new T.Mesh(new T.PlaneGeometry(2,2),m);q.frustumCulled=false;const sc=new T.Scene();sc.add(q);R.pfx.bloom={rt,m,sc};
    const U=R.fz.mat.uniforms;U.tBloom.value=rt.texture;R.pfx.bloomK=gpToon()?0.32:(real?0.18:0.22);}
  gpFxSet(lv,R.pfx.why);gpFxResize();}
function gpFxResize(){const R=R3;if(!R||!R.pfx||!R.pfx.bloom||!R.fz)return;const r=R.fz.mat.uniforms.res.value,w=Math.max(2,Math.round(r.x/4)),h=Math.max(2,Math.round(r.y/4));R.pfx.bloom.rt.setSize(w,h);R.pfx.bloom.m.uniforms.px.value.set(1.5/w,1.5/h);
  if(R.pfx.motes){R.pfx.motes.material.uniforms.uPx.value=r.y;R.pfx.motes.material.uniforms.uMax.value=Math.max(5,Math.round(r.y*0.016));}}
function gpFxSet(lv,why){const R=R3;if(!R||!R.pfx)return;const F=R.pfx;F.level=lv;F.why=why||F.why;
  if(F.rays)F.rays.visible=lv>=1;if(F.motes)F.motes.visible=lv>=1;if(R.fz&&R.fz.mat.uniforms.uBloom)R.fz.mat.uniforms.uBloom.value=(lv>=2&&F.bloom&&!window.__gpNoBloom)?F.bloomK:0;
  if(window.__gp){window.__gp.fx=lv;window.__gp.fxWhy=F.why;}}
/* per frame from gpRender: shimmer/twinkle clocks; motes hide in the cockpit (they would sit on the windscreen) */
function gpFxFrame(dt,cmode){const F=R3&&R3.pfx;if(!F)return;F.t+=dt;if(F.rays)F.rays.material.uniforms.uT.value=F.t;if(F.motes){F.motes.material.uniforms.uT.value=F.t;F.motes.visible=F.level>=1&&cmode!=="cockpit";}}
/* the low-power switch, called from gpFrame's 2-s window before the old ladder; returns true while effects are still being cut */
function gpFxLow(fps){const R=R3,F=R&&R.pfx;if(!F||F.level<=0)return false;if(document.hidden||R.phase!=="race"||!R.goAt||performance.now()-R.goAt<3000)return true;
  if(fps<50){F.low++;if(F.low>=2){F.low=0;gpFxSet(F.level-1,"auto");if(!F.chip){F.chip=1;gpFxChip();}}}else F.low=0;return true;}
function gpFxChip(){const w=document.getElementById("gp3");if(!w||document.getElementById("gp3FxChip"))return;const c=document.createElement("div");c.id="gp3FxChip";c.setAttribute("role","status");c.textContent="✨ Effects off to keep it smooth";
  c.style.cssText="position:absolute;left:50%;top:12%;transform:translateX(-50%) translateY(-6px);padding:6px 14px;border-radius:999px;background:rgba(20,20,34,.72);color:#fff;font:600 13px/1.2 system-ui,sans-serif;letter-spacing:.02em;pointer-events:none;opacity:0;transition:opacity .25s,transform .25s;z-index:30;backdrop-filter:blur(4px)";
  w.appendChild(c);requestAnimationFrame(()=>{c.style.opacity="1";c.style.transform="translateX(-50%)";});setTimeout(()=>{c.style.opacity="0";setTimeout(()=>c.remove(),300);},2000);if(window.__gp)window.__gp.fxChips=(window.__gp.fxChips||0)+1;}
