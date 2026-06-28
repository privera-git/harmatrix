# GDR-001: Score-Based Substage Progression Model

**Status**: Accepted
**Date**: 2026-06-27
**Area**: Progression | Pedagogy

## Context

The original model required `perfectStreak = 10` consecutive perfect puzzles to
advance a substage. Any imperfect answer — including enharmonic equivalents —
reset the counter to zero.

Problems identified:

- **Binary and demotivating**: 9 perfect + 1 error → back to zero. No perceived
  accumulated progress between sessions.
- **Scales harshly with puzzle size**: more cells per puzzle → higher probability
  of at least one error per session → the effective completion threshold grows
  non-linearly with puzzle size.
- **No partial credit for near-mastery**: a player consistently hitting 90% correct
  makes the same progress as one hitting 30% — none.

## Options Considered

### Option A — Pure accumulation (no regression)

Each session contributes `sessionScore` to `accumulatedScore`. Progress never
decreases. The substage is complete when `accumulatedScore >= targetScore`.

- Pro: mistakes slow progress rather than erasing it; consistent effort always
  yields forward movement; scales naturally with puzzle size via a dynamic target.
- Con: without a quality floor, a player could complete a substage by grinding
  through many poor sessions.

### Option B — Accumulation with minimum session threshold

Like Option A, but sessions below a minimum score threshold (e.g., <30% of max)
contribute nothing.

- Pro: requires a baseline level of understanding per session.
- Con: reintroduces a binary gate at the session level, partially restoring the
  frustration of the streak model.

### Option C — Accumulation with decay

`accumulatedScore` can decrease when sessions score below a certain level.

- Pro: closer to "real mastery" semantics.
- Con: restores demotivation on bad days; no meaningful pedagogical advantage
  over Option A.

## Decision

**Chosen: Option A — Pure accumulation, no regression.**

A player who understands the material well completes a substage in ~10 ideal
sessions — equivalent to the old streak requirement, without the catastrophic
reset. A player who struggles takes more sessions but always makes forward
progress. The pedagogical feedback comes from the note pool ramp (see below),
not from punishment.

### Target formula

```
targetScore = SUB_STAGE_SESSION_SIZE × numCells × MAX_CELL_SCORE
            = 10 × numCells × 3
```

The target scales dynamically with puzzle size. One perfect session always
contributes exactly 1/10 of the target, regardless of how many cells the puzzle
has. A session at 70% accuracy contributes 7/100 of the target. Puzzle size
does not create an unfair advantage or disadvantage.

### Note pool ramp: `poolForProgress(ratio)`

The existing `poolForStreak(streak)` function is replaced by
`poolForProgress(ratio)`, where `ratio = accumulatedScore / targetScore`.
The proportional thresholds from the original implementation are preserved:

| Progress | Pool | Available diagonal notes |
|---|---|---|
| 0 – 40% | `natural` | C D E F G A B (7 notes) |
| 40 – 70% | `full` | All 21 notes (naturals + sharps + flats) |
| 70 – 100% | `altered` | Sharps and flats only (14 notes) |

A player who makes many errors stays in `natural` longer — reinforcing the
fundamentals they need most. This is a tighter feedback loop than the streak
model, where a single reset could push a player back to `natural` after reaching
`altered`.

Special case (unchanged): when `sessionsPlayed[quality] === 0` (first-ever
encounter with this quality), the diagonal note is always `C`.

### Difficulty multipliers for progression

The existing score-display multipliers (1.0× / 1.5× / 2.5×) are **not** applied
directly to progress accumulation. A separate set of progression multipliers
controls how hard mode affects substage speed, decoupling the visual score
reward from the progression mechanic.

Hard mode must offer a real progression benefit — a player who memorizes
intervals without keyboard or degree aids should advance faster. However, the
current 2.5× score multiplier applied directly would make hard mode complete a
substage 2.5× faster than full help, which is too large a gap.

Initial values (subject to empirical calibration in separate branches):

| Toggles active | Score display mult. | Progression mult. |
|---|---|---|
| None (full help) | 1.0× | 1.0× |
| One toggle | 1.5× | 1.2× |
| Both (hard mode) | 2.5× | 1.5× |

With these values, hard mode completes a substage in ~6.7 ideal sessions vs. 10
for full help — a 1.5× speed advantage. The incentive is real but not dominant.

## Consequences

**Trade-offs accepted:**

- A determined but struggling player can complete a substage purely through
  volume of sessions. The quality gate is softer than the streak model. This is
  intentional: Harmatrix is pedagogical, not punitive.
- The progression multiplier values require empirical validation. The initial
  curve (1.0× / 1.2× / 1.5×) may need adjustment after playtesting.

**Files affected:**

- `src/stores/progress.ts` — remove `perfectStreak`; add `accumulatedScore` per
  quality; update `recordSessionResults()` to accumulate score; update
  `advanceLearning()` trigger condition; replace `poolForStreak` with
  `poolForProgress`
- `src/config/game.ts` — add `PROGRESSION_MULTIPLIERS` constant; rename or
  repurpose `SUB_STAGE_SESSION_SIZE`
- `src/music/scoring.ts` — no changes (existing scoring is compatible)
- `src/components/IdleView.vue`, `PlayingView.vue`, `CompletedView.vue` —
  replace `(X / 10)` text display with a visual progress bar driven by
  `accumulatedScore / targetScore`
- `src/stores/__tests__/progress.spec.ts` — replace streak-based test cases

**Signals to watch:**

- Average sessions per substage in playtesting: target ~10–15 for a competent
  player (full help). If consistently below 6, the target is too low. If above
  25, it may be too high or the multipliers too flat.
- Player dropout rate per substage: if players abandon after 20+ sessions
  without completing, consider adding a soft quality floor (Option B hybrid).
- Hard mode adoption rate: if players rarely activate both toggles, the 1.5×
  progression multiplier is not a sufficient incentive — increase it toward 2.0×.

## Open Questions

- [ ] **Progression multiplier calibration**: requires playtesting in separate
  branches. Starting values: 1.0× / 1.2× / 1.5×. A new GDR should be opened
  once empirical data is available.
- [ ] **Quality floor**: if grinding behavior is observed after release, evaluate
  adding Option B as a hybrid (minimum threshold below which a session
  contributes nothing).

## Related

- *(none yet)*
