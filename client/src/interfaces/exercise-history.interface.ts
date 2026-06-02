import type { ExerciseTypePublic } from '@/interfaces/exercise-type.interface'
import type { PersonalRecordPublic } from '@/interfaces/personal-record.interface'

export type ExerciseHistorySource = 'LIVE' | 'AGGREGATE'

export type WorkoutStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED'

export interface ExerciseHistorySetDetail {
  setNumber: number
  reps: number
  weight: number | null
  completedAt: string | null
}

export interface ExerciseHistorySession {
  workoutId: number
  workoutName: string
  workoutDate: string
  workoutStatus: WorkoutStatus
  sets: number
  reps: number
  maxWeight: number | null
  volumeKg: number
  totalReps: number
  source: ExerciseHistorySource
  setDetails: ExerciseHistorySetDetail[]
  isPersonalRecord: boolean
}

export interface ExerciseHistoryDetail {
  exerciseType: ExerciseTypePublic
  personalRecord: PersonalRecordPublic | null
  sessions: ExerciseHistorySession[]
}
