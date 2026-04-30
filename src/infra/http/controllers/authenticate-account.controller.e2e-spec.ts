import { beforeAll, beforeEach, describe, expect, test } from "bun:test"
import { type Treaty, treaty } from "@elysiajs/eden"
import { AccountFactory } from "test/factories/make-account.factory"
import type { HashGenerator } from "@/domain/identity/application/cryptography/hash-generator"
import { type App, app } from "@/infra/app"
import { BunHasher } from "@/infra/cryptography/bun-hasher"
import { db } from "@/infra/database/drizzle/client"
import { schema } from "@/infra/database/drizzle/schema"

let accountFactory: AccountFactory
let fakeHasher: HashGenerator

let api: Treaty.Create<App>

describe("Authenticate Account (E2E)", () => {
  beforeAll(() => {
    accountFactory = new AccountFactory(db)
    fakeHasher = new BunHasher()

    api = treaty(app)
  })

  describe("[POST] /sessions 200", () => {
    beforeEach(async () => {
      await db.delete(schema.users)
    })

    test("return tokens when email and password match a registered user", async () => {
      const password = "secret-password"

      const passwordHash = await fakeHasher.hash(password)

      await accountFactory.makeDrizzleAccount({
        email: "jane@example.com",
        username: "jane",
        passwordHash,
      })

      const response = await api.sessions.post({
        email: "jane@example.com",
        password,
      })

      expect(response.status).toBe(200)
      expect(response.data).toMatchObject({
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
        password: "anypassword1",
      })

      expect(response.status).toBe(401)
    })

    test("return 401 when password is wrong", async () => {
      const passwordHash = await fakeHasher.hash("secret-password")

      await accountFactory.makeDrizzleAccount({
        email: "jane@example.com",
        username: "jane",
        passwordHash,
      })

      const response = await api.sessions.post({
        email: "jane@example.com",
        password: "wrong-passwd12",
      })

      expect(response.status).toBe(401)
    })
  })
})
