import type { WorkoutExercisePublic } from '@/interfaces/workout.interface'

export type WorkoutStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED'

export interface WorkoutSetPublic {
  id: number
  workoutExerciseId: number
  setNumber: number
  reps: number
  weight: number | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
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
  date: string
  notes: string | null
  status: WorkoutStatus
  startedAt: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
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
  completedAt: string | null
}
