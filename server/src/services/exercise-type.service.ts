import { ErrorCode } from '../constants/error-codes.constants.js'
import { getMuscleGroupLabel } from '../constants/exercise-catalog.constants.js'
import {
  exerciseTypeSelect,
  mapExerciseTypePublic,
} from '../constants/exercise-type.constants.js'
import { prisma } from '../config/prisma.js'
import { AppError } from '../interfaces/app-error.interface.js'
import type {
  CreateExerciseTypeBody,
  ExerciseTypePublic,
  UpdateExerciseTypeBody,
} from '../interfaces/exercise-type.interface.js'
import { findUserExerciseType } from '../utils/exercise-type.util.js'
import { parseAppLocale } from '../utils/locale.util.js'
import { isPrismaUniqueViolation } from '../utils/prisma-error.util.js'

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

async function handleUniqueViolation<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    if (isPrismaUniqueViolation(error)) {
      throw new AppError(ErrorCode.DUPLICATE_EXERCISE_TYPE_NAME, 409)
    }

    throw error
  }
}

export async function getExerciseTypesByUser(userId: number): Promise<ExerciseTypePublic[]> {
  const exercises = await prisma.exerciseType.findMany({
    where: { userId },
    select: exerciseTypeSelect,
    orderBy: { name: 'asc' },
  })

  return exercises.map(mapExerciseTypePublic)
}

export async function createExerciseType(
  userId: number,
  body: CreateExerciseTypeBody,
): Promise<ExerciseTypePublic> {
  const trimmedName = requireName(body.name)

  const created = await handleUniqueViolation(() =>
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

  return mapExerciseTypePublic(created)
}

export async function importExerciseTypeFromCatalog(
  userId: number,
  catalogId: number,
): Promise<ExerciseTypePublic> {
  const existingImported = await prisma.exerciseType.findFirst({
    where: {
      userId,
      catalogExerciseId: catalogId,
    },
    select: exerciseTypeSelect,
  })

  if (existingImported) {
    return mapExerciseTypePublic(existingImported)
  }

  const [catalogExercise, user] = await Promise.all([
    prisma.exerciseCatalog.findFirst({
      where: {
        id: catalogId,
        active: true,
      },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { locale: true },
    }),
  ])

  if (!catalogExercise) {
    throw new AppError(ErrorCode.CATALOG_EXERCISE_NOT_FOUND, 404)
  }

  if (!user) {
    throw new AppError(ErrorCode.USER_NOT_FOUND, 404)
  }

  const locale = parseAppLocale(user.locale)
  const name = locale === 'es' ? catalogExercise.nameEs : catalogExercise.nameEn
  const description = locale === 'es' ? catalogExercise.descriptionEs : catalogExercise.descriptionEn
  const muscleGroup = getMuscleGroupLabel(catalogExercise.muscleGroup, locale)

  const created = await handleUniqueViolation(() =>
    prisma.exerciseType.create({
      data: {
        userId,
        catalogExerciseId: catalogExercise.id,
        name,
        description,
        muscleGroup,
      },
      select: exerciseTypeSelect,
    }),
  )

  return mapExerciseTypePublic(created)
}

export async function updateExerciseType(
  userId: number,
  id: string,
  body: UpdateExerciseTypeBody,
): Promise<ExerciseTypePublic> {
  const existing = await findUserExerciseType(userId, id)

  if (!existing) {
    throw new AppError(ErrorCode.EXERCISE_TYPE_NOT_FOUND, 404)
  }

  const trimmedName = requireName(body.name)

  const updated = await handleUniqueViolation(() =>
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

  return mapExerciseTypePublic(updated)
}

export async function deleteExerciseType(
  userId: number,
  id: string,
): Promise<ExerciseTypePublic> {
  const existing = await findUserExerciseType(userId, id)

  if (!existing) {
    throw new AppError(ErrorCode.EXERCISE_TYPE_NOT_FOUND, 404)
  }

  await prisma.exerciseType.delete({
    where: { id: existing.id },
  })

  return existing
}
