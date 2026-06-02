import type { MuscleGroup } from '@prisma/client'
import { Router } from 'express'

import type { AuthenticatedRequest } from '../interfaces/express.interface.js'
import type { ExerciseCatalogQuery } from '../interfaces/exercise-catalog.interface.js'
import { authenticate } from '../middleware/auth.middleware.js'
import {
  getExerciseCatalog,
  getExerciseCatalogById,
} from '../services/exercise-catalog.service.js'
import { importExerciseTypeFromCatalog } from '../services/exercise-type.service.js'
import { handleServiceError } from '../utils/app-error.util.js'
import { sendSuccess } from '../utils/api-response.util.js'

const router = Router()

router.use(authenticate)

router.get('/', async (req, res) => {
  const { userId } = (req as AuthenticatedRequest).user
  const muscleGroup =
    typeof req.query.muscleGroup === 'string' ? (req.query.muscleGroup as MuscleGroup) : undefined

  try {
    const catalog = await getExerciseCatalog(userId, { muscleGroup } satisfies ExerciseCatalogQuery)
    sendSuccess(res, catalog)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

router.get('/:id', async (req, res) => {
  const { userId } = (req as unknown as AuthenticatedRequest).user
  const catalogId = Number(req.params.id)

  try {
    const exercise = await getExerciseCatalogById(userId, catalogId)
    sendSuccess(res, exercise)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

router.post('/:id/import', async (req, res) => {
  const { userId } = (req as unknown as AuthenticatedRequest).user
  const catalogId = Number(req.params.id)

  try {
    const exerciseType = await importExerciseTypeFromCatalog(userId, catalogId)
    sendSuccess(res, exerciseType, 201)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

export default router
