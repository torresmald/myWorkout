import type { WorkoutStatus } from '@prisma/client'

import type { WorkoutExercisePublic } from './workout.interface.js'

export interface WorkoutSetPublic {
  id: number
  workoutExerciseId: number
  setNumber: number
  reps: number
  weight: number | null
  completedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface WorkoutSetUpdateResult {
  set: WorkoutSetPublic
  isPersonalRecord: boolean
  previousMaxWeight: number | null
}

export interface WorkoutSessionExercise extends WorkoutExercisePublic {
  workoutSets: WorkoutSetPublic[]
}

export interface WorkoutSessionDetail {
  id: number
  name: string
  date: Date
  notes: string | null
  status: WorkoutStatus
  startedAt: Date | null
  completedAt: Date | null
  createdAt: Date
  updatedAt: Date
  exercises: WorkoutSessionExercise[]
}

export interface UpdateWorkoutSetBody {
  reps?: number
  weight?: number | null
  completed?: boolean
}

export interface WorkoutSessionFinishResult {
  id: number
  name: string
  status: WorkoutStatus
  completedAt: Date | null
}
