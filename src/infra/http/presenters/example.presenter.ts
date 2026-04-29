import type { Example } from "@/domain/example/enterprise/entities/example.entity"

export interface ExampleHTTPResponse {
  id: string
  name: string
  description: string
  slug: string
}

class ExamplePresenterImplementation {
  toHTTP(example: Example): ExampleHTTPResponse {
    return {
      id: example.id.toString(),
      name: example.name,
      description: example.description,
      slug: example.slug,
    }
  }
}

export const ExamplePresenter = new ExamplePresenterImplementation()
