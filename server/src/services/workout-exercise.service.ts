import { ErrorCode } from '../constants/error-codes.constants.js'
import { workoutExerciseSelect } from '../constants/workout.constants.js'
import { prisma } from '../config/prisma.js'
import { AppError } from '../interfaces/app-error.interface.js'
import type {
  CreateWorkoutExerciseBody,
  UpdateWorkoutExerciseBody,
  WorkoutExercisePublic,
} from '../interfaces/workout.interface.js'
import { findUserExerciseType } from '../utils/exercise-type.util.js'
import { isPrismaForeignKeyViolation } from '../utils/prisma-error.util.js'
import {
  buildWorkoutExerciseCreateData,
  parseOptionalWeight,
  requireNonNegativeInteger,
  requirePositiveInteger,
} from '../utils/workout-exercise.util.js'
import {
  findUserWorkout,
  parseWorkoutExerciseId,
  parseWorkoutId,
} from '../utils/workout.util.js'

async function findUserWorkoutExercise(
  userId: number,
  workoutId: string,
  exerciseId: string,
): Promise<WorkoutExercisePublic | null> {
  const parsedWorkoutId = parseWorkoutId(workoutId)
  const parsedExerciseId = parseWorkoutExerciseId(exerciseId)

  if (!parsedWorkoutId || !parsedExerciseId) {
    return null
  }

  return prisma.workoutExercise.findFirst({
    where: {
      id: parsedExerciseId,
      workoutId: parsedWorkoutId,
      workout: { userId },
    },
    select: workoutExerciseSelect,
  })
}

async function requireUserWorkout(userId: number, workoutId: string) {
  const workout = await findUserWorkout(userId, workoutId)

  if (!workout) {
    throw new AppError(ErrorCode.WORKOUT_NOT_FOUND, 404)
  }

  return workout
}

async function requireUserExerciseType(userId: number, exerciseTypeId: number) {
  const exerciseType = await findUserExerciseType(userId, String(exerciseTypeId))

  if (!exerciseType) {
    throw new AppError(ErrorCode.EXERCISE_TYPE_NOT_FOUND, 404)
  }

  return exerciseType
}

async function handleForeignKeyViolation<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    if (isPrismaForeignKeyViolation(error)) {
      throw new AppError(ErrorCode.EXERCISE_TYPE_NOT_FOUND, 404)
    }

    throw error
  }
}

export async function getWorkoutExercises(
  userId: number,
  workoutId: string,
): Promise<WorkoutExercisePublic[]> {
  await requireUserWorkout(userId, workoutId)

  const parsedWorkoutId = parseWorkoutId(workoutId)

  return prisma.workoutExercise.findMany({
    where: { workoutId: parsedWorkoutId! },
    select: workoutExerciseSelect,
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
  })
}

export async function createWorkoutExercise(
  userId: number,
  workoutId: string,
  body: CreateWorkoutExerciseBody,
): Promise<WorkoutExercisePublic> {
  const workout = await requireUserWorkout(userId, workoutId)
  const exerciseData = buildWorkoutExerciseCreateData(body)

  await requireUserExerciseType(userId, exerciseData.exerciseTypeId)

  return handleForeignKeyViolation(() =>
    prisma.workoutExercise.create({
      data: {
        workoutId: workout.id,
        ...exerciseData,
      },
      select: workoutExerciseSelect,
    }),
  )
}

export async function updateWorkoutExercise(
  userId: number,
  workoutId: string,
  exerciseId: string,
  body: UpdateWorkoutExerciseBody,
): Promise<WorkoutExercisePublic> {
  const existing = await findUserWorkoutExercise(userId, workoutId, exerciseId)

  if (!existing) {
    throw new AppError(ErrorCode.WORKOUT_EXERCISE_NOT_FOUND, 404)
  }

  const exerciseTypeId =
    body.exerciseTypeId !== undefined
      ? requirePositiveInteger(body.exerciseTypeId, 'exerciseTypeId')
      : existing.exerciseTypeId

  if (body.exerciseTypeId !== undefined) {
    await requireUserExerciseType(userId, exerciseTypeId)
  }

  return handleForeignKeyViolation(() =>
    prisma.workoutExercise.update({
      where: { id: existing.id },
      data: {
        exerciseTypeId,
        sets:
          body.sets !== undefined
            ? requirePositiveInteger(body.sets, 'sets')
            : existing.sets,
        reps:
          body.reps !== undefined
            ? requirePositiveInteger(body.reps, 'reps')
            : existing.reps,
        restSeconds:
          body.restSeconds !== undefined
            ? requireNonNegativeInteger(body.restSeconds, 'restSeconds', 0)
            : existing.restSeconds,
        weight:
          body.weight !== undefined ? parseOptionalWeight(body.weight) : existing.weight,
        sortOrder:
          body.sortOrder !== undefined
            ? requireNonNegativeInteger(body.sortOrder, 'sortOrder', 0)
            : existing.sortOrder,
      },
      select: workoutExerciseSelect,
    }),
  )
}

export async function deleteWorkoutExercise(
  userId: number,
  workoutId: string,
  exerciseId: string,
): Promise<WorkoutExercisePublic> {
  const existing = await findUserWorkoutExercise(userId, workoutId, exerciseId)

  if (!existing) {
    throw new AppError(ErrorCode.WORKOUT_EXERCISE_NOT_FOUND, 404)
  }

  await prisma.workoutExercise.delete({
    where: { id: existing.id },
  })

  return existing
}
