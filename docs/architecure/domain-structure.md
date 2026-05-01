# Domain Structure

The domain layer is organized by **bounded context** under `src/domain/[bounded-context]`.

## Contexts in this template

- **`identity`** — **Permanent reference** for this repo: accounts, registration, authentication, crypto ports, Drizzle `users`. It is the canonical place for auth/account evolution. Playbook: [`src/domain/identity/CLAUDE.md`](../../src/domain/identity/CLAUDE.md). Deep file/API map: [`identity-bounded-context.md`](identity-bounded-context.md). Prefer extending **`identity`** over introducing a parallel “users” context.

The tree under `src/domain/` does **not** ship a second sample context; add **new** folders for other product areas (billing, catalog, …), each with its own `CLAUDE.md` linked from [`src/domain/CLAUDE.md`](../../src/domain/CLAUDE.md). Use **`identity`** as the layout reference; for **domain events**, **subscribers**, and **`WatchedList`**, follow the patterns in [`src/domain/CLAUDE.md`](../../src/domain/CLAUDE.md) and [`archstone`](https://www.npmjs.com/package/archstone) when you introduce those concerns in a new context.

## Why this structure exists

- It keeps business rules cohesive and explicitly scoped.
- It reduces accidental coupling between unrelated subdomains.
- It gives each context a clear growth path for entities, value objects, use cases, and contracts.
- It maps technical boundaries to product boundaries, improving team ownership.

## Practical guideline

As the project grows, new domains should be added as independent contexts instead of extending a single generic domain bucket.

## Further reading

- **Onboarding:** [Getting started](getting-started.md) — env, Postgres, migrations, OpenAPI, troubleshooting.
- **New repo from template:** [New API from this template](new-project-from-template.md).
- **Identity bounded context (reference):** [identity-bounded-context.md](identity-bounded-context.md).
- Layering and file placement: [CLAUDE.md](../../CLAUDE.md) (repository root) and [src/CLAUDE.md](../../src/CLAUDE.md) — see **Memory / docs hierarchy** in `src/CLAUDE.md` for the recommended reading order.
- Identity development playbook: [src/domain/identity/CLAUDE.md](../../src/domain/identity/CLAUDE.md).
- **Index of all arch docs:** [docs/archiqueture/README.md](README.md).
