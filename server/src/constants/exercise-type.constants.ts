import { getMuscleGroupLabel } from './exercise-catalog.constants.js'

export const exerciseTypeSelect = {
  id: true,
  name: true,
  description: true,
  muscleGroup: true,
  catalogExerciseId: true,
  createdAt: true,
  updatedAt: true,
  catalogExercise: {
    select: {
      mediaType: true,
      mediaUrl: true,
    },
  },
} as const

export type ExerciseTypeRecord = {
  id: number
  name: string
  description: string | null
  muscleGroup: string | null
  catalogExerciseId: number | null
  createdAt: Date
  updatedAt: Date
  catalogExercise: {
    mediaType: string
    mediaUrl: string | null
  } | null
}

export function mapExerciseTypePublic(exercise: ExerciseTypeRecord) {
  return {
    id: exercise.id,
    name: exercise.name,
    description: exercise.description,
    muscleGroup: exercise.muscleGroup,
    catalogExerciseId: exercise.catalogExerciseId,
    mediaType: exercise.catalogExercise?.mediaType ?? null,
    mediaUrl: exercise.catalogExercise?.mediaUrl ?? null,
    createdAt: exercise.createdAt,
    updatedAt: exercise.updatedAt,
  }
}

export { getMuscleGroupLabel }
