# GDR-003: Triad/Tetrad Difficulty Reorder

**Status**: Proposed
**Date**: 2026-07-17
**Area**: Pedagogy | Content

## Context

Playtesting the full Stage 1 (Triads) and Stage 2 (Tetrads) sequence surfaced
a felt difficulty regression: after `aug`/`dim` (Stage 1) and after the
`m7`-family (Stage 2), the curriculum drops back to something noticeably
easier — `sus2`/`sus4` in Stage 1, `maj6`/`dom7sus4` in Stage 2 — instead of
continuing to ramp up.

Post-hoc analysis of why the drop feels wrong:

- `sus2`/`sus4` differ from `major`/`minor` by exactly **one replaced tone**
  (2M or 4P swapped for the 3rd). `maj6`/`dom7sus4` are the same kind of
  one-note delta from `maj7`/`dom7` (6M replaces 7M; 4P replaces 3M). Their
  actual difficulty is much closer to the base major/minor/dominant chords
  than to what currently precedes them.
- `aug`/`dim` alter the 5th — already a step beyond the plain triad — and
  `m7b5`/`dim7`/`mMaj7` stack two structural changes at once (an altered 5th
  *and* a specific 7th). These are legitimately harder than the sus/6/7sus4
  group.

Current order (`CURRICULUM` in `src/config/game.ts:23-24`) teaches the harder
qualities first, then regresses to the simpler one-note-delta group. This
contradicts the "isolate one new variable at a time" principle already
established in **GDR-002** (Foundational Pedagogy Stages).

## Options Considered

### Option A — Keep current order

- Triads: `major, minor, aug, dim, sus2, sus4`
- Tetrads: `maj7, dom7, m7, mMaj7, m7b5, dim7, maj6, dom7sus4`

- Pro: no change required, already implemented and tested.
- Con: confirmed by playtesting to produce a felt difficulty regression —
  sus/6/7sus4 chords land after harder material despite being simpler.

### Option B — Reorder to isolate one-note deltas immediately after their base quality

- Triads: `major, minor, sus2, sus4, aug, dim`
- Tetrads: `maj7, maj6, dom7, dom7sus4, m7, mMaj7, m7b5, dim7`

- Pro: each new quality differs from an already-mastered one by exactly one
  altered/replaced tone before moving to a harder structural change (altered
  5th, then altered 5th + specific 7th); removes the observed regression;
  consistent with GDR-002's "isolate one variable" principle.
- Con: pushes `aug`/`dim`/`m7b5`/`dim7` later in the sequence; breaks the
  implicit "chord-family grouping" of the current order (e.g., all
  diminished-family qualities together) in favor of grouping by structural
  distance from a base chord.

## Decision

**Chosen: Option B — reorder by structural distance from the base chord.**

- Triads: `major, minor, sus2, sus4, aug, dim`
- Tetrads: `maj7, maj6, dom7, dom7sus4, m7, mMaj7, m7b5, dim7`

This removes the playtesting-observed regression and keeps the difficulty
ramp monotonic: one-note deltas from an already-known chord come before
qualities that alter the 5th, which in turn come before qualities that
combine an altered 5th with a specific 7th.

## Consequences

**Trade-offs accepted:**

- `aug`, `dim`, `m7b5`, and `dim7` are introduced later than today. Players
  reach the full diminished/augmented vocabulary a few substages later than
  before — acceptable since the goal is a smoother curve, not a faster one.
- The "chord-family" grouping in the current order (e.g., keeping all
  half-/fully-diminished tetrads adjacent) is given up in favor of grouping
  by structural distance from the base chord.

**Files affected:**

- `src/config/game.ts` — `CURRICULUM[1]` (Triads) and `CURRICULUM[2]`
  (Tetrads) reordered to the arrays above.
- `docs/GDD.md` §5 — Etapa 1 (Triadas) and Etapa 2 (Tétradas) progression
  lists reordered to match.
- `src/stores/__tests__/progress.spec.ts` — asserts on `stage`/`subStage`
  **indices**, not quality names; expected unaffected, but should be
  re-verified once the reorder lands.

**Signals to watch:**

- Substage completion rate and error rate for `sus2`/`sus4` (Stage 1) and
  `maj6`/`dom7sus4` (Stage 2) before vs. after the reorder — the local
  spike-then-relief pattern in error rate should disappear from the curve.

## Open Questions

- [ ] None blocking. Recommend a follow-up empirical check once enough
  playtesting data exists under the new order, to confirm the regression is
  actually gone rather than shifted elsewhere in the sequence.

## Related

- GDR-002: Foundational Pedagogy Stages — shares the "isolate one new
  variable at a time" principle this reorder is built on.
