import { Context } from "hono"
import { isTokenResponseStillValid, TokenResponse } from "../oauth"
import { Dashboard } from "../components"
import { TokenInfo } from "../types"

export const dashboardHandler = async (c: Context) => {
  let tokenInfo: TokenInfo | null = null
  try {
    const tokenResponse = TokenResponse.assert(await Bun.file("token.json").json())
    const isValid = await isTokenResponseStillValid(tokenResponse)
    tokenInfo = { ...tokenResponse, isValid }
  } catch (error) {
    // Token file doesn't exist or is invalid
  }

  return c.html(Dashboard({ tokenInfo }) as unknown as string)
}
