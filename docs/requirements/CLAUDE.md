# Requirements Authoring Rules

This file defines how requirement session files in this folder must be authored.

## Scope

- Applies only to `docs/requirements/*.md` session files (for example, `0001_2026-05-01.md`).
- Session files must contain requirement records only, not process instructions.

## Session File Structure

- Keep session files simple and focused.
- Allowed sections:
  - Title and metadata block
  - `## Context`
  - `## Functional Requirements`
  - `## Non-Functional Requirements`
  - `## Business Rules`

## Requirement Formatting

- Every requirement line must be a checkbox (`- [ ]` or `- [x]`).
- Functional requirement format: `**FR-XX** 🔴|🟡|🟢 — <description>`
- Non-functional requirement format: `**NFR-XX** — <description>`
- Business rule format: `**BR-XX** — <description>`
- Use `[x]` for completed/delivered baseline requirements.

## Identifier Rules

- IDs are global and immutable in this folder.
- Never reuse or renumber `FR-XX` or `NFR-XX`.
- New sessions continue numbering from the highest existing ID.
- To change an existing requirement, create a new session and reference `Updates FR-XX` or `Updates NFR-XX`.

## Language

- Use English only.
- Keep wording clear, direct, and testable.
