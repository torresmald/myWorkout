import { beforeEach, describe, expect, it, vi } from 'vitest'

import { api } from '@/api/client'
import * as personalRecordApi from '@/api/personal-record.api'

vi.mock('@/api/client', () => ({
  api: vi.fn(),
}))

describe('personal-record.api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getPersonalRecords obtiene todos los récords', async () => {
    vi.mocked(api).mockResolvedValue([])

    await personalRecordApi.getPersonalRecords()

    expect(api).toHaveBeenCalledWith('/personal-records')
  })

  it('getPersonalRecordByExerciseType obtiene récord por tipo de ejercicio', async () => {
    vi.mocked(api).mockResolvedValue(null)

    await personalRecordApi.getPersonalRecordByExerciseType(6)

    expect(api).toHaveBeenCalledWith('/personal-records/exercise-types/6')
  })
})
