import { beforeEach, describe, expect, it, vi } from 'vitest'

import { api } from '@/api/client'
import * as workoutSessionApi from '@/api/workout-session.api'

vi.mock('@/api/client', () => ({
  api: vi.fn(),
}))

describe('workout-session.api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getWorkoutSession obtiene sesión activa', async () => {
    vi.mocked(api).mockResolvedValue({ id: 1 })

    await workoutSessionApi.getWorkoutSession(3)

    expect(api).toHaveBeenCalledWith('/workouts/3/session')
  })

  it('startWorkoutSession inicia sesión', async () => {
    vi.mocked(api).mockResolvedValue({ id: 1 })

    await workoutSessionApi.startWorkoutSession(3)

    expect(api).toHaveBeenCalledWith('/workouts/3/start', {
      method: 'POST',
    })
  })

  it('finishWorkoutSession finaliza sesión', async () => {
    vi.mocked(api).mockResolvedValue({ finished: true })

    await workoutSessionApi.finishWorkoutSession(3)

    expect(api).toHaveBeenCalledWith('/workouts/3/finish', {
      method: 'POST',
    })
  })

  it('updateWorkoutSet actualiza una serie', async () => {
    const body = { weightKg: 80, reps: 8 }
    vi.mocked(api).mockResolvedValue({})

    await workoutSessionApi.updateWorkoutSet(3, 10, 2, body)

    expect(api).toHaveBeenCalledWith('/workouts/3/exercises/10/sets/2', {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
  })
})
