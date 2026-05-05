# src/infra/cryptography/jwt

Playbook for **`jwt.plugin.ts`** and JWT adapters used by the **identity** bounded context.

## Plugin: `jwtPlugin`

- **File:** `jwt.plugin.ts`
- **Elysia name:** `Jwt.Plugin`
- **Dependencies:** `@elysiajs/jwt`, `env.JWT_ACCESS_SECRET`, `env.JWT_REFRESH_SECRET` (`src/infra/env/index.ts`).
- **Registers:**
  - **`jwtAccessToken`** — 15m expiry, payload schema `{ sub: z.uuid() }`.
  - **`jwtRefreshToken`** — 7d expiry, same payload shape.
- **Context:** **`jwt`** object with `{ accessToken, refreshToken }` (Elysia JWT helpers) derived globally for downstream routes.

Use this plugin wherever you need to **sign** or **verify** tokens in HTTP handlers (e.g. `authenticate-account.controller`, `auth.plugin`).

## Adapters (non-plugin)

| File | Role |
|------|------|
| `jwt-encrypter.ts` | Implements domain **`Encrypter`** port using a single JWT signer (`access` vs `refresh` instances wired in `make-authenticate-account.factory.ts`). |
| `types.ts` | `JwtService` shape exposed on context after `.use(jwtPlugin)`. |

`bun-hasher.ts` lives in `../` (hashing port), not in this folder.

## Rules

- Access and refresh **must use different secrets** (see env schema).
- Keep issuer/audience/extra claims out of the minimal `sub` schema unless product needs them—update OpenAPI security docs if you change auth shape.
- Domain never imports this folder; only **infra** (controllers, factories, `auth` plugin).

## See also

- Bearer + macro that **verifies** access tokens: @src/infra/auth/CLAUDE.md
- Identity use case + HTTP controllers: @src/domain/identity/CLAUDE.md
