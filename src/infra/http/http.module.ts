import { Elysia } from "elysia"
import { exampleController } from "./controllers/example.controller"

export const httpModule = new Elysia().use(exampleController)
