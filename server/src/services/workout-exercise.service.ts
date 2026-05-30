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
  findUserWorkout,
  parseWorkoutExerciseId,
  parseWorkoutId,
} from '../utils/workout.util.js'

function requirePositiveInteger(value: number | undefined, field: string): number {
  if (value === undefined || !Number.isInteger(value) || value <= 0) {
    throw new AppError(`${field} debe ser un entero positivo`, 400)
  }

  return value
}

function requireNonNegativeInteger(value: number | undefined, field: string, defaultValue: number): number {
  if (value === undefined) {
    return defaultValue
  }

  if (!Number.isInteger(value) || value < 0) {
    throw new AppError(`${field} debe ser un entero mayor o igual a 0`, 400)
  }

  return value
}

function parseOptionalWeight(weight?: number | null): number | null {
  if (weight === undefined || weight === null) {
    return null
  }

  if (typeof weight !== 'number' || weight <= 0) {
    throw new AppError('El peso debe ser un número positivo', 400)
  }

  return weight
}

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
    throw new AppError('Entrenamiento no encontrado', 404)
  }

  return workout
}

async function requireUserExerciseType(userId: number, exerciseTypeId: number) {
  const exerciseType = await findUserExerciseType(userId, String(exerciseTypeId))

  if (!exerciseType) {
    throw new AppError('Tipo de ejercicio no encontrado', 404)
  }

  return exerciseType
}

function buildWorkoutExerciseData(body: CreateWorkoutExerciseBody, exerciseTypeId: number) {
  return {
    exerciseTypeId,
    sets: requirePositiveInteger(body.sets, 'Las series'),
    reps: requirePositiveInteger(body.reps, 'Las repeticiones'),
    restSeconds: requireNonNegativeInteger(body.restSeconds, 'El descanso', 0),
    weight: parseOptionalWeight(body.weight),
    sortOrder: requireNonNegativeInteger(body.sortOrder, 'El orden', 0),
  }
}

async function handleForeignKeyViolation<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    if (isPrismaForeignKeyViolation(error)) {
      throw new AppError('Tipo de ejercicio no encontrado', 404)
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
  const exerciseTypeId = requirePositiveInteger(body.exerciseTypeId, 'El tipo de ejercicio')

  await requireUserExerciseType(userId, exerciseTypeId)

  return handleForeignKeyViolation(() =>
    prisma.workoutExercise.create({
      data: {
        workoutId: workout.id,
        ...buildWorkoutExerciseData(body, exerciseTypeId),
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
    throw new AppError('Ejercicio del entrenamiento no encontrado', 404)
  }

  const exerciseTypeId =
    body.exerciseTypeId !== undefined
      ? requirePositiveInteger(body.exerciseTypeId, 'El tipo de ejercicio')
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
            ? requirePositiveInteger(body.sets, 'Las series')
            : existing.sets,
        reps:
          body.reps !== undefined
            ? requirePositiveInteger(body.reps, 'Las repeticiones')
            : existing.reps,
        restSeconds:
          body.restSeconds !== undefined
            ? requireNonNegativeInteger(body.restSeconds, 'El descanso', 0)
            : existing.restSeconds,
        weight:
          body.weight !== undefined ? parseOptionalWeight(body.weight) : existing.weight,
        sortOrder:
          body.sortOrder !== undefined
            ? requireNonNegativeInteger(body.sortOrder, 'El orden', 0)
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
    throw new AppError('Ejercicio del entrenamiento no encontrado', 404)
  }

  await prisma.workoutExercise.delete({
    where: { id: existing.id },
  })

  return existing
}
