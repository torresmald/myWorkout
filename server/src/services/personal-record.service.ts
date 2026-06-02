import { prisma } from '../config/prisma.js'
import { ErrorCode } from '../constants/error-codes.constants.js'
import { AppError } from '../interfaces/app-error.interface.js'
import type { PersonalRecordPublic } from '../interfaces/personal-record.interface.js'
import { findUserExerciseType } from '../utils/exercise-type.util.js'
import { groupBestRecordsByExerciseType, pickBestRecord } from '../utils/personal-record.util.js'

type RecordCandidate = {
  exerciseTypeId: number
  exerciseName: string
  muscleGroup: string | null
  weight: number
  reps: number
  achievedAt: Date
  workoutId: number
  workoutName: string
}

async function fetchSetCandidates(
  userId: number,
  exerciseTypeId?: number,
  excludeSetId?: number,
): Promise<RecordCandidate[]> {
  const sets = await prisma.workoutSet.findMany({
    where: {
      ...(excludeSetId ? { id: { not: excludeSetId } } : {}),
      completedAt: { not: null },
      weight: { not: null, gt: 0 },
      workoutExercise: {
        ...(exerciseTypeId !== undefined ? { exerciseTypeId } : {}),
        workout: { userId },
      },
    },
    select: {
      weight: true,
      reps: true,
      completedAt: true,
      workoutExercise: {
        select: {
          exerciseTypeId: true,
          exerciseType: {
            select: {
              name: true,
              muscleGroup: true,
            },
          },
          workout: {
            select: {
              id: true,
              name: true,
              date: true,
            },
          },
        },
      },
    },
  })

  return sets.flatMap((set) => {
    if (set.weight === null || set.completedAt === null) {
      return []
    }

    return [
      {
        exerciseTypeId: set.workoutExercise.exerciseTypeId,
        exerciseName: set.workoutExercise.exerciseType.name,
        muscleGroup: set.workoutExercise.exerciseType.muscleGroup,
        weight: set.weight,
        reps: set.reps,
        achievedAt: set.completedAt,
        workoutId: set.workoutExercise.workout.id,
        workoutName: set.workoutExercise.workout.name,
      },
    ]
  })
}

async function fetchAggregateCandidates(
  userId: number,
  exerciseTypeId?: number,
): Promise<RecordCandidate[]> {
  const exercises = await prisma.workoutExercise.findMany({
    where: {
      ...(exerciseTypeId !== undefined ? { exerciseTypeId } : {}),
      weight: { not: null, gt: 0 },
      workout: { userId },
    },
    select: {
      reps: true,
      weight: true,
      exerciseTypeId: true,
      exerciseType: {
        select: {
          name: true,
          muscleGroup: true,
        },
      },
      workout: {
        select: {
          id: true,
          name: true,
          date: true,
        },
      },
    },
  })

  return exercises.flatMap((exercise) => {
    if (exercise.weight === null) {
      return []
    }

    return [
      {
        exerciseTypeId: exercise.exerciseTypeId,
        exerciseName: exercise.exerciseType.name,
        muscleGroup: exercise.exerciseType.muscleGroup,
        weight: exercise.weight,
        reps: exercise.reps,
        achievedAt: exercise.workout.date,
        workoutId: exercise.workout.id,
        workoutName: exercise.workout.name,
      },
    ]
  })
}

async function fetchRecordCandidates(
  userId: number,
  exerciseTypeId?: number,
  excludeSetId?: number,
): Promise<RecordCandidate[]> {
  const [setCandidates, aggregateCandidates] = await Promise.all([
    fetchSetCandidates(userId, exerciseTypeId, excludeSetId),
    fetchAggregateCandidates(userId, exerciseTypeId),
  ])

  return [...setCandidates, ...aggregateCandidates]
}

function toPublicRecord(candidate: RecordCandidate): PersonalRecordPublic {
  return {
    exerciseTypeId: candidate.exerciseTypeId,
    exerciseName: candidate.exerciseName,
    muscleGroup: candidate.muscleGroup,
    maxWeight: candidate.weight,
    reps: candidate.reps,
    achievedAt: candidate.achievedAt,
    workoutId: candidate.workoutId,
    workoutName: candidate.workoutName,
  }
}

export async function getHistoricalMaxWeight(
  userId: number,
  exerciseTypeId: number,
  excludeSetId?: number,
): Promise<number | null> {
  const candidates = await fetchRecordCandidates(userId, exerciseTypeId, excludeSetId)
  const best = pickBestRecord(candidates)

  return best?.weight ?? null
}

export async function getPersonalRecordsByUser(userId: number): Promise<PersonalRecordPublic[]> {
  const candidates = await fetchRecordCandidates(userId)
  const bestByExercise = groupBestRecordsByExerciseType(candidates)

  return [...bestByExercise.values()]
    .map(toPublicRecord)
    .sort((a, b) => a.exerciseName.localeCompare(b.exerciseName))
}

export async function getPersonalRecordByExerciseType(
  userId: number,
  exerciseTypeIdParam: string,
): Promise<PersonalRecordPublic | null> {
  const exerciseType = await findUserExerciseType(userId, exerciseTypeIdParam)

  if (!exerciseType) {
    throw new AppError(ErrorCode.EXERCISE_TYPE_NOT_FOUND, 404)
  }

  const candidates = await fetchRecordCandidates(userId, exerciseType.id)
  const best = pickBestRecord(candidates)

  return best ? toPublicRecord(best) : null
}
