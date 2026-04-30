import { Elysia, t } from "elysia"
import { jwtPlugin } from "@/infra/cryptography/jwt/jwt.plugin"
import { databasePlugin } from "@/infra/database/database.plugin"
import { isProduction } from "@/infra/env"
import { makeAuthenticateAccount } from "../factories/make-authenticate-account.factory"

const bodySchema = t.Object({
  email: t.String({
    format: "email",
    description: "Registered account email",
    example: "john.doe@hospital.com",
  }),
  password: t.String({
    minLength: 8,
    description: "Account password (minimum 8 characters)",
    example: "s3cr3t-p4ssw0rd",
  }),
})

const response200Schema = t.Object({
  accessToken: t.String(),
})

export const authenticateAccountController = new Elysia({
  name: "AuthenticateAccount",
})
  .use(databasePlugin)
  .use(jwtPlugin)
  .post(
    "/sessions",
    async ({ db, jwt, body, cookie }) => {
      const { email, password } = body

      const authenticateAccount = makeAuthenticateAccount({ db, jwt })

      const result = await authenticateAccount.execute({
        email,
        password,
      })

      const { accessToken, refreshToken } = result.getOrThrow()

      cookie.refreshToken.set({
        value: refreshToken,
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "strict" : "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/auth/refresh",
      })

      return {
        accessToken,
      }
    },
    {
      body: bodySchema,
      cookie: t.Cookie({
        refreshToken: t.Optional(t.String()),
      }),
      response: {
        200: response200Schema,
        401: t.Object({
          error: t.String(),
          code: t.Literal(401),
        }),
      },
      detail: {
        tags: ["Auth"],
        summary: "Authenticate",
        description:
          "Exchange email and password for access and refresh tokens.",
      },
    }
  )
