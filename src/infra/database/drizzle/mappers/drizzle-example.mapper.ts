import { UniqueEntityId } from "archstone"
import { Example } from "@/domain/example/enterprise/entities/example.entity"
import { Slug } from "@/domain/example/enterprise/entities/value-objects/slug.vo"
import type { DrizzleExample } from "../schema/example"

class DrizzleExampleMapperImplementation {
  toDomain(raw: DrizzleExample): Example {
    return Example.create(
      {
        name: raw.name,
        description: raw.description,
        slug: Slug.create(raw.slug),
      },
      new UniqueEntityId(raw.id)
    )
  }

  toDrizzle(example: Example): DrizzleExample {
    return {
      id: example.id.toString(),
      name: example.name,
      description: example.description,
      slug: example.slug,
      createdAt: example.createdAt,
      updatedAt: example.updatedAt,
    }
  }
}

export const DrizzleExampleMapper = new DrizzleExampleMapperImplementation()
