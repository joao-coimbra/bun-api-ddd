# Architecture documentation

Long-form reference for this repository’s structure and the shipped **identity** bounded context. Short playbooks live in **`CLAUDE.md`** files at the repo and under `src/`; read those first for day-to-day rules.

| Document | Purpose |
|----------|---------|
| [Getting started](getting-started.md) | Prerequisites, env vars, Postgres, migrations, dev server, tests, OpenAPI |
| [New API from this template](new-project-from-template.md) | Checklist when cloning for a real product (rename, secrets, contexts) |
| [Domain structure](domain-structure.md) | Why bounded contexts exist and how to add siblings to **`identity`** |
| [Identity bounded context](identity-bounded-context.md) | Routes, JWT/cookies, Drizzle `users` map, tests |

**Recommended reading order (humans & assistants):** see *Documentation hierarchy* in the repo root [`CLAUDE.md`](../../CLAUDE.md) and *Memory / docs hierarchy* in [`src/CLAUDE.md`](../../src/CLAUDE.md).
