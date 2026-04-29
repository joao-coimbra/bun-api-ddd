# Bounded Context Template

This folder is a **template placeholder** for a Domain-Driven Design bounded context.

A bounded context is a clear boundary where a specific business language and set of rules are valid.  
Inside this boundary, terms have one meaning and the model remains internally consistent.

## Purpose of this folder

- Show where a new context should be created under `src/domain`.
- Provide a consistent structure for domain code.
- Prevent mixing unrelated business rules in a single generic module.

## How to use

1. Copy this folder and rename it to the real context name (for example: `billing`, `iam`, `catalog`).
2. Keep code organized by layer inside the context:
   - `enterprise/` for entities and value objects.
   - `application/` for use cases, contracts, and application errors.
3. Keep dependencies pointing inward (application depends on enterprise abstractions, not on other contexts directly).

## Rule of thumb

If two subdomains use different terminology or business rules for the same concept, they should live in different bounded contexts.
