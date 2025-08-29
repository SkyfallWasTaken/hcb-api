import { Context } from "hono"
import { LoginPage } from "../components"

export const loginPageHandler = (c: Context) => {
  return c.html(LoginPage() as unknown as string)
}
