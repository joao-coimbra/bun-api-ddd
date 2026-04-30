import { RegisterAccountUseCase } from "@/domain/identity/application/use-cases/register-account.use-case"
import { BunHasher } from "@/infra/cryptography/bun-hasher"
import { DrizzleAccountRepository } from "@/infra/database/drizzle/repositories/drizzle-account.repository"
import type { DatabaseClient } from "@/infra/database/types"

interface FactoryRequest {
  db: DatabaseClient
}

export function makeRegisterAccount({ db }: FactoryRequest) {
  const accountRepository = new DrizzleAccountRepository(db.drizzle)
  const passwordHashGenerator = new BunHasher()

  return new RegisterAccountUseCase(accountRepository, passwordHashGenerator)
}
