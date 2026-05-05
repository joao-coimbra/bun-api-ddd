# src/infra

Runtime and integration layer. This is where frameworks, drivers, and adapters live.

**Documentation tier:** layer **6** in the stack in @src/CLAUDE.md (*Memory / docs hierarchy*). Read after @CLAUDE.md (root) and @src/CLAUDE.md; pair with the bounded-context playbook you are wiring (often @src/domain/identity/CLAUDE.md).

## Responsibility

- Compose the app (`app.ts`) and runtime entrypoint (`server.ts`).
- Translate HTTP input/output to use-case input/output.
- Implement domain repository contracts with concrete technology (Drizzle/Postgres).
- Load and validate environment variables (`env/`).

`infra` may import from `domain` and `core`. It must not define business rules.

## Layout

```
src/infra/
  app.ts            CORS + OpenAPI + /health + httpModule (see HTTP conventions below)
  server.ts
  env/
    index.ts
  auth/
    auth.plugin.ts
    CLAUDE.md      playbook: bearer macro, composition with jwt + database plugins
  cryptography/
    bun-hasher.ts
    jwt/
      jwt.plugin.ts
      jwt-encrypter.ts
      types.ts
      CLAUDE.md    playbook: access/refresh JWT plugin + encrypter adapter
  http/
    http.module.ts
    controllers/
    factories/
    presenters/
  database/
    database.plugin.ts
    seed.ts
    types.ts
    CLAUDE.md      playbook: db decoration, Drizzle layout, seeder port/adapter design
    seeders/
    factories/
    drizzle/
      client.ts
      schema/
      migrations/
      mappers/
      repositories/
```

## Elysia plugins (playbooks)

Each first-class plugin has a colocated **`CLAUDE.md`**:

| Plugin | Playbook |
|--------|----------|
| `databasePlugin` | @src/infra/database/CLAUDE.md |
| `jwtPlugin` | @src/infra/cryptography/jwt/CLAUDE.md |
| `authPlugin` | @src/infra/auth/CLAUDE.md |

`app.ts` composes **CORS** and **OpenAPI** inline (not separate `*.plugin.ts` files). When/if those move into dedicated modules, add a matching `CLAUDE.md` beside them the same way.

## HTTP conventions

- Keep controllers thin: validate/parse request, call factory/use case, map to presenter.
- When a use case returns `Either`, the controller may call `result.getOrThrow()` for the happy path; wire a global `onError` / error mapper if you need stable HTTP status bodies for expected failures (`AppError` subclasses). Colocated **`*.use-case.spec.ts`** files use **`isRight()`** / **`isLeft()`** first, then **`getOrThrow()`** on success when the payload is asserted — @test/CLAUDE.md.
- Use factories (`http/factories/`) to wire use cases with repository implementations.
- Use presenters (`http/presenters/`) to serialize domain objects for HTTP responses.
- Route modules should compose via Elysia plugins/modules (e.g. `http.module.ts`).
- **E2E** colocated next to controllers: **`new AccountFactory(db)`**; bearer specs use **`makeDrizzleAuthenticatedAccount()`** + treaty **`headers`**; **`beforeEach`** → **`db.delete(schema.users)`** where needed; Eden **`treaty`** — @test/CLAUDE.md (*E2E assertions*, *bearer routes*).

## Database conventions

- `database.plugin.ts` decorates Elysia context with a typed DB client.
- Schema stays in `database/drizzle/schema/`.
- Mappers isolate conversion between Drizzle raw types and domain entities.
- Repository implementations live in `database/drizzle/repositories/` and implement contracts from `src/domain/.../application/repositories/`.
- Keep transactions and query details inside infra repositories, never in use cases.
- Seeders (`seeders/`) depend only on domain ports — no Drizzle imports. Concrete wiring lives in `factories/make-seeder.factory.ts` only. See @src/infra/database/CLAUDE.md.

## Env and config

- `env/index.ts` validates all required variables with `zod`.
- Parse numeric env vars with coercion (`z.coerce.number()`).
- Tooling files in root (e.g. `drizzle.config.ts`) can import env via relative path (`./src/infra/env`) for stable editor/tool resolution.

## Do not

- Do not import from `test/*` in production infra code.
- Do not leak Drizzle/Elysia types into domain contracts.
- Do not bypass repository contracts from controllers.
- Do not add barrel `index.ts` files.
