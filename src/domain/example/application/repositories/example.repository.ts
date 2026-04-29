import type { Example } from "../../enterprise/entities/example.entity"

export interface ExampleRepository {
  create(example: Example): Promise<void>
  findBySlug(slug: string): Promise<Example | null>
  save(example: Example): Promise<void>
}
