import { GetMyProfileUseCase } from "@/domain/identity/application/use-cases/get-my-profile.use-case"
import { DrizzleAccountRepository } from "@/infra/database/drizzle/repositories/drizzle-account.repository"
import type { DatabaseClient } from "@/infra/database/types"

interface FactoryRequest {
  db: DatabaseClient
}

export function makeGetMyProfile({ db }: FactoryRequest) {
  const accountRepository = new DrizzleAccountRepository(db.drizzle)

  return new GetMyProfileUseCase(accountRepository)
}
