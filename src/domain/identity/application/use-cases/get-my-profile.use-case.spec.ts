import { beforeEach, describe, expect, it } from "bun:test"
import { UniqueEntityId } from "archstone/core"
import { makeAccount } from "test/factories/make-account.factory"
import { InMemoryAccountRepository } from "test/repositories/in-memory-account.repository"
import { GetMyProfileUseCase } from "./get-my-profile.use-case"

let inMemoryAccountRepository: InMemoryAccountRepository

let sut: GetMyProfileUseCase

describe("Get My Profile", () => {
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

    expect(result.isLeft()).toBeTrue()
  })
})
