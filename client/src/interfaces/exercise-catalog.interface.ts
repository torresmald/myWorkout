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
  nameEs: string
  nameEn: string
  descriptionEs: string | null
  descriptionEn: string | null
  muscleGroup: MuscleGroup
  mediaType: CatalogMediaType
  mediaUrl: string | null
  imported: boolean
}
