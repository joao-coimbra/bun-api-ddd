import type { Example } from "../../enterprise/entities/example.entity"

export interface ExampleRepository {
  create(example: Example): Promise<void>
  findByName(name: string): Promise<Example | null>
  save(example: Example): Promise<void>
}
