import sys; sys.path.insert(0,'.')
from lzt import *
URL=sys.argv[1] if len(sys.argv)>1 else "http://127.0.0.1:8901/index.html"
OUT='/Users/ananseclaw/staging/lz-notes/declutter/shots/types/'
import os; os.makedirs(OUT,exist_ok=True)
ids=sys.argv[2].split(",") if len(sys.argv)>2 else ["4-6","5-1","5-2"]
with sync_playwright() as pw:
  for size in ("ipad","phone"):
    for lid in ids:
        pg=Page(pw,URL,size); pg.js(make_profile_js()); pg.js("renderHome()")
        pg.js(f"renderRevealLesson('{lid}')"); pg.p.wait_for_timeout(300)
        pg.shot(OUT+f"{lid}_{size}_00_review.png")
        pg.js(f"startReveal('{lid}')"); pg.p.wait_for_timeout(500)
        seen=set()
        for i in range(10):
            if not pg.js("!!(S&&S.cur&&S.cur.mirror)"): break
            m=pg.js("(()=>{const m=S.cur.mirror;return {slot:m.slot,split:!!m.split,n:m.n,head:S.cur.q.slice(0,70)}})()")
            pg.shot(OUT+f"{lid}_{size}_{i+1:02d}_slot{m['slot']}.png",full=True)
            # answer correctly
            pg.js("S.qStart=Date.now()-60000")
            if m['split']:
                pg.js("mirrorCut(%d)"%max(1,m['n']//2)); 
            pg.js("""(()=>{const m=S.cur.mirror;const e=mirrorExpected(m,S.mirrorCut);const inputs=document.querySelectorAll('#mirrorArea input');inputs.forEach((el,i)=>{el.value=String(e[i]);mirrorInput(i,String(e[i]));});})()""")
            pg.js("mirrorSubmit()"); pg.p.wait_for_timeout(500)
            # go next
            clicked=pg.js("""(()=>{const b=[...document.querySelectorAll('button')].find(b=>/^(next|continue|keep going|see)/i.test(b.textContent.trim())&&!b.disabled);if(b){b.click();return b.textContent.trim()}return null})()""")
            pg.p.wait_for_timeout(500)
        print(lid,size,"questions shot:",len(os.listdir(OUT)),"errors:",pg.errors); pg.close()
