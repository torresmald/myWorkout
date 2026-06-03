import type { CatalogMediaType } from '@prisma/client'

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

const MIME_TO_MEDIA_TYPE: Record<AllowedCatalogMediaMimeType, CatalogMediaType> = {
  'image/jpeg': 'IMAGE',
  'image/png': 'IMAGE',
  'image/webp': 'IMAGE',
  'image/gif': 'GIF',
  'video/mp4': 'VIDEO',
  'video/webm': 'VIDEO',
  'video/quicktime': 'VIDEO',
}

export function getCatalogMediaTypeFromMime(mimetype: string): CatalogMediaType | null {
  if (!(mimetype in MIME_TO_MEDIA_TYPE)) {
    return null
  }

  return MIME_TO_MEDIA_TYPE[mimetype as AllowedCatalogMediaMimeType]
}

export function isAllowedCatalogMediaMime(mimetype: string): mimetype is AllowedCatalogMediaMimeType {
  return ALLOWED_CATALOG_MEDIA_MIME_TYPES.includes(mimetype as AllowedCatalogMediaMimeType)
}
