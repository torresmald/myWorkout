import type { UserRole } from './role.interface.js'

export interface RegisterBody {
  email?: string
  password?: string
  name?: string
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
  message: string
  email: string
}

export interface VerifyEmailBody {
  token?: string
}

export interface VerifyEmailResponse {
  message: string
}

export interface ResendVerificationBody {
  email?: string
}

export interface ResendVerificationResponse {
  message: string
}

export interface ForgotPasswordBody {
  email?: string
}

export interface ResetPasswordBody {
  token?: string
  password?: string
}

export interface PasswordResetResponse {
  message: string
}
