import type { ExerciseHistorySession } from '@/interfaces/exercise-history.interface'
import { createExerciseType } from '@/__tests__/fixtures/exercise-type.fixture'
import type { ExerciseHistoryDetail } from '@/interfaces/exercise-history.interface'

export function createExerciseHistorySession(
  overrides: Partial<ExerciseHistorySession> = {},
): ExerciseHistorySession {
  return {
    workoutId: 1,
    workoutName: 'Leg day',
    workoutDate: '2026-01-15',
    workoutStatus: 'COMPLETED',
    sets: 3,
    reps: 30,
    maxWeight: 80,
    volumeKg: 2400,
    totalReps: 30,
    source: 'LIVE',
    setDetails: [
      { setNumber: 1, reps: 10, weight: 80, completedAt: '2026-01-15T10:00:00.000Z' },
      { setNumber: 2, reps: 10, weight: 80, completedAt: '2026-01-15T10:05:00.000Z' },
    ],
    isPersonalRecord: false,
    ...overrides,
  }
}

export function createExerciseHistoryDetail(
  overrides: Partial<ExerciseHistoryDetail> = {},
): ExerciseHistoryDetail {
  return {
    exerciseType: createExerciseType(),
    personalRecord: null,
    sessions: [createExerciseHistorySession(), createExerciseHistorySession({ workoutId: 2 })],
    ...overrides,
  }
}
