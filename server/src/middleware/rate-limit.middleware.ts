import type { RequestHandler } from 'express'
import rateLimit from 'express-rate-limit'

import { sendError } from '../utils/api-response.util.js'

const noOpLimiter: RequestHandler = (_req, _res, next) => {
  next()
}

function createLimiter(windowMs: number, max: number) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
      sendError(res, 'Demasiados intentos. Inténtalo de nuevo más tarde.', 429)
    },
  })
}

function limiterOrBypass(windowMs: number, max: number): RequestHandler {
  return process.env.NODE_ENV === 'test' ? noOpLimiter : createLimiter(windowMs, max)
}

/** Login, registro y Google OAuth */
export const authActionLimiter = limiterOrBypass(15 * 60 * 1000, 10)

/** Forgot password y reenvío de verificación (protege SMTP) */
export const authEmailLimiter = limiterOrBypass(60 * 60 * 1000, 5)
