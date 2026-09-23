# Maintaining the Ananse Learning Zone

For any agent or person keeping the app healthy and adjusting content.
Live site: https://ananseclaw-arch.github.io/ANANSE-LEARNING-ZONE-/ (GitHub Pages, `main` branch, root).

## Where things live

| What | File | Notes |
|---|---|---|
| App shell, engine, UI, base question bank | `index.html` | Single page. Base bank is `BANK={reading,science,history}` near the top of the second script block. |
| Grade 3–5 lessons (Maryland standards) | `lessons.js` | Source of truth. **Inlined** into `index.html` by `inline_lessons.py`. |
| Science Lab quests | `lab.js` | Same: edit here, then inline. |
| Reveal Math generators (Grade 3, units 2–13) | `reveal.js` | Same: edit here, then inline. |
| Recorded voice | `voice/*.mp3`, `voice/manifest.json` | Built by `build_voice.py` (needs `pip install edge-tts`, network). |
| Offline cache | `sw.js` | Bump `CACHE` version on every deploy. |
| Icons / mascot | `icon-*.png`, `ananse-lion.png` | |

`index.html` is what ships. `lessons.js`, `lab.js`, `reveal.js` exist so content is easy to edit; **never edit the inlined copies inside `index.html` directly** — edit the source file and run `python3 inline_lessons.py`.

## The release checklist (do all of it, in order)

```bash
cd "/Users/ananseclaw/Documents/LIFE COACH/ANANSE-LEARNING-ZONE-"
python3 inline_lessons.py          # if lessons.js / lab.js / reveal.js changed
python3 check.py                   # syntax + content validation; must print ALL CHECKS PASSED
python3 build_voice.py             # optional but recommended when spoken text changed (say(), q:, t:, intro:, mystery:, review cards)
# bump the cache version in sw.js:  const CACHE = "learning-zone-vNN";  -> vNN+1
git add -A && git commit -m "..." && git push origin main
```

GitHub Pages deploys in about a minute. Verify with:

```bash
curl -s -H "Cache-Control: no-cache" https://ananseclaw-arch.github.io/ANANSE-LEARNING-ZONE-/sw.js | head -1
```

If the cache version is not bumped, installed iPads keep the old copy until their next full reload.

## Content rules (the engine relies on these)

- Every question: `{q, opts, a, topic, teach:[{i,t},{i,t},{i,t}]}`.
  - `opts`: 3 or 4 **distinct** strings. `a` is the index of the correct one.
  - In `lessons.js` and `lab.js` the correct answer is always `opts[0]` (`a:0`); the app shuffles.
  - `teach`: 2–3 short hint steps, last one gives the answer. Shown by "Ananse, help me" and after a miss.
  - Optional `practice:{q,opts,a}` — a similar follow-up after the teaching.
  - Optional `vis` (HTML string) — a picture shown under the question (used by Reveal Math).
- Topics feed spaced repetition. Reuse existing topic names where possible; new lesson topics must be added to `LESSON_TOPIC_SUBJECT` in `lessons.js` so the engine knows the subject.
- Comprehension lessons carry `story:{title,text}` and no teach cards; the story is always shown before its questions.
- Reveal Math: each lesson maps to a generator in `RV_GEN` (`g:` field). Generators must return fresh random problems every call and never produce duplicate options (`check.py` tests 40 draws per lesson).
- Keep language at a 3rd–5th grade reading level, one idea per sentence, basketball / Ghana / Maryland flavour welcome.
- **Do not copy text from the Reveal Math practice book or any other published material.** Lesson and unit *names* may match; problems must be original.
- Never reintroduce spider references — the mascot is Ananse the Wise Lion.

## Data stored on the device

`localStorage["plz_v1"]` holds everything: profiles, levels, sessions, lessons, lab, reveal, nature journal, parent PIN, settings. Profile fields added over time are back-filled at load (search for `back-fill` / `fill in fields older profiles lack` in `index.html`). If you add a profile field, add it to `newProfile()` **and** to that migration line. Parents can export/import this as a JSON backup from the portal.

## Quick health checks an agent can run

- `python3 check.py` — syntax of every script block, lesson/lab data shape, 40 generated problems per Reveal lesson, no "spider" in shipped text, service-worker version consistency.
- Load the live URL in a headless browser and confirm `typeof LESSONS==="object" && typeof LABS==="object" && typeof REVEAL_LESSONS==="object"` and no console errors.
- Voice: `voice/manifest.json` keys should cover the spoken phrases; missing clips fall back to device TTS (not a failure, just less consistent).

## Things that intentionally need a human

- Pl@ntNet API key (parent portal) for plant photo ID.
- Telegram bot token/chat id for daily reports.
- The "where the class is" Reveal Math lesson — a parent sets it as the class moves.
