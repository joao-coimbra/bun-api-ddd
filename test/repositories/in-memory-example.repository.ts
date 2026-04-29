import { DomainEvents } from "archstone/core"
import type { ExampleRepository } from "@/domain/example/application/repositories/example.repository"
import type { Example } from "@/domain/example/enterprise/entities/example.entity"
import { InMemoryRepository } from "./in-memory.repository"

export class InMemoryExampleRepository
  extends InMemoryRepository<Example>
  implements ExampleRepository
{
  override create(example: Example): Promise<void> {
    super.create(example)

    DomainEvents.dispatchEventsForAggregate(example.id)

    return Promise.resolve()
  }

  findByName(name: string): Promise<Example | null> {
    const example = this.items.find((item) => item.name === name)

    return Promise.resolve(example ?? null)
  }
}
