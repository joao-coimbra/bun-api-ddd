import { Elysia, t } from "elysia"
import { UnauthorizedError } from "@/core/errors/unauthorized.error"
import { jwtPlugin } from "@/infra/cryptography/jwt/jwt.plugin"
import { isProduction } from "@/infra/env"

const refreshResponse = t.Object({
  accessToken: t.String({
    description:
      "Short-lived JWT access token. Include as `Authorization: Bearer <token>` in subsequent requests.",
    example:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
  }),
})

export const refreshTokenController = new Elysia().use(jwtPlugin).patch(
  "/auth/refresh",
  async ({ jwt, cookie }) => {
    const payload = await jwt.refreshToken.verify(cookie.refreshToken.value)

    if (!payload) {
      throw new UnauthorizedError("Unauthorized.")
    }

    const accessToken = await jwt.accessToken.sign({
      sub: payload.sub,
    })
    const newRefreshToken = await jwt.refreshToken.sign({
      sub: payload.sub,
    })

    cookie.refreshToken.set({
      value: newRefreshToken,
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/auth/refresh",
    })

    return { accessToken }
  },
  {
    cookie: t.Cookie({
      refreshToken: t.Optional(t.String()),
    }),
    response: {
      200: refreshResponse,
      401: t.Object({
        error: t.String(),
        code: t.Literal(401),
      }),
    },
    detail: {
      tags: ["Authentication"],
      summary: "Refresh access token",
      description:
        "Exchanges a valid refresh token cookie for a new access token and rotates the refresh cookie.",
      responses: {
        "200": {
          description: "New access token; refresh cookie updated.",
        },
        "401": {
          description: "Missing, invalid, or expired refresh token.",
        },
      },
    },
  }
)
