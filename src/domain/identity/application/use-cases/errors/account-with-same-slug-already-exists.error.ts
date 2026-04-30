import { ConflictError } from "@/core/errors/conflict.error"

export class AccountWithSameSlugAlreadyExistsError extends ConflictError {
  constructor(identifier: string) {
    super(`Account with slug ${identifier} already exists.`)
  }
}
