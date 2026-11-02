import sys,os,json; sys.path.insert(0,'.')
from lzt import *
URL=sys.argv[1] if len(sys.argv)>1 else "http://127.0.0.1:8901/index.html"
OUT='/Users/ananseclaw/staging/lz-notes/declutter/shots/types/'; os.makedirs(OUT,exist_ok=True)
FILL="""(()=>{const p=WB.cur,a=p.answer;WB.drew=true;const set=(k,v)=>{WB.fields[k]=String(v)};
 if(p.type==='fill')set('ans',WRONG?a+1:a);
 else if(p.type==='picture'){a.eq.forEach((v,i)=>set('e'+i,v));if(a.eq2)a.eq2.forEach((v,i)=>set('x'+i,v));}
 else if(p.type==='story'){a.eq.forEach((v,i)=>set('e'+i,v));set('ans',WRONG?a.value+1:a.value);if(a.remainder!=null)set('rem',a.remainder);}
 else if(p.type==='multi'){WB.selected=WRONG?[]:a.slice();WB.selected=WRONG?[p.options[0].id]:a.slice();}
 else if(p.type==='who'){WB.person=(a&&a.person)||a;if(p.valueAnswer!=null)set('ans',p.valueAnswer);}
 else if(p.type==='match'){a.forEach(([id,n])=>set(id,n));}
 else if(p.type==='pair'){set('ans',a.product);if(a.equations){a.equations[0].forEach((v,i)=>set('e'+i,v));a.equations[1].forEach((v,i)=>set('x'+i,v));}if(p.people)WB.person=a.compare;}
 return p.type;})()"""
summary={}
with sync_playwright() as pw:
  for size in ("ipad","phone"):
    for lid in ["3-7","4-1","4-2","4-3","4-4","4-5"]:
        pg=Page(pw,URL,size); pg.js(make_profile_js("p.revealCurrent='%s';"%lid)); pg.js("renderHome()")
        pg.js(f"renderRevealLesson('{lid}')"); pg.p.wait_for_timeout(300)
        pg.shot(OUT+f"{lid}_{size}_00_review.png",full=True)
        pg.js(f"startReveal('{lid}')"); pg.p.wait_for_timeout(400)
        types=[]; 
        for i in range(10):
            t=pg.js("WB.cur.type"); types.append(t)
            pg.shot(OUT+f"{lid}_{size}_{i+1:02d}_{t}.png",full=True)
            wrong=(i==2)
            pg.js(FILL.replace("WRONG",'true' if wrong else 'false'))
            if t=="form":
                pg.js("""(()=>{const f=WB.cur.answer.f;document.querySelectorAll('[data-k]').forEach(el=>{el.value=f[el.getAttribute('data-k')];wbFormInput(el);});})()""")
            pg.js("wbRefreshSubmit()")
            enabled=pg.js("wbCanSubmit()")
            if not enabled: print("!! cannot submit",lid,size,i,t)
            pg.js("wbSubmit()"); pg.p.wait_for_timeout(250)
            ok=pg.js("document.querySelector('.wb-feedback')&&document.querySelector('.wb-feedback').className")
            if i in(0,2): pg.shot(OUT+f"{lid}_{size}_{i+1:02d}_{t}_feedback.png",full=True)
            if wrong:
                pg.js("wbTryTwin()"); pg.p.wait_for_timeout(250)
                pg.shot(OUT+f"{lid}_{size}_{i+1:02d}_twin.png",full=True)
                pg.js(FILL.replace("WRONG","false"))
                pg.js("""(()=>{if(WB.cur.type==='form'){const f=WB.cur.answer.f;document.querySelectorAll('[data-k]').forEach(el=>{el.value=f[el.getAttribute('data-k')];wbFormInput(el);});}})()""")
                pg.js("wbSubmit()"); pg.p.wait_for_timeout(200)
            pg.js("wbContinue()"); pg.p.wait_for_timeout(200)
        fin=pg.js("document.body.innerText.includes('Practice complete')")
        rec=pg.js("JSON.stringify(P.reveal['%s'])"%lid)
        # overflow check: any element wider than viewport
        print(lid,size,"types:",",".join(types),"| finished:",fin,"| P.reveal:",rec,"| errors:",pg.errors)
        pg.shot(OUT+f"{lid}_{size}_99_finish.png")
        pg.close()
