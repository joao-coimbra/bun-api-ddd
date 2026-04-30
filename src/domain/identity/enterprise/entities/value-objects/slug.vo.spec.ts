import { describe, expect, it } from "bun:test"
import { Slug } from "./slug.vo"

describe("Slug", () => {
  it("should be able to create a new slug from text", () => {
    const slug = Slug.createFromText("Example question title")

    expect(slug.value).toBe("example-question-title")
  })

  it("normalizes empty or unusable text to an empty slug value", () => {
    expect(Slug.createFromText("").value).toBe("")
    expect(Slug.createFromText("   ").value).toBe("")
    expect(Slug.createFromText("!@#$%^&*()").value).toBe("")
  })
})
