import { ErrorCode } from '../constants/error-codes.constants.js'
import { workoutExerciseSelect, workoutSelect } from '../constants/workout.constants.js'
import { prisma } from '../config/prisma.js'
import { AppError } from '../interfaces/app-error.interface.js'
import type {
  CreateWorkoutBody,
  UpdateWorkoutBody,
  WorkoutCreateResult,
  WorkoutPublic,
} from '../interfaces/workout.interface.js'
import { buildWorkoutExerciseCreateData } from '../utils/workout-exercise.util.js'
import { assertUserOwnsExerciseTypes } from '../utils/exercise-type.util.js'
import { findUserWorkout } from '../utils/workout.util.js'

function trimOptional(value?: string): string | null {
  return value?.trim() || null
}

function requireName(name?: string): string {
  const trimmedName = name?.trim()

  if (!trimmedName) {
    throw new AppError(ErrorCode.NAME_REQUIRED, 400)
  }

  return trimmedName
}

function parseWorkoutDate(date?: string): Date {
  if (!date) {
    return new Date()
  }

  const parsed = new Date(date)

  if (Number.isNaN(parsed.getTime())) {
    throw new AppError(ErrorCode.INVALID_DATE, 400)
  }

  return parsed
}

export async function getWorkoutsByUser(userId: number): Promise<WorkoutPublic[]> {
  return prisma.workout.findMany({
    where: { userId },
    select: workoutSelect,
    orderBy: [{ date: 'desc' }, { name: 'asc' }],
  })
}

export async function createWorkout(userId: number, body: CreateWorkoutBody): Promise<WorkoutCreateResult> {
  const trimmedName = requireName(body.name)
  const parsedDate = parseWorkoutDate(body.date)
  const notes = trimOptional(body.notes)

  if (body.exercises === undefined) {
    return prisma.workout.create({
      data: {
        userId,
        name: trimmedName,
        date: parsedDate,
        notes,
      },
      select: workoutSelect,
    })
  }

  if (!Array.isArray(body.exercises)) {
    throw new AppError(ErrorCode.INVALID_EXERCISES_PAYLOAD, 400)
  }

  if (body.exercises.length === 0) {
    return prisma.workout.create({
      data: {
        userId,
        name: trimmedName,
        date: parsedDate,
        notes,
      },
      select: workoutSelect,
    })
  }

  const exercisePayloads = body.exercises.map((exercise, index) =>
    buildWorkoutExerciseCreateData(exercise, index),
  )

  const uniqueExerciseTypeIds = [...new Set(exercisePayloads.map((exercise) => exercise.exerciseTypeId))]
  await assertUserOwnsExerciseTypes(userId, uniqueExerciseTypeIds)

  return prisma.$transaction(async (tx) => {
    const workout = await tx.workout.create({
      data: {
        userId,
        name: trimmedName,
        date: parsedDate,
        notes,
        exercises: {
          create: exercisePayloads,
        },
      },
      select: {
        ...workoutSelect,
        exercises: {
          select: workoutExerciseSelect,
          orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
        },
      },
    })

    const { exercises, ...workoutData } = workout

    return {
      ...workoutData,
      exercises,
    }
  })
}

export async function updateWorkout(
  userId: number,
  id: string,
  body: UpdateWorkoutBody,
): Promise<WorkoutPublic> {
  const existing = await findUserWorkout(userId, id)

  if (!existing) {
    throw new AppError(ErrorCode.WORKOUT_NOT_FOUND, 404)
  }

  const trimmedName = requireName(body.name)

  return prisma.workout.update({
    where: { id: existing.id },
    data: {
      name: trimmedName,
      date: body.date ? parseWorkoutDate(body.date) : existing.date,
      notes: trimOptional(body.notes),
    },
    select: workoutSelect,
  })
}

export async function deleteWorkout(userId: number, id: string): Promise<WorkoutPublic> {
  const existing = await findUserWorkout(userId, id)

  if (!existing) {
    throw new AppError(ErrorCode.WORKOUT_NOT_FOUND, 404)
  }

  await prisma.workout.delete({
    where: { id: existing.id },
  })

  return existing
}
