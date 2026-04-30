import { beforeAll, beforeEach, describe, expect, test } from "bun:test"
import { type Treaty, treaty } from "@elysiajs/eden"
import { AccountFactory } from "test/factories/make-account.factory"
import { type App, app } from "@/infra/app"
import { db } from "@/infra/database/drizzle/client"
import { schema } from "@/infra/database/drizzle/schema"

let accountFactory: AccountFactory

let api: Treaty.Create<App>

describe("Authenticate Account (E2E)", () => {
  beforeAll(() => {
    accountFactory = new AccountFactory(db)

    api = treaty(app)
  })

  describe("[POST] /sessions 200", () => {
    beforeEach(async () => {
      await db.delete(schema.users)
    })

    test("return tokens when email and password match a registered user", async () => {
      const account = await accountFactory.makeDrizzleAccount({
        email: "jane@example.com",
        passwordHash: "secret-pass",
      })

      const response = await api.sessions.post({
        email: account.email,
        password: "secret-pass",
      })

      expect(response.status).toBe(200)
      expect(response.data).toContain({
        accessToken: expect.any(String),
      })
    })
  })

  describe("[POST] /sessions 401", () => {
    beforeEach(async () => {
      await db.delete(schema.users)
    })

    test("return 401 when email is unknown", async () => {
      const response = await api.sessions.post({
        email: "nobody@example.com",
        password: "any",
      })

      expect(response.status).toBe(401)
    })

    test("return 401 when password is wrong", async () => {
      const account = await accountFactory.makeDrizzleAccount({
        email: "jane@example.com",
        passwordHash: "secret-pass",
      })

      const response = await api.sessions.post({
        email: account.email,
        password: "wrong-pass",
      })

      expect(response.status).toBe(401)
    })
  })
})
