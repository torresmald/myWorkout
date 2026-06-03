import { describe, expect, it } from 'vitest'

import {
  createExerciseEvolutionSeries,
  createWeeklyStatPoint,
} from '@/__tests__/fixtures/stats.fixture'
import type { ExerciseEvolutionSeries, WeeklyStatPoint } from '@/interfaces/stats.interface'
import {
  buildExerciseEvolutionChartData,
  buildExerciseEvolutionChartOptions,
  buildWeeklyFrequencyChartData,
  buildWeeklyFrequencyChartOptions,
  buildWeeklyVolumeChartData,
  buildWeeklyVolumeChartOptions,
  exerciseSeriesUsesWeight,
} from '@/utils/stats-chart.util'

const weekly: WeeklyStatPoint[] = [
  createWeeklyStatPoint({ weekStart: '2026-05-01', workoutCount: 2, volumeKg: 1200 }),
  createWeeklyStatPoint({ weekStart: '2026-05-08', workoutCount: 3, volumeKg: 1800 }),
]

describe('stats-chart.util', () => {
  it('construye datos de frecuencia semanal', () => {
    const data = buildWeeklyFrequencyChartData(weekly)

    expect(data.labels).toHaveLength(2)
    expect(data.datasets[0]?.data).toEqual([2, 3])
  })

  it('construye datos de volumen semanal', () => {
    const data = buildWeeklyVolumeChartData(weekly)

    expect(data.datasets[0]?.data).toEqual([1200, 1800])
  })

  it('construye opciones de gráficos de barras', () => {
    const frequencyOptions = buildWeeklyFrequencyChartOptions(false)
    const volumeOptions = buildWeeklyVolumeChartOptions(true)
    const frequencyCallback = frequencyOptions.scales?.y?.ticks?.callback
    const volumeCallback = volumeOptions.scales?.y?.ticks?.callback

    const frequencyTick = frequencyCallback?.call({} as never, 5, 0, [])
    const volumeTick = volumeCallback?.call({} as never, 10, 0, [])

    expect(frequencyTick).toBe('5')
    expect(volumeTick).toBe('10 kg')
  })

  it('detecta series con peso cuando hay al menos 2 puntos con maxWeight', () => {
    const series = createExerciseEvolutionSeries({
      exerciseTypeId: 1,
      exerciseName: 'Press',
      dataPoints: [
        { date: '2026-05-01', workoutId: 1, maxWeight: 50, volumeKg: 500, totalReps: 30 },
        { date: '2026-05-08', workoutId: 2, maxWeight: 55, volumeKg: 550, totalReps: 32 },
      ],
    })

    expect(exerciseSeriesUsesWeight(series)).toBe(true)
  })

  it('usa reps cuando no hay suficientes puntos con peso', () => {
    const series: ExerciseEvolutionSeries = {
      exerciseTypeId: 1,
      exerciseName: 'Flexiones',
      muscleGroup: 'CHEST',
      dataPoints: [
        { date: '2026-05-01', workoutId: 1, maxWeight: null, volumeKg: 0, totalReps: 30 },
        { date: '2026-05-08', workoutId: 2, maxWeight: null, volumeKg: 0, totalReps: 35 },
      ],
    }

    const data = buildExerciseEvolutionChartData(series, false)
    const options = buildExerciseEvolutionChartOptions(series, false)
    const labelCallback = options.plugins?.tooltip?.callbacks?.label

    expect(exerciseSeriesUsesWeight(series)).toBe(false)
    expect(data.datasets[0]?.data).toEqual([30, 35])

    const tooltip = labelCallback?.call({} as never, { parsed: { y: 35 } } as never)
    const yTick = options.scales?.y?.ticks?.callback?.call({} as never, 35, 0, [])

    expect(tooltip).toContain('35')
    expect(yTick).toBe('35')
  })

  it('construye gráfico de evolución por peso', () => {
    const series: ExerciseEvolutionSeries = {
      exerciseTypeId: 1,
      exerciseName: 'Press',
      muscleGroup: 'CHEST',
      dataPoints: [
        { date: '2026-05-01', workoutId: 1, maxWeight: 50, volumeKg: 500, totalReps: 30 },
        { date: '2026-05-08', workoutId: 2, maxWeight: 55, volumeKg: 550, totalReps: 32 },
        { date: '2026-05-15', workoutId: 3, maxWeight: null, volumeKg: 0, totalReps: 20 },
      ],
    }

    const data = buildExerciseEvolutionChartData(series, true)
    const options = buildExerciseEvolutionChartOptions(series, true)
    const labelCallback = options.plugins?.tooltip?.callbacks?.label

    expect(data.datasets[0]?.data).toEqual([50, 55])

    const tooltip = labelCallback?.call({} as never, { parsed: { y: 55 } } as never)
    const nullTooltip = labelCallback?.call({} as never, { parsed: { y: null } } as never)
    const yTick = options.scales?.y?.ticks?.callback?.call({} as never, 55, 0, [])

    expect(tooltip).toBe('55 kg')
    expect(nullTooltip).toBe('')
    expect(yTick).toBe('55 kg')
  })

  it('devuelve datasets vacíos cuando no hay serie', () => {
    expect(buildExerciseEvolutionChartData(null, false)).toEqual({ labels: [], datasets: [] })
    expect(exerciseSeriesUsesWeight(null)).toBe(false)
  })
})
