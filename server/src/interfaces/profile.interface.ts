import type { AppLocale } from '../constants/locale.constants.js'
import type { UserPublic } from './auth.interface.js'

export interface UpdateProfileBody {
  name?: string
  heightCm?: number | null
  weightKg?: number
  targetWeightKg?: number | null
}

export interface AddWeightBody {
  weightKg?: number
}

export interface UpdateWeightBody {
  weightKg?: number
  recordedAt?: string
}

export interface WeightEntryPublic {
  id: number
  weightKg: number
  recordedAt: Date
}

export interface DeleteAccountBody {
  password?: string
}

export interface ChangePasswordBody {
  currentPassword?: string
  newPassword?: string
}

export interface UserProfile extends UserPublic {
  weightEntries: WeightEntryPublic[]
}
