import cors from "@elysiajs/cors"
import { openapi } from "@elysiajs/openapi"
import { Elysia } from "elysia"
import { httpModule } from "./http/http.module"

export const app = new Elysia()
  .use(
    cors({
      origin: "*",
    })
  )
  .use(
    openapi({
      path: "/docs",
      documentation: {
        info: {
          title: "Bun DDD API Template API",
          version: "1.0.0",
          description: "API for the Bun DDD API Template platform",
        },
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
            },
          },
        },
      },
      exclude: {
        paths: ["/health"],
      },
    })
  )
  .head("/health", "OK")
  .use(httpModule)

export type App = typeof app
