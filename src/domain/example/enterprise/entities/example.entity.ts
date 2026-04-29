import { Entity, type Optional, type UniqueEntityId } from "archstone"
import { Slug } from "./value-objects/slug.vo"

export interface ExampleProps {
  name: string
  slug: Slug
  description: string
  createdAt: Date
  updatedAt?: Date | null
}

export class Example extends Entity<ExampleProps> {
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

  get updatedAt(): Date | null {
    return this.props.updatedAt ?? null
  }

  static create(
    props: Optional<ExampleProps, "createdAt" | "slug">,
    id?: UniqueEntityId
  ): Example {
    const example = new Example(
      {
        ...props,
        slug: props.slug ?? Slug.createFromText(props.name),
        createdAt: props.createdAt ?? new Date(),
      },
      id
    )

    return example
  }
}
