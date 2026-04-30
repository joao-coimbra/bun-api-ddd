# Identity bounded context

Reference for the **`identity`** bounded context (account registration and persistence). For conventions and naming, see [`src/domain/identity/CLAUDE.md`](../../src/domain/identity/CLAUDE.md) and the generic layout in [`src/domain/CLAUDE.md`](../../src/domain/CLAUDE.md).

## Purpose

- Model **accounts** as an aggregate (`Account`) with public identifiers: `name`, `username`, `email`, `slug`.
- **Register** new accounts with hashed passwords (application ports for hashing; no raw crypto in the domain).
- Enforce **uniqueness** of `slug`, `username`, and `email` via use-case checks and conflict errors (`409` / `ConflictError` subclasses).

## Ubiquitous language

| Term | Meaning |
|------|--------|
| Account | Aggregate root for a registered user identity in this system. |
| Slug | URL-safe identifier; optional on registration—defaults from display name when omitted. |
| Register account | Application use case that validates uniqueness, hashes the password, persists the aggregate. |

## Code map

| Layer | Location |
|-------|----------|
| Entity, VO | `src/domain/identity/enterprise/` (`account.entity.ts`, `value-objects/slug.vo.ts`) |
| Use case, errors, repository contract, crypto ports | `src/domain/identity/application/` |
| HTTP | `src/infra/http/controllers/register-account.controller.ts`, factory, `account.presenter.ts` |
| Hashing (Bun) | `src/infra/cryptography/bun-hasher.ts` |
| Drizzle | `src/infra/database/drizzle/schema/user.ts`, `mappers/drizzle-account.mapper.ts`, `repositories/drizzle-account.repository.ts` |

The relational table is named **`user`** in Drizzle; the domain concept remains **Account**.

## HTTP

- **POST** `/accounts` — body: `name`, `username`, `email`, `password`, optional `slug`.
- The controller calls the use case and may use `getOrThrow()` on the `Either`; map `AppError` in a global hook if you need stable JSON for expected failures.

## Tests

- Unit: `register-account.use-case.spec.ts`, `slug.vo.spec.ts`.
- Integration: `register-account.controller.e2e-spec.ts` (requires Postgres; see `test/setup-e2e.ts` and `.env.test`).
- Test doubles: `test/factories/make-account.factory.ts`, `test/repositories/in-memory-account.repository.ts`, `test/cryptography/fake-hasher.ts`.

## Related

- Domain-wide structure: [`domain-structure.md`](domain-structure.md).
- Adding a new context: copy `src/domain/[bounded-context]/` and follow [`src/domain/CLAUDE.md`](../../src/domain/CLAUDE.md).
