import { Elysia } from "elysia"
import { db as drizzle } from "./drizzle/client"

export const databasePlugin = new Elysia({ name: "Database.Plugin" }).decorate(
  "db",
  {
    drizzle,
  }
)
