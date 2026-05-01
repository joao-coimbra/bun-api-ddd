# Requirements

This folder contains a chronological log of requirements gathering sessions.
Each file represents one session (meeting, call, or refinement) and is
**append-only** — once committed, files are never edited, only superseded.

## How to read

1. Start from the latest session to see the current state.
2. Look for `> Updates FR-XX` markers to follow how a requirement evolved.
3. Use the IDs (`FR-XX` / `NFR-XX`) to track progress in your task system.

## How to write checklists

- Functional requirements must be checkboxes: `- [ ] **FR-XX** 🔴|🟡|🟢 — Description.`
- Non-functional requirements must be checkboxes: `- [ ] **NFR-XX** — Description.`
- Use priorities only on FRs:
  - 🔴 MUST
  - 🟡 SHOULD
  - 🟢 MAY
- Keep FR and NFR in separate sections (`## New Functional Requirements` and `## New Non-Functional Requirements`).
- If priority is unknown, default to `🟡` and add `> TODO: confirm priority`.
- IDs are global and sequential across all files in this folder (never reuse an ID).

## Sessions

| # | Date | Type | Summary |
|---|------|------|---------|
| 0001 | 2026-05-01 | Template baseline | Generic example session for reusable requirement mapping. |

## Conventions

- File naming: `NNNN_YYYY-MM-DD.md`
- IDs are **global and immutable** — never reuse `FR-XX` or `NFR-XX`.
- Priority emojis: 🔴 MUST / 🟡 SHOULD / 🟢 MAY.
- To change an existing requirement, create a new session that supersedes it.
- Authoring guardrails are also defined in `docs/requirements/CLAUDE.md`.
