import type { CatalogMediaType, MuscleGroup } from '@prisma/client'

export interface ExerciseCatalogPublic {
  id: number
  slug: string
  nameEs: string
  nameEn: string
  descriptionEs: string | null
  descriptionEn: string | null
  muscleGroup: MuscleGroup
  mediaType: CatalogMediaType
  mediaUrl: string | null
  imported: boolean
}

export interface ExerciseCatalogQuery {
  muscleGroup?: MuscleGroup
}
