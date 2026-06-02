import * as Sentry from '@sentry/vue'

import type { ApiResponse } from '@/interfaces/api-response.interface'
import { isSentryEnabled } from '@/config/sentry'
import { throwIfApiError } from '@/utils/api-error.util'
import { refreshAccessToken } from '@/utils/refresh-session.util'
import { getAccessToken } from '@/utils/storage.util'

const AUTH_PATHS_WITHOUT_REFRESH = [
  '/auth/login',
  '/auth/google',
  '/auth/register',
  '/auth/refresh',
  '/auth/logout',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/auth/resend-verification',
] as const

function reportApiError(error: unknown): void {
  if (isSentryEnabled()) {
    Sentry.captureException(error)
  }
}

function buildHeaders(init?: RequestInit): Headers {
  const headers = new Headers(init?.headers)
  const token = getAccessToken()

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  return headers
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const shouldAttemptRefresh = !AUTH_PATHS_WITHOUT_REFRESH.some((authPath) =>
    path.startsWith(authPath),
  )

  async function doFetch(): Promise<{ response: Response; body: ApiResponse<T> }> {
    const response = await fetch(`/api${path}`, {
      ...init,
      headers: buildHeaders(init),
    })
    const body = (await response.json()) as ApiResponse<T>
    return { response, body }
  }

  let { response, body } = await doFetch()

  if (response.status === 401 && shouldAttemptRefresh) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      ;({ response, body } = await doFetch())
    }
  }

  try {
    throwIfApiError(body, response.status)
  } catch (error) {
    if (response.status >= 500) {
      reportApiError(error)
    }
    throw error
  }

  return body.data as T
}
