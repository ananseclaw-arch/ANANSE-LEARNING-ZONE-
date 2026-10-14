# Workbook Practice

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

- `lessons`: metadata for the five workbook lessons.
- `gen(lessonId, n)`: returns `n` freshly generated problem objects.
- `check(problem, answer)`: checks all six problem formats.

## Functions

Generator and data helpers:

- `wbRand`, `wbPick`, `wbShuffle`, `wbName`, `wbFactor`, `wbEq`, `wbBase`, `wbAnswerObject`, `wbModelForDivision`, `wbStory`, `wbFill`, `wbPicture`, `wbMulti`
- `wbGen35`, `wbGen36`, `wbGen37`, `wbDoubleMulti`, `wbGen41`, `wbFiveMulti`, `wbGen42`, `wbGenerate`, `wbSameArray`, `wbCheck`

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
3. Pick lesson 3-5, 3-6, 3-7, 4-1, or 4-2.

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
