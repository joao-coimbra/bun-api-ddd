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

- Tracked file **`.env.test`** matches the default Docker Compose and GitHub Actions Postgres service (`docker` / `docker` user, database `careminder`, port `5432`).
- `bun run test:e2e` uses `NODE_ENV=test` and `--env-file=.env.test`.

**Security:** replace placeholder JWT secrets in real deployments; never reuse demo secrets in production.

## Database (Docker Compose)

From the repo root:

```bash
docker compose up -d
```

This starts Postgres **17** with user `docker`, password `docker`, database `careminder`, port **5432**, mounted at `./data/postgres` (add `data/` to `.gitignore` if you keep local volumes).

Stop:

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

E2E preload (`test/setup-e2e.ts`) creates an isolated Postgres **schema** per run, applies SQL migrations, and drops the schema in `afterAll`.

### Common issues

- **`DATABASE_URL` missing or connection refused** — Start Postgres (Compose or local) before `db:migrate` or `test:e2e`.
- **E2E fails locally but passes in CI** — Align `.env.test` with your DB host/port; CI uses `localhost:5432` and database `careminder`.
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
