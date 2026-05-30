import { Router } from 'express'

import type {
  CreateWorkoutExerciseBody,
  UpdateWorkoutExerciseBody,
} from '../interfaces/workout.interface.js'
import type { AuthenticatedRequest } from '../interfaces/express.interface.js'
import {
  createWorkoutExercise,
  deleteWorkoutExercise,
  getWorkoutExercises,
  updateWorkoutExercise,
} from '../services/workout-exercise.service.js'
import { handleServiceError } from '../utils/app-error.util.js'
import { sendSuccess } from '../utils/api-response.util.js'

const router = Router({ mergeParams: true })

router.get('/', async (req, res) => {
  const { userId } = (req as unknown as AuthenticatedRequest).user
  const { workoutId } = req.params as { workoutId: string }

  try {
    const exercises = await getWorkoutExercises(userId, workoutId)
    sendSuccess(res, exercises)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

router.post('/', async (req, res) => {
  const { userId } = (req as unknown as AuthenticatedRequest).user
  const { workoutId } = req.params as { workoutId: string }

  try {
    const exercise = await createWorkoutExercise(
      userId,
      workoutId,
      req.body as CreateWorkoutExerciseBody,
    )
    sendSuccess(res, exercise, 201)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

router.put('/:exerciseId', async (req, res) => {
  const { userId } = (req as unknown as AuthenticatedRequest).user
  const { workoutId, exerciseId } = req.params as { workoutId: string; exerciseId: string }

  try {
    const exercise = await updateWorkoutExercise(
      userId,
      workoutId,
      exerciseId,
      req.body as UpdateWorkoutExerciseBody,
    )
    sendSuccess(res, exercise)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

router.delete('/:exerciseId', async (req, res) => {
  const { userId } = (req as unknown as AuthenticatedRequest).user
  const { workoutId, exerciseId } = req.params as { workoutId: string; exerciseId: string }

  try {
    const exercise = await deleteWorkoutExercise(userId, workoutId, exerciseId)
    sendSuccess(res, exercise)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

export default router
