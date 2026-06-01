import rateLimit from 'express-rate-limit'

import { sendError } from '../utils/api-response.util.js'

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

/** Login, registro y Google OAuth */
export const authActionLimiter = createLimiter(15 * 60 * 1000, 10)

/** Forgot password y reenvío de verificación (protege SMTP) */
export const authEmailLimiter = createLimiter(60 * 60 * 1000, 5)
