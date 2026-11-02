# Reveal workbook mirror: lessons 4-6, 5-1, and 5-2

## Scope and contract

The actual Reveal Start practice session uses the workbook formats. The existing Reveal review remains first, and its 4-6 note covers both multiplication and division. Preserve the existing one-try, typed-answer, scoring, and session flow. Do not change the service worker, voice assets, tutor, focus, or flashcard data. Staging only; no deployment, push, or commit.

## Questions

Each fresh session has ten primary questions. 4-6 uses four equation pairs (`g × □ = total`, `total ÷ g = □`), two sharing stories asking for both equations and the answer, and four sharing stories asking for the answer. The boxes are numeric; units are printed alongside the answer, not typed. A drawing is optional and unscored. The heading follows the corresponding workbook instruction. Factors are 1–10, products at most 100.

5-1 presents a continuous array of r rows and c columns (2–10 each). The learner chooses any boundary between columns, with positive parts a and b. Its three lines are `r × c = □ × □ + □ × □`, `r × c = □ + □`, and `r × c = □`. Each numeric box is independently entered; checking uses the chosen split and accepts either ordering of the two products. Changing the split before submission changes the expected decomposition. The review example is 3 × 4 = 3 × 2 + 3 × 2 = 6 + 6 = 12, with three rows of four dots and a boundary after two columns. The split controls have spoken labels and visible selected state.

5-2 uses ten templates, including `3 × n = □ × 3` and `n × □ = 3 × n`, with fresh values of n, plus product, missing-factor, and answer-on-left variants. Each has one uniquely determined numeric answer. Values vary from 1 to 10 and products do not exceed 100.

## Answer and session model

A question carries ordered rows of literal text and indexed numeric blanks, and a list of expected values. State maps each blank index to its independently typed value. Every blank must be filled before submission; all are checked together in one attempt. For a split array the expected values are derived from the selected boundary, and equivalent reversed terms are accepted. Feedback supplies completed equations. The existing answer flow records one result and handles wrong-answer teaching and a fresh twin. The drawing or scratchpad is optional and does not affect scoring.

Session allocation reserves distinct mathematical instances for every primary, teaching twin, comeback, and rushed replacement before play. Signatures include template and operands, not names. Finite shuffled pools are allocated without replacement; if allocation cannot complete it fails visibly rather than silently repeating. Twins and comebacks are excluded from primary scoring. The fixed 3 = □ × 1 template uses a different multiplication template for its retries, because it has no alternative numeric instance. This reservation prevents later slots exhausting twin candidates even under adversarial pool orderings.

## Checkpoints and verification

1. Reconcile this design and review findings with the brief and current one-try flow.
2. Implement pure generators, allocation, and numeric checking; independently test at least 500 instances per lesson, all templates, boundaries, wrong and empty fields, alternative splits, and all-miss sessions with reserved twins.
3. Integrate with Reveal, its review, keypad, feedback, and existing scoring; run Node syntax checks and inline source parity checks.
4. Test in a real browser at 390 × 844 and 1180 × 820, including each question type, split selection, incomplete input, one-try feedback, and twins; capture screenshots and report results and any limitations in BUILD_REPORT.md.

The structural review's unspecified external standard cannot be assessed; this document explicitly records scope, data, interaction, and verification decisions.
