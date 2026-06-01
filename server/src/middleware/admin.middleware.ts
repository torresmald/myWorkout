import type { NextFunction, Request, Response } from 'express'

import type { AuthenticatedRequest } from '../interfaces/express.interface.js'
import { sendError } from '../utils/api-response.util.js'

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const { user } = req as AuthenticatedRequest

  if (user.role !== 'ADMIN') {
    sendError(res, 'Acceso denegado', 403)
    return
  }

  next()
}
