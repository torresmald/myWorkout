import type { CatalogMediaType } from '@/interfaces/exercise-catalog.interface'

export interface CatalogMediaUploadResult {
  mediaUrl: string
  mediaType: CatalogMediaType
}
