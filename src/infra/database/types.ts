import type { DrizzleClient } from "./drizzle/client"

export interface DatabaseClient {
  drizzle: DrizzleClient
}
