import { Router } from 'express'

import type {
  ForgotPasswordBody,
  LoginBody,
  LogoutBody,
  RefreshTokenBody,
  RegisterBody,
  ResendVerificationBody,
  ResetPasswordBody,
  VerifyEmailBody,
} from '../interfaces/auth.interface.js'
import type { GoogleLoginBody } from '../interfaces/google.interface.js'
import type { AuthenticatedRequest } from '../interfaces/express.interface.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { authActionLimiter, authEmailLimiter } from '../middleware/rate-limit.middleware.js'
import {
  getUserById,
  loginUser,
  loginWithGoogle,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from '../services/auth.service.js'
import { resendVerificationEmail, verifyEmailWithToken } from '../services/email-verification.service.js'
import { requestPasswordReset, resetPassword } from '../services/password-reset.service.js'
import { handleServiceError } from '../utils/app-error.util.js'
import { sendSuccess } from '../utils/api-response.util.js'

const router = Router()

router.post('/register', authActionLimiter, async (req, res) => {
  try {
    const result = await registerUser(req.body as RegisterBody)
    sendSuccess(res, result, 201)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

router.post('/login', authActionLimiter, async (req, res) => {
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

router.post('/google', authActionLimiter, async (req, res) => {
  try {
    const { idToken, locale } = req.body as GoogleLoginBody
    const loginResponse = await loginWithGoogle(idToken ?? '', locale)
    sendSuccess(res, loginResponse)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body as VerifyEmailBody
    const result = await verifyEmailWithToken(token ?? '')
    sendSuccess(res, result)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

router.post('/resend-verification', authEmailLimiter, async (req, res) => {
  try {
    const { email, locale } = req.body as ResendVerificationBody
    const result = await resendVerificationEmail(email ?? '', locale)
    sendSuccess(res, result)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

router.post('/forgot-password', authEmailLimiter, async (req, res) => {
  try {
    const { email, locale } = req.body as ForgotPasswordBody
    const result = await requestPasswordReset(email ?? '', locale)
    sendSuccess(res, result)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body as ResetPasswordBody
    const result = await resetPassword(token ?? '', password ?? '')
    sendSuccess(res, result)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

router.post('/refresh', authActionLimiter, async (req, res) => {
  try {
    const { refreshToken } = req.body as RefreshTokenBody
    const loginResponse = await refreshAccessToken(refreshToken)
    sendSuccess(res, loginResponse)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

router.post('/logout', authActionLimiter, async (req, res) => {
  try {
    const { refreshToken } = req.body as LogoutBody
    await logoutUser(refreshToken)
    sendSuccess(res, null)
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
