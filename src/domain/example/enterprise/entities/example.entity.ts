import { AggregateRoot, type Optional, type UniqueEntityId } from "archstone"
import { ExampleCreatedEvent } from "../events/example-created.event"
import { ExampleAttachmentList } from "./example-attachment-list.entity"
import { Slug } from "./value-objects/slug.vo"

export interface ExampleProps {
  name: string
  slug: Slug
  description: string
  attachments: ExampleAttachmentList
  processedBySubscriber: boolean
  createdAt: Date
  updatedAt?: Date | null
}

export class Example extends AggregateRoot<ExampleProps> {
  get name(): string {
    return this.props.name
  }

  get description(): string {
    return this.props.description
  }

  get slug(): string {
    return this.props.slug.value
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get attachments(): ExampleAttachmentList {
    return this.props.attachments
  }

  set attachments(attachments: ExampleAttachmentList) {
    this.props.attachments = attachments
    this.touch()
  }

  get processedBySubscriber(): boolean {
    return this.props.processedBySubscriber
  }

  set processedBySubscriber(value: boolean) {
    this.props.processedBySubscriber = value
    this.touch()
  }

  get updatedAt(): Date | null {
    return this.props.updatedAt ?? null
  }

  static create(
    props: Optional<
      ExampleProps,
      "createdAt" | "slug" | "attachments" | "processedBySubscriber"
    >,
    id?: UniqueEntityId
  ): Example {
    const example = new Example(
      {
        ...props,
        slug: props.slug ?? Slug.createFromText(props.name),
        attachments: props.attachments ?? new ExampleAttachmentList(),
        processedBySubscriber: props.processedBySubscriber ?? false,
        createdAt: props.createdAt ?? new Date(),
      },
      id
    )

    const isNewExample = !id

    if (isNewExample) {
      example.addDomainEvent(new ExampleCreatedEvent(example))
    }

    return example
  }

  private touch(): void {
    this.props.updatedAt = new Date()
  }
}
