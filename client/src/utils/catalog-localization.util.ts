import type { AppLocale } from '@/constants/locale.constants'
import type { ExerciseCatalogPublic } from '@/interfaces/exercise-catalog.interface'

export function getCatalogName(exercise: ExerciseCatalogPublic, locale: AppLocale): string {
  return locale === 'es' ? exercise.nameEs : exercise.nameEn
}

export function getCatalogDescription(
  exercise: ExerciseCatalogPublic,
  locale: AppLocale,
): string | null {
  return locale === 'es' ? exercise.descriptionEs : exercise.descriptionEn
}
