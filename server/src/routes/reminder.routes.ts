import { Router } from 'express'

import type { AuthenticatedRequest } from '../interfaces/express.interface.js'
import { authenticate } from '../middleware/auth.middleware.js'
import {
  getWorkoutReminderSettings,
  updateWorkoutReminderSettings,
} from '../services/reminder.service.js'
import type { UpdateWorkoutReminderBody } from '../interfaces/reminder.interface.js'
import { handleServiceError } from '../utils/app-error.util.js'
import { sendSuccess } from '../utils/api-response.util.js'

const router = Router()

router.use(authenticate)

router.get('/', async (req, res) => {
  const { userId } = (req as AuthenticatedRequest).user

  try {
    const settings = await getWorkoutReminderSettings(userId)
    sendSuccess(res, settings)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

router.put('/', async (req, res) => {
  const { userId } = (req as AuthenticatedRequest).user

  try {
    const settings = await updateWorkoutReminderSettings(
      userId,
      req.body as UpdateWorkoutReminderBody,
    )
    sendSuccess(res, settings)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

export default router
