/* ============================================================
   FIND THE DETAIL - Grade 3 reading-detail practice (own file; inlined into index.html)
   Why: Grade 3 Marking Period 1 report card says reading comprehension is the growth area,
   "particularly when identifying key details to support responses".
   - 12 short ORIGINAL passages (kid-today topics), 3-4 questions each.
   - Question types:  detail (who/what/where/why/how many), event (main event / what happened),
     feel (how a character feels), evidence + clue (TAP the sentence that proves it).
   - Wrong answer -> the sentence that holds the answer is highlighted, then the SAME question is retried.
   - Sticky Check button. Read-aloud uses the app's existing say() (no new voice recordings).
   Data format: s = sentences (tappable); qs[].o = options with the RIGHT one first (app shuffles);
   qs[].ev = index of the sentence that holds the answer; evidence/clue questions have no options (tap ev).
   Edit this file, then run: python3 inline_lessons.py
   ============================================================ */
const FD_PASSAGES=[
{id:"fd01",title:"The Missing Cleat",icon:"⚽",s:[
 "Kofi packed his soccer bag on Saturday morning.",
 "He put in his shin guards, his water bottle, and one blue cleat.",
 "At the field, he looked again and the other cleat was gone.",
 "Coach Mills said, \"Check the car.\"",
 "Kofi ran back to his dad's car and looked under the seat.",
 "There it was, hiding beside an empty juice box.",
 "He laced up both cleats and jogged to his team just in time for warm-ups."],
 qs:[
 {t:"detail",topic:"key details",q:"Who told Kofi to check the car?",o:["Coach Mills","His dad","A teammate","The referee"],ev:3},
 {t:"detail",topic:"key details",q:"Where did Kofi find the missing cleat?",o:["Under the car seat","In his soccer bag","On the field","At home"],ev:4},
 {t:"event",topic:"main events",q:"What was the main problem in this story?",o:["Kofi could not find one of his cleats.","Kofi missed the bus.","Kofi forgot his water bottle.","Coach Mills was angry."],ev:2},
 {t:"evidence",topic:"text evidence",q:"Which sentence shows that Kofi was not late for warm-ups?",ev:6,hint:"Look for the sentence about what happened at the very end."}]},
{id:"fd02",title:"Ama's Library Book",icon:"📚",s:[
 "Ama had borrowed a book about sharks two weeks ago.",
 "Today it was due, but she could not find it.",
 "She searched her backpack, her desk, and under her bed.",
 "Her cheeks felt hot and her stomach felt tight.",
 "Finally, her little brother held up the book from behind the couch.",
 "He had been using it as a roof for his toy dinosaur fort.",
 "Ama laughed and hurried to the library before it closed."],
 qs:[
 {t:"detail",topic:"key details",q:"What was Ama's library book about?",o:["Sharks","Dinosaurs","Space","Basketball"],ev:0},
 {t:"detail",topic:"key details",q:"Where was the book finally found?",o:["Behind the couch","In her backpack","Under her bed","On her desk"],ev:4},
 {t:"feel",topic:"characters",q:"How did Ama feel when she could not find the book?",o:["Worried","Excited","Sleepy","Proud"],ev:3},
 {t:"clue",topic:"text evidence",q:"Which sentence is the clue that shows Ama felt worried? Tap it.",ev:3,hint:"Look for how Ama's body felt."}]},
{id:"fd03",title:"Jollof Sunday",icon:"🍲",s:[
 "Every Sunday, Esi video called Grandma Abena in Ghana.",
 "Today they cooked jollof rice together, one pot in Maryland and one pot in Accra.",
 "Grandma held up a bright red tomato and said, \"The sauce is the secret.\"",
 "Esi stirred slowly, just like Grandma showed her.",
 "When the rice was done, Esi's whole family said it smelled amazing.",
 "She smiled and told Grandma, \"Next Sunday, you pick the food!\""],
 qs:[
 {t:"detail",topic:"key details",q:"What did Esi and Grandma Abena make?",o:["Jollof rice","Pizza","Tomato soup","Pancakes"],ev:1},
 {t:"detail",topic:"key details",q:"Who said that the sauce is the secret?",o:["Grandma Abena","Esi","Esi's mom","Esi's cousin"],ev:2},
 {t:"evidence",topic:"text evidence",q:"Which sentence tells you the family liked how the rice smelled? Tap it.",ev:4,hint:"Look for the sentence about the finished rice."},
 {t:"event",topic:"main events",q:"What did Esi say at the end of the story?",o:["Grandma should pick the food next Sunday.","She never wanted to cook again.","The rice was burned.","She wanted to visit Accra tomorrow."],ev:5}]},
{id:"fd04",title:"The Science Fair Volcano",icon:"🌋",s:[
 "Jabari worked for three days on his science fair volcano.",
 "He built it from clay and painted it brown and orange.",
 "On the big day, he poured vinegar into the top.",
 "Nothing happened.",
 "Jabari looked closer and saw that he had forgotten the baking soda.",
 "He added a big spoonful, and bubbly red foam poured down the sides.",
 "The judges clapped, and Jabari grinned from ear to ear."],
 qs:[
 {t:"detail",topic:"key details",q:"How many days did Jabari work on his volcano?",o:["Three","Two","Five","One"],ev:0},
 {t:"detail",topic:"key details",q:"Why did the volcano do nothing at first?",o:["Jabari forgot the baking soda.","The clay was too thick.","The judges were late.","The vinegar was gone."],ev:4},
 {t:"evidence",topic:"text evidence",q:"Which sentence tells what Jabari used to build the volcano? Tap it.",ev:1,hint:"Look for the sentence about what the volcano was made from."},
 {t:"event",topic:"main events",q:"What did Jabari do to fix the problem?",o:["He added baking soda.","He started over with new clay.","He asked the judges for help.","He painted the volcano again."],ev:5}]},
{id:"fd05",title:"The Last Shot",icon:"🏀",s:[
 "Malik's team was losing by one point with three seconds left.",
 "Coach passed him the ball, and Malik's hands began to shake.",
 "He took a deep breath, bent his knees, and shot.",
 "The ball bounced off the rim and fell to the floor.",
 "The buzzer rang, and Malik stared at his shoes.",
 "After the game, his teammate Dre patted his back and said, \"You were brave to take that shot.\"",
 "Malik looked up and gave a small smile."],
 qs:[
 {t:"detail",topic:"key details",q:"Who told Malik he was brave?",o:["Dre","Coach","His dad","The referee"],ev:5},
 {t:"event",topic:"main events",q:"What happened to Malik's last shot?",o:["It hit the rim and missed.","It went into the basket.","Someone blocked it.","He passed instead of shooting."],ev:3},
 {t:"feel",topic:"characters",q:"How did Malik feel right after the buzzer?",o:["Disappointed","Proud","Sleepy","Silly"],ev:4},
 {t:"clue",topic:"text evidence",q:"Which sentence is the clue that shows Malik felt disappointed? Tap it.",ev:4,hint:"Look for what Malik did when the game ended."}]},
{id:"fd06",title:"The Cookie Mystery",icon:"🍪",s:[
 "Tia baked twelve chocolate chip cookies for the bake sale.",
 "She left them on the kitchen table and went to get the boxes.",
 "When she came back, the plate was empty and there were crumbs on the floor.",
 "A trail of crumbs led across the kitchen to the living room.",
 "Under the couch, Tia found her dog Biscuit with chocolate on his nose.",
 "She laughed and shook her head, then started a new batch."],
 qs:[
 {t:"detail",topic:"key details",q:"How many cookies did Tia bake?",o:["Twelve","Ten","Two","Twenty"],ev:0},
 {t:"detail",topic:"key details",q:"Who took the cookies?",o:["Biscuit the dog","Tia's brother","Tia's mom","A neighbor"],ev:4},
 {t:"evidence",topic:"text evidence",q:"Which sentence shows where the trail of crumbs led? Tap it.",ev:3,hint:"Look for the sentence with the word trail."},
 {t:"event",topic:"main events",q:"What did Tia do after she found Biscuit?",o:["She laughed and baked more cookies.","She called the vet.","She sold the empty plate.","She went to bed."],ev:5}]},
{id:"fd07",title:"A New Seat in Room 12",icon:"🎒",s:[
 "On Monday, Kwame started at a new school in Silver Spring.",
 "He held his backpack straps tight as he walked into Room 12.",
 "Everyone looked at him, and his face felt warm.",
 "A girl named Sofia waved and pointed to the empty seat beside her.",
 "At lunch, Kwame traded his granola bar for her grapes.",
 "By the end of the day, he was already planning to sit with Sofia again."],
 qs:[
 {t:"detail",topic:"key details",q:"Which room was Kwame's new classroom?",o:["Room 12","Room 2","Room 21","Room 8"],ev:1},
 {t:"detail",topic:"key details",q:"Who pointed to the empty seat?",o:["Sofia","The teacher","Kwame","The principal"],ev:3},
 {t:"detail",topic:"key details",q:"What did Kwame get when he traded his granola bar?",o:["Grapes","Chips","A cookie","Juice"],ev:4},
 {t:"evidence",topic:"text evidence",q:"Which sentence shows that Kwame wanted to see his new friend again? Tap it.",ev:5,hint:"Look for the sentence about the end of the day."}]},
{id:"fd08",title:"Planting Tomatoes with Grandpa",icon:"🍅",s:[
 "Zuri helps her grandpa plant tomatoes in the backyard every spring.",
 "First, they dig small holes about as deep as a soup can.",
 "Next, they gently place each plant in a hole and cover its roots with soil.",
 "Then Zuri pours water from a watering can over the new plants.",
 "Grandpa says tomatoes need at least six hours of sun each day, so they plant them by the fence where the sun shines longest.",
 "In July, the plants are covered with red tomatoes, and Zuri picks the ripest one for a sandwich."],
 qs:[
 {t:"detail",topic:"key details",q:"How deep do they dig the holes?",o:["About as deep as a soup can","As deep as a swimming pool","As deep as a pencil","As deep as a shoe"],ev:1},
 {t:"detail",topic:"key details",q:"What do they do right after they put a plant in the hole?",o:["Cover its roots with soil","Water it","Pick a tomato","Dig another hole"],ev:2},
 {t:"detail",topic:"key details",q:"Why do they plant the tomatoes by the fence?",o:["The sun shines there the longest.","The fence is pretty.","The soil is softer there.","It is near the house."],ev:4},
 {t:"evidence",topic:"text evidence",q:"Which sentence tells what Zuri does in July? Tap it.",ev:5,hint:"Look for the sentence that names a month."}]},
{id:"fd09",title:"Rain at the Bus Stop",icon:"🌧️",s:[
 "Dark clouds covered the sky as Nia waited at the bus stop.",
 "She had left her umbrella by the front door.",
 "The first drops fell, and she pulled her jacket over her head.",
 "Mr. Owens, the bus driver, opened the doors early and waved her in.",
 "\"You can't ride wet and cold,\" he said with a kind smile.",
 "Nia thanked him and sat by the heater, dripping but grateful."],
 qs:[
 {t:"detail",topic:"key details",q:"Who opened the bus doors early?",o:["Mr. Owens","Nia","Nia's mom","A classmate"],ev:3},
 {t:"detail",topic:"key details",q:"Why was Nia getting wet?",o:["She left her umbrella at home.","Her umbrella was broken.","She fell in a puddle.","She missed the bus."],ev:1},
 {t:"evidence",topic:"text evidence",q:"Which sentence shows what Nia did to try to stay dry before the bus came? Tap it.",ev:2,hint:"Look for what Nia did with her jacket."},
 {t:"event",topic:"main events",q:"What is the main thing that happened in this story?",o:["A bus driver helped Nia get out of the rain.","Nia lost her jacket.","The bus never came.","Nia found an umbrella."],ev:3}]},
{id:"fd10",title:"Drums at the Talent Show",icon:"🥁",s:[
 "Yaw was going to play the drums at the school talent show.",
 "Backstage, his knees wobbled and his mouth felt dry.",
 "He peeked at the crowd and saw more than two hundred people.",
 "His friend Ben whispered, \"Just play it like you do at home.\"",
 "Yaw closed his eyes, counted to four, and tapped the first beat.",
 "By the last song, the crowd was clapping along, and Yaw could not stop grinning."],
 qs:[
 {t:"detail",topic:"key details",q:"What instrument did Yaw play?",o:["Drums","Guitar","Piano","Trumpet"],ev:0},
 {t:"detail",topic:"key details",q:"Who gave Yaw advice backstage?",o:["Ben","His teacher","His dad","The crowd"],ev:3},
 {t:"feel",topic:"characters",q:"How did Yaw feel backstage?",o:["Nervous","Bored","Angry","Sleepy"],ev:1},
 {t:"clue",topic:"text evidence",q:"Which sentence is the clue that shows Yaw felt nervous? Tap it.",ev:1,hint:"Look for what Yaw's knees and mouth did."}]},
{id:"fd11",title:"A Terrapin on the Shore",icon:"🐢",s:[
 "On the shore of the Chesapeake Bay, Leah found a baby terrapin stuck in seaweed.",
 "Its tiny legs kicked, but it could not get free.",
 "Leah did not grab it. Instead, she lifted the seaweed slowly with a stick.",
 "The terrapin wiggled out and waddled toward the water.",
 "Leah watched until a small wave carried it away.",
 "That night, she drew a picture of the terrapin in her nature journal."],
 qs:[
 {t:"detail",topic:"key details",q:"Where did Leah find the baby terrapin?",o:["On the shore of the Chesapeake Bay","In a pond at school","In her backyard","In a pet store"],ev:0},
 {t:"detail",topic:"key details",q:"What did Leah use to free the terrapin?",o:["A stick","Her hands","A net","A shovel"],ev:2},
 {t:"evidence",topic:"text evidence",q:"Which sentence shows the terrapin was carried into the water? Tap it.",ev:4,hint:"Look for what the small wave did."},
 {t:"event",topic:"main events",q:"What did Leah do that night?",o:["She drew the terrapin in her journal.","She took the terrapin home.","She went back to the shore.","She read about turtles."],ev:5}]},
{id:"fd12",title:"Peanut the Class Hamster",icon:"🐹",s:[
 "Room 8's class hamster, Peanut, had a big problem.",
 "He would not eat his food, and he stayed curled up in his bed all day.",
 "Ms. Rivera called the vet, who said hamsters can get sick if they run out of water.",
 "The class checked, and the water bottle was bone dry.",
 "Marcus filled it with fresh water, and Peanut drank for a full minute.",
 "The next morning, Peanut was racing on his wheel again."],
 qs:[
 {t:"detail",topic:"key details",q:"Who called the vet?",o:["Ms. Rivera","Marcus","The principal","A parent"],ev:2},
 {t:"detail",topic:"key details",q:"What was wrong with the water bottle?",o:["It was empty.","It was broken.","It was dirty.","It was missing."],ev:3},
 {t:"detail",topic:"key details",q:"Who filled the water bottle?",o:["Marcus","Ms. Rivera","The vet","Peanut"],ev:4},
 {t:"evidence",topic:"text evidence",q:"Which sentence shows that Peanut got better? Tap it.",ev:5,hint:"Look for the sentence about the next morning."}]}
];

/* ---------- state + helpers ---------- */
let FDS=null;
const FD_FEEDBACK_OK=["Yes! Nice finding!","You found it!","Right! Detective eyes!","Exactly right!"];
function fdPassage(id){return FD_PASSAGES.find(p=>p.id===id)||null;}
function fdProfileRec(){if(!P)return{};if(!P.fd||typeof P.fd!=="object")P.fd={};if(!P.fd.done||typeof P.fd.done!=="object")P.fd.done={};return P.fd;}
/* next story: one he has not done yet; when all are done, the one he did longest ago (or scored lowest on) */
function fdPickNext(profile,avoid){
  const rec=(profile&&profile.fd&&profile.fd.done)||{};
  const list=FD_PASSAGES.filter(p=>p.id!==avoid);
  const fresh=list.filter(p=>!rec[p.id]);
  if(fresh.length)return fresh[0];
  return list.slice().sort((a,b)=>{
    const ra=rec[a.id],rb=rec[b.id];
    const sa=ra.best/Math.max(1,ra.total),sb=rb.best/Math.max(1,rb.total);
    return String(ra.date).localeCompare(String(rb.date))||sa-sb;
  })[0]||FD_PASSAGES[0];
}
function fdCss(){
  if(typeof document==="undefined"||document.getElementById("fdCss"))return;
  const st=document.createElement("style");st.id="fdCss";
  st.textContent=[
  ".fd-wrap{max-width:600px;margin:0 auto;padding:6px 14px 120px;font-family:'Fredoka','Nunito',ui-rounded,system-ui,-apple-system,'Segoe UI',sans-serif;color:#2d221c}",
  ".fd-top{display:flex;align-items:center;gap:10px;margin:4px 0 12px}",
  ".fd-title{font-weight:700;font-size:18px;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#fff}",
  ".fd-dots{display:flex;gap:6px}",
  ".fd-dot{width:14px;height:14px;border-radius:50%;border:2.5px solid #fff;background:rgba(255,255,255,.18)}",
  ".fd-dot.now{background:#ffd60a}.fd-dot.ok{background:#ff9f1c}.fd-dot.miss{background:#ffb4a2}",
  ".fd-card{color:#2d221c;background:#fff;border:3px solid #2d221c;border-radius:18px;padding:14px 16px;box-shadow:0 5px 0 #2d221c;margin-bottom:16px}",
  ".fd-q{background:#fff3d6}.fd-kicker{font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#a05a00}",
  ".fd-qtext{font-size:19px;font-weight:600;line-height:1.35;margin:4px 0 0}",
  ".fd-pass{font-family:'Lexend','Atkinson Hyperlegible',system-ui,-apple-system,'Segoe UI',sans-serif;font-size:16px;line-height:2;letter-spacing:.2px;background:#fffdf5}",
  ".fd-pass h3{margin:0 0 4px;font-family:inherit;font-size:15px;font-weight:700;color:#7a4a00}",
  ".fd-sen{padding:2px 3px;border-radius:6px;-webkit-box-decoration-break:clone;box-decoration-break:clone}",
  ".fd-tap .fd-sen{cursor:pointer;border-bottom:2px dashed rgba(45,34,28,.28)}",
  ".fd-tap .fd-sen:active{background:rgba(67,97,238,.14)}",
  "@media(hover:hover){.fd-tap .fd-sen:hover{background:rgba(67,97,238,.12);border-bottom:2px solid #4361ee}}",
  ".fd-sen.pick{background:#ffd60a;border-bottom:2px solid #2d221c;box-shadow:2px 2px 0 #2d221c}",
  ".fd-sen.hint{background:#ffe08a;outline:3px solid #ff9f1c;outline-offset:1px}",
  ".fd-sen.good{background:#d8f3dc;outline:3px solid #2f9e5b;outline-offset:1px}",
  ".fd-sen.no{text-decoration:line-through;text-decoration-color:#d9480f;opacity:.7}",
  ".fd-read{display:inline-flex;align-items:center;gap:6px;margin:0 8px 10px 0;padding:8px 14px;border:2.5px solid #2d221c;border-radius:999px;background:#fff;font:inherit;font-weight:700;font-size:15px;cursor:pointer;color:#2d221c}",
  ".fd-opts{display:flex;flex-direction:column;gap:10px;margin-bottom:14px}",
  ".fd-opt{display:flex;align-items:center;gap:12px;text-align:left;padding:13px 14px;min-height:54px;border:3px solid #2d221c;border-radius:16px;background:#fff;font:inherit;font-size:17px;font-weight:600;color:#2d221c;cursor:pointer;box-shadow:0 3px 0 #2d221c}",
  ".fd-opt .ltr{flex:0 0 30px;height:30px;border-radius:50%;background:#fff3d6;border:2.5px solid #2d221c;display:grid;place-items:center;font-size:14px;font-weight:800}",
  ".fd-opt.pick{background:#ffd60a}.fd-opt.pick .ltr{background:#fff}",
  ".fd-opt.dead{opacity:.55;text-decoration:line-through;box-shadow:none;cursor:default;background:#f1ece4!important;color:#2d221c!important}",
  ".fd-opt.right{background:#d8f3dc!important;border-color:#2f9e5b;color:#2d221c!important}",
  ".fd-msg{border:3px solid #2d221c;border-radius:16px;padding:12px 14px;margin-bottom:14px;font-weight:600;line-height:1.4}",
  ".fd-msg.ok{background:#d8f3dc}.fd-msg.no{background:#ffe9d6}",
  ".fd-msg{color:#2d221c;font-size:16px;scroll-margin-bottom:110px}.fd-msg b{display:block;font-size:17px;margin-bottom:2px}",
  ".fd-foot{position:fixed;left:0;right:0;bottom:0;z-index:30;padding:10px 14px calc(10px + env(safe-area-inset-bottom,0px));background:rgba(255,253,245,.96);border-top:3px solid #2d221c;backdrop-filter:blur(8px)}",
  ".fd-foot button{display:block;width:100%;max-width:600px;margin:0 auto;min-height:54px;border:3px solid #2d221c;border-radius:16px;background:#ff9f1c;color:#2d221c;font:inherit;font-size:19px;font-weight:800;letter-spacing:.4px;box-shadow:0 4px 0 #2d221c;cursor:pointer}",
  ".fd-foot button:disabled{background:#e8e0d2;color:#8a7b6c;box-shadow:none;cursor:default}",
  ".fd-foot button.next{background:#2f9e5b;color:#fff}",
  ".fd-done>p{color:#2d221c}.fd-done{max-width:520px;margin:0 auto;text-align:center;padding:10px 14px 30px;font-family:'Fredoka','Nunito',ui-rounded,system-ui,sans-serif;color:#2d221c}",
  ".fd-done .fd-card{text-align:left}",
  ".fd-stat{display:flex;justify-content:space-between;padding:6px 0;border-bottom:2px dashed rgba(45,34,28,.2);font-weight:700}",
  ".fd-btns{display:flex;flex-direction:column;gap:10px;margin-top:16px}",
  ".fd-btns button{min-height:54px;border:3px solid #2d221c;border-radius:16px;background:#ff9f1c;font:inherit;font-size:18px;font-weight:800;color:#2d221c;box-shadow:0 4px 0 #2d221c;cursor:pointer}",
  ".fd-btns button.alt{background:#fff}",
  ".fd-home{background:#fff3d6;border:3px solid #2d221c;border-radius:20px;padding:14px 16px;margin:12px 0;box-shadow:0 5px 0 #2d221c;color:#2d221c}",
  ".fd-home .fd-kicker{color:#a05a00}",
  ".fd-home h2{margin:2px 0 2px;font-size:22px;color:#2d221c}",
  ".fd-home p{margin:0 0 10px;font-size:15px;font-weight:600}",
  ".fd-home button{width:100%;min-height:52px;border:3px solid #2d221c;border-radius:16px;background:#ff9f1c;font:inherit;font-size:18px;font-weight:800;color:#2d221c;box-shadow:0 4px 0 #2d221c;cursor:pointer}"
  ].join("\n");
  document.head.appendChild(st);
}

/* ---------- screens ---------- */
function fdHomeCardHTML(){
  if(!P)return"";
  fdCss();
  const nx=fdPickNext(P),rec=fdProfileRec(),n=Object.keys(rec.done).length;
  return '<section class="fd-home" aria-label="Reading practice"><div class="fd-kicker">⭐ NEXT · READING</div><h2>🔎 Find the Detail</h2>'
   +'<p>'+esc(nx.icon+" "+nx.title)+' · read, then find the clue in the story'+(n?' · '+n+' of '+FD_PASSAGES.length+' stories done':'')+'</p>'
   +'<button onclick="fdStart()">Start reading ▶</button></section>';
}
function fdStart(id){
  if(!P){return;}
  fdCss();
  const p=id?fdPassage(id):fdPickNext(P);
  if(!p)return;
  clearTimers();closeOverlay();
  FDS={p,qi:0,results:[],start:Date.now(),qStart:Date.now(),tries:0,pick:null,dead:[],hintOn:false,orders:{},phase:"ask",xp:0,wrongTaps:0};
  fdRender();
}
function fdQ(){return FDS.p.qs[FDS.qi];}
function fdIsTap(q){return q.t==="evidence"||q.t==="clue";}
function fdOrder(){
  const q=fdQ();
  if(!FDS.orders[FDS.qi])FDS.orders[FDS.qi]=shuffle(q.o.map((_,i)=>i));
  return FDS.orders[FDS.qi];
}
function fdRender(){
  const q=fdQ(),p=FDS.p,tap=fdIsTap(q),done=FDS.phase==="right";
  if(document.body&&document.body.classList)document.body.classList.add("focus");
  showAnanseCorner(false);
  const dots=p.qs.map((_,i)=>'<span class="fd-dot '+(i<FDS.results.length?(FDS.results[i]?'ok':'miss'):(i===FDS.qi?'now':''))+'"></span>').join("");
  const sens=p.s.map((t,i)=>{
    let c="fd-sen";
    if(tap&&FDS.pick===i&&!done)c+=" pick";
    if(FDS.hintOn&&i===q.ev&&!done)c+=" hint";
    if(done&&i===q.ev)c+=" good";
    if(tap&&FDS.dead.indexOf(i)>=0&&!done)c+=" no";
    return '<span class="'+c+'" data-i="'+i+'"'+(tap&&!done?' role="button" tabindex="0" onclick="fdTapSentence('+i+')" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();fdTapSentence('+i+')}"':'')+'>'+esc(t)+'</span>';
  }).join(" ");
  let opts="";
  if(!tap){
    const ord=fdOrder(),L=["A","B","C","D"];
    opts='<div class="fd-opts" role="group" aria-label="Answer choices">'+ord.map((oi,pos)=>{
      let c="fd-opt";
      if(done&&oi===0)c+=" right";
      else if(FDS.dead.indexOf(oi)>=0)c+=" dead";
      else if(FDS.pick===oi)c+=" pick";
      return '<button class="'+c+'" id="fdopt'+pos+'" '+((done||FDS.dead.indexOf(oi)>=0)?'disabled ':'')+'onclick="fdPickOpt('+oi+')"><span class="ltr">'+L[pos]+'</span><span>'+esc(q.o[oi])+'</span></button>';
    }).join("")+'</div>';
  }
  let msg="";
  if(done)msg='<div class="fd-msg ok" id="fdMsg" role="status"><b>'+esc(FDS.okLine||"Yes!")+'</b>The green sentence in the story holds the answer.</div>';
  else if(FDS.hintOn)msg='<div class="fd-msg no" id="fdMsg" role="status"><b>Not quite. Let\'s look again.</b>'+(tap?'The sentence with the answer is lit up in the story. Tap it.':'The sentence with the answer is lit up in the story. Read it, then try this question again.')+'</div>';
  else if(FDS.tries>0&&tap)msg='<div class="fd-msg no" id="fdMsg" role="status"><b>Not that one. Try again.</b>'+esc(q.hint||"Read the story again and look for the clue.")+'</div>';
  const canCheck=tap?FDS.pick!==null:FDS.pick!==null;
  const last=FDS.qi>=p.qs.length-1;
  const foot=done?'<button class="next" onclick="fdNext()">'+(last?'Finish ▶':'Next ▶')+'</button>'
    :'<button id="fdCheck" '+(canCheck?'':'disabled ')+'onclick="fdCheck()">Check ✓</button>';
  app.innerHTML='<div class="fd-wrap fadein" id="fdRoot">'
   +'<div class="fd-top"><span class="fd-title">'+esc(p.icon+" "+p.title)+'</span><span class="fd-dots" aria-label="Question '+(FDS.qi+1)+' of '+p.qs.length+'">'+dots+'</span></div>'
   +'<div class="fd-card fd-q"><div class="fd-kicker">'+(tap?'Tap the sentence':'Find the detail')+' · '+(FDS.qi+1)+' of '+p.qs.length+'</div><p class="fd-qtext">'+esc(q.q)+'</p></div>'
   +'<button class="fd-read" onclick="fdReadStory()">🔊 Read the story to me</button><button class="fd-read" onclick="say(fdQ().q)">🔊 Read the question</button>'
   +'<div class="fd-card fd-pass '+(tap&&!done?'fd-tap':'')+'" id="fdPass"><h3>'+esc(p.title)+'</h3>'+sens+'</div>'
   +opts+msg
   +'</div><div class="fd-foot">'+foot+'</div>';
  if(typeof lzBack==="function")lzBack(()=>{FDS=null;if(typeof stopRecorded==="function")stopRecorded();renderHome();},"Home");
}
function fdReadStory(){const p=FDS&&FDS.p;if(p)say(p.title+". "+p.s.join(" "));}
function fdPickOpt(oi){if(!FDS||FDS.phase==="right")return;FDS.pick=oi;sfx("tick");fdRender();}
function fdTapSentence(i){if(!FDS||FDS.phase==="right")return;if(FDS.dead.indexOf(i)>=0)return;FDS.pick=i;sfx("tick");fdRender();}
function fdCheck(){
  if(!FDS||FDS.pick===null||FDS.phase==="right")return;
  const q=fdQ(),tap=fdIsTap(q),given=FDS.pick;
  const right=tap?given===q.ev:given===0;
  FDS.tries++;
  if(right){
    FDS.phase="right";FDS.okLine=FD_FEEDBACK_OK[(FDS.qi+FDS.results.length)%FD_FEEDBACK_OK.length];
    const first=FDS.tries===1;
    FDS.results.push(first);
    const xp=first?10:4;FDS.xp+=xp;P.xp=(P.xp||0)+xp;
    sfx("correct");
    if(typeof logQuestion==="function")logQuestion("practice","comprehension",q.topic,null,q.q,first,FDS.tries,Date.now()-FDS.qStart,{shown:[FDS.p.title+": "+FDS.p.s[q.ev]],given:tap?FDS.p.s[given]:q.o[given],correct:tap?FDS.p.s[q.ev]:q.o[0]});
    save();
    fdRender();
    const m=document.getElementById("fdMsg");if(m&&m.scrollIntoView)m.scrollIntoView({block:"nearest",behavior:"smooth"});
  }else{
    sfx("wrong");
    if(typeof P.wrongLog!=="undefined"&&FDS.tries===1){P.wrongLog.push({date:today(),topic:q.topic,subject:"comprehension"});P.wrongLog=P.wrongLog.slice(-1500);}
    if(typeof sm2Update==="function"&&FDS.tries===1)sm2Update(q.topic,2);
    if(typeof logQuestion==="function"&&FDS.tries===1)logQuestion("practice","comprehension",q.topic,null,q.q,false,1,Date.now()-FDS.qStart,{shown:[FDS.p.title+": "+FDS.p.s[q.ev]],given:tap?FDS.p.s[given]:q.o[given],correct:tap?FDS.p.s[q.ev]:q.o[0]});
    if(tap){FDS.dead.push(given);FDS.wrongTaps++;FDS.hintOn=FDS.wrongTaps>=2;}
    else{FDS.dead.push(given);FDS.hintOn=true;}   // multiple choice: light up the sentence with the answer, same question again
    FDS.pick=null;
    save();
    fdRender();
    const m=document.getElementById("fdMsg");if(m&&m.scrollIntoView)m.scrollIntoView({block:"nearest",behavior:"smooth"});
    say(tap?(FDS.hintOn?"Look at the lit up sentence and tap it.":"Not that one. "+(q.hint||"Try again.")):"Not quite. Read the lit up sentence, then try again.");
  }
}
function fdNext(){
  if(!FDS||FDS.phase!=="right")return;
  if(FDS.qi>=FDS.p.qs.length-1){fdFinish();return;}
  FDS.qi++;FDS.tries=0;FDS.pick=null;FDS.dead=[];FDS.hintOn=false;FDS.phase="ask";FDS.wrongTaps=0;FDS.qStart=Date.now();
  fdRender();
  window.scrollTo&&window.scrollTo(0,0);
  say(fdQ().q);
}
function fdFinish(){
  const p=FDS.p,total=p.qs.length,correct=FDS.results.filter(Boolean).length,durMs=Date.now()-FDS.start,xp=FDS.xp;
  clearTimers();defocus();
  const rec=fdProfileRec(),prev=rec.done[p.id];
  rec.done[p.id]={date:today(),best:Math.max(prev?prev.best:0,correct),last:correct,total,tries:(prev?prev.tries:0)+1};
  rec.last=p.id;
  P.sessions.push({date:today(),subject:"comprehension",correct,total,lvlAvg:(P.levels&&P.levels.comprehension)||1,xp,t:Date.now(),durMs,
    wpC:0,wpT:0,recallC:correct,recallT:total,reviewC:0,reviewT:0,mfC:0,mfT:0,lesson:null,warmup:false,finddetail:p.id});
  P.sessions=P.sessions.slice(-3000);
  if(typeof markTodayPlanDone==="function")markTodayPlanDone("finddetail","reading");
  save();
  if(typeof syncProgress==="function")syncProgress("finish");
  const nx=fdPickNext(P,p.id);
  const praise=correct===total?"Perfect detective work!":(correct>=total-1?"Great reading! You found the details.":"Good effort. Reading the story again for clues makes you stronger.");
  if(correct>=total-1&&typeof confetti==="function")confetti();
  app.innerHTML='<div class="fd-done fadein"><div style="margin:6px auto">'+(typeof ananseSVG==="function"?ananseSVG(120,correct>=total-1?"party":"idle"):"")+'</div>'
   +'<h1 style="margin:6px 0">Story complete!</h1>'
   +'<div class="fd-card"><div class="fd-stat"><span>🔎 First-try details</span><b>'+correct+' / '+total+'</b></div>'
   +'<div class="fd-stat"><span>⚡ XP earned</span><b>+'+xp+'</b></div>'
   +'<div class="fd-stat" style="border:none"><span>📖 Stories done</span><b>'+Object.keys(rec.done).length+' of '+FD_PASSAGES.length+'</b></div></div>'
   +'<p style="font-weight:700;font-size:17px">'+esc(praise)+'</p>'
   +'<div class="fd-btns"><button onclick="fdStart(\''+nx.id+'\')">📖 Another story: '+esc(nx.title)+'</button><button class="alt" onclick="goHome()">Home 🏠</button></div></div>';
  say(praise);
  const _fs=FDS;FDS=null;void _fs;
}
if(typeof window!=="undefined"){window.FD_PASSAGES=FD_PASSAGES;window.fdStart=fdStart;window.fdHomeCardHTML=fdHomeCardHTML;window.fdPickNext=fdPickNext;}
/* does the school focus ask for reading-detail practice? (topics name a reading skill, or comprehension is weighted) */
function fdFocusWants(focus){
  if(!focus||typeof focus!=="object")return false;
  const t=Array.isArray(focus.topics)?focus.topics:[];
  if(t.some(x=>/key detail|text evidence|main event|character|comprehension|reading/i.test(String(x))))return true;
  const w=focus.subjects&&+focus.subjects.comprehension;
  return Number.isFinite(w)&&w>1;
}
if(typeof window!=="undefined")window.fdFocusWants=fdFocusWants;
