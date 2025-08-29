import { Context } from "hono"
import { proxy } from "hono/proxy"
import { getValidTokenResponse } from "../oauth"
import { env } from "../config/env"

export const apiProxyHandler = async (c: Context) => {
  console.log(`Intercepted ${c.req.method} request to ${c.req.url}`)

  const bearer = c.req.header('Authorization')?.replace('Bearer ', '')
  if (!bearer) return c.json({ error: 'Missing Authorization header' }, 401)
  if (bearer !== env.MASTER_KEY) return c.json({ error: 'Invalid Authorization header' }, 401)

  const tokenResponse = await getValidTokenResponse(env.HCB_CLIENT_ID)

  const targetUrl = `https://hcb.hackclub.com/api/v4${c.req.path.replace('/api', '')}`
  console.log(targetUrl)

  console.log(tokenResponse)
  try {
    const response = await proxy(targetUrl, {
      ...c.req, // Forward the original request
      headers: {
        'Authorization': `Bearer ${tokenResponse.access_token}`,
        // Remove the original Authorization header to prevent conflicts
        ...Object.fromEntries(
          Object.entries(c.req.header()).filter(([key]) =>
            key.toLowerCase() !== 'authorization'
          )
        ),
      },
    })

    return response
  } catch (error) {
    console.error('Proxy error:', error)
    return c.json({ error: 'Failed to proxy request' }, 500)
  }
}
