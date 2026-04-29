import type { UseCaseError } from "archstone/domain/application"
import { AppError } from "./app.error"

export class BadRequestError extends AppError implements UseCaseError {
  readonly status = 400

  constructor(message = "Bad request.") {
    super(message)
  }
}
