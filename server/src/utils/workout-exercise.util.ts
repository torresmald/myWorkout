import { ErrorCode } from '../constants/error-codes.constants.js'
import { AppError } from '../interfaces/app-error.interface.js'
import type { CreateWorkoutExerciseBody } from '../interfaces/workout.interface.js'

export function requirePositiveInteger(value: number | undefined, field: string): number {
  if (value === undefined || !Number.isInteger(value) || value <= 0) {
    throw new AppError(ErrorCode.POSITIVE_INTEGER_REQUIRED, 400, { field })
  }

  return value
}

export function requireNonNegativeInteger(
  value: number | undefined,
  field: string,
  defaultValue: number,
): number {
  if (value === undefined) {
    return defaultValue
  }

  if (!Number.isInteger(value) || value < 0) {
    throw new AppError(ErrorCode.NON_NEGATIVE_INTEGER_REQUIRED, 400, { field })
  }

  return value
}

export function parseOptionalWeight(weight?: number | null): number | null {
  if (weight === undefined || weight === null) {
    return null
  }

  if (typeof weight !== 'number' || weight <= 0) {
    throw new AppError(ErrorCode.WEIGHT_MUST_BE_POSITIVE, 400)
  }

  return weight
}

export function buildWorkoutExerciseCreateData(
  body: CreateWorkoutExerciseBody,
  defaultSortOrder = 0,
) {
  const exerciseTypeId = requirePositiveInteger(body.exerciseTypeId, 'exerciseTypeId')

  return {
    exerciseTypeId,
    sets: requirePositiveInteger(body.sets, 'sets'),
    reps: requirePositiveInteger(body.reps, 'reps'),
    restSeconds: requireNonNegativeInteger(body.restSeconds, 'restSeconds', 0),
    weight: parseOptionalWeight(body.weight),
    sortOrder: requireNonNegativeInteger(body.sortOrder, 'sortOrder', defaultSortOrder),
  }
}
