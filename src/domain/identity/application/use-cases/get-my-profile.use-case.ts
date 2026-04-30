import { type Either, left, right, type UseCase } from "archstone"
import type { Account } from "../../enterprise/entities/account.entity"
import type { AccountRepository } from "../repositories/account.repository"
import { AccountNotFoundError } from "./errors/account-not-found.error"

export interface GetMyProfileUseCaseRequest {
  accountId: string
}

export type GetMyProfileUseCaseResponse = Either<
  AccountNotFoundError,
  {
    account: Account
  }
>

export class GetMyProfileUseCase
  implements UseCase<GetMyProfileUseCaseRequest, GetMyProfileUseCaseResponse>
{
  constructor(private readonly accountRepository: AccountRepository) {}

  async execute({
    accountId,
  }: GetMyProfileUseCaseRequest): Promise<GetMyProfileUseCaseResponse> {
    const account = await this.accountRepository.findById(accountId)

    if (!account) {
      return left(new AccountNotFoundError(accountId))
    }

    return right({ account })
  }
}
