import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import ThemeToggleFlag from '@/components/ui/ThemeToggleFlag.vue'
import { i18n } from '@/i18n'
import { setupTestPinia } from '@/__tests__/helpers/mount-test-app'
import { useThemeStore } from '@/stores/theme.store'

describe('ThemeToggleFlag', () => {
  it('alterna tema al pulsar el botón', async () => {
    const pinia = setupTestPinia()
    const themeStore = useThemeStore(pinia)
    const toggleSpy = vi.spyOn(themeStore, 'toggleTheme')

    const wrapper = mount(ThemeToggleFlag, {
      global: { plugins: [pinia, i18n] },
    })

    await wrapper.find('button').trigger('click')

    expect(toggleSpy).toHaveBeenCalled()
  })

  it('muestra aria-label para modo claro cuando el tema es oscuro', () => {
    const pinia = setupTestPinia()
    const themeStore = useThemeStore(pinia)
    themeStore.setMode('dark')

    const wrapper = mount(ThemeToggleFlag, {
      global: { plugins: [pinia, i18n] },
    })

    expect(wrapper.find('button').attributes('aria-label')).toBe(
      i18n.global.t('layout.switchToLight'),
    )
    expect(wrapper.find('.theme-toggle__card--dark').exists()).toBe(true)
  })

  it('muestra aria-label para modo oscuro cuando el tema es claro', () => {
    const pinia = setupTestPinia()
    const themeStore = useThemeStore(pinia)
    themeStore.setMode('light')

    const wrapper = mount(ThemeToggleFlag, {
      global: { plugins: [pinia, i18n] },
    })

    expect(wrapper.find('button').attributes('aria-label')).toBe(
      i18n.global.t('layout.switchToDark'),
    )
    expect(wrapper.find('.theme-toggle__card--dark').exists()).toBe(false)
  })
})
