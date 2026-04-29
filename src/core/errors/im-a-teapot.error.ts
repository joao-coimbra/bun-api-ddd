import type { UseCaseError } from "archstone/domain/application"
import { AppError } from "./app.error"

export class ImATeapotError extends AppError implements UseCaseError {
  readonly status = 418

  constructor(message = "I'm a teapot.") {
    super(message)
  }
}
