import type { ChartData, ChartOptions } from 'chart.js'

import type { WeightEntryPublic } from '@/interfaces/profile.interface'
import { formatWorkoutDate } from '@/utils/date.util'

const CHART_COLOR = '#2563eb'
const CHART_FILL = 'rgba(37, 99, 235, 0.12)'

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

export function buildWeightChartData(entries: WeightEntryPublic[]): ChartData<'line'> {
  const sorted = sortWeightEntriesAsc(entries)

  return {
    labels: sorted.map((entry) => formatWorkoutDate(entry.recordedAt)),
    datasets: [
      {
        label: 'Peso (kg)',
        data: sorted.map((entry) => entry.weightKg),
        borderColor: CHART_COLOR,
        backgroundColor: CHART_FILL,
        pointBackgroundColor: CHART_COLOR,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.3,
      },
    ],
  }
}

export function buildWeightChartOptions(entries: WeightEntryPublic[]): ChartOptions<'line'> {
  const weights = entries.map((entry) => entry.weightKg)
  const { min, max } = getWeightAxisBounds(weights)

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
          maxRotation: 45,
          minRotation: 0,
        },
      },
      y: {
        min,
        max,
        ticks: {
          callback(value) {
            return `${value} kg`
          },
        },
      },
    },
  }
}
