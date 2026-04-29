import { SQL } from "bun"
import { drizzle } from "drizzle-orm/bun-sql"
import { env } from "@/infra/env"
import { schema } from "./schema"

const client = new SQL(env.DATABASE_URL)

export const db = drizzle({ client, casing: "snake_case", schema })

export type DrizzleClient = typeof db
