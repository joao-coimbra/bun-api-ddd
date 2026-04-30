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
| Test factory, in-memory repo, custom matcher, `waitFor`-style helper | `test/<area>/...` (see @test/CLAUDE.md) |

## Memory / docs hierarchy

Read in order when orienting in the repo:

1. @CLAUDE.md (root) — commands, global conventions, `archstone` import cheatsheet
2. @src/CLAUDE.md — layer dependency rules and “where new code goes”
3. @src/domain/CLAUDE.md — bounded-context layout and rules
4. **`src/domain/<context>/CLAUDE.md`** — optional; **`identity`** has @src/domain/identity/CLAUDE.md
5. @src/infra/CLAUDE.md — HTTP, database, cryptography, env
6. @src/core/CLAUDE.md — errors and shared primitives
7. @test/CLAUDE.md — factories, in-memory repos, e2e harness

## Imports inside `src/`

- Inside a single bounded context: relative paths (`../enterprise/<entity>.entity`).
- Across layers: aliased (`@/core/errors/<name>.error`).
- Across two different `domain/<context>/` folders: forbidden — coordinate via `infra/` instead.

## Tests

Specs are colocated as `<file>.spec.ts` next to source. `*.e2e-spec.ts` is reserved for integration tests. Never put a spec under `test/`.
