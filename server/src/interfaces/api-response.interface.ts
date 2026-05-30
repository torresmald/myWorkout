export type ApiStatus = 'success' | 'error'

export interface ApiResponse<T = unknown> {
  status: ApiStatus
  data: T | null
  error: string | null
}
