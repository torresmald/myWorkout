import { beforeEach, describe, expect, it, vi } from 'vitest'

import { api } from '@/api/client'
import * as exerciseCatalogApi from '@/api/exercise-catalog.api'

vi.mock('@/api/client', () => ({
  api: vi.fn(),
}))

describe('exercise-catalog.api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getExerciseCatalog obtiene catálogo completo', async () => {
    vi.mocked(api).mockResolvedValue([])

    await exerciseCatalogApi.getExerciseCatalog()

    expect(api).toHaveBeenCalledWith('/exercise-catalog')
  })

  it('getExerciseCatalog filtra por grupo muscular', async () => {
    vi.mocked(api).mockResolvedValue([])

    await exerciseCatalogApi.getExerciseCatalog('CHEST')

    expect(api).toHaveBeenCalledWith('/exercise-catalog?muscleGroup=CHEST')
  })

  it('importExerciseFromCatalog importa un ejercicio', async () => {
    vi.mocked(api).mockResolvedValue({ id: 1 })

    await exerciseCatalogApi.importExerciseFromCatalog(12)

    expect(api).toHaveBeenCalledWith('/exercise-catalog/12/import', {
      method: 'POST',
    })
  })
})
