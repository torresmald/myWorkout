import type { Decimal } from '@prisma/client/runtime/library'

import { UPLOADS_BASE_PATH } from '../constants/profile.constants.js'
import type { UserPublic } from '../interfaces/auth.interface.js'
import { calculateBmi } from './bmi.util.js'
import { decimalToNumber } from './decimal.util.js'

export interface UserProfileRecord {
  id: number
  email: string
  name: string | null
  role: UserPublic['role']
  createdAt: Date
  heightCm: Decimal | null
  profileImagePath: string | null
}

export function buildProfileImageUrl(profileImagePath: string | null): string | null {
  if (!profileImagePath) {
    return null
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
    createdAt: user.createdAt,
    heightCm,
    profileImageUrl: buildProfileImageUrl(user.profileImagePath),
    latestWeightKg,
    bmi,
    bmiCategory,
  }
}
