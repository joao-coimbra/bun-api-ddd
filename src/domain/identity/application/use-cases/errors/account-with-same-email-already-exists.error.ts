import { ConflictError } from "@/core/errors/conflict.error"

export class AccountWithSameEmailAlreadyExistsError extends ConflictError {
  constructor(identifier: string) {
    super(`Account with email ${identifier} already exists.`)
  }
}
