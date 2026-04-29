import type { UseCaseError } from "archstone/domain/application"
import { AppError } from "./app.error"

export class UnprocessableEntityError extends AppError implements UseCaseError {
  readonly status = 422

  constructor(message = "Unprocessable entity.") {
    super(message)
  }
}
