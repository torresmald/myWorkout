import type { WorkoutStatus } from '@prisma/client'

import type { ExerciseTypePublic } from './exercise-type.interface.js'
import type { PersonalRecordPublic } from './personal-record.interface.js'

export interface ExerciseHistorySetDetail {
  setNumber: number
  reps: number
  weight: number | null
  completedAt: Date | null
}

export interface ExerciseHistorySession {
  workoutId: number
  workoutName: string
  workoutDate: Date
  workoutStatus: WorkoutStatus
  sets: number
  reps: number
  maxWeight: number | null
  volumeKg: number
  totalReps: number
  source: 'LIVE' | 'AGGREGATE'
  setDetails: ExerciseHistorySetDetail[]
  isPersonalRecord: boolean
}

export interface ExerciseHistoryDetail {
  exerciseType: ExerciseTypePublic
  personalRecord: PersonalRecordPublic | null
  sessions: ExerciseHistorySession[]
}
