import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as exerciseHistoryApi from '@/api/exercise-history.api'
import { setupTestPinia } from '@/__tests__/helpers/mount-test-app'
import type { ExerciseHistoryDetail } from '@/interfaces/exercise-history.interface'
import { useExerciseHistoryStore } from '@/stores/exercise-history.store'

vi.mock('@/api/exercise-history.api', () => ({
  getExerciseHistory: vi.fn(),
}))

const mockHistory: ExerciseHistoryDetail = {
  exerciseType: {
    id: 1,
    name: 'Press banca',
    description: null,
    muscleGroup: 'CHEST',
    catalogExerciseId: null,
    mediaType: null,
    mediaUrl: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  personalRecord: null,
  sessions: [],
}

describe('exercise-history store', () => {
  beforeEach(() => {
    setupTestPinia()
    vi.mocked(exerciseHistoryApi.getExerciseHistory).mockResolvedValue(mockHistory)
  })

  it('carga el historial por tipo de ejercicio', async () => {
    const store = useExerciseHistoryStore()

    const history = await store.fetchByExerciseType(1)

    expect(history).toEqual(mockHistory)
    expect(store.history).toEqual(mockHistory)
    expect(store.loading).toBe(false)
  })

  it('limpia el historial cargado', async () => {
    const store = useExerciseHistoryStore()
    await store.fetchByExerciseType(1)

    store.clear()

    expect(store.history).toBeNull()
  })
})
