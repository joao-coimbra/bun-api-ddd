import type { ExampleAttachment } from "../../enterprise/entities/example-attachment.entity"

export interface ExampleAttachmentsRepository {
  createMany(attachments: ExampleAttachment[]): Promise<void>
  deleteMany(attachments: ExampleAttachment[]): Promise<void>
}
