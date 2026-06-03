import { describe, expect, it } from 'vitest'

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
  { weekStart: '2026-05-01', workoutCount: 2, volumeKg: 1200 },
  { weekStart: '2026-05-08', workoutCount: 3, volumeKg: 1800 },
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

    const frequencyTick = frequencyOptions.scales?.y?.ticks?.callback?.(5, 0, [])
    const volumeTick = volumeOptions.scales?.y?.ticks?.callback?.(10, 0, [])

    expect(frequencyTick).toBe('5')
    expect(volumeTick).toBe('10 kg')
  })

  it('detecta series con peso cuando hay al menos 2 puntos con maxWeight', () => {
    const series: ExerciseEvolutionSeries = {
      exerciseTypeId: 1,
      exerciseName: 'Press',
      dataPoints: [
        { date: '2026-05-01', maxWeight: 50, totalReps: 30 },
        { date: '2026-05-08', maxWeight: 55, totalReps: 32 },
      ],
    }

    expect(exerciseSeriesUsesWeight(series)).toBe(true)
  })

  it('usa reps cuando no hay suficientes puntos con peso', () => {
    const series: ExerciseEvolutionSeries = {
      exerciseTypeId: 1,
      exerciseName: 'Flexiones',
      dataPoints: [
        { date: '2026-05-01', maxWeight: null, totalReps: 30 },
        { date: '2026-05-08', maxWeight: null, totalReps: 35 },
      ],
    }

    const data = buildExerciseEvolutionChartData(series, false)
    const options = buildExerciseEvolutionChartOptions(series, false)

    expect(exerciseSeriesUsesWeight(series)).toBe(false)
    expect(data.datasets[0]?.data).toEqual([30, 35])

    const tooltip = options.plugins?.tooltip?.callbacks?.label?.({
      parsed: { y: 35 },
    } as never)
    const yTick = options.scales?.y?.ticks?.callback?.(35, 0, [])

    expect(tooltip).toContain('35')
    expect(yTick).toBe('35')
  })

  it('construye gráfico de evolución por peso', () => {
    const series: ExerciseEvolutionSeries = {
      exerciseTypeId: 1,
      exerciseName: 'Press',
      dataPoints: [
        { date: '2026-05-01', maxWeight: 50, totalReps: 30 },
        { date: '2026-05-08', maxWeight: 55, totalReps: 32 },
        { date: '2026-05-15', maxWeight: null, totalReps: 20 },
      ],
    }

    const data = buildExerciseEvolutionChartData(series, true)
    const options = buildExerciseEvolutionChartOptions(series, true)

    expect(data.datasets[0]?.data).toEqual([50, 55])

    const tooltip = options.plugins?.tooltip?.callbacks?.label?.({
      parsed: { y: 55 },
    } as never)
    const nullTooltip = options.plugins?.tooltip?.callbacks?.label?.({
      parsed: { y: null },
    } as never)
    const yTick = options.scales?.y?.ticks?.callback?.(55, 0, [])

    expect(tooltip).toBe('55 kg')
    expect(nullTooltip).toBe('')
    expect(yTick).toBe('55 kg')
  })

  it('devuelve datasets vacíos cuando no hay serie', () => {
    expect(buildExerciseEvolutionChartData(null, false)).toEqual({ labels: [], datasets: [] })
    expect(exerciseSeriesUsesWeight(null)).toBe(false)
  })
})
