import type { UseCaseError } from "archstone/domain/application"
import { AppError } from "./app.error"

export class MethodNotAllowedError extends AppError implements UseCaseError {
  readonly status = 405

  constructor(message = "Method not allowed.") {
    super(message)
  }
}
