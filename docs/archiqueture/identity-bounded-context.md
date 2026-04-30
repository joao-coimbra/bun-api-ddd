# Identity bounded context

Reference for the **`identity`** bounded context (account registration, authentication, and persistence). For conventions and naming, see [`src/domain/identity/CLAUDE.md`](../../src/domain/identity/CLAUDE.md) and the generic layout in [`src/domain/CLAUDE.md`](../../src/domain/CLAUDE.md).

## Purpose

- Model **accounts** as an aggregate (`Account`) with public identifiers: `name`, `username`, `email`, `slug`.
- **Register** new accounts with hashed passwords (application ports for hashing; no raw crypto in the domain).
- **Authenticate** credentials and issue **access** and **refresh** tokens via the `Encrypter` port (JWT in infra).
- Enforce **uniqueness** of `slug`, `username`, and `email` via use-case checks and conflict errors (`409` / `ConflictError` subclasses).

## Ubiquitous language

| Term | Meaning |
|------|--------|
| Account | Aggregate root for a registered user identity in this system. |
| Slug | URL-safe identifier; optional on registration—defaults from display name when omitted. |
| Register account | Application use case that validates uniqueness, hashes the password, persists the aggregate. |
| Authenticate account | Use case that loads by email, compares password hash, returns encrypted access and refresh tokens. |
| Wrong credentials | Domain error when email is unknown or password does not match (`401` / `WrongCredentialsError`). |

## Code map

| Layer | Location |
|-------|----------|
| Entity, VO | `src/domain/identity/enterprise/` (`account.entity.ts`, `value-objects/slug.vo.ts`) |
| Use cases, errors, repository contract, crypto ports | `src/domain/identity/application/` (`register-account.use-case.ts`, `authenticate-account.use-case.ts`, …) |
| HTTP (register) | `src/infra/http/controllers/register-account.controller.ts`, `make-register-account.factory.ts`, `account.presenter.ts` |
| HTTP (auth) | `src/infra/http/controllers/authenticate-account.controller.ts`, `make-authenticate-account.factory.ts` |
| JWT (Elysia + signing) | `src/infra/cryptography/jwt/` (`jwt.plugin.ts`, `jwt-encrypter.ts`, `types.ts`) |
| Hashing (Bun) | `src/infra/cryptography/bun-hasher.ts` |
| Drizzle | `src/infra/database/drizzle/schema/users.ts`, `mappers/drizzle-account.mapper.ts`, `repositories/drizzle-account.repository.ts` |

The relational table is named **`users`** in Drizzle; the domain concept remains **Account**.

## HTTP

- **POST** `/accounts` — body: `name`, `username`, `email`, `password`, optional `slug`.
- **POST** `/sessions` — body: `email`, `password` (min 8 characters). Response **200**: JSON `{ accessToken }`. A **refresh token** is set in an **httpOnly** cookie (`refreshToken`), scoped to `path: "/auth/refresh"` for a future refresh route. **401** is documented for wrong credentials.

Controllers call `result.getOrThrow()` on the use-case `Either`. Expected failures are **`AppError` subclasses** (e.g. `WrongCredentialsError`, conflict errors). Map them in a shared Elysia `onError` hook if you want stable JSON bodies for every status code; otherwise `getOrThrow()` may surface them as generic server errors instead of `401`/`409` responses.

## Configuration

- JWT secrets are required at runtime: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (see `src/infra/env/index.ts`).

## Tests

- Unit: `register-account.use-case.spec.ts`, `authenticate-account.use-case.spec.ts`, `slug.vo.spec.ts`.
- E2E: `register-account.controller.e2e-spec.ts`, `authenticate-account.controller.e2e-spec.ts` (need a running Postgres and `test/setup-e2e.ts` / `.env.test` as in CI; local runs fail without DB).

## Related

- Domain-wide structure and **identity vs example**: [`domain-structure.md`](domain-structure.md).
- Full documentation stack (infra / core / test tiers, task shortcuts): [`src/CLAUDE.md`](../../src/CLAUDE.md) — *Memory / docs hierarchy*.
- Adding a new context: copy `src/domain/[bounded-context]/` and follow [`src/domain/CLAUDE.md`](../../src/domain/CLAUDE.md); model layout on **`identity`**, patterns from **`example`**.
