import type { ChartData, ChartOptions } from 'chart.js'

import { CHART_COLORS, getChartTheme } from '@/constants/chart.constants'
import { i18n } from '@/i18n'
import type { WeightEntryPublic } from '@/interfaces/profile.interface'
import { formatWorkoutDate } from '@/utils/date.util'

function t(key: string): string {
  return i18n.global.t(key)
}

export function sortWeightEntriesAsc(entries: WeightEntryPublic[]): WeightEntryPublic[] {
  return [...entries].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
  )
}

function getWeightAxisBounds(weights: number[]): { min: number; max: number } {
  const minWeight = Math.min(...weights)
  const maxWeight = Math.max(...weights)
  const padding = Math.max(1, (maxWeight - minWeight) * 0.15 || 2)

  return {
    min: Math.floor((minWeight - padding) * 10) / 10,
    max: Math.ceil((maxWeight + padding) * 10) / 10,
  }
}

export function buildWeightChartData(
  entries: WeightEntryPublic[],
  isDark = false,
): ChartData<'line'> {
  const sorted = sortWeightEntriesAsc(entries)
  const { pointBorderColor } = getChartTheme(isDark)

  return {
    labels: sorted.map((entry) => formatWorkoutDate(entry.recordedAt)),
    datasets: [
      {
        label: t('charts.weightKg'),
        data: sorted.map((entry) => entry.weightKg),
        borderColor: CHART_COLORS.primary,
        backgroundColor: CHART_COLORS.primarySoft,
        pointBackgroundColor: CHART_COLORS.primary,
        pointBorderColor,
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.3,
      },
    ],
  }
}

export function buildWeightChartOptions(
  entries: WeightEntryPublic[],
  isDark = false,
): ChartOptions<'line'> {
  const weights = entries.map((entry) => entry.weightKg)
  const { min, max } = getWeightAxisBounds(weights)
  const { gridColor, tickColor } = getChartTheme(isDark)

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label(context) {
            const value = context.parsed.y
            return value === null ? '' : `${value} kg`
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: tickColor,
          maxRotation: 45,
          minRotation: 0,
        },
      },
      y: {
        min,
        max,
        grid: {
          color: gridColor,
        },
        ticks: {
          color: tickColor,
          callback(value) {
            return `${value} kg`
          },
        },
      },
    },
  }
}
