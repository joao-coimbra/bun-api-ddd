# Getting started

## Prerequisites

- [Bun](https://bun.sh/) (current stable; the repo CI uses `latest`)
- [PostgreSQL](https://www.postgresql.org/) **17** locally or via Docker (see below)
- Optional: [Docker](https://docs.docker.com/) + Docker Compose for a one-command database

## Install

```bash
git clone <your-fork-or-template-url> my-api
cd my-api
bun install
```

## Environment variables

All runtime configuration is validated in `src/infra/env/index.ts` with **zod**. Define variables in `.env` (development) or the process environment (CI/production).

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | no | `development` | `development` \| `production` \| `test` |
| `PORT` | no | `3333` | HTTP listen port |
| `DATABASE_URL` | **yes** | — | Postgres connection string (e.g. `postgresql://user:pass@localhost:5432/dbname`) |
| `JWT_ACCESS_SECRET` | **yes** | — | Secret for signing short-lived access tokens |
| `JWT_REFRESH_SECRET` | **yes** | — | Secret for signing refresh tokens (keep distinct from access) |

### Local `.env`

```bash
cp .env.example .env
# Edit .env: point DATABASE_URL at your Postgres and set strong JWT secrets.
```

Bun loads `.env` automatically for `bun run` / `bun test` in development.

### E2E / CI

- Tracked file **`.env.test`** matches the default Docker Compose and GitHub Actions Postgres service (`docker` / `docker` user, database **`template`**, port **`5432`**).
- `bun run test:e2e` uses `NODE_ENV=test` and `--env-file=.env.test`.

**Security:** replace placeholder JWT secrets in real deployments; never reuse demo secrets in production.

## Database (Docker Compose)

From the repo root:

```bash
docker compose up -d
```

This starts Postgres **17** with user **`docker`**, password **`docker`**, and — **on the first run only** (empty `./data/postgres`) — database **`template`** as in **`POSTGRES_DB`**, port **5432**.

**If you see *“Skipping initialization”* in the container logs**, the data directory already had a cluster: Docker does **not** re-read `POSTGRES_USER` / `POSTGRES_DB` for that volume. Your **`.env`** `DATABASE_URL` must use a database that **already exists** in that cluster (e.g. whatever was created the first time), **or** you wipe local data and let Postgres init again:

```bash
docker compose down
rm -rf data/postgres   # may need sudo if files are owned by the container user
docker compose up -d
```

Then run `bun run db:migrate` after the server logs *“ready to accept connections”*.

Data lives at **`./data/postgres`**; add **`data/`** to `.gitignore` if you keep local volumes.

Stop the stack:

```bash
docker compose down
```

## Migrations

After `DATABASE_URL` is available (e.g. `.env` present):

```bash
bun run db:migrate
```

Generate a new migration after editing Drizzle schema under `src/infra/database/drizzle/schema/`:

```bash
bun run db:generate
bun run db:migrate
```

Inspect data:

```bash
bun run db:studio
```

`drizzle.config.ts` imports `src/infra/env`; generation needs a valid `DATABASE_URL` in the environment.

## Run the API

```bash
bun run dev
```

- Server: `http://localhost:${PORT}` (default **3333**)
- Health: `HEAD /health` → `OK`
- OpenAPI UI: `GET /docs` (Elysia OpenAPI plugin)

## Tests

| Command | Scope |
|---------|--------|
| `bun test` | All `*.spec.ts` next to source (unit + use-case tests) |
| `bun run test:e2e` | All `*.e2e-spec.ts` under `src/`; requires **Postgres** and `.env.test` (or equivalent env) |

**Spec style:** use cases and most unit tests use **`it("should …")`**. Value-object specs (`*.vo.spec.ts`, e.g. `slug.vo.spec.ts`) and **E2E** files use **`test()`** with **no** `should` prefix on titles. Details: [`test/CLAUDE.md`](../../test/CLAUDE.md).

**Use case unit tests:** assert **`expect(result.isRight()).toBeTrue()`** or **`expect(result.isLeft()).toBeTrue()`** first; call **`result.getOrThrow()`** after **`isRight()`** when you need the returned value (tokens, entity, etc.). For failures this template often stops at **`isLeft()`**; add **`try` / `catch`** around **`getOrThrow()`** only when you must assert a specific error class/message. Use **one `it` per scenario**; the shipped **`identity`** specs illustrate a minimal set of flows.

**E2E data:** **`new AccountFactory(db)`**; **`beforeEach`** with **`await db.delete(schema.users)`** when a clean **`users`** table is required; assert on **HTTP**. **Bearer / pre-authenticated user:** **`await factory.makeDrizzleAuthenticatedAccount()`** then **`api.<route>.<method>({ headers: authHeader })`** — see **`get-my-profile.controller.e2e-spec.ts`** and [`test/CLAUDE.md`](../../test/CLAUDE.md). **`@elysiajs/eden` treaty:** **`204`** → often **`response.data === ""`**; **`200`** JSON → **`toMatchObject`**.

E2E preload (`test/setup-e2e.ts`) creates an isolated Postgres **schema** per run, applies SQL migrations, and drops the schema in `afterAll`.

### Common issues

- **`DATABASE_URL` missing or connection refused** — Start Postgres (Compose or local) before `db:migrate` or `test:e2e`.
- **E2E fails locally but passes in CI** — Align **`.env.test`** with your real DB name on disk (after a reused volume, that may not be **`template`** until you re-init — see **Database (Docker Compose)** above).
- **JWT errors at runtime** — Ensure `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are set for any code path that mounts JWT plugins.

## Code quality

```bash
bun run check   # Ultracite: lint + format diagnostics
bun run fix     # apply fixes (also run on pre-commit via Husky)
```

## Production-shaped run

```bash
bun run build
NODE_ENV=production bun run start
```

Ensure production env provides `DATABASE_URL`, JWT secrets, and any `PORT` override.

## See also

- [New API from this template](new-project-from-template.md)
- [Identity bounded context](identity-bounded-context.md) — HTTP contract for `/accounts` and `/sessions`
- [`test/CLAUDE.md`](../../test/CLAUDE.md) — factories and in-memory repositories
