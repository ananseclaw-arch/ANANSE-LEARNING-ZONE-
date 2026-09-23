#!/usr/bin/env python3
"""Pre-record every fixed phrase Ananse says (index.html + lessons.js), using free Microsoft neural TTS.

WHY: the app used the device's built-in voice. Most phones/iPads ship only the
basic compact voice, so Ananse sounded robotic and there was no way to fix that
from code. Shipping real audio makes the voice identical on every device, with
no downloads, no settings and no network at runtime.

Extracts phrases straight from index.html (say() literals, bank questions,
teach steps, practice questions), renders each to MP3 named by a hash of the
text, and writes voice/manifest.json mapping text -> file.

Re-runnable: existing clips are skipped, so new phrases cost only their own
render time.
"""
import asyncio
import hashlib
import json
import os
import re
import sys

import edge_tts

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "index.html")
OUTDIR = os.path.join(HERE, "voice")
MANIFEST = os.path.join(OUTDIR, "manifest.json")

VOICE = "en-US-MichelleNeural"
RATE = "+8%"      # the default neural pace reads a touch slow for kids
PITCH = "+0Hz"
CONCURRENCY = 4   # be polite to the free endpoint


def key_for(text):
    return hashlib.sha1(text.encode("utf-8")).hexdigest()[:16]


def unescape_js(s):
    """Undo the JS string escaping used inside index.html."""
    return (s.replace("\\'", "'")
             .replace('\\"', '"')
             .replace("\\n", " ")
             .replace("\\\\", "\\"))


def speakable(s):
    """Same normalisation the app applies before speaking."""
    s = re.sub(r"[*_#]", "", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def extract_phrases(html):
    phrases = set()

    # 1. literal say("...") calls
    for m in re.finditer(r'say\(\s*"((?:[^"\\]|\\.){3,300})"\s*\)', html):
        phrases.add(unescape_js(m.group(1)))

    # 2. the question bank: questions, teach steps, practice questions
    start = html.find("BANK={")
    if start >= 0:
        start += 6
        depth, k = 1, start
        while k < len(html) and depth > 0:
            if html[k] == "{":
                depth += 1
            elif html[k] == "}":
                depth -= 1
            k += 1
        bank = html[start:k]
        for m in re.finditer(r'\bq:\s*"((?:[^"\\]|\\.){3,400})"', bank):
            phrases.add(unescape_js(m.group(1)))
        for m in re.finditer(r'\bt:\s*"((?:[^"\\]|\\.){3,400})"', bank):
            phrases.add(unescape_js(m.group(1)))

    # 3. grade lessons (lessons.js): questions, teach steps, intros, story text
    lessons_path = os.path.join(HERE, "lessons.js")
    if os.path.exists(lessons_path):
        lj = open(lessons_path, errors="ignore").read()
        for m in re.finditer(r'\b(?:q|t|intro|title|text):\s*"((?:[^"\\]|\\.){3,1200})"', lj):
            phrases.add(unescape_js(m.group(1)))

    cleaned = set()
    for p in phrases:
        p = speakable(p)
        # skip anything with runtime interpolation — it differs per child
        if not p or '"+' in p or "+\"" in p:
            continue
        if len(p) < 4 or len(p) > 1200:
            continue
        cleaned.add(p)
    return sorted(cleaned)


async def render(text, path, sem):
    async with sem:
        for attempt in range(3):
            try:
                c = edge_tts.Communicate(text, VOICE, rate=RATE, pitch=PITCH)
                await c.save(path)
                if os.path.getsize(path) > 1500:
                    return True
            except Exception as e:
                if attempt == 2:
                    print(f"  ! failed: {text[:50]}… {e}", flush=True)
                await asyncio.sleep(2 * (attempt + 1))
        return False


async def main():
    html = open(SRC, errors="ignore").read()
    phrases = extract_phrases(html)
    os.makedirs(OUTDIR, exist_ok=True)

    manifest = {}
    if os.path.exists(MANIFEST):
        try:
            manifest = json.load(open(MANIFEST))
        except Exception:
            manifest = {}

    todo = []
    for p in phrases:
        k = key_for(p)
        path = os.path.join(OUTDIR, k + ".mp3")
        manifest[p] = k + ".mp3"
        if not (os.path.exists(path) and os.path.getsize(path) > 1500):
            todo.append((p, path))

    print(f"phrases found : {len(phrases)}")
    print(f"already done  : {len(phrases)-len(todo)}")
    print(f"to render     : {len(todo)}  (voice {VOICE})")
    if not todo:
        json.dump(manifest, open(MANIFEST, "w"), ensure_ascii=False, indent=0)
        print("nothing to do")
        return

    sem = asyncio.Semaphore(CONCURRENCY)
    done = 0
    for i in range(0, len(todo), 40):
        batch = todo[i:i + 40]
        await asyncio.gather(*(render(t, p, sem) for t, p in batch))
        done += len(batch)
        json.dump(manifest, open(MANIFEST, "w"), ensure_ascii=False, indent=0)
        print(f"  rendered {done}/{len(todo)}", flush=True)

    ok = sum(1 for p in phrases
             if os.path.exists(os.path.join(OUTDIR, key_for(p) + ".mp3")))
    total_mb = sum(os.path.getsize(os.path.join(OUTDIR, f))
                   for f in os.listdir(OUTDIR) if f.endswith(".mp3")) / 1048576
    print(f"\nDONE  clips={ok}/{len(phrases)}  size={total_mb:.1f} MB")


if __name__ == "__main__":
    asyncio.run(main())
