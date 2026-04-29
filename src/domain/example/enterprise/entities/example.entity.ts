import { AggregateRoot, type Optional, type UniqueEntityId } from "archstone"
import { ExampleCreatedEvent } from "../events/example-created.event"
import { Slug } from "./value-objects/slug.vo"

export interface ExampleProps {
  name: string
  slug: Slug
  description: string
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
      "createdAt" | "slug" | "processedBySubscriber"
    >,
    id?: UniqueEntityId
  ): Example {
    const example = new Example(
      {
        ...props,
        slug: props.slug ?? Slug.createFromText(props.name),
        processedBySubscriber: props.processedBySubscriber ?? false,
        createdAt: props.createdAt ?? new Date(),
      },
      id
    )

    if (!id) {
      example.addDomainEvent(new ExampleCreatedEvent(example))
    }

    return example
  }

  private touch(): void {
    this.props.updatedAt = new Date()
  }
}
