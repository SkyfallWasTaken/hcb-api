import { Hono } from "hono"
import { requireAuth } from "./middleware"
import {
  dashboardHandler,
  loginHandler,
  logoutHandler,
  exchangeHandler,
  apiProxyHandler,
  loginPageHandler,
  oauthWizardHandler
} from "./routes"

const app = new Hono()

// Routes
app.get('/', requireAuth, dashboardHandler)
app.get('/dashboard', requireAuth, dashboardHandler)
app.get('/oauth-wizard', requireAuth, oauthWizardHandler)
app.get('/login-page', loginPageHandler)
app.post('/login', loginHandler)
app.post('/logout', logoutHandler)
app.post('/exchange', requireAuth, exchangeHandler)
app.all('/api/v4/*', apiProxyHandler)

export default app
