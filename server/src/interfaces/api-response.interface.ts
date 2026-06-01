import type { ErrorParams } from './app-error.interface.js'

export type ApiStatus = 'success' | 'error'

export interface ApiResponse<T = unknown> {
  status: ApiStatus
  data: T | null
  error: string | null
  errorParams?: ErrorParams | null
}
