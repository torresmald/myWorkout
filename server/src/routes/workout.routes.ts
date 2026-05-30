import { Router } from 'express'

import type { CreateWorkoutBody, UpdateWorkoutBody } from '../interfaces/workout.interface.js'
import type { AuthenticatedRequest } from '../interfaces/express.interface.js'
import { authenticate } from '../middleware/auth.middleware.js'
import workoutExerciseRoutes from './workout-exercise.routes.js'
import {
  createWorkout,
  deleteWorkout,
  getWorkoutsByUser,
  updateWorkout,
} from '../services/workout.service.js'
import { handleServiceError } from '../utils/app-error.util.js'
import { sendSuccess } from '../utils/api-response.util.js'

const router = Router()

router.use(authenticate)

router.get('/', async (req, res) => {
  const { userId } = (req as AuthenticatedRequest).user

  try {
    const workouts = await getWorkoutsByUser(userId)
    sendSuccess(res, workouts)
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
    const workout = await createWorkout(userId, req.body as CreateWorkoutBody)
    sendSuccess(res, workout, 201)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

router.use('/:workoutId/exercises', workoutExerciseRoutes)

router.put('/:id', async (req, res) => {
  const { userId } = (req as unknown as AuthenticatedRequest).user
  const { id } = req.params

  try {
    const workout = await updateWorkout(userId, id, req.body as UpdateWorkoutBody)
    sendSuccess(res, workout)
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
    const workout = await deleteWorkout(userId, id)
    sendSuccess(res, workout)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

export default router
