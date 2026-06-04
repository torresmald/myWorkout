import { describe, expect, it } from 'vitest'

import { ErrorCode } from '../../constants/error-codes.constants.js'
import { AppError } from '../../interfaces/app-error.interface.js'
import {
  buildWorkoutExerciseCreateData,
  parseOptionalWeight,
  requireNonNegativeInteger,
  requirePositiveInteger,
} from '../../utils/workout-exercise.util.js'

describe('workout-exercise.util', () => {
  it('valida enteros positivos', () => {
    expect(requirePositiveInteger(3, 'sets')).toBe(3)

    expect(() => requirePositiveInteger(undefined, 'sets')).toThrow(AppError)
    expect(() => requirePositiveInteger(0, 'sets')).toThrow(
      expect.objectContaining({ code: ErrorCode.POSITIVE_INTEGER_REQUIRED }),
    )
  })

  it('valida enteros no negativos con default', () => {
    expect(requireNonNegativeInteger(undefined, 'restSeconds', 90)).toBe(90)
    expect(requireNonNegativeInteger(0, 'restSeconds', 90)).toBe(0)

    expect(() => requireNonNegativeInteger(-1, 'restSeconds', 90)).toThrow(
      expect.objectContaining({ code: ErrorCode.NON_NEGATIVE_INTEGER_REQUIRED }),
    )
  })

  it('parsea peso opcional', () => {
    expect(parseOptionalWeight(undefined)).toBeNull()
    expect(parseOptionalWeight(null)).toBeNull()
    expect(parseOptionalWeight(50)).toBe(50)

    expect(() => parseOptionalWeight(0)).toThrow(
      expect.objectContaining({ code: ErrorCode.WEIGHT_MUST_BE_POSITIVE }),
    )
  })

  it('construye payload de creación', () => {
    expect(
      buildWorkoutExerciseCreateData({
        exerciseTypeId: 2,
        sets: 4,
        reps: 8,
        restSeconds: 120,
        weight: 60,
        sortOrder: 1,
      }),
    ).toEqual({
      exerciseTypeId: 2,
      sets: 4,
      reps: 8,
      restSeconds: 120,
      weight: 60,
      sortOrder: 1,
    })
  })
})
