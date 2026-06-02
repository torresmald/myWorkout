import type { MuscleGroup } from '@prisma/client'

import type { AppLocale } from './locale.constants.js'

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, Record<AppLocale, string>> = {
  CHEST: { es: 'Pecho', en: 'Chest' },
  BACK: { es: 'Espalda', en: 'Back' },
  LEGS: { es: 'Piernas', en: 'Legs' },
  SHOULDERS: { es: 'Hombros', en: 'Shoulders' },
  ARMS: { es: 'Brazos', en: 'Arms' },
  CORE: { es: 'Core', en: 'Core' },
  FULL_BODY: { es: 'Cuerpo completo', en: 'Full body' },
}

export function getMuscleGroupLabel(muscleGroup: MuscleGroup, locale: AppLocale): string {
  return MUSCLE_GROUP_LABELS[muscleGroup][locale]
}

export const exerciseCatalogSelect = {
  id: true,
  slug: true,
  nameEs: true,
  nameEn: true,
  descriptionEs: true,
  descriptionEn: true,
  muscleGroup: true,
  mediaType: true,
  mediaUrl: true,
} as const
