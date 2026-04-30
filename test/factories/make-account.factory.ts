import { faker } from "@faker-js/faker"
import type { UniqueEntityId } from "archstone"
import {
  Account,
  type AccountProps,
} from "@/domain/identity/enterprise/entities/account.entity"
import { Slug } from "@/domain/identity/enterprise/entities/value-objects/slug.vo"
import type { DrizzleClient } from "@/infra/database/drizzle/client"
import { DrizzleAccountMapper } from "@/infra/database/drizzle/mappers/drizzle-account.mapper"
import { schema } from "@/infra/database/drizzle/schema"

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

export class AccountFactory {
  constructor(private readonly drizzle: DrizzleClient) {}

  async makeDrizzleAccount(
    data: Partial<AccountProps> = {},
    id?: UniqueEntityId
  ): Promise<Account> {
    const account = makeAccount(data, id)

    const row = DrizzleAccountMapper.toDrizzle(account)

    await this.drizzle.insert(schema.user).values(row)

    return account
  }
}
