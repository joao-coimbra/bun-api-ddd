import { ValueObject } from "archstone"

export interface SlugProps {
  value: string
}

export class Slug extends ValueObject<SlugProps> {
  get value(): string {
    return this.props.value
  }

  static create(value: string): Slug {
    return new Slug({ value: value.toLowerCase().trim() })
  }

  /**
   * Receives a string and normalize it as a slug.
   *
   * Example: "An example title" => "an-example-title"
   *
   * @param text {string}
   */
  static createFromText(text: string): Slug {
    const slugText = text
      .normalize("NFKD")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
      .replace(/_/g, "-")
      .replace(/--+/g, "-")
      .replace(/-$/g, "")

    return new Slug({ value: slugText })
  }
}
