import type { UseCaseError } from "archstone/domain/application"
import { AppError } from "./app.error"

export class UnauthorizedError extends AppError implements UseCaseError {
  readonly status = 401

  constructor(message = "Unauthorized.") {
    super(message)
  }
}
