import type { Response } from 'express'

import type { ApiResponse } from '../interfaces/api-response.interface.js'

export function successResponse<T>(data: T): ApiResponse<T> {
  return {
    status: 'success',
    data,
    error: null,
  }
}

export function errorResponse(error: string): ApiResponse<null> {
  return {
    status: 'error',
    data: null,
    error,
  }
}

export function sendSuccess<T>(res: Response, data: T, statusCode = 200): void {
  res.status(statusCode).json(successResponse(data))
}

export function sendError(res: Response, error: string, statusCode = 400): void {
  res.status(statusCode).json(errorResponse(error))
}
