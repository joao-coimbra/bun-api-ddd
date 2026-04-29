import { Elysia, t } from "elysia"
import { databasePlugin } from "@/infra/database/database.plugin"
import { makeExample } from "../factories/make-example.factory"
import { ExamplePresenter } from "../presenters/example.presenter"

const response200Schema = t.Object({
  id: t.String(),
  name: t.String(),
  description: t.String(),
  slug: t.String(),
})

export const exampleController = new Elysia().use(databasePlugin).post(
  "/examples",
  async ({ db, body }) => {
    const { name, description } = body

    const exampleUseCase = makeExample({ db })

    const result = await exampleUseCase.execute({
      name,
      description,
    })

    const { example } = result.getOrThrow()

    return ExamplePresenter.toHTTP(example)
  },
  {
    body: t.Object({
      name: t.String(),
      description: t.String(),
    }),
    response: {
      200: response200Schema,
      409: t.Object({
        error: t.String(),
        code: t.Literal(409),
      }),
      418: t.Object({
        error: t.String(),
        code: t.Literal(418),
      }),
    },
  }
)
