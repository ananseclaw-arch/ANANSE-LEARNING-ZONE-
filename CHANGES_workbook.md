# Workbook Practice

## Pass 2 — Lessons 3-1 to 3-4

- Added lessons **3-1 Understand Equal Groups**, **3-2 Use Arrays to Multiply**, **3-3 Commutative Property**, and **3-4 Understand Equal Sharing** ahead of the five Pass 1 lessons in the Workbook Practice picker.
- Added fresh-number problem sets matching pages 25–31: required equal-group builds, picture-to-equation prompts, array equations, repeated-addition arrays, draw/equation/answer stories, equal-product reasoning, equal sharing, and the requested answerable money/site questions.
- Added the `pair` problem type for Lesson 3-3. It shows two independent Build-it models side by side, checks each model, accepts the shared product, and supports the two-equation/“who has more?” pen comparison.
- Array prompts that may be turned accept either row/column orientation; the chairs prompt requires the alternate built array while accepting either commutative equation order.
- Lesson 3-4 uses exact division only. Its required Build-it model always has the divisor as the number of groups and the quotient as the number in each group.
- Extended `window.__wb.lessons`, `window.__wb.gen`, and `window.__wb.check` to all nine lessons and the `pair` format.
- Added **Workbook practice for this lesson** to Reveal lesson screens 3-1 through 3-4 and updated the Explore tile range to 3-1 through 4-2.
- Kept learner data under `P.workbook`; no drawing data is stored locally.

### Pass 2 verification

- [x] Generated and checked 36,000 problems across all nine lessons; every stored answer key was accepted by `window.__wb.check`.
- [x] Verified multiplication/division arithmetic, exact Lesson 3-4 sharing, products/totals no greater than 100, and eight problems per session.
- [x] Verified both `pair` models are required, generated commutative factors are distinct, and allowed turned arrays/equations are accepted.
- [x] Ran `node --check` on `workbook.js`, the standalone modules, and every inline script block after rerunning `inline_lessons.py`.
- [x] Confirmed `sw.js`, `voice/`, `tutor.json`, `focus.json`, and `flashcards.json` were not changed.

## What was built

- Added a standalone `workbook.js` module for original, generated Reveal Math Grade 3 practice matching the structure of lessons 3-5, 3-6, 3-7, 4-1, and 4-2.
- Added an Explore tile named **📒 Workbook Practice** and a **Workbook practice for this lesson** button on the five matching Reveal lesson screens.
- Added a lesson picker with each lesson's best score, a workbook-style Review page, eight numbered problems per session, teacher-style feedback, fresh retry twins after misses, and an above-the-fold finish screen.
- Added all requested problem renderers: number-box fill-in, choose-all multi-select, SVG picture/equation, story/equation/unit answer, tap-or-drag matching, and error analysis.
- Added SVG equal-group, dot-array, bowl, and egg-carton pictures.
- Added a large on-screen number pad with digits, backspace, and check keys.
- Added **Build it** and **Draw it** work tabs. Build it supports tappable equal groups and row/column arrays. Draw it supports pointer/touch/Apple Pencil input, pen, eraser, clear, and two ink colours.
- Required-work prompts keep the answer locked until the constructed model matches or the learner makes several drawing strokes. Other work areas remain optional.
- Added optional drawing delivery through `window.lzSendWork(meta, dataUrl)`. The JPEG is white-backed, no more than 600 pixels wide, quality `0.6`, sent only when a tutor/voice base URL exists, and never saved to localStorage.
- Added `<style id="workbook">`; `workbook.js` fills it with responsive, explicit dark-on-white workbook styling.
- Updated `inline_lessons.py` to inline `workbook.js`, then regenerated `index.html`.
- Existing `RV_GEN` and `RV_WP` generators were not changed.

## Data added to `P`

Only one new top-level learner field is added lazily:

```js
P.workbook = {
  best: {
    "3-5": 0 // highest score out of 8; other lesson IDs are added after play
  },
  log: [
    {
      lesson: "3-5",
      type: "story",
      q: "generated question text",
      answer: { eq: [24, 3, 8], value: 8 },
      correct: true,
      built: { groups: 8, size: 3 }, // or { rows, cols }, or null
      drew: false,
      at: "ISO timestamp"
    }
  ]
}
```

`P.workbook.log` is capped at the newest 2,000 entries. Drawings are not stored. Each submitted workbook answer is also sent through the existing `logQuestion()` path with topic `reveal <lessonId> workbook`, so it appears in `P.qlog` and the nightly report.

## Public test API

`window.__wb` exposes:

- `lessons`: metadata for all nine workbook lessons.
- `gen(lessonId, n)`: returns `n` freshly generated problem objects.
- `check(problem, answer)`: checks all seven problem formats, including `pair`.

## Functions

Generator and data helpers:

- `wbRand`, `wbPick`, `wbShuffle`, `wbName`, `wbFactor`, `wbEq`, `wbBase`, `wbAnswerObject`, `wbModelForDivision`, `wbStory`, `wbFill`, `wbPicture`, `wbMulti`, `wbPair`
- `wbGen31`, `wbGen32`, `wbGen33`, `wbGen34`, `wbGen35`, `wbGen36`, `wbGen37`, `wbDoubleMulti`, `wbGen41`, `wbFiveMulti`, `wbGen42`, `wbGenerate`, `wbSameArray`, `wbEquationMatches`, `wbCheck`

Style, persistence, SVG, and entry screens:

- `wbInstallStyle`, `wbEscape`, `wbData`, `wbDotPositions`, `wbVisual`, `wbPageHead`
- `renderWorkbookPicker`, `renderWorkbookLesson`, `wbStart`, `wbLoadProblem`

Problem and answer rendering:

- `wbNeedsWork`, `wbModelMatches`, `wbWorkDone`, `wbFieldButton`, `wbFillHTML`, `wbEquationHTML`, `wbAnswerLine`, `wbQuestionAnswerHTML`, `wbMultiHTML`, `wbMatchHTML`, `wbNumberPad`, `wbCanSubmit`, `wbSubmitButton`, `wbRenderProblem`

Show-your-work tools:

- `wbWorkHTML`, `wbBuildHTML`, `wbBuildHint`, `wbDrawHTML`, `wbWorkTab`, `wbRefreshWork`, `wbAddGroup`, `wbGroupDot`, `wbBuildClear`, `wbArrayStep`, `wbBuiltRecord`
- `wbInitCanvas`, `wbTool`, `wbColor`, `wbRememberCanvas`, `wbCanvasClear`, `wbCanvasJpeg`, `wbSendDrawing`

Input, checking, feedback, and completion:

- `wbActivate`, `wbKey`, `wbUpdateFieldButtons`, `wbRefreshSubmit`, `wbToggleMulti`, `wbPickPerson`, `wbMatchTap`, `wbDrag`, `wbDrop`
- `wbCollectAnswer`, `wbCompactAnswer`, `wbSubmit`, `wbCorrectEquation`, `wbCorrectAnswerHTML`, `wbRenderFeedback`, `wbTryTwin`, `wbContinue`, `wbFinish`

Integration changes were made inside the existing `renderHome` and `renderRevealLesson` functions.

## How to open it

1. Open the app and choose a learner.
2. In **Explore**, tap **📒 Workbook Practice**.
3. Pick any lesson from 3-1 through 3-7, 4-1, or 4-2.

Alternatively, open any of those lessons under **Reveal Math** and tap **Workbook practice for this lesson**.

## Self-test list

- [x] Generated 20,000 problems across all five lessons and verified every displayed multiplication/division equation against its computed key.
- [x] Verified exact division for ordinary problems and quotient-plus-remainder arithmetic for leftover problems.
- [x] Verified `window.__wb.check(problem, problem.answer)` for every generated format.
- [x] Verified factors stay at 0–10 and products/totals stay at or below 100.
- [x] Verified every session generator returns exactly eight problems with the intended mix of types.
- [x] Ran `node --check workbook.js`.
- [x] Extracted and ran `node --check` on every inline `<script>` block in `index.html`.
- [x] Verified `workbook.js` is inlined by `inline_lessons.py` and the generated block matches the source.
- [x] Verified required-work answer locking, exact multi-select checking, tap/drag pair checking, wrong-answer retry twins, score persistence, 2,000-log cap, and `P.qlog` routing by code-path inspection and headless state tests.
- [x] Verified all workbook buttons are at least 56px where required and the landscape layout splits question/work from the number pad so the primary action remains visible at 1180×820; portrait returns to a single column for 820×1180.
- [x] Confirmed no changes to `sw.js`, `voice/`, `tutor.json`, `focus.json`, or `flashcards.json`.
