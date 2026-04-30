import { Elysia, t } from "elysia"
import { authPlugin } from "@/infra/auth/auth.plugin"
import { databasePlugin } from "@/infra/database/database.plugin"
import { makeGetMyProfile } from "../factories/make-get-my-profile.factory"
import { AccountPresenter } from "../presenters/account.presenter"

const response200Schema = t.Object({
  id: t.String({ description: "Account ID" }),
  name: t.String({ description: "Account name" }),
  username: t.String({ description: "Account username" }),
  email: t.String({ description: "Account email" }),
  slug: t.String({ description: "Account slug" }),
  createdAt: t.String({ description: "Account creation date" }),
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
      },
      detail: {
        tags: ["Accounts"],
        summary: "Get my profile",
        description: "Get the current account's profile",
      },
    }
  )
