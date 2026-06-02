import { WorkoutStatus } from '@prisma/client'

import { ErrorCode } from '../constants/error-codes.constants.js'
import {
  workoutSelect,
  workoutSessionExerciseSelect,
  workoutSetSelect,
} from '../constants/workout.constants.js'
import { prisma } from '../config/prisma.js'
import { AppError } from '../interfaces/app-error.interface.js'
import type {
  UpdateWorkoutSetBody,
  WorkoutSessionDetail,
  WorkoutSessionFinishResult,
  WorkoutSetPublic,
  WorkoutSetUpdateResult,
} from '../interfaces/workout-set.interface.js'
import {
  parseOptionalWeight,
  requirePositiveInteger,
} from '../utils/workout-exercise.util.js'
import {
  computeRollupFromSets,
  parseSetNumber,
} from '../utils/workout-set.util.js'
import { getHistoricalMaxWeight } from '../services/personal-record.service.js'
import {
  findUserWorkout,
  parseWorkoutExerciseId,
  parseWorkoutId,
} from '../utils/workout.util.js'

async function requireUserWorkoutWithExercises(userId: number, workoutId: string) {
  const parsedWorkoutId = parseWorkoutId(workoutId)

  if (!parsedWorkoutId) {
    throw new AppError(ErrorCode.WORKOUT_NOT_FOUND, 404)
  }

  const workout = await prisma.workout.findFirst({
    where: { id: parsedWorkoutId, userId },
    select: {
      ...workoutSelect,
      exercises: {
        select: workoutExerciseSelectFields(),
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      },
    },
  })

  if (!workout) {
    throw new AppError(ErrorCode.WORKOUT_NOT_FOUND, 404)
  }

  return workout
}

function workoutExerciseSelectFields() {
  return {
    id: true,
    workoutId: true,
    exerciseTypeId: true,
    sets: true,
    reps: true,
    restSeconds: true,
    weight: true,
    sortOrder: true,
    createdAt: true,
    updatedAt: true,
    exerciseType: {
      select: {
        id: true,
        name: true,
        muscleGroup: true,
      },
    },
  } as const
}

async function fetchSessionDetail(workoutId: number): Promise<WorkoutSessionDetail> {
  const workout = await prisma.workout.findUniqueOrThrow({
    where: { id: workoutId },
    select: {
      ...workoutSelect,
      exercises: {
        select: workoutSessionExerciseSelect,
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      },
    },
  })

  return workout as WorkoutSessionDetail
}

function buildSetCreateRows(
  exercises: Array<{ id: number; sets: number; reps: number; weight: number | null }>,
) {
  return exercises.flatMap((exercise) =>
    Array.from({ length: exercise.sets }, (_, index) => ({
      workoutExerciseId: exercise.id,
      setNumber: index + 1,
      reps: exercise.reps,
      weight: exercise.weight,
    })),
  )
}

export async function getWorkoutSession(
  userId: number,
  workoutId: string,
): Promise<WorkoutSessionDetail> {
  const workout = await findUserWorkout(userId, workoutId)

  if (!workout) {
    throw new AppError(ErrorCode.WORKOUT_NOT_FOUND, 404)
  }

  const parsedWorkoutId = parseWorkoutId(workoutId)!

  return fetchSessionDetail(parsedWorkoutId)
}

export async function startWorkoutSession(
  userId: number,
  workoutId: string,
): Promise<WorkoutSessionDetail> {
  const workout = await requireUserWorkoutWithExercises(userId, workoutId)

  if (workout.status === WorkoutStatus.COMPLETED) {
    throw new AppError(ErrorCode.WORKOUT_ALREADY_COMPLETED, 409)
  }

  if (workout.status === WorkoutStatus.IN_PROGRESS) {
    return fetchSessionDetail(workout.id)
  }

  if (workout.exercises.length === 0) {
    throw new AppError(ErrorCode.WORKOUT_HAS_NO_EXERCISES, 400)
  }

  const setRows = buildSetCreateRows(workout.exercises)

  if (setRows.length === 0) {
    throw new AppError(ErrorCode.WORKOUT_HAS_NO_EXERCISES, 400)
  }

  await prisma.$transaction(async (tx) => {
    await tx.workoutSet.createMany({
      data: setRows,
    })

    await tx.workout.update({
      where: { id: workout.id },
      data: {
        status: WorkoutStatus.IN_PROGRESS,
        startedAt: new Date(),
      },
    })
  })

  return fetchSessionDetail(workout.id)
}

export async function updateWorkoutSet(
  userId: number,
  workoutId: string,
  exerciseId: string,
  setNumberParam: string,
  body: UpdateWorkoutSetBody,
): Promise<WorkoutSetUpdateResult> {
  const workout = await findUserWorkout(userId, workoutId)

  if (!workout) {
    throw new AppError(ErrorCode.WORKOUT_NOT_FOUND, 404)
  }

  if (workout.status !== WorkoutStatus.IN_PROGRESS) {
    throw new AppError(ErrorCode.WORKOUT_NOT_IN_PROGRESS, 409)
  }

  const parsedExerciseId = parseWorkoutExerciseId(exerciseId)
  const setNumber = parseSetNumber(setNumberParam)

  if (!parsedExerciseId || !setNumber) {
    throw new AppError(ErrorCode.WORKOUT_SET_NOT_FOUND, 404)
  }

  const parsedWorkoutId = parseWorkoutId(workoutId)!

  const existing = await prisma.workoutSet.findFirst({
    where: {
      setNumber,
      workoutExercise: {
        id: parsedExerciseId,
        workoutId: parsedWorkoutId,
        workout: { userId },
      },
    },
    select: {
      ...workoutSetSelect,
      workoutExercise: {
        select: {
          exerciseTypeId: true,
        },
      },
    },
  })

  if (!existing) {
    throw new AppError(ErrorCode.WORKOUT_SET_NOT_FOUND, 404)
  }

  const reps =
    body.reps !== undefined ? requirePositiveInteger(body.reps, 'reps') : existing.reps

  const weight =
    body.weight !== undefined ? parseOptionalWeight(body.weight) : existing.weight

  let completedAt = existing.completedAt

  if (body.completed === true) {
    completedAt = new Date()
  } else if (body.completed === false) {
    completedAt = null
  }

  let isPersonalRecord = false
  let previousMaxWeight: number | null = null

  if (body.completed === true && weight !== null && weight > 0) {
    previousMaxWeight = await getHistoricalMaxWeight(
      userId,
      existing.workoutExercise.exerciseTypeId,
      existing.id,
    )
    isPersonalRecord = previousMaxWeight === null || weight > previousMaxWeight
  }

  const updatedSet = await prisma.workoutSet.update({
    where: { id: existing.id },
    data: {
      reps,
      weight,
      completedAt,
    },
    select: workoutSetSelect,
  })

  return {
    set: updatedSet,
    isPersonalRecord,
    previousMaxWeight,
  }
}

export async function finishWorkoutSession(
  userId: number,
  workoutId: string,
): Promise<WorkoutSessionFinishResult> {
  const workout = await findUserWorkout(userId, workoutId)

  if (!workout) {
    throw new AppError(ErrorCode.WORKOUT_NOT_FOUND, 404)
  }

  if (workout.status !== WorkoutStatus.IN_PROGRESS) {
    throw new AppError(ErrorCode.WORKOUT_NOT_IN_PROGRESS, 409)
  }

  const parsedWorkoutId = parseWorkoutId(workoutId)!

  const session = await fetchSessionDetail(parsedWorkoutId)
  const completedAt = new Date()

  await prisma.$transaction(async (tx) => {
    for (const exercise of session.exercises) {
      const rollup = computeRollupFromSets(exercise.workoutSets)

      if (rollup) {
        await tx.workoutExercise.update({
          where: { id: exercise.id },
          data: rollup,
        })
      }
    }

    await tx.workout.update({
      where: { id: parsedWorkoutId },
      data: {
        status: WorkoutStatus.COMPLETED,
        completedAt,
      },
    })
  })

  return {
    id: parsedWorkoutId,
    name: session.name,
    status: WorkoutStatus.COMPLETED,
    completedAt,
  }
}
