# src

Source root. Three layers are active.

- `core/` — framework-agnostic primitives shared by every context. See @src/core/CLAUDE.md.
- `domain/` — business model, organized by bounded context. See @src/domain/CLAUDE.md.
- `infra/` — runtime adapters and integrations (HTTP, DB, env, server bootstrap). See @src/infra/CLAUDE.md.

## Dependency rule

```
infra → domain → core
```

Imports may only point left. Verify before adding a new import:

- `core/*.ts` must not import from `domain/` or `infra/`.
- `domain/<ctx>/**` must not import from `infra/` and must not import from another `domain/<other>/`.
- `infra/**` (when it exists) implements interfaces declared in `domain/<ctx>/application/repositories/`; it never declares business rules.

If a needed import would point right, the type is in the wrong layer — move it.

## Where does new code go?

| Kind of thing | Location |
|---|---|
| Pure type, generic helper, error class with no business meaning | `src/core/<area>/<name>.ts` |
| Entity, value object, aggregate, domain event | `src/domain/<context>/enterprise/...` |
| Use case, repository **contract** (interface), application error, event subscriber | `src/domain/<context>/application/...` |
| Repository **implementation**, HTTP route, env loader, third-party client | `src/infra/<area>/...` (create the folder when first needed) |
| Seeder (context data for dev/staging) | `src/infra/database/seeders/<context>.seeder.ts` |
| Test factory, in-memory repo, custom matcher, `waitFor`-style helper | `test/<area>/...` (see @test/CLAUDE.md) |

## Memory / docs hierarchy

Read **tiers 1 → 5** in order when onboarding or adding a new bounded context. **Tiers 6–8** (`infra`, `core`, `test`) are **parallel**: open the one that matches your task; all three assume you already understand tiers 1–2.

### Tiers (recommended order)

1. @CLAUDE.md (root) — commands, global conventions, `archstone` import cheatsheet
2. @src/CLAUDE.md — layer dependency rules and “where new code goes” (**this file**)
3. @src/domain/CLAUDE.md — bounded-context structure, cross-context rules, entity/use-case/event conventions
4. @src/domain/identity/CLAUDE.md — reference bounded context (accounts, auth, JWT, crypto ports); model new contexts on this layout
5. **`src/domain/<context>/CLAUDE.md`** — playbook for each additional bounded context (add one when a context gains enough rules)
6. @src/infra/CLAUDE.md — HTTP, Drizzle, env, cryptography wiring; **plugin playbooks:** @src/infra/database/CLAUDE.md, @src/infra/cryptography/jwt/CLAUDE.md, @src/infra/auth/CLAUDE.md
7. @src/core/CLAUDE.md — `AppError` hierarchy and other framework-agnostic primitives
8. @test/CLAUDE.md — factories, in-memory repositories, helpers, e2e preload (`run-e2e.ts`, `setup-e2e.ts`)

### Task-based shortcuts

| You are… | Minimum reading |
|----------|-----------------|
| Wiring a route, DB, or env | 1–2, 6, then 4–5 for the affected context |
| Adding a use case / entity / VO | 1–2, 4–5; 7 if you introduce a new shared error shape |
| Copy-pasting DDD event/WatchedList patterns | 1–2, 4, @src/domain/CLAUDE.md (events/subscribers), @test/CLAUDE.md for in-memory repo dispatch rules |
| Writing unit or e2e specs | 1, 8; spec file stays next to `src/` source |
| First-time setup (env, Docker, migrate, e2e) | 1–2, 6, 8 |
| Bootstrapping a new bounded context | 1–2, 4–5 |

### Long-form reference

- Keep product-specific long-form docs under `docs/` using your team naming.
- Treat `CLAUDE.md` files as the source of truth for coding behavior and layering rules.

## Imports inside `src/`

- Inside a single bounded context: relative paths (`../enterprise/<entity>.entity`).
- Across layers: aliased (`@/core/errors/<name>.error`).
- Across two different `domain/<context>/` folders: forbidden — coordinate via `infra/` instead.

## Tests

Specs are colocated as `<file>.spec.ts` next to source. `*.e2e-spec.ts` is reserved for integration tests. Never put a spec under `test/`.

**TDD rule for new features:** create or update a failing spec first, implement the smallest change to make it pass, then refactor. Apply this consistently for both human and agent-driven development.

**Naming:** `it("should …")` for use cases and typical unit tests; `test()` without a `should` prefix for value-object specs (`*.vo.spec.ts`) and all E2E files — @test/CLAUDE.md.

**Use case specs:** one scenario per `it`; **`expect(result.isRight()).toBeTrue()`** or **`isLeft()`**, then **`getOrThrow()`** on success when the value matters. E2E: **`new AccountFactory(db)`**, pre-auth **`makeDrizzleAuthenticatedAccount`** for bearer routes, **`beforeEach`** table resets where needed, Eden **`treaty`** (**`204`** / **`""`**, **`toMatchObject`**) — @test/CLAUDE.md.
