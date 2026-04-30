import { beforeAll, describe, expect, test } from "bun:test"
import { type Treaty, treaty } from "@elysiajs/eden"
import { AccountFactory } from "test/factories/make-account.factory"
import { type App, app } from "@/infra/app"
import { db } from "@/infra/database/drizzle/client"

let accountFactory: AccountFactory

let api: Treaty.Create<App>

describe("Get My Profile (E2E)", () => {
  beforeAll(() => {
    accountFactory = new AccountFactory(db)

    api = treaty(app)
  })

  describe("[GET] /me 401", () => {
    test("return 401 when not authenticated", async () => {
      const response = await api.me.get()

      expect(response.status).toBe(401)
    })
  })

  describe("[GET] /me 200", () => {
    test("return my profile when authenticated", async () => {
      const { authHeader } =
        await accountFactory.makeDrizzleAuthenticatedAccount()

      const response = await api.me.get({
        headers: authHeader,
      })

      expect(response.status).toBe(200)
      expect(response.data).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        username: expect.any(String),
        email: expect.any(String),
        slug: expect.any(String),
        createdAt: expect.any(Date),
      })
    })
  })
})
