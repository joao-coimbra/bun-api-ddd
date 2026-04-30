# src/domain/identity

Bounded context for **accounts**: registration, authentication, credentials (hashing contracts), and public identifiers (`slug`, `username`, `email`).

In this template, **`identity`** is the **canonical** bounded context for accounts and auth; treat it as the home for that evolution. For adding **other** domains, see @docs/archiqueture/domain-structure.md.

## Scope

- **Enterprise:** `Account` aggregate, `Slug` value object.
- **Application:** `RegisterAccountUseCase`, `AuthenticateAccountUseCase`, `AccountRepository` contract, cryptography ports (`HashGenerator`, `HashComparer`, `Encrypter`), conflict errors for duplicate slug/username/email, `WrongCredentialsError` for failed sign-in.

## Conventions here

- Optional HTTP `slug`: when omitted, the use case defaults with `Slug.createFromText(name).value` before checks and persistence.
- Repository **finders** receive the same string shapes the use case already resolved; normalization for storage stays on the domain (`Slug.create` / `Account.create`), not in repository implementations.

## Cross-layer wiring

- Infra implements `AccountRepository` (Drizzle) and hashing (`BunHasher` under `src/infra/cryptography/`). JWT signing for tokens uses `JwtEncrypter` + `jwtPlugin` — playbook @src/infra/cryptography/jwt/CLAUDE.md. DB decoration: @src/infra/database/CLAUDE.md. Bearer-protected routes: @src/infra/auth/CLAUDE.md.
- HTTP: `register-account.controller` (`POST /accounts`), `authenticate-account.controller` (`POST /sessions`). Controllers may call `result.getOrThrow()` on the use case; map `AppError` / `Either` failures to status codes in a shared Elysia error hook if you need structured 4xx responses.
- See @src/infra/CLAUDE.md for HTTP and database layout.

## Tests

- Use case specs: `application/use-cases/register-account.use-case.spec.ts`, `authenticate-account.use-case.spec.ts`.
- VO specs: enterprise `slug.vo.spec.ts`.
- E2E: `src/infra/http/controllers/register-account.controller.e2e-spec.ts`, `authenticate-account.controller.e2e-spec.ts` (Postgres + `.env.test`).
- Test doubles: `test/factories/make-account.factory.ts`, `test/repositories/in-memory-account.repository.ts`, `test/cryptography/fake-hasher.ts`.

## Further reading

- Full file map and HTTP details: @docs/archiqueture/identity-bounded-context.md
