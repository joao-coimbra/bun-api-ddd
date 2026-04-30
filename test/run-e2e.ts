import { Glob } from "bun"

const files = [...new Glob("src/**/*.e2e-spec.ts").scanSync(".")].map(
  (f) => `./${f}`
)

if (files.length === 0) {
  console.log("No E2E test files found.")
  process.exit(0)
}

Bun.spawnSync(["bun", "test", "--preload", "./test/setup-e2e.ts", ...files], {
  stdio: ["inherit", "inherit", "inherit"],
})
