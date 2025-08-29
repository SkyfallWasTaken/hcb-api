import { Context } from "hono"
import { getValidTokenResponse } from "../oauth"
import { env } from "../config/env"

export const apiProxyHandler = async (c: Context) => {
  console.log(`Intercepted ${c.req.method} request to ${c.req.url}`)

  const bearer = c.req.header('Authorization')?.replace('Bearer ', '')
  if (!bearer) return c.json({ error: 'Missing Authorization header' }, 401)
  if (bearer !== env.MASTER_KEY) return c.json({ error: 'Invalid Authorization header' }, 401)

  const tokenResponse = await getValidTokenResponse(env.HCB_CLIENT_ID)

  const targetUrl = `https://hcb.hackclub.com/api/v4${c.req.path.replace('/api', '')}`

  const proxyRequest = new Request(targetUrl, {
    method: c.req.method,
    headers: {
      ...Object.fromEntries(Object.entries(c.req.header())),
      'Authorization': `Bearer ${tokenResponse.access_token}`,
    },
    body: c.req.method !== 'GET' && c.req.method !== 'HEAD' ? await c.req.text() : undefined
  })

  try {
    const response = await fetch(proxyRequest)
    const responseBody = await response.text()

    return new Response(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    })
  } catch (error) {
    console.error('Proxy error:', error)
    return c.json({ error: 'Failed to proxy request' }, 500)
  }
}
