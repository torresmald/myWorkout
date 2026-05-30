export interface CreateWorkoutBody {
  name?: string
  date?: string
  notes?: string
}

export type UpdateWorkoutBody = CreateWorkoutBody

export interface WorkoutPublic {
  id: number
  name: string
  date: Date
  notes: string | null
  createdAt: Date
  updatedAt: Date
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
  createdAt: Date
  updatedAt: Date
  exerciseType: WorkoutExerciseTypeSummary
}
