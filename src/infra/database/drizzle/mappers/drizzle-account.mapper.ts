import { UniqueEntityId } from "archstone"
import { Account } from "@/domain/identity/enterprise/entities/account.entity"
import { Slug } from "@/domain/identity/enterprise/entities/value-objects/slug.vo"
import type { DrizzleUser } from "../schema/user"

class DrizzleAccountMapperImplementation {
  toDomain(raw: DrizzleUser): Account {
    return Account.create(
      {
        name: raw.name,
        username: raw.username,
        email: raw.email,
        slug: Slug.create(raw.slug),
        passwordHash: raw.passwordHash,
      },
      new UniqueEntityId(raw.id)
    )
  }

  toDrizzle(account: Account): DrizzleUser {
    return {
      id: account.id.toString(),
      name: account.name,
      username: account.username,
      email: account.email,
      slug: account.slug,
      passwordHash: account.passwordHash,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    }
  }
}

export const DrizzleAccountMapper = new DrizzleAccountMapperImplementation()
