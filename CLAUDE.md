# bun-ddd-api-template

A Bun-first TypeScript API template scaffolding Domain-Driven Design by bounded context. Use it as the starting point for any new backend service.

## Stack

Bun (runtime, test runner, package manager, env loader) · TypeScript (strict, ESNext, `verbatimModuleSyntax`) · [`archstone`](https://www.npmjs.com/package/archstone) for DDD primitives (`Entity`, `AggregateRoot`, `ValueObject`, `WatchedList`, `UniqueEntityId`, `DomainEvents`, `EventHandler`, `UseCase`, `Either`) · `zod` (declared, reserved for validation) · Ultracite + Biome + Husky.

## Architecture

DDD by bounded context with explicit layering: `infra -> domain -> core`.

- `src/core/` holds framework-agnostic primitives.
- `src/domain/<context>/` holds the business model split into `enterprise/` (entities, value objects, aggregates, domain events) and `application/` (use cases, repository contracts, application errors, event subscribers).
- `src/infra/` contains adapters and integrations (HTTP, database, env, runtime bootstrap).

## Layout

```
src/
  core/      shared, business-agnostic primitives (errors, future utilities)
  domain/    bounded contexts; one folder per context (see domain/identity/CLAUDE.md for identity)
  infra/     runtime adapters (http, database, cryptography, env, server/app)
test/        test scaffolding only — factories, in-memory repos, helpers (e2e preload optional)
docs/        see docs/archiqueture/README.md (index: getting-started, new-project checklist, BC reference)
```

`test/` contains **helpers only**. Spec files live next to the source they cover as `<file>.spec.ts`. Integration specs use `*.e2e-spec.ts`. See @src/CLAUDE.md and @test/CLAUDE.md.

## Documentation hierarchy

Stacked **CLAUDE.md** files are the primary playbook; **`docs/archiqueture/`** holds longer reference (especially **`identity`**, the shipped product context). Full order and task shortcuts: **@src/CLAUDE.md** (section *Memory / docs hierarchy*).

| Tier | Doc | Role |
|------|-----|------|
| 1 | @CLAUDE.md (root) | Commands, path aliases, naming, `archstone` imports, global “do not” |
| 2 | @src/CLAUDE.md | Dependency rule `infra → domain → core`, where new code lives |
| 3 | @docs/archiqueture/domain-structure.md | Why bounded contexts are separate folders (onboarding env/DB: @docs/archiqueture/getting-started.md) |
| 4 | @src/domain/CLAUDE.md | Context folder layout, use cases, repos, events |
| 5 | `src/domain/<context>/CLAUDE.md` | Per-context rules; **`identity`** is the long-lived reference (`AuthenticateAccount`, JWT, `users`). New domains copy that layout; use `src/domain/CLAUDE.md` for events/subscribers when adding them |
| 6 | @src/infra/CLAUDE.md (+ plugin CLAUDE.md under `database/`, `cryptography/jwt/`, `auth/`) | HTTP, Drizzle, env, cryptography; per-plugin playbooks |
| 7 | @src/core/CLAUDE.md | `AppError` and shared primitives |
| 8 | @test/CLAUDE.md | Factories, in-memory repos, e2e harness (never `*.spec.ts` here) |

**Long-form:** @docs/archiqueture/README.md (index) · @docs/archiqueture/getting-started.md · @docs/archiqueture/new-project-from-template.md · @docs/archiqueture/identity-bounded-context.md (routes, cookies, `users` map — companion to @src/domain/identity/CLAUDE.md).

**Fast paths:** HTTP/DB/env only → 1–2, 6, then domain context 4–5. New use case or entity → 1–2, 4–5 (and 7 if new error bases). Tests only → 1, 8, colocated spec under `src/`.

**One-line chain:** root → `src/CLAUDE.md` → `domain-structure.md` → `src/domain/CLAUDE.md` → context `CLAUDE.md` → `infra` / `core` / `test` as needed → `identity-bounded-context.md` for identity depth.

## Commands

Only commands defined in `package.json` and `.husky/pre-commit`:

```bash
bun install        # install dependencies
bun run dev        # start API in watch mode
bun run build      # build server bundle to dist/server.js
bun run start      # run production bundle
bun run db:generate  # create drizzle migrations from schema
bun run db:migrate   # apply migrations
bun run db:studio    # open drizzle studio
bun test           # run every *.spec.ts (built-in runner, no npm script)
bun run test:e2e   # optional: integration specs (needs DB; see test/setup-e2e.ts)
bun run check      # ultracite check (lint + format diagnostics)
bun run fix        # ultracite fix (apply lint + format)
```

The pre-commit hook runs `bun test` then `bun x ultracite fix` and re-stages modified files.

## Conventions

- **Path aliases** (`tsconfig.json`): `@/*` → `./src/*`, `test/*` → `./test/*`. Use `test/...` (no `@`) when importing helpers from a spec.
- **`bun:test` titles:** use **`it("should …")`** for use cases and most unit specs; use **`test()`** (no `should` prefix) for `*.vo.spec.ts` and for **`*.e2e-spec.ts`** — see @test/CLAUDE.md.
- **File names**: kebab-case with role suffix — `<name>.entity.ts`, `<name>.vo.ts`, `<name>.repository.ts`, `<name>.use-case.ts`, `<name>.error.ts`, `<subject>-<verb>.event.ts`, `on-<subject>-<verb>.subscriber.ts`, `<entity>-list.entity.ts`, `make-<entity>.factory.ts`, `in-memory-<entity>.repository.ts`.
- **Class names**: PascalCase with matching suffix — `<Name>UseCase`, `<Name>Repository` (interface), `<Subject><Verb>Event`, `On<Subject><Verb>`, `<Name>Error`. One class per file.
- **Imports**: direct file imports only — never barrel files (`index.ts`). `import type` for type-only imports (required by `verbatimModuleSyntax`).
- **Cross-context relative imports**: use `../` inside a single bounded context; cross to `core/` via `@/core/...`. Never reach across two different `domain/<context>/` folders.
- **Formatting**: Biome via Ultracite. Semicolons `asNeeded`. `Bun` is a global. Run `bun run fix` before committing — the hook will do it anyway.
- **Errors**: extend the right base from `@/core/errors/*` so HTTP status and `toResponse()` are inherited. Use cases return `Either<ErrA | ErrB, Success>` — never throw expected failures.
- **`archstone` import paths**: `Entity`, `AggregateRoot`, `ValueObject`, `WatchedList`, `UniqueEntityId`, `Optional`, `UseCase`, `Either`/`left`/`right` are imported from the root `archstone`. `EventHandler`, `DomainEvents`, `DomainEvent` are imported from `archstone/core`. `UseCaseError` and the `Repository`/`Findable`/`Creatable`/`Saveable`/`Deletable` interfaces are imported from `archstone/domain/application`.

## Do not

- Do not import from `src/domain/` inside `src/core/` (or from one bounded context into another).
- Do not introduce barrel `index.ts` files.
- Do not throw expected failures from a use case — return `left(new <Error>())`.
- Do not dispatch domain events from `repository.save` — dispatch only from `repository.create` (see @src/domain/CLAUDE.md).
- Do not write specs inside `test/`. Specs live next to source as `<file>.spec.ts`.
- Do not commit `.env` (already gitignored).
- Do not use `node`, `npm`, `npx`, or `dotenv` — Bun replaces them.
