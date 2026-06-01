export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const SALT_ROUNDS = 10
export const EMAIL_VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000
export const PASSWORD_RESET_TOKEN_TTL_MS = 60 * 60 * 1000
export const EMAIL_NOT_VERIFIED_MESSAGE = 'Debes verificar tu email antes de iniciar sesión'
export const RESEND_VERIFICATION_SUCCESS_MESSAGE =
  'Si la cuenta existe y no está verificada, recibirás un nuevo email en breve'
export const FORGOT_PASSWORD_SUCCESS_MESSAGE =
  'Si existe una cuenta con contraseña para ese email, recibirás un enlace para restablecerla'

export const userPublicSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
  heightCm: true,
  profileImagePath: true,
} as const
