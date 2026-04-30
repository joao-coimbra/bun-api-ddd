import { Elysia, t } from "elysia"
import { databasePlugin } from "@/infra/database/database.plugin"
import { makeRegisterAccount } from "../factories/make-register-account.factory"
import { AccountPresenter } from "../presenters/account.presenter"

const bodySchema = t.Object({
  name: t.String(),
  username: t.String(),
  email: t.String(),
  slug: t.String().optional(),
  password: t.String(),
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

    const registerAccountUseCase = makeRegisterAccount({ db })

    const result = await registerAccountUseCase.execute({
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
