import { AuthenticateAccountUseCase } from "@/domain/identity/application/use-cases/authenticate-account.use-case"
import { BunHasher } from "@/infra/cryptography/bun-hasher"
import { JwtEncrypter } from "@/infra/cryptography/jwt/jwt-encrypter"
import type { JwtService } from "@/infra/cryptography/jwt/types"
import { DrizzleAccountRepository } from "@/infra/database/drizzle/repositories/drizzle-account.repository"
import type { DatabaseClient } from "@/infra/database/types"

interface FactoryRequest {
  db: DatabaseClient
  jwt: JwtService
}

export function makeAuthenticateAccount({ db, jwt }: FactoryRequest) {
  const accountRepository = new DrizzleAccountRepository(db.drizzle)
  const passwordComparer = new BunHasher()
  const encrypterAccessToken = new JwtEncrypter(jwt.accessToken)
  const encrypterRefreshToken = new JwtEncrypter(jwt.refreshToken)

  return new AuthenticateAccountUseCase(
    accountRepository,
    passwordComparer,
    encrypterAccessToken,
    encrypterRefreshToken
  )
}
