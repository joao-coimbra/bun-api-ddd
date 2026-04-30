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
| `drizzle/client.ts` | Singleton Drizzle + postgres driver |
| `drizzle/schema/` | Table definitions (no barrels) |
| `drizzle/migrations/` | Generated SQL + `meta/` |
| `drizzle/mappers/` | Raw row ↔ domain entity |
| `drizzle/repositories/` | Implementations of `src/domain/.../application/repositories/*` |

## Rules

- Schema changes → `bun run db:generate` then migrate; see repo root `CLAUDE.md` for scripts.
- Mappers and repositories stay **here**; domain keeps **interfaces** only.
- `drizzle.config.ts` (repo root) points at `./src/infra/env`—`DATABASE_URL` must be set for kit commands.

## See also

- Parent layer: @src/infra/CLAUDE.md
- Identity persistence: @docs/archiqueture/identity-bounded-context.md
