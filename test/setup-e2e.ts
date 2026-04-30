import { afterAll } from "bun:test"
import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { SQL } from "bun"

const schemaId = `test_${Date.now()}`
const originalUrl = Bun.env.DATABASE_URL ?? ""

const admin = new SQL(originalUrl)
await admin.unsafe(`CREATE SCHEMA IF NOT EXISTS "${schemaId}"`)
await admin.end()

const url = new URL(originalUrl)
url.searchParams.set("options", `-c search_path=${schemaId}`)
Bun.env.DATABASE_URL = url.toString()

const sql = new SQL(Bun.env.DATABASE_URL)
const migrationsPath = join(
  import.meta.dir,
  "../src/infra/database/drizzle/migrations"
)

for (const file of readdirSync(migrationsPath)
  .filter((f) => f.endsWith(".sql"))
  .sort()) {
  const raw = readFileSync(join(migrationsPath, file), "utf-8").replace(
    /"public"\./g,
    `"${schemaId}".`
  )

  for (const stmt of raw.split("--> statement-breakpoint")) {
    const trimmed = stmt.trim()
    if (trimmed) {
      await sql.unsafe(trimmed)
    }
  }
}

await sql.end()

afterAll(async () => {
  const admin = new SQL(originalUrl)
  await admin.unsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`)
  await admin.end()
})
