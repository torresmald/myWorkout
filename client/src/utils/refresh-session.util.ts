import type { ApiResponse } from '@/interfaces/api-response.interface'
import type { LoginData } from '@/interfaces/auth.interface'
import { getRefreshToken, setTokens } from '@/utils/storage.util'

type SessionRefreshListener = (data: LoginData) => void

let sessionRefreshListener: SessionRefreshListener | null = null
let refreshPromise: Promise<LoginData | null> | null = null

export function onSessionRefreshed(listener: SessionRefreshListener): void {
  sessionRefreshListener = listener
}

export async function refreshAccessToken(): Promise<LoginData | null> {
  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken()
    if (!refreshToken) {
      return null
    }

    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })

    const body = (await response.json()) as ApiResponse<LoginData>
    if (!response.ok || body.status === 'error' || !body.data) {
      return null
    }

    setTokens(body.data.token, body.data.refreshToken)
    sessionRefreshListener?.(body.data)
    return body.data
  })().finally(() => {
    refreshPromise = null
  })

  return refreshPromise
}
