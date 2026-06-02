export interface CreateWorkoutBody {
  name?: string
  date?: string
  notes?: string
  exercises?: CreateWorkoutExerciseBody[]
}

export type UpdateWorkoutBody = Omit<CreateWorkoutBody, 'exercises'>

export interface WorkoutPublic {
  id: number
  name: string
  date: string
  notes: string | null
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED'
  startedAt: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface WorkoutCreateResult extends WorkoutPublic {
  exercises?: WorkoutExercisePublic[]
}

export interface DraftWorkoutExercise {
  localId: string
  exerciseTypeId: number
  sets: number
  reps: number
  restSeconds: number
  weight: number | null
  sortOrder: number
  exerciseType: WorkoutExerciseTypeSummary
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
  catalogExercise?: {
    mediaType: string
    mediaUrl: string | null
  } | null
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
