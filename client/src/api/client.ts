import * as Sentry from '@sentry/vue'

import type { ApiResponse } from '@/interfaces/api-response.interface'
import { isSentryEnabled } from '@/config/sentry'
import { getAccessToken } from '@/utils/storage.util'

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
  const response = await fetch(`/api${path}`, {
    ...init,
    headers: buildHeaders(init),
  })
  const body = (await response.json()) as ApiResponse<T>

  if (!response.ok || body.status === 'error') {
    const error = new Error(body.error ?? `API error: ${response.status}`)
    if (response.status >= 500) {
      reportApiError(error)
    }
    throw error
  }

  return body.data as T
}
