export interface StatsSummary {
  totalWorkouts: number
  workoutsThisWeek: number
  workoutsLast30Days: number
  totalVolumeKg: number
  totalReps: number
}

export interface WeeklyStatPoint {
  weekStart: string
  workoutCount: number
  volumeKg: number
  totalReps: number
}

export interface ExerciseEvolutionPoint {
  date: string
  workoutId: number
  maxWeight: number | null
  volumeKg: number
  totalReps: number
}

export interface ExerciseEvolutionSeries {
  exerciseTypeId: number
  exerciseName: string
  muscleGroup: string | null
  dataPoints: ExerciseEvolutionPoint[]
}

export interface WorkoutStats {
  summary: StatsSummary
  weekly: WeeklyStatPoint[]
  exerciseEvolution: ExerciseEvolutionSeries[]
}
