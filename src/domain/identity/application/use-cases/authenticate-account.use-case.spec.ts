import { beforeEach, describe, expect, it } from "bun:test"
import type { Either } from "archstone/core"
import { FakeEncrypter } from "test/cryptography/fake-encrypter"
import { FakeHasher } from "test/cryptography/fake-hasher"
import { makeAccount } from "test/factories/make-account.factory"
import { InMemoryAccountRepository } from "test/repositories/in-memory-account.repository"
import { AuthenticateAccountUseCase } from "./authenticate-account.use-case"
import { WrongCredentialsError } from "./errors/wrong-credentials.error"

function expectLeft<L, R>(result: Either<L, R>, assert: (error: L) => void) {
  result.match({
    left: assert,
    right: () => {
      throw new Error("expected left branch")
    },
  })
}

let inMemoryAccountRepository: InMemoryAccountRepository
let fakeHasher: FakeHasher
let accessEncrypter: FakeEncrypter
let refreshEncrypter: FakeEncrypter
let sut: AuthenticateAccountUseCase

describe("AuthenticateAccountUseCase", () => {
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

  it("retorna access e refresh token quando email e senha conferem", async () => {
    const email = "ada@example.test"
    const password = "plain-secret"
    const passwordHash = await fakeHasher.hash(password)
    const account = makeAccount({ email, passwordHash })

    await inMemoryAccountRepository.create(account)

    const result = await sut.execute({ email, password })

    expect(result.isRight()).toBeTrue()

    const { accessToken, refreshToken } = result.getOrThrow()
    const expectedSub = JSON.stringify({ sub: account.id.toString() })

    expect(accessToken).toBe(expectedSub)
    expect(refreshToken).toBe(expectedSub)
  })

  it("retorna WrongCredentialsError quando o email não existe", async () => {
    const result = await sut.execute({
      email: "missing@example.test",
      password: "any",
    })

    expectLeft(result, (error) => {
      expect(error).toBeInstanceOf(WrongCredentialsError)
      expect(error.message).toBe("Invalid email or password.")
    })
  })

  it("retorna WrongCredentialsError quando a senha é inválida", async () => {
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

    expectLeft(result, (error) => {
      expect(error).toBeInstanceOf(WrongCredentialsError)
      expect(error.message).toBe("Invalid email or password.")
    })
  })
})
