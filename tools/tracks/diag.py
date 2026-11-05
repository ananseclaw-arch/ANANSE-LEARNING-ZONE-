import json,math,sys
for r in json.load(open(sys.argv[1])):
    if len(sys.argv)>2 and r['id'] not in sys.argv[2].split(','): continue
    segs0=[list(s) for s in r['segs']]
    h=0;x=z=0;D={};fl=al=0
    for i,s in enumerate(segs0):
        if s[0]=='S':
            if s[1]=='?': s[1]=[40,380]
            if isinstance(s[1],list): D.setdefault(round(math.degrees(h))%360,[]).append((i,s[1]))
            else: x+=math.sin(h)*s[1]; z-=math.cos(h)*s[1]; fl+=s[1]
        else:
            R,deg=s[1],s[2];sg=1 if s[0]=='R' else -1;n=400;st=R*math.radians(deg)/n;al+=R*math.radians(deg)
            for _ in range(n): hm=h+sg*st/R/2;x+=math.sin(hm)*st;z-=math.cos(hm)*st;h+=sg*st/R
    print(r['id'],'base east',round(x),'south',round(z),'fixed+arc',round(fl+al),'need adj',r['target']-round(fl+al))
    for k in sorted(D): print('   hdg',k,'sum range',sum(a[1][0] for a in D[k]),sum(a[1][1] for a in D[k]),'segs',[a[0] for a in D[k]])
