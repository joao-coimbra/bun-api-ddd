import { DomainEvents } from "archstone/core"
import type { AccountRepository } from "@/domain/identity/application/repositories/account.repository"
import type { Account } from "@/domain/identity/enterprise/entities/account.entity"
import { InMemoryRepository } from "./in-memory.repository"

export class InMemoryAccountRepository
  extends InMemoryRepository<Account>
  implements AccountRepository
{
  override create(account: Account): Promise<void> {
    super.create(account)

    DomainEvents.dispatchEventsForAggregate(account.id)

    return Promise.resolve()
  }

  findBySlug(slug: string): Promise<Account | null> {
    const account = this.items.find((item) => item.slug === slug)

    return Promise.resolve(account ?? null)
  }

  findByUsername(username: string): Promise<Account | null> {
    const account = this.items.find((item) => item.username === username)

    return Promise.resolve(account ?? null)
  }

  findByEmail(email: string): Promise<Account | null> {
    const account = this.items.find((item) => item.email === email)

    return Promise.resolve(account ?? null)
  }
}
