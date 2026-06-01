export const MIN_HEIGHT_CM = 50
export const MAX_HEIGHT_CM = 250
export const MIN_WEIGHT_KG = 20
export const MAX_WEIGHT_KG = 500
export const MAX_NAME_LENGTH = 100
export const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024
export const UPLOADS_BASE_PATH = '/uploads'
export const AVATARS_SUBDIR = 'avatars'

export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const

export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'] as const
