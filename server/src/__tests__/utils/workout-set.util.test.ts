import { describe, expect, it } from 'vitest'

import { computeRollupFromSets, parseSetNumber } from '../../utils/workout-set.util.js'

describe('workout-set.util', () => {
  it('calcula rollup desde series completadas', () => {
    expect(
      computeRollupFromSets([
        { reps: 10, weight: 40, completedAt: new Date() },
        { reps: 8, weight: 45, completedAt: new Date() },
        { reps: 6, weight: null, completedAt: null },
      ]),
    ).toEqual({
      sets: 2,
      reps: 8,
      weight: 45,
    })

    expect(
      computeRollupFromSets([{ reps: 10, weight: 40, completedAt: null }]),
    ).toBeNull()
  })

  it('parsea número de serie', () => {
    expect(parseSetNumber('3')).toBe(3)
    expect(parseSetNumber('0')).toBeNull()
    expect(parseSetNumber('x')).toBeNull()
  })
})
