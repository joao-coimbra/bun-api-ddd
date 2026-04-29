import type { ExampleAttachmentsRepository } from "@/domain/example/application/repositories/example-attachments.repository"
import type { ExampleAttachment } from "@/domain/example/enterprise/entities/example-attachment.entity"

export class InMemoryExampleAttachmentsRepository
  implements ExampleAttachmentsRepository
{
  items: ExampleAttachment[] = []

  createMany(attachments: ExampleAttachment[]): Promise<void> {
    this.items.push(...attachments)

    return Promise.resolve()
  }

  deleteMany(attachments: ExampleAttachment[]): Promise<void> {
    const attachmentIdsToDelete = new Set(
      attachments.map((attachment) => attachment.attachmentId.toString())
    )

    this.items = this.items.filter(
      (item) => !attachmentIdsToDelete.has(item.attachmentId.toString())
    )

    return Promise.resolve()
  }
}
