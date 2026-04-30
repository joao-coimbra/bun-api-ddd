import type { Optional, UniqueEntityId } from "archstone/core"
import { AggregateRoot } from "archstone/domain/enterprise"
import type { Slug } from "./value-objects/slug.vo"

export interface AccountProps {
  name: string
  username: string
  email: string
  slug: Slug
  passwordHash: string
  createdAt: Date
  updatedAt?: Date | null
}

export class Account extends AggregateRoot<AccountProps> {
  get name(): string {
    return this.props.name
  }

  get username(): string {
    return this.props.username
  }

  get email(): string {
    return this.props.email
  }

  get slug(): string {
    return this.props.slug.value
  }

  get passwordHash(): string {
    return this.props.passwordHash
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get updatedAt(): Date | null {
    return this.props.updatedAt ?? null
  }

  static create(
    props: Optional<AccountProps, "createdAt">,
    id?: UniqueEntityId
  ) {
    const account = new Account(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? null,
      },
      id
    )

    return account
  }
}
