import { Context } from "hono"
import { isTokenResponseStillValid, TokenResponse } from "../oauth"
import { Dashboard } from "../components"
import { TokenInfo } from "../types"
import { env } from "../config/env"

export const dashboardHandler = async (c: Context) => {
  let tokenInfo: TokenInfo | null = null
  try {
    const tokenResponse = TokenResponse.assert(await Bun.file(env.TOKEN_FILE_PATH).json())
    const isValid = await isTokenResponseStillValid(tokenResponse)
    tokenInfo = { ...tokenResponse, isValid }
  } catch (error) {
    // Token file doesn't exist or is invalid
  }

  // Check for success/error query parameters
  const success = c.req.query('success')
  const error = c.req.query('error')

  return c.html(Dashboard({ tokenInfo, success, error }) as unknown as string)
}
