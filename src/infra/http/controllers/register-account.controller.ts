import { Elysia, t } from "elysia"
import { databasePlugin } from "@/infra/database/database.plugin"
import { makeRegisterAccount } from "../factories/make-register-account.factory"
import { AccountPresenter } from "../presenters/account.presenter"

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

const response201Schema = t.Object({
  id: t.String(),
  name: t.String(),
  username: t.String(),
  email: t.String(),
  slug: t.String(),
  createdAt: t.String(),
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

    const { account } = result.getOrThrow()

    set.status = 201

    return AccountPresenter.toHTTP(account)
  },
  {
    body: bodySchema,
    response: {
      201: response201Schema,
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
