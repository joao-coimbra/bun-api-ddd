import { ConflictError } from "@/core/errors/conflict.error"

export class ExampleAlreadyExistsError extends ConflictError {
  constructor(identifier: string) {
    super(`Example with ${identifier} already exists.`)
  }
}
