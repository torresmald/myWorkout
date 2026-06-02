import type { Decimal } from '@prisma/client/runtime/library'

import { isCloudinaryPublicId } from '../constants/cloudinary.constants.js'
import { UPLOADS_BASE_PATH } from '../constants/profile.constants.js'
import type { UserPublic } from '../interfaces/auth.interface.js'
import { getCloudinaryImageUrl } from '../utils/cloudinary-image.util.js'
import { calculateBmi } from './bmi.util.js'
import { decimalToNumber } from './decimal.util.js'
import { parseAppLocale } from './locale.util.js'

export interface UserProfileRecord {
  id: number
  email: string
  name: string | null
  role: UserPublic['role']
  locale: string
  createdAt: Date
  heightCm: Decimal | null
  profileImagePath: string | null
  spotifyPlaylistUrl: string | null
  spotifyUserId: string | null
  spotifyDisplayName: string | null
  spotifyPlaylistName: string | null
}

export function buildProfileImageUrl(profileImagePath: string | null): string | null {
  if (!profileImagePath) {
    return null
  }

  if (isCloudinaryPublicId(profileImagePath)) {
    return getCloudinaryImageUrl(profileImagePath)
  }

  return `${UPLOADS_BASE_PATH}/${profileImagePath}`
}

export function mapUserToPublic(user: UserProfileRecord, latestWeightKg: number | null): UserPublic {
  const heightCm = decimalToNumber(user.heightCm)
  const { bmi, bmiCategory } = calculateBmi(latestWeightKg, heightCm)

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    locale: parseAppLocale(user.locale),
    createdAt: user.createdAt,
    heightCm,
    profileImageUrl: buildProfileImageUrl(user.profileImagePath),
    spotifyPlaylistUrl: user.spotifyPlaylistUrl,
    spotifyConnected: Boolean(user.spotifyUserId),
    spotifyDisplayName: user.spotifyDisplayName,
    spotifyPlaylistName: user.spotifyPlaylistName,
    latestWeightKg,
    bmi,
    bmiCategory,
  }
}
