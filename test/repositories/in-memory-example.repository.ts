import { DomainEvents } from "archstone/core"
import type { ExampleRepository } from "@/domain/example/application/repositories/example.repository"
import type { ExampleAttachmentsRepository } from "@/domain/example/application/repositories/example-attachments.repository"
import type { Example } from "@/domain/example/enterprise/entities/example.entity"
import { InMemoryRepository } from "./in-memory.repository"

export class InMemoryExampleRepository
  extends InMemoryRepository<Example>
  implements ExampleRepository
{
  constructor(
    private readonly exampleAttachmentsRepository: ExampleAttachmentsRepository
  ) {
    super()
  }

  override create(example: Example): Promise<void> {
    super.create(example)

    DomainEvents.dispatchEventsForAggregate(example.id)

    return Promise.resolve()
  }

  override async save(example: Example): Promise<void> {
    const newAttachments = example.attachments.getNewItems()
    const removedAttachments = example.attachments.getRemovedItems()

    await this.exampleAttachmentsRepository.createMany(newAttachments)
    await this.exampleAttachmentsRepository.deleteMany(removedAttachments)

    await super.save(example)
  }

  findByName(name: string): Promise<Example | null> {
    const example = this.items.find((item) => item.name === name)

    return Promise.resolve(example ?? null)
  }
}
