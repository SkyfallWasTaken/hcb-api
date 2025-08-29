import { Context } from "hono"
import { setCookie } from "hono/cookie"
import { env } from "../config/env"
import { masterKeyHash } from "../middleware"
import { LoginPage } from "../components"

export const loginHandler = async (c: Context) => {
  const body = await c.req.parseBody()
  const masterKey = body.masterKey as string

  if (masterKey === env.MASTER_KEY) {
    setCookie(c, 'auth', masterKeyHash, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      httpOnly: true,
      secure: true,
      sameSite: 'Strict'
    })
    return c.redirect('/')
  } else {
    return c.html(LoginPage() as unknown as string)
  }
}

export const logoutHandler = (c: Context) => {
  setCookie(c, 'auth', '', { maxAge: 0 })
  return c.redirect('/')
}
