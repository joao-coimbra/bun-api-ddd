import { faker } from "@faker-js/faker"
import type { UniqueEntityId } from "archstone"
import {
  Account,
  type AccountProps,
} from "@/domain/identity/enterprise/entities/account.entity"
import { Slug } from "@/domain/identity/enterprise/entities/value-objects/slug.vo"

export function makeAccount(
  override: Partial<AccountProps> = {},
  id?: UniqueEntityId
): Account {
  return Account.create(
    {
      name: faker.person.fullName(),
      username: faker.internet.username(),
      email: faker.internet.email(),
      slug: Slug.create(faker.lorem.slug()),
      passwordHash: "hashed-secret",
      ...override,
    },
    id
  )
}
