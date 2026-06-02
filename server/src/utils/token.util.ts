import { createHash, randomBytes } from 'node:crypto'

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function generateRefreshToken(): string {
  return randomBytes(40).toString('hex')
}

export function buildRefreshToken(userId: number): string {
  return `${userId}.${generateRefreshToken()}`
}

export function parseRefreshTokenUserId(refreshToken: string): number | null {
  const dotIndex = refreshToken.indexOf('.')
  if (dotIndex <= 0) {
    return null
  }

  const userId = Number(refreshToken.slice(0, dotIndex))
  if (!Number.isInteger(userId) || userId <= 0) {
    return null
  }

  return userId
}

export function generateVerificationToken(): string {
  return randomBytes(32).toString('hex')
}
