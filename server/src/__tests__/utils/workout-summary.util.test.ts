import { describe, expect, it } from 'vitest'

import {
  buildWorkoutListSummary,
  calculatePlannedExerciseVolume,
  calculateWorkoutVolume,
} from '../../utils/workout-summary.util.js'

describe('workout-summary.util', () => {
  it('calcula volumen planificado por ejercicio', () => {
    expect(calculatePlannedExerciseVolume({ sets: 4, reps: 8, weight: 60 })).toBe(1920)
    expect(calculatePlannedExerciseVolume({ sets: 3, reps: 10, weight: null })).toBe(0)
  })

  it('calcula volumen planificado para entrenos planificados', () => {
    const volume = calculateWorkoutVolume('PLANNED', [
      {
        sets: 3,
        reps: 10,
        weight: 80,
        sortOrder: 0,
        exerciseType: { name: 'Sentadilla' },
      },
      {
        sets: 4,
        reps: 8,
        weight: 60,
        sortOrder: 1,
        exerciseType: { name: 'Press banca' },
      },
    ])

    expect(volume).toBe(4320)
  })

  it('usa series completadas para entrenos en progreso o completados', () => {
    const volume = calculateWorkoutVolume('COMPLETED', [
      {
        sets: 3,
        reps: 10,
        weight: 80,
        sortOrder: 0,
        exerciseType: { name: 'Sentadilla' },
        workoutSets: [
          { reps: 10, weight: 80, completedAt: new Date() },
          { reps: 8, weight: 85, completedAt: new Date() },
        ],
      },
    ])

    expect(volume).toBe(1480)
  })

  it('construye resumen con nombres ordenados', () => {
    const summary = buildWorkoutListSummary('PLANNED', [
      {
        sets: 3,
        reps: 10,
        weight: 50,
        sortOrder: 1,
        exerciseType: { name: 'Remo' },
      },
      {
        sets: 4,
        reps: 8,
        weight: 60,
        sortOrder: 0,
        exerciseType: { name: 'Press banca' },
      },
    ])

    expect(summary).toEqual({
      exerciseCount: 2,
      volumeKg: 3420,
      exerciseNames: ['Press banca', 'Remo'],
    })
  })
})
