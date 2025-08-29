export interface TokenInfo {
  expires_at: number
  isValid: boolean
  created_at: number
  expires_in: number
  access_token: string
  refresh_token: string
}
