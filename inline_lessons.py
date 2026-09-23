#!/usr/bin/env python3
"""Re-inline lessons.js and lab.js into index.html (run after editing either)."""
import re,os
H=os.path.dirname(os.path.abspath(__file__))
s=open(os.path.join(H,"index.html"),encoding="utf-8").read()
for fn,marker in (("lessons.js","/* lessons.js is inlined here"),("lab.js","/* lab.js is inlined here"),("reveal.js","/* reveal.js is inlined here"),("race.js","/* race.js is inlined here"),("race3d.js","/* race3d.js is inlined here")):
    src=open(os.path.join(H,fn),encoding="utf-8").read()
    start=s.index(marker)
    a=s.index("\n",start)+1
    b=s.index("\n</script>",a)
    s=s[:a]+src+s[b:]
    print("inlined",fn,len(src),"chars")
open(os.path.join(H,"index.html"),"w",encoding="utf-8").write(s)
