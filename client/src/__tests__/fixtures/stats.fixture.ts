import type {
  ExerciseEvolutionSeries,
  WeeklyStatPoint,
  WorkoutStats,
} from '@/interfaces/stats.interface'

export function createWeeklyStatPoint(
  overrides: Partial<WeeklyStatPoint> = {},
): WeeklyStatPoint {
  return {
    weekStart: '2026-01-06',
    workoutCount: 2,
    volumeKg: 1500,
    totalReps: 120,
    ...overrides,
  }
}

export function createExerciseEvolutionSeries(
  overrides: Partial<ExerciseEvolutionSeries> = {},
): ExerciseEvolutionSeries {
  return {
    exerciseTypeId: 5,
    exerciseName: 'Sentadilla',
    muscleGroup: 'LEGS',
    dataPoints: [
      {
        date: '2026-01-01',
        workoutId: 1,
        maxWeight: 80,
        volumeKg: 800,
        totalReps: 30,
      },
      {
        date: '2026-01-08',
        workoutId: 2,
        maxWeight: 85,
        volumeKg: 850,
        totalReps: 30,
      },
    ],
    ...overrides,
  }
}

export function createWorkoutStats(overrides: Partial<WorkoutStats> = {}): WorkoutStats {
  return {
    summary: {
      totalWorkouts: 10,
      workoutsThisWeek: 2,
      workoutsLast30Days: 8,
      totalVolumeKg: 12000,
      totalReps: 900,
    },
    weekly: [createWeeklyStatPoint()],
    exerciseEvolution: [createExerciseEvolutionSeries()],
    ...overrides,
  }
}
