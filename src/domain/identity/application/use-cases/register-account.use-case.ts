import { type Either, left, right } from "archstone/core"
import type { UseCase } from "archstone/domain/application"
import { Account } from "../../enterprise/entities/account.entity"
import { Slug } from "../../enterprise/entities/value-objects/slug.vo"
import type { HashGenerator } from "../cryptography/hash-generator"
import type { AccountRepository } from "../repositories/account.repository"
import { AccountWithSameEmailAlreadyExistsError } from "./errors/account-with-same-email-already-exists.error"
import { AccountWithSameSlugAlreadyExistsError } from "./errors/account-with-same-slug-already-exists.error"
import { AccountWithSameUsernameAlreadyExistsError } from "./errors/account-with-same-username-already-exists.error"

export interface RegisterAccountUseCaseRequest {
  name: string
  username: string
  email: string
  slug?: string
  password: string
}

export type RegisterAccountUseCaseResponse = Either<
  | AccountWithSameSlugAlreadyExistsError
  | AccountWithSameUsernameAlreadyExistsError
  | AccountWithSameEmailAlreadyExistsError,
  {
    account: Account
  }
>

export class RegisterAccountUseCase
  implements
    UseCase<RegisterAccountUseCaseRequest, RegisterAccountUseCaseResponse>
{
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly passwordHashGenerator: HashGenerator
  ) {}

  async execute({
    name,
    username,
    email,
    slug = Slug.createFromText(name).value,
    password,
  }: RegisterAccountUseCaseRequest): Promise<RegisterAccountUseCaseResponse> {
    const existingAccountWithSameSlug =
      await this.accountRepository.findBySlug(slug)

    if (existingAccountWithSameSlug) {
      return left(new AccountWithSameSlugAlreadyExistsError(slug))
    }

    const existingAccountWithSameUsername =
      await this.accountRepository.findByUsername(username)

    if (existingAccountWithSameUsername) {
      return left(new AccountWithSameUsernameAlreadyExistsError(username))
    }

    const existingAccountWithSameEmail =
      await this.accountRepository.findByEmail(email)

    if (existingAccountWithSameEmail) {
      return left(new AccountWithSameEmailAlreadyExistsError(email))
    }

    const passwordHash = await this.passwordHashGenerator.hash(password)

    const account = Account.create({
      name,
      username,
      email,
      slug: Slug.create(slug),
      passwordHash,
    })

    await this.accountRepository.create(account)

    return right({ account })
  }
}
