import type { Account } from "@/domain/identity/enterprise/entities/account.entity"

export interface AccountHTTPResponse {
  id: string
  name: string
  username: string
  email: string
  slug: string
  createdAt: string
}

class AccountPresenterImplementation {
  toHTTP(account: Account): AccountHTTPResponse {
    return {
      id: account.id.toString(),
      name: account.name,
      username: account.username,
      email: account.email,
      slug: account.slug,
      createdAt: account.createdAt.toISOString(),
    }
  }
}

export const AccountPresenter = new AccountPresenterImplementation()
