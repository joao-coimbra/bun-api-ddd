import { env } from "@/infra/env"
import { app } from "./app"

app.listen({ port: env.PORT, hostname: "0.0.0.0" }, (server) => {
  console.log(`🦊 Running at ${server.url} (${env.NODE_ENV})`)
})
