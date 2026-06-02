import { api } from '@/api/client'
import type { PersonalRecordPublic } from '@/interfaces/personal-record.interface'

export function getPersonalRecords() {
  return api<PersonalRecordPublic[]>('/personal-records')
}

export function getPersonalRecordByExerciseType(exerciseTypeId: number) {
  return api<PersonalRecordPublic | null>(`/personal-records/exercise-types/${exerciseTypeId}`)
}
