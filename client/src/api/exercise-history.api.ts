import { api } from '@/api/client'
import type { ExerciseHistoryDetail } from '@/interfaces/exercise-history.interface'

export function getExerciseHistory(exerciseTypeId: number) {
  return api<ExerciseHistoryDetail>(`/exercise-types/${exerciseTypeId}/history`)
}
