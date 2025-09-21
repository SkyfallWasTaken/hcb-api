import { type } from "arktype"
import { db } from "./db"
import { oauthToken } from "./db/schema"
import { eq } from "drizzle-orm"

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

export async function storeTokenResponse(tokenResponse: TokenResponse, clientId: string): Promise<void> {
  const existingToken = await db
    .select()
    .from(oauthToken)
    .where(eq(oauthToken.oauthClientId, clientId))
    .limit(1);

  if (existingToken.length > 0) {
    // Update existing token
    await db
      .update(oauthToken)
      .set({
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        createdAt: tokenResponse.created_at,
        expiresIn: tokenResponse.expires_in,
        expiresAt: tokenResponse.expires_at,
        updatedAt: new Date(),
      })
      .where(eq(oauthToken.oauthClientId, clientId));
  } else {
    // Insert new token
    await db.insert(oauthToken).values({
      oauthClientId: clientId,
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      createdAt: tokenResponse.created_at,
      expiresIn: tokenResponse.expires_in,
      expiresAt: tokenResponse.expires_at,
    });
  }
}

export async function getStoredTokenResponse(clientId: string): Promise<TokenResponse | null> {
  const result = await db
    .select()
    .from(oauthToken)
    .where(eq(oauthToken.oauthClientId, clientId))
    .limit(1);

  if (result.length === 0) return null;

  const stored = result[0];
  return {
    access_token: stored.accessToken,
    refresh_token: stored.refreshToken,
    created_at: stored.createdAt,
    expires_in: stored.expiresIn,
    expires_at: stored.expiresAt,
  };
}

export async function getValidTokenResponse(clientId: string): Promise<TokenResponse> {
  const oldResponse = await getStoredTokenResponse(clientId);
  if (!oldResponse) {
    throw new Error("No stored token found for client ID. Please set up OAuth tokens first.");
  }

  if (await isTokenResponseStillValid(oldResponse)) {
    return oldResponse;
  }

  const newResponse = await useRefreshToken(oldResponse.refresh_token, clientId);
  await storeTokenResponse(newResponse, clientId);
  return newResponse;
}