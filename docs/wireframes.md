# Wireframes — Harmatrix

Low-fidelity wireframes. One layout per `GameSession` phase.
No styles, no colors — structure and content only.

## Design decisions

- **Matrix orientation:** rows rendered inverted (row 0 at bottom, row N-1 at top).
  The `isGiven` diagonal (row === col) ascends from bottom-left to top-right.
- **Note picker — live input (no Confirm button):**
  - Selecting an empty cell enables the letter row (A–G); accidentals are disabled until a
    letter is chosen.
  - Clicking a letter writes the natural note to the cell immediately.
  - Clicking an accidental updates the cell in real time (bb / b / ♮ / # / ##).
  - Letter and accidental can be changed freely while the cell remains active.
  - Moving to another cell preserves the entered value.
- **Supported accidentals:** `bb`, `b`, `♮`, `#`, `##` — matches the domain in `note.ts`.

---

## View 1 · idle

```
┌──────────────────────────────────────┐
│  HARMATRIX                           │
├──────────────────────────────────────┤
│                                      │
│  Stage 1 · Sub-stage 1  (3 / 10)     │
│  Quality: major                      │
│                                      │
│  ────────── Difficulty ──────────    │
│  [ ] Hide degree labels              │
│  [ ] Hide piano keyboard             │
│                                      │
│            [ Start ]                 │
│                                      │
├──────────────────────────────────────┤
│  Streak: 3 days                      │
└──────────────────────────────────────┘
```

**Content mapping:**
- Quality name: `CURRICULUM[stage-1][subStage-1]`
- `(3 / 10)` = `puzzlesPlayed / SUB_STAGE_SESSION_SIZE`
- Difficulty toggles → `ScoringOptions.noDegreeLabels` / `noPianoKeyboard`
- Streak → `progressStore.state.practiceStreak`

---

## View 2 · playing

3×3 example (triad: major · C). Cell (row 1, col 0) is active — the user has selected letter
"F" and can now change the accidental freely. The cell shows "F" in real time.

```
┌──────────────────────────────────────┐
│  major · C                [Abandon]  │
├──────────────────────────────────────┤
│                                      │
│       ┌─────┬─────┬─────┐            │
│  5    │     │     │  G  │            │
│       ├─────┼─────┼─────┤            │
│  3    │     │  E  │     │            │
│       ├─────┼─────┼─────┤            │
│  1    │  C  │ [F] │     │ ← active   │
│       └─────┴─────┴─────┘            │
│                                      │
│  [C][D][E][F][G][A][B]  (piano opt.) │
│                                      │
│  [ A ][ B ][ C ][ D ][ E ][*F*][ G ] │
│     [ bb ][ b ][ ♮ ][ # ][ ## ]      │
│                                      │
│              [ Submit ]              │
└──────────────────────────────────────┘
```

**Content mapping:**
- Header: `puzzle.quality · puzzle.diagonalNote`
- Degree labels (1, 3, 5…) on the left: visible only when `!noDegreeLabels`
- Given cells (diagonal) are read-only; empty cells accept input via the picker
- `[*F*]` = currently selected letter (highlighted in the picker)
- Accidentals are enabled because a letter is already set; on an empty cell they are disabled
- Piano keyboard: pitch reference, not an input surface; visible only when `!noPianoKeyboard`
- Submit → `completeSession()` · Abandon → `resetSession()` → `idle`
- Open question: warn before Submit if any cell is still empty?

---

## View 3 · completed

Same matrix with a per-cell result indicator.

```
┌──────────────────────────────────────┐
│  major · C                           │
├──────────────────────────────────────┤
│                                      │
│  Score: 24                           │
│  ✓ 5   ≈ 1   ✗ 0   × 1.0             │
│                                      │
│       ┌──────┬──────┬──────┐         │
│  5    │  G ✓ │ Eb ✓ │  C   │         │
│       ├──────┼──────┼──────┤         │
│  3    │ Fb ≈ │  C   │  A ✓ │         │
│       ├──────┼──────┼──────┤         │
│  1    │  C   │ Ab ✓ │  F ✓ │         │
│       └──────┴──────┴──────┘         │
│                                      │
│  [ Play Again ]   [ Back to Menu ]   │
└──────────────────────────────────────┘
```

**Content mapping:**
- Score and breakdown from `session.score` and `session.results`
- `✓` correct · `≈` enharmonic · `✗` wrong
- Given cells (diagonal) show the note with no indicator (not evaluated)
- Play Again → `startPuzzle()` with the same quality and options
- Back to Menu → `resetSession()` → `idle`
- `recordSessionResults()` and `updateStreak()` must be called when this view mounts
