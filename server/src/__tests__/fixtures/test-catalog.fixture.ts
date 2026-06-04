import type { CatalogMediaType, MuscleGroup } from '@prisma/client'

import { getTestPrisma } from '../helpers/test-db.js'

interface SeedCatalogExerciseOptions {
  slug?: string
  nameEs?: string
  nameEn?: string
  descriptionEs?: string | null
  descriptionEn?: string | null
  muscleGroup?: MuscleGroup
  mediaType?: CatalogMediaType
  mediaUrl?: string | null
  sortOrder?: number
  active?: boolean
}

export async function seedTestCatalogExercise(options: SeedCatalogExerciseOptions = {}) {
  const suffix = crypto.randomUUID().slice(0, 8)

  return getTestPrisma().exerciseCatalog.create({
    data: {
      slug: options.slug ?? `test-exercise-${suffix}`,
      nameEs: options.nameEs ?? 'Press banca',
      nameEn: options.nameEn ?? 'Bench press',
      descriptionEs: options.descriptionEs ?? null,
      descriptionEn: options.descriptionEn ?? null,
      muscleGroup: options.muscleGroup ?? 'CHEST',
      mediaType: options.mediaType ?? 'IMAGE',
      mediaUrl: options.mediaUrl ?? null,
      sortOrder: options.sortOrder ?? 0,
      active: options.active ?? true,
    },
  })
}
