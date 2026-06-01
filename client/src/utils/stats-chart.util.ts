import type { ChartData, ChartOptions } from 'chart.js'

import { CHART_COLORS, getChartTheme } from '@/constants/chart.constants'
import { i18n } from '@/i18n'
import type {
  ExerciseEvolutionSeries,
  WeeklyStatPoint,
} from '@/interfaces/stats.interface'
import { formatWeekLabel, formatWorkoutDate } from '@/utils/date.util'

function t(key: string): string {
  return i18n.global.t(key)
}

function buildBarChartOptions(isDark: boolean, yLabel?: string): ChartOptions<'bar'> {
  const { gridColor, tickColor } = getChartTheme(isDark)

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: tickColor, maxRotation: 0 },
      },
      y: {
        beginAtZero: true,
        grid: { color: gridColor },
        ticks: {
          color: tickColor,
          precision: 0,
          callback(value) {
            return yLabel ? `${value} ${yLabel}` : `${value}`
          },
        },
      },
    },
  }
}

export function buildWeeklyFrequencyChartData(
  weekly: WeeklyStatPoint[],
): ChartData<'bar'> {
  return {
    labels: weekly.map((point) => formatWeekLabel(point.weekStart)),
    datasets: [
      {
        label: t('charts.workouts'),
        data: weekly.map((point) => point.workoutCount),
        backgroundColor: CHART_COLORS.primary,
        borderRadius: 6,
      },
    ],
  }
}

export function buildWeeklyVolumeChartData(weekly: WeeklyStatPoint[]): ChartData<'bar'> {
  return {
    labels: weekly.map((point) => formatWeekLabel(point.weekStart)),
    datasets: [
      {
        label: t('charts.volumeKg'),
        data: weekly.map((point) => Math.round(point.volumeKg)),
        backgroundColor: CHART_COLORS.secondary,
        borderRadius: 6,
      },
    ],
  }
}

export function buildWeeklyFrequencyChartOptions(isDark: boolean): ChartOptions<'bar'> {
  return buildBarChartOptions(isDark)
}

export function buildWeeklyVolumeChartOptions(isDark: boolean): ChartOptions<'bar'> {
  return buildBarChartOptions(isDark, 'kg')
}

export function exerciseSeriesUsesWeight(series: ExerciseEvolutionSeries | null): boolean {
  return (series?.dataPoints.filter((point) => point.maxWeight !== null).length ?? 0) >= 2
}

export function buildExerciseEvolutionChartData(
  series: ExerciseEvolutionSeries | null,
  isDark: boolean,
): ChartData<'line'> {
  if (!series) {
    return { labels: [], datasets: [] }
  }

  const { pointBorderColor } = getChartTheme(isDark)
  const usesWeight = exerciseSeriesUsesWeight(series)

  if (usesWeight) {
    const pointsWithWeight = series.dataPoints.filter((point) => point.maxWeight !== null)

    return {
      labels: pointsWithWeight.map((point) => formatWorkoutDate(point.date)),
      datasets: [
        {
          label: t('charts.maxWeightKg'),
          data: pointsWithWeight.map((point) => point.maxWeight),
          borderColor: CHART_COLORS.primary,
          backgroundColor: CHART_COLORS.primarySoft,
          pointBackgroundColor: CHART_COLORS.primary,
          pointBorderColor,
          pointBorderWidth: 2,
          pointRadius: 4,
          tension: 0.3,
          fill: true,
        },
      ],
    }
  }

  return {
    labels: series.dataPoints.map((point) => formatWorkoutDate(point.date)),
    datasets: [
      {
        label: t('charts.reps'),
        data: series.dataPoints.map((point) => point.totalReps),
        borderColor: CHART_COLORS.accent,
        backgroundColor: CHART_COLORS.accentSoft,
        pointBackgroundColor: CHART_COLORS.accent,
        pointBorderColor,
        pointBorderWidth: 2,
        pointRadius: 4,
        tension: 0.3,
        fill: true,
      },
    ],
  }
}

export function buildExerciseEvolutionChartOptions(
  series: ExerciseEvolutionSeries | null,
  isDark: boolean,
): ChartOptions<'line'> {
  const { gridColor, tickColor } = getChartTheme(isDark)
  const usesWeight = exerciseSeriesUsesWeight(series)
  const repsShort = t('charts.repsShort')

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label(context) {
            const value = context.parsed.y
            return value === null ? '' : usesWeight ? `${value} kg` : `${value} ${repsShort}`
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: tickColor, maxRotation: 45, minRotation: 0 },
      },
      y: {
        beginAtZero: true,
        grid: { color: gridColor },
        ticks: {
          color: tickColor,
          callback(value) {
            return usesWeight ? `${value} kg` : `${value}`
          },
        },
      },
    },
  }
}
