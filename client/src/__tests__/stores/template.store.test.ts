import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as templateApi from '@/api/template.api'
import { setupTestPinia } from '@/__tests__/helpers/mount-test-app'
import type {
  TemplateExercisePublic,
  WorkoutTemplatePublic,
} from '@/interfaces/template.interface'
import { useTemplateStore } from '@/stores/template.store'

vi.mock('@/api/template.api', () => ({
  getTemplates: vi.fn(),
  createTemplate: vi.fn(),
  updateTemplate: vi.fn(),
  deleteTemplate: vi.fn(),
  getTemplateExercises: vi.fn(),
  createTemplateExercise: vi.fn(),
  updateTemplateExercise: vi.fn(),
  deleteTemplateExercise: vi.fn(),
}))

const mockTemplate: WorkoutTemplatePublic = {
  id: 1,
  name: 'Push day',
  description: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const mockExercise: TemplateExercisePublic = {
  id: 10,
  templateId: 1,
  exerciseTypeId: 5,
  sets: 3,
  reps: 10,
  restSeconds: 90,
  weight: 60,
  sortOrder: 0,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  exerciseType: { id: 5, name: 'Press banca', muscleGroup: 'CHEST' },
}

describe('template store', () => {
  beforeEach(() => {
    setupTestPinia()
    vi.mocked(templateApi.getTemplates).mockResolvedValue([mockTemplate])
    vi.mocked(templateApi.getTemplateExercises).mockResolvedValue([mockExercise])
    vi.mocked(templateApi.createTemplate).mockResolvedValue(mockTemplate)
    vi.mocked(templateApi.updateTemplate).mockResolvedValue(mockTemplate)
    vi.mocked(templateApi.createTemplateExercise).mockResolvedValue(mockExercise)
    vi.mocked(templateApi.updateTemplateExercise).mockResolvedValue(mockExercise)
  })

  it('carga las plantillas con indicador de carga', async () => {
    const store = useTemplateStore()

    await store.fetchAll()

    expect(store.templates).toEqual([mockTemplate])
    expect(store.loading).toBe(false)
  })

  it('carga las plantillas en modo silencioso', async () => {
    const store = useTemplateStore()

    await store.fetchAll(true)

    expect(store.loading).toBe(false)
  })

  it('crea una plantilla y refresca la lista', async () => {
    const store = useTemplateStore()

    await store.create({ name: 'Push day' })

    expect(templateApi.createTemplate).toHaveBeenCalledWith({ name: 'Push day' })
    expect(store.creating).toBe(false)
  })

  it('actualiza una plantilla', async () => {
    const store = useTemplateStore()

    await store.update(1, { name: 'Pull day' })

    expect(templateApi.updateTemplate).toHaveBeenCalledWith(1, { name: 'Pull day' })
    expect(store.updating).toBe(false)
  })

  it('elimina una plantilla que no es la activa sin limpiar ejercicios', async () => {
    vi.mocked(templateApi.deleteTemplate).mockResolvedValue(mockTemplate)
    const store = useTemplateStore()
    store.templates = [mockTemplate, { ...mockTemplate, id: 2 }]
    store.activeTemplateId = 2
    store.exercises = [mockExercise]

    await store.remove(1)

    expect(store.exercises).toEqual([mockExercise])
    expect(store.activeTemplateId).toBe(2)
  })

  it('elimina una plantilla y limpia ejercicios si era la activa', async () => {
    vi.mocked(templateApi.deleteTemplate).mockResolvedValue(mockTemplate)
    const store = useTemplateStore()
    store.templates = [mockTemplate]
    store.activeTemplateId = 1
    store.exercises = [mockExercise]

    await store.remove(1)

    expect(store.templates).toEqual([])
    expect(store.exercises).toEqual([])
    expect(store.activeTemplateId).toBeNull()
  })

  it('carga los ejercicios de una plantilla', async () => {
    const store = useTemplateStore()

    await store.fetchExercises(1)

    expect(store.activeTemplateId).toBe(1)
    expect(store.exercises).toEqual([mockExercise])
    expect(store.loadingExercises).toBe(false)
  })

  it('carga ejercicios en modo silencioso', async () => {
    const store = useTemplateStore()

    await store.fetchExercises(1, true)

    expect(store.loadingExercises).toBe(false)
  })

  it('limpia los ejercicios activos', () => {
    const store = useTemplateStore()
    store.exercises = [mockExercise]
    store.activeTemplateId = 1

    store.clearExercises()

    expect(store.exercises).toEqual([])
    expect(store.activeTemplateId).toBeNull()
  })

  it('hidrata ejercicios con items proporcionados', () => {
    const store = useTemplateStore()

    store.hydrateExercises(1, [mockExercise])

    expect(store.activeTemplateId).toBe(1)
    expect(store.exercises).toEqual([mockExercise])
  })

  it('hidrata ejercicios sin sobrescribir la lista si no hay items', () => {
    const store = useTemplateStore()
    store.exercises = [mockExercise]

    store.hydrateExercises(1)

    expect(store.activeTemplateId).toBe(1)
    expect(store.exercises).toEqual([mockExercise])
  })

  it('crea un ejercicio de plantilla', async () => {
    const store = useTemplateStore()
    const body = { exerciseTypeId: 5, sets: 3, reps: 10 }

    await store.createExercise(1, body)

    expect(templateApi.createTemplateExercise).toHaveBeenCalledWith(1, body)
    expect(store.creatingExercise).toBe(false)
  })

  it('actualiza un ejercicio de plantilla', async () => {
    const store = useTemplateStore()
    const body = { reps: 12 }

    await store.updateExercise(1, 10, body)

    expect(templateApi.updateTemplateExercise).toHaveBeenCalledWith(1, 10, body)
    expect(store.updatingExerciseId).toBeNull()
  })

  it('elimina un ejercicio de plantilla', async () => {
    vi.mocked(templateApi.deleteTemplateExercise).mockResolvedValue(mockExercise)
    const store = useTemplateStore()
    store.exercises = [mockExercise, { ...mockExercise, id: 11 }]

    await store.removeExercise(1, 10)

    expect(store.exercises).toEqual([{ ...mockExercise, id: 11 }])
    expect(store.deletingExerciseId).toBeNull()
  })
})
