import { defineConfig } from "drizzle-kit"
import { env } from "./src/infra/env"

export default defineConfig({
  schema: "./src/infra/database/drizzle/schema/*.ts",
  out: "./src/infra/database/drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  casing: "snake_case",
})
