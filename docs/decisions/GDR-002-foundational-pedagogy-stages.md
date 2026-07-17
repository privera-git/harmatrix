# GDR-002: Foundational Pedagogy Stages for Absolute Beginners

**Status**: Proposed
**Date**: 2026-07-16
**Area**: Pedagogy | Progression | UX

## Context

Harmatrix currently assumes a player already knows how to name notes in
American notation, read accidentals, and recognize enharmonic equivalents.
The curriculum (`CURRICULUM` in `src/config/game.ts`) starts directly at
**Interval Basics** (`STAGE_NAMES[0]`), and `docs/GDD.md` §5 ("Modo
Aprendizaje") documents no stage before it. There is no dedicated
tutorial/onboarding component in the codebase — the closest things to
"teaching" are `TheoryModal.vue` (an on-demand reference, opened manually,
not part of a guided flow) and the fading scaffold in `guidanceLevelFor()`
(`src/stores/progress.ts`), which reduces hint level by session count, not
by demonstrated mastery.

Observed problem: players with no prior music theory knowledge get stuck at
Interval Basics and often never progress past it. Root cause, diagnosed
against established tutorial-design principles (Valve's Portal is the
reference case — each level isolates and teaches exactly one new mechanic
through play, never through an explanatory screen, and never combines a new
mechanic with an old one until the new one is mastered alone):

- **No variable isolation before Interval Basics.** The player is expected to
  already know note names and accidentals — skills that are prerequisites,
  not taught anywhere.
- **No variable isolation inside Interval Basics itself.** The first substage
  (`seconds` in `src/music/data/intervals.ts`) already combines distance
  counting, interval quality (`m`/`M`), and note notation in a single 3×3
  matrix. A player who hasn't isolated any one of those three skills has no
  path to succeed.
- **Existing scaffold decays on session count, not mastery**
  (`guidanceLevelFor`: full → hint → none at sessions 0-2 / 3-5 / 6+),
  so a struggling player loses help at the same rate as one who has already
  understood the concept.
- **`skipToTriads()` only ever skips forward past stage 1 entirely** — there
  is no equivalent for a player who wants to skip *some* foundational
  concepts but not others (e.g., already knows notes, but wants the
  intervals practice).

The core architectural pattern already in place — reusing the same matrix
mechanic (`MatrixGrid.vue`) as both the game and the teaching device — is
correct and should be preserved. The gap is content sequencing, not
mechanism.

## Options Considered

### Option A — Standalone tutorial/onboarding mode

A separate guided flow (new view/component) outside `CURRICULUM`, shown once
before the player enters the normal game loop.

- Pro: isolated from the progression model in GDR-001; no risk of
  destabilizing existing scoring/advancement logic.
- Con: contradicts the "game is the tutorial" pattern already established by
  reusing `MatrixGrid.vue` for Interval Basics; introduces a second UI/flow
  to maintain; a one-time flow can't be "returned to" as naturally as a
  curriculum stage that already has Free Play access.

### Option B — Extend `CURRICULUM` with new foundational stages

Insert new stages before Interval Basics (natural note names → accidentals →
enharmonic equivalents), built with the same matrix mechanic already used
everywhere else. Re-sequence Interval Basics' own substages to isolate
semitone-distance counting before introducing interval-quality naming.

- Pro: no new UI surface; consistent with the existing architecture; content
  fits the same `IntervalGroupDef`-style data-driven pattern already used in
  `intervals.ts`.
- Con: enlarges `CURRICULUM` / `STAGE_NAMES`; the current single-stage
  `INTRO_STAGE` special case (always accessible in Free Play, per
  `freePlayAccess` in `progress.ts`) needs to generalize to a *range* of
  stages instead of one.

## Decision

**Chosen: Option B — extend the curriculum, do not build a separate tutorial
mode.**

This keeps the "the game teaches through play" principle intact and reuses
100% of the existing matrix/scoring/progression machinery. The new
foundational stages are ordinary `CURRICULUM` entries, not a special case in
the game loop — only their *accessibility rules* need special handling.

### Confirmed constraint (from this GDR's discussion)

All foundational stages — the 3 new ones (natural notes, accidentals,
enharmonic equivalents) plus Interval Basics — must be:

1. **Skippable independently of one another.** A player who already knows
   note names shouldn't be forced through that stage to reach intervals.
2. **Always available for replay, even after being passed or skipped.**
   This generalizes a pattern that already exists for stage 1 today:
   `freePlayAccess` in `src/stores/progress.ts` special-cases
   `stageNum === INTRO_STAGE` to always be `accessible: true` regardless of
   current learning position. That special case needs to widen from one
   stage to the full foundational range.

Exact per-stage mechanics (what the natural-notes, accidentals, and
enharmony puzzles actually look like) and the precise re-sequencing of
`intervals.ts` are **not** decided here — see Open Questions.

## Consequences

**Trade-offs accepted:**

- Absolute beginners get 3 extra stages before reaching what is today the
  start of the game; mitigated by making all 4 foundational stages skippable
  per-stage rather than as a single all-or-nothing gate.
- Generalizing "always accessible" from one stage to a range changes an
  existing, working special case (`INTRO_STAGE` in `freePlayAccess`) —
  this needs a regression check against current Free Play behavior for
  stage 1 before merging.
- Skipping a stage is (at least initially) a self-reported bypass, not a
  verified-mastery gate — same trade-off already accepted in GDR-001
  ("pedagogical, not punitive").

**Files affected (anticipated, not final):**

- `src/config/game.ts` — `CURRICULUM` gains 3 new stages before the current
  Interval Basics entry; `STAGE_NAMES` updated; `INTRO_STAGE` (single number)
  replaced by a range/set covering all foundational stages.
- `src/stores/progress.ts` — `freePlayAccess`'s `stageNum === INTRO_STAGE`
  check generalizes to the new foundational-stage set; `skipToTriads()`
  generalizes to skip from *any* foundational stage directly to Triads, not
  only from stage 1.
- `src/music/data/intervals.ts` — substage re-sequencing to isolate
  semitone-distance counting before interval-quality naming.
- New data modules (parallel to `intervals.ts`'s `IntervalGroupDef` pattern)
  for natural notes, accidentals, and enharmonic equivalents — shape TBD.
- `docs/GDD.md` §5 — currently undocumented for this; needs the expanded
  stage list.

**Signals to watch:**

- Interval Basics completion rate before vs. after the change.
- Ratio of players who skip a foundational stage vs. play it through.
- Whether players who skip a stage later revisit it voluntarily via Free
  Play — validates that "always available" is actually being used, not just
  theoretically present.

## Open Questions

- [ ] Exact puzzle mechanic per new stage (natural notes, accidentals,
  enharmonic equivalents) — likely one follow-up GDR per stage, or a single
  combined design pass once content structure is settled.
- [ ] Exact re-sequencing of `intervals.ts` substages to isolate semitone
  distance from interval-quality naming.
- [ ] Whether "skip" should require any minimal proof of knowledge (e.g., one
  quick check) or remain a pure self-report bypass, consistent with GDR-001's
  "pedagogical, not punitive" stance.
- [ ] UI treatment for skip: one button per foundational stage vs. a single
  "I already know the basics" entry point.
- [ ] How `guidanceLevelFor`'s session-count decay interacts with the new
  stages — should decay be uniform across all foundational stages or tuned
  per stage.

## Related

- GDR-001: Score-Based Substage Progression Model — this GDR builds directly
  on its accumulation model and its "pedagogical, not punitive" principle,
  extended here to stage *accessibility* rather than just in-stage scoring.
