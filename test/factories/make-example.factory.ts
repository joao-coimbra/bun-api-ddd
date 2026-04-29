import { faker } from "@faker-js/faker"
import type { UniqueEntityId } from "archstone"
import {
  Example,
  type ExampleProps,
} from "@/domain/example/enterprise/entities/example.entity"

export function makeExample(
  override: Partial<ExampleProps> = {},
  id?: UniqueEntityId
): Example {
  return Example.create(
    {
      name: faker.lorem.word(),
      description: faker.lorem.sentence(),
      ...override,
    },
    id
  )
}
