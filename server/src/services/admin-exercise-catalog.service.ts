import type { CatalogMediaType, MuscleGroup } from '@prisma/client'

import { ErrorCode } from '../constants/error-codes.constants.js'
import { exerciseCatalogSelect } from '../constants/exercise-catalog.constants.js'
import { prisma } from '../config/prisma.js'
import { AppError } from '../interfaces/app-error.interface.js'
import type {
  AdminExerciseCatalogEntry,
  UpsertAdminExerciseCatalogBody,
} from '../interfaces/admin-exercise-catalog.interface.js'
import { isPrismaUniqueViolation } from '../utils/prisma-error.util.js'

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const MUSCLE_GROUPS = new Set<MuscleGroup>([
  'CHEST',
  'BACK',
  'LEGS',
  'SHOULDERS',
  'ARMS',
  'CORE',
  'FULL_BODY',
])
const MEDIA_TYPES = new Set<CatalogMediaType>(['IMAGE', 'GIF', 'VIDEO', 'YOUTUBE'])

const adminExerciseCatalogSelect = {
  ...exerciseCatalogSelect,
  sortOrder: true,
  active: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: { exerciseTypes: true },
  },
} as const

function trimOptional(value: string | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function validateSlug(slug: string | undefined, required: boolean): string | undefined {
  if (slug === undefined) {
    if (required) {
      throw new AppError(ErrorCode.CATALOG_SLUG_REQUIRED, 400)
    }

    return undefined
  }

  const normalized = slug.trim().toLowerCase()

  if (!normalized || !SLUG_REGEX.test(normalized)) {
    throw new AppError(ErrorCode.INVALID_CATALOG_SLUG, 400)
  }

  return normalized
}

function validateRequiredName(value: string | undefined, required: boolean): string | undefined {
  if (value === undefined) {
    if (required) {
      throw new AppError(ErrorCode.NAME_REQUIRED, 400)
    }

    return undefined
  }

  const trimmed = value.trim()

  if (!trimmed) {
    throw new AppError(ErrorCode.NAME_REQUIRED, 400)
  }

  return trimmed
}

function validateMuscleGroup(value: MuscleGroup | undefined, required: boolean): MuscleGroup | undefined {
  if (value === undefined) {
    if (required) {
      throw new AppError(ErrorCode.INVALID_MUSCLE_GROUP, 400)
    }

    return undefined
  }

  if (!MUSCLE_GROUPS.has(value)) {
    throw new AppError(ErrorCode.INVALID_MUSCLE_GROUP, 400)
  }

  return value
}

function validateMediaType(
  value: CatalogMediaType | undefined,
  required: boolean,
): CatalogMediaType | undefined {
  if (value === undefined) {
    if (required) {
      throw new AppError(ErrorCode.INVALID_CATALOG_MEDIA_TYPE, 400)
    }

    return undefined
  }

  if (!MEDIA_TYPES.has(value)) {
    throw new AppError(ErrorCode.INVALID_CATALOG_MEDIA_TYPE, 400)
  }

  return value
}

function validateSortOrder(value: number | undefined): number | undefined {
  if (value === undefined) {
    return undefined
  }

  if (!Number.isInteger(value)) {
    throw new AppError(ErrorCode.INVALID_SORT_ORDER, 400)
  }

  return value
}

function mapAdminEntry(
  exercise: {
    id: number
    slug: string
    nameEs: string
    nameEn: string
    descriptionEs: string | null
    descriptionEn: string | null
    muscleGroup: MuscleGroup
    mediaType: CatalogMediaType
    mediaUrl: string | null
    sortOrder: number
    active: boolean
    createdAt: Date
    updatedAt: Date
    _count: { exerciseTypes: number }
  },
): AdminExerciseCatalogEntry {
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
    sortOrder: exercise.sortOrder,
    active: exercise.active,
    importCount: exercise._count.exerciseTypes,
    createdAt: exercise.createdAt,
    updatedAt: exercise.updatedAt,
  }
}

async function findCatalogOrThrow(catalogId: number) {
  const exercise = await prisma.exerciseCatalog.findUnique({
    where: { id: catalogId },
    select: adminExerciseCatalogSelect,
  })

  if (!exercise) {
    throw new AppError(ErrorCode.CATALOG_EXERCISE_NOT_FOUND, 404)
  }

  return exercise
}

export async function listAdminExerciseCatalog(): Promise<AdminExerciseCatalogEntry[]> {
  const exercises = await prisma.exerciseCatalog.findMany({
    select: adminExerciseCatalogSelect,
    orderBy: [{ sortOrder: 'asc' }, { nameEs: 'asc' }],
  })

  return exercises.map(mapAdminEntry)
}

export async function createAdminExerciseCatalog(
  body: UpsertAdminExerciseCatalogBody,
): Promise<AdminExerciseCatalogEntry> {
  const slug = validateSlug(body.slug, true)!
  const nameEs = validateRequiredName(body.nameEs, true)!
  const nameEn = validateRequiredName(body.nameEn, true)!
  const muscleGroup = validateMuscleGroup(body.muscleGroup, true)!
  const mediaType = validateMediaType(body.mediaType, false) ?? 'IMAGE'
  const sortOrder = validateSortOrder(body.sortOrder) ?? 0

  try {
    const created = await prisma.exerciseCatalog.create({
      data: {
        slug,
        nameEs,
        nameEn,
        descriptionEs: trimOptional(body.descriptionEs),
        descriptionEn: trimOptional(body.descriptionEn),
        muscleGroup,
        mediaType,
        mediaUrl: trimOptional(body.mediaUrl),
        sortOrder,
        active: body.active ?? true,
      },
      select: adminExerciseCatalogSelect,
    })

    return mapAdminEntry(created)
  } catch (error) {
    if (isPrismaUniqueViolation(error)) {
      throw new AppError(ErrorCode.DUPLICATE_CATALOG_SLUG, 409)
    }

    throw error
  }
}

export async function updateAdminExerciseCatalog(
  catalogId: number,
  body: UpsertAdminExerciseCatalogBody,
): Promise<AdminExerciseCatalogEntry> {
  await findCatalogOrThrow(catalogId)

  const slug = validateSlug(body.slug, false)
  const nameEs = body.nameEs !== undefined ? validateRequiredName(body.nameEs, true) : undefined
  const nameEn = body.nameEn !== undefined ? validateRequiredName(body.nameEn, true) : undefined
  const muscleGroup = validateMuscleGroup(body.muscleGroup, false)
  const mediaType = validateMediaType(body.mediaType, false)
  const sortOrder = validateSortOrder(body.sortOrder)

  if (
    slug === undefined &&
    nameEs === undefined &&
    nameEn === undefined &&
    body.descriptionEs === undefined &&
    body.descriptionEn === undefined &&
    muscleGroup === undefined &&
    mediaType === undefined &&
    body.mediaUrl === undefined &&
    sortOrder === undefined &&
    body.active === undefined
  ) {
    throw new AppError(ErrorCode.NO_DATA_TO_UPDATE, 400)
  }

  try {
    const updated = await prisma.exerciseCatalog.update({
      where: { id: catalogId },
      data: {
        ...(slug !== undefined ? { slug } : {}),
        ...(nameEs !== undefined ? { nameEs } : {}),
        ...(nameEn !== undefined ? { nameEn } : {}),
        ...(body.descriptionEs !== undefined ? { descriptionEs: trimOptional(body.descriptionEs) } : {}),
        ...(body.descriptionEn !== undefined ? { descriptionEn: trimOptional(body.descriptionEn) } : {}),
        ...(muscleGroup !== undefined ? { muscleGroup } : {}),
        ...(mediaType !== undefined ? { mediaType } : {}),
        ...(body.mediaUrl !== undefined ? { mediaUrl: trimOptional(body.mediaUrl) } : {}),
        ...(sortOrder !== undefined ? { sortOrder } : {}),
        ...(body.active !== undefined ? { active: body.active } : {}),
      },
      select: adminExerciseCatalogSelect,
    })

    return mapAdminEntry(updated)
  } catch (error) {
    if (isPrismaUniqueViolation(error)) {
      throw new AppError(ErrorCode.DUPLICATE_CATALOG_SLUG, 409)
    }

    throw error
  }
}

export async function deleteAdminExerciseCatalog(catalogId: number): Promise<AdminExerciseCatalogEntry> {
  const existing = await findCatalogOrThrow(catalogId)

  if (existing._count.exerciseTypes > 0) {
    const updated = await prisma.exerciseCatalog.update({
      where: { id: catalogId },
      data: { active: false },
      select: adminExerciseCatalogSelect,
    })

    return mapAdminEntry(updated)
  }

  const deleted = await prisma.exerciseCatalog.delete({
    where: { id: catalogId },
    select: adminExerciseCatalogSelect,
  })

  return mapAdminEntry(deleted)
}
