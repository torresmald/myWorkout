import type { Response } from 'express'

import { AppError } from '../interfaces/app-error.interface.js'
import { sendError } from './api-response.util.js'

export function handleServiceError(error: unknown, res: Response): boolean {
  if (error instanceof AppError) {
    sendError(res, error.code, error.statusCode, error.params)
    return true
  }

  return false
}
