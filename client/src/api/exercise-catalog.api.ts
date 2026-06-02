import { api } from '@/api/client'
import type { ExerciseCatalogPublic, MuscleGroup } from '@/interfaces/exercise-catalog.interface'
import type { ExerciseTypePublic } from '@/interfaces/exercise-type.interface'

export function getExerciseCatalog(muscleGroup?: MuscleGroup) {
  const query = muscleGroup ? `?muscleGroup=${muscleGroup}` : ''
  return api<ExerciseCatalogPublic[]>(`/exercise-catalog${query}`)
}

export function importExerciseFromCatalog(catalogId: number) {
  return api<ExerciseTypePublic>(`/exercise-catalog/${catalogId}/import`, {
    method: 'POST',
  })
}
