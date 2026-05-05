import type { Seeder } from "@/infra/database/seeders/seeder"

export class FakeAccountSeeder implements Seeder {
  seeded = false

  seed(): Promise<void> {
    this.seeded = true
    return Promise.resolve()
  }
}
