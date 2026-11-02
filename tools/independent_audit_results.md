# Independent field audit, 2026-11-02

The arithmetic-only partial audit covers 378 dumped questions. The additional checks cover the 54 previously unchecked 4-5 forms in a 60-question dump, their non-reason fields, all mirror lesson slots and parameter combinations, and open numeric/equation answer sets. They call the actual inlined workbook checker or the mirror checker. Reasons are held at model values and were not audited in this pass.

- `check_45_independent.js`: 4,101 checks, zero mismatches. The six story answers are covered by `independent_check.py`.
- `check_mirror_independent.js`: 68,306 checks, zero mismatches. Story totals and all array splits, factor orders and partial-product orders are derived independently; wrong values are tested too.
- `check_alternatives.js`: 21,839 checks, zero mismatches, including whole-number zero products through 9,999, factor pairs, repeated addition and multiplication orders, and bounded multiples.

Several prompts previously promised unrestricted numbers although the checker and input have finite limits. The prompts now state the accepted ranges. The 4-5 factor-pair enumeration is included in the 4-5 script. These checks test numeric alternatives and the specified equation forms; they do not claim to enumerate every possible text spelling or expression syntax.

The source `workbook.js` retains the separately committed, unfinished reason-checker changes; the inlined application reason checker remains as it was. Do not regenerate the inline workbook from the source until the owner decides how reasons should be marked.
