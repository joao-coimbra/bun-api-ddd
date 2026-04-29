import { type Either, left, right, type UseCase } from "archstone"
import { Example } from "../../enterprise/entities/example.entity"
import { Slug } from "../../enterprise/entities/value-objects/slug.vo"
import type { ExampleRepository } from "../repositories/example.repository"
import { ExampleAlreadyExistsError } from "./errors/example-already-exists.error"
import { ExampleIsATeapotError } from "./errors/example-is-a-teapot.error"

export interface ExampleUseCaseRequest {
  name: string
  description: string
}

export type ExampleUseCaseResponse = Either<
  ExampleAlreadyExistsError | ExampleIsATeapotError,
  { example: Example }
>

export class ExampleUseCase
  implements UseCase<ExampleUseCaseRequest, ExampleUseCaseResponse>
{
  constructor(private readonly exampleRepository: ExampleRepository) {}

  async execute({
    name,
    description,
  }: ExampleUseCaseRequest): Promise<ExampleUseCaseResponse> {
    const slug = Slug.createFromText(name).value
    const existingExample = await this.exampleRepository.findBySlug(slug)

    if (existingExample) {
      return left(new ExampleAlreadyExistsError(name))
    }

    if (name === "teapot") {
      return left(new ExampleIsATeapotError())
    }

    const newExample = Example.create({
      name,
      description,
    })

    await this.exampleRepository.create(newExample)

    return right({
      example: newExample,
    })
  }
}
