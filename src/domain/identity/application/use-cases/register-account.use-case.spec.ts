import { beforeEach, describe, expect, it } from "bun:test"
import { FakeHasher } from "test/cryptography/fake-hasher"
import { makeAccount } from "test/factories/make-account.factory"
import { InMemoryAccountRepository } from "test/repositories/in-memory-account.repository"
import { Slug } from "../../enterprise/entities/value-objects/slug.vo"
import { RegisterAccountUseCase } from "./register-account.use-case"

let inMemoryAccountRepository: InMemoryAccountRepository
let fakeHasher: FakeHasher
let sut: RegisterAccountUseCase

describe("Register Account", () => {
  beforeEach(() => {
    inMemoryAccountRepository = new InMemoryAccountRepository()
    fakeHasher = new FakeHasher()
    sut = new RegisterAccountUseCase(inMemoryAccountRepository, fakeHasher)
  })

  it("should register account when slug, username, and email are new", async () => {
    const result = await sut.execute({
      name: "Ada Lovelace",
      username: "ada",
      email: "ada@example.test",
      slug: "ada-lovelace",
      password: "plain-secret",
    })

    expect(result.isRight()).toBeTrue()

    expect(inMemoryAccountRepository.items).toHaveLength(1)
    expect(inMemoryAccountRepository.items[0]).toMatchObject({
      name: "Ada Lovelace",
      username: "ada",
      email: "ada@example.test",
      slug: "ada-lovelace",
    })
  })

  it("should return AccountWithSameSlugAlreadyExistsError when slug is already taken", async () => {
    const slug = "taken-slug"

    const account = makeAccount({ slug: Slug.create(slug) })

    await inMemoryAccountRepository.create(account)

    const result = await sut.execute({
      name: "Any",
      username: "unique-user",
      email: "unique@example.test",
      slug,
      password: "any",
    })

    expect(result.isLeft()).toBeTrue()

    expect(inMemoryAccountRepository.items).toHaveLength(1)
  })

  it("should return AccountWithSameUsernameAlreadyExistsError when username is already taken", async () => {
    const username = "ada"

    const account = makeAccount({ username })

    await inMemoryAccountRepository.create(account)

    const result = await sut.execute({
      name: "Any",
      username,
      email: "unique@example.test",
      slug: "unique-slug",
      password: "any",
    })

    expect(result.isLeft()).toBeTrue()

    expect(inMemoryAccountRepository.items).toHaveLength(1)
  })

  it("should return AccountWithSameEmailAlreadyExistsError when email is already taken", async () => {
    const email = "ada@example.test"

    const account = makeAccount({ email })

    await inMemoryAccountRepository.create(account)

    const result = await sut.execute({
      name: "Any",
      username: "unique-user",
      email,
      slug: "unique-slug",
      password: "any",
    })

    expect(result.isLeft()).toBeTrue()

    expect(inMemoryAccountRepository.items).toHaveLength(1)
  })
})
