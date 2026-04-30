import { Elysia, t } from "elysia"
import { jwtPlugin } from "@/infra/cryptography/jwt/jwt.plugin"

export const logoutController = new Elysia().use(jwtPlugin).post(
  "/auth/logout",
  ({ cookie, set }) => {
    cookie.refreshToken.set({
      value: "",
      maxAge: 0,
      path: "/auth/refresh",
    })
    set.status = 204
    return
  },
  {
    cookie: t.Cookie({
      refreshToken: t.Optional(
        t.String({
          description: "A JWT refresh token",
          example:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
        })
      ),
    }),
    response: {
      204: t.Void(),
    },
    detail: {
      tags: ["Authentication"],
      summary: "Sign out",
      description:
        "Clears the HTTP-only refresh token cookie, ending the session. Idempotent — safe to call even when no active session exists.",
      responses: {
        "204": { description: "Session ended; refresh token cookie cleared." },
      },
    },
  }
)
