import { describe, expect, it } from 'vitest'

import type { WorkoutPublic } from '@/interfaces/workout.interface'
import { computeWeeklyStreak, getLatestWorkout } from '@/utils/workout-streak.util'

function workout(date: string, id = 1): WorkoutPublic {
  return {
    id,
    name: 'Test',
    date,
    notes: null,
    createdAt: date,
    updatedAt: date,
  }
}

describe('workout-streak.util', () => {
  it('devuelve 0 cuando no hay entrenamientos', () => {
    expect(computeWeeklyStreak([])).toBe(0)
    expect(getLatestWorkout([])).toBeNull()
  })

  it('calcula racha semanal consecutiva', () => {
    const now = new Date()
    const thisWeek = new Date(now)
    const lastWeek = new Date(now)
    lastWeek.setDate(lastWeek.getDate() - 7)

    const streak = computeWeeklyStreak([
      workout(thisWeek.toISOString()),
      workout(lastWeek.toISOString(), 2),
    ])

    expect(streak).toBeGreaterThanOrEqual(1)
  })

  it('devuelve el entrenamiento más reciente', () => {
    const older = workout('2026-01-01T12:00:00.000Z', 1)
    const newer = workout('2026-05-30T12:00:00.000Z', 2)

    expect(getLatestWorkout([older, newer])).toEqual(newer)
  })
})
