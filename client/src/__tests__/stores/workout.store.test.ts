import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as workoutApi from '@/api/workout.api'
import { setupTestPinia } from '@/__tests__/helpers/mount-test-app'
import type { WorkoutExercisePublic, WorkoutPublic } from '@/interfaces/workout.interface'
import { useWorkoutStore } from '@/stores/workout.store'

vi.mock('@/api/workout.api', () => ({
  getWorkouts: vi.fn(),
  createWorkout: vi.fn(),
  updateWorkout: vi.fn(),
  deleteWorkout: vi.fn(),
  getWorkoutExercises: vi.fn(),
  createWorkoutExercise: vi.fn(),
  updateWorkoutExercise: vi.fn(),
  deleteWorkoutExercise: vi.fn(),
}))

const mockWorkout: WorkoutPublic = {
  id: 1,
  name: 'Leg day',
  date: '2026-01-01',
  notes: null,
  status: 'PLANNED',
  startedAt: null,
  completedAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const mockExercise: WorkoutExercisePublic = {
  id: 10,
  workoutId: 1,
  exerciseTypeId: 5,
  sets: 3,
  reps: 10,
  restSeconds: 90,
  weight: 80,
  sortOrder: 0,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  exerciseType: { id: 5, name: 'Sentadilla', muscleGroup: 'LEGS' },
}

describe('workout store', () => {
  beforeEach(() => {
    setupTestPinia()
    vi.mocked(workoutApi.getWorkouts).mockResolvedValue([mockWorkout])
    vi.mocked(workoutApi.getWorkoutExercises).mockResolvedValue([mockExercise])
    vi.mocked(workoutApi.createWorkout).mockResolvedValue(mockWorkout)
    vi.mocked(workoutApi.updateWorkout).mockResolvedValue(mockWorkout)
    vi.mocked(workoutApi.createWorkoutExercise).mockResolvedValue(mockExercise)
    vi.mocked(workoutApi.updateWorkoutExercise).mockResolvedValue(mockExercise)
  })

  it('carga los entrenamientos con indicador de carga', async () => {
    const store = useWorkoutStore()

    await store.fetchAll()

    expect(store.workouts).toEqual([mockWorkout])
    expect(store.loading).toBe(false)
  })

  it('carga los entrenamientos en modo silencioso', async () => {
    const store = useWorkoutStore()

    await store.fetchAll(true)

    expect(store.loading).toBe(false)
  })

  it('crea un entrenamiento y refresca la lista', async () => {
    const store = useWorkoutStore()

    await store.create({ name: 'Leg day', date: '2026-01-01' })

    expect(workoutApi.createWorkout).toHaveBeenCalledWith({ name: 'Leg day', date: '2026-01-01' })
    expect(store.creating).toBe(false)
  })

  it('actualiza un entrenamiento', async () => {
    const store = useWorkoutStore()

    await store.update(1, { name: 'Updated leg day' })

    expect(workoutApi.updateWorkout).toHaveBeenCalledWith(1, { name: 'Updated leg day' })
    expect(store.updating).toBe(false)
  })

  it('elimina un entrenamiento que no es el activo sin limpiar ejercicios', async () => {
    vi.mocked(workoutApi.deleteWorkout).mockResolvedValue(mockWorkout)
    const store = useWorkoutStore()
    store.workouts = [mockWorkout, { ...mockWorkout, id: 2 }]
    store.activeWorkoutId = 2
    store.exercises = [mockExercise]

    await store.remove(1)

    expect(store.exercises).toEqual([mockExercise])
    expect(store.activeWorkoutId).toBe(2)
  })

  it('elimina un entrenamiento y limpia ejercicios si era el activo', async () => {
    vi.mocked(workoutApi.deleteWorkout).mockResolvedValue(mockWorkout)
    const store = useWorkoutStore()
    store.workouts = [mockWorkout]
    store.activeWorkoutId = 1
    store.exercises = [mockExercise]

    await store.remove(1)

    expect(store.workouts).toEqual([])
    expect(store.exercises).toEqual([])
    expect(store.activeWorkoutId).toBeNull()
  })

  it('carga los ejercicios de un entrenamiento', async () => {
    const store = useWorkoutStore()

    await store.fetchExercises(1)

    expect(store.activeWorkoutId).toBe(1)
    expect(store.exercises).toEqual([mockExercise])
    expect(store.loadingExercises).toBe(false)
  })

  it('carga ejercicios en modo silencioso', async () => {
    const store = useWorkoutStore()

    await store.fetchExercises(1, true)

    expect(store.loadingExercises).toBe(false)
  })

  it('limpia los ejercicios activos', () => {
    const store = useWorkoutStore()
    store.exercises = [mockExercise]
    store.activeWorkoutId = 1

    store.clearExercises()

    expect(store.exercises).toEqual([])
    expect(store.activeWorkoutId).toBeNull()
  })

  it('hidrata ejercicios con items proporcionados', () => {
    const store = useWorkoutStore()

    store.hydrateExercises(1, [mockExercise])

    expect(store.activeWorkoutId).toBe(1)
    expect(store.exercises).toEqual([mockExercise])
  })

  it('hidrata ejercicios sin sobrescribir la lista si no hay items', () => {
    const store = useWorkoutStore()
    store.exercises = [mockExercise]

    store.hydrateExercises(1)

    expect(store.activeWorkoutId).toBe(1)
    expect(store.exercises).toEqual([mockExercise])
  })

  it('crea un ejercicio de entrenamiento', async () => {
    const store = useWorkoutStore()
    const body = { exerciseTypeId: 5, sets: 3, reps: 10 }

    await store.createExercise(1, body)

    expect(workoutApi.createWorkoutExercise).toHaveBeenCalledWith(1, body)
    expect(store.creatingExercise).toBe(false)
  })

  it('actualiza un ejercicio de entrenamiento', async () => {
    const store = useWorkoutStore()
    const body = { reps: 12 }

    await store.updateExercise(1, 10, body)

    expect(workoutApi.updateWorkoutExercise).toHaveBeenCalledWith(1, 10, body)
    expect(store.updatingExerciseId).toBeNull()
  })

  it('elimina un ejercicio de entrenamiento', async () => {
    vi.mocked(workoutApi.deleteWorkoutExercise).mockResolvedValue(mockExercise)
    const store = useWorkoutStore()
    store.exercises = [mockExercise, { ...mockExercise, id: 11 }]

    await store.removeExercise(1, 10)

    expect(store.exercises).toEqual([{ ...mockExercise, id: 11 }])
    expect(store.deletingExerciseId).toBeNull()
  })
})
