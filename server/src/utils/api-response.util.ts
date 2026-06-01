import type { Response } from 'express'

import type { ErrorParams } from '../interfaces/app-error.interface.js'
import type { ApiResponse } from '../interfaces/api-response.interface.js'

export function successResponse<T>(data: T): ApiResponse<T> {
  return {
    status: 'success',
    data,
    error: null,
    errorParams: null,
  }
}

export function errorResponse(error: string, errorParams?: ErrorParams | null): ApiResponse<null> {
  return {
    status: 'error',
    data: null,
    error,
    errorParams: errorParams ?? null,
  }
}

export function sendSuccess<T>(res: Response, data: T, statusCode = 200): void {
  res.status(statusCode).json(successResponse(data))
}

export function sendError(
  res: Response,
  error: string,
  statusCode = 400,
  errorParams?: ErrorParams | null,
): void {
  res.status(statusCode).json(errorResponse(error, errorParams))
}
