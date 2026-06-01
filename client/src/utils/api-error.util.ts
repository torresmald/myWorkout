import type { ApiResponse } from '@/interfaces/api-response.interface'

export class ApiError extends Error {
  readonly code: string
  readonly params?: Record<string, string | number>

  constructor(code: string, params?: Record<string, string | number>) {
    super(code)
    this.name = 'ApiError'
    this.code = code
    this.params = params
  }
}

export function throwIfApiError(body: ApiResponse<unknown>, status: number): void {
  if (status < 400 && body.status !== 'error') {
    return
  }

  throw new ApiError(body.error ?? 'UNKNOWN_ERROR', body.errorParams ?? undefined)
}
