import type { UseCaseError } from "archstone/domain/application"
import { AppError } from "./app.error"

export class TooManyRequestsError extends AppError implements UseCaseError {
  readonly status = 429

  constructor(message = "Too many requests.") {
    super(message)
  }
}
