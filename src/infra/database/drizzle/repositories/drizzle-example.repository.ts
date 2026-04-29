import { eq } from "drizzle-orm"
import type { ExampleRepository } from "@/domain/example/application/repositories/example.repository"
import type { Example } from "@/domain/example/enterprise/entities/example.entity"
import type { DrizzleClient } from "../client"
import { DrizzleExampleMapper } from "../mappers/drizzle-example.mapper"
import { schema } from "../schema"

export class DrizzleExampleRepository implements ExampleRepository {
  constructor(private readonly drizzle: DrizzleClient) {}

  async create(example: Example): Promise<void> {
    const raw = DrizzleExampleMapper.toDrizzle(example)

    await this.drizzle.insert(schema.example).values(raw)
  }

  async findBySlug(slug: string): Promise<Example | null> {
    const raw = await this.drizzle.query.example.findFirst({
      where: eq(schema.example.slug, slug),
    })

    return raw ? DrizzleExampleMapper.toDomain(raw) : null
  }

  async save(example: Example): Promise<void> {
    const raw = DrizzleExampleMapper.toDrizzle(example)

    await this.drizzle
      .update(schema.example)
      .set(raw)
      .where(eq(schema.example.id, example.id.toString()))
  }
}
