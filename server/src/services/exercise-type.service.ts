import { exerciseTypeSelect } from '../constants/exercise-type.constants.js'
import { prisma } from '../config/prisma.js'
import { AppError } from '../interfaces/app-error.interface.js'
import type {
  CreateExerciseTypeBody,
  ExerciseTypePublic,
  UpdateExerciseTypeBody,
} from '../interfaces/exercise-type.interface.js'
import { findUserExerciseType } from '../utils/exercise-type.util.js'
import { isPrismaUniqueViolation } from '../utils/prisma-error.util.js'

const DUPLICATE_NAME_MESSAGE = 'Ya existe un ejercicio con ese nombre'

function trimOptional(value?: string): string | null {
  return value?.trim() || null
}

function requireName(name?: string): string {
  const trimmedName = name?.trim()

  if (!trimmedName) {
    throw new AppError('El nombre es obligatorio', 400)
  }

  return trimmedName
}

async function handleUniqueViolation<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    if (isPrismaUniqueViolation(error)) {
      throw new AppError(DUPLICATE_NAME_MESSAGE, 409)
    }

    throw error
  }
}

export async function getExerciseTypesByUser(userId: number): Promise<ExerciseTypePublic[]> {
  return prisma.exerciseType.findMany({
    where: { userId },
    select: exerciseTypeSelect,
    orderBy: { name: 'asc' },
  })
}

export async function createExerciseType(
  userId: number,
  body: CreateExerciseTypeBody,
): Promise<ExerciseTypePublic> {
  const trimmedName = requireName(body.name)

  return handleUniqueViolation(() =>
    prisma.exerciseType.create({
      data: {
        userId,
        name: trimmedName,
        description: trimOptional(body.description),
        muscleGroup: trimOptional(body.muscleGroup),
      },
      select: exerciseTypeSelect,
    }),
  )
}

export async function updateExerciseType(
  userId: number,
  id: string,
  body: UpdateExerciseTypeBody,
): Promise<ExerciseTypePublic> {
  const existing = await findUserExerciseType(userId, id)

  if (!existing) {
    throw new AppError('Ejercicio no encontrado', 404)
  }

  const trimmedName = requireName(body.name)

  return handleUniqueViolation(() =>
    prisma.exerciseType.update({
      where: { id: existing.id },
      data: {
        name: trimmedName,
        description: trimOptional(body.description),
        muscleGroup: trimOptional(body.muscleGroup),
      },
      select: exerciseTypeSelect,
    }),
  )
}

export async function deleteExerciseType(
  userId: number,
  id: string,
): Promise<ExerciseTypePublic> {
  const existing = await findUserExerciseType(userId, id)

  if (!existing) {
    throw new AppError('Ejercicio no encontrado', 404)
  }

  await prisma.exerciseType.delete({
    where: { id: existing.id },
  })

  return existing
}
