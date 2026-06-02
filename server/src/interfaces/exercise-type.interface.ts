export interface CreateExerciseTypeBody {
  name?: string
  description?: string
  muscleGroup?: string
}

export type UpdateExerciseTypeBody = CreateExerciseTypeBody

export interface ExerciseTypePublic {
  id: number
  name: string
  description: string | null
  muscleGroup: string | null
  catalogExerciseId: number | null
  mediaType: string | null
  mediaUrl: string | null
  createdAt: Date
  updatedAt: Date
}
