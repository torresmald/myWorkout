export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const SALT_ROUNDS = 10

export const userPublicSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
} as const
