import type { ChartData, ChartOptions } from 'chart.js'

import { CHART_COLORS, getChartTheme } from '@/constants/chart.constants'
import type { WeightUnit } from '@/constants/weight-unit.constants'
import { i18n } from '@/i18n'
import type { WeightEntryPublic } from '@/interfaces/profile.interface'
import { formatWorkoutDate } from '@/utils/date.util'
import {
  convertWeightFromKg,
  getWeightUnitSuffix,
} from '@/utils/weight-unit.util'

function t(key: string): string {
  return i18n.global.t(key)
}

function getWeightChartLabel(unit: WeightUnit): string {
  return unit === 'lb' ? t('charts.weightLb') : t('charts.weightKg')
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
  unit: WeightUnit = 'kg',
  targetWeightKg?: number | null,
): ChartData<'line'> {
  const sorted = sortWeightEntriesAsc(entries)
  const { pointBorderColor } = getChartTheme(isDark)
  const datasets: ChartData<'line'>['datasets'] = [
    {
      label: getWeightChartLabel(unit),
      data: sorted.map((entry) => convertWeightFromKg(entry.weightKg, unit)),
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
  ]

  if (targetWeightKg != null && sorted.length > 0) {
    const targetValue = convertWeightFromKg(targetWeightKg, unit)

    datasets.push({
      label: t('profile.targetWeight.chartLabel'),
      data: sorted.map(() => targetValue),
      borderColor: CHART_COLORS.accent,
      backgroundColor: 'transparent',
      pointRadius: 0,
      pointHoverRadius: 0,
      borderDash: [6, 4],
      borderWidth: 2,
      fill: false,
      tension: 0,
    })
  }

  return {
    labels: sorted.map((entry) => formatWorkoutDate(entry.recordedAt)),
    datasets,
  }
}

export function buildWeightChartOptions(
  entries: WeightEntryPublic[],
  isDark = false,
  unit: WeightUnit = 'kg',
  targetWeightKg?: number | null,
): ChartOptions<'line'> {
  const weights = entries.map((entry) => convertWeightFromKg(entry.weightKg, unit))

  if (targetWeightKg != null) {
    weights.push(convertWeightFromKg(targetWeightKg, unit))
  }

  const { min, max } = getWeightAxisBounds(weights)
  const { gridColor, tickColor } = getChartTheme(isDark)
  const suffix = getWeightUnitSuffix(unit)

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: targetWeightKg != null,
      },
      tooltip: {
        callbacks: {
          label(context) {
            const value = context.parsed.y
            return value === null ? '' : `${value} ${suffix}`
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
            return `${value} ${suffix}`
          },
        },
      },
    },
  }
}
