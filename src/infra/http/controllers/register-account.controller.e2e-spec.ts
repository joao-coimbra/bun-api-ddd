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

  describe("[POST] /accounts 204", () => {
    beforeEach(async () => {
      await db.delete(schema.users)
    })

    test("return 204 when registering without slug", async () => {
      const response = await api.accounts.post({
        name: "John Doe",
        username: "john",
        email: "john@example.com",
        password: "password12",
      })

      expect(response.status).toBe(204)
      expect(response.data ?? "").toBe("")
    })

    test("return 204 when registering with explicit slug", async () => {
      const response = await api.accounts.post({
        name: "Jane Roe",
        username: "jane",
        email: "jane@example.com",
        slug: "jane-slug",
        password: "password12",
      })

      expect(response.status).toBe(204)
      expect(response.data ?? "").toBe("")
    })
  })

  describe("[POST] /accounts 409", () => {
    beforeEach(async () => {
      await db.delete(schema.users)
    })

    test("return 409 when username already exists", async () => {
      await accountFactory.makeDrizzleAccount({
        username: "john",
        email: "existing@example.com",
      })

      const response = await api.accounts.post({
        name: "John Doe",
        username: "john",
        email: "new@example.com",
        slug: "new-slug",
        password: "password12",
      })

      expect(response.status).toBe(409)
    })

    test("return 409 when email already exists", async () => {
      await accountFactory.makeDrizzleAccount({
        email: "john@example.com",
      })

      const response = await api.accounts.post({
        name: "Other Person",
        username: "other",
        email: "john@example.com",
        slug: "other-slug",
        password: "password12",
      })

      expect(response.status).toBe(409)
    })

    test("return 409 when slug already exists", async () => {
      await accountFactory.makeDrizzleAccount({
        username: "existing",
        email: "existing@example.com",
        slug: Slug.create("taken-slug"),
      })

      const response = await api.accounts.post({
        name: "John Doe",
        username: "john",
        email: "john@example.com",
        slug: "taken-slug",
        password: "password12",
      })

      expect(response.status).toBe(409)
    })

    test("return 409 when slug matches another account default from name", async () => {
      await accountFactory.makeDrizzleAccount({
        name: "John Doe",
        username: "first",
        email: "first@example.com",
      })

      const response = await api.accounts.post({
        name: "John Doe",
        username: "second",
        email: "second@example.com",
        slug: "john-doe",
        password: "password12",
      })

      expect(response.status).toBe(409)
    })
  })
})
