import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as statsApi from '@/api/stats.api'
import { setupTestPinia } from '@/__tests__/helpers/mount-test-app'
import type { WorkoutStats } from '@/interfaces/stats.interface'
import { useStatsStore } from '@/stores/stats.store'

vi.mock('@/api/stats.api', () => ({
  getWorkoutStats: vi.fn(),
}))

const mockStats: WorkoutStats = {
  summary: {
    totalWorkouts: 10,
    workoutsThisWeek: 2,
    workoutsLast30Days: 8,
    totalVolumeKg: 15000,
    totalReps: 500,
  },
  weekly: [],
  exerciseEvolution: [],
}

describe('stats store', () => {
  beforeEach(() => {
    setupTestPinia()
    vi.mocked(statsApi.getWorkoutStats).mockResolvedValue(mockStats)
  })

  it('carga las estadísticas de entrenamiento', async () => {
    const store = useStatsStore()

    const stats = await store.fetchStats()

    expect(stats).toEqual(mockStats)
    expect(store.stats).toEqual(mockStats)
    expect(store.loading).toBe(false)
  })
})
