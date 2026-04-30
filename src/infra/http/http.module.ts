import { Elysia } from "elysia"
import { authenticateAccountController } from "./controllers/authenticate-account.controller"
import { registerAccountController } from "./controllers/register-account.controller"

export const httpModule = new Elysia()
  .use(registerAccountController)
  .use(authenticateAccountController)
