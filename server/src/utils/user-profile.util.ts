import type { Decimal } from '@prisma/client/runtime/library'

import { isCloudinaryPublicId } from '../constants/cloudinary.constants.js'
import { UPLOADS_BASE_PATH } from '../constants/profile.constants.js'
import type { UserPublic } from '../interfaces/auth.interface.js'
import { getCloudinaryImageUrl } from '../utils/cloudinary-image.util.js'
import { calculateBmi } from './bmi.util.js'
import { decimalToNumber } from './decimal.util.js'
import { mapPreferencesToPublic } from '../services/user-preferences.service.js'

export interface UserProfileRecord {
  id: number
  email: string
  name: string | null
  role: UserPublic['role']
  createdAt: Date
  heightCm: Decimal | null
  targetWeightKg: Decimal | null
  profileImagePath: string | null
  preferences: {
    locale: string
    themeMode: string
    weightUnit: string
    allowAutoPlaylist: boolean
    restTimerSoundEnabled: boolean
    showPrToast: boolean
    confirmIncompleteFinish: boolean
    spotifyPlaylistUrl: string | null
    spotifyUserId: string | null
    spotifyDisplayName: string | null
    spotifyPlaylistName: string | null
  } | null
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

export function mapUserToPublic(
  user: UserProfileRecord,
  latestWeightKg: number | null,
): UserPublic {
  const heightCm = decimalToNumber(user.heightCm)
  const targetWeightKg = decimalToNumber(user.targetWeightKg)
  const { bmi, bmiCategory } = calculateBmi(latestWeightKg, heightCm)
  const preferences = mapPreferencesToPublic(user.preferences)

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
    heightCm,
    targetWeightKg,
    profileImageUrl: buildProfileImageUrl(user.profileImagePath),
    locale: preferences.locale,
    themeMode: preferences.themeMode,
    weightUnit: preferences.weightUnit,
    spotifyPlaylistUrl: preferences.spotifyPlaylistUrl,
    allowAutoPlaylist: preferences.allowAutoPlaylist,
    restTimerSoundEnabled: preferences.restTimerSoundEnabled,
    showPrToast: preferences.showPrToast,
    confirmIncompleteFinish: preferences.confirmIncompleteFinish,
    spotifyConnected: preferences.spotifyConnected,
    spotifyDisplayName: preferences.spotifyDisplayName,
    spotifyPlaylistName: preferences.spotifyPlaylistName,
    latestWeightKg,
    bmi,
    bmiCategory,
  }
}
