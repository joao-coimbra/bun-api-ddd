import type { DomainEvent, UniqueEntityId } from "archstone/core"
import type { Example } from "../entities/example.entity"

export class ExampleCreatedEvent implements DomainEvent {
  occurredAt: Date

  constructor(readonly example: Example) {
    this.occurredAt = new Date()
  }

  getAggregateId(): UniqueEntityId {
    return this.example.id
  }
}
