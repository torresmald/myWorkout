import type { WorkoutExercisePublic, WorkoutPublic } from '@/interfaces/workout.interface'

export function createWorkout(overrides: Partial<WorkoutPublic> = {}): WorkoutPublic {
  return {
    id: 1,
    name: 'Leg day',
    date: '2026-01-15',
    notes: null,
    status: 'PLANNED',
    startedAt: null,
    completedAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

export function createWorkoutExercise(
  overrides: Partial<WorkoutExercisePublic> = {},
): WorkoutExercisePublic {
  return {
    id: 10,
    workoutId: 1,
    exerciseTypeId: 5,
    sets: 3,
    reps: 10,
    restSeconds: 90,
    weight: 80,
    sortOrder: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    exerciseType: { id: 5, name: 'Sentadilla', muscleGroup: 'LEGS' },
    ...overrides,
  }
}
