import { ConflictError } from "@/core/errors/conflict.error"

export class AccountWithSameUsernameAlreadyExistsError extends ConflictError {
  constructor(identifier: string) {
    super(`Account with username ${identifier} already exists.`)
  }
}
