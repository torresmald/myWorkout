export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const SALT_ROUNDS = 10
export const EMAIL_VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000
export const PASSWORD_RESET_TOKEN_TTL_MS = 60 * 60 * 1000

export const userPublicSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  locale: true,
  createdAt: true,
  heightCm: true,
  profileImagePath: true,
} as const
