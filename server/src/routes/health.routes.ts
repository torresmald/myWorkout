import { Router } from 'express'

import { prisma } from '../config/prisma.js'
import { sendError, sendSuccess } from '../utils/api-response.util.js'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`

    sendSuccess(res, {
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
    })
  } catch {
    sendError(res, 'Database unavailable', 503)
  }
})

export default router
