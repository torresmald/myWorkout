import type { NextFunction, Request, Response } from 'express'

import type { AuthenticatedRequest } from '../interfaces/express.interface.js'
import { sendError } from '../utils/api-response.util.js'
import { verifyAccessToken } from '../utils/jwt.util.js'

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    sendError(res, 'Token no proporcionado', 401)
    return
  }

  const token = authHeader.slice('Bearer '.length)

  try {
    const payload = verifyAccessToken(token)
    ;(req as AuthenticatedRequest).user = payload
    next()
  } catch {
    sendError(res, 'Token inválido o expirado', 401)
  }
}
