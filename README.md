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
- Example domain with:
  - entity (`Example`)
  - value object (`Slug`)
  - use case with explicit error flow (`Either`)
  - in-memory test infrastructure and specs

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
        repositories/
        use-cases/
      enterprise/
        entities/
          value-objects/
  infra/
    app.ts
    server.ts
    env/
    http/
    database/
test/
  factories/
  repositories/
docs/
  archiqueture/
    domain-structure.md
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
