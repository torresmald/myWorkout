export interface CreateWorkoutBody {
  name?: string
  date?: string
  notes?: string
  exercises?: CreateWorkoutExerciseBody[]
}

export type UpdateWorkoutBody = Omit<CreateWorkoutBody, 'exercises'>

export interface DuplicateWorkoutBody {
  date?: string
}

export interface WorkoutPublic {
  id: number
  name: string
  date: Date
  notes: string | null
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED'
  startedAt: Date | null
  completedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface WorkoutListItem extends WorkoutPublic {
  exerciseCount: number
  volumeKg: number
  exerciseNames: string[]
}

export interface WorkoutCreateResult extends WorkoutPublic {
  exercises?: WorkoutExercisePublic[]
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
