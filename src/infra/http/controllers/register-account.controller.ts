import { Elysia, t } from "elysia"
import { databasePlugin } from "@/infra/database/database.plugin"
import { makeRegisterAccount } from "../factories/make-register-account.factory"

const bodySchema = t.Object({
  name: t.String({
    minLength: 3,
    description: "Account name (minimum 3 characters)",
    example: "John Doe",
  }),
  username: t.String({
    minLength: 3,
    description: "Account username (minimum 3 characters)",
    example: "john.doe",
  }),
  email: t.String({
    format: "email",
    description: "Account email",
    example: "john.doe@example.com",
  }),
  slug: t.Optional(
    t.String({
      description: "Account slug",
      example: "john-doe-slug",
    })
  ),
  password: t.String({
    minLength: 8,
    description: "Account password (minimum 8 characters)",
    example: "s3cr3t-p4ssw0rd",
  }),
})

export const registerAccountController = new Elysia().use(databasePlugin).post(
  "/accounts",
  async ({ db, body, set }) => {
    const { name, username, email, slug, password } = body

    const registerAccount = makeRegisterAccount({ db })

    const result = await registerAccount.execute({
      name,
      username,
      email,
      slug,
      password,
    })

    result.getOrThrow()

    set.status = 204
  },
  {
    body: bodySchema,
    response: {
      204: t.Void(),
      409: t.Object({
        error: t.String(),
        code: t.Literal(409),
      }),
    },
    detail: {
      tags: ["Accounts"],
      summary: "Register a new account",
      description: "Creates a new account with the provided information.",
    },
  }
)
