import sys,os,json,ast
sys.path.insert(0,'tools')
from lzt import *
source=open('tools/wb_shots.py').read(); tree=ast.parse(source); FILL=next(ast.literal_eval(n.value) for n in tree.body if isinstance(n,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='FILL' for t in n.targets))
OUT=os.path.expanduser('~/staging/lz-notes/declutter/audit/live/');os.makedirs(OUT,exist_ok=True)
summary=[]
with sync_playwright() as pw:
 for lid in ['4-5']:
  for wrong in [True]:
   pg=Page(pw,(sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:61094/index.html')); pg.js(make_profile_js());pg.js(f"startReveal('{lid}')")
   fail=[]
   def fill(w=False):
    pg.js(FILL.replace('WRONG','true' if w else 'false'))
    pg.js("""(()=>{if(WB.cur.type==='form'){const f=WB.cur.answer.f;document.querySelectorAll('[data-k]').forEach(el=>{el.value=f[el.getAttribute('data-k')];wbFormInput(el);});}})()""")
    if w and pg.js("WB.cur.type==='form'"): pg.js("WB.fields[WB.cur.fields[0].key]='9999'")
    if not pg.js('wbCanSubmit()'): fail.append('cannot submit '+str(pg.js('WB.index')))
    pg.js('wbSubmit()')
   for i in range(10):
    fill(wrong and i==0)
    klass=pg.js("document.querySelector('.wb-feedback')?.className") or ''
    if ('try' if wrong and i==0 else 'good') not in klass: fail.append(f'wrong mark at {i}: {klass}')
    if wrong and i==0:
     pg.shot(OUT+f'{lid}_wrong_feedback.png',True)
     if not pg.js("!!document.querySelector('.wb-teach') && !!document.querySelector('[onclick=\"wbTryTwin()\"]')"): fail.append('missing explanation or twin')
     pg.js('wbTryTwin()');pg.shot(OUT+f'{lid}_wrong_twin.png',True)
     if not pg.js('WB.isTwin'): fail.append('no twin')
     fill()
    pg.js('wbContinue()')
   score=pg.js("document.querySelector('.wb-score')?.textContent")
   pg.shot(OUT+f'{lid}_{"wrong" if wrong else "correct"}_finish.png',True)
   if score!=('9 / 10' if wrong else '10 / 10'):fail.append('score '+str(score))
   summary.append({'lesson':lid,'mode':'wrong' if wrong else 'correct','score':score,'failures':fail,'errors':pg.errors});print(summary[-1],flush=True);pg.close()
open(OUT+'workbook_retry_45_results.json','w').write(json.dumps(summary,indent=2))
