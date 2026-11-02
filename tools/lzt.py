"""Shared headless-Chrome helpers for the declutter build tests."""
import json, sys
from playwright.sync_api import sync_playwright
SIZES={"ipad":(1180,820),"phone":(390,844)}
class Page:
    def __init__(self,pw,url,size="ipad",seed=None,init=None,block_external=True):
        self.b=pw.chromium.launch(channel="chrome")
        w,h=SIZES[size]
        self.ctx=self.b.new_context(viewport={"width":w,"height":h},device_scale_factor=1)
        self.errors=[]
        if init: self.ctx.add_init_script(init)
        self.p=self.ctx.new_page()
        self.p.on("pageerror",lambda e:self.errors.append("pageerror: "+str(e)))
        self.p.on("console",lambda m:self.errors.append("console.error: "+m.text) if m.type=="error" and "Failed to load resource" not in m.text else None)
        if block_external:
            def route(r):
                u=r.request.url
                if u.startswith("http://127.0.0.1") or u.startswith("data:") or u.startswith("blob:"): return r.continue_()
                return r.abort()
            self.ctx.route("**/*",route)
        self.p.goto(url); self.p.wait_for_timeout(600)
    def js(self,code): return self.p.evaluate(code)
    def shot(self,path,full=False): self.p.screenshot(path=path,full_page=full)
    def close(self): self.b.close()
SEED_JS="""
(()=>{
 if(window.__seeded)return;
})();
"""
def make_profile_js(extra=""):
    return """(()=>{ const p=newProfile('Test',''); p.grade=3; p.diagDone=true; p.color='#4aa3e0'; %s
      DB.profiles=[p]; DB.lastProfile=p.id; P=p; save(); return p.id; })()""" % extra
