# Claude Code Behavior — Harmatrix

## Before Starting Any Task

- If the request has ambiguous scope, missing context, or multiple valid interpretations,
  ask before planning. One focused question beats a wrong implementation.
- Do not infer requirements beyond what is explicit in the prompt or directly deducible
  from the existing architecture.
- Identify which files, stores, and components are affected before proposing changes.

## Documentation Lookup

- Before writing code that uses a library in the stack (Vue 3, Pinia, Vite, Vitest, TypeScript,
  Vue Router, VueUse), resolve the library ID with `context7` and fetch the relevant docs.
- Do not rely solely on training-data knowledge for API signatures, composable names, or
  configuration options — these change across minor versions.
- Use Context7 to verify the exact import path, option names, and any deprecations before
  proposing an implementation.

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

## Before Completing Any Task

Before considering a task done and suggesting a commit, always run the three local
verification commands in this order:

```bash
npm run lint
npm run test:unit -- --run
npm run build
```

- If any command fails, fix the issue before proposing a commit.
- If the environment cannot run these commands (e.g., Node.js not available in the shell),
  say so explicitly and instruct the user to run them before merging.
- Do not skip this step even for changes that appear trivial — lint and type-check catch
  errors that are invisible during authoring.

## Scope Management

- A bug fix touches only the bug. A feature touches only the feature.
- If you notice an unrelated issue while working, mention it in one line — do not fix it
  unless asked.
- Do not add error handling, fallbacks, or validation for scenarios that cannot happen given
  the current architecture.
