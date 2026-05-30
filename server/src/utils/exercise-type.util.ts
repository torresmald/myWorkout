import { exerciseTypeSelect } from '../constants/exercise-type.constants.js'
import { prisma } from '../config/prisma.js'
import type { ExerciseTypePublic } from '../interfaces/exercise-type.interface.js'

export function parseExerciseTypeId(id: string): number | null {
  const exerciseTypeId = Number(id)
  return Number.isInteger(exerciseTypeId) && exerciseTypeId > 0 ? exerciseTypeId : null
}

export async function findUserExerciseType(
  userId: number,
  id: string,
): Promise<ExerciseTypePublic | null> {
  const exerciseTypeId = parseExerciseTypeId(id)

  if (!exerciseTypeId) {
    return null
  }

  return prisma.exerciseType.findFirst({
    where: { id: exerciseTypeId, userId },
    select: exerciseTypeSelect,
  })
}
