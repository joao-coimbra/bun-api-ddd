import { type Either, left, right } from "archstone"
import type { Encrypter } from "../cryptography/encrypter"
import type { HashComparer } from "../cryptography/hash-comparer"
import type { AccountRepository } from "../repositories/account.repository"
import { WrongCredentialsError } from "./errors/wrong-credentials.error"

export interface AuthenticateAccountUseCaseRequest {
  email: string
  password: string
}

export type AuthenticateAccountUseCaseResponse = Either<
  WrongCredentialsError,
  {
    accessToken: string
    refreshToken: string
  }
>

export class AuthenticateAccountUseCase {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly passwordComparer: HashComparer,
    private readonly encrypterAccessToken: Encrypter,
    private readonly encrypterRefreshToken: Encrypter
  ) {}

  async execute({
    email,
    password,
  }: AuthenticateAccountUseCaseRequest): Promise<AuthenticateAccountUseCaseResponse> {
    const account = await this.accountRepository.findByEmail(email)

    if (!account) {
      return left(new WrongCredentialsError())
    }

    const isPasswordValid = await this.passwordComparer.compare(
      password,
      account.passwordHash
    )

    if (!isPasswordValid) {
      return left(new WrongCredentialsError())
    }

    const accessToken = await this.encrypterAccessToken.encrypt({
      sub: account.id.toString(),
    })
    const refreshToken = await this.encrypterRefreshToken.encrypt({
      sub: account.id.toString(),
    })

    return right({ accessToken, refreshToken })
  }
}
