import { Elysia } from "elysia"
import { exampleController } from "./controllers/example.controller"
import { registerAccountController } from "./controllers/register-account.controller"

export const httpModule = new Elysia()
  .use(exampleController)
  .use(registerAccountController)
