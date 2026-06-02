import { ErrorCode } from '../constants/error-codes.constants.js'
import { exerciseTypeSelect } from '../constants/exercise-type.constants.js'
import { prisma } from '../config/prisma.js'
import { AppError } from '../interfaces/app-error.interface.js'
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

export async function assertUserOwnsExerciseTypes(
  userId: number,
  exerciseTypeIds: number[],
): Promise<void> {
  if (exerciseTypeIds.length === 0) {
    return
  }

  const ownedCount = await prisma.exerciseType.count({
    where: {
      userId,
      id: { in: exerciseTypeIds },
    },
  })

  if (ownedCount !== exerciseTypeIds.length) {
    throw new AppError(ErrorCode.EXERCISE_TYPE_NOT_FOUND, 404)
  }
}
