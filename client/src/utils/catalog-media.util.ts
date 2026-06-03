export const MAX_CATALOG_MEDIA_SIZE_BYTES = 15 * 1024 * 1024

export const ALLOWED_CATALOG_MEDIA_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
] as const

export type AllowedCatalogMediaMimeType = (typeof ALLOWED_CATALOG_MEDIA_MIME_TYPES)[number]

export type CatalogMediaValidationError = 'invalidFormat' | 'tooLarge'

export function validateCatalogMediaFile(file: File): CatalogMediaValidationError | null {
  if (!ALLOWED_CATALOG_MEDIA_MIME_TYPES.includes(file.type as AllowedCatalogMediaMimeType)) {
    return 'invalidFormat'
  }

  if (file.size > MAX_CATALOG_MEDIA_SIZE_BYTES) {
    return 'tooLarge'
  }

  return null
}

export function getCatalogMediaAcceptAttribute(): string {
  return ALLOWED_CATALOG_MEDIA_MIME_TYPES.join(',')
}
