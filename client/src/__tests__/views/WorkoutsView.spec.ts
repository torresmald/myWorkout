import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { RouteRecordRaw } from 'vue-router'

import { createWorkout, createWorkoutListItem } from '@/__tests__/fixtures/workout.fixture'
import { mountWithPlugins, navigateTo } from '@/__tests__/helpers/mount-test-app'
import * as workoutApi from '@/api/workout.api'
import WorkoutsView from '@/views/WorkoutsView.vue'
import { i18n } from '@/i18n'
import { useModalStore } from '@/stores/modal.store'
import { useToastStore } from '@/stores/toast.store'

vi.mock('@/api/workout.api', () => ({
  getWorkouts: vi.fn(),
  getWorkout: vi.fn(),
  createWorkout: vi.fn(),
  updateWorkout: vi.fn(),
  deleteWorkout: vi.fn(),
}))

const routes: RouteRecordRaw[] = [
  { path: '/workouts', name: 'workouts', component: { template: '<div />' } },
  {
    path: '/workouts/:id/session',
    name: 'workout-session',
    component: { template: '<div />' },
  },
  {
    path: '/workouts/:id',
    name: 'workout-detail',
    component: { template: '<div />' },
  },
]

describe('WorkoutsView', () => {
  beforeEach(() => {
    vi.mocked(workoutApi.getWorkouts).mockResolvedValue([
      createWorkoutListItem({ id: 1, name: 'Push' }),
    ])
    vi.mocked(workoutApi.deleteWorkout).mockResolvedValue(createWorkout({ id: 1 }))
  })

  it('carga y lista entrenamientos', async () => {
    const { router, wrapper } = await mountWithPlugins(WorkoutsView, { routes })
    await navigateTo(router, '/workouts')
    await flushPromises()

    expect(wrapper.text()).toContain('Push')
  })

  it('elimina entrenamiento tras confirmación', async () => {
    const { pinia, router, wrapper } = await mountWithPlugins(WorkoutsView, { routes })
    const modalStore = useModalStore(pinia)
    vi.spyOn(modalStore, 'confirm').mockResolvedValue(true)
    const toastStore = useToastStore(pinia)
    const successSpy = vi.spyOn(toastStore, 'success')

    await navigateTo(router, '/workouts')
    await flushPromises()

    const myWorkouts = wrapper.findComponent({ name: 'MyWorkouts' })
    myWorkouts.vm.$emit('delete', createWorkout({ id: 1, name: 'Push' }))
    await flushPromises()

    expect(workoutApi.deleteWorkout).toHaveBeenCalledWith(1)
    expect(successSpy).toHaveBeenCalledWith(i18n.global.t('workouts.deleteSuccess'))
  })

  it('abre edición desde query edit', async () => {
    const { router, wrapper } = await mountWithPlugins(WorkoutsView, { routes })
    await navigateTo(router, '/workouts?edit=1')
    await flushPromises()

    expect(router.currentRoute.value.name).toBe('workouts')
  })

  it('navega a sesión de entrenamiento', async () => {
    const { router, wrapper } = await mountWithPlugins(WorkoutsView, { routes })
    await navigateTo(router, '/workouts')
    await flushPromises()

    const myWorkouts = wrapper.findComponent({ name: 'MyWorkouts' })
    myWorkouts.vm.$emit('session', createWorkout({ id: 1 }))
    await flushPromises()

    expect(router.currentRoute.value.name).toBe('workout-session')
  })
})
