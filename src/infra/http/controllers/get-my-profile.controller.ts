import { Elysia, t } from "elysia"
import { authPlugin } from "@/infra/auth/auth.plugin"
import { databasePlugin } from "@/infra/database/database.plugin"
import { makeGetMyProfile } from "../factories/make-get-my-profile.factory"
import { AccountPresenter } from "../presenters/account.presenter"

const response200Schema = t.Object({
  id: t.String({
    description: "Account ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
  name: t.String({ description: "Account name", example: "John Doe" }),
  username: t.String({ description: "Account username", example: "john.doe" }),
  email: t.String({
    description: "Account email",
    example: "john.doe@example.com",
  }),
  slug: t.String({ description: "Account slug", example: "john-doe" }),
  createdAt: t.String({
    description: "Account creation date",
    example: "2021-01-01T00:00:00.000Z",
  }),
})

export const getMyProfileController = new Elysia()
  .use(authPlugin)
  .use(databasePlugin)
  .get(
    "/me",
    async ({ db, userId }) => {
      const getMyProfile = makeGetMyProfile({ db })

      const result = await getMyProfile.execute({ accountId: userId })

      const { account } = result.getOrThrow()

      return AccountPresenter.toHTTP(account)
    },
    {
      auth: true,
      response: {
        200: response200Schema,
        401: t.Object({
          error: t.String(),
          code: t.Literal(401),
        }),
      },
      detail: {
        tags: ["Accounts"],
        summary: "Get my profile",
        description: "Get the current account's profile",
      },
    }
  )
