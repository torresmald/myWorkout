import { Router } from 'express'

import type { UpdateWorkoutSetBody } from '../interfaces/workout-set.interface.js'
import type { AuthenticatedRequest } from '../interfaces/express.interface.js'
import {
  finishWorkoutSession,
  getWorkoutSession,
  startWorkoutSession,
  updateWorkoutSet,
} from '../services/workout-session.service.js'
import { handleServiceError } from '../utils/app-error.util.js'
import { sendSuccess } from '../utils/api-response.util.js'

const router = Router({ mergeParams: true })

router.get('/session', async (req, res) => {
  const { userId } = (req as unknown as AuthenticatedRequest).user
  const { workoutId } = req.params as { workoutId: string }

  try {
    const session = await getWorkoutSession(userId, workoutId)
    sendSuccess(res, session)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

router.post('/start', async (req, res) => {
  const { userId } = (req as unknown as AuthenticatedRequest).user
  const { workoutId } = req.params as { workoutId: string }

  try {
    const session = await startWorkoutSession(userId, workoutId)
    sendSuccess(res, session)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

router.post('/finish', async (req, res) => {
  const { userId } = (req as unknown as AuthenticatedRequest).user
  const { workoutId } = req.params as { workoutId: string }

  try {
    const result = await finishWorkoutSession(userId, workoutId)
    sendSuccess(res, result)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

router.patch('/exercises/:exerciseId/sets/:setNumber', async (req, res) => {
  const { userId } = (req as unknown as AuthenticatedRequest).user
  const { workoutId, exerciseId, setNumber } = req.params as {
    workoutId: string
    exerciseId: string
    setNumber: string
  }

  try {
    const set = await updateWorkoutSet(
      userId,
      workoutId,
      exerciseId,
      setNumber,
      req.body as UpdateWorkoutSetBody,
    )
    sendSuccess(res, set)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

export default router
