import { beforeEach, describe, expect, it } from "bun:test"
import type { Either } from "archstone/core"
import { FakeHasher } from "test/cryptography/fake-hasher"
import { makeAccount } from "test/factories/make-account.factory"
import { InMemoryAccountRepository } from "test/repositories/in-memory-account.repository"
import { Slug } from "../../enterprise/entities/value-objects/slug.vo"
import { AccountWithSameEmailAlreadyExistsError } from "./errors/account-with-same-email-already-exists.error"
import { AccountWithSameSlugAlreadyExistsError } from "./errors/account-with-same-slug-already-exists.error"
import { AccountWithSameUsernameAlreadyExistsError } from "./errors/account-with-same-username-already-exists.error"
import { RegisterAccountUseCase } from "./register-account.use-case"

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
let sut: RegisterAccountUseCase

describe("RegisterAccountUseCase", () => {
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

    const { account } = result.getOrThrow()

    expect(account.name).toBe("Ada Lovelace")
    expect(account.username).toBe("ada")
    expect(account.email).toBe("ada@example.test")
    expect(account.slug).toBe("ada-lovelace")
    expect(account.passwordHash).toBe("plain-secret-hashed")
    expect(inMemoryAccountRepository.items).toHaveLength(1)
  })

  it("should derive slug from name when slug is omitted", async () => {
    const name = "Example forum title"

    const result = await sut.execute({
      name,
      username: "user1",
      email: "user1@example.test",
      password: "plain-secret",
    })

    expect(result.isRight()).toBeTrue()

    const expectedSlug = Slug.createFromText(name).value
    expect(result.getOrThrow().account.slug).toBe(expectedSlug)
    expect(inMemoryAccountRepository.items).toHaveLength(1)
  })

  it("should normalize slug with trim and lowercase before persisting", async () => {
    const result = await sut.execute({
      name: "Any",
      username: "u1",
      email: "u1@example.test",
      slug: "  MixedCase-Slug  ",
      password: "x",
    })

    expect(result.isRight()).toBeTrue()
    expect(result.getOrThrow().account.slug).toBe("mixedcase-slug")
  })

  it("should return AccountWithSameSlugAlreadyExistsError when slug already exists", async () => {
    const slug = "taken-slug"
    const existing = makeAccount({ slug: Slug.create(slug) })

    await inMemoryAccountRepository.create(existing)

    const result = await sut.execute({
      name: "Any",
      username: "unique-user",
      email: "unique@example.test",
      slug,
      password: "any",
    })

    expectLeft(result, (error) => {
      expect(error).toBeInstanceOf(AccountWithSameSlugAlreadyExistsError)
      expect(error.message).toBe(`Account with slug ${slug} already exists.`)
    })

    expect(inMemoryAccountRepository.items).toHaveLength(1)
  })

  it("should return AccountWithSameUsernameAlreadyExistsError when username already exists", async () => {
    const username = "ada"
    const existing = makeAccount({ username })

    await inMemoryAccountRepository.create(existing)

    const result = await sut.execute({
      name: "Any",
      username,
      email: "unique@example.test",
      slug: "unique-slug",
      password: "any",
    })

    expectLeft(result, (error) => {
      expect(error).toBeInstanceOf(AccountWithSameUsernameAlreadyExistsError)
      expect(error.message).toBe(
        `Account with username ${username} already exists.`
      )
    })

    expect(inMemoryAccountRepository.items).toHaveLength(1)
  })

  it("should return AccountWithSameEmailAlreadyExistsError when email already exists", async () => {
    const email = "ada@example.test"
    const existing = makeAccount({ email })

    await inMemoryAccountRepository.create(existing)

    const result = await sut.execute({
      name: "Any",
      username: "unique-user",
      email,
      slug: "unique-slug",
      password: "any",
    })

    expectLeft(result, (error) => {
      expect(error).toBeInstanceOf(AccountWithSameEmailAlreadyExistsError)
      expect(error.message).toBe(`Account with email ${email} already exists.`)
    })

    expect(inMemoryAccountRepository.items).toHaveLength(1)
  })

  it("should fail on slug first when slug and username are taken on different accounts", async () => {
    const takenSlug = "slug-a"
    const takenUsername = "user-b"

    await inMemoryAccountRepository.create(
      makeAccount({ slug: Slug.create(takenSlug), username: "other" })
    )
    await inMemoryAccountRepository.create(
      makeAccount({ slug: Slug.create("other-slug"), username: takenUsername })
    )

    const result = await sut.execute({
      name: "Any",
      username: takenUsername,
      email: "new@example.test",
      slug: takenSlug,
      password: "any",
    })

    expectLeft(result, (error) => {
      expect(error).toBeInstanceOf(AccountWithSameSlugAlreadyExistsError)
    })

    expect(inMemoryAccountRepository.items).toHaveLength(2)
  })
})
