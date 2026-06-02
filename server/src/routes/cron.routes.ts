import { Router } from 'express'

import { ErrorCode } from '../constants/error-codes.constants.js'
import { AppError } from '../interfaces/app-error.interface.js'
import { processEmailWorkoutReminders } from '../services/reminder.service.js'
import { handleServiceError } from '../utils/app-error.util.js'
import { sendSuccess } from '../utils/api-response.util.js'

const router = Router()

router.post('/workout-reminders', async (req, res) => {
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    throw new AppError(ErrorCode.CRON_UNAUTHORIZED, 503)
  }

  const providedSecret = req.get('x-cron-secret')

  if (providedSecret !== cronSecret) {
    throw new AppError(ErrorCode.CRON_UNAUTHORIZED, 401)
  }

  try {
    const result = await processEmailWorkoutReminders()
    sendSuccess(res, result)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

export default router
