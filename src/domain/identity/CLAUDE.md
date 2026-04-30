# src/domain/identity

Bounded context for **accounts**: registration, credentials (hashing contracts), and public identifiers (`slug`, `username`, `email`).

## Scope

- **Enterprise:** `Account` aggregate, `Slug` value object.
- **Application:** `RegisterAccountUseCase`, `AccountRepository` contract, cryptography ports (`HashGenerator`, `HashComparer`, `Encrypter`), conflict errors for duplicate slug/username/email.

## Conventions here

- Optional HTTP `slug`: when omitted, the use case defaults with `Slug.createFromText(name).value` before checks and persistence.
- Repository **finders** receive the same string shapes the use case already resolved; normalization for storage stays on the domain (`Slug.create` / `Account.create`), not in repository implementations.

## Cross-layer wiring

- Infra implements `AccountRepository` (Drizzle) and hashing (`BunHasher` under `src/infra/cryptography/`).
- HTTP (`register-account.controller`) may call `result.getOrThrow()` on the use case; map `AppError` / `Either` failures to status codes in a shared Elysia error hook if you need structured 4xx responses.
- See @src/infra/CLAUDE.md for HTTP and database layout.

## Tests

- Use case specs: `application/use-cases/register-account.use-case.spec.ts`.
- VO specs: enterprise `slug.vo.spec.ts`.
- Test doubles: `test/factories/make-account.factory.ts`, `test/repositories/in-memory-account.repository.ts`, `test/cryptography/fake-hasher.ts`.
