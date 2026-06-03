import { beforeEach, describe, expect, it, vi } from 'vitest'

import { api } from '@/api/client'
import * as exerciseHistoryApi from '@/api/exercise-history.api'

vi.mock('@/api/client', () => ({
  api: vi.fn(),
}))

describe('exercise-history.api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getExerciseHistory obtiene historial de un tipo de ejercicio', async () => {
    vi.mocked(api).mockResolvedValue({ sessions: [] })

    await exerciseHistoryApi.getExerciseHistory(15)

    expect(api).toHaveBeenCalledWith('/exercise-types/15/history')
  })
})
