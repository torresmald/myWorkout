import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as personalRecordApi from '@/api/personal-record.api'
import { setupTestPinia } from '@/__tests__/helpers/mount-test-app'
import type { PersonalRecordPublic } from '@/interfaces/personal-record.interface'
import { usePersonalRecordStore } from '@/stores/personal-record.store'

vi.mock('@/api/personal-record.api', () => ({
  getPersonalRecords: vi.fn(),
}))

const mockRecords: PersonalRecordPublic[] = [
  {
    exerciseTypeId: 5,
    exerciseName: 'Press banca',
    muscleGroup: 'CHEST',
    maxWeight: 100,
    reps: 5,
    achievedAt: '2026-01-01T00:00:00.000Z',
    workoutId: 1,
    workoutName: 'Push day',
  },
]

describe('personal-record store', () => {
  beforeEach(() => {
    setupTestPinia()
    vi.mocked(personalRecordApi.getPersonalRecords).mockResolvedValue(mockRecords)
  })

  it('carga los récords personales', async () => {
    const store = usePersonalRecordStore()

    const records = await store.fetchAll()

    expect(records).toEqual(mockRecords)
    expect(store.records).toEqual(mockRecords)
    expect(store.loading).toBe(false)
  })
})
