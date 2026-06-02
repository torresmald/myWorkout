import type { MuscleGroup } from '@prisma/client'

import { ErrorCode } from '../constants/error-codes.constants.js'
import {
  exerciseCatalogSelect,
  getMuscleGroupLabel,
} from '../constants/exercise-catalog.constants.js'
import { prisma } from '../config/prisma.js'
import type { AppLocale } from '../constants/locale.constants.js'
import { AppError } from '../interfaces/app-error.interface.js'
import type {
  ExerciseCatalogPublic,
  ExerciseCatalogQuery,
} from '../interfaces/exercise-catalog.interface.js'
import { parseAppLocale } from '../utils/locale.util.js'

type CatalogRecord = {
  id: number
  slug: string
  nameEs: string
  nameEn: string
  descriptionEs: string | null
  descriptionEn: string | null
  muscleGroup: MuscleGroup
  mediaType: ExerciseCatalogPublic['mediaType']
  mediaUrl: string | null
}

function mapCatalogExercise(
  exercise: CatalogRecord,
  locale: AppLocale,
  imported: boolean,
): ExerciseCatalogPublic {
  return {
    id: exercise.id,
    slug: exercise.slug,
    name: locale === 'es' ? exercise.nameEs : exercise.nameEn,
    description: locale === 'es' ? exercise.descriptionEs : exercise.descriptionEn,
    muscleGroup: exercise.muscleGroup,
    muscleGroupLabel: getMuscleGroupLabel(exercise.muscleGroup, locale),
    mediaType: exercise.mediaType,
    mediaUrl: exercise.mediaUrl,
    imported,
  }
}

async function getUserLocale(userId: number): Promise<AppLocale> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { locale: true },
  })

  if (!user) {
    throw new AppError(ErrorCode.USER_NOT_FOUND, 404)
  }

  return parseAppLocale(user.locale)
}

export async function getExerciseCatalog(
  userId: number,
  query: ExerciseCatalogQuery = {},
): Promise<ExerciseCatalogPublic[]> {
  const locale = await getUserLocale(userId)

  const importedCatalogIds = new Set(
    (
      await prisma.exerciseType.findMany({
        where: {
          userId,
          catalogExerciseId: { not: null },
        },
        select: { catalogExerciseId: true },
      })
    )
      .map((entry) => entry.catalogExerciseId)
      .filter((id): id is number => id !== null),
  )

  const exercises = await prisma.exerciseCatalog.findMany({
    where: {
      active: true,
      ...(query.muscleGroup ? { muscleGroup: query.muscleGroup } : {}),
    },
    select: exerciseCatalogSelect,
    orderBy: [{ sortOrder: 'asc' }, { nameEs: 'asc' }],
  })

  return exercises.map((exercise) =>
    mapCatalogExercise(exercise, locale, importedCatalogIds.has(exercise.id)),
  )
}

export async function getExerciseCatalogById(
  userId: number,
  catalogId: number,
): Promise<ExerciseCatalogPublic> {
  const locale = await getUserLocale(userId)

  const exercise = await prisma.exerciseCatalog.findFirst({
    where: {
      id: catalogId,
      active: true,
    },
    select: exerciseCatalogSelect,
  })

  if (!exercise) {
    throw new AppError(ErrorCode.CATALOG_EXERCISE_NOT_FOUND, 404)
  }

  const imported = Boolean(
    await prisma.exerciseType.findFirst({
      where: {
        userId,
        catalogExerciseId: catalogId,
      },
      select: { id: true },
    }),
  )

  return mapCatalogExercise(exercise, locale, imported)
}
