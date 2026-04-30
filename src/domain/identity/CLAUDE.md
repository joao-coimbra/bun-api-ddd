# src/domain/identity

Bounded context for **accounts**: registration, authentication, credentials (hashing contracts), and public identifiers (`slug`, `username`, `email`).

In this template, **`identity`** is the **canonical** bounded context for accounts and auth; treat it as the home for that evolution. For adding **other** domains, see @docs/archiqueture/domain-structure.md.

## Scope

- **Enterprise:** `Account` aggregate, `Slug` value object.
- **Application:** `RegisterAccountUseCase`, `AuthenticateAccountUseCase`, `GetMyProfileUseCase`, `AccountRepository`, cryptography ports (`HashGenerator`, `HashComparer`, `Encrypter`), conflict errors, `WrongCredentialsError`, `AccountNotFoundError`.

## Conventions here

- Optional HTTP `slug`: when omitted, the use case defaults with `Slug.createFromText(name).value` before checks and persistence.
- Repository **finders** receive the same string shapes the use case already resolved; normalization for storage stays on the domain (`Slug.create` / `Account.create`), not in repository implementations.

## Cross-layer wiring

- Infra implements `AccountRepository` (Drizzle) and hashing (`BunHasher` under `src/infra/cryptography/`). JWT signing for tokens uses `JwtEncrypter` + `jwtPlugin` — playbook @src/infra/cryptography/jwt/CLAUDE.md. DB decoration: @src/infra/database/CLAUDE.md. Bearer-protected routes: @src/infra/auth/CLAUDE.md.
- HTTP: `register-account.controller` (`POST /accounts`), `authenticate-account.controller` (`POST /sessions`), `get-my-profile.controller` (`GET /me`, bearer). Controllers may call `result.getOrThrow()` on the use case; map `AppError` / `Either` failures to status codes in a shared Elysia error hook if you need structured 4xx responses.
- See @src/infra/CLAUDE.md for HTTP and database layout.

## Tests

- Use case specs: `application/use-cases/register-account.use-case.spec.ts`, `authenticate-account.use-case.spec.ts`, `get-my-profile.use-case.spec.ts`. Each **`it`** covers **one flow**; **`expect(result.isRight()).toBeTrue()`** or **`isLeft()`**, then **`getOrThrow()`** on success when the returned value is checked. Coverage stays **lean** for a template — main happy path plus representative failures (e.g. one conflict type per identifier on register; unknown email vs wrong password on authenticate).
- VO specs: enterprise `slug.vo.spec.ts` — uses **`test()`** and titles **without** a `should` prefix (see @test/CLAUDE.md).
- E2E: `register-account.controller.e2e-spec.ts`, `authenticate-account.controller.e2e-spec.ts`, `get-my-profile.controller.e2e-spec.ts` (Postgres + **`.env.test`**). **`new AccountFactory(db)`**. For **GET `/me`** and other bearer routes, use **`await accountFactory.makeDrizzleAuthenticatedAccount()`** and pass **`authHeader`** into treaty (e.g. **`api.me.get({ headers: authHeader })`**) — see **`get-my-profile.controller.e2e-spec.ts`**. Use **`beforeEach`** → **`db.delete(schema.users)`** per **`describe`** when isolation matters. **Eden treaty:** @test/CLAUDE.md.
- Test doubles: `test/factories/make-account.factory.ts`, `test/repositories/in-memory-account.repository.ts`, `test/cryptography/fake-hasher.ts`.

## Further reading

- Full file map and HTTP details: @docs/archiqueture/identity-bounded-context.md
