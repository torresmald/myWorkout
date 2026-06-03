import type { MuscleGroup } from '@prisma/client'

import { ErrorCode } from '../constants/error-codes.constants.js'
import { exerciseCatalogSelect } from '../constants/exercise-catalog.constants.js'
import { prisma } from '../config/prisma.js'
import { AppError } from '../interfaces/app-error.interface.js'
import type {
  ExerciseCatalogPublic,
  ExerciseCatalogQuery,
} from '../interfaces/exercise-catalog.interface.js'

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
  imported: boolean,
): ExerciseCatalogPublic {
  return {
    id: exercise.id,
    slug: exercise.slug,
    nameEs: exercise.nameEs,
    nameEn: exercise.nameEn,
    descriptionEs: exercise.descriptionEs,
    descriptionEn: exercise.descriptionEn,
    muscleGroup: exercise.muscleGroup,
    mediaType: exercise.mediaType,
    mediaUrl: exercise.mediaUrl,
    imported,
  }
}

export async function getExerciseCatalog(
  userId: number,
  query: ExerciseCatalogQuery = {},
): Promise<ExerciseCatalogPublic[]> {
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
    mapCatalogExercise(exercise, importedCatalogIds.has(exercise.id)),
  )
}

export async function getExerciseCatalogById(
  userId: number,
  catalogId: number,
): Promise<ExerciseCatalogPublic> {
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

  return mapCatalogExercise(exercise, imported)
}
