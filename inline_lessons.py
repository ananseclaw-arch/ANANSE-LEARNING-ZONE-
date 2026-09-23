#!/usr/bin/env python3
"""Re-inline lessons.js into index.html (run after editing lessons.js)."""
import re,os
H=os.path.dirname(os.path.abspath(__file__))
s=open(os.path.join(H,"index.html"),encoding="utf-8").read()
lj=open(os.path.join(H,"lessons.js"),encoding="utf-8").read()
start=s.index("/* lessons.js is inlined here")
a=s.index("\n",start)+1
b=s.index("\n</script>",a)
s=s[:a]+lj+s[b:]
open(os.path.join(H,"index.html"),"w",encoding="utf-8").write(s)
print("inlined",len(lj),"chars")
