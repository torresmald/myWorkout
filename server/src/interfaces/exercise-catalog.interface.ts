import type { CatalogMediaType, MuscleGroup } from '@prisma/client'

import type { AppLocale } from '../constants/locale.constants.js'

export interface ExerciseCatalogPublic {
  id: number
  slug: string
  name: string
  description: string | null
  muscleGroup: MuscleGroup
  muscleGroupLabel: string
  mediaType: CatalogMediaType
  mediaUrl: string | null
  imported: boolean
}

export interface ExerciseCatalogQuery {
  muscleGroup?: MuscleGroup
}
