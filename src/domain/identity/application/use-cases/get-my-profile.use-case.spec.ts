import { beforeEach, describe, expect, it } from "bun:test"
import { type Either, UniqueEntityId } from "archstone/core"
import { makeAccount } from "test/factories/make-account.factory"
import { InMemoryAccountRepository } from "test/repositories/in-memory-account.repository"
import { AccountNotFoundError } from "./errors/account-not-found.error"
import { GetMyProfileUseCase } from "./get-my-profile.use-case"

function expectLeft<L, R>(result: Either<L, R>, assert: (error: L) => void) {
  result.match({
    left: assert,
    right: () => {
      throw new Error("expected left branch")
    },
  })
}

let inMemoryAccountRepository: InMemoryAccountRepository
let sut: GetMyProfileUseCase

describe("GetMyProfileUseCase", () => {
  beforeEach(() => {
    inMemoryAccountRepository = new InMemoryAccountRepository()
    sut = new GetMyProfileUseCase(inMemoryAccountRepository)
  })

  it("should be able to get the account", async () => {
    const account = makeAccount()
    await inMemoryAccountRepository.create(account)

    const result = await sut.execute({ accountId: account.id.toString() })

    expect(result.isRight()).toBeTrue()
    const { account: loaded } = result.getOrThrow()
    expect(loaded).toBe(account)
  })

  it("should not be able to get the account if the id does not exist", async () => {
    const missingId = new UniqueEntityId()

    const result = await sut.execute({ accountId: missingId.toValue() })

    expectLeft(result, (error) => {
      expect(error).toBeInstanceOf(AccountNotFoundError)
      expect(error.message).toBe(
        `Account with id ${missingId.toValue()} not found.`
      )
    })
  })
})
