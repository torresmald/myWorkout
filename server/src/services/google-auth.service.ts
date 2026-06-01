import { OAuth2Client } from 'google-auth-library'

import { GOOGLE_CLIENT_ID } from '../constants/google.constants.js'
import { AppError } from '../interfaces/app-error.interface.js'
import type { GoogleUserProfile } from '../interfaces/google.interface.js'
import { normalizeEmail } from '../utils/auth.util.js'

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID)

export async function verifyGoogleIdToken(idToken: string): Promise<GoogleUserProfile> {
  if (!GOOGLE_CLIENT_ID) {
    throw new AppError('Google OAuth no está configurado', 500)
  }

  if (!idToken.trim()) {
    throw new AppError('Token de Google inválido', 400)
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()

    if (!payload?.sub || !payload.email) {
      throw new AppError('Token de Google inválido', 401)
    }

    return {
      googleId: payload.sub,
      email: normalizeEmail(payload.email),
      name: payload.name?.trim() || payload.given_name?.trim() || null,
      emailVerified: payload.email_verified === true,
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }

    throw new AppError('Token de Google inválido', 401)
  }
}
