# Contributing

Contributions are welcome.

## Your repo, your rules

If you created a project **from this template**, nothing here is mandatory. You may prefer **direct pushes to `main`**, another default branch, **Trunk-based** flow, fewer checks, or a different Git hosting setup. Adjust **branch protection**, **merge strategy**, and **`.github/workflows/run-ci.yml`** (`on:` branches and events) to match how your team works. The sections below describe an **optional, opinionated open-source reference** (PRs + protected `main` + CI)—use as much or as little of it as you like.

The default workflow triggers on **`pull_request` to `main` only**: with required checks before merge, CI already ran on the PR tip, so a duplicate run on `push` after merge is unnecessary. If you **allow direct pushes** to `main`, add a `push: branches: [main]` trigger (or another branch) so those commits are still covered.

When contributing **back to this template repository** (upstream), follow the maintainer workflow and CI expectations described below.

## Reference workflow (open source / protected `main`)

This layout matches sibling templates/libraries: **pull requests** into `main`, **CI** as a gate, and optionally **protected `main`**. Skip this section if your fork or product repo uses a different model.

### Steps

1. **Fork** the repository (if you are not a collaborator with push access).
2. Create a **branch** from `main` (`feat/…`, `fix/…`, or `chore/…`).
3. Make focused commits; prefer [**Conventional Commits**](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `ci:`, `docs:`, …).
4. Open a **pull request** into `main`.
5. Ensure **CI is green** (lint, unit tests, E2E with Postgres in GitHub Actions).
6. Request review; maintainers merge with **squash** or **merge** according to repo policy.

If you adopt this model, direct pushes to `main` are usually turned off (except admins or emergencies) so day-to-day changes go through PRs.

## Local checks

```bash
bun install --frozen-lockfile
bun run check
bun test
bun run test:e2e
```

See [`README.md`](README.md) and [`docs/archiqueture/getting-started.md`](docs/archiqueture/getting-started.md) for env, Docker, and E2E setup.

## Maintainer: GitHub settings (optional, once per repo)

Only if you want **protected `main` + required checks**. Configure **Settings → Rules → Rulesets** (or **Branch protection rules**) for `main`:

- Require a **pull request** before merging (no direct push, or restrict to admins only).
- Require **status checks** to pass before merging: **Lint**, **Unit tests**, **E2E tests** (names from `.github/workflows/run-ci.yml`).
- Optional but recommended: require **up-to-date branch** before merge, **linear history** or squash merges, dismiss stale reviews on new commits.

Fork PRs run CI with read-only `contents` permission; no extra secrets are required for the current workflow.
