import { getCookie } from "hono/cookie"
import { createHash } from "crypto"
import { env } from "../config/env"

const masterKeyHash = createHash('sha256').update(env.MASTER_KEY).digest('hex')

export const requireAuth = async (c: any, next: any) => {
  const authHash = getCookie(c, '_hcbapi_auth')
  if (authHash !== masterKeyHash) {
    return c.redirect('/login-page')
  }
  await next()
}

export { masterKeyHash }
