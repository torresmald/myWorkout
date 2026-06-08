type SummaryExercise = {
  sets: number
  reps: number
  weight: number | null
  sortOrder: number
  exerciseType: { name: string }
  workoutSets?: Array<{
    reps: number
    weight: number | null
    completedAt: Date | null
  }>
}

export function calculatePlannedExerciseVolume(
  exercise: Pick<SummaryExercise, 'sets' | 'reps' | 'weight'>,
): number {
  if (exercise.weight === null) {
    return 0
  }

  return exercise.sets * exercise.reps * exercise.weight
}

export function calculateActualExerciseVolume(
  workoutSets: NonNullable<SummaryExercise['workoutSets']>,
): number {
  return workoutSets
    .filter((set) => set.completedAt !== null)
    .reduce((sum, set) => sum + set.reps * (set.weight ?? 0), 0)
}

export function calculateWorkoutVolume(
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED',
  exercises: SummaryExercise[],
): number {
  if (exercises.length === 0) {
    return 0
  }

  if (status === 'PLANNED') {
    return exercises.reduce((sum, exercise) => sum + calculatePlannedExerciseVolume(exercise), 0)
  }

  const actualVolume = exercises.reduce(
    (sum, exercise) => sum + calculateActualExerciseVolume(exercise.workoutSets ?? []),
    0,
  )

  if (actualVolume > 0) {
    return actualVolume
  }

  return exercises.reduce((sum, exercise) => sum + calculatePlannedExerciseVolume(exercise), 0)
}

export function buildWorkoutListSummary(
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED',
  exercises: SummaryExercise[],
): { exerciseCount: number; volumeKg: number; exerciseNames: string[] } {
  const sorted = [...exercises].sort((left, right) => left.sortOrder - right.sortOrder)

  return {
    exerciseCount: exercises.length,
    volumeKg: calculateWorkoutVolume(status, exercises),
    exerciseNames: sorted.map((exercise) => exercise.exerciseType.name),
  }
}
