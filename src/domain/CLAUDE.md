# src/domain

Business model, organized by **bounded context**. Every context is a self-contained subfolder. Use `src/domain/[bounded-context]/` as the scaffold. Rationale and growth guidelines: @docs/archiqueture/domain-structure.md. Add an optional `README.md` inside a context only when onboarding notes help; **`identity`** uses @src/domain/identity/CLAUDE.md instead.

## Documented contexts

- **`identity`** — **Permanent** product context (accounts, auth). Playbook: @src/domain/identity/CLAUDE.md. Long-form: @docs/archiqueture/identity-bounded-context.md. New auth/account features belong here.
- **`example`** — **Illustrative** (events, subscribers, `WatchedList`). No `CLAUDE.md` unless it grows; patterns are meant to be lifted into **new** contexts, not to rival **`identity`** as the template’s main reference.

Add a `CLAUDE.md` at `src/domain/<context>/CLAUDE.md` when a context gains enough rules to justify a dedicated playbook (imports, invariants, naming). Link it from this file. See @docs/archiqueture/domain-structure.md for how **`identity`** vs **`example`** fits the template strategy.

Stacked reading order for all layers (infra, core, test): @src/CLAUDE.md (*Memory / docs hierarchy*).

## Per-context layout

```
src/domain/<context>/
  enterprise/
    entities/
      <name>.entity.ts                 (extends Entity or AggregateRoot)
      <entity>-list.entity.ts          (extends WatchedList)
      value-objects/
        <name>.vo.ts                   (extends ValueObject)
    events/
      <subject>-<verb>.event.ts        (implements DomainEvent)
  application/
    repositories/
      <name>.repository.ts             (interface only)
    use-cases/
      <name>.use-case.ts               (implements UseCase)
      errors/
        <name>.error.ts                (extends a class from @/core/errors)
    subscribers/
      on-<subject>-<verb>.subscriber.ts (implements EventHandler)
```

## Hard rules

- No I/O, no HTTP, no DB, no filesystem, no env reads in this layer.
- `application/` may import from its own `enterprise/` and from `@/core/`. Never the reverse, never another context.
- `enterprise/` may import from `archstone` and its own intra-context siblings only.
- One bounded context never imports from another. Cross-context coordination belongs in `infra/` or future application services.
- Repository **contracts** live here; **implementations** live in `infra/` (or `test/repositories/` for in-memory test doubles).

## Entity / aggregate

- `create(props, id?)` is the only public constructor path. Default `createdAt`, derived value objects, empty `WatchedList`s, and other invariants are filled here.
- Mark "is new" by `!id` and add the creation domain event from `create`:
  ```ts
  if (!id) example.addDomainEvent(new <Subject>CreatedEvent(example))
  ```
- Mutable fields go through setters that call a private `touch()` to bump `updatedAt`.

## Value object

- Two static factories are common in this template:
  - `static create(raw): <VO>` — minimal normalization (`trim`, `toLowerCase`).
  - `static createFromText(text): <VO>` — derived/computed form (e.g. slugification).
- Throw a domain-level error from the factory when the input violates an invariant. Use cases that call `<VO>.create()` must wrap the call in `try/catch` and return `left(new <Error>())`.

## Repository contract

- Interface only — no class, no implementation.
- Compose `archstone`'s segregated interfaces (`Creatable`, `Findable`, `Saveable`, `Deletable`) when they fit; otherwise declare methods inline.
- Add domain-specific finders (e.g. `findBySlug(slug)` or `findByName(name)`) directly on the interface.

## Use case

- `Response = Either<<ErrA> | <ErrB>, { <result>: <Aggregate> }>`. Return `left(new <ContextError>(...))` for every expected failure — never throw.
- Happy path: build the aggregate via its `create` factory, persist via the repository contract, return `right({...})`.
- **Application errors** live in `application/use-cases/errors/<name>.error.ts` and **must `extend` a class from `@/core/errors/*`** (e.g. `extends ConflictError`) — never `implements UseCaseError` directly. The `AppError` chain carries `status` and `toResponse()`, which the future infra error handler depends on. See @src/core/CLAUDE.md.

## Domain event dispatch

- The aggregate root registers events from `create` via `addDomainEvent` — no extra wiring required.
- Events are **dispatched only by the repository's `create`**, never by `save`. The repository implementation calls `DomainEvents.dispatchEventsForAggregate(aggregate.id)` after the persistence call returns. The in-memory implementation in `test/repositories/in-memory-<entity>.repository.ts` is the reference.
- A subscriber that needs to mutate the aggregate calls `repository.save(...)` — that `save` must not re-dispatch.

## Subscriber

- `EventHandler<<Event>>` and `DomainEvents` come from `archstone/core` (not `archstone/domain/enterprise`).
- Constructor calls `this.setupSubscriptions()`. Inside, register with `DomainEvents.register(this.handle.bind(this), <Event>.name)`.
- `handle(event)` performs the side effect (typically `repository.save(...)`).

## WatchedList

- Use for one-to-many collections owned by an aggregate (e.g. `<Entity>AttachmentList extends WatchedList<<Entity>Attachment>`).
- The aggregate exposes the list via a getter and a setter that calls `touch()`.
- The repository implementation reads `list.getNewItems()` / `list.getRemovedItems()` and applies the deltas to a sibling repository before saving the aggregate.

## Tests

Specs are colocated next to source. Test scaffolding (factories, in-memory repos, helpers) lives in `test/`. See @test/CLAUDE.md.
