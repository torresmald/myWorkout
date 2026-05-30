export const workoutSelect = {
  id: true,
  name: true,
  date: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
} as const

export const workoutExerciseSelect = {
  id: true,
  workoutId: true,
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
