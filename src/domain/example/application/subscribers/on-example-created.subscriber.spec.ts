import { beforeEach, describe, expect, it, type Mock, spyOn } from "bun:test"
import { makeExample } from "test/factories/make-example.factory"
import { waitFor } from "test/helpers/wait-for"
import { InMemoryExampleRepository } from "test/repositories/in-memory-example.repository"
import { OnExampleCreated } from "./on-example-created.subscriber"

let inMemoryExampleRepository: InMemoryExampleRepository

let exampleCreatedExecuteSpy: Mock<InMemoryExampleRepository["save"]>

describe("OnExampleCreated", () => {
  beforeEach(() => {
    inMemoryExampleRepository = new InMemoryExampleRepository()

    exampleCreatedExecuteSpy = spyOn(inMemoryExampleRepository, "save")

    new OnExampleCreated(inMemoryExampleRepository)
  })

  it("should process and save when ExampleCreatedEvent is dispatched", async () => {
    const example = makeExample()

    await inMemoryExampleRepository.create(example)

    await waitFor(() => {
      expect(exampleCreatedExecuteSpy).toHaveBeenCalled()
    })
  })
})
