import type { CatalogMediaType, MuscleGroup } from '@prisma/client'

export interface AdminExerciseCatalogEntry {
  id: number
  slug: string
  nameEs: string
  nameEn: string
  descriptionEs: string | null
  descriptionEn: string | null
  muscleGroup: MuscleGroup
  mediaType: CatalogMediaType
  mediaUrl: string | null
  sortOrder: number
  active: boolean
  importCount: number
  createdAt: Date
  updatedAt: Date
}

export interface UpsertAdminExerciseCatalogBody {
  slug?: string
  nameEs?: string
  nameEn?: string
  descriptionEs?: string | null
  descriptionEn?: string | null
  muscleGroup?: MuscleGroup
  mediaType?: CatalogMediaType
  mediaUrl?: string | null
  sortOrder?: number
  active?: boolean
}
