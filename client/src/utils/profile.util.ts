import {
  ALLOWED_AVATAR_MIME_TYPES,
  MAX_AVATAR_SIZE_BYTES,
} from '@/interfaces/profile.interface'

type AllowedAvatarMimeType = (typeof ALLOWED_AVATAR_MIME_TYPES)[number]

export type AvatarValidationError = 'invalidFormat' | 'tooLarge'

export function getUserInitials(name: string | null | undefined, email: string): string {
  const trimmedName = name?.trim()

  if (trimmedName) {
    const initials = trimmedName
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('')

    if (initials) {
      return initials
    }
  }

  return email[0]?.toUpperCase() ?? '?'
}

export function validateAvatarFile(file: File): AvatarValidationError | null {
  if (!ALLOWED_AVATAR_MIME_TYPES.includes(file.type as AllowedAvatarMimeType)) {
    return 'invalidFormat'
  }

  if (file.size > MAX_AVATAR_SIZE_BYTES) {
    return 'tooLarge'
  }

  return null
}

export function withCacheBuster(url: string, cacheKey: number): string {
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}v=${cacheKey}`
}

export function parseOptionalNumber(value: string | number | null | undefined): number | null {
  if (value === '' || value === null || value === undefined) {
    return null
  }

  const parsed = typeof value === 'number' ? value : Number(String(value).trim())

  if (!Number.isFinite(parsed)) {
    return null
  }

  return parsed
}
