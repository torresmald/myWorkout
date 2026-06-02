import { Router } from 'express'

import type { AuthenticatedRequest } from '../interfaces/express.interface.js'
import type { SetSpotifyWorkoutPlaylistBody } from '../interfaces/spotify.interface.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { authActionLimiter } from '../middleware/rate-limit.middleware.js'
import {
  connectSpotifyAccount,
  createSpotifyConnectUrl,
  disconnectSpotifyAccount,
  getSpotifyConnection,
  getSpotifyPlaylists,
  getSpotifyProfileRedirectUrl,
  setSpotifyWorkoutPlaylist,
  verifySpotifyOAuthState,
} from '../services/spotify.service.js'
import { handleServiceError } from '../utils/app-error.util.js'
import { sendSuccess } from '../utils/api-response.util.js'

const router = Router()

router.get('/callback', authActionLimiter, async (req, res) => {
  const code = typeof req.query.code === 'string' ? req.query.code : ''
  const state = typeof req.query.state === 'string' ? req.query.state : ''
  const oauthError = typeof req.query.error === 'string' ? req.query.error : ''

  if (oauthError) {
    res.redirect(getSpotifyProfileRedirectUrl('error'))
    return
  }

  try {
    const userId = verifySpotifyOAuthState(state)
    await connectSpotifyAccount(userId, code)
    res.redirect(getSpotifyProfileRedirectUrl('connected'))
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    res.redirect(getSpotifyProfileRedirectUrl('error'))
  }
})

router.use(authenticate)

router.get('/connect-url', authActionLimiter, async (req, res) => {
  const { userId } = (req as AuthenticatedRequest).user

  try {
    sendSuccess(res, { url: createSpotifyConnectUrl(userId) })
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

router.get('/connection', async (req, res) => {
  const { userId } = (req as AuthenticatedRequest).user

  try {
    const connection = await getSpotifyConnection(userId)
    sendSuccess(res, connection)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

router.get('/playlists', async (req, res) => {
  const { userId } = (req as AuthenticatedRequest).user

  try {
    const playlists = await getSpotifyPlaylists(userId)
    sendSuccess(res, playlists)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

router.put('/workout-playlist', async (req, res) => {
  const { userId } = (req as AuthenticatedRequest).user

  try {
    const connection = await setSpotifyWorkoutPlaylist(userId, req.body as SetSpotifyWorkoutPlaylistBody)
    sendSuccess(res, connection)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

router.delete('/disconnect', async (req, res) => {
  const { userId } = (req as AuthenticatedRequest).user

  try {
    const connection = await disconnectSpotifyAccount(userId)
    sendSuccess(res, connection)
  } catch (error) {
    if (handleServiceError(error, res)) {
      return
    }

    throw error
  }
})

export default router
