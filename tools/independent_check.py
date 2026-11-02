#!/usr/bin/env python3
"""Partial independent arithmetic audit of question dumps; explicitly reports unsupported cases.

No application logic is imported. Equations are evaluated from the displayed text.
This is not a substitute for story, open-response, or live-checker testing.
"""
import ast, json, operator, re
from collections import Counter
from pathlib import Path

IDS = ['3-7','4-1','4-2','4-3','4-4','4-5','4-6','5-1','5-2']
DIR = Path.home() / 'staging/lz-notes/declutter/audit'
OPS = {ast.Add: operator.add, ast.Mult: operator.mul, ast.Div: operator.truediv}
def value(text):
    text = text.replace('×','*').replace('÷','/').strip()
    def calc(n):
        if isinstance(n, ast.Constant) and type(n.value) is int: return n.value
        if isinstance(n, ast.BinOp) and type(n.op) in OPS: return OPS[type(n.op)](calc(n.left), calc(n.right))
        raise ValueError(text)
    return calc(ast.parse(text, mode='eval').body)
def equation(text):
    sides = text.split('=')
    return len(sides)==2 and value(sides[0])==value(sides[1])

def story_answer(lid, text):
    """Derive story totals from the prose; return None for an unrecognized template."""
    nums = [int(x) for x in re.findall(r"\b\d+\b", text)]
    if lid == "3-7":
        if re.search(r"and \d+ (?:friends|teammates)", text):
            return nums[1] // (nums[0] + 1) if nums[1] % (nums[0] + 1) == 0 else None
        if len(nums) >= 2 and nums[1] and nums[0] % nums[1] == 0:
            return nums[0] // nums[1]
    if lid in ("4-1", "4-2") and len(nums) == 2:
        return nums[0] * nums[1]
    if lid == "4-3" and len(nums) == 2:
        return nums[0] * nums[1]
    if lid == "4-4":
        if len(nums) == 2: return nums[0] * nums[1]
        if len(nums) == 3 and nums[1] == nums[2]: return nums[0] * nums[1]
    if lid == "4-5":
        if len(nums) == 2: return nums[0] * nums[1]
        if len(nums) == 1 and "five-dollar" in text: return nums[0] * 5
    return None

def main():
    counts=Counter(); misses=[]
    for lid in IDS:
        data=json.loads((DIR / f'questions_{lid}.json').read_text())
        for q in data:
            typ=q['type']; key=f'{lid} #{q["n"]}'; checked=False
            try:
                if typ=='story':
                    derived=story_answer(lid, q['prompt'])
                    if derived is not None:
                        checked=True
                        if derived != q['answer']['value']:
                            misses.append(f'{key}: prose gives {derived}, key gives {q["answer"]["value"]}')
                        counts[f'{lid} stories derived'] += 1
                elif typ=='fill':
                    txt=' '.join(str(q['answer']) if x=='□' else str(x) for x in q['parts'])
                    checked=True
                    if not equation(txt): misses.append(f'{key}: false filled equation {txt}')
                elif typ=='multi':
                    opts=q['problem']['options']; expected=sorted(o['id'] for o in opts if equation(o['text']))
                    checked=True
                    if expected != sorted(q['answer']): misses.append(f'{key}: choices {expected} != {q["answer"]}')
                    if not expected or len(expected)==len(opts): misses.append(f'{key}: missing true/false mixture')
                elif typ=='match':
                    p=q['problem']; checked=True
                    for pair,(_,answer) in zip(p['pairs'],q['answer']):
                        if p.get('rights'):
                            right=p['rights'][answer-1]; nums=re.findall(r'\d+',right)
                            if len(nums)!=2 or nums[0]!=nums[1]: raise ValueError(right)
                            answer=nums[0]
                        txt=pair['left'].replace('□',str(answer))
                        if not equation(txt): misses.append(f'{key}: false match {txt}')
                elif typ in ('mirror','array-split'):
                    # Only equation rows have independently checkable text here.
                    for cut,answers in q['answer'].items():
                        for row in q['rows']:
                            if '=' not in row: continue
                            filled=re.sub(r'\{(\d+)\}',lambda m:str(answers[int(m[1])]),row)
                            checked=True
                            if not equation(filled): misses.append(f'{key} {cut}: false equation {filled}')
                counts[f'{lid} '+('text arithmetic checked' if checked else 'not independently checked')]+=1
            except (ValueError, SyntaxError, IndexError, ZeroDivisionError) as e:
                misses.append(f'{key}: could not evaluate: {e}')
    lines=['Partial independent text audit', *[f'{k}: {v}' for k,v in sorted(counts.items())],f'Mismatches/errors: {len(misses)}',*misses,
           'NOT COVERED: unsupported story templates, non-equation answer lines, free responses, all valid sets and direct app checker tests.']
    print('\n'.join(lines)); (DIR/'independent_check_partial.txt').write_text('\n'.join(lines)+'\n')
    return 1 if misses else 0
if __name__=='__main__': raise SystemExit(main())
