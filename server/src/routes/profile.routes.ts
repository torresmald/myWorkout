import { Router } from 'express'

import type { AuthenticatedRequest } from '../interfaces/express.interface.js'
import type { AddWeightBody, ChangePasswordBody, DeleteAccountBody, UpdateProfileBody, UpdateWeightBody } from '../interfaces/profile.interface.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { handleAvatarUpload } from '../middleware/upload.middleware.js'
import {
  addWeightEntry,
  deleteWeightEntry,
  getUserProfile,
  updateUserProfile,
  updateWeightEntry,
} from '../services/profile.service.js'
import { exportUserData } from '../services/profile-export.service.js'
import { deleteUserAccount } from '../services/profile-delete.service.js'
import { changeUserPassword } from '../services/profile-password.service.js'
import { updateUserPreferences } from '../services/user-preferences.service.js'
import type { UpdateUserPreferencesBody } from '../interfaces/user-preferences.interface.js'
import {
  deleteProfileAvatar,
  uploadProfileAvatar,
} from '../services/profile-avatar.service.js'
import { ErrorCode } from '../constants/error-codes.constants.js'
import { AppError } from '../interfaces/app-error.interface.js'
import { handleServiceError } from '../utils/app-error.util.js'
import { sendSuccess } from '../utils/api-response.util.js'

const router = Router()

router.use(authenticate)

router.get('/', async (req, res) => {
  const { userId } = (req as AuthenticatedRequest).user

  try {
    const profile = await getUserProfile(userId)
    sendSuccess(res, profile)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

router.patch('/', async (req, res) => {
  const { userId } = (req as AuthenticatedRequest).user

  try {
    const profile = await updateUserProfile(userId, req.body as UpdateProfileBody)
    sendSuccess(res, profile)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

router.patch('/preferences', async (req, res) => {
  const { userId } = (req as AuthenticatedRequest).user

  try {
    const preferences = await updateUserPreferences(userId, req.body as UpdateUserPreferencesBody)
    sendSuccess(res, preferences)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

router.get('/export', async (req, res) => {
  const { userId } = (req as AuthenticatedRequest).user

  try {
    const data = await exportUserData(userId)
    sendSuccess(res, data)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

router.delete('/', async (req, res) => {
  const { userId } = (req as AuthenticatedRequest).user

  try {
    const { password } = req.body as DeleteAccountBody
    await deleteUserAccount(userId, password)
    sendSuccess(res, { messageCode: 'ACCOUNT_DELETED' })
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

router.patch('/password', async (req, res) => {
  const { userId } = (req as AuthenticatedRequest).user

  try {
    const result = await changeUserPassword(userId, req.body as ChangePasswordBody)
    sendSuccess(res, result)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

router.post('/weight', async (req, res) => {
  const { userId } = (req as AuthenticatedRequest).user

  try {
    const result = await addWeightEntry(userId, req.body as AddWeightBody)
    sendSuccess(res, result, 201)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

router.put('/weight/:id', async (req, res) => {
  const { userId } = (req as unknown as AuthenticatedRequest).user

  try {
    const entryId = Number(req.params.id)

    if (!Number.isInteger(entryId) || entryId <= 0) {
      throw new AppError(ErrorCode.INVALID_WEIGHT_ENTRY_ID, 400)
    }

    const result = await updateWeightEntry(userId, entryId, req.body as UpdateWeightBody)
    sendSuccess(res, result)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

router.delete('/weight/:id', async (req, res) => {
  const { userId } = (req as unknown as AuthenticatedRequest).user

  try {
    const entryId = Number(req.params.id)

    if (!Number.isInteger(entryId) || entryId <= 0) {
      throw new AppError(ErrorCode.INVALID_WEIGHT_ENTRY_ID, 400)
    }

    const result = await deleteWeightEntry(userId, entryId)
    sendSuccess(res, result)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

router.post('/avatar', handleAvatarUpload, async (req, res) => {
  const { userId } = (req as AuthenticatedRequest).user

  try {
    if (!req.file) {
      throw new AppError(ErrorCode.NO_IMAGE_RECEIVED, 400)
    }

    const profile = await uploadProfileAvatar(userId, req.file)
    sendSuccess(res, profile)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

router.delete('/avatar', async (req, res) => {
  const { userId } = (req as AuthenticatedRequest).user

  try {
    const profile = await deleteProfileAvatar(userId)
    sendSuccess(res, profile)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

export default router
