import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import LanguageToggleFlag from '@/components/ui/LanguageToggleFlag.vue'
import { i18n } from '@/i18n'
import { setupTestPinia } from '@/__tests__/helpers/mount-test-app'
import { useLocaleStore } from '@/stores/locale.store'

describe('LanguageToggleFlag', () => {
  it('alterna idioma al pulsar el botón', async () => {
    const pinia = setupTestPinia()
    const localeStore = useLocaleStore(pinia)
    const toggleSpy = vi.spyOn(localeStore, 'toggleLocale')

    const wrapper = mount(LanguageToggleFlag, {
      global: { plugins: [pinia, i18n] },
    })

    await wrapper.find('button').trigger('click')

    expect(toggleSpy).toHaveBeenCalled()
  })

  it('muestra aria-label para cambiar a inglés cuando el locale es es', () => {
    const pinia = setupTestPinia()
    const localeStore = useLocaleStore(pinia)
    localeStore.setLocale('es')

    const wrapper = mount(LanguageToggleFlag, {
      global: { plugins: [pinia, i18n] },
    })

    expect(wrapper.find('button').attributes('aria-label')).toBe(
      i18n.global.t('layout.switchToEnglish'),
    )
    expect(wrapper.find('.language-toggle__card--en').exists()).toBe(false)
  })

  it('muestra aria-label para cambiar a español cuando el locale es en', () => {
    const pinia = setupTestPinia()
    const localeStore = useLocaleStore(pinia)
    localeStore.setLocale('en')

    const wrapper = mount(LanguageToggleFlag, {
      global: { plugins: [pinia, i18n] },
    })

    expect(wrapper.find('button').attributes('aria-label')).toBe(
      i18n.global.t('layout.switchToSpanish'),
    )
    expect(wrapper.find('.language-toggle__card--en').exists()).toBe(true)
  })
})
