import { ExampleUseCase } from "@/domain/example/application/use-cases/example.use-case"
import { DrizzleExampleRepository } from "@/infra/database/drizzle/repositories/drizzle-example.repository"
import type { DatabaseClient } from "@/infra/database/types"

interface FactoryRequest {
  db: DatabaseClient
}

export function makeExample({ db }: FactoryRequest) {
  const exampleRepository = new DrizzleExampleRepository(db.drizzle)

  return new ExampleUseCase(exampleRepository)
}
