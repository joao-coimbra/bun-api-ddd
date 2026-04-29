import { Entity, type UniqueEntityId } from "archstone"

export interface ExampleAttachmentProps {
  attachmentId: UniqueEntityId
}

export class ExampleAttachment extends Entity<ExampleAttachmentProps> {
  get attachmentId(): UniqueEntityId {
    return this.props.attachmentId
  }

  static create(
    props: ExampleAttachmentProps,
    id?: UniqueEntityId
  ): ExampleAttachment {
    const exampleAttachment = new ExampleAttachment(props, id)

    return exampleAttachment
  }
}
