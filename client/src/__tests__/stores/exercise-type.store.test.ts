import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as exerciseTypeApi from '@/api/exercise-type.api'
import { setupTestPinia } from '@/__tests__/helpers/mount-test-app'
import { useExerciseTypeStore } from '@/stores/exercise-type.store'
import type { ExerciseTypePublic } from '@/interfaces/exercise-type.interface'

vi.mock('@/api/exercise-type.api', () => ({
  getExerciseTypes: vi.fn(),
  createExerciseType: vi.fn(),
  updateExerciseType: vi.fn(),
  deleteExerciseType: vi.fn(),
}))

const mockExerciseType: ExerciseTypePublic = {
  id: 1,
  name: 'Press banca',
  description: null,
  muscleGroup: 'CHEST',
  catalogExerciseId: null,
  mediaType: null,
  mediaUrl: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

describe('exercise-type store', () => {
  beforeEach(() => {
    setupTestPinia()
    vi.mocked(exerciseTypeApi.getExerciseTypes).mockResolvedValue([mockExerciseType])
  })

  it('carga los tipos de ejercicio con indicador de carga', async () => {
    const store = useExerciseTypeStore()

    await store.fetchAll()

    expect(store.exerciseTypes).toEqual([mockExerciseType])
    expect(store.loading).toBe(false)
  })

  it('carga los tipos de ejercicio en modo silencioso', async () => {
    const store = useExerciseTypeStore()

    await store.fetchAll(true)

    expect(store.loading).toBe(false)
    expect(store.exerciseTypes).toEqual([mockExerciseType])
  })

  it('crea un tipo de ejercicio y refresca la lista', async () => {
    vi.mocked(exerciseTypeApi.createExerciseType).mockResolvedValue(mockExerciseType)
    const store = useExerciseTypeStore()
    const body = { name: 'Press banca', muscleGroup: 'CHEST' as const }

    const created = await store.create(body)

    expect(exerciseTypeApi.createExerciseType).toHaveBeenCalledWith(body)
    expect(created).toEqual(mockExerciseType)
    expect(store.creating).toBe(false)
  })

  it('actualiza un tipo de ejercicio', async () => {
    vi.mocked(exerciseTypeApi.updateExerciseType).mockResolvedValue(mockExerciseType)
    const store = useExerciseTypeStore()
    const body = { name: 'Press inclinado', muscleGroup: 'CHEST' as const }

    const updated = await store.update(1, body)

    expect(exerciseTypeApi.updateExerciseType).toHaveBeenCalledWith(1, body)
    expect(updated).toEqual(mockExerciseType)
    expect(store.updating).toBe(false)
  })

  it('elimina un tipo de ejercicio de la lista local', async () => {
    vi.mocked(exerciseTypeApi.deleteExerciseType).mockResolvedValue(undefined)
    const store = useExerciseTypeStore()
    store.exerciseTypes = [mockExerciseType, { ...mockExerciseType, id: 2 }]

    await store.remove(1)

    expect(store.exerciseTypes).toEqual([{ ...mockExerciseType, id: 2 }])
    expect(store.deletingId).toBeNull()
  })
})
