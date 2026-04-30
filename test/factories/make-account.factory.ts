import { faker } from "@faker-js/faker"
import type { UniqueEntityId } from "archstone"
import {
  Account,
  type AccountProps,
} from "@/domain/identity/enterprise/entities/account.entity"
import { Slug } from "@/domain/identity/enterprise/entities/value-objects/slug.vo"
import { app } from "@/infra/app"
import type { DrizzleClient } from "@/infra/database/drizzle/client"
import { db } from "@/infra/database/drizzle/client"
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
  constructor(private readonly db: DrizzleClient) {}

  async makeDrizzleAccount(
    data: Partial<AccountProps> = {},
    id?: UniqueEntityId
  ): Promise<Account> {
    const account = makeAccount(data, id)

    const row = DrizzleAccountMapper.toDrizzle(account)

    await this.db.insert(schema.users).values(row)

    return account
  }

  async makeDrizzleAuthenticatedAccount(
    data: Partial<AccountProps> = {},
    id?: UniqueEntityId
  ) {
    const account = await this.makeDrizzleAccount(data, id)

    const sub = account.id.toString()

    const accessToken = await app.decorator.jwtAccessToken.sign({ sub })
    const refreshToken = await app.decorator.jwtRefreshToken.sign({ sub })

    return {
      accessToken,
      refreshToken,
      account,
      authHeader: {
        Authorization: `Bearer ${accessToken}`,
      },
      cookieHeader: {
        Cookie: `refreshToken=${refreshToken}`,
      },
      async cleanup() {
        await db.delete(schema.users)
      },
    }
  }
}
