import { type } from "arktype"
import { getValidTokenResponse, exchangeCodeForTokens, isTokenResponseStillValid, TokenResponse } from "./oauth"
import { Hono } from "hono"
import { getCookie, setCookie } from "hono/cookie"
import { createHash } from "crypto"

const env = type({
  HCB_CLIENT_ID: "string",
  MASTER_KEY: "string"
}).assert(process.env)

const app = new Hono()

// Hash the master key for cookie storage
const masterKeyHash = createHash('sha256').update(env.MASTER_KEY).digest('hex')

// Auth middleware
const requireAuth = async (c: any, next: any) => {
  const authHash = getCookie(c, 'auth')
  if (authHash !== masterKeyHash) {
    return c.html(LoginPage())
  }
  await next()
}

// Components
const Layout = ({ children, title = "HCB API Manager" }: { children: any, title?: string }) => (
  <html>
    <head>
      <title>{title}</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body class="bg-[#16161f] min-h-screen">
      {children}
    </body>
  </html>
)

const LoginPage = () => (
  <Layout title="Login - HCB API Manager">
    <div class="min-h-screen flex items-center justify-center">
      <div class="bg-[#1a1b27] p-8 w-full max-w-md">
        <h1 class="text-2xl font-bold mb-6 text-center text-[#a9b1d6]">HCB API Manager</h1>
        <form action="/login" method="POST" class="space-y-4">
          <div>
            <label for="masterKey" class="block text-sm font-medium text-[#565f89] mb-2">
              Master Key
            </label>
            <input
              type="password"
              id="masterKey"
              name="masterKey"
              required
              class="w-full px-3 py-2 text-[#a9b1d6] text-lg bg-[#1e202e] border border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter master key"
            />
          </div>
          <button
            type="submit"
            class="w-full bg-blue-600 text-white py-2 px-4 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  </Layout>
)

const Dashboard = ({ tokenInfo }: { tokenInfo: any }) => (
  <Layout>
    <div class="max-w-4xl mx-auto p-6">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-[#a9b1d6]">HCB API Manager</h1>
        <form action="/logout" method="POST">
          <button class="bg-red-600 text-white px-4 py-2 hover:bg-red-700">
            Logout
          </button>
        </form>
      </div>

      {/* Token Status */}
      <div class="bg-[#1a1b27] border border-gray-800 p-6 mb-6">
        <h2 class="text-2xl font-semibold mb-4 text-[#a9b1d6]">Current Token Status</h2>
        {tokenInfo ? (
          <div class="space-y-2">
            <p class="text-sm text-gray-600">
              <span class="font-medium">Expires:</span> {new Date(tokenInfo.expires_at * 1000).toLocaleString()}
            </p>
            <p class="text-sm text-gray-600">
              <span class="font-medium">Valid for:</span> {Math.round((tokenInfo.expires_at - Date.now() / 1000) / 3600)} hours
            </p>
            <div class={`inline-block px-2 py-1 rounded text-xs ${tokenInfo.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {tokenInfo.isValid ? 'Valid' : 'Expired'}
            </div>
          </div>
        ) : (
          <p class="text-gray-500">No token found</p>
        )}
      </div>

      {/* Exchange Code Form */}
      <div class="bg-[#1a1b27] border border-gray-800 p-6">
        <h2 class="text-2xl font-semibold mb-4 text-[#a9b1d6]">Exchange Authorization Code</h2>
        <form action="/exchange" method="POST" class="space-y-4">
          <div>
            <label for="code" class="block text-sm font-medium text-[#565f89] mb-2">
              Authorization Code
            </label>
            <textarea
              id="code"
              name="code"
              required
              rows={3}
              class="w-full px-3 py-2 text-[#a9b1d6] text-lg bg-[#1e202e] border border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Paste your authorization code here..."
            ></textarea>
          </div>
          <button
            type="submit"
            class="bg-[#385090] text-white py-2 px-4 focus:outline-none"
          >
            Exchange Code
          </button>
        </form>
      </div>
    </div>
  </Layout>
)

app.get('/', requireAuth, async (c) => {
  let tokenInfo = null
  try {
    const tokenResponse = TokenResponse.assert(await Bun.file("token.json").json())
    const isValid = await isTokenResponseStillValid(tokenResponse)
    tokenInfo = { ...tokenResponse, isValid }
  } catch (error) {
    // Token file doesn't exist or is invalid
  }

  return c.html(Dashboard({ tokenInfo }))
})

app.post('/login', async (c) => {
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
    return c.html(LoginPage())
  }
})

app.post('/logout', (c) => {
  setCookie(c, 'auth', '', { maxAge: 0 })
  return c.redirect('/')
})

app.post('/exchange', requireAuth, async (c) => {
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
})

app.all('/api/*', async (c) => {
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
})

export default app
