import type { UserRole } from './role.interface.js'
import type { AppLocale } from '../constants/locale.constants.js'

export interface RegisterBody {
  email?: string
  password?: string
  name?: string
  locale?: string
}

export interface LoginBody {
  email?: string
  password?: string
}

export interface UserPublic {
  id: number
  email: string
  name: string | null
  role: UserRole
  locale: AppLocale
  createdAt: Date
  heightCm: number | null
  profileImageUrl: string | null
  latestWeightKg: number | null
  bmi: number | null
  bmiCategory: string | null
}

export interface LoginResponse {
  token: string
  refreshToken: string
  user: UserPublic
}

export interface RegisterResponse {
  messageCode: string
  email: string
}

export interface VerifyEmailBody {
  token?: string
}

export interface VerifyEmailResponse {
  messageCode: string
}

export interface ResendVerificationBody {
  email?: string
  locale?: string
}

export interface ResendVerificationResponse {
  messageCode: string
}

export interface ForgotPasswordBody {
  email?: string
  locale?: string
}

export interface ResetPasswordBody {
  token?: string
  password?: string
}

export interface PasswordResetResponse {
  messageCode: string
}
