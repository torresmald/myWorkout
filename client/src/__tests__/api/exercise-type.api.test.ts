import { beforeEach, describe, expect, it, vi } from 'vitest'

import { api } from '@/api/client'
import * as exerciseTypeApi from '@/api/exercise-type.api'

vi.mock('@/api/client', () => ({
  api: vi.fn(),
}))

describe('exercise-type.api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getExerciseTypes obtiene tipos de ejercicio', async () => {
    vi.mocked(api).mockResolvedValue([])

    await exerciseTypeApi.getExerciseTypes()

    expect(api).toHaveBeenCalledWith('/exercise-types')
  })

  it('createExerciseType crea un tipo de ejercicio', async () => {
    const body = { name: 'Press banca', muscleGroup: 'CHEST' as const }
    vi.mocked(api).mockResolvedValue({})

    await exerciseTypeApi.createExerciseType(body)

    expect(api).toHaveBeenCalledWith('/exercise-types', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  })

  it('updateExerciseType actualiza un tipo de ejercicio', async () => {
    const body = { name: 'Press inclinado' }
    vi.mocked(api).mockResolvedValue({})

    await exerciseTypeApi.updateExerciseType(8, body)

    expect(api).toHaveBeenCalledWith('/exercise-types/8', {
      method: 'PUT',
      body: JSON.stringify(body),
    })
  })

  it('deleteExerciseType elimina un tipo de ejercicio', async () => {
    vi.mocked(api).mockResolvedValue({})

    await exerciseTypeApi.deleteExerciseType(8)

    expect(api).toHaveBeenCalledWith('/exercise-types/8', {
      method: 'DELETE',
    })
  })
})
