import { describe, expect, it } from 'vitest'

import type { WeightEntryPublic } from '@/interfaces/profile.interface'
import {
  buildWeightChartData,
  buildWeightChartOptions,
  sortWeightEntriesAsc,
} from '@/utils/weight-chart.util'

const entries: WeightEntryPublic[] = [
  { id: 2, weightKg: 81, recordedAt: '2026-05-20T12:00:00.000Z' },
  { id: 1, weightKg: 80, recordedAt: '2026-05-10T12:00:00.000Z' },
]

describe('weight-chart.util', () => {
  it('ordena entradas de peso ascendente', () => {
    expect(sortWeightEntriesAsc(entries).map((entry) => entry.id)).toEqual([1, 2])
  })

  it('construye datos del gráfico de peso', () => {
    const data = buildWeightChartData(entries, true)

    expect(data.labels).toHaveLength(2)
    expect(data.datasets[0]?.data).toEqual([80, 81])
  })

  it('construye opciones del gráfico con tooltip y ticks', () => {
    const options = buildWeightChartOptions(entries, false)

    const tooltip = options.plugins?.tooltip?.callbacks?.label?.({
      parsed: { y: 80 },
    } as never)
    const nullTooltip = options.plugins?.tooltip?.callbacks?.label?.({
      parsed: { y: null },
    } as never)
    const yTick = options.scales?.y?.ticks?.callback?.(80, 0, [])

    expect(tooltip).toBe('80 kg')
    expect(nullTooltip).toBe('')
    expect(yTick).toBe('80 kg')
    expect(options.scales?.y?.min).toBeLessThan(80)
    expect(options.scales?.y?.max).toBeGreaterThan(81)
  })
})
