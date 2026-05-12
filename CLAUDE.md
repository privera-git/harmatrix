# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server at localhost:5173
npm run build        # Type-check + production build (outputs to dist/)
npm run preview      # Preview production build locally
npm run test:unit    # Run unit tests with Vitest (watch mode)
npm run lint         # Run oxlint + eslint with auto-fix
npm run format       # Format src/ with Prettier
```

Run a single test file:
```bash
npx vitest run src/components/__tests__/HelloWorld.spec.ts
```

## Architecture

Static SPA — no backend, no router. All state lives in Pinia stores; no server calls.

**Entry point:** `src/main.ts` mounts the Vue app with Pinia.

**Feature flags:** `src/config/features.ts` — export `FEATURES` constant. Set a flag to `false` to keep merged-but-incomplete code invisible in production. Toggle to `true` when the feature is ready.

**Stores (`src/stores/`):** Pinia stores hold all game state. One store per domain concern (e.g., game session, progress, settings).

**Components (`src/components/`):** Vue 3 Composition API with `<script setup>` syntax throughout. Props typed via `defineProps<T>()`.

**Tests (`src/**/__tests__/`):** Vitest + jsdom + `@vue/test-utils`. Co-located with the code they test.

**CI/CD:** `.github/workflows/deploy.yml` — push to `main` triggers build and deploy to GitHub Pages at `https://privera-git.github.io/harmatrix/`. The `base: '/harmatrix/'` in `vite.config.ts` is required for assets to load correctly on Pages.

## Conventions

- All code, comments, variable names, and commit messages in **English**.
- `<script setup lang="ts">` in every `.vue` file.
- Import alias `@/` maps to `src/`.
- Linting runs oxlint first, then eslint — both auto-fix on `npm run lint`.

## Git Workflow

**Model:** GitHub Flow — `main` is always deployable; never commit directly to it.

Branch naming: `prefix/short-description-in-kebab-case`

| Prefix | Use |
|--------|-----|
| `feature/` | New functionality |
| `fix/` | Bug fix |
| `content/` | Musical content (chords, scales, exercises) |
| `infra/` | CI/CD, Vite config, tooling |
| `docs/` | GDD, ADRs, README |

Rules:
- One branch = one unit of work → one PR → merge to `main` → delete branch
- Every PR must pass `type-check`, `lint`, and `test:unit` before merge
- Use feature flags (`src/config/features.ts`) for incomplete work merged early

@best-practices.md
