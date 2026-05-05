import { faker } from "@faker-js/faker"
import type { HashGenerator } from "@/domain/identity/application/cryptography/hash-generator"
import type { AccountRepository } from "@/domain/identity/application/repositories/account.repository"
import { Account } from "@/domain/identity/enterprise/entities/account.entity"
import type { Seeder } from "./seeder"

export class AccountSeeder implements Seeder {
  constructor(
    private readonly accounts: AccountRepository,
    private readonly hasher: HashGenerator
  ) {}

  async seed() {
    const passwordHash = await this.hasher.hash("password123")

    const account = Account.create({
      name: faker.person.fullName(),
      username: "seed_admin",
      email: "seed@example.com",
      passwordHash,
    })

    await this.accounts.create(account)
  }
}
