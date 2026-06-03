import type { ExerciseTypePublic } from '@/interfaces/exercise-type.interface'

export function createExerciseType(
  overrides: Partial<ExerciseTypePublic> = {},
): ExerciseTypePublic {
  return {
    id: 5,
    name: 'Sentadilla',
    description: null,
    muscleGroup: 'LEGS',
    catalogExerciseId: null,
    mediaType: null,
    mediaUrl: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}
