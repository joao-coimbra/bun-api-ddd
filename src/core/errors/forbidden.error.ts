import type { UseCaseError } from "archstone/domain/application"
import { AppError } from "./app.error"

export class ForbiddenError extends AppError implements UseCaseError {
  readonly status = 403

  constructor(message = "Forbidden.") {
    super(message)
  }
}
