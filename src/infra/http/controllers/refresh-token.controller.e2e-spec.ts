import { afterAll, beforeAll, describe, expect, test } from "bun:test"
import { type Treaty, treaty } from "@elysiajs/eden"
import { AccountFactory } from "test/factories/make-account.factory"
import type { App } from "@/infra/app"
import { app } from "@/infra/app"
import { db as drizzle } from "@/infra/database/drizzle/client"

const accountFactory = new AccountFactory(drizzle)

let api: Treaty.Create<App>
let cleanup: () => Promise<void>

describe("Refresh Token (E2E)", () => {
  beforeAll(async () => {
    const { cookieHeader, cleanup: cleanupTokens } =
      await accountFactory.makeDrizzleAuthenticatedAccount()
    api = treaty(app, { headers: cookieHeader })
    cleanup = cleanupTokens
  })

  afterAll(async () => {
    await cleanup()
  })

  test("[PATCH] /auth/refresh 200", async () => {
    const response = await api.auth.refresh.patch()

    expect(response.status).toBe(200)
    expect(response.data).toEqual({
      accessToken: expect.any(String),
    })
  })
})
