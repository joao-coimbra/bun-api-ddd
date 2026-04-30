import { beforeAll, beforeEach, describe, expect, test } from "bun:test"
import { type Treaty, treaty } from "@elysiajs/eden"
import { AccountFactory } from "test/factories/make-account.factory"
import { Slug } from "@/domain/identity/enterprise/entities/value-objects/slug.vo"
import { type App, app } from "@/infra/app"
import { db } from "@/infra/database/drizzle/client"
import { schema } from "@/infra/database/drizzle/schema"

let accountFactory: AccountFactory

let api: Treaty.Create<App>

describe("Register Account (E2E)", () => {
  beforeAll(() => {
    accountFactory = new AccountFactory(db)

    api = treaty(app)
  })

  describe("[POST] /accounts 201", () => {
    beforeEach(async () => {
      await db.delete(schema.user)
    })

    test("should be able to register a new account without slug", async () => {
      const response = await api.accounts.post({
        name: "John Doe",
        username: "john.doe",
        email: "john.doe@example.com",
        password: "123456",
      })

      expect(response.status).toBe(201)
      expect(response.data).toMatchObject({
        id: expect.any(String),
        name: "John Doe",
        username: "john.doe",
        email: "john.doe@example.com",
        slug: "john-doe",
      })
    })

    test("should be able to register a new account with slug", async () => {
      const response = await api.accounts.post({
        name: "John Doe",
        username: "john.doe",
        email: "john.doe@example.com",
        slug: "john-doe",
        password: "123456",
      })

      expect(response.status).toBe(201)
      expect(response.data).toMatchObject({
        id: expect.any(String),
        name: "John Doe",
        username: "john.doe",
        email: "john.doe@example.com",
        slug: "john-doe",
      })
    })
  })

  describe("[POST] /accounts 409", () => {
    beforeEach(async () => {
      await db.delete(schema.user)
    })

    test("should not be able to register a new account with same username", async () => {
      await accountFactory.makeDrizzleAccount({
        username: "john.doe",
      })

      const response = await api.accounts.post({
        name: "John Doe",
        username: "john.doe",
        email: "john.doe@example.com",
        password: "123456",
      })

      expect(response.status).toBe(409)
    })

    test("should not be able to register a new account with same email", async () => {
      await accountFactory.makeDrizzleAccount({
        email: "john.doe@example.com",
      })

      const response = await api.accounts.post({
        name: "John Doe",
        username: "john.doe",
        email: "john.doe@example.com",
        password: "123456",
      })

      expect(response.status).toBe(409)
    })

    test("should not be able to register a new account with same slug", async () => {
      await accountFactory.makeDrizzleAccount({
        slug: Slug.create("john-doe"),
      })

      const response = await api.accounts.post({
        name: "John Doe",
        username: "john.doe",
        email: "john.doe@example.com",
        slug: "john-doe",
        password: "123456",
      })

      expect(response.status).toBe(409)
    })
  })
})
