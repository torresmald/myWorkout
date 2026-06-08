import { describe, expect, it } from 'vitest'

import { buildExercisePreview } from '@/utils/workout-list.util'

describe('workout-list.util', () => {
  it('formatea nombres visibles y el resto como +N', () => {
    expect(buildExercisePreview(['Press banca'], (count) => `+${count}`)).toBe('Press banca')
    expect(buildExercisePreview(['Press banca', 'Remo'], (count) => `+${count}`)).toBe(
      'Press banca, Remo',
    )
    expect(
      buildExercisePreview(['Press banca', 'Remo', 'Sentadilla'], (count) => `+${count}`),
    ).toBe('Press banca, Remo +1')
  })
})
