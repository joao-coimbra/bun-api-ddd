import { DomainEvents, type EventHandler } from "archstone/core"
import { ExampleCreatedEvent } from "../../enterprise/events/example-created.event"
import type { ExampleRepository } from "../repositories/example.repository"

export class OnExampleCreated implements EventHandler<ExampleCreatedEvent> {
  constructor(private readonly exampleRepository: ExampleRepository) {
    this.setupSubscriptions()
  }

  setupSubscriptions(): void {
    DomainEvents.register(this.handle.bind(this), ExampleCreatedEvent.name)
  }

  async handle({ example }: ExampleCreatedEvent): Promise<void> {
    example.processedBySubscriber = true

    await this.exampleRepository.save(example)
  }
}
