# Domain Structure

The domain layer is organized by **bounded context** under `src/domain/[bounded-context]`.

## Contexts in this template

- **`identity`** — **Permanent reference** for this repo: accounts, registration, authentication, crypto ports, Drizzle `users`. It is the canonical place for auth/account evolution. Playbook: [`src/domain/identity/CLAUDE.md`](../../src/domain/identity/CLAUDE.md). Deep file/API map: [`identity-bounded-context.md`](identity-bounded-context.md). Prefer extending **`identity`** over introducing a parallel “users” context.
- **`example`** — **Illustrative only**: domain events, subscribers, `WatchedList`, attachment-style patterns. Use it to **copy patterns** into new contexts; do not treat **`example`** as a second product core. It has no `CLAUDE.md` unless the template maintainers expand it deliberately.

New real product areas (e.g. billing, catalog) should be **new sibling folders** under `src/domain/`, each with its own `CLAUDE.md` linked from [`src/domain/CLAUDE.md`](../../src/domain/CLAUDE.md), following the same layout rules—**`identity`** is the structural reference, not **`example`**.

## Why this structure exists

- It keeps business rules cohesive and explicitly scoped.
- It reduces accidental coupling between unrelated subdomains.
- It gives each context a clear growth path for entities, value objects, use cases, and contracts.
- It maps technical boundaries to product boundaries, improving team ownership.

## Practical guideline

As the project grows, new domains should be added as independent contexts instead of extending a single generic domain bucket.

## Further reading

- **Identity bounded context (reference):** [`identity-bounded-context.md`](identity-bounded-context.md).
- Layering and file placement: [`CLAUDE.md`](../../CLAUDE.md) (repository root) and [`src/CLAUDE.md`](../../src/CLAUDE.md) — see **Memory / docs hierarchy** in `src/CLAUDE.md` for the recommended reading order.
- Identity development playbook: [`src/domain/identity/CLAUDE.md`](../../src/domain/identity/CLAUDE.md).
