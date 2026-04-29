import type { UseCaseError } from "archstone/domain/application"
import { AppError } from "./app.error"

export class ConflictError extends AppError implements UseCaseError {
  readonly status = 409

  constructor(message = "A conflict error has occurred.") {
    super(message)
  }
}
