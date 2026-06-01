export type ErrorParams = Record<string, string | number>

export class AppError extends Error {
  readonly statusCode: number
  readonly code: string
  readonly params?: ErrorParams

  constructor(code: string, statusCode: number, params?: ErrorParams) {
    super(code)
    this.name = 'AppError'
    this.code = code
    this.statusCode = statusCode
    this.params = params
  }
}
