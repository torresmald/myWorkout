import { workoutSelect } from '../constants/workout.constants.js'
import { prisma } from '../config/prisma.js'
import type { WorkoutPublic } from '../interfaces/workout.interface.js'

export function parseWorkoutId(id: string): number | null {
  const workoutId = Number(id)
  return Number.isInteger(workoutId) && workoutId > 0 ? workoutId : null
}

export function parseWorkoutExerciseId(id: string): number | null {
  const workoutExerciseId = Number(id)
  return Number.isInteger(workoutExerciseId) && workoutExerciseId > 0 ? workoutExerciseId : null
}

export async function findUserWorkout(userId: number, id: string): Promise<WorkoutPublic | null> {
  const workoutId = parseWorkoutId(id)

  if (!workoutId) {
    return null
  }

  return prisma.workout.findFirst({
    where: { id: workoutId, userId },
    select: workoutSelect,
  })
}
