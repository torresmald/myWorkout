import { Router } from 'express'

import type {
  CreateTemplateExerciseBody,
  UpdateTemplateExerciseBody,
} from '../interfaces/template.interface.js'
import type { AuthenticatedRequest } from '../interfaces/express.interface.js'
import {
  createTemplateExercise,
  deleteTemplateExercise,
  getTemplateExercises,
  updateTemplateExercise,
} from '../services/template-exercise.service.js'
import { handleServiceError } from '../utils/app-error.util.js'
import { sendSuccess } from '../utils/api-response.util.js'

const router = Router({ mergeParams: true })

router.get('/', async (req, res) => {
  const { userId } = (req as unknown as AuthenticatedRequest).user
  const { templateId } = req.params as { templateId: string }

  try {
    const exercises = await getTemplateExercises(userId, templateId)
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
  const { templateId } = req.params as { templateId: string }

  try {
    const exercise = await createTemplateExercise(
      userId,
      templateId,
      req.body as CreateTemplateExerciseBody,
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
  const { templateId, exerciseId } = req.params as { templateId: string; exerciseId: string }

  try {
    const exercise = await updateTemplateExercise(
      userId,
      templateId,
      exerciseId,
      req.body as UpdateTemplateExerciseBody,
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
  const { templateId, exerciseId } = req.params as { templateId: string; exerciseId: string }

  try {
    const exercise = await deleteTemplateExercise(userId, templateId, exerciseId)
    sendSuccess(res, exercise)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

export default router
