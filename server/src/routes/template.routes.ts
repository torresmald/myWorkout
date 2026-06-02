import { Router } from 'express'

import type { CreateTemplateBody, UpdateTemplateBody } from '../interfaces/template.interface.js'
import type { AuthenticatedRequest } from '../interfaces/express.interface.js'
import { authenticate } from '../middleware/auth.middleware.js'
import templateExerciseRoutes from './template-exercise.routes.js'
import {
  createTemplate,
  deleteTemplate,
  getTemplateById,
  getTemplatesByUser,
  updateTemplate,
} from '../services/template.service.js'
import { handleServiceError } from '../utils/app-error.util.js'
import { sendSuccess } from '../utils/api-response.util.js'

const router = Router()

router.use(authenticate)

router.get('/', async (req, res) => {
  const { userId } = (req as AuthenticatedRequest).user

  try {
    const templates = await getTemplatesByUser(userId)
    sendSuccess(res, templates)
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
    const template = await createTemplate(userId, req.body as CreateTemplateBody)
    sendSuccess(res, template, 201)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

router.get('/:id', async (req, res) => {
  const { userId } = (req as unknown as AuthenticatedRequest).user
  const { id } = req.params

  try {
    const template = await getTemplateById(userId, id)
    sendSuccess(res, template)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

router.use('/:templateId/exercises', templateExerciseRoutes)

router.put('/:id', async (req, res) => {
  const { userId } = (req as unknown as AuthenticatedRequest).user
  const { id } = req.params

  try {
    const template = await updateTemplate(userId, id, req.body as UpdateTemplateBody)
    sendSuccess(res, template)
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
    const template = await deleteTemplate(userId, id)
    sendSuccess(res, template)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

export default router
