export const workoutSelect = {
  id: true,
  name: true,
  date: true,
  notes: true,
  status: true,
  startedAt: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
} as const

export const workoutSetSelect = {
  id: true,
  workoutExerciseId: true,
  setNumber: true,
  reps: true,
  weight: true,
  completedAt: true,
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
      catalogExercise: {
        select: {
          mediaType: true,
          mediaUrl: true,
        },
      },
    },
  },
} as const

export const workoutSessionExerciseSelect = {
  ...workoutExerciseSelect,
  workoutSets: {
    select: workoutSetSelect,
    orderBy: [{ setNumber: 'asc' as const }],
  },
}
