import type { WorkoutSessionDetail, WorkoutSetPublic } from '@/interfaces/workout-set.interface'
import { createWorkoutExercise } from '@/__tests__/fixtures/workout.fixture'
import { createCatalogExercise } from '@/__tests__/fixtures/catalog-exercise.fixture'

export function createWorkoutSet(overrides: Partial<WorkoutSetPublic> = {}): WorkoutSetPublic {
  return {
    id: 100,
    workoutExerciseId: 10,
    setNumber: 1,
    reps: 10,
    weight: 80,
    completedAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

export function createWorkoutSessionDetail(
  overrides: Partial<WorkoutSessionDetail> = {},
): WorkoutSessionDetail {
  const exercise = createWorkoutExercise()
  const catalogExercise = createCatalogExercise()

  return {
    id: 1,
    name: 'Leg day',
    date: '2026-01-15',
    notes: null,
    status: 'IN_PROGRESS',
    startedAt: '2026-01-15T10:00:00.000Z',
    completedAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    exercises: [
      {
        ...exercise,
        exerciseType: {
          ...exercise.exerciseType,
          catalogExercise,
        },
        workoutSets: [
          createWorkoutSet({ setNumber: 1 }),
          createWorkoutSet({ id: 101, setNumber: 2 }),
        ],
      },
    ],
    ...overrides,
  }
}
