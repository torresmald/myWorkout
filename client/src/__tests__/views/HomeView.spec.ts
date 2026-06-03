import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createWorkout } from '@/__tests__/fixtures/workout.fixture'
import { createUserPublic } from '@/__tests__/fixtures/profile.fixture'
import { mountWithPlugins, setupTestPinia } from '@/__tests__/helpers/mount-test-app'
import * as workoutApi from '@/api/workout.api'
import HomeView from '@/views/HomeView.vue'
import { i18n } from '@/i18n'
import { useAuthStore } from '@/stores/auth.store'
import { useToastStore } from '@/stores/toast.store'

vi.mock('@/api/workout.api', () => ({
  getWorkouts: vi.fn(),
  getWorkout: vi.fn(),
  createWorkout: vi.fn(),
  updateWorkout: vi.fn(),
  deleteWorkout: vi.fn(),
}))

describe('HomeView', () => {
  beforeEach(() => {
    vi.mocked(workoutApi.getWorkouts).mockResolvedValue([createWorkout()])
  })

  it('muestra saludo y enlaces rápidos', async () => {
    const { pinia, wrapper } = await mountWithPlugins(HomeView)
    const authStore = useAuthStore(pinia)
    authStore.setUser(createUserPublic({ name: 'Ana' }))

    await flushPromises()

    expect(wrapper.text()).toContain(i18n.global.t('home.greeting', { name: 'Ana' }))
    expect(wrapper.text()).toContain(i18n.global.t('home.subtitle'))
    expect(wrapper.findAll('a').length).toBeGreaterThan(0)
  })

  it('muestra error si falla la carga de entrenamientos', async () => {
    vi.mocked(workoutApi.getWorkouts).mockRejectedValue(new Error('fail'))

    const pinia = setupTestPinia()
    const toastStore = useToastStore(pinia)
    const errorSpy = vi.spyOn(toastStore, 'error')

    await mountWithPlugins(HomeView, { pinia })
    await flushPromises()

    expect(errorSpy).toHaveBeenCalled()
  })
})
