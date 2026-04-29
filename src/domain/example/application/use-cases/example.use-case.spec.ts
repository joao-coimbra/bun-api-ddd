import { beforeEach, describe, expect, it } from "bun:test"
import { makeExample } from "test/factories/make-example.factory"
import { InMemoryExampleRepository } from "test/repositories/in-memory-example.repository"
import { ExampleAlreadyExistsError } from "./errors/example-already-exists.error"
import { ExampleIsATeapotError } from "./errors/example-is-a-teapot.error"
import { ExampleUseCase } from "./example.use-case"

let inMemoryExampleRepository: InMemoryExampleRepository

let sut: ExampleUseCase

describe("ExampleUseCase", () => {
  beforeEach(() => {
    inMemoryExampleRepository = new InMemoryExampleRepository()

    sut = new ExampleUseCase(inMemoryExampleRepository)
  })

  it("should create an example when name is new and not teapot", async () => {
    const result = await sut.execute({
      name: "Fresh Example",
      description: "any description",
    })

    expect(result.isRight()).toBeTrue()

    const { example } = result.getOrThrow()

    expect(example.name).toBe("Fresh Example")
    expect(example.slug).toBe("fresh-example")
    expect(example.description).toBe("any description")

    expect(inMemoryExampleRepository.items).toHaveLength(1)
  })

  it("should return ExampleIsATeapotError when name is teapot", async () => {
    const result = await sut.execute({
      name: "teapot",
      description: "any description",
    })

    result.match({
      left: (error) => {
        expect(error).toBeInstanceOf(ExampleIsATeapotError)
        expect(error.message).toBe("I'm a teapot.")
      },
      right: () => {
        throw new Error("expected left branch")
      },
    })

    expect(inMemoryExampleRepository.items).toHaveLength(0)
  })

  it("should return ExampleAlreadyExistsError when name already exists", async () => {
    const name = "already-taken"
    const existing = makeExample({ name, description: "seed" })

    await inMemoryExampleRepository.create(existing)

    const result = await sut.execute({
      name,
      description: "attempt",
    })

    result.match({
      left: (error) => {
        expect(error).toBeInstanceOf(ExampleAlreadyExistsError)
        expect(error.message).toBe(`Example with ${name} already exists.`)
      },
      right: () => {
        throw new Error("expected left branch")
      },
    })

    expect(inMemoryExampleRepository.items).toHaveLength(1)
  })
})
