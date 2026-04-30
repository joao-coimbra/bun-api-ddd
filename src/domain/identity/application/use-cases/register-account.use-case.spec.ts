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

  it("registra conta quando slug, username e email são novos", async () => {
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

  it("deriva o slug a partir do name quando slug não é enviado", async () => {
    const name = "Título do fórum de exemplo"

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

  it("normaliza o slug com trim e lowercase antes de persistir", async () => {
    const result = await sut.execute({
      name: "Qualquer",
      username: "u1",
      email: "u1@example.test",
      slug: "  MixedCase-Slug  ",
      password: "x",
    })

    expect(result.isRight()).toBeTrue()
    expect(result.getOrThrow().account.slug).toBe("mixedcase-slug")
  })

  it("retorna AccountWithSameSlugAlreadyExistsError quando o slug já existe", async () => {
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

  it("retorna AccountWithSameUsernameAlreadyExistsError quando o username já existe", async () => {
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

  it("retorna AccountWithSameEmailAlreadyExistsError quando o email já existe", async () => {
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

  it("falha primeiro por slug quando slug e username já existem em contas diferentes", async () => {
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
