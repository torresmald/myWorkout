import { describe, expect, it } from 'vitest'

import {
  groupBestRecordsByExerciseType,
  pickBestRecord,
} from '../../utils/personal-record.util.js'

const baseCandidate = {
  exerciseName: 'Press',
  muscleGroup: 'CHEST',
  reps: 8,
  workoutId: 1,
  workoutName: 'Push',
}

describe('personal-record.util', () => {
  it('elige el mejor récord por peso y fecha', () => {
    const older = {
      ...baseCandidate,
      exerciseTypeId: 1,
      weight: 80,
      achievedAt: new Date('2026-01-01'),
    }
    const newerSameWeight = {
      ...baseCandidate,
      exerciseTypeId: 1,
      weight: 80,
      achievedAt: new Date('2026-02-01'),
    }
    const heavier = {
      ...baseCandidate,
      exerciseTypeId: 1,
      weight: 85,
      achievedAt: new Date('2026-01-15'),
    }

    expect(pickBestRecord([older, newerSameWeight])).toEqual(newerSameWeight)
    expect(pickBestRecord([older, heavier])).toEqual(heavier)
    expect(pickBestRecord([])).toBeNull()
  })

  it('agrupa mejores récords por tipo de ejercicio', () => {
    const grouped = groupBestRecordsByExerciseType([
      {
        ...baseCandidate,
        exerciseTypeId: 1,
        weight: 70,
        achievedAt: new Date('2026-01-01'),
      },
      {
        ...baseCandidate,
        exerciseTypeId: 1,
        weight: 75,
        achievedAt: new Date('2026-01-02'),
      },
      {
        ...baseCandidate,
        exerciseTypeId: 2,
        weight: 100,
        achievedAt: new Date('2026-01-03'),
      },
    ])

    expect(grouped.get(1)?.weight).toBe(75)
    expect(grouped.get(2)?.weight).toBe(100)
  })
})
