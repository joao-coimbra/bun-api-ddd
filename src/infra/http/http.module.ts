import { Elysia } from "elysia"
import { authenticateAccountController } from "./controllers/authenticate-account.controller"
import { getMyProfileController } from "./controllers/get-my-profile.controller"
import { logoutController } from "./controllers/logout.controller"
import { refreshTokenController } from "./controllers/refresh-token.controller"
import { registerAccountController } from "./controllers/register-account.controller"

export const httpModule = new Elysia()
  .use(registerAccountController)
  .use(authenticateAccountController)
  .use(getMyProfileController)
  .use(logoutController)
  .use(refreshTokenController)
