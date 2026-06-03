import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as workoutSessionApi from '@/api/workout-session.api'
import { setupTestPinia } from '@/__tests__/helpers/mount-test-app'
import type {
  WorkoutSessionDetail,
  WorkoutSetPublic,
  WorkoutSetUpdateResult,
} from '@/interfaces/workout-set.interface'
import { useWorkoutSessionStore } from '@/stores/workout-session.store'

vi.mock('@/api/workout-session.api', () => ({
  getWorkoutSession: vi.fn(),
  startWorkoutSession: vi.fn(),
  finishWorkoutSession: vi.fn(),
  updateWorkoutSet: vi.fn(),
}))

const mockSet: WorkoutSetPublic = {
  id: 100,
  workoutExerciseId: 10,
  setNumber: 1,
  reps: 10,
  weight: 60,
  completedAt: '2026-01-01T00:00:00.000Z',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const mockPendingSet: WorkoutSetPublic = {
  ...mockSet,
  id: 101,
  setNumber: 2,
  completedAt: null,
}

const mockSession: WorkoutSessionDetail = {
  id: 1,
  name: 'Push day',
  date: '2026-01-01',
  notes: null,
  status: 'IN_PROGRESS',
  startedAt: '2026-01-01T00:00:00.000Z',
  completedAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  exercises: [
    {
      id: 10,
      workoutId: 1,
      exerciseTypeId: 5,
      sets: 3,
      reps: 10,
      restSeconds: 90,
      weight: 60,
      sortOrder: 0,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      exerciseType: { id: 5, name: 'Press banca', muscleGroup: 'CHEST' },
      workoutSets: [mockSet, mockPendingSet],
    },
  ],
}

describe('workout-session store', () => {
  beforeEach(() => {
    setupTestPinia()
    vi.mocked(workoutSessionApi.getWorkoutSession).mockResolvedValue(mockSession)
    vi.mocked(workoutSessionApi.startWorkoutSession).mockResolvedValue(mockSession)
    vi.mocked(workoutSessionApi.finishWorkoutSession).mockResolvedValue({
      id: 1,
      name: 'Push day',
      status: 'COMPLETED',
      completedAt: '2026-01-01T01:00:00.000Z',
    })
  })

  it('calcula contadores de series cuando no hay sesión', () => {
    const store = useWorkoutSessionStore()

    expect(store.completedSetCount).toBe(0)
    expect(store.totalSetCount).toBe(0)
  })

  it('calcula contadores de series completadas y totales', async () => {
    const store = useWorkoutSessionStore()
    await store.load(1)

    expect(store.completedSetCount).toBe(1)
    expect(store.totalSetCount).toBe(2)
  })

  it('carga una sesión de entrenamiento', async () => {
    const store = useWorkoutSessionStore()

    const session = await store.load(1)

    expect(session).toEqual(mockSession)
    expect(store.session).toEqual(mockSession)
    expect(store.loading).toBe(false)
  })

  it('inicia una sesión de entrenamiento', async () => {
    const store = useWorkoutSessionStore()

    await store.start(1)

    expect(workoutSessionApi.startWorkoutSession).toHaveBeenCalledWith(1)
    expect(store.starting).toBe(false)
  })

  it('finaliza una sesión activa y actualiza el estado local', async () => {
    const store = useWorkoutSessionStore()
    await store.load(1)

    const result = await store.finish(1)

    expect(result.status).toBe('COMPLETED')
    expect(store.session?.status).toBe('COMPLETED')
    expect(store.session?.completedAt).toBe('2026-01-01T01:00:00.000Z')
    expect(store.finishing).toBe(false)
  })

  it('finaliza una sesión distinta sin modificar la sesión cargada', async () => {
    const store = useWorkoutSessionStore()
    await store.load(1)

    await store.finish(99)

    expect(store.session?.status).toBe('IN_PROGRESS')
  })

  it('no resetea updatingSetKey si otra actualización lo sobrescribió', async () => {
    let resolveFirst: ((value: WorkoutSetUpdateResult) => void) | undefined
    const firstPromise = new Promise<WorkoutSetUpdateResult>((resolve) => {
      resolveFirst = resolve
    })
    vi.mocked(workoutSessionApi.updateWorkoutSet)
      .mockReturnValueOnce(firstPromise)
      .mockResolvedValueOnce({
        set: { ...mockPendingSet, setNumber: 2, reps: 15 },
        isPersonalRecord: false,
        previousMaxWeight: null,
      })
    const store = useWorkoutSessionStore()
    await store.load(1)

    const firstUpdate = store.updateSet(1, 10, 1, { reps: 11 })
    await store.updateSet(1, 10, 2, { reps: 15 })

    expect(store.updatingSetKey).toBeNull()

    resolveFirst?.({
      set: { ...mockSet, reps: 11 },
      isPersonalRecord: false,
      previousMaxWeight: null,
    })
    await firstUpdate

    expect(store.updatingSetKey).toBeNull()
  })

  it('actualiza una serie sin modificar ejercicios que no coinciden', async () => {
    const otherExercise = {
      ...mockSession.exercises[0]!,
      id: 99,
      workoutSets: [{ ...mockSet, setNumber: 1 }],
    }
    const sessionWithTwoExercises: WorkoutSessionDetail = {
      ...mockSession,
      exercises: [mockSession.exercises[0]!, otherExercise],
    }
    vi.mocked(workoutSessionApi.getWorkoutSession).mockResolvedValue(sessionWithTwoExercises)
    const updateResult: WorkoutSetUpdateResult = {
      set: { ...mockPendingSet, reps: 12 },
      isPersonalRecord: false,
      previousMaxWeight: null,
    }
    vi.mocked(workoutSessionApi.updateWorkoutSet).mockResolvedValue(updateResult)
    const store = useWorkoutSessionStore()
    await store.load(1)

    await store.updateSet(1, 10, 2, { reps: 12 })

    expect(store.session?.exercises[1]).toEqual(otherExercise)
  })

  it('actualiza una serie en la sesión activa', async () => {
    const updatedSet: WorkoutSetPublic = { ...mockPendingSet, reps: 12, completedAt: '2026-01-01T01:00:00.000Z' }
    const updateResult: WorkoutSetUpdateResult = {
      set: updatedSet,
      isPersonalRecord: false,
      previousMaxWeight: null,
    }
    vi.mocked(workoutSessionApi.updateWorkoutSet).mockResolvedValue(updateResult)
    const store = useWorkoutSessionStore()
    await store.load(1)

    const result = await store.updateSet(1, 10, 2, { reps: 12, completed: true })

    expect(result).toEqual(updateResult)
    expect(store.session?.exercises[0]?.workoutSets[1]).toEqual(updatedSet)
    expect(store.updatingSetKey).toBeNull()
  })

  it('actualiza una serie sin modificar la sesión si el workoutId no coincide', async () => {
    const updateResult: WorkoutSetUpdateResult = {
      set: mockPendingSet,
      isPersonalRecord: false,
      previousMaxWeight: null,
    }
    vi.mocked(workoutSessionApi.updateWorkoutSet).mockResolvedValue(updateResult)
    const store = useWorkoutSessionStore()
    await store.load(1)
    const originalSets = store.session?.exercises[0]?.workoutSets

    await store.updateSet(99, 10, 2, { reps: 12 })

    expect(store.session?.exercises[0]?.workoutSets).toEqual(originalSets)
  })

  it('limpia la sesión activa', async () => {
    const store = useWorkoutSessionStore()
    await store.load(1)

    store.clear()

    expect(store.session).toBeNull()
  })
})
