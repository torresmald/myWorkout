import type { ChartData, ChartOptions } from 'chart.js'

import { i18n } from '@/i18n'
import type {
  ExerciseEvolutionSeries,
  WeeklyStatPoint,
} from '@/interfaces/stats.interface'
import { formatWeekLabel, formatWorkoutDate } from '@/utils/date.util'

const CHART_COLOR = '#2563eb'
const CHART_COLOR_SECONDARY = '#16a34a'

function t(key: string): string {
  return i18n.global.t(key)
}

function getChartTheme(isDark: boolean) {
  return {
    gridColor: isDark ? '#374151' : '#e5e7eb',
    tickColor: isDark ? '#9ca3af' : '#6b7280',
    pointBorderColor: isDark ? '#111827' : '#ffffff',
  }
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
        backgroundColor: CHART_COLOR,
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
        backgroundColor: CHART_COLOR_SECONDARY,
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
          borderColor: CHART_COLOR,
          backgroundColor: 'rgba(37, 99, 235, 0.12)',
          pointBackgroundColor: CHART_COLOR,
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
        borderColor: CHART_COLOR_SECONDARY,
        backgroundColor: 'rgba(22, 163, 74, 0.12)',
        pointBackgroundColor: CHART_COLOR_SECONDARY,
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
