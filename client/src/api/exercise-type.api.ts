import { api } from '@/api/client'
import type {
  CreateExerciseTypeBody,
  ExerciseTypePublic,
  UpdateExerciseTypeBody,
} from '@/interfaces/exercise-type.interface'

export function getExerciseTypes() {
  return api<ExerciseTypePublic[]>('/exercise-types')
}

export function createExerciseType(body: CreateExerciseTypeBody) {
  return api<ExerciseTypePublic>('/exercise-types', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function updateExerciseType(id: number, body: UpdateExerciseTypeBody) {
  return api<ExerciseTypePublic>(`/exercise-types/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export function deleteExerciseType(id: number) {
  return api<ExerciseTypePublic>(`/exercise-types/${id}`, {
    method: 'DELETE',
  })
}
