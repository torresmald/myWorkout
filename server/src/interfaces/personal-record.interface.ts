export interface PersonalRecordPublic {
  exerciseTypeId: number
  exerciseName: string
  muscleGroup: string | null
  maxWeight: number
  reps: number
  achievedAt: Date
  workoutId: number
  workoutName: string
}
