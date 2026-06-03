import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as exerciseCatalogApi from '@/api/exercise-catalog.api'
import { createCatalogExercise } from '@/__tests__/fixtures/catalog-exercise.fixture'
import { setupTestPinia } from '@/__tests__/helpers/mount-test-app'
import { useExerciseCatalogStore } from '@/stores/exercise-catalog.store'
import * as exerciseTypeApi from '@/api/exercise-type.api'

vi.mock('@/api/exercise-catalog.api', () => ({
  getExerciseCatalog: vi.fn(),
  importExerciseFromCatalog: vi.fn(),
}))

vi.mock('@/api/exercise-type.api', () => ({
  getExerciseTypes: vi.fn(),
}))

describe('exercise-catalog store', () => {
  beforeEach(() => {
    setupTestPinia()
    vi.mocked(exerciseCatalogApi.getExerciseCatalog).mockResolvedValue([
      createCatalogExercise(),
    ])
    vi.mocked(exerciseTypeApi.getExerciseTypes).mockResolvedValue([])
  })

  it('carga el catálogo completo', async () => {
    const store = useExerciseCatalogStore()

    const result = await store.fetchAll()

    expect(exerciseCatalogApi.getExerciseCatalog).toHaveBeenCalledWith(undefined)
    expect(store.exercises).toHaveLength(1)
    expect(store.selectedMuscleGroup).toBeNull()
    expect(store.loading).toBe(false)
    expect(result).toHaveLength(1)
  })

  it('carga el catálogo filtrado por grupo muscular', async () => {
    const store = useExerciseCatalogStore()

    await store.fetchAll('CHEST')

    expect(exerciseCatalogApi.getExerciseCatalog).toHaveBeenCalledWith('CHEST')
    expect(store.selectedMuscleGroup).toBe('CHEST')
  })

  it('importa un ejercicio y refresca catálogo y tipos', async () => {
    vi.mocked(exerciseCatalogApi.importExerciseFromCatalog).mockResolvedValue(undefined)
    const store = useExerciseCatalogStore()
    await store.fetchAll('BACK')

    await store.importExercise(42)

    expect(exerciseCatalogApi.importExerciseFromCatalog).toHaveBeenCalledWith(42)
    expect(exerciseCatalogApi.getExerciseCatalog).toHaveBeenCalledTimes(2)
    expect(exerciseTypeApi.getExerciseTypes).toHaveBeenCalledTimes(1)
    expect(store.importingId).toBeNull()
  })
})
