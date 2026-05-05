# src/infra/database

Playbook for **`database.plugin.ts`** and the Drizzle integration that sits beside it.

## Plugin: `databasePlugin`

- **File:** `database.plugin.ts`
- **Elysia name:** `Database.Plugin`
- **Context:** decorates routes with **`db`** → `{ drizzle }`, where `drizzle` is the shared client from `drizzle/client.ts`.
- **Usage:** `.use(databasePlugin)` on any Elysia instance that needs repository factories or macros that run SQL (e.g. controllers, `auth` plugin).

Do not import `drizzle` directly in controllers for new code—prefer `db` from the Elysia context so the same client is used everywhere.

## Layout (this folder)

| Path | Role |
|------|------|
| `database.plugin.ts` | Elysia decoration with Drizzle client |
| `types.ts` | Shared DB typing for plugins/factories |
| `seed.ts` | Entry point: `makeSeeder().run()` — run with `bun run db:seed` |
| `seeders/seeder.ts` | `Seeder` interface — the shared port all seeders implement |
| `seeders/<name>.seeder.ts` | One seeder per bounded context; depends only on domain ports |
| `factories/make-seeder.factory.ts` | `DatabaseSeeder` orchestrator + wiring of concrete adapters |
| `drizzle/client.ts` | Singleton Drizzle + postgres driver |
| `drizzle/schema/` | Table definitions (no barrels) |
| `drizzle/migrations/` | Generated SQL + `meta/` |
| `drizzle/mappers/` | Raw row ↔ domain entity |
| `drizzle/repositories/` | Implementations of `src/domain/.../application/repositories/*` |

## Seeder

Run with `bun run db:seed`. The seeder stack follows port/adapter separation:

- `seeders/seeder.ts` — `Seeder` interface (`seed(): Promise<void>`). All context seeders implement this.
- `seeders/<context>.seeder.ts` — depends **only** on domain ports (`AccountRepository`, `HashGenerator`, etc.). Never imports Drizzle directly.
- `factories/make-seeder.factory.ts` — the only file that knows about concrete adapters (`DrizzleAccountRepository`, `BunHasher`). `DatabaseSeeder` lives here and calls each seeder in order.
- `seed.ts` — entry point only: `makeSeeder().run()`.

**Adding a new context seeder:**
1. Create `seeders/<context>.seeder.ts` implementing `Seeder` via domain ports.
2. Add the concrete adapter wiring in `makeSeeder()` inside `factories/make-seeder.factory.ts`.
3. Add `new <Context>Seeder(...)` as a new constructor param on `DatabaseSeeder` and call `.seed()` in `run()`.

**Cross-seeder IDs:** when seeder B needs an ID created by seeder A, inject seeder B with the same repository port seeder A wrote to, and query by a known fixed value (e.g. `"seed@example.com"`).

## Rules

- Schema changes → `bun run db:generate` then migrate; see repo root `CLAUDE.md` for scripts.
- Mappers and repositories stay **here**; domain keeps **interfaces** only.
- `drizzle.config.ts` (repo root) points at `./src/infra/env`—`DATABASE_URL` must be set for kit commands.

## See also

- Parent layer: @src/infra/CLAUDE.md
- Identity persistence: @src/domain/identity/CLAUDE.md
