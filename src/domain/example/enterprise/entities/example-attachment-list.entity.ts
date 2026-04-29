import { WatchedList } from "archstone"
import type { ExampleAttachment } from "./example-attachment.entity"

export class ExampleAttachmentList extends WatchedList<ExampleAttachment> {
  compareItems(a: ExampleAttachment, b: ExampleAttachment): boolean {
    return a.attachmentId.equals(b.attachmentId)
  }
}
