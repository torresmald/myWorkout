import { Router } from 'express'

import type { LoginBody, RegisterBody } from '../interfaces/auth.interface.js'
import type { AuthenticatedRequest } from '../interfaces/express.interface.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { getUserById, loginUser, registerUser } from '../services/auth.service.js'
import { handleServiceError } from '../utils/app-error.util.js'
import { sendSuccess } from '../utils/api-response.util.js'

const router = Router()

router.post('/register', async (req, res) => {
  try {
    const user = await registerUser(req.body as RegisterBody)
    sendSuccess(res, user, 201)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

router.post('/login', async (req, res) => {
  try {
    const loginResponse = await loginUser(req.body as LoginBody)
    sendSuccess(res, loginResponse)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

router.get('/me', authenticate, async (req, res) => {
  const { userId } = (req as AuthenticatedRequest).user

  try {
    const user = await getUserById(userId)
    sendSuccess(res, user)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

export default router
