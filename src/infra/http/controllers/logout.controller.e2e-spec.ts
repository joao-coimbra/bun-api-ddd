import { afterAll, describe, expect, test } from "bun:test"
import { type Treaty, treaty } from "@elysiajs/eden"
import { maybe } from "archstone"
import { AccountFactory } from "test/factories/make-account.factory"
import type { App } from "@/infra/app"
import { app } from "@/infra/app"
import { db as drizzle } from "@/infra/database/drizzle/client"
import { schema } from "@/infra/database/drizzle/schema"

const api: Treaty.Create<App> = treaty(app)
const accountFactory = new AccountFactory(drizzle)

describe("Logout (E2E)", () => {
  afterAll(async () => {
    await drizzle.delete(schema.users)
  })

  test("[POST] /auth/logout 204", async () => {
    const { cookieHeader } =
      await accountFactory.makeDrizzleAuthenticatedAccount()

    const response = await api.auth.logout.post(null, { headers: cookieHeader })

    expect(response.status).toBe(204)

    const headers = maybe(response.headers).orThrow() as Headers

    expect(headers.get("set-cookie")).toContain(
      "refreshToken=; Max-Age=0; Path=/auth/refresh"
    )
  })

  test("[POST] /auth/logout 204 — idempotent without session", async () => {
    const response = await api.auth.logout.post()

    expect(response.status).toBe(204)
  })
})
