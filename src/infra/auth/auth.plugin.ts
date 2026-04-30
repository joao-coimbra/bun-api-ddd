import { bearer } from "@elysiajs/bearer"
import { Elysia } from "elysia"
import { UnauthorizedError } from "@/core/errors/unauthorized.error"
import { jwtPlugin } from "../cryptography/jwt/jwt.plugin"
import { databasePlugin } from "../database/database.plugin"

export const authPlugin = new Elysia({ name: "Auth.Plugin" })
  .use(bearer())
  .use(jwtPlugin)
  .use(databasePlugin)
  .macro("auth", {
    async resolve({ jwt: { accessToken }, bearer, db: { drizzle } }) {
      const payload = await accessToken.verify(bearer)

      if (!payload) {
        throw new UnauthorizedError()
      }

      return {
        userId: payload.sub,
        async getCurrentUser() {
          const user = await drizzle.query.users.findFirst({
            where: (user, { eq }) => eq(user.id, payload.sub),
          })

          if (!user) {
            throw new UnauthorizedError()
          }

          return user
        },
      }
    },
    detail: {
      security: [{ bearerAuth: [] }],
    },
  })
