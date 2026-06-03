import type { ApiResponse } from '@/interfaces/api-response.interface'

export function createApiSuccess<T>(data: T): ApiResponse<T> {
  return {
    status: 'success',
    data,
    error: null,
  }
}

export function createApiError(
  error: string,
  errorParams?: Record<string, string | number>,
): ApiResponse<null> {
  return {
    status: 'error',
    data: null,
    error,
    errorParams: errorParams ?? null,
  }
}
