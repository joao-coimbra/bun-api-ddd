import { makeSeeder } from "./factories/make-seeder.factory"

const seed = makeSeeder()

await seed.run()
