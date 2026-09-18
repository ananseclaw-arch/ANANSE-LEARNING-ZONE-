#!/usr/bin/env python3
"""Generate Learning Zone questions with the LOCAL model (free, no API tokens).

WHY LOCAL: Eb asked not to burn cloud tokens. deepseek-r1:8b on Ollama does
this fine for structured multiple-choice, provided every item is validated in
code afterwards — an 8B model gets facts wrong often enough that nothing here
should reach a child unchecked.

Writes to questions_generated.json in this folder. Append-only, resumable:
kill it and re-run and it picks up where it stopped.
"""
import json
import os
import random
import re
import sys
import time
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "questions_generated.json")
MODEL = "deepseek-r1:8b"
OLLAMA = "http://127.0.0.1:11434/api/generate"

# Topics taken from the existing bank so generated items slot in cleanly.
TOPICS = {
    "reading": ["vocabulary", "context clues", "inference", "figurative language",
                "grammar", "story structure", "comprehension"],
    "science": ["animals", "human body", "space", "how things work"],
    "history": ["folklore", "ashanti kingdom", "independence", "kente & adinkra",
                "modern ghana", "famous ghanaians"],
}
LEVEL_WORDS = {
    1: "very easy warm-up, one step",
    2: "easy, on grade level for a 3rd grader",
    3: "medium, needs a little thinking",
    4: "harder, two steps of reasoning",
    5: "challenge, multi-step reasoning",
}
SUBJECT_BRIEF = {
    "reading": "READING / ENGLISH (vocabulary, grammar, inference, story sense)",
    "science": "SCIENCE for a curious 8-year-old",
    "history": "GHANA HISTORY AND CULTURE (Ashanti, Ananse folklore, independence, kente, adinkra)",
}


def gen(prompt, npred=1800, temp=0.85):
    payload = {"model": MODEL, "prompt": prompt, "stream": False, "think": False,
               "options": {"temperature": temp, "num_predict": npred}}
    req = urllib.request.Request(
        OLLAMA, data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=900) as r:
        return json.load(r).get("response", "")


def build_prompt(subject, level, topic, n=3):
    return f'''Write {n} multiple-choice questions about {SUBJECT_BRIEF[subject]}.
Topic: "{topic}". Difficulty: {LEVEL_WORDS[level]}.
Reader is 8 years old. Use Ghanaian names (Kofi, Ama, Yaw, Adwoa, Kwesi, Abena) where a name is needed.

Return ONLY a JSON array, no other text. Each item EXACTLY this shape:
{{"q":"the question","opts":["A","B","C","D"],"a":0,"topic":"{topic}","teach":[{{"i":"EMOJI","t":"first teaching step"}},{{"i":"EMOJI","t":"second step"}},{{"i":"EMOJI","t":"third step"}}],"practice":{{"q":"a similar but easier question","opts":["A","B","C"],"a":0}}}}

RULES:
- "a" is the INDEX (0,1,2,3) of the correct option.
- Exactly 4 options. All four must be different. Wrong options must be clearly wrong, not arguable.
- Do NOT use "All of the above" or "None of the above".
- The teach steps must NOT simply state the answer in step 1 — build up to it.
- Each teach step: one emoji in "i", one short sentence in "t".
- Simple words an 8-year-old reads easily.
- Facts must be true.'''


BAD_OPT = re.compile(r'all of the above|none of the above|both a and b', re.I)


def norm(s):
    return re.sub(r'[^a-z0-9]+', ' ', str(s).lower()).strip()


def validate(item, topic, seen):
    """Reject anything malformed. Structure is checkable; facts are not."""
    try:
        q = str(item["q"]).strip()
        opts = [str(o).strip() for o in item["opts"]]
        a = int(item["a"])
    except Exception:
        return None, "shape"
    if not (15 <= len(q) <= 220):
        return None, "q length"
    if len(opts) != 4:
        return None, "opt count"
    if len({norm(o) for o in opts}) != 4:
        return None, "dupe options"
    if not (0 <= a < 4):
        return None, "answer index"
    if any(BAD_OPT.search(o) for o in opts):
        return None, "lazy distractor"
    if any(not o or len(o) > 90 for o in opts):
        return None, "opt length"
    key = norm(q)
    if key in seen:
        return None, "duplicate question"

    teach = item.get("teach") or []
    clean_teach = []
    for st in teach[:3]:
        if isinstance(st, dict) and st.get("t"):
            clean_teach.append({"i": str(st.get("i") or "💡")[:4],
                                "t": str(st["t"]).strip()[:160]})
    if len(clean_teach) < 2:
        return None, "teach steps"
    # step 1 must not hand over the answer verbatim
    if norm(opts[a]) and norm(opts[a]) in norm(clean_teach[0]["t"]):
        return None, "teach gives answer away"

    out = {"q": q, "opts": opts, "a": a, "topic": topic, "teach": clean_teach}

    pr = item.get("practice")
    if isinstance(pr, dict):
        try:
            pq = str(pr["q"]).strip()
            po = [str(o).strip() for o in pr["opts"]]
            pa = int(pr["a"])
            if 10 <= len(pq) <= 200 and 2 <= len(po) <= 4 and 0 <= pa < len(po) \
                    and len({norm(o) for o in po}) == len(po):
                out["practice"] = {"q": pq, "opts": po, "a": pa}
        except Exception:
            pass
    return out, None


def load():
    if os.path.exists(OUT):
        try:
            return json.load(open(OUT))
        except Exception:
            return {}
    return {}


def main():
    target_per_cell = int(sys.argv[1]) if len(sys.argv) > 1 else 6
    store = load()
    seen = {norm(it["q"]) for cell in store.values() for it in cell}
    cells = [(s, l, t) for s in TOPICS for l in range(1, 6) for t in TOPICS[s]]
    random.shuffle(cells)

    made = rejected = 0
    t_start = time.time()
    for subject, level, topic in cells:
        key = f"{subject}|{level}|{topic}"
        have = store.get(key, [])
        if len(have) >= target_per_cell:
            continue
        need = target_per_cell - len(have)
        try:
            raw = gen(build_prompt(subject, level, topic, n=min(4, need + 1)))
        except Exception as e:
            print(f"  ! ollama error {e}", flush=True)
            time.sleep(5)
            continue
        body = re.sub(r'<think>.*?</think>', '', raw, flags=re.S).strip()
        m = re.search(r'\[.*\]', body, re.S)
        if not m:
            rejected += 1
            continue
        try:
            items = json.loads(m.group(0))
        except Exception:
            rejected += 1
            continue
        for it in items if isinstance(items, list) else []:
            if len(have) >= target_per_cell:
                break
            ok, why = validate(it, topic, seen)
            if not ok:
                rejected += 1
                continue
            have.append(ok)
            seen.add(norm(ok["q"]))
            made += 1
        store[key] = have
        json.dump(store, open(OUT, "w"), ensure_ascii=False, indent=1)
        total = sum(len(v) for v in store.values())
        print(f"[{time.time()-t_start:6.0f}s] {key:42} cell={len(have)} "
              f"total={total} made={made} rejected={rejected}", flush=True)

    print(f"\nDONE. kept={made} rejected={rejected} "
          f"total_in_file={sum(len(v) for v in store.values())}")


if __name__ == "__main__":
    main()
