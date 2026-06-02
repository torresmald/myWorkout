export const templateSelect = {
  id: true,
  name: true,
  description: true,
  createdAt: true,
  updatedAt: true,
} as const

export const templateExerciseSelect = {
  id: true,
  templateId: true,
  exerciseTypeId: true,
  sets: true,
  reps: true,
  restSeconds: true,
  weight: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
  exerciseType: {
    select: {
      id: true,
      name: true,
      muscleGroup: true,
    },
  },
} as const
