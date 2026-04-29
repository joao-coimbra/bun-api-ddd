# bun-ddd-api-template

TypeScript API template based on Bun and Domain-Driven Design (DDD), with a practical bounded-context structure and an executable `example` domain.

## What this template provides

- Bun-first runtime and tooling.
- DDD-oriented project layout by bounded context (`src/domain/[bounded-context]`).
- Reusable application error hierarchy in `src/core/errors`.
- Example domain with:
  - entity (`Example`)
  - value object (`Slug`)
  - use case with explicit error flow (`Either`)
  - in-memory test infrastructure and specs

## Tech stack

- [Bun](https://bun.sh/)
- TypeScript
- [archstone](https://www.npmjs.com/package/archstone)
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

## Working with new contexts

When creating a new subdomain, use `src/domain/[bounded-context]/README.md` as a template and keep the same layering pattern:

- `enterprise/` for entities and value objects
- `application/` for use cases, contracts, and application-level errors

This keeps each context cohesive and independently evolvable.
