import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import {
  createTestRouter,
  setupTestPinia,
} from '@/__tests__/helpers/mount-test-app'
import AppLayout from '@/components/layout/AppLayout.vue'
import { i18n } from '@/i18n'

vi.mock('@/composables/useWorkoutReminders', () => ({
  useWorkoutReminders: vi.fn(),
}))

describe('AppLayout', () => {
  it('renderiza cabecera, contenido principal y pie', async () => {
    const pinia = setupTestPinia()
    const router = createTestRouter()

    const wrapper = mount(AppLayout, {
      global: {
        plugins: [pinia, router, i18n],
        stubs: {
          AppHeader: { template: '<header data-testid="app-header" />' },
          AppFooter: { template: '<footer data-testid="app-footer" />' },
          RouterView: { template: '<div data-testid="main-view" />' },
        },
      },
    })

    await router.isReady()

    expect(wrapper.find('.app-shell').exists()).toBe(true)
    expect(wrapper.find('[data-testid="app-header"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="app-footer"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="main-view"]').exists()).toBe(true)
  })

  it('inicializa recordatorios de entrenamiento', async () => {
    const { useWorkoutReminders } = await import('@/composables/useWorkoutReminders')
    const pinia = setupTestPinia()
    const router = createTestRouter()

    mount(AppLayout, {
      global: {
        plugins: [pinia, router, i18n],
        stubs: { AppHeader: true, AppFooter: true, RouterView: true },
      },
    })

    await router.isReady()

    expect(useWorkoutReminders).toHaveBeenCalled()
  })
})
