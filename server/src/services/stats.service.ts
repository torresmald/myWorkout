import { prisma } from '../config/prisma.js'
import type {
  ExerciseEvolutionPoint,
  ExerciseEvolutionSeries,
  StatsSummary,
  WeeklyStatPoint,
  WorkoutStats,
} from '../interfaces/stats.interface.js'

const WEEKS_TO_SHOW = 8
const MS_PER_DAY = 24 * 60 * 60 * 1000

function getWeekStart(date: Date): Date {
  const weekStart = new Date(date)
  const day = weekStart.getDay()
  const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1)
  weekStart.setDate(diff)
  weekStart.setHours(0, 0, 0, 0)
  return weekStart
}

function getWeekKey(date: Date): string {
  return getWeekStart(date).toISOString().slice(0, 10)
}

function buildRecentWeekKeys(weekCount: number): string[] {
  const keys: string[] = []
  const current = getWeekStart(new Date())

  for (let index = weekCount - 1; index >= 0; index -= 1) {
    const week = new Date(current.getTime() - index * 7 * MS_PER_DAY)
    keys.push(getWeekKey(week))
  }

  return keys
}

function calculateExerciseVolume(sets: number, reps: number, weight: number | null): {
  volumeKg: number
  totalReps: number
} {
  const totalReps = sets * reps
  const volumeKg = weight !== null ? totalReps * weight : 0

  return { volumeKg, totalReps }
}

export async function getWorkoutStats(userId: number): Promise<WorkoutStats> {
  const periodStart = new Date(getWeekStart(new Date()).getTime() - (WEEKS_TO_SHOW - 1) * 7 * MS_PER_DAY)
  const thirtyDaysAgo = new Date(Date.now() - 30 * MS_PER_DAY)
  const currentWeekKey = getWeekKey(new Date())

  const [workoutsInPeriod, totalWorkouts, workoutsLast30Days] = await Promise.all([
    prisma.workout.findMany({
      where: {
        userId,
        date: { gte: periodStart },
      },
      select: {
        id: true,
        date: true,
        exercises: {
          select: {
            sets: true,
            reps: true,
            weight: true,
            exerciseTypeId: true,
            exerciseType: {
              select: {
                id: true,
                name: true,
                muscleGroup: true,
              },
            },
          },
        },
      },
      orderBy: { date: 'asc' },
    }),
    prisma.workout.count({ where: { userId } }),
    prisma.workout.count({
      where: {
        userId,
        date: { gte: thirtyDaysAgo },
      },
    }),
  ])

  const weeklyMap = new Map<string, WeeklyStatPoint>()
  for (const weekStart of buildRecentWeekKeys(WEEKS_TO_SHOW)) {
    weeklyMap.set(weekStart, {
      weekStart,
      workoutCount: 0,
      volumeKg: 0,
      totalReps: 0,
    })
  }

  let workoutsThisWeek = 0
  let periodVolumeKg = 0
  let periodTotalReps = 0

  const exerciseWorkoutMap = new Map<
    number,
    {
      exerciseName: string
      muscleGroup: string | null
      byWorkout: Map<number, ExerciseEvolutionPoint>
    }
  >()

  for (const workout of workoutsInPeriod) {
    const weekKey = getWeekKey(workout.date)
    const weekPoint = weeklyMap.get(weekKey)

    if (weekPoint) {
      weekPoint.workoutCount += 1
    }

    if (weekKey === currentWeekKey) {
      workoutsThisWeek += 1
    }

    for (const exercise of workout.exercises) {
      const { volumeKg, totalReps } = calculateExerciseVolume(
        exercise.sets,
        exercise.reps,
        exercise.weight,
      )

      if (weekPoint) {
        weekPoint.volumeKg += volumeKg
        weekPoint.totalReps += totalReps
      }

      periodVolumeKg += volumeKg
      periodTotalReps += totalReps

      const exerciseEntry = exerciseWorkoutMap.get(exercise.exerciseTypeId) ?? {
        exerciseName: exercise.exerciseType.name,
        muscleGroup: exercise.exerciseType.muscleGroup,
        byWorkout: new Map<number, ExerciseEvolutionPoint>(),
      }

      const existing = exerciseEntry.byWorkout.get(workout.id)
      const maxWeight = exercise.weight

      if (existing) {
        existing.volumeKg += volumeKg
        existing.totalReps += totalReps
        if (maxWeight !== null) {
          existing.maxWeight =
            existing.maxWeight === null ? maxWeight : Math.max(existing.maxWeight, maxWeight)
        }
      } else {
        exerciseEntry.byWorkout.set(workout.id, {
          date: workout.date.toISOString(),
          workoutId: workout.id,
          maxWeight,
          volumeKg,
          totalReps,
        })
      }

      exerciseWorkoutMap.set(exercise.exerciseTypeId, exerciseEntry)
    }
  }

  const exerciseEvolution: ExerciseEvolutionSeries[] = [...exerciseWorkoutMap.entries()]
    .map(([exerciseTypeId, entry]) => ({
      exerciseTypeId,
      exerciseName: entry.exerciseName,
      muscleGroup: entry.muscleGroup,
      sessionCount: entry.byWorkout.size,
      dataPoints: [...entry.byWorkout.values()].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      ),
    }))
    .sort((a, b) => b.sessionCount - a.sessionCount)
    .slice(0, 8)
    .map(({ sessionCount: _sessionCount, ...series }) => series)

  const summary: StatsSummary = {
    totalWorkouts,
    workoutsThisWeek,
    workoutsLast30Days,
    totalVolumeKg: Math.round(periodVolumeKg),
    totalReps: periodTotalReps,
  }

  return {
    summary,
    weekly: [...weeklyMap.values()],
    exerciseEvolution,
  }
}
