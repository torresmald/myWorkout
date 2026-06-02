import { Router } from 'express'

import type { AuthenticatedRequest } from '../interfaces/express.interface.js'
import { authenticate } from '../middleware/auth.middleware.js'
import {
  getPersonalRecordByExerciseType,
  getPersonalRecordsByUser,
} from '../services/personal-record.service.js'
import { handleServiceError } from '../utils/app-error.util.js'
import { sendSuccess } from '../utils/api-response.util.js'

const router = Router()

router.use(authenticate)

router.get('/', async (req, res) => {
  const { userId } = (req as AuthenticatedRequest).user

  try {
    const records = await getPersonalRecordsByUser(userId)
    sendSuccess(res, records)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

router.get('/exercise-types/:exerciseTypeId', async (req, res) => {
  const { userId } = (req as unknown as AuthenticatedRequest).user
  const { exerciseTypeId } = req.params

  try {
    const record = await getPersonalRecordByExerciseType(userId, exerciseTypeId)
    sendSuccess(res, record)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

export default router
