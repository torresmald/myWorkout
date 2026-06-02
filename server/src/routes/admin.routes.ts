import { Router } from 'express'

import type { AuthenticatedRequest } from '../interfaces/express.interface.js'
import type { UserRole } from '../interfaces/role.interface.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { requireAdmin } from '../middleware/admin.middleware.js'
import {
  getAdminMetrics,
  listAdminUsers,
  updateUserRole,
} from '../services/admin.service.js'
import {
  createAdminExerciseCatalog,
  deleteAdminExerciseCatalog,
  listAdminExerciseCatalog,
  updateAdminExerciseCatalog,
} from '../services/admin-exercise-catalog.service.js'
import type { UpsertAdminExerciseCatalogBody } from '../interfaces/admin-exercise-catalog.interface.js'
import { ErrorCode } from '../constants/error-codes.constants.js'
import { AppError } from '../interfaces/app-error.interface.js'
import { handleServiceError } from '../utils/app-error.util.js'
import { sendSuccess } from '../utils/api-response.util.js'

const router = Router()

router.use(authenticate, requireAdmin)

router.get('/metrics', async (_req, res) => {
  try {
    const metrics = await getAdminMetrics()
    sendSuccess(res, metrics)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

router.get('/users', async (req, res) => {
  try {
    const page = Number(req.query.page ?? 1)
    const pageSize = Number(req.query.pageSize ?? 20)

    const result = await listAdminUsers(
      Number.isFinite(page) ? page : 1,
      Number.isFinite(pageSize) ? pageSize : 20,
    )
    sendSuccess(res, result)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

router.patch('/users/:id/role', async (req, res) => {
  const { userId } = (req as unknown as AuthenticatedRequest).user

  try {
    const targetUserId = Number(req.params.id)
    const { role } = req.body as { role?: UserRole }

    if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
      throw new AppError(ErrorCode.INVALID_USER_ID, 400)
    }

    if (!role) {
      throw new AppError(ErrorCode.ROLE_REQUIRED, 400)
    }

    const user = await updateUserRole(userId, targetUserId, role)
    sendSuccess(res, user)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

router.get('/exercise-catalog', async (_req, res) => {
  try {
    const catalog = await listAdminExerciseCatalog()
    sendSuccess(res, catalog)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

router.post('/exercise-catalog', async (req, res) => {
  try {
    const entry = await createAdminExerciseCatalog(req.body as UpsertAdminExerciseCatalogBody)
    sendSuccess(res, entry, 201)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

router.put('/exercise-catalog/:id', async (req, res) => {
  try {
    const catalogId = Number(req.params.id)

    if (!Number.isInteger(catalogId) || catalogId <= 0) {
      throw new AppError(ErrorCode.CATALOG_EXERCISE_NOT_FOUND, 404)
    }

    const entry = await updateAdminExerciseCatalog(catalogId, req.body as UpsertAdminExerciseCatalogBody)
    sendSuccess(res, entry)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

router.delete('/exercise-catalog/:id', async (req, res) => {
  try {
    const catalogId = Number(req.params.id)

    if (!Number.isInteger(catalogId) || catalogId <= 0) {
      throw new AppError(ErrorCode.CATALOG_EXERCISE_NOT_FOUND, 404)
    }

    const entry = await deleteAdminExerciseCatalog(catalogId)
    sendSuccess(res, entry)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

export default router
