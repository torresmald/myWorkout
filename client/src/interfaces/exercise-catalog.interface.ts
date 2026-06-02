export type MuscleGroup =
  | 'CHEST'
  | 'BACK'
  | 'LEGS'
  | 'SHOULDERS'
  | 'ARMS'
  | 'CORE'
  | 'FULL_BODY'

export type CatalogMediaType = 'IMAGE' | 'GIF' | 'VIDEO' | 'YOUTUBE'

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
