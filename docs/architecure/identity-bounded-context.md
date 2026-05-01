# Identity bounded context

Reference for the **`identity`** bounded context (account registration, authentication, and persistence). For conventions and naming, see [`src/domain/identity/CLAUDE.md`](../../src/domain/identity/CLAUDE.md) and the generic layout in [`src/domain/CLAUDE.md`](../../src/domain/CLAUDE.md).

## Purpose

- Model **accounts** as an aggregate (`Account`) with public identifiers: `name`, `username`, `email`, `slug`.
- **Register** new accounts with hashed passwords (application ports for hashing; no raw crypto in the domain).
- **Authenticate** credentials and issue **access** and **refresh** tokens via the `Encrypter` port (JWT in infra).
- **Get my profile** — bearer-protected read of the authenticated account (`GetMyProfileUseCase`).
- Enforce **uniqueness** of `slug`, `username`, and `email` via use-case checks and conflict errors (`409` / `ConflictError` subclasses).

## Ubiquitous language

| Term | Meaning |
|------|--------|
| Account | Aggregate root for a registered user identity in this system. |
| Slug | URL-safe identifier; optional on registration—defaults from display name when omitted. |
| Register account | Application use case that validates uniqueness, hashes the password, persists the aggregate. |
| Authenticate account | Use case that loads by email, compares password hash, returns encrypted access and refresh tokens. |
| Get my profile | Use case that loads the account for the authenticated subject (`401` / `AccountNotFoundError` when missing). |
| Wrong credentials | Domain error when email is unknown or password does not match (`401` / `WrongCredentialsError`). |

## Code map

| Layer | Location |
|-------|----------|
| Entity, VO | `src/domain/identity/enterprise/` (`account.entity.ts`, `value-objects/slug.vo.ts`) |
| Use cases, errors, repository contract, crypto ports | `src/domain/identity/application/` (`register-account.use-case.ts`, `authenticate-account.use-case.ts`, `get-my-profile.use-case.ts`, …) |
| HTTP (register) | `src/infra/http/controllers/register-account.controller.ts`, `make-register-account.factory.ts`, `account.presenter.ts` |
| HTTP (auth) | `src/infra/http/controllers/authenticate-account.controller.ts`, `make-authenticate-account.factory.ts` |
| HTTP (me) | `src/infra/http/controllers/get-my-profile.controller.ts`, `make-get-my-profile.factory.ts` |
| Protected routes (bearer) | `src/infra/auth/auth.plugin.ts` — playbook: [`auth/CLAUDE.md`](../../src/infra/auth/CLAUDE.md) |
| JWT (Elysia + signing) | `src/infra/cryptography/jwt/` (`jwt.plugin.ts`, `jwt-encrypter.ts`, `types.ts`) — playbook: [`jwt/CLAUDE.md`](../../src/infra/cryptography/jwt/CLAUDE.md) |
| Hashing (Bun) | `src/infra/cryptography/bun-hasher.ts` |
| E2E (HTTP) | `register-account.controller.e2e-spec.ts`, `authenticate-account.controller.e2e-spec.ts`, `get-my-profile.controller.e2e-spec.ts` |

## HTTP

- **POST** `/accounts` — body: `name`, `username`, `email`, `password`, optional `slug`.
- **POST** `/sessions` — body: `email`, `password` (min 8 characters). Response **200**: JSON `{ accessToken }`. A **refresh token** is set in an **httpOnly** cookie (`refreshToken`), scoped to `path: "/auth/refresh"` for a future refresh route. **401** is documented for wrong credentials.
- **GET** `/me` — **bearer** access token. Response **200**: account profile JSON (presenter). **401** when the token subject does not resolve to an account.

Controllers call `result.getOrThrow()` on the use-case `Either`. Expected failures are **`AppError` subclasses** (e.g. `WrongCredentialsError`, conflict errors). Map them in a shared Elysia `onError` hook if you want stable JSON bodies for every status code; otherwise `getOrThrow()` may surface them as generic server errors instead of `401`/`409` responses.

## Configuration

- JWT secrets are required at runtime: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (see `src/infra/env/index.ts`).

## Tests

- Unit — use cases: `register-account.use-case.spec.ts`, `authenticate-account.use-case.spec.ts`, `get-my-profile.use-case.spec.ts`. Each **`it`** is **one flow**; **`expect(result.isRight()).toBeTrue()`** / **`isLeft()`** (Bun **`.toBeTrue()`**), then **`getOrThrow()`** on success when the payload is asserted. Template keeps a **small** set of scenarios (main success + representative failures).
- Unit — VO: `slug.vo.spec.ts` uses **`test()`** and titles without a `should` prefix (see [`test/CLAUDE.md`](../../test/CLAUDE.md)).
- E2E: `register-account.controller.e2e-spec.ts`, `authenticate-account.controller.e2e-spec.ts`, **`get-my-profile.controller.e2e-spec.ts`** (Postgres + `test/run-e2e.ts` + `.env.test`). **`new AccountFactory(db)`**; **`beforeEach`** → **`await db.delete(schema.users)`** per nested **`describe`** when isolation is needed. Assert on HTTP only (no `db.select` for outcomes). **`@elysiajs/eden` treaty:** **`204`** often returns **`response.data === ""`**; JSON **`200`** → **`toMatchObject`**. **Bearer routes:** **`await accountFactory.makeDrizzleAuthenticatedAccount()`** returns **`authHeader`** — pass **`{ headers: authHeader }`** to treaty so the user is **pre-authenticated** without calling **`/sessions`** (reference: **`get-my-profile.controller.e2e-spec.ts`**). Full rules: [`test/CLAUDE.md`](../../test/CLAUDE.md).

## Related

- [Getting started](getting-started.md) — env, Postgres, tests.
- [New API from this template](new-project-from-template.md) — fork checklist.
- [Architecture doc index](README.md).
- Domain-wide structure: [`domain-structure.md`](domain-structure.md).
- Full documentation stack (infra / core / test tiers, task shortcuts): [`src/CLAUDE.md`](../../src/CLAUDE.md) — *Memory / docs hierarchy*.
- Adding a new context: copy `src/domain/[bounded-context]/` and follow [`src/domain/CLAUDE.md`](../../src/domain/CLAUDE.md); model layout on **`identity`**, use that file’s sections for events and subscribers when needed.
