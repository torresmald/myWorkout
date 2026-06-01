import type { UserPublic } from './auth.interface'

export interface WeightEntryPublic {
  id: number
  weightKg: number
  recordedAt: string
}

export interface UserProfile extends UserPublic {
  weightEntries: WeightEntryPublic[]
}

export const ALLOWED_AVATAR_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

export const ALLOWED_AVATAR_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'] as const

export const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024
