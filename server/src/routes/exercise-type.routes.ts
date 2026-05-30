import { Router } from 'express'

import type { CreateExerciseTypeBody, UpdateExerciseTypeBody } from '../interfaces/exercise-type.interface.js'
import type { AuthenticatedRequest } from '../interfaces/express.interface.js'
import { authenticate } from '../middleware/auth.middleware.js'
import {
  createExerciseType,
  deleteExerciseType,
  getExerciseTypesByUser,
  updateExerciseType,
} from '../services/exercise-type.service.js'
import { handleServiceError } from '../utils/app-error.util.js'
import { sendSuccess } from '../utils/api-response.util.js'

const router = Router()

router.use(authenticate)

router.get('/', async (req, res) => {
  const { userId } = (req as AuthenticatedRequest).user

  try {
    const exerciseTypes = await getExerciseTypesByUser(userId)
    sendSuccess(res, exerciseTypes)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

router.post('/', async (req, res) => {
  const { userId } = (req as AuthenticatedRequest).user

  try {
    const exerciseType = await createExerciseType(userId, req.body as CreateExerciseTypeBody)
    sendSuccess(res, exerciseType, 201)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

router.put('/:id', async (req, res) => {
  const { userId } = (req as unknown as AuthenticatedRequest).user
  const { id } = req.params

  try {
    const exerciseType = await updateExerciseType(userId, id, req.body as UpdateExerciseTypeBody)
    sendSuccess(res, exerciseType)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

router.delete('/:id', async (req, res) => {
  const { userId } = (req as unknown as AuthenticatedRequest).user
  const { id } = req.params

  try {
    const exerciseType = await deleteExerciseType(userId, id)
    sendSuccess(res, exerciseType)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

export default router
