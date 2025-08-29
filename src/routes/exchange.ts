import { Context } from "hono"
import { exchangeCodeForTokens } from "../oauth"
import { env } from "../config/env"

export const exchangeHandler = async (c: Context) => {
  try {
    const body = await c.req.parseBody()
    const code = body.code as string

    const tokenResponse = await exchangeCodeForTokens(code, env.HCB_CLIENT_ID)
    await Bun.file("token.json").write(JSON.stringify(tokenResponse, null, 2))

    return c.redirect('/')
  } catch (error) {
    console.error('Exchange error:', error)
    return c.redirect('/?error=exchange_failed')
  }
}
