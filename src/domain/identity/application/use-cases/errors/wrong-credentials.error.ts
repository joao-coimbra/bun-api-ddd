import { UnauthorizedError } from "@/core/errors/unauthorized.error"

export class WrongCredentialsError extends UnauthorizedError {
  constructor() {
    super("Invalid email or password.")
  }
}
