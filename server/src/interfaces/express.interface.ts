import type { Request } from 'express'

import type { TokenPayload } from './jwt.interface.js'

export interface AuthenticatedRequest extends Request {
  user: TokenPayload
}
