import { describe, expect, it } from 'vitest'

import { parseWorkoutExerciseId, parseWorkoutId } from '../../utils/workout.util.js'

describe('workout.util', () => {
  it('parsea ids válidos e inválidos', () => {
    expect(parseWorkoutId('10')).toBe(10)
    expect(parseWorkoutId('0')).toBeNull()
    expect(parseWorkoutId('abc')).toBeNull()

    expect(parseWorkoutExerciseId('5')).toBe(5)
    expect(parseWorkoutExerciseId('-1')).toBeNull()
  })
})
