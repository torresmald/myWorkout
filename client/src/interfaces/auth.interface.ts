import type { UserRole } from './role.interface'

export interface LoginBody {
  email: string
  password: string
}

export interface RegisterBody {
  email: string
  password: string
  name?: string
}

export interface UserPublic {
  id: number
  email: string
  name: string | null
  role: UserRole
  createdAt: string
  heightCm: number | null
  profileImageUrl: string | null
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
  message: string
  email: string
}

export interface VerifyEmailData {
  message: string
}

export interface ResendVerificationData {
  message: string
}

export interface PasswordResetData {
  message: string
}
