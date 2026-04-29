import { pgTable, text, timestamp } from "drizzle-orm/pg-core"

export const example = pgTable("example", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => Bun.randomUUIDv7()),
  name: text("name").notNull(),
  description: text("description").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export type DrizzleExample = typeof example.$inferSelect
export type DrizzleExampleInsert = typeof example.$inferInsert
