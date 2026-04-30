# src/core

Framework-agnostic primitives shared across every bounded context. Today this layer contains only `errors/`; add new sub-folders (`utils/`, `types/`, `crypto/`, etc.) the first time a truly business-agnostic primitive is needed.

**Documentation tier:** layer **7** in @src/CLAUDE.md (*Memory / docs hierarchy*). Use when adding or extending `AppError` subclasses and other shared primitives; domain-specific errors still live under `src/domain/<context>/application/…` and extend these bases (see @src/domain/CLAUDE.md).

## Hard rules

- Zero imports from `@/domain/**` or `@/infra/**`.
- No I/O. No network. No filesystem. No env reads.
- No HTTP framework, no ORM, no DB driver. The only web-platform API allowed is the standard `Response` (already used by `AppError.toResponse()`).
- Only `archstone` may be imported as a third-party (currently used for the `UseCaseError` contract).
- Anything with business meaning belongs in `src/domain/<context>/`, not here.

## Errors (`src/core/errors/`)

All errors extend the abstract `AppError`:

```ts
export abstract class AppError extends Error {
  abstract readonly status: number

  toResponse() {
    return Response.json(
      { error: this.message, code: this.status },
      { status: this.status },
    )
  }
}
```

Each concrete error class **must do both**:

- `extends AppError` — to inherit `status` and `toResponse()`. The future infra HTTP error handler relies on this.
- `implements UseCaseError` (from `archstone/domain/application`) — to be returnable as the left side of an `Either` from a use case.

Never write a project error as `class <Name>Error implements UseCaseError {}` alone — that drops `status` and `toResponse()` and breaks the infra error handler.

Other rules per concrete class:

- Declare `readonly status = <http-code>`.
- Accept an optional `message` with a sensible default (`"Bad request."`, `"Resource not found."`, etc.).
- Live in its own file named `<kebab-name>.error.ts` exporting a single class `<PascalName>Error`.

The current set covers `400 / 401 / 403 / 404 / 405 / 409 / 418 / 422 / 429`. Add a new file when a new HTTP status becomes necessary; otherwise reuse what exists.

### Pattern for a new core error

```ts
import type { UseCaseError } from "archstone/domain/application"
import { AppError } from "./app.error"

export class <Name>Error extends AppError implements UseCaseError {
  readonly status = <http-code>

  constructor(message = "<default message>.") {
    super(message)
  }
}
```

Domain layers extend these to add context-specific semantics — see @src/domain/CLAUDE.md.

## Tests

Pure unit tests, colocated as `<file>.spec.ts`. Use `bun:test`. Primitives in this layer must be testable in isolation — no fixtures, no in-memory repos.
