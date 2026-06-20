# Harmatrix — Roadmap

## Phase 1 — Completed

Static web implementation (no backend) to validate the game concept and gather feedback from known users. Deployed to GitHub Pages.

**Scope:** core game mechanics, full curriculum (triads through melodic minor modes), free play mode, piano keyboard, theory modal, sound feedback, perfect streak progression, guided sessions.

---

## Upcoming phases

> Order subject to change based on feedback gathered in Phase 1.

### Phase 2 — UX review and iteration

Gather feedback from self-use and known users. Identify friction points and specify concrete improvements before investing in backend or design.

**Exit criterion:** a prioritized list of UX improvements derived from real usage.

### Phase 3 — Professional UI design + i18n

Redesign the interface based on the validated, feedback-informed version. Done once in Vue before any mobile migration to avoid duplicating design work across platforms.

Internationalization (i18n) is included in this phase: Spanish and English at minimum, with the architecture open to adding more languages later. Combining both avoids a second pass through the same components.

### Phase 4 — Backend

User authentication, progress persistence (replacing localStorage), and usage statistics for future analysis.

> **Note:** must be completed before mobile phases. Progress lost on uninstall/device change is a regression relative to the current web experience. Monetization architecture (if it involves payments) must be defined before backend design is finalized.

### Phase 5 — Monetization plan

Non-aggressive model — cost recovery without friction to learning. Must be closed before store submission; affects backend payment architecture if in-app purchases are involved.

### Phase 6 — Android migration

### Phase 7 — Google Play publication

### Phase 8 — iPhone / macOS migration

### Phase 9 — Apple Store publication

---

## Current development policy

Development is paused at Phase 1 while feedback is collected. The only accepted work is:

- Bug fixes
- User experience improvements
