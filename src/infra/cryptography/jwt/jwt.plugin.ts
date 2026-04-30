import { jwt } from "@elysiajs/jwt"
import { Elysia } from "elysia"
import { z } from "zod"
import { env } from "../../env"

export const jwtPlugin = new Elysia({ name: "Jwt.Plugin" })
  .use(
    jwt({
      name: "jwtAccessToken",
      secret: env.JWT_ACCESS_SECRET,
      exp: "15min",
      schema: z.object({
        sub: z.uuid(),
      }),
    })
  )
  .use(
    jwt({
      name: "jwtRefreshToken",
      secret: env.JWT_REFRESH_SECRET,
      exp: "7d",
      schema: z.object({
        sub: z.uuid(),
      }),
    })
  )
  .derive({ as: "global" }, ({ jwtAccessToken, jwtRefreshToken }) => ({
    jwt: {
      accessToken: jwtAccessToken,
      refreshToken: jwtRefreshToken,
    },
  }))
