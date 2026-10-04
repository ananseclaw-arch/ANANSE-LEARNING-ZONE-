# Review fixes

## A. Voice

- Reworked narration into one sequence-aware pipeline using the shared audio element: exact recordings first, then sentence-safe chunks of at most 300 characters through live teacher audio, with device speech only as fallback.
- New speech cancels queued speech and aborts an in-flight `/speak` request. Recorded playback failures are sequence-safe and fall through to live speech before device speech.
- Launch narration now keeps only the newest line until audio unlock and manifest loading complete. The auto-resume double greeting was removed.
- Combined transition preambles with the next question, removed the old mid-session level-up narration race, and made lab/diagnostic advances wait for narration with bounded fallbacks.
- Teacher audio always plays at rate 1. Device speech alone uses the saved rate. The live breaker is now 3 failures / 60 seconds and resets after a successful health check.
- Voice keys now use NFC normalization.

## B. Repeats

- Added `questionSig()` and seven-day, capped `P.mathAsked` history for generated math. Session dedupe and generated practice twins now use signatures rather than prompt wording.
- Added stable story IDs, per-session exclusion, and capped seven-day `P.storyHistory` preference.
- Reveal practice now uses capped `P.revealAsked[lessonId]` signature history, up to 120 generation attempts, and session-level dedupe.
- Warm-ups use a local signature exclusion set, least-recent `P.askedAt` ordering, and skip unavailable topics instead of substituting another skill.
- Grade lessons select least-recent items through capped `P.lessonAsked`, then shuffle the selected set.

## C. Difficulty

- Normal home sessions adjust `S.diff` only after 3 first-try correct answers or 2 first-try misses, clamped to `-1..1`. Fixed lessons, Reveal, warm-ups, and Daily no longer change persistent levels through `answer()`.
- Persistent subject levels now update once at session end from the last 3 eligible sessions using the requested accuracy, answer-count, and review thresholds.
- Reveal starts at a tier based on past lesson accuracy and raises the remaining questions one tier when the first 4 are all first-try correct. Multiplication/division generators use tiered factors and harder missing-factor forms.
- Word-problem mastery now uses accuracy from the latest 3 sessions with word-problem attempts instead of the monotonic strategy stat.
- New and touched histories are capped; session and wrong-answer histories are also trimmed to 300 entries.

## D. Notes

- Existing save keys and fields remain unchanged. New history fields are initialized lazily so older profiles continue to load.
- The story bank has only two stories per level, so a full seven-day no-repeat guarantee is impossible without adding content. Selection never repeats a story within a session and prefers a story not seen in seven days, then relaxes only when necessary.
- Small finite Reveal pools similarly relax the seven-day filter only after 120 failed fresh attempts, while still preventing duplicates inside the current eight-question practice.
- `sw.js`, `voice/`, `tutor.json`, and saved-data keys were not changed.

## E. Question log and parent progress

- Added a capped `P.qlog` history (last 400) for practice, warm-up review, Reveal, grade lessons, Daily Mystery, science lab, and diagnostic answers. Each record includes the question text (capped at 140 characters), first-try result, tries, time, subject, topic, lesson, mode, and timestamp.
- Added non-blocking `syncProgress()` posts to the configured voice server's `/progress` endpoint. The report includes profile totals plus capped sessions, wrong answers, question history, mastery data, school focus, and the app version.
- Progress sync runs after practice sessions, lessons, Reveal, Daily Mystery, labs, diagnostics, and Story Replay. Home-open syncs are limited to once per 10 minutes; failures stay silent and retry on a later trigger.

## F. School focus

- Added root-level `focus.json` with the requested empty 2026-10-04 structure.
- The app fetches `focus.json?t=<timestamp>` with `cache: "no-store"`, validates it, exposes it as global `FOCUS`, and saves the last good copy in `DB.focus` for offline use.
- `sw.js` was not edited. It still needs the same explicit bypass for `focus.json` that it has for `tutor.json`; the timestamp query and `no-store` fetch protect this app version until that change is made.

## G. Today's Plan

- Added a large, iPad-friendly Today's Plan card at the top of both standard and optional 3D home screens, with 3–4 ordered one-tap steps, short reasons, ticks, and a progress bar.
- Plans are deterministic and stored in `P.plan`; they remain unchanged for the whole local date and rebuild only on a new date.
- The plan can include a short review-only warm-up, a prioritized or retry Reveal/grade lesson, a six-question weakest-subject practice, and a rotating Story Replay, Daily Mystery, or race finish.
- Reveal priorities come from `FOCUS.reveal`, then the learner's current/next unmastered Reveal lesson, then an unfinished grade lesson. A last failed lesson is offered again with an encouraging retry line.
- Recent seven-day first-try accuracy chooses practice subjects, with `FOCUS.subjects` breaking ties. Existing session totals are used when question-level history is not available.
- Normal activity completion paths mark matching steps done even when the child starts them outside the plan. Finishing the full plan shows a celebration and a free-play message.
- The plan launch greeting uses `sayAfterUnlock()` once per learner/date.

## Validation

- `python3 inline_lessons.py`
- `node --check` on every non-JSON inline script block from `index.html`
- `node --check` on every repository `.js` file
- Headless deterministic plan cases: brand-new profile, failed mid-Reveal lesson, `FOCUS.reveal` priority, and a same-day all-done plan.
- Mocked `qlog` test: field shape, 140-character question cap, and 400-record history cap.
- Mocked `/progress` test: JSON-only header and 300-session / 150-wrong / 400-question payload caps.
