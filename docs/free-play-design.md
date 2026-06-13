# Free Play — Design Report

## Context and design decisions

- Free play is **neutral with respect to progress**: does not call `recordSessionResults`, does not update `practiceStreak`.
- A **stage** is accessible when the user has passed at least one sub-stage of it: `stageNum < learning.stage` OR (`stageNum === learning.stage` AND `learning.subStage >= 2`).
- A **sub-stage** is accessible if its stage is already complete, or if it is one the user has already reached in the current stage (including the one currently being learned): `stageNum < learning.stage` → all; `stageNum === learning.stage` → `subStageIndex <= learning.subStage - 1`.
- The active mode (Learn / Free Play) and the last stage opened in the accordion are persisted in `localStorage` via the progress store.

## UI pattern: accordion (Option B)

All 8 stages are listed vertically. Tapping a stage expands it to reveal its sub-stages inline. Only one stage can be open at a time — opening a second stage auto-closes the previous one. On mount, the accordion opens the last stage the user interacted with (context retention), eliminating the extra-click cost in practice.

---

## Issue 1 — `game` store: add `isFreePlay` flag to session

**Label:** `feature`
**No dependencies**

**What it does:** Adds `isFreePlay: boolean` to the `playing` and `completed` variants of `GameSession`. Updates `startPuzzle` to accept a fourth optional parameter `isFreePlay?: boolean` (default `false`).

**Acceptance criteria:**
- `GameSession` playing and completed include `isFreePlay`.
- `startPuzzle(note, quality, options, true)` stores `isFreePlay: true` in the session.
- Existing tests pass without modification (the parameter is optional with default `false`).
- New unit tests cover the `isFreePlay: true` variant.

---

## Issue 2 — `progress` store: free play accessibility and UI state persistence

**Label:** `feature`
**No dependencies**

**What it does:** Three additions to the progress store:

1. **Computed `freePlayAccess`**: returns, for each stage in the curriculum, whether the stage is accessible and which of its sub-stages are accessible. Pure derivation from `learning` — requires no new state.

2. **`lastFreePlayStage: number | null`** in `ProgressState` (default `null`). Action `setLastFreePlayStage(stage: number)`. Persisted to localStorage automatically by the existing watcher.

3. **`idleMode: 'learn' | 'freePlay'`** in `ProgressState` (default `'learn'`). Action `setIdleMode(mode)`. Same persistence mechanism.

**Acceptance criteria:**
- `freePlayAccess` returns the correct state for all edge cases: user on sub-stage 1 of stage 1 (everything locked), user on sub-stage 2 of stage 1 (stage 1 partially accessible), user who completed stage 1 (stage 1 fully accessible, stage 2 locked).
- `lastFreePlayStage` and `idleMode` persist and restore correctly across sessions.
- Unit tests cover `freePlayAccess` for the edge cases above.

---

## Issue 3 — `FreePlayPicker` component: stage/sub-stage accordion

**Label:** `feature`
**Depends on:** Issue 2

**What it does:** New component `src/components/FreePlayPicker.vue`. Renders the 8-stage accordion with their sub-stages.

**Behavior:**
- All stages are always visible. Locked stages appear visually disabled (no expand affordance).
- Only one stage open at a time: opening one closes the previous.
- On mount, auto-opens the stage indicated by `lastFreePlayStage` (or the first accessible stage if `null`).
- Within an open stage, all sub-stages are shown with locked/unlocked visual state.
- Tap on an accessible sub-stage emits `play(quality: ChordQuality | ScaleMode)`.
- Tap on an accessible stage header emits `stageOpen(stageIndex: number)` when opening.

**Props:** receives `freePlayAccess` from the store via the parent (does not access the store directly).
**Emits:** `play(quality)`, `stageOpen(stageIndex)`.

**Acceptance criteria:**
- Locked stages cannot be expanded.
- Auto-open on mount works with the persisted value.
- Tap on a locked sub-stage emits nothing.
- `@vue/test-utils` tests cover: expand/collapse, auto-open, `play` emission, locked stage/sub-stage blocking.

---

## Issue 4 — `IdleView`: Learn / Free Play toggle and `FreePlayPicker` wiring

**Label:** `feature`
**Depends on:** Issues 1, 2, 3

**What it does:** Modifies `IdleView` to support both modes.

**Behavior:**
- Toggle visible at the top of the view. Initial state taken from `progressStore.state.idleMode`.
- In **Learn** mode: current behavior unchanged.
- In **Free Play** mode: hide the learning section (quality, perfectStreak, difficulty) and show `FreePlayPicker`.
- On quality selection from `FreePlayPicker`: calls `gameStore.startPuzzle(note, quality, options, true)` with `isFreePlay: true`. The `note` is obtained from `progressStore.nextDiagonalNote()`, same as in Learn.
- On `stageOpen`: calls `progressStore.setLastFreePlayStage(stageIndex)`.
- Mode change persists via `progressStore.setIdleMode(mode)`.

**Design note:** Difficulty options (hide degree labels, hide piano keyboard) apply in both modes — there is no reason to hide them in free play.

**Acceptance criteria:**
- The toggle changes mode and persists across sessions.
- Learn mode has no regressions (existing `IdleView` tests pass without modification).
- New tests cover: render in free play mode, quality selection flow, stage persistence.

---

## Issue 5 — `CompletedView`: differentiated behavior for free play sessions

**Label:** `feature`
**Depends on:** Issue 1

**What it does:** Modifies `CompletedView.vue` to skip progress recording when `session.isFreePlay === true` and adjust the visual context.

**Behavior:**
- In `onMounted`: skip `recordSessionResults` and `updateStreak` if `session.isFreePlay`.
- Score is still calculated and shown — it is useful feedback even when it does not count toward progress.
- The perfectStreak indicator `(N / 10)` is hidden in free play sessions — showing advancement that is not being recorded is misleading.
- "Play Again" reuses the same quality with `isFreePlay: true` (current behavior already does this; it only needs the flag added).
- "Back to Menu" returns to idle in Free Play mode, not Learn mode.

**Acceptance criteria:**
- `recordSessionResults` and `updateStreak` are not called in free play sessions.
- Score is displayed normally.
- Streak indicator does not appear in free play.
- Tests cover both paths: `isFreePlay: true` and `isFreePlay: false`.

---

## Dependency map

```
Issue 1 (game store: isFreePlay)       ──────────────────────────────► Issue 5 (CompletedView)
Issue 2 (progress store: access + UI)  ──► Issue 3 (FreePlayPicker) ─┐
                                                                       └► Issue 4 (IdleView)
Issue 1 ────────────────────────────────────────────────────────────────► Issue 4 (IdleView)
```

Issues 1 and 2 are independent and can be worked in parallel. Issue 3 can only start after Issue 2. Issue 4 requires all four preceding issues. Issue 5 only requires Issue 1 and can advance in parallel with Issues 2, 3, and 4.
