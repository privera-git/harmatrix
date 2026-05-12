# Best Practices — Harmatrix Stack

## Vue 3

- Typed emits: `defineEmits<{ eventName: [arg: Type] }>()`
- Use `defineModel<T>()` (Vue 3.4+) for two-way binding — no manual prop + emit pattern
- Prefer `computed()` for derived values; never recalculate inside `<template>` expressions
- Never put `v-if` and `v-for` on the same element — use a computed filtered array instead
- Extract logic ≥ ~20 lines into a composable (`src/composables/use*.ts`)
- Component size target: ~150 lines; split into sub-components when exceeded
- SFC order: `<script setup>` → `<template>` → `<style scoped>`
- Default to `<style scoped>`; add to `base.css` / `main.css` only for truly global styles

## TypeScript

- `noUncheckedIndexedAccess` is enabled — always handle `T | undefined` from array/object access
- No `any` — use `unknown` and narrow with guards, or explicit union types
- Use `satisfies` for type-validated literals without widening the inferred type
- Use discriminated unions for state machines (e.g., game phases)
- Use `as const` for immutable literal objects and arrays
- Prefer `type` aliases for simple shapes; `interface` only for extensible contracts

## Pinia

- Use Composition API style stores: `defineStore('id', () => { ... })`
- Always `storeToRefs()` when destructuring reactive properties from a store in a component
- Use `$patch()` to batch multiple state mutations in a single operation
- Keep actions responsible for side effects and mutations; components only call actions

## Vitest

- Test behavior through user interaction (`wrapper.trigger`, `userEvent`), not internal state
- Use `mount` over `shallowMount` unless isolating deeply nested dependencies
- Mock Pinia stores with `createTestingPinia()` from `@pinia/testing`
- Describe expected behavior: `it('returns empty array when no notes selected', ...)`

## Vite / Build

- Always use the `@/` alias — no relative paths that cross directory boundaries
- Use dynamic `import()` for large features not needed on initial load

## Code Organization

- `src/composables/` — reusable stateless or locally-stateful logic
- `src/types/` — shared TypeScript types; or co-locate next to the module they describe
- `App.vue` — layout shell and top-level `provide()` only; no business logic
- Use CSS custom properties for any value used in more than one component

## Git / CI

- Never push to `main` with failing `type-check`, `lint`, or `test:unit`
- Commits must be atomic: one logical change per commit
