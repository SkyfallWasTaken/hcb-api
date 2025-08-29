import { type } from "arktype"
import { env } from "./config/env"

export const TokenResponse = type({
  created_at: "number > 0",
  expires_in: "number > 0",
  access_token: "string",
  refresh_token: "string"
}).pipe((data) => ({
  ...data,
  expires_at: data.created_at + data.expires_in,
}))
export type TokenResponse = typeof TokenResponse.infer;

export async function exchangeCodeForTokens(code: string, clientId: string): Promise<TokenResponse> {
  const params = new URLSearchParams();
  params.set("grant_type", "authorization_code")
  params.set("code", code)
  params.set("client_id", clientId)
  params.set("redirect_uri", "hcb://")

  const res = await fetch("https://hcb.hackclub.com/api/v4/oauth/token", {
    method: "POST",
    body: params
  })
  if (!res.ok) throw new Error("Exchange code res not OK")

  const json = await res.json()
  return TokenResponse.assert(json);
}

export async function useRefreshToken(token: string, clientId: string): Promise<TokenResponse> {
  const params = new URLSearchParams();
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", token);
  params.append("client_id", clientId);

  const res = await fetch("https://hcb.hackclub.com/api/v4/oauth/token", {
    method: "POST",
    body: params,
  });
  if (!res.ok) throw new Error("Refresh token usage not OK")

  const json = await res.json();
  return TokenResponse.assert(json);
}

export async function isTokenResponseStillValid(tokenResponse: TokenResponse): Promise<boolean> {
  return (Date.now() / 1000) < tokenResponse.expires_at;
}

export async function getValidTokenResponse(clientId: string) {
  const oldResponse = TokenResponse.assert(await Bun.file(env.TOKEN_FILE_PATH).json());
  if (await isTokenResponseStillValid(oldResponse)) {
    return oldResponse;
  }

  const newResponse = await useRefreshToken(oldResponse.refresh_token, clientId);
  await Bun.file(env.TOKEN_FILE_PATH).write(JSON.stringify(newResponse, null, 2));
  return newResponse;
}