import { beforeEach, describe, expect, test } from "bun:test"
import { FakeHasher } from "test/cryptography/fake-hasher"
import { InMemoryAccountRepository } from "test/repositories/in-memory-account.repository"
import { AccountSeeder } from "./account.seeder"

describe("AccountSeeder", () => {
  let inMemoryAccountRepository: InMemoryAccountRepository
  let fakeHasher: FakeHasher

  let sut: AccountSeeder

  beforeEach(() => {
    inMemoryAccountRepository = new InMemoryAccountRepository()
    fakeHasher = new FakeHasher()

    sut = new AccountSeeder(inMemoryAccountRepository, fakeHasher)
  })

  test("persist one account with the seed email and username", async () => {
    await sut.seed()

    expect(inMemoryAccountRepository.items).toHaveLength(1)

    const account = inMemoryAccountRepository.items[0]
    expect(account).toEqual(
      expect.objectContaining({
        email: "seed@example.com",
        username: "seed_admin",
      })
    )
  })

  test("hash the seed password and persist it", async () => {
    await sut.seed()

    const account = inMemoryAccountRepository.items[0]
    expect(account).toEqual(
      expect.objectContaining({
        passwordHash: "password123-hashed",
      })
    )
  })
})
