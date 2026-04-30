# test

**This folder contains test scaffolding only — never tests themselves.** Spec files (`<file>.spec.ts`) live next to the source they cover under `src/`.

**Documentation tier:** layer **8** in @src/CLAUDE.md (*Memory / docs hierarchy*). Read after you know specs are colocated under `src/`; use this file for factories, in-memory repos, `waitFor`, and the e2e preload (`setup-e2e.ts`, `run-e2e.ts`).

## Layout

```
test/
  cryptography/  fake-hasher.ts, fake-encrypter.ts  stubs for domain crypto port interfaces
  factories/      make-<entity>.factory.ts        deterministic-ish entity builders
  repositories/   in-memory-<entity>.repository.ts in-memory implementations of domain repo contracts
                  in-memory.repository.ts          shared base class for the above
  helpers/        wait-for.ts, ...                 generic test utilities
```

## E2E harness (optional)

- `run-e2e.ts` — discovers `src/**/*.e2e-spec.ts` and runs `bun test` with `setup-e2e.ts` preloaded (Postgres URL from `.env.test`, optional schema isolation + migrations).
- `bun run test:e2e` wires `NODE_ENV=test` and `.env.test` via `package.json`.

Integration spec files still live under `src/` with the `*.e2e-spec.ts` suffix.

## `bun:test` naming (colocated specs under `src/`)

| Kind | API | Title style |
|------|-----|-------------|
| Unit — use cases, subscribers, most domain specs | `it()` from `bun:test` | Start with **`should …`** (behavioral wording). |
| Unit — **value object** specs (`*.vo.spec.ts` in this template) | `test()` from `bun:test` | **No** `should` prefix — use direct statements (e.g. `creates…`, `normalizes…`). Reference: `slug.vo.spec.ts`. |
| E2E — `*.e2e-spec.ts` | `test()` from `bun:test` | Plain English; **no** required `should` prefix. |

## Hard rules

- Nothing under `src/` may import from `test/`. Production code never depends on test scaffolding.
- Helpers may import from `@/...` — that is the whole point.
- Each helper lives in its own file and exports the smallest possible surface (one function, one class).
- No barrel `index.ts`.

## Import alias

Spec files import helpers via the bare `test/*` alias declared in `tsconfig.json`:

```ts
import { make<Entity> } from "test/factories/make-<entity>.factory"
import { InMemory<Entity>Repository } from "test/repositories/in-memory-<entity>.repository"
import { waitFor } from "test/helpers/wait-for"
```

## Factories (`test/factories/`)

- File: `make-<entity>.factory.ts`. Export `make<Entity>(override: Partial<<Entity>Props> = {}, id?: UniqueEntityId): <Entity>`.
- Build via the entity's static `create` factory. Use `@faker-js/faker` for sensible defaults; spread `override` last so callers can pin any field.
- A factory must never reach into infra or stub external services.

## In-memory repositories (`test/repositories/`)

- Extend `InMemoryRepository<<Entity>>` (the base in `in-memory.repository.ts`) and `implements <Entity>Repository`.
- Inject sibling in-memory repositories through the constructor when the aggregate owns a `WatchedList`.
- `create` must call `super.create(item)` then `DomainEvents.dispatchEventsForAggregate(item.id)`. **Dispatch only here, never in `save`.**
- `save` must apply `WatchedList` deltas to dependent repositories (`getNewItems()` → `createMany`, `getRemovedItems()` → `deleteMany`) before calling `super.save(item)`.
- Add domain-specific finders (`findByName`, `findBySlug`, …) directly on the class — they fulfill the same contract a real repository will.

The base class:

```ts
export abstract class InMemoryRepository<T extends Entity<unknown>> {
  protected _items = new Map<string, T>()

  get items(): T[] { return Array.from(this._items.values()) }
  create(item: T): Promise<void>   // upsert by id
  findById(id: string): Promise<T | null>
  save(item: T): Promise<void>     // upsert by id
}
```

Expose `items` as the read surface for assertions (`expect(repo.items).toHaveLength(1)`).

## Helpers (`test/helpers/`)

- Generic, framework-agnostic test utilities only — `waitFor`, custom matchers, fixture builders.
- `waitFor(assertions, maxDuration = 1000)` re-runs `assertions` on a 10 ms interval until it passes or the timeout rejects. Use it in subscriber specs to wait for asynchronous side effects after dispatching a domain event.

## Spec patterns (write specs under `src/`, but keep them consistent with these recipes)

### Value object spec (`test`, no `should` prefix)

```ts
import { describe, expect, test } from "bun:test"
import { <Name> } from "./<name>.vo"

describe("<Name>", () => {
  test("creates a value from valid input", () => {
    const vo = <Name>.create("…")
    expect(vo.value).toBe("…")
  })
})
```

### Use case spec

```ts
let repo: InMemory<Entity>Repository
let sut: <Name>UseCase

beforeEach(() => {
  repo = new InMemory<Entity>Repository(/* sibling in-memory repos */)
  sut = new <Name>UseCase(repo)
})

it("should succeed on the happy path", async () => {
  const result = await sut.execute({ /* ... */ })
  expect(result.isRight()).toBeTrue()
  const { <result> } = result.getOrThrow()
  // assertions on <result> and repo.items
})

it("should return <Error> when <condition>", async () => {
  const result = await sut.execute({ /* ... */ })
  result.match({
    left: (error) => {
      expect(error).toBeInstanceOf(<Error>)
      expect(error.message).toBe("<expected message>")
    },
    right: () => { throw new Error("expected left branch") },
  })
})
```

### Subscriber spec (reactive style)

```ts
let repo: InMemory<Entity>Repository
let saveSpy: Mock<InMemory<Entity>Repository["save"]>

beforeEach(() => {
  repo = new InMemory<Entity>Repository(/* ... */)
  saveSpy = spyOn(repo, "save")
  new On<Subject><Verb>(repo) // constructor registers the subscription
})

it("should react to <Event>", async () => {
  await repo.create(make<Entity>())
  await waitFor(() => expect(saveSpy).toHaveBeenCalled())
})
```
