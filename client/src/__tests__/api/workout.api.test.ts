import { beforeEach, describe, expect, it, vi } from 'vitest'

import { api } from '@/api/client'
import * as workoutApi from '@/api/workout.api'

vi.mock('@/api/client', () => ({
  api: vi.fn(),
}))

describe('workout.api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getWorkouts obtiene entrenamientos', async () => {
    vi.mocked(api).mockResolvedValue([])

    await workoutApi.getWorkouts()

    expect(api).toHaveBeenCalledWith('/workouts')
  })

  it('createWorkout crea un entrenamiento', async () => {
    const body = { name: 'Leg day', date: '2026-06-03' }
    vi.mocked(api).mockResolvedValue({})

    await workoutApi.createWorkout(body)

    expect(api).toHaveBeenCalledWith('/workouts', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  })

  it('updateWorkout actualiza un entrenamiento', async () => {
    const body = { name: 'Updated' }
    vi.mocked(api).mockResolvedValue({})

    await workoutApi.updateWorkout(1, body)

    expect(api).toHaveBeenCalledWith('/workouts/1', {
      method: 'PUT',
      body: JSON.stringify(body),
    })
  })

  it('deleteWorkout elimina un entrenamiento', async () => {
    vi.mocked(api).mockResolvedValue({})

    await workoutApi.deleteWorkout(1)

    expect(api).toHaveBeenCalledWith('/workouts/1', {
      method: 'DELETE',
    })
  })

  it('getWorkoutExercises obtiene ejercicios del entrenamiento', async () => {
    vi.mocked(api).mockResolvedValue([])

    await workoutApi.getWorkoutExercises(2)

    expect(api).toHaveBeenCalledWith('/workouts/2/exercises')
  })

  it('createWorkoutExercise añade un ejercicio', async () => {
    const body = { exerciseTypeId: 5, orderIndex: 0 }
    vi.mocked(api).mockResolvedValue({})

    await workoutApi.createWorkoutExercise(2, body)

    expect(api).toHaveBeenCalledWith('/workouts/2/exercises', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  })

  it('updateWorkoutExercise actualiza un ejercicio', async () => {
    const body = { orderIndex: 1 }
    vi.mocked(api).mockResolvedValue({})

    await workoutApi.updateWorkoutExercise(2, 3, body)

    expect(api).toHaveBeenCalledWith('/workouts/2/exercises/3', {
      method: 'PUT',
      body: JSON.stringify(body),
    })
  })

  it('deleteWorkoutExercise elimina un ejercicio', async () => {
    vi.mocked(api).mockResolvedValue({})

    await workoutApi.deleteWorkoutExercise(2, 3)

    expect(api).toHaveBeenCalledWith('/workouts/2/exercises/3', {
      method: 'DELETE',
    })
  })
})
