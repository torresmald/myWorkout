import { vi } from 'vitest'

import { createApiSuccess } from '@/__tests__/helpers/api-response.fixture'
import type { ApiResponse } from '@/interfaces/api-response.interface'

interface MockFetchOptions {
  status?: number
  body: ApiResponse<unknown>
}

export function createFetchResponse({ status = 200, body }: MockFetchOptions) {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: async () => body,
  }
}

export function stubFetchWithResponses(...responses: MockFetchOptions[]) {
  const fetchMock = vi.fn()

  for (const response of responses) {
    fetchMock.mockResolvedValueOnce(createFetchResponse(response))
  }

  vi.stubGlobal('fetch', fetchMock)

  return fetchMock
}

export function stubFetchSuccess<T>(data: T, status = 200) {
  return stubFetchWithResponses({
    status,
    body: createApiSuccess(data),
  })
}

export { createApiError, createApiSuccess } from '@/__tests__/helpers/api-response.fixture'
