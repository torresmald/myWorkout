import { AUTH_REFRESH_TOKEN_KEY, AUTH_TOKEN_KEY } from '@/constants/auth.constants'

export function getAccessToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(AUTH_REFRESH_TOKEN_KEY)
}

export function setTokens(token: string, refreshToken: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
  localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, refreshToken)
}

export function clearTokens(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY)
}
