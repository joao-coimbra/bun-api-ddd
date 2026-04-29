# src/infra

Runtime and integration layer. This is where frameworks, drivers, and adapters live.

## Responsibility

- Compose the app (`app.ts`) and runtime entrypoint (`server.ts`).
- Translate HTTP input/output to use-case input/output.
- Implement domain repository contracts with concrete technology (Drizzle/Postgres).
- Load and validate environment variables (`env/`).

`infra` may import from `domain` and `core`. It must not define business rules.

## Layout

```
src/infra/
  app.ts
  server.ts
  env/
    index.ts
  http/
    http.module.ts
    controllers/
    factories/
    presenters/
  database/
    database.plugin.ts
    types.ts
    drizzle/
      client.ts
      schema/
      mappers/
      repositories/
```

## HTTP conventions

- Keep controllers thin: validate/parse request, call factory/use case, map to presenter.
- Use factories (`http/factories/`) to wire use cases with repository implementations.
- Use presenters (`http/presenters/`) to serialize domain objects for HTTP responses.
- Route modules should compose via Elysia plugins/modules (e.g. `http.module.ts`).

## Database conventions

- `database.plugin.ts` decorates Elysia context with a typed DB client.
- Schema stays in `database/drizzle/schema/`.
- Mappers isolate conversion between Drizzle raw types and domain entities.
- Repository implementations live in `database/drizzle/repositories/` and implement contracts from `src/domain/.../application/repositories/`.
- Keep transactions and query details inside infra repositories, never in use cases.

## Env and config

- `env/index.ts` validates all required variables with `zod`.
- Parse numeric env vars with coercion (`z.coerce.number()`).
- Tooling files in root (e.g. `drizzle.config.ts`) can import env via relative path (`./src/infra/env`) for stable editor/tool resolution.

## Do not

- Do not import from `test/*` in production infra code.
- Do not leak Drizzle/Elysia types into domain contracts.
- Do not bypass repository contracts from controllers.
- Do not add barrel `index.ts` files.
