import { workoutSetSelect } from '../constants/workout.constants.js'
import { prisma } from '../config/prisma.js'
import { ErrorCode } from '../constants/error-codes.constants.js'
import { AppError } from '../interfaces/app-error.interface.js'
import type {
  ExerciseHistoryDetail,
  ExerciseHistorySession,
  ExerciseHistorySetDetail,
} from '../interfaces/exercise-history.interface.js'
import { findUserExerciseType } from '../utils/exercise-type.util.js'
import { getPersonalRecordByExerciseType } from './personal-record.service.js'

type WorkoutExerciseWithSets = {
  id: number
  sets: number
  reps: number
  weight: number | null
  workoutSets: Array<{
    setNumber: number
    reps: number
    weight: number | null
    completedAt: Date | null
  }>
  workout: {
    id: number
    name: string
    date: Date
    status: ExerciseHistorySession['workoutStatus']
  }
}

function mapSetDetails(
  sets: WorkoutExerciseWithSets['workoutSets'],
): ExerciseHistorySetDetail[] {
  return sets.map((set) => ({
    setNumber: set.setNumber,
    reps: set.reps,
    weight: set.weight,
    completedAt: set.completedAt,
  }))
}

function buildLiveSession(
  exercise: WorkoutExerciseWithSets,
  personalRecordWorkoutId: number | null,
  personalRecordWeight: number | null,
): ExerciseHistorySession | null {
  const completedSets = exercise.workoutSets.filter((set) => set.completedAt !== null)

  if (completedSets.length === 0) {
    return null
  }

  const weightValues = completedSets
    .map((set) => set.weight)
    .filter((weight): weight is number => weight !== null && weight > 0)

  const maxWeight = weightValues.length > 0 ? Math.max(...weightValues) : null
  const totalReps = completedSets.reduce((sum, set) => sum + set.reps, 0)
  const volumeKg = completedSets.reduce(
    (sum, set) => sum + set.reps * (set.weight ?? 0),
    0,
  )

  return {
    workoutId: exercise.workout.id,
    workoutName: exercise.workout.name,
    workoutDate: exercise.workout.date,
    workoutStatus: exercise.workout.status,
    sets: completedSets.length,
    reps: completedSets[completedSets.length - 1]!.reps,
    maxWeight,
    volumeKg,
    totalReps,
    source: 'LIVE',
    setDetails: mapSetDetails(exercise.workoutSets),
    isPersonalRecord:
      personalRecordWorkoutId === exercise.workout.id &&
      maxWeight !== null &&
      personalRecordWeight !== null &&
      maxWeight === personalRecordWeight,
  }
}

function buildAggregateSession(
  exercise: WorkoutExerciseWithSets,
  personalRecordWorkoutId: number | null,
  personalRecordWeight: number | null,
): ExerciseHistorySession {
  const volumeKg =
    exercise.weight !== null ? exercise.sets * exercise.reps * exercise.weight : 0
  const totalReps = exercise.sets * exercise.reps

  return {
    workoutId: exercise.workout.id,
    workoutName: exercise.workout.name,
    workoutDate: exercise.workout.date,
    workoutStatus: exercise.workout.status,
    sets: exercise.sets,
    reps: exercise.reps,
    maxWeight: exercise.weight,
    volumeKg,
    totalReps,
    source: 'AGGREGATE',
    setDetails: [],
    isPersonalRecord:
      personalRecordWorkoutId === exercise.workout.id &&
      exercise.weight !== null &&
      personalRecordWeight !== null &&
      exercise.weight === personalRecordWeight,
  }
}

function buildSessionEntry(
  exercise: WorkoutExerciseWithSets,
  personalRecordWorkoutId: number | null,
  personalRecordWeight: number | null,
): ExerciseHistorySession {
  if (exercise.workoutSets.length > 0) {
    const liveSession = buildLiveSession(
      exercise,
      personalRecordWorkoutId,
      personalRecordWeight,
    )

    if (liveSession) {
      return liveSession
    }
  }

  return buildAggregateSession(exercise, personalRecordWorkoutId, personalRecordWeight)
}

export async function getExerciseHistory(
  userId: number,
  exerciseTypeIdParam: string,
): Promise<ExerciseHistoryDetail> {
  const exerciseType = await findUserExerciseType(userId, exerciseTypeIdParam)

  if (!exerciseType) {
    throw new AppError(ErrorCode.EXERCISE_TYPE_NOT_FOUND, 404)
  }

  const [personalRecord, workoutExercises] = await Promise.all([
    getPersonalRecordByExerciseType(userId, exerciseTypeIdParam),
    prisma.workoutExercise.findMany({
      where: {
        exerciseTypeId: exerciseType.id,
        workout: { userId },
      },
      select: {
        id: true,
        sets: true,
        reps: true,
        weight: true,
        workoutSets: {
          select: workoutSetSelect,
          orderBy: [{ setNumber: 'asc' }],
        },
        workout: {
          select: {
            id: true,
            name: true,
            date: true,
            status: true,
          },
        },
      },
      orderBy: [{ workout: { date: 'desc' } }, { id: 'desc' }],
    }),
  ])

  const personalRecordWorkoutId = personalRecord?.workoutId ?? null
  const personalRecordWeight = personalRecord?.maxWeight ?? null

  const sessions = workoutExercises.map((exercise) =>
    buildSessionEntry(exercise, personalRecordWorkoutId, personalRecordWeight),
  )

  return {
    exerciseType,
    personalRecord,
    sessions,
  }
}
