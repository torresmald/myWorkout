import { api } from '@/api/client'
import type { AppLocale } from '@/constants/locale.constants'
import type {
  LoginBody,
  LoginData,
  RegisterBody,
  RegisterData,
  UserPublic,
  VerifyEmailData,
  ResendVerificationData,
  PasswordResetData,
} from '@/interfaces/auth.interface'

export function login(body: LoginBody) {
  return api<LoginData>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function loginWithGoogle(idToken: string, locale: AppLocale) {
  return api<LoginData>('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ idToken, locale }),
  })
}

export function register(body: RegisterBody) {
  return api<RegisterData>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function verifyEmail(token: string) {
  return api<VerifyEmailData>('/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ token }),
  })
}

export function resendVerification(email: string, locale: AppLocale) {
  return api<ResendVerificationData>('/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email, locale }),
  })
}

export function forgotPassword(email: string, locale: AppLocale) {
  return api<PasswordResetData>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email, locale }),
  })
}

export function resetPassword(token: string, password: string) {
  return api<PasswordResetData>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  })
}

export function getMe() {
  return api<UserPublic>('/auth/me')
}

export function logout(refreshToken: string) {
  return api<null>('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  })
}
