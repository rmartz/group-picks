# Code Standards

## Package Manager

- Always use `pnpm`. Never `npm` or `yarn`.
- **Pin every `package.json` dependency to a full `major.minor.patch` version, even inside a range** (e.g. `^3.8.4`, not `^3`). A shorthand range like `^3` is already satisfied by newer 3.x releases, so a Dependabot minor/patch bump only updates `pnpm-lock.yaml` and leaves `package.json` untouched — making the upgrade invisible in the manifest (this is how a Prettier bump can land via a lockfile-only change and surface as an unexplained formatting failure). A full pin forces every bump to appear as a reviewable `package.json` change.

## Common Commands

```bash
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm lint             # Lint
pnpm format           # Format
pnpm test             # Run tests with Vitest
pnpm tsc              # Type check
pnpm storybook        # Start Storybook dev server (port 6006)
pnpm build-storybook  # Build static Storybook
pnpm run env:validate # Validate deployment config files against schema
```

## Worktree Setup

After creating a git worktree (`git worktree add .git-worktrees/<name> -b <branch> origin/main`), run `pnpm install --frozen-lockfile` inside the worktree before invoking any build, test, or lint command. pnpm's `node-modules` linker creates per-directory `node_modules` trees; a fresh worktree has none. The global store is already populated so this step only creates hardlinks — it takes a few seconds and requires no network access.

### Pre-commit hook architecture

This repo uses a two-hook split, matching the pattern in `rmartz/dotfiles`:

- **`.husky/pre-commit`** — runs for human commits in the root worktree only. Detects worktrees via `[ -f ".git" ]` (a worktree's `.git` is a file, not a directory) and exits immediately there, so Husky's `node_modules` dependency is never a problem in agent contexts.
- **`scripts/hooks/pre-commit`** — runs for agent commits in `.git-worktrees/`. Contains the same checks as the Husky hook plus the `node_modules` self-healing guard (since new worktrees may not have had `pnpm install` run).

Both hooks run `scripts/check-conflict-markers.sh --staged` before `lint-staged`, so a staged merge-conflict marker fails the commit before Prettier can reflow and mangle it. It flags only unambiguous angle markers (`<<<<<<<` / `>>>>>>>`), never a lone `=======`, so Markdown dividers and setext underlines are not false positives. Bypass with `git commit --no-verify` or `ALLOW_CONFLICT_MARKERS=1`.

Agent worktrees use this hook via `core.hooksPath=scripts/hooks`. This is a shared git config value — set it once in the root repository and all linked worktrees inherit it automatically:

```sh
git config core.hooksPath scripts/hooks
```

Run this after cloning or when setting up a fresh root checkout. `new-worktree.py` will automate this step once `rmartz/dotfiles` is updated to detect `scripts/hooks/pre-commit` as an alternative hook path alongside `claude/hooks/pre-commit`.

## Deployment Config

Public (non-secret) environment config lives in `deployment/{env}.yml` and is validated against `deployment/schema.yml`. Only `NEXT_PUBLIC_*` and explicitly allowlisted keys are permitted; patterns matching `*SECRET*`, `*_TOKEN*`, or `*PRIVATE_KEY*` are hard-denied.

- Public config values in `deployment/{env}.yml` are edited by hand. Validate against the schema with `pnpm run env:validate` (also run by the pre-commit hook and in CI via `.github/workflows/validate-config.yml`).
- Pushing config to Vercel and pulling a local `.env.local` will be handled by the `envctl` CLI (usage TBD) — a local-only tool, intentionally not wired into CI. Until it lands, use the `vercel` CLI directly. The previous `vercel-deploy-scripts` tooling (`sync-env` / `generate-local-env`) has been removed.
- There is no secret scanning at present: the VDS-based CI secret scan and the local pre-commit gitleaks scan have both been removed. Secret scanning will return under the new env-management design.

## Continuous Integration

- **Pin every third-party GitHub Action to a full 40-char commit SHA with a trailing version comment** (e.g. `actions/checkout@9c091bb… # v7.0.0`, not `@v7`). A tag can be repointed at attacker code (supply-chain attack); a SHA is immutable. The comment is **required**, not decorative: Dependabot reads the version from it to keep the SHA updated, so a bare SHA with no comment would freeze the action forever. It must be a **full `major.minor.patch`** (`# v7.0.0`) — partials like `# v6` or `# v7.0` are rejected, since Dependabot's handling of non-full-semver comments is inconsistent. The CI check enforces **both** the SHA and the full-semver comment via `.github/workflows/action-pins.yml` (`pnpm pins:actions` → `scripts/check-action-pins.mjs`) — the parallel to the full-semver `package.json` pin check. Local `./…` composite actions need no pin.

## TypeScript

- Strict mode throughout. No `any` types. No `@ts-ignore`.
- Do not use `null` unless required for API compatibility or when explicitly distinguishing `null` from `undefined`. Prefer `undefined` for absent/optional values throughout the codebase.
- Prefer explicit `interface` names scoped to their component (e.g., `interface UserProfileCardProps` not `interface Props`).
- Use `async/await`, not `.then()` chains.

## File Organization

- **Source files**: Keep under ~200 lines (split at ~240). Large files should be split by logical concern. The hard cap is enforced by ESLint's `max-lines` rule at **400 lines** (`pnpm lint` fails any linted `.ts`/`.tsx` over it); ~200/~240 remain guidance targets, not the enforced limit.
- **Test files**: Keep under ~300 lines (split at ~360). Use `.spec.ts` / `.spec.tsx` extension (not `.test.ts`). When splitting, organize into a `{module}-tests/` directory with domain-specific files. The ESLint `max-lines` cap for `*.spec.*`, `*.test.*`, and `*-tests/**` files is **600 lines**.
- **Components**: A component file contains its primary component and props interface. A sub-component may be co-located in the same file if it owns no hooks, state, effects, or context, and is used only by the parent component in that file — e.g., a context wrapper, structural template, or props alias. A sub-component must be in its own file when any of these are true: it owns hooks, state, effects, or context; it is referenced from multiple parents; or it is substantial enough to warrant its own stories or tests (e.g., list items, row components, panels, form sections). All component props must be defined as an explicitly named interface (e.g., `interface UserListProps`), never inline in the function signature.
- **Type files**: Convert large type files into barrel-exported directories with one file per logical domain.
- Add a barrel `index.ts` when a component or module directory exposes a public API or already
  follows a barrel pattern; do not require one for every directory (e.g. ShadCN-generated
  `src/components/ui/` has no barrel by convention).
- Use named exports, not default exports (except for Next.js pages, Redux slices, and
  Storybook story files, where the only allowed default export is the required
  `export default meta`; stories and components must remain named exports).

## Code Conventions

- **Favor type inference.** Explicit generic type arguments (for example, `someFn<Foo>(...)`) are a code smell when TypeScript can infer them.
- **No spurious variables.** Do not assign a value to a variable only to immediately return it on the next line — return the expression directly instead.
- **No IIFEs.** Do not use immediately-invoked function expressions. Extract the logic into a named helper function or compute the value with a plain expression instead.
- **No function-style imports.** Do not use inline `import("…").Type` syntax in type annotations. Use module-level `import type { … } from "…"` statements at the top of the file. Dynamic `await import("…")` for services that require conditional loading (e.g., Sentry instrumentation) is acceptable.
- **No unnecessary helpers.** Do not extract logic into a helper function unless it separates significant logic or belongs in a different module. Three similar lines is better than a premature abstraction.
- **Enums and constant objects** should be kept in alphabetical order to minimize merge conflicts.
- **Import statements** must be sorted alphabetically within each group. This is enforced by ESLint (`simple-import-sort`); run `pnpm lint --fix` to auto-sort.
- **Value sets: default to a structural string union over an `enum`.** For a fixed set of named values use a string union (`type Status = "active" | "inactive"`), or an `as const` array when you also need the values at runtime for validation/iteration (`const STATUSES = ["active", "inactive"] as const; type Status = (typeof STATUSES)[number]`). Both stay **structural**, so serialized/wire strings (Firebase documents, API payloads, query params) assign without a cast and emit ~no runtime — whereas a string `enum` is **nominal** (it rejects the underlying literal, forcing an `as` cast at every serialization boundary) and a plain `enum` ships a runtime object (`const enum` is unavailable under `isolatedModules`). The deciding axis is the **serialization boundary**: a value that crosses a wire/persistence boundary → structural union / `as const`; internal-only state you iterate as a unit and never serialize raw → an `enum` is fine. Existing enums paired with a `{domain}ToFirebase()` / `firebaseTo{Domain}()` converter that centralizes the boundary (e.g. `InviteMode`, `RankingMode`) are deliberate — don't churn them. Export new value-set types/consts from the module barrel where the directory has one.

## Naming Conventions

- **Firebase schema conversions**: `{domain}ToFirebase()` / `firebaseTo{Domain}()`.
- **Redux slices**: File suffix `-slice.ts`.
- **Presentational views**: Components extracted for testability use the `{Component}View` suffix.

## Firebase & Data Model

- **Pre-launch: database state is ephemeral.** The app has not launched yet. All Firestore data can be cleared and re-seeded as needed. Breaking schema changes do not require migration scripts before launch — simply wipe the database if needed.
- **Post-launch: no breaking schema changes without a migration.** Once the app has launched, a breaking change is any modification that makes existing documents unreadable or incorrect at runtime: removing or renaming a field the app reads, changing a field's type or enum values, or restructuring a collection path. Such changes must include either a migration script that backfills existing documents or explicit documentation of the upgrade path before the PR may be merged.
- **Serialization functions are the schema boundary.** All reads and writes to Firestore go through `firebaseTo{Domain}()` / `{domain}ToFirebase()` converters. When the Firestore shape changes, update the relevant converter and add or adjust tests — do not scatter raw field names across the codebase.
- **Additive changes are safe; subtractive changes are not** (post-launch). Adding a new optional field to a document is non-breaking. Removing a field, changing its type, or making a previously-optional field required is breaking and requires a migration.

## User-Facing Text

- For any new or modified UI component, store user-facing strings in a co-located copy file
  (e.g., `ComponentName.copy.ts` or `copy.ts`) for internationalization (i18n) readiness.
  Do not introduce new hardcoded display strings inline in components you are actively changing.

  Existing hardcoded strings elsewhere in the codebase are technical debt to be migrated over
  time; this rule does not require unrelated cleanup.

- Copy files export a single `as const` object named `{SCOPE}_COPY` (e.g., `HOME_PAGE_COPY`, `USER_PROFILE_COPY`).

## Documentation

- Keep documentation in sync with the code — outdated docs are worse than no docs.

## React / Next.js Standards

### Framework

- Next.js with App Router (not Pages Router).
- UI components: ShadCN UI. Do not install other component libraries.
- Styling: Tailwind CSS (comes with ShadCN). No CSS modules or styled-components.
- **ShadCN files are upstream-managed**: `src/components/ui/` is excluded from Prettier via `.prettierignore`. Do not format these files — they are installed by `shadcn add` and must stay in their original form. If they appear modified in a worktree (`git status` shows changes), discard the modifications with `git checkout HEAD -- src/components/ui/`.

### Client Components

- `"use client"` directive required on all React client components (Next.js App Router).
- React hooks must be called unconditionally — hooks before any early returns.

### JSX

- **No imperative logic inside JSX.** Imperative logic means anything that requires a statement rather than an expression: `const`/`let` declarations, `if`/`switch` blocks, loops, or any sequence of statements that produces a result through side effects. All such logic must live in the component body before the `return` statement, or be extracted into a child component. Expressions of any complexity are permitted directly in JSX — ternaries, logical operators (`&&`, `||`, `??`), method chains (`.map()`, `.filter()`, `.find()`), nested function calls, and template literals are all fine as long as they form a single expression with no intermediate bindings. Multi-statement callback functions passed as JSX props (e.g. `onChange={(e) => { setValue(e.target.value); setError(undefined); }}`) are permitted — the prohibition targets imperative logic in JSX structure, not callback bodies.

### Component Structure

- Components should have a single JSX return statement. Invalid states should be prevented by the type system or guarded against by the calling component. An early `return null` can be acceptable if the invalid state is infeasible for the parent component to detect, but the component itself should be returned as a single JSX block.

## Storybook

- Story files are co-located with their component: `ComponentName.stories.tsx`.
- When adding or modifying a UI component, add or update its Storybook story to cover key visual states.
- Stories should use mock data fixtures — never import from Firebase or depend on runtime providers (QueryClient, Redux store, Next.js router).
- Components that are too hook-dependent to render in isolation should use a presentational split: extract rendering into a `ComponentNameView` that accepts callbacks, and keep the original as a thin wrapper that wires up hooks.

### Storybook screenshots in CI

- When a PR changes a `*.stories.*` file, the `Storybook Screenshots` job captures a PNG per changed story and posts them inline in a single sticky PR comment — a **visual acceptance aid** to eyeball an intended UI change (it is **advisory**, never a merge gate; the always-on `Storybook Tests` suite is what catches regressions). View them directly in the PR comment; no download needed.
- Mechanics (see #339): capture is self-hosted (`scripts/capture-screenshots.mjs` drives the Storybook static build in the Chromium the workflow already installs); images are published to a **per-PR** `gh-screenshots-pr-<N>` branch (deleted on PR close by `screenshots-cleanup.yml`) — never a branch shared across PRs, so concurrent PRs can never cancel each other.

## Component Tests

- Test files are co-located with their component: `ComponentName.spec.tsx`.
- When adding or modifying a UI component, add or update its test to verify rendering behavior and key prop-driven states.
- Use `@testing-library/react` with `vitest`. Always call `afterEach(cleanup)`.
- Do not use `.toBeInTheDocument()` — use `.toBeDefined()` or check `.textContent` instead.
- Assert against copy constants (e.g., `HOME_PAGE_COPY`) rather than hardcoded strings.
- Test presentational view components directly; avoid mocking hooks in tests where possible.

## Testing Conventions

- Use `describe`/`it` from Vitest (not `test`).
- Test fixture generators use `make{DomainName}()` (e.g., `makeUser()`, `makeSession()`).
- When splitting large test files, organize into `{module}-tests/` directories.

### Test Design

- **Control inputs and outputs.** Do not rely on a function's default return values as the assertion of a test unless the purpose of the test is specifically to verify those defaults. Use explicit, non-default values so a passing test proves the value was produced by logic, not inherited from an initializer.
- **One reason to fail per test.** Each test should assert a single logical outcome. Helper functions are fine, but if a test invokes two functions from the codebase it should be explicitly testing how those two interact. Incidental coverage of a second function is not a reason to combine assertions.
- **Keep tests simple.** A failing test should make it immediately obvious whether the failure is a bug or an intentional change in behavior. If understanding a failure requires reading more than one layer of test setup or multiple assertions, split the test.
- **Granularity scales with level of abstraction.** Low-level functions (pure utilities, serializers) warrant thorough edge-case coverage. High-level functions (service orchestration) should have smoke tests that verify they correctly apply the lower-level logic — not re-test every edge case that belongs in the lower-level tests.

## GitHub Issues

- When picking the next task from a milestone, use `gh issue list --milestone "<milestone title>" --state open`.

## Git Conventions

- Branch names: lowercase with hyphens, prefixed by type: `feature/`, `chore/`, `refactor/`, `docs/`, with issue number suffix (e.g., `feature/user-profile-42`).
- Commit messages: imperative verbs (Add, Implement, Fix, Update, Extract, Remove). No `feat:`/`fix:` prefixes.
- PR titles must follow Conventional Commits format: `<type>: description` or `<type>(<scope>): description`. Valid types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `style`, `perf`, `ci`, `build`, `revert`. A `!` suffix is allowed before the colon to denote breaking changes (e.g., `feat!: remove legacy auth`). This is enforced by CI.
- PR descriptions must use `Closes #123`, `Fixes #123`, or `Resolves #123` to trigger GitHub's automatic issue close on merge. Phrases like "Addresses #123" or "Related to #123" do NOT trigger auto-close.
