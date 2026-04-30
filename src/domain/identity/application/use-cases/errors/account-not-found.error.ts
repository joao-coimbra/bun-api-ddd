import { ResourceNotFoundError } from "@/core/errors/resource-not-found.error"

export class AccountNotFoundError extends ResourceNotFoundError {
  constructor(accountId: string) {
    super(`Account with id ${accountId} not found.`)
  }
}
