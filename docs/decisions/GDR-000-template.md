# GDR-NNN: [Short Decision Title]

**Status**: Proposed | Accepted | Implemented | Deprecated | Superseded by [GDR-NNN]
**Date**: YYYY-MM-DD
**Area**: Progression | Pedagogy | Scoring | UX | Audio | Content | Architecture

## Context

What situation prompted this decision. Include the constraints, pain points,
or goals that made this decision necessary. Be factual — no advocacy here.

## Options Considered

### Option A — [Label]

Brief description.

- Pro: ...
- Con: ...

### Option B — [Label]

Brief description.

- Pro: ...
- Con: ...

## Decision

**Chosen: Option [X] — [Label]**

The reason, in one or two direct sentences. Reference specific constraints
or goals from the Context section.

### Key parameters / formulas (if applicable)

```
formula = ...
```

## Consequences

**Trade-offs accepted:**
What you gain and what you give up by choosing this option over the alternatives.

**Files affected:**
- `src/...` — what changes and why

**Signals to watch:**
What observable player behavior or metric would indicate this decision needs
revisiting. Be specific enough that a future reviewer can make a judgment call.

## Open Questions

- [ ] Unresolved sub-decisions, flagged for a follow-up GDR or empirical testing.

## Related

- GDR-NNN: [title] — how they connect

---

## GDR Status Lifecycle

```
Proposed → Accepted → Implemented → Deprecated
                                  → Superseded by GDR-NNN
```

- **Proposed**: decision under discussion, not yet committed
- **Accepted**: decision agreed upon, not yet implemented in code
- **Implemented**: code reflects the decision
- **Deprecated**: the approach was abandoned; the record is kept for history
- **Superseded**: replaced by a newer GDR (link it)

## Naming Convention

Files live in `docs/decisions/` and follow this pattern:

```
GDR-NNN-kebab-case-slug.md
```

Numbers are sequential and never reused or reassigned. When a decision is
superseded, the old file's status is updated to `Superseded by GDR-NNN` and
the new file explains the change.
