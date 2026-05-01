# New API from this template

Use this checklist when you copy, fork, or generate a **new** service from **bun-ddd-api-template** so the codebase stays consistent and deployable.

## 1. Repository and package identity

- Pick a repository name and update **`package.json`** → `name`.
- Replace marketing strings that still say “template” where it matters for your product:
  - [`src/infra/app.ts`](../../src/infra/app.ts) — OpenAPI `title`, `description`, `version`.
  - [`README.md`](../../README.md) — title and intro (optional but recommended).

## 2. Secrets and URLs

- Rotate **JWT** secrets (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`) in every non-demo environment.
- Point **`DATABASE_URL`** at your real Postgres (managed DB, Compose, or k8s secret).
- In CI (e.g. GitHub Actions), inject production secrets as encrypted variables; do not commit `.env` with production values.
- If you change the default DB name or user (`careminder`, `docker`), update:
  - **`.env.example`**
  - **`.env.test`** (or equivalent test env) so `bun run test:e2e` still connects.
  - **`docker-compose.yml`** and **`.github/workflows/run-ci.yml`** if you still use those defaults.

## 3. Domain model

- Keep **`identity`** as the reference for **accounts and authentication** unless you deliberately split IAM later.
- Add **new bounded contexts** as siblings under `src/domain/<context>/`, not by overloading `identity` with unrelated aggregates.
- Link new context playbooks from [`src/domain/CLAUDE.md`](../../src/domain/CLAUDE.md).
- Read [`domain-structure.md`](domain-structure.md) and the *Per-context layout* section in `src/domain/CLAUDE.md`.

## 4. HTTP surface

- Register new route modules from [`src/infra/http/http.module.ts`](../../src/infra/http/http.module.ts).
- Follow existing flow: **controller** (thin) → **factory** (wires use case + repos/adapters) → **presenter** when response shaping is non-trivial.
- Prefer **colocated** `*.e2e-spec.ts` next to controllers when you add routes that need Postgres.

## 4.1 Development strategy (TDD)

- Keep **TDD-first** as a team rule (and for coding agents): failing test first, minimal implementation, refactor with tests green.
- Preserve and adapt `CLAUDE.md` rules so agents keep consistent test-driven behavior when new features are added.

## 5. Database

- Drizzle schema lives in `src/infra/database/drizzle/schema/`.
- After schema changes: `bun run db:generate` then commit generated SQL under `migrations/`.
- Never edit applied migration files in shared environments; add new revisions instead.

## 6. Errors and status codes

- Application errors in domain layers should **`extend`** bases in `src/core/errors` (see [`src/core/CLAUDE.md`](../../src/core/CLAUDE.md)).
- Map **`Either`** failures to HTTP in a dedicated Elysia error hook if you rely on **`getOrThrow()`** in controllers and need stable `4xx` JSON.

## 7. Documentation and onboarding

- Keep **CLAUDE.md** hierarchy accurate when you add layers or contexts (see root [`CLAUDE.md`](../../CLAUDE.md)).
- Add or update **docs under `docs/archiqueture/`** for any bounded context that becomes a long-lived product area (like **identity**).

## 8. Optional cleanups

- Remove or replace this document’s references if you publish a slim fork without the `docs/archiqueture/` folder.
- Add **`data/`** to `.gitignore` if developers use Compose and you do not want Postgres volume data tracked.

When in doubt, treat **`identity`** + [`identity-bounded-context.md`](identity-bounded-context.md) as the **golden path** for auth and persistence patterns in this layout.
