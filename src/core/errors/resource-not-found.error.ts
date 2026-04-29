import type { UseCaseError } from "archstone/domain/application"
import { AppError } from "./app.error"

export class ResourceNotFoundError extends AppError implements UseCaseError {
  readonly status = 404

  constructor(message = "Resource not found.") {
    super(message)
  }
}
