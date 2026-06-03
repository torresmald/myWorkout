import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createTemplate } from '@/__tests__/fixtures/template.fixture'
import { mountWithPlugins } from '@/__tests__/helpers/mount-test-app'
import * as templateApi from '@/api/template.api'
import * as workoutApi from '@/api/workout.api'
import TemplatesView from '@/views/TemplatesView.vue'
import { i18n } from '@/i18n'
import { useModalStore } from '@/stores/modal.store'
import { useToastStore } from '@/stores/toast.store'

vi.mock('@/api/template.api', () => ({
  getTemplates: vi.fn(),
  getTemplate: vi.fn(),
  createTemplate: vi.fn(),
  updateTemplate: vi.fn(),
  deleteTemplate: vi.fn(),
}))

vi.mock('@/api/workout.api', () => ({
  getWorkouts: vi.fn(),
  getWorkout: vi.fn(),
  createWorkout: vi.fn(),
  updateWorkout: vi.fn(),
  deleteWorkout: vi.fn(),
}))

describe('TemplatesView', () => {
  beforeEach(() => {
    vi.mocked(templateApi.getTemplates).mockResolvedValue([
      createTemplate({ id: 1, name: 'Push template' }),
    ])
    vi.mocked(templateApi.deleteTemplate).mockResolvedValue(undefined)
  })

  it('lista plantillas', async () => {
    const { wrapper } = await mountWithPlugins(TemplatesView)
    await flushPromises()

    expect(wrapper.text()).toContain('Push template')
  })

  it('elimina plantilla tras confirmación', async () => {
    const { pinia, wrapper } = await mountWithPlugins(TemplatesView)
    const modalStore = useModalStore(pinia)
    vi.spyOn(modalStore, 'confirm').mockResolvedValue(true)
    const toastStore = useToastStore(pinia)
    const successSpy = vi.spyOn(toastStore, 'success')

    await flushPromises()

    const myTemplates = wrapper.findComponent({ name: 'MyTemplates' })
    myTemplates.vm.$emit('delete', createTemplate({ id: 1, name: 'Push template' }))
    await flushPromises()

    expect(templateApi.deleteTemplate).toHaveBeenCalledWith(1)
    expect(successSpy).toHaveBeenCalledWith(i18n.global.t('templates.deleteSuccess'))
  })

  it('inicia entrenamiento desde plantilla', async () => {
    vi.mocked(templateApi.getTemplate).mockResolvedValue({
      ...createTemplate({ id: 1 }),
      exercises: [
        {
          id: 1,
          templateId: 1,
          exerciseTypeId: 5,
          sets: 3,
          reps: 10,
          restSeconds: 90,
          weight: 80,
          sortOrder: 0,
          exerciseType: { id: 5, name: 'Press', muscleGroup: 'CHEST' },
        },
      ],
    })
    vi.mocked(workoutApi.createWorkout).mockResolvedValue({
      id: 99,
      name: 'Push template',
      date: '2026-01-15',
      notes: null,
      status: 'PLANNED',
      startedAt: null,
      completedAt: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })

    const { router, wrapper } = await mountWithPlugins(TemplatesView, {
      routes: [
        { path: '/templates', name: 'templates', component: { template: '<div />' } },
        {
          path: '/workouts/:id/session',
          name: 'workout-session',
          component: { template: '<div />' },
        },
      ],
    })

    await flushPromises()

    const myTemplates = wrapper.findComponent({ name: 'MyTemplates' })
    myTemplates.vm.$emit('start', createTemplate({ id: 1 }))
    await flushPromises()

    expect(workoutApi.createWorkout).toHaveBeenCalled()
    expect(router.currentRoute.value.name).toBe('workout-session')
  })
})
