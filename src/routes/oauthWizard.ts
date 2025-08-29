import { Context } from "hono"
import { OAuthWizard } from "../components"

export const oauthWizardHandler = async (c: Context) => {
  return c.html(OAuthWizard() as unknown as string)
}
