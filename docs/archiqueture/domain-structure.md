# Domain Structure

The domain layer is organized by **bounded context** under `src/domain/[bounded-context]`.

This template ships **two** illustrative contexts: `example` (events, subscribers, attachments pattern) and `identity` (accounts, registration, application-level crypto ports). Add new product areas as additional sibling folders.

## Why this structure exists

- It keeps business rules cohesive and explicitly scoped.
- It reduces accidental coupling between unrelated subdomains.
- It gives each context a clear growth path for entities, value objects, use cases, and contracts.
- It maps technical boundaries to product boundaries, improving team ownership.

## Practical guideline

As the project grows, new domains should be added as independent contexts instead of extending a single generic domain bucket.
