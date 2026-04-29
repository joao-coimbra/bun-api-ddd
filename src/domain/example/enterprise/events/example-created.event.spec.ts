import { describe, expect, it } from "bun:test"
import { makeExample } from "test/factories/make-example.factory"
import { ExampleCreatedEvent } from "./example-created.event"

describe("ExampleCreatedEvent", () => {
  it("should expose event data and aggregate id", () => {
    const example = makeExample()
    const event = new ExampleCreatedEvent(example)

    expect(event.example).toBe(example)
    expect(event.getAggregateId()).toBe(example.id)
    expect(event.occurredAt).toBeInstanceOf(Date)
  })
})
