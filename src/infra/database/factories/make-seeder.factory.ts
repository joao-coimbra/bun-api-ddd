import { BunHasher } from "@/infra/cryptography/bun-hasher"
import { db } from "../drizzle/client"
import { DrizzleAccountRepository } from "../drizzle/repositories/drizzle-account.repository"
import { AccountSeeder } from "../seeders/account.seeder"

class DatabaseSeeder {
  constructor(private readonly accountSeeder: AccountSeeder) {}

  async run() {
    await this.accountSeeder.seed()
  }
}

export function makeSeeder() {
  const hasher = new BunHasher()
  const accountRepository = new DrizzleAccountRepository(db)
  const accountSeeder = new AccountSeeder(accountRepository, hasher)

  return new DatabaseSeeder(accountSeeder)
}
