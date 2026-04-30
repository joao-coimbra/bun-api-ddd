# src/infra/auth

Playbook for **`auth.plugin.ts`** — protected routes and bearer JWT verification.

## Plugin: `authPlugin`

- **File:** `auth.plugin.ts`
- **Elysia name:** `Auth.Plugin`
- **Composition:** `.use(bearer())` ( `@elysiajs/bearer` ) → `.use(jwtPlugin)` → `.use(databasePlugin)` so `Authorization: Bearer <access>` can be verified and `users` can be loaded.
- **Macro:** **`auth`** — resolves when the route opts into the macro (see Elysia `macro("auth", …)`).
  - Verifies the bearer token with **`jwt.accessToken`**.
  - On success, exposes **`userId`** (`sub`) and **`getCurrentUser()`** (Drizzle row from `users`, throws `UnauthorizedError` if missing).
  - Adds OpenAPI **`bearerAuth`** security for documented routes using this macro.

Use **`authPlugin`** on Elysia trees that define **authenticated** endpoints (not on the public `register`/`sessions` controllers unless you nest them under a parent that already uses it).

## When to use vs raw `jwtPlugin`

| Need | Use |
|------|-----|
| Issue tokens on login | `jwtPlugin` in `authenticate-account.controller` |
| Require `Authorization: Bearer` + optional DB user | `authPlugin` + `.macro("auth")` on the route |

## Rules

- Prefer **`UnauthorizedError`** from `@/core/errors` for missing/invalid bearer or unknown user so a global error mapper can return **401** consistently.
- Do not put business rules here—only transport + identity lookup; domain use cases stay in `src/domain/identity`.

## See also

- JWT signing/verification primitives: @src/infra/cryptography/jwt/CLAUDE.md
- DB context: @src/infra/database/CLAUDE.md
- Parent: @src/infra/CLAUDE.md
