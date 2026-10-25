# Homework Help: teach the principle

## Pass 1

- Homework plans now begin with a short `rule` card. It teaches the general idea in kid-friendly words, works a different-number example, and can draw a simple SVG number line for rounding or place value.
- Each new-plan step is a question about one small action. The expected answer is never printed as a standalone number in the question.
- New steps use 2–4 large tap choices. A large on-screen number pad is available as a defensive fallback when a new step has no choices.
- A correct response shows a green tick and the step's `why` principle. The first wrong response shows the non-answer `hint`; the second wrong response calmly shows the answer and `why`.
- After the final worksheet answer, Prince answers a three-choice “Explain it back” question before the existing two-practice-problem flow.
- Homework logs now include:
  - `first_try`: number of steps answered correctly on the first response.
  - `explain_ok`: `true` or `false` for the explain-back response (`null` if it was not reached).
- Old cached plans without `rule`, new step fields, and top-level `explain` continue through the previous Homework Help UI.

## Server safeguards

- Plans must contain 1–6 steps.
- Every step must have `ask`, `answer`, 2–4 unique `choices` containing the exact answer, `why`, and `hint`.
- Every `ask` must be a question and may not contain its numeric answer as a standalone number.
- Numeric step, final, and practice answers are checked with `safe_eval`; whole-number constraints remain in place.
- Rule text is limited to two short sentences. A worked example must use numbers different from the photographed problem.
- Rounding/place-value plans require a valid number-line visual with `from < to` and `value` on the line.
- Explain-back data must have exactly three distinct choices and a valid zero-based answer index.
- Validation errors still feed the existing retry-with-errors provider loop. The provider order remains Claude → ChatGPT → Gemini, and photos are still never stored.

## How to test

From `~/staging/lz-help`:

```sh
# Compile and run the server module's hand-written good/leaking-plan self-test.
python3 -m py_compile ../lz-help-server/homework.py
python3 ../lz-help-server/homework.py

# Extract every executable script block and syntax-check each one.
# Skip only script tags whose type is application/json.
check_dir=$(mktemp -d)
python3 - "$check_dir" <<'PY'
import pathlib, re, sys
text = pathlib.Path("index.html").read_text(encoding="utf-8")
out = pathlib.Path(sys.argv[1])
blocks = re.findall(r"<script\b([^>]*)>(.*?)</script\s*>", text, flags=re.I | re.S)
count = 0
for attrs, body in blocks:
    if re.search(r"\btype\s*=\s*[\"']application/json[\"']", attrs, flags=re.I):
        continue
    count += 1
    (out / ("script-%03d.js" % count)).write_text(body, encoding="utf-8")
print("Checking %d executable script blocks" % count)
PY
for js in "$check_dir"/*.js; do node --check "$js"; done
```

Expected server self-test output:

```text
homework.py self-test passed
```

Manual iPad checks at both 1180×820 and 820×1180:

1. Photograph/select the problem “Round 326 and 305 to the nearest hundred, then add.”
2. Confirm “Learn the rule” appears before Step 1, uses numbers other than 326 and 305, shows a number line, reads aloud, and has “Got it — try mine.”
3. Confirm each step asks a question and presents large tap choices without revealing the answer in the question.
4. Tap the right choice first: expect a green tick, the `why`, and one increment to `first_try`.
5. On another step, tap a wrong choice: expect only the hint. Tap wrong again: expect the answer and `why`, with supportive wording.
6. Confirm one step fits without page scrolling and all homework buttons are at least 64 px high in both orientations.
7. After the final answer, choose a wrong explanation: expect the correct reason and rule text, followed by the same two-practice-problem flow.
8. Load an old cached plan without the new fields and confirm the previous step display still works.

## Pass 2 — stronger hints and solo practice

- Every newly generated guided step now has exactly three `hints`, ordered from weakest to strongest:
  1. A kid-word reminder of the rule.
  2. The same move worked with different numbers.
  3. Part of Prince's step completed without giving the full answer.
- The Hint button reveals one new hint at a time. Each wrong answer also advances by one hint. The app will not disclose a stuck step's answer and `why` until Prince has made at least two attempts and has seen every hint.
- Cached pass-1 plans with only `hint` still work. The app treats that value as hint 1 and keeps the two-attempt disclosure gate.
- Server validation requires exactly three non-empty hint strings and rejects any hint containing that step's numeric answer as a standalone number. The self-test covers both an answer leak and the wrong hint count.
- The first practice problem after “Explain it back” is now a solo challenge. It shows only the problem and choices/number pad—no rule, steps, or hints.
- A correct solo answer celebrates immediately and records `solo_ok: true`. A wrong answer responds supportively, records `solo_ok: false`, then shows the rule and walks the recovery steps generated for that exact practice problem.
- The second practice problem retains the previous guided flow. `solo_ok` is written into the same homework log entry as `explain_ok`, `first_try`, and the other session totals.

### Pass 2 manual checks

1. On a guided worksheet step, press Hint three times. Confirm the hints appear in order and no answer or `why` is shown before two answer attempts.
2. On another step, answer wrongly three times. Confirm each miss reveals only the next hint; after hint 3, use “Show me the answer” (or try once more) and confirm the answer/`why` was unavailable until both gates were satisfied.
3. Load a cached pass-1 plan containing only `hint`; confirm it behaves as one fallback hint and does not break the question flow.
4. After Explain it back, confirm Practice 1 initially has no rule card, step dots, hint button, or hint text and accepts either tap choices or the number pad.
5. Answer Practice 1 correctly and confirm the celebration plus `solo_ok: true` in the single log payload.
6. In a fresh run, answer Practice 1 wrongly. Confirm supportive wording, then the rule card, then guided steps for that same practice problem; confirm `solo_ok: false`.
7. Confirm Practice 2 still uses its previous one-hint guided flow.
