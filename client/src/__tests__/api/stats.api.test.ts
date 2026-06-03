import { beforeEach, describe, expect, it, vi } from 'vitest'

import { api } from '@/api/client'
import * as statsApi from '@/api/stats.api'

vi.mock('@/api/client', () => ({
  api: vi.fn(),
}))

describe('stats.api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getWorkoutStats obtiene estadísticas', async () => {
    vi.mocked(api).mockResolvedValue({ totalWorkouts: 10 })

    const result = await statsApi.getWorkoutStats()

    expect(api).toHaveBeenCalledWith('/stats')
    expect(result).toEqual({ totalWorkouts: 10 })
  })
})
