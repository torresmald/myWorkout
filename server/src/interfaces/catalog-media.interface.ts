import type { CatalogMediaType } from '@prisma/client'

export interface CatalogMediaUploadResult {
  mediaUrl: string
  mediaType: CatalogMediaType
}
