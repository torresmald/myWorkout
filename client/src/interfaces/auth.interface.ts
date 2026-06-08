import type { AppLocale } from '@/constants/locale.constants'
import type { UserRole } from '@/interfaces/role.interface'

export interface LoginBody {
  email: string
  password: string
}

export interface RegisterBody {
  email: string
  password: string
  name?: string
  locale?: AppLocale
}

export interface UserPublic {
  id: number
  email: string
  name: string | null
  role: UserRole
  locale: AppLocale
  themeMode: 'light' | 'dark' | 'system'
  weightUnit: 'kg' | 'lb'
  createdAt: string
  heightCm: number | null
  targetWeightKg: number | null
  profileImageUrl: string | null
  spotifyPlaylistUrl: string | null
  allowAutoPlaylist: boolean
  restTimerSoundEnabled: boolean
  showPrToast: boolean
  confirmIncompleteFinish: boolean
  spotifyConnected: boolean
  spotifyDisplayName: string | null
  spotifyPlaylistName: string | null
  latestWeightKg: number | null
  bmi: number | null
  bmiCategory: string | null
}

export interface LoginData {
  token: string
  refreshToken: string
  user: UserPublic
}

export interface RegisterData {
  messageCode: string
  email: string
}

export interface VerifyEmailData {
  messageCode: string
}

export interface ResendVerificationData {
  messageCode: string
}

export interface PasswordResetData {
  messageCode: string
}
