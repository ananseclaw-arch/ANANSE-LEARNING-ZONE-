import sys,os,json
sys.path.insert(0,'tools')
from lzt import *
OUT=os.path.expanduser('~/staging/lz-notes/declutter/audit/live/');summary=[]
with sync_playwright() as pw:
 for lid in ['4-6','5-1','5-2']:
  for wrong in [False,True]:
   pg=Page(pw,(sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:61094/index.html'));pg.js(make_profile_js());pg.js(f"startReveal('{lid}')")
   failures=[]; didwrong=False; twin=False
   for count in range(30):
    if not pg.js("!!document.querySelector('#mirrorArea input')"): break
    pg.js('S.qStart=Date.now()-60000')
    pg.js("if(S.cur.mirror.split) mirrorCut(1)")
    bad=wrong and not didwrong
    pg.js("""bad=>{const e=mirrorExpected(S.cur.mirror,S.mirrorCut);document.querySelectorAll('#mirrorArea input').forEach((el,i)=>{let v=String(e[i]);if(bad&&i===0)v=String(Number(v)+1);mirrorInput(i,v)});mirrorSubmit()}""".replace('bad=>', '()=>').replace('if(bad&&',f'if({str(bad).lower()}&&'))
    if bad:
     didwrong=True; pg.shot(OUT+f'{lid}_wrong_feedback.png',True)
     if pg.js('S.results[0].correct'):failures.append('wrong marked correct')
     pg.js('oneTryTeach()')
     pg.shot(OUT+f'{lid}_wrong_answer.png',True)
     while pg.js('!!(T && T.from === "wrong" && document.querySelector(".teach-text"))'):
      pg.js('teachNext()')
     twin=pg.js('!!S.cur.twin');pg.shot(OUT+f'{lid}_wrong_twin.png',True)
     if not twin:failures.append('no twin')
    else:
     pg.js('nextQuestion()')
   score=pg.js("({record:P.reveal['"+lid+"'],body:document.body.innerText.slice(0,500)})")
   pg.shot(OUT+f'{lid}_{"wrong" if wrong else "correct"}_finish.png',True)
   if not score['record'] or score['record']['last']!=(9 if wrong else 10):failures.append('bad score or unfinished')
   summary.append({'lesson':lid,'wrong':wrong,'score':score,'failures':failures,'errors':pg.errors});print(summary[-1],flush=True);pg.close()
open(OUT+'mirror_results.json','w').write(json.dumps(summary,indent=2))
