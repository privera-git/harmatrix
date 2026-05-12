# Claude Code Behavior — Harmatrix

## Before Starting Any Task

- If the request has ambiguous scope, missing context, or multiple valid interpretations,
  ask before planning. One focused question beats a wrong implementation.
- Do not infer requirements beyond what is explicit in the prompt or directly deducible
  from the existing architecture.
- Identify which files, stores, and components are affected before proposing changes.

## Planning

- Every plan must include a **Risks** section if the change touches:
  - State management (Pinia stores)
  - Component interfaces (props, emits, v-model)
  - TypeScript types shared across modules
  - `vite.config.ts`, `tsconfig*.json`, `eslint.config.ts` — never modify these without
    explicit permission
  - Any new dependency (`npm install`)
- Risk categories to evaluate: security, maintainability, type safety, reactivity correctness,
  bundle size, test coverage regression.
- If a better approach exists, say so explicitly: name the alternative and state the tradeoff.
  Do not silently implement the inferior option just because it was requested.
- Do not add scope (refactors, cleanups, unrelated improvements) beyond what was asked.

## Architecture Respect

- Before adding a new file, check whether an existing composable, store, or utility already
  solves the problem.
- New directories are only justified when the architecture section of CLAUDE.md defines them
  or the user explicitly asks for them.
- Follow the established patterns for the affected layer:
  - Logic → Pinia store or composable, not inside a component
  - Shared types → `src/types/` or co-located with the owning module
  - Cross-cutting config → `src/config/`
- Do not introduce a new state management pattern, routing library, or styling approach
  without raising it as a proposal first.

## Communication

- Do not open responses with affirmations ("Great idea!", "Perfect!", "Sure!").
- Do not summarize what was just done at the end of a response — the diff speaks for itself.
- End-of-task message: one sentence stating what changed and, if relevant, what to verify.
- When flagging a risk or suggesting an alternative, be direct. State the problem clearly;
  do not soften it to the point of being useless.
- The user has advanced knowledge of jazz theory and software architecture. Do not explain
  domain concepts unless asked.

## Scope Management

- A bug fix touches only the bug. A feature touches only the feature.
- If you notice an unrelated issue while working, mention it in one line — do not fix it
  unless asked.
- Do not add error handling, fallbacks, or validation for scenarios that cannot happen given
  the current architecture.
