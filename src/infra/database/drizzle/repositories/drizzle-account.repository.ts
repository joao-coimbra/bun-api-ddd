import type { AccountRepository } from "@/domain/identity/application/repositories/account.repository"
import type { Account } from "@/domain/identity/enterprise/entities/account.entity"
import type { DrizzleClient } from "../client"
import { DrizzleAccountMapper } from "../mappers/drizzle-account.mapper"
import { schema } from "../schema"

export class DrizzleAccountRepository implements AccountRepository {
  constructor(private readonly drizzle: DrizzleClient) {}

  async create(account: Account): Promise<void> {
    const raw = DrizzleAccountMapper.toDrizzle(account)

    await this.drizzle.insert(schema.users).values(raw)
  }

  async findByUsername(username: string): Promise<Account | null> {
    const raw = await this.drizzle.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, username),
    })

    return raw ? DrizzleAccountMapper.toDomain(raw) : null
  }

  async findByEmail(email: string): Promise<Account | null> {
    const raw = await this.drizzle.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    })

    return raw ? DrizzleAccountMapper.toDomain(raw) : null
  }

  async findBySlug(slug: string): Promise<Account | null> {
    const raw = await this.drizzle.query.users.findFirst({
      where: (users, { eq }) => eq(users.slug, slug),
    })

    return raw ? DrizzleAccountMapper.toDomain(raw) : null
  }
}
