import type { Response } from 'express'

import { AppError } from '../interfaces/app-error.interface.js'
import { sendError } from './api-response.util.js'

export function handleServiceError(error: unknown, res: Response): boolean {
  if (error instanceof AppError) {
    sendError(res, error.message, error.statusCode)
    return true
  }

  return false
}
