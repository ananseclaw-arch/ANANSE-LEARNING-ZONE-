# Learning Zone: next lesson and declutter

## Goal and learner flow

Make the next Reveal Math lesson the prominent action on home. A card names the lesson and current stage, shows progress dots, and opens the appropriate stage. The unit path remains browsable and distinguishes new, attempted, and mastered lessons. Other subjects retain their existing behavior and remain accessible. A parent can still reach older grade lessons and the standalone workbook; their code and stored results remain intact.

Use the class lesson selected in the parent portal as the starting point, falling back to the first unfinished Reveal lesson. Resume an existing session before starting another. A lesson with a video opens the next unseen video at most once per local day; completion requires 80% watched using the existing player accounting. Seen videos remain replayable. If no video is due, go directly to Review and then practice. A catch-up choice should use recent incorrect question types where a matching video exists, without blocking lessons that lack video. The video manifest is the supplied local JSON, and existing video progress must remain readable.

## Practice

Fold the supplied 4-1 through 4-5 and division p.38 patterns into their matching Reveal lessons. Follow workbook_RULES.md over conflicting individual notes: typed answers, lettered choices only where the book has them, matching by typing, mathematical validation of open equations, and typed explanations with forgiving key ideas and a model explanation. Preserve one-try scoring, feedback, retry allocation and saved records. Adapt the existing 4-6, 5-1 and 5-2 mirror; draw prompts show a drawing area and other scratchpads start closed. Keep screens usable on phone and iPad.

## Data and failure handling

Do not delete or rewrite profile records, lesson IDs, scores, session history, workbook records, or resume data. Add only optional profile fields and default absent fields safely. Video unavailability follows the existing gate's fallback; no manifest entry means no gate. Player callbacks must not credit background time or bypass 80% by seeking. Saved progress remains per profile and video identity. Do not modify service worker, voice, tutor, focus, or flashcards data.

## Implementation Plan

1. Inventory entry points and decisions in PLAN.md in this worktree, because the requested notes directory is outside writable roots.
2. Review this design with a fresh-context EGM reviewer and record actual findings and disposition.
3. Add workbook-derived question generators and typed checks to Reveal's existing session and feedback model. Keep original generators and standalone workbook available.
4. Port the video gate from e73dc56 and apply the local manifest, daily scheduling, replay and catch-up without changing other subjects.
5. Replace duplicated math home links with an up-next card and unit path; expose older material to parents and preserve other subject links.
6. Re-inline changed standalone modules, run syntax checks, and report what was and was not verified. Do not deploy, commit, branch, or use network.
