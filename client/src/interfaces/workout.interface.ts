export interface CreateWorkoutBody {
  name?: string
  date?: string
  notes?: string
}

export type UpdateWorkoutBody = CreateWorkoutBody

export interface WorkoutPublic {
  id: number
  name: string
  date: string
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateWorkoutExerciseBody {
  exerciseTypeId?: number
  sets?: number
  reps?: number
  restSeconds?: number
  weight?: number | null
  sortOrder?: number
}

export type UpdateWorkoutExerciseBody = CreateWorkoutExerciseBody

export interface WorkoutExerciseTypeSummary {
  id: number
  name: string
  muscleGroup: string | null
}

export interface WorkoutExercisePublic {
  id: number
  workoutId: number
  exerciseTypeId: number
  sets: number
  reps: number
  restSeconds: number
  weight: number | null
  sortOrder: number
  createdAt: string
  updatedAt: string
  exerciseType: WorkoutExerciseTypeSummary
}
