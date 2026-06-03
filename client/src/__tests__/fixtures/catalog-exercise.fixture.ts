import type { ExerciseCatalogPublic } from '@/interfaces/exercise-catalog.interface'

export function createCatalogExercise(
  overrides: Partial<ExerciseCatalogPublic> = {},
): ExerciseCatalogPublic {
  return {
    id: 1,
    slug: 'bench-press',
    nameEs: 'Press de banca',
    nameEn: 'Bench press',
    descriptionEs: 'Baja la barra al pecho y empuja hacia arriba.',
    descriptionEn: 'Lower the bar to your chest and press up.',
    muscleGroup: 'CHEST',
    mediaType: 'GIF',
    mediaUrl: 'https://example.com/bench-press.gif',
    imported: false,
    ...overrides,
  }
}
