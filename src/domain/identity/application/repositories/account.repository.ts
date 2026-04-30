import type { Account } from "../../enterprise/entities/account.entity"

export interface AccountRepository {
  create(account: Account): Promise<void>
  findByUsername(username: string): Promise<Account | null>
  findByEmail(email: string): Promise<Account | null>
  findBySlug(slug: string): Promise<Account | null>
}
