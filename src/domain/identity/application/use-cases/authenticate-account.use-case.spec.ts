import { beforeEach, describe, expect, it } from "bun:test"
import { FakeEncrypter } from "test/cryptography/fake-encrypter"
import { FakeHasher } from "test/cryptography/fake-hasher"
import { makeAccount } from "test/factories/make-account.factory"
import { InMemoryAccountRepository } from "test/repositories/in-memory-account.repository"
import { AuthenticateAccountUseCase } from "./authenticate-account.use-case"

let inMemoryAccountRepository: InMemoryAccountRepository
let fakeHasher: FakeHasher
let accessEncrypter: FakeEncrypter
let refreshEncrypter: FakeEncrypter

let sut: AuthenticateAccountUseCase

describe("Authenticate Account", () => {
  beforeEach(() => {
    inMemoryAccountRepository = new InMemoryAccountRepository()
    fakeHasher = new FakeHasher()
    accessEncrypter = new FakeEncrypter()
    refreshEncrypter = new FakeEncrypter()

    sut = new AuthenticateAccountUseCase(
      inMemoryAccountRepository,
      fakeHasher,
      accessEncrypter,
      refreshEncrypter
    )
  })

  it("should return access and refresh tokens when email and password match", async () => {
    const email = "ada@example.test"
    const password = "plain-secret"
    const passwordHash = await fakeHasher.hash(password)

    const account = makeAccount({ email, passwordHash })

    await inMemoryAccountRepository.create(account)

    const result = await sut.execute({ email, password })

    expect(result.isRight()).toBeTrue()

    const expectedSub = JSON.stringify({ sub: account.id.toString() })
    const { accessToken, refreshToken } = result.getOrThrow()
    expect(accessToken).toBe(expectedSub)
    expect(refreshToken).toBe(expectedSub)
  })

  it("should return WrongCredentialsError when email is not registered", async () => {
    const result = await sut.execute({
      email: "missing@example.test",
      password: "any",
    })

    expect(result.isLeft()).toBeTrue()
  })

  it("should return WrongCredentialsError when password does not match", async () => {
    const email = "ada@example.test"

    const account = makeAccount({
      email,
      passwordHash: await fakeHasher.hash("correct-password"),
    })

    await inMemoryAccountRepository.create(account)

    const result = await sut.execute({
      email,
      password: "wrong-password",
    })

    expect(result.isLeft()).toBeTrue()
  })
})
