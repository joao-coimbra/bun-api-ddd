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

- `run-e2e.ts` — discovers `src/**/*.e2e-spec.ts` and runs `bun test` with `setup-e2e.ts` preloaded (Postgres URL from the process environment, optional schema isolation + migrations).
- `bun run test:e2e` sets `NODE_ENV=test` only; **CI** injects `DATABASE_URL` and JWT secrets on the workflow step. **Locally**, export the same variables (see `.github/workflows/run-ci.yml` / `.env.example`) before running.

Integration spec files still live under `src/` with the `*.e2e-spec.ts` suffix.

**E2E files** (`*.e2e-spec.ts`): import **`db`** from `@/infra/database/drizzle/client` for **`new AccountFactory(db)`** (and optional table reset). Do **not** use **`db.select`** or **`db.delete`** for **arrange** — use persistence factories; do **not** query the DB for **assertions** — assert on **HTTP**. **`beforeEach` / `afterEach`** inside each **`describe`** may **`await db.delete(schema.<table>)`** to clear rows between tests. Any other **persistence factory** under `test/factories/` follows the same injected-**`db`** pattern. `test/setup-e2e.ts` still applies migrations.

**E2E scenario shape:** one **`test()`** per **scenario or outcome** — do not mix unrelated flows in the same test (for example: assert successful registration and a different `409` conflict in one block — split them). Keep each **`*.e2e-spec.ts`** aligned with **its controller**: `register-account.controller.e2e-spec.ts` should call **`/accounts`** only; **`/sessions`** belongs in `authenticate-account.controller.e2e-spec.ts`, not mixed into register specs. Prefer **fixed** `email` / `username` strings when **`beforeEach`** clears the table — easier to read than random suffixes; avoid file-scoped helper functions unless you extract to `test/helpers/`.

**E2E assertions (`@elysiajs/eden` treaty):** responses **`204` / `Void`** often surface as **`response.data === ""`**, not **`null`** — use e.g. `expect(response.data ?? "").toBe("")`. For JSON, **`expect(response.data).toMatchObject({ … })`** instead of **`toContain`** on objects. When seeding a row that must collide with **`Slug.createFromText(name)`**, pass that slug in **`makeDrizzleAccount`** — **`name`** alone does not override the factory default ( **`Account.create`** fills missing slug from name; explicit `.slug` in overrides wins).

**E2E bearer routes (pre-authenticated user):** for **`auth: true`** controllers (e.g. **`GET /me`**), avoid logging in through **`/sessions`** unless the scenario is sign-in itself. Use **`AccountFactory.makeDrizzleAuthenticatedAccount()`**: it persists a user, signs access/refresh JWTs via **`app.decorator.jwtAccessToken` / `jwtRefreshToken`**, and returns **`authHeader`** (`Authorization: Bearer …`) and **`cookieHeader`**. Pass headers into treaty: **`api.me.get({ headers: authHeader })`**. Shipped reference: **`get-my-profile.controller.e2e-spec.ts`** — nested **`describe`** blocks per HTTP outcome (**`401`** unauthenticated vs **`200`** with bearer). Clear **`users`** in **`beforeEach`** when tests need isolation; **`cleanup()`** on the helper is optional and wipes via global **`db`** (use sparingly).

## `bun:test` naming (colocated specs under `src/`)

| Kind | API | Title style |
|------|-----|-------------|
| Unit — use cases, subscribers, most domain specs | `it()` from `bun:test` | Start with **`should …`** (behavioral wording). |
| Unit — **value object** specs (`*.vo.spec.ts` in this template) | `test()` from `bun:test` | **No** `should` prefix — use direct statements (e.g. `creates…`, `normalizes…`). Reference: `slug.vo.spec.ts`. |
| E2E — `*.e2e-spec.ts` | `test()` from `bun:test` | Plain English; **no** required `should` prefix. **One scenario per `test()`** — see *E2E scenario shape*. |

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

- File: `make-<entity>.factory.ts`. Export `make<Entity>(…)` for **pure** domain instances (no I/O) unless the entity fills defaults in `create` (e.g. **`Account.create`** adds **`slug`** from **`Slug.createFromText(name)`** when omitted).
- **Persistence factory classes** (e.g. `AccountFactory`) — used for E2E **arrange** when you need rows in Postgres:
  - Constructor **`(private readonly db: DrizzleClient)`** for **`makeDrizzleAccount`**. **Do not** reintroduce a default singleton for inserts.
  - May import mappers and **`schema`** from `@/infra/...` for inserts.
  - **`makeDrizzleAuthenticatedAccount`** — **pre-authenticated E2E user:** **`await factory.makeDrizzleAuthenticatedAccount()`** inserts a row, returns **`{ account, accessToken, refreshToken, authHeader, cookieHeader, cleanup }`**. Use **`authHeader`** (or **`cookieHeader`**) on treaty calls for bearer routes; see *E2E bearer routes* above and **`get-my-profile.controller.e2e-spec.ts`**. Prefer **`beforeEach` → `db.delete(schema.users)`** for isolation; **`cleanup()`** deletes all **`users`** via global **`db`** — use only when a full wipe is intentional.
  - **Every consumer** (`*.e2e-spec.ts`) should **`import { db } from "@/infra/database/drizzle/client"`** and **`new AccountFactory(db)`**.
- The shipped **identity** slice uses **`AccountFactory` + `makeAccount`** as the reference.
- Use **`@faker-js/faker`** in **`make*`** helpers; spread **`override`** last so callers can pin any field.

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

Use a **readable `describe` title** (e.g. `"Register Account"`, `"Get My Profile"`), not the concrete class name (`RegisterAccountUseCase`).

- **Vertical spacing in `it` blocks:** **Blank line between phases** — e.g. after **`execute`**, after asserting **`isRight()`** / **`isLeft()`** when the next lines are a *different* concern (unwrap value vs. checking the `Either`). **Within one concern**, keep **`getOrThrow()`**, helper **`const`s, and related `expect`s contiguous** (no blank between them): e.g. tokens from **`getOrThrow()`** with adjacent **`expect`s**, or **`expect(repo.items).toHaveLength(1)`** plus **`expect(repo.items[0]).toMatchObject({…})`** on the aggregate (see **`register-account.use-case.spec.ts`**). Between **`make*` / setup** and **`await repository.create`**, and **`create`** and **`execute`**, one blank line each when it helps scan the *arrange* block.

- **One `it` per flow** — a single scenario per test (happy path, or one failure mode, or one branch). Do not combine unrelated assertions in the same `it`.
- **Branch on `Either` first:** **`expect(result.isRight()).toBeTrue()`** or **`expect(result.isLeft()).toBeTrue()`** (Bun: **`.toBeTrue()`**). When the right value matters (tokens, aggregate, `nothing()`), call **`result.getOrThrow()`** only **after** asserting **`isRight()`** — mirrors controllers but keeps the branch explicit in tests. Failure scenarios in this template often stop at **`isLeft()`**; add **`getOrThrow()`** in **`try` / `catch`** (or **`toThrow`**) only when you need to assert a specific error type/message.

```ts
let inMemory<Entity>Repository: InMemory<Entity>Repository

let sut: <Name>UseCase

describe("<Human-readable title>", () => {
  beforeEach(() => {
    inMemory<Entity>Repository = new InMemory<Entity>Repository(/* sibling in-memory repos */)
    sut = new <Name>UseCase(repo)
  })

  it("should succeed on the happy path", async () => {
    const result = await sut.execute({ /* ... */ })

    expect(result.isRight()).toBeTrue()

    const value = result.getOrThrow()
    expect(value).toEqual(/* ... */)
    // more expects on the same outcome stay contiguous (no blank between)
  })

  it("should return <Error> when <condition>", async () => {
    const result = await sut.execute({ /* ... */ })

    expect(result.isLeft()).toBeTrue()
  })
})
```

Keep **coverage proportional to a template**: exercise the main happy path and representative failures (see `identity` use-case specs), not an exhaustive cartesian product of edge cases unless the product requires it.

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
