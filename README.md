# bun-ddd-api-template

TypeScript API template based on Bun and Domain-Driven Design (DDD), with bounded contexts and a working infra layer (HTTP + Drizzle + Postgres).

## What this template provides

- Bun-first runtime and tooling.
- DDD-oriented project layout by bounded context (`src/domain/[bounded-context]`).
- Reusable application error hierarchy in `src/core/errors`.
- Infra layer with:
  - Elysia app/server bootstrap
  - HTTP module/controller/factory/presenter flow
  - Drizzle repository implementation and schema
  - typed env loader (`zod`)
- Reference bounded contexts:
  - **`example`** — aggregate (`Example`), value object (`Slug`), use case with `Either`, domain events and subscribers, in-memory test setup.
  - **`identity`** — `Account`, `RegisterAccount`, `AuthenticateAccount`, crypto ports, Drizzle `users` table + migrations, `POST /accounts`, `POST /sessions` (access token in body, refresh token in httpOnly cookie). Reference: [`docs/archiqueture/identity-bounded-context.md`](docs/archiqueture/identity-bounded-context.md); playbook: [`src/domain/identity/CLAUDE.md`](src/domain/identity/CLAUDE.md).

## Tech stack

- [Bun](https://bun.sh/)
- TypeScript
- [archstone](https://www.npmjs.com/package/archstone)
- [Elysia](https://elysiajs.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [zod](https://zod.dev/)
- Ultracite + Biome + Husky

## Project structure

```txt
src/
  core/
    errors/
  domain/
    [bounded-context]/
      README.md
    example/
      application/
      enterprise/
    identity/
      application/
        cryptography/
        repositories/
        use-cases/
      enterprise/
        entities/
          value-objects/
  infra/
    app.ts
    server.ts
    env/
    cryptography/     BunHasher, JWT encrypter adapter (identity ports)
    http/
    database/
      drizzle/
        migrations/   generated SQL (`bun run db:generate`)
test/
  cryptography/
  factories/
  repositories/
docs/
  archiqueture/
    domain-structure.md
    identity-bounded-context.md
```

For the domain rationale, see `docs/archiqueture/domain-structure.md`.

## Getting started

Install dependencies:

```bash
bun install
```

Create your local environment file:

```bash
cp .env.example .env
```

Run API in development mode:

```bash
bun run dev
```

Run tests:

```bash
bun test
```

Optional integration tests (Postgres + `.env.test`; see `test/setup-e2e.ts`):

```bash
bun run test:e2e
```

Run code quality checks:

```bash
bun run check
```

Apply automatic fixes:

```bash
bun run fix
```

Database workflows:

```bash
bun run db:generate
bun run db:migrate
bun run db:studio
```

Run local Postgres with Docker:

```bash
docker compose up -d
```

## Working with new contexts

When creating a new subdomain, use `src/domain/[bounded-context]/README.md` as a template and keep the same layering pattern:

- `enterprise/` for entities and value objects
- `application/` for use cases, contracts, and application-level errors

This keeps each context cohesive and independently evolvable.

## Documentation / AI context

Read in this order for conventions and layout:

1. [`CLAUDE.md`](CLAUDE.md) — root commands and global rules
2. [`src/CLAUDE.md`](src/CLAUDE.md) — layer dependency (`infra → domain → core`)
3. [`src/domain/CLAUDE.md`](src/domain/CLAUDE.md) — bounded-context structure
4. [`src/domain/identity/CLAUDE.md`](src/domain/identity/CLAUDE.md) — identity context playbook
5. [`docs/archiqueture/identity-bounded-context.md`](docs/archiqueture/identity-bounded-context.md) — identity BC reference
6. [`src/infra/CLAUDE.md`](src/infra/CLAUDE.md), [`src/core/CLAUDE.md`](src/core/CLAUDE.md), [`test/CLAUDE.md`](test/CLAUDE.md) — as needed

Architecture notes: [`docs/archiqueture/domain-structure.md`](docs/archiqueture/domain-structure.md)
