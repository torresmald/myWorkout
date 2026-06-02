export interface CreateTemplateExerciseBody {
  exerciseTypeId?: number
  sets?: number
  reps?: number
  restSeconds?: number
  weight?: number | null
  sortOrder?: number
}

export type UpdateTemplateExerciseBody = CreateTemplateExerciseBody

export interface CreateTemplateBody {
  name?: string
  description?: string
  exercises?: CreateTemplateExerciseBody[]
}

export type UpdateTemplateBody = Omit<CreateTemplateBody, 'exercises'>

export interface WorkoutTemplatePublic {
  id: number
  name: string
  description: string | null
  createdAt: Date
  updatedAt: Date
}

export interface TemplateCreateResult extends WorkoutTemplatePublic {
  exercises?: TemplateExercisePublic[]
}

export interface TemplateDetail extends WorkoutTemplatePublic {
  exercises: TemplateExercisePublic[]
}

export interface TemplateExerciseTypeSummary {
  id: number
  name: string
  muscleGroup: string | null
}

export interface TemplateExercisePublic {
  id: number
  templateId: number
  exerciseTypeId: number
  sets: number
  reps: number
  restSeconds: number
  weight: number | null
  sortOrder: number
  createdAt: Date
  updatedAt: Date
  exerciseType: TemplateExerciseTypeSummary
}
